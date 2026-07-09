/**
 * Replace Google Fonts and cdnjs Font Awesome with self-hosted assets.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER_START = "<!-- dc-vendor:start -->";
const MARKER_END = "<!-- dc-vendor:end -->";
const MARKER_RE = /<!-- dc-vendor:start -->[\s\S]*?<!-- dc-vendor:end -->\n?/;

const VENDOR_BLOCK = `${MARKER_START}
    <link rel="preload" href="/fonts/roboto/roboto-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/open-sans/open-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/css/site-fonts.css">
    <link rel="preload" href="/vendor/font-awesome/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/vendor/font-awesome/css/all.min.css"></noscript>
    ${MARKER_END}`;

function stripExternalFontTags(html) {
  return html
    .replace(MARKER_RE, "")
    .replace(/\s*<link[^>]+href=["']https:\/\/fonts\.googleapis\.com[^"']*["'][^>]*>\n?/gi, "")
    .replace(/\s*<link[^>]+href=["']https:\/\/fonts\.gstatic\.com[^"']*["'][^>]*>\n?/gi, "")
    .replace(/\s*<link[^>]+rel=["']preconnect["'][^>]+fonts\.googleapis\.com[^>]*>\n?/gi, "")
    .replace(/\s*<link[^>]+rel=["']preconnect["'][^>]+fonts\.gstatic\.com[^>]*>\n?/gi, "")
    .replace(/\s*<link[^>]+href=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[^"']*["'][^>]*>\n?/gi, "")
    .replace(/\s*<noscript>\s*<link[^>]+fonts\.googleapis\.com[^>]*>\s*<\/noscript>\n?/gi, "")
    .replace(/\s*<noscript>\s*<link[^>]+font-awesome[^>]*>\s*<\/noscript>\n?/gi, "");
}

function insertVendor(html) {
  const cleaned = stripExternalFontTags(html);
  if (MARKER_RE.test(cleaned)) {
    return cleaned.replace(MARKER_RE, `${VENDOR_BLOCK}\n`);
  }
  const iconsEnd = cleaned.match(/<!-- dc-icons:end -->/);
  if (iconsEnd) {
    return cleaned.replace(
      /<!-- dc-icons:end -->/,
      `<!-- dc-icons:end -->\n    ${VENDOR_BLOCK}`
    );
  }
  const viewportMatch = cleaned.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
  if (viewportMatch) {
    return cleaned.replace(viewportMatch[0], `${viewportMatch[0]}\n    ${VENDOR_BLOCK}`);
  }
  return cleaned.replace(/<head>/i, `<head>\n    ${VENDOR_BLOCK}`);
}

export function applyVendorLinksToHtmlFiles() {
  let updated = 0;
  for (const name of readdirSync(root)) {
    if (!name.endsWith(".html")) continue;
    const filePath = join(root, name);
    const original = readFileSync(filePath, "utf8");
    const html = insertVendor(original);
    if (html !== original) {
      writeFileSync(filePath, html, "utf8");
      updated += 1;
    }
  }
  return updated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = applyVendorLinksToHtmlFiles();
  console.log(`Vendor links injected into ${count} HTML file(s).`);
}
