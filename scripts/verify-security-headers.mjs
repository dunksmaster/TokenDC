#!/usr/bin/env node
/**
 * Verify Cloudflare Pages _headers includes required security and cache directives.
 * Usage: node scripts/verify-security-headers.mjs [path/to/_headers]
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const headersPath =
  process.argv[2] ?? join(root, "dist", "_headers");

if (!existsSync(headersPath)) {
  console.error(`FAIL: missing ${headersPath} (run npm run build first)`);
  process.exit(1);
}

const content = readFileSync(headersPath, "utf8");

/** @returns {{ path: string; headers: Record<string, string> }[]} */
function parseHeadersFile(text) {
  /** @type {{ path: string; headers: Record<string, string> }[]} */
  const sections = [];
  let currentPath = null;
  /** @type {Record<string, string>} */
  let headers = {};

  for (const line of text.split("\n")) {
    if (line.startsWith("  ")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const name = line.slice(2, idx).trim();
      const value = line.slice(idx + 1).trim();
      headers[name] = value;
      continue;
    }
    if (line.trim() === "") continue;
    if (currentPath) sections.push({ path: currentPath, headers });
    currentPath = line.trim();
    headers = {};
  }
  if (currentPath) sections.push({ path: currentPath, headers });
  return sections;
}

const sections = parseHeadersFile(content);
const globalBlock = sections.find((s) => s.path === "/*");
const errors = [];

if (!globalBlock) {
  errors.push("missing /* global block");
} else {
  const h = globalBlock.headers;
  const required = [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ];
  for (const name of required) {
    if (!h[name]) errors.push(`/* missing ${name}`);
  }
  const csp =
    h["Content-Security-Policy"] ?? h["Content-Security-Policy-Report-Only"];
  if (!csp) errors.push("/* missing Content-Security-Policy (or Report-Only)");
  if (h["X-Content-Type-Options"] !== "nosniff") {
    errors.push("/* X-Content-Type-Options must be nosniff");
  }
}

const cachePaths = ["/img/*", "/css/*", "/js/*", "/fonts/*", "/vendor/*"];
for (const path of cachePaths) {
  const block = sections.find((s) => s.path === path);
  if (!block?.headers["Cache-Control"]?.includes("immutable")) {
    errors.push(`${path} missing Cache-Control immutable`);
  }
}

const manifest = sections.find((s) => s.path === "/site.webmanifest");
if (!manifest?.headers["Content-Type"]?.includes("manifest")) {
  errors.push("/site.webmanifest missing Content-Type application/manifest+json");
}

console.log(`Checking: ${headersPath}`);

if (errors.length) {
  console.error("\nFAIL: security headers verification failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const cspMode = globalBlock.headers["Content-Security-Policy"]
  ? "enforce"
  : "report-only";
console.log(`\nOK: security headers verified (CSP mode: ${cspMode}).`);
console.log(`  Sections parsed: ${sections.length}`);
