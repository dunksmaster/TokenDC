const STORAGE_KEY = "duacrypto-theme";

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore — private mode, disabled storage, etc. */
  }
}

export function getStoredTheme() {
  const stored = safeGetItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function syncThemeToggleUi(theme) {
  const isDark = theme === "dark";

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );

    const icon = button.querySelector("[data-theme-icon]");
    if (icon) {
      icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    }
  });
}

function syncBitcoinTimelineImages(isDark) {
  document.querySelectorAll(".bitcoin-timeline-img").forEach((img) => {
    const lightSrc =
      img.getAttribute("data-timeline-light") ||
      "/img/bitcoin-price-timeline-light.svg";
    const darkSrc =
      img.getAttribute("data-timeline-dark") ||
      "/img/bitcoin-price-timeline-dark.svg";
    img.src = isDark ? darkSrc : lightSrc;
  });
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-bs-theme", isDark ? "dark" : "light");
  root.style.colorScheme = isDark ? "dark" : "light";
  syncThemeToggleUi(theme);
  syncBitcoinTimelineImages(isDark);

  if (typeof window !== "undefined") {
    window.__DUACRYPTO_THEME__ = { early: false, theme };
  }
}

export function setTheme(theme) {
  safeSetItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const next = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  setTheme(next);
}

export function initTheme() {
  const early = window.__DUACRYPTO_THEME__?.early;
  const theme = window.__DUACRYPTO_THEME__?.theme ?? getPreferredTheme();

  if (early) {
    syncThemeToggleUi(theme);
    syncBitcoinTimelineImages(theme === "dark");
  } else {
    applyTheme(theme);
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (!getStoredTheme()) {
        applyTheme(event.matches ? "dark" : "light");
      }
    });
}
