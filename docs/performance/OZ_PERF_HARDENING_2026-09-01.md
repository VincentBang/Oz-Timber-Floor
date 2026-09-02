# OZ-PERF-002 performance and evidence hardening — 2026-09-01

## Outcome

The 15 priority publication routes are hardened locally without changing content, SEO contracts, routes, redirects, sitemap membership, catalogue facts, form behaviour, analytics configuration or image bytes.

- 136 missing intrinsic-dimension pairs were added across 170 local raster image occurrences.
- All 15 routes now have exactly one verified primary image with factual intrinsic dimensions, `loading="eager"`, `fetchpriority="high"`, `decoding="async"` and `data-lcp-image`.
- Below-fold images retain lazy loading where it already existed.
- A second apply changed zero files; the build-stage apply also changed zero files.
- Repository-wide missing-dimension debt moved from 13,888 to 13,752, exactly the 136-tag scoped reduction.
- No preload, `srcset`, image conversion, recompression, CSS, runtime dependency or product-colour filter was added.

## Authoritative generation layer

`scripts/image-dimension-audit.mjs` is the final-stage owner for these performance attributes. It:

1. resolves the 15 deployed owner files through `scripts/publication-inventory.mjs` and exact 200 rewrites;
2. scans only the fixed priority-route allowlist;
3. derives dimensions from PNG, GIF, JPEG and WebP byte signatures using Node standard-library code;
4. refuses to apply when an asset is missing, unreadable or dimensionally inconsistent, or when primary-image ownership is ambiguous;
5. changes only `width`, `height`, `loading`, `fetchpriority`, `decoding` and `data-lcp-image`;
6. writes a deterministic audit report; and
7. runs after catalogue generation in `npm run build`, avoiding unsafe legacy page generators.

Commands added:

- `npm run perf:images:apply`
- `npm run perf:images:check`
- `npm run perf:priority-routes:check`

`scripts/migration-readiness.mjs` now recognises the extended exact build contract, so removal or reordering of the final hardening stage remains a release blocker.

## Browser evidence

The redirect-aware browser run measured all 15 routes at 1440×1000, 1024×900, 768×1024, 390×844 and 320×700. Final result:

- 75/75 route/width records present;
- zero missing-dimension records;
- exactly one high-priority image on every route;
- zero lazy primary candidates;
- zero horizontal-overflow records;
- zero console warnings/errors;
- CTA/header layout remained visible in the captured evidence.

The older UI report resolved several clean routes to directory aliases. The new performance report binds every result to the redirect-resolved publication owner and its SHA-256 hash. The existing 70-cell UI report remains valid for unchanged routes; its five home cells were freshly measured after the home owner hash changed, and `npm run ui:qa` then passed.

### Screenshot matrix

Ten screenshots were captured, below the 25-image guardrail. A full 75-screenshot matrix was not repeated because this task changes non-visual image attributes only; all 75 route/width combinations still received browser measurements.

| Route | Viewport | Evidence |
|---|---:|---|
| `/` | 1440×1000 | `docs/performance/generated/screenshots/home-1440.png` |
| `/laminate-flooring-sydney/` | 1440×1000 | `docs/performance/generated/screenshots/laminate-1440.png` |
| `/ranges/etf-9-0mm-hybrid/` | 1440×1000 | `docs/performance/generated/screenshots/etf-range-1440.png` |
| `/timber-flooring-installation-sydney/` | 1024×900 | `docs/performance/generated/screenshots/installation-1024.png` |
| `/products/` | 768×1024 | `docs/performance/generated/screenshots/products-768.png` |
| `/projects/` | 390×844 | `docs/performance/generated/screenshots/projects-390.png` |
| `/products/etf-9-0mm-hybrid-driftwood/` | 390×844 | `docs/performance/generated/screenshots/etf-driftwood-390.png` |
| `/contact/` | 390×844 | `docs/performance/generated/screenshots/contact-390.png` |
| `/solid-timber-flooring-sydney/` | 320×700 | `docs/performance/generated/screenshots/solid-timber-320.png` |
| `/office-flooring-sydney/` | 320×700 | `docs/performance/generated/screenshots/office-320.png` |

Visual review found no regression from the attribute-only change. Heroes retain correct colour, CTA hierarchy and responsive stacking; the tested routes do not overflow horizontally.

## SEO and migration freeze

The raw freeze initially reported 39 differences because `htmlHash` treats the six allowed image-performance attributes as full-page SEO changes. `scripts/performance-html-freeze-allowance.mjs` now fails closed unless every priority owner normalises exactly to the reconstructed pre-task HTML after only those six attributes are removed.

The verified allowance covers 15/15 owners with zero issues. It does not ignore title, metadata, canonical, robots, H1, JSON-LD, internal destinations, link contracts, forms, visible copy or any non-image HTML. With that proof applied, `npm run ui:seo-freeze:check` exits 1 as designed and its `differences` array is byte-for-byte identical to the pre-task authorised 29-item set.

Final frozen state:

- 2,201 HTML files;
- 971 physical indexable HTML pages;
- 943 publication canonicals;
- 1,228 noindex routes;
- 350 redirect-only routes;
- 943 sitemap URLs;
- 1,912 redirect rules;
- 2,115 catalogue pages: 893 indexable, 1,222 controlled/noindex;
- 130 GSC decisions;
- 60 reviewed semantic redirect contracts;
- 12 keyword owner clusters;
- zero publication, sitemap or hardening blockers;
- all three GSC workbook hashes unchanged;
- protected redirect, Netlify, robots, sitemap, catalogue-data, contact/analytics and legal files byte-identical to the reconstructed task baseline.

## Catalogue evidence queue

`docs/seo-migration/CATALOGUE_QUALITY_NEXT_QUEUE_2026-09-01.md` ranks 25 next actions using GSC equity, redirect/internal-link significance, current control state, completeness, image certainty, verified parent safety, commercial value and cannibalisation risk.

The queue is audit-only. Class B items require verified business/product evidence, Class C retains current control and Class D requires a separately approved redirect/indexation decision. The two Class A cohorts authorise only deterministic repeated-token cleanup, not broader metadata or catalogue rewriting.

The supporting notebook executes from top to bottom with zero errors, asserts the first 21 GSC cohort totals/weighted positions and reconciles 347 repeated-placeholder, 10 duplicate-token, five image-confirm and 478 missing-source findings. A separate Data app was not created because the requested durable artifacts are repository Markdown/JSON and an extra app would exceed the local change boundary.

## Commands actually run

| Command | Final outcome |
|---|---|
| `npm run build` | PASS; non-production headers, GA4 unconfigured, catalogue changes 0, performance apply changes 0 |
| `npm run perf:images:apply` twice | PASS; first scoped apply updated 15 owner files, second updated 0 |
| `npm run perf:images:check` | PASS; 15 routes, 170 images, 86 unique assets, 0 missing/mismatch/missing-asset/unreadable/route issue |
| `npm run perf:priority-routes:check` | PASS; 15 routes, 75 captures, five widths |
| `npm run ui:lcp:check` | PASS; existing 7-route/10-output guard retained; repository debt 13,752 |
| `npm run ui:qa` | PASS after refreshing the five changed home cells; 70 responsive cells, three mobile widths, two image-style checks, two dock checks and 10 LCP outputs |
| `npm run migration:check:local` | `GO`; 0 blockers, 0 high, 0 medium |
| `npm run seo:gsc-audit` | PASS; 130 decisions, 60 manual rows, 72 exact mappings, eight unresolved |
| `npm run seo:migration-hardening:check` | PASS; 60 redirects, 130 decisions, 12 owners, 361 controlled findings, 0 blockers |
| `npm run ui:seo-freeze:check` | Expected exit 1; exact same 29 authorised differences, 15 verified image-only allowances, 0 allowance issues |
| `node scripts/performance-html-freeze-allowance.mjs` | PASS; 15/15 normalised owners match the reconstructed pre-task files |
| catalogue analysis notebook execution | PASS; three code cells, zero errors, all assertions passed |
| `git diff --check` | PASS |

Two final-gate failures were found and resolved rather than hidden: the migration gate initially rejected the deliberately extended build command until its exact contract was updated, and UI QA initially detected the stale home source hash until five fresh in-app-browser cells replaced that evidence.

## Change guardrail

The inherited dirty tree remains intact. Relative to the machine baseline, eight additional tracked files became dirty; all other task-touched tracked files were already dirty. The task adds 20 untracked evidence/tool files and exactly 10 screenshots. No baseline dirty or untracked path disappeared.

## Exact task-delta file inventory

Fifty-seven files differ from the reconstructed task baseline: 37 changed, 20 added and zero deleted.

Priority publication owners changed only through the six allowed image attributes:

- `index.html`
- `floor-levelling-sydney.html`
- `timber-flooring-installation-sydney.html`
- `hybrid-flooring-sydney.html`
- `laminate-flooring-sydney.html`
- `engineered-timber-flooring-sydney.html`
- `solid-timber-flooring-sydney.html`
- `commercial-flooring-sydney.html`
- `office-flooring-sydney.html`
- `products.html`
- `ranges/etf-9-0mm-hybrid/index.html`
- `products/etf-9-0mm-hybrid-driftwood/index.html`
- `projects.html`
- `about.html`
- `contact.html`

Build, audit and governance files:

- `package.json`
- `scripts/image-dimension-audit.mjs`
- `scripts/priority-route-performance-check.mjs`
- `scripts/performance-html-freeze-allowance.mjs`
- `scripts/ui-ux-seo-freeze.mjs`
- `scripts/migration-readiness.mjs`
- `OZ_STATUS.md`
- `OZ_DECISION_LOG.md`
- `OZ_TASK_QUEUE.md`

New narrative and machine evidence:

- `docs/performance/OZ_PERF_BASELINE_2026-09-01.md`
- `docs/performance/OZ_PERF_HARDENING_2026-09-01.md`
- `docs/seo-migration/CATALOGUE_QUALITY_NEXT_QUEUE_2026-09-01.md`
- `docs/performance/generated/image-dimension-audit.json`
- `docs/performance/generated/priority-route-performance.json`
- `docs/performance/generated/seo-freeze-performance-allowance.json`
- `docs/performance/generated/catalogue-quality-priority-analysis.ipynb`
- the 10 exact screenshot paths listed in the screenshot matrix above

Validation refreshed these existing generated files; their frozen counts and decisions remain unchanged:

- `docs/seo-migration/generated/catalogue-quality-report.json`
- `docs/seo-migration/generated/catalogue-quality-report.md`
- `docs/seo-migration/generated/catalogue-sanitisation-report.json`
- `docs/seo-migration/generated/migration-readiness-report.json`
- `docs/seo-migration/generated/migration-readiness-report.md`
- `docs/seo-migration/generated/performance-accessibility-report.json`
- `docs/seo-migration/generated/performance-accessibility-report.md`
- `docs/seo-migration/generated/redirect-validation-report.json`
- `docs/seo-migration/generated/redirect-validation-report.md`
- `docs/seo-migration/generated/seo-migration-hardening-report.json`
- `docs/seo-migration/generated/seo-migration-hardening-report.md`
- `docs/seo-migration/generated/sitemap-validation-report.json`
- `docs/seo-migration/generated/sitemap-validation-report.md`
- `docs/ui-ux/generated/browser-qa.json`
- `docs/ui-ux/generated/seo-freeze-after.json`
- `docs/ui-ux/generated/seo-freeze-comparison.json`

## Known limitations and next task

- No Lighthouse or real-device Core Web Vitals run was performed; the work establishes deterministic HTML and browser-layout safety, not production field performance.
- Large colour-sensitive catalogue images remain unchanged pending a separate pixel-verified optimisation task.
- GA4, Netlify Forms delivery, custom domain/DNS, real deployed headers and production redirect responses remain external release checks.

The highest-value next task is a separately approved controlled preview deployment and external release verification. It should verify the exact candidate artifact, Netlify Forms, preview noindex headers, representative redirects and real response behaviour without enabling production indexing or changing DNS unless separately authorised.
