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
- Publishes **DNS-AID** HTTPS records (`_index._agents`, `_mcp._agents`) and enables **DNSSEC**

## Manual Dynadot steps (required for DNS to go live)

Cloudflare DNS only applies after nameservers point to Cloudflare.

1. **Dynadot → Email Settings** → disable (unblocks nameserver change)
2. **Dynadot → Name Servers** → custom:
   - `aurora.ns.cloudflare.com`
   - `ernest.ns.cloudflare.com`
3. **Dynadot → DNSSEC** → add DS records printed by `npm run fix:dns` (or Cloudflare dashboard → DNS → DNSSEC)
4. Wait 15–30 minutes

## Verify

```powershell
npm run diagnose:domain
npm run verify:auth-md
npm run verify:dns-aid
curl.exe -s https://duacrypto.com/ | findstr "<title>"
curl.exe -sI https://duacrypto.com/robots.txt
curl.exe -sI https://duacrypto.com/sitemap.xml
```

Expected:
- All diagnose URLs: `OK`
- `verify:auth-md`: `/auth.md` 200, PRM + `agent_auth` block present
- `verify:dns-aid`: `_index._agents` HTTPS records, DNSSEC AD=true, DS at parent
- Title: `Bitcoin & Crypto Community in Albania | DuaCrypto Tirana`
- `robots.txt` and `sitemap.xml`: HTTP 200

## Agent discovery (auth.md + DNS-AID)

**auth.md** (HTTP — deploy first): push to `main` so Cloudflare Pages serves:

- `/auth.md` — agent registration guide (`# auth.md` heading)
- `/.well-known/oauth-protected-resource` — PRM with `authorization_servers`
- `/.well-known/oauth-authorization-server` — includes `agent_auth` block

Regenerate and build locally: `npm run agent:generate && npm run build`

**DNS-AID** (DNS — after NS cutover): `npm run publish:dns-aid` or `npm run fix:dns` publishes:

```
_index._agents.duacrypto.com. 3600 IN HTTPS 1 duacrypto.com. alpn="h3,h2" port=443 mandatory=alpn,port
_mcp._agents.duacrypto.com.   3600 IN HTTPS 1 duacrypto.com. alpn="mcp,h3,h2" port=443 mandatory=alpn,port
```

[isitagentready](https://isitagentready.com/) scans `https://duacrypto.com` — both checks fail until apex DNS points to Cloudflare **and** the latest build is deployed.

## Google Search Console (after DNS fix)

1. [Google Search Console](https://search.google.com/search-console) → URL Inspection → `https://duacrypto.com/` → **Request indexing**
2. **Sitemaps** → submit only `https://duacrypto.com/sitemap.xml`
3. Remove any HTML URLs submitted as sitemaps (see `docs/SEO-CHECKLIST.md`)

## Cloudflare Pages custom domains

Workers & Pages → **dc-site** → Custom domains:
- `duacrypto.com` → must become **Active**
- `www.duacrypto.com` → already Active
