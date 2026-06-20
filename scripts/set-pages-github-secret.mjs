import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const paths = [
  join(homedir(), ".wrangler", "config", "default.toml"),
  join(homedir(), "AppData", "Roaming", "xdg.config", ".wrangler", "config", "default.toml"),
];

let token = process.env.CLOUDFLARE_PAGES_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN ?? "";
for (const path of paths) {
  try {
    const match = readFileSync(path, "utf8").match(/^oauth_token\s*=\s*"([^"]+)"/m);
    if (match) {
      token = match[1];
      break;
    }
  } catch {
    /* try next */
  }
}

if (!token) {
  console.error("No Cloudflare Pages token found. Run: npx wrangler login");
  process.exit(1);
}

writeFileSync("cf-pages-token.tmp", token, { encoding: "utf8" });
execSync('gh secret set CLOUDFLARE_PAGES_API_TOKEN < cf-pages-token.tmp', {
  stdio: "inherit",
  shell: true,
});
writeFileSync("cf-pages-token.tmp", "0".repeat(token.length));
console.log("CLOUDFLARE_PAGES_API_TOKEN updated in GitHub secrets.");
