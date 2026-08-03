import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { DailyHabit, Plan } from "@/lib/types";
import { Ethnicity, Goal } from "@/types/database";
import { parseModelJson } from "@/lib/parse-json";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the plan engine for Lumanova, a men's self-care coaching app. You turn a user's grooming/skincare/style analysis into a structured, motivating 90-day plan built around daily habits that create streaks.

Rules:
- Supportive coach tone, specific and doable. No shaming, no attractiveness talk, no medical claims.
- Base everything on the user's analysis focus_areas and category recommendations, tailored to their goals.
- Exactly 3 phases of 30 days: Phase 1 Foundation (establish basics), Phase 2 Build (add depth), Phase 3 Refine (polish + consistency). Each phase: a clear focus and 2–4 concrete milestones.
- 4–6 daily habits total — small, checkable, repeatable (these drive the streak). Introduce some in later phases via phase_start, but keep the total set tight. Each habit: a short label and a one-line detail.
- Output ONLY valid JSON matching the schema. No markdown, no text outside JSON.

Schema:
{
  "overview": "1-2 sentence encouraging framing",
  "phases": [
    {
      "number": 1,
      "title": "Foundation",
      "day_range": "Days 1–30",
      "focus": "...",
      "milestones": ["...", "..."]
    },
    {
      "number": 2,
      "title": "Build",
      "day_range": "Days 31–60",
      "focus": "...",
      "milestones": ["...", "..."]
    },
    {
      "number": 3,
      "title": "Refine",
      "day_range": "Days 61–90",
      "focus": "...",
      "milestones": ["...", "..."]
    }
  ],
  "daily_habits": [
    { "id": "slug-like-id", "label": "Short habit name", "detail": "One-line detail", "phase_start": 1 }
  ]
}`;

const ETHNICITY_LABELS: Record<Ethnicity, string> = {
  south_asian: "South Asian",
  east_asian: "East Asian",
  latino: "Latino",
  african: "African",
  middle_eastern: "Middle Eastern",
  southeast_asian: "Southeast Asian",
  mixed: "Mixed / Other",
  other: "Mixed / Other",
};

const GOAL_LABELS: Record<Goal, string> = {
  skincare: "Skincare",
  grooming: "Grooming",
  fitness: "Fitness",
  confidence: "Confidence",
  sleep: "Sleep",
  style: "Style",
};

function buildProfileContext(
  age: number | null | undefined,
  ethnicity: Ethnicity | null | undefined,
  goals: Goal[] | null | undefined
): string {
  const lines = [
    `Age: ${age ?? "not provided"}`,
    `Background: ${ethnicity ? ETHNICITY_LABELS[ethnicity] : "not provided"}`,
    `Goals: ${goals && goals.length > 0 ? goals.map((g) => GOAL_LABELS[g]).join(", ") : "not provided"}`,
  ];
  return `User profile:\n${lines.join("\n")}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Habit checkboxes are keyed by habit_id across the whole app (checkin upserts,
// calendar cells, streak math). The LLM output isn't guaranteed to produce
// clean or unique ids, so normalize them here rather than trusting raw output —
// a duplicate/unstable id is what makes checkboxes silently toggle each other.
function normalizeHabits(habits: DailyHabit[]): DailyHabit[] {
  const seen = new Map<string, number>();
  return habits.map((habit, index) => {
    const base = slugify(habit.id || habit.label || `habit-${index}`) || `habit-${index}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    return { ...habit, id };
  });
}

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("analysis")
    .eq("user_id", user.id)
    .not("analysis", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (photoError) {
    console.error("GENERATE PLAN ERROR:", photoError);
    return NextResponse.json({ error: photoError.message }, { status: 500 });
  }

  if (!photo || !photo.analysis) {
    return NextResponse.json(
      { error: "Run a photo analysis first before generating a plan." },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("age, ethnicity, goals")
    .eq("id", user.id)
    .single();

  const profileContext = buildProfileContext(
    profile?.age,
    profile?.ethnicity,
    profile?.goals
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      // Thinking defaults to adaptive on Sonnet 5, which would eat into the
      // 2000-token budget meant for the JSON plan — keep it disabled.
      thinking: { type: "disabled" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${profileContext}\n\nAnalysis:\n${JSON.stringify(
            photo.analysis
          )}\n\nGenerate the plan as JSON only.`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";
  } catch (err) {
    console.error("GENERATE PLAN ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  let plan: Plan;
  try {
    plan = parseModelJson<Plan>(rawText);
  } catch (err) {
    console.error("GENERATE PLAN ERROR:", err, "raw response:", rawText);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  plan.daily_habits = normalizeHabits(plan.daily_habits);

  const { error: upsertError } = await supabase
    .from("plans")
    .upsert({ user_id: user.id, plan_json: plan }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("GENERATE PLAN ERROR:", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ plan });
}
