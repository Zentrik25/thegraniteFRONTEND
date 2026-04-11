/**
 * Builds a valid favicon.ico (ICO container with 16×16 and 32×32 PNG frames)
 * without any extra dependencies — just Node.js built-ins + sharp.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgBuf = readFileSync(resolve(root, "public/icons/logo-source.svg"));

// Generate 16×16 and 32×32 PNG buffers
const png16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();
const png32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();

// Build ICO file manually
// ICO header: RESERVED(2) + TYPE(2)=1 + COUNT(2)
// Each dir entry: width(1) height(1) colorCount(1) reserved(1) planes(2) bitCount(2) bytesInRes(4) imageOffset(4)
const images = [png16, png32];
const sizes = [16, 32];
const headerSize = 6;
const dirEntrySize = 16;
const dirSize = headerSize + images.length * dirEntrySize;

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);      // reserved
header.writeUInt16LE(1, 2);      // type: ICO
header.writeUInt16LE(images.length, 4); // count

let offset = dirSize;
const dirEntries = images.map((img, i) => {
  const entry = Buffer.alloc(dirEntrySize);
  const sz = sizes[i] === 256 ? 0 : sizes[i]; // 256 encoded as 0
  entry.writeUInt8(sz, 0);        // width
  entry.writeUInt8(sz, 1);        // height
  entry.writeUInt8(0, 2);         // color count (0 = no palette)
  entry.writeUInt8(0, 3);         // reserved
  entry.writeUInt16LE(1, 4);      // planes
  entry.writeUInt16LE(32, 6);     // bit count
  entry.writeUInt32LE(img.length, 8);  // bytes in resource
  entry.writeUInt32LE(offset, 12);     // offset to image data
  offset += img.length;
  return entry;
});

const ico = Buffer.concat([header, ...dirEntries, ...images]);

const outPath = resolve(root, "src/app/favicon.ico");
writeFileSync(outPath, ico);
console.log(`✓ favicon.ico (${ico.length} bytes) → src/app/favicon.ico`);
