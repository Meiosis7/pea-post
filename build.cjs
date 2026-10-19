const fs=require('node:fs');const path=require('node:path');
const root=__dirname;const read=p=>fs.readFileSync(path.join(root,p),'utf8');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
let html=read('index.html');
for(const p of ['style.css','expansion.css','garden.css'])html=html.replace(`<link rel="stylesheet" href="${p}">`,()=>`<style>${read(p)}</style>`);
html=html.replace('src="assets/greenhouse.svg"',()=>`src="data:image/svg+xml;base64,${Buffer.from(read('assets/greenhouse.svg')).toString('base64')}"`);
for(const p of ['genetics.js','missions-extra.js','progress.js','garden.js','app.js'])html=html.replace(`<script src="${p}"></script>`,()=>`<script>${read(p)}</script>`);
fs.writeFileSync(path.join(root,'dist/index.html'),html);fs.writeFileSync(path.join(root,'豌豆邮局.html'),html);console.log('Built standalone offline game: '+Buffer.byteLength(html)+' bytes');
