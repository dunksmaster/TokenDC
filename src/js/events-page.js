import "../css/input.css";
import "../css/events-page.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initBackToTop } from "./page-shell.js";
import { initEventsSupporters, initEventCards } from "./events-supporters.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initBackToTop();
  initEventsSupporters();
  initEventCards();
});
