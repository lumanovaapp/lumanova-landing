Drop your "Your Target Look" reference images in this folder, using these
exact filenames (jpg shown — .png/.webp are fine too):

  skin.jpg
  hair.jpg
  beard.jpg
  style.jpg

Then point each key at its file in lib/target-look-images.ts, e.g.:

  skin: "/target-look/skin.jpg",

That's the only file you need to edit. Leave a key as `null` in that file to
keep the placeholder card for that focus area — nothing else breaks.

Suggested shot: well-lit, front-facing, portrait crop (4:5) focused on the
relevant feature (face/hair/beard/outfit) so all four match visually.

This file is not read by the app — delete it once your images are in.
