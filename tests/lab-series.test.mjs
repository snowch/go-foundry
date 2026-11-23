import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../web/course.js';
import {labs} from '../web/lesson-presentation.js';
test('series boundaries retain every existing lesson exactly once and reference available prerequisites',()=>{
 assert.equal(new Set(labs.map(lab=>lab.id)).size,labs.length);
 assert.deepEqual(labs.flatMap(lab=>lab.lessons),lessons.map(lesson=>lesson.id));
 for(const [index,lab]of labs.entries()){
  assert(lab.description&&lab.prerequisites&&lab.lessons.length);
  assert(lab.before.every(id=>labs.slice(0,index).some(prior=>prior.id===id)),'prerequisites must be available earlier labs');
 }
});
