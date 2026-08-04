# Oz Timber Floor Status

## Last Updated

4 August 2026

## Current Branch

`main`

## Current Task

Approved Bamboo retirement and controlled catalogue release treatment are applied. The local migration gate is green; repository promotion and production deployment evidence are still to be recorded.

## Completed Work

- Added a root-local `npm run migration:check` suite for required files, page contracts, JSON-LD, links/assets, sitemap, redirects, catalogue quality, form contract, analytics configuration and production/preview index controls.
- Added fail-closed Netlify header preparation: previews, branch deploys and a main deploy without approved production-indexing configuration receive `X-Robots-Tag: noindex, nofollow`. Indexable headers require the approved custom-domain state and explicit `OZ_PRODUCTION_INDEXING_ENABLED=true`.
- Added production-only GA4 build injection from `OZ_GA4_MEASUREMENT_ID`, while retaining `null` in source until the approved ID is supplied. The readiness gate fails when it is absent.
- Hardened client analytics against duplicate initialisation/listeners, retained URL attribution for the browser session, and removed free-text/enquirer fields from GA payloads.
- Added an explicit catalogue quality manifest and reports. Three explicitly missing-image product pages are now `noindex,follow`, have Product schema removed, and are excluded from the main sitemap.
- Retired the duplicate keyword sitemap safely: it now 301s to the main sitemap and is no longer advertised by `robots.txt`.
- Added release evidence, external verification, e-commerce decision, project-entry and WordPress/static parity records.
- Retired Bamboo publicly and mapped all 25 legacy Bamboo routes plus the landing variants directly to `/hardwood-timber-flooring-sydney/`; the public HTML scan now contains no Bamboo references.
- Applied an explicit 1,222-page catalogue decision manifest: 715 pages use an indexable parent range and 507 use a matching flooring category as their safe replacement.
- Applied controlled `noindex,follow`, Product-schema removal and sitemap exclusion to all 1,222 classified pages; 1,026 URLs were removed from the sitemap.
- Applied 220 direct redirect decisions and remapped 636 existing catalogue redirect rules (632 in the initial risk set plus four forced `301!` aliases found by the refined matcher) so no redirect now lands on a controlled/noindex page.
- Updated unique metadata for the remaining indexable catalogue pages and regenerated the migration evidence.

## Files Changed

- See `docs/seo-migration/MIGRATION_READY_FINAL_REPORT_2026-08-04.md` for the current decision and validation evidence. The 29 July report is preserved as a superseded pre-approval snapshot.

## Tests/Checks Run

- Baseline recorded: `main` at `efdcebc4e77a5125c1896199c96a9fd13d983078`, initially clean.
- The build and header selector are release-gated: noindex remains the safe default, including for the main Netlify hostname while no custom domain is connected.
- Local form contract passed all required Netlify attributes/fields.
- Local sitemap/redirect/link/asset checks passed structurally: 941 sitemap URLs, 1,910 redirect rules, zero sitemap issues, redirect conflicts, loops, chains, missing targets, noindex targets, broken local links or broken local assets.
- `npm run migration:check:local` returns `GO` with 0 blockers, 0 high findings and 0 medium findings.
- The catalogue report records 2,115 catalogue pages: 893 indexable and 1,222 explicitly controlled as `noindex,follow` fallbacks.

## Open Risks

- The current task is a large, scoped launch-hardening change set. Keep it isolated from unrelated work and preserve the generated decision evidence through promotion.
- The approved GA4 measurement ID is not present. Production analytics cannot be claimed operational until Netlify production-context configuration and Realtime verification are complete.
- Netlify form notification routing, spam handling, mobile submission and production/preview headers still need external verification.
- The currently linked Netlify site has no custom domain. Its main deploy must remain `noindex` until a production custom domain is approved and connected and `OZ_PRODUCTION_INDEXING_ENABLED=true` is explicitly enabled; the Netlify hostname is not an indexable production target.
- Repository validation is not deployment proof. The deployed commit, redirect responses, sitemap, robots/header behaviour and rollback evidence must be recorded after deployment.

## Next Recommended Task

Promote the validated change set through the approved branch flow, deploy the exact merged commit, then complete `docs/seo-migration/PRODUCTION_RELEASE_EVIDENCE.md` and the external smoke tests. This is now the safest next slice because the repository gate is green and the remaining uncertainty is deployment-state evidence.

## Blocked Decisions

- Confirm final form notification destination and test submission in Netlify.
- Confirm GA4/Search Console setup and production-only measurement ID.
- Confirm whether any supplier names can appear publicly. Current policy says no public supplier names.
- Confirm real project photos/details before claiming completed projects.

## Manual Data Needed

- Real completed project photos and details.
- Verified review snippets, if used.
- Final showroom/service area wording.
- Final form destination and notification inbox.
- Insurance/licence wording, if the business wants it shown.
- Search Console top linked pages and top linking sites export.
