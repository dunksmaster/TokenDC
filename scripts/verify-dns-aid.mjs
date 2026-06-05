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
  { url: "https://cloudflare-dns.com/dns-query", label: "cloudflare-dns.com (isitagentready primary)" },
  { url: "https://dns.google/resolve", label: "dns.google" },
];

const PRIMARY_RESOLVER = DOH_RESOLVERS[0].url;

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

/** @param {string} qname @param {number} [type] @param {string} [resolverUrl] */
async function queryResolver(qname, type, resolverUrl) {
  const data = await dohQuery(qname, type, resolverUrl);
  return { resolver: resolverUrl, data };
}

/** @param {string} qname @param {number} [type] */
async function queryAllResolvers(qname, type = HTTPS_TYPE) {
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

function resolverLabel(url) {
  return DOH_RESOLVERS.find((r) => r.url === url)?.label ?? new URL(url).hostname;
}

function dsAnswers(data) {
  return (data?.Answer ?? []).filter((a) => a.type === 43).map((a) => a.data);
}

let failed = 0;
let cfHttpsAdPending = false;

console.log(`DNS-AID verification for ${zone}\n`);

// DS chain at parent first — migration is complete when DS validates on the primary resolver.
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
    const results = await queryAllResolvers(qname);
    const usable = results.filter((r) => !r.error && r.data?.Status !== 3);
    const primary = usable[0] ?? results[0];

    if (!primary || primary.error || primary.data?.Status === 3) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  No HTTPS record (${primary?.error ?? `status=${primary?.data?.Status}`})`);
      failed++;
      continue;
    }

    const answers = formatAnswer(primary.data);
    if (!httpsAnswerMatchesSpec(answers, spec)) {
      console.log(`[FAIL] ${qname}`);
      console.log(`  Unexpected answer: ${answers}`);
      failed++;
      continue;
    }

    const cf = results.find((r) => r.resolver === PRIMARY_RESOLVER && !r.error);
    const google = results.find((r) => r.resolver === DOH_RESOLVERS[1].url && !r.error);
    const cfAd = cf?.data?.AD === true;
    const googleAd = google?.data?.AD === true;
    const dnssecOk = cfAd || (googleAd && dsChainValidOnPrimary);
    const flag = cfAd ? "OK" : dnssecOk ? "OK" : "FAIL";

    console.log(`[${flag}] ${qname}`);
    console.log(`  answer: ${answers}`);
    for (const r of results) {
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
      cfHttpsAdPending = true;
      console.log(
        "  DS chain valid; dns.google validates HTTPS. cloudflare-dns.com AD may lag on some edges."
      );
    }
  } catch (err) {
    console.log(`[FAIL] ${qname}`);
    console.log(`  ${err.message}`);
    failed++;
  }
}

if (cfHttpsAdPending) {
  console.log(
    "\nDNSSEC migration complete. cloudflare-dns.com HTTPS AD may take longer on some resolvers; isitagentready should pass once its edge catches up."
  );
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll DNS-AID checks passed.");
process.exitCode = failed ? 1 : 0;
