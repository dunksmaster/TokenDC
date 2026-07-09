/**
 * Add intrinsic width/height to local /img/ tags missing dimensions (CLS).
 *
 * Run: node scripts/fix-image-markup.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const imgDir = join(root, "img");

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const LOCAL_SRC_RE = /\bsrc\s*=\s*["'](\/img\/[^"']+)["']/i;

function collectTargetFiles() {
  const files = [];
  for (const name of readdirSync(root)) {
    if (name.endsWith(".html")) files.push(join(root, name));
  }

  const blogDir = join(root, "blog");
  if (existsDir(blogDir)) {
    for (const name of readdirSync(blogDir)) {
      if (name.endsWith(".html")) files.push(join(blogDir, name));
    }
  }

  const partialsDir = join(root, "src", "partials");
  if (existsDir(partialsDir)) {
    for (const name of readdirSync(partialsDir)) {
      if (name.endsWith(".html")) files.push(join(partialsDir, name));
    }
  }

  return files;
}

function existsDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function resolveImagePath(src) {
  const rel = src.replace(/^\/img\//, "");
  const direct = join(imgDir, rel);
  if (existsFile(direct)) return direct;

  const dot = rel.lastIndexOf(".");
  const stem = dot >= 0 ? rel.slice(0, dot) : rel;
  for (const ext of [".webp", ".png", ".jpg", ".jpeg"]) {
    const candidate = join(imgDir, `${stem}${ext}`);
    if (existsFile(candidate)) return candidate;
  }

  return null;
}

function existsFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

async function readDimensions(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  if (ext === ".svg") return null;

  const meta = await sharp(filePath, { failOn: "none" }).metadata();
  if (!meta.width || !meta.height) return null;
  return { width: meta.width, height: meta.height };
}

function upsertDimension(tag, name, value) {
  const attrRe = new RegExp(`\\b${name}\\s*=\\s*["'][^"']*["']`, "i");
  if (attrRe.test(tag)) {
    return tag.replace(attrRe, `${name}="${value}"`);
  }
  return tag.replace(/^<img\b/i, `<img ${name}="${value}"`);
}

async function fixFile(filePath) {
  const original = readFileSync(filePath, "utf8");
  let html = original;
  let changed = 0;

  for (const match of original.matchAll(IMG_TAG_RE)) {
    const tag = match[0];
    const srcMatch = tag.match(LOCAL_SRC_RE);
    if (!srcMatch) continue;

    if (/\bwidth\s*=/i.test(tag) && /\bheight\s*=/i.test(tag)) continue;

    const imagePath = resolveImagePath(srcMatch[1]);
    if (!imagePath) {
      console.warn(`  skip (missing file): ${srcMatch[1]} in ${basename(filePath)}`);
      continue;
    }

    const dims = await readDimensions(imagePath);
    if (!dims) {
      console.warn(`  skip (no dimensions): ${srcMatch[1]} in ${basename(filePath)}`);
      continue;
    }

    let next = tag;
    if (!/\bwidth\s*=/i.test(tag)) next = upsertDimension(next, "width", dims.width);
    if (!/\bheight\s*=/i.test(tag)) next = upsertDimension(next, "height", dims.height);

    if (next !== tag) {
      html = html.replace(tag, next);
      changed += 1;
    }
  }

  if (html !== original) {
    writeFileSync(filePath, html, "utf8");
  }

  return changed;
}

async function main() {
  const files = collectTargetFiles();
  let total = 0;

  for (const filePath of files) {
    const count = await fixFile(filePath);
    if (count > 0) {
      console.log(`${basename(filePath)}: fixed ${count} <img> tag(s)`);
      total += count;
    }
  }

  console.log(`\nfix-image-markup: ${total} tag(s) updated across ${files.length} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
