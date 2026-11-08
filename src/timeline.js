/* ================= 时间线 =================
   剧情推进时间：读完一章，日子往前走一天；写着「几年以后」「六周以后」的章节，开头就把日子推过去。 */
function chHint(ch){let h=ch.hint||'继续探索江湖';if(ch.pg){const n=paceLeft(ch.pk,ch.pg);if(n>0)h=(ch.hint&&!/^过些日子/.test(ch.hint)?ch.hint+' · ':'')+'还要再过 '+n+' 天（出城历练、扫荡、歇息、闭关都会让日子往前走）';}return h;}
/* 章节开始时的时间跳跃：{year:灵潮年} 或 天数 */
const TL_JUMP={
 v4_5:3,v4_8:2,v4_12:7,
 v5_1:{year:11},v5_7:5,v5_15:20,v5_17:6,v5_20:6,v5_22:150,
 v6_1:90,v6_17:1,
 v7_1:200,v7_21:42,
 v8_1:40,v8_15:21,v8_16:30,
 v9_1:12,v9_15:3,v9_16:60,
 v10_1:7,v10_3:30,v10_5:8,v10_8:3,v10_21:45
};
const _tlPlay=playStory;
playStory=function(id){const c=STORY.find(x=>x.id===id);
 if(c&&!S.seen.includes(id)&&TL_JUMP[id]!=null&&!S.flags['tl_'+id]){S.flags['tl_'+id]=1;const j=TL_JUMP[id];try{if(typeof j==='object')ensureYear(j.year);else advanceDays(j,'story');}catch(e){console.error(e);}}
 return _tlPlay.apply(this,arguments);};
/* 每读完一章新的主线，日子走一天 */
STORY.forEach(c=>{if(!/^v\d+_|^(prologue|mock|ahe|dongtian|ratking|zhouleave|zhuji|exposed|hunted|caravan)$/.test(c.id))return;const a0=c.after;c.after=function(){try{if(!S.flags['td_'+c.id]){S.flags['td_'+c.id]=1;advanceDays(1,'story');}}catch(e){}return a0&&a0.apply(this,arguments);};});
