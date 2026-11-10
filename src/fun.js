/* ================= 好玩度改造：秘境闯关、要点阅读、异宝提示 =================
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

/* ---------- 二、秘境闯关：五层，每层清完三选一馈赠，最深处有守宝妖王 ---------- */
const RIFT_N=5;
function riftMap(z,f){
 const D=ZDEF[z],W=11,H=11,M=newMap('rift',z,W,H,D.g[0]);const boss=f>=RIFT_N;
 Object.assign(M,{name:'秘境 · '+ZONES[z].n+' · 第 '+f+' 层'+(boss?'（最深处）':''),dark:Math.min(.75,D.dark+.15+f*.03),bg:'#06040c',amb:'mote2',riftF:f});
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(Math.hypot(c-5,r-5)>5.4)M.g[gi(M,c,r)]='void';else if((c+r)%5===0&&D.g[1])M.g[gi(M,c,r)]=D.g[1];}
 const chests=boss?[[3,2],[7,2],[2,7],[8,7]]:f%2?[[2,7]]:[[3,2],[8,7]];
 chests.forEach(([c,r])=>addProp(M,c,r,'chest',{rich:1,act:p=>openChest(p)}));
 [[1,5],[9,5]].forEach(([c,r])=>addProp(M,c,r,'crystal',{v:c%4}));
 addProp(M,5,9,'portal',{blocks:false,lab:'回去',act:()=>leaveRift()});
 const mobs=ZONES[Math.min(z,10)].mobs.length?ZONES[z].mobs:['天魔影'];
 if(boss){M.ents.push(mkEnt({kind:'foe',boss:true,riftBoss:1,look:pick(mobs),c:5,r:3,dir:1,name:'守宝妖王',tint:1}));}
 else{
  addProp(M,5,1,'portal',{blocks:false,lab:'深入',act:()=>riftDeeper()});
  const spots=[[4,4],[6,5],[3,6],[7,3],[5,6],[2,4]].sort(()=>Math.random()-.5);
  const n=Math.min(spots.length,2+Math.floor(f/2));
  for(let i=0;i<n;i++){const [c,r]=spots[i];M.ents.push(mkEnt({kind:'foe',look:pick(mobs),c,r,home:[c,r],elite:(i===0&&f>=2)||(f>=3&&Math.random()<.35),spd:1.2}));}
 }
 propLights(M);M.lights.push({c:5,r:9,rad:40,h:4,col:'rgba(200,120,255,.35)'},{c:5,r:5,rad:60,h:10,col:'rgba(200,120,255,.25)'});
 if(!boss)M.lights.push({c:5,r:1,rad:40,h:4,col:'rgba(227,184,98,.4)'});
 return M;
}
enterRift=function(){
 const M0=WD.M,P=WD.P;WD.prev={M:M0,pos:[Math.round(P.x),Math.round(P.y)]};const z=M0.z;
 wFade(()=>{wLoad(riftMap(z,1),[5,8]);toast('秘境共 '+RIFT_N+' 层：清光一层的妖物，走进「深入」，越深宝物越好。随时可以从「回去」离开。','big');});
};
function riftDeeper(){
 const M=WD.M;if(!M||!M.riftF)return;
 if(M.ents.some(e=>e.kind==='foe'&&!e.dead)){toast('还有妖物守着这一层，先清干净。','bad');return;}
 const z=M.z,f=M.riftF;
 const deep=f+1>=RIFT_N;S.hpF=deep?1:Math.min(1,(S.hpF??1)+.5);S.mpF=deep?1:Math.min(1,(S.mpF??1)+.5);
 boonPick(()=>{wFade(()=>{wLoad(riftMap(z,f+1),[5,8]);toast(f+1>=RIFT_N?'最深处。守宝的妖王醒了。':'第 '+(f+1)+' 层。妖气更重了。');});},'秘境 · 第 '+f+' 层已清 · '+(deep?'灵泉涌出，气血灵力全满':'气血灵力回复一半'));
}
function riftClear(){
 const M=WD.M;if(!M)return;const z=M.z;EVZ=Math.min(z,10);
 const L=[gItem(Math.random()<.35?3:2),gItem(2),gGem(null,gemTierFor(z)+1)];
 const st=zsAt(z,20);S.stones+=st;
 S.flags.riftClear=(S.flags.riftClear||0)+1;save();
 sfx('bell');toast('秘境已破！灵石 +'+fmt(st)+' ·'+L.map(x=>String(x||'').replace(/<[^>]+>/g,'').trim()).filter(Boolean).join(' ·'),'big');
}
const _funEncounter=wEncounter;
wEncounter=function(e){
 const M=WD.M;
 if(M&&M.riftF&&e.boss){const P=WD.P;P.path=[];P.act=null;
  startBattle([mkEnemy(M.z,true)],{z:M.z,noFlee:true,onWin:()=>{e.dead=true;riftClear();}});return;}
 return _funEncounter.apply(this,arguments);
};
/* 越深越强：秘境里的敌人按层数加强，灵石也多给 */
const _funStartBattle=startBattle;
startBattle=function(foes,opt){
 const M=WD.M;
 if(M&&M.riftF&&!(opt&&opt.story)&&Array.isArray(foes)){const k=.8+.1*(M.riftF-1);
  foes.forEach(f=>{if(!f)return;if(f.boss){if(f.stones)f.stones=Math.ceil(f.stones*1.5);return;}f.hp*=k;if(f.max)f.max*=k;f.atk*=k;if(f.stones)f.stones=Math.ceil(f.stones*(1+.25*M.riftF));});}
 return _funStartBattle.apply(this,arguments);
};

/* ---------- 三、异宝提示：打出仙品、传说时给足动静 ---------- */
const _funBtResult=btResult;
btResult=function(title,lines){
 const r=_funBtResult.apply(this,arguments);
 const j=(lines||[]).join('');
 if(/r-chuan/.test(j)){sfx('bell');toast('传说现世！','big');}
 else if(/r-xian/.test(j)){sfx('bell');toast('仙品到手！','big');}
 return r;
};
