#!/usr/bin/env python3
"""Build static, indexable locale variants for all non-travel public pages.

English source HTML + assets/data/translations.json are the source of truth.
Travel pages are generated separately by tools/build_travel.py.

Published locale routes:
  en      /
  es      /es/
  ja      /ja/
  zh-Hans /zh-hans/
"""
from __future__ import annotations

from datetime import date
from html import escape
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
TRANSLATIONS = json.loads((ROOT / "assets/data/translations.json").read_text(encoding="utf-8"))
PHOTOS = json.loads((ROOT / "assets/data/photos.json").read_text(encoding="utf-8"))

LOCALES = {
    "en": {"prefix": "", "html": "en", "hreflang": "en", "og": "en_GB"},
    "es": {"prefix": "/es", "html": "es", "hreflang": "es", "og": "es_ES"},
    "ja": {"prefix": "/ja", "html": "ja", "hreflang": "ja", "og": "ja_JP"},
    "zh": {"prefix": "/zh-hans", "html": "zh-Hans", "hreflang": "zh-Hans", "og": "zh_CN"},
}

PAGES = {
    "home": Path("index.html"),
    "photos": Path("photos/index.html"),
    "lists": Path("lists/index.html"),
    "archive": Path("archive/index.html"),
    "cinema": Path("cinema/index.html"),
    "music": Path("music/index.html"),
    "games": Path("games/index.html"),
    "books": Path("books/index.html"),
}

SKIP_LOCALIZE_PREFIXES = ("/assets/", "/admin/", "/v1/", "/v2/")


def route_for(source_path: Path) -> str:
    if source_path == Path("index.html"):
        return "/"
    return "/" + str(source_path.parent).strip("/") + "/"


def locale_route(route: str, lang: str) -> str:
    clean = re.sub(r"^/(?:es|ja|zh-hans)(?=/|$)", "", route) or "/"
    if not clean.startswith("/"):
        clean = "/" + clean
    prefix = LOCALES[lang]["prefix"]
    if not prefix:
        return clean
    return prefix + ("/" if clean == "/" else clean)


def localize_href(href: str, lang: str) -> str:
    if not href.startswith("/") or href.startswith("//") or href.startswith(SKIP_LOCALIZE_PREFIXES):
        return href
    parts = urlsplit(href)
    return urlunsplit((parts.scheme, parts.netloc, locale_route(parts.path, lang), parts.query, parts.fragment))


def replace_meta(content: str, attr: str, key: str, value: str) -> str:
    safe = escape(value, quote=True)
    pattern = rf'(<meta\s+{attr}="{re.escape(key)}"\s+content=")[^"]*(")'
    updated, count = re.subn(pattern, rf"\g<1>{safe}\g<2>", content, count=1)
    return updated if count else content


def translate_markup(source: str, lang: str, page: str, route: str) -> str:
    t = TRANSLATIONS[lang]
    html_lang = LOCALES[lang]["html"]
    canonical = "https://aganzo.com" + locale_route(route, lang)
    title = t[f"seoTitle_{page}"]
    description = t[f"seoDescription_{page}"]

    out = source

    # Static locale pages do not need the old client-side anti-flash bootstrap.
    out = re.sub(
        r'<style>html\.i18n-pending body\{visibility:hidden\}</style><script>\(\(\)=>\{try\{.*?</script>',
        "",
        out,
        count=1,
        flags=re.S,
    )

    out = re.sub(r'<html\s+lang="[^"]+"', f'<html lang="{html_lang}"', out, count=1)
    out = out.replace('data-lang="zh" lang="zh"', 'data-lang="zh" lang="zh-Hans"')
    out = re.sub(r'/assets/js/site\.js\?v=[^"]+', '/assets/js/site.js?v=20261006-locales1', out)

    html_pattern = r'(<([a-z0-9]+)\b[^>]*\bdata-i18n-html="([^"]+)"[^>]*>)([\s\S]*?)(</\2>)'
    out = re.sub(
        html_pattern,
        lambda m: m.group(1) + t.get(m.group(3), TRANSLATIONS["en"].get(m.group(3), m.group(4))) + m.group(5),
        out,
        flags=re.I,
    )

    text_pattern = r'(<([a-z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(</\2>)'
    out = re.sub(
        text_pattern,
        lambda m: m.group(1) + escape(t.get(m.group(3), TRANSLATIONS["en"].get(m.group(3), m.group(4)))) + m.group(5),
        out,
        flags=re.I,
    )

    def aria_replace(match: re.Match[str]) -> str:
        tag, key = match.group(1), match.group(2)
        value = escape(t.get(key, TRANSLATIONS["en"].get(key, key)), quote=True)
        if 'aria-label="' in tag:
            return re.sub(r'aria-label="[^"]*"', f'aria-label="{value}"', tag, count=1)
        return tag[:-1] + f' aria-label="{value}">'

    out = re.sub(r'(<[^>]*data-i18n-aria="([^"]+)"[^>]*>)', aria_replace, out)

    def alt_replace(match: re.Match[str]) -> str:
        tag, key = match.group(1), match.group(2)
        value = escape(t.get(key, TRANSLATIONS["en"].get(key, key)), quote=True)
        if 'alt="' in tag:
            return re.sub(r'alt="[^"]*"', f'alt="{value}"', tag, count=1)
        return tag[:-1] + f' alt="{value}">'

    out = re.sub(r'(<[^>]*data-i18n-alt="([^"]+)"[^>]*>)', alt_replace, out)
    out = re.sub(
        r'(data-lang="([^"]+)"[^>]*aria-pressed=")[^"]+',
        lambda m: m.group(1) + str(m.group(2) == lang).lower(),
        out,
    )

    out = re.sub(
        r'href="(/[^"]*)"',
        lambda m: f'href="{escape(localize_href(m.group(1), lang), quote=True)}"',
        out,
    )

    out = re.sub(r"<title>.*?</title>", f"<title>{escape(title)}</title>", out, count=1, flags=re.S)
    out = replace_meta(out, "name", "description", description)
    out = replace_meta(out, "property", "og:title", title)
    out = replace_meta(out, "property", "og:description", description)
    out = replace_meta(out, "property", "og:url", canonical)
    out = replace_meta(out, "property", "og:locale", LOCALES[lang]["og"])
    out = replace_meta(out, "name", "twitter:title", title)
    out = replace_meta(out, "name", "twitter:description", description)

    # Rebuild canonical/hreflang as one consistent four-language cluster.
    out = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+">', "", out)
    alternates = "".join(
        f'<link rel="alternate" hreflang="{cfg["hreflang"]}" href="https://aganzo.com{locale_route(route, key)}">'
        for key, cfg in LOCALES.items()
    )
    alternates += f'<link rel="alternate" hreflang="x-default" href="https://aganzo.com{locale_route(route, "en")}">'

    canonical_pattern = r'<link rel="canonical" href="[^"]+">'
    canonical_tag = f'<link rel="canonical" href="{canonical}">'
    if re.search(canonical_pattern, out):
        out = re.sub(canonical_pattern, canonical_tag + alternates, out, count=1)
    else:
        out = out.replace("</title>", f"</title>{canonical_tag}{alternates}", 1)

    def schema_replace(match: re.Match[str]) -> str:
        raw = match.group(1)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return match.group(0)
        if isinstance(data, dict):
            if "url" in data:
                data["url"] = canonical
            if "name" in data:
                data["name"] = title
            if "description" in data:
                data["description"] = description
            if "inLanguage" in data:
                data["inLanguage"] = html_lang
            if "headline" in data:
                data["headline"] = title
            if isinstance(data.get("mainEntityOfPage"), str):
                data["mainEntityOfPage"] = canonical
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>"

    out = re.sub(
        r'<script type="application/ld\+json">([\s\S]*?)</script>',
        schema_replace,
        out,
    )
    return out


def build_pages() -> None:
    for page, source_path in PAGES.items():
        source = (ROOT / source_path).read_text(encoding="utf-8")
        route = route_for(source_path)
        for lang in LOCALES:
            rendered = translate_markup(source, lang, page, route)
            prefix = LOCALES[lang]["prefix"].strip("/")
            target = ROOT / source_path if not prefix else ROOT / prefix / source_path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(rendered, encoding="utf-8")


def update_sitemap() -> None:
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    xhtml = "http://www.w3.org/1999/xhtml"
    image_ns = "http://www.google.com/schemas/sitemap-image/1.1"
    ET.register_namespace("", ns)
    ET.register_namespace("xhtml", xhtml)
    ET.register_namespace("image", image_ns)

    file = ROOT / "sitemap.xml"
    tree = ET.parse(file)
    root = tree.getroot()
    today = date.today().isoformat()

    for page, source_path in PAGES.items():
        route = route_for(source_path)
        for lang in LOCALES:
            url = "https://aganzo.com" + locale_route(route, lang)
            node = next((n for n in root if n.findtext(f"{{{ns}}}loc") == url), None)
            if node is None:
                node = ET.SubElement(root, f"{{{ns}}}url")
            else:
                node.clear()
            ET.SubElement(node, f"{{{ns}}}loc").text = url
            ET.SubElement(node, f"{{{ns}}}lastmod").text = today
            for key, cfg in LOCALES.items():
                ET.SubElement(
                    node,
                    f"{{{xhtml}}}link",
                    {
                        "rel": "alternate",
                        "hreflang": cfg["hreflang"],
                        "href": "https://aganzo.com" + locale_route(route, key),
                    },
                )
            ET.SubElement(
                node,
                f"{{{xhtml}}}link",
                {
                    "rel": "alternate",
                    "hreflang": "x-default",
                    "href": "https://aganzo.com" + locale_route(route, "en"),
                },
            )
            if page == "photos":
                for photo in PHOTOS:
                    child = ET.SubElement(node, f"{{{image_ns}}}image")
                    ET.SubElement(child, f"{{{image_ns}}}loc").text = (
                        "https://aganzo.com/assets/images/" + photo["full"]
                    )

    ET.indent(tree, space="  ")
    tree.write(file, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    build_pages()
    update_sitemap()
    print(f"Built {len(PAGES) * len(LOCALES)} static non-travel locale pages.")
