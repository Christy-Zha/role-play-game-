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

/* ---------- 布景：剧情背景、页面上方的场景图 ----------
   一张插画拆成好几层纵深：
   1. 「地面 + 远景」折纸（d3Folder）打底；
   2. 每张图再算一张小小的「远近图」（d3Depth）：颜色越暗、越艳越近，越亮、越灰越远（像空气里的远山），
      模糊之后把画上每个点沿视线前后推一点。点是沿「镜头 → 这个点」的视线挪的，镜头在原位时画面不变；
   3. 景深（d3DofDraw）：中景清楚，近处地面和最远处略虚；
   4. 前景：斜斜的光柱（d3Shafts）、镜头前的大光斑（d3Bokeh）、灵气光点和薄雾。
   手指拖动背景、或者倾斜手机（d3Tilt*），镜头跟着转，松手弹回。 */
const D3_OVER=1.3;
/* 远近图：48 列的小图，值在 -1（远）… 1（近），四周淡到 0，免得边上被推出缝 */
const _d3Dep=new WeakMap();
function d3Depth(src){let d=_d3Dep.get(src);if(d)return d;
 const w=48,h=Math.max(8,Math.round(48*src.height/Math.max(1,src.width))),n=w*h,c=document.createElement('canvas');c.width=w;c.height=h;
 const x=c.getContext('2d');x.drawImage(src,0,0,w,h);const px=x.getImageData(0,0,w,h).data,L=new Float32Array(n),S=new Float32Array(n);let mL=0,mS=0;
 for(let i=0;i<n;i++){const r=px[i*4]/255,g=px[i*4+1]/255,b=px[i*4+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b);L[i]=.3*r+.59*g+.11*b;S[i]=mx>.03?(mx-mn)/mx:0;mL+=L[i];mS+=S[i];}
 mL/=n;mS/=n;let lw=0,lx=0;for(let y=0;y<h*.5;y++)for(let i=0;i<w;i++){const q=Math.max(0,L[y*w+i]-mL)**2;lw+=q;lx+=q*(i/(w-1)*2-1);}lx=lw>1e-6?lx/lw:0;let vL=0,vS=0;for(let i=0;i<n;i++){vL+=(L[i]-mL)**2;vS+=(S[i]-mS)**2;}const sL=Math.sqrt(vL/n)+.04,sS=Math.sqrt(vS/n)+.04;
 let a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=Math.max(-1,Math.min(1,(-.65*(L[i]-mL)/sL+.35*(S[i]-mS)/sS)/2));
 /* 横竖各模糊两遍：远近只在大块上变化，人脸、细线不会被扯歪 */
 const rad=Math.max(2,Math.round(w*.07)),bl=(A,hor)=>{const B=new Float32Array(n);for(let y=0;y<h;y++)for(let i=0;i<w;i++){let s=0,k=0;
   for(let j=-rad;j<=rad;j++){const xx=hor?i+j:i,yy=hor?y:y+j;if(xx<0||xx>=w||yy<0||yy>=h)continue;s+=A[yy*w+xx];k++;}B[y*w+i]=s/k;}return B;};
 a=bl(bl(bl(bl(a,1),0),1),0);
 for(let y=0;y<h;y++)for(let i=0;i<w;i++){const e=Math.min(i/(w-1),1-i/(w-1),y/(h-1),1-y/(h-1));a[y*w+i]*=Math.min(1,e/.12);}
 /* u 从左到右、v 从下到上（和贴图坐标一致），超出范围就取边上 */
 d={lx,at(u,v){const fx=Math.max(0,Math.min(w-1,u*(w-1))),fy=Math.max(0,Math.min(h-1,(1-v)*(h-1))),x0=Math.floor(fx),y0=Math.floor(fy),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),tx=fx-x0,ty=fy-y0;
  return (a[y0*w+x0]*(1-tx)+a[y0*w+x1]*tx)*(1-ty)+(a[y1*w+x0]*(1-tx)+a[y1*w+x1]*tx)*ty;}};
 _d3Dep.set(src,d);return d;}
/* 带远近起伏的画：在折纸的基础上，每个点沿视线前后推 o.relief 那么多 */
function d3SheetD(fold,tex,o,dep){const sx=o.asp<1?40:72,sy=o.asp<1?80:44,g=new THREE.PlaneGeometry(2,2,sx,sy),pos=g.attributes.position,uv=g.attributes.uv,p=new THREE.Vector3();
 for(let i=0;i<pos.count;i++){const nx=pos.getX(i)*o.geo,ny=pos.getY(i)*o.geo,u=(nx/o.tex+1)/2,v=(ny/o.tex+1)/2;fold.at(nx,ny,p);
  const r=dep?dep.at(u,v):0;p.sub(fold.C).multiplyScalar(1-o.relief*r).add(fold.C);pos.setXYZ(i,p.x,p.y,p.z);uv.setXY(i,u,v);}
 pos.needsUpdate=true;uv.needsUpdate=true;g.computeBoundingSphere();
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,depthWrite:true}));m.renderOrder=-10;return m;}
/* 光柱：一条中间亮、两边淡、越往下越淡的光 */
let _d3Shaft=null;function d3ShaftTex(){if(_d3Shaft)return _d3Shaft;const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d');
 let g=x.createLinearGradient(0,0,64,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,256);
 x.globalCompositeOperation='destination-in';g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.12,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,256);
 _d3Shaft=new THREE.CanvasTexture(c);_d3Shaft.colorSpace=THREE.SRGBColorSpace;return _d3Shaft;}
function d3Shafts(fold,col,n,op,lx){const G=new THREE.Group(),R=rng(53),tilt=-Math.max(-1,Math.min(1,lx*2))*.42;
 /* 光从画里最亮的那一侧斜照下来：lx 是上半张图亮处的左右位置（-1 左 … 1 右） */
 for(let i=0;i<n;i++){const d=fold.D*(.5+R()*.4),p=fold.at(Math.max(-.85,Math.min(.85,lx*.5-.6+1.2*(i+R()*.6)/n)),.25+R()*.3),w=d*(.05+R()*.06);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d*.95),new THREE.MeshBasicMaterial({map:d3ShaftTex(),color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  const s=fold.C.clone().addScaledVector(fold.f,d);m.position.set(p.x,p.y,s.z);m.lookAt(fold.C);m.rotateZ(tilt);
  m.userData={x0:m.position.x,ph:R()*6.28,sp:.05+R()*.06,op:op*(.55+R()*.45),w};G.add(m);}
 G.userData.tick=t=>G.children.forEach(m=>{const u=m.userData;m.position.x=u.x0+Math.sin(t*u.sp+u.ph)*u.w*.8;m.material.opacity=u.op*(.6+.4*Math.sin(t*u.sp*3+u.ph));});return G;}
/* 镜头前的大光斑：离镜头很近、又大又虚，镜头一动它们挪得最多 */
let _d3Bok=null;function d3BokTex(){if(_d3Bok)return _d3Bok;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,31);
 g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.7,'rgba(255,255,255,.45)');g.addColorStop(.88,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
 _d3Bok=new THREE.CanvasTexture(c);_d3Bok.colorSpace=THREE.SRGBColorSpace;return _d3Bok;}
function d3Bokeh(fold,n,col){const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),V=[],R=rng(n*17+3),p=new THREE.Vector3();
 for(let i=0;i<n;i++){const d=fold.D*(.13+R()*.14),side=i%2?1:-1,nx=side*(.25+R()*.85),ny=R()*1.8-.9;const r=fold.ray(nx,ny,new THREE.Vector3());p.copy(fold.C).addScaledVector(r,d/r.dot(fold.f));
  P[i*3]=p.x;P[i*3+1]=p.y;P[i*3+2]=p.z;V.push({x0:p.x,y0:p.y,ph:R()*6.28,sp:.08+R()*.1,a:d*.04});}
 g.setAttribute('position',new THREE.BufferAttribute(P,3));
 const m=new THREE.Points(g,new THREE.PointsMaterial({color:col,size:fold.D*.016,map:d3BokTex(),transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,opacity:.22,sizeAttenuation:true}));
 m.renderOrder=5;m.userData.tick=t=>{for(let i=0;i<n;i++){const v=V[i];P[i*3]=v.x0+Math.sin(t*v.sp+v.ph)*v.a;P[i*3+1]=v.y0+Math.sin(t*v.sp*.7+v.ph*2)*v.a*.7;}g.attributes.position.needsUpdate=true;m.material.opacity=.11+.04*Math.sin(t*.5);};
 return m;}
/* 镜头：在 d3Sway 那种慢慢绕行之上，再加上手指 / 手机倾斜带来的偏转（px、py 大约 -1…1） */
function d3Look(cam,rest,fold,t,amp,px,py){const piv=fold.C.clone().addScaledVector(fold.f,fold.D*.55),off=rest.position.clone().sub(piv);
 let yaw=(Math.sin(t*.21)*.035+Math.sin(t*.077)*.02)*amp-px*.075,pit=Math.sin(t*.16+1)*.012*amp-py*.032;
 /* 转太多会露出画的边，这里软软地限住 */
 yaw=.1*Math.tanh(yaw/.1);pit=.045*Math.tanh(pit/.045);const dol=(.5+.5*Math.sin(t*.12))*.05*amp;
 off.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);off.applyAxisAngle(new THREE.Vector3(1,0,0).applyQuaternion(rest.quaternion),pit);off.multiplyScalar(1-dol);
 cam.position.copy(piv).add(off);cam.lookAt(piv);cam.updateMatrixWorld(true);}
function d3Diorama(key,w,h){const id=key+'|'+Math.round(w)+'x'+Math.round(h);let D=D3.dio.get(id);
 const src=sceneCanvas(key,w*D3_OVER,h*D3_OVER);if(D&&D.src===src){D3.dio.delete(id);D3.dio.set(id,D);return D;}
 if(D){d3Free(D);D3.dio.delete(id);}
 const avg=d3Clean(src);if(!avg)return null;
 const asp=w/h,o={fov:asp<1?50:40,h:1.7,pitch:asp<1?.16:.2,fold:asp<1?.02:.08,tex:D3_OVER,geo:D3_OVER*1.04,bend:.12,near:.34,relief:.13,asp};
 const rest=d3RestCam(asp,o),fold=d3Folder(rest,o),scene=new THREE.Scene(),tex=new THREE.CanvasTexture(src);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 let dep=null;try{dep=d3Depth(src);}catch(e){}
 scene.add(d3SheetD(fold,tex,o,dep));const lite=d3Lit(avg,.55),lum=(avg[0]*.3+avg[1]*.59+avg[2]*.11)/255;
 scene.add(d3Shafts(fold,d3Lit(avg,.7),asp<1?4:5,.12+.2*lum,dep?dep.lx:0));scene.add(d3Mists(fold,d3Lit(avg,.35),3));scene.add(d3Motes(rest,fold,asp<1?70:90,lite));scene.add(d3Bokeh(fold,asp<1?8:10,d3Lit(avg,.6)));
 D={id,key,src,tex,scene,rest,fold,cam:rest.clone(),t:Math.random()*40};D3.dio.set(id,D);
 if(D3.dio.size>4){const [k,o2]=D3.dio.entries().next().value;D3.dio.delete(k);d3Free(o2);}return D;}
function d3Free(D){try{D.tex.dispose();D.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==undefined)o.material.dispose();});}catch(e){}}
function d3Tick(obj,t,dt){obj.traverse(o=>{if(o.userData.tick)o.userData.tick(t,dt);});}
/* 景深：先画进一块离屏画板（带深度），再整屏糊一遍：越偏离中景，取样圈越大 */
const D3_DOF={ok:true,rt:new Map(),P:null};
function d3RT(w,h){const k=w+'x'+h;let t=D3_DOF.rt.get(k);if(t){D3_DOF.rt.delete(k);D3_DOF.rt.set(k,t);return t;}
 t=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true,depthTexture:new THREE.DepthTexture(w,h),minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false});
 t.texture.colorSpace=THREE.SRGBColorSpace;D3_DOF.rt.set(k,t);
 if(D3_DOF.rt.size>2){const [k2,o]=D3_DOF.rt.entries().next().value;D3_DOF.rt.delete(k2);try{o.depthTexture.dispose();o.dispose();}catch(e){}}return t;}
function d3Post(){if(D3_DOF.P)return D3_DOF.P;
 const mat=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
  uniforms:{tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2(1,1)},cn:{value:.05},cf:{value:400},fN:{value:6},fF:{value:10},kN:{value:1.7},kF:{value:4},mx:{value:4}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:['#include <packing>',
   'uniform sampler2D tC;uniform sampler2D tD;uniform vec2 px;uniform float cn,cf,fN,fF,kN,kF,mx;varying vec2 vUv;',
   'float coc(vec2 u){float z=-perspectiveDepthToViewZ(texture2D(tD,u).x,cn,cf);return z<fN?clamp((fN-z)/fN*kN,0.,1.):clamp((z-fF)/fF*kF,0.,1.);}',
   'void main(){float c=coc(vUv);vec4 acc=texture2D(tC,vUv);float wt=1.;',
   ' if(c>.03){for(int i=1;i<14;i++){float fi=float(i);float a=fi*2.39996;vec2 q=vUv+vec2(cos(a),sin(a))*sqrt(fi/13.)*c*mx*px;',
   '  float w=mix(.3,1.,coc(q));acc+=texture2D(tC,q)*w;wt+=w;}}',
   ' gl_FragColor=vec4(acc.rgb/wt,1.);',
   ' #include <colorspace_fragment>',
   '}'].join('\n')});
 const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;const sc=new THREE.Scene();sc.add(q);
 D3_DOF.P={mat,scene:sc,cam:new THREE.Camera(),chk:0};return D3_DOF.P;}
function d3DofDraw(D,ctx,pw,ph,dw,dh){const R=D3.R;if(!D3_DOF.ok||!R.capabilities.isWebGL2)return false;
 try{const P=d3Post(),rt=d3RT(pw,ph);R.setRenderTarget(rt);R.render(D.scene,D.cam);R.setRenderTarget(null);
  const u=P.mat.uniforms,c=D.cam,Dd=D.fold.D;u.tC.value=rt.texture;u.tD.value=rt.depthTexture;u.px.value.set(1/pw,1/ph);u.cn.value=c.near;u.cf.value=c.far;
  u.fN.value=Dd*.58;u.fF.value=Dd*1.02;u.mx.value=Math.max(2,ph/340);
  d3Blit(P.scene,P.cam,ctx,pw,ph,0,0,dw,dh);
  if(!P.chk){P.chk=1;const pr=R.properties.get(P.mat).currentProgram;if(pr&&pr.diagnostics&&pr.diagnostics.runnable===false){D3_DOF.ok=false;return false;}}
  return true;}catch(e){D3_DOF.ok=false;try{R.setRenderTarget(null);}catch(e2){}return false;}}
function d3DrawView(V,dt){const cv=V.cv,r=cv.getBoundingClientRect();if(r.width<4||r.height<4)return;const D=d3Diorama(V.key,r.width,r.height);if(!D){D3.views.delete(cv);return;}
 D.t+=dt;d3Tick(D.scene,D.t,dt);/* 页面上方的小舞台上还站着 2D 的人物，转得轻一点，免得人像在石头上滑 */
 const k=D3.still?0:cv.id==='vbg'?1:.65;d3Look(D.cam,D.rest,D.fold,D.t,cv.id==='vbg'?1.4:1.1,(D3P.x+D3T.x*.9)*k,(D3P.y+D3T.y*.6)*k);
 const [pw,ph]=d3Px(cv.width,cv.height),ctx=cv.getContext('2d');
 if(!d3DofDraw(D,ctx,pw,ph,cv.width,cv.height))d3Blit(D.scene,D.cam,ctx,pw,ph,0,0,cv.width,cv.height);}
/* ---------- 手指拖动 / 手机倾斜 → 镜头偏转 ----------
   D3P：拖动带来的偏转，松手后像弹簧一样回到 0；D3T：手机倾斜，平滑过，并且慢慢把「当前拿法」当成正中。
   点一下仍是翻页；拖过 10 像素才算拖动，这一下不翻页。 */
const D3P={x:0,y:0,vx:0,vy:0,tx:0,ty:0},D3T={lis:null,raw:null,s:null,b:null,x:0,y:0,asked:false};
const d3Wrap=a=>((a+540)%360)-180;
function d3PanStep(dt){for(let n=Math.max(1,Math.ceil(dt*240)),h=dt/n,i=0;i<n;i++){
  D3P.vx+=(90*(D3P.tx-D3P.x)-12*D3P.vx)*h;D3P.vy+=(90*(D3P.ty-D3P.y)-12*D3P.vy)*h;D3P.x+=D3P.vx*h;D3P.y+=D3P.vy*h;}
 const T=D3T;if(!T.raw)return;if(!T.s){T.s=T.raw.slice();T.b=T.raw.slice();}
 const a=1-Math.exp(-dt*7),a2=1-Math.exp(-dt/4);
 for(let i=0;i<2;i++){T.s[i]+=d3Wrap(T.raw[i]-T.s[i])*a;T.b[i]+=d3Wrap(T.s[i]-T.b[i])*a2;}
 T.x=Math.max(-1,Math.min(1,d3Wrap(T.s[0]-T.b[0])/18));T.y=Math.max(-1,Math.min(1,d3Wrap(T.s[1]-T.b[1])/18));}
function d3TiltOn(){if(D3T.lis||D3.still||typeof window.DeviceOrientationEvent==='undefined')return;
 D3T.lis=e=>{if(e.beta==null||e.gamma==null)return;let b=e.beta,g=e.gamma;const an=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
  if(an===90){const t=b;b=-g;g=t;}else if(an===-90||an===270){const t=b;b=g;g=-t;}D3T.raw=[g,b];};
 window.addEventListener('deviceorientation',D3T.lis);}
function d3TiltOff(){if(D3T.lis)window.removeEventListener('deviceorientation',D3T.lis);D3T.lis=null;D3T.raw=D3T.s=D3T.b=null;D3T.x=D3T.y=0;}
const d3TiltPref=()=>{try{return localStorage.getItem('lingchao_tilt');}catch(e){return null;}};
const d3TiltSave=v=>{try{localStorage.setItem('lingchao_tilt',v);}catch(e){}};
/* iPhone 要在点按里请求一次「动作与方向」权限；答复记在 localStorage，拒绝了就不再问 */
function d3TiltAsk(){const DO=window.DeviceOrientationEvent;if(!DO||D3.still)return Promise.resolve(false);
 if(typeof DO.requestPermission!=='function'){d3TiltOn();return Promise.resolve(true);}
 D3T.asked=true;let p;try{p=DO.requestPermission();}catch(e){return Promise.resolve(false);}
 return Promise.resolve(p).then(r=>{const ok=r==='granted';d3TiltSave(ok?'1':'0');if(ok)d3TiltOn();return ok;}).catch(()=>false);}
if(d3TiltPref()!=='0'&&typeof window.DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission!=='function')d3TiltOn();
const D3IN={cv:null,x0:0,y0:0,w:1,h:1,ky:1,moved:false,until:0};
function d3InCv(t){if(D3.still||!t||!t.closest||t.closest('button,a,input,select,textarea,label,[data-act],.st-log,.st-choices'))return null;
 let v=null;const ov=t.closest('#ov');if(ov){if(!ov.classList.contains('vn'))return null;v=ov.querySelector('#vbg');}else{const st=t.closest('.stage');v=st&&st.querySelector('canvas.bgc');}
 return v&&D3.views.has(v)?v:null;}
function d3InStart(x,y,t){const cv=d3InCv(t);D3IN.cv=cv;if(!cv)return;const r=cv.getBoundingClientRect();
 Object.assign(D3IN,{x0:x,y0:y,w:Math.max(80,r.width),h:Math.max(80,r.height),ky:cv.id==='vbg'?1:.5,moved:false});}
function d3InMove(x,y){if(!D3IN.cv)return;const dx=x-D3IN.x0,dy=y-D3IN.y0;if(!D3IN.moved&&Math.hypot(dx,dy)>10)D3IN.moved=true;if(!D3IN.moved)return;
 D3P.tx=Math.tanh(dx/(D3IN.w*.42))*1.25;D3P.ty=Math.tanh(dy/(D3IN.h*.32))*1.25*D3IN.ky;}
function d3InEnd(){if(!D3IN.cv)return;if(D3IN.moved)D3IN.until=performance.now()+400;D3IN.cv=null;D3P.tx=D3P.ty=0;}
window.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)d3InStart(e.clientX,e.clientY,e.target);},true);
window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')d3InMove(e.clientX,e.clientY);},true);
window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')d3InEnd();},true);
window.addEventListener('touchstart',e=>{if(e.touches.length===1){const t=e.touches[0];d3InStart(t.clientX,t.clientY,e.target);}else d3InEnd();},{capture:true,passive:true});
window.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)d3InMove(t.clientX,t.clientY);},{capture:true,passive:true});
window.addEventListener('touchend',d3InEnd,{capture:true,passive:true});window.addEventListener('touchcancel',d3InEnd,{capture:true,passive:true});
/* 拖动后松手的那一下「点击」不算翻页；剧情里第一次点按时顺便请求倾斜权限 */
window.addEventListener('click',e=>{if(performance.now()<D3IN.until){D3IN.until=0;e.stopPropagation();e.preventDefault();return;}
 if(!D3T.asked&&!D3T.lis&&d3TiltPref()!=='0'&&D3.on&&e.target&&e.target.closest&&e.target.closest('#ov.vn'))d3TiltAsk();},true);
function d3Loop(t){requestAnimationFrame(d3Loop);if(!D3.views.size||document.hidden||!d3Ready())return;const dt=Math.min(.1,(t-(D3.last||t))/1000);if(t-D3.last<30&&D3.last)return;D3.last=t;
 d3PanStep(dt);const ov=document.getElementById('ov'),cover=!!(ov&&!ov.hidden);
 for(const [cv,V] of D3.views){if(!cv.isConnected){D3.views.delete(cv);continue;}if(cover&&cv.id!=='vbg')continue;/* 被剧情盖住的页面背景先不画，省电 */
  if(D3.still&&V.done)continue;try{d3DrawView(V,dt);V.done=1;}catch(e){D3.views.delete(cv);}}}
requestAnimationFrame(d3Loop);
if(location.hash==='#debug')window.__d3={D3,D3P,D3T,D3_DOF};
/* 只接管大的背景画布：剧情背景 #vbg、页面上方的 .bgc。小缩略图仍用 2D */
const _paintTo2d=paintTo;
paintTo=function(cv,key){_paintTo2d(cv,key);if(!cv||!key||!cv.isConnected)return;if(!(cv.id==='vbg'||(cv.classList&&cv.classList.contains('bgc'))))return;
 if(!d3Ready()){D3.views.delete(cv);return;}D3.views.set(cv,{cv,key,done:0});};

/* ---------- 设置：存档页里加「画面 3D / 2D」 ---------- */
LATE.push(()=>{
 ACT.d3=()=>{if(D3.ok===false&&!D3.on){toast('这台设备暂时不支持 3D 画面');return;}d3Set(!D3.on);if(D3.on&&!d3Ready()){D3.on=false;toast('这台设备暂时不支持 3D 画面');}render();};
 /* 「晃动手机」：倾斜手机时剧情背景跟着转。点这个按钮本身就是一次点按，iPhone 可以在这里请求权限 */
 ACT.d3tilt=()=>{if(D3T.lis){d3TiltOff();d3TiltSave('0');render();return;}d3TiltSave('1');
  d3TiltAsk().then(ok=>{if(!ok)toast('没能读到手机的方向，可在浏览器设置里允许「动作与方向」');render();});};
 const _sv=VIEWS.save;VIEWS.save=()=>_sv().replace(/(id="bgmBtn">[^<]*<\/button>)/,`$1 <button class="btn sm ghost" data-act="d3" id="d3Btn">${D3.on&&D3.ok!==false?'画面 3D':'画面 2D'}</button>`
  +(D3.on&&D3.ok!==false&&!D3.still&&typeof window.DeviceOrientationEvent!=='undefined'?` <button class="btn sm ghost" data-act="d3tilt" id="d3TiltBtn">${D3T.lis?'晃动手机：开':'晃动手机：关'}</button>`:''));
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
   地砖铺成真正的 3D 地面（原来斜着画的菱形砖，转回正方形当贴图），
   地图边上露出断崖侧面；树、房子、人物、妖兽都是立着的纸片，太阳斜照投影子。
   镜头带透视、俯角约 34°，和原来的斜视角接近，所以人物比例、点选手感不变。
   遮挡顺序沿用 2D 的「c+r 越大越靠前」，点选、名字标签按 3D 镜头重新换算。 */
const W3K=1/(16*Math.SQRT2);/* 原来斜视角里的 1 像素 = 多少 3D 长度 */
const W3={M:null,sig:'',chk:0,scene:null,cam:null,sun:null,water:[],obj:new Map(),seen:0,pitch:.6,fov:44,d:10,fail:0,live:false,up:null,right:null,fwd:null};
const w3X=(c,r)=>(c-r)/Math.SQRT2,w3Z=(c,r)=>(c+r)/Math.SQRT2;
const w3Wet=ty=>{const T=TL[ty];return !!(T&&(T.water||ty==='lava'||ty==='puddle'));};
function w3Sig(M){return M.g.join(',');}
function w3Free(){if(!W3.scene)return;W3.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.userData.atlas&&o.material.map)o.material.map.dispose();o.material.dispose();}if(o.customDepthMaterial)o.customDepthMaterial.dispose();});W3.scene=null;W3.obj=new Map();W3.water=[];}
/* 菱形砖 → 正方形贴图，拼成一张大图。
   斜视角里：砖的上角 = 正方形左上，右角 = 右上，左角 = 左下，下角 = 右下 */
function w3Atlas(keys){const n=keys.length,N=n>240?64:128,cols=Math.min(16,Math.max(1,n)),rows=Math.ceil(n/cols);const cv=document.createElement('canvas');cv.width=cols*N;cv.height=Math.max(N,rows*N);const x=cv.getContext('2d'),at=new Map();
 keys.forEach((k,i)=>{const [ty,v]=k.split('|'),T=TL[ty]||TL.tile,src=tileCv(ty,+v),w=src.width,h=src.height,ox=(i%cols)*N,oy=Math.floor(i/cols)*N;
  x.setTransform(1,0,0,1,0,0);x.fillStyle=T.c?T.c[0]:'#444';x.fillRect(ox,oy,N,N);
  x.save();x.beginPath();x.rect(ox,oy,N,N);x.clip();const s=1.05,cx=ox+N/2,cy=oy+N/2;/* 放大一点盖住菱形边上的接缝 */
  x.setTransform(N*s/w,-N*s/w,N*s/h,N*s/h,cx-N*s,cy);x.drawImage(src,0,0);x.restore();at.set(k,[ox/cv.width,oy/cv.height,(ox+N)/cv.width,(oy+N)/cv.height]);});
 x.setTransform(1,0,0,1,0,0);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;t.anisotropy=4;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return {t,at,px:cv.width};}
function w3Build(M){w3Free();W3.M=M;W3.sig=w3Sig(M);W3.chk=WD.t;const sc=new THREE.Scene();sc.background=new THREE.Color(M.bg||'#0c0b09');W3.scene=sc;
 const keys=new Set();for(let r=0;r<M.H;r++)for(let c=0;c<M.W;c++){const i=gi(M,c,r),ty=M.g[i],T=TL[ty];if(T&&T.none)continue;if(w3Wet(ty))for(let v=0;v<4;v++)keys.add(ty+'|'+v);else keys.add(ty+'|'+M.gv[i]);}
 const A=w3Atlas([...keys]),mat=new THREE.MeshBasicMaterial({map:A.t,side:THREE.DoubleSide});
 const isNone=(c,r)=>{if(c<0||r<0||c>=M.W||r>=M.H)return true;const T=TL[M.g[gi(M,c,r)]];return !!(T&&T.none);};
 /* 地面：普通砖一块，水面四块（四帧轮流显示，水就会动） */
 const mk=()=>({p:[],u:[],i:[]}),land=mk(),wf=[mk(),mk(),mk(),mk()],side={p:[],c:[],i:[]},e=.5/A.px;
 const quad=(B,c,r,uv)=>{const n=B.p.length/3;[[c-.5,r-.5],[c+.5,r-.5],[c+.5,r+.5],[c-.5,r+.5]].forEach(([a,b])=>B.p.push(w3X(a,b),0,w3Z(a,b)));
  B.u.push(uv[0]+e,uv[1]+e,uv[2]-e,uv[1]+e,uv[2]-e,uv[3]-e,uv[0]+e,uv[3]-e);B.i.push(n,n+1,n+2,n,n+2,n+3);};
 /* 断崖侧面：上浅下深的土色 */
 const DEP=.85,wall=(a0,b0,a1,b1,col)=>{const n=side.p.length/3,top=new THREE.Color(pSh(col,-.28)),bot=new THREE.Color(pSh(col,-.72));
  side.p.push(w3X(a0,b0),0,w3Z(a0,b0),w3X(a1,b1),0,w3Z(a1,b1),w3X(a1,b1),-DEP,w3Z(a1,b1),w3X(a0,b0),-DEP,w3Z(a0,b0));
  [top,top,bot,bot].forEach(k=>side.c.push(k.r,k.g,k.b));side.i.push(n,n+1,n+2,n,n+2,n+3);};
 for(let r=0;r<M.H;r++)for(let c=0;c<M.W;c++){const i=gi(M,c,r),ty=M.g[i],T=TL[ty]||TL.tile;if(TL[ty]&&TL[ty].none)continue;
  if(w3Wet(ty))for(let f=0;f<4;f++)quad(wf[f],c,r,A.at.get(ty+'|'+((M.gv[i]+f)%4)));else quad(land,c,r,A.at.get(ty+'|'+M.gv[i]));
  const col=T.c?T.c[0]:'#444';if(isNone(c,r+1))wall(c-.5,r+.5,c+.5,r+.5,col);if(isNone(c+1,r))wall(c+.5,r-.5,c+.5,r+.5,col);}
 const geo=B=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));g.setIndex(B.i);g.computeBoundingSphere();return g;};
 if(land.i.length){const m=new THREE.Mesh(geo(land),mat);m.userData.atlas=1;sc.add(m);}
 W3.water=wf.map(B=>{if(!B.i.length)return null;const m=new THREE.Mesh(geo(B),mat);sc.add(m);return m;}).filter(Boolean);
 if(side.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(side.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(side.c,3));g.setIndex(side.i);sc.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})));}
 /* 影子：一盏斜上方的太阳 + 只显示影子的透明地面 */
 const sun=new THREE.DirectionalLight(0xffffff,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:.5,far:40});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;sun.shadow.radius=2.5;
 sc.add(sun,sun.target);W3.sun=sun;
 const ext=(M.W+M.H)/Math.SQRT2+4,g0=new THREE.Mesh(new THREE.PlaneGeometry(ext*2,ext*2),new THREE.ShadowMaterial({opacity:M.dark>.3?.25:.38,depthWrite:false}));
 g0.rotation.x=-Math.PI/2;g0.position.set(w3X(M.W/2,M.H/2),.004,w3Z(M.W/2,M.H/2));g0.receiveShadow=true;g0.renderOrder=1;sc.add(g0);
 W3.cam=W3.cam||new THREE.PerspectiveCamera(W3.fov,1,.1,200);}
/* 纸片：底边中点为原点，按 c+r 排先后，不做深度测试（和原来的 2D 遮挡一样） */
function w3Card(key){let o=W3.obj.get(key);if(o)return o;const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({transparent:true,depthTest:false,depthWrite:false,alphaTest:.02,side:THREE.DoubleSide}));
 m.castShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaTest:.5,side:THREE.DoubleSide});
 W3.scene.add(m);o={m,seen:0};W3.obj.set(key,o);return o;}
const _w3a=typeof THREE!=="undefined"?new THREE.Vector3():null;
/* 摆一张纸片：cv 图、(x,y) 站的格子、ax/ay 原图里「脚下那一点」离左边/上边多远、w/h 原图显示尺寸、d 前后顺序、al 透明度、lift 往上抬几像素 */
function w3Put(key,cv,x,y,ax,ay,w,h,d,al,lift){const o=w3Card(key),m=o.m;o.seen=W3.seen;m.visible=al>.01;if(!m.visible)return;
 const tex=d3Tex(cv);if(m.material.map!==tex){m.material.map=tex;m.material.needsUpdate=true;m.customDepthMaterial.map=tex;m.customDepthMaterial.needsUpdate=true;}
 m.material.opacity=al;m.renderOrder=1000+Math.round(d*40);m.quaternion.copy(W3.cam.quaternion);m.scale.set(w*W3K,h*W3K,1);
 _w3a.set(w3X(x,y),0,w3Z(x,y));m.position.copy(_w3a).addScaledVector(W3.right,-(ax-w/2)*W3K).addScaledVector(W3.up,(-(h-ay)+(lift||0))*W3K);}
function w3Sync(M,P,t){W3.seen++;const psx=(P.x-P.y)*16,psy=(P.x+P.y)*8,pd=P.x+P.y;
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;if(p.type==='portal'||p.type==='spark')return;const pc=propCv(p.type,p.v,M.z),sx=(p.c-p.r)*16,sy=(p.c+p.r)*8;
  let al=1;if(pc.tall&&p.c+p.r>pd+.3&&Math.abs(psx-sx)<pc.w/2+2&&psy<sy+4&&psy>sy-pc.ay+4)al=.42;
  w3Put(p,pc.cv,p.c,p.r,pc.ax,pc.ay,pc.w,pc.h,p.c+p.r+(p.blocks?0:-.45),al);});
 const ent=(e,d)=>{if(e.kind==='foe'){const s=e.boss?1.1:.72,base=monCv(e.look,s,e.tint),cv=(e.dir===1||e.dir===3)?cvMemo('fl|'+e.look+'|'+s+'|'+(e.tint?1:0),()=>flipCv(base)):base;
   const bob=Math.round(Math.sin(t*4+(e.home?e.home[0]:0))*1),w=dw(cv),h=dh(cv);w3Put(e,cv,e.x,e.y,w/2,h-2,w,h,d,e.stun>0?.55:1,-bob);return;}
  const key=e.kind==='player'?(S.gender==='f'?'hero_f':'hero_m'):e.k,sp=typeof key==='string'?CH[key]:key,ghost=sp&&sp.ghost;
  const fr=e.moving&&!ghost?[1,0,2,0][Math.floor(e.ft*9)%4]:0,cv=chSpr(key,e.dir,fr);let lift=0,al=1;
  if(ghost){lift=9+Math.round(Math.sin(t*2.5)*2);al=.75;}if(e.kind==='player'&&e.inv>0&&Math.floor(t*10)%2)al=.45;if(e.kind==='player'&&WD.fly)lift+=7+Math.sin(t*4)*1.5;
  w3Put(e,cv,e.x,e.y,10,dh(cv)-2,20,32,d,al,lift);};
 M.ents.forEach(e=>{if(!e.dead)ent(e,e.x+e.y+.02);});WD.F.forEach(f=>ent(f,f.x+f.y-.03));ent(P,P.x+P.y+.03);
 for(const [k,o] of W3.obj)if(o.seen!==W3.seen){W3.scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();o.m.customDepthMaterial.dispose();W3.obj.delete(k);}}
/* 3D 点 → 画面坐标（和 WD.W/WD.H 同一套单位）；h 是往上抬几像素 */
const _w3p=typeof THREE!=="undefined"?new THREE.Vector3():null;
function w3P(x,y,h){_w3p.set(w3X(x,y),0,w3Z(x,y));if(h)_w3p.addScaledVector(W3.up,h*W3K);_w3p.project(W3.cam);return [(_w3p.x+1)/2*WD.W,(1-_w3p.y)/2*WD.H];}
/* 这一点相对画面中心的远近缩放（近大远小） */
function w3S(x,y){_w3p.set(w3X(x,y),0,w3Z(x,y)).sub(W3.cam.position);return W3.d/Math.max(.01,_w3p.dot(W3.fwd));}
function w3Cam(){const W=WD.W,H=WD.H,cam=W3.cam;cam.aspect=W/H;cam.fov=W3.fov;cam.updateProjectionMatrix();
 const d=H*W3K/(2*Math.tan(W3.fov*Math.PI/360));W3.d=d;const T=new THREE.Vector3(WD.cam.x*W3K,0,WD.cam.y*2*W3K);
 cam.position.set(T.x,Math.sin(W3.pitch)*d,T.z+Math.cos(W3.pitch)*d);cam.lookAt(T);cam.updateMatrixWorld(true);
 W3.up=new THREE.Vector3(0,1,0).applyQuaternion(cam.quaternion);W3.right=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion);W3.fwd=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);
 W3.sun.position.set(T.x-6,8,T.z+3);W3.sun.target.position.copy(T);W3.sun.target.updateMatrixWorld();}
function w3Render(){const M=WD.M,x=WD.cx,P=WD.P;if(!M||!x||!P)return;const W=WD.W,H=WD.H,t=WD.t;WD.fid++;
 if(W3.M!==M||!W3.scene)w3Build(M);else if(t-W3.chk>1||t<W3.chk){W3.chk=t;if(w3Sig(M)!==W3.sig)w3Build(M);}
 w3Cam();const an=Math.floor(t*2.5)%4;W3.water.forEach((m,i)=>m.visible=i===an%Math.max(1,W3.water.length));w3Sync(M,P,t);
 x.setTransform(WD.k,0,0,WD.k,0,0);x.imageSmoothingEnabled=true;const [pw,ph]=d3Px(W*WD.k,H*WD.k);d3Blit(W3.scene,W3.cam,x,pw,ph,0,0,W,H);
 /* 叠在上面的 2D 效果：点地标记、传送门、灵光、篝火、首领红光 */
 if(WD.tap&&t-WD.tap.t<.8){const [sx,sy]=w3P(WD.tap.c,WD.tap.r),k=w3S(WD.tap.c,WD.tap.r);x.globalAlpha=1-(t-WD.tap.t)/.8;x.strokeStyle='#e3b862';x.beginPath();x.moveTo(sx-10*k,sy);x.lineTo(sx,sy-6*k);x.lineTo(sx+10*k,sy);x.lineTo(sx,sy+6*k);x.closePath();x.stroke();x.globalAlpha=1;}
 M.props.forEach(p=>{if(p.hid&&!(WD.soul>0))return;const isP=p.type==='portal',isS=p.type==='spark',fire=PR[p.type]&&PR[p.type].fire&&!p.used;if(!isP&&!isS&&!fire)return;
  const [sx,sy]=w3P(p.c,p.r);if(sx<-60||sx>W+60||sy<-40||sy>H+60)return;if(isP)drawPortal(x,sx,sy,t,p.rift);else if(isS)drawSpark(x,sx,sy,p.gold,t+p.c);else drawFlame(x,sx,sy-1,t);});
 M.ents.forEach(e=>{if(e.dead||e.kind!=='foe'||!(e.boss||e.elite))return;const cv=monCv(e.look,e.boss?1.1:.72,e.tint),[sx,sy]=w3P(e.x,e.y,dh(cv)/2),k=w3S(e.x,e.y),r=(e.boss?30:18)*k;
  x.globalCompositeOperation='lighter';const g=x.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,e.boss?'rgba(255,60,40,.3)':'rgba(255,90,60,.2)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-r,sy-r,r*2,r*2);x.globalCompositeOperation='source-over';});
 /* 夜里、洞里：原来的「挖亮光」做法，光源位置改用 3D 镜头换算 */
 if(M.dark>0){const lx=WD.lx;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);lx.fillStyle='rgba(3,4,8,'+M.dark+')';lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
  const ls=M.lights.map(l=>{const q=w3P(l.c,l.r,l.h||0);return {x:q[0],y:q[1],rad:l.rad*w3S(l.c,l.r),col:l.col};}).filter(l=>l.x>-l.rad&&l.x<W+l.rad&&l.y>-l.rad&&l.y<H+l.rad);
  const q=w3P(P.x,P.y,12);ls.push({x:q[0],y:q[1],rad:(M.dark>.3?66:40)*w3S(P.x,P.y)});
  ls.forEach(l=>{const g=lx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.rad);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(l.x-l.rad,l.y-l.rad,l.rad*2,l.rad*2);});
  x.drawImage(WD.lc,0,0);x.globalCompositeOperation='lighter';ls.forEach(l=>{if(!l.col)return;const r=l.rad*.7,g=x.createRadialGradient(l.x,l.y,0,l.x,l.y,r);g.addColorStop(0,l.col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(l.x-r,l.y-r,r*2,r*2);});x.globalCompositeOperation='source-over';}
 WD.parts.forEach(p=>{const a=Math.max(0,Math.min(1,Math.min(p.age,p.life-p.age)));x.globalAlpha=a*(p.big?.06:.8);x.fillStyle=p.c;if(p.big)x.fillRect(Math.round(p.x),Math.round(p.y),40,10);else x.fillRect(Math.round(p.x),Math.round(p.y),1,p.t==='drip'?2:1);});x.globalAlpha=1;
 if(WD.soul>0){x.fillStyle='rgba(60,110,200,'+Math.min(.22,WD.soul*.05)+')';x.fillRect(0,0,W,H);}
 w3Labels();wHudLive();}
/* 名字、任务标记、对话泡泡：和 wLabels 一样，只是位置按 3D 换算 */
function w3Labels(){const M=WD.M,K=WD.k/WD.dpr,out=[];const at=(x,y,h)=>{const [gx,gy]=w3P(x,y,h);return [WD.ox+gx*K,WD.oy+gy*K,gx,gy];};const on=q=>q[2]>-20&&q[2]<WD.W+20&&q[3]>-10&&q[3]<WD.H+30;
 M.ents.forEach(e=>{if(e.dead)return;if(!on(at(e.x,e.y,0)))return;
  if(e.kind==='npc'&&!e.vill){const mk=e.special||e.qfight?'!':(NPCS[e.k]&&!e.ev?npcMark(e.k):'');const nm=e.name||(NPCS[e.k]?NPCS[e.k].name:'');out.push({id:'n'+e.k+(e.special||''),h:(mk?`<b class="mk ${mk==='?'?'rd':''}">${mk}</b>`:'')+`<span>${nm}</span>`,p:at(e.x,e.y,28)});}
  if(e.kind==='foe'&&e.boss)out.push({id:'boss',h:`<span class="bn">${e.name}</span>`,p:at(e.x,e.y,e.abyss||monIsHuman(e.look)?30:42)});
  if(e.bub&&e.bub.t>WD.t)out.push({id:'bub'+(e.k.id||e.k)+e.x,h:`<span class="bub">${esc(e.bub.s)}</span>`,p:at(e.x,e.y,30),cls:'b'});});
 const mo=WD.F.find(f=>f.k==='mo');if(mo){const m=npcMark('mo');if(m)out.push({id:'mo',h:`<b class="mk ${m==='?'?'rd':''}">${m}</b>`,p:at(mo.x,mo.y,38)});}
 M.props.forEach(p=>{if(!p.lab||!p.act||(p.hid&&!(WD.soul>0)))return;if(!on(at(p.c,p.r,0)))return;const h=p.type==='spark'||p.type==='portal'?24:propCv(p.type,p.v,M.z).ay+2;out.push({id:'p'+p.c+'_'+p.r,h:`<span class="pl ${p.gold?'g':''} ${p.rift?'rf':''}">${p.lab}</span>`,p:at(p.c,p.r,h)});});
 const seen=new Set();out.forEach(o=>{let L=WD.labs.get(o.id);if(!L){const el=document.createElement('div');el.className='wl '+(o.cls||'');WD.lay.appendChild(el);L={el,h:''};WD.labs.set(o.id,L);}
  if(L.h!==o.h){L.el.innerHTML=o.h;L.h=o.h;}L.el.style.transform=`translate(${o.p[0].toFixed(1)}px,${o.p[1].toFixed(1)}px)`;seen.add(o.id);});
 WD.labs.forEach((L,id)=>{if(!seen.has(id)){L.el.remove();WD.labs.delete(id);}});}
/* 点选：先在 3D 画面里找点中的人或物；没点中就沿视线落到地面上的那一格。
   最后换回原来斜视角的坐标交给 wTap，后面的走路、对话逻辑一行不改。 */
function w3TapIso(gx,gy){const M=WD.M,ox=Math.round(WD.W/2-WD.cam.x),oy=Math.round(WD.H/2-WD.cam.y),iso=(x,y,up)=>[(x-y)*16+ox,(x+y)*8+oy-(up||0)];let best=null,bd=-1e9;
 const test=(x,y,l,r,top,bot,d,up)=>{const [sx,sy]=w3P(x,y),k=w3S(x,y);if(gx>=sx+l*k&&gx<=sx+r*k&&gy>=sy-top*k&&gy<=sy+bot*k&&d>bd){bd=d;best=iso(x,y,up);}};
 M.ents.forEach(e=>{if(e.dead)return;if(e.kind==='foe'){const cv=monCv(e.look,e.boss?1.1:.72,e.tint);test(e.x,e.y,-dw(cv)/2-3,dw(cv)/2+3,dh(cv)+3,3,e.x+e.y,4);}else test(e.x,e.y,-10,10,30,2,e.x+e.y,10);});
 WD.F.forEach(f=>{if(f.k==='mo')test(f.x,f.y,-10,10,40,-8,f.x+f.y+.5,20);});
 M.props.forEach(p=>{if(!p.act||(p.hid&&!(WD.soul>0)))return;if(p.type==='spark'||p.type==='portal'){test(p.c,p.r,-12,12,24,6,p.c+p.r,8);return;}const o=propCv(p.type,p.v,M.z);test(p.c,p.r,-o.ax,o.w-o.ax,o.ay,o.h-o.ay,p.c+p.r-.1,Math.max(0,Math.min(o.ay-2,8)));});
 if(best)return best;
 const R=new THREE.Raycaster();R.setFromCamera(new THREE.Vector2(gx/WD.W*2-1,1-gy/WD.H*2),W3.cam);const r=R.ray;if(r.direction.y>-1e-4)return null;
 const q=r.origin.clone().addScaledVector(r.direction,-r.origin.y/r.direction.y),c=(q.z+q.x)/Math.SQRT2,rr=(q.z-q.x)/Math.SQRT2;return iso(c,rr,0);}
const _wRender2d=wRender;
wRender=function(){if(!D3.on||W3.fail||!d3Ready()||!WD.M||!WD.cx){W3.live=false;return _wRender2d();}
 try{w3Render();W3.live=true;}catch(e){console.error(e);W3.fail=1;W3.live=false;_wRender2d();}};
const _wTap3=wTap;
wTap=function(gx,gy){if(W3.live&&W3.cam&&W3.up){const q=w3TapIso(gx,gy);if(!q)return;gx=q[0];gy=q[1];}return _wTap3(gx,gy);};
