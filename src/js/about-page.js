import "../css/input.css";
import "../css/about-page.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initBackToTop } from "./page-shell.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initBackToTop();
});
