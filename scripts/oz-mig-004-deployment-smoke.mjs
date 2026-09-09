import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Read-only deployment verification. No forms, provider settings or DNS writes.
const base = process.argv[2] || "https://oztimberfloor.netlify.app";
const origin = new URL(base);
assert.equal(origin.protocol, "https:");
assert.match(origin.hostname, /^(?:[a-z0-9-]+--)?oztimberfloor\.netlify\.app$/);
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const rows = [];
const failures = [];
async function inspect(route, status = 200, expectedLocation = null) {
  const response = await fetch(new URL(route, origin), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const text = bytes.toString("utf8");
  const row = { route, status: response.status, expectedStatus: status, noindex: response.headers.get("x-robots-tag"), location: response.headers.get("location"), sha256: sha(bytes) };
  if (response.status !== status) failures.push(`${route}: status ${response.status}, expected ${status}`);
  if (!/noindex/i.test(row.noindex || "")) failures.push(`${route}: global noindex missing`);
  // Netlify pretty URLs normalize these existing locations without the terminal slash.
  if (expectedLocation && new URL(row.location || route, origin).pathname.replace(/\/$/, "") !== expectedLocation.replace(/\/$/, "")) failures.push(`${route}: unexpected redirect ${row.location}`);
  if (status === 200 && route.endsWith("/")) {
    if ((text.match(/<h1\b/gi) || []).length !== 1) failures.push(`${route}: H1 count`);
    if ((text.match(/<link\b[^>]*rel=["']canonical["']/gi) || []).length !== 1) failures.push(`${route}: canonical count`);
  }
  rows.push(row);
  return text;
}
for (const route of ["/", "/products/", "/ranges/", "/floor-levelling-sydney/", "/laminate-flooring-sydney/", "/engineered-timber-flooring-sydney/", "/products/hardwood-collection-forest-oak/", "/guides/choosing-office-flooring-durability-design-performance/", "/privacy/", "/terms/"]) await inspect(route);
const range = await inspect("/ranges/hardwood-collection/");
const productLinks = [...new Set([...range.matchAll(/href=["'](\/products\/hardwood-collection-[^"']+\/)["']/g)].map((match) => match[1]))];
if (productLinks.length !== 12 || !range.includes("14/3 mm") || !range.includes("190 × 1900 mm")) failures.push("Hardwood range: expected 12 verified colours and dimensions");
const contact = await inspect("/contact/");
if (!/<form\b[^>]*name=["']oz-flooring-enquiry["']/.test(contact) || !/<form\b[^>]*action=["']\/thank-you\/["']/.test(contact)) failures.push("Contact form contract changed");
for (const route of ["/thank-you/", "/products/12mm-laminate-aspen-oak/"]) {
  const html = await inspect(route);
  if (!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) failures.push(`${route}: page-level noindex missing`);
}
const sitemap = await inspect("/sitemap.xml");
if ((sitemap.match(/<loc>/g) || []).length !== 943 || /bamboo|netlify\.app|\/thank-you\//i.test(sitemap)) failures.push("Sitemap count or membership changed");
await inspect("/robots.txt");
for (const route of ["/assets/site.js", "/assets/site.css", "/assets/contact-config.js"]) {
  await inspect(route);
  if (rows.at(-1).sha256 !== sha(fs.readFileSync(path.join("dist", route)))) failures.push(`${route}: deployed bytes differ from validated package`);
}
await inspect("/floor-levelling/", 301, "/floor-levelling-sydney/");
await inspect("/product-category/bamboo/stonewood-bamboo/", 301, "/hardwood-timber-flooring-sydney/");
for (const route of ["/AGENTS.md", "/package.json", "/data/product-catalogue.json", "/docs/seo-migration/OZ-MIG-004/DECISION_PLAN.json", "/.git/config", "/netlify.toml", "/oz-mig-004-nonexistent-check/"]) await inspect(route, 404);
const evidence = { observedAt: new Date().toISOString(), base: origin.origin, verdict: failures.length ? "FAIL" : "PASS", requestCount: rows.length, rows, failures, formsSubmitted: 0 };
fs.mkdirSync(".netlify", { recursive: true });
fs.writeFileSync(".netlify/oz-mig-004-deployment-smoke.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
process.exitCode = failures.length ? 1 : 0;
