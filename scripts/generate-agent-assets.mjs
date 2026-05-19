import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const siteUrl = "https://duacrypto.com";

const htmlPages = [
  "index.html",
  "about.html",
  "service.html",
  "roadmap.html",
  "events.html",
  "feature.html",
  "token.html",
  "faq.html",
  "contact.html",
  "donation.html",
];

function htmlToMarkdown(html, sourcePath) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const title = titleMatch?.[1]?.trim() ?? sourcePath;
  const description = descMatch?.[1]?.trim();

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  body = body
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1\n")
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    `source: ${JSON.stringify(sourcePath)}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  return `${frontmatter}\n\n${body}\n`;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function sha256File(path) {
  const data = readFileSync(path);
  return `sha256:${createHash("sha256").update(data).digest("hex")}`;
}

function generateMarkdown() {
  const mdDir = join(root, "public", "md");
  mkdirSync(mdDir, { recursive: true });

  for (const page of htmlPages) {
    const htmlPath = join(root, page);
    const html = readFileSync(htmlPath, "utf8");
    const markdown = htmlToMarkdown(html, page);
    const outName = page === "index.html" ? "index.md" : page.replace(/\.html$/, ".md");
    writeFileSync(join(mdDir, outName), markdown, "utf8");
  }
}

function collectSkills() {
  const skillsDir = join(root, "public", ".well-known", "agent-skills");
  const entries = [];

  for (const name of readdirSync(skillsDir)) {
    const skillPath = join(skillsDir, name, "SKILL.md");
    try {
      if (!statSync(skillPath).isFile()) continue;
    } catch {
      continue;
    }

    const relUrl = `/.well-known/agent-skills/${name}/SKILL.md`;
    const description =
      readFileSync(skillPath, "utf8").match(/^description:\s*(.+)$/m)?.[1]?.trim() ??
      `DuaCrypto agent skill: ${name}`;

    entries.push({
      name,
      type: "skill-md",
      description,
      url: `${siteUrl}${relUrl}`,
      digest: sha256File(skillPath),
    });
  }

  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: entries,
  };

  writeFileSync(join(skillsDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

function updateSitemapLastmod() {
  const today = new Date().toISOString().slice(0, 10);
  const sitemapPath = join(root, "public", "sitemap.xml");
  let xml = readFileSync(sitemapPath, "utf8");
  if (!xml.includes("<lastmod>")) {
    xml = xml.replace(/<priority>/g, `<lastmod>${today}</lastmod>\n    <priority>`);
  } else {
    xml = xml.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  }
  writeFileSync(sitemapPath, xml, "utf8");
}

generateMarkdown();
collectSkills();
updateSitemapLastmod();
console.log("Agent assets generated (markdown, skills index, sitemap lastmod).");
