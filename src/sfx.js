/* ================= 音效（WebAudio 合成，无外部文件） ================= */
let AC=null,MUTE=(()=>{try{return localStorage.getItem('lc_mute')==='1';}catch(e){return false;}})();
function acInit(){if(AC||MUTE)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}
addEventListener('pointerdown',()=>{acInit();if(AC&&AC.state==='suspended')AC.resume();},{passive:true});
function sfxMute(){MUTE=!MUTE;try{localStorage.setItem('lc_mute',MUTE?'1':'0');}catch(e){}if(!MUTE)acInit();toast(MUTE?'音效已关闭':'音效已开启');const b=$('#sfxBtn');if(b)b.textContent=MUTE?'音效 关':'音效 开';}
function tone(f,d,o){if(MUTE||!AC)return;o=o||{};const t=AC.currentTime+(o.at||0),g=AC.createGain(),os=AC.createOscillator();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.18,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(0.0001,t+d);os.connect(g);g.connect(AC.destination);os.start(t);os.stop(t+d+.05);}
function noise(d,o){if(MUTE||!AC)return;o=o||{};const t=AC.currentTime+(o.at||0),n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,o.k||2);
 const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.value=o.fq||1800;const g=AC.createGain();g.gain.value=o.v||.25;s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);}
const SFX={
 hit(){noise(.12,{fq:1400,v:.22});tone(180,.1,{type:'square',v:.06,to:90});},
 crit(){noise(.18,{fq:2600,v:.3});tone(520,.16,{type:'sawtooth',v:.08,to:200});tone(880,.22,{v:.06,at:.03});},
 heal(){[523,659,784].forEach((f,i)=>tone(f,.35,{v:.07,at:i*.06}));},
 cast(){tone(330,.3,{type:'triangle',v:.08,to:660});},
 fire(){noise(.45,{fq:900,v:.25,k:1});},
 thunder(){noise(1.1,{fq:600,v:.45,k:1.2});noise(.25,{fq:5000,ft:'highpass',v:.18});},
 ice(){[1568,2093,1760].forEach((f,i)=>tone(f,.25,{v:.05,at:i*.05}));},
 combo(){tone(196,.5,{type:'sawtooth',v:.1,to:98});noise(.5,{fq:1200,v:.35,k:1});[784,988,1175].forEach((f,i)=>tone(f,.3,{v:.06,at:.08+i*.06}));},
 coin(){tone(1318,.08,{type:'square',v:.05});tone(1760,.18,{type:'square',v:.05,at:.07});},
 tap(){tone(660,.05,{type:'triangle',v:.05});},
 bad(){tone(220,.4,{type:'sawtooth',v:.07,to:110});},
 rise(){[262,330,392,523,659,784,1046].forEach((f,i)=>tone(f,.9-i*.05,{type:'triangle',v:.08,at:i*.09}));noise(1.4,{fq:400,v:.2,k:.8,at:.2});},
 bell(){[392,523.25,784].forEach((f,i)=>tone(f,1.6,{v:.09,at:i*.02}));},
 win(){[523,659,784,1046].forEach((f,i)=>tone(f,.4,{type:'triangle',v:.08,at:i*.1}));}
};
function sfx(k){try{acInit();if(SFX[k])SFX[k]();}catch(e){}}
