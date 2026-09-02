# Analytics event hooks — 1 September 2026

## Scope

The shared browser layer prepares the following GA4-compatible event names without adding or changing a measurement ID:

| Event | Trigger | Intended use |
| --- | --- | --- |
| `phone_click` | A customer activates a `tel:` link | Phone lead intent |
| `email_click` | A customer activates a `mailto:` link | Email lead intent |
| `quote_start` | First focus inside the enquiry form during the current page view | Enquiry form start |
| `quote_submit` | Enquiry form submit attempt | Form funnel completion attempt; not proof of Netlify delivery |
| `stock_check` | A CTA carrying `enquiry=stock` is activated | Stock-check intent |
| `supply_only_enquiry` | A CTA carrying `enquiry=supply-only` is activated | Supply-only intent |
| `supply_install_enquiry` | A CTA carrying `enquiry=supply-install` is activated | Supply-and-install intent |

## Privacy controls

Event payloads are limited to the current page path, a controlled enquiry type, a controlled flooring category, product/range-context booleans, attribution-presence booleans and a fixed form name. They do not send link destinations, telephone numbers, email addresses, names, form messages, free text, raw product/range URL parameters or raw campaign values.

The source configuration keeps `ga4MeasurementId: null`. Production analytics must not be claimed operational until an approved `OZ_GA4_MEASUREMENT_ID` is supplied in the production build context and verified in GA4 Realtime.

## External verification

- Confirm each event in GA4 DebugView or Realtime on the approved production domain.
- Confirm `quote_submit` alongside a successful Netlify Forms submission and notification receipt; the event alone is only a browser-side submit attempt.
- Confirm preview, branch and Netlify-hostname builds remain noindex during measurement testing.
- Do not add form-field variables, user-entered URL parameters or other identifiers to analytics without a separate privacy review.
