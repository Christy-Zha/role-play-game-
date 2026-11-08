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
console.log(`${checks} tests passed`);
