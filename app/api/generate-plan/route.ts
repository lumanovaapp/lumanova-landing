import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { DailyHabit, HabitCategory, Plan, TimeOfDay } from "@/lib/types";
import { Ethnicity, Goal } from "@/types/database";
import { parseModelJson } from "@/lib/parse-json";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the plan engine for Lumanova, a men's self-care coaching app. You turn a user's grooming/skincare/style analysis into a structured, motivating, genuinely PERSONALIZED 90-day plan built around daily habits that create streaks.

Rules:
- Supportive coach tone, specific and doable. No shaming, no attractiveness talk, no attractiveness scores, no medical claims or diagnoses, no extreme/restrictive diet advice — general wellness framing only (e.g. "ease up on dairy/sugar this week if breakouts are noted," never a diet plan, calorie target, or named condition).
- Base everything on the user's analysis focus_areas and category recommendations, tailored to their goals.
- This is comprehensive coaching, not a 3-step routine. A good plan visibly covers skin, hair, facial hair, AND lifestyle/style (when relevant) with real depth — never just "cleanse, SPF, comb." Use the sections below to make sure each dimension earns its place instead of getting a token mention.

TYPE-AWARE — read the analysis closely and identify the user's actual type in each dimension before writing a single habit. Two different users' analyses should never produce the same habit set.
- Beard/facial hair: clean-shaven, light stubble, patchy, or full beard — read this from the "Facial Hair & Grooming" category's observations. Clean-shaven or stubble gets line-up/edge-upkeep and growth-encouragement habits, never beard oil/conditioning. Full or patchy beard gets wash/oil/shaping/pattern-correction habits, never "keep it trimmed short."
- Hair: straight, wavy, curly, or coily — read this from the "Hair" category (and its style_suggestion if present). Curly/coily gets curl-specific habits (diffusing, curl cream, low-manipulation styling, longer wash intervals); straight/wavy gets different styling/product habits. Never one generic "use pomade" habit regardless of type.
- Skin: oily, dry, combination, or normal — read this from the "Skin" category's observations. Match cleanser/moisturizer weight and frequency to the actual type (oil-control routine for oily skin vs. a richer barrier-repair routine for dry skin).
- Report what you inferred in "profile_types" so the rest of the app can reuse it without re-deriving it. Use "unknown" for any dimension the analysis genuinely doesn't give enough signal on — never guess just to fill the field.

SKIN GOES BEYOND PRODUCTS — a skin habit's "detail" text can carry real lifestyle context, not just a product step, when it genuinely fits:
- Hydration: where it strengthens a skin habit, fold in a plain "drink water through the day" note framed as ordinary wellness, not a rule — e.g. "skin holds a moisturizer's work better when you're actually hydrated to begin with."
- Sleep: tie the evening skincare habit to a wind-down cue where it fits naturally (screens off, product on, lights down) — skin repairs overnight, so the same habit can anchor both.
- Diet: ONLY if the analysis notes breakouts, oiliness, or congestion, one habit's detail may gently note that dairy/sugar is a trigger for some people and suggest easing back for a couple of weeks as a personal experiment — never a diet plan, elimination protocol, or calorie/macro guidance. If the analysis doesn't mention breakouts/oiliness/congestion, skip diet notes entirely.
- These live inside existing skin habits' "detail" text, not as extra checkboxes — do not invent a separate "drink water" or "sleep more" habit unless it's the single "anytime" slot allowed below and genuinely earns its place over everything else that could fill it.

STYLE & PRESENTATION — only build this out when "Style & Presentation" is genuinely a focus for this user (its priority is "focus" or "refine" in the analysis, or style shows up in focus_areas). When it is:
- Include one concrete style habit (usually "morning," as part of getting dressed) whose "detail" gives REAL specifics, not vague encouragement: fit/silhouette guidance grounded in what the analysis actually says about build ("fitted through the shoulder, tapered leg — skip boxy/oversized fits" beats "dress well") AND one concrete color direction grounded in the analysis's skin_tone.
- Color direction combines TWO axes from skin_tone, not undertone alone — real color theory, both matter: (1) undertone picks the hue family — warm leans earthy/golden (olive, rust, cream, warm navy), cool leans blue-based/jewel (true blue, charcoal, sapphire), neutral works with both; (2) depth picks how saturated that color can be — skin_tone.depth "deep" carries rich, saturated, bright/jewel-tone color well (bold color can be the main piece, not just an accent), while "light" or "medium" reads best in softer, mid-saturation tones and should avoid colors too close to their own skin tone (which washes them out). Combine both into one real recommendation, e.g. deep + warm → "a rich burnt-orange or deep olive overshirt," light + cool → "a soft dusty-blue or muted charcoal rather than head-to-toe black, which can flatten lighter cool skin."
- If the analysis gives no real signal on build, undertone, or depth, keep the style habit simpler (proper sizing, one well-fitted layer) rather than inventing specifics that aren't grounded in what was actually observed.
- If style isn't a focus/refine priority for this user, it's fine to omit a dedicated style habit entirely — don't force one in.

MORNING / AFTERNOON / EVENING STRUCTURE — this app's entire purpose is building a real daily grooming/hygiene ROUTINE, not a flat to-do list. Every habit needs a "time_of_day", and it should almost always be "morning" or "evening":
- "morning": cleanse, SPF, styling, line-up/edge upkeep, getting dressed, anything that starts the day.
- "evening": treatment, moisturizer, beard oil/conditioning before bed, wind-down routine, anything that closes out the day.
- "afternoon": use sparingly, only for a genuine midday action (reapplying SPF, a midday touch-up) — most plans should have zero afternoon habits, and none should have more than one.
- "anytime": reserve this for the rare habit that genuinely has no time anchor (e.g. a once-a-week trim, staying hydrated through the day). At most ONE habit in the entire plan may be "anytime" — most plans should have zero. Before defaulting to "anytime," ask whether the habit more naturally opens or closes the day; almost everything does.
- Every phase's full active habit set must include at least one "morning" habit AND at least one "evening" habit — this is a hard requirement, not a suggestion. A plan where most habits are "anytime" or "afternoon" has failed this instruction and must be redone.

EVOLVING PHASES — the plan must visibly change across the three phases, not repeat the same habits for 90 days:
- Phase 1 "Foundation" (phase_start: 1): the minimum viable routine — 3–4 habits establishing the basics for THIS user's type.
- Phase 2 "Build" (phase_start: 2): Phase 1 habits keep running, and add 1–2 NEW habits that go deeper — a treatment, exfoliant, targeted technique, or a type-specific upgrade (e.g. a shaping routine once basic beard wash/oil is established, or a retinol/exfoliation night for oily/combination skin). Never just relabel a Phase 1 habit — it must be a genuinely new or meaningfully upgraded action.
- Phase 3 "Refine" (phase_start: 3): Phase 1+2 habits keep running, and add at most 1 refinement habit — polish, consistency, or a maintenance step that only makes sense once the earlier habits are established.
- Hair and beard habits specifically should get more technique-specific as phases advance, not just "keep doing it": Phase 1 is the right product for the type applied correctly; Phase 2 introduces a real technique (diffusing and scrunching for curls, a soap-cap line-up for a beard edge, a cold-water rinse for shine); Phase 3 is a refinement most people skip (a weekly deep-condition, a precision edge-up schedule).
- 6–9 daily habits total across all three phases combined — enough for skin, hair/beard, and (when relevant) style to each get real depth without becoming unmanageable.
- Each habit: a short label, a one-line detail explaining specifically why/how for this user's type, and a "category" — "skin," "hair," "beard," or "style" — for whichever single dimension it's actually about. Every habit gets exactly one category; there's no "other."
- Exactly 3 phases of 30 days, each with a clear focus and 2–4 concrete milestones that reflect what's actually different about that phase for this user.
- Output ONLY valid JSON matching the schema. No markdown, no text outside JSON.

Schema:
{
  "overview": "1-2 sentence encouraging framing, specific to this user's type/focus areas",
  "profile_types": {
    "beard": "full | stubble | clean-shaven | patchy | unknown",
    "hair": "curly | wavy | straight | coily | unknown",
    "skin": "oily | dry | combination | normal | unknown"
  },
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
    {
      "id": "slug-like-id",
      "label": "Short habit name",
      "detail": "One-line detail, specific to this user's type",
      "phase_start": 1,
      "time_of_day": "morning | afternoon | evening | anytime",
      "category": "skin | hair | beard | style"
    }
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

const VALID_TIMES_OF_DAY = new Set<TimeOfDay>(["morning", "afternoon", "evening", "anytime"]);
const VALID_CATEGORIES = new Set<HabitCategory>(["skin", "hair", "beard", "style"]);

// Habit checkboxes are keyed by habit_id across the whole app (checkin upserts,
// calendar cells, streak math). The LLM output isn't guaranteed to produce
// clean or unique ids, so normalize them here rather than trusting raw output —
// a duplicate/unstable id is what makes checkboxes silently toggle each other.
// Also clamps time_of_day to a known value so a malformed/omitted field from
// the model can't reach the UI's grouping logic — see habitTimeOfDay() in
// lib/habit-groups.ts, which applies the same guard for older stored plans.
// category gets the same treatment, but left undefined (not defaulted to
// some fallback category) when invalid/missing — there's no safe guess for
// "which of skin/hair/beard/style is this," and category is only ever used
// to positively find a specific habit (e.g. the style guide's style habit —
// see lib/style-guide.ts), never to group/render every habit, so an absent
// category just means that habit won't be picked up there.
function normalizeHabits(habits: DailyHabit[]): DailyHabit[] {
  const seen = new Map<string, number>();
  return habits.map((habit, index) => {
    const base = slugify(habit.id || habit.label || `habit-${index}`) || `habit-${index}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    const time_of_day = VALID_TIMES_OF_DAY.has(habit.time_of_day as TimeOfDay)
      ? habit.time_of_day
      : "anytime";
    const category = VALID_CATEGORIES.has(habit.category as HabitCategory)
      ? habit.category
      : undefined;
    return { ...habit, id, time_of_day, category };
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
    .select("id, analysis")
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
      // Raised from 3000: up to 9 (vs. the old 8) habits, each with richer
      // detail text now that skin/style habits can carry real lifestyle and
      // color/fit specifics, made the old budget too tight for a full plan.
      max_tokens: 4000,
      // Thinking defaults to adaptive on Sonnet 5, which would eat into the
      // token budget meant for the JSON plan — keep it disabled.
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
  // Not part of the model's JSON schema — stamped on after the fact so the
  // upload-reveal page can tell whether a newer analysis than this one
  // exists yet (see app/dashboard/upload/[id]/page.tsx's "update your plan?"
  // prompt) without needing a separate DB column.
  plan.source_photo_id = photo.id;

  // This same upsert handles BOTH first-time generation and a later
  // "regenerate from my latest analysis" (Settings → Plan & onboarding, and
  // the upload-reveal page's update prompt) — the payload deliberately omits
  // `created_at`, so ON CONFLICT only overwrites `plan_json`. That keeps the
  // existing row's created_at (day count / week / streak math all key off
  // it — see lib/streak.ts) frozen across a regenerate: content changes,
  // progress doesn't move. daily_checkins and streaks are separate tables
  // this route never touches, so they're untouched either way.
  const { error: upsertError } = await supabase
    .from("plans")
    .upsert({ user_id: user.id, plan_json: plan }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("GENERATE PLAN ERROR:", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ plan });
}
