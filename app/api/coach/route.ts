import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { Analysis, Plan } from "@/lib/types";
import { phaseForDay } from "@/lib/streak";
import { ACCENT_LABELS } from "@/lib/accent";

export const runtime = "nodejs";

const HISTORY_LIMIT = 12;

const SYSTEM_PROMPT_HEADER = `You are the personal grooming and self-care coach inside Lumanova, an app for men. You give specific, encouraging, practical advice on skincare, hair, facial hair/grooming, and style, tailored to THIS user's analysis and plan.
Rules:
- Warm, direct, motivating coach tone. Concise — a few sentences, not essays. No emojis unless natural.
- Ground answers in the user's context below (their analysis findings, current plan phase, streak). Reference it when relevant ("since your analysis flagged T-zone oil...").
- Recommend specific, accessible products/techniques by type (e.g. "a salicylic acid cleanser") not by brand unless asked.
- Never diagnose medical conditions or prescribe medication; for anything clinical, suggest seeing a dermatologist. No shaming, no attractiveness ratings.
- If asked something outside grooming/self-care/style, gently steer back.
Here is the user's context:
`;

const GROUNDING_REMINDER =
  "Always ground your answer in the USER CONTEXT above and reference specific findings from it when relevant.";

function computePlanDay(createdAt: string): number {
  const start = new Date(createdAt);
  const startUTC = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const now = new Date();
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = Math.floor((nowUTC - startUTC) / 86400000) + 1;
  return Math.min(90, Math.max(1, day));
}

function buildContextBlock(
  analysis: Analysis | null,
  plan: Plan | null,
  planCreatedAt: string | null,
  streak: { current_streak: number; longest_streak: number } | null
): string {
  const lines: string[] = ["USER CONTEXT:"];

  if (!analysis) {
    lines.push(
      "Analysis: none yet — the user hasn't run a photo scan, so there are no personalized findings. Nudge them to run one before giving specific product/technique recommendations."
    );
  } else {
    lines.push(`Analysis summary: ${analysis.summary}`);
    if (analysis.focus_areas.length > 0) {
      lines.push(`Focus areas: ${analysis.focus_areas.join(", ")}`);
    }
    if (analysis.categories.length > 0) {
      const categoryLines = analysis.categories
        .map((c) => {
          const topRecommendation = c.recommendations[0];
          const styleNote = c.style_suggestion
            ? ` [suggested style: ${c.style_suggestion}]`
            : "";
          return `${c.name} (${ACCENT_LABELS[c.priority]})${
            topRecommendation ? ` — ${topRecommendation}` : ""
          }${styleNote}`;
        })
        .join("; ");
      lines.push(`Key findings: ${categoryLines}`);
    }
  }

  if (plan && planCreatedAt) {
    const day = computePlanDay(planCreatedAt);
    const phaseNumber = phaseForDay(day);
    const phase = plan.phases.find((p) => p.number === phaseNumber);
    lines.push(
      `Current plan phase: Phase ${phaseNumber}${
        phase ? ` ${phase.title}` : ""
      } (Day ${day}/90)${phase ? `, focus: ${phase.focus}` : ""}.`
    );
  } else {
    lines.push(
      "Current plan phase: no active 90-day plan yet — nudge them to generate one from their analysis."
    );
  }

  const current = streak?.current_streak ?? 0;
  const best = streak?.longest_streak ?? 0;
  lines.push(`Streak: ${current} days (best ${best}).`);

  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "user", content: message })
      .select("id")
      .single();

    if (insertError) {
      console.error("COACH ERROR:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const [{ data: photo }, { data: planRow }, { data: streakRow }, { data: historyRows }] =
      await Promise.all([
        supabase
          .from("photos")
          .select("analysis")
          .eq("user_id", user.id)
          .not("analysis", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("plans")
          .select("plan_json, created_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", user.id)
          .maybeSingle(),
        // Excludes the message we just inserted (by id, not content — a
        // content match could false-positive on a repeated question) so it's
        // never sent to the model twice: once here, once as the explicit
        // final message below.
        supabase
          .from("chat_messages")
          .select("role, content")
          .eq("user_id", user.id)
          .neq("id", inserted.id)
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT),
      ]);

    const contextBlock = buildContextBlock(
      photo?.analysis ?? null,
      planRow?.plan_json ?? null,
      planRow?.created_at ?? null,
      streakRow ?? null
    );

    const history = (historyRows ?? []).slice().reverse();

    const systemPrompt =
      SYSTEM_PROMPT_HEADER + contextBlock + "\n\n" + GROUNDING_REMINDER;

    // Verifies the context block actually made it into the request sent to
    // Anthropic — the whole point being debugged here.
    console.log(
      "COACH SYSTEM PROMPT (first 500 chars):",
      systemPrompt.slice(0, 500)
    );

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      // Thinking defaults to adaptive on Sonnet 5, which would eat into the
      // small max_tokens budget meant for the reply — keep it disabled.
      thinking: { type: "disabled" },
      system: systemPrompt,
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const replyText =
      (textBlock && textBlock.type === "text" ? textBlock.text : "").trim() ||
      "Sorry, I couldn't put together a reply just now — try asking again.";

    const { error: replyInsertError } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "assistant", content: replyText });

    if (replyInsertError) {
      console.error("COACH ERROR:", replyInsertError);
      return NextResponse.json({ error: replyInsertError.message }, { status: 500 });
    }

    return new NextResponse(replyText, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("COACH ERROR:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
