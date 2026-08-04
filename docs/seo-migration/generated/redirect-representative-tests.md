# Representative legacy redirect checks

Run these against the approved production deploy after release. Local validation confirms the mapping layer only; it cannot prove a Netlify response before deployment.

| Legacy path | Expected first-hop result |
| --- | --- |
| /contact-us/ | /contact (301) |
| /hybrid/ | /hybrid-flooring-sydney (301) |
| /product/eco-eco-swish-laminate-new-england-blackbutt/ | /ranges/swish-laminate/ (301!) |
| /product/eco-eco-swish-laminate-nutmeg/ | /ranges/swish-laminate/ (301!) |
| /product/eco-eco-swish-oak-contemporary-elegant-milano-oak/ | /products/swish-oak-contemporary-elegant-milano-oak/ (301!) |
| /product-category/hybrid/ornato-hybrid/ | /hybrid-flooring-sydney/ (301) |
| /sitemap-keyword-targets.xml | /sitemap.xml (301) |
