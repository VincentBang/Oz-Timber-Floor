#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const apply = process.argv.includes('--apply');
const generatedDir = path.join(root, 'docs', 'seo-migration', 'generated');
const readinessPath = path.join(generatedDir, 'migration-readiness-report.json');
const cataloguePath = path.join(generatedDir, 'catalogue-quality-report.json');

if (!fs.existsSync(readinessPath) || !fs.existsSync(cataloguePath)) {
  throw new Error('Run npm run migration:check:local before repairing metadata.');
}

const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const duplicateCodes = new Set(['duplicate-title', 'duplicate-meta-description']);
const routes = new Set();

for (const issue of readiness.issues ?? []) {
  if (!duplicateCodes.has(issue.code)) continue;
  for (const route of issue.routes ?? []) routes.add(route);
}

const pagesByRoute = new Map((catalogue.pages ?? []).map((page) => [page.route, page]));

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceExactlyOnce(html, pattern, replacement, label, route) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`${route}: expected exactly one ${label}, found ${matches?.length ?? 0}.`);
  }
  return html.replace(pattern, replacement);
}

const planned = [];
for (const route of [...routes].sort()) {
  const page = pagesByRoute.get(route);
  if (!page) throw new Error(`${route}: missing from catalogue report.`);
  if (page.type !== 'product' || page.classification !== 'indexable') {
    throw new Error(`${route}: metadata repair is restricted to indexable product pages.`);
  }
  if (!page.h1 || !page.range || !page.category) {
    throw new Error(`${route}: missing H1, range or category context.`);
  }

  const filePath = path.join(root, page.file);
  const title = `${page.h1} | ${page.range} | Oz Timber Floor`;
  const description = `${page.h1} in the ${page.range} ${page.category.toLowerCase()} range. View colour details, check stock and request supply or installation pricing from Oz Timber Floor Sydney.`;
  let html = fs.readFileSync(filePath, 'utf8');

  html = replaceExactlyOnce(html, /<title>[^<]*<\/title>/g, `<title>${escapeAttribute(title)}</title>`, 'title', route);
  html = replaceExactlyOnce(
    html,
    /<meta name="description" content="[^"]*">/g,
    `<meta name="description" content="${escapeAttribute(description)}">`,
    'meta description',
    route,
  );
  html = replaceExactlyOnce(
    html,
    /<meta property="og:title" content="[^"]*">/g,
    `<meta property="og:title" content="${escapeAttribute(title)}">`,
    'Open Graph title',
    route,
  );
  html = replaceExactlyOnce(
    html,
    /<meta property="og:description" content="[^"]*">/g,
    `<meta property="og:description" content="${escapeAttribute(description)}">`,
    'Open Graph description',
    route,
  );

  planned.push({ route, file: page.file, title, description, html });
}

const titleOwners = new Map();
const descriptionOwners = new Map();
for (const item of planned) {
  const priorTitle = titleOwners.get(item.title);
  if (priorTitle) throw new Error(`Generated duplicate title for ${priorTitle} and ${item.route}.`);
  titleOwners.set(item.title, item.route);

  const priorDescription = descriptionOwners.get(item.description);
  if (priorDescription) throw new Error(`Generated duplicate description for ${priorDescription} and ${item.route}.`);
  descriptionOwners.set(item.description, item.route);
}

if (!apply) {
  console.log(`Dry run: ${planned.length} indexable product page(s) need unique metadata. Re-run with --apply.`);
  process.exit(0);
}

for (const item of planned) {
  fs.writeFileSync(path.join(root, item.file), item.html);
}

console.log(`Updated unique title, description and Open Graph metadata on ${planned.length} indexable product page(s).`);
