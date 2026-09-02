# SEO migration browser QA — 2026-09-01

## Result

**PASS for the recorded local browser matrix: 70 of 70 responsive route/viewport cells passed.** The saved browser run also passed the targeted mobile navigation, catalogue, action-dock, contact-form, verified-contact, structured-data and product-image checks described below.

This is local migration evidence, not production acceptance. Staging indexation headers, Netlify behavior, production-domain routing, external structured-data tools, analytics activation and real-user performance remain separate launch checks.

## Evidence and validation

Source: `docs/ui-ux/generated/browser-qa.json`

- JSON parse: PASS.
- Evidence schema version: `1`.
- Generated: `2026-09-01T02:47:58.575Z`.
- Browser base URL: `http://127.0.0.1:8765`.
- Capture method: fresh navigation for every route and viewport, explicit `scrollY=0`, visible images required ready, and interaction execution at 320, 390 and 768 CSS pixels.
- Source integrity: all 16 source hashes recorded in the JSON matched the current tracked files when this report was prepared.
- Summary result: `success: true`.

## Responsive route matrix

The requested 14 routes were captured at all five widths: 1440, 1024, 768, 390 and 320 CSS pixels.

| Route | 1440 | 1024 | 768 | 390 | 320 |
|---|---:|---:|---:|---:|---:|
| `/` | PASS | PASS | PASS | PASS | PASS |
| `/products/` | PASS | PASS | PASS | PASS | PASS |
| `/ranges/` | PASS | PASS | PASS | PASS | PASS |
| `/hybrid-flooring-sydney/` | PASS | PASS | PASS | PASS | PASS |
| `/engineered-timber-flooring-sydney/` | PASS | PASS | PASS | PASS | PASS |
| `/timber-flooring-installation-sydney/` | PASS | PASS | PASS | PASS | PASS |
| `/floor-levelling-sydney/` | PASS | PASS | PASS | PASS | PASS |
| `/projects/` | PASS | PASS | PASS | PASS | PASS |
| `/contact/` | PASS | PASS | PASS | PASS | PASS |
| `/ranges/avala/` | PASS | PASS | PASS | PASS | PASS |
| `/products/avala-blackbutt/` | PASS | PASS | PASS | PASS | PASS |
| `/privacy/` | PASS | PASS | PASS | PASS | PASS |
| `/terms/` | PASS | PASS | PASS | PASS | PASS |
| `/404.html` | PASS | PASS | PASS | PASS | PASS |

Totals:

- Responsive cells: 70.
- Passing cells: 70.
- Each cell had one H1, ready visible images, zero broken images, zero browser console errors and zero horizontal overflow.
- The 35 cells with an applicable recorded hero/LCP image found it above the fold with eager loading and `fetchpriority="high"`.

## Mobile interaction checks

All checks passed at 320, 390 and 768 CSS pixels.

| Check | 320 | 390 | 768 |
|---|---:|---:|---:|
| Menu opens | PASS | PASS | PASS |
| Services submenu expands | PASS | PASS | PASS |
| Products submenu expands | PASS | PASS | PASS |
| Escape closes menu | PASS | PASS | PASS |
| Outside click closes menu | PASS | PASS | PASS |
| Body scroll locks and background scrolling is prevented | PASS | PASS | PASS |
| Prior scroll position is restored | PASS | PASS | PASS |
| Focus returns and `aria-expanded` resets | PASS | PASS | PASS |
| Drawer is scrollable | PASS | PASS | PASS |
| Minimum interaction target passes | PASS | PASS | PASS |
| Mobile call action is visible | PASS | PASS | PASS |

The recorded mobile call target was `tel:+61435496975` at all three widths.

## Catalogue accessibility and filters

The catalogue interaction test passed:

- Initial eligible items: 85 of 85 visible.
- Item 13 remained accessible.
- Filtering reduced the result to one visible item.
- Clearing the filter restored all 85 eligible items.
- Item 13 remained accessible after clearing.
- Horizontal overflow remained zero before, during and after filtering.

## Mobile action dock

The product-page dock passed at 320 and 390 CSS pixels on `/products/avala-blackbutt/`:

- Dock suppressed at the top of the page and while the menu was open.
- Dock visible in the middle of the page.
- Dock height: 69 CSS pixels.
- Both dock link targets: 48 CSS pixels.
- Main bottom padding: 86 CSS pixels.
- Dock suppressed when the footer was visible.
- No horizontal overflow.

This behavior keeps page actions and footer content reachable rather than covering them.

## Contact, conversion and verified trust checks

The contact interaction check passed with these recorded values:

- Form name: `oz-flooring-enquiry`.
- Method: `post`.
- Action: `/thank-you/`.
- Consent remained required.
- All 17 expected hidden attribution fields were present.
- Product/range/category prefill resolved to `Avala Blackbutt`, `Avala` and `Hybrid`.
- Enquiry selection changed the visible state to the service/floor-preparation pathway.
- Submit remained visible and unobstructed.
- No action dock was present over the contact form.
- Contact-page horizontal overflow: zero.

The verified trust checks recorded:

- One footer contact block.
- Primary and secondary phone numbers present once each.
- Email present once.
- Showroom address: `24/24-32 Hughes Street, Cabramatta NSW 2166`.
- No legacy duplicate contact block.
- One canonical business schema entity and one canonical business ID.
- Schema phones: `+61435496975` and `+61434882699`.
- Schema email: `info@oztimberfloor.com.au`.
- Postal address, production URL and logo present.
- No aggregate rating, opening-hours or social-profile claims were added.
- No GA4 script was injected without an approved measurement ID.

## Console, image and overflow checks

- Browser warnings or errors: zero.
- Route-matrix console errors: zero.
- Broken images: zero.
- Route-matrix horizontal-overflow failures: zero.
- Product/range image samples checked: 24.
- CSS image filters other than `none`: zero.
- Blend modes other than `normal`: zero.
- Sampled product image opacity remained `1`.

## Local HTTP transport smoke check

The local server was reachable. A non-destructive Python standard-library HTTP check requested the five priority pages once each and read the complete HTML response.

| Route | Status | Bytes | Content type | Elapsed |
|---|---:|---:|---|---:|
| `/` | 200 | 25,290 | `text/html` | 0.006370 s |
| `/floor-levelling-sydney/` | 200 | 25,801 | `text/html` | 0.000468 s |
| `/hybrid-flooring-sydney/` | 200 | 30,337 | `text/html` | 0.000465 s |
| `/engineered-timber-flooring-sydney/` | 200 | 32,560 | `text/html` | 0.000540 s |
| `/contact/` | 200 | 21,227 | `text/html` | 0.000534 s |

All five responses stayed on the requested URL and returned HTML without a redirect. These loopback timings are transport smoke evidence only. They are not Lighthouse metrics, network simulations, Core Web Vitals or estimates of production user experience.

## Performance tooling limit

No Lighthouse binary was available locally. No Lighthouse run was performed, and this report intentionally contains no invented Lighthouse scores. Performance acceptance still requires a real lab run against an appropriate built or staged environment and, after launch, field data where available.

## Checks that remain separate

This report does not replace:

- verification that every Netlify-hostname response remains fail-closed with `noindex`;
- external staging redirect/header checks;
- production-domain DNS, TLS, redirect and canonical checks;
- Google Rich Results or Schema.org external validation;
- Search Console ownership, sitemap submission and post-launch indexing checks;
- approved analytics-ID activation and live event verification;
- Lighthouse or real-user Core Web Vitals testing.

The local browser result can therefore support migration readiness while staging/noindex and external production checks remain explicit, separate launch gates.
