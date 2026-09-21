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
  en:{
    intro:'One surname. Many lives. The recovered family archive is now becoming browsable.',
    notice:'This public view is generated from the recovered GEDCOM and deliberately excludes records not approved for publication.',
    enter:'Explore the family tree ↓', badge:n=>n+' PUBLIC PEOPLE',
    parents:'Parents',spouses:'Partners',children:'Children',born:'Born',died:'Died',
    matches:'matches',noResults:'No matches',person:'Person',timeline:'Timeline',
    heading:'Names & connections',hint:'Choose a person. The tree recentres around them.',
    family:'Family',ancestors:'Ancestors',descendants:'Descendants',centre:'Centre on this person',
    files:'Archive files',photos:'Photographs',documents:'Documents',all:'All files',
    fileCount:n=>n+' FILES',linked:'Linked to',open:'Open file ↗',more:'Show more',
    scoped:n=>'Showing '+n+' linked files',clearScope:'Show all files',noFiles:'No files in this view.'
  },
  es:{
    intro:'Un apellido. Muchas vidas. El archivo familiar recuperado empieza por fin a ser navegable.',
    notice:'Esta vista pública se genera a partir del GEDCOM recuperado y excluye deliberadamente los registros no aprobados para publicación.',
    enter:'Explorar el árbol familiar ↓', badge:n=>n+' PERSONAS PÚBLICAS',
    parents:'Padres',spouses:'Pareja',children:'Hijos',born:'Nacimiento',died:'Fallecimiento',
    matches:'coincidencias',noResults:'Sin resultados',person:'Persona',timeline:'Cronología',
    heading:'Nombres y conexiones',hint:'Elige una persona. El árbol se recentra alrededor de ella.',
    family:'Familia',ancestors:'Ancestros',descendants:'Descendientes',centre:'Centrar en esta persona',
    files:'Archivo: documentos y fotografías',photos:'Fotografías',documents:'Documentos',all:'Todos',
    fileCount:n=>n+' ARCHIVOS',linked:'Relacionado con',open:'Abrir archivo ↗',more:'Mostrar más',
    scoped:n=>'Mostrando '+n+' archivos relacionados',clearScope:'Mostrar todos',noFiles:'No hay archivos en esta vista.'
  },
  ja:{
    intro:'ひとつの姓、いくつもの人生。復元した家族アーカイブを閲覧できる形にしています。',
    notice:'この公開表示は復元したGEDCOMから生成され、公開承認されていない記録は除外しています。',
    enter:'家系図を見る ↓',badge:n=>'公開人物 '+n+'人',
    parents:'両親',spouses:'配偶者',children:'子ども',born:'出生',died:'死亡',
    matches:'件',noResults:'該当なし',person:'人物',timeline:'年表',
    heading:'人物とつながり',hint:'人物を選ぶと、その人を中心に家系図を再配置します。',
    family:'家族',ancestors:'祖先',descendants:'子孫',centre:'この人物を中心にする',
    files:'文書と写真',photos:'写真',documents:'文書',all:'すべて',
    fileCount:n=>n+' 件',linked:'関連人物',open:'ファイルを開く ↗',more:'さらに表示',
    scoped:n=>'関連ファイル '+n+' 件を表示中',clearScope:'すべて表示',noFiles:'この表示にはファイルがありません。'
  },
  zh:{
    intro:'一个姓氏，许多人生。恢复出的家族档案现在开始可以浏览。',
    notice:'此公开视图由恢复的 GEDCOM 生成，并主动排除未经批准公开的记录。',
    enter:'浏览家谱 ↓',badge:n=>n+' 位公开人物',
    parents:'父母',spouses:'配偶',children:'子女',born:'出生',died:'去世',
    matches:'个结果',noResults:'没有结果',person:'人物',timeline:'时间线',
    heading:'人物与关系',hint:'选择一个人物，家谱会围绕此人重新居中。',
    family:'家庭',ancestors:'祖先',descendants:'后代',centre:'以此人为中心',
    files:'文件与照片',photos:'照片',documents:'文件',all:'全部',
    fileCount:n=>n+' 个文件',linked:'关联人物',open:'打开文件 ↗',more:'显示更多',
    scoped:n=>'正在显示 '+n+' 个关联文件',clearScope:'显示全部',noFiles:'此视图没有文件。'
  }
};

let people = demoPeople;
let media = {};
let isDemo = true;
let selected = people[0];
let mode = 'family';
let mediaFilter = 'all';
let mediaOwner = null;
let mediaLimit = 24;

const tree = document.querySelector('#family-tree');
const canvas = document.querySelector('.family-canvas');
const detail = document.querySelector('#family-detail');
const search = document.querySelector('#family-search');
const results = document.querySelector('#family-results');
const mediaGrid = document.querySelector('#archive-media-grid');
const mediaCount = document.querySelector('#archive-media-count');
const mediaScope = document.querySelector('#archive-media-scope');
const mediaMore = document.querySelector('#archive-media-more');

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const lang=()=>document.documentElement.lang?.split('-')[0]||'en';
const labels=()=>copy[lang()]||copy.en;
const byId=id=>people.find(p=>p.id===id);
const cleanList=ids=>(ids||[]).map(byId).filter(Boolean);
const children=p=>cleanList(p.children?.length?p.children:people.filter(q=>(q.parents||[]).includes(p.id)).map(q=>q.id));
const eventText=event=>event?.date||'—';
const eventPlace=event=>event?.place||'';
const recordCode=id=>String(id).replace(/\D/g,'').padStart(3,'0').slice(-3)||String(id).slice(-3).toUpperCase();
const normalise=s=>String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();

function normalisePerson(p){
  return {id:String(p.id),name:p.name||'—',birth:p.birth||null,death:p.death||null,parents:p.parents||[],spouses:p.spouses||[],children:p.children||[],media:p.media||[]};
}

function personButton(p,cls='family-person'){
  const b=el('button',cls);b.type='button';b.dataset.person=p.id;b.setAttribute('aria-pressed',String(p.id===selected.id));
  b.append(el('strong','',p.name),el('span','micro',[eventText(p.birth),eventText(p.death)].join(' — ')));
  return b;
}

function renderResults(){
  results.replaceChildren();
  const q=normalise(search.value.trim());
  if(!q)return;
  const hits=people.filter(p=>normalise(p.name).includes(q));
  const l=labels();
  results.append(el('p','micro',hits.length?hits.length+' '+l.matches:l.noResults));
  hits.slice(0,20).forEach(p=>results.append(personButton(p,'family-result')));
}

function nodeMetrics(count){
  const width=166,gap=30;
  return {width,gap,rowWidth:Math.max(width,count*width+Math.max(0,count-1)*gap)};
}

function distribute(list,stageWidth,y,role){
  if(!list.length)return[];
  const {width,gap}=nodeMetrics(list.length);
  const total=list.length*width+(list.length-1)*gap;
  const start=(stageWidth-total)/2+width/2;
  return list.map((p,i)=>({p,x:start+i*(width+gap),y,role}));
}

function unique(list){
  return [...new Map(list.filter(Boolean).map(p=>[p.id,p])).values()];
}

function relationshipEdges(nodes,extraPartners=[]){
  const positions=new Map(nodes.map(n=>[n.p.id,n]));
  const edges=[];
  const partnerKeys=new Set();
  const addPartner=(aId,bId)=>{
    if(!positions.has(aId)||!positions.has(bId)||aId===bId)return;
    const key=[aId,bId].sort().join('|');
    if(partnerKeys.has(key))return;
    partnerKeys.add(key);
    edges.push({type:'partner',fromId:aId,toId:bId});
  };
  nodes.forEach(n=>{
    const visibleParents=unique(cleanList(n.p.parents))
      .filter(p=>positions.has(p.id))
      .sort((a,b)=>positions.get(a.id).x-positions.get(b.id).x);
    if(visibleParents.length>=2){
      const a=visibleParents[0],b=visibleParents[1];
      addPartner(a.id,b.id);
      edges.push({type:'descent',fromUnion:[a.id,b.id],toId:n.p.id});
    }else if(visibleParents.length===1){
      edges.push({type:'descent',fromId:visibleParents[0].id,toId:n.p.id});
    }
  });
  extraPartners.forEach(([aId,bId])=>addPartner(aId,bId));
  return edges;
}

function familyLayout(){
  const parents=unique(cleanList(selected.parents));
  const spouses=unique(cleanList(selected.spouses));
  const kids=unique(children(selected));
  const centre=[selected,...spouses];
  const maxCount=Math.max(1,parents.length,centre.length,kids.length);
  const stageWidth=Math.max(760,nodeMetrics(maxCount).rowWidth+160);
  const nodes=[
    ...distribute(parents,stageWidth,92,'parent'),
    ...distribute(centre,stageWidth,286,'focus'),
    ...distribute(kids,stageWidth,486,'child')
  ];
  const edges=relationshipEdges(nodes,spouses.map(p=>[selected.id,p.id]));
  return {nodes,edges,width:stageWidth,height:580};
}

function generationLayout(direction){
  const depth=3;
  const levels=[[selected]];
  let current=[selected];
  for(let i=0;i<depth;i++){
    const next=unique(current.flatMap(p=>direction==='ancestors'?cleanList(p.parents):children(p)));
    if(!next.length)break;
    levels.push(next);current=next;
  }
  const widest=Math.max(...levels.map(x=>x.length),1);
  const stageWidth=Math.max(760,nodeMetrics(widest).rowWidth+160);
  const rowGap=165;
  const height=Math.max(520,110+(levels.length-1)*rowGap+120);
  const nodes=[];
  levels.forEach((list,index)=>{
    const visualIndex=direction==='ancestors'?(levels.length-1-index):index;
    const y=80+visualIndex*rowGap;
    nodes.push(...distribute(list,stageWidth,y,index===0?'focus':'generation'));
  });
  const edges=relationshipEdges(nodes);
  return {nodes,edges,width:stageWidth,height};
}

function measuredNode(stage,id){
  const node=stage.querySelector('.family-tree-node[data-person="'+CSS.escape(id)+'"]');
  if(!node)return null;
  const nodeRect=node.getBoundingClientRect();
  const stageRect=stage.getBoundingClientRect();
  const left=nodeRect.left-stageRect.left;
  const top=nodeRect.top-stageRect.top;
  const right=left+nodeRect.width;
  const bottom=top+nodeRect.height;
  return {
    cx:left+nodeRect.width/2,
    cy:top+nodeRect.height/2,
    left,right,top,bottom
  };
}

function pathFor(edge,stage){
  if(edge.type==='partner'){
    const a=measuredNode(stage,edge.fromId),b=measuredNode(stage,edge.toId);
    if(!a||!b)return null;
    const left=a.cx<=b.cx?a:b;
    const right=a.cx<=b.cx?b:a;
    const y=(left.cy+right.cy)/2;
    return 'M '+left.right+' '+y+' L '+right.left+' '+y;
  }
  const b=measuredNode(stage,edge.toId);
  if(!b)return null;
  let fromX,fromY;
  if(edge.fromUnion){
    const a=measuredNode(stage,edge.fromUnion[0]),partner=measuredNode(stage,edge.fromUnion[1]);
    if(!a||!partner)return null;
    fromX=(a.cx+partner.cx)/2;
    fromY=(a.cy+partner.cy)/2;
  }else{
    const a=measuredNode(stage,edge.fromId);
    if(!a)return null;
    fromX=a.cx;fromY=a.bottom;
  }
  const toX=b.cx,toY=b.top;
  const mid=fromY+(toY-fromY)/2;
  return 'M '+fromX+' '+fromY+' L '+fromX+' '+mid+' L '+toX+' '+mid+' L '+toX+' '+toY;
}

function drawEdges(svg,stage,edges){
  svg.replaceChildren();
  const junctions=[];
  edges.forEach(edge=>{
    const d=pathFor(edge,stage);
    if(!d)return;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    const active=edge.fromId===selected.id||edge.toId===selected.id||(edge.fromUnion||[]).includes(selected.id);
    p.setAttribute('d',d);
    p.setAttribute('class',[edge.type==='partner'?'is-partner':'',active?'is-active':''].filter(Boolean).join(' '));
    svg.append(p);
    if(edge.fromUnion){
      const a=measuredNode(stage,edge.fromUnion[0]),b=measuredNode(stage,edge.fromUnion[1]);
      if(a&&b)junctions.push({x:(a.cx+b.cx)/2,y:(a.cy+b.cy)/2,active});
    }
  });
  const seen=new Set();
  junctions.forEach(j=>{
    const key=Math.round(j.x)+'|'+Math.round(j.y);
    if(seen.has(key))return;seen.add(key);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',j.x);dot.setAttribute('cy',j.y);dot.setAttribute('r','3');
    dot.setAttribute('class','family-tree-junction'+(j.active?' is-active':''));
    svg.append(dot);
  });
}

function treeNode(n){
  const b=personButton(n.p,'family-tree-node');
  b.style.left=n.x+'px';b.style.top=n.y+'px';
  if(n.p.id===selected.id)b.classList.add('is-focus');
  if(n.role==='parent')b.classList.add('is-parent');
  if(n.role==='child')b.classList.add('is-child');
  return b;
}

function renderTree(){
  tree.replaceChildren();
  const layout=mode==='family'?familyLayout():generationLayout(mode);
  const stage=el('div','family-tree-stage');
  stage.style.width=layout.width+'px';stage.style.height=layout.height+'px';
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','family-tree-lines');svg.setAttribute('viewBox','0 0 '+layout.width+' '+layout.height);
  svg.setAttribute('aria-hidden','true');
  stage.append(svg);
  layout.nodes.forEach(n=>stage.append(treeNode(n)));
  tree.append(stage);
  requestAnimationFrame(()=>{
    const focus=tree.querySelector('.is-focus');
    if(focus&&canvas){
      const focusRect=focus.getBoundingClientRect();
      const stageRect=stage.getBoundingClientRect();
      const focusCenter=(focusRect.left-stageRect.left)+(focusRect.width/2);
      const left=Math.max(0,focusCenter-canvas.clientWidth/2);
      canvas.scrollTo({left,behavior:'auto'});
    }

    // Draw only after the tree has been positioned/recentred. Measuring
    // with DOMRects keeps the SVG in exactly the same coordinate space
    // as the visible boxes, including transforms and horizontal scroll.
    requestAnimationFrame(()=>drawEdges(svg,stage,layout.edges));

    if(document.fonts?.ready){
      document.fonts.ready.then(()=>drawEdges(svg,stage,layout.edges));
    }
  });
}

function statButton(label,count,modeName){
  const b=el('button','family-stat');b.type='button';b.dataset.modeJump=modeName;
  b.append(el('strong','',String(count)),el('span','micro',label));return b;
}

function renderDetail(){
  const l=labels();detail.replaceChildren();detail.setAttribute('aria-label',l.person);
  detail.append(el('p','eyebrow',l.person+' / '+recordCode(selected.id)),el('h3','',selected.name));
  const life=el('p','family-years',eventText(selected.birth)+' — '+eventText(selected.death));detail.append(life);
  const place=eventPlace(selected.birth)||eventPlace(selected.death);if(place)detail.append(el('p','small family-place',place));

  const stats=el('div','family-stats');
  stats.append(
    statButton(l.parents,cleanList(selected.parents).length,'ancestors'),
    statButton(l.spouses,cleanList(selected.spouses).length,'family'),
    statButton(l.children,children(selected).length,'descendants')
  );
  detail.append(stats,el('h4','micro family-timeline-title',l.timeline));

  const timeline=el('ol','family-timeline');
  for(const [event,key] of [[selected.birth,'born'],[selected.death,'died']]){
    if(!event||(!event.date&&!event.place))continue;
    const li=el('li');const value=el('span');
    value.append(el('span','',l[key]));if(eventPlace(event))value.append(el('small','',eventPlace(event)));
    li.append(el('strong','',eventText(event)),value);timeline.append(li);
  }
  if(timeline.children.length)detail.append(timeline);

  const centre=el('button','family-centre',l.centre+' ↺');centre.type='button';centre.dataset.centerPerson=selected.id;detail.append(centre);

  const entries=(selected.media||[]).map(id=>media[id]).filter(Boolean);
  if(entries.length){
    const mediaBox=el('div','family-linked-media');
    const head=el('div','family-linked-media-head');head.append(el('span','micro',l.files),el('strong','',String(entries.length)));
    mediaBox.append(head);
    const strip=el('div','family-linked-media-strip');
    entries.slice(0,3).forEach(m=>{
      const a=el('a','family-linked-media-item');a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';a.title=m.title||l.open;
      if(m.kind==='photo'||/\.(jpe?g|png|webp)$/i.test(m.url)){
        const img=document.createElement('img');img.src=m.url;img.alt=m.title||selected.name;img.loading='lazy';a.append(img);
      }else{
        a.append(el('span','family-linked-doc','PDF'));
      }
      strip.append(a);
    });
    mediaBox.append(strip);
    const all=el('button','family-show-files',l.files+' · '+entries.length+' ↓');all.type='button';all.dataset.showPersonMedia=selected.id;mediaBox.append(all);
    detail.append(mediaBox);
  }
}

function mediaOwners(id){
  return people.filter(p=>(p.media||[]).includes(id));
}

function filteredMedia(){
  let entries=Object.values(media);
  if(mediaFilter!=='all')entries=entries.filter(m=>m.kind===mediaFilter);
  if(mediaOwner)entries=entries.filter(m=>(byId(mediaOwner)?.media||[]).includes(m.id));
  return entries;
}

function renderMedia(){
  if(!mediaGrid)return;
  const l=labels();
  const entries=filteredMedia();
  mediaGrid.replaceChildren();
  entries.slice(0,mediaLimit).forEach((m,i)=>{
    const article=el('article','archive-file-card');
    const a=el('a','archive-file-preview');a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',(m.title||l.open)+' — '+l.open);
    const visualImage=m.kind==='photo'||/\.(jpe?g|png|webp)$/i.test(m.url);
    if(visualImage){
      const img=document.createElement('img');img.src=m.url;img.alt=m.title||'';img.loading='lazy';a.append(img);
    }else{
      const paper=el('div','archive-document-preview');paper.append(el('span','micro','AG / '+String(i+1).padStart(3,'0')),el('strong','','PDF'));a.append(paper);
    }
    article.append(a);
    const meta=el('div','archive-file-meta');
    meta.append(el('span','micro',m.kind==='photo'?l.photos:l.documents),el('h3','',m.title||('Archive file '+(i+1))));
    const owners=mediaOwners(m.id);
    if(owners.length){
      const names=owners.slice(0,3).map(p=>p.name).join(' · ');
      meta.append(el('p','small',l.linked+': '+names+(owners.length>3?' +'+(owners.length-3):'')));
    }
    article.append(meta);mediaGrid.append(article);
  });
  if(mediaCount)mediaCount.textContent=l.fileCount(entries.length);
  if(mediaScope){
    mediaScope.replaceChildren();
    if(mediaOwner){
      mediaScope.append(el('span','micro',l.scoped(entries.length)+' · '+(byId(mediaOwner)?.name||'')));
      const clear=el('button','archive-media-clear',l.clearScope);clear.type='button';clear.dataset.clearMediaOwner='true';mediaScope.append(clear);
    }
  }
  if(mediaMore){
    mediaMore.hidden=entries.length<=mediaLimit;
    mediaMore.textContent=l.more+' ↓';
  }
  document.querySelectorAll('[data-media-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mediaFilter===mediaFilter)));
}

function renderArchiveCopy(){
  if(isDemo)return;
  const l=labels();
  const intro=document.querySelector('[data-i18n="demoIntro"]');
  const notice=document.querySelector('[data-i18n="demoNotice"]');
  const enter=document.querySelector('[data-i18n="demoEnter"]');
  const heading=document.querySelector('#family-heading');
  const badge=document.querySelector('[data-i18n="demoBadge"]');
  const hint=document.querySelector('[data-i18n="demoHint"]');
  const filesHeading=document.querySelector('#archive-files-heading');
  if(intro)intro.textContent=l.intro;if(notice)notice.textContent=l.notice;if(enter)enter.textContent=l.enter;
  if(heading)heading.textContent=l.heading;if(badge)badge.textContent=l.badge(people.length);if(hint)hint.textContent=l.hint;if(filesHeading)filesHeading.textContent=l.files;
  document.querySelectorAll('[data-family-mode]').forEach(b=>{
    b.textContent=b.dataset.familyMode==='family'?l.family:(b.dataset.familyMode==='ancestors'?l.ancestors:l.descendants);
  });
  document.querySelectorAll('[data-media-filter]').forEach(b=>{
    b.textContent=b.dataset.mediaFilter==='all'?l.all:(b.dataset.mediaFilter==='photo'?l.photos:l.documents);
  });
}

function render(){
  renderArchiveCopy();renderTree();renderDetail();renderResults();renderMedia();
  document.querySelectorAll('[data-family-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.familyMode===mode)));
}

document.querySelector('#family-room').addEventListener('click',e=>{
  const person=e.target.closest('[data-person]');
  if(person){
    const p=byId(person.dataset.person);
    if(p){selected=p;search.value='';results.replaceChildren();render();}
  }
  const m=e.target.closest('[data-family-mode]');
  if(m){mode=m.dataset.familyMode;render();}
  const jump=e.target.closest('[data-mode-jump]');
  if(jump){mode=jump.dataset.modeJump;render();}
  const files=e.target.closest('[data-show-person-media]');
  if(files){
    mediaOwner=files.dataset.showPersonMedia;mediaFilter='all';mediaLimit=24;renderMedia();
    document.querySelector('#archive-files')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  const centre=e.target.closest('[data-center-person]');
  if(centre){renderTree();}
});

document.querySelector('#archive-files')?.addEventListener('click',e=>{
  const filter=e.target.closest('[data-media-filter]');
  if(filter){mediaFilter=filter.dataset.mediaFilter;mediaLimit=24;renderMedia();}
  const clear=e.target.closest('[data-clear-media-owner]');
  if(clear){mediaOwner=null;mediaLimit=24;renderMedia();}
});

mediaMore?.addEventListener('click',()=>{mediaLimit+=24;renderMedia();});
search.addEventListener('input',renderResults);

let resizeRedrawFrame=0;
window.addEventListener('resize',()=>{
  cancelAnimationFrame(resizeRedrawFrame);
  resizeRedrawFrame=requestAnimationFrame(()=>{
    const stage=tree.querySelector('.family-tree-stage');
    const svg=stage?.querySelector('.family-tree-lines');
    if(!stage||!svg)return;
    const layout=mode==='family'?familyLayout():generationLayout(mode);
    drawEdges(svg,stage,layout.edges);
  });
});

onLanguage(render);

async function loadFamily(){
  try{
    const response=await fetch('/v2/assets/genealogy/family.json',{cache:'no-store'});
    if(!response.ok)throw new Error('family.json unavailable');
    const data=await response.json();
    if(!Array.isArray(data.people)||!data.people.length)throw new Error('family.json empty');
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
        const id='@M'+m[0]+'@',filename=m[1];
        return [id,{id,url:'/v2/assets/genealogy/media/'+filename,title:m[2],kind:m[3],format:filename.split('.').pop()}];
      }));
    }else{
      people=data.people.map(normalisePerson);media=data.media||{};
    }
    isDemo=false;
    selected=[...people].sort((a,b)=>((b.parents.length+b.children.length+b.spouses.length)-(a.parents.length+a.children.length+a.spouses.length))||a.name.localeCompare(b.name))[0];
    render();
  }catch(error){
    render();
  }
}
loadFamily();
