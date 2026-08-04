# Redirect Implementation Notes

## Summary
- Redirect source of truth remains `/_redirects` for the static Netlify publish.
- `netlify.toml` now explicitly documents that redirect strategy.
- Active redirect rules: `1910`
- Active permanent redirects: `1878`
- Redirect matrix rows: `1725`
- Fresh migration backup patch: `/docs/seo-migration/worktree-backup-before-final-migration-audit-20260519-205608.patch`

## Migration-critical redirect work completed in this pass
- Verified the repo still routes legacy service URLs to the correct service destinations.
- Verified the repo still routes legacy product-category URLs to the right category or range destinations.
- Mapped all 25 Bamboo legacy URLs plus landing variants directly to the approved `/hardwood-timber-flooring-sydney/` replacement.
- Applied 220 direct release-decision redirects and remapped 636 existing catalogue rules away from controlled/noindex routes: 632 initial destinations plus four forced `301!` aliases found by matcher refinement.
- Flattened redirect chains so old URLs now resolve straight to the final canonical target.
- Removed the stale `/ranges/aquatuff-flooring/ -> /hybrid-flooring-sydney/` redirect so the live Aquatuff range page can be served directly.
- Tightened `/blogs/` to point directly to `/guides` to avoid an unnecessary slash-normalisation hop.

## Redirect QA results
- Missing redirect targets in `/_redirects`: `0`
- Redirect chains after cleanup: `0`
- Redirect loops after cleanup: `0`
- Redirect destinations resolving to controlled/noindex pages: `0`

## Important examples flattened in this pass
- typo product aliases now redirect straight to the final product page:
  - `artisan-calcatta -> artisan-tile-calacatta`
  - `artisan-grema-marfil -> artisan-tile-crema-marfil`
- ETF alias range redirects now point directly to the ETF canonical range pages.
- Eco alias range redirects now point directly to the final numeric canonical range pages.
- legacy Bass / Preference product alias chains were flattened to their final product destinations.

## Deferred but not blocking
- Long-tail alias rationalisation inside the content layer still deserves a later cleanup pass.
- If a target-paired backlink export becomes available later, `BACKLINK_TARGET_REDIRECTS.md` should be refreshed one more time.
