# Utility route indexation policy

## Thank-you route

`/thank-you/` is the form-success destination for `oz-flooring-enquiry`. It must remain publicly reachable so the existing form contract continues to work, but it is not a search landing page.

- Robots directive: `noindex,follow`.
- Canonical: `https://oztimberfloor.com.au/thank-you/`.
- XML sitemap: excluded.
- Redirect and form-success behaviour: preserved.

Both physical compatibility copies, `thank-you.html` and `thank-you/index.html`, must carry the same robots directive. The clean route continues to resolve through the existing Netlify rewrite.

## 404 route

The 404 utility route remains `noindex` and excluded from XML sitemaps.

## QA rule

The publication inventory is built from every physical HTML file. Every unique indexable canonical must appear in `sitemap.xml`, and every sitemap URL must have an indexable publication owner. Deliberately noindexed utility routes are reported separately and must never appear in the sitemap.
