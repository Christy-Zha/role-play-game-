/* ================= 灵根 · 五行 · 状态 · 连携 · 阵法 · 神通 ================= */
const EL={jin:{n:'金',c:'#f2d478'},mu:{n:'木',c:'#7ad08a'},shui:{n:'水',c:'#6ab8ff'},huo:{n:'火',c:'#ff7a3a'},tu:{n:'土',c:'#d0a868'},lei:{n:'雷',c:'#c9a8ff'},bing:{n:'冰',c:'#bfefff'}};
const KE={jin:'mu',mu:'tu',tu:'shui',shui:'huo',huo:'jin',lei:'shui',bing:'mu'};
const SHENG={jin:'shui',shui:'mu',mu:'huo',huo:'tu',tu:'jin'};
const ROOTS={
 huo:{n:'火灵根',d:'火系法术 +25%；灼烧多叠一层，灼烧伤害 +30%',tip:'先叠灼烧，再用雷法引爆「爆燃」'},
 lei:{n:'雷灵根',d:'雷系法术 +25%；爆燃、导电等连携伤害 +40%',tip:'让敌人先灼烧或潮湿，再落雷',rare:1},
 shui:{n:'水灵根',d:'水系法术 +25%；护盾 +50%，护盾在时反伤更强',tip:'玄水盾挡伤反震；潮湿之后接雷或冰'},
 bing:{n:'冰灵根',d:'冰系法术 +25%；普攻 25% 附加霜冻',tip:'霜冻满三层就冻结，再用剑「碎冰」',rare:1},
 mu:{n:'木灵根',d:'木系法术 +25%；治疗 +30%，每回合回复 4% 生命',tip:'藤蔓缠住敌人，再放火「燎原」'},
 jin:{n:'金灵根',d:'金系法术 +25%；破甲 +20%，暴伤 +30%',tip:'先破甲后重击，碎冰伤害最高'},
 tu:{n:'土灵根',d:'土系法术 +25%；坚韧 +15%，开战自带护盾',tip:'站得最稳，配阵法、配感电「震荡」'}
};
const hasRoot=e=>!!e&&(S.root===e||S.root2===e);
const rootName=()=>S.root?(S.root2?EL[S.root].n+EL[S.root2].n+'双灵根':ROOTS[S.root].n):'未测';
const ST_N={burn:'灼烧',shock:'感电',wet:'潮湿',chill:'霜冻',root:'缠绕',brk:'破甲',stun:'震晕',expose:'照妖'};
const ST_C={burn:'#ff8a3a',shock:'#c9a8ff',wet:'#6ab8ff',chill:'#bfefff',root:'#7ad08a',brk:'#f2d478',stun:'#ffd070',expose:'#ff6aa8'};

/* ---------- 技能五行与灵根法术 ---------- */
const SK_EL={yujian:'jin',huichun:'mu',hengsao:'jin',jingang:'tu',leijue:'lei',wanjian:'jin',huolong:'huo',xuanbing:'bing',xixing:'shui',mingwang:'tu',feixian:'jin'};
SKILLS.forEach(s=>{if(SK_EL[s.k])s.el=SK_EL[s.k];});
SKILLS.find(s=>s.k==='huolong').st='burn';SKILLS.find(s=>s.k==='huolong').stn=1;SKILLS.find(s=>s.k==='leijue').st='shock';SKILLS.find(s=>s.k==='leijue').stn=2;
SKILLS.push(
 {k:'fenxin',n:'焚心火',mp:6,root:'huo',rl:0,ty:'one',pow:1.3,el:'huo',st:'burn',stn:2,fx:'fire',d:'灼烧目标两层'},
 {k:'sanmei',n:'三昧真火',mp:18,root:'huo',rl:2,ty:'all',pow:1.2,el:'huo',st:'burn',stn:2,fx:'fire',d:'全体灼烧两层'},
 {k:'zhangxin',n:'掌心雷',mp:7,root:'lei',rl:0,ty:'one',pow:1.6,el:'lei',st:'shock',stn:2,d:'感电；能引爆灼烧、导通潮湿'},
 {k:'jiutian',n:'九天神雷',mp:22,root:'lei',rl:2,ty:'all',pow:1.6,el:'lei',st:'shock',stn:2,fx:'bolt',d:'全场落雷，一并引爆'},
 {k:'xuanshui',n:'玄水盾',mp:9,root:'shui',rl:0,ty:'shield',pow:.22,el:'shui',d:'全队护盾（生命 22%），护盾在时反震 30%'},
 {k:'canglan',n:'沧澜',mp:16,root:'shui',rl:2,ty:'all',pow:1.15,el:'shui',st:'wet',stn:3,fx:'sweep',heal:.1,d:'全体潮湿，同伴回复 10% 生命'},
 {k:'ningshuang',n:'凝霜指',mp:6,root:'bing',rl:0,ty:'one',pow:1.4,el:'bing',st:'chill',stn:1,d:'霜冻一层，满三层冻结'},
 {k:'bingfeng',n:'冰封千里',mp:20,root:'bing',rl:2,ty:'all',pow:1.2,el:'bing',st:'chill',stn:1,fx:'sweep',d:'全体霜冻一层'},
 {k:'tengfu',n:'青藤缚',mp:7,root:'mu',rl:0,ty:'one',pow:1.1,el:'mu',st:'root',stn:1,d:'缠绕：目标下回合动弹不得'},
 {k:'wanmu',n:'万木回春',mp:16,root:'mu',rl:2,ty:'heal',pow:.3,el:'mu',regen:3,d:'全队回复 30% 生命，并回春三回合'},
 {k:'pojia',n:'破甲剑',mp:6,root:'jin',rl:0,ty:'one',pow:1.6,el:'jin',st:'brk',stn:3,d:'破甲：目标防御减半三回合'},
 {k:'gengjin',n:'庚金剑阵',mp:20,root:'jin',rl:2,ty:'all',pow:1.7,el:'jin',st:'brk',stn:2,fx:'swords',d:'全体破甲'},
 {k:'shanyue',n:'山岳印',mp:8,root:'tu',rl:0,ty:'one',pow:1.9,el:'tu',st:'stun',stn:1,chance:.4,d:'重击，四成震晕'},
 {k:'houtu',n:'厚土甲',mp:14,root:'tu',rl:2,ty:'shield',pow:.3,el:'tu',d:'全队护盾（生命 30%）'},
 /* 宗门绝学 */
 {k:'fentian',n:'赤霄焚天',mp:20,book:'chixiao',ty:'all',pow:1.5,el:'huo',st:'burn',stn:3,fx:'fire',d:'全体灼烧三层'},
 {k:'xuanming',n:'玄冥真水',mp:14,book:'xuanshuij',ty:'shield',pow:.28,el:'shui',wetAll:1,d:'全队护盾并令敌人潮湿'},
 {k:'guizhao',n:'幽冥鬼爪',mp:12,book:'youming',ty:'one',pow:2,el:'bing',st:'chill',stn:2,drain:.4,d:'摄魂：霜冻两层并吸取生命'},
 {k:'yinlei',n:'天穹引雷',mp:16,book:'tianqiong',ty:'one',pow:2.4,el:'lei',st:'shock',stn:2,combo:1.5,d:'连携伤害再 +50%'}
);
Object.assign(BOOKS,{
 chixiao:{sect:1,n:'《赤霄焚天诀》',ty:'skill',lv:14,d:'学会「赤霄焚天」：全体灼烧三层（火）'},
 xuanshuij:{sect:1,n:'《玄冥真水经》',ty:'skill',lv:18,d:'学会「玄冥真水」：全队护盾，敌人潮湿（水）'},
 youming:{sect:1,n:'《幽冥鬼爪》',ty:'skill',lv:22,d:'学会「幽冥鬼爪」：霜冻并吸取生命（冰）'},
 tianqiong:{sect:1,n:'《天穹引雷诀》',ty:'skill',lv:28,d:'学会「天穹引雷」：雷击，连携伤害 +50%（雷）'},
 baicao:{sect:1,n:'《青帝长生功》',ty:'pas',lv:12,d:'每回合回复 3% 生命，治疗 +25%',fx:{regen:.03,healP:.25}},
 tiegu:{sect:1,n:'《铁骨金身》',ty:'pas',lv:10,d:'受到伤害 -12%，防御 +20%',fx:{dr:.12,defP:.2}}
});

/* ---------- 阵法 ---------- */
const FORMS={
 jingang:{n:'金刚阵',d:'全队受到的伤害 -15%'},
 juling:{n:'聚灵阵',d:'法术灵力消耗 -20%，每回合多回 6% 灵力'},
 tiangang:{n:'天罡杀阵',d:'全队攻击 +15%，暴击 +10%'},
 wuxing:{n:'五行轮转阵',d:'按相生顺序（金→水→木→火→土→金）接连施法，每接一环伤害 +25%，最多四环'},
 liangyi:{n:'两仪微尘阵',d:'每回合开始，全队获得 8% 生命的护盾'},
 jiugong:{n:'九宫八卦阵',d:'敌人的攻击有 25% 落空'}
};
function learnForm(k){if(!S.forms.includes(k)){S.forms.push(k);if(!S.form)S.form=k;toast('习得阵法「'+FORMS[k].n+'」','big');sfx('bell');return ' 习得阵法「'+FORMS[k].n+'」。';}return '';}

/* ---------- 测灵根 ---------- */
function rootRoll(){const all=Object.keys(ROOTS),o=[];while(o.length<3){const k=pick(all);if(o.includes(k))continue;if(ROOTS[k].rare&&Math.random()<.6)continue;o.push(k);}return o;}
function openRootTest(){if(S.root||BT)return;const opts=S.flags.rootOpts||(S.flags.rootOpts=rootRoll());save();
 modal(`<h3>测灵根</h3><p>墨老让你把手按在玉简上。玉简里亮起三道光，分别缠上你的经脉——它们都在争。</p><p class="note">灵根决定你的五行和流派，选定后不能更改。五行彼此相克：金克木、木克土、土克水、水克火、火克金；雷导水，冰冻木。</p>
 <div class="rootpick">${opts.map(k=>`<div class="rp" style="--ec:${EL[k].c}"><b>${ROOTS[k].n}${ROOTS[k].rare?'<em>异灵根</em>':''}</b><span>${ROOTS[k].d}</span><small>流派：${ROOTS[k].tip}</small></div>`).join('')}</div>`,
  opts.map(k=>({t:'选'+ROOTS[k].n,cls:'gold',fn:()=>pickRoot(k)})).concat([{t:'再想想',cls:'ghost'}]));}
function pickRoot(k){S.root=k;if(!S.forms.includes('jingang'))S.forms.push('jingang');if(!S.form)S.form='jingang';const sk=SKILLS.find(s=>s.root===k&&!s.rl);
 sfx('rise');save();render();setTimeout(()=>modal(`<h3>${ROOTS[k].n}</h3><p>光芒沉入丹田。你感到身体里有一种东西醒了过来，安静地，等你叫它的名字。</p><p>领悟法术「<b>${sk.n}</b>」：${sk.d}。<br>结成金丹后，还会领悟第二门灵根法术。</p><p>习得阵法「<b>金刚阵</b>」（在「修」页切换阵法）。</p><p class="note">流派提示：${ROOTS[k].tip}。</p>`,[{t:'好',cls:'gold'}]),200);}

/* ---------- 敌人的五行 ---------- */
const ZEL={0:['tu','jin'],1:['huo','jin'],2:['mu','shui'],3:['shui','bing'],4:['lei','jin'],5:['huo','tu'],6:['jin','huo'],7:['lei','bing','huo'],8:['bing','lei'],9:['jin','tu'],10:['shui','bing'],town:['tu','jin']};
function foeEl(e){if(e.el!==undefined)return e.el;if(e.jie)return null;const L=ZEL[e.z]||ZEL[BT&&BT.bgk]||ZEL.town;return pick(L);}

/* ---------- 状态 ---------- */
const stOf=t=>t.st||(t.st={});
function stAdd(t,k,n,src){if(!t||!t.alive||t.jie)return;const s=stOf(t);
 if(k==='burn'&&t.mech==='fireImm'){btPop(t,'不惧火','tag');return;}
 if(k==='chill'&&t.mech==='summon'){btPop(t,'阴寒无用','tag');return;}
 if(k==='burn'){n+=src&&src.key==='hero'&&hasRoot('huo')?1:0;s.burn=Math.min(9,(s.burn||0)+n);s.burnA=Math.max(s.burnA||0,src?src.atk:t.atk*.5);s.burnK=src&&src.key==='hero'&&hasRoot('huo')?1.3:(s.burnK||1);btPop(t,'灼烧 '+s.burn,'st burn');return;}
 if(k==='chill'){s.chill=(s.chill||0)+n;if(s.chill>=3){s.chill=0;if(t.boss&&t.frozenOnce>=2){btPop(t,'冰封无效','tag');return;}t.frozen=1;t.frozenOnce=(t.frozenOnce||0)+1;btPop(t,'冻结','st chill');sfx('ice');return;}btPop(t,'霜冻 '+s.chill,'st chill');return;}
 if((k==='stun'||k==='root')&&t.boss){s.bossCtl=(s.bossCtl||0)+1;if(s.bossCtl>2){btPop(t,'挣脱','tag');return;}}
 s[k]=Math.max(s[k]||0,n);btPop(t,ST_N[k],'st '+k);}
function stTick(a){if(a.side==='p'){if(a.rg>0){a.rg--;btHeal(a,a.max*.08);}const rg=(a.key==='hero'?(hasRoot('mu')?.04:0)+(stats().regen||0):0);if(rg&&a.hp<a.max)btHeal(a,a.max*rg);}
 const s=a.st;if(!s)return null;
 if(s.burn>0){const dd=(s.burnA||a.atk*.5)*.16*s.burn*(s.burnK||1);btHit(a,dd,'burn');s.burn--;if(!a.alive)return 'dead';}
 ['shock','wet','brk','expose'].forEach(k=>{if(s[k]>0)s[k]--;});
 if(s.stun>0){s.stun--;return '被震晕了';}if(s.root>0){s.root--;return '被藤蔓缠住了';}return null;}
function stChips(a){const s=a.st||{},L=[];['burn','chill','shock','wet','root','brk','stun','expose'].forEach(k=>{if(s[k]>0)L.push([k,ST_N[k][0]+(k==='burn'||k==='chill'?s[k]:'')]);});if(a.frozen>0)L.push(['chill','冻']);return L;}

/* ---------- 五行克制与连携 ---------- */
function elMul(a,t,el){let m=1,tag='';if(!el||t.jie)return [1,''];if(a.key==='hero'&&hasRoot(el))m*=1.25;if(a.key==='hero'&&S.natal&&S.natal.el===el)m*=1+.01*S.natal.lv;
 if(t.el){if(KE[el]===t.el||(el==='huo'&&t.el==='bing')){m*=1.5;tag='克制';}else if(el===t.el){m*=.6;tag='抵抗';}}return [m,tag];}
const comboK=(a,o)=>(a.key==='hero'&&hasRoot('lei')?1.4:1)*(o&&o.combo||1)*(S.path==='mo'?1.1:1);
function comboFx(t,name,col){BT.fx.push({k:'combo',x:t.bx+t.ox,y:t.by-btSpr(t).hh-16,txt:name,col:col||'#ffd070',t0:BT.t,dur:.9});BT.fx.push({k:'flash',t0:BT.t,dur:.22});BT.shake=Math.max(BT.shake,.35);sfx('combo');S.combos=(S.combos||0)+1;}
function elStrike(a,t,el,d,o){o=o||{};if(!t||!t.alive)return 0;const s=stOf(t);let combo=null,extra=null,cls=o.cr?'crit':'';
 const [m,tag]=elMul(a,t,el);d*=m;if(o.mul)d*=o.mul;if(a.big>0)d*=1.8;if(s.expose)d*=1.5;
 if(o.phys&&t.frozen>0){d*=2.5*(a.key==='hero'&&hasRoot('jin')?1.2:1);t.frozen=0;combo='碎冰';}
 else if(el==='jin'&&t.frozen>0){d*=2.2;t.frozen=0;combo='碎冰';}
 if(el==='lei'&&s.burn>0){const n=s.burn,k=comboK(a,o);s.burn=0;combo='爆燃';extra=()=>{BT.foes.filter(f=>f.alive).forEach(f=>btHit(f,a.atk*.5*n*k*(f===t?1:.55),'combo',a));};}
 else if(el==='lei'&&s.wet>0){s.wet=0;combo='导电';const k=comboK(a,o),dd=d;extra=()=>BT.foes.filter(f=>f.alive&&f!==t).forEach(f=>{btHit(f,dd*.75*k,'combo',a);stAdd(f,'shock',2,a);});d*=1.3*k;}
 if(el==='huo'&&s.root>0){s.root=0;combo='燎原';extra=()=>BT.foes.filter(f=>f.alive).forEach(f=>stAdd(f,'burn',f===t?4:2,a));}
 if(el==='bing'&&s.wet>0){s.wet=0;combo='冰封';extra=()=>{if(t.alive){t.frozen=1;btPop(t,'冻结','st chill');}};}
 if(el==='tu'&&s.shock>0){s.shock=0;combo='震荡';d*=1.3;extra=()=>{if(t.alive)stAdd(t,'stun',1,a);};}
 if(el==='shui'&&s.burn>0){combo='蒸腾';d*=1.2+.12*s.burn;s.burn=0;}
 if(combo){comboFx(t,combo,combo==='爆燃'||combo==='燎原'?'#ff8a3a':combo==='导电'?'#c9a8ff':combo==='碎冰'||combo==='冰封'?'#bfefff':'#ffd070');cls='combo';}
 else if(tag==='克制'&&!o.cr){btPop(t,'克制','tag');}else if(tag==='抵抗')btPop(t,'抵抗','tag dim');
 btHit(t,d,cls,a);if(o.drain)btHeal(a,d*o.drain);
 if(extra)extra();
 if(o.st&&t.alive&&(!o.chance||Math.random()<o.chance))stAdd(t,o.st,o.stn||1,a);
 if(o.phys&&a.key==='hero'&&hasRoot('bing')&&t.alive&&Math.random()<.25)stAdd(t,'chill',1,a);
 return d;}
function rotStep(a,el){if(a.key!=='hero'||S.form!=='wuxing'||!el||!SHENG[el])return 1;const R=BT.rot||(BT.rot={last:null,n:0});if(R.last&&SHENG[R.last]===el){R.n=Math.min(4,R.n+1);btPop(a,'轮转 '+R.n+' 环','buff');}else R.n=0;R.last=el;return 1+.25*R.n;}

/* ---------- 伤害入口（护盾、反震、金身、水镜、元婴不灭） ---------- */
function btHit(t,d,cls,src){if(!t||!t.alive||!BT)return;
 if(t.side==='p'){
  if(src&&src.side==='e'&&S.form==='jiugong'&&Math.random()<.25){btPop(t,'落空','buff');return;}
  if(t.big>0)d*=.7;
  if(t.sh>0){const ab=Math.min(t.sh,d);t.sh-=ab;d-=ab;if(ab>0){btPop(t,'护盾 -'+fmt(ab),'shield');if(t.rf&&src&&src.alive&&src.side==='e'){const rr=ab*t.rf*(hasRoot('shui')?1.4:1);setTimeout(()=>{if(BT&&src.alive){btHitRaw(src,rr,'reflect');btPop(src,'反震','tag');}},140);}}if(d<=0){btParty();return;}}
  if(t.key==='hero'&&d>=t.hp&&realmIdx()>=3&&!BT.yuanying){BT.yuanying=1;t.hp=Math.max(1,t.max*.3);btPop(t,'元婴不灭','buff');BT.fx.push({k:'ring',x:t.bx,y:t.by-24,col:'#ffe08a',t0:BT.t,dur:.9});btMsg('元婴护住了肉身，你从死境里站了起来！');sfx('rise');btParty();return;}}
 else{const s=t.st||{};
  if(t.mech==='jinshen'&&!s.brk){d*=.25;if(Math.random()<.5)btPop(t,'金身','tag');}
  if(t.mech==='shuijing'&&!s.shock&&src&&src.side==='p'&&src.alive&&cls!=='burn'){const rr=d*.3;setTimeout(()=>{if(BT&&src.alive)btHitRaw(src,rr,'reflect');},140);if(Math.random()<.4)btPop(t,'水镜','tag');}
  if(t.jie){d*=.6;}}
 btHitRaw(t,d,cls,src);}

/* ---------- 回合开始 ---------- */
function roundStart(){if(!BT)return false;const ps=BT.party.filter(p=>p.alive),fs=BT.foes.filter(f=>f.alive);
 if(BT.ncd>0)BT.ncd--;BT.party.forEach(p=>{if(p.big>0)p.big--;});
 if(S.form==='liangyi'&&BT.round>1)ps.forEach(p=>{p.sh=(p.sh||0)+p.max*.08;});
 if(BT.dom&&BT.dom.n>0){BT.dom.n--;const e=BT.dom.el,h=BT.party[0];btMsg(EL[e].n+'之领域 · 还有 '+BT.dom.n+' 回合');
  if(e==='huo')fs.forEach(f=>stAdd(f,'burn',1,h));if(e==='bing')fs.forEach(f=>stAdd(f,'chill',1,h));if(e==='jin')fs.forEach(f=>stAdd(f,'brk',2,h));
  if(e==='lei'){const f=pick(fs);if(f)elStrike(h,f,'lei',h.atk*1.2,{st:'shock',stn:1});}
  if(e==='shui'||e==='tu')ps.forEach(p=>{p.sh=(p.sh||0)+p.max*.07;});if(e==='mu')ps.forEach(p=>btHeal(p,p.max*.07));}
 fs.forEach(f=>{const s=f.st||{};
  if(f.mech==='heal'&&f.hp<f.max){if(s.burn>0)btPop(f,'草木焦枯','tag');else btHeal(f,f.max*(f.healK||.1));}
  if(f.mech==='summon'&&BT.round%3===0&&BT.foes.filter(x=>x.alive).length<3){const g=mkCustom(Math.max(0,f.z||0),{look:'归墟游魂',name:'幽冥鬼仆',m:.55});g.z=f.z;g.el='bing';g.noLoot=1;g.summ=1;Object.assign(g,{side:'e',alive:true,ox:0,oy:-10,alpha:0,flash:0,buf:0,defd:false,spd:8,idx:BT.foes.length,max:g.hp});BT.foes.push(g);btLayout();tween(g,{alpha:1,oy:0},400);btMsg(f.n+' 招来了鬼仆');}});
 if(BT.opt.jie){BT.jr=(BT.jr||0)+1;const N=BT.opt.jie;if(BT.jr>N){BT.foes.forEach(f=>{f.alive=false;tween(f,{alpha:0},500);});btMsg('最后一道雷落下——云开了。');return false;}btMsg('天劫 · 第 '+BT.jr+' / '+N+' 道');}
 return false;}

/* ---------- 神通 ---------- */
const SHEN=[
 {k:'natal',n:'本命法宝',r:2,d:()=>S.natal?NATAL[S.natal.t].bd(S.natal.lv):'先在「修」页祭炼本命法宝'},
 {k:'soul',n:'元神出窍',r:3,once:1,d:()=>'元婴离体，立刻再行动一次'},
 {k:'domain',n:'领域',r:4,once:1,d:()=>S.root?'展开'+EL[S.root].n+'之领域，持续三回合':'需要灵根'},
 {k:'faxiang',n:'法相天地',r:6,once:1,d:()=>'三回合内伤害 ×1.8，受伤 -30%'},
 {k:'yanchu',n:'言出法随',r:7,once:1,d:()=>'一字「定」：全体敌人停顿一回合'},
 {k:'zhandao',n:'斩道',r:9,once:1,d:()=>'斩去所有敌人 15% 生命上限'}
];
function shenOk(s){if(realmIdx()<s.r)return false;if(s.k==='natal')return !!S.natal&&!(BT.ncd>0);if(s.k==='domain'&&!S.root)return false;return !(BT.used&&BT.used[s.k]);}
function shenMenu(){const a=BT.cur,L=SHEN.filter(s=>realmIdx()>=s.r);
 btSetCmd((L.length?L.map(s=>`<button class="li" data-b="n:${s.k}" ${shenOk(s)?'':'disabled'}><b>${s.k==='natal'&&S.natal?NATAL[S.natal.t].n:s.n}</b><small>${s.d()}${s.k==='natal'&&BT.ncd>0?' · 冷却 '+BT.ncd+' 回合':''}${s.once&&BT.used&&BT.used[s.k]?' · 本场已用':''}</small></button>`).join(''):'')+`<p class="hint">${SHEN.filter(s=>realmIdx()<s.r).slice(0,2).map(s=>REALMS[s.r]+'：'+s.n).join(' · ')}</p><button class="li back" data-b="back">返回</button>`,'list');}
async function shenDo(a,act){const k=act.k,fs=BT.foes.filter(f=>f.alive),ps=BT.party.filter(p=>p.alive);BT.used=BT.used||{};const top=fs.reduce((m,f)=>f.max>m.max?f:m,fs[0]);
 if(k==='natal'){const N=S.natal,T=NATAL[N.t],lv=N.lv;BT.ncd=3;btMsg(a.name+' 祭出「'+T.n+'」');await btCast(a,EL[N.el]?EL[N.el].c:'#ffd070');sfx('bell');
  if(N.t==='jian'){const [x0,y0]=ctr(a),[x1,y1]=ctr(top);BT.fx.push({k:'proj',x0,y0,x1,y1,col:'#fff2c8',t0:BT.t,dur:.3});await bwait(300);const p0=a.pen;a.pen=Math.min(.9,(a.pen||0)+.5);elStrike(a,top,N.el,dmgF(a.atk*(3+.12*lv),penD(a,top)*.6),{cr:Math.random()<a.crit});a.pen=p0;}
  else if(N.t==='yin'){BT.shake=.6;BT.fx.push({k:'wave',x:BT.W*.3,y:BT.H*.6,t0:BT.t,dur:.5});await bwait(380);fs.forEach(f=>elStrike(a,f,N.el,dmgF(a.atk*(1.3+.06*lv),penD(a,f)*.7),{st:'stun',stn:1,chance:.35}));}
  else if(N.t==='zhong'){ps.forEach(p=>{p.sh=(p.sh||0)+p.max*(.25+.01*lv);p.rf=Math.max(p.rf||0,.3);btPop(p,'混元钟','buff');BT.fx.push({k:'ring',x:p.bx,y:p.by-24,col:'#ffd070',t0:BT.t,dur:.8});});}
  else if(N.t==='hu'){let sum=0;fs.forEach(f=>{const v=f.hp*(.1+.003*lv)+a.atk*.5;sum+=v;btHit(f,v,'',a);});ps.forEach(p=>btHeal(p,sum/ps.length*.6));}
  else if(N.t==='jing'){fs.forEach(f=>{stOf(f).expose=f===top?3:2;btPop(f,'照妖','st expose');});BT.fx.push({k:'flash',t0:BT.t,dur:.3});}}
 else if(k==='soul'){BT.used.soul=1;btMsg('元婴出窍——你同时在两个地方。');BT.fx.push({k:'ghost',x:a.bx,y:a.by,t0:BT.t,dur:.8});sfx('cast');BT.q.unshift(a);await bwait(500);}
 else if(k==='domain'){BT.used.domain=1;BT.dom={el:S.root,n:3};btMsg('领域展开：'+EL[S.root].n+'！');BT.fx.push({k:'flash',t0:BT.t,dur:.3});sfx('bell');await bwait(500);}
 else if(k==='faxiang'){BT.used.faxiang=1;a.big=3;btMsg('法相天地！');BT.shake=.5;sfx('rise');await bwait(600);}
 else if(k==='yanchu'){BT.used.yanchu=1;btMsg('「定。」');BT.fx.push({k:'combo',x:BT.W*.32,y:BT.H*.35,txt:'定',col:'#fff2c8',t0:BT.t,dur:1.1});BT.fx.push({k:'flash',t0:BT.t,dur:.4});sfx('bell');fs.forEach(f=>{stOf(f).stun=1;});await bwait(600);}
 else if(k==='zhandao'){BT.used.zhandao=1;btMsg('斩道。');BT.fx.push({k:'flash',t0:BT.t,dur:.5});BT.shake=.8;sfx('thunder');await bwait(300);fs.forEach(f=>btHit(f,f.max*.15+a.atk,'combo',a));}}

/* ---------- 开战时的加成 ---------- */
function btPrep(){const f=S.form,h=BT.party[0];
 BT.party.forEach(p=>{p.sh=0;p.rf=0;p.st=null;if(f==='jingang')p.dr=Math.min(.7,(p.dr||0)+.15);if(f==='tiangang'){p.atk*=1.15;p.crit=(p.crit||.05)+.1;}if(S.path==='zheng'&&BT.foes.some(x=>x.demon))p.atk*=1.3;});
 if(hasRoot('tu'))BT.party.forEach(p=>p.sh=p.max*.1);
 const CEL={zhou:'huo',su:'lei',ning:'jin',cm:'tu',zero:'lei',hong:'mu'};BT.party.forEach(p=>{if(p.key==='hero')p.el=S.root||null;else p.el=CEL[p.key]||null;});
 BT.foes.forEach(e=>{e.el=foeEl(e);});BT.ncd=0;BT.used={};BT.healP=stats().healP||0;}

/* ---------- 绘制：法阵、领域、敌人头顶 ---------- */
function drawCircle(x,cx,cy,r,col,rot,al){x.save();x.globalAlpha=al;x.globalCompositeOperation='lighter';x.translate(cx,cy);x.scale(1,.42);x.strokeStyle=col;x.lineWidth=1.4;
 x.beginPath();x.arc(0,0,r,0,6.283);x.stroke();x.lineWidth=.8;x.beginPath();x.arc(0,0,r*.78,0,6.283);x.stroke();x.rotate(rot);
 for(let i=0;i<12;i++){x.rotate(6.283/12);x.beginPath();x.moveTo(r*.78,0);x.lineTo(r,0);x.stroke();x.fillStyle=col;x.fillRect(r*.86,-1.2,2.4,2.4);}
 x.rotate(-rot*2);x.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.283;x.lineTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62);}x.stroke();
 for(let i=0;i<3;i++){const a=i/3*6.283;x.beginPath();x.moveTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62);x.lineTo(Math.cos(a+3.14)*r*.62,Math.sin(a+3.14)*r*.62);x.stroke();}
 const g=x.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,rgba(col,.35));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.beginPath();x.arc(0,0,r,0,6.283);x.fill();x.restore();}
function btGround(x){if(BT.dom&&BT.dom.n>0){const c=EL[BT.dom.el].c,[dx,dy]=BT.d3&&typeof d3BtPt==='function'?d3BtPt(BT.W*.3,BT.H*.64):[BT.W*.3,BT.H*.64];drawCircle(x,dx,dy,BT.W*.32,c,BT.t*.4,.55+.15*Math.sin(BT.t*3));}
 if(S.form&&BT.party[0].alive){const h=BT.party[0];drawCircle(x,h.bx,h.by,22,'#e3b862',BT.t*.6,.28);}}
function btFoeHud(x){x.save();x.textAlign='center';x.textBaseline='middle';
 const bo=BT.foes.find(f=>f.alive&&(f.boss||f.jie));if(bo){const bw=Math.min(BT.W*.7,170),bx=BT.W/2-bw/2,by=56;x.fillStyle='rgba(16,10,6,.75)';x.fillRect(bx-3,by-11,bw+6,19);x.strokeStyle='rgba(216,180,104,.8)';x.lineWidth=.7;x.strokeRect(bx-3,by-11,bw+6,19);const hg=x.createLinearGradient(0,by,0,by+5);hg.addColorStop(0,bo.jie?'#d8c0ff':'#ff7a5a');hg.addColorStop(1,bo.jie?'#6a4aa8':'#8a1a10');x.fillStyle='#1a0e08';x.fillRect(bx,by+1,bw,5);x.fillStyle=hg;x.fillRect(bx,by+1,bw*Math.max(0,bo.hp/bo.max),5);x.font='400 9px "Ma Shan Zheng","KaiTi",serif';x.fillStyle='#f6e8c4';x.textAlign='left';x.fillText(bo.n,bx,by-4.5);x.textAlign='right';x.font='600 6px "Noto Serif SC",serif';x.fillText(fmt(bo.hp)+' / '+fmt(bo.max),bx+bw,by-4);x.textAlign='center';}
 for(const f of BT.foes){if(!f.alive||f.alpha<.5)continue;const s=btSpr(f),cx=f.bx+f.ox,top=f.by+f.oy-s.hh-5,w=Math.max(26,Math.min(48,s.ww*.7));
  x.fillStyle='rgba(0,0,0,.65)';x.fillRect(cx-w/2-1,top-1,w+2,4);x.fillStyle=f.jie?'#c9a8ff':f.boss?'#e0503a':'#c84a3a';x.fillRect(cx-w/2,top,w*Math.max(0,f.hp/f.max),2);
  let lx=cx-w/2;if(f.el){x.fillStyle=EL[f.el].c;x.beginPath();x.arc(lx-5,top+1,4,0,6.283);x.fill();x.fillStyle='#14100c';x.font='700 6px "Noto Serif SC",serif';x.fillText(EL[f.el].n,lx-5,top+1.3);}
  const ch=stChips(f);ch.forEach((c,i)=>{const px=cx-w/2+i*11+4,py=top-6;x.fillStyle='rgba(10,8,6,.8)';x.fillRect(px-5,py-3.5,10,7);x.fillStyle=ST_C[c[0]];x.font='600 5.5px "Noto Serif SC",serif';x.fillText(c[1],px,py+.3);});
  if(f.mech&&!f.mechShown){f.mechShown=1;}}
 x.restore();}
function btDrawFx2(x,f,p){if(f.k==='banner'){x.save();x.globalAlpha=p<.1?p/.1:p>.75?(1-p)/.25:1;const w=f.txt.length*11+22,X=Math.max(w/2+4,Math.min(BT.W-w/2-4,f.x)),Y=f.y-p*4;const g=x.createLinearGradient(X-w/2,0,X+w/2,0);g.addColorStop(0,'rgba(20,40,34,0)');g.addColorStop(.2,'rgba(20,40,34,.9)');g.addColorStop(.8,'rgba(20,40,34,.9)');g.addColorStop(1,'rgba(20,40,34,0)');x.fillStyle=g;x.fillRect(X-w/2,Y-8,w,16);x.strokeStyle=rgba(f.col,.8);x.lineWidth=.6;x.beginPath();x.moveTo(X-w/2+6,Y-8);x.lineTo(X+w/2-6,Y-8);x.moveTo(X-w/2+6,Y+8);x.lineTo(X+w/2-6,Y+8);x.stroke();x.font='400 11px "Ma Shan Zheng","KaiTi",serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f6f0dc';x.fillText(f.txt,X,Y+.5);x.restore();return true;}if(f.k==='circle'){drawCircle(x,f.x,f.y,14+p*16,f.col,p*3,(1-p)*.9);return true;}
 if(f.k==='combo'){x.save();x.globalAlpha=p<.15?p/.15:1-Math.max(0,(p-.6)/.4);x.font='400 '+(18+8*Math.min(1,p*5))+'px "Ma Shan Zheng","KaiTi",serif';x.textAlign='center';x.lineWidth=3;x.strokeStyle='rgba(20,10,4,.9)';x.strokeText(f.txt,f.x,f.y-p*14);x.fillStyle=f.col;x.fillText(f.txt,f.x,f.y-p*14);x.restore();return true;}
 if(f.k==='ghost'){x.save();x.globalAlpha=(1-p)*.7;x.globalCompositeOperation='lighter';const g=x.createRadialGradient(f.x,f.y-30-p*20,0,f.x,f.y-30-p*20,26);g.addColorStop(0,'rgba(200,230,255,.8)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(f.x-30,f.y-80,60,70);x.restore();return true;}
 return false;}

/* ---------- 劫云 ---------- */
function jieCv(){const W=90,H=60,[c,x]=hdCv(W,H,6);const g=x.createRadialGradient(45,26,4,45,30,44);g.addColorStop(0,'#3a2a5a');g.addColorStop(.6,'#1e1630');g.addColorStop(1,'rgba(10,8,20,0)');
 const R=rng(7);for(let i=0;i<16;i++){x.fillStyle=i<8?'#191426':'#2a2140';x.beginPath();x.ellipse(12+R()*66,16+R()*26,10+R()*12,7+R()*7,0,0,6.283);x.fill();}
 x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='#d8c8ff';x.lineWidth=1.2;x.shadowColor='#b48aff';x.shadowBlur=6;for(let k=0;k<3;k++){x.beginPath();let px=24+k*20,py=30;x.moveTo(px,py);for(let i=0;i<5;i++){px+=(R()-.5)*10;py+=5;x.lineTo(px,py);}x.stroke();}
 x.shadowBlur=0;for(let i=0;i<5;i++){x.fillStyle='rgba(255,240,200,.85)';x.beginPath();x.arc(20+R()*50,18+R()*18,.8,0,6.283);x.fill();}return c;}
