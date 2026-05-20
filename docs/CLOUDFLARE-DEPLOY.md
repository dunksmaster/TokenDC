# Cloudflare Pages deploy (Link headers / agent discovery)

## Why agent scans fail today

1. **Cloudflare builds are failing** — the Git integration uses deploy command `npx wrangler versions upload`, which is for Workers, not Pages. The Vite build succeeds; only deploy fails.
2. **duacrypto.com still serves GitHub Pages** — `curl -I https://duacrypto.com/` shows `Server: GitHub.com` and no `Link` header. GitHub Pages cannot set custom response headers.

## Fix Cloudflare (required)

In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **dc-site** → **Settings** → **Build**:

| Setting | Value |
|--------|--------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **Leave empty** (recommended) |

Do **not** use `npx wrangler versions upload`. That command is for Workers with a script entrypoint, not for this static Pages site with `functions/`.

Optional alternative deploy command (if your project requires one):

```bash
npm run deploy
```

Then **Retry deployment** on the latest failed build, or push any commit to `backup-working-state` to trigger a new build.

## Point the custom domain at Cloudflare

After a successful Pages deploy:

1. In **dc-site** → **Custom domains**, add `duacrypto.com` (and `www` if used).
2. In **GitHub** → repo **Settings** → **Pages**, remove `duacrypto.com` as a custom domain (so DNS is not split).
3. Update DNS at your registrar: apex/`www` CNAME to the hostname Cloudflare shows (or use Cloudflare DNS).

## Verify Link headers

```bash
curl.exe -sI https://duacrypto.com/ | findstr /i link
```

You should see:

```http
Link: </.well-known/api-catalog>; rel="api-catalog", ...
```

Or run:

```bash
npm run verify:headers -- https://duacrypto.com/
```

## Local / CLI deploy

```bash
npm run build
npx wrangler login
npm run deploy
```

Requires `CLOUDFLARE_API_TOKEN` in CI (GitHub Actions workflow `cloudflare-pages.yml` on `main`).
