(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Genetics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Mendelian model: complete dominance, independent assortment and equally viable offspring.
  function pairs(genotype) {
    if (typeof genotype !== 'string' || !/^(?:[Aa]{2}|[Yy]{2}[Rr]{2})$/.test(genotype)) {
      throw new TypeError('Invalid genotype: expected AA/Aa/aa or a Y/y pair followed by an R/r pair.');
    }
    return genotype.match(/.{2}/g).map(pair => pair.split('').sort().join(''));
  }

  function gametes(genotype) {
    return pairs(genotype).reduce((result, pair) => result.flatMap(prefix => [prefix + pair[0], prefix + pair[1]]), ['']);
  }

  function phenotype(genotype) {
    if (genotype.length === 2) return genotype.includes('A') ? '紫花' : '白花';
    return (genotype.includes('Y') ? '黄色' : '绿色') + (genotype.includes('R') ? '圆粒' : '皱粒');
  }

  function cross(a, b) {
    const first = gametes(a);
    const second = gametes(b);
    if (a.length !== b.length) throw new TypeError('Cannot cross genotypes with different genes.');
    const genotypes = {};
    const phenotypes = {};
    const weight = 1 / (first.length * second.length);
    for (const x of first) for (const y of second) {
      const genotype = [...x].map((allele, i) => [allele, y[i]].sort().join('')).join('');
      const trait = phenotype(genotype);
      genotypes[genotype] = (genotypes[genotype] || 0) + weight;
      phenotypes[trait] = (phenotypes[trait] || 0) + weight;
    }
    return { genotypes, phenotypes };
  }

  function sample(a, b, n, rng = Math.random) {
    if (!Number.isSafeInteger(n) || n < 0) throw new TypeError('Offspring count must be a nonnegative integer.');
    const distribution = Object.entries(cross(a, b).phenotypes);
    const counts = {};
    for (let i = 0; i < n; i++) {
      let draw = rng();
      if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Random source must return a number in [0, 1).');
      let selected = distribution[distribution.length - 1][0];
      for (const [trait, probability] of distribution) {
        if (draw < probability) { selected = trait; break; }
        draw -= probability;
      }
      counts[selected] = (counts[selected] || 0) + 1;
    }
    return counts;
  }

  return Object.freeze({ gametes, cross, sample });
});

;
(function (root, factory) {
  const missions = factory();
  if (typeof module === 'object' && module.exports) module.exports = missions;
  else root.ExtraMissions = missions;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return [
    {
      title:'把彼此缺少的，寄给对方',short:'互补的两封信',topic:'纯合亲本的互补',icon:'✉',from:'南北两座种子仓',
      copy:'南仓只有黄色皱粒，北仓只有绿色圆粒。管理员不想买新种子：能否让这两种纯合亲本的孩子，同时拥有黄色和圆粒？',
      goal:'后代全部为 YyRr',condition:'一株黄色皱粒纯合亲本，与一株绿色圆粒纯合亲本杂交。',target:'黄色圆粒',p:1,family:2,
      check:(a,b,d)=>[a,b].includes('YYrr')&&[a,b].includes('yyRR')&&d.genotypes.YyRr===1,
      hint:'纯合亲本只产生一种配子。黄色皱粒给出 Yr；绿色圆粒给出 yR。把两个信封合在一起看看。',
      insight:'互补的纯合亲本 YYrr 与 yyRR 分别提供 Yr、yR，后代可全部成为 YyRr。后代的显性性状可以分别来自不同亲本；显性等位基因不必原本就在同一株上。'
    },
    {
      title:'绿色圆粒的三张入场券',short:'十六格里的三格',topic:'双因子概率相乘',icon:'♣',from:'雨后的小剧场',
      copy:'剧场用绿色圆粒种子做入场券。希望这种种子占全部后代的十六分之三，让一种颜色与另一种形状一起决定名额。',
      goal:'绿色圆粒的理论比例为 3/16',condition:'两对基因独立遗传；同时考虑绿色与圆粒。',target:'绿色圆粒',p:3/16,family:2,
      check:(a,b,d)=>d.phenotypes['绿色圆粒']===3/16,
      hint:'绿色必须是 yy，圆粒却可以是 RR 或 Rr。先找出使这两个事件概率分别为 1/4 和 3/4 的组合。',
      insight:'在 YyRr 自交中，绿色 yy 的概率为 1/4，圆粒 R_ 的概率为 3/4。两对基因独立遗传时，两者同时出现的概率为 3/16；不能把圆粒只算成 RR。'
    },
    {
      title:'八分之一的折皮信封',short:'八分之一的配方',topic:'不对称亲本组合',icon:'◇',from:'折纸工坊',
      copy:'工坊想用绿色皱粒做信封上的封印。这次不要十六分之一：请让它出现的机会翻一倍，同时保留两株亲本中的黄色秘密。',
      goal:'绿色皱粒的理论比例为 1/8',condition:'两株亲本在颜色基因上都必须是 Yy。',target:'绿色皱粒',p:1/8,family:2,
      check:(a,b,d)=>a.startsWith('Yy')&&b.startsWith('Yy')&&d.phenotypes['绿色皱粒']===1/8,
      hint:'Yy × Yy 让绿色占 1/4。要得到 1/8，皱粒应占多少？Rr 与哪种形状基因型搭配能做到？',
      insight:'YyRr 与 Yyrr 杂交时，yy 的概率为 1/4，rr 的概率为 1/2，故 yyrr 为 1/8。亲本不必相同，仍可分开分析每一对等位基因，再组合概率。'
    },
    {
      title:'只收皱粒的邮票展',short:'黄色皱粒占一半',topic:'限定性状的测交',icon:'▧',from:'旧邮票收藏馆',
      copy:'收藏馆的底纸只适合皱粒种子。请让所有后代都保持皱粒，其中黄色与绿色机会均等；馆里指定一株绿色皱粒做亲本。',
      goal:'后代全部皱粒，黄色皱粒占 1/2',condition:'必须使用 yyrr 作为一个亲本。',target:'黄色皱粒',p:.5,family:2,
      check:(a,b,d)=>[a,b].includes('yyrr')&&d.phenotypes['黄色皱粒']===.5&&(d.phenotypes['绿色皱粒']||0)===.5,
      hint:'想让所有后代都是 rr，两个亲本都只能给 r。再用 Yy 与 yy 搭配，决定颜色的一半一半。',
      insight:'Yyrr × yyrr 中，形状基因固定为 rr；只有颜色基因发生分离，后代 Yyrr 与 yyrr 各占 1/2。一次双因子杂交也可能只有一对性状发生分离。'
    },
    {
      title:'同样的绿色，不同的标签',short:'看得见与看不见',topic:'区分基因型与表现型',icon:'◑',from:'植物档案室',
      copy:'档案员提出两个要求：绿色圆粒要占四分之三，而标签写着 yyRr 的种子要占一半。两个比例看起来不同，能同时实现吗？',
      goal:'yyRr 占 1/2，绿色圆粒占 3/4',condition:'全部后代必须为绿色。预测栏填写表现型比例。',target:'绿色圆粒',p:.75,family:2,
      check:(a,b,d)=>d.genotypes.yyRr===.5&&d.phenotypes['绿色圆粒']===.75&&(d.phenotypes['绿色皱粒']||0)===.25,
      hint:'绿色圆粒不只有 yyRr，也包括 yyRR。让颜色固定为 yy，再找出形状基因型为 1∶2∶1 的组合。',
      insight:'yyRr × yyRr 的后代 yyRR、yyRr、yyrr 为 1∶2∶1。因此 yyRr 占 1/2，而绿色圆粒要把 yyRR 与 yyRr 相加，得到 3/4。基因型概率与表现型概率不能直接互换。'
    },
    {
      title:'一模一样的四种秘密',short:'全显性，四种标签',topic:'相同表现型中的遗传差异',icon:'✥',from:'双胞胎的种子铺',
      copy:'两位店主想要一批外表全是黄色圆粒的种子，但不能只有一种遗传标签。请让双杂合子恰好占四分之一，藏在相同的外表下面。',
      goal:'全部黄色圆粒，其中 YyRr 占 1/4',condition:'预测栏填写黄色圆粒的比例，而不是 YyRr 的比例。',target:'黄色圆粒',p:1,family:2,
      check:(a,b,d)=>d.phenotypes['黄色圆粒']===1&&d.genotypes.YyRr===.25,
      hint:'在颜色这对基因上，让纯合显性与杂合相遇；形状也这样做，但把两个纯合显性安排在不同亲本中。',
      insight:'YYRr × YyRR 可产生 YYRR、YYRr、YyRR、YyRr 四种等概率基因型，外表却都为黄色圆粒。外表一致并不意味着基因型一致，也不意味着后代会稳定遗传。'
    },
    {
      title:'两条路，都能寄到',short:'八分之三的岔路',topic:'寻找多种可行解',icon:'⑂',from:'山路岔口的邮差',
      copy:'邮差带着一株 YyRr，在两个方向之间犹豫。请找一位伙伴，让黄色圆粒占八分之三。这封信有不止一种正确的寄法。',
      goal:'黄色圆粒的理论比例为 3/8',condition:'至少一株亲本必须为 YyRr。',target:'黄色圆粒',p:3/8,family:2,
      check:(a,b,d)=>[a,b].includes('YyRr')&&d.phenotypes['黄色圆粒']===3/8,
      hint:'3/8 可以是 3/4 × 1/2，也可以是 1/2 × 3/4。让颜色与形状轮流承担那一半概率。',
      insight:'YyRr 与 Yyrr 或 yyRr 杂交，黄色圆粒的概率都为 3/8，分别来自 3/4 × 1/2 与 1/2 × 3/4。目标表现型比例相同，整批后代的其他性状分布仍可能不同。'
    },
    {
      title:'给下一代留一扇窗',short:'毕业前的双标签',topic:'兼顾外观与遗传潜力',icon:'❦',from:'未来的种子守护人',
      copy:'最后一批种子都要绿色圆粒。一半标签必须是 yyRR，另一半必须是 yyRr：既保留稳定的形状，也为下一代留下变化的可能。',
      goal:'yyRR 与 yyRr 各占 1/2',condition:'全部后代绿色圆粒；预测栏填写表现型比例。',target:'绿色圆粒',p:1,family:2,
      check:(a,b,d)=>d.genotypes.yyRR===.5&&d.genotypes.yyRr===.5&&d.phenotypes['绿色圆粒']===1,
      hint:'两边都只能提供 y。形状这对基因中，一边只给 R，另一边等概率给 R 或 r。',
      insight:'yyRR × yyRr 的后代全为绿色圆粒，但 yyRR 与 yyRr 各占 1/2。单独自交时，前者的形状可稳定遗传，后者的形状会分离；这解释了为什么育种不能只看外表。'
    }
  ];
});

;
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PeaProgress=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const gen=/^(?:AA|Aa|aa|(?:YY|Yy|yy)(?:RR|Rr|rr))$/;
const number=(v,max=1e9)=>Number.isSafeInteger(v)&&v>=0?Math.min(v,max):0;
const traits=['紫花','白花','黄色圆粒','黄色皱粒','绿色圆粒','绿色皱粒'];
function safeRecord(r){if(!r||!gen.test(r.a)||!gen.test(r.b)||r.a.length!==r.b.length||!Number.isSafeInteger(r.n)||r.n<1||r.n>10048)return null;const sample={};for(const t of traits)if(number(r.sample?.[t]))sample[t]=number(r.sample[t],10048);if(Object.values(sample).reduce((a,b)=>a+b,0)!==r.n)return null;return {a:r.a,b:r.b,n:r.n,sample,mode:r.mode==='lab'?'lab':'orders',label:typeof r.label==='string'?r.label.slice(0,50):'实验记录',date:typeof r.date==='string'?r.date.slice(0,40):''};}
function normalize(raw,count){const r=raw&&typeof raw==='object'?raw:{};const stars=Array.from({length:count},(_,i)=>Number.isInteger(r.stars?.[i])&&r.stars[i]>=0&&r.stars[i]<=3?r.stars[i]:0);let frontier=stars.findIndex(s=>!s);if(frontier===-1)frontier=count-1;const stats={};for(const key of ['experiments','plants','labCrosses'])stats[key]=number(r.stats?.[key]);return {version:2,stars,level:Math.min(number(r.level,count-1),frontier),sound:r.sound===true,reducedMotion:r.reducedMotion===true,history:Array.isArray(r.history)?r.history.map(safeRecord).filter(Boolean).slice(-40):[],stats,workshops:Array.isArray(r.workshops)?[...new Set(r.workshops.filter(g=>['YyRr','YYRr','Yyrr'].includes(g)))]:[]};}
function record(s,r){const entry=safeRecord({...r,date:new Date().toISOString()});if(!entry)throw new TypeError('Invalid experiment record');s.history.push(entry);s.history=s.history.slice(-40);s.stats.experiments++;s.stats.plants+=entry.n;if(entry.mode==='lab')s.stats.labCrosses++;return entry;}
function badges(s){const completed=s.stars.filter(Boolean).length;return [
{id:'first',icon:'✉',name:'第一封回信',desc:'完成一封委托',earned:completed>=1},
{id:'precise',icon:'✧',name:'精准预言家',desc:'获得一枚三星邮票',earned:s.stars.includes(3)},
{id:'mendel',icon:'❀',name:'孟德尔的学徒',desc:'完成前八封温室来信',earned:s.stars.slice(0,8).every(Boolean)},
{id:'researcher',icon:'⚗',name:'永远好奇',desc:'在自由实验室进行十次实验',earned:s.stats.labCrosses>=10},
{id:'thousand',icon:'❧',name:'千粒观察家',desc:'在实验台累计种下 1000 颗种子',earned:s.stats.plants>=1000},
{id:'gametes',icon:'✣',name:'配子收集家',desc:'完成配子工坊的三种挑战',earned:s.workshops.length===3},
{id:'postmaster',icon:'♧',name:'温室邮局长',desc:'完成全部十六封委托',earned:completed===16},
{id:'master',icon:'★',name:'满星遗传学家',desc:'全部十六封委托获得三星',earned:s.stars.length===16&&s.stars.every(x=>x===3)}];}
return {normalize,record,badges};
});

;
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./genetics.js'):root.Genetics);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PeaGarden=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Genetics){
  'use strict';
  const KEY='pea-post-app-garden-v1';
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

;
'use strict';
(() => {
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const mono=['AA','Aa','aa'];const di=['YYRR','YYRr','YYrr','YyRR','YyRr','Yyrr','yyRR','yyRr','yyrr'];
const missions=[
{title:'第一封紫色的信',short:'第一封紫色的信',topic:'显性与隐性',icon:'✿',from:'山坡上的花店',copy:'春日花展需要一整片紫色。请让纯种紫花与白花相遇，看看它们的孩子会是什么颜色。',goal:'后代全部开紫花',condition:'必须使用一株白花亲本。',target:'紫花',p:1,check:(a,b,d)=>[a,b].includes('aa')&&d.phenotypes['紫花']===1,hint:'白花只能是 aa。要保证每个孩子都有 A，另一株亲本需要提供怎样的配子？',insight:'AA × aa 的后代全为 Aa，表现紫花。a 没有消失，只是在完全显性的条件下不表现为白花。',family:1},
{title:'消失的白色回来了',short:'白色回来了',topic:'分离定律',icon:'❀',from:'爱收集花瓣的小朋友',copy:'上一次的紫花里，会不会藏着白色？我想让白花重新出现，但不想整座花园都变白。',goal:'白花的理论比例恰为 1/4',condition:'试着让两个带有秘密的亲本相遇。',target:'白花',p:.25,check:(a,b,d)=>d.phenotypes['白花']===.25,hint:'Aa 形成配子时，A 与 a 分离。要出现 aa，两个亲本都得有机会提供 a。',insight:'Aa × Aa 的基因型比例为 AA∶Aa∶aa = 1∶2∶1，表现型紫花∶白花 = 3∶1。形成配子时，一对等位基因彼此分离。',family:1},
{title:'一半紫色，一半白色',short:'对半开的花园',topic:'测交',icon:'◐',from:'河岸边的园艺师',copy:'我正在设计一座双色花园。希望紫花和白花各占一半。怎样选择亲本，才能让这个愿望成为概率上的公平？',goal:'白花的理论比例恰为 1/2',condition:'用隐性亲本，读懂另一株的配子。',target:'白花',p:.5,check:(a,b,d)=>d.phenotypes['白花']===.5,hint:'测交，是让待测个体与隐性纯合子杂交。Aa 的两种配子，分别遇到 a 会怎样？',insight:'Aa × aa 产生 Aa、aa 两种后代，各占 1/2。隐性纯合子只提供 a，因此后代的表现型能反映待测亲本的配子类型。',family:1},
{title:'一袋没有署名的种子',short:'神秘种子来信',topic:'证据与推理',icon:'?',from:'没有留下名字的访客',copy:'我留下一株紫花豌豆，却弄丢了基因标签。它是 AA，还是 Aa？请设计一次测交，让它的孩子告诉我们答案。',goal:'用白花亲本，解开紫花的秘密',condition:'选神秘种子「?」与 aa，观察后再判断。',target:'白花',detective:true,check:(a,b)=>[a,b].includes('??')&&[a,b].includes('aa'),hint:'紫花可能是 AA，也可能是 Aa。若测交后出现哪一种花色，就能排除 AA？',insight:'测交后观察到了白花 aa，说明神秘亲本一定提供了 a；它自己开紫花，又必定含 A，所以是 Aa。有限后代全为紫花则不能绝对证明是 AA。',family:1},
{title:'两种愿望，一颗种子',short:'两种愿望',topic:'两对相对性状',icon:'❧',from:'秋收节的种子商',copy:'花色的秘密已经解开了。现在看看豌豆本身：颜色与形状能一起设计吗？我想收一批每颗都携带四种字母的种子。',goal:'后代全部为 YyRr',condition:'同时得到黄色、圆粒的双杂合子。',target:'黄色圆粒',p:1,check:(a,b,d)=>d.genotypes['YyRr']===1,hint:'找两个在这两对基因上都纯合、又互补的亲本。例如，一个只给 YR，另一个只给 yr。',insight:'YYRR × yyrr（或 YYrr × yyRR）可使后代全为 YyRr。Y 对 y 完全显性，R 对 r 完全显性，因此双杂合子表现黄色圆粒。',family:2},
{title:'十六分之一的惊喜',short:'稀有的绿色皱粒',topic:'自由组合定律',icon:'✦',from:'植物标本馆',copy:'我寻找一颗特别的绿色皱粒豌豆。它在双杂合子后代中并不常见，却能帮助我们理解两对基因怎样各自分离、重新组合。',goal:'绿色皱粒的理论比例为 1/16',condition:'颜色与形状这两对基因独立遗传。',target:'绿色皱粒',p:.0625,check:(a,b,d)=>d.phenotypes['绿色皱粒']===.0625,hint:'分别考虑 yy 和 rr 的概率。若两者各为 1/4，而且相互独立，同时发生的概率是多少？',insight:'YyRr × YyRr 中，yy 与 rr 的概率各为 1/4，故 yyrr 为 1/16。四种表现型的理论比例是 9∶3∶3∶1。',family:2},
{title:'四色种子博览会',short:'四种等份的可能',topic:'双因子测交',icon:'✣',from:'小镇自然博览会',copy:'四个展柜，四种豌豆。请把双杂合子藏着的四种配子变成看得见的后代，让每个展柜都有同样的机会。',goal:'四种表现型的概率各为 1/4',condition:'必须使用 yyrr 作为测交亲本。',target:'绿色皱粒',p:.25,check:(a,b,d)=>[a,b].includes('yyrr')&&Object.values(d.phenotypes).length===4&&Object.values(d.phenotypes).every(p=>p===.25),hint:'yyrr 只产生 yr 配子。谁能以相同概率产生 YR、Yr、yR、yr 四种配子？',insight:'YyRr × yyrr 的后代表现型为 1∶1∶1∶1。测交后代把双杂合子的四种等概率配子直接“显示”出来。',family:2},
{title:'寄给未来的绿色',short:'最后一封温室来信',topic:'定向杂交',icon:'♧',from:'明年的你',copy:'把今天的发现寄给明年吧。我想要一批绿色圆粒种子，并让它们保留产生皱粒后代的可能。你能准确写出这一代的配方吗？',goal:'后代全部为 yyRr',condition:'绿色圆粒，而且圆粒这一对必须杂合。',target:'绿色圆粒',p:1,check:(a,b,d)=>d.genotypes['yyRr']===1,hint:'所有孩子都要 yy，两边都得只给 y；所有孩子都要 Rr，一边只给 R，另一边只给 r。',insight:'yyRR × yyrr 的后代全为 yyRr，表现绿色圆粒。表现型相同的个体，基因型不一定相同；若 yyRr 自交，后代仍会出现皱粒。',family:2}
];
missions.push(...ExtraMissions);

function seedIcon(g){if(g.length===4){const hue=g.includes('Y')?'yellow':'green',shape=g.includes('R')?'round':'wrinkled';return `<span class="pea-illustration ${hue}-${shape}" aria-hidden="true"></span>`;}const purple=g!=='aa',flower=g.length===2;const color=g.includes('Y')?'#d9bd62':'#91a570';const wrinkled=!g.includes('R');return flower?`<svg viewBox="0 0 70 85" aria-hidden="true"><path d="M36 76Q26 53 37 26M33 55Q16 51 13 35Q32 33 33 55M33 66Q51 63 56 46Q38 44 33 66" stroke="#6d815b" stroke-width="1.7" fill="#a9b78b"/><path d="M28 68L17 51M39 61L49 51" stroke="#849667" stroke-width=".6"/><g transform="translate(37 24)" stroke="${purple?'#80628c':'#a3ac92'}" stroke-width="1"><path d="M0 1C-23-3-20-24-7-18Q1-30 8-18C23-22 25-3 0 1" fill="${purple?'#b09ab8':'#faf8e7'}"/><path d="M0 0Q-21-11-18 6Q-16 17 0 11Q16 17 18 6Q21-11 0 0" fill="${purple?'#9a7da6':'#f1f0df'}"/><path d="M-8 3Q0-5 8 3Q5 18 0 18Q-5 16-8 3" fill="${purple?'#c4b0cb':'#e7e5c9'}"/></g><path d="M24 77H45" stroke="#879974"/><circle cx="52" cy="17" r="2" fill="#b8b797"/></svg>`:`<svg viewBox="0 0 70 85" aria-hidden="true"><path d="M34 28Q23 19 29 10Q40 13 35 26M35 26Q47 13 51 19Q47 30 35 28" fill="#a9b587" stroke="#768964"/><${wrinkled?'path d="M35 31Q43 25 50 33Q62 33 58 45Q66 54 56 61Q52 74 40 68Q31 77 25 67Q11 68 14 55Q5 47 17 39Q17 28 28 32Z"':'circle cx="36" cy="50" r="25"'} fill="${color}" stroke="#8f935d" stroke-width="1.4"/><path d="${wrinkled?'M29 36Q22 49 32 53Q44 51 36 65M45 33Q39 45 51 50Q54 58 46 61':'M20 43Q23 33 32 32M51 59Q48 66 39 68'}" fill="none" stroke="${wrinkled?'#929158':'#f0e1a0'}" stroke-width="2"/><ellipse cx="30" cy="41" rx="6" ry="4" fill="#fff9d0" opacity=".25"/></svg>`;}
function notebook(){openModal(`<span class="modal-kicker">THE FIELD NOTEBOOK</span><h2 class="modal-title">把发现，留在纸上。</h2><p class="modal-copy">随时可翻的田野笔记。已收集 ${progress.stars.filter(Boolean).length} 枚邮票 · 最佳星数 ${progress.stars.reduce((a,b)=>a+b,0)} / ${missions.length*3}</p><div class="note-list"><article class="note"><h3>01 · 显性不等于“更多”</h3><div class="formula">AA × aa → Aa</div><p>Aa 表现紫花，但 a 依然存在。显性与隐性描述杂合子表现哪种性状，不代表数量、优劣或强弱。</p></article><article class="note"><h3>02 · 分离定律</h3><div class="formula">Aa × Aa → 1 : 2 : 1</div><p>一对等位基因在形成配子时分离，分别进入不同配子。基因型 1∶2∶1，完全显性条件下表现型为 3∶1。</p></article><article class="note"><h3>03 · 用测交读出秘密</h3><div class="formula">Aa × aa → 1 : 1</div><p>隐性纯合子只提供隐性配子。若紫花测交后出现白花，则紫花亲本是杂合子；有限后代全显性不等于绝对证明纯合。</p></article><article class="note"><h3>04 · 自由组合有条件</h3><div class="formula">YyRr × YyRr → 9 : 3 : 3 : 1</div><p>两对基因独立遗传时，配子 YR、Yr、yR、yr 各占 1/4。位于非同源染色体上的非等位基因遵循自由组合定律；不能套用于所有基因。</p></article><article class="note"><h3>05 · 概率不是小样本承诺</h3><div class="formula">P(yyrr) = ¼ × ¼ = ¹⁄₁₆</div><p>理论比例描述大量后代的统计规律。16 颗种子不保证刚好有 1 颗绿色皱粒。点击“再种”可以观察随机波动。</p></article><article class="note"><h3>06 · 孟德尔怎样做实验？</h3><p>选择稳定遗传、性状易区分的豌豆；杂交时对母本去雄、套袋，成熟后人工授粉并再套袋。提出假说，再用测交验证。</p></article></div><p class="source">模型约定：A/a 表示花色；Y/y 表示种子颜色；R/r 表示种子形状。大写表示显性，小写表示隐性。游戏是理想化孟德尔遗传模型。<br>知识核对：<a href="https://openstax.org/books/biology-2e/pages/12-3-laws-of-inheritance" target="_blank" rel="noopener">OpenStax · Laws of Inheritance</a></p>`);}
const key='pea-post-app-progress-v1';
try{if(!localStorage.getItem(key)&&localStorage.getItem('pea-post-progress-v1'))localStorage.setItem(key,localStorage.getItem('pea-post-progress-v1'));}catch{}
let stored;try{stored=JSON.parse(localStorage.getItem(key));}catch{}
let progress=PeaProgress.normalize(stored,missions.length);
const state={level:progress.level,mode:'orders',family:1,parents:[null,null],slot:0,prediction:null,attempts:0,hinted:false,result:null,seed:1865,busy:false,workshop:{genotype:'YyRr',alleles:[null,null],found:[]}};
let audio,toastTimer;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percent=p=>`${Math.round(p*10000)/100}%`;
const lesson=()=>missions[state.level];
const family=()=>state.mode==='lab'?state.family:lesson().family;
const reduced=()=>progress.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
function rng(){state.seed=(Math.imul(1664525,state.seed)+1013904223)>>>0;return state.seed/4294967296;}
function trait(g){if(g==='??')return '神秘紫花';if(g.length===2)return g.includes('A')?'紫花':'白花';return (g.includes('Y')?'黄色':'绿色')+(g.includes('R')?'圆粒':'皱粒');}
function save(){progress.level=state.level;try{localStorage.setItem(key,JSON.stringify(progress));}catch{toast('浏览器未允许保存进度，可在设置中导出存档。');}}
function playTone(type='tap'){
 if(!progress.sound)return;
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const notes=type==='success'?[523,659,784,1046]:type==='fail'?[294,247]:type==='grow'?[392,523,659]:[523];notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;const t=audio.currentTime+i*.09;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.23);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.25);});}catch{}
}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5500);}
function settingsApply(){document.body.classList.toggle('reduce-motion',progress.reducedMotion);$('#sound').classList.toggle('on',progress.sound);$('#sound').setAttribute('aria-label',progress.sound?'关闭声音':'开启声音');$('#sound').title=progress.sound?'关闭声音':'开启声音';}
function renderSidebar(){
 $('#ordersTab').classList.toggle('active',state.mode==='orders');$('#labTab').classList.toggle('active',state.mode==='lab');$('#gardenTab').classList.toggle('active',state.mode==='garden');
 $('#mailCount').textContent=`${String(state.level+1).padStart(2,'0')} / ${missions.length}`;
 $('#chapters').innerHTML=missions.map((m,i)=>{const unlocked=i===0||progress.stars[i-1]>0;return `${i%4===0?`<div class="chapter-season">${['Ⅰ 花色的秘密','Ⅱ 两种性状的相遇','Ⅲ 概率与组合','Ⅳ 寄往未来的种子'][i/4]}</div>`:''}<button class="chapter ${state.mode==='orders'&&i===state.level?'current':''} ${progress.stars[i]?'done':''}" data-level="${i}" ${unlocked?'':'disabled'} aria-label="第${i+1}关 ${m.short}${unlocked?'':'，待解锁'}"><span class="num">${progress.stars[i]?'✓':String(i+1).padStart(2,'0')}</span><span>${m.short}</span>${progress.stars[i]?`<span class="chapter-stars">${'★'.repeat(progress.stars[i])}</span>`:''}</button>`;}).join('');
 $('#stamps').innerHTML=missions.map((m,i)=>`<button class="stamp ${progress.stars[i]?'earned':''}" data-stamp="${i}" title="${progress.stars[i]?m.topic:'尚未收集'}" aria-label="${m.topic}${progress.stars[i]?'，已获得':'，未获得'}"><span class="stamp-number">${String(i+1).padStart(2,'0')}</span><span class="stamp-picture" aria-hidden="true">${progress.stars[i]?m.icon:'❧'}</span><span class="stamp-name">${m.topic}</span><span class="stamp-state">${progress.stars[i]?'★'.repeat(progress.stars[i]):'待发现'}</span></button>`).join('');$('#stampCount').textContent=`${progress.stars.filter(Boolean).length} / ${missions.length}`;
}
function getStock(){return family()===2?di:lesson().detective&&state.mode==='orders'?['??','AA','Aa','aa']:mono;}
function render(){
 renderSidebar();settingsApply();const garden=state.mode==='garden';$('#experimentView').hidden=garden;$('#gardenView').hidden=!garden;document.body.classList.toggle('garden-mode',garden);if(garden)return;
 const m=lesson(),lab=state.mode==='lab';document.body.classList.toggle('lab-mode',lab);
 $('#chapterTag').textContent=lab?'EXPERIMENT FREELY · 让好奇心带路':`CHAPTER ${String(state.level+1).padStart(2,'0')} · ${m.topic}`;
 $('#missionTitle').textContent=lab?'不妨，种下一个「如果」。':m.title;
 $('#journeyLabel').textContent=lab?'每一个假设，都值得实验':`${['第一季 · 花色的秘密','第二季 · 两种性状的相遇','第三季 · 概率与组合','第四季 · 寄往未来的种子'][Math.floor(state.level/4)]}`;
 $('#journeyFill').style.width=progress.stars.filter(Boolean).length/missions.length*100+'%';$('#journeyScore').textContent=`${progress.stars.reduce((a,b)=>a+b,0)} / ${missions.length*3} ★`;
 $('#letterNo').textContent=lab?'∞':String(state.level+1).padStart(2,'0');$('#recipient').textContent=lab?'致 永远好奇的你：':'致 新来的温室管理员：';
 $('#letterCopy').textContent=lab?'没有订单，也没有标准答案。任意搭配亲本，看看遗传怎样创造不同的可能。想要繁育下一代？去育种温室留种吧。':m.copy;
 $('#goalText').textContent=lab?'让你的假设在这里发芽。':m.goal;$('#condition').textContent=lab?'可调整初始样本量，比较理论概率与实际数量。':m.condition;$('#signature').textContent=lab?'—— 温室随时向你开放':`—— ${m.from}`;
 $('#forecastLabel').textContent=lab?'选择研究的性状':m.detective?'实验完成后，根据证据判断':`你的预测：后代${m.target}的概率？`;
 const options=[...new Set([0,.25,.5,.75,1,...(family()===2?[.0625]:[]),...(typeof m.p==='number'?[m.p]:[])])].sort((a,b)=>a-b);
 $('#probabilities').innerHTML=lab?`<div class="lab-switch"><button data-family="1" class="${family()===1?'active':''}">花的颜色</button><button data-family="2" class="${family()===2?'active':''}">种子颜色与形状</button></div><label class="batch-label">首批样本 <select id="labSample"><option value="16">16 颗 · 波动明显</option><option value="64" selected>64 颗 · 日常观察</option><option value="256">256 颗 · 大样本</option></select></label>`:m.detective?'<span class="modal-copy">先测交，再揭开隐藏的基因标签。</span>':options.map(p=>`<button data-prob="${p}" class="${state.prediction===p?'active':''}" aria-pressed="${state.prediction===p}">${({'.0625':'1/16','.1875':'3/16','.125':'1/8','.375':'3/8'})[String(p).slice(1)]||percent(p)}</button>`).join('');
 $('#hintBtn').hidden=lab;$('#geneLegend').innerHTML=family()===1?'A · 紫花（显性） &nbsp; a · 白花（隐性）':'Y · 黄色 / y · 绿色 &nbsp;&nbsp; R · 圆粒 / r · 皱粒';renderSeeds();renderDock();
}
function renderSeeds(){
 $('#seeds').innerHTML=getStock().map((g,i)=>`<button draggable="true" class="seed ${state.parents.includes(g)?'in-use':''}" data-gene="${g}" aria-label="选择亲本 ${g==='??'?'神秘紫花':g+' '+trait(g)}"><span class="packet-no">NO. ${String(i+1).padStart(2,'0')}</span><span class="seed-icon">${seedIcon(g)}</span><span><span class="seed-gene">${g==='??'?'A?':g}</span><span class="seed-label" style="display:block">${trait(g)}</span><span class="seed-type" style="display:block">${g==='??'?'标签遗失 · 等你解密':g.length===2?(g==='Aa'?'杂合子':'纯合子'):g[0]===g[1]&&g[2]===g[3]?'双纯合子':g[0]!==g[1]&&g[2]!==g[3]?'双杂合子':'一对基因杂合'}</span></span>${state.parents.includes(g)?'<span class="seed-used">已放入实验台</span>':''}</button>`).join('');
}
function renderDock(){
 state.parents.forEach((g,i)=>{const el=$('#parent'+i);el.dataset.genotype=g||'';el.classList.toggle('selected',state.slot===i);el.setAttribute('aria-pressed',state.slot===i);el.innerHTML=g?`<span class="parent-specimen">${seedIcon(g)}</span><span><b class="parent-gene">${g==='??'?'A?':g}</b><small>${trait(g)} · 点击更换</small></span>`:`<span class="slot-symbol">＋</span><span>放入亲本${i?'二':'一'}<small>${i?'可以重复选择同种亲本':'从下方种子库选择'}</small></span>`;});
 $('#quickParents').innerHTML=`<span>当前配方</span><button data-quickslot="0" class="${state.slot===0?'active':''}">① ${state.parents[0]==='??'?'A?':state.parents[0]||'待选择'}</button><b>×</b><button data-quickslot="1" class="${state.slot===1?'active':''}">② ${state.parents[1]==='??'?'A?':state.parents[1]||'待选择'}</button><span class="quick-note">点击或拖动卡片 · 可重复选</span>`;
 $('#seedGuide').textContent=`点击种子卡 → 亲本${state.slot?'二':'一'}`;
 const ready=state.parents.every(Boolean)&&(state.mode==='lab'||lesson().detective||state.prediction!==null);$('#crossBtn').disabled=!ready||state.busy;$('#crossBtn').innerHTML=state.busy?'✧ 花粉正在旅行…':`<span>✧</span> ${state.mode==='lab'?'开始实验':'开始授粉'} <span>→</span>`;$('#mobileAction').textContent=state.busy?'花粉正在旅行…':ready?'✧ 开始授粉':state.parents.every(Boolean)?'完成概率预测 ↑':'选择亲本 ↓';$('#mobileAction').disabled=state.busy;$('#actionHint').textContent=ready?'配方已准备好，让花粉开始旅行吧':state.parents.every(Boolean)?'再预测一次，才能检验你的想法':'先选择两个亲本，再作出预测';
}
function reset(){state.parents=[null,null];state.slot=0;state.prediction=null;state.attempts=0;state.hinted=false;state.result=null;state.busy=false;render();}
function setMode(mode){if(state.busy)return;if(state.mode==='garden')PeaGarden.unmount();state.mode=mode;closeModal();if(mode==='garden'){render();PeaGarden.mount($('#gardenView'),{seedIcon,playTone,toast});}else{if(mode==='lab')state.family=1;reset();}window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});}
function openModal(html){$('#modalContent').innerHTML=html;const title=$('#modalContent .modal-title');if(title){title.id='sheetTitle';$('#modal').setAttribute('aria-labelledby','sheetTitle');}if(!$('#modal').open)$('#modal').showModal();$('#modal').scrollTop=0;$('#modalContent').scrollTop=0;}
function closeModal(){$('#modal').close();}
function bursts(){if(reduced())return;const el=$('#confetti');el.innerHTML=Array.from({length:26},(_,i)=>`<i style="left:${i*37%100}%;background:${['#c2a95c','#a6b48a','#ae89b3','#bf795c'][i%4]};animation-delay:${i%7*.045}s;transform:rotate(${i*22}deg)"></i>`).join('');setTimeout(()=>el.innerHTML='',2400);}
function grid(a,b){
 const ga=Genetics.gametes(a),gb=Genetics.gametes(b);return `<table class="punnett ${a.length===4?'dihybrid':''}" aria-label="配子组合棋盘"><thead><tr><th>♀ / ♂</th>${gb.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${ga.map(x=>`<tr><th>${x}</th>${gb.map(y=>{const g=[...x].map((c,i)=>[c,y[i]].sort().join('')).join('');return `<td class="${g===g.toLowerCase()?'recessive':''}"><button data-cell="${x}|${y}|${g}" aria-label="查看 ${x} 与 ${y} 形成 ${g}">${g}</button></td>`}).join('')}</tr>`).join('')}</tbody></table><div id="cellExplanation" class="cell-explanation" aria-live="polite">点任意一格，看看这一种后代如何产生。</div>`;
}
function ratios(d){const keys=state.result.a.length===2?['紫花','白花']:['黄色圆粒','黄色皱粒','绿色圆粒','绿色皱粒'];return keys.map(k=>`<div class="ratio-row"><div class="ratio-label"><span>${k}</span><b>${percent(d.phenotypes[k]||0)}</b></div><div class="bar"><span class="${traitClass(k)}" style="width:${(d.phenotypes[k]||0)*100}%"></span></div></div>`).join('');}
function traitClass(t){return ({'紫花':'violet','白花':'white','黄色圆粒':'yellow','黄色皱粒':'yellow wrinkled','绿色圆粒':'green','绿色皱粒':'green wrinkled'})[t]||'';}
function sampleVisual(r){return `<div class="sample-seeds" aria-label="首批种子的性状分布">${r.preview.map((t,i)=>`<button class="sample-seed ${traitClass(t)}" data-sample="${t}" title="第${i+1}颗：${t}" aria-label="第${i+1}颗 ${t}"></button>`).join('')}</div><div class="sample-legend">${Object.keys(r.sample).map(t=>`<span><i class="${traitClass(t)}"></i>${t}</span>`).join('')}</div><small>上方每个点代表首批中的一颗种子（最多显示 64 颗）；下方计数包含后续全部抽样。</small>`;}
function sampledHTML(){const r=state.result;return `${sampleVisual(r)}<div class="sample-title"><strong>累计种下 <span id="sampleN">${r.n}</span> 颗种子</strong><button id="moreSample" ${r.n>=10048?'disabled':''}>${r.n>=10048?'观察已达上限':`再种 ${Math.min(256,10048-r.n)} 颗 ＋`}</button></div><div class="sample-counts">${Object.entries(r.sample).map(([k,n])=>`<span>${k} <b>${n}</b> 颗 <em>${percent(n/r.n)}</em></span>`).join('')}</div><small>实际比例会随机波动，并不要求等于理论概率。增大样本量通常能减小相对偏差。</small><p id="sampleInspection" class="sample-inspection" aria-live="polite"></p>`;}
function award(){const stars=Math.max(1,3-state.attempts-(state.hinted?1:0));progress.stars[state.level]=Math.max(progress.stars[state.level],stars);save();renderSidebar();playTone('success');bursts();return stars;}
function resultHTML(success,reason){
 const r=state.result,m=lesson(),lab=state.mode==='lab';let stars=0;if(success&&!lab)stars=award();
 openModal(`<article class="result-sheet ${success?'is-success':'is-retry'}">
 <header class="result-cover"><div class="result-heading"><div class="result-seal" aria-hidden="true">${lab?'⚗':success?m.icon:'↻'}</div><div><div class="modal-kicker">${lab?'GREENHOUSE · FIELD RECORD':success?'PEA POST · DELIVERED':'PEA POST · TRY AGAIN'}</div><h2 class="modal-title">${lab?'一场新的实验观察':success?'投递成功，发现已签收！':'还差一点，再试一份配方'}</h2><div class="result-meta"><span>${lab?'自由实验记录':`第 ${String(state.level+1).padStart(2,'0')} 封 · ${m.topic}`}</span>${success&&!lab?`<span class="result-stars" aria-label="${stars}星">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>`:''}</div></div></div>
 <div class="result-recipe"><span>本次亲本</span><strong>${r.a}</strong><i>×</i><strong>${r.b}</strong><small>已存档 ✓</small></div>
 <p class="modal-copy result-reason">${reason||'每一格都是一种等可能的受精组合。比较理论与观察，看看种子怎样回应你的假设。'}</p></header>
 <div class="sheet-tabs" role="tablist" aria-label="实验记录"><button id="resultTab-theory" role="tab" data-sheet-tab="theory" aria-controls="resultPanel-theory" aria-selected="true" tabindex="0">遗传棋盘</button><button id="resultTab-observe" role="tab" data-sheet-tab="observe" aria-controls="resultPanel-observe" aria-selected="false" tabindex="-1">种子观察</button><button id="resultTab-discovery" role="tab" data-sheet-tab="discovery" aria-controls="resultPanel-discovery" aria-selected="false" tabindex="-1">发现笔记</button></div>
 <div class="result-pages"><section id="resultPanel-theory" role="tabpanel" aria-labelledby="resultTab-theory" tabindex="0"><div class="result-grid"><section><h3><span>01</span> 配子组合棋盘 <small>点格子，看遗传</small></h3>${grid(r.a,r.b)}<p class="source">边缘是配子，格子里是后代基因型。重复配子保留，以显示等概率的组合。</p></section><section><h3><span>02</span> 后代理论概率</h3>${ratios(r.d)}<details class="genotype-details"><summary>展开全部基因型</summary><div>${Object.entries(r.d.genotypes).map(([g,p])=>`<span><b>${g}</b>${percent(p)}</span>`).join('')}</div></details></section></div></section>
 <section id="resultPanel-observe" role="tabpanel" aria-labelledby="resultTab-observe" tabindex="0" hidden><div class="observation-heading"><span>OBSERVE & COUNT</span><h3>让种子说出答案。</h3><p>点一颗种子，查看它的性状。</p></div><div class="sample" id="sampleBox">${sampledHTML()}</div></section>
 <section id="resultPanel-discovery" role="tabpanel" aria-labelledby="resultTab-discovery" tabindex="0" hidden><div class="discovery-note"><span class="discovery-flower" aria-hidden="true">❧</span><small>一封来信 · 一个发现</small><h3>${lab?'写下新的观察':m.topic}</h3><div class="insight"><strong>${lab?'观察笔记':'这封信带来的发现'}</strong>${lab?(r.a.length===2?'每个后代从两个亲本各获得一个等位基因。可以换一株亲本，观察概率怎样改变。':'先分别考虑颜色与形状，再将独立事件的概率相乘。本实验假定两对基因独立遗传。'):m.insight}</div><p class="discovery-prompt">下一次，试着只换一个亲本。<br>先猜一猜，再让实验告诉你。</p></div></section></div>
 <footer class="result-footer"><div class="modal-actions"><button class="secondary" id="${success||lab?'againBtn':'retryBtn'}">${success||lab?'再研究一下':'调整配方，再试一次'}</button>${success&&!lab?`<button class="primary" id="nextBtn">${state.level===missions.length-1?'收取毕业来信':'下一封来信'} →</button>`:''}</div><p class="auto-record-note">✓ 本次实验已记入档案</p></footer></article>`);
}
function detectiveResult(){
 const seen=!!state.result.sample['白花'];openModal(`<div class="result-heading"><div class="result-seal">?</div><div><span class="modal-kicker">THE MISSING LABEL</span><h2 class="modal-title">让后代为亲本作证。</h2></div></div><p class="modal-copy">神秘紫花 × 白花 aa。先只看观察记录，不偷看隐藏标签。</p><div class="sample" id="sampleBox">${sampledHTML()}</div><div class="insight"><strong>${seen?'关键证据：后代中出现了白花。':'这批后代暂未出现白花。'}</strong>${seen?'白花后代是 aa。其中一个 a 来自已知的白花亲本，另一个 a 来自哪里？':'有限样本全是紫花，还不能排除 Aa。可以继续抽样，寻找能够区分两种假说的证据。'}</div><h3 class="subheading">这份证据支持哪一个判断？</h3><div class="inference"><button data-infer="AA">AA · 已证明纯合</button><button data-infer="Aa">Aa · 杂合子</button><button data-infer="unknown">暂时无法确定</button></div><div class="inference-feedback" aria-live="polite"></div>`);
}
function recordExperiment(){const r=state.result;if(r.recorded)return;PeaProgress.record(progress,{a:r.a,b:r.b,n:r.n,sample:r.sample,mode:state.mode,label:state.mode==='lab'?'自由实验':lesson().title});r.recorded=true;save();}
function createExperiment(a,b,n){const sample={},preview=[];for(let i=0;i<n;i++){const t=Object.keys(Genetics.sample(a,b,1,rng))[0];sample[t]=(sample[t]||0)+1;if(i<64)preview.push(t);}return {a,b,n,d:Genetics.cross(a,b),sample,preview,recorded:false};}
function runCross(){
 if(state.busy||$('#crossBtn').disabled)return;const raw=[...state.parents],m=lesson(),lab=state.mode==='lab';const n=lab?Number($('#labSample').value):64;
 if(!lab&&m.detective&&!m.check(raw[0],raw[1])){state.attempts++;playTone('fail');openModal(`<div class="result-heading"><div class="result-seal">↻</div><div><span class="modal-kicker">KEEP THE MYSTERY ALIVE</span><h2 class="modal-title">还差一点，先设计一次测交。</h2></div></div><p class="modal-copy">需要把「神秘紫花」与隐性纯合子 aa 放在一起。其他配方无法完成这封委托；隐藏标签继续保密。</p><div class="insight"><strong>为什么选择白花？</strong>aa 只提供 a，能让另一株亲本的配子类型通过后代显现出来。</div><div class="modal-actions"><button class="primary" id="retryBtn">调整配方，再试一次 →</button></div>`);return;}
 state.busy=true;renderDock();$('#pollination').hidden=false;playTone('grow');
 setTimeout(()=>{state.busy=false;$('#pollination').hidden=true;const[a,b]=raw.map(g=>g==='??'?'Aa':g);state.result=createExperiment(a,b,n);renderDock();if(!lab&&m.detective){detectiveResult();return;}recordExperiment();if(lab){resultHTML(true);return;}const d=state.result.d,actual=d.phenotypes[m.target]||0,accurate=state.prediction===actual,success=m.check(raw[0],raw[1],d)&&accurate;if(!success){state.attempts++;playTone('fail');}const reason=success?`你的配方 ${a} × ${b} 满足委托，预测也与遗传规律吻合。`:!accurate?`你预测${m.target}的概率是 ${percent(state.prediction)}，这组亲本的理论概率实际是 ${percent(actual)}。检查配子棋盘，再调整预测和配方。`:`预测正确，但还没有满足委托：${m.goal}；${m.condition} 对照下方基因型，再试一次。`;resultHTML(success,reason);},reduced()?70:850);
}
function help(){openModal(`<span class="modal-kicker">A GARDEN FULL OF POSSIBILITIES · 第二版</span><h2 class="modal-title">每一颗种子，都有下一章。</h2><p class="modal-copy">十六封信、三种配子挑战、一个不断生长的育种温室。没有倒计时，你可以按自己的节奏发现遗传规律。</p><div class="help-steps"><div class="help-step"><b>01</b><h3>委托信箱</h3><p>选择两张亲本卡，预测后代概率，再开始授粉。点击棋盘查看组合原理。每关从三星开始，错误尝试或借线索少一星，最低一星；重玩可以刷新最佳成绩。</p></div><div class="help-step"><b>02</b><h3>育种温室</h3><p>从两种纯合亲本起步，种下真实抽样的子代。留作下一代亲本，出售种子、完成订单、扩建育苗床。经营循环与委托进度各自保存。</p></div><div class="help-step"><b>03</b><h3>自由探索</h3><p>自由实验室不计星数。去配子工坊亲手拆分等位基因；在实验档案重看配方，在荣誉册收藏里程碑。</p></div></div><div class="insight"><strong>用证据，而不只靠记忆</strong>默认完全显性、等概率受精、后代生活力相同；双因子假定独立遗传。棋盘显示理论概率，种子点阵显示实际抽样。快捷键：1 / 2 选择亲本槽，M 音效，? 帮助。</div><div class="modal-actions"><button class="primary" id="gotIt">让好奇心继续发芽 →</button></div>`);}
function finish(){openModal(`<div class="result-heading"><div class="result-seal">❧</div><div><span class="modal-kicker">A LETTER TO THE FUTURE</span><h2 class="modal-title">你好，温室遗传学家。</h2></div></div><p class="modal-copy">十六封来信，四季的发现。你从一个等位基因出发，学会预测、验证，也学会分清“看起来一样”和“遗传组成一样”。</p><div class="graduate-score">${progress.stars.reduce((a,b)=>a+b,0)} <span>/ ${missions.length*3} ★</span></div><div class="stamps finish-stamps">${missions.map(m=>`<span class="stamp earned">${m.icon}</span>`).join('')}</div><div class="insight"><strong>故事结束了，实验没有。</strong>重玩来信挑战满星，或走进育种温室，把发现变成下一代真正的种子。</div><div class="modal-actions"><button class="secondary" id="reviewBtn">重读温室来信</button><button class="primary" id="growBtn">经营我的育种温室 →</button></div>`);bursts();}
function workshop(genotype='YyRr'){
 state.workshop={genotype,alleles:[null,null],found:[]};renderWorkshop();
}
function renderWorkshop(message='从每一对等位基因中各取一个，组装一枚配子。'){
 const w=state.workshop,possible=[...new Set(Genetics.gametes(w.genotype))],done=w.found.length===possible.length;
 openModal(`<span class="modal-kicker">THE GAMETE WORKSHOP</span><h2 class="modal-title">把基因分开，让可能相遇。</h2><p class="modal-copy">体细胞中，基因成对存在；配子中，每对只留下一个。亲手找到这个亲本所有可能的配子。</p><div class="workshop-switch">${['YyRr','YYRr','Yyrr'].map(g=>`<button data-workshop="${g}" class="${g===w.genotype?'active':''}">${g} ${progress.workshops.includes(g)?'✓':''}</button>`).join('')}</div><div class="chromosomes"><section><span>颜色这一对</span><h3>${w.genotype.slice(0,2)}</h3><div>${['Y','y'].map(a=>`<button data-allele="${a}" class="${w.alleles[0]===a?'active':''}" ${w.genotype.slice(0,2).includes(a)?'':'disabled'} aria-pressed="${w.alleles[0]===a}">${a}</button>`).join('')}</div><small>这一对里选 1 个</small></section><span class="chromosome-plus">＋</span><section><span>形状这一对</span><h3>${w.genotype.slice(2)}</h3><div>${['R','r'].map(a=>`<button data-allele="${a}" class="${w.alleles[1]===a?'active':''}" ${w.genotype.slice(2).includes(a)?'':'disabled'} aria-pressed="${w.alleles[1]===a}">${a}</button>`).join('')}</div><small>这一对里选 1 个</small></section></div><div class="gamete-assembly"><span>这一枚配子</span><strong>${w.alleles.map(a=>a||'·').join('')}</strong><button class="primary" id="combineGamete" ${w.alleles.every(Boolean)?'':'disabled'}>组装并收集 →</button></div><div class="gamete-collection">${Array.from({length:possible.length},(_,i)=>`<div class="gamete-chip ${w.found[i]?'found':''}">${w.found[i]||'?'}<small>${w.found[i]?`概率 ${percent(1/possible.length)}`:'等待发现'}</small></div>`).join('')}</div><div id="workshopFeedback" class="insight" aria-live="polite"><strong>${done?'收集完成！你找到了全部配子。':`已发现 ${w.found.length} / ${possible.length} 种`}</strong>${done?`${w.genotype} 可形成 ${possible.join('、')}，每种概率为 ${percent(1/possible.length)}。同一对等位基因分离；本模型中，不同对之间自由组合。`:message}</div><p class="source">灰色字母表示此亲本不含该等位基因；不可凭空创造新等位基因。本挑战假定两对基因独立遗传。</p>`);
}
function journal(){openModal(`<span class="modal-kicker">YOUR EXPERIMENT ARCHIVE</span><h2 class="modal-title">把每一次试验，变成证据。</h2><div class="journal-stats"><span><b>${progress.stats.experiments}</b> 次实验</span><span><b>${progress.stats.plants}</b> 颗种子</span><span><b>${progress.stats.labCrosses}</b> 次自由探索</span></div><p class="modal-copy">保存最近 40 次已解密的实验。点“复现配方”可带到自由实验室；原始观察保留在记录里。育种温室的谱系另记在温室手记中。</p><div class="journal-entries">${progress.history.length?[...progress.history].reverse().map((h,j)=>`<article class="journal-entry"><div><span class="eyebrow">NO. ${progress.stats.experiments-j} · ${safe(h.label)}</span><h3>${h.a} <i>×</i> ${h.b}</h3><p>${Object.entries(h.sample).map(([t,n])=>`${t} ${n}颗`).join(' · ')}</p></div><button class="secondary" data-replay="${progress.history.length-1-j}">复现配方 ↗</button></article>`).join(''):'<div class="empty-notice">✧<h3>你的第一条记录，还在等待发芽。</h3><p>完成一次授粉，实验配方与观察数量就会自动记在这里。</p></div>'}</div>`);}
function achievements(){const badges=PeaProgress.badges(progress);openModal(`<span class="modal-kicker">SMALL DISCOVERIES, BIG HONORS</span><h2 class="modal-title">你的好奇心，正在留下印记。</h2><p class="modal-copy">已点亮 ${badges.filter(b=>b.earned).length} / ${badges.length} 项荣誉。继续观察、验证、改进；每一种探索都值得被记住。</p><div class="badge-grid">${badges.map(b=>`<article data-badge="${b.id}" class="honor-badge ${b.earned?'earned':''}"><span>${b.icon}</span><h3>${b.name}</h3><p>${b.desc}</p><small>${b.earned?'已获得 ✓':'等待发现'}</small></article>`).join('')}</div>`);}
function settings(){openModal(`<span class="modal-kicker">MAKE YOURSELF AT HOME</span><h2 class="modal-title">让温室，适合你的节奏。</h2><div class="settings-list"><label><span><b>温室音效</b><small>选择、授粉与投递的轻柔提示音</small></span><input id="soundSetting" type="checkbox" ${progress.sound?'checked':''}></label><label><span><b>减少动态效果</b><small>缩短授粉动画，关闭纸屑与循环动效</small></span><input id="motionSetting" type="checkbox" ${progress.reducedMotion?'checked':''}></label></div><div class="insight"><strong>把温室装进口袋</strong>存档包含来信成绩、实验档案、荣誉进度和育种温室。导入会替换当前进度；需要保留时请先导出。存档文件保存在你自己的设备上。</div><div class="save-tools"><button class="secondary" id="exportSave">↓ 导出我的存档</button><label class="secondary import-label">↑ 导入存档<input id="importFile" type="file" accept="application/json,.json"></label></div><p id="settingsFeedback" class="settings-feedback" role="status"></p><p class="source">本机浏览器自动保存，不跨设备同步。也可用独立 HTML 离线游玩。<br>《豌豆邮局》第二版 · 四季来信与育种温室</p>`);}
function exportSave(){try{const garden=PeaGarden.validate(localStorage.getItem(PeaGarden.KEY));const data={format:'pea-post',version:2,campaign:progress,garden};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='豌豆邮局-我的存档.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('#settingsFeedback').textContent='存档已导出，包含你的来信成绩与温室。';}catch{$('#settingsFeedback').textContent='暂时无法导出，请检查浏览器下载权限。';}}
async function importSave(file){
 if(!file)return;try{if(file.size>2000000)throw Error('文件过大，请选择由本游戏导出的 JSON 存档。');const data=JSON.parse(await file.text());if(data.format!=='pea-post'||data.version!==2||!data.campaign||!Array.isArray(data.campaign.stars)||data.campaign.stars.length!==missions.length||data.campaign.stars.some(s=>!Number.isInteger(s)||s<0||s>3))throw Error('这不是有效的豌豆邮局存档。');const p=PeaProgress.normalize(data.campaign,missions.length),g=data.garden===null?null:PeaGarden.validate(data.garden);if(data.garden!==null&&!g)throw Error('温室存档不完整，原进度未被替换。');const oldCampaign=localStorage.getItem(key),oldGarden=localStorage.getItem(PeaGarden.KEY);try{localStorage.setItem(key,JSON.stringify(p));if(g)localStorage.setItem(PeaGarden.KEY,JSON.stringify(g));else localStorage.removeItem(PeaGarden.KEY);}catch(error){if(oldCampaign!==null)localStorage.setItem(key,oldCampaign);if(oldGarden!==null)localStorage.setItem(PeaGarden.KEY,oldGarden);throw error;}progress=p;state.level=p.level;state.parents=[null,null];state.prediction=null;state.result=null;state.attempts=0;state.hinted=false;if(state.mode==='garden'){PeaGarden.unmount();PeaGarden.mount($('#gardenView'),{seedIcon,playTone,toast});}render();$('#settingsFeedback').textContent='已恢复存档，来信和温室进度已同步更新。';$('#motionSetting').checked=progress.reducedMotion;$('#soundSetting').checked=progress.sound;}catch(e){$('#settingsFeedback').textContent=e instanceof SyntaxError?'文件内容无法读取，请选择有效的 JSON 存档。':e.message;}
}
function selectSeed(g,slot=state.slot){if(state.busy||!getStock().includes(g))return;state.parents[slot]=g;state.slot=slot===0?1:0;renderSeeds();renderDock();playTone();const target=$('#parent'+slot);if(!reduced())target.animate([{transform:'scale(.96)'},{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:240});}
$('#seeds').addEventListener('click',e=>{const c=e.target.closest('[data-gene]');if(c)selectSeed(c.dataset.gene);});
$('#seeds').addEventListener('dragstart',e=>{const c=e.target.closest('[data-gene]');if(c&&!state.busy){e.dataTransfer.setData('text/plain',c.dataset.gene);e.dataTransfer.effectAllowed='copy';}else e.preventDefault();});
$$('[data-slot]').forEach(el=>{el.onclick=()=>{if(state.busy)return;state.slot=Number(el.dataset.slot);renderDock();playTone();};el.ondragover=e=>{e.preventDefault();el.classList.add('drop-ready');};el.ondragleave=()=>el.classList.remove('drop-ready');el.ondrop=e=>{e.preventDefault();el.classList.remove('drop-ready');selectSeed(e.dataTransfer.getData('text/plain'),Number(el.dataset.slot));};});
$('#quickParents').onclick=e=>{const b=e.target.closest('[data-quickslot]');if(b&&!state.busy){state.slot=Number(b.dataset.quickslot);renderDock();}};
$('#probabilities').onclick=e=>{if(state.busy)return;const b=e.target.closest('[data-prob]');if(b){state.prediction=Number(b.dataset.prob);$$('[data-prob]').forEach(el=>{const active=Number(el.dataset.prob)===state.prediction;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});renderDock();playTone();}const f=e.target.closest('[data-family]');if(f){state.family=Number(f.dataset.family);reset();}};
$('#crossBtn').onclick=runCross;
$('#mobileAction').onclick=()=>{if(!$('#crossBtn').disabled){runCross();return;}const target=state.parents.every(Boolean)?$('#letter'):$('#seeds');target.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'center'});};
$('#chapters').onclick=e=>{const el=e.target.closest('[data-level]');if(!el||el.disabled||state.busy)return;if(state.mode==='garden')PeaGarden.unmount();state.level=Number(el.dataset.level);state.mode='orders';reset();save();};
$('#stamps').onclick=e=>{const b=e.target.closest('[data-stamp]');if(!b||state.busy)return;const i=Number(b.dataset.stamp);if(!progress.stars[i]){toast('完成对应来信，就能收藏这枚发现邮票。');return;}const m=missions[i];openModal(`<span class="modal-kicker">A DISCOVERY WORTH KEEPING</span><div class="stamp-detail">${m.icon}</div><h2 class="modal-title">${m.topic}</h2><div class="result-stars">${'★'.repeat(progress.stars[i])}${'☆'.repeat(3-progress.stars[i])}</div><p class="modal-copy">${m.insight}</p><button class="primary" data-return-level="${i}">重读这封信 →</button>`);};
$('#ordersTab').onclick=()=>setMode('orders');$('#labTab').onclick=()=>setMode('lab');$('#gardenTab').onclick=()=>setMode('garden');
$('#notebook').onclick=()=>{if(!state.busy)notebook();};$('#help').onclick=()=>{if(!state.busy)help();};$('#home').onclick=e=>{e.preventDefault();if(!state.busy)help();};$('#workshopBtn').onclick=()=>{if(!state.busy)workshop();};$('#journalBtn').onclick=()=>{if(!state.busy)journal();};$('#achievementsBtn').onclick=()=>{if(!state.busy)achievements();};$('#settingsBtn').onclick=()=>{if(!state.busy)settings();};
$('#sound').onclick=()=>{progress.sound=!progress.sound;settingsApply();save();playTone('success');toast(progress.sound?'温室音效已开启':'已关闭音效');};
$('#hintBtn').onclick=()=>{state.hinted=true;toast(lesson().hint);};$('#closeModal').onclick=closeModal;
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
$('#modalContent').addEventListener('change',e=>{if(e.target.id==='soundSetting'){progress.sound=e.target.checked;settingsApply();save();playTone();}if(e.target.id==='motionSetting'){progress.reducedMotion=e.target.checked;settingsApply();save();}if(e.target.id==='importFile')importSave(e.target.files[0]);});
$('#modalContent').onclick=e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;const id=b.id;
 if(['retryBtn','againBtn','gotIt','reviewBtn'].includes(id)){closeModal();render();}
 if(id==='nextBtn'){closeModal();if(state.level===missions.length-1)finish();else{state.level++;reset();save();window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});}}
 if(id==='growBtn')setMode('garden');if(id==='freeBtn')setMode('lab');if(id==='exportSave')exportSave();
 if(id==='moreSample'){
  const r=state.result;if(r.n>=10048){toast('观察已超过一万颗；重新实验可以开启新的记录。');return;}
  const added=Math.min(256,10048-r.n),more=Genetics.sample(r.a,r.b,added,rng);Object.entries(more).forEach(([k,n])=>r.sample[k]=(r.sample[k]||0)+n);r.n+=added;
  if(r.recorded){progress.stats.plants+=added;const last=progress.history[progress.history.length-1];last.n=r.n;last.sample={...r.sample};save();}
  if(lesson().detective&&state.mode==='orders'&&!r.recorded)detectiveResult();else {$('#sampleBox').innerHTML=sampledHTML();$('#moreSample').focus({preventScroll:true});}playTone('grow');
 }
 if(b.dataset.infer){
  const seen=!!state.result.sample['白花'];if(b.dataset.infer==='Aa'&&seen){recordExperiment();resultHTML(true,'后代出现白花，说明神秘紫花亲本提供了 a；它自己又开紫花，所以隐藏标签是 Aa。');}
  else if(b.dataset.infer==='unknown'&&!seen){$('.inference-feedback').textContent='判断严谨！继续抽样，寻找能排除其中一种假说的证据。';}
  else{state.attempts++;$('.inference-feedback').textContent=seen?'已经出现了白花 aa：若神秘亲本是 AA，怎么会提供 a 呢？这份证据足以确定它是 Aa。':'这一批全是紫花，AA 和 Aa 都还存在可能。继续抽样，不能把“没观察到”当作“不可能”。';playTone('fail');}
 }
 if(b.dataset.cell){const[x,y,g]=b.dataset.cell.split('|');$$('[data-cell]').forEach(el=>el.classList.toggle('inspected',el===b));$('#cellExplanation').innerHTML=`配子 <b>${x}</b> ＋ 配子 <b>${y}</b> → <b>${g}</b><br>表现型：${trait(g)}。${g.length===2?'每个亲本各贡献一个等位基因。':'颜色和形状各得到一对等位基因。'}`;playTone();}
 if(b.dataset.sample)$('#sampleInspection').textContent=`这颗种子表现为${b.dataset.sample}。表现型未必能唯一确定基因型，需结合亲本和实验判断。`;
 if(b.dataset.workshop)workshop(b.dataset.workshop);
 if(b.dataset.allele){const a=b.dataset.allele;state.workshop.alleles['Yy'.includes(a)?0:1]=a;renderWorkshop();playTone();}
 if(id==='combineGamete'){
  const w=state.workshop,g=w.alleles.join('');if(w.found.includes(g)){renderWorkshop(`已经收集过 ${g} 了。试试改变其中一对的选择。`);return;}w.found.push(g);const done=w.found.length===new Set(Genetics.gametes(w.genotype)).size;if(done&&!progress.workshops.includes(w.genotype)){progress.workshops.push(w.genotype);save();bursts();}renderWorkshop(`收到了 ${g}！再试一种组合。`);playTone(done?'success':'tap');
 }
 if(b.dataset.replay!==undefined){const h=progress.history[Number(b.dataset.replay)];if(!h)return;setMode('lab');state.family=h.a.length===2?1:2;state.parents=[h.a,h.b];state.slot=0;render();toast('配方已带回实验台。再做一次，观察新的随机样本。');}
 if(b.dataset.returnLevel!==undefined){state.level=Number(b.dataset.returnLevel);setMode('orders');save();}
};
document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||$('#modal').open||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(e.key.toLowerCase()==='m'){$('#sound').click();e.preventDefault();}if(e.key==='?'){help();e.preventDefault();}if(state.mode!=='garden'&&!state.busy&&['1','2'].includes(e.key)){state.slot=Number(e.key)-1;renderDock();e.preventDefault();}});
render();save();

window.PeaApp={open:setMode,summary:()=>({level:state.level,title:lesson().title,stars:progress.stars,mode:state.mode,experiments:progress.stats.experiments}),busy:()=>state.busy};
})();

;
'use strict';
(()=>{
const $=s=>document.querySelector(s);
try{if(!localStorage.getItem('pea-post-app-garden-v1')&&localStorage.getItem('pea-post-garden-v1'))localStorage.setItem('pea-post-app-garden-v1',localStorage.getItem('pea-post-garden-v1'));}catch{}
const icon=(name)=>{const paths={home:'<rect x="4" y="7" width="24" height="18" rx="2"/><path d="m5 8 11 9L27 8"/>',experiment:'<path d="M12 3h8m-7 0v10L6 25q-2 4 3 4h14q5 0 3-4l-7-12V3M10 20h12"/>',garden:'<path d="M16 29V15M16 21Q2 20 3 7q13-2 13 14ZM16 15Q16 3 29 3q1 13-13 12Z"/>',profile:'<circle cx="16" cy="9" r="6"/><path d="M4 28v-3q0-10 12-10t12 10v3Z"/>',back:'<path d="m20 5-11 11 11 11"/>',more:'<circle cx="6" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="26" cy="16" r="1.5"/>'};return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.garden}</svg>`};
const logo='<svg viewBox="0 0 80 90" aria-hidden="true"><defs><linearGradient id="pod" x2=".7" y2="1"><stop stop-color="#b5c969"/><stop offset="1" stop-color="#507734"/></linearGradient></defs><path d="M17 81Q47 63 50 26M42 52Q24 45 26 25M48 34Q65 31 71 19" fill="none" stroke="#4e6c30" stroke-width="3"/><path d="M48 29Q23 27 20 5Q47 5 48 29M50 29Q48 7 70 5Q72 22 50 29" fill="url(#pod)" stroke="#577638"/><path d="M13 78Q24 46 65 40Q54 81 13 78Z" fill="url(#pod)" stroke="#48642b" stroke-width="2"/><g fill="#ced989" stroke="#6d8c37"><circle cx="29" cy="67" r="8"/><circle cx="43" cy="58" r="8"/><circle cx="57" cy="49" r="6"/></g></svg>';
$('#home .brand-icon').innerHTML=logo;
const stars=document.createElement('button');stars.className='app-star-counter';stars.dataset.app='profile';stars.setAttribute('aria-label','查看发现之星');stars.innerHTML='<span>★</span><b id="appStarCount">0</b><small>/48</small>';$('.topbar').append(stars);
const sceneHeader=document.createElement('div');sceneHeader.className='app-scene-header';sceneHeader.innerHTML=`<button data-app="home" aria-label="回到邮局">${icon('back')}</button><h1 id="sceneTitle">第一封紫色的信</h1><button data-action="settingsBtn" aria-label="更多设置">${icon('more')}</button>`;$('.topbar').after(sceneHeader);
const home=document.createElement('section');home.id='appHome';home.innerHTML=`<div class="home-art"><div class="hanging-sign">让种子<br>传递更大的世界</div></div><div class="home-content"><div class="home-chapter"><small id="homeChapter">第一季</small><h1 id="homeSeason">花色的秘密</h1><p>在一粒种子里，看见遗传的轨迹</p></div><button class="mission-envelope" data-app="continue"><span class="envelope-art" aria-hidden="true"></span><h2 id="homeMission"></h2><p>让每一颗种子，成为一次发现</p><span class="continue-label">继续探索 <b>→</b></span></button><div class="home-shortcuts"><button data-action="workshopBtn"><span class="shortcut-art mortar" aria-hidden="true"></span><strong>配子工坊</strong><small>组合可能，创造结果</small><b>›</b></button><button data-app="lab"><span class="shortcut-art flask" aria-hidden="true"></span><strong>自由实验</strong><small>在这里，提出自己的问题</small><b>›</b></button></div><span id="homeCount" class="sr-only"></span></div>`;
$('.layout').before(home);
const personal=document.createElement('section');personal.id='appProfile';personal.innerHTML=`<div class="profile-hero"><div class="passport-border"><span class="passport-kicker">PEA POST · FIELD JOURNAL</span><h1>我的<br>发现手册</h1><p>把每一次好奇，收进四季。</p><span class="passport-specimen" aria-hidden="true"></span><div class="passport-stats"><span><b id="profileStars">0</b><small>发现之星 / 48</small></span><span><b id="profileCollected">0</b><small>知识邮票 / 16</small></span><span><b id="profileExperiments">0</b><small>完成实验</small></span></div><p id="profileSummary" class="sr-only"></p></div></div>
 <div class="profile-library"><button data-action="notebook"><span class="library-icon">${icon('home')}</span><strong>田野笔记</strong><small>六页遗传知识</small><b>↗</b></button><button data-action="journalBtn"><span class="library-icon">${icon('experiment')}</span><strong>实验档案</strong><small>重看每一次验证</small><b>↗</b></button></div>
 <section class="collection-book"><div class="collection-heading"><span>THE COLLECTION</span><small id="collectionCount">0 / 16 枚</small></div><div class="collection-tabs" role="tablist" aria-label="我的收藏"><button id="collectionTab-stamps" role="tab" data-collection-tab="stamps" aria-controls="collectionPanel-stamps" aria-selected="true" tabindex="0">发现邮票</button><button id="collectionTab-chapters" role="tab" data-collection-tab="chapters" aria-controls="collectionPanel-chapters" aria-selected="false" tabindex="-1">四季来信</button></div><div id="collectionPanel-stamps" role="tabpanel" aria-labelledby="collectionTab-stamps"><p class="collection-caption">每完成一封来信，就留下一枚发现。</p><div id="appStamps"></div></div><div id="collectionPanel-chapters" role="tabpanel" aria-labelledby="collectionTab-chapters" hidden><p class="collection-caption">翻回走过的路，也可以重新挑战满星。</p><div id="appChapters"></div></div></section>
 <div class="profile-actions"><button data-action="achievementsBtn"><i>✦</i><strong>发现荣誉</strong><span>探索的里程碑</span><b>›</b></button><button data-action="settingsBtn"><i>⚙</i><strong>设置与存档</strong><span>声音 · 备份</span><b>›</b></button><button id="installApp"><i>⌂</i><strong>装进口袋</strong><span>添加到主屏幕</span><b>›</b></button></div><p class="app-footnote">❧ 每一颗种子，都有下一章 ❧<br>进度自动保存在本机 · 可在设置中导出</p>`;home.after(personal);
const nav=document.createElement('nav');nav.className='app-tabbar';nav.setAttribute('aria-label','App 导航');nav.innerHTML=Object.entries({home:'邮局',experiment:'实验',garden:'温室',profile:'我的'}).map(([key,label])=>`<button data-screen-target="${key}"><span>${icon(key)}</span><small>${label}</small></button>`).join('');document.body.append(nav);
$('.cabinet-title h2').textContent='种子库';
const letter=$('#letter');const actions=document.createElement('section');actions.className='app-experiment-actions';['.prediction','#crossBtn','#actionHint','#hintBtn'].forEach(s=>actions.append($(s)));$('.seed-cabinet').after(actions);$('.play-area').prepend(letter);
function refresh(){const p=PeaApp.summary();$('#homeCount').textContent=`${p.stars.filter(Boolean).length} / 16 已投递`;$('#homeChapter').textContent=['第一季','第二季','第三季','第四季'][Math.floor(p.level/4)];$('#homeSeason').textContent=['花色的秘密','两种性状的相遇','概率与组合','寄往未来的种子'][Math.floor(p.level/4)];$('#appStarCount').textContent=p.stars.reduce((a,b)=>a+b,0);$('#sceneTitle').textContent=p.mode==='lab'?'自由实验室':p.title;$('#homeMission').textContent=p.title;$('#profileStars').textContent=p.stars.reduce((a,b)=>a+b,0);$('#profileCollected').textContent=p.stars.filter(Boolean).length;$('#profileExperiments').textContent=p.experiments;$('#collectionCount').textContent=p.stars.filter(Boolean).length+' / 16 枚';$('#profileSummary').textContent=`${p.stars.reduce((a,b)=>a+b,0)} 颗发现之星 · ${p.stars.filter(Boolean).length} 枚知识邮票`;}
function markScreen(name){document.body.dataset.screen=name;nav.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.screenTarget===name);b.setAttribute('aria-current',b.dataset.screenTarget===name?'page':'false')});refresh();}
function screen(name,mode){if(PeaApp.busy())return;$('#modal').close();if(name==='experiment'&&(mode||PeaApp.summary().mode==='garden'))PeaApp.open(mode||'orders');if(name==='garden')PeaApp.open('garden');markScreen(name);window.scrollTo({top:0,behavior:'instant'});}
function selectTab(button){const collection=button.hasAttribute('data-collection-tab');const list=button.closest('[role=tablist]');list.querySelectorAll('[role=tab]').forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!active;});if(!collection){$('.result-pages').scrollTop=0;}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sheet-tab],[data-collection-tab]');if(b)selectTab(b);});
document.addEventListener('keydown',e=>{const b=e.target.closest('[data-sheet-tab],[data-collection-tab]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...b.parentElement.querySelectorAll('[role=tab]')],i=tabs.indexOf(b),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;e.preventDefault();selectTab(tabs[next]);tabs[next].focus();});
$('#modal').addEventListener('close',refresh);
// Move the original live collections, preserving all original event handlers.
$('#appStamps').append($('#stamps'));$('#appChapters').append($('#chapters'));
$('#chapters').addEventListener('click',e=>{if(e.target.closest('button:not(:disabled)')){markScreen('experiment');window.scrollTo(0,0)}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-screen-target],[data-app],[data-action]');if(!t)return;if(t.dataset.screenTarget)screen(t.dataset.screenTarget);else if(t.dataset.action)$('#'+t.dataset.action).click();else if(t.dataset.app==='continue')screen('experiment','orders');else if(t.dataset.app==='lab')screen('experiment','lab');else screen(t.dataset.app)});
$('#home').onclick=e=>{e.preventDefault();screen('home')};
document.querySelector('#modalContent').addEventListener('click',e=>{if(e.target.closest('[data-replay],[data-return-level],#freeBtn,#reviewBtn')){markScreen('experiment');window.scrollTo(0,0);}if(e.target.closest('#growBtn')){markScreen('garden');window.scrollTo(0,0);}});
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});$('#installApp').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else{$('#modalContent').innerHTML='<span class="modal-kicker">YOUR POCKET GREENHOUSE</span><h2 class="modal-title">把温室装进口袋。</h2><p class="modal-copy">iPhone / iPad：在 Safari 中打开此页面，点击分享，选择“添加到主屏幕”。<br><br>Android：在 Chrome 菜单中选择“安装应用”或“添加到主屏幕”。<br><br>这是可安装的网页 App。第一次联网打开后，页面资源会保存在本机，支持离线使用。本机预览地址只能在运行服务的这台电脑访问；手机使用需要可访问的托管地址。</p>';$('#modalContent .modal-title').id='sheetTitle';$('#modal').setAttribute('aria-labelledby','sheetTitle');$('#modal').showModal();$('#modal').scrollTop=0;$('#modalContent').scrollTop=0}};
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
// Keep scene headings synchronized when the campaign advances or a replay opens.
new MutationObserver(()=>{const p=PeaApp.summary();$('#sceneTitle').textContent=p.mode==='lab'?'自由实验室':p.title;document.body.dataset.appFamily=$('#seeds').querySelector('[data-gene]')?.dataset.gene.length>2?'di':'mono';}).observe($('#missionTitle'),{childList:true,subtree:true,characterData:true});
const brief=document.createElement('button');brief.className='brief-details';brief.textContent='读完整委托 ↗';brief.onclick=()=>{$('#modalContent').innerHTML=`<span class="modal-kicker">一封温室委托</span><h2 class="modal-title">${$('#missionTitle').textContent}</h2><p class="modal-copy">${$('#letterCopy').textContent}</p><div class="goal-note">${$('#goalText').textContent}<br><small>${$('#condition').textContent}</small></div>`;$('#modalContent .modal-title').id='sheetTitle';$('#modal').setAttribute('aria-labelledby','sheetTitle');$('#modal').showModal();$('#modal').scrollTop=0;$('#modalContent').scrollTop=0};$('#letter').append(brief);
let openStock=false;
$('#gardenView').addEventListener('click',e=>{if(e.target.closest('[data-garden="slot"]'))openStock=true;if(e.target.closest('[data-garden="objective"]')){const d=$('#gardenView .garden-contract-details');if(d)d.open=true;}},true);
function styleGarden(){const g=$('#gardenView .garden');if(!g||g.dataset.styled)return;g.dataset.styled='true';g.querySelector('.garden-heading h2').textContent='育种温室';g.querySelector('.garden-heading p').textContent='在时光中，培育更多的可能';g.querySelector('.garden-cross-panel h3').textContent='亲本组合';g.querySelector('.garden-harvest h3').textContent='收获的后代';
 const main=g.querySelector('.garden-main'),panel=g.querySelector('.garden-cross-panel'),breed=g.querySelector('[data-garden="breed"]'),harvest=g.querySelector('.garden-harvest'),strip=g.querySelector('.garden-objective-strip');
 const action=document.createElement('div');action.className='garden-action-wrap';action.append(breed);const micro=panel.querySelector('.garden-micro');if(micro)action.append(micro);harvest.after(strip,action);
 const collection=g.querySelector('.garden-collection'),inv=document.createElement('details');inv.className='garden-inventory-details';inv.innerHTML='<summary>亲本种库与谱系手记 <span>展开选择 ＋</span></summary>';collection.before(inv);inv.append(collection);if(openStock){inv.open=true;openStock=false;queueMicrotask(()=>inv.scrollIntoView({behavior:'smooth',block:'start'}));}
 const aside=g.querySelector('.garden-aside'),details=document.createElement('details');details.className='garden-contract-details';details.innerHTML='<summary>育种委托与温室扩建 <span>查看 ＋</span></summary>';aside.before(details);details.append(aside);
 const empty=g.querySelector('.garden-empty');if(empty)empty.innerHTML='<div class="empty-seed-row"><i></i><i></i><i></i><i></i></div><p>第一批种子，正在等你种下。</p>';
}
new MutationObserver(styleGarden).observe($('#gardenView'),{childList:true,subtree:true});
screen('home');
})();
