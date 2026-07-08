/**
 * Single source for theme scripts:
 * - src/js/theme-init.js → public/theme-init.js + theme-init.js
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_INIT_SRC = join(root, "src", "js", "theme-init.js");
const THEME_INIT_TARGETS = [
  join(root, "public", "theme-init.js"),
  join(root, "theme-init.js"),
];

function publishThemeInit() {
  if (!existsSync(THEME_INIT_SRC)) {
    throw new Error(`Missing theme source: ${THEME_INIT_SRC}`);
  }

  for (const dest of THEME_INIT_TARGETS) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(THEME_INIT_SRC, dest);
  }
}

export async function buildThemeAssets() {
  publishThemeInit();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await buildThemeAssets();
  console.log("Theme assets built (theme-init.js).");
}
