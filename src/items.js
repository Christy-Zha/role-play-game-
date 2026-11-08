/* ================= 物品扩充：词条、宝石、功法秘籍、传说装备 ================= */
const BAG_MAX=999;
const SLOT5=['w','a','j','r','f'];
const AFF={
 ls:{n:'吸血',v:r=>.03+.02*r,pct:1,d:'造成伤害的一部分转为生命'},
 cd:{n:'暴伤',v:r=>.15+.1*r,pct:1,d:'暴击伤害提高'},
 spd:{n:'迅捷',v:r=>2+r,d:'出手速度'},
 mp:{n:'灵蕴',v:r=>.1+.06*r,pct:1,d:'灵力上限提高'},
 pen:{n:'破甲',v:r=>.08+.05*r,pct:1,d:'无视敌人一部分防御'},
 mreg:{n:'回灵',v:r=>.03+.015*r,pct:1,d:'每回合额外恢复灵力'},
 dr:{n:'坚韧',v:r=>.04+.025*r,pct:1,d:'受到的伤害降低'},
 luck:{n:'福缘',v:r=>.08+.06*r,pct:1,d:'战斗所得灵石与掉落提高'},
 hpP:{n:'长生',v:r=>.06+.04*r,pct:1,d:'生命上限提高'},
 atkP:{n:'锋锐',v:r=>.05+.04*r,pct:1,d:'攻击提高'},
 dodge:{n:'身法',v:r=>.03+.015*r,pct:1,d:'有几率闪避攻击'}
};
const affText=a=>{const D=AFF[a.k];return D.n+' +'+(D.pct?(a.v*100).toFixed(a.v<.1?1:0)+'%':Math.round(a.v));};
/* 宝石：a 赤晶攻 d 玄晶防 h 碧晶血 c 紫晶暴击 */
const GEM_T={a:{n:'赤晶',d:'攻击',v:[.03,.06,.1,.15,.22]},d:{n:'玄晶',d:'防御',v:[.03,.06,.1,.15,.22]},h:{n:'碧晶',d:'生命',v:[.04,.08,.13,.2,.28]},c:{n:'紫晶',d:'暴击',v:[.01,.02,.035,.05,.08]}};
const GEM_Q=['碎','小','中','大','完美'];
const gemName=g=>GEM_Q[+g[1]-1]+GEM_T[g[0]].n;
const gemText=g=>{const T=GEM_T[g[0]],v=T.v[+g[1]-1];return T.d+' +'+(v*100).toFixed(v<.1?1:0)+'%';};
function gGem(t,tier){t=t||pick(['a','d','h','c']);tier=Math.max(1,Math.min(5,tier||1));const k=t+tier;S.gems[k]=(S.gems[k]||0)+1;return ' 获得 '+gemName(k)+'。';}
const gemTierFor=z=>Math.max(1,Math.min(5,1+Math.floor((z>=8?z-1:z)/2)+(Math.random()<.2?1:0)));
/* 功法秘籍 */
const BOOKS={
 huolong:{n:'《火龙诀》',ty:'skill',lv:6,d:'学会「火龙术」：火龙席卷所有敌人'},
 xuanbing:{n:'《玄冰诀》',ty:'skill',lv:9,d:'学会「玄冰掌」：重击一名敌人并将其冻住一回合'},
 xixing:{n:'《吸星诀》',ty:'skill',lv:12,d:'学会「吸星」：吸取一名敌人的生命为己用'},
 mingwang:{n:'《不动明王经》',ty:'skill',lv:15,d:'学会「明王身」：两回合内受伤大减'},
 feixian:{n:'《天外飞仙》',ty:'skill',lv:20,d:'学会「天外飞仙」：一剑，倾尽灵力'},
 changsheng:{n:'《长生诀》',ty:'pas',lv:3,d:'生命上限永久 +20%',fx:{hpP:.2}},
 lingbo:{n:'《凌波微步》',ty:'pas',lv:8,d:'速度 +4，闪避 +8%',fx:{spd:4,dodge:.08}},
 jingangj:{n:'《金刚经》',ty:'pas',lv:12,d:'受到的伤害永久降低 10%',fx:{dr:.1}},
 julingp:{n:'《聚灵篇》',ty:'pas',lv:5,d:'吐纳速度永久 +15%',fx:{idle:.15}},
 tianyan:{n:'《天衍术》',ty:'pas',lv:16,d:'福缘 +20%：灵石与掉落更多',fx:{luck:.2}},
 xingchen:{n:'《星辰锻体》',ty:'pas',lv:38,d:'攻击、生命永久 +25%',fx:{atkP:.25,hpP:.25}},
 guiyuan:{n:'《归元剑意》',ty:'pas',lv:44,d:'破甲 +25%，暴伤 +50%',fx:{pen:.25,cd:.5}}
};
function gBook(k){if(!k){const L=Object.keys(BOOKS).filter(b=>!BOOKS[b].sect&&!S.learned.includes(b)&&!(S.books[b]>0)&&BOOKS[b].lv<=S.stage+8);k=L.length?pick(L):null;}
 if(!k)return gGem(null,gemTierFor(maxZone()));S.books[k]=(S.books[k]||0)+1;return ' 获得秘籍 '+BOOKS[k].n+'。';}
/* 传说装备：每个首领一件 */
const UNIQ={
 '鼠王·裂齿':{n:'裂齿匕',slot:'w',aff:[['ls',.1],['cd',.3]]},
 '钢骨百足':{n:'百足甲',slot:'a',aff:[['dr',.12],['hpP',.15]]},
 '千年槐妖':{n:'槐心戒',slot:'r',aff:[['mreg',.08],['luck',.25]]},
 '海眼蛟':{n:'蛟龙珠',slot:'j',aff:[['hpP',.2],['spd',4]]},
 '零号':{n:'星核芯片',slot:'f',aff:[['atkP',.15],['cd',.4]]},
 '堕仙残躯':{n:'堕仙剑',slot:'w',aff:[['atkP',.25],['pen',.25]]},
 '灵潮之主':{n:'灵潮冠',slot:'j',aff:[['atkP',.2],['hpP',.2],['mreg',.06]]},
 '噬星鲸':{n:'鲸骨戒',slot:'r',aff:[['ls',.12],['hpP',.25]]},
 '断戟天将':{n:'天将残戟',slot:'w',aff:[['pen',.35],['cd',.6]]},
 '牧者·千目':{n:'千目镜',slot:'f',aff:[['atkP',.4],['luck',.5],['dr',.15]]}
};
function mkUnique(look,z){const U=UNIQ[look];if(!U)return null;const it=mkItem(z,true,{r:3,slot:U.slot});it.r=4;it.n=U.n;it.uniq=1;
 ['atk','def','hp'].forEach(k=>{if(it[k])it[k]=Math.round(it[k]*1.5);});it.aff=U.aff.map(([k,v])=>({k,v}));it.so=2;it.sell*=3;return it;}
/* ---------- 行囊：秘籍、宝石、镶嵌 ---------- */
function bookHTML(){const un=Object.keys(S.books).filter(k=>S.books[k]>0&&BOOKS[k]),ln=S.learned.filter(k=>BOOKS[k]);if(!un.length&&!ln.length)return '';
 return `<h2 class="sec">功法秘籍 <small>已学 ${ln.length} 部</small></h2>${un.map(k=>{const B=BOOKS[k],ok=S.stage>=B.lv;return `<div class="row2 r-bao"><div class="in"><div class="iname">${B.n}<span class="lv">${B.ty==='skill'?'法术':'心法'}</span></div><div class="istat">${B.d}${ok?'':' · 需 '+STAGES[Math.min(B.lv,LAST)].name}</div></div><button class="btn sm ${ok?'gold':''}" data-act="learn" data-arg="${k}" ${ok?'':'disabled'}>研读</button></div>`;}).join('')}
  ${ln.length?`<p class="note">已学：${ln.map(k=>BOOKS[k].n).join(' ')}</p>`:''}`;}
function learnBook(k){const B=BOOKS[k];if(!B||!(S.books[k]>0)||S.stage<B.lv)return;S.books[k]--;if(S.learned.includes(k)){S.stones+=zsAt(maxZone(),6);toast('这部你早已学会，转手卖了些灵石。');}else{S.learned.push(k);toast('参悟 '+B.n+(B.ty==='skill'?'，战斗中可在「法术」里施展':''),'big');}render();save();}
function gemHTML(){const ks=Object.keys(S.gems).filter(k=>S.gems[k]>0).sort((a,b)=>b[1]-a[1]||a.localeCompare(b));if(!ks.length)return '';const can=S.clan&&S.clan.bld.qi>=1;
 return `<h2 class="sec">宝石 <small>${can?'三颗同品可在炼器坊合成更高一品':'建立行社并修建炼器坊后可合成'}</small></h2><div class="gemgrid">${ks.map(k=>`<div class="gemc"><i class="gm g-${k[0]}"></i><div><b>${gemName(k)} ×${S.gems[k]}</b><small>${gemText(k)}</small></div>${can&&S.gems[k]>=3&&+k[1]<5?`<button class="btn sm ghost" data-act="fuse" data-arg="${k}">合成</button>`:''}</div>`).join('')}</div>`;}
function gemFuse(k){if(!(S.clan&&S.clan.bld.qi>=1)||!(S.gems[k]>=3)||+k[1]>=5)return;S.gems[k]-=3;const up=k[0]+(+k[1]+1);let msg='';
 if(Math.random()<.04*S.clan.bld.qi){S.gems[up]=(S.gems[up]||0)+2;msg='（炉火正旺，多出了一颗！）';}else S.gems[up]=(S.gems[up]||0)+1;toast('合成 '+gemName(up)+msg,'big');render();save();}
const findItem=id=>S.bag.find(x=>x.id===id)||SLOT5.map(k=>S.gear[k]).find(x=>x&&x.id===id);
function inlayOpen(id){const it=findItem(id);if(!it||!it.so)return;if(!it.gems)it.gems=[];
 const cur=it.gems.map((g,i)=>({t:'拆下 '+gemName(g)+'（'+gemText(g)+'）',cls:'ghost',fn:()=>{it.gems.splice(i,1);S.gems[g]=(S.gems[g]||0)+1;render();save();inlayOpen(id);}}));
 const free=it.gems.length<it.so,inv=Object.keys(S.gems).filter(k=>S.gems[k]>0).sort((a,b)=>b[1]-a[1]);
 const add=free?inv.slice(0,6).map(k=>({t:'嵌入 '+gemName(k)+'（'+gemText(k)+'）',cls:'gold',fn:()=>{S.gems[k]--;it.gems.push(k);toast('镶嵌 '+gemName(k));render();save();if(it.gems.length<it.so)inlayOpen(id);}})):[];
 modal(`<h3>镶嵌</h3><p>${itemName(it)} · 孔位 ${it.gems.length}/${it.so}</p>${!inv.length&&free?'<p>你身上没有宝石。宝箱、首领、秘境和行社派遣都可能带回宝石。</p>':''}`,cur.concat(add,[{t:'完成',cls:'ghost'}]));}
