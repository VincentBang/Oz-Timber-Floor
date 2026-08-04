# Production Release Evidence

Use this record for the single deployment approved for the production domain. A blank item is not a pass. Leave any item that needs a console, DNS provider, Netlify, GA4 or Search Console explicitly marked `PENDING EXTERNAL VERIFICATION`.

## Repository and build evidence

| Item | Value | Evidence / owner |
| --- | --- | --- |
| Repository commit SHA | `PENDING EXTERNAL VERIFICATION` | |
| Branch | `PENDING EXTERNAL VERIFICATION` | |
| Dirty or clean before deploy | `PENDING EXTERNAL VERIFICATION` | |
| Build command | `npm run build` | |
| Publish directory | `.` | `netlify.toml` |
| Migration-readiness command | `npm run migration:check` | |
| Generated sitemap URL count | `941 (LOCAL)` | Generated sitemap validator, 4 August 2026; confirm deployed artifact. |
| Redirect rule count | `1,910 (LOCAL)` | Generated redirect validator, 4 August 2026; confirm deployed artifact. |
| Catalogue indexable count | `893 (LOCAL)` | Generated catalogue/readiness reports; confirm deployed artifact. |
| Catalogue controlled count | `1,222 (LOCAL)` | Explicit manifest; `noindex,follow`, no Product schema, sitemap-excluded. |

## Netlify and domain evidence

| Item | Value | Evidence / owner |
| --- | --- | --- |
| Netlify site name | `PENDING EXTERNAL VERIFICATION` | |
| Netlify deploy ID | `PENDING EXTERNAL VERIFICATION` | |
| Deployed commit | `PENDING EXTERNAL VERIFICATION` | |
| Production branch | `PENDING EXTERNAL VERIFICATION` | |
| Apex domain (`oztimberfloor.com.au`) attached | `PENDING EXTERNAL VERIFICATION` | |
| `www` alias redirects to apex | `PENDING EXTERNAL VERIFICATION` | |
| SSL valid for apex and `www` | `PENDING EXTERNAL VERIFICATION` | |
| Approved custom production-domain response is indexable | `PENDING EXTERNAL VERIFICATION` | Only after domain connection and explicit flag: confirm no `X-Robots-Tag: noindex`; robots allows crawl. |
| Preview/branch response is noindex | `PENDING EXTERNAL VERIFICATION` | Confirm `X-Robots-Tag: noindex, nofollow`. |
| Custom production domain connected | `PENDING EXTERNAL VERIFICATION` | Main Netlify hostname must remain noindex while `custom_domain` is absent. |
| `OZ_PRODUCTION_INDEXING_ENABLED=true` approved and set | `PENDING EXTERNAL VERIFICATION` | Set only after custom-domain approval/connection; absence is the safe default. |

## Lead and measurement evidence

| Item | Value | Evidence / owner |
| --- | --- | --- |
| Approved GA4 measurement ID configured in production build | `PENDING EXTERNAL VERIFICATION` | Never record the ID in a public report if that is not approved. |
| GA4 Realtime/DebugView: phone click | `PENDING EXTERNAL VERIFICATION` | |
| GA4 Realtime/DebugView: email click | `PENDING EXTERNAL VERIFICATION` | |
| GA4 Realtime/DebugView: `generate_lead` submit attempt | `PENDING EXTERNAL VERIFICATION` | |
| Netlify form visible | `PENDING EXTERNAL VERIFICATION` | Form name: `oz-flooring-enquiry`. |
| Form notification received | `PENDING EXTERNAL VERIFICATION` | |
| Product-specific attribution retained | `PENDING EXTERNAL VERIFICATION` | |
| Mobile form submission checked | `PENDING EXTERNAL VERIFICATION` | |
| Honeypot/spam behaviour checked | `PENDING EXTERNAL VERIFICATION` | |

## Approval

| Item | Value |
| --- | --- |
| Approved by | `PENDING EXTERNAL VERIFICATION` |
| Date and time (including timezone) | `PENDING EXTERNAL VERIFICATION` |
| Rollback owner | `PENDING EXTERNAL VERIFICATION` |
| Rollback trigger / link to evidence | `PENDING EXTERNAL VERIFICATION` |
