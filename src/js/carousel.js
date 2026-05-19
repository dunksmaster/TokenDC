export function initCarousel(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;

  const slides = [...root.querySelectorAll("[data-slide]")];
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  let index = slides.findIndex((slide) => slide.classList.contains("active"));

  if (index < 0) index = 0;

  const show = (nextIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("hidden", i !== nextIndex);
      slide.classList.toggle("active", i === nextIndex);
    });
    index = nextIndex;
  };

  prev?.addEventListener("click", () => {
    show((index - 1 + slides.length) % slides.length);
  });

  next?.addEventListener("click", () => {
    show((index + 1) % slides.length);
  });

  setInterval(() => {
    show((index + 1) % slides.length);
  }, 3000);
}
