/* ================= 江湖人物志：十位江湖人物的命运线 =================
   每人三段。段与段之间要隔几年、要够境界；你帮谁、拦谁、晚到几年，结局都不一样。
   人物之间互有牵连：赤阳的一句话能救烈无咎；林小苗的九转金丹能救阿萤；阿萤活下来，云漪的师父才能出冥池。 */
const RW={};let RW_F=null;
/* 人物地图形象 → 立绘文件名（art/por_xxx.webp） */
const CH_POR={p_xiao:'xiao',p_lie:'lie',p_chiyang:'chiyang',p_yun:'yun',p_shuiyue:'shuiyue',p_lin:'lin',p_huagu:'huagu',p_shi:'shi',p_yan:'yan',p_gu:'gu',p_mo:'mowen'};
const rwP=id=>P_(id)||{att:0,st:0,alive:false};
function R(pid,o){const L=RW[pid]=RW[pid]||[];const id='rw_'+pid+L.length;
 const ch={id,rw:pid,title:SPK[pid]+'·'+o.t,g:o.g,bg:o.bg||'market',hint:o.hint||'',need:o.need||(()=>true),gap:o.gap||0,cond:()=>false,lines:o.lines,
  after:()=>{S.arcY=S.arcY||{};S.arcY[pid]=S.year;try{o.after&&o.after();}catch(e){console.error(e);}save();rwFlush(0);}};
 L.push(ch);STORY.push(ch);}
/* 只列出满足条件的选项 */
function rwC(list){return {fn:()=>{const L=list.filter(c=>{try{return !c.need||c.need();}catch(e){return false;}});SC.q.unshift({c:L.length?L:[{t:'……'}]});}};}
/* 按条件插入两段不同的台词 */
function rwIf(cond,A,B){return {fn:()=>{let ok=false;try{ok=cond();}catch(e){}SC.q.unshift(...((ok?A:B)||[]));}};}
const rwAtt=(id,n)=>{const p=P_(id);if(p)p.att=Math.max(-100,Math.min(100,p.att+n));};
const rwEnd=(pid,t)=>{S.flags['rwE_'+pid]=t;};
function rwSetLead(k,p){if(!p)return;S.ppl.forEach(x=>{if(x.sect===k)x.lead=0;});p.sect=k;p.lead=1;if(p.fr==='he')S.flags.heLead=1;}
function rwAlly(k){S.sects[k]=S.sects[k]||{beat:0,rel:null};if(S.sects[k].rel!=='vassal'&&S.sects[k].rel!=='gone')S.sects[k].rel='ally';}
function rwKill(p,t){if(!p||!p.alive)return;p.alive=false;p.dy=S.year;if(p.lead)p.lead=0;if(t)news(t,1);}

/* ---------- 战斗：剧情选项里登记，篇章结束后开打 ---------- */
function rwFight(o){RW_F=o;}
function rwFlush(n){if(!RW_F)return;setTimeout(()=>{if(!RW_F)return;if((!OV_FREE()||SC||BT)&&n<40)return rwFlush(n+1);const o=RW_F;RW_F=null;rwBattle(o);},400);}
function rwBattle(o){const p=o.pid?P_(o.pid):null;let foes;
 if(o.foes)foes=o.foes();
 else foes=(o.many||[o]).map(f=>{const q=f.pid?P_(f.pid):p;const st=f.st!=null?f.st:q?q.st:S.stage;const look=f.look||(q&&LOOK[q.n]?q.n:'无名剑客');
  const e=mkCustom(f.z!=null?f.z:zOfStage(st),{look,name:f.name||(q?q.n:look),st:f.z!=null?undefined:(q?Math.min(st,S.stage+2):st),m:f.m||1.5,boss:!!f.boss,p2:f.p2,n2:f.n2});if(!f.beast)e.human=1;e.noLoot=1;if(f.el)e.el=f.el;if(f.demon)e.demon=1;if(f.mech)e.mech=f.mech;if(f.decoy){e.decoy=1;e.n=e.name=f.name||e.n;}return e;});
 if(typeof jhClose==='function')jhClose();
 startBattle(foes,{bg:o.bg||'market',noFlee:!!o.noFlee,rule:o.rule,surviveN:o.surviveN,surviveMsg:o.surviveMsg,turnLimit:o.turnLimit,limitMsg:o.limitMsg,
  onWin:()=>{let t='';try{t=o.win?o.win():'';}catch(e){console.error(e);}rwMsg(o.title||'胜',t);},
  onLose:()=>{let t='';try{t=o.lose?o.lose():'';}catch(e){console.error(e);}rwMsg(o.title||'败',t,1);}});}
function rwMsg(h,t,bad){save();setTimeout(()=>{modal(`<h3>${esc(h)}</h3><p>${esc(t||'').replace(/\n/g,'<br>')}</p>`,[{t:'好',cls:bad?'':'gold'}]);checkStory();},350);}

/* ---------- 下一段在哪 ---------- */
function rwNext(p){if(!p||!p.alive||!S.started)return null;const L=RW[p.id];if(!L)return null;const ay=(S.arcY||{})[p.id]||0;
 for(const ch of L){if(S.seen.includes(ch.id))continue;if(S.pending.includes(ch.id))return ch;if(S.year<ay+ch.gap)return null;let ok=false;try{ok=ch.need(p);}catch(e){}return ok?ch:null;}return null;}
function rwScan(){if(!S.started||!S.ppl)return;S.rwT=S.rwT||{};const nw=[];
 S.pending=S.pending.filter(id=>{const ch=STORY.find(c=>c.id===id);if(!ch||!ch.rw)return true;const p=P_(ch.rw);return !!(p&&p.alive);});
 for(const pid in RW){const ch=rwNext(P_(pid));if(!ch||S.pending.includes(ch.id))continue;S.pending.push(ch.id);
  if(!S.rwT[ch.id]){S.rwT[ch.id]=1;nw.push(ch);}}
 if(!nw.length||BT)return;if(nw.length===1){const ch=nw[0];toast(SPK[ch.rw]+' 有话想对你说','观看',()=>{if(OV_FREE()&&!BT&&!SC)playStory(ch.id);});}
 else toast(nw.slice(0,2).map(c=>SPK[c.rw]).join('、')+(nw.length>2?' 等 '+nw.length+' 人':'')+' 有话想对你说','去看',()=>{if(OV_FREE()&&!BT&&!SC)jhOpen('ppl');});}
const _rwCS=checkStory;checkStory=function(q){_rwCS(q);try{rwScan();}catch(e){console.error(e);}dotUpdate();};
function rwTalk(pid){const p=P_(pid);const ch=rwNext(p);if(ch)playStory(ch.id);else if(p)personTalk(p);}
const _rwPT=personTalk;personTalk=function(p){const ch=rwNext(p);if(!ch)return _rwPT(p);
 modal(`<h3>${esc(p.n)}</h3><p>${realmOf(p.st)}${p.sect?' · '+SECTS[p.sect].n+(p.lead?SECTS[p.sect].lt:''):''} · 对你：<b>${attName(p)}</b></p><p>${esc(p.n)}看见你，像是已经等了一阵子。</p><p class="note">人物篇章 ·「${esc(ch.title.split('·').pop())}」</p>`,
  [{t:'叙话',cls:'gold',fn:()=>playStory(ch.id)},{t:'别的事',fn:()=>_rwPT(p)},{t:'告辞',cls:'ghost'}]);};
const _rwPpl=pplHTML;pplHTML=function(){const L=Object.keys(RW).map(P_).filter(p=>p&&rwNext(p));
 return (L.length?`<h3 class="sub">有话想对你说</h3>${L.map(p=>`<div class="row2 ppl friend"><img class="mini" src="${clSprite(p.ch&&CH[p.ch]?p.ch:'tie')}" alt=""><div class="in"><div class="iname">${esc(p.n)}<span class="lv">${esc(rwNext(p).title.split('·').pop())}</span></div><div class="istat">${esc(p.goal)}</div></div><div class="ibtn"><button class="btn sm gold" data-ja="talk" data-arg="${p.id}">叙话</button></div></div>`).join('')}<h3 class="sub">所有人</h3>`:'')+_rwPpl();};
function rwSum(){let n=0,t=0;for(const k in RW){t+=RW[k].length;n+=RW[k].filter(c=>S.seen.includes(c.id)).length;}return '已历 '+n+'/'+t+' 段';}
function rwHTML(){return '<p class="note">江湖上每个有名有姓的人，都有自己想做成的事。你帮谁、拦谁、晚到几年，他们的结局都会不一样。</p>'+Object.keys(RW).map(pid=>{const p=P_(pid),L=RW[pid];if(!p)return '';
  const done=L.filter(c=>S.seen.includes(c.id)).length,nx=rwNext(p),nh=L.find(c=>!S.seen.includes(c.id)),wait=nh&&S.year<((S.arcY||{})[pid]||0)+nh.gap;
  const st=!p.alive?yearName(p.dy)+'故去'+(done<L.length?' · 故事停在了这里':'')+(S.flags['rwE_'+pid]?' · '+S.flags['rwE_'+pid]:''):!nh?(S.flags['rwE_'+pid]||p.goal):nx?'有话想对你说':'下一段：'+nh.hint+(wait?'（再过些年）':'');
  return `<div class="row2 ppl ${p.alive?'':'dim'} ${nx?'friend':''}"><img class="mini" src="${clSprite(p.ch&&CH[p.ch]?p.ch:'tie')}" alt=""><div class="in"><div class="iname">${esc(p.n)}<span class="lv">${'●'.repeat(done)}${'○'.repeat(L.length-done)}</span></div><div class="istat">${esc(st)}</div></div><div class="ibtn">${nx?`<button class="btn sm gold" data-act="rwTalk" data-arg="${pid}">叙话</button>`:''}</div></div>`;}).join('');}

/* ================= 烈无咎 · 赤霄之剑 ================= */
R('lie',{t:'赤霄之剑',g:'剑',bg:'chixiao',need:()=>S.stage>=9,hint:'筑基之后，坊市里会有人找上你',lines:[
 ['','坊市的人群忽然分开了一条路。'],['lie','你就是{name}？'],
 ['','来人一身赤衣，背上的剑比他的人还傲。赤霄宗年轻一辈第一人，烈无咎。'],
 ['lie','江湖榜上，有人说你是这几年冒出来最快的一个。'],['lie','我不信。拔剑。'],
 rwC([
  {t:'「请。」',fx:()=>rwFight({pid:'lie',m:1.45,boss:1,el:'huo',title:'赤霄之剑',
    win:()=>{S.flags.rw_lie='win';rwAtt('lie',5);return '烈无咎的剑脱了手。他盯着地上的剑看了很久，没有捡。\n“……再过几年。我再来找你。”\n他走的时候，背挺得比来时还直。';},
    lose:()=>{S.flags.rw_lie='lose';rwAtt('lie',-5);return '他的剑停在你喉前一寸。\n“果然，传言都是假的。”\n他收剑入鞘，连头都没回。';}}),r:[['lie','好。']]},
  {t:'「我不跟你打。」',fx:()=>{S.flags.rw_lie='no';rwAtt('lie',-10);},r:[['lie','……胆小鬼。'],['','他把剑插回鞘里，转身走了。围观的人笑了几声，又散了。'],['','你注意到，他走出很远之后，回头看了你一眼。']]}])]});

R('lie',{t:'焚心',g:'焚',bg:'chixiao',gap:2,need:()=>S.stage>=13,hint:'结丹之后',lines:[
 ['','这几年，江湖上关于烈无咎的传闻越来越怪。有人说他闭了死关，有人说他在赤霄宗的禁地里，一待就是半年。'],
 ['','你在落雁湖边见到他的时候，他瘦得几乎脱了相，眼睛却亮得吓人。'],
 ['lie',()=>S.flags.rw_lie==='win'?'你又往前走了一大截。我追了几年，还是没追上。':S.flags.rw_lie==='lose'?'你倒是长进了。可惜，还不够。':'你当年不肯拔剑。现在呢？'],
 ['lie','我找到了一门剑法。「焚心剑」。燃寿元换剑意——一年寿元，换一分。'],
 ['lie','师父说那是禁术。我不在乎。榜首那个位置，我要。'],
 rwC([
  {t:'「那就去练。我等着你。」',fx:()=>rwLieForbid(),r:[['lie','……好。你记住今天这句话。'],['','他笑了，笑得像一团就要烧尽的火。']]},
  {t:'「赢我一次，值得你拿命去换？」',fx:()=>{rwAtt('lie',10);},r:[['lie','你不懂。我是赤霄宗百年不出的天才。我从小就被告诉，我生来就该站在最高处。'],['lie','如果我不是第一……那我是什么？'],
    ['',()=>S.flags.rw_cy==='trust'?'你想起赤阳真人那盏没喝完的茶，把他的话原原本本地讲给了烈无咎听。':''],
    ['lie',()=>S.flags.rw_cy==='trust'?'……师父真这么说？「就算他永远不是第一，也是我最好的徒弟」？':''],
    {fn:()=>{if(S.flags.rw_cy==='trust'||rwP('lie').att>=15)rwLieTrust();else rwLieForbid();}},
    ['lie',()=>F('rw_lieT')?'那本剑谱，我烧了。……下次见面，我用自己的剑。':'说得轻巧。等你也被人踩在脚下过，再来劝我。']]},
  {t:'「陪你练剑。练到你不用焚心为止。」',fx:()=>{rwLieTrust();rwAtt('lie',15);const p=P_('lie');if(p)p.tal=Math.min(1,p.tal+.1);S.age+=1;},r:[
    ['','你在落雁湖边陪他练了一整年的剑。'],['','他输了三百多场，赢了四场。第四场赢下来的时候，他把那本剑谱扔进了湖里。'],['lie','……别以为我会谢你。'],['','（你在湖边耗去了一年光阴。）']]}])]});
function rwLieForbid(){const p=P_('lie');if(!p)return;S.flags.rw_lieF=1;p.tal=Math.min(1,p.tal+.25);p.st=Math.min(LAST,p.st+2);p.lifeB=(p.lifeB||0)-Math.round(pLife(p)*.55);rwAtt('lie',-15);p.goal='用焚心剑胜过你';news('烈无咎修成赤霄禁术「焚心剑」。赤阳真人当夜闭门不出。',1);}
function rwLieTrust(){const p=P_('lie');if(!p)return;S.flags.rw_lieT=1;rwAtt('lie',20);p.goal='站在榜首——用自己的剑';}

R('lie',{t:'落雁湖',g:'榜',bg:'leitai',gap:2,need:()=>S.stage>=17,hint:'元婴之后',lines:[
 ['',()=>F('rw_lieF')?'烈无咎下了战书。落雁湖，生死不论。':'烈无咎托人送来一封信，只有一行字：「落雁湖，切磋。」'],
 ['',()=>F('rw_lieF')?'他站在湖心，焚心剑意把湖水烧得发烫。他才三十出头，头发已经白了一半。':'他站在湖心。比起当年，他的剑静了很多。'],
 ['lie',()=>F('rw_lieF')?'我只剩十几年了。够了。今天之后，江湖榜上我在你上面。':'这些年我想明白了——我要赢的，从来不是你。是那个怕输的自己。'],
 rwIf(()=>F('rw_lieF'),[rwC([
  {t:'全力出剑',fx:()=>rwFight({pid:'lie',m:2,boss:1,el:'huo',noFlee:1,title:'焚心',
    win:()=>{rwKill(P_('lie'),'烈无咎死于落雁湖。焚心剑，从此失传。');rwEnd('lie','他死在落雁湖上。最后一剑，是他这辈子最好的一剑。');return '最后一剑，你们同时出手。\n他的剑碎了。他倒在湖面上，看着天，笑了。\n“……真好看的剑。”\n他的剑穗被风吹到你脚边。'+gItemNamed('w',3,'焚心剑',maxZone());},
    lose:()=>{rwLieBurn();return '他赢了。\n他站在湖心，大笑着把剑举过头顶——然后，焚心剑意从他的七窍里烧了出来。\n三个月后，他死在赤霄峰顶。江湖榜上，他的名字在你上面，只停了九十天。';}})},
  {t:'留手，只破他的剑意',fx:()=>rwFight({pid:'lie',m:2,boss:1,el:'huo',noFlee:1,title:'焚心',
    win:()=>{const p=P_('lie');p.st=Math.max(0,p.st-4);p.lifeB=0;rwAtt('lie',45);p.goal='做一个普通的剑客';rwEnd('lie','焚心剑意被你一剑打散。他掉了两个大境界，却活了下来。');news('烈无咎焚心剑意被破，修为大跌。',1);
     return '你一剑挑散了他的剑意。\n焚心之火熄了。他从半空落进湖里，被你拖上岸的时候，已经掉了两个大境界。\n他躺在湖边，看了很久的天。\n“……我是不是，很蠢。”\n“算了。蠢就蠢吧。我还活着。”';},
    lose:()=>{rwLieBurn();return '你留了手，他没有。\n他赢了。三个月后，焚心之火烧穿了他的经脉。他死在赤霄峰顶。江湖榜上，他的名字在你上面只停了九十天。';}})},
  {t:'「你赢了。」——不拔剑',fx:()=>{rwAtt('lie',10);const p=P_('lie');p.goal='……不知道还想要什么';rwEnd('lie','你让了他。他得到了榜首，却再也没拔过剑。');news('烈无咎不战而胜。他没有去领江湖榜首的那块匾。',1);},r:[
    ['lie','……你说什么？'],['lie','你让我？'],['','他的剑意一下子散了。'],['lie','我拿命换来的东西……你一句话就给我了？'],
    ['','他在湖心站到天黑。后来有人说，他把焚心剑谱扔进了湖里，回赤霄峰种了一片竹子。'],['','他还活着。只是再也没有拔过剑。']]}])],
 [rwC([
  {t:'出剑',fx:()=>rwFight({pid:'lie',m:1.7,boss:1,el:'huo',title:'落雁湖',win:()=>rwLieGood('你赢了。他大笑着倒在湖面上：“痛快！再来！”'),lose:()=>rwLieGood('他赢了。他没有笑，伸手把你拉了起来：“这次是我。下次是谁，不知道。”')})}])])]});
function rwLieBurn(){rwKill(P_('lie'),'烈无咎焚心剑意反噬，死于赤霄峰顶。');rwEnd('lie','他用焚心剑赢了一次。只赢了一次。');}
function rwLieGood(t){const p=P_('lie');if(p){rwAtt('lie',30);p.goal='和你并肩站在榜首';p.tal=Math.min(1,p.tal+.05);}rwEnd('lie','他没有烧掉自己。他成了你这辈子最好的对手。');news('烈无咎与'+S.name+'在落雁湖论剑三日，不分胜负。',1);
 return t+'\n\n“这个给你。赤霄宗的《天罡剑阵》，师父说，该给配得上的人。”'+(learnForm('tiangang')||'');}

/* ================= 赤阳真人 · 传剑 ================= */
R('chiyang',{t:'一盏茶',g:'茶',bg:'xianshan',need:()=>S.stage>=13||!!(S.sects.chixiao&&S.sects.chixiao.beat>=1),hint:'结丹之后，或去赤霄宗走一趟',lines:[
 ['','赤霄宗的人请你上山。说是宗主想见你，只为喝一盏茶。'],
 ['chiyang','老夫活了两百多年，见过的天才，两只手数不过来。活到最后的，一只手就数得过来。'],
 ['chiyang','无咎那孩子，你见过了吧？'],
 ['chiyang',()=>S.flags.rw_lie==='win'?'他输给你那天回来，在剑坪上站了一整夜。':S.flags.rw_lie?'他天天把你的名字挂在嘴上。':'他迟早会去找你的。那孩子见不得别人比他快。'],
 ['chiyang','你说，他缺的是什么？'],
 rwC([
  {t:'「一个对手。」',fx:()=>{S.flags.rw_cy='rival';},r:[['chiyang','对手……他眼里只有对手。也罢，那就让他有一个配得上的。'],['chiyang','老夫拜托你：别让他输得太难看，也别让他赢得太容易。']]},
  {t:'「一场大败。」',fx:()=>{S.flags.rw_cy='beat';},r:[['chiyang','哈。和老夫想的一样。可老夫舍不得。'],['chiyang','有些事，师父做不了，只能让外人来做。']]},
  {t:'「一句话——就算他不是第一，你也认他。」',fx:()=>{S.flags.rw_cy='trust';rwAtt('chiyang',15);},r:[['','老人端着茶盏，很久没有喝。'],['chiyang','老夫教了他二十年剑，从来没说过这句话。'],['chiyang','就算他永远不是第一，也是我最好的徒弟。……你若见到他，替老夫说吧。我说不出口。']]}]),
 ['chiyang','这盏茶，不白喝。'],{fn:()=>{rwAtt('chiyang',10);toast(gMat('huo',3).trim());}}]});

R('chiyang',{t:'化神劫',g:'劫',bg:'leijie',gap:2,need:()=>S.stage>=17,hint:'元婴之后',lines:[
 ['','赤霄峰上空的云，三天没有散。'],
 ['chiyang','老夫卡在元婴圆满，一百一十年了。这一劫，躲不过去了。'],
 ['chiyang','渡得过，赤霄宗还能再撑三百年。渡不过……'],
 ['chiyang',()=>{const l=P_('lie');return !l||!l.alive?'无咎不在了。赤霄宗的担子，没人接。':F('rw_lieF')?'无咎那孩子练了禁术。老夫若走了，没人拦得住他。':F('rw_lieT')?'无咎那孩子，如今能扛事了。老夫走了，也放心。':'赤霄宗，就交给无咎了。';}],
 ['chiyang','老夫想请你在峰下替我护法。劫雷之下有心魔，也有趁火打劫的人。'],
 rwC([
  {t:'「我守着。」',fx:()=>rwFight({title:'护法',bg:'jie',many:[{look:'天穹追兵',name:'趁劫而来的散修',st:S.stage+1,m:1.3},{look:'天魔影',name:'心魔',st:S.stage+2,m:1.6,boss:1,beast:1}],
    win:()=>{const p=P_('chiyang');if(p){p.st=Math.max(p.st,21);p.lifeB=(p.lifeB||0)+100;}rwAtt('chiyang',40);S.flags.rw_cyOk=1;news('赤阳真人渡过化神天劫。赤霄峰上的云散了，露出三百年没见过的晴天。',1);return '最后一道雷落下来的时候，你听见峰顶传来一声长啸。\n赤阳真人，化神了。'+gS(zsAt(maxZone(),15));},
    lose:()=>rwCyDie('你被心魔逼退了半步。就是这半步，劫雷劈穿了峰顶。')})},
  {t:'「我还有事，抱歉。」',fx:()=>{S.flags.rw_cyNo=1;},r:[['chiyang','……也是。人各有命。']]}])],
 after:()=>{if(F('rw_cyNo')&&!F('rw_cyD'))rwMsg('化神劫',rwCyDie('三日后，你听说赤霄峰的雷停了。'),1);}});
function rwCyDie(pre){S.flags.rw_cyD=1;rwKill(P_('chiyang'),'赤阳真人渡劫失败，身死道消。赤霄宗挂白三月。');rwEnd('chiyang','他没能渡过化神劫。');return pre+'\n赤阳真人没能渡过这一劫。\n赤霄宗的弟子在峰顶找到他的时候，他手里还握着那只没喝完的茶盏。';}

R('chiyang',{t:'传剑',g:'传',bg:'xianshan',gap:2,need:()=>S.stage>=17,hint:'赤阳真人渡劫之后',lines:[
 ['chiyang','老夫要闭关了。化神之后的路，得一个人走。走之前，要定下赤霄宗的下一任宗主。'],
 rwIf(()=>{const l=P_('lie');return l&&l.alive&&F('rw_lieF');},[
  ['chiyang','无咎……练了焚心剑。按门规，该废去修为，逐出山门。'],['chiyang','你是外人，也是他唯一认的对手。你说，老夫该怎么办？'],
  rwC([
   {t:'「按门规办。」',fx:()=>{const l=P_('lie');l.st=Math.max(0,l.st-5);l.sect=null;l.att=-60;l.goal='让赤霄宗后悔';seedAdd('revenge','lie',S.year+10,{why:'是你跟我师父说，按门规办的。'});rwEnd('chiyang','他按门规废了烈无咎，赤霄宗从此再无天才。');news('赤霄宗废去烈无咎修为，逐出山门。',1);},r:[['chiyang','……好。老夫亲手来。'],['','那天赤霄峰上，有人听见老人哭了。']]},
   {t:'「给他一次机会——让他当宗主。」',fx:()=>{const l=P_('lie');rwSetLead('chixiao',l);l.goal='证明师父没看错';rwAtt('lie',20);rwEnd('chiyang','他把赤霄宗交给了练过禁术的徒弟。是福是祸，再看吧。');news('赤阳真人传位烈无咎。',1);},r:[['chiyang','……你和老夫想的一样。只是老夫不敢说。']]},
   {t:'「我出灵石，请你替他洗去焚心剑意。」',need:()=>S.stones>=zsAt(maxZone(),30),fx:()=>{S.stones-=zsAt(maxZone(),30);const l=P_('lie');l.lifeB=0;l.goal='站在榜首——用自己的剑';rwAtt('lie',40);rwAtt('chiyang',20);rwSetLead('chixiao',l);rwEnd('chiyang','他耗了三十年修为，洗去徒弟的焚心剑意，把赤霄宗交给了他。');news('赤阳真人耗三十年修为，为烈无咎洗髓伐脉。',1);},r:[['chiyang','……洗髓伐脉，要老夫三十年修为。'],['chiyang','值。']]}])],
 [['chiyang',()=>{const l=P_('lie');return l&&l.alive?'无咎是我选的人。他如今，配得上这把剑了。':'无咎不在了。老夫选了一个资质平平、但从不偷懒的孩子。';}],
  {fn:()=>{const l=P_('lie');if(l&&l.alive){rwSetLead('chixiao',l);news('赤阳真人传位烈无咎。',1);}rwEnd('chiyang','他把赤霄宗传了下去。');}}]),
 ['chiyang','赤霄宗欠你一份情。从今往后，赤霄的剑，不会指向你。'],
 {fn:()=>{rwAlly('chixiao');S.books.chixiao=(S.books.chixiao||0)+1;toast('赤霄宗成为盟友 · 获得镇派剑经','big');}}]});

/* ================= 云漪 · 寻师 ================= */
R('yun',{t:'寻人启事',g:'寻',bg:'market',need:()=>S.stage>=9,hint:'筑基之后，看看坊市的告示墙',lines:[
 ['','坊市的告示墙上，有一张贴了很多年的寻人启事。纸已经黄了，又被人一层层地贴上新的。'],
 ['','「寻玄水门长老洛清霜。十余年前于东海失踪。有知其下落者，玄水门云漪必有重谢。」'],
 ['yun','……你也在看这个？'],['','一个蓝衣女子站在你身后，手里拿着一叠新印的启事。'],
 ['yun','她是我师父。我七岁那年，她把我从灵潮里抱出来。我十二岁那年，她去了东海，再也没回来。'],
 ['yun','门里的人都说她死了。门主说，不许再找。'],['yun','可她走之前跟我说过，「等师父回来」。她从来不骗我。'],
 rwC([
  {t:'「我帮你留意。」',fx:()=>{S.flags.rw_yun=1;rwAtt('yun',15);},r:[['yun','……谢谢。'],['','她把一张启事折好，塞进你手里。背面画着一枚水滴形的玉令。'],['yun','这是玄水门长老的令牌。如果你见到它——无论在谁身上——告诉我。']]},
  {t:'「这么多年了，你该放下了。」',fx:()=>{rwAtt('yun',-5);},r:[['yun','门主也这么说。'],['','她把启事贴好，抹平，转身走了。'],['','第二天你路过告示墙，那张启事上又多了一张新的。']]}])]});

R('yun',{t:'玄水令',g:'令',bg:'xuanshui',gap:1,need:()=>S.stage>=13,hint:'结丹之后',lines:[
 ['','你在废城里斩了一个幽冥殿的鬼卒。它的腰上挂着一枚水滴形的玉令。'],
 ['',()=>F('rw_yun')?'你想起了那张寻人启事。':'你觉得眼熟——是坊市告示墙上那张寻人启事背面画的东西。'],
 ['yun','这是……师父的令牌。'],['','云漪握着玉令的手在抖。'],['yun','在幽冥殿的人身上？她被幽冥殿抓了？这么多年？'],['yun','我现在就去。'],
 rwC([
  {t:'「我陪你去。」',fx:()=>rwFight({title:'幽冥外殿',bg:5,many:[{look:'幽冥护法',name:'幽冥护法',st:SECTS.youming.st,m:1.5,boss:1,demon:1},{look:'幽冥鬼卒',name:'幽冥鬼卒',st:SECTS.youming.st-3,m:1,demon:1}],
    win:()=>{rwAtt('yun',25);S.flags.rw_yunK=1;rwYunCold();return '护法倒在地上，吐出最后一句话：\n“洛清霜……在冥池……殿主不许任何人碰她……”\n云漪的脸一下子白了：“她还活着。”\n回去的路上，她咳了很久。她说是老毛病，天生经脉带寒毒，不碍事。'+gS(zsAt(maxZone(),8));},
    lose:()=>{rwAtt('yun',10);S.flags.rw_yunK=1;rwYunCold();return '你们没能闯进去。云漪替你挡了一掌。\n可她听见了——那些鬼卒说，「冥池里那个玄水门的女人」。\n“她还活着。”她咳着血说。';}})},
  {t:'「先别冲动。去问问你们门主。」',fx:()=>{S.flags.rw_yunK=1;S.flags.rw_yunTruth=1;rwAtt('yun',15);rwYunCold();},r:[
    ['','玄水门的大殿里，水月仙子看着那枚玉令，很久没有说话。'],['shuiyue','……她不是被抓走的。是她自己去的。'],['yun','什么？'],
    ['shuiyue','你生来经脉带寒毒，活不过而立之年。清霜去找能救你的东西。'],['shuiyue','幽冥殿有一门「换寿」的邪术。她去求阎九娘。之后……再也没有消息。'],
    ['shuiyue','我不许你找，是怕你知道了，会觉得是自己害了她。'],['','云漪站在原地，一句话都说不出来。']]}])]});
function rwYunCold(){const p=P_('yun');if(p&&!F('rw_yunC')){S.flags.rw_yunC=1;p.lifeB=(p.lifeB||0)+(p.age+14-pLife(p));}}

R('yun',{t:'冥池',g:'池',bg:'youming',gap:1,need:()=>F('rw_luoFree')||S.stage>=21,hint:'化神之后——或者先解开阎九娘的心结（她的寒毒等不了太久）',lines:[
 rwIf(()=>F('rw_luoFree'),[
  ['','阎九娘守了约定。冥池的门开了。'],['','一个白发的女人被人扶着走出来。她的眼睛已经看不太清了，却一下子认出了站在门口的人。'],
  ['luo','……漪儿？'],['yun','师父。'],['','云漪跪了下去。'],['luo','长这么高了。……寒毒呢？'],
  ['','洛清霜从袖子里摸出一只玉瓶，塞进她手里。'],['luo','这些年，九娘逼着我想办法给她女儿续命。续命的法子没想出来，解寒毒的，倒让我想出来了。'],['luo','服了它。你会活得比师父长。'],
  {fn:()=>rwYunCure('云漪找回了师父。寒毒已解。')}],
 [['','冥池在幽冥殿最深处。池水是黑的，冷得能冻住魂魄。'],['','池心锁着一个白发的女人。'],['yun','师父！'],
  ['yan',()=>{const y=P_('yan');return y&&y.alive?'站住。':'';}],
  rwIf(()=>{const y=P_('yan');return y&&y.alive;},[
   ['','阎九娘挡在池前。'],['yan','她欠我一样东西，还没还完。谁也带不走她。'],
   rwC([
    {t:'「那就打。」',fx:()=>rwFight({pid:'yan',m:1.7,boss:1,demon:1,noFlee:1,bg:5,title:'冥池',
      win:()=>{rwAtt('yan',-40);S.flags.rw_luoFree=1;rwYunCure('云漪从冥池里抢回了师父。寒毒已解。');return '阎九娘退开了。她没有再拦。\n“带走吧。……她答应我的东西，我也用不上了。”\n洛清霜被扶出冥池，把一只玉瓶塞进云漪手里。寒毒，解了。';},
      lose:()=>{S.flags.rw_luoDead=1;const p=P_('yun');if(p){p.lifeB=0;rwAtt('yun',30);p.goal='替师父活下去';}rwEnd('yun','云漪的寒毒解了。她的师父死在了冥池里。');news('玄水门长老洛清霜死于幽冥殿冥池。',1);
       return '你们败了。\n洛清霜在池心挣断了锁链。她用最后的力气，把一只玉瓶扔到云漪脚边。\n“漪儿……活下去。”\n冥池的水合上了。云漪抱着那只玉瓶，一直没有哭。';}})},
    {t:'「她欠你的，我替她还。」（一颗寿元丹）',need:()=>S.lifeP>0,fx:()=>{S.lifeP--;S.flags.rw_luoFree=1;rwAtt('yan',15);rwYunCure('你用一颗寿元丹，从阎九娘手里换回了洛清霜。');},r:[
      ['yan','……寿元丹。'],['','她接过去，攥在手心里，很久没有松开。'],['yan','带她走吧。'],['','洛清霜被扶出冥池，把一只玉瓶塞进云漪手里。'],['luo','漪儿。寒毒……能解了。']]}])],
  [['','冥池没有人守。幽冥殿的殿主已经不在了。'],['','你们砸开了锁链。洛清霜醒过来的第一件事，是摸索着把一只玉瓶塞进云漪手里。'],['luo','漪儿……寒毒能解了。'],{fn:()=>{S.flags.rw_luoFree=1;rwYunCure('云漪找回了师父。寒毒已解。');}}])]),
 ['',()=>F('rw_luoDead')?'':'那天回玄水门的路上，云漪一直走在她师父身边，一步都没有离开。'],
 ['yun',()=>F('rw_luoDead')?'':'{name}。玄水门欠你一个人情。不，是我欠你的。']]});
function rwYunCure(t){const p=P_('yun');if(p){p.lifeB=0;p.tal=Math.min(1,p.tal+.1);p.att=Math.min(100,p.att+40);p.goal='陪师父走完剩下的路';}rwEnd('yun',t);news('玄水门长老洛清霜重回宗门。',1);}

/* ================= 阎九娘 · 阿萤 ================= */
R('yan',{t:'收尸人',g:'冥',bg:'shelter',need:()=>S.stage>=13,hint:'结丹之后，夜里的废城',lines:[
 ['','夜里的废城，有人在收尸。'],['','黑衣的鬼卒一具一具地把尸体抬上车，没有声音。车边站着一个女人，撑着一把黑伞。'],
 ['yan','看什么？'],['','幽冥殿主，阎九娘。化神圆满，江湖上排得进前十的魔头。'],
 ['yan','你身上有丹香。寿元丹？还是别的什么延寿的东西？'],['yan','卖给我。多少灵石都行。'],
 rwC([
  {t:'「你要延谁的寿？」',fx:()=>{rwAtt('yan',10);},r:[['','她第一次正眼看你。'],['yan','你这人，问得太多了。'],['','她转身走了。第二天，你的门口多了一只匣子，里面是两株百年血参。'],{fn:()=>toast(gMat('xue',2).trim())}]},
  {t:'卖给她一颗寿元丹',need:()=>S.lifeP>0,fx:()=>{S.lifeP--;rwAtt('yan',15);S.stones+=zsAt(maxZone(),45);},r:[['yan','好。'],['','她扔给你一袋灵石，比市价多了一倍。'],['yan','以后有，都卖给我。']]},
  {t:'「魔修收尸，能有什么好事？」',fx:()=>{rwAtt('yan',-10);},r:[['yan','对。没什么好事。'],['','黑伞下的人笑了一下。车轮碾过碎石，走远了。']]}])]});

R('yan',{t:'阿萤',g:'萤',bg:'huatian',gap:1,need:()=>S.stage>=13,hint:'过些时候',lines:[
 ['','幽冥殿后山，有一片和这座魔窟格格不入的花田。'],['','一个白发的老太太蹲在田里拔草。她看见你，笑着招手。'],
 ['ying','你是来找九娘的吧？她出门了。进来喝碗水？'],['','屋里很干净。墙上挂着一张小女孩的画像。'],
 ['ying','那是我小时候。九娘画的。'],['ying','我是她女儿。没有灵根，是个凡人。今年……六十三了吧。'],
 ['ying','她总是很着急。到处找延寿的法子，到处跟人抢。我跟她说，人都会老的，不要紧。她不听。'],
 ['','门外响起脚步声。阎九娘站在门口，黑伞上落满了雨。'],['yan','……谁让你来的。'],
 rwC([
  {t:'「我什么都没看见。」',fx:()=>{rwAtt('yan',25);},r:[['','她让开了门。你走出去的时候，听见身后很轻的一句——「多谢」。']]},
  {t:'「我帮你找延寿的法子。」',fx:()=>{rwAtt('yan',20);S.flags.rw_yanH=1;},r:[['yan','你？'],['yan','我找了四十年。丹药、换寿、夺舍、玄水门的「镜中寿」……能试的都试了。'],['yan','……你要是真找得到，幽冥殿欠你一条命。']]},
  {t:'「堂堂幽冥殿主，原来有这么一个软肋。」',fx:()=>{rwAtt('yan',-50);S.stones+=zsAt(maxZone(),30);S.flags.rw_yanT=1;kar(-1);seedAdd('revenge','yan',S.year+8,{why:'你拿我女儿要挟我的那天，就该想到今天。'});},r:[['','你开了个价。她给了。'],['','她给的时候，一个字都没有说。'],['','你知道，这件事没有完。']]}])]});

R('yan',{t:'寿',g:'寿',bg:'huatian',gap:2,need:()=>S.stage>=17,hint:'元婴之后',lines:[
 ['','阎九娘派人来请你。来的鬼卒说，殿主的女儿快不行了。'],['','花田荒了。阿萤躺在床上，比上一次见时又小了一圈。'],['ying','你来啦。'],
 ['yan',()=>F('rw_yanT')?'……你也配来？是她非要见你。':'她一直说，想再见你一面。'],
 ['yan',()=>F('rw_luoFree')||F('rw_luoDead')?'':'我抓了一个玄水门的人，关了很多年，逼她给我想办法。还是没用。'],['yan','凡人的寿元，就像漏了底的碗。补不上的。'],
 rwC([
  {t:'喂阿萤服下一颗寿元丹',need:()=>S.lifeP>0,fx:()=>{S.lifeP--;rwYanSave();},r:[['','药力化开。阿萤的白发里，冒出了几根黑的。'],['ying','九娘，你看，我又能去拔草了。'],['','阎九娘转过身去。你从没见过魔头哭，也不打算告诉任何人。'],['yan',()=>F('rw_luoHeld')?'冥池里那个女人，我放了。':''],['yan','幽冥殿欠你的，记着。']]},
  {t:'把林小苗的九转金丹给她',need:()=>F('rw_jz'),fx:()=>{S.flags.rw_jz=0;rwYanSave();},r:[['','九转金丹化开的时候，屋里飘起一股草木的香。'],['','阿萤坐了起来，脸上有了血色。'],['ying','这是……谁炼的丹？好香。'],['','你说，是百草谷一个总炸炉子的小姑娘。'],['yan','……百草谷。'],['yan','幽冥殿从此不动百草谷一根草。'],['yan',()=>F('rw_luoHeld')?'冥池里那个女人，我也放了。':'']]},
  {t:'「让她走得安稳些吧。」',fx:()=>{rwYanLet();},r:[['','你坐在床边，陪阿萤说了一下午的话。说的都是花田里的事。'],['','黄昏的时候，她睡着了，没有再醒。'],['',()=>F('rw_luoHeld')?'阎九娘坐了一整夜。第二天早上，她去了冥池，砸开了锁链。':'阎九娘在床边坐了一整夜，没有说一句话。'],['yan',()=>F('rw_luoHeld')?'……抓着她，也没用了。':'']]}])]});
function rwYanHold(){S.flags.rw_luoHeld=F('rw_luoFree')||F('rw_luoDead')?0:1;if(F('rw_luoHeld'))news('幽冥殿主阎九娘放出了关押多年的玄水门长老洛清霜。',1);S.flags.rw_luoFree=F('rw_luoDead')?0:1;}
function rwYanSave(){rwAtt('yan',60);rwYanHold();rwAlly('youming');const p=P_('yan');if(p)p.goal='陪女儿多看几年花';rwEnd('yan','阿萤多活了二十年。幽冥殿从此不再收活人。');}
function rwYanLet(){rwAtt('yan',15);rwYanHold();const p=P_('yan');if(p)p.goal='守着女儿的坟';rwEnd('yan','阿萤寿终。阎九娘独自守着那片花田。');news('幽冥殿主阎九娘之女病逝。幽冥殿挂白七日。',1);}

/* ================= 林小苗 · 九转 ================= */
R('lin',{t:'采药的小丫头',g:'草',bg:'forest',need:()=>S.stage>=3,hint:'修到炼气四层，去林子边上转转',lines:[
 ['','妖林边上，有人在喊救命。'],['','一个背着药篓的小姑娘缩在树杈上，底下几只藤妖在缠树干。'],
 ['lin','那个……路过的大侠！能不能帮帮忙！我的药篓不能丢！'],
 rwC([
  {t:'出手',fx:()=>rwFight({title:'妖林',bg:2,many:[{look:'藤妖',name:'藤妖',z:Math.min(2,maxZone()),m:1,beast:1},{look:'藤妖',name:'藤妖',z:Math.min(2,maxZone()),m:1,beast:1}],
    win:()=>{rwAtt('lin',20);S.flags.rw_lin=1;return '小姑娘从树上滑下来，先把药篓检查了一遍，才想起来道谢。\n“我叫林小苗，百草谷的！以后你炼丹缺什么，来找我！”\n她硬塞给你一把刚采的灵草。'+gMat('cao',3);},
    lose:()=>{rwAtt('lin',10);return '你们俩一起被藤妖追出了三里地。\n跑到安全的地方，她喘着气笑：“你人真好。就是……有点弱。”'+gMat('cao',1);}})},
  {t:'扔块石头引开它们',fx:()=>{rwAtt('lin',8);},r:[['','藤妖朝着石头的方向爬走了。'],['lin','聪明！我叫林小苗，百草谷的。我师父总说我笨，你别学她。']]}])]});

R('lin',{t:'第七炉',g:'炉',bg:'baicao',gap:2,need:()=>S.stage>=9,hint:'筑基之后',lines:[
 ['','百草谷的人说，林小苗这个月已经炸了第七炉。'],['','你找到她的时候，她蹲在炸黑的丹炉前面，脸上全是灰。'],
 ['lin','……你来啦。'],['lin','师父说我天赋太差。说我这辈子能炼出三品丹，就算祖宗保佑。'],
 ['lin','我想炼九转金丹。百草谷开山祖师炼过一炉，之后三百年，没人成过。'],['lin','……很好笑吧。'],
 rwC([
  {t:'「不好笑。我把我的心得讲给你。」',fx:()=>{const p=P_('lin');p.tal=Math.min(1,p.tal+.15);rwAtt('lin',20);S.flags.rw_linH=1;},r:[['','你把自己炼丹的心得一条一条讲给她听。火候、时辰、药性相冲……她记了满满三本。'],['lin','原来不是我笨……是我一直在用师父的火候，炼我自己的丹。']]},
  {t:'送她一批灵草（3 株）',need:()=>(S.mats.cao||0)>=3,fx:()=>{S.mats.cao-=3;rwAtt('lin',15);S.flags.rw_linH=1;},r:[['lin','这么多！我……我会还你的！炼出来的第一炉，给你！']]},
  {t:'「也许你该换条路走。」',fx:()=>{rwAtt('lin',-10);S.flags.rw_linQ=1;P_('lin').goal='让师父看得起我';},r:[['lin','……你也这么觉得啊。'],['','她把丹炉擦干净，收进了柜子里。'],['','那天之后，百草谷的人说，林小苗再也没进过丹房。']]}])]});

R('lin',{t:'九转',g:'丹',bg:'baicao',gap:3,need:()=>S.stage>=13,hint:'结丹之后',lines:[
 rwIf(()=>F('rw_linQ'),[
  ['','你很久没有听到林小苗的消息。'],['','后来有人说，百草谷山门口多了一个守山的女弟子，剑练得不错，就是从来不笑。'],
  ['','你去看过一次。她认出了你，点了点头，没有说话。'],['','她的腰上，还挂着那只小小的药篓。'],
  {fn:()=>{const p=P_('lin');p.st=Math.min(LAST,p.st+3);p.goal='守好百草谷的山门';rwEnd('lin','她放下了丹炉，成了百草谷守山门的人。');}}],
 [['','林小苗托人带了口信：「九转金丹，开炉。想请你来护法。」'],['','丹房里摆着一只比她还高的丹炉。她瘦了，眼睛却亮。'],
  ['lin','九天九夜。第九天的时候丹劫会来——炉子扛得住，就成；扛不住……'],['lin','就再炸一次呗。'],
  rwC([
   {t:'以自身灵力替她护炉（耗去四成灵气）',fx:()=>{gQi(-.4);rwLinOk();}},
   {t:'「我信你。我就在门外。」',fx:()=>{const p=P_('lin');if((F('rw_linH')&&Math.random()<.8)||p.tal>=.75)rwLinOk();else rwLinFail();}}]),
  rwIf(()=>F('rw_jzOk'),[
   ['','第九天夜里，丹房上空落下一道金雷。'],['','炉盖飞了起来，九颗金色的丹在半空里转了三圈，落进她的手心。'],
   ['lin','……成了？'],['lin','成了！！'],['lin','这一颗给你。说好的，第一炉给你。'],['','（获得「九转金丹」。它能替一个凡人续上很长的寿命——也许有一天，你会遇见需要它的人。）']],
  [['','第九天夜里，丹炉炸了。'],['','你冲进去的时候，她坐在一地碎铜里，咳着血，手里攥着一颗半成的丹。'],['lin','差一点……就差一点。'],['lin','下次。下次一定。']])])]});
function rwLinOk(){const p=P_('lin');if(!p)return;S.flags.rw_jzOk=1;S.flags.rw_jz=1;p.st=Math.min(LAST,p.st+3);p.tal=Math.min(1,p.tal+.05);rwAtt('lin',30);p.goal='让百草谷的丹，救更多的人';rwEnd('lin','她炼成了九转金丹。三百年来，第一炉。');news('百草谷林小苗炼成九转金丹。三百年来，第一炉。',1);}
function rwLinFail(){const p=P_('lin');if(!p)return;p.tal=Math.max(.2,p.tal-.1);rwAtt('lin',10);p.goal='再炼一炉九转金丹';rwEnd('lin','九转金丹没有成。她说，下次。');}

/* ================= 花姑 · 传灯 ================= */
const rwLiu=()=>S.flags.rw_liu&&P_(S.flags.rw_liu);
R('huagu',{t:'谷主的考题',g:'谷',bg:'baicao',need:()=>S.stage>=9||!!(S.sects.baicao&&S.sects.baicao.beat>=1),hint:'筑基之后，百草谷会请你去',lines:[
 ['','百草谷的谷主是个爱笑的老太太。'],['huagu',()=>F('rw_lin')?'你就是救过小苗的那个人？那丫头回来念叨了半个月。':'你就是最近江湖上冒出来的那个？'],
 ['huagu','老婆子活了一百五十年，就剩一桩心事——找个传人。'],
 ['huagu','谷里有两个孩子。一个叫柳含烟，天资是我这辈子见过最好的，心却冷。一个叫林小苗，笨，可是肯下死功夫。'],
 ['huagu','考考你：三味药，「断肠草」「甘草」「忘忧花」。哪一味，最能毒死人？'],
 rwC([
  {t:'断肠草',r:[['huagu','错啦。断肠草名字吓人，煎透了是止痛的好药。']]},
  {t:'甘草',fx:()=>{rwAtt('huagu',20);S.flags.rw_hgOk=1;},r:[['huagu','……你倒是明白人。'],['huagu','甘草什么药都能配，什么方子都能调，人人都信它。毒，最怕的就是人人都信。']]},
  {t:'忘忧花',fx:()=>{rwAtt('huagu',8);},r:[['huagu','有点意思。忘忧花杀不死人，只会让人忘了为什么活着。……也算一种毒吧。']]}]),
 ['huagu','罢了。考题没有对错，我只是想看看你是什么样的人。'],
 {fn:()=>{if(!rwLiu()){const p=mkPerson({n:'柳含烟',sect:'baicao',st:14,age:31,tal:.75,att:0,goal:'接任谷主',ch:'p_gen3'});S.flags.rw_liu=p.id;}toast(gMat('cao',2).trim());}}]});

R('huagu',{t:'两个徒弟',g:'徒',bg:'baicao',gap:2,need:()=>S.stage>=13,hint:'结丹之后',lines:[
 ['','花姑请你喝茶。这一次，她没笑。'],
 ['huagu',()=>F('rw_jzOk')?'小苗那丫头，居然把九转金丹炼出来了。老婆子活了一百五十年，没见过这么倔的孩子。':F('rw_linQ')?'小苗不炼丹了。是我把话说重了。':'含烟上个月炼成了五品丹。小苗……还在炸炉子。'],
 ['huagu','我得定下来了。我老了，眼也花了。你替我选一个吧。'],['','门外，柳含烟端着药盘，停了一下脚步。'],
 rwC([
  {t:'「柳含烟。百草谷要的是本事。」',need:()=>{const l=rwLiu();return l&&l.alive;},fx:()=>{S.flags.rw_heir='liu';const l=rwLiu();l.att=Math.min(100,l.att+30);},r:[['huagu','……也好。也好。'],['','门外的脚步声，轻快地走远了。']]},
  {t:'「林小苗。百草谷要的是心。」',need:()=>rwP('lin').alive,fx:()=>{S.flags.rw_heir='lin';rwAtt('lin',20);const l=rwLiu();if(l)l.att-=40;},r:[['huagu','……我也是这么想的。只是需要有人替我说出来。'],['','门外的药盘，轻轻响了一声。']]},
  {t:'「阿禾。她是我看着长大的。」',need:()=>{const h=P_('he');return h&&h.alive&&h.sect==='baicao';},fx:()=>{S.flags.rw_heir='he';const l=rwLiu();if(l)l.att-=30;},r:[['huagu','那孩子啊……确实是我这辈子见过最肯吃苦的。好。'],['','门外的药盘，轻轻响了一声。']]}])]});

R('huagu',{t:'传灯',g:'灯',bg:'baicao',gap:2,need:()=>S.stage>=13,hint:'再过两年',lines:[
 rwIf(()=>S.flags.rw_heir==='liu'||!S.flags.rw_heir,[
  ['','花姑传位给柳含烟的第二年，病倒了。'],['','百草谷的人说是寿元到了。可她才一百五十出头，金丹修士少说能活五百年。'],
  ['','你去看她的时候，屋里有一股很淡的甜味。'],['huagu','……甘草。'],['','她握着你的手，笑了一下，没有再说话。'],
  rwC([
   {t:'去找柳含烟',fx:()=>rwFight({title:'百草谷',bg:2,pid:S.flags.rw_liu,m:1.6,boss:1,
     win:()=>{const l=rwLiu();if(l){l.sect=null;l.lead=0;l.att=-80;l.goal='让百草谷付出代价';seedAdd('revenge',l.id,S.year+12,{why:'百草谷是我的。你凭什么管？'});}const h=P_('huagu');rwSetLead('baicao',h);rwAtt('huagu',40);rwAlly('baicao');rwEnd('huagu','你逼柳含烟交出了解药。花姑活了下来，重新掌了百草谷。');news('百草谷柳含烟毒害谷主事败，叛出百草谷。',1);
      return '柳含烟败了。她把解药扔在地上，跑进了林子里。\n花姑醒过来的第一句话是：“……是我没教好她。”\n“百草谷的人情，老婆子记下了。”';},
     lose:()=>{rwKill(P_('huagu'),'百草谷谷主花姑「寿终」。');const l=rwLiu();if(l)l.att=-50;rwEnd('huagu','她没有等到解药。百草谷换了一个心冷的主人。');return '你败了。\n第二天，百草谷挂了白。\n柳含烟穿着素衣站在灵前，哭得比谁都伤心。';}}),r:[['','你没有说话，推门出去了。']]},
   {t:'装作什么都不知道',fx:()=>{kar(-1);rwKill(P_('huagu'),'百草谷谷主花姑「寿终」。');rwEnd('huagu','她死在了自己选的传人手里。你什么都没有说。');},r:[['','三天后，百草谷挂了白。'],['','柳含烟穿着素衣站在灵前，哭得比谁都伤心。'],['','你远远看了一眼，转身走了。']]}])],
 [['','传位大典那天，柳含烟没有来。'],['','她带着一半的长老，堵在了百草谷的山门口。'],
  ['liu','师父偏心。百草谷的规矩，强者为尊。'],['liu','{name}，这是我们谷里的事。你让开。'],
  rwC([
   {t:'「这件事，我管定了。」',fx:()=>rwFight({title:'百草谷山门',bg:2,many:[{pid:S.flags.rw_liu,m:1.6,boss:1},{look:'百草长老',name:'随她反出的长老',st:SECTS.baicao.st,m:1.1}],
     win:()=>{rwBaiHeir();rwAtt('huagu',30);const l=rwLiu();if(l){l.sect=null;l.lead=0;l.att=-70;l.goal='让百草谷付出代价';seedAdd('revenge',l.id,S.year+12,{why:'百草谷是我的。你凭什么管？'});}rwAlly('baicao');S.books.baicao=(S.books.baicao||0)+1;
      return '柳含烟败了。她看了花姑一眼，什么都没说，带着剩下的人走进了林子。\n传位大典照常进行。新谷主接过那盏青灯的时候，手在抖。\n花姑把一卷经塞给你：“《青帝长生功》。百草谷的东西，给百草谷的恩人。”';},
     lose:()=>{const l=rwLiu();rwSetLead('baicao',l);const h=P_('huagu');if(h)h.goal='看着百草谷，别走歪了';rwEnd('huagu','柳含烟夺了谷主之位。花姑退居后山，再没出来。');news('柳含烟夺百草谷谷主之位。',1);return '你败了。\n柳含烟当上了谷主。花姑搬去了后山，再没出来。\n'+(S.flags.rw_heir==='lin'?'林小苗':'阿禾')+'被赶出了百草谷。';}})},
   {t:'「让她们自己了结。」',fx:()=>{const h=S.flags.rw_heir==='he'?P_('he'):P_('lin');const l=rwLiu();if(h&&l&&(h.st>=l.st-2||Math.random()<.25)){rwBaiHeir();if(l){l.sect=null;l.lead=0;l.att=-40;}S.flags.rw_hgSelf=1;}else{rwSetLead('baicao',l);rwEnd('huagu','柳含烟夺了谷主之位。花姑退居后山。');}},r:[
     ['',()=>F('rw_hgSelf')?'那一战打了一天一夜。最后站着的，是花姑选的那个人。':'那一战没打多久。柳含烟的天资，是花姑这辈子见过最好的。'],
     ['huagu',()=>F('rw_hgSelf')?'……你没帮忙，是对的。这个位子，得她自己打下来。':'……罢了。是我老了。']]}])]),
 ]});
function rwBaiHeir(){const h=S.flags.rw_heir==='he'?P_('he'):P_('lin');if(h&&h.alive){rwSetLead('baicao',h);if(h.fr==='he')S.flags.heLead=1;h.goal='把百草谷撑起来';}const hg=P_('huagu');if(hg)hg.goal='在后山种花';rwEnd('huagu','她把那盏青灯传给了自己选的人。');news((h?h.n:'新人')+'继任百草谷谷主。花姑退居后山。',1);}

/* ================= 石铁山 · 结丹 ================= */
R('shi',{t:'铁骨',g:'骨',bg:'market',need:()=>S.stage>=9||!!(S.sects.tiegu&&S.sects.tiegu.beat>=1),hint:'筑基之后',lines:[
 ['','铁骨帮的帮主亲自来坊市找你。一个四十多岁的汉子，膀大腰圆，嗓门比铜锣还响。'],
 ['shi','你就是{name}？来，跟我打一场！'],['shi','不是寻仇。我卡在筑基圆满二十年了，想找个人，看看我到底差在哪。'],
 rwC([{t:'「请。」',fx:()=>rwFight({pid:'shi',m:1.4,boss:1,title:'铁骨',
   win:()=>{rwAtt('shi',15);return '你的剑在他胸口停住。他低头看了看，哈哈大笑。\n“看见了！我这一身铁骨，把丹田也一起箍死了！”\n他笑着笑着，忽然不笑了。\n“……横练伤寿。我这身子，最多再撑十来年。”';},
   lose:()=>{rwAtt('shi',10);return '你没能破开他的金身。\n他扶你起来，自己却叹了口气：“连你也破不开……那我自己，更破不开了。”\n“横练伤寿。我这身子，最多再撑十来年。”';}})}])],
 after:()=>{const p=P_('shi');if(p&&!F('rw_shiL')){S.flags.rw_shiL=1;p.lifeB=(p.lifeB||0)+(p.age+12-pLife(p));}}});

R('shi',{t:'地心火莲',g:'莲',bg:'pit',gap:1,need:()=>S.stage>=9,hint:'一年之后',lines:[
 ['shi','我打听到了。天坑底下长着一株地心火莲，能把箍死的丹田烧开。'],['shi','可那地方，我这身子下不去了。'],
 ['shi','……我不是来求你的，是来跟你做买卖。'],
 rwC([
  {t:'「成交。我去天坑。」',fx:()=>rwFight({title:'地心火莲',bg:5,many:[{look:'赤焰狼',name:'守莲赤焰狼',z:Math.min(maxZone(),5),m:1.2,beast:1},{look:'石魔',name:'守莲石魔',z:Math.min(maxZone(),5),m:1.5,boss:1,beast:1}],
    win:()=>{S.flags.rw_shiLian=1;rwAtt('shi',20);return '你把火莲带回来的时候，石铁山的手抖得接不住。\n“……我石铁山这辈子，没欠过谁。今天欠你了。”'+gMat('huo',2);},
    lose:()=>{return '你没能摘下火莲。\n石铁山听完，只说了一个字：“命。”';}})},
  {t:'把自己的寿元丹给他',need:()=>S.lifeP>0,fx:()=>{S.lifeP--;const p=P_('shi');p.lifeB=(p.lifeB||0)+15;S.flags.rw_shiLife=1;rwAtt('shi',25);},r:[['shi','……你这是做什么。'],['','他攥着那颗丹，眼眶红了。'],['shi','多十五年。……够我再试一次了。']]},
  {t:'「散功重修吧。慢，但稳。」',fx:()=>{S.flags.rw_shiSan=1;rwAtt('shi',5);},r:[['shi','散功？二十年的铁骨，说散就散？'],['shi','……你说得对。可我舍不得。让我想想。']]}])]});

R('shi',{t:'结丹',g:'丹',bg:'market',gap:2,need:()=>true,hint:'两年之后——别让他等太久',lines:[
 ['','铁骨帮的人说，帮主今天闭关冲击金丹。'],['','演武场上站满了人，没有一个说话。'],
 {fn:()=>{const ok=F('rw_shiLian')||(F('rw_shiLife')&&Math.random()<.7)||(F('rw_shiSan')&&Math.random()<.5);S.flags.rw_shiOk=ok?1:0;}},
 rwIf(()=>F('rw_shiOk'),[
  ['','午时，关门炸开。一道金光冲上天，把半个坊市都照亮了。'],['shi','哈哈哈哈——老子结丹了！！'],
  ['shi','{name}！铁骨帮这辈子欠你的！以后谁跟你过不去，就是跟我石铁山过不去！'],
  {fn:()=>{const p=P_('shi');p.st=Math.max(p.st,13);p.lifeB=0;rwAtt('shi',50);p.goal='看看金丹之上是什么';rwAlly('tiegu');rwEnd('shi','他在寿元耗尽之前结了丹。铁骨帮成了你的盟友。');news('铁骨帮帮主石铁山结丹成功。坊市放了一夜的炮仗。',1);toast('铁骨帮成为盟友'+(learnForm('jingang')||''),'big');}}],
 [['','黄昏的时候，关门开了。走出来的是他的儿子，石小虎。'],['','他手里捧着一把卷了刃的刀。'],
  ['','“我爹说，这把刀给你。他说你是唯一一个认真跟他打过的人。”'],
  {fn:()=>{rwKill(P_('shi'),'铁骨帮帮主石铁山冲击金丹失败，坐化于关中。');const k=mkPerson({n:'石小虎',sect:'tiegu',st:9,age:22,tal:.55,att:30,goal:'把铁骨帮撑下去',ch:'p_gen4'});rwSetLead('tiegu',k);rwEnd('shi','他没能结丹。他把刀留给了你。');toast(gItemNamed('w',3,'铁山刀',maxZone()).trim(),'big');}}])]});

/* ================= 水月仙子 · 水镜 ================= */
R('shuiyue',{t:'水镜',g:'镜',bg:'xuanshui',need:()=>S.stage>=17||!!(S.sects.xuanshui&&S.sects.xuanshui.beat>=1),hint:'元婴之后',lines:[
 ['','玄水门的大殿里没有灯。正中一面水镜悬在半空，映着月亮。'],['shuiyue','你来了。'],
 ['','水月仙子背对着你。她的头发是白的，声音却像少女。'],
 ['shuiyue','这面镜子，能照见人心里最怕的东西。三百年来，看过它的人，有一半疯了。'],['shuiyue','你要看吗？'],
 rwC([
  {t:'看',fx:()=>{gQi(.6);rwAtt('shuiyue',15);},r:[['','你看见了。'],
    ['',()=>S.path==='mo'?'镜子里是你自己，站在一片尸山上，正在吞下最后一个人的修为。你在笑。':S.path==='yin'?'镜子里是一座空山。你坐在山顶，所有认识的人都老死了，只剩你。':S.path==='zong'?'镜子里是一座宗门，弟子三千。可匾额上的名字，不是你取的。':'镜子里是青石站。站台空了，铁轨上长满了草。你回来得太晚了。'],
    ['','你退了一步。镜面平静下来。'],['shuiyue','你没有疯。很好。看过了，才知道该往哪边走。']]},
  {t:'不看',fx:()=>{rwAtt('shuiyue',5);},r:[['shuiyue','聪明人。也是胆小的人。'],['shuiyue','……这两样，在江湖上都能活得长。']]}])]});

R('shuiyue',{t:'镜中人',g:'忆',bg:'xuanshui',gap:2,need:()=>S.stage>=21&&S.seen.includes('fallen'),hint:'化神之后，且已知晓堕仙往事',lines:[
 ['','水月仙子的信只有一句：「把你怀里的玉简，带来。」'],
 ['shuiyue','三百年了。我听得出他的声音。'],['shuiyue','墨师兄。你还要躲多久？'],['mo','……小师妹。'],
 ['','大殿里很久没有声音。'],
 ['shuiyue','当年太一观的事，我都知道。大师兄成了堕仙，你成了一块玉。只剩我，活到了今天。'],
 ['shuiyue','我参了三百年水镜，就想看明白一件事——那天，灵源里到底发生了什么。'],['mo','……是我拉着师兄进去的。错的是我。'],
 rwC([
  {t:'「墨老，说完吧。三百年了。」',fx:()=>{rwAtt('shuiyue',35);S.flags.rw_syMo=1;},r:[
    ['mo','……师兄想把灵源的灵气分给天下人。我想关上它。'],['mo','我们在灵源里争执的时候，它裂开了。'],
    ['mo','师兄最后用自己的身子堵住了裂口。他说的最后一句话是——'],['mo','「关上它」。'],
    ['','水镜里，落下了一滴水。'],['shuiyue','原来是这样。……我恨了你三百年。'],
    ['shuiyue','这卷经，本该传给你们两个的。拿去吧。'],{fn:()=>{S.books.xuanshuij=(S.books.xuanshuij||0)+1;toast('获得《玄冥真水经》（在「囊」里研读）','big');}}]},
  {t:'「墨老不想说，就别逼他。」',fx:()=>{rwAtt('shuiyue',10);},r:[['shuiyue','……你护着他。'],['shuiyue','也好。三百年都等了，不差这几年。'],{fn:()=>toast(gMat('ru',1).trim())}]}])]});

R('shuiyue',{t:'破镜',g:'破',bg:'xianshan',gap:3,need:()=>S.stage>=25,hint:'炼虚之后',lines:[
 ['','东海的灵源裂隙又开了。一夜之间，三座城没了声音。'],
 ['shuiyue','水镜能封住它。镜碎，人也碎。'],['shuiyue','我活够了。三百四十年，等的就是这一天。'],
 rwC([
  {t:'「我替你去。」',fx:()=>rwFight({title:'东海裂隙',bg:6,many:[{look:'灵潮化身',name:'裂隙里爬出的东西',z:Math.min(maxZone(),6),m:1.6,boss:1,beast:1},{look:'虚空蝠鲼',name:'虚空蝠鲼',z:Math.min(maxZone(),6),m:1.1,beast:1}],
    win:()=>{rwAtt('shuiyue',50);rwEnd('shuiyue','你替她封住了裂隙。她还活着，继续参她的水镜。');news(S.name+'独入东海裂隙，以一己之力将其封住。',1);kar(2);return '裂隙合上的时候，海面平得像一面镜子。\n水月仙子站在岸边，看了你很久。\n“……墨师兄挑的人，没有错。”\n她把一片碎镜放进你手里。'+gItemNamed('j',3,'水镜残片',maxZone());},
    lose:()=>{rwSyDie();return '你没能撑住。\n最后是水月仙子推开了你。镜子碎成了千万片，裂隙合上了。\n她留下的最后一句话是：“替我告诉墨师兄——这一次，是我关上的。”';}})},
  {t:'「……去吧。」',fx:()=>{rwSyDie();},r:[['','那天夜里，东海上空亮起了一轮比月亮还大的镜子。'],['','镜子碎的时候，像下了一场银色的雨。'],['mo','……小师妹。'],['','裂隙合上了。玄水门的大殿里，只剩一个空空的镜架。']]},
  {t:'拦住她',fx:()=>{rwAtt('shuiyue',-10);kar(-1);news('东海灵源裂隙扩大，沿岸又有两座城空了。',1);rwEnd('shuiyue','你拦住了她。她活着，东海又死了两座城。');},r:[['shuiyue','……你以为你在救我？'],['','她没有再说话。那一年，东海沿岸又空了两座城。']]}])]});
function rwSyDie(){rwKill(P_('shuiyue'),'玄水门主水月仙子以水镜封住东海灵源裂隙，镜碎人亡。');rwEnd('shuiyue','她用水镜封住了东海的裂隙。镜碎，人亡。');kar(1);}

/* ================= 顾长风 · 遗愿 ================= */
R('gu',{t:'会首',g:'穹',bg:'tianting',need:()=>S.stage>=17,hint:'元婴之后',lines:[
 ['','你回到住处的时候，屋里已经坐着一个人。'],['','灰白长衫，紫色的眼睛。天穹会首，顾长风。合体境，江湖榜上数一数二的人物。'],
 ['gu','别紧张。我只是来说几句话。'],['gu','灵潮来了几十年，死了多少人？可活下来的人里，能修仙的，不到万分之一。'],
 ['gu','剩下的，只能等死，或者等着被修士保护。'],['gu','天穹会要做的，是让每一个凡人都能吸一口灵气。'],
 ['gu','这是我师祖——你们叫他堕仙——没做完的事。来天穹会吧。你会是我的左右手。'],
 rwC([
  {t:'「为此，你们封了多少城？」',fx:()=>{rwAtt('gu',5);S.flags.rw_guQ=1;},r:[['gu','……三座。我不否认。清理灵脉，要死人。'],['gu','可如果不清，死的会是三十座。'],['','他站起来，推门出去。'],['gu','你会明白的。']]},
  {t:'「我考虑一下。」',fx:()=>{rwAtt('gu',15);S.rep.tq+=1;},r:[['gu','很好。我等你。']]},
  {t:'「滚。」',fx:()=>{rwAtt('gu',-15);S.rep.tq-=1;},r:[['gu','……年轻人。'],['','他走了。桌上留下一只茶盏，杯底刻着天穹会的纹章。']]}])]});

R('gu',{t:'白石城',g:'城',bg:'shelter',gap:2,need:()=>S.stage>=21,hint:'化神之后',lines:[
 ['','东边的白石城被天穹会封了。城外站着一排灰衣修士，城里的人出不来。'],
 ['','你看见一个老人趴在结界上，拍着透明的墙，嘴一张一合，听不见声音。'],
 ['gu','你来了。'],['gu','这座城底下有一条灵脉，三天之后会炸。炸了，方圆百里寸草不生。'],
 ['gu','我们要把灵脉抽干。抽的时候……城里的人，会跟着一起干掉。'],['gu','十万人，换方圆百里一百万人。你说，该不该？'],
 rwC([
  {t:'「把人先放出来。」',fx:()=>rwFight({title:'白石城',bg:'market',foes:()=>[sectFoe('tianqiong',1),sectFoe('tianqiong',0)],
    win:()=>{rwAtt('gu',-10);kar(2);S.flags.rw_guSave=1;news(S.name+'破开天穹会的结界，放出了白石城十万人。',1);return '结界碎了。人群像潮水一样涌出来。\n顾长风站在远处看着，没有出手。\n三天后，灵脉炸了。白石城没了——但城里的人，一个都没少。\n他托人带来一句话：“……是我想错了。”';},
    lose:()=>{kar(-1);news('白石城被天穹会抽干，十万人没有出来。',1);return '你没能破开结界。\n三天后，白石城的灯，一盏一盏地灭了。';}})},
  {t:'「你说得对。」',fx:()=>{rwAtt('gu',25);kar(-2);news('白石城被天穹会抽干。方圆百里的灵脉稳住了。',1);},r:[['gu','……谢谢。'],['','那天你没有走。你站在结界外，看着城里的灯一盏一盏灭掉。'],['gu','我每一次都看完。这是我欠他们的。']]},
  {t:'「你师祖，真的想要这样？」',fx:()=>{S.flags.rw_guDoubt=1;rwAtt('gu',10);const p=P_('gu');p.st=Math.max(0,p.st-1);kar(1);news('天穹会首顾长风独自压下白石城灵脉，修为大损。',1);},r:[
    ['','他第一次没有马上回答。'],['gu','我没见过师祖。我只见过他留下的东西。'],['gu','……把人放了。我再想想别的法子。'],
    ['','结界撤了。顾长风一个人留在城里，三天三夜，用自己的修为把那条灵脉一寸一寸地压回了地底。']]}])]});

R('gu',{t:'遗愿',g:'愿',bg:'pit',gap:3,need:()=>S.stage>=25&&S.seen.includes('fallen'),hint:'炼虚之后，且已知晓堕仙往事',lines:[
 ['','顾长风约你去天坑。堕仙倒下的地方。'],['gu','我在这里守了七十年，等的就是师祖的遗愿。'],
 ['gu','分灵气给天下人。天穹会三百年，就为了这一句话。'],['mo','……孩子。'],['','玉简亮了。顾长风猛地抬头。'],
 ['mo','我是你师祖的师弟。'],['mo','他最后想做的，不是「分」，是「关」。他用身子堵住了灵源。'],
 ['mo','他倒下的时候，说的是「灵源……关不上了」。他是在后悔。'],
 ['gu','……不可能。'],['gu','天穹会三百年……白石城……那些城……'],
 rwC([
  {t:'「错的不是你，是传话的人。现在改，还来得及。」',need:()=>F('rw_guDoubt')||F('rw_guSave')||rwP('gu').att>=10,fx:()=>rwGuTurn(),r:[
    ['','顾长风跪在天坑边上，很久很久。'],['gu','……天穹会，从今天起不清理灵脉了。'],['gu','我们去关灵源。用三百年的人，还三百年的债。'],['gu','到时候，你来不来？']]},
  {t:'「你不信，那就打一场。」',fx:()=>rwFight({title:'天坑',bg:5,noFlee:1,pid:'gu',m:1.8,boss:1,el:'lei',p2:1,n2:'顾长风·雷霆真身',
    win:()=>{rwGuTurn();return '他倒在天坑边上，看着天，笑了。\n“……原来输是这种感觉。”\n“好。我信你一次。天穹会，不清理灵脉了。”';},
    lose:()=>{rwAtt('gu',-10);rwEnd('gu','顾长风没有回头。天穹会还在清理灵脉。');return '你败了。\n顾长风收了手，背对着你站了很久。\n“……我会自己去查。如果你说的是假的，下次见面，我不会留手。”';}})}])]});
function rwGuTurn(){const p=P_('gu');if(p){p.goal='关上灵源';rwAtt('gu',50);}rwAlly('tianqiong');S.rep.tq+=3;rwEnd('gu','他知道了师祖真正的遗愿。天穹会不再清理灵脉，转而去关灵源。');news('天穹会首顾长风宣布：天穹会停止清理灵脉。',1);const t=xfGet('sects');if(t)toast(t.trim(),'big');}

/* ================= 莫问 · 故乡 ================= */
R('mowen',{t:'卖图的老人',g:'图',bg:'market',need:()=>S.stage>=3,hint:'修到炼气四层，去坊市逛逛',lines:[
 ['','坊市的角落里，一个老散修在卖地图。图画得很细，连哪栋楼塌了几层都标着。'],
 ['mowen','后生，买张图吧。旧城的、港口的、妖林的，都是我一步一步走出来的。'],
 ['','他的摊子上，有一张图是不卖的。画的是一座临江的小镇，镇口有一座钟楼。'],
 ['mowen','那张啊……那是临江镇。我老家。'],['mowen','灵潮那年，海涨了十米。镇子沉了。我跑出来了，我娘没有。'],
 ['mowen','我这把年纪，炼气八层，到头了。就想死前，再看一眼那座钟楼。'],['mowen','可港口那片雾……我这点修为，进去就出不来了。'],
 rwC([
  {t:'买一张港口的图',need:()=>S.stones>=zsAt(maxZone(),1),fx:()=>{S.stones-=zsAt(maxZone(),1);rwAtt('mowen',10);},r:[['mowen','好，好。这张图你收好。上面那个红圈，就是临江镇。']]},
  {t:'「等我能去港口了，带你去。」',fx:()=>{rwAtt('mowen',20);S.flags.rw_mwP=1;},r:[['mowen','……'],['mowen','后生，你可别骗老头子。我等不了太久的。']]},
  {t:'听他讲讲临江镇',fx:()=>{rwAtt('mowen',12);},r:[['','他讲了一下午。讲镇上的米糕，讲钟楼每天敲几下，讲他娘在江边洗衣服的样子。'],['','你走的时候，天已经黑了。他还坐在摊子后面，看着那张不卖的图。']]}])]});

R('mowen',{t:'临江镇',g:'钟',bg:'linjiang',gap:1,need:()=>maxZone()>=3,hint:'能去沉没港口之后',lines:[
 ['mowen',()=>F('rw_mwP')?'你还记得！你真的还记得！':'后生……听说你能去港口了？'],['mowen','带我去吧。就看一眼。'],
 rwC([
  {t:'带他去',fx:()=>rwFight({title:'雾海',bg:3,many:[{look:'雾鲨',name:'雾鲨',z:3,m:1.1,beast:1},{look:'溺魂',name:'溺魂',z:3,m:1.1,beast:1}],
    win:()=>{rwAtt('mowen',40);S.flags.rw_mwSee=1;P_('mowen').goal='已经看过故乡了';return '雾散的时候，你们看见了它。\n钟楼的顶露在海面上，铜钟还挂着，长满了青苔。\n莫问在船头跪下来，对着钟楼磕了三个头。\n“娘。我回来了。”';},
    lose:()=>{rwAtt('mowen',15);const p=P_('mowen');p.lifeB=(p.lifeB||0)-5;return '雾里的东西太多了。你护着他退了出来。\n莫问受了伤，却一直在笑：“我看见了……我看见钟楼的影子了。够了，够了。”';}})},
  {t:'替他去看，画下来',fx:()=>{rwAtt('mowen',25);S.flags.rw_mwDraw=1;P_('mowen').goal='已经看过故乡了';},r:[
    ['','你一个人穿过雾海，找到了那座钟楼，在船上画了一整天。'],
    ['','你把画交给他。他捧着看了很久，用袖子擦了一遍又一遍——画上没有灰，他擦的是自己的眼睛。'],['mowen','钟楼……还在啊。']]}])]});

R('mowen',{t:'归处',g:'归',bg:'linjiang',gap:3,need:()=>true,hint:'几年之后',lines:[
 ['','莫问托人带信，说他快走了。'],['','他躺在坊市后面那间漏雨的屋子里，瘦得只剩一把骨头。'],
 ['mowen',()=>F('rw_mwSee')||F('rw_mwDraw')?'后生，这辈子最后一件心事，是你替我了的。':'后生……临江镇，我还是没能回去。'],
 ['mowen','我这一辈子，攒下的就是这些图。最底下那张……是我在废城里捡的，看不懂。也许你看得懂。'],
 rwC([
  {t:'「我把你葬在临江镇。」',fx:()=>{rwMwDie('你把他的骨灰撒在了临江镇的钟楼底下。');},r:[['','你把他的骨灰撒在了钟楼底下。'],['','那天海上没有雾。风一吹，那口长满青苔的铜钟，响了一声。']]},
  {t:'「葬在坊市吧。你的摊子在这里。」',fx:()=>{rwMwDie('你把他葬在了坊市后山，坟前插着一张地图。');},r:[['','你把他葬在了坊市后山。坟前插着一张地图。'],['','后来坊市里多了一个卖图的年轻人，说是他的徒弟。没人知道真假。']]}]),
 {fn:()=>{const t=xfGet('cave');toast((t||gS(zsAt(maxZone(),10))).trim(),'big');}}]});
function rwMwDie(t){rwKill(P_('mowen'),'散修莫问坐化，享年'+rwP('mowen').age+'岁。');rwEnd('mowen',t);}
