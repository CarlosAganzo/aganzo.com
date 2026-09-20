import {load,translate as t,language,onLanguage} from './site.js';
const data=await load('travel');
const visited=[...new Set(Object.values(data.regions).flat())];
const shapes=[...document.querySelectorAll('.atlas-country')];
const list=document.getElementById('country-list');
const search=document.getElementById('country-search');
const title=document.getElementById('country-title');
const note=document.getElementById('country-note');
const entry=document.getElementById('country-entry');
const galleryStage=document.getElementById('trip-gallery-stage');
const params=new URLSearchParams(location.search);
let country=visited.includes(params.get('country'))?params.get('country'):null;
let region=country?Object.keys(data.regions).find(r=>data.regions[r].includes(country)):'all';
function name(code){return new Intl.DisplayNames([language()],{type:'region'}).of(code);}
const travelImageVersion='20260920-1610';
function imageSrc(photo){return '/v2/assets/images/'+photo.file+'?v='+travelImageVersion;}
function imageAlt(photo){return photo.alt?.[language()]||name(country);}
function openPhoto(photos,startIndex){
  let current=startIndex;
  const dialog=document.createElement('dialog');dialog.className='trip-lightbox';
  const frame=document.createElement('div');frame.className='trip-lightbox-frame';
  const img=document.createElement('img');img.className='trip-lightbox-image';
  const caption=document.createElement('div');caption.className='trip-lightbox-caption';
  const close=document.createElement('button');close.type='button';close.className='trip-lightbox-close';close.textContent='×';close.setAttribute('aria-label','Close');
  const prev=document.createElement('button');prev.type='button';prev.className='trip-lightbox-nav trip-lightbox-prev';prev.textContent='‹';prev.setAttribute('aria-label','Previous');
  const next=document.createElement('button');next.type='button';next.className='trip-lightbox-nav trip-lightbox-next';next.textContent='›';next.setAttribute('aria-label','Next');
  function update(index){
    current=(index+photos.length)%photos.length;
    img.src=imageSrc(photos[current]);img.alt=imageAlt(photos[current]);
    caption.textContent=`${current+1} / ${photos.length}`;
  }
  close.addEventListener('click',()=>dialog.close());
  prev.addEventListener('click',()=>update(current-1));
  next.addEventListener('click',()=>update(current+1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')update(current-1);
    if(e.key==='ArrowRight')update(current+1);
  });
  dialog.addEventListener('close',()=>dialog.remove());
  frame.append(close,prev,img,next,caption);dialog.append(frame);document.body.append(dialog);update(startIndex);dialog.showModal();
}
function renderGallery(photos,heroFile){
  galleryStage.replaceChildren();
  if(!photos?.length){galleryStage.hidden=true;return;}
  galleryStage.hidden=false;
  let active=Math.max(0,photos.findIndex(photo=>photo.file===heroFile));
  const main=document.createElement('div');main.className='trip-gallery-main';
  const heroButton=document.createElement('button');heroButton.type='button';heroButton.className='trip-gallery-hero';
  const hero=document.createElement('img');hero.loading='lazy';heroButton.append(hero);
  const prev=document.createElement('button');prev.type='button';prev.className='trip-gallery-arrow trip-gallery-prev';prev.textContent='‹';prev.setAttribute('aria-label','Previous');
  const next=document.createElement('button');next.type='button';next.className='trip-gallery-arrow trip-gallery-next';next.textContent='›';next.setAttribute('aria-label','Next');
  const caption=document.createElement('div');caption.className='trip-gallery-caption';
  const captionText=document.createElement('span'),counter=document.createElement('span');caption.append(captionText,counter);
  const thumbs=document.createElement('div');thumbs.className='trip-gallery-thumbs';
  function update(index){
    active=(index+photos.length)%photos.length;
    const photo=photos[active];
    hero.src=imageSrc(photo);hero.alt=imageAlt(photo);heroButton.setAttribute('aria-label',imageAlt(photo));
    captionText.textContent=imageAlt(photo);counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    thumbs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
  }
  heroButton.addEventListener('click',()=>openPhoto(photos,active));
  prev.addEventListener('click',()=>update(active-1));next.addEventListener('click',()=>update(active+1));
  photos.forEach((photo,index)=>{
    const button=document.createElement('button');button.type='button';button.className='trip-gallery-thumb';
    button.setAttribute('aria-label',imageAlt(photo));button.setAttribute('aria-pressed',String(index===active));
    const img=document.createElement('img');img.src=imageSrc(photo);img.alt='';img.loading='lazy';button.append(img);
    button.addEventListener('click',()=>update(index));thumbs.append(button);
  });
  main.append(heroButton,prev,next);galleryStage.append(main,caption,thumbs);update(active);
}
function renderDetail(){
  title.textContent=country?name(country):t(region+'Title');
  note.textContent=country?(data.entries[country]?.note?.[language()]||t('notesPending')):t(region+'Text');
  entry.replaceChildren();
  galleryStage.replaceChildren();galleryStage.hidden=true;
  if(!country)return;
  const item=data.entries[country]||{};
  const dl=document.createElement('dl');
  for(const key of ['year','places','memory']){
    const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
    dt.textContent=t(key);
    const value=key==='year'?item.year:item[key]?.[language()];
    dd.textContent=Array.isArray(value)?value.join(' · '):value||t('notRecorded');
    row.append(dt,dd);dl.append(row);
  }
  entry.append(dl);
  const photos=item.photos?.length?item.photos:(item.photo?[item.photo]:[]);
  renderGallery(photos,item.heroPhoto);
}
function renderCountries(){
  const codes=region==='all'?visited:data.regions[region];
  const query=search.value.trim().toLocaleLowerCase(language());
  const shown=codes.filter(code=>name(code).toLocaleLowerCase(language()).includes(query)||code.toLowerCase()===query).sort((a,b)=>name(a).localeCompare(name(b),language()));
  const scroll=list.scrollTop;
  list.replaceChildren(...shown.map(code=>{
    const button=document.createElement('button');button.type='button';button.textContent=name(code);button.dataset.code=code;
    button.setAttribute('aria-pressed',String(code===country));button.addEventListener('click',()=>select(code));return button;
  }));
  list.scrollTop=scroll;
  document.getElementById('country-status').textContent=shown.length?`${shown.length} / ${visited.length}`:t('noCountries');
}
function render(){
  document.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===region)));
  shapes.forEach(shape=>{
    shape.classList.toggle('is-muted',region!=='all'&&shape.dataset.region!==region);
    shape.setAttribute('aria-label',name(shape.dataset.country));shape.setAttribute('aria-pressed',String(shape.dataset.country===country));
    let caption=shape.querySelector('title');if(!caption){caption=document.createElementNS('http://www.w3.org/2000/svg','title');shape.append(caption);}caption.textContent=name(shape.dataset.country);
  });
  renderCountries();renderDetail();
}
function select(code){country=code;const url=new URL(location.href);url.searchParams.set('country',code);history.replaceState(null,'',url);shapes.forEach(s=>s.setAttribute('aria-pressed',String(s.dataset.country===code)));list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.code===code)));renderDetail();}
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
  region=button.dataset.region;country=null;search.value='';list.scrollTop=0;
  const url=new URL(location.href);url.searchParams.delete('country');history.replaceState(null,'',url);render();
}));
shapes.forEach(shape=>{
  shape.addEventListener('click',()=>select(shape.dataset.country));
  shape.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(shape.dataset.country);}});
});
search.addEventListener('input',renderCountries);
onLanguage(render);
