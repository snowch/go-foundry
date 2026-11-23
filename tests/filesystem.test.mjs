import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{execFileSync}from'node:child_process';
test('filesystem serializer preserves content, modes and deterministic identity',()=>{execFileSync('python',['-c',`import importlib.util,pathlib,tempfile
spec=importlib.util.spec_from_file_location('image','tools/build-image.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
with tempfile.TemporaryDirectory() as d:
 p=pathlib.Path(d);root=p/'src';root.mkdir();(root/'space name').write_bytes(b'hello');(root/'empty').write_bytes(b'');(root/'folder').mkdir();(root/'folder'/'binary').write_bytes(bytes(range(256)));(root/'run').write_text('#!/bin/sh\\necho hi\\n');(root/'run').chmod(0o755);(root/'link').symlink_to('space name')
 a=m.make_filesystem(root,p/'a');b=m.make_filesystem(root,p/'b');assert a==b
 head=(p/'a/head').read_text();assert 'RootID: 1' in head
 index=(p/'a/files/0000000000000001').read_text();assert 'space name' in index and '100755' in index and '120777' in index
 assert any(f['bytes']==256 for f in a['files'])
`],{stdio:'pipe'});});
test('pinned SDK and source bundle are explicit',async()=>{const version=JSON.parse(await readFile('tools/go-toolchain.json'));assert.match(version.file.sha256,/^[0-9a-f]{64}$/);assert.equal(version.version,'go1.27.4');const sdk=JSON.parse(await readFile('.build/site/runtime/image.json'));assert.equal(sdk.go_version,version.version);assert(sdk.bytes>70000000);const config=JSON.parse(await readFile('.build/site/linux.cfg'));assert.equal(config.memory_size,768);assert(config.fs1.file.includes(sdk.id));assert.equal(config.fs0.file,'https://vfsync.org/u/os/alpine-x86_64');});
test('bundle is reproducible and excludes generated files and third-party runtime',()=>{const first=execFileSync('python',['tools/bundle.py'],{encoding:'utf8'});const second=execFileSync('python',['tools/bundle.py'],{encoding:'utf8'});assert.equal(first,second);execFileSync('python',['-c',`import tarfile
with tarfile.open('.build/go-foundry-prototype.tar.gz') as t:
 names=t.getnames();assert 'go-foundry/cmd/hello/main.go' in names;assert 'go-foundry/LICENSE' in names;assert not any('/.cache/' in n or '/.git/' in n or n.endswith('.wasm') for n in names)
`]);});
