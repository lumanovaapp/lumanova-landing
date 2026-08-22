Drop your "Your Colors & Style" reference images here, using these exact
filenames (png shown — .jpg/.webp are fine too, just update the extensions
in lib/style-guide-images.ts to match). Each of the 6 undertone x depth
variants needs TWO images — 12 files total:

  warm-light-look.png       — a man wearing an outfit in this palette
  warm-light-palette.png    — color/clothing swatch reference
    (warm undertone, light-to-medium depth: soft golden/earthy tones —
     camel, sage, warm cream, soft rust)

  warm-deep-look.png
  warm-deep-palette.png
    (warm undertone, deep: rich, saturated golden/earthy tones — burnt
     orange, deep olive, gold, chocolate brown)

  cool-light-look.png
  cool-light-palette.png
    (cool undertone, light-to-medium depth: soft blue-based/muted jewel
     tones — dusty blue, soft charcoal, lavender-grey)

  cool-deep-look.png
  cool-deep-palette.png
    (cool undertone, deep: rich jewel tones — sapphire, emerald, deep
     plum, true black)

  neutral-light-look.png
  neutral-light-palette.png
    (neutral undertone, light-to-medium depth: a versatile soft-to-mid-
     tone palette)

  neutral-deep-look.png
  neutral-deep-palette.png
    (neutral undertone, deep: a versatile palette that can go bold/saturated)

Paths are already wired in lib/style-guide-images.ts — once a file exists at
its path above, it appears automatically. Nothing else to edit.

The "look" and "palette" images render as two distinct images side by side
on desktop (look larger/hero, palette beside it) and stacked on mobile —
never combined into one. They fail independently: if only one of a pair is
missing, that one alone shows the text-only placeholder while the other
renders normally (see components/dashboard/plan/StyleGuide.tsx).

Matched by BOTH undertone and depth: each analysis carries a skin_tone value
with undertone (warm/cool/neutral/unknown) and depth (light/medium/deep/
unknown) — see app/api/analyze/route.ts. Depth is grouped into two buckets
to keep this to 6 variants instead of 9: "light" covers light-AND-medium
depth, "deep" covers deep. If undertone or depth came back "unknown," the
card falls back to neutral / the "light" bucket and labels it "(best
guess)" rather than claiming a confident match — that's a deliberate
fallback, not a bug.

Suggested shots:
  - look: a well-lit, front-facing or 3/4 outfit shot, portrait crop (4:5)
  - palette: a flat-lay of a few color swatches/garment pieces, same 4:5 crop
  so all 12 images match visually as a set.

This file is not read by the app — delete it once your images are in.
