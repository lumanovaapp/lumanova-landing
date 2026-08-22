import { Analysis, ProfileTypes } from "@/lib/types";
import { TARGET_LOOK_IMAGES } from "@/lib/target-look-images";

// "Your Target Look" reference cards on the plan page — one per focus area,
// showing the destination the daily habits are working toward.
export type FocusAreaKey = "skin" | "hair" | "beard" | "style";

export interface TargetLookEntry {
  key: FocusAreaKey;
  label: string;
  caption: string;
  // lucide-react icon name, resolved where it's rendered (see badges.ts /
  // check-achievements.ts for the same pattern) — keeps this module plain
  // data, safe to import from server code too.
  icon: string;
  // Sourced from lib/target-look-images.ts, type-matched against the plan's
  // profile_types (beard/hair) where applicable — null renders the
  // placeholder card as a graceful fallback. Kept out of this map directly
  // so editing an image path can never accidentally touch the copy/icon
  // config below.
  imageUrl: string | null;
}

// Copy + icon per focus area — image paths live in lib/target-look-images.ts.
const TARGET_LOOK_CONFIG: Record<
  FocusAreaKey,
  Omit<TargetLookEntry, "imageUrl">
> = {
  skin: {
    key: "skin",
    label: "Clear, Even Skin",
    caption:
      "Calm, even-toned skin with a healthy natural glow — what consistent care builds toward.",
    icon: "Droplet",
  },
  hair: {
    key: "hair",
    label: "A Sharp, Intentional Cut",
    caption:
      "A clean, well-defined shape suited to your hair type — a style, not just a haircut.",
    icon: "Scissors",
  },
  beard: {
    key: "beard",
    label: "Clean, Defined Beard Neckline",
    caption:
      "Clean, defined edges and neckline — the shape we're guiding you toward.",
    icon: "Wand2",
  },
  style: {
    key: "style",
    label: "Put-Together Everyday Style",
    caption:
      "Fit, color, and grooming working together — effortless, not overthought.",
    icon: "Shirt",
  },
};

// The analysis prompt (app/api/analyze/route.ts) always uses these exact
// four category names — "facial hair" is checked before the bare "hair"
// substring since "Facial Hair & Grooming" contains both.
function normalizeCategoryName(name: string): FocusAreaKey | null {
  const n = name.toLowerCase();
  if (n.includes("skin")) return "skin";
  if (n.includes("facial hair") || n.includes("beard") || n.includes("grooming"))
    return "beard";
  if (n.includes("hair")) return "hair";
  if (n.includes("style") || n.includes("presentation")) return "style";
  return null;
}

// Resolves the reference image for a focus area. Beard and hair are
// type-matched against the plan's profile_types (falling back to the
// placeholder when the type is "unknown" or the plan predates that field);
// skin and style aren't a type-per-user dimension, so they use one general
// reference image each.
function resolveImageUrl(
  key: FocusAreaKey,
  profileTypes?: ProfileTypes
): string | null {
  switch (key) {
    case "beard": {
      const type = profileTypes?.beard;
      if (!type || type === "unknown") return null;
      return TARGET_LOOK_IMAGES.beard[type];
    }
    case "hair": {
      const type = profileTypes?.hair;
      if (!type || type === "unknown") return null;
      return TARGET_LOOK_IMAGES.hair[type];
    }
    case "skin":
      return TARGET_LOOK_IMAGES.skin;
    case "style":
      return TARGET_LOOK_IMAGES.style;
  }
}

// Fixed display order — Skin, Hair, Facial Hair, Style — independent of
// priority or of the order the model happened to return categories in.
const FOCUS_AREA_ORDER: FocusAreaKey[] = ["skin", "hair", "beard", "style"];

// One target-look card per focus area actually present in the analysis, in
// the fixed order above — NOT a "top N by priority" selection. An earlier
// version filtered down to only "focus"/"refine" categories (capped at 3),
// which silently dropped a category whenever its priority came back
// "maintain" (already in good shape) — e.g. a user whose Hair and Facial
// Hair both read "maintain" would see only Skin and Style. A reference
// image for what a well-executed cut/beard looks like is still useful even
// when it isn't flagged as a top opportunity, so every category the
// analysis actually returned gets a card here regardless of its priority.
// "style" is additionally always included even on the rare/older analysis
// that's missing it — good style is universal advice, not tied to a
// specific finding.
export function selectTargetLookAreas(
  analysis: Analysis | null,
  profileTypes?: ProfileTypes
): TargetLookEntry[] {
  if (!analysis) return [];

  const present = new Set<FocusAreaKey>(["style"]);
  for (const category of analysis.categories) {
    const key = normalizeCategoryName(category.name);
    if (key) present.add(key);
  }

  return FOCUS_AREA_ORDER.filter((key) => present.has(key)).map((key) => ({
    ...TARGET_LOOK_CONFIG[key],
    imageUrl: resolveImageUrl(key, profileTypes),
  }));
}
