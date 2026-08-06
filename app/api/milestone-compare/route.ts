import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { Comparison } from "@/lib/types";
import { parseModelJson } from "@/lib/parse-json";
import { checkAndAwardAchievements } from "@/lib/check-achievements";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You compare a user's BASELINE and CURRENT selfie for Lumanova, a men's self-care app, and give honest, encouraging feedback on visible change in grooming, skin, hair, style — tied to their goals. Celebrate real progress; frame unchanged areas as the next focus, never failure. Account for lighting/angle differences (hedge). No shaming, no attractiveness scores, no medical claims. Output raw JSON only: { "headline": string, "improvements": string[], "keep_working": string[], "next_focus": string }`;

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = (await request.json()) as { photoId?: string };
  if (!photoId) {
    return NextResponse.json({ error: "Missing photoId" }, { status: 400 });
  }

  const { data: milestonePhoto, error: milestoneError } = await supabase
    .from("photos")
    .select("id, user_id, storage_path")
    .eq("id", photoId)
    .single();

  if (milestoneError || !milestonePhoto) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (milestonePhoto.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: explicitBaseline } = await supabase
    .from("photos")
    .select("id, storage_path, analysis")
    .eq("user_id", user.id)
    .eq("photo_type", "baseline")
    .maybeSingle();

  let baselinePhoto = explicitBaseline;
  if (!baselinePhoto) {
    const { data: earliestAnalyzed } = await supabase
      .from("photos")
      .select("id, storage_path, analysis")
      .eq("user_id", user.id)
      .not("analysis", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    baselinePhoto = earliestAnalyzed;
  }

  if (!baselinePhoto) {
    return NextResponse.json(
      { error: "No baseline analysis found. Analyze a photo first." },
      { status: 400 }
    );
  }

  const [milestoneDownload, baselineDownload] = await Promise.all([
    supabase.storage.from("selfies").download(milestonePhoto.storage_path),
    supabase.storage.from("selfies").download(baselinePhoto.storage_path),
  ]);

  if (milestoneDownload.error || !milestoneDownload.data) {
    return NextResponse.json(
      { error: "Could not load the progress photo" },
      { status: 500 }
    );
  }
  if (baselineDownload.error || !baselineDownload.data) {
    return NextResponse.json(
      { error: "Could not load the baseline photo" },
      { status: 500 }
    );
  }

  const currentBase64 = Buffer.from(
    await milestoneDownload.data.arrayBuffer()
  ).toString("base64");
  const baselineBase64 = Buffer.from(
    await baselineDownload.data.arrayBuffer()
  ).toString("base64");

  const focusAreas = baselinePhoto.analysis?.focus_areas ?? [];
  const focusAreasText =
    focusAreas.length > 0 ? focusAreas.join(", ") : "not specified";

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      // Thinking defaults to adaptive on Sonnet 5, which would eat into the
      // 1200-token budget meant for the JSON comparison — keep it disabled.
      thinking: { type: "disabled" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "BASELINE:" },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: baselineBase64,
              },
            },
            { type: "text", text: "CURRENT:" },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: currentBase64,
              },
            },
            {
              type: "text",
              text: `Original focus areas: ${focusAreasText}\n\nCompare CURRENT to BASELINE and return ONLY the JSON.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";
  } catch (err) {
    console.error("MILESTONE COMPARE ERROR:", err);
    await supabase.from("photos").update({ status: "failed" }).eq("id", photoId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  let comparison: Comparison;
  try {
    comparison = parseModelJson<Comparison>(rawText);
  } catch (err) {
    console.error("MILESTONE COMPARE ERROR:", err, "raw response:", rawText);
    await supabase.from("photos").update({ status: "failed" }).eq("id", photoId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("photos")
    .update({ comparison, status: "complete" })
    .eq("id", photoId);

  if (updateError) {
    console.error("MILESTONE COMPARE ERROR:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const newlyUnlocked = await checkAndAwardAchievements(user.id);

  return NextResponse.json({ comparison, newlyUnlocked });
}
