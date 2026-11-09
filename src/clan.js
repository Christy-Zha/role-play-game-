/* ================= 行社 ================= */
const CL_BLD={
 ci:{n:'议事堂',g:'祠',base:200,d:lv=>'社员上限 '+(3+lv*2)+'；其他建筑最高可升到 '+(lv+1)+' 级'},
 tian:{n:'灵田',g:'田',base:150,d:lv=>lv?'每天产出灵石 '+fmt(tianRate(lv)*2)+'，最多囤 6 天':'开垦后每天产出灵石'},
 dan:{n:'丹房',g:'丹',base:180,d:lv=>lv?'每 '+Math.max(1,Math.round(danEvery(lv)/7200))+' 天炼成一颗疗伤药，最多囤 '+(4+lv)+' 颗':'修建后自动炼制疗伤药'},
 qi:{n:'炼器坊',g:'器',base:300,d:lv=>lv?'可合成宝石（'+lv*4+'% 几率多出一颗）；派遣带回宝石 +'+lv*3+'%':'修建后可在行囊合成宝石'},
 jing:{n:'藏经阁',g:'经',base:250,d:lv=>'吐纳速度 +'+lv*6+'%；派遣带回秘籍 +'+lv*10+'%'},
 wu:{n:'演武场',g:'武',base:250,d:lv=>'你的攻防 +'+lv*4+'%；社员历练经验 +'+lv*10+'%'}
};
const CL_TIER=[{n:'探路',days:3,m:1},{n:'清剿',days:8,m:3},{n:'远征',days:20,m:10}];
const CL_STORY={
 chenmo:{name:'陈默',k:{id:'cm',h:'#1a1612',s:'#d8ad86',r:'#3a4a5a',a:'#8a7a5a',w:'#2a2a2a',p:'#2c2a26',b:'#1e1a16',hair:'short'},role:'护卫',apt:3,lv:6,cond:()=>S.seen.includes('lizu')&&!F('chenmoGone'),spy:1},
 man:{name:'林小满',k:'man',role:'弟子',apt:5,lv:1,cond:()=>S.seen.includes('xiaoman')},
 he:{name:'阿禾',k:'he',role:'学徒',apt:3,lv:2,cond:()=>qDone('he3')},
 guo:{name:'郭师傅',k:'guo',role:'匠人',apt:2,lv:9,cond:()=>F('guoJoined')},
 qian:{name:'钱三',k:'qian',role:'账房',apt:2,lv:7,cond:()=>qDone('qian2')},
 shen:{name:'沈棋',k:'shen',role:'长老',apt:4,lv:22,cond:()=>F('shenWin')},
 zero:{name:'零号',k:'zero',role:'客卿',apt:5,lv:16,cond:()=>F('zeroSaved')&&qDone('zero1')},
 zhou:{name:'周烈',k:'zhou',role:'教头',apt:4,lv:16,cond:()=>F('zhouSaved')}
};
const CL_SUR='林陈李王张赵周吴郑孙沈苏顾陆叶宋江许韩冯';const CL_GIV=['青','远','宁','川','安','禾','砚','晚','舟','白','岚','石','乔','一','言','星','溪','柏','衡','野'];
function clanHydrate(c){c=Object.assign({name:'无名',fame:0,mem:[],bld:{},store:0,medT:0,medS:0,log:[],evClock:0,last:Date.now()},c);c.bld=Object.assign({ci:1,tian:0,dan:0,qi:0,jing:0,wu:0},c.bld);return c;}
const tianRate=lv=>Math.ceil(zsAt(maxZone(),.6)*lv*(S.clan&&S.clan.mem.some(m=>m.sid==='qian'&&!m.gone)?1.2:1));
const danEvery=lv=>Math.max(8*60,(60-lv*5)*60);
const clCap=()=>3+S.clan.bld.ci*2;
const clBuildMax=k=>k==='ci'?10:Math.min(10,S.clan.bld.ci+1);
const clCost=(k,lv)=>Math.ceil(CL_BLD[k].base*Math.pow(2.25,lv));
function clanBonus(){const c=S.clan;if(!c)return {atk:0,def:0,idle:0};return {atk:c.bld.wu*.04,def:c.bld.wu*.04,idle:c.bld.jing*.06};}
function clLog(t){const c=S.clan;c.log.unshift({t,at:Date.now()});c.log.length=Math.min(c.log.length,10);}
const clRank=m=>m.lv+m.apt*3;
const clZones=()=>ZORD.filter(z=>zoneUnlocked(z));
const clDiff=(z,t)=>ZORD.indexOf(z)*4+t*3+2;
const clP=(m,z,t)=>Math.max(.08,Math.min(.96,.55+(clRank(m)-clDiff(z,t))*.06));
const clLevel=()=>{const f=S.clan.fame;return f>=800?'名门望族':f>=300?'一方豪族':f>=100?'新兴行社':f>=30?'小有名气':'寒门初立';};
function clanSync(){const c=S.clan;if(!c)return;for(const id in CL_STORY){const D=CL_STORY[id];if(c.mem.some(m=>m.sid===id))continue;if(!safe(D.cond))continue;
  c.mem.push({id:S.uid++,sid:id,name:D.name,k:D.k,role:D.role,apt:D.apt,lv:D.lv,exp:0,busy:null,spy:D.spy||0});clLog(D.name+'加入了行社。');toast(D.name+' 加入了'+c.name+'。');}}
function openClanFound(){const def='青石行社';let nm=def;
 modal(`<h3>立社</h3><p>给你的行社起个名字。它会刻在议事堂的匾额上。</p><input id="clName" class="clin" maxlength="6" value="${esc(def)}" autocomplete="off">`,
  [{t:'立匾',cls:'gold',fn:()=>{const v=(nm||def).trim().replace(/[<>&"]/g,'')||def;S.clan=clanHydrate({name:v,fame:5});clLog('立社。议事堂的匾额上写着「'+v+'」。');clanSync();
   toast('「'+v+'」立社了！新的「行社」页已开启','big');live();save();}}]);
 const ci=$('#clName');if(ci){ci.oninput=e=>{nm=e.target.value;};setTimeout(()=>ci.focus(),60);}}
function clRecruitCost(){return zsAt(maxZone(),5)*(1+Math.floor(S.clan.mem.length/3));}
function clRecruit(free){const c=S.clan;if(!c)return;if(c.mem.filter(m=>!m.gone).length>=clCap()){toast('议事堂住不下了，先扩建议事堂','bad');return;}
 if(!free){const cost=clRecruitCost();if(S.stones<cost)return;S.stones-=cost;}
 const r=Math.random(),apt=r<.4?1:r<.72?2:r<.9?3:r<.98?4:5;const name=CL_SUR[Math.floor(Math.random()*CL_SUR.length)]+pick(CL_GIV)+(Math.random()<.4?pick(CL_GIV):'');
 const m={id:S.uid++,name,k:villager(S.uid*7),role:'社员',apt,lv:1,exp:0,busy:null,spy:Math.random()<.06?1:0,hide:Math.random()<.06?1:0};c.mem.push(m);
 clLog(name+'投奔了行社。');toast(name+' 投奔了行社（资质 '+'★'.repeat(apt)+'）');render();save();return m;}
function clSend(id,z,t){const c=S.clan,m=c.mem.find(x=>x.id===id);if(!m||m.busy)return;const T=CL_TIER[t];m.busy={z,t,untilD:daysAll()+T.days};clLog(m.name+'出发去「'+ZONES[z].n+'」'+T.n+'。');toast(m.name+' 出发了');render();save();}
function clResolve(m,quiet){const c=S.clan,B=m.busy;m.busy=null;if(B.rest){return '';}const z=B.z,t=B.t,T=CL_TIER[t];EVZ=z;
 if(m.spy&&c.fame>=15&&!m.sid&&Math.random()<.5){const lost=Math.floor(S.stones*.15);S.stones-=lost;m.gone=1;const s=m.name+'没有回来。和他一起不见的，还有库房里 '+fmt(lost)+' 灵石。墙上留着一个天穹会的眼睛记号。';clLog(s);return s;}
 const ok=Math.random()<clP(m,z,t);let s='';
 if(ok){const g=Math.ceil(zsAt(z,4*T.m)*(1+m.apt*.1));S.stones+=g;s=m.name+'从「'+ZONES[z].n+'」回来了，带回灵石 '+fmt(g);c.fame+=T.m*2;
  m.exp+=Math.round(30*T.m*(1+c.bld.wu*.1));
  if(Math.random()<Math.min(.9,(.12+c.bld.qi*.03)*T.m))s+='，'+gGem(null,gemTierFor(z)).trim().replace(/。$/,'');
  if(Math.random()<.025*T.m*(1+c.bld.jing*.1))s+='，'+gBook().trim().replace(/。$/,'');
  if(Math.random()<.12*T.m&&S.bag.length<BAG_MAX)s+='，'+gItem(rollRar(t===2)).trim().replace(/。$/,'');
  if(m.hide){m.hide=0;m.apt=5;s+='。这一趟回来，'+m.name+'身上的灵光变了——竟是被埋没的天灵根！';}
  else if(Math.random()<.14){const sp=pick([()=>{const x=zsAt(z,6*T.m);S.stones+=x;return '。路上撞见一条小灵脉，又挖回来 '+fmt(x)+' 灵石';},
   ()=>{if(c.mem.filter(x=>!x.gone).length>=clCap())return '。路上捡到一个快饿死的孩子，可惜议事堂住不下，只好送去了青石站';const n=clRecruit(true);return n?'。还捡回来一个孩子，叫'+n.name:'';},
   ()=>{S.flags.mapClue=1;return '。还带回一张画着裂隙的兽皮图——下次去野外，留意紫色的光';},
   ()=>'。路上遇见一位不肯留名的前辈，指点了几句'+gBook().trim().replace(/。$/,''),
   ()=>{S.meds+=2;return '。顺手采了草药，丹房多了两颗疗伤药';}]);s+=sp();}
  s+='。';}
 else{m.exp+=Math.round(8*T.m);m.busy={rest:1,untilD:daysAll()+10};s=m.name+'在「'+ZONES[z].n+'」吃了亏，负伤回来，要养十天。';}
 while(m.exp>=m.lv*40&&m.lv<60){m.exp-=m.lv*40;m.lv++;}
 clLog(s);return s;}
let clAcc=0;
function clanTick(dt,off){const c=S.clan;if(!c||!S.started)return;
 if(off&&c.bld.tian)c.store=Math.min(tianRate(c.bld.tian)*12,c.store+tianRate(c.bld.tian)*dt/3600);
 if(off&&c.bld.dan){c.medT+=dt;const ev=danEvery(c.bld.dan);while(c.medT>=ev){c.medT-=ev;if(c.medS<4+c.bld.dan)c.medS++;}}
 clAcc+=dt;if(clAcc<1&&!off)return;clAcc=0;clanSync();const done=[];
 c.mem.forEach(m=>{if(m.busy&&!m.gone&&daysAll()>=(m.busy.untilD||0)){const r=clResolve(m);if(r)done.push(r);}});
 if(done.length){if(off)setTimeout(()=>toast('行社：'+done.length+' 位社员回来了，去「行社」页看看'),1500);else done.forEach(t=>toast(t,'big'));if(TAB==='clan')render();save();}
 if(!off){c.evClock+=1;if(c.evClock>1500+Math.random()*900&&OV_FREE()&&!BT){c.evClock=0;clEvent();}}}
function clEvent(){const c=S.clan;const r=Math.random();
 if(r<.3&&!S.raid&&maxZone()>=1){S.raid=3;clLog('天穹会的刺客摸到了青石站外。');toast('天穹会的刺客摸到了站台东头！回青石站击退他们','bad');if(WD.M&&WD.M.kind==='town'&&TAB==='world'){WD.M=null;render();}}
 else if(r<.55){const g=zsAt(maxZone(),3);S.stones+=g;clLog('有商人慕名来拜访，留下了 '+fmt(g)+' 灵石的见面礼。');toast(c.name+'名声在外，有商人送来见面礼：灵石 +'+fmt(g));c.fame+=2;}
 else if(r<.75){c.fame+=4;clLog('社员在议事堂前比武，热闹了一下午。');toast('社员在议事堂前比武。行社声望 +4');c.mem.forEach(m=>{if(!m.gone)m.exp+=10;});}
 else{const t=pick(['阿禾','林小满','王婶的孙子']);clLog(t+'说想学剑。议事堂里多了一把木剑。');toast(t+'在议事堂门口练剑，练得满头大汗。');}save();}
function clSprite(k){return cvMemo('clspr|'+(typeof k==='string'?k:k.id),()=>chSpr(k,0,0,6).toDataURL());}
function clanView(){const c=S.clan;if(!c)return '<p class="empty">还没有行社。主线推进到「筑基」之后，铁叔会来找你。</p>';clanSync();
 const act=c.mem.filter(m=>!m.gone);
 return `<div class="stage clstage"><canvas class="bgc" data-scene="clan"></canvas><div class="clhead"><div class="clseal">${esc(c.name[0])}</div><div><div class="cln">${esc(c.name)}</div><div class="cls">${clLevel()} · 声望 ${c.fame} · 社员 ${act.length}/${clCap()}</div></div></div></div>
  <div class="clharv"><div><b>灵田</b><span id="clStore">${c.bld.tian?fmt(c.store):'未开垦'}</span><button class="btn sm gold" data-act="clHarv" ${c.store>=1?'':'disabled'}>收取</button></div>
   <div><b>丹房</b><span>${c.bld.dan?'疗伤药 '+c.medS:'未修建'}</span><button class="btn sm gold" data-act="clMed" ${c.medS?'':'disabled'}>取药</button></div></div>
  <h2 class="sec">社员 <small>遣往各地历练，静候归来</small></h2>
  <div class="clmem">${act.map(m=>`<div class="clm"><img src="${clSprite(m.k)}" alt=""><div class="in"><div class="iname">${esc(m.name)}<span class="lv">${m.role} · Lv${m.lv}</span></div><div class="istat">资质 ${'★'.repeat(m.apt)}${'☆'.repeat(5-m.apt)}</div>
   <div class="istat" ${m.busy?`data-ct="${m.id}"`:''}>${m.busy?(m.busy.rest?'养伤中':'在「'+ZONES[m.busy.z].n+'」'+CL_TIER[m.busy.t].n)+' · '+'还要 '+Math.max(0,(m.busy.untilD||0)-daysAll())+' 天':'空闲'}</div></div>
   ${m.busy?'':`<button class="btn sm" data-act="clGo" data-arg="${m.id}">派遣</button>`}</div>`).join('')}</div>
  <div class="row" style="display:flex;gap:8px;margin-top:10px"><button class="btn sm" data-act="clRec" ${S.stones>=clRecruitCost()&&act.length<clCap()?'':'disabled'}>招募散修 · ${fmt(clRecruitCost())} 灵石</button></div>
  <p class="note">散修资质有高有低，偶尔会埋没着天才。也偶尔……混进来别有用心的人。</p>
  ${zongHTML()}<h2 class="sec">建筑</h2>
  ${Object.keys(CL_BLD).map(k=>{const B=CL_BLD[k],lv=c.bld[k],mx=clBuildMax(k),cost=clCost(k,lv);return `<div class="row2"><div class="clg">${B.g}</div><div class="in"><div class="iname">${B.n}<span class="lv">${lv} 级</span></div><div class="istat">${B.d(lv)}</div></div>
   <button class="btn sm" data-act="clUp" data-arg="${k}" ${lv<mx&&S.stones>=cost?'':'disabled'}>${lv>=10?'已满':lv>=mx?'需扩议事堂':fmt(cost)+' 灵石'}</button></div>`;}).join('')}
  <h2 class="sec">行社纪事</h2>${c.log.length?c.log.map(l=>`<p class="note">· ${esc(l.t)}</p>`).join(''):'<p class="note">还没有什么可记的。</p>'}`;}
function clanLive(){const c=S.clan;if(!c)return;const st=$('#clStore');if(st&&c.bld.tian)st.textContent=fmt(c.store);
 document.querySelectorAll('[data-ct]').forEach(el=>{const m=c.mem.find(x=>x.id===+el.dataset.ct);if(!m||!m.busy)return;el.textContent=(m.busy.rest?'养伤中':'在「'+ZONES[m.busy.z].n+'」'+CL_TIER[m.busy.t].n)+' · '+'还要 '+Math.max(0,(m.busy.untilD||0)-daysAll())+' 天';});}
function clGoPick(id){const m=S.clan.mem.find(x=>x.id===id);if(!m)return;
 modal(`<h3>派遣 ${esc(m.name)}</h3><p>选一个地方。越远越险，带回来的也越多。</p>`,clZones().slice(-5).reverse().map(z=>({t:ZONES[z].n,fn:()=>setTimeout(()=>clGoTier(id,z),30)})).concat([{t:'算了',cls:'ghost'}]));}
function clGoTier(id,z){const m=S.clan.mem.find(x=>x.id===id);if(!m)return;
 modal(`<h3>${ZONES[z].n}</h3><p>${esc(m.name)} 战力 ${clRank(m)}</p>`,CL_TIER.map((T,t)=>({t:`${T.n} · ${T.days+' 天'} · 成功率 ${Math.round(clP(m,z,t)*100)}% · 约 ${fmt(zsAt(z,4*T.m))} 灵石`,cls:t===1?'gold':'',fn:()=>clSend(id,z,t)})).concat([{t:'返回',cls:'ghost',fn:()=>setTimeout(()=>clGoPick(id),30)}]));}
const CLAN_ACT={
 clHarv:()=>{const c=S.clan;const g=Math.floor(c.store);if(g<1)return;S.stones+=g;c.store-=g;toast('灵田收成：灵石 +'+fmt(g));render();save();},
 clMed:()=>{const c=S.clan;if(!c.medS)return;S.meds+=c.medS;toast('取出疗伤药 ×'+c.medS);c.medS=0;render();save();},
 clGo:a=>clGoPick(+a),clRec:()=>clRecruit(),
 clUp:a=>{const c=S.clan,lv=c.bld[a],cost=clCost(a,lv);if(lv>=clBuildMax(a)||S.stones<cost)return;S.stones-=cost;c.bld[a]++;c.fame+=3;clLog(CL_BLD[a].n+'扩建到 '+c.bld[a]+' 级。');toast(CL_BLD[a].n+' 升到 '+c.bld[a]+' 级');render();save();}
};

/* 日子过去：灵田、丹房按天产出（一天折两个时辰），派出去的社员按天回来 */
function clanDays(n){if(!S.clan)return;clanTick(n*7200,1);}
