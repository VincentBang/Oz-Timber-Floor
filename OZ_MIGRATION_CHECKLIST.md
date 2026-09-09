# Oz Timber Floor Migration Checklist

## OZ-MIG-004 local layer — 9 September 2026

- [x] Fresh 35-route GET evidence captured for WordPress and Netlify with redirect chains, headers and content fingerprints.
- [x] Publication/catalogue counts reconciled without summing overlapping inventories.
- [x] Verified 12-colour Hardwood Collection data and presentation repaired; unsupported fields omitted.
- [x] Old WordPress asset dependency reduced to zero release HTML references.
- [x] Analytics confirmed-success contract passes without PII.
- [x] Protected preview package builds deterministically and contains no private roots.
- [x] Isolated production fixture distinguishes global indexability from deliberate page-level controls.
- [x] Current-head release contract reports zero unexplained protected drift.
- [x] Replaced invalid initial screenshot comparison: 30 git-verified baseline/current captures at actual CSS widths, plus 25/25 current browser cells and 320px menu/form checks pass.
- [ ] Approve the exact decision manifest `ab50628d77038ea331e94d253aa4735ee0405a05f5d1d785b8cd28bf5650514e`.
- [ ] Apply and verify the exact 172-route control and nine owner decisions only after approval.
- [ ] Refresh stale historical browser/performance hashes after the protected slice.
- [x] Vincent subsequently requested dev push, main merge and deployment; existing noindex protection and unapproved route decisions remain unchanged.
- [x] Dev pushed, main fast-forwarded/pushed, Git-triggered protected Netlify deployment verified: 30 HTTP checks and four live browser cells pass; receipt recorded in the task directory.
- [ ] Obtain separate approval for form tests, DNS/domain changes, production indexing, GA4 and Search Console actions.

## Local Hardening Gate — 1 September 2026

- [x] Publication inventory reconciled at 943 unique canonicals and 943 canonical-only sitemap URLs.
- [x] Route inventory records 971 physical indexable HTML pages, 1,228 noindex routes and 350 redirect-only routes.
- [x] `_redirects` contains 1,912 validated rules with zero unsafe noindex destinations.
- [x] `migration/redirect-map.csv` contains 536 unique source rows with no duplicate source and no 301 self-map.
- [x] Catalogue inventory records 2,115 pages: 893 indexable and 1,222 controlled/noindex; the current manifest splits the controlled set into 6 exact-product, 743 parent-range and 473 category replacements.
- [x] GSC audit records 130 equity decisions, 60 priority manual rows, 72 exact product/range mappings and 8 unresolved mappings retained for review.
- [x] Permanent hardening gate pins 60 reviewed semantic redirect contracts and independently derives 74 mapping candidates with zero blockers.
- [x] Six ETF 9.0mm legacy product routes map to exact indexable product routes:
  - `/product/etf-hybrid-spc-9mm-dexter-oak/` -> `/products/etf-9-0mm-hybrid-dexter-oak/`
  - `/product/etf-hybrid-spc-9mm-driftwood/` -> `/products/etf-9-0mm-hybrid-driftwood/`
  - `/product/etf-hybrid-spc-9mm-grey-oak/` -> `/products/etf-9-0mm-hybrid-grey-oak/`
  - `/product/etf-hybrid-spc-9mm-new-zealand-blackbutt/` -> `/products/etf-9-0mm-hybrid-new-zealand-blackbutt/`
  - `/product/etf-hybrid-spc-9mm-oslo-oak-grey/` -> `/products/etf-9-0mm-hybrid-oslo-oak-grey/`
  - `/product/etf-hybrid-spc-9mm-spotted-gum/` -> `/products/etf-9-0mm-hybrid-spotted-gum/`
- [x] Helena Oak maps to `/ranges/etf-9-0mm-hybrid/`; its exact product candidate remains incomplete/noindex pending verified product data and imagery.
- [x] `/product-category/bamboo/stonewood-bamboo/` retains the approved retirement destination `/hardwood-timber-flooring-sydney/`.
- [x] `/hybrid-timber-flooring-look-of-timber-with-extra-durability/` retires to `/hybrid-flooring-sydney/`.
- [x] Fifteen reviewed incomplete product routes now preserve exact intent through their verified indexable parent ranges.
- [x] Twenty-two Grand Oak legacy product routes now use the Engineered Timber category instead of the semantically wrong Hybrid treatment.
- [x] Twelve additional verified product-to-parent-range corrections are pinned: Stone Floor (6), Storm (3), Swish Oak (2) and Swish Aqua (1).
- [x] The catalogue hardening report retains 361 quality findings for controlled review; findings do not trigger automatic noindex.
- [x] Bulk catalogue noindex is prohibited because 632 current redirect destinations were in the original control queue; each route requires a controlled data, redirect, retirement or 410 decision first.
- [x] Privacy-safe analytics hooks are present without personal/free-text payloads; no approved GA4 measurement ID is configured.
- [x] `npm run seo:gsc-audit` and `npm run seo:migration-hardening:check` pass and run after the inherited readiness check.
- [x] No production, DNS, custom-domain, indexing, deployment or commit action was taken for this hardening record.
- [ ] Verify Netlify Forms storage, notification routing, spam handling and a real mobile submission.
- [ ] Approve/configure the GA4 measurement ID and verify the privacy-safe events in Realtime.
- [ ] Approve and connect the production domain/DNS, then verify production headers, robots, sitemap and representative redirects on the real deployed artifact.

## Historical Local Release Gate — 4 August 2026

- [x] Approved Bamboo retirement applied as one mapped change.
- [x] All 25 legacy Bamboo routes plus landing variants redirect directly to `/hardwood-timber-flooring-sydney/`.
- [x] Public HTML and sitemap contain no Bamboo references.
- [x] Controlled catalogue manifest covers 1,222 pages: 715 parent-range replacements and 507 category replacements.
- [x] 1,026 controlled catalogue URLs removed from the sitemap.
- [x] 220 direct redirects applied and 636 existing catalogue rules remapped: 632 initial destinations plus four forced `301!` aliases.
- [x] Redirect validation reports zero conflicts, loops, chains, missing targets and noindex targets.
- [x] Sitemap validation reports 941 canonical URLs and zero issues.
- [x] `npm run migration:check:local` returns `GO` with 0 blockers, 0 high findings and 0 medium findings.
- [ ] Record the deployed commit, deploy ID and production smoke-test evidence.

## Old URL Inventory

Core old URLs to preserve or redirect:

- `/`
- `/about-us/`
- `/services/`
- `/contact-us/`
- `/sitemap/`
- `/blogs/`
- `/faqs/`
- `/gallery/`

Service old URLs:

- `/timber-floor-installation/`
- `/floor-levelling/`
- `/commercial-flooring/`
- `/office-flooring/`
- `/timber-floor-sanding-and-polishing/`
- `/timber-floor-removal-and-stripping/`

Category old URLs:

- `/hybrid/`
- `/laminate/`
- `/engineered-timber-flooring/`
- `/manufactured-wood/`
- `/solid-timber/`
- `/vinyl/`
- `/bamboo/`

Product/category URL groups:

- `/product-category/...`
- `/product/...`

## New URL Mapping

Required mappings:

- `/about-us/` -> `/about/`
- `/services/` -> `/services/`
- `/contact-us/` -> `/contact/`
- `/timber-floor-installation/` -> `/timber-flooring-installation-sydney/`
- `/floor-levelling/` -> `/floor-levelling-sydney/`
- `/commercial-flooring/` -> `/commercial-flooring-sydney/`
- `/office-flooring/` -> `/office-flooring-sydney/`
- `/timber-floor-sanding-and-polishing/` -> `/timber-floor-sanding-and-polishing-sydney/`
- `/timber-floor-removal-and-stripping/` -> `/timber-floor-removal-and-stripping-sydney/`
- `/hybrid/` -> `/hybrid-flooring-sydney/`
- `/laminate/` -> `/laminate-flooring-sydney/`
- `/engineered-timber-flooring/` -> `/engineered-timber-flooring-sydney/`
- `/manufactured-wood/` -> `/engineered-timber-flooring-sydney/`
- `/solid-timber/` -> `/solid-timber-flooring-sydney/`
- `/vinyl/` -> `/vinyl-flooring-sydney/`
- `/bamboo/` -> `/hardwood-timber-flooring-sydney/`
- `/blogs/` -> `/guides/`
- `/faqs/` -> `/faqs/`
- `/gallery/` -> `/projects/`
- `/sitemap/` -> `/sitemap/`

## Redirect Status

- [x] `_redirects` exists and contains 1,912 validated rules.
- [x] All required service redirects exist.
- [x] Product/category/range redirects have relevant controlled destinations.
- [x] Old Bamboo URLs redirect directly to `/hardwood-timber-flooring-sydney/`.
- [x] Typo URLs redirect to corrected canonical destinations.
- [x] Every local redirect target exists; none points to a controlled/noindex page.

## Sitemap Status

- [x] Sitemap exists with 943 validated canonical URLs.
- [x] Sitemap uses `https://oztimberfloor.com.au/`.
- [x] Sitemap excludes Netlify staging URLs.
- [x] Sitemap excludes Bamboo public URLs.
- [x] Sitemap excludes redirected typo URLs and the 1,222 controlled catalogue fallbacks.
- [x] Sitemap includes key services, indexable products/ranges, projects, guides, legal and contact pages.

## Robots Status

- [x] Repository robots/header logic is fail-closed.
- [ ] Confirm deployed Netlify hostname remains noindex while no custom domain is connected.
- [ ] After separate approval and domain connection, confirm production-domain robots/header responses are indexable.
- [ ] Do not submit staging or Netlify hostnames to Search Console.

## Noindex Status

- Preview, branch and main Netlify-hostname deployments stay noindex by default.
- Production-domain indexation requires approved domain connection plus explicit `OZ_PRODUCTION_INDEXING_ENABLED=true`.
- Confirm noindex is removed only from the approved custom production-domain response.

## Search Console Readiness

- [x] Preserve the dated 2026-09-01 performance workbooks and the generated 130-page equity decision map.
- [x] Retain the 60-row priority manual catalogue queue, including all 8 unresolved mappings; the wider 130-decision equity map records 72 exact product/range mappings.
- [ ] Export top linked pages.
- [ ] Export top linking sites.
- [ ] Confirm the final production sitemap URL on the approved deployed domain.
- [ ] Submit the sitemap only after production launch and indexing approval.
- [ ] Monitor 404s, redirect responses and coverage after launch.

## Contact Form Test

- [ ] Netlify form destination and notification inbox confirmed externally.
- [ ] Production/staging test submission successful.
- [ ] Thank-you or success state works on the deployed artifact.
- [ ] Enquiry type is captured.
- [ ] Product/range/category/source fields are captured where relevant.
- [ ] Phone and email CTAs work on the deployed artifact.

## Image Check

- No broken images.
- Product images are local, not hotlinked.
- Obvious mismatches flagged.
- Oversized images compressed where practical.
- Alt text is descriptive.

## Mobile Check

- Header menu works.
- Dropdowns/tap targets work.
- Product cards stack cleanly.
- Forms are usable.
- FAQ accordions work.
- No horizontal overflow.

## Footer and Legal Links

- Privacy Policy link works.
- Terms link works.
- Contact link works.
- Product/category links work.
- `/ranges/` remains linked.
- No Bamboo visible publicly.

## Launch Blockers

- Broken redirect targets.
- Broken contact form.
- Staging noindex/production index confusion.
- Public supplier names if current policy remains hidden supplier names.
- Major missing old URL mappings.
- Sitemap containing redirected or discontinued URLs.
- Product/range pages with misleading images or fake specs.

The repository gate currently finds none of the SEO/crawl blockers above. Netlify Forms delivery, GA4 ID approval, production domain/DNS, real production redirect responses, production header/indexing behaviour and deployment-state checks remain external verification items.
