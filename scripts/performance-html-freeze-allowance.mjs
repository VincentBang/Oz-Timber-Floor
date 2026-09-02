import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { priorityPublicationPages } from "./image-dimension-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const performanceAllowancePath = path.join(root, "docs/performance/generated/seo-freeze-performance-allowance.json");

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function normalizePerformanceImageAttributes(html) {
  return String(html).replace(/<img\b[^>]*>/gi, (tag) => {
    let normalized = tag;
    for (const name of ["width", "height", "loading", "fetchpriority", "decoding"]) {
      normalized = normalized.replace(
        new RegExp(`\\s+${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "gi"),
        "",
      );
    }
    normalized = normalized.replace(
      /\s+data-lcp-image(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
      "",
    );
    return normalized.replace(/\s+(\/?>)$/, "$1");
  });
}

export function verifiedPerformanceAllowances() {
  if (!fs.existsSync(performanceAllowancePath)) return { file: performanceAllowancePath, routes: new Map(), issues: ["allowance file is missing"] };
  const report = JSON.parse(fs.readFileSync(performanceAllowancePath, "utf8"));
  const routes = new Map();
  const issues = [];
  for (const entry of report.routes ?? []) {
    const currentPath = path.join(root, entry.file);
    if (!fs.existsSync(currentPath)) {
      issues.push(`${entry.route}: current owner file is missing`);
      continue;
    }
    const current = fs.readFileSync(currentPath, "utf8");
    const currentRawSha256 = sha256(current);
    const currentNormalizedSha256 = sha256(normalizePerformanceImageAttributes(current));
    if (currentNormalizedSha256 !== entry.baselineNormalizedSha256) {
      issues.push(`${entry.route}: HTML differs beyond allowed image performance attributes`);
      continue;
    }
    routes.set(entry.route, {
      ...entry,
      currentRawSha256,
      currentNormalizedSha256,
    });
  }
  return { file: performanceAllowancePath, routes, issues };
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function writeAllowance() {
  const baselineRoot = path.resolve(argument("--baseline-root"));
  if (!baselineRoot || !fs.existsSync(baselineRoot)) throw new Error("--baseline-root must point to the reconstructed pre-task worktree");
  const { pages } = priorityPublicationPages();
  const routes = pages.map((page) => {
    const baselinePath = path.join(baselineRoot, page.file);
    const currentPath = path.join(root, page.file);
    if (!fs.existsSync(baselinePath)) throw new Error(`${page.route}: baseline owner is missing at ${baselinePath}`);
    const baseline = fs.readFileSync(baselinePath, "utf8");
    const current = fs.readFileSync(currentPath, "utf8");
    const baselineNormalizedSha256 = sha256(normalizePerformanceImageAttributes(baseline));
    const currentNormalizedSha256 = sha256(normalizePerformanceImageAttributes(current));
    if (baselineNormalizedSha256 !== currentNormalizedSha256) {
      throw new Error(`${page.route}: current HTML differs from the pre-task owner beyond allowed performance attributes`);
    }
    return {
      route: page.route,
      file: page.file,
      baselineRawSha256: sha256(baseline),
      baselineNormalizedSha256,
      currentRawSha256: sha256(current),
      currentNormalizedSha256,
      verifiedPerformanceOnly: true,
    };
  });
  const report = {
    schemaVersion: 1,
    task: "OZ-PERF-002",
    purpose: "Preserve the authorised SEO-freeze difference set while proving priority-route HTML changed only through allowed image performance attributes.",
    ignoredImageAttributes: ["width", "height", "loading", "fetchpriority", "decoding", "data-lcp-image"],
    routes,
  };
  fs.mkdirSync(path.dirname(performanceAllowancePath), { recursive: true });
  fs.writeFileSync(performanceAllowancePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PERF HTML FREEZE ALLOWANCE WRITTEN routes=${routes.length} verified=${routes.filter((route) => route.verifiedPerformanceOnly).length}`);
}

function checkAllowance() {
  const result = verifiedPerformanceAllowances();
  if (result.issues.length || result.routes.size !== 15) {
    console.error(`PERF HTML FREEZE ALLOWANCE FAILED issues=${result.issues.length} verifiedRoutes=${result.routes.size}`);
    for (const issue of result.issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log(`PERF HTML FREEZE ALLOWANCE PASSED routes=${result.routes.size}`);
  }
}

if (process.argv.includes("--write")) writeAllowance();
else checkAllowance();
