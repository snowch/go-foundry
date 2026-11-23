const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const {serve}=await import('../tools/serve.mjs'),{labs}=await import('../web/lesson-presentation.js'),{lessons}=await import('../web/course.js'),{server,url}=await serve();
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true});
 try{
  const draft='package main\n// A learner draft that must be kept\nfunc main() {}',prefix='go-foundry:v1:';
  const cases=[
   {name:'fresh',saved:{},target:lessons[0],label:'Start the first lesson'},
   {name:'resume unfinished',saved:{'last-lesson':'types','last-lesson/values-and-types':'types','source/cmd/types/main.go':draft,'notes/types':'Keep my prediction','result/types':JSON.stringify({status:'Finished. Exit code 0.',output:'Saved result'})},target:lessons.find(l=>l.id==='types'),label:'Continue: Choose a value’s type'},
   {name:'advance from completed lesson',saved:{'last-lesson':'first-program','done/first-program':'true','source/cmd/hello/main.go':draft},target:lessons.find(l=>l.id==='two-lines'),label:'Continue: Print two lines'},
   {name:'next lab',saved:Object.fromEntries([['last-lesson',labs[0].lessons.at(-1)],...labs[0].lessons.map(id=>['done/'+id,'true'])]),target:lessons.find(l=>l.id==='variables'),label:'Continue: Name a value'},
   {name:'review complete series',saved:Object.fromEntries([['last-lesson','db-persistence'],...lessons.map(l=>['done/'+l.id,'true'])]),target:lessons.find(l=>l.id===labs.at(-1).lessons[0]),label:'Review: '+lessons.find(l=>l.id===labs.at(-1).lessons[0]).title}
  ];
  for(const test of cases){
   const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(({saved,prefix})=>{for(const[k,v]of Object.entries(saved))localStorage.setItem(prefix+k,v);},{saved:test.saved,prefix});
   await page.goto(url);await page.waitForFunction(()=>document.querySelector('#source-file').options.length>0);
   assert.equal(await page.locator('#start-course').textContent(),test.label,test.name);assert.equal(await page.locator('#terminal iframe').count(),0);
   await page.locator('#start-course').focus();await page.keyboard.press('Enter');await page.waitForFunction(title=>document.querySelector('#breadcrumb').textContent===title,test.target.title);
   assert.equal(page.url(),url+labs.find(l=>l.lessons.includes(test.target.id)).id+'/#'+test.target.id,test.name);assert.equal(await page.locator('#terminal iframe').count(),0,'navigation must not run code');
   if(test.name==='resume unfinished'){assert.equal(await page.locator('#source').inputValue(),draft);assert.equal(await page.locator('#prediction').inputValue(),'Keep my prediction');assert.equal(await page.locator('#job-output').textContent(),'Saved result');}
   if(test.name==='advance from completed lesson'){await page.locator('#previous-lesson').click();await page.waitForFunction(()=>document.querySelector('#breadcrumb').textContent==='Print a greeting');assert.equal(await page.locator('#source').inputValue(),draft);assert(await page.locator('#complete').isChecked());}
   await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();
  for(const [width,columns]of [[320,1],[390,1],[620,2],[768,2],[820,2],[900,2],[901,2],[1100,3],[1440,3]])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:900});await page.goto(url);await page.waitForFunction(()=>document.querySelector('#home-outline').children.length===12);await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   const metrics=await page.evaluate(()=>{const start=document.querySelector('#start-course'),outline=document.querySelector('#course-outline-title'),figure=document.querySelector('.home-illustration');return {columns:getComputedStyle(document.querySelector('#home-outline')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth,startBottom:start.getBoundingClientRect().bottom,outlineTop:outline.getBoundingClientRect().top,figureTop:figure.getBoundingClientRect().top,outlineBottom:document.querySelector('.course-home').getBoundingClientRect().bottom};});
   assert.equal(metrics.columns,columns,width+' '+theme);assert(!metrics.overflow,width+' '+theme);
   if(width<=900){assert(metrics.startBottom<metrics.outlineTop);assert(metrics.outlineBottom<=metrics.figureTop);if(width<=390)assert(metrics.outlineTop<900,'choices visible on first phone screen');}
   if(width>900)assert(metrics.figureTop<metrics.outlineTop,'desktop image stays beside intro');
   assert(await page.evaluate(()=>!!(document.querySelector('.course-home').compareDocumentPosition(document.querySelector('.home-illustration'))&Node.DOCUMENT_POSITION_FOLLOWING)),'reading and keyboard order keeps choices before illustration');
   if([390,820,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/series-hub-'+width+'-'+theme+'.png',fullPage:true});}
  }
  await context.close();console.log('PASS direct start/resume, completed-next, full review, preserved work, no automatic runtime; 1/2/3-column hub, mobile reading order, themes and keyboard.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
