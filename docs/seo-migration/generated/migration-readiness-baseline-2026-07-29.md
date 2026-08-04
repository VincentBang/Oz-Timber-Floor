# Migration readiness baseline — 2026-07-29

## Verified baseline facts

| Item | Verified value |
| --- | --- |
| Repository path | `/Users/daibang/Projects/oz-timber-floor` |
| Branch at task start | `main` |
| HEAD at task start | `efdcebc4e77a5125c1896199c96a9fd13d983078` |
| Initial git status | Clean (no pre-existing dirty files) |
| Site architecture | Static Netlify publish from repository root |
| Initial Netlify publish directory | `.` |
| HTML files | 2,201 |
| Main sitemap URLs | 1,973 |
| Keyword sitemap URLs | 15, all duplicated in the main sitemap |
| Active redirect rules | 1,755 (1,722 `301`, 30 `200!`, 2 `410`, plus catch-all) |
| Central catalogue source | `data/product-catalogue.json` with 1,534 products and 167 ranges |
| Static catalogue output | 1,948 product folders and 167 range folders |

## Verified initial controls

- `_redirects`, `robots.txt`, `sitemap.xml`, `netlify.toml`, contact markup, `assets/contact-config.js`, `assets/site.js`, catalogue scripts/data, historical migration evidence and launch runbooks were reviewed.
- Contact markup already had a stable Netlify form name, matching hidden `form-name`, honeypot, consent, a clean thank-you action, attribution fields and progressive enquiry fields.
- Production-domain canonicals and Open Graph URLs were already present in the sampled/generated static output.
- The prior generated May/June audits were historical evidence, not a current release decision.

## Suspected or verified risks at baseline

- `_headers` applied `X-Robots-Tag: noindex, nofollow` globally. A production deploy would therefore be blocked from indexing unless the header was made context-aware.
- GA4 was centralised in `assets/contact-config.js` but the measurement ID was `null`; tracking could not be considered operational.
- The former keyword sitemap was a complete duplicate subset and added no separate sitemap role.
- Catalogue source and static output diverged. Some product pages had missing source records, incomplete/fallback facts, duplicate identity/metadata candidates, missing image evidence or unsupported source status.
- Existing import scripts under `scripts/` contain historical absolute paths outside this repository and must not be used for this task.
- `OZ_STATUS.md` and `docs/staging_indexing_qa.md` contained stale branch/indexing statements.
- Discontinued Bamboo remained a public static page and required a separate mapped redirect/retirement decision.

## External checks not possible locally

- Netlify production branch, site settings, deploy ID, form detection, notification routing, spam behaviour, and production/preview headers.
- Approved GA4 measurement ID and Realtime/DebugView event evidence.
- DNS, apex/`www` alias, SSL and email-record preservation.
- Search Console submissions, indexed-URL status and backlink coverage.
- Business confirmation for legacy catalogue records, supplier-name policy exceptions, discontinued Bamboo handling, real project proof and any checkout-revenue case.

## Changes made during this task

See `docs/seo-migration/MIGRATION_READY_FINAL_REPORT_2026-07-29.md` for the completed implementation and fresh validation result. No deployment, DNS change, Netlify configuration change, form submission, push, merge or production write was performed.
