/** Individual real meshes from the engine explorer, with their original PBR materials.
 * This is an isolation adapter, not a second geometric reconstruction. The private
 * source engine stays intact; every returned mesh shares its geometry/material.
 * Units are millimetres and Y is up, exactly as in engine.js before stage scaling.
 */
import * as THREE from 'three';
import {buildEngine} from '../engine.js';

let sharedEngine;
export function getEngineSource() {
  if (!sharedEngine) {
    sharedEngine = buildEngine({consolidate:false,detailedRegistry:true});
    sharedEngine.root.scale.setScalar(1);
    sharedEngine.update(0,{dt:0,iab:0,charge:false});
    sharedEngine.root.updateMatrixWorld(true);
  }
  return sharedEngine;
}

const GROUPS = {
  'cover-valves':'valveCover','cap-oil-filler':'oilCap',
  'cover-timing-upper':'timingCoverUpper','cover-timing-lower':'timingCoverLower',
  'block-cylinders':'block','bridge-main-bearing':'bearingBridge',
  'shaft-balance-front':'balancerFront','shaft-balance-rear':'balancerRear',
  'tensioner-balance':'balancerAdjuster','cylinder-head':'head',
  'gasket-cylinder-head':'headGasket','camshaft':'camshaft',
  'belt-timing':'timingBelt','pulley-camshaft':'camPulley',
  'pulley-crank-timing':'crankTimingPulley','tensioner-timing':'timingTensioner',
  'duct-intake':'intakeDuct','plenum-intake':'plenum',
  'manifold-exhaust':'exhaustManifold','shield-exhaust':'heatShield',
  'pan-oil':'oilPan','strainer-oil':'oilStrainer','filter-oil':'oilFilter',
  'outlet-coolant':'coolantOutlet','alternator':'alternator','coil-ignition':'ignitionCoil',
  'iab-body':'iabBody','iab-shaft':'iabShaft','iab-actuator':'iabActuator',
  'iab-vacuum-chamber':'iabVacuumTank',
  'flywheel':'flywheel','clutch-disc':'clutchDisc','clutch-pressure-plate':'clutchPressurePlate',
};
const TAGS = new Set([
  'ring-top','ring-second','ring-oil','connecting-rod-cap','bearing-rod',
  'bearing-main','bolt-connecting-rod','valve-inlet','valve-exhaust',
  'spring-valve-inlet','spring-valve-exhaust','retainer-valve','keepers-valve',
  'guide-valve','seal-valve-stem','screw-valve-lash',
  'gasket-valve-cover','seal-plug-tube','nut-valve-cover','washer-valve-cover',
  'runner-intake','seal-injector','rail-fuel','housing-distributor',
  'cap-distributor','lead-spark-plug','shaft-inlet-rockers-a','shaft-inlet-rockers-b','shaft-exhaust-rockers','belt-power-steering',
  'rocker-inlet-a','rocker-inlet-b','rocker-exhaust','spring-rocker-a','spring-rocker-b','washer-rocker-wave',
  'iab-butterfly','gasket-iab',
]);

function tagged(engine,id) {
  const matches=[];
  engine.root.traverse(m=>{if(m.isMesh&&m.userData.catalogPiece===id) matches.push(m);});
  if (!matches.length) return [];
  // All meshes belonging to one physical occurrence, not every occurrence in the motor.
  const first=matches[0].userData.catalogInstance;
  return matches.filter(m=>m.userData.catalogInstance===first);
}
function meshes(nodes,filter=()=>true) {
  const result=[],seen=new Set();
  for(const node of nodes.filter(Boolean)) node.traverse(m=>{
    if(m.isMesh&&!m.userData.fx&&filter(m)&&!seen.has(m)) {result.push(m);seen.add(m);}
  });
  return result;
}
function select(entry,engine) {
  const {G,detailedRegistry:r}=engine;
  if(!r) return [];
  if(GROUPS[entry.id]) return meshes([G[GROUPS[entry.id]]],m=>entry.id!=='iab-body'||m.userData.catalogPiece!=='gasket-iab');
  if(TAGS.has(entry.id)) return tagged(engine,entry.id);
  const p=r.pistons.find(p=>p.cy.i===0);
  switch(entry.id) {
    case 'crankshaft':return meshes([G.crankshaft,G.crankFlange]);
    case 'piston':return meshes([p.g]);
    case 'piston-pin':return meshes([p.pg]);
    case 'connecting-rod':return meshes([p.rod]);
    case 'rotor-distributor':return meshes([r.distRotor]);
    case 'pulley-power-steering':return meshes([r.psPulley]);
    case 'belt-balance':return meshes([G.balancerBelt],m=>m.isInstancedMesh||m.material===engine.M.rubber);
    case 'spark-plug': {
      const group=G.sparkPlugs.children.find(m=>m.isGroup&&m.children.some(c=>c.isMesh&&!c.userData.fx));
      return meshes([group]);
    }
    // Only shells exist for these pumps, injectors and switching devices in the
    // original engine. Their functional interiors use the explicit PBR fallback.
    default:return [];
  }
}

/** Optional supplied source is useful for independent identity tests. It must be
 * built with {consolidate:false,detailedRegistry:true}, with root scale 1. */
export function buildEnginePart(entry,{engine=getEngineSource()}={}) {
  const sources=select(entry,engine);
  if(!sources.length) return null;
  const root=new THREE.Group();root.name=`engine-part:${entry.id}`;
  root.userData.provenance='engine';root.userData.catalogId=entry.id;
  const content=new THREE.Group();root.add(content);
  const clones=sources.map(source=>{
    const material=source.userData.mat0||source.material;
    const clone=source.isInstancedMesh
      ?new THREE.InstancedMesh(source.geometry,material,source.count)
      :new THREE.Mesh(source.geometry,material);
    clone.name=source.name||`${entry.id}:mesh`;
    clone.userData={sourceUuid:source.uuid,catalogPiece:entry.id};
    clone.castShadow=source.castShadow;clone.receiveShadow=source.receiveShadow;
    clone.renderOrder=source.renderOrder;clone.matrixAutoUpdate=false;
    if(source.isInstancedMesh){
      clone.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      clone.boundingBox=source.boundingBox?.clone()||null;
      clone.boundingSphere=source.boundingSphere?.clone()||null;
    }
    content.add(clone);return clone;
  });
  const fixed=entry.motion?.type==='fixed';
  let disposed=false;
  function pose(phase=0) {
    const cycle=fixed?0:Number.isFinite(phase)?phase:0;
    // IAB is a separate manifold state, not a valve-lift or per-cycle event.
    // In its isolated demonstration the actuator opens and closes once. The
    // ordinary pistons/cam/valves keep the same canonical crank kinematics.
    const demonstratingIab=entry.id.startsWith('iab-');
    const opening=demonstratingIab?(1-Math.cos(cycle*Math.PI*2))/2:0;
    engine.update(cycle*720,{dt:0,iab:opening,charge:false});
    engine.root.updateMatrixWorld(true);
    sources.forEach((source,i)=>{
      const clone=clones[i];clone.matrix.copy(source.matrixWorld);clone.matrixWorldNeedsUpdate=true;
      clone.visible=source.visible;
      if(source.isInstancedMesh){
        clone.instanceMatrix.array.set(source.instanceMatrix.array);
        clone.instanceMatrix.needsUpdate=true;
      }
    });
    root.updateMatrixWorld(true);
  }
  // One permanent centre and bounds for the entire native motion prevent camera
  // recentering from cancelling piston travel, or clipping a belt/tooth at rest.
  const bounds=new THREE.Box3();
  for(const phase of fixed?[0]:[0,.125,.25,.375,.5,.625,.75,.875]) {
    pose(phase);bounds.expandByObject(content);
  }
  const center=bounds.getCenter(new THREE.Vector3());
  content.position.copy(center).negate();bounds.translate(center.clone().negate());
  pose(0);
  return {root,bounds,sources,provenance:'engine',sourceId:entry.parentId,
    update({phase=0}={}){if(!disposed)pose(phase);},
    dispose(){disposed=true;root.clear();},
  };
}
