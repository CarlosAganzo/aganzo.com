import {translate as t,onLanguage} from './site.js';
const input=document.getElementById('spotify-track'),reason=document.getElementById('song-reason'),submit=document.getElementById('song-submit'),previewButton=document.getElementById('preview-track'),preview=document.getElementById('spotify-preview'),status=document.getElementById('track-status');
let id='';
function extract(value){
  const uri=value.trim().match(/^spotify:track:([A-Za-z0-9]{22})$/i);if(uri)return uri[1];
  try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.hostname!=='open.spotify.com'||url.username||url.password)return '';return url.pathname.match(/^\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})\/?$/i)?.[1]||'';}catch{return '';}
}
function labels(){status.textContent=!input.value.trim()?'':id?t('trackReady'):t('invalidTrack');}
input.addEventListener('input',()=>{const next=extract(input.value);if(next!==id)preview.replaceChildren();id=next;submit.disabled=!id;previewButton.hidden=!id;input.setAttribute('aria-invalid',String(Boolean(input.value.trim()&&!id)));labels();});
previewButton.addEventListener('click',()=>{if(!id)return;const frame=document.createElement('iframe');frame.src=`https://open.spotify.com/embed/track/${id}?theme=0`;frame.title=t('previewTrack');frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.loading='lazy';preview.replaceChildren(frame);});
document.getElementById('song-form').addEventListener('submit',event=>{event.preventDefault();if(!id)return;const body=`${t('track')}: https://open.spotify.com/track/${id}\n\n${t('reason')}: ${reason.value.trim()||'—'}`;location.href=`mailto:carlos.aganzo@gmail.com?subject=${encodeURIComponent(t('subject'))}&body=${encodeURIComponent(body)}`;});
onLanguage(labels);
