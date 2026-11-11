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
 if(D3.tex.size>300){const [k,o]=D3.tex.entries().next().value;D3.tex.delete(k);o.dispose();}return t;}
/* 画能不能当贴图（跨域图片会让画布「变脏」，WebGL 不让用） */
function d3Clean(cv){try{const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.drawImage(cv,0,0,1,1);const d=x.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]];}catch(e){return null;}}
let _d3Dot=null;function d3DotTex(){if(_d3Dot)return _d3Dot;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);_d3Dot=new THREE.CanvasTexture(c);return _d3Dot;}
let _d3Mist=null;function d3MistTex(){if(_d3Mist)return _d3Mist;const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d'),R=rng(77);
 for(let i=0;i<26;i++){const cx=20+R()*216,cy=34+R()*30,r=14+R()*30,g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
 /* 四周淡出，免得露出贴图的方边 */
 x.globalCompositeOperation='destination-in';let m=x.createLinearGradient(0,0,256,0);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.3,'#000');m.addColorStop(.7,'#000');m.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,256,96);
 m=x.createLinearGradient(0,0,0,96);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.5,'#000');m.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,256,96);
 _d3Mist=new THREE.CanvasTexture(c);_d3Mist.colorSpace=THREE.SRGBColorSpace;return _d3Mist;}
let _d3Blob=null;function d3BlobTex(){if(_d3Blob)return _d3Blob;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.6,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);_d3Blob=new THREE.CanvasTexture(c);return _d3Blob;}

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
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.35),new THREE.MeshBasicMaterial({map:d3MistTex(),color:col,transparent:true,depthWrite:false,opacity:.1+R()*.06}));
  const s=fold.C.clone().addScaledVector(fold.f,d);m.position.set(p.x,Math.max(.1,p.y*.6+.15),s.z);m.userData.x0=m.position.x;m.userData.sp=(.03+R()*.05)*(R()<.5?-1:1)*d;G.add(m);}
 G.userData.tick=t=>G.children.forEach(m=>{m.position.x=m.userData.x0+Math.sin(t*.05+m.userData.sp)*m.userData.sp*2;m.lookAt(fold.C.x,m.position.y,fold.C.z);});return G;}
const d3Lit=(rgb,k)=>new THREE.Color().setRGB(...rgb.map(v=>Math.min(1,(v/255)*(1-k)+k)),THREE.SRGBColorSpace);
/* 镜头绕着场景中间慢慢转：左右、上下、轻轻推近 */
function d3Sway(cam,rest,fold,t,amp){const piv=fold.C.clone().addScaledVector(fold.f,fold.D*.5),off=rest.position.clone().sub(piv);
 const yaw=Math.sin(t*.21)*.035*amp+Math.sin(t*.077)*.02*amp,pit=Math.sin(t*.16+1)*.012*amp,dol=(.5+.5*Math.sin(t*.12))*.05*amp;
 off.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);off.applyAxisAngle(new THREE.Vector3(1,0,0).applyQuaternion(rest.quaternion),pit);off.multiplyScalar(1-dol);
 cam.position.copy(piv).add(off);cam.lookAt(piv);cam.updateMatrixWorld(true);}

/* ---------- 布景：剧情背景、页面上方的场景图 ---------- */
const D3_OVER=1.2;
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
 const piv=fold.ground(0,-.3),sun=new THREE.DirectionalLight(0xffffff,1);sun.position.copy(piv).add(new THREE.Vector3(-4.6,4.4,3.4));sun.target.position.copy(piv);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:30});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0006;sun.shadow.radius=3;
 scene.add(sun,sun.target);
 const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.6,depthWrite:false}));gnd.rotation.x=-Math.PI/2;gnd.position.y=.003;gnd.receiveShadow=true;gnd.renderOrder=-5;scene.add(gnd);
 scene.add(d3Motes(rest,fold,46,d3Lit(avg,.6),{up:.7}));
 return {W,H,bgk:BT.bgk,bgc,rest,fold,scene,cam:rest.clone(),act:new Map(),t:0,piv,up:new THREE.Vector3(0,1,0).applyQuaternion(rest.quaternion),lastT:BT.t};}
function d3BtActor(B,a){let A=B.act.get(a);if(A)return A;
 const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({transparent:true,alphaTest:.03,depthWrite:false,side:THREE.DoubleSide}));
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

/* ---------- 江湖行走：立体地形 + 立起来的纸片 ----------
   地砖铺成真正的 3D 地面（原来斜着画的菱形砖，转回正方形当贴图），地图边上露出断崖侧面，
   水面比地面低一截，岸边有一道土坎。墙、柱子、车厢、货箱这类「方块」物件做成真正的立方体
   （六个面的花纹从原来的图上剪下来贴上去），树、人物、妖兽是竖着的纸片，始终转过来对着镜头。
   镜头：两指拖动或拧转 = 绕着自己转，两指捏合 = 拉远拉近，单指按住横拖也能转；地图右下有 ⟲ ⟳。
   视角存在 localStorage 的 lingchao_w3cam，不进存档。
   光：太阳斜照投影子；夜里、洞里灯火、篝火、传送门和自己身上都是真的点光，会照亮地面和墙。
   画完再加一道「移轴」：画面上方远处、下方近处略微虚化，中间清楚，像微缩模型。
   前后遮挡按镜头方向的远近重新排（转了视角也对），点选、名字标签按 3D 镜头重新换算，
   最后换回原来斜视角的坐标交给 wTap，所以走路、对话逻辑一行没改。 */
const W3K=1/(16*Math.SQRT2);/* 原来斜视角里的 1 像素 = 多少 3D 长度 */
const W3ZMIN=.62,W3ZMAX=1.7,W3SINK=.2,W3Q=Math.PI/4;
const W3={M:null,sig:'',chk:0,scene:null,cam:null,sun:null,amb:null,water:[],obj:new Map(),spec:new Map(),rk:new Map(),seen:0,
 pitch:.56,fov:42,d:10,fail:0,live:false,up:null,right:null,fwd:null,fl:null,vs:1,UP:null,
 yaw:0,yawT:0,HOLE:{value:typeof THREE!=='undefined'?new THREE.Vector3(0,0,1):null},zoom:1,zoomT:1,tc:0,tr:0,snap:1,lt:0,cy:0,pl:[],post:null,nofx:0,ema:0,nf:0,R:null,gest:0};
try{const c=JSON.parse(localStorage.getItem('lingchao_w3cam')||'{}');if(isFinite(c.y))W3.yaw=W3.yawT=+c.y;if(isFinite(c.z))W3.zoom=W3.zoomT=Math.max(W3ZMIN,Math.min(W3ZMAX,+c.z));}catch(e){}
function w3SaveCam(){try{localStorage.setItem('lingchao_w3cam',JSON.stringify({y:+W3.yawT.toFixed(3),z:+W3.zoomT.toFixed(3)}));}catch(e){}}
const w3X=(c,r)=>(c-r)/Math.SQRT2,w3Z=(c,r)=>(c+r)/Math.SQRT2;
const w3Wet=ty=>{const T=TL[ty];return !!(T&&(T.water||ty==='lava'||ty==='puddle'));};
/* 沿镜头方向的「靠前程度」：转到原来的角度时正好等于 c+r，越大越靠近镜头 */
const w3Key=(c,r)=>-(w3X(c,r)*W3.fl.x+w3Z(c,r)*W3.fl.z)*Math.SQRT2;
function w3Sig(M){return M.g.join(',');}
function w3Free(){if(!W3.scene)return;W3.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.userData.atlas&&o.material.map)o.material.map.dispose();o.material.dispose();}if(o.customDepthMaterial)o.customDepthMaterial.dispose();});
 W3.spec.forEach(s=>{if(!s)return;s.tex.dispose();s.geo.dispose();s.mat.dispose();});W3.spec=new Map();W3.rk=new Map();W3.scene=null;W3.obj=new Map();W3.water=[];W3.pl=[];}
/* 菱形砖 → 正方形贴图，拼成一张大图。
   斜视角里：砖的上角 = 正方形左上，右角 = 右上，左角 = 左下，下角 = 右下 */
function w3Atlas(keys){const n=keys.length,N=n>240?64:128,cols=Math.min(16,Math.max(1,n)),rows=Math.ceil(n/cols);const cv=document.createElement('canvas');cv.width=cols*N;cv.height=Math.max(N,rows*N);const x=cv.getContext('2d'),at=new Map();
 keys.forEach((k,i)=>{const [ty,v]=k.split('|'),T=TL[ty]||TL.tile,src=tileCv(ty,+v),w=src.width,h=src.height,ox=(i%cols)*N,oy=Math.floor(i/cols)*N;
  x.setTransform(1,0,0,1,0,0);x.fillStyle=T.c?T.c[0]:'#444';x.fillRect(ox,oy,N,N);
  x.save();x.beginPath();x.rect(ox,oy,N,N);x.clip();const s=1.05,cx=ox+N/2,cy=oy+N/2;/* 放大一点盖住菱形边上的接缝 */
  x.setTransform(N*s/w,-N*s/w,N*s/h,N*s/h,cx-N*s,cy);x.drawImage(src,0,0);x.restore();at.set(k,[ox/cv.width,oy/cv.height,(ox+N)/cv.width,(oy+N)/cv.height]);});
 x.setTransform(1,0,0,1,0,0);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;t.anisotropy=4;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return {t,at,px:cv.width};}
/* 灯光颜色：'rgba(255,180,90,.25)' → 颜色 */
function w3Col(s){const m=String(s||'').match(/[\d.]+/g);if(!m||m.length<3)return new THREE.Color(1,.78,.5);return new THREE.Color().setRGB(+m[0]/255,+m[1]/255,+m[2]/255,THREE.SRGBColorSpace);}
function w3Build(M){w3Free();W3.M=M;W3.sig=w3Sig(M);W3.chk=WD.t;W3.snap=1;const sc=new THREE.Scene(),bg=new THREE.Color(M.bg||'#0c0b09');sc.background=bg;sc.fog=new THREE.Fog(bg.clone(),30,80);W3.scene=sc;
 const keys=new Set();for(let r=0;r<M.H;r++)for(let c=0;c<M.W;c++){const i=gi(M,c,r),ty=M.g[i],T=TL[ty];if(T&&T.none)continue;if(w3Wet(ty))for(let v=0;v<4;v++)keys.add(ty+'|'+v);else keys.add(ty+'|'+M.gv[i]);}
 const A=w3Atlas([...keys]),mat=new THREE.MeshLambertMaterial({map:A.t,side:THREE.DoubleSide}),wmat=new THREE.MeshPhongMaterial({map:A.t,side:THREE.DoubleSide,specular:0x5a6a70,shininess:48});
 const isNone=(c,r)=>{if(c<0||r<0||c>=M.W||r>=M.H)return true;const T=TL[M.g[gi(M,c,r)]];return !!(T&&T.none);};
 /* 每格的高度：深水、岩浆往下沉一截；能走的水洼不沉 */
 const hgt=(c,r)=>{if(isNone(c,r))return null;const ty=M.g[gi(M,c,r)],T=TL[ty];return w3Wet(ty)&&T&&T.nw?-W3SINK:0;};
 /* 地面：普通砖一块，水面四块（四帧轮流显示，水就会动） */
 const mk=()=>({p:[],u:[],i:[]}),land=mk(),wf=[mk(),mk(),mk(),mk()],side={p:[],c:[],i:[]},e=.5/A.px;
 const quad=(B,c,r,uv,y)=>{const n=B.p.length/3;[[c-.5,r-.5],[c+.5,r-.5],[c+.5,r+.5],[c-.5,r+.5]].forEach(([a,b])=>B.p.push(w3X(a,b),y,w3Z(a,b)));
  B.u.push(uv[0]+e,uv[1]+e,uv[2]-e,uv[1]+e,uv[2]-e,uv[3]-e,uv[0]+e,uv[3]-e);B.i.push(n,n+1,n+2,n,n+2,n+3);};
 /* 断崖侧面、岸边土坎：上浅下深的土色 */
 const DEP=.85,wall=(a0,b0,a1,b1,y0,y1,top,bot)=>{const n=side.p.length/3;
  side.p.push(w3X(a0,b0),y0,w3Z(a0,b0),w3X(a1,b1),y0,w3Z(a1,b1),w3X(a1,b1),y1,w3Z(a1,b1),w3X(a0,b0),y1,w3Z(a0,b0));
  [top,top,bot,bot].forEach(k=>side.c.push(k.r,k.g,k.b));side.i.push(n,n+1,n+2,n,n+2,n+3);};
 const NB=[[0,1,-.5,.5,.5,.5],[1,0,.5,-.5,.5,.5],[0,-1,-.5,-.5,.5,-.5],[-1,0,-.5,-.5,-.5,.5]];
 for(let r=0;r<M.H;r++)for(let c=0;c<M.W;c++){const i=gi(M,c,r),ty=M.g[i],T=TL[ty]||TL.tile;if(TL[ty]&&TL[ty].none)continue;const y=hgt(c,r);
  if(w3Wet(ty))for(let f=0;f<4;f++)quad(wf[f],c,r,A.at.get(ty+'|'+((M.gv[i]+f)%4)),y);else quad(land,c,r,A.at.get(ty+'|'+M.gv[i]),y);
  const col=T.c?T.c[0]:'#444';
  NB.forEach(([dc,dr,a0,b0,a1,b1])=>{const h2=hgt(c+dc,r+dr);
   if(h2===null)wall(c+a0,r+b0,c+a1,r+b1,y,-DEP,new THREE.Color(pSh(col,-.28)),new THREE.Color(pSh(col,-.72)));
   else if(h2<y-1e-3)wall(c+a0,r+b0,c+a1,r+b1,y,h2,new THREE.Color(pSh(col,-.3)),new THREE.Color(pSh(col,-.6)));});}
 const geo=B=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));g.setIndex(B.i);g.computeVertexNormals();g.computeBoundingSphere();return g;};
 if(land.i.length){const m=new THREE.Mesh(geo(land),mat);m.userData.atlas=1;m.receiveShadow=true;sc.add(m);}
 W3.water=wf.map(B=>{if(!B.i.length)return null;const m=new THREE.Mesh(geo(B),wmat);m.receiveShadow=true;sc.add(m);return m;}).filter(Boolean);
 if(side.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(side.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(side.c,3));g.setIndex(side.i);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.receiveShadow=true;sc.add(m);}
 /* 断崖下面的「谷底」：一大片低一截的地，用这张图最常见的地砖颜色压暗，远处融进雾里，地图边外不会是一个黑洞 */
 {const cnt=new Map();M.g.forEach(ty=>{const T=TL[ty];if(T&&!T.none&&T.c)cnt.set(ty,(cnt.get(ty)||0)+1);});let top=null,n=-1;cnt.forEach((v,k)=>{if(v>n){n=v;top=k;}});
  const col=top?TL[top].c[0]:(M.bg||'#222'),ext=(M.W+M.H)*1.6+40,m=new THREE.Mesh(new THREE.PlaneGeometry(ext,ext),new THREE.MeshLambertMaterial({color:new THREE.Color(pSh(col,-.62)).lerp(bg,.35)}));
  m.rotation.x=-Math.PI/2;m.position.set(w3X(M.W/2,M.H/2),-DEP,w3Z(M.W/2,M.H/2));m.receiveShadow=true;sc.add(m);}
 /* 地面画完先清掉深度：纸片人脚下那几像素会伸到地面以下，照旧显示；方块和纸片之间才真正比远近 */
 const clr=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3)),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthTest:false}));
 clr.frustumCulled=false;clr.renderOrder=5;clr.onBeforeRender=R=>{R.state.buffers.depth.setMask(true);R.clearDepth();};sc.add(clr);
 /* 光：环境光 + 斜上方的太阳。白天两者加起来正好等于原来不打光的颜色，太阳被挡住的地方就是影子 */
 const amb=new THREE.AmbientLight(0xffffff,Math.PI*.62);sc.add(amb);W3.amb=amb;
 const sun=new THREE.DirectionalLight(0xffffff,Math.PI*.38/.766);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:44});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;sun.shadow.normalBias=.02;sun.shadow.radius=2.5;
 sc.add(sun,sun.target);W3.sun=sun;
 /* 点光：夜里、洞里才开；数量固定，免得着色器反复重编 */
 if(M.dark>0)for(let k=0;k<6;k++){const L=new THREE.PointLight(0xffc880,0,6,1.4);sc.add(L);W3.pl.push(L);}
 W3.cam=W3.cam||new THREE.PerspectiveCamera(W3.fov,1,.1,200);}
/* ---------- 方块物件：把画里的立方体（isoBox）找出来，做成真的立方体 ---------- */
const W3NOBOX=new Set(['leitai']);
/* 已知三个点对应关系，求把 a 画到 b 的仿射变换 */
function w3Aff(x,S,D,cv){const [s0,s1,s2]=S,[d0,d1,d2]=D,a1=s1[0]-s0[0],b1=s1[1]-s0[1],a2=s2[0]-s0[0],b2=s2[1]-s0[1],det=a1*b2-a2*b1;if(Math.abs(det)<1e-6)return;
 const i11=b2/det,i12=-a2/det,i21=-b1/det,i22=a1/det,p1=d1[0]-d0[0],q1=d1[1]-d0[1],p2=d2[0]-d0[0],q2=d2[1]-d0[1];
 const A11=p1*i11+p2*i21,A12=p1*i12+p2*i22,A21=q1*i11+q2*i21,A22=q1*i12+q2*i22;x.setTransform(A11,A21,A12,A22,d0[0]-(A11*s0[0]+A12*s0[1]),d0[1]-(A21*s0[0]+A22*s0[1]));x.drawImage(cv,0,0);}
function w3Spec(type,v,z){const zi=z<0?0:Math.min(ZPAL.length-1,z),id=type+'|'+v+'|'+zi;if(W3.spec.has(id))return W3.spec.get(id);let sp=null;try{sp=w3MkSpec(type,v,zi);}catch(e){console.warn(e);sp=null;}W3.spec.set(id,sp);return sp;}
function w3MkSpec(type,v,zi){if(W3NOBOX.has(type))return null;const D=PR[type]||PR.rock,W=D.w||48,H=D.h,cx=D.cx||24,by=H-10,list=[];
 /* 重画一遍，只记下画了哪些立方体 */
 const ib=isoBox;isoBox=function(g,bx,bb,hw,h){list.push([bx,bb,hw,h]);return ib.apply(this,arguments);};
 try{D.f(new VX(W,H,1),rng(v*53+type.length*17+zi*7+3),ZPAL[zi],cx,by,v);}finally{isoBox=ib;}
 const bx=list.filter(b=>b[2]>=4&&b[3]>=2);if(!bx.length)return null;
 const pc=propCv(type,v,zi),cv=pc.cv,s=cv.width/pc.w,ax=pc.ax,ay=pc.ay;
 /* 每个立方体一行：左面（朝 +r）、右面（朝 +c）、顶面 */
 const rows=bx.map(([bcx,bby,hw,h])=>({bcx,bby,hw,h,Lw:Math.ceil(hw*s),Lh:Math.ceil(h*s),Tw:Math.ceil(hw*s)}));
 const TW=Math.max(...rows.map(o=>o.Lw*2+o.Tw+4)),TH=rows.reduce((a,o)=>a+Math.max(o.Lh,o.Tw)+2,0);
 const tc=document.createElement('canvas');tc.width=TW;tc.height=TH;const x=tc.getContext('2d');let oy=0;
 const P=[],U=[],I=[];let top=0,rad=0;
 rows.forEach(o=>{const {bcx,bby,hw,h,Lw,Lh,Tw}=o,hh=hw/2,ex=.6/hw,ey=.6/Math.max(2,h),S=(px,py)=>[px*s,py*s];
  const cell=(x0,w,hc,src)=>{x.save();x.setTransform(1,0,0,1,0,0);x.beginPath();x.rect(x0,oy,w,hc);x.clip();w3Aff(x,src,[[x0,oy],[x0+w,oy],[x0,oy+hc]],cv);x.restore();};
  /* 原图里：左面 = 左角→下角，右面 = 下角→右角，顶面 = 上角→右角 / 上角→左角（往里缩一点，免得带进透明的边） */
  const L=(u,w)=>S(bcx-hw+u*hw,bby-h+u*hh+w*h),Rf=(u,w)=>S(bcx+u*hw,bby-h+hh-u*hh+w*h),T=(u,w)=>S(bcx+u*hw-w*hw,bby-h-hh+u*hh+w*hh);
  cell(0,Lw,Lh,[L(ex,ey),L(1-ex,ey),L(ex,1-ey)]);cell(Lw+2,Lw,Lh,[Rf(ex,ey),Rf(1-ex,ey),Rf(ex,1-ey)]);cell(Lw*2+4,Tw,Tw,[T(ex,ex),T(1-ex,ex),T(ex,1-ex)]);
  /* 摆到 3D：正上方挪动当成「垫高」，别的挪动当成在地上前后左右挪 */
  const dx=bcx-ax,dy=bby-ay;let el=0,dc=0,dr=0;if(Math.abs(dx)<1&&dy<0)el=-dy;else{dc=(dx/16+dy/8)/2;dr=(dy/8-dx/16)/2;}
  const e=hw/32,y0=el*W3K,y1=(el+h)*W3K,uL0=0,uL1=Lw/TW,uR0=(Lw+2)/TW,uR1=(Lw*2+2)/TW,uT0=(Lw*2+4)/TW,uT1=(Lw*2+4+Tw)/TW,v0=oy/TH,vL=(oy+Lh)/TH,vT=(oy+Tw)/TH;
  const face=(q,uv)=>{const n=P.length/3;q.forEach(([c,r,y])=>P.push(w3X(c,r),y,w3Z(c,r)));U.push(...uv);I.push(n,n+2,n+1,n,n+3,n+2);};
  const c0=dc,r0=dr;
  for(const sr of [1,-1])face([[c0-e,r0+sr*e,y1],[c0+e,r0+sr*e,y1],[c0+e,r0+sr*e,y0],[c0-e,r0+sr*e,y0]],[uL0,v0,uL1,v0,uL1,vL,uL0,vL]);
  for(const sc2 of [1,-1])face([[c0+sc2*e,r0+e,y1],[c0+sc2*e,r0-e,y1],[c0+sc2*e,r0-e,y0],[c0+sc2*e,r0+e,y0]],[uR0,v0,uR1,v0,uR1,vL,uR0,vL]);
  face([[c0-e,r0-e,y1],[c0+e,r0-e,y1],[c0+e,r0+e,y1],[c0-e,r0+e,y1]],[uT0,v0,uT1,v0,uT1,vT,uT0,vT]);
  top=Math.max(top,el+h);rad=Math.max(rad,(Math.abs(dc)+Math.abs(dr))/Math.SQRT2+e*Math.SQRT2);oy+=Math.max(Lh,Tw)+2;});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();
 const tex=new THREE.CanvasTexture(tc);tex.colorSpace=THREE.SRGBColorSpace;tex.flipY=false;tex.anisotropy=4;
 /* 画里本来就画了明暗，打光再压一层会太黑：底色稍微提亮 */
 const mat=new THREE.MeshLambertMaterial({map:tex,alphaTest:.45,side:THREE.DoubleSide,color:new THREE.Color(1.16,1.16,1.16)});
 /* 剩下不是立方体的部分（屋顶、旗杆、灯）还当纸片立着 */
 const rc=document.createElement('canvas');rc.width=cv.width;rc.height=cv.height;const rx=rc.getContext('2d');rx.drawImage(cv,0,0);rx.globalCompositeOperation='destination-out';rx.lineWidth=1.8*s;rx.lineJoin='round';
 bx.forEach(([bcx,bby,hw,h])=>{const hh=hw/2;rx.beginPath();[[bcx-hw,bby-h],[bcx,bby-h-hh],[bcx+hw,bby-h],[bcx+hw,bby],[bcx,bby+hh],[bcx-hw,bby]].forEach(([a,b],i)=>i?rx.lineTo(a*s,b*s):rx.moveTo(a*s,b*s));rx.closePath();rx.fill();rx.stroke();});
 const id=rx.getImageData(0,0,rc.width,rc.height),d=id.data;let left=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<110&&d[i]+d[i+1]+d[i+2]<180)d[i+3]=0;if(d[i+3]>140)left++;}
 let res=null;if(left>rc.width*rc.height*.012){rx.globalCompositeOperation='copy';rx.putImageData(id,0,0);res=rc;}
 return {geo:g,tex,mat,res,top,rad,w:pc.w,h:pc.h,ax,ay};}
/* 摆一个方块物件 */
/* 挡住自己的方块：不整块变透明（会露出所有面，像个幽灵盒子），而是在自己身边挖一个边缘细碎的椭圆洞，
   洞里看得到自己，方块其余部分照常实心。洞的位置、大小每帧更新（W3.HOLE，单位是画板像素） */
function w3Hole(m){const on={value:0};m.userData.on=on;m.material.onBeforeCompile=sh=>{sh.uniforms.uHole=W3.HOLE;sh.uniforms.uOn=on;
  sh.fragmentShader='uniform vec3 uHole;uniform float uOn;\n'+sh.fragmentShader.replace('void main() {','void main() {\n if(uOn>.5){vec2 q=gl_FragCoord.xy-uHole.xy;q.y*=.62;float d=length(q)/uHole.z;float n=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(d<1.&&n>smoothstep(.45,1.,d))discard;}');};
 m.material.customProgramCacheKey=()=>'w3hole';}
function w3Box(p,sp,al,ord){let o=W3.obj.get(p);if(o&&o.sp!==sp){w3Drop(p,o);o=null;}
 if(!o){const m=new THREE.Mesh(sp.geo,sp.mat.clone());w3Hole(m);m.castShadow=true;m.receiveShadow=true;m.renderOrder=10;W3.scene.add(m);o={m,sp,box:1,seen:0};W3.obj.set(p,o);}
 o.seen=W3.seen;const m=o.m;m.position.set(w3X(p.c,p.r),0,w3Z(p.c,p.r));m.scale.set(1,W3.vs,1);m.userData.on.value=al<.99?1:0;}
function w3Drop(k,o){W3.scene.remove(o.m);if(!o.box)o.m.geometry.dispose();o.m.material.dispose();if(o.m.customDepthMaterial)o.m.customDepthMaterial.dispose();W3.obj.delete(k);}
/* 纸片：底边中点为原点，竖直立着、左右转向镜头；按镜头方向的远近排先后 */
function w3Card(key){let o=W3.obj.get(key);if(o)return o;const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({transparent:true,depthTest:true,depthWrite:false,alphaTest:.02,side:THREE.DoubleSide}));
 m.castShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaTest:.5,side:THREE.DoubleSide});
 W3.scene.add(m);o={m,seen:0};W3.obj.set(key,o);return o;}
const _w3a=typeof THREE!=="undefined"?new THREE.Vector3():null;
/* 摆一张纸片：cv 图、(x,y) 站的格子、ax/ay 原图里「脚下那一点」离左边/上边多远、w/h 原图显示尺寸、ord 前后顺序、al 透明度、lift 往上抬几像素、
   push 往镜头挪多远（沿视线挪，画面上大小位置不变，只是比方块更靠前） */
function w3Put(key,cv,x,y,ax,ay,w,h,ord,al,lift,push){const o=w3Card(key),m=o.m;o.seen=W3.seen;m.visible=al>.01;if(!m.visible)return;
 const tex=d3Tex(cv);if(m.material.map!==tex){m.material.map=tex;m.material.needsUpdate=true;m.customDepthMaterial.map=tex;m.customDepthMaterial.needsUpdate=true;}
 m.material.opacity=al;m.renderOrder=1000+Math.round((ord+400)*40);m.rotation.set(0,W3.cy,0);
 _w3a.set(w3X(x,y),0,w3Z(x,y));m.position.copy(_w3a).addScaledVector(W3.right,-(ax-w/2)*W3K).addScaledVector(W3.UP,(-(h-ay)+(lift||0))*W3K);let k=1;
 if(push){const C=W3.cam.position,hd=(_w3a.x-C.x)*W3.fl.x+(_w3a.z-C.z)*W3.fl.z;k=Math.max(.5,1-push/Math.max(1,hd));m.position.sub(C).multiplyScalar(k).add(C);}
 m.scale.set(w*W3K*k,h*W3K*W3.vs*k,1);}
/* 转了视角以后，人物朝哪边要跟着换：0 朝右前、1 朝左前、2 朝右后、3 朝左后 */
function w3Dir(d){const v=DIRV[d]||DIRV[0],x=w3X(v[0],v[1]),z=w3Z(v[0],v[1]),sr=x*W3.right.x+z*W3.right.z,st=-(x*W3.fl.x+z*W3.fl.z);return st>=-1e-3?(sr>=0?0:1):(sr>=0?2:3);}
function w3Sync(M,P,t){W3.seen++;W3.fade=new Set();const pk=w3Key(P.x,P.y),pq=w3P(P.x,P.y,14);
 /* 挡住自己的高物件变半透明：在画面上盖住自己、而且比自己更靠近镜头 */
 const covers=(c,r,ax,ay,w,h)=>{const [sx,sy]=w3P(c,r),k=w3S(c,r);return pq[0]>sx-ax*k-2&&pq[0]<sx+(w-ax)*k+2&&pq[1]>sy-ay*k+4&&pq[1]<sy+4;};
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;if(p.type==='portal'||p.type==='spark')return;const pc=propCv(p.type,p.v,M.z),sp=w3Spec(p.type,p.v,M.z),ord=w3Key(p.c,p.r)+(p.blocks?0:-.45);
  let al=1;if((pc.tall||(sp&&sp.top>30))&&ord>pk+.3&&covers(p.c,p.r,pc.ax+(sp?6:0),pc.ay,pc.w+(sp?12:0),pc.h))al=.42;
  /* 视角转到墙后时：比自己靠前、在画面上从脚下一直挡到身上的整排高方块都变半透明（剖面效果） */
  if(al===1&&sp&&sp.top>30&&ord>pk+.5){const q=w3P(p.c,p.r),q2=w3P(p.c,p.r,sp.top);if(Math.abs(q[0]-pq[0])<64&&q[1]>pq[1]-4&&q2[1]<pq[1]+18)al=.38;}
  if(al<1)W3.fade.add(p);
  if(sp){w3Box(p,sp,al,ord);if(sp.res){let rk=W3.rk.get(p);if(!rk){rk={};W3.rk.set(p,rk);}w3Put(rk,sp.res,p.c,p.r,pc.ax,pc.ay,pc.w,pc.h,ord+.01,al,0,sp.rad+.05);}}
  else w3Put(p,pc.cv,p.c,p.r,pc.ax,pc.ay,pc.w,pc.h,ord,al,0,.12);});
 const ent=(e,d)=>{if(e.kind==='foe'){const s=e.boss?1.1:.72,base=monCv(e.look,s,e.tint),vd=w3Dir(e.dir),cv=(vd===1||vd===3)?cvMemo('fl|'+e.look+'|'+s+'|'+(e.tint?1:0),()=>flipCv(base)):base;
   const bob=Math.round(Math.sin(t*4+(e.home?e.home[0]:0))*1),w=dw(cv),h=dh(cv);w3Put(e,cv,e.x,e.y,w/2,h-2,w,h,d,e.stun>0?.55:1,-bob,.3);return;}
  const key=e.kind==='player'?(S.gender==='f'?'hero_f':'hero_m'):e.k,sp=typeof key==='string'?CH[key]:key,ghost=sp&&sp.ghost;
  const fr=e.moving&&!ghost?[1,0,2,0][Math.floor(e.ft*9)%4]:0,cv=chSpr(key,w3Dir(e.dir),fr);let lift=0,al=1;
  if(ghost){lift=9+Math.round(Math.sin(t*2.5)*2);al=.75;}if(e.kind==='player'&&e.inv>0&&Math.floor(t*10)%2)al=.45;if(e.kind==='player'&&WD.fly)lift+=7+Math.sin(t*4)*1.5;
  w3Put(e,cv,e.x,e.y,10,dh(cv)-2,20,32,d,al,lift,.3);};
 M.ents.forEach(e=>{if(!e.dead)ent(e,w3Key(e.x,e.y)+.02);});WD.F.forEach(f=>ent(f,w3Key(f.x,f.y)-.03));ent(P,pk+.03);
 for(const [k,o] of W3.obj)if(o.seen!==W3.seen)w3Drop(k,o);}
/* 3D 点 → 画面坐标（和 WD.W/WD.H 同一套单位）；h 是往上抬几像素 */
const _w3p=typeof THREE!=="undefined"?new THREE.Vector3():null;
function w3P(x,y,h){_w3p.set(w3X(x,y),0,w3Z(x,y));if(h)_w3p.addScaledVector(W3.UP,h*W3K);_w3p.project(W3.cam);return [(_w3p.x+1)/2*WD.W,(1-_w3p.y)/2*WD.H];}
/* 这一点相对原来斜视角的远近缩放（近大远小，拉近镜头也会变大） */
function w3S(x,y){_w3p.set(w3X(x,y),0,w3Z(x,y)).sub(W3.cam.position);const z=_w3p.dot(W3.fwd);return z<.5?0:W3.d/z;}/* 在镜头背后的点返回 0（不画、不点） */
/* 镜头：跟着自己走，绕自己转（yaw），远近（zoom）；拉近时俯角稍微放低，更有纵深 */
function w3Cam(t){const W=WD.W,H=WD.H,cam=W3.cam,P=WD.P,M=WD.M,dt=Math.max(0,Math.min(.1,t-W3.lt));W3.lt=t;
 const k=W3.snap?1:Math.min(1,dt*7),kz=W3.snap?1:Math.min(1,dt*9);W3.yaw+=(W3.yawT-W3.yaw)*kz;W3.zoom+=(W3.zoomT-W3.zoom)*kz;
 cam.aspect=W/H;cam.fov=W3.fov;cam.updateProjectionMatrix();
 const d=H*W3K/(2*Math.tan(W3.fov*Math.PI/360));W3.d=d;
 const drift=D3.still?0:Math.sin(t*.11)*.045+Math.sin(t*.047+1)*.025,yaw=W3.yaw+drift,p=W3.pitch+(W3.zoom-1)*.14,D=d*W3.zoom;W3.cy=yaw;W3.vs=1/Math.cos(p);
 const T=new THREE.Vector3(),place=(c,r)=>{T.set(w3X(c,r),0,w3Z(c,r));cam.position.set(T.x+Math.sin(yaw)*Math.cos(p)*D,Math.sin(p)*D,T.z+Math.cos(yaw)*Math.cos(p)*D);cam.lookAt(T);cam.updateMatrixWorld(true);};
 /* 镜头中心：跟着自己，但按镜头此刻真正看得到的那片地（下边两角、下边中间、两侧中段）往回收，
    让画面下半部分和两侧始终是地面，不会露出大块空洞；地图比画面还小时就居中 */
 let gc=P.x,gr=P.y;const v=new THREE.Vector3(),C=new THREE.Vector3(),SP=[[-1,-1],[0,-1],[1,-1],[-1,-.35],[1,-.35],[-.6,.25],[.6,.25]],lo=-.9;
 for(let it=0;it<4;it++){place(gc,gr);C.copy(cam.position);let c0=0,c1=0,r0=0,r1=0;
  for(const [nx,ny] of SP){v.set(nx,ny,.5).unproject(cam).sub(C);if(v.y>-1e-3)continue;v.multiplyScalar(-C.y/v.y).add(C);const c=(v.z+v.x)/Math.SQRT2,r=(v.z-v.x)/Math.SQRT2;
   c0=Math.max(c0,lo-c);c1=Math.max(c1,c-(M.W-1-lo));r0=Math.max(r0,lo-r);r1=Math.max(r1,r-(M.H-1-lo));}
  const dc=c0&&c1?(c0-c1)/2:c0-c1,dr=r0&&r1?(r0-r1)/2:r0-r1;if(Math.abs(dc)<.01&&Math.abs(dr)<.01)break;gc+=dc;gr+=dr;}
 W3.tc+=(gc-W3.tc)*k;W3.tr+=(gr-W3.tr)*k;W3.snap=0;place(W3.tc,W3.tr);
 W3.up=new THREE.Vector3(0,1,0).applyQuaternion(cam.quaternion);W3.right=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion);W3.fwd=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);
 W3.fl=new THREE.Vector3(W3.fwd.x,0,W3.fwd.z).normalize();W3.UP=new THREE.Vector3(0,W3.vs,0);
 /* 太阳固定在世界的西北上方：转视角时影子方向跟着变 */
 W3.sun.position.set(T.x-6,8,T.z+3);W3.sun.target.position.copy(T);W3.sun.target.updateMatrixWorld();
 const sz=Math.min(20,13*Math.max(1,W3.zoom)),sc=W3.sun.shadow.camera;if(sc.right!==sz){Object.assign(sc,{left:-sz,right:sz,top:sz,bottom:-sz});sc.updateProjectionMatrix();}
 const f=W3.scene.fog;f.near=D*1.05;f.far=D*(M.dark>.3?2.1:2.8);}
/* 夜里、洞里：环境光和太阳调暗，离自己最近的几盏灯（灯、篝火、传送门、自己）变成真的点光 */
function w3Light(M,P,t){const dk=M.dark||0,kd=1-dk*.55;W3.amb.intensity=Math.PI*.62*kd;W3.sun.intensity=Math.PI*.38/.766*kd*(1-dk*.4);if(!W3.pl.length)return;
 const L=M.lights.map(l=>({c:l.c,r:l.r,h:l.h||8,rad:l.rad,col:l.col,d:Math.abs(l.c-P.x)+Math.abs(l.r-P.y)}));
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;if(p.type==='portal')L.push({c:p.c,r:p.r,h:6,rad:60,col:p.rift?'rgba(200,138,255,1)':'rgba(143,214,181,1)',d:Math.abs(p.c-P.x)+Math.abs(p.r-P.y)});});
 L.sort((a,b)=>a.d-b.d);const use=L.slice(0,W3.pl.length-1);use.push({c:P.x,r:P.y,h:16,rad:dk>.3?66:40,col:'rgba(255,226,180,1)',me:1});
 W3.pl.forEach((pl,i)=>{const l=use[i];if(!l){pl.intensity=0;return;}pl.position.set(w3X(l.c,l.r),l.h*W3K*W3.vs,w3Z(l.c,l.r));pl.color.copy(w3Col(l.col));
  pl.distance=l.rad*W3K*(l.me?2.4:2.8);pl.intensity=Math.PI*(l.me?1.1:2.2)*(.5+dk)*(1+.06*Math.sin(t*7+i*2));});}
/* 移轴：先画到一张离屏画板上，再整张贴回来，上下两头按远近虚化，四角稍暗 */
function w3Post(){if(W3.post)return W3.post;const R=D3.R,g2=R.capabilities.isWebGL2,hf=g2&&(R.extensions.has('EXT_color_buffer_float')||R.extensions.has('EXT_color_buffer_half_float'));
 const rt=new THREE.WebGLRenderTarget(16,16,{type:hf?THREE.HalfFloatType:THREE.UnsignedByteType,samples:g2?4:0,depthBuffer:true});
 const mat=new THREE.ShaderMaterial({uniforms:{tD:{value:rt.texture},px:{value:new THREE.Vector2(1/16,1/16)},amt:{value:1}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform vec2 px;uniform float amt;varying vec2 vUv;
void main(){float y=vUv.y;float b=smoothstep(.6,1.,y)+(1.-smoothstep(.0,.22,y))*.6;float r=b*amt*6.;vec4 c=texture2D(tD,vUv);
 if(r>.15){vec4 a=c;for(int i=0;i<12;i++){float t=float(i)*2.39996;float d=sqrt((float(i)+.5)/12.);a+=texture2D(tD,vUv+vec2(cos(t),sin(t))*d*r*px);}c=a/13.;}
 vec2 q=vUv-.5;c.rgb*=1.-.55*dot(q,q);gl_FragColor=linearToOutputTexel(vec4(c.rgb,1.));}`});
 const sc=new THREE.Scene(),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;sc.add(q);W3.post={rt,mat,sc,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1)};return W3.post;}
function w3Draw(x,W,H){const R=D3.R,[pw,ph]=d3Px(W*WD.k,H*WD.k),t0=performance.now();
 {const P=WD.P,q=w3P(P.x,P.y,16),k=w3S(P.x,P.y);W3.HOLE.value.set(q[0]/W*pw,(1-q[1]/H)*ph,Math.max(1,24*k*pw/W));}
 /* 手机太吃力就自动减配：按两帧之间的间隔算，连续偏慢（低于约 18 帧）先关移轴，再关影子 */
 const gap=t0-(W3.tf||t0);W3.tf=t0;if(gap>0&&gap<250){W3.ema=W3.ema?W3.ema*.95+gap*.05:gap;if(++W3.nf>120&&W3.ema>56){W3.nf=0;W3.ema=0;if(!W3.nofx)W3.nofx=1;else if(W3.sun.castShadow){W3.sun.castShadow=false;}}}
 if(!W3.nofx){try{const F=w3Post();if(F.rt.width!==pw||F.rt.height!==ph)F.rt.setSize(pw,ph);F.mat.uniforms.px.value.set(1/pw,1/ph);F.mat.uniforms.amt.value=Math.min(1.6,pw/700);
   R.setRenderTarget(F.rt);R.render(W3.scene,W3.cam);R.setRenderTarget(null);d3Blit(F.sc,F.cam,x,pw,ph,0,0,W,H);}
  catch(e){console.warn(e);W3.nofx=1;R.setRenderTarget(null);}}
 if(W3.nofx)d3Blit(W3.scene,W3.cam,x,pw,ph,0,0,W,H);
}
function w3Render(){const M=WD.M,x=WD.cx,P=WD.P;if(!M||!x||!P)return;const W=WD.W,H=WD.H,t=WD.t;WD.fid++;
 if(D3.R!==W3.R){W3.R=D3.R;W3.post=null;W3.M=null;D3.R.domElement.addEventListener('webglcontextrestored',()=>{W3.M=null;W3.post=null;},false);}
 if(W3.M!==M||!W3.scene)w3Build(M);else if(t-W3.chk>1||t<W3.chk){W3.chk=t;if(w3Sig(M)!==W3.sig)w3Build(M);}
 w3Cam(t);w3Light(M,P,t);const an=Math.floor(t*2.5)%4;W3.water.forEach((m,i)=>m.visible=i===an%Math.max(1,W3.water.length));w3Sync(M,P,t);
 x.setTransform(WD.k,0,0,WD.k,0,0);x.imageSmoothingEnabled=true;w3Draw(x,W,H);
 /* 叠在上面的 2D 效果：点地标记、传送门、灵光、篝火、首领红光（跟着远近缩放） */
 const at=(sx,sy,k,f)=>{x.save();x.translate(sx,sy);x.scale(k,k);f();x.restore();};
 if(WD.tap&&t-WD.tap.t<.8){const [sx,sy]=w3P(WD.tap.c,WD.tap.r),k=w3S(WD.tap.c,WD.tap.r);x.globalAlpha=1-(t-WD.tap.t)/.8;x.strokeStyle='#e3b862';x.beginPath();x.moveTo(sx-10*k,sy);x.lineTo(sx,sy-6*k);x.lineTo(sx+10*k,sy);x.lineTo(sx,sy+6*k);x.closePath();x.stroke();x.globalAlpha=1;}
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;const isP=p.type==='portal',isS=p.type==='spark',fire=PR[p.type]&&PR[p.type].fire&&!p.used;if(!isP&&!isS&&!fire)return;
  const [sx,sy]=w3P(p.c,p.r),k=w3S(p.c,p.r);if(!k||sx<-60||sx>W+60||sy<-40||sy>H+60)return;at(sx,sy,k,()=>{if(isP)drawPortal(x,0,0,t,p.rift);else if(isS)drawSpark(x,0,0,p.gold,t+p.c);else drawFlame(x,0,-1,t);});});
 M.ents.forEach(e=>{if(e.dead||e.kind!=='foe'||!(e.boss||e.elite))return;const cv=monCv(e.look,e.boss?1.1:.72,e.tint),[sx,sy]=w3P(e.x,e.y,dh(cv)/2),k=w3S(e.x,e.y),r=(e.boss?30:18)*k;if(!k||sx<-r||sx>W+r||sy<-r||sy>H+r)return;
  x.globalCompositeOperation='lighter';const g=x.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,e.boss?'rgba(255,60,40,.3)':'rgba(255,90,60,.2)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-r,sy-r,r*2,r*2);x.globalCompositeOperation='source-over';});
 /* 夜里、洞里：原来的「挖亮光」做法再压一层暗（真正照亮地面的是上面的点光），光源位置用 3D 镜头换算 */
 if(M.dark>0){const lx=WD.lx;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);lx.fillStyle='rgba(3,4,8,'+(M.dark*.62)+')';lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
  const ls=M.lights.map(l=>{const q=w3P(l.c,l.r,l.h||0);return {x:q[0],y:q[1],rad:l.rad*w3S(l.c,l.r),col:l.col};}).filter(l=>l.rad>0&&l.x>-l.rad&&l.x<W+l.rad&&l.y>-l.rad&&l.y<H+l.rad);
  const q=w3P(P.x,P.y,12);ls.push({x:q[0],y:q[1],rad:(M.dark>.3?66:40)*w3S(P.x,P.y)});
  ls.forEach(l=>{const g=lx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.rad);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(l.x-l.rad,l.y-l.rad,l.rad*2,l.rad*2);});
  x.drawImage(WD.lc,0,0);x.globalCompositeOperation='lighter';ls.forEach(l=>{if(!l.col)return;const r=l.rad*.6,g=x.createRadialGradient(l.x,l.y,0,l.x,l.y,r);g.addColorStop(0,l.col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=.6;x.fillStyle=g;x.fillRect(l.x-r,l.y-r,r*2,r*2);});x.globalAlpha=1;x.globalCompositeOperation='source-over';}
 WD.parts.forEach(p=>{const a=Math.max(0,Math.min(1,Math.min(p.age,p.life-p.age)));x.globalAlpha=a*(p.big?.06:.8);x.fillStyle=p.c;if(p.big)x.fillRect(Math.round(p.x),Math.round(p.y),40,10);else x.fillRect(Math.round(p.x),Math.round(p.y),1,p.t==='drip'?2:1);});x.globalAlpha=1;
 if(WD.soul>0){x.fillStyle='rgba(60,110,200,'+Math.min(.22,WD.soul*.05)+')';x.fillRect(0,0,W,H);}
 w3Labels();wHudLive();}
/* 名字、任务标记、对话泡泡：和 wLabels 一样，只是位置按 3D 换算 */
function w3Labels(){const M=WD.M,K=WD.k/WD.dpr,out=[];const at=(x,y,h)=>{const [gx,gy]=w3P(x,y,h);return [WD.ox+gx*K,WD.oy+gy*K,gx,gy];};const on=(q,x,y)=>q[2]>-20&&q[2]<WD.W+20&&q[3]>-10&&q[3]<WD.H+30&&w3S(x,y)>0;
 M.ents.forEach(e=>{if(e.dead)return;if(!on(at(e.x,e.y,0),e.x,e.y))return;
  if(e.kind==='npc'&&!e.vill){const mk=e.special||e.qfight?'!':(NPCS[e.k]&&!e.ev?npcMark(e.k):'');const nm=e.name||(NPCS[e.k]?NPCS[e.k].name:'');out.push({id:'n'+e.k+(e.special||''),h:(mk?`<b class="mk ${mk==='?'?'rd':''}">${mk}</b>`:'')+`<span>${nm}</span>`,p:at(e.x,e.y,28)});}
  if(e.kind==='foe'&&e.boss)out.push({id:'boss',h:`<span class="bn">${e.name}</span>`,p:at(e.x,e.y,e.abyss||monIsHuman(e.look)?30:42)});
  if(e.bub&&e.bub.t>WD.t)out.push({id:'bub'+(e.k.id||e.k)+e.x,h:`<span class="bub">${esc(e.bub.s)}</span>`,p:at(e.x,e.y,30),cls:'b'});});
 const mo=WD.F.find(f=>f.k==='mo');if(mo){const m=npcMark('mo');if(m&&w3S(mo.x,mo.y)>0)out.push({id:'mo',h:`<b class="mk ${m==='?'?'rd':''}">${m}</b>`,p:at(mo.x,mo.y,38)});}
 M.props.forEach(p=>{if(!p.lab||!p.act||(p.hid&&!(WD.soul>0)))return;if(!on(at(p.c,p.r,0),p.c,p.r))return;const h=p.type==='spark'||p.type==='portal'?24:propCv(p.type,p.v,M.z).ay+2;out.push({id:'p'+p.c+'_'+p.r,h:`<span class="pl ${p.gold?'g':''} ${p.rift?'rf':''}">${p.lab}</span>`,p:at(p.c,p.r,h)});});
 const seen=new Set();out.forEach(o=>{let L=WD.labs.get(o.id);if(!L){const el=document.createElement('div');el.className='wl '+(o.cls||'');WD.lay.appendChild(el);L={el,h:''};WD.labs.set(o.id,L);}
  if(L.h!==o.h){L.el.innerHTML=o.h;L.h=o.h;}L.el.style.transform=`translate(${o.p[0].toFixed(1)}px,${o.p[1].toFixed(1)}px)`;seen.add(o.id);});
 WD.labs.forEach((L,id)=>{if(!seen.has(id)){L.el.remove();WD.labs.delete(id);}});}
/* 点选：先在 3D 画面里找点中的人或物（谁更靠近镜头谁优先，人和妖兽比物件多让一点，转了视角也好点中）；没点中就沿视线落到地面上的那一格。
   最后换回原来斜视角的坐标交给 wTap（这一步只用格子坐标，和镜头转到哪个角度无关）。 */
function w3TapIso(gx,gy){const M=WD.M,ox=Math.round(WD.W/2-WD.cam.x),oy=Math.round(WD.H/2-WD.cam.y),iso=(x,y,up)=>[(x-y)*16+ox,(x+y)*8+oy-(up||0)];let best=null,bd=-1e9;
 const test=(x,y,l,r,top,bot,d,up,o)=>{const [sx,sy]=w3P(x,y),k=w3S(x,y);if(gx>=sx+l*k&&gx<=sx+r*k&&gy>=sy-top*k&&gy<=sy+bot*k&&d>bd){bd=d;best=iso(x,y,up);best[2]=o;}};
 M.ents.forEach(e=>{if(e.dead)return;if(e.kind==='foe'){const cv=monCv(e.look,e.boss?1.1:.72,e.tint);test(e.x,e.y,-dw(cv)/2-3,dw(cv)/2+3,dh(cv)+3,3,w3Key(e.x,e.y)+2,4,e);}else test(e.x,e.y,-10,10,30,2,w3Key(e.x,e.y)+2,10,e);});
 WD.F.forEach(f=>{if(f.k==='mo')test(f.x,f.y,-10,10,40,-8,w3Key(f.x,f.y)+2.5,20,f);});
 M.props.forEach(p=>{if(!p.act||(p.hid&&!(WD.soul>0))||(W3.fade&&W3.fade.has(p)))return;/* 变半透明的物件点不中，点穿过去 */if(p.type==='spark'||p.type==='portal'){test(p.c,p.r,-12,12,24,6,w3Key(p.c,p.r),8,{prop:p});return;}const o=propCv(p.type,p.v,M.z);test(p.c,p.r,-o.ax,o.w-o.ax,o.ay,o.h-o.ay,w3Key(p.c,p.r)-.1,Math.max(0,Math.min(o.ay-2,8)),{prop:p});});
 if(best)return best;
 const R=new THREE.Raycaster();R.setFromCamera(new THREE.Vector2(gx/WD.W*2-1,1-gy/WD.H*2),W3.cam);const r=R.ray;if(r.direction.y>-1e-4)return null;
 const q=r.origin.clone().addScaledVector(r.direction,-r.origin.y/r.direction.y),c=(q.z+q.x)/Math.SQRT2,rr=(q.z-q.x)/Math.SQRT2,g=iso(c,rr,0);g[2]=null;return g;}
const _wRender2d=wRender;
wRender=function(){if(!D3.on||W3.fail||!d3Ready()||!WD.M||!WD.cx){if(W3.live)w3Ctl(false);W3.live=false;return _wRender2d();}
 try{w3Render();if(!W3.live)w3Ctl(true);W3.live=true;}catch(e){console.error(e);W3.fail=1;W3.live=false;w3Ctl(false);try{D3.R.setRenderTarget(null);}catch(e2){}_wRender2d();}};
const _wTap3=wTap;
wTap=function(gx,gy){if(W3.live&&W3.cam&&W3.up){const q=w3TapIso(gx,gy);if(!q)return;gx=q[0];gy=q[1];W3.hit=q[2];}try{return _wTap3(gx,gy);}finally{W3.hit=undefined;}};
/* 3D 里已经知道点中了谁，就直接告诉 wTap（不再用斜视角坐标重新找一遍，转了视角也不会点错人） */
const _wHit3=wHit;wHit=function(gx,gy){if(W3.hit!==undefined){const h=W3.hit;W3.hit=undefined;return h;}return _wHit3(gx,gy);};
/* ---------- 镜头手势 ----------
   单指：点一下 = 原来的走路、对话（松手时触发，按住拖动超过一点就改成转视角，不会误走）
   两指：左右拖、拧转 = 转视角；捏合 = 远近。桌面上滚轮 = 远近。2D 画面时一切照旧（按下就走）。 */
function w3Ctl(on){const el=document.getElementById('w3ctl');if(el)el.style.display=on?'flex':'none';}
function w3Turn(dy){W3.yawT+=dy;if(Math.abs(W3.yawT)>Math.PI*8){const n=Math.round(W3.yawT/(Math.PI*2))*Math.PI*2;W3.yawT-=n;W3.yaw-=n;}}
function w3Gest(cv,tap0){const pts=new Map();let g=null;
 const two=()=>{const [a,b]=[...pts.values()];return {cx:(a[0]+b[0])/2,d:Math.max(20,Math.hypot(b[0]-a[0],b[1]-a[1])),an:Math.atan2(b[1]-a[1],b[0]-a[0])};};
 cv.onpointerdown=e=>{e.preventDefault();if(!W3.live){if(tap0)tap0(e);return;}try{cv.setPointerCapture(e.pointerId);}catch(e2){}pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size===1)g={x0:e.clientX,y0:e.clientY,moved:false,multi:false,yaw0:W3.yawT};
  else if(g&&pts.size===2){const q=two();Object.assign(g,{multi:true,cx0:q.cx,d0:q.d,an0:q.an,yaw0:W3.yawT,z0:W3.zoomT});}};
 cv.onpointermove=e=>{if(!g||!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);const r=cv.getBoundingClientRect(),kx=6.2/Math.max(200,r.width);
  if(pts.size>=2&&g.multi){const q=two();let da=q.an-g.an0;da=Math.atan2(Math.sin(da),Math.cos(da));W3.yawT=g.yaw0-(q.cx-g.cx0)*kx+da;W3.zoomT=Math.max(W3ZMIN,Math.min(W3ZMAX,g.z0*g.d0/q.d));W3.gest=1;}
  else if(!g.multi){const dx=e.clientX-g.x0,dy=e.clientY-g.y0;if(!g.moved&&Math.hypot(dx,dy)>14)g.moved=true;if(g.moved){W3.yawT=g.yaw0-dx*kx;W3.gest=1;}}};
 const end=(e,ok)=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pts.size)return;
  if(g&&ok&&!g.multi&&!g.moved&&tap0)tap0({clientX:g.x0,clientY:g.y0,preventDefault(){}});if(g&&(g.multi||g.moved))w3SaveCam();g=null;W3.gest=0;};
 cv.onpointerup=e=>end(e,true);cv.onpointercancel=e=>end(e,false);
 cv.onwheel=e=>{if(!W3.live)return;e.preventDefault();W3.zoomT=Math.max(W3ZMIN,Math.min(W3ZMAX,W3.zoomT*Math.exp(e.deltaY*.0012)));clearTimeout(W3.wt);W3.wt=setTimeout(w3SaveCam,400);};}
const _wBind3=wBind;
wBind=function(){_wBind3();const cv=WD.cv;if(!cv)return;const tap0=cv.onpointerdown;w3Gest(cv,tap0);};
LATE.push(()=>{
 if(location.hash==='#debug')setTimeout(()=>{if(window.__lc){window.__lc.W3=W3;W3.dbg={w3TapIso,w3P,w3S};}},0);
 /* 地图右下：⟲ ⟳ 每次转 45°，中间的「正」回到原来的角度和远近 */
 ACT.w3rot=a=>{const s=+a||0;if(!s){W3.yawT=Math.round(W3.yawT/(Math.PI*2))*Math.PI*2;W3.zoomT=1;}else w3Turn((Math.round(W3.yawT/W3Q)+s)*W3Q-W3.yawT);w3SaveCam();};
 const _vw=VIEWS.world;VIEWS.world=()=>_vw().replace('<div class="whint">',`<div class="w3ctl" id="w3ctl" style="position:absolute;right:max(12px,env(safe-area-inset-right,0px));bottom:64px;display:${W3.live?'flex':'none'};gap:6px;z-index:3"><button class="btn sm ghost" data-act="w3rot" data-arg="-1" aria-label="向左转视角">⟲</button><button class="btn sm ghost" data-act="w3rot" data-arg="0" aria-label="视角复原">正</button><button class="btn sm ghost" data-act="w3rot" data-arg="1" aria-label="向右转视角">⟳</button></div><div class="whint">`);
});
