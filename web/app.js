import {loadWorkspace, saveWorkspace, clearWorkspace} from './workspace-store.js';
import {lessons} from './course.js';
import {investigations} from './investigations.js';
import {labs, presentation} from './lesson-presentation.js';
import {paintSource} from './editor.js';
import {createRoutes} from './routes.js';
const $=id=>document.getElementById(id), prefix='go-foundry:v1:', drafts=new Map(), notes=new Map(), done=new Set(), unsavedCompletion=new Set(), results=new Map();
const probes=[...lessons,...investigations];
const siteURL=new URL('./',import.meta.url),routes=createRoutes(siteURL,labs,probes);
// A history change must not retarget the favicon or a resource link to a course
// subdirectory. Resolve document-relative URLs before the first route change.
for(const link of document.querySelectorAll('a[href],link[href]')){const href=link.getAttribute('href');if(href&&!href.startsWith('#'))link.href=new URL(href,location.href).href;}
let files={}, probe, sourcePath, frame=null, image, undo=null, ready=false, manualBusy=false, current=null, savedWorkspace=null, workspaceError='', releaseLock=null, lastActivity=Date.now();
const read=(key,fallback)=>{try{return localStorage.getItem(prefix+key)??fallback;}catch{return fallback;}};
function save(key,value){try{localStorage.setItem(prefix+key,value);return true;}catch{return false;}}
let restorationFailed=false;
let idleMinutes=Number(read('idle-minutes','30'));if(![0,5,15,30,60].includes(idleMinutes))idleMinutes=30;
function feedback(text){$('feedback').textContent=text;$('feedback').hidden=false;}
function post(packet,transfer=[]){frame?.contentWindow.postMessage({channel:'foundry-linux',...packet},location.origin,transfer);}
function activity(){lastActivity=Date.now();}
function state(){
  const active=!!frame, busy=!!current||manualBusy;
  $('run-source').disabled=busy||!image||restorationFailed;
  $('stop-run').hidden=!current||current.kind!=='run';
  $('stop-run').disabled=['saving','stopping'].includes(current?.phase);
  const otherJob=current?.kind==='run'&&current.probeID!==probe?.id;$('active-job-note').hidden=!otherJob;$('active-job-note').replaceChildren();if(otherJob){const link=document.createElement('a');link.href=routes.lesson(probes.find(entry=>entry.id===current.probeID));link.textContent=probes.find(entry=>entry.id===current.probeID)?.title||'the running lesson';$('active-job-note').append('A run is active in ',link,'. Its output stays with that lesson.');}$('stop-run').setAttribute('aria-label',otherJob?'Stop run in '+probes.find(entry=>entry.id===current.probeID).title:'Stop run');
  $('runner-state').textContent=active?(current?phaseLabel(current.phase):(ready?(manualBusy?'Terminal command active':'Ready'):'Starting')):'Stopped';
  $('runner-description').textContent=current?(current.phase==='saving'?'Saving the project before returning to Ready.':current.kind==='run'?'A lesson job is active. Close this dialog to inspect Output or choose Stop run.':'The runner is restoring or saving the project. Wait for it to finish.'):manualBusy?'A terminal command is active. Wait for its prompt before submitting another run.':active?(ready?'The runner is ready for another run.':'The runner is loading or restoring your saved project.'):'The runner starts when you choose Run.';
  $('linux-start').hidden=active;$('linux-start').disabled=!image||busy;
  $('linux-stop').hidden=!active;$('linux-stop').disabled=busy;
  $('runner-dialog').querySelector('[data-start]').disabled=active||!image||busy;
  $('runner-dialog').querySelector('[data-stop]').disabled=!active||busy;
  $('workspace-status').textContent=workspaceError|| (savedWorkspace?'Project files and data are saved in this browser.':'Project files and data will be saved in this browser after each run.');
  $('workspace-status').dataset.error=String(!!workspaceError);$('fresh-project').hidden=!restorationFailed;
  renderActivity();renderResult();
}
function phaseLabel(phase){return ({starting:'Starting',restoring:'Restoring project',compiling:'Compiling',running:'Running',testing:'Running tests',saving:'Saving project',stopping:'Stopping run'})[phase]||'Working';}
let activityToken=null,activityStarted=0;
function updateActivityTime(){if(!$('run-progress').hidden)$('run-progress-time').textContent=Math.floor((performance.now()-activityStarted)/60000)+':'+String(Math.floor((performance.now()-activityStarted)/1000)%60).padStart(2,'0');}
function renderActivity(){
  const task=current?.kind==='run'?current:current?.queued?.kind==='run'?current.queued:null;
  const visible=!!current||manualBusy||starting||!!frame&&!ready;
  const phase=current?.phase||(!ready?'starting':'running'),token=task?.id||current?.id||frame||'starting';
  $('run-progress').hidden=!visible;$('runner-open').dataset.working=String(visible);$('runner-open').setAttribute('aria-busy',String(visible));
  $('run-source').classList.toggle('is-working',!!task||manualBusy);
  $('run-source').textContent=task?(task.probeID===probe?.id?phaseLabel(phase)+'…':'Runner busy'):current||manualBusy?'Runner busy':'Run';
  if(!visible){activityToken=null;return;}
  if(activityToken!==token){activityToken=token;activityStarted=task?.startedAt??performance.now();}
  const labels={starting:'Starting code runner',restoring:'Restoring saved project',compiling:'Compiling Go source',testing:'Compiling and running Go tests',running:'Running program',saving:'Saving project',stopping:'Stopping program'};
  const descriptions={starting:task?'Loading Linux and the Go compiler. The first start can take several minutes. Your run will continue automatically.':'Loading Linux and the Go compiler. Choose Run to queue an example, or use Code runner to stop loading.',restoring:'Loading the project files saved in this browser. Your queued run will continue automatically.',compiling:'Building an executable from the source you submitted. Output appears below.',testing:'The Go toolchain is compiling and executing the tests. Results appear below.',running:'Output appears below as the program writes it. Choose Stop run to cancel.',saving:'Saving project files before making the runner ready for another run.',stopping:'Stopping the program, then saving the project.'};
  const owner=task&&task.probeID!==probe?.id?probes.find(entry=>entry.id===task.probeID)?.title:null;
  $('run-progress-label').textContent=(manualBusy?'Running terminal command':labels[phase]||'Working')+(owner?' — '+owner:'');
  $('run-progress-detail').textContent=manualBusy?'Wait for the terminal command to finish before submitting another run.':phase==='restoring'&&!task?'Loading the project files saved in this browser. The runner will be ready when restoration finishes.':descriptions[phase]||'Wait for the current operation to finish.';
  updateActivityTime();
}
setInterval(updateActivityTime,1000);
function renderResult(){
  if(!probe)return;
  const result=results.get(probe.id), running=current?.probeID===probe.id;
  $('job-status').textContent=running?phaseLabel(current.phase)+'…':(result?.status||'Ready. Choose Run to compile and execute the editor source.');
  $('job-output').textContent=result?.output|| (running?'Waiting for program output…':'Program output and compiler errors appear here.');
  $('job-diagnostics').textContent=result?.diagnostics||'No execution measurements yet.';
  $('output-caption').hidden=!result||!!running;$('job-result').setAttribute('aria-busy',String(!!running));
}
function terminalVisible(open){$('terminal-region').classList.toggle('terminal-closed',!open);$('terminal-region').inert=!open;$('terminal-region').setAttribute('aria-hidden',String(!open));$('terminal-toggle').setAttribute('aria-expanded',String(open));$('terminal-toggle').textContent=open?'Hide Linux terminal':'Open Linux terminal';if(open){start();$('terminal-region').scrollIntoView({block:'start'});}}
let leaseFinished=Promise.resolve();
async function acquireLease(){
  if(!navigator.locks)throw Error('This browser cannot safely coordinate saved Linux sessions across tabs. Use a current browser. Your editor drafts are kept.');
  // Resolving our hold callback does not synchronously release the browser lock.
  // A same-tick fresh restart must await the entire previous request finishing.
  await leaseFinished;
  let acquired, failed;
  const entered=new Promise((resolve,reject)=>{acquired=resolve;failed=reject;});
  leaseFinished=navigator.locks.request('go-foundry-workspace-session',{ifAvailable:true},lock=>{
    if(!lock){failed(Error('The runner is open in another Go Foundry tab. Stop it there before starting here.'));return;}
    return new Promise(release=>{releaseLock=release;acquired();});
  }).catch(error=>{failed(error);});
  return entered;
}

let starting=false;
function acknowledgeRunner(){save('runner-introduction','seen');}
function introduceRunner(){if(read('runner-introduction','')==='seen')return;$('runner-intro-timeout').textContent=idleMinutes?'Project files are saved after each run. The runner saves again and stops after '+idleMinutes+' minutes without a run or terminal activity. Change the time in Code runner.':'Project files are saved after each run. Automatic stopping is disabled in Code runner.';$('runner-intro').showModal();}
$('runner-intro').addEventListener('close',acknowledgeRunner);$('runner-intro-dismiss').onclick=()=>$('runner-intro').close();$('runner-intro-settings').onclick=()=>{$('runner-intro').close();$('runner-dialog').showModal();state();};
async function start(){
  if(frame||starting)return;
  if(!image){feedback('Toolchain files could not be loaded. Reload while online. Your drafts are kept.');return;}
  starting=true;introduceRunner();
  try {
    await acquireLease();
    try {savedWorkspace=await loadWorkspace();workspaceError='';}catch{workspaceError='Saved project storage could not be opened. Nothing has been replaced. Retry Run after browser storage is available; your editor drafts are kept.';throw Error(workspaceError);}
    frame=document.createElement('iframe');frame.title='Optional Go Foundry Linux terminal';frame.src=$('external-linux').href;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads');frame.setAttribute('allow','fullscreen');frame.allowFullscreen=true;$('terminal').append(frame);
    $('session-state').textContent='Starting the runner. Your editor text has been kept.';activity();state();
  } catch(error){releaseLock?.();releaseLock=null;current=null;feedback(error.message);state();}
  finally{starting=false;state();}
}
function stop(){
  frame?.remove();frame=null;ready=false;manualBusy=false;current=null;restorationFailed=false;releaseLock?.();releaseLock=null;
  $('stop-dialog').close();$('session-state').textContent='Runner stopped. The saved project will be restored on its next start.';terminalVisible(false);state();
}
function requestStop(){if(!frame||current)return;$('runner-dialog').close();$('stop-dialog').showModal();}
function checkpoint(kind='save'){
  if(!ready||!frame||current||manualBusy)return;
  current={id:crypto.randomUUID(),type:'checkpoint',kind,command:'true',phase:'saving'};post(current);state();
}
function showFile(path){if(!Object.hasOwn(files,path))return;sourcePath=path;$('source-file').value=path;const saved=drafts.get(path)??read('source/'+path,null);$('source').value=saved??files[path];$('source-name').textContent=path;updateLines();$('draft-status').textContent=saved===null?'Starter source is open.':'An edited draft is open. To use the starter, choose Editor tools → Restore original source. Undo restore keeps your edit available.';undo=null;$('undo').hidden=true;}
function closeOutline(returnFocus=false){
  $('outline').hidden=true;$('outline-toggle').setAttribute('aria-expanded','false');
  if(returnFocus){$('outline-toggle').focus({preventScroll:true});$('outline-toggle').scrollIntoView({block:'nearest'});}
}
function labFor(entry){return entry?labs.find(lab=>lab.lessons.includes(entry.id)):null;}
let activeLab=null;
function brand(lab){document.querySelector('.brand').href=routes.home(lab);$('brand-title').textContent=lab?'Go — '+lab.title:'Go Foundry';$('brand-subtitle').textContent=lab?'Go Foundry lab':'Learn Go in your browser';}
function sourceOptions(lab){const paths=lab?[...new Set(lab.lessons.flatMap(id=>{const entry=lessons.find(entry=>entry.id===id);return [entry.file,...(entry.supportFiles||[])];}))]:Object.keys(files);$('source-file').replaceChildren(...paths.map(path=>{const option=document.createElement('option');option.value=path;option.textContent=path;return option;}));}
function icon(name,extra=''){const span=document.createElement('span');span.className='material-icon '+extra+' icon-'+name;span.setAttribute('aria-hidden','true');return span;}
function makeLinks(entries){
  const list=document.createElement('ol');list.className='lesson-links';
  for(const entry of entries){
    const item=document.createElement('li'),link=document.createElement('a'),number=document.createElement('span'),title=document.createElement('span');
    link.href=routes.lesson(entry);link.dataset.lessonId=entry.id;number.className='lesson-number';
    number.textContent=String(entries.indexOf(entry)+1).padStart(2,'0');
    title.className='lesson-title';title.textContent=entry.title;link.append(number,title,icon('check','compact completed-mark'));item.append(link);list.append(item);
  }
  return list;
}
function buildNavigation(){
  for(const [index,lab]of labs.entries()){
    const card=document.createElement('section');card.className='home-chapter lab-card';
    const number=document.createElement('p');number.className='lab-number';number.textContent='Lab '+(index+1);
    const title=document.createElement('h3');title.textContent=lab.title;
    const description=document.createElement('p');description.textContent=lab.description;
    const before=document.createElement('p');before.className='lab-before';before.textContent=lab.before.length?'Builds on '+labs.find(item=>item.id===lab.before[0]).title+'.':'No Go experience required.';
    const count=document.createElement('p');count.className='chapter-progress';count.dataset.labProgress=lab.id;
    const link=document.createElement('a');link.href=routes.home(lab);link.dataset.labId=lab.id;link.textContent='Open '+lab.title;link.className='lab-open';
    card.append(number,title,description,before,count,link);$('home-outline').append(card);
  }
  const heading=document.createElement('h3');heading.id='home-investigations';heading.tabIndex=-1;heading.textContent='Choose an investigation';$('home-investigation-list').append(heading,makeLinks(investigations));
}
function renderOutline(lab){
  $('outline').replaceChildren();
  const overview=document.createElement('a');overview.href=routes.home(lab);overview.className='outline-overview';overview.textContent=lab?lab.title+' overview':'Go Foundry labs';$('outline').append(overview);
  const group=document.createElement('section');group.className='outline-group';const heading=document.createElement('h3');heading.textContent=lab?'Lessons in this lab':'Optional runtime investigations';group.append(heading,makeLinks(lab?lab.lessons.map(id=>lessons.find(entry=>entry.id===id)):investigations));$('outline').append(group);
}
function countComplete(lab){return lab.lessons.filter(id=>done.has(id)).length;}
function lastInLab(lab){const id=read('last-lesson/'+lab.id,read('last-lesson',''));return lab.lessons.includes(id)?lessons.find(entry=>entry.id===id):null;}
function lessonToOpen(lab){
  const last=lastInLab(lab),unfinished=lab.lessons.find(id=>!done.has(id));
  return last&&unfinished&&!done.has(last.id)?last:lessons.find(entry=>entry.id===(unfinished||lab.lessons[0]));
}
function updateLabStart(lab){
  const last=lastInLab(lab),complete=countComplete(lab)===lab.lessons.length,target=lessonToOpen(lab);
  $('start-lab').href=routes.lesson(target);$('start-lab').textContent=complete?'Review this lab':last||countComplete(lab)?'Continue: '+target.title:'Start the first lesson';
}
function progress(){
  $('home-progress').textContent=labs.filter(lab=>countComplete(lab)===lab.lessons.length).length+' / '+labs.length+' labs complete';
  for(const lab of labs)document.querySelectorAll('[data-lab-progress="'+lab.id+'"]').forEach(node=>node.textContent=countComplete(lab)+' / '+lab.lessons.length+' lessons complete');
  const currentLab=labFor(probe);$('progress').textContent=currentLab?countComplete(currentLab)+' / '+currentLab.lessons.length+' lessons complete':'Optional investigations';
  for(const link of document.querySelectorAll('[data-lesson-id]')){
    const completed=done.has(link.dataset.lessonId);link.dataset.complete=String(completed);link.setAttribute('aria-label',probes.find(entry=>entry.id===link.dataset.lessonId).title+(completed?' — complete':''));
    if(!$('lesson-view').hidden&&link.dataset.lessonId===probe?.id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
  const last=lessons.find(entry=>entry.id===read('last-lesson','')),recent=labFor(last),next=labs.find(lab=>countComplete(lab)<lab.lessons.length),continuation=recent&&countComplete(recent)<recent.lessons.length?recent:next||recent||labs[0],hasProgress=lessons.some(entry=>done.has(entry.id));
  const target=lessonToOpen(continuation);
  $('start-course').href=routes.lesson(target);$('start-course').textContent=!next?'Review: '+target.title:lastInLab(continuation)||hasProgress?'Continue: '+target.title:'Start the first lesson';
  if(activeLab)updateLabStart(activeLab);
}
function showLab(lab){
  activeLab=lab;brand(lab);$('home-view').hidden=true;$('lesson-view').hidden=true;$('lab-view').hidden=false;document.title=lab.title+' · Go Foundry';
  $('lab-title').textContent=lab.title;$('lab-current').textContent=lab.title;$('lab-description').textContent=lab.description;$('lab-prerequisites').textContent=lab.prerequisites;
  $('lab-prerequisite-links').replaceChildren();for(const id of lab.before){const prerequisite=labs.find(item=>item.id===id),link=document.createElement('a');link.href=routes.home(prerequisite);link.textContent='Review '+prerequisite.title;$('lab-prerequisite-links').append(link);}
  $('lab-prerequisite-links').hidden=!lab.before.length;$('lab-progress').dataset.labProgress=lab.id;$('lab-outline').replaceChildren(makeLinks(lab.lessons.map(id=>lessons.find(entry=>entry.id===id))));
  const following=labs[labs.indexOf(lab)+1];$('following-lab').hidden=!following;if(following){$('following-lab').href=routes.home(following);$('following-lab').textContent='Next lab: '+following.title;}
  progress();requestAnimationFrame(()=>{$('lab-title').focus({preventScroll:true});document.querySelector('.lab-location').scrollIntoView({block:'start'});});
}

function renderReferences(){
  const topics=presentation[probe.id]?.topics||[];$('references').replaceChildren();$('references').className='topic-references';
  $('references-subtitle').textContent=topics.map(topic=>topic.title).join(' · ');
  for(const topic of topics){const item=document.createElement('li'),heading=document.createElement('h3'),reminder=document.createElement('p'),code=document.createElement('code'),link=document.createElement('a');heading.textContent=topic.title;reminder.textContent=topic.reminder;code.textContent=topic.code;link.href=topic.url;link.target='_blank';link.rel='noopener';link.textContent=topic.title+' documentation (new tab)';item.append(heading,reminder,code,link);$('references').append(item);}
}
function updateDiagramHint(){const region=document.querySelector('.diagram-scroll');if(region)document.querySelector('.diagram-hint').hidden=region.scrollWidth<=region.clientWidth;}
window.addEventListener('resize',updateDiagramHint);
function renderDiagram(diagram){
  if(!diagram)return;
  const figure=document.createElement('figure'),heading=document.createElement('h3'),scroll=document.createElement('div'),caption=document.createElement('figcaption'),hint=document.createElement('p');
  figure.className='concept-diagram';heading.textContent=diagram.title;hint.className='diagram-hint';hint.id='diagram-hint';hint.textContent='Scroll sideways to follow the full diagram.';hint.hidden=true;scroll.setAttribute('aria-describedby','diagram-hint');caption.textContent=diagram.caption;scroll.className='diagram-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',diagram.title+'; scroll horizontally if needed');
  const ns='http://www.w3.org/2000/svg',make=(tag,attrs,text)=>{const node=document.createElementNS(ns,tag);for(const[key,value]of Object.entries(attrs))node.setAttribute(key,value);if(text)node.textContent=text;return node;};
  const width=Math.max(...diagram.nodes.map(n=>n.x+n.w))+20,height=Math.max(...diagram.nodes.map(n=>n.y))+100;
  const svg=make('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':diagram.nodes.map(n=>n.label+': '+n.detail).join('. ')+'. '+diagram.edges.map(e=>e.from+' → '+e.to+': '+e.label).join('. ')});svg.style.minWidth=width+'px';
  for(const edge of diagram.edges){const from=diagram.nodes.find(n=>n.id===edge.from),to=diagram.nodes.find(n=>n.id===edge.to),vertical=from.y!==to.y,down=to.y>from.y;
   const x1=vertical?from.x+from.w/2:from.x+from.w,y1=vertical?(down?from.y+58:from.y):from.y+29,x2=vertical?to.x+to.w/2:to.x,y2=vertical?(down?to.y:to.y+58):to.y+29;
   svg.append(make('path',{d:'M'+x1+' '+y1+' L'+x2+' '+y2,fill:'none',stroke:'currentColor','stroke-width':2}));
   const angle=Math.atan2(y2-y1,x2-x1),size=7;svg.append(make('path',{d:'M'+(x2-size*Math.cos(angle-.5))+' '+(y2-size*Math.sin(angle-.5))+' L'+x2+' '+y2+' L'+(x2-size*Math.cos(angle+.5))+' '+(y2-size*Math.sin(angle+.5)),fill:'none',stroke:'currentColor','stroke-width':2}));
   svg.append(make('text',{x:(x1+x2)/2,y:(y1+y2)/2-9,'text-anchor':'middle',class:'diagram-edge'},edge.label));
  }
  for(const node of diagram.nodes)svg.append(make('rect',{x:node.x,y:node.y,width:node.w,height:58,rx:6,class:'diagram-node'}),make('text',{x:node.x+10,y:node.y+22,class:'diagram-label'},node.label),make('text',{x:node.x+10,y:node.y+43,class:'diagram-detail'},node.detail));
  scroll.append(svg);figure.append(heading,hint,scroll,caption);$('explanation').append(figure);requestAnimationFrame(updateDiagramHint);
}
function completionStatus(){$('completion-status').textContent=unsavedCompletion.has(probe?.id)?'Storage is unavailable. This completion mark is kept in this tab only.':'Saved in this browser. Completion records your progress, not a test result.';}
function navigationCard(node,entry,direction,lab=null){
  const label=document.createElement('span'),title=document.createElement('strong');label.className='card-direction';label.textContent=entry?direction:lab?'Lab overview':'Go Foundry labs';title.textContent=entry?entry.title:lab?lab.title:'Choose a lab';node.href=entry?routes.lesson(entry):routes.home(lab);node.replaceChildren(label,title);
}
let pendingTools=false;
function show(id){
  const entry=probes.find(item=>item.id===id),sectionID=id.startsWith('course/')?id.slice(7):null,requestedLab=id.startsWith('lab/')?labs.find(lab=>lab.id===id.slice(4)):labs.find(lab=>lab.legacySection===sectionID);if(requestedLab){showLab(requestedLab);return;}
  if(!entry){
    activeLab=null;brand(null);$('home-view').hidden=false;$('lesson-view').hidden=true;$('lab-view').hidden=true;document.title='Go Foundry · Lab series';progress();
    const target=sectionID==='investigations'?$('home-investigations'):$('home-title');
    if(sectionID==='investigations')document.querySelector('.home-investigations').open=true;
    requestAnimationFrame(()=>{target.focus({preventScroll:true});target.scrollIntoView({block:'start'});});return;
  }
  probe=entry;activeLab=labFor(probe);brand(activeLab);$('home-view').hidden=true;$('lab-view').hidden=true;$('lesson-view').hidden=false;
  document.title=probe.title+' · '+(activeLab?activeLab.title+' · ':'')+'Go Foundry';
  for(const [target,field]of[['check-title','title'],['purpose','purpose'],['action','action'],['run-command','command'],['observe','observe'],['reference-output','reference']])$(target).textContent=probe[field];
  $('explanation').replaceChildren();for(const text of (probe.explanation||'').split('\n\n')){const paragraph=document.createElement('p');paragraph.textContent=text;$('explanation').append(paragraph);}$('explanation').hidden=!probe.explanation;renderDiagram(probe.diagram);
  $('reference-output').previousElementSibling.textContent=probe.referenceMode==='contains'?'Evidence to find in the starter output (other lines and timings can vary)':'Starter output';
  const lab=labFor(probe);$('section-location').textContent=lab?.title||'Runtime investigations';$('section-location').href=lab?routes.home(lab):routes.home()+'#course/investigations';$('breadcrumb').textContent=probe.title;renderOutline(lab);
  renderReferences();$('prediction').value=notes.get(probe.id)??read('notes/'+probe.id,'');$('complete').checked=done.has(probe.id);
  const regular=lessons.some(item=>item.id===probe.id), sequence=lab?lab.lessons.map(id=>lessons.find(entry=>entry.id===id)):investigations,index=sequence.indexOf(probe);
  $('completion-label').textContent=regular?'Mark lesson complete':'Mark investigation reviewed';
  completionStatus();
  navigationCard($('previous-lesson'),sequence[index-1],'Previous lesson',lab);navigationCard($('next-lesson'),sequence[index+1],'Next lesson',lab);
  if(regular){save('last-lesson',probe.id);save('last-lesson/'+lab.id,probe.id);}
  sourceOptions(lab);showFile(probe.file);closeOutline();progress();state();
  requestAnimationFrame(()=>{if(pendingTools){pendingTools=false;$('runner-tools').open=true;$('runner-tools').scrollIntoView({block:'start'});$('runner-tools').querySelector('summary').focus({preventScroll:true});}else{$('check-title').focus({preventScroll:true});document.querySelector('.course-navigation').scrollIntoView({block:'start'});}});
}

function sendPending(){if(ready&&frame&&current&&current.phase==='starting'){current.phase='compiling';post({...current,type:'job'});state();}}
function queueRun(){
  if(current||manualBusy){feedback('Wait for the current run or terminal command to finish.');return;}
  activity();current={id:crypto.randomUUID(),type:'job',kind:'run',startedAt:performance.now(),probeID:probe.id,path:'/root/work/go-foundry/'+sourcePath,source:$('source').value,command:probe.command,phase:ready?'compiling':'starting'};
  results.set(probe.id,{output:'',diagnostics:'',status:''});
  if(frame&&ready)post(current);else start();state();
}
document.querySelector('.skip').onclick=event=>{event.preventDefault();const target=!$('lesson-view').hidden?$('check-title'):!$('lab-view').hidden?$('lab-title'):$('home-title');target.focus({preventScroll:true});target.scrollIntoView({block:'start'});};
$('run-source').onclick=queueRun;
$('stop-run').onclick=()=>{if(current?.kind==='run'&&current.phase==='starting'){results.set(current.probeID,{status:'Run stopped before compilation.',output:''});current=null;state();return;}if(current?.kind==='run'){post({type:'cancel',id:current.id});current.phase='stopping';state();}};
$('source').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();if(!current)queueRun();}});
addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.channel!=='foundry-linux')return;
  const data=event.data;
  if(data.type==='activity'){activity();return;}
  if(data.type==='terminal-busy'){manualBusy=data.busy;activity();state();return;}
  if(data.type==='ready'){
    if(savedWorkspace){
      // Keep the queued editor snapshot while restoring the project and its data.
      const queued=current;current={id:crypto.randomUUID(),type:'restore',kind:'restore',phase:'restoring',queued,command:''};
      const bytes=savedWorkspace.bytes.slice(0);post({...current,queued:undefined,bytes},[bytes]);
    }else {ready=true;sendPending();}state();return;
  }
  if(data.type==='status'){$('session-state').textContent=data.message;return;}
  if(data.type==='snapshot'){
    if(data.id!==current?.id)return;
    try{const savedAt=await saveWorkspace(data.bytes);savedWorkspace={bytes:data.bytes,savedAt};workspaceError='';post({type:'snapshot-ack',id:data.id,saved:true});}
    catch{workspaceError='Project saving failed. Keep the runner open. In Runner tools and project backups, choose Export work archive before stopping. Your editor draft is kept.';post({type:'snapshot-ack',id:data.id,saved:false,message:workspaceError});}state();return;
  }
  if(data.id!==current?.id&&data.type!=='error')return;
  if(data.type==='phase'){if(current.kind!=='restore')current.phase=data.phase;state();}
  if(data.type==='output'&&current.kind==='run'){
    const lines=data.output.split('\n'), diagnostics=lines.filter(line=>line.startsWith('Measurement:'));
    results.set(current.probeID,{output:lines.filter(line=>!line.startsWith('Measurement:')&&!/^Building .+ with the Go compiler\.\.\.$/.test(line)).join('\n').trim(),diagnostics:diagnostics.join('\n'),status:''});renderResult();
  }
  if(data.type==='result'){
    const finished=current;
    if(!data.saved)workspaceError=data.saveError||'Project saving failed. Keep the runner open. In Runner tools and project backups, choose Export work archive before stopping.';
    if(finished.kind==='restore'){
      if(data.exitCode!==0){ready=false;restorationFailed=true;current=null;workspaceError='The saved project could not be restored. Its browser copy has been kept. Download saved project in Runner tools to keep a backup; then choose Start a fresh project if you want to replace that saved project. Editor drafts and results will be kept.';feedback(workspaceError);state();return;}
      ready=true;current=finished.queued||null;sendPending();
    } else {
      if(finished.kind==='run'){
        const result=results.get(finished.probeID)||{output:data.output};let stage='Program or compilation';try{const line=(result.diagnostics||data.output||'').split('\n').findLast(line=>line.startsWith('Measurement:'));const detail=JSON.parse(line.slice('Measurement:'.length));stage=detail.execution_stage==='compiling'?'Compilation':detail.execution_stage==='testing'?'Go tests':'Program';}catch{}result.status=data.cancelled?'Run stopped.':data.exitCode===0?'Finished. Exit code 0.':stage+' failed. Exit code '+data.exitCode+'. Inspect the errors below.';results.set(finished.probeID,result);save('result/'+finished.probeID,JSON.stringify(result));
      }
      current=null;activity();
      if((finished.kind==='stop'||finished.kind==='idle-stop')&&data.saved){stop();return;}
      if((finished.kind==='stop'||finished.kind==='idle-stop')&&!data.saved)feedback(workspaceError+' The runner is still running.');
    }state();
  }
  if(data.type==='error'){
    if(!data.id){current=null;stop();feedback(data.message+' Choose Run to retry.');return;}
    if(current?.kind==='run')results.set(current.probeID,{output:data.message,status:'The runner could not complete this request. Your editor draft is kept.'});
    current=null;feedback(data.message);state();
  }
});
$('theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('go-foundry-theme',document.documentElement.dataset.theme);}catch{}theme();};
function theme(){$('theme').textContent=document.documentElement.dataset.theme==='dark'?'Light theme':'Dark theme';}theme();
$('runner-tools-open').onclick=()=>{$('runner-dialog').close();if($('lesson-view').hidden){pendingTools=true;location.hash=activeLab?(lastInLab(activeLab)?.id||activeLab.lessons[0]):probe?.id||read('last-lesson',lessons[0].id);}else{$('runner-tools').open=true;$('runner-tools').scrollIntoView({block:'start'});$('runner-tools').querySelector('summary').focus({preventScroll:true});}};
$('runner-open').onclick=()=>{$('runner-dialog').showModal();state();};$('status-open').onclick=()=>$('status-dialog').showModal();document.querySelectorAll('dialog [data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
$('runner-dialog').querySelector('[data-start]').onclick=()=>{acknowledgeRunner();$('runner-dialog').close();start();};$('runner-dialog').querySelector('[data-stop]').onclick=requestStop;
$('linux-start').onclick=start;$('linux-stop').onclick=requestStop;$('keep-linux').onclick=()=>$('stop-dialog').close();$('confirm-stop').onclick=()=>{$('stop-dialog').close();if(!ready&&!current){stop();return;}checkpoint('stop');};
$('terminal-toggle').onclick=()=>terminalVisible($('terminal-region').classList.contains('terminal-closed'));
$('terminal-hide').onclick=()=>{terminalVisible(false);$('terminal-toggle').focus();};
$('fullscreen').onclick=()=>$('terminal').requestFullscreen().catch(()=>feedback('Full screen is unavailable. Use the embedded terminal.'));
$('idle-timeout').value=String(idleMinutes);$('idle-timeout').onchange=()=>{idleMinutes=Number($('idle-timeout').value);save('idle-minutes',String(idleMinutes));activity();};
function idleCheck(){if(frame&&ready&&!current&&!manualBusy&&idleMinutes&&Date.now()-lastActivity>=idleMinutes*60000)checkpoint('idle-stop');}
setInterval(idleCheck,15000);document.addEventListener('visibilitychange',idleCheck);
// Explicit archive tools still expose the terminal. They are outside the lesson's
// ordinary Run path and do not replace the automatic IndexedDB checkpoint.
for(const [id,target]of[['copy-setup','setup-command'],['copy-save','save-command'],['copy-restore','restore-command']])$(id).onclick=()=>{
  if(!ready||current){feedback('Start the runner and wait until it is Ready before using terminal tools.');return;}
  if(id==='copy-restore'&&!confirm('Replace the guest project with the uploaded archive? Export current work first if needed.'))return;
  terminalVisible(true);post({type:'command',command:$(target).textContent});activity();
};
$('fresh-project').onclick=async()=>{if(!restorationFailed||!confirm('Download the saved project first if you need a backup. Start fresh removes that saved Linux project and discards this guest session. Editor drafts, observations, results and completion marks are kept. Continue?'))return;try{await clearWorkspace();savedWorkspace=null;workspaceError='';stop();start();}catch(error){feedback(error.message+' The existing saved project has been kept.');}};
$('download-saved').onclick=async()=>{try{const snapshot=await loadWorkspace();if(!snapshot)throw Error('No project has been saved yet.');const url=URL.createObjectURL(new Blob([snapshot.bytes],{type:'application/gzip'})),link=document.createElement('a');link.href=url;link.download='go-foundry-work.tar.gz';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){feedback(error.message);}};
$('outline-toggle').onclick=()=>{const open=$('outline').hidden;$('outline').hidden=!open;$('outline-toggle').setAttribute('aria-expanded',String(open));};
for(const entry of probes){if(read('done/'+entry.id,'')==='true')done.add(entry.id);try{const result=JSON.parse(read('result/'+entry.id,'null'));if(result)results.set(entry.id,result);}catch{}}
buildNavigation();progress();
$('source-file').onchange=event=>showFile(event.target.value);
function updateLines(){
  const source=$('source').value,count=source.split('\n').length;$('line-numbers').textContent=Array.from({length:count},(_,index)=>index+1).join('\n');$('source').rows=Math.max(8,Math.min(18,count+1));paintSource($('source-highlight'),source);
  const definition=presentation[probe?.id],match=definition?.target.exec(source);$('show-target').textContent=definition?.label||'Show edit target';$('show-target').disabled=!match;$('target-status').textContent=match?'Target: line '+(source.slice(0,match.index).split('\n').length)+'.': 'The original edit target is no longer present in this draft.';syncEditorScroll();
}
function syncEditorScroll(){for(const id of ['source-highlight','line-numbers']){$(id).scrollTop=$('source').scrollTop;if(id==='source-highlight')$(id).scrollLeft=$('source').scrollLeft;}}
$('source').addEventListener('scroll',syncEditorScroll);
$('show-target').onclick=()=>{const match=presentation[probe?.id]?.target.exec($('source').value);if(!match)return;const start=$('source').value.lastIndexOf('\n',match.index-1)+1;let end=$('source').value.indexOf('\n',match.index);if(end<0)end=$('source').value.length;$('source').focus();$('source').setSelectionRange(start,end);const line=$('source').value.slice(0,start).split('\n').length-1;$('source').scrollTop=Math.max(0,(line-2)*parseFloat(getComputedStyle($('source')).lineHeight));syncEditorScroll();};
$('source').oninput=()=>{updateLines();const value=$('source').value;drafts.set(sourcePath,value);$('draft-status').textContent=save('source/'+sourcePath,value)?'Editor draft saved in this browser. Run compiles this editor text.':'Editor storage is unavailable. Download this draft before closing.';};
$('prediction').oninput=()=>{notes.set(probe.id,$('prediction').value);if(!save('notes/'+probe.id,$('prediction').value))feedback('Your observations are kept in this tab only. Copy them before closing.');};
$('complete').onchange=()=>{if($('complete').checked)done.add(probe.id);else done.delete(probe.id);const stored=save('done/'+probe.id,String($('complete').checked));if(stored)unsavedCompletion.delete(probe.id);else unsavedCompletion.add(probe.id);completionStatus();if(!stored)feedback('Completion is kept in this tab only.');progress();};
$('restore').onclick=()=>{undo=$('source').value;$('source').value=files[sourcePath];$('source').dispatchEvent(new Event('input'));$('undo').hidden=false;};$('undo').onclick=()=>{if(undo===null)return;$('source').value=undo;undo=null;$('source').dispatchEvent(new Event('input'));$('undo').hidden=true;};
$('download-source').onclick=()=>{const link=document.createElement('a'),url=URL.createObjectURL(new Blob([$('source').value],{type:'text/x-go'}));link.href=url;link.download=sourcePath.replaceAll('/','__');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let renderedURL='';
function renderRoute(){if(!image)return;const route=routes.resolve(location.href);if(location.href!==route.url)history.replaceState(null,'',route.url);if(renderedURL===route.url)return;renderedURL=route.url;show(route.id);}
addEventListener('hashchange',renderRoute);addEventListener('popstate',renderRoute);
document.addEventListener('click',event=>{
  const link=event.target.closest?.('a');
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||!routes.handles(link.href))return;
  event.preventDefault();if(link.href!==location.href)history.pushState(null,'',link.href);renderRoute();
});
addEventListener('storage',event=>{if(!event.key?.startsWith(prefix+'done/'))return;const id=event.key.slice((prefix+'done/').length);if(event.newValue==='true')done.add(id);else done.delete(id);unsavedCompletion.delete(id);if(probe?.id===id){$('complete').checked=done.has(id);completionStatus();}progress();});
new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',document.querySelector('header').getBoundingClientRect().height+'px')).observe(document.querySelector('header'));
addEventListener('beforeunload',event=>{if(frame){event.preventDefault();event.returnValue='';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('feedback').hidden=true;if(!$('outline').hidden&&($('outline').contains(event.target)||event.target===$('outline-toggle')))closeOutline(true);}});
async function init(){
  try {
    const responses=await Promise.all(['sources.json','runtime/image.json','version.json'].map(async name=>{const response=await fetch(new URL(name,siteURL));if(!response.ok)throw Error(name+' could not load.');return response.json();}));
    [files,image]=responses;$('source').disabled=false;const version=responses[2];for(const name of Object.keys(files)){const option=document.createElement('option');option.value=name;option.textContent=name;$('source-file').append(option);}
    $('external-linux').href=new URL(image.terminal_url,siteURL).href;$('setup-command').textContent='cd /root/work/go-foundry && go version';
    document.querySelectorAll('[data-series-home]').forEach(link=>link.href=routes.home());
    $('version').textContent=JSON.stringify({commit:version.commit,go:image.go_version,toolchain_image:image.id,image_total_bytes:image.bytes,note:'All runtime assets are served by this course. No verified offline copy is offered yet.'},null,2);renderRoute();state();
  }catch(error){feedback('Course files could not be loaded. Reload while online. Your drafts are kept.');$('linux-start').disabled=true;}
  try{const result=await fetch(new URL('validation.json',siteURL)).then(response=>response.json());$('evidence-summary').textContent=result.summary;const table=document.createElement('table');for(const rowData of [['Check','Observed wait','Result'],...(result.results||[]).map(row=>[row.name,row.host_seconds==null?'Not measured':row.host_seconds.toFixed(2)+' seconds',row.status])]){const row=document.createElement('tr');for(const value of rowData){const cell=document.createElement(table.children.length?'td':'th');cell.textContent=value;row.append(cell);}table.append(row);}$('timings').append(table);}catch{$('evidence-summary').textContent='No published runtime measurements are available.';}
}
init();
