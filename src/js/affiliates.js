import { affiliateGroups, affiliateJoinHref } from "./affiliates-data.js";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

function isExternal(href) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function createPartnerCard(item, index) {
  const link = document.createElement("a");
  link.href = item.href;
  link.className = "affiliate-card affiliate-reveal";
  link.style.setProperty("--reveal-delay", `${index * 60}ms`);

  if (isExternal(item.href)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  const stage = document.createElement("div");
  stage.className = "affiliate-product-stage affiliate-product-stage--compact";

  const img = document.createElement("img");
  img.src = item.img;
  img.alt = item.alt ?? item.name;
  img.className = "affiliate-product-img affiliate-product-img--compact";
  img.loading = "lazy";
  if (item.kind === "logo") {
    img.classList.add("affiliate-product-img--logo");
  }

  stage.appendChild(img);

  const label = document.createElement("p");
  label.className = "affiliate-product-label affiliate-product-label--compact";
  label.textContent = item.name;

  link.append(stage, label);
  return link;
}

function createOpenSlotCard(index) {
  const link = document.createElement("a");
  link.href = affiliateJoinHref;
  link.className =
    "affiliate-card affiliate-card--open affiliate-reveal affiliate-join-card";
  link.style.setProperty("--reveal-delay", `${index * 60}ms`);
  link.setAttribute("aria-label", "Join us as a partner — get in touch");

  const stage = document.createElement("div");
  stage.className =
    "affiliate-product-stage affiliate-product-stage--compact affiliate-join-stage";

  const icon = document.createElement("span");
  icon.className = "affiliate-join-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = '<i class="fa fa-plus"></i>';

  stage.appendChild(icon);

  const label = document.createElement("p");
  label.className = "affiliate-product-label affiliate-product-label--compact";
  label.textContent = "Join us as a partner";

  const sub = document.createElement("p");
  sub.className = "affiliate-product-sublabel affiliate-product-sublabel--compact";
  sub.textContent = "Want your brand here? Join us.";

  link.append(stage, label, sub);
  return link;
}

function gridClassForGroup(group) {
  return group.gridClass ?? "affiliate-grid";
}

function renderGroups(container) {
  container.replaceChildren();

  let cardIndex = 0;

  for (const group of affiliateGroups) {
    const section = document.createElement("div");
    section.className = "affiliate-group mb-6";
    section.dataset.affiliateGroup = group.id;

    const title = document.createElement("h3");
    title.className = "affiliate-group-title";
    title.textContent = group.title;

    const grid = document.createElement("div");
    grid.className = gridClassForGroup(group);

    for (const item of group.items) {
      grid.appendChild(createPartnerCard(item, cardIndex));
      cardIndex += 1;
    }

    const openCount = group.openSlots ?? 0;
    for (let i = 0; i < openCount; i += 1) {
      grid.appendChild(createOpenSlotCard(cardIndex));
      cardIndex += 1;
    }

    section.append(title, grid);
    container.appendChild(section);
  }
}

function initReveal(container) {
  const cards = container.querySelectorAll(".affiliate-reveal");
  if (!cards.length) return;

  if (REDUCED_MOTION.matches) {
    cards.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  cards.forEach((el) => observer.observe(el));
}

function initTilt(container) {
  if (REDUCED_MOTION.matches) return;

  const cards = container.querySelectorAll(".affiliate-card:not(.affiliate-card--open)");

  for (const card of cards) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  }
}

export function initAffiliates() {
  const container = document.getElementById("affiliates-groups");
  if (!container) return;

  renderGroups(container);
  initReveal(container);
  initTilt(container);
}
