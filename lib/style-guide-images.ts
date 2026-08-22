import { SkinUndertone } from "@/lib/types";

// ============================================================================
// EDIT THIS FILE to add your own "Your Colors & Style" reference images.
//
// Save your image files into public/style-guide/ using the EXACT filenames
// below. Matched by the user's analysis.skin_tone — undertone (warm/cool/
// neutral) AND depth combine, since flattering colors depend on both (see
// lib/style-guide.ts) — depth is grouped into two buckets to keep this to 6
// variants instead of 9: "light" covers light-AND-medium depth, "deep"
// covers deep. A photo where undertone or depth came back "unknown" falls
// back to neutral / the "light" bucket respectively, so the section still
// shows real images instead of going blank; that fallback is labeled
// honestly in the UI ("best guess") rather than presented as a confident
// match.
//
// Each of the 6 variants below needs TWO images, shown as two distinct
// images in the card (not combined into one):
//   - "look"    — a man wearing an outfit in that palette, matched to the
//                 undertone/depth. This is the card's hero/main image.
//   - "palette" — a color/clothing swatch reference for that palette, shown
//                 alongside the look image, smaller.
//
//   public/style-guide/warm-light-look.png
//   public/style-guide/warm-light-palette.png
//     — warm undertone, light-to-medium depth: soft golden/earthy tones
//       (camel, sage, warm cream, soft rust) — flattering without overwhelming
//
//   public/style-guide/warm-deep-look.png
//   public/style-guide/warm-deep-palette.png
//     — warm undertone, deep: rich, saturated golden/earthy tones
//       (burnt orange, deep olive, gold, chocolate brown)
//
//   public/style-guide/cool-light-look.png
//   public/style-guide/cool-light-palette.png
//     — cool undertone, light-to-medium depth: soft blue-based/muted jewel
//       tones (dusty blue, soft charcoal, lavender-grey)
//
//   public/style-guide/cool-deep-look.png
//   public/style-guide/cool-deep-palette.png
//     — cool undertone, deep: rich jewel tones (sapphire, emerald, deep
//       plum, true black)
//
//   public/style-guide/neutral-light-look.png
//   public/style-guide/neutral-light-palette.png
//     — neutral undertone, light-to-medium depth: a versatile soft-to-mid-
//       tone palette
//
//   public/style-guide/neutral-deep-look.png
//   public/style-guide/neutral-deep-palette.png
//     — neutral undertone, deep: a versatile palette that can go bold/saturated
//
// (.jpg / .webp work too — just update the extensions below to match.)
//
// The paths below already point at those exact files, so dropping images in
// with these filenames is the only step needed — nothing else to edit. The
// look and palette images fail independently: if one file is missing at
// runtime, StyleGuide (components/dashboard/plan/StyleGuide.tsx) catches
// just that broken <img> and swaps in a text-only placeholder for it alone
// — the other image (if present) keeps rendering normally. Same visual
// language as TargetLook's own placeholder, so there's no need to null out
// an entry while you're still generating images.
// ============================================================================

type UndertoneVariant = Exclude<SkinUndertone, "unknown">;
// "light" also covers "medium" depth — see lib/style-guide.ts's
// resolveDepthGroup. Keeps the library at 6 variants instead of 9.
export type DepthGroup = "light" | "deep";

export interface StyleGuideImagePair {
  look: string;
  palette: string;
}

export const STYLE_GUIDE_IMAGES: Record<UndertoneVariant, Record<DepthGroup, StyleGuideImagePair>> = {
  warm: {
    light: {
      look: "/style-guide/warm-light-look.png",
      palette: "/style-guide/warm-light-palette.png",
    },
    deep: {
      look: "/style-guide/warm-deep-look.png",
      palette: "/style-guide/warm-deep-palette.png",
    },
  },
  cool: {
    light: {
      look: "/style-guide/cool-light-look.png",
      palette: "/style-guide/cool-light-palette.png",
    },
    deep: {
      look: "/style-guide/cool-deep-look.png",
      palette: "/style-guide/cool-deep-palette.png",
    },
  },
  neutral: {
    light: {
      look: "/style-guide/neutral-light-look.png",
      palette: "/style-guide/neutral-light-palette.png",
    },
    deep: {
      look: "/style-guide/neutral-deep-look.png",
      palette: "/style-guide/neutral-deep-palette.png",
    },
  },
};
