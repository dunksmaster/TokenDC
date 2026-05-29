"""Remove studio backgrounds from affiliate product PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "img"
FILES = ("tangem-wallet.png", "ledger-flex.png", "deeper-network-vpn.png")

BLACK_THRESHOLD = 30
FLOOD_TOLERANCE = 32
CHROMA_MAX = 25
def key_near_black(im: Image.Image, threshold: int) -> None:
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 1:
                continue
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (r, g, b, 0)


def flood_neutral_background(im: Image.Image, tolerance: int) -> int:
    px = im.load()
    w, h = im.size
    removed = 0
    visited: set[tuple[int, int]] = set()
    q: deque[tuple[int, int, tuple[int, int, int]]] = deque()

    for y in range(h):
        for x in range(w):
            if px[x, y][3] >= 10:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < w and 0 <= ny < h) or px[nx, ny][3] < 10:
                    continue
                if (nx, ny) in visited:
                    continue
                visited.add((nx, ny))
                r, g, b, _ = px[nx, ny]
                q.append((nx, ny, (r, g, b)))

    while q:
        x, y, ref = q.popleft()
        r, g, b, a = px[x, y]
        if a < 10:
            continue
        if max(abs(r - ref[0]), abs(g - ref[1]), abs(b - ref[2])) > tolerance:
            continue
        if max(r, g, b) - min(r, g, b) > CHROMA_MAX:
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


def feather_alpha_edges(im: Image.Image) -> None:
    """Slight alpha blur to soften cutout edges."""
    r, g, b, a = im.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=0.6))
    im.paste(Image.merge("RGBA", (r, g, b, a)))


def process(path: Path) -> dict:
    im = Image.open(path).convert("RGBA")
    key_near_black(im, BLACK_THRESHOLD)
    removed = flood_neutral_background(im, FLOOD_TOLERANCE)
    feather_alpha_edges(im)
    im.save(path, format="PNG", optimize=True)
    w, h = im.size
    opaque = sum(1 for y in range(h) for x in range(w) if im.getpixel((x, y))[3] > 128)
    return {"removed": removed, "opaque_pct": round(100 * opaque / (w * h), 1)}


def main() -> None:
    for name in FILES:
        path = IMG_DIR / name
        stats = process(path)
        print(f"{name}: flood-removed {stats['removed']} px, opaque {stats['opaque_pct']}%")


if __name__ == "__main__":
    main()
