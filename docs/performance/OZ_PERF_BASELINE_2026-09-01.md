# OZ-PERF-002 performance baseline — 2026-09-01

## Scope and repository state

- Repository: `/Users/daibang/Projects/oz-timber-floor`
- Branch: `main`
- HEAD: `6909ee83800c4c08e9207694c5bf70bce0c92eb0` (`Force Bamboo retirement redirects on Netlify`)
- Inherited worktree: 51 modified tracked paths and 189 untracked files. It was preserved; no reset, stash, clean, commit, push, merge or deployment was performed.
- Task baseline: 2,201 HTML files, 971 physical indexable HTML pages, 943 publication canonicals, 1,228 noindex routes, 350 redirect-only routes, 943 sitemap URLs and 1,912 redirect rules.
- Catalogue baseline: 2,115 pages — 893 indexable and 1,222 controlled/noindex.
- Frozen evidence: 130 GSC decisions, 60 semantic redirect contracts, 12 keyword owner clusters, the Bamboo retirement state, three matching GSC workbook hashes and the authorised 29-item SEO-freeze difference set.

External rollback evidence was created before edits:

| Backup | Path | SHA-256 |
|---|---|---|
| Tracked patch | `/tmp/oz-timber-floor-pre-OZ-PERF-002-20260901-133958.patch` | `61865dbbc5ad00b9907b7093ec7c28bb8f644546b50ca430b3c2fab76683ff48` |
| Untracked archive | `/tmp/oz-timber-floor-pre-OZ-PERF-002-untracked-20260901-133958.tar.gz` | `79826d64affec2020fb08068d55e83976f096b35d8dd2667ad997d41c16957c6` |
| Machine baseline | `/tmp/oz-timber-floor-pre-OZ-PERF-002-20260901-133958-baseline.json` | `90b037c9493df0944043188a698d0db324733b21990d60e85d7193737220f192` |

## Ownership finding

Clean routes must be resolved through `_redirects`, not guessed from directory layout. Exact 200 rewrites publish flat files for 12 of the 15 routes; the home page and two ETF routes use their normal index files. Installation, Commercial, Office and Products have flat/directory drift. The older browser evidence inspected directory copies for those routes, so it was not proof of the actual publication owner.

The legacy page generators are not safe for this task:

- the home generator contains a stale hero;
- the service generator does not reproduce every published flat owner;
- the category generator is broader than the 15-route scope;
- the Products generator would erase intentional flat/directory differences;
- the range and supplier importers are bulk or network-backed and can rewrite catalogue/redirect state;
- Projects, About and Contact have no reliable route-specific generator.

The bounded solution therefore uses `scripts/image-dimension-audit.mjs` as a final-stage, publication-owner postprocessor. It resolves owners from `scripts/publication-inventory.mjs` and permits only image performance attributes.

## Static image baseline

- Priority routes / publication owners: 15 / 15
- Local raster image occurrences: 170
- Unique local raster assets: 86
- Unique payload across the route set: 20,616,831 bytes
- Missing intrinsic-dimension attributes: 136
- Attribute/intrinsic mismatches: 0
- Missing local assets: 0
- Unreadable assets: 0
- Existing eager/high/LCP-marked primaries: 4
- Verified above-fold primaries explicitly lazy: 4
- Image preloads: 0
- `srcset`/`sizes`: 0

Some inherited `.jpg` catalogue URLs contain WebP-encoded bytes. Dimension discovery therefore has to inspect file signatures rather than guess from the suffix; URLs and assets remain unchanged.

## Browser baseline

The local site was served through an exact-redirect-aware server at `127.0.0.1:8766`. The 15 routes were measured at widths 1440, 1024, 768, 390 and 320, for 75 browser records. Baseline results: zero horizontal-overflow records and zero console warnings/errors, but every route had at least one missing-dimension image tag. Laminate, Solid Timber, ETF 9.0mm range and ETF Driftwood used a lazy above-fold primary at the measured desktop/tablet widths.

The table shows the 1440-pixel candidate; rendered sizes are measurements, not declared attributes.

| Route | Likely primary image | Intrinsic | Rendered | Missing dimensions on route | Loading | Priority |
|---|---|---:|---:|---:|---|---|
| `/` | `enchant-caramel-herringbone-interior.webp` | 1800×1500 | 553×461 | 11 | eager | high |
| `/floor-levelling-sydney/` | `sydney-timber-flooring-contractor.jpg` | 1600×1200 | 553×440 | 1 | browser default | none |
| `/timber-flooring-installation-sydney/` | `sydney-timber-flooring-contractor.jpg` | 1600×1200 | 553×440 | 1 | browser default | none |
| `/hybrid-flooring-sydney/` | `hybrid-pacific-blackbutt.webp` | 300×300 | 553×553 | 18 | eager | high |
| `/laminate-flooring-sydney/` | `laminate-coastal-blackbutt.jpg` | 500×500 | 553×553 | 19 | lazy | none |
| `/engineered-timber-flooring-sydney/` | `engineered-blackbutt-rustic.jpg` | 1500×1000 | 553×440 | 17 | eager | high |
| `/solid-timber-flooring-sydney/` | `sydney-timber-flooring-contractor.jpg` | 1600×1200 | 553×440 | 9 | lazy | none |
| `/commercial-flooring-sydney/` | `engineered-blackbutt-rustic.jpg` | 1500×1000 | 553×440 | 1 | browser default | none |
| `/office-flooring-sydney/` | `hybrid-natural-oak.jpg` | 500×500 | 553×553 | 1 | browser default | none |
| `/products/` | `engineered-blackbutt-rustic.jpg` | 1500×1000 | 553×440 | 21 | eager | high |
| `/ranges/etf-9-0mm-hybrid/` | `alaskan-oak.jpg` | 500×500 | 513×448 | 21 | lazy | none |
| `/products/etf-9-0mm-hybrid-driftwood/` | `driftwood.jpg` | 500×500 | 580×448 | 7 | lazy | none |
| `/projects/` | `office-project-gallery-1.webp` | 800×650 | 553×449 | 7 | browser default | none |
| `/about/` | `sydney-timber-flooring-contractor.jpg` | 1600×1200 | 553×440 | 1 | browser default | none |
| `/contact/` | `sydney-timber-flooring-contractor.jpg` | 1600×1200 | 553×440 | 1 | browser default | none |

## Payload observations deferred from this task

- Solid Timber references approximately 13.8 MB of unique local images; six below-fold 1200×1500 PNG swatches are about 1.92–2.49 MB each.
- Engineered Timber includes a 1,025,228-byte below-fold WebP.
- Home and Products each reference a 723,451-byte below-fold image.
- These assets remain lazy. Recompression was not attempted because product-colour accuracy requires separate lossless or pixel-verified QA.

## Baseline commands and outcomes

- `npm run build` — passed; non-production headers prepared, GA4 unconfigured, catalogue apply changed zero pages.
- `npm run migration:check:local` — `GO`, 0 blocker/high/medium findings.
- `npm run seo:gsc-audit` — passed with 130 decisions, 60 manual rows, 72 exact mappings and eight unresolved items.
- `npm run seo:migration-hardening:check` — passed with 60 redirects, 130 decisions, 12 owners and 361 controlled findings.
- `npm run ui:qa` and `npm run ui:lcp:check` — passed at baseline.
- `npm run ui:seo-freeze:check` — expected exit 1 with the authorised 29 differences.
- `git diff --check` — passed.

The full machine baseline and browser before records are preserved in the external task evidence and in `docs/performance/generated/priority-route-performance.json`.
