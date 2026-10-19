(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./genetics.js'):root.Genetics);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PeaGarden=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Genetics){
  'use strict';
  const KEY='pea-post-garden-v1';
  const TYPES=['YYRR','YYRr','YYrr','YyRR','YyRr','Yyrr','yyRR','yyRr','yyrr'];
  const LEVELS=[{size:16,cost:12,price:0,name:'育种小圃'},{size:24,cost:20,price:90,name:'双排温室'},{size:32,cost:28,price:160,name:'研究苗圃'}];
  const PURE=['YYRR','YYrr','yyRR','yyrr'];
  const phenotype=g=>(g.includes('Y')?'黄色':'绿色')+(g.includes('R')?'圆粒':'皱粒');
  const total=o=>Object.values(o).reduce((a,b)=>a+b,0);
  const copy=s=>JSON.parse(JSON.stringify(s));
  const CONTRACTS=[
    {title:'第一封信 · 双性状的相遇',request:'收获至少 1 粒 YyRr',hint:'让 YYRR 与 yyrr 杂交，两种性状的等位基因在子代中相遇。',reward:36,test:s=>s.harvested.YyRr>0},
    {title:'第二封信 · 找到绿色皱粒',request:'收获至少 1 粒 yyrr',hint:'可让 yyrr 自交稳定获得；也可让 YyRr 自交，观察隐性组合重新出现。',reward:40,test:s=>s.harvested.yyrr>0},
    {title:'第三封信 · 留住黄色皱粒',request:'收获至少 1 粒 YYrr',hint:'YyRr 自交可产生 YYrr；留种 Yyrr 后自交，得到 YYrr 的概率更高。',reward:60,test:s=>s.harvested.YYrr>0},
    {title:'第四封信 · 留住绿色圆粒',request:'收获至少 1 粒 yyRR',hint:'YyRr 自交可产生 yyRR；留种 yyRr 后自交，得到 yyRR 的概率更高。',reward:60,test:s=>s.harvested.yyRR>0},
    {title:'第五封信 · 四种表型的花园',request:'累计收获黄色圆粒、黄色皱粒、绿色圆粒、绿色皱粒',hint:'基因型不同也可能表现出同一种表型。观察你的收获图鉴。',reward:80,test:s=>new Set(TYPES.filter(g=>s.harvested[g]>0).map(phenotype)).size===4},
    {title:'第六封信 · 建立纯合种库',request:'分别完成 YYRR、YYrr、yyRR、yyrr 的自交收获',hint:'选择同一纯合亲本放入两个位置进行自交。四条纯合品系自交，后代的基因型保持稳定。',reward:120,test:s=>PURE.every(g=>s.stabilized[g])}
  ];
  function newGame(seed=20260925){
    return {version:1,coins:120,level:0,rng:seed>>>0,parents:['YYRR','yyrr'],owned:{YYRR:{generation:0,parents:[]},yyrr:{generation:0,parents:[]}},batch:null,harvested:Object.fromEntries(TYPES.map(g=>[g,0])),stabilized:{},contract:0,history:[],crosses:0,sold:0};
  }
  function nextRandom(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;}
  function breed(state,a=state.parents[0],b=state.parents[1]){
    if(!state.owned[a]||!state.owned[b])throw Error('请先选取已拥有的两株亲本。');
    if(state.batch)throw Error('请先出售本轮种子，再腾出苗床。');
    const level=LEVELS[state.level];if(state.coins<level.cost)throw Error('资金不足，请领取补给。');
    const s=copy(state),generation=Math.max(s.owned[a].generation,s.owned[b].generation)+1;
    const distribution=Object.entries(Genetics.cross(a,b).genotypes),counts={};
    s.coins-=level.cost;s.parents=[a,b];
    for(let i=0;i<level.size;i++){
      let draw=nextRandom(s),chosen=distribution[distribution.length-1][0];
      for(const [g,p]of distribution){if(draw<p){chosen=g;break;}draw-=p;}
      counts[chosen]=(counts[chosen]||0)+1;s.harvested[chosen]++;
    }
    const isNew=Object.keys(counts).filter(g=>!s.owned[g]);
    Object.keys(counts).forEach(g=>{s.owned[g]={generation,parents:[a,b]};});
    if(a===b&&PURE.includes(a))s.stabilized[a]=true;
    s.crosses++;s.batch={counts,generation,parents:[a,b],size:level.size,newTypes:isNew};
    s.history.unshift({a,b,generation,counts:copy(counts),round:s.crosses});s.history=s.history.slice(0,8);
    return s;
  }
  function sell(state){if(!state.batch)throw Error('没有待出售的种子。');const s=copy(state);const n=total(s.batch.counts);s.coins+=n;s.sold+=n;s.batch=null;return s;}
  function claim(state){const c=CONTRACTS[state.contract];if(!c||!c.test(state))throw Error('还未满足当前订单条件。');const s=copy(state);s.coins+=c.reward;s.contract++;return s;}
  function upgrade(state){const l=LEVELS[state.level+1];if(!l)throw Error('温室已升至最高级。');if(state.coins<l.price)throw Error('金币不足，可以出售种子或完成订单。');if(state.coins-l.price<l.cost&&!state.batch)throw Error('升级后需留足下一轮育种费用。');const s=copy(state);s.coins-=l.price;s.level++;return s;}
  function recover(state){const s=copy(state);if(s.coins<LEVELS[s.level].cost&&!s.batch)s.coins=LEVELS[s.level].cost;return s;}
  function choose(state,slot,g){if(![0,1].includes(slot)||!state.owned[g])throw Error('请选择种库中的亲本。');const s=copy(state);s.parents[slot]=g;return s;}
  const int=(n,min=0,max=1000000000)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
  const validCounts=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.entries(o).every(([g,n])=>TYPES.includes(g)&&int(n));
  function validate(input){try{
    const s=typeof input==='string'?JSON.parse(input):copy(input);
    if(!s||s.version!==1||!int(s.coins)||!int(s.level,0,2)||!int(s.rng,0,4294967295)||!int(s.contract,0,6)||!int(s.crosses)||!int(s.sold))return null;
    if(!s.owned||typeof s.owned!=='object'||Array.isArray(s.owned)||!s.owned.YYRR||!s.owned.yyrr||Object.keys(s.owned).some(g=>!TYPES.includes(g)))return null;
    const pair=p=>Array.isArray(p)&&p.length===2&&p.every(g=>TYPES.includes(g));
    for(const p of Object.values(s.owned))if(!p||!int(p.generation)||!Array.isArray(p.parents)||!(p.parents.length===0&&p.generation===0||pair(p.parents)&&p.generation>0))return null;
    if(!pair(s.parents)||s.parents.some(g=>!s.owned[g])||!validCounts(s.harvested)||TYPES.some(g=>!int(s.harvested[g])))return null;
    if(!s.stabilized||typeof s.stabilized!=='object'||Array.isArray(s.stabilized)||Object.entries(s.stabilized).some(([g,v])=>!PURE.includes(g)||v!==true||s.harvested[g]===0))return null;
    if(s.batch!==null){const b=s.batch;if(!b||!validCounts(b.counts)||!pair(b.parents)||!int(b.generation,1)||![16,24,32].includes(b.size)||total(b.counts)!==b.size||!Array.isArray(b.newTypes)||b.newTypes.some(g=>!TYPES.includes(g)||!b.counts[g])||Object.entries(b.counts).some(([g,n])=>n>s.harvested[g]||!s.owned[g]))return null;}
    if(total(s.harvested)!==s.sold+(s.batch?total(s.batch.counts):0))return null;
    if(total(s.harvested)<s.crosses*16||total(s.harvested)>s.crosses*32)return null;
    if(!Array.isArray(s.history)||s.history.length>8||s.history.length!==Math.min(s.crosses,8))return null;
    for(let i=0;i<s.history.length;i++){const h=s.history[i];if(!h||!pair([h.a,h.b])||!int(h.generation,1)||!validCounts(h.counts)||![16,24,32].includes(total(h.counts))||h.round!==s.crosses-i)return null;}
    for(let i=0;i<s.contract;i++)if(!CONTRACTS[i].test(s))return null;
    return s;
  }catch(e){return null;}}
  let active=null;
  function unmount(){if(active){active.container.removeEventListener('click',active.click);active.container.innerHTML='';active=null;}}
  function mount(container,options={}){
    unmount();let s=newGame(),saved=false,storageOK=true;
    try{const raw=localStorage.getItem(KEY);if(raw){const parsed=validate(raw);if(parsed){s=parsed;saved=true;}}}catch(e){storageOK=false;}
    let slot=0,notice=saved?'已恢复你的温室。亲本、金币和收获记录都在。':'欢迎来到遗传温室。先让 YYRR 与 yyrr 相遇，收下你的第一代豌豆。',tab='stock';
    const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const icon=g=>options.seedIcon?options.seedIcon(g): '<span class="garden-fallback">●</span>';
    const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){storageOK=false;}};
    const notify=m=>{notice=m;if(options.toast)options.toast(m);};
    function render(){
      const l=LEVELS[s.level],c=CONTRACTS[s.contract],nxt=LEVELS[s.level+1],ready=c&&c.test(s),discovered=Object.keys(s.owned).length;
      container.innerHTML=`<section class="garden" aria-label="自由育种温室">
        <div class="garden-heading"><div><span class="garden-eyebrow">THE LIVING COLLECTION · 自由育种</span><h2>把遗传规律，种成一座花园。</h2><p>亲本可以反复使用。每轮收获自动留种，下一代由你选择。</p></div><div class="garden-wallet"><strong>${s.coins}</strong><span>金币</span><small>${l.name} · ${l.size} 粒 / 轮</small></div></div>
        <div class="garden-notice" role="status" aria-live="polite">${esc(notice)}</div>
        <div class="garden-objective-strip"><span>${c?`当前委托 ${s.contract+1}/6 · ${c.request}`:"全部委托已完成 · 继续经营你的温室"}</span><button type="button" data-garden="objective">查看委托 ↓</button></div>
        <div class="garden-layout"><div class="garden-main">
          <div class="garden-cross-panel"><div class="garden-sectionline"><h3>01 / 选亲本，开始育种</h3><span>已完成 ${s.crosses} 轮</span></div>
          <div class="garden-parents">${s.parents.map((g,i)=>`<button type="button" class="garden-parent ${slot===i?'is-selecting':''}" data-garden="slot" data-slot="${i}" aria-pressed="${slot===i}"><span>亲本 ${i===0?'A':'B'} · 点击切换</span>${icon(g)}<strong>${g}</strong><small>${phenotype(g)} · 谱系第 ${s.owned[g].generation} 代</small></button>`).join('<span class="garden-times" aria-hidden="true">×</span>')}</div>
          <p class="garden-teach">${s.parents[0]===s.parents[1]?'同一品系自交：每个子代仍分别从两份配子中各获得一个等位基因。':'杂交：每个子代从两株亲本各获得一份配子，Y/y 与 R/r 独立分配。'}</p>
          <button type="button" class="garden-btn garden-primary" data-garden="breed" ${s.batch||s.coins<l.cost?'disabled':''}>${s.batch?'苗床里还有收获 · 请先出售':`培育 ${l.size} 粒下一代 · ${l.cost} 金币`}</button>
          ${s.coins<l.cost&&!s.batch?'<button type="button" class="garden-btn" data-garden="recover">领取免费育种补给</button>':''}
          <p class="garden-micro">每粒种子可售 1 金币。本轮售出全部可回收 ${l.size} 金币，亲本永久保留。</p></div>
          <div class="garden-harvest"><div class="garden-sectionline"><h3>02 / 本轮收获</h3>${s.batch?`<span>谱系第 ${s.batch.generation} 代 · ${s.batch.size} 粒</span>`:'<span>等待播种</span>'}</div>
          ${s.batch?`<div class="garden-seed-grid">${Object.entries(s.batch.counts).sort(([a],[b])=>TYPES.indexOf(a)-TYPES.indexOf(b)).map(([g,n])=>`<button type="button" class="garden-harvest-card" data-garden="pick" data-genotype="${g}" aria-label="选择 ${g} 为亲本 ${slot===0?'A':'B'}">${s.batch.newTypes.includes(g)?'<span class="garden-new">新发现</span>':''}${icon(g)}<strong>${g} <b>×${n}</b></strong><small>${phenotype(g)}</small><span>选为亲本 ${slot===0?'A':'B'} ↗</span></button>`).join('')}</div><button type="button" class="garden-btn garden-sell" data-garden="sell">出售本轮全部种子 · +${s.batch.size} 金币</button><p class="garden-micro">所有基因型已自动留种。出售不会移除亲本，也不会清除订单进度。</p>`:'<div class="garden-empty"><span aria-hidden="true">✧</span><p>一块空苗床，许多种可能。</p><small>选好亲本后开始培育。观察随机分离，再决定下一轮留什么。</small></div>'}</div>
          <div class="garden-collection"><div class="garden-tabs" role="group" aria-label="温室记录"><button type="button" data-garden="tab" data-tab="stock" class="${tab==='stock'?'active':''}">亲本种库 ${discovered}/9</button><button type="button" data-garden="tab" data-tab="history" class="${tab==='history'?'active':''}">谱系手记 ${Math.min(s.crosses,8)}</button></div>
          ${tab==='stock'?`<p class="garden-micro">正在挑选亲本 ${slot===0?'A':'B'}。点卡片即可替换；同一品系可选两次进行自交。</p><div class="garden-stock-grid">${TYPES.map(g=>s.owned[g]?`<button type="button" class="garden-stock ${s.parents.includes(g)?'is-parent':''}" data-garden="pick" data-genotype="${g}">${icon(g)}<strong>${g}</strong><small>${phenotype(g)}</small><span>谱系第 ${s.owned[g].generation} 代</span>${s.stabilized[g]?'<em>纯合自交已验证 ✓</em>':''}</button>`:`<div class="garden-stock is-locked"><span class="garden-unknown">?</span><strong>${g}</strong><small>等待发现</small></div>`).join('')}</div>`:`<div class="garden-history">${s.history.length?s.history.map(h=>`<article><span>第 ${h.round} 轮 · 谱系第 ${h.generation} 代</span><strong>${h.a} × ${h.b}</strong><p>${Object.entries(h.counts).map(([g,n])=>`${g} ×${n}`).join(' · ')}</p></article>`).join(''):'<p>第一轮收获后，亲本组合与子代数量会记在这里。</p>'}</div>`}</div>
        </div><aside class="garden-aside"><div class="garden-contract"><span class="garden-eyebrow">来自小镇的育种委托</span><div class="garden-stamps">${CONTRACTS.map((_,i)=>`<span class="${i<s.contract?'done':i===s.contract?'current':''}">${i<s.contract?'✓':i+1}</span>`).join('')}</div>${c?`<h3>${c.title}</h3><p class="garden-request">${c.request}</p><p class="garden-hint">${c.hint}</p>${s.contract===5?`<div class="garden-pure-check">${PURE.map(g=>`<span>${s.stabilized[g]?'✓':'○'} ${g}</span>`).join('')}</div>`:''}<button type="button" class="garden-btn ${ready?'garden-primary':''}" data-garden="claim" ${ready?'':'disabled'}>${ready?'交付研究记录':'继续培育，达成委托'} · +${c.reward}</button><small>订单查看累计收获记录，不扣除种子。</small>`:'<h3>六封回信，寄出了。</h3><p class="garden-request">你已建立完整纯合种库。</p><p class="garden-hint">温室继续开放。试试测交、比较不同亲本，或在多轮大样本中观察比例。</p><span class="garden-complete">✦ 小镇育种师</span>'}</div>
          <div class="garden-upgrade"><span class="garden-eyebrow">温室扩建</span><h3>${nxt?nxt.name:'温室已全部扩建'}</h3><p>${nxt?`每轮收获 ${nxt.size} 粒，育种费用 ${nxt.cost} 金币。样本更大，更容易收集少见基因型。`:'每轮 32 粒，让更多遗传组合在这里生长。'}</p>${nxt?`<button type="button" class="garden-btn" data-garden="upgrade" ${s.coins<nxt.price||(!s.batch&&s.coins-nxt.price<nxt.cost)?'disabled':''}>扩建 · ${nxt.price} 金币</button><small>扩建后会为你预留下一轮育种费用。</small>`:''}</div>
          <div class="garden-notebook"><span class="garden-eyebrow">遗传学家的便笺</span><p><b>表型 ≠ 基因型。</b>黄色圆粒可能对应 4 种基因型。卡片上的基因型由教学模型揭示，不能直接凭外观观察。</p><p>Y 对 y、R 对 r 完全显性；两对基因独立遗传，后代存活率相同。每轮结果有随机波动，理论比例不保证在小样本中准确出现。</p><p>谱系代数 = 两株亲本中较大的代数 + 1；每种基因型保留最近一轮留种的亲本档案。</p></div>
        </aside></div><footer class="garden-footer"><span>${storageOK?'进度已自动保存在此浏览器':'当前浏览器无法保存，请保持页面打开'} · 可随时返回关卡</span><span>遗传温室 / MENDEL’S GARDEN</span></footer>
      </section>`;
    }
    function click(e){const b=e.target.closest('[data-garden]');if(!b||!container.contains(b)||b.disabled)return;const action=b.dataset.garden;
      try{
        if(action==='slot'){slot=Number(b.dataset.slot);notice=`从种库或本轮收获中，选择亲本 ${slot===0?'A':'B'}。`;}
        if(action==='pick'){s=choose(s,slot,b.dataset.genotype);notice=`已选择 ${b.dataset.genotype} 作为亲本 ${slot===0?'A':'B'}。`;}
        if(action==='tab')tab=b.dataset.tab;
        if(action==='objective'){container.querySelector('.garden-contract').scrollIntoView({behavior:'smooth',block:'start'});return;}
        if(action==='breed'){s=breed(s);notify(`收获 ${s.batch.size} 粒！${s.batch.newTypes.length?`发现 ${s.batch.newTypes.length} 种新基因型，已自动留种。`:'子代已留种，可用于下一轮育种。'}`);if(options.playTone)options.playTone('success');}
        if(action==='sell'){const n=s.batch.size;s=sell(s);notify(`售出 ${n} 粒种子，获得 ${n} 金币。所有亲本已保留。`);}
        if(action==='claim'){const r=CONTRACTS[s.contract].reward;s=claim(s);notify(`研究记录已交付，收到 ${r} 金币${s.contract===6?'。六份委托全部完成！':'，下一封委托已到达。'}`);}
        if(action==='upgrade'){s=upgrade(s);notify(`扩建完成！每轮可培育 ${LEVELS[s.level].size} 粒种子。`);}
        if(action==='recover'){s=recover(s);notify('育种补给已到账，可以继续培育。');}
        save();render();
      }catch(error){notify(error.message);render();}
    }
    active={container,click};container.addEventListener('click',click);render();
    return {getState:()=>copy(s),unmount};
  }
  return Object.freeze({mount,unmount,newGame,breed,sell,claim,upgrade,recover,choose,validate,phenotype,LEVELS,CONTRACTS,TYPES,KEY});
});
