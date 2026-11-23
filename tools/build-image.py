"""Build a content-addressed HTTP/9P root with a minimal OS and prepared Go tools.

The format follows TinyEMU's MIT-licensed build_filelist utility. Original
serialization here is sorted and reproducible, including normalized cache times.
"""
import argparse,hashlib,json,os,pathlib,re,shutil,stat,subprocess,tarfile,urllib.request
root=pathlib.Path(__file__).resolve().parent.parent

def make_filesystem(source,target):
 target.mkdir(parents=True,exist_ok=True);blobs=target/'files';blobs.mkdir(exist_ok=True)
 next_id=2;used=0;lines=['Version: 1','Revision: 1','']
 def scan(folder):
  nonlocal next_id,used
  for path in sorted(folder.iterdir(),key=lambda p:p.name):
   info=path.lstat();mode=stat.S_IFMT(info.st_mode)|(0o755 if path.is_dir() or info.st_mode&0o111 else 0o644)
   name=json.dumps(path.name,ensure_ascii=False)
   if path.is_symlink():lines.append(f'{stat.S_IFLNK|0o777:06o} 0 0 0 {name} {json.dumps(os.readlink(path))}')
   elif path.is_dir():
    lines.append(f'{mode:06o} 0 0 0 {name}');scan(path)
   elif path.is_file():
    data=path.read_bytes()
    if path.name.endswith('-a') and data.startswith(b'v1 '):
     # Go's action-index entry ends in a fixed-width Unix-nanosecond field.
     data=data[:-21]+b'0'.rjust(20,b' ')+b'\n'
    tail=''
    if data:
     (blobs/f'{next_id:016x}').write_bytes(data);tail=f' {next_id:x}';next_id+=1;used+=(len(data)+4095)//4096*4096
    lines.append(f'{mode:06o} 0 0 {len(data)} 0 {name}'+tail)
   else:raise ValueError('Only regular files, folders and symlinks belong in the toolchain layer')
  lines.append('.')
 scan(source);data=('\n'.join(lines)+'\n').encode();(blobs/'0000000000000001').write_bytes(data);used+=(len(data)+4095)//4096*4096
 (target/'head').write_text(f'Version: 1\nRevision: 1\nNextFileID: {next_id:x}\nFSFileCount: {next_id-1}\nFSSize: {used}\nFSMaxSize: 2147483648\nKey:\nRootID: 1\n')
 (target/'lock').write_bytes(b'')
 files=[]
 for path in sorted(target.rglob('*')):
  if path.is_file():files.append({'path':str(path.relative_to(target)),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 identity=hashlib.sha256(json.dumps(files,separators=(',',':'),sort_keys=True).encode()).hexdigest()
 return {'id':identity,'bytes':sum(f['bytes'] for f in files),'files':files,'format':'tinyemu-httpfs-v1'}

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='.build/site/runtime/images');args=parser.parse_args()
 cache=root/'.cache';cache.mkdir(exist_ok=True);metadata=json.loads((root/'tools/go-toolchain.json').read_text());record=metadata['file'];archive=cache/record['filename']
 if not archive.exists():
  with urllib.request.urlopen('https://go.dev/dl/'+record['filename']) as response,archive.open('wb') as out:shutil.copyfileobj(response,out)
 if hashlib.sha256(archive.read_bytes()).hexdigest()!=record['sha256']:raise SystemExit('Go SDK checksum mismatch')
 sdk=cache/'sdk/go'
 if not (sdk/'bin/go').exists():
  with tarfile.open(archive) as package:package.extractall(cache/'sdk',filter='data')
 layer=cache/'image-root';shutil.rmtree(layer,ignore_errors=True);layer.mkdir()
 for directory in ['bin','lib','sbin','etc','proc','sys','dev','tmp','root','usr/local/bin','opt','var/cache']:(layer/directory).mkdir(parents=True,exist_ok=True)
 osmeta=json.loads((root/'tools/guest-packages.json').read_text())
 for item in osmeta['downloads']:
  downloaded=cache/item['name']
  if not downloaded.exists():
   with urllib.request.urlopen(item['url']) as response,downloaded.open('wb') as out:shutil.copyfileobj(response,out)
  if hashlib.sha256(downloaded.read_bytes()).hexdigest()!=item['sha256']:raise SystemExit('Guest package checksum mismatch: '+item['name'])
 with tarfile.open(cache/osmeta['downloads'][0]['name']) as package:
  for path in ['bin/busybox','lib/ld-musl-x86_64.so.1']:
   (layer/path).write_bytes(package.extractfile('./'+path).read());(layer/path).chmod(0o755)
 for name in ['sh','mount','mkdir','hostname','setsid','cttyhack','cat','cp','mv','tar','gzip','sleep','uname','free','ls','rm','printf','pwd','sed','head','wc','date','sync','df']:(layer/'bin'/name).symlink_to('busybox')
 (layer/'lib/libc.musl-x86_64.so.1').symlink_to('ld-musl-x86_64.so.1')
 (layer/'etc/passwd').write_text('root:x:0:0:root:/root:/bin/sh\n')
 (layer/'etc/group').write_text('root:x:0:\n')
 (layer/'etc/hostname').write_text('go-foundry\n')
 shutil.copy2(root/'tools/guest/init',layer/'sbin/go-foundry-init')
 shutil.copy2(root/'tools/guest/export_file',layer/'usr/local/bin/export_file')
 shutil.copytree(sdk,layer/'opt/go',copy_function=os.link,symlinks=True)
 # Corresponding BusyBox source, the exact Alpine recipe/config/patches and musl
 # source travel with the binary image; no promise of a future source offer.
 sources=layer/'usr/share/go-foundry/sources';sources.mkdir(parents=True)
 for item in osmeta['downloads'][1:]:shutil.copy2(cache/item['name'],sources/item['name'])
 (sources/'packages.json').write_text(json.dumps(osmeta,indent=2)+'\n')
 with tarfile.open(cache/'busybox-1.37.0.tar.bz2') as package:(sources/'BUSYBOX-LICENSE').write_bytes(package.extractfile('busybox-1.37.0/LICENSE').read())
 with tarfile.open(cache/'musl-1.2.5.tar.gz') as package:(sources/'MUSL-COPYRIGHT').write_bytes(package.extractfile('musl-1.2.5/COPYRIGHT').read())
 shutil.copy2(root/'THIRD_PARTY.md',sources/'NOTICES.md')
 prepared=cache/'image-cache';shutil.rmtree(prepared,ignore_errors=True)
 env=dict(os.environ,GOROOT=str(sdk),GOCACHE=str(prepared),GOPATH=str(cache/'image-gopath'),GOTOOLCHAIN='local',CGO_ENABLED='0',GOAMD64='v1',GOMAXPROCS='2',GOPROXY='off',GOSUMDB='off')
 subprocess.run([str(sdk/'bin/go'),'test','-trimpath','-buildvcs=false','-count=1','-run=^$','-p=1','./...'],cwd=root,env=env,check=True)
 for name in ['hello','channels','tinydb','runner']:
  output=cache/'image-bin'/name;output.parent.mkdir(exist_ok=True)
  subprocess.run([str(sdk/'bin/go'),'build','-trimpath','-buildvcs=false','-p=1','-o',str(output),'./cmd/'+name],cwd=root,env=env,check=True)
 shutil.copy2(cache/'image-bin/runner',layer/'usr/local/bin/go-foundry-runner')
 shutil.copytree(prepared,layer/'var/cache/go',copy_function=os.link)
 for name in ['trim.txt','testexpire.txt']:(layer/'var/cache/go'/name).unlink(missing_ok=True)
 project=layer/'root/work/go-foundry';project.mkdir(parents=True)
 for name in ['cmd','internal','tools']:
  if name=='tools':(project/'tools').mkdir();shutil.copy2(root/'tools/go-toolchain.json',project/'tools/go-toolchain.json')
  else:shutil.copytree(root/name,project/name)
 for name in ['go.mod','run','README.md','LICENSE']:shutil.copy2(root/name,project/name)
 staging=cache/'httpfs';shutil.rmtree(staging,ignore_errors=True);manifest=make_filesystem(layer,staging)
 output=root/args.output;output.mkdir(parents=True,exist_ok=True);destination=output/manifest['id'];shutil.rmtree(destination,ignore_errors=True);shutil.move(staging,destination)
 manifest.update({'go_version':metadata['version'],'archive_sha256':record['sha256'],'compiler_flags':{'CGO_ENABLED':'0','GOAMD64':'v1','GOTOOLCHAIN':'local','trimpath':True,'buildvcs':False},'cache_note':'Prepared build cache; go test -count=1 still executes tests in the guest. Edited source is rebuilt by the real Go compiler.'})
 (destination/'manifest.json').write_text(json.dumps(manifest,separators=(',',':'))+'\n');(output.parent/'image.json').write_text(json.dumps({k:v for k,v in manifest.items() if k!='files'},indent=2)+'\n')
 print(json.dumps({'image':manifest['id'],'bytes':manifest['bytes'],'file_count':len(manifest['files'])}))
if __name__=='__main__':main()
