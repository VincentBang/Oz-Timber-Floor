# Final Backlink Target Check

Original check: 2026-05-21; repository mapping update: 2026-08-04

## Summary
Backlink protection is directionally strong, but still limited by Search Console export granularity.

The available exports support prioritisation, but they do not pair every linking domain/page to the exact old Oz URL target. That means we can protect the important legacy destination groups confidently, but not produce a perfect per-backlink target proof set.

## Confirmed Protected Target Groups

### Services
- `/timber-floor-installation/` -> `/timber-flooring-installation-sydney/`
- `/floor-levelling/` -> `/floor-levelling-sydney/`
- `/commercial-flooring/` -> `/commercial-flooring-sydney/`
- `/office-flooring/` -> `/office-flooring-sydney/`

### Categories
- `/hybrid/` -> `/hybrid-flooring-sydney/`
- `/laminate/` -> `/laminate-flooring-sydney/`
- `/vinyl/` -> `/vinyl-flooring-sydney/`
- `/solid-timber/` -> `/solid-timber-flooring-sydney/`
- `/bamboo/` -> `/hardwood-timber-flooring-sydney/` (approved direct retirement map)

### Ranges
- `/product-category/laminate/infinite-laminate/` -> `/ranges/infinite/`
- `/product-category/engineered-timber/prestige-oak/` -> `/ranges/prestige-oak/`
- `/product-category/hybrid/hydroplank-wpc/` -> `/ranges/hydroplank-wpc/`
- `/product-category/solid-timber/topdeck-pre-finished-solid-timber/` -> `/ranges/solid/`
- multiple Kronoswiss and Villeroy & Boch AquaStop range URLs -> exact matching range pages

### Blogs
- `/blogs/` -> `/guides`
- sampled root-level legacy blog posts -> matching `/guides/[slug]/`

## Current Risk
The protection logic is validated in the repo but still needs proof on the next deployed artifact.

Historical live staging gap observed on 21 May 2026 (not current deployment evidence):
- three old product URLs still return `404` on staging:
  - `/product/eco-eco-swish-laminate-new-england-blackbutt/`
  - `/product/eco-eco-swish-laminate-nutmeg/`
  - `/product/eco-eco-swish-oak-contemporary-elegant-milano-oak/`

Repo status:
- these redirects have now been added to `/_redirects`
- they still need a fresh deploy and re-test before the migration can be called safe

## Limitation
- If target-paired backlink exports become available later, this document should be refreshed with exact linked-old-URL to new-target confirmation.

## Conclusion
Backlink target protection is in place at the mapping layer. The next deployment still needs representative response tests before the repo-side fixes can be called live.
