#!/usr/bin/env node
/**
 * Verify DNS-AID HTTPS records via DNS-over-HTTPS (same resolvers as isitagentready).
 *
 * Usage:
 *   npm run verify:dns-aid
 *   npm run verify:dns-aid -- duacrypto.com
 */
import { DNS_AID_HTTPS_RECORDS, ZONE_NAME } from "../lib/dns-aid-records.mjs";

const DOH_RESOLVERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
];

const zone = process.argv[2] ?? ZONE_NAME;
const HTTPS_TYPE = 65;

/** @param {string} qname @param {number} type @param {string} resolver */
async function dohQuery(qname, type, resolver) {
  const url = new URL(resolver);
  url.searchParams.set("name", qname);
  url.searchParams.set("type", String(type));

  const res = await fetch(url, {
    headers: { Accept: "application/dns-json" },
  });
  if (!res.ok) throw new Error(`${resolver} HTTP ${res.status}`);
  return res.json();
}

/** @param {string} qname @param {number} [type] */
async function queryWithFallback(qname, type = HTTPS_TYPE) {
  let lastErr;
  for (const resolver of DOH_RESOLVERS) {
    try {
      const data = await dohQuery(qname, type, resolver);
      return { resolver, data };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("DoH query failed");
}

function formatAnswer(data) {
  const answers = data.Answer ?? [];
  return answers
    .filter((a) => a.type === HTTPS_TYPE)
    .map((a) => a.data)
    .join("; ");
}

let failed = 0;

console.log(`DNS-AID verification for ${zone}\n`);

for (const spec of DNS_AID_HTTPS_RECORDS) {
  const qname = `${spec.name}.${zone}`;
  try {
    const { resolver, data } = await queryWithFallback(qname);
    const answers = formatAnswer(data);
    const ad = data.AD === true;
    const nxdomain = data.Status === 3;

    if (nxdomain || !answers) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  No HTTPS record (status=${data.Status}, resolver=${resolver})`);
      failed++;
      continue;
    }

    const hasTarget =
      answers.includes(String(spec.priority)) && answers.includes(spec.target);
    const hasAlpn = answers.includes("alpn");
    const hasPort = answers.includes("port");

    if (!hasTarget || !hasAlpn || !hasPort) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  Unexpected answer: ${answers}`);
      failed++;
      continue;
    }

    const flag = ad ? "OK" : "WARN";
    console.log(`[${flag}] ${qname}`);
    console.log(`  answer: ${answers}`);
    console.log(`  DNSSEC AD=${ad} (resolver: ${new URL(resolver).hostname})`);
    if (!ad) {
      console.log("  Hint: enable DNSSEC on Cloudflare and publish DS at registrar.");
      failed++;
    }
  } catch (err) {
    console.log(`[FAIL] ${qname}`);
    console.log(`  ${err.message}`);
    failed++;
  }
}

// DS chain at parent (type 43)
try {
  const { data } = await queryWithFallback(zone, 43);
  const dsAnswers = (data.Answer ?? []).filter((a) => a.type === 43);
  if (dsAnswers.length) {
    console.log(`\n[OK] DS records for ${zone}: ${dsAnswers.map((a) => a.data).join("; ")}`);
  } else {
    console.log(`\n[WARN] No DS record for ${zone} — add Cloudflare DS at Dynadot.`);
    failed++;
  }
} catch (err) {
  console.log(`\n[WARN] Could not query DS for ${zone}: ${err.message}`);
  failed++;
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll DNS-AID checks passed.");
process.exit(failed ? 1 : 0);
