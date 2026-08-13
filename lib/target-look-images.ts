import { FocusAreaKey } from "@/lib/target-look";

// ============================================================================
// EDIT THIS FILE to add your own "Your Target Look" reference images.
//
// 1. Save your image files into public/target-look/, using these exact names:
//      public/target-look/skin.jpg
//      public/target-look/hair.jpg
//      public/target-look/beard.jpg
//      public/target-look/style.jpg
//    (.png / .webp work too — just update the extension below to match.)
//
// 2. Point each key below at its path, e.g.:
//      skin: "/target-look/skin.jpg",
//
// Leave a value as `null` to keep the placeholder card for that focus area —
// nothing breaks if an image is missing. No other file needs to change.
// ============================================================================
export const TARGET_LOOK_IMAGES: Record<FocusAreaKey, string | null> = {
  skin: null,
  hair: null,
  beard: null,
  style: null,
};
