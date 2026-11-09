import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Retain each selectable/explodable part boundary, but submit its fixed fasteners
// and casting details together. Moving groups and meshes owned by update() are
// deliberately excluded. This keeps the finer geometry practical on laptop GPUs.
export function consolidateStatic(G) {
  const fixed = ['block','head','headGasket','valveCover','oilCap','timingCoverUpper','timingCoverLower',
    'engineMount','oilPan','bearingBridge','exhaustManifold','heatShield','plenum','runners','throttleBody',
    'intakeDuct','fuelRail','injectors','plugLeads','psHose','thermostat','coolantOutlet','oilFilter','oilStrainer',
    'oilPump','distributor','psPump'];
  for (const id of fixed) {
    const group=G[id], batches=new Map();
    for (const mesh of group.children) {
      if (!mesh.isMesh || mesh.children.length || mesh.userData.fx || Array.isArray(mesh.material)) continue;
      const list=batches.get(mesh.material)||[];list.push(mesh);batches.set(mesh.material,list);
    }
    for (const [material,meshes] of batches) {
      if (meshes.length<2) continue;
      const geometries=meshes.map(mesh=>{
        mesh.updateMatrix();
        const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
        if(!geo.attributes.normal)geo.computeVertexNormals();
        if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
        // These materials use position, normal and uv only.
        for(const key of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(key))geo.deleteAttribute(key);
        return geo.applyMatrix4(mesh.matrix);
      });
      const geometry=mergeGeometries(geometries,false);
      geometries.forEach(g=>g.dispose());
      if(!geometry)throw new Error(`Cannot consolidate geometry for ${id}`);
      const combined=new THREE.Mesh(geometry,material);
      combined.userData.part=id;combined.castShadow=true;combined.receiveShadow=true;
      meshes.forEach(mesh=>group.remove(mesh));group.add(combined);
    }
  }
}
