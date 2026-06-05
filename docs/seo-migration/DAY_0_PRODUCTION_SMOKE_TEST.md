# Day 0 Production Smoke Test

Prepared: 2026-06-02

Run this immediately after DNS propagation begins, then repeat hourly for the first few hours.

## Expected production base

```text
https://oztimberfloor.com.au
```

Expected results:

- Important new URLs return `200`.
- Important old URLs return `301` to the closest new URL, then `200`.
- No redirect chains.
- No redirect loops.
- No Netlify staging domain leakage.
- No production noindex on canonical live pages.
- Canonical, Open Graph and schema URLs use `https://oztimberfloor.com.au/`.

## Quick manual checks

```bash
curl -I https://oztimberfloor.com.au/
curl -I https://www.oztimberfloor.com.au/
curl -I https://oztimberfloor.com.au/sitemap.xml
curl -I https://oztimberfloor.com.au/robots.txt
curl -I https://oztimberfloor.com.au/contact/
curl -I https://oztimberfloor.com.au/privacy/
curl -I https://oztimberfloor.com.au/terms/
```

Open these in a browser:

- `https://oztimberfloor.com.au/`
- `https://oztimberfloor.com.au/products/`
- `https://oztimberfloor.com.au/contact/`
- `https://oztimberfloor.com.au/hybrid-flooring-sydney/`
- `https://oztimberfloor.com.au/ranges/artisan-tile/`

Confirm:

- Contact form is visible.
- Phone link is visible.
- Email link is visible.
- Header/footer load.
- No obvious 404 page appears.

## Top page 200 checks

```bash
BASE=https://oztimberfloor.com.au
for path in \
  / \
  /services/ \
  /products/ \
  /ranges/ \
  /projects/ \
  /guides/ \
  /contact/ \
  /privacy/ \
  /terms/ \
  /hybrid-flooring-sydney/ \
  /laminate-flooring-sydney/ \
  /engineered-timber-flooring-sydney/ \
  /solid-timber-flooring-sydney/ \
  /vinyl-flooring-sydney/ \
  /bamboo-flooring-sydney/ \
  /floor-levelling-sydney/ \
  /timber-flooring-installation-sydney/ \
  /timber-floor-removal-and-stripping-sydney/ \
  /timber-floor-sanding-and-polishing-sydney/ \
  /commercial-flooring-sydney/ \
  /office-flooring-sydney/ \
  /builder-flooring-contractor-sydney/ \
  /hybrid-flooring-supplier-sydney/ \
  /laminate-flooring-supplier-sydney/ \
  /engineered-timber-flooring-supplier-sydney/
do
  code=$(curl -L -s -o /dev/null -w "%{http_code}" "$BASE$path")
  printf "%s %s\n" "$code" "$path"
done
```

Every row should return `200`.

## Legacy redirect checks

```bash
BASE=https://oztimberfloor.com.au
for path in \
  /contact-us/ \
  /hybrid/ \
  /laminate/ \
  /vinyl/ \
  /solid-timber/ \
  /bamboo/ \
  /floor-levelling/ \
  /timber-floor-installation/ \
  /timber-floor-removal-and-stripping/ \
  /timber-floor-sanding-and-polishing/ \
  /commercial-flooring/ \
  /office-flooring/ \
  /blogs/ \
  /blogs/page/2/ \
  /gallery/ \
  /product-category/hybrid/ \
  /product-category/laminate/ \
  /product-category/engineered-timber/ \
  /product-category/solid-timber/ \
  /product-category/vinyl/ \
  /product-category/bamboo/ \
  /product-category/hybrid/artisan-hybrid-tile/ \
  /product-category/laminate/villeroy-boch-aquastop-10mm/ \
  /product/eco-eco-swish-laminate-new-england-blackbutt/ \
  /product/eco-eco-swish-laminate-nutmeg/ \
  /product/eco-eco-swish-oak-contemporary-elegant-milano-oak/
do
  first=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  final=$(curl -L -s -o /dev/null -w "%{http_code}" "$BASE$path")
  effective=$(curl -L -s -o /dev/null -w "%{url_effective}" "$BASE$path")
  printf "%s -> %s %s %s\n" "$path" "$first" "$final" "$effective"
done
```

Expected:

- Old URLs should start with `301` unless they are intentionally live.
- Final status should be `200`.
- Final URL should be the closest relevant new URL, not the homepage unless explicitly intended.

## Metadata leakage checks

```bash
BASE=https://oztimberfloor.com.au
curl -s "$BASE/" > /tmp/oz-home.html
grep -Ei "oztimberfloor\.netlify\.app|localhost|operonflooring" /tmp/oz-home.html || true
grep -Ei "noindex|nofollow" /tmp/oz-home.html || true
grep -Ei "canonical|og:url|schema.org|application/ld\\+json" /tmp/oz-home.html
```

Expected:

- No Netlify staging URL.
- No localhost URL.
- No Operon domain.
- No production `noindex`.
- Canonical and Open Graph URLs use `https://oztimberfloor.com.au/`.

## Sitemap and robots checks

```bash
curl -s https://oztimberfloor.com.au/robots.txt
curl -s https://oztimberfloor.com.au/sitemap.xml | grep -E "<loc>" | head
curl -s https://oztimberfloor.com.au/sitemap.xml | grep -E "netlify|localhost|operonflooring|http://oztimberfloor"
```

Expected:

- `robots.txt` references `https://oztimberfloor.com.au/sitemap.xml`.
- Sitemap URLs use `https://oztimberfloor.com.au/`.
- No staging, localhost or Operon URLs.

## Pre-cutover evidence already available

- Local output check: `docs/seo-migration/generated/pre-cutover-local-output-check.json`
- Staging smoke test: `docs/seo-migration/generated/live-staging-smoke-test.json`

Most recent staging summary:

- Redirect URLs tested: 34
- Redirect failures: 0
- Redirect chains: 0
- Top pages tested: 25
- Top page failures: 0
- Sitemap URLs: 1,973
- Bad sitemap URLs: 0
- Sitemap sample failures: 0
- Contact page: form, phone, email and enquiry query path found

