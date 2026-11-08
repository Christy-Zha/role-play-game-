/* ================= 小游戏：五子棋 / 押大小 / 比点数 / 三匣 / 翻牌 ================= */
let MG=null;
const MG_DESC={
 gomoku:['五子棋','先连成五子者胜。你执黑先行。'],
 sicbo:['押大小','三颗骰子，点数和 11–17 为大，4–10 为小。三颗相同是豹子，庄家通吃。押中豹子赔二十四倍。'],
 duel:['比点数','三局两胜。每局各摇三颗骰子，点数大者胜。每局你可以重摇一次。'],
 boxes:['三匣','三只匣子里只有一只装着宝物。选好之后，庄家会打开另一只空匣，问你要不要换。'],
 memory:['翻牌','翻开两张相同的牌就能消掉。错的次数用完就输了。']
};
function mgHost(){let el=$('#miniGameOverlay');if(!el){el=document.createElement('div');el.id='miniGameOverlay';el.hidden=true;document.body.appendChild(el);}return el;}
function openMini(k,o){o=o||{};const el=mgHost();const D=MG_DESC[k];MG={k,o,lv:o.lv||1,done:false};el.hidden=false;
 el.innerHTML=`<div class="mg-in"><div class="mg-top"><div><b>${esc(o.title||D[0])}</b>${o.lv?`<span class="mg-lv">${LV_NAME[o.lv]}</span>`:''}<small>${D[1]}</small></div>${o.story?'':'<button class="btn sm ghost" id="mgQuit">离开</button>'}</div>
  <div class="mg-msg" id="mgMsg"></div><div class="mg-area" id="mgArea"></div><div class="mg-ctl" id="mgCtl"></div></div>`;
 const q=$('#mgQuit');if(q)q.onclick=()=>mgEnd(k==='sicbo'?MG.net>0:false,true);
 ({gomoku:gmInit,sicbo:sbInit,duel:dlInit,boxes:bxInit,memory:mmInit})[k]();}
function mgMsg(t,cls){const m=$('#mgMsg');if(m){m.textContent=t;m.className='mg-msg '+(cls||'');}}
function mgEnd(win,quit){if(!MG||MG.done&&!quit)return;MG.done=true;const o=MG.o;const el=$('#miniGameOverlay');
 const fin=()=>{el.hidden=true;el.innerHTML='';const m=MG;MG=null;if(m.k!=='sicbo'||!quit){S.mgW[m.k+(m.lv||1)]=(S.mgW[m.k+(m.lv||1)]||0)+(win?1:0);}o.onDone&&o.onDone(!!win);save();};
 if(quit){fin();return;}const c=$('#mgCtl');if(c)c.innerHTML=`<button class="btn gold" id="mgOk">${win?'赢了！继续':'输了……继续'}</button>`;const b=$('#mgOk');if(b)b.onclick=fin;}

/* ---------- 五子棋 ---------- */
const GN_N=11;
function gmInit(){MG.b=new Array(GN_N*GN_N).fill(0);MG.turn=1;MG.last=-1;
 $('#mgArea').innerHTML=`<canvas id="gmc" class="gmc"></canvas>`;$('#mgCtl').innerHTML=`<button class="btn sm ghost" id="gmGive">认输</button>`;
 $('#gmGive').onclick=()=>{if(MG.done)return;mgMsg('你投子认输。','bad');mgEnd(false);};
 mgMsg('轮到你落子。');requestAnimationFrame(gmDraw);const cv=$('#gmc');
 cv.onpointerdown=e=>{if(MG.done||MG.turn!==1)return;const r=cv.getBoundingClientRect(),cell=r.width/GN_N;const x=Math.floor((e.clientX-r.left)/cell),y=Math.floor((e.clientY-r.top)/cell);
  if(x<0||y<0||x>=GN_N||y>=GN_N||MG.b[y*GN_N+x])return;gmPut(x,y,1);if(MG.done)return;MG.turn=2;mgMsg('对手在想……');setTimeout(()=>{if(!MG||MG.done)return;const m=gmAI(MG.lv);gmPut(m%GN_N,Math.floor(m/GN_N),2);if(!MG.done){MG.turn=1;mgMsg('轮到你落子。');}},380+Math.random()*300);};}
function gmPut(x,y,c){const i=y*GN_N+x;MG.b[i]=c;MG.last=i;gmDraw();if(gmWin(x,y,c)){mgMsg(c===1?'五子连珠，你赢了！':'对手连成五子。','',);if(c===1)$('#mgMsg').classList.add('good');else $('#mgMsg').classList.add('bad');mgEnd(c===1);return;}
 if(MG.b.every(v=>v))mgMsg('棋盘下满了，和棋。'),mgEnd(false);}
function gmWin(x,y,c){const B=MG.b;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1;for(const s of [1,-1]){let k=1;while(true){const X=x+dx*k*s,Y=y+dy*k*s;if(X<0||Y<0||X>=GN_N||Y>=GN_N||B[Y*GN_N+X]!==c)break;n++;k++;}}if(n>=5)return true;}return false;}
function gmDraw(){const cv=$('#gmc');if(!cv)return;const r=cv.getBoundingClientRect(),dpr=Math.min(3,devicePixelRatio||1),W=Math.round(r.width*dpr);cv.width=W;cv.height=W;const x=cv.getContext('2d'),c=W/GN_N;
 x.fillStyle='#c9a46a';x.fillRect(0,0,W,W);x.strokeStyle='#5a3e1e';x.lineWidth=Math.max(1,dpr*.8);
 for(let i=0;i<GN_N;i++){x.beginPath();x.moveTo(c/2,c/2+i*c);x.lineTo(W-c/2,c/2+i*c);x.stroke();x.beginPath();x.moveTo(c/2+i*c,c/2);x.lineTo(c/2+i*c,W-c/2);x.stroke();}
 [[2,2],[8,2],[5,5],[2,8],[8,8]].forEach(([a,b])=>{x.fillStyle='#5a3e1e';x.beginPath();x.arc(c/2+a*c,c/2+b*c,c*.09,0,6.28);x.fill();});
 MG.b.forEach((v,i)=>{if(!v)return;const cx=c/2+(i%GN_N)*c,cy=c/2+Math.floor(i/GN_N)*c,g=x.createRadialGradient(cx-c*.12,cy-c*.12,c*.05,cx,cy,c*.44);
  if(v===1){g.addColorStop(0,'#5a5a5a');g.addColorStop(1,'#0a0a0a');}else{g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8c2b4');}
  x.fillStyle=g;x.beginPath();x.arc(cx,cy,c*.42,0,6.28);x.fill();if(i===MG.last){x.fillStyle='#cf4a3c';x.beginPath();x.arc(cx,cy,c*.1,0,6.28);x.fill();}});}
function gmLine(B,x,y,c){let tot=0;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1,open=0;
  for(const s of [1,-1]){let k=1;while(true){const X=x+dx*k*s,Y=y+dy*k*s;if(X<0||Y<0||X>=GN_N||Y>=GN_N)break;const v=B[Y*GN_N+X];if(v===c){n++;k++;continue;}if(v===0)open++;break;}}
  tot+=n>=5?1e6:n===4?(open===2?5e4:open===1?6e3:0):n===3?(open===2?4e3:open===1?300:0):n===2?(open===2?260:open===1?40:0):(open===2?12:2);}return tot;}
function gmCands(B){const out=[];for(let i=0;i<B.length;i++){if(B[i])continue;const x=i%GN_N,y=(i/GN_N)|0;let near=false;
  for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<GN_N&&Y<GN_N&&B[Y*GN_N+X]){near=true;break;}}if(near)out.push(i);}
 if(!out.length)out.push(Math.floor(GN_N*GN_N/2));return out;}
function gmScore(B,i,lv){const x=i%GN_N,y=(i/GN_N)|0;const a=gmLine(B,x,y,2),d=gmLine(B,x,y,1);return lv===1?a+d*.55:lv===2?a+d*.95:a*1.1+d;}
function gmAI(lv){const B=MG.b,C=gmCands(B);let sc=C.map(i=>({i,s:gmScore(B,i,lv)})).sort((a,b)=>b.s-a.s);
 if(lv===1){if(Math.random()<.28)return pick(C);const top=sc.slice(0,5);return pick(top).i;}
 if(lv===2){const top=sc.filter(o=>o.s>=sc[0].s*.9);return pick(top).i;}
 if(sc[0].s>=1e6)return sc[0].i;const block=sc.find(o=>gmLine(B,o.i%GN_N,(o.i/GN_N)|0,1)>=1e6);if(block)return block.i;
 let best=sc[0].i,bv=-1e18;sc.slice(0,9).forEach(o=>{B[o.i]=2;let rep=0;gmCands(B).forEach(j=>{const v=gmLine(B,j%GN_N,(j/GN_N)|0,1)+gmLine(B,j%GN_N,(j/GN_N)|0,2)*.5;if(v>rep)rep=v;});B[o.i]=0;const v=o.s-rep*.75;if(v>bv){bv=v;best=o.i;}});return best;}

/* ---------- 骰子 ---------- */
const DIE=['','⚀','⚁','⚂','⚃','⚄','⚅'];
const d6=()=>1+Math.floor(Math.random()*6);
function diceHTML(a,id){return `<div class="dice" id="${id||''}">${a.map(v=>`<span class="die">${DIE[v]||'?'}</span>`).join('')}</div>`;}
function rollAnim(id,final,cb){const el=$('#'+id);let n=0;const t=setInterval(()=>{if(!el||!MG){clearInterval(t);return;}el.innerHTML=final.map(()=>`<span class="die rolling">${DIE[d6()]}</span>`).join('');if(++n>8){clearInterval(t);el.innerHTML=final.map(v=>`<span class="die">${DIE[v]}</span>`).join('');cb&&cb();}},70);}
function sbInit(){MG.net=0;const st=MG.o.stakes||[zs(1),zs(3),zs(8)];MG.stake=st[0];
 $('#mgArea').innerHTML=`${diceHTML(['?','?','?'],'sbD')}<div class="mg-net">本场输赢 <b id="sbNet">0</b> 灵石 · 身上 <b id="sbHave">${fmt(S.stones)}</b></div>
  <div class="chips">${st.map((v,i)=>`<button class="chip ${i?'':'on'}" data-v="${v}">${fmt(v)}</button>`).join('')}</div>`;
 $('#mgCtl').innerHTML=`<button class="btn" data-bet="big">押大</button><button class="btn" data-bet="small">押小</button><button class="btn red" data-bet="tri">押豹子 ×24</button>`;
 mgMsg('选好筹码，押大还是押小？');
 $('#mgArea').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{MG.stake=+b.dataset.v;$('#mgArea').querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));});
 $('#mgCtl').querySelectorAll('[data-bet]').forEach(b=>b.onclick=()=>{if(MG.busy)return;if(S.stones<MG.stake){mgMsg('灵石不够了。','bad');return;}MG.busy=1;S.stones-=MG.stake;const bet=b.dataset.bet,R=[d6(),d6(),d6()],sum=R[0]+R[1]+R[2],tri=R[0]===R[1]&&R[1]===R[2];
  rollAnim('sbD',R,()=>{let win=0;if(bet==='tri'&&tri)win=MG.stake*25;else if(!tri&&(bet==='big'&&sum>=11||bet==='small'&&sum<=10))win=MG.stake*2;S.stones+=win;MG.net+=win-MG.stake;
   mgMsg(`${sum} 点${tri?'，豹子！':sum>=11?'，大':'，小'}。${win?'赢了 '+fmt(win-MG.stake)+' 灵石！':'输了 '+fmt(MG.stake)+' 灵石。'}`,win?'good':'bad');$('#sbNet').textContent=(MG.net>0?'+':'')+fmt(MG.net);$('#sbHave').textContent=fmt(S.stones);MG.busy=0;live();});});}
function dlInit(){MG.round=0;MG.w=[0,0];$('#mgCtl').innerHTML='';dlRound();}
function dlRound(){if(MG.w[0]>=2||MG.w[1]>=2){const win=MG.w[0]>=2;mgMsg(win?'三局两胜，你赢了！':'三局两胜，对手赢了。',win?'good':'bad');mgEnd(win);return;}
 MG.round++;MG.re=1;$('#mgArea').innerHTML=`<div class="mg-score">第 ${MG.round} 局 · 你 ${MG.w[0]} : ${MG.w[1]} 对手</div><div class="dl-row"><span>对手</span>${diceHTML(['?','?','?'],'dlE')}</div><div class="dl-row"><span>你</span>${diceHTML(['?','?','?'],'dlP')}</div><div class="mg-sum" id="dlSum"></div>`;
 $('#mgCtl').innerHTML=`<button class="btn gold" id="dlRoll">摇骰</button>`;mgMsg('摇吧。');$('#dlRoll').onclick=()=>{$('#mgCtl').innerHTML='';MG.p=[d6(),d6(),d6()];rollAnim('dlP',MG.p,dlAfter);};}
function dlAfter(){const s=MG.p.reduce((a,b)=>a+b,0);$('#dlSum').textContent='你摇出 '+s+' 点';
 $('#mgCtl').innerHTML=`<button class="btn gold" id="dlKeep">就它了</button>${MG.re?'<button class="btn" id="dlRe">重摇一次</button>':''}`;mgMsg(s>=13?'手气不错。':s<=7?'不太妙……':'不上不下。');
 $('#dlKeep').onclick=dlOpp;const re=$('#dlRe');if(re)re.onclick=()=>{MG.re=0;$('#mgCtl').innerHTML='';MG.p=[d6(),d6(),d6()];rollAnim('dlP',MG.p,dlAfter);};}
function dlOpp(){$('#mgCtl').innerHTML='';const ps=MG.p.reduce((a,b)=>a+b,0);let e=[d6(),d6(),d6()];const es=()=>e.reduce((a,b)=>a+b,0);
 rollAnim('dlE',e,()=>{const fin=()=>{const a=ps,b=es();if(a===b){mgMsg('平局，这局重来。');MG.round--;}else if(a>b){MG.w[0]++;mgMsg(`${a} 对 ${b}，这局你赢。`,'good');}else{MG.w[1]++;mgMsg(`${a} 对 ${b}，这局对手赢。`,'bad');}
   $('#mgCtl').innerHTML=`<button class="btn gold" id="dlNext">下一局</button>`;$('#dlNext').onclick=dlRound;};
  if(es()<ps&&(MG.lv>=2&&Math.random()<(MG.lv===3?.9:.5))){mgMsg('对手不服，重摇了一次……');setTimeout(()=>{e=[d6(),d6(),d6()];if(MG.lv===3&&es()<ps&&Math.random()<.25)e=e.map(v=>Math.max(v,d6()));rollAnim('dlE',e,fin);},500);}else fin();});}

/* ---------- 三匣 ---------- */
function bxInit(){MG.prize=Math.floor(Math.random()*3);MG.pickI=-1;MG.stage=0;bxDraw();mgMsg('选一只匣子。');}
function bxDraw(){$('#mgArea').innerHTML=`<div class="boxes">${[0,1,2].map(i=>{const open=MG.opened===i||MG.stage===2,has=i===MG.prize;return `<button class="box3 ${MG.pickI===i?'sel':''} ${open?'open':''} ${open&&has?'win':''}" data-i="${i}" ${open||MG.stage===2?'disabled':''}><span class="lid"></span><span class="bd">${open?(has?'宝':'空'):['甲','乙','丙'][i]}</span></button>`;}).join('')}</div>`;
 $('#mgArea').querySelectorAll('.box3').forEach(b=>b.onclick=()=>bxPick(+b.dataset.i));}
function bxPick(i){if(MG.stage===0){MG.pickI=i;MG.stage=1;const others=[0,1,2].filter(x=>x!==i&&x!==MG.prize);MG.opened=pick(others);bxDraw();
  mgMsg('庄家笑着打开了另一只——空的。“要不要换？”');$('#mgCtl').innerHTML=`<button class="btn" id="bxStay">不换</button><button class="btn gold" id="bxSw">换一只</button>`;
  $('#bxStay').onclick=()=>bxReveal(MG.pickI);$('#bxSw').onclick=()=>bxReveal([0,1,2].find(x=>x!==MG.pickI&&x!==MG.opened));}}
function bxReveal(i){MG.pickI=i;MG.stage=2;bxDraw();$('#mgCtl').innerHTML='';const win=i===MG.prize;mgMsg(win?'匣子里宝光一闪——是你的了！':'空的。宝物在另一只里。',win?'good':'bad');mgEnd(win);}

/* ---------- 翻牌 ---------- */
const MM_G=['金','木','水','火','土','风','雷','剑','丹','符','龙','鹤'];
function mmInit(){const L=[[3,4,8,2200],[4,4,9,1100],[4,5,11,0]][MG.lv-1];MG.cols=L[0];MG.miss=L[2];const n=L[0]*L[1]/2;
 const g=MM_G.slice().sort(()=>Math.random()-.5).slice(0,n);MG.cards=g.concat(g).sort(()=>Math.random()-.5).map(v=>({v,up:L[3]>0,ok:false}));MG.sel=[];MG.lock=true;
 mmDraw();mgMsg(L[3]?'记住它们……':'凭感觉翻吧。');setTimeout(()=>{if(!MG)return;MG.cards.forEach(c=>c.up=false);MG.lock=false;mmDraw();mgMsg('还能错 '+MG.miss+' 次。');},L[3]||10);}
function mmDraw(){$('#mgArea').innerHTML=`<div class="mmg" style="grid-template-columns:repeat(${MG.cols},1fr)">${MG.cards.map((c,i)=>`<button class="mmc ${c.up||c.ok?'up':''} ${c.ok?'ok':''}" data-i="${i}">${c.up||c.ok?c.v:''}</button>`).join('')}</div>`;
 $('#mgArea').querySelectorAll('.mmc').forEach(b=>b.onclick=()=>mmFlip(+b.dataset.i));}
function mmFlip(i){const c=MG.cards[i];if(MG.lock||MG.done||c.up||c.ok)return;c.up=true;MG.sel.push(i);mmDraw();
 if(MG.sel.length<2)return;const [a,b]=MG.sel.map(j=>MG.cards[j]);MG.lock=true;
 setTimeout(()=>{if(!MG)return;if(a.v===b.v){a.ok=b.ok=true;}else{a.up=b.up=false;MG.miss--;}MG.sel=[];MG.lock=false;mmDraw();
  if(MG.cards.every(c=>c.ok)){mgMsg('全部配对，过目不忘！','good');mgEnd(true);}else if(MG.miss<0){mgMsg('错太多次了。','bad');MG.cards.forEach(c=>c.up=true);mmDraw();mgEnd(false);}else mgMsg('还能错 '+MG.miss+' 次。');},a.v===b.v?260:650);}

/* ---------- 奖励与入口 ---------- */
function miniReward(k,lv){const z=maxZone();EVZ=z;let t='';const m=[0,1,3,8][lv||1]*((S.sworn||[]).includes('shen')?1.5:1);
 if(k==='gomoku'){t=gS(zsAt(z,2*m))+gQi(.05*m);if(lv>=2&&chance(.4))t+=gGem(null,Math.min(5,gemTierFor(z)+(lv===3?1:0)));if(lv===3&&chance(.3))t+=gBook();}
 else if(k==='memory'){t=gQi(.08*m)+(lv>=2?gS(zsAt(z,m)):'');if(lv===3&&chance(.35))t+=gBook();}
 else if(k==='boxes'){t=gS(zsAt(z,4));if(chance(.5))t+=gGem(null,gemTierFor(z));else t+=gItem(rollRar(true));}
 return t.trim();}
function playFor(k,lv,title){openMini(k,{lv,title,onDone:w=>{if(w){const t=miniReward(k,lv);toast(t||'赢了！','big');}else toast('这局输了。');live();}});}
function qGame(id){const q=qOf(id);if(!q||qSt(id)!=='on')return;openMini(q.obj.g,{lv:q.obj.lv,title:q.title,onDone:w=>{if(w)qReady(id);else toast('没赢。随时可以再来。');}});}
