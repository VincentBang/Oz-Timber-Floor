# Oz Timber Floor Migration Checklist

## Local Release Gate — 4 August 2026

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

- [x] `_redirects` exists and contains 1,910 validated rules.
- [x] All required service redirects exist.
- [x] Product/category/range redirects have relevant controlled destinations.
- [x] Old Bamboo URLs redirect directly to `/hardwood-timber-flooring-sydney/`.
- [x] Typo URLs redirect to corrected canonical destinations.
- [x] Every local redirect target exists; none points to a controlled/noindex page.

## Sitemap Status

- [x] Sitemap exists with 941 validated canonical URLs.
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

- Export top linked pages.
- Export top linking sites.
- Confirm final sitemap URL.
- Prepare to submit sitemap after production launch.
- Monitor 404s after launch.

## Contact Form Test

- Form destination confirmed.
- Test submission successful.
- Thank-you or success state works.
- Enquiry type is captured.
- Product/range/category/source fields are captured where relevant.
- Phone and email CTAs work.

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

The repository gate currently finds none of the SEO/crawl blockers above. Form delivery, production header behaviour and deployment-state checks remain external verification items.
