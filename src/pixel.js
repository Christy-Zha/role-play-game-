/* ================= 像素素材：调色、角色、妖兽、地砖、物件 ================= */
const PHX=new Map();
function pHx(c){let v=PHX.get(c);if(v)return v;let s=String(c).replace('#','');if(s.length===3)s=[...s].map(x=>x+x).join('');v=[parseInt(s.slice(0,2),16)||0,parseInt(s.slice(2,4),16)||0,parseInt(s.slice(4,6),16)||0];PHX.set(c,v);return v;}
function pRgb(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function pSh(c,k){const [r,g,b]=pHx(c);return k>=0?pRgb(r+(255-r)*k,g+(255-g)*k,b+(255-b)*k):pRgb(r*(1+k),g*(1+k),b*(1+k));}
function pMx(a,b,t){const A=pHx(a),B=pHx(b);return pRgb(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t);}
const OUT='#17110c';
class PX{
 constructor(w,h){this.w=w;this.h=h;this.d=new Array(w*h).fill(0);}
 set(x,y,c){x=Math.round(x);y=Math.round(y);if(!c||x<0||y<0||x>=this.w||y>=this.h)return this;this.d[y*this.w+x]=c;return this;}
 get(x,y){if(x<0||y<0||x>=this.w||y>=this.h)return 0;return this.d[y*this.w+x];}
 clearRect(x,y,w,h){for(let j=Math.max(0,Math.floor(y));j<Math.min(this.h,Math.ceil(y+h));j++)for(let i=Math.max(0,Math.floor(x));i<Math.min(this.w,Math.ceil(x+w));i++)this.d[j*this.w+i]=0;return this;}
 rect(x,y,w,h,c){x=Math.round(x);y=Math.round(y);for(let j=0;j<Math.round(h);j++)for(let i=0;i<Math.round(w);i++)this.set(x+i,y+j,c);return this;}
 ell(cx,cy,rx,ry,c){rx=Math.max(.5,rx);ry=Math.max(.5,ry);for(let y=Math.floor(-ry);y<=Math.ceil(ry);y++)for(let x=Math.floor(-rx);x<=Math.ceil(rx);x++)if((x*x)/(rx*rx+.2)+(y*y)/(ry*ry+.2)<=1)this.set(cx+x,cy+y,c);return this;}
 line(x0,y0,x1,y1,c,t){t=Math.max(1,Math.round(t||1));const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(t>1)this.rect(Math.round(x-(t-1)/2),Math.round(y-(t-1)/2),t,t,c);else this.set(x,y,c);}return this;}
 poly(p,c){let y0=1e9,y1=-1e9;p.forEach(q=>{y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);});
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const xs=[],yy=y+.5;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
   xs.sort((m,n)=>m-n);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++)this.set(x,y,c);}return this;}
 shadeEdges(l,d){l=l??.2;d=d??-.28;const o=this.d.slice(),w=this.w;for(let y=0;y<this.h;y++)for(let x=0;x<w;x++){const c=o[y*w+x];if(!c||c===OUT)continue;
   const up=y>0?o[(y-1)*w+x]:0,dn=y<this.h-1?o[(y+1)*w+x]:0,lf=x>0?o[y*w+x-1]:0,rt=x<w-1?o[y*w+x+1]:0;
   if(!up||!lf)this.d[y*w+x]=pSh(c,l);else if(!dn||!rt)this.d[y*w+x]=pSh(c,d);}return this;}
 outline(c){c=c||OUT;const o=this.d.slice(),w=this.w;for(let y=0;y<this.h;y++)for(let x=0;x<w;x++){if(o[y*w+x])continue;
   if((x>0&&o[y*w+x-1])||(x<w-1&&o[y*w+x+1])||(y>0&&o[(y-1)*w+x])||(y<this.h-1&&o[(y+1)*w+x]))this.d[y*w+x]=c;}return this;}
 canvas(){const cv=mkCv(this.w,this.h),c=cv.getContext('2d'),im=c.createImageData(this.w,this.h);
  for(let i=0;i<this.d.length;i++){const v=this.d[i];if(!v)continue;const [r,g,b]=pHx(v);im.data[i*4]=r;im.data[i*4+1]=g;im.data[i*4+2]=b;im.data[i*4+3]=255;}c.putImageData(im,0,0);return cv;}
}
function pad(g,m){const n=new PX(g.w+m*2,g.h+m*2);for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const v=g.d[y*g.w+x];if(v)n.d[(y+m)*n.w+x+m]=v;}return n;}
function mkCv(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;}
function flipCvPx(src){const c=mkCv(src.width,src.height),x=c.getContext('2d');x.translate(src.width,0);x.scale(-1,1);x.drawImage(src,0,0);return c;}
function whiteCvPx(src){const c=mkCv(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);return c;}
function scaleCv(src,k){const c=mkCv(src.width*k,src.height*k),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,c.width,c.height);return c;}
const _cvc=new Map();function cvMemo(id,f){let v=_cvc.get(id);if(!v){v=f();_cvc.set(id,v);}return v;}

/* ---------- 角色：16×26 模板，正面朝东南、背面朝东北，翻转得另两向 ---------- */
const T_HF=['.....kkkkkk.....','....khhhhhhk....','...khhHHhhhhk...','...khhhhhhhhk...','...khhsssshhk...','...khsssssssk...','...khssessesk...','...khsssssssk...','....ksssmssk....','.....kkkkkk.....'];
const T_HB=['.....kkkkkk.....','....khhhhhhk....','...khhHHhhhhk...','...khhhhhhhhk...','...khhhhhhhhk...','...khhhhhhhhk...','...khhhhhhhhk...','...khhhhhhhsk...','....khhhhhhk....','.....kssssk.....'];
const T_BF=['...krraaaarrk...','..kRrrraarrrRk..','..kRrrrarrrrRk..','..kRrrrrarrrRk..','..kRwwwwwwwwRk..','..kSrrrrrrrrSk..','...krrrrrrrrk...','...kRrrrrrrRk...'];
const T_BB=['...krrrrrrrrk...','..kRrrrrrrrrRk..','..kRrrrrrrrrRk..','..kRrrrrrrrrRk..','..kRwwwwwwwwRk..','..kSrrrrrrrrSk..','...krrrrrrrrk...','...kRrrrrrrRk...'];
const T_LEG=[
 ['....kppkkppk....','....kppkkppk....','....kppkkppk....','....kbbkkbbk....','...kbbbkkbbbk...'],
 ['....kppkkppk....','....kppkkppk....','....kbbkkppk....','...kbbbkkbbk....','........kbbbk...'],
 ['....kppkkppk....','....kppkkppk....','....kppkkbbk....','....kbbkkbbbk...','...kbbbk........']];
const T_GHOST=['...krrrrrrrrk...','....krrrrrrk....','.....krrrrk.....','......kkkk......','................'];
const CH={
 hero_m:{h:'#2a211b',s:'#e8c19a',r:'#5f6152',a:'#5fae8c',w:'#3a3226',p:'#2c2a26',b:'#1e1a16',hair:'short',sword:1},
 hero_f:{h:'#2a211b',s:'#eec7a2',r:'#5f6152',a:'#5fae8c',w:'#3a3226',p:'#2c2a26',b:'#1e1a16',hair:'long',sword:1},
 tie:{h:'#3a3530',s:'#c99a72',r:'#4f4a3c',a:'#7a6440',w:'#2a2420',p:'#2e2a24',b:'#1a1612',hair:'short',band:'#b03a2a',beard:'#4a3e34'},
 he:{h:'#3a2a22',s:'#efc9a4',r:'#d9a441',a:'#c8483a',w:'#a8752a',p:'#3a3a3e',b:'#2a2a2e',hair:'twin',small:1},
 hong:{h:'#8a3226',s:'#ecc39c',r:'#a8352a',a:'#efe7da',w:'#3a2a24',p:'#2a2224',b:'#1a1414',hair:'long',goggles:1},
 zero:{h:'#e6ecef',s:'#f3ebe6',r:'#dfe5ea',a:'#5fe6f5',w:'#9aa8b0',p:'#9aa8b0',b:'#6a7880',hair:'long',e:'#2ab8cc'},
 zhou:{h:'#2e2219',s:'#e3bb94',r:'#2a2c30',a:'#d0542a',w:'#1a1b1e',p:'#1f2024',b:'#121316',hair:'spiky'},
 zhou2:{h:'#2e2219',s:'#d9b896',r:'#e3ddd2',a:'#b08a3a',w:'#b08a3a',p:'#9a9488',b:'#5a564e',hair:'spiky',mask:1},
 tq:{h:'#1a1612',s:'#d9b896',r:'#ebe6dc',a:'#b08a3a',w:'#b08a3a',p:'#a8a294',b:'#6a665c',hair:'bun',mask:1},
 mo:{h:'#f1f6f2',s:'#d6eee3',r:'#9fd3bc',a:'#3f7a62',w:'#3f7a62',p:'#9fd3bc',b:'#9fd3bc',hair:'bun',beard:'#f1f6f2',ghost:1},
 guo:{h:'#9a968c',s:'#d0a47c',r:'#3a4a5a',a:'#e0b83a',w:'#2a2a2a',p:'#2a3038',b:'#1a1a1a',hair:'short',beard:'#9a968c'},
 wang:{h:'#5a4a40',s:'#e0b48c',r:'#8a5a4a',a:'#e8dcc0',w:'#e8dcc0',p:'#3a3430',b:'#2a2420',hair:'bun'},
 corpse:{h:'#2a2a24',s:'#9aa890',r:'#4a5a48',a:'#2e382c',w:'#2e382c',p:'#3a4038',b:'#22261f',hair:'short',e:'#9aff6a'},
 fallen:{h:'#141014',s:'#8a7a86',r:'#2a1a20',a:'#9a2a20',w:'#9a2a20',p:'#1a1418',b:'#0e0a0c',hair:'long',e:'#ff5a3a'}
};
function villager(i){const R=rng(i*131+7);return {id:'v'+i,h:pick2(R,['#2a211b','#4a3a2e','#6a6058','#1a1612','#8a8a84']),s:pick2(R,['#e8c19a','#d8ad86','#c99a72','#efc9a4']),
 r:pick2(R,['#5a6a5a','#6a5a4a','#4a5a6a','#7a6a52','#5a4a5a','#6a6e60']),a:pick2(R,['#8a7a5a','#5a6a7a','#9a5a4a','#c8b48a']),w:'#3a3226',p:pick2(R,['#2c2a26','#3a3a3e','#4a4034']),b:'#1e1a16',hair:pick2(R,['short','short','bun','long'])};}
function chLetters(sp,back,fr){let g=new PX(16,26);const put=(rows,y0)=>rows.forEach((row,j)=>{for(let i=0;i<16;i++){const ch=row[i];if(ch!=='.')g.d[(y0+j)*16+i]=ch;}});
 put(back?T_HB:T_HF,2);put(back?T_BB:T_BF,12);put(sp.ghost?T_GHOST:T_LEG[fr],20);
 const S=(x,y,ch)=>{if(x>=0&&x<16&&y>=0&&y<26)g.d[y*16+x]=ch;};const G=(x,y)=>g.d[y*16+x];
 if(sp.hair==='long'){if(!back){for(let y=6;y<=15;y++){S(2,y,'h');S(1,y,'k');}for(let y=6;y<=11;y++)S(3,y,'h');S(1,16,'k');S(2,16,'k');for(let y=6;y<=9;y++)S(12,y,'h');S(13,7,'k');S(13,8,'k');S(13,9,'k');S(12,10,'k');}
  else{for(let y=11;y<=16;y++)for(let x=4;x<=11;x++)S(x,y,'h');for(let x=4;x<=11;x++)S(x,17,'k');for(let y=11;y<=16;y++){S(3,y,'k');S(12,y,'k');}}}
 if(sp.hair==='bun'){[6,7,8,9].forEach(x=>S(x,0,'k'));S(5,1,'k');S(6,1,'h');S(7,1,'H');S(8,1,'h');S(9,1,'h');S(10,1,'k');}
 if(sp.hair==='twin'){[[0,0],[15,1]].forEach(([b,m])=>{const X=x=>m?15-x:x;S(X(1),3,'k');S(X(2),3,'k');S(X(0),4,'k');S(X(1),4,'h');S(X(2),4,'h');S(X(0),5,'k');S(X(1),5,'h');S(X(2),5,'a');S(X(1),6,'k');S(X(2),6,'k');});}
 if(sp.hair==='spiky'){S(6,0,'k');S(10,0,'k');S(6,1,'h');S(10,1,'h');S(5,1,'k');S(7,1,'k');S(9,1,'k');S(11,1,'k');}
 if(sp.band)for(let x=4;x<=11;x++)if(G(x,5)==='h'||G(x,5)==='H')S(x,5,'n');
 if(sp.goggles){for(let x=4;x<=11;x++)S(x,5,'k');if(!back){S(5,5,'g');S(6,5,'g');S(9,5,'g');S(10,5,'g');}}
 if(sp.beard&&!back){for(let x=5;x<=10;x++){S(x,10,'B');S(x,11,'B');}for(let x=6;x<=9;x++)S(x,12,'B');S(7,13,'B');S(8,13,'B');}
 if(sp.mask&&!back){for(let x=4;x<=11;x++){S(x,7,'W');S(x,8,'W');}S(7,8,'x');S(10,8,'x');S(8,7,'x');}
 if(sp.sword){if(!back){S(1,9,'k');S(2,9,'y');S(2,10,'y');S(1,10,'k');S(2,8,'k');}else{for(let i=0;i<7;i++)S(4+i,17-i,'g');S(12,9,'y');S(13,8,'y');}}
 if(sp.small){const drop=[14,18,21];const n=new PX(16,26-drop.length);let yy=0;for(let y=0;y<26;y++){if(drop.includes(y))continue;for(let x=0;x<16;x++)n.d[yy*16+x]=g.d[y*16+x];yy++;}g=n;}
 return g;}
const CHC=new Map();
function chCanvas(sp,dir,fr){const back=dir>=2,L=chLetters(sp,back,fr);
 const P={k:OUT,h:sp.h,H:pSh(sp.h,.3),s:sp.s,S:sp.s,e:sp.e||'#1a140f',m:pSh(sp.s,-.3),r:sp.r,R:pSh(sp.r,-.3),a:sp.a,w:sp.w,p:sp.p,b:sp.b,n:sp.band||sp.a,g:'#9ad6e6',y:'#d0a84a',B:sp.beard||sp.h,W:'#f2ede4',x:'#d0402a'};
 const g=new PX(L.w,L.h);for(let i=0;i<L.d.length;i++){const ch=L.d[i];if(ch)g.d[i]=P[ch]||ch;}
 for(let y=12;y<20&&y<g.h;y++)for(let x=3;x<6;x++){const v=g.d[y*16+x];if(v===sp.r)g.d[y*16+x]=pSh(sp.r,.12);}
 let c=g.canvas();if(dir===1||dir===3)c=flipCv(c);return c;}
function chSprPx(key,dir,fr){const sp=typeof key==='string'?(CH[key]||CH.tie):key;const id=(typeof key==='string'?key:sp.id)+'|'+dir+'|'+fr;let c=CHC.get(id);if(!c){c=chCanvas(sp,dir,fr);CHC.set(id,c);}return c;}

/* ---------- 妖兽：几何拼形 + 自动描边明暗，朝右 ---------- */
const MONDRAW={
 rat(g,d,X){const c=d.c,c2=d.c2;g.line(X(5),X(22),X(1),X(12),c2,X(1.6));g.ell(X(14),X(21),X(10),X(6.5),c);g.ell(X(15),X(24),X(7),X(2.6),pSh(c,.2));g.ell(X(26),X(19),X(6),X(5),c);
  g.poly([[X(30),X(16)],[X(35),X(20)],[X(30),X(22.5)]],c);g.ell(X(23),X(13),X(2.8),X(2.8),c2);g.rect(X(8),X(26),X(3),X(2),c2);g.rect(X(19),X(26),X(3),X(2),c2);
  if(d.spikes)for(let i=0;i<4;i++)g.poly([[X(6+i*4),X(16)],[X(8+i*4),X(9)],[X(10+i*4),X(16)]],c2);
  if(d.crown)g.poly([[X(20),X(12)],[X(20.5),X(5)],[X(22.5),X(9)],[X(24),X(4)],[X(25.5),X(9)],[X(27.5),X(5)],[X(28),X(12)]],'#d8c070');
  return ()=>{g.ell(X(23),X(13),X(1.1),X(1.1),'#c88a8a');g.ell(X(30),X(18),X(.9),X(.9),d.e);g.set(X(34.5),X(20),'#1a1010');g.set(X(31),X(23),'#f4efe6');g.set(X(32.5),X(23),'#f4efe6');};},
 beast(g,d,X){const c=d.c,c2=d.c2,t=d.tails||1;for(let i=0;i<t;i++){const oy=(i-(t-1)/2)*3.2;g.ell(X(7),X(15+oy),X(6.5),X(2.6),i%2?c2:c);}
  g.rect(X(11),X(22),X(3),X(8),c2);g.rect(X(15),X(22),X(3),X(8),c2);g.ell(X(19),X(19),X(11),X(6),c);g.rect(X(24),X(22),X(3),X(8),c);g.rect(X(28),X(22),X(3),X(8),c);
  g.ell(X(29),X(13),X(5.5),X(5),c);g.poly([[X(32),X(11)],[X(36),X(15)],[X(32),X(17)]],c);g.poly([[X(25),X(10)],[X(26),X(3)],[X(29),X(8)]],c2);g.poly([[X(29),X(9)],[X(31),X(3)],[X(33),X(9)]],c2);
  g.ell(X(27),X(19),X(3),X(3.5),pSh(c,.3));if(d.flame)g.poly([[X(12),X(15)],[X(14),X(5)],[X(17),X(12)],[X(19),X(3)],[X(22),X(12)],[X(24),X(6)],[X(25),X(14)]],'#ff8a3a');
  return ()=>{g.ell(X(31),X(12),X(.9),X(.9),d.e);g.set(X(35.5),X(15),'#1a1010');};},
 flyer(g,d,X){const c=d.c,c2=d.c2,k=d.k;
  if(k==='bat'){g.poly([[X(15),X(13)],[X(2),X(5)],[X(5),X(13)],[X(1),X(21)],[X(9),X(18)],[X(14),X(21)]],c2);g.poly([[X(21),X(13)],[X(34),X(5)],[X(31),X(13)],[X(35),X(21)],[X(27),X(18)],[X(22),X(21)]],c2);
   g.ell(X(18),X(16),X(5),X(6),c);g.poly([[X(14),X(12)],[X(14),X(5)],[X(17),X(10)]],c);g.poly([[X(22),X(12)],[X(22),X(5)],[X(19),X(10)]],c);
   return ()=>{g.set(X(16.5),X(15),d.e);g.set(X(19.5),X(15),d.e);g.set(X(17),X(20),'#f4efe6');g.set(X(19),X(20),'#f4efe6');};}
  if(k==='crow'){g.poly([[X(9),X(17)],[X(1),X(14)],[X(2),X(22)]],c2);g.ell(X(17),X(18),X(9),X(5.5),c);g.ell(X(27),X(14),X(5),X(4.5),c);g.poly([[X(31),X(12.5)],[X(36),X(15)],[X(31),X(16)]],'#6a6058');
   g.poly([[X(10),X(16)],[X(20),X(5)],[X(27),X(15)]],c2);g.line(X(15),X(23),X(14),X(28),'#5a5048');g.line(X(20),X(23),X(21),X(28),'#5a5048');return ()=>{g.ell(X(28),X(13),X(.9),X(.9),d.e);};}
  if(k==='bee'){g.ell(X(14),X(8),X(6),X(4),'#cfe6ee');g.ell(X(21),X(7),X(5),X(3.5),'#e2f2f6');g.ell(X(12),X(19),X(8),X(6),c);[9,13,17].forEach(x=>g.rect(X(x),X(13.5),X(2),X(11),c2));
   g.ell(X(22),X(18),X(5),X(5),c2);g.ell(X(28),X(18),X(4),X(4),c2);g.poly([[X(4),X(18)],[X(0),X(19.5)],[X(4),X(21)]],c2);g.line(X(27),X(14),X(25),X(9),c2);g.line(X(29),X(14),X(31),X(9),c2);
   return ()=>{g.ell(X(29.5),X(17),X(1.3),X(1.3),d.e);};}
  g.poly([[X(3),X(16)],[X(18),X(8)],[X(34),X(16)],[X(18),X(23)]],c);g.line(X(4),X(16),X(1),X(27),c2,X(1.2));g.line(X(10),X(15),X(26),X(15),c2);
  return ()=>{[12,17,22].forEach(x=>g.set(X(x),X(18),d.e));g.set(X(30),X(14),d.e);g.set(X(30),X(17),d.e);};},
 worm(g,d,X){const n=d.big?8:6;let hx=0,hy=0;for(let i=0;i<n;i++){const x=5+i*(21/(n-1)),y=21+Math.sin(i*1.1)*3,r=3.4+i*.25;
   if(d.k==='centi'){g.line(X(x),X(y),X(x-2),X(y+r+4),d.c2);g.line(X(x),X(y),X(x+2),X(y+r+4),d.c2);}g.ell(X(x),X(y),X(r),X(r),i%2?d.c2:d.c);
   if(d.spikes)g.poly([[X(x-1.5),X(y-r+1)],[X(x),X(y-r-4)],[X(x+1.5),X(y-r+1)]],'#c8c8c0');if(d.k==='vine'&&i%2)g.ell(X(x+2),X(y-r-1),X(2.5),X(1.4),'#5aa04a');hx=x;hy=y;}
  if(d.k==='vine'){g.ell(X(hx+4),X(hy-3),X(5.5),X(5),'#3a6a2a');g.poly([[X(hx+8),X(hy-4)],[X(hx+12),X(hy-8)],[X(hx+10),X(hy-1)],[X(hx+12),X(hy+3)],[X(hx+8),X(hy)]],'#c8483a');return ()=>{g.set(X(hx+5),X(hy-5),d.e);};}
  g.poly([[X(hx+3),X(hy-2)],[X(hx+8),X(hy-5)],[X(hx+5),X(hy)]],d.c2);g.poly([[X(hx+3),X(hy+2)],[X(hx+8),X(hy+5)],[X(hx+5),X(hy)]],d.c2);
  return ()=>{g.set(X(hx+1),X(hy-2),d.e);g.set(X(hx+2.5),X(hy-1.5),d.e);};},
 human(g,d,X){const k=d.k;
  if(k==='golem'){g.rect(X(12),X(22),X(4),X(9),d.c2);g.rect(X(20),X(22),X(4),X(9),d.c2);g.rect(X(9),X(10),X(18),X(13),d.c);g.rect(X(4),X(11),X(5),X(13),d.c2);g.rect(X(27),X(11),X(5),X(13),d.c2);g.rect(X(13),X(2),X(10),X(8),d.c2);
   return ()=>{g.rect(X(18),X(5),X(2.2),X(1.6),d.e);g.set(X(12),X(13),'#3a2a1a');g.set(X(24),X(13),'#3a2a1a');g.set(X(12),X(20),'#3a2a1a');g.set(X(24),X(20),'#3a2a1a');};}
  if(k==='mech'){g.rect(X(12),X(23),X(4),X(8),d.c2);g.rect(X(20),X(23),X(4),X(8),d.c2);g.poly([[X(9),X(11)],[X(27),X(11)],[X(25),X(24)],[X(11),X(24)]],d.c);g.rect(X(4),X(12),X(5),X(10),d.c2);g.rect(X(27),X(13),X(8),X(4),d.c2);g.ell(X(18),X(6),X(6),X(5),d.c2);
   return ()=>{g.rect(X(13),X(5),X(10),X(1.6),d.e);g.set(X(35),X(15),'#ff5a4a');};}
  if(k==='rock'){g.poly([[X(9),X(31)],[X(7),X(18)],[X(11),X(7)],[X(20),X(3)],[X(28),X(8)],[X(30),X(20)],[X(27),X(31)]],d.c);g.poly([[X(7),X(14)],[X(1),X(24)],[X(6),X(27)],[X(10),X(19)]],d.c2);g.poly([[X(29),X(14)],[X(35),X(24)],[X(30),X(27)],[X(27),X(19)]],d.c2);
   return ()=>{g.line(X(12),X(12),X(16),X(20),'#ff8a3a');g.line(X(24),X(10),X(21),X(22),'#ff8a3a');g.set(X(15),X(10),d.e);g.set(X(22),X(10),d.e);};}
  if(k==='specimen'){g.line(X(10),X(16),X(3),X(30),d.c,X(2));g.line(X(26),X(16),X(33),X(28),d.c,X(2));g.ell(X(18),X(19),X(8),X(10),d.c);g.ell(X(18),X(7),X(6),X(5.5),d.c);
   return ()=>{g.ell(X(18),X(19),X(3),X(3),d.e);g.set(X(16),X(7),'#111');g.ell(X(21),X(7),X(1.4),X(1.4),'#111');};}
  g.poly([[X(18),X(2)],[X(27),X(10)],[X(28),X(31)],[X(22),X(26)],[X(18),X(31)],[X(14),X(26)],[X(8),X(31)],[X(9),X(10)]],d.c);g.poly([[X(11),X(7)],[X(7),X(0)],[X(14),X(5)]],d.c);g.poly([[X(25),X(7)],[X(29),X(0)],[X(22),X(5)]],d.c);
  g.line(X(9),X(15),X(1),X(10),d.c,X(2));g.line(X(27),X(15),X(35),X(10),d.c,X(2));return ()=>{g.rect(X(13),X(11),X(3),X(1.2),d.e);g.rect(X(20),X(11),X(3),X(1.2),d.e);};},
 ghost(g,d,X){g.ell(X(18),X(13),X(10),X(9.5),d.c);g.rect(X(8),X(13),X(21),X(11),d.c);for(let i=0;i<4;i++)g.poly([[X(8+i*5.25),X(23)],[X(10.6+i*5.25),X(29)],[X(13.2+i*5.25),X(23)]],d.c);
  if(d.k==='drown'){g.line(X(9),X(6),X(7),X(22),d.c2,X(1.5));g.line(X(27),X(6),X(29),X(22),d.c2,X(1.5));}
  return ()=>{if(d.eye){g.ell(X(18),X(13),X(7),X(4.5),'#fff8e6');g.ell(X(18),X(13),X(3),X(3),d.e);g.ell(X(18),X(13),X(1.2),X(1.2),'#1a1408');}
   else{g.ell(X(14),X(12),X(2),X(3),'#0d0d14');g.ell(X(22),X(12),X(2),X(3),'#0d0d14');g.set(X(14),X(12),d.e);g.set(X(22),X(12),d.e);g.rect(X(15),X(19),X(6),X(1.2),'#0d0d14');}
   if(d.k==='em'){g.line(X(4),X(8),X(7),X(14),'#bff4ff');g.line(X(7),X(14),X(4),X(18),'#bff4ff');g.line(X(32),X(8),X(29),X(14),'#bff4ff');g.line(X(29),X(14),X(32),X(18),'#bff4ff');}};},
 crab(g,d,X){for(let i=0;i<3;i++){g.line(X(12-i*2),X(23),X(5-i*2),X(30),d.c2);g.line(X(24+i*2),X(23),X(31+i*2),X(30),d.c2);}
  g.ell(X(18),X(21),X(11),X(6.5),d.c);g.line(X(15),X(16),X(13),X(9),d.c2);g.line(X(21),X(16),X(23),X(9),d.c2);
  g.line(X(9),X(19),X(5),X(13),d.c,X(2));g.ell(X(5),X(10),X(4),X(3.5),d.c);g.poly([[X(2),X(8)],[X(1),X(3)],[X(5),X(7)]],d.c);
  g.line(X(27),X(19),X(31),X(13),d.c,X(2));g.ell(X(31),X(10),X(4),X(3.5),d.c);g.poly([[X(34),X(8)],[X(35),X(3)],[X(31),X(7)]],d.c);g.poly([[X(13),X(20)],[X(18),X(17)],[X(23),X(20)],[X(18),X(24)]],d.c2);
  return ()=>{g.ell(X(13),X(8),X(1.4),X(1.4),d.e);g.ell(X(23),X(8),X(1.4),X(1.4),d.e);};},
 fish(g,d,X){if(d.k==='serpent'){const pts=[[5,27],[10,24],[15,25],[20,23],[23,18],[25,13],[27,10]];pts.forEach(([x,y],i)=>g.ell(X(x),X(y),X(3.6+i*.25),X(3.6+i*.25),i%2?d.c2:d.c));
   g.ell(X(30),X(9),X(5.5),X(4),d.c);g.poly([[X(28),X(6)],[X(26),X(0)],[X(30),X(5)]],'#e8dcb8');g.poly([[X(31),X(6)],[X(32),X(0)],[X(33),X(6)]],'#e8dcb8');g.line(X(34),X(11),X(36),X(16),d.c2);
   return ()=>{g.set(X(31),X(8),d.e);g.set(X(32),X(8),d.e);};}
  g.poly([[X(1),X(10)],[X(8),X(17)],[X(1),X(25)]],d.c2);g.ell(X(19),X(17),X(13),X(6.5),d.c);g.ell(X(20),X(20),X(10),X(3),pSh(d.c,.25));g.poly([[X(14),X(11)],[X(19),X(3)],[X(23),X(11)]],d.c2);g.poly([[X(18),X(22)],[X(22),X(28)],[X(24),X(22)]],d.c2);
  return ()=>{g.set(X(28),X(15),d.e);g.set(X(28),X(16),d.e);for(let i=0;i<3;i++)g.set(X(27+i*2),X(20),'#f4efe6');};},
 tree(g,d,X){g.poly([[X(11),X(31)],[X(14),X(14)],[X(22),X(14)],[X(25),X(31)]],d.c2);g.line(X(13),X(20),X(3),X(14),d.c2,X(2));g.line(X(23),X(20),X(33),X(13),d.c2,X(2));
  g.ell(X(18),X(9),X(11),X(8),d.c);g.ell(X(8),X(12),X(7),X(5.5),d.c);g.ell(X(28),X(11),X(7),X(5.5),d.c);
  return ()=>{g.ell(X(15),X(19),X(1.5),X(2),'#140c08');g.ell(X(21),X(19),X(1.5),X(2),'#140c08');g.set(X(15),X(19),d.e);g.set(X(21),X(19),d.e);g.rect(X(16),X(25),X(4),X(2),'#140c08');for(let i=0;i<5;i++)g.set(X(9+i*4.5),X(6+(i%2)*4),'#d8ff9a');};}
};
const MON_CH={corpse:'corpse',girl:'zero',fallen:'fallen'};
const MCC=new Map();
function monIsHuman(look){const d=LOOK[look]||{};return d.a==='human'&&(!!MON_CH[d.k]||d.k==='cult');}
function monCvPx(look,s,tint){const id=look+'|'+s+'|'+(tint?1:0);let c=MCC.get(id);if(c)return c;let d=LOOK[look]||LOOK['天魔影'];d=Object.assign({},d);if(tint){d.c='#3a2a5a';d.c2='#20163a';d.e='#e0b8ff';}
 if(monIsHuman(look)){const key=d.k==='cult'?(d.mask?'zhou2':'zhou'):MON_CH[d.k];c=chCanvas(CH[key],0,0);MCC.set(id,c);return c;}
 const X=v=>Math.round(v*s);const g=new PX(X(36)+1,X(32)+1);const post=(MONDRAW[d.a]||MONDRAW.ghost)(g,d,X);g.shadeEdges(.22,-.3);if(post)post();
 const g2=trimPX(pad(g,1));g2.outline(OUT);c=g2.canvas();MCC.set(id,c);return c;}
function trimPX(g){let x0=g.w,y0=g.h,x1=-1,y1=-1;for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(g.d[y*g.w+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(x1<0)return g;
 const n=new PX(x1-x0+3,y1-y0+3);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const v=g.d[y*g.w+x];if(v)n.d[(y-y0+1)*n.w+x-x0+1]=v;}return n;}

/* ---------- 等距地砖 32×16 ---------- */
const TL={
 tile:{c:['#4a5550','#46514c','#4e5a54'],pat:'grid',gc:'#323a36'},
 edge:{c:['#4a5550','#46514c'],pat:'stripe'},
 track:{c:['#1e201d','#252722','#1a1c19'],pat:'rail',nw:1},
 gravel:{c:['#2a2d29','#30332e','#262925','#353833'],pat:'speck'},
 rail:{c:['#2a2d29','#30332e'],pat:'rail'},
 puddle:{c:['#1f3330','#24403b','#1c2e2b'],pat:'ripple'},
 asphalt:{c:['#3a3836','#353331','#403d3a'],pat:'crack'},
 asphaltL:{c:['#3a3836','#353331'],pat:'lane'},
 void:{nw:1,none:1,c:['#000']},
 grass:{c:['#2f5a32','#356638','#2a5230','#3a6e3c'],pat:'tuft'},
 moss:{c:['#3a5a3a','#335233','#2e4a30'],pat:'speck'},
 dirt:{c:['#5a4a34','#4e4030','#62513a'],pat:'speck'},
 water:{c:['#1e4a5a','#22556a','#1a4252'],pat:'ripple',nw:1,water:1},
 plank:{c:['#6a5238','#5e4832','#735a3e'],pat:'plank'},
 concrete:{c:['#6a6e6a','#626660','#727670'],pat:'crack'},
 metal:{c:['#4a4e5a','#444854','#50545e'],pat:'plate'},
 hazard:{c:['#4a4e5a','#444854'],pat:'hazard'},
 basalt:{c:['#2e2624','#352b28','#2a2220'],pat:'crack'},
 crackL:{c:['#2e2624','#352b28'],pat:'lava'},
 lava:{c:['#c8481a','#e0641e','#b03a14'],pat:'ripple',nw:1,glow:'rgba(255,120,40,.35)'},
 gold:{c:['#8a6e34','#967a3a','#7e642e'],pat:'speck'},
 goldL:{c:['#8a6e34','#967a3a'],pat:'vein'},
 pstone:{c:['#2e2640','#352c4a','#2a223a'],pat:'rune'},
 altar:{c:['#4a3a3a','#523f3f','#463636'],pat:'ring'}
};
const ZBASE=['gravel','asphalt','grass','plank','metal','basalt','gold','pstone','star','jadeT','ashv'];
function tIns(x,y){return Math.abs(x+.5-16)/16+Math.abs(y+.5-8)/8<=1.001;}
const tp=(u,w)=>[16+16*(u-w),8+8*(u+w)];
function tLine(g,a,b,c){const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),1);for(let i=0;i<=n;i++){const x=Math.round(a[0]+(b[0]-a[0])*i/n),y=Math.round(a[1]+(b[1]-a[1])*i/n);if(tIns(x,y))g.set(x,y,c);}}
const TPAT={
 grid(g,T){for(let y=0;y<16;y++)for(let x=0;x<32;x++){if(!tIns(x,y))continue;const d=Math.abs(x+.5-16)/16+Math.abs(y+.5-8)/8;if(d>.84)g.set(x,y,T.gc);}},
 stripe(g){for(const w of [.3,.36,.42])tLine(g,tp(-.5,w),tp(.5,w),'#c9a23a');tLine(g,tp(-.5,.25),tp(.5,.25),'#323a36');},
 rail(g){for(const u of [-.375,-.125,.125,.375])tLine(g,tp(u,-.32),tp(u,.32),'#3e2e22');for(const w of [-.2,.2]){tLine(g,tp(-.5,w),tp(.5,w),'#8a8a84');const a=tp(-.5,w),b=tp(.5,w);tLine(g,[a[0],a[1]+1],[b[0],b[1]+1],'#4a4a46');}},
 speck(g,T,R){const b=T.c[0];for(let i=0;i<14;i++){const x=Math.floor(R()*32),y=Math.floor(R()*16);if(tIns(x,y))g.set(x,y,pSh(b,R()<.5?.18:-.22));}},
 ripple(g,T,R){const b=T.c[0];for(let i=0;i<5;i++){const x=4+Math.floor(R()*22),y=3+Math.floor(R()*10),l=2+Math.floor(R()*4);for(let j=0;j<l;j++)if(tIns(x+j,y))g.set(x+j,y,pSh(b,.3));}},
 crack(g,T,R){const b=T.c[0];TPAT.speck(g,T,R);if(R()<.6){let x=8+R()*16,y=4+R()*8;for(let i=0;i<9;i++){if(tIns(x,y))g.set(x,y,pSh(b,-.35));x+=R()<.5?1:-1;y+=R()<.6?(R()<.5?1:-1):0;}}},
 lane(g,T,R){TPAT.crack(g,T,R);tLine(g,tp(-.45,0),tp(-.12,0),'#c9b45a');tLine(g,tp(.12,0),tp(.45,0),'#c9b45a');},
 tuft(g,T,R){const b=T.c[0];for(let i=0;i<8;i++){const x=2+Math.floor(R()*28),y=2+Math.floor(R()*12);if(!tIns(x,y))continue;g.set(x,y,pSh(b,.28));g.set(x-1,y-1,pSh(b,.2));g.set(x+1,y-1,pSh(b,.35));}
  if(R()<.3){const x=6+Math.floor(R()*20),y=5+Math.floor(R()*6);if(tIns(x,y))g.set(x,y,R()<.5?'#e8d870':'#e89a9a');}},
 plank(g,T,R){for(const w of [-.25,0,.25])tLine(g,tp(-.5,w),tp(.5,w),pSh(T.c[0],-.35));for(let i=0;i<3;i++){const p=tp(-.4+R()*.8,-.37+Math.floor(R()*4)*.25);if(tIns(p[0],p[1]))g.set(p[0],p[1],'#a89070');}},
 plate(g,T){const d=pSh(T.c[0],-.3);tLine(g,tp(-.5,0),tp(.5,0),d);tLine(g,tp(0,-.5),tp(0,.5),d);[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([u,w])=>{const p=tp(u,w);g.set(p[0],p[1],pSh(T.c[0],.35));});},
 hazard(g){for(let y=0;y<16;y++)for(let x=0;x<32;x++){if(!tIns(x,y))continue;const a=(x+.5-16)/16,b=(y+.5-8)/8,u=(a+b)/2,w=(b-a)/2;if(Math.abs(w)<.18)g.set(x,y,Math.floor((u+1)*7)%2?'#c9a23a':'#2a2a2a');}},
 lava(g,T,R){TPAT.speck(g,T,R);let x=6+R()*6,y=6+R()*4;for(let i=0;i<14;i++){if(tIns(x,y)){g.set(x,y,'#e0641e');if(i%3===0&&tIns(x,y+1))g.set(x,y+1,'#ffb04a');}x+=1;y+=R()<.5?(R()<.5?1:-1):0;}},
 vein(g,T,R){TPAT.speck(g,T,R);let x=4+R()*10,y=4+R()*8;for(let i=0;i<12;i++){if(tIns(x,y))g.set(x,y,'#e8c870');x+=1;y+=R()<.4?(R()<.5?1:-1):0;}},
 rune(g,T,R){TPAT.speck(g,T,R);if(R()<.5)for(let y=0;y<16;y++)for(let x=0;x<32;x++){if(!tIns(x,y))continue;const a=(x+.5-16)/16,b=(y+.5-8)/8,u=(a+b)/2,w=(b-a)/2;const r=Math.hypot(u,w);if(Math.abs(r-.3)<.035)g.set(x,y,'#6a4aa8');}},
 ring(g){for(let y=0;y<16;y++)for(let x=0;x<32;x++){if(!tIns(x,y))continue;const a=(x+.5-16)/16,b=(y+.5-8)/8,u=(a+b)/2,w=(b-a)/2;const r=Math.max(Math.abs(u),Math.abs(w));if(Math.abs(r-.3)<.04)g.set(x,y,'#8a5a3a');}},
 crackBig(g,T,R){const d=pSh(T.c[0],-.45);for(let k=0;k<4;k++){let x=16,y=8;const a=R()*6.28;for(let i=0;i<9;i++){x+=Math.cos(a)*1.4+(R()-.5);y+=Math.sin(a)*.7+(R()-.5)*.6;if(tIns(x,y))g.set(x,y,d);}}}
};
const TCC=new Map();
function tileCvPx(type,v){const id=type+'|'+v;let cv=TCC.get(id);if(cv)return cv;const T=TL[type]||TL.tile;const g=new PX(32,16);const R=rng(v*97+type.length*31+type.charCodeAt(0)*7+1);
 if(!T.none){for(let y=0;y<16;y++)for(let x=0;x<32;x+=2){const col=T.c[Math.floor(R()*T.c.length)];if(tIns(x,y))g.set(x,y,col);if(tIns(x+1,y))g.set(x+1,y,col);}
  (TPAT[T.pat]||(()=>{}))(g,T,R,v);
  const o=g.d.slice();for(let y=0;y<16;y++)for(let x=0;x<32;x++){const c=o[y*32+x];if(!c)continue;if(!tIns(x,y-1))g.d[y*32+x]=pSh(c,.12);else if(!tIns(x,y+1))g.d[y*32+x]=pSh(c,-.28);}}
 cv=g.canvas();TCC.set(id,cv);return cv;}
function trapType(z){const base=z<0?'tile':ZBASE[z];const k='trap'+z;if(!TL[k])TL[k]={c:TL[base].c,pat:'crackBig'};return k;}
const FCC=new Map();
function faceCvPx(type,side){const id=type+'|'+side;let cv=FCC.get(id);if(cv)return cv;const T=TL[type]||TL.tile;const D=11,g=new PX(32,16+D),b=T.c[0];
 const L=side==='L';const c1=pSh(b,L?-.42:-.58),c2=pSh(b,L?-.55:-.68);
 g.poly(L?[[0,8],[16,16],[16,16+D],[0,8+D]]:[[16,16],[32,8],[32,8+D],[16,16+D]],c1);
 for(let k=4;k<D;k+=4){const a=L?[0,8+k]:[16,16+k],e=L?[16,16+k]:[32,8+k];g.line(a[0],a[1],e[0],e[1],c2);}
 cv=g.canvas();FCC.set(id,cv);return cv;}

/* ---------- 场景物件 ---------- */
const ZPAL=[
 {rock:['#4a4c48','#3a3c38'],green:['#3a4a3a','#44543f'],cry:'#8fd6b5'},
 {rock:['#5a5048','#4a4038'],green:['#4a5a3a','#56683f'],cry:'#e0a060'},
 {rock:['#5a625a','#4a524a'],green:['#2f5a32','#3a6e3c','#4a823e','#26502a'],cry:'#cdf5a8'},
 {rock:['#6a6e6a','#525652'],green:['#3a5a4a','#46664f'],cry:'#9ad6e6'},
 {rock:['#4a4a58','#3a3a48'],green:['#3a4a4a','#435454'],cry:'#7ff0ff'},
 {rock:['#4a3430','#3a2824'],green:['#4a3a2a','#56442e'],cry:'#ff6a3a'},
 {rock:['#7a6430','#5e4c26'],green:['#a8904a','#b89c50'],cry:'#ffe08a'},
 {rock:['#3a2e52','#2a2240'],green:['#4a3a6a','#56447a'],cry:'#c9a0f0'}
];
const fL=(cx,by,hw,h,u,v)=>[cx-hw+u*hw,by-h+u*hw/2+v*h];
const fR=(cx,by,hw,h,u,v)=>[cx+u*hw,by-h+hw/2-u*hw/2+v*h];
function facePoly(g,F,cx,by,hw,h,u0,u1,v0,v1,col){g.poly([F(cx,by,hw,h,u0,v0),F(cx,by,hw,h,u1,v0),F(cx,by,hw,h,u1,v1),F(cx,by,hw,h,u0,v1)],col);}
function isoBox(g,cx,by,hw,h,top,l,r,noLine){const hh=hw/2;
 g.poly([[cx-hw,by-h],[cx,by-h+hh],[cx,by+hh],[cx-hw,by]],l);g.poly([[cx,by-h+hh],[cx+hw,by-h],[cx+hw,by],[cx,by+hh]],r);g.poly([[cx-hw,by-h],[cx,by-h-hh],[cx+hw,by-h],[cx,by-h+hh]],top);
 if(noLine)return;const lc=OUT;g.line(cx-hw,by-h,cx-hw,by,lc);g.line(cx+hw-1,by-h,cx+hw-1,by,lc);g.line(cx-hw,by,cx,by+hh,lc);g.line(cx,by+hh,cx+hw-1,by,lc);g.line(cx-hw,by-h,cx,by-h-hh,lc);g.line(cx,by-h-hh,cx+hw-1,by-h,lc);
 g.line(cx,by-h+hh,cx,by+hh,pSh(r,-.35));g.line(cx-hw+1,by-h,cx,by-h+hh,pSh(top,.15));g.line(cx,by-h+hh,cx+hw-1,by-h,pSh(top,-.1));}
const PR={
 wall:{h:64,f(g,R,P,cx,by,v){isoBox(g,cx,by,16,46,'#1e2420','#3e4842','#2e3632');for(const vv of [.28,.56,.84]){g.line(...fL(cx,by,16,46,0,vv),...fL(cx,by,16,46,1,vv),'#36403a');g.line(...fR(cx,by,16,46,0,vv),...fR(cx,by,16,46,1,vv),'#283029');}
   if(v%2===0)facePoly(g,fL,cx,by,16,46,.25+R()*.3,.55+R()*.3,.3,.52,pick2(R,['#8a3a2a','#c8b48a','#3a5a7a','#d9a441']));if(v%3===0)facePoly(g,fR,cx,by,16,46,.3,.6,.32,.55,pick2(R,['#8a3a2a','#c8b48a','#5a7a5a']));}},
 walllamp:{h:64,f(g,R,P,cx,by,v){PR.wall.f(g,R,P,cx,by,1);g.rect(cx-9,by-40,4,2,'#2a2a2a');g.rect(cx-9,by-38,4,2,'#ffe0a0');g.rect(cx+6,by-40,4,2,'#2a2a2a');g.rect(cx+6,by-38,4,2,'#ffe0a0');},light:{rad:62,col:'rgba(255,190,110,.32)',h:36}},
 vent:{h:64,f(g,R,P,cx,by){PR.wall.f(g,R,P,cx,by,1);facePoly(g,fR,cx,by,16,46,.2,.8,.4,1,'#060807');for(let u=.28;u<.8;u+=.12)g.line(...fR(cx,by,16,46,u,.42),...fR(cx,by,16,46,u,.98),'#4a5a52');},light:{rad:40,col:'rgba(143,214,181,.25)',h:12}},
 wallM:{h:64,f(g,R,P,cx,by){isoBox(g,cx,by,16,46,'#22242e','#3e4250','#2c2f3a');for(const vv of [.3,.7]){g.line(...fL(cx,by,16,46,0,vv),...fL(cx,by,16,46,1,vv),'#5fe6f5');g.line(...fR(cx,by,16,46,0,vv),...fR(cx,by,16,46,1,vv),'#3a9aa8');}}},
 wallT:{h:64,f(g,R,P,cx,by){isoBox(g,cx,by,16,46,'#151816','#2e3430','#232825');for(let i=0;i<10;i++)g.set(...fL(cx,by,16,46,R(),R()),'#3a443e');g.line(...fL(cx,by,16,46,0,.7),...fL(cx,by,16,46,1,.7),'#4a3a2a');}},
 pillar:{h:84,f(g,R,P,cx,by){isoBox(g,cx,by,10,6,'#8a7a3a','#c9a23a','#8a6e24');isoBox(g,cx,by-6,9,50,'#6a766e','#55625a','#3e4a43');isoBox(g,cx,by-56,12,6,'#76827a','#5e6a62','#46524a');for(let i=0;i<8;i++)g.set(cx-8+R()*7,by-44+R()*34,'#3a443e');}},
 pillarM:{h:84,f(g,R,P,cx,by){isoBox(g,cx,by-0,9,56,'#4a4e5a','#3a3e4a','#2a2e38');g.line(...fL(cx,by,9,56,.5,0),...fL(cx,by,9,56,.5,1),'#5fe6f5');}},
 tent:{h:44,f(g,R,P,cx,by,v){const c=['#5a4a36','#3e5048','#6a3e32','#4a4e5a'][v%4];const A=[cx,by-24],L=[cx-14,by],B=[cx,by+7],Rr=[cx+14,by];g.poly([A,L,B],c);g.poly([A,B,Rr],pSh(c,-.3));g.poly([[cx-3,by+4],[cx-7,by+2],[cx-5,by-7]],'#16120e');g.line(A[0],A[1],L[0],L[1],OUT);g.line(A[0],A[1],B[0],B[1],OUT);g.line(A[0],A[1],Rr[0],Rr[1],OUT);g.line(L[0],L[1],B[0],B[1],OUT);g.line(B[0],B[1],Rr[0],Rr[1],OUT);g.line(cx,by-24,cx,by-28,'#6a5a40');}},
 stall:{h:60,f(g,R,P,cx,by){isoBox(g,cx,by,14,12,'#6a5236','#5a4430','#40301f');g.line(cx-13,by-12,cx-13,by-34,'#2a2018',2);g.line(cx+12,by-12,cx+12,by-34,'#2a2018',2);
   isoBox(g,cx,by-34,15,3,'#e8dcc0','#c8483a','#8a2a20');for(let u=.1;u<1;u+=.4)facePoly(g,fL,cx,by-34,15,3,u,u+.2,0,1,'#e8dcc0');g.ell(cx,by-14,5,2,'#2a2a2e');g.rect(cx-5,by-18,10,4,'#3a3a3e');g.rect(cx-4,by-19,8,1,'#c8b48a');},light:{rad:46,col:'rgba(255,170,90,.28)',h:20}},
 board:{h:52,f(g,R,P,cx,by){g.rect(cx-11,by-30,2,30,'#3a2a18');g.rect(cx+9,by-30,2,30,'#3a2a18');g.rect(cx-13,by-36,26,17,'#7a5a34');g.rect(cx-13,by-36,26,1,'#4a3420');g.rect(cx-13,by-20,26,1,'#4a3420');
   for(let i=0;i<7;i++){const x=cx-11+Math.floor(R()*18),y=by-34+Math.floor(R()*9);g.rect(x,y,5,4,pick2(R,['#e8e0cc','#f0e6b0','#d8e0e8']));g.set(x+2,y,'#c8483a');}}},
 gen:{h:44,f(g,R,P,cx,by){isoBox(g,cx,by,11,14,'#5a6258','#465046','#323a30');facePoly(g,fL,cx,by,11,14,.2,.7,.2,.6,'#2a2e28');g.set(...fL(cx,by,11,14,.75,.3),'#8fd6b5');g.rect(cx+5,by-28,2,12,'#3a3a3a');}},
 fireS:{h:22,blocks:false,f(g,R,P,cx,by){for(let i=0;i<8;i++){const a=i/8*6.28;g.ell(cx+Math.cos(a)*8,by+Math.sin(a)*4,2,1.5,'#5a5450');}g.line(cx-5,by+1,cx+5,by-2,'#4a3020',2);g.line(cx-4,by-2,cx+5,by+2,'#3a2418',2);},light:{rad:80,col:'rgba(255,150,60,.38)',h:8},fire:1},
 stairs:{h:64,f(g,R,P,cx,by){for(let i=0;i<5;i++)isoBox(g,cx-8+i*4,by+4-i*2,9,6+i*6,'#7a7e74','#5d6157','#45493f');g.line(cx-17,by-10,cx+9,by-42,'#9a9a8e');g.line(cx-17,by-10,cx-17,by-2,'#9a9a8e');},light:{rad:70,col:'rgba(255,240,200,.35)',h:36}},
 truck:{h:62,w:64,f(g,R,P,cx,by){isoBox(g,cx,by,16,24,'#7a2e26','#6a2a22','#4e1e18');isoBox(g,cx+15,by+7,10,16,'#8a3a2a','#7a3226','#5a241c');facePoly(g,fL,cx+15,by+7,10,16,.2,.8,.12,.45,'#8fc6d6');
   g.line(...fL(cx,by,16,24,.2,.25),...fL(cx,by,16,24,.5,.55),'#e3b862',2);g.line(...fL(cx,by,16,24,.5,.55),...fL(cx,by,16,24,.8,.25),'#e3b862',2);g.ell(cx-9,by+3,3,3,'#1a1714');g.ell(cx+20,by+12,3,3,'#1a1714');g.line(cx-4,by-34,cx-4,by-24,'#3a3a3a');g.poly([[cx-4,by-34],[cx+5,by-31],[cx-4,by-28]],'#cf4a3c');}},
 train:{h:50,f(g,R,P,cx,by,v){const c=v%2?'#8a9a86':'#9aa894';isoBox(g,cx,by,16,26,pSh(c,.15),pSh(c,-.1),pSh(c,-.35));facePoly(g,fL,cx,by,16,26,0,1,.58,.68,'#3f8a6d');
   for(const u of [.08,.4,.72])facePoly(g,fL,cx,by,16,26,u,u+.2,.14,.46,'#16201e');for(let i=0;i<6;i++)g.set(...fL(cx,by,16,26,R(),.7+R()*.3),'#7a4a2a');}},
 crate:{h:30,f(g,R,P,cx,by){isoBox(g,cx,by,8,11,'#9a7a4a','#86683c','#644c2a');g.line(...fL(cx,by,8,11,0,0),...fL(cx,by,8,11,1,1),'#5a4224');g.line(...fL(cx,by,8,11,1,0),...fL(cx,by,8,11,0,1),'#5a4224');}},
 barrel:{h:30,f(g,R,P,cx,by,v){const c=['#8a4a2a','#3a5a7a','#5a6a3a','#7a6a3a'][v%4];g.rect(cx-5,by-14,10,14,c);g.rect(cx-5,by-14,2,14,pSh(c,.2));g.rect(cx+3,by-14,2,14,pSh(c,-.3));g.ell(cx,by-14,5,2,pSh(c,.25));g.rect(cx-5,by-10,10,1,pSh(c,-.4));g.rect(cx-5,by-4,10,1,pSh(c,-.4));},organic:1},
 rubble:{h:26,blocks:true,f(g,R,P,cx,by){for(let i=0;i<5;i++)g.ell(cx-8+R()*16,by-3-R()*6,2+R()*3,1.5+R()*2,pick2(R,P.rock));g.line(cx-4,by-6,cx-7,by-14,'#8a5a3a');g.line(cx+3,by-4,cx+6,by-12,'#8a5a3a');},organic:1},
 rock:{h:34,f(g,R,P,cx,by){const n=9,pts=[];for(let i=0;i<n;i++){const a=i/n*6.28,rr=.7+R()*.4;pts.push([cx+Math.cos(a)*10*rr,by-7+Math.sin(a)*8*rr]);}g.poly(pts,P.rock[0]);for(let i=0;i<4;i++)g.set(cx-6+R()*12,by-10+R()*8,P.rock[1]);},organic:1},
 car:{h:34,f(g,R,P,cx,by,v){const c=['#6a3a2a','#3a4a5a','#5a5a4a','#7a5a2a'][v%4];isoBox(g,cx,by,14,8,pSh(c,.1),c,pSh(c,-.35));isoBox(g,cx-2,by-8,9,7,'#2a3034','#1e2428','#161a1c');g.ell(cx-9,by+1,2.5,2.5,'#141414');g.ell(cx+9,by+1,2.5,2.5,'#141414');for(let i=0;i<5;i++)g.set(...fL(cx,by,14,8,R(),R()),'#8a5a2a');}},
 barrier:{h:26,f(g,R,P,cx,by){isoBox(g,cx,by,13,9,'#b8b8b0','#9a9a94','#76766e');for(const u of [.1,.45,.8])facePoly(g,fL,cx,by,13,9,u,u+.14,.2,.8,'#c8483a');}},
 ruin:{h:104,f(g,R,P,cx,by){const ht=50+Math.floor(R()*36);isoBox(g,cx,by,15,ht,'#4a4440','#5a524a','#3e3832');
   for(let v=.08;v<.85;v+=.14)for(let u=.12;u<.85;u+=.3){facePoly(g,fL,cx,by,15,ht,u,u+.16,v,v+.07,R()<.08?'#d8b060':'#151a1c');facePoly(g,fR,cx,by,15,ht,u,u+.16,v,v+.07,R()<.05?'#c8a050':'#101416');}
   for(let x=0;x<g.w;x++){const cut=by-ht-8+Math.floor(R()*14);g.clearRect(x,0,1,cut);}g.line(cx-6,by-ht+2,cx-8,by-ht-6,'#8a5a3a');}},
 sign:{h:64,f(g,R,P,cx,by){g.rect(cx-1,by-40,2,40,'#6a6a64');g.rect(cx-12,by-50,22,12,'#2e6a4a');g.rect(cx-12,by-50,22,1,'#e8e8e0');g.rect(cx-12,by-39,22,1,'#e8e8e0');for(let i=0;i<5;i++)g.rect(cx-9+i*4,by-46,2,4,'#e8e8e0');}},
 tree:{h:74,f(g,R,P,cx,by){g.rect(cx-3,by-26,6,26,'#3a2a1e');g.rect(cx-3,by-26,2,26,'#4a3826');const G=P.green;g.ell(cx,by-40,13,11,G[0]);g.ell(cx-9,by-32,9,8,G[1%G.length]);g.ell(cx+9,by-33,9,8,G[0]);g.ell(cx+1,by-52,9,8,G[(2)%G.length]);for(let i=0;i<10;i++)g.set(cx-10+R()*20,by-56+R()*28,pSh(G[0],.3));},organic:1},
 bush:{h:28,f(g,R,P,cx,by){const G=P.green;g.ell(cx-5,by-5,7,5,G[0]);g.ell(cx+5,by-6,8,6,G[1%G.length]);g.ell(cx,by-10,6,5,G[0]);if(R()<.4)g.set(cx-2,by-9,'#e88a8a');},organic:1},
 stele:{h:46,f(g,R,P,cx,by){isoBox(g,cx,by,6,28,'#7a7e76','#62665e','#464a42');for(let v=.2;v<.9;v+=.15)g.line(...fL(cx,by,6,28,.25,v),...fL(cx,by,6,28,.75,v),'#3a3e36');for(let i=0;i<5;i++)g.set(...fL(cx,by,6,28,R(),.8+R()*.2),'#4a7a3e');}},
 container:{h:46,f(g,R,P,cx,by,v){const c=['#8a3a2a','#2a5a8a','#3a6a3a','#a8782a'][v%4];isoBox(g,cx,by,15,24,pSh(c,.12),c,pSh(c,-.3));for(let u=.1;u<.95;u+=.12){g.line(...fL(cx,by,15,24,u,.05),...fL(cx,by,15,24,u,.95),pSh(c,-.2));g.line(...fR(cx,by,15,24,u,.05),...fR(cx,by,15,24,u,.95),pSh(c,-.45));}}},
 bollard:{h:26,f(g,R,P,cx,by){g.rect(cx-3,by-12,6,12,'#3a3a3a');g.rect(cx-3,by-12,2,12,'#5a5a5a');g.ell(cx,by-12,3,1.5,'#6a6a6a');g.line(cx+3,by-9,cx+12,by-2,'#a89070');},organic:1},
 boat:{h:30,f(g,R,P,cx,by){g.poly([[cx-15,by-7],[cx+15,by-11],[cx+12,by-1],[cx-12,by+2]],'#6a4a2a');g.poly([[cx-12,by-6],[cx+12,by-9],[cx+10,by-4],[cx-10,by-2]],'#3a2a1a');g.line(cx,by-8,cx,by-24,'#4a3a2a');},organic:1},
 rack:{h:58,f(g,R,P,cx,by){isoBox(g,cx,by,8,38,'#2a2c34','#22242c','#1a1c22');for(let i=0;i<12;i++)g.set(...fL(cx,by,8,38,.2+R()*.6,.08+R()*.8),pick2(R,['#5fe68a','#ff5a4a','#5fe6f5']));}},
 tank:{h:62,f(g,R,P,cx,by){isoBox(g,cx,by,9,6,'#5a5e6a','#4a4e5a','#3a3e48');g.rect(cx-7,by-44,14,38,'#4aa8b4');g.rect(cx+3,by-44,4,38,'#3a8a96');g.ell(cx,by-26,4,9,'#2a6a74');g.ell(cx,by-36,3,3,'#2a6a74');g.line(cx-5,by-42,cx-5,by-10,'#bff4ff');g.ell(cx,by-44,7,3,'#5a5e6a');},light:{rad:46,col:'rgba(120,240,255,.28)',h:26},organic:1},
 crystal:{h:48,f(g,R,P,cx,by){const C=P.cry;[[-6,22,2.5],[0,34,3.5],[6,26,3],[-2,16,2.5]].forEach(([dx,ht,w],i)=>g.poly([[cx+dx-w,by-2],[cx+dx+(i%2?1:-1),by-2-ht],[cx+dx+w,by-2]],i%2?pSh(C,-.25):C));},light:{rad:56,col:'',h:18},organic:1},
 floatrock:{h:58,f(g,R,P,cx,by){g.ell(cx,by,8,3,'#0a0806');g.poly([[cx-12,by-28],[cx+12,by-28],[cx+5,by-14],[cx,by-8],[cx-6,by-15]],P.rock[0]);g.ell(cx,by-28,12,4,P.green[0]);g.ell(cx-3,by-29,5,2,pSh(P.green[0],.25));},organic:1},
 chest:{h:28,f(g,R,P,cx,by){isoBox(g,cx,by,7,8,'#8a5a2a','#7a4e24','#5a3a1a');isoBox(g,cx,by-8,7,3,'#a87036','#8a5a2a','#6a4420');g.line(...fL(cx,by-8,7,3,0,1),...fL(cx,by-8,7,3,1,1),'#e3b862');g.set(...fL(cx,by,7,8,.55,.35),'#ffe08a');}},
 chestO:{h:30,blocks:true,f(g,R,P,cx,by){isoBox(g,cx,by,7,8,'#2a1a0a','#7a4e24','#5a3a1a');isoBox(g,cx+3,by-12,7,2,'#a87036','#8a5a2a','#6a4420');g.set(cx-1,by-9,'#ffd870');g.set(cx+2,by-9,'#ffd870');}},
 lamp:{h:72,f(g,R,P,cx,by){g.line(cx,by,cx,by-48,'#3a3a3a',2);g.line(cx,by-48,cx+6,by-50,'#3a3a3a');g.rect(cx+4,by-50,6,3,'#ffe8b0');},light:{rad:70,col:'rgba(255,220,150,.3)',h:48}}
};
const PCC=new Map();
function propCvPx(type,v,z){const zi=z<0?0:Math.min(ZPAL.length-1,z);const id=type+'|'+v+'|'+zi;let o=PCC.get(id);if(o)return o;const D=PR[type]||PR.rock;const W=D.w||48,H=D.h,cx=24,by=H-10;
 let g=new PX(W,H);D.f(g,rng(v*53+type.length*17+zi*7+3),ZPAL[zi],cx,by,v);if(D.organic){g.shadeEdges(.2,-.3);g=pad(g,1);g.outline(OUT);}
 const cv=g.canvas();o={cv,ax:cx+(D.organic?1:0),ay:by+(D.organic?1:0),w:cv.width,h:cv.height,tall:H>46};PCC.set(id,o);return o;}
function shadowCvPx(w){return cvMemo('sh'+w,()=>{const g=new PX(w,Math.max(3,Math.round(w/3)));g.ell(w/2-.5,g.h/2-.5,w/2-.5,g.h/2-.5,'#000');return g.canvas();});}
