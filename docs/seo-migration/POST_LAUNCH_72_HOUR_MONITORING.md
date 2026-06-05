# Post-Launch 72 Hour Monitoring

Prepared: 2026-06-02

## Day 0: first hours after cutover

Run hourly for the first few hours:

- Homepage `200`
- `www` to apex redirect
- HTTPS certificate valid
- Top 25 pages `200`
- Contact page `200`
- Contact form visible
- Phone and email visible
- Sitemap `200`
- Robots `200`
- Sample old URLs `301` to closest new URLs
- No redirect chains
- No redirect loops
- No staging domain leakage
- No production noindex
- Canonicals use `https://oztimberfloor.com.au/`
- Open Graph URLs use `https://oztimberfloor.com.au/`
- Schema URLs use `https://oztimberfloor.com.au/` where schema exists

Also check real browser pages:

- Homepage
- Products
- Services
- Contact
- Hybrid category
- Laminate category
- Engineered timber category
- Solid timber category
- Vinyl category
- Artisan Tile range

## Day 1

Check:

- Redirect smoke test again.
- Sitemap and robots again.
- Contact form submission path, if safe to test.
- Search Console Pages report.
- Search Console Sitemap report.
- Search Console URL inspection for homepage and top category/service pages.
- Server errors or redirect errors.
- New 404 reports.
- Enquiry/contact activity.

## Day 2 to Day 3

Check:

- Index coverage changes.
- Crawl errors.
- Redirect errors.
- Unexpected 404 URLs.
- Production canonical reports.
- Sitemap discovered URLs.
- Old URLs appearing under Page with redirect.
- Contact enquiries and calls.
- Any customer-reported page issues.

Do not overreact to normal ranking movement. Focus on technical correctness.

## Day 7

Check:

- Search Console clicks, impressions, CTR and position.
- Old URLs transferring signals to new destinations.
- High-impression pages with low CTR.
- Category and service page visibility.
- Any unexpected indexed staging/Netlify URLs.
- Any important old URLs still reporting 404.

## Day 14

Check:

- Query trends for main service/category terms.
- Blog/guide coverage.
- Product/range URL visibility.
- Redirected legacy URLs still receiving traffic.
- Pages in positions 4 to 20 for content enrichment candidates.

## Day 30

Check:

- Organic traffic trend against pre-launch baseline.
- Top landing pages.
- Top queries.
- Pages losing impressions.
- Pages gaining impressions.
- Backlink target redirects.
- Any remaining 404 cleanup opportunities.
- Next SEO growth work based on actual Search Console data.

## Escalation

Escalate immediately if any rollback trigger in `ROLLBACK_POLICY.md` appears.

Otherwise, collect evidence and fix in priority order:

1. crawl/indexing blockers
2. redirect failures
3. sitemap/canonical problems
4. contact/enquiry problems
5. broken important pages
6. content/image polish

