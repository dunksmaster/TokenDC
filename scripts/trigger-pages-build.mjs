#!/usr/bin/env node
/** Trigger a Cloudflare Pages Git build on main (builds on CF, no local upload). */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "51d0340bb43eebb07f7c2da17733c3e9";
const PROJECT = "dc-site";
const token =
  process.env.CLOUDFLARE_API_TOKEN ??
  process.env.CLOUDFLARE_PAGES_API_TOKEN ??
  readWranglerOAuthToken();

function readWranglerOAuthToken() {
  const paths = [
    join(homedir(), ".wrangler", "config", "default.toml"),
    join(homedir(), "AppData", "Roaming", "xdg.config", ".wrangler", "config", "default.toml"),
  ];
  for (const path of paths) {
    try {
      const text = readFileSync(path, "utf8");
      const match = text.match(/^oauth_token\s*=\s*"([^"]+)"/m);
      if (match) return match[1];
    } catch {
      /* try next */
    }
  }
  return null;
}

async function api(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.map((e) => e.message).join("; ") ?? res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

async function main() {
  if (!token) {
    console.error("No Cloudflare token. Run: wrangler login");
    process.exit(1);
  }

  const project = (await api(`/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`)).result;
  console.log(`Project: ${project.name}`);
  console.log(`Source: ${project.source?.type ?? "none"} ${project.source?.config?.repo_name ?? ""}`);

  const deployment = (
    await api(`/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`, {
      method: "POST",
      body: JSON.stringify({ branch: "main" }),
    })
  ).result;

  console.log(`Deployment triggered: ${deployment.id}`);
  console.log(`URL: ${deployment.url ?? "(pending)"}`);
  console.log(
    `Dashboard: https://dash.cloudflare.com/${ACCOUNT_ID}/pages/view/${PROJECT}/${deployment.id}`
  );
}

main().catch((err) => {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
