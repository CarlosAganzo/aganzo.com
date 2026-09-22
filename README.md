# AGANZO.COM

Production is now served from the repository root on GitHub Pages (`main`).
Edit `index.html`, `travel/`, `photos/`, `lists/`, `archive/`, `assets/` and `admin/`.
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

SEO: five canonical root URLs in sitemap.xml; public indexing enabled; unique page metadata, Open Graph/Twitter and ProfilePage/Person structured data retained. Language selectors still use `?lang=`; canonical URLs consolidate those views at their section URL. No claims of separate server-rendered language pages. `robots.txt` permits fetching redirect/noindex directives.

Analytics: original Cloudflare token preserved. One guarded beacon on each production public page, independent of JSON/module loading. No beacon on old-site, redirect, review or admin pages. Existing property/history and Search Console domain verification need no domain change. No external analytics/Search Console settings were changed.

## Restore

To restore exactly, create a new commit from the backup branch tree on top of current main (do not force-push or erase later commits). To recover individual files, read them from the backup branch. Retain any content edits made after promotion before restoring.

## Validation

See the migration checks in `tools/check_promotion.py`; browser checks cover production routes, languages, redirects, admin data source and single analytics insertion.
