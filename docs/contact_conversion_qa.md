# Contact and Conversion QA

## Status

- `/contact/` exists.
- Netlify form attributes remain present: `data-netlify="true"`, honeypot field, and action `/thank-you/`.
- Enquiry types include stock, supply-only, supply + install, product, commercial and service/floor preparation.
- Product URL parameters populate the contact form without exposing raw supplier names from current product links.
- Consent/privacy wording is visible near the form.
- Phone and email calls-to-action are visible.
- Footer contact fallback is clickable HTML, so it does not depend entirely on JavaScript.
- `assets/site.js` does not overwrite non-empty contact fallback blocks.
- UTM parameters and click IDs are retained for the browser session before the contact form is opened. GA4 payloads use page/product/range/category and attribution fields only; they do not send the free-text enquiry message, email address, name, phone or suburb.
- `generate_lead` is a validated browser **submission-attempt** event. It is not evidence that Netlify accepted the submission or that an email notification arrived.

## Manual Production Test Required

- Submit a staging Netlify form test and confirm the `oz-flooring-enquiry` form appears in Netlify Forms.
- Confirm delivery to the approved notification inbox in Netlify UI. The hidden `approved_inbox` field is context only; it does not configure Netlify notifications.
- Confirm product/range/category/UTM attribution survives a product enquiry URL and is visible on the submitted form payload.
- Confirm a honeypot-filled submission is not treated as a valid lead.
- Confirm the three GA4 events in DebugView/Realtime once the approved production-only measurement ID is active.
