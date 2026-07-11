export function initContactPage() {
  const email = "info@duacrypto.com";
  const copyBtn = document.getElementById("contact-copy-btn");
  const feedback = document.getElementById("contact-copy-feedback");

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
