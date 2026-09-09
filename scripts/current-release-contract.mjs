import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const reportPath = path.join(root, "docs/seo-migration/OZ-MIG-004/RELEASE_CONTRACT_REPORT.json");
const startingHead = "d0c66b802e544aa1a807f91798ea284c31c0998b";
const failures = [];

function git(args, options = {}) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
}

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function atStart(file) {
  try { return git(["show", `${startingHead}:${file}`]); }
  catch { return null; }
}

function current(file) {
  const target = path.join(root, file);
  return fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
}

function one(html, regex) {
  return (html.match(regex)?.[1] || "").replace(/\s+/g, " ").trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3]) : "";
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attribute(tag, "href")).sort();
}

function jsonLdValues(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attribute(`<script ${match[1]}>`, "type") === "application/ld+json")
    .map((match) => JSON.parse(match[2]));
}

function htmlContract(html) {
  const jsonLd = jsonLdValues(html).map((value) => JSON.stringify(value));
  const tags = [...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(([tag]) => tag);
  const canonicals = tags.filter((tag) => attribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  const robots = tags.filter((tag) => attribute(tag, "name").toLowerCase() === "robots");
  const forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(([form]) => form);
  return {
    title: one(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: one(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || one(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i),
    canonical: one(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i),
    robots: one(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i),
    h1: one(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]*>/g, ""),
    titleCount: [...html.matchAll(/<title\b/gi)].length,
    descriptionCount: tags.filter((tag) => attribute(tag, "name").toLowerCase() === "description").length,
    h1Count: [...html.matchAll(/<h1\b/gi)].length,
    jsonLdHash: sha(jsonLd.join("\n")),
    internalHrefsHash: sha(JSON.stringify(hrefs(html))),
    formName: one(html, /<form[^>]+name=["']([^"']*)/i),
    formAction: one(html, /<form[^>]+action=["']([^"']*)/i),
    canonicalTagsHash: sha(JSON.stringify(canonicals)),
    robotsTagsHash: sha(JSON.stringify(robots)),
    formCount: [...html.matchAll(/<form\b/gi)].length,
    formsHash: sha(JSON.stringify(forms)),
  };
}

const protectedFiles = [
  "_headers", "_redirects", "netlify.toml", "robots.txt", "sitemap.xml",
  "assets/contact-config.js", "data/catalogue-quality-overrides.json",
  "data/seo-keyword-ownership.json", "data/seo-migration-redirect-expectations.json",
  "migration/redirect-map.csv", "contact/index.html", "privacy/index.html", "terms/index.html",
];

const protectedFileResults = protectedFiles.map((file) => {
  const before = atStart(file);
  const after = current(file);
  const unchanged = before !== null && after !== null && before === after;
  if (!unchanged) failures.push(`unapproved protected-file drift: ${file}`);
  return { file, beforeSha256: before === null ? null : sha(before), afterSha256: after === null ? null : sha(after), unchanged };
});

const changedFiles = [...new Set([
  ...git(["diff", "--name-only", startingHead, "--"]).trim().split("\n").filter(Boolean),
  ...git(["ls-files", "--others", "--exclude-standard"]).trim().split("\n").filter(Boolean),
])].sort();
const changedHtml = changedFiles.filter((file) => file.endsWith(".html"));
const allowedMalformedIdentityPages = new Set([
  "products/hardwood-collection-herringbone-beacon-cove/index.html",
  "products/hardwood-collection-herringbone-golden-sands/index.html",
  "products/hardwood-collection-herringbone-pebble-reef/index.html",
  "products/hardwood-collection-herringbone-san-remo/index.html",
  "products/hardwood-collection-herringbone-shore-break/index.html",
]);
const oldAssetGuidePages = new Set([
  "guides/choosing-office-flooring-durability-design-performance/index.html",
  "guides/commercial-timber-flooring-high-traffic-spaces-sydney/index.html",
  "guides/commercial-timber-flooring-specialist-sydney-builders-designers/index.html",
  "guides/guide-to-choosing-the-right-vinyl-timber-flooring/index.html",
  "guides/professional-commercial-flooring-installation-what-to-expect/index.html",
]);
const verifiedHardwoodColours = [
  "Forest Oak", "Frosty Snap", "Golden Bloom", "Liberty Grey", "Maple Falls", "Nubuck",
  "Nutshell", "Polar Fleece", "Autumn Leaves", "Summer Haze", "Winter Frost", "Spring Moon",
];
const colourSlug = (colour) => `hardwood-collection-${colour.toLowerCase().replace(/ /g, "-")}`;
const verifiedHardwoodPages = new Set(verifiedHardwoodColours.map((colour) => `products/${colourSlug(colour)}/index.html`));
const malformedPresentation = /(?:%\s*){2,}|Pack Qty: 1\.698m|2\.155220\.5\.2|Oakleaf HD PLUS Laminate Downl|Download Warranty Download Brochure/i;
const protectedFields = Object.keys(htmlContract(""));
const immutableFields = ["canonical", "robots", "canonicalTagsHash", "robotsTagsHash", "formName", "formAction", "formCount", "formsHash"];
const htmlResults = [];

function expectedRangeContract(beforeText) {
  const expected = htmlContract(beforeText);
  const schema = jsonLdValues(beforeText);
  // Retain the original breadcrumb URLs; pin only the reviewed FAQ replacement.
  schema[0][1].mainEntity = [
    ["Can Oz Timber Floor supply Hardwood Collection without installation?", "Yes. Send a supply-only enquiry with the preferred colour, quantity and suburb so stock, batch and lead time can be checked."],
    ["Can Hardwood Collection be quoted with installation?", "Yes. Include your suburb, approximate area, current floor and access details so preparation and installation scope can be reviewed."],
    ["Should I choose a colour before checking stock?", "You can shortlist colours first, but current stock, batch and product details should be confirmed before final ordering."],
  ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }));

  const rangeEnquiry = (enquiry, extra = {}) => `/contact/?${new URLSearchParams({ enquiry, ...extra, range: "Hardwood Collection", category: "Engineered timber", source: "/ranges/hardwood-collection/" }).toString().replace(/&/g, "&amp;")}`;
  const expectedHrefs = hrefs(beforeText).filter((href) => !href.startsWith("/products/hardwood-collection-") && !href.includes("productSlug=hardwood-collection-"));
  // Explicit non-catalogue link deltas from the scoped range regeneration.
  for (const removed of [
    rangeEnquiry("supply-install"), rangeEnquiry("supply-install"), "#range-support",
    rangeEnquiry("product-info"), rangeEnquiry("service", { topic: "preparation" }),
    "/ranges/fiddleback/", "/ranges/prestige-oak/", "/ranges/pronto/", "/ranges/select-australian-timber/",
  ]) {
    const index = expectedHrefs.indexOf(removed);
    if (index < 0) throw new Error(`Reviewed range link missing from immutable baseline: ${removed}`);
    expectedHrefs.splice(index, 1);
  }
  expectedHrefs.push(rangeEnquiry("supply-only"), "/ranges/botanica/", "/ranges/castel-nuovo/", "/ranges/cavallo-bianco/", "/ranges/etf-14mm-oak-flooring/");
  for (const colour of verifiedHardwoodColours) {
    expectedHrefs.push(`/products/${colourSlug(colour)}/`, rangeEnquiry("stock", { product: `Hardwood Collection ${colour}`, productSlug: colourSlug(colour) }));
  }
  return {
    ...expected,
    title: "Hardwood Collection Engineered timber Range | Oz Timber Floor",
    description: "Browse Hardwood Collection engineered timber colours, specs and stock enquiries in Sydney. Ask Oz Timber Floor for supply-only or supply + install support.",
    h1: "Hardwood Collection engineered timber flooring range",
    jsonLdHash: sha(schema.map((value) => JSON.stringify(value)).join("\n")),
    internalHrefsHash: sha(JSON.stringify(expectedHrefs.sort())),
  };
}

function protectedDrift(file, beforeText, afterText) {
  const before = htmlContract(beforeText);
  const after = htmlContract(afterText);
  let expected = before;
  if (allowedMalformedIdentityPages.has(file)) {
    // This permits exactly removal of the reproduced suffix, not arbitrary identity/schema edits.
    expected = htmlContract(beforeText.replace(/\s*-\s*% % % %/g, ""));
  } else if (file === "ranges/hardwood-collection/index.html") {
    expected = expectedRangeContract(beforeText);
  }
  return protectedFields.filter((field) => after[field] !== (immutableFields.includes(field) ? before[field] : expected[field]));
}

for (const file of changedHtml) {
  const beforeText = atStart(file);
  const afterText = current(file);
  if (beforeText === null || afterText === null) {
    failures.push(`changed HTML unavailable for contract comparison: ${file}`);
    continue;
  }
  const before = htmlContract(beforeText);
  const after = htmlContract(afterText);
  const changedFields = protectedFields.filter((field) => before[field] !== after[field]);
  const floorCopyRepair = /^floor-levelling-sydney(?:\.html|\/index\.html)$/.test(file)
    && beforeText.includes("without publishing unapproved prices")
    && afterText.includes("without treating every site as a fixed-price job")
    && !afterText.includes("without publishing unapproved prices");
  const oldAssetRepair = oldAssetGuidePages.has(file)
    && /https?:\/\/oztimberfloor\.com\.au\/wp-content\//i.test(beforeText)
    && !/https?:\/\/oztimberfloor\.com\.au\/wp-content\//i.test(afterText)
    && /<img[^>]+src=["']\/assets\//i.test(afterText);
  const verifiedHardwoodRepair = verifiedHardwoodPages.has(file)
    && afterText.includes("14/3 mm")
    && afterText.includes("190 × 1900 mm (nested shorts)");
  const malformedCatalogueRepair = malformedPresentation.test(beforeText) && !malformedPresentation.test(afterText);
  let disposition = floorCopyRepair ? "customer-copy-repair"
    : oldAssetRepair ? "old-host-srcset-removal"
      : verifiedHardwoodRepair ? "verified-hardwood-spec-repair"
        : malformedCatalogueRepair ? "malformed-catalogue-presentation-repair"
          : "UNEXPLAINED";
  if (disposition === "UNEXPLAINED") failures.push(`changed HTML outside the bounded repair classes: ${file}`);
  const unexpectedFields = protectedDrift(file, beforeText, afterText);
  if (unexpectedFields.length) {
    failures.push(`unapproved protected HTML drift: ${file} (${unexpectedFields.join(", ")})`);
    disposition = "UNEXPLAINED";
  } else if (changedFields.length) {
    disposition = "exact-reviewed-catalogue-identity-repair";
  }
  htmlResults.push({ file, changedFields, disposition });
}

const expectedTaskPaths = changedFiles.filter((file) =>
  file === ".gitignore"
  || file === ".tools/rebuild-range-pages.mjs"
  || file === "assets/site.js"
  || file === "data/product-catalogue.json"
  || file === "package.json"
  || file.startsWith("scripts/")
  || file.startsWith("docs/seo-migration/OZ-MIG-004/")
  || file.startsWith("docs/seo-migration/generated/")
  || file.startsWith("docs/performance/generated/")
  || file.startsWith("docs/ui-ux/generated/")
  || ["OZ_STATUS.md", "OZ_TASK_QUEUE.md", "OZ_DECISION_LOG.md", "OZ_MIGRATION_CHECKLIST.md"].includes(file)
  || file.endsWith(".html")
);
const unexpectedPaths = changedFiles.filter((file) => !expectedTaskPaths.includes(file));
for (const file of unexpectedPaths) failures.push(`unexpected task path: ${file}`);

let historicalComparison = null;
try {
  const historical = JSON.parse(atStart("docs/ui-ux/generated/seo-freeze-comparison.json"));
  historicalComparison = { reportedDifferenceCount: historical.differenceCount, briefHistoricalAllowanceCount: 29, preservedAtStartingHead: true };
} catch {
  failures.push("historical SEO freeze comparison unavailable at starting HEAD");
}

const decisionBytes = fs.readFileSync(path.join(root, "docs/seo-migration/OZ-MIG-004/DECISION_PLAN.json"));
const report = {
  schemaVersion: 1,
  task: "OZ-MIG-004",
  generatedAt: "2026-09-09",
  baseline: { branch: "main", head: startingHead, worktreeWasClean: true },
  protectedDecisionPlan: {
    sha256: sha(decisionBytes),
    approvalState: "PENDING_VINCENT_APPROVAL",
    protectedChangesImplemented: false,
  },
  historicalSeoFreeze: historicalComparison,
  approvedLocalDeltas: [
    "remove reproduced cross-contaminated catalogue fields without inventing replacements",
    "restore the verified 12-colour Hardwood Collection range and supplier-level dimensions/method",
    "remove obsolete WordPress srcset dependencies where the local primary image already exists",
    "emit quote_submit only after a confirmed thank-you navigation marker",
    "remove one internal-facing phrase from floor-levelling customer copy",
    "add deterministic task checks and evidence",
  ],
  protectedFiles: protectedFileResults,
  changedHtml: htmlResults,
  changedFileCount: changedFiles.length,
  unexpectedPaths,
  unexplainedProtectedDrift: failures,
  result: failures.length ? "FAIL" : "PASS",
};

if (!process.argv.includes("--no-write")) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (failures.length) {
  console.error(`CURRENT RELEASE CONTRACT FAIL unexplained=${failures.length}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`CURRENT RELEASE CONTRACT PASS protectedFiles=${protectedFiles.length} changedHtml=${changedHtml.length} unexplained=0`);
}
