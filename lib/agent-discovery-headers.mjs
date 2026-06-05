/**
 * RFC 8288 / RFC 9727 §3 — homepage Link response headers for agent discovery.
 * @see https://www.rfc-editor.org/rfc/rfc8288
 * @see https://www.rfc-editor.org/rfc/rfc9727#section-3
 */

export const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

/** @type {{ href: string; rel: string; type?: string }[]} */
export const DISCOVERY_LINKS = [
  { href: "/.well-known/api-catalog", rel: "api-catalog" },
  { href: "/.well-known/agent-skills/index.json", rel: "describedby" },
  {
    href: "/openapi/site-api.yaml",
    rel: "service-desc",
    type: "application/yaml",
  },
  { href: "/docs/api", rel: "service-doc", type: "text/html" },
  {
    href: "/.well-known/mcp/server-card.json",
    rel: "describedby",
    type: "application/json",
  },
];

/** @param {{ href: string; rel: string; type?: string }} link */
export function formatLinkTarget(link) {
  let value = `<${link.href}>; rel="${link.rel}"`;
  if (link.type) value += `; type="${link.type}"`;
  return value;
}

/** Comma-separated Link header value for homepage responses. */
export const LINK_HEADER = DISCOVERY_LINKS.map(formatLinkTarget).join(", ");

/** Cloudflare Pages `_headers` block for `/` and `/index.html`. */
export function cloudflareHeadersBlock() {
  const lines = [
    `  Link: ${LINK_HEADER}`,
    `  Content-Signal: ${CONTENT_SIGNAL}`,
    "  Vary: Accept",
  ];
  return lines.join("\n");
}
