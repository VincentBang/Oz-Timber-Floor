import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
if (!process.argv.includes("--apply")) throw new Error("Use --apply to perform the bounded OZ-MIG-004 repair.");
const dataPath = path.join(root, "data/product-catalogue.json");
const catalogue = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const colours = [
  "Forest Oak", "Frosty Snap", "Golden Bloom", "Liberty Grey", "Maple Falls", "Nubuck",
  "Nutshell", "Polar Fleece", "Autumn Leaves", "Summer Haze", "Winter Frost", "Spring Moon",
];
const slugs = colours.map((colour) => `hardwood-collection-${colour.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
const sourceUrl = "https://preferencefloors.com.au/brand/hardwood-flooring-hardwood-collection/";
const supplierFacts = {
  thickness: "14/3 mm",
  boardSize: "190 × 1900 mm (nested shorts)",
  packSizeM2: "2.166",
  installationMethod: "Tongue-and-groove; direct-fix or floating installation",
};

let sanitized = 0;
for (const record of [...(catalogue.ranges || []), ...(catalogue.products || [])]) {
  if (/(?:%\s*){2,}/.test(String(record.name || ""))) {
    record.name = record.name.replace(/\s*-?\s*(?:%\s*){2,}\s*$/, "").trim();
    if (record.colour) record.colour = String(record.colour).replace(/\s*-?\s*(?:%\s*){2,}\s*$/, "").trim();
    sanitized += 1;
  }
  if (/(?:AC[1-9]|Pack(?: Qty| Size)?|Length|Width|Brand|colou?rs?|Thickness:\s*$)/i.test(String(record.thickness || ""))) {
    record.thickness = "";
    sanitized += 1;
  }
  if (/(?:Download\s+){2,}|Download (?:Warranty|Brochure|See more|Installation)/i.test(String(record.installationMethod || ""))) {
    record.installationMethod = "";
    sanitized += 1;
  }
  if (String(record.packSizeM2 || "").includes("2.155220.5.2")) {
    record.packSizeM2 = "";
    sanitized += 1;
  }
}

const range = catalogue.ranges.find((item) => item.slug === "hardwood-collection");
if (!range) throw new Error("Hardwood Collection range record not found");
Object.assign(range, supplierFacts, {
  colourCount: 12,
  productSlugs: slugs,
  products: slugs,
  sourceUrl,
  supplierSourceUrl: sourceUrl,
  dataCompletenessStatus: "supplier-brochure-verified-2026-09-09",
  lastCatalogueReview: "2026-09-09",
  catalogueNote: "Twelve-colour set and range dimensions verified against the current supplier page and Summer 2025 brochure on 2026-09-09. Stock remains subject to confirmation.",
});

for (let index = 0; index < slugs.length; index += 1) {
  const slug = slugs[index];
  const product = catalogue.products.find((item) => String(item.slug || item.id || "").replace(/^\/?products\//, "").replace(/\/$/, "") === slug);
  if (!product) throw new Error(`Verified Hardwood Collection product missing: ${slug}`);
  Object.assign(product, supplierFacts, {
    name: `Hardwood Collection ${colours[index]}`,
    colour: colours[index],
    range: "Hardwood Collection",
    rangeSlug: "hardwood-collection",
    category: "Engineered timber",
    sourceUrl,
    supplierSourceUrl: sourceUrl,
    dataCompletenessStatus: "supplier-brochure-verified-2026-09-09",
  });
}

fs.writeFileSync(dataPath, `${JSON.stringify(catalogue, null, 2)}\n`);

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "docs"].includes(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.html?$/.test(entry.name)) htmlFiles.push(target);
  }
}
walk(root);

let htmlChanged = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html.replace(/\s*-\s*% % % %/g, "");
  html = html.replace(/<div class="spec-item"><span>Thickness<\/span><strong>[^<]*Pack Qty: 1\.698m[^<]*<\/strong><\/div>/gi, "");
  html = html.replace(/<div class="spec-item"><span>[^<]*<\/span><strong>[^<]*(?:Download Warranty Download Brochure|Oakleaf HD PLUS Laminate Downl)[^<]*<\/strong><\/div>/gi, "");
  html = html.replace(/<span class="pill">[^<]*Pack Qty: 1\.698m[^<]*<\/span>/gi, "");
  html = html.replace(/<span>[^<]*Pack Qty: 1\.698m[^<]*<\/span>/gi, "");
  if (html !== before) {
    fs.writeFileSync(file, html);
    htmlChanged += 1;
  }
}

const verifiedSpecHtml = `<div class="spec-item"><span>Thickness</span><strong>${supplierFacts.thickness}</strong></div><div class="spec-item"><span>Board size</span><strong>${supplierFacts.boardSize}</strong></div><div class="spec-item"><span>Installation method</span><strong>${supplierFacts.installationMethod}</strong></div>`;
for (const slug of slugs) {
  const file = path.join(root, "products", slug, "index.html");
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<div class="spec-item"><span>Thickness<\/span><strong>[^<]*<\/strong><\/div>/gi, "");
  html = html.replace(/<div class="spec-item"><span>Board size<\/span><strong>[^<]*<\/strong><\/div>/gi, "");
  html = html.replace(/<div class="spec-item"><span>Installation method<\/span><strong>[^<]*<\/strong><\/div>/gi, "");
  html = html.replace(/(<div class="spec-item"><span>Category<\/span><strong>Engineered timber<\/strong><\/div>)/i, `$1${verifiedSpecHtml}`);
  fs.writeFileSync(file, html);
}

console.log(`CATALOGUE FIELD REPAIR applied hardwoodColours=12 sanitizedFields=${sanitized} htmlFiles=${htmlChanged}`);
