# OZ-MIG-004 protected deployment receipt

Verified 9 September 2026, 11:42 UTC. Vincent explicitly requested dev push, main merge and deployment after the local repair phase.

## Released artifact

- Code commit: `1916b19733a90907aafe765089ffbe85c390ef2c`.
- Dev and main were pushed to that same commit, using a fast-forward merge and no force push.
- Site: `https://oztimberfloor.netlify.app`, ID `fd68e39e-7863-4012-8a97-40bec59b23d9`.
- Main deployment: `6aa144f26420d10008e8b8fc`, provider state `ready`, production context, matching code commit.
- Dev deployment: `6aa144dafba7d400084f5bac`, provider state `ready`, branch-deploy context, matching code commit.
- Delivery mechanism: the site's existing Git integration deployed both pushed branches. A separate direct CLI publish failed with `JSONHTTPError: Not Found`; it is not the successful deployment mechanism. No replacement site or provider configuration was created.
- No custom domain or aliases were attached; WordPress domain/DNS were not changed. Served pages retain `X-Robots-Tag: noindex, nofollow`.
- Local validated public package: 6,236 files; 583,803,198 bytes; manifest SHA-256 `0eb7750b37126d38bc18f9f9c15e35b180b7bbf617e2fd44979657612a44c3be`.
- Remote `site.js`, `site.css` and `contact-config.js` exactly match the local package SHA-256 values. The provider file-list endpoint returned Not Found, so a complete provider-side file-manifest comparison is **unavailable**, not claimed passed.
- Prior rollback reference: ready deploy `6a97b5bfddcca00008698cc0`, commit `d0c66b802e544aa1a807f91798ea284c31c0998b`.

## Executed live checks

`node scripts/oz-mig-004-deployment-smoke.mjs` passed at 11:42:54 UTC: 30 read-only HTTPS requests, zero failures. It checks key owners, the 12-colour Hardwood range and verified dimensions, original contact form contract, deliberate page-level controls, 943 sitemap URLs, exact asset hashes, two redirects and their final destinations, and seven private/unknown-path 404s.

The first smoke run incorrectly required the static noindex header on edge-generated 301 responses. The corrected test retains strict noindex checks on all served/error pages and adds a direct 200/noindex check for each exact same-origin redirect destination. The correction changes no deployed content or redirect rule.

Separate Playwright execution at 11:41:12–11:41:25 UTC passed four live range/contact cells at 320 and 1440 px. It gated on final `site.js` SHA-256 `b06445a1cbb5b9b740c60be3cfd45161f1cb4f332d24b89c09aa13ecd6991dd2` and 12 rendered colours, then verified no overflow, broken/pending images, browser errors or failed requests; exact product/range/category/slug/source prefill; original form name/action; required consent; and mobile menu/body-lock/Escape behavior. No forms were submitted.

## Remaining boundaries

- The protected decision manifest remains pending and byte-identical: `ab50628d77038ea331e94d253aa4735ee0405a05f5d1d785b8cd28bf5650514e`.
- An indexable production launch remains blocked by 172 route-level catalogue decisions, canonical-owner approval and the documented business/provider checks. This release does not approve those decisions.
- No DNS/domain, production-indexing, live GA4 or Search Console changes occurred.
- The stale unowned zero-byte Git lock was moved, not deleted, to `/tmp/oz-mig-004-stale-lock-cadB46/index.lock` after confirming no Git process or lock holder.
- This receipt and smoke-test follow-up are documentation/test-only; the public package hash above is unchanged. Their later Git commit is not retroactively attributed to the initial deployment IDs recorded here.
