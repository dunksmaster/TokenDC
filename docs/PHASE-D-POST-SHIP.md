# Phase D — Post-ship status (2026-07-09)

After srcset ship (PR #7 cherry-picks) and blog/newsletter (PR #8), this records Phase D QA and ops follow-up.

## Production baseline

| Check | Result |
|-------|--------|
| `main` tip | `0b1d884` + events dark-mode fix (`fix/events-dark-mode-qa`) |
| `/events.html` srcset | Live — `<picture>` + `-480w.webp` variants |
| `/blog/index.html` | HTTP 200 |
| `/newsletter.html` | HTTP 200 |
| `/sitemap.xml` | HTTP 200 — includes blog + newsletter URLs |
| GitHub Actions deploy | Green on push to `main` |
| Local sync | `main` matches `origin/main`; leftover untracked junk removed |

## Events layout QA (2026-07-09)

Fixed in [`src/css/events-page.css`](../src/css/events-page.css):

- Dark mode for event cards, hero text, CTA heading, event body copy
- Removed legacy `footer { background: #f1f1f1 }` override that broke site footer chrome
- Stopped hard-coded light `body` background so `bg-page` tokens apply

## Lighthouse / PageSpeed baseline

Automated capture was blocked during this run (PageSpeed API HTTP 429; Lighthouse CLI needs local Chrome).

**Run manually and record scores here:**

| URL | Mobile perf | Mobile CLS | Desktop perf | Date |
|-----|-------------|------------|--------------|------|
| https://duacrypto.com/ | _run PSI_ | _run PSI_ | _run PSI_ | |
| https://duacrypto.com/events.html | _run PSI_ | _run PSI_ | _run PSI_ | |

Tool: [PageSpeed Insights](https://pagespeed.web.dev/)

No high-impact regressions were found in code review tied to the recent srcset/blog ship; re-run PSI after the events dark-mode deploy to confirm.

## Google Search Console — sitemap

Google deprecated the public sitemap ping endpoint (404 as of 2023). **Submit in the GSC UI:**

1. [Google Search Console](https://search.google.com/search-console) → property `https://duacrypto.com`
2. **Sitemaps** → add `https://duacrypto.com/sitemap.xml` (only this URL — not individual HTML pages)
3. **URL Inspection** → request indexing for:
   - `https://duacrypto.com/blog/index.html`
   - `https://duacrypto.com/newsletter.html`
   - `https://duacrypto.com/events.html` (re-crawl after srcset deploy)

Preconditions verified: sitemap is valid XML, all listed URLs return 200.

## Cloudflare Workers Builds (optional)

If PRs show a red **Workers Builds: dc-site** check while GitHub **Verify build** passes:

**Workers & Pages → dc-site → Settings → Builds → Disconnect Git**

GitHub Actions [`.github/workflows/cloudflare-pages.yml`](../.github/workflows/cloudflare-pages.yml) remains the production deploy path.
