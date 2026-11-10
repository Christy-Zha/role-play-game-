/* ================= 江湖：等距地图引擎 ================= */
const ZDEF=[
 {g:['gravel','rail','gravel','puddle'],hz:null,edge:'wallT',front:'rubble',props:['pillar','rubble','train','crate','barrel','rubble'],dens:.2,dark:.6,bg:'#050706',amb:'drip'},
 {g:['asphalt','asphalt','asphaltL'],hz:'void',edge:'void',front:'void',props:['car','car','barrier','ruin','rubble','sign','lamp'],dens:.2,dark:.12,bg:'#3a1e16',amb:'ash'},
 {g:['grass','grass','moss','dirt'],hz:'water',edge:'tree',front:'bush',props:['tree','tree','tree','bush','rock','stele'],dens:.3,dark:.4,bg:'#0a140e',amb:'fly'},
 {g:['plank','concrete','plank'],hz:'water',edge:'water',front:'water',props:['container','container','crate','bollard','barrel','boat'],dens:.18,dark:.18,bg:'#1e3a48',amb:'mist'},
 {g:['metal','metal','hazard'],hz:'void',edge:'wallM',front:'barrier',props:['rack','tank','crate','barrier','pillarM'],dens:.22,dark:.5,bg:'#08060e',amb:'spark'},
 {g:['basalt','basalt','crackL'],hz:'lava',edge:'lava',front:'lava',props:['rock','crystal','ruin','rubble'],dens:.2,dark:.38,bg:'#2a0a04',amb:'ember'},
 {g:['gold','gold','goldL'],hz:'void',edge:'void',front:'void',props:['floatrock','crystal','rock'],dens:.15,dark:.04,bg:'#4a3a14',amb:'mote'},
 {g:['pstone'],hz:'void',edge:'void',front:'void',props:['crystal','floatrock'],dens:.1,dark:.5,bg:'#05040a',amb:'mote2'},
 {g:['star','star','pstone'],hz:'void',edge:'void',front:'void',props:['floatrock','crystal','floatrock','rock'],dens:.14,dark:.45,bg:'#03040c',amb:'mote'},
 {g:['jadeT','jadeT','gold'],hz:'void',edge:'void',front:'void',props:['pillar','stele','pillar','crystal','rock'],dens:.16,dark:.05,bg:'#e8dcb8',amb:'mote'},
 {g:['ashv','ashv','pstone'],hz:'void',edge:'void',front:'void',props:['crystal','floatrock','stele','rock'],dens:.14,dark:.55,bg:'#04020a',amb:'mote2'}
];
const WD={cv:null,cx:null,lc:null,lx:null,W:0,H:0,k:3,dpr:1,ox:0,oy:0,cam:{x:0,y:0},M:null,P:null,F:[],t:0,labs:new Map(),parts:[],tap:null,fid:0,lay:null};
const DIRV=[[1,0],[0,1],[0,-1],[-1,0]];
const dirOf=(dc,dr)=>dc>0?0:dr>0?1:dr<0?2:3;
function hexA(h,a){const [r,g,b]=pHx(h);return `rgba(${r},${g},${b},${a})`;}
function newMap(kind,z,W,H,g0){const M={kind,z,W,H,g:new Array(W*H).fill(g0),gv:new Array(W*H),blk:new Uint8Array(W*H),props:[],ents:[],lights:[],trap:new Set(),name:'',dark:.4,bg:'#000',amb:'dust'};
 for(let i=0;i<W*H;i++)M.gv[i]=((i*2654435761)>>>0)%4;return M;}
const gi=(M,c,r)=>r*M.W+c;
const inMap=(M,c,r)=>c>=0&&r>=0&&c<M.W&&r<M.H;
const gT=(M,c,r)=>inMap(M,c,r)?M.g[gi(M,c,r)]:'void';
function passable(M,c,r){if(!inMap(M,c,r)||M.blk[gi(M,c,r)])return false;const T=TL[M.g[gi(M,c,r)]];return !(T&&T.nw);}
function addProp(M,c,r,type,o){o=o||{};const D=PR[type]||{};const p=Object.assign({c,r,type,v:(c*7+r*13)%4,blocks:D.blocks!==false},o);M.props.push(p);
 if(p.blocks){M.blk[gi(M,c,r)]=1;(p.extra||[]).forEach(([a,b])=>{if(inMap(M,a,b))M.blk[gi(M,a,b)]=1;});}return p;}
const propAt=(M,c,r)=>M.props.find(p=>p.c===c&&p.r===r);
function removeProp(M,p){M.props=M.props.filter(x=>x!==p);if(p.blocks)M.blk[gi(M,p.c,p.r)]=0;}
function mkEnt(o){return Object.assign({x:o.c,y:o.r,dir:0,ft:0,path:[],spd:4,moving:false,wt:Math.random()*3},o);}
function propLights(M){M.props.forEach(p=>{const L=(PR[p.type]||{}).light;if(L)M.lights.push({c:p.c,r:p.r,rad:L.rad,h:L.h,col:L.col||hexA(ZPAL[Math.max(0,M.z)].cry,.3)});});}

/* ---------- 青石站 ---------- */
const TOWN_POS={tie:[12,3],he:[4,5],hong:[20,5],zero:[18,4],zhou:[16,5],shen:[10,5],qian:[6,3],man:[3,4],su:[14,3],cm:[17,5],ning:[8,3]};
const isNight=()=>{const h=new Date().getHours();return h>=20||h<6;};
const STALL_LINES=['仙师，多吃点，你瘦了。','今天的粥稠，米是红鹞商队换来的。','排队排队，小孩先来。','锅底还有点，给你留着。'];
const VILL_LINES=['灵潮之前，我在这条线上开了十年地铁。','听说北边高架上有商队，能换到药。','我家小子说他也能看见光点，是不是也有灵根？','晚上别去通风口，那边有怪声。','仙师，外面的妖兽是不是越来越多了？','铁叔昨晚又一个人数人头，数到半夜。','发电机要是再坏，咱们就得摸黑过冬了。','我想吃一口真正的米饭。'];
function buildTown(){const W=26,H=12,M=newMap('town',-1,W,H,'tile');Object.assign(M,{name:'青石站',dark:.38,bg:'#070908',amb:'dust'});
 for(let c=0;c<W;c++){for(let r=9;r<H;r++)M.g[gi(M,c,r)]='track';M.g[gi(M,c,8)]='edge';}
 for(let c=0;c<W;c++)addProp(M,c,0,c%5===3?'walllamp':'wall',{v:c%4});
 for(let r=1;r<9;r++)addProp(M,0,r,r===3?'vent':r===6?'walllamp':'wall',{v:r%4});
 const vent=propAt(M,0,3);vent.lab='通风道 · 修炼';vent.act=()=>{TAB='cult';render();};
 [[7,6],[13,6]].forEach(([c,r])=>addProp(M,c,r,'pillar'));
 [[2,6],[3,7],[5,7],[1,8]].forEach(([c,r],i)=>addProp(M,c,r,'tent',{v:i}));
 const st=addProp(M,9,1,'stall');st.lab='粥棚';st.act=()=>wSay('wang',pick(STALL_LINES));
 const bd=addProp(M,12,1,'board');bd.lab='告示板 · 委托';bd.act=()=>{TAB='story';render();setTimeout(()=>{const q=$('#qlist');if(q)q.scrollIntoView({block:'start'});},60);};
 const gn=addProp(M,17,1,'gen');gn.lab='发电机';gn.act=()=>F('guoJoined')?wSay('guo','别吵，马上就好。'):toast('发电机嗡嗡作响，时好时坏。');
 [[19,1],[20,1],[21,1],[20,2]].forEach(([c,r],i)=>addProp(M,c,r,i%2?'barrel':'crate',{v:i}));
 const fi=addProp(M,15,7,'fireS',{blocks:true});fi.lab='篝火';fi.act=()=>toast(pick(['火光暖洋洋的。几个孩子围着烤土豆。','有人在火边哼着灵潮前的老歌。','你在火边坐了一会儿。']));
 if(safe(NPCS.hong.unlock))addProp(M,22,7,'truck',{extra:[[23,7],[23,6]]});else [[22,7],[23,7]].forEach(([c,r])=>addProp(M,c,r,'crate'));
 const sx=addProp(M,25,3,'stairs',{extra:[[25,2],[25,4]]});sx.lab='北出口 · 出站';sx.act=()=>wTravel();
 for(let c=2;c<10;c++)addProp(M,c,10,'train',{v:c});
 propLights(M);M.lights.push({c:24,r:3,rad:70,h:30,col:'rgba(255,240,200,.25)'});
 const add=(k,c,r,o)=>M.ents.push(mkEnt(Object.assign({kind:'npc',k,c,r,dir:1},o||{})));
 Object.keys(TOWN_POS).forEach(k=>{if(NPCS[k]&&safe(NPCS[k].unlock))add(k,...TOWN_POS[k]);});
 add('wang',9,2,{gen:1,name:'王婶'});if(F('guoJoined'))add('guo',17,2,{gen:1,name:'郭师傅',dir:0});
 if(S.special==='zhou')add('zhou',13,4,{special:'zhou',name:'周烈'});
 if(S.special==='hunter')add('zhou2',22,3,{special:'hunter',name:'天穹追兵'});
 QUESTS.forEach(q=>{if(qSt(q.id)==='on'&&q.obj.type==='fight')add('corpse',23,2+Math.floor(Math.random()*3),{qfight:q.id,name:'尸潮'});});
 for(let i=0;i<5;i++){const c=4+i*4,r=2+(i%3)*2;add(villager(i),c,r,{gen:1,vill:1,name:'站民',home:[c,r],spd:1.4});}
 if(F('metShen')){const t=addProp(M,11,5,'crate');t.lab='棋摊';t.act=()=>npcTalk('shen');}
 if(F('metGui')&&isNight())add('gui',21,5,{name:'鬼手（只在夜里出摊）'});
 for(let i=0;i<(S.raid||0);i++)M.ents.push(mkEnt({kind:'foe',look:'天穹追兵',raid:1,c:23-i,r:2+i*2,home:[23-i,2+i*2],dir:1,spd:1.4,name:'天穹刺客'}));
 return M;}

/* ---------- 野外区域 ---------- */
function buildZone(z){const D=ZDEF[z],W=24,H=24,M=newMap('zone',z,W,H,D.g[0]);Object.assign(M,{name:ZONES[z].n,dark:D.dark,bg:D.bg,amb:D.amb});const R=rng((Date.now()%65521)+z*977+1);const K=(c,r)=>c+','+r;
 for(let i=0;i<14&&D.g.length>1;i++){const gc=R()*W,gr=R()*H,rad=1+R()*3,t=D.g[1+Math.floor(R()*(D.g.length-1))];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(Math.hypot(c-gc,r-gr)<rad)M.g[gi(M,c,r)]=t;}
 const start=[2,2],end=[W-4,H-4],path=new Set();
 const carve=(c,r)=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++)if(inMap(M,c+a,r+b))path.add(K(c+a,r+b));};
 const wps=[start,[3+Math.floor(R()*6),9+Math.floor(R()*6)],[10+Math.floor(R()*6),3+Math.floor(R()*6)],[11+Math.floor(R()*7),13+Math.floor(R()*5)],end];
 for(let i=0;i<wps.length-1;i++){let [c,r]=wps[i];const [tc,tr]=wps[i+1];let n=0;while((c!==tc||r!==tr)&&n++<300){carve(c,r);if(c!==tc&&(r===tr||R()<.5))c+=Math.sign(tc-c);else r+=Math.sign(tr-r);}carve(c,r);}
 const nearPath=(c,r)=>path.has(K(c,r))||path.has(K(c+1,r))||path.has(K(c-1,r))||path.has(K(c,r+1))||path.has(K(c,r-1));
 if(D.hz)for(let i=0;i<5;i++){const hc=1+R()*(W-2),hr=1+R()*(H-2),rad=1.5+R()*2.2;for(let r=1;r<H-1;r++)for(let c=1;c<W-1;c++)if(Math.hypot(c-hc,r-hr)<rad&&!nearPath(c,r))M.g[gi(M,c,r)]=D.hz;}
 const far=(c,r,p,d)=>Math.abs(c-p[0])+Math.abs(r-p[1])>d;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(c&&r&&c<W-1&&r<H-1)continue;const e=(c===W-1||r===H-1)?D.front:D.edge;if(TL[e])M.g[gi(M,c,r)]=e;else addProp(M,c,r,e,{v:Math.floor(R()*4)});}
 for(let r=1;r<H-1;r++)for(let c=1;c<W-1;c++){if(path.has(K(c,r))||!far(c,r,start,2)||!far(c,r,end,2))continue;const T=TL[M.g[gi(M,c,r)]];if(T&&T.nw)continue;if(R()<D.dens)addProp(M,c,r,pick2(R,D.props),{v:Math.floor(R()*4)});}
 for(let r=end[1]-1;r<=end[1]+1;r++)for(let c=end[0]-1;c<=end[0]+1;c++)if(inMap(M,c,r)&&!M.blk[gi(M,c,r)])M.g[gi(M,c,r)]='altar';
 M.g[gi(M,start[0],start[1])]=D.g[0];
 const p0=propAt(M,1,2);if(p0)removeProp(M,p0);M.g[gi(M,1,2)]=D.g[0];addProp(M,1,2,'portal',{blocks:false,lab:'出口',act:()=>wTravel()});
 const reach=bfsAll(M,start);const taken=new Set([K(...start),K(1,2),K(...end)]);
 const pool=[...reach].map(k=>k.split(',').map(Number)).filter(([c,r])=>far(c,r,start,4)&&far(c,r,end,2));
 const spot=(pred,gap)=>{const cand=pool.filter(([c,r])=>!taken.has(K(c,r))&&(!pred||pred(c,r))&&[...taken].every(t=>{const [a,b]=t.split(',').map(Number);return Math.abs(a-c)+Math.abs(b-r)>=(gap||2);}));if(!cand.length)return null;const s=pick2(R,cand);taken.add(K(s[0],s[1]));return s;};
 const off=(c,r)=>!path.has(K(c,r)),on=(c,r)=>path.has(K(c,r));
 M.ents.push(mkEnt({kind:'foe',boss:true,look:ZONES[z].boss,c:end[0],r:end[1],dir:1,name:ZONES[z].boss}));
 const f=spot((c,r)=>on(c,r)&&far(c,r,start,8)&&far(c,r,end,5),3);if(f)addProp(M,f[0],f[1],'fireS',{lab:'休整',act:p=>wRest(p)});
 for(let i=0;i<3;i++){const s=spot(off,3)||spot(null,3);if(s)addProp(M,s[0],s[1],'chest',{lab:null,act:p=>openChest(p)});}
 const ep=evPool(z);for(let i=0;i<3&&ep.length;i++){const s=spot(null,3);if(!s)break;const id=ep.splice(Math.floor(R()*ep.length),1)[0];addProp(M,s[0],s[1],'spark',{blocks:false,ev:id,lab:'奇遇',act:p=>playEvent(p.ev,{obj:p})});}
 const sc=ZONE_SCRIPT[z];if(sc&&!S.seenEv.includes(sc)){const s=spot(null,2);if(s){if(z===0)M.ents.push(mkEnt({kind:'npc',k:'guo',c:s[0],r:s[1],dir:1,ev:sc,name:'老人'}));else addProp(M,s[0],s[1],'spark',{blocks:false,gold:1,ev:sc,lab:'见闻',act:p=>playEvent(p.ev,{obj:p})});}}
 QUESTS.forEach(q=>{if(qSt(q.id)==='on'&&q.obj.type==='node'&&q.obj.z===z){const s=spot(null,2);if(s)addProp(M,s[0],s[1],'spark',{blocks:false,gold:1,ev:q.obj.ev,qid:q.id,lab:'委托 · '+q.title,act:p=>playEvent(p.ev,{obj:p,qid:p.qid})});}});
 for(let i=0;i<2;i++){const s=spot((c,r)=>on(c,r)&&far(c,r,start,5),3);if(s){M.trap.add(K(s[0],s[1]));M.g[gi(M,s[0],s[1])]=trapType(z);taken.delete(K(s[0],s[1]));}}
 if(F('metGui')&&Math.random()<.22){const s=spot(null,3);if(s)M.ents.push(mkEnt({kind:'npc',k:'gui',c:s[0],r:s[1],dir:1,name:'鬼手'}));}
 if(maxZone()>=2&&Math.random()<.12){const s=spot(null,3);if(s)M.ents.push(mkEnt({kind:'npc',k:'jianke',c:s[0],r:s[1],dir:1,ev:'jianke',name:'无名剑客'}));}
 if(S.flags.mapClue||Math.random()<.16){const s=spot(off,3);if(s){addProp(M,s[0],s[1],'portal',{blocks:false,rift:1,lab:'裂隙',act:()=>enterRift()});M.lights.push({c:s[0],r:s[1],rad:40,h:4,col:'rgba(200,120,255,.35)'});delete S.flags.mapClue;}}
 const nE=Math.round((6+Math.min(z,4))*(omenOn('chao')?1.6:1));for(let i=0;i<nE;i++){const s=spot((c,r)=>far(c,r,start,5),3);if(!s)break;const look=pick2(R,ZONES[z].mobs);M.ents.push(mkEnt({kind:'foe',look,c:s[0],r:s[1],home:s,elite:R()<.15,spd:1.4}));}
 propLights(M);M.props.forEach(p=>{if(p.type==='spark')M.lights.push({c:p.c,r:p.r,rad:34,h:10,col:p.gold?'rgba(227,184,98,.35)':'rgba(143,214,181,.35)'});if(p.type==='portal')M.lights.push({c:p.c,r:p.r,rad:40,h:4,col:'rgba(143,214,181,.3)'});});
 let lv=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(M.g[gi(M,c,r)]==='lava'&&lv++<70&&(c+r)%2===0)M.lights.push({c,r,rad:30,h:0,col:'rgba(255,110,40,.22)'});
 M.lights.push({c:end[0],r:end[1],rad:46,h:10,col:'rgba(255,70,50,.25)'});
 return M;}
function buildAbyss(){const W=13,H=13,M=newMap('abyss',7,W,H,'void');Object.assign(M,{name:'灵源深渊 · 第 '+(S.abyss+1)+' 层',dark:.5,bg:'#05040a',amb:'mote2'});
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(Math.hypot(c-6,r-6)<5.6)M.g[gi(M,c,r)]='pstone';
 for(let r=2;r<=4;r++)for(let c=5;c<=7;c++)M.g[gi(M,c,r)]='altar';
 [[2,5],[10,5],[3,9],[9,9]].forEach(([c,r])=>addProp(M,c,r,'crystal',{v:c%4}));
 addProp(M,6,11,'portal',{blocks:false,lab:'出口',act:()=>wTravel()});
 abyssGuard(M);propLights(M);M.lights.push({c:6,r:11,rad:40,h:4,col:'rgba(143,214,181,.3)'},{c:6,r:3,rad:50,h:10,col:'rgba(200,140,255,.3)'});return M;}
function abyssGuard(M){M.name='灵源深渊 · 第 '+(S.abyss+1)+' 层';M.ents.push(mkEnt({kind:'foe',boss:true,abyss:1,tint:1,look:ABYSS_POOL[S.abyss%ABYSS_POOL.length],c:6,r:3,dir:1,name:'深渊守关者 · 第'+(S.abyss+1)+'层'}));}

function enterRift(){const M0=WD.M,P=WD.P;WD.prev={M:M0,pos:[Math.round(P.x),Math.round(P.y)]};const z=M0.z;
 wFade(()=>{const D=ZDEF[z],W=11,H=11,M=newMap('rift',z,W,H,D.g[0]);Object.assign(M,{name:'秘境 · '+ZONES[z].n,dark:Math.min(.6,D.dark+.15),bg:'#06040c',amb:'mote2'});
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(Math.hypot(c-5,r-5)>5.4)M.g[gi(M,c,r)]='void';else if((c+r)%5===0&&D.g[1])M.g[gi(M,c,r)]=D.g[1];}
  [[3,2],[7,2],[2,7],[8,7]].forEach(([c,r])=>addProp(M,c,r,'chest',{rich:1,act:p=>openChest(p)}));[[5,1],[1,5],[9,5]].forEach(([c,r])=>addProp(M,c,r,'crystal',{v:c%4}));
  addProp(M,5,9,'portal',{blocks:false,lab:'回去',act:()=>leaveRift()});
  [[4,4],[6,5]].forEach(([c,r])=>M.ents.push(mkEnt({kind:'foe',look:pick(ZONES[Math.min(z,10)].mobs.length?ZONES[z].mobs:['天魔影']),c,r,home:[c,r],elite:true,spd:1.2})));
  propLights(M);M.lights.push({c:5,r:9,rad:40,h:4,col:'rgba(200,120,255,.35)'},{c:5,r:5,rad:60,h:10,col:'rgba(200,120,255,.25)'});
  wLoad(M,[5,8]);toast('你钻进了裂隙。这里藏着别人没见过的东西。','big');});}
function leaveRift(){const pv=WD.prev;if(!pv){goTown();return;}WD.prev=null;wFade(()=>{wLoad(pv.M,pv.pos);});}
/* ---------- 寻路 ---------- */
function bfsAll(M,s){const set=new Set([s[0]+','+s[1]]);const q=[s];while(q.length){const [c,r]=q.shift();for(const [dc,dr] of DIRV){const nc=c+dc,nr=r+dr,k=nc+','+nr;if(set.has(k)||!passable(M,nc,nr))continue;set.add(k);q.push([nc,nr]);}}return set;}
function bfsPath(M,sc,sr,goal){const W=M.W,prev=new Int32Array(W*M.H).fill(-2),occ=new Set();M.ents.forEach(e=>{if(e.kind==='npc'&&!e.dead)occ.add(gi(M,Math.round(e.x),Math.round(e.y)));});
 const s0=gi(M,sc,sr);const q=[s0];prev[s0]=-1;let h=0,found=-1;
 while(h<q.length){const i=q[h++],c=i%W,r=(i/W)|0;if(goal(c,r)){found=i;break;}for(const [dc,dr] of DIRV){const nc=c+dc,nr=r+dr;if(!inMap(M,nc,nr))continue;const j=gi(M,nc,nr);if(prev[j]!==-2||!passable(M,nc,nr)||occ.has(j))continue;prev[j]=i;q.push(j);}}
 if(found<0)return null;const out=[];let i=found;while(prev[i]!==-1){out.push([i%W,(i/W)|0]);i=prev[i];}return out.reverse();}

/* ---------- 进出地图 ---------- */
function camGoal(){const M=WD.M,P=WD.P;let tx=(P.x-P.y)*16,ty=(P.x+P.y)*8-10;const x0=-(M.H-1)*16-16,x1=(M.W-1)*16+16,y0=-62,y1=(M.W+M.H-2)*8+30;
 const cl=(v,a,b,half)=>b-a<=half*2?(a+b)/2:Math.max(a+half,Math.min(b-half,v));return [cl(tx,x0,x1,WD.W/2),cl(ty,y0,y1,WD.H/2)];}
function wLoad(M,st){WD.M=M;const P=mkEnt({kind:'player',c:st[0],r:st[1],spd:4.4,dir:0,inv:1});P.trail=[];WD.P=P;WD.F=followers();[WD.cam.x,WD.cam.y]=camGoal();
 WD.labs.forEach(L=>L.el.remove());WD.labs.clear();WD.parts=[];WD.tap=null;wHud();}
function followers(){const L=[{k:'mo'}];if(WD.M&&WD.M.kind!=='town'){if(F('zeroSaved')&&qDone('zero1'))L.push({k:'zero'});if(qDone('zhou1'))L.push({k:'zhou'});}
 return L.map((f,i)=>mkEnt(Object.assign({kind:'fol',c:WD.P.x,r:WD.P.y,idx:i+1},f)));}
function wFade(fn){const f=$('#wfade');if(!f){fn();return;}f.classList.add('on');setTimeout(()=>{try{fn();}finally{setTimeout(()=>f.classList.remove('on'),60);}},260);}
function goTown(defeat){WD.prev=null;STREAK=0;const doit=()=>{S.hpF=1;S.mpF=1;S.loc='town';wLoad(buildTown(),defeat?[13,5]:[24,3]);const t=$('#travel');if(t)t.hidden=true;if(defeat)setTimeout(()=>toast('你被抬回了青石站，伤已经养好了。'),300);save();};
 if(TAB!=='world'){TAB='world';render();doit();}else wFade(doit);}
function goZone(z){if(!zoneUnlocked(z))return;WD.prev=null;STREAK=0;advanceDays(1,'trip');wFade(()=>{S.loc='z'+z;wLoad(z===7?buildAbyss():buildZone(z),z===7?[6,9]:[2,2]);const t=$('#travel');if(t)t.hidden=true;
  if(!S.visited.includes(z))S.visited.push(z);checkStory();save();});}
function wTravel(){if(TAB!=='world'){TAB='world';render();}const t=$('#travel');if(!t)return;t.innerHTML=travelHTML();t.hidden=false;requestAnimationFrame(()=>{drawTravel();const sc=t.querySelector('.travel-scroll'),cur=t.querySelector('.tsp.cur');if(sc&&cur)sc.scrollTop=Math.max(0,cur.offsetTop-sc.clientHeight/2);});}

/* ---------- 互动 ---------- */
function wSay(k,s){const e=WD.M&&WD.M.ents.find(x=>x.k===k);if(e)e.bub={s,t:WD.t+3.2};else toast(s);}
function faceTo(a,b){const dc=Math.round(b.x)-Math.round(a.x),dr=Math.round(b.y)-Math.round(a.y);if(dc||dr)a.dir=Math.abs(dc)>=Math.abs(dr)?(dc>0?0:3):(dr>0?1:2);}
function wNpcAct(e){
 if(e.fn){e.fn(e);return;}
 if(e.special==='zhou'){startBattle([mkEnemy(0,true,'zhou')],{bg:'town',noFlee:true,onWin:()=>{e.dead=true;}});return;}
 if(e.special==='hunter'){const f=[mkEnemy(0,true,'hunter')];startBattle(f,{bg:'town',noFlee:true,onWin:()=>{e.dead=true;}});return;}
 if(e.qfight){qFight(e.qfight,()=>{WD.M.ents.filter(x=>x.qfight===e.qfight).forEach(x=>x.dead=true);});return;}
 if(e.ev){playEvent(e.ev,{ent:e});return;}
 if(e.k==='wang'){wSay('wang',pick(STALL_LINES));return;}
 if(e.k==='guo'){wSay('guo',pick(['这条线我走了三十年。','发电机我来管，你放心出去。','老铁那小子，还是那么爱操心。']));return;}
 if(e.vill){e.bub={s:pick(VILL_LINES),t:WD.t+3.2};e.path=[];return;}
 npcTalk(e.k);}
function wRest(p){if(p.used){toast('篝火已经熄了。');return;}
 modal(`<h3>休整</h3><p>一堆还温着的篝火。生命 <b>${Math.round((S.hpF??1)*100)}%</b> · 灵力 <b>${Math.round((S.mpF??1)*100)}%</b></p>`,
  [{t:'包扎伤口（生命回满）',cls:'gold',fn:()=>{S.hpF=1;p.used=1;toast('你包扎好了伤口。');save();}},{t:'打坐调息（灵力回满）',fn:()=>{S.mpF=1;gQi(.2);p.used=1;toast('你调息了一阵，灵气也涨了些。');save();}}]);}
function openChest(p){p.type='chestO';p.act=null;EVZ=Math.min(WD.M.z,10);const R=Math.random();let t='';
 if(!p.rich&&Math.random()<.12){toast('宝箱张开了嘴——是宝箱怪！','bad');const z=EVZ;startBattle([mkCustom(z,{look:'宝箱怪',name:'宝箱怪',m:2,after:()=>gS(zsAt(z,6))+gGem(null,gemTierFor(z))+(chance(.5)?gItem(rollRar(true)):'')})],{});return;}
 if(p.rich){t=gS(zsAt(EVZ,6))+(chance(.6)?gGem(null,gemTierFor(EVZ)+1):gItem(Math.min(3,rollRar(true)+1)))+(chance(.2)?gBook():'');toast(('秘境宝箱：'+t).replace(/\s+/g,' '),'big');save();return;}
 if(R<.5)t=gS(zs(3+Math.random()*3));else if(R<.72){S.meds++;t=' 疗伤药 +1。';}else if(R<.84){S.mps++;t=' 清心丹 +1。';}else t=gItem(rollRar(false));
 toast(('打开宝箱：'+t).replace(/\s+/g,' ').replace('： ','：'));save();}
function wEncounter(e){const M=WD.M,z=M.z,P=WD.P;P.path=[];P.act=null;let foes;
 if(e.raid){const mz=maxZone();startBattle([mkCustom(mz,{look:'天穹追兵',name:'天穹刺客',m:1.3}),mkCustom(mz,{look:'天穹追兵',name:'天穹刺客',m:1})],{bg:'town',onWin:()=>{e.dead=true;S.raid=Math.max(0,(S.raid||1)-1);if(!S.raid&&S.clan){S.clan.fame+=10;clLog('击退了天穹会的刺客。');toast('刺客全部击退！行社声望 +10','big');}},onFlee:()=>{e.stun=3;P.inv=2.5;}});return;}
 if(e.boss)foes=[e.abyss?mkEnemy(7,true):mkEnemy(z,true)];
 else{foes=[mobOf(z,e.look,e.elite)];const ex=z===0?(Math.random()<.45?1:0):1+(Math.random()<.35?1:0);for(let i=0;i<ex;i++)foes.push(mobOf(z,pick(ZONES[z].mobs)));if(foes.length>1)foes.forEach(f=>{f.hp*=.72;f.max=f.hp;f.atk*=.66;});}
 startBattle(foes,{z,noFlee:!!e.boss,onWin:()=>{e.dead=true;if(e.boss)finishZone(e);},onFlee:()=>{e.stun=3;P.inv=2.5;}});}
function mobOf(z,look,elite){const e=mkEnemy(z,false);e.look=look;e.n=look;if(elite){e.hp*=1.8;e.max=e.hp;e.atk*=1.3;e.stones*=3;e.elite=true;e.n='狂暴'+look;}return e;}
function finishZone(e){const M=WD.M,z=M.z;
 if(e.abyss){toast('深渊第 '+S.abyss+' 层已破，更深处的守关者醒了。','big');setTimeout(()=>{if(WD.M===M){abyssGuard(M);wHud();}},900);save();return;}
 advanceDays(2,'trip');const bonus=zsAt(z,8);S.stones+=bonus;qProgress('run',{z});EVZ=z;const item=chance(.6)?gItem(rollRar(true)):'';
 modal(`<h3>探索完成</h3><p>你击败了「${ZONES[z].boss}」，走到了「${ZONES[z].n}」的尽头。</p><p>通关奖励：灵石 <b>${fmt(bonus)}</b>${item?'<br>'+item:''}</p><p>从入口的光圈可以离开，或者继续在这里清剿妖兽。</p>`,
  [{t:'继续',cls:'gold',fn:()=>{const p=S.pending.find(id=>{const c=STORY.find(x=>x.id===id);return c&&!c.side;});if(p)playStory(p);}}],ZONE_SCN[z]);save();}

/* ---------- 点击与行走 ---------- */
function wWalk(tc,tr,adj,act){const M=WD.M,P=WD.P;const from=P.path.length?P.path[0]:[Math.round(P.x),Math.round(P.y)];
 const goal=adj?(c,r)=>Math.abs(c-tc)+Math.abs(r-tr)===1:(c,r)=>c===tc&&r===tr;
 const p=bfsPath(M,from[0],from[1],goal);if(!p){toast('那里过不去','bad');return;}
 P.path=(P.path.length?[from]:[]).concat(p);P.act=act||null;if(!P.path.length&&act){P.act=null;act();}}
function wHit(gx,gy){const M=WD.M,ox=Math.round(WD.W/2-WD.cam.x),oy=Math.round(WD.H/2-WD.cam.y);let best=null,bd=-1e9;
 const test=(x0,y0,w,h,d,o)=>{if(gx>=x0&&gx<=x0+w&&gy>=y0&&gy<=y0+h&&d>bd){bd=d;best=o;}};
 M.ents.forEach(e=>{if(e.dead)return;const sx=(e.x-e.y)*16+ox,sy=(e.x+e.y)*8+oy;if(e.kind==='foe'){const cv=monCv(e.look,e.boss?1.1:.72,e.tint);test(sx-dw(cv)/2-3,sy-dh(cv)-3,dw(cv)+6,dh(cv)+6,e.x+e.y,e);}else test(sx-10,sy-30,20,32,e.x+e.y,e);});
 WD.F.forEach(f=>{if(f.k!=='mo')return;const sx=(f.x-f.y)*16+ox,sy=(f.x+f.y)*8+oy;test(sx-10,sy-40,20,32,f.x+f.y+.5,f);});
 M.props.forEach(p=>{if(!p.act||(p.hid&&!(WD.soul>0)))return;const sx=(p.c-p.r)*16+ox,sy=(p.c+p.r)*8+oy;if(p.type==='spark'||p.type==='portal'){test(sx-12,sy-24,24,30,p.c+p.r,{prop:p});return;}const o=propCv(p.type,p.v,M.z);test(sx-o.ax,sy-o.ay,o.w,o.h,p.c+p.r-.1,{prop:p});});
 return best;}
function wTap(gx,gy){if(BT||!OV_FREE()||!WD.M)return;const M=WD.M,P=WD.P;const t=$('#travel');if(t&&!t.hidden)return;
 const h=wHit(gx,gy);
 if(h){if(h.kind==='foe'){wWalk(Math.round(h.x),Math.round(h.y),false,null);return;}
  if(h.kind==='npc'){wWalk(Math.round(h.x),Math.round(h.y),true,()=>{faceTo(P,h);faceTo(h,P);wNpcAct(h);});return;}
  if(h.kind==='fol'){npcTalk('mo');return;}
  if(h.prop){const p=h.prop;wWalk(p.c,p.r,p.blocks,()=>{if(p.blocks)faceTo(P,{x:p.c,y:p.r});if(p.act)p.act(p);});return;}}
 const wx=gx-WD.W/2+WD.cam.x,wy=gy-WD.H/2+WD.cam.y,c=Math.round((wx/16+wy/8)/2),r=Math.round((wy/8-wx/16)/2);if(!inMap(M,c,r))return;
 wWalk(c,r,!passable(M,c,r),null);WD.tap={c,r,t:WD.t};}
function wOnTile(c,r){const M=WD.M,k=c+','+r;if(M.trap.has(k)){M.trap.delete(k);WD.P.path=[];WD.P.act=null;EVZ=M.z;playEvent('trap_floor',{});}}

/* ---------- 更新 ---------- */
function stepEnt(e,dt,onTile){if(!e.path.length){e.moving=false;return;}const [tc,tr]=e.path[0],dx=tc-e.x,dy=tr-e.y,d=Math.abs(dx)+Math.abs(dy),s=e.spd*dt;e.moving=true;e.ft+=dt;
 if(d>.001)e.dir=dirOf(Math.abs(dx)>.001?Math.sign(dx):0,Math.abs(dy)>.001?Math.sign(dy):0);
 if(d<=s){e.x=tc;e.y=tr;e.path.shift();if(onTile)onTile(tc,tr);if(!e.path.length)e.moving=false;}else{e.x+=Math.sign(dx)*Math.min(Math.abs(dx),s);e.y+=Math.sign(dy)*Math.min(Math.abs(dy),s);}}
function npcUpd(e,dt){if(!e.vill){e.wt-=dt;if(e.wt<=0){e.wt=4+Math.random()*5;if(!e.special&&!e.qfight)e.dir=[0,1,1,3][Math.floor(Math.random()*4)];}return;}
 if(!e.path.length){e.wt-=dt;if(e.wt<=0){e.wt=2+Math.random()*4;const [dc,dr]=pick(DIRV),nc=Math.round(e.x)+dc,nr=Math.round(e.y)+dr,P=WD.P;
   if(Math.abs(nc-e.home[0])+Math.abs(nr-e.home[1])<=2&&passable(WD.M,nc,nr)&&!(Math.round(P.x)===nc&&Math.round(P.y)===nr))e.path=[[nc,nr]];}}
 stepEnt(e,dt);}
function foeUpd(e,dt){if(e.dead)return;if(e.stun>0)e.stun-=dt;if(e.boss)return;const P=WD.P,M=WD.M;
 if(!e.path.length){const c=Math.round(e.x),r=Math.round(e.y),pc=Math.round(P.x),pr=Math.round(P.y),dist=Math.abs(c-pc)+Math.abs(r-pr);
  if(dist<=4&&!(e.stun>0)&&P.inv<=0&&!WD.fly){let best=null,bd=dist;DIRV.forEach(([dc,dr])=>{const nc=c+dc,nr=r+dr,nd=Math.abs(nc-pc)+Math.abs(nr-pr);if(nd<bd&&passable(M,nc,nr)){bd=nd;best=[nc,nr];}});if(best){e.path=[best];e.spd=2.5;}}
  else{e.wt-=dt;if(e.wt<=0){e.wt=1.5+Math.random()*2.5;const [dc,dr]=pick(DIRV),nc=c+dc,nr=r+dr;if(Math.abs(nc-e.home[0])+Math.abs(nr-e.home[1])<=2&&passable(M,nc,nr)){e.path=[[nc,nr]];e.spd=1.3;}}}}
 stepEnt(e,dt);}
function wUpdate(dt){const M=WD.M,P=WD.P;if(!M||!P)return;WD.t+=dt;if(P.inv>0)P.inv-=dt;P.spd=WD.fly?9:4.4;
 const had=P.path.length>0;stepEnt(P,dt,wOnTile);if(had&&!P.path.length&&P.act){const a=P.act;P.act=null;a();}
 const last=P.trail[P.trail.length-1];if(!last||Math.abs(last.x-P.x)+Math.abs(last.y-P.y)>=.2){P.trail.push({x:P.x,y:P.y,dir:P.dir});if(P.trail.length>60)P.trail.shift();}
 WD.F.forEach(f=>{const s=P.trail[Math.max(0,P.trail.length-1-f.idx*5)]||{x:P.x,y:P.y,dir:P.dir};f.moving=P.moving&&(Math.abs(f.x-s.x)+Math.abs(f.y-s.y)>.001);f.x=s.x;f.y=s.y;f.dir=s.dir;if(f.moving)f.ft+=dt;});
 M.ents.forEach(e=>{if(e.dead)return;if(e.kind==='npc')npcUpd(e,dt);else if(e.kind==='foe')foeUpd(e,dt);});
 if(WD.soul>0)WD.soul-=dt;if(P.inv<=0&&!BT&&!WD.fly)for(const e of M.ents){if(e.kind==='foe'&&!e.dead&&!(e.stun>0)&&Math.abs(e.x-P.x)+Math.abs(e.y-P.y)<.8){wEncounter(e);break;}}
 const k=Math.min(1,dt*7),cg=camGoal();WD.cam.x+=(cg[0]-WD.cam.x)*k;WD.cam.y+=(cg[1]-WD.cam.y)*k;
 ambient(dt);}
function ambient(dt){const M=WD.M,W=WD.W,H=WD.H,A=WD.parts;const want=M.amb==='mist'?10:36;
 while(A.length<want){const t=M.amb;const p={x:Math.random()*W,y:Math.random()*H,life:2+Math.random()*4,age:0,t};
  if(t==='drip'||t==='ash'||t==='dust'){p.vx=(Math.random()-.5)*4;p.vy=t==='ash'?8+Math.random()*8:3+Math.random()*4;p.c=t==='ash'?'#c8b8a8':'#9aa89e';}
  else if(t==='ember'||t==='mote'||t==='mote2'||t==='spark'){p.vx=(Math.random()-.5)*6;p.vy=-(6+Math.random()*10);p.c=t==='ember'?'#ff9a4a':t==='mote'?'#fff0c0':t==='mote2'?'#c9a8ff':'#7ff0ff';}
  else if(t==='fly'){p.vx=(Math.random()-.5)*10;p.vy=(Math.random()-.5)*10;p.c='#d8ff8a';}
  else{p.vx=4+Math.random()*4;p.vy=0;p.c='#dfe8e8';p.big=1;}A.push(p);}
 for(let i=A.length-1;i>=0;i--){const p=A[i];p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t==='fly'){p.vx+=(Math.random()-.5)*20*dt;p.vy+=(Math.random()-.5)*20*dt;}if(p.age>p.life||p.x<-10||p.x>W+10||p.y<-10||p.y>H+10)A.splice(i,1);}}

/* ---------- 渲染 ---------- */
function drawFlame(x,sx,sy,t){const f=Math.floor(t*10);const cols=['#ff7a2a','#ffb04a','#ffe8a0'];for(let i=0;i<3;i++){const h=6-i*1.6+((f+i)%3)*.8,w=3-i;x.fillStyle=cols[i];x.fillRect(Math.round(sx-w),Math.round(sy-h-1),w*2,Math.round(h));}
 if(f%4===0){x.fillStyle='#ffd070';x.fillRect(Math.round(sx+((f*7)%5)-2),Math.round(sy-10-(f%3)),1,1);}}
function drawSpark(x,sx,sy,gold,t){const c=gold?'#ffe08a':'#bfffe6',a=.55+.45*Math.sin(t*4);x.globalAlpha=.35*a;x.fillStyle=c;x.fillRect(sx-1,sy-30,3,26);x.globalAlpha=1;
 const s=Math.round(3+Math.sin(t*5)*1),yy=Math.round(sy-12+Math.sin(t*3)*2);x.fillStyle=c;x.fillRect(sx-s,yy,s*2+1,1);x.fillRect(sx,yy-s,1,s*2+1);x.fillStyle='#fff';x.fillRect(sx,yy,1,1);
 x.fillStyle=gold?'#c9a23a':'#4f9c7f';x.fillRect(sx-4,sy,9,1);x.fillRect(sx-2,sy+1,5,1);}
function drawPortal(x,sx,sy,t,rift){for(let i=0;i<3;i++){const p=((t*.6+i/3)%1),rx=6+p*10,ry=rx/2;x.globalAlpha=(1-p)*.8;x.strokeStyle=rift?'#c98aff':'#8fd6b5';x.beginPath();x.ellipse(sx+.5,sy+.5,rx,ry,0,0,6.283);x.stroke();}x.globalAlpha=1;
 x.fillStyle=rift?'#ecd0ff':'#bfffe6';for(let i=0;i<4;i++){const ph=(t*1.5+i*.25)%1;x.fillRect(Math.round(sx-6+i*4),Math.round(sy-ph*22),1,2);}}
function wRender(){const M=WD.M,x=WD.cx,P=WD.P;if(!M||!x||!P)return;const W=WD.W,H=WD.H,t=WD.t;WD.fid++;x.setTransform(WD.k,0,0,WD.k,0,0);x.imageSmoothingEnabled=true;
 x.fillStyle=M.bg;x.fillRect(0,0,W,H);if(M.kind==='zone'&&(M.z===1||M.z===6||M.z===9)){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,M.z===1?'#24161a':M.z===9?'#fffaf0':'#fff2c8');g.addColorStop(1,M.bg);x.fillStyle=g;x.fillRect(0,0,W,H);}
 const ox=W/2-WD.cam.x,oy=H/2-WD.cam.y,an=Math.floor(t*2.5)%4;
 for(let s=0;s<M.W+M.H-1;s++)for(let c=Math.max(0,s-M.H+1);c<=Math.min(M.W-1,s);c++){const r=s-c,sx=(c-r)*16+ox,sy=(c+r)*8+oy;if(sx<-20||sx>W+20||sy<-12||sy>H+30)continue;
  const i=gi(M,c,r),ty=M.g[i],T=TL[ty];if(T&&T.none)continue;const v=T&&(T.water||ty==='lava'||ty==='puddle')?(M.gv[i]+an)%4:M.gv[i];
  const a=gT(M,c,r+1),b=gT(M,c+1,r);if(TL[a]&&TL[a].none)x.drawImage(faceCv(ty,'L'),sx-16,sy-8,32,27);if(TL[b]&&TL[b].none)x.drawImage(faceCv(ty,'R'),sx-16,sy-8,32,27);x.drawImage(tileCv(ty,v),sx-16.25,sy-8.15,32.5,16.3);}
 if(WD.tap&&t-WD.tap.t<.8){const sx=(WD.tap.c-WD.tap.r)*16+ox,sy=(WD.tap.c+WD.tap.r)*8+oy;x.globalAlpha=1-(t-WD.tap.t)/.8;x.strokeStyle='#e3b862';x.beginPath();x.moveTo(sx-10,sy);x.lineTo(sx,sy-5);x.lineTo(sx+10,sy);x.lineTo(sx,sy+5);x.closePath();x.stroke();x.globalAlpha=1;}
 const L=[];
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;const sx=(p.c-p.r)*16+ox,sy=(p.c+p.r)*8+oy;if(sx<-60||sx>W+60||sy<-30||sy>H+120)return;L.push({d:p.c+p.r+(p.blocks?0:-.45),p,sx,sy});});
 M.ents.forEach(e=>{if(!e.dead)L.push({d:e.x+e.y+.02,e});});WD.F.forEach(f=>L.push({d:f.x+f.y-.03,e:f}));L.push({d:P.x+P.y+.03,e:P});
 L.sort((a,b)=>a.d-b.d);const psx=(P.x-P.y)*16+ox,psy=(P.x+P.y)*8+oy,pd=P.x+P.y;
 for(const o of L){if(o.p){const p=o.p,sx=o.sx,sy=o.sy;if(p.type==='portal'){drawPortal(x,sx,sy,t,p.rift);continue;}if(p.type==='spark'){drawSpark(x,sx,sy,p.gold,t+p.c);continue;}
   const pc=propCv(p.type,p.v,M.z);let al=1;if(pc.tall&&p.c+p.r>pd+.3&&Math.abs(psx-sx)<pc.w/2+2&&psy<sy+4&&psy>sy-pc.ay+4)al=.42;
   if(al<1)x.globalAlpha=al;x.drawImage(pc.cv,sx-pc.ax,sy-pc.ay,pc.w,pc.h);x.globalAlpha=1;if(PR[p.type]&&PR[p.type].fire&&!p.used)drawFlame(x,sx,sy-1,t);continue;}
  drawEnt(x,o.e,ox,oy,t);}
 if(M.dark>0){const lx=WD.lx;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);lx.fillStyle='rgba(3,4,8,'+M.dark+')';lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
  const ls=M.lights.map(l=>({x:(l.c-l.r)*16+ox,y:(l.c+l.r)*8+oy-(l.h||0),rad:l.rad,col:l.col})).filter(l=>l.x>-l.rad&&l.x<W+l.rad&&l.y>-l.rad&&l.y<H+l.rad);
  ls.push({x:psx,y:psy-12,rad:M.dark>.3?66:40});
  ls.forEach(l=>{const g=lx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.rad);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(l.x-l.rad,l.y-l.rad,l.rad*2,l.rad*2);});
  x.drawImage(WD.lc,0,0);x.globalCompositeOperation='lighter';ls.forEach(l=>{if(!l.col)return;const r=l.rad*.7,g=x.createRadialGradient(l.x,l.y,0,l.x,l.y,r);g.addColorStop(0,l.col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(l.x-r,l.y-r,r*2,r*2);});x.globalCompositeOperation='source-over';}
 WD.parts.forEach(p=>{const a=Math.max(0,Math.min(1,Math.min(p.age,p.life-p.age)));x.globalAlpha=a*(p.big?.06:.8);x.fillStyle=p.c;if(p.big)x.fillRect(Math.round(p.x),Math.round(p.y),40,10);else x.fillRect(Math.round(p.x),Math.round(p.y),1,p.t==='drip'?2:1);});x.globalAlpha=1;
 if(WD.soul>0){x.fillStyle='rgba(60,110,200,'+Math.min(.22,WD.soul*.05)+')';x.fillRect(0,0,W,H);}
 wLabels(ox,oy);wHudLive();}
function drawEnt(x,e,ox,oy,t){const sx=(e.x-e.y)*16+ox,sy=(e.x+e.y)*8+oy;if(sx<-40||sx>WD.W+40||sy<-10||sy>WD.H+60)return;
 if(e.kind==='foe'){const s=e.boss?1.1:.72;const base=monCv(e.look,s,e.tint);const cv=(e.dir===1||e.dir===3)?cvMemo('fl|'+e.look+'|'+s+'|'+(e.tint?1:0),()=>flipCv(base)):base;
  const bob=Math.round(Math.sin(t*4+(e.home?e.home[0]:0))*1);x.drawImage(shadowCv(Math.max(8,Math.round(dw(cv)*.6))),sx-dw(cv)*.3,sy-2,Math.round(dw(cv)*.6),Math.max(3,Math.round(dw(cv)*.6)/3));
  if(e.boss||e.elite){x.globalCompositeOperation='lighter';const r=e.boss?30:18,g=x.createRadialGradient(sx,sy-dh(cv)/2,0,sx,sy-dh(cv)/2,r);g.addColorStop(0,e.boss?'rgba(255,60,40,.35)':'rgba(255,90,60,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-r,sy-dh(cv)/2-r,r*2,r*2);x.globalCompositeOperation='source-over';}
  if(e.stun>0)x.globalAlpha=.55;x.drawImage(cv,sx-dw(cv)/2,sy-dh(cv)+2+bob,dw(cv),dh(cv));x.globalAlpha=1;return;}
 const key=e.kind==='player'?(S.gender==='f'?'hero_f':'hero_m'):e.k;const sp=typeof key==='string'?CH[key]:key;const ghost=sp&&sp.ghost;
 const fr=e.moving&&!ghost?[1,0,2,0][Math.floor(e.ft*9)%4]:0;const cv=chSpr(key,e.dir,fr);let yy=sy-dh(cv)+2;
 if(ghost){yy-=9+Math.round(Math.sin(t*2.5)*2);x.globalAlpha=.75;}else x.drawImage(shadowCv(12),sx-6,sy-2,12,4);
 if(e.kind==='player'&&e.inv>0&&Math.floor(t*10)%2)x.globalAlpha=.45;if(e.kind==='player'&&WD.fly){yy-=7+Math.sin(t*4)*1.5;x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(180,240,255,.8)';x.lineWidth=1.6;x.beginPath();x.moveTo(sx-11,yy+31);x.lineTo(sx+11,yy+27);x.stroke();x.fillStyle='rgba(143,214,181,.35)';x.beginPath();x.ellipse(sx,yy+30,13,3,-.2,0,6.283);x.fill();x.restore();}
 if(e.kind==='player'&&WD.soul>0){x.globalAlpha=.4;x.drawImage(cv,sx-10+Math.sin(t*3)*3,yy-12,20,32);x.globalAlpha=1;}
 x.drawImage(cv,sx-10,yy,20,32);x.globalAlpha=1;}
function wLabels(ox,oy){const M=WD.M,K=WD.k/WD.dpr,out=[];const at=(gx,gy)=>[WD.ox+gx*K,WD.oy+gy*K];const on=(gx,gy)=>gx>-20&&gx<WD.W+20&&gy>-10&&gy<WD.H+30;
 M.ents.forEach(e=>{if(e.dead)return;const gx=(e.x-e.y)*16+ox,gy=(e.x+e.y)*8+oy;if(!on(gx,gy))return;
  if(e.kind==='npc'&&!e.vill){const mk=e.special||e.qfight?'!':(NPCS[e.k]&&!e.ev?npcMark(e.k):'');const nm=e.name||(NPCS[e.k]?NPCS[e.k].name:'');out.push({id:'n'+e.k+(e.special||''),h:(mk?`<b class="mk ${mk==='?'?'rd':''}">${mk}</b>`:'')+`<span>${nm}</span>`,p:at(gx,gy-28)});}
  if(e.kind==='foe'&&e.boss)out.push({id:'boss',h:`<span class="bn">${e.name}</span>`,p:at(gx,gy-(e.abyss||monIsHuman(e.look)?30:42))});
  if(e.bub&&e.bub.t>WD.t)out.push({id:'bub'+(e.k.id||e.k)+e.x,h:`<span class="bub">${esc(e.bub.s)}</span>`,p:at(gx,gy-30),cls:'b'});});
 const mo=WD.F.find(f=>f.k==='mo');if(mo){const m=npcMark('mo');if(m){const gx=(mo.x-mo.y)*16+ox,gy=(mo.x+mo.y)*8+oy;out.push({id:'mo',h:`<b class="mk ${m==='?'?'rd':''}">${m}</b>`,p:at(gx,gy-38)});}}
 M.props.forEach(p=>{if(!p.lab||!p.act||(p.hid&&!(WD.soul>0)))return;const gx=(p.c-p.r)*16+ox,gy=(p.c+p.r)*8+oy;if(!on(gx,gy))return;const h=p.type==='spark'||p.type==='portal'?24:propCv(p.type,p.v,M.z).ay+2;out.push({id:'p'+p.c+'_'+p.r,h:`<span class="pl ${p.gold?'g':''} ${p.rift?'rf':''}">${p.lab}</span>`,p:at(gx,gy-h)});});
 const seen=new Set();out.forEach(o=>{let L=WD.labs.get(o.id);if(!L){const el=document.createElement('div');el.className='wl '+(o.cls||'');WD.lay.appendChild(el);L={el,h:''};WD.labs.set(o.id,L);}
  if(L.h!==o.h){L.el.innerHTML=o.h;L.h=o.h;}L.el.style.transform=`translate(${o.p[0].toFixed(1)}px,${o.p[1].toFixed(1)}px)`;seen.add(o.id);});
 WD.labs.forEach((L,id)=>{if(!seen.has(id)){L.el.remove();WD.labs.delete(id);}});}
function wHud(){const M=WD.M;if(!M)return;const a=$('#wLoc'),b=$('#wSub'),h=$('#wHome');if(a)a.textContent=M.name;if(b)b.textContent=M.mk?dateName()+' · 修士坊市':M.kind==='town'?dateName()+' · 地铁七号线':M.kind==='abyss'?'层数无尽':M.kind==='rift'?'秘境 · 宝箱里的东西更好':'建议境界 '+zRec(M.z);if(h)h.hidden=M.kind==='town'&&!M.mk;}
function wHudLive(){const a=$('#wHp'),b=$('#wMp');if(a)a.style.width=Math.round((S.hpF??1)*100)+'%';if(b)b.style.width=Math.round((S.mpF??1)*100)+'%';}
function fitCanvasOld(cv,host,target){const r=host.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1);const k=Math.max(2,Math.round(r.width*dpr/target));
 const W=Math.max(60,Math.floor(r.width*dpr/k)),H=Math.max(60,Math.floor(r.height*dpr/k));cv.width=W;cv.height=H;cv.style.width=(W*k/dpr)+'px';cv.style.height=(H*k/dpr)+'px';
 const ox=(r.width-W*k/dpr)/2,oy=(r.height-H*k/dpr)/2;cv.style.left=ox+'px';cv.style.top=oy+'px';return {W,H,k,dpr,ox,oy};}
function wBind(){const host=$('#wv'),cv=$('#wc');if(!host||!cv)return;const f=fitCanvas(cv,host,200);Object.assign(WD,f);WD.cv=cv;WD.cx=cv.getContext('2d');WD.lc=mkCv(f.W,f.H);WD.lx=WD.lc.getContext('2d');WD.labs.forEach(L=>L.el.remove());WD.labs.clear();WD.lay=$('#wlab');
 cv.onpointerdown=e=>{e.preventDefault();const r=cv.getBoundingClientRect();wTap((e.clientX-r.left)/r.width*WD.W,(e.clientY-r.top)/r.height*WD.H);};
 if(!WD.M){S.hpF=1;S.mpF=1;wLoad(buildTown(),[13,5]);}else{wHud();if(WD.P)[WD.cam.x,WD.cam.y]=camGoal();}}

/* ---------- 大地图 ---------- */
const SKYSPOT=[{k:'town',g:'门',n:'回到人间',x:22,y:84},{z:8,g:'星',x:30,y:56},{z:9,g:'庭',x:68,y:42},{z:10,g:'墟',x:48,y:18}];
const TSPOT=[{k:'town',g:'站',n:'青石站',x:34,y:66},{k:'market',g:'市',n:'南街坊市',x:50,y:84},{z:0,g:'铁',x:16,y:52},{z:1,g:'桥',x:42,y:42},{z:2,g:'林',x:16,y:24},{z:3,g:'港',x:80,y:80},{z:4,g:'星',x:78,y:32},{z:5,g:'坑',x:60,y:58},{z:6,g:'源',x:46,y:14},{z:7,g:'渊',x:72,y:10}];
function travelHTML(){const cur=WD.M?(WD.M.mk?'market':WD.M.kind==='town'?'town':WD.M.z):null;const sky=WD.tmode==='sky'&&F('feisheng');
 return `<div class="thead"><b>${sky?'星海':'城区地图'}</b><small>点选地点 · 可上下滑动</small></div>${F('feisheng')?`<button class="btn sm tsky" data-act="tsky">${sky?'人间':'天外'}</button>`:''}<div class="travel-scroll" tabindex="0" aria-label="地图地点，可上下滚动"><div class="travel-map" id="travelMap"><canvas id="tmap"></canvas>${(sky?SKYSPOT:TSPOT).map(s=>{const z=s.k?s.k:s.z,lock=s.k?false:!zoneUnlocked(s.z),nm=s.k?s.n:ZONES[s.z].n,done=!s.k&&S.bossDown.includes(s.z);
  return `<button class="tsp ${lock?'lk':''} ${cur===z?'cur':''} ${done?'dn':''}" data-act="tz" data-arg="${z}" style="left:${s.x}%;top:${s.y}%" ${lock?'disabled':''}><b>${s.g}</b><span>${lock?'未开启':nm}</span></button>`;}).join('')}
  </div></div><div class="travel-actions"><button class="btn gold" data-act="tz" data-arg="market">南街坊市</button>${S.bossDown.length||S.abyss>0?'<button class="btn" data-act="sweep">一键扫荡</button>':''}<button class="btn ghost tclose" data-act="tclose">返回</button></div>`;}
function drawTravel(){const cv=$('#tmap'),host=$('#travelMap');if(!cv||!host)return;const f=fitCanvasPx(cv,host,200),W=f.W,H=f.H,x=cv.getContext('2d'),R=rng(42);
 if(WD.tmode==='sky'&&F('feisheng')){x.fillStyle='#03040c';x.fillRect(0,0,W,H);for(let i=0;i<W*H/14;i++){x.fillStyle=pick2(R,['#dfe8ff','#9ab0ff','#ffd8a8','#c9a8ff']);x.globalAlpha=.2+R()*.8;x.fillRect(Math.floor(R()*W),Math.floor(R()*H),1,1);}x.globalAlpha=1;
  [[.3,.56,'rgba(80,110,220,.35)'],[.68,.42,'rgba(255,230,160,.3)'],[.48,.18,'rgba(255,40,110,.35)']].forEach(([a,b,c])=>{const g=x.createRadialGradient(W*a,H*b,0,W*a,H*b,W*.25);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);});
  x.fillStyle='#3a3a2e';x.beginPath();x.arc(W*.22,H*.84,W*.05,0,6.28);x.fill();x.strokeStyle='#effff8';x.beginPath();x.moveTo(W*.22,H*.8);x.lineTo(W*.3,H*.56);x.stroke();return;}
 x.fillStyle='#1b1d17';x.fillRect(0,0,W,H);for(let i=0;i<W*H/30;i++){x.fillStyle=pick2(R,['#22251e','#171914','#202219']);x.fillRect(Math.floor(R()*W),Math.floor(R()*H),2,1);}
 x.fillStyle='#1e3a48';for(let y=0;y<H;y++){const s=Math.round(W*.68+(H-y)*-.25*W/H+Math.sin(y*.08)*4);if(y>H*.62)x.fillRect(Math.max(0,s),y,W,1);}
 x.fillStyle='#24445a';for(let y=0;y<H;y++){const cx=W*.08+y/H*W*.55+Math.sin(y*.06)*W*.06;x.fillRect(Math.round(cx),y,4,1);}
 for(let i=0;i<70;i++){const bx=Math.floor(R()*W),by=Math.floor(R()*H);if(bx<W*.3&&by<H*.38){x.fillStyle=pick2(R,['#2f5a32','#26502a','#3a6e3c']);x.fillRect(bx,by,3,3);continue;}x.fillStyle=pick2(R,['#3a3c38','#45473f','#2e302b']);x.fillRect(bx,by,3+Math.floor(R()*5),2+Math.floor(R()*4));}
 x.strokeStyle='#4a4a40';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.moveTo(0,Math.round(H*(.2+i*.17)));x.lineTo(W,Math.round(H*(.1+i*.19)));x.stroke();}
 const cr=[W*.6,H*.58];x.fillStyle='#3a1208';x.beginPath();x.arc(cr[0],cr[1],W*.07,0,6.28);x.fill();x.fillStyle='#c8481a';x.beginPath();x.arc(cr[0],cr[1],W*.035,0,6.28);x.fill();
 x.strokeStyle='#effff8';x.lineWidth=1;x.beginPath();let px=W*.38,py=0;x.moveTo(px,py);for(let i=0;i<8;i++){px+=(R()-.3)*8;py+=H*.02;x.lineTo(px,py);}x.stroke();
 const g=x.createRadialGradient(W*.46,H*.08,0,W*.46,H*.08,W*.3);g.addColorStop(0,'rgba(143,214,181,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.5);
 x.strokeStyle='#e3b862';x.setLineDash([3,3]);x.beginPath();const order=['town',0,1,2,3,4,5,6,7];let first=true;order.forEach(k=>{const s=TSPOT.find(t=>(t.k||t.z)===k||(k==='town'&&t.k));if(!s)return;if(k!=='town'&&!zoneUnlocked(k))return;const X=s.x/100*W,Y=s.y/100*H;if(first){x.moveTo(X,Y);first=false;}else x.lineTo(X,Y);});x.stroke();x.setLineDash([]);
 const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=v;x.fillRect(0,0,W,H);}
