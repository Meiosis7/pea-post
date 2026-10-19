const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.GAME_URL||'http://127.0.0.1:64312/app/');
await page.locator('[data-app=continue]').click();assert.equal(await page.locator('.seed').count(),3,'initial three selectable genotypes');
await page.locator('.scene-art').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));await page.screenshot({path:'artifacts/app-campaign-start.png',fullPage:true});
const choose=async(a,b,p)=>{await page.locator('#parent0').click();await page.locator(`.seed[data-gene="${a}"]`).click();await page.locator(`.seed[data-gene="${b}"]`).click();if(p!==null)await page.locator(`[data-prob="${p}"]`).click();await page.locator('#crossBtn').click();await page.locator('.result-heading').waitFor();};
await choose('aa','aa',1);assert.match(await page.locator('#modalContent').innerText(),/还差一点/);await page.locator('#retryBtn').click();
const solutions=[['AA','aa',1],['Aa','Aa',.25],['Aa','aa',.5],['??','aa',null],['YYRR','yyrr',1],['YyRr','YyRr',.0625],['YyRr','yyrr',.25],['yyRR','yyrr',1],['YYrr','yyRR',1],['YyRr','YyRr',.1875],['YyRr','Yyrr',.125],['Yyrr','yyrr',.5],['yyRr','yyRr',.75],['YYRr','YyRR',1],['YyRr','Yyrr',.375],['yyRR','yyRr',1]];
for(let i=0;i<solutions.length;i++){
if(i===3){await choose('??','AA',null);assert.equal(await page.locator('.punnett').count(),0,'invalid detective experiment must not reveal the hidden genotype');await page.locator('#retryBtn').click();}
await choose(...solutions[i]);
if(i===3){await page.locator('[data-infer="AA"]').click();assert.match(await page.locator('.inference-feedback').innerText(),/白花/);await page.locator('[data-infer="Aa"]').click();}
assert.match(await page.locator('#modalContent').innerText(),/投递成功/,'order '+i);
if(i===5){await page.locator('#resultTab-observe').click();await page.screenshot({path:'artifacts/app-campaign-results.png',fullPage:true});await page.locator('#moreSample').click();assert.match(await page.locator('#sampleN').innerText(),/320/);}
await page.locator('#nextBtn').click();}
assert.match(await page.locator('#modalContent').innerText(),/温室遗传学家/);
await page.screenshot({path:'artifacts/app-completion.png',fullPage:true});await page.locator('#closeModal').click();
assert.equal(await page.locator('#stamps .stamp.earned').count(),16);
await page.reload();assert.equal(await page.locator('#stamps .stamp.earned').count(),16);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS all 16 App missions, failure/retry, evidence reasoning, sampling and saved reload');})().catch(e=>{console.error(e);process.exit(1)});