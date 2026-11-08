/* ================= 时间 · 人物 · 因果 · 弟子 · 道途 · 结局 ================= */
const CN='零一二三四五六七八九';
function cnNum(n){n=Math.floor(n);if(n<10)return CN[n];if(n<20)return '十'+(n%10?CN[n%10]:'');if(n<100)return CN[Math.floor(n/10)]+'十'+(n%10?CN[n%10]:'');if(n<1000){const h=Math.floor(n/100),r=n%100;return CN[h]+'百'+(r?(r<10?'零'+CN[r]:(r<20?'一':'')+cnNum(r)):'');}return String(n);}
const yearName=y=>'灵潮'+cnNum(y==null?S.year:y)+'年';
// Human lifespan progression inspired by 聚宝仙盆; 渡劫/真仙 adapt its different realm chain to this game's single calendar.
// Infinity is derived, never persisted in saves.
const LIFE=[100,200,500,1000,2000,5000,10000,100000,100000,1000000,10000000,Infinity,Infinity,Infinity];
const lifeOf=st=>st<0?75:LIFE[STAGES[Math.max(0,Math.min(st,LAST))].r];
const lifeText=n=>Number.isFinite(n)?(n>=10000&&n%10000===0?n/10000+'万':String(n))+' 年':'无尽（不因衰老坐化）';
function lifeSync(o){const limit=lifeOf(o.stage)+(o.lifeB||0);if(o.age<limit){o.dying=0;o.fateQ=(o.fateQ||[]).filter(e=>e.k!=='old');}if(o.age<limit-10)o.agewarn=0;}
const myLife=()=>lifeOf(S.stage)+(S.lifeB||0);
const realmOf=st=>st<0?'凡人':STAGES[Math.min(st,LAST)].name;

/* ---------- 人物 ---------- */
const PPL0=[
 {id:'tie',n:'铁叔',fr:'tie',age:56,st:-1,life:79,goal:'守住青石站',att:30},
 {id:'shen',n:'沈老',fr:'shen',age:71,st:-1,life:84,goal:'下完最后一盘棋',att:20},
 {id:'qian',n:'钱三',fr:'qian',age:44,st:-1,life:76,goal:'找到失散的女儿',att:10},
 {id:'hong',n:'红鹞',fr:'hong',age:33,st:-1,life:74,goal:'把商队开到海边',att:10},
 {id:'he',n:'阿禾',fr:'he',age:12,st:-1,life:78,goal:'长大，变成有用的人',att:30},
 {id:'man',n:'小满',fr:'man',age:9,st:-1,life:80,goal:'找到哥哥',att:20},
 {id:'zhou',n:'周烈',fr:'zhou',age:29,st:12,tal:.55,goal:'变得比所有人都强',att:0},
 {id:'cm',n:'陈默',fr:'cm',age:35,st:8,tal:.45,goal:'赎清过去',att:0},
 {id:'lie',n:'烈无咎',sect:'chixiao',ch:'p_lie',age:24,st:11,tal:.85,goal:'登上江湖榜首',att:-5},
 {id:'chiyang',n:'赤阳真人',sect:'chixiao',ch:'p_chiyang',age:212,st:20,tal:.4,goal:'把赤霄宗传下去',att:0,lead:1},
 {id:'yun',n:'云漪',sect:'xuanshui',ch:'p_yun',age:23,st:10,tal:.75,goal:'寻回失踪的师父',att:5},
 {id:'shuiyue',n:'水月仙子',sect:'xuanshui',ch:'p_shuiyue',age:340,st:22,tal:.45,goal:'参透水镜之秘',att:0,lead:1},
 {id:'lin',n:'林小苗',sect:'baicao',ch:'p_lin',age:17,st:3,tal:.6,goal:'炼出一炉九转金丹',att:10},
 {id:'huagu',n:'花姑',sect:'baicao',ch:'p_huagu',age:150,st:16,tal:.4,goal:'在死前找到传人',att:5,lead:1},
 {id:'shi',n:'石铁山',sect:'tiegu',ch:'p_shi',age:46,st:12,tal:.35,goal:'在寿元耗尽前结丹',att:0,lead:1},
 {id:'yan',n:'阎九娘',sect:'youming',ch:'p_yan',age:160,st:24,tal:.5,goal:'找到延寿之法',att:-10,lead:1},
 {id:'gu',n:'顾长风',sect:'tianqiong',ch:'p_gu',age:90,st:29,tal:.6,goal:'完成堕仙的遗愿',att:-20,lead:1},
 {id:'mowen',n:'莫问',ch:'p_mo',age:63,st:7,tal:.25,goal:'死前再看一眼故乡',att:5}
];
function pplLooks(){(S.ppl||[]).forEach(p=>{if(p.fr&&CH[p.fr])p.ch=p.fr;if(p.ch&&!LOOK[p.n]){LOOK[p.n]={a:'human',k:'P'+p.ch,c:'#3a3a40',c2:'#2a2a30',e:'#ffd070'};MON_CH['P'+p.ch]=p.ch;}});}
const BG_N=90,BG_GOALS=['想在寿元耗尽前再破一境','想找一处清净的洞府','想替师门争一口气','想攒够灵石娶亲','想报当年的灭门之仇','想见识天外的风景','想收一个像样的徒弟','想炼出一件趁手的法宝','只想安稳活下去'];
function bgSpawn(young){const st=young?Math.floor(Math.random()*4):Math.floor(Math.pow(Math.random(),2.4)*25);const lk=.8+Math.random()*.3,life=Math.round(lifeOf(st)*lk);const age=young?14+Math.floor(Math.random()*10):Math.max(16,Math.floor(18+Math.random()*(life*.6-18)));
 const n=pick(CL_SUR.split(''))+pick(CL_GIV)+(Math.random()<.55?pick(CL_GIV):'');return {id:'b'+(S.uid++),n,bg:1,known:true,alive:true,st,age,tal:.15+Math.random()*.4,lifeK:lk,att:0,goal:pick(BG_GOALS),sect:Math.random()<.55?pick(Object.keys(SECTS)):null,ch:'p_gen'+(1+Math.floor(Math.random()*6))};}
function bgFill(young){const n=S.ppl.filter(p=>p.bg&&p.alive).length;for(let i=n;i<BG_N;i++)S.ppl.push(bgSpawn(young));}
function pplInit(){if(S.ppl&&S.ppl.length){if(!S.ppl.some(p=>p.bg))bgFill(false);pplLooks();return;}S.ppl=PPL0.map(p=>Object.assign({alive:true,tal:.4,known:true,lifeK:.85+Math.random()*.3},JSON.parse(JSON.stringify(p))));
 const cm=S.ppl.find(p=>p.id==='cm');if(F('chenmoGone')){cm.sect='youming';cm.att=-50;cm.goal='让你后悔当年的选择';cm.st=12;cm.tal=.6;seedAdd('revenge','cm',S.year+12+Math.floor(Math.random()*10),{why:'当年你把我赶出青石站的时候，可曾回头看一眼？'});}bgFill(false);pplLooks();}
const P_=id=>(S.ppl||[]).find(p=>p.id===id);
const pLife=p=>p.st<0?(p.life||75):Math.round(lifeOf(p.st)*(p.lifeK||1))+(p.lifeB||0);
const attName=p=>p.att>=60?'挚友':p.att>=25?'交好':p.att<=-60?'死仇':p.att<=-25?'敌视':'泛泛';
function news(t,imp){S.news.unshift({y:S.year,t,imp:imp?1:0});if(S.news.length>60)S.news.length=60;if(OUTER_NEWS)OUTER_NEWS.push(t);}
let OUTER_NEWS=null;

/* ---------- 因果种子 ---------- */
function seedAdd(k,pid,due,data){S.seeds.push(Object.assign({k,pid,due},data||{}));}
function mkPerson(o){const id='x'+(S.uid++);const p=Object.assign({id,alive:true,known:true,tal:.5,att:0,st:0,age:20,lifeK:.9+Math.random()*.2,goal:'',ch:'p_gen'+(1+Math.floor(Math.random()*6))},o);p.id=id;S.ppl.push(p);
 LOOK[p.n]=LOOK[p.n]||{a:'human',k:'P'+p.ch,c:'#3a3a40',c2:'#2a2a30',e:'#ffd070'};MON_CH['P'+p.ch]=p.ch;return p;}

/* ---------- 一年 ---------- */
function oneYear(){S.year++;S.age++;const Y=S.year;
 for(const p of S.ppl){if(!p.alive)continue;p.age++;if(p.fr)continue;/* 主线人物的去留只由剧情决定 */
  if(p.fr==='he'&&p.age===18&&p.st<0){if(F('heRoot')){p.st=9;p.tal=.8;p.sect='baicao';p.goal='把百草谷撑起来';news('阿禾十八岁，拜入百草谷。花姑说她是这辈子见过最肯吃苦的孩子。',1);}else{p.goal='在青石站开一家药铺';news('阿禾十八岁了。她在青石站开了间小药铺，招牌是她自己写的。');}}
  if(p.fr==='man'&&p.age===18&&p.st<0){p.st=5;p.tal=.65;p.goal='找到哥哥';news('小满十八岁，背着一把旧刀离开青石站，说要去找哥哥。');}
  if(p.st>=0){const r=STAGES[Math.min(p.st,LAST)].r,nx=Math.min(p.st+1,LAST),major=STAGES[nx].r>r;
   if(p.st<LAST&&(!major?Math.random()<p.tal*.6/(1+r*.7):Math.random()<p.tal*.2/(1+r*.35))){p.st++;if(major&&p.known&&(!p.bg||STAGES[p.st].r>=4))news(p.n+'突破至'+REALMS[STAGES[p.st].r]+'。'+(p.att<=-40?'——那个恨你的人，又强了一截。':''),p.att<=-40||p.att>=40);}
   else if(major&&Math.random()<.04*(p.age/pLife(p))){p.alive=false;p.dy=Y;if(!p.bg||p.st>=21)news(p.n+'冲关失败，身死道消。',p.known&&!p.bg);continue;}}
  if(p.fr&&p.st<0&&pLife(p)-p.age===4)news(p.n+'老了很多。'+({tie:'他还是每天去站台上走一圈，只是走得越来越慢。',shen:'他下棋的时候常常睡着。',qian:'他算账开始出错了。',hong:'她的商队交给了别人带。'}[p.fr]||''),1);
  if(p.age>=pLife(p)){p.alive=false;p.dy=Y;personDied(p);}}
 bgFill(true);
 /* 宗主更替 */
 Object.keys(SECTS).forEach(k=>{if(S.sm&&S.sm.k===k&&S.sm.rank>=5)return;const lead=S.ppl.find(p=>p.sect===k&&p.lead);if(lead&&lead.alive)return;const cand=S.ppl.filter(p=>p.alive&&p.sect===k&&p.st>=0).sort((a,b)=>b.st-a.st)[0];
  if(lead)lead.lead=0;if(cand){cand.lead=1;news(cand.n+'继任'+SECTS[k].n+(k==='baicao'?'谷主':k==='tiegu'?'帮主':k==='youming'?'殿主':k==='tianqiong'?'会首':'宗主')+'。'+(cand.att<=-40?'你的仇人，如今是一宗之主了。':cand.att>=40?'是你的老朋友。':''),1);if(cand.fr==='he')S.flags.heLead=1;}});
 /* 弟子 */
 disYear();
 /* 种子 */
 S.seeds.forEach(sd=>{if(sd.fired||Y<sd.due)return;const p=P_(sd.pid);if(sd.pid&&(!p||!p.alive)){sd.fired=1;if(p&&p.known)news('你等的那个人，没能等到再见。'+p.n+'已经不在了。');return;}
  if(sd.k==='revenge'&&p.st<S.stage-8&&(sd.wait||0)<3){sd.wait=(sd.wait||0)+1;sd.due=Y+6;return;}
  if(S.path==='yin'&&sd.k!=='grace'&&Math.random()<.4){sd.due=Y+5;return;}
  sd.fired=1;S.fateQ.push(sd);});
 /* 江湖小事 */
 if(Math.random()<.18){const t=pick(['赤霄宗与玄水门在落雁湖斗法三日，死伤数十人。','北方又起了一场灵潮，几座凡人的城一夜之间空了。','坊市来了一位卖卦的瞎子，据说算得极准。','有人在废城里挖出一座古修的洞府，去寻宝的修士没几个回来。','铁骨帮招了一批新弟子，演武场整夜都是喊声。','幽冥殿的人在夜里收尸。没人敢问他们收去做什么。','东郊的天穹券又跌了一成，坊市的米价跟着涨。','北线有一支车队在雪里困了九天，回来时少了两辆车。']);news(t);}}
function simYears(n){OUTER_NEWS=[];const N=Math.min(n,400);for(let i=0;i<N;i++)oneYear();if(n>N){S.year+=n-N;S.age+=n-N;}const L=OUTER_NEWS;OUTER_NEWS=null;return L;}
function personDied(p){if(!p.known)return;if(p.bg){if(p.st>=21||p.lead)news(p.n+'寿元耗尽，坐化。');return;}
 if(p.fr){S.flags['dead_'+p.fr]=1;QUESTS.forEach(q=>{if(q.npc===p.fr&&S.q[q.id]&&S.q[q.id].s!=='done')S.q[q.id].s='done';});S.fateQ.push({k:'death',pid:p.id});news(p.n+'走了，享年 '+p.age+' 岁。',1);}
 else news(p.n+'寿元耗尽，坐化于'+(p.sect?SECTS[p.sect].n:'荒野')+'。'+(p.att<=-40?'你们之间的恩怨，就此作罢。':''),p.att<=-40||p.att>=40);
 if(p.lead){p.lead=0;}}

/* ---------- 时间推进 ----------
   游戏里的日子和现实无关，只随你的行动往前走：出城历练、扫荡、闭关、歇息、剧情里的「过些日子」「几年以后」。
   你不玩的时候，世界停着。 */
const Y_DAYS=365,MON_D=[31,28,31,30,31,30,31,31,30,31,30,31];
const daysAll=()=>S.daysAll||0;
const gameDay=()=>daysAll();
const dayKey=()=>'d'+daysAll();
function monthDay(d){let m=0,r=d;while(m<11&&r>=MON_D[m]){r-=MON_D[m];m++;}return [m,r+1];}
function dateName(){const [m,d]=monthDay(S.doy||0);return '灵潮'+cnNum(S.year)+'年 '+cnNum(m+1)+'月'+(d<=10?'初'+cnNum(d):cnNum(d))+'日';}
function seasonName(){const m=monthDay(S.doy||0)[0];return ['冬','冬','春','春','春','夏','夏','夏','秋','秋','秋','冬'][m];}
/* 让日子往前走 n 天。所有跟着日子走的东西都在这里结算 */
function advanceDays(n,why){n=Math.max(0,Math.floor(n||0));if(!n||!S.started)return [];
 S.daysAll=daysAll()+n;S.doy=(S.doy||0)+n;
 try{jTick(n*600);}catch(e){}
 try{clanDays(n);}catch(e){}
 try{supplyDays(n);}catch(e){}
 try{zoneRegen(n);}catch(e){}
 S.tox=Math.max(0,(S.tox||0)-n*40);
 let L=[];const y=Math.floor(S.doy/Y_DAYS);
 if(y>0){S.doy%=Y_DAYS;S.yearsClosed=why==='closed'?1:0;L=simYears(y);S.yearsClosed=0;ageCheck();if(why!=='closed'&&why!=='story')toast(dateName()+' · 又是一年');}
 try{timeTick(true);}catch(e){}
 return L;}
/* 剧情里写的年份：不到就把日子推过去 */
function ensureYear(y){if(S.year>=y)return [];return advanceDays((y-S.year)*Y_DAYS-(S.doy||0),'story');}
/* 伤势按日子算 */
function injSet(days){S.injD=Math.max(S.injD||0,daysAll()+Math.max(1,Math.ceil(days)));}
const injOn=()=>(S.injD||0)>daysAll();
const injLeft=()=>Math.max(0,(S.injD||0)-daysAll());
/* 每七天，铁叔托人送一回补给 */
function supplyDays(n){S.supAcc=(S.supAcc||0)+n;let k=0;while(S.supAcc>=7){S.supAcc-=7;k++;}if(!k)return;
 const g=k*Math.ceil(zsAt(maxZone(),3)*(1+.15*Math.max(0,S.rep.station))*(avOf('tie')>=40?1.5:1));S.stones+=g;
 setTimeout(()=>toast((F('dead_tie')?'站里照铁叔的规矩送来补给：灵石 +':'铁叔托人送来补给：灵石 +')+fmt(g)),900);}
/* 歇息：不花灵石，只让日子过去，伤也慢慢好 */
function restDays(n){n=+n||1;if(BT)return;const L=advanceDays(n,'rest');S.hpF=1;S.mpF=1;save();render();
 modal(`<h3>歇了 ${n} 天</h3><p>${dateName()}。${injOn()?'伤还没好全，还要 '+injLeft()+' 天。':'身上的伤都好了。'}</p>${L.slice(0,5).map(t=>'<p>'+esc(sub(t))+'</p>').join('')}`,[{t:'好',cls:'gold'}]);}
let clockSecond=-1;
function timeTick(force){const second=Math.floor(Date.now()/1000);if(!force&&second===clockSecond)return;clockSecond=second;const el=$('#realClock');if(el)el.textContent=S&&S.started?dateName()+' · '+seasonName():'';if(TAB==='world')try{wHud();}catch(e){}}
function ageCheck(){lifeSync(S);if(S.age>=myLife()&&!S.dying){S.dying=1;S.fateQ.unshift({k:'old'});}else if(S.age<myLife()&&S.age>=myLife()-10&&!S.agewarn){S.agewarn=1;toast('寿元将尽：还剩 '+(myLife()-S.age)+' 年。突破境界或服寿元丹可以延寿','bad');}}
function fateCheck(){if(!S.started||BT||!OV_FREE()||SC||!S.fateQ.length)return;const sd=S.fateQ.shift();save();fatePlay(sd);}

/* ---------- 因果事件 ---------- */
function fatePlay(sd){if(sd.k==='old'&&S.age<myLife()){lifeSync(S);return;}const p=sd.pid&&P_(sd.pid),Y=yearName();let ev=null;
 if(sd.k==='old'){ev={title:'寿元',g:'寿',lines:['你醒来的时候，看见自己的手背上长出了斑。','你修了 '+(S.age-18)+' 年，终究没能修过天命。'],choices:[
   ...(S.lifeP>0?[{t:'服下寿元丹（剩 '+S.lifeP+' 颗）',act:()=>{S.lifeP--;S.lifeB=(S.lifeB||0)+30;S.dying=0;S.agewarn=0;return '药力化开，斑点慢慢褪去。你又多了三十年。';}}]:[]),
   {t:'兵解转世',act:()=>{setTimeout(()=>reincarnate(false),300);return '你盘膝坐下，散去一身修为。下一世，从头来过。';}}]};}
 else if(sd.k==='death'){const fr=p.fr,leg=LEGACY[fr]||{t:'他留下的东西不多。',fx:()=>gS(zsAt(maxZone(),3))};
  ev={title:'故人',g:'逝',lines:['消息是从青石站传来的：'+p.n+'走了。'+(S.yearsClosed?'那时你还在闭关。':''),leg.t],choices:[{t:'回去送他最后一程',act:()=>leg.fx()+(S.hhDan>0?' （你还有还魂丹——可在「江湖·人物」里用）':'')}]};}
 else if(sd.k==='revenge'){ev={title:'故人寻仇',g:'仇',lines:[p.n+'来了。'+(p.sect?'他如今是'+SECTS[p.sect].n+'的人。':''),'“'+(sd.why||'你还记得我吗？')+'”他的境界是'+realmOf(p.st)+'。','“这些年，我每天都在想这一天。”'],choices:[
   {t:'迎战',act:()=>({text:p.n+'拔出了兵刃。',fight:{look:p.n,name:p.n,m:Math.max(1.6,1.6+(p.st-S.stage)*.08),boss:true,human:1,after:()=>{p.att=-20;S.dao.zheng+=1;return revengeAfter(p);}}})},
   {t:'当年是我错了',need:()=>S.stones>=zsAt(maxZone(),20),act:()=>{S.stones-=zsAt(maxZone(),20);p.att=-10;S.dao.zheng+=1;return '你把当年的东西加倍赔给了他。他盯着你看了很久，转身走了。仇没有解，但他不会再来了。';}},
   {t:'躲开',act:()=>{seedAdd('revenge',p.id,S.year+5,{why:sd.why});return '你避开了。可你知道，他还会再来。';}}]};}
 else if(sd.k==='modis'){const hasClan=!!S.clan;ev={title:'血债',g:'血',lines:[(Y)+'，一个年轻的魔修找上门来。他自称是当年被你斩杀的魔修「'+sd.mname+'」的弟子。',hasClan?'他身后站着一群血衣人，正对着'+S.clan.name+'的祠堂。':'“我师父死的那天，我躲在床底下。我记住了你的脸。”'],choices:[
   {t:'迎战',act:()=>({text:'血衣人一拥而上。',fight:{many:[{look:p.n,name:p.n,m:1.9,boss:true},{look:'黑市打手',name:'血衣卫',m:.8},{look:'黑市打手',name:'血衣卫',m:.8}],after:()=>'',onWin:()=>fateAfterModis(p,true),onLose:()=>fateAfterModis(p,false)}})}]};}
 else if(sd.k==='grace'){ev={title:'故人来访',g:'恩',lines:[(Y)+'，有人在青石站外求见。','来的是'+p.n+'——'+(sd.why||'当年你救下的那个人')+'。如今'+(p.sect?'已是'+SECTS[p.sect].n+'的人，':'')+'境界'+realmOf(p.st)+'。','“我说过，会回来报答你。”'],choices:[
   {t:'收下谢礼',act:()=>{p.att=Math.min(100,p.att+20);S.dao.zheng+=1;return '他留下一只储物袋。'+gItem(3)+gMat('ru',1)+gS(zsAt(maxZone(),12));}},
   {t:'请他留下（加入行社）',need:()=>!!S.clan,act:()=>{p.att=100;const c=S.clan;c.mem.push({id:S.uid++,name:p.n,k:p.ch&&CH[p.ch]?p.ch:villager(S.uid*7),role:'客卿',apt:Math.min(5,2+Math.round(p.tal*4)),lv:Math.max(1,Math.round(p.st/2)),exp:0,busy:null});clLog(p.n+'投奔了行社。');S.dao.zong+=1;return p.n+'留了下来，成了'+c.name+'的客卿。';}}]};}
 else if(sd.k==='sect'){const SK=SECTS[sd.sect];const lead=S.ppl.find(x=>x.sect===sd.sect&&x.lead&&x.alive);ev={title:SK.n+'来犯',g:'宗',lines:['当年你折辱'+SK.n+'的事，他们没有忘。',(lead?lead.n:'他们的新宗主')+'带着人堵在了'+(S.clan?S.clan.name+'门口':'你回青石站的路上')+'。'],choices:[
   {t:'迎战',act:()=>({text:'来者不善。',fight:{many:[sectFoe(sd.sect,2),sectFoe(sd.sect,1)],onWin:()=>{S.sects[sd.sect].rel='beaten';news(SK.n+'再次铩羽而归。',1);modal('<h3>击退'+SK.n+'</h3><p>他们走了。这一次，大概不会再来了。</p>',[{t:'好',cls:'gold'}]);},onLose:()=>clanLoss(SK.n)}})},
   {t:'交出灵石赔罪',need:()=>S.stones>=zsAt(maxZone(),25),act:()=>{S.stones-=zsAt(maxZone(),25);S.sects[sd.sect].rel=null;return '你认了。他们拿了东西走人。这口气你咽下去了。';}}]};}
 else if(sd.k==='betray'){ev={title:'叛出师门',g:'叛',lines:[p.n+'走了。','他留下一封信：“师父教我的，我都记得。可我想要的，你给不了。”','他带走了'+(S.clan?S.clan.name:'你')+'库里的一半灵石。'],choices:[{t:'由他去',act:()=>{S.stones=Math.floor(S.stones*.8);seedAdd('revenge',p.id,S.year+15,{why:'师父，我回来了。'});return '你没有追。你知道，你们还会再见。';}}]};}
 else if(sd.k==='disdeath'){ev={title:'陨落',g:'殇',lines:['弟子'+sd.dn+sd.why+'。','你赶到的时候，他的洞府里只剩一盏还亮着的灯，和一摞写满了字的手札。','最后一页写着：「师父，我先走一步。后面的路，请让师弟师妹们走得稳一些。」'],choices:[{t:'把手札收进祠堂',act:()=>' 先人遗泽 +1 卷：之后的弟子冲关更稳，并自带他学过的功法。'}]};}
 if(!ev)return;EVENTS.__fate=Object.assign({zones:'cult'},ev);playEvent('__fate',{});}
function revengeAfter(p){if(p.st>=S.stage-2&&Math.random()<.5){p.alive=false;p.dy=S.year;news(p.n+'死在了你的剑下。',1);return ' '+p.n+'倒下了。他到死都睁着眼睛。'+gItem(3);}p.att=-30;return ' '+p.n+'败了，拖着伤走了。'+gS(zsAt(maxZone(),6));}
function fateAfterModis(p,win){if(win){modal(`<h3>血债</h3><p>${esc(p.n)}跪在地上，血从嘴角流下来。“杀了我。就像你杀我师父那样。”</p>`,[
   {t:'斩草除根',cls:'red',fn:()=>{p.alive=false;p.dy=S.year;S.dao.zheng+=1;kar(-1);news(p.n+'死了。他的师门就此断绝。',1);toast('因果了结','big');save();}},
   {t:'放他走',cls:'gold',fn:()=>{p.att=-10;S.flags.modisSpared=1;S.dao.zheng+=1;kar(1);news(p.n+'被你放走了。');toast('你放过了他','big');checkStory();save();}},
   ...(S.clan?[{t:'收他为徒',cls:'ghost',fn:()=>{p.alive=false;S.flags.modisDisciple=1;disAdd({n:p.n,apt:4,root:'huo',st:p.st,age:p.age,trait:'孤僻',note:'魔修之徒，你亲手杀了他的师父。',loy:20});news(p.n+'拜入了'+S.clan.name+'——拜的是杀师仇人。',1);checkStory();save();}}]:[])]);}
 else clanLoss('血衣人');}
function clanLoss(who){const c=S.clan;if(!c){goTown(true);return;}const ks=Object.keys(c.bld).filter(k=>c.bld[k]>1);if(ks.length){const k=pick(ks);c.bld[k]--;}const m=c.mem.filter(x=>!x.gone);let lost='';if(false&&m.length>2){const v=pick(m);v.gone=1;lost=v.name;}
 clLog(who+'闯进行社，砸了一座屋子。'+(lost?lost+'没能回来。':''));news(who+'闯进'+c.name+'，砸了一座屋子。'+(lost?lost+'战死。':''),1);c.fame=Math.max(0,c.fame-40);goTown(true);setTimeout(()=>modal(`<h3>行社遭了劫</h3><p>你被打倒的时候，听见议事堂里有人在喊你的名字。</p><p>${lost?esc(lost)+'没能回来。':''}行社的一座建筑塌了，声望一落千丈。</p>`,[{t:'……',cls:'red'}]),600);}
const LEGACY={
 tie:{t:'铁叔走之前，把一把磨得发亮的锤子交给了阿禾，让她转交给你。“告诉那孩子，站台的灯，要一直亮着。”',fx:()=>gItemNamed('w',3,'铁叔的锤子',maxZone())},
 shen:{t:'沈老留下一副棋，和一本写满了批注的棋谱。最后一页写着：「此局未完，留给后来人。」',fx:()=>{S.flags.shenQipu=1;return ' 获得「沈老棋谱」：五子棋对局奖励翻倍。';}},
 qian:{t:'钱三的账本最后一页，记着一笔账：「欠{name}，一条命。」后面跟着一串数字——他攒了一辈子的灵石。',fx:()=>gS(zsAt(maxZone(),30))},
 hong:{t:'红鹞把商队的令旗留给了你。旗角上缝着一行小字：「路还长。」',fx:()=>{S.rep.caravan+=3;return ' 红鹞商队声望 +3。';}},
 he:{t:'阿禾的药铺还开着，伙计说，掌柜生前每天都会擦一遍那块招牌。',fx:()=>gMat('ru',2)},
 man:{t:'小满的刀被人送了回来，刀柄上缠着一根褪色的红绳。',fx:()=>gItemNamed('w',3,'小满的刀',maxZone())}
};

/* ---------- 闭关 ---------- */
const RETREATS=[{id:'week',n:'七天',days:7},{id:'month',n:'一个月',days:30},{id:'quarter',n:'三个月',days:90},{id:'half',n:'半年',days:180},{id:'1',n:'一年',days:365},{id:'5',n:'五年',days:1825}];
function retreatCost(o){return Math.max(1,Math.ceil(zsAt(maxZone(),2)*o.days/7));}
function closedHTML(){return `<h2 class="sec">歇息与闭关 <small>${dateName()} · 已历 ${daysAll()} 天</small></h2>
 <p class="note">日子只在你做事时往前走。歇息不花灵石，只让伤慢慢好；闭关要备灵石，能长修为。闭关日久，故人也会老去。</p>
 <div class="closed">${[1,3,7].map(n=>`<button class="btn sm ghost" data-act="rest" data-arg="${n}">歇 ${n} 天</button>`).join('')}</div>
 <div class="closed">${RETREATS.filter(o=>o.days/365<myLife()-S.age).map(o=>`<button class="btn sm" data-act="closed" data-arg="${o.id}">闭关${o.n} · ${fmt(retreatCost(o))}灵石</button>`).join('')}</div>${S.lifeP>0?'<button class="btn sm" data-act="eatLife">服寿元丹 · 延寿30年</button>':''}`;}
function closedGo(id){const o=RETREATS.find(x=>x.id===String(id));if(!o||BT)return;
if(o.days/365>=myLife()-S.age){toast('剩余寿元不足','bad');return;}
if(S.qi>=needQ()){toast('修为已满，先行突破再闭关。');return;}
const cost=retreatCost(o);if(S.stones<cost){toast('灵石不足','bad');return;}
modal(`<h3>闭关${o.n}</h3><p>此次闭关需备 ${fmt(cost)} 灵石。出关时是${(()=>{const y=S.year+Math.floor(((S.doy||0)+o.days)/365);return '灵潮'+cnNum(y)+'年';})()}。</p>`,[{t:'开始闭关',cls:'gold',fn:()=>retreatApply(o.id)},{t:'暂不闭关',cls:'ghost'}]);}
function retreatApply(id){const o=RETREATS.find(x=>x.id===String(id));if(!o||BT||o.days/365>=myLife()-S.age||S.qi>=needQ())return;
const cost=retreatCost(o);if(S.stones<cost)return;S.stones-=cost;
const q0=S.qi;addQi(Math.min(needQ()-S.qi,qiRetreat(o.days)),true);
const age0=S.age,L=advanceDays(o.days,'closed');if(S.path==='yin'&&S.age>age0)S.age=age0+Math.ceil((S.age-age0)/2);
S.closedY=(S.closedY||0)+o.days/365;S.dao.yin+=o.days>=1825?1:0;ageCheck();save();render();
modal(`<h3>出关 · ${dateName()}</h3><p>闭关${o.n}。修为 +${fmt(S.qi-q0)} · 消耗 ${fmt(cost)} 灵石。</p><p>静室门开，你收敛气息，重返江湖。</p>${L.slice(0,6).map(t=>'<p>'+esc(sub(t))+'</p>').join('')}`,[{t:'出关',cls:'gold'}]);}
function xinmoFight(){const st=stats();modal('<h3>心魔</h3><p>闭关太久了。黑暗里，有一个人长着你的脸，坐在你对面。</p><p>“这些年，你真的是在修行吗？”</p>',[{t:'斩心魔',cls:'red',fn:()=>{const e=mkCustom(Math.max(0,maxZone()),{look:S.gender==='f'?'宁玄':'无名剑客',name:'心魔',m:1.4,boss:true});e.atk=st.atk*.9;e.hp=st.hp*1.6;e.max=e.hp;e.def=st.def;e.tint=1;e.noLoot=1;
  startBattle([e],{noFlee:true,bg:'town',onWin:()=>{S.flags.xinmoWin=(S.flags.xinmoWin||0)+1;addQi(req(S.stage)*.5,true);toast('心魔已斩，道心更坚','big');save();},onLose:()=>{S.qi=Math.floor(S.qi*.5);injSet(8);toast('心魔反噬：修为散去一半，重伤，要养八天','bad');save();}});}}]);}

/* ---------- 弟子 ---------- */
const DIS_TRAIT=['勤勉','聪慧','孤僻','野心','温厚','顽劣'];
const disMax=()=>Math.min(6,1+realmIdx()+(S.path==='zong'?2:0)+(S.clan&&S.clan.zong?1:0));
const legacyBonus=()=>Math.min(.25,(S.legacy||[]).length*.05);
function disAdd(o){const d=Object.assign({id:S.uid++,n:'无名',apt:3,root:pick(Object.keys(ROOTS)),st:0,age:12,alive:true,loy:60,trait:pick(DIS_TRAIT),art:[],note:'',ch:'p_gen'+(1+Math.floor(Math.random()*6))},o);
 (S.legacy||[]).forEach(l=>{if(l.art&&!d.art.includes(l.art))d.art.push(l.art);});S.dis.push(d);return d;}
function disCands(){if(S.disC&&S.disC.day===dayKey())return S.disC.L;const L=[];for(let i=0;i<3;i++){const nm=pick(CL_SUR.split(''))+pick(CL_GIV)+(Math.random()<.5?pick(CL_GIV):'');const apt=1+Math.floor(Math.random()*Math.random()*5.2);
  L.push({n:nm,apt:Math.min(5,apt),root:pick(Object.keys(ROOTS)),age:8+Math.floor(Math.random()*9),trait:pick(DIS_TRAIT)});}
 (S.kids||[]).forEach(k=>L.unshift(k));S.disC={day:dayKey(),L};return L;}
function disRecruit(i){if(S.dis.filter(d=>d.alive&&!d.gone).length>=disMax()){toast('收不下了：境界越高，能教的弟子越多','bad');return;}const c=disCands()[i];if(!c)return;
 const d=disAdd(c);S.disC.L.splice(i,1);S.kids=(S.kids||[]).filter(k=>k.n!==c.n);S.dao.zong+=1;news(d.n+'拜入你的门下。');sfx('bell');toast('收 '+d.n+' 为徒','big');save();render();}
function disYear(){const zb=S.path==='zong'?1.3:1,db=S.clan?1+S.clan.bld.dan*.05:1;
 for(const d of S.dis){if(!d.alive||d.gone)continue;d.age++;const r=STAGES[Math.min(d.st,LAST)].r,nx=Math.min(d.st+1,LAST),major=STAGES[nx].r>r;
  if(d.age>=lifeOf(d.st)+(d.lifeB||0)){d.alive=false;d.dy=S.year;disDied(d,'寿元耗尽');continue;}
  if(!major){if(Math.random()<(.2+d.apt*.09)*zb*db/(1+r*.5))d.st++;continue;}
  if(Math.random()<.35){const ch=Math.min(.9,.22+d.apt*.08+legacyBonus()+(d.dan?.25:0)-r*.03);d.dan=0;
   if(Math.random()<ch){d.st++;d.loy=Math.min(100,d.loy+3);news('弟子'+d.n+'突破至'+REALMS[STAGES[d.st].r]+'！',1);}
   else if(Math.random()<.22+r*.03){d.alive=false;d.dy=S.year;disDied(d,'冲击'+REALMS[STAGES[nx].r]+'失败');}
   else news('弟子'+d.n+'冲击'+REALMS[STAGES[nx].r]+'失败，伤了根基。');}
  if(d.trait==='野心'&&d.loy<35&&r>=2&&Math.random()<.12){d.gone=1;const p=mkPerson({n:d.n,st:d.st,age:d.age,tal:.4+d.apt*.1,att:-55,goal:'证明自己比师父强',ch:d.ch});news('弟子'+d.n+'叛出师门。',1);S.fateQ.push({k:'betray',pid:p.id});}}}
function disDied(d,why){const art=d.art.length?d.art[d.art.length-1]:null;S.legacy=S.legacy||[];S.legacy.push({n:d.n,st:d.st,art,why,y:S.year});news('弟子'+d.n+why+'，陨落了。他留下的手札，会传给后来的人。',1);S.fateQ.push({k:'disdeath',pid:null,dn:d.n,why});}
function disTeach(id,how){const d=S.dis.find(x=>x.id===+id);if(!d||!d.alive)return;
 if(how==='qi'){const c=req(S.stage)*.15;if(S.qi<c){toast('灵气不够（需 '+fmt(c)+'）','bad');return;}S.qi-=c;if(Math.random()<.7){d.st=Math.min(LAST,d.st+1);d.loy+=4;toast('传功：'+d.n+'进境了');}else{d.loy+=2;toast('传功：'+d.n+'没能消化');}
  if(STAGES[Math.min(d.st,LAST)].r>STAGES[Math.max(0,d.st-1)].r)news('弟子'+d.n+'在你的帮助下突破。');}
 if(how==='dan'){if(!(S.zjDan>0)){toast('没有筑基丹了：在丹房炼制','bad');return;}S.zjDan--;d.dan=1;d.loy+=6;toast('赐丹：'+d.n+'下次冲关 +25%');}
 if(how==='art'){const L=S.learned.filter(b=>BOOKS[b]&&!d.art.includes(b));if(!L.length){toast('你会的，他都学了','bad');return;}const b=pick(L);d.art.push(b);d.loy+=5;toast('传法：'+d.n+'学会了'+BOOKS[b].n);}
 if(how==='heir'){S.heir=d.id;toast(d.n+'被立为继承人','big');news('你立'+d.n+'为继承人。',1);}
 save();render();}
function disHTML(){if(!S.clan)return '';if(realmIdx()<1)return `<h2 class="sec">弟子 <small>筑基之后可以收徒</small></h2>`;
 const live=S.dis.filter(d=>d.alive&&!d.gone),dead=S.dis.filter(d=>!d.alive);
 return `<h2 class="sec">弟子 <small>${live.length}/${disMax()} · 先人遗泽 ${(S.legacy||[]).length} 卷（弟子冲关 +${Math.round(legacyBonus()*100)}%）</small></h2>
 ${live.map(d=>`<div class="row2 dis"><img class="mini" src="${clSprite(d.ch)}" alt=""><div class="in"><div class="iname">${esc(d.n)}${S.heir===d.id?'<span class="lv gold">继承人</span>':''}<span class="lv">${realmOf(d.st)} · ${d.age} 岁</span></div><div class="istat">资质 ${'★'.repeat(d.apt)}${'☆'.repeat(5-d.apt)} · ${EL[d.root].n}灵根 · ${d.trait} · 忠心 ${Math.min(100,d.loy)}${d.dan?' · 已服筑基丹':''}${d.art.length?'<br>所学：'+d.art.map(b=>BOOKS[b]?BOOKS[b].n:b).join(' '):''}${d.note?'<br><i>'+esc(d.note)+'</i>':''}</div></div>
  <div class="ibtn col"><button class="btn sm ghost" data-act="teach" data-arg="${d.id}|qi">传功</button><button class="btn sm ghost" data-act="teach" data-arg="${d.id}|dan">赐丹</button><button class="btn sm ghost" data-act="teach" data-arg="${d.id}|art">传法</button>${S.heir!==d.id?`<button class="btn sm ghost" data-act="teach" data-arg="${d.id}|heir">立嗣</button>`:''}</div></div>`).join('')||'<p class="empty">还没有弟子。</p>'}
 <h3 class="sub">今日来拜师的人</h3>${disCands().map((c,i)=>`<div class="row2"><div class="in"><div class="iname">${esc(c.n)}<span class="lv">${c.age} 岁</span></div><div class="istat">资质 ${'★'.repeat(c.apt)}${'☆'.repeat(5-c.apt)} · ${EL[c.root].n}灵根 · ${c.trait}${c.note?'<br><i>'+esc(c.note)+'</i>':''}</div></div><button class="btn sm" data-act="disTake" data-arg="${i}">收徒</button></div>`).join('')}
 ${dead.length?`<p class="note">故去的弟子：${dead.map(d=>esc(d.n)+'（'+realmOf(d.st)+'，'+yearName(d.dy)+'）').join('、')}</p>`:''}
 <p class="note">弟子会随岁月自己修炼；闭关时也一样。冲大境界有风险，会陨落。陨落的弟子留下手札，后来的弟子冲关更稳，还会自带前人传下的功法。野心大又不忠的弟子，可能叛出师门。</p>`;}

/* ---------- 道途 ---------- */
const PATHS={zheng:{n:'正道',d:'斩妖除魔。对魔修伤害 +30%，防御 +10%，悬赏奖励 ×1.5',end:'zheng'},mo:{n:'魔道',d:'以杀证道。吸血 +10%，连携伤害 +10%，击败修士吞噬其修为',end:'mo'},
 yin:{n:'隐居',d:'不问世事。闭关所得 ×1.5，岁月流逝减半，闪避 +8%，仇家常寻你不着',end:'yin'},zong:{n:'宗门',d:'开宗立派。弟子修炼 ×1.3，可多收两名弟子，攻击 +5%',end:'zong'}};
function pathAsk(){if(S.path||realmIdx()<3||BT||!OV_FREE())return;const D=S.dao,top=Object.keys(PATHS).sort((a,b)=>(D[b]||0)-(D[a]||0))[0];
 modal(`<h3>问道</h3><p>元婴初成的那一夜，你听见元婴在问你：「你修的，是什么道？」</p><p class="note">不同道途各有修行所得。道心一经立定，本世不可更改。</p>
  <div class="paths">${Object.keys(PATHS).map(k=>`<div class="pa"><b>${PATHS[k].n}${k===top?' <em>心之所向</em>':''}</b><small>${PATHS[k].d}</small><span>${ENDS[PATHS[k].end].cond}</span></div>`).join('')}</div>`,
  Object.keys(PATHS).map(k=>({t:PATHS[k].n,cls:k===top?'gold':'',fn:()=>{S.path=k;news(S.name+'择'+PATHS[k].n+'而行。',1);sfx('bell');toast('道途：'+PATHS[k].n,'big');save();render();}})));}

/* ---------- 结局 ---------- */
const ENDS={
 zheng:{n:'正道魁首',cond:'正道：击败幽冥殿与天穹会之主，登江湖榜首',ok:()=>S.path==='zheng'&&sectBeat('youming')&&sectBeat('tianqiong')&&jhRank()===1},
 mo:{n:'魔尊临世',cond:'魔道：击败赤霄、玄水、百草、铁骨四宗之主，登江湖榜首',ok:()=>S.path==='mo'&&['chixiao','xuanshui','baicao','tiegu'].every(sectBeat)&&jhRank()===1},
 yin:{n:'逍遥散仙',cond:'隐居：修至化神，累计闭关两百年',ok:()=>S.path==='yin'&&realmIdx()>=4&&(S.closedY||0)>=200},
 zong:{n:'万古仙宗',cond:'宗门：开宗立派，三名弟子修至元婴，并立下继承人',ok:()=>S.path==='zong'&&S.clan&&S.clan.zong&&S.dis.filter(d=>d.alive&&!d.gone&&STAGES[Math.min(d.st,LAST)].r>=3).length>=3&&S.dis.some(d=>d.id===S.heir&&d.alive&&!d.gone)},
 dan:{n:'丹道至尊',cond:'任一道途：丹道修至「丹圣」',ok:()=>danRank()>=4},
 fu:{n:'仙府之主',cond:'任一道途：寻回上古仙府，承其传承',ok:()=>F('xianfuDone')}
};
function endsHTML(){const ks=Object.keys(ENDS);return `<h2 class="sec">道果 <small>${S.path?'道途：'+PATHS[S.path].n:'元婴之后择道'} · 已证 ${(S.endings||[]).length}/${ks.length}</small></h2>
 ${ks.map(k=>{const E=ENDS[k],got=(S.endings||[]).includes(k),ok=!got&&safe(E.ok);return `<div class="row2 ${got?'r-chuan':''}"><div class="in"><div class="iname">${got?'✦ ':''}${E.n}</div><div class="istat">${E.cond}</div></div>${ok?`<button class="btn sm gold" data-act="ending" data-arg="${k}">证道</button>`:got?'<span class="curtag">已证</span>':''}</div>`;}).join('')}
 ${F('xfOpen')&&!F('xianfuDone')?`<div class="row2"><div class="in"><div class="iname">太一仙府</div><div class="istat">仙府的门还开着。上次你走到了第 ${S.flags.xfStage||1} 重。</div></div><button class="btn sm gold" data-act="xf">重返仙府</button></div>`:''}<p class="note">证得道果后，可以继续修行，也可以轮回再来。不同道途、不同的选择，会留下不同的因缘。</p>`;}
function playEnding(k){const E=ENDS[k];if(!safe(E.ok))return;S.endings=S.endings||[];if(!S.endings.includes(k))S.endings.push(k);S.rebirthBonus=(S.rebirthBonus||0)+1;
 const fr=S.ppl.filter(p=>p.fr&&p.known),foes=S.ppl.filter(p=>p.att<=-40),L=[];
 const head={zheng:['那一年，江湖上再没有人敢在夜里收尸。','幽冥殿的灯熄了，天穹会的旗倒了。人们说起'+S.name+'，会先停一停，再压低声音。'],
  mo:['正道诸宗的山门，一座接一座地关上了。','你站在赤霄宗的废墟上，觉得风很安静。江湖榜上只剩一个名字。'],
  yin:['你在山里住了很久。久到山下的人忘了你的名字。','后来有砍柴的人说，山顶的松树下坐着一个人，坐了好几百年，身上落满了松针。'],
  zong:[(S.clan?S.clan.name:'你的宗门')+'的山门立了起来。','弟子们在演武场上练剑，喊声能传到山下。你站在高处看着，想起很多年前，地铁站里那盏昏黄的灯。'],
  dan:['你炼出第一炉九转金丹的那天，满山的草木都开了花。','从此江湖上的人说起丹道，只说一个名字。'],
  fu:['仙府的门在你身后合上。','三百年前的那个人，把他的一切都留给了你。你终于明白，墨老和他的师兄，当年想的是什么。']}[k];
 L.push(...head);
 fr.forEach(p=>L.push(p.alive?(p.n+'：'+(p.st>=0?realmOf(p.st)+'，':'')+'还活着，'+(p.att>=40?'常常提起你。':'过着自己的日子。')):(p.n+'：'+yearName(p.dy)+'故去。')));
 if(S.dis.length)L.push('弟子：'+S.dis.map(d=>d.n+(d.alive&&!d.gone?'（'+realmOf(d.st)+'）':d.gone?'（叛出）':'（陨落）')).join('、')+'。');
 if(S.heir){const h=S.dis.find(d=>d.id===S.heir);if(h)L.push(h.alive?h.n+'接过了你的衣钵。':h.n+'没能等到接过衣钵的那一天。');}
 foes.forEach(p=>L.push(p.alive?'宿敌'+p.n+'仍在'+(p.sect?SECTS[p.sect].n:'江湖')+'，'+realmOf(p.st)+'。你们之间，还没有结束。':'宿敌'+p.n+'已化作尘土。'));
 if(S.legacy&&S.legacy.length)L.push('先人遗泽 '+S.legacy.length+' 卷，被后人供在祠堂里。');
 sfx('rise');save();
 const ov=$('#ov');ov.hidden=false;ov.className='vn ending';ov.innerHTML=`<canvas class="vbg" id="vbg"></canvas><div class="inner endin"><h2>道果 · ${E.n}</h2>${L.map(l=>`<p>${esc(sub(l))}</p>`).join('')}<p class="note">已证道果 ${S.endings.length}/${Object.keys(ENDS).length}。轮回之时，每一个道果都会多给你一重仙缘。</p><div class="row"><button class="btn gold" id="endOk">继续修行</button></div></div>`;
 requestAnimationFrame(()=>paintTo($('#vbg'),k==='mo'?'abyss':k==='yin'?'forest':k==='fu'?'xianfu':'core'));$('#endOk').onclick=()=>{ov.hidden=true;ov.innerHTML='';ov.className='';render();};}

/* ---------- 兵解 / 轮回保留 ---------- */
function reincarnate(bonus){const keep={name:S.name,gender:S.gender,seen:S.seen,flags:S.flags,karma:S.karma,abyss:S.abyss,rebirth:S.rebirth+(bonus?1:0)+(bonus?(S.rebirthBonus||0):0),uid:S.uid,started:true,slain:S.slain,taps:S.taps,dt:{lv:S.dt.lv,slots:[]},visited:[0],pop:S.pop,rep:S.rep,q:S.q,seenEv:S.seenEv,runs:S.runs,lastDaily:S.lastDaily,clan:S.clan,learned:S.learned,books:S.books,gems:S.gems,mgW:S.mgW,aff:S.aff,partner:S.partner,partners:S.partners,sworn:S.sworn,
  year:S.year+(bonus?0:20),ppl:S.ppl,news:S.news,seeds:S.seeds,dis:S.dis,legacy:S.legacy,heir:S.heir,endings:S.endings,dan:S.dan,mats:S.mats,forms:S.forms,form:S.form,sects:S.sects,fame:S.fame,root:S.root,root2:S.root2,pity:S.pity,xf:S.xf};
 S=Object.assign(fresh(),keep);S.rebirthBonus=0;S.flags.dead_self=(S.flags.dead_self||0)+(bonus?0:1);WD.M=null;TAB='world';news(bonus?S.name+'飞升轮回，重入凡尘。':S.name+'兵解转世。',1);toast(bonus?'第 '+(S.rebirth+1)+' 世，重入凡尘。':'兵解转世，前尘如梦。','big');S.bossDown=[];render();save();}

/* ---------- 开宗立派 ---------- */
function zongHTML(){const c=S.clan;if(!c)return '';if(c.zong)return `<div class="banner zong"><div class="t">${esc(c.name)} · 宗门<small>开宗于${yearName(c.zongY)}。弟子上限 +1，江湖榜上留名。${S.heir?'继承人：'+esc((S.dis.find(d=>d.id===S.heir)||{n:'—'}).n):'尚未立继承人'}</small></div></div>`;
 if(typeof CANON_CAP!=='undefined')return '';const ok=realmIdx()>=2&&c.fame>=150;return `<div class="row2"><div class="in"><div class="iname">开宗立派</div><div class="istat">把行社立为宗门：需金丹境界、行社声望 150（现 ${c.fame}）。宗门能多收一名弟子，也会被其他宗门当成对手。</div></div><button class="btn sm ${ok?'gold':''}" data-act="zong" ${ok?'':'disabled'}>立宗</button></div>`;}
function zongFound(){const c=S.clan;if(!c||c.zong||realmIdx()<2||c.fame<150)return;const base=c.name.replace(/家$/,'');
 modal(`<h3>开宗立派</h3><p>社员们在祠堂前站成两排。新的牌匾已经刻好了，只差你给它起个名字。</p>`,[base+'宗',base+'门',base+'派'].map(n=>({t:n,cls:'gold',fn:()=>{c.name=n;c.zong=1;c.zongY=S.year;c.fame+=50;S.dao.zong+=3;news(S.name+'开宗立派，立「'+n+'」。',1);sfx('bell');toast('「'+n+'」立宗！','big');save();render();}})).concat([{t:'再等等',cls:'ghost'}]));}
