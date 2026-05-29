# Figma frame checklist — DuaCrypto

Use this checklist when building the Figma file. Check off each frame when complete. **Do not request code implementation** until the [Approval section](#approval-before-code) is signed off.

**References:**

- Design system: [`figma-design-system.md`](figma-design-system.md)
- Tokens: [`tokens.json`](tokens.json)
- Light desktop mockup: [`../mockups/homepage-events-bitcoin.png`](../mockups/homepage-events-bitcoin.png)
- Dark desktop: [`../mockups/homepage-desktop-dark.png`](../mockups/homepage-desktop-dark.png)
- Mobile light: [`../mockups/homepage-mobile-light.png`](../mockups/homepage-mobile-light.png)
- Bootstrap chrome: [`../mockups/bootstrap-chrome.png`](../mockups/bootstrap-chrome.png)

---

## Figma file pages (create in order)

| Page | Purpose |
|------|---------|
| `00 — Cover` | Project name, duacrypto.com, version date, link to this repo `docs/design/` |
| `01 — Foundations` | Color variables (light/dark), text styles, spacing, icons |
| `02 — Components` | All components from design system §7 |
| `03 — Homepage` | Full page frames (all breakpoints + modes) |
| `04 — Templates` | Bootstrap nav + footer, Events hero strip |
| `05 — Ready for dev` | Annotated copies with spacing + token names |

---

## 01 — Foundations frames

- [ ] **Colors / Light** — all tokens from `tokens.json` swatches
- [ ] **Colors / Dark** — dark mode column
- [ ] **Typography** — all text styles (Display/H1 through Button/Label-S)
- [ ] **Spacing** — 4–80 scale bars
- [ ] **Radius & shadows** — visual samples
- [ ] **Icons** — FA reference sheet (Telegram, X, YouTube, Facebook, LinkedIn, calendar, map-pin, clock, etc.)

---

## 02 — Components (each with variants)

- [ ] Button (Primary, Outline, Ghost, Nav CTA pill + hover)
- [ ] Nav link (default, hover, active)
- [ ] Navbar (see variants below)
- [ ] Hero badge pill
- [ ] Event overlay card
- [ ] Stat card
- [ ] Feature tile (6-up)
- [ ] Past event image card
- [ ] Partner icon card (Tangem, Bitget, Binance)
- [ ] FAQ accordion item (open + closed)
- [ ] Newsletter block (input + button)
- [ ] Footer column blocks
- [ ] Theme toggle (optional, for parity with live site)
- [ ] Social button 44×44
- [ ] Placeholder image component (gray + filename label)

### Navbar component variants

- [ ] `Desktop / Light`
- [ ] `Desktop / Dark`
- [ ] `Desktop / Scrolled` (shadow on)
- [ ] `Mobile / Menu closed`
- [ ] `Mobile / Menu open`
- [ ] `Stress / Width 1024` — no logo/text overlap with nav links

---

## 03 — Homepage full frames

### Desktop 1440×auto

- [ ] **Home / Desktop / Light** — full page, all sections
- [ ] **Home / Desktop / Dark** — same structure, dark tokens

### Tablet 768×auto

- [ ] **Home / Tablet / Light**
- [ ] **Home / Tablet / Dark**

### Mobile 375×auto

- [ ] **Home / Mobile / Light** — hamburger nav, stacked hero, 2-col stats → 1-col
- [ ] **Home / Mobile / Dark**

### Section detail frames (optional, for review)

- [ ] Hero only (light + dark)
- [ ] Stats + Why DuaCrypto
- [ ] Past events + Partners
- [ ] FAQ + Footer

---

## Homepage section content (copy-paste)

### Nav links (order)

Home · About · Service · Roadmap · Events · Donate · **Other** ▾ · Contact · **[Join Next Event →]**

**Other dropdown:** Feature · Token Sale · FAQs · Newsletter  
**Remove:** 404 Page / "404 Other"

### Hero

| Element | Copy |
|---------|------|
| Badge | Next event in Tirana |
| H1 | Albania's First Crypto Community |
| Subtitle (recommended) | Be your own bank — together in Tirana. |
| Supporting | Building Albania's Web3 future through education, meetups, and real-world connections in Tirana. |
| CTA primary | Join Our Next Event → |
| CTA secondary | Free Guides (book icon) |

### Event card (overlay)

| Field | Copy |
|-------|------|
| Date | SATURDAY · 24 May 2025 |
| Location | Pyramid of Tirana, Tirana, Albania |
| Time | 17:00 – 20:30 · Doors open 16:30 |
| Button | RSVP Now → |
| Note | Spots are limited |

**Hero image:** `balkans-crypto-2025-1.png` (not `hero-1.png`)

### Stats

1. **1,850+** — Community Members  
2. **65+** — Events Since 2020  
3. **5+** — Years Active  

### Why DuaCrypto (6 tiles)

Web3 Education · Strong Community · Expert Speakers · Regular Events · Global Vision · Non-Profit Mission

### Past events

- Section title: **Past Events**  
- Link: View all events →  
- 3 images: `balkans-crypto-2025-1/2/3.png`

### Trusted partners (icon cards only)

Tangem Wallet · Bitget Exchange · Binance — **no slideshow, no product PNGs**

### FAQ (4 items for mockup parity)

1. How do I join the next DuaCrypto event in Tirana?  
2. Is DuaCrypto only for experienced traders?  
3. What should I bring to a meetup?  
4. How can my company partner with DuaCrypto?  

*(Optional 5th: corporate/AML FAQ from current site — defer to post-approval.)*

### Footer

- Blurb: Albania's first and leading crypto community. Building the Web3 future through education and events.  
- Contact: Tirana, Albania · +355 69 782 2224 · info@duacrypto.com  
- Newsletter: Market insights, airdrop alerts, and community updates — Formspree `xnnpkkqo`  
- Quick links: About, Contact, Privacy, Terms (Privacy/Terms pages TBD in code)  
- Services links: Education, Events, Donate, Newsletter  
- Social order: Telegram, X, YouTube, Facebook, LinkedIn  
- Copyright: © DuaCrypto, All Rights Reserved · Designed by DuaCrypto  

---

## 04 — Templates

### Bootstrap chrome

- [ ] **Chrome / Bootstrap Nav + Footer / Light** — match [`../mockups/bootstrap-chrome.png`](../mockups/bootstrap-chrome.png)
- [ ] **Chrome / Bootstrap Nav + Footer / Dark** (if supporting dark on Bootstrap pages)

Align with live [`about.html`](../../about.html) nav: `duacrypto-mark.svg`, data-nav attributes, Telegram/X/YouTube.

### Events page strip

- [ ] **Events / Hero + Gallery / Desktop** — align content with [`events.html`](../../events.html)
- [ ] **Events / Mobile**

---

## 05 — Ready for dev (annotations)

For each approved homepage frame, duplicate to this page and add:

- [ ] Spacing annotations (8, 16, 24, 32, 64)
- [ ] Color token labels on fills/text
- [ ] Text style names on headings/body
- [ ] **Final** vs **Placeholder** on images
- [ ] Hover states linked for buttons/cards
- [ ] Export settings noted (SVG logo, 2× PNG photos)
- [ ] Breakpoint note: when nav collapses (1024px)

---

## Approval before code

Confirm with checkboxes (in Figma comments or reply to agent):

- [ ] Light + dark homepage **desktop** approved  
- [ ] Mobile nav: no logo/link overlap at **1024px** and below  
- [ ] Hero uses **balkans-crypto** photo, not `hero-1.png`  
- [ ] Partners = **icon cards only** (slideshow removed in design)  
- [ ] Footer contact: Tirana, +355 69 782 2224, info@duacrypto.com  
- [ ] Bootstrap chrome matches homepage (mark SVG, social order, Other dropdown)  
- [ ] Subtitle choice locked (recommended: Satoshi line above)  

**Then share:** Figma file URL (view or dev mode) + list of final frame names.

Code implementation is **blocked** until the above is confirmed. See [`figma-to-code-map.md`](figma-to-code-map.md) for handoff.

---

## Build guide (your action — `figma-build` todo)

1. Create new Figma file from page list above.  
2. Import colors from [`tokens.json`](tokens.json) (manual or Variables import plugin).  
3. Drag assets from [`figma-assets/`](figma-assets/).  
4. Build components before full-page frames.  
5. Compare against PNG mockups in [`../mockups/`](../mockups/).  
6. Complete approval checklist → share URL.
