/* ================= 画面加强：坊市屋舍、树木、人物、宗门、仙府、雷劫 ================= */
Object.assign(TL,{
 dirt:{c:['#8a7454','#93795a','#7e6a4c','#9a8260'],pat:'speck'},
 flag:{c:['#8e8a7e','#999488','#85817a','#938e82'],pat:'grid',gc:'#6a665c'},
 grassV:{c:['#5e7a3e','#6a8444','#55703a','#648040'],pat:'tuft'}
});
/* 层叠树冠：深→浅，带高光与阴影 */
function leafy(x,cx,by,s,G,R){const tr=[cx,by-24*s];x.fillStyle='#3a2a1e';x.beginPath();x.moveTo(cx-3.5*s,by);x.quadraticCurveTo(cx-2*s,by-14*s,cx-3*s,by-26*s);x.lineTo(cx+3*s,by-26*s);x.quadraticCurveTo(cx+2*s,by-14*s,cx+4*s,by);x.closePath();x.fill();
 x.fillStyle='#4e3a28';x.fillRect(cx-1.5*s,by-24*s,1.4*s,22*s);
 const blob=(bx,byy,r,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<9;i++){const a=i/9*6.283,rr=r*(.82+R()*.3);x.lineTo(bx+Math.cos(a)*rr,byy+Math.sin(a)*rr*.8);}x.closePath();x.fill();};
 const d=pSh(G[0],-.35),m=G[0],l=pSh(G[0],.22),hl=pSh(G[0],.45);
 [[-11,-30,11,d],[11,-31,11,d],[0,-36,14,d],[-8,-42,11,m],[9,-43,11,m],[0,-50,12,m],[-4,-55,8,l],[5,-47,8,l],[0,-38,10,m]].forEach(([dx,dy,r,c])=>blob(cx+dx*s,by+dy*s,r*s,c));
 for(let i=0;i<22;i++){x.fillStyle=R()<.5?hl:l;x.beginPath();x.arc(cx+(R()-.5)*26*s,by+(-58+R()*26)*s,(.7+R()*1.1)*s,0,6.283);x.fill();}
 for(let i=0;i<10;i++){x.fillStyle=pSh(d,-.25);x.beginPath();x.arc(cx+(R()-.5)*28*s,by+(-28-R()*10)*s,(.8+R())*s,0,6.283);x.fill();}
 if(R()<.4)for(let i=0;i<6;i++){x.fillStyle=pick2(R,['#f0a8c0','#ffe08a','#ffffff']);x.beginPath();x.arc(cx+(R()-.5)*24*s,by+(-56+R()*24)*s,.9*s,0,6.283);x.fill();}}
function hipRoof(x,cx,top,hw,e,col,lines){const L=[cx-hw-e,top+2],F=[cx,top+hw/2+e*.7],Rr=[cx+hw+e,top+2],A=[cx,top-hw*.75];
 x.fillStyle=pSh(col,-.12);x.beginPath();x.moveTo(...L);x.lineTo(...F);x.lineTo(...A);x.closePath();x.fill();x.fillStyle=pSh(col,-.32);x.beginPath();x.moveTo(...F);x.lineTo(...Rr);x.lineTo(...A);x.closePath();x.fill();
 x.strokeStyle=pSh(col,-.5);x.lineWidth=.6;for(let i=1;i<lines;i++){const k=i/lines;x.beginPath();x.moveTo(L[0]+(A[0]-L[0])*k,L[1]+(A[1]-L[1])*k);x.lineTo(F[0]+(A[0]-F[0])*k,F[1]+(A[1]-F[1])*k);x.lineTo(Rr[0]+(A[0]-Rr[0])*k,Rr[1]+(A[1]-Rr[1])*k);x.stroke();}
 x.strokeStyle=pSh(col,.25);x.lineWidth=1.1;x.beginPath();x.moveTo(...L);x.lineTo(...F);x.lineTo(...Rr);x.stroke();x.strokeStyle='#1e1812';x.lineWidth=1;x.beginPath();x.moveTo(F[0],F[1]);x.lineTo(...A);x.stroke();}
function houseBody(g,x,cx,by,hw,h,wall,beam){isoBox(g,cx,by,hw,h,wall,pSh(wall,-.08),pSh(wall,-.28));
 [0,.5,1].forEach(u=>{g.line(...fL(cx,by,hw,h,u,0),...fL(cx,by,hw,h,u,1),beam,1.4);g.line(...fR(cx,by,hw,h,u,0),...fR(cx,by,hw,h,u,1),beam,1.4);});
 g.line(...fL(cx,by,hw,h,0,.05),...fL(cx,by,hw,h,1,.05),beam,1.2);g.line(...fR(cx,by,hw,h,0,.05),...fR(cx,by,hw,h,1,.05),beam,1.2);}
Object.assign(PR,{
 house:{h:92,w:84,cx:42,f(g,R,P,cx,by,v){const x=g.x,hw=28,h=26;x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(cx+4,by+4,34,12,0,0,6.283);x.fill();
   houseBody(g,x,cx,by,hw,h,['#d8cdb4','#cfc2a6','#d4c8ae','#e0d4ba'][v%4],'#4a3424');
   facePoly(g,fL,cx,by,hw,h,.18,.42,.38,1,'#2a1e16');facePoly(g,fL,cx,by,hw,h,.2,.4,.4,1,'#3e2c1e');g.line(...fL(cx,by,hw,h,.3,.4),...fL(cx,by,hw,h,.3,1),'#2a1e16');
   facePoly(g,fR,cx,by,hw,h,.35,.7,.3,.62,'#2e2418');for(let i=1;i<4;i++){g.line(...fR(cx,by,hw,h,.35+i*.0875,.3),...fR(cx,by,hw,h,.35+i*.0875,.62),'#8a6a44');}g.line(...fR(cx,by,hw,h,.35,.46),...fR(cx,by,hw,h,.7,.46),'#8a6a44');
   const thatch=v%2===1;hipRoof(x,cx,by-h,hw,8,thatch?'#c8a464':'#4a4e5a',thatch?9:7);
   if(thatch){for(let i=0;i<40;i++){x.strokeStyle=R()<.5?'#e0c080':'#8a6a3a';x.lineWidth=.5;const px=cx-30+R()*60,py=by-h-12+R()*14;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*2,py+3);x.stroke();}}
   else{x.fillStyle='#2a2c34';x.fillRect(cx-1.5,by-h-hw*.75-3,3,4);[[-1,1],[1,1]].forEach(([d])=>{x.beginPath();x.moveTo(cx+d*(hw+8),by-h+2);x.quadraticCurveTo(cx+d*(hw+12),by-h-1,cx+d*(hw+13),by-h-5);x.lineTo(cx+d*(hw+10),by-h+1);x.fill();});}
   if(v===3){x.fillStyle='#b8322a';x.fillRect(cx-9,by-h-4,18,7);x.fillStyle='#f0d070';x.font='600 5px "Noto Serif SC",serif';x.textAlign='center';x.fillText('珍宝阁',cx,by-h+1.6);}}},
 shop:{h:96,w:84,cx:42,f(g,R,P,cx,by,v){const x=g.x,hw=26,h=28;x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(cx+4,by+4,32,11,0,0,6.283);x.fill();
   houseBody(g,x,cx,by,hw,h,'#d2c4a8','#5a3c26');facePoly(g,fL,cx,by,hw,h,.08,.92,.42,.78,'#3a2a1c');facePoly(g,fL,cx,by,hw,h,.1,.9,.72,.8,'#8a6440');
   const goods=[['#7ad08a','#e0505a','#fff2c8'],['#9ab0c0','#c8c8d0','#8a6a44'],['#f0d070','#e04a3a','#f4ead8']][v%3];for(let i=0;i<8;i++){x.fillStyle=goods[i%3];const p=fL(cx,by,hw,h,.14+i*.1,.66);x.fillRect(p[0]-1.2,p[1]-3,2.4,3);}
   facePoly(g,fR,cx,by,hw,h,.3,.72,.28,1,'#2a1e16');
   hipRoof(x,cx,by-h,hw,9,'#3e4250',7);x.fillStyle='#2a2c34';[[-1],[1]].forEach(([d])=>{x.beginPath();x.moveTo(cx+d*(hw+9),by-h+2);x.quadraticCurveTo(cx+d*(hw+14),by-h-2,cx+d*(hw+15),by-h-7);x.lineTo(cx+d*(hw+11),by-h+1);x.fill();});
   const flag=['#3a7a4a','#5a6a8a','#c8a032'][v%3],fx=cx-hw-4;x.strokeStyle='#3a2a1c';x.lineWidth=1.2;x.beginPath();x.moveTo(fx,by+2);x.lineTo(fx,by-h-22);x.stroke();
   x.fillStyle=flag;x.beginPath();x.moveTo(fx,by-h-21);x.lineTo(fx+9,by-h-20);x.lineTo(fx+9,by-h+1);x.lineTo(fx+4.5,by-h-2);x.lineTo(fx,by-h+1);x.closePath();x.fill();
   x.fillStyle='#fff4d8';x.font='600 6px "Ma Shan Zheng","KaiTi",serif';x.textAlign='center';['丹','器','符'][v%3].split('').forEach((ch,i)=>x.fillText(ch,fx+4.5,by-h-11+i*7));
   x.fillStyle='#d8382a';x.beginPath();x.ellipse(cx+hw-6,by-h+6,2.6,3.2,0,0,6.283);x.fill();x.fillStyle='#f0d070';x.fillRect(cx+hw-6.6,by-h+2,1.2,1);},light:{rad:44,col:'rgba(255,180,90,.25)',h:20}},
 treeB:{h:100,w:76,cx:38,f(g,R,P,cx,by,v){const x=g.x;x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(cx+3,by+2,22,7,0,0,6.283);x.fill();leafy(x,cx,by,1.25,v%3===2?['#5a7a34']:v%3===1?['#3e6a3a']:['#4a7a3e'],R);},organic:1},
 lantern:{h:58,f(g,R,P,cx,by){const x=g.x;x.strokeStyle='#3a2a1c';x.lineWidth=1.6;x.beginPath();x.moveTo(cx,by);x.lineTo(cx,by-40);x.lineTo(cx+9,by-40);x.stroke();
   [[cx+8,by-34],[cx-1,by-28]].forEach(([lx,ly],i)=>{if(i){x.beginPath();x.moveTo(cx,by-31);x.lineTo(lx,by-31);x.stroke();}const gg=x.createRadialGradient(lx,ly,0,lx,ly,9);gg.addColorStop(0,'rgba(255,170,80,.55)');gg.addColorStop(1,'rgba(255,120,40,0)');x.fillStyle=gg;x.fillRect(lx-9,ly-9,18,18);
    x.fillStyle='#d8382a';x.beginPath();x.ellipse(lx,ly,3.2,4,0,0,6.283);x.fill();x.fillStyle='#ff8a5a';x.beginPath();x.ellipse(lx-.8,ly-.6,1.3,2.6,0,0,6.283);x.fill();x.fillStyle='#2a1a10';x.fillRect(lx-1.6,ly-5,3.2,1.2);x.fillRect(lx-1.6,ly+4,3.2,1);x.strokeStyle='#f0d070';x.lineWidth=.6;x.beginPath();x.moveTo(lx,ly+5);x.lineTo(lx,ly+8);x.stroke();x.strokeStyle='#3a2a1c';x.lineWidth=1.6;});},light:{rad:46,col:'rgba(255,160,80,.35)',h:30}},
 well:{h:50,f(g,R,P,cx,by){const x=g.x;x.fillStyle='#6a665c';x.beginPath();x.ellipse(cx,by-4,10,5,0,0,6.283);x.fill();x.fillStyle='#8a8478';x.fillRect(cx-10,by-8,20,4);x.beginPath();x.ellipse(cx,by-8,10,5,0,0,6.283);x.fill();x.fillStyle='#1a2a2a';x.beginPath();x.ellipse(cx,by-8,7,3.2,0,0,6.283);x.fill();
   x.strokeStyle='#4a3424';x.lineWidth=1.6;x.beginPath();x.moveTo(cx-9,by-8);x.lineTo(cx-9,by-30);x.moveTo(cx+9,by-8);x.lineTo(cx+9,by-30);x.stroke();x.fillStyle='#5a4a3a';x.beginPath();x.moveTo(cx-14,by-28);x.lineTo(cx,by-38);x.lineTo(cx+14,by-28);x.lineTo(cx,by-24);x.closePath();x.fill();
   x.strokeStyle='#8a6a44';x.lineWidth=.8;x.beginPath();x.moveTo(cx,by-30);x.lineTo(cx,by-16);x.stroke();x.fillStyle='#6a4a2a';x.fillRect(cx-2,by-17,4,3);}},
 flowers:{h:20,f(g,R,P,cx,by,v){const x=g.x;for(let i=0;i<14;i++){const px=cx+(R()-.5)*22,py=by-2+(R()-.5)*7;x.strokeStyle='#4a7a3a';x.lineWidth=.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5),py-3);x.stroke();x.fillStyle=pick2(R,v%2?['#f0a8c0','#ffffff','#e85a7a']:['#ffe08a','#ffffff','#c9a8ff']);x.beginPath();x.arc(px,py-3.4,1,0,6.283);x.fill();}}},
 cart:{h:36,w:56,cx:28,f(g,R,P,cx,by){const x=g.x;x.fillStyle='#7a5a3a';x.beginPath();x.moveTo(cx-14,by-12);x.lineTo(cx+8,by-20);x.lineTo(cx+16,by-15);x.lineTo(cx-6,by-7);x.closePath();x.fill();x.fillStyle='#5a3e26';x.beginPath();x.moveTo(cx-6,by-7);x.lineTo(cx+16,by-15);x.lineTo(cx+16,by-11);x.lineTo(cx-6,by-3);x.closePath();x.fill();
   x.fillStyle='#c8a464';x.beginPath();x.ellipse(cx+1,by-16,9,4,-.35,0,6.283);x.fill();x.strokeStyle='#3a2a1c';x.lineWidth=1.4;x.beginPath();x.ellipse(cx-2,by-3,5,5,0,0,6.283);x.stroke();x.beginPath();x.moveTo(cx-14,by-12);x.lineTo(cx-24,by-6);x.stroke();}},
 jars:{h:30,f(g,R,P,cx,by){const x=g.x;[[-6,0,5],[4,-2,6],[0,3,4]].forEach(([dx,dy,r])=>{x.fillStyle='#6a3a24';x.beginPath();x.ellipse(cx+dx,by+dy-r,r,r*1.1,0,0,6.283);x.fill();x.fillStyle='#8a4e30';x.beginPath();x.ellipse(cx+dx-1.4,by+dy-r-1.4,r*.45,r*.6,0,0,6.283);x.fill();x.fillStyle='#2a1a10';x.fillRect(cx+dx-r*.5,by+dy-r*2.1,r,1.6);x.fillStyle='#d8382a';x.fillRect(cx+dx-r*.4,by+dy-r*1.2,r*.8,r*.5);});}},
 leitai:{h:84,w:100,cx:50,f(g,R,P,cx,by){const x=g.x;isoBox(g,cx,by,34,8,'#9a6a3a','#7a5030','#5a3820');x.strokeStyle='rgba(60,30,16,.6)';x.lineWidth=.5;for(let i=1;i<7;i++){const k=i/7;x.beginPath();x.moveTo(cx-34+k*34,by-8-k*17);x.lineTo(cx+k*34,by-8+17-k*17);x.stroke();}
   [[cx-34,by-8],[cx+34,by-8],[cx,by-25]].forEach(([px,py])=>{x.strokeStyle='#3a2a1c';x.lineWidth=1.6;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-34);x.stroke();x.fillStyle='#c8322a';x.beginPath();x.moveTo(px,py-33);x.lineTo(px+8,py-31);x.lineTo(px+8,py-18);x.lineTo(px,py-20);x.closePath();x.fill();});
   x.fillStyle='#8a2a1a';x.beginPath();x.ellipse(cx+18,by-15,5,6,0,0,6.283);x.fill();x.fillStyle='#e8d8b0';x.beginPath();x.ellipse(cx+18,by-17,4,2,0,0,6.283);x.fill();}},
 paifang:{h:100,w:76,cx:38,f(g,R,P,cx,by){const x=g.x;[[-22,0],[22,0]].forEach(([dx])=>{x.fillStyle='#5a2a20';x.fillRect(cx+dx-2.5,by-58,5,58);x.fillStyle='#3a1a14';x.fillRect(cx+dx-4,by-4,8,4);});
   x.fillStyle='#7a2a20';x.fillRect(cx-26,by-52,52,5);x.fillRect(cx-24,by-64,48,4);x.fillStyle='#2a2c34';x.beginPath();x.moveTo(cx-34,by-62);x.quadraticCurveTo(cx,by-72,cx+34,by-62);x.lineTo(cx+28,by-68);x.quadraticCurveTo(cx,by-80,cx-28,by-68);x.closePath();x.fill();
   x.fillStyle='#1e1e26';x.fillRect(cx-28,by-70,56,2);x.fillStyle='#1e3a5a';x.fillRect(cx-10,by-60,20,8);x.fillStyle='#f0d070';x.font='600 6.5px "Ma Shan Zheng","KaiTi",serif';x.textAlign='center';x.fillText('南 街 坊 市',cx,by-53.6);}}
});
PR.tree.f=function(g,R,P,cx,by){leafy(g.x,cx,by,1,P.green,R);};
/* ---------- 人物 ---------- */
Object.assign(CH,{
 p_lie:{h:'#1a1210',s:'#e0b894',r:'#b8322a',a:'#f0c050',w:'#3a1a14',p:'#2a1a16',b:'#140c0a',hair:'spiky',sword:1},
 p_chiyang:{h:'#d8d0c8',s:'#d8a884',r:'#8a1e1a',a:'#e8b040',w:'#3a1a14',p:'#3a1a16',b:'#140c0a',hair:'bun',beard:'#e8e0d8'},
 p_yun:{h:'#141824',s:'#f2e0d0',r:'#4a7ab8',a:'#bfe0ff',w:'#2a4a7a',p:'#c8d8e8',b:'#2a3a5a',hair:'long'},
 p_shuiyue:{h:'#e8eef4',s:'#f2e4d8',r:'#eaf2fa',a:'#6ab8ff',w:'#6a8ab0',p:'#d8e4f0',b:'#5a7090',hair:'long'},
 p_lin:{h:'#2a1a10',s:'#f0caa4',r:'#5a9a4a',a:'#e8d070',w:'#3a6a2a',p:'#4a5a3a',b:'#2a2a1a',hair:'short',small:1},
 p_huagu:{h:'#c8c0b8',s:'#e0b896',r:'#6a8a3a',a:'#e8a0b0',w:'#3a5a2a',p:'#4a4a3a',b:'#2a2a1e',hair:'bun'},
 p_shi:{h:'#1a1612',s:'#c89870',r:'#6a5a4a',a:'#a8a090',w:'#3a3028',p:'#3a3430',b:'#1a1612',hair:'short',beard:'#2a2018',band:'#8a7a5a'},
 p_yan:{h:'#0e0a12',s:'#e8d4d0',r:'#2a1a3a',a:'#c84a8a',w:'#1a1024',p:'#1e1428',b:'#0e0a12',hair:'long',e:'#c84a8a'},
 p_gu:{h:'#3a3a40',s:'#d8b898',r:'#e8e0c8',a:'#c9a8ff',w:'#8a7a5a',p:'#d0c8b0',b:'#3a3428',hair:'bun',beard:'#5a5a60'},
 p_mo:{h:'#a8a098',s:'#d0a880',r:'#6a6458',a:'#8a7a5a',w:'#3a342c',p:'#4a443a',b:'#2a2620',hair:'short',beard:'#b0a8a0'},
 p_gen1:{h:'#1a1612',s:'#e0b894',r:'#3a4a6a',a:'#d8c070',w:'#2a2a3a',p:'#2a2a34',b:'#16161c',hair:'bun'},
 p_gen2:{h:'#2a1e16',s:'#e8c4a0',r:'#7a5a3a',a:'#c8b080',w:'#3a2a1c',p:'#3a3028',b:'#1a1610',hair:'short',beard:'#2a2018'},
 p_gen3:{h:'#141018',s:'#f0d4bc',r:'#8a3a5a',a:'#f0b0c0',w:'#3a1a2a',p:'#4a3a44',b:'#1e161a',hair:'long'},
 p_gen4:{h:'#1a1612',s:'#d0a47c',r:'#4a5a3a',a:'#9a8a5a',w:'#2a3020',p:'#2e3228',b:'#141610',hair:'short',band:'#c8a032'},
 p_gen5:{h:'#c8c0b0',s:'#dcb08c',r:'#c8b890',a:'#8a5a2a',w:'#6a5a3a',p:'#5a5040',b:'#2a2418',hair:'bun',beard:'#d8d0c0'},
 p_gen6:{h:'#0e0e14',s:'#e8ccb0',r:'#2a3a3a',a:'#7ad0b0',w:'#1a2626',p:'#1e2a2a',b:'#0e1414',hair:'long',sword:1},
 sc_cx0:{h:'#1a1210',s:'#e0b894',r:'#c8402e',a:'#f0c050',w:'#3a1a14',p:'#3a1a16',b:'#140c0a',hair:'bun',sword:1},
 sc_cx1:{h:'#5a5050',s:'#d8a884',r:'#7a1a16',a:'#f0c050',w:'#3a1a14',p:'#2a1414',b:'#140c0a',hair:'bun',beard:'#4a4040',sword:1},
 sc_tg0:{h:'#1a1612',s:'#c08860',r:'#7a6a50',a:'#a8a090',w:'#3a3028',p:'#3a3430',b:'#1a1612',hair:'short',band:'#5a4a3a'},
 sc_tg1:{h:'#3a3632',s:'#b88058',r:'#5a4a3a',a:'#d8c090',w:'#2a2018',p:'#2a2420',b:'#141210',hair:'spiky',beard:'#2a2018',band:'#c8a032'},
 sc_bc0:{h:'#2a1a10',s:'#f0caa4',r:'#5a9a4a',a:'#e8d070',w:'#3a6a2a',p:'#4a5a3a',b:'#2a2a1a',hair:'bun'},
 sc_bc1:{h:'#a8a098',s:'#e0b896',r:'#3a6a2a',a:'#e8a0b0',w:'#2a4a1a',p:'#3a4a2a',b:'#1e2a14',hair:'bun',beard:'#c0b8b0'},
 sc_xs0:{h:'#141824',s:'#f2e0d0',r:'#5a8ac8',a:'#bfe0ff',w:'#2a4a7a',p:'#c8d8e8',b:'#2a3a5a',hair:'long'},
 sc_xs1:{h:'#d8e0e8',s:'#f2e4d8',r:'#2a4a7a',a:'#6ab8ff',w:'#1a2a4a',p:'#a8b8c8',b:'#1a2a3a',hair:'long'},
 sc_ym0:{h:'#0e0a12',s:'#c8b8c0',r:'#2a1a3a',a:'#8a4ab8',w:'#1a1024',p:'#1e1428',b:'#0e0a12',hair:'short',mask:1},
 sc_ym1:{h:'#0e0a12',s:'#d8c4c8',r:'#1a0e24',a:'#c84a8a',w:'#0e0814',p:'#140c1a',b:'#08060a',hair:'long',mask:1},
 sc_tq1:{h:'#3a3a40',s:'#d8b898',r:'#e8e0c8',a:'#c9a8ff',w:'#8a7a5a',p:'#d0c8b0',b:'#3a3428',hair:'bun'}
});
Object.assign(MON_CH,{sc_cx0:'sc_cx0',sc_cx1:'sc_cx1',sc_tg0:'sc_tg0',sc_tg1:'sc_tg1',sc_bc0:'sc_bc0',sc_bc1:'sc_bc1',sc_xs0:'sc_xs0',sc_xs1:'sc_xs1',sc_ym0:'sc_ym0',sc_ym1:'sc_ym1',sc_tq1:'sc_tq1'});
Object.assign(LOOK,{'赤霄弟子':{a:'human',k:'sc_cx0',c:'#c8402e',c2:'#7a1a16',e:'#ffd070'},'赤霄长老':{a:'human',k:'sc_cx1',c:'#7a1a16',c2:'#3a0e0a',e:'#ffd070'},
 '铁骨帮众':{a:'human',k:'sc_tg0',c:'#7a6a50',c2:'#3a3028',e:'#ffd070'},'铁骨长老':{a:'human',k:'sc_tg1',c:'#5a4a3a',c2:'#2a2018',e:'#ffd070'},
 '百草弟子':{a:'human',k:'sc_bc0',c:'#5a9a4a',c2:'#3a6a2a',e:'#ffd070'},'百草长老':{a:'human',k:'sc_bc1',c:'#3a6a2a',c2:'#2a4a1a',e:'#ffd070'},
 '玄水弟子':{a:'human',k:'sc_xs0',c:'#5a8ac8',c2:'#2a4a7a',e:'#ffd070'},'玄水长老':{a:'human',k:'sc_xs1',c:'#2a4a7a',c2:'#1a2a4a',e:'#ffd070'},
 '幽冥鬼卒':{a:'human',k:'sc_ym0',c:'#2a1a3a',c2:'#1a1024',e:'#c84a8a'},'幽冥护法':{a:'human',k:'sc_ym1',c:'#1a0e24',c2:'#0e0814',e:'#c84a8a'},'天穹长老':{a:'human',k:'sc_tq1',c:'#e8e0c8',c2:'#8a7a5a',e:'#c9a8ff'}});
/* ---------- 场景：仙府洞窟、雷劫 ---------- */
SCN.xianfu=function(c,w,h,R){skyG(c,w,h,'#0e0c18','#2a2238','#1a1626');const fy=h*.5;
 glow(c,w*.5,h*.36,h*.42,'rgba(255,170,90,.22)');
 const stones=(x0,x1,y0,y1,base)=>{for(let y=y0;y<y1;y+=h*.045){let x=x0+((y/h*97)%1)*w*.03-w*.02;while(x<x1){const bw=w*(.05+R()*.06),bh=h*(.035+R()*.012);c.fillStyle=pick2(R,base);c.beginPath();c.roundRect?c.roundRect(x,y,bw,bh,3):c.rect(x,y,bw,bh);c.fill();c.strokeStyle='rgba(8,6,14,.7)';c.lineWidth=1.2;c.stroke();c.fillStyle='rgba(255,255,255,.05)';c.fillRect(x+2,y+1,bw-4,2);x+=bw+2;}}};
 c.save();c.beginPath();c.moveTo(0,0);c.lineTo(w*.3,0);c.quadraticCurveTo(w*.2,h*.3,w*.24,fy+h*.06);c.lineTo(0,h*.7);c.closePath();c.clip();stones(0,w*.32,0,h*.72,['#3a3448','#443c54','#2e2a3c','#4a4058']);c.restore();
 c.save();c.beginPath();c.moveTo(w,0);c.lineTo(w*.7,0);c.quadraticCurveTo(w*.8,h*.3,w*.76,fy+h*.06);c.lineTo(w,h*.7);c.closePath();c.clip();stones(w*.68,w,0,h*.72,['#2e4a4a','#365454','#2a3e40','#3e5a58']);c.restore();
 c.save();c.beginPath();c.moveTo(w*.3,0);c.quadraticCurveTo(w*.5,h*.1,w*.7,0);c.lineTo(w*.7,0);c.closePath();c.clip();stones(w*.28,w*.72,0,h*.12,['#5a3a2a','#6a4430','#4e3224']);c.restore();
 c.fillStyle='rgba(10,8,16,.85)';for(let i=0;i<9;i++){const x=w*(.28+R()*.44),l=h*(.03+R()*.06);c.beginPath();c.moveTo(x-6,h*.08);c.lineTo(x,h*.08+l);c.lineTo(x+6,h*.08);c.fill();}
 c.fillStyle=lg(c,0,fy-h*.02,0,h,[[0,'#3a3046'],[1,'#1a1622']]);c.beginPath();c.moveTo(w*.22,fy-h*.02);c.lineTo(w*.78,fy-h*.02);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
 for(let r=0;r<10;r++){const y=fy+r*r*h*.006+r*h*.012;c.strokeStyle='rgba(10,8,16,.55)';c.lineWidth=1;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();const n=4+r;for(let k=0;k<=n;k++){const t=k/n,x=w*.22-(w*.22)*r/9+t*(w*.56+w*.44*r/9);c.beginPath();c.moveTo(x,y);c.lineTo(x+(t-.5)*w*.04,y+h*.02+r*h*.006);c.stroke();}}
 const rune=(x,y,s)=>{c.strokeStyle='rgba(255,200,90,.85)';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y,s,s*.42,0,0,6.283);c.stroke();c.beginPath();c.ellipse(x,y,s*.7,s*.3,0,0,6.283);c.stroke();glow(c,x,y,s*1.6,'rgba(255,190,80,.18)');};
 rune(w*.5,fy+h*.07,w*.16);
 const fire=(x,y,s)=>{c.fillStyle='#4a3a2a';c.beginPath();c.ellipse(x,y+s*.3,s*1.5,s*.5,0,0,6.283);c.fill();c.fillStyle='#2a201a';c.fillRect(x-s*.9,y+s*.3,s*1.8,s*.6);glow(c,x,y-s,s*4,'rgba(255,160,60,.45)');c.fillStyle='#ff8a2a';c.beginPath();c.moveTo(x-s,y);c.quadraticCurveTo(x-s*.4,y-s*2.4,x,y-s*3);c.quadraticCurveTo(x+s*.4,y-s*2.2,x+s,y);c.fill();c.fillStyle='#ffe08a';c.beginPath();c.moveTo(x-s*.45,y);c.quadraticCurveTo(x,y-s*1.8,x+s*.45,y);c.fill();};
 fire(w*.3,fy+h*.02,h*.022);
 const chest=(x,y,s,open)=>{c.fillStyle='#4a2418';c.fillRect(x-s,y-s*.8,s*2,s*.8);c.fillStyle='#7a3a24';c.fillRect(x-s,y-s*.8,s*2,s*.14);c.fillStyle='#d8a030';c.fillRect(x-s*.12,y-s*.6,s*.24,s*.3);c.strokeStyle='#d8a030';c.lineWidth=1.2;c.strokeRect(x-s,y-s*.8,s*2,s*.8);
  if(open){c.fillStyle='#5a2a1a';c.beginPath();c.moveTo(x-s,y-s*.8);c.lineTo(x-s*.9,y-s*1.6);c.lineTo(x+s*1.1,y-s*1.6);c.lineTo(x+s,y-s*.8);c.fill();glow(c,x,y-s,s*2.2,'rgba(255,210,90,.55)');for(let i=0;i<7;i++){c.fillStyle=i%2?'#ffd04a':'#f0b030';c.beginPath();c.arc(x+(R()-.5)*s*1.6,y-s*.85-R()*s*.25,s*.17,0,6.283);c.fill();}}};
 chest(w*.66,fy+h*.03,h*.035,1);chest(w*.78,fy+h*.08,h*.03,1);chest(w*.58,fy+h*.1,h*.026,0);
 [[w*.42,fy+h*.015,'#9ad8ff'],[w*.86,fy+h*.02,'#c98aff'],[w*.2,fy+h*.09,'#8aff9a']].forEach(([x,y,col])=>{glow(c,x,y-h*.02,h*.05,'rgba(200,220,255,.25)');c.fillStyle=col;c.beginPath();c.arc(x,y-h*.014,h*.014,0,6.283);c.fill();c.fillRect(x-h*.004,y-h*.04,h*.008,h*.016);c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(x-h*.005,y-h*.018,h*.004,0,6.283);c.fill();});
 for(let i=0;i<16;i++){const x=w*(.25+R()*.5),y=fy+h*(.04+R()*.14);c.fillStyle='#e8b84a';c.beginPath();c.arc(x,y,h*.006,0,6.283);c.fill();}
 motes(c,w,h,50,'#ffe0a0',R,1.4,h*.1,h);vign(c,w,h,.65);};
SCN.storm=function(c,w,h,R){skyG(c,w,h,'#120e1c','#4a4658','#2a2638');for(let i=0;i<30;i++){c.fillStyle=`rgba(${18+R()*20|0},${16+R()*18|0},${30+R()*24|0},.75)`;c.beginPath();c.ellipse(R()*w,R()*h*.6,w*.12+R()*w*.15,h*.05+R()*h*.06,0,0,6.283);c.fill();}
 ridge(c,w,h,h*.82,h*.18,'#2a2834',R,2);for(let i=0;i<4;i++){c.strokeStyle='rgba(220,200,255,.8)';c.lineWidth=1.4;c.beginPath();let x=R()*w,y=0;c.moveTo(x,y);while(y<h*.7){x+=(R()-.5)*30;y+=h*.06;c.lineTo(x,y);}c.stroke();glow(c,x,y,h*.1,'rgba(190,150,255,.3)');}
 c.fillStyle=lg(c,0,h*.75,0,h,[[0,'rgba(210,210,220,0)'],[1,'rgba(210,210,220,.6)']]);c.fillRect(0,h*.75,w,h*.25);vign(c,w,h,.5);};
ZONE_SCN.jie='storm';ZONE_SCN.market='market';BTB.market={sky:['#0a0810','#1e1424'],far:'city',fl:'flag'};BTB.jie={sky:['#120e1c','#4a4658'],far:'void',fl:'basalt'};

PR.ruin.f=function(g,R,P,cx,by){const ht=50+Math.floor(R()*36);isoBox(g,cx,by,15,ht,'#4a4440','#5a524a','#3e3832');
 for(let v=.08;v<.85;v+=.14)for(let u=.12;u<.85;u+=.3){facePoly(g,fL,cx,by,15,ht,u,u+.16,v,v+.07,R()<.08?'#d8b060':'#151a1c');facePoly(g,fR,cx,by,15,ht,u,u+.16,v,v+.07,R()<.05?'#c8a050':'#101416');}
 const x=g.x;x.save();x.globalCompositeOperation='destination-out';x.beginPath();x.moveTo(0,0);for(let px=0;px<=g.w;px+=3)x.lineTo(px,by-ht-8+R()*14);x.lineTo(g.w,0);x.closePath();x.fill();x.restore();g.line(cx-6,by-ht+2,cx-8,by-ht-6,'#8a5a3a');};

/* ---------- 江湖人物立绘（矢量兜底，art/por_*.webp 到位后自动替换） ---------- */
Object.assign(PORTRAIT,{
 lie:()=>mkP({skin:'#e0b894',style:'messy',hair:'#1a1210',cloth:'#b8322a',collar:'#f0c050',brow:'angry',eyes:{col:'#8a2a1a',rx:5,ry:5},mouth:'smirk',extra:'<path d="M58 92 Q100 84 142 92" stroke="#b8322a" stroke-width="5" fill="none"/><path d="M150 236 L176 96" stroke="#3a1a14" stroke-width="7"/><path d="M166 112 L186 120" stroke="#f0c050" stroke-width="5"/>'}),
 chiyang:()=>mkP({skin:'#d8a884',style:'bun',hair:'#d8d0c8',cloth:'#8a1e1a',collar:'#e8b040',brow:'thick',bcol:'#eae4dc',eyes:{rx:4,ry:5},beard:'long',bcol:'#e8e0d8',old:1,mouth:'flat',shade:'#b88a64'}),
 yun:()=>mkP({skin:'#f2e0d0',style:'long',hair:'#141824',cloth:'#4a7ab8',collar:'#bfe0ff',eyes:{col:'#2a4a7a',lash:1},mouth:'flat',extra:'<path d="M126 70 q8 -10 18 -4" stroke="#bfe0ff" stroke-width="3" fill="none"/>'}),
 shuiyue:()=>mkP({skin:'#f2e4d8',style:'long',hair:'#e8eef4',cloth:'#eaf2fa',collar:'#6ab8ff',eyes:{col:'#4a8ac8',lash:1,ry:5},mouth:'flat',extra:'<circle cx="100" cy="72" r="5" fill="#6ab8ff" stroke="none"/><path d="M100 80 l3 6 l-3 6 l-3 -6 z" fill="#bfe0ff" stroke="none"/>'}),
 lin:()=>mkP({young:1,skin:'#f0caa4',style:'bob',hair:'#2a1a10',cloth:'#5a9a4a',collar:'#e8d070',eyes:{rx:7,ry:9,lash:1},mouth:'smile',extra:'<path d="M134 74 q10 -12 20 -2 q-10 4 -20 2 z" fill="#7ac05a" stroke-width="1.5"/>'}),
 huagu:()=>mkP({skin:'#e0b896',style:'bun',hair:'#c8c0b8',cloth:'#6a8a3a',collar:'#e8a0b0',eyes:{lash:1,rx:4,ry:5},old:1,mouth:'smile',shade:'#c4966e',extra:'<circle cx="128" cy="66" r="7" fill="#e8a0b0" stroke-width="1.5"/><circle cx="128" cy="66" r="2.5" fill="#f0d070" stroke="none"/>'}),
 shi:()=>mkP({skin:'#c89870',style:'short',hair:'#1a1612',cloth:'#6a5a4a',collar:'#8a7a5a',brow:'thick',eyes:{rx:4,ry:5},mouth:'flat',beard:'stub',rx:47,shade:'#a87850',extra:'<path d="M56 96 L144 96" stroke="#8a7a5a" stroke-width="6"/>'}),
 yan:()=>mkP({skin:'#e8d4d0',style:'long',hair:'#0e0a12',cloth:'#2a1a3a',collar:'#c84a8a',brow:'raise',eyes:{col:'#c84a8a',lash:1,rx:5,ry:4.5},mouth:'flat',extra:'<path d="M96 92 l4 -8 l4 8 z" fill="#c84a8a" stroke="none"/>'}),
 gu:()=>mkP({skin:'#d8b898',style:'bun',hair:'#3a3a40',cloth:'#e8e0c8',collar:'#c9a8ff',eyes:{col:'#7a5ac8',rx:4.5,ry:5},mouth:'flat',beard:'stub',extra:'<path d="M70 210 L130 210" stroke="#c9a8ff" stroke-width="3"/>'}),
 mowen:()=>mkP({skin:'#d0a880',style:'messy',hair:'#a8a098',cloth:'#6a6458',collar:'#8a7a5a',eyes:{rx:3.5,ry:4},old:1,beard:'long',bcol:'#b0a8a0',mouth:'smile',shade:'#a88660'})
});
Object.assign(SPK,{lie:'烈无咎',chiyang:'赤阳真人',yun:'云漪',shuiyue:'水月仙子',lin:'林小苗',huagu:'花姑',shi:'石铁山',yan:'阎九娘',gu:'顾长风',mowen:'莫问',liu:'柳含烟',luo:'洛清霜',ying:'阿萤'});
Object.assign(PORTRAIT,{
 liu:()=>mkP({skin:'#f0d4bc',style:'long',hair:'#141018',cloth:'#4a6a3a',collar:'#8a3a5a',brow:'raise',eyes:{col:'#3a1a2a',lash:1,rx:5,ry:4},mouth:'smirk'}),
 luo:()=>mkP({skin:'#eadcd4',style:'long',hair:'#3a4a5a',cloth:'#8aa8c8',collar:'#e8f0f8',eyes:{col:'#4a6a8a',lash:1,ry:4},mouth:'flat',shade:'#c8b0a4'}),
 ying:()=>mkP({skin:'#e0bc9c',style:'bun',hair:'#b8b0a8',cloth:'#7a6a8a',collar:'#d8c8e0',eyes:{lash:1,rx:4,ry:5},old:1,mouth:'smile',shade:'#c09474'})
});
/* 宿敌 · 萧尘 */
Object.assign(CH,{p_xiao:{h:'#121418',s:'#e8c8a8',r:'#3a3f4a',a:'#8fb8d8',w:'#2a2e38',p:'#2a2e36',b:'#121418',hair:'spiky',sword:1}});
Object.assign(PORTRAIT,{xiao:()=>mkP({skin:'#e8c8a8',style:'messy',hair:'#121418',cloth:'#3a3f4a',collar:'#8fb8d8',brow:'angry',eyes:{col:'#5a7ab8',rx:5,ry:4.5},mouth:'smirk',extra:'<path d="M70 70 Q80 60 92 66" stroke="#d8dce8" stroke-width="5" fill="none"/><path d="M96 206 l8 -10 l8 10 l-8 10 z" fill="#8fd6b5" stroke-width="1.5"/><path d="M104 196 L104 216" stroke="#2a4a3a" stroke-width="1.2"/>'})});
Object.assign(SPK,{xiao:'萧尘'});
