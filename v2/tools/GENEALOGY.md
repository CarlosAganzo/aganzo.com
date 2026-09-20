# Genealogy recovery checkpoint

Scope: public archive under /v2/ only. Never commit original GEDCOM, Docker volumes, configuration, credentials or unfiltered review reports.

Inputs already saved as attachments: Aganzo.ged, data.zip (contains the same 203 media files as Media Web Aganzo.zip, plus config/cache). mysqldata.zip is an independent database backup, not needed for this static import.

The importer uses the Python standard library and does not execute any uploaded code. Run from the repository root:

```sh
python3 v2/tools/import_genealogy.py --gedcom /PRIVATE/Aganzo.ged --media /PRIVATE/data.zip --manifest v2/tools/genealogy-publication.json --output v2/assets/genealogy --report /PRIVATE/review.json
```

The report is PRIVATE and must remain outside this repository. The publication manifest binds the reviewed GEDCOM and media to SHA-256 hashes. Changed inputs require a new review. Original media bytes are copied without resize or recompression. Thumbnails from the old Webtrees backup are never selected.

Privacy: only unrestricted individuals with DEAT Y or a death date enter the public data. No raw notes, contacts, user records or excluded people's names/IDs/relationships are exported. No death record is not proof of being alive; those records are simply withheld. Family members and media links are filtered to the public subset. Media additionally require manual approval in the hash-bound manifest. This is a reviewed subset, not a full backup.

Stage 1 completed: importer + reviewed publication manifest. Expected result: 93 people, 71 media references (some originals are identical, deduplicated by content). 126 of 128 source media paths resolve. The two unmatched paths belong to withheld records; do not guess replacement files. Seven otherwise eligible media are withheld: a family book, two 1979 notices, an obituary, and three group photographs needing additional review.

Remaining at this checkpoint: upload original approved media and generated JSON, replace demo UI with real data, validate links/relationships/original hashes and desktop/mobile/languages, then write final checkpoint. The existing fictional demo remains functional during preparation.
