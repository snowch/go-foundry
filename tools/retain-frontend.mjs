import {valid} from './frontend-paths.mjs';
// Keep immutable frontend/runtime graphs and the legacy guest used by existing sessions.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname} from 'node:path';
const site='.build/site',base=process.env.COURSE_PUBLIC_URL||'https://snowch.github.io/go-foundry/';
const current=JSON.parse(await readFile(site+'/frontend.json','utf8'));
async function remote(path){const response=await fetch(new URL(path+'?verify='+Date.now(),base),{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('Previous release '+path+': HTTP '+response.status);return Buffer.from(await response.arrayBuffer());}
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
let restored=false;
async function restoreArtifact(){
 if(restored)return;restored=true;
 // A warm Actions cache usually supplies these files. Its absence must not silently
 // discard an old guest: recover the exact currently published Pages artifact.
 const version=JSON.parse(await remote('version.json'));
 if(!/^[a-f0-9]{40}$/.test(version.commit))throw Error('Invalid published commit');
 const artifacts=JSON.parse(execFileSync('gh',['api','repos/snowch/go-foundry/actions/artifacts?per_page=100'],{encoding:'utf8'}));
 const artifact=artifacts.artifacts.find(a=>a.name==='github-pages'&&!a.expired&&a.workflow_run?.head_sha===version.commit);
 if(!artifact)throw Error('No retained published artifact. Preserve the old runtime before publishing.');
 await mkdir('.cache/previous-release',{recursive:true});
 const archive=execFileSync('gh',['api','repos/snowch/go-foundry/actions/artifacts/'+artifact.id+'/zip'],{maxBuffer:1024*1024*1024,stdio:['ignore','pipe','pipe']});
 await writeFile('.cache/previous-release/artifact.zip',archive);
 execFileSync('python',['-c',`import zipfile,tarfile,pathlib,shutil
root=pathlib.Path('.cache/previous-release')
with zipfile.ZipFile(root/'artifact.zip') as z:
 names=z.namelist()
 if names!=['artifact.tar']:raise ValueError('Unexpected Pages archive')
 with z.open('artifact.tar') as src,(root/'artifact.tar').open('wb') as dst:shutil.copyfileobj(src,dst)
with tarfile.open(root/'artifact.tar') as t:
 for m in t:
  name=m.name.removeprefix('./')
  if m.isfile() and (name.startswith('runtime/images/') or name.startswith('linux/releases/')) and '..' not in pathlib.Path(name).parts:
   p=pathlib.Path('.build/site')/name
   if not p.exists():
    p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(t.extractfile(m).read())
`],{stdio:'inherit'});
}

async function retain(file){
 if(!valid(file.path)||!Number.isSafeInteger(file.bytes)||file.bytes<0||!/^[a-f0-9]{64}$/.test(file.sha256))throw Error('Invalid retained file');
 let bytes;
 try{bytes=await readFile(site+'/'+file.path)}catch{
  if(file.path.startsWith('runtime/images/')){try{await restoreArtifact();bytes=await readFile(site+'/'+file.path)}catch{bytes=await remote(file.path)}}else bytes=await remote(file.path);
 }
 if(bytes.length!==file.bytes||digest(bytes)!==file.sha256)throw Error('Previous release integrity failure: '+file.path);
 await mkdir(dirname(site+'/'+file.path),{recursive:true});await writeFile(site+'/'+file.path,bytes);
}
const response=await fetch(new URL('frontend.json?verify='+Date.now(),base),{signal:AbortSignal.timeout(30000)});
if(response.status===404){
 for(const path of['app.js','style.css'])if(!(await remote(path)).equals(await readFile(site+'/'+path)))throw Error('Original compatibility alias changed: '+path);
}else{
 if(!response.ok)throw Error('Previous frontend manifest: HTTP '+response.status);
 const previous=await response.json();if(previous.version!==1||!Array.isArray(previous.current?.files))throw Error('Invalid previous frontend manifest');
 const cohorts=[previous.current,...(previous.previous||[])].filter(x=>JSON.stringify(x)!==JSON.stringify(current.current)).slice(0,2);
 for(const cohort of cohorts)for(const file of cohort.files)await retain(file);
 current.previous=cohorts;current.legacy=previous.legacy||[];
 if(!current.legacy.length){
  const image=JSON.parse(await remote('runtime/image.json'));
  if(image.format==='tinyemu-httpfs-v1'){
   const prefix='runtime/images/'+image.id+'/',bytes=await remote(prefix+'manifest.json'),manifest=JSON.parse(bytes);
   if(manifest.id!==image.id||!Array.isArray(manifest.files))throw Error('Invalid legacy guest manifest');
   current.legacy=manifest.files.map(file=>({...file,path:prefix+file.path}));
   current.legacy.push({path:prefix+'manifest.json',bytes:bytes.length,sha256:digest(bytes)});
  }
 }
 for(let index=0;index<current.legacy.length;index+=16)await Promise.all(current.legacy.slice(index,index+16).map(retain));
 // Only cached legacy frontends use this configuration. New sessions use v86.
 if(current.legacy.length)await writeFile(site+'/linux.cfg',await remote('linux.cfg'));
 console.log('Retained '+cohorts.length+' previous graphs and '+current.legacy.length+' legacy guest files.');
}
await writeFile(site+'/frontend.json',JSON.stringify(current,null,2)+'\n');
