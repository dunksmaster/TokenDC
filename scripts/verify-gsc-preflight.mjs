#!/usr/bin/env node
/**
 * Preflight URLs for GSC submission (HTTP 200/301 checks).
 */
const URLS = [
  "https://duacrypto.com/sitemap.xml",
  "https://duacrypto.com/newsletter.html",
  "https://duacrypto.com/events.html",
  "https://news.duacrypto.com/sitemap-index.xml",
  "https://news.duacrypto.com/rss.xml",
];

let failed = 0;
for (const url of URLS) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.ok) console.log(`OK  ${res.status} ${url}`);
    else {
      failed += 1;
      console.log(`FAIL ${res.status} ${url}`);
    }
  } catch (e) {
    failed += 1;
    console.log(`FAIL ${url} — ${e.message}`);
  }
}
if (failed) process.exit(1);
console.log("GSC preflight passed.");
