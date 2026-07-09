#!/usr/bin/env node
/**
 * List x402-related routes and dependencies for security review.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(js|mjs|ts|json|yaml|yml|md|html)$/i.test(name)) {
      const text = readFileSync(p, "utf8");
      if (/x402|@x402/i.test(text)) hits.push(p.replace(root + "\\", "").replace(root + "/", ""));
    }
  }
}

walk(root);
console.log("x402 surface audit:");
if (!hits.length) {
  console.log("  (no matches)");
} else {
  for (const h of hits.sort()) console.log(`  - ${h}`);
}
