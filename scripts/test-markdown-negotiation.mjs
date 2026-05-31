import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  wantsMarkdown,
  resolveMarkdownAssetPath,
  estimateMarkdownTokens,
} from "../lib/markdown-negotiation.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(wantsMarkdown("text/markdown"), true);
assert.equal(wantsMarkdown("text/markdown, text/html;q=0.9"), true);
assert.equal(wantsMarkdown("text/html, text/markdown;q=0.8"), false);
assert.equal(wantsMarkdown("text/markdown;q=1, text/html;q=0.5"), true);
assert.equal(wantsMarkdown("text/html"), false);
assert.equal(wantsMarkdown("text/html, text/markdown;q=0"), false);

assert.equal(resolveMarkdownAssetPath("/"), "/md/index.md");
assert.equal(resolveMarkdownAssetPath("/index.html"), "/md/index.md");
assert.equal(resolveMarkdownAssetPath("/events.html"), "/md/events.md");
assert.equal(resolveMarkdownAssetPath("/api/v1/site/health"), null);

const indexMd = join(root, "public", "md", "index.md");
assert.ok(existsSync(indexMd), "public/md/index.md must exist (run npm run build)");
assert.ok(Number(estimateMarkdownTokens("abcd")) >= 1);

const indexBody = readFileSync(indexMd, "utf8");
assert.match(indexBody, /source: "curated"/);
assert.match(indexBody, /Albania's first Bitcoin and crypto community/);

const aboutMd = join(root, "public", "md", "about.md");
assert.ok(existsSync(aboutMd));
const aboutBody = readFileSync(aboutMd, "utf8");
assert.match(
  aboutBody,
  /description: "Learn about DuaCrypto, Albania's first crypto community/
);
assert.doesNotMatch(aboutBody, /description: "Learn about DuaCrypto, Albania"\n/);

const dalMd = join(root, "public", "md", "bitcoin-for-corporations.md");
assert.ok(existsSync(dalMd));
const dalBody = readFileSync(dalMd, "utf8");
assert.match(dalBody, /source: "curated"/);
assert.match(dalBody, /### What is DAL\?/);

async function curlMarkdown(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const proc = spawn(
    "curl.exe",
    ["-sS", "-D", "-", "-o", "-", "-H", "Accept: text/markdown", url],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  let stdout = "";
  proc.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  const code = await new Promise((resolve, reject) => {
    proc.on("error", reject);
    proc.on("close", resolve);
  });

  if (code !== 0) {
    throw new Error(`curl failed for ${url} (exit ${code})`);
  }

  const split = stdout.indexOf("\r\n\r\n");
  const headerBlock = split >= 0 ? stdout.slice(0, split) : "";
  const body = split >= 0 ? stdout.slice(split + 4) : stdout;
  const statusLine = headerBlock.split("\r\n")[0] ?? "";
  const contentType =
    headerBlock.match(/^content-type:\s*(.+)$/im)?.[1]?.trim() ?? "";
  const tokens =
    headerBlock.match(/^x-markdown-tokens:\s*(\d+)/im)?.[1] ?? "";

  return { statusLine, contentType, tokens, body };
}

const runIntegration = process.argv.includes("--integration");
if (runIntegration) {
  const base = process.argv[process.argv.indexOf("--integration") + 1] ?? "http://localhost:5173";
  const { statusLine, contentType, tokens, body } = await curlMarkdown(base, "/");
  assert.match(statusLine, /200/);
  assert.match(contentType, /text\/markdown/i);
  assert.ok(tokens.length > 0, "x-markdown-tokens header required");
  assert.ok(body.includes("---"), "markdown body should include frontmatter");
  console.log(`Integration OK: ${base}/ → text/markdown (${tokens} tokens)`);
} else {
  console.log("Unit checks OK (run with --integration http://localhost:5173 after npm run dev)");
}
