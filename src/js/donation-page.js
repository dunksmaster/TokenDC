import "../css/input.css";
import "../css/donation-page.css";
import { initTheme } from "./theme.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = "2.4%";
    }, 500);
  }
});
