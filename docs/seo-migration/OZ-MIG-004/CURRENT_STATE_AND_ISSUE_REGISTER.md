# OZ-MIG-004 current state and issue register

Observed 9 September 2026. Git baseline: `main` at `d0c66b802e544aa1a807f91798ea284c31c0998b`, initially clean.

## Reconciled state

| Layer | Verified state |
| --- | --- |
| WordPress production | 35 bounded GETs: 21 final `200`, 14 final `404`. The nine established service/category paths are canonical `200` owners; their newer `-sydney` candidates are `404`. `/sitemap.xml` redirects to `/sitemap_index.xml`. |
| Netlify deployment | 35 bounded GETs: 33 final `200`, 2 final `404`. Established paths resolve to the newer candidate owners. All checked responses retain `X-Robots-Tag: noindex, nofollow`. The Netlify hostname is therefore a protected staging surface, not production proof. |
| Local source | 2,201 HTML files; 971 physical indexable files; 943 publication canonicals; 1,230 physical noindex files representing 1,228 unique noindex routes; 350 redirect-only routes; 943 sitemap URLs; 1,912 redirect rules. Catalogue: 2,115 pages, currently 893 indexable and 1,222 controlled. |
| Generated public package | `dist/` is generated only from the allow-listed public roots. Source data, docs, scripts, Git files, package files and provider configuration are excluded. Preview headers remain global noindex. Final byte/hash evidence is in `IMPLEMENTATION_AND_QA.md`. |
| Deployment provenance | Initially available HTTP evidence did not bind a deploy to a commit. Subsequent authorized promotion preflight verified site `fd68e39e-7863-4012-8a97-40bec59b23d9`, ready deploy `6a97b5bfddcca00008698cc0`, commit `d0c66b802e544aa1a807f91798ea284c31c0998b`, no custom domain or aliases. Final promotion evidence is separate from this pre-promotion observation. |

These sets overlap and must not be summed. The difference between 971 physical indexable files and 943 publication canonicals is caused by physical flat/directory twins that resolve to the same canonical publication owner. The historical sitemap had 1,973 URLs: 1,973 minus 3 missing-image exclusions, 1,026 controlled catalogue exclusions and 1 retired Bamboo page equals 943. A temporary overbroad Bamboo removal also excluded `/` and `/about/`, producing the subsequently corrected 941 count. Source: `docs/ui-ux/OZ_UI_UX_V2_REPORT.md`, page-count reconciliation. Two noindex utility twins explain the 1,230 physical files versus 1,228 unique routes.

## Issue register

The statuses below record the pre-promotion assessment. The independently safe local fixes were subsequently verified on the protected Netlify deployment; see `DEPLOYMENT_RECEIPT_2026-09-09.md`. The protected decisions remain pending.

| Finding | Status | Evidence and impact | Treatment/test |
| --- | --- | --- | --- |
| Nine established production owners differ from staging owners | `NEEDS_PROTECTED_DECISION` | WordPress still serves the old paths as self-canonical `200`; newer staging paths are not production owners. Reversing or retaining ownership changes canonicals, redirects, sitemap and many links. | Exact atomic proposals are hash-locked in `DECISION_PLAN.json`; no route change implemented. |
| Bamboo landing/rules/public references | `NEEDS_PROTECTED_DECISION` | AGENTS requires public retirement. Current `_redirects` has 21 executable Bamboo/Verdura rules, not the historical claim of 25, all currently targeting `/hardwood-timber-flooring-sydney/`. | Manifest proposes no current change: keep retirement and existing destination pending route-level alternative evidence. |
| Hardwood Collection source fields and range composition | `FIXED_LOCAL_NOT_PROVEN_DEPLOYED` | Source range contained 188 cross-contaminated colours and laminate/download/navigation strings. Current supplier evidence supports 12 named colours, Red Oak/White Ash, 190 × 14/3 × 1900 mm, tongue-and-groove, direct-fix or floating. | Repaired the 12 verified records/range; omitted unsupported malformed fields; range now renders 12 cards. Deterministic field-integrity test passes. |
| 172 unsupported Hardwood-derived routes remain indexable | `NEEDS_PROTECTED_DECISION` | After factual field cleanup, deterministic classification exposes 172 exact routes whose identities are not supported by the current 12-colour set. None is a direct redirect destination. | Manifest proposes exact route-level control. No bulk noindex and no change to the protected 632-destination cohort. Local migration gate intentionally remains red on these 172 blockers. |
| Remaining catalogue manual queue | `NEEDS_BUSINESS_EVIDENCE` | 60 priority rows retain their reviewed disposition; 8 mappings remain unresolved. The 361 historical findings were a review queue, not proof that every route should be retired. | `CATALOGUE_REMEDIATION.csv` records all 60 rows, exposure, rationale and evidence needed. |
| Six category/supplier owner pairs | `NEEDS_PROTECTED_DECISION` | Current hardening check finds all six pairs differentiated and zero keyword-owner collisions. | Manifest proposes keeping all six separate; no consolidation implemented. |
| Indexable Sydney service-area hub | `NEEDS_PROTECTED_DECISION` | No approved location/project evidence supports a new hub or suburb-page set. | Manifest proposes no new indexable hub in this release. |
| Old WordPress media references in guide `srcset` | `FIXED_LOCAL_NOT_PROVEN_DEPLOYED` | 54 old-host references in five guides; every affected image already had a valid local primary `src`. | Removed only obsolete `srcset`/`sizes`; repository scan now finds zero old-host asset references. |
| `quote_submit` emitted on attempted submit | `FIXED_LOCAL_NOT_PROVEN_DEPLOYED` | The prior handler recorded success before a confirmed thank-you navigation. This could overstate leads. | Submit now stores a session marker; `/thank-you/` emits once and removes it. Direct thank-you loads do not emit. No PII is stored. Contract test passes. |
| Internal wording “without publishing unapproved prices” | `FIXED_LOCAL_NOT_PROVEN_DEPLOYED` | Customer-facing floor-levelling copy exposed internal policy language. | Replaced with practical fixed-price-scope wording in both physical owner files. |
| Reported “Click installation need …” copy | `ALREADY_FIXED_DEPLOYED` | Fresh Netlify and local GETs contain no phrase; Netlify has the improved flatness/cost coverage. WordPress has no corresponding new route page. | No duplicate rewrite performed. |
| Floor-levelling parity gaps from the earlier audit | `HISTORICAL_OR_NOT_REPRODUCED` | Current local and Netlify content already covers flatness/level, grinding/compound, limitations, product dependency, sequence and cost drivers. | Preserved the completed page; only the internal-facing phrase above changed. |
| Netlify deploy-to-commit identity | `VERIFIED_PRE_PROMOTION` | Authenticated exact-site read bound the prior ready deploy to commit `d0c66b802e544aa1a807f91798ea284c31c0998b`; site has no custom domain or aliases. | Retain deploy `6a97b5bfddcca00008698cc0` for rollback. Bind the new receipt to the validated package and run post-deploy GET/hash checks after the authorized promotion. |
| Form delivery, notification and live mobile submission | `NEEDS_PROVIDER_VERIFICATION` | Local form contract and prefill are valid, but no real form was submitted. | Requires the separate form-test approval and owner-approved synthetic data. |
| GA4/Search Console production operation | `NEEDS_BUSINESS_EVIDENCE` | No approved Oz GA4 measurement ID; no live writes authorised. | Keep source ID null; obtain ID/ownership and a separate production verification approval. |
| Production custom-domain indexability | `NEEDS_PROVIDER_VERIFICATION` | Current Netlify hostname is correctly noindex. A build flag alone does not prove hostname separation on a future custom domain. | Test the isolated fixture and actual custom domain during approved release; never remove all page-level controls globally. |

## Evidence boundaries

- Full HTTP fingerprints are stored in the owner-only task snapshot under `/tmp`; the repository contains a redacted response summary only.
- GSC workbooks were inspected read-only and their hashes did not change.
- Direct product-colour confirmation on physical flooring samples, real-device safe-area QA, Lighthouse medians, provider form delivery and live analytics are `NOT RUN`.
