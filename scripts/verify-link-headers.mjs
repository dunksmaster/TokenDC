#!/usr/bin/env node
/** Verify RFC 8288 Link response headers on a homepage URL. */
const url = process.argv[2] ?? "https://duacrypto.com/";

const res = await fetch(url, { method: "HEAD", redirect: "follow" });
const link = res.headers.get("link");
const server = res.headers.get("server") ?? "(none)";

console.log(`URL: ${url}`);
console.log(`Status: ${res.status}`);
console.log(`Server: ${server}`);

if (!link) {
  console.error("\nFAIL: No Link response header.");
  if (/github/i.test(server)) {
    console.error(
      "Hint: This host is GitHub Pages. Use Cloudflare Pages for Link headers (see docs/CLOUDFLARE-DEPLOY.md)."
    );
  }
  process.exit(1);
}

const required = ["api-catalog", "service-desc", "service-doc"];
const missing = required.filter((rel) => !link.includes(`rel="${rel}"`));

if (missing.length) {
  console.error(`\nFAIL: Link header missing relations: ${missing.join(", ")}`);
  console.error(`Link: ${link}`);
  process.exit(1);
}

console.log("\nOK: Link header present with expected relations.");
console.log(`Link: ${link.slice(0, 120)}${link.length > 120 ? "..." : ""}`);
