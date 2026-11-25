import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoutes} from '../web/routes.js';
import {labs} from '../web/lesson-presentation.js';
import {lessons} from '../web/course.js';
import {investigations} from '../web/investigations.js';
test('standalone courses preserve old bookmarks under root and Pages project paths',()=>{
 for(const base of ['https://example.org/go-foundry/','http://localhost:4321/']){
  const routes=createRoutes(base,labs,[...lessons,...investigations]);
  for(const lab of labs){
   const home=base+lab.id+'/',id=lab.lessons[0],lesson=home+'#'+id;
   assert.deepEqual(routes.resolve(home),{id:'lab/'+lab.id,url:home});
   assert.equal(routes.resolve(home+'index.html').url,home);
   assert.equal(routes.resolve(base+'#lab/'+lab.id).url,home);
   assert.equal(routes.resolve(base+'#course/'+lab.legacySection).url,home);
   assert.equal(routes.resolve(base+'#'+id).url,lesson);
   assert.equal(routes.resolve(lesson).url,lesson);
   assert.equal(routes.resolve(home+'#home').url,home);
  }
  assert.equal(routes.resolve(base+'#database').url,base+'#database');
  assert.equal(routes.resolve(base+'#home').url,base);
 }
});
test('navigation only intercepts course documents, leaving runtime, backups and outside sites alone',()=>{
 const base='https://example.org/go-foundry/',routes=createRoutes(base,labs,lessons);
 for(const url of [base,base+'index.html',base+'values-and-types/#types'])assert(routes.handles(url),url);
 for(const url of [base+'linux/index.html',base+'notices.txt',base+'downloads/work.tar.gz','https://elsewhere.org/go-foundry/first-programs/','https://example.org/go-foundry-other/','mailto:test@example.org'])assert(!routes.handles(url),url);
});

import {partDefinitions} from '../web/course-parts.js';
test('part overviews coexist with every original chapter and lesson address',()=>{
 const routes=createRoutes('https://example.org/go-foundry/',labs,lessons);
 assert.deepEqual(partDefinitions.flatMap(p=>p[2]),labs.map(c=>c.id));
 for(const [id]of partDefinitions)assert.deepEqual(routes.resolve('https://example.org/go-foundry/#part/'+id),{id:'part/'+id,url:'https://example.org/go-foundry/#part/'+id});
});
