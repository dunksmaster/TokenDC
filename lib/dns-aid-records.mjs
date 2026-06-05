/**
 * DNS for AI Discovery (DNS-AID) — SVCB/HTTPS records under _agents.<domain>.
 * Published as SVCB (type 64) for DNSSEC validation on cloudflare-dns.com.
 * @see https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/
 * @see https://www.rfc-editor.org/rfc/rfc9460
 */

export const ZONE_NAME = "duacrypto.com";

/** Canonical hostname for TLS (not pages.dev). */
export const CANONICAL_TARGET = ZONE_NAME;

/** RR type published at Cloudflare (SVCB validates with AD=true on isitagentready). */
export const DNS_AID_RR_TYPE = "SVCB";

/**
 * ServiceMode SVCB records published at Cloudflare (DNS-only, not proxied).
 * @type {{ name: string; priority: number; target: string; value: string; comment: string }[]}
 */
export const DNS_AID_HTTPS_RECORDS = [
  {
    name: "_index._agents",
    priority: 1,
    target: CANONICAL_TARGET,
    value: 'alpn="h3,h2" port=443 mandatory=alpn,port',
    comment: "DNS-AID organization index entrypoint (RFC 9460 SVCB)",
  },
  {
    name: "_mcp._agents",
    priority: 1,
    target: CANONICAL_TARGET,
    value: 'alpn="mcp,h3,h2" port=443 mandatory=alpn,port',
    comment: "DNS-AID MCP server at https://duacrypto.com/mcp",
  },
];

/** Zone-file style lines for documentation and manual BIND import. */
export function dnsAidZoneFileLines(zone = ZONE_NAME) {
  return DNS_AID_HTTPS_RECORDS.map((r) => {
    const fqdn = `${r.name}.${zone}`;
    return `${fqdn}. 3600 IN SVCB ${r.priority} ${r.target}. ${r.value}`;
  });
}
