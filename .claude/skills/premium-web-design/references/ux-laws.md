# UX Laws & Usability Heuristics — With Application

Reference for step 4 of the workflow and any usability critique. Each entry:
what it is, then how to *apply* it. Cite sparingly to the user — apply it in the
work.

## Psychology / interaction laws

**Aesthetic-Usability Effect** — Users perceive good-looking designs as more
usable and trustworthy.
→ This is the bridge between "premium look" and "converts." Investing in visual
craft directly raises perceived value and forgiveness of minor flaws. Never treat
polish as optional.

**Jakob's Law** — Users spend most of their time on *other* sites and expect
yours to work the same way.
→ Keep conventions where they belong: logo top-left links home, primary nav top,
cart/account top-right, footer for secondary links, search where expected.
Differentiate on value and content, not on relearning basic navigation.

**Hick's Law** — More choices → longer decision time.
→ Trim nav items, limit CTAs per view to one primary, keep pricing to ~3 tiers,
use progressive disclosure. Every removed choice speeds the decision.

**Fitts's Law** — Time to hit a target depends on its size and distance.
→ Make important actions large and near where attention already is. Tap targets
≥44px. Don't hide the primary CTA in a small, distant corner. Sticky CTAs keep the
target reachable.

**Miller's Law** — People hold ~7 (±2) items in working memory.
→ Chunk content: group nav into a few labeled clusters, break long forms into
steps, format phone/card numbers in groups. Don't present long flat lists.

**Law of Proximity (Gestalt)** — Things placed near each other are perceived as
related.
→ Control spacing to encode relationships: tight within a group, loose between
groups. Most "cluttered" layouts are really *proximity* failures.

**Law of Similarity (Gestalt)** — Visually similar elements are seen as a group.
→ Give same-type elements the same treatment (all cards alike, all links styled
alike). Use similarity to imply structure without borders/boxes everywhere.

**Law of Common Region (Gestalt)** — Elements inside a shared boundary are grouped.
→ Use a card, background tint, or container to bind related content — but don't
over-box; whitespace grouping (proximity) is often cleaner and more premium.

**Law of Prägnanz / Simplicity** — The eye prefers the simplest interpretation.
→ Simplify shapes, reduce visual noise, prefer clean layouts. Simplicity reads as
confidence and quality.

**Von Restorff Effect (Isolation)** — The element that differs is remembered.
→ Make the primary CTA visually distinct from everything around it. Don't dilute
by making many elements "stand out" — only the most important one should.

**Serial Position Effect** — People best remember the first and last items.
→ Put the most important nav links / list items / value points first and last.
Front-load and end strong.

**Peak-End Rule** — Experiences are judged by their peak and their end.
→ Design the emotional peak (the "wow" moment, the pricing/CTA decision) and the
ending (confirmation, first onboarding screen, thank-you) with special care —
they define the memory of the whole visit.

**Zeigarnik Effect** — Unfinished tasks stay on the mind.
→ Progress bars, checklists, "2 of 3 steps done," partially-filled profiles pull
users to complete. Great for onboarding and multi-step flows.

**Doherty Threshold** — Productivity and engagement rise when response is <400ms.
→ Keep interactions snappy; where real work takes time, use instant feedback,
skeletons, and optimistic UI so it *feels* immediate.

**Postel's Law (Robustness)** — Be liberal in what you accept, conservative in
what you output.
→ Accept messy input gracefully (any phone/date format), give clear, forgiving
errors, and reduce the user's burden of precision.

**Tesler's Law (Conservation of Complexity)** — Some complexity is irreducible;
the only question is who absorbs it.
→ Absorb complexity into the design/system so the user's experience stays simple.
Smart defaults, sensible presets, and doing the hard part for them.

## Nielsen's 10 usability heuristics (applied)

1. **Visibility of system status** — Always show what's happening: loading,
   saved, progress, active state. No dead-air after an action.
2. **Match between system and real world** — Use the user's language and mental
   models, not internal jargon. Order things the way they think.
3. **User control & freedom** — Easy undo, cancel, back, close. No traps; clear
   exits from every state.
4. **Consistency & standards** — Same words, patterns, and components mean the
   same thing everywhere (internal consistency) and match platform norms
   (external).
5. **Error prevention** — Prevent mistakes before they happen: constraints, good
   defaults, confirmations on destructive actions, disabled-until-valid.
6. **Recognition over recall** — Show options rather than making users remember;
   keep needed info visible; use clear labels and menus, not memorized commands.
7. **Flexibility & efficiency** — Shortcuts and accelerators for pros without
   blocking novices; let users tailor frequent actions.
8. **Aesthetic & minimalist design** — Every extra element competes with the
   essential ones. Remove anything that doesn't earn its place.
9. **Help users recognize, diagnose, recover from errors** — Plain-language error
   messages that say what went wrong and how to fix it — never codes alone.
10. **Help & documentation** — When needed, make it findable, task-focused, and
    concise; better still, design so it's rarely needed.

## Quick application order

When critiquing usability, sweep in this order: status visibility → convention
match (Jakob) → choice load (Hick) → grouping/hierarchy (Gestalt + proximity) →
target sizing (Fitts) → error prevention & recovery → minimalism. Most usability
problems fall out of these seven.
