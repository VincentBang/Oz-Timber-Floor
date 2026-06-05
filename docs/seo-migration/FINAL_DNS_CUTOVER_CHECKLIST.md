# Final DNS Cutover Checklist

Prepared: 2026-06-02

## Cutover verdict

DNS cutover is technically safe to proceed after the Netlify domain screen confirms:

- `oztimberfloor.com.au` is attached to the correct Oz Timber Floor Netlify site.
- `www.oztimberfloor.com.au` is attached as a domain alias.
- The primary domain is `oztimberfloor.com.au`.
- `www.oztimberfloor.com.au` redirects to `https://oztimberfloor.com.au/`.
- HTTPS is active for both apex and `www`.
- The deploy selected for production is the latest approved migration deploy.

Do not cut over DNS until those Netlify UI items are confirmed.

## Production domain assumptions

- Final canonical domain: `https://oztimberfloor.com.au/`
- Primary domain plan: non-www apex, `oztimberfloor.com.au`
- Redirect plan: `www.oztimberfloor.com.au` should 301 to `https://oztimberfloor.com.au/`
- Do not use Netlify preview or staging domains as canonicals.
- Do not use Change of Address in Google Search Console because the public domain is staying the same.

Current repo output, sitemap, robots and canonical checks are aligned to the apex domain.

## Production deploy target

- Latest approved pushed commit observed locally: `609e7641 Add live staging migration smoke test evidence`
- Netlify production deploy ID: confirm in Netlify UI before DNS cutover.
- Production deploy target: the Oz Timber Floor Netlify site currently serving `https://oztimberfloor.netlify.app/`

Record the Netlify deploy ID here before cutover:

```text
Netlify production deploy ID:
Netlify site name:
Netlify published branch:
Netlify published commit:
Confirmed by:
Confirmed at:
```

## Current DNS snapshot before change

Observed from DNS checks on 2026-06-02:

| Record | Current value | Notes |
| --- | --- | --- |
| `oztimberfloor.com.au` A | `35.213.187.160` | Current WordPress host |
| `www.oztimberfloor.com.au` A | `35.213.187.160` | Current WordPress host |
| `www.oztimberfloor.com.au` CNAME | none observed | `www` is currently not a CNAME |
| `oztimberfloor.com.au` MX | `10 mx10.mailspamprotection.com.` | Email, do not touch |
| `oztimberfloor.com.au` MX | `20 mx20.mailspamprotection.com.` | Email, do not touch |
| `oztimberfloor.com.au` MX | `30 mx30.mailspamprotection.com.` | Email, do not touch |
| SPF/TXT | none returned by command used | Still screenshot all DNS records before cutover |
| DMARC TXT | none returned by command used | Still screenshot all DNS records before cutover |

The old production WordPress site currently returns `200` on both apex and `www`; `www` does not currently redirect to apex.

## DNS records that must not be touched

Do not modify, delete or replace email-related records:

- MX records
- SPF TXT records
- DKIM TXT records
- DMARC TXT records
- mail subdomain records
- domain verification TXT records
- any records used by Google Workspace, Microsoft 365, mail spam protection or email delivery

Only change hosting records needed for web traffic after recording a full DNS screenshot/export.

## Pre-change checklist

1. Screenshot/export all DNS records.
2. Confirm the old WordPress host remains available for rollback.
3. Confirm Netlify custom domains include apex and `www`.
4. Confirm Netlify primary domain is `oztimberfloor.com.au`.
5. Confirm Netlify HTTPS certificate is active for apex and `www`.
6. Confirm the latest approved production deploy ID.
7. Confirm `_redirects` is included in the publish output.
8. Confirm the contact page works on staging.
9. Confirm Search Console and Analytics access is available.
10. Confirm who is authorised to make the DNS change.

## DNS change checklist

Use the exact DNS values shown in the Netlify domain setup screen for the Oz Timber Floor site.

Typical external-DNS pattern:

- Apex/root `oztimberfloor.com.au`: point to Netlify as instructed by Netlify.
- `www.oztimberfloor.com.au`: set as a Netlify alias, normally by CNAME to the Netlify site hostname or by the exact value Netlify provides.

Do not guess values if the Netlify UI shows a different target.

Record changes made:

```text
Changed by:
Changed at:
Apex/root record before:
Apex/root record after:
www record before:
www record after:
TTL before:
TTL after:
Email records changed? No
```

## Propagation checks

Run after DNS change:

```bash
dig oztimberfloor.com.au A +short
dig www.oztimberfloor.com.au A +short
dig www.oztimberfloor.com.au CNAME +short
curl -I https://oztimberfloor.com.au/
curl -I https://www.oztimberfloor.com.au/
```

Expected:

- Apex resolves to Netlify.
- `www` resolves to Netlify.
- `https://oztimberfloor.com.au/` returns `200`.
- `https://www.oztimberfloor.com.au/` redirects to `https://oztimberfloor.com.au/`.
- HTTPS certificate is valid in browser.

## Rollback path

Rollback only for major launch failures listed in `ROLLBACK_POLICY.md`.

If rollback is required:

1. Keep email records unchanged.
2. Restore the previous apex/root web record: `35.213.187.160`.
3. Restore the previous `www` web record: `35.213.187.160`.
4. Confirm old WordPress homepage returns `200`.
5. Confirm contact page is reachable.
6. Document the rollback time and trigger.

Do not rollback for normal ranking fluctuation, minor styling issues or non-critical copy issues.

