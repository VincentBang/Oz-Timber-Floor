import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildImageDimensionReport, priorityRoutes } from "./image-dimension-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "docs/release/OZ-RELEASE-CLOSEOUT/generated/performance/priority-route-performance.json");
const expectedWidths = Object.freeze([320, 390, 768, 1024, 1440]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => typeof a === "number" ? a - b : String(a).localeCompare(String(b)));
}

function phaseSummary(records, consoleErrors) {
  const missingByRoute = {};
  for (const route of priorityRoutes.map((entry) => entry.route)) {
    missingByRoute[route] = unique(records.filter((record) => record.url === route).map((record) => record.missingDims));
  }
  return {
    records: records.length,
    routes: unique(records.map((record) => record.url)).length,
    widths: unique(records.map((record) => record.viewport?.w)),
    consoleErrors,
    overflowRecords: records
      .filter((record) => Number(record.overflow) > 0)
      .map((record) => ({ route: record.url, width: record.viewport?.w, pixels: record.overflow })),
    missingDimensionsByRoute: missingByRoute,
    lazyPrimaryCandidates: records
      .filter((record) => record.candidate?.loading === "lazy")
      .map((record) => ({ route: record.url, width: record.viewport?.w, src: record.candidate.src })),
  };
}

function routeWidthKey(record) {
  return `${record.url}|${record.viewport?.w}`;
}

function buildComparison(before, after) {
  const beforeByKey = new Map(before.map((record) => [routeWidthKey(record), record]));
  return after.map((record) => {
    const prior = beforeByKey.get(routeWidthKey(record));
    return {
      route: record.url,
      width: record.viewport?.w,
      candidateBefore: prior?.candidate?.src ?? null,
      candidateAfter: record.candidate?.src ?? null,
      missingDimensionsBefore: prior?.missingDims ?? null,
      missingDimensionsAfter: record.missingDims,
      overflowBefore: prior?.overflow ?? null,
      overflowAfter: record.overflow,
      highPriorityImagesBefore: prior?.highCount ?? null,
      highPriorityImagesAfter: record.highCount,
    };
  }).sort((a, b) => a.route.localeCompare(b.route) || a.width - b.width);
}

function loadRecords(filePath, label) {
  if (!filePath) throw new Error(`${label} browser evidence path is required`);
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(value)) throw new Error(`${label} browser evidence must be a JSON array`);
  return value;
}

function validateMatrix(records, label) {
  const issues = [];
  const expectedRoutes = priorityRoutes.map((entry) => entry.route);
  const routes = unique(records.map((record) => record.url));
  const widths = unique(records.map((record) => record.viewport?.w));
  if (records.length !== expectedRoutes.length * expectedWidths.length) issues.push(`${label}: expected 75 records; found ${records.length}`);
  if (JSON.stringify(routes) !== JSON.stringify([...expectedRoutes].sort())) issues.push(`${label}: route set differs from the 15-route allowlist`);
  if (JSON.stringify(widths) !== JSON.stringify(expectedWidths)) issues.push(`${label}: viewport widths differ from ${expectedWidths.join(",")}`);
  for (const route of expectedRoutes) {
    for (const width of expectedWidths) {
      const count = records.filter((record) => record.url === route && record.viewport?.w === width).length;
      if (count !== 1) issues.push(`${label}: ${route} at ${width}px has ${count} records`);
    }
  }
  return issues;
}

function writeReport() {
  const currentOnly = Boolean(argument("--current"));
  const before = currentOnly ? [] : loadRecords(argument("--baseline"), "baseline");
  const after = loadRecords(argument("--current") || argument("--final"), "final");
  const beforeConsoleErrors = Number(argument("--baseline-console-errors") || 0);
  const afterConsoleErrors = Number(argument("--final-console-errors") || 0);
  const matrixIssues = [...(currentOnly ? [] : validateMatrix(before, "baseline")), ...validateMatrix(after, "final")];
  if (matrixIssues.length) throw new Error(matrixIssues.join("\n"));
  const staticAudit = buildImageDimensionReport();
  if (currentOnly) {
    for (const record of after) {
      const owner = staticAudit.routes.find((entry) => entry.route === record.url);
      if (!record.measuredAt || record.sourceSha256 !== owner?.ownerSha256) {
        throw new Error(`Browser measurement/source fingerprint missing or stale for ${record.url}`);
      }
    }
  }
  const report = {
    evidenceMode: currentOnly ? "current-closeout" : "before-after",
    schemaVersion: 1,
    task: currentOnly ? "OZ-RELEASE-CLOSEOUT" : "OZ-PERF-002",
    baseUrl: argument("--base-url") || "http://127.0.0.1:8766",
    redirectAware: true,
    routeResolution: "scripts/publication-inventory.mjs exact-200-rewrite owners",
    requestedViewportWidths: expectedWidths,
    staticAudit: {
      summary: staticAudit.summary,
      owners: staticAudit.routes.map((route) => ({
        route: route.route,
        file: route.file,
        ownershipRule: route.ownershipRule,
        ownerSha256: route.ownerSha256,
        primarySrc: route.primarySrc,
        primaryImage: route.primaryImage,
      })),
    },
    browser: {
      baseline: phaseSummary(before, beforeConsoleErrors),
      final: phaseSummary(after, afterConsoleErrors),
      comparison: buildComparison(before, after),
      baselineRecords: before,
      finalRecords: after,
    },
  };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PERF PRIORITY REPORT WRITTEN routes=${report.browser.final.routes} captures=${report.browser.final.records} widths=${report.browser.final.widths.join(",")}`);
}

function checkReport() {
  const failures = [];
  if (!fs.existsSync(reportPath)) failures.push("priority-route-performance.json is missing; run with --write and browser evidence");
  const current = buildImageDimensionReport();
  if (current.summary.routesWithIssues) failures.push(`current static image audit has ${current.summary.routesWithIssues} routes with issues`);
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    if (report.evidenceMode !== "current-closeout") failures.push(...validateMatrix(report.browser?.baselineRecords ?? [], "baseline"));
    failures.push(...validateMatrix(report.browser?.finalRecords ?? [], "final"));
    if (report.browser?.final?.overflowRecords?.length) failures.push(`${report.browser.final.overflowRecords.length} final browser records overflow horizontally`);
    if (Number(report.browser?.final?.consoleErrors) !== 0) failures.push(`final browser run has ${report.browser.final.consoleErrors} console errors`);
    const finalRecords = report.browser?.finalRecords ?? [];
    if (finalRecords.some((record) => Number(record.overflow) > 0)) failures.push("raw browser records contain horizontal overflow");
    if (report.evidenceMode === "current-closeout" && finalRecords.some((record) => !Number.isFinite(record.consoleErrors) || record.consoleErrors !== 0 || !Number.isFinite(record.failedRequests) || record.failedRequests !== 0)) failures.push("raw current browser records contain missing or failing console/network results");
    if (report.evidenceMode === "current-closeout" && finalRecords.some((record) => !record.measuredAt || !record.sourceSha256)) failures.push("current measurements must retain their timestamp and observed source hash");
    if (finalRecords.some((record) => Number(record.missingDims) !== 0)) failures.push("final browser matrix contains missing image dimensions");
    if (finalRecords.some((record) => Number(record.highCount) !== 1)) failures.push("final browser matrix does not have exactly one high-priority image on every route");
    const recordedOwners = new Map((report.staticAudit?.owners ?? []).map((owner) => [owner.route, owner.ownerSha256]));
    for (const route of current.routes) {
      if (recordedOwners.get(route.route) !== route.ownerSha256) failures.push(`${route.route}: publication-owner hash differs from browser evidence`);
      if (report.evidenceMode === "current-closeout" && finalRecords.filter((record) => record.url === route.route).some((record) => record.sourceSha256 !== route.ownerSha256)) failures.push(`${route.route}: raw browser source hash differs from current owner`);
    }
  }
  if (failures.length) {
    console.error(`PERF PRIORITY ROUTES FAILED (${failures.length})`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`PERF PRIORITY ROUTES PASSED routes=${priorityRoutes.length} captures=75 widths=${expectedWidths.join(",")} report=${path.relative(root, reportPath)}`);
  }
}

if (process.argv.includes("--write")) writeReport();
else checkReport();
