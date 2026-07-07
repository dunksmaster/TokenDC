/**
 * Resize and recompress raster images in img/ to cut deploy weight.
 * Archives unreferenced raster files over 100 KB (removed from img/, not deployed).
 *
 * Run: node scripts/optimize-images.mjs
 * Wired into: npm run build (before Vite)
 */
import { createHash } from "node:crypto";
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const imgDir = join(root, "img");
const manifestPath = join(root, "scripts", ".image-optimize-manifest.json");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** Per-filename max width (px). Default applied when no match. */
const MAX_WIDTH = {
  default: 1600,
  icon: 128,
  logo: 400,
  hero: 1024,
  heroSmall: 600,
  profile: 840,
  og: 1200,
  qr: 400,
  gallery: 1200,
};

function maxWidthFor(filename) {
  const base = basename(filename).toLowerCase();
  if (/^icon-\d+\./.test(base)) return MAX_WIDTH.icon;
  if (base.includes("duacrypto-logo") || base.includes("dal-logo")) return MAX_WIDTH.logo;
  if (base === "hero-2.png" || base === "hero-2.webp") return MAX_WIDTH.heroSmall;
  if (base.includes("hero-albania")) return MAX_WIDTH.hero;
  if (base.includes("kane-profile")) return MAX_WIDTH.profile;
  if (base.startsWith("og-")) return MAX_WIDTH.og;
  if (base.includes("lightning-qr") || base.includes("qr-only")) return MAX_WIDTH.qr;
  if (
    base.includes("balkans-crypto") ||
    base.includes("bitcoin-pizza") ||
    base.includes("as-seen-on") ||
    base.includes("donation-book")
  ) {
    return MAX_WIDTH.gallery;
  }
  return MAX_WIDTH.default;
}

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walkFiles(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function collectReferencedImages() {
  const refs = new Set();
  const pattern = /\/img\/([a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|svg|ico))/gi;

  const scanFile = (file) => {
    if (!/\.(html|css|js|mjs|json|md)$/i.test(file)) return;
    const text = readFileSync(file, "utf8");
    let m;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(text)) !== null) {
      refs.add(m[1]);
    }
  };

  // Root HTML pages
  for (const name of readdirSync(root)) {
    if (name.endsWith(".html")) scanFile(join(root, name));
  }

  for (const sub of ["css", "js", "src", "public", "scripts", "lib"]) {
    const target = join(root, sub);
    try {
      if (!statSync(target).isDirectory()) continue;
    } catch {
      continue;
    }
    for (const file of walkFiles(target)) scanFile(file);
  }

  return refs;
}

function fileHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function loadManifest() {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function formatBytes(n) {
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

async function optimizeRaster(filePath, manifest) {
  const rel = relative(imgDir, filePath);
  const hash = fileHash(filePath);
  if (manifest[rel]?.hash === hash) {
    return { rel, skipped: true, saved: 0 };
  }

  const before = statSync(filePath).size;
  const ext = extname(filePath).toLowerCase();
  const maxW = maxWidthFor(rel);

  let pipeline = sharp(filePath, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (!meta.width) return { rel, skipped: true, saved: 0, reason: "unreadable" };

  if (meta.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  }

  let out;
  if (ext === ".jpg" || ext === ".jpeg") {
    out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } else if (ext === ".png") {
    out = await pipeline.png({ compressionLevel: 9, palette: meta.width <= 512 }).toBuffer();
  } else if (ext === ".webp") {
    out = await pipeline.webp({ quality: 82 }).toBuffer();
  } else {
    return { rel, skipped: true, saved: 0 };
  }

  if (out.length >= before) {
    manifest[rel] = { hash, bytes: before, at: new Date().toISOString() };
    return { rel, skipped: true, saved: 0, reason: "no-gain" };
  }

  writeFileSync(filePath, out);
  const after = out.length;
  manifest[rel] = { hash: createHash("sha256").update(out).digest("hex"), bytes: after, at: new Date().toISOString() };
  return { rel, skipped: false, saved: before - after, before, after };
}

async function ensureWebpSibling(filePath, referenced) {
  const ext = extname(filePath).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") return null;

  const base = basename(filePath, ext);
  const webpName = `${base}.webp`;
  const webpPath = join(dirname(filePath), webpName);

  if (!referenced.has(basename(filePath)) && !referenced.has(webpName)) return null;

  const maxW = maxWidthFor(webpName);
  let pipeline = sharp(filePath, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (!meta.width) return null;
  if (meta.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  }
  const out = await pipeline.webp({ quality: 82 }).toBuffer();
  const before = existsSafe(webpPath) ? statSync(webpPath).size : Infinity;
  if (out.length >= before) return null;
  writeFileSync(webpPath, out);
  return { webp: webpName, bytes: out.length };
}

function existsSafe(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function pruneUnreferenced(referenced) {
  const removed = [];

  for (const filePath of walkFiles(imgDir)) {
    const ext = extname(filePath).toLowerCase();
    if (!RASTER_EXT.has(ext)) continue;

    const name = basename(filePath);
    if (referenced.has(name)) continue;

    const size = statSync(filePath).size;
    if (size < 100 * 1024) continue;

    rmSync(filePath);
    removed.push({ name, size });
  }
  return removed;
}

async function main() {
  const referenced = collectReferencedImages();
  const manifest = loadManifest();
  let totalSaved = 0;
  const optimized = [];
  const skipped = [];

  const rasterFiles = walkFiles(imgDir).filter((f) =>
    RASTER_EXT.has(extname(f).toLowerCase())
  );

  for (const filePath of rasterFiles) {
    const name = basename(filePath);
    if (!referenced.has(name)) continue;

    const result = await optimizeRaster(filePath, manifest);
    if (result.skipped) {
      skipped.push(result);
    } else {
      optimized.push(result);
      totalSaved += result.saved;
      console.log(
        `  optimized ${result.rel}: ${formatBytes(result.before)} → ${formatBytes(result.after)}`
      );
    }

    const webp = await ensureWebpSibling(filePath, referenced);
    if (webp) {
      console.log(`  webp ${webp.webp}: ${formatBytes(webp.bytes)}`);
    }
  }

  const removed = pruneUnreferenced(referenced);
  for (const { name, size } of removed) {
    console.log(`  removed (unreferenced) ${name}: ${formatBytes(size)}`);
    totalSaved += size;
  }

  saveManifest(manifest);

  const imgSize = dirSize(imgDir);
  console.log(
    `\nImage optimize: ${optimized.length} compressed, ${removed.length} removed, ${formatBytes(totalSaved)} saved. img/ now ${formatBytes(imgSize)}.`
  );
}

function dirSize(dir) {
  let total = 0;
  for (const f of walkFiles(dir)) {
    try {
      total += statSync(f).size;
    } catch {
      /* ignore */
    }
  }
  return total;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
