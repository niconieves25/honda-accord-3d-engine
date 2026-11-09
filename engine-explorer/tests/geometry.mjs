// CPU-only checks of the assembled meshes; no browser, renderer or image comparisons.
// Canvas drawing is stubbed because only geometry and transforms are being checked.
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir, homedir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = process.env.SKILL_DIR || path.join(homedir(), '.claude/skills/teardown');
const {build} = await import(pathToFileURL(path.join(skill, 'node_modules/esbuild/lib/main.js')));
const scratch = await mkdtemp(path.join(tmpdir(), 'honda-geometry-'));
try {
  const output = path.join(scratch, 'geometry.cjs');
  await build({
    stdin: {contents: "export {buildEngine} from './src/engine.js'; export {beltTrack} from './src/detail-timing.js'; export * from './src/kin.js'; export * as THREE from 'three';", resolveDir: project},
    outfile: output, bundle: true, platform: 'node', format: 'cjs',
    nodePaths: [path.join(skill, 'node_modules')], logLevel: 'silent',
  });
  const ctx = new Proxy({createImageData: (w,h) => ({data: new Uint8ClampedArray(w*h*4)})}, {get: (o,k) => k in o ? o[k] : () => {}});
  globalThis.document = {createElement: tag => {
    assert.equal(tag, 'canvas');
    return {width: 0, height: 0, getContext: () => ctx};
  }};
  const {buildEngine, beltTrack, THREE, CYL, DECK, SPEC, TDC, CAM_LAYOUT, VALVETRAIN} = await import(pathToFileURL(output));
  const track=beltTrack([[0,0],[10,0],[10,10],[0,10]]);
  assert.equal(track.length,40);
  assert.deepEqual(track.sample(5),{x:5,y:0,tx:1,ty:0});
  assert.deepEqual(track.sample(-5),{x:0,y:5,tx:0,ty:-1});
  assert.deepEqual(track.sample(45),track.sample(5));
  const e = buildEngine({consolidate:false, detailedRegistry:true});
  e.root.scale.setScalar(1); // All assertions below are in model millimetres.
  const meshes = [];
  e.root.traverse(m => {
    if (!m.isMesh) return;
    meshes.push(m);
    assert.ok(m.material && e.GHOST.has(m.userData.mat0), `Unregistered material on ${m.userData.part}`);
    for (const key of ['position', 'normal']) {
      const attribute = m.geometry.getAttribute(key);
      if (attribute) assert.ok(attribute.array.every(Number.isFinite), `Non-finite ${key}: ${m.userData.part}`);
    }
  });
  for (const id of Object.keys(e.G)) {
    assert.ok(meshes.some(m=>m.userData.part===id), `Empty selectable part: ${id}`);
  }
  const pose = (th,iab=0) => {e.update(th, {iab});e.root.updateMatrixWorld(true);};
  const refs=e.detailedRegistry;
  assert.equal(refs.rockers.length,4,'Four cylinder rocker sets');
  for(const set of refs.rockers) {
    assert.deepEqual(Object.keys(set).sort(),['cy','exA','exB','inA','inB']);
    for(const key of ['inA','inB','exA','exB']) assert.ok(set[key].isGroup,'Missing fixed-profile rocker');
  }
  assert.equal(refs.valves.length,16,'Eight inlet and eight exhaust valves');
  assert.equal(refs.lobes.length,CYL.length*CAM_LAYOUT.length,'Camshaft must use the canonical illustrative track layout');
  assert.equal(e.G.intakeRockers.children.length,VALVETRAIN.intakeRockersA+VALVETRAIN.intakeRockersB);
  assert.equal(e.G.exhaustRockers.children.length,VALVETRAIN.exhaustRockers);
  const forbidden=new Set(['primaryRocker','middleRocker','secondaryRocker','syncPistons','lostMotion','timingPlate','vtecSolenoid']);
  for(const id of forbidden) assert.ok(!e.G[id],`Forbidden hydraulic valve-lift hardware: ${id}`);
  assert.ok(meshes.every(m=>!forbidden.has(m.userData.part)),'Old valve-lift hardware still exists in the mesh tree');
  for(const [tag,count] of [['shaft-inlet-rockers-a',2],['shaft-inlet-rockers-b',3],['shaft-exhaust-rockers',1]])
    assert.equal(meshes.filter(m=>m.userData.catalogPiece===tag).length,count,`${tag} quantity`);
  const adjusters=new Set(meshes.filter(m=>m.userData.catalogPiece==='screw-valve-lash').map(m=>m.userData.catalogInstance));
  assert.equal(adjusters.size,16,'Exactly sixteen valve-clearance adjusters');
  pose(123.5,0);
  const fixedMeshes=meshes.filter(m=>!String(m.userData.part).startsWith('iab'));
  const closed=fixedMeshes.map(m=>m.matrixWorld.elements.slice());
  const butterflies=meshes.filter(m=>m.userData.part==='iabButterflies');
  assert.ok(butterflies.length>=4,'Four independent manifold butterfly discs must be present');
  const iabClosed=butterflies.map(m=>m.matrixWorld.elements.slice());
  pose(123.5,1);
  fixedMeshes.forEach((m,i)=>assert.deepEqual(m.matrixWorld.elements,closed[i],'IAB changed an engine/valvetrain transform'));
  assert.ok(butterflies.some((m,i)=>m.matrixWorld.elements.some((x,j)=>x!==iabClosed[i][j])),'IAB butterflies did not move');
  pose(711.25,0.4); pose(123.5,0);
  fixedMeshes.forEach((m,i)=>assert.deepEqual(m.matrixWorld.elements,closed[i],'Crank seeking has state/history drift'));
  butterflies.forEach((m,i)=>assert.deepEqual(m.matrixWorld.elements,iabClosed[i],'IAB seeking has state/history drift'));
  for(const id of ['flywheel','clutchDisc','clutchPressurePlate']) {
    assert.ok(e.G[id]?.children.length,`Missing 5MT assembly ${id}`);
    assert.ok(Math.abs(e.G[id].rotation.z-123.5*Math.PI/180)<1e-12,`${id} must share crank rotation in coupled demonstration`);
  }
  // The belt drives the rear input pulley; one gear mesh reverses the rear shaft.
  assert.ok(refs.balInputPulley?.isMesh && refs.balInputGear?.isMesh && refs.balRGear?.isMesh);
  for(const th of [0,37,183,417]) {
    pose(th);
    const front=th*2*Math.PI/180;
    assert.ok(Math.abs(refs.balInputPulley.rotation.z-front)<1e-12);
    assert.ok(Math.abs(refs.balInputGear.rotation.z-front)<1e-12);
    assert.ok(Math.abs(refs.balRGear.rotation.z+front)<1e-12);
    assert.equal(refs.balInputPulley.position.x,refs.balInputGear.position.x);
    assert.equal(refs.balInputPulley.position.y,refs.balInputGear.position.y);
    assert.equal(refs.balRGear.position.x,refs.balR.position.x);
    assert.equal(refs.balRGear.position.y,refs.balR.position.y);
  }
  pose(0);
  const beltTeeth=meshes.filter(m=>m.isInstancedMesh&&m.userData.crankDriven);
  assert.equal(beltTeeth.length,2,'Both internal belts need crank-driven transverse teeth');
  const teethAtZero=beltTeeth.map(m=>Array.from(m.instanceMatrix.array));
  pose(25);
  beltTeeth.forEach((m,i)=>{
    assert.ok(m.instanceMatrix.array.every(Number.isFinite),'Invalid tooth transform');
    assert.notDeepEqual(Array.from(m.instanceMatrix.array),teethAtZero[i],'Belt teeth did not travel with crank angle');
    assert.ok(Number.isFinite(m.boundingSphere.radius)&&m.boundingSphere.radius>0,'Invalid tooth bounds');
  });
  pose(0);
  beltTeeth.forEach((m,i)=>assert.deepEqual(Array.from(m.instanceMatrix.array),teethAtZero[i],'Seeking did not restore belt tooth phase'));
  const down = new THREE.Vector3(0,-1,0);
  const ray = new THREE.Raycaster();
  const castDown = (x,y,z,objects,far) => {
    ray.set(new THREE.Vector3(x,y,z),down);ray.near=0;ray.far=far;
    return ray.intersectObjects(objects,true);
  };
  for (const c of CYL) {
    // Sampling centre and near-wall radii catches filled blocks, accidental lids,
    // or a liner axis rotated away from the cylinder axis.
    for (const x of [0,-40,40]) {
      assert.equal(castDown(x,DECK+0.3,c.z,[e.G.block],128).length,0,`Blocked bore ${c.c} at x=${x}`);
      assert.equal(castDown(x,DECK+3,c.z,[e.G.headGasket],4).length,0,`Blocked gasket aperture ${c.c}`);
    }
  }
  for (const pin of e.G.wristPins.children) {
    const box = new THREE.Box3().setFromObject(pin), size = box.getSize(new THREE.Vector3());
    assert.ok(Math.abs(size.x-SPEC.wristPinDia)<0.3 && Math.abs(size.y-SPEC.wristPinDia)<0.3, 'Pin diameter/axis mismatch');
    assert.ok(size.z>size.x*3, 'Wrist pin is not parallel to crankshaft');
  }
  const pistonGroups = e.G.pistons.children.filter(g=>g.isGroup);
  const vertex = new THREE.Vector3();
  let closest = Infinity;
  for (const c of CYL) for (const offset of [0,360]) {
    pose(TDC[c.c]+offset);
    const piston = pistonGroups[c.i];
    const pistonBox = new THREE.Box3().setFromObject(piston);
    assert.ok(pistonBox.max.y <= DECK-0.49, `Piston ${c.c} projects through deck`);
    for (const id of ['intakeValves','exhaustValves']) {
      for (const g of e.G[id].children) {
        if (!g.isGroup || Math.abs(g.position.z-c.z)>25) continue;
        const face=g.children.find(m=>m.geometry?.type==='LatheGeometry');
        if (!face) continue;
        const positions=face.geometry.attributes.position;
        for(let k=0;k<positions.count;k++) {
          vertex.fromBufferAttribute(positions,k).applyMatrix4(face.matrixWorld);
          if(Math.hypot(vertex.x,vertex.z-c.z)>SPEC.bore/2-1)continue;
          const hits=castDown(vertex.x,DECK+30,vertex.z,[piston],100);
          if(!hits.length)continue;
          const clearance=vertex.y-hits[0].point.y;
          closest=Math.min(closest,clearance);
          assert.ok(clearance>0, `${id} penetrates piston ${c.c} at ${offset?'overlap':'compression'} TDC, by ${(-clearance).toFixed(2)} mm`);
        }
      }
    }
  }
  for(const th of [0,90,180,270,360,450,540,630,720]) {
    pose(th);
    for(const m of meshes) assert.ok(m.matrixWorld.elements.every(Number.isFinite),`Non-finite transform: ${m.userData.part}`);
  }
  console.log(`Geometry checks passed: ${meshes.length} meshes; 4 open bores; fixed 16-valve train; independent IAB; pins parallel to crank; minimum sampled TDC valve/piston clearance ${closest.toFixed(2)} mm (illustrative geometry).`);
} finally {
  delete globalThis.document;
  await rm(scratch,{recursive:true,force:true});
}
