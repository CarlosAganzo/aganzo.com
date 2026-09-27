"""Verify production routing, SEO, locale alternates, preserved media and admin targets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, json, re, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    def find(self, tag, key, value):
        return [d for t, d in self.tags if t == tag and d.get(key) == value]

routes = [
    "", "travel/", "photos/", "lists/", "archive/",
    "cinema/", "music/", "games/", "books/", "travel/indonesia/"
]
locales = ["", "es/"]

for locale in locales:
    for route in routes:
        path = locale + route
        file = ROOT / path / "index.html"
        assert file.exists(), path
        text = file.read_text(encoding="utf-8")
        p = Page(text)
        expected = "https://aganzo.com/" + path
        assert p.find("meta", "name", "robots")[0]["content"] == "index,follow,max-image-preview:large"
        assert p.find("link", "rel", "canonical")[0]["href"] == expected
        assert p.find("meta", "property", "og:url")[0]["content"] == expected
        assert len(p.find("script", "src", next(d["src"] for t,d in p.tags if t=="script" and d.get("src","").startswith("/assets/js/site.js?v=")))) == 1
        assert len(p.find("meta", "name", "cf-web-analytics-token")) == 1
        assert "V2 · Preview" not in text
        assert len(re.findall(r'hreflang="en"', text)) == 1
        assert len(re.findall(r'hreflang="es"', text)) == 1
        for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            json.loads(raw)
        for tag, d in p.tags:
            for key in ("href", "src"):
                u = d.get(key, "")
                parsed = urlsplit(u)
                if not parsed.netloc and parsed.path.startswith("/"):
                    local = ROOT / unquote(parsed.path.lstrip("/"))
                    if parsed.path.endswith("/"):
                        local = local / "index.html"
                    assert local.exists(), (path, u)

for route in ["", "travel/", "photos/", "lists/", "archive/"]:
    old = Page((ROOT / "v2" / route / "index.html").read_text(encoding="utf-8"))
    assert old.find("meta", "name", "robots")[0]["content"].startswith("noindex")
    assert not old.find("meta", "name", "cf-web-analytics-token")

for path in ["v1/index.html", "admin/index.html", "review.html", "v2/admin/index.html", "v2/review.html"]:
    p = Page((ROOT / path).read_text(encoding="utf-8"))
    assert p.find("meta", "name", "robots")[0]["content"].startswith("noindex")
    assert not p.find("meta", "name", "cf-web-analytics-token")

admin_js = (ROOT / "admin/admin.js").read_text(encoding="utf-8")
assert "const CONTENT_PATH = 'assets/data/now.json'" in admin_js
assert "const PUBLIC_NOW = '/assets/data/now.json'" in admin_js

for p in (ROOT / "v2/assets/genealogy/media").iterdir():
    assert hashlib.sha256(p.read_bytes()).digest() == hashlib.sha256((ROOT / "assets/genealogy/media" / p.name).read_bytes()).digest()
assert (ROOT / "assets/genealogy/family.json").read_bytes() == (ROOT / "v2/assets/genealogy/family.json").read_bytes()

locs = [n.text for n in ET.parse(ROOT / "sitemap.xml").findall(".//{*}loc")]
expected_locs = ["https://aganzo.com/" + locale + route for route in routes for locale in locales]
assert sorted(locs) == sorted(expected_locs)
assert len(locs) == 20

print("PASS: 20 canonical EN/ES pages, metadata, hreflang, structured data, asset paths, retired noindex pages, sitemap and preserved genealogy/media.")
