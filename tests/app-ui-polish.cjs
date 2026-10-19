const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await c.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:64312/app/');
 await p.locator('[data-app=continue]').click();await p.locator('[data-gene=AA]').click();await p.locator('[data-gene=aa]').click();await p.locator('[data-prob="1"]').click();await p.locator('#crossBtn').click();await p.locator('.result-sheet').waitFor();
 assert.equal(await p.locator('#modal').getAttribute('aria-labelledby'),'sheetTitle');
 await p.screenshot({path:'artifacts/ui-result.png'});
 for(const [width,height] of [[360,640],[390,844],[430,932],[1024,900]]){
  await p.setViewportSize({width,height});
  for(const panel of ['theory','observe','discovery']){
   await p.locator(`#resultTab-${panel}`).click();
   assert.ok(await p.locator(`#resultPanel-${panel}`).isVisible());
   const bounds=await p.locator('#nextBtn').boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=height,`next action remains visible ${width} ${panel}`);
   const dlg=await p.locator('#modal').boundingBox();assert.ok(dlg.x>=0&&dlg.x+dlg.width<=width,`dialog fits ${width}`);
   assert.ok(await p.locator('.result-pages').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`no horizontal overflow ${panel} ${width}`);
  }
 }
 await p.setViewportSize({width:390,height:844});await p.locator('#resultTab-theory').click();await p.locator('[data-cell]').first().click();assert.match(await p.locator('#cellExplanation').innerText(),/Aa/);
 await p.locator('#resultTab-theory').press('ArrowRight');assert.equal(await p.locator('#resultTab-observe').getAttribute('aria-selected'),'true');assert.equal(await p.locator('#resultPanel-theory').isVisible(),false);
 const seedBox=await p.locator('.sample-seed').first().boundingBox();assert.ok(seedBox.width>=44&&seedBox.height>=44,'seed touch target');await p.screenshot({path:'artifacts/ui-observation.png'});await p.locator('#moreSample').click();assert.equal(await p.locator('#sampleN').innerText(),'320');assert.equal(await p.locator('#moreSample').evaluate(el=>document.activeElement===el),true);
 await p.locator('.sample-seed').first().click();assert.match(await p.locator('#sampleInspection').innerText(),/紫花/);
 await p.locator('#resultTab-discovery').click();await p.screenshot({path:'artifacts/ui-discovery.png'});
 await p.locator('#nextBtn').click();assert.equal(await p.locator('body').getAttribute('data-screen'),'experiment');
 await p.locator('[data-screen-target=profile]').click();assert.equal(await p.locator('#profileStars').innerText(),'3');assert.equal(await p.locator('#profileCollected').innerText(),'1');assert.equal(await p.locator('#profileExperiments').innerText(),'1');
 await p.screenshot({path:'artifacts/ui-profile.png',fullPage:true});
 await p.locator('#collectionTab-stamps').press('ArrowRight');assert.ok(await p.locator('#chapters').isVisible());await p.locator('[data-level="0"]').click();assert.equal(await p.locator('[data-screen-target=experiment]').getAttribute('aria-current'),'page');
 await p.locator('[data-screen-target=profile]').click();await p.locator('#collectionTab-stamps').click();await p.locator('[data-stamp="0"]').click();assert.match(await p.locator('#modalContent').innerText(),/显性与隐性/);await p.locator('[data-return-level="0"]').click();assert.equal(await p.locator('[data-screen-target=experiment]').getAttribute('aria-current'),'page');
 await p.locator('[data-screen-target=profile]').click();
 for(const [action,name] of [['notebook','notebook'],['journalBtn','archive'],['achievementsBtn','honors'],['settingsBtn','settings']]){
  await p.locator(`#appProfile [data-action=${action}]`).click();
  assert.equal(await p.locator('#modal').getAttribute('aria-labelledby'),'sheetTitle');
  await p.screenshot({path:`artifacts/ui-${name}.png`});
  if(action==='notebook'){await p.locator('#modalContent').evaluate(el=>el.scrollTop=el.scrollHeight);const close=await p.locator('#closeModal').boundingBox();assert.ok(close.y>=0&&close.y+close.height<844,'close stays visible on long notebook');}
  if(action==='settingsBtn'){const before=await p.locator('#soundSetting').isChecked();await p.locator('#soundSetting').setChecked(!before);await p.locator('#closeModal').click();await p.locator('#appProfile [data-action=settingsBtn]').click();assert.equal(await p.locator('#soundSetting').isChecked(),!before);}
  if(action==='journalBtn'){await p.locator('[data-replay="0"]').click();assert.equal(await p.locator('[data-screen-target=experiment]').getAttribute('aria-current'),'page');assert.equal(await p.locator('#parent0').getAttribute('data-genotype'),'AA');await p.locator('[data-screen-target=profile]').click();}else await p.locator('#closeModal').click();
 }
 for(const width of [360,390,430]){await p.setViewportSize({width,height:844});await p.locator('[data-screen-target=profile]').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));for(const tab of ['stamps','chapters']){await p.locator(`#collectionTab-${tab}`).click();assert.ok(await p.locator(`#collectionPanel-${tab}`).isVisible());}}
 assert.deepEqual(errors,[]);await b.close();fs.writeFileSync('artifacts/ui-polish-checks.json',JSON.stringify({status:'passed',resultLayouts:12,keyboardTabs:true,persistentFooter:true,sampleExpansion:true,collectionTabs:true,replayNavigation:true,settingsPersistence:true,runtimeErrors:errors},null,2));console.log('PASS UI polish: 12 result layouts, fixed actions, keyboard tabs, sampling, collection, replay, settings, no runtime errors');
})().catch(e=>{console.error(e);process.exit(1)});
