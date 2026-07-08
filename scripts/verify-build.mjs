#!/usr/bin/env node
/**
 * Post-build smoke tests: headers, HTML markers, asset size, no external font CDNs.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function dirSizeBytes(dir) {
  let total = 0;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else total += st.size;
    }
  };
  walk(dir);
  return total;
}

// 1. Security headers in dist/
const headersCheck = spawnSync(
  process.execPath,
  [join(root, "scripts", "verify-security-headers.mjs"), join(root, "dist", "_headers")],
  { stdio: "inherit" }
);
if (headersCheck.status !== 0) fail("verify-security-headers.mjs failed");

// 2. Required dist assets
for (const rel of [
  "site.webmanifest",
  "css/site-fonts.css",
  "css/brand-logos.css",
  "vendor/font-awesome/css/all.min.css",
  "img/apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
]) {
  if (!existsSync(join(root, "dist", rel))) {
    fail(`dist/${rel} missing`);
  }
}

const DEAD_DIST_PATHS = [
  "css/bootstrap.min.css",
  "css/style.css",
  "js/main.js",
  "js/theme-bootstrap.js",
  "lib/owlcarousel",
  "lib/wow",
  "scss",
];
for (const rel of DEAD_DIST_PATHS) {
  if (existsSync(join(root, "dist", rel))) {
    fail(`dist/${rel} should have been removed (dead legacy asset)`);
  }
}

// 3. HTML markers + no external fonts
// Tailwind-migrated pages must not load Bootstrap/jQuery.
const TAILWIND_PAGES = new Set([
  "index.html",
  "404.html",
  "privacy.html",
  "terms.html",
  "contact.html",
  "faq.html",
  "feature.html",
  "service.html",
  "roadmap.html",
  "about.html",
  "$10.html",
  "events.html",
  "donation.html",
  "bitcoin-for-corporations.html",
]);

for (const name of readdirSync(root)) {
  if (!name.endsWith(".html")) continue;
  const html = readFileSync(join(root, name), "utf8");
  if (TAILWIND_PAGES.has(name)) {
    if (/bootstrap\.min\.css|code\.jquery\.com/i.test(html)) {
      fail(`${name}: Tailwind page still references Bootstrap/jQuery`);
    }
    if (!html.includes("/src/css/input.css")) {
      fail(`${name}: Tailwind page missing input.css`);
    }
  }
  if (!html.includes("<!-- dc-icons:start -->")) {
    fail(`${name}: missing dc-icons block`);
  }
  if (!html.includes("<!-- dc-vendor:start -->")) {
    fail(`${name}: missing dc-vendor block`);
  }
  if (/fonts\.googleapis\.com|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i.test(html)) {
    fail(`${name}: still references external font CDN`);
  }
  if (/upload\.wikimedia\.org|via\.placeholder\.com/i.test(html)) {
    fail(`${name}: still references placeholder/wikimedia hotlink`);
  }
}

// 4. img/ size budget (referenced assets only; target < 8 MB)
const imgDir = join(root, "img");
if (existsSync(imgDir)) {
  const mb = dirSizeBytes(imgDir) / (1024 * 1024);
  const budgetMb = 8;
  if (mb > budgetMb) {
    fail(`img/ is ${mb.toFixed(1)} MB (budget ${budgetMb} MB)`);
  }
  console.log(`img/ size: ${mb.toFixed(1)} MB (budget ${budgetMb} MB)`);
}

console.log("\n--- verify:build summary ---");
if (errors.length) {
  console.error("FAIL:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("OK: all build verification checks passed.");
