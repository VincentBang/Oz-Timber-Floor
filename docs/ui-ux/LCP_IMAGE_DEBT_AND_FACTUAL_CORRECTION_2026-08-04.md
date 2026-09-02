# LCP Image Debt and Factual Correction — 4 August 2026

## Scope and outcome

This is a staged remediation record for the representative Australian Material Intelligence pages. It is not a claim that the repository-wide image-dimension debt is complete.

- Representative LCP routes checked: 7
- Representative physical HTML files checked: 10
- Selected LCP images marked explicitly with `data-lcp-image`: 10
- Selected LCP images using `loading="eager"`: 10
- Selected LCP images using `fetchpriority="high"`: 10, exactly one per physical HTML file
- Selected LCP images with intrinsic `width` and `height`: 10
- Additional above-fold product-gallery images given dimensions: 2
- Focused automated result: PASS

## Representative LCP images fixed now

| Route | Physical output | Selected asset | Intrinsic size | Result |
|---|---|---|---:|---|
| `/` | `index.html` | `/assets/images/hero/enchant-caramel-herringbone-interior.webp` | 1800×1500 | eager, high priority, dimensions present |
| `/products/` | `products/index.html`, `products.html` | `/assets/images/products/engineered/engineered-blackbutt-rustic.jpg` | 1500×1000 | eager, one high-priority image per file, dimensions present |
| `/ranges/` | `ranges/index.html` | `/assets/products/hybrid/avala/avala-blackbutt.webp` | 933×1400 | eager, high priority, dimensions present |
| `/hybrid-flooring-sydney/` | directory and flat-file outputs | `/assets/images/products/hybrid/hybrid-pacific-blackbutt.webp` | 300×300 | eager, one high-priority image per file, dimensions present |
| `/engineered-timber-flooring-sydney/` | directory and flat-file outputs | `/assets/images/products/engineered/engineered-blackbutt-rustic.jpg` | 1500×1000 | eager, one high-priority image per file, dimensions present |
| `/ranges/avala/` | `ranges/avala/index.html` | `/assets/products/hybrid/avala/avala-blackbutt.webp` | 933×1400 | eager, high priority, dimensions present |
| `/products/avala-blackbutt/` | `products/avala-blackbutt/index.html` | `/assets/products/hybrid/avala/avala-blackbutt.webp` | 933×1400 | primary image eager/high; two secondary gallery images remain lazy and now have dimensions |

Intrinsic sizes were read from the local image assets. No image file was resized, recompressed or visually altered.

## Repeated source opportunities

The repeated markup source was corrected where it was unambiguous and safe:

- `.tools/restructure-products-page.mjs` now emits the corrected LCP attributes for both physical Products outputs.
- `.tools/build-ranges-index.mjs` now emits the corrected LCP attributes for the Ranges index.

Additional generators that can re-create broad sets of range and product image markup were identified but were not run or mass-rewritten in this focused pass:

- `.tools/rebuild-range-pages.mjs`
- `.tools/apply-local-product-galleries.mjs`
- `.tools/import-missing-supplier-ranges.mjs`
- `.tools/import-operon-colour-gaps.mjs`

A future controlled catalogue pass should add one shared intrinsic-dimension resolver to those generators, validate it against JPEG, PNG and WebP assets, then regenerate only an explicitly reviewed catalogue set. Hand-editing thousands of generated files was intentionally avoided.

## Remaining image-dimension debt

The count uses the same repository exclusions as the migration accessibility audit: `.git`, `node_modules`, `.netlify`, `docs`, `migration` and `config` are excluded.

| Measurement | Before this pass | After this pass | Change |
|---|---:|---:|---:|
| HTML files | 2,201 | 2,201 | 0 |
| Images | 18,281 | 18,281 | 0 |
| Images missing width or height | 13,900 | 13,888 | −12 |

The remaining 13,888 images include below-fold catalogue cards and galleries as well as unscoped page heroes. They require a generator-level rollout with sampling and visual QA; this focused task does not classify all remaining images as below fold or safe to rewrite automatically.

## Projects factual correction record

The directory and flat-file Projects outputs (`projects/index.html` and `projects.html`) previously described example projects as being “handled by Oz Timber Floor.” No verified repository evidence establishes that the displayed examples are documented completed projects.

The unsupported phrase was replaced with an honest description of “common ... project types.” This is an approved factual correction, not a design change. The route, title, meta description, canonical, robots directive, H1, JSON-LD and link destinations were not changed by this correction. The revised wording does not represent generic examples as verified completed work.

## Automated gate

Run:

```bash
node scripts/ui-ux-lcp-check.mjs
```

The gate fails when a representative physical page:

- does not contain exactly one `data-lcp-image`,
- lazy-loads its selected LCP image,
- lacks the expected intrinsic dimensions,
- uses an unexpected LCP asset,
- has zero or multiple `fetchpriority="high"` images,
- references a missing selected asset, or
- restores the unsupported Projects provenance claim.

Current result:

```text
LCP QA PASSED routes=7 physicalFiles=10
IMAGE DEBT html=2201 images=18281 missingDimensions=13888
```

## Commands run for this slice

```bash
sips -g pixelWidth -g pixelHeight <representative-local-image>
node scripts/ui-ux-lcp-check.mjs
git diff --check
```

No deployment, commit, push, merge, provider configuration or external-service change was performed.
