import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

export const DEFAULT_PAY_TO = "0x26507ccEEaB8C073620205Bf4aE1cd50E9f612af";
export const DEFAULT_FACILITATOR = "https://x402.org/facilitator";
export const DEFAULT_NETWORK = "eip155:84532";
export const DEFAULT_PRICE = "$0.001";

const PROTECTED_ROUTE = "GET /api/v1/site/pages";

/** @typedef {{ ASSETS?: { fetch: (req: Request) => Promise<Response> }, X402_PAY_TO?: string, X402_FACILITATOR_URL?: string, X402_NETWORK?: string, X402_PRICE?: string }} SiteApiEnv */

/**
 * @param {SiteApiEnv} env
 */
export function resolveX402Config(env = {}) {
  return {
    payTo: /** @type {`0x${string}`} */ (env.X402_PAY_TO ?? DEFAULT_PAY_TO),
    facilitatorUrl: env.X402_FACILITATOR_URL ?? DEFAULT_FACILITATOR,
    network: env.X402_NETWORK ?? DEFAULT_NETWORK,
    price: env.X402_PRICE ?? DEFAULT_PRICE,
  };
}

/**
 * @param {SiteApiEnv} env
 */
function buildPaymentMiddleware(env) {
  const { payTo, facilitatorUrl, network, price } = resolveX402Config(env);
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    network,
    new ExactEvmScheme()
  );

  return resourceServer.initialize().then(() =>
    paymentMiddleware(
      {
        [PROTECTED_ROUTE]: {
          accepts: {
            scheme: "exact",
            price,
            network,
            payTo,
          },
          description: "Full site page index for AI agents and integrations",
          mimeType: "application/json",
        },
      },
      resourceServer,
      undefined,
      undefined,
      false
    )
  );
}

/** @type {Map<string, Promise<import("hono").MiddlewareHandler>>} */
const middlewareCache = new Map();

/**
 * @param {SiteApiEnv} env
 */
function getPaymentMiddleware(env) {
  const key = JSON.stringify(resolveX402Config(env));
  let middlewarePromise = middlewareCache.get(key);
  if (!middlewarePromise) {
    middlewarePromise = buildPaymentMiddleware(env);
    middlewareCache.set(key, middlewarePromise);
  }
  return middlewarePromise;
}

/**
 * @param {{ fetchAsset?: (path: string, request: Request) => Promise<Response | null> }} [options]
 */
export function createSiteApiApp(options = {}) {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const middleware = await getPaymentMiddleware(c.env ?? {});
    return middleware(c, next);
  });

  app.get("/api/v1/site/health", (c) =>
    c.json({
      status: "ok",
      service: "duacrypto-site-api",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      x402: {
        facilitator: resolveX402Config(c.env ?? {}).facilitatorUrl,
        protectedRoutes: ["/api/v1/site/pages"],
      },
    })
  );

  app.get("/api/v1/site/pages", async (c) => {
    const assetPath = "/api/v1/site/pages";
    if (options.fetchAsset) {
      const asset = await options.fetchAsset(assetPath, c.req.raw);
      if (asset) return asset;
    }
    if (c.env?.ASSETS) {
      const asset = await c.env.ASSETS.fetch(
        new Request(new URL(assetPath, c.req.url), c.req.raw)
      );
      if (asset.ok) return asset;
    }
    return c.json({ error: "pages index unavailable" }, 503);
  });

  app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));

  return app;
}
