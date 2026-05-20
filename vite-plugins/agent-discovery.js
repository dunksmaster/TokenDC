import { readFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  wantsMarkdown,
  resolveMarkdownAssetPath,
  estimateMarkdownTokens,
  isHomepagePath,
} from "../lib/markdown-negotiation.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby", ' +
  '</openapi/site-api.yaml>; rel="service-desc"; type="application/yaml", ' +
  '</docs/api>; rel="service-doc"; type="text/html", ' +
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';

const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

function markdownFilePath(pathname) {
  const assetPath = resolveMarkdownAssetPath(pathname);
  if (!assetPath) return null;
  return join(root, "public", assetPath);
}

function sendMarkdown(req, res, pathname) {
  const filePath = markdownFilePath(pathname);
  if (!filePath || !existsSync(filePath)) return false;

  const body = readFileSync(filePath, "utf8");
  const isHome = isHomepagePath(pathname);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Vary", "Accept");
  res.setHeader("x-markdown-tokens", estimateMarkdownTokens(body));
  res.setHeader("Content-Signal", CONTENT_SIGNAL);
  if (isHome) res.setHeader("Link", LINK_HEADER);

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  res.end(body);
  return true;
}

function attachDiscoveryHeaders(res, pathname) {
  const isHome = isHomepagePath(pathname);
  const hasMarkdown = Boolean(resolveMarkdownAssetPath(pathname));

  if (!isHome && !hasMarkdown) return;

  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (statusCode, ...args) => {
    if (hasMarkdown) res.setHeader("Vary", "Accept");
    if (isHome) {
      res.setHeader("Link", LINK_HEADER);
      res.setHeader("Content-Signal", CONTENT_SIGNAL);
    }
    if (typeof statusCode === "number") {
      return originalWriteHead(statusCode, ...args);
    }
    return originalWriteHead(200, statusCode, ...args);
  };
}

function markdownMiddleware() {
  return (req, res, next) => {
    const pathname = req.url?.split("?")[0] ?? "/";

    if (
      (req.method === "GET" || req.method === "HEAD") &&
      wantsMarkdown(req.headers.accept)
    ) {
      if (sendMarkdown(req, res, pathname)) return;
    }

    attachDiscoveryHeaders(res, pathname);
    next();
  };
}

export function agentDiscoveryPlugin() {
  return {
    name: "agent-discovery",
    configureServer(server) {
      server.middlewares.use(markdownMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(markdownMiddleware());
    },
  };
}

/** Copy public/md into dist/md after build (belt-and-suspenders with Vite public/). */
export function copyMarkdownToDistPlugin() {
  return {
    name: "copy-markdown-to-dist",
    closeBundle() {
      const src = join(root, "public", "md");
      const dest = join(root, "dist", "md");
      if (!existsSync(src)) return;
      mkdirSync(dest, { recursive: true });
      cpSync(src, dest, { recursive: true });
    },
  };
}
