/* ================= 材料 · 丹道 · 符箓 · 本命法宝 · 保底 ================= */
const MATS={cao:{n:'灵草',c:'#7ad08a'},he:{n:'妖核',c:'#c86a5a'},gu:{n:'兽骨',c:'#d8ccb0'},tie:{n:'寒铁',c:'#9ab0c0'},huo:{n:'火精',c:'#ff8a3a'},lei:{n:'雷晶',c:'#c9a8ff'},xing:{n:'星砂',c:'#bfe8ff'},xue:{n:'血灵芝',c:'#e0505a'},ru:{n:'千年灵乳',c:'#fff2c8'}};
const ZMAT={0:['gu','he'],1:['huo','gu'],2:['cao','xue'],3:['tie','cao'],4:['lei','tie'],5:['huo','he'],6:['ru','he'],7:['he','lei'],8:['xing','lei'],9:['xing','tie'],10:['ru','xing']};
function gMat(k,n){S.mats[k]=(S.mats[k]||0)+n;return ' '+MATS[k].n+' +'+n+'。';}
function matDrops(f){const z=Math.max(0,f.z||0),L=ZMAT[z]||ZMAT[0],out={};const add=(k,n)=>out[k]=(out[k]||0)+n;
 if(f.noLoot)return out;if(Math.random()<.6)add(Math.random()<.65?L[0]:L[1],1);if(Math.random()<.35)add('cao',1);if(f.elite)add(L[1],1);
 if(f.boss){add(L[0],2);add(L[1],1);add('he',2);if(Math.random()<.3)add('ru',1);if(Math.random()<.3)add('xue',1);}return out;}
function matLine(o){return Object.keys(o).map(k=>MATS[k].n+' +'+o[k]).join(' · ');}

/* ---------- 丹道 ---------- */
const DAN_RANK=[{n:'丹徒',xp:0},{n:'丹师',xp:30},{n:'丹王',xp:120},{n:'丹宗',xp:400},{n:'丹圣',xp:1200}];
const danRank=()=>{let r=0;DAN_RANK.forEach((d,i)=>{if(S.dan.xp>=d.xp)r=i;});return r;};
const RECIPES=[
 {k:'liao',n:'疗伤药',need:{cao:2},rk:0,d:'战斗中救命',out:q=>{S.meds+=3*q;return '疗伤药 +'+3*q;}},
 {k:'qing',n:'清心丹',need:{cao:1,he:1},rk:0,d:'回复灵力',out:q=>{S.mps+=2*q;return '清心丹 +'+2*q;}},
 {k:'juqi',n:'聚气丹',need:{he:3},rk:0,d:'服下得本层 25% 灵气',out:q=>{S.qiPills+=2*q;return '聚气丹 +'+2*q;}},
 {k:'pojing',n:'破境丹',need:{he:4,cao:2,gu:2},rk:1,d:'冲大境界 +25%',out:q=>{S.pills+=q;return '破境丹 +'+q;}},
 {k:'zhuji',n:'筑基丹',need:{cao:4,he:3,gu:2},rk:1,d:'赐给弟子：下次冲关 +25%',out:q=>{S.zjDan=(S.zjDan||0)+q;return '筑基丹 +'+q;}},
 {k:'shouyuan',n:'寿元丹',need:{cao:3,xue:1,ru:1},rk:1,d:'延寿三十年，自己服或赠予故人',out:q=>{S.lifeP=(S.lifeP||0)+q;return '寿元丹 +'+q;}},
 {k:'dujie',n:'渡劫丹',need:{lei:2,tie:2,he:4},rk:2,d:'下一次天劫雷击 -30%',out:q=>{S.jieDan=(S.jieDan||0)+q;return '渡劫丹 +'+q;}},
 {k:'xisui',n:'洗髓丹',need:{xue:2,ru:1,he:5},rk:2,d:'永久攻防血 +3%（最多十颗）',out:q=>{const n=Math.min(q,10-(S.xisui||0));S.xisui=(S.xisui||0)+n;return n?'洗髓 +'+n+'（已服 '+S.xisui+'/10）':'洗髓已到极限，药力散了';}},
 {k:'jiuzhuan',n:'九转金丹',need:{ru:3,xing:3,lei:3,xue:3},rk:3,d:'下一次天劫减半、雷力减半',out:q=>{S.jzDan=(S.jzDan||0)+q;return '九转金丹 +'+q;}},
 {k:'huanhun',n:'还魂丹',need:{ru:5,xue:5,xing:5,he:10},rk:4,d:'起死回生：救回一位故去的人',out:q=>{S.hhDan=(S.hhDan||0)+q;return '还魂丹 +'+q;}}
];
const canBrew=r=>danRank()>=r.rk&&Object.keys(r.need).every(k=>(S.mats[k]||0)>=r.need[k]);
function danHTML(){const rk=danRank(),nx=DAN_RANK[rk+1];
 return `<h2 class="sec">丹房 <small>${DAN_RANK[rk].n}${nx?' · 丹道 '+S.dan.xp+'/'+nx.xp:' · 已至绝顶'}</small></h2>
 <div class="mats">${Object.keys(MATS).map(k=>`<span style="--mc:${MATS[k].c}">${MATS[k].n} <b>${S.mats[k]||0}</b></span>`).join('')}</div>
 ${RECIPES.map(r=>{const lock=rk<r.rk,ok=canBrew(r);return `<div class="row2 ${lock?'dim':''}"><div class="in"><div class="iname">${r.n}${lock?`<span class="lv">需${DAN_RANK[r.rk].n}</span>`:''}</div><div class="istat">${r.d} · ${Object.keys(r.need).map(k=>MATS[k].n+'×'+r.need[k]).join(' ')}</div></div><button class="btn sm ${ok?'gold':'ghost'}" data-act="brew" data-arg="${r.k}" ${ok?'':'disabled'}>开炉</button></div>`;}).join('')}
 <p class="note">妖兽身上能剥到材料，首领更多。开炉后看准火候收火：正中「极品」药效翻倍。丹道越高，火候越好掌握。</p>`;}
let BREW=null;
function brewOpen(k){const r=RECIPES.find(x=>x.k===k);if(!r||!canBrew(r))return;Object.keys(r.need).forEach(m=>S.mats[m]-=r.need[m]);save();const rk=danRank(),pity=(S.pity.dan||0)>=12;
 const zw=.1+rk*.025+(pity?.2:0),zc=.25+Math.random()*.5;BREW={r,zc,zw,t0:performance.now(),sp:.9+r.rk*.25,done:false};
 modal(`<h3>开炉 · ${r.n}</h3><p class="note">炉火在跳。指针扫到金色区间时收火——越靠中心，品相越好。${pity?'<b>（炉中隐有宝光：这一炉必出极品）</b>':''}</p><div class="brew"><div class="bz" style="left:${(zc-zw)*100}%;width:${zw*200}%"></div><div class="bz2" style="left:${(zc-zw*.35)*100}%;width:${zw*70}%"></div><i id="brN"></i></div>`,[{t:'收火',cls:'gold',keep:1,fn:brewStop}]);
 const tick=()=>{if(!BREW||BREW.done)return;const p=((performance.now()-BREW.t0)/1000*BREW.sp)%2,v=p>1?2-p:p;BREW.v=v;const n=$('#brN');if(n){n.style.left=(v*100)+'%';requestAnimationFrame(tick);}};requestAnimationFrame(tick);}
function brewStop(){if(!BREW||BREW.done)return;BREW.done=true;const B=BREW,d=Math.abs(B.v-B.zc);let q=d<B.zw*.35?3:d<B.zw?2:d<B.zw*2?1:0;S.pity.dan=S.pity.dan||0;if(q===3)S.pity.dan=0;else S.pity.dan++;
 const Q=['下品','中品','上品','极品'][q],mul=q===3?2:q>=1?1:(Math.random()<.5?1:0);const txt=mul?B.r.out(mul):'丹药成了一炉焦炭';const xp=2+B.r.rk*4+q;S.dan.xp+=xp;if(mul)wuAdd(2,1);const rk0=danRank();
 sfx(q===3?'win':q?'coin':'bad');save();BREW=null;setTimeout(()=>{modal(`<h3>${Q} · ${B.r.n}</h3><p>${txt}。</p><p class="note">丹道 +${xp}（${DAN_RANK[rk0].n}）</p>`,[{t:'再开一炉',cls:'gold',fn:()=>brewOpen(B.r.k)},{t:'好',cls:'ghost'}]);if(TAB==='cult')render();},120);}

/* ---------- 符箓 ---------- */
const FU={lei:{n:'雷符',d:'对全体敌人落雷（雷），能引爆灼烧'},huo:{n:'火符',d:'全体灼烧两层（火）'},ding:{n:'定身符',d:'一名敌人停顿一回合'},hu:{n:'护身符',d:'全队获得 20% 生命护盾'},po:{n:'破甲符',d:'全体破甲三回合'}};
async function fuUse(a,k){if(!(S.fu[k]>0))return;S.fu[k]--;const fs=BT.foes.filter(f=>f.alive);btMsg(a.name+' 祭出「'+FU[k].n+'」');await btCast(a,k==='lei'?'#c9a8ff':k==='huo'?'#ff8a3a':'#e3b862');
 if(k==='lei'){await btArea('bolt',a,fs);sfx('thunder');fs.forEach(f=>elStrike(a,f,'lei',dmgF(a.atk*1.3,penD(a,f)*.7),{st:'shock',stn:1}));}
 if(k==='huo'){await btArea('fire',a,fs);sfx('fire');fs.forEach(f=>stAdd(f,'burn',2,a));}
 if(k==='ding'){const t=fs.reduce((m,f)=>f.max>m.max?f:m,fs[0]);stAdd(t,'stun',1,a);}
 if(k==='hu')BT.party.filter(p=>p.alive).forEach(p=>{p.sh=(p.sh||0)+p.max*.2;btPop(p,'护身','buff');});
 if(k==='po')fs.forEach(f=>stAdd(f,'brk',3,a));}

/* ---------- 本命法宝 ---------- */
const NATAL={
 jian:{n:'本命飞剑',g:'剑',d:'攻伐第一。斩向最强的敌人，无视一半防御',fx:lv=>({atkP:.025*lv}),bd:lv=>'飞剑斩最强之敌，威力 '+(3+.12*lv).toFixed(1)+' 倍，破甲五成'},
 yin:{n:'翻天印',g:'印',d:'砸向全场，三成五的机会震晕',fx:lv=>({atkP:.012*lv,defP:.012*lv}),bd:lv=>'全体 '+(1.3+.06*lv).toFixed(1)+' 倍，可能震晕'},
 zhong:{n:'混元钟',g:'钟',d:'护住全队，反震来犯之敌',fx:lv=>({hpP:.03*lv,defP:.01*lv}),bd:lv=>'全队护盾 '+Math.round(25+lv)+'%，反震三成'},
 hu:{n:'吞天葫芦',g:'葫',d:'吞敌人的精血，化为全队的生机',fx:lv=>({mp:.03*lv,healP:.02*lv}),bd:lv=>'吞每个敌人 '+Math.round(10+.3*lv)+'% 生命，分给全队'},
 jing:{n:'照妖镜',g:'镜',d:'照出破绽：敌人受到的伤害 +50%',fx:lv=>({critA:.004*lv,cd:.02*lv}),bd:lv=>'照妖：最强之敌三回合、其余两回合受伤 +50%'}
};
const natalMax=()=>8+realmIdx()*4;
const natalCost=()=>({stones:Math.ceil(zsAt(maxZone(),2.2)*(1+S.natal.lv*.35)),mat:S.natal.lv%3===2?'xue':S.natal.el==='lei'?'lei':S.natal.el==='huo'?'huo':'tie',n:1+Math.floor(S.natal.lv/4)});
function natalHTML(){if(realmIdx()<2)return `<h2 class="sec">本命法宝 <small>金丹之后开启</small></h2><p class="note">结成金丹，才能以心血祭炼一件与你性命相连的法宝。它会随你成长，在战斗里化作神通。</p>`;
 if(!S.natal)return `<h2 class="sec">本命法宝 <small>尚未祭炼</small></h2><p class="note">祭炼需要寒铁 ×3、妖核 ×5。法宝的五行随你的灵根，一旦祭成不可更改。</p><div class="natpick">${Object.keys(NATAL).map(k=>`<button class="np" data-act="natal" data-arg="${k}"><b>${NATAL[k].g}</b><span>${NATAL[k].n}</span><small>${NATAL[k].d}</small></button>`).join('')}</div>`;
 const N=S.natal,T=NATAL[N.t],c=natalCost(),fx=T.fx(N.lv),ok=N.lv<natalMax()&&S.stones>=c.stones&&(S.mats[c.mat]||0)>=c.n;
 return `<h2 class="sec">本命法宝 <small>${T.n} · ${N.lv} 重</small></h2><div class="row2 r-xian"><div class="in"><div class="iname">${esc(N.name||T.n)}<span class="lv">${EL[N.el]?EL[N.el].n+'行 · ':''}${N.lv}/${natalMax()} 重</span></div><div class="istat">神通：${T.bd(N.lv)}<br>常驻：${Object.keys(fx).map(k=>({atkP:'攻',defP:'防',hpP:'血',mp:'灵力',healP:'治疗',critA:'暴击',cd:'暴伤'}[k])+' +'+Math.round(fx[k]*1000)/10+'%').join(' · ')}${N.el?'<br>同属性法术伤害 +'+N.lv+'%':''}</div></div>
  <button class="btn sm ${ok?'gold':'ghost'}" data-act="natalUp" ${ok?'':'disabled'}>${N.lv>=natalMax()?'待突破':'温养<br><small>'+fmt(c.stones)+' 灵石 · '+MATS[c.mat].n+'×'+c.n+'</small>'}</button></div>`;}
function natalForge(k){if(S.natal||realmIdx()<2)return;if((S.mats.tie||0)<3||(S.mats.he||0)<5){toast('材料不够：寒铁 ×3、妖核 ×5','bad');return;}S.mats.tie-=3;S.mats.he-=5;S.natal={t:k,lv:1,el:S.root||null,name:NATAL[k].n};sfx('rise');
 save();render();modal(`<h3>祭炼 · ${NATAL[k].n}</h3><p>你咬破指尖，一滴心血落进炉火。火焰陡然变成了${S.root?EL[S.root].n+'色':'金色'}。</p><p>那件东西在火里成形的时候，你听见了自己的心跳——两声，一声是你的，一声是它的。</p><p class="note">战斗中，在「神通」里祭出本命法宝（每三回合一次）。用材料和灵石温养它，境界越高能温养得越深。</p>`,[{t:'好',cls:'gold'}]);}
function natalUp(){const N=S.natal;if(!N||N.lv>=natalMax())return;const c=natalCost();if(S.stones<c.stones||(S.mats[c.mat]||0)<c.n)return;S.stones-=c.stones;S.mats[c.mat]-=c.n;N.lv++;sfx('bell');toast(NATAL[N.t].n+' 温养至 '+N.lv+' 重');save();render();}

/* ---------- 汇总：流派加成 ---------- */
function buildFx(){const A={},add=(k,v)=>A[k]=(A[k]||0)+v;
 if(hasRoot('jin')){add('pen',.2);add('cd',.3);}if(hasRoot('tu'))add('dr',.15);if(hasRoot('mu'))add('healP',.3);
 if(S.natal){const fx=NATAL[S.natal.t].fx(S.natal.lv);for(const k in fx)add(k,fx[k]);}
 if(S.xisui){add('atkP',.03*S.xisui);add('hpP',.03*S.xisui);add('defP',.03*S.xisui);}
 if(S.path==='mo')add('ls',.1);if(S.path==='zheng')add('defP',.1);if(S.path==='yin')add('dodge',.08);if(S.path==='zong')add('atkP',.05);
 Object.keys(S.sects||{}).forEach(k=>{const r=S.sects[k];if(r.rel==='ally'&&SECTS[k]&&SECTS[k].ally)for(const q in SECTS[k].ally)add(q,SECTS[k].ally[q]);});
 if(injOn()){add('hpP',-.2);add('atkP',-.1);}
 return A;}

/* ---------- 保底 ---------- */
function pityRar(r,boss){const P=S.pity;if(r>=3){P.rar=0;return r;}P.rar=(P.rar||0)+(boss?3:1);if(P.rar>=60){P.rar=0;toast('福缘积满：必出仙品！','big');return 3;}return r;}
function pityHTML(){return '';}
