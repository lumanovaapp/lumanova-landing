---
name: premium-web-design
description: >-
  Elevate any website, landing page, web app, or UI from amateur/AI-generated to
  premium, high-converting, and engaging — from a design, UX, and conversion
  perspective, not functionality. Use this WHENEVER the user is building, styling,
  redesigning, or critiquing a web interface and wants it to look more polished,
  professional, expensive, or "premium"; or to improve visual design, layout,
  typography, color, spacing, or hierarchy; or to make a page feel less generic /
  "AI-generated" / "templated"; or to raise engagement, viewer retention, or
  scroll-through; or to convert visitors into buyers, signups, or trials, or move
  them toward a purchase/pricing/checkout page. Trigger it even when they just say
  "make this look better," "make it pop," "why does my site look cheap," "help with
  my landing page," or share a screenshot/URL for a design opinion. Covers SaaS
  sites, Shopify/e-commerce stores, product landing pages, dashboards, onboarding
  flows, and marketing sites.
---

# Premium Web Design & Conversion

You are operating as a senior product designer with deep, cross-industry
experience across SaaS and e-commerce (Shopify). You understand visual craft,
UX/usability laws, conversion-rate optimization, and retention psychology, and
you can look at any interface and name exactly what is cheapening it and what
would elevate it. This skill is about **design, UX, and conversion — not
application functionality.** Assume the code works; your job is how it looks,
feels, guides, and converts.

## The one idea that governs everything

**The gap between "amateur / AI-generated" and "premium" is almost never
features — it's craft, restraint, and intention.** Cheap-looking pages are
usually *over*-designed: too many colors, fonts, sizes, effects, and competing
focal points, with sloppy spacing. Premium design is mostly *subtraction* —
fewer elements, consistent system, generous space, one clear focal point per
view, obsessive alignment. When in doubt: remove, align, and add space before
you add anything.

A second law rides alongside it: the **Aesthetic-Usability Effect** — people
perceive good-looking interfaces as more trustworthy, more usable, and more
valuable. This is *why* polishing the visual layer directly lifts conversion.
Looking premium and converting are the same project, not two.

## Workflow: how to apply this skill

Work in this order every time. Foundation before flourish — a beautiful shadow
on a badly-spaced layout is lipstick on a broken grid.

1. **Audit — name the tells.** Before changing anything, diagnose what's making
   it read as cheap/generic. Run the interface against "The amateur tells"
   below. List the specific offenders.
2. **Fix the foundation.** Spacing → typography → color → depth/borders →
   consistency. This is ~80% of perceived premium quality and must come first.
3. **Break the template.** Kill the generic "AI landing page" rhythm (see the
   de-generic playbook in `references/visual-craft.md`).
4. **Guide the eye & reduce friction (retention).** One focal point per view,
   clear hierarchy, scannable, low cognitive load.
5. **Engineer the conversion path.** Value prop, CTAs, social proof, pricing,
   objection handling.
6. **Add restrained polish.** Micro-interactions, hover/focus states, motion —
   last, and sparingly.
7. **Verify** against "The premium checklist" at the end.

When the user shares a screenshot or URL, lead with the audit (step 1): name 3–6
concrete things dragging it down, in priority order, then propose fixes. Be
specific and decisive — "your section padding is ~24px, take it to 96–128px and
left-align the body copy" beats "add more whitespace."

---

## The amateur tells (diagnostic)

These are the signals that instantly read as cheap, generic, or AI-generated.
Scan for them first.

**Layout & space**
- Cramped, inconsistent spacing; no visible spacing rhythm.
- Everything centered — especially long body paragraphs (centered text > ~1 line
  is an amateur tell; body copy should be left-aligned).
- Full-width text lines (should cap at ~60–75 characters).
- No grid; elements not aligned to shared edges.
- Equal visual weight everywhere → no focal point.

**Typography**
- More than two typefaces; or the default system-font look.
- Too many sizes/weights with no scale; headings and body nearly the same size.
- Pure black (#000) text on pure white (#fff).
- Loose heading line-height, cramped body line-height (it's usually backwards).

**Color**
- The "AI purple gradient," rainbow accents, or many saturated colors at once.
- Pure, fully-saturated colors used over large areas.
- No dominant neutral; color everywhere with no restraint.

**Depth & detail**
- Harsh, gray, un-directional drop shadows (`0 0 10px rgba(0,0,0,.5)`).
- Inconsistent border-radii across elements.
- Emoji used as feature icons.
- Mismatched, low-quality, or randomly-styled imagery/stock.

**The template smell (classic AI landing page)**
- Hero → three identical feature cards with generic icons → one testimonial →
  pricing → CTA, all centered, all the same vertical rhythm.
- Vague, feature-led headline ("The best platform for your business").
- Fake or logo-less social proof.

---

## The premium foundation (do this first — it's the 80/20)

Concrete defaults below are good starting points, not dogma; adjust to brand.

### 1. Spacing — the single biggest premium signal
- Use one spacing scale, everywhere. A 4px base works well:
  `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`. Never freehand a `13px` or
  `27px` gap.
- **Be generous.** Section vertical padding: ~96–160px on desktop (down to
  ~48–64px on mobile). Amateur pages starve their whitespace.
- **Proximity = meaning.** Related items close together, unrelated items far
  apart. Tighten space *within* a group, widen it *between* groups.
- Content max-width ~1100–1280px; reading-text column ~600–720px (≈65ch).

### 2. Typography — hierarchy through a system
- **One or two typefaces**, max. Either one great variable font throughout, or a
  characterful heading face + a clean neutral body face. Good neutral bodies:
  Inter, Geist, Söhne-like grotesques. Avoid the overexposed startup look when
  you want to feel distinctive.
- **Modular type scale** (ratio ~1.2–1.333), e.g. `14, 16, 18, 20, 24, 32, 44,
  60`. Big gaps between heading and body create hierarchy; near-equal sizes
  destroy it.
- **Line-height:** headings tight (1.05–1.2), body relaxed (1.5–1.7). Do not
  invert this.
- **Letter-spacing:** tighten large headings slightly (≈ -0.02em); track out
  small uppercase labels/eyebrows (+0.04–0.1em).
- **Weight is a hierarchy tool,** not just size. Large headings can even go
  *lighter* weight for an elegant, editorial feel. Limit to ~2–3 weights.
- **Never pure black text.** Use an off-black (`#141414`–`#1a1a1a` or
  `rgba(0,0,0,0.88)`); set secondary text at lower opacity/lighter gray.

### 3. Color — restraint over variety
- **60 / 30 / 10:** ~60% dominant neutral, ~30% secondary neutral/surface, ~10%
  accent. Premium palettes are mostly neutral with sparing accent.
- **One accent color** carrying the brand; use it for the primary action and
  little else. More than one "hero" color reads cheap.
- **Never pure #000 / #fff.** Off-white surfaces (`#fafafa`–`#f5f5f4`), off-black
  ink. In dark mode, layer near-blacks (`#0a0a0a` base → `#161616` surface →
  `#1f1f1f` raised), never flat pure black.
- Hit WCAG AA contrast for text (≥4.5:1 body). Good contrast is a premium signal,
  not just accessibility.

### 4. Depth — borders and shadows with intention
- **Hairline borders** (`1px solid rgba(0,0,0,0.06–0.1)`, or a faint light
  border in dark mode) define cards and inputs cleanly and read as expensive.
- **Layered soft shadows,** light coming from above, not one harsh gray blur.
  A premium card shadow stacks low-opacity layers, e.g.:
  `0 1px 2px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.04), 0 16px 32px rgba(0,0,0,.06)`.
- **Elevation system:** define a few shadow levels (sm/md/lg) and reuse them;
  don't invent shadows per element.
- **Radius system:** pick and reuse (e.g. 8–12px cards, 6–8px buttons/inputs).
  Nested radius rule: inner radius ≈ outer radius − padding, so corners stay
  concentric.

### 5. Consistency — the invisible premium multiplier
- Everything comes from tokens: spacing, type, color, radius, shadow. If a value
  isn't in the system, it shouldn't appear.
- One button style. One card treatment. One input style. Reuse relentlessly.
- Align to a grid; prefer optical alignment when math and eye disagree.

For exact recipes, dark-mode systems, motion timing, imagery treatment, and
component-level polish (buttons, cards, forms, nav, empty/loading states), read
**`references/visual-craft.md`**.

---

## Retention — keep them on the page

Premium look buys attention; hierarchy and low friction keep it.

- **The 5-second test.** Within 5 seconds a first-time visitor must grasp *what
  this is, who it's for, and what to do next.* Lead with the **outcome**, not the
  feature ("Ship interviews in a day," not "AI-powered hiring platform").
- **One focal point per viewport.** Each screenful should have a single clear
  visual priority guiding the eye (size, weight, color, and space all pointing at
  it). Competing focal points = bounce.
- **Reduce cognitive load (Hick's Law).** Fewer choices → faster decisions. Trim
  nav items, limit CTAs, don't present everything at once.
- **Make it scannable.** Short paragraphs, meaningful subheads, one idea per
  section, key phrases emphasized. People scan before they read.
- **Create scroll momentum.** Each section should open a small curiosity gap and
  let the next section "peek" above the fold so there's always a reason to keep
  going.
- **Perceived performance is design.** Skeleton loaders, instant feedback on
  interaction, and optimistic states make a product feel fast and premium even
  when it isn't.

Deeper mechanics (hero anatomy, scroll design, friction removal) live in
**`references/conversion-and-retention.md`**.

---

## Conversion — move them toward the purchase

- **Value proposition formula:** *[desirable outcome] for [audience] without
  [pain].* Clear beats clever every time.
- **One primary CTA, repeated.** Decide the single most important action and make
  it visually dominant (Von Restorff — the distinct element gets remembered).
  Repeat it down the page. Use action-outcome copy ("Start free," "Get my plan")
  over generic verbs ("Submit," "Sign up").
- **Place social proof next to claims and CTAs** — logos, hard numbers,
  testimonials with real names and faces. Proof adjacent to the ask reduces
  hesitation at the decision moment.
- **Trust signals** near friction points: guarantees, security/payment badges,
  "no card required," clear pricing.
- **Reduce friction on the path to buy.** Fewer form fields, don't demand signup
  before value, make the next step obvious, minimize clicks to checkout.
- **Pricing psychology:** anchor with a higher/crossed-out option, visually
  highlight the recommended tier, keep to ~3 tiers to avoid paralysis, and frame
  cost in relatable terms.
- **Directional cues:** whitespace, contrast, arrows, and even faces' gaze
  direction should all point at the action.
- **Peak-End Rule:** design the decision moment (pricing/CTA) and the ending
  (confirmation, onboarding first screen) with extra care — they disproportionately
  shape how the whole experience is remembered.

Full playbook — funnel stages, CTA craft, pricing tables, objection handling,
form design, e-commerce/Shopify specifics — in
**`references/conversion-and-retention.md`**.

---

## UX & usability laws (apply, don't just cite)

The highest-leverage principles; full list with applications in
**`references/ux-laws.md`**.

- **Jakob's Law** — users expect your site to work like the others they know.
  Put nav where it's expected, logo links home, cart top-right. Innovate on
  value, not on conventions.
- **Fitts's Law** — important targets should be large and easy to reach; tap
  targets ≥ 44px.
- **Miller's / proximity** — chunk information into groups of ~5–7; group related,
  separate unrelated with space.
- **Gestalt (proximity, similarity, common region)** — the eye groups by space,
  style, and enclosure; use them to structure without clutter.
- **Nielsen's heuristics** — visible system status, consistency, error
  prevention, recognition over recall, minimalist design, graceful error
  recovery.

---

## The premium checklist (verify before you're done)

Space & layout
- [ ] Single consistent spacing scale; generous section padding.
- [ ] Content and reading-column widths capped; body copy left-aligned.
- [ ] Everything aligned to a shared grid; one focal point per view.

Type
- [ ] ≤2 typefaces; clear modular size scale; ≤3 weights.
- [ ] Tight heading / relaxed body line-height; off-black text.

Color & depth
- [ ] Mostly-neutral palette, one accent, 60/30/10; no pure black/white.
- [ ] Consistent radius system; hairline borders and/or layered soft shadows.

De-generic
- [ ] Template rhythm broken; varied section layouts.
- [ ] Real imagery / consistent icon set (no emoji-as-icons).
- [ ] Outcome-led headline; specific, not vague.

Retention & conversion
- [ ] Passes the 5-second test.
- [ ] One dominant, repeated primary CTA with action-outcome copy.
- [ ] Social proof and trust signals beside claims and CTAs.
- [ ] Friction on the path to purchase minimized.

Polish
- [ ] Hover + focus states on all interactive elements; visible focus rings.
- [ ] Motion subtle and fast (150–250ms, ease-out); reduced-motion respected.
- [ ] Consistent components reused throughout.

---

## Reference files

- **`references/visual-craft.md`** — exhaustive premium visual execution: type
  scales, shadow/elevation recipes, color-token and dark-mode systems, motion
  timing, imagery treatment, the de-AI/de-generic playbook, and component-level
  polish for buttons, cards, forms, and navigation.
- **`references/conversion-and-retention.md`** — the conversion funnel, hero
  anatomy, CTA and pricing psychology, social proof, objection handling, form
  friction, scroll/retention mechanics, and e-commerce/Shopify-specific tactics.
- **`references/ux-laws.md`** — usability laws and Nielsen heuristics, each with
  concrete "how to apply it" guidance.

Read the relevant reference when a task goes deep in that area; the SKILL.md
above is enough for most quick audits and polish passes.
