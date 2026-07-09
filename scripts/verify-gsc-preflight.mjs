#!/usr/bin/env node
/**
 * Preflight URLs for GSC submission (HTTP 200/301 checks).
 */
const URLS = [
  { url: "https://duacrypto.com/sitemap.xml", required: true },
  { url: "https://duacrypto.com/newsletter.html", required: true },
  { url: "https://duacrypto.com/events.html", required: true },
  { url: "https://news.duacrypto.com/sitemap-index.xml", required: false },
  { url: "https://news.duacrypto.com/rss.xml", required: false },
];

let failed = 0;
for (const { url, required } of URLS) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.ok) console.log(`OK  ${res.status} ${url}`);
    else if (!required) console.log(`SKIP ${res.status} ${url}`);
    else {
      failed += 1;
      console.log(`FAIL ${res.status} ${url}`);
    }
  } catch (e) {
    if (!required) console.log(`SKIP ${url} — ${e.message}`);
    else {
      failed += 1;
      console.log(`FAIL ${url} — ${e.message}`);
    }
  }
}
if (failed) process.exit(1);
console.log("GSC preflight passed.");
