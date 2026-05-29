const FORMAT = (n) => n.toLocaleString("en-US");

function animateTo(el, target, onComplete) {
  const duration = 2000;
  const step = target / (duration / 10);
  let count = 0;

  const timer = setInterval(() => {
    count += step;
    if (count >= target) {
      el.textContent = FORMAT(target);
      clearInterval(timer);
      onComplete?.();
    } else {
      el.textContent = FORMAT(Math.floor(count));
    }
  }, 10);
}

function withVisibilityInterval(callback, intervalMs) {
  let timerId = null;

  const start = () => {
    if (timerId) return;
    timerId = setInterval(callback, intervalMs);
  };

  const stop = () => {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  if (!document.hidden) start();

  return { start, stop };
}

function initStaticCounter(counter) {
  const target = Number(counter.dataset.counter);
  if (Number.isNaN(target)) return;
  animateTo(counter, target);
}

function initLoopCounter(counter) {
  const min = Number(counter.dataset.counterMin ?? counter.dataset.counter);
  const max = Number(counter.dataset.counterMax);
  const step = Number(counter.dataset.counterStep ?? 1);
  const intervalMs = Number(counter.dataset.counterInterval ?? 20000);

  if ([min, max, step, intervalMs].some(Number.isNaN)) return;

  let value = min;

  animateTo(counter, min, () => {
    withVisibilityInterval(() => {
      value += step;
      if (value > max) value = min;
      counter.textContent = FORMAT(value);
    }, intervalMs);
  });
}

function initDonationCounter(counter) {
  const min = Number(counter.dataset.counterMin ?? counter.dataset.counter);
  const max = Number(counter.dataset.counterMax);
  const intervalMs = Number(counter.dataset.counterInterval ?? 60000);
  const steps = (counter.dataset.counterRandomSteps ?? "10,20,50")
    .split(",")
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);

  if ([min, max, intervalMs].some(Number.isNaN) || steps.length === 0) return;

  let value = min;

  animateTo(counter, min, () => {
    withVisibilityInterval(() => {
      const bump = steps[Math.floor(Math.random() * steps.length)];
      value = Math.min(value + bump, max);
      counter.textContent = FORMAT(value);
      if (value >= max) value = min;
    }, intervalMs);
  });
}

export function initCounters() {
  document.querySelectorAll("[data-counter]").forEach((counter) => {
    switch (counter.dataset.counterType) {
      case "loop":
        initLoopCounter(counter);
        break;
      case "donation":
        initDonationCounter(counter);
        break;
      default:
        initStaticCounter(counter);
    }
  });
}
