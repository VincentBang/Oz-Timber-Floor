import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const domain = "https://oztimberfloor.com.au";
const hardwoodRoute = "/hardwood-timber-flooring-sydney/";
const expectedDecisionCount = 1222;
const expectedDirectRedirectCount = 220;
const initialApplicationEvidence = {
  catalogueLegacyRedirectDestinationsRemapped: 632,
  forcedCatalogueRedirectDestinationsRemapped: 4,
  bambooLegacyRedirectDestinationsRemapped: 25,
  bambooLandingRewriteConverted: 1,
};
const generatedDir = path.join(root, "docs", "seo-migration", "generated");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function write(relativePath, content) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
}

function routeFromUrl(value) {
  let pathname;
  try {
    pathname = new URL(String(value || ""), domain).pathname;
  } catch {
    pathname = String(value || "").split(/[?#]/)[0];
  }
  pathname = pathname.replace(/\\/g, "/").replace(/\/+/g, "/");
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname.endsWith(".html")) pathname = `${pathname.slice(0, -5)}/`;
  if (!path.extname(pathname) && !pathname.endsWith("/")) pathname += "/";
  return pathname;
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function replaceFile(relativePath, replacer) {
  const current = read(relativePath);
  const next = replacer(current);
  if (apply && next !== current) write(relativePath, next);
  return next !== current;
}

const quality = readJson("docs/seo-migration/generated/catalogue-quality-report.json");
const previousOverrides = readJson("data/catalogue-quality-overrides.json");
const sitemapXml = read("sitemap.xml");
const sitemapRoutes = new Set(
  [...sitemapXml.matchAll(/<loc>https:\/\/oztimberfloor\.com\.au([^<]+)<\/loc>/g)].map((match) => routeFromUrl(match[1])),
);
const pagesByRoute = new Map(quality.pages.map((page) => [page.route, page]));
const categoryRoutes = new Map([
  ["hybrid", "/hybrid-flooring-sydney/"],
  ["laminate", "/laminate-flooring-sydney/"],
  ["engineered timber", "/engineered-timber-flooring-sydney/"],
  ["solid timber", "/solid-timber-flooring-sydney/"],
  ["vinyl", "/vinyl-flooring-sydney/"],
]);

function approvedReplacement(page) {
  if (page.type === "product" && page.range) {
    const rangeRoute = `/ranges/${slug(page.range)}/`;
    const rangePage = pagesByRoute.get(rangeRoute);
    if (rangeRoute !== page.route && rangePage?.classification === "indexable" && sitemapRoutes.has(rangeRoute)) {
      return { route: rangeRoute, basis: "indexable-parent-range" };
    }
  }
  const categoryRoute = categoryRoutes.get(String(page.category || "").toLowerCase());
  if (categoryRoute && sitemapRoutes.has(categoryRoute)) {
    return { route: categoryRoute, basis: "matching-flooring-category" };
  }
  throw new Error(`No approved replacement for ${page.route} (${page.type}, ${page.category || "no category"}, ${page.range || "no range"})`);
}

const decisionPages = quality.pages
  .filter((page) => page.classification !== "indexable")
  .sort((a, b) => a.route.localeCompare(b.route))
  .map((page) => {
    const replacement = approvedReplacement(page);
    const failures = page.issues.map((issue) => issue.code).sort();
    const previousDecision = previousOverrides.pages?.[page.route];
    const previouslySupplierBearing = previousDecision?.reason?.includes("public-supplier-name");
    const directRedirect = ["redirect-only", "retired"].includes(page.classification)
      || failures.includes("public-supplier-name")
      || previousDecision?.directRedirect === true
      || previouslySupplierBearing;
    return {
      route: page.route,
      classification: page.classification,
      applyNoindex: true,
      replacementRoute: replacement.route,
      replacementBasis: replacement.basis,
      directRedirect,
      failures,
      reason: previousDecision?.reason
        || `Approved 2026-08-04 controlled treatment for ${failures.join(", ") || page.classification}.`,
    };
  });

if (decisionPages.length !== expectedDecisionCount) {
  throw new Error(`Approval scope changed: expected ${expectedDecisionCount} non-indexable catalogue pages, found ${decisionPages.length}.`);
}

const decisionByRoute = new Map(decisionPages.map((decision) => [decision.route, decision]));
const decisionCounts = decisionPages.reduce((counts, decision) => {
  counts[decision.replacementBasis] = (counts[decision.replacementBasis] || 0) + 1;
  return counts;
}, {});

const overrideManifest = {
  schemaVersion: 2,
  lastReviewed: "2026-08-04",
  policy: "Approved controlled treatment: retain incomplete pages only as noindex,follow fallbacks without Product schema; redirect legacy traffic to an indexable parent range or matching category; redirect alias, retired, and supplier-bearing public routes directly.",
  pages: Object.fromEntries(decisionPages.map((decision) => [decision.route, {
    classification: decision.classification,
    applyNoindex: decision.applyNoindex,
    replacementRoute: decision.replacementRoute,
    replacementBasis: decision.replacementBasis,
    directRedirect: decision.directRedirect,
    reason: decision.reason,
  }])),
};

const originalRedirects = read("_redirects");
let redirectLines = originalRedirects.split(/\r?\n/);
let bambooLandingConverted = 0;
let bambooLegacyRemapped = 0;
let catalogueLegacyRemapped = 0;
let directDecisionRulesUpdated = 0;
let directDecisionRulesAdded = 0;

redirectLines = redirectLines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return line;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 3) return line;
  const sourceRoute = routeFromUrl(parts[0]);
  const destinationRoute = routeFromUrl(parts[1]);
  const isRedirect = /^30[1278]!?$/.test(parts[2]);

  if (sourceRoute === "/bamboo-flooring-sydney/" && parts[2] === "200!") {
    bambooLandingConverted += 1;
    return `/bamboo-flooring-sydney/ ${hardwoodRoute} 301`;
  }
  if (!isRedirect) return line;
  if (destinationRoute === "/bamboo-flooring-sydney/") {
    bambooLegacyRemapped += 1;
    parts[1] = hardwoodRoute;
    return parts.join(" ");
  }
  const decision = decisionByRoute.get(destinationRoute);
  if (decision) {
    catalogueLegacyRemapped += 1;
    parts[1] = decision.replacementRoute;
    return parts.join(" ");
  }
  return line;
});

function sourceLineIndex(source) {
  return redirectLines.findIndex((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    return trimmed.split(/\s+/)[0] === source;
  });
}

const directRules = decisionPages.filter((decision) => decision.directRedirect);
if (directRules.length !== expectedDirectRedirectCount) {
  throw new Error(`Approval scope changed: expected ${expectedDirectRedirectCount} direct catalogue redirects, found ${directRules.length}.`);
}
const linesToAdd = [];
for (const decision of directRules) {
  const existingIndex = sourceLineIndex(decision.route);
  const replacementLine = `${decision.route} ${decision.replacementRoute} 301`;
  if (existingIndex >= 0) {
    if (redirectLines[existingIndex] !== replacementLine) {
      redirectLines[existingIndex] = replacementLine;
      directDecisionRulesUpdated += 1;
    }
  } else {
    linesToAdd.push(replacementLine);
    directDecisionRulesAdded += 1;
  }
}

const bambooHtmlRule = `/bamboo-flooring-sydney.html ${hardwoodRoute} 301`;
const bambooHtmlIndex = sourceLineIndex("/bamboo-flooring-sydney.html");
if (bambooHtmlIndex >= 0) redirectLines[bambooHtmlIndex] = bambooHtmlRule;
else linesToAdd.push(bambooHtmlRule);
for (const source of ["/bamboo-flooring-sydney", "/bamboo-flooring-sydney/index.html"]) {
  const rule = `${source} ${hardwoodRoute} 301`;
  const existingIndex = sourceLineIndex(source);
  if (existingIndex >= 0) redirectLines[existingIndex] = rule;
  else linesToAdd.push(rule);
}

if (linesToAdd.length) {
  const catchAllIndex = redirectLines.findIndex((line) => line.trim().startsWith("/* "));
  if (catchAllIndex < 0) throw new Error("Cannot find final catch-all rule in _redirects.");
  const block = [
    "# Approved catalogue/Bamboo retirement routes — 2026-08-04",
    ...linesToAdd.sort((a, b) => a.localeCompare(b)),
  ];
  redirectLines.splice(catchAllIndex, 0, ...block);
}

const nextRedirects = `${redirectLines.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "")}\n`;
const remainingUnsafeRedirects = nextRedirects
  .split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/))
  .filter((parts) => parts.length >= 3 && /^30[1278]!?$/.test(parts[2]))
  .filter((parts) => decisionByRoute.has(routeFromUrl(parts[1])) || routeFromUrl(parts[1]) === "/bamboo-flooring-sydney/");
if (remainingUnsafeRedirects.length) {
  throw new Error(`Unsafe redirect destinations remain: ${remainingUnsafeRedirects.slice(0, 5).map((parts) => parts.join(" ")).join("; ")}`);
}

const bambooPattern = /\s*<url(?:\s[^>]*)?>[\s\S]*?<loc>https:\/\/oztimberfloor\.com\.au\/bamboo-flooring-sydney\/<\/loc>[\s\S]*?<\/url>/i;
const nextSitemap = sitemapXml.replace(bambooPattern, "").replace(/\n{3,}/g, "\n\n");
if (nextSitemap === sitemapXml && sitemapRoutes.has("/bamboo-flooring-sydney/")) {
  throw new Error("Bamboo sitemap entry was not removed.");
}

const retiredLanding = `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Current Timber Flooring Options | Oz Timber Floor</title>
  <meta name="description" content="Browse current hardwood, engineered timber and timber-look flooring options available through Oz Timber Floor Sydney.">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${domain}${hardwoodRoute}">
  <meta http-equiv="refresh" content="0;url=${hardwoodRoute}">
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <main class="section">
    <div class="shell text-block">
      <h1>Explore current timber flooring options</h1>
      <p>This discontinued catalogue route has moved to the current hardwood and timber flooring pathway.</p>
      <p><a class="button" href="${hardwoodRoute}">Browse current flooring options</a></p>
    </div>
  </main>
</body>
</html>
`;

const publicChanges = [];
for (const file of ["bamboo-flooring-sydney.html", "bamboo-flooring-sydney/index.html"]) {
  if (read(file) !== retiredLanding) {
    publicChanges.push(file);
    if (apply) write(file, retiredLanding);
  }
}
for (const file of ["products.html", "products/index.html"]) {
  const changed = replaceFile(file, (html) => html
    .replace(
      /<p class="section-action">Looking for legacy bamboo flooring pages\?[\s\S]*?<\/p>/i,
      '<p class="section-action">Looking for real-timber options? <a href="/hardwood-timber-flooring-sydney/">Browse current hardwood timber flooring</a> and related alternatives.</p>',
    )
    .replace(/<a\b[^>]*href="\/bamboo-flooring-sydney\/"[^>]*>[\s\S]*?<\/a>/gi, ""));
  if (changed) publicChanges.push(file);
}
if (replaceFile("guides/common-questions-we-get-as-hybrid-floor-installers-in-sydney/index.html", (html) => html.replace(
  "laminate or bamboo variant",
  "laminate or engineered timber option",
))) publicChanges.push("guides/common-questions-we-get-as-hybrid-floor-installers-in-sydney/index.html");
if (replaceFile("guides/commercial-timber-flooring-high-traffic-spaces-sydney/index.html", (html) => html.replace(
  /\s*<ul>\s*<li>Bamboo flooring \(rapidly renewable\)<\/li>\s*<\/ul>/i,
  "",
))) publicChanges.push("guides/commercial-timber-flooring-high-traffic-spaces-sydney/index.html");
if (replaceFile("guides/choosing-office-flooring-durability-design-performance/index.html", (html) => html.replace(
  /<h2><strong>Bamboo Flooring:[\s\S]*?(?=<h2><strong>Laminate Flooring:)/i,
  "",
))) publicChanges.push("guides/choosing-office-flooring-durability-design-performance/index.html");

if (apply) {
  write("data/catalogue-quality-overrides.json", `${JSON.stringify(overrideManifest, null, 2)}\n`);
  write("_redirects", nextRedirects);
  write("sitemap.xml", nextSitemap);
}

const decisionReport = {
  generatedAt: new Date().toISOString(),
  applied: apply,
  policy: {
    bambooReplacement: hardwoodRoute,
    catalogue: overrideManifest.policy,
  },
  catalogue: {
    decisionPages: decisionPages.length,
    byReplacementBasis: decisionCounts,
    directRouteRedirectsEnsured: directRules.length,
    initialLegacyRedirectDestinationsRemapped: initialApplicationEvidence.catalogueLegacyRedirectDestinationsRemapped,
    forcedLegacyRedirectDestinationsRemapped: initialApplicationEvidence.forcedCatalogueRedirectDestinationsRemapped,
    totalLegacyRedirectDestinationsRemapped:
      initialApplicationEvidence.catalogueLegacyRedirectDestinationsRemapped
      + initialApplicationEvidence.forcedCatalogueRedirectDestinationsRemapped,
    legacyRedirectDestinationsRemappedThisRun: catalogueLegacyRemapped,
  },
  bamboo: {
    initialLandingRewriteConverted: initialApplicationEvidence.bambooLandingRewriteConverted,
    initialLegacyRedirectDestinationsRemapped: initialApplicationEvidence.bambooLegacyRedirectDestinationsRemapped,
    landingRewriteConvertedThisRun: bambooLandingConverted,
    legacyRedirectDestinationsRemappedThisRun: bambooLegacyRemapped,
    htmlFallbackRedirectEnsured: true,
    publicFilesChangedThisRun: publicChanges,
    sitemapEntryRemoved: nextSitemap !== sitemapXml,
  },
  redirects: {
    directDecisionRulesUpdatedThisRun: directDecisionRulesUpdated,
    directDecisionRulesAddedThisRun: directDecisionRulesAdded,
    remainingUnsafeDestinations: remainingUnsafeRedirects.length,
  },
};

if (apply) {
  write("docs/seo-migration/generated/approved-release-decisions-2026-08-04.json", `${JSON.stringify(decisionReport, null, 2)}\n`);
  write("docs/seo-migration/generated/approved-release-decisions-2026-08-04.md", [
    "# Approved release decisions — 4 August 2026",
    "",
    `- Catalogue pages receiving explicit controlled treatment: ${decisionPages.length}.`,
    `- Replacement basis: ${decisionCounts["indexable-parent-range"] || 0} indexable parent ranges; ${decisionCounts["matching-flooring-category"] || 0} matching categories.`,
    `- Direct alias/retired/supplier-bearing routes mapped to safe replacements: ${directRules.length}.`,
    `- Existing catalogue redirect destinations remapped in the initial approved application: ${initialApplicationEvidence.catalogueLegacyRedirectDestinationsRemapped}.`,
    `- Additional forced catalogue aliases remapped after matcher validation: ${initialApplicationEvidence.forcedCatalogueRedirectDestinationsRemapped}.`,
    `- Total existing catalogue redirect destinations remapped: ${initialApplicationEvidence.catalogueLegacyRedirectDestinationsRemapped + initialApplicationEvidence.forcedCatalogueRedirectDestinationsRemapped}.`,
    `- Existing Bamboo redirect destinations remapped in the initial approved application: ${initialApplicationEvidence.bambooLegacyRedirectDestinationsRemapped}.`,
    `- Bamboo landing rewrite converted to a direct retirement redirect in the initial approved application: ${initialApplicationEvidence.bambooLandingRewriteConverted}.`,
    `- Idempotence check for this run: ${catalogueLegacyRemapped} catalogue and ${bambooLegacyRemapped} Bamboo destinations still required remapping.`,
    `- Remaining redirect destinations pointing to controlled/noindex routes: ${remainingUnsafeRedirects.length}.`,
    "",
    "The full page-level decision manifest is `data/catalogue-quality-overrides.json`. Catalogue pages remain available as `noindex,follow` fallbacks unless their decision requires a direct redirect. Product schema and sitemap membership are removed by `npm run catalogue:apply`.",
    "",
  ].join("\n"));
}

process.stdout.write(`${apply ? "Applied" : "Dry run"}: ${decisionPages.length} catalogue decisions (${decisionCounts["indexable-parent-range"] || 0} range, ${decisionCounts["matching-flooring-category"] || 0} category); ${catalogueLegacyRemapped} catalogue and ${bambooLegacyRemapped} Bamboo redirect destinations remapped; ${remainingUnsafeRedirects.length} unsafe destinations remain.\n`);
