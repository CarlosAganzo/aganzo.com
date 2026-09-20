# AGANZO.COM — V2 preview

Five static pages. No build step, framework or package install is needed to serve this directory on GitHub Pages. All V2 assets are contained here. Delete only `v2/` to remove this alternative; production is independent.

## Content

- `assets/data/now.json`: the four current items, their links and editorial update date. Change current values here; the homepage refreshes from this file. The English static fallback should also be updated in `index.html` if JavaScript-free parity matters.
- `assets/data/translations.json`: all shared prose in English, Spanish, Japanese and Simplified Chinese. English HTML is the no-JavaScript fallback, not four separate sites.
- `assets/data/travel.json`: original 76-country set, original region assignments, and optional destination records. Supported fields: year, note (language map), places (language map of arrays), memory (language map), photo ({file, alt: language map}). No missing year or family history is inferred. Indonesia's three places come from production.
- `assets/data/photos.json`: three original production WebP images and their native dimensions. Add a photo here and its static contact-sheet figure in `photos/index.html`. Images are copied without recompression; maximum display widths respect source dimensions. No cliff portrait is included.
- `assets/js/`: shared language/domain behaviour plus independent atlas, lightbox and song modules.
- `assets/css/site.css`: paper / ink / red editorial system, responsive layouts and CJK typography.

## Behaviour

Language is kept in `?lang=` and the V2-specific local storage key; it reads the existing language preference as a fallback without writing production's key. Domain branding preserves `?from=carlosaganzo.com` when navigating. The atlas supports region filtering, country search, keyboard selection, and direct `?country=ID` links. Portrait autoplay has a pause control and honours reduced motion. The image dialog supports Escape and arrow keys, traps focus natively and returns focus on close.

Music recommendations validate Spotify track URLs and URIs. Spotify is requested only after choosing to preview a valid track; submitting opens the visitor's mail app, it does not send mail directly. No API key is required. The existing Cloudflare token is copied unchanged into V2; root analytics configuration is untouched.

## Deliberately incomplete content

The family archive has three expandable catalogue areas, a preparation notice and a contact link. It contains no invented genealogy, records or ancestors. The photo page contains available portraits rather than a fabricated travel portfolio. Destination dates, memories and photos are empty until supplied.

## Review

`review.html` offers the five pages at 1440, 1024, 768 and 390 CSS pixels, in all four languages. Its audit checks 80 combinations for horizontal overflow, language application, basic page semantics, noindex, images, country population and map bounds. The frame is scaled to fit the review window; its CSS viewport remains the selected width. This tool is not linked in the public navigation. It is also noindex.

All pages explicitly use `noindex,nofollow`. Production sitemap, robots.txt, DNS, CNAME, Pages settings and root code are not changed.
