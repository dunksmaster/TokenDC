const LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby", ' +
  '</openapi/site-api.yaml>; rel="service-desc"; type="application/yaml", ' +
  '</docs/api>; rel="service-doc"; type="text/html", ' +
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';

const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

function wantsMarkdown(req) {
  const accept = req.headers.accept ?? "";
  return accept.includes("text/markdown");
}

function markdownPath(pathname) {
  if (pathname === "/" || pathname === "") return "/md/index.md";
  if (pathname.endsWith(".html")) return `/md/${pathname.replace(/\.html$/, ".md")}`;
  return null;
}

function estimateTokens(text) {
  return String(Math.ceil(text.length / 4));
}

export function agentDiscoveryPlugin() {
  return {
    name: "agent-discovery",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "/";
        const isHome = pathname === "/" || pathname === "/index.html";

        if (wantsMarkdown(req)) {
          const mdPath = markdownPath(pathname);
          if (mdPath) {
            try {
              const mdUrl = `${req.headers["x-forwarded-proto"] ?? "http"}://${req.headers.host}${mdPath}`;
              const response = await fetch(mdUrl);
              if (response.ok) {
                const body = await response.text();
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/markdown; charset=utf-8");
                res.setHeader("Vary", "Accept");
                res.setHeader("x-markdown-tokens", estimateTokens(body));
                res.setHeader("Content-Signal", CONTENT_SIGNAL);
                if (isHome) res.setHeader("Link", LINK_HEADER);
                res.end(body);
                return;
              }
            } catch {
              // fall through to default handling
            }
          }
        }

        if (isHome) {
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

        next();
      });
    },
  };
}
