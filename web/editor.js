// Native textarea editing stays authoritative (including selection and IME).
// The read-only layer supplies syntax colour without altering a learner's source.
const tokens=/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`[^`]*`|\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)\b|\b[A-Za-z_][A-Za-z_\d]*\b/g;
const keywords=new Set('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'.split(' '));
const types=new Set('bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr true false nil'.split(' '));
export function highlightGo(source){
 const parts=[];let end=0;
 for(const match of source.matchAll(tokens)){
  if(match.index>end)parts.push({text:source.slice(end,match.index),kind:''});
  const text=match[0],kind=text.startsWith('//')||text.startsWith('/*')?'comment':/^["'`]/.test(text)?'string':/^\d/.test(text)?'number':keywords.has(text)?'keyword':types.has(text)?'type':'';
  parts.push({text,kind});end=match.index+text.length;
 }
 if(end<source.length)parts.push({text:source.slice(end),kind:''});
 return parts;
}
export function paintSource(node,source){
 const fragment=document.createDocumentFragment();
 for(const token of highlightGo(source)){
  const span=document.createElement('span');span.textContent=token.text;if(token.kind)span.className='syntax-'+token.kind;fragment.append(span);
 }
 // A final empty line must occupy the same height as the textarea's final line.
 fragment.append(document.createTextNode('\n'));node.replaceChildren(fragment);
}
