const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
for(let n=0;n<4;n++){
 const c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage(),errors=[];p.on('pageerror',e=>{errors.push(e.message);console.log(e.stack)});p.setDefaultTimeout(10000);p.on('requestfailed',r=>console.log('REQUEST FAILED',r.url(),r.failure()));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 await p.goto('http://127.0.0.1:64312/app/');await p.locator('[data-app=continue]').click();await p.locator('[data-gene=AA]').click();await p.locator('[data-gene=aa]').click();await p.locator('[data-prob="1"]').click();
 for(let i=0;i<2;i++){
  await p.screenshot({path:'artifacts/result-repeat-before.png',fullPage:true});
  await p.locator('#crossBtn').click();
  try{await p.locator('.result-sheet').waitFor();}catch(e){console.log('Failure',n,i,await p.evaluate(()=>({busy:PeaApp.busy(),modal:document.querySelector('#modal').open,body:document.body.innerText})));await p.screenshot({path:'artifacts/result-repeat-failed.png'});throw e;}
  assert.match(await p.locator('.result-heading').innerText(),/投递成功/);await p.locator('#againBtn').click();
 }
 assert.deepEqual(errors,[]);await c.close();console.log(`PASS clean browser session ${n+1}: two animated crosses and retries`);
}
const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await c.newPage();let attempts=0;
await p.route('**/game.bundle.js',r=>{attempts++;return attempts===1?r.abort():r.continue()});await p.goto('http://127.0.0.1:64312/app/');await p.locator('#appLoading').waitFor({state:'detached'});assert.equal(attempts,2,'failed game load retried');assert.equal(await p.evaluate(()=>typeof Genetics),'object');await c.close();console.log('PASS failed initial load recovers automatically');
const fc=await b.newContext({serviceWorkers:'block'}),fp=await fc.newPage();let failures=0;await fp.route('**/game.bundle.js',r=>{failures++;return r.abort()});await fp.goto('http://127.0.0.1:64312/app/');await fp.locator('#retryStartup').waitFor();assert.equal(failures,3);assert.ok(await fp.locator('#appLoading').isVisible());await fp.unroute('**/game.bundle.js');await fp.locator('#retryStartup').click();await fp.locator('#appLoading').waitFor({state:'detached'});assert.ok(await fp.locator('#appHome').isVisible());await fc.close();console.log('PASS unavailable game stays covered and manual retry recovers');
const oc=await b.newContext({serviceWorkers:'block'}),op=await oc.newPage();await op.route('**/*',r=>r.request().isNavigationRequest()?r.continue():r.abort());await op.goto('http://127.0.0.1:64312/app/'+encodeURIComponent('豌豆邮局App-离线版.html'));await op.locator('[data-app=continue]').click();await op.locator('[data-gene=AA]').click();await op.locator('[data-gene=aa]').click();await op.locator('[data-prob="1"]').click();await op.locator('#crossBtn').click();await op.locator('.result-sheet').waitFor();assert.equal(await op.locator('script[src],link[rel=stylesheet]').count(),0);assert.equal(await op.locator('#appLoading').count(),0);await oc.close();console.log('PASS standalone HTML needs no external game or style files');
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
