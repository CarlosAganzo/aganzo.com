# Archive demo checkpoint — 20 September 2026

Preview: https://aganzo.com/v2/archive/?lang=es

Implemented in d3e31c4, with translation cache fix 466dc1e and selected-card contrast fix c57e1c9. All functional changes are under v2/. Main production remains untouched.

The archive demo has seven entirely fictional people, accent-insensitive search, selectable profiles, ancestor/descendant mode, relationship navigation, birth/death timeline, and illustrated editorial placeholders for documents, photographs and stories. All four existing languages are supported. No GEDCOM, database backup, credentials or family media have been published. This is a design prototype, not an import of the real family tree.

Final live checks: all 16 archive language/width combinations pass the existing review harness (1440, 1024, 768, 390; EN/ES/JA/ZH). Search for ines finds Inés; selecting her and descendants displays Inés → Tomás → Elena and updates the profile. Selected card foreground is rgb(37,40,32), resolving the contrast issue. No application errors were observed on the direct archive page (browser-extension metadata errors are unrelated).

Whole-site review: 78 passed / 2 failed. The two failures are lists/ en and es at 390px, reporting scrollWidth 468. They are outside the archive change; investigate separately, preserving any ongoing Lists work.

Next phase, only when requested: determine a public subset of the real genealogy; build a repeatable GEDCOM import and privacy filtering; review original media before publication; replace illustrative catalogue entries with real records. Do not treat noindex or client-side hiding as privacy protection. The current tree layout is a small illustrative generation layout, not a full pedigree graph engine.

Local checkpoint/archive-local branch and two named stashes preserve exact duplicates of already-published implementation/fixes from connector-based publishing; they are not unfinished features. Keep main synced to origin/main and inspect any newer changes before editing.
