/* ================= ART：场景、立绘、精灵 ================= */
const INK='#1b1712';
function rng(seed){let s=(seed*2654435761)>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,col])=>g.addColorStop(o,col));return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,col])=>g.addColorStop(o,col));return g;}
function skyG(c,w,h,top,bot,mid){c.fillStyle=lg(c,0,0,0,h,mid?[[0,top],[.55,mid],[1,bot]]:[[0,top],[1,bot]]);c.fillRect(0,0,w,h);}
function ridge(c,w,h,base,amp,col,R,freq){freq=freq||2;c.beginPath();c.moveTo(0,h);const p=[R()*6,R()*6,R()*6];
  for(let x=0;x<=w+4;x+=4){const t=x/w;const y=base-amp*(.5+.3*Math.sin(t*freq*6.28+p[0])+.15*Math.sin(t*freq*2.3*6.28+p[1])+.08*Math.sin(t*freq*5.1*6.28+p[2]));c.lineTo(x,y);}
  c.lineTo(w,h);c.closePath();c.fillStyle=col;c.fill();}
function skyline(c,w,h,base,minH,maxH,col,R,o){o=o||{};let x=-10;const bwB=o.bw||w*.05;
  while(x<w+10){const bw=bwB+R()*bwB*1.6,bh=minH+R()*(maxH-minH);c.fillStyle=col;c.beginPath();c.moveTo(x,h);c.lineTo(x,base-bh);
    if(o.broken&&R()<.55){const n=3+Math.floor(R()*3);for(let i=1;i<=n;i++)c.lineTo(x+bw*i/n,base-bh+(R()-.25)*bh*.4);}else c.lineTo(x+bw,base-bh);
    c.lineTo(x+bw,h);c.closePath();c.fill();
    if(o.win){c.fillStyle=o.win;for(let wy=base-bh+8;wy<base-6;wy+=9)for(let wx=x+5;wx<x+bw-5;wx+=8)if(R()<(o.lit||.06))c.fillRect(wx,wy,3,4);}
    x+=bw+(o.gap?R()*o.gap:0);}}
function fog(c,w,y,hh,col){c.fillStyle=lg(c,0,y-hh,0,y+hh,[[0,'rgba(0,0,0,0)'],[.5,col],[1,'rgba(0,0,0,0)']]);c.fillRect(0,y-hh,w,hh*2);}
function motes(c,w,h,n,col,R,rmax,y0,y1){c.fillStyle=col;y0=y0||0;y1=y1||h;for(let i=0;i<n;i++){c.globalAlpha=.15+R()*.75;c.beginPath();c.arc(R()*w,y0+R()*(y1-y0),.5+R()*(rmax||2),0,6.283);c.fill();}c.globalAlpha=1;}
function vign(c,w,h,a){c.fillStyle=rg(c,w/2,h*.45,Math.min(w,h)*.25,Math.max(w,h)*.78,[[0,'rgba(0,0,0,0)'],[1,'rgba(6,5,3,'+(a||.6)+')']]);c.fillRect(0,0,w,h);}
function glow(c,x,y,r,col){c.fillStyle=rg(c,x,y,0,r,[[0,col],[1,'rgba(0,0,0,0)']]);c.fillRect(x-r,y-r,r*2,r*2);}
function person(c,x,y,s,col){c.fillStyle=col;c.beginPath();c.arc(x,y-s*.85,s*.16,0,6.283);c.fill();c.beginPath();c.moveTo(x-s*.22,y);c.quadraticCurveTo(x-s*.24,y-s*.66,x,y-s*.68);c.quadraticCurveTo(x+s*.24,y-s*.66,x+s*.22,y);c.fill();}
function arch(c,cx,by,wid,hei){c.beginPath();c.moveTo(cx-wid/2,by);c.lineTo(cx-wid/2,by-hei*.5);c.quadraticCurveTo(cx-wid/2,by-hei,cx,by-hei);c.quadraticCurveTo(cx+wid/2,by-hei,cx+wid/2,by-hei*.5);c.lineTo(cx+wid/2,by);c.closePath();}
function mix(a,b,t){const pa=a.match(/\w\w/g).map(x=>parseInt(x,16)),pb=b.match(/\w\w/g).map(x=>parseInt(x,16));return 'rgb('+pa.map((v,i)=>Math.round(v+(pb[i]-v)*t)).join(',')+')';}

const SCN={
 sky(c,w,h,R){skyG(c,w,h,'#07100f','#26352e','#12201c');
  const cx=w*.56;glow(c,cx,h*.18,h*.75,'rgba(143,214,181,.32)');glow(c,cx,h*.1,h*.3,'rgba(220,255,240,.35)');
  const pts=[];let x=cx,y=-4;for(let i=0;i<10;i++){y+=h*.05;x+=(R()-.5)*w*.07;pts.push([x,y]);}
  c.beginPath();c.moveTo(cx-10,-4);pts.forEach(([px,py],i)=>c.lineTo(px-(10-i)*2.2-1,py));pts.slice().reverse().forEach(([px,py],i)=>c.lineTo(px+(i+1)*2.2+1,py));c.lineTo(cx+10,-4);c.closePath();
  c.shadowColor='#8fd6b5';c.shadowBlur=40;c.fillStyle='#effff8';c.fill();c.shadowBlur=0;
  c.strokeStyle='rgba(200,255,230,.18)';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(cx+(R()-.5)*20,h*.15);c.lineTo(cx+(R()-.5)*w*1.2,h);c.stroke();}
  motes(c,w,h,90,'#bff5dc',R,1.6);
  skyline(c,w,h,h*.8,h*.12,h*.42,'#17221e',R,{broken:1,bw:w*.04});
  skyline(c,w,h,h*.9,h*.05,h*.26,'#0c1210',R,{broken:1,win:'rgba(240,190,110,.5)',lit:.03});
  c.fillStyle='#080b0a';c.fillRect(0,h*.92,w,h);vign(c,w,h,.5);},
 shelter(c,w,h,R){skyG(c,w,h,'#0e1210','#1a1e19');
  c.fillStyle='#232823';c.beginPath();c.moveTo(0,h*.78);c.lineTo(0,h*.32);c.quadraticCurveTo(w/2,-h*.18,w,h*.32);c.lineTo(w,h*.78);c.fill();
  c.strokeStyle='rgba(255,255,255,.04)';c.lineWidth=1;for(let x=0;x<w;x+=Math.max(10,w/30)){c.beginPath();c.moveTo(x,h*.05);c.lineTo(x,h*.74);c.stroke();}
  for(let y=h*.12;y<h*.74;y+=h*.06){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.fillStyle='#244236';c.fillRect(w*.37,h*.17,w*.26,h*.08);c.strokeStyle='#4f8a73';c.lineWidth=2;c.strokeRect(w*.37,h*.17,w*.26,h*.08);
  c.fillStyle='#d6eee2';c.font=Math.round(h*.05)+'px "Ma Shan Zheng","Noto Serif SC",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('青 石 站',w*.5,h*.212);
  c.strokeStyle='rgba(60,50,40,.9)';c.lineWidth=1.5;c.beginPath();c.moveTo(0,h*.33);for(let i=0;i<=8;i++)c.quadraticCurveTo(w*(i/8-.06),h*.4,w*i/8,h*.34);c.stroke();
  for(let i=0;i<8;i++){const lx=w*(.06+i*.125),ly=h*.375;glow(c,lx,ly,h*.16,'rgba(240,160,80,.22)');c.fillStyle='#f3b766';c.beginPath();c.arc(lx,ly,Math.max(2,h*.013),0,6.28);c.fill();}
  c.fillStyle='#141814';c.fillRect(0,h*.74,w,h);c.fillStyle='#2b302a';c.fillRect(0,h*.74,w,h*.014);
  const cols=['#4a4436','#3b4a44','#5a3b32','#454a52','#52482e'];
  for(let i=0;i<7;i++){const tx=R()*w,tw=w*(.09+R()*.09),th=h*(.13+R()*.07),by=h*(.77+R()*.04);c.fillStyle=cols[i%5];c.beginPath();c.moveTo(tx-tw/2,by);c.lineTo(tx,by-th);c.lineTo(tx+tw/2,by);c.fill();
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(tx,by-th);c.lineTo(tx+tw/2,by);c.lineTo(tx+tw*.08,by);c.fill();}
  for(let i=0;i<4;i++){const bx=R()*w,bs=h*(.05+R()*.04);c.fillStyle='#3a3226';c.fillRect(bx,h*.86-bs,bs*1.3,bs);c.strokeStyle='#241e16';c.strokeRect(bx,h*.86-bs,bs*1.3,bs);}
  glow(c,w*.3,h*.86,h*.18,'rgba(255,140,60,.18)');
  for(let i=0;i<6;i++)person(c,R()*w,h*(.84+R()*.1),h*.1,'#090b09');
  vign(c,w,h,.65);},
 metro(c,w,h,R){c.fillStyle='#050707';c.fillRect(0,0,w,h);const vx=w*.5,vy=h*.5;
  for(let i=0;i<11;i++){const s=Math.pow(.78,i),wid=w*1.4*s,hei=h*1.35*s,by=vy+h*.62*s;arch(c,vx,by,wid,hei);
    c.fillStyle=mix('#1d2a27','#040606',i/10);c.fill();c.strokeStyle='rgba(120,160,150,'+(.18-i*.014)+')';c.lineWidth=Math.max(1,3*s);c.stroke();
    if(i>0&&i<8){const ly=by-hei*.48;[vx-wid*.47,vx+wid*.47].forEach(lx=>{glow(c,lx,ly,h*.12*s+4,'rgba(110,210,190,.25)');c.fillStyle='#a8f0dd';c.fillRect(lx-2*s-1,ly-1,4*s+2,2*s+2);});}}
  c.strokeStyle='#3a4643';c.lineWidth=3;[[.28,-.012],[.72,.012]].forEach(([x,d])=>{c.beginPath();c.moveTo(w*x,h);c.lineTo(vx+w*d,vy+h*.02);c.stroke();});
  c.lineWidth=2;c.strokeStyle='#202826';for(let i=1;i<9;i++){const t=Math.pow(i/9,1.8),y=vy+h*.02+(h-vy)*t,hw=(w*.22)*t+3;c.beginPath();c.moveTo(vx-hw*1.05,y);c.lineTo(vx+hw*1.05,y);c.stroke();}
  c.fillStyle='rgba(110,190,180,.10)';for(let i=0;i<5;i++){c.beginPath();c.ellipse(R()*w,h*(.85+R()*.12),w*(.05+R()*.08),h*.012,0,0,6.28);c.fill();}
  for(let i=0;i<4;i++){const ex=vx+(R()-.5)*w*.22,ey=vy-h*.02+(R()-.5)*h*.08;c.fillStyle='#ff4a3a';c.shadowColor='#ff3020';c.shadowBlur=6;c.beginPath();c.arc(ex,ey,1.6,0,6.28);c.arc(ex+5,ey,1.6,0,6.28);c.fill();c.shadowBlur=0;}
  vign(c,w,h,.55);},
 overpass(c,w,h,R){skyG(c,w,h,'#24161a','#d07a42','#7a3a2c');
  glow(c,w*.72,h*.62,h*.6,'rgba(255,190,120,.35)');c.fillStyle='#ffd9a8';c.beginPath();c.arc(w*.72,h*.62,h*.09,0,6.28);c.fill();
  skyline(c,w,h,h*.82,h*.12,h*.4,'#6a3a2a',R,{broken:1,bw:w*.045,gap:w*.02});
  skyline(c,w,h,h*.9,h*.05,h*.2,'#40231b',R,{broken:1,bw:w*.06});
  const dk='#231512';
  c.fillStyle=dk;c.beginPath();c.moveTo(-10,h*.38);c.lineTo(w*.46,h*.43);c.lineTo(w*.44,h*.47);c.lineTo(w*.47,h*.5);c.lineTo(-10,h*.47);c.fill();
  c.beginPath();c.moveTo(w*.6,h*.46);c.lineTo(w+10,h*.4);c.lineTo(w+10,h*.49);c.lineTo(w*.62,h*.53);c.lineTo(w*.58,h*.5);c.fill();
  [.06,.24,.4,.7,.88].forEach(px=>{const top=px<.5?h*(.465+px*.04):h*(.5-(px-.6)*.12);c.fillRect(w*px-w*.018,top,w*.036,h);});
  c.strokeStyle=dk;c.lineWidth=2;for(let i=0;i<7;i++){c.beginPath();c.moveTo(w*.45,h*(.44+i*.008));c.lineTo(w*(.47+R()*.04),h*(.43+i*.02+R()*.03));c.stroke();c.beginPath();c.moveTo(w*.61,h*(.47+i*.008));c.lineTo(w*(.58-R()*.04),h*(.46+i*.02+R()*.03));c.stroke();}
  c.save();c.translate(w*.47,h*.56);c.rotate(.9);c.fillStyle='#2e1c17';c.fillRect(-w*.03,-h*.03,w*.06,h*.05);c.restore();
  c.strokeStyle='#1a0f0c';c.lineWidth=1.6;for(let i=0;i<9;i++){const bx=w*(.2+R()*.6),by=h*(.12+R()*.2),s=3+R()*4;c.beginPath();c.moveTo(bx-s,by-s*.5);c.quadraticCurveTo(bx-s*.4,by-s*.2,bx,by);c.quadraticCurveTo(bx+s*.4,by-s*.2,bx+s,by-s*.5);c.stroke();}
  c.fillStyle='#160d0a';c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=w/24)c.lineTo(x,h*(.9+R()*.05));c.lineTo(w,h);c.fill();
  vign(c,w,h,.5);},
 forest(c,w,h,R){skyG(c,w,h,'#0b1813','#2c4a3a','#163026');
  ridge(c,w,h,h*.55,h*.2,'#1b3328',R,3);
  c.fillStyle='#1a2a24';c.fillRect(w*.56,h*.22,w*.18,h*.6);c.fillStyle='#0f1a16';c.beginPath();c.moveTo(w*.56,h*.22);c.lineTo(w*.6,h*.18);c.lineTo(w*.66,h*.24);c.lineTo(w*.7,h*.17);c.lineTo(w*.74,h*.22);c.fill();
  c.fillStyle='rgba(180,220,170,.18)';for(let y=h*.27;y<h*.78;y+=h*.06)for(let x=w*.58;x<w*.72;x+=w*.035)if(R()<.7)c.fillRect(x,y,w*.018,h*.03);
  c.strokeStyle='#2f6040';c.lineWidth=2;for(let i=0;i<14;i++){c.beginPath();const vx=w*(.56+R()*.18);c.moveTo(vx,h*.2);c.bezierCurveTo(vx+(R()-.5)*30,h*.4,vx+(R()-.5)*30,h*.6,vx+(R()-.5)*20,h*(.6+R()*.25));c.stroke();}
  c.fillStyle='rgba(220,255,210,.05)';for(let i=0;i<4;i++){const sx=w*(.1+R()*.8);c.beginPath();c.moveTo(sx,0);c.lineTo(sx+w*.06,0);c.lineTo(sx+w*.2,h);c.lineTo(sx+w*.08,h);c.fill();}
  [[.12,.07],[.36,.05],[.88,.09],[.02,.04]].forEach(([tx,tw])=>{c.fillStyle='#0d1813';c.beginPath();c.moveTo(w*(tx-tw*.5),h);c.quadraticCurveTo(w*(tx-tw*.2),h*.85,w*(tx-tw*.25),0);c.lineTo(w*(tx+tw*.25),0);c.quadraticCurveTo(w*(tx+tw*.2),h*.85,w*(tx+tw*.6),h);c.fill();
    c.strokeStyle='rgba(60,90,70,.4)';c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();const bx=w*(tx+(R()-.5)*tw*.4);c.moveTo(bx,h*R());c.lineTo(bx+(R()-.5)*4,h*R());c.stroke();}});
  c.fillStyle='#0a140f';for(let i=0;i<10;i++){c.beginPath();c.arc(R()*w,-h*.02+R()*h*.1,h*(.08+R()*.1),0,6.28);c.fill();}
  motes(c,w,h,70,'#cdf5a8',R,2.2,h*.2,h*.95);
  c.fillStyle='#08110c';c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=w/40)c.lineTo(x,h*(.88+R()*.06));c.lineTo(w,h);c.fill();
  vign(c,w,h,.55);},
 port(c,w,h,R){skyG(c,w,h,'#3e4a4e','#97a4a4','#6d7a7c');
  skyline(c,w,h,h*.56,h*.04,h*.16,'#5d6a6c',R,{bw:w*.05,gap:w*.05});
  c.fillStyle=lg(c,0,h*.55,0,h,[[0,'#46585c'],[1,'#162024']]);c.fillRect(0,h*.55,w,h);
  c.strokeStyle='rgba(200,220,220,.15)';c.lineWidth=1;for(let i=0;i<30;i++){const y=h*(.58+R()*.4),x=R()*w;c.beginPath();c.moveTo(x,y);c.lineTo(x+w*(.03+R()*.06),y);c.stroke();}
  c.save();c.translate(w*.36,h*.66);c.rotate(-.18);c.fillStyle='#1f282b';c.beginPath();c.moveTo(-w*.28,0);c.lineTo(w*.22,0);c.lineTo(w*.18,h*.12);c.lineTo(-w*.24,h*.12);c.fill();
  c.fillRect(-w*.12,-h*.1,w*.14,h*.1);c.fillStyle='#2a3438';c.fillRect(-w*.1,-h*.08,w*.03,h*.03);c.fillRect(-w*.05,-h*.08,w*.03,h*.03);
  c.strokeStyle='#1f282b';c.lineWidth=3;c.beginPath();c.moveTo(w*.06,0);c.lineTo(w*.06,-h*.32);c.stroke();c.lineWidth=1.5;c.beginPath();c.moveTo(w*.06,-h*.3);c.lineTo(-w*.2,0);c.moveTo(w*.06,-h*.3);c.lineTo(w*.2,0);c.stroke();
  c.fillStyle='#e8e4da';c.fillRect(w*.06,-h*.31,w*.06,h*.045);c.strokeStyle='#9a2a20';c.lineWidth=1;c.beginPath();c.ellipse(w*.09,-h*.288,w*.012,h*.009,0,0,6.28);c.stroke();c.fillStyle='#9a2a20';c.beginPath();c.arc(w*.09,-h*.288,1.6,0,6.28);c.fill();c.restore();
  c.strokeStyle='#283236';c.lineWidth=3;const cx0=w*.82;c.beginPath();c.moveTo(cx0,h*.62);c.lineTo(cx0,h*.18);c.lineTo(cx0-w*.2,h*.22);c.moveTo(cx0,h*.18);c.lineTo(cx0+w*.08,h*.2);c.stroke();
  c.lineWidth=1;for(let y=h*.2;y<h*.6;y+=h*.04){c.beginPath();c.moveTo(cx0-4,y);c.lineTo(cx0+4,y+h*.04);c.stroke();}
  c.beginPath();c.moveTo(cx0-w*.18,h*.22);c.lineTo(cx0-w*.18,h*.38);c.stroke();
  fog(c,w,h*.5,h*.1,'rgba(220,230,230,.35)');fog(c,w,h*.8,h*.12,'rgba(200,215,215,.22)');
  vign(c,w,h,.45);},
 lab(c,w,h,R){skyG(c,w,h,'#0a0816','#2c2244','#1a1430');motes(c,w,h*.5,60,'#d8d4ff',R,1.2);
  c.fillStyle='#e8e4ff';c.beginPath();c.arc(w*.18,h*.18,h*.05,0,6.28);c.fill();c.fillStyle='#120e22';c.beginPath();c.arc(w*.2,h*.17,h*.045,0,6.28);c.fill();
  ridge(c,w,h,h*.72,h*.1,'#1a1428',R,2);
  const dx=w*.42,dy=h*.74,dr=Math.min(w*.24,h*.4);glow(c,dx,dy-dr*.4,dr*1.3,'rgba(120,240,255,.22)');
  c.fillStyle='#2a2838';c.beginPath();c.arc(dx,dy,dr,Math.PI,0);c.fill();c.strokeStyle='#3e3c52';c.lineWidth=2;
  for(let i=1;i<5;i++){c.beginPath();c.arc(dx,dy,dr,Math.PI+i*.6,Math.PI+i*.6+.01);c.stroke();}
  for(let i=1;i<4;i++){c.beginPath();c.ellipse(dx,dy,dr,dr*i/4,0,Math.PI,0);c.stroke();}
  c.strokeStyle='#8ff4ff';c.shadowColor='#5fe6f5';c.shadowBlur=12;c.lineWidth=2.5;c.beginPath();c.moveTo(dx-dr*.1,dy-dr);let x=dx-dr*.1,y=dy-dr;for(let i=0;i<6;i++){x+=(R()-.5)*dr*.3;y+=dr*.15;c.lineTo(x,y);}c.stroke();c.shadowBlur=0;
  const ax=w*.8;c.strokeStyle='#2e2a40';c.lineWidth=2;c.beginPath();c.moveTo(ax-w*.04,dy);c.lineTo(ax,h*.12);c.lineTo(ax+w*.04,dy);c.stroke();
  for(let y=h*.16;y<dy;y+=h*.05){const t=(y-h*.12)/(dy-h*.12);c.beginPath();c.moveTo(ax-w*.04*t,y);c.lineTo(ax+w*.04*t,y+h*.05);c.stroke();}
  c.fillStyle='#ff5a4a';c.beginPath();c.arc(ax,h*.12,2.5,0,6.28);c.fill();glow(c,ax,h*.12,10,'rgba(255,90,70,.6)');
  c.fillStyle='#0d0a18';c.fillRect(0,dy,w,h);
  c.strokeStyle='#3a3450';c.lineWidth=2;for(let x=w*.02;x<w;x+=w*.07){c.beginPath();c.moveTo(x,dy+h*.12);c.lineTo(x,dy+h*.02);c.stroke();}
  c.lineWidth=1;c.beginPath();c.moveTo(0,dy+h*.04);c.lineTo(w,dy+h*.04);c.moveTo(0,dy+h*.08);c.lineTo(w,dy+h*.08);c.stroke();
  c.fillStyle='#e0b83a';c.beginPath();c.moveTo(w*.16,dy+h*.03);c.lineTo(w*.19,dy+h*.09);c.lineTo(w*.13,dy+h*.09);c.fill();c.fillStyle='#1a1408';c.fillRect(w*.158,dy+h*.05,2,h*.02);
  vign(c,w,h,.55);},
 pit(c,w,h,R){skyG(c,w,h,'#140807','#5a2014','#2c0e0a');
  glow(c,w*.5,h*.9,h*.9,'rgba(255,110,50,.35)');
  skyline(c,w,h,h*.62,h*.05,h*.3,'#1d0b08',R,{broken:1,bw:w*.06,gap:w*.03});
  c.fillStyle=rg(c,w*.5,h*.86,0,w*.48,[[0,'#ffd28a'],[.25,'#ff7a3a'],[.6,'#7a1e10'],[1,'#200806']]);c.beginPath();c.ellipse(w*.5,h*.86,w*.48,h*.16,0,0,6.28);c.fill();
  c.strokeStyle='rgba(30,8,4,.8)';c.lineWidth=3;c.beginPath();c.ellipse(w*.5,h*.86,w*.48,h*.16,0,Math.PI,0);c.stroke();
  [[.04,.2,-.18],[.14,.14,-.32],[.9,.18,.22],[.8,.12,.4]].forEach(([bx,bw,rot])=>{c.save();c.translate(w*bx,h*.78);c.rotate(rot);c.fillStyle='#160806';c.fillRect(-w*bw*.3,-h*.55,w*bw*.6,h*.6);
    c.fillStyle='rgba(255,140,70,.25)';for(let y=-h*.5;y<0;y+=h*.06)for(let x=-w*bw*.25;x<w*bw*.25;x+=w*.03)if(R()<.25)c.fillRect(x,y,3,4);c.restore();});
  motes(c,w,h,80,'#ffb070',R,2,h*.1,h*.9);
  vign(c,w,h,.55);},
 core(c,w,h,R){c.fillStyle=rg(c,w/2,h*.5,0,Math.max(w,h)*.8,[[0,'#fff6d8'],[.18,'#e8c87a'],[.5,'#4a3c1e'],[1,'#120e06']]);c.fillRect(0,0,w,h);
  c.fillStyle=lg(c,w*.46,0,w*.54,0,[[0,'rgba(255,250,220,0)'],[.5,'rgba(255,250,230,.95)'],[1,'rgba(255,250,220,0)']]);c.fillRect(w*.44,0,w*.12,h);
  c.strokeStyle='rgba(255,230,160,.35)';c.lineWidth=1.5;for(let i=1;i<4;i++){c.beginPath();c.ellipse(w/2,h*.5,w*.14*i,h*.035*i,-.08,0,6.28);c.stroke();}
  for(let i=0;i<9;i++){const rx=R()*w,ry=h*(.15+R()*.75),rs=h*(.03+R()*.07);if(Math.abs(rx-w/2)<w*.1)continue;glow(c,rx,ry+rs*.6,rs*1.4,'rgba(255,210,120,.3)');
    c.fillStyle='#2a2214';c.beginPath();c.moveTo(rx-rs*1.3,ry);c.lineTo(rx-rs*.6,ry-rs*.5);c.lineTo(rx+rs*.7,ry-rs*.4);c.lineTo(rx+rs*1.3,ry);c.lineTo(rx+rs*.2,ry+rs*1.1);c.closePath();c.fill();
    c.fillStyle='#4a3a1e';c.beginPath();c.moveTo(rx-rs*1.3,ry);c.lineTo(rx-rs*.6,ry-rs*.5);c.lineTo(rx+rs*.7,ry-rs*.4);c.lineTo(rx+rs*1.3,ry);c.closePath();c.fill();}
  motes(c,w,h,90,'#fff0c0',R,1.8);vign(c,w,h,.5);},
 abyss(c,w,h,R){c.fillStyle='#05040a';c.fillRect(0,0,w,h);
  glow(c,w*.5,h*.92,h*.7,'rgba(140,90,220,.3)');
  c.fillStyle='#1a0f2a';c.beginPath();c.ellipse(w*.5,h*.94,w*.3,h*.1,0,0,6.28);c.fill();
  c.fillStyle=rg(c,w*.5,h*.94,0,w*.2,[[0,'#d7b8ff'],[.4,'#7a4ad0'],[1,'rgba(40,20,80,0)']]);c.beginPath();c.ellipse(w*.5,h*.94,w*.2,h*.07,0,0,6.28);c.fill();
  c.fillStyle='#05040a';c.beginPath();c.ellipse(w*.5,h*.94,w*.012,h*.06,0,0,6.28);c.fill();
  for(let i=0;i<16;i++){const t=i/16,a=t*Math.PI*4,rr=w*.42*(1-t*.8),px=w*.5+Math.cos(a)*rr,py=h*(.08+t*.75)+Math.sin(a)*h*.04,s=w*.08*(1-t*.7);
    c.fillStyle='#1c1630';c.fillRect(px-s/2,py,s,s*.25);c.fillStyle='rgba(180,140,255,.5)';c.fillRect(px-s/2,py,s,1.5);}
  motes(c,w,h,70,'#c9a8ff',R,1.6);vign(c,w,h,.4);},
 dongtian(c,w,h,R){skyG(c,w,h,'#0c1d18','#3a6c5a','#1c3c32');
  c.fillStyle='rgba(220,255,240,.12)';c.beginPath();c.arc(w*.72,h*.22,h*.14,0,6.28);c.fill();
  for(let i=0;i<5;i++){const ix=R()*w,iy=h*(.15+R()*.4),is=h*(.02+R()*.04);c.fillStyle='#24443a';c.beginPath();c.ellipse(ix,iy,is*2,is*.5,0,0,6.28);c.fill();c.beginPath();c.moveTo(ix-is*1.8,iy);c.lineTo(ix,iy+is*2);c.lineTo(ix+is*1.8,iy);c.fill();}
  fog(c,w,h*.55,h*.14,'rgba(200,245,225,.22)');
  const ix=w*.5,iy=h*.66,iw=w*.36;c.fillStyle='#1d342c';c.beginPath();c.moveTo(ix-iw,iy);c.quadraticCurveTo(ix-iw*.3,iy+h*.38,ix,iy+h*.42);c.quadraticCurveTo(ix+iw*.3,iy+h*.38,ix+iw,iy);c.fill();
  c.fillStyle='#3f7a5e';c.beginPath();c.ellipse(ix,iy,iw,h*.06,0,0,6.28);c.fill();c.fillStyle='#5a9c78';c.beginPath();c.ellipse(ix,iy-h*.01,iw*.92,h*.04,0,0,6.28);c.fill();
  glow(c,ix,iy-h*.06,h*.22,'rgba(160,255,215,.45)');c.fillStyle='#bfeee0';c.beginPath();c.ellipse(ix,iy-h*.03,w*.07,h*.018,0,0,6.28);c.fill();c.fillStyle='#8fd6b5';c.fillRect(ix-w*.07,iy-h*.03,w*.14,h*.03);c.fillStyle='#d9fff0';c.beginPath();c.ellipse(ix,iy-h*.032,w*.07,h*.016,0,0,6.28);c.fill();
  motes(c,w,h,90,'#c8ffe8',R,2);vign(c,w,h,.45);}
};
const ZONE_SCN=['metro','overpass','forest','port','lab','pit','core','abyss'];
const _scnCache=new Map();
function sceneCanvas(key,w,h){w=Math.max(40,Math.round(w));h=Math.max(30,Math.round(h));const dpr=Math.min(2,window.devicePixelRatio||1);const k=key+'|'+w+'x'+h+'|'+dpr;
  if(_scnCache.has(k))return _scnCache.get(k);const cv=document.createElement('canvas');cv.width=w*dpr;cv.height=h*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
  try{(SCN[key]||SCN.shelter)(c,w,h,rng(key.length*977+(key.charCodeAt(0)||1)*131));}catch(e){c.fillStyle='#16140f';c.fillRect(0,0,w,h);}
  if(_scnCache.size>40)_scnCache.delete(_scnCache.keys().next().value);_scnCache.set(k,cv);return cv;}
function paintTo(cv,key){if(!cv)return;const r=cv.getBoundingClientRect();if(r.width<2)return;const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);const src=sceneCanvas(key,r.width,r.height);cv.getContext('2d').drawImage(src,0,0,cv.width,cv.height);cv.dataset.key=key;}

/* ---------- 立绘 ---------- */
function eyes(y,o){o=o||{};const dx=o.dx||19,col=o.col||'#2a2018',rx=o.rx||5.5,ry=o.ry||8;let s='';
  [100-dx,100+dx].forEach(x=>{s+=`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}" stroke="none"/><circle cx="${x+1.6}" cy="${y-ry*.38}" r="${Math.max(1.4,rx*.38)}" fill="#fff" stroke="none"/>`;
    if(o.lash)s+=`<path d="M${x-rx-3} ${y-ry+1} Q${x} ${y-ry-4} ${x+rx+3} ${y-ry+2}" fill="none" stroke-width="3"/>`;});return s;}
function eyesClosed(y,dx){dx=dx||19;return [100-dx,100+dx].map(x=>`<path d="M${x-8} ${y} Q${x} ${y+5} ${x+8} ${y}" fill="none" stroke-width="2.5"/>`).join('');}
function svgP(inner,defs,stroke){return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs?'<defs>'+defs+'</defs>':''}<g stroke="${stroke||INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;}
const SKIN='#ebc8a2';
function baseHead(skin,o){o=o||{};const cy=o.cy||108,rx=o.rx||44,ry=o.ry||50;
  return `<path d="M86 ${cy+30} L86 182 Q100 190 114 182 L114 ${cy+30} Z" fill="${o.shade||'#d2a982'}"/><ellipse cx="${100-rx+2}" cy="${cy+6}" rx="7" ry="11" fill="${skin}"/><ellipse cx="${100+rx-2}" cy="${cy+6}" rx="7" ry="11" fill="${skin}"/><ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}"/>`;}
const bodyP=(fill,top)=>`<path d="M12 240 C16 ${top||196} 54 176 100 176 C146 176 184 ${top||196} 188 240 Z" fill="${fill}"/>`;
const PORTRAIT={
 hero_m:()=>svgP(`<path d="M54 102 C48 52 78 38 102 40 C130 40 156 58 148 106 Z" fill="#26201b"/>${bodyP('#5f6152')}<path d="M100 178 L100 240" stroke-width="2"/><path d="M60 186 L76 240 M140 186 L124 240" stroke-width="2" fill="none"/>
  ${baseHead(SKIN)}<path d="M70 170 Q100 190 130 170 L134 188 Q100 206 66 188 Z" fill="#4f9c7f"/><path d="M126 186 L146 218 L132 220 L118 192 Z" fill="#3f8a6d"/>
  <path d="M54 100 C54 64 74 50 100 50 C128 50 148 64 146 100 L138 84 L132 98 L124 74 L114 92 L104 70 L94 92 L84 74 L76 96 L68 80 L62 102 Z" fill="#26201b"/>
  <path d="M73 97 L92 101 M127 97 L108 101" stroke-width="3.5"/>${eyes(114)}<path d="M93 140 Q100 143 107 140" fill="none" stroke-width="2.5"/>`),
 hero_f:()=>svgP(`<path d="M50 102 C46 50 80 36 100 36 C124 36 156 50 150 104 C156 150 154 190 148 206 L130 200 L136 120 L64 120 L70 200 L52 206 C44 186 44 144 50 102 Z" fill="#26201b"/>${bodyP('#5f6152')}<path d="M60 186 L76 240 M140 186 L124 240" stroke-width="2" fill="none"/>
  ${baseHead(SKIN,{rx:42,ry:49})}<path d="M70 170 Q100 190 130 170 L134 188 Q100 206 66 188 Z" fill="#4f9c7f"/><path d="M126 186 L146 218 L132 220 L118 192 Z" fill="#3f8a6d"/>
  <path d="M56 106 C54 62 80 46 104 46 C130 46 148 62 146 104 C138 86 124 74 106 72 C96 86 78 98 56 106 Z" fill="#26201b"/>
  <path d="M75 100 L92 102 M125 100 L108 102" stroke-width="2.5"/>${eyes(115,{ry:8.5,lash:1})}<path d="M94 140 Q100 143 106 140" fill="none" stroke-width="2.5"/>`),
 mo:()=>svgP(`<g opacity=".9" filter="url(#mg)"><path d="M10 240 C14 196 54 176 100 176 C146 176 186 196 190 240 Z" fill="#9fd3bc"/><path d="M70 178 L100 226 L130 178" fill="none" stroke-width="3"/><path d="M80 178 L100 210 L120 178" fill="none" stroke-width="2"/>
  <path d="M58 108 C52 70 76 52 100 52 C126 52 150 70 142 110 L146 160 L132 150 L136 106 L64 106 L68 150 L54 160 Z" fill="#f1f6f2"/>
  ${baseHead('#d6eee3',{shade:'#b9dccc',rx:41})}<circle cx="100" cy="46" r="15" fill="#f1f6f2"/><path d="M72 40 L130 50" stroke="#3f7a62" stroke-width="4"/>
  <path d="M60 98 C62 70 80 60 100 60 C120 60 138 70 140 98 C126 82 112 78 100 78 C88 78 74 82 60 98 Z" fill="#f1f6f2"/>
  <path d="M70 98 Q82 92 94 100 M130 98 Q118 92 106 100" stroke="#f1f6f2" stroke-width="5" fill="none"/><path d="M68 100 L62 112 M132 100 L138 112" stroke="#f1f6f2" stroke-width="3"/>
  ${eyesClosed(112,18)}<path d="M80 134 Q100 126 120 134 Q118 170 112 200 Q104 226 100 232 Q96 226 88 200 Q82 170 80 134 Z" fill="#f4f8f5"/><path d="M84 132 Q100 140 116 132" fill="none" stroke-width="3"/></g>`,
  '<filter id="mg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>','#2c6652'),
 tie:()=>svgP(`${bodyP('#34362f',190)}<path d="M40 204 L64 240 L84 240 L84 182 Q66 184 50 196 Z M160 204 L136 240 L116 240 L116 182 Q134 184 150 196 Z" fill="#6a5638"/>
  ${baseHead('#c99a72',{rx:48,ry:48,shade:'#a87c58'})}<path d="M54 100 C52 62 74 54 100 54 C126 54 148 62 146 100 C138 84 120 78 100 78 C80 78 62 84 54 100 Z" fill="#3a3530"/>
  <path d="M52 90 Q100 78 148 90 L148 102 Q100 90 52 102 Z" fill="#a23a2a"/><path d="M148 94 L166 108 L160 116 L146 100 Z" fill="#a23a2a"/>
  <path d="M72 104 L92 106 M128 104 L108 106" stroke-width="5"/>${eyes(118,{rx:4,ry:5})}<path d="M120 106 L134 136" stroke="#9a5a4a" stroke-width="3"/><path d="M124 116 L132 113 M127 124 L135 121" stroke="#9a5a4a" stroke-width="2"/>
  <path d="M88 142 L112 142" stroke-width="3"/><g fill="#6a5a4a" stroke="none">${[...Array(18)].map((_,i)=>`<circle cx="${70+(i%9)*7.5}" cy="${148+(i>8?6:0)+Math.abs(4-i%9)*-.8}" r="1"/>`).join('')}</g>`),
 he:()=>svgP(`<path d="M54 120 C46 80 70 66 100 66 C130 66 154 80 146 120 C150 150 136 168 128 172 L72 172 C64 168 50 150 54 120 Z" fill="#b8892c"/>${bodyP('#d9a441',204)}<path d="M84 186 L84 214 M116 186 L116 214" stroke-width="2"/>
  ${baseHead(SKIN,{cy:120,rx:40,ry:44})}<circle cx="64" cy="76" r="16" fill="#3a2a22"/><circle cx="136" cy="76" r="16" fill="#3a2a22"/><path d="M70 64 L60 58 L62 70 Z M130 64 L140 58 L138 70 Z" fill="#c8483a"/>
  <path d="M60 116 C58 84 78 72 100 72 C122 72 142 84 140 116 L132 104 L120 112 L110 102 L100 112 L90 102 L80 112 L68 104 Z" fill="#3a2a22"/>
  ${eyes(126,{rx:7,ry:10,dx:17})}<ellipse cx="74" cy="142" rx="8" ry="4" fill="#f0a0a0" stroke="none" opacity=".6"/><ellipse cx="126" cy="142" rx="8" ry="4" fill="#f0a0a0" stroke="none" opacity=".6"/>
  <ellipse cx="100" cy="148" rx="4" ry="5" fill="#8a3a32" stroke-width="2"/><rect x="122" y="128" width="14" height="7" rx="2" fill="#f4efe6" stroke-width="2" transform="rotate(-20 129 131)"/>`),
 hong:()=>svgP(`<path d="M52 110 C46 60 76 42 102 42 C132 42 156 62 150 112 C152 132 146 148 138 152 L136 112 L66 112 L62 152 C54 148 50 132 52 110 Z" fill="#7a2e22"/>${bodyP('#efe7da')}<path d="M18 240 C22 200 50 182 76 178 L92 240 Z M182 240 C178 200 150 182 124 178 L108 240 Z" fill="#a8352a"/><path d="M76 178 L68 160 L86 176 M124 178 L132 160 L114 176" fill="#8a2a20"/>
  ${baseHead(SKIN,{rx:42,ry:49})}<path d="M56 74 Q100 60 144 74" fill="none" stroke-width="5" stroke="#2a2a2a"/><circle cx="82" cy="72" r="12" fill="#3a4448"/><circle cx="82" cy="72" r="7" fill="#8fc6d6" stroke-width="2"/><circle cx="118" cy="72" r="12" fill="#3a4448"/><circle cx="118" cy="72" r="7" fill="#8fc6d6" stroke-width="2"/>
  <path d="M56 108 C58 82 76 70 100 72 C126 72 144 84 146 102 C130 92 112 86 96 88 C82 94 68 102 56 108 Z" fill="#7a2e22"/>
  <path d="M74 102 L92 104 M126 100 L108 104" stroke-width="3"/>${eyes(116,{lash:1})}<path d="M76 112 L70 108 M124 112 L130 108" stroke-width="2"/><path d="M90 140 Q104 144 113 135" fill="none" stroke-width="2.5"/><circle cx="58" cy="132" r="4" fill="#e3b862" stroke-width="2"/>`),
 zero:()=>svgP(`<path d="M50 104 C46 52 78 38 100 38 C122 38 154 52 150 104 L156 232 L128 232 L134 120 L66 120 L72 232 L44 232 Z" fill="#e6ecef"/>${bodyP('#dfe5ea')}<path d="M84 170 L84 186 Q100 194 116 186 L116 170" fill="#cfd8de"/>
  <circle cx="100" cy="216" r="13" fill="url(#zc)" stroke="#5fe6f5" stroke-width="2"/>
  ${baseHead('#f3ebe6',{rx:41,ry:49,shade:'#dccdc4'})}<path d="M58 104 C56 66 78 50 100 50 C122 50 144 66 142 104 L136 92 L128 102 L118 88 L108 100 L100 86 L92 100 L82 88 L72 102 L64 92 Z" fill="#e6ecef"/>
  <g filter="url(#zg)">${eyes(116,{col:'#38d4e6',rx:6,ry:8})}</g><path d="M66 128 L76 128 L80 134 L90 134 M70 136 L78 140" stroke="#5fe6f5" stroke-width="1.6" fill="none"/><path d="M94 142 L106 142" stroke-width="2"/>`,
  '<radialGradient id="zc"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#7ff0ff"/><stop offset="1" stop-color="#1a7a8a"/></radialGradient><filter id="zg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'),
 zhou:()=>svgP(`${bodyP('#24262a')}<path d="M100 178 L100 240" stroke="#8a8c90" stroke-width="2"/><path d="M66 180 L84 196 L100 180 L116 196 L134 180" fill="#1a1b1e"/>
  ${baseHead(SKIN,{rx:42,ry:50})}<path d="M54 102 C50 70 58 48 68 36 L78 58 L86 28 L96 54 L106 22 L114 52 L126 30 L130 56 L144 40 C152 60 152 84 146 102 C138 84 120 76 100 76 C80 76 62 84 54 102 Z" fill="#2e2219"/>
  <path d="M72 96 L94 106 M128 96 L106 106" stroke-width="4"/><path d="M80 92 L86 112" stroke="#b07060" stroke-width="2"/>${eyes(116,{rx:5,ry:5})}<path d="M86 140 Q100 136 116 130" fill="none" stroke-width="3"/>`),
 zhou2:()=>svgP(`${bodyP('#e3ddd2')}<path d="M70 178 L100 230 L130 178" fill="none" stroke="#b08a3a" stroke-width="3"/>
  ${baseHead('#d9b896',{rx:42,ry:50})}<path d="M54 102 C50 70 58 48 68 36 L78 58 L86 28 L96 54 L106 22 L114 52 L126 30 L130 56 L144 40 C152 60 152 84 146 102 C138 84 120 76 100 76 C80 76 62 84 54 102 Z" fill="#2e2219"/>
  <path d="M56 96 Q100 82 146 96 L144 126 Q100 116 58 126 Z" fill="#f2ede4"/><path d="M84 108 Q100 98 116 108 Q100 118 84 108 Z" fill="#fff" stroke-width="2"/><circle cx="100" cy="108" r="4" fill="#b8352a" stroke="none"/>
  <path d="M86 142 Q100 138 116 132" fill="none" stroke-width="3"/><path d="M120 150 L132 168" stroke="#8a5a4a" stroke-width="2"/>`),
 tq:()=>svgP(`<path d="M30 240 C30 150 50 60 100 40 C150 60 170 150 170 240 Z" fill="#e3ddd2"/><path d="M58 240 C60 196 76 176 100 176 C124 176 140 196 142 240" fill="none" stroke="#b08a3a" stroke-width="4"/>
  <ellipse cx="100" cy="112" rx="38" ry="48" fill="#1a1612"/><ellipse cx="100" cy="114" rx="33" ry="43" fill="#f6f2ea"/>
  <path d="M74 108 Q100 88 126 108 Q100 128 74 108 Z" fill="#fff" stroke-width="2.5"/><circle cx="100" cy="108" r="8" fill="#b8352a" stroke-width="2"/><circle cx="100" cy="108" r="3" fill="#1a1612" stroke="none"/>
  <path d="M100 126 L100 146" stroke="#c8c0b0" stroke-width="2"/>`),
 sx:()=>svgP(`<path d="M44 110 C36 50 76 30 100 30 C128 30 166 50 156 112 L166 236 L134 236 L138 120 L62 120 L66 236 L34 236 Z" fill="#141014"/>${bodyP('#1d1418')}<path d="M70 178 L100 228 L130 178" fill="none" stroke="#9a2a20" stroke-width="4"/>
  ${baseHead('#8a7a86',{rx:42,ry:50,shade:'#6a5a66'})}<path d="M58 106 C58 70 76 52 100 52 C126 52 144 70 142 106 L134 88 L124 102 L112 80 L100 98 L88 80 L76 102 L66 88 Z" fill="#141014"/>
  <path d="M74 98 L94 106 M126 98 L106 106" stroke-width="4"/><g filter="url(#sg)">${eyes(116,{col:'#ff5a3a',rx:5,ry:5})}</g>
  <path d="M120 124 L128 136 L124 148 M70 130 L80 140 L76 152 M96 64 L102 74 L98 84" stroke="#ff6a3a" stroke-width="2" fill="none"/><path d="M88 142 L112 140" stroke-width="3"/>`,
  '<filter id="sg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
};

/* ---------- 精灵 ---------- */
function svgS(inner,defs,vb){return `<svg viewBox="${vb||'0 0 140 140'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs?'<defs>'+defs+'</defs>':''}<g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;}
const shadow=(cx,rx)=>`<ellipse cx="${cx||70}" cy="131" rx="${rx||30}" ry="5" fill="rgba(0,0,0,.45)" stroke="none"/>`;
function heroSprite(f){const back=f?`<path d="M50 40 C48 18 92 16 92 40 L97 86 L84 82 L86 52 L54 52 L56 82 L43 86 Z" fill="#26201b"/>`:'';
  const hair=f?`<path d="M49 46 C47 24 62 20 72 22 C86 22 94 32 92 46 C84 38 74 34 64 37 C58 40 54 43 49 46 Z" fill="#26201b"/>`
  :`<path d="M47 46 C44 22 66 16 78 20 C92 22 98 34 94 48 L88 38 L84 46 L78 32 L72 44 L66 30 L60 44 L54 34 Z" fill="#26201b"/>`;
  return svgS(`${shadow(70,28)}<path d="M54 74 C38 76 24 70 14 80 C26 78 36 86 52 84 Z" fill="#4f9c7f"/>${back}
   <g class="lgB"><rect x="73" y="98" width="11" height="28" fill="#24221f"/><path d="M71 126 L88 126 L90 131 L71 131 Z" fill="#1a1714"/></g><g class="lgA"><rect x="56" y="98" width="11" height="28" fill="#2c2a26"/><path d="M54 126 L69 126 L69 131 L52 131 Z" fill="#1a1714"/></g>
   <path d="M50 68 L90 68 L95 104 L45 104 Z" fill="#5f6152"/><path d="M70 70 L70 104" stroke-width="1.5"/><path d="M50 70 L42 92 L50 96" fill="#5f6152"/>
   <path d="M52 66 Q70 76 88 66 L90 74 Q70 84 50 74 Z" fill="#4f9c7f"/>
   <circle cx="70" cy="44" r="21" fill="${SKIN}"/>${hair}<ellipse cx="82" cy="47" rx="2.6" ry="3.6" fill="#2a2018" stroke="none"/><path d="M77 40 L86 41" stroke-width="2"/><path d="M80 57 L85 56" stroke-width="1.6"/>
   <path d="M86 74 L100 82 L104 78" fill="none" stroke-width="7" stroke="#5f6152"/><circle cx="104" cy="79" r="4.5" fill="${SKIN}"/>
   <g filter="url(#hg)"><path d="M100 84 L136 38" stroke="#e8fff4" stroke-width="4"/></g><path d="M96 78 L108 88" stroke="#8a6a3a" stroke-width="4"/>`,
   '<filter id="hg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');}
function heroSit(f){const key=f?'hero_f':'hero_m';const cv=cvMemo('sit|'+key,()=>chibi(CH[key],0,0,12,true));
  return `<img src="${cv.toDataURL()}" alt="${f?'少女':'少年'}盘膝修炼" draggable="false">`;}

/* 敌人原型：面朝左 */
function E_rat(d){return `${shadow(76,34)}<path d="M108 104 C136 100 138 66 122 58" fill="none" stroke="${d.c2}" stroke-width="5"/>
  <ellipse cx="80" cy="98" rx="38" ry="24" fill="${d.c}"/>${d.spikes?`<path d="M58 78 L64 64 L70 76 L78 60 L84 74 L94 60 L98 76 L108 66 L108 84" fill="${d.c2}"/>`:''}
  <ellipse cx="60" cy="120" rx="8" ry="5" fill="${d.c2}"/><ellipse cx="98" cy="120" rx="8" ry="5" fill="${d.c2}"/>
  <path d="M54 86 C44 70 22 78 12 94 C22 102 40 108 56 102 Z" fill="${d.c}"/><circle cx="46" cy="72" r="9" fill="${d.c2}"/><circle cx="46" cy="72" r="4.5" fill="#d48a8a" stroke="none"/>
  <circle cx="34" cy="86" r="3.6" fill="${d.e}" stroke="none"/><path d="M16 98 L20 104 L23 98 M24 100 L27 106 L30 100" fill="#f4efe6" stroke-width="1.5"/>
  ${d.crown?`<path d="M36 66 L40 50 L46 62 L52 46 L56 62 L62 52 L62 68 Z" fill="#c8b48a"/><path d="M60 92 L76 100 M64 86 L80 92" stroke="${d.c2}" stroke-width="2"/>`:''}`;}
function E_beast(d){const tails=d.tails||1;let t='';for(let i=0;i<tails;i++){const a=-30+i*(60/Math.max(1,tails-1||1));t+=`<path d="M106 80 C128 ${70-i*6} 134 ${44-i*4} ${120+i*4} ${30+a*.3} C132 52 124 72 108 90 Z" fill="${d.c}" transform="rotate(${tails>1?a*.5:0} 106 84)"/>`;}
  return `${shadow(76,36)}${t}<rect x="56" y="92" width="8" height="34" fill="${d.c2}"/><rect x="94" y="92" width="8" height="34" fill="${d.c2}"/>
  <ellipse cx="80" cy="84" rx="38" ry="20" fill="${d.c}"/><rect x="64" y="94" width="8" height="32" fill="${d.c}"/><rect x="102" y="92" width="8" height="34" fill="${d.c}"/>
  <path d="M60 80 C54 58 40 50 26 54 L8 68 L26 74 C34 84 48 88 58 86 Z" fill="${d.c}"/><path d="M34 54 L40 32 L50 52 Z" fill="${d.c}"/><path d="M44 52 L54 36 L58 56 Z" fill="${d.c2}"/>
  <path d="M14 66 C22 70 30 70 36 68" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/><circle cx="34" cy="62" r="3.4" fill="${d.e}" stroke="none"/><path d="M14 70 L17 76 L20 71" fill="#f4efe6" stroke-width="1.5"/>
  ${d.flame?`<path d="M70 66 C66 50 76 46 74 34 C84 44 86 54 84 66 Z M90 66 C88 54 96 50 96 40 C104 50 104 58 100 68 Z" fill="#ff8a3a" stroke="#b03a1a"/>`:''}`;}
function E_flyer(d){const k=d.k;let s=shadow(70,22);
  if(k==='bat')s+=`<path d="M62 62 L12 40 L20 58 L6 70 L24 72 L18 88 L60 74 Z" fill="${d.c2}"/><path d="M78 62 L128 40 L120 58 L134 70 L116 72 L122 88 L80 74 Z" fill="${d.c2}"/><ellipse cx="70" cy="68" rx="14" ry="18" fill="${d.c}"/><path d="M60 54 L58 40 L66 50 M80 54 L82 40 L74 50" fill="${d.c}"/><circle cx="64" cy="62" r="3" fill="${d.e}" stroke="none"/><circle cx="76" cy="62" r="3" fill="${d.e}" stroke="none"/><path d="M64 74 L66 79 L68 74 M72 74 L74 79 L76 74" fill="#fff" stroke-width="1"/>`;
  else if(k==='crow')s+=`<path d="M70 64 C96 40 118 34 134 36 C122 48 110 56 92 70 Z" fill="${d.c2}"/><path d="M110 78 L134 84 L112 90 Z" fill="${d.c}"/><ellipse cx="80" cy="76" rx="30" ry="16" fill="${d.c}"/><circle cx="50" cy="68" r="13" fill="${d.c}"/><path d="M38 66 L16 72 L38 74 Z" fill="#6a6058"/><circle cx="46" cy="64" r="3" fill="${d.e}" stroke="none"/><path d="M70 74 C90 54 104 52 120 56 C108 66 96 76 78 84 Z" fill="${d.c2}"/>`;
  else if(k==='bee')s+=`<ellipse cx="78" cy="50" rx="22" ry="12" fill="rgba(220,240,255,.5)" transform="rotate(-25 78 50)"/><ellipse cx="62" cy="48" rx="18" ry="10" fill="rgba(220,240,255,.45)" transform="rotate(20 62 48)"/><ellipse cx="80" cy="76" rx="30" ry="18" fill="${d.c}"/><path d="M70 60 L70 92 M84 60 L84 93 M98 64 L98 88" stroke="${d.c2}" stroke-width="6"/><path d="M108 76 L126 80 L108 84 Z" fill="${d.c2}"/><circle cx="46" cy="72" r="14" fill="${d.c2}"/><circle cx="40" cy="68" r="5" fill="${d.e}" stroke="none"/><path d="M40 58 L32 44 M46 58 L44 42" fill="none"/>`;
  else s+=`<path d="M70 40 L132 70 L70 92 L8 70 Z" fill="${d.c}"/><path d="M70 92 L72 128" stroke="${d.c2}" stroke-width="3" fill="none"/><path d="M40 62 L70 52 L100 62" fill="none" stroke="${d.c2}" stroke-width="2"/><path d="M14 70 L4 60 M14 72 L4 80" stroke-width="2"/><circle cx="26" cy="66" r="3" fill="${d.e}" stroke="none"/><circle cx="26" cy="76" r="3" fill="${d.e}" stroke="none"/><g fill="${d.e}" stroke="none" opacity=".7">${[50,70,90,110].map(x=>`<circle cx="${x}" cy="72" r="2"/>`).join('')}</g>`;
  return s;}
function E_worm(d){let s=shadow(70,48);const n=d.big?10:8;const segs=[];for(let i=n-1;i>=0;i--){const x=24+i*(96/n),y=96+Math.sin(i*.9)*10,r=(d.big?17:14)-i*.7;segs.push([x,y,r]);}
  segs.forEach(([x,y,r],j)=>{const i=n-1-j;if(d.k==='centi'){s+=`<path d="M${x} ${y} L${x-6} ${y+r+12} M${x} ${y} L${x+6} ${y+r+12}" stroke="${d.c2}" stroke-width="2.5"/>`;}
    s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${i%2?d.c2:d.c}"/>`;if(d.spikes)s+=`<path d="M${x-4} ${y-r+2} L${x} ${y-r-10} L${x+4} ${y-r+2} Z" fill="#c8c8c0"/>`;
    if(d.k==='vine'&&i%2)s+=`<path d="M${x} ${y-r} C${x+10} ${y-r-14} ${x+20} ${y-r-6} ${x+6} ${y-r+2} Z" fill="#5aa04a"/>`;});
  const [hx,hy]=[segs[segs.length-1][0],segs[segs.length-1][1]];
  if(d.k==='vine')s+=`<circle cx="${hx-6}" cy="${hy-4}" r="16" fill="#3a6a2a"/><path d="M${hx-22} ${hy-4} L${hx-34} ${hy-14} L${hx-26} ${hy+2} L${hx-36} ${hy+10} L${hx-20} ${hy+6} Z" fill="#c8483a"/><circle cx="${hx-10}" cy="${hy-10}" r="3" fill="${d.e}" stroke="none"/>`;
  else s+=`<path d="M${hx-12} ${hy-6} L${hx-28} ${hy-14} L${hx-18} ${hy} Z M${hx-12} ${hy+6} L${hx-28} ${hy+14} L${hx-18} ${hy} Z" fill="${d.c2}"/><circle cx="${hx-4}" cy="${hy-6}" r="3.4" fill="${d.e}" stroke="none"/><circle cx="${hx+4}" cy="${hy-8}" r="2.4" fill="${d.e}" stroke="none"/>`;
  return s;}
function E_human(d){const k=d.k;let s=shadow(70,30);
  if(k==='rock'){s+=`<path d="M40 126 L36 90 L28 70 L44 46 L70 34 L98 44 L112 72 L104 92 L100 126 L82 126 L78 100 L62 100 L58 126 Z" fill="${d.c}"/><path d="M50 60 L60 74 L54 88 M88 54 L84 70 L94 84 M66 100 L72 112" stroke="#ff8a3a" stroke-width="2" fill="none"/><circle cx="60" cy="56" r="3.5" fill="${d.e}" stroke="none"/><circle cx="78" cy="54" r="3.5" fill="${d.e}" stroke="none"/><path d="M28 70 L12 90 L22 100 L36 84 Z M112 72 L126 92 L116 100 L104 86 Z" fill="${d.c2}"/>`;return s;}
  if(k==='shadow'){s+=`<path d="M70 20 C98 24 106 54 104 80 L112 128 L92 116 L84 130 L72 116 L60 130 L52 116 L32 128 L40 80 C36 54 44 24 70 20 Z" fill="${d.c}" opacity=".95"/><path d="M50 34 L40 12 L58 28 M90 34 L100 12 L82 28" fill="${d.c}"/><path d="M54 52 L66 56 M86 52 L74 56" stroke="${d.e}" stroke-width="4"/><path d="M40 80 L14 64 M100 80 L126 64" stroke="${d.c}" stroke-width="8"/>`;return s;}
  const legs=d.legs||d.c2,torso=d.c,skin=d.skin||'#cdb8a0';
  s+=`<rect x="54" y="92" width="12" height="34" fill="${legs}"/><rect x="74" y="92" width="12" height="34" fill="${legs}"/>`;
  if(k==='golem')s+=`<rect x="40" y="56" width="60" height="42" rx="4" fill="${torso}"/><rect x="26" y="58" width="14" height="40" fill="${d.c2}"/><rect x="100" y="58" width="14" height="40" fill="${d.c2}"/><rect x="52" y="26" width="36" height="30" rx="3" fill="${d.c2}"/><circle cx="62" cy="40" r="5" fill="${d.e}" stroke="none"/><circle cx="50" cy="66" r="2.5" fill="#3a2a1a"/><circle cx="90" cy="66" r="2.5" fill="#3a2a1a"/><path d="M60 76 L80 86" stroke="#3a2a1a"/>`;
  else if(k==='mech')s+=`<path d="M44 56 L96 56 L100 96 L40 96 Z" fill="${torso}"/><path d="M40 58 L26 88 L34 96 L46 72 Z M100 58 L120 76 L130 70" fill="${d.c2}"/><path d="M118 72 L134 66" stroke="#ff5a4a" stroke-width="3"/><rect x="52" y="24" width="36" height="32" rx="8" fill="${d.c2}"/><rect x="50" y="36" width="40" height="7" fill="${d.e}" stroke="none"/><path d="M70 24 L70 10" /><circle cx="70" cy="9" r="3" fill="${d.e}" stroke="none"/><path d="M54 70 L86 70 M54 80 L86 80" stroke-width="1.5"/>`;
  else if(k==='specimen')s+=`<path d="M46 58 C40 70 42 90 46 98 L94 98 C98 86 100 70 92 56 Z" fill="${torso}"/><path d="M46 62 C30 70 26 92 22 110 M92 60 C110 72 116 92 122 106" fill="none" stroke="${torso}" stroke-width="9"/><circle cx="70" cy="76" r="9" fill="${d.e}" stroke="#2a8a9a"/><path d="M52 26 C40 30 42 56 56 58 L84 58 C98 54 98 30 86 26 Z" fill="${torso}"/><circle cx="62" cy="40" r="4" fill="#111" /><circle cx="80" cy="42" r="6" fill="#111"/><path d="M90 50 L108 30 M92 56 L112 52" stroke="#8ab0b8" stroke-width="2"/>`;
  else if(k==='corpse')s+=`<path d="M42 56 L98 56 L106 120 L92 112 L84 122 L74 112 L62 122 L54 112 L34 120 Z" fill="${torso}"/><path d="M44 60 L22 82 M96 60 L110 84" stroke="${torso}" stroke-width="8"/><circle cx="70" cy="40" r="18" fill="${skin}" transform="rotate(-15 70 40)"/><path d="M52 36 C54 18 86 18 88 34" fill="#2a2a24"/><circle cx="62" cy="42" r="3" fill="${d.e}" stroke="none"/><circle cx="76" cy="44" r="3" fill="${d.e}" stroke="none"/><path d="M60 70 L80 70" stroke="#4a5a3a" stroke-width="2"/>`;
  else if(k==='girl')s+=`<path d="M48 22 C44 4 96 4 92 22 L98 110 L82 110 L84 40 L56 40 L58 110 L42 110 Z" fill="#e6ecef"/><path d="M48 56 L92 56 L100 100 L40 100 Z" fill="#dfe5ea"/><circle cx="70" cy="74" r="7" fill="#7ff0ff" stroke="#2a9aaa"/><path d="M48 60 L32 84 M92 60 L110 80" stroke="#dfe5ea" stroke-width="7"/><circle cx="70" cy="36" r="17" fill="#f3ebe6"/><path d="M53 34 C52 16 88 16 87 34 C80 26 60 26 53 34 Z" fill="#e6ecef"/><circle cx="63" cy="38" r="3" fill="#38d4e6" stroke="none"/><circle cx="77" cy="38" r="3" fill="#38d4e6" stroke="none"/>`;
  else if(k==='fallen')s+=`<path d="M70 14 C40 14 30 40 34 70 L22 128 L52 116 L70 128 L88 116 L118 128 L106 70 C110 40 100 14 70 14 Z" fill="#141014"/><path d="M42 54 L98 54 L104 120 L36 120 Z" fill="${torso}"/><path d="M70 56 L70 118" stroke="#9a2a20" stroke-width="3"/><path d="M42 60 L18 90 M98 60 L122 92" stroke="${torso}" stroke-width="9"/><circle cx="70" cy="36" r="18" fill="#8a7a86"/><path d="M52 32 C52 18 88 18 88 32 L82 28 L76 34 L70 26 L64 34 L58 28 Z" fill="#141014"/><circle cx="63" cy="38" r="3" fill="#ff5a3a" stroke="none"/><circle cx="77" cy="38" r="3" fill="#ff5a3a" stroke="none"/><path d="M58 70 L66 82 L60 94 M84 66 L78 80" stroke="#ff6a3a" stroke-width="2" fill="none"/>`;
  else{/* masked cultivator (周烈/追兵) */s+=`<path d="M44 56 L96 56 L102 100 L38 100 Z" fill="${torso}"/><path d="M44 60 L28 86 M96 60 L116 72" stroke="${torso}" stroke-width="8"/><g filter="url(#ef)"><path d="M116 70 C110 58 120 52 118 42 C128 52 130 62 124 72 Z" fill="#ff8a3a" stroke="#c0441a"/></g><circle cx="70" cy="36" r="18" fill="#d9b896"/><path d="M52 36 C48 22 56 12 62 8 L66 20 L72 4 L78 18 L86 8 C92 16 92 28 88 36 C80 28 60 28 52 36 Z" fill="#2e2219"/>${d.mask?`<path d="M52 34 Q70 26 88 34 L88 44 Q70 40 52 44 Z" fill="#f2ede4"/><circle cx="70" cy="38" r="2.5" fill="#b8352a" stroke="none"/>`:`<circle cx="62" cy="38" r="2.5" fill="#2a2018" stroke="none"/><path d="M58 32 L66 34" stroke-width="2"/>`}`;}
  return s;}
function E_ghost(d){let s=`<path d="M70 26 C102 26 110 58 106 86 C104 104 94 116 86 128 C82 116 76 120 70 130 C66 118 58 122 52 130 C50 114 36 104 34 86 C30 58 38 26 70 26 Z" fill="${d.c}" opacity=".85"/>`;
  if(d.eye)s+=`<ellipse cx="70" cy="66" rx="24" ry="14" fill="#fff8e6"/><circle cx="70" cy="66" r="10" fill="${d.e}"/><circle cx="70" cy="66" r="4" fill="#1a1408" stroke="none"/>`;
  else s+=`<ellipse cx="58" cy="62" rx="7" ry="9" fill="#0d0d14"/><ellipse cx="82" cy="62" rx="7" ry="9" fill="#0d0d14"/><circle cx="58" cy="63" r="2.6" fill="${d.e}" stroke="none"/><circle cx="82" cy="63" r="2.6" fill="${d.e}" stroke="none"/><path d="M60 86 Q70 80 80 86" fill="none" stroke="#0d0d14" stroke-width="3"/>`;
  if(d.k==='em')s+=`<path d="M30 50 L40 58 L34 66 L44 72 M110 46 L100 56 L108 62 L98 70" stroke="#8ff4ff" stroke-width="2" fill="none"/>`;
  if(d.k==='drown')s+=`<path d="M40 30 C50 44 46 60 42 70 M100 30 C92 44 96 60 100 72" stroke="${d.c2}" stroke-width="4" fill="none"/>`;
  return s;}
function E_crab(d){return `${shadow(70,40)}<path d="M40 104 L20 126 M50 108 L36 128 M100 104 L120 126 M90 108 L104 128" stroke="${d.c2}" stroke-width="4"/>
  <ellipse cx="70" cy="96" rx="40" ry="24" fill="${d.c}"/><path d="M50 92 Q70 76 90 92 Q70 112 50 92 Z" fill="${d.c2}"/><circle cx="62" cy="92" r="3" fill="#f4efe6"/><circle cx="78" cy="92" r="3" fill="#f4efe6"/><path d="M62 100 Q70 104 78 100" fill="none" stroke="#f4efe6" stroke-width="2"/>
  <path d="M60 74 L56 56 M80 74 L84 56" stroke="${d.c2}" stroke-width="3"/><circle cx="56" cy="54" r="5" fill="${d.e}"/><circle cx="84" cy="54" r="5" fill="${d.e}"/>
  <path d="M34 90 L18 70" stroke="${d.c}" stroke-width="9"/><path d="M18 70 C2 66 0 46 14 40 L22 56 L28 44 C38 52 32 68 18 70 Z" fill="${d.c}"/><path d="M106 90 L122 70" stroke="${d.c}" stroke-width="9"/><path d="M122 70 C138 66 140 46 126 40 L118 56 L112 44 C102 52 108 68 122 70 Z" fill="${d.c}"/>`;}
function E_fish(d){if(d.k==='serpent')return `<path d="M128 120 C110 132 80 126 84 104 C88 84 120 90 118 70 C116 50 84 52 70 64 C58 74 46 74 40 64" fill="none" stroke="${d.c}" stroke-width="22"/><path d="M128 120 C110 132 80 126 84 104 C88 84 120 90 118 70 C116 50 84 52 70 64" fill="none" stroke="${d.c2}" stroke-width="4" stroke-dasharray="4 8"/>
  <path d="M48 50 C30 46 14 54 8 64 C16 72 34 76 48 72 Z" fill="${d.c}"/><path d="M38 50 L30 30 L42 46 M46 52 L48 32 L52 50" fill="#e8dcb8"/><circle cx="28" cy="58" r="3.5" fill="${d.e}" stroke="none"/><path d="M12 66 C0 70 -4 80 4 86 M16 68 C10 78 12 88 20 90" fill="none" stroke="${d.c2}" stroke-width="2"/><path d="M10 64 L14 68 L17 64" fill="#fff" stroke-width="1"/>`;
  return `${shadow(70,40)}<path d="M120 76 L138 56 L134 80 L138 102 Z" fill="${d.c2}"/><path d="M14 80 C30 56 80 50 122 76 C84 104 34 104 14 80 Z" fill="${d.c}"/><path d="M60 58 L74 34 L84 62 Z" fill="${d.c2}"/><path d="M18 84 C40 92 80 94 110 82" fill="none" stroke="#e8eef0" stroke-width="2" opacity=".6"/>
  <circle cx="32" cy="74" r="3.5" fill="${d.e}" stroke="none"/><path d="M16 84 L22 90 L26 84 L30 90 L34 84" fill="#fff" stroke-width="1.4"/><path d="M48 70 L48 84 M54 70 L54 84 M60 72 L60 84" stroke="${d.c2}" stroke-width="2"/>`;}
function E_tree(d){return `${shadow(70,50)}<path d="M30 128 C40 116 44 100 46 84 L94 84 C96 100 100 116 112 128 Z" fill="${d.c2}"/><path d="M30 128 L14 132 M112 128 L130 132 M52 128 L48 136 M90 128 L94 136" stroke="${d.c2}" stroke-width="5"/>
  <circle cx="70" cy="40" r="34" fill="${d.c}"/><circle cx="40" cy="50" r="22" fill="${d.c}"/><circle cx="102" cy="48" r="24" fill="${d.c}"/><g fill="#d8ff9a" stroke="none" opacity=".8">${[[50,30],[80,22],[96,44],[36,54],[64,52]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>
  <path d="M46 84 L94 84 L92 58 L48 58 Z" fill="${d.c2}"/><ellipse cx="58" cy="74" rx="6" ry="8" fill="#140c08"/><ellipse cx="82" cy="74" rx="6" ry="8" fill="#140c08"/><circle cx="58" cy="75" r="2.4" fill="${d.e}" stroke="none"/><circle cx="82" cy="75" r="2.4" fill="${d.e}" stroke="none"/>
  <path d="M60 98 Q70 92 80 98 Q70 110 60 98 Z" fill="#140c08"/><path d="M46 70 C30 74 18 64 10 50 M94 70 C110 78 122 70 132 58" fill="none" stroke="${d.c2}" stroke-width="6"/><path d="M10 50 L4 42 M10 50 L2 54 M132 58 L138 50 M132 58 L140 62" stroke="${d.c2}" stroke-width="3"/>`;}
const ARCH={rat:E_rat,beast:E_beast,flyer:E_flyer,worm:E_worm,human:E_human,ghost:E_ghost,crab:E_crab,fish:E_fish,tree:E_tree};
const LOOK={
 '变异鼠':{a:'rat',c:'#7a7468',c2:'#4a453c',e:'#ff4a3a'},'腐尸蝠':{a:'flyer',k:'bat',c:'#5a4a5e',c2:'#3a2e3e',e:'#ffcf4a'},'污水蛭':{a:'worm',c:'#4a6a3e',c2:'#33502c',e:'#e8ff6a'},
 '鼠王·裂齿':{a:'rat',c:'#6a6458',c2:'#3a352e',e:'#ff3020',spikes:1,crown:1},
 '铁甲蜈蚣':{a:'worm',k:'centi',c:'#7a5a3a',c2:'#4a3a2a',e:'#ffb03a'},'废铁傀儡':{a:'human',k:'golem',c:'#8a6a4a',c2:'#5a4430',e:'#ff8a3a'},'灰鸦群':{a:'flyer',k:'crow',c:'#3a3a3e',c2:'#26262a',e:'#ff5a4a'},
 '钢骨百足':{a:'worm',k:'centi',c:'#8a8a90',c2:'#4a4a52',e:'#ff4a3a',spikes:1,big:1},
 '藤妖':{a:'worm',k:'vine',c:'#3e6a32',c2:'#2a4a22',e:'#ffef6a'},'狂化灵狐':{a:'beast',c:'#d08a3a',c2:'#8a5226',e:'#a8ffef',tails:3},'噬灵蜂':{a:'flyer',k:'bee',c:'#e0b83a',c2:'#2a2216',e:'#ff5a3a'},
 '千年槐妖':{a:'tree',c:'#2e4a26',c2:'#4a3424',e:'#d8ff6a'},
 '鬼面蟹':{a:'crab',c:'#a8483a',c2:'#6a2a22',e:'#fff07a'},'雾鲨':{a:'fish',c:'#6a7a80',c2:'#3e4a50',e:'#ff4a3a'},'溺魂':{a:'ghost',k:'drown',c:'#6a90a8',c2:'#3a5a6a',e:'#bff4ff'},
 '海眼蛟':{a:'fish',k:'serpent',c:'#2e6a6a',c2:'#1a3e40',e:'#ffe06a'},
 '失控机兵':{a:'human',k:'mech',c:'#5a6278',c2:'#3a4054',e:'#ff4a4a'},'灵化实验体':{a:'human',k:'specimen',c:'#b8c8cc',c2:'#6a7a80',e:'#7ff0ff'},'电磁幽灵':{a:'ghost',k:'em',c:'#4a8aa8',c2:'#2a5a70',e:'#bff4ff'},
 '零号':{a:'human',k:'girl',c:'#dfe5ea',c2:'#9aa8b0',e:'#7ff0ff'},
 '尸傀修士':{a:'human',k:'corpse',c:'#4a5a48',c2:'#2e382c',e:'#9aff6a',skin:'#9aa890'},'赤焰狼':{a:'beast',c:'#8a2a1a',c2:'#4a1a10',e:'#ffcf4a',flame:1},'石魔':{a:'human',k:'rock',c:'#5a5048',c2:'#3a342e',e:'#ff8a3a'},
 '堕仙残躯':{a:'human',k:'fallen',c:'#2a1a20',c2:'#141014',e:'#ff5a3a'},
 '灵潮化身':{a:'ghost',c:'#e8c87a',c2:'#a88a3a',e:'#fff'},'虚空蝠鲼':{a:'flyer',k:'manta',c:'#3a2a5a',c2:'#20163a',e:'#d8a8ff'},'天魔影':{a:'human',k:'shadow',c:'#141016',c2:'#000',e:'#ff3a5a'},
 '灵潮之主':{a:'ghost',c:'#f0d890',c2:'#b89a4a',e:'#ffb03a',eye:1},
 '周烈':{a:'human',k:'cult',c:'#24262a',c2:'#1a1b1e',e:'#ff8a3a'},'天穹追兵':{a:'human',k:'cult',c:'#e3ddd2',c2:'#9a9488',e:'#ff8a3a',mask:1}
};
const ABYSS_POOL=['变异鼠','狂化灵狐','鬼面蟹','失控机兵','尸傀修士','赤焰狼','天魔影','虚空蝠鲼','电磁幽灵','石魔'];
function enemySVG(name,boss,tint){let d=LOOK[name];if(!d)d=LOOK['天魔影'];d=Object.assign({},d);if(tint){d.c='#2a1e3e';d.c2='#160e24';d.e='#d8a8ff';}
  const inner=(ARCH[d.a]||E_human)(d);
  const defs='<filter id="ef" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  return svgS(inner,defs);}

/* ---------- 青石站长站台（可行走） ---------- */
SCN.platform=function(c,w,h,R){skyG(c,w,h,'#0d110f','#1a1f1a');
  c.fillStyle='#1d231f';c.fillRect(0,h*.13,w,h*.66);
  c.strokeStyle='rgba(255,255,255,.035)';c.lineWidth=1;for(let x=0;x<w;x+=h*.07){c.beginPath();c.moveTo(x,h*.13);c.lineTo(x,h*.79);c.stroke();}
  for(let y=h*.19;y<h*.79;y+=h*.07){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.fillStyle='rgba(120,150,130,.06)';c.fillRect(0,h*.5,w,h*.05);
  c.fillStyle='#090c0a';c.fillRect(0,0,w,h*.13);
  for(let x=h*.5;x<w;x+=h*.95){const broken=R()<.3;if(!broken)glow(c,x+h*.14,h*.13,h*.45,'rgba(200,240,220,.10)');c.fillStyle=broken?'#2a302c':'#dcf2e8';c.fillRect(x,h*.105,h*.28,h*.02);}
  for(let x=h*.9;x<w-h*.4;x+=h*1.3){c.fillStyle='#252b26';c.fillRect(x,h*.13,h*.12,h*.66);c.fillStyle='rgba(255,255,255,.05)';c.fillRect(x,h*.13,h*.02,h*.66);c.fillStyle='#1a1f1b';c.fillRect(x-h*.01,h*.72,h*.14,h*.07);}
  [.24,.56,.84].forEach(f=>{const x=w*f;c.fillStyle='#244236';c.fillRect(x-h*.22,h*.2,h*.44,h*.09);c.strokeStyle='#4f8a73';c.lineWidth=2;c.strokeRect(x-h*.22,h*.2,h*.44,h*.09);
    c.fillStyle='#d6eee2';c.font=Math.round(h*.055)+'px "Ma Shan Zheng","Noto Serif SC",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('青石站',x,h*.247);});
  c.strokeStyle='rgba(70,58,44,.9)';c.lineWidth=1.5;c.beginPath();c.moveTo(0,h*.34);const seg=h*.6;for(let x=0;x<w;x+=seg)c.quadraticCurveTo(x+seg/2,h*.4,x+seg,h*.34);c.stroke();
  for(let x=seg/2;x<w;x+=seg){glow(c,x,h*.37,h*.18,'rgba(240,160,80,.2)');c.fillStyle='#f3b766';c.beginPath();c.arc(x,h*.372,Math.max(2,h*.013),0,6.28);c.fill();}
  c.fillStyle='#131713';c.fillRect(0,h*.79,w,h);c.fillStyle='rgba(224,184,58,.55)';for(let x=0;x<w;x+=h*.12)c.fillRect(x,h*.79,h*.07,h*.012);
  c.fillStyle='rgba(255,255,255,.03)';for(let i=0;i<40;i++)c.fillRect(R()*w,h*(.82+R()*.15),h*(.05+R()*.1),1);
  /* 通风道 */ const vx=w*.035;c.fillStyle='#050706';arch(c,vx,h*.79,h*.32,h*.5);c.fill();c.strokeStyle='#39433d';c.lineWidth=3;c.stroke();
  c.strokeStyle='rgba(120,140,130,.35)';c.lineWidth=2;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(vx+i*h*.04,h*.36);c.lineTo(vx+i*h*.04,h*.79);c.stroke();}
  glow(c,vx,h*.6,h*.2,'rgba(143,214,181,.18)');
  /* 帐篷区 */ const cols=['#4a4436','#3b4a44','#5a3b32','#454a52','#52482e'];
  for(let i=0;i<6;i++){const tx=w*(.1+i*.035+R()*.01),tw=h*(.34+R()*.12),th=h*(.24+R()*.08),by=h*.8;c.fillStyle=cols[i%5];c.beginPath();c.moveTo(tx-tw/2,by);c.lineTo(tx,by-th);c.lineTo(tx+tw/2,by);c.fill();
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(tx,by-th);c.lineTo(tx+tw/2,by);c.lineTo(tx+tw*.08,by);c.fill();}
  c.strokeStyle='#5a5040';c.lineWidth=1;c.beginPath();c.moveTo(w*.11,h*.55);c.lineTo(w*.26,h*.53);c.stroke();[.13,.16,.2,.23].forEach(f=>{c.fillStyle=pick2(R,['#8a6a5a','#5a6a7a','#8a8060']);c.fillRect(w*f,h*.545,h*.06,h*.08);});
  /* 粥棚 */ const sx=w*.335;c.fillStyle='#3a2e22';c.fillRect(sx-h*.36,h*.58,h*.72,h*.21);c.fillStyle='#4a3a2a';c.fillRect(sx-h*.38,h*.56,h*.76,h*.03);
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#c8b48a':'#8a3a2a';c.beginPath();c.moveTo(sx-h*.4+i*h*.135,h*.36);c.lineTo(sx-h*.4+(i+1)*h*.135,h*.36);c.lineTo(sx-h*.4+(i+1)*h*.135,h*.42);c.lineTo(sx-h*.4+i*h*.135,h*.42);c.fill();}
  c.strokeStyle='#2a2018';c.lineWidth=3;c.beginPath();c.moveTo(sx-h*.38,h*.36);c.lineTo(sx-h*.38,h*.58);c.moveTo(sx+h*.38,h*.36);c.lineTo(sx+h*.38,h*.58);c.stroke();
  c.fillStyle='#2a2a2e';c.beginPath();c.ellipse(sx,h*.55,h*.12,h*.035,0,0,6.28);c.fill();c.fillRect(sx-h*.12,h*.48,h*.24,h*.07);glow(c,sx,h*.5,h*.16,'rgba(255,190,120,.25)');
  c.strokeStyle='rgba(230,230,230,.25)';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(sx+i*h*.05,h*.47);c.bezierCurveTo(sx+i*h*.05+8,h*.43,sx+i*h*.05-8,h*.41,sx+i*h*.05,h*.37);c.stroke();}
  c.fillStyle='#e8dcc0';c.font=Math.round(h*.07)+'px "Ma Shan Zheng",serif';c.textAlign='center';c.fillText('粥',sx,h*.68);
  /* 告示板 */ const bx=w*.5;c.fillStyle='#5a4228';c.fillRect(bx-h*.24,h*.42,h*.48,h*.3);c.strokeStyle='#2a1e12';c.lineWidth=3;c.strokeRect(bx-h*.24,h*.42,h*.48,h*.3);
  c.fillRect(bx-h*.2,h*.72,h*.03,h*.07);c.fillRect(bx+h*.17,h*.72,h*.03,h*.07);
  for(let i=0;i<7;i++){c.save();c.translate(bx-h*.18+R()*h*.34,h*.45+R()*h*.2);c.rotate((R()-.5)*.3);c.fillStyle=pick2(R,['#e8e0cc','#f0e6b0','#d8e0e8']);c.fillRect(0,0,h*.08,h*.06);c.fillStyle='#c8483a';c.beginPath();c.arc(h*.04,h*.006,2,0,6.28);c.fill();c.restore();}
  /* 火堆 */ const fx=w*.665;glow(c,fx,h*.76,h*.3,'rgba(255,140,60,.3)');c.fillStyle='#3a3430';for(let i=0;i<7;i++){const a=i/7*6.28;c.beginPath();c.arc(fx+Math.cos(a)*h*.07,h*.79+Math.sin(a)*h*.015,h*.022,0,6.28);c.fill();}
  c.fillStyle='#ff9a4a';c.beginPath();c.moveTo(fx-h*.04,h*.785);c.quadraticCurveTo(fx-h*.03,h*.71,fx,h*.68);c.quadraticCurveTo(fx+h*.03,h*.72,fx+h*.04,h*.785);c.fill();c.fillStyle='#ffe08a';c.beginPath();c.moveTo(fx-h*.018,h*.785);c.quadraticCurveTo(fx,h*.73,fx+h*.018,h*.785);c.fill();
  /* 发电机 */ const gx=w*.6;c.fillStyle='#3a4038';c.fillRect(gx-h*.13,h*.62,h*.26,h*.17);c.fillStyle='#2a2e28';c.fillRect(gx-h*.1,h*.65,h*.08,h*.08);c.strokeStyle='#5a6a5a';c.lineWidth=2;c.strokeRect(gx-h*.13,h*.62,h*.26,h*.17);c.fillStyle='#8fd6b5';c.fillRect(gx+h*.05,h*.66,h*.03,h*.02);
  /* 北出口楼梯 */ const ex=w*.93;c.fillStyle=lg(c,ex,0,w,0,[[0,'rgba(255,240,200,0)'],[1,'rgba(255,240,200,.28)']]);c.beginPath();c.moveTo(ex,h*.13);c.lineTo(w,0);c.lineTo(w,h*.79);c.lineTo(ex+h*.1,h*.79);c.fill();
  for(let i=0;i<8;i++){c.fillStyle=i%2?'#262b26':'#2e342e';c.fillRect(ex+i*h*.07,h*.79-(i+1)*h*.07,w,h*.07);}
  c.fillStyle='#e0b83a';c.fillRect(ex-h*.06,h*.3,h*.2,h*.07);c.fillStyle='#1a1408';c.font=Math.round(h*.045)+'px "Noto Serif SC",serif';c.textAlign='center';c.fillText('北出口',ex+h*.04,h*.335);
  for(let i=0;i<9;i++)person(c,R()*w*.9+w*.05,h*(.62+R()*.05),h*.13,'rgba(8,10,8,.55)');
  vign(c,w,h,.35);};
function pick2(R,a){return a[Math.floor(R()*a.length)];}
/* 站台上的 NPC 小人：立绘的头 + 简单身体 */
const NPC_LOOK={tie:{c:'#6a5638',l:'#2e2a24',w:1.15},he:{c:'#d9a441',l:'#3a3a3e',w:.8,small:1},hong:{c:'#a8352a',l:'#2a2224',w:1},zero:{c:'#dfe5ea',l:'#9aa8b0',w:.95},zhou:{c:'#24262a',l:'#1a1b1e',w:1},guo:{c:'#3a4a5a',l:'#2a2a2a',w:1}};
function npcFigure(k){const L=NPC_LOOK[k]||NPC_LOOK.tie;const bw=34*L.w,top=L.small?82:74;
  let head=(PORTRAIT[k]||PORTRAIT.tie)();head=head.replace('<svg viewBox="0 0 200 240"','<svg x="12" y="'+(L.small?16:4)+'" width="76" height="'+(L.small?74:84)+'" viewBox="38 28 124 150"');
  return `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="50" cy="155" rx="${bw*.8}" ry="4" fill="rgba(0,0,0,.45)"/>
   <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><rect x="${50-bw*.36}" y="${top+44}" width="${bw*.3}" height="${150-top-44}" fill="${L.l}"/><rect x="${50+bw*.06}" y="${top+44}" width="${bw*.3}" height="${150-top-44}" fill="${L.l}"/>
   <path d="M${50-bw/2} ${top+10} Q50 ${top} ${50+bw/2} ${top+10} L${50+bw/2+4} ${top+50} L${50-bw/2-4} ${top+50} Z" fill="${L.c}"/>
   <path d="M${50-bw/2} ${top+12} L${50-bw/2-8} ${top+40} M${50+bw/2} ${top+12} L${50+bw/2+8} ${top+40}" stroke="${L.c}" stroke-width="8"/></g>${head}</svg>`;}
function moGhost(){let h=PORTRAIT.mo();return h.replace('<svg viewBox="0 0 200 240"','<svg viewBox="30 20 140 220"');}
function truckSVG(){return `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
  <rect x="6" y="20" width="130" height="74" fill="#6a2a22"/><path d="M136 40 L180 40 L206 64 L206 94 L136 94 Z" fill="#8a3a2a"/><path d="M146 48 L176 48 L194 66 L146 66 Z" fill="#8fc6d6"/>
  <rect x="14" y="30" width="114" height="30" fill="#5a221c"/><path d="M30 34 L60 54 L90 34" fill="none" stroke="#e3b862" stroke-width="4"/>
  <circle cx="44" cy="98" r="15" fill="#1a1714"/><circle cx="44" cy="98" r="6" fill="#5a5a5a"/><circle cx="172" cy="98" r="15" fill="#1a1714"/><circle cx="172" cy="98" r="6" fill="#5a5a5a"/>
  <path d="M110 20 L110 0 L130 8 L110 16" fill="#cf4a3c"/></g></svg>`;}
