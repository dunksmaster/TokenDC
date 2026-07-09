# Phase D — Post-ship status (2026-07-09)

After srcset ship (PR #7 cherry-picks) and blog/newsletter (PR #8), this records Phase D QA and ops follow-up.

**Phase D closed:** 2026-07-09 (PR #9 deployed; baseline + preflight recorded below).

## Production baseline

| Check | Result |
|-------|--------|
| `main` tip | `86ae4b7` (PR #9 — events dark-mode + docs) |
| `/events.html` srcset | Live — `<picture>` + `-480w.webp` variants |
| `/blog/index.html` | HTTP 200 |
| `/newsletter.html` | HTTP 200 |
| `/sitemap.xml` | HTTP 200 — 20 URLs including blog + newsletter |
| GitHub Actions deploy | Green on push to `main` |
| Cloudflare native Git | **Disconnected** — `wrangler pages project list` shows Git Provider: `No` |

## Events layout QA (2026-07-09)

Fixed in [`src/css/events-page.css`](../src/css/events-page.css):

- Dark mode for event cards, hero text, CTA heading, event body copy
- Removed legacy `footer { background: #f1f1f1 }` override that broke site footer chrome
- Stopped hard-coded light `body` background so `bg-page` tokens apply

## Lighthouse / PageSpeed baseline

Captured via Lighthouse CLI (Chrome headless) on 2026-07-09. Re-run: `npm run pagespeed:baseline` (artifacts in `docs/psi-artifacts/`).

| URL | Mobile perf | Mobile CLS | Mobile LCP | Desktop perf | Desktop CLS | Date |
|-----|-------------|------------|------------|--------------|-------------|------|
| https://duacrypto.com/ | 63 | 0.013 | 8.6 s | 90 | 0.001 | 2026-07-09 |
| https://duacrypto.com/events.html | 63 | 0.024 | 7.6 s | 96 | 0.051 | 2026-07-09 |

**Notes:** Desktop scores are strong. Mobile LCP is elevated (7–9 s) — likely hero/font payload; defer to a future perf pass unless Core Web Vitals reports a regression in GSC. No CLS issues tied to the recent srcset ship.

Manual cross-check: [PageSpeed Insights](https://pagespeed.web.dev/)

## Google Search Console — sitemap

**Preflight (automated):** `npm run verify:sitemap` — passed 2026-07-09 (20 URLs in sitemap; spot-check 200s for `/`, events, blog, newsletter).

Google deprecated the public sitemap ping endpoint. **Submit in the GSC UI** (requires Google account):

1. [Google Search Console](https://search.google.com/search-console) → property `https://duacrypto.com`
2. **Sitemaps** → add `https://duacrypto.com/sitemap.xml` (only this URL — not individual HTML pages)
3. **URL Inspection** → request indexing for:
   - `https://duacrypto.com/blog/index.html`
   - `https://duacrypto.com/newsletter.html`
   - `https://duacrypto.com/events.html`

## Cloudflare Workers Builds

**Status (2026-07-09):** Native Git is already disconnected on `dc-site` (`Git Provider: No` via `npx wrangler pages project list`).

Historical PRs may still show a red **Workers Builds: dc-site** check from Cloudflare’s GitHub app integration. This does **not** block production deploys — GitHub Actions [`.github/workflows/cloudflare-pages.yml`](../.github/workflows/cloudflare-pages.yml) is the active path.

If the check reappears after reconnecting Git: **Workers & Pages → dc-site → Settings → Builds → Disconnect Git**.
