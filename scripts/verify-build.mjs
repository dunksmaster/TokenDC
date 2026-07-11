#!/usr/bin/env node
/**
 * Post-build smoke tests: headers, HTML markers, asset size, no external font CDNs.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { GALLERY_IMAGE_BASES, galleryWebpSrcset } from "../lib/gallery-responsive.mjs";
import { HERO_IMAGE_BASE, heroWebpSrcset } from "../lib/hero-responsive.mjs";

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
function collectRootHtmlFiles() {
  const files = [];
  for (const name of readdirSync(root)) {
    if (name.endsWith(".html")) files.push(name);
  }
  const blogDir = join(root, "blog");
  if (existsSync(blogDir)) {
    for (const name of readdirSync(blogDir)) {
      if (name.endsWith(".html")) files.push(join("blog", name));
    }
  }
  return files;
}

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
  "events.html",
  "donation.html",
  "bitcoin-for-corporations.html",
  "newsletter.html",
  "blog/index.html",
  "blog/join-duacrypto-community.html",
  "blog/bitcoin-self-custody-basics.html",
  "blog/dal-corporate-bitcoin-guide.html",
  "blog/donate-a-book-campaign.html",
  "blog/bitcoin-pizza-day-2025.html",
  "blog/balkans-crypto-2025-recap.html",
]);

const DEAD_REPO_PATHS = [
  "css/bootstrap.min.css",
  "css/style.css",
  "js/main.js",
  "js/main-token-slim.js",
  "js/theme-bootstrap.js",
  "src/js/theme-bootstrap.js",
  "public/js/theme-bootstrap.js",
  "public/lib/owlcarousel",
  "public/lib/wow",
  "public/lib/waypoints",
  "public/lib/counterup",
  "public/lib/animate",
  "public/lib/easing",
  "lib/owlcarousel",
  "lib/wow",
  "lib/waypoints",
  "lib/counterup",
  "lib/animate",
  "lib/easing",
  "src/js/carousel.js",
];

for (const rel of DEAD_REPO_PATHS) {
  if (existsSync(join(root, rel))) {
    fail(`dead asset still present in repo: ${rel}`);
  }
}

for (const name of collectRootHtmlFiles()) {
  const html = readFileSync(join(root, name), "utf8");
  if (TAILWIND_PAGES.has(name)) {
    if (/bootstrap\.min\.css|code\.jquery\.com/i.test(html)) {
      fail(`${name}: Tailwind page still references Bootstrap/jQuery`);
    }
    if (!html.includes("/src/css/input.css") && !html.includes("include:head-common")) {
      fail(`${name}: Tailwind page missing input.css`);
    }
  }
  const hasIcons = html.includes("<!-- dc-icons:start -->") || html.includes("include:head-common");
  const hasVendor = html.includes("<!-- dc-vendor:start -->") || html.includes("include:head-common");
  if (!hasIcons) {
    fail(`${name}: missing dc-icons block`);
  }
  if (!hasVendor) {
    fail(`${name}: missing dc-vendor block`);
  }
  if (hasVendor) {
    const withoutNoscript = html.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");
    if (
      /<link\b(?:[^>]*\s)rel\s*=\s*["']stylesheet["'][^>]*href=["']\/vendor\/font-awesome\/css\/all\.min\.css["']/i.test(
        withoutNoscript
      ) ||
      /<link\b[^>]*href=["']\/vendor\/font-awesome\/css\/all\.min\.css["'][^>]*\srel\s*=\s*["']stylesheet["']/i.test(
        withoutNoscript
      )
    ) {
      fail(`${name}: Font Awesome still loaded as render-blocking stylesheet`);
    }
  }
  if (/fonts\.googleapis\.com|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i.test(html)) {
    fail(`${name}: still references external font CDN`);
  }
  if (/upload\.wikimedia\.org|via\.placeholder\.com/i.test(html)) {
    fail(`${name}: still references placeholder/wikimedia hotlink`);
  }
  if (/gumroad\.com\/l\/newsletter\b/i.test(html)) {
    fail(`${name}: broken Gumroad slug /l/newsletter (use /l/newsleter)`);
  }
}

// 4. Site-wide local images: width/height (CLS)
function collectSourceHtmlFiles() {
  const files = [];
  for (const name of readdirSync(root)) {
    if (name.endsWith(".html")) files.push({ path: join(root, name), label: name });
  }
  const blogDir = join(root, "blog");
  if (existsSync(blogDir)) {
    for (const name of readdirSync(blogDir)) {
      if (name.endsWith(".html")) {
        files.push({ path: join(blogDir, name), label: `blog/${name}` });
      }
    }
  }
  const partialsDir = join(root, "src", "partials");
  if (existsSync(partialsDir)) {
    for (const name of readdirSync(partialsDir)) {
      if (name.endsWith(".html")) {
        files.push({ path: join(partialsDir, name), label: `src/partials/${name}` });
      }
    }
  }
  return files;
}

for (const { path: filePath, label } of collectSourceHtmlFiles()) {
  const html = readFileSync(filePath, "utf8");
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\bsrc\s*=\s*["']\/img\//i.test(tag)) continue;
    if (!/\bwidth\s*=/i.test(tag) || !/\bheight\s*=/i.test(tag)) {
      fail(`${label}: local <img> missing width/height — ${tag.slice(0, 80)}`);
    }
  }
}

// 4a. Events gallery alt text (a11y)
if (existsSync(join(root, "events.html"))) {
  const eventsHtml = readFileSync(join(root, "events.html"), "utf8");
  for (const match of eventsHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\bsrc\s*=\s*["']\/img\//i.test(tag)) continue;
    const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1];
    if (!alt?.trim()) {
      fail(`events.html: local <img> missing alt text`);
    }
  }
}

// 4b. Events gallery responsive srcset
if (existsSync(join(root, "events.html"))) {
  const eventsHtml = readFileSync(join(root, "events.html"), "utf8");
  for (const base of GALLERY_IMAGE_BASES) {
    const expected = galleryWebpSrcset(base);
    if (!eventsHtml.includes(expected)) {
      fail(`events.html: missing responsive srcset for ${base}`);
    }
  }
}

// 4c. Homepage hero responsive srcset
if (existsSync(join(root, "index.html"))) {
  const indexHtml = readFileSync(join(root, "index.html"), "utf8");
  const expected = heroWebpSrcset(HERO_IMAGE_BASE);
  if (!indexHtml.includes(expected)) {
    fail(`index.html: missing responsive hero srcset for ${HERO_IMAGE_BASE}`);
  }
}

// 5. img/ size budget (referenced assets only; target < 8 MB)
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
