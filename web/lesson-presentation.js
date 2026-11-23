import {presentation as original} from '../content/intro-presentation.js';
import added from '../content/lessons.json' with {type:'json'};
import courses from '../content/courses.json' with {type:'json'};
export const labs=courses;
export const presentation={...original,...Object.fromEntries(added.map(lesson=>[lesson.id,{target:new RegExp(lesson.target),label:'Show experiment target',topics:lesson.topics.map(([title,reminder,code,url])=>({title,reminder,code,url}))}]))};
