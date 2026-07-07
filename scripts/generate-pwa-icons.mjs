/**
 * Generate apple-touch-icon.png from duacrypto-mark.svg (180×180).
 * Run as part of npm run build via generate-agent-assets.mjs.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "img", "duacrypto-mark.svg");
const outPath = join(root, "img", "apple-touch-icon.png");

export async function generatePwaIcons() {
  const svg = readFileSync(svgPath);
  await sharp(svg)
    .resize(180, 180, { fit: "contain", background: { r: 17, g: 17, b: 17, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generatePwaIcons();
  console.log("PWA icons generated (apple-touch-icon.png).");
}
