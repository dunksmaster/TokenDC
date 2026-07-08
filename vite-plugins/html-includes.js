import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const partialsDir = join(root, "src", "partials");

const PARTIAL_RE = /<!-- @partial\s+(\w+)(?:\s+active=(\w+))? -->/g;
const LEGACY_INCLUDE_RE = /<!-- include:(\w+) -->/g;
const PAGE_ACTIVE_RE = /<!-- page-active:(\w+) -->\s*/g;
const PAGE_PREFIX_RE = /<!-- page-prefix:[^>]+ -->\s*/g;

/** @type {Record<string, string>} */
const cache = {};

function loadPartial(name) {
  if (cache[name]) return cache[name];
  const path = join(partialsDir, `${name}.html`);
  if (!existsSync(path)) {
    throw new Error(`html-includes: missing partial ${path}`);
  }
  cache[name] = readFileSync(path, "utf8");
  return cache[name];
}

/** @param {string} html @param {string | undefined} active */
function applyActiveNav(html, active) {
  if (!active) return html;
  return html.replace(/<a\s([^>]*data-nav="([^"]+)"[^>]*)>/g, (_full, attrs, nav) => {
    const isActive = nav === active;
    let next = attrs;
    if (/\bclass="/.test(next)) {
      next = next.replace(/\bclass="([^"]*)"/, (_, cls) => {
        const base = cls.replace(/\bnav-link-active\b/g, "").replace(/\s+/g, " ").trim();
        const combined = isActive ? `${base} nav-link-active`.trim() : base;
        return `class="${combined}"`;
      });
    } else if (isActive) {
      next = `class="nav-link-active" ${next}`;
    }
    return `<a ${next}>`;
  });
}

/**
 * Resolve <!-- @partial header active=about --> includes in HTML.
 * @param {string} html
 */
export function processHtmlIncludes(html) {
  const activeFromComment = html.match(/<!-- page-active:(\w+) -->/)?.[1];
  let result = html.replace(PARTIAL_RE, (_match, name, active) => {
    let partial = loadPartial(name);
    if (name === "header") {
      partial = applyActiveNav(partial, active ?? activeFromComment);
    }
    return partial;
  });
  result = result.replace(LEGACY_INCLUDE_RE, (_match, name) => {
    let partial = loadPartial(name);
    if (name === "header") {
      partial = applyActiveNav(partial, activeFromComment);
    }
    return partial;
  });
  result = result.replace(PAGE_ACTIVE_RE, "");
  result = result.replace(PAGE_PREFIX_RE, "");
  return result;
}

/** Vite plugin: expand partial includes at dev/build time. */
export function htmlIncludesPlugin() {
  return {
    name: "html-includes",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return processHtmlIncludes(html);
      },
    },
  };
}
