const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const noop=()=>{};
const element=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,setAttribute:noop,insertAdjacentElement:noop,getContext:()=>({}),getBoundingClientRect:()=>({width:390,height:844}),querySelector:()=>null,querySelectorAll:()=>[],children:[],appendChild:noop});
const doc={querySelector:()=>element(),querySelectorAll:()=>[],createElement:element,addEventListener:noop,body:element(),documentElement:element()};
const ctx={console,Date,Math,Map,Set,document:doc,window:{claude:{hot:{ready:noop}},devicePixelRatio:1},localStorage:{getItem:()=>null,setItem:noop},matchMedia:()=>({matches:true,addEventListener:noop}),addEventListener:noop,requestAnimationFrame:noop,setTimeout:noop,setInterval:noop,clearTimeout:noop,clearInterval:noop,performance:{now:()=>0},location:{hash:''},navigator:{},Image:class{},ResizeObserver:class{observe(){}},innerWidth:390,innerHeight:844};
code=code.replace(/\}\)\(\);\s*$/,`globalThis.artTest={STORY,CHAPTER_PORTRAITS,CHAPTER_SCENES,CHAPTER_ENEMIES,CHAPTER_CG,PORTRAIT,ART_HAVE,CG,CHAPTER_SCENE_KEYS,THIRD_SCENE_KEYS,THIRD_PORTRAITS,THIRD_ENEMIES,endings:{deng:V13_DENG,feng:V13_FENG,shou:V13_SHOU,qing:V13_QING,bai:V13_BAI},captureCG(fn){const old=cgShow;let key;cgShow=k=>key=k;try{fn();return key;}finally{cgShow=old;}}};})();`);
vm.runInNewContext(code,ctx,{timeout:10000});
const t=ctx.artTest;
assert.equal(Object.keys(t.CHAPTER_PORTRAITS).length,16);
for(const [k,[sheet,q]] of Object.entries(t.CHAPTER_PORTRAITS)){
 assert.ok(q>=0&&q<4);assert.ok(t.PORTRAIT[k]().includes('atlas_'+sheet+'.webp'));assert.ok(fs.existsSync(__dirname+'/art/atlas_'+sheet+'.webp'));
}
for(const [id,key] of Object.entries(t.CHAPTER_SCENES)){assert.equal(t.STORY.find(x=>x.id===id).bg,key);assert.ok(fs.existsSync(__dirname+'/art/scene_'+key+'.jpg'));}
for(const [id,,key] of t.CHAPTER_CG){assert.ok(t.STORY.find(x=>x.id===id).lines.some(l=>l.fn&&String(l.fn).includes('cgShow(key)')));assert.ok(t.CG[key]);assert.ok(fs.existsSync(__dirname+'/art/cg_'+key+'.jpg'));}
for(const [sheet,q] of Object.values(t.CHAPTER_ENEMIES)){assert.ok(q>=0&&q<4);assert.ok(fs.existsSync(__dirname+'/art/atlas_'+sheet+'.webp'));}
assert.equal(t.CHAPTER_SCENE_KEYS.size,20);
assert.notDeepEqual(t.CHAPTER_ENEMIES['白脊鲛'],t.CHAPTER_ENEMIES['白脊幼鲛']);
console.log('PASS full game initialization; 16 named portraits, 20 scenes, 12 story CG and named enemy atlas mappings');
const thirdFiles=[...t.THIRD_SCENE_KEYS].map(k=>'scene_'+k+'.jpg');
for(const key of new Set([...Object.values(t.THIRD_PORTRAITS),'mo_lamp','xie_lamp']))thirdFiles.push('por_'+key+'.png');
for(const key of new Set(Object.values(t.THIRD_ENEMIES)))thirdFiles.push('enemy_'+key+'.png');
for(const key of ['jiedan','chudeng','xuanhe','lalang','duanling','end_deng','end_feng','end_shou','end_qing','end_bai']){assert.ok(t.CG[key]);thirdFiles.push('cg_'+key+'.jpg');}
assert.equal(thirdFiles.length,31);
for(const file of thirdFiles)assert.ok(fs.existsSync(__dirname+'/art/'+file),'Missing '+file);
assert.equal(t.STORY.find(c=>c.id==='v12_2').bg,'boshi');
assert.ok(t.STORY.find(c=>c.id==='v12_2').lines.some(l=>l.bg==='xiheng'));
assert.equal(t.STORY.find(c=>c.id==='v12_6').bg,'guanchao');
assert.equal(t.STORY.find(c=>c.id==='v13_8').bg,'zhucao');
for(const [ending,lines] of Object.entries(t.endings)){
 const cues=lines.filter(l=>l.fn&&String(l.fn).includes("cgShow('end_'"));
 assert.equal(cues.length,1);assert.equal(t.captureCG(cues[0].fn),'end_'+ending);
}
for(const [id,key] of [['v11_9','jiedan'],['v11_10','chudeng'],['v12_6','xuanhe'],['v12_5','lalang'],['v13_10','duanling']]){
 const fn=t.STORY.find(c=>c.id===id).lines.find(l=>l.fn&&String(l.fn).includes("cgShow('"+key+"')"));
 assert.ok(fn,'Missing cue '+key);assert.equal(t.captureCG(fn.fn),key);
}
console.log('PASS third batch: 31 files, chapter scenes, five story CG and five isolated ending CG');
