/* ================= 主线分支：每个选择都有后果 ================= */
function chOf(id){return STORY.find(c=>c.id===id);}
function choicesOf(id){const ch=chOf(id);if(!ch)return [];const L=ch.lines.find(l=>l&&!Array.isArray(l)&&l.c);return L?L.c:[];}
function tagC(id,arr){const cs=choicesOf(id);arr.forEach((fx,i)=>{if(!cs[i]||!fx)return;const f=cs[i].fx=Object.assign({},cs[i].fx||{});if(fx.flags)f.flags=Object.assign({},f.flags||{},fx.flags);if(fx.aff)f.aff=Object.assign({},f.aff||{},fx.aff);});}
tagC('prologue',[{flags:{proDoubt:1},aff:{mo:-5}},{flags:{proGuard:1},aff:{mo:10,tie:5}},{flags:{proPower:1},aff:{mo:-3}}]);
tagC('mock',[{aff:{zhou:5,tie:5}},{aff:{zhou:10}},{aff:{zhou:-15,tie:-5}}]);
tagC('ahe',[{aff:{he:30,tie:15}},{flags:{heScar:1},aff:{he:-10,tie:-5}}]);
tagC('ratking',[{flags:{rkOk:1},aff:{zhou:5}},{flags:{rkCalm:1},aff:{zhou:10,tie:5}},{flags:{rkExile:1},aff:{zhou:-20}}]);
tagC('caravan',[{aff:{hong:20}},{flags:{hongWary:1},aff:{hong:3}}]);
tagC('exposed',[{flags:{exGuard:1},aff:{tie:10,he:5}},{flags:{exTaunt:1},aff:{zhou:-5}},{flags:{exGreed:1},aff:{zhou:-20,he:-10}}]);
tagC('port',[{aff:{he:20,tie:10}},{flags:{portStones:1},aff:{he:-30}}]);
tagC('zero',[{aff:{zero:30}},{flags:{zeroEaten:1}}]);
tagC('zhoufate',[{aff:{zhou:40}},{flags:{zhouMercy:1}},{flags:{zhouEaten:1}}]);
tagC('fallen',[{flags:{fallStay:1},aff:{mo:20}},{flags:{fallAsk:1},aff:{mo:5}},{flags:{fallTake:1},aff:{mo:-20}}]);
tagC('qiansan',[{aff:{qian:5}},{aff:{qian:-5}},{aff:{qian:15}}]);
tagC('xiaoman',[{aff:{man:30}},{aff:{man:10}}]);
tagC('lizu',[{aff:{tie:5}},{aff:{tie:10}}]);
tagC('neigui',[{aff:{cm:30}},{aff:{cm:-30}},{}]);
tagC('tianting',[{aff:{ning:30}},{aff:{ning:-20}}]);
/* 已有章节里，按之前的选择换台词 */
(()=>{const h=chOf('hunted');if(h){const i=h.lines.findIndex(l=>Array.isArray(l)&&l[0]==='zhou2');h.lines.splice(i+1,0,
 ['',()=>F('exGuard')?'你回头才发现，铁叔带着站里十几个男人，攥着铁棍站在你身后。他们刚才一直没走。':F('exGreed')?'站台上的人都退得远远的。阿禾躲在王婶身后，看你的眼神，像在看刚才那个戴面具的人。':'周烈临走前回头看了你一眼。那一眼里没有恨，只有不服。'],
 {fx:()=>F('exGuard')?{flags:{stationRally:1}}:null},
 ['tie',()=>F('exGuard')?'青石站的人，不是只会躲。':F('exGreed')?'{name}……你刚才那句话，是认真的？':'']);}
 const f=chOf('finale');if(f){const i=f.lines.findIndex(l=>l&&!Array.isArray(l)&&l.c);f.lines.splice(i,0,
 ['mo',()=>F('fallStay')?'娃娃，你说过要陪老夫走完。……那最后这一步，让老夫走在前面。':F('fallTake')?'老夫知道你想要什么。可你要是伸手，老夫拼了这缕残魂，也会拦你。':'选吧。不管你选什么，老夫都认。'],
 ['',()=>S.partner?BOND[S.partner].n+'站在你身后。你没回头，可你知道'+(S.partner==='zhou'||S.partner==='ning'||S.partner==='cm'?'他':'她')+'在。':'']);}
 const g=chOf('guixu');if(g){g.lines=g.lines.map(l=>{if(Array.isArray(l)&&typeof l[1]==='function'&&String(l[1]).includes('宁玄燃尽'))return ['',()=>F('ningDoubt')?(S.partner==='ning'||avOf('ning')>=80?'宁玄燃尽了自己，替你挡下了那一眼。玉简忽然亮了——墨老的残魂裹住了他最后一缕神魂。他没死。':'宁玄燃尽了自己，替你挡下了那一眼。他倒下去的时候，手里攥着一颗白子。'):''];return l;});
  const j=g.lines.findIndex(l=>Array.isArray(l)&&l[1]==='—— 第二卷 完 ——');g.lines.splice(j,0,
  ['',()=>S.partner?'后来，'+BOND[S.partner].n+'一直在你身边。修行的路很长，好在不是一个人走。':(S.sworn||[]).length?'后来，你那些拜过把子的兄弟姐妹，一个都没少。':''],
  ['',()=>F('stationRally')?'青石站的人学会了拿起铁棍。下一次有人来敲门，他们不会再躲。':''],
  ['',()=>F('heRoot')?'阿禾成了第一个由你亲手带出来的筑基修士。':F('heScar')&&!qDone('he_amend')?'阿禾的手到最后也没有完全好。她学会了用左手写字。':'']);
  g.after=()=>{if(F('ningDoubt')&&!(S.partner==='ning'||avOf('ning')>=80))S.flags.ningDead=1;};}
})();
/* ---------- 后果章节 ---------- */
STORY.push(
{id:'motest_a',title:'插曲·墨老的考题',g:'考',bg:'dongtian',cond:()=>F('proDoubt')&&S.seen.includes('dongtian'),hint:'信不信墨老，由你',lines:[
 ['mo','你一开始就不信老夫。很好。'],['mo','信任这东西，空口白话给不了。老夫让你看一段记忆——三百年前的。记得住，你就知道老夫没骗你。'],
 {bg:'forest'},['','你看见一棵小槐树，一座道观，两个年轻的道士在树下下棋。其中一个，眉眼和墨老一模一样。'],
 {game:{k:'memory',lv:1,title:'墨老的记忆',winFx:{aff:{mo:15},book:'changsheng'},loseFx:{aff:{mo:5}},
  win:[['mo','……你都记住了。'],['mo','那是太一观。那个下赢的，是我师兄。这本《长生诀》，是师兄当年送我的。现在给你。']],
  lose:[['mo','记不住也无妨。'],['mo','反正有一天，你会自己走到那棵树下。']]}}
]},
{id:'motest_b',title:'插曲·墨老的考题',g:'考',bg:'dongtian',cond:()=>F('proGuard')&&S.seen.includes('dongtian'),hint:'信不信墨老，由你',lines:[
 ['mo','你说你要护住站里的人。老夫记着呢。'],['mo','护人之前，先得护住自己。这本《长生诀》，太一观的入门功夫，先练着。'],{fx:{book:'changsheng',aff:{mo:5}}},
 ['mo','老夫当年也说过这句话。后来……没护住。'],['@','护住谁？'],['mo','以后再说。好好练。']
]},
{id:'motest_c',title:'插曲·墨老的考题',g:'考',bg:'dongtian',cond:()=>F('proPower')&&S.seen.includes('dongtian'),hint:'信不信墨老，由你',lines:[
 ['mo','你想变强。好，老夫给你力量。'],['mo','这是《火龙诀》，杀伐之术。练成了，同阶之内少有敌手。'],{fx:{book:'huolong',flags:{xinmo:1}}},
 ['mo','但你记住：力量越快，心魔来得也越快。'],['','那天夜里，你梦见一个和你一模一样的人，站在你床边，对你笑。'],
 ['','【你种下了心魔。修为更高时，它会来找你。】']
]},
{id:'xinmo',title:'插曲·心魔',g:'魔',bg:'abyss',cond:()=>F('xinmo')&&S.stage>=12,hint:'种下心魔之后',lines:[
 ['','你在打坐，丹田里忽然一冷。睁开眼，另一个你坐在对面。'],['','“你变强了。可你还是怕。怕周烈，怕天穹会，怕有一天护不住任何人。”'],['','“把身体给我。我不怕。”'],
 ['','【心魔现身：击败它。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(Math.max(1,maxZone()),{look:'天魔影',name:'心魔·'+S.name,m:2.2,boss:true,after:()=>{S.flags.xinmoDone=1;return '心魔散了。你觉得心里空了一块，又好像满了一块。'+gQi(.5);}})],{noFlee:true}),400);}},
{id:'zhounight_a',title:'插曲·夜里的饼干',g:'饼',bg:'shelter',cond:()=>F('endure')&&S.seen.includes('mock')&&S.stage>=3&&!S.seen.includes('zhouleave'),hint:'粥棚那天的选择',lines:[
 ['','半夜，你听见帐篷外有动静。掀开帘子，门口放着两块压缩饼干，没有拆封。'],['','远处有个人影一闪就不见了。掌心有火光。'],
 ['zhou','（第二天，在粥棚，他别过脸）……看什么看。我多领了两块，吃不完。'],['tie','（小声）他爸是被变异鼠拖走的。那天，他也在队里排着领粥。'],
 {fx:{aff:{zhou:10}}},['','你忽然有点明白，他为什么那么恨“没用的人”了。']
]},
{id:'zhounight_b',title:'插曲·掰手腕',g:'腕',bg:'shelter',cond:()=>F('vow')&&S.seen.includes('mock')&&S.stage>=3&&!S.seen.includes('zhouleave'),hint:'粥棚那天的选择',lines:[
 ['zhou','三个月还没到。不过先来点开胃菜。'],['','周烈在粥棚的桌子上竖起胳膊。站里的人呼啦啦围了一圈。'],['zhou','掰手腕不行，比骰子。我不占你便宜。'],
 {game:{k:'duel',lv:1,title:'和周烈比点数',winFx:{aff:{zhou:8}},loseFx:{aff:{zhou:5}},
  win:[['zhou','……运气好而已。'],['','他嘴上不服，可那天晚上的粥，他让你先打。']],
  lose:[['zhou','哈！还差得远呢！'],['','他笑得很大声。那是你第一次见他笑。']]}}
]},
{id:'zhounight_c',title:'插曲·隧道里的伏击',g:'伏',bg:'metro',cond:()=>F('punch')&&S.seen.includes('mock')&&S.stage>=3&&!S.seen.includes('zhouleave'),hint:'粥棚那天的选择',lines:[
 ['','你独自去B出口拾荒，隧道里的灯忽然全灭了。'],['zhou','那一拳，我记着呢。'],['','周烈从黑暗里走出来，身后跟着两个跟班，手里拎着钢管。'],
 ['mo','打吧。打完了，这梁子就结死了。'],['','【伏击：击败周烈和他的跟班。】']
],after:()=>{S.flags.zhouGrudge=1;setTimeout(()=>startBattle([mkCustom(0,{look:'周烈',name:'周烈',m:1.5}),mkCustom(0,{look:'黑市打手',name:'跟班',m:.8}),mkCustom(0,{look:'黑市打手',name:'跟班',m:.8})],{bg:0,noFlee:true,onWin:()=>toast('周烈捂着肚子跑了。他看你的眼神，更冷了。')}),400);}},
{id:'he_root',title:'插曲·阿禾的光',g:'光',bg:'shelter',cond:()=>F('saveHe')&&S.stage>=6,hint:'救下阿禾之后',lines:[
 ['he','{bro}！{bro}！你看！'],['','阿禾摊开手心。一粒很小很小的光点，在她掌心里转圈。'],
 ['mo','……你那一缕灵气，在她经脉里扎了根。这娃娃，有灵根了。'],['he','我也能修仙了吗？我也能保护大家了吗？'],
 {c:[{t:'「能。从今天起，我教你。」',fx:{aff:{he:15},flags:{heRoot:1}},r:[['he','（用力点头）我会好好学的！']]},
  {t:'「修仙很苦。你想清楚。」',fx:{aff:{he:5},flags:{heRoot:1}},r:[['he','我想清楚了！{bro}能吃的苦，我也能！']]}]}
]},
{id:'he_scar',title:'插曲·蓝色的手',g:'伤',bg:'shelter',cond:()=>F('heScar')&&S.stage>=6,hint:'那天你选择了先去猎妖',lines:[
 ['','阿禾的烧退了，可她的右手再也没有好起来。手背上的血管一直泛着淡淡的蓝，握不住筷子。'],['','她看见你，会往王婶身后躲。'],
 ['tie','不怪你。那时候谁知道呢。'],['mo','灵毒在她经脉里留了根。旧城妖林里有一种青冥草，或许能拔干净。'],
 ['','【新委托：铁叔「青冥草」。】']
]},
{id:'hong_road',title:'插曲·护送',g:'护',bg:'overpass',cond:()=>!F('hongWary')&&S.seen.includes('caravan')&&S.bossDown.includes(2),hint:'把玉简的事告诉红姐之后',lines:[
 ['hong','（满脸是血，冲进站台）{name}！帮个忙！'],['hong','天穹会的人在高架上截了我的车队。他们问我，有没有见过一个带玉简的人。'],
 ['hong','我说没有。他们就动手了。'],['@','你没出卖我。'],['hong','废话。我红鹞说出去的话，从来不收回。走！'],
 ['','【护送：击退截车的天穹会。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(1,{look:'天穹追兵',name:'截车的天穹执事',m:1.8,boss:true}),mkCustom(1,{look:'天穹追兵',name:'天穹门人',m:1.1})],{bg:1,noFlee:true,onWin:()=>{aff('hong',12);S.stones+=zsAt(2,6);toast('车队保住了。红姐把护目镜摘下来塞给你：“留着。以后看见这个，就知道是我的人。”','big');}}),400);}},
{id:'hong_sold',title:'插曲·卖出去的消息',g:'卖',bg:'overpass',cond:()=>F('hongWary')&&S.bossDown.includes(2),hint:'对红姐守口如瓶之后',lines:[
 ['','红姐的车停在站外，她没下车。你走过去，她摇下车窗，表情很难看。'],
 ['hong','我得跟你坦白一件事。上个月，天穹会的人出高价，打听一个身上有灵光的人。'],['hong','我不认识你，我收了钱，说了你的长相。'],['hong','我那时候不知道他们要干什么。……现在知道了。'],
 {c:[{t:'「你不认识我。换我，也会卖。」原谅她',k:1,fx:{aff:{hong:20},flags:{hongForgive:1}},r:[['hong','……你这人，真是。'],['hong','这笔债我记着。以后在我这买东西，九折，一辈子。'],{fx:{flags:{trustHong:1}}}]},
  {t:'让她赔偿',fx:{aff:{hong:-5},stones:300},r:[['hong','应该的。'],['','她把一袋灵石扔给你。车开走的时候，你们谁都没说再见。']]},
  {t:'「以后别让我看见你。」',k:-1,fx:{aff:{hong:-40},flags:{hongCut:1}},r:[['','她点了点头，摇上了车窗。从那以后，红鹞商队再也没在青石站停过车。']]}]}
]},
{id:'li_home',title:'插曲·小药铺',g:'药',bg:'shelter',cond:()=>F('freed')&&S.seen.includes('jindan'),hint:'在雾港放走了船上的人',lines:[
 ['','站台尽头新开了一间小药铺，招牌是用木板写的：李记。'],['','李婶围着围裙在里面捣药。阿禾坐在门槛上，帮她晒草药。'],
 ['he','{bro}！我妈妈回来了！是你救的！'],['','李婶塞给你一包药：“以后每天来拿，不收钱。”'],
 {fx:{meds:3,aff:{he:10}}},['','【李记药铺：疗伤药 +3。】']
]},
{id:'li_lost',title:'插曲·编号二十七',g:'号',bg:'lab',cond:()=>F('portStones')&&S.bossDown.includes(4),hint:'在雾港搬走了灵石',lines:[
 ['','研究所的培养舱里，泡着一个女人。舱壁上贴着标签：灵化实验体·二十七号。'],['','她睁开了眼睛。你认出了她。是李婶。'],
 ['mo','……那艘船上的人，都被送到了这里。'],['','舱壁碎了。她扑了出来，已经不认得任何人。'],['','【她已经回不来了。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(4,{look:'灵化实验体',name:'二十七号',m:2,boss:true,after:()=>{S.flags.liDead=1;aff('he',-20,true);return '你没有告诉阿禾。可她后来还是知道了。';}})],{bg:4,noFlee:true}),400);}},
{id:'zero_ghost',title:'插曲·胸口的声音',g:'声',bg:'lab',cond:()=>F('zeroEaten')&&S.stage>=16,hint:'吞下了零号的金丹',lines:[
 ['','夜里，你的丹田在说话。是一个少女的声音，很轻，没有起伏。'],['','“我不想当钥匙。可我现在，是你的一部分了。”'],['','“让我出来。一次就好。”'],['','【零号的残影从你的金丹里走了出来。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(Math.max(4,maxZone()),{look:'零号',name:'零号的残影',m:2.4,boss:true,after:()=>{S.flags.zeroRest=1;return '残影碎成光点。最后一句话是：“……谢谢你记得我。”'+gQi(.4);}})],{noFlee:true}),400);}},
{id:'zhou_grave',title:'插曲·石头坟',g:'坟',bg:'pit',cond:()=>F('zhouMercy')&&S.bossDown.includes(5),hint:'给了周烈一个痛快',lines:[
 ['','你回到天坑边的石头坟。坟前多了一束野花，不知道是谁放的。'],['','石缝里塞着一个防水袋，里面是周烈的本子。'],
 ['','最后一页写着：“如果我死了，告诉铁叔，我本来想保护大家的。告诉那个拾荒的，我从来没赢过他。”'],
 {fx:{item:3}},['','袋子里还有他的护手。你戴上了。']
]},
{id:'zhou_flame',title:'插曲·反噬',g:'焰',bg:'pit',cond:()=>F('zhouEaten')&&S.stage>=20,hint:'吸走了周烈的火灵根',lines:[
 ['','你吸来的那条火灵根，在丹田里烧了起来。'],['','火里有一张脸。是周烈。他在笑。'],['','“拾荒的，你以为拿走了就是你的？”'],['','【火灵根反噬：压住它。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(Math.max(5,maxZone()),{look:'赤焰狼',name:'周烈之火',m:2.6,boss:true,after:()=>{S.flags.flameTamed=1;return '火灭了一半，另一半成了你的。'+gBook('huolong');}})],{noFlee:true}),400);}},
{id:'su_duel',title:'第二卷·星海初见',g:'剑',bg:'starsea',cond:()=>F('finEat')&&F('feisheng'),hint:'吞下灵源之后飞升',lines:[
 ['su','你身上全是灵源的味道。'],['su','吞下整个世界的灵气，然后飞升——和牧者培养的执棋人，一模一样。'],['su','我杀过三个像你这样的人。'],['','【苏绾拔剑：证明你不是牧者的人。】']
],after:()=>{setTimeout(()=>startBattle([mkCustom(8,{look:'苏绾',name:'苏绾',m:1.6,boss:true,after:()=>{aff('su',5,true);return '苏绾收剑：“……你留了手。牧者的人，从不留手。”';}})],{bg:8,noFlee:true}),400);}}
);
QUESTS.push({id:'he_amend',npc:'tie',title:'青冥草',desc:'在旧城妖林找到青冥草，治好阿禾的手',unlock:()=>S.seen.includes('he_scar'),obj:{type:'node',z:2,g:'草',ev:'q_herb'},
 offer:'青冥草长在妖林最湿的地方。{name}，去吧。那孩子嘴上不说，心里还是盼着你的。',done:'阿禾的手……能握筷子了。她让我跟你说，谢谢{bro}。',reward:()=>{S.flags.heScar=0;return aff('he',30,true)+kar(1);}});
EVENTS.q_herb={title:'青冥草',g:'草',lines:['一片终年不见光的洼地里，长着几株发着青光的草。草叶上爬满了指甲盖大的毒蛭。'],
 choices:[{t:'一株一株小心地采',act:()=>'你的手被咬了好几口，肿得老高。可青冥草，一株都没折。'+gHp(-.2)},{t:'用剑气削下来',act:()=>chance(.5)?'剑气削得很干净。'+gQi(.05):'剑气太猛，削坏了两株。剩下的，还够用。'}]};
Object.assign(LOOK,{'苏绾':{a:'human',k:'suk',c:'#eef0f4',c2:'#9ad6e6',e:'#4a6aa8'}});MON_CH.suk='su';
Object.assign(NPCS,{cm:{name:'陈默',unlock:()=>S.seen.includes('lizu')&&!F('chenmoGone')},ning:{name:'宁玄',unlock:()=>F('ningDoubt')&&S.seen.includes('tianting')&&!F('ningDead')},mo:NPCS.mo});
Object.assign(NPC_IDLE,{cm:[()=>'……嗯。'],ning:[()=>'别问。']});
