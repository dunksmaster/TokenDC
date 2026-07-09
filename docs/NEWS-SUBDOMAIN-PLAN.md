# Plan: news.duacrypto.com — AI-Powered News & Blog Site

Goal: launch a standalone news/blog site on the subdomain **news.duacrypto.com**, built from scratch (own template, own repo/project), where posts can be written by AI and published automatically via a pipeline (GitHub + Claude API / MCP), with human review before anything goes live.

Context: the main site (this repo, `dc-site` on Cloudflare Pages) already has a small `blog/` section with 6 posts in HTML + markdown mirrors. Those become the seed content for the new site, and the main site's blog pages later redirect to the subdomain.

---

## Content strategy (the heart of the site)

### Where we are now (updated 2026-07-09)
- Main site (duacrypto.com) is live with 6 English blog posts (redirect to news), self-hosted fonts/FA, security headers, sitemap/robots/JSON-LD in place.
- **news.duacrypto.com is live** — Astro site in `duacrypto-news` repo, 8+ seed posts, Albanian affiliate queue, `/go/*` redirects, scoring frontmatter, AI draft pipeline.
- Existing monetization inventory promoted on the news site:
  - **Own product:** DuaCrypto Premium Newsletter — `https://duacrypto.gumroad.com/l/newsletter` ($10/mo, Gumroad).
  - **Affiliates:** Tangem (`/go/tangem` on news), Bitget (`/go/bitget`), CEX.io (`/go/cex`), Deeper Network (`/go/deeper`) — centralized in `duacrypto-news/src/data/affiliates.ts`.
- Five Albanian affiliate posts published on news (Tangem, Bitget, CEX.io, Deeper, Newsletter proof).

### Post quality scoring template
Every post carries target scores in frontmatter so we know what each post is *for* and can measure AI drafts against it:

```yaml
scores:
  empathy: 80        # reader-first: acknowledges their situation/fears (scams, inflation, custody)
  storytelling: 70   # narrative arc: real scenario, person, or journey — not a listicle
  cta: 60            # strength of call-to-action (affiliate link, newsletter signup, Telegram join)
postType: affiliate | news | guide | community   # determines the score profile
```

Standard profiles:
| Post type | Empathy | Storytelling | CTA | Primary goal |
|---|---|---|---|---|
| Affiliate review (Tangem, Bitget…) | 80 | 70 | 60 | conversion via affiliate link |
| News/market update | 60 | 50 | 30 | traffic + trust, soft newsletter CTA |
| Educational guide | 85 | 75 | 40 | SEO evergreen + trust |
| Community story | 90 | 90 | 50 | Telegram/community growth |

The AI generator prompt includes the target profile and self-rates its draft; the review step (you) rejects drafts that miss the profile. Scores stay in frontmatter (not rendered) as internal metadata.

### Albanian-first affiliate content
- Affiliate posts are written in **Albanian (sq)** as the primary language — that's the community and the underserved SEO space (very low competition for "portofol harduerik", "si të blej Bitcoin në Shqipëri", etc.).
- Site supports `lang: sq` in frontmatter; URLs like `/sq/posts/…` (or Albanian-only at launch, English later with hreflang pairs).
- Initial affiliate post queue (Albanian):
  1. Tangem — "Portofoli më i thjeshtë harduerik për shqiptarët" (self-custody angle, empathy: fear of losing coins).
  2. Bitget — how to register & buy first crypto from Albania/Kosovo (step-by-step with screenshots).
  3. CEX.io — buying with card, fees comparison for the Balkans.
  4. Deeper Network — privacy/VPN angle.
  5. Premium Newsletter — what subscribers got last month (proof-driven).

### Standards & compliance (no ads, affiliate links only)
- **Disclosure on every affiliate post** — a visible box at top in Albanian ("Ky artikull përmban lidhje bashkëpunimi…") — required by FTC-style rules and by affiliate program ToS, and Google rewards transparency.
- All affiliate links get `rel="sponsored noopener"` (Google's required attribute — protects SEO).
- Centralize affiliate URLs in one config file (`src/data/affiliates.ts`) — posts reference `{affiliate:tangem}`; if a ref code changes, one edit updates every post.
- Optional pretty redirects: `/go/tangem` → affiliate URL (via `_redirects`) — trackable, updatable, cleaner in content.
- `aiGenerated: true` flag stays for transparency.

### SEO plan (Google indexing is a priority)
- Astro gives per-post canonical, meta description, OG/Twitter cards, `BlogPosting`/`NewsArticle` JSON-LD, sitemap.xml, RSS out of the box (with the integrations in Phase 1).
- Submit `news.duacrypto.com` to **Google Search Console** on day one (verify via DNS since domain is on Cloudflare); submit sitemap; request indexing for first posts.
- Each post: one target keyword (Albanian), keyword in title/H1/URL slug/first paragraph, 800+ words, internal links to 2–3 related posts and to duacrypto.com.
- hreflang pairs when English versions exist; `lang="sq"` on Albanian pages.
- Cross-link from the main site (nav "News" link + blog redirects) to pass domain authority to the subdomain.
- Fast Core Web Vitals by default (static Astro, WebP images, self-hosted fonts — copy main site setup).

---

## Phase 0 — Decisions (do these first)

1. **Separate repo** (`duacrypto-news`) — keeps the news site's AI automation, deploys, and content churn away from the main site. Recommended over stuffing it into this repo.
2. **Framework: Astro** — built for content sites: markdown/MDX posts with frontmatter, content collections, RSS, sitemap, zero JS by default, deploys perfectly to Cloudflare Pages. Alternatives (Hugo, plain Vite) are viable but Astro gives the most for the least custom code.
3. **Hosting: Cloudflare Pages** (same account as dc-site), new project `dc-news`, custom domain `news.duacrypto.com` (one CNAME, auto-TLS since duacrypto.com DNS is already on Cloudflare).
4. **Content format: Markdown with frontmatter** — this is the key enabler for AI automation. A post is just a `.md` file; publishing = committing a file; the pipeline is git-native.

```yaml
---
title: "Bitcoin Hits New High"
description: "…"
pubDate: 2026-07-08
author: "DuaCrypto AI Desk"   # or human author
category: news | analysis | guides | community
tags: [bitcoin, balkans]
image: /img/posts/slug-hero.webp
draft: true                    # AI always creates drafts
aiGenerated: true              # transparency flag
---
```

---

## Phase 1 — Site skeleton & template (from scratch)

1. `npm create astro@latest duacrypto-news` — minimal template, TypeScript optional.
2. Add Tailwind v4 (match main site's look: same fonts Open Sans/Roboto, same color tokens copied from `src/css/input.css`, same dark-mode behavior via `theme-init.js` pattern).
3. Build the layout components:
   - `BaseLayout.astro` — head (SEO meta, OG/Twitter, JSON-LD `NewsArticle`/`BlogPosting`), header, footer.
   - Header: DuaCrypto logo linking back to duacrypto.com, nav (News / Analysis / Guides / Community), dark-mode toggle.
   - Footer: mirror of main site footer (reuse content from `src/partials/footer.html`).
4. Pages:
   - `/` — homepage: featured post hero + latest posts grid + category sections.
   - `/[category]/` — category listing pages with pagination.
   - `/posts/[slug]/` — article page: hero image, byline, date, reading time, tags, related posts, share links.
   - `/tags/[tag]/`, `/about/`, `/404`.
5. Content collection: `src/content/posts/*.md` with a zod schema enforcing the frontmatter above (build fails on malformed AI output — this is your safety net).
6. RSS feed (`@astrojs/rss`), sitemap (`@astrojs/sitemap`), robots.txt.
7. Migrate the 6 existing posts from `public/md/blog/*.md` into the new collection as the seed content.

**Deliverable:** site runs locally with real posts and looks on-brand.

## Phase 2 — Deploy & subdomain

1. Create GitHub repo `duacrypto-news`, push.
2. Cloudflare Pages: new project `dc-news`, connect the repo, build command `npm run build`, output `dist`. Every push to `main` auto-deploys — this is what makes AI publishing trivial later.
3. Custom domain: add `news.duacrypto.com` in the Pages project (Cloudflare creates the CNAME automatically).
4. Copy the security/cache `_headers` approach from the main site (HSTS, nosniff, frame deny, long cache for assets).
5. On the main site: add `/blog/* → https://news.duacrypto.com/posts/:slug` redirects in `public/_redirects`, and a "News" nav link.

**Deliverable:** https://news.duacrypto.com live with seed posts.

## Phase 3 — AI writing pipeline (automation)

The core idea: **AI writes a markdown file and opens a Pull Request. Merging the PR = publishing.** Git is the review queue, audit log, and rollback mechanism all at once.

### 3a. The generator script (`scripts/generate-post.mjs`)
1. Takes a topic (from a queue file `content-queue.yaml`, an RSS watchlist of crypto news sources, or a manual CLI arg).
2. Calls the **Claude API** (`claude-sonnet-5`) with a structured prompt: site voice/style guide, frontmatter schema, category rules, 800–1200 words, sources cited, Albanian-audience angle where relevant.
3. Validates the output against the zod schema, writes `src/content/posts/YYYY-MM-DD-slug.md` with `draft: true`.
4. Optionally generates/selects a hero image (or picks from a stock pool in `/img/posts/`).

### 3b. The automation (GitHub Actions)
1. **Cron workflow** (e.g. Mon/Wed/Fri 08:00): runs the generator, opens a PR titled "AI draft: {title}".
2. **You review the PR** on your phone/desktop — edit, approve, merge. Merge → auto-deploy → live. Reject → close PR.
3. Optional later: a "trusted categories" list that auto-merges (e.g. weekly market recap), keeping opinion/analysis human-reviewed. Start with 100% human review.
4. Secrets: `ANTHROPIC_API_KEY` stored as a GitHub Actions secret — never in the repo.

### 3c. The MCP / Claude Code option (interactive publishing)
Alongside the cron, you can publish conversationally:
- From Claude Code in the `duacrypto-news` repo: "write a post about X" → Claude writes the markdown, you review the diff, it commits and pushes → live in ~1 minute. No extra infrastructure needed; this works day one after Phase 2.
- Optionally add a small **MCP server** later exposing tools like `queue_topic`, `list_drafts`, `publish_draft` so any Claude client (desktop/mobile) can manage the pipeline. This is a nice-to-have, not required — the GitHub Actions + Claude Code combo covers everything.

**Deliverable:** posts appear as PRs automatically; you merge to publish.

## Phase 4 — Engagement & tracking features (views, clicks, and more)

The site is static, so live counters need a tiny backend: **Cloudflare Pages Functions + D1 (SQLite)** — same stack the main site already uses in `functions/`, free tier is more than enough.

### 4a. View counter ("eyes" on every post)
- D1 table: `views (slug TEXT PRIMARY KEY, count INTEGER, updated_at)`.
- Function `GET/POST /api/views/[slug]` — POST increments (called once per page load via a 1 KB script), GET returns the count.
- Rendered on the post page and on post cards: `👁 1,234` — social proof that also tells YOU which topics work.
- Bot filtering: ignore requests with bot user-agents; debounce per visitor (localStorage flag) so refreshes don't inflate counts.

### 4b. Affiliate click tracking
- The `/go/tangem` redirects become a Function instead of a static redirect: log click (slug it came from via `?from=`, timestamp, country from `request.cf.country`) to D1, then 302 to the affiliate URL.
- Now you can answer: *which post drives Tangem signups? Do Albanian posts convert better?* — per-post, per-affiliate click reports.

### 4c. Other high-value post features
- **Reading time** (build-time, free) — "5 min lexim" under the title.
- **Popular posts widget** — sidebar/footer "Më të lexuarat" fed by the view counts (cached 1 h).
- **Like/reaction button** (🧡 count, same D1 pattern as views) — zero-friction engagement signal, no login needed.
- **Share buttons** — Telegram (critical for your community), WhatsApp (huge in Albania), X, copy-link. Static, no JS libraries.
- **Related posts** (build-time, by shared tags) — keeps readers on site, boosts SEO.
- **Newsletter capture box** mid-article and at end — feeds the Gumroad funnel.
- **"Last updated" date** shown when a post is revised — Google rewards freshness signals.

### 4d. Private stats dashboard
- Simple `/admin/stats` page (protected by Cloudflare Access — free, ties to your Google login): table of posts × views × likes × affiliate clicks over time. This is where the scoring template pays off: compare each post's target profile against its real engagement.

**Effort:** ~1 day for views + clicks + likes (they share one D1 + one Functions pattern); dashboard another half day.

## Phase 5 — Growth & polish (later)

- Newsletter tie-in: RSS → email (reuse existing `newsletter.html` work; Buttondown/Mailchannels can send from RSS automatically).
- Auto-post to Telegram/X when a post publishes (GitHub Action on merge).
- Analytics (same GA setup as main site), search (Pagefind — static, free).
- Albanian translations (`/sq/` versions + hreflang) — the AI pipeline makes this cheap: one extra generation step per post.
- Comments via Giscus (GitHub discussions) if wanted.

---

## Order of work & effort estimate

| Step | What | Effort |
|---|---|---|
| 0 | Decisions above (confirm Astro + separate repo) | — |
| 1 | Scaffold Astro site, template, layouts, seed posts | 1–2 days |
| 2 | Deploy to Cloudflare Pages + subdomain + redirects | ~1 hour |
| 3a | Generator script + Claude API prompt | half day |
| 3b | GitHub Actions cron + PR flow | half day |
| 3c | Use Claude Code for interactive publishing | free (works immediately) |
| 4 | Views/clicks/likes tracking + stats dashboard | 1–1.5 days |
| 5 | Newsletter/social/search/translations | incremental |

## Key safeguards

- AI posts are **always drafts in PRs** — nothing goes live without a merge.
- Frontmatter schema validation fails the build on malformed content.
- `aiGenerated: true` flag kept in frontmatter (transparency, and lets you style/label these posts if you choose).
- API key only in GitHub secrets; rotation documented.
- Everything is a git commit → full history, instant rollback (`git revert` = unpublish).
