/* ================= 后日：通关以后，按终章分开的日子 =================
   读完终章后，各结局有一段「后日」小剧情，往后每三十天按结局送来一份日常收获。
   归青石：终章读完时散丹——修为退到炼气三层，这一世灵气薄了，境界上限是筑基大圆满（见 canon.js 的 canonCap）。 */
const AFTER_IDS={};
function AFTER(e,o){const id='after_'+e;AFTER_IDS[e]=id;
 STORY.push({id,pk:'after',pg:o.gap||1,title:'后日·'+o.t,g:'后',bg:o.bg||'shelter',lines:o.lines,hint:o.hint||'过些日子',
  cond:()=>F('v1')&&S.seen.includes('v13_12')&&F('v13End')===e&&paceOk('v13',o.gap||1),
  after:()=>{S.flags.afterD=daysAll();try{o.after&&o.after();}catch(err){console.error(err);}save();}});}

AFTER('deng',{t:'两处药炉',bg:'xiaowu',lines:[
 ['','开春，青杉渡的信先到。小椿在信里画了第二座炉，比第一座正，屋顶补过两回，雨天再没强开炉。末尾一行字写得很大：火该不该停，我们自己看得懂了。'],
 ['','北山这边，阿禾的新学徒拿着一张图来找你，说你三年前画的一段水沟偏了半尺，请你签字认错。'],
 ['he','（在门口抱着胳膊）别看我。我也被划过。'],
 {c:[
  {t:'（接过笔，签上名字）',k:1,fx:{aff:{he:3}},r:[['','学徒把图收好，鞠了一躬，跑得飞快。阿禾在门口笑出了声。']]},
  {t:'先带我去那段沟看看。',k:1,fx:{aff:{he:4}},r:[['','你们在沟边蹲了半个下午。确实偏了半尺。你回来签了名，学徒说下回也想带你去量。']]}
 ]},
 ['hong',HL('（卸完货进门，把一包烤饼放在第三张桌上）两处炉子都要料，往后我每月多跑一趟青杉渡。你记得给我留饭。','（卸完货进门，把一包烤饼放在桌上）两处炉子都要料，往后我每月多跑一趟青杉渡。')],
 ['mo','（灯里）把热菜放近一点。'],
 ['','【往后每月，两处药炉会送来一些药材和工钱。】']
]});

AFTER('feng',{t:'新岸的药名',bg:'xinhai',lines:[
 ['','新泊地的药名和地上的不一样。同一株叶背发白的草，这里叫「潮里银」，你从前叫它退热草。一个渔家孩子在药坊门口看你认药，看了三天，第四天自己搬了张凳子进来。'],
 ['','他说他奶奶的咳嗽，三个药坊都说要包治，收了钱就不来了。'],
 {c:[
  {t:'先说我治不治得好，再说钱。',k:2,fx:{flags:{afterFeng:1}},r:[['','你去看了老人，说能缓，不能断根，药要吃一个冬天。孩子把这句话一字一字背回去。第二天，他奶奶自己拄着拐来了。']]},
  {t:'带他认药：先把潮里银认熟。',k:1,fx:{flags:{afterFeng:2}},r:[['','孩子认得很快，嘴里念着两套药名，一套地上的，一套海边的。']]}
 ]},
 ['hong','（傍晚从船上下来，船舱里装着一半货、一半别人托带的家书）这趟赚得不多。可有三封信是送到下陆的，我没收钱。'],
 ['@','记账上。'],['hong','记了。写的是：顺路。'],
 ['','【往后每月，红鹞的船会带回一份货款。】']
]});

AFTER('shou',{t:'急诊的地址',bg:'xiheng',lines:[
 ['','任满第二年的一个雨夜，侧门被敲响。来的是息衡值守班里最年轻的一个，浑身湿透，手里攥着一张潮势图。'],
 ['','他说今夜的潮线和你留下的哪一条都不像，班长让他来问问，又让他记住：只问，不请你回去。'],
 {c:[
  {t:'（看图，只说判断，不说「我来」）',k:2,fx:{flags:{afterShou:1}},r:[['','你看了很久，指出两处。他拿着图跑回去。天亮前，息衡送来两个字：已断。是他们自己断的。']]},
  {t:'我跟你去一趟，看完就回。',k:0,fx:{flags:{afterShou:2}},r:[['','你跟去了。班长客气地请你坐在旁边，没有把印递给你。你看他们断完槽，天亮前回了家。']]}
 ]},
 ['hong','（替你把湿外衣挂起来）急诊的地址，留对了吧。'],
 ['','【往后每月，息衡会按约付一份有期限的顾问工钱。】']
]});

AFTER('bai',{t:'没盖的印',bg:'baita_v3',lines:[
 ['','白塔又过了一个冬天。一天傍晚，有人把一卷水图送上塔来。来人是个年轻测绘者，袖口别着一支笔，说她的老师姓阿，教过她：量完要写，写完要让人看。'],
 ['','图上把三处中枢尚未核准的支渠，画成了可以自行断槽。'],
 {c:[
  {t:'（在图上盖印，准它张贴）',k:2,fx:{flags:{afterBai:'yes'}},r:[['','印落下去的时候，你的手停了一下。那三处支渠，后来各自出了两回错，也各自修好了。']]},
  {t:'（退回：等核过再说）',k:-1,fx:{flags:{afterBai:'no'}},r:[['','她收起图，没有争，鞠了一躬下塔去了。你在灯下坐了很久，才拿起下一份请领。']]}
 ]},
 ['','【往后每月，白塔的俸禄照例送到。】']
]});

AFTER('qing',{t:'重新起炉',bg:'shelter',lines:[
 ['','散丹后的第一个春天，你用炭炉熬药。火候要一点一点看，从前一息就能稳住的东西，现在得守一整个下午。'],
 ['','阿禾的学徒来借药秤，看见你守着炉子打瞌睡，没叫醒你，把火拨小了一点。'],
 ['','后来你重新开始打坐。灵气薄了，像在旱季的河里捧水，捧起来的总比从前少。陶清渡托人捎来一句话：这回不急，也不赶路。'],
 {c:[
  {t:'那就慢慢修。',k:1,r:[['','你把那张写着「金丹」的旧纸夹回药理册，在旁边添了一行：炼气三层，从这里起。']]},
  {t:'（先把药熬好）',k:1,r:[['','药熬好的时候，天已经黑了。红鹞进门闻了闻，说这锅能喝。']]}
 ]},
 ['hong',HL('（坐下来揉膝盖）往后上坡，你走前面还是我走前面？','（路过进门）往后上坡，你别跟我抢着走前面。')],
 ['@','谁慢谁走前面。'],
 ['','【这一世灵气薄了，修为到筑基为止。药铺往后每月有一点进项。】']
]});

/* 每三十天，按终章送来一份日常收获 */
const AFTER_GIFT={
 deng:()=>{S.meds=(S.meds||0)+2;const g=zsAt(maxZone(),8);S.stones+=g;return '两处药炉送来药材两份、工钱'+fmt(g)+'。';},
 feng:()=>{const g=zsAt(maxZone(),12);S.stones+=g;return '红鹞的船回港，带回货款'+fmt(g)+'。';},
 shou:()=>{const g=zsAt(maxZone(),10);S.stones+=g;return '息衡送来这个月的顾问工钱'+fmt(g)+'。';},
 bai:()=>{const g=zsAt(maxZone(),20);S.stones+=g;return '白塔的俸禄送到：'+fmt(g)+'。案上又多了一摞请领。';},
 qing:()=>{S.meds=(S.meds||0)+3;const g=zsAt(maxZone(),5);S.stones+=g;return '药铺这个月的进项：'+fmt(g)+'，还有乡亲送来的草药三包。';}
};
{const ad0=advanceDays;advanceDays=function(n,why){const r=ad0.apply(this,arguments);
  try{const e=S.flags&&S.flags.v13End;if(e&&S.seen.includes(AFTER_IDS[e])&&AFTER_GIFT[e]){
   const last=S.flags.afterGift||S.flags.afterD||0;let k=Math.floor((daysAll()-last)/30);
   if(k>0){k=Math.min(k,6);let t='';for(let i=0;i<k;i++)t=AFTER_GIFT[e]();S.flags.afterGift=last+30*Math.floor((daysAll()-last)/30);toast(t);}}}catch(err){console.error(err);}
  return r;};}

/* 归青石：终章读完时散丹 */
{const c=STORY.find(x=>x.id==='v13_12');if(c){const a0=c.after;c.after=function(){
  if(F('v13End')==='qing'&&!F('qingSan')){S.flags.qingSan=1;S.flags.qingFrom=S.stage;S.stage=Math.min(S.stage,2);S.layer=0;S.qi=0;S.yao=0;}
  return a0&&a0.apply(this,arguments);};}}
