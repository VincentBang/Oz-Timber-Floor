# OZ-MIG-004 production runbook — prepare only

This runbook is not deployment authority. It is bound to the decision manifest in this directory and to the immutable package hash recorded in `IMPLEMENTATION_AND_QA.md`. If either hash changes, approval and release evidence must be refreshed.

## Release gates

1. Vincent approves the exact protected decision plan hash.
2. The approved route/indexation slice is implemented atomically and every local gate passes, including the 172 exact catalogue dispositions.
3. A reviewed commit or immutable artifact and a separately retained rollback artifact are identified. A dirty worktree is not a production reference.
4. Netlify site ID, custom domain, deploy branch, current CLI support for `--no-build`, authenticated account and deploy protection are verified without exposing tokens.
5. Form persistence/notification destination and the existing Oz GA4 ID are confirmed under separate approvals.
6. WordPress files, database, media and current DNS/hosting values are backed up privately. Existing MX, SPF, DKIM, DMARC and verification TXT records are preserved.

## Preview contract

- Publish only the exact `dist/` bytes with `--no-build`; never use `--prod`, `--prod-if-unlocked`, `--trigger`, site creation or an anonymous target.
- Use one random draft alias that is not a branch name and remains within the installed CLI limit.
- Required approval: `APPROVE OZ-MIG-004 PREVIEW <public-package-manifest-sha256>`.
- Verify HTTPS GETs, `X-Robots-Tag: noindex, nofollow`, priority owners/aliases, sitemap response, sensitive-path failures, product/contact prefill and key asset fingerprints.
- A live synthetic form test requires `APPROVE OZ-MIG-004 FORM TEST <preview-deploy-id>` and an owner-approved inbox/phone value. A thank-you redirect alone is not delivery proof.

## Isolated production fixture

Before cutover, build in an isolated copy with production flags; do not change the live site. Verify:

- canonical owners: `200`, self-canonical, no effective noindex;
- controlled catalogue and thank-you pages: intended noindex and absent from sitemap;
- aliases/retired routes: contracted direct redirect or genuine `404/410`;
- Netlify-hostname/preview access remains protected or is canonically redirected under an approved hostname strategy;
- no redirect loop, chain, shadowed file, false `200`, query loss or `.html` rewrite loop.

## Approved cutover only

1. Record the old and new immutable artifacts, provider deploy ID, DNS values, rollback owner and decision approval.
2. Change only the reviewed web records; do not replace nameservers or mail records as a side effect.
3. Verify TLS and `www`/apex handling.
4. Test the real custom domain: homepage/core owners `200`, self-canonical and indexable; aliases direct permanent redirects; controlled/utility URLs noindex; unknown paths real errors.
5. Verify robots, canonical sitemap, phone/email actions, one approved form delivery and approved analytics Realtime evidence.
6. Preserve the existing Search Console property where appropriate. Submit only the final canonical sitemap using approved access; do not use Change of Address for a same-domain hosting/path migration.

## Rollback and monitoring

Rollback/escalate for widespread missing/wrong pages, accidental production noindex, broken primary form delivery, critical redirect faults, private-data exposure or severe runtime failure. A small short-term ranking fluctuation alone is not an automatic rollback trigger.

- First 24 hours: critical HTTP/indexability/form checks at launch, +1h, +4h and end of day.
- Days 2–7: daily crawl errors, sitemap/indexing, redirect samples, forms and analytics.
- Weeks 2–4: twice-weekly GSC landing pages/query clusters and qualified-enquiry reconciliation.
- Days 30/60/90: matched-period visibility, enquiries, quotes, won work and contribution review.
- Keep useful old redirects for at least one year and keep old hosting available for the agreed rollback window.
