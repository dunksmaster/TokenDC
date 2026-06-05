import assert from "node:assert/strict";
import {
  dnsNamesEqual,
  dnsRecordFqdn,
  normDnsName,
  ZONE_NAME,
} from "../lib/cloudflare-dns-api.mjs";

const specName = "_index._agents";
const fqdn = dnsRecordFqdn(specName, ZONE_NAME);

assert.equal(fqdn, "_index._agents.duacrypto.com");
assert.equal(`${fqdn}.` === fqdn, false, "strict compare fails on trailing dot");
assert.equal(dnsNamesEqual(`${fqdn}.`, specName, ZONE_NAME), true);
assert.equal(dnsNamesEqual(fqdn.toUpperCase(), specName, ZONE_NAME), true);
assert.equal(dnsNamesEqual("_index._agents", specName, ZONE_NAME), true);
assert.equal(dnsNamesEqual("_mcp._agents.duacrypto.com.", "_mcp._agents", ZONE_NAME), true);

assert.equal(normDnsName("duacrypto.com."), normDnsName("duacrypto.com"));

console.log("DNS name matching tests passed.");
