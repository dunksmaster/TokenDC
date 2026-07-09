# Google Search Console — operator checklist

Automated preflight: `npm run verify:sitemap` (TokenDC) and `npm run verify:gsc-preflight` (both sites).

## duacrypto.com

1. Open [Google Search Console](https://search.google.com/search-console)
2. Property: `https://duacrypto.com`
3. **Sitemaps** → submit `https://duacrypto.com/sitemap.xml`
4. **URL Inspection** → Request indexing:
   - `https://duacrypto.com/newsletter.html`
   - `https://duacrypto.com/events.html`
   - `https://duacrypto.com/blog/index.html` (redirects to news — still worth indexing once)

## news.duacrypto.com

1. Add property: URL prefix `https://news.duacrypto.com`
2. Verify via DNS TXT or HTML (Cloudflare Pages deploy)
3. **Sitemaps** → submit `https://news.duacrypto.com/sitemap-index.xml`

## Done when

Both sitemaps show **Success** in GSC within 48h.
