"""Generate WebP hero images for faster LCP. Run: python scripts/optimize-hero-images.py"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "img"
HERO_PNGS = ("hero-albania-blockchain.png", "hero-2.png")


def main() -> None:
    for name in HERO_PNGS:
        src = IMG_DIR / name
        if not src.exists():
            print(f"skip missing {name}")
            continue
        dst = IMG_DIR / name.replace(".png", ".webp")
        im = Image.open(src).convert("RGB")
        im.save(dst, "WEBP", quality=82, method=6)
        print(f"{name}: {src.stat().st_size} -> {dst.stat().st_size} bytes")


if __name__ == "__main__":
    main()
