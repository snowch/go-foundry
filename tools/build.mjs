import{createHash}from'node:crypto';
import{cp,mkdir,readFile,readdir,writeFile,rm}from'node:fs/promises';import{execFileSync}from'node:child_process';
const site='.build/site';await mkdir(site,{recursive:true});await cp('web',site,{recursive:true});
execFileSync('python',['tools/local-linux/build.py','go',site+'/linux'],{stdio:'inherit'});
await mkdir(site+'/runtime',{recursive:true});await cp(site+'/linux/runtime/image.json',site+'/runtime/image.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const assets=[];
// Pin the whole Linux graph: a deployment during boot cannot mix guest chunks.
const linuxFiles=[];
async function linuxGraph(folder){for(const item of await readdir(folder,{withFileTypes:true})){if(item.name==='releases')continue;const path=folder+'/'+item.name;if(item.isDirectory())await linuxGraph(path);else{const bytes=await readFile(path);linuxFiles.push({path:path.slice((site+'/linux/').length),sha256:hash(bytes),bytes:bytes.length});}}}
await linuxGraph(site+'/linux');linuxFiles.sort((a,b)=>a.path.localeCompare(b.path));
const linuxID=hash(JSON.stringify(linuxFiles)),linuxPrefix='linux/releases/'+linuxID+'/';
for(const file of linuxFiles){const target=site+'/'+linuxPrefix+file.path;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await cp(site+'/linux/'+file.path,target);assets.push({...file,path:linuxPrefix+file.path});}
await writeFile(site+'/linux/index.html','<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=releases/'+linuxID+'/index.html"><title>Opening Linux</title><a href="releases/'+linuxID+'/index.html">Open the Linux terminal</a>');
const runtimeMetadata=JSON.parse(await readFile(site+'/runtime/image.json'));runtimeMetadata.terminal_url=linuxPrefix+'index.html';await writeFile(site+'/runtime/image.json',JSON.stringify(runtimeMetadata,null,2)+'\n');

async function asset(stem,extension,content){const bytes=Buffer.from(content),name=stem+'.'+hash(bytes).slice(0,16)+'.'+extension;await writeFile(site+'/'+name,bytes);assets.push({path:name,sha256:hash(bytes),bytes:bytes.length});return name;}
const helper=await asset('source-transfer','js',await readFile('web/source-transfer.js'));
const app=await asset('app','js',(await readFile('web/app.js','utf8')).replace('./source-transfer.js','./'+helper));
const css=await asset('style','css',await readFile('web/style.css'));
await writeFile(site+'/index.html',(await readFile('web/index.html','utf8')).replace('src="app.js"','src="'+app+'"').replace('href="style.css"','href="'+css+'"'));
await cp('web/compat/app.js',site+'/app.js');await cp('web/compat/style.css',site+'/style.css');await rm(site+'/compat',{recursive:true,force:true});
await writeFile(site+'/frontend.json',JSON.stringify({version:1,current:{files:assets},previous:[]},null,2)+'\n');
const files={};async function collect(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory()){if(item.name!=='testdata')await collect(path);}else if(path.endsWith('.go')&&!path.endsWith('/migrate_test.go'))files[path]=await readFile(path,'utf8');}}await collect('cmd');await collect('internal');await writeFile(site+'/sources.json',JSON.stringify(files));
const image=JSON.parse(await readFile(site+'/runtime/image.json'));
await mkdir(site+'/downloads',{recursive:true});execFileSync('python',['tools/bundle.py'],{stdio:'inherit'});await cp('.build/go-foundry-prototype.tar.gz',site+'/downloads/go-foundry-prototype.tar.gz');
try{await cp('docs/validation.json',site+'/validation.json');}catch{await writeFile(site+'/validation.json',JSON.stringify({summary:'Live validation is pending. This prototype is not yet claimed to work.',results:[]}));}

await mkdir(site+'/downloads/sources',{recursive:true});
await writeFile(site+'/version.json',JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),go:image.go_version,image:image.id}));await cp('THIRD_PARTY.md',site+'/notices.txt');console.log('Built prototype and pinned image '+image.id);
