#!/usr/bin/env python3
"""Validate the public four-locale contract for AGANZO.COM.

This is deliberately strict. A content change is not complete if one locale
route, canonical, hreflang cluster, or sitemap entry is missing.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
TRANSLATIONS = json.loads((ROOT / "assets/data/translations.json").read_text(encoding="utf-8"))
TRAVEL = json.loads((ROOT / "assets/data/travel.json").read_text(encoding="utf-8"))

LOCALES = {
    "en": {"prefix": "", "html": "en", "hreflang": "en"},
    "es": {"prefix": "/es", "html": "es", "hreflang": "es"},
    "ja": {"prefix": "/ja", "html": "ja", "hreflang": "ja"},
    "zh": {"prefix": "/zh-hans", "html": "zh-Hans", "hreflang": "zh-Hans"},
}

BASE_ROUTES = [
    "/",
    "/photos/",
    "/lists/",
    "/archive/",
    "/cinema/",
    "/music/",
    "/games/",
    "/books/",
    "/travel/",
]


def has_text(value):
    if isinstance(value, dict):
        return any(has_text(v) for v in value.values())
    return bool(value and str(value).strip())


def has_content(code):
    item = TRAVEL.get("entries", {}).get(code, {})
    return any(has_text(item.get(k)) for k in ("noteHtml", "note", "memory")) or bool(item.get("photos") or item.get("photo"))


def locale_route(route: str, lang: str) -> str:
    prefix = LOCALES[lang]["prefix"]
    return prefix + ("/" if route == "/" else route) if prefix else route


def file_for(route: str, lang: str) -> Path:
    localized = locale_route(route, lang)
    return ROOT / ("index.html" if localized == "/" else localized.strip("/") + "/index.html")


visited = list(dict.fromkeys(code for codes in TRAVEL["regions"].values() for code in codes))
travel_routes = []
for code in visited:
    if not has_content(code):
        continue
    slug = TRAVEL["entries"][code].get("slug")
    if not slug:
        raise SystemExit(f"Travel entry {code} has content but no generated slug")
    travel_routes.append(f"/travel/{slug}/")

ROUTES = BASE_ROUTES + sorted(travel_routes)
errors: list[str] = []

for lang in LOCALES:
    for page in ["home", "photos", "lists", "archive", "cinema", "music", "games", "books", "travel"]:
        for key in (f"seoTitle_{page}", f"seoDescription_{page}"):
            if not TRANSLATIONS.get(lang, {}).get(key):
                errors.append(f"Missing {lang} translation: {key}")

for route in ROUTES:
    expected_alternates = {
        cfg["hreflang"]: "https://aganzo.com" + locale_route(route, lang)
        for lang, cfg in LOCALES.items()
    }
    expected_alternates["x-default"] = "https://aganzo.com" + route

    for lang, cfg in LOCALES.items():
        path = file_for(route, lang)
        if not path.exists():
            errors.append(f"Missing locale page: {path.relative_to(ROOT)}")
            continue
        html = path.read_text(encoding="utf-8")
        expected_url = "https://aganzo.com" + locale_route(route, lang)

        if not re.search(rf'<html\s+lang="{re.escape(cfg["html"])}"', html):
            errors.append(f"Wrong html lang in {path.relative_to(ROOT)}")
        if f'<link rel="canonical" href="{expected_url}">' not in html:
            errors.append(f"Wrong/missing canonical in {path.relative_to(ROOT)}")

        alternates = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">', html))
        for hreflang, href in expected_alternates.items():
            if alternates.get(hreflang) != href:
                errors.append(f"Wrong/missing hreflang {hreflang} in {path.relative_to(ROOT)}")

        if "?lang=ja" in html or "?lang=zh" in html:
            errors.append(f"Legacy query-language link remains in {path.relative_to(ROOT)}")

        for code in ("en", "es", "ja", "zh"):
            pressed = 'true' if code == lang else 'false'
            pattern = rf'data-lang="{code}"[^>]*aria-pressed="{pressed}"'
            if not re.search(pattern, html):
                errors.append(f"Language button state wrong for {code} in {path.relative_to(ROOT)}")

ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
root = ET.parse(ROOT / "sitemap.xml").getroot()
locs = [node.findtext("sm:loc", namespaces=ns) for node in root.findall("sm:url", ns)]
for route in ROUTES:
    for lang in LOCALES:
        url = "https://aganzo.com" + locale_route(route, lang)
        count = locs.count(url)
        if count != 1:
            errors.append(f"Sitemap has {count} entries for {url}")

if errors:
    print("Locale validation failed:", file=sys.stderr)
    for error in errors:
        print(" - " + error, file=sys.stderr)
    raise SystemExit(1)

print(f"Locale validation passed for {len(ROUTES)} routes × {len(LOCALES)} locales.")
