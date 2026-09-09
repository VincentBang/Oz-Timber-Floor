import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

// Local-only browser evidence. No form submission or remote write is permitted.
const root = process.cwd();
const baselineHead = "d0c66b802e544aa1a807f91798ea284c31c0998b";
const baselineRoot = process.env.OZ_BROWSER_BASELINE_ROOT || "/tmp/oz-mig-004-baseline-site.BYgpUA";
const playwrightPath = process.env.OZ_PLAYWRIGHT_PATH || "/Users/daibang/.npm/_npx/e41f203b7505f1fb/node_modules/playwright";
const chromePath = process.env.OZ_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { chromium } = createRequire(import.meta.url)(playwrightPath);
const output = path.join(root, "docs/seo-migration/OZ-MIG-004");
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const gitBlob = (bytes) => crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
const routes = [
  { slug: "floor-levelling-sydney", route: "/floor-levelling-sydney/" },
  { slug: "contact-prefill", route: "/contact/?enquiry=stock&product=Hardwood+Collection+Forest+Oak&productSlug=hardwood-collection-forest-oak&range=Hardwood+Collection&category=Engineered+timber&source=%2Franges%2Fhardwood-collection%2F" },
  { slug: "range-hardwood-collection", route: "/ranges/hardwood-collection/" },
  { slug: "product-hardwood-forest-oak", route: "/products/hardwood-collection-forest-oak/" },
  { slug: "guide-office-flooring", route: "/guides/choosing-office-flooring-durability-design-performance/" },
];
const widths = [1440, 1024, 768, 390, 320];
const heightFor = (width) => width >= 768 ? 1000 : width === 390 ? 844 : 800;
const captureWidths = new Set([1440, 390, 320]);
const tree = new Map(execFileSync("git", ["ls-tree", "-r", baselineHead], { cwd: root, encoding: "utf8", maxBuffer: 20e6 })
  .trim().split("\n").map((line) => { const [info, name] = line.split("\t"); return [name, info.split(" ")[2]]; }));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon" };

function sourceServer(sourceRoot, baseline) {
  const rules = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8").split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)).filter(([from, to]) => from && to && !from.startsWith("#") && !/[*:]/.test(from));
  const served = new Map();
  const resolveFile = (pathname) => {
    const rule = rules.find(([from]) => from === pathname);
    if (rule && parseInt(rule[2] || "301", 10) === 200) pathname = rule[1];
    const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
    const candidate = path.resolve(sourceRoot, relative);
    if (!candidate.startsWith(`${sourceRoot}/`) && candidate !== sourceRoot) throw new Error("Path traversal denied");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    if (fs.existsSync(path.join(candidate, "index.html"))) return path.join(candidate, "index.html");
    return null;
  };
  const server = http.createServer((req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end("Read-only evidence server"); return; }
    const pathname = new URL(req.url, "http://localhost").pathname;
    const rule = rules.find(([from]) => from === pathname);
    const status = rule ? parseInt(rule[2] || "301", 10) : null;
    if (status >= 300 && status < 400) { res.writeHead(status, { Location: rule[1] }); res.end(); return; }
    const file = resolveFile(pathname);
    if (!file) { res.writeHead(404); res.end("Not found"); return; }
    const bytes = fs.readFileSync(file);
    const relative = path.relative(sourceRoot, file).split(path.sep).join("/");
    const matchesBaseline = baseline ? tree.get(relative) === gitBlob(bytes) : null;
    if (baseline && !matchesBaseline) { res.writeHead(409); res.end("Baseline git verification failed"); return; }
    served.set(relative, { file: relative, sha256: sha(bytes), bytes: bytes.length, matchesBaseline });
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
    res.end(req.method === "HEAD" ? undefined : bytes);
  });
  return { server, served, resolveFile, sourceRoot };
}

const sources = { before: sourceServer(baselineRoot, true), after: sourceServer(root, false) };
if (!fs.readFileSync(path.join(root, "ranges/hardwood-collection/index.html"), "utf8").includes(routes[1].route.replaceAll("&", "&amp;"))) throw new Error("Contact test URL is not the actual current range stock CTA");
for (const item of routes) {
  const file = sources.before.resolveFile(new URL(item.route, "http://localhost").pathname);
  if (!file || tree.get(path.relative(baselineRoot, file)) !== gitBlob(fs.readFileSync(file))) throw new Error(`Invalid baseline for ${item.route}`);
}
const startHashes = Object.fromEntries(["assets/site.js", "assets/site.css", "assets/contact-config.js", ...routes.map((item) => path.relative(root, sources.after.resolveFile(new URL(item.route, "http://localhost").pathname)))].map((file) => [file, sha(fs.readFileSync(path.join(root, file)))]));
const startedAt = new Date().toISOString();
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const captures = [];
const cells = [];
const failures = [];
const interactions = {};
let nonGetRequests = 0;

async function loadPage(page, url, scanWholePage) {
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  if (scanWholePage) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(200, window.innerHeight - 100)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      await Promise.race([
        Promise.all([...document.images].map((img) => img.decode().catch(() => {}))),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
      window.scrollTo(0, 0);
    });
  }
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
  await page.waitForTimeout(180);
  return response.status();
}

try {
  for (const [state, source] of Object.entries(sources)) {
    await new Promise((resolve) => source.server.listen(0, "127.0.0.1", resolve));
    source.baseUrl = `http://127.0.0.1:${source.server.address().port}`;
    for (const width of state === "before" ? [...captureWidths] : widths) {
      const height = heightFor(width);
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
      await context.route("**/*", async (route) => {
        if (!["GET", "HEAD"].includes(route.request().method())) { nonGetRequests++; await route.abort(); }
        else await route.continue();
      });
      for (const item of routes) {
        console.log(`${state} ${width}px ${item.slug}: loading`);
        const page = await context.newPage();
        const consoleErrors = [], pageErrors = [], failedRequests = [], remoteRequests = [];
        page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), reason: request.failure()?.errorText }));
        page.on("request", (request) => { if (new URL(request.url()).origin !== source.baseUrl) remoteRequests.push(request.url()); });
        const requestedUrl = `${source.baseUrl}${item.route}`;
        const status = await loadPage(page, requestedUrl, state === "after");
        const metrics = await page.evaluate(() => ({
          innerWidth: window.innerWidth, innerHeight: window.innerHeight,
          clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth, h1Count: document.querySelectorAll("h1").length,
          h1: document.querySelector("h1")?.textContent?.trim(),
          imageCount: document.images.length,
          brokenImages: [...document.images].filter((image) => image.complete && !image.naturalWidth).map((image) => image.currentSrc || image.src),
          pendingImages: [...document.images].filter((image) => !image.complete).map((image) => image.currentSrc || image.src),
        }));
        const physicalFile = path.relative(source.sourceRoot, source.resolveFile(new URL(item.route, source.baseUrl).pathname));
        const record = { state, route: item.route, requestedUrl, resolvedUrl: page.url(), viewport: { width, height }, status, physicalFile, sourceSha256: sha(fs.readFileSync(path.join(source.sourceRoot, physicalFile))), ...metrics, consoleErrors, pageErrors, failedRequests, remoteRequests: [...new Set(remoteRequests)] };
        if (state === "after") {
          record.passed = status === 200 && metrics.innerWidth === width && metrics.clientWidth === width && metrics.scrollWidth <= width && metrics.bodyScrollWidth <= width && metrics.h1Count === 1 && !metrics.brokenImages.length && !metrics.pendingImages.length && !consoleErrors.length && !pageErrors.length && !failedRequests.length;
          cells.push(record);
          if (!record.passed) failures.push({ route: item.route, width, type: "browser-cell" });
        }
        if (captureWidths.has(width)) {
          // Capture a fresh natural initial viewport, independently of the full-page
          // lazy-image scan above (which can leave sticky layers composited offscreen).
          if (state === "after") await loadPage(page, requestedUrl, false);
          const captureLayout = await page.evaluate(() => {
            const header = document.querySelector('.site-header').getBoundingClientRect();
            return { scrollX: window.scrollX, scrollY: window.scrollY, innerWidth: window.innerWidth, clientWidth: document.documentElement.clientWidth, headerTop: header.top, headerBottom: header.bottom };
          });
          const relative = `screenshots/${state}/${item.slug}-${width}x${height}.png`;
          const png = await page.screenshot({ path: path.join(output, relative), fullPage: false, animations: "disabled" });
          captures.push({ ...record, captureLayout, file: relative, screenshotSha256: sha(png), screenshotBytes: png.length, pngWidth: png.readUInt32BE(16), pngHeight: png.readUInt32BE(20) });
        }
        await page.close();
      }
      await context.close();
      console.log(`${state} ${width}px: ${routes.length} routes completed`);
    }
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, reducedMotion: "reduce" });
  await context.route("**/*", async (route) => {
    if (!["GET", "HEAD"].includes(route.request().method())) { nonGetRequests++; await route.abort(); }
    else await route.continue();
  });
  const page = await context.newPage();
  await loadPage(page, `${sources.after.baseUrl}${routes[1].route}`, true);
  interactions.contact = await page.evaluate(() => {
    const form = document.querySelector("form[data-contact-form]");
    const summary = document.querySelector("[data-selected-enquiry]");
    return { formName: form.getAttribute("name"), action: form.getAttribute("action"), enquiry: document.querySelector("#enquiryType").value, product: document.querySelector("#product").value, productSlug: document.querySelector("#productSlug").value, range: document.querySelector("#rangeField").value, category: document.querySelector("#category").value, sourcePage: document.querySelector("#sourcePage").value, summaryVisible: !summary.hidden, summaryText: summary.textContent.trim(), consentRequired: form.querySelector('[name="consent"]').required };
  });
  await page.locator('#enquiryType').selectOption('service');
  interactions.contact.serviceSelection = await page.evaluate(() => ({ serviceFieldVisible: !document.querySelector('[data-field="service_type"]').hidden, productFieldHidden: document.querySelector('[data-field="product"]').hidden }));
  await page.locator('#enquiryType').selectOption('stock');
  const submit = page.locator('form[data-contact-form] button[type="submit"]');
  await submit.scrollIntoViewIfNeeded();
  interactions.contact.submit = await submit.evaluate((element) => { const r = element.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { visible: r.width > 0 && r.height > 0, unobstructed: element === hit || element.contains(hit), box: { x: r.x, y: r.y, width: r.width, height: r.height } }; });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.nav-toggle').click();
  interactions.menu = await page.evaluate(() => ({ open: document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true', bodyLocked: document.body.style.position === 'fixed' && document.body.style.overflow === 'hidden' }));
  for (const name of ['services', 'products']) {
    const button = page.getByRole('button', { name: `Toggle ${name} menu`, exact: true });
    await button.click();
    interactions.menu[`${name}Expanded`] = await button.getAttribute('aria-expanded') === 'true';
  }
  interactions.menu.drawer = await page.locator('.site-header').evaluate((element) => {
    const r = element.getBoundingClientRect(); const before = element.scrollTop; element.scrollTop = element.scrollHeight;
    const nav = element.querySelector('.nav-links').getBoundingClientRect();
    return { selector: '.site-header', left: r.left, right: r.right, width: r.width, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, overflowY: getComputedStyle(element).overflowY, scrolls: element.scrollTop > before, fitsViewport: r.left >= 0 && r.right <= window.innerWidth && nav.left >= 0 && nav.right <= window.innerWidth, documentOverflow: document.documentElement.scrollWidth > window.innerWidth };
  });
  await page.keyboard.press('Escape');
  interactions.menu.escape = await page.evaluate(() => ({ closed: document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false', bodyUnlocked: !document.body.classList.contains('mobile-nav-scroll-locked'), submenusReset: [...document.querySelectorAll('.nav-dropdown-toggle')].every((button) => button.getAttribute('aria-expanded') === 'false') }));
  await page.locator('.nav-toggle').click();
  await page.evaluate(() => document.querySelector('main').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  interactions.menu.outsideClick = { method: "synthetic bubbling click on main outside header; full-height mobile drawer leaves no guaranteed physical outside point", closed: await page.locator('.nav-toggle').getAttribute('aria-expanded') === 'false' };
  await context.close();
  if (!(interactions.contact.formName === 'oz-flooring-enquiry' && interactions.contact.action === '/thank-you/' && interactions.contact.enquiry === 'stock' && interactions.contact.product === 'Hardwood Collection Forest Oak' && interactions.contact.productSlug === 'hardwood-collection-forest-oak' && interactions.contact.range === 'Hardwood Collection' && interactions.contact.category === 'Engineered timber' && interactions.contact.sourcePage === '/ranges/hardwood-collection/' && interactions.contact.summaryVisible && interactions.contact.consentRequired && interactions.contact.submit.unobstructed && interactions.contact.serviceSelection.serviceFieldVisible && interactions.contact.serviceSelection.productFieldHidden)) failures.push({ type: 'contact-interaction' });
  if (!(interactions.menu.open && interactions.menu.bodyLocked && interactions.menu.servicesExpanded && interactions.menu.productsExpanded && interactions.menu.drawer.scrolls && interactions.menu.drawer.fitsViewport && !interactions.menu.drawer.documentOverflow && interactions.menu.escape.closed && interactions.menu.escape.bodyUnlocked && interactions.menu.escape.submenusReset && interactions.menu.outsideClick.closed)) failures.push({ type: 'menu-interaction' });
  if (nonGetRequests) failures.push({ type: 'unexpected-non-get-request', count: nonGetRequests });
  for (const [file, initialHash] of Object.entries(startHashes)) if (sha(fs.readFileSync(path.join(root, file))) !== initialHash) failures.push({ type: 'source-changed-during-run', file });
} finally {
  await browser.close();
  for (const source of Object.values(sources)) await new Promise((resolve) => source.server.close(resolve));
}

const endedAt = new Date().toISOString();
const shared = { schemaVersion: 1, startedAt, endedAt, baselineHead, baselineRoot, chromePath, browserEngine: "Chromium via existing Playwright; no installed dependency", sourceHashes: startHashes, nonGetRequests, protectedFromFormSubmission: true };
fs.writeFileSync(path.join(output, "BROWSER_QA.json"), `${JSON.stringify({ ...shared, passed: failures.length === 0, cellCount: cells.length, cells, interactions, failures }, null, 2)}\n`);
fs.writeFileSync(path.join(output, "SCREENSHOT_CAPTURE_EVIDENCE.json"), `${JSON.stringify({ ...shared, supersedes: "Earlier screenshots had an invalid before server root and unverified CSS viewport sizing; these are fresh browser-emulated captures.", captureCount: captures.length, captures, resourceVerification: Object.fromEntries(Object.entries(sources).map(([state, source]) => [state, [...source.served.values()]])) }, null, 2)}\n`);
console.log(JSON.stringify({ passed: failures.length === 0, captures: captures.length, cells: cells.length, failures, interactions }, null, 2));
if (failures.length) process.exitCode = 1;
