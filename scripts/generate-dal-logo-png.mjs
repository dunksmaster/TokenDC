import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "img", "dal-logo.svg");
const out = join(root, "img", "dal-logo.png");
const size = 512;

await sharp(src).resize(size, size).png().toFile(out);
console.log(`Wrote ${out} (${size}x${size})`);
