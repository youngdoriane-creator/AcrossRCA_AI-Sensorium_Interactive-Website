import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './vendor/three/examples/jsm/loaders/KTX2Loader.js';
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
function setup(canvas,atlas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x101b27,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,50);camera.position.set(0,.08,5.7);
 const pivot=new THREE.Group();scene.add(pivot);const pointer={x:0,y:0};
 const uniforms={uTime:{value:0},uFracture:{value:0},uShock:{value:0},uMotion:{value:1},uAtlas:{value:atlas}};
 canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();pointer.x=(e.clientX-b.left)/b.width-.5;pointer.y=(e.clientY-b.top)/b.height-.5});canvas.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.parentElement.dataset.face='unavailable'});canvas.addEventListener('webglcontextrestored',()=>{canvas.parentElement.dataset.face='ready'});
 return {canvas,renderer,scene,camera,pivot,pointer,uniforms,meshes:[],width:0,height:0,lastNow:0};
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
export async function createFaceView(){
 const views=[],atlas=glyphAtlas();let ktx;
 try{
  views.push(setup(document.getElementById('introAscii'),atlas),setup(document.getElementById('ascii'),atlas));
  ktx=new KTX2Loader().setTranscoderPath('./vendor/three/examples/jsm/libs/basis/').setWorkerLimit(1).detectSupport(views[0].renderer);
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx).loadAsync('./assets/facecap.glb');
  views.forEach(view=>install(view,gltf.scene));views[0].pivot.scale.setScalar(.65);views[1].pivot.scale.setScalar(.65);ktx.dispose();
 }catch(error){ktx?.dispose();views.forEach(view=>view.renderer.dispose());atlas.dispose();throw error}
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
  view.canvas.dataset.expression=effect.stage;view.renderer.render(view.scene,view.camera);
 }}};
}
