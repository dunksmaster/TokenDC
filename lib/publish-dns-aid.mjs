/**
 * Publish DNS-AID HTTPS records and enable DNSSEC on the Cloudflare zone.
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Edit (+ DNSSEC if restricted).
 */
import {
  cloudflareApi,
  dnsNamesEqual,
  dnsRecordFqdn,
  getZone,
  normDnsName,
} from "./cloudflare-dns-api.mjs";
import { DNS_AID_HTTPS_RECORDS, ZONE_NAME } from "./dns-aid-records.mjs";

/** @param {import("./dns-aid-records.mjs").DNS_AID_HTTPS_RECORDS[number]} spec */
function httpsBody(spec) {
  return {
    type: "HTTPS",
    name: spec.name,
    ttl: 3600,
    proxied: false,
    comment: spec.comment,
    data: {
      priority: spec.priority,
      target: spec.target,
      value: spec.value,
    },
  };
}

function sameHttpsRecord(existing, spec) {
  const data = existing.data ?? {};
  return (
    data.priority === spec.priority &&
    normDnsName(data.target) === normDnsName(spec.target) &&
    data.value === spec.value
  );
}

/**
 * @param {string} token
 * @param {{ enableDnssec?: boolean }} [options]
 */
export async function publishDnsAid(token, options = {}) {
  const { enableDnssec = true } = options;
  const zone = await getZone(token);
  const zoneId = zone.id;

  console.log(`Zone: ${ZONE_NAME} (${zoneId})`);
  console.log(`Nameservers: ${(zone.name_servers ?? []).join(", ") || "(unknown)"}`);

  const existing =
    (await cloudflareApi(token, `/zones/${zoneId}/dns_records?per_page=500`)).result ??
    [];

  for (const spec of DNS_AID_HTTPS_RECORDS) {
    const fqdn = dnsRecordFqdn(spec.name, ZONE_NAME);
    const match = existing.find(
      (r) => r.type === "HTTPS" && dnsNamesEqual(r.name, spec.name, ZONE_NAME)
    );

    if (match && sameHttpsRecord(match, spec)) {
      console.log(`KEEP  HTTPS ${fqdn} -> ${spec.priority} ${spec.target} ${spec.value}`);
      continue;
    }

    const body = httpsBody(spec);
    if (match) {
      console.log(`UPDATE HTTPS ${fqdn}`);
      await cloudflareApi(token, `/zones/${zoneId}/dns_records/${match.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } else {
      console.log(`CREATE HTTPS ${fqdn} -> ${spec.priority} ${spec.target} ${spec.value}`);
      await cloudflareApi(token, `/zones/${zoneId}/dns_records`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
  }

  if (!enableDnssec) {
    console.log("\nSkipped DNSSEC (enableDnssec=false).");
    return { zoneId, dnssec: null };
  }

  const current = await cloudflareApi(token, `/zones/${zoneId}/dnssec`);
  const status = current.result?.status ?? "unknown";

  if (status === "active") {
    console.log("\nDNSSEC: already active");
  } else {
    console.log(`\nDNSSEC: enabling (was ${status})...`);
    await cloudflareApi(token, `/zones/${zoneId}/dnssec`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
  }

  const dnssec = (await cloudflareApi(token, `/zones/${zoneId}/dnssec`)).result;
  const ds = dnssec?.ds ?? [];
  if (ds.length) {
    console.log("\nAdd these DS records at Dynadot (after NS point to Cloudflare):");
    for (const row of ds) {
      console.log(`  ${ZONE_NAME}. DS ${row.key_tag} ${row.algorithm} ${row.digest_type} ${row.digest}`);
    }
  } else {
    console.log("\nDNSSEC active; fetch DS from Cloudflare dashboard → DNS → DNSSEC.");
  }

  return { zoneId, dnssec };
}
