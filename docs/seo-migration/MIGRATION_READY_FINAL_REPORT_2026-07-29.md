# Oz Timber Floor migration readiness — final report

> **Superseded 4 August 2026.** This is the preserved pre-approval snapshot. Bamboo and catalogue blockers described here were resolved through mapped decisions. Use `MIGRATION_READY_FINAL_REPORT_2026-08-04.md` for the current repository verdict.

**Date:** 29 July 2026
**Repository:** `/Users/daibang/Projects/oz-timber-floor`
**Baseline:** `main` at `efdcebc4e77a5125c1896199c96a9fd13d983078`, initially clean
**Deployment actions:** none — no deploy, DNS, Netlify setting, form submission, push, merge or production write was performed.

## Executive verdict: NO-GO

The static release now has production-safe header selection, a form/analytics contract, redirect and sitemap validation, catalogue classification, and release evidence. It is **not safe to deploy** yet: 1,026 catalogue URLs that the gate classifies as non-indexable are still indexable and sitemap-listed, and discontinued Bamboo remains public with a sitemap entry and a group of legacy redirects targeting it. The approved GA4 measurement ID is also absent, so analytics cannot be claimed operational.

## Implementation and release gates

| Issue | Severity | Implementation completed | Evidence | Remaining external action |
| --- | --- | --- | --- | --- |
| Production vs preview index controls | Passed locally / external verification pending | Context-selected `_headers`; production has security headers only, deploy previews/branch deploys add `X-Robots-Tag: noindex, nofollow`. | `config/netlify-headers/`, `scripts/prepare-netlify-deploy.mjs`, production build. | Confirm headers on the approved Netlify production and preview deploys. |
| GA4 safety and attribution | BLOCKER | Central build-time `OZ_GA4_MEASUREMENT_ID` injection, duplicate guards, session attribution and three privacy-safe events are implemented. Source remains unset. | `assets/site.js`, `assets/contact-config.js`, `npm run migration:check`. | Set approved production-only `G-...` ID in Netlify; validate Realtime/DebugView. |
| Netlify Forms contract | Passed locally / external verification pending | Form markup, honeypot, consent, hidden form name, attribution/prefill and success path are validated locally. | `docs/contact_conversion_qa.md`, generated readiness report. | Submit one approved preview/mobile test; confirm Netlify Forms record, inbox routing and spam behaviour. |
| Invalid category-as-thickness facts | Fixed safely | Removed category values masquerading as thickness from source, visible specifications and Product JSON-LD. | `catalogue-sanitisation-2026-07-29.md`: 43 source records and 58 pages. | Supply verified values only where the business approves them. |
| Catalogue indexation | BLOCKER | Machine-readable classifications and controlled noindex/schema/sitemap treatment are implemented; only explicit overrides auto-apply. | `catalogue-quality-report.json`, `catalogue-quality-report.md`. | Approve a route-by-route data, redirect, retirement or noindex decision for the 1,026 currently sitemap-listed URLs. |
| Discontinued Bamboo | BLOCKER | Detected and made an explicit gate; historical documents now point to the current decision. No broad redirect change was made. | Current public landing page, sitemap entry and 25 rules targeting it; readiness report. | Approve one mapped replacement/410 plan for Bamboo before changing the 25 rules, wildcard, public page and guide references together. |
| Redirect integrity | Passed locally | Full `_redirects` audit runs in the local gate; redundant duplicates were removed only where the preceding wildcard had the same target. | `redirect-validation-report.json` and `.md`. | Re-test representative legacy URLs on the approved deployed artifact. |
| Sitemap integrity | BLOCKER | Duplicate keyword sitemap is retired to a 301 and no longer advertised; controlled noindex pages are excluded. | `sitemap-validation-report.json`, `_redirects`, `robots.txt`. | Resolve Bamboo, then verify the deployed sitemap in Search Console. |
| On-page, links, accessibility and security baseline | Passed locally / optimisation backlog | HTML contracts, local links/assets, JSON-LD parsing, alt text, focus visibility, reduced-motion and safe headers are checked. | `migration-readiness-report.json`, `performance-accessibility-report.json`. | Perform visual/mobile and Core Web Vitals checks against the approved deploy. |

## Local validation results

| Command | Result |
| --- | --- |
| `CONTEXT=production npm run build` | Passed. Production header template selected; no unapproved catalogue control changed on the repeatable build. |
| `npm run migration:check:local` | Expected **NO-GO**: 1,027 blockers (1 Bamboo policy blocker plus 1,026 indexable catalogue-quality blockers), 449 medium findings. |
| `npm run migration:check` | Expected **NO-GO**: 1,028 blockers (the local blockers plus missing approved GA4 configuration), 449 medium findings. |
| `node --check scripts/migration-readiness.mjs` | Passed. |
| `node --check scripts/prepare-netlify-deploy.mjs` | Passed. |
| `node --check assets/site.js` | Passed. |
| `git diff --check` | Passed; no whitespace errors. No staging or commit was performed in this task. |

The static gate is intentionally non-zero while unsafe catalogue indexation, Bamboo retirement and GA4 prerequisites remain. It does not treat the current staging deployment as proof of this un-deployed change set.

## Catalogue results

| Measure | Result |
| --- | ---: |
| Catalogue pages scanned | 2,115 |
| Product pages | 1,948 |
| Range pages | 167 |
| Classified indexable | 893 |
| Classified non-indexable, pending remediation | 1,222 |
| Currently `noindex,follow` and absent from sitemap | 31 |
| Newly controlled missing-image product pages in this task | 3 |
| Still indexable and sitemap-listed despite non-indexable classification | 1,026 |
| Manual-review classification | 485 |
| Category-as-thickness source records corrected | 43 |
| Category-as-thickness pages corrected | 58 |

“Classified non-indexable” is a review queue, not a claim that all 1,222 pages have already been quarantined. Broad automatic noindex was deliberately not applied because it would make 632 current 301 destinations point to noindex pages, risking organic continuity. The 31 current noindex pages are absent from the sitemap; three of those controls were added in this task for explicitly approved missing-image pages.

Top remaining quality failure counts: empty/placeholder thickness 774, missing source record 478, Product schema missing image 310, legacy/alias range 185, public supplier name 33, invalid board dimensions 28, missing product name 28, missing image 28, and duplicate product identity 17. The complete page-level output is in `docs/seo-migration/generated/catalogue-quality-report.json`.

## Redirect and sitemap results

| Measure | Redirects | Sitemap |
| --- | ---: | ---: |
| Total | 1,754 rules | 1,970 URLs |
| Conflicts | 0 | — |
| Loops | 0 | — |
| Chains | 0 | — |
| Missing targets | 0 | — |
| Redirects to noindex targets | 0 | — |
| Redirecting sitemap URLs | — | 0 |
| Noindex sitemap conflicts | — | 0 |
| Current policy violation | 25 Bamboo-targeting rules require approval | 1 public discontinued Bamboo URL |
| URLs removed from sitemap during this task | — | 3 explicit missing-image product URLs |

The retired keyword sitemap now returns a 301 to the main sitemap and is no longer listed in `robots.txt`.

## Exact changed files

### Build, deployment and runtime controls

- `package.json`
- `netlify.toml`
- `_headers`
- `_redirects`
- `robots.txt`
- `sitemap.xml`
- `sitemap-keyword-targets.xml` (removed)
- `config/netlify-headers/production`
- `config/netlify-headers/non-production`
- `scripts/prepare-netlify-deploy.mjs`
- `scripts/migration-readiness.mjs`
- `assets/site.js`
- `assets/site.css`

### Catalogue controls

- `data/product-catalogue.json`
- `data/catalogue-quality-overrides.json`
- `products/oakleaf-hd-plus-bellmore-oak/index.html`
- `products/oakleaf-hd-plus-hampton-oak/index.html`
- `products/oakleaf-hd-plus-windsor/index.html`
- The exact additional 58 rendered catalogue paths are listed one-to-one in `docs/seo-migration/generated/catalogue-sanitisation-2026-07-29.md`.

### Records, runbooks and generated evidence

- `OZ_STATUS.md`
- `OZ_DECISION_LOG.md`
- `docs/contact_conversion_qa.md`
- `docs/staging_indexing_qa.md`
- `docs/discontinued_products.md`
- `docs/sitemap_qa.md`
- `docs/redirect_qa.md`
- `docs/final_launch_readiness_report.md`
- `docs/projects/PROJECT_ENTRY_TEMPLATE.md`
- `docs/seo-migration/ECOMMERCE_DECISION_RECORD.md`
- `docs/seo-migration/EXTERNAL_VERIFICATION_CHECKLIST.md`
- `docs/seo-migration/PRODUCTION_RELEASE_EVIDENCE.md`
- `docs/seo-migration/WORDPRESS_STATIC_PARITY_MATRIX.md`
- `docs/seo-migration/MIGRATION_READY_FINAL_REPORT_2026-07-29.md`
- `docs/seo-migration/generated/catalogue-quality-report.json`
- `docs/seo-migration/generated/catalogue-quality-report.md`
- `docs/seo-migration/generated/catalogue-sanitisation-report.json`
- `docs/seo-migration/generated/catalogue-sanitisation-2026-07-29.md`
- `docs/seo-migration/generated/live-staging-smoke-test-2026-07-29.md`
- `docs/seo-migration/generated/migration-readiness-baseline-2026-07-29.md`
- `docs/seo-migration/generated/migration-readiness-report.json`
- `docs/seo-migration/generated/migration-readiness-report.md`
- `docs/seo-migration/generated/performance-accessibility-report.json`
- `docs/seo-migration/generated/performance-accessibility-report.md`
- `docs/seo-migration/generated/redirect-representative-tests.md`
- `docs/seo-migration/generated/redirect-validation-report.json`
- `docs/seo-migration/generated/redirect-validation-report.md`
- `docs/seo-migration/generated/sitemap-validation-report.json`
- `docs/seo-migration/generated/sitemap-validation-report.md`

## External launch gates

Only these actions require access outside this repository:

1. **Business approval:** approve the Bamboo retirement map for its landing page, 25 legacy redirect rules (including the category wildcard), product-card links and three guide references; select the relevant replacement or 410 treatment.
2. **Business/data approval:** approve the treatment for the 1,026 remaining indexable catalogue URLs and confirm whether supplier-name-bearing content may be public.
3. **Netlify UI:** set `OZ_GA4_MEASUREMENT_ID` only for production, confirm deploy branch/site/domain, form notification routing, preview/production headers and a real form submission.
4. **GA4:** verify `phone_call_click`, `email_click` and `generate_lead` in Realtime/DebugView without personal or free-text event parameters.
5. **DNS:** verify apex/non-`www` canonical host, `www` redirect, SSL, and preservation of MX/SPF/DKIM/DMARC before any domain cutover.
6. **Search Console:** after the approved production deploy passes the repository gate, submit/refresh only the main sitemap and inspect top linked legacy URLs.

## Exact next action for the repository owner

Approve this bounded instruction before any Bamboo rewrite: **“Change `/bamboo-flooring-sydney/`, its 25 legacy Bamboo redirect targets (including the category wildcard), and public Bamboo references to the approved relevant alternative or 410 policy; use `/hardwood-timber-flooring-sydney/` where it is the approved relevant replacement.”**

That is the safest next move because it resolves a documented public-discontinued-product conflict without weakening legacy redirects. After that approval, the remaining catalogue review can be applied in controlled batches and the gate rerun.
