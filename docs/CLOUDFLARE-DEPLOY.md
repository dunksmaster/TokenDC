# Cloudflare Pages — production hosting

Production deploys from `main` via `.github/workflows/cloudflare-pages.yml` → **dc-site** on Cloudflare Pages.

GitHub Pages (`static.yml`) is **legacy / manual only** — it cannot set RFC 8288 `Link` response headers.

## Migration checklist (GitHub Pages → Cloudflare)

### 1. Code & CI (done in repo)

- [x] Cloudflare workflow deploys on every `main` push
- [x] GitHub Pages workflow disabled on push (`workflow_dispatch` only)
- [x] `public/CNAME` removed (Cloudflare uses dashboard custom domains, not a CNAME file)
- [x] `dist/_headers` + `functions/_middleware.ts` inject `Link` headers on homepage

### 2. Cloudflare Dashboard

[Workers & Pages](https://dash.cloudflare.com/) → **dc-site** → **Settings** → **Build**:

| Setting | Value |
|--------|--------|
| Build command | *(leave empty — GitHub Actions builds)* |
| Build output directory | `dist` |
| **Deploy command** | **Leave empty** |

Do **not** use `npx wrangler versions upload` (Workers-only; breaks Pages).

### 3. Custom domain

1. **dc-site** → **Custom domains** → add `duacrypto.com` (and `www.duacrypto.com` if used)
2. Cloudflare shows the DNS records to create (usually CNAME to `dc-site.pages.dev` or apex A/AAAA)

### 4. DNS (required — site stays on GitHub until this is done)

Current `duacrypto.com` resolves to GitHub Pages (`185.199.x.x`). Update DNS:

- **If the zone is on Cloudflare:** orange-cloud proxy on; follow the records Pages suggests when adding the custom domain
- **If DNS is elsewhere:** point apex/`www` to Cloudflare Pages per the custom-domain wizard (may require moving the zone to Cloudflare for apex)

### 5. Remove GitHub Pages custom domain

[GitHub repo Settings → Pages](https://github.com/dunksmaster/TokenDC/settings/pages) → remove `duacrypto.com` as custom domain so TLS/DNS are not split.

Or via CLI:

```bash
gh api --method PUT repos/dunksmaster/TokenDC/pages \
  --input - <<< '{"build_type":"workflow","source":{"branch":"main","path":"/"},"cname":null}'
```

### 6. Verify

```bash
npm run verify:headers -- https://duacrypto.com/
curl.exe -sI https://duacrypto.com/ | findstr /i "link server"
```

Expect `Server: cloudflare` and a `Link:` header with `rel="api-catalog"`.

Preview (before DNS cutover):

```bash
npm run verify:headers -- https://main.dc-site.pages.dev/
```

## Link header sources

Single source of truth: `lib/agent-discovery-headers.mjs`

| Layer | File |
|-------|------|
| Static headers | `public/_headers` → `dist/_headers` |
| Edge middleware | `functions/_middleware.ts` |
| Local dev | `vite-plugins/agent-discovery.js` |
| HTML fallback | `index.html` `<link rel="api-catalog">` tags |

## Local / manual deploy

```bash
npm run build
npx wrangler login
npm run deploy:production
```

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions secrets.

## GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Pages deploy + domain attach |
| `CLOUDFLARE_ACCOUNT_ID` | Account scope for wrangler |

Token permissions: **Cloudflare Pages Edit**, **Account Settings Read** (minimum).
