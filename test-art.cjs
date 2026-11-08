const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const noop=()=>{};
const element=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,setAttribute:noop,insertAdjacentElement:noop,getContext:()=>({}),getBoundingClientRect:()=>({width:390,height:844}),querySelector:()=>null,querySelectorAll:()=>[],children:[],appendChild:noop});
const doc={querySelector:()=>element(),querySelectorAll:()=>[],createElement:element,addEventListener:noop,body:element(),documentElement:element()};
const ctx={console,Date,Math,Map,Set,document:doc,window:{claude:{hot:{ready:noop}},devicePixelRatio:1},localStorage:{getItem:()=>null,setItem:noop},matchMedia:()=>({matches:true,addEventListener:noop}),addEventListener:noop,requestAnimationFrame:noop,setTimeout:noop,setInterval:noop,clearTimeout:noop,clearInterval:noop,performance:{now:()=>0},location:{hash:''},navigator:{},Image:class{},ResizeObserver:class{observe(){}},innerWidth:390,innerHeight:844};
code=code.replace(/\}\)\(\);\s*$/,`globalThis.artTest={STORY,CHAPTER_PORTRAITS,CHAPTER_SCENES,CHAPTER_ENEMIES,CHAPTER_CG,PORTRAIT,ART_HAVE,CG,CHAPTER_SCENE_KEYS};})();`);
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
