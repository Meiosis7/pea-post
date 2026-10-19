'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const artifacts=path.join(root,'artifacts');
const KEY='pea-post-garden-v1';
(async()=>{
  fs.mkdirSync(artifacts,{recursive:true});
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1050}});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(process.env.GAME_URL||'http://127.0.0.1:64312/dist/');
    assert.equal(response.status(),200,'actual delivery entry returns 200');
    await page.locator('#gardenTab').click();
    await page.locator('.garden').waitFor();
    assert.match(await page.locator('.garden').innerText(),/把遗传规律/);
    const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
    const snapshot=()=>page.evaluate(key=>localStorage.getItem(key),KEY);
    const button=action=>page.locator(`[data-garden="${action}"]`);
    async function choose(a,b){
      for(const [slot,g]of [a,b].entries()){
        await page.locator(`[data-garden="slot"][data-slot="${slot}"]`).click();
        await page.locator(`.garden-stock[data-genotype="${g}"]`).click();
      }
    }
    async function grow(a,b){
      await choose(a,b);const before=await read();
      const expectedGeneration=Math.max(before.owned[a].generation,before.owned[b].generation)+1;
      await button('breed').click();const after=await read();
      assert.equal(after.batch.generation,expectedGeneration,'offspring generation derives from its two current parent lineages');
      assert.equal(after.crosses,before.crosses+1);
      assert.equal(Object.values(after.batch.counts).reduce((x,y)=>x+y,0),[16,24,32][before.level]);
      return after;
    }
    async function sell(){const before=await read();await button('sell').click();const after=await read();assert.equal(after.coins,before.coins+before.batch.size);assert.equal(after.batch,null);assert.deepEqual(after.owned,before.owned,'seed sale never removes reusable parents');}
    async function claimAvailable(){let count=0;while(await button('claim').count()&&await button('claim').isEnabled()){const before=await read();await button('claim').click();const after=await read();assert.equal(after.contract,before.contract+1);assert.ok(after.coins>before.coins);count++;}return count;}
    async function upgradeAvailable(){while(await button('upgrade').count()&&await button('upgrade').isEnabled()){const before=await read();await button('upgrade').click();const after=await read();assert.equal(after.level,before.level+1);assert.equal(after.coins,before.coins-[90,160][before.level]);}}
    await grow('YYRR','yyrr');
    assert.deepEqual((await read()).batch.counts,{YyRr:16});
    assert.equal(await claimAvailable(),1);
    await sell();
    await grow('yyrr','yyrr');
    await sell();
    assert.equal(await claimAvailable(),1);
    await upgradeAvailable();
    await grow('YyRr','YyRr');
    const mid=await read();
    assert.ok(Object.keys(mid.batch.counts).length>1,'F2 harvest reveals segregation');
    await page.locator('#toast.show').waitFor({state:'hidden'});
    await page.screenshot({path:path.join(artifacts,'v2-garden-harvest.png'),fullPage:true});
    const beforeReload=await snapshot();
    await page.reload();
    await page.locator('#gardenTab').click();
    assert.equal(await snapshot(),beforeReload,'reload preserves complete garden state and current batch');
    assert.match(await page.locator('.garden-harvest').innerText(),new RegExp(`谱系第 ${mid.batch.generation} 代`));
    await page.locator('#labTab').click();
    await page.locator('#crossBtn').waitFor();
    await page.locator('#gardenTab').click();
    assert.equal(await snapshot(),beforeReload,'switching to laboratory and back preserves exact garden state');
    await sell();await claimAvailable();await upgradeAvailable();
    let segregationRounds=1;
    while((await read()).contract<5){
      assert.ok(segregationRounds<120,'deterministic breeding should reach all collection contracts without softlock');
      await grow('YyRr','YyRr');await sell();await claimAvailable();await upgradeAvailable();segregationRounds++;
    }
    assert.equal((await read()).contract,5);
    await page.setViewportSize({width:390,height:844});
    for(const g of ['YYRR','YYrr','yyRR','yyrr']){
      await grow(g,g);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile harvest fits 390px viewport');
      assert.deepEqual((await read()).batch.counts,{[g]:[16,24,32][(await read()).level]},'pure homozygous line breeds true');
      await sell();await upgradeAvailable();
    }
    assert.equal(await claimAvailable(),1);
    const final=await read();
    assert.equal(final.contract,6);
    assert.equal(final.level,2,'both greenhouse expansions purchased');
    assert.deepEqual(Object.keys(final.stabilized).sort(),['YYRR','YYrr','yyRR','yyrr'].sort());
    assert.ok(final.coins>=28,'completed game retains enough funds to continue breeding');
    assert.ok(Math.max(...Object.values(final.owned).map(p=>p.generation))>2,'multigeneration lineages are preserved');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile completion fits 390px viewport');
    assert.match(await page.locator('.garden-complete').innerText(),/小镇育种师/);
    const finalSaved=await snapshot();await page.reload();await page.locator('#gardenTab').click();
    assert.equal(await snapshot(),finalSaved,'all completed orders and upgrades survive reload');
    await page.setViewportSize({width:1440,height:1050});
    await page.screenshot({path:path.join(artifacts,'v2-garden-complete.png'),fullPage:true});
    assert.deepEqual(errors,[],'actual browser has no uncaught page errors');
    const report={passed:true,url:page.url(),contracts:final.contract,upgradeLevel:final.level,crosses:final.crosses,segregationRounds,coins:final.coins,sold:final.sold,discovered:Object.keys(final.owned).length,maxGeneration:Math.max(...Object.values(final.owned).map(p=>p.generation)),persistence:{reload:true,leaveToLabAndReturn:true,completedState:true},mobile:{width:390,breeding:true,selling:true,delivery:true,noOverflow:true},pageErrors:errors};
    fs.writeFileSync(path.join(artifacts,'v2-garden-playthrough-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
