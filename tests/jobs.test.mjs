import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir}from'node:os';import{join}from'node:path';import{spawnSync}from'node:child_process';
import {jobScript,validateJob} from '../web/linux/jobs.mjs';
test('job transport captures real errors and exit codes while saving source and data',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'go-job-'));try{
  const project=join(directory,'root/work/go-foundry'),exchange=join(directory,'exchange');await mkdir(project,{recursive:true});await mkdir(exchange);
  await writeFile(join(exchange,'job-test.source'),'// café 漢字 $(touch SHOULD_NOT_EXIST)');
  const script=jobScript({id:'test',path:'/root/work/go-foundry/main.go',source:'anything',command:'printf "compiler error: main.go:3\\n" >&2; exit 7'}).replaceAll('/root/work',join(directory,'root/work')).replaceAll('/exchange',exchange);
  const execution=spawnSync('/bin/sh',['-c',script],{encoding:'utf8'});assert.equal(execution.status,0,execution.stderr);
  assert.equal(await readFile(join(exchange,'job-test.exit'),'utf8'),'7');assert.equal(await readFile(join(exchange,'job-test.saved'),'utf8'),'0');assert.match(await readFile(join(exchange,'job-test.output'),'utf8'),/main.go:3/);
  assert.equal(await readFile(join(project,'main.go'),'utf8'),'// café 漢字 $(touch SHOULD_NOT_EXIST)');assert((await readFile(join(exchange,'job-test.archive'))).length>0);
  const missing=jobScript({id:'missing',path:'/root/work/go-foundry/missing/main.go',source:'anything',command:'echo MUST_NOT_RUN'}).replaceAll('/root/work',join(directory,'root/work')).replaceAll('/exchange',exchange);
  await writeFile(join(exchange,'job-missing.source'),'source');spawnSync('/bin/sh',['-c',missing]);assert.notEqual(await readFile(join(exchange,'job-missing.exit'),'utf8'),'0');assert.doesNotMatch(await readFile(join(exchange,'job-missing.output'),'utf8'),/MUST_NOT_RUN/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('only bounded job identities and project source destinations are accepted',()=>{
 for(const data of [{id:'../../x',command:'true'},{id:'ok',command:'true',source:'x',path:'/root/work/go-foundry/../oops.go'},{id:'ok',command:'true',source:'x',path:'/root/not-project.go'}])assert.throws(()=>validateJob(data));
});
