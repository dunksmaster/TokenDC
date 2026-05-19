/**
 * Early theme apply (blocking script in <head>) — prevents flash before paint.
 * Bundled/copied to /theme-init.js. theme-bootstrap.js reads __DUACRYPTO_THEME__.early
 * and skips re-applying root classes.
 */
(function () {
  try {
    var stored = localStorage.getItem("duacrypto-theme");
    var theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    var root = document.documentElement;
    var isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-bs-theme", theme);
    root.style.colorScheme = theme;
    window.__DUACRYPTO_THEME__ = { early: true, theme: theme };
  } catch (e) {
    /* ignore */
  }
})();
