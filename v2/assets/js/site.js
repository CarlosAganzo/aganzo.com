const base = '/v2/';
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const assetVersion = '20260920-2125';
const load = async name => {
  const response = await fetch(`${base}assets/data/${name}.json?v=${assetVersion}`);
  if (!response.ok) throw new Error(`Cannot load ${name}: ${response.status}`);
  return response.json();
};
const dictionaries = await load('translations');
let saved;
try { saved = localStorage.getItem('aganzo-v2-language') || localStorage.getItem('aganzo-language'); } catch {}
let lang = [params.get('lang'), saved, navigator.language.slice(0,2), 'en'].find(l => dictionaries[l]);
let listeners = [];
export const translate = key => dictionaries[lang][key] || dictionaries.en[key] || key;
export const language = () => lang;
export const onLanguage = fn => { listeners.push(fn); fn(); };
export { load };
const domain = location.hostname.replace(/^www\./,'') === 'carlosaganzo.com' || params.get('from') === 'carlosaganzo.com' ? 'CARLOSAGANZO.COM' : 'AGANZO.COM';
function updateLinks(){
  document.querySelectorAll('a[href^="/v2/"]').forEach(a => {
    const url = new URL(a.href);
    url.searchParams.set('lang',lang);
    if(domain==='CARLOSAGANZO.COM') url.searchParams.set('from','carlosaganzo.com');
    a.href = url.pathname + url.search + url.hash;
  });
}
function setLanguage(value){
  lang = dictionaries[value] ? value : 'en';
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {el.textContent=translate(el.dataset.i18n);});
  document.querySelectorAll('[data-i18n-html]').forEach(el => {el.innerHTML=translate(el.dataset.i18nHtml);});
  for (const attr of ['aria','alt']) document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el=>el.setAttribute(attr==='aria'?'aria-label':'alt',translate(el.dataset[attr==='aria'?'i18nAria':'i18nAlt'])));
  document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
  document.title = `${translate(page)} — Carlos Aganzo — ${domain} V2`;
  document.querySelector('meta[name="description"]').content=translate('metaDescription');
  document.querySelector('meta[property="og:title"]').content=document.title;
  try {localStorage.setItem('aganzo-v2-language',lang);} catch {}
  const current = new URL(location.href);current.searchParams.set('lang',lang);history.replaceState(null,'',current);
  updateLinks();
  listeners.forEach(fn=>fn());
}
document.querySelectorAll('.brand').forEach(el=>{el.textContent=domain;});
document.querySelectorAll('[data-page-link]').forEach(a=>{if(a.dataset.pageLink===page)a.setAttribute('aria-current','page');});
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
document.getElementById('year').textContent=new Date().getFullYear();
setLanguage(lang);
if(page==='home'){
  const now = await load('now');
  onLanguage(()=>document.querySelectorAll('.now-item').forEach((a,i)=>{
    const item=now.items[i];if(!item)return;
    a.href=item.url;a.querySelector('.micro').textContent=translate(item.label);
    a.querySelector('strong').textContent=item.valueKey?translate(item.valueKey):item.value;
  }));
  const slides=[...document.querySelectorAll('[data-portrait]')];
  const dots=[...document.querySelectorAll('[data-slide]')];
  const toggle=document.getElementById('portrait-toggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let active=0, playing=!motion.matches, timer;
  function show(i){active=i;slides.forEach((el,n)=>el.hidden=n!==i);dots.forEach((el,n)=>el.setAttribute('aria-pressed',String(n===i)));}
  function sync(){clearInterval(timer);toggle.textContent=playing?'Ⅱ':'▷';toggle.setAttribute('aria-label',translate(playing?'portraitPause':'portraitPlay'));if(playing&&!document.hidden)timer=setInterval(()=>show((active+1)%slides.length),6500);}
  dots.forEach(dot=>dot.addEventListener('click',()=>{show(Number(dot.dataset.slide));playing=false;sync();}));
  toggle.addEventListener('click',()=>{playing=!playing;sync();});
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',()=>{if(motion.matches){playing=false;sync();}});
  onLanguage(sync);
}
if(page==='travel')import('./travel.js?v=20260920-1705').catch(console.error);
if(page==='photos')import('./photos.js').catch(console.error);
if(page==='lists')import('./music.js?v=20260920-2125').catch(console.error);
// Same token and beacon as production; no root analytics configuration is changed.
const token=document.querySelector('meta[name="cf-web-analytics-token"]')?.content.trim();
if(token && window.self===window.top && location.hostname!=='localhost' && location.hostname!=='127.0.0.1'){
  const beacon=document.createElement('script');beacon.defer=true;
  beacon.src='https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon=JSON.stringify({token});document.body.append(beacon);
}
