// The studio: renderer, lights, a soft floor shadow, orbit controls, a thick outline round the selected part, picking,
// and the cutaway plane. Themes change the backdrop only; the engine keeps its photographed colours.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {OutlinePass} from 'three/addons/postprocessing/OutlinePass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {buildEngine} from './engine.js';
import {buildFlows} from './flows.js';

const V3 = THREE.Vector3;
export const BACKDROP = {dark: '#0b0c0e', light: '#f4f4f2', soft: '#d9dbde'};

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true});
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKDROP.dark);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 40);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 0.25;
  controls.maxDistance = 4;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.7;
  controls.enableKeys = false;

  // studio lighting: a broad key from above the intake side, a cool fill, a rim, and a soft environment for the metal
  {
    const env = new THREE.Scene();
    env.background = new THREE.Color('#9a9da2');
    const box = (w, h, pos, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(1, 1, 1).multiplyScalar(k), side: THREE.DoubleSide}));
      m.position.copy(pos);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    box(10, 10, new V3(0, 12, 2), 2.2);
    box(3, 12, new V3(-10, 3, 6), 2.6);
    box(3, 12, new V3(10, 3, -4), 1.8);
    box(16, 2, new V3(0, 1, 12), 1.3);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.03).texture;
    scene.environmentIntensity = 0.6;
    pm.dispose();
  }
  const key = new THREE.DirectionalLight('#ffffff', 1.7);
  key.position.set(1.4, 3.0, 1.6);
  key.castShadow = true;
  Object.assign(key.shadow.camera, {left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.5, far: 8});
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.003;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#dfe8ff', 0.55);
  fill.position.set(-2, 1.2, -1.2);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight('#ffffff', '#3a3c40', 0.45));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({color: '#000000', opacity: 0.35}));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.128;
  floor.receiveShadow = true;
  scene.add(floor);

  const eng = buildEngine();
  scene.add(eng.root);
  const flows = buildFlows();
  scene.add(flows.root);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const outline = new OutlinePass(new THREE.Vector2(4, 4), scene, camera);
  outline.edgeStrength = 6;
  outline.edgeThickness = 2.5;
  outline.visibleEdgeColor.set('#ffd400');
  outline.hiddenEdgeColor.set('#ffd400');
  outline.edgeGlow = 0;
  composer.addPass(outline);
  composer.addPass(new OutputPass());

  // cutaway: everything on the timing-belt side of the plane through a cylinder is cut away
  const clip = new THREE.Plane(new V3(0, 0, -1), 0);
  let clipping = false;
  const setCut = (zWorld) => {
    clipping = zWorld !== null;
    renderer.clippingPlanes = clipping ? [clip] : [];
    if (clipping) clip.constant = zWorld;
    eng.root.traverse((m) => {
      if (!m.isMesh) return;
      for (const mat of [m.material, m.userData.mat0]) {
        if (!mat || mat.userData.fixedSide) continue;
        if (mat.userData.side0 === undefined) mat.userData.side0 = mat.side;
        const side = clipping ? THREE.DoubleSide : mat.userData.side0;
        if (mat.side !== side) {
          mat.side = side;
          mat.needsUpdate = true;
        }
      }
    });
  };

  const size = {w: 1, h: 1};
  const resize = (w, h, pr) => {
    size.w = w;
    size.h = h;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  /** the part under a canvas point (CSS px), skipping hidden and see-through parts */
  const pick = (x, y, allowed) => {
    ndc.set((x / size.w) * 2 - 1, -(y / size.h) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(eng.pickables, false);
    for (const h of hits) {
      let o = h.object;
      let vis = true;
      while (o) {
        if (!o.visible) vis = false;
        o = o.parent;
      }
      if (!vis) continue;
      if (h.object.material.transparent && h.object.material.opacity < 0.2) continue;
      if (clipping && clip.distanceToPoint(h.point) < 0) continue;
      const id = h.object.userData.part;
      if (allowed && !allowed(id)) continue;
      return id;
    }
    return null;
  };
  const pv = new V3();
  /** world (engine mm) → canvas CSS px, or null when behind the camera */
  const project = (mm) => {
    pv.copy(mm).multiplyScalar(0.001).project(camera);
    if (pv.z > 1) return null;
    return [(pv.x * 0.5 + 0.5) * size.w, (-pv.y * 0.5 + 0.5) * size.h];
  };
  const setOutline = (id) => {
    outline.selectedObjects = id ? [eng.G[id]] : [];
  };
  const setTheme = (t) => {
    scene.background = new THREE.Color(BACKDROP[t] ?? BACKDROP.dark);
    floor.material.opacity = t === 'dark' ? 0.5 : 0.25;
    outline.visibleEdgeColor.set(t === 'light' ? '#0047ff' : '#ffd400');
    outline.hiddenEdgeColor.set(t === 'light' ? '#0047ff' : '#ffd400');
  };
  const render = () => composer.render();
  return {renderer, scene, camera, controls, eng, flows, resize, render, pick, project, setCut, setOutline, setTheme, size};
}
