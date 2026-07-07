# Cloudflare Pages — production hosting

Production deploys on every push to `main` via **`.github/workflows/cloudflare-pages.yml`**
→ build `dist/` → **dc-site** on Cloudflare Pages.

**Cloudflare native Git is not connected** on `dc-site` (`Source: none`), so GitHub
Actions is the active deploy path. Optional later: connect Git in the dashboard and
then disable the push trigger here to avoid double-deploys.

## Cloudflare native Git build settings

Workers & Pages → **dc-site** → **Settings** → **Builds & deployments**:

| Setting | Value |
|--------|--------|
| Git repository | `dunksmaster/TokenDC` (connect via **Connect to Git**) |
| Production branch | `main` |
| Build command | `bash scripts/cloudflare-ci-build.sh` (or `npm run build`) |
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
- [x] GitHub Actions deploy on push (`cloudflare-pages.yml`) — uses `CLOUDFLARE_PAGES_API_TOKEN`
- [x] Legacy GitHub Pages workflow removed (`static.yml`)
- [x] `public/CNAME` removed (Cloudflare uses dashboard custom domains, not a CNAME file)
- [x] `dist/_headers` + `functions/_middleware.ts` inject `Link` headers on homepage

### 1b. Connect Git (Cloudflare dashboard — one-time)

1. Workers & Pages → **dc-site** → **Settings** → **Builds & deployments** → **Connect to Git**
2. Authorize the GitHub app for `dunksmaster/TokenDC`, pick branch `main`
3. Set build command `bash scripts/cloudflare-ci-build.sh`, output `dist` (table above)
4. Trigger a deployment and confirm it builds green

### 2. Cloudflare Dashboard

[Workers & Pages](https://dash.cloudflare.com/) → **dc-site** → **Settings** → **Build**:

| Setting | Value |
|--------|--------|
| Build command | `bash scripts/cloudflare-ci-build.sh` |
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

## GitHub Actions secrets

Two tokens — **do not reuse the DNS token for Pages deploy** (HTTP 403).

| Secret | Used by | Permissions |
|--------|---------|-------------|
| `CLOUDFLARE_PAGES_API_TOKEN` | `cloudflare-pages.yml` | Account → **Cloudflare Pages → Edit** |
| `CLOUDFLARE_API_TOKEN` | `fix-dns.yml` | Zone → **DNS → Edit** on `duacrypto.com` |
| `CLOUDFLARE_ACCOUNT_ID` | both | Account ID from Cloudflare dashboard |

Refresh Pages token from Wrangler login: `node scripts/set-pages-github-secret.mjs`

**Local wrangler OAuth expired?** Run `npx wrangler login`, then `node scripts/set-pages-github-secret.mjs` and `npm run verify:cf-token` with `CLOUDFLARE_PAGES_API_TOKEN` set.

**Stop duplicate failing checks:** if `Workers Builds: dc-site` fails on PRs but GitHub `verify` passes, either fix dashboard settings (table above) or **disconnect Git** on dc-site and rely on GitHub Actions only (Option A below).

### Manual deploy (no GitHub secrets)

```bash
npm run build
npx wrangler login
npm run deploy:production
npx wrangler pages domain add duacrypto.com --project-name=dc-site
```

## GitHub checks troubleshooting

### `Verify build` — cancelled (red X on PR)

Harmless. GitHub cancelled an older run when a newer commit was pushed to the same PR (`cancel-in-progress` was enabled). **Check the latest run** — it should be green. Workflow updated to `cancel-in-progress: false` to reduce confusion.

### `Verify build` — failed

Run locally (must match CI):

```bash
export SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)
npm ci && npm run build && npm run verify:build
```

### `Workers Builds: dc-site` — failed (Cloudflare native Git)

This check comes from **Cloudflare Dashboard → Git connected to repo**, not from `.github/workflows/verify-build.yml`. Our GitHub Action build can pass while Cloudflare's native builder still fails if dashboard settings are wrong.

**Dashboard → Workers & Pages → dc-site → Settings → Builds:**

| Setting | Required value |
|---------|----------------|
| Build command | `bash scripts/cloudflare-ci-build.sh` |
| Build output directory | `dist` |
| **Deploy command** | **empty** (not `wrangler versions upload`) |
| Node.js version | `22` (or rely on `.node-version`) |
| Root directory | `/` |

Open the failed build log from the check link (Cloudflare dashboard) and look for:

- `Authentication error` / HTTP 401 → wrong or expired API token in Cloudflare Git integration
- `wrangler versions upload` → remove Deploy command (Pages, not Workers)
- `sharp` / `npm ci` errors → ensure Node 22 and `package-lock.json` is committed

**Recommended:** use **one** deploy path to avoid double builds:

- **Option A (current docs):** GitHub Actions `cloudflare-pages.yml` only — disconnect Git in Cloudflare dashboard
- **Option B:** Cloudflare native Git only — disable `on: push` in `cloudflare-pages.yml`

### `Deploy to Cloudflare Pages` on `main` — failed (HTTP 401)

GitHub secret `CLOUDFLARE_PAGES_API_TOKEN` is missing, expired, or is the DNS-only token.

```bash
# After: wrangler login (Pages Edit permission)
node scripts/set-pages-github-secret.mjs
```

Re-run: Actions → Deploy to Cloudflare Pages → Run workflow.

