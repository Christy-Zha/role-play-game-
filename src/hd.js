/* ================= 国风手绘：矢量重绘地砖、物件、人物、妖兽 ================= */
const HR=5;
function hdCv(w,h,R){const c=mkCv(Math.ceil(w*R),Math.ceil(h*R));c.ww=w;c.hh=h;const x=c.getContext('2d');x.scale(R,R);x.lineCap='round';x.lineJoin='round';return [c,x];}
const dw=c=>c.ww||c.width,dh=c=>c.hh||c.height;
function rgba(h,a){const [r,g,b]=pHx(h);return `rgba(${r},${g},${b},${a})`;}
/* 描边：沿轮廓外扩一圈墨色，再叠一层上亮下暗 */
function inkPost(c,R,o){o=o||{};const w=c.width,h=c.height,t=mkCv(w,h),tx=t.getContext('2d');tx.drawImage(c,0,0);
 const sil=mkCv(w,h),sx=sil.getContext('2d');sx.drawImage(c,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle=o.ink||'rgba(23,17,12,.9)';sx.fillRect(0,0,w,h);
 const x=c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);const d=(o.wd||.55)*R;
 for(let i=0;i<12;i++){const a=i/12*6.283;x.drawImage(sil,Math.cos(a)*d,Math.sin(a)*d);}
 x.drawImage(t,0,0);
 if(o.shade!==false){x.globalCompositeOperation='source-atop';const g=x.createLinearGradient(0,0,w*.4,h);g.addColorStop(0,'rgba(255,248,230,.22)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,6,20,.28)');x.fillStyle=g;x.fillRect(0,0,w,h);}
 x.restore();return c;}
function cropCv(c){const w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(x1<0)return c;
 const R=w/c.ww,pd=2*R;x0=Math.max(0,x0-pd);y0=Math.max(0,y0-pd);x1=Math.min(w-1,x1+pd);y1=Math.min(h-1,y1+pd);const n=mkCv(x1-x0+1,y1-y0+1);n.getContext('2d').drawImage(c,-x0,-y0);n.ww=n.width/R;n.hh=n.height/R;return n;}
/* 与 PX 同接口的矢量画板 */
class VX{constructor(w,h,R){this.w=w;this.h=h;this.R=R||HR;[this.c,this.x]=hdCv(w,h,this.R);this.ol=false;this.sh=false;}
 set(x,y,c){if(!c)return this;this.x.fillStyle=c;this.x.beginPath();this.x.arc(x+.5,y+.5,.62,0,6.283);this.x.fill();return this;}
 get(){return 0;}
 clearRect(x,y,w,h){this.x.clearRect(x,y,w,h);return this;}
 rect(x,y,w,h,c){if(!c)return this;this.x.fillStyle=c;this.x.fillRect(x,y,w,h);return this;}
 ell(cx,cy,rx,ry,c){if(!c)return this;this.x.fillStyle=c;this.x.beginPath();this.x.ellipse(cx+.5,cy+.5,Math.max(.5,rx+.3),Math.max(.5,ry+.3),0,0,6.283);this.x.fill();return this;}
 line(x0,y0,x1,y1,c,t){if(!c)return this;this.x.strokeStyle=c;this.x.lineWidth=Math.max(1,t||1);this.x.beginPath();this.x.moveTo(x0+.5,y0+.5);this.x.lineTo(x1+.5,y1+.5);this.x.stroke();return this;}
 poly(p,c){if(!c)return this;this.x.fillStyle=c;this.x.beginPath();p.forEach((q,i)=>i?this.x.lineTo(q[0],q[1]):this.x.moveTo(q[0],q[1]));this.x.closePath();this.x.fill();return this;}
 shadeEdges(){this.sh=true;return this;}outline(){this.ol=true;return this;}
 canvas(){if(this.ol)inkPost(this.c,this.R,{shade:this.sh});return this.c;}}
/* ---------- 地砖 ---------- */
function dPath(x){x.beginPath();x.moveTo(16,0);x.lineTo(32,8);x.lineTo(16,16);x.lineTo(0,8);x.closePath();}
const HTC=new Map();
function tileCv(type,v){const id=type+'|'+v;let cv=HTC.get(id);if(cv)return cv;const T=TL[type]||TL.tile;const [c,x]=hdCv(32,16,HR);if(T.none){HTC.set(id,c);return c;}
 const R=rng(v*97+type.length*31+type.charCodeAt(0)*7+1),b=T.c[v%T.c.length],b0=T.c[0];
 x.save();dPath(x);x.clip();let g=x.createLinearGradient(0,0,0,16);g.addColorStop(0,pSh(b,.1));g.addColorStop(1,pSh(b,-.14));x.fillStyle=g;x.fillRect(0,0,32,16);
 for(let i=0;i<10;i++){x.fillStyle=rgba(R()<.5?pSh(b0,.25):pSh(b0,-.3),.22);x.beginPath();x.ellipse(R()*32,R()*16,1.5+R()*3,.8+R()*1.6,0,0,6.283);x.fill();}
 const P=T.pat,line=(col,w,a)=>{x.strokeStyle=col;x.lineWidth=w;x.globalAlpha=a;},crack=(col)=>{line(col,.45,.6);x.beginPath();let px=6+R()*20,py=4+R()*8;x.moveTo(px,py);for(let i=0;i<4;i++){px+=(R()-.3)*5;py+=(R()-.5)*3;x.lineTo(px,py);}x.stroke();x.globalAlpha=1;};
 if(P==='grid'){line(T.gc||pSh(b0,-.4),.5,.7);x.beginPath();x.moveTo(16,1.4);x.lineTo(29.2,8);x.lineTo(16,14.6);x.lineTo(2.8,8);x.closePath();x.stroke();x.globalAlpha=1;}
 if(P==='speck'||P==='crack'||P==='lane'){for(let i=0;i<8;i++){x.fillStyle=rgba(pSh(b0,R()<.5?.3:-.35),.5);x.beginPath();x.arc(R()*32,R()*16,.35+R()*.5,0,6.283);x.fill();}}
 if(P==='crack'||P==='lane'||P==='crackBig')if(R()<.7||P==='crackBig')crack(pSh(b0,-.5));
 if(P==='crackBig'){crack(pSh(b0,-.6));crack(pSh(b0,-.6));}
 if(P==='lane'){line('#d9c46a',.7,.7);x.setLineDash([3,2.5]);x.beginPath();x.moveTo(6,5);x.lineTo(26,11);x.stroke();x.setLineDash([]);x.globalAlpha=1;}
 if(P==='stripe'){line('#c9a23a',1.4,.9);x.beginPath();x.moveTo(0,11);x.lineTo(16,3);x.stroke();line('#323a36',.6,.8);x.beginPath();x.moveTo(1,12.5);x.lineTo(17,4.5);x.stroke();x.globalAlpha=1;}
 if(P==='rail'){line('#4a3626',1.3,.9);for(const u of [-.375,-.125,.125,.375]){const a=tp(u,-.34),e=tp(u,.34);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.stroke();}line('#9a9a92',.8,.95);for(const w of [-.2,.2]){const a=tp(-.5,w),e=tp(.5,w);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.stroke();}x.globalAlpha=1;}
 if(P==='ripple'){line(pSh(b0,.45),.45,.55);for(let i=0;i<3;i++){const yy=3+((i*5+v*1.6)%11),xx=6+((i*9+v*3)%18);x.beginPath();x.moveTo(xx,yy);x.quadraticCurveTo(xx+3,yy-1.2,xx+6,yy);x.stroke();}x.globalAlpha=1;
  const s=x.createRadialGradient(12,5,0,12,5,12);s.addColorStop(0,'rgba(255,255,255,.14)');s.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=s;x.fillRect(0,0,32,16);}
 if(P==='tuft'){for(let i=0;i<9;i++){const gx=3+R()*26,gy=2+R()*12;line(pSh(b0,.35+R()*.2),.45,.85);x.beginPath();x.moveTo(gx,gy);x.quadraticCurveTo(gx+.5,gy-1.4,gx+1.2,gy-2.4);x.moveTo(gx+.8,gy);x.quadraticCurveTo(gx+1,gy-1,gx+2,gy-1.6);x.stroke();}x.globalAlpha=1;
  if(R()<.35){x.fillStyle=R()<.5?'#f0e08a':'#f0a8b8';x.beginPath();x.arc(6+R()*20,5+R()*6,.8,0,6.283);x.fill();}}
 if(P==='plank'){line(pSh(b0,-.4),.5,.8);for(const w of [-.25,0,.25]){const a=tp(-.5,w),e=tp(.5,w);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.stroke();}x.globalAlpha=1;}
 if(P==='plate'){line(pSh(b0,-.35),.5,.8);x.beginPath();let a=tp(-.5,0),e=tp(.5,0);x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);a=tp(0,-.5);e=tp(0,.5);x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.stroke();x.globalAlpha=1;
  [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([u,w])=>{const p=tp(u,w);x.fillStyle=pSh(b0,.4);x.beginPath();x.arc(p[0],p[1],.5,0,6.283);x.fill();});}
 if(P==='hazard'){for(let i=-4;i<10;i++){x.fillStyle=i%2?'#c9a23a':'#2a2a2a';x.beginPath();const a=tp(i/8-.5,-.18),e=tp(i/8-.5+.125,-.18),f=tp(i/8-.5+.125,.18),h=tp(i/8-.5,.18);x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.lineTo(f[0],f[1]);x.lineTo(h[0],h[1]);x.fill();}}
 if(P==='lava'||P==='vein'){const col=P==='lava'?'#ff8a2a':'#f0d070';x.shadowColor=col;x.shadowBlur=3;line(col,.7,.9);x.beginPath();let px=4+R()*8,py=5+R()*6;x.moveTo(px,py);for(let i=0;i<5;i++){px+=3+R()*2;py+=(R()-.5)*3;x.lineTo(px,py);}x.stroke();x.shadowBlur=0;x.globalAlpha=1;}
 if(P==='rune'&&R()<.5){x.shadowColor='#a07aff';x.shadowBlur=3;line('#8a6ad0',.5,.8);x.beginPath();x.ellipse(16,8,6,3,0,0,6.283);x.stroke();x.shadowBlur=0;x.globalAlpha=1;}
 if(P==='ring'){line('#9a6a44',.7,.8);x.beginPath();x.ellipse(16,8,7,3.5,0,0,6.283);x.stroke();x.globalAlpha=1;}
 x.restore();x.lineWidth=.6;x.strokeStyle='rgba(255,250,235,.18)';x.beginPath();x.moveTo(.4,8);x.lineTo(16,.3);x.lineTo(31.6,8);x.stroke();x.strokeStyle='rgba(0,0,0,.25)';x.beginPath();x.moveTo(.4,8);x.lineTo(16,15.7);x.lineTo(31.6,8);x.stroke();
 if(T.glow){x.globalCompositeOperation='lighter';const gg=x.createRadialGradient(16,8,0,16,8,14);gg.addColorStop(0,'rgba(255,140,60,.35)');gg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gg;dPath(x);x.fill();x.globalCompositeOperation='source-over';}
 HTC.set(id,c);return c;}
const HFC=new Map();
function faceCv(type,side){const id=type+'|'+side;let cv=HFC.get(id);if(cv)return cv;const T=TL[type]||TL.tile,D=11,b=T.c[0],L=side==='L';const [c,x]=hdCv(32,16+D,HR);
 const p=L?[[0,8],[16,16],[16,16+D],[0,8+D]]:[[16,16],[32,8],[32,8+D],[16,16+D]];x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();
 const g=x.createLinearGradient(0,8,0,16+D);g.addColorStop(0,pSh(b,L?-.35:-.5));g.addColorStop(1,pSh(b,-.8));x.fillStyle=g;x.fill();x.save();x.clip();x.strokeStyle=rgba(pSh(b,-.7),.6);x.lineWidth=.5;
 for(let k=3.5;k<D;k+=3.5){const a=L?[0,8+k]:[16,16+k],e=L?[16,16+k]:[32,8+k];x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(e[0],e[1]);x.stroke();}x.restore();HFC.set(id,c);return c;}
/* ---------- 物件 ---------- */
const HPC=new Map();
function propCv(type,v,z){const zi=z<0?0:Math.min(ZPAL.length-1,z);const id=type+'|'+v+'|'+zi;let o=HPC.get(id);if(o)return o;const D=PR[type]||PR.rock;const W=D.w||48,H=D.h,cx=D.cx||24,by=H-10;
 const g=new VX(W,H,HR);D.f(g,rng(v*53+type.length*17+zi*7+3),ZPAL[zi],cx,by,v);inkPost(g.c,HR,{wd:.4,shade:true,ink:'rgba(20,14,10,.75)'});
 o={cv:g.c,ax:cx,ay:by,w:W,h:H,tall:H>46};HPC.set(id,o);return o;}
function shadowCv(w){return cvMemo('hsh'+w,()=>{const h=Math.max(3,w/3),[c,x]=hdCv(w,h,4);const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.save();x.scale(1,h/w);x.beginPath();x.arc(w/2,w/2,w/2,0,6.283);x.restore();x.fill();return c;});}
function flipCv(src){const c=mkCv(src.width,src.height),x=c.getContext('2d');x.translate(src.width,0);x.scale(-1,1);x.drawImage(src,0,0);c.ww=src.ww;c.hh=src.hh;return c;}
function whiteCv(src){const c=mkCv(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);c.ww=src.ww;c.hh=src.hh;return c;}
/* ---------- 人物：大头小身的手绘小人 ---------- */
function chibi(sp,dir,fr,R,sitting){const back=dir>=2,[c,x]=hdCv(20,32,R);const sc=sp.small?.84:1;x.translate(10,31);x.scale(sc,sc);x.translate(-10,-31);
 const grad=(col,y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,pSh(col,.14));g.addColorStop(1,pSh(col,-.22));return g;};
 const sw=fr===1?1:fr===2?-1:0;
 if(!sp.ghost&&!sitting){[[8,sw],[12,-sw]].forEach(([lx,s])=>{x.fillStyle=sp.p;x.beginPath();x.roundRect(lx-1.4+s*.4,23,2.8,5.4-Math.abs(s)*.4,1);x.fill();x.fillStyle=sp.b;x.beginPath();x.ellipse(lx+s*.5,28.6-Math.max(0,s)*.5,1.8,1,0,0,6.283);x.fill();});}
 if(sp.hair==='long'&&!back){x.fillStyle=grad(sp.h,6,22);x.beginPath();x.moveTo(4.4,9);x.quadraticCurveTo(3,17,4.6,22);x.lineTo(15.4,22);x.quadraticCurveTo(17,17,15.6,9);x.closePath();x.fill();}
 x.fillStyle=grad(sp.r,14,25);x.beginPath();if(sp.ghost){x.moveTo(6.8,14.5);x.lineTo(13.2,14.5);x.quadraticCurveTo(16,22,13,28);x.quadraticCurveTo(11.5,25,10,28.5);x.quadraticCurveTo(8.5,25,7,28);x.quadraticCurveTo(4,22,6.8,14.5);}
 else{x.moveTo(6.6,14.6);x.lineTo(13.4,14.6);x.quadraticCurveTo(15,19,15.4,24.6);x.quadraticCurveTo(10,25.8,4.6,24.6);x.quadraticCurveTo(5,19,6.6,14.6);}x.fill();
 x.fillStyle=sp.a;x.fillRect(5.6,19.2,8.8,1.3);if(!back){x.strokeStyle=sp.a;x.lineWidth=.9;x.beginPath();x.moveTo(7.6,14.8);x.lineTo(10,17.6);x.lineTo(12.4,14.8);x.stroke();}
 if(sitting){
  x.fillStyle=grad(sp.p,23,29);x.beginPath();x.ellipse(7.6,26,5.6,2.6,-.18,0,6.283);x.ellipse(12.4,26,5.6,2.6,.18,0,6.283);x.fill();
  x.strokeStyle=pSh(sp.p,.2);x.lineWidth=.45;x.beginPath();x.moveTo(5,26);x.quadraticCurveTo(10,24.8,15,27);x.stroke();
  x.fillStyle=grad(sp.r,16,24);for(const [ax,angle] of [[5.6,-.55],[14.4,.55]]){x.beginPath();x.ellipse(ax,19.6,1.8,3.3,angle,0,6.283);x.fill();}
  x.fillStyle=sp.s;[8.8,11.2].forEach(ax=>{x.beginPath();x.ellipse(ax,22,1.6,.9,0,0,6.283);x.fill();});
 }else{[[5.2,-sw],[14.8,sw]].forEach(([ax,s])=>{x.fillStyle=pSh(sp.r,-.12);x.beginPath();x.ellipse(ax,18+s*.4,1.5,3.2,s*.25,0,6.283);x.fill();x.fillStyle=sp.s;x.beginPath();x.arc(ax,21.2+s*.4,1.05,0,6.283);x.fill();});}
 if(sp.sword&&!sitting){x.strokeStyle='#dfe8ea';x.lineWidth=.8;x.beginPath();x.moveTo(back?6:14,back?20:22);x.lineTo(back?14:18,back?6:13);x.stroke();x.strokeStyle='#c9a23a';x.lineWidth=1.2;x.beginPath();x.moveTo(back?7.2:14.6,back?18.6:20.6);x.lineTo(back?8.6:15.6,back?17.8:20.2);x.stroke();}
 x.fillStyle=(()=>{const g=x.createRadialGradient(8.6,7.6,1,10,9.4,7);g.addColorStop(0,pSh(sp.s,.12));g.addColorStop(1,pSh(sp.s,-.12));return g;})();x.beginPath();x.arc(10,9.4,6.2,0,6.283);x.fill();
 const hg=grad(sp.h,2,15);x.fillStyle=hg;
 if(back){x.beginPath();x.arc(10,9.2,6.5,0,6.283);x.fill();if(sp.hair==='long'){x.beginPath();x.moveTo(4.2,9);x.quadraticCurveTo(3.6,18,6,21);x.lineTo(14,21);x.quadraticCurveTo(16.4,18,15.8,9);x.fill();}}
 else{x.beginPath();x.moveTo(3.6,10.2);x.quadraticCurveTo(3,2.2,10,2.6);x.quadraticCurveTo(17,2.2,16.4,10.2);x.quadraticCurveTo(14.5,6.4,12.6,6.8);x.quadraticCurveTo(11,8.4,8.8,6.6);x.quadraticCurveTo(6.4,7.6,5.4,6.8);x.quadraticCurveTo(4.6,8.2,3.6,10.2);x.fill();}
 if(sp.hair==='bun'){x.beginPath();x.arc(10,2.4,2.5,0,6.283);x.fill();x.fillStyle=sp.a;x.fillRect(7.8,3.4,4.4,.7);x.fillStyle=hg;}
 if(sp.hair==='twin'){x.beginPath();x.arc(4.2,4.6,2.3,0,6.283);x.arc(15.8,4.6,2.3,0,6.283);x.fill();}
 if(sp.hair==='spiky'){x.beginPath();x.moveTo(5,5);x.lineTo(6,.4);x.lineTo(8,3.6);x.lineTo(10,-.4);x.lineTo(12,3.6);x.lineTo(14,.4);x.lineTo(15,5);x.fill();}
 if(sp.band){x.fillStyle=sp.band;x.fillRect(3.8,5.4,12.4,1.2);}
 if(!back){if(sitting){x.strokeStyle=sp.e||'#241a14';x.lineWidth=.55;[8,12].forEach(ex=>{x.beginPath();x.moveTo(ex-1,10.4);x.quadraticCurveTo(ex,11.2,ex+1,10.4);x.stroke();});}
  else{x.fillStyle=sp.e||'#241a14';[8,12].forEach(ex=>{x.beginPath();x.ellipse(ex,10.4,.75,1.05,0,0,6.283);x.fill();});x.fillStyle='#fff';[8.25,12.25].forEach(ex=>{x.beginPath();x.arc(ex,10,.28,0,6.283);x.fill();});}
  x.fillStyle='rgba(240,140,140,.35)';[6.6,13.4].forEach(ex=>{x.beginPath();x.ellipse(ex,12,1,.55,0,0,6.283);x.fill();});
  if(sp.goggles){x.fillStyle='#2a2a2a';x.fillRect(4,5,12,1.4);x.fillStyle='#9ad6e6';x.beginPath();x.arc(7.6,5.7,1.1,0,6.283);x.arc(12.4,5.7,1.1,0,6.283);x.fill();}
  if(sp.beard){x.fillStyle=sp.beard;x.beginPath();x.moveTo(7,12.6);x.quadraticCurveTo(10,18.5,13,12.6);x.quadraticCurveTo(10,14,7,12.6);x.fill();}
  if(sp.mask){x.fillStyle='#f2ede4';x.beginPath();x.roundRect(4.4,8.6,11.2,3.4,1.4);x.fill();x.fillStyle='#c0402a';x.beginPath();x.arc(10,10.3,.8,0,6.283);x.fill();}}
 inkPost(c,R,{wd:.42,shade:false});return c;}
function chSpr(key,dir,fr,R){R=R||HR;const sp=typeof key==='string'?(CH[key]||CH.tie):key;const id=(typeof key==='string'?key:sp.id)+'|'+dir+'|'+fr+'|'+R;return cvMemo('ch|'+id,()=>{let c=chibi(sp,dir,fr,R);if(dir===1||dir===3)c=flipCv(c);return c;});}
/* ---------- 妖兽 ---------- */
function monCv(look,s,tint,R){R=R||HR;return cvMemo('mon|'+look+'|'+s+'|'+(tint?1:0)+'|'+R,()=>{let d=LOOK[look]||LOOK['天魔影'];d=Object.assign({},d);if(tint){d.c='#3a2a5a';d.c2='#20163a';d.e='#e0b8ff';}
 if(monIsHuman(look)){const key=d.k==='cult'?(d.mask?'zhou2':'zhou'):MON_CH[d.k];const cc=chibi(CH[key],0,0,R*s*1.15);cc.ww*=s*1.15;cc.hh*=s*1.15;return cc;}
 const X=v=>v*s,g=new VX(X(36)+2,X(32)+2,R);const post=(MONDRAW[d.a]||MONDRAW.ghost)(g,d,X);if(post)post();inkPost(g.c,R,{wd:.5,shade:true});
 return cropCv(g.c);});}
/* ---------- 画布：按设备像素渲染，世界坐标缩放 ---------- */
function fitCanvas(cv,host,target){const r=host.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1);const z=Math.max(1.5,Math.min(2.8,r.width/(target||200)));
 cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cv.style.width=r.width+'px';cv.style.height=r.height+'px';cv.style.left='0px';cv.style.top='0px';
 const k=z*dpr,x=cv.getContext('2d');x.setTransform(k,0,0,k,0,0);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';return {W:r.width/z,H:r.height/z,k,dpr,ox:0,oy:0};}
function fitCanvasPx(cv,host,target){const r=host.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1);const k=Math.max(2,Math.round(r.width*dpr/target));
 const W=Math.max(60,Math.floor(r.width*dpr/k)),H=Math.max(60,Math.floor(r.height*dpr/k));cv.width=W;cv.height=H;cv.style.width=(W*k/dpr)+'px';cv.style.height=(H*k/dpr)+'px';
 const ox=(r.width-W*k/dpr)/2,oy=(r.height-H*k/dpr)/2;cv.style.left=ox+'px';cv.style.top=oy+'px';return {W,H,k,dpr,ox,oy};}
