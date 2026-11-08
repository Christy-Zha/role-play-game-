/* ================= 委托 =================
 obj.type：kill 斩某种妖 / killz 在某区斩妖 / node 探索时找到某处 / run 走完某区探索 / fight 迎战 / ev 接下立刻发生 */
const NPCS={
 tie:{name:'铁叔',unlock:()=>true},
 he:{name:'阿禾',unlock:()=>S.seen.includes('ahe')},
 mo:{name:'墨老',unlock:()=>true},
 hong:{name:'红姐',unlock:()=>S.seen.includes('caravan')},
 zero:{name:'零号',unlock:()=>F('zeroSaved')&&S.seen.includes('zero')},
 zhou:{name:'周烈',unlock:()=>F('zhouSaved')}
};
const QUESTS=[
 {id:'tie1',npc:'tie',title:'通风口的老鼠',desc:'清理通风口附近的变异鼠',unlock:()=>true,obj:{type:'kill',mob:'变异鼠',n:5},
  offer:'{name}，帮个忙。通风口那边的变异鼠越来越多，昨晚王家的小子又被咬了一口。',done:'干得好。这是站里凑的，别嫌少。',reward:()=>gS(60,true)+rep('station',1)},
 {id:'tie2',npc:'tie',title:'堵住的水阀',desc:'探索废弃地铁站，找到总水阀',unlock:()=>qDone('tie1')&&S.stage>=3,obj:{type:'node',z:0,g:'阀',ev:'q_valve'},
  offer:'隧道深处的总水阀被什么东西堵死了，站里的水箱只够撑三天。你去地铁站深处探探路。',done:'水来了！孩子们今晚能洗个热水澡了。',reward:()=>gPill(1)+rep('station',1)},
 {id:'he1',npc:'he',title:'妈妈的书包',desc:'探索废弃地铁站，找到阿禾妈妈的书包',unlock:()=>S.seen.includes('ahe'),obj:{type:'node',z:0,g:'包',ev:'q_bag'},
  offer:'{bro}，你下隧道的时候……能帮我找找妈妈的书包吗？她走的那天背着一个蓝色的书包，上面挂着一只小熊。',done:'这是妈妈的字……她说她去了北边。{bro}，北边是哪里？',reward:()=>kar(1)+rep('station',1)},
 {id:'he2',npc:'he',title:'高架上的记号',desc:'探索锈蚀高架，顺着地图找线索',unlock:()=>qDone('he1')&&zoneUnlocked(1),obj:{type:'node',z:1,g:'记',ev:'q_mark'},
  offer:'妈妈的地图上，把高架圈起来了。{bro}，你能去看看吗？我不怕的，你告诉我实话就好。',done:'白旗……{bro}，妈妈是不是被坏人抓走了？',reward:()=>gQP(1)},
 {id:'he3',npc:'he',title:'白旗船',desc:'探索沉没港口，把李婶带回来',unlock:()=>qDone('he2')&&zoneUnlocked(3),obj:{type:'node',z:3,g:'船',ev:'q_ship'},
  offer:'{bro}……把妈妈带回来，好不好？',done:'妈妈！……{bro}，谢谢你。谢谢你。',reward:()=>kar(1)+pop(1)+rep('station',2)+gPill(1)},
 {id:'tie3',npc:'tie',title:'尸潮',desc:'守住青石站',unlock:()=>qDone('tie2')&&S.bossDown.includes(1),obj:{type:'fight',foe:{look:'尸傀修士',name:'尸潮',m:2.2}},
  offer:'北边的哨兵回报，有一大群尸傀正往站里来。能打的，就你一个。',done:'青石站……守住了。今晚，大家都在念你的名字。',reward:()=>gItem(2)+rep('station',2)+pop(6)},
 {id:'hong1',npc:'hong',title:'护送车队',desc:'走完一趟锈蚀高架的探索',unlock:()=>S.seen.includes('caravan'),obj:{type:'run',z:1},
  offer:'我的车队要过高架去东边，路上不太平。你走在前面开路，走到头，这趟的抽成算你一份。',done:'痛快！以后你就是红鹞的自己人了。',reward:()=>gS(zsAt(1,12),true)+rep('caravan',2)},
 {id:'hong2',npc:'hong',title:'海货',desc:'在沉没港口斩妖 12 只',unlock:()=>qDone('hong1')&&zoneUnlocked(3),obj:{type:'killz',z:3,n:12},
  offer:'港口那边的鬼面蟹壳、雾鲨牙，东边的人抢着要。给我弄一批来。',done:'好货！这件鲛绡衣是我压箱底的，送你了。',reward:()=>gItemNamed('a',2,'鲛绡衣',3)+rep('caravan',1)},
 {id:'hong3',npc:'hong',title:'天穹的箱子',desc:'探索坠星研究所，打开天穹会的货箱',unlock:()=>qDone('hong2')&&zoneUnlocked(4),obj:{type:'node',z:4,g:'箱',ev:'q_crate'},
  offer:'天穹会往研究所运了一批箱子，守得很严。我不要多，打开看看是什么就行。',done:()=>F('crateHong')?'……这些是人的灵根？我会查清楚是谁卖给他们的。':F('crateBurn')?'烧了？也好。有些钱，红鹞不赚。':'你自己吸了？……我什么都没看见。',reward:()=>rep('caravan',F('crateHong')?2:0)+gS(zsAt(4,6),true)},
 {id:'mo1',npc:'mo',title:'太一观',desc:'探索旧城妖林，找到太一观藏经阁',unlock:()=>S.seen.includes('locust'),obj:{type:'node',z:2,g:'观',ev:'q_taiyi'},
  offer:'娃娃，帮老夫个忙。太一观的藏经阁，应该还埋在妖林底下。那里有一卷老夫当年写的东西。',done:'……字还是那么丑。拿去吧，这是太一观的吐纳心法，比你现在练的那套强。',reward:()=>{flag('taiyi');return '领悟「太一吐纳」：吐纳速度永久 +25%。';}},
 {id:'mo2',npc:'mo',title:'师兄的剑',desc:'探索天坑，取回玄霜剑',unlock:()=>S.seen.includes('fallen'),obj:{type:'node',z:5,g:'剑',ev:'q_sword'},
  offer:'师兄的剑，应该还插在天坑底下。……你把它拿回来吧，别让天穹会的人拿去。',done:'玄霜剑。三百年了，还是这么冷。……它现在是你的了。',reward:()=>gItemNamed('w',3,'玄霜剑',6)},
 {id:'zero1',npc:'zero',title:'第一个名字',desc:'给零号起一个名字',unlock:()=>NPCS.zero.unlock(),obj:{type:'ev',ev:'q_name'},
  offer:'{name}。我想要一个名字。零号不是名字，是编号。',done:()=>'我叫'+(S.flags.zeroName||'零')+'。……我会一直记住的。',reward:()=>gPill(2)},
 {id:'zhou1',npc:'zhou',title:'火种',desc:'斩杀赤焰狼 6 只，取火核',unlock:()=>NPCS.zhou.unlock(),obj:{type:'kill',mob:'赤焰狼',n:6},
  offer:'……拾荒的。我的火灵根烧坏了。赤焰狼的火核，也许能把它重新点起来。我现在这样，自己去不了。',done:'火，又有了。……这个给你，算我还你的。',reward:()=>gItemNamed('j',3,'火种',5)+kar(1)}
];
const QEV={
 q_valve:{title:'总水阀',g:'阀',lines:['总水阀被一团半透明的东西裹住了。那是一窝污水蛭的卵，每一颗都在轻轻跳动。','卵窝后面，有什么大家伙在水里翻了个身。'],
  choices:[
   {t:'用灵气把卵窝烧干净',act:()=>'灵火舔过卵窝，发出噼啪的声音。阀门露了出来，你用力一拧，水声哗哗地响了。'+gQi(-.25)},
   {t:'一剑劈开',act:()=>({text:'卵窝裂开，水里的大家伙冲了出来！',fight:{look:'污水蛭',name:'污水蛭母',m:1.7,boss:true,after:()=>'你拧开了阀门。水声哗哗地响了。'}})}
  ]},
 q_bag:{title:'蓝色书包',g:'包',lines:['一辆翻倒的手推车下面，压着一个蓝色的书包。挂着的小熊已经发黑了。','书包里有一盒没拆封的退烧药，一张写着“禾禾七岁生日”的纸条，还有一张地图。地图上，北边的高架被红笔圈了起来。'],
  choices:[{t:'把书包擦干净，带回去',act:()=>'你把书包背在身上。它很轻，却好像比你的剑还沉。'}]},
 q_mark:{title:'桥墩上的红漆',g:'记',lines:['一根桥墩上，有人用红漆画了个箭头，旁边写着四个字：秀兰到此。','箭头指着的地方，是一摊干了的血迹，和一面撕碎的白旗。旗上绣着一只眼睛。'],
  choices:[
   {t:'把白旗收起来，带给阿禾看',act:()=>'你把碎旗叠好。你不知道该怎么跟一个七岁的孩子说这件事。'},
   {t:'把白旗烧掉，只告诉阿禾“找到了线索”',act:()=>{kar(1);return '火光里，那只眼睛慢慢卷了起来。有些东西，等她长大一点再知道吧。';}}
  ]},
 q_ship:{title:'渔棚',g:'船',lines:[()=>F('freed')?'码头边的一间渔棚里，一个女人正对着海发呆。她手腕上的烙印还没好。':'白旗船又靠岸了。透过舷窗，你看见船舱最里面锁着一个女人，手腕上烙着编号。',()=>F('freed')?'她看见你背着的蓝书包，一下子站了起来：“这是……禾禾的书包？”':'她在小声地哼一首儿歌。阿禾也会唱这首。'],
  choices:[
   {t:'「阿禾在等你。」',need:()=>F('freed'),act:()=>{flag('momHome');return '李婶捂住嘴，哭得说不出话。你们走回青石站的那天，阿禾在站台上跑丢了一只鞋。';}},
   {t:'杀进船舱',need:()=>!F('freed'),act:()=>({text:'你踹开了舱门。白袍人拔出了刀。',fight:{look:'天穹追兵',name:'押船的天穹弟子',m:1.6,boss:true,after:()=>{flag('momHome');kar(1);return '你砍断了锁链。李婶看见你背着的蓝书包，哭了出来。';}}})}
  ]},
 q_crate:{title:'天穹的货箱',g:'箱',lines:['你撬开了箱子。里面是一排排玻璃管，管里泡着发光的根须。','每根管子上都贴着标签：姓名，年龄，灵根属性。你认出了几个青石站失踪的人的名字。'],
  choices:[
   {t:'交给红姐，让她查是谁在卖',act:()=>{flag('crateHong');rep('caravan',2);return '你把箱子封好。红姐会知道该怎么做。';}},
   {t:'自己吸收',act:()=>{flag('crateSelf');kar(-2);return '灵根化进你的经脉，你听见了很多人的声音。'+gQi(1);}},
   {t:'全部销毁',act:()=>{flag('crateBurn');kar(2);rep('tq',-2);return '你一根一根地把灵根烧了。光点飘起来，往很远的地方飞去，像是在回家。';}}
  ]},
 q_taiyi:{title:'藏经阁',g:'观',spk:'mo',lines:['树根缠着半截石殿。殿里的书架早就烂了，只有一个铁匣子完好无损。','匣子上刻着一个“墨”字。里面是一卷竹简，和一支小小的木簪。'],
  choices:[
   {t:'「木簪是谁的？」',act:()=>'墨老很久没有说话。“……是师兄送我的。那年我十二岁，头发总是散着。”'},
   {t:'收好竹简',act:()=>'竹简上的字迹歪歪扭扭，和墨老说话时一样絮叨。'}
  ]},
 q_sword:{title:'玄霜剑',g:'剑',lines:['坑底一块赤红的岩石上，插着一柄剑。剑身结着白霜，在这样的热浪里都没有化。','剑的四周，跪着一圈尸傀。听到你的脚步，它们齐齐抬起了头。'],
  choices:[{t:'拔剑',act:()=>({text:'尸傀站了起来。',fight:{look:'尸傀修士',name:'守剑尸傀',m:2,boss:true,after:()=>'你握住剑柄。白霜顺着你的手臂爬上来，又慢慢退去。剑认了你。'}})}]},
 q_name:{title:'名字',g:'名',spk:'zero',lines:['零号坐在红姐的卡车顶上，看着天。','“名字是什么感觉？”她问。“被人叫的时候，会不一样吗？”'],
  choices:[
   {t:'「小雨。你说过想知道雨的味道。」',act:()=>{S.flags.zeroName='小雨';return '“小雨。”她重复了一遍，又一遍。“……下雨的时候，我就会想起你。”';}},
   {t:'「白露。秋天的第一场露水。」',act:()=>{S.flags.zeroName='白露';return '“白露。”她低头笑了一下。你第一次看见她笑。';}},
   {t:'「零。不是编号，是重新开始。」',act:()=>{S.flags.zeroName='零';return '“零。”她想了想，“那就从零开始。”';}}
  ]}
};
Object.assign(EVENTS,QEV);
const NPC_IDLE={
 tie:[()=>'站里现在有 '+S.pop+' 个人，'+S.pop+' 张嘴。我每天睡前都要数一遍。',()=>'你小子……现在是仙师了。可在我这儿，你还是那个背土豆回来的。',()=>F('guoJoined')?'老郭回来了，天天跟我抢着修发电机。三十年的老毛病。':'站里新来了几户人家，挤是挤了点，总比外面强。'],
 he:[()=>F('momHome')?'妈妈今天给我梳头了！她说我的头发长长了好多。':'{bro}，你看我能感觉到灵气了吗？……好像还没有。',()=>F('guoJoined')?'我今天帮郭爷爷修矿灯了！':'铁叔说我是站里最勇敢的小孩。',()=>'妈妈说，下雨的时候不能抬头看天。'],
 mo:[()=>'修行没有捷径。……好吧，洞天算半条。',()=>'老夫当年也像你这么拼。后来就只剩一缕魂了。',()=>'别老盯着境界看。境界是给人看的，道心才是自己的。'],
 hong:[()=>'生意难做，人更难做。',()=>'你这身行头该换换了。我这儿有好东西，就是不便宜。',()=>'青石站的人，比东边的人实在。'],
 zero:[()=>'红姐教我算账了。我从来不会算错。',()=>'今天下雨了。是淡的，不是咸的。'],
 zhou:[()=>'……别看我。我在烧火。',()=>'那些小鬼很吵。……也不讨厌。']
};
