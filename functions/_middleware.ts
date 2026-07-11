import {
  CONTENT_SIGNAL,
  LINK_HEADER,
} from "../lib/agent-discovery-headers.mjs";
import {
  wantsMarkdown,
  resolveMarkdownAssetPath,
  estimateMarkdownTokens,
  isHomepagePath,
} from "../lib/markdown-negotiation.mjs";

const WEB_BOT_AUTH_DIRECTORY =
  "/.well-known/http-message-signatures-directory";

function markdownHeaders(pathname: string): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  if (isHomepagePath(pathname)) {
    headers.set("Link", LINK_HEADER);
  }
  headers.set("Content-Signal", CONTENT_SIGNAL);
  return headers;
}

async function serveMarkdown(
  request: Request,
  env: Env,
  url: URL,
  pathname: string
): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }

  if (!wantsMarkdown(request.headers.get("Accept"))) {
    return null;
  }

  const mdPath = resolveMarkdownAssetPath(pathname);
  if (!mdPath) return null;

  const mdResponse = await env.ASSETS.fetch(
    new Request(new URL(mdPath, url.origin), request)
  );
  if (!mdResponse.ok) return null;

  const body = await mdResponse.text();
  const headers = markdownHeaders(pathname);
  headers.set("x-markdown-tokens", estimateMarkdownTokens(body));

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(body, { status: 200, headers });
}

async function withDiscoveryHeaders(
  response: Response,
  pathname: string
): Promise<Response> {
  const headers = new Headers(response.headers);

  if (resolveMarkdownAssetPath(pathname)) {
    headers.set("Vary", "Accept");
  }

  if (!isHomepagePath(pathname)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

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
  /** JSON Web Key (Ed25519 private). Enables signed directory responses on Cloudflare. */
  WEB_BOT_AUTH_PRIVATE_JWK?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  if (
    request.method === "GET" &&
    (url.pathname === "/$10" || url.pathname === "/$10.html")
  ) {
    return Response.redirect(new URL("/newsletter", url.origin).href, 301);
  }

  if (
    request.method === "GET" &&
    url.pathname === WEB_BOT_AUTH_DIRECTORY &&
    env.WEB_BOT_AUTH_PRIVATE_JWK
  ) {
    const { signedDirectoryResponse } = await import("./web-bot-auth-directory");
    const asset = await env.ASSETS.fetch(
      new Request(new URL(WEB_BOT_AUTH_DIRECTORY, url.origin), request)
    );
    if (asset.ok) {
      const body = await asset.text();
      return signedDirectoryResponse(
        request,
        body,
        env.WEB_BOT_AUTH_PRIVATE_JWK
      );
    }
  }

  const markdownResponse = await serveMarkdown(request, env, url, url.pathname);
  if (markdownResponse) return markdownResponse;

  const response = await next();
  return withDiscoveryHeaders(response, url.pathname);
};
