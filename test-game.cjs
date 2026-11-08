const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
new vm.Script(code); new vm.Script(fs.readFileSync(__dirname+'/novels.js','utf8'));
let checks=0;function test(n,f){f();checks++;console.log('PASS '+n);}
function section(a,b){return code.slice(code.indexOf(a),code.indexOf(b,code.indexOf(a)));}
const ctx=vm.createContext({console,Date,Math,window:{},S:{},BT:null,SC:null,TAB:'story',VIEWS:{story:()=>'',world:()=>''},ACT:{},document:{createElement:()=>({setAttribute(){}}),body:{appendChild(){}},querySelector:()=>({insertAdjacentElement(){}})},$:()=>null,toast:()=>{},save:()=>{},render:()=>{},live:()=>{},sub:x=>x,esc:x=>String(x),pick:a=>a[0],safe:f=>f(),checkStory:()=>{},dotUpdate:()=>{},fmt:x=>String(x),zsAt:(_,v)=>v*10,maxZone:()=>0,myLife:()=>200,needQ:()=>10000,idleRate:()=>100,ageCheck:()=>{},modal:(html,buttons)=>{ctx.modalHTML=html;ctx.buttons=buttons;},simYears:n=>{ctx.S.year+=n;ctx.S.age+=n;return[];},addQi:n=>{ctx.S.qi=Math.min(10000,ctx.S.qi+n);}});
const run=s=>vm.runInContext(s,ctx);
run(fs.readFileSync(__dirname+'/novels.js','utf8'));
run(section('const GIFTS=','function relName('));
run(section('/* Social gains','const BOND_CHAT='));
run("const BOND={hong:{n:'红鹞',likes:['wine']}};const BOND_CHAT={hong:[['聊聊'],['聊聊'],['聊聊']]};");
run(section('const CN=', 'const yearName='));
run(section('/* Wall clock is display-only','function ageCheck()'));
run(section('const RETREATS=','function xinmoFight()'));
function fresh(){ctx.S={started:true,qi:0,stones:100000,year:3,age:18,dao:{yin:0},flags:{},aff:{},social:{}};}
test('8 verified manuscripts, 134 chapters',()=>{assert.equal(ctx.window.LC_NOVELS.length,8);assert.equal(ctx.window.LC_NOVELS.reduce((a,v)=>a+v.chapters.length,0),134);});
test('real clock independent of story years and old accelerated accumulator',()=>{fresh();ctx.S.year=900;ctx.S.yAcc=999;const date=run('dateName()');assert.ok(date.startsWith('灵潮'));assert.ok(!date.includes(String(new Date().getFullYear())));assert.ok(date.includes(String(new Date().getHours()).padStart(2,'0')+':'));run('timeTick(999999)');assert.equal(ctx.S.year,900);assert.equal(run('gameDay()'),Math.floor(Date.now()/86400000));});
test('20 consecutive chats, diminishing gains, no day cooldown',()=>{fresh();for(let i=0;i<20;i++)run("chatBtn('hong')[0].fn()");assert.equal(ctx.S.aff.hong,40);assert.equal(ctx.S.social.hong.chat,20);assert.equal(run("chatBtn('hong').length"),2);});
test('repeated gifts cost stones and persist diminishing returns',()=>{fresh();for(let i=0;i<10;i++){run("giftPick('hong')");ctx.buttons[1].fn();}assert.equal(ctx.S.aff.hong,56);assert.equal(ctx.S.stones,99800);assert.equal(ctx.S.social.hong.gifts.wine,10);ctx.S=JSON.parse(JSON.stringify(ctx.S));run("giftPick('hong')");ctx.buttons[1].fn();assert.equal(ctx.S.aff.hong,58);});
test('affection capped; insufficient stones never grants gift',()=>{ctx.S.aff.hong=99;run("chatBtn('hong')[0].fn()");assert.equal(ctx.S.aff.hong,100);ctx.S.stones=0;run("giftPick('hong')");ctx.buttons[1].fn();assert.equal(ctx.S.social.hong.gifts.wine,11);});
test('week/month/quarter/half-year aggregate without changing timers',()=>{fresh();ctx.S.injury=Date.now()+99999;ctx.S.dt={slots:[{start:123,left:500}]};ctx.S.clan={until:456};const timers=JSON.stringify([ctx.S.injury,ctx.S.dt,ctx.S.clan]);for(const id of ['week','month','quarter','half'])run(`retreatApply('${id}')`);assert.equal(ctx.S.retreatDays,307);assert.equal(ctx.S.year,3);assert.equal(ctx.S.age,18);assert.equal(timers,JSON.stringify([ctx.S.injury,ctx.S.dt,ctx.S.clan]));assert.ok(ctx.S.stones<100000);});
test('fractional retreats survive reload and advance one year only at 365 days',()=>{ctx.S=JSON.parse(JSON.stringify(ctx.S));ctx.S.qi=0;run("retreatApply('month');retreatApply('month')");assert.equal(ctx.S.retreatDays,367);assert.equal(ctx.S.retreatRemainder,2);assert.equal(ctx.S.year,4);});
test('invalid/negative retreat, battle, no stones and bottleneck are safe',()=>{fresh();let before=JSON.stringify(ctx.S);run("retreatApply('-1');retreatApply('invalid')");assert.equal(JSON.stringify(ctx.S),before);ctx.BT={};run("retreatApply('week')");assert.equal(JSON.stringify(ctx.S),before);ctx.BT=null;ctx.S.stones=0;run("retreatApply('week')");assert.equal(ctx.S.retreatDays,undefined);ctx.S.stones=100;ctx.S.qi=10000;run("retreatApply('week')");assert.equal(ctx.S.stones,100);});
test('every manuscript chapter has a title/body',()=>{for(const v of ctx.window.LC_NOVELS)for(const c of v.chapters){assert.ok(c.title&&c.body.length>100);}});
test('offline no longer accelerates calendar or ages',()=>{const fn=section('function offline()','function intro()');assert.ok(!fn.includes('simYears'));assert.ok(!fn.includes('Y_SEC'));});
test('game calendar follows local midnight, year rollover, leap day and shichen',()=>{
assert.equal(run('dateName(new Date(2026,10,8,23,59))'),'灵潮三年 十一月八日 · 子时 23:59');
assert.equal(run('dateName(new Date(2026,10,9,0,0))'),'灵潮三年 十一月九日 · 子时 00:00');
assert.equal(run('dateName(new Date(2027,0,1,1,0))'),'灵潮四年 一月一日 · 丑时 01:00');
assert.equal(run('dateName(new Date(2028,1,29,12,30))'),'灵潮五年 二月二十九日 · 午时 12:30');
fresh();const before=run('dateName(new Date(2026,10,8,18,42))');run("retreatApply('half')");assert.equal(run('dateName(new Date(2026,10,8,18,42))'),before);
});
test('player-facing task and retreat copy has no authoring or background explanations',()=>{
const text=run('closedHTML()');
assert.ok(!/原稿|改编|小说|后台|本稿|玩家|刷新|现实|设备当地|同步|强制/.test(text));
});
console.log(`${checks} tests passed`);
