#!/usr/bin/env node
/** Diagnose duacrypto.com DNS + RFC 8288 Link headers for Cloudflare Pages migration. */
import { LINK_HEADER } from "../lib/agent-discovery-headers.mjs";

const targets = [
  process.argv[2] ?? "https://duacrypto.com/",
  "https://www.duacrypto.com/",
  "https://dc-site-4p3.pages.dev/",
];

const requiredRels = ["api-catalog", "service-desc", "service-doc"];

async function check(url) {
  const res = await fetch(url, { method: "HEAD", redirect: "follow" });
  const link = res.headers.get("link");
  const server = res.headers.get("server") ?? "(none)";
  const missing = requiredRels.filter((rel) => !link?.includes(`rel="${rel}"`));
  const github = res.headers.has("x-github-request-id");

  let title = "";
  if (url.includes("duacrypto.com") && !url.includes("robots") && !url.includes("sitemap")) {
    const html = await (await fetch(url)).text();
    title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "(no title)";
  }

  return {
    url,
    status: res.status,
    server,
    link: link ? "present" : "missing",
    missingRels: missing,
    githubOrigin: github,
    title,
    ok: res.ok && link && missing.length === 0 && !github,
  };
}

async function checkAsset(path) {
  const url = `https://duacrypto.com${path}`;
  const res = await fetch(url, { method: "HEAD", redirect: "follow" });
  return { path, status: res.status, ok: res.ok };
}

console.log("Expected Link header (homepage):");
console.log(LINK_HEADER.slice(0, 100) + "...\n");

for (const url of targets) {
  try {
    const r = await check(url);
    const flag = r.ok ? "OK" : "FAIL";
    console.log(`[${flag}] ${r.url}`);
    console.log(`  status=${r.status} server=${r.server} link=${r.link} github=${r.githubOrigin}`);
    if (r.title) console.log(`  title=${r.title}`);
    if (r.missingRels.length) console.log(`  missing rels: ${r.missingRels.join(", ")}`);
  } catch (err) {
    console.log(`[FAIL] ${url}`);
    console.log(`  ${err.message}`);
  }
}

for (const path of ["/robots.txt", "/sitemap.xml"]) {
  try {
    const a = await checkAsset(path);
    const flag = a.ok ? "OK" : "FAIL";
    console.log(`[${flag}] https://duacrypto.com${a.path} (status=${a.status})`);
  } catch (err) {
    console.log(`[FAIL] https://duacrypto.com${path}`);
    console.log(`  ${err.message}`);
  }
}

console.log(`
Notes:
- Nameservers must be Cloudflare (aurora/ernest) OR fix DNS at Dynadot while NS are dyna-ns.net.
- Apex @ must CNAME/ALIAS to dc-site-4p3.pages.dev (not GitHub 185.199.x.x).
- www.duacrypto.com should CNAME to dc-site-4p3.pages.dev.
- Pages custom domain duacrypto.com stays pending until apex CNAME is correct.
`);
