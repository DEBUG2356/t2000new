// Removes replacement photos (by file name) and remembers their Commons titles so they are not fetched again.
// Usage: node scripts/commons-prune.mjs p14-2 p28-3 ...
import fs from "node:fs";
import path from "node:path";
const CREDITS = path.resolve("src/data/credits.json");
const EXCL = path.resolve("scripts/commons-excluded.txt");
const credits = JSON.parse(fs.readFileSync(CREDITS, "utf8"));
const excluded = fs.existsSync(EXCL) ? fs.readFileSync(EXCL, "utf8").split("\n").filter(Boolean) : [];
for (const name of process.argv.slice(2)) {
  const key = name.replace(/-\d+$/, "");
  const file = `/media/${name}.webp`;
  const list = credits[key] || [];
  const hit = list.find((c) => c.file === file);
  if (!hit) { console.log("not found", name); continue; }
  credits[key] = list.filter((c) => c !== hit);
  excluded.push(hit.title);
  fs.rmSync(path.resolve("public" + file), { force: true });
  console.log("removed", name, "-", hit.title);
}
fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 1));
fs.writeFileSync(EXCL, [...new Set(excluded)].join("\n") + "\n");
