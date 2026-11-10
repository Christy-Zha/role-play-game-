/* ================= 3D 画面（stage3d.js） =================
   用 Three.js 把现有的画摆成立体的：
   - 布景：剧情背景、页面上方的场景图。插画沿「地平线」折成「地面 + 远景」两块，
     镜头缓慢绕行，近处地面和远处山影错开移动，空中飘着灵气光点和薄雾。
   - 战斗、江湖行走见后面两节。
   原理：同一块画，每个点都沿「镜头 → 这个点」的视线前后挪，所以镜头停在原位时
   画面和原图一模一样；镜头一动，近的动得多、远的动得少，就有了纵深。
   只用一个 WebGL 画板，画完再贴进原来的 2D 画布，页面结构和样式都不用动。
   不碰存档；开关存在 localStorage 的 lingchao_3d。浏览器不支持时自动退回 2D。 */
const D3={on:true,ok:null,R:null,W:0,H:0,views:new Map(),dio:new Map(),tex:new Map(),t:0,last:0,still:false,lost:false};
try{if(localStorage.getItem('lingchao_3d')==='0')D3.on=false;}catch(e){}
try{D3.still=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
const D3_MAXPX=1900000,D3_MAXD=2048;
function d3Ready(){if(!D3.on||D3.ok===false||D3.lost)return false;if(D3.R)return true;
 try{if(typeof THREE==='undefined')throw new Error('no three');
  const R=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  R.setPixelRatio(1);R.setSize(16,16,false);R.outputColorSpace=THREE.SRGBColorSpace;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.setClearColor(0x0c0b09,1);
  R.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();D3.lost=true;},false);
  R.domElement.addEventListener('webglcontextrestored',()=>{D3.lost=false;D3.tex.clear();D3.dio.clear();},false);
  D3.R=R;D3.ok=true;D3.W=16;D3.H=16;return true;}catch(e){D3.ok=false;return false;}}
function d3Set(on){D3.on=!!on;try{localStorage.setItem('lingchao_3d',on?'1':'0');}catch(e){}
 if(!D3.on){D3.views.clear();if(typeof BT!=='undefined'&&BT)BT.d3=null;}
 try{SCC_CLEAR();paintAll();const v=document.getElementById('vbg');if(v&&v.dataset.key)paintTo(v,v.dataset.key);}catch(e){}}
/* 按画布像素算 GL 尺寸，太大就等比缩小（手机省电） */
function d3Px(w,h){w=Math.max(2,Math.round(w));h=Math.max(2,Math.round(h));const k=Math.min(1,Math.sqrt(D3_MAXPX/(w*h)),D3_MAXD/w,D3_MAXD/h);return [Math.max(2,Math.floor(w*k)),Math.max(2,Math.floor(h*k))];}
/* 在共用画板左下角画一块，再贴到目标 2D 画布上 */
function d3Blit(scene,cam,ctx,pw,ph,dx,dy,dw,dh){const R=D3.R;
 if(pw>D3.W||ph>D3.H){D3.W=Math.max(D3.W,pw);D3.H=Math.max(D3.H,ph);R.setSize(D3.W,D3.H,false);}
 R.setViewport(0,0,pw,ph);R.setScissor(0,0,pw,ph);R.setScissorTest(true);R.render(scene,cam);
 ctx.drawImage(R.domElement,0,D3.H-ph,pw,ph,dx,dy,dw,dh);}
/* 画布 → 贴图。用过的贴图记在一张表里，多了就把最早的释放掉，免得占满显存 */
function d3Tex(cv){let t=D3.tex.get(cv);if(t){D3.tex.delete(cv);D3.tex.set(cv,t);return t;}
 t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;
 t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;D3.tex.set(cv,t);
 if(D3.tex.size>120){const [k,o]=D3.tex.entries().next().value;D3.tex.delete(k);o.dispose();}return t;}
/* 画能不能当贴图（跨域图片会让画布「变脏」，WebGL 不让用） */
function d3Clean(cv){try{const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.drawImage(cv,0,0,1,1);const d=x.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]];}catch(e){return null;}}
let _d3Dot=null;function d3DotTex(){if(_d3Dot)return _d3Dot;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);_d3Dot=new THREE.CanvasTexture(c);return _d3Dot;}
let _d3Mist=null;function d3MistTex(){if(_d3Mist)return _d3Mist;const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d'),R=rng(77);
 for(let i=0;i<26;i++){const cx=20+R()*216,cy=34+R()*30,r=14+R()*30,g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
 _d3Mist=new THREE.CanvasTexture(c);_d3Mist.colorSpace=THREE.SRGBColorSpace;return _d3Mist;}
let _d3Blob=null;function d3BlobTex(){if(_d3Blob)return _d3Blob;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.6,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);_d3Blob=new THREE.CanvasTexture(c);return _d3Blob;}

/* ---------- 折纸布景 ----------
   o.fov 视角、o.h 镜头高度、o.pitch 俯角、o.fold 地平线在屏幕上的位置（-1 底 … 1 顶）
   o.tex 贴图实际覆盖的屏幕范围（1 = 刚好铺满，>1 = 四周多画了一圈备用）
   o.geo 网格铺多大（比 tex 大的部分会拉伸边缘的颜色）
   o.bend 远景两侧往前弯的程度，o.near 地面最近能到多近（远景距离的比例） */
function d3RestCam(aspect,o){const c=new THREE.PerspectiveCamera(o.fov,aspect,.05,400);c.position.set(0,o.h,0);c.rotation.set(-o.pitch,0,0);c.updateMatrixWorld(true);c.updateProjectionMatrix();return c;}
function d3Folder(cam,o){const C=cam.position.clone(),f=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion),v=new THREE.Vector3();
 const ray=(nx,ny,out)=>(out||v).set(nx,ny,.5).unproject(cam).sub(C).normalize();
 const r0=ray(0,o.fold).clone(),D=r0.y<-1e-4?(-C.y/r0.y)*r0.dot(f):60;
 /* 屏幕点 → 立体位置（沿视线放到地面或远景上） */
 const at=(nx,ny,out)=>{const r=ray(nx,ny,new THREE.Vector3()),df=r.dot(f);let d=D*(1-(o.bend||0)*Math.min(1,nx*nx));
  if(r.y<-1e-4){const g=(-C.y/r.y)*df;if(g<d)d=g;}d=Math.max(d,D*(o.near||.3));return (out||new THREE.Vector3()).copy(C).addScaledVector(r,d/df);};
 /* 屏幕点 → 地面（y=0）上的点，给人物站位用 */
 const ground=(nx,ny,out)=>{const r=ray(nx,ny,new THREE.Vector3());if(r.y>-1e-3)r.y=-1e-3;const t=-C.y/r.y;return (out||new THREE.Vector3()).copy(C).addScaledVector(r,t);};
 return {C,f,D,at,ground,ray};}
function d3Sheet(cam,fold,tex,o){const sx=o.sx||28,sy=o.sy||56,g=new THREE.PlaneGeometry(2,2,sx,sy),pos=g.attributes.position,uv=g.attributes.uv,p=new THREE.Vector3();
 for(let i=0;i<pos.count;i++){const nx=pos.getX(i)*o.geo,ny=pos.getY(i)*o.geo;fold.at(nx,ny,p);pos.setXYZ(i,p.x,p.y,p.z);uv.setXY(i,(nx/o.tex+1)/2,(ny/o.tex+1)/2);}
 pos.needsUpdate=true;uv.needsUpdate=true;g.computeBoundingSphere();
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,depthWrite:true}));m.renderOrder=-10;return m;}
/* 灵气光点：散在镜头前的空间里，慢慢往上飘 */
function d3Motes(cam,fold,n,col,o){o=o||{};const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),V=[],R=rng(n*31+7),p=new THREE.Vector3();
 for(let i=0;i<n;i++){const d=fold.D*(.22+R()*.7),nx=R()*2.2-1.1,ny=R()*2-1;const r=fold.ray(nx,ny,new THREE.Vector3());p.copy(fold.C).addScaledVector(r,d/r.dot(fold.f));
  P[i*3]=p.x;P[i*3+1]=Math.max(.05,p.y);P[i*3+2]=p.z;V.push({vy:(.05+R()*.12)*(o.up||1),ph:R()*6.28,y0:P[i*3+1]});}
 g.setAttribute('position',new THREE.BufferAttribute(P,3));
 const m=new THREE.Points(g,new THREE.PointsMaterial({color:col,size:o.size||fold.D*.0065,map:d3DotTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.85,sizeAttenuation:true}));
 const top=fold.C.y+fold.D*.45;
 m.userData.tick=(t,dt)=>{for(let i=0;i<n;i++){let y=P[i*3+1]+V[i].vy*dt;if(y>top)y=.05;P[i*3+1]=y;P[i*3]+=Math.sin(t*.6+V[i].ph)*dt*.04;}g.attributes.position.needsUpdate=true;m.material.opacity=.65+.25*Math.sin(t*1.7);};
 return m;}
/* 地平线附近的薄雾，左右缓缓飘 */
function d3Mists(fold,col,n){const G=new THREE.Group(),R=rng(91);for(let i=0;i<n;i++){const d=fold.D*(.55+i*.14),w=d*.9,p=fold.at(R()*1.6-.8,-.15+R()*.2);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.35),new THREE.MeshBasicMaterial({map:d3MistTex(),color:col,transparent:true,depthWrite:false,opacity:.16+R()*.08}));
  const s=fold.C.clone().addScaledVector(fold.f,d);m.position.set(p.x,Math.max(.1,p.y*.6+.15),s.z);m.userData.x0=m.position.x;m.userData.sp=(.03+R()*.05)*(R()<.5?-1:1)*d;G.add(m);}
 G.userData.tick=t=>G.children.forEach(m=>{m.position.x=m.userData.x0+Math.sin(t*.05+m.userData.sp)*m.userData.sp*2;m.lookAt(fold.C.x,m.position.y,fold.C.z);});return G;}
const d3Lit=(rgb,k)=>new THREE.Color().setRGB(...rgb.map(v=>Math.min(1,(v/255)*(1-k)+k)),THREE.SRGBColorSpace);
/* 镜头绕着场景中间慢慢转：左右、上下、轻轻推近 */
function d3Sway(cam,rest,fold,t,amp){const piv=fold.C.clone().addScaledVector(fold.f,fold.D*.5),off=rest.position.clone().sub(piv);
 const yaw=Math.sin(t*.21)*.035*amp+Math.sin(t*.077)*.02*amp,pit=Math.sin(t*.16+1)*.012*amp,dol=(.5+.5*Math.sin(t*.12))*.05*amp;
 off.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);off.applyAxisAngle(new THREE.Vector3(1,0,0).applyQuaternion(rest.quaternion),pit);off.multiplyScalar(1-dol);
 cam.position.copy(piv).add(off);cam.lookAt(piv);cam.updateMatrixWorld(true);}

/* ---------- 布景：剧情背景、页面上方的场景图 ---------- */
const D3_OVER=1.3;
function d3Diorama(key,w,h){const id=key+'|'+Math.round(w)+'x'+Math.round(h);let D=D3.dio.get(id);
 const src=sceneCanvas(key,w*D3_OVER,h*D3_OVER);if(D&&D.src===src){D3.dio.delete(id);D3.dio.set(id,D);return D;}
 if(D){d3Free(D);D3.dio.delete(id);}
 const avg=d3Clean(src);if(!avg)return null;
 const asp=w/h,o={fov:asp<1?50:40,h:1.7,pitch:asp<1?.16:.2,fold:asp<1?.02:.08,tex:D3_OVER,geo:D3_OVER*1.04,bend:.12,near:.34};
 const rest=d3RestCam(asp,o),fold=d3Folder(rest,o),scene=new THREE.Scene(),tex=new THREE.CanvasTexture(src);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 scene.add(d3Sheet(rest,fold,tex,o));const lite=d3Lit(avg,.55);scene.add(d3Mists(fold,d3Lit(avg,.35),3));scene.add(d3Motes(rest,fold,asp<1?70:90,lite));
 D={id,key,src,tex,scene,rest,fold,cam:rest.clone(),t:Math.random()*40};D3.dio.set(id,D);
 if(D3.dio.size>4){const [k,o2]=D3.dio.entries().next().value;D3.dio.delete(k);d3Free(o2);}return D;}
function d3Free(D){try{D.tex.dispose();D.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==undefined)o.material.dispose();});}catch(e){}}
function d3Tick(obj,t,dt){obj.traverse(o=>{if(o.userData.tick)o.userData.tick(t,dt);});}
function d3DrawView(V,dt){const cv=V.cv,r=cv.getBoundingClientRect();if(r.width<4||r.height<4)return;const D=d3Diorama(V.key,r.width,r.height);if(!D){D3.views.delete(cv);return;}
 D.t+=dt;d3Tick(D.scene,D.t,dt);d3Sway(D.cam,D.rest,D.fold,D.t,1);
 const [pw,ph]=d3Px(cv.width,cv.height);d3Blit(D.scene,D.cam,cv.getContext('2d'),pw,ph,0,0,cv.width,cv.height);}
function d3Loop(t){requestAnimationFrame(d3Loop);if(!D3.views.size||document.hidden||!d3Ready())return;const dt=Math.min(.1,(t-(D3.last||t))/1000);if(t-D3.last<30&&D3.last)return;D3.last=t;
 for(const [cv,V] of D3.views){if(!cv.isConnected){D3.views.delete(cv);continue;}if(D3.still&&V.done)continue;try{d3DrawView(V,dt);V.done=1;}catch(e){D3.views.delete(cv);}}}
requestAnimationFrame(d3Loop);
/* 只接管大的背景画布：剧情背景 #vbg、页面上方的 .bgc。小缩略图仍用 2D */
const _paintTo2d=paintTo;
paintTo=function(cv,key){_paintTo2d(cv,key);if(!cv||!key||!cv.isConnected)return;if(!(cv.id==='vbg'||(cv.classList&&cv.classList.contains('bgc'))))return;
 if(!d3Ready()){D3.views.delete(cv);return;}D3.views.set(cv,{cv,key,done:0});};

/* ---------- 设置：存档页里加「画面 3D / 2D」 ---------- */
LATE.push(()=>{
 ACT.d3=()=>{if(D3.ok===false&&!D3.on){toast('这台设备暂时不支持 3D 画面');return;}d3Set(!D3.on);if(D3.on&&!d3Ready()){D3.on=false;toast('这台设备暂时不支持 3D 画面');}render();};
 const _sv=VIEWS.save;VIEWS.save=()=>_sv().replace(/(id="bgmBtn">[^<]*<\/button>)/,`$1 <button class="btn sm ghost" data-act="d3" id="d3Btn">${D3.on&&D3.ok!==false?'画面 3D':'画面 2D'}</button>`);
});

/* ---------- 战斗：立体战场 + 纸片人 ----------
   战场背景还是 btBg 画的那张，折成地面和远景；人物、妖兽是立在地上的纸片，
   一盏斜上方的主光给每张纸片在地上投影子。站位、点选、伤害数字仍用 2D 的坐标，
   所以镜头只做很轻的晃动，并把 2D 特效层跟着挪一点，两边对得上。 */
function d3BtFree(B){try{B.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){o.material.dispose();}if(o.customDepthMaterial)o.customDepthMaterial.dispose();});}catch(e){}}
function d3BtBuild(W,H){const bgc=btBg(BT.bgk,W,H),avg=d3Clean(bgc);if(!avg)return null;
 const asp=W/H,o={fov:44,h:1.6,pitch:.2,fold:.2,tex:1,geo:1.06,bend:0,near:.16};
 const rest=d3RestCam(asp,o),fold=d3Folder(rest,o),scene=new THREE.Scene(),tex=d3Tex(bgc);
 scene.add(d3Sheet(rest,fold,tex,o));
 const piv=fold.ground(0,-.3),sun=new THREE.DirectionalLight(0xffffff,1);sun.position.copy(piv).add(new THREE.Vector3(-3.2,7,2.6));sun.target.position.copy(piv);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:30});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0006;sun.shadow.radius=3;
 scene.add(sun,sun.target);
 const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.42,depthWrite:false}));gnd.rotation.x=-Math.PI/2;gnd.position.y=.003;gnd.receiveShadow=true;gnd.renderOrder=-5;scene.add(gnd);
 scene.add(d3Motes(rest,fold,46,d3Lit(avg,.6),{up:.7}));
 return {W,H,bgk:BT.bgk,bgc,rest,fold,scene,cam:rest.clone(),act:new Map(),t:0,piv,up:new THREE.Vector3(0,1,0).applyQuaternion(rest.quaternion),lastT:BT.t};}
function d3BtActor(B,a){let A=B.act.get(a);if(A)return A;
 const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({transparent:true,alphaTest:.08,depthWrite:true,side:THREE.DoubleSide}));
 m.castShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaTest:.5,side:THREE.DoubleSide});
 const b=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:d3BlobTex(),transparent:true,depthWrite:false}));b.rotation.x=-Math.PI/2;b.renderOrder=-4;
 B.scene.add(m,b);A={m,b,g:new THREE.Vector3(),v:new THREE.Vector3()};B.act.set(a,A);return A;}
function d3Battle(x,W,H,sh){if(!BT||!d3Ready())return null;let B=BT.d3;if(B===false)return null;
 if(!B||B.W!==W||B.H!==H||B.bgk!==BT.bgk||B.bgc!==btBg(BT.bgk,W,H)){if(B)d3BtFree(B);if(D3.bt&&D3.bt!==B)d3BtFree(D3.bt);B=BT.d3=d3BtBuild(W,H);D3.bt=B;if(!B){BT.d3=false;return null;}}
 const dt=Math.max(0,Math.min(.1,BT.t-B.lastT));B.lastT=BT.t;B.t+=dt;
 const C=B.fold.C,f=B.fold.f,tf=2*Math.tan(B.rest.fov*Math.PI/360)/H;
 for(const a of [...BT.foes,...BT.party]){const A=d3BtActor(B,a),m=A.m,b=A.b;if(a.alpha<=.01){m.visible=b.visible=false;continue;}m.visible=b.visible=true;
  const s=btSpr(a),bob=a.alive&&a.side==='e'?Math.sin(BT.t*3+a.idx)*1.5:0,X=a.bx+a.ox,Y=a.by+a.oy;
  B.fold.ground(X/W*2-1,1-Y/H*2,A.g);const u=A.v.copy(A.g).sub(C).dot(f)*tf,big=a.big>0?1.35:1;
  m.position.copy(A.g).addScaledVector(B.up,-bob*u);m.quaternion.copy(B.rest.quaternion);m.scale.set(s.ww*u*big,s.hh*u*big,1);
  const tex=d3Tex(s);if(m.material.map!==tex){m.material.map=tex;m.material.needsUpdate=true;m.customDepthMaterial.map=tex;m.customDepthMaterial.needsUpdate=true;}
  m.material.opacity=a.alpha;
  b.position.set(A.g.x,.006,A.g.z);const bw=s.ww*u*.75;b.scale.set(bw,bw*.45,1);b.material.opacity=a.alpha;}
 d3Tick(B.scene,B.t,dt);d3Sway(B.cam,B.rest,B.fold,B.t,BT.shake>0?.55:.3);
 const P=B.piv.clone().project(B.cam),dx=P.x/2*W,dy=-(P.y+.3)/2*H;
 const [pw,ph]=d3Px(W*BT.k,H*BT.k);x.save();x.globalAlpha=1;d3Blit(B.scene,B.cam,x,pw,ph,sh,0,W,H);x.restore();
 return {dx,dy};}
