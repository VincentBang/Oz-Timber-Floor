# Staging Indexing QA

## Status

- The checked-in production header template is indexable, but it is fail-closed. `scripts/prepare-netlify-deploy.mjs` selects it only when Netlify's `CONTEXT` is `production` and the separately approved `OZ_PRODUCTION_INDEXING_ENABLED=true` flag is present.
- Deploy previews, branch deploys and a main production-context deploy without that explicit flag receive `X-Robots-Tag: noindex, nofollow`.
- `robots.txt` intentionally permits crawl and points only to the production-domain main sitemap. It must not be changed to a permanent staging block because the same static output is used for production.
- Sitemap points to production URLs, not Netlify preview URLs.
- Production canonical URLs are used in page HTML.

## Risk

Deploy previews and branch deploys must be checked after every deployment. The Netlify response header is the source of truth; do not infer protection from the local template alone.

## Production Action

Before connecting `oztimberfloor.com.au`:

1. Confirm a deploy preview and a branch deploy return `X-Robots-Tag: noindex, nofollow`.
2. Confirm the main Netlify-hostname deploy also remains `noindex` while no approved custom domain is connected.
3. Confirm page canonicals still use `https://oztimberfloor.com.au`, never a Netlify hostname.
4. Record the protected-deploy header evidence in `docs/seo-migration/PRODUCTION_RELEASE_EVIDENCE.md`.

After the custom domain and indexation are separately approved:

1. Set `OZ_PRODUCTION_INDEXING_ENABLED=true` only for the production context.
2. Configure the approved `OZ_GA4_MEASUREMENT_ID` in that same production context; analytics stays disabled on protected deployments.
3. Confirm the custom-domain production response omits `X-Robots-Tag: noindex` and `/robots.txt` allows crawl.
4. Reconfirm preview, branch and Netlify-hostname staging responses remain protected and record all evidence.
