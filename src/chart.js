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

/* Third illustration batch. Kept separate from the earlier atlas mappings. */
const THIRD_SCENE_KEYS=new Set('huifeng xiheng guanchao zhucao boshi xiaowu xiaoshe xinhai baita_v3'.split(' '));
const thirdArtLoading=new Set();
function requestThirdArt(key,ext){
 if(ART_IMG[key]||thirdArtLoading.has(key))return;
 thirdArtLoading.add(key);const im=new Image();
 im.onload=()=>{ART_IMG[key]=im;thirdArtLoading.delete(key);SCC_CLEAR();paintAll();const cv=document.getElementById('vbg');if(cv&&cv.dataset.key)paintTo(cv,cv.dataset.key);};
 im.onerror=()=>thirdArtLoading.delete(key);im.src='art/'+key+'.'+ext;
}
const _thirdSceneCanvas=sceneCanvas;sceneCanvas=function(key,w,h){if(THIRD_SCENE_KEYS.has(key))requestThirdArt('scene_'+key,'jpg');return _thirdSceneCanvas(key,w,h);};
const _thirdBtBg=btBg;btBg=function(key,w,h){if(THIRD_SCENE_KEYS.has(key))requestThirdArt('scene_'+key,'jpg');return _thirdBtBg(key,w,h);};
const THIRD_PORTRAITS={taoq:'taoq',yans:'yans',xupz:'xupz',qir:'qir',xchun:'xchun',yaoj:'yaoj',yaod:'yaoj'};
function thirdPortrait(key){return `<img class="porimg" src="art/por_${key}.webp" alt="">`;}
Object.entries(THIRD_PORTRAITS).forEach(([key,file])=>{PORTRAIT[key]=()=>thirdPortrait(file);});
const _thirdMo=PORTRAIT.mo,_thirdXie=PORTRAIT.xie;
PORTRAIT.mo=()=>S.seen.includes('v11_10')?thirdPortrait('mo_lamp'):_thirdMo();
PORTRAIT.xie=()=>S.seen.includes('v11_10')?thirdPortrait('xie_lamp'):(_thirdXie?_thirdXie():sealPortrait('xie'));
const THIRD_ENEMIES={'晏枢':'yans','乌衡':'wuh2','冻息叶':'dongxi','主槽守卫':'zhucao','持杖的守卫':'zhucao'};
const _thirdBtPortrait=btPortrait;btPortrait=function(a){
 const key=a.side==='e'&&THIRD_ENEMIES[a.n||a.name];if(!key)return _thirdBtPortrait.apply(this,arguments);
 requestThirdArt('enemy_'+key,'webp');const im=ART_IMG['enemy_'+key];if(!im)return _thirdBtPortrait.apply(this,arguments);
 const h=Math.round(Math.max(40,Math.min(BT.H*.40,BT.W*.25)));
 return cvMemo('third-enemy|'+key+'|'+h,()=>{const cv=mkCv(h*2,h*2),x=cv.getContext('2d');cv.ww=h;cv.hh=h;const s=Math.min(cv.width/im.width,cv.height/im.height);x.drawImage(im,(cv.width-im.width*s)/2,cv.height-im.height*s,im.width*s,im.height*s);return cv;});
};
Object.assign(CG,{jiedan:'此身',chudeng:'灯下人',xuanhe:'潮从何来',lalang:'不放手',duanling:'门松了',end_deng:'万家灯火',end_feng:'长风万里',end_shou:'守潮人',end_qing:'归青石',end_bai:'白塔长明'});
/* ---------- 第四批：第四至第十卷的场景、人物、敌人、CG ---------- */
const FOURTH_SCENE_KEYS=new Set('chiliang zhexing huiting qingshi_po yanhu tianxi taiyi lufu tieliang fudeng gongfang yancang'.split(' '));
const _fourthSceneCanvas=sceneCanvas;sceneCanvas=function(key,w,h){if(FOURTH_SCENE_KEYS.has(key))requestThirdArt('scene_'+key,'jpg');return _fourthSceneCanvas(key,w,h);};
const _fourthBtBg=btBg;btBg=function(key,w,h){if(FOURTH_SCENE_KEYS.has(key))requestThirdArt('scene_'+key,'jpg');return _fourthBtBg(key,w,h);};
const FOURTH_PORTRAITS={heq:'heq',hey:'heq',hengd:'hengd',mengq:'mengq',lhd:'lhd',wenq:'wenq',sangf:'sangf',aying:'aying',xman:'xman',chengw:'chengw',yutan:'yut',liangl:'liangl',qiw:'qiw',luoy:'luoy',duh:'duh'};
Object.entries(FOURTH_PORTRAITS).forEach(([key,file])=>{PORTRAIT[key]=()=>thirdPortrait(file);});
const FOURTH_ENEMIES=({'负碑鼋':'fubei','衡渡':'hengd','镜中错影':'hengd','孟确':'mengq','寄焰藤':'jiyan','寄焰藤根':'jiyan','护炉架':'hulu','晶翼':'jingyi','盲鳗':'mangman',
 '盐壳螯群':'yanqiao','岩鬃獾':'yanzong','晶背蛾':'jingbeie','晶背蛾群':'jingbeie','晶背兽':'jingbeis','蒙面人':'mengmian','翻船帮的蒙面人':'mengmian','持弩的蒙面人':'mengmian','雾鲨':'wusha1','寒壳蟹':'hanke'});
const _fourthBtPortrait=btPortrait;btPortrait=function(a){
 const key=a.side==='e'&&FOURTH_ENEMIES[a.n||a.name];if(!key)return _fourthBtPortrait.apply(this,arguments);
 requestThirdArt('enemy_'+key,'webp');const im=ART_IMG['enemy_'+key];if(!im)return _fourthBtPortrait.apply(this,arguments);
 const h=Math.round(Math.max(40,Math.min(BT.H*.40,BT.W*.25)));
 return cvMemo('fourth-enemy|'+key+'|'+h,()=>{const cv=mkCv(h*2,h*2),x=cv.getContext('2d');cv.ww=h;cv.hh=h;const s=Math.min(cv.width/im.width,cv.height/im.height);x.drawImage(im,(cv.width-im.width*s)/2,cv.height-im.height*s,im.width*s,im.height*s);return cv;});
};
Object.assign(CG,{hedeng:'河灯',zhexing:'折星埠',fenshan:'分山',duanjing:'断颈',guichao:'归潮',diwushan:'第五扇窗'});
const FOURTH_FIGHT_BG={'寄焰藤':'taiyi','护炉架':'lufu','伏灯站':'fudeng'};
function initFourthChapterArt(){
 const ch=id=>{const c=STORY.find(c=>c.id===id);if(!c)throw Error('Missing fourth-batch chapter '+id);return c;};
 const swap=(id,from,to)=>{const c=ch(id);if(c.bg===from)c.bg=to;(c.lines||[]).forEach(l=>{if(l&&!Array.isArray(l)&&l.bg===from)l.bg=to;});};
 for(let n=1;n<=22;n++)swap('v5_'+n,'shelter','qingshi_po');ch('v5_13').bg='tieliang';
 for(let n=3;n<=10;n++)swap('v6_'+n,'xianfu','taiyi');ch('v6_14').bg='lufu';
 for(let n=1;n<=22;n++)swap('v7_'+n,'town','chiliang');
 for(let n=1;n<=16;n++)swap('v8_'+n,'sky','tianxi');
 for(let n=1;n<=16;n++){swap('v9_'+n,'town','huiting');swap('v9_'+n,'pit','yanhu');}
 ch('v10_2').bg='yancang';ch('v10_6').bg='fudeng';for(let n=8;n<=20;n++)swap('v10_'+n,'starsea','zhexing');ch('v10_9').bg='gongfang';
 chapterInsert('v5_22','她出发前最后一晚',{fn:()=>cgShow('hedeng')});
 chapterInsert('v7_18','周烈把斧子交到左手',{fn:()=>cgShow('fenshan')});
 chapterInsert('v8_13','到了外面，许多声音都变远了',{fn:()=>cgShow('duanjing')});
 chapterInsert('v9_14','三层薄叶向三个方向弹开',{fn:()=>cgShow('guichao')});
 chapterInsert('v10_8','折星埠最先被看见的',{fn:()=>cgShow('zhexing')});
 chapterInsert('v10_9','轮子停了',{fn:()=>cgShow('diwushan')});
 const rf=rwFight;rwFight=function(o){if(o&&FOURTH_FIGHT_BG[o.title])o=Object.assign({},o,{bg:FOURTH_FIGHT_BG[o.title]});return rf.apply(this,[o].concat([].slice.call(arguments,1)));};
}
function initThirdChapterArt(){
 const set=(id,bg)=>{const c=STORY.find(c=>c.id===id);if(!c)throw Error('Missing third-batch chapter '+id);c.bg=bg;};
 set('v11_1','xiaowu');for(let n=2;n<=10;n++)set('v11_'+n,'huifeng');
 for(let n=1;n<=5;n++)set('v12_'+n,'xiheng');set('v12_2','boshi');set('v12_6','guanchao');set('v12_7','guanchao');
 for(let n=1;n<=5;n++)set('v13_'+n,'xiaoshe');for(let n=7;n<=11;n++){set('v13_'+n,'zhucao');STORY.find(c=>c.id==='v13_'+n).lines.forEach(l=>{if(l.bg==='starsea')l.bg='zhucao';});}
 chapterInsert('v12_2','回港后',{bg:'xiheng'});
 chapterInsert('v11_9','五股灵息各循旧路归来',{fn:()=>cgShow('jiedan')});
 chapterInsert('v11_10','他站稳以后',{fn:()=>cgShow('chudeng')});
 chapterInsert('v12_6','那不是水',{fn:()=>cgShow('xuanhe')});
 chapterInsert('v12_5','你抓紧他的衣领',{fn:()=>cgShow('lalang')});
 chapterInsert('v13_10','铜针一起弹起',{fn:()=>cgShow('duanling')});
 // Endings share a chapter but have separate queues: unlock only the chosen CG.
 const endings=[[V13_DENG,'deng','十五年后的一个秋日'],[V13_FENG,'feng','第八年深秋'],[V13_SHOU,'shou','提稳行囊'],[V13_QING,'qing','药铺门上的字'],[V13_BAI,'bai','抽屉里有铜钥匙']];
 for(const [lines,key,cue] of endings){const i=cue?lines.findIndex(l=>Array.isArray(l)&&typeof l[1]==='string'&&l[1].includes(cue)):lines.length-1;if(i<0)throw Error('Missing ending art cue '+key);lines.splice(i,0,{fn:()=>cgShow('end_'+key)});}
 V13_DENG.forEach(l=>{if(l.bg==='shelter')l.bg='xiaowu';});
 const endingScene=(lines,cue,bg)=>{const i=lines.findIndex(l=>Array.isArray(l)&&typeof l[1]==='string'&&l[1].includes(cue));if(i<0)throw Error('Missing ending scene '+bg);lines.splice(i,0,{bg});};
 endingScene(V13_FENG,'到了新泊地','xinhai');
 endingScene(V13_BAI,'第二年，人们为新中枢修了一座白塔','baita_v3');
}

