# SmartHire — Frontend Design System Reference

Complete documentation of every visual, interactive, and structural design decision in the SmartHire frontend.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Color System](#2-color-system)
3. [CSS Design Tokens](#3-css-design-tokens)
4. [Dark Mode](#4-dark-mode)
5. [Typography](#5-typography)
6. [Spacing & Sizing](#6-spacing--sizing)
7. [Border Radius](#7-border-radius)
8. [Shadows](#8-shadows)
9. [Glassmorphism](#9-glassmorphism)
10. [Animations & Keyframes](#10-animations--keyframes)
11. [Framer Motion Patterns](#11-framer-motion-patterns)
12. [Background Decorations](#12-background-decorations)
13. [UI Components](#13-ui-components)
14. [Form Styles](#14-form-styles)
15. [Badge System](#15-badge-system)
16. [Tooltips](#16-tooltips)
17. [Toast / Notifications](#17-toast--notifications)
18. [Status & Domain Colors](#18-status--domain-colors)
19. [Gradient Text](#19-gradient-text)
20. [Scrollbar](#20-scrollbar)
21. [Layout & Page Shells](#21-layout--page-shells)
22. [Usability Patterns](#22-usability-patterns)
23. [Accessibility](#23-accessibility)

---

## 1. Tech Stack

| Library | Version | Role |
|---|---|---|
| React | 19.2.0 | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Framer Motion | 12.38.0 | Complex animations |
| Lucide React | 0.487.0 | Icon library |
| React Router DOM | 7.13.1 | Client-side routing |
| clsx + tailwind-merge | latest | Class merging utility |
| Inter (Google Fonts) | — | Primary typeface |

Config files: [tailwind.config.cjs](tailwind.config.cjs) · [src/styles/globals.css](src/styles/globals.css)

---

## 2. Color System

### Brand Palette (Indigo-based)

The primary brand identity is built on **Indigo 500 (`#6366f1`)** — all CTAs, highlights, focus rings, and interactive states reference this anchor.

| Token | Hex | Use |
|---|---|---|
| `brand-50` | `#eef2ff` | Tinted backgrounds, hover states |
| `brand-100` | `#e0e7ff` | Light tint backgrounds |
| `brand-200` | `#c7d2fe` | Borders at low opacity |
| `brand-300` | `#a5b4fc` | Muted accents |
| `brand-400` | `#818cf8` | Secondary highlights, dark-mode text |
| `brand-500` | `#6366f1` | **Primary brand** — buttons, focus rings, icons |
| `brand-600` | `#4f46e5` | CTA buttons, active states |
| `brand-700` | `#4338ca` | Hover on CTAs |
| `brand-800` | `#3730a3` | Deep brand, pressed states |
| `brand-900` | `#312e81` | Darkest, rarely used |

### Extended Semantic Colors Used Across the App

| Color | Hex | Context |
|---|---|---|
| Emerald-400 | `#34d399` | Success, HIRED status, shortlisted |
| Emerald-500 | `#10b981` | New applications badge, positive scores |
| Amber-400 | `#fbbf24` | OFFER stage, warning states |
| Amber-500 | `#f59e0b` | Contract jobs, mid-level experience |
| Rose-500 | `#f43f5e` | Danger button, error states |
| Red-400 | `#f87171` | REJECTED status |
| Sky-400 | `#38bdf8` | REVIEW stage |
| Indigo-400 | `#818cf8` | INTERVIEWING stage |
| Cyan-400 | `#2dd4bf` | HIRED stage alternate |
| Orange-500 | `#f97316` | Recruiter gradient, TEMPORARY jobs |
| Pink-400 | `#ec4899` | Brand gradient endpoint |
| Purple-500 | `#8b5cf6` | Brand secondary, PART_TIME jobs |
| Slate-900 | `#0f172a` | Dark backgrounds (PDF) |

---

## 3. CSS Design Tokens

Defined in [src/styles/globals.css](src/styles/globals.css). These drive every Tailwind `bg-surface-*` and `text-*` class.

### Light Mode (`:root`)

```css
/* Surfaces */
--surface-base:          #ffffff;
--surface-subtle:        #f8f9fc;
--surface-muted:         #f1f3f9;
--surface-border:        rgba(0, 0, 0, 0.08);
--surface-border-strong: rgba(0, 0, 0, 0.14);

/* Text */
--text-primary:    #0a0a0b;
--text-secondary:  #52525b;
--text-tertiary:   #a1a1aa;

/* Brand */
--brand-primary:   #6366f1;
--brand-secondary: #8b5cf6;

/* Gradients */
--brand-gradient:     linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
--candidate-gradient: linear-gradient(135deg, #3B82F6 0%, #38BDF8 100%);
--recruiter-gradient: linear-gradient(135deg, #f97316 0%, #ec4899 100%);

/* Shadows */
--shadow-premium:    0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
--shadow-premium-lg: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.06);
--shadow-glow:       0 0 24px rgba(99,102,241,0.18);
--shadow-glow-sm:    0 0 14px rgba(99,102,241,0.14);
```

### Brand Mesh Gradient

A four-corner radial gradient used on page backgrounds for subtle depth:

```css
--brand-mesh:
  radial-gradient(at 0%   0%,   rgba(99,102,241,0.14) 0px, transparent 50%),
  radial-gradient(at 100% 0%,   rgba(139,92,246,0.14) 0px, transparent 50%),
  radial-gradient(at 100% 100%, rgba(236,72,153,0.10) 0px, transparent 50%),
  radial-gradient(at 0%   100%, rgba(99,102,241,0.12) 0px, transparent 50%);
```

---

## 4. Dark Mode

**Trigger:** Adding `dark` class to `<html>` — controlled by [src/lib/theme/ThemeContext.tsx](src/lib/theme/ThemeContext.tsx).  
**Persistence:** `localStorage` key `smarthire-theme`.  
**Default:** Light mode.

```css
.dark {
  --surface-base:          #050507;
  --surface-subtle:        #09090c;
  --surface-muted:         #111116;
  --surface-border:        rgba(255,255,255,0.07);
  --surface-border-strong: rgba(255,255,255,0.12);

  --text-primary:    #f4f4f5;
  --text-secondary:  #a1a1aa;
  --text-tertiary:   #52525b;     /* note: inverted vs light */

  --shadow-premium:    0 4px 16px rgba(0,0,0,0.40);
  --shadow-premium-lg: 0 12px 40px rgba(0,0,0,0.60);
  --shadow-glow:       0 0 32px rgba(99,102,241,0.22);
  --shadow-glow-sm:    0 0 18px rgba(99,102,241,0.16);
}
```

### Dark-Mode Brand Mesh (reduced opacity)

```css
.dark {
  --brand-mesh:
    radial-gradient(at 0%   0%,   rgba(99,102,241,0.10) …),
    radial-gradient(at 100% 0%,   rgba(139,92,246,0.10) …),
    radial-gradient(at 100% 100%, rgba(236,72,153,0.07) …),
    radial-gradient(at 0%   100%, rgba(99,102,241,0.09) …);
}
```

### ThemeToggle Component

Located at [src/components/ui/ThemeToggle.tsx](src/components/ui/ThemeToggle.tsx).

- **Light mode appearance:** White background, slate-600 Moon icon, `border-slate-200`
- **Dark mode appearance:** `bg-white/[0.06]`, amber-300 Sun icon, `border-white/10`
- **Icon animation:** `rotate-12` on hover in dark mode
- **Sizes:** `sm` (36px) · `md` (40px, default) · `lg` (44px)

---

## 5. Typography

### Font Family

```
Inter — weights: 300, 400, 500, 600, 700, 800, 900
Source: Google Fonts
Fallback: system-ui, -apple-system, sans-serif
```

Applied as both `font-sans` and `font-display` in Tailwind config.

### Body Rendering

```css
body {
  font-feature-settings: "cv02","cv03","cv04","cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Text Scale Used

| Class | Size | Weight |
|---|---|---|
| `text-xs` | 0.75rem | Labels, badges, captions |
| `text-sm` | 0.875rem | Body copy, form inputs |
| `text-base` | 1rem | Standard paragraphs |
| `text-lg` | 1.125rem | Subheadings |
| `font-medium` | 500 | Secondary labels |
| `font-semibold` | 600 | Buttons, nav links |
| `font-bold` | 700 | Headings |
| `font-black` | 900 | Hero text, stat numbers |

### Letter Spacing Patterns

- `tracking-widest` — Dropdown labels, section headers
- `tracking-[0.18em]` — Loader label text
- `tracking-[0.12em]` — Badge text (uppercase)
- `tracking-[0.03em]` — Tooltip text

---

## 6. Spacing & Sizing

Standard Tailwind scale with these common patterns:

| Pattern | Value | Where |
|---|---|---|
| `gap-2` | 0.5rem | Tight icon+label rows |
| `gap-3` | 0.75rem | Standard row gaps |
| `gap-4` | 1rem | Card internal spacing |
| `px-4 py-2.5` | — | Compact input fields |
| `px-6 py-3` | — | Standard buttons |
| `p-5` | 1.25rem | Card padding |
| `p-6 md:p-8` | — | Responsive section padding |
| `p-1.5` | — | Dropdown panel inner padding |

---

## 7. Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded-lg` | 0.5rem | Small elements, form controls |
| `rounded-xl` | 0.75rem | Buttons, inputs |
| `rounded-2xl` | 1rem | Cards, dropdowns, modals |
| `rounded-[1rem]` | 1rem | Select elements |
| `rounded-[2rem]` | 2rem | Premium cards |
| `rounded-[2.25rem]` | 2.25rem | Job cards |
| `rounded-[2.5rem]` | 2.5rem | Analytics sections |
| `rounded-[3rem]` | 3rem | Large homepage sections |
| `rounded-4xl` | 2rem | Custom Tailwind extension |
| `rounded-5xl` | 2.5rem | Custom Tailwind extension |
| `rounded-full` | 9999px | Pills, badges, avatar rings |

---

## 8. Shadows

All defined in `tailwind.config.cjs` `boxShadow` extend block and as CSS variables.

### Tailwind Shadow Classes

| Class | Value | Use |
|---|---|---|
| `shadow-glow-sm` | `0 0 20px rgba(99,102,241,0.20)` | Brand buttons, focused inputs |
| `shadow-glow` | `0 0 40px rgba(99,102,241,0.25)` | Hero sections, modals |
| `shadow-glow-lg` | `0 0 80px rgba(99,102,241,0.30)` | Full-screen overlays |
| `shadow-card` | `0 4px 24px rgba(15,23,42,0.06), 0 1px 4px …` | Default card elevation |
| `shadow-card-hover` | `0 12px 40px rgba(15,23,42,0.10), 0 2px 8px …` | Card hover elevation |
| `shadow-glass` | `0 8px 32px rgba(99,102,241,0.12)` | Glass panels |
| `shadow-glass-lg` | `0 16px 60px rgba(99,102,241,0.18)` | Large glass panels |
| `shadow-premium` | `0 4px 6px -1px rgba(0,0,0,0.04), …` | Subtle elevation |
| `shadow-premium-lg` | `0 20px 25px -5px rgba(0,0,0,0.06), …` | Strong premium elevation |

### Dark Mode Card Shadow Override

```css
.dark .premium-card {
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04),
              0 8px 32px rgba(0,0,0,0.55),
              0 2px 8px rgba(0,0,0,0.35);
}
```

---

## 9. Glassmorphism

### `.glass-premium` — Floating panels, modals

```css
/* Light */
backdrop-filter: blur(20px) saturate(180%);
background: rgba(255,255,255,0.72);
border: 1px solid rgba(255,255,255,0.3);

/* Dark */
background: rgba(12,12,18,0.60);
border: 1px solid rgba(255,255,255,0.06);
```

### `.glass-nav` — Navigation bar

```css
/* Light */
backdrop-filter: blur(16px) saturate(160%);
background: rgba(255,255,255,0.82);
border-bottom: 1px solid var(--surface-border);

/* Dark */
background: rgba(5,5,7,0.82);
```

### `.premium-card` — Standard content cards

```css
backdrop-filter: blur(16px) saturate(150%);
transition: box-shadow 0.2s ease, border-color 0.2s ease;
```

### Backdrop Blur Scale

| Class | Blur |
|---|---|
| `backdrop-blur-xs` | 2px (custom) |
| `backdrop-blur-xl` | 24px (Tailwind default) |
| `backdrop-blur-2xl` | 40px |
| `backdrop-blur-3xl` | 64px |

---

## 10. Animations & Keyframes

### Tailwind `animate-*` Classes

| Class | Keyframe | Duration | Easing | Use |
|---|---|---|---|---|
| `animate-fade-in` | `fadeIn` | 0.35s | ease-out | General appear |
| `animate-slide-up` | `slideUp` | 0.35s | ease-out | Cards, modals entering from below |
| `animate-slide-down` | `slideDown` | 0.25s | ease-out | Dropdowns, alerts entering from above |
| `animate-pulse-slow` | `pulse` | 3s | cubic-bezier(0.4,0,0.6,1) | Skeleton loaders |
| `animate-spin-slow` | `spin` | 3s | linear | Subtle loading states |
| `animate-shimmer` | `shimmer` | 2s | linear | Skeleton shimmer effect |
| `animate-bounce-sm` | `bounceSm` | 1s | — | Micro-bounce indicators |
| `animate-gradient-x` | `gradientX` | 4s | ease | Animated gradient backgrounds |
| `animate-toast-in` | `toastIn` | 0.35s | cubic-bezier(0.16,1,0.3,1) | Toast appear from right |
| `animate-toast-out` | `toastOut` | 0.2s | ease-in | Toast exit to right |
| `animate-notification-ping` | `notifPing` | 1.5s | ease-out | Notification dot pulse |
| `animate-marquee` | `marquee` | 30s | linear | Horizontal scrolling content |
| `animate-marquee-reverse` | `marquee` | 30s | linear reverse | Reverse marquee |

### Keyframe Definitions

```javascript
fadeIn:    { from: opacity 0, to: opacity 1 }
slideUp:   { from: opacity 0 + translateY(14px), to: opacity 1 + translateY(0) }
slideDown: { from: opacity 0 + translateY(-10px), to: opacity 1 + translateY(0) }
shimmer:   { from: backgroundPosition "-200% 0", to: "200% 0" }
bounceSm:  { 0%/100%: translateY(-3px), 50%: translateY(0) }
gradientX: { 0%/100%: backgroundPosition left, 50%: right } (200% 200% size)
toastIn:   { from: opacity 0 + translateX(100%) scale(0.95), to: opacity 1 + translateX(0) scale(1) }
toastOut:  { reverse of toastIn }
notifPing: { 0%: scale(1) opacity(1), 75%/100%: scale(2) opacity(0) }
marquee:   { from: translateX(0), to: translateX(-50%) }
```

### Global CSS Animations (in globals.css)

```css
/* Float — used on decorative hero elements */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

/* Fade-in-up — general content entrance */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fade-in-up 0.45s ease-out both; }

/* Toast Enter/Exit */
@keyframes toast-enter {
  from { opacity: 0; transform: translateX(calc(100% + 1.5rem)) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
.toast-enter { animation: toast-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

@keyframes toast-exit {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(calc(100% + 1.5rem)) scale(0.95); }
}
.toast-exit { animation: toast-exit 0.2s ease-in forwards; }
```

### Animation Timing Quick Reference

| Duration | Use |
|---|---|
| 0.15s | Tooltip fade, micro-interactions |
| 0.2s | Border/color transitions, toast exit |
| 0.25s | Slide-down dropdowns |
| 0.3s | Theme switch, gradual hovers |
| 0.35s | Toast entrance, fade-in |
| 0.45s | Content `.animate-in` |
| 0.8s | Framer Motion hero sections |
| 1s | Bounce loop |
| 1.5s | Notification ping loop |
| 2s | Shimmer skeleton loop |
| 3s | Slow pulse/spin |
| 4s | Gradient-X loop |
| 6s | Float loop |
| 30s | Marquee scroll |

---

## 11. Framer Motion Patterns

Used for complex entrance animations, scroll-linked effects, and interactive cursor tracking. Located primarily in [src/features/home/pages/HomePage.tsx](src/features/home/pages/HomePage.tsx).

### Shared Variants

```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8 }
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
```

### Cursor Glow Effect (Homepage)

```typescript
// Framer spring-based cursor tracking
const springX = useSpring(x, { stiffness: 50, damping: 20, mass: 0.5 });
const springY = useSpring(y, { stiffness: 50, damping: 20, mass: 0.5 });
// Renders a 600×600 rounded div with bg-brand-500/15 blur-[120px]
// Follows mouse with smooth spring physics
```

### Scroll-Linked Transforms

```typescript
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
// Used for parallax effects on hero sections
```

### AnimatePresence

Used with modals, drawers, and conditional panels for mount/unmount transitions.

---

## 12. Background Decorations

### `.premium-grid`

Subtle dot grid overlay:

```css
background-image: radial-gradient(var(--surface-border) 1px, transparent 1px);
background-size: 32px 32px;
```

### `.mesh-bg`

Four-corner brand radial gradient (see [CSS Design Tokens](#3-css-design-tokens)).

### `.status-rail`

Horizontal gradient bar for pipeline progress:

```css
background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%);
```

### Inline Decorative Gradients (used in pages)

```
Hero glow blob: bg-brand-500/15 blur-[120px] (600×600px, cursor-following)
Section background: mix of mesh-bg + premium-grid
Auth page background: #0f1020 (very dark, near-black)
```

---

## 13. UI Components

All reusable components live in [src/components/ui/](src/components/ui/).

### Button ([src/components/ui/Button.tsx](src/components/ui/Button.tsx))

**Base classes:** `inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none`

| Variant | Light appearance | Dark appearance |
|---|---|---|
| `primary` | `bg-slate-900 text-white` hover `bg-slate-800` | `bg-white text-slate-900` |
| `secondary` | `bg-brand-600 text-white` hover `bg-brand-700` | Same |
| `outline` | Transparent + `border-surface-border` | Same (token adapts) |
| `ghost` | Transparent, `text-text-secondary` hover `bg-surface-subtle` | Same |
| `danger` | `bg-rose-500 text-white` hover `bg-rose-600` | Same |
| `glass` | `bg-white/10` border `white/20` hover `bg-white/20` | `bg-black/20` hover `bg-black/30` |

| Size | Height | Padding | Radius |
|---|---|---|---|
| `sm` | h-9 (36px) | px-4 | rounded-xl |
| `md` | h-11 (44px) | px-6 | rounded-xl |
| `lg` | h-13 (52px) | px-8 | rounded-2xl |
| `xl` | h-15 (60px) | px-10 | rounded-2xl |

**Loading state:** Spinning `border-2 border-current border-t-transparent` ring (16px), replaces left icon.

### Input ([src/components/ui/Input.tsx](src/components/ui/Input.tsx))

```
h-11 w-full rounded-xl
border border-surface-border
bg-white/50 dark:bg-black/20
text-sm text-text-primary
placeholder:text-text-secondary
focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500
transition-all
```

### DropdownSelect ([src/components/ui/DropdownSelect.tsx](src/components/ui/DropdownSelect.tsx))

A fully custom portal-rendered dropdown with:
- **Trigger:** `rounded-2xl border-surface-border bg-surface-subtle`, hover `border-brand-500/40`, focus `ring-2 ring-brand-500/20`
- **ChevronDown** rotates 180° when open
- **Panel:** portal-rendered at `z-index: 99999`, `rounded-2xl`, `shadow-[0_20px_60px_-10px_rgba(0,0,0,0.30)]`
- **Item hover:** `hover:bg-brand-500/[0.08]`
- **Item selected:** `bg-brand-500/10`, label turns `text-brand-600`
- **Enter animation:** `animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150` (flips to `slide-in-from-bottom-2` when opening upward)
- **Smart positioning:** Flips above trigger if insufficient space below; clamps to viewport edges
- **Keyboard:** Escape closes, outside-click closes

### SmartSelect ([src/components/ui/SmartSelect.tsx](src/components/ui/SmartSelect.tsx))

Native `<select>` element using `.premium-select` CSS class (see [Form Styles](#14-form-styles)).

### SmartHireLoader ([src/components/ui/SmartHireLoader.tsx](src/components/ui/SmartHireLoader.tsx))

Branded loading spinner:
- **Outer ring:** `animate-spin`, border top `#6366f1` (brand-500), border right `#ec4899` (pink-400), others transparent
- **Inner icon:** `animate-pulse` SmartHire chain logo on `bg-surface-base`

| Size | Ring | Logo |
|---|---|---|
| `sm` | h-9 w-9 border-[2.5px] | h-5 w-5 |
| `md` | h-14 w-14 border-[3px] | h-8 w-8 |
| `lg` | h-20 w-20 border-[3.5px] | h-12 w-12 |

### ThemeToggle ([src/components/ui/ThemeToggle.tsx](src/components/ui/ThemeToggle.tsx))

See [Dark Mode](#4-dark-mode) section above.

### Checkbox ([src/components/ui/Checkbox.tsx](src/components/ui/Checkbox.tsx))

Standard HTML checkbox with brand focus ring.

### Label ([src/components/ui/Label.tsx](src/components/ui/Label.tsx))

Form label, standard sizing.

### ErrorMessage ([src/components/ui/ErrorMessage.tsx](src/components/ui/ErrorMessage.tsx))

Red error display for form validation feedback.

### LocationInput ([src/components/ui/LocationInput.tsx](src/components/ui/LocationInput.tsx))

Specialized input for location fields.

---

## 14. Form Styles

### `.premium-input`

```css
border-radius: 0.75rem;          /* rounded-xl */
border: 1px solid var(--surface-border);
background: var(--surface-subtle);
padding: 0.625rem 1rem;
font-size: 0.875rem;
transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;

:focus {
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  background: var(--surface-base);
}
::placeholder { color: var(--text-tertiary); }
```

Dark mode: `background: var(--surface-muted)`, focus `border-color: rgba(99,102,241,0.55)`

### `.premium-select` (with left icon slot)

```css
border-radius: 1rem;
border: 1.5px solid var(--surface-border);
background: var(--surface-subtle);
font-weight: 700;
padding: 0.75rem 2.5rem 0.75rem 2.75rem;   /* left room for icon */
transition: border-color 0.2s ease, box-shadow 0.2s ease;

:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
```

### `.premium-select-bare` (no left icon)

Same as above with `padding: 0.6rem 2.5rem 0.6rem 1rem`.

### `.premium-focus-ring`

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
}
```

---

## 15. Badge System

### Base `.badge`

```css
display: inline-flex; align-items: center; gap: 0.375rem;
padding: 0.2rem 0.65rem;
border-radius: 99px;
font-size: 0.7rem; font-weight: 700;
text-transform: uppercase; letter-spacing: 0.12em;
border: 1px solid transparent; white-space: nowrap;
```

### Badge Color Variants

| Class | Light bg | Light border | Light text | Dark text |
|---|---|---|---|---|
| `.badge-brand` | `rgba(99,102,241,0.10)` | `rgba(99,102,241,0.22)` | `#4f46e5` | `#818cf8` |
| `.badge-emerald` | `rgba(16,185,129,0.10)` | `rgba(16,185,129,0.22)` | `#059669` | `#34d399` |
| `.badge-amber` | `rgba(245,158,11,0.10)` | `rgba(245,158,11,0.22)` | `#d97706` | `#fbbf24` |
| `.badge-rose` | `rgba(239,68,68,0.10)` | `rgba(239,68,68,0.22)` | `#dc2626` | `#f87171` |
| `.badge-slate` | `rgba(100,116,139,0.10)` | `rgba(100,116,139,0.20)` | `#475569` | `#94a3b8` |

---

## 16. Tooltips

CSS-only via `data-tooltip` attribute. No JS required.

```css
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%; transform: translateX(-50%) scale(0.92);
  padding: 0.35rem 0.75rem; border-radius: 0.625rem;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.03em;
  background: var(--surface-base); color: var(--text-primary);
  border: 1px solid var(--surface-border-strong);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 9999;
}
[data-tooltip]:hover::after {
  opacity: 1; transform: translateX(-50%) scale(1);
}
```

Dark mode: `background: var(--surface-muted)` with heavier shadow.

---

## 17. Toast / Notifications

**Context:** [src/lib/toast/ToastContext.tsx](src/lib/toast/ToastContext.tsx)

### Toast Types

| Type | Color | Icon |
|---|---|---|
| `success` | Green / Emerald | CheckCircle |
| `error` | Red / Rose | XCircle |
| `info` | Blue / Sky | InfoCircle |
| `warning` | Orange / Amber | AlertTriangle |

### Toast Behavior

- Default duration: **4000ms** auto-dismiss
- Maximum visible: **5 toasts** simultaneously
- Enter: slides in from right with spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`)
- Exit: slides back out right with `ease-in`
- CSS classes: `.toast-enter` / `.toast-exit`
- Tailwind: `animate-toast-in` / `animate-toast-out`

### Notification Ping

Unread/new indicators use `animate-notification-ping`:

```css
notifPing: {
  "0%":      { transform: "scale(1)", opacity: "1" },
  "75%,100%": { transform: "scale(2)", opacity: "0" }
}
/* Duration: 1.5s ease-out infinite */
```

---

## 18. Status & Domain Colors

### Application Pipeline Status

| Stage | Color | Hex |
|---|---|---|
| SUBMITTED | Slate-400 | `#94a3b8` |
| REVIEW | Sky-400 | `#38bdf8` |
| SHORTLISTED | Emerald-400 | `#34d399` |
| INTERVIEWING | Indigo-400 | `#818cf8` |
| OFFER | Amber-400 | `#fbbf24` |
| HIRED | Cyan-400 | `#2dd4bf` |
| REJECTED | Red-400 | `#f87171` |

### Job Type Colors

| Type | Color | Hex |
|---|---|---|
| FULL_TIME | Indigo-500 (Brand) | `#6366f1` |
| PART_TIME | Purple-500 | `#8b5cf6` |
| CONTRACT | Amber-500 | `#f59e0b` |
| INTERN | Emerald-500 | `#10b981` |
| TEMPORARY | Orange-500 | `#f97316` |

### Experience Level Colors

| Level | Color | Hex |
|---|---|---|
| ENTRY | Emerald-300 | `#6ee7b7` |
| JUNIOR | Brand-500 | `#6366f1` |
| MID | Amber-500 | `#f59e0b` |
| SENIOR | Orange-500 | `#f97316` |
| EXECUTIVE | Red-500 | `#ef4444` |

### Currency Colors

| Currency | Color | Hex |
|---|---|---|
| USD | Green-500 | `#22c55e` |
| EUR | Blue-500 | `#3b82f6` |
| GBP | Purple-500 | `#8b5cf6` |
| AUD | Amber-500 | `#f59e0b` |
| CAD | Red-500 | `#ef4444` |
| SGD | Pink-500 | `#ec4899` |
| LKR | Teal-500 | `#14b8a6` |
| INR | Orange-500 | `#f97316` |
| NZD | Cyan-500 | `#06b6d4` |

### AI Score Indicator Colors

| Score | Color |
|---|---|
| ≥ 75 | Green `#10b981` |
| Partial | Amber `#f59e0b` |
| Low/None | Indigo `#6366f1` |

---

## 19. Gradient Text

CSS utility classes for gradient-filled text. Applied via `background-clip: text`.

```css
/* Brand — Indigo → Purple → Pink */
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Candidate — Blue → Sky */
.candidate-gradient-text {
  background: linear-gradient(135deg, #3B82F6 0%, #38BDF8 100%);
  …
}

/* Recruiter — Orange → Pink */
.recruiter-gradient-text {
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  …
}
```

---

## 20. Scrollbar

Custom scrollbar styling applied globally:

```css
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: var(--surface-border-strong); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
```

Hide scrollbar utility (keeps scroll functionality):

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

---

## 21. Layout & Page Shells

### App-Wide Layout

| Component | Location | Role |
|---|---|---|
| `PortalShell` | [src/components/layout/PortalShell.tsx](src/components/layout/PortalShell.tsx) | Main app shell, navigation |
| `RecruiterPageShell` | [src/components/layout/RecruiterPageShell.tsx](src/components/layout/RecruiterPageShell.tsx) | Recruiter-specific page wrapper |
| `CandidatePageShell` | [src/features/seeker/pages/components/CandidatePageShell.tsx](src/features/seeker/pages/components/CandidatePageShell.tsx) | Candidate portal wrapper |

### Page Features

| Page | Key Visual Elements |
|---|---|
| **HomePage** | Cursor glow (Framer Motion spring), scroll parallax, stagger card reveals, `animate-float` hero blobs, marquee tech strip |
| **LoginPage / SignUpPage** | Dark `#0f1020` bg, glassmorphism form card, brand gradient logo |
| **CandidateDashboard** | Status pipeline rail (`.status-rail`), mesh-bg sections, premium cards |
| **RecruiterDashboard** | Kanban-style applicant columns, color-coded status badges |
| **JobSearchPage** | Filterable grid of job cards with hover glow effects |
| **JobDetailPage** | Full-width hero banner, badge clusters, gradient CTA |
| **AnalyticsPage** | Recharts data viz, color-coded metrics, rounded-[2.5rem] sections |
| **ApplicationTrackerPage** | Pipeline stepper, status color coding |
| **RecommendationsPage** | Match score indicators, gradient score rings |

---

## 22. Usability Patterns

### Interactive Feedback

- **Active scale:** `active:scale-95` on all buttons — tactile press feedback
- **Hover elevation:** Cards transition from `shadow-card` → `shadow-card-hover`
- **Border accent on hover:** `hover:border-brand-500/25` on job cards
- **Transition standard:** All interactive elements use `transition-all duration-200` or `transition-colors`

### Loading States

- **Buttons:** Inline spinner (border-ring technique) replaces left icon
- **Pages:** `SmartHireLoader` with branded animated ring
- **Content:** Tailwind `animate-shimmer` skeleton screens

### Navigation

- **Nav links (HomePage):** Underline-grow hover — `w-0 → w-full` via `transition-all duration-300`
- **Portal nav:** Glassmorphism bar (`.glass-nav`) with scroll-aware opacity
- **Mobile nav:** `AnimatePresence` slide-in drawer

### Dropdown / Select UX

- **Smart portal positioning:** DropdownSelect calculates viewport space and flips above trigger when needed
- **Keyboard support:** Escape to close
- **Outside click:** Closes any open dropdown
- **Visual feedback:** ChevronDown rotates 180° on open, selected items get brand tint background

### Error Handling

- **Form errors:** Red `ErrorMessage` component below invalid fields
- **API errors:** Toast notifications (error type)
- **Empty states:** Illustrated placeholders with CTA buttons

### Theme Switching

- Instant CSS variable swap — no flash on toggle
- Persisted to `localStorage`
- All components respond to `.dark` class via Tailwind's dark-mode variant

---

## 23. Accessibility

### Built-in Patterns

| Pattern | Implementation |
|---|---|
| `aria-label` | All icon-only buttons (ThemeToggle, close buttons) |
| `aria-haspopup="listbox"` + `aria-expanded` | DropdownSelect trigger |
| `role="listbox"` + `role="option"` + `aria-selected` | DropdownSelect panel items |
| `role="status"` | SmartHireLoader (with accessible `aria-label`) |
| Focus rings | `focus-visible:ring-2 ring-brand-500/20` on all inputs |
| `disabled:opacity-50 disabled:pointer-events-none` | All disabled form controls |
| `scroll-behavior: smooth` | Applied globally to `html` |
| `prefers-reduced-motion` | Not currently implemented — opportunity for improvement |

### Color Contrast Notes

- Primary text `#0a0a0b` on `#ffffff` → passes WCAG AA
- Secondary text `#52525b` on `#f8f9fc` → check contrast for small text
- Brand-500 `#6366f1` on white — borderline; use darker `brand-600/700` for small text CTAs
