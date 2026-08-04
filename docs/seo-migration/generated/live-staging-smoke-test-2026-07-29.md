# Live staging smoke test — 2026-07-29

Read-only check performed against the currently deployed `https://oztimberfloor.netlify.app` output. This did not deploy repository changes, submit a form, or verify Netlify notification delivery.

Observed through two read-only checks on 29 July 2026:

| URL | Result | Key observation |
| --- | --- | --- |
| `/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/services/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/products/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/ranges/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/projects/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/guides/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/contact/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/privacy/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/terms/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/hybrid-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/laminate-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/engineered-timber-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/solid-timber-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/vinyl-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/floor-levelling-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/commercial-flooring-sydney/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/ranges/swish-laminate/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/products/swish-laminate-fawn/` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/robots.txt` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/sitemap.xml` | `200` | `X-Robots-Tag: noindex, nofollow` present |
| `/contact-us/` | `301` → `/contact` | Redirect present; this older response did not expose an `X-Robots-Tag` header on the redirect itself |
| `/hybrid/` | `301` → `/hybrid-flooring-sydney` | Preview noindex header present |

## Markup samples

| URL | Canonical | Staging/localhost/Operon leakage | Form markup |
| --- | --- | --- | --- |
| `/` | `https://oztimberfloor.com.au/` | none detected | n/a |
| `/contact/` | `https://oztimberfloor.com.au/contact/` | none detected | Netlify form markers present |
| `/products/` | `https://oztimberfloor.com.au/products/` | none detected | n/a |
| `/ranges/` | `https://oztimberfloor.com.au/ranges/` | none detected | n/a |
| `/ranges/swish-laminate/` | `https://oztimberfloor.com.au/ranges/swish-laminate/` | none detected | n/a |
| `/products/swish-laminate-fawn/` | `https://oztimberfloor.com.au/products/swish-laminate-fawn/` | none detected | n/a |

## Interpretation

- The currently deployed staging output remains safely noindexed for the tested 200 responses. The older `/contact-us/` redirect should be rechecked after a new preview deployment because it did not itself return the header.
- It is an older deployment: its sitemap response size and headers predate this task's local changes. It is not evidence that the new production/preview header selector, catalogue controls, GA4 injection path or duplicate-sitemap retirement is deployed.
- After an explicitly approved deploy, repeat this table for the new preview/branch deployment and then separately for the production domain.
