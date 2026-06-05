# DNS migration — fix duacrypto.com for Cloudflare + Google indexing

## Current problem

| URL | Status |
|-----|--------|
| `https://duacrypto.com/` | Wrong/stale GitHub page, no robots/sitemap |
| `https://www.duacrypto.com/` | Correct Cloudflare Pages site |
| Nameservers | Still Dynadot (`ns1/ns2.dyna-ns.net`) until you switch |

Google indexes `https://duacrypto.com/` as canonical, but apex DNS still hits GitHub.

## Automated DNS fix (Cloudflare zone)

1. Create API token: [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Use **Edit zone DNS** template, scope **duacrypto.com**
   - Also keep **Cloudflare Pages Edit** for deploys

2. Run:

```powershell
$env:CLOUDFLARE_API_TOKEN="YOUR_TOKEN_WITH_DNS_EDIT"
npm run fix:dns
```

This script:
- Removes GitHub A records (`185.199.x.x`)
- Removes bad CNAMEs (`www` → `duacrypto.com`, stray `dc-site-4p3.pages.dev` name)
- Adds `@` + `www` CNAME → `dc-site-4p3.pages.dev` (proxied)
- Ensures MX + SPF + DMARC for PrivateEmail

## Manual Dynadot steps (required for DNS to go live)

Cloudflare DNS only applies after nameservers point to Cloudflare.

1. **Dynadot → Email Settings** → disable (unblocks nameserver change)
2. **Dynadot → Name Servers** → custom:
   - `aurora.ns.cloudflare.com`
   - `ernest.ns.cloudflare.com`
3. Wait 15–30 minutes

## Verify

```powershell
npm run diagnose:domain
curl.exe -s https://duacrypto.com/ | findstr "<title>"
curl.exe -sI https://duacrypto.com/robots.txt
curl.exe -sI https://duacrypto.com/sitemap.xml
```

Expected:
- All diagnose URLs: `OK`
- Title: `Bitcoin & Crypto Community in Albania | DuaCrypto Tirana`
- `robots.txt` and `sitemap.xml`: HTTP 200

## Google Search Console (after DNS fix)

1. [Google Search Console](https://search.google.com/search-console) → URL Inspection → `https://duacrypto.com/` → **Request indexing**
2. **Sitemaps** → submit only `https://duacrypto.com/sitemap.xml`
3. Remove any HTML URLs submitted as sitemaps (see `docs/SEO-CHECKLIST.md`)

## Cloudflare Pages custom domains

Workers & Pages → **dc-site** → Custom domains:
- `duacrypto.com` → must become **Active**
- `www.duacrypto.com` → already Active
