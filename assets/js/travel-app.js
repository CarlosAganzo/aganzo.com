const legacySections={'#leave-a-trace':'/lists/#recommend'};
if(location.pathname==='/' && legacySections[location.hash]){
  const target=new URL(legacySections[location.hash],location.origin);
  target.search=location.search;location.replace(target.href);
}
const base = '/';
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const assetVersion = '20261006-locales1';
const load = async name => {
  const version = ['now','travel'].includes(name) ? Date.now() : assetVersion;
  const options = ['now','travel'].includes(name) ? { cache: 'no-store' } : undefined;
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
const domain = location.hostname.replace(/^www\./,'') === 'carlosaganzo.com' || params.get('from') === 'carlosaganzo.com' ? 'CARLOSAGANZO.COM' : 'AGANZO.COM';
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
  const titleKey = `seoTitle_${page}`;
  if(translate(titleKey)!==titleKey)document.title = translate(titleKey);
  const descriptionKey=`seoDescription_${page}`;
  const description=translate(descriptionKey)===descriptionKey?document.querySelector('meta[name="description"]').content:translate(descriptionKey);
  document.querySelector('meta[name="description"]').content=description;
  document.querySelector('meta[property="og:description"]').content=description;
  document.querySelector('meta[name="twitter:description"]').content=description;
  document.querySelector('meta[name="twitter:title"]').content=document.title;
  document.querySelector('meta[property="og:locale"]').content=({en:'en_GB',es:'es_ES',ja:'ja_JP',zh:'zh_CN'})[lang];
  document.querySelector('meta[property="og:title"]').content=document.title;
  try {localStorage.setItem('aganzo-v2-language',lang);localStorage.setItem('aganzo-language',lang);} catch {}
  updateLinks();
  listeners.forEach(fn=>fn());
}

document.querySelectorAll('.brand').forEach(el=>{el.textContent=domain;});
const navPage = 'travel';
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

try {
  const [data, module] = await Promise.all([load('travel'), import('./travel-journal.js?v=20261006-locales1')]);
  module.initTravel({data, t: translate, language});
} catch (error) {
  console.error('Travel could not initialize', error);
} finally { document.documentElement.classList.remove('i18n-pending'); }
