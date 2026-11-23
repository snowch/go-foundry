import {Terminal} from './vendor/xterm.mjs';
import {FitAddon} from './vendor/addon-fit.mjs';
import {V86} from './runtime/libv86.mjs';
import {quote, validateJob, jobScript, cancelScript, archiveLimit, workspace} from './jobs.mjs';
const $ = id => document.getElementById(id);
const term = new Terminal({convertEol:true,fontSize:15,scrollback:4000,theme:{background:'#101d1b',foreground:'#e0ece7'}}), fit = new FitAddon();
term.loadAddon(fit); term.open($('terminal'));
new ResizeObserver(() => { if ($('terminal').clientWidth && $('terminal').clientHeight) fit.fit(); }).observe($('terminal'));
let transcript='', vm, ready=false, exportLine='', counter=0, active=null, uploadBusy=false, manualBusy=false;
const encoder=new TextEncoder(), decoder=new TextDecoder(), acknowledgements=new Map();
globalThis.foundryLinux={getTranscript:()=>transcript};
const notify=(type, detail={}, transfer=[]) => { if(parent!==self) parent.postMessage({channel:'foundry-linux',type,...detail},location.origin,transfer); };
function status(message) { $('status').textContent=message; notify('status',{message}); }
async function download(name) {
  const data=await vm.read_file(name), url=URL.createObjectURL(new Blob([data]));
  const link=document.createElement('a'); link.href=url; link.download=name.replace(/^export-\d+-/,''); link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function boot() {
  try {
    status('Loading Linux files…'); const response=await fetch('./runtime/parts.json'); if(!response.ok)throw Error('Linux manifest is missing.');
    const manifest=await response.json(), image=new Uint8Array(manifest.bytes); let loaded=0;
    for(let i=0;i<manifest.parts.length;i+=3) await Promise.all(manifest.parts.slice(i,i+3).map(async(name,j)=>{
      const response=await fetch('./runtime/'+name); if(!response.ok)throw Error('Linux file could not load: '+name);
      const bytes=new Uint8Array(await response.arrayBuffer()); image.set(bytes,(i+j)*16777216); loaded+=bytes.length;
      status('Loading Linux files · '+Math.round(loaded*100/image.length)+'%');
    }));
    if(loaded!==image.length)throw Error('Linux image is incomplete.'); status('Starting Linux…');
    vm=new V86({wasm_path:'./runtime/v86.wasm',bios:{url:'./runtime/seabios.bin'},vga_bios:{url:'./runtime/vgabios.bin'},bzimage:{url:'./runtime/vmlinuz-virt'},initrd:{buffer:image.buffer},cmdline:'console=ttyS0,115200 rdinit=/init rootfstype=ramfs nokaslr panic=1 quiet',memory_size:manifest.memory_mib*1048576,filesystem:{},autostart:true,disable_keyboard:true,disable_mouse:true});
    let recent=''; vm.add_listener('serial0-output-byte',byte=>{
      term.write(Uint8Array.of(byte)); const c=String.fromCharCode(byte); transcript=(transcript+c).slice(-200000); recent=(recent+c).slice(-500);
      if(manualBusy&&/foundry:[^\r\n]*# $/.test(recent)){manualBusy=false;notify('terminal-busy',{busy:false});}
      if(!ready&&recent.includes('LAB_READY')&&recent.includes('foundry:~# ')) {ready=true;status('Linux is ready.');notify('ready');}
      if(recent.includes('LAB_EXCHANGE_FAILED'))status('Linux could not prepare its file share. Reload this terminal to retry.');
      if(byte===10) { const match=exportLine.trim().match(/^__FOUNDRY_EXPORT__:(export-\d+-[A-Za-z0-9_.-]+)$/); exportLine=''; if(match)download(match[1]).catch(error=>status('Export failed: '+error.message)); }
      else if(byte!==13)exportLine=(exportLine+c).slice(-500);
    });
    term.onData(data=>{if(/^\x1b\[[?>]?[\d;]*[Rc]$/.test(data)){vm.serial0_send(data);return;}if(!active&&!uploadBusy){manualBusy=true;recent='';notify('terminal-busy',{busy:true});vm.serial0_send(data);notify('activity');}else status('A job is active. Use Stop run in the lesson before entering terminal commands.');});
  } catch(error) {status('Could not start Linux. '+error.message+' Your browser drafts are kept.');$('retry').hidden=false;notify('error',{message:error.message});}
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function read(name) { try{return await vm.read_file(name);}catch{return null;} }
async function text(name) {const bytes=await read(name);return bytes===null?null:decoder.decode(bytes);}
async function checkpoint(id, stem) {
  const bytes=await read(stem+'.archive');
  if(await text(stem+'.saved')!=='0'||!bytes)throw Error('The project archive could not be created.');
  if(bytes.length>archiveLimit)throw Error('The project archive exceeds 32 MB. Export it using the terminal before stopping.');
  const buffer=bytes.slice().buffer;
  const confirmed=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{acknowledgements.delete(id);reject(Error('The browser did not confirm that the project was saved.'));},45000);
    acknowledgements.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value);},reject:error=>{clearTimeout(timeout);reject(error);}});
  });
  notify('snapshot',{id,bytes:buffer},[buffer]); await confirmed;
}
async function run(data) {
  validateJob(data); if(active||uploadBusy||manualBusy)throw Error('Wait for the current job or terminal command to finish.');
  const stem='job-'+data.id, path='/exchange/'+stem;
  active={id:data.id,stem,cancelled:false}; $('upload').disabled=true; notify('phase',{id:data.id,phase:data.type==='restore'?'restoring':data.type==='checkpoint'?'saving':'compiling'});
  try {
    if(data.source!==undefined)await vm.create_file(stem+'.source',encoder.encode(data.source));
    await vm.create_file(stem+'.sh',encoder.encode(jobScript(data)));
    vm.serial0_send('sh '+quote(path+'.sh')+' >/dev/null 2>&1 & echo $! >'+quote(path+'.pid')+'\n');
    let previous='', previousPhase='', exit=null;
    while(exit===null) {
      await wait(300);
      const phase=await text(stem+'.phase'); if(phase&&phase!==previousPhase){previousPhase=phase;notify('phase',{id:data.id,phase});}
      const output=await text(stem+'.output'); if(output!==null&&output!==previous){previous=output;notify('output',{id:data.id,output:output.slice(-200000)});}
      exit=await text(stem+'.exit');
    }
    const output=(await text(stem+'.output')||'').slice(-200000); notify('output',{id:data.id,output});
    let saved=true, saveError='';
    try {if(data.type==='restore'&&Number(exit)!==0)throw Error('The saved project could not be restored; the previous browser snapshot has been kept.');await checkpoint(data.id,stem);}catch(error){saved=false;saveError=error.message;}
    notify('result',{id:data.id,exitCode:Number(exit),cancelled:active.cancelled,output,saved,saveError});
    status(saved?'Project saved in this browser.':'Project was not saved. Keep Linux running and export your work.');
    // Remove share files after persistence is acknowledged, including source and
    // compiler output. Repeated runs must not retain an archive per run in RAM.
    vm.serial0_send('rm -f '+quote(path)+'.*\n');
  } finally {active=null;$('upload').disabled=false;}
}
$('retry').onclick=()=>location.reload();
$('upload').onchange=async event=>{
  if(!ready||active||uploadBusy){status('Wait until the runner is ready before uploading.');return;}
  uploadBusy=true;
  try {for(const file of event.target.files){if(file.size>archiveLimit)throw Error('Choose a file no larger than 32 MB.');if(!/^[A-Za-z0-9_. ()-]+$/.test(file.name))throw Error('Use a filename containing letters, numbers, spaces, dots, hyphens or underscores.');const name='upload-'+(++counter);await vm.create_file(name,new Uint8Array(await file.arrayBuffer()));vm.serial0_send('cp '+quote('/exchange/'+name)+' '+quote('/root/'+file.name)+'\n');}status('File uploaded to /root.');notify('activity');}
  catch(error){status(error.message);}finally{uploadBusy=false;event.target.value='';}
};
addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.channel!=='foundry-linux')return;
  const data=event.data;
  if(data.type==='snapshot-ack') {const ack=acknowledgements.get(data.id);if(ack){acknowledgements.delete(data.id);data.saved?ack.resolve():ack.reject(Error(data.message||'Browser storage is unavailable.'));}return;}
  try {
    if(!ready)throw Error('Wait until Linux is ready.');
    if(data.type==='job'||data.type==='checkpoint')await run(data);
    else if(data.type==='restore') {
      if(!(data.bytes instanceof ArrayBuffer)||data.bytes.byteLength>archiveLimit)throw Error('The saved workspace is invalid.');
      if(active)throw Error('A job is already active.');
      await vm.create_file('restore-workspace.tar.gz',new Uint8Array(data.bytes));
      await run({...data,command:'tar xzf /exchange/restore-workspace.tar.gz -C /root/work',source:undefined});
      vm.serial0_send('rm -f /exchange/restore-workspace.tar.gz\n');
    } else if(data.type==='cancel'&&active?.id===data.id&&!active.cancelled) {
      if(await text(active.stem+'.exit')!==null)return;active.cancelled=true; await vm.create_file(active.stem+'.cancel',encoder.encode(cancelScript(data.id)));
      vm.serial0_send('sh '+quote('/exchange/'+active.stem+'.cancel')+'\n');
    } else if(data.type==='apply') {
      // Retained frontend compatibility; current lessons use structured jobs.
      validateJob({...data,id:String(data.id)}); const name='editor-'+(++counter);await vm.create_file(name,encoder.encode(data.source));vm.serial0_send('cp '+quote('/exchange/'+name)+' '+quote(data.path)+' && '+data.command+'\n');notify('submitted',{id:data.id,path:data.path});
    } else if(data.type==='command'&&typeof data.command==='string'&&data.command.length<=8000) {if(active||manualBusy)throw Error('Wait for the current job or terminal command to finish.');manualBusy=true;notify('terminal-busy',{busy:true});vm.serial0_send(data.command+'\n');notify('activity');}
  } catch(error){notify('error',{id:data.id,message:error.message});status(error.message);}
});
boot();
