const brandColors = {
  Tangem: {
    background: "linear-gradient(135deg, #1293E6, #1F8FE0)",
    text: "#F0F0F0",
    accent: "#1F1F1F",
  },
  Bitget: {
    background: "linear-gradient(135deg, #00F0FF, #00CFFF)",
    text: "#0c0e12",
    accent: "#0c0e12",
  },
  Binance: {
    background: "linear-gradient(135deg, #f0b90b, #e0a600)",
    text: "#0c0e12",
    accent: "#0c0e12",
  },
};

export function initBrandCards() {
  document.querySelectorAll("[data-brand]").forEach((card) => {
    const brand = card.dataset.brand;
    const colors = brandColors[brand];
    if (!colors) return;

    card.style.background = colors.background;
    card.style.color = colors.text;

    const accent = card.querySelector("[data-brand-accent]");
    if (accent) accent.style.color = colors.accent;
  });
}
