/* ================= 新人物、委托、奇遇 ================= */
const betBtn=(b,lv)=>({t:`比点数 · 押 ${fmt(b)} 灵石`,fn:()=>{if(S.stones<b){toast('灵石不够','bad');return;}S.stones-=b;openMini('duel',{lv,title:'和钱三比点数',onDone:w=>{if(w){S.stones+=b*2;toast('赢了！灵石 +'+fmt(b*2),'big');}else toast('输了 '+fmt(b)+' 灵石。钱三笑出了金牙。');live();save();}});}});
Object.assign(NPCS,{
 shen:{name:'沈棋',unlock:()=>F('metShen'),menu:()=>[{t:'对弈 · 初阶',fn:()=>playFor('gomoku',1,'与沈棋对弈 · 初阶')},{t:'对弈 · 中阶（奖励翻三倍）',fn:()=>playFor('gomoku',2,'与沈棋对弈 · 中阶')},{t:'对弈 · 高阶（奖励最丰厚）',cls:'gold',fn:()=>playFor('gomoku',3,'与沈棋对弈 · 高阶')}]},
 qian:{name:'钱三',unlock:()=>F('metQian'),menu:()=>{const z=maxZone();return [{t:'押大小',fn:()=>openMini('sicbo',{title:'钱三的骰子局',stakes:[zsAt(z,1),zsAt(z,3),zsAt(z,8)],onDone:()=>{live();save();}})},betBtn(zsAt(z,3),qDone('qian2')?1:2)];}},
 man:{name:'林小满',unlock:()=>S.seen.includes('xiaoman'),menu:()=>[{t:'陪小满玩翻牌',fn:()=>playFor('memory',2,'和小满比记性')},{t:'小满出的难题（高阶）',fn:()=>playFor('memory',3,'小满的难题')}]},
 gui:{name:'鬼手',unlock:()=>F('metGui'),menu:()=>[{t:'看看货',cls:'gold',fn:()=>guiShop()},{t:'玩一把三匣',fn:()=>{const c=zsAt(maxZone(),3);if(S.stones<c){toast('一把要 '+fmt(c)+' 灵石','bad');return;}S.stones-=c;playFor('boxes',1,'鬼手的三匣 · '+fmt(c)+' 灵石一把');}}]},
 su:{name:'苏绾',unlock:()=>F('feisheng')}
});
Object.assign(NPC_IDLE,{
 shen:[()=>'下棋和打架一样。最怕的不是对手强，是自己急。',()=>'我教过的孩子里，最好的那个……算了，不提他。',()=>'五子棋，先手占优。可先手的人，也最容易贪。'],
 qian:[()=>'仙师，我跟您说，骰子这东西有灵性的。……真的。',()=>'我戒了。……这把不算。',()=>F('qianLost')?'上回输给您，我回去琢磨了一宿。您那手法，没法学。':'下回您再来，我让您三点。'],
 man:[()=>'{bro}，墨爷爷今天又在玉简里打呼噜了。',()=>'我晚上做梦，梦见天上有好多好多眼睛。',()=>'阿禾姐姐教我认字了！我会写“满”了！'],
 gui:[()=>'今天的货，明天就没了。',()=>'别问我从哪儿进的货。问了，价钱翻倍。',()=>'你身上的玉简……卖不卖？开个玩笑。'],
 su:[()=>'这颗星上的人，吃饭会一起吃。我们那里……已经没有人一起吃饭了。',()=>'牧者不吃人。它只吃人修出来的东西。所以它从来不急。',()=>'那个孩子，小满，眼睛像我妹妹。']
});
QUESTS.push(
 {id:'shen1',npc:'shen',title:'残谱',desc:'在旧城妖林找回沈棋的棋谱',unlock:()=>maxZone()>=2,obj:{type:'node',z:2,g:'谱',ev:'q_qipu'},
  offer:'我年轻时抄过一本残谱，灵潮那天丢在了人民公园的凉亭里。……那里现在是妖林了吧。',done:'就是它。墨迹还在，人却老了。',reward:()=>gQi(.4)+gGem('a',2)},
 {id:'shen2',npc:'shen',title:'棋逢对手',desc:'赢下沈棋一盘中阶五子棋',unlock:()=>qDone('shen1'),obj:{type:'game',g:'gomoku',lv:2},
  offer:'这一盘，按中阶下。赢了，我教你一点真东西。',done:'你开始懂“势”了。下棋如此，修行也如此。',reward:()=>gBook('julingp')+gQi(.3)},
 {id:'shen3',npc:'shen',title:'最后一局',desc:'赢下沈棋一盘高阶五子棋',unlock:()=>S.seen.includes('canju')&&!F('shenWin'),obj:{type:'game',g:'gomoku',lv:3},
  offer:'再来。还是高阶。',done:'老头子输得心服口服。这本《天外飞仙》，归你了。',reward:()=>{S.flags.shenWin=1;return gBook('feixian');}},
 {id:'qian1',npc:'qian',title:'赌债',desc:'帮钱三了结一笔赌债',unlock:()=>maxZone()>=2,obj:{type:'ev',ev:'q_debt'},
  offer:'仙师……救命。鬼市的人来讨债了，就在外头。我、我欠了他们一大笔。',done:'您……您真帮我了了？钱三这辈子没欠过这么大的人情。',reward:()=>kar(1)+gS(zsAt(maxZone(),3))},
 {id:'qian2',npc:'qian',title:'长命锁',desc:'在沉没港口找到钱三押出去的长命锁',unlock:()=>qDone('qian1')&&maxZone()>=3,obj:{type:'node',z:3,g:'锁',ev:'q_lock'},
  offer:'我当年把闺女的长命锁押给了雾港的当铺。后来当铺沉了，闺女……也没了。我就想再看它一眼。',done:'……这是她满月那天戴的。仙师，钱三这条命归您了。我戒赌，这回是真的。',reward:()=>kar(1)+rep('station',1)},
 {id:'man1',npc:'man',title:'灵目',desc:'和小满玩一局翻牌',unlock:()=>true,obj:{type:'game',g:'memory',lv:1},
  offer:'{bro}，墨爷爷说我眼睛好，记性也好。我们来比翻牌吧！',done:'嘿嘿，{bro}也好厉害！',reward:()=>gQi(.3)+kar(1)},
 {id:'man2',npc:'man',title:'会飞的鱼',desc:'去沉没港口找小满梦里的那条鱼',unlock:()=>qDone('man1')&&maxZone()>=3,obj:{type:'node',z:3,g:'鱼',ev:'q_fish'},
  offer:'我梦见港口有一条会飞的鱼。它说它认识我妈妈。',done:'它说……我妈妈在天上。{bro}，天上是哪里？',reward:()=>gGem('h',3)+flag('manDream')},
 {id:'man3',npc:'man',title:'星图',desc:'在星海残域找到小满家乡的星图',unlock:()=>F('manOrigin'),obj:{type:'node',z:8,g:'图',ev:'q_xingtu'},
  offer:'{bro}，我想知道我是从哪里来的。苏绾姐姐说，星海里有一张图。',done:'原来……我家在那么远的地方。我不哭。我现在的家，在这里。',reward:()=>gBook('xingchen')+kar(1)},
 {id:'cm1',npc:'tie',title:'地牢',desc:'去天坑救出陈默的妹妹',unlock:()=>F('chenmoStay')&&maxZone()>=5,obj:{type:'node',z:5,g:'牢',ev:'q_jail'},
  offer:'陈默那孩子，这几天一句话没说。他妹妹关在天坑东边的地牢里。{name}，帮帮他。',done:'人救回来了。陈默说，这条命以后是行社的。',reward:()=>{if(S.clan)S.clan.fame+=10;return gS(zsAt(5,5))+' 行社声望 +10。';}},
 {id:'gui1',npc:'gui',title:'雾鲨鳍',desc:'斩杀雾鲨 5 只',unlock:()=>true,obj:{type:'kill',mob:'雾鲨',n:5},
  offer:'有个客人要五片雾鲨鳍。你去，我付宝石。',done:'成色不错。说好的，宝石。',reward:()=>gGem(null,3)+gGem(null,2)},
 {id:'su1',npc:'su',title:'她的故乡',desc:'在天庭遗迹找到苏绾故乡的遗物',unlock:()=>maxZone()>=9,obj:{type:'node',z:9,g:'乡',ev:'q_suhome'},
  offer:'天庭的台阶下面，压着我故乡的一块碑。我一个人……不敢去看。',done:'谢谢。我以为我早就不会哭了。',reward:()=>gBook('guiyuan')+kar(1)},
 {id:'su2',npc:'su',title:'闭眼',desc:'斩杀牧者之眼 8 只',unlock:()=>maxZone()>=10,obj:{type:'kill',mob:'牧者之眼',n:8},
  offer:'归墟里那些眼睛，每一只都在数羊。去，让它们少数几只。',done:'它们会记住你的。……这是好事，也是坏事。',reward:()=>gGem('c',5)}
);
Object.assign(EVENTS,{
 q_qipu:{title:'凉亭',g:'谱',spk:'shen',lines:['藤蔓把凉亭缠成了一只绿色的茧。石桌上，一本泛黄的本子被压在一枚黑子下面。','本子的封皮上写着：《残局百解》·沈。'],
  choices:[{t:'收好残谱',act:()=>'你把残谱揣进怀里。凉亭外，有什么东西在藤蔓里窸窣作响。'+gQi(.1)}]},
 q_debt:{title:'讨债',g:'债',lines:['两个黑衣人把钱三堵在站台东头。领头的那个脸上有道疤，手里掂着一把刀。','“钱三，鬼市的账，拖了三年了。今天要么还钱，要么还手。”'],
  choices:[
   {t:()=>`替他还（${fmt(zsAt(maxZone(),4))} 灵石）`,need:()=>S.stones>=zsAt(maxZone(),4),act:()=>{S.stones-=zsAt(maxZone(),4);return '你把灵石扔了过去。疤脸掂了掂，咧嘴一笑：“仙师爽快。”他们走了。钱三在你身后，抖得像一片叶子。';}},
   {t:'跟债主赌一把：比点数，赢了一笔勾销',act:()=>({game:{k:'duel',lv:2,title:'和疤脸赌债',onWin:()=>'疤脸盯着骰子看了半天，把欠条撕了。“行，算你狠。”',onLose:()=>{const c=Math.min(S.stones,zsAt(maxZone(),6));S.stones-=c;return '你输了。疤脸收走了 '+fmt(c)+' 灵石，加倍。钱三的债，算是了了，只是是你替他付的。';}}})},
   {t:'把他们打出去',act:()=>({text:'疤脸冷笑一声，拔出了刀。',fight:{look:'黑市打手',name:'鬼市疤脸',m:1.6}})}
  ]},
 q_lock:{title:'沉没的当铺',g:'锁',lines:['当铺的招牌斜插在淤泥里。柜台后面的保险柜被撬开过，又被海水灌满。','你在一堆烂掉的票据里，摸到一枚冰凉的小东西。银子打的长命锁，正面刻着“岁岁平安”。'],
  choices:[{t:'带回去给钱三',act:()=>'你把长命锁擦干净，用布包好。'+kar(1)}]},
 q_fish:{title:'会飞的鱼',g:'鱼',spk:'man',lines:['雾里真的有一条鱼在飞。鳞片是半透明的，像一块浮在空中的玻璃。','它绕着你转了三圈，停在你面前。你听见一个声音，直接响在脑子里：“告诉那个孩子……她的妈妈，在天上看着她。”'],
  choices:[{t:'伸手去碰它',act:()=>'你的指尖碰到它的一瞬间，它化成了一颗碧绿的晶石。'+gQi(.2)},{t:'问它“天上”是哪里',act:()=>'鱼没有回答。它朝天上游去，一直游进了云里。'+gQi(.3)}]},
 q_jail:{title:'天穹地牢',g:'牢',lines:['地牢的入口藏在一块焦黑的岩石后面。两个白衣守卫靠在墙边打盹。','往里走，铁笼子一个挨一个。最里面那个笼子里，一个瘦小的女孩抱着膝盖，抬头看你。'],
  choices:[{t:'杀进去',act:()=>({text:'守卫惊醒了。整座地牢的灯一起亮了起来。',fight:{look:'天穹追兵',name:'地牢看守',m:2,boss:true}})},
   {t:'悄悄撬锁',act:()=>chance(.5)?'锁开了。你背起女孩，从守卫身边溜了出去。'+kar(1):({text:'锁“咔嗒”一声。守卫睁开了眼睛。',fight:{look:'天穹追兵',name:'地牢看守',m:2.2,boss:true}})}]},
 q_xingtu:{title:'星图',g:'图',spk:'man',lines:['一块碎星上，刻满了发光的线。线连着点，点连着更多的线。','在星图的一个角落，有一个小小的手印。和小满掌心的胎记一样。'],
  choices:[{t:'把星图拓下来',act:()=>'你用灵力把星图拓在一张薄绢上。碎星上的光，慢慢暗了下去。'+gQi(.2)}]},
 q_suhome:{title:'故乡的碑',g:'乡',spk:'su',lines:['台阶下面压着一块黑色的碑。碑上的字你不认识，可你看得懂碑顶刻着的东西——一只眼睛，被一把剑劈成了两半。'],
  choices:[{t:'把碑扶起来',act:()=>'碑很沉。你把它扶正的时候，碑底下滚出来一枚小小的玉簪。'+gQi(.2)+kar(1)}]},
 gamble_den:{title:'地下赌坊',g:'赌',zones:[0,1,3,5],lines:['一扇生锈的卷帘门后面，灯火通明。几十个人围着一张桌子，骰盅摇得哗哗响。','庄家抬头看了你一眼：“生面孔。玩两把？”'],
  choices:[
   {t:'押大小',act:()=>({game:{k:'sicbo',title:'地下赌坊',stake:1,onWin:()=>'你揣着赢来的灵石走出了赌坊。身后有人在骂娘。',onLose:()=>'你走出赌坊的时候，口袋轻了不少。'}})},
   {t:()=>`和庄家单挑比点数（押 ${fmt(zs(4))}）`,need:()=>S.stones>=zs(4),act:()=>{const b=zs(4);S.stones-=b;return {game:{k:'duel',lv:2,title:'和庄家单挑',onWin:()=>'庄家脸色铁青。'+gS(b*2),onLose:()=>'庄家笑眯眯地收走了你的灵石。'}};}},
   {t:'掀了他的桌子',act:()=>{kar(-1);return {text:'桌子翻了。打手们从四面八方围了上来。',fight:{look:'黑市打手',name:'赌坊打手',m:1.4}};}},
   {t:'转身离开',act:()=>'赌坊的喧哗被关在了卷帘门后面。'}
  ]},
 three_box:{title:'三只匣子',g:'匣',zones:'any',lines:['路边摆着三只一模一样的木匣子。旁边坐着一个戴斗笠的人，一言不发。','地上用炭写着一行字：“三选一，不收钱。”'],
  choices:[{t:'挑一只',act:()=>({game:{k:'boxes',title:'三只匣子',onWin:()=>{EVZ=maxZone();return '匣子里躺着'+(chance(.5)?gGem(null,gemTierFor(EVZ)+1):gItem(rollRar(true))).replace(/^ 获得 /,'');},onLose:()=>chance(.3)?{text:'匣子是空的。斗笠人站了起来——那根本不是人。',fight:{look:'宝箱怪',name:'匣中妖',m:1.6}}:'匣子是空的。再抬头，斗笠人已经不见了。'}})},
   {t:'不碰',act:()=>'你走远了才回头。路边什么都没有，连匣子都不见了。'}]},
 chess_ghost:{title:'棋鬼',g:'棋',zones:[2,5,6,9],lines:['一张石桌，一盘没下完的棋。对面坐着一个半透明的老人，指了指你面前的空位。','“陪老鬼下一盘。赢了，有赏；输了……留下一点灵气就好。”'],
  choices:[
   {t:'下初阶',act:()=>({game:{k:'gomoku',lv:1,title:'棋鬼 · 初阶',onWin:()=>'老鬼点点头。'+gQi(.15)+gS(zs(2)),onLose:()=>'老鬼伸手在你额头一点。'+gQi(-.08)}})},
   {t:'下中阶',act:()=>({game:{k:'gomoku',lv:2,title:'棋鬼 · 中阶',onWin:()=>'老鬼笑了。'+gQi(.35)+gGem(null,gemTierFor(EVZ)),onLose:()=>'老鬼伸手在你额头一点。'+gQi(-.15)}})},
   {t:'下高阶',act:()=>({game:{k:'gomoku',lv:3,title:'棋鬼 · 高阶',onWin:()=>'老鬼愣了很久，然后对你行了一个礼。'+gQi(.6)+gBook(),onLose:()=>'老鬼伸手在你额头一点。'+gQi(-.25)}})},
   {t:'不下',act:()=>'老鬼叹了口气，连同石桌一起淡去了。'}
  ]},
 memory_stele:{title:'记忆石碑',g:'碑',zones:[1,4,6,8,9],lines:['一块石碑上刻着许多符号。你一靠近，符号就一个接一个地翻了过去，背面朝外。','碑底有一行小字：“记得住的人，才配拿走。”'],
  choices:[{t:'试一试',act:()=>({game:{k:'memory',lv:2,title:'记忆石碑',onWin:()=>'石碑裂开，里面藏着一个小匣子。'+(chance(.4)?gBook():gGem(null,gemTierFor(EVZ)))+gQi(.15),onLose:()=>'符号重新翻了回来。石碑上多了一道裂痕，再也翻不动了。'}})},
   {t:'走开',act:()=>'你记性不好，你知道。'}]},
 jianke:{title:'无名剑客',g:'剑',zones:'any',need:()=>maxZone()>=2,lines:['一个白发的剑客坐在路中间，膝上横着一把没有鞘的剑。','“你就是那个拿着玉简的人？”他没睁眼，“拔剑。让我看看你配不配。”'],
  choices:[
   {t:'拔剑',act:()=>({text:'剑客睁开眼睛的那一瞬间，你才明白——他比这一片所有的妖兽加起来都强。',fight:{look:'无名剑客',name:'无名剑客',m:3.2,boss:true,z:Math.min(10,ZORD[Math.min(ZORD.length-1,ZORD.indexOf(maxZone())+1)]),after:()=>{S.flags.beatJianke=(S.flags.beatJianke||0)+1;return '剑客收剑：“不错。这个，是你的了。”'+gBook()+gGem('c',gemTierFor(maxZone())+1);}}})},
   {t:'行礼，问他的名字',act:()=>'“名字？早忘了。”他起身，从你身边走过。“你的剑太干净。等它脏了，再来找我。”'+gQi(.2)},
   {t:'绕路',act:()=>'你绕了很远的路。回头时，他还坐在那里，像一块石头。'}
  ]},
 lost_kid:{title:'迷路的少年',g:'童',zones:'any',need:()=>!!S.clan,lines:['一个十来岁的少年蹲在废墟里，手里攥着半块发霉的饼。','他看见你身上的剑，眼睛亮了：“你是修仙的吗？能……能带我走吗？”'],
  choices:[{t:'带他回行社',act:()=>{const m=clRecruit(true);return m?'少年说他叫'+m.name+'。他一路上都在问修仙是不是能飞。':'祠堂住不下了。你把他送到了青石站，托铁叔照顾。'+kar(1);}},
   {t:'给他一些灵石',act:()=>{S.stones=Math.max(0,S.stones-zs(1));return '他攥着灵石，朝你磕了个头。'+kar(1);}},{t:'走开',act:()=>'他没有追上来。'}]},
 beggar:{title:'讨饭的老头',g:'丐',zones:'any',once:1,lines:['一个衣衫褴褛的老头靠在墙根，伸出一只破碗。','“小哥，赏口吃的吧。老头子三天没吃饭了。”'],
  choices:[{t:'把干粮全给他',act:()=>{kar(1);S.flags.beggarFed=1;return '老头狼吞虎咽地吃完，抹了抹嘴，忽然在你肩上拍了一下。“好心有好报。”你只觉得一股热流直冲丹田——再看时，墙根已经空了。'+gQi(.6)+gBook();}},
   {t:'丢下一枚灵石',act:()=>'老头看了看灵石，又看了看你，笑了。'+gQi(.1)},{t:'不理',act:()=>{kar(-1);return '你走过去的时候，听见身后一声轻笑。那笑声，一点也不像饿了三天的人。';}}]},
 meteor:{title:'天外陨石',g:'陨',zones:[8,9,10],lines:['一块拳头大的陨石落在你脚边，还在冒烟。里面嵌着一颗晶莹的石头。'],
  choices:[{t:'撬出来',act:()=>chance(.75)?'晶石入手温润。'+gGem(null,gemTierFor(EVZ)+1):{text:'陨石裂开，里面钻出来一条星砂蠕虫！',fight:{look:'星砂蠕虫',name:'陨中虫',m:1.8}}},{t:'踢开',act:()=>'陨石滚进了星海里。'}]},
 whisper:{title:'牧者的低语',g:'语',zones:[8,9,10],lines:['一个声音在你脑子里说话。很温柔，像小时候的母亲。','“为什么要反抗呢？田里的麦子，不也很幸福吗？跪下来，你就能拥有更多。”'],
  choices:[{t:'跪下',act:()=>{kar(-2);return '你跪下了。力量涌进你的身体。你觉得很好。你觉得……很饿。'+gQi(.8);}},{t:'捂住耳朵往前走',act:()=>'声音跟了你很久，最后变成了一声叹息。'+gQi(.2)+kar(1)},{t:'「你也会怕吧？」',act:()=>'声音停了。很久之后，它说：“……有趣。”'+gQi(.35)}]}
});
const IDLE2=['three_box','beggar'];
/* ---------- 鬼手的货 ---------- */
function guiStock(){const day=dayKey()+(new Date().getHours()<12?'a':'b');if(S.guiStock&&S.guiStock.day===day)return S.guiStock.items;const z=maxZone(),items=[];
 const t=Math.min(5,gemTierFor(z)+1);items.push({k:'gem',g:pick(['a','d','h','c'])+t,p:zsAt(z,6*t)});items.push({k:'gem',g:pick(['a','d','h','c'])+Math.max(1,t-1),p:zsAt(z,4*t)});
 const bl=Object.keys(BOOKS).filter(b=>!S.learned.includes(b)&&BOOKS[b].lv<=S.stage+6);if(bl.length)items.push({k:'book',b:pick(bl),p:zsAt(z,25)});
 items.push({k:'item',p:zsAt(z,30)});items.push({k:'box',p:zsAt(z,8)});S.guiStock={day,items};return items;}
function guiShop(){const L=guiStock();const nm=o=>o.sold?'（已售出）':o.k==='gem'?gemName(o.g)+'（'+gemText(o.g)+'）':o.k==='book'?BOOKS[o.b].n:o.k==='item'?'一件仙品装备（三条词条）':'盲盒（什么都可能有）';
 modal(`<h3>鬼手的货</h3><p>今天的货，明天就没了。身上灵石 <b>${fmt(S.stones)}</b></p>`,L.map((o,i)=>({t:nm(o)+(o.sold?'':' · '+fmt(o.p)+' 灵石'),cls:o.k==='box'?'gold':'',fn:()=>{if(o.sold||S.stones<o.p){if(!o.sold)toast('灵石不够','bad');setTimeout(guiShop,30);return;}S.stones-=o.p;S.cnt=S.cnt||{};S.cnt.gui=(S.cnt.gui||0)+1;
  if(o.k!=='box')o.sold=1;EVZ=maxZone();let t='';
  if(o.k==='gem'){S.gems[o.g]=(S.gems[o.g]||0)+1;t='买下 '+gemName(o.g);}else if(o.k==='book')t=gBook(o.b);else if(o.k==='item'){t=pushItem(mkItem(maxZone(),true,{r:3,slot:pick(SLOT5)}));}
  else{const r=Math.random(),z=maxZone();if(r<.05){save();setTimeout(()=>startBattle([mkCustom(z,{look:'宝箱怪',name:'盲盒里的东西',m:2.4,boss:true,after:()=>gGem(null,gemTierFor(z)+1)+gS(zsAt(z,10))})],{noFlee:true}),200);toast('盲盒在你手里动了一下……','bad');return;}
   if(r<.1){const zs2=ZORD.filter(x=>S.bossDown.includes(x)),U=zs2.length?ZONES[pick(zs2)].boss:null,it=U&&mkUnique(U,z);t=it?'盲盒里竟然是传说装备！'+pushItem(it):gS(zsAt(z,20));}
   else if(r<.45)t=gS(zsAt(z,r<.2?20:9));else if(r<.7)t=gGem(null,gemTierFor(z));else if(r<.85)t=gItem(rollRar(true));else if(r<.93)t=gBook();else t='盲盒里只有一张纸条：“谢谢惠顾。”';}
  toast(String(t).trim(),'big');live();save();setTimeout(guiShop,30);}})).concat([{t:'走了',cls:'ghost'}]));}
