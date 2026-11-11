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
import {BACKDROP,configureStudioRenderer,addStudioLighting} from './studio.js';
import {resizePerspectiveCamera} from './ui/framing.js';
export {BACKDROP} from './studio.js';

const V3 = THREE.Vector3;


export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true});
  configureStudioRenderer(renderer);
  const scene = new THREE.Scene();
  scene.background = null;
  renderer.setClearColor(0x000000,0);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 40);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 0.25;
  controls.maxDistance = 4;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.7;
  controls.enableKeys = false;

  addStudioLighting(renderer,scene);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({color: '#000000', opacity: 0.35}));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.128;
  floor.receiveShadow = true;
  scene.add(floor);

  const eng = buildEngine();
  scene.add(eng.root);
  floor.position.y = Math.min(-0.128, new THREE.Box3().setFromObject(eng.root).min.y - 0.002);
  const flows = buildFlows();
  scene.add(flows.root);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const outline = new OutlinePass(new THREE.Vector2(4, 4), scene, camera);
  outline.edgeStrength = 6;
  outline.edgeThickness = 2.5;
  outline.visibleEdgeColor.set('#ff4056');
  outline.hiddenEdgeColor.set('#ff4056');
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
  let pixelRatio = 0, framedView;
  const resize = (w, h, pr, view = 'exterior') => {
    const resized = w !== size.w || h !== size.h || pr !== pixelRatio;
    if (!resized && view === framedView) return;
    if (resized) {
      size.w = w;
      size.h = h;
      if (pr !== pixelRatio) {
        pixelRatio = pr;
        renderer.setPixelRatio(pr);
        composer.setPixelRatio(pr);
      }
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
    }
    framedView = view;
    resizePerspectiveCamera(camera, w, h, view);
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
    // Resolve actual tagged meshes, including details nested inside moving groups.
    outline.selectedObjects = id ? eng.pickables.filter(m => m.userData.part === id) : [];
  };
  const setTheme = (t) => {
    scene.background = null;
    floor.material.opacity = t === 'dark' ? 0.5 : 0.25;
    outline.visibleEdgeColor.set(t === 'light' ? '#b50b28' : t === 'soft' ? '#a50e2b' : '#ff4056');
    outline.hiddenEdgeColor.set(t === 'light' ? '#b50b28' : t === 'soft' ? '#a50e2b' : '#ff4056');
  };
  const render = () => composer.render();
  return {renderer, scene, camera, controls, eng, flows, resize, render, pick, project, setCut, setOutline, setTheme, size};
}
