const CRYPTO_ICONS = [
  "fab fa-bitcoin",
  "fab fa-ethereum",
  "fas fa-coins",
  "fas fa-dollar-sign",
  "fas fa-chart-line",
  "fas fa-wallet",
  "fas fa-gem",
];

export function initAboutPage() {
  const uploadInput = document.getElementById("upload-input");
  const profileImg = document.getElementById("profile-img");

  uploadInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file || !profileImg) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      profileImg.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  });

  const cryptoIconsContainer = document.getElementById("crypto-icons");
  if (!cryptoIconsContainer) return;

  for (let i = 0; i < 20; i++) {
    const icon = document.createElement("i");
    icon.className =
      CRYPTO_ICONS[Math.floor(Math.random() * CRYPTO_ICONS.length)] +
      " crypto-icon";
    icon.style.left = `${Math.random() * 100}%`;
    icon.style.top = `${Math.random() * 100}%`;
    icon.style.animationDelay = `${Math.random() * 5}s`;
    icon.style.animationDuration = `${15 + Math.random() * 10}s`;
    cryptoIconsContainer.appendChild(icon);
  }

  const banner = document.querySelector(".crypto-banner");
  banner?.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    document.querySelectorAll(".crypto-icon").forEach((el) => {
      const speed = 10;
      el.style.transform = `translate(${(x - 0.5) * speed}px, ${(y - 0.5) * speed}px)`;
    });
  });
}
