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

Local dev (`npm run dev`) and Cloudflare Pages also inject the same `Link` value via `lib/agent-discovery-headers.mjs` (Vite middleware + `functions/_middleware.ts` + `dist/_headers`).

## Interim: GitHub Pages + Cloudflare proxy (Transform Rule)

If you must keep GitHub Pages as origin but want `Link` headers on `duacrypto.com` before migrating:

1. In Cloudflare Dashboard → **Rules** → **Response Header Transform Rules** → **Create rule**
2. **Name:** `Agent discovery Link headers (homepage)`
3. **When:** `(http.host eq "duacrypto.com" or http.host eq "www.duacrypto.com") and (http.request.uri.path eq "/" or http.request.uri.path eq "/index.html")`
4. **Then:** Set static response header  
   **Header name:** `Link`  
   **Value:** (copy from `public/_headers` line 2, or run `node -e "import('./lib/agent-discovery-headers.mjs').then(m=>console.log(m.LINK_HEADER))"`)

Orange-cloud proxy must be enabled on the GitHub Pages CNAME. HTML `<link rel="api-catalog">` tags in `index.html` are a fallback for parsers that read the document, but agent scanners expect the **response** header.

## Local / CLI deploy

```bash
npm run build
npx wrangler login
npm run deploy
```

Requires `CLOUDFLARE_API_TOKEN` in CI (GitHub Actions workflow `cloudflare-pages.yml` on `main`).
