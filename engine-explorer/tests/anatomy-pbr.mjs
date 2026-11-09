// CPU checks for the individual-parts PBR viewer. No browser or WebGL renderer.
// These checks protect physical scale, a single isolated component, source-mesh
// reuse, hollow pin geometry, and deterministic motion when seeking the cycle.
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir, homedir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skill=process.env.SKILL_DIR||path.join(homedir(),'.claude/skills/teardown');
const {build}=await import(pathToFileURL(path.join(skill,'node_modules/esbuild/lib/main.js')));
const scratch=await mkdtemp(path.join(tmpdir(),'honda-anatomy-pbr-'));
const previousDocument=globalThis.document;
const failures=[];
let modelsChecked=0,posesChecked=0,sourceModels=0;
const check=(name,fn)=>{try{fn();}catch(error){failures.push(`${name}: ${error.message}`);}};
try{
  const output=path.join(scratch,'anatomy-pbr.cjs');
  await build({
    stdin:{contents:"export {buildEngine} from './src/engine.js'; export * as parts from './src/anatomy/engine-parts.js'; export {buildAnatomyMesh} from './src/anatomy/three-adapter.js'; export {CATALOG} from './src/anatomy/catalog.js'; export {ENGINE,SPEC} from './src/engine-spec.js'; export * as THREE from 'three';",resolveDir:project},
    outfile:output,bundle:true,platform:'node',format:'cjs',
    nodePaths:[path.join(skill,'node_modules')],logLevel:'silent',
  });
  const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});
  globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return{width:0,height:0,getContext:()=>ctx};}};
  const {buildEngine,parts,buildAnatomyMesh,CATALOG,THREE,ENGINE,SPEC}=await import(pathToFileURL(output));
  const scenes=JSON.parse(await readFile(path.join(project,'src/anatomy/scenes.json'),'utf8'));
  const V=THREE.Vector3;
  const entryFor=id=>{const entry=CATALOG.find(e=>e.id===id);assert.ok(entry,`Missing catalogue entry ${id}`);return entry;};
  const resolve=entry=>{let scene=scenes[entry.id]||scenes[entry.kind];if(typeof scene==='string')scene=scenes[scene];assert.ok(scene?.data,`Missing scene ${entry.id}`);return scene;};
  const meshesOf=root=>{const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});return meshes;};
  const boundsOf=model=>{model.root.updateMatrixWorld(true);return new THREE.Box3().setFromObject(model.root);};
  const materialsOf=mesh=>Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const snapshot=model=>meshesOf(model.root).flatMap(m=>[...m.matrixWorld.elements,...(m.isInstancedMesh?m.instanceMatrix.array:[])]);
  const samePose=(a,b,message)=>{assert.equal(a.length,b.length,message);assert.ok(a.every((n,i)=>Math.abs(n-b[i])<1e-5),message);};
  const changed=(a,b)=>a.some((n,i)=>Math.abs(n-b[i])>1e-5);
  // A four-stroke cycle returns pistons, valves, crank and cam to their starting
  // poses. A belt's individual tooth, or an accessory with a noninteger ratio,
  // need not complete an integer revolution during those two crank turns.
  const independentCycle=new Set(['belt-timing','belt-balance','belt-power-steering','belt-alternator','tensioner-timing','tensioner-balance','alternator','rotor-alternator','pulley-power-steering','pump-power-steering','pump-oil']);

  function verifyModel(model,entry,label){
    assert.ok(model?.root?.isObject3D,`${label}: missing object`);
    const units=model.units||model.root.userData.units;
    if(units)assert.equal(units,'mm',`${label}: viewer must receive millimetres`);
    assert.deepEqual(model.root.scale.toArray(),[1,1,1],`${label}: metre conversion belongs in the viewer`);
    const meshes=meshesOf(model.root);
    assert.ok(meshes.length,`${label}: no solid meshes`);
    assert.ok(meshes.some(m=>materialsOf(m).some(mat=>mat.isMeshStandardMaterial)),`${label}: no physically lit surface`);
    for(const mesh of meshes){
      assert.ok(!mesh.userData.fx,`${label}: combustion/spark effect leaked into the component`);
      for(const mat of materialsOf(mesh)){
        assert.notEqual(mat.blending,THREE.AdditiveBlending,`${label}: additive effect material`);
        assert.ok(!mat.isShaderMaterial,`${label}: engine effect shader leaked into the component`);
      }
      for(const attr of ['position','normal']){
        const data=mesh.geometry.getAttribute(attr);
        assert.ok(data?.count>0,`${label}: missing ${attr}`);
        assert.ok(data.array.every(Number.isFinite),`${label}: non-finite ${attr}`);
      }
    }
    model.update({phase:0,angle:0,entry});model.root.updateMatrixWorld(true);
    const initial=snapshot(model);let hasMotion=false;
    // Includes intake/exhaust events as well as the piston endpoints.
    for(const phase of [0,.125,.25,.375,.5,.625,.75,.875,1]){
      model.update({phase,angle:0,entry});model.root.updateMatrixWorld(true);
      const pose=snapshot(model),box=boundsOf(model),size=box.getSize(new V());
      assert.ok(pose.every(Number.isFinite),`${label}: invalid phase ${phase}`);
      assert.ok(!box.isEmpty()&&[...box.min.toArray(),...box.max.toArray()].every(Number.isFinite),`${label}: empty/non-finite bounds`);
      assert.ok(size.toArray().every(n=>n>0)&&Math.max(...size.toArray())<1600,`${label}: scale is not plausible in millimetres (${size.toArray()})`);
      hasMotion ||= changed(initial,pose);
      if(entry.motion.type==='fixed')samePose(initial,pose,`${label}: a stationary part moves with engine phase`);
      posesChecked++;
    }
    if(entry.motion.type!=='fixed')assert.ok(hasMotion,`${label}: declared operating motion is absent`);
    // Seeking backwards must undo previous poses; no integration/time history.
    model.update({phase:.173,angle:0,entry});model.root.updateMatrixWorld(true);const sought=snapshot(model);
    model.update({phase:.819,angle:0,entry});
    model.update({phase:.173,angle:0,entry});model.root.updateMatrixWorld(true);
    samePose(sought,snapshot(model),`${label}: seeking accumulates transforms`);
    model.update({phase:1,angle:0,entry});model.root.updateMatrixWorld(true);
    if(!independentCycle.has(entry.id))samePose(initial,snapshot(model),`${label}: 720-degree cycle does not close`);
    model.update({phase:0,angle:0,entry});model.root.updateMatrixWorld(true);
    samePose(initial,snapshot(model),`${label}: returning to the initial angle does not restore the initial pose`);
    modelsChecked++;
  }

  function verifySingle(model,id){
    const entry=entryFor(id);model.update({phase:0,angle:0,entry});
    const box=boundsOf(model),size=box.getSize(new V());
    if(id==='piston'){
      assert.ok(size.x>80&&size.x<=86&&size.z>80&&size.z<=86,`Piston is not one 85 mm cylinder: ${size.toArray()}`);
      assert.ok(size.y<75,'Piston contains a connecting rod or other assembly');
    }else if(id==='piston-pin'){
      assert.ok(Math.abs(size.x-22)<.5&&Math.abs(size.y-22)<.5,`Pin diameter is not 22 mm: ${size.toArray()}`);
      assert.ok(size.z>=65&&size.z<=76,'Pin is not a single unit parallel to the crank axis');
      const center=box.getCenter(new V()),ray=new THREE.Raycaster(new V(center.x,center.y,box.max.z+5),new V(0,0,-1),0,size.z+10);
      assert.equal(ray.intersectObject(model.root,true).length,0,'Pin bore was filled by the mesh conversion');
      ray.ray.origin.x+=9;
      assert.ok(ray.intersectObject(model.root,true).length>0,'Pin test missed the actual metal wall');
    }else if(id==='connecting-rod'){
      assert.ok(size.z<30&&size.y>140&&size.y<230&&size.x<90,`Rod is not isolated from the other cylinders: ${size.toArray()}`);
    }
  }

  function verifyStroke(buildPart,label){
    const entry=entryFor('piston'),model=buildPart(entry),heights=[];
    try{
      for(const phase of [0,.25,.5,.75,1]){model.update({phase,angle:0,entry});heights.push(boundsOf(model).getCenter(new V()).y);}
      assert.ok(Math.abs(Math.max(...heights)-Math.min(...heights)-SPEC.stroke)<1e-5,`${label}: piston travel must match shared SPEC.stroke`);
      assert.ok(Math.abs(heights[0]-heights[2])<1e-5&&Math.abs(heights[0]-heights[4])<1e-5,`${label}: piston must repeat every crank revolution`);
      assert.ok(heights[0]>heights[1],`${label}: phase zero must start at top dead centre`);
    }finally{model.dispose();}
  }

  assert.equal(ENGINE.code,'F22A6');
  assert.equal(ENGINE.variableValveLift,false);
  assert.ok(CATALOG.length>0,'Component catalogue is empty');
  // Every Anatomy recipe remains valid as a real PBR fallback, even where an
  // existing engine mesh currently takes precedence.
  for(const entry of CATALOG){
    let model;
    check(`Anatomy ${entry.id}`,()=>{model=buildAnatomyMesh(resolve(entry),entry);verifyModel(model,entry,`Anatomy ${entry.id}`);});
    model?.dispose();
  }
  for(const id of ['piston','piston-pin','connecting-rod']){
    let model;
    check(`Single Anatomy ${id}`,()=>{const entry=entryFor(id);model=buildAnatomyMesh(resolve(entry),entry);verifySingle(model,id);});
    model?.dispose();
  }
  check('Anatomy stroke',()=>verifyStroke(entry=>buildAnatomyMesh(resolve(entry),entry),'Anatomy'));

  // The extractor accepts an original engine so the test can compare the
  // actual objects, not source labels, geometry names or duplicated constants.
  const source=buildEngine({consolidate:false,detailedRegistry:true});source.root.scale.setScalar(1);
  const originalMeshes=meshesOf(source.root),originalGeometries=new Set(originalMeshes.map(m=>m.geometry));
  const originalMaterials=new Set(originalMeshes.flatMap(materialsOf));
  const originalParents=new Map(originalMeshes.map(mesh=>[mesh,mesh.parent]));
  // The manifold bypass changes air routing, not the valve profile. Check the
  // actual source mesh transforms at an open-valve phase in both IAB states.
  const physicalNodes=[source.G.pistons,source.G.intakeValves,source.G.exhaustValves];
  const physicalSnapshot=()=>physicalNodes.flatMap(root=>meshesOf(root).filter(m=>!m.userData.fx).flatMap(m=>m.matrixWorld.elements));
  source.update(425,{dt:0,iab:0,charge:false});source.root.updateMatrixWorld(true);const iabClosedTrain=physicalSnapshot();
  source.update(425,{dt:0,iab:1,charge:false});source.root.updateMatrixWorld(true);
  samePose(iabClosedTrain,physicalSnapshot(),'IAB changes piston positions or fixed-profile valve motion');
  for(const id of ['primaryRocker','middleRocker','secondaryRocker','syncPistons','lostMotion','timingPlate','vtecSolenoid']){
    assert.ok(!source.G[id],`Old VTEC group ${id} remains in the F22A6 engine`);
  }
  const extracted=entry=>parts.buildEnginePart(entry,{engine:source});
  for(const entry of CATALOG){
    let model;
    check(`Engine ${entry.id}`,()=>{
      model=extracted(entry);
      if(!model)return;
      verifyModel(model,entry,`Engine ${entry.id}`);
      for(const mesh of meshesOf(model.root)){
        assert.ok(originalGeometries.has(mesh.geometry),`${entry.id}: rebuilt geometry instead of reusing original mesh`);
        for(const material of materialsOf(mesh))assert.ok(originalMaterials.has(material),`${entry.id}: replaced original surface`);
      }
      sourceModels++;
    });
    model?.dispose();
  }
  assert.ok(sourceModels>=20,`Only ${sourceModels} entries reused the existing engine; expected broad original-model coverage`);
  for(const id of ['piston','piston-pin','connecting-rod']){
    let model;
    check(`Single engine ${id}`,()=>{model=extracted(entryFor(id));assert.ok(model,`${id} must use the original model`);verifySingle(model,id);});
    model?.dispose();
  }
  check('Original engine stroke',()=>verifyStroke(extracted,'Original engine'));

  // Isolated disposal must not invalidate the shared engine for later choices.
  const disposedGeometry=new Set(),disposedMaterial=new Set();
  originalGeometries.forEach(g=>g.addEventListener('dispose',()=>disposedGeometry.add(g)));
  originalMaterials.forEach(m=>m.addEventListener('dispose',()=>disposedMaterial.add(m)));
  const reusable=extracted(entryFor('piston'));reusable.dispose();reusable.dispose();
  assert.equal(disposedGeometry.size,0,'Disposing an isolated piece destroys shared engine geometry');
  assert.equal(disposedMaterial.size,0,'Disposing an isolated piece destroys shared engine material');
  assert.ok(source.root.children.length>0,'Source engine was detached/destroyed by part extraction');
  for(const mesh of originalMeshes)assert.equal(mesh.parent,originalParents.get(mesh),'Extracting a component reparented an original engine mesh');
  assert.equal(failures.length,0,failures.join('\n'));
  console.log(`PBR checks passed: ${CATALOG.length} Anatomy fallbacks; ${sourceModels} original-engine extracts; ${modelsChecked} models; ${posesChecked} finite poses; isolated piston/pin/rod; hollow pin; original mesh/material identity; 95 mm travel; repeatable 720-degree seek.`);
}finally{
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  await rm(scratch,{recursive:true,force:true});
}
