# Oz Timber Floor migration readiness — 4 August 2026

**Repository:** `/Users/daibang/Projects/oz-timber-floor`
**Current repository verdict:** **LOCAL GO**
**Deployment evidence:** pending

## Executive verdict

The two approval blockers from 29 July are resolved in the repository. Bamboo is retired through a mapped replacement, and every page in the remaining catalogue queue has an explicit controlled decision. `npm run migration:check:local` returns `GO` with 0 blockers, 0 high findings and 0 medium findings.

This is a repository verdict, not proof of a live production release. The exact merged commit, Netlify deploy, response headers, redirects, sitemap, form delivery and measurement must still be recorded in `PRODUCTION_RELEASE_EVIDENCE.md`.

The linked Netlify site currently has no custom domain. Its main deploy must remain noindex. Production indexation is allowed only after a custom domain is explicitly approved and connected and `OZ_PRODUCTION_INDEXING_ENABLED=true` is deliberately enabled. The Netlify hostname is not an indexable production target.

## Approved decisions applied

| Area | Applied treatment | Result |
| --- | --- | --- |
| Bamboo | Map the landing variants and all 25 legacy routes directly to `/hardwood-timber-flooring-sydney/`; remove sitemap and public HTML references together. | No public Bamboo HTML references; no Bamboo sitemap URL; direct relevant replacement with no chain. |
| Catalogue queue | Apply explicit controlled treatment to 1,222 pages. Use an indexable parent range for 715 and a matching category for 507. | All 1,222 are `noindex,follow` fallbacks without Product schema and are absent from the sitemap. |
| Redirect continuity | Apply 220 direct redirects and remap existing destinations before controlled pages become noindex. | 636 existing catalogue rules were remapped (632 initial destinations plus four forced `301!` aliases); zero redirect targets now resolve to controlled/noindex pages. |
| Sitemap | Exclude all controlled/discontinued/redirected URLs and retain canonical production-domain URLs only. | 941 URLs; zero validator issues; 1,026 catalogue URLs removed by this decision pass. |

## Current local evidence

| Check | Result |
| --- | --- |
| HTML pages scanned | 2,201 |
| Sitemap URLs | 941 |
| Redirect rules | 1,910 |
| Catalogue pages | 2,115 |
| Catalogue pages indexable | 893 |
| Catalogue pages explicitly controlled | 1,222 |
| Broken internal links / local assets | 0 / 0 |
| Redirect conflicts / loops / chains | 0 / 0 / 0 |
| Missing redirect targets / noindex targets | 0 / 0 |
| Local gate | `GO`: 0 blocker, 0 high, 0 medium |

Evidence sources:

- `docs/seo-migration/generated/migration-readiness-report.json`
- `docs/seo-migration/generated/redirect-validation-report.json`
- `docs/seo-migration/generated/sitemap-validation-report.json`
- `docs/seo-migration/generated/catalogue-quality-report.json`
- `docs/seo-migration/generated/approved-release-decisions-2026-08-04.json`
- `data/catalogue-quality-overrides.json`

## Remaining external verification

1. Record the exact clean merged commit and Netlify deploy ID.
2. Keep the Netlify-hostname deployment noindex while no custom domain is connected.
3. After separate custom-domain/indexation approval, set `OZ_PRODUCTION_INDEXING_ENABLED=true` and verify production robots and response headers.
4. Re-test representative legacy, Bamboo and catalogue redirects against the deployed artifact.
5. Confirm the deployed sitemap contains 941 canonical production-domain URLs and no controlled/Bamboo URLs.
6. Test Netlify form submission, notification, honeypot and mobile success behaviour.
7. Configure the approved production GA4 ID and verify privacy-safe events in Realtime/DebugView.
8. Complete Search Console submission/monitoring only for the approved custom production domain.

## Release boundary

The repository is ready for controlled promotion and deployment. It is not yet evidence that the public domain has been migrated, that forms or analytics work live, or that any Netlify-hostname deployment should be indexed.
