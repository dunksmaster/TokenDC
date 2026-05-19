export function initAccordion(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;

  root.querySelectorAll("[data-accordion-btn]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";

      root.querySelectorAll("[data-accordion-btn]").forEach((otherBtn) => {
        otherBtn.setAttribute("aria-expanded", "false");
        otherBtn.classList.remove("accordion-btn-open");
        otherBtn.nextElementSibling?.classList.add("hidden");
      });

      if (!isOpen) {
        button.setAttribute("aria-expanded", "true");
        button.classList.add("accordion-btn-open");
        panel?.classList.remove("hidden");
      }
    });
  });
}
