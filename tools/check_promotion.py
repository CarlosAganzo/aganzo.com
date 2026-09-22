"""Verify migration routing, SEO, preserved media and the admin write target."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,t,a):self.tags.append((t,dict(a)))
 def find(self,tag,key,value):return [d for t,d in self.tags if t==tag and d.get(key)==value]
pages=['','travel/','photos/','lists/','archive/']
for path in pages:
 text=(ROOT/path/'index.html').read_text();p=Page(text)
 assert p.find('meta','name','robots')[0]['content']=='index,follow,max-image-preview:large'
 assert p.find('link','rel','canonical')[0]['href']=='https://aganzo.com/'+path
 assert p.find('meta','property','og:url')[0]['content']=='https://aganzo.com/'+path
 assert len(p.find('script','src','/assets/js/site.js?v=20260922-main'))==1
 assert len(p.find('script','src','/assets/js/analytics.js?v=20260922-main'))==1
 assert len(p.find('meta','name','cf-web-analytics-token'))==1
 assert 'V2 · Preview' not in text and '/v2/' not in text
 for tag,d in p.tags:
  for key in ['href','src']:
   u=d.get(key,'');url=urlsplit(u)
   if not url.netloc and url.path.startswith('/'):
    local=ROOT/unquote(url.path.lstrip('/'))
    assert local.exists(),(path,u)
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):json.loads(raw)
 urls=Page((ROOT/'v2'/path/'index.html').read_text())
 assert urls.find('link','rel','canonical')[0]['href']=='https://aganzo.com/'+path
 assert not urls.find('meta','name','cf-web-analytics-token')
for path in ['v1/index.html','admin/index.html','review.html']:
 p=Page((ROOT/path).read_text())
 assert p.find('meta','name','robots')[0]['content'].startswith('noindex')
 assert not p.find('meta','name','cf-web-analytics-token')
assert "const CONTENT_PATH = 'assets/data/now.json'" in (ROOT/'admin/admin.js').read_text()
assert "const PUBLIC_NOW = '/assets/data/now.json'" in (ROOT/'admin/admin.js').read_text()
# Existing media links keep byte-identical content in both namespaces.
import hashlib
for p in (ROOT/'v2/assets/genealogy/media').iterdir():
 assert hashlib.sha256(p.read_bytes()).digest()==hashlib.sha256((ROOT/'assets/genealogy/media'/p.name).read_bytes()).digest()
assert (ROOT/'assets/genealogy/family.json').read_bytes()==(ROOT/'v2/assets/genealogy/family.json').read_bytes()
urls=[n.text for n in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
assert urls==['https://aganzo.com/'+p for p in pages]
print('PASS: 5 canonical public pages, metadata, asset paths, redirects, sitemap, admin target, archived noindex pages and byte-identical genealogy/media.')
