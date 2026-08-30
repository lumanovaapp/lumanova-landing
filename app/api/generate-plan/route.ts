import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { DailyHabit, HabitCategory, HabitDifficulty, Plan, TimeOfDay } from "@/lib/types";
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
- Each habit is a STRUCTURED object, not just a label + blurb. Fill every field that genuinely applies:
  - "label": short habit name (e.g. "Cold water face rinse").
  - "detail": ONE line summarising the habit — this is the compact fallback shown in dense views, so it must stand alone.
  - "steps": 1–4 short imperative lines for what to actually do, in order (e.g. ["Fill a bowl with cold water + a few ice cubes", "Hold your face in it for 10–15 seconds", "Repeat 2–3 times, pat dry"]). No numbering in the strings themselves.
  - "why_it_works": ONE plain sentence on the benefit ("Cold constricts blood vessels, so puffiness and redness settle and skin looks more awake."). No hype, no fake precision.
  - "time_minutes": rough integer minutes (1–20 for most habits).
  - "difficulty": "easy" | "moderate" | "advanced" — how much effort/skill it takes, not how important it is.
  - "natural_option": { "text": "..." } — the FREE / kitchen-first way to do it, something the user most likely already owns ("A bowl + ice from the freezer"). Include this for any skincare/grooming/haircare habit. Omit only when there is genuinely nothing to "use" (e.g. "Go for a 20-minute walk").
  - "product_option": { "category": "...", "budget": "~$8" } — an OPTIONAL shop-bought upgrade named ONLY as a product category, never a brand ("A gel eye-mask" / "An ice roller"). "budget" is a rough price hint. Omit the whole object when there's no meaningful product version.
  - "category": "skin" | "hair" | "beard" | "style" — the single dimension this habit is about. Every habit gets exactly one; there's no "other".
- Kitchen-first, always: "natural_option" comes first and is the real recommendation; "product_option" is a take-it-or-leave-it convenience. Never imply the user must buy anything.
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
      "detail": "One-line summary that stands alone, specific to this user's type",
      "steps": ["What to do, step 1", "Step 2", "Step 3"],
      "why_it_works": "One plain sentence on the benefit.",
      "time_minutes": 5,
      "difficulty": "easy | moderate | advanced",
      "natural_option": { "text": "Free / kitchen-first way to do it" },
      "product_option": { "category": "Product category, no brands", "budget": "~$8" },
      "phase_start": 1,
      "time_of_day": "morning | afternoon | evening | anytime",
      "category": "skin | hair | beard | style"
    }
  ]
}

"steps", "why_it_works", "time_minutes", "difficulty", "natural_option" and
"product_option" are all OPTIONAL per habit — include them whenever they add
real value (they almost always do), but a habit with just label/detail/
phase_start/time_of_day/category is still valid. "detail" is never optional.`;

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
const VALID_DIFFICULTIES = new Set<HabitDifficulty>(["easy", "moderate", "advanced"]);

// The model's optional structured fields arrive as untrusted JSON — coerce
// each into the exact shape lib/types.ts promises, or drop it. A dropped
// field just means HabitCard falls back to the plain `detail` line for that
// slice, exactly like an older stored plan.
function cleanString(value: unknown, max = 300): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

// Returns EVERY structured key explicitly (undefined when the model's value
// was missing/malformed) so the caller can spread this straight over the raw
// habit and be sure a bad raw value never survives underneath. undefined
// keys drop out when the plan is JSON-serialised for storage.
function normalizeStructuredHabitFields(habit: DailyHabit) {
  const steps = Array.isArray(habit.steps)
    ? habit.steps
        .map((s) => cleanString(s))
        .filter((s): s is string => !!s)
        .slice(0, 6)
    : [];

  const minutes =
    typeof habit.time_minutes === "number" && Number.isFinite(habit.time_minutes)
      ? Math.max(1, Math.min(180, Math.round(habit.time_minutes)))
      : undefined;

  const naturalText = cleanString(habit.natural_option?.text);
  const productCategory = cleanString(habit.product_option?.category);
  const productBudget = cleanString(habit.product_option?.budget, 40);

  return {
    steps: steps.length > 0 ? steps : undefined,
    why_it_works: cleanString(habit.why_it_works),
    time_minutes: minutes,
    difficulty: VALID_DIFFICULTIES.has(habit.difficulty as HabitDifficulty)
      ? habit.difficulty
      : undefined,
    natural_option: naturalText ? { text: naturalText } : undefined,
    product_option: productCategory
      ? productBudget
        ? { category: productCategory, budget: productBudget }
        : { category: productCategory }
      : undefined,
  };
}

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
    return {
      ...habit,
      id,
      time_of_day,
      category,
      // Spread last: overwrites each raw structured field with its
      // sanitized value, or with undefined when the model's value didn't
      // hold up — so a malformed steps/natural_option/etc. can't survive.
      ...normalizeStructuredHabitFields(habit),
    };
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
      // Raised again (4000 -> 8000): each habit is now a structured object
      // with steps[], why_it_works, a natural option and an optional product
      // option, so a full plan's JSON is roughly twice the size it was when
      // habits carried a single `detail` string.
      max_tokens: 8000,
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
