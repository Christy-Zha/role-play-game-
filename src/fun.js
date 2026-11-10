/* ================= 好玩度改造：秘境闯关、流派共鸣、要点阅读、异宝提示 =================
   放在 game.js 之前加载。这里只定义函数、替换函数，不在加载时读写存档。 */

/* ---------- 一、要点阅读：只读开头、选择前后和结尾，其余收进「回顾」 ---------- */
function vnKeySkip(L){
 if(!SC)return false;
 if((SC.shown||0)<2)return false;            // 每章开头两句
 if((SC.after??99)<2)return false;           // 做完选择后的两句回应
 const t=typeof L[1]==='string'?L[1]:'';
 if(t[0]==='【')return false;                // 操作提示要留着
 let n=0;
 for(let i=1;i<SC.q.length;i++){const x=SC.q[i];
  if(Array.isArray(x)){n++;if(n>=2)return true;}
  else if(x&&(x.c||x.game))return false;     // 选择、小游戏之前的两句
 }
 return false;                               // 结尾两句
}
/* 短的支线剧情（不超过 6 句）可以直接播；长的只提示，由玩家自己点开 */
const shortCh=ch=>!!ch&&(ch.lines||[]).filter(Array.isArray).length<=6;

/* ---------- 二、馈赠：五个流派，同一流派凑齐三个触发「共鸣」 ---------- */
const pct=v=>Math.round(v*100)+'%';
const BTAG={feng:{n:'锋',c:'#ff8a6a'},shou:{n:'守',c:'#d6b06a'},ling:{n:'灵',c:'#7ad08a'},qiao:{n:'巧',c:'#8fc8ff'},yun:{n:'运',c:'#f2d478'}};
const BRAR=[{n:'凡',c:'#c8c8c8'},{n:'稀',c:'#6ab8ff'},{n:'珍',c:'#e3a0ff'}];
const BOON2=[
 {id:'atk',tag:'feng',n:'锋锐',v:[.12,.2,.32],d:'攻击 +'},
 {id:'cd',tag:'feng',n:'裂空',v:[.25,.4,.6],d:'暴击伤害 +'},
 {id:'pen',tag:'feng',n:'破甲',v:[.1,.16,.24],d:'无视敌人防御 '},
 {id:'def',tag:'shou',n:'厚土',v:[.15,.25,.4],d:'防御 +'},
 {id:'hp',tag:'shou',n:'蕴灵',v:[.15,.25,.4],d:'生命上限 +'},
 {id:'dr',tag:'shou',n:'金身',v:[.06,.1,.15],d:'受到的伤害 -'},
 {id:'ls',tag:'ling',n:'噬灵',v:[.06,.1,.15],d:'吸血 '},
 {id:'after',tag:'ling',n:'养元',v:[.1,.16,.25],d:'每打完一场，回复生命 '},
 {id:'heal',tag:'ling',n:'回春',v:[.5,.75,1],d:'立刻回复生命和灵力 ',now:1},
 {id:'crit',tag:'qiao',n:'疾风',v:[.06,.1,.15],d:'暴击率 +'},
 {id:'dodge',tag:'qiao',n:'流影',v:[.06,.1,.15],d:'闪避 +'},
 {id:'stone',tag:'yun',n:'财运',v:[.3,.5,.8],d:'这一趟灵石 +'},
 {id:'qi',tag:'yun',n:'悟道',v:[.25,.4,.6],d:'这一趟战斗灵气 +'},
 {id:'luck',tag:'yun',n:'鸿运',v:[.15,.25,.4],d:'掉宝率 +'}
];
const RESO={
 feng:{n:'剑心',d:'攻击 +20%，暴击率 +10%',f:()=>{RUN.atk+=.2;RUN.crit+=.1;}},
 shou:{n:'不动',d:'受到的伤害 -15%，生命 +25%',f:()=>{RUN.dr+=.15;RUN.hp+=.25;}},
 ling:{n:'生生',d:'吸血 +10%，每场后再回 20% 生命',f:()=>{RUN.ls+=.1;RUN.after+=.2;}},
 qiao:{n:'鬼步',d:'闪避 +15%，暴击伤害 +50%',f:()=>{RUN.dodge+=.15;RUN.cd+=.5;}},
 yun:{n:'天眷',d:'灵石、灵气 +50%，掉宝率 +30%',f:()=>{RUN.stone+=.5;RUN.qi+=.5;RUN.luck+=.3;}}
};
function boonRoll(tier){const r=Math.random();return r<.05+.15*tier?2:r<.3+.25*tier?1:0;}
function boonTagLine(){
 return Object.keys(BTAG).map(t=>{const n=RUN.tags[t]||0,on=RUN.reso.includes(t);
  return '<span style="color:'+BTAG[t].c+';opacity:'+(n||on?1:.45)+'">'+BTAG[t].n+(on?' ✦'+RESO[t].n:' '+Math.min(n,3)+'/3')+'</span>';}).join('　');
}
function ovBox(){const el=document.createElement('div');el.className='boon-ov';
 el.style.cssText='position:fixed;inset:0;z-index:999;background:rgba(5,4,10,.9);display:flex;flex-direction:column;justify-content:center;gap:10px;padding:22px;';return el;}
boonPick=function(after,title,tier){
 tier=tier||0;
 const pool=BOON2.slice().sort(()=>Math.random()-.5).slice(0,3).map(b=>({b,r:boonRoll(tier)}));
 const el=ovBox();
 el.innerHTML='<div style="text-align:center;color:#e3b862;font-size:21px;letter-spacing:4px">'+(title||'馈赠')+'</div>'
  +'<div style="text-align:center;color:#9fb3ad;font-size:12px;margin-bottom:4px">选一份，只在这一趟有效。同一流派凑齐三个，触发「共鸣」</div>'
  +pool.map((o,i)=>{const T=BTAG[o.b.tag],R=BRAR[o.r],v=o.b.v[o.r];const near=(RUN.tags[o.b.tag]||0)===2&&!RUN.reso.includes(o.b.tag);
   return '<button class="btn" data-i="'+i+'" style="padding:12px 10px;text-align:left;border:1px solid '+R.c+';background:rgba(30,26,40,.92)">'
    +'<span style="display:inline-block;min-width:22px;text-align:center;border-radius:4px;background:'+T.c+';color:#111;font-size:12px;margin-right:6px">'+T.n+'</span>'
    +'<b style="font-size:16px;color:'+R.c+'">'+o.b.n+'</b> <small style="color:'+R.c+'">'+R.n+'</small>'
    +'<br><span style="font-size:13px;color:#ddd">'+o.b.d+pct(v)+'</span>'
    +(near?'<br><span style="font-size:12px;color:'+T.c+'">再拿这一个，触发共鸣「'+RESO[o.b.tag].n+'」：'+RESO[o.b.tag].d+'</span>':'')
    +'</button>';}).join('')
  +'<div style="text-align:center;font-size:12px;margin-top:6px">'+boonTagLine()+'</div>';
 document.body.appendChild(el);
 el.querySelectorAll('button').forEach(bt=>{bt.onclick=()=>{const o=pool[+bt.dataset.i],b=o.b,v=b.v[o.r];
  if(b.now){S.hpF=Math.min(1,(S.hpF??1)+v);S.mpF=Math.min(1,(S.mpF??1)+v);}else RUN[b.id]=(RUN[b.id]||0)+v;
  RUN.n++;RUN.names.push(b.n);RUN.tags[b.tag]=(RUN.tags[b.tag]||0)+1;el.remove();
  if(RUN.tags[b.tag]>=3&&!RUN.reso.includes(b.tag)){RUN.reso.push(b.tag);RESO[b.tag].f();sfx('bell');toast('共鸣 · '+RESO[b.tag].n+'！'+RESO[b.tag].d,'big');}
  else toast('获得「'+b.n+'」· '+b.d+pct(v));
  if(after)after();};});
};
/* 本趟加成接进人物属性（攻击、防御、生命、暴击率在 game.js 的 stats 里已经算了） */
const _funStats=stats;
stats=function(){const r=_funStats.apply(this,arguments);
 r.cd=(r.cd||0)+RUN.cd;r.pen=Math.min(.6,(r.pen||0)+RUN.pen);r.dr=Math.min(.6,(r.dr||0)+RUN.dr);
 r.ls=(r.ls||0)+RUN.ls;r.dodge=Math.min(.45,(r.dodge||0)+RUN.dodge);r.luck=(r.luck||0)+RUN.luck;return r;};

/* ---------- 三、秘境闯关：五层。每层先选路，再选馈赠；最深处是守宝妖王 ---------- */
const RIFT_N=5;
const ROUTES={
 normal:{n:'常路',d:'普通的一层。清完给一份馈赠'},
 elite:{n:'险路',d:'妖物更强、全是精英。清完的馈赠更稀有'},
 vault:{n:'宝窟',d:'三口宝箱，两只精英守着'},
 spring:{n:'灵泉',d:'没有妖物，气血灵力全满。这一层没有馈赠'}
};
function routePick(f,cb){
 const ks=Object.keys(ROUTES).sort(()=>Math.random()-.5).slice(0,2);
 const el=ovBox();
 el.innerHTML='<div style="text-align:center;color:#e3b862;font-size:21px;letter-spacing:4px">第 '+f+' 层 · 两条岔路</div>'
  +ks.map(k=>'<button class="btn gold" data-k="'+k+'" style="padding:14px 10px"><b style="font-size:17px">'+ROUTES[k].n+'</b><br><small>'+ROUTES[k].d+'</small></button>').join('')
  +'<div style="text-align:center;font-size:12px;color:#9fb3ad">气血 '+Math.round((S.hpF??1)*100)+'% · '+boonTagLine()+'</div>';
 document.body.appendChild(el);
 el.querySelectorAll('button').forEach(bt=>{bt.onclick=()=>{el.remove();cb(bt.dataset.k);};});
}
function riftMap(z,f,type){
 const boss=f>=RIFT_N;type=boss?'boss':(type||'normal');
 const D=ZDEF[z],W=11,H=11,M=newMap('rift',z,W,H,D.g[0]);
 Object.assign(M,{name:'秘境 · '+ZONES[z].n+' · 第 '+f+' 层 · '+(boss?'最深处':ROUTES[type].n),dark:Math.min(.75,D.dark+.15+f*.03),bg:'#06040c',amb:'mote2',riftF:f,rtype:type});
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(Math.hypot(c-5,r-5)>5.4)M.g[gi(M,c,r)]='void';else if((c+r)%5===0&&D.g[1])M.g[gi(M,c,r)]=D.g[1];}
 const chests=boss?[[3,2],[7,2],[2,7],[8,7]]:type==='vault'?[[3,2],[7,2],[2,7]]:type==='spring'?[]:[[2,7]];
 chests.forEach(([c,r])=>addProp(M,c,r,'chest',{rich:1,act:p=>openChest(p)}));
 [[1,5],[9,5]].forEach(([c,r])=>addProp(M,c,r,'crystal',{v:c%4}));
 addProp(M,5,9,'portal',{blocks:false,lab:'回去',act:()=>leaveRift()});
 const mobs=ZONES[Math.min(z,10)].mobs.length?ZONES[z].mobs:['天魔影'];
 if(boss){M.ents.push(mkEnt({kind:'foe',boss:true,riftBoss:1,look:pick(mobs),c:5,r:3,dir:1,name:'守宝妖王',tint:1}));}
 else{
  addProp(M,5,1,'portal',{blocks:false,lab:'深入',act:()=>riftDeeper()});
  const spots=[[4,4],[6,5],[3,6],[7,3],[5,6],[2,4]].sort(()=>Math.random()-.5);
  const n=type==='spring'?0:type==='vault'?2:Math.min(spots.length,2+Math.floor(f/2));
  for(let i=0;i<n;i++){const [c,r]=spots[i];
   M.ents.push(mkEnt({kind:'foe',look:pick(mobs),c,r,home:[c,r],elite:type!=='normal'||(i===0&&f>=2)||(f>=3&&Math.random()<.35),spd:1.2}));}
 }
 propLights(M);M.lights.push({c:5,r:9,rad:40,h:4,col:'rgba(200,120,255,.35)'},{c:5,r:5,rad:60,h:10,col:type==='spring'?'rgba(120,230,200,.4)':'rgba(200,120,255,.25)'});
 if(!boss)M.lights.push({c:5,r:1,rad:40,h:4,col:'rgba(227,184,98,.4)'});
 return M;
}
function riftGo(z,f,type){
 wFade(()=>{wLoad(riftMap(z,f,type),[5,8]);
  if(f>=RIFT_N){S.hpF=1;S.mpF=1;toast('最深处。灵泉涌出，气血灵力全满——守宝的妖王醒了。','big');}
  else if(type==='spring'){S.hpF=1;S.mpF=1;toast('灵泉。气血灵力全满。');}
  else toast('第 '+f+' 层 · '+ROUTES[type].n);});
}
enterRift=function(){
 const M0=WD.M,P=WD.P;WD.prev={M:M0,pos:[Math.round(P.x),Math.round(P.y)]};const z=M0.z;
 riftGo(z,1,'normal');
 setTimeout(()=>toast('秘境 '+RIFT_N+' 层：清完一层走「深入」，选路、选馈赠，凑流派共鸣。最深处的妖王守着宝。','big'),900);
};
function riftDeeper(){
 const M=WD.M;if(!M||!M.riftF)return;
 if(M.ents.some(e=>e.kind==='foe'&&!e.dead)){toast('还有妖物守着这一层，先清干净。','bad');return;}
 const z=M.z,f=M.riftF,type=M.rtype;
 S.hpF=Math.min(1,(S.hpF??1)+.25);S.mpF=Math.min(1,(S.mpF??1)+.25);
 const next=()=>{if(f+1>=RIFT_N)riftGo(z,f+1,'boss');else routePick(f+1,k=>riftGo(z,f+1,k));};
 if(type==='spring')next();
 else boonPick(next,'第 '+f+' 层已清 · 气血回复两成半',type==='elite'?1:type==='vault'?.4:0);
}
function riftClear(){
 const M=WD.M;if(!M)return;const z=M.z;EVZ=Math.min(z,10);
 const first=!S.flags['riftZ'+z];S.flags['riftZ'+z]=1;
 const sl=SLOT5.slice().sort(()=>Math.random()-.5);/* 每件奖励换一个部位，不会开出两件同名装备 */
 const L=[gItem(Math.random()<.35+.1*RUN.reso.length?3:2,sl[0]),gItem(2,sl[1]),gGem(null,gemTierFor(z)+1)];
 if(first)L.push(gItem(3,sl[2]));
 const st=Math.ceil(zsAt(z,20)*(1+RUN.stone));S.stones+=st;
 S.flags.riftClear=(S.flags.riftClear||0)+1;save();
 sfx('bell');toast((first?'首次破境！':'秘境已破！')+'灵石 +'+fmt(st)+' ·'+L.map(x=>String(x||'').replace(/<[^>]+>/g,'').trim()).filter(Boolean).join(' ·'),'big');
}
const _funEncounter=wEncounter;
wEncounter=function(e){
 const M=WD.M;
 if(M&&M.riftF&&e.boss){const P=WD.P;P.path=[];P.act=null;
  startBattle([mkEnemy(M.z,true)],{z:M.z,noFlee:true,onWin:()=>{e.dead=true;riftClear();}});return;}
 return _funEncounter.apply(this,arguments);
};
/* 越深越强：秘境里的小怪按层数加强（险路再强一成半），灵石也多给；妖王和本区首领一样强 */
const _funStartBattle=startBattle;
startBattle=function(foes,opt){
 const M=WD.M;
 if(M&&M.riftF&&!(opt&&opt.story)&&Array.isArray(foes)){const k=(.8+.1*(M.riftF-1))*(M.rtype==='elite'?1.15:1);
  foes.forEach(f=>{if(!f)return;if(f.boss){if(f.stones)f.stones=Math.ceil(f.stones*1.5);return;}
   f.hp*=k;if(f.max)f.max*=k;f.atk*=k;if(f.stones)f.stones=Math.ceil(f.stones*(1+.25*M.riftF));});}
 return _funStartBattle.apply(this,arguments);
};

/* ---------- 四、战后：养元回血；打出仙品、传说时给足动静 ---------- */
const _funBtResult=btResult;
btResult=function(title,lines){
 if(title==='战斗胜利'&&RUN.after>0)S.hpF=Math.min(1,(S.hpF??1)+RUN.after);
 const r=_funBtResult.apply(this,arguments);
 const j=(lines||[]).join('');
 if(/r-chuan/.test(j)){sfx('bell');toast('传说现世！','big');}
 else if(/r-xian/.test(j)){sfx('bell');toast('仙品到手！','big');}
 return r;
};
