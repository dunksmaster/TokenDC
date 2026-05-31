# DuaCrypto SEO Checklist

Operational checklist for search visibility, rich results, and post-deploy verification for [duacrypto.com](https://duacrypto.com).

---

## 1. Search Console & Webmaster Tools

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property **URL prefix**: `https://duacrypto.com`.
3. Verify ownership (HTML file upload, DNS TXT, or Google Analytics if already linked — site uses GA4 `G-BH7BJVBLP2`).
4. Submit sitemap: `https://duacrypto.com/sitemap.xml`.
5. Request indexing for key URLs after deploy: `/`, `/about.html`, `/events.html`, `/faq.html`, `/bitcoin-for-corporations.html`.
6. Monitor **Pages**, **Core Web Vitals**, and **Enhancements** (FAQ, Organization) weekly.

### GSC cleanup (one-time)

If HTML page URLs were previously submitted as sitemaps (e.g. `https://duacrypto.com/index.html` as a sitemap entry), **remove them** under **Sitemaps**. Keep only:

- `https://duacrypto.com/sitemap.xml`

Individual page URLs belong in **URL Inspection → Request indexing**, not as separate sitemap submissions.

### Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add site `https://duacrypto.com` (import from GSC if available).
3. Submit the same sitemap URL.
4. Review crawl errors and SEO reports monthly.

---

## 2. Google Business Profile (Tirana)

1. Go to [Google Business Profile](https://business.google.com).
2. Create or claim listing: **DuaCrypto**, category *Education* or *Community organization*.
3. Address: Tirana, Albania (use exact meetup address if public).
4. Email: info@duacrypto.com · Website: `https://duacrypto.com`.
5. Add photos from `/events.html` (Bitcoin Pizza Day, Balkans Crypto).
6. Post event updates linking to `events.html`.

---

## 3. Testing Tools (post-deploy)

| Tool | URL | What to check |
|------|-----|----------------|
| PageSpeed Insights | https://pagespeed.web.dev/ | LCP, CLS, mobile performance on `/` and `/events.html` |
| Rich Results Test | https://search.google.com/test/rich-results | FAQPage (`faq.html`), Event (`events.html`), Organization |
| Schema Validator | https://validator.schema.org/ | Paste page URL or JSON-LD from view-source |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly | All indexable pages |

---

## 4. Keyword clusters

### English (primary)

| Cluster | Target pages | Example phrases |
|---------|--------------|-----------------|
| Albania crypto community | `/`, `/about.html` | crypto community Albania, Albanian crypto group |
| Bitcoin Tirana | `/`, `/events.html` | Bitcoin Tirana, Bitcoin meetup Albania |
| Web3 education Balkans | `/service.html`, `/feature.html` | Web3 education Balkans, blockchain workshop Albania |
| Crypto events Albania | `/events.html` | crypto events Tirana, Balkans Crypto 2025 |

### Albanian (secondary / local)

| Cluster | Suggested phrases |
|---------|-------------------|
| Komuniteti kripto | komuniteti kripto Shqipëri, komuniteti Bitcoin Tirana |
| Edukim Web3 | edukim blockchain Shqipëri, mëso Bitcoin shqip |
| Evente kripto | evente kripto Tirana, takime Bitcoin |

Use Albanian naturally in event posts, Telegram, and future `/sq/` pages if added — avoid keyword stuffing on English pages.

---

## 5. On-site SEO (implemented in codebase)

- **Titles:** `Topic | DuaCrypto` via `scripts/seo-config.mjs` + `scripts/inject-seo.mjs`
- **Canonical URLs:** `https://duacrypto.com/...` on all indexable pages
- **Open Graph & Twitter cards:** injected at build via `npm run agent:generate`
- **JSON-LD:** Organization, WebSite (+ SearchAction on homepage), BreadcrumbList, FAQPage, Event
- **Sitemap:** `scripts/generate-agent-assets.mjs` — includes `privacy.html`, `terms.html`; excludes `404.html`, `$10.html`

To refresh SEO blocks and sitemap after editing `seo-config.mjs`:

```bash
npm run agent:generate
```

---

## 6. Post-deploy checklist

- [ ] `https://duacrypto.com/robots.txt` returns sitemap reference
- [ ] `https://duacrypto.com/sitemap.xml` lists all public pages (incl. privacy, terms, bitcoin-for-corporations)
- [ ] Homepage title: **Bitcoin & Crypto Community in Albania | DuaCrypto Tirana**
- [ ] Default OG image loads: `https://duacrypto.com/img/og-default.png` (1200×630)
- [ ] One `<h1>` per indexable page
- [ ] `/privacy.html` and `/terms.html` return 200 (no footer 404s)
- [ ] `/token.html` returns **301** to `/bitcoin-for-corporations.html`
- [ ] Rich Results Test passes for FAQ and Event pages
- [ ] GSC sitemap status: Success (only `sitemap.xml` submitted — no HTML URLs as sitemaps)
- [ ] No critical Core Web Vitals regressions on mobile
- [ ] Internal links in footer/nav resolve correctly

---

## 7. Ongoing content tasks

- Add new events to `events.html` and update Event JSON-LD dates in `scripts/seo-config.mjs`
- Keep FAQ answers in sync between `faq.html` and `seo-config.mjs` FAQ entries
- Publish fresh content (event recaps, guides) to support long-tail Bitcoin/Web3 queries
- Review Search Console queries quarterly; expand FAQ or service copy for high-impression/low-click terms

---

## 8. Files reference

| File | Purpose |
|------|---------|
| `scripts/seo-config.mjs` | Page titles, descriptions, JSON-LD data |
| `scripts/inject-seo.mjs` | Injects canonical, OG, Twitter, JSON-LD into HTML |
| `scripts/generate-agent-assets.mjs` | Sitemap, robots.txt, markdown mirrors, runs SEO inject |
