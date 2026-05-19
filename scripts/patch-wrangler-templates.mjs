import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wranglerRoot = join(root, "node_modules", "wrangler", "templates");

const CHECKED_FETCH = join(wranglerRoot, "checked-fetch.js");
const LOADER_MODULES = join(wranglerRoot, "middleware", "loader-modules.ts");

const CHECKED_FETCH_PATCHED = `const state = globalThis.__WRANGLER_CHECKED_FETCH__ ?? {
\turls: new Set(),
\twrapped: false,
};
globalThis.__WRANGLER_CHECKED_FETCH__ = state;

function checkURL(request, init) {
\tconst url =
\t\trequest instanceof URL
\t\t\t? request
\t\t\t: new URL(
\t\t\t\t\t(typeof request === "string" ? new Request(request, init) : request)
\t\t\t\t\t\t.url
\t\t\t\t);
\tif (url.port && url.port !== "443" && url.protocol === "https:") {
\t\tif (!state.urls.has(url.toString())) {
\t\t\tstate.urls.add(url.toString());
\t\t\tconsole.warn(
\t\t\t\t\`WARNING: known issue with \\\`fetch()\\\` requests to custom HTTPS ports in published Workers:\\n\` +
\t\t\t\t\t\` - \${url.toString()} - the custom port will be ignored when the Worker is published using the \\\`wrangler deploy\\\` command.\\n\`
\t\t\t);
\t\t}
\t}
}

if (!state.wrapped) {
\tstate.wrapped = true;
\tconst nativeFetch = globalThis.fetch;
\tglobalThis.fetch = new Proxy(nativeFetch, {
\t\tapply(target, thisArg, argArray) {
\t\t\tconst [request, init] = argArray;
\t\t\tcheckURL(request, init);
\t\t\treturn Reflect.apply(target, thisArg, argArray);
\t\t},
\t});
}
`;

const LOADER_MODULES_OLD = `let WRAPPED_ENTRY: ExportedHandler | WorkerEntrypointConstructor | undefined;
if (typeof ENTRY === "object") {
\tWRAPPED_ENTRY = wrapExportedHandler(ENTRY);
} else if (typeof ENTRY === "function") {
\tWRAPPED_ENTRY = wrapWorkerEntrypoint(ENTRY);
}
export default WRAPPED_ENTRY;`;

const LOADER_MODULES_NEW = `let WRAPPED_ENTRY: ExportedHandler | WorkerEntrypointConstructor;
if (typeof ENTRY === "object" && ENTRY !== null) {
\tWRAPPED_ENTRY = wrapExportedHandler(ENTRY);
} else if (typeof ENTRY === "function") {
\tWRAPPED_ENTRY = wrapWorkerEntrypoint(ENTRY);
} else {
\tthrow new Error(
\t\t\`Invalid worker entry point: expected an ExportedHandler object or WorkerEntrypoint class, received \${ENTRY === null ? "null" : typeof ENTRY}. Check that Pages Functions compile and export handlers correctly.\`
\t);
}
export default WRAPPED_ENTRY;`;

function patchFile(path, { marker, content, replace }) {
  if (!existsSync(path)) {
    console.warn(`patch-wrangler-templates: skip missing ${path}`);
    return false;
  }

  const current = readFileSync(path, "utf8");
  if (current.includes(marker)) {
    return false;
  }

  const next = replace ? replace(current) : content;
  if (next === current) {
    console.warn(`patch-wrangler-templates: no changes applied to ${path}`);
    return false;
  }

  writeFileSync(path, next, "utf8");
  return true;
}

let patched = 0;

if (
  patchFile(CHECKED_FETCH, {
    marker: "__WRANGLER_CHECKED_FETCH__",
    content: CHECKED_FETCH_PATCHED,
  })
) {
  patched += 1;
  console.log("patch-wrangler-templates: patched checked-fetch.js");
}

if (
  patchFile(LOADER_MODULES, {
    marker: "Invalid worker entry point:",
    replace: (source) =>
      source.includes(LOADER_MODULES_OLD)
        ? source.replace(LOADER_MODULES_OLD, LOADER_MODULES_NEW)
        : source,
  })
) {
  patched += 1;
  console.log("patch-wrangler-templates: patched middleware/loader-modules.ts");
}

if (patched === 0) {
  console.log("patch-wrangler-templates: templates already patched");
}
