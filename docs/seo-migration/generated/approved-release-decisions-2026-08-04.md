# Approved release decisions — 4 August 2026

- Catalogue pages receiving explicit controlled treatment: 1222.
- Replacement basis: 715 indexable parent ranges; 507 matching categories.
- Direct alias/retired/supplier-bearing routes mapped to safe replacements: 220.
- Existing catalogue redirect destinations remapped in the initial approved application: 632.
- Additional forced catalogue aliases remapped after matcher validation: 4.
- Total existing catalogue redirect destinations remapped: 636.
- Existing Bamboo redirect destinations remapped in the initial approved application: 25.
- Bamboo landing rewrite converted to a direct retirement redirect in the initial approved application: 1.
- Idempotence check for this run: 0 catalogue and 0 Bamboo destinations still required remapping.
- Remaining redirect destinations pointing to controlled/noindex routes: 0.

The full page-level decision manifest is `data/catalogue-quality-overrides.json`. Catalogue pages remain available as `noindex,follow` fallbacks unless their decision requires a direct redirect. Product schema and sitemap membership are removed by `npm run catalogue:apply`.
