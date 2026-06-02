/**
 * Play Store feature graphic (1024×500).
 * Run: npm run brand:feature-graphic
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "../assets/images");
const STORE_DIR = path.join(__dirname, "../store/android");
const GLYPH = path.join(ASSETS_DIR, "android-icon-foreground.png");

const PRIMARY_MUTED = "#FFF4E8";
const TEXT = "#111827";
const SUBTEXT = "#6b7280";

function ensureGlyph() {
  if (!existsSync(GLYPH)) {
    console.error("Run npm run brand:assets first.");
    process.exit(1);
  }
}

async function main() {
  mkdirSync(STORE_DIR, { recursive: true });
  ensureGlyph();

  const glyphSize = 200;
  const glyph = await sharp(GLYPH)
    .resize(glyphSize, glyphSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svg = `
<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="500" fill="${PRIMARY_MUTED}"/>
  <text x="512" y="280" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="${TEXT}">Alica</text>
  <text x="512" y="340" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="${SUBTEXT}">Do new things in real life.</text>
</svg>`;

  const textLayer = await sharp(Buffer.from(svg)).png().toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: PRIMARY_MUTED,
    },
  })
    .composite([
      { input: glyph, top: 48, left: Math.round((1024 - glyphSize) / 2) },
      { input: textLayer, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(STORE_DIR, "feature-graphic.png"));

  console.log("Feature graphic → store/android/feature-graphic.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
