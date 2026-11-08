/* ================= 新角色立绘、像素小人、新妖兽、新场景 ================= */
function mkP(o){const skin=o.skin||SKIN,young=!!o.young,cy=young?120:108,ey=young?126:(o.ey||115);let back='',front='';const H=o.hair||'#26201b';
 if(o.style==='long')back=`<path d="M50 104 C46 52 80 36 100 36 C124 36 156 52 150 104 C156 150 154 196 148 214 L130 206 L136 120 L64 120 L70 206 L52 214 C44 190 44 146 50 104 Z" fill="${H}"/>`;
 if(o.style==='bob')back=`<path d="M52 ${cy-2} C48 ${cy-44} 76 ${cy-58} 100 ${cy-58} C124 ${cy-58} 152 ${cy-44} 148 ${cy-2} L150 ${cy+40} L130 ${cy+36} L134 ${cy+2} L66 ${cy+2} L70 ${cy+36} L50 ${cy+40} Z" fill="${H}"/>`;
 if(o.style==='hood')back=`<path d="M38 176 C30 80 64 34 100 34 C136 34 170 80 162 176 Z" fill="${o.hood}"/>`;
 let body=bodyP(o.cloth||'#5f6152');if(o.collar)body+=`<path d="M70 178 L100 ${o.vdeep||222} L130 178" fill="none" stroke="${o.collar}" stroke-width="5"/>`;
 if(o.style==='short')front=`<path d="M54 100 C54 64 74 50 100 50 C128 50 148 64 146 100 L138 84 L132 98 L124 74 L114 92 L104 70 L94 92 L84 74 L76 96 L68 80 L62 102 Z" fill="${H}"/>`;
 if(o.style==='messy')front=`<path d="M52 104 C48 66 62 46 76 40 L80 56 L90 34 L98 52 L110 30 L114 52 L128 38 L130 58 L146 50 C152 70 152 88 148 104 C138 86 120 80 100 80 C80 80 62 86 52 104 Z" fill="${H}"/>`;
 if(o.style==='long')front=`<path d="M56 106 C54 62 80 46 104 46 C130 46 148 62 146 104 C138 86 124 74 106 72 C96 86 78 98 56 106 Z" fill="${H}"/>`;
 if(o.style==='bun'||o.style==='crown')front=`<circle cx="100" cy="46" r="15" fill="${H}"/><path d="M60 98 C62 70 80 60 100 60 C120 60 138 70 140 98 C126 82 112 78 100 78 C88 78 74 82 60 98 Z" fill="${H}"/>`+(o.style==='crown'?`<path d="M86 40 L114 40 L110 26 L100 32 L90 26 Z" fill="#c9a23a"/><path d="M70 44 L130 44" stroke="#c9a23a" stroke-width="3"/>`:'');
 if(o.style==='bob')front=`<path d="M56 ${cy-6} C56 ${cy-44} 78 ${cy-56} 100 ${cy-56} C122 ${cy-56} 144 ${cy-44} 144 ${cy-6} C130 ${cy-16} 70 ${cy-16} 56 ${cy-6} Z" fill="${H}"/>`;
 if(o.style==='hood')front=`<path d="M56 112 C56 64 80 50 100 50 C120 50 144 64 144 112 C140 80 124 64 100 64 C76 64 60 80 56 112 Z" fill="${pSh(o.hood,-.25)}"/>`;
 if(o.style==='bald')front=`<path d="M58 104 C56 92 60 86 64 82 M142 104 C144 92 140 86 136 82" stroke="${H}" stroke-width="7" fill="none"/>`;
 const brow=o.brow==='angry'?`<path d="M72 ${ey-16} L92 ${ey-10} M128 ${ey-16} L108 ${ey-10}" stroke-width="4"/>`:o.brow==='thick'?`<path d="M70 ${ey-14} Q82 ${ey-20} 94 ${ey-13} M130 ${ey-14} Q118 ${ey-20} 106 ${ey-13}" stroke="${o.bcol||INK}" stroke-width="6" fill="none"/>`:o.brow==='raise'?`<path d="M72 ${ey-16} Q82 ${ey-22} 92 ${ey-15} M108 ${ey-12} L128 ${ey-14}" stroke-width="3" fill="none"/>`:`<path d="M74 ${ey-13} Q84 ${ey-17} 92 ${ey-13} M126 ${ey-13} Q116 ${ey-17} 108 ${ey-13}" stroke-width="2.5" fill="none"/>`;
 const eye=o.closed?eyesClosed(ey,18):eyes(ey,Object.assign({dx:young?17:19},o.eyes||{}));
 const mY=young?148:141,mouth=o.mouth==='smile'?`<path d="M90 ${mY-1} Q100 ${mY+6} 110 ${mY-1}" fill="none" stroke-width="2.5"/>`:o.mouth==='smirk'?`<path d="M90 ${mY} Q104 ${mY+4} 113 ${mY-5}" fill="none" stroke-width="2.5"/>`:`<path d="M92 ${mY} L108 ${mY}" stroke-width="2.5"/>`;
 let beard='';if(o.beard==='long')beard=`<path d="M80 134 Q100 126 120 134 Q118 170 112 200 Q104 226 100 232 Q96 226 88 200 Q82 170 80 134 Z" fill="${o.bcol||'#eceae4'}"/><path d="M84 132 Q100 140 116 132" fill="none" stroke-width="3"/>`;
 if(o.beard==='stub')beard=`<g fill="#6a5a4a" stroke="none">${[...Array(16)].map((_,i)=>`<circle cx="${74+(i%8)*7.5}" cy="${148+(i>7?6:0)}" r="1"/>`).join('')}</g>`;
 const wr=o.old?`<path d="M70 ${ey+12} Q76 ${ey+16} 82 ${ey+12} M118 ${ey+12} Q124 ${ey+16} 130 ${ey+12} M86 ${ey-24} L114 ${ey-24}" stroke="#a87c58" stroke-width="1.6" fill="none"/>`:'';
 const blush=young?`<ellipse cx="74" cy="${ey+16}" rx="8" ry="4" fill="#f0a0a0" stroke="none" opacity=".6"/><ellipse cx="126" cy="${ey+16}" rx="8" ry="4" fill="#f0a0a0" stroke="none" opacity=".6"/>`:'';
 const head=young?baseHead(skin,{cy:120,rx:40,ry:44}):baseHead(skin,{rx:o.rx||43,ry:49,shade:o.shade});
 return svgP(back+body+head+front+brow+(o.mask||'')+eye+wr+blush+mouth+beard+(o.extra||''),o.defs);}
Object.assign(PORTRAIT,{
 shen:()=>mkP({skin:'#e2bf9a',style:'bun',hair:'#d8d6d0',cloth:'#5a6a6a',collar:'#e8e2d2',brow:'thick',bcol:'#e8e6e0',eyes:{rx:4,ry:5},beard:'long',old:1,mouth:'flat',shade:'#c49a74'}),
 qian:()=>mkP({skin:'#d8ad86',style:'messy',hair:'#2a2018',cloth:'#7a3a22',collar:'#c8b48a',brow:'raise',eyes:{rx:4,ry:5.5},mouth:'smirk',beard:'stub',extra:'<rect x="103" y="137" width="5" height="4" fill="#e3b862" stroke-width="1.5"/>'}),
 man:()=>mkP({young:1,skin:'#efc9a4',style:'bob',hair:'#2a1e18',cloth:'#d9b83a',collar:'#8a5a2a',vdeep:200,eyes:{rx:7,ry:10,lash:1},mouth:'smile',extra:'<path d="M128 78 L142 72 L140 84 Z" fill="#e3b862" stroke-width="2"/><path d="M40 222 L56 214 L58 230 Z" fill="#a8752a" stroke-width="2"/>'}),
 gui:()=>mkP({skin:'#c8b0a0',style:'hood',hood:'#3a2a4a',cloth:'#2a2036',collar:'#8a6ab8',eyes:{col:'#b88ae8',rx:4,ry:5},mouth:'smirk',mask:'<path d="M100 90 L148 90 L146 128 Q126 138 100 132 Z" fill="#e8e2d2"/><path d="M110 108 L136 106" stroke="#b8352a" stroke-width="3"/>'}),
 su:()=>mkP({skin:'#f2e2d4',style:'long',hair:'#1a1a2a',cloth:'#eef0f4',collar:'#9ad6e6',eyes:{col:'#4a6aa8',lash:1},mouth:'flat',extra:'<path d="M128 58 L152 42" stroke="#8fd6b5" stroke-width="4"/><circle cx="152" cy="42" r="5" fill="#bfffe6"/><path d="M100 82 l3 6 l-3 6 l-3 -6 z" fill="#9ad6e6" stroke="none"/><path d="M60 120 C58 150 62 180 66 206" stroke="#d8dce8" stroke-width="3" fill="none"/>'}),
 ning:()=>mkP({skin:'#e6d2bc',style:'crown',hair:'#141210',cloth:'#e3ddd2',collar:'#b08a3a',brow:'angry',eyes:{col:'#3a2a1a',rx:6,ry:4},mouth:'flat',extra:'<path d="M84 214 Q100 202 116 214 Q100 226 84 214 Z" fill="#fff" stroke-width="2"/><circle cx="100" cy="214" r="4" fill="#b8352a" stroke="none"/>'}),
 cm:()=>mkP({skin:'#d8ad86',style:'short',hair:'#1a1612',cloth:'#3a4a5a',collar:'#8a7a5a',eyes:{rx:4.5,ry:6},mouth:'flat'}),
 mu:()=>svgP(`<path d="M24 240 C20 120 54 30 100 24 C146 30 180 120 176 240 Z" fill="#0e0a16"/><path d="M50 200 C46 120 70 60 100 56 C130 60 154 120 150 200 Z" fill="#05030a"/>
  <g filter="url(#mug)">${[[100,96,9],[76,118,6],[124,118,6],[88,146,5],[112,146,5],[100,172,7],[66,152,4],[134,152,4],[100,128,4]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}" fill="#ff2a6a" stroke="none"/><circle cx="${x}" cy="${y}" r="${r*.3}" fill="#fff" stroke="none"/>`).join('')}</g>`,
  '<filter id="mug" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>','#2a1e3a')
});
Object.assign(SPK,{shen:'沈棋',qian:'钱三',man:'林小满',gui:'鬼手',su:'苏绾',ning:'宁玄',mu:'牧者',cm:'陈默'});
Object.assign(CH,{
 shen:{h:'#d8d6d0',s:'#e2bf9a',r:'#5a6a6a',a:'#e8e2d2',w:'#3a4444',p:'#3a4444',b:'#1e2222',hair:'bun',beard:'#e8e6e0'},
 qian:{h:'#2a2018',s:'#d8ad86',r:'#7a3a22',a:'#c8b48a',w:'#3a2a1a',p:'#3a3430',b:'#1a1612',hair:'short'},
 man:{h:'#2a1e18',s:'#efc9a4',r:'#d9b83a',a:'#8a5a2a',w:'#8a6a2a',p:'#3a3a4a',b:'#2a2a2e',hair:'short',small:1},
 gui:{h:'#3a2a4a',s:'#c8b0a0',r:'#2a2036',a:'#8a6ab8',w:'#3a2a4a',p:'#1e1828',b:'#120e18',hair:'short',mask:1},
 su:{h:'#1a1a2a',s:'#f2e2d4',r:'#eef0f4',a:'#9ad6e6',w:'#9ad6e6',p:'#d8dce4',b:'#8a9aa8',hair:'long',e:'#4a6aa8'},
 ning:{h:'#141210',s:'#e6d2bc',r:'#e3ddd2',a:'#b08a3a',w:'#b08a3a',p:'#a8a294',b:'#6a665c',hair:'bun'},
 cm:{h:'#1a1612',s:'#d8ad86',r:'#3a4a5a',a:'#8a7a5a',w:'#2a2a2a',p:'#2c2a26',b:'#1e1a16',hair:'short'},
 tianjiang:{h:'#3a2a10',s:'#c8a070',r:'#b8943a',a:'#e8c86a',w:'#8a6a2a',p:'#7a6a3a',b:'#3a2a10',hair:'spiky',band:'#cf4a3c'},
 thug:{h:'#1a1612',s:'#d0a47c',r:'#3a3a3a',a:'#8a2a20',w:'#2a2a2a',p:'#2a2a2a',b:'#141414',hair:'short',band:'#2a2a2a'},
 jianke:{h:'#e8e6e0',s:'#e0bc96',r:'#2a2a30',a:'#cf4a3c',w:'#1a1a1e',p:'#1e1e22',b:'#0e0e10',hair:'long',sword:1},
 mu:{h:'#0e0a16',s:'#2a1e3a',r:'#0e0a16',a:'#ff2a6a',w:'#0e0a16',p:'#0e0a16',b:'#0e0a16',hair:'long',e:'#ff2a6a',ghost:1}
});
Object.assign(MON_CH,{general:'tianjiang',thug:'thug',ning:'ning',swordsman:'jianke'});
Object.assign(LOOK,{
 '星砂蠕虫':{a:'worm',c:'#c8b88a',c2:'#8a7a4a',e:'#7ff0ff'},'陨铁傀儡':{a:'human',k:'golem',c:'#5a5a6a',c2:'#3a3a48',e:'#7ff0ff'},'噬光水母':{a:'ghost',k:'em',c:'#8a6ad8',c2:'#5a3aa8',e:'#ffe0ff'},
 '噬星鲸':{a:'fish',c:'#2a3a6a',c2:'#141e40',e:'#bfe8ff',big:1},
 '残甲天兵':{a:'human',k:'mech',c:'#b8a060',c2:'#7a6a3a',e:'#ffef9a'},'金乌残魂':{a:'flyer',k:'crow',c:'#e08a2a',c2:'#a85a14',e:'#fff2a0'},'守门石兽':{a:'beast',c:'#8a8478',c2:'#5a564e',e:'#ffcf4a'},
 '断戟天将':{a:'human',k:'general',c:'#b8943a',c2:'#7a6a3a',e:'#ff6a3a'},
 '牧者之眼':{a:'ghost',c:'#3a2a4a',c2:'#1e1428',e:'#ff3a6a',eye:1},'归墟游魂':{a:'ghost',k:'drown',c:'#4a4a5a',c2:'#2a2a36',e:'#c9a8ff'},'虚无行者':{a:'human',k:'shadow',c:'#0a0a12',c2:'#000',e:'#ff2a6a'},
 '牧者·千目':{a:'ghost',c:'#1a1028',c2:'#0a0614',e:'#ff2a6a',eye:1},
 '宝箱怪':{a:'crab',c:'#8a5a2a',c2:'#5a3a1a',e:'#ffd04a'},'黑市打手':{a:'human',k:'thug',c:'#3a3a3a',c2:'#2a2a2a',e:'#ff8a3a'},
 '宁玄':{a:'human',k:'ning',c:'#e3ddd2',c2:'#a8a294',e:'#ff8a3a'},'无名剑客':{a:'human',k:'swordsman',c:'#2a2a30',c2:'#1a1a1e',e:'#cf4a3c'},
 '棋鬼':{a:'ghost',k:'drown',c:'#6a6a5a',c2:'#3a3a30',e:'#fff07a'},'噬灵巨鼠':{a:'rat',c:'#5a4a6a',c2:'#3a2e4a',e:'#d8a8ff',spikes:1,crown:1}
});
TL.star={c:['#141a3a','#18204a','#10163a'],pat:'speck'};
TL.jadeT={c:['#cfc8b0','#d8d2bc','#c6bea4'],pat:'grid',gc:'#a89a70'};
TL.ashv={c:['#2a2830','#302d36','#25232a'],pat:'rune'};
ZPAL.push({rock:['#3a4060','#262c48'],green:['#2a3a6a','#34467a'],cry:'#9ad6ff'},{rock:['#c8c0a8','#a89e84'],green:['#c9a23a','#b08a2a'],cry:'#ffe08a'},{rock:['#2a2234','#1a1424'],green:['#3a2a4a','#2a1e38'],cry:'#ff3a6a'});
ZONE_SCN.push('starsea','tianting','guixu');
Object.assign(SCN,{
 starsea(c,w,h,R){c.fillStyle='#03040c';c.fillRect(0,0,w,h);glow(c,w*.3,h*.35,w*.6,'rgba(70,90,200,.28)');glow(c,w*.8,h*.2,w*.4,'rgba(200,90,180,.18)');
  for(let i=0;i<260;i++){c.globalAlpha=.2+R()*.8;c.fillStyle=R()<.15?'#ffd8a8':'#dfe8ff';const s=R()<.06?2:1;c.fillRect(R()*w,R()*h,s,s);}c.globalAlpha=1;
  for(let i=0;i<7;i++){const x=R()*w,y=h*(.3+R()*.6),s=w*(.03+R()*.08);c.fillStyle='#1a1e34';c.beginPath();c.moveTo(x-s,y);c.lineTo(x-s*.4,y-s*.6);c.lineTo(x+s*.7,y-s*.4);c.lineTo(x+s,y+s*.2);c.lineTo(x,y+s*.6);c.fill();c.fillStyle='rgba(150,180,255,.35)';c.fillRect(x-s*.4,y-s*.6,s*1.1,2);}
  c.fillStyle='#0a0e22';c.beginPath();c.ellipse(w*.7,h*.95,w*.6,h*.18,0,0,6.28);c.fill();vign(c,w,h,.5);},
 tianting(c,w,h,R){skyG(c,w,h,'#fff4d8','#b8a070','#e8d8a8');glow(c,w*.5,h*.15,w*.5,'rgba(255,250,220,.6)');
  for(let i=0;i<9;i++){const x=w*(.05+i*.11),bh=h*(.25+R()*.35),bw=w*.05;c.fillStyle='#e8e2d0';c.fillRect(x,h*.75-bh,bw,bh);c.fillStyle='#c8bea4';c.fillRect(x+bw*.7,h*.75-bh,bw*.3,bh);if(R()<.4){c.fillStyle='#b8ae94';c.fillRect(x-bw*.2,h*.75-bh,bw*1.4,h*.015);}}
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#d8d0b8':'#cfc6ac';c.fillRect(w*(.2-i*.03),h*(.75+i*.04),w*(.6+i*.06),h*.04);}
  fog(c,w,h*.72,h*.1,'rgba(255,250,235,.5)');motes(c,w,h,50,'#fff6d0',R,1.5);vign(c,w,h,.35);},
 guixu(c,w,h,R){c.fillStyle='#04020a';c.fillRect(0,0,w,h);const cx=w*.5,cy=h*.45;
  for(let i=0;i<14;i++){c.strokeStyle=`rgba(${120+i*8},${40+i*4},${160-i*4},${.5-i*.03})`;c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,w*(.05+i*.05),h*(.02+i*.025),i*.2,0,6.28);c.stroke();}
  glow(c,cx,cy,w*.2,'rgba(255,40,110,.45)');c.fillStyle='#000';c.beginPath();c.ellipse(cx,cy,w*.05,h*.025,0,0,6.28);c.fill();
  for(let i=0;i<24;i++){const a=R()*6.28,d=w*(.25+R()*.4),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.5;c.fillStyle='#ff3a6a';c.globalAlpha=.4+R()*.5;c.beginPath();c.ellipse(x,y,3,1.6,0,0,6.28);c.fill();}c.globalAlpha=1;
  motes(c,w,h,60,'#c9a8ff',R,1.4);vign(c,w,h,.55);},
 clan(c,w,h,R){skyG(c,w,h,'#101a16','#2a3a30','#1a2620');
  c.fillStyle='#1e2a24';c.beginPath();c.moveTo(w*.12,h*.62);c.lineTo(w*.5,h*.34);c.lineTo(w*.88,h*.62);c.fill();c.fillStyle='#2e3e34';c.fillRect(w*.2,h*.62,w*.6,h*.3);
  c.fillStyle='#4a2a1e';c.fillRect(w*.4,h*.68,w*.2,h*.24);c.fillStyle='#e3b862';c.fillRect(w*.36,h*.55,w*.28,h*.06);c.fillStyle='#3a2a14';c.fillRect(w*.37,h*.56,w*.26,h*.04);
  [[.26,.7],[.74,.7]].forEach(([x,y])=>{glow(c,w*x,h*y,h*.12,'rgba(255,170,90,.45)');c.fillStyle='#cf4a3c';c.fillRect(w*x-4,h*y-6,8,12);});
  c.fillStyle='#141c18';c.fillRect(0,h*.92,w,h*.08);motes(c,w,h*.6,40,'#ffd8a8',R,1.2);vign(c,w,h,.45);},
 market(c,w,h,R){skyG(c,w,h,'#0a0810','#1e1424');for(let i=0;i<12;i++){const x=R()*w,y=h*(.2+R()*.3);glow(c,x,y,h*.08,'rgba(200,120,255,.25)');c.fillStyle='#8a4ad0';c.fillRect(x-3,y-5,6,10);}
  for(let i=0;i<5;i++){c.fillStyle='#1a1220';c.fillRect(w*(.05+i*.2),h*.6,w*.16,h*.3);c.fillStyle='#3a2448';c.beginPath();c.moveTo(w*(.03+i*.2),h*.6);c.lineTo(w*(.13+i*.2),h*.52);c.lineTo(w*(.23+i*.2),h*.6);c.fill();}
  fog(c,w,h*.85,h*.1,'rgba(120,80,160,.3)');vign(c,w,h,.5);}
});
