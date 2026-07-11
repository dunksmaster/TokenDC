#!/usr/bin/env node
/**
 * Push a Cloudflare Pages API token to GitHub secrets (both repos).
 *
 * Prefer a permanent API token (not Wrangler OAuth):
 *   1. https://dash.cloudflare.com/profile/api-tokens → Create Token → Custom
 *   2. Permission: Account → Cloudflare Pages → Edit
 *   3. Account Resources: include your account
 *   4. Run:
 *        $env:CLOUDFLARE_PAGES_API_TOKEN="your-token"
 *        npm run set:pages-secret
 *
 * Falls back to local Wrangler OAuth if env var is unset (temporary ~15h).
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repos = ["dunksmaster/TokenDC", "dunksmaster/duacrypto-news"];
const tmpFile = join(root, "cf-pages-token.tmp");

function readWranglerOAuth() {
  const paths = [
    join(homedir(), ".wrangler", "config", "default.toml"),
    join(homedir(), "AppData", "Roaming", "xdg.config", ".wrangler", "config", "default.toml"),
  ];
  for (const path of paths) {
    try {
      const match = readFileSync(path, "utf8").match(/^oauth_token\s*=\s*"([^"]+)"/m);
      if (match) return match[1];
    } catch {
      /* try next */
    }
  }
  return "";
}

const fromEnv =
  process.env.CLOUDFLARE_PAGES_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN ?? "";
const fromWrangler = fromEnv ? "" : readWranglerOAuth();
const token = fromEnv || fromWrangler;
const source = fromEnv ? "env (permanent API token)" : fromWrangler ? "Wrangler OAuth (temporary)" : "";

if (!token) {
  console.error("No token found.\n");
  console.error("Create a permanent token:");
  console.error("  https://dash.cloudflare.com/profile/api-tokens → Create Token → Custom");
  console.error("  Permission: Account → Cloudflare Pages → Edit");
  console.error("\nThen run:");
  console.error('  $env:CLOUDFLARE_PAGES_API_TOKEN="your-token"; npm run set:pages-secret');
  process.exit(1);
}

console.log(`Using token from: ${source}`);
if (!fromEnv) {
  console.warn("WARNING: Wrangler OAuth expires in ~15 hours. Use a permanent API token instead.\n");
}

const verify = spawnSync(
  process.execPath,
  [join(root, "scripts", "verify-cloudflare-token.mjs")],
  {
    env: { ...process.env, CLOUDFLARE_PAGES_API_TOKEN: token },
    stdio: "inherit",
  },
);
if (verify.status !== 0) {
  console.error("\nToken verification failed. Fix permissions before setting GitHub secrets.");
  process.exit(1);
}

writeFileSync(tmpFile, token, { encoding: "utf8" });
try {
  for (const repo of repos) {
    execSync(`gh secret set CLOUDFLARE_PAGES_API_TOKEN --repo ${repo} < "${tmpFile}"`, {
      stdio: "inherit",
      shell: true,
    });
    console.log(`CLOUDFLARE_PAGES_API_TOKEN updated on ${repo}`);
  }
} finally {
  writeFileSync(tmpFile, "0".repeat(token.length));
  try {
    unlinkSync(tmpFile);
  } catch {
    /* ignore */
  }
}

console.log("\nDone. Trigger a deploy to confirm:");
console.log("  gh workflow run cloudflare-pages.yml --repo dunksmaster/TokenDC");
console.log("  gh workflow run deploy.yml --repo dunksmaster/duacrypto-news");
