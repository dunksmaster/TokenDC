/** Responsive srcset helpers for homepage hero image. */

export const HERO_WIDTHS = [480, 800, 1024];

export const HERO_SIZES = "(max-width: 768px) 100vw, 512px";

export const HERO_IMAGE_BASE = "hero-albania-blockchain";

export function isHeroImage(filename) {
  const base = basename(filename).toLowerCase();
  return base.includes("hero-albania");
}

function basename(name) {
  const i = name.lastIndexOf("/");
  return i >= 0 ? name.slice(i + 1) : name;
}

export function heroWebpSrcset(base = HERO_IMAGE_BASE) {
  return HERO_WIDTHS.map((w) => `/img/${base}-${w}w.webp ${w}w`).join(", ");
}

export function responsiveVariantName(base, width) {
  return `${base}-${width}w.webp`;
}
