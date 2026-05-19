import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import {
  agentDiscoveryPlugin,
  copyMarkdownToDistPlugin,
} from "./vite-plugins/agent-discovery.js";
import { copyLegacyStaticPlugin } from "./vite-plugins/copy-legacy-static.js";
import { x402ApiPlugin } from "./vite-plugins/x402-api.js";

/** Ensure robots.txt and sitemap.xml land in dist/ after every build. */
function ensureDiscoveryFilesPlugin() {
  const root = import.meta.dirname;
  const copies = [
    ["public/_headers", "dist/_headers"],
    ["public/robots.txt", "dist/robots.txt"],
    ["public/sitemap.xml", "dist/sitemap.xml"],
    ["public/css/dark-mode.css", "dist/css/dark-mode.css"],
  ];
  return {
    name: "ensure-discovery-files",
    closeBundle() {
      for (const [src, dest] of copies) {
        const from = join(root, src);
        const to = join(root, dest);
        if (existsSync(from)) copyFileSync(from, to);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    x402ApiPlugin(),
    agentDiscoveryPlugin(),
    copyMarkdownToDistPlugin(),
    copyLegacyStaticPlugin(),
    ensureDiscoveryFilesPlugin(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    open: "/index.html",
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        about: "about.html",
        service: "service.html",
        roadmap: "roadmap.html",
        events: "events.html",
        feature: "feature.html",
        token: "token.html",
        faq: "faq.html",
        contact: "contact.html",
        donation: "donation.html",
        "$10": "$10.html",
        "404": "404.html",
      },
    },
  },
});
