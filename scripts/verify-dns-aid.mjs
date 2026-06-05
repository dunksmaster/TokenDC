#!/usr/bin/env node
/**
 * Verify DNS-AID SVCB records via DNS-over-HTTPS (same resolvers as isitagentready).
 *
 * Usage:
 *   npm run verify:dns-aid
 *   npm run verify:dns-aid -- duacrypto.com
 */
import { DNS_AID_HTTPS_RECORDS, ZONE_NAME } from "../lib/dns-aid-records.mjs";

const DOH_RESOLVERS = [
  { url: "https://cloudflare-dns.com/dns-query", label: "cloudflare-dns.com (isitagentready primary)" },
  { url: "https://dns.google/resolve", label: "dns.google" },
];

const PRIMARY_RESOLVER = DOH_RESOLVERS[0].url;

const zone = process.argv[2] ?? ZONE_NAME;
const SVCB_TYPE = 64;
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

/** @param {string} qname @param {number} type @param {string} resolverUrl */
async function queryResolver(qname, type, resolverUrl) {
  const data = await dohQuery(qname, type, resolverUrl);
  return { resolver: resolverUrl, data };
}

/** @param {string} qname @param {number} type */
async function queryAllResolvers(qname, type) {
  const results = [];
  for (const { url } of DOH_RESOLVERS) {
    try {
      results.push(await queryResolver(qname, type, url));
    } catch (err) {
      results.push({ resolver: url, error: err.message });
    }
  }
  return results;
}

function formatServiceAnswer(data, rrType) {
  const answers = data.Answer ?? [];
  return answers
    .filter((a) => a.type === rrType)
    .map((a) => a.data)
    .join("; ");
}

function hasServiceAnswer(data, rrType) {
  return (data.Answer ?? []).some((a) => a.type === rrType);
}

/** Encode DNS wire-format owner name for hex substring checks. */
function wireNameHex(hostname) {
  return hostname
    .split(".")
    .map((label) => label.length.toString(16).padStart(2, "0") + Buffer.from(label).toString("hex"))
    .join("") + "00";
}

/** @param {string} answers @param {{ priority: number; target: string; value: string }} spec */
function serviceAnswerMatchesSpec(answers, spec) {
  if (!answers) return false;

  const textOk =
    answers.includes(String(spec.priority)) &&
    answers.includes(spec.target) &&
    answers.includes("alpn") &&
    answers.includes("port");
  if (textOk) return true;

  // DoH often returns RFC 3597 \# hex encoding for SVCB/HTTPS RDATA.
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

function resolverLabel(url) {
  return DOH_RESOLVERS.find((r) => r.url === url)?.label ?? new URL(url).hostname;
}

function dsAnswers(data) {
  return (data?.Answer ?? []).filter((a) => a.type === 43).map((a) => a.data);
}

/** @returns {"OK"|"PENDING"|"FAIL"} */
function validationFlag(cfAd, googleAd, dsChainValidOnPrimary) {
  if (cfAd) return "OK";
  if (googleAd && dsChainValidOnPrimary) return "PENDING";
  return "FAIL";
}

let failed = 0;
let propagationPending = false;

console.log(`DNS-AID verification for ${zone}\n`);

console.log("DS chain:");
const dsResults = await queryAllResolvers(zone, 43);
let dsSeen = false;
let dsChainValidOnPrimary = false;

for (const r of dsResults) {
  if (r.error) {
    console.log(`[WARN] DS via ${resolverLabel(r.resolver)}: ${r.error}`);
    continue;
  }
  const answers = dsAnswers(r.data);
  if (answers.length) {
    dsSeen = true;
    console.log(`[OK] DS via ${resolverLabel(r.resolver)}: ${answers.join("; ")} (AD=${r.data.AD === true})`);
    if (r.resolver === PRIMARY_RESOLVER && r.data.AD === true) {
      dsChainValidOnPrimary = true;
    }
  } else {
    console.log(`[WARN] DS via ${resolverLabel(r.resolver)}: not visible yet (AD=${r.data.AD === true})`);
    if (r.resolver === PRIMARY_RESOLVER) failed++;
  }
}

if (!dsSeen) {
  console.log("\nNo resolver returned a DS record yet. Confirm Dynadot DNSSEC values match Cloudflare.");
  failed++;
}

console.log("");

for (const spec of DNS_AID_HTTPS_RECORDS) {
  const qname = `${spec.name}.${zone}`;
  try {
    const svcbResults = await queryAllResolvers(qname, SVCB_TYPE);
    const cfSvcb = svcbResults.find((r) => r.resolver === PRIMARY_RESOLVER && !r.error);
    const googleSvcb = svcbResults.find((r) => r.resolver === DOH_RESOLVERS[1].url && !r.error);

    if (!cfSvcb || cfSvcb.error || cfSvcb.data?.Status === 3) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  No SVCB record (${cfSvcb?.error ?? `status=${cfSvcb?.data?.Status}`})`);
      failed++;
      continue;
    }

    if (!hasServiceAnswer(cfSvcb.data, SVCB_TYPE)) {
      console.log(`[FAIL] ${qname}`);
      console.log("  No SVCB answers on cloudflare-dns.com (isitagentready primary)");
      failed++;
      continue;
    }

    const answers = formatServiceAnswer(cfSvcb.data, SVCB_TYPE);
    if (!serviceAnswerMatchesSpec(answers, spec)) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  Unexpected SVCB answer: ${answers}`);
      failed++;
      continue;
    }

    const googleAd = googleSvcb?.data?.AD === true;
    const cfAd = cfSvcb.data.AD === true;
    const flag = validationFlag(cfAd, googleAd, dsChainValidOnPrimary);
    const dnssecOk = flag !== "FAIL";

    console.log(`[${flag}] ${qname} (SVCB, AD=${cfAd} via cloudflare-dns.com)`);
    console.log(`  answer: ${answers}`);
    for (const r of svcbResults) {
      if (r.error) {
        console.log(`  ${resolverLabel(r.resolver)}: error ${r.error}`);
        continue;
      }
      console.log(
        `  ${resolverLabel(r.resolver)}: AD=${r.data.AD === true}, status=${r.data.Status}`
      );
    }

    if (!dnssecOk) {
      console.log("  Hint: enable DNSSEC on Cloudflare and publish DS at Dynadot.");
      failed++;
    } else if (!cfAd && googleAd && dsChainValidOnPrimary) {
      propagationPending = true;
      console.log(
        "  DS chain valid; dns.google validates SVCB. cloudflare-dns.com AD may lag on some edges."
      );
    }

    // Warn on stale legacy HTTPS records (type 65 fails AD=true on cloudflare-dns.com).
    const httpsResults = await queryAllResolvers(qname, HTTPS_TYPE);
    const cfHttps = httpsResults.find((r) => r.resolver === PRIMARY_RESOLVER && !r.error);
    if (cfHttps && hasServiceAnswer(cfHttps.data, HTTPS_TYPE)) {
      console.log(`[WARN] ${qname} still has legacy HTTPS (type 65) record — delete via npm run publish:dns-aid`);
      failed++;
    }

    if (googleSvcb && !googleSvcb.error && googleSvcb.data.AD !== true && cfAd) {
      console.log(`  Note: dns.google AD=${googleSvcb.data.AD === true} (primary resolver passed)`);
    }
  } catch (err) {
    console.log(`[FAIL] ${qname}`);
    console.log(`  ${err.message}`);
    failed++;
  }
}

if (propagationPending) {
  console.log(
    "\nPropagation in progress: records are correct. Re-run later; isitagentready uses cloudflare-dns.com."
  );
}

console.log(
  failed
    ? `\n${failed} check(s) failed.`
    : propagationPending
      ? "\nDNS-AID checks passed with pending primary-resolver catchup."
      : "\nAll DNS-AID checks passed."
);
process.exitCode = failed ? 1 : 0;
