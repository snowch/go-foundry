"""Reproducible course-owned source bundle; no SDK, emulator or guest image."""
import gzip,hashlib,io,json,pathlib,tarfile
root=pathlib.Path(__file__).resolve().parent.parent
names=['go.mod','run','tools/go-toolchain.json','README.md','LICENSE']
names+=sorted(str(p.relative_to(root)) for folder in ['cmd','internal'] for p in (root/folder).rglob('*.go') if 'testdata' not in p.parts and p.name != 'migrate_test.go')
manifest={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in names}
buffer=io.BytesIO()
with tarfile.open(fileobj=buffer,mode='w') as archive:
 for name in names:
  data=(root/name).read_bytes();info=tarfile.TarInfo('go-foundry/'+name);info.size=len(data);info.mtime=0;info.mode=0o755 if name in ['setup','run'] else 0o644;archive.addfile(info,io.BytesIO(data))
 data=(json.dumps(manifest,indent=2)+'\n').encode();info=tarfile.TarInfo('go-foundry/source-manifest.json');info.size=len(data);info.mtime=0;info.mode=0o644;archive.addfile(info,io.BytesIO(data))
target=root/'.build/go-foundry-prototype.tar.gz';target.parent.mkdir(exist_ok=True)
with target.open('wb') as file:
 with gzip.GzipFile(fileobj=file,mode='wb',mtime=0,filename='') as stream:stream.write(buffer.getvalue())
print(json.dumps({'bundle':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'source_files':len(manifest)}))
