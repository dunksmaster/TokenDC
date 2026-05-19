/**
 * Single source for theme scripts:
 * - src/js/theme-init.js → public/theme-init.js + theme-init.js
 * - src/js/theme-bootstrap.js (+ theme.js) → public/js/theme-bootstrap.js + js/theme-bootstrap.js
 */
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_INIT_SRC = join(root, "src", "js", "theme-init.js");
const THEME_INIT_TARGETS = [
  join(root, "public", "theme-init.js"),
  join(root, "theme-init.js"),
];
const THEME_BOOTSTRAP_OUT = join(root, "public", "js", "theme-bootstrap.js");
const THEME_BOOTSTRAP_MIRROR = join(root, "js", "theme-bootstrap.js");

function publishThemeInit() {
  if (!existsSync(THEME_INIT_SRC)) {
    throw new Error(`Missing theme source: ${THEME_INIT_SRC}`);
  }

  for (const dest of THEME_INIT_TARGETS) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(THEME_INIT_SRC, dest);
  }
}

async function bundleThemeBootstrap() {
  mkdirSync(dirname(THEME_BOOTSTRAP_OUT), { recursive: true });

  await build({
    entryPoints: [join(root, "src", "js", "theme-bootstrap.js")],
    bundle: true,
    format: "iife",
    platform: "browser",
    outfile: THEME_BOOTSTRAP_OUT,
    logLevel: "silent",
    banner: {
      js: "/* Generated from src/js — edit theme.js / theme-bootstrap.js, then npm run build */",
    },
  });

  mkdirSync(dirname(THEME_BOOTSTRAP_MIRROR), { recursive: true });
  copyFileSync(THEME_BOOTSTRAP_OUT, THEME_BOOTSTRAP_MIRROR);
}

export async function buildThemeAssets() {
  publishThemeInit();
  await bundleThemeBootstrap();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await buildThemeAssets();
  console.log("Theme assets built (theme-init.js, theme-bootstrap.js).");
}
