import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { Analysis } from "@/lib/types";
import { Ethnicity, Goal } from "@/types/database";
import { parseModelJson } from "@/lib/parse-json";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the analysis engine for Lumanova, a men's self-care and grooming coaching app. You look at a user's selfie and produce constructive, specific, encouraging grooming, skincare, and style feedback that will seed a 90-day improvement plan.

Rules:
- You are a supportive coach, not a judge. Never rate attractiveness, never give a score, never comment on how good-looking someone is. Never shame.
- Only cover things the user can actually change: skincare, hair, facial hair and grooming, and overall style/presentation.
- Be specific and actionable. "Use a gentle foaming cleanser morning and night" beats "improve your skincare."
- Never give medical diagnoses. If something looks like a possible skin/medical issue, gently suggest seeing a professional and move on — do not name conditions.
- Tailor advice to the user's stated goals, and use their background only where it genuinely affects skin or hair type. Do not stereotype.
- Confident, warm, hype-free tone. No emojis.
- For each category, look at the actual photo and estimate "zone": the approximate CENTER of that feature in the image, as percent from the top-left corner (x and y each 0-100). For example hair/hairline is usually near the top-center of a headshot, the chin/jaw is lower-center, cheeks/skin are mid-face left or right of center. Be as accurate as you can from what you actually see in this specific photo — do not just reuse generic defaults. This coordinate is used to place a marker directly on that feature, so it must land on the right part of the face/head.
- For each category, set "priority" honestly based on what you observe: "maintain" if it's already in good shape, "refine" if it just needs small tweaks, "focus" if it's the biggest opportunity. Not every category is "focus" — most photos should have a mix.
- Output ONLY valid JSON matching the schema. No markdown, no text outside the JSON.
- Return raw JSON only. No markdown, no code fences, no text before or after the JSON.

Schema:
{
  "summary": "1-2 sentence encouraging overview of where they're starting from",
  "categories": [
    {
      "name": "Skin",
      "observations": ["..."],
      "recommendations": ["..."],
      "priority": "maintain | refine | focus",
      "zone": { "x": 0, "y": 0 }
    },
    {
      "name": "Hair",
      "observations": ["..."],
      "recommendations": ["..."],
      "priority": "maintain | refine | focus",
      "zone": { "x": 0, "y": 0 }
    },
    {
      "name": "Facial Hair & Grooming",
      "observations": ["..."],
      "recommendations": ["..."],
      "priority": "maintain | refine | focus",
      "zone": { "x": 0, "y": 0 }
    },
    {
      "name": "Style & Presentation",
      "observations": ["..."],
      "recommendations": ["..."],
      "priority": "maintain | refine | focus",
      "zone": { "x": 0, "y": 0 }
    }
  ],
  "quick_wins": ["3 highest-impact things to start this week"],
  "focus_areas": ["2-3 themes to anchor the 90-day plan"]
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

  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("id, user_id, storage_path")
    .eq("id", photoId)
    .single();

  if (photoError || !photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (photo.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: imageBlob, error: downloadError } = await supabase.storage
    .from("selfies")
    .download(photo.storage_path);

  if (downloadError || !imageBlob) {
    return NextResponse.json(
      { error: "Could not load the uploaded photo" },
      { status: 500 }
    );
  }

  const imageBase64raw = Buffer.from(await imageBlob.arrayBuffer()).toString(
    "base64"
  );
  // Defensive: strip a data: URL prefix if one ever ends up in storage/base64 output.
  const imageBase64 = imageBase64raw.replace(/^data:image\/\w+;base64,/, "");

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
      max_tokens: 2500,
      // Thinking defaults to adaptive on Sonnet 5, which would eat into the
      // 2500-token budget meant for the JSON response — keep it disabled.
      thinking: { type: "disabled" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `${profileContext}\n\nAnalyze this selfie and return ONLY the JSON.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    await supabase.from("photos").update({ status: "failed" }).eq("id", photoId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  let analysis: Analysis;
  try {
    analysis = parseModelJson<Analysis>(rawText);
  } catch (err) {
    console.error("ANALYZE ERROR:", err, "raw response:", rawText);
    await supabase.from("photos").update({ status: "failed" }).eq("id", photoId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("photos")
    .update({ analysis, status: "complete" })
    .eq("id", photoId);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not save the analysis" },
      { status: 500 }
    );
  }

  return NextResponse.json({ analysis });
}
