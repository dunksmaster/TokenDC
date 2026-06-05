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
  url.searchParams.set("do", "1");

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

/** Encode DNS wire-format owner name for hex substring checks. */
function wireNameHex(hostname) {
  return hostname
    .split(".")
    .map((label) => label.length.toString(16).padStart(2, "0") + Buffer.from(label).toString("hex"))
    .join("") + "00";
}

/** @param {string} answers @param {{ priority: number; target: string; value: string }} spec */
function httpsAnswerMatchesSpec(answers, spec) {
  if (!answers) return false;

  const textOk =
    answers.includes(String(spec.priority)) &&
    answers.includes(spec.target) &&
    answers.includes("alpn") &&
    answers.includes("port");
  if (textOk) return true;

  // DoH often returns RFC 3597 \# hex encoding for HTTPS/SVCB RDATA.
  const match = answers.match(/\\?#\s*(\d+)\s+([\da-fA-F\s]+)/);
  if (!match) return false;

  const bytes = match[2]
    .trim()
    .split(/\s+/)
    .map((b) => parseInt(b, 16))
    .filter((n) => !Number.isNaN(n));
  if (bytes.length < 8) return false;

  const priority = (bytes[0] << 8) | bytes[1];
  if (priority !== spec.priority) return false;

  const blob = Buffer.from(bytes).toString("hex");
  const targetWire = wireNameHex(spec.target);
  const hasTarget = blob.includes(targetWire);
  const hasPort = blob.includes("0003000201bb");
  const hasAlpn =
    blob.includes("026833") ||
    blob.includes("026832") ||
    blob.includes("036d6370");
  return hasTarget && hasPort && hasAlpn;
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

    if (!httpsAnswerMatchesSpec(answers, spec)) {
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
