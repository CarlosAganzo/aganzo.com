import {load,translate as t,language,onLanguage} from './site.js';
const data=await load('travel');
const visited=[...new Set(Object.values(data.regions).flat())];
const shapes=[...document.querySelectorAll('.atlas-country')];
const list=document.getElementById('country-list');
const search=document.getElementById('country-search');
const title=document.getElementById('country-title');
const note=document.getElementById('country-note');
const entry=document.getElementById('country-entry');
const params=new URLSearchParams(location.search);
let country=visited.includes(params.get('country'))?params.get('country'):null;
let region=country?Object.keys(data.regions).find(r=>data.regions[r].includes(country)):'all';
function name(code){return new Intl.DisplayNames([language()],{type:'region'}).of(code);}
function imageSrc(photo){return '/v2/assets/images/'+photo.file;}
function imageAlt(photo){return photo.alt?.[language()]||name(country);}
function renderGallery(photos){
  if(!photos?.length)return;
  const gallery=document.createElement('div');gallery.className='trip-gallery';
  const figure=document.createElement('figure');figure.className='trip-gallery-feature';
  const hero=document.createElement('img');hero.src=imageSrc(photos[0]);hero.alt=imageAlt(photos[0]);hero.loading='lazy';figure.append(hero);
  const thumbs=document.createElement('div');thumbs.className='trip-gallery-thumbs';
  photos.forEach((photo,index)=>{
    const button=document.createElement('button');button.type='button';button.className='trip-gallery-thumb';
    button.setAttribute('aria-label',`${index+1} / ${photos.length}`);button.setAttribute('aria-pressed',String(index===0));
    const img=document.createElement('img');img.src=imageSrc(photo);img.alt='';img.loading='lazy';button.append(img);
    button.addEventListener('click',()=>{
      hero.src=imageSrc(photo);hero.alt=imageAlt(photo);
      thumbs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    });
    thumbs.append(button);
  });
  gallery.append(figure,thumbs);entry.append(gallery);
}
function renderDetail(){
  title.textContent=country?name(country):t(region+'Title');
  note.textContent=country?(data.entries[country]?.note?.[language()]||t('notesPending')):t(region+'Text');
  entry.replaceChildren();
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
  renderGallery(photos);
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
