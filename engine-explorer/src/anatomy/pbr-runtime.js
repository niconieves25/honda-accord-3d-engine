import {mountGlyphBackdrop} from '../ui/glyph-backdrop.js';
// The catalogue uses the same studio, surfaces and available meshes as the
// complete engine. Anatomy remains the source of the supplementary mechanisms.
import * as THREE from 'three';
import {BACKDROP,configureStudioRenderer,addStudioLighting} from '../studio.js';
import {buildEnginePart} from './engine-parts.js';
import {buildAnatomyMesh} from './three-adapter.js';

const contexts=new WeakMap();
const V=THREE.Vector3;
const corners=box=>[...Array(8)].map((_,i)=>new V(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z));

function contextFor(stage,options) {
  let c=contexts.get(stage);if(c)return c;
  const canvas=document.createElement('canvas');canvas.className='part-canvas';canvas.setAttribute('aria-hidden','true');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  configureStudioRenderer(renderer);
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(options.pixelRatio??Math.min(devicePixelRatio||1,2));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.0005,20);
  const lighting=addStudioLighting(renderer,scene);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({color:'#000000',opacity:.35}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  c={canvas,renderer,scene,camera,floor,lighting,render:null,width:0,height:0};
  const observer=new ResizeObserver(()=>c.render?.());observer.observe(stage);c.observer=observer;
  contexts.set(stage,c);return c;
}

export function mountPbrFigure(stage,sceneDescription,entry,options={}) {
  const c=contextFor(stage,options),{canvas,renderer,scene,camera,floor,lighting}=c;
  c.release?.();
  stage.replaceChildren(canvas);
  mountGlyphBackdrop(stage);
  let model=buildEnginePart(entry);
  if(!model)model=buildAnatomyMesh(sceneDescription,entry);
  const modelRoot=model.root;
  const centered=new THREE.Group();centered.add(modelRoot);
  const assembly=new THREE.Group();assembly.scale.setScalar(.001);assembly.add(centered);scene.add(assembly);

  // Fit the whole motion envelope once. Seeking never changes camera scale.
  const bounds=new THREE.Box3();
  for(let i=0;i<=16;i++){
    model.update({phase:i/16,angle:0,entry});modelRoot.updateMatrixWorld(true);
    bounds.union(new THREE.Box3().setFromObject(modelRoot));
  }
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.x))throw new Error(`Invalid model bounds: ${entry.id}`);
  const center=bounds.getCenter(new V());centered.position.copy(center).negate();
  // Box3 has no scale method; preserve a separate set of world-space corners.
  const motionFitPoints=corners(bounds).map(p=>p.sub(center).multiplyScalar(.001));
  const span=bounds.getSize(new V()).multiplyScalar(.001);
  floor.position.y=(bounds.min.y-center.y)*.001-Math.max(.001,span.length()*.008);
  const shadowSpan=Math.max(.035,span.length()*.8);
  Object.assign(lighting.key.shadow.camera,{left:-shadowSpan,right:shadowSpan,top:shadowSpan,bottom:-shadowSpan});
  lighting.key.shadow.camera.updateProjectionMatrix();
  lighting.key.shadow.normalBias=Math.min(.0008,shadowSpan*.002);

  let state={phase:0,angle:0,tilt:0,zoom:1,theme:'light',inspection:false},disposed=false;
  function draw(next={}){
    if(disposed)return;
    state={...state,...next};
    const width=Math.max(1,stage.clientWidth||720),height=Math.max(1,stage.clientHeight||540);
    if(width!==c.width||height!==c.height){renderer.setSize(width,height,false);c.width=width;c.height=height;}
    camera.aspect=width/height;
    model.update({phase:state.phase,angle:0,entry});
    modelRoot.updateMatrixWorld(true);
    let fitPoints=motionFitPoints;
    let fitCenter=center;
    let fitBounds=bounds;
    if(state.inspection){
      fitBounds=new THREE.Box3().setFromObject(modelRoot);
      // Read only model-local transforms: compensate for the enclosing scene
      // transform before computing the inspection box.
      const inverseParent=new THREE.Matrix4().copy(modelRoot.parent.matrixWorld).invert();
      fitBounds.makeEmpty();
      modelRoot.traverse(m=>{
        if(!m.isMesh||!m.visible)return;
        if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();
        const local=new THREE.Matrix4().multiplyMatrices(inverseParent,m.matrixWorld);
        if(m.isInstancedMesh){const instance=new THREE.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,instance);fitBounds.union(m.geometry.boundingBox.clone().applyMatrix4(local.clone().multiply(instance)));}}
        else fitBounds.union(m.geometry.boundingBox.clone().applyMatrix4(local));
      });
      fitCenter=fitBounds.getCenter(new V());
      fitPoints=corners(fitBounds).map(p=>p.sub(fitCenter).multiplyScalar(.001));
    }
    centered.position.copy(fitCenter).negate();
    floor.position.y=(fitBounds.min.y-fitCenter.y)*.001-Math.max(.00005,Math.min(.001,span.length()*.008));
    floor.material.opacity=state.inspection?.16:.12;
    lighting.key.shadow.radius=3;
    const az=(52+state.angle)*Math.PI/180,el=Math.max(-75,Math.min(85,28+state.tilt))*Math.PI/180;
    const direction=new V(Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az));
    const right=new V().crossVectors(new V(0,1,0),direction).normalize();
    const up=new V().crossVectors(direction,right).normalize();
    const tv=Math.tan(15*Math.PI/180),th=tv*camera.aspect;
    let distance=0;
    for(const p of fitPoints){const depth=p.dot(direction);distance=Math.max(distance,Math.abs(p.dot(up))/tv+depth,Math.abs(p.dot(right))/th+depth);}
    camera.position.copy(direction).multiplyScalar(Math.max(.015,distance*1.17)/Math.max(.7,state.zoom));
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    scene.background=null;
    floor.visible=el>=0;
    scene.updateMatrixWorld(true);renderer.render(scene,camera);
  }
  const destroy=()=>{if(disposed)return;disposed=true;scene.remove(assembly);model.dispose?.();if(c.render===draw)c.render=null;};
  c.release=destroy;c.render=draw;
  draw();
  return {canvas,update:draw,destroy,provenance:model.provenance||'anatomy',sourceId:model.sourceId||entry.id};
}
