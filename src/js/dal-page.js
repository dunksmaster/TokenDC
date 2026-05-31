import "../css/dal-page.css";
import { DAL_CONFIG } from "./dal-config.js";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function showFallbackOnly(container) {
  if (!container) return;
  const fallback = container.querySelector(".dal-fallback");
  const canvas = container.querySelector("canvas");
  if (canvas) canvas.classList.add("dal-hidden");
  if (fallback) fallback.classList.remove("dal-hidden");
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initReveal() {
  const els = document.querySelectorAll(".dal-reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

let threeModulePromise = null;

function loadThreeModule() {
  if (!threeModulePromise) {
    threeModulePromise = import("./dal-three.js");
  }
  return threeModulePromise;
}

function lazyInitVisual(container, initMethod, { eager = false } = {}) {
  if (!container) return;

  if (prefersReducedMotion() || isMobileViewport()) {
    showFallbackOnly(container);
    return;
  }

  let started = false;

  const start = () => {
    if (started) return;
    started = true;
    io.disconnect();
    loadThreeModule().then((mod) => {
      mod[initMethod](container);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) start();
    },
    { rootMargin: "120px", threshold: 0.01 }
  );

  io.observe(container);

  if (eager) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(start, { timeout: 2000 });
    } else {
      setTimeout(start, 800);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initReveal();

  document.querySelectorAll(".dal-founding-label").forEach((el) => {
    el.textContent = DAL_CONFIG.foundingMembersLabel;
  });

  lazyInitVisual(document.getElementById("hero-visual"), "initHeroNetwork", { eager: true });
  lazyInitVisual(document.getElementById("about-visual"), "initAboutCube");
});
