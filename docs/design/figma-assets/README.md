# Figma asset pack

Drag these files into your Figma file (**03 — Homepage** and **04 — Templates**).

## Included files

| File | Source | Suggested use |
|------|--------|----------------|
| `duacrypto-mark.svg` | Brand mark | Nav 42×42, favicon |
| `duacrypto-logo.png` | Full logo | Cover page, OG draft |
| `kane-profile.png` | Founder photo | About section (optional on homepage) |
| `balkans-crypto-2025-1.png` | Conference audience | **Hero main image** |
| `balkans-crypto-2025-2.png` | Expo floor | Past events card 2 |
| `balkans-crypto-2025-3.png` | Team on stage | Past events card 3 |
| `bitcoin-event-cover.jpg` | Event cover | Events template |
| `bitcoin-pizza-day-cover.jpg` | Event promo | Events / social |
| `bitcoin-pizza-day-1.png` | Event photo | Gallery |
| `bitcoin-pizza-day-2.png` | Event photo | Gallery |
| `bitcoin-pizza-day-3.png` | Event photo | Gallery |
| `as-seen-on-eko.png` | Press logo | As Seen On row |
| `as-seen-on-abc-news.png` | Press logo | As Seen On row |
| `as-seen-on-top-channel.png` | Press logo | As Seen On row |

## Missing assets

See [`../../MISSING-ASSETS.md`](../../MISSING-ASSETS.md). Use the **Placeholder** component in Figma (gray frame + filename label).

## Refresh assets

If you add new files to [`img/`](../../../img/), re-run from repo root:

```powershell
.\scripts\sync-figma-assets.ps1
```

Or manually copy new files into this folder.

## Import tips

1. **SVG logo:** Import as vector; constrain proportions; use orange `#F7931A` only if recoloring for dark mode.  
2. **Photos:** Import at 2×; compress in Figma if file size is large.  
3. **Press logos:** Keep original colors; place on `bg-surface` or `bg-card`.
