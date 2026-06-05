#!/usr/bin/env node
/**
 * Publish DNS-AID HTTPS records + enable DNSSEC on duacrypto.com (Cloudflare).
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run publish:dns-aid
 */
import { dnsAidZoneFileLines } from "../lib/dns-aid-records.mjs";
import { publishDnsAid } from "../lib/publish-dns-aid.mjs";

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (needs Zone.DNS Edit on duacrypto.com).");
  process.exit(1);
}

console.log("DNS-AID records to publish:\n");
for (const line of dnsAidZoneFileLines()) console.log(`  ${line}`);
console.log("");

try {
  await publishDnsAid(token);
  console.log("\nDone. Verify after NS propagation:");
  console.log("  npm run verify:dns-aid");
} catch (err) {
  console.error(`\nFAIL: ${err.message}`);
  if (/authentication|permission|10000/i.test(err.message)) {
    console.error(
      "Create a token: https://dash.cloudflare.com/profile/api-tokens"
    );
    console.error("Template: Edit zone DNS (scope: duacrypto.com)");
  }
  process.exit(1);
}
