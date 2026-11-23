import test from 'node:test';
import assert from 'node:assert/strict';
import {highlightGo} from '../web/editor.js';
test('syntax rendering retains source exactly, including incomplete edits and Unicode',()=>{
 for(const source of ['package main\n// café 漢字\nfunc main(){ fmt.Println("<script> & \\\"hi\\\"") }\n', 'var raw = `for // not a comment\n42`\n', '/* block\ncomment */\nvar n = 0x2a\nvar r = \'x\'\n', 'fmt.Println("unfinished\n', '']){
  const tokens=highlightGo(source);assert.equal(tokens.map(token=>token.text).join(''),source);
 }
 const raw=highlightGo('var raw = `for // 42`');assert(raw.some(token=>token.kind==='string'&&token.text==='`for // 42`'));
 assert(!raw.some(token=>token.kind==='comment'));
});
