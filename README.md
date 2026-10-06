# AGANZO.COM

**Live:** https://aganzo.com/ — personal site of Carlos Aganzo: software engineering, travel, photography and cultural notes.

Production is now served from the repository root on GitHub Pages (`main`).
Edit `index.html`, `travel/`, `photos/`, `lists/`, `archive/`, `cinema/`, `music/`, `games/`, `books/`, `es/`, `assets/` and `admin/`.
Do not edit the retired `/v2/` pages: they redirect to production.

- `assets/data/now.json`: live Now content. `/admin/` commits to this path.
- `assets/data/translations.json`: four languages and page-specific SEO titles/descriptions.
- `assets/genealogy/`: existing reviewed public family data and media. Do not publish original GEDCOMs, credentials, living-person data or raw backups.
- `tools/`: genealogy importer and publication manifest, now using root asset URLs.
- `/v1/`: self-contained previous design, noindex, no analytics.
- `/review.html`: internal viewport/language audit, noindex, no analytics.

## Migration — 2026-09-22

Exact pre-migration snapshot: `129521efdef1721c9636ad63cc0d52dc553da7bc`; backup branch `backup/pre-v2-promotion-2026-09-22`.
The old design remains browsable at https://aganzo.com/v1/.
Old `/v2/` page URLs redirect with instant meta refresh and JavaScript preserving queries/fragments. These are static Pages redirects, not HTTP 301 responses. Legacy asset URLs remain available for existing photo/document links. All new code and content must use root paths.

SEO: production uses four first-class, static, indexable locale trees: English at `/`, Spanish at `/es/`, Japanese at `/ja/`, and Simplified Chinese at `/zh-hans/`. Every public canonical page must exist in all four locales, declare a self-canonical, and expose reciprocal `hreflang` values `en`, `es`, `ja`, `zh-Hans` plus `x-default`. The old `?lang=ja` / `?lang=zh` URLs are compatibility inputs only and client-side redirect to the canonical locale path; new links must never generate query-language URLs. Photography and travel images are included in the sitemap; photography has ImageGallery structured data. The home ProfilePage/Person schema links the public identity to LinkedIn, Instagram, Facebook and GitHub. `robots.txt` permits fetching redirect/noindex directives.

Analytics: original Cloudflare token preserved. One guarded beacon on each production public page, independent of JSON/module loading. No beacon on old-site, redirect, review or admin pages. Existing property/history and Search Console domain verification need no domain change. No external analytics/Search Console settings were changed.

## Restore

To restore exactly, create a new commit from the backup branch tree on top of current main (do not force-push or erase later commits). To recover individual files, read them from the backup branch. Retain any content edits made after promotion before restoring.

## Validation

See the migration checks in `tools/check_promotion.py`; browser checks cover production routes, languages, redirects, admin data source and single analytics insertion.


## SEO checkpoint — 2026-09-27

Google Search Console showed the homepage indexed while the newly created section/locale URLs were still unknown to Google. All 20 canonical URLs were added to the connected indexing tracker. Sitemap re-submission requires a Search Console connection with full `webmasters` scope; the current connection is read-only, so re-submission must be completed after enabling full access (or manually in Search Console).

## Multilingual publishing invariant — 2026-10-06

**This is a project rule, not an optional SEO enhancement.** From now on, any public content or structural change must preserve EN / ES / JA / ZH-Hans parity. Do not add or materially change a public page in only one locale.

Sources of truth and generated output:
- English public HTML plus `assets/data/translations.json` generate non-travel locale pages via `python tools/build_locales.py`.
- `assets/data/travel.json` plus translations generate the travel hub and written country pages in all four locales via `python tools/build_travel.py`.
- `assets/data/now.json` remains the source of truth for the home Now strip; `tools/sync_generated_seo.py` keeps crawl-visible fallbacks and sitemap dates aligned in every locale.
- `tools/check_locales.py` validates page existence, language tags, self-canonicals, reciprocal hreflang clusters, removal of generated `?lang=` links and sitemap membership.
- `.github/workflows/sync-generated-seo.yml` rebuilds and validates all locale trees after each non-bot push to `main`, then commits generated output when needed.

When adding a new public route, add it to the relevant generator/validator rather than hand-creating only one locale. When adding new copy, supply all four translations at the same time. Japanese uses URL prefix `/ja/`; Simplified Chinese uses `/zh-hans/` and HTML/hreflang language tag `zh-Hans`.

## Travel journal — 2026-10-04

The travel hub has one notebook entry for every visited country, a compact country
selector, and shortcuts generated from entries with text or photos. Countries
without content show a pending entry. Photos and text share one reader, followed
by an independent map/index and the three fixed points. Country/subregion query
links and the four languages remain supported.

`assets/data/travel.json` is the source for stories, dates, routes, captions and
photos. After changing it or the shared translations, run
`python tools/build_travel.py` (Python and Node required) to regenerate the travel
pages and sitemap. The builder discovers every country with content, creates its
EN/ES pages, and supplies a slug when needed; no country list, name list or count
needs updating by hand. Commit the resulting pages and data together.
The browser also reads current travel data and discovers entries automatically,
so a newly published story/photo appears in the notebook even before it has a
standalone page. A data edit alone does not run the static builder on GitHub Pages.
The reader is in `assets/js/travel-journal.js`, its locale bootstrap in
`assets/js/travel-app.js`, and its styles in `assets/css/travel.css`.
