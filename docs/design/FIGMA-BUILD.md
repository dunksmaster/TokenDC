# Build your Figma file (owner action)

The repo cannot create `.fig` files. Use the materials below, then share your Figma URL when ready.

## Quick start

1. **New Figma file** — name: `DuaCrypto — Homepage 2025`
2. **Import tokens** — copy colors from [`tokens.json`](tokens.json) into Figma Variables (Light + Dark modes)
3. **Text styles** — create styles from [`figma-design-system.md`](figma-design-system.md) §3
4. **Assets** — drag files from [`figma-assets/`](figma-assets/)
5. **Reference boards** — pin these mockups on `00 — Cover`:
   - [`../mockups/homepage-events-bitcoin.png`](../mockups/homepage-events-bitcoin.png) (light desktop)
   - [`../mockups/homepage-desktop-dark.png`](../mockups/homepage-desktop-dark.png)
   - [`../mockups/homepage-mobile-light.png`](../mockups/homepage-mobile-light.png)
   - [`../mockups/bootstrap-chrome.png`](../mockups/bootstrap-chrome.png)
6. **Checklist** — work through [`figma-frame-checklist.md`](figma-frame-checklist.md)

## When done

Reply with:

- Figma file URL (view or dev mode)
- Which frames are **final** (e.g. `Home / Desktop / Light`, `Home / Mobile / Dark`)
- Locked hero subtitle (recommended: *Be your own bank — together in Tirana.*)

Code implementation starts only after approval. See [`figma-to-code-map.md`](figma-to-code-map.md).

## Refresh assets after adding images

```powershell
.\scripts\sync-figma-assets.ps1
```
