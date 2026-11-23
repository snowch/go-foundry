import {loadWorkspace, saveWorkspace} from './workspace-store.js';
import {lessons} from './course.js';
import {investigations} from './investigations.js';
const $=id=>document.getElementById(id), prefix='go-foundry:v1:', drafts=new Map(), notes=new Map(), done=new Set(), results=new Map();
const probes=[...lessons,...investigations];
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
  $('runner-state').textContent=active?(current?phaseLabel(current.phase):(ready?(manualBusy?'Terminal command active':'Ready'):'Starting')):'Stopped';
  $('runner-description').textContent=active?(ready?'The runner is ready for another run.':'The runner is loading or restoring your saved project.'):'The runner starts when you choose Run.';
  $('linux-start').hidden=active;$('linux-start').disabled=!image||busy;
  $('linux-stop').hidden=!active;$('linux-stop').disabled=busy;
  $('runner-dialog').querySelector('[data-start]').disabled=active||!image||busy;
  $('runner-dialog').querySelector('[data-stop]').disabled=!active||busy;
  $('workspace-status').textContent=workspaceError|| (savedWorkspace?'Project files and data are saved in this browser.':'Project files and data will be saved in this browser after each run.');
  $('workspace-status').dataset.error=String(!!workspaceError);
  renderResult();
}
function phaseLabel(phase){return ({starting:'Starting',restoring:'Restoring project',compiling:'Compiling',running:'Running',testing:'Running tests',saving:'Saving project',stopping:'Stopping run'})[phase]||'Working';}
function renderResult(){
  if(!probe)return;
  const result=results.get(probe.id), running=current?.probeID===probe.id;
  $('job-status').textContent=running?phaseLabel(current.phase)+'…':(result?.status||'Ready. Choose Run to compile and execute the editor source.');
  $('job-output').textContent=result?.output|| (running?'Waiting for program output…':'Program output and compiler errors appear here.');
  $('job-diagnostics').textContent=result?.diagnostics||'No execution measurements yet.';
  $('output-caption').hidden=!result||!!running;$('job-result').setAttribute('aria-busy',String(!!running));
}
function terminalVisible(open){$('terminal-region').classList.toggle('terminal-closed',!open);$('terminal-region').inert=!open;$('terminal-region').setAttribute('aria-hidden',String(!open));$('terminal-toggle').setAttribute('aria-expanded',String(open));$('terminal-toggle').textContent=open?'Hide Linux terminal':'Open Linux terminal';if(open){start();$('terminal-region').scrollIntoView({block:'start'});}}
async function acquireLease(){
  if(!navigator.locks)throw Error('This browser cannot safely coordinate saved Linux sessions across tabs. Use a current browser. Your editor drafts are kept.');
  return new Promise((resolve,reject)=>{navigator.locks.request('go-foundry-workspace-session',{ifAvailable:true},lock=>{
    if(!lock){reject(Error('The runner is open in another Go Foundry tab. Stop it there before starting here.'));return;}
    return new Promise(release=>{releaseLock=release;resolve();});
  }).catch(reject);});
}
let starting=false;
async function start(){
  if(frame||starting)return;
  if(!image){feedback('Toolchain files could not be loaded. Reload while online. Your drafts are kept.');return;}
  starting=true;
  try {
    await acquireLease();
    try {savedWorkspace=await loadWorkspace();workspaceError='';}catch{workspaceError='Browser project storage is unavailable. Keep the runner open and export a work archive before stopping.';}
    frame=document.createElement('iframe');frame.title='Optional Go Foundry Linux terminal';frame.src=$('external-linux').href;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads');frame.setAttribute('allow','fullscreen');frame.allowFullscreen=true;$('terminal').append(frame);
    $('session-state').textContent='Starting the runner. Your editor text has been kept.';activity();state();
  } catch(error){releaseLock?.();releaseLock=null;current=null;feedback(error.message);state();}
  finally{starting=false;}
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
function showFile(path){if(!Object.hasOwn(files,path))return;sourcePath=path;$('source-file').value=path;const saved=drafts.get(path)??read('source/'+path,null);$('source').value=saved??files[path];$('source-name').textContent=path;updateLines();$('draft-status').textContent=saved===null?'Starter source is open.':'A saved edit is open. To use the starter, choose Editor tools → Restore original source. Undo restore keeps your edit available.';undo=null;$('undo').hidden=true;}
function show(id){
  probe=probes.find(item=>item.id===id)||probes[0];
  for(const [target,field]of[['check-title','title'],['purpose','purpose'],['action','action'],['run-command','command'],['observe','observe'],['reference-output','reference']])$(target).textContent=probe[field];
  $('explanation').replaceChildren();for(const text of (probe.explanation||'').split('\n\n')){const paragraph=document.createElement('p');paragraph.textContent=text;$('explanation').append(paragraph);}$('explanation').hidden=!probe.explanation;
  $('breadcrumb').textContent=(probe.chapter||'Runtime investigations')+' / '+probe.title;
  const references=probe.chapter?.startsWith('1')?[['Printing with fmt.Println','https://pkg.go.dev/fmt#Println'],['Go program structure','https://go.dev/ref/spec#Program_execution']]:probe.chapter?.startsWith('2')?[['Go variable declarations','https://go.dev/ref/spec#Variable_declarations'],['Go types and operators','https://go.dev/ref/spec#Types']]:probe.chapter?.startsWith('3')?[['Go if statements','https://go.dev/ref/spec#If_statements'],['Go for loops','https://go.dev/ref/spec#For_statements']]:[['Go tests','https://pkg.go.dev/testing'],['Go file operations','https://pkg.go.dev/os']];$('references').replaceChildren();for(const [label,url]of references){const item=document.createElement('li'),link=document.createElement('a');link.href=url;link.textContent=label+' (new tab)';link.target='_blank';link.rel='noopener';item.append(link);$('references').append(item);}
  $('prediction').value=notes.get(probe.id)??read('notes/'+probe.id,'');$('complete').checked=done.has(probe.id);
  $('next-lesson').hidden=!probe.next;$('next-lesson').href='#'+(probe.next||'');$('next-lesson').textContent='Next: '+(probes.find(item=>item.id===probe.next)?.title||'');
  document.querySelectorAll('#outline a').forEach(link=>{if(link.hash==='#'+probe.id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});showFile(probe.file);$('outline').hidden=true;$('outline-toggle').setAttribute('aria-expanded','false');renderResult();
}
function progress(){$('progress').textContent=lessons.filter(item=>done.has(item.id)).length+' / '+lessons.length+' lessons complete';}
function sendPending(){if(ready&&frame&&current&&current.phase==='starting'){current.phase='compiling';post({...current,type:'job'});state();}}
function queueRun(){
  if(current||manualBusy){feedback('Wait for the current run or terminal command to finish.');return;}
  activity();current={id:crypto.randomUUID(),type:'job',kind:'run',probeID:probe.id,path:'/root/work/go-foundry/'+sourcePath,source:$('source').value,command:probe.command,phase:ready?'compiling':'starting'};
  results.set(probe.id,{output:'',diagnostics:'',status:''});
  if(frame&&ready)post(current);else start();state();
}
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
      if(data.exitCode!==0){ready=false;restorationFailed=true;current=null;workspaceError='The saved project could not be restored. Its browser copy has been kept. Download saved project in Runner tools to keep a backup; use the optional terminal to inspect or restore your files.';feedback(workspaceError);state();return;}
      ready=true;current=finished.queued||null;sendPending();
    } else {
      if(finished.kind==='run'){
        const result=results.get(finished.probeID)||{output:data.output};result.status=data.cancelled?'Run stopped.':data.exitCode===0?'Finished. Exit code 0.':'Program or compilation failed. Exit code '+data.exitCode+'. Inspect the errors below.';results.set(finished.probeID,result);save('result/'+finished.probeID,JSON.stringify(result));
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
$('runner-open').onclick=()=>{$('runner-dialog').showModal();state();};$('status-open').onclick=()=>$('status-dialog').showModal();document.querySelectorAll('dialog [data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
$('runner-dialog').querySelector('[data-start]').onclick=()=>{$('runner-dialog').close();start();};$('runner-dialog').querySelector('[data-stop]').onclick=requestStop;
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
$('download-saved').onclick=async()=>{try{const snapshot=await loadWorkspace();if(!snapshot)throw Error('No project has been saved yet.');const url=URL.createObjectURL(new Blob([snapshot.bytes],{type:'application/gzip'})),link=document.createElement('a');link.href=url;link.download='go-foundry-work.tar.gz';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){feedback(error.message);}};
$('outline-toggle').onclick=()=>{const open=$('outline').hidden;$('outline').hidden=!open;$('outline-toggle').setAttribute('aria-expanded',String(open));};
let chapter='';for(const entry of probes){if(read('done/'+entry.id,'')==='true')done.add(entry.id);try{const result=JSON.parse(read('result/'+entry.id,'null'));if(result)results.set(entry.id,result);}catch{}const group=entry.chapter||'Runtime investigations';if(group!==chapter){const title=document.createElement('h3');title.textContent=group;$('outline').append(title);chapter=group;}const link=document.createElement('a');link.href='#'+entry.id;link.textContent=entry.title;$('outline').append(link);}progress();
$('source-file').onchange=event=>showFile(event.target.value);
function updateLines(){const count=$('source').value.split('\n').length;$('line-numbers').textContent=Array.from({length:count},(_,index)=>index+1).join('\n');$('source').rows=Math.max(8,Math.min(18,count+1));$('line-numbers').scrollTop=$('source').scrollTop;}
$('source').addEventListener('scroll',()=>$('line-numbers').scrollTop=$('source').scrollTop);
$('source').oninput=()=>{updateLines();const value=$('source').value;drafts.set(sourcePath,value);$('draft-status').textContent=save('source/'+sourcePath,value)?'Editor draft saved in this browser. Run compiles this editor text.':'Editor storage is unavailable. Download this draft before closing.';};
$('prediction').oninput=()=>{notes.set(probe.id,$('prediction').value);if(!save('notes/'+probe.id,$('prediction').value))feedback('Your observations are kept in this tab only. Copy them before closing.');};
$('complete').onchange=()=>{if($('complete').checked)done.add(probe.id);else done.delete(probe.id);if(!save('done/'+probe.id,String($('complete').checked)))feedback('Completion is kept in this tab only.');progress();};
$('restore').onclick=()=>{undo=$('source').value;$('source').value=files[sourcePath];$('source').dispatchEvent(new Event('input'));$('undo').hidden=false;};$('undo').onclick=()=>{if(undo===null)return;$('source').value=undo;undo=null;$('source').dispatchEvent(new Event('input'));$('undo').hidden=true;};
$('download-source').onclick=()=>{const link=document.createElement('a'),url=URL.createObjectURL(new Blob([$('source').value],{type:'text/x-go'}));link.href=url;link.download=sourcePath.replaceAll('/','__');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
addEventListener('hashchange',()=>show(location.hash.slice(1)));
addEventListener('beforeunload',event=>{if(frame){event.preventDefault();event.returnValue='';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('feedback').hidden=true;if(!$('outline').hidden){$('outline').hidden=true;$('outline-toggle').setAttribute('aria-expanded','false');$('outline-toggle').focus();}}});
async function init(){
  try {
    const responses=await Promise.all(['sources.json','runtime/image.json','version.json'].map(async name=>{const response=await fetch(name);if(!response.ok)throw Error(name+' could not load.');return response.json();}));
    [files,image]=responses;const version=responses[2];for(const name of Object.keys(files)){const option=document.createElement('option');option.value=name;option.textContent=name;$('source-file').append(option);}
    $('external-linux').href=new URL(image.terminal_url,location.href).href;$('setup-command').textContent='cd /root/work/go-foundry && go version';
    $('version').textContent=JSON.stringify({commit:version.commit,go:image.go_version,toolchain_image:image.id,image_total_bytes:image.bytes,note:'All runtime assets are served by this course. No verified offline copy is offered yet.'},null,2);show(location.hash.slice(1));state();
  }catch(error){feedback('Course files could not be loaded. Reload while online. Your drafts are kept.');$('linux-start').disabled=true;}
  try{const result=await fetch('validation.json').then(response=>response.json());$('evidence-summary').textContent=result.summary;const table=document.createElement('table');for(const rowData of [['Check','Observed wait','Result'],...(result.results||[]).map(row=>[row.name,row.host_seconds==null?'Not measured':row.host_seconds.toFixed(2)+' seconds',row.status])]){const row=document.createElement('tr');for(const value of rowData){const cell=document.createElement(table.children.length?'td':'th');cell.textContent=value;row.append(cell);}table.append(row);}$('timings').append(table);}catch{$('evidence-summary').textContent='No published runtime measurements are available.';}
}
init();
