import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogue = JSON.parse(fs.readFileSync(path.join(root, "data/product-catalogue.json"), "utf8"));
const failures = [];
const badDownloadText = /(?:Download\s+){2,}|Download (?:Warranty|Brochure|See more|Installation)/i;
const badThickness = /(?:AC[1-9]|Pack(?: Qty| Size)?|Length|Width|Brand|colou?rs?|Thickness:\s*$)/i;
const badName = /(?:%\s*){2,}/;

function inspect(record, type) {
  const key = record.slug || record.id || record.url || record.name || "unknown";
  if (badName.test(String(record.name || ""))) failures.push(`${type}:${key}: malformed name`);
  if (badDownloadText.test(String(record.installationMethod || ""))) failures.push(`${type}:${key}: download/navigation text in installation method`);
  if (badThickness.test(String(record.thickness || ""))) failures.push(`${type}:${key}: mixed value in thickness`);
  if (String(record.packSizeM2 || "").includes("2.155220.5.2")) failures.push(`${type}:${key}: concatenated pack coverage`);
}

// Negative and known-good fixtures keep the check independent from the repaired output.
assert.equal(badThickness.test("12mm, AC4, Pack Qty: 1.698m², Thickness:"), true);
assert.equal(badThickness.test("14/3 mm"), false);
assert.equal(badDownloadText.test("Download Warranty Download Brochure"), true);
assert.equal(badDownloadText.test("Tongue-and-groove; direct-fix or floating installation"), false);

for (const range of catalogue.ranges || []) inspect(range, "range");
for (const product of catalogue.products || []) inspect(product, "product");

const expectedColours = [
  "forest-oak", "frosty-snap", "golden-bloom", "liberty-grey", "maple-falls", "nubuck",
  "nutshell", "polar-fleece", "autumn-leaves", "summer-haze", "winter-frost", "spring-moon",
].map((colour) => `hardwood-collection-${colour}`);
const hardwood = (catalogue.ranges || []).find((range) => range.slug === "hardwood-collection");
if (!hardwood) failures.push("range:hardwood-collection: missing");
else {
  assert.equal(hardwood.colourCount, 12, "Hardwood Collection must declare 12 supplier-listed colours");
  assert.deepEqual((hardwood.productSlugs || []).map((value) => String(value).replace(/^\/?products\//, "").replace(/\/$/, "")), expectedColours);
  assert.equal(hardwood.thickness, "14/3 mm");
  assert.equal(hardwood.boardSize, "190 × 1900 mm (nested shorts)");
}

const rangeHtml = fs.readFileSync(path.join(root, "ranges/hardwood-collection/index.html"), "utf8");
if (/Thickness:\s*<\/[^>]+>\s*<[^>]+>188 colours|(?:%\s*){2,}|Oakleaf HD PLUS|Pack Qty: 1\.698/i.test(rangeHtml)) {
  failures.push("ranges/hardwood-collection/index.html: reproduced malformed presentation remains");
}
if (!/>12 colours</.test(rangeHtml) || !/>14\/3 mm</.test(rangeHtml)) {
  failures.push("ranges/hardwood-collection/index.html: verified range facts missing");
}

const htmlFindings = [];
function walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "docs"].includes(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(target);
    else if (/\.html?$/.test(entry.name)) {
      const html = fs.readFileSync(target, "utf8");
      if (/(?:%\s*){2,}|Pack Qty: 1\.698m|2\.155220\.5\.2|Oakleaf HD PLUS Laminate Downl|Download Warranty Download Brochure/i.test(html)) {
        htmlFindings.push(path.relative(root, target));
      }
    }
  }
}
walkHtml(root);
if (htmlFindings.length) failures.push(`rendered HTML retains malformed field text: ${htmlFindings.slice(0, 10).join(", ")}`);

if (failures.length) {
  console.error(`CATALOGUE FIELD INTEGRITY FAIL findings=${failures.length}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`CATALOGUE FIELD INTEGRITY PASS ranges=${catalogue.ranges.length} products=${catalogue.products.length} hardwoodColours=12`);
}
