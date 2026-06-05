import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_SIGNAL,
  LINK_HEADER,
} from "../lib/agent-discovery-headers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function wantsMarkdown(req) {
  const accept = req.headers.accept ?? "";
  return accept.includes("text/markdown");
}

function markdownPath(pathname) {
  if (pathname === "/" || pathname === "") return "public/md/index.md";
  if (pathname.endsWith(".html")) {
    return `public/md/${pathname.replace(/^\//, "").replace(/\.html$/, ".md")}`;
  }
  return null;
}

function estimateTokens(text) {
  return String(Math.ceil(text.length / 4));
}

function attachDiscoveryHeaders(res, isHome) {
  if (!isHome) return;
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (statusCode, ...args) => {
    res.setHeader("Link", LINK_HEADER);
    res.setHeader("Content-Signal", CONTENT_SIGNAL);
    if (typeof statusCode === "number") {
      return originalWriteHead(statusCode, ...args);
    }
    return originalWriteHead(200, statusCode, ...args);
  };
}

export function agentDiscoveryPlugin() {
  return {
    name: "agent-discovery",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "/";
        const isHome = pathname === "/" || pathname === "/index.html";

        if (wantsMarkdown(req)) {
          const relMd = markdownPath(pathname);
          if (relMd) {
            const filePath = join(root, relMd);
            if (existsSync(filePath)) {
              const body = readFileSync(filePath, "utf8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/markdown; charset=utf-8");
              res.setHeader("Vary", "Accept");
              res.setHeader("x-markdown-tokens", estimateTokens(body));
              res.setHeader("Content-Signal", CONTENT_SIGNAL);
              if (isHome) res.setHeader("Link", LINK_HEADER);
              res.end(body);
              return;
            }
          }
        }

        attachDiscoveryHeaders(res, isHome);
        next();
      });
    },
  };
}
