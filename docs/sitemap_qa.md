# Sitemap QA

> **Current local result — 4 August 2026:** `sitemap.xml` contains 941 canonical URLs and the generated validator reports zero issues. Bamboo and all 1,222 controlled catalogue fallbacks are excluded. See `docs/seo-migration/MIGRATION_READY_FINAL_REPORT_2026-08-04.md`. Live production verification remains pending.

## Current Status

- URL count: 941.
- Host used: `https://oztimberfloor.com.au/`.
- Validation issues: 0.
- Netlify staging URLs: 0.
- Bamboo URLs: 0.
- Controlled catalogue fallbacks: 0.
- The decision pass removed 1,026 catalogue URLs that were previously sitemap-listed.

## Historical Status (superseded)

- Sitemap regenerated from canonical HTML pages.
- URL count: 1,771.
- Host used: `https://oztimberfloor.com.au/`.
- Netlify staging URLs found: 0.
- Bamboo URLs found: 0.
- Discontinued Bamboo product URLs found: 0.
- Typo canonical URLs removed: `artisan-calcatta`, `artisan-grema-marfil`.
- `/products/`, `/ranges/`, main service pages, category pages, range pages and product pages are included.

## Fixes Applied

- Removed typo product pages from sitemap by deleting the duplicate typo page folders and preserving 301 redirects.
- Removed any Bamboo sitemap exposure.
- Kept corrected canonical product URLs such as `/products/artisan-calacatta/` and `/products/artisan-crema-marfil/`.

## Production Note

Before production launch, remove staging noindex protection only after the real domain is connected and the final sitemap has been rechecked.
