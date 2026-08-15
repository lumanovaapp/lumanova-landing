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

// Picks up to `max` target-look cards from the user's real analysis —
// "focus" (biggest opportunity) categories first, then "refine", so the
// section always points at what actually matters for this person rather
// than showing all four regardless of relevance. Style is then always
// appended as a trailing card (unless it already made the personalized
// cut) — good style is universal advice, not something tied to a specific
// analysis finding, so it isn't subject to being crowded out.
export function selectTargetLookAreas(
  analysis: Analysis | null,
  profileTypes?: ProfileTypes,
  max = 3
): TargetLookEntry[] {
  if (!analysis) return [];

  const seen = new Set<FocusAreaKey>();
  const picks: TargetLookEntry[] = [];

  for (const priority of ["focus", "refine"] as const) {
    for (const category of analysis.categories) {
      if (category.priority !== priority) continue;
      const key = normalizeCategoryName(category.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      picks.push({
        ...TARGET_LOOK_CONFIG[key],
        imageUrl: resolveImageUrl(key, profileTypes),
      });
      if (picks.length >= max) break;
    }
    if (picks.length >= max) break;
  }

  if (!seen.has("style")) {
    picks.push({
      ...TARGET_LOOK_CONFIG.style,
      imageUrl: resolveImageUrl("style", profileTypes),
    });
  }

  return picks;
}
