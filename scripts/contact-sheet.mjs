import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const dir = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const files = fs.readdirSync(dir).filter((f) => /\.(webp|jpe?g|png)$/.test(f) && (!filter || filter.test(f))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const W = 240, H = 160, cols = 6, rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(path.join(dir, f)).resize(W, H - 22, { fit: "cover" }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="22"><rect width="100%" height="100%" fill="#222"/><text x="4" y="15" font-size="13" fill="#fff" font-family="Arial">${f}</text></svg>`);
  return [{ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H }, { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H + H - 22 }];
}));
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#fff" } }).composite(tiles.flat()).jpeg({ quality: 70 }).toFile(out);
console.log(files.length, "images");
