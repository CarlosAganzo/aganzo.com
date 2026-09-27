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

SEO: production now exposes 10 English canonical pages and 10 static Spanish counterparts under `/es/`, all listed in `sitemap.xml` with reciprocal hreflang. Dedicated pages exist for cinema, music, games, books and the Indonesia 2026 travel story. Photography and Indonesia images are included in the sitemap; photography has ImageGallery structured data. The home ProfilePage/Person schema links the public identity to LinkedIn, Instagram, Facebook and GitHub. Japanese and Chinese remain dynamic `?lang=` views and are not advertised as separate canonical locales. `robots.txt` permits fetching redirect/noindex directives.

Analytics: original Cloudflare token preserved. One guarded beacon on each production public page, independent of JSON/module loading. No beacon on old-site, redirect, review or admin pages. Existing property/history and Search Console domain verification need no domain change. No external analytics/Search Console settings were changed.

## Restore

To restore exactly, create a new commit from the backup branch tree on top of current main (do not force-push or erase later commits). To recover individual files, read them from the backup branch. Retain any content edits made after promotion before restoring.

## Validation

See the migration checks in `tools/check_promotion.py`; browser checks cover production routes, languages, redirects, admin data source and single analytics insertion.


## SEO checkpoint — 2026-09-27

Google Search Console showed the homepage indexed while the newly created section/locale URLs were still unknown to Google. All 20 canonical URLs were added to the connected indexing tracker. Sitemap re-submission requires a Search Console connection with full `webmasters` scope; the current connection is read-only, so re-submission must be completed after enabling full access (or manually in Search Console).
