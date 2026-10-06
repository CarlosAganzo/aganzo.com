#!/usr/bin/env python3
"""Keep crawl-visible homepage fallbacks and sitemap metadata in sync.

- assets/data/now.json is the source of truth for the homepage Now strip.
- sitemap.xml lastmod values are derived from git history for each page.
"""
from __future__ import annotations

import html
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
NOW_PATH = ROOT / "assets/data/now.json"
SITEMAP_PATH = ROOT / "sitemap.xml"
TRANSLATIONS_PATH = ROOT / "assets/data/translations.json"
HOME_PATHS = [
    ROOT / "index.html",
    ROOT / "es/index.html",
    ROOT / "ja/index.html",
    ROOT / "zh-hans/index.html",
]


def git_date(*paths: Path) -> str | None:
    rel = [str(p.relative_to(ROOT)) for p in paths if p.exists()]
    if not rel:
        return None
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", *rel],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    value = result.stdout.strip()
    return value or None


def sync_now(path: Path, items: list[dict]) -> bool:
    source = path.read_text(encoding="utf-8")
    start = source.find('<section id="now"')
    end = source.find("</section>", start)
    if start < 0 or end < 0:
        raise RuntimeError(f"Now section not found in {path.relative_to(ROOT)}")

    section = source[start : end + len("</section>")]
    for item in items:
        label = item["label"]
        marker = f'data-i18n="{label}"'
        label_pos = section.find(marker)
        if label_pos < 0:
            raise RuntimeError(f"{marker} not found in {path.relative_to(ROOT)}")

        anchor_start = section.rfind("<a ", 0, label_pos)
        anchor_end = section.find("</a>", label_pos)
        if anchor_start < 0 or anchor_end < 0:
            raise RuntimeError(f"Now anchor for {label} not found")
        anchor_end += len("</a>")
        anchor = section[anchor_start:anchor_end]

        safe_url = html.escape(item["url"], quote=True)
        anchor = re.sub(r'href="[^"]*"', f'href="{safe_url}"', anchor, count=1)

        value = html.escape(item["value"])
        if item.get("valueKey"):
            strong = f'<strong data-i18n="{item["valueKey"]}">{value}</strong>'
        else:
            strong = f"<strong>{value}</strong>"
        anchor = re.sub(r"<strong[^>]*>.*?</strong>", strong, anchor, count=1)

        section = section[:anchor_start] + anchor + section[anchor_end:]

    updated = source[:start] + section + source[end + len("</section>") :]
    if updated == source:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def path_for_url(url: str) -> Path | None:
    parsed = urlparse(url)
    if parsed.netloc != "aganzo.com":
        return None
    route = parsed.path
    if route == "/":
        return ROOT / "index.html"
    return ROOT / route.strip("/") / "index.html"


def source_page_for(page: Path) -> Path:
    rel = page.relative_to(ROOT)
    parts = list(rel.parts)
    if parts and parts[0] in {"es", "ja", "zh-hans"}:
        parts = parts[1:]
    return ROOT.joinpath(*parts)


def update_sitemap() -> bool:
    source = SITEMAP_PATH.read_text(encoding="utf-8")

    def replace_entry(match: re.Match[str]) -> str:
        block = match.group(0)
        loc_match = re.search(r"<loc>(.*?)</loc>", block)
        if not loc_match:
            return block
        url = loc_match.group(1)
        page = path_for_url(url)
        if page is None or not page.exists():
            return block

        source_page = source_page_for(page)
        dependencies = list(dict.fromkeys([page, source_page, TRANSLATIONS_PATH]))
        if page in HOME_PATHS:
            dependencies.append(NOW_PATH)
        if "/travel/" in url:
            travel_data = ROOT / "assets/data/travel.json"
            if travel_data.exists():
                dependencies.append(travel_data)

        date = git_date(*dependencies)
        if not date:
            return block
        return re.sub(r"<lastmod>[^<]+</lastmod>", f"<lastmod>{date}</lastmod>", block, count=1)

    updated = re.sub(r"<url>.*?</url>", replace_entry, source, flags=re.S)
    if updated == source:
        return False
    SITEMAP_PATH.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    now = json.loads(NOW_PATH.read_text(encoding="utf-8"))
    changed = False
    for path in HOME_PATHS:
        changed |= sync_now(path, now["items"])
    changed |= update_sitemap()
    print("Generated SEO content updated." if changed else "Generated SEO content already current.")


if __name__ == "__main__":
    main()
