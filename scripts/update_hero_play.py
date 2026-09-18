#!/usr/bin/env python3
"""Swap hero image (best-framing PixVerse (2)) and PlayActivities photo (PixVerse h),
plus add PixVerse (1) as a new gallery photo. Generates crop candidates for review."""
from PIL import Image
import os

UP = "/home/z/my-project/upload"
GAL = "/home/z/my-project/public/images/gallery"

def save(im, path, max_dim=2000, q=82):
    w, h = im.size
    scale = max_dim / max(w, h)
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)
    print(f"saved {os.path.basename(path)} -> {im.size[0]}x{im.size[1]}")

# ---- 1) HERO: PixVerse (2) — 3712x4608 (0.806 ~ 4/5) native fit, no crop needed
im2 = Image.open(os.path.join(UP, "PixVerse_Image_Effect_prompt_Crie uma imagem h (2).webp")).convert("RGB")
save(im2, os.path.join(GAL, "hero-classroom.webp"))

# ---- 2) PLAY SECTION: PixVerse h — 4096x4096 square -> crop to 5/4 (1.25)
# target height = 4096 / 1.25 = 3277px. Two candidates with different offsets.
imh = Image.open(os.path.join(UP, "PixVerse_Image_Effect_prompt_Crie uma imagem h.webp")).convert("RGB")
W, H = imh.size            # 4096x4096
TH = round(W / 1.25)       # 3277

# Candidate A: top-biased (keeps the HAPPY DAYCARE banner, trims shoes)
a = imh.crop((0, 80, W, 80 + TH))
save(a, os.path.join(GAL, "_cand_A.webp"))

# Candidate B: center crop (cuts banner top + shoes evenly)
b = imh.crop((0, (H - TH) // 2, W, (H - TH) // 2 + TH))
save(b, os.path.join(GAL, "_cand_B.webp"))

# ---- 3) NEW GALLERY PHOTO: PixVerse (1) — 4800x3584 landscape
im1 = Image.open(os.path.join(UP, "PixVerse_Image_Effect_prompt_Crie uma imagem h (1).webp")).convert("RGB")
save(im1, os.path.join(GAL, "photo-group-rug.webp"))

print("done")
