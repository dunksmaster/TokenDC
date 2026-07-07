export function initRoadmapCarousel() {
  const root = document.querySelector("[data-roadmap-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-roadmap-track]");
  const prev = root.querySelector("[data-roadmap-prev]");
  const next = root.querySelector("[data-roadmap-next]");
  if (!track || !prev || !next) return;

  const scrollStep = () => {
    const item = track.querySelector(".roadmap-item");
    if (!item) return track.clientWidth;
    const gap = 25;
    return item.getBoundingClientRect().width + gap;
  };

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });
}
