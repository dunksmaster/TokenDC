# DuaCrypto Website Improvement Plan

Operational plan for speed, SEO, template, security, and layout improvements for [duacrypto.com](https://duacrypto.com).

**Last updated:** 2026-07-07 (Steps 1–2 implemented on `cursor/image-pipeline-headers-d4c1`)  
**Related:** [SEO-CHECKLIST.md](./SEO-CHECKLIST.md), [MISSING-ASSETS.md](./MISSING-ASSETS.md)

---

## Two states of the repo (read this first)

This plan was written against the **committed `main` branch** (what ships today), then revised after verifying against a **local working tree** with ~50 uncommitted files. Those two states differ significantly.

| Area | Committed `main` (deployed baseline) | Local working tree (uncommitted) |
|------|--------------------------------------|----------------------------------|
| Bootstrap / jQuery | 13 pages still reference `bootstrap.min.css`; 9 pages load jQuery + legacy plugins | **Done** — zero references remain |
| Nav / footer | Copy-pasted across 14 HTML files | **Done** — `src/partials/` + `vite-plugins/html-includes.js` |
| Favicon | `index.html` hotlinks Wikimedia; `events.html` has `via.placeholder.com` fallback | **Done** — self-hosted `/img/duacrypto-mark.svg` |
| Security headers | Only agent-discovery `Link` / `Content-Signal` headers | **Partial** — X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS added |
| New pages | Not present | Untracked `blog/`, `newsletter.html` (need partials + SEO pipeline) |

**Implication:** Phases 3–4 of the original plan (Tailwind migration, nav dedup, favicon) are **already complete locally** but **not yet committed or deployed**. Step zero is to land that work before starting new phases.

---

## Revised execution order

```
Step 0  →  Commit + push the current migration (split into sensible commits)  [LOCAL ONLY — not in remote main]
Step 1  →  Image optimization pipeline (highest remaining impact)               [DONE — this branch]
Step 2  →  CSP + X-Content-Type-Options + Cache-Control headers               [DONE — this branch]
Step 3  →  Delete dead assets (bootstrap, owlcarousel, wow, waypoints, counterup)
Step 4  →  SEO polish (apple-touch-icon, webmanifest, hreflang when /sq/ exists)  [PARTIAL — apple-touch-icon + webmanifest done]
Step 5  →  Self-host fonts / Font Awesome subset (lower priority — already async-preloaded)  [DONE]
```

### Completed on `cursor/image-pipeline-headers-d4c1` (2026-07-07)

| Item | Result |
|------|--------|
| Image pipeline | `scripts/optimize-images.mjs` + `sharp`; wired into `npm run build` |
| `img/` size | **33 MB → ~5 MB** (28 MB of unreferenced assets removed; referenced images compressed + WebP siblings) |
| Security headers | `lib/site-security-headers.mjs` → merged into `public/_headers` via `syncLinkHeadersFile()` |
| CSP | `Content-Security-Policy-Report-Only` (enforce after 1 week clean reports) |
| `nosniff` | `X-Content-Type-Options: nosniff` on `/*` |
| Cache-Control | `max-age=31536000, immutable` on `/img/*`, `/css/*`, `/js/*`, `/lib/*`, `/webp/*` |
| PWA icons | `site.webmanifest`, `apple-touch-icon.png`, favicon normalized on all 14 pages |
| Favicon fix | Removed Wikimedia/IconArchive hotlinks and `via.placeholder.com` on `events.html` |
| Self-hosted fonts | Open Sans + Roboto via `@fontsource` → `/css/site-fonts.css` (latin + latin-ext) |
| Self-hosted FA | Font Awesome 6 from `@fortawesome/fontawesome-free` → `/vendor/font-awesome/` |
| CSP tightened | Removed `fonts.googleapis.com`, `fonts.gstatic.com`, `cdnjs.cloudflare.com` from font/style allowlists |

---

## Step 0 — Commit the migration (do this first)

**Status:** In progress on `cursor/tailwind-migration-d4c1` (cloud agent).

| Batch | Pages | Status |
|-------|-------|--------|
| 1 | `index.html`, `404.html`, `privacy.html`, `terms.html` | **Done** — Tailwind + partials |
| 2 | `contact.html`, `faq.html`, `feature.html`, `service.html`, `roadmap.html` | Pending |
| 3 | `about.html`, `$10.html`, `events.html`, `donation.html`, `bitcoin-for-corporations.html` | Pending |

Infrastructure: `src/partials/header.html`, `footer.html`, `vite-plugins/html-includes.js` (`<!-- @partial header active=about -->`).

Bootstrap pages remaining: **10** (down from 13).

### Remote branches reviewed (2026-07-07)

| Branch | Notes |
|--------|-------|
| `origin/website-update` | Large content/design overhaul (226 files); removes Cloudflare workflows, Vite config, many docs — **do not merge blindly** |
| `origin/cursor/fix-and-improve-code-issue-3d2b` | Similar scale reduction; appears to strip agent/Cloudflare infra |
| `origin/backup-working-state` | Cloudflare deploy backup branch |
| `origin/cursor/improvement-plan-update-d4c1` | This improvement plan doc only (PR #4) |

**Action:** Push your local migration to a new branch (e.g. `cursor/tailwind-migration-d4c1`) so it can be reviewed separately from the image/header work.

**Why:** An entire Tailwind migration, partials system, favicon fix, and partial security headers may still sit uncommitted locally. If anything happens to the local folder, that work is lost.

**Suggested commit split:**

1. `feat: add html-includes partials (header, footer, head-common)`
   - `src/partials/`
   - `vite-plugins/html-includes.js`
   - `vite.config.js` plugin registration

2. `refactor: migrate all pages from Bootstrap/jQuery to Tailwind`
   - All `*.html` changes (remove bootstrap.min.css, jQuery, owlcarousel, wow, waypoints, counterup)
   - `src/css/input.css` / `src/js/` updates if any

3. `fix: self-host favicon, remove Wikimedia/placeholder hotlinks`
   - Favicon links across pages
   - Remove `via.placeholder.com` fallback on `events.html`

4. `chore: add partial security headers to _headers`
   - X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS

5. `feat: add blog and newsletter pages` (if ready)
   - `blog/`, `newsletter.html`
   - Wire through `html-includes.js` partials
   - Add entries to `scripts/seo-config.mjs`, `vite.config.js` rollup input, sitemap

**Pre-commit checklist:**

- [ ] `npm run build` succeeds
- [ ] All pages render nav/footer from partials (no stale inline copies)
- [ ] `blog/` and `newsletter.html` go through the same SEO inject pipeline (`npm run agent:generate`)
- [ ] No remaining `bootstrap.min.css`, jQuery, or legacy plugin `<script>` tags
- [ ] Favicon is `/img/duacrypto-mark.svg` on every page (no Wikimedia / placeholder)

---

## 1. Speed

### Already done (local, uncommitted)

- Bootstrap (164 KB) + jQuery + owlcarousel/wow/waypoints/counterup removed from all HTML pages
- Font Awesome and Google Fonts loaded async via `rel="preload" as="style"` + `onload` swap
- Hero image uses WebP `<picture>` + `fetchpriority="high"` on homepage

### Still to do

#### 1a. Image pipeline — **single highest-impact item**

`img/` is **~33–34 MB** on disk. Largest offenders:

| File | Size |
|------|------|
| `Iphone_cards.png` | ~11 MB |
| `54568959275_c50b3efc4c_o.jpg` | ~4.5 MB |
| `GsXvXFKWYAAhs3-.jpeg` | ~3.5 MB |
| `ChatGPT Image Jun 8, 2025, 02_22_28 PM.png` | ~2.5 MB |
| `setup-mode-03.webp` | ~1.2 MB |
| `binance-partner-light-src.png` | ~1.1 MB |

**Actions:**

- Resize to actual display dimensions (most images are served far larger than rendered)
- Convert PNG/JPEG → WebP/AVIF; keep originals only in repo if needed for editing
- ~~Add responsive `srcset` / `sizes` on content images~~ **Done** — `lib/gallery-responsive.mjs`, build-time `-480w/-800w/-1200w.webp` variants, `<picture>` on `events.html`
- `loading="lazy"` + explicit `width`/`height` on below-the-fold images (prevents CLS)
- Integrate into build: `sharp` step in `scripts/generate-agent-assets.mjs` or a Vite image plugin
- **Target:** reduce `img/` from ~34 MB to ~2–4 MB

#### 1b. Cache-Control headers (not yet in `_headers`)

Add to `public/_headers`:

```
/img/*
  Cache-Control: public, max-age=31536000, immutable

/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

/lib/*
  Cache-Control: public, max-age=31536000, immutable
```

Vite-hashed build assets in `dist/assets/` get new filenames on each deploy, so long cache is safe.

#### 1c. Self-host fonts / Font Awesome (lower priority)

Already async-preloaded from Google Fonts and cdnjs. Self-hosting removes two cross-origin connections and tightens CSP, but impact is smaller than images. Defer until after image pipeline.

---

## 2. SEO

### Already done (in codebase)

- Unique `<title>` / `<meta name="description">` per page via `scripts/seo-config.mjs` + `inject-seo.mjs`
- Canonical URLs, Open Graph, Twitter cards
- JSON-LD: Organization, WebSite (+ SearchAction), BreadcrumbList, FAQPage, Event
- `sitemap.xml`, `robots.txt` generated at build
- Markdown content negotiation for agents (`functions/_middleware.ts`)
- Agent discovery headers (RFC 8288 Link relations)

See [SEO-CHECKLIST.md](./SEO-CHECKLIST.md) for GSC/Bing/GBP operational tasks.

### Already done (local, uncommitted)

- Self-hosted SVG favicon (`/img/duacrypto-mark.svg`) replacing Wikimedia/IconArchive hotlinks
- `via.placeholder.com` removed

### Still to do

| Item | Priority | Notes |
|------|----------|-------|
| `apple-touch-icon` + `site.webmanifest` | Medium | Only SVG favicon today; iOS home-screen and PWA metadata missing |
| `hreflang` for Albanian (`/sq/`) | Low (when pages exist) | Audience is Albania/Balkans; add when `/sq/` pages ship |
| Image alt audit | Medium | Run after image pipeline; ensure descriptive alt on all content images |
| Wire `blog/` + `newsletter.html` into SEO pipeline | High (with Step 0) | Must get sitemap entries, titles, canonical, JSON-LD |
| GSC / Bing sitemap submission | Ops | Submit only `https://duacrypto.com/sitemap.xml` |

---

## 3. Template

### Already done (local, uncommitted)

- **Bootstrap → Tailwind migration complete** on all pages
- **Nav/footer de-duplication** via `src/partials/` (header, footer, head-common) and `vite-plugins/html-includes.js`
- `index.html` was already the Tailwind reference; other pages now match

### Still to do

#### 3a. Delete dead assets (~400 KB cruft, may still copy to `dist`)

These files exist on disk but are no longer referenced after migration:

```
css/bootstrap.min.css          (164 KB)
lib/owlcarousel/
lib/wow/
lib/waypoints/
lib/counterup/
```

Also check `vite-plugins/copy-legacy-static.js` — confirm it does not copy deleted paths to `dist/`.

#### 3b. Verify `blog/` and `newsletter.html`

Untracked new pages must use the same partials include syntax and pass through `npm run agent:generate` for SEO blocks and sitemap inclusion.

---

## 4. Security

### Already done (local, uncommitted)

Partial security headers added to `_headers`:

- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

### Still to do

#### 4a. Content-Security-Policy

Not present on committed `main` or in the verified local tree. Start with report-only:

```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'
```

Tighten and switch to enforcing once report-only shows no violations. Allowlist must include: Formspree, Gumroad, GA4, any CDN still in use.

#### 4b. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

Add site-wide in `_headers`.

#### 4c. SRI on remaining CDN assets

Add `integrity` + `crossorigin` to any CDN `<script>` / `<link>` that remains, or self-host to eliminate the need.

#### 4d. API / payment surface audit

`functions/api/` and x402 payment endpoints (`lib/x402-site-api.mjs`) should be reviewed for input validation and secret handling. Relevant on a crypto/donation site.

#### 4e. External link audit

Confirm all `target="_blank"` links use `rel="noopener noreferrer"` across all pages (including new `blog/`).

---

## 5. Layout

### Already done (local, uncommitted)

- Unified Tailwind grid/flex on all pages (Bootstrap `col-md-*` / `row` removed)
- Consistent design tokens in `src/css/input.css` (`@theme` colors, fonts)
- Mobile nav with accessible toggle (`aria-expanded`, `aria-controls`) on migrated pages

### Still to do

| Item | Notes |
|------|-------|
| CLS pass on all pages | Ensure every `<img>` has explicit `width`/`height` (hero already does) |
| Consistent section spacing | Audit migrated pages against `index.html` section-shell / padding patterns |
| Dark mode parity | Verify all migrated pages respect `.dark` tokens from `head-common` partial |
| Blog layout | Define list + article templates consistent with site chrome |

---

## Original plan items — status summary

| Original claim | Status |
|----------------|--------|
| 13 pages still on Bootstrap/jQuery | **Stale** — done locally, uncommitted |
| Nav/footer copy-pasted 14× | **Stale** — partials exist locally |
| Wikimedia favicon hotlink | **Stale locally** — still on committed `main` (`index.html`) |
| `via.placeholder.com` on events | **Stale locally** — still on committed `main` |
| No security headers at all | **Partially stale** — some headers added locally; CSP and nosniff still missing |
| `img/` is 33 MB | **Still true** — highest-impact remaining work |
| No Cache-Control for static assets | **Still true** |
| Dead bootstrap/lib assets on disk | **Still true** |
| SEO JSON-LD / sitemap / OG | **Done** (committed) |
| Fonts/FA on external CDN | **Still true** but lower priority (async-preloaded) |
| No apple-touch-icon / webmanifest | **Still true** |
| ~50 uncommitted files at risk | **Still true** — **Step 0** |

---

## Verification commands

Run after each phase to confirm progress:

```bash
# No legacy framework references
grep -rE 'bootstrap\.min\.css|code\.jquery\.com|owlcarousel|wow\.|waypoints|counterup' *.html

# Image dir size (target < 5 MB)
du -sh img/

# Security headers present in built output
grep -E 'Content-Security|X-Content-Type|Cache-Control|Strict-Transport' public/_headers dist/_headers

# Build + SEO inject
npm run build

# Dead assets still on disk
ls css/bootstrap.min.css lib/owlcarousel lib/wow lib/waypoints lib/counterup 2>/dev/null

# PageSpeed (manual)
# https://pagespeed.web.dev/ — test / and /events.html
```

---

## Post-deploy checklist (extends SEO-CHECKLIST.md)

- [ ] Migration commits pushed; Cloudflare deploy from `main`
- [ ] `img/` total size under 8 MB (`npm run verify:build`)
- [ ] `npm run verify:build` passes in CI
- [ ] Lighthouse mobile performance improved on `/` and `/events.html`
- [ ] CSP report-only running with zero unexpected violations for 1 week
- [ ] CSP enforced: set `CSP_ENFORCE=1` before `npm run build` (see below)
- [ ] `blog/` and `newsletter.html` in sitemap (if shipped)
- [ ] No 404s for deleted bootstrap/lib paths
- [ ] Core Web Vitals: no LCP regression (hero WebP still preloaded)

### Enabling CSP enforcement

After ~1 week of clean CSP reports in the browser console / Cloudflare logs:

```bash
CSP_ENFORCE=1 npm run build
```

This switches `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `_headers`. Verify with:

```bash
npm run verify:security-headers dist/_headers
```
