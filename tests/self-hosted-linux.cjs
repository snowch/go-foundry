const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const {serve}=await import('../tools/serve.mjs'),{lessons}=await import('../web/course.js'),{server,url}=await serve();
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 let page;
 try{
  const context=await browser.newContext({acceptDownloads:true}),testPage=await context.newPage(),blocked=[],failed=[],errors=[],checks=[];
  page=testPage;await page.addInitScript(()=>{window.bridgeEvents=[];addEventListener('message',event=>{if(event.data?.channel==='foundry-linux'){const {type,id,phase,busy,message}=event.data;bridgeEvents.push({type,id,phase,busy,message});if(bridgeEvents.length>50)bridgeEvents.shift();}});});
  await context.route('**/*',route=>{if(!route.request().url().startsWith(url)){blocked.push(route.request().url());return route.abort();}return route.continue();});
  context.on('response',response=>{if(response.status()>=400)failed.push([response.status(),response.url()]);});page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);await page.waitForFunction(()=>document.querySelector('#source-file').options.length>0);
  async function navigate(id){await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(id=>document.querySelector('#outline a[aria-current]')?.hash==='#'+id,id);}
  async function run(expected,{timeout=300000,error=false}={}){
   await page.locator('#run-source').click();await page.waitForFunction(()=>!document.querySelector('#run-source').disabled,null,{timeout});
   const status=await page.locator('#job-status').textContent(),output=await page.locator('#job-output').textContent();
   assert.match(status,error?/failed/:/Finished\. Exit code 0\./,status+'\n'+output);if(expected)assert(output.includes(expected),expected+'\n'+output);
   assert.match(await page.locator('#workspace-status').textContent(),/saved in this browser/);return output;
  }
  // Every starter runs through the real hidden VM and actual Go compiler.
  for(const lesson of ((process.argv.includes('--runner-only')||process.argv.includes('--persistence-only'))?[]:lessons)){await navigate(lesson.id);const output=await run(lesson.reference);assert(await page.locator('#terminal-region').evaluate(element=>element.inert));checks.push({lesson:lesson.id,status:'passed',output});console.log('PASS real guest starter '+lesson.id);}
  if(!process.argv.includes('--persistence-only')){await navigate('first-program');const source=await page.locator('#source').inputValue();
  await page.locator('#source').fill(source.replace('Hello, Go!','Hello, saved Go!')+'\n// café 漢字 $(touch /tmp/SHOULD_NOT_EXIST)\n');await page.locator('#source').dispatchEvent('input');await run('Hello, saved Go!');
  await page.locator('#source').fill('package main\nfunc main() { this is not Go }');await page.locator('#source').dispatchEvent('input');await run('main.go:',{error:true});
  await page.locator('#source').fill('package main\nimport "fmt"\nfunc main(){fmt.Println("loop started");for {}}');await page.locator('#source').dispatchEvent('input');await page.locator('#run-source').click();await page.waitForFunction(()=>document.querySelector('#job-output').textContent.includes('loop started'),null,{timeout:180000});await page.locator('#stop-run').click();await page.waitForFunction(()=>document.querySelector('#job-status').textContent==='Run stopped.',null,{timeout:60000});
  await page.evaluate(()=>document.querySelector('#terminal iframe').contentWindow.postMessage({channel:'foundry-linux',type:'command',command:'if ps -o comm | grep -qx hello; then echo CANCELLED_PROCESS_STILL_RUNNING; else echo CANCELLED_PROCESS_GONE; fi'},location.origin));
  const guest=await page.locator('#terminal iframe').elementHandle().then(element=>element.contentFrame());await guest.waitForFunction(()=>/^CANCELLED_PROCESS_GONE\r?$/m.test(foundryLinux.getTranscript()),null,{timeout:30000});
  await page.locator('#source').fill(source.replace('Hello, Go!','Hello, after stop!'));await page.locator('#source').dispatchEvent('input');await run('Hello, after stop!');console.log('PASS edited source, real compiler error, cancellation and rerun in the same guest');}
  await navigate('database');await run('7 | Ada | 42');
  await page.locator('#prediction').fill('My database should survive stopping Linux.');await page.locator('#complete').check();
  await page.locator('#runner-tools').evaluate(element=>element.open=true);const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-saved').click()]);await fs.mkdir('test-results',{recursive:true});await download.saveAs('test-results/go-saved-project.tar.gz');assert((await fs.stat('test-results/go-saved-project.tar.gz')).size>100);
  await page.locator('#runner-open').click();await page.locator('#runner-dialog [data-stop]').click();await page.locator('#confirm-stop').click();await page.waitForFunction(()=>document.querySelector('#runner-state').textContent==='Stopped',null,{timeout:90000});assert.equal(await page.locator('#terminal iframe').count(),0);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#source-file').options.length>0);assert.equal(await page.locator('#prediction').inputValue(),'My database should survive stopping Linux.');assert(await page.locator('#complete').isChecked());await run('7 | Ada | 42',{timeout:360000});console.log('PASS committed IndexedDB archive, manual save/stop, full page reload, fresh VM restoration and database reopen');
  // The VM is real; only the parent's idle clock is advanced. No simulated guest
  // output substitutes for tar creation, bridge reads or IndexedDB completion.
  await page.evaluate(()=>{const now=Date.now;Date.now=()=>now()+31*60*1000;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>document.querySelector('#runner-state').textContent==='Stopped',null,{timeout:90000});console.log('PASS automatic idle checkpoint and shutdown');
  assert.deepEqual(blocked,[]);assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);
  await fs.writeFile('test-results/'+(process.argv.includes('--persistence-only')?'go-persistence-browser.json':process.argv.includes('--runner-only')?'go-runner-browser.json':'go-course-browser.json'),JSON.stringify({scope:process.argv.includes('--persistence-only')?'persistence':process.argv.includes('--runner-only')?'runner-and-persistence':'full-course',date:new Date().toISOString(),checks,edited:true,compilerError:true,cancelAndRerun:true,indexedDBRestore:true,idleStop:true,blocked,failed,errors},null,2));
  await context.close();
 }catch(error){if(page){console.error(await page.evaluate(()=>({header:document.querySelector('#runner-state')?.textContent,status:document.querySelector('#job-status')?.textContent,feedback:document.querySelector('#feedback')?.textContent,events:window.bridgeEvents})));await page.screenshot({path:'test-results/guest-failure.png'}).catch(()=>{});}throw error;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
