// Retain two small frontend graphs so cached HTML can still load its modules.
import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const site='.build/site',base=process.env.COURSE_PUBLIC_URL||'https://snowch.github.io/go-foundry/';
const current=JSON.parse(await readFile(site+'/frontend.json','utf8'));
async function remote(path){const response=await fetch(new URL(path+'?verify='+Date.now(),base),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Previous frontend '+path+': HTTP '+response.status);return Buffer.from(await response.arrayBuffer());}
const response=await fetch(new URL('frontend.json?verify='+Date.now(),base),{signal:AbortSignal.timeout(30000)});
if(response.status===404){
 // First adoption: preserve the exact original root aliases used by old HTML.
 for(const path of['app.js','style.css']){const published=await remote(path),legacy=await readFile(site+'/'+path);if(!published.equals(legacy))throw Error('Original '+path+' changed; reconcile cached-HTML compatibility before publishing.');}
 console.log('Verified original frontend aliases for first adoption.');
}else{
 if(!response.ok)throw Error('Previous frontend manifest: HTTP '+response.status);
 const previous=await response.json();if(previous.version!==1||!Array.isArray(previous.current?.files))throw Error('Invalid previous frontend manifest');
 const cohorts=[previous.current,...(previous.previous||[])].filter(x=>JSON.stringify(x)!==JSON.stringify(current.current)).slice(0,2);
 for(const cohort of cohorts)for(const file of cohort.files){if(!/^(app|source-transfer|style)\.[a-f0-9]{16}\.(js|css)$/.test(file.path))throw Error('Unexpected frontend path');let bytes;try{bytes=await readFile(site+'/'+file.path);}catch{bytes=await remote(file.path);}if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Previous frontend integrity failure: '+file.path);await writeFile(site+'/'+file.path,bytes);}
 current.previous=cohorts;console.log('Retained '+cohorts.length+' previous frontend graphs.');
}
await writeFile(site+'/frontend.json',JSON.stringify(current,null,2)+'\n');
