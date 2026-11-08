/* ================= 天象：限时的意外 ================= */
const OMENS={
 lingyu:{n:'灵雨',d:'修炼与引气 ×2',c:'#8fd6b5'},
 xueyue:{n:'血月',d:'妖兽更凶，掉落与灵石 ×2',c:'#ff5a4a'},
 caixing:{n:'财星高照',d:'战斗所得灵石 ×1.6',c:'#e3b862'},
 chao:{n:'妖兽潮',d:'野外妖兽变多，战斗灵气 ×1.5',c:'#d08a3a'},
 fuxing:{n:'福星临门',d:'掉落的装备品质更高',c:'#c9a0f0'}
};
const omenOn=k=>!!(S.omen&&S.omen.k===k&&Date.now()<S.omen.until);
function omenMul(t){if(!S.omen||Date.now()>=S.omen.until)return 1;const k=S.omen.k;
 if(t==='qi')return k==='lingyu'?2:1;if(t==='stone')return k==='caixing'?1.6:k==='xueyue'?2:1;if(t==='loot')return k==='xueyue'?2:1;if(t==='bqi')return k==='chao'?1.5:1;return 1;}
function omenFoe(e){if(omenOn('xueyue')){e.hp*=1.3;e.max=e.hp;e.atk*=1.3;}return e;}
let omAcc=0;
function omenTick(dt){if(!S.started)return;omAcc+=dt;if(omAcc<1)return;omAcc=0;
 if(S.omen&&Date.now()>=S.omen.until){const n=OMENS[S.omen.k].n;S.omen=null;toast('天象「'+n+'」散去了。');omenDom();}
 if(S.omen||!OV_FREE()||BT||document.hidden)return;S.omenClock=(S.omenClock||0)+1;
 if(S.omenClock>=1300+Math.floor(Math.random()*700)){S.omenClock=0;const k=pick(Object.keys(OMENS));S.omen={k,until:Date.now()+6*60*1000};toast('天象突变：「'+OMENS[k].n+'」！'+OMENS[k].d+'，持续六分钟','big');omenDom();save();}
 else{const el=$('#wOmen');if(el&&S.omen)el.querySelector('small').textContent=OMENS[S.omen.k].d+' · 还剩 '+fmtT((S.omen.until-Date.now())/1000);}}
function omenHTML(){if(!S.omen||Date.now()>=S.omen.until)return '<div class="women" id="wOmen" hidden><b></b><small></small></div>';const O=OMENS[S.omen.k];
 return `<div class="women" id="wOmen" style="--oc:${O.c}"><b>天象 · ${O.n}</b><small>${O.d} · 还剩 ${fmtT((S.omen.until-Date.now())/1000)}</small></div>`;}
function omenDom(){const el=$('#wOmen');if(!el)return;const tmp=document.createElement('div');tmp.innerHTML=omenHTML();el.replaceWith(tmp.firstChild);}
