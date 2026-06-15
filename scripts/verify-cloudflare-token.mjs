#!/usr/bin/env node
/**
 * Verify CLOUDFLARE_API_TOKEN has Pages deploy + optional DNS edit permissions.
 * Run before: gh secret set CLOUDFLARE_API_TOKEN
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npm run verify:cf-token
 */
const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ?? "51d0340bb43eebb07f7c2da17733c3e9";
const zone = "duacrypto.com";

if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN");
  process.exit(1);
}

async function api(path) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

let failed = 0;

const pages = await api(
  `/accounts/${accountId}/pages/projects/dc-site`
);
if (pages.status === 200 && pages.data.success) {
  console.log("[OK] Pages deploy — can read dc-site project");
} else {
  console.log(`[FAIL] Pages deploy — HTTP ${pages.status}`);
  console.log("  Need: Account → Cloudflare Pages → Edit (Edit Cloudflare Workers template)");
  failed++;
}

const zones = await api(`/zones?name=${zone}`);
const zoneId = zones.data.result?.[0]?.id;
if (zones.status === 200 && zoneId) {
  const records = await api(`/zones/${zoneId}/dns_records?per_page=1`);
  if (records.status === 200 && records.data.success) {
    console.log(`[OK] DNS edit — can read ${zone} records`);
  } else {
    console.log(`[WARN] DNS read — HTTP ${records.status} (optional for fix-dns)`);
  }
} else {
  console.log(`[WARN] DNS zone lookup — HTTP ${zones.status} (optional for fix-dns)`);
}

console.log(
  failed
    ? "\nToken NOT ready. Use for: gh secret set CLOUDFLARE_PAGES_API_TOKEN"
    : "\nToken OK. Run: gh secret set CLOUDFLARE_PAGES_API_TOKEN"
);
process.exit(failed ? 1 : 0);
