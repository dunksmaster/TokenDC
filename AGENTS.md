# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

DuaCrypto is a static crypto community website built with Vite + Tailwind CSS. It features AI agent discovery infrastructure (`.well-known` endpoints, OpenAPI spec, MCP server card, markdown content negotiation) and x402 HTTP payment endpoints.

### Running the dev server

```bash
npm run dev
```

Starts Vite on port 5173 with HMR. The `dev` script first runs `scripts/generate-agent-assets.mjs` to regenerate agent discovery assets, then launches Vite.

### Build

```bash
npm run build
```

Produces `dist/` with all static assets. No separate backend or database.

### Available tests

- `npm run test:markdown` — Unit tests for markdown content negotiation logic (always passes)
- `npm run test:markdown -- --integration http://localhost:5173` — Integration test (requires dev server running; note: uses `curl.exe` on Windows, will fail on Linux with ENOENT — this is a known limitation)
- `npm run verify:headers -- http://localhost:5173` — Verifies Link headers for agent discovery are served correctly

### Key caveats

- There is **no ESLint or TypeScript** configured in this project — no lint command exists.
- The `postinstall` script (`scripts/patch-wrangler-templates.mjs`) patches wrangler internals to work around Cloudflare Pages bundling issues. It runs automatically on `npm install`/`npm ci`.
- The x402 API plugin (`vite-plugins/x402-api.js`) is **not loaded in vite.config.js** by default. The `/api/*` routes will return 404 unless the plugin is explicitly added to the Vite config.
- Environment variables in `.env.example` are all **optional** for local development.
- The `scripts/test-markdown-negotiation.mjs` integration test uses `curl.exe` (Windows) — on Linux, the unit test portion passes but integration test fails with `spawn curl.exe ENOENT`.
