import * as THREE from './assets/three.module.js';
import {defaultAxes, readPad, combineInputs} from './controls.mjs';

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
plane(0,20,380,280,material('#b6ba99'),-.04);
// The north-south athletics field and its running lanes are one lightweight canvas texture.
const trackCanvas=document.createElement('canvas');trackCanvas.width=1024;trackCanvas.height=1536;const tc=trackCanvas.getContext('2d');
const fieldTexture=new THREE.CanvasTexture(trackCanvas);fieldTexture.colorSpace=THREE.SRGBColorSpace;
function drawTrack(grassImage){
  tc.fillStyle='#9ba980';tc.fillRect(0,0,1024,1536);
  tc.fillStyle='#b7513d';tc.beginPath();tc.roundRect(67,45,890,1446,445);tc.fill();
  // Subtle granules approximate the texture of the red running surface.
  let seed=518;for(let i=0;i<24000;i++){seed=(seed*1664525+1013904223)>>>0;let x=seed%1024;seed=(seed*1664525+1013904223)>>>0;let y=seed%1536;tc.fillStyle=i%2?'#f8c3a510':'#4527190b';tc.fillRect(x,y,2,2)}
  tc.save();tc.beginPath();tc.roundRect(190,168,644,1200,322);tc.clip();const grassPattern=grassImage?tc.createPattern(grassImage,'repeat'):null;if(grassPattern&&typeof grassPattern.setTransform==='function')grassPattern.setTransform(new DOMMatrix().scale(.35));tc.fillStyle=grassPattern||'#82a45c';tc.fillRect(190,168,644,1200);tc.restore();
  // The real field has a green throwing/jumping area rather than soccer markings.
  tc.fillStyle='#4b937b';tc.beginPath();tc.moveTo(212,780);tc.lineTo(520,780);tc.lineTo(625,1110);tc.lineTo(265,1110);tc.closePath();tc.fill();
  tc.fillStyle='#bbc5ba';for(const [x,y] of [[455,310],[610,1180]]){tc.beginPath();tc.arc(x,y,19,0,Math.PI*2);tc.fill()}
  tc.strokeStyle='rgba(255,249,237,.92)';tc.lineWidth=4;
  for(let i=0;i<6;i++){let v=78+i*21;tc.beginPath();tc.roundRect(v,v-33,1024-v*2,1536-(v-33)*2,(1024-v*2)/2);tc.stroke()}
  tc.lineWidth=4;for(let i=0;i<6;i++){let x=83+i*21;tc.beginPath();tc.moveTo(x,620+i*14);tc.lineTo(x+20,620+i*14);tc.stroke()}
  fieldTexture.needsUpdate=true;
}
drawTrack();const fieldGrass=new Image();fieldGrass.onload=()=>drawTrack(fieldGrass);fieldGrass.src='./assets/grass.jpg';
plane(-8,0,84,132,new THREE.MeshBasicMaterial({map:fieldTexture}),.02);
// Blue outdoor courts, fencing and lighting beside the athletics track.
const courtsCanvas=document.createElement('canvas');courtsCanvas.width=512;courtsCanvas.height=768;const cc=courtsCanvas.getContext('2d');cc.fillStyle='#63a9be';cc.fillRect(0,0,512,768);cc.strokeStyle='#f8f7e8';cc.lineWidth=4;
for(let y=0;y<768;y+=384){cc.strokeRect(28,y+22,456,340);cc.beginPath();cc.moveTo(28,y+192);cc.lineTo(484,y+192);cc.arc(256,y+192,46,0,Math.PI*2);cc.stroke();cc.strokeRect(150,y+22,212,68);cc.strokeRect(150,y+294,212,68)}
const courtsTex=new THREE.CanvasTexture(courtsCanvas);courtsTex.colorSpace=THREE.SRGBColorSpace;plane(-67,3,27,46,new THREE.MeshBasicMaterial({map:courtsTex}),.05);
const rail=material('#66807c');for(let z=-20;z<=26;z+=5){for(let x of [-81,-53])box(x,1.7,z,.14,3.4,.14,rail)}for(let x of [-81,-53])box(x,3.2,3,.14,.14,46,rail);
for(let z of [-16,3,22]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,15,8),material('#717d7d'));pole.position.set(-83,7.5,z);scene.add(pole);box(-83,15.2,z,2.8,.5,1.4,material('#e1ded4'))}
const obstacles=[], labels=[];
function label(text,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#193e40';g.beginPath();g.roundRect(0,0,512,128,18);g.fill();g.fillStyle='#fff';g.font='bold 60px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,67);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true}));s.position.set(x,y,z);s.scale.set(20,5,1);scene.add(s);labels.push(s)}
function building(name,x,z,w,d,h,base=brick){
  box(x,h/2,z,w,h,d,base);box(x,h+.6,z,w+1.5,1.2,d+1.5,roofMat);
  let floors=Math.max(2,Math.floor(h/4));
  for(let j=0;j<floors;j++){let yy=2+j*(h-3)/floors;for(let xx=-w/2+3;xx<w/2-1;xx+=5){box(x+xx,yy,z+d/2+.06,3,2,.1,windowMat);box(x+xx,yy,z-d/2-.06,3,2,.1,windowMat)}}
  obstacles.push({x,z,w,d,h});label(name,x,h+5,z);}
// Relative placement follows the campus guide; dimensions and facade are illustrative.
// West-facing field frontage: Creative Hall's cream vertical fins and
// the adjacent historic auditorium's low, pitched roof and brick arcade.
const cream=material('#ddd9c8'),darkGlass=material('#566f73'),darkBrick=material('#9b5e4b');
box(70,9,-12,29,18,28,cream);box(70,2,-12,29.2,4,28.2,darkBrick);
box(55.35,10,-12,.2,13,24,material('#657b7b'));
for(let z=-23;z<=-1;z+=2.4)box(55.05,12,z,.55,11,.45,cream);
for(let z=-23;z<=-1;z+=5.5)box(55,5.5,z,.8,7,.8,cream);
box(55,9,-12,1,1,26,cream);box(70,18.3,-12,30,.7,29,cream);
box(84,9,2.7,4,17,2,material('#a7c3bd'));for(let y=2;y<18;y+=2)box(84,y,1.6,4,.12,.15,cream);
obstacles.push({x:70,z:-12,w:29,d:28,h:19});label('創意館',70,23,-12);
const hallX=69,hallZ=32,hallW=24,hallD=36;
box(hallX,3.9,hallZ,hallW,7.8,hallD,material('#a55d4e'));
box(hallX,1,hallZ,hallW+.3,2,hallD+.3,material('#96948b'));
for(const side of [-1,1]){const roof=box(hallX+side*6,10,hallZ,13.8,.7,hallD+2,material('#646865'));roof.rotation.z=side*-.38}
for(let z=hallZ-14;z<=hallZ+14;z+=5.6){
 const faceX=hallX-hallW/2-.14, archWidth=1.9;
 box(faceX,2.35,z,.12,3.5,archWidth*2,material('#3d5653'));
 const cap=new THREE.Mesh(new THREE.CircleGeometry(archWidth,20,0,Math.PI),new THREE.MeshBasicMaterial({color:'#3d5653'}));cap.rotation.y=-Math.PI/2;cap.position.set(faceX-.05,4.1,z);scene.add(cap);
 const rimArch=new THREE.Mesh(new THREE.RingGeometry(archWidth,archWidth+.22,24,1,0,Math.PI),new THREE.MeshBasicMaterial({color:'#c6bdad',side:THREE.DoubleSide}));rimArch.rotation.y=-Math.PI/2;rimArch.position.set(faceX-.08,4.1,z);scene.add(rimArch);
 box(faceX-.08,2.35,z-archWidth,.2,3.5,.22,cream);box(faceX-.08,2.35,z+archWidth,.2,3.5,.22,cream);
}
obstacles.push({x:hallX,z:hallZ,w:hallW,d:hallD,h:13});label('大禮堂',hallX,17,hallZ);
// Gym facade uses the user's track-side panorama; its depth remains a simple 3D approximation.
const texLoader=new THREE.TextureLoader();function photoMaterial(path){const texture=texLoader.load(path);texture.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:texture})}
const gymX=-93,gymZ=-42;box(gymX,11.5,gymZ,39,23,53,material('#a96049'));box(gymX,23.4,gymZ,40,.8,54,material('#b8b9b2'));
const gymFront=new THREE.Mesh(new THREE.PlaneGeometry(53,23),photoMaterial('./assets/gym-facade.jpg'));gymFront.position.set(gymX+19.6,11.5,gymZ);gymFront.rotation.y=Math.PI/2;scene.add(gymFront);
for(let z=-66;z<=-18;z+=8){box(gymX+19.2,2,z,.8,4,1,material('#a3a6a0'))}obstacles.push({x:gymX,z:gymZ,w:39,d:53,h:23});label('體育館',gymX,28,gymZ);
building('明德樓',-19,-104,70,20,22,material('#c18b73'));
// The sports centre is a long red-brick hall with horizontal sunshade slats.
const poolX=79,poolZ=-74;
box(poolX,8,poolZ,30,16,58,material('#a7553d'));box(poolX,16.4,poolZ,31,.8,59,material('#726f61'));
const poolFront=new THREE.Mesh(new THREE.PlaneGeometry(58,15),photoMaterial('./assets/pool-facade.jpg'));poolFront.rotation.y=-Math.PI/2;poolFront.position.set(poolX-15.1,7.7,poolZ);scene.add(poolFront);
// Side and rear faces keep the same brick columns, lower glazing and upper louvres.
for(const side of [-1,1]){const x=poolX+side*15.1;for(let z=poolZ-27;z<=poolZ+27;z+=6){box(x,8,z,.6,16,.9,material('#a6583d'))}for(let y=7.5;y<15.2;y+=.65)box(x,y,poolZ,.25,.16,58,material('#7d4b34'))}
box(poolX-19,5,poolZ-21,8,.8,14,material('#9d9d96'));box(poolX-22.5,2.5,poolZ-26,.8,5,2,material('#9d9d96'));
obstacles.push({x:poolX,z:poolZ,w:30,d:58,h:17});label('泳健館',poolX,23,poolZ);

// Track-facing facades are approximate 3D structures, informed by the supplied
// field panoramas and the campus tour. The spacing is adapted for flight.
plane(0,80,355,16,material('#a7aaa2'),-.005);
const campusBrick=texLoader.load('./assets/brick.jpg');campusBrick.colorSpace=THREE.SRGBColorSpace;campusBrick.wrapS=campusBrick.wrapT=THREE.RepeatWrapping;campusBrick.repeat.set(5,3);
const facadeBrick=new THREE.MeshStandardMaterial({map:campusBrick,color:'#e7c7ba',roughness:.9}),facadeStone=material('#c7c5b9'),facadeWindow=material('#4c696e'),facadeFrame=material('#d3cabe'),facadeDoor=material('#334f50');
const brickVariant=color=>new THREE.MeshStandardMaterial({map:campusBrick,color,roughness:.9});
function frontage(name,x,z,w,d,h,floors,body=facadeBrick){
 box(x,h/2,z,w,h,d,body);box(x,h+.3,z,w+1,.6,d+1,facadeStone);
 const front=z-d/2-.12,cell=(w-4)/Math.floor((w-4)/5);
 for(let floor=1;floor<floors;floor++){
  let y=3+floor*(h-4)/floors;box(x,y-1.15,front,w,.32,.35,facadeFrame);
  for(let wx=x-w/2+2+cell/2;wx<x+w/2-2;wx+=cell){
   box(wx,y,front-.13,cell*.8,1.65,.18,facadeWindow);
   box(wx,y,front-.24,.14,1.65,.1,facadeFrame);
  }
  for(const side of [-1,1])for(let wz=z-d/2+3;wz<z+d/2-2;wz+=5)box(x+side*(w/2+.12),y,wz,.2,1.65,3.8,facadeWindow);
 }
 obstacles.push({x,z,w,d,h});label(name,x,h+5,z);return front;
}
function archedOpening(x,z,base,width,height,trim=facadeStone){
 const r=width/2,mid=base+height-r;
 box(x,base+(height-r)/2,z,width,height-r,.2,facadeDoor);
 const cap=new THREE.Mesh(new THREE.CircleGeometry(r,24,0,Math.PI),new THREE.MeshBasicMaterial({color:'#334f50'}));cap.position.set(x,mid,z-.12);cap.rotation.y=Math.PI;scene.add(cap);
 const arch=new THREE.Mesh(new THREE.RingGeometry(r,r+.25,24,1,0,Math.PI),new THREE.MeshBasicMaterial({color:trim.color,side:THREE.DoubleSide}));arch.position.set(x,mid,z-.15);arch.rotation.y=Math.PI;scene.add(arch);
 box(x-r-.12,base+(height-r)/2,z-.15,.24,height-r,.22,trim);box(x+r+.12,base+(height-r)/2,z-.15,.24,height-r,.22,trim);
}
let scienceFront=frontage('科學館',-145,55,37,24,23,5,brickVariant('#e7aa97'));
box(-145,4,scienceFront-.15,19,8,.35,material('#b96150'));
for(const x of [-150,-145,-140])archedOpening(x,scienceFront-.45,0,x===-145?4.2:3.2,6,facadeStone);
box(-145,8.4,scienceFront-.4,20,.55,.8,facadeStone);
let audioFront=frontage('視聽館',-62,107,36,25,20,4,brickVariant('#efc2b2'));
box(-62,3,audioFront-.25,14,6,.35,facadeStone);box(-62,2.7,audioFront-.5,8,5,.18,facadeDoor);
for(const x of [-67,-62,-57])box(x,3,audioFront-.65,.35,6,.4,facadeFrame);
function entrancePhoto(x,z,width,height,path){box(x,height/2,z,width,height,.45,facadeStone);const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),photoMaterial(path));panel.rotation.y=Math.PI;panel.position.set(x,height/2,z-.26);scene.add(panel)}
let libFront=frontage('圖書館',-17,108,41,25,28,6,brickVariant('#e5b5a6'));
entrancePhoto(-17,libFront-.45,23,9,'./assets/library-entrance.jpg');
box(-17,9.2,libFront-.55,24,.65,1,facadeStone);
let duxingFront=frontage('篤行樓',45,109,42,27,30,6,brickVariant('#edc0b2'));
entrancePhoto(45,duxingFront-.45,15,8,'./assets/duxing-entrance.jpg');
let adminFront=frontage('行政大樓',99,108,40,25,30,6,brickVariant('#daa99d'));
box(99,4.5,adminFront-.3,25,9,.65,facadeStone);archedOpening(99,adminFront-.7,0,15,7,facadeFrame);
box(99,9.2,adminFront-.55,26,.6,1,facadeStone);

// Student Center: approximate red-brick wings, cream horizontal bands,
// paired entrance columns and a glazed tower, based on the public tour.
const studentX=-103,studentZ=81,studentW=30,studentD=25,studentH=25;
const studentBrick=material('#ac6457'),lightConcrete=material('#d7d1c0'),studentGlass=material('#8caeb6',{roughness:.42});
box(studentX,studentH/2,studentZ,studentW,studentH,studentD,studentBrick);
box(studentX,studentH+.35,studentZ,studentW+1,.7,studentD+1,lightConcrete);
for(let floor=1;floor<=5;floor++){const y=2.6+floor*3.8;box(studentX,y,studentZ-studentD/2-.15,studentW,.65,.5,lightConcrete);
  for(let x=studentX-11;x<=studentX+10;x+=5)box(x,y+1.45,studentZ-studentD/2-.2,3.8,1.55,.2,material('#60787b'));
  box(studentX+studentW/2+.15,y,studentZ,.5,.65,studentD,lightConcrete);
  for(let z=studentZ-9;z<=studentZ+9;z+=6)box(studentX+studentW/2+.2,y+1.45,z,.2,1.55,4.2,studentGlass)}
box(studentX,6,studentZ-studentD/2-.45,14,10,.3,material('#6e7070'));
box(studentX,10.2,studentZ-studentD/2-2,18,1.2,5,lightConcrete);
for(const x of [studentX-7,studentX+7]){const column=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,10,12),lightConcrete);column.position.set(x,5,studentZ-studentD/2-3);scene.add(column)}
box(studentX+13,13,studentZ-studentD/2-.7,5,25,2,studentGlass);
for(let y=3;y<25;y+=3)box(studentX+13,y,studentZ-studentD/2-1.8,5,.18,.2,lightConcrete);
obstacles.push({x:studentX,z:studentZ,w:studentW,d:studentD,h:studentH});label('學生活動中心',studentX,30,studentZ);
const trunkMat=material('#78654c'),leafMats=[material('#568354'),material('#668f5b'),material('#4f7950')];
function tree(x,z,s=1){const tr=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,6*s,7),trunkMat);tr.position.set(x,3*s,z);scene.add(tr);for(const [dx,dy,dz,r,i] of [[0,7,0,3,0],[-1.7,6.2,.3,2.1,1],[1.7,6.5,.2,2.2,2],[.2,8.2,-.5,2.2,1]]){const cr=new THREE.Mesh(new THREE.SphereGeometry(r*s,9,7),leafMats[i]);cr.position.set(x+dx*s,dy*s,z+dz*s);scene.add(cr)}}
for(const [x,z] of [[-58,-75],[-59,-50],[-60,-22],[-60,50],[49,45],[49,22],[49,-6],[48,-32],[-85,69],[-45,78],[8,79],[32,81],[-110,10]])tree(x,z,.8+Math.random()*.3);
// Landing marker, intentionally on the accessible side of the building.
const target={x:48,z:-72,r:12};const ring=new THREE.Mesh(new THREE.RingGeometry(6.8,7.3,64),new THREE.MeshBasicMaterial({color:'#f7d782',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(target.x,.15,target.z);scene.add(ring);
const beacon=new THREE.Mesh(new THREE.TorusGeometry(2.7,.12,8,36),new THREE.MeshBasicMaterial({color:'#ffe69a'}));beacon.position.set(target.x,8,target.z);scene.add(beacon);label('泳健館入口',target.x,13,target.z);
const gymTarget={x:-64,z:-42,r:10};const gymRing=new THREE.Mesh(new THREE.RingGeometry(5.5,6,64),new THREE.MeshBasicMaterial({color:'#f7d782',side:THREE.DoubleSide}));gymRing.rotation.x=-Math.PI/2;gymRing.position.set(gymTarget.x,.16,gymTarget.z);scene.add(gymRing);
const gymBeacon=new THREE.Mesh(new THREE.TorusGeometry(2.7,.12,8,36),new THREE.MeshBasicMaterial({color:'#ffe69a'}));gymBeacon.position.set(gymTarget.x,8,gymTarget.z);scene.add(gymBeacon);label('體育館入口',gymTarget.x,13,gymTarget.z);
const drone=new THREE.Group();scene.add(drone);
const bodyMat=material('#e6ede2'), darkMat=material('#223e43'), propMat=material('#273b41');
box(0,0,0,3.3,.8,3.5,bodyMat,drone);box(0,-.15,-1.3,1.2,.55,.7,darkMat,drone);
for(const [x,z] of [[-2,-2],[2,-2],[-2,2],[2,2]]){const arm=box(x/2,0,z/2,.6,.35,3.1,darkMat,drone);arm.rotation.y=Math.atan2(x,z);const motor=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.35,10),darkMat);motor.position.set(x,.3,z);drone.add(motor);const p=box(x,.5,z,2.4,.08,.24,propMat,drone);p.rotation.y=Math.PI/4}
// A simplified enclosed pool hall based on the user's panorama, not a measured model.
const indoor = new THREE.Scene();indoor.background=new THREE.Color('#b7d5dc');
indoor.add(new THREE.HemisphereLight(0xeef8ff,0xa7a9a3,2.3));
const indoorSun=new THREE.DirectionalLight('#fff8e9',1.2);indoorSun.position.set(5,25,8);indoor.add(indoorSun);
const tileCanvas=document.createElement('canvas');tileCanvas.width=512;tileCanvas.height=512;const tiled=tileCanvas.getContext('2d');
tiled.fillStyle='#e6e5da';tiled.fillRect(0,0,512,512);tiled.strokeStyle='#a9aaa1';tiled.lineWidth=1;
for(let i=0;i<=512;i+=32){tiled.beginPath();tiled.moveTo(i,0);tiled.lineTo(i,512);tiled.moveTo(0,i);tiled.lineTo(512,i);tiled.stroke()}
const tileTex=new THREE.CanvasTexture(tileCanvas);tileTex.wrapS=tileTex.wrapT=THREE.RepeatWrapping;tileTex.repeat.set(4,7);tileTex.colorSpace=THREE.SRGBColorSpace;
box(0,-.3,0,50,.5,82,new THREE.MeshStandardMaterial({map:tileTex,roughness:1}),indoor);
const poolCanvas=document.createElement('canvas');poolCanvas.width=768;poolCanvas.height=1536;const pc=poolCanvas.getContext('2d');
const waterGradient=pc.createLinearGradient(0,0,768,0);waterGradient.addColorStop(0,'#62b9d2');waterGradient.addColorStop(.42,'#29bdd8');waterGradient.addColorStop(1,'#55a9c5');pc.fillStyle=waterGradient;pc.fillRect(0,0,768,1536);
pc.strokeStyle='#17588b';pc.lineWidth=17;for(let i=0;i<6;i++){const x=(i+.5)*128;pc.beginPath();pc.moveTo(x,135);pc.lineTo(x,1400);pc.stroke();pc.beginPath();pc.moveTo(x-35,135);pc.lineTo(x+35,135);pc.moveTo(x-35,1400);pc.lineTo(x+35,1400);pc.stroke()}
for(let i=1;i<6;i++){const x=i*128;for(let y=30;y<1510;y+=14){pc.fillStyle=(Math.floor(y/14)%2)?'#e9f0e9':(y<200||y>1330?'#c75045':'#2a5b8c');pc.fillRect(x-3,y,6,10)}}
pc.strokeStyle='#ffffff24';pc.lineWidth=4;for(let y=75;y<1500;y+=82){pc.beginPath();pc.moveTo(12,y);pc.bezierCurveTo(170,y-14,360,y+10,750,y-6);pc.stroke()}
const waterTexture=new THREE.CanvasTexture(poolCanvas);waterTexture.colorSpace=THREE.SRGBColorSpace;const waterPlane=new THREE.Mesh(new THREE.PlaneGeometry(22,52),new THREE.MeshStandardMaterial({map:waterTexture,roughness:.35,metalness:.1}));waterPlane.rotation.x=-Math.PI/2;waterPlane.position.y=.06;indoor.add(waterPlane);
const laneBlue=material('#245983'),frameMat=material('#d8dddc'),glass=material('#cfebf1',{roughness:.3}),darkFrame=material('#4e5e60');
const brickTexture=texLoader.load('./assets/brick.jpg');brickTexture.colorSpace=THREE.SRGBColorSpace;brickTexture.wrapS=brickTexture.wrapT=THREE.RepeatWrapping;brickTexture.repeat.set(3,2);const insideBrick=new THREE.MeshStandardMaterial({map:brickTexture,roughness:.92});
box(-25,9,0,.8,18,82,insideBrick,indoor);box(25,9,0,.8,18,82,insideBrick,indoor);box(0,9,-41,50,18,.8,insideBrick,indoor);box(0,9,41,50,18,.8,insideBrick,indoor);
box(0,18.3,0,50,.6,82,material('#303f4b'),indoor);
for(const side of [-1,1]){for(let z=-34;z<=34;z+=8.5){
  box(side*24.48,4.4,z,.15,6.4,7.4,glass,indoor);box(side*24.48,12.4,z,.15,4.4,7.4,glass,indoor);
  box(side*24.15,9,z-4,.65,18,.75,insideBrick,indoor);
  for(let k=-3;k<=3;k+=2){box(side*24.32,4.4,z+k,.35,6.5,.22,darkFrame,indoor);box(side*24.32,12.4,z+k,.35,4.5,.22,darkFrame,indoor)}
  box(side*24.31,4.5,z,.35,.2,7.8,darkFrame,indoor);box(side*24.31,12.5,z,.35,.2,7.8,darkFrame,indoor);
 }
 // Continuous first-floor gallery and handrails seen in the original photograph.
 box(side*23.7,9.1,0,2,.45,80,material('#727d7d'),indoor);box(side*22.8,10.3,0,.15,.13,80,frameMat,indoor);
 for(let z=-38;z<40;z+=4)box(side*22.8,9.75,z,.15,1.2,.15,frameMat,indoor);
}
for(let z=-35;z<=35;z+=5.5){box(0,17.6,z,48,.4,.45,material('#4d5c64'),indoor);for(let x=-17;x<=17;x+=5.6)box(x,16.8,z,4.6,.34,1.2,material('#f1f0e8'),indoor)}
box(0,8.5,-40.5,39,6,.12,material('#ba6b50'),indoor);box(0,6,-40.3,10,5,.15,glass,indoor);
const rim=material('#e4e1d2');for(const x of [-11.3,11.3])box(x,.12,0,.65,.18,53,rim,indoor);for(const z of [-26.3,26.3])box(0,.12,z,23,.18,.65,rim,indoor);
for(let x=-9.2;x<=9.3;x+=3.7){box(x,.55,27,2,1.1,1.5,frameMat,indoor);box(x,1.15,27,2.1,.16,1.6,laneBlue,indoor)}
for(const x of [-12,12]){for(const z of [-18,18]){box(x,.65,z,.12,1.3,.12,frameMat,indoor);box(x,.65,z+1.3,.12,1.3,.12,frameMat,indoor);box(x,1.28,z+.65,.12,.12,1.4,frameMat,indoor)}}
// Gymnasium: an open flying space inspired by the supplied indoor panorama.
const gymIndoor=new THREE.Scene();gymIndoor.background=new THREE.Color('#bed2d6');
gymIndoor.add(new THREE.HemisphereLight('#f9f6df','#7b7566',2.2));
const gymLight=new THREE.DirectionalLight('#fff1db',1.1);gymLight.position.set(5,28,10);gymIndoor.add(gymLight);
const courtCanvas=document.createElement('canvas');courtCanvas.width=1024;courtCanvas.height=1536;const gc=courtCanvas.getContext('2d');
gc.fillStyle='#c78e58';gc.fillRect(0,0,1024,1536);
for(let x=0;x<1024;x+=15){gc.fillStyle=x%30?'#e5b87e':'#d7a46d';gc.fillRect(x,0,14,1536);gc.fillStyle='#9e704b66';for(let y=(x%4)*25;y<1536;y+=100)gc.fillRect(x,y,14,1)}
gc.strokeStyle='#faf5dd';gc.lineWidth=5;gc.strokeRect(78,135,868,1266);gc.beginPath();gc.moveTo(78,768);gc.lineTo(946,768);gc.arc(512,768,105,0,Math.PI*2);gc.stroke();
gc.strokeStyle='#174f91';gc.lineWidth=5;for(const y of [165,770,1370]){gc.strokeRect(230,y-110,564,220);gc.beginPath();gc.arc(512,y,175,0,Math.PI*2);gc.stroke()}
gc.strokeStyle='#9d493f';gc.beginPath();gc.arc(512,768,150,0,Math.PI*2);gc.stroke();
const courtTex=new THREE.CanvasTexture(courtCanvas);courtTex.colorSpace=THREE.SRGBColorSpace;
box(0,-.3,0,50,.5,82,new THREE.MeshStandardMaterial({map:courtTex,roughness:.67}),gymIndoor);
const gymWall=material('#d9cbb0'),gymSteel=material('#4c4b46'),gymBlue=material('#344d69'),gymWindow=material('#d6e3df',{roughness:.4});
box(-25,9,0,.8,18,82,gymWall,gymIndoor);box(25,9,0,.8,18,82,gymWall,gymIndoor);box(0,9,-41,50,18,.8,gymWall,gymIndoor);box(0,9,41,50,18,.8,gymWall,gymIndoor);
box(0,18.3,0,50,.6,82,gymSteel,gymIndoor);
for(const side of [-1,1]){
 for(let z=-35;z<=35;z+=10){
  box(side*24.45,12.7,z,.18,4.3,7.5,gymWindow,gymIndoor);
  box(side*24.28,9,z-4.5,.65,18,.7,gymWall,gymIndoor);
  for(let k=-2.5;k<=2.5;k+=2.5)box(side*24.25,12.7,z+k,.25,4.3,.16,gymSteel,gymIndoor);
  box(side*24.25,3,z,.25,3.8,6.5,gymBlue,gymIndoor);
 }
 for(let step=0;step<3;step++)box(side*(23-step*.65),7.5+step*.58,0,1.3,.45,76,material('#677078'),gymIndoor);
 box(side*21.4,8.5,0,.12,.13,77,frameMat,gymIndoor);
 for(let z=-37;z<40;z+=4)box(side*21.4,8,z,.12,1.1,.12,frameMat,gymIndoor);
}
for(let z=-36;z<=36;z+=6){box(0,17.5,z,49,.35,.45,gymSteel,gymIndoor);for(let x=-18;x<=18;x+=9)box(x,17.1,z,2.5,.14,1,material('#f5ead0'),gymIndoor)}
for(const z of [-32,32]){box(0,6,z,7,4,.18,material('#e9eddf'),gymIndoor);box(0,4.25,z+(z<0?1:-1),3.5,.15,.3,material('#b85b43'),gymIndoor)}
// Scene-specific bounds keep the drone and follow camera inside the hall.
// Scene-specific bounds keep the drone and follow camera inside the hall.
const indoorStart={x:0,y:4.5,z:23,yaw:0};
const gymStart={x:0,y:5,z:22,yaw:0};
const start={x:0,y:5,z:38,yaw:0};const state={...start,vx:0,vy:0,vz:0,view:'chase',paused:true,pano:false,world:'outdoor'};
let outdoorPosition=null;
const sticks={left:{x:0,y:0},right:{x:0,y:0}};let lastToast=0,toastTimer;
const keys=new Set(),padConfig={enabled:false,axes:[...defaultAxes],reverse:[false,false,false,false]};let padReady=false,padIdentity=null,lastAxisUpdate=0,padButtons=[false,false];
const axisNames=['左水平（旋轉）','左垂直（升降）','右水平（平移）','右垂直（前後）'];
axisNames.forEach((name,index)=>{
 const row=document.createElement('label');row.className='axis-row';
 const title=document.createElement('span');title.textContent=name;row.appendChild(title);
 const select=document.createElement('select');select.setAttribute('aria-label',name+'軸');
 for(let i=0;i<8;i++){const option=document.createElement('option');option.value=String(i);option.textContent='軸 '+(i+1);select.appendChild(option)}
 select.value=String(index);select.addEventListener('change',()=>{padConfig.axes[index]=Number(select.value);padReady=false});row.appendChild(select);
 const reverse=document.createElement('input');reverse.type='checkbox';reverse.setAttribute('aria-label',name+'反轉');reverse.addEventListener('change',()=>{padConfig.reverse[index]=reverse.checked;padReady=false});row.appendChild(reverse);
 const reverseLabel=document.createElement('span');reverseLabel.textContent='反轉';row.appendChild(reverseLabel);$('axisSettings').appendChild(row);
});
$('gamepadEnable').addEventListener('change',event=>{padConfig.enabled=event.target.checked;padReady=false});
function keyboardValues(){const down=key=>keys.has(key)?1:0;return {left:{x:down('KeyD')-down('KeyA'),y:down('KeyS')-down('KeyW')},right:{x:down('ArrowRight')-down('ArrowLeft'),y:down('ArrowDown')-down('ArrowUp')}}}
const controlKeys=new Set(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
window.addEventListener('keydown',event=>{if(!controlKeys.has(event.code)||state.paused||state.pano||event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement||event.target instanceof HTMLTextAreaElement)return;event.preventDefault();keys.add(event.code)});
window.addEventListener('keyup',event=>{if(controlKeys.has(event.code)){keys.delete(event.code);if(!state.paused&&!state.pano)event.preventDefault()}});
function padValues(){let pad=null;try{pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected&&p.axes.length>=4)||null}catch{}
 const identity=pad?pad.index+':'+pad.id:null;if(identity!==padIdentity){padIdentity=identity;padReady=false;padButtons=[false,false]}
 if(performance.now()-lastAxisUpdate>150){const axisText=pad?pad.axes.slice(0,8).map((v,i)=>'軸 '+(i+1)+'：'+(Number.isFinite(v)?v.toFixed(2):'—')).join('　'):'尚無軸資料';if($('gamepadAxes').textContent!==axisText)$('gamepadAxes').textContent=axisText;lastAxisUpdate=performance.now()}
 const focused=document.hasFocus();const wasReady=padReady;const result=readPad(pad,padConfig,padReady,focused&&!state.paused&&!state.pano);padReady=result.ready;
 if(!wasReady&&padReady)toast('手把已就緒，可開始飛行');else if(wasReady&&!padReady&&!state.paused&&!state.pano)toast('手把已中斷，請檢查連線與設定');
 if($('gamepadStatus').textContent!==result.status)$('gamepadStatus').textContent=result.status;
 const buttons=pad&&pad.mapping==='standard'&&padConfig.enabled?[!!pad.buttons[0]?.pressed,!!pad.buttons[1]?.pressed]:[false,false];
 const a=buttons[0]&&!padButtons[0],b=buttons[1]&&!padButtons[1];padButtons=buttons;
 let action=false;
 if(focused&&a&&state.paused&&!state.pano){$('startButton').click();action=true}
 else if(focused&&a&&padReady&&!state.pano&&!$('visitButton').classList.contains('hidden')){$('visitButton').click();action=true}
 else if(focused&&b&&state.pano){$('closePano').click();action=true}
 else if(focused&&b&&padReady&&state.world!=='outdoor'){$('outdoorButton').click();action=true}
 return action?{left:{x:0,y:0},right:{x:0,y:0}}:result.values}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function setupStick(id,value){const el=$(id),knob=el.querySelector('.knob');let active=null;
  const update=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=r.width*.31,dist=Math.hypot(dx,dy),k=dist>max?max/dist:1;value.x=dx*k/max;value.y=dy*k/max;knob.style.transform=`translate(calc(-50% + ${dx*k}px),calc(-50% + ${dy*k}px))`};
  const release=e=>{if(active===null||e&&e.pointerId!==active)return;active=null;value.x=0;value.y=0;knob.style.transform='translate(-50%,-50%)'};
  el.addEventListener('pointerdown',e=>{if(active!==null||state.paused||state.pano)return;e.preventDefault();active=e.pointerId;el.setPointerCapture(e.pointerId);update(e)});
  el.addEventListener('pointermove',e=>{if(e.pointerId===active){e.preventDefault();update(e)}});
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);return release}
const releaseLeft=setupStick('leftStick',sticks.left),releaseRight=setupStick('rightStick',sticks.right);
function clearControls(){releaseLeft();releaseRight();keys.clear();padReady=false;state.vx=state.vy=state.vz=0}
function reset(){const home=state.world==='indoor'?indoorStart:state.world==='gym'?gymStart:start;Object.assign(state,home,{vx:0,vy:0,vz:0});clearControls();camera.position.set(home.x,home.y+5,home.z+5);toast(state.world==='indoor'?'已回到泳健館起飛點':state.world==='gym'?'已回到體育館起飛點':'已回到操場起飛點')}
$('resetButton').onclick=reset;
$('viewButton').onclick=()=>{state.view=state.view==='chase'?'fpv':'chase';$('viewButton').textContent=state.view==='chase'?'第一人稱':'第三人稱';toast(state.view==='chase'?'第三人稱視角':'第一人稱視角')};
$('startButton').onclick=()=>{$('overlay').classList.add('hidden');state.paused=false};
$('helpButton').onclick=()=>{clearControls();state.paused=true;$('overlay').classList.remove('hidden');$('startButton').textContent='繼續練習'};
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearControls();state.paused=true;$('overlay').classList.remove('hidden');$('startButton').textContent='繼續練習'}});
window.addEventListener('blur',()=>{if(!state.paused&&!state.pano){clearControls();state.paused=true;$('overlay').classList.remove('hidden');$('startButton').textContent='繼續練習'}});
function blocked(x,y,z){return obstacles.some(b=>y<b.h+1.5&&Math.abs(x-b.x)<b.w/2+1.5&&Math.abs(z-b.z)<b.d/2+1.5)}
const map=$('map').getContext('2d');
function drawMap(){map.clearRect(0,0,200,190);map.fillStyle='#3b655e';map.fillRect(0,0,200,190);
 if(state.world!=='outdoor'){map.fillStyle='#d0d9cc';map.fillRect(42,12,116,166);map.fillStyle=state.world==='gym'?'#c88f5b':'#428fb0';map.fillRect(75,42,50,106);map.strokeStyle='#dbf2f5';if(state.world==='indoor'){for(let x=83;x<125;x+=8){map.beginPath();map.moveTo(x,42);map.lineTo(x,148);map.stroke()}}else{map.strokeRect(80,47,40,96);map.beginPath();map.moveTo(80,95);map.lineTo(120,95);map.arc(100,95,9,0,Math.PI*2);map.stroke()}let x=100+state.x*2.2,z=95+state.z*2;map.save();map.translate(x,z);map.rotate(state.yaw);map.fillStyle='white';map.beginPath();map.moveTo(0,-8);map.lineTo(5,6);map.lineTo(0,4);map.lineTo(-5,6);map.closePath();map.fill();map.restore();return}
 const scale=.57,p=(x,z)=>[100+x*scale,84+z*scale];
  let [fx,fz]=p(-8,0);map.fillStyle='#bd755d';map.beginPath();map.roundRect(fx-24,fz-38,48,76,24);map.fill();map.fillStyle='#87a670';map.beginPath();map.roundRect(fx-17,fz-31,34,62,17);map.fill();
  map.fillStyle='#a9b9a4';for(const b of obstacles){let[x,z]=p(b.x,b.z);map.fillRect(x-b.w*scale/2,z-b.d*scale/2,b.w*scale,b.d*scale)}
  for(const point of [target,gymTarget]){let [tx,tz]=p(point.x,point.z);map.fillStyle='#ffcd79';map.beginPath();map.arc(tx,tz,5,0,7);map.fill()}let [x,z]=p(state.x,state.z);map.save();map.translate(x,z);map.rotate(state.yaw);map.fillStyle='white';map.beginPath();map.moveTo(0,-8);map.lineTo(5,6);map.lineTo(0,4);map.lineTo(-5,6);map.closePath();map.fill();map.restore()}
let last=performance.now();const look=new THREE.Vector3(),cameraGoal=new THREE.Vector3();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
 const controls=combineInputs(sticks,keyboardValues(),padValues());
 if(!state.paused&&!state.pano){state.yaw+=controls.left.x*1.1*dt;
   const indoorMode=state.world!=='outdoor',moveSpeed=indoorMode?4.5:8;
   const f=-controls.right.y*moveSpeed,s=controls.right.x*moveSpeed,vy=-controls.left.y*(indoorMode?3:4.5);
   const vx=Math.sin(state.yaw)*f+Math.cos(state.yaw)*s,vz=-Math.cos(state.yaw)*f+Math.sin(state.yaw)*s;
   const blend=1-Math.exp(-5*dt);state.vx+=(vx-state.vx)*blend;state.vy+=(vy-state.vy)*blend;state.vz+=(vz-state.vz)*blend;
   let rawX=state.x+state.vx*dt,rawZ=state.z+state.vz*dt;
   const rawY=state.y+state.vy*dt;
   let nx=THREE.MathUtils.clamp(rawX,indoorMode?-21:-175,indoorMode?21:165),nz=THREE.MathUtils.clamp(rawZ,indoorMode?-37:-115,indoorMode?37:155),ny=THREE.MathUtils.clamp(rawY,2,indoorMode?15.5:38);
   if((nx!==rawX||nz!==rawZ||(indoorMode&&ny!==rawY))&&now-lastToast>2000){toast(indoorMode?'已接近館內牆壁、地面或屋頂':'已到達本次練習範圍邊界');lastToast=now}
   if(indoorMode||!blocked(nx,ny,nz)){state.x=nx;state.z=nz;state.y=ny}else{state.vx=state.vz=0;if(now-lastToast>2000){toast('接近建築，請調整方向或高度');lastToast=now}}
 }
 drone.position.set(state.x,state.y,state.z);drone.rotation.y=-state.yaw;drone.visible=state.view==='chase';
 const forward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));
 if(state.view==='chase'){const indoors=state.world!=='outdoor';cameraGoal.set(state.x-forward.x*13,state.y+(indoors?7:5.5),state.z-forward.z*13);look.set(state.x+forward.x*8,state.y+(indoors?0:4.5),state.z+forward.z*8)}else{cameraGoal.set(state.x+forward.x*1.7,state.y+.6,state.z+forward.z*1.7);look.set(state.x+forward.x*30,state.y-1,state.z+forward.z*30)}
 if(state.world!=='outdoor'){cameraGoal.x=THREE.MathUtils.clamp(cameraGoal.x,-23,23);cameraGoal.y=THREE.MathUtils.clamp(cameraGoal.y,1.5,17);cameraGoal.z=THREE.MathUtils.clamp(cameraGoal.z,-39,39)}
 camera.position.lerp(cameraGoal,1-Math.exp(-5*dt));camera.lookAt(look);for(const tag of labels){const width=THREE.MathUtils.clamp(camera.position.distanceTo(tag.position)*.15,3,20);tag.scale.set(width,width/4,1)}renderer.render(state.world==='indoor'?indoor:state.world==='gym'?gymIndoor:scene,camera);
 const nearPool=state.world==='outdoor'&&Math.hypot(state.x-target.x,state.z-target.z)<target.r,nearGym=state.world==='outdoor'&&Math.hypot(state.x-gymTarget.x,state.z-gymTarget.z)<gymTarget.r;
 $('visitButton').classList.toggle('hidden',!(nearPool||nearGym)||state.pano||state.paused);$('visitButton').textContent=nearGym?'進入體育館飛行練習':'進入泳健館飛行練習';
 $('missionText').textContent=state.world==='indoor'?'泳健館室內飛行練習':state.world==='gym'?'體育館室內飛行練習':nearGym?'已抵達體育館入口':nearPool?'已抵達泳健館入口':'探索操場與館舍';
 $('altitude').textContent=state.y.toFixed(1);$('speed').textContent=Math.hypot(state.vx,state.vy,state.vz).toFixed(1);$('heading').textContent=String(Math.round(((state.yaw*180/Math.PI)%360+360)%360)).padStart(3,'0');drawMap();
}
camera.position.set(0,13,54);requestAnimationFrame(frame);

// A separate renderer is created lazily so the high-resolution panorama is loaded only on demand.
let panoRenderer,panoCamera,panoScene,panoSphere,panoYaw=0,panoPitch=0,panoDrag=null,panoRenderId;const panoTextures={};
function panoDraw(){if(!state.pano)return;const lat=THREE.MathUtils.degToRad(panoPitch),lon=THREE.MathUtils.degToRad(panoYaw);panoCamera.lookAt(Math.cos(lat)*Math.sin(lon),Math.sin(lat),-Math.cos(lat)*Math.cos(lon));panoRenderer.render(panoScene,panoCamera);panoRenderId=requestAnimationFrame(panoDraw)}
function openPano(){clearControls();state.pano=true;const world=state.world;const gym=world==='gym';$('panoTitle').textContent=gym?'體育館 · 室內球場':'泳健館 · 室內泳池';$('panorama').setAttribute('aria-label',gym?'體育館 360 度實景':'泳健館 360 度實景');$('panorama').classList.remove('hidden');$('panoStatus').textContent='實景載入中…';$('panoStatus').classList.remove('hidden');
 if(!panoRenderer){panoRenderer=new THREE.WebGLRenderer({antialias:true});panoRenderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));panoRenderer.outputColorSpace=THREE.SRGBColorSpace;panoRenderer.setSize(innerWidth,innerHeight);$('panoScene').appendChild(panoRenderer.domElement);panoScene=new THREE.Scene();panoCamera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,100);const sphere=new THREE.SphereGeometry(50,60,40);sphere.scale(-1,1,1);
  panoSphere=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:'#122c34'}));panoScene.add(panoSphere);
 }
 const show=texture=>{if(!state.pano||state.world!==world)return;panoSphere.material.map=texture;panoSphere.material.color.set('#ffffff');panoSphere.material.needsUpdate=true;$('panoStatus').classList.add('hidden')};
 if(panoTextures[world])show(panoTextures[world]);else{panoSphere.material.map=null;panoSphere.material.color.set('#122c34');panoSphere.material.needsUpdate=true;
  new THREE.TextureLoader().load(gym?'./assets/gym-pano.jpg':'./assets/pool.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;const max=panoRenderer.capabilities.maxTextureSize;if(texture.image.width>max){const c=document.createElement('canvas');c.width=max;c.height=Math.floor(max/2);c.getContext('2d').drawImage(texture.image,0,0,c.width,c.height);texture.image=c;texture.needsUpdate=true}panoTextures[world]=texture;show(texture)},undefined,()=>{if(state.pano&&state.world===world)$('panoStatus').textContent='實景載入失敗，請返回後再試。'});
 }panoDraw()}
function enterIndoor(){const gym=Math.hypot(state.x-gymTarget.x,state.z-gymTarget.z)<gymTarget.r;outdoorPosition={x:state.x,y:state.y,z:state.z,yaw:state.yaw};clearControls();Object.assign(state,gym?gymStart:indoorStart,{world:gym?'gym':'indoor'});(gym?gymIndoor:indoor).add(drone);camera.position.set(0,9.5,36);$('indoorActions').classList.remove('hidden');$('mapLabel').textContent=gym?'體育館示意圖':'泳健館示意圖';$('targetLegend').classList.add('hidden');toast(gym?'進入體育館，請避開牆壁及屋頂':'進入泳健館，請避開牆壁及屋頂')}
function returnOutdoor(){const gym=state.world==='gym';clearControls();Object.assign(state,outdoorPosition||start,{world:'outdoor'});scene.add(drone);camera.position.set(state.x,state.y+5,state.z+8);$('indoorActions').classList.add('hidden');$('mapLabel').textContent='校園示意圖';$('targetLegend').classList.remove('hidden');toast(gym?'已返回體育館戶外':'已返回泳健館戶外')}
$('visitButton').onclick=enterIndoor;$('panoButton').onclick=openPano;$('outdoorButton').onclick=returnOutdoor;
$('closePano').onclick=()=>{state.pano=false;cancelAnimationFrame(panoRenderId);$('panorama').classList.add('hidden');toast('已返回飛行畫面')};
const panoEl=$('panoScene');panoEl.style.touchAction='none';panoEl.addEventListener('pointerdown',e=>{if(panoDrag)return;panoDrag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:panoYaw,pitch:panoPitch};panoEl.setPointerCapture(e.pointerId)});panoEl.addEventListener('pointermove',e=>{if(!panoDrag||e.pointerId!==panoDrag.id)return;panoYaw=panoDrag.yaw-(e.clientX-panoDrag.x)*.18;panoPitch=THREE.MathUtils.clamp(panoDrag.pitch+(e.clientY-panoDrag.y)*.18,-85,85)});function endPano(e){if(panoDrag&&e.pointerId===panoDrag.id)panoDrag=null}panoEl.addEventListener('pointerup',endPano);panoEl.addEventListener('pointercancel',endPano);panoEl.addEventListener('lostpointercapture',endPano);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(panoRenderer){panoCamera.aspect=innerWidth/innerHeight;panoCamera.updateProjectionMatrix();panoRenderer.setSize(innerWidth,innerHeight)}});
