import "../css/input.css";
import "../css/contact-page.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initBackToTop } from "./page-shell.js";
import { initContactPage } from "./contact.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initBackToTop();
  initContactPage();
});
