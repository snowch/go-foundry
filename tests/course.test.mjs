import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {lessons} from '../web/course.js';
const sdk=resolve('.cache/sdk/go');
const edits={
 'first-program':[['Hello, Go!','Hello, Ada!','Hello, Ada!']],
 'two-lines':[['fmt.Println("Hello, Go!")\n\tfmt.Println("Ready to learn.")','fmt.Println("Ready to learn.")\n\tfmt.Println("Hello, Go!")','Ready to learn.\nHello, Go!']],
 'compiler-errors':[['"Ready"','"Ready',null]],
 variables:[['count := 3','count := 8','count 8\nafter adding two 10']],
 types:[['price float64 = 2.5','price float64 = 3.75','count 3\nprice 3.75\nname Ada\navailable true'],['available bool = true','available bool = false','count 3\nprice 2.5\nname Ada\navailable false'],['count int = 3','count int = "three"',null]],
 division:[['items := 7','items := 8','complete groups 2\nleft over 2\ndecimal quotient 2.6666666666666665'],['items := 7','items := 9','complete groups 3\nleft over 0\ndecimal quotient 3']],
 conditions:[['score := 49','score := 50','threshold reached'],['score := 49','score := 51','threshold reached']],
 loops:[['step <= 3','step < 3','step 1\nstep 2\ndone'],['step <= 3','step <= 0','done']],
 'running-total':[['value <= 3','value <= 4','value 1 total 1\nvalue 2 total 3\nvalue 3 total 6\nvalue 4 total 10'],['total := 0\n\tfor value := 1; value <= 3; value++ {','for value := 1; value <= 4; value++ {\n\t\ttotal := 0','value 1 total 1\nvalue 2 total 2\nvalue 3 total 3\nvalue 4 total 4']]
};
test('all lesson starters and documented source edits compile and produce the stated evidence',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'go-course-'));
 try {
  for(const lesson of lessons){
   const source=await readFile(lesson.file,'utf8');
   for(const [index,variant]of [[-1,[null,null,lesson.reference]],...edits[lesson.id].map((value,index)=>[index,value])]){
    const [before,after,expected]=variant; if(before)assert(source.includes(before),lesson.id+' edit must identify real source');
    const file=join(directory,'main.go');await writeFile(file,before?source.replace(before,after):source);
    const build=spawnSync(join(sdk,'bin/go'),['build','-o',join(directory,'example'),file],{encoding:'utf8',timeout:120000,env:{...process.env,GOROOT:sdk,GOCACHE:resolve('.cache/course-test'),GOTOOLCHAIN:'local',CGO_ENABLED:'0'}});
    if(expected===null){assert.notEqual(build.status,0,lesson.id);assert.match(build.stderr,/main.go:\d+/);continue;}
    assert.equal(build.status,0,lesson.id+' '+index+' '+build.stderr);
    const run=spawnSync(join(directory,'example'),[],{encoding:'utf8',timeout:10000});assert.equal(run.status,0);assert.equal(run.stdout.trim(),expected,lesson.id+' '+index);
   }
  }
 }finally{await rm(directory,{recursive:true,force:true});}
});
