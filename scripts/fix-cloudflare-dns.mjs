#!/usr/bin/env node
/**
 * Fix duacrypto.com DNS for Cloudflare Pages + preserve PrivateEmail MX/TXT.
 * Requires API token with Zone.DNS Edit on duacrypto.com.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run fix:dns
 */
import {
  cloudflareApi,
  dnsRecordFqdn,
  getZone,
  normDnsName,
  ZONE_NAME,
} from "../lib/cloudflare-dns-api.mjs";
import { publishDnsAid } from "../lib/publish-dns-aid.mjs";

const PAGES_TARGET = "dc-site-4p3.pages.dev";
const GITHUB_A_IPS = new Set([
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
]);

const EMAIL_RECORDS = [
  { type: "MX", name: ZONE_NAME, content: "mx1.privateemail.com", priority: 10, proxied: false },
  { type: "MX", name: ZONE_NAME, content: "mx2.privateemail.com", priority: 10, proxied: false },
  {
    type: "TXT",
    name: ZONE_NAME,
    content: "v=spf1 include:spf.privateemail.com ~all",
    proxied: false,
  },
  {
    type: "TXT",
    name: `_dmarc.${ZONE_NAME}`,
    content: "v=DMARC1; p=none;",
    proxied: false,
  },
];

const SITE_RECORDS = [
  { type: "CNAME", name: ZONE_NAME, content: PAGES_TARGET, proxied: true },
  { type: "CNAME", name: `www.${ZONE_NAME}`, content: PAGES_TARGET, proxied: true },
];

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (needs Zone.DNS Edit for duacrypto.com).");
  process.exit(1);
}

const api = (path, options) => cloudflareApi(token, path, options);

function recordKey(r) {
  return `${r.type}|${normDnsName(r.name)}|${r.content}`;
}

async function main() {
  const zone = await getZone(token);
  const zoneId = zone.id;

  console.log(`Zone: ${ZONE_NAME} (${zoneId})`);
  console.log(`Nameservers: ${(zone.name_servers ?? []).join(", ") || "(unknown)"}`);

  const existing = (await api(`/zones/${zoneId}/dns_records?per_page=500`)).result ?? [];
  console.log(`Existing records: ${existing.length}`);

  const toDelete = existing.filter((r) => {
    if (r.type === "A" && GITHUB_A_IPS.has(r.content)) return true;
    if (r.type === "CNAME" && normDnsName(r.name) === normDnsName(PAGES_TARGET)) {
      return true;
    }
    if (
      r.type === "CNAME" &&
      normDnsName(r.name) === dnsRecordFqdn(`www.${ZONE_NAME}`) &&
      r.content === ZONE_NAME
    ) {
      return true;
    }
    return false;
  });

  for (const r of toDelete) {
    console.log(`DELETE ${r.type} ${r.name} -> ${r.content}`);
    await api(`/zones/${zoneId}/dns_records/${r.id}`, { method: "DELETE" });
  }

  const afterDelete =
    (await api(`/zones/${zoneId}/dns_records?per_page=500`)).result ?? [];
  const keys = new Set(afterDelete.map(recordKey));

  for (const spec of [...SITE_RECORDS, ...EMAIL_RECORDS]) {
    const key = recordKey({ type: spec.type, name: spec.name, content: spec.content });
    if (keys.has(key)) {
      console.log(`KEEP  ${spec.type} ${spec.name} -> ${spec.content}`);
      continue;
    }
    const body = {
      type: spec.type,
      name: spec.name,
      content: spec.content,
      proxied: spec.proxied ?? false,
      ttl: 1,
    };
    if (spec.priority != null) body.priority = spec.priority;
    console.log(`CREATE ${spec.type} ${spec.name} -> ${spec.content}`);
    await api(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  console.log("\nPublishing DNS-AID records + DNSSEC...");
  await publishDnsAid(token);

  console.log("\nDone. Next:");
  console.log("1. Dynadot: disable Email Settings, set NS to aurora/ernest.cloudflare.com");
  console.log("2. Add Cloudflare DS records at Dynadot (printed above if DNSSEC enabled)");
  console.log("3. Wait 15-30 min, then: npm run diagnose:domain && npm run verify:dns-aid");
  console.log("4. Google Search Console: request indexing + submit sitemap.xml");
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}`);
  if (/authentication|permission|10000/i.test(err.message)) {
    console.error(
      "Create a new token at https://dash.cloudflare.com/profile/api-tokens"
    );
    console.error("Template: Edit zone DNS (scope: duacrypto.com) + Workers Pages Edit");
  }
  process.exit(1);
});
