import { BeardType, HairType } from "@/lib/types";

// ============================================================================
// EDIT THIS FILE to add your own "Your Target Look" reference images.
//
// Save your image files into public/target-look/ using the EXACT filenames
// below (grouped by focus area). Beard and hair are type-matched — each
// user's plan carries a profile_types.beard / .hair value (see
// lib/target-look.ts), and the matching variant is shown automatically.
// Skin and style aren't type-specific, so each gets a single reference image.
//
//   public/target-look/beard/clean-shaven.png
//   public/target-look/beard/stubble.png
//   public/target-look/beard/patchy.png
//   public/target-look/beard/full.png
//   public/target-look/hair/straight.png
//   public/target-look/hair/wavy.png
//   public/target-look/hair/curly.png
//   public/target-look/hair/coily.png
//   public/target-look/skin/clear-skin.png
//   public/target-look/style/put-together.png
//
// (.jpg / .webp work too — just update the extensions below to match.)
//
// The paths below already point at those exact files, so dropping images in
// with these filenames is the only step needed — nothing else to edit. If a
// file is missing at runtime, the browser just 404s that one <img>; there's
// no need to null out an entry while you're still generating images.
// ============================================================================

type BeardVariant = Exclude<BeardType, "unknown">;
type HairVariant = Exclude<HairType, "unknown">;

export const TARGET_LOOK_IMAGES: {
  beard: Record<BeardVariant, string>;
  hair: Record<HairVariant, string>;
  skin: string;
  style: string;
} = {
  beard: {
    "clean-shaven": "/target-look/beard/clean-shaven.png",
    stubble: "/target-look/beard/stubble.png",
    patchy: "/target-look/beard/patchy.png",
    full: "/target-look/beard/full.png",
  },
  hair: {
    straight: "/target-look/hair/straight.png",
    wavy: "/target-look/hair/wavy.png",
    curly: "/target-look/hair/curly.png",
    coily: "/target-look/hair/coily.png",
  },
  skin: "/target-look/skin/clear-skin.png",
  style: "/target-look/style/put-together.png",
};
