# GSC migration hardening — 1 September 2026

## Outcome

Search Console page equity is now represented by a repeatable 130-page decision map, and reviewed semantic redirects have a permanent regression check. The audit protects exact product/range intent without weakening the existing redirect, sitemap, catalogue or staging-indexation gates.

No deployment, DNS, custom-domain or production-indexing change is part of this work.

## Preserved source exports

The three original workbooks are stored unmodified in `docs/seo-migration/source/search-console/2026-09-01/`:

| Workbook | Filter | Query rows | Page rows |
| --- | --- | ---: | ---: |
| `https___oztimberfloor.com.au_-Performance-on-Search-2026-09-01.xlsx` | Web, last 12 months | 1,000 | 388 |
| `https___oztimberfloor.com.au_-Performance-on-Search-2026-09-01 (1).xlsx` | Web, last 12 months, query contains `Sydney` | 465 | 59 |
| `https___oztimberfloor.com.au_-Performance-on-Search-2026-09-01 (2).xlsx` | Web, last 12 months, query contains `timber flooring sydney` | 37 | 20 |

The unfiltered query export stops at exactly 1,000 rows. That is an export row cap, so the query list is directional rather than exhaustive. The filtered exports add focused evidence but overlap the unfiltered data and must not be added together as independent traffic totals.

## The 130-page equity rule

`scripts/gsc_migration_audit.py` reads the unfiltered Pages sheet and includes a page when any of these conditions is true:

1. it is in the exported top 100 pages;
2. it recorded at least 1 click; or
3. it recorded at least 500 impressions.

The source contains 388 page rows. The rule selects 130: the top 100 plus 30 qualifying rows outside the top 100. Those decisions contain all 870 clicks represented by the Pages dimension and 360,828 of 367,522 page-row impressions. The exact output is `docs/seo-migration/generated/gsc-equity-map-2026-09-01.csv`.

These dimension sums are coverage checks for the exported page rows, not property traffic totals. Search Console can aggregate dimensions differently from the Chart sheet: the 870 summed page-row clicks exceed the 863-click chart total in the same workbook. Do not report 870 as total site traffic or add page/query/filter exports together.

Decision distribution:

| Decision | Rows |
| --- | ---: |
| redirect to range | 65 |
| keep | 29 |
| redirect to category | 15 |
| manual product decision | 15 |
| redirect to exact product | 6 |

The semantic review classifies 72 rows as exact product/range mappings and leaves 8 unresolved mappings in the manual queue. All 130 current effective targets resolve to an indexable publication route in the generated audit. That does not make every candidate product page safe to index; unresolved product evidence remains in the manual queue.

## ETF 9.0mm semantic redirect decisions

The old ETF grouping carries material equity: its category URL recorded 61 clicks, 1,961 impressions and average position 6.27. Six colour pages have verified, indexable exact replacements and now redirect directly to them.

| Old URL | GSC clicks / impressions | Reviewed target | Decision |
| --- | ---: | --- | --- |
| `/product/etf-hybrid-spc-9mm-driftwood/` | 11 / 482 | `/products/etf-9-0mm-hybrid-driftwood/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-grey-oak/` | 7 / 282 | `/products/etf-9-0mm-hybrid-grey-oak/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-new-zealand-blackbutt/` | 5 / 77 | `/products/etf-9-0mm-hybrid-new-zealand-blackbutt/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-spotted-gum/` | 4 / 55 | `/products/etf-9-0mm-hybrid-spotted-gum/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-oslo-oak-grey/` | 2 / 16 | `/products/etf-9-0mm-hybrid-oslo-oak-grey/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-dexter-oak/` | 1 / 29 | `/products/etf-9-0mm-hybrid-dexter-oak/` | Exact product 301. |
| `/product/etf-hybrid-spc-9mm-helena-oak/` | 2 / 51 | `/ranges/etf-9-0mm-hybrid/` | Range 301 plus manual product decision. |

Helena Oak is intentionally not redirected to `/products/etf-9-0mm-hybrid-helena-oak/`: that route does not exist as a verified indexable product, while the legacy local product record is incomplete and noindex. The verified 9.0mm range is the safe current landing page until current range membership, a correct local image and source-backed product facts are supplied.

The range/category aliases are also pinned to `/ranges/etf-9-0mm-hybrid/`. The reviewed contracts live in `data/seo-migration-redirect-expectations.json` and are reused by the release-decision script so a later catalogue pass cannot silently restore the broad category fallback.

## Controlled catalogue redirect corrections

The reviewed redirect contracts also record these route-by-route semantic corrections:

- 15 initial legacy product paths were corrected to their verified parent ranges;
- 22 Grand Oak legacy product paths were corrected to the Engineered Timber category instead of the previous Hybrid category treatment; and
- 12 additional legacy product paths were corrected to verified parent ranges: Stone Floor (6), Storm (3), Swish Oak (2) and Swish Aqua (1).

These mappings preserve the closest verified current intent without publishing incomplete exact product pages. They remain subject to the permanent redirect-target, indexation, canonical and sitemap checks described below.

## Why bulk noindex is unsafe

Catalogue control cannot be decided from page count alone. The approved release exercise identified 632 active legacy redirect destinations landing on catalogue routes entering controlled treatment, plus four forced aliases found during matcher validation. Applying a broad noindex rule first would have turned hundreds of working legacy pathways into redirects to noindex pages and discarded product/range intent.

The safe order is route-by-route:

1. classify the page from verified data;
2. select an exact product, exact range, relevant category, documented retirement target or, only when no substitute exists, 410;
3. remap every inbound redirect away from a controlled page;
4. then apply `noindex,follow`, remove Product schema and remove the controlled URL from the sitemap;
5. re-run redirect, catalogue, sitemap and publication gates.

The current readiness report has zero redirect destinations pointing to noindex routes. The historical 632 count remains important evidence for why an indiscriminate catalogue quarantine must never be introduced.

## Catalogue review, not automatic quarantine

The manual equity output contains 60 priority rows:

- candidate state: 46 exact pages are currently noindex, 10 candidate routes are missing and 4 candidates are indexable; and
- recommended decision: 41 redirect to a parent range, 13 retain a manual product decision, 5 redirect to a category and 1 remains a keep decision.

Separately, the hardening report flags 361 indexable catalogue pages for controlled quality review: 347 contain repeated placeholder specifications, 10 show a duplicated name token, and 5 use `Image to confirm`. These are review findings, not automatic noindex instructions. Every affected page must be reconciled with inbound redirects, source data, imagery, internal navigation and current customer usefulness before indexation changes.

## Permanent checks

`npm run seo:gsc-audit` regenerates the dated equity and manual-review CSV files using only the Python standard library. It fails if the preserved workbook is missing, the Pages schema changes, or the qualifying set is no longer exactly 130 rows.

`npm run seo:migration-hardening:check` verifies:

- one 301 rule per reviewed source;
- the reviewed exact target has not changed;
- no reviewed target is missing, redirected, noindex, canonicalised elsewhere or absent from the sitemap;
- the planned redirect map contains no 301 self-map or conflicting source target;
- the 130 equity rows remain covered;
- exact product/range equity is not collapsed into a generic category;
- each priority keyword cluster has one indexable title/H1 owner;
- supplier pages remain differentiated from category pages;
- catalogue quality patterns are reported without applying bulk indexation changes.

Both checks run after the existing readiness command in `migration:check` and `migration:check:local`; no inherited gate was removed.

## Local execution result

On the 2026-09-01 candidate worktree:

- `package.json` parsed successfully as JSON;
- `npm run seo:gsc-audit` passed with 130 equity decisions, 60 manual catalogue rows, 72 exact product/range mappings and 8 unresolved mappings retained for review;
- `npm run seo:migration-hardening:check` passed with 60 reviewed redirect contracts, 130 GSC decisions, 74 independently derived candidates (6 exact products, 55 parent ranges and 13 reviewed/category fallbacks), 12 keyword owners, zero blockers and 361 controlled catalogue-quality findings.
- `migration/redirect-map.csv` contains 536 unique source rows with zero duplicate sources and zero 301 self-maps.

## Generated evidence

- `docs/seo-migration/generated/gsc-equity-map-2026-09-01.csv`
- `docs/seo-migration/generated/catalogue-equity-manual-review-2026-09-01.csv`
- `docs/seo-migration/generated/seo-migration-hardening-report.json`
- `docs/seo-migration/generated/seo-migration-hardening-report.md`
- `docs/seo-migration/generated/approved-release-decisions-2026-09-01.json`
- `docs/seo-migration/generated/approved-release-decisions-2026-09-01.md`
- `docs/seo-migration/generated/redirect-validation-report.json`
- `docs/seo-migration/generated/sitemap-validation-report.json`
- `docs/seo-migration/generated/catalogue-quality-report.json`

## Remaining release boundary

Repository checks cannot prove deployed Netlify redirect responses, production headers, form delivery, notification routing, Search Console ownership or analytics collection. Those remain external launch checks. Staging must remain noindex, and production indexing still requires the separate approved release flag.
