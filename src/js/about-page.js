import "../css/input.css";
import "../css/about-page.css";
import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initBackToTop } from "./page-shell.js";

function initProfileUpload() {
  const input = document.getElementById("upload-input");
  const img = document.getElementById("profile-img");
  if (!input || !img) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  });
}

function initCryptoBanner() {
  const container = document.getElementById("crypto-icons");
  const banner = document.querySelector(".crypto-banner");
  if (!container) return;

  const icons = [
    "fab fa-bitcoin",
    "fab fa-ethereum",
    "fas fa-coins",
    "fas fa-dollar-sign",
    "fas fa-chart-line",
    "fas fa-wallet",
    "fas fa-gem",
  ];

  for (let i = 0; i < 20; i++) {
    const icon = document.createElement("i");
    icon.className = `${icons[Math.floor(Math.random() * icons.length)]} crypto-icon`;
    icon.style.left = `${Math.random() * 100}%`;
    icon.style.top = `${Math.random() * 100}%`;
    icon.style.animationDelay = `${Math.random() * 5}s`;
    icon.style.animationDuration = `${15 + Math.random() * 10}s`;
    container.appendChild(icon);
  }

  if (!banner) return;

  banner.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    container.querySelectorAll(".crypto-icon").forEach((el) => {
      const speed = 10;
      el.style.transform = `translate(${(x - 0.5) * speed}px, ${(y - 0.5) * speed}px)`;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initBackToTop();
  initProfileUpload();
  initCryptoBanner();
});
