// Task 6 — swap logo assets to the corrected "Nimberly's Daycare" artwork.
import sharp from "sharp";

const SRC =
  "/home/z/my-project/upload/PixVerse_Image_Effect_prompt_Faça apenas um aj-Photoroom.png";
const PUB = "/home/z/my-project/public/images";

const logoBuf = await sharp(SRC)
  .resize(620, 620, { fit: "inside" })
  .png()
  .toBuffer();

// 1) Full logo (rainbow + house + "Nimberly's Daycare" wordmark), web-optimized PNG
await sharp(SRC)
  .resize(760, 760, { fit: "inside" })
  .png({ palette: true, compressionLevel: 9, effort: 10, quality: 90 })
  .toFile(`${PUB}/logo.png`);

// 2) OG image 1200x630 — cream bg + centered logo
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#FFF9F1" },
})
  .composite([{ input: logoBuf, gravity: "centre" }])
  .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
  .toFile(`${PUB}/og-image.jpg`);

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#FFF9F1" },
})
  .composite([{ input: logoBuf, gravity: "centre" }])
  .webp({ quality: 88 })
  .toFile(`${PUB}/og-image.webp`);

console.log("logo + og regenerated");
