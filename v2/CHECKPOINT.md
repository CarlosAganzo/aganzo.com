# V2 checkpoint — 20 September 2026

## Current outcome

The requested V2 preview is complete and published at https://aganzo.com/v2/.
Production remains at https://aganzo.com/. Only files under v2/ were added.
Do not promote V2 to the root unless Carlos explicitly requests that separate action.

## Verified commits

- ea613a62a6a69946b076ffaf0144f6dc0a4d8dfa: five-page V2, four languages, atlas, portraits, photography viewer, NOW and music recommendations.
- 501e0af2a405ff91693443a7a5ff53a66672eeff: corrected the responsive audit's atlas readiness check, excluded review frames from analytics, formatted CSS.

Resumption inspection confirmed main points to the second commit, all 21 V2 local files exactly match GitHub blob hashes, and the local repository was clean. The local checkout was then updated by fast-forward. There is no abandoned or uncommitted implementation to recover.

## Verification

- Production and V2 opened successfully in a fresh browser session.
- The live review.html audit passed all 80 combinations again on resumption: five pages, four languages, widths 1440 / 1024 / 768 / 390.
- This audit checks overflow, language application, noindex, basic semantics, images, country list and map bounds; it is not a comprehensive accessibility or cross-browser audit.
- Previous manual checks confirmed map search and selection, stable map height, keyboard country selection, portrait pause/selection, photo viewer and Escape, language navigation, domain-aware branding, and a real Spotify embed.
- All V2 pages have noindex,nofollow. No root files, DNS, CNAME, Pages settings, root analytics or production SEO were changed.

## Deliberately limited content, not unfinished code

- Family archive: structure, expandable catalogue categories and contact link; no genealogy dataset was supplied.
- Travel: 76 existing countries retained. Missing dates, notes, memories and photographs are intentionally empty. Indonesia's Java / Komodo / Borneo names come from the existing site.
- Photography: three currently displayed portraits retained without recompression. The field portrait uses the 1000 × 1250 source instead of the 400 × 500 alternative.
- Root portrait.jpg is a different snowy-garden portrait, not a higher-resolution replacement of any of those three. Do not silently substitute it.
- Do not resurrect the removed cliff photograph.
- NOW values are in assets/data/now.json; translations are in assets/data/translations.json. See README.md for maintenance details.

## How to continue

1. Fetch main and inspect status/log/diff before edits. Compare with the remote; do not assume this note is newer than subsequent commits.
2. Restrict this preview work to v2/. Preserve existing resources.
3. Use small logical commits after each functional block. Checkpoint genuine uncommitted work before risky changes.
4. Do not force-push, rewrite history or remove prior commits.
5. Validate the changed area, page loading, navigation, all languages and responsive layouts; then commit.
6. No build system is required. The repository files are the authoritative implementation. Earlier scratch generation scripts are historical intermediates, not a required build pipeline.
7. The original preview brief is fulfilled. Further design changes or additional photographs can proceed from this working version when requested.
