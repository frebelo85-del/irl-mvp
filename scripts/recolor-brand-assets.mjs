/**
 * Regenerate Alica brand PNGs from the glyph source (A shape).
 * Run: npm run brand:assets
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "../assets/images");
const SOURCE_NAME = "_brand-glyph-source.png";
const SOURCE_PATH = path.join(ASSETS_DIR, SOURCE_NAME);
const FOREGROUND_PATH = path.join(ASSETS_DIR, "android-icon-foreground.png");

const PRIMARY = "#FFA652";
const PRIMARY_STRONG = "#E07A1A";
const PRIMARY_MUTED = "#FFF4E8";

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function ensureSource() {
  if (!existsSync(SOURCE_PATH)) {
    copyFileSync(FOREGROUND_PATH, SOURCE_PATH);
    console.log(`Saved glyph source → ${SOURCE_NAME}`);
  }
}

async function loadMask(sourcePath, size) {
  const { data, info } = await sharp(sourcePath)
    .resize(size, size, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const mask = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = data[i * channels + 3];
    const intensity = Math.max(r, g, b) / 255;
    mask[i] = intensity * (a / 255);
  }

  return { mask, width, height };
}

async function renderGlyphPng(size) {
  const { mask, width, height } = await loadMask(SOURCE_PATH, size);
  const top = hexToRgb(PRIMARY);
  const bottom = hexToRgb(PRIMARY_STRONG);
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const t = y / Math.max(height - 1, 1);
    const r = Math.round(top.r + (bottom.r - top.r) * t);
    const g = Math.round(top.g + (bottom.g - top.g) * t);
    const b = Math.round(top.b + (bottom.b - top.b) * t);
    for (let x = 0; x < width; x++) {
      const m = mask[y * width + x];
      const idx = (y * width + x) * 4;
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = Math.round(m * 255);
    }
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png();
}

async function solidBackground(size, hex) {
  const bg = hexToRgb(hex);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  }).png();
}

async function compositeOnBackground(glyphSharp, size, bgHex) {
  const bg = await solidBackground(size, bgHex);
  const glyph = await glyphSharp.toBuffer();
  return bg.composite([{ input: glyph, blend: "over" }]).png();
}

async function writeMonochrome(size) {
  const { mask, width, height } = await loadMask(SOURCE_PATH, size);
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const m = mask[i];
    const idx = i * 4;
    const v = Math.round(m * 255);
    out[idx] = v;
    out[idx + 1] = v;
    out[idx + 2] = v;
    out[idx + 3] = Math.round(m * 255);
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-monochrome.png"));
}

async function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });
  ensureSource();

  const glyph1024 = await renderGlyphPng(1024);
  const glyph512 = await renderGlyphPng(512);
  const glyph48 = await renderGlyphPng(48);

  await glyph1024
    .clone()
    .toFile(path.join(ASSETS_DIR, "android-icon-foreground.png"));

  await glyph1024.clone().toFile(path.join(ASSETS_DIR, "splash-icon.png"));

  await (await compositeOnBackground(glyph1024.clone(), 1024, PRIMARY_MUTED)).toFile(
    path.join(ASSETS_DIR, "icon.png"),
  );

  await (await solidBackground(1024, PRIMARY_MUTED)).toFile(
    path.join(ASSETS_DIR, "android-icon-background.png"),
  );

  await writeMonochrome(432);

  await (await compositeOnBackground(glyph48, 48, PRIMARY_MUTED)).toFile(
    path.join(ASSETS_DIR, "favicon.png"),
  );

  console.log("Brand assets written to assets/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
