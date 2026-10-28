// One reader for the atlas and destination pages. Content lives in travel.json.
export function initTravel({data, t, language}) {
  const lang = language();
  const names = new Intl.DisplayNames([lang], {type: 'region'});
  const local = value => typeof value === 'object' && value ? value[lang] || value.en || '' : value || '';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visited = [...new Set(Object.values(data.regions).flat())];
  const hasText = value => typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && Object.values(value).some(hasText));
  const hasContent = code => {
    const entry=data.entries[code];
    return Boolean(entry && ([entry.noteHtml,entry.note,entry.memory].some(hasText) || entry.photos?.length || entry.photo));
  };
  const written = visited.filter(hasContent).sort((a,b)=>names.of(a).localeCompare(names.of(b),lang));
  const standalone = document.body.dataset.travelCountry;
  const regionOf = code => Object.keys(data.regions).find(r => data.regions[r].includes(code));
  const name = code => names.of(code);
  const image = photo => '/assets/images/' + photo.file;
  const alt = photo => local(photo.alt) || (country ? name(country) : '');
  const allPhotos = code => data.entries[code]?.photos || (data.entries[code]?.photo ? [data.entries[code].photo] : []);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let country, subregion, region, mapMode = 'world', activePhoto = 0, shownPhotos = [];
  let regionalAsset = null, mapRequest = 0;
  const mainReader = document.getElementById('journal-reader');
  const countryList = document.getElementById('country-list');
  const search = document.getElementById('country-search');
  let shapes = [];
  const worldCanvas = document.getElementById('world-map-canvas');
  const mapShell = document.getElementById('regional-map-shell');
  const mapCanvas = document.getElementById('regional-map-canvas');
  const mapPaper = document.querySelector('.map-paper');
  let worldMap = document.querySelector('.atlas-map');
  const config = () => data.subdivisions?.[country];
  const path = (code, hash = '') => {
    const prefix = ({en:'',es:'/es',ja:'/ja',zh:'/zh-hans'})[lang] || '';
    const url = new URL(prefix + '/travel/' + (code && data.entries[code]?.slug ? data.entries[code].slug + '/' : ''), location.origin);
    if (new URLSearchParams(location.search).get('from') === 'carlosaganzo.com') url.searchParams.set('from', 'carlosaganzo.com');
    if(code && !data.entries[code]?.slug){url.searchParams.set('country',code);if(!hash)hash='notebook';}
    url.hash = hash;
    return url.pathname + url.search + url.hash;
  };
  function readUrl() {
    const params = new URLSearchParams(location.search);
    const requestedCountry = params.get('country');
    country = standalone || (visited.includes(requestedCountry) ? requestedCountry : null);
    const requestedSubregion = params.get('subregion');
    const current = data.subdivisions?.[country];
    const requestedRegion = current?.regions?.[requestedSubregion];
    subregion = requestedRegion && (requestedRegion.visited || requestedRegion.enabled) ? requestedSubregion : null;
    region = data.regions[params.get('region')] ? params.get('region') : 'all';
    if (standalone) {
      mapMode = ((data.entries[country]?.regionalExplorer || subregion || location.hash === '#atlas') && config()) ? 'regional' : 'world';
    } else {
      mapMode = params.get('map') === 'spain' || (country === 'ES' && params.get('map') !== 'world') ? 'regional' : 'world';
      if (mapMode === 'regional') country = 'ES';
      if (mapMode !== 'regional') subregion = null;
    }
  }
  function writeUrl(push = true) {
    const url = new URL(location.href);
    if (!standalone) {
      if (country) url.searchParams.set('country', country);
      else url.searchParams.delete('country');
      if (mapMode === 'regional' && country === 'ES') url.searchParams.set('map', 'spain');
      else if (country === 'ES') url.searchParams.set('map', 'world');
      else url.searchParams.delete('map');
      if (region !== 'all' && mapMode === 'world') url.searchParams.set('region', region);
      else url.searchParams.delete('region');
    }
    if (subregion) url.searchParams.set('subregion', subregion);
    else url.searchParams.delete('subregion');
    if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null, '', url);
  }
  function scrollTo(id, focus = false) {
    document.getElementById(id)?.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'});
    if (focus) document.getElementById('country-title')?.focus({preventScroll: true});
  }
  function choices() {
    document.querySelectorAll('.journal-choices').forEach(nav => {
      nav.setAttribute('aria-label', t('journalNav'));
      nav.innerHTML = written.map(code => {
        const item = data.entries[code], photos = allPhotos(code);
        const hero = photos.find(p => p.file === item.heroPhoto) || photos[0];
        const visual = hero ? `<img src="${image(hero)}" alt="" width="96" height="64">` : '<span class="journal-choice-type" aria-hidden="true">Aa</span>';
        const label = photos.length ? `${photos.length} ${t('journalPhotoShort')}` : t('journalStoryOnly');
        return `<a class="journal-choice" data-destination="${code}" href="${path(code)}"${code === country ? ' aria-current="true"' : ''}>${visual}<span><strong>${esc(name(code))}</strong><small>${esc(label)}</small></span><span class="choice-arrow" aria-hidden="true">${standalone ? '↗' : '↓'}</span></a>`;
      }).join('');
    });
    const picker=document.getElementById('journal-country');
    if(picker){
      picker.innerHTML=Object.entries(data.regions).map(([key,codes])=>`<optgroup label="${esc(t(key))}">${[...codes].sort((a,b)=>name(a).localeCompare(name(b),lang)).map(code=>`<option value="${code}"${code===country?' selected':''}>${esc(name(code))} — ${esc(hasContent(code)?(allPhotos(code).length?`${allPhotos(code).length} ${t('journalPhotoShort')}`:t('journalStoryOnly')):t('journalPending'))}</option>`).join('')}</optgroup>`).join('');
    }
    const count = document.getElementById('journal-content-count');
    if(count)count.textContent=`${visited.length} ${t('journalCountries')} · ${written.length} ${t('journalWithContent')}`;
  }
  function renderReader() {
    if (!standalone && !mainReader) { renderAtlasPreview(); return; }
    const item = data.entries[country] || {};
    const photos = allPhotos(country);
    shownPhotos = subregion ? photos.filter(photo => photo.region === subregion) : photos;
    activePhoto = Math.max(0, shownPhotos.findIndex(p => p.file === item.heroPhoto));
    const date = local(item.period) || (item.year && item.year !== '—' ? item.year : '');
    const meta = [t(regionOf(country)), date].filter(Boolean).join(' · ');
    const titleTag = standalone ? 'h1' : 'h2';
    const articleLink = !standalone && item.slug ? `<a class="journal-text-link" id="journey-page-link" href="${path(country)}">${esc(t('journalReadPage'))} <span aria-hidden="true">↗</span></a>` : '';
    const htmlNote = local(item.noteHtml);
    const note = htmlNote ? '<p>' + htmlNote.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>') + '</p>' : `<p>${esc(local(item.note) || local(item.memory) || t('journalEmptyText'))}</p>`;
    const places = local(item.places);
    const route = Array.isArray(places) && places.length ? `<div class="journal-route"><span class="micro">${esc(t('journalRoute'))}</span><p>${places.map(esc).join(' · ')}</p></div>` : '';
    const mapURL = new URL(path(null, 'atlas'), location.origin); mapURL.searchParams.set('country', country);
    const mapLink = `<a class="journal-text-link" data-show-map="${country}" href="${mapURL.pathname+mapURL.search+mapURL.hash}">${esc(t('journalOnMap'))} <span aria-hidden="true">↓</span></a>`;
    const gallery = photos.length ? galleryHTML() : '';
    const article = `<article id="country-detail" class="journal-entry${photos.length ? '' : ' journal-entry--text'}" data-country="${country}"><header class="journal-entry-heading"><div><p class="eyebrow">${esc(meta)}</p><${titleTag} id="country-title" tabindex="-1">${esc(name(country))}</${titleTag}></div>${articleLink}</header><div class="journal-entry-grid">${gallery}<div class="journal-writing"><p class="journal-subtitle">${esc(local(item.subtitle) || t('journalEmptyTitle'))}</p><div id="country-note" class="journal-prose">${note}</div>${route}<div class="journal-entry-links">${mapLink}</div></div></div></article>`;
    if (mainReader) mainReader.innerHTML = article;
    else document.getElementById('country-detail').outerHTML = article;
    updatePhoto(activePhoto, false);
    choices();
    const status = document.getElementById('journal-status');
    if (status) status.textContent = `${name(country)}. ${shownPhotos.length} ${t('journalPhotos')}.`;
  }
  function galleryHTML() {
    const regions = config()?.regions;
    let filter = '';
    if (regions) {
      filter = `<label class="journal-region-label"><span class="sr-only">${esc(t('journalPhotoRegions'))}</span><select id="photo-region"><option value="">${esc(t('journalAllPhotos'))}</option>${Object.entries(regions).filter(([,r])=>r.visited||r.enabled).map(([key,r])=>`<option value="${key}"${key===subregion?' selected':''}>${esc(local(r.name))}</option>`).join('')}</select></label>`;
    }
    const photo = shownPhotos[activePhoto];
    if (!photo) return `<section class="journal-gallery"><div class="journal-gallery-top">${filter}</div><p>${esc(t('journalRegionEmpty'))}</p></section>`;
    return `<section class="journal-gallery" aria-label="${esc(t('journalNav'))}"><div class="journal-gallery-top"><span class="micro" id="photo-total">${shownPhotos.length} ${esc(t('journalPhotos'))}</span>${filter}</div><figure class="journal-photo-frame"><a id="journal-hero" href="${image(photo)}" aria-label="${esc(t('journalExpand'))}"><img src="${image(photo)}" alt="${esc(alt(photo))}" width="1400" height="933" fetchpriority="high"><span class="journal-expand" aria-hidden="true">↗</span></a></figure><div class="journal-photo-caption"><span id="photo-caption">${esc(alt(photo))}</span><div class="journal-photo-controls"><button type="button" data-photo-step="-1" aria-label="${esc(t('previous'))}">←</button><span id="photo-counter"></span><button type="button" data-photo-step="1" aria-label="${esc(t('next'))}">→</button></div></div><div class="journal-thumbs" aria-label="${esc(t('journalAllPhotos'))}">${shownPhotos.map((p,i)=>`<a href="${image(p)}" class="journal-thumb" data-photo-index="${i}" aria-label="${esc(alt(p))}" aria-current="${i===activePhoto}"><img src="${image(p)}" alt="" width="100" height="68" loading="lazy"></a>`).join('')}</div></section>`;
  }
  function updatePhoto(index, reveal = true) {
    if (!shownPhotos.length) return;
    activePhoto = (index + shownPhotos.length) % shownPhotos.length;
    const photo = shownPhotos[activePhoto], hero = document.getElementById('journal-hero');
    if (!hero) return;
    hero.href = image(photo);
    const img = hero.querySelector('img');
    img.src = image(photo); img.alt = alt(photo);
    img.onerror = () => { document.getElementById('photo-caption').textContent = t('journalPhotoError'); };
    document.getElementById('photo-caption').textContent = alt(photo);
    document.getElementById('photo-counter').textContent = `${activePhoto+1} / ${shownPhotos.length}`;
    document.querySelectorAll('[data-photo-step]').forEach(b=>{b.disabled=shownPhotos.length<2;});
    document.querySelectorAll('[data-photo-index]').forEach((button,i) => {
      button.setAttribute('aria-current', String(i === activePhoto));
      if (i === activePhoto && reveal) {
        const rail = button.parentElement;
        if (button.offsetLeft < rail.scrollLeft || button.offsetLeft + button.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollTo({left: button.offsetLeft - rail.offsetLeft, behavior: 'instant'});
      }
    });
  }
  function openPhoto() {
    if (!shownPhotos.length) return;
    const photos = [...shownPhotos];
    let current = activePhoto, touchX = null;
    const returnFocus = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'journal-lightbox';
    dialog.setAttribute('aria-label', `${name(country)} — ${t('journalPhotos')}`);
    dialog.innerHTML = `<button class="journal-lightbox-close" aria-label="${esc(t('journalClose'))}">×</button><button class="journal-lightbox-prev" aria-label="${esc(t('previous'))}">←</button><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><button class="journal-lightbox-next" aria-label="${esc(t('next'))}">→</button>`;
    const img = dialog.querySelector('img');
    const update = step => {
      current = (current + step + photos.length) % photos.length;
      img.src = image(photos[current]); img.alt = alt(photos[current]);
      dialog.querySelector('figcaption').textContent = `${current+1} / ${photos.length} — ${alt(photos[current])}`;
    };
    dialog.querySelector('.journal-lightbox-close').onclick = () => dialog.close();
    dialog.querySelector('.journal-lightbox-prev').onclick = () => update(-1);
    dialog.querySelector('.journal-lightbox-next').onclick = () => update(1);
    dialog.querySelectorAll('.journal-lightbox-prev,.journal-lightbox-next').forEach(b=>b.disabled=photos.length<2);
    dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); update(event.key === 'ArrowLeft' ? -1 : 1);}
    });
    img.addEventListener('touchstart', e=>{touchX=e.changedTouches[0].clientX;},{passive:true});
    img.addEventListener('touchend', e=>{const dx=e.changedTouches[0].clientX-touchX;if(touchX!==null&&Math.abs(dx)>50)update(dx<0?1:-1);touchX=null;},{passive:true});
    dialog.addEventListener('close', () => {dialog.remove(); document.body.classList.remove('photo-is-open'); updatePhoto(current); returnFocus?.focus({preventScroll:true});});
    document.body.append(dialog); document.body.classList.add('photo-is-open'); update(0); dialog.showModal();
  }

  const atlasUi = {"en":{"selected":"Selected place","empty":"Visited, but the story is not published yet.","regionEmpty":"This region is awaiting its own notes.","hasNotes":"With a story or photographs","visited":"Visited · notes pending","choose":"Choose somewhere on the map","chooseBody":"Explore 76 countries or switch to Spain to discover its regions.","readRegion":"Read the regional notes","readCountry":"Read the complete country page","mapError":"Unable to load the map. Use the country list to continue."},"es":{"selected":"Lugar seleccionado","empty":"Visitado, pero todavía sin relato publicado.","regionEmpty":"Esta región todavía no tiene relato publicado.","hasNotes":"Con relatos o fotografías","visited":"Visitado · pendiente de publicar","choose":"Elige un lugar en el mapa","chooseBody":"Explora 76 países o cambia a España para descubrir sus regiones.","readRegion":"Leer las notas de la región","readCountry":"Leer la página completa del país","mapError":"No se ha podido cargar el mapa. Puedes usar la lista de países."},"ja":{"selected":"選択した場所","empty":"訪れた国ですが、記録はまだ公開していません。","regionEmpty":"この地域の記録はまだ公開していません。","hasNotes":"文章または写真あり","visited":"訪問済み・記録は準備中","choose":"地図から場所を選ぶ","chooseBody":"訪れた76か国、またはスペイン各地の記録を探索できます。","readRegion":"地域の記録を読む","readCountry":"国のページを読む","mapError":"地図を読み込めませんでした。国の一覧から選択できます。"},"zh":{"selected":"当前地点","empty":"去过这里，但旅行记录尚未发布。","regionEmpty":"这个地区的记录尚未发布。","hasNotes":"已有故事或照片","visited":"已到访 · 待发布","choose":"在地图上选择地点","chooseBody":"探索到访过的76个国家，或查看西班牙各地区。","readRegion":"阅读地区笔记","readCountry":"阅读国家完整页面","mapError":"地图无法加载。你仍可通过国家列表浏览。"}};
  const atlasLabels = () => atlasUi[lang] || atlasUi.en;
  const asPlainText = value => {
    const node = document.createElement('div');
    node.innerHTML = String(value || '').replace(/<br\s*\/?>/gi, ' ');
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  };
  function renderAtlasPreview() {
    const host = document.getElementById('atlas-preview');
    if (!host) return;
    const label = atlasLabels();
    if (!country) {
      host.innerHTML = '<p class="eyebrow">' + esc(label.selected) + '</p><h3>' + esc(label.choose) + '</h3><p>' + esc(label.chooseBody) + '</p>';
      return;
    }
    const entry = data.entries[country] || {};
    const isRegional = mapMode === 'regional' && country === 'ES';
    const localRegion = isRegional && subregion ? config()?.regions?.[subregion] : null;
    const regionPublished = localRegion && Boolean(local(localRegion.noteHtml) || local(localRegion.note) || local(localRegion.places)?.length);
    const published = localRegion ? regionPublished : hasContent(country);
    const title = localRegion ? local(localRegion.name) : name(country);
    const note = localRegion ? local(localRegion.noteHtml) || local(localRegion.note) : local(entry.noteHtml) || local(entry.note) || local(entry.memory);
    const description = published ? asPlainText(note).slice(0,285) : localRegion ? label.regionEmpty : label.empty;
    const photos = localRegion ? [] : allPhotos(country);
    const hero = photos.find(p => p.file === entry.heroPhoto) || photos[0];
    const photo = hero ? '<img src="' + image(hero) + '" alt="' + esc(local(hero.alt) || name(country)) + '" loading="lazy" width="320" height="210">' : '';
    let link = '';
    if (entry.slug && (published || isRegional)) {
      const destination = new URL(path(country), location.origin);
      if (localRegion) { destination.searchParams.set('subregion', subregion); destination.hash = 'regions'; }
      link = '<a class="atlas-preview-link" href="' + esc(destination.pathname + destination.search + destination.hash) + '">' + esc(localRegion ? label.readRegion : label.readCountry) + ' <span aria-hidden="true">↗</span></a>';
    }
    const places = localRegion ? local(localRegion.places) : local(entry.places);
    const route = Array.isArray(places) && places.length ? '<p class="atlas-preview-places">' + places.map(esc).join(' · ') + '</p>' : '';
    host.innerHTML = '<div class="atlas-preview-copy"><p class="eyebrow">' + esc(published ? label.hasNotes : label.visited) + '</p><h3>' + esc(title) + '</h3><p>' + esc(description || label.empty) + '</p>' + route + link + '</div>' + photo;
  }
  function loadWorldMap() {
    if (!worldCanvas) return;
    fetch('/assets/maps/world-visited.svg?v=20261028-atlas1')
      .then(response => { if (!response.ok) throw new Error('World map unavailable'); return response.text(); })
      .then(svg => {
        worldCanvas.innerHTML = svg;
        worldMap = worldCanvas.querySelector('.atlas-map');
        if (worldMap) worldMap.setAttribute('aria-label',t('atlasLegend'));
        shapes = [...worldCanvas.querySelectorAll('.atlas-country')];
        renderMapSelection();
        if (worldMap) worldMap.hidden = mapMode === 'regional';
      })
      .catch(() => {
        worldCanvas.innerHTML = '<p class="atlas-loading">' + esc(atlasLabels().mapError) + '</p>';
        document.getElementById('map-status').textContent = atlasLabels().mapError;
      });
  }

  function renderCountries() {
    if (!countryList) return;
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase(lang);
    const query = normalize(search.value.trim());
    const codes = (region === 'all' ? visited : data.regions[region]).filter(code=>normalize(name(code)).includes(query)||code.toLowerCase()===query).sort((a,b)=>name(a).localeCompare(name(b),lang));
    const position = countryList.scrollTop;
    countryList.innerHTML = codes.map(code => `<button type="button" data-country-code="${code}" aria-pressed="${code===country}"><span>${esc(name(code))}</span>${hasContent(code)?`<span class="country-has-story" aria-label="${esc(t('journalStoryOnly'))}">↗</span>`:''}</button>`).join('');
    countryList.scrollTop = position;
    document.getElementById('country-status').textContent = codes.length ? `${codes.length} / ${visited.length}` : t('noCountries');
  }
  function renderMapSelection() {
    document.querySelectorAll('.region-filters [data-region]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.region===region)));
    document.querySelectorAll('[data-map-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapMode === (mapMode === 'regional' ? 'spain' : 'world'))));
    const spain = !standalone && mapMode === 'regional';
    const filters = document.querySelector('.region-filters');
    const index = document.querySelector('.journal-atlas .country-index');
    if (filters) filters.hidden = spain;
    if (index) index.hidden = spain;
    document.querySelector('.journal-atlas-grid')?.classList.toggle('is-regional-view',spain);
    renderAtlasPreview();
    shapes.forEach(shape => {
      shape.setAttribute('aria-label', name(shape.dataset.country));
      shape.setAttribute('aria-pressed', String(shape.dataset.country===country));
      shape.classList.toggle('is-muted', region!=='all'&&shape.dataset.region!==region);
      let title=shape.querySelector('title');
      if(!title){title=document.createElementNS('http://www.w3.org/2000/svg','title');shape.append(title);}
      title.textContent=name(shape.dataset.country);
    });
    renderCountries();
  }
  function syncSubregions() {
    const regions = config()?.regions;
    if (!regions || !mapCanvas) return;
    mapCanvas.querySelectorAll('.region-province').forEach(shape=>{
      const r=regions[shape.dataset.region];
      const available=Boolean(r?.visited||r?.enabled);
      shape.classList.toggle('is-visited', Boolean(r?.visited));
      shape.classList.toggle('is-enabled', available);
      shape.classList.toggle('has-notes', Boolean(r && (local(r.noteHtml) || local(r.note) || local(r.places)?.length)));
      shape.classList.toggle('is-selected', shape.dataset.region===subregion);
      shape.setAttribute('aria-pressed', String(shape.dataset.region===subregion));
      if(r)shape.setAttribute('aria-label', local(r.name)+' — '+((local(r.noteHtml)||local(r.note)||local(r.places)?.length)?atlasLabels().hasNotes:(r.visited?atlasLabels().visited:atlasLabels().regionEmpty)));
      if(available){shape.setAttribute('role','button');shape.setAttribute('tabindex','0');}
      else{shape.removeAttribute('role');shape.setAttribute('tabindex','-1');}
    });
    const allLabel = standalone && data.entries[country]?.regionalExplorer ? t('allRegions') : t('allRegionPhotos');
    const buttons = [{key:'',label:allLabel,status:'all'},...Object.entries(regions).filter(([,r])=>r.visited||r.enabled).map(([key,r])=>({key,label:local(r.name),status:(local(r.noteHtml)||local(r.note)||local(r.places)?.length)?'story':r.visited?'visited':'pending'}))];
    const list=document.getElementById('regional-map-list');
    if(list){
      const label=atlasLabels();
      const legend='<div class="region-legend"><span>● '+esc(label.hasNotes)+'</span><span>◌ '+esc(label.visited)+'</span><span>– '+esc(label.regionEmpty)+'</span></div>';
      list.innerHTML=legend+buttons.map(({key,label:regionLabel,status})=>{
        const statusName=status==='story'?label.hasNotes:status==='visited'?label.visited:status==='pending'?label.regionEmpty:'';
        const marker=status==='story'?'●':status==='visited'?'◌':status==='pending'?'–':'';
        return `<button type="button" data-subregion="${key}" data-status="${status}" aria-pressed="${(key||null)===subregion}" aria-label="${esc(regionLabel+(statusName?' — '+statusName:''))}"><span>${esc(regionLabel)}</span><span class="region-list-status" aria-hidden="true">${marker}</span></button>`;
      }).join('');
    }
  }
  function renderRegionDetail() {
    const detail=document.getElementById('region-detail');
    const settings=config(), regions=settings?.regions;
    if(!detail||!regions)return;
    const item=subregion?regions[subregion]:null;
    const title=item?local(item.name):t('allRegions');
    const note=item?(local(item.noteHtml)||local(item.note)||t('regionEmpty')):(local(settings.intro)||t('journalRegionsIntro'));
    const places=item?local(item.places):null;
    const placeLine=Array.isArray(places)&&places.length?`<div class="region-detail-places"><span class="micro">${esc(t('journalRoute'))}</span><p>${places.map(esc).join(' · ')}</p></div>`:'';
    detail.innerHTML=`<p class="eyebrow">${esc(t('regionArchive'))}</p><h2 id="region-detail-title">${esc(title)}</h2><div class="region-detail-copy"><p>${String(note).replace(/<br\s*\/?>\s*<br\s*\/?>/gi,'</p><p>')}</p></div>${placeLine}`;
  }
  async function renderMap() {
    if (!mapShell) return;
    const request=++mapRequest, settings=config();
    const regional = mapMode==='regional' && settings;
    if (worldMap) worldMap.hidden = Boolean(regional);
    if (worldCanvas) worldCanvas.hidden = Boolean(regional);
    mapShell.hidden = !regional; mapPaper?.classList.toggle('is-regional',Boolean(regional));
    renderMapSelection();
    if (!regional) return;
    document.getElementById('regional-map-country').textContent=name(country);
    try {
      if(regionalAsset!==settings.asset){
        const response=await fetch('/assets/'+settings.asset);
        if(!response.ok)throw new Error('Regional map unavailable');
        const svg=await response.text();
        if(request!==mapRequest)return;
        mapCanvas.innerHTML=svg; regionalAsset=settings.asset;
      }
      if(request!==mapRequest)return;
      syncSubregions();
    } catch {
      if(request!==mapRequest)return;
      mapMode='world'; renderMap(); document.getElementById('map-status').textContent=t('journalMapError');
    }
  }
  function select(code) {
    if (!visited.includes(code)) return;
    country = code; subregion = null; mapMode = code === 'ES' ? 'regional' : 'world';
    if (region !== 'all' && region !== regionOf(code)) region = 'all';
    writeUrl(); renderReader(); renderMapSelection(); renderMap();
  }
  function selectSubregion(key, shouldScroll = false) {
    const selected = key ? config()?.regions?.[key] : null;
    if (key && !(selected?.visited || selected?.enabled)) return;
    subregion = key || null; mapMode = 'regional';
    writeUrl(); renderReader(); syncSubregions(); renderRegionDetail(); renderAtlasPreview();
    if (standalone && shouldScroll) scrollTo('region-detail',false);
  }
  // Delegation survives destination changes and preserves ordinary new-tab links.
  document.addEventListener('click', event => {
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const destination=event.target.closest('[data-destination]');
    if(destination&&!standalone){event.preventDefault();select(destination.dataset.destination);return;}
    const onMap=event.target.closest('[data-show-map]');
    if(onMap&&!standalone){event.preventDefault();mapMode=config()?'regional':'world';writeUrl();renderMap();scrollTo('atlas');return;}
    const thumb=event.target.closest('[data-photo-index]');
    if(thumb){event.preventDefault();updatePhoto(Number(thumb.dataset.photoIndex));return;}
    const step=event.target.closest('[data-photo-step]');
    if(step){updatePhoto(activePhoto+Number(step.dataset.photoStep));return;}
    if(event.target.closest('#journal-hero')){event.preventDefault();openPhoto();return;}
    const countryButton=event.target.closest('[data-country-code]');
    if(countryButton){select(countryButton.dataset.countryCode);return;}
    const shape=event.target.closest('.atlas-country');
    if(shape){select(shape.dataset.country);return;}
    const switcher = event.target.closest('[data-map-mode]');
    if (switcher && !standalone) {
      mapMode = switcher.dataset.mapMode === 'spain' ? 'regional' : 'world';
      subregion = null;
      if (mapMode === 'regional') {country = 'ES';region = 'all';}
      writeUrl();renderReader();renderMapSelection();renderMap();
      return;
    }
    const filter=event.target.closest('.region-filters [data-region]');
    if(filter){region=filter.dataset.region;mapMode='world';if(search)search.value='';if(countryList)countryList.scrollTop=0;writeUrl();renderMapSelection();renderMap();return;}
    if(event.target.closest('#regional-map-back')){mapMode='world';subregion=null;writeUrl();renderReader();renderMap();return;}
    const sub=event.target.closest('[data-subregion],.region-province.is-enabled');
    if(sub){selectSubregion(sub.dataset.subregion??sub.dataset.region,true);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='photo-region')selectSubregion(event.target.value);if(event.target.id==='journal-country')select(event.target.value);});
  document.addEventListener('keydown',event=>{
    const shape=event.target.closest('.atlas-country,.region-province.is-enabled');
    if(shape&&(event.key==='Enter'||event.key===' ')){event.preventDefault();if(shape.dataset.country)select(shape.dataset.country);else selectSubregion(shape.dataset.region,true);}
  });
  search?.addEventListener('input',renderCountries);
  window.addEventListener('popstate',()=>{readUrl();renderReader();renderMapSelection();renderMap();renderRegionDetail();});
  // Strings outside the changing reader are localized as well.
  const text = (selector,key) => {const node=document.querySelector(selector);if(node)node.textContent=t(key);};
    text('label[for="journal-country"]','journalChooseCountry');text('.journal-content-label','journalContentLabel');text('#atlas-title','journalAtlasTitle');const mapEyebrow=document.querySelector('.journal-section-heading .eyebrow');if(mapEyebrow)mapEyebrow.textContent='02 / '+t('journalMap');text('.journal-atlas-help','journalAtlasHelp');
  text('label[for="country-search"]','journalSearch');text('.journal-total span','atlasVisited');
  text('.journal-atlas-about summary','atlasSubtitle');text('.journal-atlas-about > p','travelText');
  text('.journal-atlas-about .atlas-foot','atlasFoot');text('.journal-related > .eyebrow','journalMore');
  text('.journal-breadcrumb > .micro','journalEyebrow');
  const back=document.querySelector('.journal-breadcrumb a');if(back)back.textContent='← '+t('journalBack');
  document.querySelectorAll('.region-filters [data-region]').forEach(b=>b.textContent=t(b.dataset.region==='all'?'journalAllCountries':b.dataset.region));
  if(search)search.placeholder=t('journalCountry');
  text('.map-key > span:first-child','visited');
  const worldBack=document.getElementById('regional-map-back');if(worldBack)worldBack.textContent='← '+t('worldMap');
  text('.regional-map-heading .micro','regionalView');
  readUrl();renderReader();renderMapSelection();renderMap();renderRegionDetail();loadWorldMap();
  if(standalone){
    const item=data.entries[country]||{},key='seoTitle_'+item.slug;
    if(t(key)===key){
      document.title=[name(country),local(item.subtitle),'Carlos Aganzo'].filter(Boolean).join(' — ');
      const description=String(local(item.noteHtml)||local(item.note)||local(item.memory)||t('seoDescription_travel')).replace(/<[^>]*>/g,' ').slice(0,190);
      document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]').forEach(el=>el.content=description);
      document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(el=>el.content=document.title);
    }
  }
  document.documentElement.classList.add('travel-ready');
}
