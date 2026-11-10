/** Individual real meshes from the engine explorer, with their original PBR materials.
 * This is an isolation adapter, not a second geometric reconstruction. The private
 * source engine stays intact; every returned mesh shares its geometry/material.
 * Units are millimetres and Y is up, exactly as in engine.js before stage scaling.
 */
import * as THREE from 'three';
import {buildEngine} from '../engine.js';
import {buildAssemblyInventory} from '../assembly/inventory.js';

let sharedEngine;
const inventories=new WeakMap();
export function getEngineSource() {
  if (!sharedEngine) {
    sharedEngine = buildEngine({consolidate:false,detailedRegistry:true});
    sharedEngine.root.scale.setScalar(1);
    sharedEngine.update(0,{dt:0,iab:0,charge:false});
    sharedEngine.root.updateMatrixWorld(true);
  }
  return sharedEngine;
}

function select(entry,engine) {
  if(!engine.detailedRegistry)return [];
  // One occurrence from the same exclusive ownership table as the assembly
  // presentation. Parent castings do not duplicate their removable children.
  let inventory=inventories.get(engine);
  if(!inventory){inventory=buildAssemblyInventory({engine});inventories.set(engine,inventory);}
  return inventory.units.find(unit=>unit.catalogId===entry.id)?.meshes||[];
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
    engine.update(cycle*720,{dt:0,iab:opening,charge:false,demonstrationId:entry.id,demonstrationPhase:cycle});
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
