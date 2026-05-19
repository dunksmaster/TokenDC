# x402 Pages Function (disabled in default deploy)

This route was moved out of `functions/api/` because `@x402/hono` pulls Node built-ins (`url`) that break the Pages Functions bundle, which also blocked `functions/_middleware.ts` (Markdown for Agents + Link headers).

Re-enable after bundling is fixed (e.g. `nodejs_compat` support for the x402 dependency graph), or deploy x402 as a separate Worker.

Local dev: `/api/*` is served by `vite-plugins/x402-api.js`.
