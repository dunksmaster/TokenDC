const brandColors = {
  Cexio: {
    background: "#12151a",
    text: "#ffffff",
    accent: "#1db6a4",
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

    if (card.classList.contains("brand-card--logo")) {
      card.style.background = colors?.background ?? "#12151a";
      card.style.color = colors?.text ?? "#ffffff";
      const accent = card.querySelector("[data-brand-accent]");
      if (accent) accent.style.color = colors?.accent ?? "#00f0ff";
      return;
    }

    card.style.background = colors.background;
    card.style.color = colors.text;

    const accent = card.querySelector("[data-brand-accent]");
    if (accent) accent.style.color = colors.accent;
  });
}
