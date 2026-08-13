import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { buildContextBlock } from "@/lib/coach-context";

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
