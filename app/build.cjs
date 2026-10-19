const fs=require('fs'),path=require('path');
const root=__dirname,read=n=>fs.readFileSync(path.join(root,n),'utf8');
let html=read('index.html');
// Each generated bitmap is embedded once and reused by CSS variables.
const assetVars=new Map();
function imageVar(file){if(!assetVars.has(file)){const name='--offline-asset-'+assetVars.size,mime=file.endsWith('.svg')?'image/svg+xml':'image/png';assetVars.set(file,{name,value:`url("data:${mime};base64,${fs.readFileSync(path.join(root,file)).toString('base64')}")`});}return `var(${assetVars.get(file).name})`;}
for(const n of ['style.css','expansion.css','garden.css','mobile.css','fidelity.css','polish.css']){const css=read(n).replace(/url\(['"]?(assets\/[^)'" ]+)['"]?\)/g,(_,f)=>imageVar(f));html=html.replace(`<link rel="stylesheet" href="${n}">`,()=>`<style>${css}</style>`);}
html=html.replace('</head>',()=>`<style>:root{${[...assetVars.values()].map(a=>a.name+':'+a.value).join(';')}}</style></head>`);
html=html.replace('src="assets/greenhouse.svg"',()=>`src="data:image/svg+xml;base64,${fs.readFileSync(path.join(root,'assets/greenhouse.svg')).toString('base64')}"`);
// One ordered script avoids partially initialized games; the entry retries failed loads.
const bundle=['genetics.js','missions-extra.js','progress.js','garden.js','app.js','shell.js'].map(read).join('\n;\n');
fs.writeFileSync(path.join(root,'game.bundle.js'),bundle);
html=html.replace(/<div id="appLoading"[\s\S]*?<script id="appBoot">[\s\S]*?<\/script>/,()=>`<script>${bundle}</script>`);
html=html.replace('<link rel="manifest" href="manifest.webmanifest">','').replace('<link rel="apple-touch-icon" href="assets/icon-192.png">','');
fs.writeFileSync(path.join(root,'豌豆邮局App-离线版.html'),html);console.log(`Offline App: ${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MiB; ${assetVars.size} embedded assets`);
