import "../css/input.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initCounters } from "./counter.js";
import { initAccordion } from "./accordion.js";
import { initBrandCards } from "./brand-cards.js";
import "./webmcp.js";

function initSpinner() {
  const spinner = document.getElementById("spinner");
  if (!spinner) return;

  window.setTimeout(() => {
    spinner.classList.add("opacity-0", "invisible");
  }, 300);
}

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
  initSpinner();
  initNav();
  initCounters();
  initAccordion("faq-accordion");
  initBrandCards();
  initBackToTop();
});
