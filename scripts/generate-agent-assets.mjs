import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebBotAuth } from "./generate-web-bot-auth.mjs";
import { buildThemeAssets } from "./build-theme-assets.mjs";
import { applySeoToHtmlFiles } from "./inject-seo.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const siteUrl = "https://duacrypto.com";
const today = new Date().toISOString().slice(0, 10);

const htmlPages = [
  { file: "index.html", loc: "/", changefreq: "weekly", priority: "1.0" },
  { file: "about.html", loc: "/about.html", changefreq: "monthly", priority: "0.9" },
  { file: "service.html", loc: "/service.html", changefreq: "monthly", priority: "0.8" },
  { file: "roadmap.html", loc: "/roadmap.html", changefreq: "monthly", priority: "0.8" },
  { file: "events.html", loc: "/events.html", changefreq: "weekly", priority: "0.9" },
  { file: "feature.html", loc: "/feature.html", changefreq: "monthly", priority: "0.7" },
  { file: "token.html", loc: "/token.html", changefreq: "monthly", priority: "0.7" },
  { file: "faq.html", loc: "/faq.html", changefreq: "monthly", priority: "0.8" },
  { file: "contact.html", loc: "/contact.html", changefreq: "yearly", priority: "0.6" },
  { file: "donation.html", loc: "/donation.html", changefreq: "yearly", priority: "0.5" },
  { file: "privacy.html", loc: "/privacy.html", changefreq: "yearly", priority: "0.4" },
  { file: "terms.html", loc: "/terms.html", changefreq: "yearly", priority: "0.4" },
];

const DISALLOW_PATHS = [
  "/404.html",
  "/$10.html",
  "/node_modules/",
  "/src/",
  "/scss/",
  "/dist/",
  "/lib/",
  "/js/",
  "/.github/",
  "/.vscode/",
  "/.cursor/",
];

const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

/** Required by isitagentready ai-rules skill (explicit User-agent blocks). */
const AI_CRAWLER_AGENTS = [
  { name: "GPTBot", aiInput: true },
  { name: "OAI-SearchBot", aiInput: true },
  { name: "Claude-Web", aiInput: true },
  { name: "Google-Extended", aiInput: true },
  { name: "Amazonbot", aiInput: true },
  { name: "anthropic-ai", aiInput: true },
  { name: "Bytespider", aiInput: false },
  { name: "CCBot", aiInput: false },
  { name: "Applebot-Extended", aiInput: true },
  { name: "PerplexityBot", aiInput: true },
];

const STANDARD_CRAWLER_AGENTS = [
  { name: "*", aiInput: true },
  { name: "Googlebot", aiInput: true },
  { name: "Bingbot", aiInput: true },
];

function htmlToMarkdown(html, sourcePath) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
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

function sha256File(path) {
  const data = readFileSync(path);
  return `sha256:${createHash("sha256").update(data).digest("hex")}`;
}

function robotsAgentBlock(group) {
  const lines = [`User-agent: ${group.name}`];
  if (group.aiInput === false) {
    lines.push("Disallow: /");
  } else {
    lines.push("Allow: /");
    for (const path of DISALLOW_PATHS) {
      lines.push(`Disallow: ${path}`);
    }
  }
  const signal =
    group.aiInput === false
      ? "ai-train=no, search=yes, ai-input=no"
      : CONTENT_SIGNAL;
  lines.push(`Content-Signal: ${signal}`);
  return lines;
}

function generateRobotsTxt() {
  const lines = [
    `# robots.txt for ${siteUrl}/`,
    "# https://www.rfc-editor.org/rfc/rfc9309",
    `# Policy: ${CONTENT_SIGNAL}`,
    "",
    "# --- AI crawlers (explicit User-agent rules; wildcard alone is not sufficient) ---",
    "",
  ];

  for (const group of AI_CRAWLER_AGENTS) {
    lines.push(...robotsAgentBlock(group), "");
  }

  lines.push("# --- Standard crawlers ---", "");

  for (const group of STANDARD_CRAWLER_AGENTS) {
    lines.push(...robotsAgentBlock(group), "");
  }

  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, "");

  return lines.join("\n");
}

function generateSitemapXml() {
  const urls = htmlPages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.loc === "/" ? "/" : page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function generateMarkdown() {
  const mdDir = join(root, "public", "md");
  mkdirSync(mdDir, { recursive: true });

  for (const page of htmlPages) {
    const htmlPath = join(root, page.file);
    const html = readFileSync(htmlPath, "utf8");
    const markdown = htmlToMarkdown(html, page.file);
    const outName =
      page.file === "index.html" ? "index.md" : page.file.replace(/\.html$/, ".md");
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

function syncSiteApi() {
  const pages = htmlPages.map((page) => {
    const html = readFileSync(join(root, page.file), "utf8");
    const title =
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? page.file;
    return {
      path: page.loc,
      title,
      url: `${siteUrl}${page.loc === "/" ? "/" : page.loc}`,
    };
  });

  writeFileSync(
    join(root, "public", "api", "v1", "site", "pages"),
    `${JSON.stringify({ pages }, null, 2)}\n`,
    "utf8"
  );

  writeStaticHealthJson();
}

/** Static health JSON for GitHub Pages (no Functions). Skipped locally to avoid git churn. */
function writeStaticHealthJson() {
  const epochRaw = process.env.SOURCE_DATE_EPOCH;
  if (!epochRaw) return;

  const epoch = Number(epochRaw);
  if (!Number.isFinite(epoch) || epoch <= 0) return;

  const healthPath = join(root, "public", "api", "v1", "site", "health");
  writeFileSync(
    healthPath,
    `${JSON.stringify(
      {
        status: "ok",
        service: "duacrypto-site-api",
        version: "1.0.0",
        timestamp: new Date(epoch * 1000).toISOString(),
        source: "static",
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

/**
 * Canonical dark-mode stylesheet: public/css/dark-mode.css (copied to dist/ by Vite).
 * Mirror to css/dark-mode.css for legacy HTML opened from the repo root without Vite.
 */
function syncThemeCss() {
  const publicPath = join(root, "public", "css", "dark-mode.css");
  const mirrorPath = join(root, "css", "dark-mode.css");

  if (!existsSync(publicPath) && existsSync(mirrorPath)) {
    mkdirSync(dirname(publicPath), { recursive: true });
    copyFileSync(mirrorPath, publicPath);
    console.warn(
      "syncThemeCss: migrated css/dark-mode.css → public/css/dark-mode.css"
    );
  }

  if (!existsSync(publicPath)) {
    console.warn(
      "syncThemeCss: missing public/css/dark-mode.css (required for Vite build / dist deploy)"
    );
    return;
  }

  mkdirSync(dirname(mirrorPath), { recursive: true });
  copyFileSync(publicPath, mirrorPath);
}

/** Mirror legacy /css, /lib, and /js assets into public/ for Vite dev + GitHub Pages. */
function syncLegacyAssetsToPublic() {
  const bootstrapSrc = join(root, "css", "bootstrap.min.css");
  const bootstrapDest = join(root, "public", "css", "bootstrap.min.css");
  if (!existsSync(bootstrapSrc)) {
    throw new Error(
      `Missing ${bootstrapSrc} — required for legacy pages (about, service, etc.)`
    );
  }
  mkdirSync(dirname(bootstrapDest), { recursive: true });
  copyFileSync(bootstrapSrc, bootstrapDest);

  const styleSrc = join(root, "css", "style.css");
  const styleDest = join(root, "public", "css", "style.css");
  if (!existsSync(styleSrc)) {
    throw new Error(`Missing ${styleSrc}`);
  }
  copyFileSync(styleSrc, styleDest);

  const libSrc = join(root, "lib");
  const libDest = join(root, "public", "lib");
  if (!existsSync(libSrc)) {
    throw new Error(`Missing ${libSrc}`);
  }
  cpSync(libSrc, libDest, { recursive: true });

  const mainJsSrc = join(root, "js", "main.js");
  const mainJsDest = join(root, "public", "js", "main.js");
  if (!existsSync(mainJsSrc)) {
    throw new Error(`Missing ${mainJsSrc}`);
  }
  mkdirSync(dirname(mainJsDest), { recursive: true });
  copyFileSync(mainJsSrc, mainJsDest);
}

function writeRootDiscoveryFiles() {
  const robots = generateRobotsTxt();
  const sitemap = generateSitemapXml();

  const targets = [
    join(root, "public", "robots.txt"),
    join(root, "robots.txt"),
    join(root, "public", "sitemap.xml"),
    join(root, "sitemap.xml"),
  ];

  writeFileSync(targets[0], robots, "utf8");
  writeFileSync(targets[1], robots, "utf8");
  writeFileSync(targets[2], sitemap, "utf8");
  writeFileSync(targets[3], sitemap, "utf8");

  try {
    statSync(join(root, "public", ".nojekyll"));
  } catch {
    writeFileSync(join(root, "public", ".nojekyll"), "", "utf8");
  }
}

applySeoToHtmlFiles();
generateMarkdown();
collectSkills();
syncSiteApi();
await buildThemeAssets();
syncThemeCss();
syncLegacyAssetsToPublic();
generateWebBotAuth();
writeRootDiscoveryFiles();
console.log(
  "Agent assets generated (robots, sitemap, markdown, skills, API, theme, web-bot-auth)."
);
