from PIL import Image

root = r"C:\Users\GigaByte\Downloads\TokenDC"
assets = r"C:\Users\GigaByte\.cursor\projects\c-Users-GigaByte-Downloads-TokenDC\assets"
grid_path = (
    assets
    + r"\c__Users_GigaByte_AppData_Roaming_Cursor_User_workspaceStorage_fb2756b30f9018bfafb4444c8eded860_images_Twitter-Konsensus-Network-ba3e8220-ea74-466c-8fc2-7e4c5f9330d0.png"
)

grid = Image.open(grid_path).convert("RGB")
w, h = grid.size
books_w = int(w * 0.82)
book_w = books_w // 5
book_h = h // 2
pad_x = int(book_w * 0.06)
pad_y = int(book_h * 0.04)
book = grid.crop((pad_x, pad_y, book_w - pad_x, book_h - pad_y))
book.save(root + r"\img\donation-book-featured.png", optimize=True)
print("book", book.size)

qr = Image.open(root + r"\img\donation-lightning-qr-only.png").convert("RGBA")
pixels = qr.load()
min_x, min_y, max_x, max_y = qr.size[0], qr.size[1], 0, 0
for y in range(qr.size[1]):
    for x in range(qr.size[0]):
        r, g, b, a = pixels[x, y]
        if r + g + b > 40:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
qr_c = qr.crop((min_x, min_y, max_x + 1, max_y + 1))
white = Image.new("RGBA", qr_c.size, (255, 255, 255, 255))
out = Image.alpha_composite(white, qr_c).convert("RGB")
out.save(root + r"\img\donation-lightning-qr-only.png", optimize=True)
print("qr", out.size)
