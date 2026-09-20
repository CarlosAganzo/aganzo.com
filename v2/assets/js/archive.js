import {translate as t, onLanguage} from './site.js?v=archive-1';
// Entirely synthetic demonstration. Never replace with an unfiltered GEDCOM export.
const people = [
  {id:'p1',name:'Elena Robles',born:1924,died:2008,parents:['p2','p3']},
  {id:'p2',name:'Tomás Robles',born:1893,died:1969,parents:['p4','p5']},
  {id:'p3',name:'Clara Montes',born:1898,died:1982,parents:['p6','p7']},
  {id:'p4',name:'Gabriel Robles',born:1863,died:1934,parents:[]},
  {id:'p5',name:'Inés Vidal',born:1868,died:1941,parents:[]},
  {id:'p6',name:'Mateo Montes',born:1869,died:1946,parents:[]},
  {id:'p7',name:'Lucía Soler',born:1872,died:1951,parents:[]}
];
let selected=people[0], mode='ancestors';
const byId=id=>people.find(p=>p.id===id);
const children=p=>people.filter(q=>q.parents.includes(p.id));
const tree=document.querySelector('#family-tree'),detail=document.querySelector('#family-detail'),search=document.querySelector('#family-search'),results=document.querySelector('#family-results');
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function personButton(p){const b=el('button','family-person');b.type='button';b.dataset.person=p.id;b.setAttribute('aria-pressed',String(p.id===selected.id));b.append(el('strong','',p.name),el('span','micro',`${p.born} — ${p.died}`));return b;}
function group(title,list){const wrap=el('div','family-relations');wrap.append(el('h4','micro',title));if(!list.length)wrap.append(el('p','small',t('demoNone')));list.forEach(p=>wrap.append(personButton(p)));return wrap;}
function renderResults(){results.replaceChildren();const q=search.value.trim().normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();if(!q)return;const hits=people.filter(p=>p.name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(q));results.append(el('p','micro',hits.length?`${hits.length} ${t('demoMatches')}`:t('demoNoResults')));hits.forEach(p=>results.append(personButton(p)));}
function render(){
 tree.replaceChildren();let levels=[[selected]],current=[selected];
 for(let i=0;i<2;i++){current=[...new Map(current.flatMap(p=>mode==='ancestors'?p.parents.map(byId):children(p)).map(p=>[p.id,p])).values()];if(!current.length)break;levels.push(current);}
 if(mode==='ancestors')levels.reverse();
 levels.forEach(list=>{const row=el('div','family-generation');row.setAttribute('role','group');row.setAttribute('aria-label',list[0]===selected?t('demoFocus'):t('demoGeneration'));list.forEach(p=>row.append(personButton(p)));tree.append(row);});
 if(levels.length===1)tree.append(el('p','small',t('demoNone')));
 detail.replaceChildren();detail.setAttribute('aria-label',t('demoPerson'));
 detail.append(el('p','eyebrow',`${t('demoPerson')} / ${selected.id.slice(1).padStart(3,'0')}`),el('h3','',selected.name),el('p','family-years',`${selected.born} — ${selected.died}`),el('h4','micro',t('demoTimeline')));
 const timeline=el('ol','family-timeline');for(const [year,key] of [[selected.born,'demoBorn'],[selected.died,'demoDied']]){const li=el('li');li.append(el('strong','',String(year)),el('span','',t(key)));timeline.append(li);}detail.append(timeline,group(t('demoParents'),selected.parents.map(byId)),group(t('demoChildren'),children(selected)),el('h4','micro',t('demoRecord')),el('p','small',t('demoRecordText')));
 document.querySelectorAll('[data-family-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.familyMode===mode)));renderResults();
}
document.querySelector('#family-room').addEventListener('click',e=>{const b=e.target.closest('[data-person]');if(b){selected=byId(b.dataset.person);render();tree.querySelector(`[data-person="${selected.id}"]`).focus({preventScroll:true});}const m=e.target.closest('[data-family-mode]');if(m){mode=m.dataset.familyMode;render();}});
search.addEventListener('input',renderResults);
onLanguage(render);
