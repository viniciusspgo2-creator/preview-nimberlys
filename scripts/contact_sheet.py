"""Contact sheet of new images for content-based mapping."""
import os
from PIL import Image, ImageDraw, ImageFont

SRC = "/home/z/my-project/new_images"
OUT = "/home/z/my-project/scripts/contact_sheet.jpg"

files = sorted(f for f in os.listdir(SRC) if f.endswith(".webp"))
COLS, THUMB = 4, (420, 300)
PAD, LABEL_H = 8, 34

rows = (len(files) + COLS - 1) // COLS
W = COLS * (THUMB[0] + PAD) + PAD
H = rows * (THUMB[1] + LABEL_H + PAD) + PAD
sheet = Image.new("RGB", (W, H), "white")

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
except Exception:
    font = ImageFont.load_default()
draw = ImageDraw.Draw(sheet)

for i, f in enumerate(files):
    r, c = divmod(i, COLS)
    x = PAD + c * (THUMB[0] + PAD)
    y = PAD + r * (THUMB[1] + LABEL_H + PAD)
    im = Image.open(os.path.join(SRC, f)).convert("RGB")
    im.thumbnail(THUMB)
    sheet.paste(im, (x + (THUMB[0] - im.size[0]) // 2, y + (THUMB[1] - im.size[1]) // 2))
    name = f.replace(".webp", "")
    short = f"[{i}] " + (name if len(name) <= 44 else name[:41] + "...")
    draw.rectangle([x, y + THUMB[1], x + THUMB[0], y + THUMB[1] + LABEL_H], fill="black")
    draw.text((x + 4, y + THUMB[1] + 8), short, fill="white", font=font)

sheet.save(OUT, quality=85)
print("saved", OUT, sheet.size)
for i, f in enumerate(files):
    print(i, f)
