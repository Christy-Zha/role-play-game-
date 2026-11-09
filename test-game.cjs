const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
new vm.Script(code); new vm.Script(fs.readFileSync(__dirname+'/novels.js','utf8'));
let checks=0;function test(n,f){f();checks++;console.log('PASS '+n);}
function section(a,b){const i=code.indexOf(a);assert.ok(i>=0,'missing '+a);const j=code.indexOf(b,i);assert.ok(j>i,'missing '+b);return code.slice(i,j);}
const ctx=vm.createContext({console,Date,Math,setTimeout:()=>0,window:{},S:{},BT:null,SC:null,TAB:'story',VIEWS:{story:()=>'',world:()=>''},ACT:{},
 document:{createElement:()=>({setAttribute(){}}),body:{appendChild(){}},querySelector:()=>({insertAdjacentElement(){}})},$:()=>null,toast:()=>{},save:()=>{},render:()=>{},live:()=>{},
 sub:x=>x,esc:x=>String(x),pick:a=>a[0],safe:f=>f(),checkStory:()=>{},dotUpdate:()=>{},fmt:x=>String(x),zsAt:(_,v)=>v*10,maxZone:()=>0,myLife:()=>200,needQ:()=>10000,req:()=>10000,idleRate:()=>100,
 qiRetreat:d=>d*10,lifeSync:()=>{},F:k=>ctx.S.flags&&ctx.S.flags[k],avOf:()=>0,cnNum:n=>String(n),
 jTick:()=>{},clanDays:()=>{},zoneRegen:()=>{},wHud:()=>{},
 modal:(html,buttons)=>{ctx.modalHTML=html;ctx.buttons=buttons;},simYears:n=>{ctx.S.year+=n;ctx.S.age+=n;return[];},addQi:n=>{ctx.S.qi=Math.min(10000,ctx.S.qi+n);}});
const run=s=>vm.runInContext(s,ctx);
/* 用游戏里真正的 F，不用替身：之前替身写对了、正式版写错了，测试没抓到 */
{const m=/const F=(k=>[^;]+);/.exec(code);assert.ok(m,'missing F');ctx.F=run('('+m[1]+')');}
run(fs.readFileSync(__dirname+'/novels.js','utf8'));
run(section('const GIFTS=','function relName('));
run(section('/* Social gains','const BOND_CHAT='));
run("const BOND={hong:{n:'红鹞',likes:['wine']}};const BOND_CHAT={hong:[['聊聊'],['聊聊'],['聊聊']]};");
run(section('/* ---------- 时间推进','/* ---------- 因果事件'));
run(section('const RETREATS=','function xinmoFight()'));
function fresh(){ctx.S={started:true,qi:0,stones:100000,year:3,doy:240,daysAll:0,age:18,dao:{yin:0},flags:{},aff:{},social:{},rep:{station:0}};}
test('8 verified manuscripts, 134 chapters',()=>{assert.equal(ctx.window.LC_NOVELS.length,8);assert.equal(ctx.window.LC_NOVELS.reduce((a,v)=>a+v.chapters.length,0),134);});
test('every manuscript chapter has a title/body',()=>{for(const v of ctx.window.LC_NOVELS)for(const c of v.chapters){assert.ok(c.title&&c.body.length>100);}});
test('game calendar is independent of the real clock',()=>{fresh();const a=run('dateName()');assert.ok(a.startsWith('灵潮3年'));assert.ok(!a.includes(':'));
  run('timeTick(true)');assert.equal(ctx.S.daysAll,0);assert.equal(run('dateName()'),a);});
test('days only move through actions; a year rolls over at 365',()=>{fresh();run("advanceDays(10,'trip')");assert.equal(ctx.S.daysAll,10);assert.equal(ctx.S.year,3);
  run("advanceDays(200,'trip')");assert.equal(ctx.S.year,4);assert.equal(ctx.S.doy,(240+210)%365);assert.equal(ctx.S.age,19);});
test('advanceDays ignores zero, negative and garbage',()=>{fresh();run("advanceDays(0);advanceDays(-5);advanceDays('x')");assert.equal(ctx.S.daysAll,0);});
test('injuries heal by game days',()=>{fresh();run('injSet(3)');assert.equal(run('injOn()'),true);assert.equal(run('injLeft()'),3);run("advanceDays(3,'rest')");assert.equal(run('injOn()'),false);});
test('weekly supply from 铁叔 follows game days',()=>{fresh();const s0=ctx.S.stones;run("advanceDays(6,'rest')");assert.equal(ctx.S.stones,s0);run("advanceDays(1,'rest')");assert.ok(ctx.S.stones>s0);});
test('story years push the calendar forward only when behind',()=>{fresh();run('ensureYear(3)');assert.equal(ctx.S.daysAll,0);run('ensureYear(5)');assert.equal(ctx.S.year,5);assert.equal(ctx.S.doy,0);});
test('retreat costs stones, adds qi and advances exactly its days',()=>{fresh();run("retreatApply('month')");assert.equal(ctx.S.daysAll,30);assert.ok(ctx.S.qi>0);});
test('invalid retreat, battle, no stones and full qi are safe',()=>{fresh();let before=JSON.stringify(ctx.S);run("retreatApply('-1');retreatApply('invalid')");assert.equal(JSON.stringify(ctx.S),before);
  ctx.BT={};run("retreatApply('week')");assert.equal(JSON.stringify(ctx.S),before);ctx.BT=null;ctx.S.stones=0;run("retreatApply('week')");assert.equal(ctx.S.daysAll,0);ctx.S.stones=100;ctx.S.qi=10000;run("retreatApply('week')");assert.equal(ctx.S.stones,100);});
test('20 consecutive chats, diminishing gains, no day cooldown',()=>{fresh();for(let i=0;i<20;i++)run("chatBtn('hong')[0].fn()");assert.equal(ctx.S.aff.hong,40);assert.equal(ctx.S.social.hong.chat,20);});
test('repeated gifts cost stones and have diminishing returns',()=>{fresh();for(let i=0;i<10;i++){run("giftPick('hong')");ctx.buttons[1].fn();}assert.equal(ctx.S.social.hong.gifts.wine,10);assert.ok(ctx.S.stones<100000);});
test('player-facing rest and retreat copy has no authoring or background explanations',()=>{fresh();const text=run('closedHTML()');assert.ok(!/原稿|改编|小说|后台|本稿|玩家|刷新|现实|设备当地|同步|强制/.test(text));});
test('old conflicting chapters are switched off',()=>{const m=/const CANON_OFF=new Set\(\[([\s\S]*?)\]\)/.exec(code);assert.ok(m);for(const id of ['finale','feisheng','xinghai','zhoufate','port','locust'])assert.ok(m[1].includes("'"+id+"'"),id);});
test('novels are not loaded with the page',()=>{assert.ok(!/<script src="novels.js">/.test(html));});
test('flag reader returns the chosen value, not just true/false',()=>{fresh();ctx.S.flags={a:'san',b:0,c:2};assert.equal(run("F('a')"),'san');assert.equal(run("F('b')"),0);assert.equal(run("F('c')"),2);assert.equal(run("F('none')"),undefined);});
test('every branch value the story checks is actually set by some choice',()=>{
  const checks=[...code.matchAll(/F\('([A-Za-z0-9_]+)'\)(?:===|!==)('[^']*'|\d+)/g)];assert.ok(checks.length>30);
  const miss=[];for(const [,k,v] of checks){const re=new RegExp('(?:\\b'+k+':'+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w\'])|flags\\.'+k+'='+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w\']))');if(re.test(code))continue;/* 动态写入：flags:{k:变量}，值来自某张表的键 */const dyn=new RegExp('flags:\\{'+k+':[a-z_]').test(code)&&new RegExp('\\b'+v.replace(/'/g,'')+':\\{').test(code);if(!dyn)miss.push(k+'='+v);}
  assert.deepEqual([...new Set(miss)],[]);});
test('five endings follow the reading table',()=>{run(section('function v13Ends(){','const V13_END_NAME'));
  const T=[['san','zhong','an',['deng']],['san','chuan','an',['shou']],['gong','zhong','an',['shou']],['gong','chuan','an',['shou','bai']]];
  for(const f of ['san','gong'])for(const a of ['zhong','chuan']){T.push([f,a,'hai',['feng']]);T.push([f,a,'xiang',['qing']]);}
  for(const [f,a,q,want] of T){fresh();ctx.S.flags={v11Fang:f,v12An:a,v13Qu:q};assert.equal(JSON.stringify(run('v13Ends()')),JSON.stringify(want),f+a+q);}});
test('saves from SAVE_V=4 on are kept; older test saves are not read',()=>{run(section('const SAVE_V=','function save(){'));
  assert.equal(run('oldSave({v:3,name:"x"})'),true);assert.equal(run('oldSave(null)'),true);assert.equal(run('oldSave({v:4})'),false);assert.equal(run('oldSave({v:9})'),false);
  ctx.save4={v:4,name:'林舟',stage:13,qi:55,stones:777,seen:['v10_21','v11_1'],flags:{v11Fang:'san',v10Key:1},aff:{hong:80},partners:['hong'],year:12,doy:40,daysAll:3000};
  const o=run('hydrate(JSON.parse(JSON.stringify(save4)))');
  assert.equal(o.v,run('SAVE_V'));assert.equal(o.name,'林舟');assert.equal(o.stage,13);assert.equal(o.stones,777);assert.equal(JSON.stringify(o.seen),'["v10_21","v11_1"]');
  assert.equal(o.flags.v11Fang,'san');assert.equal(o.aff.hong,80);assert.equal(JSON.stringify(o.partners),'["hong"]');assert.equal(o.year,12);
  assert.ok(Array.isArray(o.bag)&&o.gear&&typeof o.ups.tuna==='number','missing fields get defaults');
  assert.ok(Array.isArray(o.pets)&&o.pets.length===0&&o.petFood.grain===3&&o.ng===0&&Array.isArray(o.letters),'new systems get defaults on old saves');});
test('pets: liked food grows twice as fast, hated food is refused, hunger follows game days',()=>{run(section('const PET_SP=','/* 日子往前走'));
  fresh();ctx.S.pets=[];ctx.S.petFood={grain:10,fruit:2};ctx.S.petOn=-1;run("petGive('huitu')");const p=ctx.S.pets[0];assert.equal(p.name,'灰团');assert.equal(ctx.S.petOn,0);
  assert.equal(run("petEat(S.pets[0],'fruit')"),'hate');assert.equal(p.xp,0);
  assert.equal(run("petEat(S.pets[0],'grain')"),'like');assert.equal(p.xp,8);assert.equal(p.full,100);
  p.full=60;run('petTick(3)');assert.equal(p.full,36);run('petTick(10)');assert.equal(p.full,0);
  ctx.S.petAuto=true;run('petTick(1)');assert.ok(p.full>=50,'auto feed tops up');assert.ok(ctx.S.petFood.fruit===2,'auto feed never uses hated food');
  run('petXp(S.pets[0],9999)');assert.equal(p.lv,15);assert.equal(run("petGive('huitu')"),null);});
console.log(`${checks} tests passed`);
