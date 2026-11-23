// Course addresses are separate from the shared runner and storage namespaces.
export function createRoutes(base, labs, entries) {
 const root=new URL('./',base);
 const labFor=entry=>labs.find(lab=>lab.lessons.includes(entry.id));
 const home=lab=>new URL(lab?lab.id+'/':'',root).href;
 const lesson=entry=>{const url=new URL(home(labFor(entry)));url.hash=entry.id;return url.href;};
 const ownPath=url=>{
  if(url.origin!==root.origin)return undefined;
  if([root.pathname,root.pathname+'index.html'].includes(url.pathname))return null;
  return labs.find(lab=>[root.pathname+lab.id+'/',root.pathname+lab.id+'/index.html'].includes(url.pathname));
 };
 function resolve(address){
  const url=new URL(address,root),hash=url.hash.slice(1),entry=entries.find(item=>item.id===hash);
  if(entry)return{id:entry.id,url:lesson(entry)};
  const alias=labs.find(lab=>hash==='lab/'+lab.id||hash==='course/'+lab.legacySection);
  if(alias)return{id:'lab/'+alias.id,url:home(alias)};
  if(hash==='course/investigations')return{id:hash,url:home()+'#'+hash};
  const lab=ownPath(url);
  return lab?{id:'lab/'+lab.id,url:home(lab)}:{id:'home',url:home()};
 }
 return{home,lesson,resolve,handles:address=>ownPath(new URL(address,root))!==undefined};
}
