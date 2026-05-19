const DESKTOP_BREAKPOINT = 1024;

function isDesktopViewport() {
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const dropdownBtn = document.getElementById("nav-dropdown-btn");
  const dropdownMenu = document.getElementById("nav-dropdown-menu");
  const navbar = document.getElementById("navbar");

  function syncNavForBreakpoint() {
    if (menu) {
      if (isDesktopViewport()) {
        menu.classList.remove("hidden");
        toggle?.setAttribute("aria-expanded", "false");
      } else if (toggle?.getAttribute("aria-expanded") !== "true") {
        menu.classList.add("hidden");
      }
    }

    if (dropdownMenu && isDesktopViewport()) {
      dropdownMenu.classList.remove("is-open");
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("hidden");
    });
  }

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", (e) => {
      if (!isDesktopViewport()) {
        e.preventDefault();
        dropdownMenu.classList.toggle("is-open");
      }
    });
  }

  window.addEventListener("resize", syncNavForBreakpoint);
  syncNavForBreakpoint();

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("shadow-md", window.scrollY > 8);
    });
  }
}
