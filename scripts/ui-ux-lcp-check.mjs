import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const representativePages = [
  {
    route: "/",
    files: ["index.html"],
    src: "/assets/images/hero/enchant-caramel-herringbone-interior.webp",
    width: 1800,
    height: 1500,
  },
  {
    route: "/products/",
    files: ["products/index.html", "products.html"],
    src: "/assets/images/products/engineered/engineered-blackbutt-rustic.jpg",
    width: 1500,
    height: 1000,
  },
  {
    route: "/ranges/",
    files: ["ranges/index.html"],
    src: "/assets/products/hybrid/avala/avala-blackbutt.webp",
    width: 933,
    height: 1400,
  },
  {
    route: "/hybrid-flooring-sydney/",
    files: ["hybrid-flooring-sydney/index.html", "hybrid-flooring-sydney.html"],
    src: "/assets/images/products/hybrid/hybrid-pacific-blackbutt.webp",
    width: 300,
    height: 300,
  },
  {
    route: "/engineered-timber-flooring-sydney/",
    files: ["engineered-timber-flooring-sydney/index.html", "engineered-timber-flooring-sydney.html"],
    src: "/assets/images/products/engineered/engineered-blackbutt-rustic.jpg",
    width: 1500,
    height: 1000,
  },
  {
    route: "/ranges/avala/",
    files: ["ranges/avala/index.html"],
    src: "/assets/products/hybrid/avala/avala-blackbutt.webp",
    width: 933,
    height: 1400,
  },
  {
    route: "/products/avala-blackbutt/",
    files: ["products/avala-blackbutt/index.html"],
    src: "/assets/products/hybrid/avala/avala-blackbutt.webp",
    width: 933,
    height: 1400,
  },
];

const ignoredDirectories = new Set([".git", "dist", "node_modules", ".netlify", "docs", "migration", "config"]);
const failures = [];

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function allImageTags(html) {
  return html.match(/<img\b[^>]*>/gi) || [];
}

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

for (const page of representativePages) {
  for (const relativeFile of page.files) {
    const absoluteFile = path.join(root, relativeFile);
    if (!fs.existsSync(absoluteFile)) {
      fail(relativeFile, `representative file for ${page.route} is missing`);
      continue;
    }

    const html = fs.readFileSync(absoluteFile, "utf8");
    const images = allImageTags(html);
    const lcpImages = images.filter((tag) => /\bdata-lcp-image(?:\s|=|>)/i.test(tag));
    const highPriorityImages = images.filter((tag) => attribute(tag, "fetchpriority").toLowerCase() === "high");

    if (lcpImages.length !== 1) fail(relativeFile, `expected exactly one data-lcp-image marker; found ${lcpImages.length}`);
    if (highPriorityImages.length !== 1) fail(relativeFile, `expected exactly one fetchpriority=high image; found ${highPriorityImages.length}`);

    const image = lcpImages[0] || "";
    if (attribute(image, "src") !== page.src) fail(relativeFile, `unexpected LCP source ${attribute(image, "src") || "(missing)"}`);
    if (attribute(image, "loading").toLowerCase() !== "eager") fail(relativeFile, "selected LCP image is not eager-loaded");
    if (attribute(image, "fetchpriority").toLowerCase() !== "high") fail(relativeFile, "selected LCP image is not high priority");
    if (Number(attribute(image, "width")) !== page.width || Number(attribute(image, "height")) !== page.height) {
      fail(relativeFile, `selected LCP dimensions do not match ${page.width}x${page.height}`);
    }

    const assetFile = path.join(root, page.src.replace(/^\//, ""));
    if (!fs.existsSync(assetFile)) fail(relativeFile, `selected LCP asset is missing: ${page.src}`);

    if (!failures.some((failure) => failure.startsWith(`${relativeFile}:`))) {
      console.log(`PASS ${page.route} [${relativeFile}] ${page.width}x${page.height}`);
    }
  }
}

for (const projectsOutput of ["projects/index.html", "projects.html"]) {
  const projectsHtml = fs.readFileSync(path.join(root, projectsOutput), "utf8");
  if (/projects handled by Oz Timber Floor/i.test(projectsHtml)) {
    fail(projectsOutput, "unsupported completed-project provenance remains");
  }
  if (!/common timber, hybrid, laminate, engineered timber and floor preparation project types/i.test(projectsHtml)) {
    fail(projectsOutput, "approved factual-correction wording is missing");
  }
}

const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) walk(file);
    } else if (file.endsWith(".html")) {
      htmlFiles.push(file);
    }
  }
}

walk(root);
let imageCount = 0;
let missingDimensions = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const image of allImageTags(html)) {
    imageCount += 1;
    if (!attribute(image, "width") || !attribute(image, "height")) missingDimensions += 1;
  }
}

console.log(`IMAGE DEBT html=${htmlFiles.length} images=${imageCount} missingDimensions=${missingDimensions}`);

if (failures.length) {
  console.error(`LCP QA FAILED (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`LCP QA PASSED routes=${representativePages.length} physicalFiles=${representativePages.reduce((total, page) => total + page.files.length, 0)}`);
}
