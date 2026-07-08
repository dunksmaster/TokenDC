/**
 * Cloudflare Pages `_headers` blocks for site-wide security, caching, and CSP.
 * Merged into public/_headers by scripts/generate-agent-assets.mjs on every build.
 */

/** Site-wide security headers applied to all paths via `/*`. */
export function globalSecurityHeadersBlock() {
  const cspHeader =
    process.env.CSP_ENFORCE === "1"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";

  const cspValue = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;",
    "style-src 'self' 'unsafe-inline';",
    "font-src 'self' data:;",
    "img-src 'self' data: https:;",
    "connect-src 'self' https://www.google-analytics.com https://formspree.io;",
    "frame-src https://www.google.com;",
    "form-action 'self' https://formspree.io;",
    "base-uri 'self';",
    "object-src 'none';",
    "frame-ancestors 'none'",
  ].join(" ");

  return [
    "/*",
    "  X-Frame-Options: DENY",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
    "  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    `  ${cspHeader}: ${cspValue}`,
  ].join("\n");
}

/** Long-lived cache for static assets (Vite hashes built JS/CSS; images are content-addressed by deploy). */
export function staticCacheHeadersBlocks() {
  const cache = "  Cache-Control: public, max-age=31536000, immutable";
  return ["/img/*", "/css/*", "/js/*", "/webp/*", "/fonts/*", "/vendor/*"]
    .map((path) => `${path}\n${cache}`)
    .join("\n\n");
}

/** Full `_headers` file body (discovery blocks passed in from agent-discovery-headers). */
export function buildHeadersFile(homeDiscoveryBlock) {
  return [
    globalSecurityHeadersBlock(),
    "",
    staticCacheHeadersBlocks(),
    "",
    "/",
    homeDiscoveryBlock,
    "",
    "/index.html",
    homeDiscoveryBlock,
    "",
    "/.well-known/api-catalog",
    '  Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    "",
    "/robots.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "",
    "/sitemap.xml",
    "  Content-Type: application/xml; charset=utf-8",
    "",
    "/site.webmanifest",
    "  Content-Type: application/manifest+json; charset=utf-8",
    "  Cache-Control: public, max-age=86400",
    "",
    "/auth.md",
    "  Content-Type: text/markdown; charset=utf-8",
    "",
    "/md/*",
    "  Content-Type: text/markdown; charset=utf-8",
    "  Vary: Accept",
    "",
    "/.well-known/http-message-signatures-directory",
    "  Content-Type: application/http-message-signatures-directory+json; charset=utf-8",
    "  Cache-Control: max-age=86400",
    "",
    "/.well-known/jwks.json",
    "  Content-Type: application/json; charset=utf-8",
    "",
  ].join("\n");
}
