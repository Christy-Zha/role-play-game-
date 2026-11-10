/* ================= GAME ================= */
const $=s=>document.querySelector(s);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function fmt(n){n=Math.floor(n);if(n<1e4)return String(n);const t=(v,u)=>v.toFixed(2).replace(/\.?0+$/,'')+u;
  if(n<1e8)return t(n/1e4,'万');if(n<1e12)return t(n/1e8,'亿');if(n<1e16)return t(n/1e12,'万亿');return n.toExponential(2);}
function fmtT(sec){sec=Math.max(0,Math.ceil(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${h}时${m}分`:m?`${m}分${s}秒`:`${s}秒`;}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe=f=>{try{return f();}catch(e){return false;}};

const REALMS=['炼气','筑基','金丹','元婴','化神','炼虚','合体','大乘','渡劫','真仙','玄仙','金仙','太乙','大罗'];
const SUB=['初期','中期','后期','圆满'],NUM=['一','二','三','四','五','六','七','八','九'];
const STAGES=[];for(let i=0;i<9;i++)STAGES.push({r:0,name:'炼气'+NUM[i]+'层'});
for(let r=1;r<8;r++)for(let j=0;j<4;j++)STAGES.push({r,j,name:REALMS[r]+SUB[j]});STAGES.push({r:8,name:'渡劫'});for(let r=9;r<14;r++)for(let j=0;j<4;j++)STAGES.push({r,j,name:REALMS[r]+SUB[j]});
const LAST=STAGES.length-1;
const ZONES=[
 {n:'废弃地铁站',d:'青石站以北的隧道，积水里有东西在动。',mobs:['变异鼠','腐尸蝠','污水蛭'],boss:'鼠王·裂齿'},
 {n:'锈蚀高架',d:'断裂的高架桥悬在半空，钢筋上爬满了活物。',mobs:['铁甲蜈蚣','废铁傀儡','灰鸦群'],boss:'钢骨百足'},
 {n:'旧城妖林',d:'人民公园疯长成了一片原始森林。',mobs:['藤妖','狂化灵狐','噬灵蜂'],boss:'千年槐妖'},
 {n:'沉没港口',d:'海平面涨了十米，雾里有船灯。',mobs:['鬼面蟹','雾鲨','溺魂'],boss:'海眼蛟'},
 {n:'坠星研究所',d:'灵潮当天第一个坠落点，围墙上还挂着警示牌。',mobs:['失控机兵','灵化实验体','电磁幽灵'],boss:'零号'},
 {n:'天坑',d:'市中心塌出的深坑，坑底亮着赤光。',mobs:['尸傀修士','赤焰狼','石魔'],boss:'堕仙残躯'},
 {n:'灵源核心',d:'灵潮的源头。空气浓得像水。',mobs:['灵潮化身','虚空蝠鲼','天魔影'],boss:'灵潮之主'},
 {n:'灵源深渊',d:'灵源之下没有底。每往下一层，守关者更强，报酬更厚。',mobs:[],boss:'深渊守关者'},
 {n:'星海残域',d:'天门之外。碎掉的星辰漂在没有尽头的黑里，有些碎片上还留着别的世界的房子。',mobs:['星砂蠕虫','陨铁傀儡','噬光水母'],boss:'噬星鲸'},
 {n:'天庭遗迹',d:'传说里的天庭，只剩下一片倾倒的白玉台阶，和守着它们的残兵。',mobs:['残甲天兵','金乌残魂','守门石兽'],boss:'断戟天将'},
 {n:'归墟',d:'万水归处，万界归处。牧者在这里，数着它的田。',mobs:['牧者之眼','归墟游魂','虚无行者'],boss:'牧者·千目'}
];
const RAR=[{n:'凡',c:'fan',m:1},{n:'灵',c:'ling',m:1.6},{n:'宝',c:'bao',m:2.6},{n:'仙',c:'xian',m:4.2},{n:'传',c:'chuan',m:6}];
const GN={w:['钢筋剑','锈铁长刀','骨刺匕','鲛牙刺','灵纹短剑','霜骨剑','星陨剑','青冥剑','星砂剑','天兵刃','归墟剑'],a:['帆布斗篷','铁片甲','藤皮衣','鲛绡衣','合金道袍','玄石甲','灵潮羽衣','渊纹法袍','星纱衣','天甲','虚无袍'],j:['铜钱串','兽牙坠','槐木牌','蛟珠','芯片玉','赤晶符','源石佩','深渊之眼','星屑坠','天庭玉佩','归墟眼'],
 r:['铁指环','骨戒','藤戒','珊瑚戒','合金戒','黑曜戒','灵源戒','渊戒','星环','天戒','归一戒'],f:['铜镜','兽骨铃','木鱼','海螺','灵能核','火精石','灵潮印','渊鼎','星盘','天庭印','千目珠']};
const SLOTN={w:'兵器',a:'护甲',j:'佩饰',r:'戒指',f:'法宝'};
const UPS=[
 {k:'tuna',n:'吐纳术',d:'每重加快药力炼化，随境界放大',base:10,g:1.45},
 {k:'yinqi',n:'引气诀',d:'每重点击炼化 +80%',base:8,g:1.5},
 {k:'yujian',n:'御剑术',d:'每重攻击 +12%',base:15,g:1.5},
 {k:'jingang',n:'金刚体',d:'每重生命、防御 +12%',base:15,g:1.5},
 {k:'juling',n:'聚灵阵',d:'每重闭关上限 +1 小时，闭关效率 +4%',base:80,g:2,max:10},
 {k:'lianxi',n:'敛息诀',d:'每重温养灵光外泄 -12%',base:40,g:1.8,max:6,need:()=>F('dongtian')}
];

/* ---------- 存档 ---------- */
const SLOTS=3,SLOT_KEY='lingchao_slot';const slotKey=n=>n===1?'lingchao_save_v1':'lingchao_save_v1_s'+n;
let SLOT=(()=>{try{const n=+localStorage.getItem(SLOT_KEY);return n>=1&&n<=SLOTS?n:1;}catch(e){return 1;}})();
const SAVE_V=4;
function fresh(){return {v:SAVE_V,pets:[],petOn:-1,petFood:{grain:3},petAuto:false,tame:{},seals:{},sealSpent:0,letters:[],ng:0,name:'',gender:'m',stage:0,qi:0,stones:0,ups:{tuna:0,yinqi:0,yujian:0,jingang:0,juling:0,lianxi:0},pills:0,qiPills:3,yao:0,tox:0,layer:0,bnPass:-1,
  gear:{w:null,a:null,j:null,r:null,f:null},bag:[],bossDown:[],kills:[0,0,0,0,0,0,0,0,0,0,0],abyss:0,karma:0,seen:[],pending:[],flags:{},visited:[0],
  expo:0,special:null,dt:{lv:0,slots:[]},rebirth:0,usePill:false,last:Date.now(),started:false,uid:1,taps:0,slain:0,hunts:0,
  pop:213,rep:{station:0,caravan:0,tq:0},q:{},seenEv:[],evClock:0,lastDaily:'',runs:0,meds:3,mps:1,hpF:1,mpF:1,btAuto:false,loc:'town',gems:{},books:{},learned:[],clan:null,omen:null,omenClock:0,mgW:{},raid:0,aff:{},affDay:{},giftDay:{},partner:null,sworn:[],
  root:null,root2:null,forms:[],form:null,mats:{},dan:{xp:0},fu:{},pity:{},natal:null,xisui:0,injury:0,injD:0,year:3,doy:240,daysAll:0,age:18,ppl:null,news:[],seeds:[],fateQ:[],dis:[],legacy:[],heir:null,path:null,dao:{zheng:0,mo:0,yin:0,zong:0},endings:[],sects:{},fame:0,lifeP:0,lifeB:0,jieDan:0,jzDan:0,zjDan:0,hhDan:0,xf:0,cnt:{},combos:0,closedY:0,kids:[]};}
const OLD_IDS={0:'prologue',1:'ahe',2:'ratking',3:'caravan',4:'locust',5:'port',6:'zero',7:'fallen',8:'finale'};
function hydrate(d){migrateSave(d);const f=fresh(),o=Object.assign(f,d||{});o.ups=Object.assign(fresh().ups,(d&&d.ups)||{});o.gear=Object.assign(fresh().gear,(d&&d.gear)||{});
  o.flags=Object.assign({},(d&&d.flags)||{});o.dt=Object.assign(fresh().dt,(d&&d.dt)||{});if(!Array.isArray(o.dt.slots))o.dt.slots=[];
  o.rep=Object.assign(fresh().rep,(d&&d.rep)||{});o.q=Object.assign({},(d&&d.q)||{});if(!Array.isArray(o.seenEv))o.seenEv=[];
  if(!Array.isArray(o.kills))o.kills=fresh().kills;while(o.kills.length<11)o.kills.push(0);o.gems=Object.assign({},(d&&d.gems)||{});o.books=Object.assign({},(d&&d.books)||{});if(!Array.isArray(o.learned))o.learned=[];o.mgW=Object.assign({},(d&&d.mgW)||{});o.aff=Object.assign({},(d&&d.aff)||{});if(!Array.isArray(o.sworn))o.sworn=[];o.affDay=o.affDay||{};o.giftDay=o.giftDay||{};if(o.clan)o.clan=clanHydrate(o.clan);if(!Array.isArray(o.visited))o.visited=[0];
  o.seen=(o.seen||[]).map(x=>typeof x==='number'?OLD_IDS[x]:x).filter(Boolean);o.pending=(o.pending||[]).map(x=>typeof x==='number'?OLD_IDS[x]:x).filter(Boolean);
  if(o.seen.includes('ratking')&&!o.flags.duel_zhou&&!o.special)o.special='zhou';
  ['mats','dan','fu','pity','dao','sects','cnt'].forEach(k=>o[k]=Object.assign(fresh()[k],(d&&d[k])||{}));['forms','news','seeds','fateQ','dis','legacy','endings','kids'].forEach(k=>{if(!Array.isArray(o[k]))o[k]=[];});
  delete o.run;if(typeof o.hpF!=='number')o.hpF=1;if(typeof o.mpF!=='number')o.mpF=1;
  lifeSync(o);return o;}
/* 存档兼容：SAVE_MIN 之前的测试版存档直接不读；从 SAVE_MIN 起的存档都要能读进来。
   以后改存档结构时：SAVE_V 加一，在 SAVE_MIGRATE 里写一步「从上一版到这一版」的迁移（改名的字段搬过去），缺的字段由 hydrate 用 fresh() 补默认值。 */
const SAVE_MIN=4;
const SAVE_MIGRATE={/* 例：5:d=>{d.newName=d.oldName;delete d.oldName;} */};
function oldSave(d){return !d||!(d.v>=SAVE_MIN);}
function migrateSave(d){if(!d)return d;for(let v=(d.v||SAVE_MIN)+1;v<=SAVE_V;v++){try{SAVE_MIGRATE[v]&&SAVE_MIGRATE[v](d);}catch(e){console.error(e);}}d.v=SAVE_V;return d;}
try{localStorage.removeItem('lingchao_old_backup');}catch(e){}
function load(){try{const t=localStorage.getItem(slotKey(SLOT));if(t){const d=JSON.parse(t);if(!oldSave(d))return hydrate(d);localStorage.removeItem(slotKey(SLOT));}}catch(e){}return fresh();}
function save(){S.last=Date.now();try{localStorage.setItem(slotKey(SLOT),JSON.stringify(S));}catch(e){}}
function slotInfo(n){if(n===SLOT)return S.name?{name:S.name,realm:stName(),last:Date.now(),started:S.started,reb:S.rebirth}:null;
  try{const t=localStorage.getItem(slotKey(n));if(!t)return null;const d=JSON.parse(t);if(!d||!d.name)return null;if(oldSave(d)){localStorage.removeItem(slotKey(n));return null;}return {name:d.name,realm:(STAGES[d.stage]||STAGES[0]).name,last:d.last||0,started:d.started,reb:d.rebirth||0};}catch(e){return null;}}
function ago(t){const s=(Date.now()-t)/1000;return s<90?'刚刚':s<3600?Math.floor(s/60)+' 分钟前':s<86400?Math.floor(s/3600)+' 小时前':Math.floor(s/86400)+' 天前';}
let delArm=0;
function switchSlot(n){if(BT||n===SLOT)return;if(S.name)save();SLOT=n;try{localStorage.setItem(SLOT_KEY,String(n));}catch(e){}
  const ov=$('#ov');ov.hidden=true;ov.innerHTML='';ov.className='';$('#toasts').innerHTML='';SC=null;EVC=null;delArm=0;resetArm=false;importArm=false;
  S=load();WD.M=null;TAB='world';render();dotUpdate();
  if(!S.name||!S.started){if(S.name&&!S.seen.includes('prologue'))playStory('prologue');else intro();}else{toast('已切换到存档 '+n+'：'+S.name,'big');offline();daily();xlNotice();checkStory(true);}}
let S=fresh();

/* ---------- 数值 ---------- */
/* 每个大境界越往上越难攒灵气：人间（元婴到渡劫）不再一路狂飙 */
const REQ_K=[1,1.2,1.5,1.9,2.3,2.7,3.1,3.5,4,4.3,4.6,4.9,5.2,5.5];
const req=s=>Math.floor((s<=37?40*Math.pow(1.36,s):40*Math.pow(1.36,37)*Math.pow(1.25,s-37))*REQ_K[STAGES[Math.min(Math.max(s,0),LAST)].r]);
const rb=()=>1+.25*S.rebirth;
/* ---------- 修炼体系：九层 + 大圆满、三道瓶颈、药力与丹毒 ---------- */
const layered=s=>STAGES[s].j!=null&&STAGES[s].j<3;
const needQ=()=>layered(S.stage)?Math.floor(req(S.stage)*.5):req(S.stage);
function stName(s,l){if(s==null)s=S.stage;const T=STAGES[s];if(!T||T.j==null)return T?T.name:'';if(T.j===3)return REALMS[T.r]+'大圆满';return REALMS[T.r]+NUM[T.j*3+(s===S.stage?(l==null?(S.layer||0):l):(l||0))]+'层';}
const BN_NAME=['身关','生死关','心关'],BN_TIP=['三层之后，五行灵力要自己转起来。去险地里打一场硬仗，让身体学会。','六层之后，要在生死之间走一遭。','九层之后，问的是心。一场最难的历练。'];
function bnAt(s){const T=STAGES[s],N=STAGES[s+1];if(!N||N.r!==T.r)return -1;if(T.r===0)return s===2?0:s===5?1:-1;return T.j!=null&&T.j<3?T.j:-1;}
const yaoRate=()=>Math.max(idleRate()*3,needQ()*.006)*(injOn()?.6:1);
function refine(dt,tap){if(!(S.yao>0))return 0;const g=Math.min(S.yao,tap?tapGain()*4+needQ()*.004:yaoRate()*dt);S.yao-=g;if(S.yao<1e-6)S.yao=0;addQi(g,!tap);return g;}
function toxAdd(n){S.tox=Math.min(100,(S.tox||0)+n);}
function xlNotice(){if(S.flags.xl2)return;S.flags.xl2=1;addQi(0,true);if(!(S.stage>0||S.qi>0))return;
  setTimeout(()=>modal(`<h3>修炼之道变了</h3><p>你的境界都还在，现在显示为 <b>${stName()}</b>。</p><p>从今往后，修为只从<b>历练</b>和<b>丹药</b>来：打妖兽、做委托、走剧情直接涨修为；服聚气丹得<b>药力</b>，在「修炼」页点画面炼化。光坐着不会再涨灵气。</p><p>每个大境界分九层，三、六、九层各有一道瓶颈，要去闯一场历练。丹药吃多了会积丹毒。玉台温养会外泄灵光，满了会引来天穹会的人。</p>`,[{t:'知道了',cls:'gold'}]),1200);save();}
function bnFight(){const ni=nextInfo();if(!ni.bn||S.qi<needQ()||BT)return;if(injOn()){toast('伤还没好，闯不了关','bad');return;}
  const b=bnAt(S.stage),z=Math.min(maxZone(),zOfStage(S.stage+1)),V=F('v1')&&typeof V1_BN!=='undefined'?V1_BN[S.stage]:null;
  const foes=V?V.foes():[mkCustom(z,{name:'瓶颈·'+BN_NAME[b],st:S.stage+1+b,m:1.35+.15*b,boss:true})];foes.forEach(e=>e.noLoot=1);
  const s0=S.stage;startBattle(foes,{noFlee:true,bg:V?V.bg:z,onWin:()=>{S.bnPass=s0;if(V&&V.win)try{V.win();}catch(e){}wuAdd(3+2*b);addQi(0);toast('破了'+BN_NAME[b]+'。境界 '+stName(),'big');checkStory(false);render();save();},
   onLose:()=>{injSet(2);toast(BN_NAME[b]+'没闯过去。养好伤再来。','bad');save();}});}
/* 修炼节奏（第一至第十卷：炼气一层 → 筑基大圆满）
   亲自历练一趟（约三天）≈ 本境界两成半修为；扫荡同价但灵脉会枯；闭关最省事，但同样的日子只有历练的五分之一左右。 */
const QI_BATTLE=.05;
/* 深渊馈赠：只在一趟深渊里有效的临时加成，不进存档 */
const RUN={};
const runReset=()=>{for(const k in RUN)delete RUN[k];Object.assign(RUN,{atk:0,def:0,hp:0,crit:0,stone:0,qi:0,n:0,names:[],cd:0,pen:0,dr:0,ls:0,dodge:0,luck:0,after:0,tags:{},reso:[]});};runReset();
const qiRetreat=d=>req(S.stage)*.04*Math.pow(d,.75)*Math.min(3,idleRate()/(.5*Math.pow(1.17,S.stage)))*(S.path==='yin'?1.3:1);
const idleRate=()=>(.5+.5*S.ups.tuna)*Math.pow(1.17,S.stage)*rb()*(F('taiyi')?1.25:1)*(1+(S.learned.includes('julingp')?.15:0)+clanBonus().idle+(partners().length?.1+.1*partners().length:0)+((S.sworn||[]).includes('mo')?.1:0))*omenMul('qi')*(injOn()?.6:1);
const tapGain=()=>(1+.8*S.ups.yinqi)*Math.pow(1.17,S.stage)*rb()*omenMul('qi');
const realmIdx=()=>STAGES[S.stage].r;
const ZSC_UP=[1600,3800,9000];const zScale=z=>z===7?Math.pow(2.7,6)*1.5*Math.pow(1.12,S.abyss):z>=8?ZSC_UP[Math.min(2,z-8)]:Math.pow(2.7,Math.max(0,z));
const zSt=z=>z===7?Math.pow(2.6,6):z>=8?Math.pow(2.6,6)*[3,7,15][Math.min(2,z-8)]:Math.pow(2.6,Math.max(0,Math.min(z,6)));
const zRec=z=>STAGES[Math.min(zEntry(z),LAST)].name+' · 首领：'+STAGES[Math.min(zGate(z),LAST)].name;
const disc=()=>Math.max(.65,(1-.03*Math.max(0,S.rep.caravan))*(F('trustHong')?.9:1)*(avOf('hong')>=40?.9:1));
const pillCost=()=>Math.ceil(25*Math.pow(2.6,realmIdx())*disc());
const qiPillCost=()=>Math.ceil(6*Math.pow(2.6,realmIdx())*disc());
const upCost=u=>Math.ceil(u.base*Math.pow(u.g,S.ups[u.k]));
/* 强化面板：直接写出下一重的实际变化，例如「攻击 70 → 78」 */
function upPreview(u){if(u.k!=='yujian'&&u.k!=='jingang')return '';try{const a=stats();S.ups[u.k]++;const b=stats();S.ups[u.k]--;
 return u.k==='yujian'?'<br>攻击 '+fmt(a.atk)+' → '+fmt(b.atk):'<br>生命 '+fmt(a.hp)+' → '+fmt(b.hp)+' · 防御 '+fmt(a.def)+' → '+fmt(b.def);}catch(e){return '';}}
const karmaName=()=>S.karma>=3?'仁心':S.karma<=-3?'魔心':'本心';
const ZORD=[0,1,2,3,4,5,6,8,9,10];const maxZone=()=>{let m=0;ZORD.forEach(z=>{if(zoneUnlocked(z))m=z;});return m;};
const stTier=()=>{const r=S.rep.station;return r>=10?'青石之主':r>=6?'仙师':r>=3?'守站人':'拾荒者';};
function gearAff(){const A={};for(const k of SLOT5){const it=S.gear[k];if(!it)continue;(it.aff||[]).forEach(a=>A[a.k]=(A[a.k]||0)+a.v);
  (it.gems||[]).forEach(g=>{const T=GEM_T[g[0]];if(!T)return;const key={a:'atkP',d:'defP',h:'hpP',c:'critA'}[g[0]];A[key]=(A[key]||0)+T.v[+g[1]-1];});}
  S.learned.forEach(b=>{const fx=BOOKS[b]&&BOOKS[b].fx;if(fx)for(const k in fx)A[k]=(A[k]||0)+fx[k];});const B=buildFx();for(const k in B)A[k]=(A[k]||0)+B[k];return A;}
function stats(){const g=Math.pow(1.19,S.stage)*rb()*(1+.12*STAGES[S.stage].r),u=S.ups,A=gearAff(),cb=clanBonus();
  let atk=8*g,hp=60*g,def=3*g,crit=.08;
  for(const k of SLOT5){const it=S.gear[k];if(it){atk+=it.atk||0;def+=it.def||0;hp+=it.hp||0;crit+=it.crit||0;}}
  /* 御剑术、金刚体的百分比算在「基础 + 装备」的总值上 */atk*=1+(A.atkP||0)+cb.atk+RUN.atk+.12*u.yujian;def*=1+(A.defP||0)+cb.def+RUN.def+.12*u.jingang;hp*=1+(A.hpP||0)+RUN.hp+.12*u.jingang;crit+=(A.critA||0)+RUN.crit;
  if(S.karma<=-3)crit+=.07;return {atk,hp,def,crit:Math.min(crit,.75),heal:S.karma>=3?.45:.35,ls:A.ls||0,cd:A.cd||0,spd:A.spd||0,mp:A.mp||0,pen:Math.min(.6,A.pen||0),mreg:A.mreg||0,dr:Math.min(.6,A.dr||0),luck:A.luck||0,dodge:Math.min(.4,A.dodge||0),healP:A.healP||0,regen:A.regen||0};}
const GATE=r1=>r1<=8?Math.min(r1-1,6):r1===9?'fs':r1===10?8:r1===11?9:10;
function nextInfo(){const s=S.stage;if(s>=LAST)return {final:true};
  const r0=STAGES[s].r,r1=STAGES[s+1].r,major=r1>r0;let gate=null,gz=0,fs=false,ch=1;
  if(major){const g=GATE(r1);if(g==='fs'){fs=true;if(!S.seen.includes('finale'))gate='终章';else if(!S.seen.includes('rj_end'))gate=RJ_GATE;}else{gz=g;if(!S.bossDown.includes(g))gate=ZONES[g].boss;}
    ch=Math.max(.25,.6-.03*Math.min(r1,8)-.03*Math.max(0,r1-8));if(S.karma>=3)ch+=.05;if(S.usePill&&S.pills>0)ch+=.25;ch=Math.min(ch,.95);}
  const bi=major?-1:bnAt(s),bn=bi>=0&&S.bnPass!==s&&!(layered(s)&&(S.layer||0)<2)?BN_NAME[bi]:null;
  const wuN=major?wuNeed(r1):0;let wuG=0;if(major&&!gate&&(S.wu||0)<wuN){gate='感悟';wuG=wuN;}
  return {major,gate,gz,fs,ch,wuN,wuG,bn,bi,name:layered(s)&&(S.layer||0)<2?stName(s,(S.layer||0)+1):stName(s+1)};}
function addQi(x,quiet){S.qi+=x;let moved=false,lm=false;
  for(;;){const need=needQ();if(S.qi<need)break;if(layered(S.stage)&&(S.layer||0)<2&&bnAt(S.stage)>=0){S.qi-=need;S.layer=(S.layer||0)+1;lm=true;continue;}const ni=nextInfo();if(ni.final||ni.major||ni.bn){S.qi=need;break;}S.qi-=need;S.stage++;S.layer=0;moved=true;}
  if(lm&&!moved&&!quiet){toast('突破至 '+stName());if(TAB==='cult')render();}
  if(moved){if(S.stage>=3&&!S.root&&!S.flags.rootAsk){S.flags.rootAsk=1;setTimeout(()=>{if(!BT&&OV_FREE())openRootTest();else toast('墨老：「该测一测你的灵根了。」','测灵根',openRootTest);},900);}if(!quiet)toast('突破至 '+stName());checkStory(quiet);if(TAB==='cult'&&!quiet)render();}}
function ascend(){modal(`<h3>轮回</h3><p>你已修至大罗圆满。归墟之下，还有一道门。</p><p>轮回重修：境界、灵石、功法、装备清空；剧情、委托、声望、行社、秘籍、宝石、温养等级与深渊记录保留。</p><p>获得 <b>仙缘 +1</b>：修为、攻防、生命永久 <b>+25%</b>（当前 ${S.rebirth} 重）。</p>`,
  [{t:'再等等',cls:'ghost'},{t:'飞升轮回',cls:'gold',fn:()=>reincarnate(true)}]);}

/* ---------- 奇遇与委托的通用效果 ---------- */
let EVZ=0;
const zsAt=(z,k)=>Math.ceil(4*zSt(z)*k);
const zs=k=>zsAt(EVZ,k);
const chance=p=>Math.random()<p;
function gS(n){S.stones+=n;return ' 灵石 +'+fmt(n)+'。';}
function gQi(f){const v=req(S.stage)*f;if(v>=0)addQi(v,true);else S.qi=Math.max(0,S.qi+v);return v>=0?' 灵气 +'+fmt(v)+'。':' 灵气 -'+fmt(-v)+'。';}
function gHp(f){S.hpF=Math.max(.05,Math.min(1,(S.hpF??1)+f));return f<0?' 生命 -'+Math.round(-f*100)+'%。':' 生命 +'+Math.round(f*100)+'%。';}
function pushItem(it){if(S.bag.length<BAG_MAX){S.bag.push(it);return ' 获得 '+it.n+'。';}S.stones+=it.sell;return ' 行囊满了，'+it.n+'换成了灵石。';}
function gItem(r,slot){return pushItem(mkItem(Math.max(EVZ,0),r>=2,{r:Math.max(0,Math.min(3,r)),slot:slot||pick(SLOT5)}));}
function gItemNamed(slot,r,name,z){const it=mkItem(Math.max(z,maxZone()),true,{r,slot,n:name});it.n=name;['atk','def','hp'].forEach(k=>{if(it[k])it[k]=Math.round(it[k]*1.25);});return pushItem(it);}
function gPill(n){S.pills+=n;return ' 破境丹 +'+n+'。';}
function gQP(n){S.qiPills+=n;return ' 聚气丹 +'+n+'。';}
function kar(n){S.karma+=n;if(n>0)S.dao.zheng+=n;if(n<0)S.dao.mo-=n;return n>0?' 道心向善。':n<0?' 道心蒙尘。':'';}
function rep(k,n){S.rep[k]=(S.rep[k]||0)+n;const nm={station:'青石站声望',caravan:'红鹞商队声望',tq:'天穹会态度'}[k];return n?` ${nm} ${n>0?'+':''}${n}。`:'';}
function pop(n){S.pop+=n;return ' 青石站人口 +'+n+'。';}
function flag(k){S.flags[k]=1;return '';}
/* ---------- 委托 ---------- */
const qOf=id=>QUESTS.find(q=>q.id===id);
const qDone=id=>!!(S.q[id]&&S.q[id].s==='done');
const qSt=id=>S.q[id]?S.q[id].s:null;
const qAvail=q=>!S.q[q.id]&&safe(NPCS[q.npc].unlock)&&safe(q.unlock);
function qReady(id){const st=S.q[id];if(!st||st.s!=='on')return;st.s='ready';const q=qOf(id);toast('委托完成：'+q.title+'，回青石站找'+NPCS[q.npc].name,'big');stationDot();}
function qProgress(type,d){for(const q of QUESTS){const st=S.q[q.id];if(!st||st.s!=='on')continue;const o=q.obj;
  if(type==='kill'&&o.type==='kill'&&o.mob===d.look||type==='kill'&&o.type==='killz'&&o.z===d.z){st.p=(st.p||0)+1;if(st.p>=o.n)qReady(q.id);}
  if(type==='run'&&o.type==='run'&&o.z===d.z)qReady(q.id);}}
const MG_NAME={gomoku:'五子棋',sicbo:'押大小',duel:'比点数',boxes:'三匣',memory:'翻牌'},LV_NAME=['','初阶','中阶','高阶'];
function qProgText(q){const st=S.q[q.id],o=q.obj;if(st.s==='ready')return '已完成，回去找'+NPCS[q.npc].name;if(o.type==='game')return '赢下一局「'+MG_NAME[o.g]+(o.lv?'·'+LV_NAME[o.lv]:'')+'」';
  if(o.type==='kill'||o.type==='killz')return `进度 ${Math.min(st.p||0,o.n)}/${o.n}`;if(o.type==='node')return '在「'+ZONES[o.z].n+'」探索时留意「'+o.g+'」';
  if(o.type==='run')return '击败「'+ZONES[o.z].n+'」尽头的首领';if(o.type==='fight')return '尸潮已到站台东侧，走过去迎战';return '';}
function stationDot(){const any=Object.keys(NPCS).some(k=>safe(NPCS[k].unlock)&&QUESTS.some(q=>q.npc===k&&(qAvail(q)||qSt(q.id)==='ready')));const d=$('#dotSta');if(d)d.hidden=!any;}

/* ---------- 敌人 ---------- */
const zoneUnlocked=i=>i===7?S.bossDown.includes(6):i===8?F('feisheng')&&S.bossDown.includes(6):i===9?S.bossDown.includes(8):i===10?S.bossDown.includes(9):(i===0||S.bossDown.includes(i-1));
/* ---------- 难度：敌人按「对标境界」与玩家成长曲线对齐 ----------
   REF_A 是该境界一个「中等养成」玩家（适当装备、御剑/金刚体若干重、两名同伴）的攻击力。
   区域首领对标该区域的「关口境界」（本大境界圆满）——你卡在瓶颈时去打它，应当是一场硬仗。 */
const REF_T=[0,4,8,12,16,20,24,28,32,41,45,49],REF_A=[10,30,80,230,578,1643,3960,10023,25280,144493,346376,779197];
function refA(t){t=Math.max(0,t);if(t>=49)return REF_A[11]*Math.pow(1.24,t-49);let i=0;while(REF_T[i+1]<t)i++;const a=REF_T[i],b=REF_T[i+1];return REF_A[i]*Math.pow(REF_A[i+1]/REF_A[i],(t-a)/(b-a));}
const zEntry=z=>z===0?0:z<=6?4*z+5:z===7?32:[38,42,46][Math.min(2,z-8)];
const zGate=z=>z===0?8:z<=6?4*z+8:z===7?32:[41,45,49][Math.min(2,z-8)];
const zT=z=>z===7?Math.max(S.stage,32):Math.max(zEntry(z),Math.min(S.stage,zGate(z)));
const BOSS_SOFT=[.6,.8,.92,1,1,1,1,1,1,1,1];
/* 战力：只看实际属性，不看境界。pRel>1 说明你比同境界的「中等养成」更强——前线的敌人会跟着变强，越阶不再白给 */
const cpOf=(atk,hp,crit)=>Math.round(Math.sqrt(Math.max(1,atk)*Math.max(1,hp))*(1+(crit||0)*.8));
function myCP(){try{return mkParty().reduce((t,a)=>t+cpOf(a.atk,a.max,a.crit),0);}catch(e){const st=stats();return cpOf(st.atk,st.hp,st.crit);}}
function pRel(){const st=stats();return Math.sqrt(st.atk*st.hp/5.8)/refA(S.stage);}
const pK=()=>Math.min(8,Math.pow(Math.max(1,pRel()),.85));
function mkEnemy(z,boss,special){let n,m=1,tint=false;
  if(special==='zhou'){const s0=zScale(0);return {n:'周烈',look:'周烈',hp:40*s0*3.6,max:40*s0*3.6,atk:6*s0*1.4,def:2*s0*1.2,boss:true,z:0,stones:60,special};}
  if(special==='hunter'){const mz=maxZone(),A=refA(S.stage)*pK(),first=!F('hunter1');const hp=A*(first?14:18);
    return {n:first?(F('v1')?'猎宝人·乌衡':'天穹追兵·周烈'):(F('v1')?'猎宝人':'天穹追兵'),look:'天穹追兵',hp,max:hp,atk:A*.85,def:A*.12,boss:true,z:mz,stones:zsAt(mz,8),special,pk:1};}
  if(special&&special.startsWith('quest:')){const q=qOf(special.slice(6)),f=q.obj.foe;return mkCustom(maxZone(),Object.assign({boss:true},f),special);}
  if(z===7){n='深渊·第'+(S.abyss+1)+'层';boss=true;tint=true;}else if(boss)n=ZONES[z].boss;else{n=pick(ZONES[z].mobs);m=.8+Math.random()*.4;}
  const look=z===7?ABYSS_POOL[S.abyss%ABYSS_POOL.length]:n;
  const p2=boss&&z!==7&&(z>=5||Math.random()<.2);
  let hp,atk,def;
  if(z===7){const A=refA(32+S.abyss*.6);hp=18*A;atk=.85*A;def=.14*A;}
  else if(boss){const A=refA(zGate(z))*(S.bossDown.includes(z)?1:pK()),k=BOSS_SOFT[Math.min(z,10)];hp=32*A*k*(p2?.72:1);atk=1.9*A*Math.sqrt(k);def=.15*A;}
  else{const A=refA(zT(z))*(z>=maxZone()?pK():1);hp=5*A*m;atk=.7*A*m;def=.1*A*m;}
  let st=4*zSt(z)*m*(boss?10:1);if(z===7)st=4*Math.pow(2.6,6)*12*Math.pow(1.1,S.abyss);
  const e={n,look,tint,hp,max:hp,atk,def,boss,z,stones:Math.ceil(st),pk:1};if(p2)e.p2=1;return omenFoe(e);}
/* f.st：对手自己的境界（宗门、江湖人物、悬赏）；没有时按所在区域与你的境界取值 */
function mkCustom(z,f,special){const zz=z===7?6:Math.max(0,z),m=f.m||1.4,look=f.look||pick(ZONES[zz].mobs),A=refA(f.st!=null?f.st:zT(zz))*pK();
  const hp=f.boss?A*(12+8*m):A*m*4.5,atk=f.boss?A*(.6+.45*m):A*(.3+.3*m),def=A*(f.boss?.13:.08*m);
  return {n:f.name||look,look,hp,max:hp,atk,def,boss:!!f.boss,z:zz,stones:zsAt(zz,m*1.5),special,after:f.after,elite:true,p2:f.p2,n2:f.n2,pk:1};}
const dmgF=(a,d)=>a*a/(a+d)*(.9+Math.random()*.2);
function evPool(z){return Object.keys(EVENTS).filter(k=>{const e=EVENTS[k];if(k.startsWith('q_')||ZONE_SCRIPT.includes(k)||e.zones==='cult')return false;if(e.once&&S.seenEv.includes(k))return false;
  if(['trap_floor','ambush','jianke','lost_kid'].includes(k)&&k!=='lost_kid')return false;if(e.need&&!safe(e.need))return false;return e.zones==='any'||Array.isArray(e.zones)&&e.zones.includes(z);});}
function qFight(id,cb){const q=qOf(id);if(!q||BT)return;const f=q.obj.foe;const foes=[0,1,2].map(i=>{const e=mkCustom(Math.max(1,maxZone()),{look:f.look,name:i?'尸傀':f.name+'·头目',m:i?1.25:1.7,boss:!i},null);if(i){e.hp*=.6;e.max=e.hp;}return e;});
  startBattle(foes,{bg:'town',noFlee:true,onWin:()=>{qReady(id);cb&&cb();}});}


/* ---------- 奇遇弹窗 ---------- */
let EVC=null;
function playEvent(id,ctx){const ev=EVENTS[id];if(!ev||BT)return;ctx=ctx||{};EVC={id,ev,ctx};EVZ=WD.M&&WD.M.kind!=='town'&&TAB==='world'?(WD.M.z===7?6:WD.M.z):maxZone();
  const onW=TAB==='world'&&WD.M&&!ev.bg;const bg=ev.bg||(onW&&WD.M.kind!=='town'?ZONE_SCN[WD.M.z]:cultScene());
  const lines=ev.lines.map(l=>sub(typeof l==='function'?l():l)).filter(Boolean);
  const ov=$('#ov');ov.hidden=false;ov.className='vn'+(onW?' talk':'');
  ov.innerHTML=`${onW?'':'<canvas class="vbg" id="vbg"></canvas>'}<div class="port r ${ev.spk?'':'hide'}" id="pR">${ev.spk?(PORTRAIT[ev.spk]||PORTRAIT.mo)():''}</div>
   <div class="inner"><div class="st-top"><span class="tt">${ev.title}</span>${onW&&WD.M.kind!=='town'?`<span>生命 ${Math.round((S.hpF??1)*100)}%</span>`:''}</div><div class="st-sp"></div>
   <div class="st-choices" id="evC"></div><div class="st-box"><div class="st-s gold">${ctx.qid?'委托':ZONE_SCRIPT.includes(id)?'见闻':'奇遇'}${onW?' · '+ev.title:''}</div><div class="st-x narr" id="evX">${esc(lines.join('\n\n'))}</div></div></div>`;
  if(!onW)requestAnimationFrame(()=>paintTo($('#vbg'),bg));
  const box=$('#evC');box.innerHTML=ev.choices.map((c,i)=>{const ok=!c.need||safe(c.need);return `<button data-i="${i}" ${ok?'':'disabled style="opacity:.4"'}>${esc(sub(typeof c.t==='function'?c.t():c.t))}</button>`;}).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.disabled)return;wuAdd(2,1);let res=ev.choices[+b.dataset.i].act();if(typeof res==='string')res={text:res};
    if((ev.once||ZONE_SCRIPT.includes(id))&&!S.seenEv.includes(id))S.seenEv.push(id);
    if(res.game){const G=res.game;box.innerHTML='';openMini(G.k,{lv:G.lv,title:G.title||ev.title,stake:G.stake,onDone:w=>{const t=(w?G.onWin:G.onLose)();const r2=typeof t==='string'?{text:t}:t;Object.assign(res,r2,{game:null});
      $('#evX').textContent=sub(res.text||'').trim();$('#evX').className='st-x';box.innerHTML=`<button id="evGo">${res.fight?'迎战':'继续'}</button>`;$('#evGo').onclick=ev2=>{ev2.stopPropagation();ov.hidden=true;ov.innerHTML='';ov.className='';EVC=null;endEvent(id,ctx,res);};}});return;}
    $('#evX').textContent=sub(res.text||'').trim();$('#evX').className='st-x';box.innerHTML=`<button id="evGo">${res.fight?'迎战':'继续'}</button>`;
    $('#evGo').onclick=ev2=>{ev2.stopPropagation();ov.hidden=true;ov.innerHTML='';ov.className='';EVC=null;endEvent(id,ctx,res);};});}
function endEvent(id,ctx,res){const o=ctx.obj,en=ctx.ent;
  const used=()=>{if(o&&WD.M){removeProp(WD.M,o);}if(en)en.dead=true;};
  if(res.fight){const z=WD.M&&WD.M.kind!=='town'?(WD.M.z===7?6:WD.M.z):maxZone();const fz=res.fight.z!==undefined?res.fight.z:z;const e=mkCustom(fz,res.fight);Object.assign(e,{demon:res.fight.demon,human:res.fight.human});if(ctx.qid)e.evQ=ctx.qid;const foes=res.fight.many?res.fight.many.map(f=>{const q=f.look?mkCustom(fz,f):f;q.human=1;return q;}):[e];
    startBattle(foes,{noFlee:true,onWin:()=>{used();res.fight.onWin&&res.fight.onWin();},onLose:res.fight.onLose?()=>{res.fight.onLose();}:undefined});save();return;}
  if(res.next){setTimeout(()=>playEvent(res.next,{}),300);}
  if(ctx.qid)qReady(ctx.qid);used();if(TAB!=='world')render();save();}

/* ---------- 装备 ---------- */
function rollRar(boss){if(omenOn('fuxing'))return pityRar(Math.min(3,Math.max(rr0(boss),rr0(boss))+(Math.random()<.3?1:0)),boss);return pityRar(rr0(boss),boss);}
function rr0(boss){const r=Math.random();if(boss)return r<.08?3:r<.35?2:r<.75?1:0;return r<.015?3:r<.09?2:r<.32?1:0;}
function mkItem(z,boss,forced){z=Math.max(0,z);const r=forced?forced.r:rollRar(boss),slot=forced?forced.slot:pick(SLOT5),sc=zScale(z)*RAR[r].m*(.85+Math.random()*.3);
  const it={id:S.uid++,slot,r,ref:0,n:forced&&forced.n?forced.n:(r?RAR[r].n+'·':'')+GN[slot][Math.min(z,10)]+(z===7?' +'+S.abyss:''),z,sell:Math.ceil(2*zSt(z)*RAR[r].m*(z===7?Math.pow(1.1,S.abyss)*2:1))};
  if(slot==='w')it.atk=Math.round(5*sc);else if(slot==='a'){it.def=Math.round(2.4*sc);it.hp=Math.round(18*sc);}else if(slot==='j'){it.hp=Math.round(12*sc);it.atk=Math.round(1.5*sc);it.crit=+(.01+.015*r).toFixed(3);}
  else if(slot==='r'){it.atk=Math.round(2.6*sc);it.crit=+(.012+.01*r).toFixed(3);}else{it.hp=Math.round(8*sc);it.def=Math.round(1.2*sc);it.atk=Math.round(2*sc);}
  const na=Math.min(3,r+(Math.random()<.15?1:0)),keys=Object.keys(AFF).sort(()=>Math.random()-.5).slice(0,na);if(na)it.aff=keys.map(k=>({k,v:+AFF[k].v(Math.min(r,3)*(.85+Math.random()*.3)).toFixed(3)}));
  it.so=r>=2?2:r>=1?1:(Math.random()<.2?1:0);it.gems=[];
  return it;}
const affScore=it=>(it.aff||[]).reduce((s,a)=>s+(AFF[a.k]&&AFF[a.k].pct?a.v*2.5:a.v*.03),0)+(it.gems||[]).length*.12;
const power=it=>it?((it.atk||0)+(it.def||0)*1.6+(it.hp||0)*.15+(it.crit||0)*stats().atk*2)*(1+affScore(it)):0;
const better=it=>power(it)>power(S.gear[it.slot]);
function statText(it){const p=[];if(it.atk)p.push('攻 +'+fmt(it.atk));if(it.def)p.push('防 +'+fmt(it.def));if(it.hp)p.push('血 +'+fmt(it.hp));if(it.crit)p.push('暴击 +'+(it.crit*100).toFixed(1)+'%');return p.join('　');}
function affHTML(it){const a=(it.aff||[]).map(x=>`<span class="af">${affText(x)}</span>`).join('');const g=it.so?`<span class="gs">${Array.from({length:it.so},(_,i)=>it.gems&&it.gems[i]?`<i class="gm g-${it.gems[i][0]}" title="${gemName(it.gems[i])}"></i>`:'<i class="gm"></i>').join('')}</span>`:'';return a||g?`<div class="affs">${a}${g}</div>`:'';}
function itemName(it){return it.n+(it.ref?' +'+it.ref:'');}

/* ---------- 玉简温养 ---------- */
const jSlots=()=>1+(S.dt.lv>=2)+(S.dt.lv>=5)+(S.dt.lv>=8);
const jSpeed=()=>Math.max(.4,1-.08*S.dt.lv);
const jUpCost=()=>Math.ceil(50*Math.pow(2.2,S.dt.lv));
const jHalted=()=>S.expo>=100;
function jDur(kind,it){let base=kind==='pill'?20*60:kind==='qi'?10*60:kind==='stones'?15*60:30*60*(1+it.r*.5);if(!F('warm1'))base=30;return base*jSpeed();}
function jPut(kind,arg){if(S.dt.slots.length>=jSlots())return;let o={kind,start:Date.now()};
  if(kind==='pill'){if(S.pills<1)return;S.pills--;o.n=1;o.label='破境丹';}
  else if(kind==='qi'){if(S.qiPills<1)return;S.qiPills--;o.n=1;o.label='聚气丹';}
  else if(kind==='stones'){const amt=Math.floor(S.stones*.5);if(amt<10)return;S.stones-=amt;o.n=amt;o.label='灵石 '+fmt(amt);}
  else{const i=S.bag.findIndex(x=>x.id===+arg);if(i<0)return;o.item=S.bag.splice(i,1)[0];o.label=itemName(o.item);}
  o.dur=jDur(kind,o.item);o.left=o.dur;if(!F('warm1'))S.flags.warm1=1;S.dt.slots.push(o);JPICK=false;toast('放上玉台：'+o.label);render();save();}
function jTick(dt){if(!S.dt.slots.length)return;const rate=jHalted()?0:1;for(const o of S.dt.slots)if(o.left>0)o.left=Math.max(0,o.left-dt*rate);}
function jTake(i){const o=S.dt.slots[i];if(!o||o.left>0)return;S.dt.slots.splice(i,1);let msg='';const lv=S.dt.lv;
  if(o.kind==='pill'||o.kind==='qi'){const n=Math.random()<(lv>=3?.25:0)?3:2;if(o.kind==='pill')S.pills+=n;else S.qiPills+=n;msg=o.label+' ×'+n;}
  else if(o.kind==='stones'){const g=Math.floor(o.n*(1.6+.05*lv));S.stones+=g;msg='灵石 '+fmt(g);}
  else{const it=o.item;if(it.r<3){const k=RAR[it.r+1].m/RAR[it.r].m;it.r++;if(!it.uniq){it.so=Math.max(it.so||0,it.r>=2?2:1);if(!it.gems)it.gems=[];const ks=Object.keys(AFF).filter(x=>!(it.aff||[]).some(a=>a.k===x));if((it.aff||[]).length<3&&ks.length){it.aff=(it.aff||[]).concat([{k:pick(ks),v:+AFF[pick(ks)].v(it.r).toFixed(3)}]);it.aff[it.aff.length-1].v=+AFF[it.aff[it.aff.length-1].k].v(it.r).toFixed(3);}}['atk','def','hp'].forEach(s=>{if(it[s])it[s]=Math.round(it[s]*k);});if(it.crit)it.crit=+(it.crit+.015).toFixed(3);it.n=RAR[it.r].n+'·'+it.n.replace(/^[凡灵宝仙]·/,'');it.sell=Math.ceil(it.sell*k);}
    else{it.ref=(it.ref||0)+1;['atk','def','hp'].forEach(s=>{if(it[s])it[s]=Math.round(it[s]*1.2);});}
    S.bag.push(it);msg=itemName(it);}
  const gain=Math.max(5,Math.round(18*(1-.12*S.ups.lianxi)));S.expo=Math.min(100,S.expo+gain);toast('温养完成：'+msg,'big');
  if(S.expo>=100){S.special='hunter';if(!F('hunter1')){checkStory(true);render();save();if(OV_FREE()&&!SC)playStory('exposed');return;}toast('灵光外泄满盈！天穹追兵找上门了','bad');}
  render();save();}
/* ---------- 剧情 ---------- */
function checkStory(quiet){for(const ch of STORY){if(S.seen.includes(ch.id)||S.pending.includes(ch.id))continue;
  let ok=false;try{ok=ch.cond();}catch(e){}if(ok){S.pending.push(ch.id);if(!quiet&&S.started){if(ch.side&&shortCh(ch)&&!SC&&!BT&&OV_FREE())playStory(ch.id);else toast((ch.side?'':'新剧情：')+ch.title,'观看',()=>playStory(ch.id));}}}
  dotUpdate();}
const OV_FREE=()=>$('#ov').hidden;
function dotUpdate(){$('#dotStory').hidden=!S.pending.some(id=>{const c=STORY.find(x=>x.id===id);return c&&!c.side;});stationDot();}
const bro=()=>S.gender==='f'?'姐姐':'哥哥';
const sub=t=>String(t).replaceAll('{name}',S.name).replaceAll('{bro}',bro());
let SC=null;
/* 读剧情：文字速度、自动播放、回顾 */
const VN_SPD={slow:45,mid:28,fast:12,now:0},VN_SPDN={slow:'慢',mid:'中',fast:'快',now:'瞬'};
const VN=(()=>{let o={spd:'mid',auto:false,brief:true};try{Object.assign(o,JSON.parse(localStorage.getItem('lingchao_vn')||'{}'));}catch(e){}return o;})();
function vnSave(){try{localStorage.setItem('lingchao_vn',JSON.stringify(VN));}catch(e){}}
/* 没有立绘的人物：印章式头像 */
function sealPortrait(k){const n=(SPK[k]||BOND[k]&&BOND[k].n||'?').replace(/[（(].*$/,'');const ch=n.length>2?n.slice(-2):n;let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%360;
 return `<svg class="seal-por" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"><rect x="34" y="52" width="132" height="132" rx="10" fill="hsl(${h} 22% 18%)" stroke="#b5402e" stroke-width="7"/><rect x="46" y="64" width="108" height="108" rx="4" fill="none" stroke="#b5402e" stroke-width="2.5"/><text x="100" y="${ch.length>1?132:142}" text-anchor="middle" font-size="${ch.length>1?44:64}" fill="#e8d9b8" font-family="serif" ${ch.length>1?'writing-mode="tb" ':''}>${esc(ch)}</text></svg>`;}
const porOf=k=>PORTRAIT[k]?PORTRAIT[k]():sealPortrait(k);
function applyFx(fx){if(typeof fx==='function')fx=fx();if(!fx)return;if(fx.stones)S.stones+=fx.stones;if(fx.pills)S.pills+=fx.pills;if(fx.qiPills)S.qiPills+=fx.qiPills;
  if(fx.qiMul)S.qi=Math.floor(S.qi*fx.qiMul);if(fx.qiFill)S.qi=Math.max(S.qi,req(S.stage));if(fx.flags)Object.assign(S.flags,fx.flags);if(fx.aff)for(const k in fx.aff)aff(k,fx.aff[k]);if(fx.gem)gGem(fx.gem[0],fx.gem[1]);if(fx.book)gBook(fx.book);if(fx.fame&&S.clan)S.clan.fame+=fx.fame;if(fx.meds)S.meds+=fx.meds;if(fx.item){EVZ=maxZone();gItem(fx.item);}if(fx.karma)S.karma+=fx.karma;
  if(fx.gift){const it=mkItem(Math.max(1,maxZone()),true,{r:2,slot:'j',n:fx.gift});it.n=fx.gift;it.hp=Math.round(it.hp*1.3);if(S.bag.length<BAG_MAX)S.bag.push(it);}}
function playStory(id){const ch=STORY.find(c=>c.id===id);if(!ch||BT)return;if(SC)clearInterval(SC.typing);
  SC={id,ch,q:ch.lines.slice(),typing:null,full:'',choice:false,bg:ch.bg,log:[],read:S.seen.includes(id),skipArm:false};
  const ov=$('#ov');ov.hidden=false;ov.className='vn';
  ov.innerHTML=`<canvas class="vbg" id="vbg"></canvas><div class="port l hide" id="pL"></div><div class="port r hide" id="pR"></div>
   <div class="inner" id="stIn"><div class="st-top"><span class="tt">${ch.title}</span><span class="st-tools"><button class="st-skip" id="stLog" aria-label="回顾">回顾</button><button class="st-skip" id="stSpd" aria-label="文字速度">${VN_SPDN[VN.spd]}</button><button class="st-skip${VN.brief?' on':''}" id="stBrief" aria-pressed="${VN.brief}" aria-label="阅读方式：要点或全文">${VN.brief?'要点':'全文'}</button><button class="st-skip${VN.auto?' on':''}" id="stAuto" aria-pressed="${VN.auto}">自动</button><button class="st-skip" id="stSkip">${S.seen.includes(id)?'快进':'跳过'}</button></span></div><div class="st-sp"></div><div class="st-choices" id="stC"></div>
   <div class="st-box"><div class="st-s" id="stS" hidden></div><div class="st-x" id="stX"></div><div class="st-more" id="stM">▾</div></div></div>`;
  requestAnimationFrame(()=>{if(SC)paintTo($('#vbg'),SC.bg);});
  $('#stSkip').onclick=e=>{e.stopPropagation();if(!SC.read&&!SC.skipArm){SC.skipArm=true;e.target.textContent='再点跳过未读';setTimeout(()=>{if(SC&&SC.skipArm){SC.skipArm=false;const b=$('#stSkip');if(b)b.textContent='跳过';}},2500);return;}skipStory();};
  $('#stLog').onclick=e=>{e.stopPropagation();vnLog();};
  $('#stSpd').onclick=e=>{e.stopPropagation();const ks=Object.keys(VN_SPD);VN.spd=ks[(ks.indexOf(VN.spd)+1)%ks.length];vnSave();e.target.textContent=VN_SPDN[VN.spd];};
  $('#stBrief').onclick=e=>{e.stopPropagation();VN.brief=!VN.brief;vnSave();e.target.classList.toggle('on',VN.brief);e.target.setAttribute('aria-pressed',VN.brief);e.target.textContent=VN.brief?'要点':'全文';toast(VN.brief?'要点：只读开头、选择前后和结尾，全文都在「回顾」里':'全文：一句不落地读');};
  $('#stAuto').onclick=e=>{e.stopPropagation();VN.auto=!VN.auto;vnSave();e.target.classList.toggle('on',VN.auto);e.target.setAttribute('aria-pressed',VN.auto);if(VN.auto&&SC&&!SC.typing&&!SC.choice)vnAutoNext();};
  $('#stIn').onclick=()=>{if(!SC||SC.choice||SC.logOpen)return;clearTimeout(SC.autoT);if(SC.typing){finishType();return;}nextLine();};
  nextLine();}
function setBg(k){SC.bg=k;const cv=$('#vbg');if(!cv)return;cv.style.opacity=0;setTimeout(()=>{paintTo(cv,k);cv.style.opacity=1;},220);}
function showPortrait(spk){const L=$('#pL'),R=$('#pR');if(!L)return;
  if(!spk){L.classList.add('hide');R.classList.add('hide');return;}
  const hero=spk==='@';const key=hero?(S.gender==='f'?'hero_f':'hero_m'):spk;const box=hero?L:R,other=hero?R:L;
  if(box.dataset.k!==key){box.classList.add('hide');setTimeout(()=>{box.innerHTML=porOf(key);box.dataset.k=key;box.classList.remove('hide','dim');},150);}else box.classList.remove('hide','dim');
  if(other.dataset.k)other.classList.add('dim');}
function nextLine(){for(;;){if(!SC.q.length)return endStory();const L=SC.q[0];
    if(!Array.isArray(L)&&L.bg){SC.q.shift();setBg(L.bg);continue;}
    if(!Array.isArray(L)&&L.fx&&!L.c){SC.q.shift();applyFx(L.fx);continue;}
    if(!Array.isArray(L)&&L.fn){SC.q.shift();try{L.fn();}catch(e){}continue;}
    if(!Array.isArray(L)&&L.game){SC.q.shift();const G=L.game;SC.choice=true;$('#stM').hidden=true;openMini(G.k,{lv:G.lv,title:G.title,story:1,stake:G.stake,onDone:w=>{SC.choice=false;if(w&&G.winFx)applyFx(G.winFx);if(!w&&G.loseFx)applyFx(G.loseFx);SC.q=((w?G.win:G.lose)||[]).concat(SC.q);nextLine();}});return;}
    if(Array.isArray(L)&&typeof L[1]==='function'&&!L[1]()){SC.q.shift();continue;}
    if(Array.isArray(L)&&VN.brief&&vnKeySkip(L)){SC.q.shift();SC.log.push([L[0]==='@'?S.name:(SPK[L[0]]||''),sub(typeof L[1]==='function'?L[1]():L[1])]);continue;}break;}
  const L=SC.q.shift();if(!Array.isArray(L)&&L.c){SC.lastNarr=false;SC.after=0;return showChoices(L.c);}
  const spk=L[0];SC.lastNarr=(spk==='');SC.shown=(SC.shown||0)+1;SC.after=(SC.after??99)+1;const name=spk==='@'?S.name:(SPK[spk]||'');const tx=sub(typeof L[1]==='function'?L[1]():L[1]);
  const s=$('#stS'),x=$('#stX');s.textContent=name;s.hidden=!name;s.className='st-s'+(['zero','hong','tq','sx','zhou2'].includes(spk)?' cin':spk==='@'?' gold':'');
  x.className='st-x'+(name?'':' narr');x.textContent='';$('#stM').hidden=true;showPortrait(spk||null);
  SC.full=tx;SC.log.push([name,tx]);let i=0;clearInterval(SC.typing);
  const ms=VN_SPD[VN.spd];if(reduce||!ms){x.textContent=tx;SC.typing=null;$('#stM').hidden=false;vnAutoNext();return;}
  const tid=setInterval(()=>{if(!SC||SC.typing!==tid){clearInterval(tid);return;}i++;x.textContent=tx.slice(0,i);if(i>=tx.length)finishType();},ms);SC.typing=tid;}
function finishType(){clearInterval(SC.typing);SC.typing=null;$('#stX').textContent=SC.full;$('#stM').hidden=false;vnAutoNext();}
function vnAutoNext(){if(!SC||!VN.auto)return;clearTimeout(SC.autoT);const me=SC;SC.autoT=setTimeout(()=>{if(SC!==me||SC.choice||SC.typing||SC.logOpen||!VN.auto)return;nextLine();},900+Math.min(2600,(SC.full||'').length*45));}
function vnLog(){if(!SC)return;SC.logOpen=true;clearTimeout(SC.autoT);const box=document.createElement('div');box.className='st-log';box.setAttribute('role','dialog');box.setAttribute('aria-label','回顾');
 box.innerHTML=`<div class="st-log-h"><b>回顾</b><button class="st-skip" id="stLogX">关闭</button></div><div class="st-log-b">${SC.log.map(([n,t])=>`<p>${n?'<span class="ln">'+esc(n)+'</span>':''}${esc(t)}</p>`).join('')||'<p class="empty">还没有内容。</p>'}</div>`;
 $('#ov').appendChild(box);const b=box.querySelector('.st-log-b');b.scrollTop=b.scrollHeight;
 const close=e=>{if(e)e.stopPropagation();box.remove();if(SC){SC.logOpen=false;vnAutoNext();}};box.querySelector('#stLogX').onclick=close;box.onclick=e=>e.stopPropagation();}
function showChoices(cs){SC.choice=true;$('#stM').hidden=true;showPortrait('@');
  const box=$('#stC');box.innerHTML=cs.map((c,i)=>`<button data-i="${i}" style="animation-delay:${i*80}ms">${esc(sub(c.t))}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=cs[+b.dataset.i];SC.log.push(['','▸ '+sub(c.t)]);S.karma+=c.k||0;applyFx(c.fx);box.innerHTML='';SC.choice=false;SC.q=(c.r||[]).concat(SC.q);nextLine();});}
function skipStory(){if(!SC||SC.choice)return;clearInterval(SC.typing);SC.typing=null;
  while(SC.q.length){const L=SC.q[0];if(!Array.isArray(L)&&L.c)break;SC.q.shift();if(!Array.isArray(L)){if(L.fx&&!L.c)applyFx(L.fx);if(L.bg)SC.bg=L.bg;if(L.fn){try{L.fn();}catch(e){}}}}
  if(SC.q.length){paintTo($('#vbg'),SC.bg);$('#stS').hidden=true;$('#stX').textContent='（做出你的选择）';showChoices(SC.q.shift().c);}else endStory();}
function endStory(){const ch=SC.ch;clearInterval(SC.typing);if(!S.seen.includes(ch.id))S.seen.push(ch.id);S.pending=S.pending.filter(x=>x!==ch.id);
  const ov=$('#ov');ov.hidden=true;ov.innerHTML='';ov.className='';SC=null;
  if(ch.id==='prologue')S.started=true;
  if(ch.after)ch.after();checkStory(true);
  if(S.special&&(ch.id==='ratking'||ch.id==='exposed')){TAB='world';if(WD.M&&WD.M.kind!=='town')setTimeout(()=>goTown(),300);else WD.M=null;}
  if(ch.id==='prologue'){TAB='world';WD.M=null;setTimeout(()=>toast('铁叔在站台上找你，头上有「!」的人有事相托'),900);}
  dotUpdate();render();save();
  const nx=S.pending.map(id=>STORY.find(c=>c.id===id)).find(c=>c&&c.side&&shortCh(c));if(nx)setTimeout(()=>{if(OV_FREE()&&!SC&&!BT)playStory(nx.id);},400);}

/* ---------- NPC 对话 ---------- */
function npcTalk(k){const npc=NPCS[k];if(!npc||BT)return;const ready=QUESTS.find(q=>q.npc===k&&qSt(q.id)==='ready');const avail=QUESTS.find(q=>q.npc===k&&qAvail(q));
  let text,btns;
  if(ready){text=sub(typeof ready.done==='function'?ready.done():ready.done);btns=[{t:'交付委托',cls:'gold',fn:()=>{wuAdd(10);const r=(ready.reward()||'')+(BOND[k]?aff(k,8,true):'');S.q[ready.id].s='done';toast(('委托「'+ready.title+'」完成。'+r).replace(/\s+/g,' '),'big');stationDot();if(TAB!=='world')render();save();}}];}
  else if(avail){text=sub(avail.offer);btns=[{t:'接下委托',cls:'gold',fn:()=>{S.q[avail.id]={s:'on',p:0};toast('接下委托：'+avail.title);stationDot();
    if(avail.obj.type==='fight'&&WD.M&&WD.M.kind==='town')WD.M.ents.push(mkEnt({kind:'npc',k:'corpse',c:23,r:3,dir:1,qfight:avail.id,name:'尸潮'}));
    if(TAB!=='world')render();save();if(avail.obj.type==='ev')setTimeout(()=>playEvent(avail.obj.ev,{qid:avail.id}),200);if(avail.obj.type==='game')setTimeout(()=>qGame(avail.id),200);}},...(npc.menu?npc.menu().filter(Boolean):[]),{t:'以后再说',cls:'ghost'}];}
  else{const L=NPC_IDLE[k]||[()=>'……'];text=sub(pick(L)());btns=[{t:'告辞',cls:'ghost'}];
    const og=QUESTS.find(q=>q.npc===k&&qSt(q.id)==='on'&&q.obj.type==='game');if(og)btns.unshift({t:'再来一局：'+og.title,cls:'gold',fn:()=>qGame(og.id)});
    if(npc.menu)btns.unshift(...npc.menu().filter(Boolean));}
  {const cb=chatBtn(k);if(cb.length)btns.splice(Math.max(1,btns.length-1),0,...cb);}
  const onW=TAB==='world';const ov=$('#ov');ov.hidden=false;ov.className='vn'+(onW?' talk':'');
  ov.innerHTML=`${onW?'':'<canvas class="vbg" id="vbg"></canvas>'}<div class="port r" id="pR">${porOf(k)}</div><div class="inner"><div class="st-top"><span class="tt">${WD.M&&onW?WD.M.name:'青石站'}</span></div><div class="st-sp"></div>
   <div class="st-choices">${btns.map((b,i)=>`<button data-i="${i}">${b.t}</button>`).join('')}</div>
   <div class="st-box"><div class="st-s ${['hong','zero'].includes(k)?'cin':''}">${npc.name}${BOND[k]?`<small class="strel">${relName(k)} ♥${avOf(k)}</small>`:''}</div><div class="st-x">${esc(text)}</div></div></div>`;
  if(!onW)requestAnimationFrame(()=>paintTo($('#vbg'),k==='mo'?'dongtian':'shelter'));
  ov.querySelectorAll('.st-choices button').forEach(el=>el.onclick=()=>{ov.hidden=true;ov.innerHTML='';ov.className='';const b=btns[+el.dataset.i];b.fn&&b.fn();});}

/* ---------- 提示 / 弹窗 ---------- */
function modal(html,btns,bg){const ov=$('#ov');ov.hidden=false;ov.className='';const jh=$('#jh');ov.style.zIndex=jh&&!jh.hidden?'45':'';if(TAB==='world')bg=null;
  ov.innerHTML=`${bg?'<canvas class="vbg" id="vbg" style="opacity:.55"></canvas>':''}<div class="inner"><div class="modal">${html}<div class="row">${btns.map((b,i)=>`<button class="btn ${b.cls||''}" data-i="${i}">${b.t}</button>`).join('')}</div></div></div>`;
  if(bg)requestAnimationFrame(()=>paintTo($('#vbg'),bg));
  ov.querySelectorAll('.modal .row button').forEach(el=>el.onclick=()=>{ov.hidden=true;ov.innerHTML='';const b=btns[+el.dataset.i];b.fn&&b.fn();});}
function toast(t,a,b){let act=null,fn=null,cls='';if(typeof b==='function'){act=a;fn=b;}else if(a==='big'||a==='bad')cls=a;if(cls==='big'&&t.length>16)cls='big2';
  const box=$('#toasts');[...box.children].forEach(c=>{if(c.firstChild&&c.firstChild.textContent===t)c.remove();});while(box.children.length>=3)box.firstChild.remove();const d=document.createElement('div');d.className='toast '+cls;d.textContent=t;
  if(fn){const bt=document.createElement('button');bt.textContent=act;bt.onclick=()=>{d.remove();fn();};d.appendChild(bt);}
  box.appendChild(d);setTimeout(()=>d.remove(),fn?7000:2800);}

/* ---------- 画面辅助 ---------- */
function flashStage(c){const s=$('#cstage');if(!s||reduce)return;const f=document.createElement('div');f.className='healfx';f.style.cssText='left:0;right:0;width:100%;bottom:0;background:radial-gradient(closest-side,'+(c==='gold'?'rgba(227,184,98,.8)':'rgba(207,74,60,.7)')+',transparent)';s.appendChild(f);setTimeout(()=>f.remove(),720);}

/* ---------- 视图 ---------- */
let TAB='world',JPICK=false,resetArm=false,importArm=false;const view=$('#view');const VIEWS={};
function cultScene(){const mz=maxZone();return S.stage>=LAST?'core':mz===0?'shelter':ZONE_SCN[mz];}
function ringSVG(){let t='';for(let i=0;i<48;i++){const a=i/48*6.283,r1=i%4?95:91;t+=`<line x1="${100+Math.cos(a)*r1}" y1="${100+Math.sin(a)*r1}" x2="${100+Math.cos(a)*99}" y2="${100+Math.sin(a)*99}" stroke="rgba(236,227,207,.35)" stroke-width="${i%4?1:2}"/>`;}
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><g class="spin">${t}</g><circle cx="100" cy="100" r="86" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="5"/><circle id="dtP" cx="100" cy="100" r="86" fill="none" stroke="#8fd6b5" stroke-width="4" stroke-linecap="round" stroke-dasharray="540.35" stroke-dashoffset="540.35" transform="rotate(-90 100 100)" style="filter:drop-shadow(0 0 6px #8fd6b5)"/></svg>`;}
VIEWS.cult=()=>`<section class="cult">
  <div class="stage cstage ${ART_IMG['scene_'+cultScene()]?'img':''}" id="cstage" role="button" aria-label="点击炼化药力"><canvas class="bgc" data-scene="${cultScene()}"></canvas>
   <div class="ring">${ringSVG()}</div><div class="sit" id="sit">${heroSit(S.gender==='f')}</div>
   <div class="cname">${stName()}</div><div class="ctap">${S.yao>0?'点击画面炼化药力':'没有药力可炼化 · 去历练，或服一颗丹'}</div></div>
  <div class="qi-num"><b id="cQi"></b> / <span id="cReq"></span> 修为</div>
  <div class="rates"><span>药力 <b id="cYao"></b></span><span>炼化 <b id="cIdle"></b>/秒</span><span>丹毒 <b id="cTox"></b>/100</span></div>
  <div class="break" id="cBreak"></div></section>${cultMore()}
  <h2 class="sec" style="margin-top:24px">功法 <small>以灵石参悟${F('taiyi')?' · 已得太一吐纳 +25%':''}</small></h2>
  ${UPS.filter(u=>!u.need||u.need()).map(u=>{const lv=S.ups[u.k],max=u.max&&lv>=u.max,c=upCost(u);return `<div class="row2"><div class="in"><div class="iname">${u.n}<span class="lv">第 ${lv} 重</span></div><div class="istat">${u.d}${upPreview(u)}</div></div><button class="btn sm" data-act="up" data-arg="${u.k}" ${max||S.stones<c?'disabled':''}>${max?'已圆满':fmt(c)+' 灵石'}</button></div>`;}).join('')}
  <p class="tip">${S.rebirth?'第 '+(S.rebirth+1)+' 世 · 仙缘 +'+(S.rebirth*25)+'% · ':''}修为只从历练和丹药来：打怪、委托、剧情直接涨修为；服丹得药力，打坐（点画面）把药力炼成修为。每三层一道瓶颈，要去闯一场历练。丹药吃多了积丹毒，满了要停药。跨大境界要亲手冲关。</p>`;
let breakSig='';
function breakHTML(){const ni=nextInfo(),full=S.qi>=needQ();
  if(ni.final)return `<div class="t">大罗已至圆满。归墟之下还有一道门，推开它就是新的一世。</div><div class="row"><button class="btn gold" data-act="break" ${full?'':'disabled'}>轮回</button></div>`;
  if(!ni.major&&ni.bn)return `<div class="t">下一层：<em>${ni.name}</em></div><div class="t gate">瓶颈·${ni.bn}：${BN_TIP[ni.bi]}${full?'':'（先把这一层的修为攒满）'}</div><div class="row"><button class="btn ${full?'gold':''}" data-act="bnGo" ${full?'':'disabled'}>闯关历练</button></div>`;
  if(!ni.major)return `<div class="t">下一层：<em>${ni.name}</em>　修为满后自动突破</div>`;
  if(ni.gate)return `<div class="t">下一境：<em>${ni.name}</em></div><div class="t gate">${ni.capped?capMsg():ni.wuG?'瓶颈：感悟不足（'+(S.wu||0)+' / '+ni.wuG+'）。交委托、玩小游戏、经历奇遇和剧情，都能增长感悟。光靠打坐，破不了大境界。':ni.fs?(ni.gate===RJ_GATE?'瓶颈：人间未了。先走完「人间篇」（卷宗里的新篇章）':'瓶颈：天门未开。先走完主线终章「灵源」'):`瓶颈：需先在「${ZONES[ni.gz].n}」探索到尽头，击败「${ni.gate}」`}</div>`;
  return `<div class="t">下一境：<em>${ni.name}</em>　成功率 <em>${Math.round(ni.ch*100)}%</em>　失败散去四成灵气</div>
   <div class="row"><button class="btn ${full?'gold':''}" data-act="break" ${full?'':'disabled'}>${ni.fs?'飞升 · 破天门':'冲击'+REALMS[STAGES[S.stage+1].r]}</button>
   ${S.pills>0?`<label class="pill"><input type="checkbox" id="usePill" ${S.usePill?'checked':''}>服用破境丹 +25%（余 ${S.pills}）</label>`:''}</div>`;}

function npcMark(k){return QUESTS.some(q=>q.npc===k&&qSt(q.id)==='ready')?'?':QUESTS.some(q=>q.npc===k&&qAvail(q))?'!':'';}
function bannerHTML(){if(!S.special)return '';const z=S.special==='zhou';const inTown=WD.M&&WD.M.kind==='town';
  return `<div class="wbanner"><div class="t">${z?'约战：周烈':'天穹追兵来袭'}<small>${z?'他在站台中央等你，走过去和他说话。':'灵光外泄满盈，温养已停止。追兵就在站台东侧。'}</small></div>${inTown?'':'<button class="btn sm red" data-act="home">回站</button>'}</div>`;}
VIEWS.clan=()=>clanView();
VIEWS.world=()=>`<div class="wv" id="wv"><canvas id="wc"></canvas><div class="wlab" id="wlab"></div>
  <div class="whud"><div class="wloc"><b id="wLoc"></b><small id="wSub"></small></div>
   <div class="wbars"><div class="wb"><span>血</span><i class="hb"><i id="wHp"></i></i></div><div class="wb"><span>灵</span><i class="mb"><i id="wMp"></i></i></div><div class="wmeds">疗伤药 ${S.meds} · 清心丹 ${S.mps}</div></div></div>
  ${bannerHTML()}${omenHTML()}
  ${goalsHTML()}
  <div class="wbtns"><button class="btn sm" data-act="travel">地图</button>${S.seen.includes('v2_1')?'<button class="btn sm" data-act="jh">江湖</button>':''}${abilBtns()}${WD.M&&WD.M.kind==='abyss'?'<button class="btn sm red" data-act="abyssAuto">自动闯关</button>':''}${S.bossDown.length||S.abyss>0?'<button class="btn sm gold" data-act="sweep">扫荡</button>':''}<button class="btn sm ghost" data-act="home" id="wHome" hidden>回站</button></div>
  <div class="whint">点地面行走 · 点人物交谈 · 碰到妖兽进入战斗</div>
  <div class="travel" id="travel" hidden></div><div class="wfade" id="wfade"></div></div>`;

VIEWS.jade=()=>{if(!F('dongtian'))return `<div class="stage jstage"><canvas class="bgc" data-scene="dongtian"></canvas></div><p class="empty">玉简里似乎还藏着什么。继续修炼，墨老会告诉你的。（修炼至炼气七层，或在地铁站斩妖六只）</p>`;
  const n=jSlots(),now=S.dt.slots;let rows='';
  for(let i=0;i<n;i++){const o=now[i];
    if(o){const ready=o.left<=0,p=1-o.left/o.dur;rows+=`<div class="jslot ${ready?'ready':''}"><div class="ic">${o.kind==='item'?SLOTN[o.item.slot][0]:o.kind==='stones'?'石':'丹'}</div><div class="in"><div class="nm">${esc(o.label)}</div><div class="sub" data-jt="${i}">${ready?'温养完成':(jHalted()?'已停滞 · ':'')+'还需 '+fmtT(o.left)}</div><div class="bar"><i data-jb="${i}" style="width:${p*100}%"></i></div></div>${ready?`<button class="btn sm gold" data-act="jtake" data-arg="${i}">收取</button>`:''}</div>`;}
    else rows+=`<div class="jslot"><div class="ic">·</div><div class="in"><div class="nm">空玉台</div><div class="sub">放入丹药翻倍，装备升品，灵石增值</div></div><button class="btn sm" data-act="jpick">放入</button></div>`+(JPICK&&i===now.length?jPicker():'');}
  return `<div class="stage jstage"><canvas class="bgc" data-scene="dongtian"></canvas><div class="jinfo"><div><div style="font-family:var(--f-brush);font-size:22px">玉简洞天</div><div style="font-size:12px;color:var(--mist)">第 ${S.dt.lv} 重 · 玉台 ${n} 方</div></div>
   <div class="expo"><div class="l">灵光外泄 ${S.expo}%</div><div class="hp"><i style="width:${S.expo}%"></i></div></div></div></div>
  ${jHalted()?`<div class="banner" style="margin-top:10px"><div class="t">洞天停转<small>天穹追兵找上门了。回青石站击退追兵，外泄清零后才能继续温养。</small></div></div>`:''}
  <div class="jslots">${rows}</div>
  <h2 class="sec" style="margin-top:20px">温养规则</h2>
  <div class="row2"><div class="in"><div class="iname">玉简升重 <span class="lv">第 ${S.dt.lv} 重</span></div><div class="istat">温养更快；第 2、5、8 重各多一方玉台；第 3 重起丹药有机会一变三</div></div><button class="btn sm" data-act="jup" ${S.stones>=jUpCost()&&S.dt.lv<9?'':'disabled'}>${S.dt.lv>=9?'已圆满':fmt(jUpCost())+' 灵石'}</button></div>
  <p class="note">丹药 ×2 · 装备升一品（仙品则精炼 +20%）· 灵石 ×${(1.6+.05*S.dt.lv).toFixed(2)}。每次收取，灵光外泄约 +${Math.max(5,Math.round(18*(1-.12*S.ups.lianxi)))}%，满了天穹会就会找上门。</p>`;};
function jPicker(){let r='';
  if(S.pills>0)r+=`<div class="row2"><div class="in"><div class="iname">破境丹 ×${S.pills}</div><div class="istat">${fmtT(jDur('pill'))} · 一颗变两颗</div></div><button class="btn sm" data-act="jput" data-arg="pill">放入</button></div>`;
  if(S.qiPills>0)r+=`<div class="row2"><div class="in"><div class="iname">聚气丹 ×${S.qiPills}</div><div class="istat">${fmtT(jDur('qi'))} · 一颗变两颗</div></div><button class="btn sm" data-act="jput" data-arg="qi">放入</button></div>`;
  if(S.stones>=20)r+=`<div class="row2"><div class="in"><div class="iname">灵石 ${fmt(Math.floor(S.stones*.5))}</div><div class="istat">${fmtT(jDur('stones'))} · 放入当前灵石的一半</div></div><button class="btn sm" data-act="jput" data-arg="stones">放入</button></div>`;
  S.bag.slice().sort((a,b)=>b.r-a.r||power(b)-power(a)).slice(0,12).forEach(it=>{r+=`<div class="row2 r-${RAR[it.r].c}"><div class="in"><div class="iname">${itemName(it)}</div><div class="istat">${fmtT(jDur('item',it))} · ${it.r<3?'升为'+RAR[it.r+1].n+'品':'精炼 +1'}</div></div><button class="btn sm" data-act="jput" data-arg="item:${it.id}">放入</button></div>`;});
  return `<div class="picker">${r||'<div class="empty">没有可温养的东西。去江湖打装备，或在行囊的坊市买丹药。</div>'}</div>`;}
VIEWS.bag=()=>{const st=stats();const bag=S.bag.slice().sort((a,b)=>better(b)-better(a)||b.r-a.r||power(b)-power(a));const worse=S.bag.filter(it=>!better(it)&&!it.uniq&&!(it.gems&&it.gems.length)).length;
  const extra=[st.ls&&'吸血 '+Math.round(st.ls*100)+'%',st.cd&&'暴伤 +'+Math.round(st.cd*100)+'%',st.pen&&'破甲 '+Math.round(st.pen*100)+'%',st.dr&&'坚韧 '+Math.round(st.dr*100)+'%',st.dodge&&'闪避 '+Math.round(st.dodge*100)+'%',st.spd&&'速度 +'+Math.round(st.spd),st.luck&&'福缘 +'+Math.round(st.luck*100)+'%'].filter(Boolean);
  return `<h2 class="sec">法身 <small>战力 <b>${fmt(myCP())}</b> · 攻 ${fmt(st.atk)} · 防 ${fmt(st.def)} · 血 ${fmt(st.hp)} · 暴击 ${(st.crit*100).toFixed(1)}%</small></h2>${extra.length?`<p class="note">${extra.join(' · ')}</p>`:''}
  <div class="slots">${SLOT5.map(k=>{const it=S.gear[k];return `<div class="slot ${it?'r-'+RAR[it.r].c:''}"><div class="sl">${SLOTN[k]}</div>${it?`<div class="sn">${itemName(it)}</div><div class="ss">${statText(it).replaceAll('　','<br>')}</div>${affHTML(it)}${it.so?`<button class="btn sm ghost xs" data-act="inlay" data-arg="${it.id}">镶嵌</button>`:''}`:'<div class="ss">空</div>'}</div>`;}).join('')}</div>
  ${bookHTML()}${gemHTML()}
  ${danHTML()}
  <h2 class="sec">坊市 <small>${disc()<1?'红鹞商队给你打 '+Math.round(disc()*100)/10+' 折':'红鹞商队'}</small></h2>
  <div class="row2"><div class="in"><div class="iname">${ico('pojing')}破境丹 <span class="lv">持有 ${S.pills}</span></div><div class="istat">冲击大境界时服用，成功率 +25%</div></div><button class="btn sm" data-act="buyPill" ${S.stones>=pillCost()?'':'disabled'}>${fmt(pillCost())} 灵石</button></div>
  <div class="row2"><div class="in"><div class="iname">${ico('juqi')}聚气丹 <span class="lv">持有 ${S.qiPills}</span></div><div class="istat">服用得药力（本境界修为的三成），打坐炼化；丹毒 +8</div></div><div class="ibtn">${S.qiPills?'<button class="btn sm ghost" data-act="useQi">服用</button>':''}<button class="btn sm" data-act="buyQi" ${S.stones>=qiPillCost()?'':'disabled'}>${fmt(qiPillCost())} 灵石</button></div></div>
  <div class="row2"><div class="in"><div class="iname">疗伤药 <span class="lv">持有 ${S.meds}</span></div><div class="istat">战斗中恢复同伴 50% 生命；平时服用回满生命</div></div><div class="ibtn">${S.meds&&(S.hpF??1)<1?'<button class="btn sm ghost" data-act="useMed">服用</button>':''}<button class="btn sm" data-act="buyMed" ${S.stones>=medCost()?'':'disabled'}>${fmt(medCost())} 灵石</button></div></div>
  <div class="row2"><div class="in"><div class="iname">清心丹 <span class="lv">持有 ${S.mps}</span></div><div class="istat">战斗中恢复 60% 灵力，施展法术用</div></div><button class="btn sm" data-act="buyMp" ${S.stones>=medCost()?'':'disabled'}>${fmt(medCost())} 灵石</button></div>
  <h2 class="sec"><span>行囊 <small>${S.bag.length}/${BAG_MAX}</small></span><span class="ibtn">${worse?`<button class="btn sm ghost" data-act="sellWorse">出售 ${worse} 件较弱装备</button>`:''}${S.bag.length?'<button class="btn sm ghost" data-act="bagTidy">整理</button>':''}</span></h2>
  ${bag.length?bag.slice(0,BAG_SHOW).map(it=>{const up=better(it);return `<div class="row2 r-${RAR[it.r].c}"><div class="in"><div class="iname">${itemName(it)}${up?'<span class="up">▲ 更强</span>':''}</div><div class="istat">${SLOTN[it.slot]}　${statText(it)}</div>${affHTML(it)}</div>
   <div class="ibtn">${it.so?`<button class="btn sm ghost" data-act="inlay" data-arg="${it.id}">镶</button>`:''}<button class="btn sm ${up?'':'ghost'}" data-act="equip" data-arg="${it.id}">装备</button><button class="btn sm ghost" data-act="sell" data-arg="${it.id}">售 ${fmt(it.sell)}</button></div></div>`;}).join('')+(bag.length>BAG_SHOW?`<button class="btn ghost" style="width:100%;margin-top:8px" data-act="bagMore">再显示 ${Math.min(80,bag.length-BAG_SHOW)} 件（共 ${bag.length} 件）</button>`:''):'<div class="empty">空空如也。去江湖里打妖兽、开宝箱，有几率得到装备，首领必掉。</div>'}`;};

const qZone=q=>{const o=q.obj;if(o.type==='fight'||o.type==='ev'||o.type==='game')return -1;return o.z!==undefined?o.z:ZONES.findIndex(z=>z.mobs.includes(o.mob));};
const medCost=()=>Math.ceil(4*Math.pow(2.6,Math.min(maxZone(),6))*disc());
const JOURNAL_OPEN=new Set();let BAG_SHOW=80;
const SAVE_TITLES={world:'江湖',cult:'修炼',jade:'玉简',bag:'行囊',clan:'行社',story:'卷宗'};
let SAVE_BACK={tab:'world',scroll:0};
function journalFold(key,title,count,html){return `<details class="journal-fold" data-fold="${key}" ${JOURNAL_OPEN.has(key)?'open':''}><summary><span>${title}</span><small>${count}</small></summary><div class="journal-fold-body">${html}</div></details>`;}
function chapterHTML(ch){const seen=S.seen.includes(ch.id),pend=S.pending.includes(ch.id),cls=(pend?'new':seen?'seen':'lock')+(ch.side?' side':'');
 return `<div class="ch ${cls}"><div class="th"><canvas data-scene="${ch.bg}"></canvas><span>${pend||seen?ch.g:''}</span></div><div><div class="ct">${pend||seen?ch.title:ch.hid?'隐秘·？？？':(ch.side?'支线·？？？':'主线·？？？')}</div><div class="ch-h">${pend?(ch.side?'支线剧情':'主线剧情'):seen?(ch.side?'支线 · 已读':'主线 · 已读'):ch.hid?'只有特定的机缘才能触发':'开启条件：'+chHint(ch)}</div></div>
 ${pend?`<button class="btn sm gold" data-act="play" data-arg="${ch.id}">观看</button>`:seen?`<button class="btn sm ghost" data-act="play" data-arg="${ch.id}">重温</button>`:''}</div>`;}
VIEWS.story=()=>{const act=QUESTS.filter(q=>['on','ready'].includes(qSt(q.id))).sort((a,b)=>(qSt(b.id)==='ready')-(qSt(a.id)==='ready'));const done=QUESTS.filter(q=>qDone(q.id)).length;
 const fresh=STORY.filter(ch=>S.pending.includes(ch.id)),read=STORY.filter(ch=>S.seen.includes(ch.id)&&!S.pending.includes(ch.id)),locked=STORY.filter(ch=>!ch.rw&&!S.seen.includes(ch.id)&&!S.pending.includes(ch.id)&&!(ch.gone&&ch.gone()));
 const relations=`${bondHTML()}  <h2 class="sec">声望 <small>名号「${stTier()}」 · 人口 ${S.pop}</small></h2>
  <div class="row2"><div class="in"><div class="iname">青石站 <span class="lv">${S.rep.station}</span></div><div class="istat">声望越高，铁叔每天送来的补给越多。</div></div></div>
  <div class="row2"><div class="in"><div class="iname">红鹞商队 <span class="lv">${S.rep.caravan}</span></div><div class="istat">坊市折扣 ${Math.round((1-disc())*100)}%</div></div></div>
  <div class="row2"><div class="in"><div class="iname">天穹会 <span class="lv">${S.rep.tq}</span></div><div class="istat">${S.rep.tq<=-4?'他们已经把你列为头号仇敌。':S.rep.tq<0?'他们记住了你的名字。':'他们还不太在意你。'}</div></div></div>
  <div class="karma">道心：<b>${karmaName()}</b>（${S.karma>0?'+':''}${S.karma}）　${S.karma>=3?'回春更强，冲关更稳。':S.karma<=-3?'出手更狠，暴击更高。':'你的选择会改变道心。仁心与魔心各有加成。'}<br>见闻 ${S.seenEv.length} 处 · 已斩妖 ${fmt(S.slain)}</div>`;
 return `<section class="journal"><h2 class="sec" id="qlist">当前委托 <small>进行中 ${act.length} · 已完成 ${done}</small></h2>
  ${act.length?act.map(q=>{const st=qSt(q.id);return `<div class="qcard ${st==='ready'?'ready':''}"><div class="in"><div class="iname">${q.title}<span class="lv">${NPCS[q.npc].name}</span></div><div class="istat">${q.desc}</div><div class="istat qp">${qProgText(q)}</div></div>
    ${st==='ready'?`<button class="btn sm gold" data-act="goTalk" data-arg="${q.npc}">交付</button>`:qZone(q)>=0?`<button class="btn sm ghost" data-act="goz" data-arg="${qZone(q)}" ${zoneUnlocked(qZone(q))?'':'disabled'}>前往</button>`:q.obj.type==='fight'?`<button class="btn sm red" data-act="home">回站</button>`:q.obj.type==='game'?`<button class="btn sm gold" data-act="qgame" data-arg="${q.id}">挑战</button>`:''}</div>`;}).join(''):'<p class="empty">在青石站走走，和大家聊聊。头上有「!」的人有事相托，「?」的人在等你回话。</p>'}
 <h2 class="sec">新的篇章 <small>${fresh.length?'待看 '+fresh.length+' 段':'暂无新剧情'}</small></h2>
 ${fresh.length?['主线剧情','支线剧情'].map((label,i)=>{const chapters=fresh.filter(ch=>!!ch.side===!!i);return chapters.length?'<h3 class="sub">'+label+'</h3>'+chapters.map(chapterHTML).join(''):'';}).join(''):'<p class="empty">继续修炼与探索，新故事会在这里出现。</p>'}
 ${(typeof CANON_CAP!=='undefined'&&!S.path)?'':journalFold('ends','道途与道果',(S.path?PATHS[S.path].n+' · ':'')+'已证 '+(S.endings||[]).length+'/6',endsHTML())}
 ${Object.keys(RW).length?journalFold('rw','江湖人物志',rwSum(),rwHTML()):''}
 ${journalFold('cg','画卷',(S.cgSeen||[]).length+'/'+Object.keys(CG).length,cgHTML())}
 ${journalFold('yinguo','因果簿',(S.seeds||[]).filter(x=>!x.fired).length+' 颗种子在路上',yinguoHTML())}
 ${journalFold('relations','缘分与声望','人物与势力',relations)}
 ${journalFold('read','已读篇章',read.length+' 段',read.map(chapterHTML).join('')||'<p class="empty">还没有读完的篇章。</p>')}
 <p class="note">${yearName()} · 隐秘机缘 ${STORY.filter(c=>c.hid&&S.seen.includes(c.id)).length}/${STORY.filter(c=>c.hid).length}</p>
 ${journalFold('locked','未解锁篇章',locked.length+' 段 · 查看开启条件',locked.map(chapterHTML).join('')||'<p class="empty">所有篇章均已解锁。</p>')}
 </section>`;};
VIEWS.save=()=>`<section class="save-page">
 <div class="save-head"><h2 class="sec">存档与备份</h2><button class="btn sm ghost" data-act="saveBack">返回${SAVE_TITLES[SAVE_BACK.tab]||'江湖'}</button></div>
 <p class="note">当前：存档 ${SLOT} · ${esc(S.name)}，进度自动保存在此浏览器。</p>
 <div class="save">
  <div class="row"><button class="btn gold" data-act="export">导出并复制当前存档</button></div>
  <p class="note">清理浏览器数据会丢档。导出后请将存档码保存到备忘录，方便备份或换设备。</p>
   <label for="saveBox">存档码</label><textarea id="saveBox" placeholder="点「导出」生成存档码；或把存档码粘贴到这里再点「导入」"></textarea>
  <div class="row"><button class="btn sm ghost" data-act="import">${importArm?'确认覆盖当前进度':'导入存档码'}</button></div>
 </div>
 <h2 class="sec">存档位 <small>共 ${SLOTS} 个 · 进度独立</small></h2>
  <div class="slots3">${Array.from({length:SLOTS},(_,i)=>{const n=i+1,inf=slotInfo(n),cur=n===SLOT;
    return `<div class="sl3 ${cur?'cur':''}"><div class="no">${n}</div><div class="in">${inf?`<div class="iname">${esc(inf.name)}<span class="lv">${inf.realm}${inf.reb?' · 第'+(inf.reb+1)+'世':''}</span></div><div class="istat">${cur?'正在游玩':'上次游玩 '+ago(inf.last)}</div>`:'<div class="iname dim">空存档位</div><div class="istat">从头开一个新角色</div>'}</div>
     <div class="ibtn">${cur?'<span class="curtag">当前</span>':inf?`<button class="btn sm" data-act="slot" data-arg="${n}">读取</button><button class="btn sm ${delArm===n?'red':'ghost'}" data-act="slotDel" data-arg="${n}">${delArm===n?'确认删除':'删除'}</button>`:`<button class="btn sm gold" data-act="slot" data-arg="${n}">新开</button>`}</div></div>`;}).join('')}</div>
 <p class="note">切换时会先保存当前进度；没在玩的存档也会累积闭关收益。</p>
 <div class="row" style="margin-top:8px"><button class="btn sm ghost" data-act="sfx" id="sfxBtn">${MUTE?'音效 关':'音效 开'}</button> <button class="btn sm ghost" data-act="bgm" id="bgmBtn">${BGM.on?'音乐 开':'音乐 关'}</button></div>
 <details class="journal-fold" data-fold="save-record" ${JOURNAL_OPEN.has('save-record')?'open':''}><summary><span>修行记录与重开</span></summary><div class="journal-fold-body">
  <p class="note">已斩妖 ${fmt(S.slain)} · 引气 ${fmt(S.taps)} 次 · 击退追兵 ${S.hunts} 次 · 深渊 ${S.abyss} 层 · 第 ${S.rebirth+1} 世</p>
  <button class="btn sm reset-save ${resetArm?'red':'ghost'}" data-act="reset">${resetArm?'再点一次，清空存档 '+SLOT:'清空当前存档重来'}</button>
 </div></details>
 </section>`;
function openSaves(){if(!S.started||BT||SC||MG||!OV_FREE())return;if(TAB==='save'){closeSaves();return;}SAVE_BACK={tab:TAB,scroll:view.scrollTop};resetArm=false;importArm=false;delArm=0;TAB='save';render();view.scrollTop=0;}
function closeSaves(){resetArm=false;importArm=false;delArm=0;TAB=SAVE_BACK.tab;render();view.scrollTop=SAVE_BACK.scroll;$('#saveOpen').focus();}

function paintAll(){view.querySelectorAll('canvas[data-scene]').forEach(cv=>paintTo(cv,cv.dataset.scene));}
function render(){if(S.started&&!(S.ppl&&S.ppl.length))pplInit();const prev=view.dataset.tab===TAB?view.scrollTop:0;view.innerHTML=VIEWS[TAB]();view.dataset.tab=TAB;view.classList.toggle('full',TAB==='world');view.scrollTop=TAB==='world'?0:prev;
  document.querySelectorAll('.tab').forEach(b=>{b.setAttribute('aria-selected',b.dataset.tab===TAB);});
  $('#saveOpen').setAttribute('aria-pressed',String(TAB==='save'));
  breakSig='';if(TAB==='world')wBind();requestAnimationFrame(()=>{paintAll();});live();}
function live(){timeTick();const need=needQ();$('#saveOpen').disabled=!S.started;
  $('#hName').textContent=(S.name||'无名')+(S.rebirth?' · 第'+(S.rebirth+1)+'世':'');$('#hRealm').textContent=stName();
  $('#hStones').textContent=fmt(S.stones);$('#hKarma').textContent=karmaName();$('#hQi').style.width=Math.min(100,S.qi/need*100)+'%';
  if(TAB==='cult'){const el=$('#cQi');if(!el)return;const p=Math.min(1,S.qi/need);el.textContent=fmt(S.qi);$('#cReq').textContent=fmt(need);
    const ir=S.yao>0?yaoRate():0;$('#cIdle').textContent=ir<10?ir.toFixed(1):fmt(ir);$('#cYao').textContent=fmt(Math.ceil(S.yao||0));$('#cTox').textContent=Math.round(S.tox||0);$('#cTox').parentNode.classList.toggle('warn',(S.tox||0)>=70);
    $('#dtP').setAttribute('stroke-dashoffset',540.35*(1-p));$('#cstage').classList.toggle('full',p>=1);
    const sig=[S.stage,S.layer,S.bnPass,p>=1,S.pills,S.usePill,S.bossDown.length,S.karma>=3].join();if(sig!==breakSig){breakSig=sig;$('#cBreak').innerHTML=breakHTML();}}
  if(TAB==='jade'){S.dt.slots.forEach((o,i)=>{const t=view.querySelector(`[data-jt="${i}"]`),b=view.querySelector(`[data-jb="${i}"]`);if(!t)return;
    if(o.left<=0){if(t.textContent!=='温养完成')render();return;}t.textContent=(jHalted()?'已停滞 · ':'')+'还需 '+fmtT(o.left);if(b)b.style.width=(1-o.left/o.dur)*100+'%';});}
  $('#tabJade').disabled=!F('dongtian');const tc=$('#tabClan');if(tc)tc.disabled=!S.clan;if(TAB==='clan')clanLive();}

/* ---------- 交互 ---------- */
const ACT={
 saveBack:()=>closeSaves(),cgView:a=>cgShow(a),gift:()=>giftOpen(),daoPick:()=>daoPick(),bgm:()=>bgmToggle(),bagMore:()=>{BAG_SHOW+=80;render();},rwTalk:a=>rwTalk(a),
 brew:a=>brewOpen(a),natal:a=>natalForge(a),natalUp:()=>natalUp(),closed:a=>closedGo(a),rest:a=>restDays(a),eatLife:()=>{if(S.lifeP>0){S.lifeP--;S.lifeB=(S.lifeB||0)+30;S.dying=0;S.agewarn=0;toast('寿元 +30 年','big');save();render();}},
 teach:a=>{const [i,h]=a.split('|');disTeach(i,h);},disTake:a=>disRecruit(+a),ending:a=>playEnding(a),goals:()=>goalsOpen(),fly:()=>flyToggle(),soul:()=>soulOut(),void:()=>voidStep(),jh:()=>jhOpen(),root:()=>openRootTest(),form:a=>{if(S.forms.includes(a)){S.form=a;toast('阵法：'+FORMS[a].n);save();render();}},sfx:()=>sfxMute(),path:()=>pathAsk(),zong:()=>zongFound(),xf:()=>playEvent('xf'+(S.flags.xfStage||1),{}),
 break:()=>breakthrough(),
 play:a=>playStory(a),talk:a=>npcTalk(a),
 travel:()=>wTravel(),tclose:()=>{const t=$('#travel');if(t)t.hidden=true;},
 tz:a=>{const t=$('#travel');if(t)t.hidden=true;if(a==='market'){if(!WD.M||!WD.M.mk)goMarket();return;}if(a==='town'){if(!WD.M||WD.M.kind!=='town'||WD.M.mk)goTown();}else{const z=+a;if(WD.M&&WD.M.kind!=='town'&&WD.M.z===z)return;goZone(z);}},
 home:()=>{if(BT)return;goTown();},
 goz:a=>{if(BT)return;TAB='world';render();goZone(+a);},
 goTalk:a=>{if(BT)return;if(TAB!=='world'||!WD.M||WD.M.kind!=='town'){TAB='world';render();if(WD.M&&WD.M.kind!=='town')goTown();}setTimeout(()=>{const e=WD.M&&WD.M.ents.find(x=>x.k===a&&x.kind==='npc');if(a==='mo'||!e){npcTalk(a);return;}wWalk(Math.round(e.x),Math.round(e.y),true,()=>{faceTo(WD.P,e);faceTo(e,WD.P);npcTalk(a);});},400);},
 equip:a=>{const i=S.bag.findIndex(x=>x.id===+a);if(i<0)return;const it=S.bag[i];S.bag.splice(i,1);if(S.gear[it.slot])S.bag.push(S.gear[it.slot]);S.gear[it.slot]=it;toast('装备 '+itemName(it));render();save();},
 sell:a=>{const i=S.bag.findIndex(x=>x.id===+a);if(i<0)return;S.stones+=S.bag[i].sell;S.bag.splice(i,1);render();save();},
 sellWorse:()=>{let g=0,n=0;S.bag=S.bag.filter(it=>{if(!better(it)&&!it.uniq&&!(it.gems&&it.gems.length)){g+=it.sell;n++;return false;}return true;});S.stones+=g;toast('出售 '+n+' 件，灵石 +'+fmt(g));render();save();},
 buyPill:()=>{const c=pillCost();if(S.stones<c)return;S.stones-=c;S.pills++;render();save();},
 buyQi:()=>{const c=qiPillCost();if(S.stones<c)return;S.stones-=c;S.qiPills++;render();save();},
 buyMed:()=>{const c=medCost();if(S.stones<c)return;S.stones-=c;S.meds++;render();save();},
 buyMp:()=>{const c=medCost();if(S.stones<c)return;S.stones-=c;S.mps++;render();save();},
 useMed:()=>{if(S.meds<1)return;S.meds--;S.hpF=1;toast('伤口好了');render();save();},
 useQi:()=>{if(S.qiPills<1)return;if((S.tox||0)>=92){toast('丹毒太重，再吃要伤根基。停几天药。','bad');return;}S.qiPills--;S.yao=(S.yao||0)+req(S.stage)*.3;toxAdd(8);toast('服下聚气丹，药力入腹。点修炼画面炼化。');render();save();},
 bnGo:()=>bnFight(),
 up:a=>{const u=UPS.find(x=>x.k===a),c=upCost(u);if(S.stones<c||(u.max&&S.ups[a]>=u.max))return;S.stones-=c;S.ups[a]++;toast(u.n+' 精进至第 '+S.ups[a]+' 重');render();save();},
 jpick:()=>{JPICK=!JPICK;render();},
 jput:a=>{if(jHalted()){toast('洞天停转中，先击退天穹追兵','bad');return;}if(a.startsWith('item:'))jPut('item',a.slice(5));else jPut(a);},
 jtake:a=>jTake(+a),
 jup:()=>{const c=jUpCost();if(S.stones<c||S.dt.lv>=9)return;S.stones-=c;S.dt.lv++;toast('玉简洞天 第 '+S.dt.lv+' 重');render();save();},

 export:()=>{S.expD=daysAll();S.expCh=S.seen.length;save();let code='';try{code='LC1.'+btoa(unescape(encodeURIComponent(JSON.stringify(S))));}catch(e){}const box=$('#saveBox');box.value=code;
   const fail=()=>{box.focus();box.select();toast('已生成，请长按全选后手动复制');};try{navigator.clipboard.writeText(code).then(()=>toast('存档码已复制，粘贴到备忘录保存'),fail);}catch(e){fail();}},
 import:()=>{const v=$('#saveBox').value.trim();if(!v){toast('先把存档码粘贴进上面的框里','bad');return;}let d=null;
   try{d=JSON.parse(decodeURIComponent(escape(atob(v.replace(/^LC1\./,'')))));}catch(e){}if(!d||typeof d.stage!=='number'){toast('存档码无法识别，请检查是否复制完整','bad');return;}if(oldSave(d)){toast('这是旧版本的存档码，新版本不再兼容','bad');return;}
   if(!importArm){importArm=true;render();$('#saveBox').value=v;return;}importArm=false;S=hydrate(d);WD.M=null;save();toast('存档已导入：'+stName(),'big');dotUpdate();render();},
 slot:a=>switchSlot(+a),
 qgame:a=>qGame(a),farm:()=>farmPick(),sweep:()=>sweepPick(),bagTidy:()=>bagTidy(),abyssAuto:()=>farmStart(7),inlay:a=>inlayOpen(+a),learn:a=>learnBook(a),fuse:a=>gemFuse(a),
 tsky:()=>{WD.tmode=WD.tmode==='sky'?'city':'sky';wTravel();},
 slotDel:a=>{const n=+a;if(n===SLOT)return;if(delArm!==n){delArm=n;render();setTimeout(()=>{if(delArm===n){delArm=0;if(TAB==='save')render();}},4000);return;}delArm=0;try{localStorage.removeItem(slotKey(n));}catch(e){}toast('存档 '+n+' 已删除');render();},
 reset:()=>{if(!resetArm){resetArm=true;render();setTimeout(()=>{if(resetArm){resetArm=false;if(TAB==='save')render();}},4000);return;}
   resetArm=false;try{localStorage.removeItem(slotKey(SLOT));}catch(e){}S=fresh();WD.M=null;TAB='world';render();intro();}
};

Object.assign(ACT,CLAN_ACT);
try{Object.defineProperty(CL_STORY.he,'apt',{get:()=>F('heRoot')?5:3,configurable:true});}catch(e){}
view.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;if(b.dataset.act!=='import')importArm=false;if(b.dataset.act!=='slotDel')delArm=0;ACT[b.dataset.act]&&ACT[b.dataset.act](b.dataset.arg,b);});
$('#saveOpen').addEventListener('click',openSaves);
view.addEventListener('toggle',e=>{const d=e.target;if(!d.matches('details[data-fold]')||!view.contains(d))return;if(d.open)JOURNAL_OPEN.add(d.dataset.fold);else JOURNAL_OPEN.delete(d.dataset.fold);if(d.open)requestAnimationFrame(paintAll);},true);
view.addEventListener('change',e=>{if(e.target.id==='usePill'){S.usePill=e.target.checked;breakSig='';live();}});
view.addEventListener('pointerdown',e=>{const st=e.target.closest('#cstage');if(!st||e.target.closest('button'))return;e.preventDefault();
  const g=refine(0,1);S.taps++;const r=st.getBoundingClientRect();
  const p=document.createElement('span');p.className='plus';p.textContent=g>0?'+'+(g<10?g.toFixed(1):fmt(g)):'药力已尽';p.style.left=(e.clientX-r.left-14)+'px';p.style.top=(e.clientY-r.top-24)+'px';st.appendChild(p);setTimeout(()=>p.remove(),920);
  if(!reduce){const cx=r.width/2,cy=r.height*.62;for(let i=0;i<7;i++){const q=document.createElement('span');q.className='pt';const a=Math.random()*6.28,d=r.width*(.35+Math.random()*.2);
    q.style.cssText=`left:${cx}px;top:${cy}px;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${i*30}ms`;st.appendChild(q);setTimeout(()=>q.remove(),900);}}
  live();});
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{if(b.disabled)return;TAB=b.dataset.tab;resetArm=false;importArm=false;JPICK=false;view.scrollTop=0;render();}));
let rsT=0;function resizeGame(){clearTimeout(rsT);rsT=setTimeout(()=>{paintAll();if(TAB==='world'){wBind();const t=$('#travel');if(t&&!t.hidden)drawTravel();}if(BT){btFit();btLayout();}if(SC&&$('#vbg'))paintTo($('#vbg'),SC.bg);},200);}
addEventListener('resize',resizeGame);window.visualViewport?.addEventListener('resize',resizeGame);

/* ---------- 随机奇遇 / 每日补给 ---------- */
function idleEventTick(dt){if(!S.started||document.hidden||!OV_FREE()||BT)return;S.evClock=(S.evClock||0)+dt;if(S.evClock<270)return;S.evClock=0;
  const pool=IDLE_EVENTS.concat(IDLE2).filter(k=>{const ee=EVENTS[k];if(!ee||(ee.need&&!safe(ee.need)))return false;const e=EVENTS[k];if(e.once&&S.seenEv.includes(k))return false;if(k==='ahe_lunch'&&!S.seen.includes('ahe'))return false;if(k==='moremory'&&S.stage<6)return false;return true;});
  if(!pool.length)return;const k=pick(pool);toast('奇遇：'+EVENTS[k].title,'查看',()=>{if(OV_FREE())playEvent(k,{});});}
function daily(){/* 补给改为每过七天送一次，见 supplyDays */}

/* ---------- 主循环 ---------- */
let lastT=performance.now(),uiAcc=0,fAcc=0;
function loop(t){const dt=Math.min(.1,(t-lastT)/1000),big=Math.min(1,(t-lastT)/1000);lastT=t;try{bgmTick(big);}catch(e){}if(S.started){refine(big);S.tox=Math.max(0,(S.tox||0)-big*.12);jTick(big);idleEventTick(big);clanTick(big);omenTick(big);timeTick(big);fAcc+=big;if(fAcc>2.5){fAcc=0;fateCheck();}}
  try{if(BT)btFrame(dt);else if(TAB==='world'&&WD.cx&&WD.M){if(OV_FREE()&&S.started)wUpdate(dt);else WD.t+=dt;wRender();}}catch(e){if(!loop.err){loop.err=1;console.error(e);}}
  uiAcc+=dt;if(uiAcc>.2){uiAcc=0;live();}requestAnimationFrame(loop);}
/* 不在的时候，世界停着：没有离线收益，日子也不会自己往前走 */
function offline(){S.last=Date.now();}
function intro(){const ov=$('#ov');ov.hidden=false;ov.className='vn';let g=S.gender||'m';
  let back=null;for(let n=1;n<=SLOTS;n++){if(n===SLOT)continue;const inf=slotInfo(n);if(inf&&(!back||inf.last>back.last))back=Object.assign({n},inf);}
  ov.innerHTML=`<canvas class="vbg" id="vbg"></canvas><div class="inner"><div class="intro"><div class="yr">二〇四九 · 灵潮${SLOT>1?' · 存档 '+SLOT:''}</div><h1>灵潮<span>修仙</span>录</h1>
   <div class="poem"><p>那一年，天裂开了一道口子。</p><p>灵气像潮水漫过城市，三年未退。</p><p>旧城地下，一座叫青石的地铁站里，住着一百四十个人。</p><p>其中一个，每天黄昏出站，去废墟里拾些还能用的东西。</p></div>
   <p class="ask">那个人——</p><div class="seg"><button data-g="m" aria-pressed="${g==='m'}">是少年</button><button data-g="f" aria-pressed="${g==='f'}">是少女</button></div>
   <p class="ask">玉简会记住这个名字。</p><input id="nmIn" maxlength="6" placeholder="写下你的名字" autocomplete="off" aria-label="你的名字"><p class="nm-err" id="nmErr" hidden>灵潮里没有无名之人。写下你的名字，再出站。</p><button class="btn gold" id="nmGo">出站</button>${back?`<button class="btn sm ghost" id="nmBack">返回存档 ${back.n}（${esc(back.name)}）</button>`:''}</div></div>`;
  requestAnimationFrame(()=>paintTo($('#vbg'),'sky'));
  ov.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{g=b.dataset.g;ov.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  const go=()=>{const v=($('#nmIn').value||'').trim().replace(/[<>&"]/g,'');if(!v){const e=$('#nmErr');e.hidden=false;const i=$('#nmIn');i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');i.focus();return;}S.gender=g;S.name=v;S.flags.v1=1;S.lastDaily=dayKey();save();playStory('prologue');};
  $('#nmGo').onclick=go;if(back)$('#nmBack').onclick=()=>switchSlot(back.n);$('#nmIn').addEventListener('keydown',e=>{if(e.key==='Enter')go();});}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{clockSecond=-1;timeTick();lastT=performance.now();offline();}});
addEventListener('pagehide',save);setInterval(()=>{if(S.started)save();},5000);
function start(data){artLoad();S=data&&data.S?hydrate(data.S):load();pplInit();TAB='world';render();dotUpdate();
  if(!S.name||!S.started){if(S.name&&!S.seen.includes('prologue'))playStory('prologue');else intro();}else{offline();daily();xlNotice();checkStory(true);}
  requestAnimationFrame(t=>{lastT=t;loop(t);});}
/* 灵潮历：顶部时钟 */
const realClock=document.createElement('div');realClock.id='realClock';realClock.setAttribute('aria-label','灵潮历');document.querySelector('#view').insertAdjacentElement('beforebegin',realClock);timeTick();
/* 卷宗·旧卷：走完一卷，就能在卷宗里从头翻阅这一卷的原文 */
const READ_DONE=[()=>S.seen.includes('v3_12'),()=>F('v4done'),()=>F('v5done'),()=>F('v6done'),()=>F('v7done'),()=>F('v8done'),()=>F('v9done'),()=>F('v10done')];
/* 旧卷的原文很大，打开时才去取 */
const NOVEL_T=['第三卷 雾港','第四卷 坠星','第五卷 河灯','第六卷 太一','第七卷 分山','第八卷 天隙','第九卷 归潮','第十卷 远岸'];
function novelsLoad(cb){if(window.LC_NOVELS)return cb();toast('正在取出旧卷……');const sc=document.createElement('script');sc.src='novels.js';sc.onload=()=>{if(window.LC_NOVELS)cb();};sc.onerror=()=>{sc.remove();toast('旧卷没取出来，稍后再试','bad');};document.head.appendChild(sc);}
function readerCard(){const V=NOVEL_T.map(title=>({title}));if(!F('v1'))return '';const ok=V.map((v,i)=>i).filter(i=>READ_DONE[i]&&safe(READ_DONE[i]));if(!ok.length)return '';
 return `<h2 class="sec">旧卷 <small>走过的路，可以从头再读一遍</small></h2><div class="closed">${ok.map(i=>`<button class="btn sm ghost" data-act="novelRead" data-arg="${i}">${esc(V[i].title)}</button>`).join('')}</div>`;}
function novelReader(volume,chapter=0){const v=window.LC_NOVELS[volume],c=v.chapters[chapter];
modal(`<h3>${esc(v.title)}</h3><h4>${esc(c.title)}</h4><p class="note">第 ${chapter+1}/${v.chapters.length} 章</p><div class="novel-text">${c.body.split(/\n\s*\n/).map(p=>'<p>'+esc(p)+'</p>').join('')}</div>`,[...(chapter>0?[{t:'上一章',fn:()=>novelReader(volume,chapter-1)}]:[]),...(chapter+1<v.chapters.length?[{t:'下一章',cls:'gold',fn:()=>novelReader(volume,chapter+1)}]:[]),{t:'合上',cls:'ghost'}]);}
ACT.novelRead=a=>novelsLoad(()=>novelReader(+a||0));
const _storyView0=VIEWS.story;VIEWS.story=()=>_storyView0()+causeHTML()+readerCard();
window.claude?.hot?.snapshot?.(()=>({S}));
LATE.forEach(f=>{try{f();}catch(e){console.error(e);}});
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
if(location.hash==='#debug')window.__lc={goZone,startBattle,mkEnemy,wTap,boonPick,RUN,stats,STORY,QUESTS,BOND,sweepGo,sweepPick,partners,advanceDays,daysAll,mkParty,retreatApply,RETREATS,retreatCost,offline,timeTick,giftPick,novelReader,needQ,stName,addQi,nextInfo,refine,bnFight,sceneCanvas,cultScene,ZONE_SCN,LIFE,lifeOf,myLife,pLife,lifeText,lifeSync,ageCheck,hydrate,STAGES,btSpr,btClose,ART_IMG,get S(){return S;},set S(v){S=v;},WD,get BT(){return BT;},ACT,playStory,playEvent,checkStory,RW,rwNext,rwTalk,personTalk,P_,mgEnd,farmStart,gameDay,dateName,chatBtn,myCP,refA,smJoin,smTaskDo,smPromote,smTasks,dbFight,dbYear,giftGive,GIFT_PILLS,wuNeed,oneYear:()=>oneYear(),render,jTick,save,npcTalk,startBattle,mkEnemy,goZone,goTown,wEncounter,btCmdTap,mkCustom,openMini,farmStart,guiShop,enterRift,mkUnique,mkItem,clRecruit,openClanFound,clanHydrate,clSend,get FARM(){return FARM;},pplInit,simYears,closedGo,sectFight,jhOpen,goMarket,openRootTest,pickRoot,breakthrough,startJie,ceremony,natalForge,brewOpen,disRecruit,fatePlay,playEnding,soulOut,flyToggle,goalsOpen,bntFight,xfGet,learnForm,pathAsk,STORY,EVENTS,stats,get SC(){return SC;}};

function cultMore(){const R=realmIdx();return `${daoHTML()}${injOn()?`<div class="banner"><div class="t">重伤未愈<small>吐纳 -40%、生命 -20%，冲关不得。还要 ${injLeft()+' 天'}。</small></div></div>`:''}
 <h2 class="sec">灵根 · 流派 <small>${rootName()}</small></h2>${S.root?`<p class="note">${ROOTS[S.root].d}${S.root2?'；'+ROOTS[S.root2].d:''}<br>流派：${ROOTS[S.root].tip}</p>
 <div class="skl">${SKILLS.filter(s=>s.root&&hasRoot(s.root)).map(s=>`<span class="${realmIdx()>=(s.rl||0)?'':'dim'}"><i class="elg" style="--ec:${EL[s.el].c}">${EL[s.el].n}</i>${s.n}${realmIdx()>=(s.rl||0)?'':'（'+REALMS[s.rl]+'）'}</span>`).join('')}</div>
 <h3 class="sub">阵法 <small>战斗前布下，影响全队</small></h3><div class="forms">${S.forms.map(k=>`<button class="fm ${S.form===k?'on':''}" data-act="form" data-arg="${k}"><b>${FORMS[k].n}</b><small>${FORMS[k].d}</small></button>`).join('')}</div>
 <details class="combo"><summary>五行连携一览</summary><p>雷 打 <b>灼烧</b> → 爆燃（引爆全部灼烧，波及全场）<br>雷 打 <b>潮湿</b> → 导电（连锁到其他敌人）<br>剑／金 打 <b>冻结</b> → 碎冰（伤害 ×2.5）<br>火 打 <b>缠绕</b> → 燎原（灼烧蔓延全场）<br>冰 打 <b>潮湿</b> → 冰封（立刻冻结）<br>土 打 <b>感电</b> → 震荡（震晕）<br>水 打 <b>灼烧</b> → 蒸腾（按灼烧层数增伤）<br>五行相克：金克木、木克土、土克水、水克火、火克金；雷克水，火融冰。克制 ×1.5，同属性 ×0.6。<br>同伴也有五行：周烈火、苏绾雷、宁玄金、陈默土、零号雷、红鹞木——配合他们打连携。</p></details>`:`<p class="note">${S.stage>=3?'还没有测过灵根。灵根决定你的五行、法术和流派。':'修炼到炼气四层，墨老会替你测灵根。'}</p>${S.stage>=3?'<button class="btn gold" data-act="root">测灵根</button>':''}`}
 ${shenHTML()}${natalHTML()}${closedHTML()}${danHTML()}${pityHTML()}`;}
