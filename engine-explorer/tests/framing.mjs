// Test the actual projection without requiring a WebGL context.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {resizePerspectiveCamera} from '../src/ui/framing.js';
import {buildEngine} from '../src/engine.js';
import {createAssemblyRuntime} from '../src/assembly/runtime.js';
import {VIEWS} from '../src/views.js';

const target = new THREE.Vector3(.08, .14, -.02);
const camera = new THREE.PerspectiveCamera(30, 1, .02, 40);
camera.position.copy(new THREE.Vector3(1.1, .9, 1.35).normalize().multiplyScalar(1.5).add(target));
camera.lookAt(target);
camera.zoom = 1.05;
camera.updateMatrixWorld(true);
const pose = () => ({
  position: camera.position.toArray(), quaternion: camera.quaternion.toArray(),
  zoom: camera.zoom, target: target.toArray(), near: camera.near, far: camera.far,
});
const originalPose = pose();

const stages = [[320,340],[375,560],[340,320],[350,350],[720,160],[960,500]];
for (const [width, height] of stages) {
  for (const view of ['exterior','noCover','assembly']) {
    resizePerspectiveCamera(camera, width, height, view);
    const projected = target.clone().project(camera);
    assert.ok(Math.hypot(projected.x, projected.y) < 1e-12, 'Orbit target must stay centered in its own stage');
    assert.deepEqual(pose(), originalPose, 'Refitting the viewport moved the camera or changed the user zoom');
  }
}

// A small adjustment across a square stage must not suddenly zoom the scene.
resizePerspectiveCamera(camera, 349.9, 350, 'noCover');
const portraitLens = camera.fov;
resizePerspectiveCamera(camera, 350.1, 350, 'noCover');
assert.ok(Math.abs(camera.fov - portraitLens) < .1, 'The lens jumps across square viewports');

for (const dimensions of [[0,0],[NaN,Infinity]]) {
  resizePerspectiveCamera(camera, ...dimensions);
  assert.equal(camera.aspect, 1);
  assert.ok(camera.projectionMatrix.elements.every(Number.isFinite), 'Transient zero viewport broke projection');
  assert.deepEqual(pose(), originalPose);
}

// Use actual mesh vertices (including native instances) to ensure the reference
// views fit a stage bounded by the heading, side panels and controls. Faint
// context geometry in the interior views is intentionally outside this fit.
const previousDocument = globalThis.document;
const textureContext = new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})}, {
  get:(object,key)=>key in object ? object[key] : ()=>{},
});
globalThis.document = {createElement:()=>({width:0,height:0,getContext:()=>textureContext})};
let assembly;
const realViewChecks = [];
try {
  const modelCamera = new THREE.PerspectiveCamera(30,1,.02,40);
  const modelPoint = new THREE.Vector3(), worldMatrix = new THREE.Matrix4(), instanceMatrix = new THREE.Matrix4();
  const modelPose = ({t,az,el,d}) => {
    const center = new THREE.Vector3(...t).multiplyScalar(.001);
    const a = az * Math.PI / 180, e = el * Math.PI / 180;
    modelCamera.position.set(center.x+d*Math.cos(e)*Math.sin(a),center.y+d*Math.sin(e),center.z+d*Math.cos(e)*Math.cos(a));
    modelCamera.lookAt(center);modelCamera.updateMatrixWorld(true);
  };
  function visibleProjection(root, cut) {
    const bounds = new THREE.Box3();let vertices=0;
    root.updateMatrixWorld(true);
    root.traverse(mesh=>{
      if(!mesh.isMesh||mesh.userData.fx)return;
      let node=mesh;while(node){if(!node.visible)return;node=node.parent;}
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      if(materials.every(material=>material.opacity<.2))return;
      const position=mesh.geometry.attributes.position;
      for(let instance=0;instance<(mesh.isInstancedMesh?mesh.count:1);instance++){
        worldMatrix.copy(mesh.matrixWorld);
        if(mesh.isInstancedMesh){mesh.getMatrixAt(instance,instanceMatrix);worldMatrix.multiply(instanceMatrix);}
        for(let index=0;index<position.count;index++){
          modelPoint.fromBufferAttribute(position,index).applyMatrix4(worldMatrix);
          if (cut !== undefined && modelPoint.z > cut * .001) continue;
          bounds.expandByPoint(modelPoint.project(modelCamera));vertices++;
        }
      }
    });
    return {bounds,vertices};
  }
  function checkBoundedPose(label, root, pose, lens = label, cut) {
    modelPose(pose);
    let horizontal = 1, vertical = 1;
    for (const [width,height] of stages) {
      resizePerspectiveCamera(modelCamera,width,height,lens);
      const {bounds,vertices}=visibleProjection(root,cut);
      assert.ok(vertices>10000,`${label}: actual model geometry not exercised`);
      const sideMargin = Math.min(bounds.min.x + 1, 1 - bounds.max.x) / 2;
      const verticalMargin = Math.min(bounds.min.y + 1, 1 - bounds.max.y) / 2;
      assert.ok(sideMargin >= .03 && verticalMargin >= .03,
        `${label} at ${width}×${height}: insufficient clearance (${(sideMargin*width).toFixed(1)}px horizontal, ${(verticalMargin*height).toFixed(1)}px vertical)`);
      horizontal = Math.min(horizontal, sideMargin);
      vertical = Math.min(vertical, verticalMargin);
    }
    realViewChecks.push({view:label,minSideMarginPct:Math.round(horizontal*1000)/10,minVerticalMarginPct:Math.round(vertical*1000)/10});
  }
  const engine=buildEngine();
  for (const [id,view] of Object.entries(VIEWS)) {
    if (id === 'assembly') continue;
    engine.update(0,{dt:0,iab:0,explode:view.explode??0,hidden:new Set(view.hidden??[]),ghost:new Set(view.ghost??[]),keepSystems:view.keep?new Set(view.keep):null});
    checkBoundedPose(id,engine.root,view.cam,id,view.cut);
  }
  assembly=createAssemblyRuntime();
  const first=assembly.setProgress(assembly.progressForStep(0));
  checkBoundedPose('assembly:block-seated',assembly.unitGroups.get('block-cylinders:1'),{t:first.focus.target,az:48,el:28,d:first.focus.distance},'assembly');
  const complete=assembly.setProgress(1);
  checkBoundedPose('assembly:complete',assembly.root,{t:complete.focus.target,az:48,el:28,d:complete.focus.distance},'assembly');
} finally {
  assembly?.dispose();
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
}
console.log(JSON.stringify({pass:true,boundedStages:stages.length,squareAspectContinuity:true,orbitAndZoomPreserved:true,realViewChecks}));
