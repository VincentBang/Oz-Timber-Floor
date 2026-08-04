# Oz Timber Floor Task Queue

## Completed Release-Safety Work — 4 August 2026

- [x] Validated 1,910 redirect rules with zero conflicts, loops, chains, missing targets or noindex destinations.
- [x] Regenerated a canonical-only 941-URL sitemap with zero validation issues.
- [x] Retired Bamboo publicly and redirected all 25 legacy routes plus landing variants directly to `/hardwood-timber-flooring-sydney/`.
- [x] Applied controlled treatment to 1,222 catalogue pages, removed 1,026 from the sitemap, applied 220 direct redirects and remapped 636 existing catalogue rules (632 initial plus four forced `301!` aliases).
- [x] Reached local migration gate `GO` with 0 blocker/high/medium findings.

## P0: Launch Blockers / SEO Damage Risk

- Preserve the validated redirect and sitemap state through deployment; re-test the deployed responses.
- Confirm the main Netlify-hostname deploy remains noindex while no custom domain is connected; enable indexation only after custom-domain approval with `OZ_PRODUCTION_INDEXING_ENABLED=true`.
- Recheck that public supplier-name leakage remains absent under the current hidden-supplier policy.
- Verify preview/branch/Netlify-hostname noindex protection and, separately, approved custom-domain index behaviour.
- Test contact form submission and thank-you handling.
- Export Search Console top linked pages and top linking sites before launch.

## P1: Money-Page Conversion and SEO

- Use `OZ_SEO_GROWTH_SYSTEM.md` keyword-to-page map to avoid keyword cannibalisation.
- Strengthen `/engineered-timber-flooring-sydney/` for agency target terms.
- Strengthen `/commercial-flooring-sydney/` for commercial timber flooring and installation terms.
- Strengthen `/floor-levelling-sydney/` for floor levelling, self-levelling compound and subfloor preparation.
- Strengthen `/hybrid-flooring-sydney/`, `/laminate-flooring-sydney/`, `/vinyl-flooring-sydney/`, `/office-flooring-sydney/` and `/timber-flooring-installation-sydney/`.
- Improve internal links between money pages and product/category pages.

## P2: Catalogue/Range/Product Cleanup

- Audit product and range images for missing, generic or mismatched images.
- Enrich the 1,222 controlled catalogue pages only from verified source data; do not re-index them merely to increase page count.
- Clean product/range names and suspected typo slugs.
- Ensure product pages have enquiry CTAs with correct URL parameters.
- Keep `/products/` concise and balanced.
- Keep `/ranges/` useful as the complete range index.
- Document unknown product specs instead of inventing them.

## P3: UX Improvements

- Keep main nav clear and mobile-safe.
- Improve range/product page scanability.
- Keep FAQ accordions showing questions while hiding answers.
- Remove messy right-column section intros and overly academic list layouts.
- Check mobile spacing, card density and hero scale.

## P4: Content and Projects

- Add real project proof when photos/details are supplied.
- Build guide pages only where useful and internally linked.
- Improve Projects page over time with verified work examples.
- Add review snippets only if real and approved.

## P5: Backlog Polish

- Compress oversized images.
- Consolidate duplicate CSS only after launch-critical work is stable.
- Improve schema depth where useful.
- Add post-launch Search Console monitoring workflow.
- Review page speed and Core Web Vitals.
