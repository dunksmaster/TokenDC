import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { agentDiscoveryPlugin } from "./vite-plugins/agent-discovery.js";

export default defineConfig({
  plugins: [tailwindcss(), agentDiscoveryPlugin()],
  server: {
    port: 5173,
    open: true,
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
