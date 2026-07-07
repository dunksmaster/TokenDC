const EMAIL = "partner@duacrypto.com";

export function initContact() {
  const revealBtn = document.getElementById("contact-reveal-btn");
  const panel = document.getElementById("contact-email-panel");
  const copyBtn = document.getElementById("contact-copy-btn");
  const feedback = document.getElementById("contact-copy-feedback");

  if (!revealBtn || !panel) return;

  revealBtn.addEventListener("click", () => {
    revealBtn.classList.add("hidden");
    panel.classList.remove("hidden");
  });

  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      if (feedback) {
        feedback.classList.remove("hidden");
        setTimeout(() => feedback.classList.add("hidden"), 2000);
      }
    } catch {
      window.prompt("Copy this email:", EMAIL);
    }
  });
}
