# Missing image assets

Images referenced in HTML that are **missing or should be replaced** in the final design. Use gray **placeholder** components in Figma where noted.

> **Note:** Some files (e.g. `icon-*.png`, `hero-1.png`) may exist in [`img/`](../img/) but are **deprecated** for the new design — prefer `duacrypto-mark.svg` and `balkans-crypto-2025-1.png` per [`design/figma-design-system.md`](design/figma-design-system.md).

**Policy:** No AI-generated PNGs in repo. Use Font Awesome icons or existing photos as fallbacks in code (after Figma approval).

| Filename | Referenced on | Recommended size | Status | Figma placeholder label |
|----------|---------------|------------------|--------|-------------------------|
| `favicon.ico` | Bootstrap pages (`events.html`, etc.) | 32×32 ICO | Missing | Use `duacrypto-mark.svg` instead |
| `icon-1.png` | `index.html` nav/footer logo | 45×45 | Missing | `duacrypto-mark.svg` |
| `icon-2.png` | index stats, services, feature | 64×64 | Missing | FA icon in circle |
| `icon-3.png` | index features, services | 64×64 | Missing | FA icon |
| `icon-4.png` | index features, feature.html | 64×64 | Missing | FA icon |
| `icon-5.png` | index features, services | 64×64 | Missing | FA icon |
| `icon-6.png` | index features, feature.html | 64×64 | Missing | FA icon |
| `icon-7.png` | index features, services, feature | 64×64 | Missing | FA icon |
| `icon-8.png` | index features, services | 64×64 | Missing | FA icon |
| `icon-9.png` | index stats, services | 64×64 | Missing | FA icon |
| `icon-10.png` | index stats | 64×64 | Missing | FA icon |
| `hero-1.png` | `index.html` hero | 800×600 | Missing | **`balkans-crypto-2025-1.png`** |
| `hero-2.png` | Bootstrap page headers | 600×400 | Missing | Event photo or abstract |
| `2029.webp` | index about section | 600×400 | Missing | `kane-profile.png` or education stock |
| `payment-1.png` | `bitcoin-for-corporations.html` | 50×50 | Missing | Text "BTC" badge |
| `payment-2.png` | `bitcoin-for-corporations.html` | 50×50 | Missing | Text "ETH" badge |
| `payment-3.png` | `bitcoin-for-corporations.html` | 50×50 | Missing | Text "USDT" badge |
| `payment-4.png` | `bitcoin-for-corporations.html` | 50×50 | Missing | Text "USDC" badge |
| `Iphone_cards.png` | index affiliate slideshow | 800×400 | Missing | **Remove slideshow in design** |
| `ledger-.jpg` | index slideshow | 800×400 | Missing | **Remove slideshow** |
| `decentralized-VPN-router.jpg` | index slideshow | 800×400 | Missing | **Remove slideshow** |
| `og-image.png` | Future OG meta (all pages) | 1200×630 | Missing | Figma export after homepage approved |

## Assets available now (use in Figma)

| File | Use for |
|------|---------|
| `duacrypto-mark.svg` | Nav, favicon, footer logo |
| `duacrypto-logo.png` | Marketing, cover page |
| `kane-profile.png` | About / founder section |
| `balkans-crypto-2025-1.png` | Hero main image |
| `balkans-crypto-2025-2.png` | Past events gallery |
| `balkans-crypto-2025-3.png` | Past events gallery |
| `bitcoin-pizza-day-*.jpg/png` | Event promos |
| `bitcoin-event-cover.jpg` | Events hero |
| `as-seen-on-*.png` | Press logos row |
| `donation.html` | May reference `icon-1.png` — replace with mark SVG |

Copied for Figma drag-and-drop: [`docs/design/figma-assets/`](design/figma-assets/).

## How to add assets later

1. Place files in [`img/`](../img/) at repo root (same paths as table).  
2. Update this table **Status** → `Supplied`.  
3. Replace Figma placeholders and re-export **Ready for dev** frames.  
4. Request code implementation pass.
