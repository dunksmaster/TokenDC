export function initCounters() {
  document.querySelectorAll("[data-counter]").forEach((counter) => {
    const target = Number(counter.dataset.counter);
    if (Number.isNaN(target)) return;

    const duration = 2000;
    const step = target / (duration / 10);
    let count = 0;

    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        counter.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(count).toLocaleString();
      }
    }, 10);
  });
}
