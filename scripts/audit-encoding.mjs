/**
 * Audit HTML for encoding corruption in visible body (excludes scripts/URLs).
 * Run: node scripts/audit-encoding.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", "dist", ".git"]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.html$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function visibleBody(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/https?:\/\/[^\s"'<>]+/g, "URL")
    .replace(/[?&][a-zA-Z0-9_]+=[^\s"'<>]*/g, "");
}

const patterns = [
  { name: "??", re: /\?\?/g },
  { name: "U+FFFD", re: /\uFFFD/g },
  { name: ">?<span", re: />\?<\/span>/g },
  { name: ">??<span", re: />\?\?<\/span>/g },
  { name: "<p>??", re: /<p>\?\? /g },
  { name: " ? word", re: / \? [A-Za-z]/g },
  { name: "mojibake", re: /ï¿½/g },
  { name: "emoji", re: /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu },
];

let any = false;
for (const file of walk(ROOT)) {
  const body = visibleBody(fs.readFileSync(file, "utf8"));
  const rel = path.relative(ROOT, file);
  for (const { name, re } of patterns) {
    const m = body.match(re);
    if (m?.length) {
      any = true;
      console.log(`${rel}: ${name} x${m.length}`);
    }
  }
}
if (!any) console.log("No corruption patterns in HTML body text.");
