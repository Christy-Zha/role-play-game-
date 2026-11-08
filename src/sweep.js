/* ================= 一键扫荡 =================
   击败过某地首领（通关过一次）后，可以一键清完那张图上的妖兽和首领，不限次数。
   灵源深渊：扫荡已经闯过的最深一层的守关者，不会推进层数。
   限制：每扫一遍要花三天；同一处连着扫，妖兽越来越少（灵脉余量），歇几天或换个地方就会回来。 */
const zDep=z=>(S.zDep&&S.zDep[z])||0;
const zYield=z=>Math.max(.25,1-.75*zDep(z));
function zoneRegen(n){if(!S.zDep)return;for(const k in S.zDep){S.zDep[k]=Math.max(0,S.zDep[k]-.05*n);if(!S.zDep[k])delete S.zDep[k];}}
function zoneDeplete(z,a){S.zDep=S.zDep||{};S.zDep[z]=Math.min(1,zDep(z)+a);}
const SWEEP_N=[1,5,10];
function sweepZones(){return ZORD.filter(z=>S.bossDown.includes(z)&&zoneUnlocked(z));}
function sweepFoes(z){const F0=[];
 if(z===7){const a=S.abyss;S.abyss=Math.max(0,a-1);const e=mkEnemy(7,true);S.abyss=a;e.sweepAbyss=1;F0.push(e);return F0;}
 const pool=ZONES[z].mobs&&ZONES[z].mobs.length?ZONES[z].mobs:[ZONES[z].boss];
 const nE=6+Math.min(z,4);
 for(let i=0;i<nE;i++){F0.push(mobOf(z,pick(pool),Math.random()<.15));const ex=z===0?(Math.random()<.45?1:0):1+(Math.random()<.35?1:0);for(let j=0;j<ex;j++)F0.push(mobOf(z,pick(pool)));}
 F0.push(mkEnemy(z,true));return F0;}
function sweepRun(z,T){const foes=sweepFoes(z),Y=zYield(z),lk=1+stats().luck,lootM=lk*omenMul('loot')*Y;
 let st=0;foes.forEach(f=>st+=f.stones||0);st=Math.ceil(st*lk*omenMul('stone')*Y);
 if(z!==7){const bonus=Math.ceil(zsAt(z,8)*Y);st+=bonus;qProgress('run',{z});}
 S.stones+=st;T.st+=st;
 const qi=req(S.stage)*QI_BATTLE*Y*omenMul('bqi')*foes.reduce((s,f)=>s+(f.boss?4:f.elite?2:1),0);const q0=S.qi;addQi(qi,true);T.qi+=S.qi-q0;
 foes.forEach(f=>{S.slain++;T.kills++;
  if(z!==7&&!f.elite&&!f.boss&&S.kills[z]!==undefined)S.kills[z]++;
  qProgress('kill',{look:f.look,z:f.z});
  const o=matDrops(f);for(const k in o){T.mats[k]=(T.mats[k]||0)+o[k];S.mats[k]=(S.mats[k]||0)+o[k];}
  const fz=Math.max(0,f.z||0);
  if(f.boss&&!f.elite&&z!==7&&UNIQ[f.look]){S.pity.uniq=(S.pity.uniq||0)+1;if(S.pity.uniq>=8||Math.random()<.12*lk){const it=mkUnique(f.look,z);if(it){S.pity.uniq=0;if(S.bag.length<BAG_MAX){S.bag.push(it);T.lines.push(`<span class="r-chuan"><span class="iname">传说 · ${it.n}</span></span>`);}else{S.stones+=it.sell;T.st+=it.sell;T.sold++;}}}}
  let gp=Math.random()<(f.boss?.35:f.elite?.15:.04)*lootM;if(f.boss){S.pity.gem=(S.pity.gem||0)+1;if(S.pity.gem>=5)gp=true;}
  if(gp){if(f.boss)S.pity.gem=0;T.gems++;const g=gGem(null,gemTierFor(fz));if(T.lines.length<14)T.lines.push(g.trim());}
  if(f.boss&&Math.random()<.06*lootM){const b=gBook();if(T.lines.length<14)T.lines.push(b.trim());}
  if(Math.random()<Math.min(1,(f.boss?1:f.elite?.6:.2)*lootM)){const it=mkItem(fz,f.boss||f.elite);if(S.bag.length<BAG_MAX){S.bag.push(it);T.items++;if(it.r>=2&&T.lines.length<14)T.lines.push(`<span class="r-${RAR[it.r].c}"><span class="iname">${it.n}</span></span>`);}else{S.stones+=it.sell;T.st+=it.sell;T.sold++;}}
  if(Math.random()<(f.boss?.6:.07)){S.meds++;T.meds++;}});
 if(z===7&&S.abyss>=10){/* 深渊十层以上的扫荡不重复给仙府残图 */}
 T.y=Math.min(T.y??1,Y);zoneDeplete(z,.22);advanceDays(3,'trip');T.runs++;}
function sweepGo(z,n){z=+z;n=+n||1;if(BT){toast('战斗中不能扫荡');return;}
 if(z!==7&&!S.bossDown.includes(z)){toast('这里还没有通关过，先亲自打一遍');return;}
 if(z===7&&S.abyss<1){toast('深渊还没有闯过任何一层');return;}
 const T={runs:0,st:0,qi:0,kills:0,items:0,gems:0,meds:0,sold:0,mats:{},lines:[]};
 for(let i=0;i<n;i++)sweepRun(z,T);const sold=autoSellJunk();
 S.hpF=1;S.mpF=1;save();checkStory();try{render();}catch(e){}const left=Math.round(zYield(z)*100);
 const nm=z===7?'灵源深渊 · 第 '+S.abyss+' 层':ZONES[z].n;
 modal(`<h3>扫荡完成 · ${nm}</h3><p>扫荡 <b>${T.runs}</b> 遍，斩妖 <b>${T.kills}</b>${z===7?'':'（含首领「'+ZONES[z].boss+'」×'+T.runs+'）'}。用去 <b>${T.runs*3}</b> 天，如今是${dateName()}。</p><p class="note">这里的灵脉余量还剩 ${left}%${left<60?'——妖兽已经稀了，收获跟着变少。歇几天、或者换个地方再来':''}。</p>
  <p>灵石 <b>${fmt(T.st)}</b> · 灵气 <b>${fmt(T.qi)}</b><br>装备 ${T.items} 件${T.sold?'（另有 '+T.sold+' 件行囊放不下，已换成灵石）':''}${sold.n?'（凡品 '+sold.n+' 件已自动卖掉，灵石 +'+fmt(sold.g)+'）':''} · 宝石 ${T.gems} · 疗伤药 ${T.meds}</p>
  ${Object.keys(T.mats).length?'<p>'+matLine(T.mats)+'</p>':''}${T.lines.length?'<div class="newsbox">'+T.lines.map(l=>'<p>'+l+'</p>').join('')+'</div>':''}`,
  [{t:'再扫 '+n+' 遍',cls:'gold',fn:()=>sweepGo(z,n)},{t:'换个地方',fn:sweepPick},{t:'好',cls:'ghost'}]);}
function sweepPick(){const L=sweepZones();if(!L.length&&S.abyss<1){toast('还没有通关过任何地点。先亲自打败一处的首领，那里就能一键扫荡了。');return;}
 const here=WD.M&&WD.M.kind==='zone'&&S.bossDown.includes(WD.M.z)?WD.M.z:null;
 const rows=L.slice().reverse().map(z=>`<div class="row2"><div class="in"><div class="iname">${ZONES[z].n}${z===here?' <span class="lv">当前</span>':''}</div><div class="istat">首领「${ZONES[z].boss}」 · 灵脉余量 ${Math.round(zYield(z)*100)}%</div></div><div class="sweep-n">${SWEEP_N.map(n=>`<button class="btn sm ${n===1?'gold':''}" data-sw="${z}:${n}">×${n}</button>`).join('')}</div></div>`).join('')
  +(S.abyss>=1?`<div class="row2"><div class="in"><div class="iname">灵源深渊 · 第 ${S.abyss} 层</div><div class="istat">只扫已经闯过的最深一层，不会往下推进</div></div><div class="sweep-n">${SWEEP_N.map(n=>`<button class="btn sm" data-sw="7:${n}">×${n}</button>`).join('')}</div></div>`:'');
 modal(`<h3>一键扫荡</h3><p class="note">通关过一次的地点，可以一键清完整张图的妖兽和首领。每扫一遍要花三天。同一处扫得太勤，妖兽就稀了；歇几天，或者换个地方。</p><div class="sweep-list">${rows}</div>`,[...(S.bossDown.length?[{t:'连战首领（亲自看着打）',fn:farmPick}]:[]),{t:'返回',cls:'ghost'}]);
 setTimeout(()=>{document.querySelectorAll('#ov [data-sw]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [z,n]=b.dataset.sw.split(':');const ov=$('#ov');if(ov){ov.hidden=true;ov.innerHTML='';}sweepGo(z,n);});},0);}

/* ================= 行囊整理 ================= */
function junkOf(r){return S.bag.filter(it=>it.r<=r&&!better(it)&&!it.uniq&&!(it.gems&&it.gems.length)&&!it.lock);}
function autoSellJunk(){if(!S.autoSell)return {n:0,g:0};const L=junkOf(0);let g=0;L.forEach(it=>g+=it.sell);const ids=new Set(L.map(it=>it.id));S.bag=S.bag.filter(it=>!ids.has(it.id));S.stones+=g;return {n:L.length,g};}
function bagTidy(){const n0=junkOf(0).length,n1=junkOf(1).length,n2=junkOf(2).length;
 modal(`<h3>整理行囊</h3><p class="note">只动「不如身上那件」的装备。传说、镶过宝石的不动。</p>`,[
  {t:`卖掉凡品（${n0} 件）`,fn:()=>bagSell(0)},{t:`卖掉凡品、灵品（${n1} 件）`,fn:()=>bagSell(1)},
  {t:`拆成材料：凡、灵、宝（${n2} 件）`,fn:()=>bagSalvage(2)},
  {t:S.autoSell?'自动卖凡品：开（点一下关掉）':'自动卖凡品：关（点一下打开）',fn:()=>{S.autoSell=!S.autoSell;save();bagTidy();}},
  {t:'返回',cls:'ghost'}]);}
function bagSell(r){const L=junkOf(r);let g=0;L.forEach(it=>g+=it.sell);const ids=new Set(L.map(it=>it.id));S.bag=S.bag.filter(it=>!ids.has(it.id));S.stones+=g;save();render();toast('卖掉 '+L.length+' 件，灵石 +'+fmt(g));}
function bagSalvage(r){const L=junkOf(r),o={};L.forEach(it=>{const zz=Math.max(0,Math.min(10,it.z===7?6:it.z||0)),ks=ZMAT[zz]||['gu','he'];const k=ks[it.id%ks.length];o[k]=(o[k]||0)+1+it.r;});
 const ids=new Set(L.map(it=>it.id));S.bag=S.bag.filter(it=>!ids.has(it.id));for(const k in o)S.mats[k]=(S.mats[k]||0)+o[k];save();render();
 modal(`<h3>拆解完成</h3><p>拆了 ${L.length} 件装备。</p>${Object.keys(o).length?'<p>'+matLine(o)+'</p>':''}`,[{t:'好',cls:'gold'}]);}
