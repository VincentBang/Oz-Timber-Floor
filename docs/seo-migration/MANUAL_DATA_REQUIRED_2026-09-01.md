# Manual data required — 1 September 2026

## Decision boundary

Do not publish an incomplete product because an old URL has clicks, and do not bulk-noindex the catalogue because a page has thin fields. The migration inventory found 632 active legacy redirect destinations within the catalogue control scope. Each affected page therefore needs a controlled data, redirect, retirement or 410 decision before its indexation treatment changes.

The complete priority queue is `docs/seo-migration/generated/catalogue-equity-manual-review-2026-09-01.csv`. It contains 60 rows selected from Search Console equity and catalogue state. Candidate state is 46 noindex, 10 missing and 4 indexable. The recommended decisions are 41 redirects to a parent range, 13 manual product decisions, 5 redirects to a category and 1 keep decision.

## Priority catalogue decisions

| Legacy intent | GSC evidence | Current safe treatment | Manual evidence required |
| --- | --- | --- | --- |
| ETF Hybrid SPC 9mm Helena Oak | 2 clicks, 51 impressions, position 6.08 | Redirect to `/ranges/etf-9-0mm-hybrid/`; keep the incomplete alias noindex. | Confirm whether Helena Oak is current or retired, its correct current range, a reliable local image, current specifications and stock/enquiry wording. Do not create or index `/products/etf-9-0mm-hybrid-helena-oak/` without this evidence. |
| Grand Oak | `/grand-oak/`: 8 clicks, 702 impressions; Grand Oak 14.5mm category: 2 clicks, 242 impressions | Redirect the 22 reviewed legacy product paths to the indexable Engineered Timber category pending a stronger verified range decision. | Confirm the current canonical Grand Oak range, current products, imagery and whether an exact range remains commercially supported. |
| Infinite Laminate | Category: 6 clicks, 252 impressions; Brush Box product: 1 click, position 5.92 | Retain the Laminate category fallback; keep the incomplete product noindex. | Confirm current range status, exact product membership, thickness/board facts and reliable local imagery. |
| Topdeck prefinished solid timber | 9 clicks, 901 impressions | Redirect to the current `/ranges/solid/` range. | Confirm that `/ranges/solid/` remains the closest commercial equivalent and whether a more specific current range should be published. |
| Jatoba Brazilian Cherry | 7 clicks, 330 impressions | Redirect to `/ranges/solid/`; exact candidate remains noindex. | Confirm availability/retirement, current range, reliable image, thickness, dimensions and other source-backed facts. |
| Kronoswiss Aquastop Majestic Walnut | 5 clicks, 164 impressions, position 7.34 | Retain `/ranges/kronoswiss-aquastop/` pending a product-level decision. | Confirm current exact product status, range membership, image and specifications before changing the redirect or indexation. |

## Controlled redirect treatments already recorded

The reviewed contracts record these controlled semantic corrections:

- 15 initial legacy product paths redirect to their verified parent ranges;
- 22 Grand Oak legacy product paths redirect to the Engineered Timber category; and
- 12 additional legacy product paths redirect to verified parent ranges: Stone Floor (6), Storm (3), Swish Oak (2) and Swish Aqua (1).

These redirects preserve the closest verified current intent. They do not approve indexing an incomplete exact product route; publication still requires the evidence below.

## Minimum product/range evidence

Before a controlled page can return to `index,follow`, record and verify:

- current or retired status;
- exact canonical product/range name and slug;
- current parent range and flooring category;
- a correct local compressed image of the selected product, not a generic substitute;
- thickness and board dimensions where applicable;
- installation method and substrate requirements where supported;
- current warranty/specification source where any warranty or performance wording is shown;
- stock wording that remains an enquiry, not an availability guarantee;
- unique title, meta description, H1 and self-canonical;
- a genuine internal path from category/range navigation;
- redirect treatment for every old or alias URL;
- sitemap inclusion only after the page is indexable and publication-safe.

Unknown facts should remain blank or use a restrained confirmation prompt. Do not invent waterproof, commercial-rating, scratch-proof, bathroom, warranty, certification, stock or pricing claims. Do not add Product Offer/availability schema without reliable current data.

## Quality-review queue

The hardening report currently flags 361 indexable catalogue pages for controlled review:

| Pattern | Pages flagged | Required review |
| --- | ---: | --- |
| Repeated `Confirm product details before order` specifications | 347 | Replace core placeholders with verified facts or make a route-level indexation/redirect decision. |
| Duplicated name token | 10 | Correct the source name/title/H1 without changing the canonical route unless separately approved. |
| `Image to confirm` | 5 | Supply and verify the correct local image or decide that the page should remain controlled. |

Counts overlap where a page has more than one issue. These findings must not be converted into a bulk noindex rule: the same catalogue layer receives legacy redirect equity, and the release process previously had to remap 632 destinations before applying controlled treatment.

## Business and project evidence still required

Only publish a project as a completed Oz Timber Floor case study when the business supplies:

- original approved images and permission to publish them;
- product and range used;
- suburb or broader area approved for publication;
- project type and scope;
- preparation work actually completed;
- installation method;
- a factual outcome without unsupported superiority claims.

Until then, visible project content must remain clearly labelled as common planning examples rather than verified completed work.

Business confirmation is also required before adding or changing:

- opening hours or social profiles in LocalBusiness/Organization schema;
- licence, certification, warranty or trade-association claims;
- customer reviews, testimonials, aggregate ratings or review schema;
- showroom visit wording beyond the verified address;
- any public price, discount, instant quote or stock guarantee.

## External verification still required

- Submit an approved staging enquiry and confirm the Netlify Forms record, notification inbox and spam handling.
- Supply the approved GA4 measurement ID, if analytics is to be enabled, then verify privacy-safe events without names, phone numbers, email addresses or message text.
- Verify production/staging headers, representative legacy redirects, sitemap and robots on the approved deployed artifact.
- Confirm Search Console ownership and post-cutover monitoring access.
- Keep staging noindex and do not enable production indexing until the separate launch approval is recorded.
