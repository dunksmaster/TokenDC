/**
 * Normalize favicon, apple-touch-icon, and web manifest links across all HTML pages.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER_START = "<!-- dc-icons:start -->";
const MARKER_END = "<!-- dc-icons:end -->";
const MARKER_RE = /<!-- dc-icons:start -->[\s\S]*?<!-- dc-icons:end -->\n?/;

const DUA_ICONS = `${MARKER_START}
    <link rel="icon" href="/img/duacrypto-mark.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" sizes="180x180">
    <link rel="manifest" href="/site.webmanifest">
    ${MARKER_END}`;

const DAL_ICONS = `${MARKER_START}
    <link rel="icon" href="/img/dal-logo.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" sizes="180x180">
    <link rel="manifest" href="/site.webmanifest">
    ${MARKER_END}`;

function stripLegacyIconTags(html) {
  return html
    .replace(MARKER_RE, "")
    .replace(/\s*<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>\n?/gi, "")
    .replace(/\s*<link[^>]+href=["'][^"']*favicon[^"']*["'][^>]*>\n?/gi, "");
}

function insertIcons(html, block) {
  const cleaned = stripLegacyIconTags(html);
  if (MARKER_RE.test(cleaned)) {
    return cleaned.replace(MARKER_RE, `${block}\n`);
  }
  const viewportMatch = cleaned.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
  if (viewportMatch) {
    return cleaned.replace(viewportMatch[0], `${viewportMatch[0]}\n    ${block}`);
  }
  return cleaned.replace(/<head>/i, `<head>\n    ${block}`);
}

export function applyIconsToHtmlFiles() {
  let updated = 0;
  for (const name of readdirSync(root)) {
    if (!name.endsWith(".html")) continue;
    const filePath = join(root, name);
    const original = readFileSync(filePath, "utf8");
    const block = name === "bitcoin-for-corporations.html" ? DAL_ICONS : DUA_ICONS;
    const html = insertIcons(original, block);
    if (html !== original) {
      writeFileSync(filePath, html, "utf8");
      updated += 1;
    }
  }
  return updated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = applyIconsToHtmlFiles();
  console.log(`Icons injected into ${count} HTML file(s).`);
}
