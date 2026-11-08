/* ================= 宿敌 · 萧尘：拿走另外半块玉简的人 =================
   他永远比你快半步。他那半块玉里住着堕仙残存的意志，一步步推着他走。
   七段主线：另一半 → 慢了半步 → 拍卖行 → 灵童 → 落雁湖 → 心魔 → 拼合。你打赢他、帮他、还是放他坠落，结局都不一样。 */
const XIAO='xiao';
const xP=()=>P_(XIAO);
function xEnsure(){if(!S.ppl||xP())return;S.ppl.push({id:XIAO,n:'萧尘',ch:'p_xiao',age:S.age||18,st:Math.max(0,(S.stage||0)+1),tal:.9,goal:'把两半玉简拼成一块',att:-5,known:true,alive:true,lifeK:1});pplLooks();}
const _xPI=pplInit;pplInit=function(){const r=_xPI.apply(this,arguments);try{xEnsure();}catch(e){}return r;};
/* 每年：他追着你走，永远快半步；被你打败后会落后几年，然后又追上来 */
function xYear(){const p=xP();if(!p||!p.alive)return;const down=(S.flags.xiaoDown||0)>S.year;let tg=S.stage+(F('xiaoFree')?-2:down?-1:1);tg=Math.max(0,Math.min(LAST,tg));
 if(p.st<tg){const o=p.st;p.st++;if(STAGES[p.st].r>STAGES[o].r&&p.st>S.stage)news('萧尘突破至'+REALMS[STAGES[p.st].r]+'——又比你快了半步。',1);}
 if(p.st>tg+1)p.st=tg+1;p.age=Math.max(p.age,S.age);}
const _xOY=oneYear;oneYear=function(){const r=_xOY.apply(this,arguments);try{xYear();}catch(e){console.error(e);}return r;};
const xDown=n=>{S.flags.xiaoDown=S.year+(n||3);const p=xP();if(p)p.st=Math.max(0,Math.min(p.st,S.stage-1));};
/* 大比：天穹会若有他，就由他出战 */
const _xDC=dbChamp;dbChamp=function(t){const p=xP();if(t==='tianqiong'&&p&&p.alive&&p.sect==='tianqiong'&&!(smOn()&&S.sm.k==='tianqiong'))return {n:p.n,st:p.st,pid:p.id};return _xDC.apply(this,arguments);};
const _xDA=dbAfter;dbAfter=function(opp,win,rn){const c=dbChamp(opp);if(c&&c.pid===XIAO){S.flags.xiaoDb=win?'win':'lose';if(win)xDown(3);}return _xDA.apply(this,arguments);};
/* 玉简合一之后的永久加成 */
const _xBF=buildFx;buildFx=function(){const A=_xBF.apply(this,arguments);if(F('jadeWhole')){A.atkP=(A.atkP||0)+.1;A.hpP=(A.hpP||0)+.1;A.critA=(A.critA||0)+.03;}return A;};

const RV_IDS=[];
function RV(o){const prev=RV_IDS[RV_IDS.length-1],id='rv'+(RV_IDS.length+1);RV_IDS.push(id);
 STORY.push({id,title:'宿敌·'+o.t,g:o.g,bg:o.bg||'metro',hint:o.hint,lines:o.lines,
  cond:()=>{const p=xP();return !!p&&(!prev||S.seen.includes(prev))&&S.year>=(S.flags.rvY||0)+(prev?1:0)&&(o.dead||p.alive)&&o.need();},
  after:()=>{S.flags.rvY=S.year;try{o.after&&o.after();}catch(e){console.error(e);}save();rwFlush(0);}});}
const xFight=(o)=>rwFight(Object.assign({pid:XIAO,el:'lei',title:'萧尘'},o));

RV({t:'另一半',g:'玉',bg:'metro',need:()=>S.stage>=1&&S.seen.includes('prologue'),hint:'修到炼气二层',lines:[
 {fn:()=>xEnsure()},
 ['','你又一次去了B出口。'],
 ['','碎水泥上坐着一个少年，和你差不多大，穿着别的避难所的灰制服。他手里把玩着一块青色的玉——断口，和你怀里那块严丝合缝。'],
 ['xiao','你就是捡走另一半的人？'],['xiao','我叫萧尘，东郊避难所的。我们是同一天、同一个地方，摸到这块玉的。'],
 ['xiao','我这一半也会说话。它说——只有拼成一整块的人，才能活到最后。'],
 ['mo','……这个气息……'],['mo','不可能。'],['','玉简在你怀里抖得厉害。墨老没有再说话。'],
 ['xiao','所以，我们迟早有一个人要把另一半拿走。'],
 rwC([
  {t:'「玉是我捡的。你想要，就来拿。」',fx:()=>{S.flags.xiao1='fight';xFight({m:1.2,title:'另一半',win:()=>{rwAtt(XIAO,-5);xDown(2);return '萧尘倒在碎水泥上，捂着肚子笑了。\n“行。你比我想的硬。”\n“下次，我会快你一步。”';},lose:()=>{rwAtt(XIAO,-3);const s=Math.min(S.stones,Math.ceil(S.stones*.3));S.stones-=s;return '你没打过他。\n他没拿你的玉，只拿走了你身上三成的灵石。\n“玉先寄在你那儿。等它值钱了，我再来取。”';}});},r:[['xiao','好。']]},
  {t:'「这世道，一起修不好吗？」',fx:()=>{S.flags.xiao1='friend';rwAtt(XIAO,12);},r:[['xiao','一起？'],['','他看了你很久，笑了一下，把玉收回怀里。'],['xiao','这世道没有「一起」这回事。……不过，我记住你了。']]},
  {t:'不理他，转身就走',fx:()=>{S.flags.xiao1='ignore';},r:[['xiao','你走吧。'],['xiao','你走得再远，玉也会把我们拉回同一个地方。']]}])]});

RV({t:'慢了半步',g:'步',bg:'overpass',need:()=>S.visited.includes(1)||S.stage>=8,hint:'去锈蚀高架',lines:[
 ['','高架断口边上，长着一棵结灵果的树。'],['','树已经被摘空了。树干上，有人用剑刻了一行字：'],['','「慢了半步。——萧」'],
 ['mo','那小子的修为，又比你高了一层。'],['mo','他那半块玉里的东西在推着他走。走得太快了。'],
 ['','树根底下，掉着一枚刻着星纹的令牌。是天穹会的。'],
 rwC([
  {t:'「那就追。」',fx:()=>{S.qiPills+=2;S.flags.xiao2='chase';},r:[['','你把那行字看了三遍，转身下了高架。'],['','（获得聚气丹 ×2。从今天起，你修炼的时候会想起这行字。）']]},
  {t:'「快，不一定是好事。」',fx:()=>{kar(1);S.flags.xiao2='calm';},r:[['mo','……说得对。走得快的人，常常走错路。'],['mo','老夫当年，就是走得太快了。']]}])]});

RV({t:'拍卖行',g:'拍',bg:'auction',need:()=>S.stage>=9,hint:'筑基之后',lines:[
 ['','坊市拍卖行。今天压轴的东西，是一截发黑的骨头。'],['','拍卖师说，那是三百年前一位仙人的剑骨。从天坑底下挖出来的。'],
 ['','你怀里的玉简发烫。你抬头，看见对面包厢里的萧尘——他的玉也在发光。'],
 ['xiao','这个，我要了。'],
 rwC([
  {t:'加价，抢下来',need:()=>S.stones>=zsAt(maxZone(),15),fx:()=>{S.stones-=zsAt(maxZone(),15);rwAtt(XIAO,-10);S.flags.xiao3='buy';toast(gItemNamed('w',3,'堕仙剑骨',maxZone()).trim(),'big');},r:[['','拍卖师落槌的时候，萧尘没有看你。'],['','可你听见他包厢里，传出一声玉碎般的轻响。'],['mo','这是……师兄的骨头。']]},
  {t:'让给他',fx:()=>{rwAtt(XIAO,6);S.flags.xiao3='give';const p=xP();if(p)p.st=Math.min(LAST,p.st+1);},r:[['','你放下了牌子。'],['','散场的时候，萧尘在门口等你。'],['xiao','……为什么不抢？'],['xiao','算了。这次，我欠你一回。']]},
  {t:'当众拆穿：他出的是天穹会的灵石',fx:()=>{rwAtt(XIAO,-15);S.rep.tq-=1;S.flags.xiao3='expose';news('拍卖行上，萧尘被当众揭出身后是天穹会。',1);},r:[['','满场哗然。拍卖师撤下了剑骨。'],['','萧尘站在包厢里，脸色白得像纸。'],['xiao','……你会后悔的。']]}])]});

RV({t:'灵童',g:'童',bg:'sky',need:()=>S.stage>=13,hint:'结成金丹',lines:[
 ['','萧尘换了一身天穹会的白袍。袖口上，绣着三颗星。'],['xiao','天穹会的会主收我做了亲传。我只用了三年。'],
 ['','他的玉简在发光。光里，有一个不属于他的声音。'],['sx','……墨……师弟……'],
 ['mo','……师兄。'],['','你从来没听过墨老的声音这样抖。'],
 ['xiao','你听见了吧？它是你们说的那个「堕仙」。它没死干净，它在我这一半里。'],
 ['xiao','它说，三百年前它想把灵源打开，分给天下人。只差一步。'],['xiao','来天穹会吧。两块玉拼在一起，这一步，我们替它走完。'],
 rwC([
  {t:'「你是在替它走，还是替你自己？」',fx:()=>{S.flags.xiaoDoubt=1;rwAtt(XIAO,8);},r:[['xiao','……'],['','他第一次没有马上回答。'],['xiao','有区别吗？'],['','他走了。可你看见他握着玉简的手，指节发白。']]},
  {t:'「打开灵源？那是让天下人去死。」',fx:()=>{S.flags.xiao4='fight';xFight({m:1.5,boss:1,title:'灵童',win:()=>{rwAtt(XIAO,-5);xDown(3);return '你赢了。\n萧尘半跪在地上，玉简里的声音在尖叫。\n“……你懂什么。你那一半，从来没跟你说过实话。”';},lose:()=>{return '他赢了。\n他没有拿你的玉。\n“你看，你还是慢半步。”';}});},r:[['xiao','那就打一场。']]}]),
 {fn:()=>{const p=xP();if(p){p.sect='tianqiong';p.goal='替堕仙打开灵源';}}}]});

RV({t:'落雁湖',g:'湖',bg:'leitai',need:()=>S.stage>=17||!!(S.db&&S.db.hist&&S.db.hist.length),hint:'元婴之后，或打过一届宗门大比',lines:[
 ['',()=>S.flags.xiaoDb==='win'?'大比的擂台上，你赢了萧尘。那是他第一次输给你。':S.flags.xiaoDb==='lose'?'大比的擂台上，萧尘赢了你。他没有笑。':'落雁湖边，你又遇见了萧尘。'],
 ['xiao',()=>S.flags.xiaoDb==='win'?'……原来输是这个感觉。':S.flags.xiaoDb==='lose'?'我赢了。可它不满意。它说我应该杀了你。':'你最近，追得很紧。'],
 ['xiao','你知道吗，它每天夜里都在跟我说话。越来越响。'],['xiao','有时候我分不清，那些念头是它的，还是我的。'],
 rwC([
  {t:'陪他坐一会儿',fx:()=>{S.flags.xiaoTrust=1;rwAtt(XIAO,15);},r:[['','你们在湖边坐到了天亮。谁都没说话。'],['','走的时候，他背对着你说：“如果有一天我变成了它——你记得把我那一半拿走。”']]},
  {t:'「把那半块扔了。」',fx:()=>{rwAtt(XIAO,-5);},r:[['xiao','扔了？'],['xiao','扔了它，我就什么都不是了。我就是东郊那个……谁都不记得的人。'],['','他走了。']]}])]});

RV({t:'心魔',g:'魔',bg:'pit',need:()=>S.stage>=21&&S.seen.includes('fallen'),hint:'化神之后，且已知晓堕仙往事',lines:[
 {fn:()=>cgShow('xiaochen')},['','半夜，有人撞开了你的门。'],['','是萧尘。他满身是血，一只眼睛已经变成了暗红色。'],
 ['sx','……墨师弟……把你那一半……给我……'],['xiao','别……别听它的……'],['xiao','救我。或者……杀了我。'],
 rwC([
  {t:'「把你那半块给我。」',need:()=>F('xiaoTrust')||rwP(XIAO).att>=20,fx:()=>{S.flags.xiaoFree=1;const p=xP();if(p){p.st=Math.max(0,p.st-5);p.goal='做回自己';p.att=Math.min(100,p.att+40);p.sect=null;}news('萧尘交出了他的半块玉简，修为大跌。',1);},r:[
    ['','他的手抖了很久，最后还是把那半块玉，放进了你的掌心。'],['','两块玉碰在一起的那一瞬，亮了一下，又暗了下去。'],
    ['mo','……师兄。'],['sx','……师弟……对不起……'],['','那声音散了。'],['','萧尘昏了过去。他醒来的时候，修为跌了两个大境界，可两只眼睛，都是黑的了。']]},
  {t:'「我帮你把它压下去。」',fx:()=>{S.flags.xiao6='fight';rwFight({title:'心魔',bg:5,noFlee:1,many:[{pid:XIAO,look:'堕仙残躯',name:'萧尘·堕仙之影',m:1.8,boss:1,el:'huo'}],
    win:()=>{S.flags.xiaoSaved=1;const p=xP();if(p){p.att=Math.min(100,p.att+40);p.goal='跟你一起关上灵源';}news('萧尘压下了玉简里的堕仙残念。',1);return '你一掌拍在他胸口的玉上。\n红光散了。萧尘跪在地上，大口喘气。\n“……谢谢。”\n“你又快了我半步。”';},
    lose:()=>{S.flags.xiaoLost=1;rwAtt(XIAO,-40);const p=xP();if(p)p.goal='打开灵源';news('萧尘被堕仙残念吞没，下落不明。',1);return '你没能压住它。\n萧尘最后看了你一眼——那已经不是他的眼睛了。\n他消失在了夜里。';}});},r:[['','你按住他的肩膀。']]},
  {t:'「这是你自己选的路。」',fx:()=>{S.flags.xiaoLost=1;rwAtt(XIAO,-40);const p=xP();if(p)p.goal='打开灵源';news('萧尘被堕仙残念吞没，下落不明。',1);},r:[['','你没有动。'],['','他看着你，慢慢地笑了。笑着笑着，那笑就不是他的了。'],['','他转身走进了夜里。']]}])]});

RV({t:'拼合',g:'合',bg:'core',dead:1,need:()=>S.seen.includes('finale'),hint:'走完主线终章',lines:[
 rwIf(()=>F('xiaoLost'),[
  ['','灵源的入口，站着一个人。'],['','他穿着萧尘的白袍，长着萧尘的脸。可说话的，是三百年前的那个人。'],
  ['sx','师弟。把另一半给我。这一次，我们把门开到底。'],['mo','……师兄。你已经死了。'],
  rwC([{t:'拔剑',fx:()=>rwFight({title:'拼合',bg:6,noFlee:1,many:[{pid:XIAO,look:'堕仙残躯',name:'堕仙·萧尘',m:2.1,boss:1,el:'huo',p2:1,n2:'堕仙真身'}],
    win:()=>{cgShow('yujian');S.flags.jadeWhole=1;S.flags.xiaoEnd='freed';const p=xP();if(p){p.alive=false;p.dy=S.year;}news('萧尘死于灵源入口。两半玉简，合为一块。',1);return '最后一剑落下的时候，红光从他身上褪了下去。\n萧尘睁开眼睛——是他自己的眼睛。\n“……这次，是你快了半步。”\n他把半块玉放进你手里，没有再说话。\n两块玉合在一起，亮了很久很久。\n（玉简合一：攻击 +10%，生命 +10%，暴击 +3%）';},
    lose:()=>{S.flags.xiaoEnd='lost';return '你倒下了。\n他没有拿走你的玉。\n“还差一点。”那个声音说，“下一次，你会自己交给我的。”';}})}])],
 [['','灵源前，萧尘在等你。'],['xiao',()=>F('xiaoFree')?'我没了修为，可我还是来了。门口总得有个人帮你看着。':'我说过，我们迟早有一个人要拿走另一半。'],
  ['xiao',()=>F('xiaoFree')?'玉在你那儿。拼上吧。':'——不过，拿走它的人，不一定要是赢的那个。'],
  {fn:()=>{S.flags.jadeWhole=1;S.flags.xiaoEnd=F('xiaoFree')?'free':'ally';const p=xP();if(p){p.att=100;p.goal='守着灵源的门';}news('两半玉简合为一块。萧尘站在你身边。',1);}},
  {fn:()=>cgShow('yujian')},['','两块玉合在一起。'],['mo','……师兄。'],['sx','……师弟。这一次，关上它吧。'],
  ['','玉简亮了很久很久。墨老和那个声音，第一次没有吵架。'],
  ['xiao','走吧。这一次，我们一起。'],['','（玉简合一：攻击 +10%，生命 +10%，暴击 +3%）']])]});
