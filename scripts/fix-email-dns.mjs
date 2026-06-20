#!/usr/bin/env node
/**
 * Remove duplicate SPF/DMARC TXT records on duacrypto.com.
 * Preserves PrivateEmail MX + a single SPF (include:spf.privateemail.com).
 * Does not modify MX or change SPF/DMARC policy values.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run fix:email-dns
 */
import {
  cloudflareApi,
  dnsNamesEqual,
  getZone,
  normDnsName,
  ZONE_NAME,
} from "../lib/cloudflare-dns-api.mjs";

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (needs Zone.DNS Edit on duacrypto.com).");
  process.exit(1);
}

const api = (path, options) => cloudflareApi(token, path, options);

function txtContent(record) {
  return String(record.content ?? "").replace(/^"|"$/g, "");
}

function isSpfRecord(record) {
  return (
    record.type === "TXT" &&
    dnsNamesEqual(record.name, ZONE_NAME) &&
    /v=spf1/i.test(txtContent(record))
  );
}

function isDmarcRecord(record) {
  return (
    record.type === "TXT" &&
    dnsNamesEqual(record.name, `_dmarc.${ZONE_NAME}`) &&
    /v=DMARC1/i.test(txtContent(record))
  );
}

function dmarcScore(content) {
  let score = 0;
  if (/rua=/i.test(content)) score += 10;
  if (/ruf=/i.test(content)) score += 5;
  if (/p=none/i.test(content)) score += 1;
  return score;
}

function pickKeeper(records, scoreFn) {
  return [...records].sort((a, b) => scoreFn(txtContent(b)) - scoreFn(txtContent(a)))[0];
}

async function deleteRecord(zoneId, record, reason) {
  console.log(`DELETE ${record.type} ${record.name}`);
  console.log(`        ${txtContent(record)}`);
  console.log(`        (${reason})`);
  await api(`/zones/${zoneId}/dns_records/${record.id}`, { method: "DELETE" });
}

async function main() {
  const zone = await getZone(token);
  const zoneId = zone.id;
  const records = (await api(`/zones/${zoneId}/dns_records?per_page=500`)).result ?? [];

  console.log(`Zone: ${ZONE_NAME} (${zoneId})`);
  console.log(`Records: ${records.length}\n`);

  const mx = records.filter(
    (r) =>
      r.type === "MX" &&
      dnsNamesEqual(r.name, ZONE_NAME) &&
      /privateemail\.com/i.test(r.content)
  );
  console.log(`PrivateEmail MX records: ${mx.length} (unchanged)`);
  for (const r of mx) {
    console.log(`  KEEP  MX ${r.name} -> ${r.content} (priority ${r.priority})`);
  }

  const spf = records.filter(isSpfRecord);
  console.log(`\nSPF TXT records: ${spf.length}`);
  if (spf.length === 0) {
    console.log("  WARN  No SPF record found — not creating (use npm run fix:dns if needed).");
  } else if (spf.length === 1) {
    console.log(`  KEEP  ${txtContent(spf[0])}`);
  } else {
    const preferred =
      spf.find((r) => /include:spf\.privateemail\.com/i.test(txtContent(r))) ??
      pickKeeper(spf, () => 1);
    for (const r of spf) {
      if (r.id === preferred.id) {
        console.log(`  KEEP  ${txtContent(r)}`);
        continue;
      }
      await deleteRecord(zoneId, r, "duplicate SPF");
    }
  }

  const dmarc = records.filter(isDmarcRecord);
  console.log(`\nDMARC TXT records: ${dmarc.length}`);
  if (dmarc.length === 0) {
    console.log("  WARN  No DMARC record found — not creating (use npm run fix:dns if needed).");
  } else if (dmarc.length === 1) {
    console.log(`  KEEP  ${txtContent(dmarc[0])}`);
  } else {
    const preferred = pickKeeper(dmarc, dmarcScore);
    for (const r of dmarc) {
      if (r.id === preferred.id) {
        console.log(`  KEEP  ${txtContent(r)}`);
        continue;
      }
      await deleteRecord(zoneId, r, "duplicate DMARC");
    }
  }

  const dkim = records.filter(
    (r) =>
      (r.type === "TXT" || r.type === "CNAME") &&
      normDnsName(r.name).includes("_domainkey")
  );
  console.log(`\nDKIM records: ${dkim.length}`);
  if (dkim.length === 0) {
    console.log(
      "  INFO  No DKIM in Cloudflare DNS. Enable DKIM in Namecheap PrivateEmail and add the CNAME they provide."
    );
  } else {
    for (const r of dkim) {
      console.log(`  KEEP  ${r.type} ${r.name} -> ${r.content}`);
    }
  }

  console.log("\nDone. Recheck Cloudflare → Email → Email Security in 5–15 minutes.");
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}`);
  process.exit(1);
});
