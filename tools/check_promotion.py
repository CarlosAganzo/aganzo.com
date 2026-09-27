"""Verify production routing, SEO locales, preserved media and the admin write target."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, json, re, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
EN_PAGES = [
    "", "travel/", "photos/", "lists/", "archive/",
    "cinema/", "music/", "games/", "books/", "travel/indonesia/"
]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    def find(self, tag, key, value):
        return [d for t, d in self.tags if t == tag and d.get(key) == value]

def check_public(path, lang):
    prefix = "" if lang == "en" else "es/"
    file_path = ROOT / prefix / path / "index.html"
    text = file_path.read_text(encoding="utf-8")
    page = Page(text)
    url_path = path if lang == "en" else "es/" + path
    canonical = "https://aganzo.com/" + url_path

    assert page.find("meta", "name", "robots")[0]["content"] == "index,follow,max-image-preview:large"
    assert page.find("link", "rel", "canonical")[0]["href"] == canonical
    assert page.find("meta", "property", "og:url")[0]["content"] == canonical
    assert page.find("link", "hreflang", "en")[0]["href"] == "https://aganzo.com/" + path
    assert page.find("link", "hreflang", "es")[0]["href"] == "https://aganzo.com/es/" + path
    assert len(page.find("script", "src", "/assets/js/site.js?v=20260927-seo2")) == 1
    assert len([d for t, d in page.tags if t == "script" and d.get("src", "").startswith("/assets/js/analytics.js")]) == 1
    assert len(page.find("meta", "name", "cf-web-analytics-token")) == 1
    assert "/v2/" not in text

    for raw in re.findall(r'<script type="application/ld\\+json">(.*?)</script>', text, re.S):
        json.loads(raw)

    for tag, attrs in page.tags:
        for key in ("href", "src"):
            raw = attrs.get(key, "")
            split = urlsplit(raw)
            if not split.netloc and split.path.startswith("/"):
                local = ROOT / unquote(split.path.lstrip("/"))
                if split.path.endswith("/"):
                    local = local / "index.html"
                assert local.exists(), (prefix + path, raw)

for path in EN_PAGES:
    check_public(path, "en")
    check_public(path, "es")

# Retired v2 routes remain crawlable enough to expose noindex, but cannot compete in search.
for path in ["", "travel/", "photos/", "lists/", "archive/"]:
    old = ROOT / "v2" / path / "index.html"
    page = Page(old.read_text(encoding="utf-8"))
    assert page.find("meta", "name", "robots")[0]["content"].startswith("noindex")
    assert page.find("link", "rel", "canonical")[0]["href"] == "https://aganzo.com/" + path
    assert not page.find("meta", "name", "cf-web-analytics-token")

for path in ["v1/index.html", "admin/index.html", "review.html"]:
    page = Page((ROOT / path).read_text(encoding="utf-8"))
    assert page.find("meta", "name", "robots")[0]["content"].startswith("noindex")
    assert not page.find("meta", "name", "cf-web-analytics-token")

assert "const CONTENT_PATH = 'assets/data/now.json'" in (ROOT / "admin/admin.js").read_text(encoding="utf-8")
assert "const PUBLIC_NOW = '/assets/data/now.json'" in (ROOT / "admin/admin.js").read_text(encoding="utf-8")

# Existing genealogy media remains byte-identical in the retired v2 snapshot.
for p in (ROOT / "v2/assets/genealogy/media").iterdir():
    assert hashlib.sha256(p.read_bytes()).digest() == hashlib.sha256((ROOT / "assets/genealogy/media" / p.name).read_bytes()).digest()
assert (ROOT / "assets/genealogy/family.json").read_bytes() == (ROOT / "v2/assets/genealogy/family.json").read_bytes()

locs = [n.text for n in ET.parse(ROOT / "sitemap.xml").findall(".//{*}loc")]
expected = []
for path in EN_PAGES:
    expected += ["https://aganzo.com/" + path, "https://aganzo.com/es/" + path]
assert locs == expected, (len(locs), len(expected))

print("PASS: 20 canonical EN/ES public URLs, reciprocal hreflang, structured data, asset paths, sitemap, legacy noindex routes, admin target and preserved genealogy media.")
