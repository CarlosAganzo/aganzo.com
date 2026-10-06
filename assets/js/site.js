const legacySections={'#leave-a-trace':'/lists/#recommend'};
if(location.pathname==='/' && legacySections[location.hash]){
  const target=new URL(legacySections[location.hash],location.origin);
  target.search=location.search;location.replace(target.href);
}
const base = '/';
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const host = location.hostname.replace(/^www\./,'');
const referredFromCarlos = (() => { try { return new URL(document.referrer).hostname.replace(/^www\./,'') === 'carlosaganzo.com'; } catch { return false; } })();
let carlosBrand = host === 'carlosaganzo.com' || params.get('from') === 'carlosaganzo.com' || referredFromCarlos;
try {
  carlosBrand = carlosBrand || sessionStorage.getItem('aganzo-brand-domain') === 'carlosaganzo.com';
  if (carlosBrand) sessionStorage.setItem('aganzo-brand-domain','carlosaganzo.com');
} catch {}
const domain = carlosBrand ? 'CARLOSAGANZO.COM' : 'AGANZO.COM';
document.querySelectorAll('.brand').forEach(el=>{el.textContent=domain;});
const assetVersion = '20261004-domain-brand-1';
const load = async name => {
  const version = name === 'now' ? Date.now() : assetVersion;
  const options = name === 'now' ? { cache: 'no-store' } : undefined;
  const response = await fetch(`${base}assets/data/${name}.json?v=${version}`, options);
  if (!response.ok) throw new Error(`Cannot load ${name}: ${response.status}`);
  return response.json();
};
const dictionaries = await load('translations');
const localePrefix = {en:'', es:'/es', ja:'/ja', zh:'/zh-hans'};
const localeFromPath = path => path === '/es' || path.startsWith('/es/') ? 'es'
  : path === '/ja' || path.startsWith('/ja/') ? 'ja'
  : path === '/zh-hans' || path.startsWith('/zh-hans/') ? 'zh'
  : 'en';
function localizedPath(path,targetLang){
  let clean=path.replace(/^\/(?:es|ja|zh-hans)(?=\/|$)/,'')||'/';
  if(!clean.startsWith('/')) clean='/'+clean;
  const prefix=localePrefix[targetLang] || '';
  return prefix ? (clean==='/' ? prefix+'/' : prefix+clean) : clean;
}
const pathLang = localeFromPath(location.pathname);
const legacyLang = params.get('lang');
if((legacyLang==='ja'||legacyLang==='zh') && pathLang==='en'){
  const url=new URL(location.href);
  url.pathname=localizedPath(url.pathname,legacyLang);
  url.searchParams.delete('lang');
  location.replace(url.pathname+url.search+url.hash);
}
let lang = pathLang;
let listeners = [];
export const translate = key => dictionaries[lang][key] || dictionaries.en[key] || key;
export const language = () => lang;
export const onLanguage = fn => { listeners.push(fn); fn(); };
export { load };
function updateLinks(){
  document.querySelectorAll('a.brand, a[data-page-link], a.teaser, a[data-localized-link]').forEach(a => {
    const url = new URL(a.href,location.origin);
    if(url.origin!==location.origin) return;
    url.pathname=localizedPath(url.pathname,lang);
    url.searchParams.delete('lang');
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
  document.title = translate(`seoTitle_${page}`);
  const description=translate(`seoDescription_${page}`);
  document.querySelector('meta[name="description"]').content=description;
  document.querySelector('meta[property="og:description"]').content=description;
  document.querySelector('meta[name="twitter:description"]').content=description;
  document.querySelector('meta[name="twitter:title"]').content=document.title;
  document.querySelector('meta[property="og:locale"]').content=({en:'en_GB',es:'es_ES',ja:'ja_JP',zh:'zh_CN'})[lang];
  document.querySelector('meta[property="og:title"]').content=document.title;
  try {localStorage.setItem('aganzo-v2-language',lang);localStorage.setItem('aganzo-language',lang);} catch {}
  updateLinks();
  listeners.forEach(fn=>fn());
  document.documentElement.classList.remove('i18n-pending');
}
const navPage = ['cinema','music','games','books'].includes(page) ? 'lists' : page==='indonesia' ? 'travel' : page;
document.querySelectorAll('[data-page-link]').forEach(a=>{if(a.dataset.pageLink===navPage)a.setAttribute('aria-current','page');});
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
  const target=button.dataset.lang;
  if(!dictionaries[target]) return;
  const url=new URL(location.href);
  url.pathname=localizedPath(url.pathname,target);
  url.searchParams.delete('lang');
  location.href=url.pathname+url.search+url.hash;
}));
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
if(page==='travel')import('./travel.js?v=20261002-france2').catch(console.error);
if(page==='photos')import('./photos.js?v=20260927-seo4').catch(console.error);
if(page==='lists'||page==='music')import('./music.js?v=20260927-seo4').catch(console.error);
