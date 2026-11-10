// Projection checks for the full-viewport engine. No WebGL or browser is needed.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {resizePerspectiveCamera, setPerspectivePresentationOffset, PORTRAIT_REFERENCE_FOV} from '../src/ui/framing.js';
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

// An engine-sized volume in the current viewing orientation, including its
// closest corners. This checks real perspective projection, not just FOV values.
const corners = [];
for (const x of [-.30, .30]) for (const y of [-.275, .275]) for (const z of [-.22, .22]) {
  corners.push(new THREE.Vector3(x, y, z).applyQuaternion(camera.quaternion).add(target));
}
const projected = () => corners.map(point => point.clone().project(camera));
resizePerspectiveCamera(camera, 800, 800);
const squareProjection = projected();
camera.fov = PORTRAIT_REFERENCE_FOV;
camera.updateProjectionMatrix();
const portraitReferenceProjection = projected();
const viewports = [[375,812],[768,1024],[1024,768],[1440,900],[1456,800],[812,375]];
for (const [width, height] of viewports) {
  resizePerspectiveCamera(camera, width, height);
  const points = projected();
  for (const [index, point] of points.entries()) {
    assert.ok([point.x, point.y, point.z].every(Number.isFinite), `${width}×${height}: nonfinite projection`);
    assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && point.z > -1 && point.z < 1,
      `${width}×${height}: engine volume cropped`);
    const axis = width < height ? 'x' : 'y';
    const reference = width < height ? portraitReferenceProjection : squareProjection;
    assert.ok(Math.abs(point[axis] - reference[index][axis]) < 1e-12,
      `${width}×${height}: reference framing changed on shorter axis`);
  }
  assert.deepEqual(pose(), originalPose, `${width}×${height}: resizing moved the camera or changed zoom`);
  if (width >= height) assert.equal(camera.fov, 30, 'Landscape reference lens must remain unchanged');
}

// Negative control: the old fixed vertical lens crops this same volume on a
// tall phone. The scenario above must catch a regression back to that behavior.
camera.aspect = 375 / 812;
camera.fov = 30;
camera.updateProjectionMatrix();
assert.ok(projected().some(point => Math.abs(point.x) > 1), 'Portrait test volume does not detect fixed-FOV cropping');

for (const dimensions of [[0,0],[NaN,Infinity]]) {
  resizePerspectiveCamera(camera, ...dimensions);
  assert.equal(camera.aspect, 1);
  assert.equal(camera.fov, 30);
  assert.ok(camera.projectionMatrix.elements.every(Number.isFinite), 'Transient zero viewport broke projection');
  assert.deepEqual(pose(), originalPose);
}

// Side drawers shift the projection rather than the orbit pivot. Measure the
// shift in CSS pixels, including after resizing, and verify inverse picking.
const compositionSizes = [[1440,900],[1200,800],[375,812]];
const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), target);
const ray = new THREE.Raycaster();
for (const [width, height] of compositionSizes) {
  resizePerspectiveCamera(camera, width, height);
  setPerspectivePresentationOffset(camera, width, height);
  const centered = projected();
  for (const offset of [210,-210]) {
    setPerspectivePresentationOffset(camera, width, height, offset);
    const shifted = projected();
    shifted.forEach((point, index) => {
      const pixelShift = (point.x - centered[index].x) * width / 2;
      assert.ok(Math.abs(pixelShift + offset) < 1e-9, `${width}×${height}: offset has wrong direction or magnitude`);
      assert.ok(Math.abs(point.y - centered[index].y) < 1e-12, 'Side drawer moved the projection vertically');
    });
    const screenTarget = target.clone().project(camera);
    ray.setFromCamera(new THREE.Vector2(screenTarget.x, screenTarget.y), camera);
    const picked = ray.ray.intersectPlane(plane, new THREE.Vector3());
    assert.ok(picked?.distanceTo(target) < 1e-10, 'Picking does not match the offset projection');
    assert.deepEqual(pose(), originalPose, 'Side drawer changed camera pose or zoom');
  }
  setPerspectivePresentationOffset(camera, width, height);
  projected().forEach((point, index) => assert.ok(point.distanceTo(centered[index]) < 1e-12, 'Closing drawer did not restore centered projection'));
  assert.equal(camera.view?.enabled, false, 'Closing drawer did not clear the view offset');
}
setPerspectivePresentationOffset(camera, 1440, 900, 210);
resizePerspectiveCamera(camera, 1200, 800);
setPerspectivePresentationOffset(camera, 1200, 800, 210);
const resizedTargetX = (target.clone().project(camera).x + 1) * 1200 / 2;
assert.ok(Math.abs(resizedTargetX - (1200 / 2 - 210)) < 1e-9, 'Active drawer offset changed after viewport resize');
setPerspectivePresentationOffset(camera, 0, 0, NaN);
assert.ok(camera.projectionMatrix.elements.every(Number.isFinite));
assert.deepEqual(pose(), originalPose);

// A docked inspector also reduces the unobstructed width. Lens expansion must
// shrink the projected volume by the requested factor while retaining the exact
// CSS-pixel shift and restoring the original composition when the panel closes.
for (const [width, height] of [[1280,800],[375,812]]) {
  resizePerspectiveCamera(camera, width, height);
  setPerspectivePresentationOffset(camera, width, height);
  const fullSize = projected();
  for (const scale of [.65,.5,.35]) {
    resizePerspectiveCamera(camera, width, height, 30, scale);
    setPerspectivePresentationOffset(camera, width, height);
    const reduced = projected();
    reduced.forEach((point,index) => {
      assert.ok(Math.abs(point.x - fullSize[index].x * scale) < 1e-12, 'Drawer lens has incorrect horizontal scale');
      assert.ok(Math.abs(point.y - fullSize[index].y * scale) < 1e-12, 'Drawer lens has incorrect vertical scale');
      assert.ok(Math.abs(point.z - fullSize[index].z) < 1e-12, 'Drawer lens changed depth');
    });
    setPerspectivePresentationOffset(camera, width, height, 214);
    projected().forEach((point,index) => assert.ok(Math.abs((point.x - reduced[index].x) * width / 2 + 214) < 1e-9, 'Scaled presentation changed pixel offset'));
    assert.deepEqual(pose(), originalPose, 'Fitting a docked panel changed camera pose or zoom');
  }
  resizePerspectiveCamera(camera, width, height);
  setPerspectivePresentationOffset(camera, width, height);
  projected().forEach((point,index) => assert.ok(point.distanceTo(fullSize[index]) < 1e-12, 'Closing docked panel changed original framing'));
}

// Regress the real failure seen on phones: the synthetic test volume above is
// smaller and more centered than several canonical F22A6 reference views. Use
// actual visible mesh vertices, including their native instances, to measure the
// exterior, valve-view accessories, first seated block and complete assembly.
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
  function visibleProjection(root) {
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
          modelPoint.fromBufferAttribute(position,index).applyMatrix4(worldMatrix).project(modelCamera);
          bounds.expandByPoint(modelPoint);vertices++;
        }
      }
    });
    return {bounds,vertices};
  }
  function checkPhonePose(label,root,pose) {
    modelPose(pose);
    for(const [width,height] of [[375,812],[768,1024]]){
      resizePerspectiveCamera(modelCamera,width,height);
      setPerspectivePresentationOffset(modelCamera,width,height);
      const {bounds,vertices}=visibleProjection(root);
      assert.ok(vertices>10000,`${label}: actual model geometry not exercised`);
      const sideClearance=Math.min((bounds.min.x+1)*width/2,(1-bounds.max.x)*width/2);
      assert.ok(sideClearance>=14.5,`${label} at ${width}×${height}: only ${sideClearance.toFixed(2)}px side clearance`);
      assert.ok(bounds.min.y>=-.95&&bounds.max.y<=.95,`${label}: real model cropped vertically`);
      realViewChecks.push({view:label,width,sideClearance:Math.round(sideClearance*10)/10});
    }
  }
  const engine=buildEngine();
  for(const id of ['exterior','noCover']){
    const view=VIEWS[id];
    engine.update(0,{dt:0,iab:0,charge:false,hidden:new Set(view.hidden??[]),ghost:new Set(view.ghost??[]),keepSystems:view.keep?new Set(view.keep):null});
    checkPhonePose(id,engine.root,view.cam);
  }
  assembly=createAssemblyRuntime();
  const first=assembly.setProgress(assembly.progressForStep(0));
  checkPhonePose('assembly:block-seated',assembly.unitGroups.get('block-cylinders:1'),{t:first.focus.target,az:48,el:28,d:first.focus.distance});
  const complete=assembly.setProgress(1);
  checkPhonePose('assembly:complete',assembly.root,{t:complete.focus.target,az:48,el:28,d:complete.focus.distance});
} finally {
  assembly?.dispose();
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
}
console.log(JSON.stringify({pass:true, viewports:viewports.length, portraitCropRegression:true, orbitAndZoomPreserved:true, drawerOffsetAndPicking:true, unobstructedWidthFit:true, portraitReferenceFov:PORTRAIT_REFERENCE_FOV, realViewChecks}));
