// Canonical component ownership and supplemental interiors. The existing Anatomy
// recipes are installed here once so the complete engine, atlas and assembly view
// share geometry/material identity. Recipe dimensions and sockets are illustrative.
import * as THREE from 'three';
import {buildAnatomyMesh} from './anatomy/three-adapter.js';
import {COMPONENT_SCENES} from './assembly/component-scenes.js';
import {beltTrack} from './detail-timing.js';

export function detailComponents(c) {
  const {root,G,M,L,CYL,DECK,PULLEY,beltPath,pistons,valves,rockers,crank,flange,
    distRotor,psPulley,crankBal,balFPulley,balInputPulley,balInputGear,balRGear,wpPulley}=c;
  const motions=[];
  const mark=(mesh,id,instance=0)=>{mesh.userData.catalogPiece=id;mesh.userData.catalogInstance=instance;return mesh;};
  const markTree=(node,id,instance=0)=>node?.traverse(m=>{if(m.isMesh&&!m.userData.fx&&!m.userData.catalogPiece)mark(m,id,instance);});
  const approximate={es:'Geometría complementaria y posición de montaje aproximadas; no son medidas ni tolerancias de fabricación.',en:'Supplementary geometry and installed socket are approximate, not manufacturing dimensions or tolerances.'};
  function install(id,{parent,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],instance=0,ratio=0}={}) {
    const recipe=COMPONENT_SCENES[id];
    if(!recipe)throw new Error(`Missing canonical recipe: ${id}`);
    const model=buildAnatomyMesh(recipe,recipe.entry),socket=new THREE.Group();
    socket.name=`socket:${id}:${instance}`;socket.position.set(...position);socket.rotation.set(...rotation);socket.scale.set(...scale);
    socket.add(model.root);(parent||G[recipe.entry.parentId]).add(socket);
    model.root.traverse(mesh=>{if(mesh.isMesh){mark(mesh,id,instance);mesh.userData.part=recipe.entry.parentId;mesh.userData.assemblyApproximate=true;mesh.userData.assemblyNote=approximate;}});
    motions.push({id,model,ratio});
    return {socket,model};
  }

  // Specific ownership wins over a containing assembly. All repeated source
  // objects are tagged, rather than selecting only cylinder one's example.
  for(const p of pistons){markTree(p.g,'piston',p.cy.i);markTree(p.pg,'piston-pin',p.cy.i);markTree(p.rod,'connecting-rod',p.cy.i);}
  markTree(crank,'crankshaft');markTree(flange,'crankshaft');
  markTree(distRotor,'rotor-distributor');markTree(psPulley,'pulley-power-steering');
  for(const vv of valves){
    const i=vv.cy.i*2+(vv.which==='b'?1:0);
    // Exhaust guides/seals already existed as untagged geometry. Their OEM
    // number remains unresolved; do not label them with the inlet reference.
    if(vv.kind==='ex'){
      vv.sp.children.filter(m=>m.isMesh&&!m.userData.catalogPiece).forEach(m=>{
        const h=m.geometry?.parameters?.options?.depth;
        if(h===20)mark(m,'guide-valve-exhaust',i);
        else if(h===5||h===1.2)mark(m,'seal-valve-stem-exhaust',i);
      });
    }
    markTree(vv.g,vv.kind==='in'?'valve-inlet':'valve-exhaust',i);
    // Remaining spring seats are separate physical details of this valve set.
    markTree(vv.sp,'seat-valve-spring',i+(vv.kind==='ex'?8:0));
  }
  for(const set of rockers)for(const key of ['inA','inB','exA','exB']){
    set[key].traverse(m=>{if(m.isMesh&&m.userData.catalogPiece==='nut-valve-lash')m.userData.assemblyLabel={es:'Contratuerca de reglaje',en:'Valve adjustment locknut'};});
  }
  for(const [mesh,id] of [[crankBal,'pulley-balance-crank'],[balFPulley,'pulley-balance-front'],[balInputPulley,'pulley-balance-input'],[balInputGear,'gear-balance-input'],[balRGear,'gear-balance-rear']])markTree(mesh,id);
  const belts=G.accessoryBelts.children.filter(m=>m.isMesh);
  if(belts[0])mark(belts[0],'belt-alternator');
  if(belts[1])mark(belts[1],'belt-power-steering');
  // A travelling seam is a visual motion cue on a smooth belt, not invented teeth.
  if(belts[1]){
    const track=beltTrack(beltPath([[0,0,PULLEY.crank/2],[...L.psp.slice(0,2),PULLEY.powerSteering/2]]));
    const seam=new THREE.Mesh(new THREE.BoxGeometry(8,.65,12),M.darkSteel);seam.userData.part='accessoryBelts';seam.userData.assemblyApproximate=true;
    mark(seam,'belt-power-steering');G.accessoryBelts.add(seam);
    motions.push({seam,track});
  }
  markTree(G.dipstick,'dipstick-oil');
  for(const child of G.injectors.children){
    const z=child.position.z;const i=CYL.reduce((best,cy)=>Math.abs(cy.z-z)<Math.abs(CYL[best].z-z)?cy.i:best,0);
    markTree(child,'injector-fuel',i);
  }
  const regulator=G.fuelRail.children.find(m=>m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop===13);
  if(regulator)mark(regulator,'regulator-fuel');
  markTree(G.iabSolenoid,'iab-solenoid');

  // Butterfly and shaft retain the source throttle casting; only the blade is
  // articulated. The full engine has a fixed demonstration position by default.
  const blade=G.throttleBody.children.find(m=>m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop===28.3);
  if(blade){
    const pivot=new THREE.Group();pivot.position.copy(blade.position);G.throttleBody.add(pivot);blade.position.set(0,0,0);blade.rotation.set(0,0,0);pivot.add(blade);mark(blade,'throttle-butterfly');
    const shaft=G.throttleBody.children.find(m=>m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop===3&&m.geometry.parameters.height===87);
    if(shaft)mark(shaft,'throttle-butterfly');
    motions.push({blade:pivot});
  }

  install('gasket-oil-cap',{position:[-40,L.coverY[1]+1,160],scale:[.65,.3,.65]});
  for(const [i,z] of [-14.8,14.8].entries())install('washer-thrust',{position:[0,0,z],rotation:[Math.PI/2,0,0],scale:[1,.7,1],instance:i});
  install('spring-timing-adjuster',{position:[-53,105,L.beltZ-12],scale:[.23,.55,.23]});
  install('seal-camshaft',{position:[0,L.camY,201],rotation:[Math.PI/2,0,0],scale:[.62,.65,.62]});
  for(const cy of CYL)install('injector-fuel',{position:[137,DECK+60,cy.z],rotation:[0,0,.35],scale:[.5,.5,.5],instance:cy.i});
  install('regulator-fuel',{position:[140,DECK+82,-242],rotation:[Math.PI/2,0,0],scale:[.5,.5,.5]});
  install('valve-egr',{position:[168,DECK+104,122],scale:[.8,.8,.8]});
  install('valve-pcv',{position:[91,DECK+110,-171],scale:[.55,.55,.55]});
  install('iab-solenoid',{position:[283,DECK+59,144],scale:[.45,.45,.45]});
  install('iab-check-valve',{position:[285,DECK+83,178],rotation:[Math.PI/2,0,0],scale:[.55,.55,.55]});
  install('gasket-exhaust',{position:[-116,DECK+44,0],scale:[.5,1,96/70]});

  // Open the previously solid oil-pump envelope around its new shared rotors.
  const oilHousing=G.oilPump.children.find(m=>m.geometry?.type==='CylinderGeometry');
  if(oilHousing){
    const shape=new THREE.Shape();shape.absarc(0,0,66,0,Math.PI*2,false);
    const hole=new THREE.Path();hole.absarc(0,0,33,0,Math.PI*2,true);shape.holes.push(hole);
    oilHousing.geometry=new THREE.ExtrudeGeometry(shape,{depth:14,bevelEnabled:false,curveSegments:40}).translate(0,0,-7);
  }
  install('pump-oil',{position:[0,-8,200],ratio:1});
  install('valve-oil-relief',{position:[47,-23,199],scale:[.5,.5,.5]});
  install('spring-oil-relief',{position:[47,-43,199],scale:[.32,.32,.32]});
  install('pump-water',{position:[...L.wp,L.beltZ-26],ratio:PULLEY.crankTiming/PULLEY.waterPump});
  install('thermostat',{position:[118,120,-232],rotation:[Math.PI/2,0,0],scale:[.65,.65,.65]});
  install('pipe-coolant',{position:[108,112,-10],rotation:[0,Math.PI/2,0],scale:[2.8,.6,.6]});
  install('sensor-coolant',{position:[126,136,-214],rotation:[0,0,Math.PI/2],scale:[.65,.65,.65]});
  // The former solid stator cylinder filled the rotor volume. Replace it with
  // a ring so the supplemental rotor is a real nested component, not a duplicate.
  const stator=c.alt.children.find(m=>m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop===45);
  if(stator){const shape=new THREE.Shape();shape.absarc(0,0,45,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,31,0,Math.PI*2,true);shape.holes.push(hole);stator.geometry=new THREE.ExtrudeGeometry(shape,{depth:60,bevelEnabled:false,curveSegments:40}).translate(0,0,-30);}
  install('rotor-alternator',{position:L.alt,scale:[.72,.72,.72],ratio:1});
  install('rectifier-alternator',{position:[L.alt[0],L.alt[1],L.alt[2]-33],rotation:[Math.PI/2,0,0],scale:[.8,.8,.8]});
  install('pump-power-steering',{position:L.psp,ratio:PULLEY.crank/PULLEY.powerSteering});

  // Existing pump envelopes become the catalogue component once their more
  // specific relief/spring/interior tags are excluded by exclusive ownership.
  markTree(G.oilPump,'pump-oil');markTree(G.waterPump,'pump-water');
  G.psPump.traverse(m=>{if(m.isMesh&&!m.userData.catalogPiece)mark(m,'pump-power-steering');});
  // Keep all geometry attached. The caller builds its materials/ghost registry
  // only after this pass, so new surfaces participate in normal cutaways.
  return (theta,st={})=>{
    const statePhase=Number.isFinite(st.demonstrationPhase)?st.demonstrationPhase:0;
    for(const item of motions){
      if(item.seam){const p=item.track.sample(theta*Math.PI/180*PULLEY.crank/2);item.seam.position.set(p.x,p.y,L.accZ[1]);item.seam.rotation.z=Math.atan2(p.ty,p.tx);continue;}
      if(item.blade){item.blade.rotation.x=.24+(st.demonstrationId==='throttle-butterfly'?(1-Math.cos(statePhase*Math.PI*2))*.55:0);continue;}
      const phase=item.ratio?theta/720*item.ratio:st.demonstrationId===item.id?statePhase:0;
      item.model.update({phase,angle:0});
    }
  };
}
