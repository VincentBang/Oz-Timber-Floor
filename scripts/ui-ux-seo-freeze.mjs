#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicationInventory } from "./publication-inventory.mjs";
import { verifiedPerformanceAllowances } from "./performance-html-freeze-allowance.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = process.env.OZ_UI_UX_GENERATED_DIR
  ? path.resolve(process.env.OZ_UI_UX_GENERATED_DIR)
  : path.join(root, "docs", "ui-ux", "generated");
const beforePath = path.join(generatedDir, "seo-freeze-before.json");
const afterPath = path.join(generatedDir, "seo-freeze-after.json");
const comparisonPath = path.join(generatedDir, "seo-freeze-comparison.json");
const canonicalOrigin = "https://oztimberfloor.com.au";
const schemaVersion = 3;
const command = process.argv[2];

const protectedFields = Object.freeze([
  "route",
  "file",
  "title",
  "titleCount",
  "metaDescription",
  "metaDescriptionCount",
  "canonical",
  "canonicalCount",
  "metaRobots",
  "metaRobotsCount",
  "ogUrl",
  "ogUrlCount",
  "htmlLang",
  "h1",
  "h1Count",
  "jsonLdHash",
  "internalHrefs",
  "links",
  "forms",
  "htmlHash",
]);

const protectedFilePaths = Object.freeze([
  "_headers",
  "_redirects",
  "assets/contact-config.js",
  "assets/site.js",
  "config/netlify-headers/non-production",
  "config/netlify-headers/production",
  "data/catalogue-quality-overrides.json",
  "data/product-catalogue-expanded.csv",
  "data/product-catalogue.json",
  "data/supplier-catalogue.csv",
  "data/supplier-ranges.csv",
  "migration/redirect-map.csv",
  "netlify.toml",
  "robots.txt",
  "scripts/prepare-netlify-deploy.mjs",
  "sitemap.xml",
]);

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textValue(value) {
  return decodeHtml(String(value ?? "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attributes(tag) {
  const result = {};
  for (const match of String(tag).matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function gitValue(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function metaContents(html, attribute, value) {
  const values = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (String(attrs[attribute] ?? "").toLowerCase() === value.toLowerCase()) {
      values.push(attrs.content ?? "");
    }
  }
  return values;
}

function canonicalHrefs(html) {
  const values = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    const rel = String(attrs.rel ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) values.push(attrs.href ?? "");
  }
  return values;
}

function jsonLdHash(html, route) {
  const values = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      values.push(stableJson(JSON.parse(match[1])));
    } catch (error) {
      throw new Error(`${route}: invalid JSON-LD (${error.message}).`);
    }
  }
  return sha256(JSON.stringify(values));
}

function internalDestination(href, route) {
  const value = decodeHtml(href).trim();
  if (!value || /^(?:mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  if (value.startsWith("#")) return value;
  let resolved;
  try {
    resolved = new URL(value, `${canonicalOrigin}${route}`);
  } catch {
    return null;
  }
  if (resolved.origin !== canonicalOrigin) return null;
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function linkContracts(html, route) {
  return [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => {
    const openingTag = match[0].match(/^<a\b[^>]*>/i)?.[0] ?? "<a>";
    const attrs = attributes(openingTag);
    const href = attrs.href ?? "";
    return {
      href,
      destination: href ? internalDestination(href, route) : null,
      text: textValue(match[1]),
      rel: attrs.rel ?? "",
      target: attrs.target ?? "",
    };
  });
}

function hrefSet(links) {
  return [...new Set(links.map((link) => link.destination).filter(Boolean))].sort();
}

function formContracts(html) {
  return [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map((match) => {
    const formHtml = match[0];
    const openingTag = formHtml.match(/^<form\b[^>]*>/i)?.[0] ?? "<form>";
    const attrs = attributes(openingTag);
    const fields = [...formHtml.matchAll(/<(input|select|textarea|button)\b[^>]*>/gi)].map((fieldMatch) => {
      const fieldAttrs = attributes(fieldMatch[0]);
      return {
        tag: fieldMatch[1].toLowerCase(),
        name: fieldAttrs.name ?? "",
        type: fieldAttrs.type ?? "",
        value: fieldAttrs.value ?? "",
        attributes: stableJson(fieldAttrs),
        required: /(?:^|\s)required(?:\s|=|\/?>)/i.test(fieldMatch[0]),
      };
    });
    return {
      name: attrs.name ?? "",
      action: attrs.action ?? "",
      method: attrs.method ?? "",
      attributes: stableJson(attrs),
      fields,
      htmlHash: sha256(formHtml),
    };
  });
}

function pageContract(route, file) {
  if (!file || !fs.existsSync(path.join(root, file))) {
    throw new Error(`${route}: publication owner file is missing (${file || "not defined"}).`);
  }
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const descriptions = metaContents(html, "name", "description");
  const robots = metaContents(html, "name", "robots");
  const ogUrls = metaContents(html, "property", "og:url");
  const canonicals = canonicalHrefs(html);
  const links = linkContracts(html, route);
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";

  if (titleMatches.length !== 1) throw new Error(`${route}: expected one title, found ${titleMatches.length}.`);
  if (h1Matches.length !== 1) throw new Error(`${route}: expected one H1, found ${h1Matches.length}.`);
  if (descriptions.length !== 1) throw new Error(`${route}: expected one meta description, found ${descriptions.length}.`);
  if (canonicals.length !== 1) throw new Error(`${route}: expected one canonical, found ${canonicals.length}.`);
  if (robots.length !== 1) throw new Error(`${route}: expected one robots meta tag, found ${robots.length}.`);
  if (/\bnoindex\b/i.test(robots[0])) throw new Error(`${route}: noindex page found in sitemap.`);

  return {
    route,
    file,
    title: textValue(titleMatches[0][1]),
    titleCount: titleMatches.length,
    metaDescription: descriptions[0],
    metaDescriptionCount: descriptions.length,
    canonical: canonicals[0],
    canonicalCount: canonicals.length,
    metaRobots: robots[0],
    metaRobotsCount: robots.length,
    ogUrl: ogUrls[0] ?? "",
    ogUrlCount: ogUrls.length,
    htmlLang: attributes(htmlTag).lang ?? "",
    h1: textValue(h1Matches[0][1]),
    h1Count: h1Matches.length,
    jsonLdHash: jsonLdHash(html, route),
    internalHrefs: hrefSet(links),
    links,
    forms: formContracts(html),
    htmlHash: sha256(html),
  };
}

function protectedFileContracts() {
  return protectedFilePaths.map((relativePath) => {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) throw new Error(`Missing protected file: ${relativePath}`);
    return {
      file: relativePath,
      sha256: sha256(fs.readFileSync(absolutePath)),
    };
  });
}

function previousBaselineTimestamp(destination) {
  if (destination !== beforePath || !fs.existsSync(destination)) return null;
  try {
    const previous = JSON.parse(fs.readFileSync(destination, "utf8"));
    return previous.baselineCapturedAt ?? previous.generatedAt ?? null;
  } catch {
    return null;
  }
}

function inventoryContract(inventory) {
  return {
    physicalHtmlFiles: inventory.physicalHtmlFiles,
    physicalIndexableHtmlFiles: inventory.physicalIndexableHtmlFiles,
    sitemapRouteCount: inventory.sitemapRoutes.length,
    indexableCanonicalRouteCount: inventory.publicationRoutes.length,
    noindexRouteCount: inventory.noindexRoutes.length,
    redirectOnlyRouteCount: inventory.redirectOnlyRoutes.length,
    sitemapRoutes: inventory.sitemapRoutes,
    indexableCanonicalRoutes: inventory.publicationRoutes,
    sitemapOmissions: inventory.sitemapOmissions,
    sitemapWithoutPublicationCanonical: inventory.sitemapWithoutPublicationCanonical,
    noindexRoutes: inventory.noindexRoutes,
    redirectOnlyRoutes: inventory.redirectOnlyRoutes,
    intentionalNoindexUtilityRoutes: inventory.intentionalNoindexUtilityRoutes,
    utilityRoutePolicyIssues: inventory.utilityRoutePolicyIssues,
    noindexSitemapRoutes: inventory.noindexSitemapRoutes,
    sitemapDuplicateRoutes: inventory.sitemapDuplicateRoutes,
    sitemapNonProductionUrls: inventory.sitemapNonProductionUrls,
    duplicateCanonicals: inventory.duplicateCanonicals,
    canonicalRobotsConflicts: inventory.canonicalRobotsConflicts,
    intentionalPhysicalAliases: inventory.intentionalPhysicalAliases,
    duplicateCanonicalOwnership: inventory.duplicateOwnership,
    missingCanonicalFiles: inventory.missingCanonicalFiles,
    multipleCanonicalFiles: inventory.multipleCanonicalFiles,
    invalidCanonicalFiles: inventory.invalidCanonicalFiles,
    conflictingRobotsFiles: inventory.conflictingRobotsFiles,
    blockingIssues: inventory.blockingIssues,
  };
}

function assertInventorySafe(inventory) {
  if (!inventory.blockingIssues.length) return;
  throw new Error(`SEO inventory is unsafe:\n${JSON.stringify(inventory.blockingIssues, null, 2)}`);
}

function capture(destination, refuseOverwrite = false) {
  if (refuseOverwrite && fs.existsSync(destination) && !process.argv.includes("--force")) {
    throw new Error(`${path.relative(root, destination)} already exists; use --force only when intentionally replacing the pre-change baseline.`);
  }

  const generatedAt = new Date().toISOString();
  const publicationInventory = createPublicationInventory({ root, domain: canonicalOrigin });
  assertInventorySafe(publicationInventory);
  const pages = publicationInventory.publicationPages
    .map((page) => pageContract(page.route, page.file));
  const manifest = {
    schemaVersion,
    generatedAt,
    baselineCapturedAt: previousBaselineTimestamp(destination) ?? generatedAt,
    source: {
      description: "all physical HTML reconciled to unique indexable publication canonicals",
      branch: gitValue(["branch", "--show-current"]),
      commit: gitValue(["rev-parse", "HEAD"]),
      sitemapSha256: sha256(fs.readFileSync(path.join(root, "sitemap.xml"))),
    },
    protectedFields,
    protectedFileHashes: protectedFileContracts(),
    inventory: inventoryContract(publicationInventory),
    pageCount: pages.length,
    pages,
  };

  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(
    `Captured ${pages.length} complete indexable canonical contracts from ${publicationInventory.physicalHtmlFiles} physical HTML files; `
    + `${publicationInventory.sitemapRoutes.length} sitemap routes and ${publicationInventory.noindexRoutes.length} noindex routes reconciled in ${path.relative(root, destination)}.\n`,
  );
}

function validateManifest(manifest, label) {
  if (manifest.schemaVersion !== schemaVersion) {
    throw new Error(`${label}: expected schemaVersion ${schemaVersion}, found ${manifest.schemaVersion}.`);
  }
  if (JSON.stringify(manifest.protectedFields) !== JSON.stringify(protectedFields)) {
    throw new Error(`${label}: protected field definition does not match the required schema.`);
  }
  if (!Array.isArray(manifest.pages) || manifest.pageCount !== manifest.pages.length) {
    throw new Error(`${label}: pageCount does not match pages.length.`);
  }
  if (!manifest.inventory || !Array.isArray(manifest.inventory.indexableCanonicalRoutes)) {
    throw new Error(`${label}: full physical-HTML inventory is missing.`);
  }
  if (manifest.inventory.indexableCanonicalRouteCount !== manifest.inventory.indexableCanonicalRoutes.length) {
    throw new Error(`${label}: indexableCanonicalRouteCount does not match the canonical route inventory.`);
  }
  if (manifest.inventory.sitemapRouteCount !== manifest.inventory.sitemapRoutes.length) {
    throw new Error(`${label}: sitemapRouteCount does not match the sitemap route inventory.`);
  }
  if (manifest.pageCount !== manifest.inventory.indexableCanonicalRouteCount) {
    throw new Error(`${label}: protected page count does not reconcile with unique indexable canonicals.`);
  }
  if ((manifest.inventory.blockingIssues ?? []).length) {
    throw new Error(`${label}: inventory contains blocking publication issues.`);
  }
  const routes = manifest.pages.map((page) => page.route);
  if (new Set(routes).size !== routes.length) throw new Error(`${label}: duplicate page route.`);
  if (JSON.stringify([...routes].sort()) !== JSON.stringify([...manifest.inventory.indexableCanonicalRoutes].sort())) {
    throw new Error(`${label}: protected pages do not match the full indexable canonical inventory.`);
  }
  const filePaths = (manifest.protectedFileHashes ?? []).map((entry) => entry.file);
  if (JSON.stringify(filePaths) !== JSON.stringify(protectedFilePaths)) {
    throw new Error(`${label}: protected file definition does not match the required schema.`);
  }
}

function compare() {
  if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
    throw new Error("Both before and after SEO freeze manifests are required.");
  }

  const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));
  validateManifest(before, "before");
  validateManifest(after, "after");

  const differences = [];
  for (const field of ["branch", "commit", "sitemapSha256"]) {
    if (before.source?.[field] !== after.source?.[field]) {
      differences.push({
        scope: "source",
        field,
        before: before.source?.[field],
        after: after.source?.[field],
      });
    }
  }

  const beforeFiles = new Map(before.protectedFileHashes.map((entry) => [entry.file, entry.sha256]));
  const afterFiles = new Map(after.protectedFileHashes.map((entry) => [entry.file, entry.sha256]));
  for (const file of protectedFilePaths) {
    if (beforeFiles.get(file) !== afterFiles.get(file)) {
      differences.push({
        scope: "protected-file",
        file,
        before: beforeFiles.get(file),
        after: afterFiles.get(file),
      });
    }
  }

  const inventoryFields = [...new Set([
    ...Object.keys(before.inventory ?? {}),
    ...Object.keys(after.inventory ?? {}),
  ])].sort();
  for (const field of inventoryFields) {
    if (JSON.stringify(before.inventory?.[field]) !== JSON.stringify(after.inventory?.[field])) {
      differences.push({
        scope: "inventory",
        field,
        before: before.inventory?.[field],
        after: after.inventory?.[field],
      });
    }
  }

  const beforeByRoute = new Map(before.pages.map((page) => [page.route, page]));
  const afterByRoute = new Map(after.pages.map((page) => [page.route, page]));
  const performanceAllowance = verifiedPerformanceAllowances();
  const appliedPerformanceAllowances = [];
  const routes = [...new Set([...beforeByRoute.keys(), ...afterByRoute.keys()])].sort();
  for (const route of routes) {
    const left = beforeByRoute.get(route);
    const right = afterByRoute.get(route);
    if (!left || !right) {
      differences.push({ scope: "page", route, field: "route", before: Boolean(left), after: Boolean(right) });
      continue;
    }
    for (const field of protectedFields) {
      let rightValue = right[field];
      if (field === "htmlHash") {
        const allowance = performanceAllowance.routes.get(route);
        if (allowance && allowance.file === right.file && allowance.currentRawSha256 === right.htmlHash) {
          rightValue = allowance.baselineRawSha256;
          appliedPerformanceAllowances.push({
            route,
            file: right.file,
            baselineRawSha256: allowance.baselineRawSha256,
            currentRawSha256: allowance.currentRawSha256,
            normalizedSha256: allowance.currentNormalizedSha256,
          });
        }
      }
      if (JSON.stringify(left[field]) !== JSON.stringify(rightValue)) {
        differences.push({ scope: "page", route, field, before: left[field], after: rightValue });
      }
    }
  }

  if (differences.length) {
    fs.mkdirSync(generatedDir, { recursive: true });
    fs.writeFileSync(comparisonPath, `${JSON.stringify({
      schemaVersion,
      generatedAt: new Date().toISOString(),
      verdict: "FAIL",
      beforePageCount: before.pageCount,
      afterPageCount: after.pageCount,
      performanceAllowanceIssues: performanceAllowance.issues,
      performanceHtmlHashAllowances: appliedPerformanceAllowances,
      differenceCount: differences.length,
      differences,
    }, null, 2)}\n`);
    process.stderr.write(`${JSON.stringify({ verdict: "FAIL", differences }, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(comparisonPath, `${JSON.stringify({
    schemaVersion,
    generatedAt: new Date().toISOString(),
    verdict: "PASS",
    beforePageCount: before.pageCount,
    afterPageCount: after.pageCount,
    protectedFileCount: protectedFilePaths.length,
    sitemapRouteCount: after.inventory.sitemapRouteCount,
    indexableCanonicalRouteCount: after.inventory.indexableCanonicalRouteCount,
    noindexRouteCount: after.inventory.noindexRouteCount,
    redirectOnlyRouteCount: after.inventory.redirectOnlyRouteCount,
    performanceAllowanceIssues: performanceAllowance.issues,
    performanceHtmlHashAllowances: appliedPerformanceAllowances,
    differenceCount: 0,
    differences: [],
  }, null, 2)}\n`);
  process.stdout.write(
    `SEO freeze PASS: ${routes.length} complete indexable canonical page contracts, ${after.inventory.sitemapRouteCount} sitemap routes, and ${protectedFilePaths.length} protected file hashes are unchanged.\n`,
  );
}

if (command === "capture-before") capture(beforePath, true);
else if (command === "capture-after") capture(afterPath);
else if (command === "compare") compare();
else throw new Error("Usage: node scripts/ui-ux-seo-freeze.mjs capture-before|capture-after|compare [--force]");
