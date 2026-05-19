import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { agentDiscoveryPlugin } from "./vite-plugins/agent-discovery.js";

/** Ensure robots.txt and sitemap.xml land in dist/ after every build. */
function ensureDiscoveryFilesPlugin() {
  const root = import.meta.dirname;
  const copies = [
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
  plugins: [tailwindcss(), agentDiscoveryPlugin(), ensureDiscoveryFilesPlugin()],
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
      },
    },
  },
});
