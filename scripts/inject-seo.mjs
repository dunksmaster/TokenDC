import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seoPages, buildSeoHeadBlock } from "./seo-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MARKER_START = "<!-- dc-seo:start -->";
const MARKER_END = "<!-- dc-seo:end -->";
const MARKER_RE = /<!-- dc-seo:start -->[\s\S]*?<!-- dc-seo:end -->/;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateTitle(html, title) {
  return html.replace(/<title[^>]*>[^<]*<\/title>/i, `<title>${title}</title>`);
}

function updateDescription(html, description) {
  if (/<meta[^>]+name=["']description["']/i.test(html)) {
    return html.replace(
      /<meta[^>]+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${description.replace(/"/g, "&quot;")}">`
    );
  }
  return html.replace(
    /<meta charset="utf-8">/i,
    `<meta charset="utf-8">\n    <meta name="description" content="${description.replace(/"/g, "&quot;")}">`
  );
}

function removeMetaKeywords(html) {
  return html.replace(/\s*<meta name="keywords"[^>]*>\s*/i, "\n");
}

function injectSeoBlock(html, block) {
  const wrapped = `${MARKER_START}\n${block}\n    ${MARKER_END}`;
  if (MARKER_RE.test(html)) {
    return html.replace(MARKER_RE, wrapped);
  }
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  if (descMatch) {
    return html.replace(descMatch[0], `${descMatch[0]}\n    ${wrapped}`);
  }
  const titleMatch = html.match(/<title[^>]*>[^<]*<\/title>/i);
  if (titleMatch) {
    return html.replace(titleMatch[0], `${titleMatch[0]}\n    ${wrapped}`);
  }
  return html.replace(/<head>/i, `<head>\n    ${wrapped}`);
}

export function applySeoToHtmlFiles() {
  let updated = 0;
  for (const page of seoPages) {
    const filePath = join(root, page.file);
    if (!existsSync(filePath)) {
      console.warn(`inject-seo: skipping missing ${page.file}`);
      continue;
    }
    const original = readFileSync(filePath, "utf8");
    let html = original;
    html = updateTitle(html, page.title);
    html = updateDescription(html, page.description);
    html = removeMetaKeywords(html);
    html = injectSeoBlock(html, buildSeoHeadBlock(page));
    if (html !== original) {
      writeFileSync(filePath, html, "utf8");
      updated += 1;
    }
  }
  return updated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = applySeoToHtmlFiles();
  console.log(`SEO injected into ${count} HTML file(s).`);
}
