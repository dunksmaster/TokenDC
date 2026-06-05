/** Shared Cloudflare DNS API helpers for fix-dns and DNS-AID publish scripts. */

export const ZONE_NAME = "duacrypto.com";

/** Normalize DNS names from the Cloudflare API (strip trailing dot, lowercase). */
export function normDnsName(name) {
  if (!name) return "";
  return String(name).replace(/\.$/, "").toLowerCase();
}

/**
 * Canonical FQDN for a record label in a zone.
 * @param {string} label e.g. "_index._agents" or "www.duacrypto.com"
 * @param {string} [zoneName]
 */
export function dnsRecordFqdn(label, zoneName = ZONE_NAME) {
  const n = normDnsName(label);
  const zone = normDnsName(zoneName);
  if (n === zone || n.endsWith(`.${zone}`)) return n;
  return `${n}.${zone}`;
}

/**
 * Whether an API record name matches an expected label (handles trailing dots).
 * @param {string} apiName
 * @param {string} expectedLabel
 * @param {string} [zoneName]
 */
export function dnsNamesEqual(apiName, expectedLabel, zoneName = ZONE_NAME) {
  const actual = normDnsName(apiName);
  const fqdn = dnsRecordFqdn(expectedLabel, zoneName);
  return actual === fqdn || actual === normDnsName(expectedLabel);
}

/**
 * @param {string} token
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function cloudflareApi(token, path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.map((e) => e.message).join("; ") ?? res.statusText;
    throw new Error(msg);
  }
  return data;
}

/** @param {string} token @param {string} [zoneName] */
export async function getZone(token, zoneName = ZONE_NAME) {
  const zones = await cloudflareApi(token, `/zones?name=${zoneName}`);
  const zone = zones.result?.[0];
  if (!zone) throw new Error(`Zone not found: ${zoneName}`);
  return zone;
}
