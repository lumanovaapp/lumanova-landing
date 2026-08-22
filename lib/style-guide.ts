import { Analysis, Plan, SkinDepth, SkinUndertone } from "@/lib/types";
import { DepthGroup, STYLE_GUIDE_IMAGES, StyleGuideImagePair } from "@/lib/style-guide-images";

type UndertoneVariant = Exclude<SkinUndertone, "unknown">;

export interface StyleGuideEntry {
  // Never "unknown" — falls back to "neutral" when the analysis couldn't
  // confidently read undertone. See `isFallback` to tell a real read apart
  // from this fallback.
  undertone: UndertoneVariant;
  // Never "unknown" — falls back to "light" (which already covers "medium"
  // too, so it's a reasonable default) when depth couldn't be read.
  depthGroup: DepthGroup;
  // True when either `undertone` or `depthGroup` above is a fallback, not a
  // real read on this user.
  isFallback: boolean;
  paletteCaption: string;
  // Two distinct images, rendered as two distinct images (not composited) —
  // see StyleGuide.tsx. `images.look` is the hero/main image (a man wearing
  // the outfit); `images.palette` is the secondary color/clothing swatch
  // reference.
  images: StyleGuideImagePair;
  // Reused from the plan generator's own style habit (see the STYLE &
  // PRESENTATION section of app/api/generate-plan's system prompt) when the
  // model produced one — the same personalized fit/color guidance already
  // sitting in the daily routine, surfaced here instead of writing new copy.
  // Null when style wasn't a focus for this user (no style habit exists) or
  // the plan predates habit "category" tagging.
  personalizedTip: { label: string; detail: string } | null;
}

// Real color theory, not just undertone in isolation — depth changes how
// much saturation a color can carry before it either washes the wearer out
// (light/medium skin in a tone too close to their own) or gets swallowed by
// a color too pale to register (deep skin in muted pastels).
const PALETTE_CAPTIONS: Record<UndertoneVariant, Record<DepthGroup, string>> = {
  warm: {
    light: "Warm undertone, light-to-medium depth — soft golden and earthy tones (camel, sage, warm cream, soft rust) flatter without overwhelming. Save fully saturated brights for a small accent, not the whole outfit.",
    deep: "Warm undertone, deep — rich, saturated golden and earthy tones (burnt orange, deep olive, gold, chocolate brown) genuinely come alive on deeper skin. You can wear bold, saturated color as the main piece, not just an accent.",
  },
  cool: {
    light: "Cool undertone, light-to-medium depth — soft blue-based and muted jewel tones (dusty blue, soft charcoal, lavender-grey) flatter without washing you out. Skip colors too close to your own skin tone.",
    deep: "Cool undertone, deep — rich jewel tones (sapphire, emerald, deep plum, true black) are your strongest colors. Deeper skin carries saturated cool color that would overwhelm a fairer complexion.",
  },
  neutral: {
    light: "Neutral undertone, light-to-medium depth — a versatile palette in soft-to-mid tones. Both warm and cool colors work on you, so lean on fit, and avoid anything too close to your own skin tone.",
    deep: "Neutral undertone, deep — a versatile palette that can go bold. Rich, saturated colors from both warm and cool families work well on deeper skin.",
  },
};

// "medium" folds into "light" (the light-to-medium bucket) rather than
// getting a third image — see lib/style-guide-images.ts. "unknown"/missing
// also falls into "light" as the safer generic default; buildStyleGuideEntry
// separately tracks that as a fallback so the UI can label it honestly.
function resolveDepthGroup(depth: SkinDepth | undefined): DepthGroup {
  return depth === "deep" ? "deep" : "light";
}

// Built once per render from the same `analysis` and `plan` PlanView already
// has in scope (identical plumbing to lib/target-look.ts's
// selectTargetLookAreas) — no separate fetch, no data duplicated into
// plan_json.
export function buildStyleGuideEntry(
  analysis: Analysis | null,
  plan: Plan
): StyleGuideEntry | null {
  if (!analysis) return null;

  const detectedUndertone = analysis.skin_tone?.undertone;
  const detectedDepth = analysis.skin_tone?.depth;

  const undertoneKnown = !!detectedUndertone && detectedUndertone !== "unknown";
  const depthKnown = !!detectedDepth && detectedDepth !== "unknown";

  const undertone: UndertoneVariant = undertoneKnown ? detectedUndertone! : "neutral";
  const depthGroup = resolveDepthGroup(detectedDepth);
  const isFallback = !undertoneKnown || !depthKnown;

  const styleHabit = plan.daily_habits.find((h) => h.category === "style");

  return {
    undertone,
    depthGroup,
    isFallback,
    paletteCaption: PALETTE_CAPTIONS[undertone][depthGroup],
    images: STYLE_GUIDE_IMAGES[undertone][depthGroup],
    personalizedTip: styleHabit
      ? { label: styleHabit.label, detail: styleHabit.detail }
      : null,
  };
}
