// Authoring bridge. build.mjs emits a self-contained immutable browser module.
import original from '../content/intro-lessons.json' with {type:'json'};
import added from '../content/lessons.json' with {type:'json'};
import courses from '../content/courses.json' with {type:'json'};
const byID=new Map([...original,...added].map(lesson=>[lesson.id,lesson]));
export const lessons=courses.flatMap((lab,index)=>lab.lessons.map(id=>({...byID.get(id),chapter:(index+1)+' · '+lab.title})));
