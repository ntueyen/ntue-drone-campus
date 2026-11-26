import * as THREE from './assets/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a8d4e0');
scene.fog = new THREE.Fog('#c7dfe0', 210, 440);
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('scene').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 700);
scene.add(new THREE.HemisphereLight(0xe2f4fa, 0x7b8b68, 2.1));
const sun = new THREE.DirectionalLight(0xfff3d7, 2.2); sun.position.set(-70, 140, 80); scene.add(sun);
const material = (c, more={}) => new THREE.MeshStandardMaterial({color:c, roughness:.82, ...more});
const grass = material('#83a86c'), concrete = material('#c8c6af'), brick = material('#ab6e55'), windowMat = material('#507783'), roofMat=material('#dbd6c0');
function box(x,y,z,w,h,d,mat,group=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);group.add(o);return o;}
function plane(x,z,w,d,mat,y=.05){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);scene.add(m);return m;}
plane(0,0,500,500,grass,-.1);
plane(0,0,210,220,material('#b6ba99'),-.04);
// The north-south athletics field and its running lanes are one lightweight canvas texture.
const trackCanvas=document.createElement('canvas');trackCanvas.width=1024;trackCanvas.height=1536;const tc=trackCanvas.getContext('2d');
tc.fillStyle='#7aa965';tc.fillRect(0,0,1024,1536);
tc.fillStyle='#b75941';tc.beginPath();tc.roundRect(67,45,890,1446,445);tc.fill();
tc.fillStyle='#79a762';tc.beginPath();tc.roundRect(190,168,644,1200,322);tc.fill();
tc.strokeStyle='rgba(255,248,224,.88)';tc.lineWidth=5;
for(let i=0;i<6;i++){let v=78+i*21;tc.beginPath();tc.roundRect(v,v-33,1024-v*2,1536-(v-33)*2,(1024-v*2)/2);tc.stroke()}
tc.strokeStyle='#edf0d4';tc.lineWidth=4;tc.strokeRect(300,420,424,690);tc.beginPath();tc.moveTo(300,765);tc.lineTo(724,765);tc.arc(512,765,84,0,Math.PI*2);tc.stroke();
const fieldTexture=new THREE.CanvasTexture(trackCanvas);fieldTexture.colorSpace=THREE.SRGBColorSpace;
plane(-8,0,84,132,new THREE.MeshBasicMaterial({map:fieldTexture}),.02);
// Basketball court west of the track.
plane(-68,5,28,46,material('#6ba7aa'),.04);for(let x of [-80,-56])box(x,.07,5,.12,.08,42,material('#edf3dc'));
const obstacles=[], labels=[];
function label(text,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#193e40';g.beginPath();g.roundRect(0,0,512,128,18);g.fill();g.fillStyle='#fff';g.font='bold 60px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,67);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true}));s.position.set(x,y,z);s.scale.set(20,5,1);scene.add(s);labels.push(s)}
function building(name,x,z,w,d,h,base=brick){
  box(x,h/2,z,w,h,d,base);box(x,h+.6,z,w+1.5,1.2,d+1.5,roofMat);
  let floors=Math.max(2,Math.floor(h/4));
  for(let j=0;j<floors;j++){let yy=2+j*(h-3)/floors;for(let xx=-w/2+3;xx<w/2-1;xx+=5){box(x+xx,yy,z+d/2+.06,3,2,.1,windowMat);box(x+xx,yy,z-d/2-.06,3,2,.1,windowMat)}}
  obstacles.push({x,z,w,d,h});label(name,x,h+5,z);}
// Relative placement follows the campus guide; dimensions and facade are illustrative.
building('大禮堂',68,33,29,26,14,material('#b8785f'));
building('創意館',70,-12,29,28,17,material('#c08b68'));
building('體育館',-90,-42,35,36,20,material('#bc846d'));
building('明德樓',-19,-104,70,20,22,material('#c18b73'));
// Rounded, timber-coloured facade echoes the pool entrance in the supplied photo.
const poolX=79,poolZ=-74;
const poolBase=new THREE.Mesh(new THREE.CylinderGeometry(22,22,17,32),material('#8c5744'));poolBase.position.set(poolX,8.5,poolZ);scene.add(poolBase);
const poolGlass=new THREE.Mesh(new THREE.CylinderGeometry(22.15,22.15,5,32,1,true),material('#446a6e'));poolGlass.position.set(poolX,5,poolZ);scene.add(poolGlass);
const poolRoof=new THREE.Mesh(new THREE.CylinderGeometry(23,23,1.4,32),roofMat);poolRoof.position.set(poolX,17.5,poolZ);scene.add(poolRoof);
for(let i=0;i<32;i++){const a=i*Math.PI*2/32;box(poolX+Math.cos(a)*22.4,11,poolZ+Math.sin(a)*22.4,.7,12,.7,material('#d4b18c'))}
obstacles.push({x:poolX,z:poolZ,w:44,d:44,h:18});label('泳健館',poolX,25,poolZ);
function tree(x,z,s=1){const trunk=material('#78654c'),leaves=material('#568354');const tr=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,5*s,7),trunk);tr.position.set(x,2.5*s,z);scene.add(tr);const cr=new THREE.Mesh(new THREE.SphereGeometry(3.5*s,10,7),leaves);cr.position.set(x,6*s,z);scene.add(cr)}
for(const [x,z] of [[-58,-75],[-59,-50],[-60,-22],[-60,50],[49,45],[49,22],[49,-6],[48,-32],[-58,76],[-24,82],[9,82],[38,79],[-110,10]])tree(x,z,.8+Math.random()*.3);
// Landing marker, intentionally on the accessible side of the building.
const target={x:48,z:-72,r:12};const ring=new THREE.Mesh(new THREE.RingGeometry(6.8,7.3,64),new THREE.MeshBasicMaterial({color:'#f7d782',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(target.x,.15,target.z);scene.add(ring);
const beacon=new THREE.Mesh(new THREE.TorusGeometry(2.7,.12,8,36),new THREE.MeshBasicMaterial({color:'#ffe69a'}));beacon.position.set(target.x,8,target.z);scene.add(beacon);label('泳健館入口',target.x,13,target.z);
const drone=new THREE.Group();scene.add(drone);
const bodyMat=material('#e6ede2'), darkMat=material('#223e43'), propMat=material('#273b41');
box(0,0,0,3.3,.8,3.5,bodyMat,drone);box(0,-.15,-1.3,1.2,.55,.7,darkMat,drone);
for(const [x,z] of [[-2,-2],[2,-2],[-2,2],[2,2]]){const arm=box(x/2,0,z/2,.6,.35,3.1,darkMat,drone);arm.rotation.y=Math.atan2(x,z);const motor=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.35,10),darkMat);motor.position.set(x,.3,z);drone.add(motor);const p=box(x,.5,z,2.4,.08,.24,propMat,drone);p.rotation.y=Math.PI/4}
// A simplified enclosed pool hall based on the user's panorama, not a measured model.
const indoor = new THREE.Scene();indoor.background=new THREE.Color('#b7d5dc');
indoor.add(new THREE.HemisphereLight(0xeef8ff,0xa7a9a3,2.3));
const indoorSun=new THREE.DirectionalLight('#fff8e9',1.2);indoorSun.position.set(5,25,8);indoor.add(indoorSun);
const tileCanvas=document.createElement('canvas');tileCanvas.width=512;tileCanvas.height=512;const tiled=tileCanvas.getContext('2d');
tiled.fillStyle='#d4d8d3';tiled.fillRect(0,0,512,512);tiled.strokeStyle='#a6b1ad';tiled.lineWidth=1;
for(let i=0;i<=512;i+=32){tiled.beginPath();tiled.moveTo(i,0);tiled.lineTo(i,512);tiled.moveTo(0,i);tiled.lineTo(512,i);tiled.stroke()}
const tileTex=new THREE.CanvasTexture(tileCanvas);tileTex.wrapS=tileTex.wrapT=THREE.RepeatWrapping;tileTex.repeat.set(2,3);tileTex.colorSpace=THREE.SRGBColorSpace;
box(0,-.3,0,50,.5,82,new THREE.MeshStandardMaterial({map:tileTex,roughness:1}),indoor);
const water=material('#1599bf',{roughness:.32,metalness:.08});box(0,.015,0,22,.12,52,water,indoor);
const laneWhite=material('#e8f1e7'),laneBlue=material('#245983');
for(let x=-9.2;x<=9.3;x+=3.7){box(x,.11,0,.14,.08,50,laneWhite,indoor);for(let z=-24;z<25;z+=4)box(x,.13,z,.22,.1,1.8,laneBlue,indoor)}
const wall=material('#c1d4d0'),glass=material('#a4d1de',{roughness:.5}),frameMat=material('#f1eee1'),insideBrick=material('#a97865');
box(-25,9,0,.8,18,82,wall,indoor);box(25,9,0,.8,18,82,wall,indoor);box(0,9,-41,50,18,.8,wall,indoor);box(0,9,41,50,18,.8,wall,indoor);
box(0,18.3,0,50,.6,82,material('#e4e4d9'),indoor);
for(const side of [-1,1]){for(let z=-34;z<=34;z+=8.5){box(side*24.5,8.5,z,.15,11,7.4,glass,indoor);box(side*24.2,9,z-4,.55,18,.7,insideBrick,indoor);for(let k=-3;k<=3;k+=3)box(side*24.35,8.5,z+k,.35,11,.18,frameMat,indoor);box(side*24.35,8.5,z,.35,.23,7.8,frameMat,indoor)}}
for(let z=-35;z<=35;z+=7){box(0,17.4,z,48,.6,.65,frameMat,indoor);for(let x=-19;x<=19;x+=6.3)box(x,16.8,z,3,.5,2.1,material('#f4f2ea'),indoor)}
box(0,8.5,-40.5,44,9,.15,glass,indoor);for(let x=-20;x<=20;x+=5)box(x,8.5,-40.3,.35,10,.35,frameMat,indoor);
for(let x=-9;x<=9;x+=3.6){box(x,.9,27,2,1.8,1.5,frameMat,indoor);box(x,1.85,27,2.2,.18,1.7,laneBlue,indoor)}
// Scene-specific bounds keep the drone and follow camera inside the hall.
const indoorStart={x:0,y:4.5,z:23,yaw:0};
const start={x:0,y:5,z:38,yaw:0};const state={...start,vx:0,vy:0,vz:0,view:'chase',paused:true,pano:false,world:'outdoor'};
let outdoorPosition=null;
const sticks={left:{x:0,y:0},right:{x:0,y:0}};let lastToast=0,toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function setupStick(id,value){const el=$(id),knob=el.querySelector('.knob');let active=null;
  const update=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=r.width*.31,dist=Math.hypot(dx,dy),k=dist>max?max/dist:1;value.x=dx*k/max;value.y=dy*k/max;knob.style.transform=`translate(calc(-50% + ${dx*k}px),calc(-50% + ${dy*k}px))`};
  const release=e=>{if(active===null||e&&e.pointerId!==active)return;active=null;value.x=0;value.y=0;knob.style.transform='translate(-50%,-50%)'};
  el.addEventListener('pointerdown',e=>{if(active!==null||state.paused||state.pano)return;e.preventDefault();active=e.pointerId;el.setPointerCapture(e.pointerId);update(e)});
  el.addEventListener('pointermove',e=>{if(e.pointerId===active){e.preventDefault();update(e)}});
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);return release}
const releaseLeft=setupStick('leftStick',sticks.left),releaseRight=setupStick('rightStick',sticks.right);
function clearControls(){releaseLeft();releaseRight();state.vx=state.vy=state.vz=0}
function reset(){const home=state.world==='indoor'?indoorStart:start;Object.assign(state,home,{vx:0,vy:0,vz:0});clearControls();camera.position.set(home.x,home.y+5,home.z+5);toast(state.world==='indoor'?'已回到泳健館起飛點':'已回到操場起飛點')}
$('resetButton').onclick=reset;
$('viewButton').onclick=()=>{state.view=state.view==='chase'?'fpv':'chase';$('viewButton').textContent=state.view==='chase'?'第一人稱':'第三人稱';toast(state.view==='chase'?'第三人稱視角':'第一人稱視角')};
$('startButton').onclick=()=>{$('overlay').classList.add('hidden');state.paused=false};
$('helpButton').onclick=()=>{clearControls();state.paused=true;$('overlay').classList.remove('hidden');$('startButton').textContent='繼續練習'};
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearControls();state.paused=true;$('overlay').classList.remove('hidden');$('startButton').textContent='繼續練習'}});
function blocked(x,y,z){return obstacles.some(b=>y<b.h+1.5&&Math.abs(x-b.x)<b.w/2+1.5&&Math.abs(z-b.z)<b.d/2+1.5)}
const map=$('map').getContext('2d');
function drawMap(){map.clearRect(0,0,200,190);map.fillStyle='#3b655e';map.fillRect(0,0,200,190);
 if(state.world==='indoor'){map.fillStyle='#d0d9cc';map.fillRect(42,12,116,166);map.fillStyle='#428fb0';map.fillRect(75,42,50,106);map.strokeStyle='#dbf2f5';for(let x=83;x<125;x+=8){map.beginPath();map.moveTo(x,42);map.lineTo(x,148);map.stroke()}let x=100+state.x*2.2,z=95+state.z*2;map.save();map.translate(x,z);map.rotate(state.yaw);map.fillStyle='white';map.beginPath();map.moveTo(0,-8);map.lineTo(5,6);map.lineTo(0,4);map.lineTo(-5,6);map.closePath();map.fill();map.restore();return}
 const p=(x,z)=>[100+x*.78,95+z*.78];
  let [fx,fz]=p(-8,0);map.fillStyle='#bd755d';map.beginPath();map.roundRect(fx-32,fz-51,64,102,32);map.fill();map.fillStyle='#87a670';map.beginPath();map.roundRect(fx-23,fz-42,46,84,23);map.fill();
  map.fillStyle='#a9b9a4';for(const b of obstacles){let[x,z]=p(b.x,b.z);map.fillRect(x-b.w*.39,z-b.d*.39,b.w*.78,b.d*.78)}
  let [tx,tz]=p(target.x,target.z);map.fillStyle='#ffcd79';map.beginPath();map.arc(tx,tz,5,0,7);map.fill();let [x,z]=p(state.x,state.z);map.save();map.translate(x,z);map.rotate(state.yaw);map.fillStyle='white';map.beginPath();map.moveTo(0,-8);map.lineTo(5,6);map.lineTo(0,4);map.lineTo(-5,6);map.closePath();map.fill();map.restore()}
let last=performance.now();const look=new THREE.Vector3(),cameraGoal=new THREE.Vector3();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
 if(!state.paused&&!state.pano){state.yaw+=sticks.left.x*1.1*dt;
   const indoorMode=state.world==='indoor',moveSpeed=indoorMode?4.5:8;
   const f=-sticks.right.y*moveSpeed,s=sticks.right.x*moveSpeed,vy=-sticks.left.y*(indoorMode?3:4.5);
   const vx=Math.sin(state.yaw)*f+Math.cos(state.yaw)*s,vz=-Math.cos(state.yaw)*f+Math.sin(state.yaw)*s;
   const blend=1-Math.exp(-5*dt);state.vx+=(vx-state.vx)*blend;state.vy+=(vy-state.vy)*blend;state.vz+=(vz-state.vz)*blend;
   let rawX=state.x+state.vx*dt,rawZ=state.z+state.vz*dt;
   const rawY=state.y+state.vy*dt;
   let nx=THREE.MathUtils.clamp(rawX,indoorMode?-21:-115,indoorMode?21:112),nz=THREE.MathUtils.clamp(rawZ,indoorMode?-37:-115,indoorMode?37:105),ny=THREE.MathUtils.clamp(rawY,2,indoorMode?15.5:38);
   if((nx!==rawX||nz!==rawZ||(indoorMode&&ny!==rawY))&&now-lastToast>2000){toast(indoorMode?'已接近館內牆壁、地面或屋頂':'已到達本次練習範圍邊界');lastToast=now}
   if(indoorMode||!blocked(nx,ny,nz)){state.x=nx;state.z=nz;state.y=ny}else{state.vx=state.vz=0;if(now-lastToast>2000){toast('接近建築，請調整方向或高度');lastToast=now}}
 }
 drone.position.set(state.x,state.y,state.z);drone.rotation.y=-state.yaw;drone.visible=state.view==='chase';
 const forward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));
 if(state.view==='chase'){cameraGoal.set(state.x-forward.x*13,state.y+7,state.z-forward.z*13);look.set(state.x+forward.x*8,state.y,state.z+forward.z*8)}else{cameraGoal.set(state.x+forward.x*1.7,state.y+.6,state.z+forward.z*1.7);look.set(state.x+forward.x*30,state.y-1,state.z+forward.z*30)}
 if(state.world==='indoor'){cameraGoal.x=THREE.MathUtils.clamp(cameraGoal.x,-23,23);cameraGoal.y=THREE.MathUtils.clamp(cameraGoal.y,1.5,17);cameraGoal.z=THREE.MathUtils.clamp(cameraGoal.z,-39,39)}
 camera.position.lerp(cameraGoal,1-Math.exp(-5*dt));camera.lookAt(look);for(const tag of labels){const width=THREE.MathUtils.clamp(camera.position.distanceTo(tag.position)*.15,3,20);tag.scale.set(width,width/4,1)}renderer.render(state.world==='indoor'?indoor:scene,camera);
 const near=state.world==='outdoor'&&Math.hypot(state.x-target.x,state.z-target.z)<target.r; $('visitButton').classList.toggle('hidden',!near||state.pano||state.paused);$('missionText').textContent=state.world==='indoor'?'泳健館室內飛行練習':near?'已抵達泳健館入口':'從操場飛向泳健館';
 $('altitude').textContent=state.y.toFixed(1);$('speed').textContent=Math.hypot(state.vx,state.vy,state.vz).toFixed(1);$('heading').textContent=String(Math.round(((state.yaw*180/Math.PI)%360+360)%360)).padStart(3,'0');drawMap();
}
camera.position.set(0,13,54);requestAnimationFrame(frame);

// A separate renderer is created lazily so the high-resolution panorama is loaded only on demand.
let panoRenderer,panoCamera,panoScene,panoTexture,panoYaw=0,panoPitch=0,panoDrag=null,panoRenderId;
function panoDraw(){if(!state.pano)return;const lat=THREE.MathUtils.degToRad(panoPitch),lon=THREE.MathUtils.degToRad(panoYaw);panoCamera.lookAt(Math.cos(lat)*Math.sin(lon),Math.sin(lat),-Math.cos(lat)*Math.cos(lon));panoRenderer.render(panoScene,panoCamera);panoRenderId=requestAnimationFrame(panoDraw)}
function openPano(){clearControls();state.pano=true;$('panorama').classList.remove('hidden');$('panoStatus').textContent='實景載入中…';$('panoStatus').classList.remove('hidden');
 if(!panoRenderer){panoRenderer=new THREE.WebGLRenderer({antialias:true});panoRenderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));panoRenderer.outputColorSpace=THREE.SRGBColorSpace;panoRenderer.setSize(innerWidth,innerHeight);$('panoScene').appendChild(panoRenderer.domElement);panoScene=new THREE.Scene();panoCamera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,100);const sphere=new THREE.SphereGeometry(50,60,40);sphere.scale(-1,1,1);
  new THREE.TextureLoader().load('./assets/pool.jpg',texture=>{panoTexture=texture;texture.colorSpace=THREE.SRGBColorSpace;const max=panoRenderer.capabilities.maxTextureSize;if(texture.image.width>max){const c=document.createElement('canvas');c.width=max;c.height=Math.floor(max/2);c.getContext('2d').drawImage(texture.image,0,0,c.width,c.height);texture.image=c;texture.needsUpdate=true}panoScene.add(new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({map:texture})));$('panoStatus').classList.add('hidden')},undefined,()=>{$('panoStatus').textContent='實景載入失敗，請返回後再試。'});
 }else if(panoTexture)$('panoStatus').classList.add('hidden');panoDraw()}
function enterIndoor(){outdoorPosition={x:state.x,y:state.y,z:state.z,yaw:state.yaw};clearControls();Object.assign(state,indoorStart,{world:'indoor'});indoor.add(drone);camera.position.set(0,9.5,36);$('indoorActions').classList.remove('hidden');$('mapLabel').textContent='泳健館示意圖';$('targetLegend').classList.add('hidden');toast('進入泳健館，請避開牆壁及屋頂')}
function returnOutdoor(){clearControls();Object.assign(state,outdoorPosition||start,{world:'outdoor'});scene.add(drone);camera.position.set(state.x,state.y+5,state.z+8);$('indoorActions').classList.add('hidden');$('mapLabel').textContent='校園示意圖';$('targetLegend').classList.remove('hidden');toast('已返回泳健館戶外')}
$('visitButton').onclick=enterIndoor;$('panoButton').onclick=openPano;$('outdoorButton').onclick=returnOutdoor;
$('closePano').onclick=()=>{state.pano=false;cancelAnimationFrame(panoRenderId);$('panorama').classList.add('hidden');toast('已返回飛行畫面')};
const panoEl=$('panoScene');panoEl.style.touchAction='none';panoEl.addEventListener('pointerdown',e=>{if(panoDrag)return;panoDrag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:panoYaw,pitch:panoPitch};panoEl.setPointerCapture(e.pointerId)});panoEl.addEventListener('pointermove',e=>{if(!panoDrag||e.pointerId!==panoDrag.id)return;panoYaw=panoDrag.yaw-(e.clientX-panoDrag.x)*.18;panoPitch=THREE.MathUtils.clamp(panoDrag.pitch+(e.clientY-panoDrag.y)*.18,-85,85)});function endPano(e){if(panoDrag&&e.pointerId===panoDrag.id)panoDrag=null}panoEl.addEventListener('pointerup',endPano);panoEl.addEventListener('pointercancel',endPano);panoEl.addEventListener('lostpointercapture',endPano);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(panoRenderer){panoCamera.aspect=innerWidth/innerHeight;panoCamera.updateProjectionMatrix();panoRenderer.setSize(innerWidth,innerHeight)}});
