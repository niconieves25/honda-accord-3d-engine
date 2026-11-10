import * as THREE from 'three';
import {buildAssemblyInventory} from './inventory.js';
import {buildAssemblySequence} from './sequence.js';

// This presentation clones frozen world-space meshes. It never reparents or
// changes the source engine and never runs cyclic operating kinematics.
const clamp=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t);};
const V=THREE.Vector3;
const ZERO=new V();
const HEAD_STATION=new V(740,140,0);
const PISTON_STATION=new V(-580,280,0);
const CAP_STATION=new V(-380,-140,0);
const SHELL_TYPES=new Set(['block-cylinders','cylinder-head','cover-valves','pan-oil','cover-timing-upper','cover-timing-lower','plenum-intake','iab-body','shield-exhaust']);

function cloneMesh(source,rest,unitId,index) {
  const material=source.userData.mat0 || source.material;
  const clone=source.isInstancedMesh
    ?new THREE.InstancedMesh(source.geometry,material,source.count)
    :new THREE.Mesh(source.geometry,material);
  clone.name=`assembly:${unitId}:${index+1}`;
  clone.userData={...source.userData,assemblyUnitId:unitId,sourceUuid:source.uuid,assemblySourceUuid:source.uuid};
  clone.matrixAutoUpdate=false;
  clone.matrix.copy(rest);
  clone.castShadow=source.castShadow;clone.receiveShadow=source.receiveShadow;
  clone.renderOrder=source.renderOrder;
  clone.frustumCulled=source.frustumCulled;
  if(source.isInstancedMesh){
    clone.instanceMatrix.copy(source.instanceMatrix);
    clone.instanceColor=source.instanceColor?.clone()||null;
    clone.boundingBox=source.boundingBox?.clone()||null;
    clone.boundingSphere=source.boundingSphere?.clone()||null;
  }
  return clone;
}

function approachFor(unit) {
  const id=unit.catalogId;
  if(id==='block-cylinders')return new V(0,350,0);
  if(unit.chapter==='timing' || /timing|belt-balance|tensioner-balance/.test(id))return new V(0,70,300);
  if(unit.chapter==='intake')return new V(280,80,0);
  if(/flywheel|clutch/.test(id))return new V(0,70,-300);
  if(/exhaust|shield/.test(id))return new V(-280,70,0);
  if(/pan-oil|strainer|crankshaft|bearing-main|bearing-rod|bridge-main|shaft-balance|bolt-connecting-rod/.test(id))return new V(0,-260,0);
  return new V(0,260,0);
}

function placementOffset(t,tray,approach) {
  if(t>=1)return new V();
  if(t<=0)return tray.clone();
  // Arrival, alignment and seating are separate visual beats. The path is
  // explanatory: it makes no claim of tool clearance or material deformation.
  const aligned=approach.clone().multiplyScalar(.14);
  if(t<.46)return tray.clone().lerp(approach,ease(t/.46));
  if(t<.79)return approach.clone().lerp(aligned,ease((t-.46)/.33));
  return aligned.lerp(ZERO,ease((t-.79)/.21));
}

const groupAlignment=groupId=>new V(0,groupId==='head'?290:/^(main|rod)-cap-/.test(groupId)?-180:410,0);
function groupOffset(groupId,t) {
  if(t>=1)return new V();
  const station=groupId==='head'?HEAD_STATION:/^(main|rod)-cap-/.test(groupId)?CAP_STATION:PISTON_STATION;
  const aligned=groupAlignment(groupId);
  if(t<=.58)return station.clone().lerp(aligned,ease(t/.58));
  return aligned.lerp(ZERO,ease((t-.58)/.42));
}

export function createAssemblyRuntime({inventory=buildAssemblyInventory()}={}) {
  const timeline=buildAssemblySequence(inventory);
  const {steps,chapters,totalDuration,findStep,progressForStep}=timeline;
  const root=new THREE.Group();root.name='F22A6 assembly presentation';root.scale.setScalar(.001);
  const unitGroups=new Map(),records=new Map(),ghostMaterials=new Map(),ownedMaterials=new Set(),ownedGeometries=new Set();
  const ownedSources=new Set();
  const wholeBounds=new THREE.Box3();
  const unitSteps=new Map(steps.filter(s=>s.type==='unit').map(s=>[s.unitIds[0],s]));
  const groupSteps=new Map(steps.filter(s=>s.type==='group').map(s=>[s.groupId,s]));
  const unitsById=new Map(inventory.units.map(unit=>[unit.id,unit]));
  const chapterUnits=new Map(chapters.map(chapter=>[chapter.id,steps.filter(step=>step.type==='unit'&&step.chapter===chapter.id).map(step=>unitsById.get(step.unitIds[0]))]));
  const stageSlots=new Map([...chapterUnits.values()].flatMap(list=>list.map((unit,index)=>[unit.id,index%4])));
  let disposed=false,lastState=null;
  for(const unit of inventory.units){
    if(unit.meshes.length!==unit.restMatrices.length)throw new Error(`Missing rest matrix for ${unit.id}`);
    unit.meshes.forEach((mesh,index)=>{
      if(ownedSources.has(mesh))throw new Error(`A physical mesh has more than one assembly owner: ${unit.id}`);
      if(!mesh.isMesh || !unit.restMatrices[index]?.elements.every(Number.isFinite))throw new Error(`Invalid physical assembly geometry: ${unit.id}`);
      ownedSources.add(mesh);
    });
    const group=new THREE.Group();group.name=unit.id;group.userData.assemblyUnitId=unit.id;group.userData.catalogId=unit.catalogId;
    group.userData.assemblyEvidence=unit.evidence;
    const meshes=unit.meshes.map((source,index)=>cloneMesh(source,unit.restMatrices[index],unit.id,index));
    group.add(...meshes);root.add(group);unitGroups.set(unit.id,group);
    group.updateMatrixWorld(true);
    // Bounds are in millimetres here; the public root alone converts to metres.
    const box=new THREE.Box3();
    for(const mesh of meshes){
      if(mesh.isInstancedMesh){
        if(!mesh.boundingBox)mesh.computeBoundingBox();
        if(mesh.boundingBox)box.union(mesh.boundingBox.clone().applyMatrix4(mesh.matrix));
      }else{
        const local=mesh.geometry.boundingBox?.clone() || new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position'));
        box.union(local.applyMatrix4(mesh.matrix));
      }
    }
    if(box.isEmpty())box.set(new V(-1,-1,-1),new V(1,1,1));
    wholeBounds.union(box);
    records.set(unit.id,{unit,group,meshes,placementGroupId:unitSteps.get(unit.id)?.placementGroupId||null,materials:meshes.map(mesh=>mesh.material),bounds:box,center:box.getCenter(new V()),size:box.getSize(new V()),state:null});
  }
  if(wholeBounds.isEmpty())wholeBounds.set(new V(-250,-100,-250),new V(250,550,250));
  const fullCenter=wholeBounds.getCenter(new V()),fullSize=wholeBounds.getSize(new V());
  const wholeDistance=Math.max(.85,Math.max(fullSize.x,fullSize.y,fullSize.z)*.001*1.75);
  const trayGeometry=new THREE.BufferGeometry().setFromPoints([
    new V(-.5,0,-.5),new V(.5,0,-.5),new V(.5,0,-.5),new V(.5,0,.5),
    new V(.5,0,.5),new V(-.5,0,.5),new V(-.5,0,.5),new V(-.5,0,-.5),
    ...[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].flatMap(([x,z])=>[new V(x,0,z),new V(x,-8,z)]),
  ]);
  ownedGeometries.add(trayGeometry);
  const trayMaterial=new THREE.LineBasicMaterial({color:0xb82b42,transparent:true,opacity:.55,depthWrite:false});
  ownedMaterials.add(trayMaterial);
  const trays=Array.from({length:4},(_,index)=>{
    const tray=new THREE.LineSegments(trayGeometry,trayMaterial);tray.name=`assembly staging tray ${index+1}`;
    tray.userData={fx:true,assemblyPresentation:true};tray.raycast=()=>{};root.add(tray);return tray;
  });
  const highlight=new THREE.Box3Helper(new THREE.Box3(),0xff4056);
  highlight.name='assembly active unit outline';highlight.userData={fx:true,assemblyPresentation:true};
  highlight.material.depthTest=false;highlight.material.depthWrite=false;highlight.renderOrder=100;
  highlight.raycast=()=>{};ownedMaterials.add(highlight.material);ownedGeometries.add(highlight.geometry);root.add(highlight);
  function ghost(original) {
    if(Array.isArray(original))return original.map(ghost);
    if(!ghostMaterials.has(original)){
      const material=original.clone();material.transparent=true;material.opacity=.12;material.depthWrite=false;
      material.name=`assembly interior:${original.name||original.type}`;
      ghostMaterials.set(original,material);ownedMaterials.add(material);
    }
    return ghostMaterials.get(original);
  }
  // A normalized seek can round a few ulps below its selected step's end.
  const fraction=(step,time)=>!step||time<step.start-1e-8?0:time>=step.end-1e-8?1:clamp((time-step.start)/step.duration);
  function setProgress(value,{interior=true,selectedId=null}={}) {
    if(disposed)return lastState;
    const progress=clamp(value),time=progress*totalDuration;
    let index=steps.findIndex(step=>time<=step.end+1e-9);
    if(index<0)index=Math.max(0,steps.length-1);
    const step=steps[index]||null,chapter=chapters.find(item=>item.id===step?.chapter)||chapters[0]||null;
    const chapterPending=(chapterUnits.get(chapter?.id)||[]).filter(unit=>fraction(unitSteps.get(unit.id),time)<1);
    // Keep the staging area legible: the next four pending physical units from
    // this chapter are visible, never parts from a future chapter.
    const trayUnits=[];
    for(const unit of chapterPending.slice(0,4)){
      const size=records.get(unit.id).size,large=Math.max(size.x,size.z)>235;
      if(large&&trayUnits.length)break;
      trayUnits.push(unit);if(large)break;
    }
    const trayIds=new Set(trayUnits.map(unit=>unit.id));
    trays.forEach(tray=>{tray.visible=false;});
    let installedCount=0;
    for(const record of records.values()){
      const {unit,group}=record,unitStep=unitSteps.get(unit.id),unitProgress=fraction(unitStep,time);
      const installed=unitProgress>=1;
      if(installed)installedCount++;
      const isCurrent=step?.type==='unit'&&step.unitIds[0]===unit.id;
      const staging=trayIds.has(unit.id);
      const visible=installed||isCurrent||staging;
      const placementGroupId=record.placementGroupId;
      const hasGroup=placementGroupId&&groupSteps.has(placementGroupId);
      const groupProgress=hasGroup?fraction(groupSteps.get(placementGroupId),time):1;
      const base=hasGroup?groupOffset(placementGroupId,groupProgress):new V();
      const slot=stageSlots.get(unit.id)||0;
      const trayPosition=new V(wholeBounds.min.x-260-(slot%2)*190,fullCenter.y+110-Math.floor(slot/2)*190,fullCenter.z+70);
      const tray=trayPosition.sub(record.center).sub(base);
      if(staging){
        const frame=trays[slot],center=record.center.clone().add(base).add(tray);
        frame.position.set(center.x,center.y-record.size.y/2-8,center.z);
        frame.scale.set(Math.max(110,record.size.x+24),1,Math.max(110,record.size.z+24));frame.visible=true;
      }
      const offset=placementOffset(unitProgress,tray,approachFor(unit)).add(base);
      group.position.copy(offset);group.rotation.set(0,0,0);group.scale.setScalar(1);group.visible=visible;
      const selected=selectedId===unit.id||selectedId===unit.catalogId;
      const current=step?.unitIds.includes(unit.id);
      const showInterior=interior&&SHELL_TYPES.has(unit.catalogId)&&installed&&!selected&&!current;
      record.meshes.forEach((mesh,i)=>{mesh.material=showInterior?ghost(record.materials[i]):record.materials[i];mesh.userData.assemblySelected=selected;});
      record.state={id:unit.id,installed,progress:unitProgress,visible,offset:offset.toArray()};
    }
    const highlighted=records.get(selectedId)||records.get(step?.type==='unit'?step.unitIds[0]:null);
    if(highlighted?.group.visible){
      highlight.box.copy(highlighted.bounds).translate(highlighted.group.position).expandByScalar(5);highlight.visible=true;
    }else if(step?.type==='group'){
      highlight.box.makeEmpty();
      for(const id of step.unitIds){const record=records.get(id);if(record?.group.visible)highlight.box.union(record.bounds.clone().translate(record.group.position));}
      highlight.box.expandByScalar(5);highlight.visible=!highlight.box.isEmpty();
    }else highlight.visible=false;
    root.updateMatrixWorld(true);
    let focus={target:fullCenter.toArray(),distance:wholeDistance};
    const selectedRecord=records.get(selectedId);
    const focusRecords=selectedRecord?[selectedRecord]:step?.unitIds.map(id=>records.get(id)).filter(Boolean)||[];
    if((progress<1||selectedRecord)&&focusRecords.length){
      const box=new THREE.Box3();
      const framingGroup=step?.type==='group'&&!selectedRecord;
      for(const record of focusRecords){
        const sub=record.placementGroupId;
        const base=selectedRecord?record.group.position.clone():sub&&groupSteps.has(sub)?groupOffset(sub,fraction(groupSteps.get(sub),time)):new V();
        box.union(record.bounds.clone().translate(base));
        if(framingGroup){
          // The UI frames once per step. Cover the whole insertion route rather
          // than leaving a completed head outside the camera as it joins.
          box.union(record.bounds);
          box.union(record.bounds.clone().translate(groupOffset(step.groupId,0)));
          box.union(record.bounds.clone().translate(groupAlignment(step.groupId)));
        }
      }
      if(framingGroup)box.union(wholeBounds);
      if(index===0&&!selectedRecord){
        const first=focusRecords[0];
        box.union(first.bounds.clone().translate(first.group.position));
      }
      const size=box.getSize(new V());
      focus={target:box.getCenter(new V()).toArray(),distance:Math.max(framingGroup ? .58 : .08,Math.max(size.x,size.y,size.z)*.001*2.05)};
    }
    // A directly selected, completed join no longer needs the empty staging
    // route in its frame. Playback still frames that route when the step starts.
    if(step?.type==='group'&&fraction(step,time)>=1&&!selectedRecord)focus={target:fullCenter.toArray(),distance:wholeDistance};
    lastState={step,index,chapter,progress,stepProgress:step?fraction(step,time):1,time,complete:progress===1,
      focus,installedCount,totalCount:inventory.units.length,interior,selectedId,stagedCount:trayUnits.length};
    return lastState;
  }
  function snapshot(){
    return {...lastState,unitStates:[...records.values()].map(record=>({...record.state,offset:[...record.state.offset]}))};
  }
  function dispose(){
    if(disposed)return;disposed=true;
    root.removeFromParent();root.clear();
    for(const material of ownedMaterials)material.dispose();
    for(const geometry of ownedGeometries)geometry.dispose();
    ownedMaterials.clear();ownedGeometries.clear();ghostMaterials.clear();unitGroups.clear();records.clear();
  }
  setProgress(0);
  return {root,inventory,steps,chapters,totalDuration,unitGroups,setProgress,snapshot,findStep,progressForStep,dispose};
}
