# WordPress-to-static parity matrix

Updated: 2026-08-04

This is a migration decision matrix, not a claim that every old WordPress URL has been live-tested today. It is based on the current static output, legacy redirect material, and a read-only review of the public WordPress homepage.

| Area | Status | Static treatment | Follow-up |
| --- | --- | --- | --- |
| Homepage and core Sydney flooring proposition | retained / improved | Static homepage, service navigation and enquiry CTA exist. | Confirm production visual/lead-path smoke test. |
| Contact details and showroom | retained | Static contact form and contact configuration use the same public phone/email/address. | Verify Netlify notification routing externally. |
| Services: installation, levelling, removal, sanding, commercial, office | retained | Dedicated static service pages and clean-route rewrites. | Test representative old URLs after approved deploy. |
| Main flooring categories | retained | Hybrid, laminate, engineered timber, solid timber and vinyl are represented. | Resolve duplicate category/product aliases before launch. |
| Product and range coverage | controlled / locally validated | 893 catalogue pages remain indexable. The current manifest controls 1,222 incomplete/alias/retired pages as noindex fallbacks, with 6 exact-product, 743 parent-range and 473 category replacements. | Enrich from verified supplier/business data before re-indexing any controlled page. |
| Guides/blog content | retained / redirected | Static guide pages and legacy blog redirects are present. | Re-test high-value legacy URLs on the new deploy. |
| Gallery/projects | improved, not asserted as proof | Static page uses honestly labelled common project examples. | Add only verified project entries using the project template. |
| Legal pages | retained | Privacy and terms pages remain available through footer paths. | Confirm final legal wording owner. |
| Legacy WooCommerce/cart behaviour | intentionally retired pending evidence | Catalogue enquiries replace checkout. | See `ECOMMERCE_DECISION_RECORD.md`. |
| Bamboo | retired / mapped | All 25 legacy routes plus landing variants redirect directly to `/hardwood-timber-flooring-sydney/`; public HTML and sitemap references are removed. | Re-test representative Bamboo sources on the deployed artifact. |
