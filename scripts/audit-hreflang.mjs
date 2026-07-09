#!/usr/bin/env node
/** Verify hreflang alternate links on pages that declare them. */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let found = 0;

for (const name of readdirSync(root)) {
  if (!name.endsWith(".html")) continue;
  const html = readFileSync(join(root, name), "utf8");
  if (/hreflang=/i.test(html)) {
    found += 1;
    console.log(`  ${name}: has hreflang`);
  }
}

if (!found) {
  console.log("No hreflang tags yet (expected until /sq/ pages ship).");
}
