import Anthropic from "@anthropic-ai/sdk";
import type { createClient } from "@/utils/supabase/server";
import { buildContextBlock, computePlanDay } from "@/lib/coach-context";

type SupabaseServerClient = ReturnType<typeof createClient>;

const SYSTEM_PROMPT = `You write ONE short daily line for the top of a user's habit tracker inside Lumanova, a grooming/self-care coaching app for men. This is not a chat reply — it's a single proactive nudge they see once when they open the app today.
Rules:
- Exactly one to two short sentences. Plain text only — no greeting, no sign-off, no markdown, no emoji.
- Reference something concrete from their context below: their current plan day/phase focus, their streak, or a specific analysis finding. Be specific, not generic.
- Warm, direct, motivating coach tone — never preachy or salesy.
- Match this tone and length exactly: "Day 8 — your cleansing's been consistent. Today, focus on getting SPF on before you leave. Small habit, big payoff."
Here is the user's context:
`;

const MAX_TOKENS = 100;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Returns today's cached coach line for this user, generating and storing it
// exactly once per (user_id, date) — every call after the first one today is
// a single cheap read, never another model call. Returns null if the user
// has no active plan yet (nothing personalized to say), or if anything about
// generation fails (a missing line should never break a page load).
export async function getOrCreateDailyCoachLine(
  supabase: SupabaseServerClient,
  userId: string
): Promise<string | null> {
  const date = todayStr();

  const { data: existing, error: readError } = await supabase
    .from("daily_coach_lines")
    .select("content")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (readError) {
    console.error("DAILY COACH LINE ERROR (read):", readError);
    return null;
  }

  if (existing) return existing.content;

  try {
    const [{ data: photo }, { data: planRow }, { data: streakRow }] = await Promise.all([
      supabase
        .from("photos")
        .select("analysis")
        .eq("user_id", userId)
        .not("analysis", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("plans")
        .select("plan_json, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    // No active plan yet — there's no phase/focus to ground a line in, and
    // Today's Habits isn't showing anything meaningful to caption anyway.
    if (!planRow) return null;

    const day = computePlanDay(planRow.created_at);
    const contextBlock = buildContextBlock(
      photo?.analysis ?? null,
      planRow.plan_json,
      planRow.created_at,
      streakRow ?? null
    );

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: MAX_TOKENS,
      // Same reasoning as /api/coach: adaptive thinking would eat the small
      // token budget meant for the line itself.
      thinking: { type: "disabled" },
      system: SYSTEM_PROMPT + contextBlock,
      messages: [
        {
          role: "user" as const,
          content: `Write today's line. It's day ${day} of their plan.`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const content =
      (textBlock && textBlock.type === "text" ? textBlock.text : "").trim();

    if (!content) return null;

    const { error: insertError } = await supabase
      .from("daily_coach_lines")
      .insert({ user_id: userId, date, content });

    if (insertError) {
      // 23505 = unique_violation — another request for this same user+date
      // generated and inserted first between our read and this insert. That
      // one's content is just as valid as ours; use it instead of erroring.
      if (insertError.code === "23505") {
        const { data: raceWinner } = await supabase
          .from("daily_coach_lines")
          .select("content")
          .eq("user_id", userId)
          .eq("date", date)
          .maybeSingle();
        return raceWinner?.content ?? content;
      }
      console.error("DAILY COACH LINE ERROR (insert):", insertError);
      // Still return the freshly generated line even though it couldn't be
      // cached — the user still gets today's nudge, it'll just regenerate
      // (and hopefully succeed at saving) on their next page load.
      return content;
    }

    return content;
  } catch (err) {
    console.error("DAILY COACH LINE ERROR (generate):", err);
    return null;
  }
}
