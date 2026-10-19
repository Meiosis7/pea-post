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
