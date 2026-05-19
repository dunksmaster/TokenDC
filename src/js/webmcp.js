const PAGES = [
  { name: "home", path: "/", title: "Home" },
  { name: "about", path: "/about.html", title: "About" },
  { name: "service", path: "/service.html", title: "Service" },
  { name: "roadmap", path: "/roadmap.html", title: "Roadmap" },
  { name: "events", path: "/events.html", title: "Events" },
  { name: "feature", path: "/feature.html", title: "Feature" },
  { name: "token", path: "/token.html", title: "Token Sale" },
  { name: "faq", path: "/faq.html", title: "FAQs" },
  { name: "contact", path: "/contact.html", title: "Contact" },
  { name: "donation", path: "/donation.html", title: "Donation" },
];

function getModelContext() {
  return navigator.modelContext ?? navigator.modelContextExperimental;
}

function buildTools() {
  return [
    {
      name: "list_site_pages",
      description: "List public DuaCrypto site pages with titles and paths.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        return { pages: PAGES };
      },
    },
    {
      name: "navigate_to_page",
      description: "Open a DuaCrypto site page in the browser.",
      inputSchema: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: PAGES.map((p) => p.name),
            description: "Page identifier",
          },
        },
        required: ["page"],
        additionalProperties: false,
      },
      async execute({ page }) {
        const target = PAGES.find((p) => p.name === page);
        if (!target) throw new Error(`Unknown page: ${page}`);
        window.location.assign(target.path);
        return { navigatedTo: target.path, title: target.title };
      },
    },
    {
      name: "get_telegram_community",
      description: "Return the DuaCrypto Telegram community URL.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        return { url: "https://t.me/dua_crypto", label: "DuaCrypto Telegram" };
      },
    },
    {
      name: "get_bitcoin_event_photos",
      description: "Return the Alltuu album URL for Bitcoin event photos.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        return {
          url: "https://m.alltuu.com/album/2426655506/3122420006?menu=live",
          label: "Bitcoin event photos",
        };
      },
    },
    {
      name: "get_api_catalog",
      description: "Return URLs for the DuaCrypto API catalog, OpenAPI spec, and health endpoint.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        return {
          apiCatalog: "/.well-known/api-catalog",
          openapi: "/openapi/site-api.yaml",
          docs: "/docs/api",
          health: "/api/v1/site/health",
        };
      },
    },
  ];
}

export function initWebMcp() {
  const modelContext = getModelContext();
  if (!modelContext) return;

  const tools = buildTools();
  const controllers = [];

  if (typeof modelContext.provideContext === "function") {
    const controller = modelContext.provideContext({ tools });
    if (controller) controllers.push(controller);
  } else if (typeof modelContext.registerTool === "function") {
    for (const tool of tools) {
      controllers.push(modelContext.registerTool(tool));
    }
  } else {
    return;
  }

  window.addEventListener(
    "pagehide",
    () => {
      for (const controller of controllers) {
        controller?.unregister?.();
      }
    },
    { once: true }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWebMcp);
} else {
  initWebMcp();
}
