/* Chapter artwork: atlas quadrants remain bound to named speakers/encounters. */
const CHAPTER_SCENE_KEYS=new Set('clinic baita shuizha dongjiao qiaodong toll nanjie yaopu xidi matou ferry wugang keyun anzhi yipeng liangzhan shuixia beipo chaozhen baiji'.split(' '));
const chapterLoading=new Set();
function requestChapterScene(key){if(!CHAPTER_SCENE_KEYS.has(key)||ART_IMG['scene_'+key]||chapterLoading.has(key))return;chapterLoading.add(key);const im=new Image();
 im.onload=()=>{ART_IMG['scene_'+key]=im;SCC_CLEAR();paintAll();const cv=document.getElementById('vbg');if(cv&&cv.dataset.key===key)paintTo(cv,key);};
 im.onerror=()=>chapterLoading.delete(key);im.src='art/scene_'+key+'.jpg';}
const _chapterSceneCanvas=sceneCanvas;sceneCanvas=function(key,w,h){requestChapterScene(key);return _chapterSceneCanvas(key,w,h);};
const _chapterBtBg=btBg;btBg=function(k,w,h){requestChapterScene(k);return _chapterBtBg(k,w,h);};
const CHAPTER_PORTRAITS={
 wuh:['5_portraits_01_antagonists',0],dong:['5_portraits_01_antagonists',1],hcg:['5_portraits_01_antagonists',2],hui:['5_portraits_01_antagonists',3],
 li:['5_portraits_02_market',0],gc:['5_portraits_02_market',1],yao:['5_portraits_02_market',2],xulu:['5_portraits_02_market',3],
 qin:['5_portraits_03_station',0],ma:['5_portraits_03_station',1],liu:['5_portraits_03_station',2],ruan:['5_portraits_03_station',3],
 chuyi:['6_characters_grid',0],wence:['6_characters_grid',1],shenm:['6_characters_grid',2],lu:['6_characters_grid',3]
};
function chapterPortrait(key){const [sheet,q]=CHAPTER_PORTRAITS[key];return `<span class="atlas-portrait"><img src="art/atlas_${sheet}.webp" alt="${SPK[key]}" style="left:${-(q%2)*100}%;top:${-Math.floor(q/2)*100}%"></span>`;}
Object.keys(CHAPTER_PORTRAITS).forEach(k=>{PORTRAIT[k]=()=>chapterPortrait(k);});
const _chapterZero=PORTRAIT.zero;
PORTRAIT.zero=()=>F('v1')&&S.seen.includes('v3_4')?chapterPortrait('chuyi'):_chapterZero();
const CHAPTER_ENEMIES={
 '石皮鼠·守门':['5_enemies_01_mutants',0],'石皮鼠':['5_enemies_01_mutants',0],'铁骨鼠':['5_enemies_01_mutants',1],
 '蓝鳞蛇':['5_enemies_01_mutants',2],'吃砂钳虫':['5_enemies_01_mutants',3],
 '猎宝人·乌衡':['5_enemies_02_adversaries',0],'贺长庚':['5_enemies_02_adversaries',1],'铜索桩':['5_enemies_02_adversaries',2],
 '西堤灰衣修士':['5_portraits_01_antagonists',3],
 '瓶颈·心关':['5_enemies_02_adversaries',3],
 '回声鳗':['6_enemies_grid',0],'铜锈甲蟹':['6_enemies_grid',1],'白脊鲛':['6_enemies_grid',2],
 '小鲛':['6_enemies_grid',3],'白脊幼鲛':['6_enemies_grid',3]
};
const _chapterBtPortrait=btPortrait;
btPortrait=function(a){const pair=a.side==='e'&&CHAPTER_ENEMIES[a.n||a.name],im=pair&&ART_IMG['atlas_'+pair[0]];
 if(!im)return _chapterBtPortrait.apply(this,arguments);
 const h=Math.round(Math.max(40,Math.min(BT.H*.40,BT.W*.25))),q=pair[1];
 return cvMemo('chapter-enemy|'+pair[0]+'|'+q+'|'+h,()=>{const cv=mkCv(h*2,h*2),x=cv.getContext('2d');cv.ww=h;cv.hh=h;
  x.drawImage(im,(q%2)*im.width/2+2,Math.floor(q/2)*im.height/2+2,im.width/2-4,im.height/2-4,0,0,cv.width,cv.height);
  x.globalCompositeOperation='destination-in';const g=x.createRadialGradient(h,h,h*.62,h,h,h*1.1);g.addColorStop(0,'#000');g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);return cv;});
};
const CHAPTER_SCENES={
 v1_east:'dongjiao',ahe:'dongjiao',v1_ma:'qiaodong',v1_tunnel:'dongtian',v1_rats:'baita',ratking:'shuizha',
 v2_1:'toll',v2_2:'nanjie',v2_3:'nanjie',v2_5:'yaopu',v2_6:'yaopu',v2_7:'nanjie',v2_8:'yaopu',v2_9:'xidi',v2_10:'nanjie',v2_11:'nanjie',v2_12:'nanjie',v2_13:'matou',v2_14:'matou',v2_15:'xidi',v2_16:'nanjie',v2_17:'yaopu',v2_18:'nanjie',
 v3_1:'ferry',v3_2:'wugang',v3_3:'anzhi',v3_4:'yipeng',v3_5:'yipeng',v3_6:'liangzhan',v3_7:'shuixia',v3_8:'beipo',v3_9:'beipo',v3_10:'yipeng',v3_11:'chaozhen',v3_12:'baiji'
};
Object.entries(CHAPTER_SCENES).forEach(([id,bg])=>{const c=STORY.find(c=>c.id===id);if(c)c.bg=bg;});
// Scene changes are anchored to existing text, leaving choices and outcomes intact.
function chapterInsert(id,needle,entry){const c=STORY.find(c=>c.id===id);if(!c||!Array.isArray(c.lines))throw Error('Missing art chapter '+id);const i=c.lines.findIndex(l=>Array.isArray(l)&&typeof l[1]==='string'&&l[1].includes(needle));if(i<0)throw Error('Missing art cue '+id+': '+needle);c.lines.splice(i,0,entry);}
chapterInsert('prologue','社区诊所',{bg:'clinic'});
chapterInsert('v3_2','太阳沉下去以后',{bg:'keyun'});
V1_BN[2].bg='baita';
const CHAPTER_TRANSITIONS={v1_tunnel:{metro:'baita'},v1_rats:{metro:'baita'},v2_2:{market:'nanjie'},v2_4:{market:'yaopu'},v2_9:{port:'xidi'},v2_13:{port:'matou'},v2_14:{port:'matou'},v2_15:{port:'xidi'},v2_17:{market:'yaopu'},v3_2:{port:'wugang'},v3_3:{lab:'anzhi',port:'anzhi'},v3_4:{lab:'yipeng',port:'yipeng'},v3_7:{port:'shuixia'},v3_8:{overpass:'beipo'},v3_10:{port:'chaozhen'}};
Object.entries(CHAPTER_TRANSITIONS).forEach(([id,map])=>{const c=STORY.find(c=>c.id===id);c.lines.forEach(l=>{if(l.bg&&map[l.bg])l.bg=map[l.bg];});});
Object.assign(CG,{zhou:'粥棚',xinmo:'心魔问',cheding:'去看海',sanwan:'多出来的一碗',xieming:'请你自己写',chechuang:'东边的水',baixiang:'白箱',chuyi:'初一',jiashi:'旧驾驶室',kanhai:'潮声',tashui:'踏水',xiaoting:'小艇'});
const CHAPTER_CG=[['mock','粥棚搭在','zhou'],['zhuji','你站在空无一人的','xinmo'],['v1_caravan','夜里，「老驴」车顶','cheding'],['v2_1','天亮以后','sanwan'],['v2_13','顾春抓住笔','xieming'],['v2_18','老驴驶出南街','chechuang'],['v3_3',null,'baixiang'],['v3_4','她把写着旧名的纸','chuyi'],['v3_8','驾驶室单独搁在','jiashi'],['v3_9','坡下的石阶','kanhai'],['v3_12','宁玄抽出','tashui'],['v3_12','你握着木匣','xiaoting']];
CHAPTER_CG.forEach(([id,cue,key])=>{const c=STORY.find(c=>c.id===id);const needle=cue||c.lines.find(l=>Array.isArray(l)&&typeof l[1]==='string')[1];chapterInsert(id,needle,{fn:()=>cgShow(key)});});

