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

Stage 2 completed on 2026-09-21: v2/assets/js/archive.js loads /v2/assets/genealogy/family.json and switches from the fictional fallback to the reviewed real dataset. The public browser supports search, ancestors/descendants, parents/spouses/children, birth/death dates and places, person-linked media, and a small archive media shelf. v2/assets/css/archive.css contains the associated media/timeline styling.

Stage 3 completed on 2026-09-21: the GEDCOM was attached directly and its SHA-256 matched the reviewed manifest exactly. A compact browser dataset was generated and published at v2/assets/genealogy/family.json. Validation on main confirms schema 2, 93 public people, 35 currently available approved media files, zero broken relationship references and zero missing media URLs. The original GEDCOM and private review data remain outside the repository.

Important incomplete item: the reviewed manifest contains 71 approved media objects, but only 35 corresponding original files are currently present in v2/assets/genealogy/media. The archive deliberately publishes only those 35, so there are no broken links. The remaining 36 approved files appear to have been left unuploaded when the earlier recovery stopped.

Next exact step: recover/upload the remaining 36 approved originals from data.zip or Media Web Aganzo.zip, using the existing hash-bound manifest, then regenerate family.json so those additional person/document links appear. Also review source-data anomalies in the GEDCOM (some date/place values are clearly malformed or swapped) before normalising them; do not guess corrections.
