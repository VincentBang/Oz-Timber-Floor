# Oz Timber Floor Decision Log

## Pending Decision Record — OZ-MIG-004, 9 September 2026

- Status: **PENDING; not approved and not implemented**.
- Exact manifest: `docs/seo-migration/OZ-MIG-004/DECISION_PLAN.json`.
- SHA-256: `ab50628d77038ea331e94d253aa4735ee0405a05f5d1d785b8cd28bf5650514e`.
- The packet proposes retaining nine established WordPress canonical owners and moving the completed redesigned content to them, with newer staging-only slugs becoming direct aliases.
- Bamboo remains publicly retired. Current `_redirects` contains 21 executable Bamboo/Verdura rules; the historical “25” count is not the current executable-rule count.
- The exact 172 newly classified unsupported Hardwood-derived routes are proposed for controlled treatment. None is a direct current redirect destination, and the protected 632-destination cohort remains excluded from bulk action.
- The six differentiated supplier-page pairs remain separate and no new indexable service-area hub is proposed.
- This record does not supersede historical approved decisions unless and until Vincent approves this exact manifest and the resulting implementation passes.

## Current Strategic Decisions

- Oz Timber Floor remains separate from Operon Flooring.
- Oz Timber Floor is a traditional flooring supplier, installer, builder/commercial partner and floor preparation specialist.
- Operon owns quote flow, quote review, floorplan tooling, pricing logic and AI/data workflows.
- Product/range pages are enquiry pages, not checkout pages.
- Do not add checkout, instant pricing or internal pricing exposure.
- Products stays in the top navigation.
- Ranges moves under Products, not deleted.
- `/ranges/` remains live for SEO and internal linking.
- Contact remains visible in the main navigation.
- `Request Quote` is the primary header CTA.
- Projects page should become trust/proof infrastructure, not fake case studies.
- Privacy Policy and Terms remain in the footer.
- Placeholder images must be handled carefully and not misrepresented as exact product photos.
- Staging should stay noindex until launch readiness.
- Bamboo is discontinued publicly; old Bamboo URLs should redirect to a relevant hardwood/alternative page.
- The Bamboo retirement map was approved and applied on 4 August 2026. All 25 legacy routes and landing variants point directly to `/hardwood-timber-flooring-sydney/`; Bamboo is absent from public HTML and the sitemap.
- Supplier names should not be shown publicly under the current policy.
- Indexation is fail-closed. Preview, branch and main Netlify-hostname deploys remain noindex unless an approved custom production domain is connected and `OZ_PRODUCTION_INDEXING_ENABLED=true` is explicitly set; only that approved production-domain output may be indexable.
- The production GA4 measurement ID is supplied only at Netlify build time through `OZ_GA4_MEASUREMENT_ID`; source remains unset until an approved ID exists.
- Analytics hooks are restricted to the privacy-safe events `phone_click`, `email_click`, `quote_start`, `quote_submit`, `stock_check`, `supply_only_enquiry` and `supply_install_enquiry`; names, phone numbers, email addresses and message text must not be sent. No GA4 ID is approved or configured yet.
- Catalogue quality is manifest-controlled. The historical 4 August 2026 snapshot covered 1,222 pages: 715 used an indexable parent range and 507 used a matching category. These figures are preserved as history and superseded by the verified 1 September manifest; controlled pages remain available as `noindex,follow` fallbacks without Product schema and are excluded from the sitemap.
- Redirect continuity is part of the catalogue decision: 220 direct redirects were applied and 636 existing catalogue rules were remapped to indexable replacements (632 in the initial risk set plus four forced `301!` aliases found by matcher refinement). A release is invalid if any redirect destination becomes controlled/noindex.
- The duplicate keyword sitemap has no separate operational role and redirects to the main sitemap. Only the main sitemap is advertised in `robots.txt`.
- The static site remains enquiry-led. Rebuilding checkout requires separate revenue and operational evidence.

## Navigation Decisions

- Desktop top nav:
  - Home
  - Services
  - Products
  - Projects
  - Guides
  - Contact
  - Request Quote
- Products dropdown includes main flooring categories and All ranges.
- Services dropdown includes core flooring services.
- Footer can be more complete than header navigation.

## Content Decisions

- Copy should be customer-facing and professional.
- Avoid backend/system wording in public pages.
- Do not claim completed projects unless verified.
- Product/category/range pages should encourage:
  - request supply price
  - check stock availability
  - request supply + install quote
  - ask about this product

## SEO Decisions

- Preserve old WordPress ranking URLs with exact 301 redirects.
- Do not collapse product/category/range intent into one generic products page.
- Sitemap should list canonical production URLs only.
- Redirected typo URLs should not appear in sitemap.

## Decision Record — 4 August 2026

- Approved Bamboo replacement: `/hardwood-timber-flooring-sydney/`.
- Approved Bamboo scope: landing route and its variants, all 25 legacy redirect rules, sitemap membership and public references must move as one mapped retirement.
- Approved catalogue scope: all 1,222 classified pages receive explicit controlled treatment; broad unreviewed noindex is not the policy.
- Approved replacement hierarchy: use an indexable parent range where available, otherwise the matching flooring category.
- Approved route treatment: alias, retired and supplier-bearing routes redirect directly; incomplete fallback pages remain accessible as `noindex,follow` without Product schema.
- Verified local outcome: 941 sitemap URLs, 1,910 redirect rules, zero unsafe redirect destinations and local gate `GO` with 0 blocker/high/medium findings.
- Approved repository promotion path: push the validated commit to `dev`, merge that exact commit to `main`, then deploy `main`. This does not approve DNS/custom-domain changes or production indexation.

## Decision Record — 1 September 2026

- Reconciled current publication state: 943 unique publication canonicals and 943 sitemap URLs, represented by 971 physical indexable HTML pages. The wider route inventory also contains 1,228 noindex routes, 350 redirect-only routes and 1,912 redirect rules.
- Reconciled current catalogue state: 2,115 catalogue pages, of which 893 are indexable and 1,222 are controlled/noindex.
- Approved the repeatable GSC equity rule: include the exported top 100 Pages rows, every row with at least one click and every row with at least 500 impressions. The result is 130 page decisions.
- Recorded the current audit result: 60 priority manual catalogue rows, 72 exact product/range mappings and 8 unresolved mappings retained for controlled business/source review.
- The unfiltered Queries export is capped at exactly 1,000 rows and is directional, not exhaustive. Pages-sheet dimension sums are coverage evidence, not property traffic totals, and must not be combined with overlapping query/filter exports.
- Approved 60 semantic redirect contracts as permanent regression expectations.
- Approved these six exact ETF 9.0mm product mappings:
  - `/product/etf-hybrid-spc-9mm-dexter-oak/` -> `/products/etf-9-0mm-hybrid-dexter-oak/`
  - `/product/etf-hybrid-spc-9mm-driftwood/` -> `/products/etf-9-0mm-hybrid-driftwood/`
  - `/product/etf-hybrid-spc-9mm-grey-oak/` -> `/products/etf-9-0mm-hybrid-grey-oak/`
  - `/product/etf-hybrid-spc-9mm-new-zealand-blackbutt/` -> `/products/etf-9-0mm-hybrid-new-zealand-blackbutt/`
  - `/product/etf-hybrid-spc-9mm-oslo-oak-grey/` -> `/products/etf-9-0mm-hybrid-oslo-oak-grey/`
  - `/product/etf-hybrid-spc-9mm-spotted-gum/` -> `/products/etf-9-0mm-hybrid-spotted-gum/`
- Approved Helena Oak treatment: `/product/etf-hybrid-spc-9mm-helena-oak/` redirects to the indexable `/ranges/etf-9-0mm-hybrid/` range because no verified indexable exact product exists and the exact local candidate is incomplete/noindex.
- Preserved the Stonewood Bamboo retirement: `/product-category/bamboo/stonewood-bamboo/` -> `/hardwood-timber-flooring-sydney/`.
- Retired the legacy Hybrid guide `/hybrid-timber-flooring-look-of-timber-with-extra-durability/` to `/hybrid-flooring-sydney/`, which preserves the current product-selection intent without carrying unsupported legacy claims.
- Approved 15 incomplete product-to-parent-range corrections after verifying their indexable catalogue parents.
- Approved 22 Grand Oak product corrections to `/engineered-timber-flooring-sydney/`; the inherited Hybrid classification is semantically wrong, while no verified indexable exact Grand Oak product/range is currently publishable.
- Approved 12 additional product-to-parent-range corrections: Stone Floor (6), Storm (3), Swish Oak (2) and Swish Aqua (1).
- Reconciled the current 1,222-page control manifest to 6 exact-product replacements, 743 parent-range replacements and 473 category replacements. The historical 4 August split remains 715 parent-range and 507 category replacements.
- Bulk catalogue noindex is prohibited. The original control queue included 632 current redirect destinations, so indexation may change only after route-level data, redirect, retirement or 410 treatment and inbound redirect reconciliation.
- The 361 catalogue quality findings are a controlled manual-review queue, not an automatic noindex instruction.
- The permanent hardening result records 130 GSC decisions, 12 keyword owners, 60 semantic redirect contracts and zero hardening blockers. It independently derives 74 mapping candidates as a second check on the committed decision set.
- Privacy-safe analytics hooks are prepared, but no approved GA4 measurement ID is present and production analytics is not considered operational.
- This hardening record does not approve or perform a commit, deploy, domain/DNS change or production-indexing change.

## Decision Record — OZ-PERF-002, 1 September 2026

- The priority performance scope is fixed to 15 redirect-resolved publication owners. Flat files selected by exact 200 rewrites are authoritative over drifting directory aliases.
- `scripts/image-dimension-audit.mjs` is the authoritative final-stage generator for image dimensions and primary-image loading attributes on those owners. Legacy bulk/stale page generators are not approved for this scoped task.
- The final build order is header preparation, catalogue apply, then the scoped image-performance apply. Migration readiness fails if that exact contract is removed or reordered.
- Each priority route may have exactly one verified primary image with factual `width`/`height`, eager loading, high fetch priority, async decoding and the LCP marker. Below-fold lazy loading is preserved; multiple preloads and unverified image recompression are not approved.
- Performance-only SEO-freeze allowances are valid only when the complete owner HTML normalises exactly to the reconstructed pre-task file after removing `width`, `height`, `loading`, `fetchpriority`, `decoding` and `data-lcp-image`. All other page and protected-file differences remain blocking.
- The catalogue top-25 is an audit queue, not approval to change redirects, indexation, metadata, schema, product data or public copy. Class B requires verified evidence, Class C retains current control and Class D requires a separate mapped decision; Class A authorises only the named deterministic cleanup.
- OZ-PERF-002 completed locally with 136 missing dimension pairs resolved, 75/75 browser records passing, the exact same 29 authorised SEO-freeze differences, unchanged publication/GSC/workbook contracts and no commit, push, merge, deploy, DNS or production-indexing action.

## Open Decisions

- Final production launch date.
- Final Netlify Forms destination/notification routing and real submission test.
- Approved GA4 measurement ID and production Realtime verification.
- Production domain/DNS approval and real production redirect/header/robots/sitemap verification after deployment.
- Whether any supplier names may be shown publicly later.
- Real project proof availability.
- Insurance/licence wording, if the business wants to show it.
