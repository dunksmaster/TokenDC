const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);

const LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby", ' +
  '</openapi/site-api.yaml>; rel="service-desc"; type="application/yaml", ' +
  '</docs/api>; rel="service-doc"; type="text/html", ' +
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';

const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

function wantsMarkdown(request: Request): boolean {
  const accept = request.headers.get("Accept") ?? "";
  return accept.includes("text/markdown");
}

function markdownPath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "/md/index.md";
  if (pathname.endsWith(".html")) return `/md/${pathname.replace(/\.html$/, ".md")}`;
  return null;
}

function estimateTokens(text: string): string {
  return String(Math.ceil(text.length / 4));
}

function markdownHeaders(pathname: string): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  if (HOMEPAGE_PATHS.has(pathname)) {
    headers.set("Link", LINK_HEADER);
  }
  headers.set("Content-Signal", CONTENT_SIGNAL);
  return headers;
}

async function withDiscoveryHeaders(
  response: Response,
  pathname: string
): Promise<Response> {
  if (!HOMEPAGE_PATHS.has(pathname)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Link", LINK_HEADER);
  headers.set("Content-Signal", CONTENT_SIGNAL);

  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

interface Env {
  ASSETS: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  if (wantsMarkdown(request)) {
    const mdPath = markdownPath(url.pathname);
    if (mdPath) {
      const mdResponse = await env.ASSETS.fetch(
        new Request(new URL(mdPath, url.origin), request)
      );
      if (mdResponse.ok) {
        const body = await mdResponse.text();
        const headers = markdownHeaders(url.pathname);
        headers.set("x-markdown-tokens", estimateTokens(body));
        return new Response(body, { status: 200, headers });
      }
    }
  }

  const response = await next();
  return withDiscoveryHeaders(response, url.pathname);
};
