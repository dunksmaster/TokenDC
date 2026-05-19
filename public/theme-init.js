(function () {
  try {
    var stored = localStorage.getItem("duacrypto-theme");
    var dark =
      stored === "dark" ||
      (stored !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.setAttribute("data-bs-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-bs-theme", "light");
    }
    root.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {
    /* ignore */
  }
})();
