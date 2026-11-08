/* ================= 画风升级：仙侠绘景、修长人物、插画素材接口 ================= */
/* ---------- 绘景小工具 ---------- */
function softBlob(c,x,y,rx,ry,col,a){const g=c.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));g.addColorStop(0,col.replace('A',a));g.addColorStop(.6,col.replace('A',a*.55));g.addColorStop(1,col.replace('A',0));c.save();c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,6.283);c.fill();c.restore();}
function cloudSea(c,w,h,y,R,col,dense){const n=dense||40;for(let i=0;i<n;i++){const x=R()*w*1.2-w*.1,yy=y+R()*h*.08-h*.02,rx=w*(.08+R()*.14);softBlob(c,x,yy,rx,rx*.42,col,.55+R()*.4);}
 c.fillStyle=lg(c,0,y,0,h,[[0,col.replace('A',0)],[.25,col.replace('A',.85)],[1,col.replace('A',1)]]);c.fillRect(0,y,w,h-y);}
function peak(c,x,base,bw,ph,top,bot,R,o){o=o||{};const L=[],Rt=[];const n=7;for(let i=0;i<=n;i++){const t=i/n,yy=base-ph*t,wi=bw/2*(1-t*.78)*(1+(R()-.5)*.25);L.push([x-wi+(R()-.5)*bw*.06,yy]);Rt.push([x+wi+(R()-.5)*bw*.06,yy]);}
 c.beginPath();c.moveTo(L[0][0],base);L.forEach(p=>c.lineTo(p[0],p[1]));const tx=x+(R()-.5)*bw*.1;c.quadraticCurveTo(tx-bw*.06,base-ph-bw*.08,tx+bw*.05,base-ph-bw*.02);for(let i=n;i>=0;i--)c.lineTo(Rt[i][0],Rt[i][1]);c.closePath();
 const g=c.createLinearGradient(0,base-ph,0,base);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fill();
 c.save();c.clip();const sh=c.createLinearGradient(x-bw/2,0,x+bw/2,0);sh.addColorStop(0,'rgba(255,255,255,'+(o.lit||.12)+')');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');c.fillStyle=sh;c.fillRect(x-bw,base-ph-bw,bw*2,ph+bw*2);
 c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;for(let i=0;i<14;i++){const yy=base-ph*R(),xx=x+(R()-.5)*bw*.7;c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+(R()-.5)*8,yy+8,xx+(R()-.5)*6,yy+14+R()*20);c.stroke();}c.restore();
 if(o.pine)for(let i=0;i<o.pine;i++){const k=R();const p=k<.5?L[Math.floor(R()*n)]:Rt[Math.floor(R()*n)];pine(c,p[0],p[1],ph*.06*(.6+R()*.6),R,o.pc);}}
function pine(c,x,y,s,R,col){col=col||'#1e3a2c';c.strokeStyle='#2a2018';c.lineWidth=Math.max(1,s*.12);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*.3,y-s*.6,x-s*.2,y-s*1.3);c.stroke();
 for(let i=0;i<4;i++){const yy=y-s*(.5+i*.25),xx=x+(i%2?-1:1)*s*(.15+R()*.2);c.fillStyle=i===3?pSh(col,.15):col;c.beginPath();c.ellipse(xx,yy,s*(.75-i*.12),s*.16,(R()-.5)*.3,0,6.283);c.fill();c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.ellipse(xx-s*.1,yy-s*.05,s*(.5-i*.1),s*.06,0,0,6.283);c.fill();}}
function eave(c,x,y,w,h,col,curl){c.fillStyle=col;c.beginPath();c.moveTo(x-w/2-curl,y-curl*.7);c.quadraticCurveTo(x-w/2,y+h*.15,x-w*.3,y);c.quadraticCurveTo(x,y-h*1.2,x+w*.3,y);c.quadraticCurveTo(x+w/2,y+h*.15,x+w/2+curl,y-curl*.7);c.lineTo(x+w/2+curl*.4,y+h*.25);c.quadraticCurveTo(x,y+h*.1,x-w/2-curl*.4,y+h*.25);c.closePath();c.fill();}
function pagoda(c,x,y,s,tiers,o){o=o||{};const roof=o.roof||'#2a2c38',wall=o.wall||'#6a3a2a',lit=o.lit||'#ffcf7a';let yy=y;for(let i=0;i<tiers;i++){const bw=s*(1-i*.13),bh=s*.42;c.fillStyle=wall;c.fillRect(x-bw*.36,yy-bh,bw*.72,bh);
  c.fillStyle=lit;for(let k=-1;k<=1;k++){c.globalAlpha=.75;c.fillRect(x+k*bw*.2-bw*.04,yy-bh*.72,bw*.08,bh*.4);}c.globalAlpha=1;eave(c,x,yy-bh,bw*1.05,bh*.5,roof,bw*.12);if(o.gold){c.strokeStyle='rgba(255,215,120,.7)';c.lineWidth=1;c.beginPath();c.moveTo(x-bw*.5,yy-bh+bh*.08);c.quadraticCurveTo(x,yy-bh-bh*.2,x+bw*.5,yy-bh+bh*.08);c.stroke();}yy-=bh*1.05;}
 c.strokeStyle=o.gold?'#e8c060':'#3a3440';c.lineWidth=Math.max(1,s*.04);c.beginPath();c.moveTo(x,yy);c.lineTo(x,yy-s*.35);c.stroke();}
function hall(c,x,y,s,o){o=o||{};c.fillStyle='#8a8478';c.fillRect(x-s*.7,y-s*.08,s*1.4,s*.08);c.fillStyle=o.wall||'#7a3226';c.fillRect(x-s*.5,y-s*.42,s,s*.34);c.fillStyle='#ffcf7a';c.globalAlpha=.7;for(let k=-2;k<=2;k++)c.fillRect(x+k*s*.18-s*.04,y-s*.36,s*.08,s*.2);c.globalAlpha=1;
 eave(c,x,y-s*.42,s*1.25,s*.3,o.roof||'#2a2c38',s*.12);eave(c,x,y-s*.68,s*.8,s*.22,o.roof||'#2a2c38',s*.1);if(o.gold){c.fillStyle='#e8c060';c.fillRect(x-s*.04,y-s*.9,s*.08,s*.1);}}
function floatIsle(c,x,y,w,R,o){o=o||{};const h=w*(.7+R()*.4);c.beginPath();c.moveTo(x-w/2,y);let px=x-w/2;for(let i=1;i<=8;i++){const t=i/8;px=x-w/2+w*t;c.lineTo(px,y+h*Math.sin(t*3.14)*(.6+R()*.4)*(t>.3&&t<.7?1.2:.8));}c.closePath();
 const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,o.rock||'#6a6478');g.addColorStop(1,o.rock2||'#2a2438');c.fillStyle=g;c.fill();c.fillStyle=o.grass||'#5a8a4a';c.beginPath();c.ellipse(x,y,w/2,w*.08,0,0,6.283);c.fill();
 c.fillStyle='rgba(255,255,255,.1)';c.beginPath();c.ellipse(x-w*.1,y-w*.02,w*.3,w*.03,0,0,6.283);c.fill();c.strokeStyle='rgba(40,60,40,.6)';c.lineWidth=1;for(let i=0;i<5;i++){const vx=x+(R()-.5)*w*.6;c.beginPath();c.moveTo(vx,y+2);c.quadraticCurveTo(vx+3,y+h*.3,vx-2,y+h*(.3+R()*.4));c.stroke();}}
function rays(c,x,y,w,h,col,n,R){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const a=-.5+R()*1,ww=w*(.03+R()*.06);c.fillStyle=lg(c,0,y,0,y+h,[[0,col.replace('A',.35)],[1,col.replace('A',0)]]);c.beginPath();c.moveTo(x-ww*.2,y);c.lineTo(x+ww*.2,y);c.lineTo(x+Math.sin(a)*h+ww,y+h);c.lineTo(x+Math.sin(a)*h-ww,y+h);c.closePath();c.fill();}c.restore();}
function crane(c,x,y,s,fl){c.save();c.translate(x,y);if(fl)c.scale(-1,1);c.fillStyle='#f4f2ec';c.beginPath();c.ellipse(0,0,s,s*.3,-.2,0,6.283);c.fill();c.beginPath();c.moveTo(-s*.3,0);c.quadraticCurveTo(-s*.8,-s*1.2,-s*1.8,-s*.9);c.quadraticCurveTo(-s,-s*.3,-s*.1,s*.1);c.fill();
 c.beginPath();c.moveTo(s*.2,-s*.1);c.quadraticCurveTo(s*.6,-s*1.1,s*1.5,-s*1.3);c.quadraticCurveTo(s*.8,-s*.4,s*.3,s*.15);c.fill();c.strokeStyle='#f4f2ec';c.lineWidth=Math.max(1,s*.12);c.beginPath();c.moveTo(s*.8,-s*.1);c.lineTo(s*1.7,-s*.35);c.stroke();c.fillStyle='#c8322a';c.beginPath();c.arc(s*1.7,-s*.38,s*.1,0,6.283);c.fill();c.strokeStyle='#222';c.beginPath();c.moveTo(-s*.9,s*.1);c.lineTo(-s*1.6,s*.25);c.stroke();c.restore();}
function boltPath(c,x0,y0,x1,y1,R,branch){c.beginPath();c.moveTo(x0,y0);const n=14;let px=x0,py=y0;for(let i=1;i<=n;i++){const t=i/n;px=x0+(x1-x0)*t+(i<n?(R()-.5)*40:0);py=y0+(y1-y0)*t;c.lineTo(px,py);if(branch&&R()<.25){const bx=px,by=py;c.moveTo(bx,by);c.lineTo(bx+(R()-.5)*60,by+30+R()*30);c.moveTo(px,py);}}c.stroke();}
function lightning(c,x0,y0,x1,y1,R,col){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=col||'rgba(190,150,255,.5)';c.lineWidth=2.6;c.shadowColor='#b48aff';c.shadowBlur=12;boltPath(c,x0,y0,x1,y1,rng(Math.floor(R()*1e6)),1);c.strokeStyle='rgba(240,230,255,.95)';c.lineWidth=.9;c.shadowBlur=4;boltPath(c,x0,y0,x1,y1,rng(Math.floor(R()*1e6)),0);c.restore();}

/* ---------- 新场景 ---------- */
SCN.xianshan=function(c,w,h,R){skyG(c,w,h,'#6a9ad8','#eef0f6','#b8cfee');rays(c,w*.5,0,w,h*.8,'rgba(255,250,225,A)',9,R);glow(c,w*.5,0,h*.6,'rgba(255,248,220,.6)');
 for(let i=0;i<10;i++)softBlob(c,R()*w,h*(.15+R()*.25),w*(.1+R()*.15),w*.05,'rgba(255,255,255,A)',.7);
 [[.18,.2,.07],[.62,.14,.05],[.85,.28,.06],[.4,.3,.05]].forEach(([a,b,s])=>{floatIsle(c,w*a,h*b,w*s*2,R,{rock:'#8a8aa8',rock2:'rgba(90,80,120,.4)',grass:'#7aa06a'});pagoda(c,w*a,h*b,w*s*.6,3,{roof:'#3a3a52',wall:'#7a4a3a'});});
 peak(c,w*.72,h*.72,w*.3,h*.55,'#d8d0c0','#5a5470',R,{lit:.3,pine:6,pc:'#4a6a3a'});hall(c,w*.7,h*.32,w*.18,{gold:1,roof:'#b8902a',wall:'#8a3a2a'});pagoda(c,w*.58,h*.36,w*.06,3,{gold:1,roof:'#b8902a'});
 c.fillStyle='#e8c060';c.globalAlpha=.5;for(let i=0;i<8;i++){c.beginPath();c.ellipse(w*(.6+R()*.2),h*(.34+R()*.08),w*.025,w*.012,0,0,6.283);c.fill();}c.globalAlpha=1;
 const wf=c.createLinearGradient(0,h*.45,0,h*.85);wf.addColorStop(0,'rgba(200,240,255,.9)');wf.addColorStop(1,'rgba(160,140,255,.2)');c.fillStyle=wf;c.beginPath();c.moveTo(w*.6,h*.46);c.quadraticCurveTo(w*.61,h*.6,w*.6,h*.85);c.lineTo(w*.66,h*.85);c.quadraticCurveTo(w*.66,h*.6,w*.64,h*.46);c.fill();
 cloudSea(c,w,h,h*.7,R,'rgba(236,238,248,A)',50);
 c.strokeStyle='#d8d4c8';c.lineWidth=h*.012;c.beginPath();c.moveTo(-w*.05,h*.86);c.quadraticCurveTo(w*.25,h*.55,w*.6,h*.6);c.stroke();c.strokeStyle='#a8a498';c.lineWidth=h*.004;c.beginPath();c.moveTo(-w*.05,h*.84);c.quadraticCurveTo(w*.25,h*.53,w*.6,h*.585);c.stroke();
 for(let i=0;i<5;i++){const t=.2+i*.15,bx=w*(t*.62),by=h*(.86-(.86-.6)*Math.sin(t*3.14*.9));c.strokeStyle='rgba(120,116,104,.8)';c.lineWidth=2;c.beginPath();c.arc(bx,by+h*.06,h*.04,3.14,0);c.stroke();}
 pagoda(c,w*.06,h*1.02,w*.24,2,{roof:'#22222e',wall:'#3a2a26'});motes(c,w,h,40,'#fff8d8',R,1.6,h*.2,h);vign(c,w,h,.3);};
SCN.leijie=function(c,w,h,R){skyG(c,w,h,'#18142a','#8a8898','#4a4660');for(let i=0;i<34;i++)softBlob(c,R()*w,h*R()*.45,w*(.12+R()*.2),w*.06,pick2(R,['rgba(30,26,44,A)','rgba(56,50,72,A)','rgba(80,74,96,A)']),.85);
 glow(c,w*.35,h*.25,h*.3,'rgba(255,220,160,.18)');
 for(let k=0;k<3;k++){const col=['#6a6a7c','#585868','#46465a'][k];for(let i=0;i<4;i++){peak(c,w*(R()*.3+(i<2?0:.7)),h*(.66+k*.03),w*(.14+R()*.1),h*(.25+R()*.18),col,'rgba(80,80,96,.1)',R,{pine:k===2?3:0,pc:'#2a3a30'});}}
 pagoda(c,w*.86,h*.46,w*.07,5,{roof:'#2a2a38',wall:'#5a3a32'});hall(c,w*.76,h*.5,w*.12,{roof:'#2a2a38'});pagoda(c,w*.94,h*.5,w*.05,3,{roof:'#2a2a38'});
 cloudSea(c,w,h,h*.62,R,'rgba(214,214,224,A)',60);
 c.fillStyle=lg(c,0,h*.5,0,h,[[0,'#3a3640'],[1,'#141218']]);c.beginPath();c.moveTo(w*.32,h);c.lineTo(w*.36,h*.6);c.quadraticCurveTo(w*.4,h*.51,w*.5,h*.5);c.quadraticCurveTo(w*.6,h*.51,w*.64,h*.58);c.lineTo(w*.7,h);c.fill();
 c.fillStyle='#4a4652';c.beginPath();c.ellipse(w*.5,h*.51,w*.13,h*.018,0,0,6.283);c.fill();pine(c,w*.08,h*.72,h*.12,R,'#26402e');pine(c,w*.9,h*.8,h*.1,R,'#26402e');
 crane(c,w*.3,h*.3,w*.018,0);crane(c,w*.72,h*.22,w*.014,1);crane(c,w*.66,h*.3,w*.012,1);
 lightning(c,w*.2,0,w*.26,h*.32,R);lightning(c,w*.86,h*.04,w*.8,h*.36,R);vign(c,w,h,.45);};
SCN.xiulian=function(c,w,h,R){skyG(c,w,h,'#c8b8a8','#eae2d4','#e8c8a8');glow(c,w*.68,h*.3,h*.35,'rgba(255,220,170,.55)');c.fillStyle='rgba(255,244,220,.9)';c.beginPath();c.arc(w*.68,h*.3,h*.06,0,6.283);c.fill();
 [['#9aa0ac',.52,.18],['#7a8290',.6,.2],['#58606e',.7,.18]].forEach(([col,b,a],k)=>{ridge(c,w,h,h*b,h*a,col,R,2+k);for(let i=0;i<3;i++)softBlob(c,R()*w,h*(b+.02),w*.25,h*.03,'rgba(240,236,228,A)',.6);});
 pagoda(c,w*.22,h*.6,w*.06,4,{roof:'#3a3c48',wall:'#6a4a3a'});pine(c,w*.9,h*.86,h*.16,R,'#2a4030');pine(c,w*.05,h*.9,h*.13,R,'#2a4030');
 cloudSea(c,w,h,h*.74,R,'rgba(236,232,224,A)',30);c.fillStyle=lg(c,0,h*.78,0,h,[[0,'#5a5450'],[1,'#2a2622']]);c.beginPath();c.ellipse(w*.5,h*.92,w*.4,h*.1,0,0,6.283);c.fill();
 crane(c,w*.4,h*.2,w*.015,0);crane(c,w*.46,h*.17,w*.011,0);motes(c,w,h,30,'#fff2c8',R,1.4,h*.3,h);vign(c,w,h,.25);};
SCN.tianting=function(c,w,h,R){SCN.xianshan(c,w,h,R);c.fillStyle='rgba(255,220,140,.12)';c.fillRect(0,0,w,h);};

/* ---------- 修长的古风人物（盘坐） ---------- */
function robeOf(r){return r<1?{robe:'#6a6c5c',robe2:'#4a4c40',trim:'#5fae8c',inner:'#2c2a26'}:r<3?{robe:'#eeebe2',robe2:'#b8c4d0',trim:'#5fae8c',inner:'#3a5a7a'}:{robe:'#f6f4ee',robe2:'#c4cede',trim:'#d8b058',inner:'#2a4a8a',ribbon:1};}
function xianFigure(f,r){const W=240,H=300,[c,x]=hdCv(W,H,3);const P=robeOf(r),skin=f?'#f2d4b8':'#ecc8a6',hair='#1c1618',ink='rgba(30,24,32,.55)';x.lineJoin='round';x.lineCap='round';
 const cx=120,ol=()=>{x.strokeStyle=ink;x.lineWidth=1.1;x.stroke();};
 if(P.ribbon){x.strokeStyle='rgba(170,200,240,.85)';x.lineWidth=5;x.beginPath();x.moveTo(cx-40,118);x.bezierCurveTo(cx-90,100,cx-110,160,cx-70,190);x.bezierCurveTo(cx-40,215,cx-100,240,cx-112,256);x.stroke();x.beginPath();x.moveTo(cx+40,118);x.bezierCurveTo(cx+95,95,cx+100,170,cx+72,190);x.bezierCurveTo(cx+45,212,cx+100,236,cx+110,262);x.stroke();
  x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.5;x.stroke();}
 x.fillStyle=hair;x.beginPath();x.moveTo(cx-22,70);x.bezierCurveTo(cx-34,120,cx-30,170,cx-44,f?205:180);x.lineTo(cx+44,f?205:180);x.bezierCurveTo(cx+30,170,cx+34,120,cx+22,70);x.closePath();x.fill();
 const lg2=(a,b,y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
 x.fillStyle=lg2(P.robe,P.robe2,190,280);x.beginPath();x.moveTo(cx-30,190);x.bezierCurveTo(cx-95,200,cx-112,245,cx-96,268);x.bezierCurveTo(cx-60,284,cx+60,284,cx+96,268);x.bezierCurveTo(cx+112,245,cx+95,200,cx+30,190);x.closePath();x.fill();ol();
 x.strokeStyle='rgba(120,130,150,.5)';x.lineWidth=1.2;[[-70,230,-20,262],[-40,224,10,270],[30,226,70,262],[60,232,90,258]].forEach(([a,b,cc,d])=>{x.beginPath();x.moveTo(cx+a,b);x.quadraticCurveTo(cx+(a+cc)/2,(b+d)/2-6,cx+cc,d);x.stroke();});
 x.fillStyle=lg2(P.robe,P.robe2,96,200);x.beginPath();x.moveTo(cx-24,96);x.bezierCurveTo(cx-48,100,cx-56,120,cx-58,150);x.bezierCurveTo(cx-62,180,cx-50,205,cx-20,212);x.lineTo(cx+20,212);x.bezierCurveTo(cx+50,205,cx+62,180,cx+58,150);x.bezierCurveTo(cx+56,120,cx+48,100,cx+24,96);x.closePath();x.fill();ol();
 [[-1],[1]].forEach(([d])=>{x.fillStyle=lg2(P.robe,P.robe2,110,240);x.beginPath();x.moveTo(cx+d*44,106);x.bezierCurveTo(cx+d*70,130,cx+d*86,190,cx+d*92,236);x.bezierCurveTo(cx+d*70,246,cx+d*40,238,cx+d*26,222);x.bezierCurveTo(cx+d*36,190,cx+d*44,150,cx+d*44,106);x.closePath();x.fill();ol();
  x.strokeStyle=P.trim;x.lineWidth=3;x.beginPath();x.moveTo(cx+d*92,236);x.bezierCurveTo(cx+d*70,246,cx+d*40,238,cx+d*26,222);x.stroke();x.strokeStyle='rgba(120,130,150,.45)';x.lineWidth=1;x.beginPath();x.moveTo(cx+d*52,140);x.quadraticCurveTo(cx+d*66,190,cx+d*64,232);x.stroke();});
 x.fillStyle=P.inner;x.beginPath();x.moveTo(cx-16,98);x.lineTo(cx,140);x.lineTo(cx+16,98);x.closePath();x.fill();x.strokeStyle=P.trim;x.lineWidth=3;x.beginPath();x.moveTo(cx-20,96);x.lineTo(cx+4,146);x.moveTo(cx+20,96);x.lineTo(cx-2,140);x.stroke();
 x.fillStyle=P.trim;x.fillRect(cx-40,170,80,8);x.fillStyle=pSh(P.trim,-.2);x.fillRect(cx-40,176,80,2);x.fillStyle='#e8f4ee';x.beginPath();x.ellipse(cx+18,174,4,5,0,0,6.283);x.fill();
 x.fillStyle=skin;[[-1],[1]].forEach(([d])=>{x.beginPath();x.ellipse(cx+d*10,214,12,7,d*.2,0,6.283);x.fill();ol();});x.fillStyle='rgba(255,240,200,.85)';x.beginPath();x.arc(cx,210,4,0,6.283);x.fill();
 x.fillStyle=skin;x.fillRect(cx-7,84,14,14);x.fillStyle=lg2(pSh(skin,.06),pSh(skin,-.08),50,96);x.beginPath();x.ellipse(cx,70,17,22,0,0,6.283);x.fill();ol();
 x.strokeStyle='#3a2820';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-11,66);x.quadraticCurveTo(cx-6,69,cx-2,66);x.moveTo(cx+2,66);x.quadraticCurveTo(cx+6,69,cx+11,66);x.stroke();x.lineWidth=1.2;x.beginPath();x.moveTo(cx-12,58);x.quadraticCurveTo(cx-7,55,cx-2,58);x.moveTo(cx+2,58);x.quadraticCurveTo(cx+7,55,cx+12,58);x.stroke();
 x.strokeStyle='rgba(120,70,60,.6)';x.beginPath();x.moveTo(cx,70);x.lineTo(cx-1,77);x.stroke();x.strokeStyle=f?'#c06a6a':'#9a5a50';x.lineWidth=1.6;x.beginPath();x.moveTo(cx-4,84);x.quadraticCurveTo(cx,86,cx+4,84);x.stroke();
 if(f){x.fillStyle='rgba(240,140,140,.18)';x.beginPath();x.ellipse(cx-10,76,4,2.4,0,0,6.283);x.ellipse(cx+10,76,4,2.4,0,0,6.283);x.fill();}
 x.fillStyle=hair;x.beginPath();x.moveTo(cx-19,72);x.bezierCurveTo(cx-24,40,cx-8,38,cx,42);x.bezierCurveTo(cx+8,38,cx+24,40,cx+19,72);x.bezierCurveTo(cx+14,56,cx+8,50,cx,52);x.bezierCurveTo(cx-8,50,cx-14,56,cx-19,72);x.fill();
 x.beginPath();x.ellipse(cx,38,9,8,0,0,6.283);x.fill();x.fillStyle=P.trim;x.fillRect(cx-8,30,16,5);x.strokeStyle=P.trim;x.lineWidth=2;x.beginPath();x.moveTo(cx-16,34);x.lineTo(cx+16,30);x.stroke();
 x.strokeStyle=hair;x.lineWidth=4;[[-1],[1]].forEach(([d])=>{x.beginPath();x.moveTo(cx+d*17,70);x.bezierCurveTo(cx+d*22,100,cx+d*18,130,cx+d*26,160);x.stroke();});
 if(f){x.strokeStyle='#e8c060';x.lineWidth=1.5;x.beginPath();x.moveTo(cx+10,34);x.lineTo(cx+22,48);x.stroke();x.fillStyle='#e05a7a';x.beginPath();x.arc(cx+22,49,2.2,0,6.283);x.fill();}
 return c;}
heroSit=function(f){const r=realmIdx();const cv=cvMemo('xian|'+(f?1:0)+'|'+Math.min(3,r),()=>xianFigure(f,r));return `<img src="${cv.toDataURL()}" alt="${f?'少女':'少年'}盘膝修炼" draggable="false">`;};
const _cultScene=cultScene;cultScene=function(){const r=STAGES[S.stage].r;if(S.stage>=LAST)return 'core';return r>=5?'xianshan':(r>=1||ART_HAVE.includes('scene_xiulian'))?'xiulian':_cultScene();};
ZONE_SCN[9]='tianting';ZONE_SCN.jie='leijie';

/* ---------- 插画素材接口：把图片放进 art/ 并登记在 ART_HAVE ---------- */
const ART_HAVE=['ico_shouyuan','ico_pojing','ico_juqi','ico_zhuji','ico_jiuzhuan','ico_huanhun','ico_fu_lei','ico_fu_huo','ico_fu_hu','por_xiao','por_sx','por_tq','por_mu','boss_shuwang','boss_baizu','boss_huaiyao','boss_haiyan','boss_zero','boss_duoxian','boss_lingchao','boss_shouguan','boss_jing','boss_tianjiang','boss_muzhe','boss_jieyun','por_lie','por_yun','por_lin','por_mowen','por_chiyang','por_shuiyue','por_huagu','por_shi','por_yan','por_gu','por_liu','por_luo','por_ying','por_cm','por_shen','por_qian','por_man','por_gui','scene_xianshan','scene_tianting','scene_core','scene_abyss','scene_starsea','scene_guixu','scene_clan','scene_xianfu','scene_dongtian','scene_leijie','scene_xiulian','scene_sky','scene_shelter','scene_market','scene_metro','scene_overpass','scene_forest','scene_port','scene_lab','scene_pit','por_hero_m','por_hero_f','por_mo','por_tie','por_he','por_hong','por_zero','por_zhou','por_su','por_ning','scene_leitai','scene_chixiao','scene_xuanshui','scene_baicao','scene_youming','scene_city','scene_huatian','scene_linjiang','scene_auction','scene_shanmen'];
ART_HAVE.push('atlas_5_enemies_01_mutants','atlas_5_enemies_02_adversaries','atlas_5_portraits_01_antagonists','atlas_5_portraits_02_market','atlas_5_portraits_03_station','atlas_6_characters_grid','atlas_6_enemies_grid');
const ART_IMG={};
function artLoad(){ART_HAVE.forEach(k=>{const im=new Image();im.onload=()=>{ART_IMG[k]=im;SCC_CLEAR();try{paintAll();const v=document.getElementById('vbg');if(v&&v.dataset.key)paintTo(v,v.dataset.key);}catch(e){}};im.src='art/'+k+(k.match(/^(por|boss|ico|atlas)_/)?'.webp':'.jpg')+(k.startsWith('scene_')?'?v=scenes-20261108':'');});}
function SCC_CLEAR(){try{_scnCache.clear();for(const k of _cvc.keys())if(k.startsWith('hbg|')||k.startsWith('img|'))_cvc.delete(k);}catch(e){}}
const _sceneCanvas=sceneCanvas;sceneCanvas=function(key,w,h){const im=ART_IMG['scene_'+key];if(!im)return _sceneCanvas(key,w,h);
 return cvMemo('img|'+key+'|'+Math.round(w)+'x'+Math.round(h),()=>{const dpr=Math.min(2,window.devicePixelRatio||1),cv=mkCv(Math.round(w*dpr),Math.round(h*dpr)),x=cv.getContext('2d');const s=Math.max(cv.width/im.width,cv.height/im.height);x.drawImage(im,(cv.width-im.width*s)/2,(cv.height-im.height*s)/2,im.width*s,im.height*s);return cv;});};
Object.keys(PORTRAIT).forEach(k=>{const f=PORTRAIT[k];PORTRAIT[k]=function(){const im=ART_IMG['por_'+k];return im?`<img class="porimg ${k}" src="${im.src}" alt="">`:f.apply(this,arguments);};});
