import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/three/examples/jsm/libs/meshopt_decoder.module.js';
const clamp=THREE.MathUtils.clamp;
const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};

// Expressions and material disruption are independent: the face remains expressive
// while its surface changes between a mesh, particles and typographic fragments.
export function expressionFor(state,t=0){
 const tension=clamp((state.load-8)/78,0,1),closed=state.protectionActive;
 const talk=state.running&&!state.paused&&!closed;
 const gentle=state.lastTone==='kind'&&!closed;
 const flinch=state.lastTone==='hostile'&&state.running?Math.exp(-Math.max(0,state.now-state.signalAt)/900):0;
 const blink=state.reduced?0:Math.pow(Math.max(0,Math.cos(t*1.17+1.1)),65)*.94;
 const close=closed?(state.recoveryReady?.35:.96):blink;
 const pulse=state.reduced?0:Math.sin(t*2.1)*.055;
 return {browInnerUp:closed?.55:tension*.72+flinch*.25,
  browDown_L:tension*.8,browDown_R:tension*.58,
  browOuterUp_L:gentle?.16:.05,browOuterUp_R:gentle?.1:flinch*.3,
  eyeSquint_L:closed?.2:tension*.64,eyeSquint_R:closed?.2:tension*.76,
  eyeBlink_L:close,eyeBlink_R:close*.98,eyeWide_L:flinch*.75,eyeWide_R:flinch*.55,
  eyeLookDown_L:closed?.5:tension*.25,eyeLookDown_R:closed?.5:tension*.25,
  eyeLookIn_L:closed?0:.06+Math.max(0,pulse),eyeLookOut_R:closed?0:.06+Math.max(0,pulse),
  cheekSquint_L:gentle?.25:tension*.2,cheekSquint_R:gentle?.2:tension*.3,
  noseSneer_L:tension*.18,mouthPress_L:tension*.68,mouthPress_R:tension*.55,
  mouthFrown_L:closed?.4:tension*.7,mouthFrown_R:closed?.35:tension*.52,
  mouthLowerDown_L:flinch*.35,mouthLowerDown_R:flinch*.2,
  jawOpen:closed?.035:flinch*.3+(talk?(state.reduced?.08:.09+Math.max(0,Math.sin(t*11))*.17):.015),
  mouthSmile_L:gentle?.38:0,mouthSmile_R:gentle?.29:0,
  mouthDimple_L:gentle?.17:0,mouthDimple_R:gentle?.12:0,
  mouthFunnel:talk?.1:0,mouthPucker:talk?Math.max(0,Math.sin(t*6))*.12:0};
}
export function materialState(state){
 const age=Math.max(0,(state.now-state.signalAt)/1000),hostile=state.lastTone==='hostile'&&state.signalAt>0;
 let fracture=0,shock=0,stage='stable';
 if(state.protectionActive){
  const progress=clamp(1-state.recoveryRemaining,0,1);
  fracture=state.recoveryReady?0:1-THREE.MathUtils.smoothstep(progress,.12,.92);
  stage=state.recoveryReady?'recovered':progress<.18?'protected':'reassembling';
 }else if(hostile&&state.running){
  shock=Math.exp(-age*1.4);fracture=THREE.MathUtils.smoothstep(age,.35,2.8)*.95;
  stage=age<.65?'shock':age<2.8?'fracturing':'overloaded';
 }else{fracture=Math.max(0,(state.load-35)/100)*.35;stage=state.load>=56?'strained':state.load>=24?'unsteady':'stable'}
 return {fracture,shock,stage};
}
function glyphAtlas(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=32;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.font='24px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 [...'01XS:+*#<>/{}=~.'].forEach((char,i)=>ctx.fillText(char,i*32+16,16));
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
}
function seedGeometry(geometry,triangles=false){
 const count=geometry.attributes.position.count,seed=new Float32Array(count);
 for(let i=0;i<count;i++)seed[i]=random(triangles?Math.floor(i/3):i);
 geometry.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));return geometry;
}
// Resolve facial morphs once per frame on the small source mesh. All visual
// layers sample these same vertices, avoiding independent GPU morph caches.
function floatPositions(attribute){const out=new Float32Array(attribute.count*3);for(let i=0;i<attribute.count;i++){out[i*3]=attribute.getX(i);out[i*3+1]=attribute.getY(i);out[i*3+2]=attribute.getZ(i)}return out}
function updateFaceGeometry(mesh){
 const cpu=mesh.userData.faceCPU;if(!cpu)return;
 cpu.positions.set(cpu.base);
 for(let k=0;k<cpu.deltas.length;k++){
  const weight=mesh.morphTargetInfluences[k];if(weight<.0001)continue;
  const delta=cpu.deltas[k];for(let j=0;j<cpu.positions.length;j++)cpu.positions[j]+=delta[j]*weight;
 }
 mesh.geometry.attributes.position.needsUpdate=true;
 for(const binding of cpu.bindings){const output=binding.geometry.attributes.position.array;for(let j=0;j<binding.indices.length;j++){const source=binding.indices[j]*3;output[j*3]=cpu.positions[source];output[j*3+1]=cpu.positions[source+1];output[j*3+2]=cpu.positions[source+2]}binding.geometry.attributes.position.needsUpdate=true}
}
function digitalMaterial(view,kind){
 const points=kind==='dust'||kind==='glyph';
 const material=points?new THREE.PointsMaterial({color:0xe1eef1,size:kind==='glyph'?.17:.019,transparent:true,opacity:1,depthWrite:false,alphaTest:.01}):new THREE.MeshBasicMaterial({color:kind==='wire'?0xe1eef1:0x243b4b,wireframe:kind==='wire',transparent:true,opacity:kind==='wire'?.36:.32,depthWrite:kind==='body',side:THREE.FrontSide});
 if(kind==='glyph')material.depthTest=false;
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,view.uniforms);
  const prefix='uniform float uTime; uniform float uFracture; uniform float uShock; uniform float uMotion; attribute float aSeed; varying float vSeed; varying vec3 vDigital;\n';
  shader.vertexShader=prefix+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
   vec4 digitalWorld=modelMatrix*vec4(transformed,1.0);
   float band=floor(digitalWorld.y*10.0);
   float flow=sin(digitalWorld.y*11.0+uTime*.85)+.5*cos(digitalWorld.x*13.0-uTime*.7);
   digitalWorld.x+=uMotion*.012*flow;
   digitalWorld.z+=uMotion*.012*sin(digitalWorld.y*9.0-uTime*.65+aSeed*.25);
   vec3 scatter=vec3(sin(aSeed*91.0),cos(aSeed*57.0),sin(aSeed*37.0));
   digitalWorld.xyz+=uFracture*(scatter*.58+normalize(digitalWorld.xyz+vec3(.01))*.24);
   digitalWorld.x+=uFracture*.2*sin(band*5.0+floor(uTime*7.0*uMotion));
   digitalWorld.x+=uShock*uMotion*.13*sin(uTime*47.0+band);
   vSeed=aSeed;vDigital=digitalWorld.xyz;
   vec4 mvPosition=viewMatrix*digitalWorld;
   gl_Position=projectionMatrix*mvPosition;
  `);
  shader.fragmentShader='uniform float uTime; uniform float uFracture; uniform float uMotion; uniform sampler2D uAtlas; varying float vSeed; varying vec3 vDigital;\n'+shader.fragmentShader;
  const fragment=kind==='glyph'?`
   float cell=mod(floor(vSeed*16.0+uTime*.7*uMotion),16.0);
   vec2 glyphUv=vec2((cell+gl_PointCoord.x)/16.0,1.0-gl_PointCoord.y);
   diffuseColor.a*=texture2D(uAtlas,glyphUv).a;
   float sweep=sin(vDigital.x*2.2+vDigital.y*.7+uTime*.28*uMotion);
   diffuseColor.a*=smoothstep(-.2,.65,sweep)*(.6+.35*uFracture);
  `:kind==='dust'?`
   diffuseColor.a*=1.0-smoothstep(.18,.5,length(gl_PointCoord-.5));
   diffuseColor.a*=.65+.3*sin(vSeed*30.0+uTime*.9*uMotion);
  `:kind==='wire'?`diffuseColor.a*=.8+.18*sin(vDigital.y*3.0+uTime*.45*uMotion);`:`diffuseColor.a*=1.0-uFracture*.8;`;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+fragment);
 };
 material.customProgramCacheKey=()=>`sensorium-digital-${kind}-v1`;
 return material;
}
// Canvas fallback projects the SAME morphed 3D vertices, keeping expressions
// and state transitions functional when WebGL 2 / GPU acceleration is unavailable.
class CanvasFaceRenderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('Canvas unavailable');this.ratio=1;this.width=1;this.height=1;this.software=true}
 setPixelRatio(ratio){this.ratio=ratio}
 setClearColor(){}
 setSize(width,height){this.width=width;this.height=height;this.canvas.width=Math.round(width*this.ratio);this.canvas.height=Math.round(height*this.ratio);this.ctx.setTransform(this.ratio,0,0,this.ratio,0,0)}
 dispose(){this.ctx.clearRect(0,0,this.width,this.height)}
 render(scene,camera){
  const {ctx,width:w,height:h}=this,view=this.view,u=view.uniforms;
  ctx.clearRect(0,0,w,h);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const time=u.uTime.value,fracture=u.uFracture.value,motion=u.uMotion.value,shock=u.uShock.value;
  const p=new THREE.Vector3(),points=[];
  scene.traverse(mesh=>{
   if(!mesh.isMesh||mesh.renderOrder!==0)return;
   const positions=mesh.geometry.attributes.position,projected=[];
   for(let i=0;i<positions.count;i++){
    p.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
    const seed=random(i),band=Math.floor(p.y*10),length=Math.hypot(p.x+.01,p.y+.01,p.z+.01)||1;
    p.x+=motion*.012*(Math.sin(p.y*11+time*.85)+.5*Math.cos(p.x*13-time*.7));
    p.z+=motion*.012*Math.sin(p.y*9-time*.65+seed*.25);
    p.x+=fracture*(Math.sin(seed*91)*.58+(p.x+.01)/length*.24)+fracture*.2*Math.sin(band*5+Math.floor(time*7*motion))+shock*motion*.13*Math.sin(time*47+band);
    p.y+=fracture*(Math.cos(seed*57)*.58+(p.y+.01)/length*.24);
    p.z+=fracture*(Math.sin(seed*37)*.58+(p.z+.01)/length*.24);
    const depth=p.z;p.project(camera);projected.push({x:(p.x*.5+.5)*w,y:(-.5*p.y+.5)*h,z:depth,seed});
   }
   const indices=mesh.geometry.index?.array;
   ctx.strokeStyle='#b9d4df';ctx.lineWidth=.55;ctx.globalAlpha=.19;ctx.beginPath();
   const count=indices?indices.length:positions.count;
   for(let i=0;i<count;i+=3){const a=projected[indices?indices[i]:i],b=projected[indices?indices[i+1]:i+1],c=projected[indices?indices[i+2]:i+2];if(!a||!b||!c)continue;
    if((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>0)continue;
    if(fracture>.1&&random(i)<fracture*.55)continue;
    ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(a.x,a.y);
   }ctx.stroke();points.push(...projected);
  });
  points.sort((a,b)=>a.z-b.z);ctx.fillStyle='#deedf1';ctx.textAlign='center';ctx.font='8px monospace';
  for(const point of points){ctx.globalAlpha=.25+clamp((point.z+1)*.24,0,.6);const sweep=Math.sin(point.x/w*6+time*.28*motion);
   if(point.seed>.83&&sweep>.1){ctx.fillText('01XS:+*#<>/{}=~.'[Math.floor(point.seed*97+time*.7*motion)%16],point.x,point.y)}else ctx.fillRect(point.x,point.y,1,1);
  }ctx.globalAlpha=1;
 }
}
function replacementCanvas(canvas){const fresh=canvas.cloneNode(false);canvas.replaceWith(fresh);return fresh}
function attachPointer(view){
 const canvas=view.canvas;
 canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();view.pointer.x=(e.clientX-b.left)/b.width-.5;view.pointer.y=(e.clientY-b.top)/b.height-.5});
 canvas.addEventListener('pointerleave',()=>{view.pointer.x=0;view.pointer.y=0});
}
function useSoftware(view,reason){
 if(view.renderer.software)return;
 console.warn('Using compatible face renderer:',reason);
 view.renderer.dispose();view.canvas=replacementCanvas(view.canvas);view.renderer=new CanvasFaceRenderer(view.canvas);view.renderer.view=view;view.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));view.width=0;view.height=0;
 view.canvas.parentElement.dataset.renderer='canvas';view.canvas.parentElement.dataset.face='ready';attachPointer(view);
}
function setup(canvas,atlas,forceSoftware){
 let renderer;
 if(!forceSoftware){try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'})}catch(error){console.warn('WebGL unavailable; using Canvas.',error);canvas=replacementCanvas(canvas)}}
 if(!renderer)renderer=new CanvasFaceRenderer(canvas);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x101b27,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,50);camera.position.set(0,.08,5.7);
 const pivot=new THREE.Group();scene.add(pivot);const pointer={x:0,y:0};
 const uniforms={uTime:{value:0},uFracture:{value:0},uShock:{value:0},uMotion:{value:1},uAtlas:{value:atlas}};
 const view={canvas,renderer,scene,camera,pivot,pointer,uniforms,meshes:[],width:0,height:0,lastNow:0};renderer.view=view;
 canvas.parentElement.dataset.renderer=renderer.software?'canvas':'webgl';attachPointer(view);
 if(!renderer.software){canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();queueMicrotask(()=>useSoftware(view,'graphics context lost'))});renderer.debug.onShaderError=()=>queueMicrotask(()=>useSoftware(view,'shader compilation failed'))}
 return view;
}
function install(view,source){
 const model=source.clone(true);model.traverse(object=>{if(object.morphTargetInfluences)object.morphTargetInfluences.fill(0)});
 const box=new THREE.Box3().setFromObject(model,true),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const normalized=new THREE.Group(),scale=2.7/Math.max(size.x,size.y,size.z);normalized.add(model);normalized.scale.setScalar(scale);normalized.position.copy(center).multiplyScalar(-scale);view.pivot.add(normalized);
 const originals=[];model.traverse(object=>{if(object.isMesh)originals.push(object)});
 for(const mesh of originals){
  const sourceGeometry=mesh.geometry,base=floatPositions(sourceGeometry.attributes.position);
  const deltas=(sourceGeometry.morphAttributes.position||[]).map(attribute=>floatPositions(attribute));
  const geometry=sourceGeometry.clone();geometry.morphAttributes={};geometry.setAttribute('position',new THREE.BufferAttribute(base.slice(),3));seedGeometry(geometry);
  mesh.geometry=geometry;mesh.material=digitalMaterial(view,'body');mesh.frustumCulled=false;mesh.renderOrder=0;
  if(mesh.morphTargetInfluences){mesh.morphTargetInfluences.fill(0);view.meshes.push(mesh);mesh.userData.faceCPU={base,deltas,positions:geometry.attributes.position.array,bindings:[]}}
  for(const kind of ['wire','dust','glyph']){
   if(kind==='glyph'&&!mesh.morphTargetInfluences)continue;
   let geo=geometry,indices=null;
   if(kind==='wire'){
    indices=geometry.index?Array.from(geometry.index.array):Array.from({length:base.length/3},(_,i)=>i);
    geo=geometry.index?geometry.toNonIndexed():geometry.clone();seedGeometry(geo,true);
   }else if(kind==='glyph'){
    indices=Array.from({length:1200},(_,i)=>Math.floor(random(i+41)*base.length/3));geo=new THREE.BufferGeometry();
    const positions=new Float32Array(indices.length*3);indices.forEach((index,j)=>positions.set(base.subarray(index*3,index*3+3),j*3));geo.setAttribute('position',new THREE.BufferAttribute(positions,3));seedGeometry(geo);
   }
   const layer=kind==='wire'?new THREE.Mesh(geo,digitalMaterial(view,kind)):new THREE.Points(geo,digitalMaterial(view,kind));
   layer.frustumCulled=false;layer.renderOrder=kind==='wire'?1:kind==='dust'?2:3;
   layer.position.copy(mesh.position);layer.quaternion.copy(mesh.quaternion);layer.scale.copy(mesh.scale);mesh.parent.add(layer);
   if(indices&&mesh.userData.faceCPU)mesh.userData.faceCPU.bindings.push({geometry:geo,indices});
  }
 }
 view.canvas.parentElement.dataset.face='ready';
}
export async function createFaceView({forceSoftware=new URLSearchParams(location.search).get('face')==='canvas'}={}){
 const views=[],atlas=glyphAtlas();
 try{
  views.push(setup(document.getElementById('introAscii'),atlas,forceSoftware),setup(document.getElementById('ascii'),atlas,forceSoftware));
  // These original skin textures are never displayed: skip material/texture decoding.
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(()=>({name:'SensoriumUntextured',loadMaterial:()=>Promise.resolve(new THREE.MeshBasicMaterial())})).loadAsync('./assets/facecap.glb');
  views.forEach(view=>install(view,gltf.scene));views[0].pivot.scale.setScalar(.65);views[1].pivot.scale.setScalar(.65);
 }catch(error){views.forEach(view=>view.renderer.dispose());atlas.dispose();throw error}
 return {update(state){for(let i=0;i<views.length;i++){
  const view=views[i];if(state.step!==(i===0?0:3))continue;
  const b=view.canvas.getBoundingClientRect();if(!b.width||!b.height)continue;
  if(view.width!==b.width||view.height!==b.height){view.width=b.width;view.height=b.height;view.renderer.setSize(b.width,b.height,false);view.camera.aspect=b.width/b.height;view.camera.updateProjectionMatrix()}
  const current=i===0?{...state,load:0,protectionActive:false,lastTone:'neutral',running:false,signalAt:0}:state;
  const t=state.now/1000,dt=Math.min(.1,(state.now-view.lastNow)/1000||.033),blend=1-Math.exp(-dt*7);view.lastNow=state.now;
  const targets=expressionFor(current,t),effect=materialState(current);
  for(const mesh of view.meshes)for(const [name,index] of Object.entries(mesh.morphTargetDictionary))mesh.morphTargetInfluences[index]+=(clamp(targets[name]||0,0,1)-mesh.morphTargetInfluences[index])*blend;
  view.meshes.forEach(updateFaceGeometry);
  view.uniforms.uTime.value=t;view.uniforms.uFracture.value+=(effect.fracture-view.uniforms.uFracture.value)*blend;view.uniforms.uShock.value=state.reduced?0:effect.shock;view.uniforms.uMotion.value=state.reduced?0:1;
  const stress=current.load/100,closed=current.protectionActive;
  const yaw=state.reduced?0:Math.sin(t*.38)*.13+Math.sin(t*.17)*.06+view.pointer.x*.2-(stress>.55?.13*stress:0);
  const pitch=closed?.22:stress*.08+(state.reduced?0:Math.sin(t*.49)*.04+view.pointer.y*.06);
  view.pivot.rotation.y+=(yaw-view.pivot.rotation.y)*blend;view.pivot.rotation.x+=(pitch-view.pivot.rotation.x)*blend;
  view.pivot.position.y+=((i===1?.14:.16)+(closed?-.1:0)+(state.reduced?0:Math.sin(t*1.1)*.018)-view.pivot.position.y)*blend;
  view.pivot.rotation.z=state.reduced?0:Math.sin(t*32)*effect.shock*.055;
  view.canvas.dataset.expression=effect.stage;try{view.renderer.render(view.scene,view.camera)}catch(error){if(view.renderer.software)throw error;useSoftware(view,error.message)}
 }}};
}
