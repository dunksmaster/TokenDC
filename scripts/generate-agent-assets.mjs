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
import { siteUrl as seoSiteUrl, seoPages } from "./seo-config.mjs";
import { cloudflareHeadersBlock } from "../lib/agent-discovery-headers.mjs";
import {
  generateAuthMd,
  OPENID_CONFIGURATION,
  OAUTH_AUTHORIZATION_SERVER,
  PROTECTED_RESOURCE_METADATA,
} from "../lib/auth-md-config.mjs";

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
  { file: "bitcoin-for-corporations.html", loc: "/bitcoin-for-corporations.html", changefreq: "monthly", priority: "0.7" },
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

const seoByFile = Object.fromEntries(seoPages.map((p) => [p.file, p]));

function parseMetaDescription(html) {
  const match =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ??
    html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  return match?.[1]?.replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
}

function buildMarkdownFrontmatter({ title, description, source }) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    `source: ${JSON.stringify(source)}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");
}

function htmlToMarkdown(html, sourcePath) {
  const seo = seoByFile[sourcePath];
  const title =
    seo?.title ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? sourcePath;
  const description = seo?.description ?? parseMetaDescription(html);

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<div[^>]*id=["']spinner["'][\s\S]*?<\/div>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  body = body
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<summary[^>]*>([\s\S]*?)<\/summary>/gi, "\n### $1\n")
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
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "" && line.trim() !== "-")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return `${buildMarkdownFrontmatter({ title, description, source: sourcePath })}\n\n${body}\n`;
}

const homepageSeo = seoByFile["index.html"];
const dalSeo = seoByFile["bitcoin-for-corporations.html"];

/**
 * Curated homepage mirror for AI crawlers (GPTBot, OAI-SearchBot).
 * index.html uses Tailwind/spinner/counter markup that htmlToMarkdown cannot clean.
 */
function homepageAgentMarkdown() {
  const title = homepageSeo?.title ?? "DuaCrypto";
  const description =
    homepageSeo?.description ??
    "Albania's first Bitcoin and crypto community in Tirana.";

  const frontmatter = buildMarkdownFrontmatter({
    title,
    description,
    source: "curated",
  });

  const u = seoSiteUrl;
  const body = `# DuaCrypto — Bitcoin & crypto community in Albania

DuaCrypto is **Albania's first Bitcoin and crypto community**, founded in **Tirana** in 2020 and active across the **Balkans**. We bring together developers, students, and professionals to learn **Bitcoin**, **cryptocurrency**, and **Web3** through workshops, meetups, and free educational resources. Our community has **10,000+ members** and hosts regional events including Balkans Crypto conferences and Bitcoin Pizza Day meetups in Tirana.

We offer beginner-friendly education (Albanian and English), corporate guidance on Bitcoin treasury strategy via the **Digital Asset Leaders (DAL)** program, and community initiatives such as Lightning book donations for Balkans students.

## Key pages

- [Events](${u}/events.html) — Balkans Crypto, Bitcoin Pizza Day, and Tirana meetups
- [FAQs](${u}/faq.html) — joining the community, education, and regulations
- [Bitcoin for Corporations](${u}/bitcoin-for-corporations.html) — DAL enterprise Bitcoin adoption
- [Donate a Book](${u}/donation.html) — fund Bitcoin books via Lightning Network
- [About](${u}/about.html) · [Services](${u}/service.html) · [Contact](${u}/contact.html)

**Contact:** info@duacrypto.com · [Telegram](https://t.me/dua_crypto) · [duacrypto.com](${u}/)`;

  return `${frontmatter}\n\n${body}\n`;
}

/** Curated DAL page mirror (corporate Bitcoin / Lightning membership). */
function dalAgentMarkdown() {
  const title = dalSeo?.title ?? "Bitcoin for Corporations | DAL — DuaCrypto";
  const description =
    dalSeo?.description ??
    "Digital Asset Leaders Association — enterprise Bitcoin adoption in Albania and the Balkans.";

  const frontmatter = buildMarkdownFrontmatter({
    title,
    description,
    source: "curated",
  });

  const u = seoSiteUrl;
  const faqBlock = (dalSeo?.faqs ?? [])
    .map(
      (item) =>
        `### ${item.question}\n\n${item.answer}`
    )
    .join("\n\n");

  const body = `# Bitcoin for Corporations — DAL (Digital Asset Leaders)

**DAL** is DuaCrypto's local partner in **Tirana, Albania** that acts as a **bridge for crypto-first companies into Durana Tech Park** — consulting them through residency and Albania's fiscal incentives — alongside **corporate Bitcoin treasury**, **policy**, and **executive networking** support. Membership is **$99/year**, paid via **Bitcoin Lightning** only.

## Who it is for

CTOs, directors, corporate treasurers, and founders building Bitcoin-first organizations who want a local partner to enter Durana Tech Park plus treasury resources and policy working groups.

## What DAL helps with

- **Durana Tech Park residency consulting** — end-to-end application and feasibility-study guidance (our core service)
- Access to Durana's fiscal incentives, innovation ecosystem, tech talent, and competitive cost base
- Treasury best practices and board-level guidance for corporate Bitcoin holdings
- Executive roundtables, policy working groups, and a private Telegram community after Lightning payment verification

## Why companies choose Durana Tech Park

- Fiscal incentives for qualifying residents
- Innovation ecosystem of startups, companies, and research institutions
- Growing local tech talent pool
- Soft-landing support for registration and setup
- Competitive operating cost base and a Balkans / EU-adjacent gateway

## Related pages

- [Community homepage](${u}/)
- [Community FAQs](${u}/faq.html)
- [Events](${u}/events.html)
- [Contact](${u}/contact.html)

## Frequently asked questions

${faqBlock}

**Contact:** info@duacrypto.com · [Telegram](https://t.me/dua_crypto)`;

  return `${frontmatter}\n\n${body}\n`;
}

function markdownForPage(page) {
  if (page.file === "index.html") return homepageAgentMarkdown();
  if (page.file === "bitcoin-for-corporations.html") return dalAgentMarkdown();
  return htmlToMarkdown(readFileSync(join(root, page.file), "utf8"), page.file);
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
    const markdown = markdownForPage(page);
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

/** auth.md + OAuth PRM / AS metadata for agent registration discovery. */
function syncAuthMdFiles() {
  writeFileSync(
    join(root, "public", "auth.md"),
    `${generateAuthMd()}\n`,
    "utf8"
  );
  writeFileSync(
    join(root, "public", ".well-known", "oauth-protected-resource"),
    `${JSON.stringify(PROTECTED_RESOURCE_METADATA, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(
    join(root, "public", ".well-known", "oauth-authorization-server"),
    `${JSON.stringify(OAUTH_AUTHORIZATION_SERVER, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(
    join(root, "public", ".well-known", "openid-configuration"),
    `${JSON.stringify(OPENID_CONFIGURATION, null, 2)}\n`,
    "utf8"
  );
}

/** RFC 8288 Link headers for Cloudflare Pages (`public/_headers` → `dist/_headers`). */
function syncLinkHeadersFile() {
  const home = cloudflareHeadersBlock();
  const content = `/
${home}

/index.html
${home}

/.well-known/api-catalog
  Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"

/robots.txt
  Content-Type: text/plain; charset=utf-8

/sitemap.xml
  Content-Type: application/xml; charset=utf-8

/auth.md
  Content-Type: text/markdown; charset=utf-8

/md/*
  Content-Type: text/markdown; charset=utf-8
  Vary: Accept

/.well-known/http-message-signatures-directory
  Content-Type: application/http-message-signatures-directory+json; charset=utf-8
  Cache-Control: max-age=86400

/.well-known/jwks.json
  Content-Type: application/json; charset=utf-8
`;
  writeFileSync(join(root, "public", "_headers"), content, "utf8");
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
syncAuthMdFiles();
syncLinkHeadersFile();
writeRootDiscoveryFiles();
console.log(
  "Agent assets generated (robots, sitemap, markdown, skills, API, theme, web-bot-auth, auth.md, link-headers)."
);
