# DuaCrypto — Figma design system

**Version:** 2025-05-21  
**Reference mockup:** [`../mockups/homepage-events-bitcoin.png`](../mockups/homepage-events-bitcoin.png)  
**Status:** Design phase only — do not implement in code until Figma frames are approved.

This document is the single source of truth for Figma **Variables**, **Text styles**, and **Components**. Token values mirror [`tokens.json`](tokens.json) for import plugins and future CSS in [`src/css/input.css`](../../src/css/input.css).

---

## 1. Brand & positioning

| Item | Value |
|------|--------|
| Brand name | **DuaCrypto** (one word in UI; avoid "Dua Crypto" split) |
| Tagline (footer) | Albania's first crypto community — education, events, Web3 |
| Primary audience | Albania / Balkans, beginners + builders |
| Primary CTA | **Join Our Next Event** → `events.html` |
| Hero H1 | **Albania's First Crypto Community** |
| Recommended subtitle | *Be your own bank — together in Tirana.* |
| Alt subtitles (A/B in Figma) | *Not your keys, not your coins. Learn both in our community.* · *Peer-to-peer money for peer-to-peer people.* |

---

## 2. Color variables

Create a **Color** collection in Figma with two modes: `Light` and `Dark`.

### Light mode

| Token | Hex | Usage |
|-------|-----|--------|
| `color/primary` | `#F7931A` | CTAs, icons, active nav, accents |
| `color/primary-hover` | `#E8850F` | Button hover, link hover |
| `color/primary-muted` | `#F7931A` @ 10% | Hover backgrounds, badges |
| `color/bg-page` | `#FFFFFF` | Page background |
| `color/bg-surface` | `#F8F9FA` | Alternate sections, nav mobile panel |
| `color/bg-card` | `#FFFFFF` | Cards, dropdowns |
| `color/bg-footer` | `#0B0B0F` | Footer only |
| `color/text-primary` | `#111111` | Headings, body |
| `color/text-secondary` | `#6B7280` | Supporting copy |
| `color/text-on-primary` | `#FFFFFF` | Text on orange buttons |
| `color/text-on-footer` | `#E5E7EB` | Footer body |
| `color/text-muted-footer` | `#9CA3AF` | Footer captions |
| `color/border` | `#E5E7EB` | Dividers, inputs |
| `color/border-strong` | `#D1D5DB` | Card outlines (optional) |

### Dark mode

| Token | Hex | Usage |
|-------|-----|--------|
| `color/primary` | `#F7931A` | Same as light |
| `color/primary-hover` | `#FFB347` | Lighter hover on dark |
| `color/bg-page` | `#0B0B0F` | Page background |
| `color/bg-surface` | `#14141A` | Nav, sections |
| `color/bg-card` | `#1E1E26` | Cards |
| `color/bg-footer` | `#0B0B0F` | Footer (can match page) |
| `color/text-primary` | `#F3F4F6` | Headings, body |
| `color/text-secondary` | `#9CA3AF` | Supporting copy |
| `color/border` | `#2D2D35` | Dividers, inputs |

### Partner brand accents (optional local styles)

| Partner | Accent | Card bg (light) |
|---------|--------|-----------------|
| Tangem | `#00B4D8` | `#E8F9FC` |
| Bitget | `#00F0FF` | `#E6FEFF` |
| Binance | `#F3BA2F` | `#FFF8E6` |

Use **icon-only** partner tiles in design — no product PNGs with white backgrounds.

---

## 3. Typography

**Fonts** (Google Fonts — already on site):

- **Roboto** — 500 (Medium), 700 (Bold) — display / headings / buttons  
- **Open Sans** — 400 (Regular), 500 (Medium) — body / nav / captions  

Install in Figma via Google Fonts plugin or add as local files.

### Text styles

| Style name | Font | Size | Line height | Weight | Letter spacing |
|------------|------|------|-------------|--------|----------------|
| `Display/H1` | Roboto | 48px (mobile 36px) | 120% | 700 | -0.02em |
| `Heading/H2` | Roboto | 32px | 130% | 700 | -0.01em |
| `Heading/H3` | Roboto | 24px | 140% | 700 | 0 |
| `Heading/H4` | Roboto | 20px | 140% | 500 | 0 |
| `Body/L` | Open Sans | 18px | 160% | 400 | 0 |
| `Body/M` | Open Sans | 16px | 160% | 400 | 0 |
| `Body/S` | Open Sans | 14px | 150% | 400 | 0 |
| `Caption` | Open Sans | 12px | 140% | 400 | 0.02em |
| `Nav/Link` | Open Sans | 16px | 100% | 500 | 0 |
| `Nav/Link-Active` | Open Sans | 16px | 100% | 500 | 0 + primary color |
| `Button/Label` | Roboto | 16px | 100% | 500 | 0 |
| `Button/Label-S` | Roboto | 14px | 100% | 500 | 0 |
| `Stat/Value` | Roboto | 36px | 120% | 700 | 0 |
| `Stat/Label` | Open Sans | 16px | 140% | 500 | primary color |

---

## 4. Spacing & layout

### Spacing scale (use for padding/gaps in auto-layout)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`

### Layout grid

| Breakpoint | Frame width | Columns | Margin | Gutter |
|------------|-------------|---------|--------|--------|
| Desktop | 1440px | 12 | 80px | 24px |
| Tablet | 768px | 8 | 32px | 16px |
| Mobile | 375px | 4 | 16px | 16px |

### Content max width

- **Section shell:** 1280px (`max-w-7xl`) centered — maps to `section-shell` in code  
- **Narrow content (FAQ, titles):** 896px (`max-w-4xl`)

### Section vertical rhythm

- Section padding Y: **64px** desktop, **48px** mobile  
- Hero padding Y: **80px** desktop, **48px** mobile  
- Between stacked blocks in hero: **16–24px**

---

## 5. Radius, border, shadow

| Token | Value | Usage |
|-------|-------|--------|
| `radius/sm` | 6px | Inputs |
| `radius/md` | 8px | Cards, accordion |
| `radius/lg` | 12px | Hero event card, large cards |
| `radius/xl` | 16px | Service cards |
| `radius/full` | 999px | Pills, social buttons, stat icons |

### Shadows (Figma effects)

| Name | Definition | Usage |
|------|------------|--------|
| `shadow/card` | Y 4, blur 12, #000 8% | Stat cards, feature tiles |
| `shadow/card-hover` | Y 8, blur 24, #000 12% | Hover state |
| `shadow/nav` | Y 2, blur 8, #000 6% | Sticky navbar |
| `shadow/event-card` | Y 12, blur 32, #000 15% | Floating hero RSVP card |

### Borders

- Default: 1px `color/border`  
- Focus ring (inputs): 2px `color/primary` @ 50% offset

---

## 6. Iconography

- **UI icons:** Font Awesome 6 Solid / Brands (match site)  
- **Sizes:** 16px inline, 20px nav chevron, 24px feature tiles, 48px stat circles  
- **Logo:** [`figma-assets/duacrypto-mark.svg`](figma-assets/duacrypto-mark.svg) — 42×42 nav, 45×45 footer  

**Social order (navbar + footer):** Telegram → X (Twitter) → YouTube → (footer also: Facebook, LinkedIn)

---

## 7. Components (build as Figma components with variants)

### 7.1 Button

| Variant | Fill | Text | Border | Min height |
|---------|------|------|--------|------------|
| Primary | `primary` | white | none | 48px |
| Primary hover | `primary-hover` | white | none | 48px |
| Outline | transparent | `text-primary` | 1px `border` | 48px |
| Ghost | transparent | `primary` | none | 44px |
| Nav CTA pill | `primary` | white | none | 40px, radius full, padding 12×20 |

Include trailing arrow icon variant for "Join Our Next Event →".

### 7.2 Nav link

- Default: `text-primary`, no underline  
- Hover: `primary` color  
- Active: `primary` + 2px bottom border or underline  

### 7.3 Navbar (component set)

Variants:

- `Desktop / Light`  
- `Desktop / Dark`  
- `Desktop / Scrolled` (add `shadow/nav`)  
- `Mobile / Closed`  
- `Mobile / Open` (full-width menu below bar)  
- `Stress / 1024` — verify brand truncates, no overlap with links  

**Structure:** Logo (mark + "DuaCrypto") | Links | Theme toggle (optional) | Social 3 | **Join Next Event** pill  

Remove "404 Other" from dropdown in final design. Dropdown label: **Other**.

### 7.4 Hero badge

- Pill: `bg-surface` or `primary-muted`, dot 8px `primary`, Caption text "Next event in Tirana"

### 7.5 Event card (hero overlay)

- Width ~320px, `radius/lg`, `shadow/event-card`  
- Rows: date, location, time — each with 20px orange icon  
- Full-width Primary button "RSVP Now →"  
- Caption "Spots are limited"

### 7.6 Stat card

- Icon circle 48px `primary` + white FA icon  
- `Stat/Value` + `Stat/Label`  
- Copy: **1,850+** Community Members · **65+** Events Since 2020 · **5+** Years Active

### 7.7 Feature tile (Why DuaCrypto — 6-up)

| # | Icon (FA) | Title |
|---|-----------|--------|
| 1 | graduation-cap | Web3 Education |
| 2 | users | Strong Community |
| 3 | microphone | Expert Speakers |
| 4 | calendar | Regular Events |
| 5 | globe | Global Vision |
| 6 | heart | Non-Profit Mission |

Grid: 6 columns desktop, 3×2 tablet, 2×3 mobile.

### 7.8 Past event card

- Image 16:9, `radius/lg`, optional caption overlay  
- Use photos from `figma-assets/balkans-crypto-2025-*.png`

### 7.9 Partner icon card (replaces slideshow)

- 3 cards, `bg-card`, centered brand name + FA icon only  
- No product photography, no carousel  

### 7.10 FAQ accordion item

- Closed: `bg-surface`, `Body/M` question  
- Open: question bar `primary` + white text; panel `bg-page` / `Body/M` answer  
- Min touch target 44px height on question row  

### 7.11 Newsletter (footer)

- `Body/M` description  
- Input: min height 48px, `radius/sm`  
- Submit: Primary button "Subscribe" or "Sign Up"  
- Form action (for dev): `https://formspree.io/f/xnnpkkqo`

### 7.12 Footer

- Background `bg-footer`  
- 4 columns desktop: Brand + blurb | Quick links ×2 | Follow + social | Newsletter  
- Contact: **Tirana, Albania** · **info@duacrypto.com**  
- Copyright: © DuaCrypto, All Rights Reserved · Designed by DuaCrypto  

### 7.13 Bootstrap chrome (inner pages)

Match Tailwind homepage nav/footer visually:

- Bootstrap navbar: white/`bg-surface`, `duacrypto-mark.svg`, same link order  
- Footer: 5-column Bootstrap grid from live `about.html` pattern  

See [`../mockups/bootstrap-chrome.png`](../mockups/bootstrap-chrome.png).

---

## 8. Homepage section order (desktop)

1. Navbar  
2. Hero (2-col: copy + image with event card)  
3. Stats (3 cards)  
4. Why DuaCrypto (6 tiles)  
5. Past Events (3 gallery + link)  
6. Trusted Partners (3 icon cards) — **not** affiliate slideshow  
7. FAQ (4–5 items; prefer 4 event-focused for parity with mockup)  
8. Footer  

Optional later sections (not in primary mockup): About founder (`kane-profile.png`), As Seen On logos, Services grid.

---

## 9. Accessibility

- Minimum contrast: **4.5:1** body text, **3:1** large text/UI  
- Orange `#F7931A` on white: use for large text/CTAs; pair with `#111` for small orange-on-white labels  
- Tap targets: **44×44px** minimum (nav toggle, social, accordion)  
- Focus: 2px outline `primary` on interactive elements  

---

## 10. Export rules (Ready for dev page)

| Asset | Format | Scale |
|-------|--------|-------|
| Logo mark | SVG | 1× |
| Event photos | PNG | 2× |
| OG image (future) | PNG | 1200×630 |

Annotate frames with: spacing numbers, color token names, font style names, and **placeholder** vs **final** image flag.

---

## 11. Related files

- [`figma-frame-checklist.md`](figma-frame-checklist.md) — frames to create  
- [`tokens.json`](tokens.json) — importable tokens  
- [`figma-to-code-map.md`](figma-to-code-map.md) — component → CSS class map  
- [`figma-assets/README.md`](figma-assets/README.md) — drag-and-drop images  
- [`../MISSING-ASSETS.md`](../MISSING-ASSETS.md) — placeholders for missing files
