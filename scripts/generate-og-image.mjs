import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, "img", "og-default.png");

const W = 1200;
const H = 630;

const logoBuf = await sharp(join(root, "img", "duacrypto-logo.png"))
  .resize(280, null, { fit: "inside" })
  .png()
  .toBuffer();

const markBuf = await sharp(join(root, "img", "duacrypto-mark.svg"))
  .resize(72, 72)
  .png()
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="50%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#0d1520"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#16D5FF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#7ed321" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#accent)"/>
  <circle cx="1050" cy="80" r="180" fill="#16D5FF" opacity="0.06"/>
  <circle cx="120" cy="520" r="140" fill="#7ed321" opacity="0.05"/>
  <text x="80" y="380" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">DuaCrypto</text>
  <text x="80" y="430" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#16D5FF">Bitcoin &amp; Crypto Community in Albania</text>
  <text x="80" y="475" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="400" fill="#cccccc">Tirana · 10,000+ members</text>
  <text x="80" y="540" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400" fill="#888888">duacrypto.com</text>
</svg>`;

const base = await sharp(Buffer.from(svg)).png().toBuffer();

await sharp(base)
  .composite([
    { input: logoBuf, top: 100, left: 80 },
    { input: markBuf, top: 48, left: W - 120 },
  ])
  .png()
  .toFile(out);

console.log(`Wrote ${out} (${W}x${H})`);
