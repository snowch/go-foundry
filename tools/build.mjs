import{createHash}from'node:crypto';
import{cp,mkdir,readFile,readdir,writeFile,rm}from'node:fs/promises';import{execFileSync}from'node:child_process';
const site='.build/site';await mkdir(site,{recursive:true});await cp('web',site,{recursive:true});
try{await readFile(site+'/runtime/image.json');}catch{execFileSync('python',['tools/build-image.py'],{stdio:'inherit'});}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const assets=[];
async function asset(stem,extension,content){const bytes=Buffer.from(content),name=stem+'.'+hash(bytes).slice(0,16)+'.'+extension;await writeFile(site+'/'+name,bytes);assets.push({path:name,sha256:hash(bytes),bytes:bytes.length});return name;}
const helper=await asset('source-transfer','js',await readFile('web/source-transfer.js'));
const app=await asset('app','js',(await readFile('web/app.js','utf8')).replace('./source-transfer.js','./'+helper));
const css=await asset('style','css',await readFile('web/style.css'));
await writeFile(site+'/index.html',(await readFile('web/index.html','utf8')).replace('src="app.js"','src="'+app+'"').replace('href="style.css"','href="'+css+'"'));
await cp('web/compat/app.js',site+'/app.js');await cp('web/compat/style.css',site+'/style.css');await rm(site+'/compat',{recursive:true,force:true});
await writeFile(site+'/frontend.json',JSON.stringify({version:1,current:{files:assets},previous:[]},null,2)+'\n');
const files={};async function collect(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())await collect(path);else if(path.endsWith('.go'))files[path]=await readFile(path,'utf8');}}await collect('cmd');await collect('internal');await writeFile(site+'/sources.json',JSON.stringify(files));
const image=JSON.parse(await readFile(site+'/runtime/image.json'));const origin=process.env.COURSE_PUBLIC_URL||'https://snowch.github.io/go-foundry/';const config={version:1,machine:'pc',memory_size:768,kernel:'https://bellard.org/jslinux/kernel-x86_64-new.bin',cmdline:'loglevel=3 console=hvc0 root=root rootfstype=9p rootflags=trans=virtio,msize=8192 virtio_net.napi_tx=0 rw init=/sbin/go-foundry-init TZ=${TZ}',fs0:{file:new URL('runtime/images/'+image.id,origin).href},eth0:{driver:'user'}};await writeFile(site+'/linux.cfg',JSON.stringify(config,null,2));
await mkdir(site+'/downloads',{recursive:true});execFileSync('python',['tools/bundle.py'],{stdio:'inherit'});await cp('.build/go-foundry-prototype.tar.gz',site+'/downloads/go-foundry-prototype.tar.gz');
try{await cp('docs/validation.json',site+'/validation.json');}catch{await writeFile(site+'/validation.json',JSON.stringify({summary:'Live validation is pending. This prototype is not yet claimed to work.',results:[]}));}

await mkdir(site+'/downloads/sources',{recursive:true});
const packages=JSON.parse(await readFile('tools/guest-packages.json'));
for(const item of packages.downloads.slice(1))await cp('.cache/'+item.name,site+'/downloads/sources/'+item.name);
await cp('tools/guest-packages.json',site+'/downloads/sources/packages.json');
await writeFile(site+'/version.json',JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),go:image.go_version,image:image.id}));await cp('THIRD_PARTY.md',site+'/notices.txt');console.log('Built prototype and pinned image '+image.id);
