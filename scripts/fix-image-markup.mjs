#!/usr/bin/env node
/**
 * Add width/height/loading/decoding to local <img src="/img/..."> tags missing dimensions.
 * Run: node scripts/fix-image-markup.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dimCache = new Map();

async function dimensions(rel) {
  if (dimCache.has(rel)) return dimCache.get(rel);
  const path = join(root, rel);
  if (!existsSync(path)) return null;
  const meta = await sharp(path).metadata();
  const value = { width: meta.width, height: meta.height };
  dimCache.set(rel, value);
  return value;
}

function htmlFiles() {
  const files = readdirSync(root)
    .filter((n) => n.endsWith(".html"))
    .map((n) => join(root, n));
  for (const name of readdirSync(join(root, "src", "partials"))) {
    if (name.endsWith(".html")) files.push(join(root, "src", "partials", name));
  }
  return files;
}

function isHero(imgTag) {
  return (
    /fetchpriority\s*=\s*["']high["']/i.test(imgTag) ||
    /\bnavbar-brand-logo\b/.test(imgTag) ||
    /\bdal-hero__logo\b/.test(imgTag)
  );
}

async function fixFile(filePath) {
  let html = readFileSync(filePath, "utf8");
  let changed = false;

  const imgRe = /<img\b[^>]*>/gi;
  const tags = [...html.matchAll(imgRe)].map((m) => m[0]);

  for (const tag of tags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["'](\/img\/[^"']+)["']/i);
    if (!srcMatch) continue;

    const rel = srcMatch[1].slice(1);
    const dims = await dimensions(rel);
    if (!dims?.width || !dims?.height) continue;

    let next = tag;
    if (!/\bwidth\s*=/i.test(next)) {
      next = next.replace(/<img\b/i, `<img width="${dims.width}"`);
    }
    if (!/\bheight\s*=/i.test(next)) {
      next = next.replace(/<img\b/i, `<img height="${dims.height}"`);
    }
    if (!/\bdecoding\s*=/i.test(next)) {
      next = next.replace(/<img\b/i, `<img decoding="async"`);
    }
    if (!isHero(next) && !/\bloading\s*=/i.test(next)) {
      next = next.replace(/<img\b/i, `<img loading="lazy"`);
    }

    if (next !== tag) {
      html = html.replace(tag, next);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, html, "utf8");
    console.log(`Updated ${filePath.replace(root + "/", "")}`);
  }
}

for (const file of htmlFiles()) {
  await fixFile(file);
}

console.log("Image markup fix complete.");
