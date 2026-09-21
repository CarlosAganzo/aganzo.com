import {translate as t, onLanguage} from './site.js?v=archive-1';

const demoPeople = [
  {id:'p1',name:'Elena Robles',birth:{date:'1924',place:''},death:{date:'2008',place:''},parents:['p2','p3'],spouses:[],children:[],media:[]},
  {id:'p2',name:'Tomás Robles',birth:{date:'1893',place:''},death:{date:'1969',place:''},parents:['p4','p5'],spouses:['p3'],children:['p1'],media:[]},
  {id:'p3',name:'Clara Montes',birth:{date:'1898',place:''},death:{date:'1982',place:''},parents:['p6','p7'],spouses:['p2'],children:['p1'],media:[]},
  {id:'p4',name:'Gabriel Robles',birth:{date:'1863',place:''},death:{date:'1934',place:''},parents:[],spouses:['p5'],children:['p2'],media:[]},
  {id:'p5',name:'Inés Vidal',birth:{date:'1868',place:''},death:{date:'1941',place:''},parents:[],spouses:['p4'],children:['p2'],media:[]},
  {id:'p6',name:'Mateo Montes',birth:{date:'1869',place:''},death:{date:'1946',place:''},parents:[],spouses:['p7'],children:['p3'],media:[]},
  {id:'p7',name:'Lucía Soler',birth:{date:'1872',place:''},death:{date:'1951',place:''},parents:[],spouses:['p6'],children:['p3'],media:[]}
];

const copy = {
  en:{intro:'One surname. Many lives. The recovered family archive is now becoming browsable.',notice:'This public view is generated from the recovered GEDCOM and deliberately excludes records not approved for publication.',enter:'Explore the family tree ↓',badge:n=>n+' PUBLIC PEOPLE',media:'Documents & photographs',parents:'Parents',spouses:'Spouses',children:'Children',born:'Born',died:'Died',record:'Archive record',recordText:'This person is part of the reviewed public subset of the recovered family archive.',none:'No linked records in the published subset.',matches:'matches',noResults:'No matches',focus:'Selected person',generation:'Generation',person:'Person',timeline:'Timeline',heading:'Names & connections',hint:'Select a name to make it the centre of the tree.',ancestors:'Ancestors',descendants:'Descendants'},
  es:{intro:'Un apellido. Muchas vidas. El archivo familiar recuperado empieza por fin a ser navegable.',notice:'Esta vista pública se genera a partir del GEDCOM recuperado y excluye deliberadamente los registros no aprobados para publicación.',enter:'Explorar el árbol familiar ↓',badge:n=>n+' PERSONAS PÚBLICAS',media:'Documentos y fotografías',parents:'Padres',spouses:'Cónyuges',children:'Hijos',born:'Nacimiento',died:'Fallecimiento',record:'Registro del archivo',recordText:'Esta persona forma parte del subconjunto público revisado del archivo familiar recuperado.',none:'No hay registros enlazados en el subconjunto publicado.',matches:'coincidencias',noResults:'Sin resultados',focus:'Persona seleccionada',generation:'Generación',person:'Persona',timeline:'Cronología',heading:'Nombres y conexiones',hint:'Selecciona un nombre para colocarlo en el centro del árbol.',ancestors:'Ancestros',descendants:'Descendientes'},
  ja:{intro:'ひとつの姓、いくつもの人生。復元した家族アーカイブを閲覧できる形にしています。',notice:'この公開表示は復元したGEDCOMから生成され、公開承認されていない記録は除外しています。',enter:'家系図を見る ↓',badge:n=>'公開人物 '+n+'人',media:'文書と写真',parents:'両親',spouses:'配偶者',children:'子ども',born:'出生',died:'死亡',record:'アーカイブ記録',recordText:'この人物は、復元した家族アーカイブの公開審査済み部分に含まれます。',none:'公開部分には関連記録がありません。',matches:'件',noResults:'該当なし',focus:'選択中',generation:'世代',person:'人物',timeline:'年表',heading:'人物とつながり',hint:'名前を選ぶと、その人物を家系図の中心に表示します。',ancestors:'祖先',descendants:'子孫'},
  zh:{intro:'一个姓氏，许多人生。恢复出的家族档案现在开始可以浏览。',notice:'此公开视图由恢复的 GEDCOM 生成，并主动排除未经批准公开的记录。',enter:'浏览家谱 ↓',badge:n=>n+' 位公开人物',media:'文件与照片',parents:'父母',spouses:'配偶',children:'子女',born:'出生',died:'去世',record:'档案记录',recordText:'此人物属于恢复后的家族档案中经审核可公开的部分。',none:'公开部分中没有关联记录。',matches:'个结果',noResults:'没有结果',focus:'当前人物',generation:'世代',person:'人物',timeline:'时间线',heading:'人物与关系',hint:'选择一个名字，将其置于家谱中心。',ancestors:'祖先',descendants:'后代'}
};

let people = demoPeople;
let media = {};
let isDemo = true;
let selected = people[0];
let mode = 'ancestors';

const tree = document.querySelector('#family-tree');
const detail = document.querySelector('#family-detail');
const search = document.querySelector('#family-search');
const results = document.querySelector('#family-results');
const shelf = document.querySelector('.sample-shelves');
const el = (tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const lang = ()=>document.documentElement.lang?.split('-')[0] || 'en';
const labels = ()=>copy[lang()] || copy.en;
const byId = id=>people.find(p=>p.id===id);
const cleanList = ids=>(ids||[]).map(byId).filter(Boolean);
const children = p=>cleanList(p.children?.length?p.children:people.filter(q=>(q.parents||[]).includes(p.id)).map(q=>q.id));
const eventText = event=>event?.date || '—';
const eventPlace = event=>event?.place || '';
const recordCode = id=>String(id).replace(/\D/g,'').padStart(3,'0').slice(-3) || String(id).slice(-3).toUpperCase();

function normalisePerson(p){
  return {id:String(p.id),name:p.name||'—',birth:p.birth||null,death:p.death||null,parents:p.parents||[],spouses:p.spouses||[],children:p.children||[],media:p.media||[]};
}
function personButton(p){
  const b=el('button','family-person'); b.type='button'; b.dataset.person=p.id; b.setAttribute('aria-pressed',String(p.id===selected.id));
  b.append(el('strong','',p.name),el('span','micro',[eventText(p.birth),eventText(p.death)].join(' — '))); return b;
}
function group(title,list){
  const wrap=el('div','family-relations'); wrap.append(el('h4','micro',title));
  if(!list.length) wrap.append(el('p','small',isDemo?t('demoNone'):labels().none));
  list.forEach(p=>wrap.append(personButton(p))); return wrap;
}
function renderResults(){
  results.replaceChildren(); const q=search.value.trim().normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase(); if(!q)return;
  const hits=people.filter(p=>p.name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(q));
  const l=labels(); results.append(el('p','micro',hits.length?hits.length+' '+(isDemo?t('demoMatches'):l.matches):(isDemo?t('demoNoResults'):l.noResults)));
  hits.slice(0,30).forEach(p=>results.append(personButton(p)));
}
function renderMediaForPerson(p){
  const entries=(p.media||[]).map(id=>media[id]).filter(Boolean); if(!entries.length)return null;
  const section=el('div','family-media'); section.append(el('h4','micro',labels().media)); const grid=el('div','family-media-grid');
  entries.forEach(m=>{const a=el('a','family-media-item');a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';
    if(m.kind==='photo'){const img=document.createElement('img');img.src=m.url;img.alt=m.title||p.name;img.loading='lazy';a.append(img);}
    else a.append(el('span','family-media-document','PDF'));
    a.append(el('span','small',m.title||m.format?.toUpperCase()||labels().media));grid.append(a);
  });
  section.append(grid); return section;
}
function renderTree(){
  tree.replaceChildren(); let levels=[[selected]],current=[selected];
  for(let i=0;i<2;i++){const next=current.flatMap(p=>mode==='ancestors'?cleanList(p.parents):children(p));current=[...new Map(next.map(p=>[p.id,p])).values()];if(!current.length)break;levels.push(current);}
  if(mode==='ancestors')levels.reverse(); const l=labels();
  levels.forEach(list=>{const row=el('div','family-generation');row.setAttribute('role','group');row.setAttribute('aria-label',list.some(p=>p.id===selected.id)?(isDemo?t('demoFocus'):l.focus):(isDemo?t('demoGeneration'):l.generation));list.forEach(p=>row.append(personButton(p)));tree.append(row);});
  if(mode==='ancestors'){
    const directChildren=children(selected);
    if(directChildren.length){
      const row=el('div','family-generation family-children');
      row.setAttribute('role','group');
      row.setAttribute('aria-label',isDemo?t('demoChildren'):l.children);
      directChildren.forEach(p=>row.append(personButton(p)));
      tree.append(row);
    }
  }
  if(levels.length===1 && !(mode==='ancestors' && children(selected).length))tree.append(el('p','small',isDemo?t('demoNone'):l.none));
}
function renderDetail(){
  const l=labels(); detail.replaceChildren(); detail.setAttribute('aria-label',isDemo?t('demoPerson'):l.person);
  detail.append(el('p','eyebrow',(isDemo?t('demoPerson'):l.person)+' / '+recordCode(selected.id)),el('h3','',selected.name),el('p','family-years',eventText(selected.birth)+' — '+eventText(selected.death)),el('h4','micro',isDemo?t('demoTimeline'):l.timeline));
  const timeline=el('ol','family-timeline');
  for(const [event,key,demoKey] of [[selected.birth,'born','demoBorn'],[selected.death,'died','demoDied']]){
    if(!event)continue; const li=el('li'); const value=el('span'); value.append(el('span','',isDemo?t(demoKey):l[key])); if(eventPlace(event)) value.append(el('small','',eventPlace(event))); li.append(el('strong','',eventText(event)),value); timeline.append(li);
  }
  detail.append(timeline,group(isDemo?t('demoParents'):l.parents,cleanList(selected.parents)));
  if(!isDemo)detail.append(group(l.spouses,cleanList(selected.spouses)));
  detail.append(el('h4','micro',isDemo?t('demoRecord'):l.record),el('p','small',isDemo?t('demoRecordText'):l.recordText));
  const personMedia=renderMediaForPerson(selected); if(personMedia)detail.append(personMedia);
}
function renderArchiveCopy(){
  if(isDemo)return; const l=labels();
  const intro=document.querySelector('[data-i18n="demoIntro"]'); const notice=document.querySelector('[data-i18n="demoNotice"]'); const enter=document.querySelector('[data-i18n="demoEnter"]'); const heading=document.querySelector('#family-heading'); const badge=document.querySelector('[data-i18n="demoBadge"]'); const hint=document.querySelector('[data-i18n="demoHint"]');
  if(intro)intro.textContent=l.intro;if(notice)notice.textContent=l.notice;if(enter)enter.textContent=l.enter;if(heading)heading.textContent=l.heading;if(badge)badge.textContent=l.badge(people.length);if(hint)hint.textContent=l.hint;
  document.querySelectorAll('[data-family-mode]').forEach(b=>{b.textContent=b.dataset.familyMode==='ancestors'?l.ancestors:l.descendants;});
}
function renderShelf(){
  if(isDemo||!shelf)return; const grid=shelf.querySelector('.sample-grid'); const heading=shelf.querySelector('.section-label h2'); if(heading)heading.textContent=labels().media;if(!grid)return;grid.replaceChildren();
  Object.values(media).slice(0,12).forEach((m,i)=>{const article=el('article','archive-media-card');const a=el('a','archive-media-link');a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';
    if(m.kind==='photo'){const img=document.createElement('img');img.src=m.url;img.alt=m.title||'';img.loading='lazy';a.append(img);}else{const paper=el('div','sample-paper');paper.append(el('span','','AG / '+String(i+1).padStart(3,'0')),el('b','','PDF'));a.append(paper);}
    a.append(el('p','micro',m.kind==='photo'?'PHOTOGRAPH':'DOCUMENT'),el('h3','',m.title||('Archive item '+(i+1))));article.append(a);grid.append(article);
  });
}
function render(){renderArchiveCopy();renderTree();renderDetail();renderResults();renderShelf();document.querySelectorAll('[data-family-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.familyMode===mode)));}

document.querySelector('#family-room').addEventListener('click',e=>{
  const b=e.target.closest('[data-person]');if(b){const p=byId(b.dataset.person);if(p){selected=p;render();tree.querySelector('[data-person="'+CSS.escape(selected.id)+'"]')?.focus({preventScroll:true});}}
  const m=e.target.closest('[data-family-mode]');if(m){mode=m.dataset.familyMode;render();}
});
search.addEventListener('input',renderResults);
onLanguage(render);

async function loadFamily(){
  try{
    const response=await fetch('/v2/assets/genealogy/family.json',{cache:'no-store'});if(!response.ok)throw new Error('family.json unavailable');
    const data=await response.json();if(!Array.isArray(data.people)||!data.people.length)throw new Error('family.json empty');
    if(data.schema===2){
      const toPerson=p=>normalisePerson({
        id:'I'+p[0],name:p[1],
        birth:p[2]?{date:p[2][0],place:p[2][1]}:null,
        death:p[3]?{date:p[3][0],place:p[3][1]}:null,
        parents:(p[4]||[]).map(x=>'I'+x),
        spouses:(p[5]||[]).map(x=>'I'+x),
        children:(p[6]||[]).map(x=>'I'+x),
        media:(p[7]||[]).map(x=>'@M'+x+'@')
      });
      people=data.people.map(toPerson);
      media=Object.fromEntries((data.media||[]).map(m=>{
        const id='@M'+m[0]+'@', filename=m[1];
        return [id,{id,url:'/v2/assets/genealogy/media/'+filename,title:m[2],kind:m[3],format:filename.split('.').pop()}];
      }));
    }else{
      people=data.people.map(normalisePerson);media=data.media||{};
    }
    isDemo=false;
    selected=[...people].sort((a,b)=>((b.parents.length+b.children.length+b.spouses.length)-(a.parents.length+a.children.length+a.spouses.length))||a.name.localeCompare(b.name))[0];
    render();
  }catch(error){render();}
}
loadFamily();
