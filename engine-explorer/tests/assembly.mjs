// CPU contract checks for the educational engine assembly view. No WebGL or
// browser is needed. Use project dependencies: npm ci && node tests/assembly.mjs.
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=await mkdtemp(path.join(tmpdir(),'honda-assembly-'));
const previousDocument=globalThis.document;
const materialsOf=mesh=>Array.isArray(mesh.material)?mesh.material:[mesh.material];
const meshesOf=root=>{const values=[];root.traverse(node=>{if(node.isMesh)values.push(node);});return values;};
const assertFinite=(values,message)=>assert.ok(Array.from(values).every(Number.isFinite),message);
const closeArray=(actual,expected,message,tolerance=1e-7)=>{
  assert.equal(actual.length,expected.length,`${message}: length`);
  assert.ok(Array.from(actual).every((number,index)=>Math.abs(number-expected[index])<=tolerance),message);
};
const matrixSnapshot=root=>{
  root.updateMatrixWorld(true);
  return meshesOf(root).map(mesh=>({
    uuid:mesh.uuid,visible:mesh.visible,matrix:[...mesh.matrixWorld.elements],
    instances:mesh.isInstancedMesh?Array.from(mesh.instanceMatrix.array):null,
  }));
};
let runtime;
try{
  const output=path.join(scratch,'assembly.cjs');
  await build({
    stdin:{contents:"export {buildAssemblyInventory} from './src/assembly/inventory.js'; export {createAssemblyRuntime} from './src/assembly/runtime.js'; export {buildAssemblySequence} from './src/assembly/sequence.js'; export {CATALOG} from './src/anatomy/catalog.js'; export * as THREE from 'three';",resolveDir:project},
    outfile:output,bundle:true,platform:'node',format:'cjs',logLevel:'silent',
  });
  const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(object,key)=>key in object?object[key]:()=>{}});
  globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return{width:0,height:0,getContext:()=>ctx};}};
  const {buildAssemblyInventory,createAssemblyRuntime,buildAssemblySequence,CATALOG,THREE}=await import(pathToFileURL(output));
  const inventory=buildAssemblyInventory();
  const {engine,units,coverage,uncertainties}=inventory;
  assert.ok(engine?.root?.isObject3D,'Inventory must own a canonical source engine');
  assert.deepEqual(engine.root.scale.toArray(),[1,1,1],'Inventory coordinates must remain in millimetres');
  assert.ok(Array.isArray(units)&&units.length>0,'No physical assembly units');
  assert.ok(coverage,'Missing catalogue coverage audit');
  assert.ok(Array.isArray(uncertainties),'Missing explicit uncertainty list');
  const catalogIds=new Set(CATALOG.map(entry=>entry.id));
  const extraIds=new Set(coverage.extraTypes||[]);
  const validTypes=new Set([...catalogIds,...extraIds]);
  const ids=new Set(),owners=new Map(),unitById=new Map();
  for(const unit of units){
    assert.ok(validTypes.has(unit.catalogId),`${unit.id}: unrecorded catalogue/extra type`);
    if(extraIds.has(unit.catalogId))assert.ok(unit.label?.es&&unit.label?.en,`${unit.id}: documented extra lacks a bilingual label`);
    assert.equal(unit.id,`${unit.catalogId}:${unit.instanceIndex}`,`${unit.id}: unstable physical-unit id`);
    assert.ok(Number.isInteger(unit.instanceIndex)&&unit.instanceIndex>=1,`${unit.id}: instances must be 1-based`);
    assert.ok(!ids.has(unit.id),`${unit.id}: duplicate physical-unit id`);ids.add(unit.id);unitById.set(unit.id,unit);
    assert.ok(unit.parentId,`${unit.id}: missing selectable parent`);
    assert.ok(unit.chapter!==undefined,`${unit.id}: missing assembly chapter`);
    assert.ok(Object.hasOwn(unit,'subassembly'),`${unit.id}: missing subassembly association`);
    assert.ok(unit.evidence,`${unit.id}: missing evidence status`);
    assert.ok(unit.note?.es&&unit.note?.en,`${unit.id}: missing bilingual evidence note`);
    assert.ok(unit.meshes.length>0,`${unit.id}: empty installable unit`);
    assert.equal(unit.meshes.length,unit.restMatrices.length,`${unit.id}: missing final mesh poses`);
    unit.meshes.forEach((mesh,index)=>{
      assert.ok(mesh.isMesh,`${unit.id}: unit member is not physical mesh`);
      assert.ok(!mesh.userData.fx,`${unit.id}: combustion/spark effect is installable`);
      assert.ok(!owners.has(mesh),`${unit.id}: mesh already owned by ${owners.get(mesh)}`);owners.set(mesh,unit.id);
      assert.ok(unit.restMatrices[index]?.isMatrix4,`${unit.id}: final pose must be a Matrix4`);
      assertFinite(unit.restMatrices[index].elements,`${unit.id}: non-finite installed pose`);
      assert.ok(mesh.geometry?.isBufferGeometry,`${unit.id}: missing physical geometry`);
    });
  }
  engine.root.updateMatrixWorld(true);
  for(const unit of units)unit.meshes.forEach((mesh,index)=>closeArray(unit.restMatrices[index].elements,mesh.matrixWorld.elements,`${unit.id}: rest pose is not the source canonical pose`));
  for(const catalogId of new Set(units.map(unit=>unit.catalogId))){
    const instances=units.filter(unit=>unit.catalogId===catalogId).map(unit=>unit.instanceIndex).sort((a,b)=>a-b);
    assert.deepEqual(instances,instances.map((_,index)=>index+1),`${catalogId}: physical instance numbering has gaps`);
  }
  const physical=meshesOf(engine.root).filter(mesh=>!mesh.userData.fx);
  assert.equal(owners.size,physical.length,'Assembly inventory does not cover every canonical physical mesh exactly once');
  for(const mesh of physical)assert.ok(owners.has(mesh),`Unowned source mesh ${mesh.name||mesh.userData.part||mesh.uuid}`);
  const count=id=>units.filter(unit=>unit.catalogId===id).length;
  assert.equal(coverage.catalogueTypes,CATALOG.length,'Coverage uses a stale catalogue type count');
  assert.equal(coverage.coveredTypes,CATALOG.length,'Not every catalogue type has an assembly representation');
  assert.deepEqual(coverage.missingTypes,[],'Missing catalogue types must be resolved or explicitly removed from the active assembly scope');
  assert.equal(coverage.occurrences,units.length,'Audit occurrence count does not match physical units');
  assert.equal(coverage.totalMeshes,physical.length,'Audit physical-mesh total is stale');
  assert.equal(coverage.assignedMeshes,owners.size,'Audit mesh ownership total is stale');
  for(const entry of CATALOG){
    const documented=Number(String(entry.quantity).match(/^\d+/)?.[0]);
    if(documented>0)assert.equal(count(entry.id),documented,`${entry.id}: physical instances disagree with the catalogue quantity`);
  }
  for(const id of catalogIds){
    assert.ok(count(id)>0,`${id}: no physical unit or explicit unresolved record`);
    assert.equal(coverage.byCatalog[id]?.instances,count(id),`${id}: coverage instances disagree with inventory`);
    assert.equal(coverage.byCatalog[id]?.meshCount,units.filter(unit=>unit.catalogId===id).reduce((sum,unit)=>sum+unit.meshes.length,0),`${id}: coverage mesh count disagrees with inventory`);
  }
  for(const [id,expected] of [
    ['piston',4],['piston-pin',4],['connecting-rod',4],['connecting-rod-cap',4],
    ['ring-top',4],['ring-second',4],['ring-oil',4],['bearing-main',10],
    ['bearing-rod',8],['washer-thrust',2],['valve-inlet',8],['valve-exhaust',8],
    ['retainer-valve',16],['keepers-valve',32],['screw-valve-lash',16],
    ['guide-valve',8],['guide-valve-exhaust',8],['seal-valve-stem',8],['seal-valve-stem-exhaust',8],
    ['main-bearing-cap',5],['camshaft-holder',5],['seat-valve-spring',16],['nut-valve-lash',16],
  ])assert.equal(count(id),expected,`${id}: physical installation count disagrees with documented catalogue quantity`);

  // Snapshot only after inventory augmentation: the runtime may clone the source
  // but may not reparent, animate, ghost, or dispose that canonical engine.
  engine.root.updateMatrixWorld(true);
  const sourceNodes=[];engine.root.traverse(node=>sourceNodes.push(node));
  const originalParents=new Map(sourceNodes.map(node=>[node,node.parent]));
  const originalPose=matrixSnapshot(engine.root);
  const sourceGeometries=new Set(physical.map(mesh=>mesh.geometry));
  const sourceMaterials=new Set(physical.flatMap(materialsOf));
  const originalMaterialProperties=new Map([...sourceMaterials].map(material=>[material,{
    opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,
    color:material.color?.getHex(),
  }]));
  const disposedGeometry=new Set(),disposedMaterial=new Set();
  sourceGeometries.forEach(geometry=>geometry.addEventListener('dispose',()=>disposedGeometry.add(geometry)));
  sourceMaterials.forEach(material=>material.addEventListener('dispose',()=>disposedMaterial.add(material)));
  const sequence=buildAssemblySequence(inventory);
  runtime=createAssemblyRuntime({inventory});
  assert.ok(runtime.root?.isObject3D,'Missing assembly scene');
  assert.deepEqual(runtime.root.scale.toArray(),[.001,.001,.001],'Assembly viewer must convert mm to m exactly once');
  assert.equal(runtime.inventory,inventory,'Runtime replaced the audited inventory');
  assert.ok(Number.isFinite(runtime.totalDuration)&&runtime.totalDuration>0,'Invalid assembly duration');
  assert.ok(runtime.steps.length>=units.length,'Each installable unit needs a selectable step');
  assert.equal(runtime.chapters.length,10,'Assembly has ten educational chapters');
  const steps=runtime.steps;
  const sequenceSteps=Array.isArray(sequence)?sequence:sequence.steps;
  assert.deepEqual(steps.map(step=>step.id),sequenceSteps.map(step=>step.id),'Runtime and standalone sequence disagree');
  const coveredUnits=[];
  for(const [index,step] of steps.entries()){
    assert.ok(step.id&&step.label?.es&&step.label?.en,`Step ${index}: missing localized identity`);
    assert.ok(step.description?.es&&step.description?.en,`Step ${step.id}: missing bilingual explanation`);
    assert.ok(Number.isFinite(step.start)&&Number.isFinite(step.end)&&step.end>step.start,`Step ${step.id}: invalid time interval`);
    assert.ok(step.start>=0&&step.end<=runtime.totalDuration+1e-8,`Step ${step.id}: outside timeline`);
    if(index)assert.ok(step.start>=steps[index-1].end-1e-8,`Step ${step.id}: overlapping timeline`);
    assert.ok(Array.isArray(step.unitIds),`Step ${step.id}: unit mapping absent`);
    for(const id of step.unitIds)assert.ok(unitById.has(id),`Step ${step.id}: missing unit ${id}`);
    if(step.type==='unit')coveredUnits.push(...step.unitIds);
    assert.ok(runtime.findStep(step.id)>=0,`Step ${step.id}: cannot resolve stable deep link`);
    const value=runtime.progressForStep(index);
    assert.ok(value>=0&&value<=1,`Step ${step.id}: invalid seek progress`);
  }
  assert.equal(new Set(steps.map(step=>step.id)).size,steps.length,'Duplicate step ids would make shared links ambiguous');
  assert.equal(new Set(coveredUnits).size,units.length,'Some physical units have no installation step');
  assert.equal(coveredUnits.length,units.length,'Some physical units install more than once');
  assert.equal(steps.filter(step=>step.id==='head-join'&&step.type==='group').length,1,'The head-to-block join must be a distinct group step');
  assert.equal(steps.filter(step=>step.type==='group'&&/^kit-insert:piston-[1-4]$/.test(step.id)).length,4,'Each piston kit needs its own insertion step');
  for(const unit of units)assert.ok(runtime.findStep(unit.id)>=0,`${unit.id}: physical-unit deep link unresolved`);
  assert.equal(runtime.findStep('not-an-engine-component'),-1,'Unknown deep link must not select another physical unit');

  // Physical access: the crank enters open upper supports, and each rod enters
  // its bore with the big-end cap removed. Caps close afterward; these checks
  // express assembly dependencies rather than mirroring the sort algorithm.
  const stepFor=id=>steps[runtime.findStep(id)];
  const crankStep=stepFor('crankshaft:1'),bridgeStep=stepFor('bridge-main-bearing:1');
  for(let number=1;number<=5;number++){
    const upper=stepFor(`bearing-main:${number*2-1}`),lower=stepFor(`bearing-main:${number*2}`);
    const cap=stepFor(`main-bearing-cap:${number}`),join=stepFor(`cap-insert:main-cap-${number}`);
    assert.ok(upper.end<=crankStep.start,'Upper main bearing must be in the open support before the crank');
    assert.ok(lower.start>=crankStep.end&&cap.start>=crankStep.end,'Lower bearing/cap closes before the crank can enter');
    assert.deepEqual(new Set(join.unitIds),new Set([lower.id,cap.id]),'Main cap insertion lost its own lower shell');
    assert.ok(join.start>=Math.max(lower.end,cap.end)&&join.end<=bridgeStep.start,'Main cap must seat after its components and before the bridge');
  }
  for(let number=1;number<=4;number++){
    const kit=stepFor(`kit-insert:piston-${number}`),capJoin=stepFor(`cap-insert:rod-cap-${number}`);
    const lower=stepFor(`bearing-rod:${number*2}`),cap=stepFor(`connecting-rod-cap:${number}`);
    for(const id of kit.unitIds){
      const unit=unitById.get(id);
      assert.ok(!['connecting-rod-cap','bolt-connecting-rod'].includes(unit.catalogId),'Piston enters the cylinder with a closed big end');
      assert.notEqual(id,lower.id,'Lower rod shell enters with the piston before its separate cap');
    }
    assert.ok(kit.unitIds.includes(`connecting-rod:${number}`)&&kit.unitIds.includes(`piston:${number}`),'Piston insertion omits its piston or rod');
    assert.ok(cap.start>=kit.end&&lower.start>=kit.end&&capJoin.start>=Math.max(cap.end,lower.end),'Rod cap must be built and inserted after the open rod reaches the crankpin');
    assert.deepEqual(new Set(capJoin.unitIds),new Set([cap.id,lower.id]),'Rod cap insertion lost its own lower shell');
    for(const boltIndex of [number*2-1,number*2])assert.ok(stepFor(`bolt-connecting-rod:${boltIndex}`).start>=capJoin.end,'Rod fastener appears before the cap is in place');
  }
  const headJoin=stepFor('head-join');
  assert.ok(stepFor('gasket-cylinder-head:1').end<=headJoin.start,'Head reaches the block before its gasket');
  for(const id of headJoin.unitIds)assert.ok(stepFor(id).end<=headJoin.start,`Head join contains not-yet-assembled unit ${id}`);

  const trayUnit=unitById.get('block-cylinders:1');
  const trayState=runtime.setProgress(0,{interior:false,selectedId:trayUnit.id});
  const trayOffset=runtime.snapshot().unitStates.find(unit=>unit.id===trayUnit.id).offset;
  const trayBounds=new THREE.Box3();
  trayUnit.meshes.forEach((mesh,index)=>{
    const local=mesh.geometry.boundingBox?.clone()||new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position'));
    trayBounds.union(local.applyMatrix4(trayUnit.restMatrices[index]));
  });
  closeArray(trayState.focus.target,trayBounds.getCenter(new THREE.Vector3()).add(new THREE.Vector3(...trayOffset)).toArray(),'Selecting a visible tray part focuses its empty installed socket instead of its current position');

  const start=runtime.setProgress(0,{interior:false});
  assert.equal(start.complete,false,'A fresh assembly is already complete');
  assert.equal(start.installedCount,0,'A fresh assembly silently starts with installed pieces');
  assert.equal(start.totalCount,units.length,'Timeline count is not the audited physical-unit count');
  let previousInstalled=0;
  for(const [index,step] of steps.entries()){
    const state=runtime.setProgress(runtime.progressForStep(index),{interior:false});
    const snapshot=runtime.snapshot(),installed=new Set(snapshot.unitStates.filter(unit=>unit.installed).map(unit=>unit.id));
    assert.equal(state.installedCount,installed.size,`${step.id}: progress count disagrees with actual installed units`);
    assert.ok(state.installedCount>=previousInstalled,`${step.id}: forward assembly removes an installed unit`);
    for(const id of step.unitIds)assert.ok(installed.has(id),`${step.id}: selecting a step does not finish installing ${id}`);
    previousInstalled=state.installedCount;
  }
  const representative=new Set([0,.001,.125,.3,.5,.731,.999,1]);
  for(const chapter of runtime.chapters){
    const chapterStep=steps.findIndex(step=>step.chapter===(chapter.id??chapter.chapter));
    if(chapterStep>=0)representative.add(runtime.progressForStep(chapterStep));
  }
  let poses=0;
  function seek(progress,interior=false){
    const state=runtime.setProgress(progress,{interior});runtime.root.updateMatrixWorld(true);
    assert.equal(state.totalCount,units.length,'Count changes while scrubbing');
    assert.ok(state.installedCount>=0&&state.installedCount<=units.length,'Invalid installed-unit count');
    assertFinite(state.focus.target,'Non-finite camera target');
    assert.ok(Number.isFinite(state.focus.distance)&&state.focus.distance>0,'Non-finite camera distance');
    for(const mesh of meshesOf(runtime.root)){
      assertFinite(mesh.matrixWorld.elements,`Invalid world matrix at ${progress}`);
      if(mesh.isInstancedMesh)assertFinite(mesh.instanceMatrix.array,`Invalid belt instance matrix at ${progress}`);
    }
    const stateSnapshot=runtime.snapshot();
    assert.ok(Array.isArray(stateSnapshot.unitStates),'Snapshot has no unit-state registry');
    assert.equal(stateSnapshot.unitStates.length,units.length,'Snapshot loses physical units');
    poses++;
    return matrixSnapshot(runtime.root);
  }
  for(const progress of representative){
    const direct=seek(progress);
    seek(1-progress);seek(.917);
    assert.deepEqual(seek(progress),direct,`Seeking to ${progress} depends on previous timeline history`);
  }
  // Both disclosure states must reset deterministically; opacity belongs to
  // private clones, never to the original materials reused by Anatomy.
  const interior=seek(.6,true);seek(.1,false);
  assert.deepEqual(seek(.6,true),interior,'Interior cutaway state depends on history');
  const end=runtime.setProgress(1,{interior:false});runtime.root.updateMatrixWorld(true);
  assert.equal(end.complete,true,'Timeline cannot complete');
  assert.equal(end.installedCount,units.length,'The final engine is missing installed pieces');
  const selected=inventory.units.find(unit=>unit.catalogId==='keepers-valve');
  const selectedState=runtime.setProgress(1,{interior:false,selectedId:selected.id});
  const selectedBounds=new THREE.Box3();
  selected.meshes.forEach((mesh,index)=>{
    const local=mesh.geometry.boundingBox?.clone()||new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position'));
    selectedBounds.union(local.applyMatrix4(selected.restMatrices[index]));
  });
  closeArray(selectedState.focus.target,selectedBounds.getCenter(new THREE.Vector3()).toArray(),'Selecting a final installed small part does not focus its canonical location');
  assert.ok(selectedState.focus.distance<end.focus.distance,'Selected small-part focus uses the full-engine framing');
  runtime.setProgress(1,{interior:false});runtime.root.updateMatrixWorld(true);
  const finalSnapshot=runtime.snapshot();
  for(const state of finalSnapshot.unitStates)assert.equal(state.installed,true,`${state.id}: not installed at completion`);
  const sourceByUuid=new Map(physical.map(mesh=>[mesh.uuid,mesh]));
  const finalClones=meshesOf(runtime.root).filter(mesh=>sourceByUuid.has(mesh.userData.sourceUuid));
  assert.equal(finalClones.length,physical.length,'Final model lost or duplicated canonical physical meshes');
  assert.equal(new Set(finalClones.map(mesh=>mesh.userData.sourceUuid)).size,physical.length,'Source mesh appears more than once');
  const scale=new THREE.Matrix4().makeScale(.001,.001,.001);
  for(const clone of finalClones){
    const source=sourceByUuid.get(clone.userData.sourceUuid);
    const unit=unitById.get(owners.get(source));
    const index=unit.meshes.indexOf(source);
    assert.equal(clone.geometry,source.geometry,`${unit.id}: final geometry is not the canonical shared geometry`);
    assert.equal(materialsOf(clone).length,materialsOf(source).length,`${unit.id}: final material count changed`);
    materialsOf(clone).forEach((material,index)=>assert.equal(material,materialsOf(source)[index],`${unit.id}: final material is not the canonical shared surface`));
    const expected=new THREE.Matrix4().multiplyMatrices(scale,unit.restMatrices[index]);
    closeArray(clone.matrixWorld.elements,expected.elements,`${unit.id}: final installed pose differs from canonical engine`);
    if(source.isInstancedMesh){
      assert.ok(clone.isInstancedMesh,`${unit.id}: lost native belt instances`);
      assert.equal(clone.count,source.count,`${unit.id}: native instance count changed`);
      closeArray(clone.instanceMatrix.array,source.instanceMatrix.array,`${unit.id}: final instance poses differ`);
    }
  }
  assert.deepEqual(matrixSnapshot(engine.root),originalPose,'Timeline modified the source engine pose or visibility');
  for(const node of sourceNodes)assert.equal(node.parent,originalParents.get(node),'Timeline reparented canonical source geometry');
  for(const [material,before] of originalMaterialProperties)assert.deepEqual({
    opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,color:material.color?.getHex(),
  },before,'Interior mode modified a shared canonical surface');
  runtime.dispose();runtime.dispose();
  assert.equal(disposedGeometry.size,0,'Assembly disposal invalidates shared canonical geometry');
  assert.equal(disposedMaterial.size,0,'Assembly disposal invalidates shared canonical materials');
  assert.deepEqual(matrixSnapshot(engine.root),originalPose,'Disposal damaged the canonical source model');
  console.log(`Assembly checks passed: ${CATALOG.length} catalogue types; ${units.length} physical units; ${physical.length} exclusively owned meshes; ${steps.length} selectable steps; ${poses} finite deterministic poses; 10 chapters; documented repetition counts; canonical final pose; shared-resource safety.`);
}finally{
  runtime?.dispose();
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  await rm(scratch,{recursive:true,force:true});
}
