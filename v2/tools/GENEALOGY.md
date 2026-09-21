# Genealogy recovery checkpoint

Scope: public archive under /v2/ only. Never commit original GEDCOM, Docker volumes, configuration, credentials or unfiltered review reports.

Inputs saved in the user's Aganzo web project: Aganzo.ged, data.zip (contains the same 203 media files as Media Web Aganzo.zip, plus config/cache). mysqldata.zip is an independent database backup, not needed for the static import.

The recovered GEDCOM is from Webtrees 1.7.17 / GEDCOM 5.5.1 and contains 195 people, 59 families and 128 multimedia references. The reviewed publication subset contains 93 people with a recorded death and 78 otherwise eligible media; 71 media references were approved for publication in the hash-bound manifest.

The importer uses the Python standard library and does not execute uploaded code. Run from the repository root:

```sh
python3 v2/tools/import_genealogy.py --gedcom /PRIVATE/Aganzo.ged --media /PRIVATE/data.zip --manifest v2/tools/genealogy-publication.json --output v2/assets/genealogy --report /PRIVATE/review.json
```

The report is PRIVATE and must remain outside this repository. The publication manifest binds the reviewed GEDCOM and media to SHA-256 hashes. Changed inputs require a new review. Original media bytes are copied without resize or recompression. Thumbnails from the old Webtrees backup are never selected.

Privacy: only unrestricted individuals with DEAT Y or a death date enter the public data. No raw notes, contacts, user records or excluded people's names/IDs/relationships are exported. No death record is not proof of being alive; those records are simply withheld. Family members and media links are filtered to the public subset. Media additionally require manual approval in the hash-bound manifest. This is a reviewed subset, not a full backup.

Stage 1 completed: importer + reviewed publication manifest + approved original media uploaded under v2/assets/genealogy/media. The source GEDCOM hash expected by the manifest is 7b0f560f8b15dcea7b365c5956c83d18fff2b265260801a4c94ab18e9444eeee. 126 of 128 source media paths resolve. The two unmatched paths belong to withheld records; do not guess replacement files. Seven otherwise eligible media are withheld: a family book, two 1979 notices, an obituary, and three group photographs needing additional review.

Stage 2 completed on 2026-09-21: v2/assets/js/archive.js now attempts to load /v2/assets/genealogy/family.json. When present, it switches from the fictional fallback to the reviewed real dataset, supports search, ancestors/descendants, parents/spouses/children, birth/death dates and places, person-linked media, and a small archive media shelf. v2/assets/css/archive.css contains the associated media/timeline styling. If family.json is absent or invalid, the existing fictional demo remains visible and explicitly labelled as a demo.

Current blocker: the stored Aganzo.ged is visible in the ChatGPT Project/Library but this session is not authorised to materialize its raw bytes, and the .ged file has no readable extracted-text representation. The file was temporarily renamed/moved while testing access and was restored to /Aganzo web/Aganzo.ged unchanged. No GEDCOM or private report has been committed.

Next exact step: obtain raw-byte access to Aganzo.ged (for example by attaching the 86 KB GED directly to the active chat), run the importer against the existing manifest and media backup, verify the generated family.json reports 93 public people and the expected approved media, then commit only v2/assets/genealogy/family.json. After that validate tree links, person media, desktop/mobile and all four languages, and update this checkpoint.
