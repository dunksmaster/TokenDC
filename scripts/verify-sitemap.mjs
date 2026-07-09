#!/usr/bin/env node
/**
 * Preflight for GSC sitemap submission: validate sitemap XML and spot-check key URLs.
 */
const SITEMAP_URL = "https://duacrypto.com/sitemap.xml";
const REQUIRED_URLS = [
  "https://duacrypto.com/",
  "https://duacrypto.com/events.html",
  "https://duacrypto.com/blog/index.html",
  "https://duacrypto.com/newsletter.html",
];

const errors = [];

async function checkUrl(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) errors.push(`${url} → HTTP ${res.status}`);
  return res.status;
}

async function main() {
  console.log(`Fetching ${SITEMAP_URL}…`);
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    errors.push(`Sitemap fetch failed: HTTP ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();
  if (!xml.includes("<urlset") || !xml.includes("<loc>")) {
    errors.push("Sitemap is not valid urlset XML");
  }
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`Sitemap: ${locs.length} URLs`);

  for (const url of REQUIRED_URLS) {
    if (!locs.includes(url) && url !== "https://duacrypto.com/") {
      const alt = url.replace("https://duacrypto.com", "https://duacrypto.com");
      if (!locs.some((l) => l === url || l === url.replace(/\/$/, ""))) {
        errors.push(`Missing from sitemap: ${url}`);
      }
    }
  }

  console.log("\nSpot-check URLs:");
  for (const url of REQUIRED_URLS) {
    const status = await checkUrl(url);
    console.log(`  ${status} ${url}`);
  }

  if (errors.length) {
    console.error("\nFAIL:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("\nOK: sitemap preflight passed (ready for GSC submission).");
  console.log("\nGSC manual steps:");
  console.log("  1. https://search.google.com/search-console → property duacrypto.com");
  console.log("  2. Sitemaps → submit https://duacrypto.com/sitemap.xml");
  console.log("  3. URL Inspection → request indexing for blog, newsletter, events");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
