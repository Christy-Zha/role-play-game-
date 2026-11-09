/* ================= 命途图 · 二周目 · 剧情战之印 · 来信 · 选择回馈 · 人物志与地图志 · 陪玩小游戏 =================
   放在 game.js 之前；要动 VIEWS/ACT/S 的事情放进 LATE，由 game.js 在 start() 之前统一执行。
   跨存档的记录（走过哪些路、读过哪些章、见过哪些画面）存在 localStorage 的 lingchao_meta，不进存档。 */
const LATE=[];
const META_KEY='lingchao_meta',NG_KEY='lingchao_ng';
function metaGet(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch(e){return {};}}
function metaPut(m){try{localStorage.setItem(META_KEY,JSON.stringify(m));}catch(e){}}

/* ---------- 命途图：岔路口 ---------- */
const FATE_NODES=[
 {v:1,k:'pill',n:'筑基丹给谁',get:()=>typeof v1Pill==='function'?v1Pill():'',o:{self:'自己吃了',zhou:'给了周烈',sell:'换了粮'}},
 {v:1,k:'ahe',n:'阿禾的蓝线',get:()=>S.seen.includes('ahe')?(F('heScar')?'snake':'qi'):'',o:{qi:'散修为，渡灵气',snake:'下隐道猎蛇'}},
 {v:4,k:'v4Pump',n:'信标那夜的水泵',o:{crank:'不停泵，转手摇电机',stop:'停两天泵'}},
 {v:5,k:'v5Sample',n:'河边放水',o:{1:'停下，取第二碗水样',0:'清了口子接着放'}},
 {v:7,k:'v7Drill',n:'演练',o:{1:'再练到两息',0:'三息够了'}},
 {v:8,k:'v8Promise',n:'送人下山',o:{1:'连夜走',0:'先排舱位和时辰'}},
 {v:9,k:'v9Risk',n:'五座药炉',o:{novel:'接进同一循环',early:'先查回收纹'}},
 {v:10,k:'v10Zhao',n:'伏灯站的灯号',o:{0:'识破了',1:'没看出'}},
 {v:11,k:'v11Fang',n:'丹方的去处',o:{san:'散炉',gong:'公院'}},
 {v:12,k:'v12An',n:'旧案何时见光',o:{zhong:'鸣钟',chuan:'留船'}},
 {v:13,k:'v13Qu',n:'最后去哪里',o:{an:'共岸',hai:'渡海',xiang:'归乡'}},
 {v:13,k:'v13End',n:'终章',o:{deng:'万家灯火',shou:'守潮人',feng:'长风万里',qing:'归青石',bai:'白塔长明'}}
];
function fateVal(n){let v;try{v=n.get?n.get():S.flags[n.k];}catch(e){v='';}return v==null||v===''?'':String(v);}
function volReached(){let m=0;S.seen.forEach(id=>{const r=/^v(\d+)_/.exec(id);if(r)m=Math.max(m,+r[1]);});return m;}
function metaSync(){if(!S||!S.started)return;const m=metaGet();m.br=m.br||{};
 FATE_NODES.forEach(n=>{const v=fateVal(n);if(v!==''&&n.o[v]){m.br[n.k]=m.br[n.k]||{};m.br[n.k][v]=1;}});
 const rd=new Set(m.read||[]);S.seen.forEach(id=>rd.add(id));m.read=[...rd];
 const cg=new Set(m.cg||[]);(S.cgSeen||[]).forEach(k=>cg.add(k));m.cg=[...cg];
 m.vmax=Math.max(m.vmax||0,volReached());metaPut(m);}
function fateHTML(){const m=metaGet(),br=m.br||{},vr=Math.max(volReached(),m.vmax||0);
 const rows=FATE_NODES.map(n=>{const cur=fateVal(n),known=br[n.k]||{};
  if(n.v>vr&&!Object.keys(known).length)return `<div class="fate-n dim"><span class="fv">第${cnNum(n.v)}卷</span><b>？？？</b></div>`;
  const chips=Object.keys(n.o).map(k=>k===cur?`<i class="fc on">${esc(n.o[k])}</i>`:known[k]?`<i class="fc">${esc(n.o[k])}</i>`:`<i class="fc q">？？？</i>`).join('');
  return `<div class="fate-n"><span class="fv">第${cnNum(n.v)}卷</span><b>${esc(n.n)}</b><div class="fcs">${chips}</div></div>`;}).join('');
 const ends=Object.keys((br.v13End)||{}).length;
 return `<p class="note">亮着的是这一世的选择；别的存档、别的一世走过的路也会记在这里。终章已见 ${ends}/5。</p><div class="fate">${rows}</div>${sealHTML()}${ngHTML()}`;}

/* ---------- 二周目：带着记忆重来 ---------- */
const ngMul=()=>1+.15*Math.min(3,S.ng||0);
function ngHTML(){if(!F('v13done'))return '';return `<div class="row2"><div class="in"><div class="iname">带着记忆重来${S.ng?'<span class="lv">这是第 '+(S.ng+1)+' 世</span>':''}</div><div class="istat">在另一个空存档里重新开始：命途图、见过的画面都记得，读过的篇章可以快进，修为来得快一些。这一份存档原样留着。</div></div><button class="btn sm gold" data-act="ngStart">重来</button></div>`;}
function ngStart(){let n=0;for(let i=1;i<=SLOTS;i++){if(i!==SLOT&&!slotInfo(i)){n=i;break;}}
 if(!n){toast('三个存档位都满了。先在「存档」里删掉一个，再来。','bad');return;}
 metaSync();modal(`<h3>带着记忆重来</h3><p>在存档 ${n} 开始新的一世。现在这一份存档原样留着，随时可以切回来。</p><p class="note">记得的：命途图、见过的画面；读过的篇章可以快进；这一世修为来得快一些。</p>`,
  [{t:'开始',cls:'gold',fn:()=>{try{localStorage.setItem(NG_KEY,String((S.ng||0)+1));}catch(e){}switchSlot(n);}},{t:'再想想'}]);}
{const ps0=playStory;playStory=function(id){
  if(id==='prologue'&&!S.seen.includes('prologue')){let ng=0;try{ng=+localStorage.getItem(NG_KEY)||0;localStorage.removeItem(NG_KEY);}catch(e){}
   if(ng>0){S.ng=ng;const m=metaGet();S.cgSeen=[...new Set([...(S.cgSeen||[]),...(m.cg||[])])];setTimeout(()=>{try{cgShow('ng');}catch(err){}},800);}}
  const r=ps0.apply(this,arguments);
  try{if(SC&&!SC.read&&(metaGet().read||[]).includes(id))SC.read=true;}catch(e){}
  return r;};}
{const aq0=addQi;addQi=function(x,quiet){if(S&&S.ng&&x>0)x*=ngMul();return aq0.call(this,x,quiet);};}

/* ---------- 剧情战：可选目标、得印、输了可再来 ---------- */
const GOALS={
 '寄焰藤':{t:'一次火都不用，打赢',ok:m=>!m.fire},'护炉架':{t:'五回合内打赢',ok:m=>m.round<=5},
 '负碑鼋':{t:'撑过去，没人倒下',ok:m=>m.alive},'晶背蛾':{t:'一道法术和符都不用，打赢',ok:m=>!m.skill},
 '井下晶背蛾':{t:'一道法术和符都不用，打赢',ok:m=>!m.skill},'晶翼':{t:'四回合内打赢',ok:m=>m.round<=4},
 '盲鳗':{t:'一次火都不用，打赢',ok:m=>!m.fire},'盐壳螯':{t:'一次火都不用，打赢',ok:m=>!m.fire},
 '岩鬃獾':{t:'没人倒下',ok:m=>m.alive},'镜中的衡渡':{t:'六回合内打赢',ok:m=>m.round<=6},
 '归相钉前':{t:'没人倒下',ok:m=>m.alive},'伏灯站':{t:'四回合内打赢',ok:m=>m.round<=4},
 '折鳞舟':{t:'没人倒下',ok:m=>m.alive},'息衡外廊':{t:'一次火都不用，打赢',ok:m=>!m.fire},
 '主槽':{t:'没人倒下',ok:m=>m.alive}
};
const GOAL_DEF={t:'六回合内打赢',ok:m=>m.round<=6};
let RW_LAST=null,RW_RETRY=null;
{const rb0=rwBattle;rwBattle=function(o){if(!o||!o.title)return rb0.apply(this,arguments);const g=GOALS[o.title]||GOAL_DEF;
  const o2=Object.assign({},o,{rule:(o.rule?o.rule+' ':'')+'可选目标：'+g.t,
   win:()=>{let extra='';try{const m=RW_LAST||{};S.seals=S.seals||{};if(!S.seals[o.title]&&g.ok(m)){S.seals[o.title]=1;extra='\n\n【得印：'+g.t+'。】';}}catch(e){}RW_RETRY=null;return (o.win?o.win():'')+extra;},
   lose:()=>{RW_RETRY=o;return o.lose?o.lose():'';}});
  return rb0.call(this,o2);};}
{const bw0=btWin;btWin=async function(){try{if(BT)RW_LAST={round:BT.round,alive:BT.party.every(p=>p.alive||p.pet),fire:!!BT.mFire,skill:!!BT.mSkill};}catch(e){}return bw0.apply(this,arguments);};}
{const es0=elStrike;elStrike=function(a,t,el){if(BT&&a&&a.side==='p'&&!a.pet&&el==='huo')BT.mFire=1;return es0.apply(this,arguments);};}
{const bd0=btDo;btDo=async function(a,act){if(BT&&a&&a.key==='hero'&&act&&(act.type==='sk'||act.type==='fu')){BT.mSkill=1;if(act.sk&&act.sk.el==='huo')BT.mFire=1;if(act.type==='fu'&&act.k==='huo')BT.mFire=1;}return bd0.apply(this,arguments);};}
{const rm0=rwMsg;rwMsg=function(h,t,bad){if(bad&&RW_RETRY){const o=RW_RETRY;RW_RETRY=null;save();
  setTimeout(()=>{modal(`<h3>${esc(h)}</h3><p>${esc(t||'').replace(/\n/g,'<br>')}</p><p class="note">故事会照这样往下走。想换一个结果，可以再打一次。</p>`,[{t:'就这样'},{t:'再来一次',cls:'gold',fn:()=>{S.hpF=1;S.mpF=1;rwBattle(o);}}]);checkStory();},350);return;}
  return rm0.apply(this,arguments);};}
const SEAL_SHOP=[
 {k:'gem',n:'换一颗三品宝石',c:2,fn:()=>gGem(null,3)},
 {k:'book',n:'换一本没学过的功法',c:3,fn:()=>{const r=gBook();return r||' 能换的功法都学过了。';}},
 {k:'food',n:'换五份碎灵核（灵宠食料）',c:1,fn:()=>{S.petFood=S.petFood||{};S.petFood.core=(S.petFood.core||0)+5;return ' 碎灵核 ×5。';}}
];
const sealCount=()=>Object.keys(S.seals||{}).length-(S.sealSpent||0);
function sealHTML(){const got=Object.keys(S.seals||{});if(!got.length)return `<p class="note">剧情战里有「可选目标」，打出漂亮的赢法会得一枚印。</p>`;
 return `<h3 class="sub"><img class="ico-s" src="art/ico_seal.webp" alt="">印 <small>得过 ${got.length} 枚 · 可用 ${sealCount()} 枚</small></h3><p class="note">${got.map(esc).join(' · ')}</p><div class="row">${SEAL_SHOP.map(s=>`<button class="btn sm ${sealCount()>=s.c?'gold':'ghost'}" data-act="sealBuy" data-arg="${s.k}" ${sealCount()>=s.c?'':'disabled'}>${s.n}（${s.c} 印）</button>`).join('')}</div>`;}
function sealBuy(k){const s=SEAL_SHOP.find(x=>x.k===k);if(!s||sealCount()<s.c)return;S.sealSpent=(S.sealSpent||0)+s.c;const t=s.fn()||'';toast('用了 '+s.c+' 枚印。'+t,'big');save();render();}

/* ---------- 等待的日子：来信 ---------- */
const LETTERS={
 2:[{id:'l2a',f:'tie',t:'站里一切照旧。周烈夜里替人值班，白天还去搬水，我叫他睡一会儿，他说睡不着。你在坊市别乱花钱，也别太省，饿着肚子的人看不准东西。'},
    {id:'l2b',f:'qin',t:'粥棚又添了两只锅。阿禾学会了数米，每天替我数一遍，数着数着就睡着了。天冷了，衣服要是破了，回来我给你补。'}],
 3:[{id:'l3a',f:'he',t:'我画了一张青石站的图，把你的铺位画在楼梯旁边。秦婶说画得不对，你的铺位在里面。我没改。你回来的时候看看是谁对。'},
    {id:'l3b',f:'zhou',t:'站口的门修好了。有人问你去哪儿了，我说去雾港了。他们问雾港在哪儿，我也不知道。你回来画给我看。'}],
 4:[{id:'l4a',f:'qin',t:'铁叔的腿阴天还疼，他不让我说。你要是路上见到治腿的药，问问价钱就行，别买，买回来他又要骂你。'},
    {id:'l4b',f:'zhou',t:'这几天来了一批新人，有个孩子不会说话，只会跟着人走。我把他交给秦婶了。你在外面，别逞强。'}],
 5:[{id:'l5a',f:'hong',t:'北线的路塌了一段，绕了两天。车上那包烤饼都硬了，我泡水吃完了。下一趟回来给你带新的。别等我吃饭。'},
    {id:'l5b',f:'su',t:'我核了一条新水路，图上画的是错的，差了一个弯。改好的图附在后面。你那边的井水，记得先看颜色再喝。'}],
 6:[{id:'l6a',f:'qin',t:'坡上的新屋漏风，周烈拿旧被子堵上了。你们在山里，夜里冷，袜子穿两双。阿禾说她想跟着去，我没让。'},
    {id:'l6b',f:'zhou',t:'有人说山里有一座古坊。你要是进去了，别乱摸东西。……我知道你会摸。摸之前先想一想。'}],
 7:[{id:'l7a',f:'he',t:'我量了赤梁下面那条沟，水比去年少了一指。图我给周烈了，他说看不懂，又说会挂在窑边。'},
    {id:'l7b',f:'chuyi',t:'信房这几天很安静。我把窗边的灰擦了，看得见远处的山。你们那边要是下雪，替我看一眼。'}],
 8:[{id:'l8a',f:'qin',t:'听说你们要去很高的地方。高处风大，吃饭的时候背过身去。别跟我说你是修士不怕风，修士也会着凉。'},
    {id:'l8b',f:'su',t:'天隙那一带，旧图上只画了半边。另外半边我问了三个人，三个人说的都不一样。你替我量一回，回来我们一起改。'}],
 9:[{id:'l9a',f:'zhou',t:'窑开了两口，烧出来的砖有一半是歪的。叶蘅说歪的也能用，垫在下面。你在回汀要是缺砖，跟我说。'},
    {id:'l9b',f:'chuyi',t:'北山这边的灯，有两盏亮得慢了。陈默说是灵核碎得不匀，他拆开重装了一遍。我在旁边看着，没让他签字。'}],
 10:[{id:'l10a',f:'he',t:'北山多了几间屋，有一间画歪了，是小满画的。屋子没歪，是人画歪了。你回来看看就知道了。'},
     {id:'l10b',f:'tie',t:'站里新来的孩子会削棋子了，削得比我好。你那把钝刀我替你收着，回来自己磨。'}],
 11:[{id:'l11a',f:'he',t:'青杉渡的井，我带着两个学徒量了三回。他们量的比我细。我没告诉他们，怕他们骄傲。'},
     {id:'l11b',f:'zhou',t:'听说你在山谷里养伤。别急着练。我当年急着练，烧坏了一根手指，你看过的。'}],
 12:[{id:'l12a',f:'taoq',t:'谷里的鸡下了一窝蛋，许平章托人捎来的糖也到了。你的右足，阴天记得用热水泡。别拿逃命的法子吃饭。'},
     {id:'l12b',f:'xchun',t:'炉子又漏了一回雨，我们没开炉，等它干了才开。陶医说我这回做对了。你回来的时候，我烧一炉给你看。'}],
 13:[{id:'l13a',f:'heq',t:'盐地开春又试了一回，长出来一小片。我用你磨的那把锄头，没坏。下回你来，田边有饭吃。'},
     {id:'l13b',f:'xiao',t:'我把这几天的事都记下来了。纸不够，背面也写了。等你们回来，我念给你们听。不长。'}]
};
function nextMain(){for(const c of STORY){const r=/^v(\d+)_/.exec(c.id);if(!r||S.seen.includes(c.id))continue;let ok=false;try{ok=c.cond();}catch(e){}return {c,v:+r[1],ok};}return null;}
function letterTick(){if(!S.started)return;const nm=nextMain();if(!nm||nm.ok)return;const last=S.flags.letterD;
 if(last!=null&&daysAll()-last<7)return;if(last==null){S.flags.letterD=daysAll();return;}
 const L=(LETTERS[nm.v]||[]).find(l=>!(S.letters||[]).includes(l.id));if(!L)return;
 S.letters=S.letters||[];S.letters.push(L.id);S.flags.letterD=daysAll();try{if(BOND[L.f])aff(L.f,2);}catch(e){}
 toast('收到一封信：'+(SPK[L.f]||'')+'。在卷宗里看。');}
function letterHTML(){const ids=(S.letters||[]).slice().reverse();const all=Object.values(LETTERS).flat();
 return ids.map(id=>all.find(l=>l.id===id)).filter(Boolean).map(l=>`<div class="letter"><b>${esc(SPK[l.f]||'')}</b><p>${esc(l.t)}</p></div>`).join('')||'<p class="empty">还没有来信。</p>';}

/* ---------- 选择回馈：每三十天 ---------- */
function feedTick(){if(!S.started)return;const last=S.flags.feedD;if(last==null){S.flags.feedD=daysAll();return;}
 let k=Math.floor((daysAll()-last)/30);if(k<=0)return;k=Math.min(k,6);S.flags.feedD=last+30*Math.floor((daysAll()-last)/30);const msg=[];
 for(let i=0;i<k;i++){
  if(S.seen.includes('v11_8')&&F('v11Fang')==='san'){S.qiPills=(S.qiPills||0)+1;S.meds=(S.meds||0)+1;if(!i)msg.push('小椿的炉子送来聚气丹和伤药');}
  if(S.seen.includes('v11_8')&&F('v11Fang')==='gong'){S.meds=(S.meds||0)+3;if(!i)msg.push('北山药院按月发来伤药');}
  if(S.seen.includes('v10_21')&&F('v10Zhao')===0&&S.clan){const g=zsAt(maxZone(),3);S.stones+=g;if(!i)msg.push('赵笙替行社理的账，多出 '+fmt(g)+' 灵石');}}
 if(msg.length)toast(msg.join('；')+'。');}
{const ad0=advanceDays;advanceDays=function(n,why){const r=ad0.apply(this,arguments);try{letterTick();feedTick();}catch(e){console.error(e);}return r;};}

/* ---------- 萧尘的一招 ---------- */
{const ai0=btAI;btAI=function(a){if(a&&a.key==='xiao'&&!a.pet){const fs=BT.foes.filter(f=>f.alive);if(fs.length&&Math.random()<.4){a.el=a.el||'tu';const t=fs.reduce((m,f)=>f.hp>m.hp?f:m,fs[0]);return {type:'csk',n:'无名一刀',fx:'orb',pow:1.7,t};}}
  return ai0.apply(this,arguments);};}

/* ---------- 人物志与地图志 ---------- */
const PEOPLE={
 tie:'青石站的老站长，假腿，修什么都慢，修好的东西都很结实。',qin:'青石站的粥棚是她开的。谁饿着，她都看得出来。',
 he:'青石站长大的孩子，后来拿起了绳尺，图上的线一条比一条准。',zhou:'青石站守门的人，斧头不离手，嘴上不说的事都放在心里。',
 hong:'跑长线的车队头领，左腿怕冷，账记得比谁都清楚。',mo:'住在玉简里的三百年前的丹师，嘴硬，教东西从不藏。',
 xiao:'七〇二号，萧尘。总有人记不住他的名字，他就一遍一遍地写。',su:'测绘的人，图上不能确定的地方宁可空着，也不乱画。',
 cm:'修东西的人，手稳。签过的字后来都认了。',chuyi:'北山信房的人，旧名唐迟。后来开了一间修灯铺，左边那扇窗能开。',
 ning:'天穹会的首领。救过很多人，也有自己的那几页纸要记。',dong:'穿白衣的人，带着粮来，也带着别的东西来。',
 wuh:'猎宝人，在薄灵地底躺过两百多年。养鸦，手上的皮像冻坏的树皮。',xie:'太一旧人的残魂，住在一盏有人看守的灯里。',
 heq:'回汀守田的女人，随身带一根木尺和一包盐。',lhd:'回汀守院的管事，端来的粥里盐放得很少。',
 hengd:'收潮的人，手腕上系着三枚封在白环里的珠子。',mengq:'合收行的人，身量不高，双手干净，指根有茧。',
 wenq:'苏绾的母亲，折星埠的裁缝。柜子里一直留着女儿的旧被子。',aying:'折星工坊里长大的姑娘，讲起护衣来眼睛发亮。',
 sangf:'换风号的船主，图上不知道的地方，等下一处停泊再问。',duh:'换风号的船匠，嘴硬心软，护着船也护着人。',
 xman:'北山的少年，知道盆放在哪儿。',taoq:'灰枫谷的丹医，裤脚上常沾着泥。不写包票。',
 xupz:'筑基大圆满九年的修士，没结成丹，后来给孩子买了新鞋。',yans:'承衡司的署理，金丹后期。签过一张不该签的纸。',
 qir:'息衡埠的抄录人，眼镜两条腿不一样长。弄坏一张，赔整册。',xchun:'青杉渡来的学徒，辨火慢，记字快，后来自己砌了炉。',
 luoy:'邵平的妻子，在白榆台安了家，会补鞋。',liangl:'修理工，腿受过伤，儿子后来见到了。',yutan:'天隙悬台上的姑娘，带着药箱。',
 qiw:'天隙的调度，不催人。',chengw:'跟着阿禾的少年，记数很快，写字很慢。'
};
const PLACES={shelter:['青石站','地铁站改成的避难所，后来搬到了坡上。'],metro:['废弃地铁站','青石站以北的隧道，积水里有东西在动。'],
 overpass:['锈蚀高架','断裂的高架桥悬在半空。'],forest:['旧城妖林','人民公园疯长成的林子。'],port:['沉没港口','雾里有船灯。'],
 lab:['坠星研究所','灵潮当天第一个坠落点。'],pit:['天坑','市中心塌出的深坑。'],core:['灵源核心','空气浓得像水。'],
 starsea:['天外','云层之上，碎陆漂在暗青色里。'],sky:['天隙','云海之上的悬台。'],town:['路上的镇子','一路上经过的人家。'],
 market:['坊市','丹铺、器铺、符箓铺都在这里。'],xianfu:['太一古坊','被山藏了三百年的地方。'],shanmen:['太一山门','山门不认人。'],
 huifeng:['灰枫谷','没有山门的药谷。求结丹者先去洗手。'],xiheng:['息衡埠','只收船路旧簿的旧港。'],boshi:['薄石坡','港外背风的小坡。'],
 guanchao:['观潮石堂','头顶悬着一条不是水的河。'],zhucao:['主槽','刻满供息人名字的长廊。'],xiaowu:['北山小屋','第三张桌挂在门后。'],
 xiaoshe:['坡上校舍','墙上的粉笔字擦过很多遍。'],
 qingshi_po:['坡上的青石','搬到坡上以后的新屋，墙上画着身高线。'],tieliang:['铁梁场','灰蓝色的石质从地底长上来，把铁梁吞进去。'],
 taiyi:['太一古坊','古坊的墙和新修的公路撞在一处。'],lufu:['炉腹','一口被挖空的古炉，井腰一座砖台。'],
 chiliang:['赤梁窑场','窑口有的冒火，有的冷着，灰像雪一样落。'],tianxi:['天隙悬台','封舱挂在索上，云海在脚下。'],
 huiting:['回汀镇','灯主拿竹竿一盏盏敲亮铜皮灯罩。'],yanhu:['盐湖','盐壳薄得像一夜的冰，下面是黑卤。'],
 yancang:['回汀盐仓','堆满盐袋的仓房，高窗外有人站岗。'],fudeng:['伏灯站','云海里的补给泊台，三盏引航灯。'],
 zhexing:['折星埠','一排朝下开的窗。'],gongfang:['折星西工坊','五扇窗，一架旧踏机。'],xinhai:['新岸','会漏潮雾的仓屋，远处有灯塔。'],baita_v3:['白塔','塔上装着调潮尺。']};
let PPL_CACHE=null;
function peopleSeen(){if(PPL_CACHE&&PPL_CACHE.n===S.seen.length)return PPL_CACHE.s;const s=new Set();
 const walk=a=>(a||[]).forEach(l=>{if(Array.isArray(l)){if(l[0]&&l[0]!=='@')s.add(l[0]);}else if(l&&l.c)l.c.forEach(o=>walk(o.r));});
 STORY.forEach(c=>{if(S.seen.includes(c.id))walk(c.lines);});PPL_CACHE={n:S.seen.length,s};return s;}
function peopleHTML(){const s=peopleSeen();if(s.has('zero'))s.add('chuyi');const keys=Object.keys(PEOPLE).filter(k=>s.has(k));
 if(!keys.length)return '<p class="empty">还没有记下谁。</p>';
 const want=typeof xhPids==='function'?xhPids().filter(p=>xhNext(p)):[];
 const top=want.length?`<div class="xh-top"><b>有话想对你说</b>${want.map(p=>`<button class="btn sm gold" data-act="xhPlay" data-arg="${p}">${esc(SPK[p]||p)} ·「${esc(xhNext(p).t)}」</button>`).join('')}</div>`:'';
 return top+`<div class="pplbook">${keys.map(k=>{const por=(typeof PORTRAIT!=='undefined'&&PORTRAIT[k])?PORTRAIT[k]():sealPortrait(k);const deep=BOND[k]&&avOf(k)>=60&&BOND_DEEP[k];
  return `<div class="pp"><div class="pp-por">${por}</div><div><b>${esc(SPK[k]||BOND[k]&&BOND[k].n||k)}</b><p>${esc(PEOPLE[k])}</p>${deep?'<p class="note">'+esc(deep)+'</p>':''}${typeof xhBtn==='function'?xhBtn(k):''}</div></div>`;}).join('')}</div><p class="note">记下 ${keys.length}/${Object.keys(PEOPLE).length} 人。</p>`;}
const BOND_DEEP={hong:'她的账本里，你那一格描过很多遍。',zhou:'他不爱说，可每次你出门，他都在站口。',su:'她在图上给你留过一块空白，说等你回来自己画。',
 xiao:'他的登记簿第一行，写的是你的名字。',mo:'他教你的，比他承认的多。',he:'她第一次拿起绳尺的时候，是你在旁边扶着。',chuyi:'她把手伸过来，让你剪指甲。'};
function placesHTML(){const seenBg={};STORY.forEach(c=>{if(!S.seen.includes(c.id))return;const add=k=>{if(k&&!seenBg[k])seenBg[k]=c.title;};add(c.bg);(c.lines||[]).forEach(l=>{if(l&&!Array.isArray(l)&&l.bg)add(l.bg);});});
 const keys=Object.keys(seenBg);if(!keys.length)return '<p class="empty">还没有去过哪里。</p>';
 return `<div class="placebook">${keys.map(k=>{const P=PLACES[k];const t=seenBg[k];return `<div class="pl"><canvas data-scene="${k}"></canvas><div><b>${esc(P?P[0]:t.split('·').slice(1).join('·')||t)}</b><p>${esc(P?P[1]:'')}</p><p class="note">初见于「${esc(t)}」</p></div></div>`;}).join('')}</div>`;}

/* ---------- 陪玩小游戏 ---------- */
function withCg(k,go){if((S.cgSeen||[]).includes(k)){go();return;}cgShow(k);const wait=()=>{if(document.getElementById('cgOv'))setTimeout(wait,200);else go();};setTimeout(wait,900);}
{const cb0=chatBtn;chatBtn=function(k){const L=cb0.apply(this,arguments);if(!L.length)return L;
 if(k==='mo')L.push({t:'陪墨老下一盘',fn:()=>withCg('mo_go',()=>{const lv=avOf('mo')>=60?3:avOf('mo')>=25?2:1;openMini('gomoku',{lv,title:'和墨老下棋',onDone:w=>{aff('mo',w?3:1);toast(w?pick(['墨老：「这步还行。」','墨老：「……再来一盘。」']):pick(['墨老：「急什么。」','墨老：「看三步，再落子。」']));live();}});})});
 if(k==='hong')L.push({t:'和红鹞押大小',fn:()=>withCg('hong_dice',()=>openMini('sicbo',{lv:1,title:'车上押大小',onDone:w=>{if(w){aff('hong',2);toast('红鹞：「手气不错。今晚的饭你请。」');}else{aff('hong',1);advanceDays(1,'help');toast('输了。你替她卸了一天货。');}live();}}))});
 if(k==='he')L.push({t:'帮阿禾测水',fn:()=>withCg('he_water',()=>openMini('memory',{lv:F('v5Sample')===1?1:2,title:'阿禾的测水',onDone:w=>{aff('he',w?3:1);if(w)S.flags.heMeasure=(S.flags.heMeasure||0)+1;toast(w?'读数对上了。阿禾在图上把那条线描实了。':'读数错了一格。阿禾说：「再量一次。」');live();}}))});
 return L;};}

/* ---------- 卷宗与动作：game.js 定义好以后再接上 ---------- */
LATE.push(()=>{
 Object.assign(ACT,{ngStart:()=>ngStart(),sealBuy:a=>sealBuy(a)});
 const sv0=VIEWS.story;VIEWS.story=()=>{metaSync();const h=sv0();
  const extra=journalFold('fate','命途图',Object.keys(metaGet().br||{}).length+' 处岔路',fateHTML())
   +journalFold('letters','来信',(S.letters||[]).length+' 封',letterHTML())
   +journalFold('people','人物志',[...peopleSeen()].filter(k=>PEOPLE[k]).length+' 人'+(typeof xhPids==='function'&&xhPids().some(p=>xhNext(p))?' · 有人想叙话':''),peopleHTML())
   +journalFold('places','地图志','',placesHTML());
  const i=h.lastIndexOf('</section>');return i>=0?h.slice(0,i)+extra+h.slice(i):h+extra;};
 {const es=endStory;endStory=function(){const r=es.apply(this,arguments);try{metaSync();}catch(e){}return r;};}
});
