/** Responsive srcset helpers for events gallery images. */

export const GALLERY_WIDTHS = [480, 800, 1200];

export const GALLERY_SIZES = "(max-width: 768px) 50vw, 33vw";

export const GALLERY_IMAGE_BASES = [
  "balkans-crypto-2026-1",
  "balkans-crypto-2026-2",
  "balkans-crypto-2026-3",
  "bitcoin-pizza-day-1",
  "bitcoin-pizza-day-2",
  "bitcoin-pizza-day-3",
  "balkans-crypto-2025-1",
  "balkans-crypto-2025-2",
  "balkans-crypto-2025-3",
  "as-seen-on-abc-news",
  "as-seen-on-eko",
  "as-seen-on-top-channel",
];

export function isGalleryImage(filename) {
  const base = filename.toLowerCase();
  return (
    base.includes("balkans-crypto") ||
    base.includes("bitcoin-pizza") ||
    base.includes("as-seen-on")
  );
}

export function galleryWebpSrcset(base) {
  return GALLERY_WIDTHS.map((w) => `/img/${base}-${w}w.webp ${w}w`).join(", ");
}

export function responsiveVariantName(base, width) {
  return `${base}-${width}w.webp`;
}
