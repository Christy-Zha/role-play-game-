/* ================= 正史：第一至第十卷 =================
   旧版主线（雾港、槐下、堕仙、灵源终章、飞升、星海、天庭、归墟……）和新卷宗互相打架。
   现在以第一到第十卷为准：冲突的旧章节整段撤下，人物的名字、来历、去留都以卷宗为准。
   境界停在筑基大圆满，金丹留给第十一卷。 */
let CANON_CAP=12;
/* 金丹：第十一卷抱元丹的药力化开以后，上限放到金丹大圆满 */
const canonCap=()=>F('v11Dan')?16:12;
function capMsg(){return canonCap()>12?'元婴这一关，还没有写到。金丹的路先走稳：修为攒满了也不会浪费。':'金丹这一关，要等第十一卷的故事。先把手头的路走稳：修为攒满了也不会浪费。';}
const CANON_OFF=new Set(['caravan','qichi','qiansan','xiaoman','port','guishi','locust','jindan','ningxuan','canju','zero','zhoufate','fallen','suwan','finale','tianmen','feisheng',
 'neigui','xinghai','tianting','guixu','cmsis','tw1','tw2','tw3','motest_a','motest_b','motest_c','zhounight_a','zhounight_b','zhounight_c','he_root','he_scar','hong_road','hong_sold',
 'li_home','li_lost','zero_ghost','zhou_grave','zhou_flame','su_duel','h_he','h_modis','h_sects','h_xianfu','h_root',
 'rj1','rj2','rj3','rj4','rj5','rj6','rj7','rj8','rj9','rj10','rj11','rj_end','rv2','rv3','rv4','rv5','rv6','rv7',
 'b_hong1','b_hong2','b_hong3','b_zhou1','b_su1','b_su2','b_su3','b_ning1','b_ning2','b_ning3','b_zero1','b_mo1','b_cm1','b_cm2','b_cm3','b_man1','b_man2']);
for(let i=STORY.length-1;i>=0;i--){const c=STORY[i];if(CANON_OFF.has(c.id)||/^rw_/.test(c.id))STORY.splice(i,1);}
/* 兼容：旧系统里还有不少「看过某章才开」的判断，走到卷宗里对应的那一章时，替它记上 */
const CANON_ALIAS={v1_caravan:['caravan'],v2_10:[],v3_4:['zero']};
STORY.forEach(c=>{const al=CANON_ALIAS[c.id];if(!al||!al.length)return;const a0=c.after;c.after=function(){al.forEach(x=>{if(!S.seen.includes(x))S.seen.push(x);});return a0&&a0.apply(this,arguments);};});

/* ---------- 人物：以卷宗为准 ---------- */
Object.assign(SPK,{hong:'红鹞',zero:'初一',xiao:SPK.xiao||'萧尘'});
Object.assign(BOND.hong,{n:'红鹞',romance:1,met:()=>F('v1hong')||S.seen.includes('v1_caravan')});
Object.assign(BOND.zhou,{romance:1,met:()=>true,dead:null,away:null});
Object.defineProperty(BOND.zero,'n',{value:'初一',writable:true,configurable:true});Object.assign(BOND.zero,{met:()=>S.seen.includes('zero')||S.seen.includes('v3_4'),dead:null});
Object.assign(BOND.cm,{romance:0,met:()=>S.seen.includes('v2_3'),dead:null});
Object.assign(BOND.su,{romance:1,met:()=>S.seen.includes('v4_6'),away:null});
Object.assign(BOND.ning,{romance:0,met:()=>S.seen.includes('v3_6'),dead:null,away:null});
Object.assign(BOND.shen,{met:()=>S.seen.includes('v2_10')});
Object.assign(BOND.qian,{met:()=>S.seen.includes('v2_6')});
Object.assign(BOND.man,{met:()=>false});
BOND.gui.met=()=>false;
BOND.xiao={n:'萧尘',romance:1,likes:['tea','record'],met:()=>S.seen.includes('v1_east')};
/* 旧缘分里的「鬼手」「林小满」不属于这条时间线，不再显示 */
Object.assign(BOND_CHAT,{
 hong:[['买东西？','别挡道，卸货呢。','老驴今天又吃了半桶油。'],['路上又看见一辆蓝车头，不是。……不是就不是。','你那块东西，最近还漏光吗？漏的话离车远点，我这车经不起鸦啄。'],['你来啦。……副驾给你留着。','跟你说话，比跟发动机说话省心。']],
 zero:[['……你好。','我在学写日子。今天是我数的第几天来着？'],['陈默教我拧阀门了。我一次都没拧反。','今天的风，是从河那边来的。'],['和你说话的时候，胸口这里是暖的。','我想，这就是“开心”。']],
 cm:[['……嗯。','垫圈磨好了。'],['炉子今天很乖。','夜里我守着，你睡吧。'],['我不太会说话。……但我在。','以前修不好的东西，现在能修了。']],
 su:[['图上没画的地方，别乱走。','今天水位低，旧通道露出来一截。'],['我又把那张旧图画了一遍。还是有一块空白。','你们的车，比我想的稳。'],['这一段路，我想多走几遍。……不为了画图。','跟你一起走，我就不总看罗盘了。']],
 ning:[['……','有事写下来，我会看。'],['南街的申诉，又多了三份。','我以前以为，签了字的事就算办完了。'],['你说话，总留一句给对方。……我学不会。','以后要是不当这个差了，我想去守一座渡口。']],
 xiao:[['……你还记得我？','七〇二。别敲错门。'],['今天有人问我是谁。我说我住七〇二。他说七〇二没人。','你记的那本册子，给我看看？'],['你每天都记得。……我也每天都记得你记得。','留灯的人，我想起来是谁了。是你。']]
});

/* ---------- 缘分：按卷宗重写 ---------- */
const bsReset=k=>{delete BPREV[k];};
bsReset('hong');
bs('b_hong1','hong',25,'后视镜','镜','overpass',null,[
 ['','夜里，「老驴」停在高架底下。红鹞蹲在车头底下换皮带，满手机油。'],
 ['hong','别傻站着，递个扳手。……不是那个，十三号的。'],
 ['','修好以后她靠在车门上。后视镜上夹着一张塑封的照片：一辆蓝车头的半挂，车头前站着个男人，胳膊上搭着一件工装。'],
 ['hong','我爸。他跑长途，车牌我背得比我自己的生日还熟。灵潮那天，他的车在高速上。'],
 ['hong','我每到一个地方，就问一遍：见没见过蓝车头的半挂。三年了，问出来一堆蓝车头，都不是。'],
 {c:[{t:'「车牌告诉我。我出城的时候也替你看。」',fx:{aff:{hong:8},flags:{hongPlate:1}},r:[['hong','（念了一串字母和数字，又念了一遍）记住了？'],['@','记住了。'],['hong','……行。多一双眼睛。'],['','她把照片往镜框里塞了塞，好像怕被风吹走。']]},
  {t:'「他看见你开着这辆车，会说什么？」',fx:{aff:{hong:5}},r:[['hong','会说我油门踩得太狠。'],['','她笑了一下，又把烟夹回指间，没点。']]}]}
]);
bs('b_hong2','hong',55,'账本','账','overpass',null,[
 ['','红鹞有一本很厚的账本。前半本是货，后半本是人：哪天在哪个路口带上了谁，送到了哪里。'],
 ['','有的名字后面划了一道短横。不是叉，就是一道短横。'],
 ['hong','没送到的。路上没的，或者送到了，下回再去，人不在了。'],
 ['hong','我爸教我：路上见到的人，只卖货，不卖人。我后来自己加了一句——带上车的人，要记得。'],
 {c:[{t:'陪她把这一年的名字抄进新本子',fx:{aff:{hong:10}},r:[['','你们坐在车顶上，一个念一个抄。抄到天亮，新本子用掉了四页。'],['hong','……谢谢你没说“节哀”。我最烦这两个字。'],['','天亮的时候，她把旧账本塞进副驾的储物格，钥匙交给了你一把。']]},
  {t:'「你也写上我。」',fx:{aff:{hong:8}},r:[['hong','你又没坐过我的车……'],['','她看了你一眼，还是在最后一页写下了你的名字，后面空着，什么也没画。'],['hong','这一格，你自己别给我划上。']]}]}
]);
bs('b_hong3','hong',80,'车灯','灯','overpass',()=>S.seen.includes('v5_21'),[
 ['','北线停车的那几个月，红鹞把「老驴」的车灯换了新的。试灯那晚，她把你叫到车前。'],
 {fn:()=>{
  if(isPartner('hong'))SC.q.unshift(
   ['hong','行驶证我改了。副驾那一栏，填的你。'],['@','副驾还要填？'],['hong','我说要填就要填。'],
   ['','车灯亮了，照着坡下那条还没修完的路。她没再说话，伸手把你衣领翻好，像在检查一件要装车的货。']);
  else if(freeHeart('hong'))SC.q.unshift(
   ['hong','那天锅糊了，我回去想了一路。'],['hong','我这人说话直，不绕弯子。我不想到老了，在哪个路口才想起来，有句话没说。'],
   {c:[{t:'「那就说完。……我也是。」',r:[partnerFx('hong'),['hong','……你想清楚了？跟着我，没有安稳日子。'],['@','我要的不是安稳日子。'],['','她笑了，伸手把车灯拧到最亮。'],['','【你与红鹞结为道侣：她会随你出战。】']]},
    {t:'「你是我最重要的朋友。一直都是。」',fx:{aff:{hong:-3}},r:[['hong','……行。朋友。'],['hong','那朋友帮个忙，开春北线开车，来坡下送我。'],['','她转过身去拍了拍轮胎。你看不见她的表情。']]}]});
  else SC.q.unshift(['hong','灯好了。以后夜里走，你在后头也看得见我。'],['','她把手套扔给你，让你帮着擦车灯罩。擦完，两个人都是一手黑。']);}}
]);
BPREV.zhou=undefined;
STORY.push({id:'b_zhou1',title:'缘·周烈·灰烬',g:'烬',bg:'shelter',bond:'zhou',cond:()=>avOf('zhou')>=25,lines:[
 ['','隧道口的墙上，周烈用斧刃刻了六道横。刻到第六道，他停了很久。'],
 ['zhou','护卫队死的六个。小张是挡在我前面死的。'],['zhou',()=>typeof v1Pill==='function'&&v1Pill()==='zhou'?'后来那颗丹给了我。我筑了基，还是天天来这儿刻。':'我天天来这儿，怕哪天连他们叫什么都记不起来。'],
 {c:[{t:'拿过斧子，替他把第七道刻得浅一点',fx:{aff:{zhou:8}},r:[['zhou','第七道是谁？'],['@','留着。谁都不要是。'],['zhou','……'],['','他把斧子收回去，没说话，在墙根坐到了天亮。']]},
  {t:'「刻完了，跟我出城。他们的那份，你接着守。」',fx:{aff:{zhou:5}},r:[['zhou','哈。你倒会使唤人。'],['','他拍掉手上的石粉，提斧跟上来。']]}]}
]});
bsReset('su');
bs('b_su1','su',25,'铜罗盘','盘','yipeng',null,[
 ['','苏绾坐在棚子边，把一只铜罗盘拆开，指针、轴尖、玻璃面排成一排。'],
 ['su','磁偏不对。坠星那边的东西把它带歪了，每回进去出来，都要重新校。'],
 ['@','你第一次进坠星，是去找人？'],['su','嗯。没找到。'],['','她把轴尖对着灯看，没有往下说。'],
 {c:[{t:'什么都不问，帮她扶着灯',fx:{aff:{su:8}},r:[['','你扶着灯，她装好了指针。指针晃了很久，最后停在一个不太准的地方。'],['su','……差两度。够用了。'],['su','谢谢你没问。']]},
  {t:'「下回进去，我陪你一起找。」',fx:{aff:{su:5}},r:[['su','找人和找路不一样。路找不到，可以退。'],['','她把罗盘合上，还是点了点头。']]}]}
]);
bs('b_su2','su',55,'空白处','白','wugang',null,[
 ['','苏绾把她那张旧图摊在膝上。图很密，只有右下角空着一块。'],
 ['su','我以前以为，图上空白，就是没人去过。后来知道，是去过的人没回来画。'],
 ['su','这一块，你们那次替我走过了。……你来画。'],
 ['','她把笔递给你。图上每一笔都是她的，只有这一块，要换一只手。'],
 {c:[{t:'照着记忆，一笔一笔画上',fx:{aff:{su:10}},r:[['','你画歪了一处门。她没改，只在旁边标了一个很小的问号。'],['su','留着。以后谁走错了，至少知道这里有人犹豫过。']]},
  {t:'「我们一起画。你说，我画。」',fx:{aff:{su:8}},r:[['','她说一句你画一笔。画到最后，两个人的笔迹叠在一起，分不清了。'],['su','……这样也好。']]}]}
]);
bs('b_su3','su',80,'图上的名字','名','yipeng',()=>F('v4done')&&freeHeart('su'),[
 ['','苏绾新画的一张图上，有一处地方没写地名，写的是你的名字。'],
 ['su','不是标错了。我画图有个习惯：认得的地方写地名，回得去的地方，写人名。'],
 ['su','……我问问而已。你不用现在答。'],
 {c:[{t:'「那以后，我的图上也写你。」',r:[partnerFx('su'),['su','……你又不画图。'],['@','从今天开始画。'],['','她低下头笑，把笔帽咬在嘴里，把那一处名字又描了一遍。'],['','【你与苏绾结为道侣：她会随你出战。】']]},
  {t:'「你回得去的地方，我都陪你走一遍。」',fx:{aff:{su:3}},r:[['su','以同路人的身份？'],['@','以同路人的身份。'],['su','……也好。那就说定了。']]}]}
]);
bsReset('ning');
bs('b_ning1','ning',25,'批示','批','keyun',null,[
 ['','夜里，宁玄的屋子还亮着。他在重看自己从前签过的批示，一份一份，看完一份放到左边。'],
 ['ning','左边是我现在还认的。右边……是我现在不认，但当时签了的。'],['','右边那一摞，比左边高。'],
 {c:[{t:'「那就一份一份重新签。」',fx:{aff:{ning:10}},r:[['ning','……你说得容易。'],['','可是三天后，南街贴出了一张更正告示，落款是他的名字。']]},
  {t:'陪他坐着，把右边那摞按日期排好',fx:{aff:{ning:8}},r:[['','排完天亮了。他说了一声谢谢，声音很轻，像怕被谁听见。']]}]}
]);
bs('b_ning2','ning',55,'旧剑','剑','keyun',null,[
 ['','宁玄在擦那柄旧剑。刃上有几个细小缺口，他一个一个摸过去。'],
 ['ning','这把剑我拔过三次。两次是该拔的。'],['ning','第三次，是我替别人拔的。后来我才知道，那个人要的不是剑，是我的字。'],
 {c:[{t:'「以后你拔剑之前，先告诉我一声。」',r:[swornFx('ning'),['ning','……好。'],['','他把剑横过来，让你也摸了摸那几个缺口。'],['','【你与宁玄结义。】']]},
  {t:'「缺口别磨。留着。」',fx:{aff:{ning:6}},r:[['ning','……嗯。留着。']]}]}
]);
bsReset('cm');
bs('b_cm1','cm',25,'垫圈','垫','shelter',null,[
 ['','陈默坐在炉边磨一枚垫圈，磨一下，对着火看一下。'],['cm','裂了一道。撑过明晚就行。'],['@','你磨了一晚上？'],['cm','嗯。睡不着。炉子不响，我睡不着。'],
 {c:[{t:'坐下来，帮他拉风箱',fx:{aff:{cm:8}},r:[['','你们谁都没说话。天快亮的时候，垫圈磨好了，炉子的声音也匀了。'],['cm','……你手挺稳。']]},
  {t:'「明天让坊市给你配个新的。」',fx:{aff:{cm:3}},r:[['cm','新的不一定合。旧的我知道它哪儿薄。']]}]}
]);
bs('b_cm2','cm',55,'工牌','牌','shelter',null,[
 ['','陈默把那枚旧工牌放在桌上。牌面磨花了，还认得出一行字和一个编号。'],
 ['cm','内炉。我在那儿看过三年火。有些东西从炉边推过去，我没问是什么。'],['cm','后来知道了。'],
 {c:[{t:'「你现在问了。这就不一样。」',fx:{aff:{cm:10}},r:[['cm','……'],['cm','从来没人这么跟我说过。']]},
  {t:'把工牌推回他手里',fx:{aff:{cm:8}},r:[['','他攥着工牌，攥了很久。'],['cm','……以后再有东西推过去，我会拦。']]}]}
]);
bs('b_cm3','cm',80,'守夜','夜','shelter',null,[
 ['','炉房的灯又亮到半夜。陈默守在门口，看见你出来，往旁边挪了挪，给你让了个位置。'],['cm','我不太会说话。'],['cm','以后你出门，炉子我看着。人，我也看着。'],
 {c:[{t:'「兄弟，以后行社的门，交给你了。」',r:[swornFx('cm'),['cm','……好。门在，人在。'],['','【你与陈默结义。】']]},
  {t:'和他一起守到天亮',fx:{aff:{cm:5}},r:[['','天亮的时候，炉子正好出了一窑好灰。']]}]}
]);
BPREV.zero=undefined;
STORY.push({id:'b_zero1',title:'缘·初一·日子',g:'日',bg:'shelter',bond:'zero',cond:()=>avOf('zero')>=25&&BOND.zero.met(),lines:[
 ['','初一在墙上画格子。一天一格，画满七格，就在下面写一个很工整的数字。'],
 ['zero','“初一”是一个月的第一天。我想，那后面应该还有很多天。'],['zero','我在数。数到哪一天，都是我的。'],
 {c:[{t:'在她的格子旁边，也画上你的一格',fx:{aff:{zero:8}},r:[['zero','……这一格是谁的？'],['@','今天的。我们一起过的。'],['','她认认真真在那一格里写了两个名字。']]},
  {t:'「以后哪天想不起来，就看墙。」',fx:{aff:{zero:6}},r:[['zero','嗯。墙不会忘。……你也不会。']]}]}
]});
const _zero2=STORY.find(c=>c.id==='b_zero2');if(_zero2){const c0=_zero2.cond;_zero2.cond=()=>S.seen.includes('b_zero1')&&avOf('zero')>=70&&BOND.zero.met();
 _zero2.title='缘·初一·第一次笑';_zero2.lines=_zero2.lines.map(l=>Array.isArray(l)&&typeof l[1]==='string'?[l[0],l[1].replace(/零号/g,'初一').replace(/红姐说/g,'秦婶说')]:l);}
BPREV.mo=undefined;
STORY.push({id:'b_mo1',title:'缘·墨老·师妹',g:'妹',bg:'dongtian',bond:'mo',cond:()=>avOf('mo')>=30,lines:[
 ['mo','老夫当年，有个小师妹。'],['mo','她修为不高，最爱笑，养了一窝麻雀，天天喂。'],
 ['mo','灵鸦来的那天，麻雀先叫的。她把这块玉简塞进老夫手里，说：师兄，你记性好，你先走。'],
 ['mo','……老夫走了。走成了一块玉，睡了三百年。醒过来，第一件事是想她那窝麻雀叫什么名字。想不起来了。'],
 {c:[{t:'「以后你想起来一个，就说给我听。我替你记。」',fx:{aff:{mo:10}},r:[['mo','……娃娃。'],['mo','（很久以后）有一只，叫“豆子”。'],['','你把“豆子”两个字写在了洞天的石壁上。']]},
  {t:'安静地陪他坐一会儿',fx:{aff:{mo:6}},r:[['','玉简里的光很淡，像有人在另一头轻轻翻了个身。']]}]}
]});
bsReset('xiao');
bs('b_xiao1','xiao',25,'登记簿','簿','overpass',null,[
 ['','萧尘把一本登记簿推到你面前，翻到很靠后的一页。上面是你的字：七〇二，萧尘。'],
 ['xiao','你上周写的。你自己不记得了吧。'],['@','……记得。'],['xiao','（看着你，没拆穿）'],
 {c:[{t:'当着他的面，再写一遍',fx:{aff:{xiao:8},flags:{xiaoBook:1}},r:[['','你在下一行又写了一遍。七〇二，萧尘。'],['xiao','写两遍也没用。……写吧。'],['','他看着那两行字，看了很久。']]},
  {t:'「我每天写一遍。写到我记住为止。」',fx:{aff:{xiao:6},flags:{xiaoBook:1}},r:[['xiao','你会烦的。'],['@','烦了也写。']]}]}
]);
bs('b_xiao2','xiao',55,'留灯','灯','overpass',null,[
 ['','你晚上回来，七〇二的门缝里没有光。你把自己那盏灯放在了他门口。'],
 ['','第二天，灯还在，灯油添满了。旁边压着一张纸条：别浪费油。'],
 ['xiao','（隔着门）以前有个人，每晚给我留灯。我想不起来是谁。'],['xiao','你别学他。我怕又想不起来一个。'],
 {c:[{t:'「那你记住灯就行。人，换我来记。」',fx:{aff:{xiao:10}},r:[['','门开了一条缝。他没出来，只把手伸出来，把灯往里挪了挪。']]},
  {t:'接着放，一句话都不说',fx:{aff:{xiao:8}},r:[['','灯放到第七天，门口多了一只给灯挡风的旧罐头。']]}]}
]);
bs('b_xiao3','xiao',80,'名字','名','overpass',()=>F('v6done'),[
 ['xiao','我想起来了。每晚留灯的人，是你。'],['xiao','不是以前。是后来。是你每天都写那一行，我才有了“以前”。'],
 ['xiao','我这样的人，被人记住，是要还的。……我想还。'],
 {fn:()=>{if(freeHeart('xiao'))SC.q.unshift({c:[
   {t:'「不用还。留下来，就算还。」',r:[partnerFx('xiao'),['xiao','……你知道你在说什么吗？'],['@','我记得。'],['','他终于笑了。很淡，可你记住了。'],['','【你与萧尘结为道侣：他会随你出战。】']]},
   {t:'「那就一辈子当我的朋友，慢慢还。」',r:[swornFx('xiao'),['xiao','……好。慢慢还。'],['','【你与萧尘结义。】']]}]});
  else SC.q.unshift({c:[{t:'「那就一辈子当我的朋友，慢慢还。」',r:[swornFx('xiao'),['xiao','……好。慢慢还。'],['','【你与萧尘结义。】']]}]});}}
]);

/* ---------- 行社：卷宗里第二卷就挂了牌 ---------- */
STORY.push({id:'lizu',title:'青石·行社挂牌',g:'社',bg:'shelter',cond:()=>S.seen.includes('v2_18'),hint:'第二卷，青石行社挂牌之后',lines:[
 ['','青石行社的木牌挂上去第三天，铁叔托人捎来一本空账簿，扉页上写着：人、粮、炉、车。'],
 ['tie','（信里）行社是大家的。你在外面跑，家里的事要有个地方记。'],
 ['cm','炉的那一页，我来记。'],
 ['hong','车那一页归我。别让我看见有人在上面乱写油钱。'],
 {c:[{t:'「好。就从今天起。」',k:0,r:[['','你在第一页写下了日期。']]},
  {t:'「我不想当谁的头。……但这本账，我会记。」',k:1,r:[['','铁叔后来回信，只有一句：就是这句话。']]}]},
 ['','【「行社」已开启：招人、修建、派人外出。】']
],after:()=>{if(!S.clan){S.clan=clanHydrate({name:'青石行社',fame:5});clLog('青石行社挂牌。');try{clanSync();}catch(e){}}}});

/* ---------- 行路：去掉旧版人物 ---------- */
{const z6=STORY.find(c=>c.id==='z6');if(z6)z6.lines=[['','空气浓得像水。每呼吸一口，丹田都在发烫。'],['','碎石悬在半空，绕着一道通天的光柱慢慢转动。'],['mo','这里的灵气不是长出来的，是被什么东西往下压出来的。别待太久。']];}

/* ---------- 境界上限：筑基大圆满 ---------- */
{const _ni=nextInfo;nextInfo=function(){const o=_ni();CANON_CAP=canonCap();if(S.stage>=CANON_CAP&&!o.final){o.gate=o.gate||(CANON_CAP>12?'元婴':'第十一卷');o.capped=true;}return o;};}
BOND_PERK_FIX:{const bp0=bondPerk;bondPerk=k=>k==='zero'?((S.sworn||[]).includes('zero')?'初一战斗中攻击 +20%':''):bp0(k);}
if(typeof NPCS!=='undefined'){if(NPCS.hong)NPCS.hong.name='红鹞';if(NPCS.zero)NPCS.zero.name='初一';if(NPCS.ning)NPCS.ning.unlock=()=>false;if(NPCS.zhou)NPCS.zhou.unlock=()=>S.seen.includes('v1_caravan');if(NPCS.shen)NPCS.shen.unlock=()=>S.seen.includes('v2_10');if(NPCS.qian)NPCS.qian.unlock=()=>S.seen.includes('v2_6');if(NPCS.gui)NPCS.gui.unlock=()=>false;if(NPCS.man)NPCS.man.unlock=()=>false;}
/* 旧委托里和卷宗冲突的（阿禾妈妈的白旗船、给零号起名、陈默的妹妹、星海天庭……）撤下 */
['he1','he2','he3','zero1','man1','man2','man3','cm1','su1','su2','gui1','shen3','mo1','mo2'].forEach(id=>{const q=QUESTS.find(x=>x.id===id);if(q)q.unlock=()=>false;});

/* ================= 因果录：你做过的选择，和它们留下的东西 ================= */
const CAUSE=[
 {v:1,f:()=>({self:'筑基丹你自己吃了。周烈后来很久没跟你说话。',zhou:'筑基丹给了周烈。他筑了基，一直守着青石站的门。',sell:'筑基丹让红鹞带去坊市卖了，换回来的粮撑过了那个冬天。'}[typeof v1Pill==='function'?v1Pill():'']||null)},
 {v:1,f:()=>S.seen.includes('ahe')?(F('heScar')?'你下隐道猎了蓝鳞蛇。阿禾好了，可每逢阴天，她那只手会疼。':'你散了一半修为，替阿禾压住了蓝线。她手腕上只剩一颗蓝色的小点。'):null},
 {v:2,f:()=>F('v2HongEnd')==='trust'?'你对红鹞说：以后觉得不对，先告诉我。她答应了。':null},
 {v:4,f:()=>F('v4Lamp')?'你陪红鹞去点了那盏灯。':null},
 {v:5,f:()=>F('v5Sample')===1?'河边放水时，你让人先停下，取了第二碗水样对照。':F('v5Sample')===0?'河边放水时，你让人清了口子接着放。':null},
 {v:5,f:()=>S.seen.includes('v5_21')&&isPartner('hong')?'那顿夹生的晚饭以后，你和红鹞在一起了。':null},
 {v:6,f:()=>F('v6Defy')?'你违了令，往北壁转过去一息，受了伤。':null},
 {v:7,f:()=>F('v7Drill')===1?'你让大家再练，练到两息。':F('v7Drill')===0?'你说三息够了，没有耽误行程。':null},
 {v:8,f:()=>F('v8Promise')===1?'你答应连夜走，天亮前把所有人送下去。':F('v8Promise')===0?'你先问清每个人的身体，再排舱位和时辰。':null},
 {v:9,f:()=>F('v9Risk')==='novel'?'你照短测的结果把五座药炉接进同一个循环。傍晚反吸，工具车毁了，陆怀灯受了伤。':F('v9Risk')==='early'?'你先查回收纹，只做能隔开的测试。保田的方案放弃了，车和药炉保住了大半。':null},
 {v:10,f:()=>F('v10Zhao')===0?'在伏灯站，你识破了灯号，按住了赵笙的手。':F('v10Zhao')===1?'在伏灯站，你没看出灯号。赵笙的左掌伤得很重。':null},
 {v:11,f:()=>F('v11Fang')==='san'?'丹谱你抄给了各地，教人自己开炉。炉砌得慢，夜里火该不该停，终于有人能在本地看懂。':F('v11Fang')==='gong'?'你在北山合办了药院，领药与入会分开。药送得快，外传的期限，你得一直守着。':null},
 {v:11,f:()=>F('v11Heart')==='grown'?'结丹时，你对心魔里的小阿禾说：你已经长大了。':F('v11Heart')==='still'?'结丹时，你没有向心魔里的小阿禾伸手。':null},
 {v:12,f:()=>F('v12An')==='zhong'?'旧案和危险告知一起见了光。几段航路停了核验，各地开始互相写信。':F('v12An')==='chuan'?'你先给撤离船留路，第二批船过界，旧案才启封。':null},
 {v:12,f:()=>F('v12Hall')==='win'?'息衡外廊，你逼退了乌衡，把悬在泊壁外的他拖了回来。':F('v12Hall')==='lose'?'息衡外廊，你没能一剑逼退乌衡，还是把他拖了回来。':null},
 {v:13,f:()=>F('v13Qu')==='an'?'你留在了岸上。':F('v13Qu')==='hai'?'你随迁航船走了。':F('v13Qu')==='xiang'?'你关掉了那段导槽，回了青石。':null},
 {v:13,f:()=>F('v13End')?'终章：'+({deng:'万家灯火',feng:'长风万里',shou:'守潮人',qing:'归青石',bai:'白塔长明'}[F('v13End')]||'')+'。':null}
];
const VOL_NAME=v=>{const c=STORY.find(x=>x.id===(v===1?'zhuji':'v'+v+'_1'));return v===1?'青石':c?c.title.split('·')[0]:'第'+cnNum(v)+'卷';};
function causeOf(v){return CAUSE.filter(c=>!v||c.v===v).map(c=>{let t=null;try{t=c.f();}catch(e){}return t?{v:c.v,t}:null;}).filter(Boolean);}
function causeHTML(){const L=causeOf();if(!L.length)return '';
 return `<h2 class="sec">因果录 <small>你做过的选择，后来都还在</small></h2><ul class="cause-list">${L.map(c=>`<li><span class="cv">第${cnNum(c.v)}卷</span>${esc(c.t)}</li>`).join('')}</ul>`;}

/* 后面的卷宗里，记得前面发生过的事 */
const CALLBACK={
 v4_1:()=>({zhou:['','临走前，周烈在站口把斧子扛上肩：「站里有我。」'],sell:['','临走前，铁叔又数了一遍粮仓。那颗丹换回来的米，还剩小半仓。'],self:['','临走前，周烈在站口看了你一眼，没说话，侧身让开了路。']}[typeof v1Pill==='function'?v1Pill():'']),
 v6_1:()=>S.seen.includes('ahe')?(F('heScar')?['','下雨了。你想起阿禾那只阴天会疼的手，出门前多留了一包药。']:['','下雨了。你想起阿禾手腕上那颗蓝色的小点。']):null,
 v7_1:()=>F('v5Sample')===1?['','你还留着河边那两碗水样的记录。纸已经泛黄，字还看得清。']:null,
 v8_1:()=>F('v6Defy')?['','北壁那一息留下的伤，天一冷就提醒你一回。']:null,
 v9_1:()=>F('v8Promise')===1?['','那一夜送下去的人里，有人托车队给你捎来一包干枣。']:F('v8Promise')===0?['','那张排好的舱位表，你一直夹在玉简旁边。']:null,
 v10_1:()=>F('v9Risk')==='novel'?['','路过一处修车铺，你停下来看了很久。那辆工具车，到底没修回来。']:F('v9Risk')==='early'?['','药炉的火还在烧。那天你放下了一块田，保住了这一炉。']:null,
 v10_21:()=>F('v10Zhao')===1?['','赵笙用右手接过了碗。左手还缠着。']:null,
 v11_1:()=>F('v10Key')?['','门锁是青石买的那把铜锁。两把钥匙，一把在你兜里，一把在红鹞的钥匙串上。']:null,
 v12_1:()=>F('v11Fang')==='san'?['','临走前，小椿托人捎来一句话：屋顶补好了，雨天没再强开炉。']:F('v11Fang')==='gong'?['','临走前，北山药院贴出了这个月的用量。领药的队，比上个月短了一截。']:null,
 v13_1:()=>F('v12An')==='zhong'?['','青石的告示栏上，息衡那份旧案还贴着。有人在边上用炭笔补了一行：别揭。']:F('v12An')==='chuan'?['','迁来的老人托人送回一块旧匾，说地址你记对了。']:null
};
/* 道侣不止红鹞一个时，别的道侣也有话说 */
const PARTNER_SEND={
 zhou:['周烈把磨好的斧子塞进你的行李：「用不上最好。用得上，记着往回走。」','周烈托人捎来一句话，只有四个字：早点回来。','出门前，周烈替你把鞋带重新系了一遍，系得很紧。','周烈的信里画了一张歪歪扭扭的地图，标着青石站，旁边写：家。','周烈在站口等了一夜。你回来时，他假装刚起。'],
 xiao:['萧尘在你的册子上写了一行：七〇二，萧尘，等你。','萧尘没来送。你的灯旁边，多了一只挡风的旧罐头。','萧尘问你这一趟要走几天。你说不知道，他便说：那我每天都记一遍。','萧尘把你的名字写在了他自己的登记簿上，第一行。','萧尘站在路口，冲你点了一下头。你知道他会记得。'],
 su:['苏绾把一张手绘的路线图折好，塞进你的袖口：「水位会变，图是死的。人别死。」','苏绾的罗盘借给你了。她说差两度，够用。','苏绾在你的图上添了一个记号：回来的路。','苏绾说她会在图上留一块空白，等你回来自己画。','苏绾把笔帽咬在嘴里，没说再见，只在你手心画了一个小小的箭头。'],
 hong:['红鹞（看了一眼你身后的人）：「行，人多，车上挤挤。」','红鹞把副驾的座垫翻了个面：「轮流坐。」','红鹞：「都上车。谁晕车谁坐前头。」','红鹞把账本上你那一格又描了一遍。','红鹞按了一声喇叭，算是送行。']
};
/* 第十一至十三卷的送行 */
PARTNER_SEND.zhou.push('周烈托人捎来一袋窑边烤的栗子，附一句：结丹别逞强。','周烈把斧子往门边一靠：「天上的事你去问，地上的窑我看着。」','周烈什么也没说，把你的行李往车上一扔，自己先坐了上去。');
PARTNER_SEND.xiao.push('萧尘在你的药理册里夹了一张纸条：疼就停。','萧尘把短刀擦了三遍，说这回他跟着。','萧尘看着你，说：这回我们两个的名字，都不刻。');
PARTNER_SEND.su.push('苏绾的信里画了灰枫谷的路，旁边写：这条是我问来的，不是猜的。','苏绾说息衡的旧簿她先去核，你只管把人带到。','苏绾把一封给母亲的短信折好，又折了一封给你：今晚能不能一起吃饭，尚不确定。');
PARTNER_SEND.hong.push('红鹞把骡子的缰绳递给你一根：「窄路，你牵一头。」','红鹞把船票一张张数过：「人多，舱挤挤。」','红鹞把你们几个的出行单夹在同一只匣子里。');
['v6_1','v7_1','v8_1','v9_1','v10_1','v11_1','v12_1','v13_1'].forEach((id,i)=>{const c=STORY.find(x=>x.id===id);if(!c||!Array.isArray(c.lines))return;
 c.lines=[{fn:()=>{const P=partners();const L=P.filter(k=>PARTNER_SEND[k]&&(k!=='hong'||P.length>1)).map(k=>['',PARTNER_SEND[k][i]]);if(L.length)SC.q.unshift(...L);}},...c.lines];});
Object.keys(CALLBACK).forEach(id=>{const c=STORY.find(x=>x.id===id);if(!c||!Array.isArray(c.lines))return;c.lines=[{fn:()=>{let l=null;try{l=CALLBACK[id]();}catch(e){}if(l)SC.q.unshift(l);}},...c.lines];});

/* ================= 前情提要：每一卷开头 ================= */
function recapHTML(v){const prev=STORY.filter(c=>c.id.startsWith('v'+(v-1)+'_')&&S.seen.includes(c.id)).map(c=>c.title.split('·').slice(1).join('·'));
 const cs=causeOf(v-1);
 return `<div class="recap"><h3>前情提要 · ${esc(VOL_NAME(v-1))}</h3>${prev.length?`<p class="rc-path">${prev.map(esc).join(' → ')}</p>`:''}${cs.length?cs.map(c=>'<p>'+esc(c.t)+'</p>').join(''):''}<p class="note">如今是${dateName()}。下一卷：${esc(VOL_NAME(v))}。</p></div>`;}
{const ps0=playStory;playStory=function(id){const m=/^v(\d+)_1$/.exec(id);const v=m?+m[1]:0;
  if(v>=2&&!S.seen.includes(id)&&!S.flags['rc_'+v]&&!BT){S.flags['rc_'+v]=1;modal(recapHTML(v),[{t:'继续',cls:'gold',fn:()=>ps0(id)}]);return;}
  return ps0.apply(this,arguments);};}

/* ================= 剧情战的规矩 =================
   卷宗里写着「不许用火」「锁住它」「认盐印别认影子」的仗，现在真的按这些规矩打。 */
function foeRage(f){if(!f||!f.alive||(f.rage||0)>=3)return;f.rage=(f.rage||0)+1;f.atk*=1.15;btPop(f,'躁动','tag');}
{const es0=elStrike;elStrike=function(a,t,el,d,o){
  if(a&&a.side==='p'&&t&&t.alive&&t.mech&&el){
   if(el==='huo'&&t.mech==='fireFeed'){btHeal(t,t.max*.12);btPop(t,'火喂藤','tag');foeRage(t);return 0;}
   if(el==='huo'&&(t.mech==='heat'||t.mech==='lure')){BT.foes.filter(f=>f.alive&&f.mech===t.mech).forEach(foeRage);d*=.6;}
   if(t.mech==='qiSeek'){foeRage(t);d*=.7;}}
  return es0.call(this,a,t,el,d,o);};}
{const sa0=stAdd;stAdd=function(t,k,n,src){
  if(t&&t.alive&&k==='burn'&&t.side!=='p'){if(t.mech==='fireFeed'){btHeal(t,t.max*.06);btPop(t,'火喂藤','tag');return;}if(t.mech==='heat'||t.mech==='lure'){foeRage(t);return;}}
  return sa0.apply(this,arguments);};}
{const bh0=btHit;btHit=function(t,d,cls,src){
  if(t&&t.alive&&t.side!=='p'&&src&&src.side==='p'){const s=t.st||{};
   if(t.mech==='lock'&&!(s.stun>0||s.root>0||s.brk>0||t.frozen>0)){d*=.3;if(Math.random()<.45)btPop(t,'锁住它','tag');}
   if(t.mech==='mirror'&&BT.foes.some(f=>f.alive&&f.decoy)&&Math.random()<.55){btPop(t,'镜影','tag');return;}}
  return bh0.apply(this,arguments);};}
{const rs0=roundStart;roundStart=function(){const r=rs0.apply(this,arguments);if(!BT)return r;const o=BT.opt||{},h=BT.party[0];
  if(BT.round===1&&o.rule){btMsg('规矩：'+o.rule);BT.fx.push({k:'banner',x:BT.W/2,y:BT.H*.3,txt:o.rule.split('：')[0].slice(0,10),col:'#e8c878',t0:BT.t,dur:2.2});}
  BT.foes.forEach(f=>{if(!f.alive)return;
   if(f.mech==='qiSeek'&&f.drain&&h&&h.alive){const m=h.mmax*.1;h.mp=Math.max(0,h.mp-m);btPop(h,'灵力被吸','st');}
   if(f.mech==='mirror'&&BT.round%3===0&&!BT.foes.some(x=>x.alive&&x.decoy)){const g=mkCustom(Math.max(0,f.z||0),{look:'镜中错影',name:'镜中错影',st:Math.max(0,S.stage-1),m:.6});g.decoy=1;g.noLoot=1;g.summ=1;
    Object.assign(g,{side:'e',alive:true,ox:0,oy:-10,alpha:0,flash:0,buf:0,defd:false,spd:8,idx:BT.foes.length,max:g.hp});BT.foes.push(g);btLayout();tween(g,{alpha:1,oy:0},400);btMsg('镜里又多出一个影子');}});
  if(o.surviveN&&BT.round>o.surviveN&&BT.foes.some(f=>f.alive)){BT.foes.forEach(f=>{if(f.alive){f.alive=false;tween(f,{alpha:0},500);}});btMsg(o.surviveMsg||'撑过去了。');}
  else if(o.surviveN&&BT.round<=o.surviveN)btMsg('还要撑 '+(o.surviveN-BT.round+1)+' 回合');
  if(o.turnLimit&&BT.round>o.turnLimit&&BT.foes.some(f=>f.alive&&f.boss)&&h){h.hp=0;h.alive=false;btMsg(o.limitMsg||'来不及了。');}
  else if(o.turnLimit&&BT.round<=o.turnLimit&&BT.round>o.turnLimit-3)btMsg('只剩 '+(o.turnLimit-BT.round+1)+' 回合');
  return r;};}
/* 每场剧情战配上规矩和自己的样子 */
const STORY_RULE={
 '盲鳗':{rule:'它们追光：别点火，用火只会把它们全引过来。',mech:{'盲鳗':'lure'},look:{'盲鳗':'盲鳗'}},
 '盐壳螯':{rule:'它们认热：别用火烘，火只会让它们更躁。',mech:{'盐壳螯群':'heat'},look:{'盐壳螯群':'盐壳螯'}},
 '负碑鼋':{rule:'不必杀它：撑过六个回合，它会自己退开。',surviveN:6,surviveMsg:'负碑鼋喷出一口白气，慢慢沉回了碑下。',mech:{'负碑鼋':'jinshen','盐壳螯群':'heat'},look:{'负碑鼋':'负碑鼋','盐壳螯群':'盐壳螯'}},
 '寄焰藤':{rule:'不许用火：火只会喂它。',mech:{'寄焰藤':'fireFeed','寄焰藤根':'fireFeed'},look:{'寄焰藤':'寄焰藤','寄焰藤根':'寄焰藤'}},
 '护炉架':{rule:'别砍轴，锁住它：晕住、缠住或破了甲，才打得动。',mech:{'护炉架':'lock','寄焰藤':'fireFeed'},look:{'护炉架':'护炉架','寄焰藤':'寄焰藤'}},
 '晶背蛾':{rule:'它们追灵息和火光：少用法术，拳脚更稳。',mech:{'晶背蛾群':'qiSeek'},look:{'晶背蛾群':'晶背蛾'}},
 '井下晶背蛾':{rule:'它们追灵息：少用法术，拳脚更稳。',mech:{'晶背蛾':'qiSeek'},look:{'晶背蛾':'晶背蛾'}},
 '晶翼':{rule:'它们吃灵息：每回合吸走你一成灵力，法术越响越招它们。',mech:{'晶翼':'qiSeek'},drain:{'晶翼':1},look:{'晶翼':'晶翼'}},
 '岩鬃獾':{rule:'岩鬃硬得像石头：先破甲。',mech:{'岩鬃獾':'jinshen'},look:{'岩鬃獾':'岩鬃獾','晶背兽':'晶背兽'}},
 '镜中的衡渡':{rule:'认脚下的盐印，别认镜里的影子：先打碎错影。',mech:{'衡渡':'mirror'},decoy:{'镜中错影':1},look:{'衡渡':'衡渡','镜中错影':'镜中错影'}},
 '归相钉前':{rule:'只有这半息：八个回合内断钉。',turnLimit:8,limitMsg:'归相钉合拢了。你被震出了镜腹。',look:{'衡渡':'衡渡'}},
 '伏灯站':{look:{'蒙面人':'蒙面人','持弩的蒙面人':'蒙面人','翻船帮的蒙面人':'蒙面人'}},
 '折鳞舟':{rule:'看他握刀那只手的指根：他蓄力时，正是破绽。',look:{'孟确':'孟确'}},
 '息衡外廊':{rule:'冻息叶压火：别拿火硬撞，金气贴住他的杖身。',mech:{'冻息叶':'heat'},look:{'乌衡':'乌衡','冻息叶':'冻息叶'}},
 '主槽':{rule:'别跟他拼灵气：撑过六个回合，等工师插下断令片。',surviveN:6,surviveMsg:'第三片断令片插到底。晏枢手里的银线，松了一根。',look:{'晏枢':'晏枢','主槽守卫':'天穹追兵','持杖的守卫':'天穹追兵'}}
};
{const rf0=rwFight;rwFight=function(o){const R=o&&STORY_RULE[o.title];if(R){o=Object.assign({},o,{rule:R.rule,surviveN:R.surviveN,surviveMsg:R.surviveMsg,turnLimit:R.turnLimit,limitMsg:R.limitMsg});
  if(o.many)o.many=o.many.map(f=>Object.assign({},f,{mech:R.mech&&R.mech[f.name]||f.mech,decoy:R.decoy&&R.decoy[f.name]||f.decoy,look:R.look&&R.look[f.name]&&LOOK[R.look[f.name]]?R.look[f.name]:f.look}));}
  return rf0(o);};}
{const rb0=rwBattle;rwBattle=function(o){rb0(o);if(BT&&o&&o.many&&STORY_RULE[o.title]){const R=STORY_RULE[o.title];BT.foes.forEach(e=>{if(R.drain&&R.drain[e.n||e.name])e.drain=1;});}};}
/* 新敌人的样子（先用像素造型顶上，等插画） */
Object.assign(LOOK,{
 '乌衡':{a:'human',k:'cult',c:'#1e1e24',c2:'#0e0e12',e:'#c8d0e8'},
 '冻息叶':{a:'flyer',k:'bee',c:'#d8eef8',c2:'#8ab0c8',e:'#ffffff'},
 '晏枢':{a:'human',k:'cult',c:'#8a8a86',c2:'#4e4e4a',e:'#e8f0ff'},
 '盲鳗':{a:'fish',k:'serpent',c:'#b8b8ae',c2:'#6a6a62',e:'#e8e8e0'},
 '盐壳螯':{a:'crab',c:'#d8d2c2',c2:'#8a8270',e:'#ffffff'},
 '负碑鼋':{a:'crab',c:'#5a6a5a',c2:'#3a4436',e:'#e8f0ff',spikes:1,big:1},
 '寄焰藤':{a:'worm',k:'vine',c:'#c8c2b0',c2:'#7a6e58',e:'#ff8a3a'},
 '护炉架':{a:'human',k:'golem',c:'#7a4a32',c2:'#4a2e20',e:'#ffb03a'},
 '晶背蛾':{a:'flyer',k:'bee',c:'#cfe6f0',c2:'#7a98a8',e:'#bff4ff'},
 '晶翼':{a:'flyer',k:'manta',c:'#9aa4a8',c2:'#5a6268',e:'#bff4ff'},
 '岩鬃獾':{a:'beast',c:'#6a5a4a',c2:'#3e342a',e:'#ffcf4a',spikes:1},
 '晶背兽':{a:'beast',c:'#8a9aa0',c2:'#4e5a60',e:'#bff4ff'},
 '衡渡':{a:'human',k:'cult',c:'#3a4048',c2:'#22262c',e:'#e8d8a0'},
 '镜中错影':{a:'human',k:'shadow',c:'#a8c8d8',c2:'#5a7888',e:'#ffffff'},
 '孟确':{a:'human',k:'cult',c:'#4a2a2a',c2:'#2a1818',e:'#ff8a3a'},
 '蒙面人':{a:'human',k:'cult',c:'#2a2e2a',c2:'#181a18',e:'#ffd070',mask:1}
});

/* ================= 分阶段引导：新东西一样一样开 ================= */
const FEATS=[
 {k:'retreat',c:()=>S.seen.includes('mock'),t:'「修炼」页可以闭关、歇息。闭关省事但慢；历练最快，也最花力气。'},
 {k:'sweep',c:()=>S.bossDown.length>0,t:'打败过首领的地方可以「扫荡」：每遍三天，扫得太勤妖兽会变少。'},
 {k:'bond',c:()=>S.seen.includes('v1_caravan'),t:'「卷宗」里有缘分：闲聊、送礼、剧情选择都会改变好感。'},
 {k:'jade',c:()=>F('dongtian'),t:'「玉简」开了：温养法器要花日子，出门历练时它也在走。'},
 {k:'jh',c:()=>S.seen.includes('v2_1'),t:'「江湖」开了：世上不止青石站，各处的人和事都在这里。'},
 {k:'clan',c:()=>!!S.clan,t:'「行社」开了：招人、修建、派人出门，都按日子算。'},
 {k:'cause',c:()=>causeOf().length>=2,t:'「卷宗」底下有因果录：你做过的选择，后面都会被记得。'}
];
function featCheck(){if(!S.started||SC||BT||!OV_FREE())return;for(const f of FEATS){if(S.flags['ft_'+f.k])continue;let ok=false;try{ok=f.c();}catch(e){}if(ok){S.flags['ft_'+f.k]=1;toast('新：'+f.t);return;}}}
/* 备份提醒：每走完一卷、或者很久没导出时 */
function backupNag(){if(!S.started)return;const d=daysAll(),last=S.expD??-1,ch=S.seen.length;
 if(ch-(S.expCh||0)>=12&&d-last>=30&&!S.flags['bk_'+Math.floor(ch/12)]){S.flags['bk_'+Math.floor(ch/12)]=1;toast('走了不少路了。导出一份存档码，换设备、清缓存都不怕。','备份',()=>{openSaves();});}}
setInterval(()=>{try{featCheck();backupNag();}catch(e){}},4000);
