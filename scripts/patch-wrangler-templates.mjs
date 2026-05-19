import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wranglerRoot = join(root, "node_modules", "wrangler", "templates");

const CHECKED_FETCH = join(wranglerRoot, "checked-fetch.js");
const LOADER_MODULES = join(wranglerRoot, "middleware", "loader-modules.ts");
const PAGES_TEMPLATE = join(wranglerRoot, "pages-template-worker.ts");
const WRANGLER_CLI = join(root, "node_modules", "wrangler", "wrangler-dist", "cli.js");

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

const PAGES_TEMPLATE_OLD = `\t\t\t} else if (__FALLBACK_SERVICE__) {
\t\t\t\t// There are no more handlers so finish with the fallback service (\`env.ASSETS.fetch\` in Pages' case)
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t} else {
\t\t\t\t// There was not fallback service so actually make the request to the origin.
\t\t\t\tconst response = await fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t}
\t\t};

\t\ttry {
\t\t\treturn await next();
\t\t} catch (error) {
\t\t\tif (isFailOpen) {
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);`;

const PAGES_TEMPLATE_NEW = `\t\t\t} else if (env[__FALLBACK_SERVICE__]) {
\t\t\t\t// There are no more handlers so finish with the fallback service (\`env.ASSETS.fetch\` in Pages' case)
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t} else {
\t\t\t\t// There was not fallback service so actually make the request to the origin.
\t\t\t\tconst response = await fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t}
\t\t};

\t\ttry {
\t\t\treturn await next();
\t\t} catch (error) {
\t\t\tif (isFailOpen && env[__FALLBACK_SERVICE__]) {
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);`;

/** After esbuild, __FALLBACK_SERVICE__ becomes "ASSETS"; drop redundant string guard. */
const PAGES_TEMPLATE_REDUNDANT_GUARD = `\t\t\t} else if (__FALLBACK_SERVICE__ && env[__FALLBACK_SERVICE__]) {
\t\t\t\t// There are no more handlers so finish with the fallback service (\`env.ASSETS.fetch\` in Pages' case)
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t} else {
\t\t\t\t// There was not fallback service so actually make the request to the origin.
\t\t\t\tconst response = await fetch(request);
\t\t\t\treturn cloneResponse(response);
\t\t\t}
\t\t};

\t\ttry {
\t\t\treturn await next();
\t\t} catch (error) {
\t\t\tif (isFailOpen && __FALLBACK_SERVICE__ && env[__FALLBACK_SERVICE__]) {
\t\t\t\tconst response = await env[__FALLBACK_SERVICE__].fetch(request);`;

const CLI_MIDDLEWARE_INJECT =
  '\t\t\t\tconst MIDDLEWARE_TEST_INJECT = "__INJECT_FOR_TESTING_WRANGLER_MIDDLEWARE__";\n';

function patchFile(path, { marker, content, replace, skipIfMissing }) {
  if (!existsSync(path)) {
    console.warn(`patch-wrangler-templates: skip missing ${path}`);
    return false;
  }

  const current = readFileSync(path, "utf8");
  if (skipIfMissing && !current.includes(skipIfMissing)) {
    return false;
  }
  if (marker && current.includes(marker)) {
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

if (
  patchFile(PAGES_TEMPLATE, {
    marker: "} else if (env[__FALLBACK_SERVICE__]) {",
    replace: (source) => {
      if (source.includes(PAGES_TEMPLATE_OLD)) {
        return source.replace(PAGES_TEMPLATE_OLD, PAGES_TEMPLATE_NEW);
      }
      if (source.includes(PAGES_TEMPLATE_REDUNDANT_GUARD)) {
        return source.replace(PAGES_TEMPLATE_REDUNDANT_GUARD, PAGES_TEMPLATE_NEW);
      }
      return source;
    },
  })
) {
  patched += 1;
  console.log("patch-wrangler-templates: patched pages-template-worker.ts");
}

if (
  patchFile(WRANGLER_CLI, {
    skipIfMissing: CLI_MIDDLEWARE_INJECT.trim(),
    replace: (source) => source.replace(CLI_MIDDLEWARE_INJECT, ""),
  })
) {
  patched += 1;
  console.log("patch-wrangler-templates: removed MIDDLEWARE_TEST_INJECT from cli.js");
}

if (patched === 0) {
  console.log("patch-wrangler-templates: templates already patched");
}
