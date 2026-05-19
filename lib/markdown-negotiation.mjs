/**
 * Shared Markdown for Agents helpers (RFC 7231 Accept negotiation).
 * @see https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

/** @param {string | null | undefined} acceptHeader */
export function wantsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;

  const parts = acceptHeader.split(",").map((p) => p.trim());
  let markdownQ = -1;
  let htmlQ = -1;

  for (const part of parts) {
    const segments = part.split(";").map((s) => s.trim());
    const mime = segments[0].toLowerCase();
    const qParam = segments.find((s) => s.startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    if (Number.isNaN(q) || q <= 0) continue;

    if (mime === "text/markdown" || mime === "text/x-markdown") {
      markdownQ = Math.max(markdownQ, q);
    }
    if (mime === "text/html" || mime === "*/*") {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  if (markdownQ < 0) return false;
  if (htmlQ < 0) return true;
  return markdownQ >= htmlQ;
}

/** @param {string} pathname */
export function resolveMarkdownAssetPath(pathname) {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  if (path === "/" || path === "") return "/md/index.md";
  if (path === "/index.html") return "/md/index.md";

  if (path.endsWith(".html")) {
    const base = path.slice(1).replace(/\.html$/, ".md");
    return `/md/${base}`;
  }

  return null;
}

/** @param {string} text */
export function estimateMarkdownTokens(text) {
  return String(Math.ceil(text.length / 4));
}

/** @param {string} pathname */
export function isHomepagePath(pathname) {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return path === "/" || path === "/index.html";
}
