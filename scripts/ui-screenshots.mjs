#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const screenshotDir = path.join(root, "docs", "ui-ux", "screenshots", "after-v2");
const reportPath = path.join(root, "docs", "ui-ux", "generated", "screenshot-matrix.json");

const routes = Object.freeze([
  { route: "/", slug: "home" },
  { route: "/products/", slug: "products" },
  { route: "/ranges/", slug: "ranges" },
  { route: "/hybrid-flooring-sydney/", slug: "hybrid-flooring" },
  { route: "/engineered-timber-flooring-sydney/", slug: "engineered-timber-flooring" },
  { route: "/timber-flooring-installation-sydney/", slug: "installation" },
  { route: "/floor-levelling-sydney/", slug: "floor-levelling" },
  { route: "/projects/", slug: "projects" },
  { route: "/contact/", slug: "contact" },
  { route: "/ranges/avala/", slug: "range-avala" },
  { route: "/products/avala-blackbutt/", slug: "product-avala-blackbutt" },
  { route: "/privacy/", slug: "privacy" },
  { route: "/terms/", slug: "terms" },
  { route: "/404.html", slug: "404" },
]);

const viewports = Object.freeze([
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 800 },
]);

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function jpegMetadata(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, mime: null, width: null, height: null };
  const payload = fs.readFileSync(filePath);
  const isJpeg = payload.length >= 4 && payload[0] === 0xff && payload[1] === 0xd8 && payload[2] === 0xff;
  if (!isJpeg) {
    return { exists: true, mime: "application/octet-stream", width: null, height: null };
  }

  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < payload.length) {
    if (payload[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (payload[offset] === 0xff) offset += 1;
    const marker = payload[offset];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 1;
      continue;
    }
    if (marker === 0xda) break;
    if (offset + 2 >= payload.length) break;
    const segmentLength = payload.readUInt16BE(offset + 1);
    if (segmentLength < 2 || offset + segmentLength >= payload.length) break;
    if (startOfFrameMarkers.has(marker)) {
      return {
        exists: true,
        mime: "image/jpeg",
        width: payload.readUInt16BE(offset + 6),
        height: payload.readUInt16BE(offset + 4),
      };
    }
    offset += segmentLength + 1;
  }

  return { exists: true, mime: "image/jpeg", width: null, height: null };
}

const cells = [];
for (const { route, slug } of routes) {
  for (const viewport of viewports) {
    const filename = `${slug}-${viewport.width}x${viewport.height}.jpg`;
    const filePath = path.join(screenshotDir, filename);
    const metadata = jpegMetadata(filePath);
    const failures = [];
    if (!metadata.exists) failures.push("missing-file");
    if (metadata.exists && metadata.mime !== "image/jpeg") failures.push("extension-payload-mismatch");
    if (metadata.exists && (metadata.width !== viewport.width || metadata.height !== viewport.height)) {
      failures.push("unexpected-dimensions");
    }
    cells.push({
      route,
      viewport,
      file: relative(filePath),
      ...metadata,
      success: failures.length === 0,
      failures,
    });
  }
}

const failedCells = cells.filter((cell) => !cell.success);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  definition: {
    routes,
    viewports,
    expectedCells: routes.length * viewports.length,
    captureType: "consistent viewport capture",
  },
  summary: {
    expectedCells: routes.length * viewports.length,
    presentCells: cells.filter((cell) => cell.exists).length,
    passingCells: cells.length - failedCells.length,
    failingCells: failedCells.length,
  },
  cells,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (failedCells.length) {
  process.stderr.write(`${JSON.stringify({ verdict: "FAIL", failures: failedCells }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Screenshot matrix PASS: ${cells.length}/${cells.length} JPEG viewport captures are present with truthful extensions and dimensions.\n`);
}
