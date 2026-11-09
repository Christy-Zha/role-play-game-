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
for(const key of new Set([...Object.values(t.THIRD_PORTRAITS),'mo_lamp','xie_lamp']))thirdFiles.push('por_'+key+'.webp');
for(const key of new Set(Object.values(t.THIRD_ENEMIES)))thirdFiles.push('enemy_'+key+'.webp');
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
/* 第五批：灵宠、食料与印的图标、CG */
{const fs5=require('node:fs');const need=[];
 for(const sp of ['huitu','yaer','hu','xie','jing','lang'])for(const n of [1,3])need.push('pet_'+sp+'_'+n+'.webp');
 for(const f of ['grain','jerky','fish','fruit','core'])need.push('ico_food_'+f+'.webp');need.push('ico_seal.webp');
 const cg5=['huitu','tame','ng','mo_go','hong_dice','he_water','after_deng','after_feng','after_shou','after_bai','after_qing'];
 for(const k of cg5){assert.ok(t.CG[k],'CG not registered: '+k);need.push('cg_'+k+'.jpg');}
 for(const f of need)assert.ok(fs5.existsSync(__dirname+'/art/'+f),'missing art/'+f);
 for(const e of ['deng','feng','shou','bai','qing']){const c=t.STORY.find(x=>x.id==='after_'+e);assert.ok(c&&String(c.lines[0].fn).includes("cgShow('after_'+e)"),'after CG cue '+e);}
 const rk=t.STORY.find(c=>c.id==='ratking');assert.ok(rk.lines.some(l=>l.fn&&String(l.fn).includes("cgShow('huitu')")),'huitu CG cue');
 console.log('PASS fifth batch: '+need.length+' files, '+cg5.length+' CG registered and cued');}
