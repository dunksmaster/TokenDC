export function initDonationPage() {
  const progressBar = document.querySelector(".progress-bar");
  if (!progressBar) return;
  setTimeout(() => {
    progressBar.style.width = "2.4%";
  }, 500);
}
