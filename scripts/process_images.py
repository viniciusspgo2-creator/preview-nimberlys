"""
Replace ALL site images with the new photos from the user's RAR files.

Mapping (slot filename kept so every reference in the code keeps working):
  - hero-classroom.webp   <- "COLOQUE ESSA FOTO NA SESSÃO HERO....webp" (attached)
                            pre-cropped 4/5 to fit the hero arch perfectly
  - photo-group-room.webp <- "foto da hero.webp" (RAR) -> Welcome front photo,
                            kept at its native wide ratio (frame becomes 16/9 -> zero crop)
  - 14 other slots        <- content-matched new photos, resized to max 2000px
  - photo-group-circle.webp (new file) <- group circle photo, used on the gallery page
"""
import os
from PIL import Image

SRC = "/home/z/my-project/new_images"
ATTACHED = "/home/z/my-project/upload/COLOQUE ESSA FOTO NA SESSÃO HERO NO LUGAR DA ATUAL.webp"
DST = "/home/z/my-project/public/images/gallery"

os.makedirs(DST, exist_ok=True)

# resize to max width, quality
def save(im, name, max_w=2000, q=82):
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    im.save(os.path.join(DST, name), "WEBP", quality=q, method=6)
    out = os.path.getsize(os.path.join(DST, name)) / 1024
    print(f"  -> {name}: {im.size[0]}x{im.size[1]} {out:.0f} KB")

def load(name):
    return Image.open(os.path.join(SRC, name)).convert("RGB")

# 1. HERO — attached photo, pre-crop to 4/5 (arch frame) centered on the
#    laughing girl in the middle (she sits at the horizontal center).
im = Image.open(ATTACHED).convert("RGB")
w, h = im.size                      # 1568x882
cw = round(h * 4 / 5)               # 706
x0 = (w - cw) // 2                  # centered crop
im = im.crop((x0, 0, x0 + cw, h))
save(im, "hero-classroom.webp", max_w=1600, q=84)

# 2. WELCOME front — "foto da hero" group photo, native 1.9:1 kept (frame 16/9)
save(load("foto da hero.webp"), "photo-group-room.webp", max_w=2400, q=84)

# 3. All other slots — content-matched
MAPPING = {
    "child-with-curly-hair-holding-green-cup-indoors-2026-03-09-23-15-31-utc.webp": "photo-baby-play.webp",
    "young-child-plays-with-colorful-toy-blocks-2026-03-16-01-21-12-utc.webp": "photo-boy-blocks.webp",
    "freepik_18411576.webp": "photo-boy-learning.webp",
    "child-playing-with-toy-train-with-adult-nearby-2026-03-25-01-07-17-utc.webp": "photo-boy-truck.webp",
    "young-children-sitting-on-floor-playing-with-toy-2026-01-05-22-53-37-utc.webp": "photo-fall-friends.webp",
    "girls-with-book-colorful-toys.webp": "photo-girl-draw.webp",
    "three-smiling-children-posing-together-on-yellow-b-2026-03-24-08-54-36-utc.webp": "photo-girl-smile.webp",
    "freepik_268856768 (1).webp": "photo-girl-stack.webp",
    "vitaly-gariev-x-00mKy9DdI-unsplash.webp": "photo-girl-table.webp",
    "enthusiastic-children-laughing-together-sitting-on-2026-01-05-22-42-03-utc.webp": "photo-group-smiles.webp",
    "pexels-pavel-danilyuk-8422255.webp": "photo-kids-craft.webp",
    "happy-young-girl-smiling-while-playing-in-a-colorf-2026-07-29-21-13-59-utc.webp": "photo-kids-play.webp",
    "enkuu-smile-uD7ZRjhgwLo-unsplash.webp": "photo-toddler-fun.webp",
    "little-kid-enjoying-daycare-with-caregiver.webp": "photo-toddler-joy.webp",
    "group-primary-schoolers-lying-ground-smiling.webp": "photo-group-circle.webp",
}
for src_name, dst_name in MAPPING.items():
    save(load(src_name), dst_name)

print("\nDone. Files in gallery:")
for f in sorted(os.listdir(DST)):
    kb = os.path.getsize(os.path.join(DST, f)) / 1024
    print(f"  {f} ({kb:.0f} KB)")
