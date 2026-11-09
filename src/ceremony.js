/* ================= 境界：解锁的能力 · 突破仪式 · 天劫 · 地图神通 ================= */
const REALM_UNLOCK={
 1:[['御剑飞行','地图上御剑：移动快一倍，妖兽追不上你']],
 2:[['本命法宝','以心血祭炼法宝，随你一同成长，战斗中祭出'],['第二门灵根法术','灵根之力更进一层'],['天劫','从此每个大境界，都要渡雷劫']],
 3:[['元神出窍','地图上元神离体，看见常人看不见的东西'],['元婴不灭','每场战斗可死而复生一次'],['问道','选择你的道途：正、魔、隐、宗']],
 4:[['领域','战斗神通：展开灵根领域三回合']],
 5:[['虚空遁','每天一次撕开虚空，直入秘境']],
 6:[['法相天地','战斗神通：三回合内伤害 ×1.8']],
 7:[['言出法随','战斗神通：一字「定」']],
 8:[['飞升','破界而去，天外有天']],
 9:[['斩道','战斗神通：斩去敌人一成半生命']],
 10:[['玄仙之躯','寿元近乎无尽']],11:[['金仙不朽','诸法加身']],12:[['太乙','万法归一']],13:[['大罗','跳出三界']]
};
const BT_YEARS=[0,1,3,10,20,30,50,80,100,150,200,300,500,800];
const OMEN_TXT=['','灵雨三日，站外的枯树抽出了新芽','紫气东来三万里，城中百鸟惊飞','元婴出世之时，月亮在白天升了起来','天地失色，方圆百里的灵气倒卷而来','虚空裂开一道缝，又缓缓合上','你的影子在云海上站成了一座山','天降金莲，落地不散','九天雷云散尽，天门洞开','仙乐自天外来','星河倒悬','诸天寂静','万道齐鸣','三界同震'];
function unlockList(r){return (REALM_UNLOCK[r]||[]);}
function shenHTML(){const R=realmIdx();return `<h2 class="sec">境界神通 <small>每个大境界都会带来新的能力</small></h2><div class="unl">${Object.keys(REALM_UNLOCK).filter(k=>+k<=STAGES[canonCap()].r).map(k=>{const r=+k,got=R>=r;return `<div class="u ${got?'got':''}"><b>${REALMS[r]}</b><span>${unlockList(r).map(u=>u[0]).join(' · ')}</span></div>`;}).join('')}<div class="u"><b>……</b><span>再往上的路，还看不清。</span></div></div>`;}

/* ---------- 突破 ---------- */
function breakthrough(){const need=req(S.stage);if(S.qi<need||BT)return;const ni=nextInfo();if(ni.final)return ascend();
 if(ni.gate){toast(ni.capped?capMsg():ni.wuG?'瓶颈：感悟不足（'+(S.wu||0)+'/'+ni.wuG+'）。去交委托、玩小游戏、经历奇遇':ni.fs?(ni.gate===RJ_GATE?'瓶颈：人间未了，先走完「人间篇」':'瓶颈：需先走完主线终章「灵源」'):'瓶颈：需先在「'+ZONES[ni.gz].n+'」探索尽头击败「'+ni.gate+'」','bad');return;}
 if(injOn()){toast('重伤未愈，经不起冲关（还要 '+injLeft()+' 天'+'）','bad');return;}
 const r1=STAGES[S.stage+1].r;if(ni.major&&r1>=2){jieAsk(ni);return;}
 const used=ni.major&&S.usePill&&S.pills>0;if(used){S.pills--;toxAdd(20);}
 if(Math.random()<ni.ch)breakOk(ni);else breakFail(ni,used);}
function breakOk(ni){const old=stats(),need=req(S.stage);S.qi=Math.max(0,S.qi-need);if(ni.major&&ni.wuN)S.wu=Math.max(0,(S.wu||0)-ni.wuN);S.stage++;lifeSync(S);if(S.pills<=0)S.usePill=false;
 if(!ni.major){toast('破境！踏入 '+stName(),'big');flashStage('gold');sfx('win');checkStory();render();save();return;}
 const r=realmIdx(),yrs=BT_YEARS[r]||0,L=yrs?simYears(yrs):[];S.dao.yin+=yrs>=10?1:0;
 if(r>=2&&S.root){const sk=SKILLS.find(s=>s.root===S.root&&s.rl===2);if(sk)S.flags.sk2=1;}
 save();ceremony(old,r,yrs,L,()=>{if(ni.fs&&!F('feisheng')){S.flags.feisheng=1;save();setTimeout(()=>playStory('feisheng'),300);}checkStory();if(r===3)setTimeout(pathAsk,600);render();});}
function breakFail(ni,used){S.qi=Math.floor(S.qi*.6);if(ni.major)injSet(4);toast('冲关失败，灵气溃散了四成。'+(ni.major?'经脉受损，要养四天才能再冲。':'')+(used?'破境丹已耗去。':''),'bad');flashStage('red');sfx('bad');if(S.pills<=0)S.usePill=false;render();save();}

/* ---------- 天劫 ---------- */
function jieN(r1){return 3+Math.floor(r1/2);}
function jieAsk(ni){const r1=STAGES[S.stage+1].r,N=jieN(r1),jz=S.jzDan>0;
 modal(`<h3>天劫 · ${REALMS[r1]}</h3><p>天上的云开始聚了。冲击${REALMS[r1]}，要扛过 <b>${jz?Math.ceil(N/2):N}</b> 道雷劫。每三道里有一道「紫霄神雷」，专劈你一人。</p>
 <p class="note">雷劫不看防御，看你能不能撑住：防御、护盾、回春、疗伤药、护身符都用得上。也可以出手打散劫云，提前渡劫。<br>失败：灵气散去一半，重伤，要养十天。${S.jieDan>0?'<br>你有渡劫丹 '+S.jieDan+' 颗：本次雷击 -30%。':''}${jz?'<br>你有九转金丹：雷劫减半，雷力减半。':''}</p>`,
  [{t:'渡劫',cls:'red',fn:()=>startJie(ni)},{t:'再准备一下',cls:'ghost'}]);}
function startJie(ni){const r1=STAGES[S.stage+1].r,st=stats();let N=jieN(r1),k=1;if(S.jzDan>0){S.jzDan--;N=Math.ceil(N/2);k*=.5;}if(S.jieDan>0){S.jieDan--;k*=.7;}
 const e={n:'九霄雷劫',look:'劫云',jie:1,hp:st.atk*N*3.2,max:st.atk*N*3.2,atk:st.hp*(.16+.012*r1)*k,def:st.def*.3,spd:99,stones:0,noLoot:1,z:maxZone(),boss:false,el:null};
 sfx('thunder');startBattle([e],{jie:N,noFlee:true,bg:'jie',onWin:()=>{breakOk(ni);},onLose:()=>{S.qi=Math.floor(S.qi*.5);injSet(10);news(S.name+'渡'+REALMS[r1]+'劫失败。');toast('渡劫失败：灵气散去一半，重伤，要养十天','bad');save();render();}});}
async function jieStrike(a){const ps=BT.party.filter(p=>p.alive),big=(BT.jr||1)%3===0;BT.fx.push({k:'flash',t0:BT.t,dur:.35});sfx('thunder');BT.shake=.6;
 if(big){const h=BT.party[0];btMsg('紫霄神雷！');BT.fx.push({k:'bolt',x:h.bx,y:h.by-6,t0:BT.t,dur:.5});await bwait(260);btHit(h,h.max*.4*(a.atk/(stats().hp*.17)),'',a);}
 else{btMsg('雷劫落下！');ps.forEach((p,i)=>BT.fx.push({k:'bolt',x:p.bx,y:p.by-6,t0:BT.t+i*.06,dur:.45}));await bwait(300);ps.forEach(p=>btHit(p,a.atk*(p.key==='hero'?1:.7),'',a));}}

/* ---------- 突破仪式 ---------- */
let CER=null;
function ceremony(old,r,yrs,L,done){const nw=stats(),el=$('#cer')||(()=>{const d=document.createElement('div');d.id='cer';document.body.appendChild(d);return d;})();el.hidden=false;sfx('rise');
 const row=(n,a,b)=>`<div class="cj"><span>${n}</span><b>${fmt(a)}</b><i>→</i><b class="up">${fmt(b)}</b><em>+${Math.round((b/a-1)*100)}%</em></div>`;
 const imp=(S.news||[]).filter(n=>n.y>S.year-yrs&&n.imp).slice(0,3);
 el.innerHTML=`<canvas id="cerCv"></canvas><div class="cer-sit">${heroSit(S.gender==='f')}</div><div class="cer-in">
  <div class="cer-t"><small>破境</small><b>${REALMS[r]}</b><span>${stName()}</span></div>
  <p class="cer-o">天地异象 · ${OMEN_TXT[r]||'天地共鸣'}</p>
  <div class="cer-box"><div class="cjs">${row('攻',old.atk,nw.atk)}${row('防',old.def,nw.def)}${row('血',old.hp,nw.hp)}</div>
  <div class="cer-u">${unlockList(r).map(u=>`<div><b>解锁 · ${u[0]}</b><small>${u[1]}</small></div>`).join('')}<div><b>寿元 · ${lifeText(myLife())}</b><small>当前 ${S.age} 岁</small></div></div>
  ${yrs?`<div class="cer-y"><b>突破历练 ${yrs} 年 · ${yearName()}</b>${imp.length?imp.map(n=>`<p>${esc(sub(n.t))}</p>`).join(''):'<p>江湖上风平浪静。</p>'}</div>`:''}</div>
  <button class="btn gold" id="cerOk">出关</button></div>`;
 CER={t:0,last:performance.now(),r,bolts:[],parts:[],flash:0};const cv=$('#cerCv');
 const fit=()=>{const dpr=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;CER.dpr=dpr;};fit();
 const loop=t=>{if(!CER||el.hidden)return;const dt=Math.min(.05,(t-CER.last)/1000);CER.last=t;CER.t+=dt;cerDraw(cv,dt);requestAnimationFrame(loop);};requestAnimationFrame(loop);
 $('#cerOk').onclick=()=>{el.hidden=true;el.innerHTML='';CER=null;done&&done();};}
function cerDraw(cv,dt){const x=cv.getContext('2d'),d=CER.dpr,W=cv.width/d,H=cv.height/d,t=CER.t;x.setTransform(d,0,0,d,0,0);
 const col=S.root?EL[S.root].c:'#c9a8ff';x.drawImage(sceneCanvas('leijie',W,H),0,0,W,H);
 const cx=W/2,cy=H*.5;x.globalCompositeOperation='lighter';
 for(let i=0;i<4;i++){const rr=60+i*26+Math.sin(t*2+i)*5;x.strokeStyle=rgba(col,.4-i*.08);x.lineWidth=2.4;x.beginPath();x.ellipse(cx,cy-52,rr,rr*.42,Math.sin(t*.6+i)*.35,0,6.283);x.stroke();}
 let g=x.createRadialGradient(cx,cy-70,0,cx,cy-70,120);g.addColorStop(0,rgba(col,.5));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(cx-130,cy-200,260,260);
 if(Math.random()<dt*2){const bx=cx+(Math.random()-.5)*W*.9;CER.bolts.push({pts:bolt(bx,0,Math.random()<.5?cx+(Math.random()-.5)*50:bx+(Math.random()-.5)*80,Math.random()<.5?cy-60:H*.45),age:0});CER.flash=.45;sfx('thunder');}
 CER.bolts=CER.bolts.filter(b=>(b.age+=dt)<.35);CER.bolts.forEach(b=>{x.strokeStyle='rgba(200,170,255,'+(1-b.age/.35)*.7+')';x.lineWidth=5;x.shadowColor='#b48aff';x.shadowBlur=18;x.beginPath();b.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.lineWidth=1.4;x.strokeStyle='rgba(255,255,255,'+(1-b.age/.35)+')';x.stroke();x.shadowBlur=0;});
 if(Math.random()<.7)CER.parts.push({x:cx+(Math.random()-.5)*160,y:cy+10,vy:-20-Math.random()*40,life:2+Math.random()*2,age:0});CER.parts=CER.parts.filter(p=>(p.age+=dt)<p.life);CER.parts.forEach(p=>{p.y+=p.vy*dt;x.fillStyle=rgba(col,(1-p.age/p.life)*.9);x.beginPath();x.arc(p.x,p.y,1.4,0,6.283);x.fill();});
 x.globalCompositeOperation='source-over';if(CER.flash>0){x.fillStyle='rgba(235,225,255,'+CER.flash*.45+')';x.fillRect(0,0,W,H);CER.flash-=dt*2.5;}}
function bolt(x0,y0,x1,y1){const P=[[x0,y0]];const n=12;for(let i=1;i<=n;i++){const k=i/n;P.push([x0+(x1-x0)*k+(i<n?(Math.random()-.5)*36:0),y0+(y1-y0)*k]);}return P;}

/* ---------- 地图神通：御剑、出窍、虚空遁 ---------- */
function abilBtns(){const R=realmIdx(),M=WD.M;if(!M)return '';let h='';
 if(R>=1)h+=`<button class="btn sm ${WD.fly?'gold':'ghost'}" data-act="fly">${WD.fly?'御剑中':'御剑'}</button>`;
 if(R>=3)h+=`<button class="btn sm ${WD.soul>0?'gold':'ghost'}" data-act="soul">出窍</button>`;
 if(R>=5&&M.kind==='zone'&&S.voidDay!==dayKey())h+=`<button class="btn sm ghost" data-act="void">虚空遁</button>`;return h;}
function flyToggle(){if(realmIdx()<1)return;WD.fly=!WD.fly;if(WD.P)WD.P.spd=WD.fly?9:4.4;sfx(WD.fly?'cast':'tap');toast(WD.fly?'御剑而起：妖兽追不上你，碰到也不会开战':'落地');const b=$('[data-act="fly"]');if(b){b.textContent=WD.fly?'御剑中':'御剑';b.className='btn sm '+(WD.fly?'gold':'ghost');}}
function soulOut(){if(realmIdx()<3||!WD.M)return;WD.soul=10;sfx('cast');toast('元神出窍：十息之内，你能看见藏起来的东西');
 const M=WD.M;if(M.kind==='town'&&!M.mk&&!F('soulTown')){S.flags.soulTown=1;setTimeout(()=>{checkStory();},1800);}
 if(M.kind==='zone'&&!M.hidSpawned){M.hidSpawned=1;const fr=bfsAll(M,[Math.round(WD.P.x),Math.round(WD.P.y)]);const cells=[...fr].map(s=>s.split(',').map(Number)).filter(([c,r])=>!propAt(M,c,r)&&Math.abs(c-WD.P.x)+Math.abs(r-WD.P.y)>3);
  const n=1+(Math.random()<.5?1:0);for(let i=0;i<n&&cells.length;i++){const [c,r]=cells.splice(Math.floor(Math.random()*cells.length),1)[0];const kind=!(S.flags.xfs&&S.flags.xfs.soul)&&realmIdx()>=3&&Math.random()<.5?'xf':pick(['treasure','ghost','treasure']);
   const p=addProp(M,c,r,'spark',{blocks:false,hid:1,gold:kind!=='ghost'});p.lab=kind==='ghost'?'游魂':'隐秘之物';p.act=pp=>{removeProp(M,pp);EVZ=M.z;
    if(kind==='xf')toast(xfGet('soul').trim()||'一团旧光散了','big');else if(kind==='ghost')playEvent('soul_ghost',{});else toast(('地下埋着东西。'+gItem(3)+gMat(pick(ZMAT[M.z]||['he']),2)).trim(),'big');save();};}}}
function voidStep(){if(realmIdx()<5||!WD.M||WD.M.kind!=='zone')return;S.voidDay=dayKey();sfx('thunder');save();enterRift();}
Object.assign(EVENTS,{soul_ghost:{title:'游魂',g:'魂',zones:'cult',lines:['一缕游魂蹲在石头后面，只有出窍的元神才看得见它。','“你……你能看见我？灵潮那天我死在这里，一直没人看见我。”'],choices:[
 {t:'超度它',act:()=>{kar(1);S.dao.zheng+=1;return '你替它念了一段往生的经。它冲你笑了笑，像烟一样散了。'+gQi(.25);}},
 {t:'问它这里藏着什么',act:()=>'游魂指了指脚下。“我埋的。给你吧，我用不上了。”'+gS(zs(8))+gMat('xue',1)},
 {t:'炼化它',act:()=>{kar(-2);S.dao.mo+=1;return '它尖叫着化成了一缕阴气，被你吸了进去。'+gQi(.6);}}]}});
