import {load,translate as t,onLanguage} from './site.js?v=20260925-photo';
const photos=await load('photos');
const dialog=document.getElementById('photo-dialog');
const img=document.getElementById('viewer-image');
let current=0;
function show(i){current=(i+photos.length)%photos.length;const photo=photos[current];img.src='/assets/images/'+photo.file;img.alt=t(photo.caption);img.width=photo.width;img.height=photo.height;document.getElementById('viewer-caption').textContent=`${String(current+1).padStart(2,'0')} / ${t(photo.caption)}`;}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.photo));dialog.showModal();}));
document.getElementById('photo-close').addEventListener('click',()=>dialog.close());
document.getElementById('photo-prev').addEventListener('click',()=>show(current-1));
document.getElementById('photo-next').addEventListener('click',()=>show(current+1));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1);});
onLanguage(()=>{document.querySelectorAll('[data-photo]').forEach(button=>button.setAttribute('aria-label',`${t('photoOpen')}: ${t(photos[button.dataset.photo].caption)}`));if(dialog.open)show(current);});
