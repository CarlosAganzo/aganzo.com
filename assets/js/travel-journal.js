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
  const alt = photo => local(photo.alt) || name(country);
  const allPhotos = code => data.entries[code]?.photos || (data.entries[code]?.photo ? [data.entries[code].photo] : []);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let country, subregion, region, mapMode = 'world', activePhoto = 0, shownPhotos = [];
  let regionalAsset = null, mapRequest = 0;
  const mainReader = document.getElementById('journal-reader');
  const countryList = document.getElementById('country-list');
  const search = document.getElementById('country-search');
  const shapes = [...document.querySelectorAll('.atlas-country')];
  const mapShell = document.getElementById('regional-map-shell');
  const mapCanvas = document.getElementById('regional-map-canvas');
  const mapPaper = document.querySelector('.map-paper');
  const worldMap = document.querySelector('.atlas-map');
  const config = () => data.subdivisions?.[country];
  const path = (code, hash = '') => {
    const url = new URL((lang === 'es' ? '/es' : '') + '/travel/' + (code && data.entries[code]?.slug ? data.entries[code].slug + '/' : ''), location.origin);
    if (lang === 'ja' || lang === 'zh') url.searchParams.set('lang', lang);
    if (new URLSearchParams(location.search).get('from') === 'carlosaganzo.com') url.searchParams.set('from', 'carlosaganzo.com');
    if(code && !data.entries[code]?.slug){url.searchParams.set('country',code);if(!hash)hash='notebook';}
    url.hash = hash;
    return url.pathname + url.search + url.hash;
  };
  function readUrl() {
    const params = new URLSearchParams(location.search);
    country = standalone || (visited.includes(params.get('country')) ? params.get('country') : 'ID');
    subregion = config()?.regions?.[params.get('subregion')]?.visited ? params.get('subregion') : null;
    region = data.regions[params.get('region')] ? params.get('region') : 'all';
    mapMode = (subregion || location.hash === '#atlas') && config() ? 'regional' : 'world';
  }
  function writeUrl(push = true) {
    const url = new URL(location.href);
    if (!standalone) url.searchParams.set('country', country);
    if (subregion) url.searchParams.set('subregion', subregion); else url.searchParams.delete('subregion');
    if (!standalone && region !== 'all') url.searchParams.set('region', region); else url.searchParams.delete('region');
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
      filter = `<label class="journal-region-label"><span class="sr-only">${esc(t('journalPhotoRegions'))}</span><select id="photo-region"><option value="">${esc(t('journalAllPhotos'))}</option>${Object.entries(regions).filter(([,r])=>r.visited).map(([key,r])=>`<option value="${key}"${key===subregion?' selected':''}>${esc(local(r.name))}</option>`).join('')}</select></label>`;
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
      shape.classList.toggle('is-visited', Boolean(r?.visited));
      shape.classList.toggle('is-selected', shape.dataset.region===subregion);
      shape.setAttribute('aria-pressed', String(shape.dataset.region===subregion));
      if(r)shape.setAttribute('aria-label', local(r.name)+' — '+t(r.visited?'visitedRegion':'unvisitedRegion'));
      if(r?.visited){shape.setAttribute('role','button');shape.setAttribute('tabindex','0');}
    });
    const buttons = [{key:'',label:t('allRegionPhotos')},...Object.entries(regions).filter(([,r])=>r.visited).map(([key,r])=>({key,label:local(r.name)}))];
    document.getElementById('regional-map-list').innerHTML=buttons.map(({key,label})=>`<button type="button" data-subregion="${key}" aria-pressed="${(key||null)===subregion}">${esc(label)}</button>`).join('');
  }
  async function renderMap() {
    if (!mapShell) return;
    const request=++mapRequest, settings=config();
    const regional = mapMode==='regional' && settings;
    worldMap.hidden=Boolean(regional); mapShell.hidden=!regional; mapPaper.classList.toggle('is-regional',Boolean(regional));
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
  function select(code, shouldScroll = true) {
    if(!visited.includes(code))return;
    country=code;subregion=null;mapMode='world';
    if(region!=='all'&&region!==regionOf(code))region='all';
    writeUrl();renderReader();renderMapSelection();renderMap();
    if(shouldScroll)scrollTo('notebook',true);
  }
  function selectSubregion(key, shouldScroll = false) {
    if(key && !config()?.regions?.[key]?.visited)return;
    subregion=key||null;writeUrl();renderReader();syncSubregions();
    if(shouldScroll)scrollTo('notebook',true);
  }
  // Delegation survives destination changes and preserves ordinary new-tab links.
  document.addEventListener('click', event => {
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const destination=event.target.closest('[data-destination]');
    if(destination&&!standalone){event.preventDefault();select(destination.dataset.destination,false);return;}
    const onMap=event.target.closest('[data-show-map]');
    if(onMap&&!standalone){event.preventDefault();mapMode=config()?'regional':'world';renderMap();scrollTo('atlas');return;}
    const thumb=event.target.closest('[data-photo-index]');
    if(thumb){event.preventDefault();updatePhoto(Number(thumb.dataset.photoIndex));return;}
    const step=event.target.closest('[data-photo-step]');
    if(step){updatePhoto(activePhoto+Number(step.dataset.photoStep));return;}
    if(event.target.closest('#journal-hero')){event.preventDefault();openPhoto();return;}
    const countryButton=event.target.closest('[data-country-code]');
    if(countryButton){select(countryButton.dataset.countryCode);return;}
    const shape=event.target.closest('.atlas-country');
    if(shape){select(shape.dataset.country);return;}
    const filter=event.target.closest('.region-filters [data-region]');
    if(filter){region=filter.dataset.region;mapMode='world';search.value='';countryList.scrollTop=0;writeUrl();renderMapSelection();renderMap();return;}
    if(event.target.closest('#regional-map-back')){mapMode='world';renderMap();return;}
    const sub=event.target.closest('[data-subregion],.region-province.is-visited');
    if(sub){selectSubregion(sub.dataset.subregion??sub.dataset.region,true);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='photo-region')selectSubregion(event.target.value);if(event.target.id==='journal-country')select(event.target.value,false);});
  document.addEventListener('keydown',event=>{
    const shape=event.target.closest('.atlas-country,.region-province.is-visited');
    if(shape&&(event.key==='Enter'||event.key===' ')){event.preventDefault();if(shape.dataset.country)select(shape.dataset.country);else selectSubregion(shape.dataset.region,true);}
  });
  search?.addEventListener('input',renderCountries);
  window.addEventListener('popstate',()=>{readUrl();renderReader();renderMapSelection();renderMap();});
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
  readUrl();renderReader();renderMapSelection();renderMap();
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
