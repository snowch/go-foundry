import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm,cp,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {lessons} from '../web/course.js';
import original from './fixtures/intro-edits.json' with {type:'json'};
import added from './fixtures/lesson-edits.json' with {type:'json'};
const sdk=resolve('.cache/sdk/go'),edits={...original,...added};
test('every starter and documented edit produces the stated evidence in an isolated real Go project',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'go-course-'));
 const env={...process.env,GOROOT:sdk,GOCACHE:resolve('.cache/course-test'),GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOMAXPROCS:'2',GOWORK:'off'};
 try{
  for(const lesson of lessons){
   const folder=join(directory,lesson.id);await mkdir(folder);await writeFile(join(folder,'go.mod'),'module example.com/go-foundry\n\ngo 1.27.0\n');await cp('internal',join(folder,'internal'),{recursive:true});
   const source=await readFile(lesson.file,'utf8'),file=join(folder,basename(lesson.file)),binary=join(folder,'example');
   assert(edits[lesson.id]?.length,lesson.id+' has executable edits');
   for(const support of lesson.supportFiles||[])if(!support.startsWith('internal/'))await cp(support,join(folder,basename(support)));
   for(const variant of [null,...edits[lesson.id]]){
    let expected=variant?variant.expected:lesson.reference,contains=lesson.referenceMode==='contains',exit=0;
    if(variant)assert(source.includes(variant.before),lesson.id+' edit exists');
    if(expected&&typeof expected==='object'){exit=expected.exit||0;expected=expected.contains;contains=true;}
    await writeFile(file,variant?source.replace(variant.before,variant.after):source);
    const tests=['test','benchmark'].includes(lesson.mode),args=[...(tests?['test','-c']:['build']),'-trimpath','-buildvcs=false','-p=1','-o',binary,'.'];
    const build=spawnSync(join(sdk,'bin/go'),args,{cwd:folder,env,encoding:'utf8',timeout:120000});
    if(expected===null){assert.notEqual(build.status,0,lesson.id);assert.match(build.stderr,/main.go:\d+/);continue;}
    assert.equal(build.status,0,lesson.id+' '+build.stderr);
    const flags=tests?['-test.v']:[];if(lesson.mode==='benchmark')flags.push('-test.run=^$','-test.bench=.','-test.benchtime=1x','-test.benchmem');
    const run=spawnSync(binary,flags,{cwd:folder,env,encoding:'utf8',timeout:20000});assert.equal(run.status,exit,lesson.id+' '+run.stdout+' '+run.stderr);
    if(contains)assert(run.stdout.includes(expected),lesson.id+' '+run.stdout);else assert.equal(run.stdout.trim(),expected,lesson.id);
   }
  }
 }finally{await rm(directory,{recursive:true,force:true});}
});
