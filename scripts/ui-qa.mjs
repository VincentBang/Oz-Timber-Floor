#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browserReportPath = path.join(root, "docs/release/OZ-RELEASE-CLOSEOUT/browser/browser-qa.json");

const lcpFiles = Object.freeze([
  "index.html",
  "products/index.html",
  "products.html",
  "ranges/index.html",
  "hybrid/index.html",
  "hybrid.html",
  "engineered-timber-flooring/index.html",
  "engineered-timber-flooring.html",
  "ranges/avala/index.html",
  "products/avala-blackbutt/index.html",
]);

const requiredRoutes = Object.freeze([
  "/",
  "/products/",
  "/ranges/",
  "/hybrid/",
  "/engineered-timber-flooring/",
  "/timber-floor-installation/",
  "/floor-levelling/",
  "/projects/",
  "/contact/",
  "/ranges/avala/",
  "/products/avala-blackbutt/",
  "/privacy/",
  "/terms/",
  "/404.html",
]);

const requiredViewports = Object.freeze([
  "1440x1000",
  "1024x768",
  "768x1024",
  "390x844",
  "320x800",
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function attributes(tag) {
  const result = {};
  for (const match of String(tag).matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

const failures = [];
const addFailure = (code, detail = {}) => failures.push({ code, ...detail });

for (const relativePath of lcpFiles) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    addFailure("lcp-file-missing", { file: relativePath });
    continue;
  }
  const html = fs.readFileSync(absolutePath, "utf8");
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => ({ tag: match[0], attrs: attributes(match[0]) }));
  const lcpImages = images.filter((image) => /\bdata-lcp-image(?:\s|=|>)/i.test(image.tag));
  const highPriority = images.filter((image) => String(image.attrs.fetchpriority || "").toLowerCase() === "high");
  if (lcpImages.length !== 1) addFailure("invalid-lcp-image-count", { file: relativePath, count: lcpImages.length });
  if (highPriority.length !== 1) addFailure("invalid-high-priority-image-count", { file: relativePath, count: highPriority.length });
  for (const image of lcpImages) {
    if (String(image.attrs.loading || "").toLowerCase() !== "eager") addFailure("lcp-image-not-eager", { file: relativePath });
    if (String(image.attrs.fetchpriority || "").toLowerCase() !== "high") addFailure("lcp-image-not-high-priority", { file: relativePath });
    if (!/^\d+$/.test(image.attrs.width || "") || !/^\d+$/.test(image.attrs.height || "")) {
      addFailure("lcp-image-missing-dimensions", { file: relativePath });
    }
  }
}

for (const relativePath of ["projects/index.html", "projects.html"]) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (/projects handled by Oz Timber Floor/i.test(html)) addFailure("unsupported-project-provenance", { file: relativePath });
}

const css = fs.readFileSync(path.join(root, "assets", "site.css"), "utf8");
if (!/env\(safe-area-inset-bottom\)/.test(css)) addFailure("missing-safe-area-css");
if (!/img\[src\*=["']\/products\/["']\][\s\S]*?filter:\s*none\s*!important[\s\S]*?opacity:\s*1[\s\S]*?mix-blend-mode:\s*normal/.test(css)) {
  addFailure("missing-product-image-neutrality-guard");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (Object.keys(packageJson.dependencies || {}).length || Object.keys(packageJson.devDependencies || {}).length) {
  addFailure("unexpected-runtime-or-development-dependency");
}

let browserReport = null;
if (!fs.existsSync(browserReportPath)) {
  addFailure("browser-report-missing", { file: path.relative(root, browserReportPath) });
} else {
  browserReport = JSON.parse(fs.readFileSync(browserReportPath, "utf8"));
  if (browserReport.schemaVersion !== 1) addFailure("browser-report-schema", { value: browserReport.schemaVersion });
  if (browserReport.success !== true || browserReport.failures?.length) addFailure("browser-report-failed");
  for (const required of ["assets/site.js", "assets/site.css", "assets/contact-config.js", "_redirects", "index.html"]) {
    if (!browserReport.sourceHashes?.[required]) addFailure("browser-source-binding-missing", { file: required });
  }

  for (const [relativePath, expectedHash] of Object.entries(browserReport.sourceHashes || {})) {
    const absolutePath = path.join(root, relativePath);
    const actualHash = fs.existsSync(absolutePath) ? sha256(fs.readFileSync(absolutePath)) : null;
    if (actualHash !== expectedHash) addFailure("browser-report-stale", { file: relativePath });
  }

  const matrix = Array.isArray(browserReport.routeMatrix) ? browserReport.routeMatrix : [];
  for (const route of requiredRoutes) {
    for (const viewport of requiredViewports) {
      const cell = matrix.find((entry) => entry.route === route && `${entry.viewport?.width}x${entry.viewport?.height}` === viewport);
      if (!cell) addFailure("browser-matrix-cell-missing", { route, viewport });
      else {
        if (!cell.success) addFailure("browser-matrix-cell-failed", { route, viewport, detail: cell });
        if (cell.scrollY !== 0) addFailure("browser-matrix-not-at-page-top", { route, viewport, scrollY: cell.scrollY });
        if (!cell.header || Math.abs(cell.header.top) >= 1 || cell.header.height < 60) {
          addFailure("browser-matrix-header-not-visible", { route, viewport, header: cell.header ?? null });
        }
        if (!cell.brand || cell.brand.top < 0 || cell.brand.bottom > (cell.header?.bottom ?? 0) + 1) {
          addFailure("browser-matrix-brand-not-visible", { route, viewport, brand: cell.brand ?? null });
        }
        if (cell.visibleImagesReady !== true) addFailure("browser-matrix-visible-image-not-ready", { route, viewport });
      }
    }
  }

  for (const width of [320, 390, 768]) {
    const interaction = (browserReport.mobileInteractions || []).find((entry) => entry.width === width);
    if (!interaction) addFailure("mobile-interaction-missing", { width });
    else if (!interaction.success) addFailure("mobile-interaction-failed", { width, detail: interaction });
  }

  const fidelityTests = browserReport.productImageStyles || [];
  if (fidelityTests.length < 2) addFailure("product-image-style-coverage-low", { count: fidelityTests.length });
  for (const test of fidelityTests) if (!test.success) addFailure("product-image-style-failed", { detail: test });

  const dockTests = browserReport.dockTests || [];
  for (const width of [320, 390]) {
    const dock = dockTests.find((entry) => entry.width === width && entry.route === "/products/avala-blackbutt/");
    if (!dock) addFailure("dock-test-missing", { width });
    else if (!dock.success) addFailure("dock-test-failed", { width, detail: dock });
  }

  if (!browserReport.contact?.success) addFailure("contact-browser-test-failed", { detail: browserReport.contact });
}

if (failures.length) {
  process.stderr.write(`${JSON.stringify({ verdict: "FAIL", failures }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `UI QA PASS: ${requiredRoutes.length * requiredViewports.length} responsive cells, 3 mobile interaction widths, ${browserReport.productImageStyles.length} image-style checks and ${lcpFiles.length} LCP outputs.\n`,
  );
}
