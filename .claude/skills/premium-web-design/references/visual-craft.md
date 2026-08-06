# Visual Craft — Premium Execution Detail

Deep reference for step 2 ("fix the foundation") and step 6 ("polish") of the
workflow. Concrete values are strong defaults; bend them to the brand, but never
below the consistency bar.

## Contents
1. Spacing & layout systems
2. Typography in depth
3. Color systems & dark mode
4. Depth: borders, shadows, elevation
5. Radius systems
6. Motion & micro-interactions
7. Imagery & icons
8. The de-generic / de-AI playbook
9. Component-level polish

---

## 1. Spacing & layout systems

- **One scale, no exceptions.** 4px base: `4 8 12 16 24 32 48 64 96 128 160`.
  Everything — padding, margin, gap — snaps to it.
- **Vertical rhythm:** section padding scales with viewport. Desktop ~96–160px
  top/bottom; tablet ~64–96px; mobile ~48–64px. Hero can go larger.
- **Density by intent:** marketing pages breathe (large space); dashboards/apps
  are denser but still on the scale (often an 8px sub-rhythm inside components).
- **Widths:** page content ~1100–1280px max. Reading text column ~600–720px
  (≈60–75 characters/line). Cards and forms often narrower still.
- **Grid:** 12-column with a consistent gutter (24–32px) for marketing; 8-pt grid
  inside app UI. Align every element to shared column edges. Asymmetry is fine and
  premium *when deliberate and aligned* — random offsets are not.
- **Proximity discipline:** the space between a label and its input should be
  smaller than the space between two field groups. Space encodes relationships.

## 2. Typography in depth

- **Pairing:** (a) one variable grotesque across the whole site (simplest, very
  clean), or (b) a display face for headings + neutral body. Keep contrast
  meaningful — don't pair two similar sans faces.
- **Modular scale:** pick a ratio (1.2 minor third for dense UI; 1.25–1.333 for
  marketing drama) and generate steps. Example (1.25): `13 16 20 25 31 39 49 61`.
- **Line-height:** display 1.0–1.1; H1–H3 1.1–1.25; body 1.5–1.7; captions 1.4.
- **Measure:** cap line length at ~65ch for body.
- **Tracking:** headings ≥ ~32px → -0.01 to -0.03em. Uppercase eyebrows/labels →
  +0.05 to +0.12em (uppercase needs air). Body → default.
- **Weight strategy:** hierarchy via size *and* weight. A common premium move:
  large heading in a lighter weight (300–500) with a tight measure, body in
  regular (400), emphasis in 600. Avoid bolding everything.
- **Color of type:** primary text off-black (`#141414`/`rgba(0,0,0,.88)`);
  secondary `rgba(0,0,0,.6)`; disabled `~.38`. In dark mode invert with warm-white
  primaries (`rgba(255,255,255,.92)`), never pure `#fff` at full strength on large
  areas.
- **Numerals:** use tabular figures for tables/pricing so digits align.
- **Details:** enable kerning/ligatures; use real quote/apostrophe glyphs (’ “ ”)
  and em/en dashes; avoid orphaned single words on their own line in headings.

## 3. Color systems & dark mode

- **Build a neutral ramp first** (10 steps from near-white to near-black). Most of
  the UI is drawn from this ramp. Add ONE accent hue with ~5 steps, plus semantic
  colors (success/warn/danger) used only for their meaning.
- **60/30/10** governs proportion; the accent is the 10%.
- **Avoid pure primaries at scale.** Desaturate slightly and shift toward a
  consistent temperature so the palette feels considered.
- **Gradients:** if used, keep them subtle and analogous (neighboring hues), low
  contrast, often as a faint background wash — not a saturated purple→pink hero.
- **Dark mode is not "invert."** Use layered elevation via surface lightening:
  base `#0a0a0a`, surface `#161616`, raised `#1f1f1f`, hairlines
  `rgba(255,255,255,.08)`. Reduce accent saturation ~10–15% and shadows become
  near-useless — lean on borders and surface contrast for depth.
- **Contrast:** body text ≥4.5:1, large text/UI ≥3:1. Check the accent-on-white
  and text-on-accent pairs specifically (bright accents often fail on white).

## 4. Depth: borders, shadows, elevation

- **Directional light:** shadows fall downward (positive y). A tiny top inset
  highlight (`inset 0 1px 0 rgba(255,255,255,.6)`) can add realism on light cards.
- **Layered shadow recipe** (light UI). Combine 2–3 layers, low opacity, growing
  blur/offset:
  - sm: `0 1px 2px rgba(0,0,0,.05)`
  - md: `0 1px 2px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.04)`
  - lg: `0 1px 2px rgba(0,0,0,.04), 0 6px 12px rgba(0,0,0,.05), 0 16px 32px rgba(0,0,0,.06)`
- **Tint the shadow** toward the surface/brand hue slightly instead of neutral
  gray for a richer feel.
- **Borders vs shadows:** hairline borders (`rgba(0,0,0,.06–.1)`) give crisp
  definition and pair well with a soft shadow. In dark mode borders do most of the
  work.
- **Elevation = meaning:** higher elevation for things that float above content
  (menus, modals, popovers). Keep the set small and reuse.

## 5. Radius systems

- Pick a family and stay in it. Common premium sets:
  - Soft-modern: inputs/buttons 8px, cards 12–16px, pills fully rounded.
  - Sharp-editorial: 2–4px or 0 throughout (needs strong type/space to work).
- **Concentric rule:** inner radius = outer radius − gap. A 16px card with 8px
  inner padding wrapping a button → button radius ~8px so corners nest cleanly.
- Don't mix rounded and sharp arbitrarily; mismatched radii is a classic tell.

## 6. Motion & micro-interactions

- **Timing:** 120–250ms for most UI transitions; ≤400ms for larger moves. Too slow
  feels sluggish, too fast feels cheap/janky.
- **Easing:** `ease-out` (or a custom `cubic-bezier(.16,1,.3,1)`) for elements
  entering; `ease-in` for exits. Avoid `linear` for UI. Reserve bounce/spring for
  playful brands only.
- **Animate cheap properties:** `transform` and `opacity` (GPU-friendly). Avoid
  animating layout properties (width/height/top) where possible.
- **Micro-interactions that read premium:** subtle button press (scale .98 +
  shadow reduce), link underline grow, card lift on hover (translateY(-2–4px) +
  shadow up), input focus ring fade-in, smooth number/count transitions.
- **Restraint:** not everything animates. Scroll-reveal a *few* key elements once;
  never stagger the whole page. Always honor `prefers-reduced-motion`.

## 7. Imagery & icons

- **Real > abstract.** Product screenshots, real photos, or purposeful
  illustration beat generic gradient blobs and random stock.
- **Consistent treatment:** same grade/tone, aspect ratios, corner radius, and
  shadow across all images. A shared color grade unifies mismatched sources.
- **Frame product shots:** browser/device mockups, subtle shadow, slight
  perspective or bleed off an edge to imply depth and space.
- **Icons:** one consistent set (e.g. Lucide, Phosphor, Heroicons) at one stroke
  weight and size. **Never emoji as UI icons.** Align icon optical size to text.
- **AI-generated imagery:** if used, force consistency — same model/style/prompt
  framing, then color-grade them together so they don't look scavenged.

## 8. The de-generic / de-AI playbook

Kill the "templated AI landing page" smell:

- **Break the rhythm.** Don't stack identical centered sections. Alternate
  left/right layouts, insert a full-bleed moment, vary background surface between
  sections, change column counts. Contrast in rhythm creates interest.
- **Replace generic trios.** The auto-generated "three feature cards with icons"
  block is the biggest tell. Turn features into a story: a large primary feature
  with a real screenshot, then supporting ones in a different layout.
- **Specific > generic copy.** Swap "Powerful features for modern teams" for a
  concrete outcome and proof. Vague superlatives scream template.
- **Real proof.** Named testimonials with faces/roles, actual customer logos, hard
  numbers. Placeholder or logo-less proof undercuts everything.
- **Distinctive type & color.** Move off the default framework look — a
  characterful heading face, a considered accent, and tight spacing instantly
  separate you from the boilerplate.
- **One signature detail.** A small unique element — a custom cursor accent, a
  tasteful noise/grain texture, a distinctive underline or bracket motif, a
  bespoke illustration style — signals intention and human authorship.
- **Edge polish.** Consistent hairlines, aligned baselines, and correct optical
  spacing are the fingerprints of a designed (not generated) page.

## 9. Component-level polish

**Buttons**
- Clear hierarchy: one primary (filled, accent), secondary (outline/subtle),
  tertiary (text/ghost). Never two primaries competing in one view.
- Generous padding (e.g. 10–14px vertical, 20–28px horizontal), readable label,
  optional leading/trailing icon aligned to text.
- All states designed: default, hover, active/press, focus-visible ring,
  disabled, loading (spinner or label swap). Missing states read as unfinished.

**Cards**
- Consistent padding, radius, border/shadow from the system. Clear internal
  hierarchy (eyebrow → title → body → action). Don't over-nest cards-in-cards.

**Forms & inputs**
- Labels above fields (fastest to scan); comfortable height (~44–48px); clear
  focus state; inline, specific validation ("Enter a valid email," not "Error").
- Minimize fields — every field costs conversion. Group logically; single column
  is usually fastest to complete.

**Navigation**
- Predictable placement (logo left, nav center/left, primary action right).
- ≤5–7 top-level items; group the rest. Clear active state. Sticky nav should be
  compact and unobtrusive. Mobile: obvious, thumb-reachable menu and CTA.

**Empty, loading & error states**
- Design them deliberately — they're where amateur products fall apart. Empty
  states should orient and prompt the next action; loading uses skeletons over
  spinners where possible; errors are human, specific, and recoverable.

**Focus & accessibility as premium**
- Visible focus rings (don't remove outlines — restyle them). Sufficient contrast,
  logical tab order, hit areas ≥44px. Accessible interfaces feel more solid and
  trustworthy, which is itself a premium and conversion signal.
