/* ================= 灵宠 =================
   第一卷鼠王一战以后，灰团跟你回站；之后在各区域打完一仗，偶尔会有幼崽探头，喂对了吃的三回就跟你走（每种一只）。
   饱食按游戏日子掉，低于 30 就虚弱、不肯出战；不会死，也不会跑。筑基以后，出战的那只跟你进战斗。 */
const PET_SP={
 huitu:{n:'石皮鼠',look:'变异鼠',el:'tu',z:0,like:'grain',hate:'fruit',sk:'啃石',nm:'灰团',d:'地铁站里长大的小鼠，皮像碎石。认人，也认饭点。'},
 yaer:{n:'灰鸦',look:'灰鸦群',el:'jin',z:1,like:'jerky',hate:'grain',sk:'啄甲',nm:'铜扣',d:'高架上的灰鸦，喜欢亮东西，会把你掉的扣子叼回来。'},
 hu:{n:'灵狐',look:'狂化灵狐',el:'mu',z:2,like:'fruit',hate:'fish',sk:'缠藤',nm:'青尾',d:'妖林里的狐狸，尾尖带一点绿光。怕生，熟了以后很黏人。'},
 xie:{n:'鬼面蟹',look:'鬼面蟹',el:'shui',z:3,like:'fish',hate:'jerky',sk:'吐泡',nm:'皱眉',d:'港口浅滩的小蟹，背壳的花纹像一张皱眉的脸。'},
 jing:{n:'晶背兽',look:'晶背兽',el:'lei',z:4,like:'core',hate:'fish',sk:'放电',nm:'小闪',d:'坠星研究所附近的小兽，背上的晶簇会在打雷前发亮。'},
 lang:{n:'赤焰狼',look:'赤焰狼',el:'huo',z:5,like:'jerky',hate:'fruit',sk:'焰咬',nm:'火炭',d:'天坑边的狼崽，身上比别的崽子热，冬天抱着很暖。'}
};
const PET_FOOD={grain:{n:'杂粮团',p:.4,xp:4,full:30},jerky:{n:'肉干',p:1,xp:6,full:35},fish:{n:'鱼干',p:1,xp:6,full:35},fruit:{n:'灵果',p:1.5,xp:7,full:30},core:{n:'碎灵核',p:4,xp:16,full:20}};
const PET_MAX=15,PET_HUNGRY=30,PET_DAY=8;
const petNeed=lv=>15+lv*10;
const petStage=lv=>lv<5?'幼':lv<10?'少':'灵';
function petNew(sp){return {sp,name:PET_SP[sp].nm,lv:1,xp:0,full:80,bond:10};}
function petHas(sp){return (S.pets||[]).some(p=>p.sp===sp);}
function petActive(){const P=S.pets||[];return P[S.petOn]||null;}
function petGive(sp){S.pets=S.pets||[];if(petHas(sp))return null;const p=petNew(sp);S.pets.push(p);if(S.petOn==null||S.petOn<0)S.petOn=S.pets.length-1;return p;}
/* 吃一口：返回 'hate' 'ok' 'like'，并处理成长 */
function petEat(p,food){const sp=PET_SP[p.sp],F0=PET_FOOD[food];if(!sp||!F0)return null;if(food===sp.hate)return 'hate';
 const like=food===sp.like;p.full=Math.min(100,p.full+F0.full);p.bond=Math.min(100,p.bond+(like?3:1));petXp(p,F0.xp*(like?2:1));return like?'like':'ok';}
function petXp(p,x){p.xp+=x;let up=0;while(p.lv<PET_MAX&&p.xp>=petNeed(p.lv)){p.xp-=petNeed(p.lv);p.lv++;up++;}if(p.lv>=PET_MAX)p.xp=Math.min(p.xp,petNeed(p.lv));return up;}
function petTick(days){(S.pets||[]).forEach(p=>{p.full=Math.max(0,p.full-PET_DAY*days);});
 if(S.petAuto)(S.pets||[]).forEach(p=>{let guard=0;while(p.full<50&&guard++<6){const sp=PET_SP[p.sp];const f=[sp.like,'grain','jerky','fish','fruit','core'].find(k=>k!==sp.hate&&(S.petFood[k]||0)>0);if(!f)break;S.petFood[f]--;petEat(p,f);}});}
const petCanFight=p=>!!p&&realmIdx()>=1&&p.full>=PET_HUNGRY;

/* 日子往前走，肚子会饿 */
{const ad0=advanceDays;advanceDays=function(n,why){const d0=daysAll();const r=ad0.apply(this,arguments);try{const d=daysAll()-d0;if(d>0&&S.pets&&S.pets.length){const a=petActive();const was=a&&a.full>=PET_HUNGRY;petTick(d);if(a&&was&&a.full<PET_HUNGRY)toast(a.name+'饿了，没力气跟你出门。去行囊里喂它。');}}catch(e){console.error(e);}return r;};}

/* 战斗：筑基以后，出战的那只跟着 */
{const mp0=mkParty;mkParty=function(){const P=mp0.apply(this,arguments);const p=petActive();if(!petCanFight(p))return P;
  const st=stats(),sp=PET_SP[p.sp],k=.25+.025*p.lv;
  P.push({key:'pet',pet:1,look:sp.look,spr:'pet',name:p.name,el:sp.el,max:st.hp*(.3+.025*p.lv),hp:st.hp*(.3+.025*p.lv),mmax:10,mp:10,atk:st.atk*k,def:st.def*.6,crit:.1,spd:13,
   side:'p',alive:true,ox:0,oy:0,alpha:1,flash:0,buf:0,defd:false,walk:0});return P;};}
{const ai0=btAI;btAI=function(a){if(a&&a.pet){const p=petActive(),sp=p&&PET_SP[p.sp];if(sp)a.el=sp.el;const fs=BT.foes.filter(f=>f.alive),ps=BT.party.filter(x=>x.alive);if(!fs.length)return {type:'def'};
   const t=fs.reduce((m,f)=>f.hp<m.hp?f:m,fs[0]);
   if(sp&&p.sp==='xie'&&ps.some(x=>x.hp<x.max*.5)&&Math.random()<.35)return {type:'cheal',n:sp.sk};
   if(sp&&Math.random()<.3+.015*p.lv)return {type:'csk',n:sp.sk,fx:'orb',pow:1.3+.03*p.lv,t};
   return {type:'atk',t};}
  return ai0.apply(this,arguments);};}
{const bs0=btSpr;btSpr=function(a){if(a&&a.pet)return cvMemo('petbt|'+a.look,()=>{const c=btUp(monCv(a.look,.8,null,9),1.6);const n=mkCv(c.width,c.height),x=n.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);n.ww=c.ww;n.hh=c.hh;return n;});return bs0.apply(this,arguments);};}

/* 打赢以后：出战的灵宠长一点；野外偶尔遇到幼崽 */
let PET_TAME_Q=null;
{const bw0=btWin;btWin=async function(){try{if(BT){const p=petActive();if(p&&BT.party.some(x=>x.pet)){petXp(p,3);p.bond=Math.min(100,p.bond+1);}
   const z=WD&&WD.M&&WD.M.kind!=='town'?WD.M.z:null;const story=BT.opt&&BT.opt.noFlee;
   if(z!=null&&!story){const sp=Object.keys(PET_SP).find(k=>PET_SP[k].z===z&&k!=='huitu');if(sp&&!petHas(sp)&&Math.random()<((S.tame||{})[sp]?.3:.12))PET_TAME_Q=sp;}}}catch(e){console.error(e);}
  const r=await bw0.apply(this,arguments);if(PET_TAME_Q){const sp=PET_TAME_Q;PET_TAME_Q=null;setTimeout(()=>{try{petTameAsk(sp);}catch(e){console.error(e);}},900);}return r;};}
function petTameAsk(sp){if(!sp||petHas(sp)||BT)return;const s=PET_SP[sp];S.tame=S.tame||{};const prog=S.tame[sp]||0;
 const have=Object.keys(PET_FOOD).filter(k=>(S.petFood[k]||0)>0);
 const btns=have.map(k=>({t:'喂一块'+PET_FOOD[k].n,cls:k===s.like?'gold':'',fn:()=>petTameFeed(sp,k)}));btns.push({t:'不打扰它'});
 modal(`<h3>${esc(s.n)}幼崽</h3><p>${prog?'又是那只'+esc(s.n)+'幼崽。它比上回靠得近了一点。':'仗打完，石缝后面探出一只'+esc(s.n)+'幼崽，盯着你的行囊看。'}</p><p class="note">${esc(s.d)}${have.length?'':'<br>你身上没有吃的。行囊里可以买灵宠食料。'}</p>`,btns);}
function petTameFeed(sp,food){const s=PET_SP[sp];S.petFood[food]--;S.tame=S.tame||{};
 if(food===s.hate){toast('它闻了闻，扭头钻回石缝里了。');save();return;}
 S.tame[sp]=(S.tame[sp]||0)+(food===s.like?1.5:1);
 if(S.tame[sp]>=3){const p=petGive(sp);delete S.tame[sp];save();modal(`<h3>${esc(s.n)}跟你走了</h3><p>它吃完最后一口，没有再躲，跟在你脚后。你叫它「${esc(p.name)}」。</p><p class="note">在行囊里能喂它、让它出战。</p>`,[{t:'好',cls:'gold',fn:()=>render()}]);}
 else{toast('它吃了，往后退了两步，没有跑。下回在这里，也许还能碰见它。');save();}}

/* 第一卷：鼠王之后，灰团跟你回站 */
{const rk=STORY.find(c=>c.id==='ratking');if(rk&&Array.isArray(rk.lines))rk.lines.push(
 ['','回站的路上，一只巴掌大的石皮鼠幼崽一直跟在你脚后。你停，它也停。'],
 ['tie','（看了一眼）鼠王窝里掉出来的。养得活，就养着。'],
 {fn:()=>{petGive('huitu');}},['','它叫灰团。吃杂粮，不吃果子。'],['','【灵宠：灰团。在行囊里喂它。筑基以后，它能跟你出战。】']);}

/* 行囊页：灵宠 */
const petImg=look=>cvMemo('petimg|'+look,()=>{const c=monCv(look,.9,null,9);const n=mkCv(c.width,c.height),x=n.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return n;}).toDataURL();
function petHTML(){const P=S.pets||[];if(!P.length)return '';const fd=S.petFood||{};
 return `<h2 class="sec">灵宠 <small>${realmIdx()>=1?'出战的那只跟你进战斗':'筑基以后，它能跟你出战'}</small></h2>
 ${P.map((p,i)=>{const sp=PET_SP[p.sp];const on=S.petOn===i,hungry=p.full<PET_HUNGRY;
  return `<div class="pet ${on?'on':''}"><img class="pet-img" src="${petImg(sp.look)}" alt=""><div class="pet-in"><div class="iname">${esc(p.name)}<span class="lv">${sp.n} · ${petStage(p.lv)} · ${p.lv} 级</span></div>
   <div class="pet-bar"><span>饱食</span><i><b style="width:${p.full}%" class="${hungry?'low':''}"></b></i><em>${Math.round(p.full)}</em></div>
   <div class="pet-bar"><span>成长</span><i><b style="width:${p.lv>=PET_MAX?100:Math.round(p.xp/petNeed(p.lv)*100)}%"></b></i><em>${p.lv>=PET_MAX?'满':Math.round(p.xp)+'/'+petNeed(p.lv)}</em></div>
   <div class="istat">${hungry?'饿了，没力气，不肯出战。':''}喜欢${PET_FOOD[sp.like].n}，不吃${PET_FOOD[sp.hate].n}。招式「${sp.sk}」。亲近 ${p.bond}</div>
   <div class="row">${Object.keys(PET_FOOD).filter(k=>(fd[k]||0)>0).map(k=>`<button class="btn sm ${k===sp.like?'gold':'ghost'}" data-act="petFeed" data-arg="${i}|${k}">喂${PET_FOOD[k].n}</button>`).join('')||'<span class="note">没有食料了。</span>'}
   <button class="btn sm ${on?'':'ghost'}" data-act="petOn" data-arg="${i}">${on?'出战中':'让它出战'}</button></div></div></div>`;}).join('')}
 <div class="pet-shop"><b>食料</b> ${Object.keys(PET_FOOD).map(k=>`<button class="btn sm ghost" data-act="petBuy" data-arg="${k}">${PET_FOOD[k].n} ×${fd[k]||0} · 买五份 ${fmt(zsAt(maxZone(),PET_FOOD[k].p*5))}</button>`).join('')}
 <button class="btn sm ${S.petAuto?'gold':'ghost'}" data-act="petAuto">自动喂食：${S.petAuto?'开':'关'}</button></div>`;}
function petFeedAct(arg){const [i,k]=String(arg).split('|');const p=(S.pets||[])[+i];if(!p||!(S.petFood[k]>0))return;
 const r=petEat(p,k);if(r==='hate'){toast(p.name+'闻了闻，扭过头去。');return;}S.petFood[k]--;
 const lv0=p.lv;toast(r==='like'?p.name+'吃得很香。':p.name+'吃了。');if(p.lv>lv0)toast(p.name+'长大了一些：'+p.lv+' 级。','big');save();render();}

LATE.push(()=>{
 Object.assign(ACT,{petFeed:a=>petFeedAct(a),petOn:a=>{S.petOn=+a;save();render();},
  petBuy:k=>{const f=PET_FOOD[k];if(!f)return;const c=zsAt(maxZone(),f.p*5);if(S.stones<c){toast('灵石不够。','bad');return;}S.stones-=c;S.petFood[k]=(S.petFood[k]||0)+5;save();render();},
  petAuto:()=>{S.petAuto=!S.petAuto;save();render();}});
 const bv0=VIEWS.bag;VIEWS.bag=()=>petHTML()+bv0();
});
/* 已经走过鼠王那一章的存档：灰团补上（开局和切换存档都会经过 render） */
function petGiftOld(){if(S&&S.started&&S.seen.includes('ratking')&&!petHas('huitu')&&!S.flags.petGift){S.flags.petGift=1;petGive('huitu');save();
 setTimeout(()=>{try{modal('<h3>灰团</h3><p>站里的人说，鼠王一战以后，有只石皮鼠幼崽一直在你铺位底下打转，赶都赶不走。你叫它灰团。</p><p class="note">在行囊里能喂它。筑基以后，它能跟你出战。</p>',[{t:'好',cls:'gold'}]);}catch(e){}},1500);}}
{const r0=render;render=function(){try{petGiftOld();}catch(e){}return r0.apply(this,arguments);};}
