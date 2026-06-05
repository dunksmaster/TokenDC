# Cloudflare Pages — production hosting

Production deploys on every push to `main` via **`.github/workflows/cloudflare-pages.yml`**
→ build `dist/` → **dc-site** on Cloudflare Pages.

Optional: connect **Cloudflare native Git** in the dashboard instead — if you do,
disable the push trigger in `cloudflare-pages.yml` to avoid double-deploys.
- GitHub Pages (`static.yml`) is **legacy / manual only** — it cannot set RFC 8288 `Link` response headers.

## Cloudflare native Git build settings

Workers & Pages → **dc-site** → **Settings** → **Builds & deployments**:

| Setting | Value |
|--------|--------|
| Git repository | `dunksmaster/TokenDC` (connect via **Connect to Git**) |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | `22` (pinned via `.node-version`) |

`functions/` (Pages Functions) and `dist/_headers` are picked up automatically.
Do **not** set a Deploy command and never use `npx wrangler versions upload` (Workers-only; breaks Pages).

## Migration checklist (GitHub → Cloudflare)

### 1. Code & repo (done in repo)

- [x] `wrangler.toml` configured for Pages project `dc-site` (`pages_build_output_dir = "dist"`)
- [x] `.node-version` pins Node 22 for Cloudflare's native builder
- [x] `esbuild` declared as an explicit devDependency (used by `scripts/build-theme-assets.mjs`)
- [x] GitHub Actions Cloudflare workflow set to manual-only (no push trigger → no double deploys)
- [x] GitHub Pages workflow disabled on push (`workflow_dispatch` only)
- [x] `public/CNAME` removed (Cloudflare uses dashboard custom domains, not a CNAME file)
- [x] `dist/_headers` + `functions/_middleware.ts` inject `Link` headers on homepage

### 1b. Connect Git (Cloudflare dashboard — one-time)

1. Workers & Pages → **dc-site** → **Settings** → **Builds & deployments** → **Connect to Git**
2. Authorize the GitHub app for `dunksmaster/TokenDC`, pick branch `main`
3. Set build command `npm run build`, output `dist` (table above)
4. Trigger a deployment and confirm it builds green

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

### 4. DNS (apex cutover — done when NS point to Cloudflare)

If apex still resolves to GitHub Pages (`185.199.x.x`), update DNS:

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
npm run verify:headers -- https://dc-site-4p3.pages.dev/
```

(Custom domains like `duacrypto.com` are attached in Cloudflare Dashboard → **dc-site** → **Custom domains** — wrangler v4 has no `pages domain add` CLI.)

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

## GitHub Actions secrets (required for deploy on push)

`cloudflare-pages.yml` deploys on every push to `main`. The token must include
**Account → Cloudflare Pages → Edit** (use **Edit Cloudflare Workers** template).
A **DNS-only** token works for `fix-dns` but will fail deploy with `Authentication error [10000]`.

1. [Create API token](https://dash.cloudflare.com/profile/api-tokens) → **Edit Cloudflare Workers** template (Pages deploy). For `fix-dns`, also add **Zone → DNS → Edit** on `duacrypto.com`.
2. Copy **Account ID** from Cloudflare Dashboard → Workers & Pages (right sidebar)
3. GitHub → **dunksmaster/TokenDC** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | API token from step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from step 2 |

4. Re-run **Deploy to Cloudflare Pages** workflow (or push any commit to `main`)

CLI alternative (one-time, from your machine):

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

### Manual deploy (no GitHub secrets)

```bash
npm run build
npx wrangler login
npm run deploy:production
npx wrangler pages domain add duacrypto.com --project-name=dc-site
```
