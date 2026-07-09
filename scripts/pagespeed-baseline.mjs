#!/usr/bin/env node
/**
 * Run Lighthouse performance baseline for / and /events.html (mobile + desktop).
 * Requires Chrome at default path or CHROME_PATH env var.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "psi-artifacts");

const TARGETS = [
  { id: "home-mobile", url: "https://duacrypto.com/", mobile: true },
  { id: "home-desktop", url: "https://duacrypto.com/", mobile: false },
  { id: "events-mobile", url: "https://duacrypto.com/events.html", mobile: true },
  { id: "events-desktop", url: "https://duacrypto.com/events.html", mobile: false },
];

function chromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function runLighthouse(target) {
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${target.id}.json`);
  const args = [
    "lighthouse",
    target.url,
    "--only-categories=performance",
    "--output=json",
    `--output-path=${outFile}`,
    "--chrome-flags=--headless=new --no-sandbox",
    "--quiet",
  ];
  if (target.mobile) {
    args.push("--form-factor=mobile", "--screenEmulation.mobile=true");
  } else {
    args.push("--preset=desktop");
  }

  const chrome = chromePath();
  const env = { ...process.env };
  if (chrome) env.CHROME_PATH = chrome;

  const result = spawnSync("npx", args, { cwd: root, env, shell: true, stdio: "inherit" });
  if (!existsSync(outFile)) {
    throw new Error(`Lighthouse did not write ${outFile} (exit ${result.status})`);
  }
  const json = JSON.parse(readFileSync(outFile, "utf8"));
  return {
    id: target.id,
    url: target.url,
    perf: Math.round(json.categories.performance.score * 100),
    cls: json.audits["cumulative-layout-shift"].displayValue,
    lcp: json.audits["largest-contentful-paint"].displayValue,
  };
}

function printTable(rows) {
  const date = new Date().toISOString().slice(0, 10);
  const byUrl = new Map();
  for (const r of rows) {
    const key = r.url;
    if (!byUrl.has(key)) byUrl.set(key, { url: key, date });
    const entry = byUrl.get(key);
    if (r.id.includes("mobile")) {
      entry.mobilePerf = r.perf;
      entry.mobileCls = r.cls;
      entry.mobileLcp = r.lcp;
    } else {
      entry.desktopPerf = r.perf;
      entry.desktopCls = r.cls;
      entry.desktopLcp = r.lcp;
    }
  }

  console.log("\n--- PageSpeed baseline ---");
  console.log("| URL | Mobile perf | Mobile CLS | Mobile LCP | Desktop perf | Desktop CLS | Date |");
  console.log("|-----|-------------|------------|------------|--------------|-------------|------|");
  for (const e of byUrl.values()) {
    console.log(
      `| ${e.url} | ${e.mobilePerf ?? "—"} | ${e.mobileCls ?? "—"} | ${e.mobileLcp ?? "—"} | ${e.desktopPerf ?? "—"} | ${e.desktopCls ?? "—"} | ${date} |`
    );
  }
}

async function main() {
  const rows = [];
  for (const target of TARGETS) {
    console.log(`\nRunning Lighthouse: ${target.id}…`);
    rows.push(runLighthouse(target));
  }
  printTable(rows);
  writeFileSync(join(outDir, "latest.json"), JSON.stringify(rows, null, 2));
  console.log(`\nArtifacts: docs/psi-artifacts/`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
