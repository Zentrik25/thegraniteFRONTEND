/**
 * Generates all required icon sizes from the SVG logo source.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
// Use PNG source if you've dropped your logo at public/icons/logo-source.png,
// otherwise falls back to the SVG recreation.
import { existsSync } from "fs";
const pngSrc = resolve(root, "public/icons/logo-source.png");
const svgSrc = resolve(root, "public/icons/logo-source.svg");
const src = existsSync(pngSrc) ? pngSrc : svgSrc;
const svgBuf = readFileSync(src);

mkdirSync(resolve(root, "public/icons"), { recursive: true });
mkdirSync(resolve(root, "src/app"), { recursive: true });

const sizes = [
  // Web app manifest icons
  { size: 192, out: resolve(root, "public/icons/icon-192.png") },
  { size: 512, out: resolve(root, "public/icons/icon-512.png") },
  // Apple touch icon (goes in src/app for Next.js auto-wiring)
  { size: 180, out: resolve(root, "src/app/apple-icon.png") },
  // OG fallback square (used as site icon in some social platforms)
  { size: 512, out: resolve(root, "public/icons/og-square.png") },
];

for (const { size, out } of sizes) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`✓ ${out.replace(root, ".")}`);
}

// favicon.ico — 32×32 embedded in ICO format (sharp writes PNG, Next.js serves it fine)
await sharp(svgBuf)
  .resize(32, 32)
  .png()
  .toFile(resolve(root, "public/favicon-32.png"));

// Next.js App Router picks up src/app/icon.png as the site icon
await sharp(svgBuf)
  .resize(512, 512)
  .png()
  .toFile(resolve(root, "src/app/icon.png"));

console.log("✓ ./src/app/icon.png");
console.log("✓ ./public/favicon-32.png");
console.log("All icons generated.");
