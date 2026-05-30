"""Prepare affiliate product PNGs for the homepage grid.

User-supplied product shots: remove only the studio background connected to
image borders. Never flood neutral grays across the full frame.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "img"
FILES = ("tangem-wallet.png", "ledger-flex.png", "deeper-network-vpn.png")

NEAR_BLACK = 32
NEAR_WHITE = 238
CHROMA_MAX = 28
FLOOD_TOLERANCE = 40


def flood_from_edges(im: Image.Image, *, light: bool, tolerance: int) -> int:
    px = im.load()
    w, h = im.size
    removed = 0
    visited: set[tuple[int, int]] = set()
    q: deque[tuple[int, int, tuple[int, int, int]]] = deque()

    def seed(x: int, y: int) -> None:
        if not (0 <= x < w and 0 <= y < h) or (x, y) in visited:
            return
        r, g, b, a = px[x, y]
        if a < 10:
            return
        visited.add((x, y))
        q.append((x, y, (r, g, b)))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while q:
        x, y, ref = q.popleft()
        r, g, b, a = px[x, y]
        if a < 10:
            continue
        if max(abs(r - ref[0]), abs(g - ref[1]), abs(b - ref[2])) > tolerance:
            continue
        if max(r, g, b) - min(r, g, b) > CHROMA_MAX:
            continue
        if light:
            if min(r, g, b) < NEAR_WHITE:
                continue
        else:
            if max(r, g, b) > NEAR_BLACK:
                continue
        px[x, y] = (r, g, b, 0)
        removed += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h) or (nx, ny) in visited:
                continue
            if px[nx, ny][3] < 10:
                continue
            visited.add((nx, ny))
            q.append((nx, ny, ref))

    return removed


def stats(im: Image.Image, removed: int) -> dict:
    w, h = im.size
    opaque = sum(1 for y in range(h) for x in range(w) if im.getpixel((x, y))[3] > 128)
    return {"removed": removed, "opaque_pct": round(100 * opaque / (w * h), 1)}


def process(name: str) -> dict:
    path = IMG_DIR / name
    im = Image.open(path).convert("RGBA")
    # Black studio shots: tangem + deeper. Ledger uses a light mat.
    light_bg = name == "ledger-flex.png"
    removed = flood_from_edges(im, light=light_bg, tolerance=FLOOD_TOLERANCE)
    im.save(path, format="PNG", optimize=True)
    return stats(im, removed)


def main() -> None:
    for name in FILES:
        info = process(name)
        print(f"{name}: flood-removed {info['removed']} px, opaque {info['opaque_pct']}%")


if __name__ == "__main__":
    main()
