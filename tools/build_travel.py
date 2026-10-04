"""Build the travel hub and all written destinations from one content source.

Run: python tools/build_travel.py
English and Spanish are static, indexable pages; Japanese and Chinese use the
same data in the browser. Existing country/subregion query links stay valid.
"""
from pathlib import Path
from html import escape
import json
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'assets/data/travel.json').read_text())
TRANSLATIONS = json.loads((ROOT / 'assets/data/translations.json').read_text())
VERSION = '20261004-journal4'
DATE = '2026-10-04'
VISITED = list(dict.fromkeys(code for codes in DATA['regions'].values() for code in codes))


def has_text(value):
    return any(has_text(v) for v in value.values()) if isinstance(value, dict) else bool(value and str(value).strip())


def has_content(code):
    item = DATA['entries'].get(code, {})
    return any(has_text(item.get(k)) for k in ['noteHtml', 'note', 'memory']) or bool(item.get('photos') or item.get('photo'))


# Node's standard Intl data supplies every country name without a hand-kept list.
NAMES = json.loads(subprocess.check_output(['node', '-e', '''
const codes=JSON.parse(process.argv[1]);
console.log(JSON.stringify(Object.fromEntries(['en','es'].map(lang=>{
 const names=new Intl.DisplayNames([lang],{type:'region'});
 return [lang,Object.fromEntries(codes.map(code=>[code,names.of(code)]))];
}))));''', json.dumps(VISITED)], text=True))
DESTINATIONS = sorted((c for c in VISITED if has_content(c)), key=lambda c: NAMES['en'][c])
for code in DESTINATIONS:
    item = DATA['entries'][code]
    if not item.get('slug'):
        ascii_name = unicodedata.normalize('NFKD', NAMES['en'][code]).encode('ascii', 'ignore').decode()
        item['slug'] = re.sub(r'[^a-z0-9]+', '-', ascii_name.lower()).strip('-') or code.lower()
    if not item.get('photos') and item.get('photo'):
        item['photos'] = [item['photo']]
DEFAULT_COUNTRY = DATA.get('defaultCountry', 'ID')
if DEFAULT_COUNTRY not in VISITED:
    DEFAULT_COUNTRY = next(iter(DESTINATIONS or VISITED))


def e(s):
    return escape(str(s), quote=True)


def tr(key, lang):
    return TRANSLATIONS[lang][key]


def local(value, lang):
    return value.get(lang, value.get('en', '')) if isinstance(value, dict) else value


def path(lang, code=None):
    return ('/es' if lang == 'es' else '') + '/travel/' + (DATA['entries'][code]['slug'] + '/' if code else '')


def image(photo):
    return '/assets/images/' + photo['file']


def localized_template(name, lang):
    s = (ROOT / 'tools/templates' / name).read_text()
    pattern = r'(<([a-z0-9]+)\b[^>]*\bdata-i18n(?:-html)?="([^"]+)"[^>]*>)([\s\S]*?)(</\2>)'
    s = re.sub(pattern, lambda m: m[1] + tr(m[3], lang) + m[5], s)
    s = re.sub(r'(<[^>]*data-i18n-aria="([^"]+)"[^>]*>)',
               lambda m: re.sub(r'aria-label="[^"]*"', 'aria-label="' + e(tr(m[2], lang)) + '"', m[1]), s)
    s = re.sub(r'(data-lang="([^"]+)"[^>]*aria-pressed=")[^"]+', lambda m: m[1] + str(m[2] == lang).lower(), s)
    if lang == 'es':
        s = re.sub(r'href="/(?!assets|es/)([^"]*)"', lambda m: 'href="/es/' + m[1] + '"', s)
    return s


def choices(lang, selected, related=False):
    cards = []
    for code in sorted(DESTINATIONS, key=lambda c: NAMES[lang][c]):
        item = DATA['entries'][code]
        photos = item.get('photos', [])
        thumbnail = next((p for p in photos if p['file'] == item.get('heroPhoto')), None)
        visual = (f'<img src="{image(thumbnail)}" alt="" width="96" height="64" loading="eager">'
                  if thumbnail else '<span class="journal-choice-type" aria-hidden="true">Aa</span>')
        meta = f'{len(photos)} {tr("journalPhotoShort", lang)}' if photos else tr('journalStoryOnly', lang)
        current = ' aria-current="true"' if code == selected else ''
        cards.append(f'<a class="journal-choice" data-destination="{code}" data-localized-link href="{path(lang, code)}"{current}>{visual}'
                     f'<span><strong>{NAMES[lang][code]}</strong><small>{e(meta)}</small></span><span class="choice-arrow" aria-hidden="true">↗</span></a>')
    return f'<nav class="journal-choices" aria-label="{e(tr("journalMore" if related else "journalNav", lang))}">' + ''.join(cards) + '</nav>'


def country_picker(lang, selected):
    groups = []
    for region, codes in DATA['regions'].items():
        options = []
        for code in sorted(codes, key=lambda c: NAMES[lang][c]):
            photos = DATA['entries'].get(code, {}).get('photos', [])
            status = (str(len(photos)) + ' ' + tr('journalPhotoShort', lang) if photos else tr('journalStoryOnly', lang)) if has_content(code) else tr('journalPending', lang)
            options.append(f'<option value="{code}"{" selected" if code == selected else ""}>{e(NAMES[lang][code])} — {e(status)}</option>')
        groups.append(f'<optgroup label="{e(tr(region, lang))}">' + ''.join(options) + '</optgroup>')
    return f'<div class="journal-country-picker"><label for="journal-country" data-i18n="journalChooseCountry">{e(tr("journalChooseCountry", lang))}</label><select id="journal-country">' + ''.join(groups) + '</select></div>'


def reader(lang, code, standalone=False):
    item = DATA['entries'][code]
    photos = item.get('photos', [])
    hero = next((p for p in photos if p['file'] == item.get('heroPhoto')), photos[0] if photos else None)
    hero_index = photos.index(hero) if hero else 0
    subtitle = local(item.get('subtitle', {}), lang)
    period = local(item.get('period', {}), lang)
    region = next(k for k, v in DATA['regions'].items() if code in v)
    meta = tr(region, lang) + (' · ' + period if period else '')
    title_tag = 'h1' if standalone else 'h2'
    article_link = '' if standalone else f'<a class="journal-text-link" id="journey-page-link" href="{path(lang, code)}">{e(tr("journalReadPage", lang))} <span aria-hidden="true">↗</span></a>'
    photos_html = ''
    if hero:
        thumbs = ''.join(f'<a href="{image(p)}" class="journal-thumb" data-photo-index="{i}" aria-label="{e(local(p["alt"], lang))}" aria-current="{str(i == hero_index).lower()}"><img src="{image(p)}" alt="" width="100" height="68" loading="lazy"></a>' for i, p in enumerate(photos))
        filters = ''
        if code in DATA.get('subdivisions', {}):
            options = ''.join(f'<option value="{key}">{e(local(r["name"], lang))}</option>' for key, r in DATA['subdivisions'][code]['regions'].items() if r.get('visited'))
            filters = f'<label class="journal-region-label"><span class="sr-only">{e(tr("journalPhotoRegions", lang))}</span><select id="photo-region"><option value="">{e(tr("journalAllPhotos", lang))}</option>{options}</select></label>'
        photos_html = f'''<section class="journal-gallery" aria-label="{e(tr('journalNav', lang))}">
          <div class="journal-gallery-top"><span class="micro" id="photo-total">{len(photos)} {e(tr('journalPhotos', lang))}</span>{filters}</div>
          <figure class="journal-photo-frame"><a id="journal-hero" href="{image(hero)}" aria-label="{e(tr('journalExpand', lang))}"><img src="{image(hero)}" alt="{e(local(hero['alt'], lang))}" width="1400" height="933" loading="eager" fetchpriority="high"><span class="journal-expand" aria-hidden="true">↗</span></a></figure>
          <div class="journal-photo-caption"><span id="photo-caption">{e(local(hero['alt'], lang))}</span><div class="journal-photo-controls"><button type="button" data-photo-step="-1" aria-label="{e(tr('previous', lang))}">←</button><span id="photo-counter">{hero_index + 1} / {len(photos)}</span><button type="button" data-photo-step="1" aria-label="{e(tr('next', lang))}">→</button></div></div>
          <div class="journal-thumbs" aria-label="{e(tr('journalAllPhotos', lang))}">{thumbs}</div>
        </section>'''
    prose = '<p>' + re.sub(r'<br\s*/?>\s*<br\s*/?>', '</p><p>', local(item.get('noteHtml') or item.get('note') or item.get('memory') or {}, lang)) + '</p>'
    places = local(item.get('places', {}), lang)
    route = f'<div class="journal-route"><span class="micro">{e(tr("journalRoute", lang))}</span><p>{e(" · ".join(places))}</p></div>' if places else ''
    map_url = path(lang) + '?country=' + code + '#atlas'
    map_link = f'<a class="journal-text-link" data-show-map="{code}" href="{map_url}">{e(tr("journalOnMap", lang))} <span aria-hidden="true">↓</span></a>'
    return f'''<article id="country-detail" class="journal-entry{' journal-entry--text' if not photos else ''}" data-country="{code}">
      <header class="journal-entry-heading"><div><p class="eyebrow">{e(meta)}</p><{title_tag} id="country-title" tabindex="-1">{NAMES[lang][code]}</{title_tag}></div>{article_link}</header>
      <div class="journal-entry-grid">{photos_html}<div class="journal-writing"><p class="journal-subtitle">{e(subtitle)}</p><div id="country-note" class="journal-prose">{prose}</div>{route}<div class="journal-entry-links">{map_link}</div></div></div>
    </article>'''


def atlas(lang):
    svg = (ROOT / 'assets/maps/world-visited.svg').read_text()
    svg = svg.replace('aria-label="Countries visited"', f'aria-label="{e(tr("atlasLegend", lang))}"')
    filters = ''.join(f'<button type="button" data-region="{r}" aria-pressed="{str(r == "all").lower()}">{e(tr("journalAllCountries" if r == "all" else r, lang))}</button>' for r in ['all', *DATA['regions']])
    return f'''<section id="atlas" class="journal-atlas" aria-labelledby="atlas-title">
      <div class="journal-section-heading"><div><p class="eyebrow">02 / {e(tr('journalMap', lang))}</p><h2 id="atlas-title">{e(tr('journalAtlasTitle', lang))}</h2></div><p class="journal-total"><strong>{len(VISITED)}</strong><span>{e(tr('atlasVisited', lang))}</span></p></div>
      <p class="journal-atlas-help">{e(tr('journalAtlasHelp', lang))}</p><div class="region-filters" role="group" aria-label="{e(tr('journalMap', lang))}">{filters}</div>
      <div class="journal-atlas-grid"><div class="country-index"><label for="country-search">{e(tr('journalSearch', lang))}</label><input type="search" id="country-search" autocomplete="off" placeholder="{e(tr('journalCountry', lang))}"><div id="country-list" class="country-list" aria-label="{e(tr('atlasPlaces', lang))}"></div><p id="country-status" role="status"></p></div>
      <div class="map-paper"><div class="map-grid" aria-hidden="true"></div>{svg}<div id="regional-map-shell" class="regional-map-shell" hidden><div class="regional-map-topline"><button id="regional-map-back" type="button">← {e(tr('worldMap', lang))}</button><div class="regional-map-heading"><strong id="regional-map-country"></strong><span class="micro">{e(tr('regionalView', lang))}</span></div></div><div id="regional-map-canvas" class="regional-map-canvas"></div><div id="regional-map-list" class="regional-map-list" aria-label="{e(tr('regionalView', lang))}"></div></div><div class="map-key"><span><i></i> {e(tr('visited', lang))}</span><span aria-hidden="true">N ↑</span></div></div></div>
      <p id="map-status" role="status"></p><details class="journal-atlas-about"><summary>{e(tr('atlasSubtitle', lang))}</summary><p>{e(tr('travelText', lang))}</p><p class="atlas-foot">{e(tr('atlasFoot', lang))}</p></details></section>'''


def build(lang, code=None):
    page = DATA['entries'][code]['slug'] if code else 'travel'
    item = DATA['entries'].get(code, {})
    default_title = ' — '.join(filter(None, [NAMES[lang].get(code), local(item.get('subtitle'), lang), 'Carlos Aganzo']))
    default_desc = re.sub(r'<[^>]*>', ' ', local(item.get('noteHtml') or item.get('note') or item.get('memory'), lang) or tr('seoDescription_travel', lang))[:190]
    title = TRANSLATIONS[lang].get('seoTitle_' + page, default_title)
    desc = TRANSLATIONS[lang].get('seoDescription_' + page, default_desc)
    canonical = 'https://aganzo.com' + path(lang, code)
    hero = DATA['entries'][code or 'ID'].get('heroPhoto')
    social = 'https://aganzo.com/assets/images/' + hero if hero else 'https://aganzo.com/portrait.jpg'
    alternates = ''.join(f'<link rel="alternate" hreflang="{l}" href="https://aganzo.com{path(l, code)}">' for l in ['en', 'es']) + f'<link rel="alternate" hreflang="x-default" href="https://aganzo.com{path("en", code)}">'
    schema = {'@context': 'https://schema.org', '@type': 'Article' if code else 'CollectionPage', 'url': canonical, 'name': title, 'description': desc, 'inLanguage': lang, 'author': {'@id': 'https://aganzo.com/#person', '@type': 'Person', 'name': 'Carlos Aganzo', 'url': 'https://aganzo.com/'}, 'image': social, 'dateModified': DATE, 'isPartOf': {'@type': 'WebSite', '@id': 'https://aganzo.com/#website'}}
    if code:
        schema['mainEntityOfPage'] = canonical
        schema['headline'] = title
    else:
        schema['hasPart'] = [{'@type': 'Article', 'url': 'https://aganzo.com' + path(lang, c), 'name': NAMES[lang][c]} for c in DESTINATIONS]
    social_tags = ''.join(f'<meta {"property" if k.startswith("og:") else "name"}="{k}" content="{e(v)}">' for k, v in {'og:type': 'article' if code else 'website', 'og:title': title, 'og:description': desc, 'og:url': canonical, 'og:image': social, 'og:site_name': 'AGANZO.COM', 'og:locale': 'es_ES' if lang == 'es' else 'en_GB', 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': desc, 'twitter:image': social}.items())
    # No locale flash on ja/zh links; static en/es remain useful without JS.
    early = "<style>html.i18n-pending body{visibility:hidden}</style><script>try{if(['ja','zh'].includes(new URLSearchParams(location.search).get('lang'))){document.documentElement.classList.add('i18n-pending');setTimeout(()=>document.documentElement.classList.remove('i18n-pending'),1800)}}catch{}</script>"
    head = f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8">{early}<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{canonical}">{alternates}<meta name="author" content="Carlos Aganzo">{social_tags}<meta name="cf-web-analytics-token" content="403e543dcdab49e7bbf3115318a8bf44"><link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/site.css?v=20260927-seo3"><link rel="stylesheet" href="/assets/css/travel.css?v={VERSION}"><script type="module" src="/assets/js/travel-app.js?v={VERSION}"></script><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script><script defer src="/assets/js/analytics.js?v=20260922-main"></script></head>'''
    if code:
        main = f'<div class="journal-breadcrumb"><a data-localized-link href="{path(lang)}?country={code}#notebook">← {e(tr("journalBack", lang))}</a><span class="micro">{e(tr("journalEyebrow", lang))}</span></div><section id="notebook">{reader(lang, code, True)}</section><section class="journal-related"><p class="eyebrow">{e(tr("journalMore", lang))}</p>{choices(lang, code, True)}</section>'
    else:
        main = f'''<section class="journal-intro"><div><p class="eyebrow">01 / <span data-i18n="travel">{e(tr('travel', lang))}</span></p><h1 data-i18n-html="travelTitleV2">{tr('travelTitleV2', lang)}</h1></div><div class="journal-intro-note"><p data-i18n="journalIntro">{e(tr('journalIntro', lang))}</p><span class="micro">{len(VISITED)} <span data-i18n="atlasVisited">{e(tr('atlasVisited', lang))}</span></span></div></section>
          <nav class="journal-jumps" aria-label="{e(tr('navigation', lang))}"><a href="#notebook">01 <span data-i18n="journalNavShort">{e(tr('journalNavShort', lang))}</span> ↓</a><a href="#atlas">02 <span data-i18n="journalMapShort">{e(tr('journalMapShort', lang))}</span> ↓</a><a href="#fixed-points">03 <span data-i18n="journalPlacesShort">{e(tr('journalPlacesShort', lang))}</span> ↓</a></nav>
          <section id="notebook" class="journal-notebook" aria-label="{e(tr('journalNav', lang))}"><div class="journal-notebook-label"><p class="eyebrow" data-i18n="journalEyebrow">{e(tr('journalEyebrow', lang))}</p><span class="micro" id="journal-content-count">{len(VISITED)} {e(tr('journalCountries', lang))} · {len(DESTINATIONS)} {e(tr('journalWithContent', lang))}</span></div>{country_picker(lang, DEFAULT_COUNTRY)}<div class="journal-content-shortcuts"><span class="micro journal-content-label" data-i18n="journalContentLabel">{e(tr('journalContentLabel', lang))}</span>{choices(lang, DEFAULT_COUNTRY)}</div><div id="journal-reader">{reader(lang, DEFAULT_COUNTRY)}</div><p id="journal-status" class="sr-only" role="status"></p></section>
          {atlas(lang)}{localized_template('travel-fixed.html', lang)}'''
    body = f'<body class="travel-journal" data-page="{page}" data-travel-country="{code or ""}"><a class="skip" data-i18n="skip" href="#main">{e(tr("skip", lang))}</a>{localized_template("travel-header.html", lang)}<main id="main">{main}</main>{localized_template("travel-footer.html", lang)}<noscript><p class="journal-noscript">{e(tr("journalNoScript", lang))}</p></noscript></body></html>\n'
    out = ROOT / path(lang, code).lstrip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(head + body)


def sitemap():
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    xhtml = 'http://www.w3.org/1999/xhtml'
    img = 'http://www.google.com/schemas/sitemap-image/1.1'
    ET.register_namespace('', ns); ET.register_namespace('xhtml', xhtml); ET.register_namespace('image', img)
    file = ROOT / 'sitemap.xml'; tree = ET.parse(file); root = tree.getroot()
    for lang in ['en', 'es']:
        for code in [None, *DESTINATIONS]:
            url = 'https://aganzo.com' + path(lang, code)
            node = next((n for n in root if n.findtext('{'+ns+'}loc') == url), None)
            if node is None:
                node = ET.SubElement(root, '{'+ns+'}url')
            else:
                node.clear()
            ET.SubElement(node, '{'+ns+'}loc').text = url
            ET.SubElement(node, '{'+ns+'}lastmod').text = DATE
            for l in ['en', 'es', 'x-default']:
                ET.SubElement(node, '{'+xhtml+'}link', {'rel': 'alternate', 'hreflang': l, 'href': 'https://aganzo.com' + path('en' if l == 'x-default' else l, code)})
            if code:
                for photo in DATA['entries'][code].get('photos', []):
                    child = ET.SubElement(node, '{'+img+'}image')
                    ET.SubElement(child, '{'+img+'}loc').text = 'https://aganzo.com' + image(photo)
                    ET.SubElement(child, '{'+img+'}caption').text = local(photo['alt'], lang)
    ET.indent(tree, space='  ')
    tree.write(file, encoding='utf-8', xml_declaration=True)


if __name__ == '__main__':
    for locale in ['en', 'es']:
        build(locale)
        for country in DESTINATIONS:
            build(locale, country)
    sitemap()
    (ROOT / 'assets/data/travel.json').write_text(json.dumps(DATA, ensure_ascii=False, indent=2) + '\n')
    print(f'Built {2 * (1 + len(DESTINATIONS))} travel pages; {len(VISITED)} countries and {len(DESTINATIONS)} entries with content.')
