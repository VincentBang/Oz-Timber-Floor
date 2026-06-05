# Rollback Policy

Prepared: 2026-06-02

Rollback is a last resort for major production failures after DNS cutover. It should not be used for normal ranking fluctuation, minor visual issues or low-priority content imperfections.

## Rollback triggers

Rollback is allowed if one or more of these are confirmed:

- Homepage down on `https://oztimberfloor.com.au/`.
- Major route failure across service/category/product pages.
- Contact page or enquiry path broken.
- Contact form missing or unusable.
- Phone/email contact path missing.
- Sitemap returns 404/500 or contains bad production URLs.
- Robots blocks production crawling.
- Production pages include `noindex`.
- Canonicals point to Netlify, staging, localhost or Operon.
- Open Graph/schema URLs point to Netlify, staging, localhost or Operon.
- Major redirect failure affecting old category, service, blog or product URLs.
- Redirect loop across important URLs.
- HTTPS certificate failure that cannot be resolved quickly.

## Do not rollback for

- Minor styling issues.
- Small copy issues.
- Individual low-priority broken images.
- Normal ranking fluctuation during the first days after migration.
- Search Console reports that are expected for redirected URLs.
- A small number of low-value 404s without backlinks or traffic.

## Rollback method

1. Confirm the trigger with at least two checks:
   - Browser check
   - `curl -I`
   - Search Console only if already available
2. Notify stakeholders before changing DNS.
3. Keep email records untouched.
4. Restore previous web DNS records:
   - `oztimberfloor.com.au` A: `35.213.187.160`
   - `www.oztimberfloor.com.au` A: `35.213.187.160`
5. Confirm old WordPress homepage returns `200`.
6. Confirm old WordPress contact page is reachable.
7. Document:
   - trigger
   - rollback time
   - DNS records restored
   - who approved rollback
   - next fix needed

## Preferred fix before rollback

If the issue is clearly isolated and can be fixed faster than DNS rollback propagation, prefer a hotfix on Netlify:

- redirect typo
- missing static page
- single broken route
- wrong header rule
- one bad canonical template

Do not hotfix by deleting redirects, disabling sitemap, noindexing pages or changing the URL structure.

