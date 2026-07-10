export function initContactPage() {
  const email = "partner@duacrypto.com";
  const revealBtn = document.getElementById("contact-reveal-btn");
  const panel = document.getElementById("contact-email-panel");
  const copyBtn = document.getElementById("contact-copy-btn");
  const feedback = document.getElementById("contact-copy-feedback");

  if (revealBtn && panel) {
    revealBtn.addEventListener("click", () => {
      revealBtn.classList.add("hidden");
      panel.classList.remove("hidden");
    });
  }

  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      if (feedback) {
        feedback.classList.remove("hidden");
        setTimeout(() => feedback.classList.add("hidden"), 2000);
      }
    } catch {
      window.prompt("Copy this email:", email);
    }
  });
}
