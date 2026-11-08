/* ================= 感悟 · 赠丹 · 宗门（拜入、晋升、任职、任务、宝库、宗主之争）· 天下宗门大比 ================= */

/* ---------- 感悟：破大境界的门槛。只能从「做事」里来，光打坐攒不到 ---------- */
const WU_NEED=[0,0,30,60,100,150,210,280,360,450,550,650,760,880];
const wuNeed=r1=>WU_NEED[Math.min(r1,WU_NEED.length-1)]||0;
function wuAdd(n,quiet){if(!S||!S.started||!n)return;S.wu=(S.wu||0)+n;if(!quiet)toast('感悟 +'+n);}
const _wuES=endStory;endStory=function(){const ch=SC&&SC.ch;const first=ch&&!S.seen.includes(ch.id);_wuES.apply(this,arguments);if(first&&ch.id!=='prologue')wuAdd(ch.rw||ch.side?3:5);};
const _wuMG=mgEnd;mgEnd=function(win,quit){if(MG&&!MG.done&&!quit)wuAdd(win?6:2);return _wuMG.apply(this,arguments);};

/* ---------- 赠丹：选丹药、选人 ---------- */
const GIFT_PILLS=[
 {k:'lifeP',n:'寿元丹',ic:'shouyuan',d:'凡人 +15 年；修士 +30 年寿元'},
 {k:'jz',n:'九转金丹',ic:'jiuzhuan',d:'凡人 +40 年；修士 +80 年寿元',has:()=>(S.jzDan||0)+(F('rw_jz')?1:0)},
 {k:'pills',n:'破境丹',ic:'pojing',d:'修士：小境界必破，大境界六成'},
 {k:'zjDan',n:'筑基丹',ic:'zhuji',d:'凡人：三成机会生出灵根；修士：+好感'},
 {k:'qiPills',n:'聚气丹',ic:'juqi',d:'修士：三成机会破一个小境界'},
 {k:'meds',n:'疗伤药',d:'一点心意'},
 {k:'hhDan',n:'还魂丹',ic:'huanhun',d:'起死回生（只能给已故之人）',dead:1}
];
const pillHave=g=>g.has?g.has():(S[g.k]||0);
function pillUse(g){if(g.k==='jz'){if((S.jzDan||0)>0)S.jzDan--;else S.flags.rw_jz=0;}else S[g.k]--;}
function giftWho(dead){const P=S.ppl.filter(p=>p.known&&(dead?!p.alive&&!p.bg:p.alive&&(!p.bg||p.lead||p.att))).map(p=>({t:'p',o:p,n:p.n,sub:(p.alive?realmOf(p.st)+' · '+p.age+'/'+lifeText(pLife(p))+' 岁':'已故')+' · '+attName(p)}));
 const D=dead?[]:(S.dis||[]).filter(d=>d.alive&&!d.gone).map(d=>({t:'d',o:d,n:d.n,sub:'弟子 · '+realmOf(d.st)+' · '+d.age+'/'+lifeText(lifeOf(d.st)+(d.lifeB||0))+' 岁'}));return D.concat(P);}
function giftOpen(pid){const L=GIFT_PILLS.filter(g=>pillHave(g)>0);if(!L.length){toast('身上没有能送人的丹药。丹铺、丹房、宗门宝库里能弄到','bad');return;}
 modal(`<h3>赠丹</h3><p>选一种丹药。${pid?'':'下一步再选送给谁。'}</p>`,L.map(g=>({t:ico(g.ic)+g.n+'（'+pillHave(g)+'）· '+g.d,fn:()=>pid?giftGive(g,pid):giftPickWho(g)})).concat([{t:'算了',cls:'ghost'}]));}
function giftPickWho(g){const W=giftWho(g.dead);if(!W.length){toast(g.dead?'没有可以救回的人':'没有可以送的人','bad');return;}
 modal(`<h3>${g.n} · 送给谁</h3><p class="note">${g.d}</p>`,W.slice(0,40).map(w=>({t:w.n+'<small style="display:block;opacity:.7;font-size:11px">'+esc(w.sub)+'</small>',fn:()=>giftGive(g,(w.t==='d'?'d':'')+w.o.id)})).concat([{t:'算了',cls:'ghost'}]));}
function giftGive(g,id){const isD=String(id).startsWith('d')&&!P_(id),o=isD?(S.dis||[]).find(d=>'d'+d.id===String(id)):P_(id);if(!o||pillHave(g)<=0)return;
 if(g.dead&&o.alive){toast('还魂丹只能给已故之人','bad');return;}if(!g.dead&&!o.alive)return;
 const mortal=!isD&&o.st<0;let t='';
 if(g.k==='lifeP'){if(mortal)o.life=(o.life||75)+15;else o.lifeB=(o.lifeB||0)+30;t=o.n+'多了'+(mortal?'十五':'三十')+'年寿元。';}
 else if(g.k==='jz'){if(mortal)o.life=(o.life||75)+40;else o.lifeB=(o.lifeB||0)+80;t=o.n+'服下九转金丹，多了'+(mortal?'四十':'八十')+'年寿元。';}
 else if(g.k==='pills'){if(mortal){toast('凡人受不住破境丹的药力','bad');return;}const nx=Math.min(o.st+1,LAST),major=STAGES[nx].r>STAGES[o.st].r;if(o.st<LAST&&(!major||Math.random()<.6)){o.st++;t=o.n+'借破境丹突破至'+realmOf(o.st)+'！';if(major)news(o.n+'服下'+S.name+'所赠破境丹，突破至'+REALMS[STAGES[o.st].r]+'。',1);}else t=o.n+'冲关未成，药力化作了根基。';}
 else if(g.k==='zjDan'){if(isD){o.dan=1;t=o.n+'收下筑基丹，下次冲关更稳。';}else if(mortal){if(Math.random()<.3){o.st=0;o.tal=Math.max(o.tal||.3,.4);t=o.n+'体内生出了一条灵根！从此踏上仙途。';news(o.n+'服下筑基丹，以凡人之躯生出灵根。',1);}else t='药力散了。'+o.n+'没能生出灵根，却觉得身子轻了很多。';}else t=o.n+'收下了。';}
 else if(g.k==='qiPills'){if(mortal){toast('凡人用不上聚气丹','bad');return;}const nx=Math.min(o.st+1,LAST);if(o.st<LAST&&STAGES[nx].r===STAGES[o.st].r&&Math.random()<.3){o.st++;t=o.n+'借聚气丹破至'+realmOf(o.st)+'。';}else t=o.n+'收下了，修为稳了一些。';}
 else if(g.k==='hhDan'){o.alive=true;o.age=Math.min(o.age,(isD?lifeOf(o.st):pLife(o))-10);if(o.fr)delete S.flags['dead_'+o.fr];t=o.n+'死而复生。';news(o.n+'死而复生。',1);}
 else t=o.n+'收下了你的心意。';
 pillUse(g);if(isD)o.loy=Math.min(100,(o.loy||50)+(g.k==='lifeP'||g.k==='jz'||g.k==='hhDan'?20:8));else o.att=Math.min(100,o.att+(g.k==='lifeP'||g.k==='jz'||g.k==='hhDan'?20:g.k==='pills'?15:6));
 if(!isD&&o.fr&&BOND[o.fr])aff(o.fr,g.k==='meds'?3:10,true);sfx('rise');toast(t,'big');save();if($('#jh')&&!$('#jh').hidden)jhRender();else render();}
const _zdPpl=pplHTML;pplHTML=function(){return `<div class="row2"><div class="in"><div class="iname">赠丹</div><div class="istat">选一种丹药，送给任何一位故人、江湖人物或弟子。寿元丹能续命，破境丹能助人破境，筑基丹能让凡人生出灵根。</div></div><div class="ibtn"><button class="btn sm gold" data-ja="gift">赠丹</button></div></div>`+_zdPpl();};
JH_ACT.gift=()=>giftOpen();

/* ---------- 宗门：拜入 · 晋升 · 任职 ---------- */
const SM_RANK=['外门弟子','内门弟子','真传弟子','执事','长老','宗主'];
const SM_TOT=[0,150,450,1100,2600,5000];
const smSt=(k,r)=>Math.max(0,SECTS[k].st+[-6,-3,0,2,5,8][r]);
const SM_POST={
 chuan:{n:'传功堂 · 讲师',d:'吐纳 +12%'},
 zhifa:{n:'执法堂 · 执法',d:'攻击 +8%，暴击 +4%'},
 danfang:{n:'丹房 · 掌炉',d:'每年领破境丹一颗，每两年领寿元丹一颗'},
 waiwu:{n:'外务堂 · 管事',d:'俸禄翻倍，宝库八折'}};
const smOn=()=>!!(S.sm&&S.sm.k&&SECTS[S.sm.k]);
const smName=()=>smOn()?SECTS[S.sm.k].n:'';
const smTitle=()=>smOn()?(S.sm.rank>=5?SECTS[S.sm.k].lt:SM_RANK[S.sm.rank]):'';
function smCanJoin(k){const R=S.sects[k]||{};if(smOn())return '你已是'+smName()+'的人';if(S.clan&&S.clan.zong)return '你已开宗立派';if(['hostile','gone','vassal'].includes(R.rel))return '与你有仇，或已不存在';if(S.stage<smSt(k,0))return '需 '+STAGES[smSt(k,0)].name;return '';}
function smJoin(k){const why=smCanJoin(k);if(why){toast(why,'bad');return;}const R=S.sects[k]||(S.sects[k]={beat:0,rel:null});const r0=R.beat>=3?2:R.beat>=2?1:0;
 S.sm={k,rank:r0,gx:0,tot:SM_TOT[r0],post:null,y:S.year,tasks:null,got:{}};if(R.rel!=='ally')R.rel='member';const lead=sectLead(k);if(lead)lead.att=Math.min(100,lead.att+15);
 news(S.name+'拜入'+SECTS[k].n+'，为'+SM_RANK[r0]+'。',1);wuAdd(5);sfx('bell');save();
 modal(`<h3>拜入${SECTS[k].n}</h3><p>${lead?esc(lead.n)+'亲手':'执事'}把一块刻着你名字的令牌交给你。${r0?'你挑过本门，众人都认得你，直接入'+SM_RANK[r0]+'。':'从外门弟子做起。'}</p><p class="note">做宗门任务攒贡献，贡献够了就能晋升。执事起可以任职，长老之后可以争宗主之位。每五年有一次天下宗门大比。</p>`,[{t:'好',cls:'gold',fn:()=>jhOpen('sect')}]);}
function smLeave(){if(!smOn())return;const k=S.sm.k,D=SECTS[k];modal(`<h3>叛出${D.n}？</h3><p>贡献清零，${D.n}从此与你为敌。</p>`,[{t:'叛出',cls:'red',fn:()=>{S.sects[k]=S.sects[k]||{beat:0,rel:null};S.sects[k].rel='hostile';const lead=sectLead(k);if(lead)lead.att=-60;
  if(S.sm.rank>=5){const c=S.ppl.filter(p=>p.alive&&p.sect===k&&p.st>=0).sort((a,b)=>b.st-a.st)[0];if(c){c.lead=1;c.att=-60;}}
  seedAdd('sect',null,S.year+6+Math.floor(Math.random()*6),{sect:k});news(S.name+'叛出'+D.n+'。',1);S.sm=null;save();jhRender();}},{t:'算了',cls:'ghost'}]);}
function smNextReq(){const r=S.sm.rank+1;if(r>5)return null;return {r,tot:SM_TOT[r],st:smSt(S.sm.k,r)};}
function smPromote(){if(!smOn())return;const q=smNextReq();if(!q)return;if(S.sm.tot<q.tot){toast('累计贡献不足：'+S.sm.tot+'/'+q.tot,'bad');return;}if(S.stage<q.st){toast('境界不足：需 '+STAGES[q.st].name,'bad');return;}
 const k=S.sm.k,D=SECTS[k];
 if(q.r===2){jhClose();startBattle([sectFoe(k,1)],{bg:sectBg(k),onWin:()=>{smRankUp(2,'真传考核，你接下了长老三十招，最后一招逼退了他。');},onLose:()=>{toast('考核未过。长老说：「再练练。」','bad');save();}});return;}
 if(q.r===5){const lead=sectLead(k);jhClose();startBattle([sectFoe(k,2),sectFoe(k,1)],{bg:sectBg(k),noFlee:true,onWin:()=>{if(lead){lead.lead=0;lead.att=Math.max(-100,lead.att-30);lead.goal=lead.att<=-40?'夺回宗主之位':'辅佐新宗主';if(lead.att<=-40)seedAdd('revenge',lead.id,S.year+8+Math.floor(Math.random()*8),{why:D.n+'的宗主之位，是我的。'});}S.ppl.forEach(p=>{if(p.sect===k)p.lead=0;});smRankUp(5,(lead?lead.n:'老'+D.lt)+'放下了兵刃。满门弟子，向你行礼。');news(S.name+'成为'+D.n+D.lt+'。',1);},onLose:()=>{S.sm.gx=Math.floor(S.sm.gx*.7);toast('宗主之争落败，贡献折损三成','bad');save();}});return;}
 smRankUp(q.r,'执事堂贴出了告示。');}
function smRankUp(r,txt){S.sm.rank=r;wuAdd(10,1);sfx('win');save();setTimeout(()=>modal(`<h3>${SECTS[S.sm.k].n} · ${r>=5?SECTS[S.sm.k].lt:SM_RANK[r]}</h3><p>${esc(txt)}</p><p class="note">${r===3?'你可以在宗门里任职了。':r===4?'长老可以在宗主之争里挑战宗主。':r>=5?'你是一宗之主了：本门加成三倍，俸禄三倍，大比由你领队。':'俸禄与本门加成都提高了。'} 感悟 +10。</p>`,[{t:'好',cls:'gold',fn:()=>jhOpen('sect')}]),300);}
function smPost(p){if(!smOn()||S.sm.rank<3){toast('执事以上才能任职','bad');return;}S.sm.post=p;toast('就任 '+SM_POST[p].n,'big');save();jhRender();}
/* 本门加成：随职位升高 */
const _smBF=buildFx;buildFx=function(){const A=_smBF.apply(this,arguments);if(!smOn())return A;const D=SECTS[S.sm.k],m=S.sm.rank>=5?3:.5+.4*S.sm.rank;
 if(D.ally&&!(S.sects[S.sm.k]&&S.sects[S.sm.k].rel==='ally'))for(const q in D.ally)A[q]=(A[q]||0)+D.ally[q]*m;else if(D.ally)for(const q in D.ally)A[q]=(A[q]||0)+D.ally[q]*(m-1);
 if(S.sm.post==='zhifa'){A.atkP=(A.atkP||0)+.08;A.critA=(A.critA||0)+.04;}return A;};
const _smCB=clanBonus;clanBonus=function(){const b=Object.assign({},_smCB.apply(this,arguments));if(smOn()&&S.sm.post==='chuan')b.idle=(b.idle||0)+.12;return b;};

/* ---------- 宗门任务：每年三件 ---------- */
function smTasks(){if(!smOn())return [];if(S.sm.tasks&&S.sm.tasks.y===S.year)return S.sm.tasks.L;const k=S.sm.k,z=maxZone(),rivals=SECT_ORD.filter(x=>x!==k&&SECTS[x].align!==SECTS[k].align),rv=pick(rivals.length?rivals:SECT_ORD.filter(x=>x!==k));
 const mk=Object.keys(S.mats||{}).filter(m=>MATS[m]);const mat=pick(['cao','he','gu','tie'].concat(ZMAT[z]||[]));
 const pool=[{k:'jiao',n:'剿妖',d:'去「'+ZONES[z].n+'」清剿一窝妖兽',gx:35},{k:'xun',n:'巡山',d:'赶走在山门外窥探的'+SECTS[rv].n+'弟子',gx:45,rv},{k:'shang',n:'上缴灵材',d:'上缴 '+MATS[mat].n+' ×3',gx:25,mat},{k:'jiang',n:'讲经',d:'给外门弟子讲一堂课（耗去两成灵气）',gx:20},{k:'dan',n:'上供丹药',d:'上缴聚气丹 ×2',gx:30},{k:'hu',n:'护送',d:'护送本门商队过「'+ZONES[Math.max(0,z-1)].n+'」',gx:40}];
 const L=pool.sort(()=>Math.random()-.5).slice(0,3).map((t,i)=>Object.assign({i,done:0},t));S.sm.tasks={y:S.year,L};return L;}
function smTaskDo(i){const t=smTasks()[+i];if(!t||t.done)return;const k=S.sm.k,z=maxZone();
 const fin=(txt)=>{t.done=1;const g=Math.round(t.gx*(1+.15*S.sm.rank));S.sm.gx+=g;S.sm.tot+=g;S.stones+=zsAt(z,2);wuAdd(8,1);sfx('coin');save();toast((txt||t.n+'完成')+' · 贡献 +'+g+' · 感悟 +8','big');if($('#jh')&&!$('#jh').hidden)jhRender();};
 if(t.k==='shang'){if((S.mats[t.mat]||0)<3){toast(MATS[t.mat].n+'不够（'+(S.mats[t.mat]||0)+'/3）','bad');return;}S.mats[t.mat]-=3;fin();return;}
 if(t.k==='dan'){if((S.qiPills||0)<2){toast('聚气丹不够','bad');return;}S.qiPills-=2;fin();return;}
 if(t.k==='jiang'){gQi(-.2);fin('你讲了一个时辰，台下的外门弟子听得入神');return;}
 jhClose();let foes;
 if(t.k==='jiao')foes=[0,1,2].map(i=>{const f=mkEnemy(z,false);if(!i){f.hp*=1.6;f.max=f.hp;f.atk*=1.2;f.n='狂暴'+f.n;}return f;});
 else if(t.k==='xun')foes=[mkCustom(z,{look:SECT_LOOK[t.rv][0],name:SECTS[t.rv].n+'弟子',st:S.stage,m:1.3}),mkCustom(z,{look:SECT_LOOK[t.rv][0],name:SECTS[t.rv].n+'弟子',st:S.stage,m:1.1})];
 else foes=[mkCustom(Math.max(0,z-1),{look:'黑市打手',name:'劫道的散修',m:1.3}),mkCustom(Math.max(0,z-1),{look:'黑市打手',name:'劫道的散修',m:1.1}),mkCustom(Math.max(0,z-1),{look:'黑市打手',name:'劫道的散修',m:.9})];
 foes.forEach(f=>{f.human=t.k!=='jiao'?1:0;f.noLoot=t.k!=='jiao'?1:0;});
 startBattle(foes,{bg:t.k==='jiao'?z:'market',onWin:()=>{fin();if(t.k==='xun'){const l=sectLead(t.rv);if(l)l.att=Math.max(-100,l.att-3);}},onLose:()=>{toast('任务失败了。明年还有机会','bad');t.done=1;save();}});}

/* ---------- 宝库：用贡献换东西 ---------- */
const SM_SHOP=[
 {k:'life',n:'寿元丹',ic:'shouyuan',gx:220,fn:()=>{S.lifeP=(S.lifeP||0)+1;return '寿元丹 +1';}},
 {k:'pill',n:'破境丹',ic:'pojing',gx:130,fn:()=>{S.pills++;return '破境丹 +1';}},
 {k:'zj',n:'筑基丹',ic:'zhuji',gx:90,fn:()=>{S.zjDan=(S.zjDan||0)+1;return '筑基丹 +1';}},
 {k:'qi',n:'聚气丹 ×3',ic:'juqi',gx:40,fn:()=>{S.qiPills+=3;return '聚气丹 +3';}},
 {k:'dj',n:'渡劫丹',gx:260,r:4,fn:()=>{S.jieDan=(S.jieDan||0)+1;return '渡劫丹 +1';}},
 {k:'form',n:'本门阵图',gx:350,r:1,once:1,fn:()=>(learnForm(SECTS[S.sm.k].form)||'已学会').trim()},
 {k:'book',n:'镇派绝学',gx:700,r:2,once:1,fn:()=>{const b=SECTS[S.sm.k].book;S.books[b]=(S.books[b]||0)+1;return '获得 '+BOOKS[b].n+'（在「囊」里研读）';}},
 {k:'gear',n:'本门法宝',gx:520,r:3,fn:()=>gItemNamed(pick(SLOT5),3,SECTS[S.sm.k].n+'·'+pick(['镇岳','流火','青冥','玄霜','惊雷','归元']),maxZone()).trim()}];
const smPrice=it=>Math.ceil(it.gx*(S.sm.post==='waiwu'?.8:1));
function smBuy(k){const it=SM_SHOP.find(x=>x.k===k);if(!it||!smOn())return;if((it.r||0)>S.sm.rank){toast('需 '+SM_RANK[it.r],'bad');return;}if(it.once&&S.sm.got[k]){toast('已经领过了');return;}const p=smPrice(it);if(S.sm.gx<p){toast('贡献不够','bad');return;}
 S.sm.gx-=p;if(it.once)S.sm.got[k]=1;const t=it.fn();sfx('coin');toast(t,'big');save();jhRender();}

/* ---------- 每年：俸禄、丹房、大比 ---------- */
const _smOY=oneYear;oneYear=function(){const r=_smOY.apply(this,arguments);try{smYear();}catch(e){console.error(e);}return r;};
function smYear(){if(smOn()){const m=(S.sm.rank+1)*(S.sm.post==='waiwu'?2:1)*(S.sm.rank>=5?3:1);S.stones+=zsAt(maxZone(),1.5*m);S.sm.gx+=5*(S.sm.rank+1);S.sm.tot+=5*(S.sm.rank+1);
  if(S.sm.post==='danfang'){S.pills++;if(S.year%2===0)S.lifeP=(S.lifeP||0)+1;}}
 dbYear();}

/* ---------- 天下宗门大比：每五年一届 ---------- */
const DB_EXTRA={penglai:{n:'蓬莱阁',el:'shui',look:'苏绾'},sanxiu:{n:'散修盟',el:'jin',look:'无名剑客'}};
const teamName=t=>t==='me'?(S.clan&&S.clan.zong?S.clan.name:'散修 · '+S.name):SECTS[t]?SECTS[t].n:DB_EXTRA[t].n;
function dbInit(){if(!S.db)S.db={next:S.year+2,cur:null,pts:{},hist:[]};return S.db;}
function dbChamp(t){if(t==='me'||(smOn()&&t===S.sm.k))return {me:1,n:S.name,st:S.stage};
 if(SECTS[t]){const P=S.ppl.filter(p=>p.alive&&p.sect===t&&p.st>=0).sort((a,b)=>b.st-a.st)[0];return P?{n:P.n,st:P.st,pid:P.id}:{n:SECTS[t].n+'首席',st:SECTS[t].st+2};}
 return {n:DB_EXTRA[t].n+'首席',st:Math.max(10,S.stage+(t==='penglai'?2:0))};}
function dbYear(){const D=dbInit();
 if(D.cur&&!D.cur.done&&S.year>=D.cur.y+2){while(!D.cur.done)dbRound(true);}
 if(!D.cur||D.cur.done){if(S.year>=D.next&&S.stage>=6){const teams=SECT_ORD.slice();teams.push(smOn()?'sanxiu':'me','penglai');teams.sort(()=>Math.random()-.5);
   D.cur={y:S.year,round:0,teams,alive:teams.slice(),log:[],place:{},done:false};D.next=S.year+5;news('天下宗门大比开幕。八方宗门齐聚落雁湖。'+(smOn()?'你将代表'+smName()+'出战。':''),1);toast('天下宗门大比开幕！在「江湖 · 宗门」里出战','big');}}}
const myTeam=()=>smOn()?S.sm.k:'me';
function dbPow(t){const c=dbChamp(t);return c.st+Math.random()*5;}
/* 一轮：若你还在场，先打你的那一场 */
function dbRound(auto){const C=S.db.cur;if(!C||C.done)return;const A=C.alive,next=[],names=['八强','四强','决赛'];const lose=t=>{C.place[t]=[4,3,2][C.round];};
 for(let i=0;i<A.length;i+=2){const a=A[i],b=A[i+1];let w;
  if(a===myTeam()||b===myTeam()){if(!auto)continue;w=a===myTeam()?b:a;C.log.push(names[C.round]+'：'+teamName(myTeam())+' 弃权');}
  else w=dbPow(a)>=dbPow(b)?a:b;
  const l=w===a?b:a;lose(l);next.push(w);C.log.push(names[C.round]+'：'+teamName(w)+' 胜 '+teamName(l));}
 if(!auto&&A.includes(myTeam()))return;dbAdvance(next);}
function dbAdvance(next){const C=S.db.cur;C.alive=next;C.round++;if(next.length===1){C.place[next[0]]=1;dbFinish();}save();}
function dbFinish(){const C=S.db.cur;C.done=true;const pts=[0,10,6,3,1];Object.keys(C.place).forEach(t=>{if(SECTS[t]||t==='me'||DB_EXTRA[t])S.db.pts[t]=(S.db.pts[t]||0)+pts[C.place[t]];});
 const w=Object.keys(C.place).find(t=>C.place[t]===1);S.db.hist.unshift({y:C.y,w,me:C.place[myTeam()]||0});if(S.db.hist.length>8)S.db.hist.length=8;
 news('天下宗门大比落幕。魁首：'+teamName(w)+(w===myTeam()?'——是你。':'。'),1);}
function dbMyMatch(){const C=S.db&&S.db.cur;if(!C||C.done)return null;const A=C.alive,i=A.indexOf(myTeam());if(i<0)return null;return A[i%2?i-1:i+1];}
function dbFight(){const opp=dbMyMatch();if(!opp||BT)return;const c=dbChamp(opp),C=S.db.cur,rn=['八强','四强','决赛'][C.round];
 const D=SECTS[opp]||DB_EXTRA[opp],look=c.pid&&LOOK[c.n]?c.n:SECTS[opp]?SECT_LOOK[opp][1]:DB_EXTRA[opp].look;
 const e=mkCustom(zOfStage(c.st),{look,name:teamName(opp)+' · '+c.n,st:c.st,m:1.7,boss:true});e.human=1;e.noLoot=1;e.el=D.el;if(SECTS[opp]&&C.round>=1)e.mech=SECTS[opp].mech;jhClose();
 startBattle([e],{bg:'leitai',noFlee:true,onWin:()=>{wuAdd(10,1);dbAfter(opp,true,rn);},onLose:()=>dbAfter(opp,false,rn)});}
function dbAfter(opp,win,rn){const C=S.db.cur,me=myTeam(),A=C.alive,next=[];const names=['八强','四强','决赛'];
 for(let i=0;i<A.length;i+=2){const a=A[i],b=A[i+1];let w;if(a===me||b===me)w=win?me:opp;else w=dbPow(a)>=dbPow(b)?a:b;const l=w===a?b:a;C.place[l]=[4,3,2][C.round];next.push(w);C.log.push(names[C.round]+'：'+teamName(w)+' 胜 '+teamName(l));}
 const c=dbChamp(opp);if(c.pid){const p=P_(c.pid);if(p)p.att+=win?-3:4;}
 dbAdvance(next);if(!win)while(!C.done)dbRound(true);const done=C.done,pl=C.place[me]||0;let txt=(win?'你赢下了'+rn+'。':'你在'+rn+'落败。')+(done||!win?'':' 下一轮在「江湖 · 宗门」里出战。');
 if(!win||done){const R=[0,{gx:900,st:70,wu:30},{gx:450,st:35,wu:20},{gx:220,st:16,wu:12},{gx:90,st:6,wu:6}][pl];if(R){if(smOn()){S.sm.gx+=R.gx;S.sm.tot+=R.gx;}S.stones+=zsAt(maxZone(),R.st);wuAdd(R.wu,1);S.fame+=[0,40,20,10,4][pl];
   txt+='\n名次：'+['','魁首','亚元','四强','八强'][pl]+'。'+(smOn()?'贡献 +'+R.gx+'，':'')+'灵石 +'+fmt(zsAt(maxZone(),R.st))+'，感悟 +'+R.wu+'。';if(pl===1){txt+=gItem(3);news(S.name+'代表'+teamName(me)+'夺得天下宗门大比魁首！',1);}}}
 save();setTimeout(()=>modal(`<h3>宗门大比 · ${rn}</h3><p>${esc(txt).replace(/\n/g,'<br>')}</p>`,[{t:'好',cls:'gold'}]),300);}

/* ---------- 江湖 · 宗门 页 ---------- */
function smHTML(){let h='';const D0=dbInit();
 if(smOn()){const k=S.sm.k,D=SECTS[k],q=smNextReq(),T=smTasks();
  h+=`<div class="banner zong"><div class="t">${D.n} · ${smTitle()}<small>贡献 ${S.sm.gx}（累计 ${S.sm.tot}）· ${S.sm.post?SM_POST[S.sm.post].n:'未任职'} · 每年领取俸禄与贡献</small></div></div>`;
  h+=`<h3 class="sub">宗门任务 <small>${yearName()} · 每年三件</small></h3>`+T.map(t=>`<div class="row2 ${t.done?'dim':''}"><div class="in"><div class="iname">${t.n}<span class="lv">贡献 ${Math.round(t.gx*(1+.15*S.sm.rank))} · 感悟 8</span></div><div class="istat">${esc(t.d)}</div></div><div class="ibtn">${t.done?'<span class="dim">已完成</span>':`<button class="btn sm gold" data-ja="smTask" data-arg="${t.i}">去做</button>`}</div></div>`).join('');
  h+=q?`<div class="row2"><div class="in"><div class="iname">晋升 · ${q.r>=5?D.lt:SM_RANK[q.r]}</div><div class="istat">累计贡献 ${S.sm.tot}/${q.tot} · 境界 ${STAGES[q.st].name}${q.r===2?' · 需通过长老考核':q.r===5?' · 需在宗主之争中击败现任'+D.lt:''}</div></div><div class="ibtn"><button class="btn sm ${S.sm.tot>=q.tot&&S.stage>=q.st?'gold':'ghost'}" data-ja="smUp">${q.r===2?'考核':q.r===5?'争位':'晋升'}</button></div></div>`:'';
  if(S.sm.rank>=3)h+=`<h3 class="sub">任职</h3>`+Object.keys(SM_POST).map(p=>`<div class="row2 ${S.sm.post===p?'friend':''}"><div class="in"><div class="iname">${SM_POST[p].n}</div><div class="istat">${SM_POST[p].d}</div></div><div class="ibtn">${S.sm.post===p?'<span>在任</span>':`<button class="btn sm" data-ja="smPost" data-arg="${p}">就任</button>`}</div></div>`).join('');
  h+=`<h3 class="sub">宝库 <small>用贡献换</small></h3>`+SM_SHOP.map(it=>{const lock=(it.r||0)>S.sm.rank,got=it.once&&S.sm.got[it.k];return `<div class="row2 ${lock||got?'dim':''}"><div class="in"><div class="iname">${it.ic?ico(it.ic):''}${it.n}<span class="lv">${smPrice(it)} 贡献</span></div><div class="istat">${lock?'需 '+SM_RANK[it.r]:got?'已领取':''}</div></div><div class="ibtn">${lock||got?'':`<button class="btn sm" data-ja="smBuy" data-arg="${it.k}" ${S.sm.gx>=smPrice(it)?'':'disabled'}>换</button>`}</div></div>`;}).join('');
  h+=`<p style="text-align:right"><button class="btn sm ghost" data-ja="smLeave">叛出宗门</button></p>`;}
 else{h+=`<p class="note">拜入一个宗门：做宗门任务攒贡献，一步步从外门弟子做到长老、宗主；执事起可以任职；每五年代表宗门出战天下宗门大比。（已开宗立派的人不能再拜入别家）</p>`+SECT_ORD.map(k=>{const why=smCanJoin(k);return `<div class="row2 ${why?'dim':''}"><div class="in"><div class="iname">${SECTS[k].n}<span class="lv">${SECTS[k].align}道 · 入门 ${STAGES[smSt(k,0)].name}</span></div><div class="istat">${why||'本门加成：'+Object.keys(SECTS[k].ally).map(q=>({atkP:'攻击',defP:'防御',healP:'治疗',mp:'灵力',ls:'吸血',critA:'暴击'}[q]||q)+' +'+Math.round(SECTS[k].ally[q]*100)+'%').join('、')+'（随职位提高）'}</div></div><div class="ibtn">${why?'':`<button class="btn sm gold" data-ja="smJoin" data-arg="${k}">拜入</button>`}</div></div>`;}).join('');}
 /* 大比 */
 const C=D0.cur,h0=h;h='';h+=`<h3 class="sub">天下宗门大比 <small>每五年一届</small></h3>`;
 if(C&&!C.done){const opp=dbMyMatch();h+=`<div class="banner"><div class="t">第 ${Math.floor(C.y/5)+1} 届 · ${['八强赛','半决赛','决赛'][C.round]}<small>${C.alive.map(teamName).join(' · ')}</small></div></div>`+
   (opp?`<div class="row2"><div class="in"><div class="iname">你的对手：${esc(teamName(opp))}</div><div class="istat">出战的是 ${esc(dbChamp(opp).n)}（${realmOf(dbChamp(opp).st)}）· ${yearName(C.y+2)}之前不出战算弃权</div></div><div class="ibtn"><button class="btn sm red" data-ja="dbFight">出战</button></div></div>`:`<p class="note">你已经出局了。大比会在${yearName(C.y+2)}落幕。</p>`)+
   (C.log.length?`<p class="note">${C.log.slice(-6).map(esc).join('<br>')}</p>`:'');}
 else h+=`<p class="note">下一届：${yearName(D0.next)}${S.stage<6?'（修到炼气七层才能参加）':''}。${smOn()?'你将代表'+smName()+'出战。':S.clan&&S.clan.zong?'你将代表'+esc(S.clan.name)+'出战。':'没有宗门，就以散修身份出战。'}</p>`;
 const rk=Object.keys(D0.pts).filter(t=>D0.pts[t]>0).sort((a,b)=>D0.pts[b]-D0.pts[a]);
 if(rk.length)h+=`<p class="note">宗门积分榜：${rk.slice(0,8).map((t,i)=>(i+1)+'. '+esc(teamName(t))+' '+D0.pts[t]).join(' · ')}</p>`;
 if(D0.hist.length)h+=`<p class="note">往届魁首：${D0.hist.slice(0,4).map(x=>yearName(x.y)+' '+esc(teamName(x.w))+(x.me?'（你：'+['','魁首','亚元','四强','八强'][x.me]+'）':'')).join(' · ')}</p>`;
 h=C&&!C.done?h+h0:h0+h;
 return h+`<h3 class="sub">挑战宗门</h3>`;}
const _smJB=jhBody;jhBody=function(){const b=_smJB.apply(this,arguments);if(JH.tab!=='sect')return b;return smHTML()+b;};
Object.assign(JH_ACT,{smJoin:k=>smJoin(k),smLeave:()=>smLeave(),smUp:()=>smPromote(),smPost:p=>smPost(p),smTask:i=>smTaskDo(i),smBuy:k=>smBuy(k),dbFight:()=>dbFight()});
const _smSF=sectFight;sectFight=function(k){if(smOn()&&S.sm.k===k){toast('这是你自己的宗门','bad');return;}return _smSF.apply(this,arguments);};

/* ---------- 读档：老存档补上感悟 ---------- */
const _smPI=pplInit;pplInit=function(){const r=_smPI.apply(this,arguments);if(S.wu==null){S.wu=Math.min(250,(S.seen||[]).length*3+Object.keys(S.q||{}).filter(id=>S.q[id].s==='done').length*8);}dbInit();return r;};
