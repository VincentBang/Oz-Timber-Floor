# OZ-MIG-004 implementation and QA

## Outcome

Layer: **REPAIRS DEPLOYED TO PROTECTED NETLIFY; PROTECTED DECISIONS PENDING**. Actual promotion and live checks are recorded in `DEPLOYMENT_RECEIPT_2026-09-09.md`.

Starting state was clean `main` at `d0c66b802e544aa1a807f91798ea284c31c0998b`. No inherited change was overwritten. The initial local repair phase made no external writes. Vincent subsequently requested “push to dev merge to main and deploy”; the promotion preflight below records that separate authority. Form submission, DNS/domain change, production-indexing change, GA4 configuration and Search Console writes remain outside this release.

The exact task delta is enumerated in `TASK_FILE_MANIFEST.txt`. The large HTML count is mechanical, not a redesign: 222 physical HTML files remove reproduced malformed fields, update the verified Hardwood Collection presentation, remove five guides' obsolete old-host `srcset` attributes, or update the two floor-levelling twins.

## Implemented local repairs

- Reconciled WordPress, Netlify, source and package through 70 bounded public GETs (35 routes on each origin), source/report inspection and a fresh preview build.
- Repaired the cross-contaminated Hardwood Collection source. The authoritative range now contains exactly 12 supplier-listed colours with verified range-level dimensions and installation method.
- Removed 189 obvious malformed source fields and their exact reproduced presentation tokens. Unknown values were omitted, not guessed.
- Added a scoped `--only=<range>` range-page rebuild and made an explicit reviewed `productSlugs/products` list authoritative for that range.
- Removed 54 retired WordPress image references from five guides only where the primary local image already existed.
- Corrected analytics semantics so `quote_submit` is emitted only once after a submit marker reaches `/thank-you/`; direct visits do not emit and no PII is stored.
- Replaced one internal policy phrase in floor-levelling customer copy.
- Made public-package indexation validation context-aware: preview packages must have global noindex; isolated production fixtures must not. The negative fixture rejects a preview artifact when tested as production.
- Added deterministic field-integrity, old-asset, analytics and current-release-contract checks plus the protected decision/evidence generators.

No canonical owner, redirect destination, sitemap membership, catalogue indexation override, supplier-page ownership or service-area hub was changed.

## Reconciled counts

| Inventory | Current |
| --- | ---: |
| Physical HTML files | 2,201 |
| Physical indexable HTML | 971 |
| Unique publication canonicals | 943 |
| Sitemap URLs | 943 |
| Physical noindex HTML files | 1,230 |
| Unique noindex routes | 1,228 |
| Redirect-only routes | 350 |
| Redirect rules | 1,912 |
| Catalogue pages | 2,115 |
| Currently indexable catalogue pages | 893 |
| Currently controlled catalogue pages | 1,222 |
| Newly exposed exact protected-decision blockers | 172 |

The 971/943 difference is physical flat/directory twins sharing canonical owners. The historical sitemap reconciliation is 1,973 minus 3 missing-image exclusions, 1,026 controlled catalogue exclusions and 1 retired Bamboo page equals 943. A temporary overbroad Bamboo removal also excluded `/` and `/about/`, producing 941 before correction. See `docs/ui-ux/OZ_UI_UX_V2_REPORT.md`, page-count reconciliation. Two noindex utility twins explain the physical/unique noindex difference.

## Package evidence

- Protected preview package: `/Users/daibang/Projects/oz-timber-floor/dist`
- Final promotion package: 6,236 files; 583,803,198 bytes.
- Final preview manifest SHA-256: `0eb7750b37126d38bc18f9f9c15e35b180b7bbf617e2fd44979657612a44c3be`.
- Two preview builds of the final analytics-context repair produced the same file count, byte count and manifest hash.
- Earlier local-phase preview package: 6,236 files; 583,801,926 bytes; manifest `bd602b98f5a42efe2758559d67a8b85b41be413ad4098e10f9b1375b132c5a5c`. Its isolated production fixture had 6,236 files; 583,801,892 bytes; manifest `54cff3ad0f320ce821da6c985538efe24cec6a9d83baa9fd7e05480abb996e8a`.
- That earlier fixture/preview byte difference was the expected global preview `X-Robots-Tag` line. The isolated fixture retained page-level noindex on `/thank-you/` and `/products/12mm-laminate-aspen-oak/`, excluded the controlled page and Bamboo from sitemap, and contained no private roots. It predates the final analytics-context repair and is not the final promotion artifact.
- The production fixture is test evidence only. It was generated in `/tmp` and is not an approved deployment artifact.

## Browser and screenshot evidence

Live browser execution covered these five routes at 1440, 1024, 768, 390 and 320 CSS px (25 cells):

| Route | 1440 | 1024 | 768 | 390 | 320 |
| --- | --- | --- | --- | --- | --- |
| `/floor-levelling-sydney/` | pass | pass | pass | pass | pass |
| `/contact/` with real Hardwood prefill parameters | pass | pass | pass | pass | pass |
| `/ranges/hardwood-collection/` | pass | pass | pass | pass | pass |
| `/products/hardwood-collection-forest-oak/` | pass | pass | pass | pass | pass |
| `/guides/choosing-office-flooring-durability-design-performance/` | pass | pass | pass | pass | pass |

Every cell had one H1, zero horizontal overflow and zero broken rendered images. The console had zero error/warning entries. The Hardwood range visibly contained exactly 12 colour cards and the verified 14/3 mm / 190 × 1900 mm details.

At 320 px: the menu opened/closed, locked/restored body scroll, both Services and Products submenus expanded, `aria-expanded` stayed correct, the header became vertically scrollable when a submenu exceeded the viewport, and Escape/outside click closed the drawer. The contact form retained `name="oz-flooring-enquiry"`, `action="/thank-you/"`, required consent, visible submit, correct product/range/category prefill and no submit/action-dock overlap. No form was submitted.

Pre-promotion review invalidated the initial thirty PNGs: both states accidentally captured the repaired checkout, and the mobile images were cropped without a matching CSS viewport. Those captures do not prove a before/after comparison. The fresh capture results and provenance are recorded separately in `BROWSER_QA.json` and `SCREENSHOT_CAPTURE_EVIDENCE.json`; `SCREENSHOT_MANIFEST.json` binds the resulting files to those observations. Historical 70-cell UI screenshots remain preserved separately; they were not overwritten.

The replacement capture run passed: 30 PNGs use real 1440×1000, 390×844 and 320×800 CSS viewports; every baseline resource is verified against the starting Git tree. All 25 current route/width cells have zero horizontal overflow, broken/pending images or console/page errors. Contact prefill uses the actual range stock CTA and verifies product, product slug, Hardwood Collection range, Engineered timber category and source. At 320 px the header drawer has 878 px of scroll content within a 799 px client height; submenu toggles, Escape, body lock and the outside-click listener pass. Form name/action, required consent, enquiry-field switching and visible, unobstructed submit pass. Outside-click coverage is a synthetic bubbling click on main because a full-height drawer has no guaranteed physical outside point; physical-device safe-area behavior remains unverified. No form was submitted.

## Commands and actual results

| Command | Result |
| --- | --- |
| `CONTEXT=dev npm run build` (twice) | PASS; deterministic preview package hash above |
| `npm run release:package:check` | PASS in preview context |
| `CONTEXT=production OZ_PRODUCTION_INDEXING_ENABLED=true npm run release:package:check` against preview bytes | Expected FAIL: `unexpected-global-noindex-in-production-fixture` |
| isolated `CONTEXT=production OZ_PRODUCTION_INDEXING_ENABLED=true npm run build` | PASS; fixture hash above |
| `npm run migration:check:local` | Expected FAIL: 172 blockers, 0 high, 0 medium; every blocker is an exact catalogue-quality route awaiting the protected plan |
| `npm run seo:gsc-audit` | PASS: 130 decisions, 60 manual rows, 72 exact mappings, 8 unresolved |
| `npm run seo:migration-hardening:check` | PASS: 60 semantic redirects, 130 GSC decisions, 12 owners; 360 pages remain in controlled review |
| `npm run perf:images:check` | PASS: 15 owners, 170 images, 86 assets, zero missing/mismatch/route issues |
| `npm run perf:priority-routes:check` | FAIL: three stale historical evidence hashes for floor levelling, laminate and engineered; not a reproduced browser failure |
| `npm run ui:qa` | LCP portion PASS; FAIL only on stale `assets/site.js`, engineered and floor-levelling source hashes |
| `npm run ui:lcp:check` | PASS: 7 routes / 10 physical files; repository debt remains 13,578 missing dimensions outside the focused set |
| `npm run ui:seo-freeze:check` | Expected FAIL before legacy comparison because the performance-only allowance sees three deliberate non-image source changes |
| `npm run ui:seo-freeze:compare` | Expected legacy FAIL: 253 differences (1 source, 7 protected-file, 245 page-field records) versus the much older `6909ee…` baseline |
| `node scripts/performance-html-freeze-allowance.mjs` | FAIL on the same three stale historical allowances |
| `npm run catalogue:field-integrity:check` | PASS: 167 ranges, 1,534 source products, 12 verified Hardwood colours |
| `npm run release:old-assets:check` | PASS: 2,201 HTML, zero old-host references |
| `npm run analytics:contract:check` | PASS: confirmed-thank-you-only; zero PII fields |
| `npm run seo:current-release-contract:check` | PASS: 13 protected files, 222 changed HTML, zero unexplained protected drift |
| `npm run ui:screenshots` | PASS: preserved historical 70/70 JPEG file/dimension matrix; it does not recapture browsers |
| `node scripts/oz-mig-004-browser-qa.mjs` | PASS: fresh 30 captures, 25/25 current browser cells, exact CTA prefill and 320px interactions; existing cached Playwright and installed Chrome, no new dependency |
| `git diff --check` | PASS |

The legacy freeze is intentionally not converted to green by accepting current output. `RELEASE_CONTRACT_REPORT.json` independently compares the task with the clean starting HEAD and allows only the named malformed-data, presentation, old-asset, analytics and copy repairs.

## Limits and remaining failures

- The 172 current indexable routes are a real production-readiness blocker until the exact manifest is approved and applied; bulk treatment remains prohibited.
- Three historical browser/performance hash checks require evidence refresh after the protected slice, so their route owners do not have to be captured twice.
- Form delivery/notifications, real GA4, Search Console writes, physical-device safe-area behaviour, product-sample colour accuracy and Lighthouse three-run medians are `NOT RUN`. Pre-promotion provider identity was subsequently verified as recorded below; custom-domain production behaviour remains untested.
- During fixture setup, one production-context build was initially invoked in the checkout rather than the copied directory. It caused no external action; the checkout and `dist/` were immediately rebuilt in `CONTEXT=dev`, and both `_headers` files were verified to contain global noindex before work continued. The subsequent fixture was built in the isolated directory and passed.

## Authorized promotion preflight — 9 September 2026

- Authority: Vincent's subsequent request to push to dev, merge to main and deploy. This authorizes promotion of the reviewed local repair layer; it does not approve `DECISION_PLAN.json` or production indexing/domain changes.
- Both remote branches were verified at `d0c66b802e544aa1a807f91798ea284c31c0998b` before promotion; no force push is planned.
- Exact provider target: `oztimberfloor`, site ID `fd68e39e-7863-4012-8a97-40bec59b23d9`, `https://oztimberfloor.netlify.app`. Provider reports no custom domain or domain aliases, and repository `https://github.com/VincentBang/oz-timber-floor`.
- Prior ready deployment retained as rollback reference: `6a97b5bfddcca00008698cc0`, commit `d0c66b802e544aa1a807f91798ea284c31c0998b`. No provider settings were changed.
- Installed CLI help confirms explicit `--site`, `--dir`, `--no-build`, `--prod`, `--context` and `--json`. Promotion targets the existing Netlify primary hostname with the validated global noindex artifact; it does not connect the WordPress domain.
- The analytics marker now retains only enum/boolean non-PII context, expires after ten minutes and is consumed once. Real-script VM tests cover context retention, malformed/future/expired markers, direct thank-you visits, tampering, no attempted-submit success and inactive GA4.
- The current release contract now unconditionally protects all canonical/robots/form tags, limits five product identity corrections to exact suffix removal, and pins the range identity, FAQ schema and complete link multiset. Twenty-one in-memory positive/negative checks verified rejection of previously overbroad exemptions.
- Fresh local regression run: package, analytics, catalogue integrity, old assets, image dimensions, LCP, GSC and semantic redirects pass. Readiness still fails only on the 172 unapproved catalogue routes; broken internal links/assets and redirect conflicts/loops/chains/missing/noindex targets are all zero. Historical UI/performance/freeze checks retain the separately documented stale-baseline failures; no test was weakened to conceal them.
- This preflight alone is not publish evidence. Subsequent actual Git promotion, provider deployment IDs and live results are recorded in `DEPLOYMENT_RECEIPT_2026-09-09.md`.
