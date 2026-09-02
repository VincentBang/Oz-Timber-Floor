# External Verification Checklist

These checks cannot be proven from the repository. Do not change their status based only on a local build or an HTTP response from a stale staging deployment.

## Netlify Forms

1. Open the approved preview URL and submit one legitimate `oz-flooring-enquiry` test.
2. Confirm the form submission appears in Netlify Forms with product, range, category, source page, UTM and click-ID fields when applicable.
3. Confirm the approved inbox receives the notification. Configure notification routing in Netlify; the hidden `approved_inbox` value is not configuration.
4. Repeat once on mobile.
5. Submit a honeypot-filled test only if the approved QA process permits it; confirm it does not create a valid lead.

## GA4

1. Set `OZ_GA4_MEASUREMENT_ID` in Netlify for the production build context only, using the approved `G-...` ID.
2. Trigger phone, email, quote-start, quote-submit, stock-check, supply-only and supply-and-install interactions in a test session.
3. Verify `phone_click`, `email_click`, `quote_start`, `quote_submit`, `stock_check`, `supply_only_enquiry` and `supply_install_enquiry` in DebugView or Realtime.
4. Confirm event parameters contain only the page path, controlled enquiry/category values, product/range-context booleans and attribution-presence booleans. Confirm free-text message, name, email, phone, suburb, raw link destinations and raw campaign values are absent.
5. Record the observation date/time and operator in the release evidence template.

## DNS, domain and Search Console

1. Confirm Netlify attaches the apex as the primary production domain and `www` as an alias that redirects to the apex.
2. Preserve MX, SPF, DKIM, DMARC and all email-related records during any hosting change.
3. After an approved production deployment, verify SSL, production headers, robots, sitemap and a representative redirect set.
4. Submit or refresh only the main production sitemap in Search Console after the repository and Netlify gates pass.
