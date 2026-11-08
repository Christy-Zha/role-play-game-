/* ================= 首领门道 · 破绽 · 道果 · 因果簿 · 功能解锁 · 背景音乐 ================= */

/* ---------- 每个首领一个门道 ---------- */
const BOSS_MECH={
 0:{el:'tu',mech:'swarm',add:'变异鼠',addN:'鼠群',d:'每三回合召来鼠群；鼠群还在时，鼠王受到的伤害减半',tip:'先清掉鼠群'},
 1:{el:'jin',mech:'shell',d:'钢甲：伤害只剩四成。挨够六下，或被金、雷击中，甲壳碎裂两回合',tip:'连续出手，用金或雷'},
 2:{el:'mu',mech:'heal',healK:.06,d:'每回合回复一成生命的六成',tip:'灼烧能断它的生机——火系、烈焰符'},
 3:{el:'shui',mech:'tide',d:'它的蓄力是引潮：全体重击并潮湿',tip:'看到引潮就打破绽，打不了就防御、上护盾'},
 4:{el:'lei',mech:'shuijing',d:'水镜反射三成伤害',tip:'让它感电，水镜即破——雷系、天雷符'},
 5:{el:'huo',mech:'fireImm',atkSt:['burn',1],d:'不惧灼烧，出手带火，还有第二重真身',tip:'水克火；留好回复'},
 6:{el:'lei',mech:'surge',d:'灵潮：每回合攻击 +6%，越拖越强',tip:'速战速决；打中破绽能打散灵潮'},
 8:{el:'shui',mech:'swarm',add:'星砂蠕虫',addN:'星砂蠕虫',d:'召来星砂蠕虫；蠕虫在时本体减伤一半',tip:'先清小怪'},
 9:{el:'jin',mech:'shell',d:'天兵甲：伤害只剩四成，挨够六下或被金、雷击中碎裂',tip:'连续出手，用金或雷'},
 10:{el:'bing',mech:'surge',d:'千目：每回合攻击 +6%，越拖越强',tip:'速战速决；打中破绽能打散它'}};
const ABYSS_MECH=['shell','heal','tide','surge','swarm'];
function applyBossMech(e,z){let M=BOSS_MECH[z];if(z===7){const m=ABYSS_MECH[S.abyss%5];M=Object.assign({},BOSS_MECH[[1,2,3,6,0][S.abyss%5]],{mech:m,el:pick(['jin','mu','shui','huo','tu','lei'])});}
 if(!M)return e;e.el=M.el;e.mech=M.mech;e.bossD=M.d;e.bossT=M.tip;if(M.healK)e.healK=M.healK;if(M.atkSt)e.atkSt=M.atkSt;if(M.add){e.addLook=M.add;e.addN=M.addN;}return e;}
const _bmE=mkEnemy;mkEnemy=function(z,boss,special){const e=_bmE.apply(this,arguments);if(boss&&!special)applyBossMech(e,z);return e;};
/* 破绽：克制首领五行的元素。优先挑你手上用得出来的 */
function partyEls(){const s=new Set();SKILLS.forEach(k=>{if(k.el&&skOk(k))s.add(k.el);});if(S.fu.lei>0)s.add('lei');if(S.fu.huo>0)s.add('huo');(BT?BT.party:[]).forEach(p=>{if(p.el)s.add(p.el);});return s;}
function bossWeak(a){const E=a.el||'tu',C=Object.keys(KE).filter(x=>KE[x]===E&&EL[x]);const have=partyEls(),ok=C.filter(x=>have.has(x));return pick(ok.length?ok:C.length?C:['lei']);}
const _bmStrike=elStrike;elStrike=function(a,t,el,d,o){
 if(t&&t.alive&&t.side==='e'&&a&&a.side==='p'){
  if(t.chg&&t.weak&&el===t.weak){t.chg=0;t.weak=null;t.exp2=2;BT.shake=.6;btPop(t,'破绽！','crit');btMsg('打中破绽！蓄力被打断');btTip('<b>破绽！</b>'+esc(t.n)+'的蓄力被打断，两回合内受伤加重',2500);sfx('combo');if(t.mech==='surge'&&t.sg){t.atk/=Math.pow(1.06,t.sg);t.sg=0;btPop(t,'灵潮散了','tag');}}
  if(t.exp2>0)d*=daoHas('tianyan')?2:1.5;
  if(t.mech==='swarm'&&BT.foes.some(f=>f.alive&&f.summ)){d*=.5;if(Math.random()<.3)btPop(t,'鼠群护体','tag');}
  if(t.mech==='shell'){if(t.crack>0){}else{t.hits=(t.hits||0)+1;if(el==='jin'||el==='lei'||t.hits>=6){t.crack=2;t.hits=0;btPop(t,'甲壳碎了','crit');}else{d*=.4;if(Math.random()<.35)btPop(t,'甲壳','tag');}}}
  if(a.key==='hero'){if(daoHas('fenshen')&&a.hp<a.max*.5)d*=1.3;if(daoHas('leiyi')&&Math.random()<.2&&t.alive)setTimeout(()=>{if(BT&&t.alive)stAdd(t,'shock',1,a);},60);}}
 return _bmStrike.call(this,a,t,el,d,o);};
const _bmRS=roundStart;roundStart=function(){const r=_bmRS.apply(this,arguments);if(!BT)return r;const fs=BT.foes.filter(f=>f.alive);
 fs.forEach(f=>{if(f.exp2>0)f.exp2--;if(f.crack>0)f.crack--;
  if(f.mech==='surge'&&BT.round>1){f.atk*=1.06;f.sg=(f.sg||0)+1;if(f.sg%2===0)btPop(f,'灵潮 +'+f.sg,'tag');}
  if(f.mech==='swarm'&&(BT.round===1||BT.round%3===0)&&BT.foes.filter(x=>x.alive&&x.summ).length<2){for(let i=0;i<2;i++){const g=mkCustom(Math.max(0,Math.min(f.z||0,10)),{look:f.addLook||'变异鼠',name:f.addN||'鼠群',m:.5});g.noLoot=1;g.summ=1;g.atk*=.6;Object.assign(g,{side:'e',alive:true,ox:0,oy:-10,alpha:0,flash:0,buf:0,defd:false,spd:8,idx:BT.foes.length,max:g.hp});BT.foes.push(g);tween(g,{alpha:1,oy:0},400);}btLayout();btMsg(f.n+' 召来了'+(f.addN||'鼠群'));}});
 if(BT.round===1){const h=BT.party[0];if(h&&daoHas('shuijingx')){h.sh=(h.sh||0)+h.max*.3;btPop(h,'水镜心','buff');}
  const b=fs.find(f=>f.bossD);if(b)setTimeout(()=>{if(BT)btTip('<b>'+esc(b.n)+'</b>　'+esc(b.bossD)+'<br><span>破法：'+esc(b.bossT)+'</span>',6000);},900);}
 return r;};
const _bmDie=btFoeDie;btFoeDie=function(e){const r=_bmDie.apply(this,arguments);if(BT&&daoHas('shafa')&&!e.summ){const h=BT.party[0];if(h&&h.alive){h.atk*=1.1;btPop(h,'杀伐 +10%','buff');}}return r;};

/* ---------- 道果：每破一个大境界，三选一 ---------- */
const DAO={
 fenshen:{n:'焚身',d:'生命低于一半时，伤害 +30%'},
 shuijingx:{n:'水镜心',d:'每场战斗开局，获得三成生命的护盾'},
 jianxin:{n:'剑心通明',d:'暴击 +8%，暴伤 +30%'},
 houtu:{n:'厚土',d:'生命 +20%，防御 +10%'},
 changsheng:{n:'长生',d:'寿元 +20%，每回合回复 3% 生命'},
 tianyan:{n:'天眼',d:'打中首领破绽后，伤害加成从 50% 变为 100%'},
 leiyi:{n:'雷意',d:'你的每次出手有两成几率附带感电'},
 juling2:{n:'聚灵体',d:'吐纳 +25%'},
 jiyuan:{n:'机缘',d:'感悟获取 +50%'},
 shafa:{n:'杀伐',d:'每击败一个敌人，本场攻击 +10%'},
 xixing:{n:'吸星',d:'吸血 +8%'},
 pojun:{n:'破军',d:'攻击 +12%，无视敌人一成防御'}};
const daoHas=k=>!!(S&&S.dao2&&S.dao2.includes(k));
const daoPend=()=>Math.max(0,realmIdx()-((S.dao2||[]).length));
function daoPick(){if(daoPend()<=0||BT||!OV_FREE())return;S.dao2=S.dao2||[];const pool=Object.keys(DAO).filter(k=>!S.dao2.includes(k)).sort(()=>Math.random()-.5).slice(0,3);if(!pool.length)return;
 modal(`<h3>道果 · 参悟</h3><p>破境之后，心中生出三条路。只能走一条。${daoPend()>1?'（还有 '+daoPend()+' 次参悟）':''}</p>`,pool.map(k=>({t:'<b>'+DAO[k].n+'</b><small style="display:block;opacity:.75;font-size:12px">'+DAO[k].d+'</small>',cls:'gold',fn:()=>{S.dao2.push(k);if(k==='changsheng')S.lifeB=(S.lifeB||0)+Math.round(lifeOf(S.stage)*.2);toast('道果 · '+DAO[k].n,'big');sfx('bell');save();render();if(daoPend()>0)setTimeout(daoPick,400);}})));}
const _dfBF=buildFx;buildFx=function(){const A=_dfBF.apply(this,arguments);const add=(k,v)=>A[k]=(A[k]||0)+v;
 if(daoHas('jianxin')){add('critA',.08);add('cd',.3);}if(daoHas('houtu')){add('hpP',.2);add('defP',.1);}if(daoHas('changsheng'))add('regen',.03);if(daoHas('xixing'))add('ls',.08);if(daoHas('pojun')){add('atkP',.12);add('pen',.1);}return A;};
const _dfCB=clanBonus;clanBonus=function(){const b=Object.assign({},_dfCB.apply(this,arguments));if(daoHas('juling2'))b.idle=(b.idle||0)+.25;return b;};
const _dfWu=wuAdd;wuAdd=function(n,q){return _dfWu.call(this,daoHas('jiyuan')?Math.round(n*1.5):n,q);};
const _dfCer=ceremony;ceremony=function(old,r,yrs,L,done){return _dfCer.call(this,old,r,yrs,L,function(){done&&done.apply(this,arguments);setTimeout(daoPick,700);});};
function daoHTML(){const L=(S.dao2||[]).map(k=>DAO[k]);const p=daoPend();
 return `<h2 class="sec">道果 <small>${L.length} 枚</small></h2>${p?`<div class="row2 friend"><div class="in"><div class="iname">尚有 ${p} 次参悟</div><div class="istat">每破一个大境界，可从三条道果里选一条</div></div><div class="ibtn"><button class="btn sm gold" data-act="daoPick">参悟</button></div></div>`:''}${L.length?`<p class="note">${(S.dao2||[]).map(k=>'<b>'+DAO[k].n+'</b>：'+DAO[k].d).join('<br>')}</p>`:'<p class="empty">还没有道果。破一个大境界之后来这里参悟。</p>'}`;}

/* ---------- 因果簿：你种下的种子 ---------- */
const SEED_N={revenge:'有人记恨你',grace:'有人记着你的恩',modis:'血债',sect:'宗门记仇',betray:'弟子离心'};
function yinguoHTML(){const L=(S.seeds||[]).slice().reverse();if(!L.length)return '<p class="empty">你还没有种下什么因果。你做的选择，会在这里留下痕迹。</p>';
 return `<p class="note">你做过的选择，会在很多年之后回来。下面是还在路上的、和已经回来了的。</p>`+L.slice(0,30).map(sd=>{const p=sd.pid&&P_(sd.pid),who=p?p.n:sd.sect&&SECTS[sd.sect]?SECTS[sd.sect].n:'某人';const done=sd.fired;
  return `<div class="row2 ${done?'dim':''} ${sd.k==='grace'?'friend':'foe'}"><div class="in"><div class="iname">${esc(SEED_N[sd.k]||'因果')}<span class="lv">${done?'已了结':'约在'+yearName(sd.due)+'前后'}</span></div><div class="istat">${esc(who)}${sd.why?'：「'+esc(String(sd.why).slice(0,28))+'」':''}${p&&!p.alive?'（已故）':''}</div></div></div>`;}).join('');}

/* ---------- 功能按进度解锁：一开始不把所有东西都摆出来 ---------- */
const FEAT=[
 {k:'shop',n:'坊市',need:()=>S.stage>=3,d:'城南旧街的修士坊市：丹药、法器、符箓、拍卖'},
 {k:'ppl',n:'人物',need:()=>true,d:'江湖上有名有姓的人：他们会老，会变强，也会记仇'},
 {k:'news',n:'传闻',need:()=>S.stage>=3,d:'江湖上一桩接一桩的事'},
 {k:'rank',n:'江湖榜',need:()=>S.stage>=6,d:'天下修士排名'},
 {k:'bounty',n:'悬赏',need:()=>S.stage>=6,d:'每天三张悬赏令'},
 {k:'sect',n:'宗门',need:()=>S.stage>=9,d:'拜入宗门、挑战宗门、天下宗门大比'}];
const featOn=k=>{const f=FEAT.find(x=>x.k===k);return !f||f.need()||!!(S.flags&&S.flags['ul_'+k]);};
function featCheck(){if(!S.started)return;const nw=FEAT.filter(f=>!S.flags['ul_'+f.k]&&f.need());if(!nw.length)return;nw.forEach(f=>S.flags['ul_'+f.k]=1);save();
 if(S.stage>9&&nw.length>3)return;/* 老存档一次性全部解锁，不弹窗 */
 setTimeout(()=>{if(!BT&&OV_FREE()&&!SC)modal(`<h3>新的去处</h3>${nw.map(f=>`<p><b>江湖 · ${f.n}</b><br><span class="note">${f.d}</span></p>`).join('')}<p class="note">点下方「江湖」打开。</p>`,[{t:'去看看',cls:'gold',fn:()=>jhOpen(nw[0].k)},{t:'稍后',cls:'ghost'}]);else toast('新的去处：江湖 · '+nw.map(f=>f.n).join('、'),'big');},600);}
const _ftCS=checkStory;checkStory=function(){const r=_ftCS.apply(this,arguments);try{featCheck();}catch(e){}return r;};
const _ftJR=jhRender;jhRender=function(){_ftJR.apply(this,arguments);const el=$('#jh');if(!el)return;el.querySelectorAll('[data-jt]').forEach(b=>{if(!featOn(b.dataset.jt))b.style.display='none';});};
const _ftJO=jhOpen;jhOpen=function(tab,sub){if(tab&&!featOn(tab)){toast('还没到时候——修为再高些','bad');return;}if(!tab&&!featOn(JH.tab))JH.tab=FEAT.find(f=>featOn(f.k))?FEAT.find(f=>featOn(f.k)).k:'ppl';return _ftJO.apply(this,arguments);};

/* ---------- 背景音乐：五声音阶，按场景换调 ---------- */
let BGM={on:(()=>{try{return localStorage.getItem('lc_bgm')!=='0';}catch(e){return true;}})(),mode:null,t:0,bus:null,step:0};
const BGM_MODE={
 town:{root:220,scale:[0,2,4,7,9],gap:[.7,1.6],oct:[0,1],v:.05,drone:110},
 wild:{root:196,scale:[0,3,5,7,10],gap:[.9,2],oct:[-1,0,1],v:.045,drone:98},
 battle:{root:220,scale:[0,3,5,7,10],gap:[.22,.45],oct:[0,1],v:.05,drum:.5},
 boss:{root:164.8,scale:[0,1,5,7,8],gap:[.18,.36],oct:[-1,0],v:.055,drum:.33,drone:82.4},
 calm:{root:261.6,scale:[0,2,4,7,9],gap:[1.2,2.6],oct:[0,1],v:.04,drone:130.8}};
function bgmMode(){if(BT)return BT.foes.some(f=>f.boss)?'boss':'battle';if(SC||(typeof TAB!=='undefined'&&(TAB==='cult'||TAB==='story')))return 'calm';if(WD.M&&WD.M.kind!=='town'&&!WD.M.mk)return 'wild';return 'town';}
function pluck(f,at,v,dur){if(!AC||!BGM.bus)return;const t=AC.currentTime+at,o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
 o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.003;lp.type='lowpass';lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+dur);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(BGM.bus);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);}
function bgmTick(dt){if(!BGM.on||MUTE||!AC||AC.state!=='running')return;if(!BGM.bus){BGM.bus=AC.createGain();BGM.bus.gain.value=.9;BGM.bus.connect(AC.destination);}
 const m=bgmMode();if(m!==BGM.mode){BGM.mode=m;BGM.t=0;BGM.step=0;}const M=BGM_MODE[m];BGM.t-=dt;if(BGM.t>0)return;
 BGM.t=M.gap[0]+Math.random()*(M.gap[1]-M.gap[0]);BGM.step++;const deg=pick(M.scale),oc=pick(M.oct),f=M.root*Math.pow(2,deg/12+oc);pluck(f,0,M.v,m==='battle'||m==='boss'?.5:1.8);
 if(Math.random()<.25)pluck(f*Math.pow(2,pick(M.scale)/12),.09,M.v*.6,1.2);
 if(M.drum&&BGM.step%2===0)tone(m==='boss'?55:70,.18,{v:.09,to:40});
 if(M.drone&&BGM.step%8===1)tone(M.drone,3.2,{v:.025,a:.6});}
function bgmToggle(){BGM.on=!BGM.on;try{localStorage.setItem('lc_bgm',BGM.on?'1':'0');}catch(e){}if(BGM.on)acInit();toast(BGM.on?'背景音乐已开启':'背景音乐已关闭');const b=$('#bgmBtn');if(b)b.textContent=BGM.on?'音乐 开':'音乐 关';}

/* 战斗里的提示卡：比顶部那一行字能多说几句 */
function btTip(html,ms){const st=$('#btStage');if(!st)return;let el=$('#btTip');if(!el){el=document.createElement('div');el.id='btTip';el.className='bt-tip';st.appendChild(el);}el.innerHTML=html;el.classList.remove('off');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.add('off'),ms||4000);}

/* ---------- 首领插画：战斗里用画好的首领替换程序画的小图 ---------- */
const BOSS_ART=['shuwang','baizu','huaiyao','haiyan','zero','duoxian','lingchao','shouguan','jing','tianjiang','muzhe'];
const BOSS_LOOK_ART={'堕仙残躯':'duoxian'};
function bossArtKey(a){if(a.side!=='e')return null;if(a.jie)return 'jieyun';if(a.boss&&!a.elite&&a.z!=null&&!a.special&&BOSS_ART[a.z])return BOSS_ART[a.z];return BOSS_LOOK_ART[a.look]||null;}
const _baP=btPortrait;btPortrait=function(a){const k=bossArtKey(a),im=k&&ART_IMG['boss_'+k];if(!im)return _baP.apply(this,arguments);
 const asp=im.width/im.height;const h=Math.max(40,Math.round(Math.min(BT.H*(a.jie?.45:.62),BT.W*.6/asp))),w=Math.round(h*asp);
 return cvMemo('boss-art|'+k+'|'+w+'x'+h,()=>{const cv=mkCv(w*2,h*2),x=cv.getContext('2d');cv.ww=w;cv.hh=h;x.translate(cv.width,0);x.scale(-1,1);x.drawImage(im,0,0,cv.width,cv.height);x.setTransform(1,0,0,1,0,0);
  x.globalCompositeOperation='destination-in';const g=x.createLinearGradient(0,cv.height*.9,0,cv.height);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);return cv;});};

/* ---------- 丹药与符箓图标 ---------- */
function ico(k){const im=ART_IMG['ico_'+k];return im?`<img class="ico" src="${im.src}" alt="">`:'';}
function danHTML(){const L=[['shouyuan','寿元丹',S.lifeP||0,'延寿三十年；可自服，也可赠人','<button class="btn sm" data-act="eatLife">服用</button>'],['zhuji','筑基丹',S.zjDan||0,'可赠凡人生出灵根，或给弟子冲关',''],['jiuzhuan','九转金丹',(S.jzDan||0)+(F('rw_jz')?1:0),'续寿极多，可赠人',''],['huanhun','还魂丹',S.hhDan||0,'起死回生，只能给已故之人','']].filter(x=>x[2]>0);
 if(!L.length)return '';return `<h2 class="sec">丹药匣 <button class="btn sm gold" data-act="gift">赠丹</button></h2>`+L.map(x=>`<div class="row2"><div class="in"><div class="iname">${ico(x[0])}${x[1]} <span class="lv">持有 ${x[2]}</span></div><div class="istat">${x[3]}</div></div><div class="ibtn">${x[4]}</div></div>`).join('');}

/* ---------- 剧情大图：关键时刻整屏显示，点一下继续；卷宗里可以回看 ---------- */
const CG={dujie:'九霄雷劫',lingchao:'灵潮之夜',xiaochen:'心魔',yujian:'玉简合一',bie:'人间·别',feisheng:'飞升'};
function cgShow(k){if(!CG[k])return;S.cgSeen=S.cgSeen||[];if(!S.cgSeen.includes(k))S.cgSeen.push(k);const im=new Image();im.onload=()=>{let el=$('#cgOv');if(el)el.remove();el=document.createElement('div');el.id='cgOv';el.className='cg-ov';
 el.innerHTML=`<img src="${im.src}" alt=""><div class="cg-cap">${CG[k]}<small>点击继续</small></div>`;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));sfx('bell');
 setTimeout(()=>{el.onclick=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),450);};},500);};im.src='art/cg_'+k+'.jpg';}
function cgHTML(){const L=Object.keys(CG);const got=S.cgSeen||[];return `<p class="note">剧情里见过的画面，会收在这里。</p><div class="cg-grid">${L.map(k=>got.includes(k)?`<button class="cg-th" data-act="cgView" data-arg="${k}"><img loading="lazy" src="art/cg_${k}.jpg" alt=""><span>${CG[k]}</span></button>`:`<div class="cg-th lock"><span>？？？</span></div>`).join('')}</div>`;}
