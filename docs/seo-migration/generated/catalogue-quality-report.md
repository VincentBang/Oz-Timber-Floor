# Catalogue quality report

Generated: 2026-09-09T11:28:01.104Z

This report is generated from the current static product/range pages and `data/product-catalogue.json`. It does not invent specifications. The report identifies every non-indexable classification; only explicit, reviewable entries in `data/catalogue-quality-overrides.json` receive automatic noindex/schema/sitemap changes. This prevents an unreviewed bulk noindex from breaking legacy redirect equity.

## Classification totals

| Classification | Pages |
| --- | ---: |
| indexable | 721 |
| manual-review | 485 |
| needs-data | 722 |
| redirect-only | 185 |
| retired | 2 |

## Failure totals

| Failure | Pages |
| --- | ---: |
| empty-or-placeholder-thickness | 949 |
| missing-source-record | 478 |
| legacy-or-alias-range | 185 |
| range-alias | 46 |
| invalid-board-dimensions | 28 |
| missing-product-name | 28 |
| missing-image | 28 |
| duplicate-product-identity | 17 |
| public-supplier-name | 7 |
| retired-product | 2 |

## URL lists

- Indexable catalogue pages: 721. Full machine-readable list: `catalogue-quality-report.json` under `pages` with `classification: "indexable"`.
- Pages classified as non-indexable pending remediation: 1394. Full machine-readable list: `catalogue-quality-report.json` under `pages` where `classification` is not `indexable`. This is a review queue, not a claim that all of those URLs have already been noindexed.
- Pages currently protected with `noindex,follow`: 1222. Those pages have also been removed from the main sitemap.
- Applied approved indexation controls to 0 page(s) and excluded 0 URL(s) from the main sitemap.

## Review rule

A page can return to `indexable` only after its source record/page facts are complete and accurate, its local image is valid, it has a unique canonical, and any Product schema is meaningful. Do not solve a failure by adding invented dimensions, warranty, performance, stock, or certification claims. Add an override only after choosing a safe redirect/retirement decision where inbound legacy URLs are affected.
