/* ================= 江湖：宗门 · 坊市 · 悬赏 · 江湖榜 · 人物 · 隐藏剧情 · 奇遇 · 目标 ================= */
const SECTS={
 tiegu:{n:'铁骨帮',el:'tu',st:10,mech:'jinshen',book:'tiegu',form:'jingang',align:'中',d:'以力入道，横练筋骨。长老以上「金身」刀枪难入——先破其甲。',ally:{defP:.08},lt:'帮主'},
 baicao:{n:'百草谷',el:'mu',st:13,mech:'heal',book:'baicao',form:'liangyi',align:'正',d:'丹道世家。谷主每回合回春——灼烧能断她的生机。',ally:{healP:.15},lt:'谷主'},
 chixiao:{n:'赤霄宗',el:'huo',st:16,mech:'fireImm',book:'chixiao',form:'tiangang',align:'正',d:'以火入剑，不惧灼烧，出手带火——水能克之。',ally:{atkP:.06},lt:'宗主'},
 xuanshui:{n:'玄水门',el:'shui',st:20,mech:'shuijing',book:'xuanshuij',form:'juling',align:'正',d:'水镜反射三成伤害——先用雷让她感电，水镜即破。',ally:{mp:.15},lt:'门主'},
 youming:{n:'幽冥殿',el:'bing',st:24,mech:'summon',book:'youming',form:'jiugong',align:'魔',d:'不惧霜冻，每三回合招来鬼仆——速战速决。',ally:{ls:.05},lt:'殿主'},
 tianqiong:{n:'天穹会',el:'lei',st:29,mech:'shuijing',book:'tianqiong',form:'wuxing',align:'魔',d:'会首两重真身，水镜护体——雷破镜，五行轮转压之。',ally:{critA:.05},lt:'会首'}
};
function sectBg(k){return ['baicao','chixiao','xuanshui','youming'].includes(k)?k:'shanmen';}
const SECT_ORD=['tiegu','baicao','chixiao','xuanshui','youming','tianqiong'];
const SECT_LOOK={tiegu:['铁骨帮众','铁骨长老'],baicao:['百草弟子','百草长老'],chixiao:['赤霄弟子','赤霄长老'],xuanshui:['玄水弟子','玄水长老'],youming:['幽冥鬼卒','幽冥护法'],tianqiong:['天穹追兵','天穹长老']};
const RANKN=['弟子','长老','宗主'];
const sectBeat=k=>!!(S.sects[k]&&S.sects[k].beat>=3);
const zOfStage=st=>st>=38?Math.min(10,8+Math.floor((st-38)/5)):Math.max(0,Math.min(6,Math.floor((st-1)/5)));
function sectLead(k){return S.ppl.find(p=>p.sect===k&&p.lead&&p.alive);}
function sectFoe(k,rank){const D=SECTS[k],lead=sectLead(k);const st=rank===2&&lead?Math.max(lead.st,D.st+2):D.st+[-3,0,3][rank];
 const nm=rank===2?(lead?lead.n:D.n+D.lt):D.n+RANKN[rank],look=rank===2&&lead&&LOOK[lead.n]?lead.n:SECT_LOOK[k][rank?1:0];
 const e=mkCustom(zOfStage(st),{look,name:nm,st,m:[1.05,1.4,1.9][rank],boss:rank===2});e.el=D.el;e.human=1;e.sect=k;if(rank>=1)e.mech=D.mech;
 if(rank===2&&k==='tianqiong'){e.p2=1;e.n2='顾长风·雷霆真身';}if(k==='youming')e.demon=1;
 e.atkSt={huo:['burn',1],bing:['chill',1],shui:['wet',2],lei:['shock',1]}[D.el]||null;return e;}
function sectFight(k){const R=S.sects[k]||(S.sects[k]={beat:0,rel:null});if(R.rel==='vassal'||R.rel==='gone'){toast('这个宗门已经不在了','bad');return;}const rank=Math.min(2,R.beat);
 const foes=[sectFoe(k,rank)];if(rank===2)foes.push(sectFoe(k,1));if(rank===0)foes.push(sectFoe(k,0));jhClose();
 startBattle(foes,{bg:sectBg(k),noFlee:rank===2,onWin:()=>sectWin(k,rank),onLose:()=>{injSet(2);toast(SECTS[k].n+'：「回去再练几年吧。」（轻伤，要养两天）','bad');save();}});}
function sectWin(k,rank){const D=SECTS[k],R=S.sects[k];const first=R.beat<=rank;if(first){R.beat=rank+1;wuAdd(6);}S.fame+=[3,8,25][rank];let L=[];
 if(first&&rank===0)L.push(gS(zsAt(zOfStage(D.st),8)),gMat('he',3));
 if(first&&rank===1){L.push(learnForm(D.form)||gS(zsAt(zOfStage(D.st),12)));}
 if(first&&rank===2){S.books[D.book]=(S.books[D.book]||0)+1;L.push(' 获得'+D.n+'镇派绝学 '+BOOKS[D.book].n+'（在「囊」里研读）。');news(S.name+'挑落'+D.n+D.lt+'，名动江湖。',1);if(SECT_ORD.every(sectBeat))checkStory();}
 save();const msg=L.join('').trim();
 if(rank===2&&first)setTimeout(()=>sectChoice(k,msg),300);else setTimeout(()=>{modal(`<h3>${D.n} · 胜</h3><p>${rank===0?'弟子们面面相觑。':'长老收起兵刃，抱了抱拳。'}${msg?'<br>'+esc(msg):''}</p><p class="note">江湖声望 +${[3,8,25][rank]}${first&&rank<2?' · 下一阵：'+D.n+RANKN[rank+1]:''}</p>`,[{t:'好',cls:'gold'}]);},300);}
function sectChoice(k,msg){const D=SECTS[k],R=S.sects[k],lead=sectLead(k);
 modal(`<h3>${D.n} · 宗主落败</h3><p>${lead?esc(lead.n):D.lt}半跪在地，满座寂然。所有人都在等你开口。</p><p class="note">${esc(msg)}</p>`,[
  {t:'点到为止，结为盟友',cls:'gold',fn:()=>{R.rel='ally';if(lead)lead.att=Math.min(100,lead.att+30);S.dao.zheng+=2;kar(1);news(S.name+'与'+D.n+'结盟。',1);toast('与'+D.n+'结盟：获得盟友加成','big');save();render();}},
  {t:'索要镇派之宝',cls:'',fn:()=>{R.rel='hostile';if(lead)lead.att=-70;S.dao.mo+=1;const t=gItem(4)+gS(zsAt(zOfStage(D.st),40));seedAdd('sect',null,S.year+10+Math.floor(Math.random()*10),{sect:k});news(D.n+'被'+S.name+'强取镇派之宝，'+D.n+'上下引为奇耻。',1);modal('<h3>强取</h3><p>他们把东西捧了出来。没有人说话。'+esc(t)+'</p><p class="note">'+D.n+'记住了这件事。</p>',[{t:'走',cls:'red'}]);save();render();}}]);}

/* ---------- 江湖榜 ---------- */
function jhList(){const L=S.ppl.filter(p=>p.alive&&p.known&&p.st>=0).map(p=>({n:p.n,st:p.st,p,sect:p.sect}));L.push({n:S.name,st:S.stage,me:1,sect:null});
 return L.sort((a,b)=>b.st-a.st||(a.me?1:0)-(b.me?1:0));}
const JH_POP=20000,jhVirt=()=>Math.round(JH_POP*Math.pow(.72,S.stage+1));
const jhRank=()=>jhList().findIndex(x=>x.me)+1+jhVirt();

/* ---------- 悬赏 ---------- */
const BNT_K=[{k:'mo',n:'魔修',why:['血祭了两个村子','专挑孩子下手','在城外布下噬魂阵'],look:'虚无行者',demon:1},{k:'rob',n:'劫修',why:['劫了红鹞商队的货','在官道上杀人越货','抢了百草谷的药'],look:'黑市打手'},{k:'trait',n:'叛徒',why:['盗走了宗门秘典','出卖了同门','投了天穹会'],look:'天穹追兵'}];
function bntList(){const d=dayKey();if(S.bnt&&S.bnt.day===d)return S.bnt.L;const L=[];for(let i=0;i<3;i++){const K=pick(BNT_K),st=Math.max(1,Math.min(LAST,S.stage+[-2,0,3][i]));
  L.push({id:i,k:K.k,n:pick(CL_SUR.split(''))+pick(['屠','枭','煞','狼','七','九','蛇','鬼'])+pick(['','子','郎','娘']),why:pick(K.why),look:K.look,demon:K.demon,st,done:0,tier:i});}S.bnt={day:d,L};return L;}
function bntFight(i){const b=bntList()[i];if(!b||b.done)return;jhClose();const e=mkCustom(zOfStage(b.st),{look:b.look,name:b.n,st:b.st,m:[1.2,1.6,2.1][b.tier],boss:b.tier===2});e.human=1;if(b.demon)e.demon=1;
 startBattle([e],{bg:WD.M&&WD.M.kind!=='town'?WD.M.z:'market',onWin:()=>{b.done=1;wuAdd(4);const k=S.path==='zheng'?1.5:1;S.stones+=Math.ceil(zsAt(zOfStage(b.st),[6,10,18][b.tier])*k);S.fame+=[2,4,8][b.tier];
   let extra='';if(b.k==='mo'){S.dao.zheng+=1;kar(1);news(b.n+'伏诛。附近的村子保住了。');if(Math.random()<.4){const p=mkPerson({n:pick(CL_SUR.split(''))+pick(['无','血','夜','孤'])+pick(['尘','衣','生','影']),st:Math.max(0,b.st-8),age:14,tal:.95,att:-80,known:false,goal:'为师父报仇'});seedAdd('modis',p.id,S.year+15+Math.floor(Math.random()*20),{mname:b.n});extra='\n（逃走的人里，好像有一个孩子。）';}}
   if(b.k==='trait'){const sk=pick(SECT_ORD);S.sects[sk]=S.sects[sk]||{beat:0,rel:null};const lead=sectLead(sk);if(lead)lead.att=Math.min(100,lead.att+10);extra='\n'+SECTS[sk].n+'记下了你的人情。';}
   save();modal(`<h3>悬赏 · ${esc(b.n)}</h3><p>赏金已到手。江湖声望 +${[2,4,8][b.tier]}${esc(extra)}</p>`,[{t:'好',cls:'gold'}]);}});}

/* ---------- 坊市 ---------- */
const SHOP_MATS=['cao','he','gu','tie'];
const matPrice=k=>Math.ceil(zsAt(maxZone(),{cao:.5,he:.7,gu:.5,tie:.9,huo:1.2,lei:1.4,xing:1.8,xue:3,ru:4}[k]||1));
const fuPrice=k=>Math.ceil(zsAt(maxZone(),{lei:2,huo:1.6,ding:2.4,hu:1.8,po:2}[k]));
function qiStock(){const d=dayKey();if(S.qiS&&S.qiS.day===d)return S.qiS.L;const z=maxZone();S.qiS={day:d,L:[0,1,2].map(i=>{const it=mkItem(z,true,{r:i===2?3:2,slot:pick(SLOT5)});return {it,p:Math.ceil(it.sell*(i===2?6:4))};})};return S.qiS.L;}
function aucStock(){const d=dayKey();if(S.auc&&S.auc.day===d)return S.auc.L;const L=[],z=maxZone(),rv=()=>{const P=S.ppl.filter(p=>p.alive&&p.known&&p.st>=0&&!p.fr);return P.length?pick(P).id:null;};
 if((S.xf||0)<5&&!F('xf_auc'))L.push({k:'xf',n:'一卷残破的古图',d:'上面画着一座看不懂的山。卖家说是从废城里挖出来的',p:zsAt(z,30)});
 const fl=Object.keys(FORMS).filter(f=>!S.forms.includes(f)&&f!=='jiugong');if(fl.length)L.push({k:'form',f:pick(fl),n:'阵图',d:'',p:zsAt(z,40)});
 L.push({k:'item',n:'传世之兵',d:'仙品之上，有传说的气息',p:zsAt(z,70)});if(L.length<3)L.push({k:'gem',n:'绝品宝石',d:'',p:zsAt(z,35)});
 L.forEach(l=>{l.rv=rv();l.max=Math.ceil(l.p*(1.25+Math.random()*1.1));l.cur=l.p;l.st=0;if(l.k==='form'){l.n='阵图 ·《'+FORMS[l.f].n+'》';l.d=FORMS[l.f].d;}});S.auc={day:d,L:L.slice(0,3)};return S.auc.L;}
function aucBid(i,pct){const l=aucStock()[i];if(!l||l.st)return;const bid=Math.ceil(l.cur*(1+pct));if(S.stones<bid){toast('灵石不够','bad');return;}const rv=P_(l.rv);
 if(bid>=l.max||!rv){S.stones-=bid;l.st=1;let t='';if(l.k==='xf')t=xfGet('auc');else if(l.k==='form')t=learnForm(l.f);else if(l.k==='item')t=pushItem(mkItem(maxZone(),true,{r:4,slot:pick(SLOT5)}));else{const g=pick(['a','d','h','c'])+Math.min(5,gemTierFor(maxZone())+2);S.gems[g]=(S.gems[g]||0)+1;t='获得 '+gemName(g);}
  if(rv){rv.att-=8;news(S.name+'在拍卖行压过'+rv.n+'，以 '+fmt(bid)+' 灵石拍下'+l.n+'。');}sfx('coin');toast('拍下了！'+(rv?rv.n+'的脸色不太好看。':''),'big');save();jhRender();return;}
 l.cur=Math.min(l.max,Math.ceil(bid*(1.05+Math.random()*.15)));sfx('tap');toast(rv.n+'：「'+fmt(l.cur)+'。」');save();jhRender();}
function aucPass(i){const l=aucStock()[i];if(!l||l.st)return;l.st=2;const rv=P_(l.rv);if(rv){rv.att+=3;news(rv.n+'拍下了'+l.n+'。');}save();jhRender();}

/* ---------- 人物 ---------- */
function personTalk(p){if(!p||!p.alive)return;const Y=S.year;const rel=attName(p);
 const line=p.att<=-40?'“'+(p.goal.includes('仇')||p.goal.includes('后悔')?'等着。':'你怎么还没死？')+'”':p.att>=40?'“又见面了。”':'“'+pick(['最近江湖不太平。','有事？','我在等人。','听说你也在找东西？'])+'”';
 modal(`<h3>${esc(p.n)}</h3><p>${realmOf(p.st)}${p.sect?' · '+SECTS[p.sect].n+(p.lead?SECTS[p.sect].lt:''):''} · ${p.age} 岁（寿元 ${lifeText(pLife(p))}）</p><p>心愿：${esc(p.goal)}<br>对你：<b>${rel}</b></p><p>${esc(line)}</p>`,[
  {t:'切磋',cls:p.st>=0?'':'ghost',fn:()=>{if(p.st<0){toast(p.n+'是凡人');return;}const e=mkCustom(zOfStage(p.st),{look:LOOK[p.n]?p.n:'无名剑客',name:p.n,st:p.st,m:1.4});e.human=1;e.noLoot=1;startBattle([e],{bg:'town',onWin:()=>{p.att+=p.att<-20?-5:6;toast(p.att<-20?p.n+'更恨你了':p.n+'：「好身手。」');save();},onLose:()=>{p.att+=3;toast(p.n+'：「承让。」');save();}});}},
  {t:'赠礼 · '+fmt(zsAt(maxZone(),3))+' 灵石',fn:()=>{const c=zsAt(maxZone(),3);if(S.stones<c){toast('灵石不够','bad');return;}S.stones-=c;p.att=Math.min(100,p.att+(p.att<-40?3:10));toast(p.n+'收下了。（'+attName(p)+'）');save();}},
  {t:'告辞',cls:'ghost'}]);}
function pplHTML(){const L=S.ppl.filter(p=>p.known&&(!p.bg||p.lead||p.att)).sort((a,b)=>(b.alive-a.alive)||Math.abs(b.att)-Math.abs(a.att));
 return `<p class="note">${yearName()} · 你 ${S.age} 岁（寿元 ${lifeText(myLife())}）。人会老，会变强，也会记仇。</p>${L.map(p=>{const dead=!p.alive,mortal=p.st<0;return `<div class="row2 ppl ${dead?'dim':''} ${p.att<=-40?'foe':p.att>=40?'friend':''}"><img class="mini" src="${clSprite(p.ch&&CH[p.ch]?p.ch:'tie')}" alt=""><div class="in"><div class="iname">${esc(p.n)}<span class="lv">${dead?yearName(p.dy)+'故去':realmOf(p.st)+' · '+p.age+' 岁 / 寿元 '+lifeText(pLife(p))}</span></div>
  <div class="istat">${p.sect?SECTS[p.sect].n+(p.lead?SECTS[p.sect].lt:'')+' · ':''}${attName(p)} · ${esc(p.goal)}</div></div><div class="ibtn">${!dead&&mortal&&p.fr&&S.lifeP>0?`<button class="btn sm gold" data-act="giveLife" data-arg="${p.id}">赠寿元丹</button>`:''}${dead&&p.fr&&S.hhDan>0?`<button class="btn sm gold" data-act="revive" data-arg="${p.id}">还魂</button>`:''}</div></div>`;}).join('')}`;}
function giveLife(id){const p=P_(id);if(!p||!(S.lifeP>0))return;S.lifeP--;p.life=(p.life||75)+15;p.att=Math.min(100,p.att+20);news(S.name+'送给'+p.n+'一颗寿元丹。');toast(p.n+'多了十五年阳寿','big');save();jhRender();}
function revive(id){const p=P_(id);if(!p||p.alive||!(S.hhDan>0))return;S.hhDan--;p.alive=true;p.age=Math.min(p.age,pLife(p)-10);delete S.flags['dead_'+p.fr];news(p.n+'死而复生。',1);toast(p.n+'回来了','big');sfx('rise');save();jhRender();}

/* ---------- 江湖面板 ---------- */
let JH={tab:'shop',sub:'dan'};
const inMarket=()=>!!(WD.M&&WD.M.mk);
function jhOpen(tab,sub){if(BT)return;JH.tab=tab||JH.tab;if(sub)JH.sub=sub;let el=$('#jh');if(!el){el=document.createElement('div');el.id='jh';document.body.appendChild(el);}el.hidden=false;jhRender();}
function jhClose(){const el=$('#jh');if(el){el.hidden=true;el.innerHTML='';}if(TAB==='world')wHud();}
function jhRender(){const el=$('#jh');if(!el||el.hidden)return;const T={shop:'坊市',bounty:'悬赏',rank:'江湖榜',ppl:'人物',news:'传闻'};if(!T[JH.tab])JH.tab='shop';
 el.innerHTML=`<div class="jh-in"><div class="jh-top"><b>江湖</b><small>${yearName()} · 声望 ${S.fame} · 灵石 ${fmt(S.stones)}</small><button class="btn sm ghost" data-jx="close">关闭</button></div>
 <div class="jh-tabs">${Object.keys(T).map(k=>`<button class="${JH.tab===k?'on':''}" data-jt="${k}">${T[k]}</button>`).join('')}</div><div class="jh-body">${jhBody()}</div></div>`;
 el.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.jx==='close'){jhClose();return;}if(b.dataset.jt){JH.tab=b.dataset.jt;jhRender();return;}if(b.dataset.js){JH.sub=b.dataset.js;jhRender();return;}if(b.dataset.ja){const [a,arg]=[b.dataset.ja,b.dataset.arg];JH_ACT[a]&&JH_ACT[a](arg);}};}
function jhBody(){const t=JH.tab;
 if(t==='shop'){if(!inMarket())return `<div class="jh-scene"><canvas data-scene="market"></canvas></div><p class="empty">坊市在城南的旧街上。打开「地图」，去「坊市」逛逛：丹铺、器铺、符箓铺、拍卖行都在那里。</p><button class="btn gold" data-ja="goMarket">前往坊市</button>`;
  const S2={dan:'丹铺',qi:'器铺',fu:'符箓铺',auc:'拍卖行',sell:'收购'};let h=`<div class="jh-sub">${Object.keys(S2).map(k=>`<button class="${JH.sub===k?'on':''}" data-js="${k}">${S2[k]}</button>`).join('')}</div>`;
  if(JH.sub==='dan')h+=`<p class="note">灵草、妖核、兽骨、寒铁，炼丹用的。其余的材料要自己去打。</p>${SHOP_MATS.map(k=>`<div class="row2"><div class="in"><div class="iname">${MATS[k].n}<span class="lv">持有 ${S.mats[k]||0}</span></div></div><div class="ibtn"><button class="btn sm" data-ja="buyMat" data-arg="${k}|1">${fmt(matPrice(k))}</button><button class="btn sm ghost" data-ja="buyMat" data-arg="${k}|5">×5</button></div></div>`).join('')}
   <div class="row2"><div class="in"><div class="iname">寿元丹<span class="lv">持有 ${S.lifeP||0}</span></div><div class="istat">延寿三十年。丹铺每天只肯卖一颗。</div></div><button class="btn sm gold" data-ja="buyLife" ${S.lifeDay===dayKey()?'disabled':''}>${fmt(zsAt(maxZone(),60))}</button></div>`;
  if(JH.sub==='qi')h+=`<p class="note">每天三件。货架上的东西，过了今天就没了。</p>${qiStock().map((o,i)=>o.sold?`<div class="row2 dim"><div class="in"><div class="iname">（已售出）</div></div></div>`:`<div class="row2 r-${RAR[o.it.r].c}"><div class="in"><div class="iname">${o.it.n}${better(o.it)?'<span class="up">▲ 更强</span>':''}</div><div class="istat">${SLOTN[o.it.slot]}　${statText(o.it)}</div>${affHTML(o.it)}</div><button class="btn sm" data-ja="buyQi" data-arg="${i}" ${S.stones>=o.p?'':'disabled'}>${fmt(o.p)}</button></div>`).join('')}`;
  if(JH.sub==='fu')h+=`<p class="note">符箓在战斗的「道具」里使用。一张符，有时候能顶一门功法——雷符能引爆灼烧，破甲符专破金身。</p>${Object.keys(FU).map(k=>`<div class="row2"><div class="in"><div class="iname">${FU[k].n}<span class="lv">持有 ${S.fu[k]||0}</span></div><div class="istat">${FU[k].d}</div></div><button class="btn sm" data-ja="buyFu" data-arg="${k}" ${S.stones>=fuPrice(k)?'':'disabled'}>${fmt(fuPrice(k))}</button></div>`).join('')}`;
  if(JH.sub==='auc')h+=`<p class="note">每天三件拍品。对面坐着的，是江湖上有名有姓的人——压过他们，他们会记住你。</p>${aucStock().map((l,i)=>{const rv=P_(l.rv);return `<div class="row2 r-xian ${l.st?'dim':''}"><div class="in"><div class="iname">${l.n}</div><div class="istat">${l.d}${rv?'<br>竞拍者：'+esc(rv.n)+'（'+realmOf(rv.st)+'）':''}</div><div class="istat">当前 <b>${fmt(l.cur)}</b> 灵石${l.st===1?' · 已归你':l.st===2?' · 已流拍给他人':''}</div></div>
   ${l.st?'':`<div class="ibtn col"><button class="btn sm gold" data-ja="bid" data-arg="${i}|.1">加一成</button><button class="btn sm" data-ja="bid" data-arg="${i}|.35">加三成五</button><button class="btn sm ghost" data-ja="pass" data-arg="${i}">放弃</button></div>`}</div>`;}).join('')}`;
  if(JH.sub==='sell')h+=`<p class="note">多余的材料可以卖掉，换些灵石。</p>${Object.keys(MATS).filter(k=>S.mats[k]>0).map(k=>`<div class="row2"><div class="in"><div class="iname">${MATS[k].n}<span class="lv">${S.mats[k]}</span></div></div><button class="btn sm ghost" data-ja="sellMat" data-arg="${k}">卖一半 · ${fmt(Math.floor(matPrice(k)*.4)*Math.ceil(S.mats[k]/2))}</button></div>`).join('')||'<p class="empty">没有材料。</p>'}`;
  return h;}
 if(t==='bounty')return `<p class="note">悬赏每天更新三条。${S.path==='zheng'?'正道：赏金 ×1.5。':''}斩魔修能救一方百姓——但魔修也有徒弟。</p>${bntList().map((b,i)=>`<div class="row2 ${b.done?'dim':''}"><div class="in"><div class="iname">${esc(b.n)}<span class="lv">${BNT_K.find(x=>x.k===b.k).n} · ${realmOf(b.st)}</span></div><div class="istat">${b.why}${b.done?' · 已伏诛':''}</div></div>${b.done?'':`<button class="btn sm ${b.tier===2?'red':''}" data-ja="bnt" data-arg="${i}">缉拿</button>`}</div>`).join('')}`;
 if(t==='sect')return `<p class="note">挑战一个宗门要连赢三阵：弟子、长老、宗主。每家宗主都有自己的门道，只靠境界硬打，往往要吃亏——看清他们的五行和手段，带对灵根、功法、符箓和阵法。</p>${SECT_ORD.map(k=>{const D=SECTS[k],R=S.sects[k]||{beat:0},lead=sectLead(k);return `<div class="row2 sect"><div class="seal" style="--ec:${EL[D.el].c}">${D.n[0]}</div><div class="in"><div class="iname">${D.n}<span class="lv">${EL[D.el].n} · ${D.align}道 · 建议 ${realmOf(D.st)}</span></div><div class="istat">${D.d}<br>${D.lt}：${S.sm&&S.sm.k===k&&S.sm.rank>=5?'你':lead?esc(lead.n)+'（'+realmOf(lead.st)+'）':'空悬'} · 进度 ${'●'.repeat(Math.min(3,R.beat))}${'○'.repeat(3-Math.min(3,R.beat))}${R.rel?' · '+{ally:'盟友',hostile:'交恶',vassal:'已并入行社',beaten:'已服'}[R.rel]:''}</div></div>
  ${R.rel==='vassal'?'':`<button class="btn sm ${R.beat>=2?'red':''}" data-ja="sect" data-arg="${k}">${R.beat>=3?'再战宗主':'挑战'+RANKN[Math.min(2,R.beat)]}</button>`}</div>`;}).join('')}`;
 if(t==='rank'){const L=jhList(),idx=L.findIndex(x=>x.me),me=jhRank(),onB=me<=100,tot=JH_POP+L.length;
  const fmtN=n=>n>=10000?(n/10000).toFixed(1).replace(/\.0$/,'')+' 万':String(n);
  const head=`<p class="note">江湖上的修士数不清，粗算约有 ${fmtN(tot)} 人。江湖榜只记前一百位有名有姓的人物。<br>你${onB?'排在第 <b>'+me+'</b> 位'+(me<=3?'，站在江湖之巅':me<=20?'，已是一方高手':'，总算有人记得你的名字了'):'还没上榜——约排第 <b>'+fmtN(me)+'</b> 位，没人听说过你'}。人会突破，也会老死，名次随之更迭。</p>`;
  const rows=L.filter((x,i)=>i<20||(x.me&&onB)).map(x=>{const i=L.indexOf(x);return `<div class="row2 rk ${x.me?'me':''}"><div class="no">${x.me?me:i+1}</div><div class="in"><div class="iname">${esc(x.n)}<span class="lv">${realmOf(x.st)}</span></div><div class="istat">${x.me?'你':x.sect?SECTS[x.sect].n+(x.p.lead?SECTS[x.sect].lt:''):x.p.fr?'青石站':'散修'}${x.p&&!x.me&&!x.p.bg?' · '+attName(x.p):''}</div></div>${x.p&&!x.me&&!x.p.bg?`<button class="btn sm ghost" data-ja="talk" data-arg="${x.p.id}">拜会</button>`:''}</div>`;}).join('');
  return head+`<h3 class="sub">江湖榜 · 前二十</h3>`+rows+(onB?'':`<div class="row2 rk me"><div class="no">—</div><div class="in"><div class="iname">${esc(S.name)}<span class="lv">${realmOf(S.stage)}</span></div><div class="istat">榜外 · 约第 ${fmtN(me)} 位</div></div></div>`);}
 if(t==='ppl')return pplHTML();
 if(t==='news')return `<p class="note">${yearName()}。江湖上的事，一桩接一桩。</p>${S.news.length?S.news.map(n=>`<p class="news ${n.imp?'imp':''}"><b>${yearName(n.y)}</b> ${esc(sub(n.t))}</p>`).join(''):'<p class="empty">还没有什么传闻。</p>'}`;
 return '';}
const JH_ACT={
 goMarket:()=>{jhClose();goMarket();},
 buyMat:a=>{const [k,n]=a.split('|');const c=matPrice(k)*(+n);if(S.stones<c){toast('灵石不够','bad');return;}S.stones-=c;S.mats[k]=(S.mats[k]||0)+(+n);sfx('coin');save();jhRender();},
 buyLife:()=>{const c=zsAt(maxZone(),60);if(S.stones<c){toast('灵石不够','bad');return;}S.stones-=c;S.lifeP=(S.lifeP||0)+1;S.lifeDay=dayKey();sfx('coin');toast('买下一颗寿元丹');save();jhRender();},
 buyQi:a=>{const o=qiStock()[+a];if(!o||o.sold||S.stones<o.p)return;S.stones-=o.p;o.sold=1;toast(pushItem(o.it).trim());sfx('coin');save();jhRender();},
 buyFu:k=>{const c=fuPrice(k);if(S.stones<c)return;S.stones-=c;S.fu[k]=(S.fu[k]||0)+1;sfx('coin');save();jhRender();},
 sellMat:k=>{const n=Math.ceil(S.mats[k]/2);S.mats[k]-=n;S.stones+=Math.floor(matPrice(k)*.4)*n;sfx('coin');save();jhRender();},
 bid:a=>{const [i,p]=a.split('|');aucBid(+i,+p);},pass:a=>aucPass(+a),
 bnt:a=>bntFight(+a),sect:k=>sectFight(k),talk:id=>{jhClose();personTalk(P_(id));},
 giveLife:id=>giveLife(id),revive:id=>revive(id)
};

/* ---------- 坊市地图 ---------- */
function goMarket(){WD.prev=null;wFade(()=>{S.loc='market';wLoad(buildMarket(),[3,7]);const t=$('#travel');if(t)t.hidden=true;wHud();});}
function buildMarket(){const W=24,H=16,M=newMap('town',-1,W,H,'dirt');Object.assign(M,{name:'南街坊市',dark:.05,bg:'#2a2418',amb:'mist',mk:1});
 for(let c=0;c<W;c++)for(let r=0;r<H;r++){const i=gi(M,c,r);M.gv[i]=(c*7+r*13)%4;if(r===7||r===8)M.g[i]='flag';else if((c===11||c===12)&&r>8)M.g[i]='flag';else if((c+r*3)%7===0)M.g[i]='grassV';}
 const shop=(c,r,type,lab,fn,o)=>{const p=addProp(M,c,r,type,Object.assign({extra:[[c-1,r],[c,r-1],[c-1,r-1]]},o||{}));p.lab=lab;p.act=fn;return p;};
 shop(4,5,'shop','丹铺',()=>jhOpen('shop','dan'),{v:0});shop(9,5,'shop','器铺',()=>jhOpen('shop','qi'),{v:1});shop(14,5,'shop','符箓铺',()=>jhOpen('shop','fu'),{v:2});shop(20,5,'house','拍卖行',()=>jhOpen('shop','auc'),{v:3});
 shop(5,12,'house','茶馆 · 传闻',()=>jhOpen('news'),{v:1});shop(19,12,'house','收购铺',()=>jhOpen('shop','sell'),{v:2});
 const b=addProp(M,8,10,'board');b.lab='悬赏榜';b.act=()=>jhOpen('bounty');
 const st=addProp(M,15,11,'leitai',{extra:[[14,11],[15,10],[14,10]]});st.lab='擂台 · 宗门挑战';st.act=()=>jhOpen('sect');
 const sl=addProp(M,22,9,'stele');sl.lab='江湖榜';sl.act=()=>jhOpen('rank');
 const gt=addProp(M,0,7,'paifang',{extra:[[0,8]]});gt.lab='出坊市';gt.act=()=>wTravel();
 addProp(M,11,10,'well');[[1,2],[2,13],[7,1],[12,1],[17,1],[23,2],[23,13],[1,14],[10,14],[16,14]].forEach(([c,r],i)=>addProp(M,c,r,'treeB',{v:i}));
 [[3,9],[7,9],[13,9],[17,9],[21,9],[6,6],[11,6],[16,6]].forEach(([c,r])=>addProp(M,c,r,'lantern'));[[2,10],[9,13],[13,13],[18,10],[22,14]].forEach(([c,r],i)=>addProp(M,c,r,'flowers',{blocks:false,v:i}));
 [[17,8],[6,15]].forEach(([c,r])=>addProp(M,c,r,'cart'));[[3,6],[8,6],[13,6],[19,6]].forEach(([c,r],i)=>addProp(M,c,r,'jars',{v:i}));
 propLights(M);const add=(k,c,r,o)=>M.ents.push(mkEnt(Object.assign({kind:'npc',k,c,r,dir:1},o||{})));
 add('p_gen2',5,6,{name:'丹铺掌柜',fn:()=>jhOpen('shop','dan')});add('p_gen4',10,6,{name:'器铺伙计',fn:()=>jhOpen('shop','qi')});add('p_gen5',15,6,{name:'画符的老道',fn:()=>jhOpen('shop','fu')});add('p_gen1',20,6,{name:'拍卖师',fn:()=>jhOpen('shop','auc')});
 for(let i=0;i<6;i++){const c=3+i*3,r=i%2?8:7;add(villager(i+20),c,r,{gen:1,vill:1,name:'行人',home:[c,r],spd:1.3});}
 const vis=S.ppl.filter(p=>p.alive&&p.known&&p.st>=0&&!p.fr&&!p.bg&&p.ch&&CH[p.ch]).sort((a,b)=>(!!rwNext(b))-(!!rwNext(a)));for(let i=0;i<Math.min(3,vis.length);i++){const p=vis.splice(rwNext(vis[0])?0:Math.floor(Math.random()*vis.length),1)[0];const pos=[[12,9],[17,7],[7,8]][i];add(p.ch,pos[0],pos[1],{name:p.n+(p.att<=-40?' ⚔':p.att>=40?' ♥':''),fn:()=>personTalk(p)});}
 return M;}

/* ---------- 仙府残图 ---------- */
const XF_SRC={soul:'元神出窍时在野外看见的残影',auc:'拍卖行',gui:'鬼手的面具',sects:'天穹秘辛',cave:'古修洞府',abyss:'深渊第十层'};
function xfGet(src){S.flags.xfs=S.flags.xfs||{};if(S.flags.xfs[src])return '';S.flags.xfs[src]=1;if(src==='auc')S.flags.xf_auc=1;S.xf=(S.xf||0)+1;news(S.name+'得到一块仙府残图（'+S.xf+'/5）。');
 if(S.xf>=5)setTimeout(checkStory,500);sfx('bell');return ' 获得仙府残图（'+S.xf+'/5）。';}

/* ---------- 隐藏剧情 ---------- */
STORY.push(
 {id:'h_jianke',hid:1,title:'隐秘·剑冢',g:'剑',bg:'forest',cond:()=>(S.flags.beatJianke||0)>=3,hint:'',lines:[
  ['','第三次，你的剑抵住了剑客的咽喉。他笑了。'],['','“够脏了。”他说，“跟我来。”'],{bg:'forest'},
  ['','他带你走进林子深处。那里插着成百上千把剑，每一把都锈成了土的颜色。'],
  ['','“太一观的剑冢。三百年前，观里的剑修死在灵源边上，剑我一把一把背回来的。”'],
  ['mo','……厉师侄？你、你还活着？'],['','剑客的手抖了一下。他朝玉简跪了下去，额头抵着土。'],
  ['','“师叔。弟子没能守住观门。”'],['mo','傻孩子。是我们没能守住你们。'],
  ['','剑客站起身，从剑冢最深处拔出一把剑，剑身上一点锈也没有。'],['','“这把剑在等一个肯为别人弄脏手的人。拿去。”'],
  {fx:()=>({flags:{lihan:1},item:null})},{fn:()=>{toast(gItemNamed('w',4,'太一剑',maxZone()).trim(),'big');toast(learnForm('tiangang').trim());}}]},
 {id:'h_soul',hid:1,title:'隐秘·站台上的女孩',g:'魂',bg:'shelter',cond:()=>F('soulTown'),hint:'',lines:[
  ['','元神离体的时候，你看见站台尽头蹲着一个小女孩。她是透明的。'],['','“叔叔……你看得见我？”'],
  ['','她说她叫铁小芽。灵潮那天，她在这里等爸爸下班。'],['','“爸爸说，站台的灯一直亮着，他就一定能找到我。”'],
  ['','她指着墙上一圈用粉笔画的格子。“我每天都在这里玩跳房子，九个格子。”'],
  ['mo','……那不是跳房子。是九宫阵。这孩子的魂一直守着这个站，站里的人才没被灵潮冲散。'],
  {c:[{t:'告诉铁叔',fx:{aff:{tie:30},flags:{soulTold:1}},r:[['tie','……小芽？'],['','铁叔在站台尽头坐了一夜。第二天早上，他的眼睛是红的，可他在笑。'],['','女孩的影子在晨光里慢慢淡了。走之前，她冲你挥了挥手。']]},
   {t:'不说，让她继续等',fx:{flags:{soulKept:1},karma:-1},r:[['','你什么都没说。'],['','后来你常常在夜里看见她，蹲在那里画格子。铁叔从她身边走过，一次也没有回头。']]}]},
  {fn:()=>toast(learnForm('jiugong').trim(),'big')}]},
 {id:'h_root',hid:1,title:'隐秘·灵根之秘',g:'根',bg:'core',cond:()=>!S.root2&&!!S.root&&((ROOTS[S.root].rare&&realmIdx()>=2)||(S.combos||0)>=60),hint:'',lines:[
  ['mo','你过来。把手按在玉简上。'],['mo','……果然。你的灵根里，有两股气。一股是你的，另一股，是灵源反噬那天散出来的。'],
  ['mo','三百年前散出去的灵气，落进了无数凡人的骨血里。灵潮之后觉醒的人，都带着一点。你带得最多。'],
  ['mo','要不要把它唤醒？唤醒了，你就是双灵根。'],
  {fn:()=>setTimeout(()=>{const L=Object.keys(ROOTS).filter(k=>k!==S.root);modal('<h3>第二道灵根</h3><p>选一道与你的'+ROOTS[S.root].n+'相配的灵根。双灵根可以同时施展两系法术，并同时享受两者的加成。</p>',L.map(k=>({t:EL[k].n+'灵根',cls:SHENG[S.root]===k||SHENG[k]===S.root?'gold':'',fn:()=>{S.root2=k;sfx('rise');toast('双灵根：'+rootName(),'big');save();render();}})));},400)}]},
 {id:'h_gui',hid:1,title:'隐秘·面具之下',g:'面',bg:'market',cond:()=>(S.cnt&&S.cnt.gui||0)>=5&&F('metGui'),hint:'',lines:[
  ['gui','老主顾了。今天不卖东西，跟你说个故事。'],['gui','灵潮那天，有个当爹的把女儿塞进一辆往南开的车。车开走了，他追了三条街。'],
  ['gui','那女儿后来在黑市里长大，学会了戴面具，学会了变声，学会了不相信任何人。'],
  ['','鬼手摘下面具。面具下是一张年轻的、女人的脸。眉眼和钱三一模一样。'],
  ['gui','我叫钱小鹭。我每天夜里来青石站出摊，就为了远远看他一眼。'],
  {c:[{t:'我带你去见他',fx:{aff:{qian:30},flags:{guiMet:1}},r:[['qian','……鹭鹭？'],['','钱三手里的算盘掉在了地上。'],['','那天夜里，青石站的人第一次看见钱三哭。']]},
   {t:'这是你的事，你自己去说',fx:{flags:{guiSelf:1}},r:[['gui','……也是。'],['','她又戴上了面具。可第二天，你看见钱三的摊子旁边，多了一张小板凳。']]}]},
  ['gui','这个，本来想卖个好价钱的。给你了。'],{fn:()=>{const p=P_('qian');if(p){p.goal='看着女儿嫁人';p.life=(p.life||76)+6;}toast(xfGet('gui').trim(),'big');}}]},
 {id:'h_he',hid:1,title:'隐秘·谷主',g:'谷',bg:'forest',cond:()=>F('heLead'),hint:'',lines:[
  ['','百草谷的新谷主，亲自来青石站拜访。'],['he','{bro}。'],['','阿禾站在站台上，个子比你记忆里高了很多。手上的茧，和你当年在废墟里找到她时一样厚。'],
  ['he','花姑走的时候说，百草谷的规矩，谷主要报的第一个恩，是带自己入门的人。'],['he','所以，百草谷从今往后，是你的盟友。永远都是。'],
  ['he','还有这个。我这些年记的。'],['','是一本《青帝长生功》，扉页上写着：「给{bro}。我变成有用的人了。」'],
  {fn:()=>{S.sects.baicao=S.sects.baicao||{beat:0,rel:null};S.sects.baicao.rel='ally';S.books.baicao=(S.books.baicao||0)+1;toast('百草谷成为盟友 · 获得《青帝长生功》','big');}}]},
 {id:'h_modis',hid:1,title:'隐秘·杀师之仇',g:'徒',bg:'clan',cond:()=>F('modisDisciple')&&S.dis.some(d=>d.note&&d.note.includes('魔修')&&d.alive&&STAGES[Math.min(d.st,LAST)].r>=2),hint:'',lines:[
  ['','那个徒弟结丹了。'],['','那天夜里，他提着剑走进你的屋子，没有点灯。'],['','“师父。我只问一句：当年你杀我师父，后悔吗？”'],
  {c:[{t:'不后悔。他该死。',fx:{flags:{modisTruth:1}},r:[['','他沉默了很久。“……他确实该死。那些村子，我也去过。”'],['','他把剑放在了桌上，朝你磕了三个头。“弟子以后，只有一个师父了。”']]},
   {t:'后悔。我不该当着你的面。',fx:{flags:{modisSoft:1}},r:[['','他的手在抖。“你知道吗？我宁愿你说不后悔。”'],['','第二天，他不见了。桌上留着一句话：「恩怨两清。各自珍重。」']]}]},
  {fn:()=>{const d=S.dis.find(x=>x.note&&x.note.includes('魔修'));if(d){if(F('modisTruth')){d.loy=100;d.apt=5;}else{d.gone=1;mkPerson({n:d.n,st:d.st,age:d.age,tal:.7,att:10,goal:'找一个不用恨谁的地方'});}}}}]},
 {id:'h_sects',hid:1,title:'隐秘·天穹秘辛',g:'秘',bg:'tianting',cond:()=>SECT_ORD.every(sectBeat),hint:'',lines:[
  ['','六大宗门，你都挑过了。最后一个倒下的，是天穹会的顾长风。'],['','“你以为天穹会要的是什么？”他咳着血笑，“灵源？力量？”'],
  ['','“三百年前，堕仙想把灵气分给天下人。他失败了，可他留了一张图——一座仙府，里面有让凡人也能修仙的法子。”'],
  ['','“我们找了三百年，只找到一块。”他把一块残图塞进你手里。“剩下的……你去找吧。你比我们配。”'],
  ['mo','……原来师兄，一直没有放弃。'],{fn:()=>toast(xfGet('sects').trim(),'big')}]},
 {id:'h_xianfu',hid:1,title:'隐秘·上古仙府',g:'府',bg:'xianfu',cond:()=>(S.xf||0)>=5,hint:'',lines:[
  ['','五块残图拼在一起的那一刻，玉简发出了光。'],['mo','这座山……是太一观的后山。我在那里住了一百年，从来不知道山里有一座仙府。'],
  ['mo','是祖师留下的。太一真人。三百年前，师兄要找的，就是这个。'],['','图上的路，指向灵源的另一面。'],
  {fn:()=>{S.flags.xfOpen=1;setTimeout(()=>{if(!BT)playEvent('xf1',{});},600);}}]}
);

/* ---------- 仙府：连环奇遇 ---------- */
Object.assign(EVENTS,{
 xf1:{title:'仙府之门',g:'门',zones:'cult',bg:'xianfu',lines:['石门上有三道禁制，一道是剑痕，一道是棋局，一道是一个血手印。','门缝里漏出来的灵气，浓得像水。'],choices:[
  {t:'以力破之（剑痕）',act:()=>({text:'剑痕亮了。守门的傀儡从石壁里走了出来。',fight:{look:'守门石兽',name:'仙府傀儡',m:2.6,boss:true,z:maxZone(),after:()=>{setTimeout(()=>playEvent('xf2',{}),900);return '石门开了。';}}})},
  {t:'以智解之（棋局）',act:()=>({text:'棋盘上的子自己动了起来。',game:{k:'gomoku',lv:3,title:'仙府棋局',onWin:()=>{setTimeout(()=>playEvent('xf2',{}),600);return '最后一子落下，石门无声地开了。';},onLose:()=>{S.hpF=Math.max(.1,(S.hpF??1)-.3);setTimeout(()=>playEvent('xf1',{}),600);return '棋局崩散，反噬的灵力震得你吐了一口血。'+gHp(0);}}})},
  {t:'以血开之（手印）',act:()=>{S.hpF=.3;S.qi=Math.floor(S.qi*.7);setTimeout(()=>playEvent('xf2',{}),600);return '你把手按上去。血顺着纹路流进石门，门开了，你也快站不住了。生命只剩三成，修为散去三成。';}}]},
 xf2:{title:'丹室与剑阁',g:'阁',zones:'cult',bg:'xianfu',lines:[()=>{S.flags.xfStage=2;return '';},'门后是一条岔路。左边是丹室，炉火三百年没灭；右边是剑阁，万剑悬空。','你刚踏进一步，身后的地面就开始塌——只能选一边。'],choices:[
  {t:'丹室',act:()=>{S.dan.xp+=250;S.jzDan=(S.jzDan||0)+1;S.mats.ru=(S.mats.ru||0)+3;setTimeout(()=>playEvent('xf3',{}),600);return '丹炉里还温着一枚九转金丹，炉壁上刻满了丹方。你看了一夜。丹道 +250，九转金丹 +1，千年灵乳 +3。';}},
  {t:'剑阁',act:()=>{if(S.natal)S.natal.lv=Math.min(natalMax()+3,S.natal.lv+3);const t=gItemNamed('w',4,'太一仙剑',maxZone());setTimeout(()=>playEvent('xf3',{}),600);return '万剑之中，有一把落在了你手里。'+t+(S.natal?' 本命法宝受剑意洗炼，+3 重。':'');}}]},
 xf3:{title:'仙府之主',g:'主',zones:'cult',bg:'xianfu',lines:[()=>{S.flags.xfStage=3;return '';},'仙府最深处，坐着一具枯骨。枯骨的眼眶里，亮起两点光。','「三百年了。来的不是我那两个蠢徒弟，是个后生。」','「打得赢我的影子，这里的东西就都是你的。」'],choices:[
  {t:'请赐教',act:()=>({text:'枯骨身后，站起来一道影子。',fight:{look:'断戟天将',name:'太一真人之影',m:3.2,boss:true,z:maxZone(),after:()=>{S.flags.xianfuDone=1;news(S.name+'寻回太一仙府，承太一真人传承。',1);setTimeout(()=>xfLegacy(),800);return '影子散了。枯骨点了点头，化成了灰。';}}})}]}
});
function xfLegacy(){modal('<h3>太一传承</h3><p>灰烬里留下三样东西。祖师的声音在洞府里回荡：「只能拿一样。拿什么，就走什么路。」</p>',[
 {t:'太一剑经（攻伐）',cls:'gold',fn:()=>{S.xisui=Math.min(10,(S.xisui||0)+4);S.flags.xfSword=1;toast('太一剑经：攻防血永久 +12%','big');save();}},
 {t:'太一丹经（丹道）',cls:'gold',fn:()=>{S.dan.xp=Math.max(S.dan.xp,DAN_RANK[4].xp);toast('太一丹经：丹道直入「丹圣」','big');save();}},
 {t:'太一阵图（阵法）',cls:'gold',fn:()=>{Object.keys(FORMS).forEach(learnForm);toast('太一阵图：习得全部阵法','big');save();}}]);}

/* ---------- 奇遇：每一次都要选择 ---------- */
Object.assign(EVENTS,{
 dongfu:{title:'古修洞府',g:'洞',zones:'any',need:()=>maxZone()>=1,lines:['山壁上有一道裂缝，往里看，是一间石室。','石壁上刻着密密麻麻的字；角落里横着一口石棺，棺盖上贴着褪色的符；石台上放着一只木匣。','这种地方，拿得太多，往往走不出去。'],choices:[
  {t:'参悟石壁上的功法',act:()=>{if(Math.random()<.55){S.dao.yin+=1;return '你在石壁前坐了三天三夜。字一个一个活了过来，钻进你的脑子里。'+gBook();}S.qi=Math.floor(S.qi*.8);injSet(2);return '读到一半，字变成了刀。你走火入魔，修为散去两成，受了轻伤。';}},
  {t:'揭开石棺',act:()=>({text:'符纸碎了。棺材里坐起来一只东西——它被封在这里，比灵潮还要早。',fight:{look:pick(['噬灵巨鼠','守门石兽','金乌残魂']),name:'上古妖兽',m:2.8,boss:true,after:()=>xfGet('cave')+gItem(3)+gMat('ru',1)}})},
  {t:'只拿木匣',act:()=>Math.random()<.2?{text:'木匣张开了嘴。',fight:{look:'宝箱怪',name:'匣中妖',m:1.6,after:()=>gS(zs(8))}}:'木匣里是几块灵石和一瓶丹药。你没有贪。'+gS(zs(5))+gPill(1)},
  {t:'不进去',act:()=>'你在洞口站了一会儿，转身走了。有些东西，不知道比知道好。'}]},
 mo_cult:{title:'血祭',g:'魔',zones:'any',need:()=>maxZone()>=1,lines:['村口的井边围着一圈人，都跪着，脖子上系着红绳。','一个黑袍人站在井沿上，手里捏着一串骨珠，念一句，就有一个人倒下去。','“道友，路过就走吧。”他头也没回，“这口井下面的东西，我们都惹不起。”'],choices:[
  {t:'斩了他',act:()=>({text:'黑袍人终于回过头来。',fight:{look:'虚无行者',name:'血祭魔修',m:1.9,boss:true,demon:1,after:()=>{S.dao.zheng+=2;kar(1);news('有人在村口斩了血祭的魔修，一村人得救。');let t=' 村民们跪了一地。';if(Math.random()<.5){const p=mkPerson({n:pick(['赵','钱','孙','李'])+pick(['无名','夜行','孤鸿','血衣']),st:2,age:13,tal:.95,att:-80,known:false,goal:'为师父报仇'});seedAdd('modis',p.id,S.year+12+Math.floor(Math.random()*18),{mname:'血祭魔修'});t+='\n人群后面，有个孩子没有跪。等你回头，他已经不见了。';}return t;}}})},
  {t:'和他做笔交易',act:()=>{S.dao.mo+=2;kar(-2);news('又一座村子被血祭了。没有人知道，那天有个修士从村口经过。',1);return '他给了你一卷魔功，你给了他时间。你走出很远，还能听见井边的念经声。'+gBook()+gQi(.3);}},
  {t:'先把人救走',act:()=>{S.dao.zheng+=1;kar(1);const p=mkPerson({n:'血祭魔修',st:Math.max(1,S.stage-2),age:80,tal:.6,att:-60,goal:'找回他的祭品'});seedAdd('revenge',p.id,S.year+8+Math.floor(Math.random()*8),{why:'那口井下面的东西，因为你，饿了很多年。'});return '你趁他念咒的空当，把人一个一个拖出了村子。他没有追，只是看着你笑。你知道，他还会回来。';}}]},
 rob:{title:'重伤的修士',g:'夺',zones:'any',need:()=>maxZone()>=2,lines:['路边靠着一个浑身是血的修士，怀里死死抱着一件发光的法宝。','远处传来脚步声——追他的人快到了。','他看着你，眼神里全是哀求。'],choices:[
  {t:'夺了法宝',act:()=>{S.dao.mo+=1;kar(-1);const p=mkPerson({n:pick(['柳','沈','韩','秦'])+pick(['青','寒','远','舟']),st:Math.max(1,S.stage-4),age:30,tal:.75,att:-75,goal:'夺回法宝，向你讨个说法'});seedAdd('revenge',p.id,S.year+10+Math.floor(Math.random()*10),{why:'那天你抢走的，是我师门最后一件东西。'});return '他的手指一根一根被你掰开。他没有力气骂你，只是死死地看着你的脸。'+gItem(3);}},
  {t:'救他',act:()=>{if(S.meds<2)return '你身上的药不够。你只能替他止住血，看着他自己爬进了林子。'+kar(1);S.meds-=2;S.dao.zheng+=1;kar(1);const p=mkPerson({n:pick(['柳','沈','韩','秦'])+pick(['青','寒','远','舟']),st:Math.max(1,S.stage-4),age:30,tal:.75,att:70,goal:'重振师门'});seedAdd('grace',p.id,S.year+15+Math.floor(Math.random()*15),{why:'当年你在路边救下的那个人'});return '你给他喂了两颗疗伤药，把他藏进了石缝里。追兵从你身边走过，什么都没看见。';}},
  {t:'替他引开追兵',act:()=>({text:'你迎着脚步声走了过去。',fight:{look:'天穹追兵',name:'追兵首领',m:1.7,after:()=>{S.dao.zheng+=1;const p=mkPerson({n:pick(['柳','沈','韩','秦'])+pick(['青','寒','远','舟']),st:Math.max(1,S.stage-4),age:30,tal:.75,att:90,goal:'报答恩人'});seedAdd('grace',p.id,S.year+12+Math.floor(Math.random()*12),{why:'当年你替他挡下追兵的那个人'});return ' 回来的时候，那人已经走了，地上留着那件法宝和一行血字：「借你用。」'+gItem(3);}}})},
  {t:'不管闲事',act:()=>'你走开了。身后传来一声惨叫，然后什么声音都没有了。'}]},
 orphan:{title:'废城里的孩子',g:'童',zones:'any',lines:['废城的墙根下缩着一个孩子，七八岁，瘦得只剩一双眼睛。','你走近的时候，他掌心里冒出一点很淡的光——是灵根，还是很好的灵根。'],choices:[
  {t:'带回青石站',act:()=>{kar(1);S.dao.zheng+=1;const nm=pick(CL_SUR.split(''))+pick(CL_GIV);S.kids=S.kids||[];S.kids.push({n:nm,apt:4+(Math.random()<.3?1:0),root:pick(Object.keys(ROOTS)),age:8,trait:'温厚',note:'你在废城里捡回来的孩子'});
    const p=mkPerson({n:nm,st:-1,age:8,tal:.9,att:80,goal:'变成像你一样的人',grow:1,life:80});seedAdd('grace',p.id,S.year+28+Math.floor(Math.random()*12),{why:'当年你从废城里带回来的那个孩子'});return '他一路上一句话也没说，只是紧紧攥着你的衣角。（他会出现在「族」页的拜师名单里）';}},
  {t:'给他干粮，告诉他往南走',act:()=>{S.dao.yin+=1;news('听说南边的难民营里，有个孩子自己摸到了修行的门槛。');return '他接过干粮，朝你鞠了一躬，往南走了。你不知道他能不能走到。'+kar(0);}},
  {t:'当场替他洗髓',need:()=>S.qi>=req(S.stage)*.3,act:()=>{S.qi-=req(S.stage)*.3;kar(1);const nm=pick(CL_SUR.split(''))+pick(CL_GIV);const p=mkPerson({n:nm,st:3,age:8,tal:1,att:60,goal:'找到当年救我的人'});seedAdd('grace',p.id,S.year+20+Math.floor(Math.random()*15),{why:'当年在废城里替他洗髓的那个人'});return '你把三成修为渡进他的经脉。他昏了过去，醒来时，眼睛亮得吓人。他没有跟你走——他说要自己闯。';}}]},
 seal:{title:'镇妖碑',g:'碑',zones:'any',need:()=>maxZone()>=3,lines:['一块半截埋进土里的石碑，上面写着：「此下镇有上古大妖。揭碑者，得其宝；纵其出者，万死。」','碑底已经裂开了一道缝，有东西在里面呼吸。'],choices:[
  {t:'揭碑，斩妖',act:()=>({text:'碑倒了。',fight:{look:'噬星鲸',name:'上古大妖',m:3.1,boss:true,after:()=>{news(S.name+'斩了镇妖碑下的上古大妖。',1);S.dao.zheng+=1;return gItem(4)+gMat('ru',2)+gMat('xue',2);}},failText:''})},
  {t:'加固封印',need:()=>S.stones>=zs(10),act:()=>{S.stones-=zs(10);kar(2);S.dao.zheng+=1;return '你花了一整天，把碑重新立正，补上了符。碑底的呼吸声，慢慢平了下去。';}},
  {t:'当没看见',act:()=>{if(Math.random()<.35){news('镇妖碑崩裂，上古大妖出世，三座城一夜之间没了灯火。',1);kar(-1);return '你走后的第三天，夜里地动了一下。（你听说了）';}return '你走开了。碑还在那里，缝似乎又大了一点。';}}]},
 old_xiu:{title:'坐化的老修士',g:'老',zones:'any',lines:['松树下坐着一个老修士，身上落满了松针。他还有一口气。','“后生……我等不到了。这只储物袋，帮我送到'+'百草谷，给我的徒弟。”'],choices:[
  {t:'答应他',act:()=>{kar(1);S.dao.zheng+=1;const lead=sectLead('baicao');if(lead)lead.att=Math.min(100,lead.att+15);S.sects.baicao=S.sects.baicao||{beat:0,rel:null};return '他笑了，把储物袋交给你，闭上了眼睛。后来你把袋子送到了百草谷。谷里的人记住了你的名字。'+gMat('xue',1)+gS(zs(4));}},
  {t:'陪他走完最后一程',act:()=>{S.dao.yin+=1;return '你在他身边坐到天黑。他断气的那一刻，你忽然明白了一点什么。'+gQi(.35);}},
  {t:'等他断气，搜他的身',act:()=>{S.dao.mo+=1;kar(-1);return '储物袋里的东西不少。你没有回头看他。'+gItem(2)+gS(zs(8))+gMat('ru',1);}}]},
 two_duel:{title:'斗法',g:'斗',zones:'any',need:()=>maxZone()>=2,lines:['山谷里两个修士在斗法：一个白衣，剑光清正；一个黑袍，满身煞气。','两人都受了伤。你走出来的那一刻，他们同时看向你。'],choices:[
  {t:'助白衣',act:()=>({text:'黑袍人啐了一口，冲你来了。',fight:{look:'虚无行者',name:'黑袍修士',m:1.6,demon:1,after:()=>{S.dao.zheng+=1;kar(1);const p=mkPerson({n:'白衣客',st:Math.max(1,S.stage-3),age:40,tal:.6,att:60,sect:'chixiao',goal:'斩尽天下魔修'});return ' 白衣客抱拳：「赤霄宗记下了。」';}}})},
  {t:'助黑袍',act:()=>({text:'白衣人皱眉，剑尖转向了你。',fight:{look:'无名剑客',name:'白衣修士',m:1.6,after:()=>{S.dao.mo+=2;kar(-1);const p=mkPerson({n:'黑袍客',st:Math.max(1,S.stage-3),age:60,tal:.6,att:60,sect:'youming',goal:'活下去'});return ' 黑袍人冲你笑了笑：「幽冥殿欠你一次。」'+gBook();}}})},
  {t:'等他们两败俱伤',act:()=>{S.dao.mo+=1;['白衣客','黑袍客'].forEach(n=>{const p=mkPerson({n,st:Math.max(1,S.stage-3),age:45,tal:.6,att:-50,goal:'找那个坐收渔利的人算账'});seedAdd('revenge',p.id,S.year+10+Math.floor(Math.random()*10),{why:'那天在山谷里看戏的，是你吧？'});});return '你等到两个人都倒下，把他们的储物袋都摘了。他们都还活着，都看见了你的脸。'+gItem(3)+gS(zs(10));}}]}
});

/* ---------- 三层目标 ---------- */
function goals(){const ni=nextInfo(),R=realmIdx(),g={};
 const pend=S.pending.map(id=>STORY.find(c=>c.id===id)).find(c=>c&&!c.side);const ready=QUESTS.find(q=>qSt(q.id)==='ready');
 if(pend)g.s={t:'新篇章：'+pend.title,a:'story'};else if(S.fateQ.length)g.s={t:'有人在等你',a:'fate'};else if(ready)g.s={t:'交付委托：'+ready.title,a:'story'};
 else if(!S.root&&S.stage>=3)g.s={t:'测灵根，定下你的流派',a:'root'};
 else if(injOn())g.s={t:'重伤未愈：'+injLeft()+' 天',a:'cult'};
 else if(S.qi>=req(S.stage)&&!ni.final)g.s=ni.gate?{t:ni.capped?(F('qingSan')?'修为已满：这一世到筑基为止':canonCap()>12?'修为已满：元婴的门还关着':'修为已满：结金丹还缺一味药'):ni.wuG?'感悟不足 '+(S.wu||0)+'/'+ni.wuG+'：去交委托、经历奇遇':ni.fs?(ni.gate===RJ_GATE?'走完「人间篇」':'走完主线「灵源」'):'击败「'+ni.gate+'」，打开瓶颈',a:'world'}:{t:'灵气已满，去突破'+(ni.major?'大境界':''),a:'cult'};
 else{const b=S.bnt&&S.bnt.day===dayKey()?S.bnt.L.filter(x=>x.done).length:0;g.s=b<3&&S.stage>=6?{t:'今日悬赏 '+b+'/3',a:'bounty'}:{t:'历练：'+ZONES[maxZone()].n+' · 灵气 '+Math.floor(S.qi/req(S.stage)*100)+'%',a:'world'};}
 const nr=REALMS[Math.min(R+1,REALMS.length-1)],un=REALM_UNLOCK[R+1];
 if(R>=2&&!S.natal)g.m={t:'祭炼本命法宝',a:'cult'};else if(R>=3&&!S.path)g.m={t:'元婴问道：选择你的道途',a:'path'};
 else{const sk=SECT_ORD.find(k=>!sectBeat(k)&&S.stage>=SECTS[k].st-4);g.m=un&&R<9&&R+1<=STAGES[canonCap()].r?{t:'突破'+nr+'：解锁「'+un[0][0]+'」',a:'cult'}:{t:'丹道：'+DAN_RANK[danRank()].n,a:'cult'};
  if(un&&sk&&Math.random()<.4)g.m={t:'挑战'+SECTS[sk].n,a:'sect'};}
 const E=S.path?ENDS[PATHS[S.path].end]:null;g.l=E&&!(S.endings||[]).includes(PATHS[S.path].end)?{t:'道果「'+E.n+'」',sub:E.cond,a:'ends'}:(S.xf||0)<5?{t:'寻找仙府残图 '+(S.xf||0)+'/5',sub:'散落在拍卖行、深渊、隐秘的洞府和人心里',a:'ends'}:{t:'登上江湖榜首（现'+(jhRank()>100?'在榜外':'第 '+jhRank()+' 位')+'）',a:'rank'};
 return g;}
function goalsHTML(){const g=goals();return `<button class="goalbar" data-act="goals"><span class="gs">近</span>${esc(g.s.t)}</button>`;}
function goalsOpen(){const g=goals(),row=(k,n,o)=>`<div class="row2 goal"><div class="gk">${n}</div><div class="in"><div class="iname">${esc(o.t)}</div>${o.sub?`<div class="istat">${esc(o.sub)}</div>`:''}</div><button class="btn sm" data-gl="${o.a}">去</button></div>`;
 modal(`<h3>目标</h3>${row('s','近',g.s)}${row('m','中',g.m)}${row('l','远',g.l)}<p class="note">${yearName()} · 年岁 ${S.age}/${lifeText(myLife())} · ${jhRank()>100?'江湖榜外':'江湖榜第 '+jhRank()} · ${S.path?PATHS[S.path].n:'道途未定'}</p>`,[{t:'好',cls:'ghost'}]);
 $('#ov').querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{$('#ov').hidden=true;$('#ov').innerHTML='';goalGo(b.dataset.gl);});}
function goalGo(a){if(a==='story'||a==='ends'){TAB='story';render();}else if(a==='cult'){TAB='cult';render();}else if(a==='world'){TAB='world';render();}else if(a==='root')openRootTest();else if(a==='fate')fateCheck();else if(a==='path')pathAsk();else if(['bounty','sect','rank'].includes(a))jhOpen(a);}

STORY.forEach(c=>{if(c.hid)c.side=1;});
Object.keys(NPCS).forEach(k=>{const u=NPCS[k].unlock;NPCS[k].unlock=()=>!F('dead_'+k)&&(u?u():false);});
