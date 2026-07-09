# DuaCrypto Website Improvement Plan

Operational plan for speed, SEO, template, security, and layout improvements for [duacrypto.com](https://duacrypto.com).

**Last updated:** 2026-07-09 (reflects shipped `main` after PR #8 + Phase D)  
**Related:** [SEO-CHECKLIST.md](./SEO-CHECKLIST.md), [PHASE-D-POST-SHIP.md](./PHASE-D-POST-SHIP.md), [MISSING-ASSETS.md](./MISSING-ASSETS.md)

---

## Shipped on `main` (2026-07-08)

| Area | Status |
|------|--------|
| Tailwind migration + partials | **Done** — all pages; `src/partials/` + `vite-plugins/html-includes.js` |
| Bootstrap / jQuery / legacy plugins | **Removed** from HTML and dead-asset checks |
| Image pipeline | **Done** — `scripts/optimize-images.mjs`; `img/` ~5.6 MB (budget 8 MB) |
| Events gallery srcset | **Done** — `lib/gallery-responsive.mjs`, `<picture>` on `events.html` |
| Security headers | **Done** — CSP report-only, nosniff, HSTS, Cache-Control in `public/_headers` |
| Self-hosted fonts + Font Awesome | **Done** — `/css/site-fonts.css`, `/vendor/font-awesome/` |
| PWA icons | **Done** — `site.webmanifest`, `apple-touch-icon.png`, SVG favicon |
| Blog + newsletter | **Done** — PR #8; SEO + sitemap wired |
| Events dark mode QA | **Done** — Phase D fix in `src/css/events-page.css` |
| Deploy path | **GitHub Actions** → Cloudflare Pages `dc-site` |

**Closed:** PR #7 (superseded by cherry-picks). **Merged:** PR #8 (blog/newsletter).

---

## Revised execution order (current)

```
[DONE] Step 0  →  Tailwind migration + partials on main
[DONE] Step 1  →  Image optimization pipeline
[DONE] Step 2  →  CSP + nosniff + Cache-Control headers
[DONE] Step 3  →  Delete dead Bootstrap/jQuery assets (verify-build enforces)
[DONE] Step 4  →  apple-touch-icon + webmanifest; blog/newsletter in sitemap
[DONE] Step 5  →  Self-host fonts / Font Awesome
[DONE] Step 6  →  GSC preflight + PSI baseline (see PHASE-D-POST-SHIP.md; GSC UI submit is operator action)
[DEFER]        →  hreflang /sq/, CSP enforce, x402 audit, further img/ compression
```

---

## 1. Speed

### Done

- Bootstrap + jQuery + owlcarousel/wow/waypoints/counterup removed
- Hero WebP `<picture>` + `fetchpriority="high"` on homepage
- Build-time image optimize + WebP siblings; unreferenced assets pruned
- Events gallery responsive srcset (480/800/1200w WebP)
- Cache-Control immutable on `/img/*`, `/css/*`, `/js/*`, etc.

### Still to do

- Site-wide `width`/`height` on all local `<img>` tags (events gallery done; other pages partial — see `verify-build.mjs` scope)
- Optional: compress remaining large PNGs if targeting &lt; 4 MB total `img/`

---

## 2. SEO

### Done

- Per-page title/description via `scripts/seo-config.mjs` + `inject-seo.mjs`
- Canonical, OG, Twitter, JSON-LD (Organization, WebSite, Breadcrumb, FAQ, Event)
- `sitemap.xml` + `robots.txt` at build (includes blog + newsletter)
- Self-hosted favicon; no Wikimedia / placeholder hotlinks
- Agent discovery + markdown negotiation

### Still to do (ops)

| Item | Priority | Notes |
|------|----------|-------|
| GSC sitemap submission | High | Preflight passed (`npm run verify:sitemap`); submit in GSC UI — see [PHASE-D-POST-SHIP.md](./PHASE-D-POST-SHIP.md) |
| Request indexing for new URLs | Medium | blog index, newsletter, events |
| `hreflang` for Albanian (`/sq/`) | Low | When `/sq/` pages exist |
| Image alt audit (site-wide) | Medium | Events gallery has alt; audit remaining pages |

---

## 3. Template

### Done

- Nav/footer via `src/partials/header.html`, `footer.html`, `head-common.html`
- Blog uses legacy `<!-- include:... -->` syntax supported by `html-includes.js`
- Dead asset paths enforced in `scripts/verify-build.mjs`

### Still to do

- None blocking ship

---

## 4. Security

### Done

- X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS
- CSP report-only via `lib/site-security-headers.mjs`
- X-Content-Type-Options: nosniff

### Still to do

- CSP report-only → **enforce** after 1 week clean reports (`CSP_ENFORCE=1 npm run build`)
- x402 / `functions/api/` audit
- External link audit on blog pages (`rel="noopener noreferrer"`)

---

## 5. Layout

### Done

- Tailwind tokens in `src/css/input.css`
- Mobile nav a11y (aria-expanded, aria-controls)
- Blog list + article templates with site chrome
- Events page dark mode parity (Phase D)

### Still to do

- Consistent section spacing audit vs `index.html` on secondary pages
- Site-wide CLS pass (width/height on all content images)

---

## Verification commands

```bash
npm run build && npm run verify:build
npm run verify:headers -- https://duacrypto.com/
npm run verify:headers -- https://duacrypto.com/events.html
npm run verify:security-headers dist/_headers
```

PageSpeed: `npm run pagespeed:baseline` or https://pagespeed.web.dev/ — test `/` and `/events.html`

---

## Post-deploy checklist

- [x] Migration + srcset + blog on `main`; Cloudflare deploy green
- [x] `img/` under 8 MB budget
- [x] `npm run verify:build` passes
- [x] Blog + newsletter in sitemap
- [x] Events dark-mode layout fix
- [x] Lighthouse scores recorded in [PHASE-D-POST-SHIP.md](./PHASE-D-POST-SHIP.md)
- [x] GSC sitemap preflight passed (`npm run verify:sitemap`); submit in GSC UI when ready
- [ ] CSP enforced after clean report-only period

### Enabling CSP enforcement

```bash
CSP_ENFORCE=1 npm run build
npm run verify:security-headers dist/_headers
```
