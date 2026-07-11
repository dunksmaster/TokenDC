import "../css/input.css";
import "../css/donation-page.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initBackToTop } from "./page-shell.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initBackToTop();

  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = "2.4%";
    }, 500);
  }
});
