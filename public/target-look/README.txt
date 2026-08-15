Drop your "Your Target Look" reference images into subfolders here, using
these exact filenames (jpg shown — .png/.webp are fine too, just update the
extensions in lib/target-look-images.ts to match):

  beard/clean-shaven.jpg
  beard/stubble.jpg
  beard/patchy.jpg
  beard/full.jpg

  hair/straight.jpg
  hair/wavy.jpg
  hair/curly.jpg
  hair/coily.jpg

  skin/clear-skin.jpg

  style/put-together.jpg

Paths are already wired in lib/target-look-images.ts — once a file exists at
its path above, it appears automatically. Nothing else to edit.

Beard and hair are type-matched: each plan carries a profile_types.beard /
.hair value (clean-shaven/stubble/patchy/full, straight/wavy/curly/coily),
and the card shows the variant that matches that user's plan. If the type is
"unknown" (or the plan predates profile_types), the placeholder card is
shown instead — that's a graceful fallback, not a bug. Skin and style aren't
a type-per-user dimension, so each uses one general reference image.

Suggested shot: well-lit, front-facing, portrait crop (4:5) focused on the
relevant feature (face/hair/beard/outfit) so all images match visually.

This file is not read by the app — delete it once your images are in.
