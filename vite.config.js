import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { agentDiscoveryPlugin } from "./vite-plugins/agent-discovery.js";
import { copyLegacyStaticPlugin } from "./vite-plugins/copy-legacy-static.js";
import { htmlIncludesPlugin } from "./vite-plugins/html-includes.js";

/** Ensure robots.txt and sitemap.xml land in dist/ after every build. */
function ensureDiscoveryFilesPlugin() {
  const root = import.meta.dirname;
  const copies = [
    ["public/robots.txt", "dist/robots.txt"],
    ["public/sitemap.xml", "dist/sitemap.xml"],
    ["public/site.webmanifest", "dist/site.webmanifest"],
    ["public/_redirects", "dist/_redirects"],
    ["public/_headers", "dist/_headers"],
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
    htmlIncludesPlugin(),
    agentDiscoveryPlugin(),
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
        "bitcoin-for-corporations": "bitcoin-for-corporations.html",
        faq: "faq.html",
        contact: "contact.html",
        donation: "donation.html",
        privacy: "privacy.html",
        terms: "terms.html",
        "$10": "$10.html",
        "404": "404.html",
      },
    },
  },
});
