import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './vendor/three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './vendor/three/examples/jsm/libs/meshopt_decoder.module.js';

// The supplied Facecap model uses ARKit morph names with _L / _R suffixes.
export function expressionFor({load=0,protectionActive=false,recoveryReady=false,running=false,paused=false,lastTone='neutral'}) {
 const tension=THREE.MathUtils.clamp((load-10)/80,0,1);
 const closing=protectionActive?(recoveryReady?.5:1):0;
 return {browInnerUp:tension*.35,browDown_L:tension*.65,browDown_R:tension*.65,
  eyeSquint_L:tension*.6,eyeSquint_R:tension*.6,eyeBlink_L:closing*.94,eyeBlink_R:closing*.94,
  mouthPress_L:tension*.55,mouthPress_R:tension*.55,mouthFrown_L:tension*.36,mouthFrown_R:tension*.36,
  jawOpen:running&&!paused&&!protectionActive?.035:0,
  mouthSmile_L:lastTone==='kind'&&!protectionActive?.09*(1-tension):0,mouthSmile_R:lastTone==='kind'&&!protectionActive?.09*(1-tension):0};
}
function setup(canvas) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.setClearColor(0x101b27,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,50);camera.position.set(0,.08,5.7);
 scene.add(new THREE.HemisphereLight(0xd6e4f4,0x253344,2.2));
 for(const [color,intensity,pos] of [[0xe3edf6,3,[-3,4,5]],[0x7b9ebd,2,[3,1,2]],[0xb0c2c0,2,[-2,2,-3]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...pos);scene.add(light)}
 const pivot=new THREE.Group();scene.add(pivot);const pointer={x:0,y:0};
 canvas.addEventListener('pointermove',event=>{const b=canvas.getBoundingClientRect();pointer.x=(event.clientX-b.left)/b.width-.5;pointer.y=(event.clientY-b.top)/b.height-.5});
 canvas.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.parentElement.dataset.face='unavailable'});
 canvas.addEventListener('webglcontextrestored',()=>{canvas.parentElement.dataset.face='ready'});
 return {canvas,renderer,scene,camera,pivot,pointer,meshes:[],width:0,height:0,lastNow:0};
}
function install(view,source) {
 const model=source.clone(true),box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const normalized=new THREE.Group(),scale=2.7/Math.max(size.x,size.y,size.z);
 normalized.add(model);normalized.scale.setScalar(scale);normalized.position.copy(center).multiplyScalar(-scale);view.pivot.add(normalized);
 model.traverse(object=>{if(!object.isMesh)return;
  // A cool, untextured surface ties the face to the existing navy learning interface.
  const eye=/eye/i.test(object.parent?.name||'');
  object.material=new THREE.MeshStandardMaterial({color:eye?0x8d9ba6:0xb7c2c9,roughness:eye?.43:.82,metalness:.03});
  object.frustumCulled=false;
  if(object.morphTargetInfluences){object.morphTargetInfluences.fill(0);view.meshes.push(object)}
 });
 view.canvas.parentElement.dataset.face='ready';
}
export async function createFaceView(){
 const views=[];let loader,ktx;
 try {
  views.push(setup(document.getElementById('introAscii')),setup(document.getElementById('ascii')));
  ktx=new KTX2Loader().setTranscoderPath('./vendor/three/examples/jsm/libs/basis/').setWorkerLimit(1).detectSupport(views[0].renderer);
  loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx);
  const gltf=await loader.loadAsync('./assets/facecap.glb');
  views.forEach(view=>install(view,gltf.scene));views[1].pivot.scale.setScalar(.9);ktx.dispose();
 }catch(error){ktx?.dispose();views.forEach(view=>view.renderer.dispose());throw error}
 return {update(state){
  for(let i=0;i<views.length;i++){
   const view=views[i];if(state.step!==(i===0?0:3))continue;
   const b=view.canvas.getBoundingClientRect();if(!b.width||!b.height)continue;
   if(view.width!==b.width||view.height!==b.height){view.width=b.width;view.height=b.height;view.renderer.setSize(b.width,b.height,false);view.camera.aspect=b.width/b.height;view.camera.updateProjectionMatrix()}
   const current=i===0?{...state,load:0,protectionActive:false,lastTone:'neutral',running:false}:state;
   const target=expressionFor(current),t=state.now/1000,dt=Math.min(.1,(state.now-view.lastNow)/1000||.033),blend=1-Math.exp(-dt*5);view.lastNow=state.now;
   const blink=state.reduced?0:Math.pow(Math.max(0,Math.cos(t*1.43)),42)*.9;
   for(const mesh of view.meshes)for(const [name,index] of Object.entries(mesh.morphTargetDictionary)){
    const wanted=Math.max(target[name]||0,name==='eyeBlink_L'||name==='eyeBlink_R'?blink:0);
    mesh.morphTargetInfluences[index]+=(wanted-mesh.morphTargetInfluences[index])*blend;
   }
   const stress=current.load/100,closed=current.protectionActive;
   const yaw=state.reduced?0:Math.sin(t*.36)*.035+view.pointer.x*.13+(stress>.55?-.12*stress:0);
   const pitch=closed?.16:stress*.07+(state.reduced?0:view.pointer.y*.05);
   view.pivot.rotation.y+=(yaw-view.pivot.rotation.y)*blend;view.pivot.rotation.x+=(pitch-view.pivot.rotation.x)*blend;
   view.pivot.position.y+=( (i===1?.14:0)+(closed?-.12:0)+(state.reduced?0:Math.sin(t*1.1)*.012)-view.pivot.position.y)*blend;
   view.pivot.rotation.z=state.reduced?0:(stress>.55&&!closed?Math.sin(t*18)*.006*stress:0);
   view.canvas.dataset.expression=closed?(current.recoveryReady?'recovering':'protected'):stress>=.56?'overloaded':stress>=.24?'unsteady':'stable';
   view.renderer.render(view.scene,view.camera);
  }
 }};
}
