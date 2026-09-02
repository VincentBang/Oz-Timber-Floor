# Australian Material Intelligence UI/UX QA

Date: 4 August 2026

## Verdict

PASS for local visual review.

The Oz Timber Floor migration site now has an isolated, append-only visual layer using the approved “Australian Material Intelligence” design tokens. The protected SEO, URL, catalogue, form, analytics and deployment surface is unchanged.

This work has not been committed, pushed, merged or deployed.

## Preflight

- Repository root: `/Users/daibang/Projects/oz-timber-floor`.
- Branch: `main`.
- Baseline HEAD: `6909ee83800c4c08e9207694c5bf70bce0c92eb0`.
- Initial working tree: clean.
- Origin: `git@github.com:VincentBang/oz-timber-floor.git`.
- Netlify publish directory: repository root (`.`).
- Product and range HTML is generator-owned; visual presentation was therefore changed only through the shared stylesheet.

## Implementation boundary

- Visual source changed: `assets/site.css`.
- Reversal: remove the final `Australian Material Intelligence — isolated UI/UX layer` block.
- Support tooling added: `scripts/ui-ux-seo-freeze.mjs` and four `ui:seo-freeze:*` package commands.
- No public HTML, route, sitemap, redirect, catalogue source, form contract, analytics configuration or Netlify deployment file changed.
- Product and range page presentation remains shared-CSS-driven; generated page HTML was not edited.

## Visual system applied

- Canvas, surface, sage, oak, ink, eucalypt, clay and brass tokens match the approved hexadecimal values.
- Spacing follows the approved 8–96 px scale.
- Controls use 12 px radii, cards 18 px and feature/media surfaces 24 px.
- Primary enquiry actions use clay; eucalypt remains the technical/navigation colour; brass is decorative.
- Navigation, hero media, cards, catalogue grids, specification panels, CTAs, enquiry controls and footer treatments share the same material hierarchy.
- The mobile navigation now grows in document flow, remains viewport-contained and supports deterministic dropdown open/close state.
- Existing mobile-only truncation after 12 catalogue cards was removed so filtered/browsed cards remain reachable.

## Screenshot matrix

Routes:

1. `/`
2. `/products/`
3. `/ranges/`
4. `/hybrid-flooring-sydney/`
5. `/timber-flooring-installation-sydney/`
6. `/projects/`
7. `/contact/`
8. `/ranges/avala/`
9. `/products/avala-blackbutt/`

Viewports:

- 1440 × 1000
- 1024 × 768
- 390 × 844
- 320 × 800

Evidence:

- Baseline: `docs/ui-ux/screenshots/before/` — 36 route/viewport screenshots plus two open-menu captures.
- Result: `docs/ui-ux/screenshots/after/` — 36 route/viewport screenshots, two open-menu captures, one product menu/sticky-CTA capture and two focused enquiry-form captures.
- Baseline metrics: `docs/ui-ux/generated/baseline-responsive-metrics.json`.
- Result metrics: `docs/ui-ux/generated/after-responsive-metrics.json`.
- Navigation and console evidence: `docs/ui-ux/generated/after-navigation-console.json`.

## Responsive and interaction results

| Check | Baseline | Result |
| --- | ---: | ---: |
| Route/viewport captures | 36 | 36 |
| Pages with horizontal overflow | 0 | 0 |
| Pages with broken loaded images | 0 | 0 |
| Pages with a visible image not ready at capture | 1 | 0 |
| Tested routes with console issues | 0 | 0 |
| Contact form width at 1440 | 372 px | 617 px |
| Contact form width at 1024 | 305 px | 505 px |
| Contact form width at 390 | 316 px | 316 px |
| Contact form width at 320 | 246 px | 246 px |

Additional interaction evidence:

- Desktop Services dropdown changed from `aria-expanded="false"` to `true`, rendered as a grid and remained fully inside the viewport.
- Mobile dropdown state passed `false → true → false` at both 390 px and 320 px.
- Mobile menu link/action panels resolved to left/right edges of 16/374 px at 390 and 16/304 px at 320.
- Page scroll width matched the viewport exactly at both mobile sizes.
- The representative product mobile menu did not overlap the sticky CTA.
- Hero, H1 and primary CTA geometry for every route/viewport is recorded in the responsive metrics files.

## SEO and migration freeze

Before and after manifests:

- `docs/ui-ux/generated/seo-freeze-before.json`
- `docs/ui-ux/generated/seo-freeze-after.json`

The manifest protects all 941 sitemap-indexable pages:

- route and source file,
- title and title count,
- meta description and count,
- canonical and count,
- robots directive and count,
- Open Graph URL and count,
- HTML language,
- H1 text and count,
- normalized JSON-LD hash,
- internal href destination set,
- full link contract,
- full form semantics and source hash,
- full HTML source hash.

It also freezes hashes for 16 release-critical files covering redirects, headers, robots, sitemap, Netlify configuration, deploy preparation, analytics/contact behaviour, catalogue sources and redirect source data.

Command:

```bash
npm run ui:seo-freeze:check
```

Result:

```text
SEO freeze PASS: 941 indexable page contracts and 16 protected file hashes are unchanged.
```

The existing migration gate was also run against an isolated temporary copy containing the upgraded stylesheet:

```text
GO: 0 blocker(s), 0 high finding(s), 0 medium finding(s).
```

## Approval boundary

The local visual implementation is ready for review. Commit, branch promotion, merge and deployment require separate explicit approval.
