import {translate as t,onLanguage,load} from './site.js?v=20260922-main';

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

document.querySelectorAll('[data-list-tab]').forEach(button=>button.addEventListener('click',()=>{
  const target=button.dataset.listTab;
  document.querySelectorAll('[data-list-tab]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));
  document.querySelectorAll('[data-list-panel]').forEach(panel=>panel.hidden=panel.dataset.listPanel!==target);
}));

const randomButton=document.getElementById('taste-random');
const randomResult=document.getElementById('taste-random-result');
const songs=[...document.querySelectorAll('.song-card')].map(card=>{
  const title=card.querySelector('strong')?.textContent?.trim()||'';
  const artist=card.querySelector('div>span')?.textContent?.trim()||'';
  return title&&artist?`${title} — ${artist}`:title;
}).filter(Boolean);
let previous=-1;
randomButton?.addEventListener('click',()=>{
  if(!songs.length)return;
  let index=Math.floor(Math.random()*songs.length);
  if(songs.length>1&&index===previous) index=(index+1)%songs.length;
  previous=index;randomResult.textContent=songs[index];
});

const rotationCards=[...document.querySelectorAll('[data-now-index]')];
if(rotationCards.length){
  load('now').then(now=>{
    const render=()=>{
      rotationCards.forEach(card=>{
        const item=now.items[Number(card.dataset.nowIndex)]; if(!item)return;
        card.href=item.url;
        card.querySelector('.micro').textContent=t(item.label);
        card.querySelector('strong').textContent=item.valueKey?t(item.valueKey):item.value;
      });
      const date=document.getElementById('rotation-date');if(date){date.dateTime=now.updated;date.textContent=now.updated;}
    };
    onLanguage(render);
  }).catch(console.error);
}


const songScroll=document.getElementById('song-scroll');
const songProgress=document.querySelector('.song-scroll-progress span');
function updateSongScrollProgress(){
  if(!songScroll||!songProgress)return;
  const range=songScroll.scrollHeight-songScroll.clientHeight;
  const progress=range>0 ? Math.max(.08,Math.min(1,songScroll.scrollTop/range)) : 1;
  songProgress.style.transform=`scaleY(${progress})`;
}
if(songScroll){
  songScroll.addEventListener('scroll',updateSongScrollProgress,{passive:true});
  addEventListener('resize',updateSongScrollProgress,{passive:true});
  requestAnimationFrame(updateSongScrollProgress);
}


const spotifyRows=[...document.querySelectorAll('.song-card[data-spotify-id]')];
const songPlayer=document.getElementById('song-player');
const songPlayerTitle=document.getElementById('song-player-title');
const songPlayerEmbed=document.getElementById('song-player-embed');
const songPlayerClose=document.getElementById('song-player-close');

function closeSongPlayer(){
  if(!songPlayer)return;
  songPlayer.hidden=true;
  songPlayerEmbed?.replaceChildren();
  spotifyRows.forEach(row=>row.classList.remove('is-playing'));
}
spotifyRows.forEach(row=>{
  const play=row.querySelector('.song-play');
  play?.addEventListener('click',()=>{
    const id=row.dataset.spotifyId;
    const title=row.querySelector('strong')?.textContent?.trim()||'Spotify';
    if(!id||!songPlayerEmbed)return;
    spotifyRows.forEach(item=>item.classList.toggle('is-playing',item===row));
    songPlayerTitle.textContent=title;
    const frame=document.createElement('iframe');
    frame.src=`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
    frame.title=`${title} — Spotify`;
    frame.loading='lazy';
    frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    songPlayerEmbed.replaceChildren(frame);
    songPlayer.hidden=false;
  });
});
songPlayerClose?.addEventListener('click',closeSongPlayer);
