import "../css/input.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initCounters } from "./counter.js";
import { initAccordion } from "./accordion.js";
import { initBrandCards } from "./brand-cards.js";
import { initAffiliates } from "./affiliates.js";
import { initContact } from "./contact.js";
import { initRoadmapCarousel } from "./roadmap.js";
import { initAboutPage } from "./about.js";
import { initEventsPage } from "./events-page.js";
import { initDonationPage } from "./donation-page.js";
import "./webmcp.js";

function initBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  window.addEventListener("scroll", () => {
    button.classList.toggle("show", window.scrollY > 300);
  });

  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initCounters();
  initAccordion("faq-accordion");
  initBrandCards();
  initAffiliates();
  initContact();
  initRoadmapCarousel();
  initAboutPage();
  initEventsPage();
  initDonationPage();
  initBackToTop();
});
