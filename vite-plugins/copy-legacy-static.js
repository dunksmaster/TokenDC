import { cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Copy root static dirs into dist/ for GitHub Pages (no Cloudflare ASSETS binding). */
export function copyLegacyStaticPlugin() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const dirs = ["img", "lib", "css", "js"];

  return {
    name: "copy-legacy-static",
    closeBundle() {
      for (const dir of dirs) {
        const src = join(root, dir);
        if (!existsSync(src)) continue;
        cpSync(src, join(root, "dist", dir), { recursive: true });
      }
    },
  };
}
