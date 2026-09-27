import {load,translate as t,onLanguage} from './site.js?v=20260927-seo3';
const photos=await load('photos');
const dialog=document.getElementById('photo-dialog');
const img=document.getElementById('viewer-image');
const figure=document.querySelector('.photo-viewer-figure');
const counter=document.getElementById('photo-counter');
let current=0;

const sourceFor=photo=>'/assets/images/'+(photo.full||photo.file);
function preload(i){
  const photo=photos[(i+photos.length)%photos.length];
  const pre=new Image();
  pre.src=sourceFor(photo);
}
function show(i){
  current=(i+photos.length)%photos.length;
  const photo=photos[current];
  img.src=sourceFor(photo);
  img.alt=t(photo.caption);
  if(photo.fullWidth&&photo.fullHeight){
    img.width=photo.fullWidth;
    img.height=photo.fullHeight;
  }else{
    img.removeAttribute('width');
    img.removeAttribute('height');
  }
  const number=String(current+1).padStart(2,'0');
  counter.textContent=`${number} / ${String(photos.length).padStart(2,'0')}`;
  document.getElementById('viewer-caption').textContent=t(photo.caption);
  preload(current-1);
  preload(current+1);
}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
  show(Number(button.dataset.photo));
  dialog.showModal();
}));
document.getElementById('photo-close').addEventListener('click',()=>dialog.close());
document.getElementById('photo-prev').addEventListener('click',()=>show(current-1));
document.getElementById('photo-next').addEventListener('click',()=>show(current+1));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
figure.addEventListener('click',e=>{if(e.target===figure)dialog.close();});
dialog.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')show(current-1);
  if(e.key==='ArrowRight')show(current+1);
});
onLanguage(()=>{
  document.querySelectorAll('[data-photo]').forEach(button=>button.setAttribute('aria-label',`${t('photoOpen')}: ${t(photos[button.dataset.photo].caption)}`));
  if(dialog.open)show(current);
});
