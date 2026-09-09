import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "docs/seo-migration/OZ-MIG-004");
fs.mkdirSync(outDir, { recursive: true });
const observedAt = "2026-09-09";
const httpPath = process.env.OZ_MIG_004_HTTP_EVIDENCE || "/tmp/oz-mig-004-20260909-8GQjGJ/http-current-state.json";
const http = JSON.parse(fs.readFileSync(httpPath, "utf8"));
const equityPath = path.join(root, "docs/seo-migration/generated/gsc-equity-map-2026-09-01.csv");
const manualPath = path.join(root, "docs/seo-migration/generated/catalogue-equity-manual-review-2026-09-01.csv");
const migrationReport = JSON.parse(fs.readFileSync(path.join(root, "docs/seo-migration/generated/migration-readiness-report.json"), "utf8"));
const newlyClassifiedCatalogueRoutes = (migrationReport.issues || [])
  .filter((issue) => issue.code === "catalogue-quality-page-still-indexable")
  .map((issue) => issue.route)
  .sort();

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ""; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((item) => item.some(Boolean)).map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] || ""])));
}

function csvValue(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(name, headers, rows) {
  const content = [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n") + "\n";
  fs.writeFileSync(path.join(outDir, name), content);
}

const equity = parseCsv(fs.readFileSync(equityPath, "utf8"));
const equityByPath = new Map(equity.map((row) => [row.old_path, row]));
const routeFamilies = [
  ["route-floor-levelling", "Floor levelling", "/floor-levelling/", "/floor-levelling-sydney/", 335, 2184],
  ["route-hybrid", "Hybrid flooring", "/hybrid/", "/hybrid-flooring-sydney/", 337, 2187],
  ["route-laminate", "Laminate flooring", "/laminate/", "/laminate-flooring-sydney/", 337, 2182],
  ["route-engineered", "Engineered timber", "/engineered-timber-flooring/", "/engineered-timber-flooring-sydney/", 277, 2187],
  ["route-installation", "Installation", "/timber-floor-installation/", "/timber-flooring-installation-sydney/", 338, 2182],
  ["route-commercial", "Commercial flooring", "/commercial-flooring/", "/commercial-flooring-sydney/", 337, 2181],
  ["route-office", "Office flooring", "/office-flooring/", "/office-flooring-sydney/", 338, 20],
  ["route-solid", "Solid timber", "/solid-timber/", "/solid-timber-flooring-sydney/", 339, 2181],
  ["route-vinyl", "Vinyl flooring", "/vinyl/", "/vinyl-flooring-sydney/", 338, 2181],
];

function currentResult(site, route) {
  return http.results.find((item) => item.site === site && item.route === route);
}

const commonTests = [
  "selected owner 200/self-canonical/no effective noindex in isolated production fixture",
  "alias one-hop permanent redirect preserving query parameters",
  "redirect graph has no loop, chain, missing or noindex destination",
  "sitemap contains owner and excludes alias",
  "title, description, H1, JSON-LD and internal links use selected owner",
];

const proposals = routeFamilies.map(([id, intent, oldOwner, candidate, internalLinks, impactedFiles]) => {
  const row = equityByPath.get(oldOwner) || {};
  return {
    id,
    scope: "launch-critical",
    intent,
    evidence: [
      `2026-09-09 WordPress GET: ${oldOwner} is canonical 200`,
      `2026-09-09 WordPress GET: ${candidate} is 404`,
      `2026-09-09 Netlify GET: ${oldOwner} redirects/rewrite-resolves to staging-only ${candidate}`,
      `GSC export window: ${row.clicks || 0} clicks, ${row.impressions || 0} impressions`,
      `2026-05-18 target-page export: ${internalLinks} historical internal links`,
    ],
    old_owner: oldOwner,
    current_candidate_owner: candidate,
    selected_owner: oldOwner,
    action: "serve the preserved redesigned content at the established WordPress owner; permanently redirect the staging-only candidate to it",
    aliases: [candidate],
    exact_redirect_changes: [{ from: oldOwner, remove_or_reverse: true }, { from: candidate, to: oldOwner, status: 301, force: true }],
    canonical_changes: [{ from: candidate, to: oldOwner }],
    sitemap_delta: { remove: [candidate], add: [oldOwner], net: 0 },
    indexation_delta: { remove_indexable_owner: [candidate], add_indexable_owner: [oldOwner], net: 0 },
    affected_files: ["_redirects", "sitemap.xml", "data/seo-keyword-ownership.json", "data/seo-migration-redirect-expectations.json", "scripts/priority-route-performance-check.mjs", `${candidate.replace(/^\//, "").replace(/\/$/, "")}.html`, `${candidate.replace(/^\//, "")}index.html`],
    affected_file_discovery: { token: candidate, current_non_dist_file_count: impactedFiles },
    GSC_clicks: Number(row.clicks || 0),
    GSC_impressions: Number(row.impressions || 0),
    backlink_evidence: { supplied_external_target_count: "not available at route level", historical_internal_links: internalLinks },
    content_equivalence: "same commercial intent; redesigned candidate content can be served at the established owner without losing the completed UI/content work",
    uncertainty: "Provider Pretty URL and forced-rule order must be verified in an isolated fixture and again after any separately approved deploy.",
    tests: commonTests,
    rollback: `Restore the current ${oldOwner} -> ${candidate} rule, candidate canonical and sitemap owner from the pre-change patch; rebuild and rerun the full route matrix.`,
  };
});

const bambooAliases = fs.readFileSync(path.join(root, "_redirects"), "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && /bamboo|verdura/i.test(line) && !line.startsWith("#"))
  .map((line) => line.split(/\s+/)[0]);
proposals.push({
  id: "bamboo-retirement-contract",
  scope: "launch-critical",
  intent: "Retired Bamboo catalogue",
  evidence: ["AGENTS.md requires Bamboo to remain retired and public Bamboo pages not to be restored", `Current _redirects contains ${bambooAliases.length} Bamboo/Verdura rules`, "GSC /bamboo/ row: 4 clicks and 3,517 impressions", "Current destination is indexable but is not an exact Bamboo equivalent"],
  old_owner: "/bamboo/",
  current_candidate_owner: "/hardwood-timber-flooring-sydney/",
  selected_owner: "/hardwood-timber-flooring-sydney/",
  action: "retain retirement redirects and no public Bamboo landing page; require route-level evidence before any future 404/410 or alternative-category remap",
  aliases: bambooAliases,
  exact_redirect_changes: [],
  canonical_changes: [],
  sitemap_delta: { remove: [], add: [], net: 0 },
  indexation_delta: { remove: [], add: [], net: 0 },
  affected_files: ["_redirects", "data/seo-migration-redirect-expectations.json"],
  GSC_clicks: 4,
  GSC_impressions: 3517,
  backlink_evidence: { supplied_external_target_count: "not resolved to individual Bamboo URLs" },
  content_equivalence: "retirement alternative, not an exact product/category equivalent",
  uncertainty: "High; business confirmation of the preferred customer alternative remains absent.",
  tests: ["all listed aliases remain one hop", "destination is indexable", "no Bamboo URL enters sitemap", "no public Bamboo marketing page is created"],
  rollback: "Restore the current redirect block and rerun representative Bamboo/Verdura redirect tests.",
});

proposals.push({
  id: "catalogue-indexation-control",
  scope: "launch-critical",
  intent: "Remaining catalogue quality and evidence queue",
  evidence: ["2,115 catalogue pages: 893 currently indexable and 1,222 currently controlled/noindex", `${newlyClassifiedCatalogueRoutes.length} currently indexable cross-contaminated Hardwood Collection product routes are now deterministically classified needs-data after field repair`, "None of those newly classified routes is a current direct _redirects destination", "632 initial redirect destinations plus four forced aliases were previously reconciled and must remain protected", "60 priority rows reviewed; 361 historical indexable findings were quality flags, not 361 proven blockers"],
  old_owner: null,
  current_candidate_owner: null,
  selected_owner: null,
  action: `approve controlled noindex/schema/sitemap treatment for the ${newlyClassifiedCatalogueRoutes.length} exact cross-contaminated Hardwood Collection routes listed here; retain the verified 12-colour range and all other current route-level controls; prohibit any bulk treatment of the protected 632-destination cohort`,
  aliases: [], exact_redirect_changes: [], canonical_changes: [], sitemap_delta: { remove: newlyClassifiedCatalogueRoutes, add: [], net: -newlyClassifiedCatalogueRoutes.length }, indexation_delta: { add_noindex: newlyClassifiedCatalogueRoutes, remove_noindex: [], net_indexable: -newlyClassifiedCatalogueRoutes.length },
  affected_files: ["data/catalogue-quality-overrides.json", "sitemap.xml", ...newlyClassifiedCatalogueRoutes.map((route) => `${route.replace(/^\//, "")}index.html`)],
  GSC_clicks: null, GSC_impressions: null,
  backlink_evidence: { supplied_external_target_count: "incomplete; absence from 130-row GSC map is not proof of no equity" },
  content_equivalence: "The 172 route identities are not supported by the current 12-colour supplier set and therefore cannot remain factual product owners without new evidence.",
  uncertainty: "The supplier set may change later; reindex only after exact current product evidence and image identity are approved.",
  tests: ["exact 172-route fixture and negative fixture", "zero redirect destinations are page-level noindex", "controlled pages excluded from sitemap and Product schema removed", "verified 12 Hardwood Collection products and range remain indexable", "all other publication counts unchanged"],
  rollback: "Restore the per-route override and redirect entries for the affected cohort only.",
});

proposals.push({
  id: "supplier-page-ownership",
  scope: "launch-critical",
  intent: "Six category/supplier owner pairs",
  evidence: ["Current hardening report: 6 of 6 pairs differentiated", "Each supplier page retains stock, batch, quantity, pickup, delivery, lead-time and supply-only signals", "Zero title/H1 keyword-owner collisions"],
  old_owner: null, current_candidate_owner: "six existing supplier pages", selected_owner: "keep all six differentiated supplier pages separate",
  action: "no consolidation or canonical merge",
  aliases: [], exact_redirect_changes: [], canonical_changes: [], sitemap_delta: { remove: [], add: [], net: 0 }, indexation_delta: { remove: [], add: [], net: 0 },
  affected_files: ["data/seo-keyword-ownership.json", "docs/seo-migration/KEYWORD_OWNERSHIP_MAP_2026-09-01.md"],
  GSC_clicks: null, GSC_impressions: null, backlink_evidence: { status: "not required for no-change decision" },
  content_equivalence: "different user purpose: category comparison versus supply-side enquiry",
  uncertainty: "Reassess only if real traffic/content evidence later shows overlap.",
  tests: ["six pairs remain differentiated", "zero owner collisions", "supplier pages retain at least three supply-side signals"],
  rollback: "No implementation change proposed.",
});

proposals.push({
  id: "service-area-hub",
  scope: "optional-growth",
  intent: "Sydney service-area coverage",
  evidence: ["Existing homepage/services/contact structure already states Sydney service coverage", "GSC place queries indicate visibility but do not prove offices or completed projects", "No approved evidence currently supports a new indexable location hub"],
  old_owner: null, current_candidate_owner: null, selected_owner: null,
  action: "do not add an indexable service-area hub in this release; use concise verified service-area copy on existing owners only",
  aliases: [], exact_redirect_changes: [], canonical_changes: [], sitemap_delta: { remove: [], add: [], net: 0 }, indexation_delta: { remove: [], add: [], net: 0 },
  affected_files: [], GSC_clicks: null, GSC_impressions: null,
  backlink_evidence: { status: "none supplied for a new hub" }, content_equivalence: "not applicable", uncertainty: "Requires approved service-area/business evidence.",
  tests: ["no auto-generated suburb pages", "no unsupported office/project claims", "homepage remains broad Sydney owner"], rollback: "No implementation change proposed.",
});

const decisionPlan = {
  schemaVersion: 1,
  task: "OZ-MIG-004",
  generatedAt: observedAt,
  startingBranch: "main",
  startingHead: "d0c66b802e544aa1a807f91798ea284c31c0998b",
  approvalState: "PENDING_VINCENT_APPROVAL",
  hashAlgorithm: "sha256 of exact DECISION_PLAN.json bytes",
  protectedChangesImplemented: false,
  proposals,
};
const decisionJson = `${JSON.stringify(decisionPlan, null, 2)}\n`;
fs.writeFileSync(path.join(outDir, "DECISION_PLAN.json"), decisionJson);
const decisionHash = crypto.createHash("sha256").update(decisionJson).digest("hex");

const summaryRows = proposals.map((item) => `| ${item.id} | ${item.scope} | ${item.selected_owner ?? "none"} | ${item.action} |`).join("\n");
fs.writeFileSync(path.join(outDir, "DECISION_PLAN.md"), `# OZ-MIG-004 protected decision plan\n\nStatus: **PENDING — no protected change implemented**\n\nManifest SHA-256: \`${decisionHash}\`\n\n| Proposal | Scope | Selected owner | Proposed action |\n| --- | --- | --- | --- |\n${summaryRows}\n\nThe nine launch-critical route proposals retain the established WordPress owner and move the completed redesigned content onto it. The newer staging path becomes the direct permanent alias. Bamboo remains retired, current catalogue controls remain route-specific, all six supplier pages remain differentiated, and no indexable service-area hub is proposed.\n\nApproval phrase:\n\n\`APPROVE OZ-MIG-004 DECISION PLAN ${decisionHash}\`\n`);

const parityRoutes = ["/", ...routeFamilies.flatMap((item) => [item[2], item[3]]), "/about-us/", "/about/", "/contact-us/", "/contact/", "/blogs/", "/guides/", "/bamboo/", "/ranges/oakleaf/", "/ranges/hardwood-collection/"];
const parity = parityRoutes.map((route) => {
  const wp = currentResult("wordpress-production", route);
  const nf = currentResult("netlify-deployment", route);
  const localPath = route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`;
  const flat = `${route.replace(/^\//, "").replace(/\/$/, "")}.html`;
  const source = fs.existsSync(path.join(root, localPath)) ? localPath : fs.existsSync(path.join(root, flat)) ? flat : "";
  const protectedFamily = routeFamilies.find((item) => item[2] === route || item[3] === route);
  const isCandidate = protectedFamily?.[3] === route;
  const topic = route === "/" ? "broad Sydney flooring supply, installation, preparation, categories and enquiry"
    : protectedFamily ? protectedFamily[1]
      : route.includes("about") ? "business identity and trust"
        : route.includes("contact") ? "enquiry types, direct contact and qualification fields"
          : route.includes("blog") || route.includes("guide") ? "buyer education and guide discovery"
            : route === "/bamboo/" ? "retired Bamboo intent"
              : route.includes("hardwood-collection") ? "Hardwood Collection range, colours, dimensions and enquiry"
                : "Oakleaf range, products and enquiry";
  const action = protectedFamily ? (isCandidate ? "KEEP_CONTENT_PENDING_OWNER_DECISION" : "RESTORE_CONTENT_TO_OWNER_AFTER_APPROVAL")
    : route === "/bamboo/" ? "KEEP_RETIRED"
      : route === "/ranges/hardwood-collection/" ? "IMPROVE_VERIFIED_LOCAL"
        : "KEEP";
  return {
    route, wordpress_status: wp?.finalStatus ?? "not-observed", wordpress_final_url: wp?.finalUrl ?? "", wordpress_canonical: wp?.canonical ?? "",
    local_source: source || "redirect-only-or-missing", netlify_status: nf?.finalStatus ?? "not-observed", netlify_final_url: nf?.finalUrl ?? "", netlify_canonical: nf?.canonical ?? "", netlify_x_robots: nf?.chain?.at(-1)?.headers?.xRobotsTag ?? "",
    parity_status: wp?.finalStatus === 200 && nf?.finalStatus === 200 && wp?.canonical === nf?.canonical ? "ALIGNED" : wp?.finalStatus === 200 && nf?.canonical && wp?.canonical !== nf?.canonical ? "PROTECTED_OWNER_DECISION" : "EXPECTED_PLATFORM_DIFFERENCE",
    old_main_topic: topic,
    current_coverage: route === "/bamboo/" ? "retirement redirect; no public Bamboo marketing page" : source ? "local source present; direct Netlify response inspected" : "route/redirect evidence only",
    accuracy_status: route === "/ranges/hardwood-collection/" ? "FIXED_LOCAL_NOT_PROVEN_DEPLOYED" : protectedFamily ? "CONTENT_PRESENT_OWNER_PENDING" : "NO_CURRENT_DEFECT_REPRODUCED",
    commercial_usefulness: route === "/bamboo/" ? "alternative-category handoff only" : "customer-facing browse/contact path retained",
    action,
    evidence: `2026-09-09 bounded GET plus ${source || "redirect map"}`,
  };
});
writeCsv("CONTENT_PARITY.csv", Object.keys(parity[0]), parity);

const manual = parseCsv(fs.readFileSync(manualPath, "utf8"));
const remediation = manual.map((row, index) => {
  const clicks = Number(row.clicks || 0), impressions = Number(row.impressions || 0);
  const decision = row.recommended_decision;
  const pending = decision === "manual-product-decision";
  return {
    priority: index + 1, old_url: row.old_url, clicks, impressions, current_redirect_target: row.current_redirect_target,
    candidate_exact_route: row.candidate_exact_route, candidate_indexability: row.candidate_indexability, quality_issues: row.quality_issues,
    reviewed_disposition: pending ? "INCOMPLETE_BUT_VALUABLE_RETAIN_CURRENT_CONTROL" : decision === "redirect-exact" ? "VERIFIED_CURRENT_EQUIVALENT_RETAIN_EXACT" : "RETAIN_REVIEWED_CURRENT_DESTINATION",
    severity: clicks >= 5 || impressions >= 1000 ? "HIGH" : clicks > 0 ? "MEDIUM" : "LOW",
    commercial_exposure: `${clicks} clicks / ${impressions} impressions in supplied 12-month GSC export`,
    implementation_status: "NO_PROTECTED_CHANGE_THIS_TASK",
    corrected_fields: "none; this row records URL/equity disposition, not unsupported product enrichment",
    provenance: "supplied 2026-09-01 GSC workbook plus current local route/redirect inspection",
    unresolved_facts: row.data_required,
    indexation_decision: "retain current route-level state until the exact protected decision is approved",
    redirect_decision: pending ? "retain current control pending exact mapping evidence" : row.recommended_decision,
    next_evidence: row.data_required,
    rationale: row.rationale,
  };
});
writeCsv("CATALOGUE_REMEDIATION.csv", Object.keys(remediation[0]), remediation);

const httpSummary = {
  schemaVersion: 1,
  generatedAt: http.generatedAt,
  evidenceFile: "private task snapshot; full bodies and JSON-LD excluded from public package",
  origins: http.origins,
  totals: Object.fromEntries(http.origins.map((origin) => {
    const rows = http.results.filter((item) => item.site === origin.label);
    return [origin.label, { requests: rows.length, errors: rows.filter((item) => item.error).length, finalStatusCounts: Object.fromEntries([...new Set(rows.map((item) => item.finalStatus))].map((status) => [status, rows.filter((item) => item.finalStatus === status).length])) }];
  })),
  routeEvidence: http.results.map((item) => ({ site: item.site, route: item.route, chain: item.chain, finalUrl: item.finalUrl, finalStatus: item.finalStatus, bodySha256: item.bodySha256, title: item.title, description: item.description, h1: item.h1, canonical: item.canonical, metaRobots: item.metaRobots, mainHeadings: item.headings?.slice(0, 12) || [] })),
};
fs.writeFileSync(path.join(outDir, "HTTP_RECONCILIATION_SUMMARY.json"), `${JSON.stringify(httpSummary, null, 2)}\n`);

const screenshotRoot = path.join(outDir, "screenshots");
const captureEvidencePath = path.join(outDir, "SCREENSHOT_CAPTURE_EVIDENCE.json");
const captureEvidence = fs.existsSync(captureEvidencePath) ? JSON.parse(fs.readFileSync(captureEvidencePath, "utf8")) : null;
const screenshotFiles = [];
if (fs.existsSync(screenshotRoot)) {
  for (const state of ["before", "after"]) {
    const stateDir = path.join(screenshotRoot, state);
    for (const name of fs.readdirSync(stateDir).filter((file) => file.endsWith(".png")).sort()) {
      const bytes = fs.readFileSync(path.join(stateDir, name));
      screenshotFiles.push({
        state,
        file: `screenshots/${state}/${name}`,
        width: bytes.readUInt32BE(16),
        height: bytes.readUInt32BE(20),
        bytes: bytes.length,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      });
    }
  }
}
fs.writeFileSync(path.join(outDir, "SCREENSHOT_MANIFEST.json"), `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: observedAt,
  baseline: { branch: "main", head: "d0c66b802e544aa1a807f91798ea284c31c0998b" },
  routes: captureEvidence ? [...new Set(captureEvidence.captures.map((capture) => capture.route))] : [],
  viewports: ["1440x1000", "390x844", "320x800"],
  expectedCaptures: 30,
  captured: screenshotFiles.length,
  captureProvenance: captureEvidence,
  files: screenshotFiles,
}, null, 2)}\n`);

const taskManifestPath = "docs/seo-migration/OZ-MIG-004/TASK_FILE_MANIFEST.txt";
const taskFiles = new Set([
  ...execFileSync("git", ["diff", "--name-only", "d0c66b802e544aa1a807f91798ea284c31c0998b", "--"], { cwd: root, encoding: "utf8" }).split(/\r?\n/),
  ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split(/\r?\n/),
].filter(Boolean));
taskFiles.add(taskManifestPath);
fs.writeFileSync(path.join(root, taskManifestPath), `${[...taskFiles].sort().join("\n")}\n`);

console.log(`OZ-MIG-004 artifacts generated decisionHash=${decisionHash} parityRows=${parity.length} catalogueRows=${remediation.length} screenshots=${screenshotFiles.length} taskFiles=${taskFiles.size}`);
