const PAGES = [
  { name: "home", path: "/", title: "Home" },
  { name: "about", path: "/about.html", title: "About" },
  { name: "service", path: "/service.html", title: "Service" },
  { name: "roadmap", path: "/roadmap.html", title: "Roadmap" },
  { name: "events", path: "/events.html", title: "Events" },
  { name: "faq", path: "/faq.html", title: "FAQs" },
  { name: "contact", path: "/contact.html", title: "Contact" },
];

function getModelContext() {
  return navigator.modelContext ?? navigator.modelContextExperimental;
}

export function initWebMcp() {
  const modelContext = getModelContext();
  if (!modelContext?.registerTool) return;

  const controllers = [];

  controllers.push(
    modelContext.registerTool({
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
    })
  );

  controllers.push(
    modelContext.registerTool({
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
    })
  );

  controllers.push(
    modelContext.registerTool({
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
    })
  );

  controllers.push(
    modelContext.registerTool({
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
    })
  );

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
