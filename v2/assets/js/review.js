const frame=document.getElementById('frame'),stage=document.getElementById('stage'),page=document.getElementById('page'),width=document.getElementById('width'),lang=document.getElementById('lang'),status=document.getElementById('status'),results=document.getElementById('results');
function size(){const w=Number(width.value),scale=Math.min(1,(innerWidth-36)/w);frame.style.width=w+'px';frame.style.transform=`scale(${scale})`;stage.style.width=w*scale+'px';stage.style.height=930*scale+'px';}
function show(){size();frame.src='/v2/'+page.value+'?lang='+lang.value;}
[page,lang].forEach(el=>el.addEventListener('change',show));width.addEventListener('change',size);window.addEventListener('resize',size);show();
document.getElementById('audit').addEventListener('click',async event=>{
 const controls=[...document.querySelectorAll('button,select')];controls.forEach(c=>c.disabled=true);results.textContent='';let passed=0,failed=0;
 try {
 for(const p of ['','travel/','photos/','lists/','archive/'])for(const l of ['en','es','ja','zh'])for(const w of [1440,1024,768,390]){
  page.value=p;lang.value=l;width.value=String(w);size();
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Page timed out')),12000);frame.onload=()=>{clearTimeout(timer);resolve();};frame.src='/v2/'+p+'?lang='+l;});
  await new Promise(resolve=>setTimeout(resolve,160));
  const doc=frame.contentDocument,win=frame.contentWindow;
  await Promise.all([...doc.images].filter(img=>img.loading!=='lazy').map(img=>img.decode().catch(()=>{})));
  const errors=[];
  if(doc.documentElement.scrollWidth>w)errors.push('horizontal overflow '+doc.documentElement.scrollWidth);
  if(doc.documentElement.lang!==(l==='zh'?'zh-Hans':l))errors.push('language not applied');
  if(doc.querySelector('meta[name="robots"]')?.content!=='noindex,nofollow')errors.push('noindex missing');
  if(doc.querySelectorAll('h1').length!==1)errors.push('h1 count');
  if([...doc.images].some(img=>img.getAttribute('src')&&img.complete&&!img.naturalWidth))errors.push('broken image');
  if(p==='travel/'&&doc.querySelectorAll('#country-list button').length!==76)errors.push('country list');
  const map=doc.querySelector('.map-paper');if(map&&map.getBoundingClientRect().height>540)errors.push('map height');
  const result=`${errors.length?'FAIL':'PASS'} ${p||'home'} ${l} ${w}${errors.length?' — '+errors.join(', '):''}`;
  results.textContent+=result+'\n';errors.length?failed++:passed++;status.textContent=`${passed} passed / ${failed} failed`;results.scrollTop=results.scrollHeight;
 }
 }catch(error){status.textContent=error.message;results.textContent+=error.stack;}finally{controls.forEach(c=>c.disabled=false);frame.onload=null;}
});
