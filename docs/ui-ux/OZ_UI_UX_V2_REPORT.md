# Oz Timber Floor UI/UX V2 Remediation Report

Date: 4 August 2026
Repository: `/Users/daibang/Projects/oz-timber-floor`
Branch: `main`
HEAD: `6909ee83800c4c08e9207694c5bf70bce0c92eb0`

## 1. Executive verdict

**READY FOR REVIEW.** Every repository-controlled blocker in the focused remediation brief now passes. The sitemap and publication-canonical sets reconcile, the expanded SEO freeze passes, the migration gate blocks the previously missed failure class, product imagery is colour-neutral, representative LCP images are safe, mobile interaction checks pass, and the complete 70-cell evidence matrix is present.

This is not a production-release verdict. No commit, push, merge, deployment, DNS, provider setting or external service was changed.

## 2. Repository state

- Confirmed root: `/Users/daibang/Projects/oz-timber-floor`.
- Branch: `main`.
- HEAD: `6909ee83800c4c08e9207694c5bf70bce0c92eb0`.
- The worktree remains intentionally dirty and uncommitted. Existing Australian Material Intelligence candidate work was preserved and remediated in place.
- No Operon or other repository was touched.

## 3. Exact files changed

The final working-tree file list is also available from `git diff --name-only` plus `git ls-files --others --exclude-standard`. The focused remediation changed or added these files:

### Implementation and source files

- `.tools/build-ranges-index.mjs`
- `.tools/restructure-products-page.mjs`
- `assets/site.css`
- `assets/site.js`
- `package.json`
- `scripts/apply-approved-release-decisions.mjs`
- `scripts/migration-readiness.mjs`
- `scripts/publication-inventory.mjs`
- `scripts/seo-publication-regression.mjs`
- `scripts/ui-qa.mjs`
- `scripts/ui-screenshots.mjs`
- `scripts/ui-ux-lcp-check.mjs`
- `scripts/ui-ux-seo-freeze.mjs`
- `sitemap.xml`
- `thank-you.html`
- `thank-you/index.html`

### Representative HTML and generator outputs

- `index.html`
- `products.html`
- `products/index.html`
- `ranges/index.html`
- `hybrid-flooring-sydney.html`
- `hybrid-flooring-sydney/index.html`
- `engineered-timber-flooring-sydney.html`
- `engineered-timber-flooring-sydney/index.html`
- `ranges/avala/index.html`
- `products/avala-blackbutt/index.html`
- `projects.html`
- `projects/index.html`

### Documentation and generated QA

- `OZ_STATUS.md`
- `docs/seo-migration/UTILITY_ROUTE_INDEXATION_POLICY.md`
- `docs/ui-ux/LCP_IMAGE_DEBT_AND_FACTUAL_CORRECTION_2026-08-04.md`
- `docs/ui-ux/OZ_UI_UX_V2_REPORT.md`
- `docs/ui-ux/generated/browser-qa.json`
- `docs/ui-ux/generated/screenshot-matrix.json`
- `docs/ui-ux/generated/seo-freeze-before.json`
- `docs/ui-ux/generated/seo-freeze-after.json`
- `docs/ui-ux/generated/seo-freeze-comparison.json`
- `docs/seo-migration/generated/catalogue-quality-report.json`
- `docs/seo-migration/generated/catalogue-quality-report.md`
- `docs/seo-migration/generated/migration-readiness-report.json`
- `docs/seo-migration/generated/migration-readiness-report.md`
- `docs/seo-migration/generated/performance-accessibility-report.json`
- `docs/seo-migration/generated/performance-accessibility-report.md`
- `docs/seo-migration/generated/redirect-validation-report.json`
- `docs/seo-migration/generated/redirect-validation-report.md`
- `docs/seo-migration/generated/sitemap-validation-report.json`
- `docs/seo-migration/generated/sitemap-validation-report.md`

### Screenshot evidence

- 70 core JPEG files in `docs/ui-ux/screenshots/after-v2/`, exactly enumerated by `docs/ui-ux/generated/screenshot-matrix.json`.
- Three additional state captures:
  - `docs/ui-ux/screenshots/after-v2/states/home-menu-products-open-320x800.jpg`
  - `docs/ui-ux/screenshots/after-v2/states/product-dock-390x844.jpg`
  - `docs/ui-ux/screenshots/after-v2/states/contact-submit-320x800.jpg`

The existing baseline, earlier `after/` evidence and `AUSTRALIAN_MATERIAL_INTELLIGENCE_QA_2026-08-04.md` were preserved.

## 4. SEO inventory reconciliation

| Inventory measure | Final count |
|---|---:|
| Physical HTML files | 2,201 |
| Physical indexable HTML files | 971 |
| Physical noindex HTML files | 1,230 |
| Unique publication canonicals | 943 |
| Sitemap routes | 943 |
| Unique noindex routes | 1,228 |
| Physical redirect-only routes | 350 |
| Sitemap omissions | 0 |
| Sitemap URLs without a publication canonical | 0 |
| Noindex URLs in sitemap | 0 |
| Ambiguous duplicate canonical owners | 0 |

The 971 physical indexable files reduce to 943 publication canonicals because 28 clean-route physical aliases have an explicit exact-200 rewrite owner. The inventory reports 59 duplicate-canonical physical groups and 29 mixed index/noindex canonical groups, but none creates ambiguous publication ownership: redirect-only/noindex aliases are reported separately from the single indexable owner.

The 1,230 physical noindex files reduce to 1,228 public noindex routes because utility routes have both flat and directory-index physical representations.

## 5. Sitemap before/after counts

| State | URLs | Explanation |
|---|---:|---|
| Historical pre-control evidence | 1,973 | Superseded snapshot before the controlled catalogue and Bamboo retirement decisions. |
| Candidate before this remediation | 941 | Intended 943 set minus `/` and `/about/`, accidentally removed by the broad Bamboo regex. |
| Final | 943 | `/` and `/about/` restored; `/thank-you/` deliberately noindexed and excluded. |

The historical difference is explained by three approved missing-image exclusions, 1,026 approved catalogue exclusions and one retired Bamboo landing: `1,973 - 3 - 1,026 - 1 = 943`. The defective Bamboo removal then also removed the homepage and About blocks, temporarily producing 941. Exact per-`<url>` filtering now removes only the Bamboo location.

Final policy:

- `/`: indexable and sitemap-listed.
- `/about/`: indexable and sitemap-listed.
- `/thank-you/`: preserved form-success route, self-canonical, `noindex,follow`, sitemap-excluded.
- `/404/`: noindex utility route, sitemap-excluded.
- `/bamboo-flooring-sydney/`: retired and sitemap-excluded; mapped redirect treatment remains intact.

## 6. SEO freeze coverage and result

The freeze is schema version 3 and discovers all 2,201 physical HTML files before selecting the unique publication-owner set. It freezes 943 complete indexable canonical contracts and 16 release-critical file hashes.

Protected page fields are title, meta description, canonical, robots, H1, normalized JSON-LD, internal href destinations and form name/action. Result:

- Before contracts: 943.
- After contracts: 943.
- Sitemap routes: 943.
- Unique publication canonicals: 943.
- Protected file hashes: 16.
- Contract/hash differences: 0.
- Verdict: **PASS**.

The baseline was regenerated only after the approved sitemap correction, utility indexation policy, mobile interaction code, LCP attributes and documented Projects factual correction were isolated.

## 7. Protected-file result

Intentional protected changes were limited to `sitemap.xml` and the authorized mobile behaviour in `assets/site.js`; both are frozen in the final before/after evidence. A direct Git path check found no changes to:

- `_redirects`
- `_headers`
- `netlify.toml`
- `robots.txt`
- `assets/contact-config.js`
- `scripts/prepare-netlify-deploy.mjs`
- `config/netlify-headers/*`
- `data/*`
- `migration/redirect-map.csv`
- Contact page routing/markup
- Privacy or Terms content

Product/range names, specifications, catalogue source data, redirect destinations, analytics configuration, legal content, contact details and form contracts remain protected. The migration gate reports zero link, asset, redirect, form or sitemap failures.

## 8. Visual changes

No redesign was added. The existing Australian Material Intelligence direction was retained. Remediation was limited to colour-faithful product rendering, accessible mobile navigation, a safe-area product dock, representative image loading/dimensions and evidence completion.

The Projects lead was corrected from an unsupported claim that examples were handled by Oz Timber Floor to an honest description of common project types. Route, title, meta description, canonical, H1, schema and link destinations were preserved.

Visual review of the final matrix found clear hero hierarchy, readable typography, visible primary CTAs, distinguishable primary/secondary actions, no obvious clipping, and no verified-project claim. The layout remains intentionally consistent across service, product and legal templates.

## 9. Product-colour fidelity result

Product/range cards, hero images, galleries and thumbnails are forced to:

```css
filter: none !important;
opacity: 1;
mix-blend-mode: normal;
```

Computed-style browser checks passed on 9 product-page images at 320 px and 15 range-page images at 390 px, with zero failures. Avala product and range evidence shows the same unfiltered source colour treatment.

## 10. Mobile interaction result

| Width | Result |
|---|---|
| 320×800 | Menu open, both submenus, Escape, outside click, body lock, prevented background scroll, exact restoration, focus return, ARIA reset, scrollable drawer and minimum targets passed. |
| 390×844 | Same interaction set passed; drawer fits or scrolls and targets passed. |
| 768×1024 | Menu/submenu, Escape, outside click, lock/restoration, focus/ARIA and targets passed; product dock correctly hidden. |

The fixed product dock passed at 320 and 390 px. It uses `env(safe-area-inset-bottom)`, has 48 px-high actions, supplies 86 px main-content clearance, preserves approved enquiry links, suppresses over competing actions/footer/menu, produces zero horizontal overflow, and is absent on Contact/noindex pages.

The Ranges catalogue retained all 85 eligible cards. Item 13 remained available, filtering reduced the list to the expected match, and clearing restored all 85 cards and item 13.

## 11. Contact-form result

Browser verification passed:

- Form name: `oz-flooring-enquiry`.
- Method: `POST`.
- Action: `/thank-you/`.
- Hidden attribution fields: 17.
- Product prefill: `Avala Blackbutt`.
- Range/category prefill: `Avala` / `Hybrid`.
- Enquiry selection changed to Service and exposed the service field.
- Consent remains required.
- Submit remained visible.
- Mobile dock count on Contact: 0.
- Horizontal overflow: 0.

The form-state screenshot shows consent and submit unobstructed.

## 12. LCP and image result

Seven representative routes, covering ten physical HTML outputs, now have exactly one marked LCP image with eager loading, one `fetchpriority="high"`, and intrinsic dimensions. All focused checks passed:

- `/`: 1800×1500.
- `/products/`: 1500×1000 on both physical outputs.
- `/ranges/`: 933×1400.
- `/hybrid-flooring-sydney/`: 300×300 on both physical outputs.
- `/engineered-timber-flooring-sydney/`: 1500×1000 on both physical outputs.
- `/ranges/avala/`: 933×1400.
- `/products/avala-blackbutt/`: 933×1400.

The products/ranges generators preserve corrected markup. All three representative product gallery images have dimensions, while only the primary image is eager/high priority.

Measured remaining debt: 18,281 image tags across 2,201 HTML files, with 13,888 still missing dimensions. This is recorded as staged below-fold debt, not an uncontrolled bulk rewrite.

## 13. Screenshot coverage result

Core matrix: **14 routes × 5 viewports = 70/70 PASS**.

Routes:

1. `/`
2. `/products/`
3. `/ranges/`
4. `/hybrid-flooring-sydney/`
5. `/engineered-timber-flooring-sydney/`
6. `/timber-flooring-installation-sydney/`
7. `/floor-levelling-sydney/`
8. `/projects/`
9. `/contact/`
10. `/ranges/avala/`
11. `/products/avala-blackbutt/`
12. `/privacy/`
13. `/terms/`
14. `/404.html`

Viewports: 1440×1000, 1024×768, 768×1024, 390×844 and 320×800.

All core files are JPEG payloads with truthful `.jpg` extensions and exact dimensions. Captures are consistently defined viewport captures, not full-page images. Each cell was recaptured in a fresh browser tab at `scrollY=0`, with header/brand geometry in view and visible images ready before capture. Three state captures are additional evidence and do not replace core cells.

## 14. Accessibility result

- Keyboard focus outlines remain visible.
- Escape, focus return, focus containment and `aria-expanded` state passed in browser execution.
- Important navigation, filter and dock controls meet the approximately 44×44 px target; dock actions measured 48 px high and range search measured about 52 px.
- `prefers-reduced-motion: reduce` disables smooth scrolling and shortens animation/transition durations.
- Key normal-text palette pairs exceed 4.5:1: muted/canvas 5.39:1, white/clay action 5.91:1, oak/canvas 6.16:1 and ink/canvas 14.55:1.
- No horizontal overflow was detected in any of the 70 core cells.

No full axe or assistive-technology audit was run; that remains a human/release-stage check.

## 15. Performance impact

- No runtime or development dependency was added.
- Representative LCP images are eager, dimensioned and use only one high-priority request per page.
- Below-fold lazy loading is retained where appropriate.
- Explicit representative dimensions reduce layout-shift risk.
- Browser QA found zero broken images and zero console warnings/errors in the tested matrix.

No Lighthouse field or lab score is claimed. The 300×300 hybrid hero source is visibly softer when enlarged at desktop and should be replaced only if a verified higher-resolution, colour-faithful source becomes available.

## 16. Exact acceptance commands run

```bash
git branch --show-current
git rev-parse HEAD
git status --short
node scripts/seo-publication-regression.mjs
node scripts/apply-approved-release-decisions.mjs
npm run ui:seo-freeze:before -- --force
npm run ui:seo-freeze:after
npm run ui:seo-freeze:compare
npm run ui:screenshots
npm run ui:qa
npm run migration:check:local
git diff --check
```

Syntax checks were also run with `node --check` for `assets/site.js`, both changed generators and every new/changed QA, inventory, freeze, release-decision and migration script.

The protected-path check was:

```bash
git diff --name-only -- _redirects netlify.toml robots.txt assets/contact-config.js scripts/prepare-netlify-deploy.mjs data migration/redirect-map.csv privacy.html privacy/index.html terms.html terms/index.html contact.html contact/index.html _headers config/netlify-headers
```

It returned no paths.

## 17. Test results

| Gate | Outcome |
|---|---|
| SEO publication regression | PASS: 943 publication canonicals = 943 sitemap routes; required home/About assertions and simulated missing-route BLOCKER assertions pass. |
| Release-decision dry run | PASS: 1,222 decisions; 0 unsafe redirect destinations. |
| SEO freeze comparison | PASS: 943 before, 943 after, 16 hashes, 0 differences. |
| Screenshot matrix | PASS: 70/70 truthful JPEG captures with exact dimensions. |
| Browser/UI QA | PASS: 70 responsive cells, 3 mobile widths, 2 image-style suites, Contact and catalogue interactions. |
| LCP QA | PASS: 7 routes / 10 physical outputs. |
| Migration readiness | GO: 0 BLOCKER, 0 HIGH, 0 MEDIUM. |
| Redirect/link/asset checks | PASS: 1,910 rules; 0 conflicts, loops, chains, missing targets, noindex targets, broken links or broken assets. |
| Syntax checks | PASS. |
| `git diff --check` | PASS. |

The publication regression directly exercises the shared BLOCKER builder for missing `/` and `/about/`, requiring the exact `publication-canonical-missing-from-sitemap` finding. The migration report exposes actual missing URLs if the set difference is nonzero.

## 18. Known limitations

- 13,888 mostly below-fold image tags still lack intrinsic dimensions; use generator-level staged remediation rather than a bulk manual rewrite.
- The hybrid representative hero is a 300×300 source and appears soft at large desktop presentation.
- Several mobile heroes use three or four vertically stacked actions. Primary/secondary styling remains clear, but a future conversion review may choose to simplify these after human approval.
- Contact prioritizes enquiry choices and then the form; the form is not entirely within the initial mobile viewport, but the form/consent/submit state is clear and unobstructed.
- Several generic lifestyle images and the hero composition repeat across routes. They are presented as service/context imagery, not verified completed projects.
- CSS safe-area handling and browser geometry passed, but a real-device home-indicator check remains appropriate before production release.
- Repository checks do not prove deployed headers, redirect responses, form delivery or analytics collection.

These are review observations or staged debt, not unresolved blockers from the focused remediation brief.

## 19. External production gates

Before any production deployment:

- Confirm the final Netlify form notification destination and submit a real mobile test.
- Supply and verify the approved production GA4 measurement ID and Realtime event flow.
- Approve/connect the production custom domain and explicitly enable production indexing only in the approved production context.
- Verify deployed headers, robots, sitemap and representative legacy redirects.
- Record the exact deployed commit and rollback evidence.
- Submit/refresh the canonical sitemap in Search Console after the deployed checks pass.

## 20. Deployment status

**NOT DEPLOYED.** No commit, push, merge, deploy, DNS change, Netlify provider change or external-service mutation occurred.

## 21. Final recommendation

**READY FOR REVIEW.** Human reviewers should inspect the 70-cell matrix plus the three interaction-state captures, then approve or reject the uncommitted candidate as one isolated change set. Production promotion remains a separate, explicit approval after the external gates above are satisfied.
