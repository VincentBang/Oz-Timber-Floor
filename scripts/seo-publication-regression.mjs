#!/usr/bin/env node

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicationInventory,
  filterExactSitemapLocation,
  publicationBlockingIssues,
  sitemapLocation,
  sitemapUrlBlocks,
} from "./publication-inventory.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const domain = "https://oztimberfloor.com.au";
const inventory = createPublicationInventory({ root, domain });

assert.equal(inventory.blockingIssues.length, 0, JSON.stringify(inventory.blockingIssues, null, 2));
assert.equal(inventory.sitemapOmissions.length, 0, "Every publication canonical must appear in sitemap.xml.");
assert.equal(inventory.sitemapWithoutPublicationCanonical.length, 0, "Every sitemap URL must resolve to an indexable publication canonical.");
assert.equal(inventory.noindexSitemapRoutes.length, 0, "No noindex route may appear in sitemap.xml.");
assert.equal(inventory.duplicateOwnership.length, 0, "Every publication canonical must have one explicit owner.");
assert.equal(inventory.missingCanonicalFiles.length, 0, "Every indexable physical HTML page must define a canonical.");
assert.equal(inventory.conflictingRobotsFiles.length, 0, "A physical HTML file must not contain conflicting robots directives.");
assert.equal(inventory.utilityRoutePolicyIssues.length, 0, "Declared utility routes must remain deliberately noindex.");
assert.equal(inventory.publicationRoutes.length, inventory.sitemapRoutes.length, "Publication and sitemap counts must reconcile exactly.");

assert.ok(inventory.sitemapRoutes.includes("/"), "Homepage must be present in sitemap.xml.");
assert.ok(inventory.sitemapRoutes.includes("/about/"), "About must be present in sitemap.xml.");
assert.ok(!inventory.sitemapRoutes.includes("/bamboo-flooring-sydney/"), "Retired Bamboo route must be absent from sitemap.xml.");
assert.ok(!inventory.sitemapRoutes.includes("/thank-you/"), "Thank-you utility route must be absent from sitemap.xml.");
assert.ok(!inventory.sitemapRoutes.includes("/404/"), "404 utility route must be absent from sitemap.xml.");
assert.ok(inventory.noindexRoutes.includes("/thank-you/"), "Thank-you utility route must be noindex.");
assert.ok(inventory.noindexRoutes.includes("/404/"), "404 utility route must be noindex.");

const fixture = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${domain}/</loc><priority>1.00</priority></url>
  <url><loc>${domain}/about/</loc><priority>0.64</priority></url>
  <url><loc>${domain}/bamboo-flooring-sydney/</loc><priority>0.80</priority></url>
  <url><loc>${domain}/contact/</loc><priority>0.90</priority></url>
</urlset>`;
const filteredFixture = filterExactSitemapLocation(fixture, `${domain}/bamboo-flooring-sydney/`);
const filteredLocations = sitemapUrlBlocks(filteredFixture).map(sitemapLocation);
assert.deepEqual(filteredLocations, [`${domain}/`, `${domain}/about/`, `${domain}/contact/`], "Exact Bamboo filtering must preserve adjacent URL blocks.");

for (const route of ["/", "/about/"]) {
  const simulated = { ...inventory, sitemapOmissions: [route] };
  const issues = publicationBlockingIssues(simulated);
  assert.ok(
    issues.some((issue) => issue.code === "publication-canonical-missing-from-sitemap" && issue.route === route),
    `Missing ${route} must produce a publication-canonical-missing-from-sitemap BLOCKER.`,
  );
}

const simulatedNoindexSitemap = {
  ...inventory,
  noindexSitemapRoutes: ["/thank-you/"],
  sitemapWithoutPublicationCanonical: ["/thank-you/"],
};
assert.ok(
  publicationBlockingIssues(simulatedNoindexSitemap)
    .some((issue) => issue.code === "noindex-in-sitemap" && issue.route === "/thank-you/"),
  "A noindex utility route in sitemap.xml must produce a BLOCKER.",
);

process.stdout.write([
  "SEO publication regression PASS.",
  `Physical HTML files: ${inventory.physicalHtmlFiles}.`,
  `Physical indexable HTML files: ${inventory.physicalIndexableHtmlFiles}.`,
  `Unique publication canonicals: ${inventory.publicationRoutes.length}.`,
  `Sitemap routes: ${inventory.sitemapRoutes.length}.`,
  `Unique noindex routes: ${inventory.noindexRoutes.length}.`,
  `Physical redirect-only routes: ${inventory.redirectOnlyRoutes.length}.`,
  `Canonical groups with index/noindex aliases reported: ${inventory.canonicalRobotsConflicts.length}.`,
  `Intentional duplicate physical aliases with exact rewrite owners: ${inventory.intentionalPhysicalAliases.length}.`,
].join(" ") + "\n");
