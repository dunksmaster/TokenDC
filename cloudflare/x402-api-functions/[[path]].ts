import { handle } from "hono/cloudflare-pages";
import { createSiteApiApp } from "../../lib/x402-site-api.mjs";

/** x402 / hono use Node built-ins (e.g. `url`); required for Pages Functions bundling. */
export const config = {
  compatibility_flags: ["nodejs_compat"],
};

interface Env {
  ASSETS: Fetcher;
  X402_PAY_TO?: string;
  X402_FACILITATOR_URL?: string;
  X402_NETWORK?: string;
  X402_PRICE?: string;
}

const app = createSiteApiApp();

export default app;
export const onRequest = handle(app);

export type { Env };
