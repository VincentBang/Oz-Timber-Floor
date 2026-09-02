# Keyword ownership map — 1 September 2026

## Purpose

This map assigns one primary indexable owner to each priority Sydney commercial search cluster. It is a cannibalisation control, not a direction to repeat exact-match wording across every page. The machine-readable source is `data/seo-keyword-ownership.json`; `npm run seo:migration-hardening:check` verifies that every owner is an indexable publication route, claims its primary phrase in the title/H1 pair, and has no conflicting indexable money-page owner.

## Primary owners

| Search intent | Primary owner | 12-month GSC signal | Ownership boundary |
| --- | --- | --- | --- |
| timber flooring Sydney; Sydney timber flooring; timber floors Sydney; broad Sydney supplier, installer and contractor | `/` | `timber flooring sydney`: 6 clicks, 7,723 impressions, position 38.16 | Homepage owns the broad commercial proposition. It should not displace category or service owners. |
| hybrid flooring Sydney | `/hybrid-flooring-sydney/` | 1 click, 5,085 impressions, position 38.70 | Product comparison, suitability and route into Hybrid ranges. |
| laminate flooring Sydney | `/laminate-flooring-sydney/` | 0 clicks, 4,669 impressions, position 48.69 | Product comparison, suitability and route into Laminate ranges. |
| engineered timber flooring Sydney | `/engineered-timber-flooring-sydney/` | 0 clicks, 2,888 impressions, position 51.89 | Engineered timber comparison and project fit. |
| solid timber flooring Sydney | `/solid-timber-flooring-sydney/` | 0 clicks, 2,755 impressions, position 47.30 | Solid timber comparison and project fit. |
| hardwood timber flooring Sydney | `/hardwood-timber-flooring-sydney/` | 0 clicks, 657 impressions, position 38.45 | Current hardwood pathway, including the documented Bamboo retirement destination. |
| vinyl flooring Sydney | `/vinyl-flooring-sydney/` | 0 clicks, 1,349 impressions, position 52.15 | Vinyl comparison and project fit. |
| timber flooring installation Sydney | `/timber-flooring-installation-sydney/` | 0 clicks, 1,718 impressions, position 45.16 | Installation planning, sequencing and site suitability. |
| floor levelling Sydney; floor preparation Sydney | `/floor-levelling-sydney/` | `floor levelling sydney`: 2 clicks, 528 impressions, position 10.98 | Floor flatness, preparation methods, inspection and installation implications. |
| commercial flooring Sydney | `/commercial-flooring-sydney/` | 0 clicks, 1,170 impressions, position 48.39 | Commercial project requirements and enquiry path. |
| office flooring Sydney | `/office-flooring-sydney/` | 0 clicks, 201 impressions, position 22.31 | Office-specific planning and operational constraints. |
| builder flooring contractor Sydney | `/builder-flooring-contractor-sydney/` | No separately reported exact-query row in the supplied export | Builder scheduling, coordination and contractor enquiry intent. |

The GSC signals above come from the Web / last 12 months exports dated 2026-09-01. The unfiltered Queries sheet contains exactly 1,000 rows, so query evidence is capped and must not be described as an exhaustive query universe.

## Homepage boundary

The homepage owns broad `timber flooring Sydney` intent through the combined supplier, installation and floor-preparation proposition. Category-specific phrases belong to their category pages, and `timber flooring installation Sydney` belongs to the installation service page. This keeps the homepage commercially broad without turning it into a duplicate Hybrid, Laminate, engineered, solid, vinyl or installation landing page.

## Category and supplier-page separation

Supplier pages remain separate only where they express a genuinely different supply-side intent. The hardening check reviews these six pairs:

| Category/comparison owner | Supply-side page | Supply-side intent required |
| --- | --- | --- |
| `/hybrid-flooring-sydney/` | `/hybrid-flooring-supplier-sydney/` | Stock, batch, quantity, supply-only pricing, pickup/delivery and lead time. |
| `/laminate-flooring-sydney/` | `/laminate-flooring-supplier-sydney/` | Stock, batch, quantity, supply-only pricing, pickup/delivery and lead time. |
| `/engineered-timber-flooring-sydney/` | `/engineered-timber-flooring-supplier-sydney/` | Stock, batch, quantity, supply-only pricing, pickup/delivery and lead time. |
| `/solid-timber-flooring-sydney/` | `/solid-timber-flooring-supplier-sydney/` | Stock, batch, quantity, supply-only pricing, pickup/delivery and lead time. |
| `/vinyl-flooring-sydney/` | `/vinyl-flooring-supplier-sydney/` | Stock, batch, quantity, supply-only pricing, pickup/delivery and lead time. |
| `/` | `/timber-flooring-supplier-sydney/` | Broad supply-only, stock and delivery intent without claiming the homepage cluster. |

The generated hardening report currently records all six pairs as differentiated and zero title/H1 ownership collisions. A supplier page must be flagged for manual review if its title/H1 claims the parent category phrase or if fewer than three distinct supply-side signals remain.

## Change control

- Add or change an owner first in `data/seo-keyword-ownership.json`, then run `npm run seo:migration-hardening:check`.
- Do not create suburb or near-duplicate service pages merely to target keyword variants.
- Product and range pages may use their exact product/range names; they do not become owners of broad Sydney category phrases.
- A page may be consolidated only after its redirect, canonical, internal links, sitemap state and GSC equity have a documented decision.
