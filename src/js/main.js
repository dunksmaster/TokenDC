import "../css/input.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initCounters } from "./counter.js";
import { initAccordion } from "./accordion.js";
import { initBrandCards } from "./brand-cards.js";
import { initAffiliates } from "./affiliates.js";
import { initContactPage } from "./contact.js";
import { initBackToTop } from "./page-shell.js";
import "./webmcp.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initCounters();
  initAccordion("faq-accordion");
  initAccordion("newsletter-faq-accordion");
  initBrandCards();
  initAffiliates();
  initContactPage();
  initBackToTop();
});
