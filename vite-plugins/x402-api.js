import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSiteApiApp } from "../lib/x402-site-api.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function devFetchAsset(pathname) {
  const filePath = join(root, "public", pathname);
  if (!existsSync(filePath)) return null;
  const body = readFileSync(filePath, "utf8");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function previewFetchAsset(pathname) {
  const filePath = join(root, "dist", pathname.slice(1));
  if (!existsSync(filePath)) return null;
  const body = readFileSync(filePath, "utf8");
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

const app = createSiteApiApp({
  fetchAsset: (pathname) => Promise.resolve(devFetchAsset(pathname)),
});

async function sendFetchResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } else {
    res.end();
  }
}

export function x402ApiPlugin() {
  return {
    name: "x402-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "/";
        if (!pathname.startsWith("/api/")) return next();
        if (req.method !== "GET" && req.method !== "HEAD") return next();

        const url = `http://${req.headers.host ?? "localhost:5173"}${req.url ?? pathname}`;
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value === undefined) continue;
          if (Array.isArray(value)) {
            for (const item of value) headers.append(key, item);
          } else {
            headers.set(key, value);
          }
        }

        const request = new Request(url, { method: req.method, headers });
        const response = await app.fetch(request, process.env);
        await sendFetchResponse(res, response);
      });
    },
    configurePreviewServer(server) {
      const previewApp = createSiteApiApp({
        fetchAsset: (pathname) => Promise.resolve(previewFetchAsset(pathname)),
      });

      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "/";
        if (!pathname.startsWith("/api/")) return next();
        if (req.method !== "GET" && req.method !== "HEAD") return next();

        const url = `http://${req.headers.host ?? "localhost:4173"}${req.url ?? pathname}`;
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value === undefined) continue;
          if (Array.isArray(value)) {
            for (const item of value) headers.append(key, item);
          } else {
            headers.set(key, value);
          }
        }

        const request = new Request(url, { method: req.method, headers });
        const response = await previewApp.fetch(request, process.env);
        await sendFetchResponse(res, response);
      });
    },
  };
}
