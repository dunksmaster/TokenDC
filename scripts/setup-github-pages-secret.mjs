#!/usr/bin/env node
/**
 * Guide + verify Cloudflare Pages deploy token for GitHub Actions.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run setup:pages-deploy
 *   gh secret set CLOUDFLARE_PAGES_API_TOKEN   # after verify passes
 */
import { spawnSync } from "node:child_process";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "51d0340bb43eebb07f7c2da17733c3e9";

console.log("Cloudflare Pages deploy — GitHub secret setup\n");
console.log("1. Create token: https://dash.cloudflare.com/profile/api-tokens");
console.log("   Custom token → Account → Cloudflare Pages → Edit");
console.log(`2. Account ID: ${accountId}`);
console.log("3. Verify locally:");
console.log("   $env:CLOUDFLARE_API_TOKEN=\"your-token\"; npm run verify:cf-token");
console.log("4. Set GitHub secret:");
console.log("   gh secret set CLOUDFLARE_PAGES_API_TOKEN");
console.log("5. Re-run: Actions → Deploy to Cloudflare Pages → Re-run all jobs\n");

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.log("No CLOUDFLARE_API_TOKEN in env — paste token above to verify.");
  process.exit(0);
}

const result = spawnSync("npm", ["run", "verify:cf-token"], {
  stdio: "inherit",
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId },
  shell: true,
});

if (result.status === 0) {
  console.log("\nToken OK. Run: gh secret set CLOUDFLARE_PAGES_API_TOKEN");
}
process.exit(result.status ?? 1);
