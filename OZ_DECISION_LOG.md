# Oz Timber Floor Decision Log

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
- Catalogue quality is manifest-controlled. The approved 4 August 2026 decision covers 1,222 pages: 715 use an indexable parent range and 507 use a matching category. These pages remain available as `noindex,follow` fallbacks without Product schema and are excluded from the sitemap.
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

## Open Decisions

- Final production launch date.
- Final form backend/destination and submission test.
- Whether any supplier names may be shown publicly later.
- Real project proof availability.
- Insurance/licence wording, if the business wants to show it.
