/* ================= 回合制战斗 ================= */
let BT=null;
const SKILLS=[
 {k:'yujian',n:'御剑术',mp:5,lv:0,ty:'one',pow:2.1,fx:'sword',d:'飞剑斩击一名敌人'},
 {k:'huichun',n:'回春术',mp:8,lv:4,ty:'heal',pow:.38,d:'恢复全体同伴生命'},
 {k:'hengsao',n:'剑气横扫',mp:11,lv:9,ty:'all',pow:1.25,fx:'sweep',d:'剑气横扫所有敌人'},
 {k:'jingang',n:'金刚护体',mp:10,lv:13,ty:'buff',d:'三回合内全体受伤减半'},
 {k:'leijue',n:'太一雷诀',mp:16,lv:17,ty:'all',pow:1.9,fx:'bolt',d:'引天雷轰击所有敌人'},
 {k:'wanjian',n:'万剑归宗',mp:26,lv:21,ty:'all',pow:3,fx:'swords',d:'万剑齐落，横扫全场'},
 {k:'huolong',n:'火龙术',mp:14,book:'huolong',ty:'all',pow:1.6,fx:'fire',d:'火龙席卷所有敌人'},
 {k:'xuanbing',n:'玄冰掌',mp:12,book:'xuanbing',ty:'one',pow:1.9,eff:'freeze',d:'重击并冻住目标一回合'},
 {k:'xixing',n:'吸星',mp:10,book:'xixing',ty:'one',pow:1.5,eff:'drain',d:'吸取敌人生命，化为己用'},
 {k:'mingwang',n:'明王身',mp:12,book:'mingwang',ty:'self',d:'两回合内受到的伤害减七成'},
 {k:'feixian',n:'天外飞仙',mp:30,book:'feixian',ty:'one',pow:4.5,d:'一剑，倾尽灵力'}
];
const skOk=s=>s.root?(hasRoot(s.root)&&realmIdx()>=(s.rl||0)):s.book?S.learned.includes(s.book):S.stage>=s.lv;
const penD=(a,t)=>t.def*(1-(a.pen||0));
const BTB={town:{sky:['#0c100e','#232a24'],far:'wall',fl:'tile'},0:{sky:['#030505','#14221e'],far:'arch',fl:'gravel'},1:{sky:['#2a1418','#d07a42'],far:'city',fl:'asphalt'},2:{sky:['#0a1610','#2c4a3a'],far:'trees',fl:'grass'},
 3:{sky:['#4a5a60','#a8b4b4'],far:'cranes',fl:'plank'},4:{sky:['#0a0816','#2c2244'],far:'lab',fl:'metal'},5:{sky:['#160806','#6a2414'],far:'ruins',fl:'basalt'},6:{sky:['#fff4d0','#a8883e'],far:'light',fl:'gold'},7:{sky:['#05040a','#20123a'],far:'void',fl:'pstone'},8:{sky:['#03040c','#141a3a'],far:'void',fl:'star'},9:{sky:['#fff8e8','#c8b07a'],far:'light',fl:'jadeT'},10:{sky:['#04020a','#2a0a24'],far:'void',fl:'ashv'}};
const btSpd=()=>BT&&BT.auto?1.8:1;
let STREAK=0;/* 连斩：连续打赢的场数，只在本次出行内有效，不进存档 */
const bwait=ms=>new Promise(r=>setTimeout(r,ms/btSpd()));
function tween(o,to,ms){return new Promise(res=>{const fr={};for(const k in to)fr[k]=o[k];const t0=performance.now(),D=Math.max(16,ms/btSpd());const f=t=>{const k=Math.min(1,(t-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;for(const p in to)o[p]=fr[p]+(to[p]-fr[p])*e;if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
function mkParty(){const st=stats(),mm0=Math.round(20+S.stage*3),mm=Math.round(mm0*(1+st.mp));
 const P=[{key:'hero',spr:S.gender==='f'?'hero_f':'hero_m',name:S.name,max:st.hp,hp:Math.max(1,st.hp*(S.hpF??1)),mmax:mm,mp:Math.round(mm*(S.mpF??1)),atk:st.atk,def:st.def,crit:st.crit,healK:st.heal,spd:12+st.spd,ls:st.ls,cd:st.cd,pen:st.pen,mreg:st.mreg,dr:st.dr,dodge:st.dodge}];
 const comp=(key,name,k)=>({key,spr:key,name,max:st.hp*.8,hp:st.hp*.8,mmax:mm0,mp:mm0,atk:st.atk*k,def:st.def*.8,crit:.08,spd:9+Math.random()*4});
 const C=[];const add=(k,name,m)=>{if(C.length<2&&!C.some(c=>c.key===k))C.push(comp(k,name,m));};
 partners().forEach(pk=>{if(['zhou','su','ning','cm','hong','xiao'].includes(pk)&&!(BOND[pk].away&&safe(BOND[pk].away)))add(pk,BOND[pk].n,1);});
 if(BOND.zero.met()&&avOf('zero')>=40)add('zero','初一',(S.sworn||[]).includes('zero')?1.05:.85);if(qDone('zhou1')||(F('zhouSaved')&&avOf('zhou')>=50))add('zhou','周烈',.9);
 if(F('feisheng')&&avOf('su')>=40)add('su','苏绾',1);if(F('chenmoStay')&&!F('chenmoGone')&&avOf('cm')>=50)add('cm','陈默',.85);C.forEach(c=>P.push(c));
 return P.map(a=>Object.assign(a,{side:'p',alive:true,ox:0,oy:0,alpha:1,flash:0,buf:0,defd:false,walk:0}));}
function startBattle(foes,opt){if(BT)return;opt=opt||{};const bgk=opt.bg!==undefined?opt.bg:(WD.M&&WD.M.kind!=='town'?WD.M.z:'town');
 BT={opt,bgk,party:mkParty(),foes:foes.map((e,i)=>Object.assign(e,{side:'e',alive:true,ox:-28,oy:-14,alpha:0,flash:0,buf:0,defd:false,spd:e.spd||(7+Math.random()*4),idx:i,max:e.max||e.hp})),q:[],round:0,auto:!!S.btAuto,phase:'intro',t:0,fx:[],parts:[],shake:0,pend:null,loot:[],cur:null};btScale();btPrep();
 const el=$('#bt');el.hidden=false;el.innerHTML=`<div class="bt-stage" id="btStage"><canvas id="btc"></canvas><div class="bt-msg" id="btMsg"></div><button class="bt-auto" id="btAuto">自动</button><div class="bt-fx" id="btFx"></div></div>
  <div class="bt-panel"><div class="bt-party" id="btParty"></div><div class="bt-cmd" id="btCmd"></div></div><div class="bt-res" id="btRes" hidden></div>`;
 btFit();btLayout();BT.party.forEach(p=>{p.ox=26;p.oy=14;p.alpha=0;});btParty();btAutoBtn();if(!opt.farm&&BT.foes.some(f=>f.boss||f.elite))btMsg('战力 · 我方 '+fmt(BT.cpP)+' ： 敌方 '+fmt(BT.cpE)+(BT.cpE>BT.cpP*1.15?' · 劲敌':BT.cpE<BT.cpP*.6?' · 稳胜':''));if(opt.farm&&FARM){btMsg((FARM.z===7?'深渊自动闯关 · 第 '+(S.abyss+1)+' 层':'连战 · 第 '+FARM.n+' 场')+(FARM.st?' · 累计灵石 '+fmt(FARM.st):''));const st=$('#btStage'),b=document.createElement('button');b.className='bt-auto bt-stop';b.id='btStop';b.textContent=FARM.stop?'本场后停':'收手';b.onclick=()=>{if(!FARM)return;FARM.stop=1;b.textContent='本场后停';b.classList.add('on');};st.appendChild(b);}
 $('#btAuto').onclick=()=>{BT.auto=!BT.auto;S.btAuto=BT.auto;btAutoBtn();if(BT.auto&&BT.phase==='cmd'&&BT.cur){BT.pend=null;btDo(BT.cur,btAI(BT.cur));}};
 $('#btCmd').onclick=e=>{const b=e.target.closest('[data-b]');if(b&&!b.disabled)btCmdTap(b.dataset.b);};
 $('#btc').onpointerdown=e=>{if(!BT||!BT.pend)return;const r=e.currentTarget.getBoundingClientRect(),gx=(e.clientX-r.left)/r.width*BT.W,gy=(e.clientY-r.top)/r.height*BT.H;let best=null,bd=1e9;
  BT.foes.forEach(f=>{if(!f.alive)return;const s=btSpr(f),d=Math.abs(gx-f.bx)+Math.abs(gy-(f.by-s.hh/2));if(d<bd&&d<s.ww){bd=d;best=f;}});if(best)btExec(best);};
 (async()=>{await Promise.all([...BT.foes,...BT.party].map(a=>tween(a,{ox:0,oy:0,alpha:1},420)));const f0=BT.foes[0];btMsg(BT.foes.length>1?'妖兽成群扑了上来！':f0.boss?'「'+f0.n+'」挡在你面前！':f0.n+' 出现了！');await bwait(650);btRound();})();}
/* 敌人按我方人数调整：一个人打首领，不必面对三人份的血量 */
function btScale(){const n=Math.min(3,BT.party.length),hk=[1,.38,.72,1][n],ak=[1,.8,.9,1][n];BT.foes.forEach(f=>{if(f.pk&&!f.pkd){f.pkd=1;f.hp*=hk;f.max*=hk;f.atk*=ak;}});
 BT.cpP=BT.party.reduce((t,a)=>t+cpOf(a.atk,a.max,a.crit),0);BT.cpE=BT.foes.reduce((t,f)=>t+cpOf(f.atk,f.max,0),0);}
function btFit(){const st=$('#btStage'),cv=$('#btc');const f=fitCanvas(cv,st,260);Object.assign(BT,{W:f.W,H:f.H,k:f.k,dpr:f.dpr,offX:f.ox,offY:f.oy,cx:cv.getContext('2d')});}
function btLayout(){const FP={1:[[.30,.6]],2:[[.22,.52],[.38,.7]],3:[[.16,.5],[.38,.58],[.22,.74]]},PP={1:[[.72,.8]],2:[[.64,.72],[.84,.82]],3:[[.60,.66],[.84,.72],[.70,.85]],4:[[.58,.64],[.82,.68],[.68,.82],[.90,.88]]};
 const fl=FP[Math.min(3,BT.foes.length)],pl=PP[Math.min(4,BT.party.length)];BT.foes.forEach((f,i)=>{const p=fl[i]||fl[0];f.bx=Math.round(BT.W*p[0]);f.by=Math.round(BT.H*p[1]);});BT.party.forEach((a,i)=>{const p=pl[i];a.bx=Math.round(BT.W*p[0]);a.by=Math.round(BT.H*p[1]);});}
function btSpr(a){const art=btPortrait(a);if(art)return art;if(a.jie)return cvMemo('jiecv',()=>{const c=jieCv();return btUp(c,1.4);});if(a.side==='p'){const fr=a.walk?[1,2][Math.floor(BT.t*8)%2]:0;return cvMemo('hbp|'+a.spr+'|'+fr,()=>btUp(chSpr(a.spr,1,fr,9),2));}
 return cvMemo('hbf|'+a.look+'|'+(a.boss?1:0)+'|'+(a.tint?1:0),()=>btUp(monCv(a.look,a.boss?1.5:1,a.tint,9),monIsHuman(a.look)?1.55:2));}
// Reuse the transparent story portraits without changing source assets or map sprites.
function btPortrait(a){
 if(a.jie)return null;
 const look=LOOK[a.look]||{},key=a.side==='p'?a.spr:(look.k==='cult'?'zhou':(CH_POR[MON_CH[look.k]]||MON_CH[look.k]));
 const im=ART_IMG['por_'+key];if(!im)return null;
 const h=Math.round(Math.max(34,Math.min(96,BT.H*.43,BT.W*.34))),w=Math.round(h*.62);
 return cvMemo('battle-portrait|'+key+'|'+a.side+'|'+w+'x'+h,()=>{
  const cv=mkCv(w*3,h*3),x=cv.getContext('2d');cv.ww=w;cv.hh=h;cv.artKey=key;
  // Keep head, hands and clothing intact; soften the lower edge into the battlefield.
  const scale=Math.min(cv.width/im.width,cv.height/im.height),iw=im.width*scale,ih=im.height*scale;
  if(a.side==='e'){x.translate(cv.width,0);x.scale(-1,1);}
  x.drawImage(im,(cv.width-iw)/2,cv.height-ih,iw,ih);
  x.globalCompositeOperation='destination-in';const g=x.createLinearGradient(0,cv.height*.86,0,cv.height);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);
  return cv;
 });
}
function btUp(c,k){const n=mkCv(c.width,c.height);n.getContext('2d').drawImage(c,0,0);n.ww=dw(c)*k;n.hh=dh(c)*k;return n;}
const btWhite=(a,s)=>cvMemo('bw|'+(a.side==='p'?a.spr+(a.walk?1:0):a.look+(a.boss?1:0)+(a.tint?1:0))+s.ww,()=>whiteCv(s));
function btMsg(s){const m=$('#btMsg');if(m){m.textContent=s;m.classList.remove('on');void m.offsetWidth;m.classList.add('on');}}
function btAutoBtn(){const b=$('#btAuto');if(b){b.classList.toggle('on',BT.auto);b.textContent=BT.auto?'自动中':'自动';}}
function btParty(){const el=$('#btParty');if(!el||!BT)return;el.innerHTML=BT.party.map(a=>`<div class="pm ${BT.cur===a?'cur':''} ${a.alive?'':'dead'}"><div class="nm">${esc(a.name)}${a.buf>0?' <em>护体</em>':''}${a.defd?' <em>防御</em>':''}${a.sh>0?' <em class="sh">盾'+fmt(a.sh)+'</em>':''}${a.big>0?' <em>法相</em>':''}${stChips(a).map(c=>' <em class="stc" style="color:'+ST_C[c[0]]+'">'+c[1]+'</em>').join('')}</div>
  <div class="bb"><i class="hb"><i style="width:${Math.max(0,a.hp/a.max*100)}%"></i></i><span>${fmt(a.hp)}/${fmt(a.max)}</span></div><div class="bb"><i class="mb"><i style="width:${Math.max(0,a.mp/a.mmax*100)}%"></i></i><span>${Math.floor(a.mp)}/${a.mmax}</span></div></div>`).join('');}
function btSetCmd(h,cls){const c=$('#btCmd');if(c){c.className='bt-cmd '+(cls||'');c.innerHTML=h;}}

/* ---------- 回合流程 ---------- */
function btRound(){if(!BT)return;BT.round++;roundStart();BT.q=[...BT.party,...BT.foes].filter(a=>a.alive).sort((a,b)=>(b.spd+Math.random()*4)-(a.spd+Math.random()*4));btNext();}
function btNext(){if(!BT||btCheck())return;let a;while((a=BT.q.shift())&&!a.alive);if(!a){BT.party.forEach(p=>{if(p.buf>0)p.buf--;if(p.mw>0)p.mw--;if(p.alive)p.mp=Math.min(p.mmax,p.mp+p.mmax*(.06+(p.mreg||0)+(S.form==='juling'?.06:0)));});btParty();btRound();return;}
 BT.cur=a;a.defd=false;btParty();{const sk=stTick(a);if(sk){if(sk!=='dead')btMsg((a.n||a.name)+' '+sk);setTimeout(()=>{if(BT)btNext();},560/btSpd());return;}}if(a.side==='e'){if(a.frozen>0){a.frozen--;btMsg(a.n+' 被冻住了，动弹不得');setTimeout(()=>{if(BT)btNext();},520/btSpd());return;}btDo(a,btFoeAI(a));return;}if(a.key==='hero'&&!BT.auto){btCmdMain();return;}btDo(a,btAI(a));}
function btCheck(){if(!BT.foes.some(f=>f.alive)){btWin();return true;}if(!BT.party[0].alive){btLose();return true;}return false;}
function btCmdMain(){BT.phase='cmd';BT.pend=null;btMsg('「'+BT.cur.name+'」要怎么做？');
 btSetCmd(`<button data-b="atk"><b>攻击</b><small>普通一击</small></button><button data-b="sk"><b>法术</b><small>灵力 ${Math.floor(BT.cur.mp)}</small></button><button data-b="shen" ${realmIdx()>=2?'':'disabled'}><b>神通</b><small>${realmIdx()>=2?'境界之力':'金丹后开启'}</small></button><button data-b="it"><b>道具</b><small>丹药 ${S.meds+S.mps} · 符 ${Object.values(S.fu).reduce((a,b)=>a+b,0)}</small></button><button data-b="def"><b>防御</b><small>减伤并回灵</small></button><button data-b="flee" ${BT.opt.noFlee?'disabled':''}><b>逃跑</b><small>${BT.opt.noFlee?'无法逃离':'有机会脱身'}</small></button>`,'main');}
function btCmdTap(b){const a=BT.cur;if(!a||BT.phase!=='cmd')return;
 if(b==='back'){btCmdMain();return;}
 if(b==='atk'){BT.pend={type:'atk'};btTargets();return;}
 if(b==='shen'){shenMenu();return;}
 if(b.startsWith('n:')){btDo(a,{type:'shen',k:b.slice(2)});return;}
 if(b.startsWith('f:')){btDo(a,{type:'fu',k:b.slice(2)});return;}
 if(b==='sk'){const L=SKILLS.filter(skOk);btSetCmd(L.map(s=>`<button class="li" data-b="s:${s.k}" ${a.mp<skCost(s)?'disabled':''}><b>${s.el?'<i class="elg" style="--ec:'+EL[s.el].c+'">'+EL[s.el].n+'</i>':''}${s.n}</b><small>${s.d} · 灵力 ${skCost(s)}</small></button>`).join('')+`<p class="hint">${SKILLS.find(s=>!s.book&&S.stage<s.lv)?'境界提升后会领悟更多法术；研读秘籍还能学到别的。':''}</p><button class="li back" data-b="back">返回</button>`,'list');return;}
 if(b.startsWith('s:')){const sk=SKILLS.find(s=>s.k===b.slice(2));if(sk.ty==='one'){BT.pend={type:'sk',sk};btTargets();}else btDo(a,{type:'sk',sk});return;}
 if(b==='it'){btSetCmd(`<button class="li" data-b="i:meds" ${S.meds?'':'disabled'}><b>疗伤药 ×${S.meds}</b><small>恢复生命最低的同伴 50% 生命</small></button><button class="li" data-b="i:mps" ${S.mps?'':'disabled'}><b>清心丹 ×${S.mps}</b><small>恢复 60% 灵力</small></button>${Object.keys(FU).filter(k=>S.fu[k]>0).map(k=>`<button class="li" data-b="f:${k}"><b>${ico('fu_'+k)}${FU[k].n} ×${S.fu[k]}</b><small>${FU[k].d}</small></button>`).join('')}<button class="li back" data-b="back">返回</button>`,'list');return;}
 if(b.startsWith('i:')){btDo(a,{type:'it',k:b.slice(2)});return;}
 if(b==='def'){btDo(a,{type:'def'});return;}
 if(b==='flee'){btDo(a,{type:'flee'});return;}
 if(b.startsWith('t:')){const f=BT.foes[+b.slice(2)];if(f&&f.alive)btExec(f);}}
function btTargets(){const fs=BT.foes.filter(f=>f.alive);if(fs.length===1){btExec(fs[0]);return;}btMsg('选择目标，也可以直接点妖兽');
 btSetCmd(fs.map(f=>`<button class="li tg" data-b="t:${f.idx}"><b>${esc(f.n)}</b><i class="hb"><i style="width:${f.hp/f.max*100}%"></i></i></button>`).join('')+'<button class="li back" data-b="back">返回</button>','list');}
function btExec(t){const p=BT.pend;BT.pend=null;if(!p)return;p.t=t;btDo(BT.cur,p);}
function btAI(a){const fs=BT.foes.filter(f=>f.alive),ps=BT.party.filter(p=>p.alive);const weak=fs.reduce((m,f)=>f.hp<m.hp?f:m,fs[0]);
 if(a.key==='hero'){const sk=k=>SKILLS.find(s=>s.k===k&&skOk(s)&&a.mp>=s.mp);const boss=fs.find(f=>f.boss);
  {const cf=fs.find(f=>f.chg&&f.weak);if(cf){const ws=SKILLS.find(s=>s.el===cf.weak&&skOk(s)&&a.mp>=skCost(s)&&(s.ty==='one'||s.ty==='all'));if(ws)return {type:'sk',sk:ws,t:cf};if(cf.weak==='lei'&&S.fu.lei>0)return {type:'fu',k:'lei'};if(cf.weak==='huo'&&S.fu.huo>0)return {type:'fu',k:'huo'};}}
  if(fs.some(f=>f.chg)&&!a.mw&&!(a.buf>0)&&!(a.sh>a.max*.2)){if(sk('mingwang'))return {type:'sk',sk:sk('mingwang')};return {type:'def'};}
  if(boss&&a.mp>=a.mmax*.6&&sk('feixian'))return {type:'sk',sk:sk('feixian'),t:boss};if(a.hp<a.max*.45&&!a.mw&&sk('mingwang'))return {type:'sk',sk:sk('mingwang')};
  if(ps.some(p=>p.hp<p.max*.4)&&sk('huichun'))return {type:'sk',sk:sk('huichun')};if(a.hp<a.max*.3&&S.meds>0)return {type:'it',k:'meds'};
  const smart=btSmart(a,fs,ps,sk,boss);if(smart)return smart;
  if(fs.length>1){const s=sk('wanjian')||sk('leijue')||sk('huolong')||sk('hengsao');if(s)return {type:'sk',sk:s};}
  if(a.hp<a.max*.6&&sk('xixing'))return {type:'sk',sk:sk('xixing'),t:weak};if(a.mp>a.mmax*.45&&(sk('xuanbing')||sk('yujian')))return {type:'sk',sk:sk('xuanbing')||sk('yujian'),t:boss&&!boss.frozen?boss:weak};return {type:'atk',t:weak};}
 if(a.key==='su'&&Math.random()<.4)return {type:'call',n:'星落',fx:'bolt',pow:1.3};if(a.key==='ning'&&Math.random()<.45)return {type:'csk',n:'黑白子',fx:'orb',pow:2.2,t:pick(fs)};
 if(a.key==='cm'&&Math.random()<.4)return {type:'csk',n:'开山斧',fx:'orb',pow:1.9,t:pick(fs)};if(a.key==='hong'&&(ps.some(p=>p.hp<p.max*.6)||Math.random()<.2))return {type:'cheal',n:'药雾'};
 if(a.key==='zero'&&Math.random()<.4)return {type:'csk',n:'灵弹',fx:'orb',pow:1.8,t:pick(fs)};
 if(a.key==='zhou'&&Math.random()<.35)return {type:'call',n:'烈火掌',fx:'fire',pow:1.05};
 return {type:'atk',t:pick(fs)};}
function btFoeAI(a){const ps=BT.party.filter(p=>p.alive);if(a.jie)return {type:'jie'};a.cnt=(a.cnt||0)+1;
 if(a.boss&&!a.enr&&a.hp<a.max*.3){a.enr=1;a.atk*=1.3;btPop(a,'狂暴','st burn');btMsg(a.n+'狂暴了！攻击大增');}
 if(a.boss&&a.chg&&ps.length){a.chg=0;if(a.mech==='tide')return {type:'etide'};return {type:'eheavy',t:ps.find(p=>p.key==='hero')||ps[0]};}
 if(a.boss&&a.cnt%3===0&&ps.length)return {type:'eall'};
 if(a.boss&&a.cnt%4===2&&ps.length)return {type:'echarge'};
 const t=Math.random()<.55?ps[0]:pick(ps);return {type:'eatk',t};}

/* ---------- 行动演出 ---------- */
async function btLunge(a,t){a.walk=1;const k=a.side==='p'?.62:.58;await tween(a,{ox:(t.bx-a.bx)*k,oy:(t.by-a.by)*k},190);}
async function btBack(a){await tween(a,{ox:0,oy:0},180);a.walk=0;}
async function btCast(a,col){BT.fx.push({k:'circle',x:a.bx,y:a.by,col:col||'#8fd6b5',t0:BT.t,dur:.8});BT.fx.push({k:'ring',x:a.bx,y:a.by-20,col:col||'#8fd6b5',t0:BT.t,dur:.5});await tween(a,{oy:-6},110);await tween(a,{oy:0},110);}
const ctr=a=>{const s=btSpr(a);return [a.bx+a.ox,a.by+a.oy-s.hh*.55];};
async function btDo(a,act){if(!BT)return;BT.phase='anim';BT.pend=null;btSetCmd('','idle');
 if(act.type==='atk'){btMsg(a.name+' 发起攻击');await btLunge(a,act.t);let d=dmgF(a.atk,penD(a,act.t));const cr=Math.random()<(a.crit||.05);if(cr)d*=1.8+(a.cd||0);BT.fx.push({k:'slash',x:act.t.bx,y:act.t.by-btSpr(act.t).hh*.55,cr,t0:BT.t,dur:.28});elStrike(a,act.t,null,d,{cr,phys:1});await btBack(a);}
 else if(act.type==='sk'){const sk=act.sk;a.mp-=skCost(sk);btMsg(a.name+' 施展「'+sk.n+'」');BT.fx.push({k:'banner',x:a.bx,y:a.by-btSpr(a).hh-14,txt:sk.n,col:sk.el?EL[sk.el].c:'#8fd6b5',t0:BT.t,dur:1.2});sfx(sk.el==='lei'?'thunder':sk.el==='huo'?'fire':sk.el==='bing'?'ice':'cast');await btCast(a,sk.el?EL[sk.el].c:sk.ty==='heal'?'#8fd6b5':'#e3b862');const rm=rotStep(a,sk.el),so={st:sk.st,stn:sk.stn,chance:sk.chance,combo:sk.combo,mul:rm,drain:sk.drain};
  if(sk.ty==='one'){const [x0,y0]=ctr(a),[x1,y1]=ctr(act.t);BT.fx.push({k:'proj',x0,y0,x1,y1,col:'#e8fff4',t0:BT.t,dur:.32});await bwait(320);let dd=dmgF(a.atk*sk.pow,penD(a,act.t)*.6);const cr=Math.random()<(a.crit||.05);if(cr)dd*=1.8+(a.cd||0);if(sk.eff==='drain')so.drain=.5;elStrike(a,act.t,sk.el,dd,Object.assign(so,{cr}));if(sk.eff==='freeze'&&act.t.alive){act.t.frozen=1;btPop(act.t,'冻结','st chill');}}
  else if(sk.ty==='self'){a.mw=2;btPop(a,'明王身','buff');BT.fx.push({k:'ring',x:a.bx,y:a.by-24,col:'#ffd070',t0:BT.t,dur:.7});}
  else if(sk.ty==='all'){const ts=BT.foes.filter(f=>f.alive);await btArea(sk.fx,a,ts);ts.forEach(t=>{if(t.alive)elStrike(a,t,sk.el,dmgF(a.atk*sk.pow,penD(a,t)*.7),so);});if(sk.heal)BT.party.filter(p=>p.alive).forEach(p=>btHeal(p,p.max*sk.heal));}
  else if(sk.ty==='shield'){const k=(hasRoot('shui')&&a.key==='hero'?1.5:1);BT.party.filter(p=>p.alive).forEach(p=>{p.sh=(p.sh||0)+p.max*sk.pow*k;if(sk.el==='shui')p.rf=Math.max(p.rf||0,.3);btPop(p,'护盾','buff');BT.fx.push({k:'ring',x:p.bx,y:p.by-24,col:EL[sk.el].c,t0:BT.t,dur:.7});});if(sk.wetAll)BT.foes.filter(f=>f.alive).forEach(f=>stAdd(f,'wet',3,a));}
  else if(sk.ty==='heal'){BT.party.filter(p=>p.alive).forEach(p=>{btHeal(p,p.max*sk.pow*(a.healK?a.healK/.35:1));if(sk.regen)p.rg=sk.regen;});}
  else if(sk.ty==='buff'){BT.party.forEach(p=>{if(p.alive){p.buf=3;btPop(p,'护体','buff');BT.fx.push({k:'ring',x:p.bx,y:p.by-24,col:'#e3b862',t0:BT.t,dur:.6});}});}}
 else if(act.type==='csk'){btMsg(a.name+' 使出「'+act.n+'」');await btCast(a,'#7ff0ff');const [x0,y0]=ctr(a),[x1,y1]=ctr(act.t);BT.fx.push({k:'proj',x0,y0,x1,y1,col:a.el?EL[a.el].c:'#7ff0ff',orb:1,t0:BT.t,dur:.3});await bwait(300);elStrike(a,act.t,a.el,dmgF(a.atk*act.pow,act.t.def*.6),{st:{huo:'burn',lei:'shock',jin:'brk',tu:'stun',mu:'root'}[a.el],stn:a.el==='jin'?2:1,chance:a.el==='tu'||a.el==='mu'?.3:1});}
 else if(act.type==='cheal'){btMsg(a.name+' 撒出「'+act.n+'」');await btCast(a,'#8fd6b5');BT.party.filter(p=>p.alive).forEach(p=>btHeal(p,p.max*.25));}
 else if(act.type==='call'){btMsg(a.name+' 使出「'+act.n+'」');await btCast(a,'#ff8a3a');const ts=BT.foes.filter(f=>f.alive);await btArea('fire',a,ts);ts.forEach(t=>{if(t.alive)elStrike(a,t,a.el,dmgF(a.atk*act.pow,t.def*.7),{st:a.el==='huo'?'burn':a.el==='lei'?'shock':null,stn:1});});}
 else if(act.type==='it'){const k=act.k;if(k==='meds'&&S.meds>0){S.meds--;const t=BT.party.filter(p=>p.alive).reduce((m,p)=>p.hp/p.max<m.hp/m.max?p:m);btMsg(a.name+' 给 '+t.name+' 用了疗伤药');btHeal(t,t.max*.5);}
  else if(k==='mps'&&S.mps>0){S.mps--;btMsg(a.name+' 服下清心丹');a.mp=Math.min(a.mmax,a.mp+a.mmax*.6);btPop(a,'灵力回复','buff');}await bwait(250);}
 else if(act.type==='def'){a.defd=true;a.mp=Math.min(a.mmax,a.mp+a.mmax*.1);btMsg(a.name+' 摆出防御架势');btPop(a,'防御','buff');await bwait(250);}
 else if(act.type==='shen'){await shenDo(a,act);}
 else if(act.type==='fu'){await fuUse(a,act.k);}
 else if(act.type==='jie'){await jieStrike(a);}
 else if(act.type==='flee'){btMsg(a.name+' 想要脱身……');await bwait(400);if(Math.random()<(realmIdx()>=5?1:.6)){await Promise.all(BT.party.map(p=>tween(p,{ox:40,oy:20,alpha:0},300)));btEnd('flee');return;}btMsg('没能逃掉！');await bwait(350);}
 else if(act.type==='eatk'){const t=act.t;btMsg(a.n+' 扑了过来');await btLunge(a,t);BT.fx.push({k:'claw',x:t.bx,y:t.by-btSpr(t).hh*.55,t0:BT.t,dur:.26});btHit(t,dmgF(a.atk,t.def),'',a);if(a.atkSt&&t.alive&&Math.random()<.6)stAdd(t,a.atkSt[0],a.atkSt[1],a);await btBack(a);}
 else if(act.type==='echarge'){a.chg=1;a.weak=bossWeak(a);btMsg(a.n+(a.mech==='tide'?'在引潮！':'蓄力！')+'破绽：'+EL[a.weak].n+'系可打断——否则快防御');btTip('<b>'+esc(a.n)+(a.mech==='tide'?' 在引潮':' 在蓄力')+'</b>　下一击极重<br><span>破绽：用<b style="color:'+EL[a.weak].c+'">'+EL[a.weak].n+'</b>系招式或符箓打中它即可打断；做不到就防御、上护盾</span>',3500);btPop(a,'破绽·'+EL[a.weak].n,'st shock');BT.fx.push({k:'ring',x:a.bx,y:a.by-24,col:'#ff6a4a',t0:BT.t,dur:.9});await tween(a,{oy:-8},260);await tween(a,{oy:0},160);await bwait(250);}
 else if(act.type==='eheavy'){const t=act.t;btMsg(a.n+' 全力一击！');await btLunge(a,t);BT.shake=.6;BT.fx.push({k:'claw',x:t.bx,y:t.by-btSpr(t).hh*.55,t0:BT.t,dur:.3});BT.fx.push({k:'flash',t0:BT.t,dur:.3});btHit(t,dmgF(a.atk*2.3,t.def),'',a);await btBack(a);}
 else if(act.type==='etide'){btMsg(a.n+' 掀起大潮！');await tween(a,{oy:-14},200);BT.shake=.7;BT.fx.push({k:'wave',x:a.bx,y:a.by-10,t0:BT.t,dur:.7});BT.fx.push({k:'flash',t0:BT.t,dur:.3});await tween(a,{oy:0},150);await bwait(200);BT.party.filter(p=>p.alive).forEach(p=>{btHit(p,dmgF(a.atk*1.5,p.def),'',a);if(p.alive)stAdd(p,'wet',2,a);});}
 else if(act.type==='eall'){btMsg(a.n+' 发出一声怒吼，震动全场！');await tween(a,{oy:-10},150);BT.shake=.45;BT.fx.push({k:'wave',x:a.bx,y:a.by-10,t0:BT.t,dur:.55});await tween(a,{oy:0},150);await bwait(200);BT.party.filter(p=>p.alive).forEach(p=>btHit(p,dmgF(a.atk*.72,p.def),'',a));}
 btParty();await bwait(330);if(BT)btNext();}
async function btArea(fx,a,ts){if(fx==='sweep'){BT.fx.push({k:'sweep',x0:a.bx,y0:a.by-24,x1:BT.W*.08,y1:BT.H*.5,t0:BT.t,dur:.45});await bwait(420);}
 else if(fx==='bolt'){ts.forEach((t,i)=>BT.fx.push({k:'bolt',x:t.bx,y:t.by-6,t0:BT.t+i*.08,dur:.4}));BT.fx.push({k:'flash',t0:BT.t,dur:.3});BT.shake=.3;await bwait(400);}
 else if(fx==='swords'){ts.forEach(t=>{for(let i=0;i<7;i++)BT.fx.push({k:'fall',x:t.bx+(Math.random()-.5)*30,y:t.by-6-Math.random()*20,t0:BT.t+i*.05+Math.random()*.1,dur:.32});});BT.fx.push({k:'flash',t0:BT.t+.3,dur:.25});await bwait(620);BT.shake=.3;}
 else if(fx==='fire'){ts.forEach(t=>{for(let i=0;i<22;i++)BT.parts.push({x:t.bx+(Math.random()-.5)*26,y:t.by-Math.random()*10,vx:(Math.random()-.5)*20,vy:-30-Math.random()*50,life:.6+Math.random()*.4,age:0,c:pick(['#ff7a2a','#ffb04a','#ffe08a'])});});await bwait(420);}
 else await bwait(300);}
function btPop(a,text,cls){const fx=$('#btFx');if(!fx)return;const s=btSpr(a),gx=a.bx+a.ox,gy=a.by+a.oy-s.hh*.75,K=BT.k/BT.dpr;const el=document.createElement('span');el.className='bpop '+(cls||'');el.textContent=text;
 el.style.left=(BT.offX+gx*K)+'px';el.style.top=(BT.offY+gy*K)+'px';fx.appendChild(el);setTimeout(()=>el.remove(),1000);}
function btHitRaw(t,d,cls,src){if(!t.alive)return;if(t.side==='p'){if(t.dodge&&Math.random()<t.dodge){btPop(t,'闪避','buff');return;}if(t.defd)d*=.5;if(t.buf>0)d*=.5;if(t.mw>0)d*=.3;if(t.dr)d*=1-t.dr;}d=Math.max(1,d);if(src&&src.ls&&t.side==='e'){src.hp=Math.min(src.max,src.hp+d*src.ls);}t.hp-=d;t.flash=1;btPop(t,(cls==='crit'?'暴击 ':'')+fmt(d),cls||(t.side==='p'?'hurt':''));sfx(cls==='crit'?'crit':'hit');if(t.side==='p')BT.shake=Math.max(BT.shake,.18);
 const [x,y]=ctr(t);for(let i=0;i<8;i++)BT.parts.push({x,y,vx:(Math.random()-.5)*90,vy:(Math.random()-.8)*70,life:.35+Math.random()*.25,age:0,c:t.side==='p'?'#ff8a7a':'#fff4d8'});
 if(t.hp<=0&&t.side==='e'&&t.p2&&!t.p2d){t.p2d=1;t.hp=t.max*.6;t.atk*=1.25;t.def*=1.1;t.tint=1;t.n=t.n2||(t.n+'·真身');t.cnt=2;BT.shake=.7;BT.fx.push({k:'flash',t0:BT.t,dur:.5});btMsg('「'+t.n+'」——它没有倒下！真身现世！');btParty();return;}
 if(t.hp<=0){t.hp=0;t.alive=false;tween(t,{alpha:0,oy:t.oy+6},520);if(t.side==='e')btFoeDie(t);}btParty();}
function btHeal(t,v){if(t.side==='p')v*=1+(BT.healP||0);t.hp=Math.min(t.max,t.hp+v);btPop(t,'+'+fmt(v),'heal');const [x,y]=ctr(t);for(let i=0;i<12;i++)BT.parts.push({x:x+(Math.random()-.5)*20,y:y+10,vx:(Math.random()-.5)*10,vy:-20-Math.random()*30,life:.7,age:0,c:pick(['#8fd6b5','#cfffe8'])});}
function btFoeDie(e){S.slain++;
 if(e.special==='zhou'){S.flags.duel_zhou=1;S.special=null;checkStory();}
 else if(e.special==='hunter'){S.expo=0;S.hunts++;rep('tq',-1);if(!F('hunter1')){S.flags.hunter1=1;checkStory();}S.special=null;BT.loot.push('灵光外泄已清零，洞天恢复运转');}
 else if(!e.special){const z=e.z;let first=false;if(z!==7&&z>=0&&!e.elite&&S.kills[z]!==undefined)S.kills[z]++;if(e.boss&&!e.elite&&z!==7&&!S.bossDown.includes(z)){S.bossDown.push(z);first=true;wuAdd(15);BT.loot.push('新的地点已开启');checkStory();}if(z===7&&e.boss){S.abyss++;if(S.abyss>=10){const t=xfGet('abyss');if(t)BT.loot.push(t.trim());}}
  if(e.boss&&!e.elite&&UNIQ[e.look]){S.pity.uniq=(S.pity.uniq||0)+1;if(first||S.pity.uniq>=8||Math.random()<.12*(1+stats().luck)){const it=mkUnique(e.look,z);if(it){BT.uniq=it;S.pity.uniq=0;}}}}
 if(e.human&&S.path==='mo'&&!e.noLoot){BT.loot.push('吞噬：灵气 +'+fmt(req(S.stage)*.15));addQi(req(S.stage)*.15,true);}
 qProgress('kill',{look:e.look,z:e.z});if(S.kills[e.z]===5||S.kills[e.z]===6)checkStory();
 if(e.after){const t=e.after();if(t)BT.loot.push(String(t).trim());}if(e.evQ)qReady(e.evQ);}

/* ---------- 结算 ---------- */
async function btWin(){BT.phase='end';btSetCmd('','idle');await bwait(550);if(!BT)return;sfx('win');
 if(BT.opt.jie){const h=BT.party[0];S.hpF=Math.max(.05,h.hp/h.max);S.mpF=h.mp/h.mmax;btResult('渡劫成功',['九道雷光散尽，云开见日。','你身上的旧伤，被雷火一并烧去了。'],'gold','破境',()=>{const o=BT.opt;btClose();o.onWin&&o.onWin();});return;}let st=0;const L=[],lk=1+stats().luck,lootM=lk*omenMul('loot');let nIt=0;BT.foes.forEach(f=>st+=f.stones||0);st=Math.ceil(st*lk*omenMul('stone')*(1+RUN.stone));S.stones+=st;
 STREAK++;const stk=BT.opt.farm?0:Math.min(.5,.1*(STREAK-1));const qi=req(S.stage)*QI_BATTLE*(1+stk)*(1+RUN.qi)*(BT.opt.farm&&FARM?zYield(FARM.z):1)*omenMul('bqi')*BT.foes.reduce((s,f)=>s+(f.boss?4:f.elite?2:1),0);addQi(qi,true);L.push('灵石 +'+fmt(st),'灵气 +'+(qi<10?qi.toFixed(1):fmt(qi)));if(stk>0)L.push('连斩 ×'+STREAK+'，灵气多得 '+Math.round(stk*100)+'%');
 if(BT.uniq){const u=BT.uniq;if(S.bag.length<BAG_MAX){S.bag.push(u);L.push(`<span class="r-chuan"><span class="iname">传说 · ${u.n}</span></span>`);}else{S.stones+=u.sell;L.push(u.n+'（行囊已满，已换成灵石）');}}
 const MD={};BT.foes.forEach(f=>{const o=matDrops(f);for(const k in o){MD[k]=(MD[k]||0)+o[k];S.mats[k]=(S.mats[k]||0)+o[k];}});if(Object.keys(MD).length)L.push(matLine(MD));
 BT.foes.forEach(f=>{if(f.special==='zhou'||f.noLoot)return;const fz=Math.max(0,f.z||0);let gp=Math.random()<(f.boss?.35:f.elite?.15:.04)*lootM;if(f.boss){S.pity.gem=(S.pity.gem||0)+1;if(S.pity.gem>=5)gp=true;}if(gp){if(f.boss)S.pity.gem=0;L.push(gGem(null,gemTierFor(fz)).trim());}if(f.boss&&Math.random()<.06*lootM){L.push(gBook().trim());}
  if(Math.random()<Math.min(1,(f.boss?1:f.elite?.6:.2)*lootM)){nIt++;const it=mkItem(fz,f.boss||f.elite);if(S.bag.length<BAG_MAX){S.bag.push(it);L.push(`<span class="r-${RAR[it.r].c}"><span class="iname">${it.n}</span></span>`);}else{S.stones+=it.sell;L.push(it.n+'（行囊已满，已换成灵石）');}}
  if(Math.random()<(f.boss?.6:.07)){S.meds++;L.push('疗伤药 +1');}});
 BT.loot.forEach(t=>L.push(esc(t)));const h=BT.party[0];S.hpF=Math.max(.05,h.hp/h.max);S.mpF=h.mp/h.mmax;
 if(BT.opt.farm&&FARM){FARM.st+=st;FARM.qi+=qi;FARM.items+=nIt;S.hpF=Math.min(1,S.hpF+.2);S.mpF=Math.min(1,S.mpF+.2);save();farmResult(L);return;}
 save();btResult('战斗胜利',L,'gold','继续',()=>{const o=BT.opt;btClose();o.onWin&&o.onWin();if(!o.farm&&!o.story&&STREAK>0&&STREAK%3===0)setTimeout(()=>boonPick(null,'灵潮馈赠 · 连斩 ×'+STREAK),350);});}
function farmResult(L){/* 连战：不停顿，直接下一场；点「收手」则打完这一场停下 */
 if(FARM.z===7)FARM.floors=(FARM.floors||0)+1;btClose();if(FARM.stop)farmEnd();else farmNext();}
let FARM=null;
function farmPick(){const L=ZORD.filter(z=>S.bossDown.includes(z));if(!L.length){toast('还没有击败过首领');return;}
 modal(`<h3>连战首领</h3><p>选一个打过的首领连续挑战，一场接一场，中间不停。每场之后回复两成生命和灵力。点战斗右上角的「收手」，打完这一场就停；输了也会停。</p>`,
  (S.bossDown.includes(6)?[{t:'灵源深渊 · 自动闯关（从第 '+(S.abyss+1)+' 层起，直到失败）',cls:'red',fn:()=>farmStart(7)}]:[]).concat(L.slice().reverse().map(z=>({t:ZONES[z].boss+' · '+ZONES[z].n,fn:()=>farmStart(z)}))).concat([{t:'算了',cls:'ghost'}]));}
function farmStart(z){FARM={z,n:0,st:0,items:0,qi:0,a0:S.abyss};S.btAuto=true;farmNext();}
function farmNext(){if(!FARM)return;FARM.n++;if(FARM.z!==7&&FARM.n>1){advanceDays(1,'trip');zoneDeplete(FARM.z,.08);}startBattle([mkEnemy(FARM.z,true)],{bg:FARM.z,farm:1,onLose:()=>farmEnd(true),onFlee:()=>farmEnd()});}
function farmEnd(lost){if(!FARM)return;const F0=FARM;FARM=null;if(WD.M&&WD.M.kind==='abyss'){WD.M.ents=WD.M.ents.filter(e=>!(e.kind==='foe'&&e.abyss));abyssGuard(WD.M);wHud();}save();setTimeout(()=>modal(`<h3>${F0.z===7?'深渊闯关结束':'连战结束'}</h3><p>${F0.z===7?'从第 '+(F0.a0+1)+' 层闯到第 '+(S.abyss+(lost?1:0))+' 层，连破 <b>'+(S.abyss-F0.a0)+'</b> 层':'共挑战 <b>'+F0.n+'</b> 场'}${lost?'，最后一场败下阵来':''}。</p><p>灵石 <b>${fmt(F0.st)}</b> · 灵气 <b>${fmt(F0.qi)}</b> · 装备 <b>${F0.items}</b> 件</p>`,[{t:'好',cls:'gold'}]),200);}
async function btLose(){BT.phase='end';btSetCmd('','idle');await bwait(600);if(!BT)return;S.hpF=1;S.mpF=1;save();const inTown=!WD.M||WD.M.kind==='town';
 btResult('败下阵来',[inTown?'你被扶回帐篷里歇了一阵。':'你被击倒了。站里的人把你抬了回去。','这一趟拿到的东西都还在身上。'],'red',inTown?'起身':'回青石站',()=>{const o=BT.opt;btClose();if(o.onLose)o.onLose();else if(!inTown)goTown(true);});}
function btEnd(kind){const o=BT.opt;if(kind==='flee'){STREAK=0;const h=BT.party[0];S.hpF=Math.max(.05,h.hp/h.max);S.mpF=h.mp/h.mmax;btClose();toast('你脱身了。');o.onFlee&&o.onFlee();}}
function btResult(title,lines,cls,btn,fn){const el=$('#btRes');if(!el)return;el.hidden=false;el.innerHTML=`<div class="box ${cls}"><h3>${title}</h3><ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul><button class="btn gold" id="btOk">${btn}</button></div>`;$('#btOk').onclick=fn;}
function btClose(){const el=$('#bt');el.hidden=true;el.innerHTML='';BT=null;dotUpdate();if(TAB==='world')render();
 const nx=S.pending.map(id=>STORY.find(c=>c.id===id)).find(c=>c&&c.side);if(nx)setTimeout(()=>{if(OV_FREE()&&!SC&&!BT)playStory(nx.id);},300);}

/* ---------- 绘制 ---------- */
function btBg(k,W,H){const K=BT.k;return cvMemo('hbg|'+k+'|'+Math.round(W)+'x'+Math.round(H)+'|'+K,()=>{const D=BTB[k]||BTB.town,cv=mkCv(Math.round(W*K),Math.round(H*K)),x=cv.getContext('2d');cv.ww=W;cv.hh=H;x.scale(K,K);
 const hz=Math.round(H*.4),key=k==='town'?'shelter':(ZONE_SCN[k]||(ART_IMG['scene_'+k]?k:'abyss')),z=K/BT.dpr;
 const IMG=ART_IMG['scene_'+key];if(IMG){const sc=sceneCanvas(key,W*z,H*z);x.drawImage(sc,0,0,W,H);x.save();x.beginPath();x.rect(0,hz,W,H-hz);x.clip();x.globalAlpha=.22;
  for(let r=-24;r<24;r++)for(let c=-24;c<24;c++){const sx=W/2+(c-r)*16,sy=hz+(c+r)*8;if(sx<-20||sx>W+20||sy<hz-10||sy>H+10)continue;x.drawImage(tileCv(D.fl,((c*7+r*13)%4+4)%4),sx-16.2,sy-8.1,32.4,16.2);}x.restore();
  let g=x.createLinearGradient(0,hz*.85,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,hz*.85,W,H);
  g=x.createRadialGradient(W/2,H*.62,Math.min(W,H)*.3,W/2,H*.62,Math.max(W,H)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=g;x.fillRect(0,0,W,H);return cv;}
 try{const sc=sceneCanvas(key,W*z,hz*1.25*z);x.drawImage(sc,0,0,W,hz*1.25);}catch(e){x.fillStyle=D.sky[1];x.fillRect(0,0,W,hz);}
 x.save();x.beginPath();x.rect(0,hz,W,H-hz);x.clip();x.fillStyle=pSh((TL[D.fl]||TL.tile).c[0],-.35);x.fillRect(0,hz,W,H-hz);
 for(let r=-24;r<24;r++)for(let c=-24;c<24;c++){const sx=W/2+(c-r)*16,sy=hz+(c+r)*8;if(sx<-20||sx>W+20||sy<hz-10||sy>H+10)continue;x.drawImage(tileCv(D.fl,((c*7+r*13)%4+4)%4),sx-16.2,sy-8.1,32.4,16.2);}x.restore();
 let g=x.createLinearGradient(0,hz-10,0,hz+40);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.3,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,hz-10,W,50);
 g=x.createLinearGradient(0,hz-18,0,hz+6);g.addColorStop(0,'rgba(220,230,220,0)');g.addColorStop(1,'rgba(220,230,220,.12)');x.fillStyle=g;x.fillRect(0,hz-18,W,24);
 g=x.createRadialGradient(W/2,H*.62,Math.min(W,H)*.3,W/2,H*.62,Math.max(W,H)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,0,W,H);return cv;});}
function btArrow(x,cx,cy,c){x.fillStyle=OUT;x.fillRect(Math.round(cx-4),Math.round(cy-1),9,1);x.fillStyle=c;for(let i=0;i<4;i++)x.fillRect(Math.round(cx-3+i),Math.round(cy+i),7-i*2,1);}
function btFrame(dt){if(!BT||!BT.cx)return;BT.t+=dt;const x=BT.cx,W=BT.W,H=BT.H;x.imageSmoothingEnabled=true;let sh=0;if(BT.shake>0){BT.shake-=dt;sh=Math.round((Math.random()-.5)*5);}
 x.setTransform(BT.k,0,0,BT.k,0,0);x.drawImage(btBg(BT.bgk,W,H),sh,0,W,H);btGround(x);
 const all=[...BT.foes,...BT.party].sort((a,b)=>(a.by+a.oy)-(b.by+b.oy));
 for(const a of all){if(a.alpha<=.01)continue;const s=btSpr(a),bob=a.alive&&a.side==='e'?Math.round(Math.sin(BT.t*3+a.idx)*1.5):0,X=a.bx+a.ox-s.ww/2+sh,Y=a.by+a.oy-s.hh+bob;
  x.globalAlpha=a.alpha;{const sc=shadowCv(Math.max(10,Math.round(s.ww*.6)));x.drawImage(sc,a.bx+a.ox-sc.ww/2+sh,a.by+a.oy-sc.hh/2-1,sc.ww,sc.hh);}
  if(a.boss&&a.alive){x.globalCompositeOperation='lighter';const r=s.ww*.6,g=x.createRadialGradient(a.bx+a.ox,a.by-s.hh/2,0,a.bx+a.ox,a.by-s.hh/2,r);g.addColorStop(0,a.tint?'rgba(170,110,255,.28)':'rgba(255,70,40,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(a.bx-r,a.by-s.hh/2-r,r*2,r*2);x.globalCompositeOperation='source-over';}
  if(a.big>0){x.save();x.translate(a.bx+a.ox,a.by+a.oy);x.scale(1.35,1.35);x.translate(-(a.bx+a.ox),-(a.by+a.oy));}x.drawImage(s,X,Y,s.ww,s.hh);if(a.big>0)x.restore();if(a.flash>0){x.globalAlpha=a.alpha*Math.min(1,a.flash);x.drawImage(btWhite(a,s),X,Y,s.ww,s.hh);a.flash-=dt*5;}
  if(a.frozen>0&&a.alive){x.globalAlpha=.45;x.fillStyle='#bfefff';x.fillRect(X,Y+Math.round(s.hh*.2),s.ww,Math.round(s.hh*.8));}
  if(a.mw>0&&a.alive){x.globalAlpha=.5;x.strokeStyle='#ffd070';x.beginPath();x.ellipse(a.bx+a.ox,a.by+a.oy-s.hh/2,s.ww*.65,s.hh*.6,0,0,6.283);x.stroke();}
  if(a.buf>0&&a.alive){x.globalAlpha=.4+.2*Math.sin(BT.t*6);x.strokeStyle='#e3b862';x.beginPath();x.ellipse(a.bx+a.ox,a.by+a.oy-s.hh/2,s.ww*.6,s.hh*.58,0,0,6.283);x.stroke();}
  x.globalAlpha=1;}
 btFoeHud(x);
 if(BT.cur&&BT.cur.alive&&BT.phase==='cmd'&&!BT.pend){const a=BT.cur,s=btSpr(a);btArrow(x,a.bx,a.by-s.hh-6+Math.round(Math.sin(BT.t*6)*2),'#8fd6b5');}
 if(BT.pend)BT.foes.forEach(f=>{if(!f.alive)return;const s=btSpr(f);btArrow(x,f.bx,f.by-s.hh-4+Math.round(Math.sin(BT.t*7)*2),'#ff6a4a');});
 for(let i=BT.fx.length-1;i>=0;i--){const f=BT.fx[i],p=(BT.t-f.t0)/f.dur;if(p<0)continue;if(p>1){BT.fx.splice(i,1);continue;}btDrawFx(x,f,p);}
 for(let i=BT.parts.length-1;i>=0;i--){const q=BT.parts[i];q.age+=dt;if(q.age>q.life){BT.parts.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=60*dt;x.globalAlpha=1-q.age/q.life;x.fillStyle=q.c;x.fillRect(Math.round(q.x),Math.round(q.y),2,2);}x.globalAlpha=1;}
function btDrawFx(x,f,p){if(btDrawFx2(x,f,p))return;x.save();
 if(f.k==='slash'||f.k==='claw'){x.globalAlpha=1-p;x.lineWidth=f.cr?3:2;x.strokeStyle=f.k==='claw'?'#ff6a5a':(f.cr?'#ffe8a8':'#ffffff');const r=12+p*8;x.beginPath();x.arc(f.x,f.y,r,-2.5,-.6);x.stroke();if(f.k==='claw'){x.beginPath();x.arc(f.x+4,f.y+4,r,-2.5,-.6);x.stroke();}}
 if(f.k==='proj'){const X=f.x0+(f.x1-f.x0)*p,Y=f.y0+(f.y1-f.y0)*p,a=Math.atan2(f.y1-f.y0,f.x1-f.x0);x.globalCompositeOperation='lighter';x.strokeStyle=f.col;x.globalAlpha=.6;x.lineWidth=3;x.beginPath();x.moveTo(X-Math.cos(a)*18,Y-Math.sin(a)*18);x.lineTo(X,Y);x.stroke();
  x.globalAlpha=1;x.fillStyle='#ffffff';if(f.orb){x.beginPath();x.arc(X,Y,3,0,6.28);x.fill();}else{x.translate(X,Y);x.rotate(a);x.fillRect(-8,-1,12,2);x.fillStyle='#d0a84a';x.fillRect(-10,-2,2,4);}}
 if(f.k==='ring'){x.globalAlpha=1-p;x.strokeStyle=f.col;x.lineWidth=2;x.beginPath();x.ellipse(f.x,f.y+16,8+p*18,4+p*9,0,0,6.28);x.stroke();}
 if(f.k==='sweep'){const X=f.x0+(f.x1-f.x0)*p,Y=f.y0+(f.y1-f.y0)*p;x.globalCompositeOperation='lighter';x.globalAlpha=1-p*.6;x.strokeStyle='#bfffe6';x.lineWidth=4;x.beginPath();x.arc(X,Y,22,-1.2,1.2);x.stroke();x.lineWidth=1;x.strokeStyle='#ffffff';x.beginPath();x.arc(X-2,Y,20,-1,1);x.stroke();}
 if(f.k==='bolt'){x.globalCompositeOperation='lighter';x.globalAlpha=1-p;x.strokeStyle='#dff8ff';x.lineWidth=2;x.beginPath();let X=f.x+(Math.random()-.5)*6,Y=0;x.moveTo(X,Y);while(Y<f.y){Y+=8;X+=(Math.random()-.5)*10;x.lineTo(X,Math.min(Y,f.y));}x.stroke();}
 if(f.k==='flash'){x.globalAlpha=(1-p)*.55;x.fillStyle='#ffffff';x.fillRect(0,0,BT.W,BT.H);}
 if(f.k==='fall'){const Y=-10+(f.y+10)*p;x.globalCompositeOperation='lighter';x.fillStyle='#e8fff4';x.fillRect(Math.round(f.x),Math.round(Y-12),2,12);x.fillStyle='#d0a84a';x.fillRect(Math.round(f.x)-1,Math.round(Y-14),4,2);}
 if(f.k==='wave'){x.globalAlpha=1-p;x.strokeStyle='#ff5a3a';x.lineWidth=3;x.beginPath();x.ellipse(f.x,f.y,20+p*BT.W*.7,10+p*BT.W*.35,0,0,6.28);x.stroke();}
 x.restore();}

const skCost=s=>Math.ceil(s.mp*(S.form==='juling'?.8:1));
function btSmart(a,fs,ps,sk,boss){const has=k=>sk(k);const burning=fs.filter(f=>f.st&&f.st.burn>=2),wet=fs.filter(f=>f.st&&f.st.wet>0),frozen=fs.find(f=>f.frozen>0);
 if(BT.ncd<=0&&S.natal&&realmIdx()>=2&&(boss||fs.length>1)&&Math.random()<.6)return {type:'shen',k:'natal'};
 if(boss&&realmIdx()>=6&&!(BT.used&&BT.used.faxiang))return {type:'shen',k:'faxiang'};
 if(a.hp<a.max*.5&&!(a.sh>0)){const s=has('xuanshui')||has('houtu')||has('xuanming');if(s)return {type:'sk',sk:s};}
 if(frozen)return {type:'atk',t:frozen};
 if(burning.length&&(has('jiutian')||has('zhangxin')||has('yinlei'))){const s=fs.length>1&&has('jiutian')?has('jiutian'):has('yinlei')||has('zhangxin');return {type:'sk',sk:s,t:burning[0]};}
 if(wet.length&&(has('zhangxin')||has('ningshuang')))return {type:'sk',sk:has('zhangxin')||has('ningshuang'),t:wet[0]};
 const t=boss||fs.reduce((m,f)=>f.hp>m.hp?f:m,fs[0]);const s0=t.st||{};
 if(t.mech==='jinshen'&&!s0.brk){const s=has('pojia');if(s)return {type:'sk',sk:s,t};if(S.fu.po>0)return {type:'fu',k:'po'};}
 if(t.mech==='shuijing'&&!s0.shock){const s=has('zhangxin')||has('yinlei')||has('leijue');if(s)return {type:'sk',sk:s,t};if(S.fu.lei>0)return {type:'fu',k:'lei'};}
 if(fs.length>1){const s=has('fentian')||has('sanmei')||has('jiutian')||has('bingfeng')||has('gengjin')||has('canglan');if(s)return {type:'sk',sk:s};}
 if(!(s0.burn>0)&&has('fenxin'))return {type:'sk',sk:has('fenxin'),t};if(!(s0.root>0)&&has('tengfu')&&Math.random()<.5)return {type:'sk',sk:has('tengfu'),t};if(!(s0.brk>0)&&has('pojia'))return {type:'sk',sk:has('pojia'),t};
 if(has('shanyue')&&Math.random()<.5)return {type:'sk',sk:has('shanyue'),t};if(has('ningshuang')&&Math.random()<.5)return {type:'sk',sk:has('ningshuang'),t};if(has('guizhao')&&a.hp<a.max*.7)return {type:'sk',sk:has('guizhao'),t};
 return null;}
