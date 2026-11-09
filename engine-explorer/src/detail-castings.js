// Reference-driven castings: cylinder_block_oil_pan (1,6,9), cylinder_head (1,6),
// cylinder_head_cover 1993 EX (2,3,4,8,9), camshaft_timing_belt (1,3,15).
// Active references: F22A6_1993_5MT. Shared castings remain explicitly approximate.
// Only the cylinder bore is a measured Honda dimension here. Wall thicknesses,
// jacket openings, chamber/port contours and casting ribs are visual approximations.
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';

export function detailCastings(ctx) {
  const {G,M,add,at,tube,cylZ,cylX,bolt,L,CYL,DECK,SPEC,ASSUMED,liners,camPulley} = ctx;
  const V = (x,y,z) => new THREE.Vector3(x,y,z);
  const TAU = Math.PI*2;
  const mark=(mesh,id,instance=0)=>{mesh.userData.catalogPiece=id;mesh.userData.catalogInstance=instance;mesh.name=`${id}:${instance}`;return mesh;};
  const [z0,z1] = L.blockZ, bz=(z0+z1)/2, bl=z1-z0;
  const clear = id => G[id].clear();
  function roundRect(x0,y0,x1,y1,r=8) {
    const s=new THREE.Shape();
    s.moveTo(x0+r,y0);s.lineTo(x1-r,y0);s.quadraticCurveTo(x1,y0,x1,y0+r);
    s.lineTo(x1,y1-r);s.quadraticCurveTo(x1,y1,x1-r,y1);
    s.lineTo(x0+r,y1);s.quadraticCurveTo(x0,y1,x0,y1-r);
    s.lineTo(x0,y0+r);s.quadraticCurveTo(x0,y0,x0+r,y0);s.closePath();return s;
  }
  const hole=(s,x,y,rx,ry=rx)=>{const p=new THREE.Path();p.absellipse(x,y,rx,ry,0,TAU,true);s.holes.push(p);};
  const extrude=(s,d,bevel=0)=>new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:!!bevel,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:24});
  // Shapes in X/Z become horizontal slabs. + extrusion runs down from the top.
  const horizontal=(id,s,top,depth,mat)=>{const g=extrude(s,depth);g.rotateX(Math.PI/2);g.translate(0,top,0);return add(id,g,mat);};
  const annulus=(ro,ri,depth)=>{const s=new THREE.Shape();s.absarc(0,0,ro,0,TAU,false);hole(s,0,0,ri);const g=extrude(s,depth);g.translate(0,0,-depth/2);return g;};
  function washer(id,x,y,z,axis='y',ro=9,ri=4,mat=M.steel) {
    const g=annulus(ro,ri,1.8);if(axis==='y')g.rotateX(-Math.PI/2);if(axis==='x')g.rotateY(Math.PI/2);return at(add(id,g,mat),x,y,z);
  }
  const rib=(id,a,b,width=5,depth=8,mat=M.cast)=>{
    const av=V(...a),bv=V(...b),delta=bv.clone().sub(av);
    const m=add(id,new RoundedBoxGeometry(width,depth,delta.length(),1,1),mat);
    m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,0,1),delta.normalize());return m;
  };
  // ---------------------------------------------------- block: four open bores, open crankcase
  clear('block');
  const upper=roundRect(-93,z0,93,z1,7);
  for(const c of CYL)hole(upper,0,c.z,SPEC.bore/2);
  horizontal('block',upper,DECK,128,M.cast);
  const deck=roundRect(-100,z0-1,100,z1+1,10);
  for(const c of CYL) {
    hole(deck,0,c.z,SPEC.bore/2);
    // Simplified water-jacket mouths beside the liners, not exact cast passages.
    for(const side of [-1,1])hole(deck,side*57,c.z,5,25);
  }
  for(const z of [192,96,0,-96,-192])for(const s of [-1,1])hole(deck,s*78,z,5.5);
  horizontal('block',deck,DECK+0.15,5,M.castLight);
  for(const [i,c] of CYL.entries()) {
    const geo=annulus(SPEC.bore/2+2,SPEC.bore/2,128);geo.rotateX(Math.PI/2);
    liners[i].geometry=geo;liners[i].position.set(0,DECK-64,c.z);G.block.add(liners[i]);
  }
  for(const s of [-1,1]) {
    at(add('block',new RoundedBoxGeometry(12,150,bl,2,4),M.cast),s*101,17,bz);
    for(const z of [192,96,0,-96,-192]) {
      rib('block',[s*110,-50,z],[s*104,108,z],9,10);
      rib('block',[s*108,30,z],[s*98,135,z-30],5,9);
      bolt('block',s*110,-38,z,'x',5.5);
    }
    for(const c of CYL) {
      // Circular core plugs in the water-jacket wall, recessed within a cast lip.
      washer('block',s*95,DECK-63,c.z,'x',17,13,M.castLight);
      at(add('block',cylX(13,2,24),M.darkSteel),s*95.5,DECK-63,c.z);
    }
    rib('block',[s*109,-46,z0+10],[s*109,-46,z1-10],5,5);
  }
  // End walls: keep the crankshaft and counterweights clear.
  for(const z of [z0+6,z1-6]) {
    at(add('block',new RoundedBoxGeometry(214,16,12,1,2),M.cast),0,86,z);
    for(const s of [-1,1])at(add('block',new RoundedBoxGeometry(22,144,12,1,2),M.cast),s*96,10,z);
  }
  const skirt=roundRect(-107,z0,107,z1,8);
  skirt.holes.push(new THREE.Path(roundRect(-88,z0+14,88,z1-14,10).getPoints(16)));
  horizontal('block',skirt,-53,9,M.cast);
  // Rear transmission flange and a separate rear-main-seal carrier (photo 8).
  const rear=new THREE.Shape();
  [[-145,-65],[-160,38],[-132,145],[-106,214],[106,214],[130,142],[155,30],[144,-65]].forEach(([x,y],i)=>i?rear.lineTo(x,y):rear.moveTo(x,y));rear.closePath();
  hole(rear,0,0,47);
  // The upper central plate belongs to the block; the recessed web pattern is visual.
  at(add('block',extrude(rear,9,1),M.cast),0,0,z0-9);
  at(add('block',annulus(60,43,8),M.castLight),0,0,z0-15);
  at(add('block',annulus(45,36,5),M.rubber),0,0,z0-21);
  for(const [x,y] of [[-138,-42],[-146,36],[-122,126],[-98,199],[98,199],[121,126],[145,32],[137,-43]]) {
    washer('block',x,y,z0-12,'z',12,6,M.castLight);bolt('block',x,y,z0-15,'z',7,M.darkSteel);
  }
  for(const s of [-1,1])for(const [x,y] of [[57,32],[90,90],[78,172]])rib('block',[s*46,25,z0-13],[s*x,y,z0-13],5,5);
  at(add('block',new RoundedBoxGeometry(28,52,48,2,4),M.cast),-111,72,158);

  // ---------------------------------------------------- head gasket: visible bores, fire rings, bolt holes
  clear('headGasket');
  const gasket=roundRect(-105,z0-2,105,z1+2,11);
  for(const c of CYL) {
    hole(gasket,0,c.z,42.8);
    for(const s of [-1,1])hole(gasket,s*58,c.z,4,22);
  }
  for(const z of [192,96,0,-96,-192])for(const s of [-1,1])hole(gasket,s*78,z,6);
  horizontal('headGasket',gasket,DECK+1.5,1.2,M.gasket);
  for(const c of CYL) {
    const r=annulus(44.5,42.8,.7);r.rotateX(-Math.PI/2);at(add('headGasket',r,M.steel),0,DECK+1.75,c.z);
  }

  // ---------------------------------------------------- head: shallow chambers, ports, open rocker trough
  clear('head');
  const base=roundRect(-113,z0,113,z1,9);
  for(const c of CYL)hole(base,0,c.z,42.6);
  horizontal('head',base,DECK+16,13,M.castLight);
  // Qualitative pent-roof surfaces. Ports and roof do NOT extend the cylinder bores
  // through the 100 mm head. Unverified angles are not manufacturing geometry.
  const chamberMat=M.castLight.clone();chamberMat.side=THREE.DoubleSide;
  for(const c of CYL) {
    const roof=new THREE.Shape();roof.absarc(0,0,42.6,0,TAU,false);
    for(const s of [-1,1])for(const dz of [-17,17])hole(roof,s*22,dz,12.5,13);
    hole(roof,-6,0,5);
    const g=new THREE.ShapeGeometry(roof,24);const p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);p.setXYZ(i,x,DECK+ASSUMED.valveSeatAboveDeck+Math.max(0,22-Math.abs(x))*.38,c.z+z);}g.computeVertexNormals();
    add('head',g,chamberMat);
    for(const s of [-1,1]) {
      const portMat=M.cast.clone();portMat.side=THREE.DoubleSide;
      // Two valve bowls merge into one side port, preserving the cross-flow layout.
      for(const dz of [-17,17])tube('head',[[s*22,DECK+ASSUMED.valveSeatAboveDeck+4,c.z+dz],[s*42,DECK+30,c.z+dz],[s*69,DECK+38,c.z+dz*.5],[s*110,DECK+44,c.z]],12.5,portMat,null,20,12);
    }
  }
  // Perforated long sidewalls. Local plane is (z,y); transform its normal to x.
  for(const s of [-1,1]) {
    const wall=roundRect(z0,DECK+14,z1,DECK+100,5);
    for(const c of CYL)hole(wall,c.z,DECK+44,21,15);
    const geo=extrude(wall,8);geo.rotateY(-Math.PI/2);at(add('head',geo,M.castLight),s>0?115:-107,0,0);
    for(const z of [-218,-96,0,96,186]) {
      bolt('head',s*120,DECK+29,z,'x',5.5,M.darkSteel);
      rib('head',[s*117,DECK+24,z],[s*117,DECK+89,z-28],4,5,M.castLight);
    }
    rib('head',[s*116,DECK+93,z0+6],[s*116,DECK+93,z1-6],4,4,M.castLight);
  }
  for(const z of [z0,z1-7]) {
    const end=roundRect(-113,DECK+15,113,DECK+100,5);hole(end,0,L.camY,17);
    at(add('head',extrude(end,7),M.castLight),0,0,z);
  }

  // ---------------------------------------------------- valve cover: sloping plug row + hollow underside
  clear('valveCover');clear('oilCap');
  const [y0,y1]=L.coverY;
  const outline=roundRect(-111,z0+2,111,z1-2,20);
  for(const c of CYL)hole(outline,66,c.z,18.5);
  hole(outline,-40,160,23);
  const roofY=x=>y1-(x>35?(x-35)*.27:Math.max(0,-x-85)*.22);
  const topGeo=new THREE.ShapeGeometry(outline,32);const tp=topGeo.attributes.position;
  // UV maps the original F22A6 Honda/16 VALVE texture over the real roof mesh.
  const uv=topGeo.attributes.uv;
  for(let i=0;i<tp.count;i++) {
    const x=tp.getX(i),z=tp.getY(i);tp.setXYZ(i,x,roofY(x),z);
    uv.setXY(i,(z-(z0+22))/(bl-44),(87-x)/190);
  }
  const ti=topGeo.index;for(let i=0;i<ti.count;i+=3){const b=ti.getX(i+1);ti.setX(i+1,ti.getX(i+2));ti.setX(i+2,b);}
  topGeo.computeVertexNormals();
  // The thin roof uses the same piecewise planar slope as roofY. Analytic normals
  // avoid triangulation around the plug openings creating false shading dents.
  const roofNormals=topGeo.attributes.normal;
  for(let i=0;i<tp.count;i++) {
    const x=tp.getX(i),slope=x>35?-.27:x<-85?.22:0;
    const n=V(-slope,1,0).normalize();roofNormals.setXYZ(i,n.x,n.y,n.z);
  }
  roofNormals.needsUpdate=true;add('valveCover',topGeo,M.coverTop);
  // Thin perimeter walls and rolled base edge instead of a solid rounded box.
  const boundary=roundRect(-111,z0+2,111,z1-2,20).getPoints(24);
  const positions=[],indices=[];
  boundary.forEach(p=>positions.push(p.x,y0,p.y,p.x,roofY(p.x),p.y));
  for(let i=0;i<boundary.length-1;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  const wallGeo=new THREE.BufferGeometry();wallGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));wallGeo.setIndex(indices);wallGeo.computeVertexNormals();
  const coverSide=M.cover.clone();coverSide.side=THREE.DoubleSide;add('valveCover',wallGeo,coverSide);
  const perimeter=boundary.map(p=>[p.x,y0,p.y]);mark(tube('valveCover',perimeter,2.2,M.rubber,null,120,6),'gasket-valve-cover');
  tube('valveCover',perimeter.map(([x,y,z])=>[x,y+5,z]),2.5,M.cover,null,120,6);
  for(const c of CYL) {
    const well=annulus(20.5,17,8);well.rotateX(-Math.PI/2);at(add('valveCover',well,M.cover),66,roofY(66)+2,c.z);
    mark(washer('valveCover',66,roofY(66)+6,c.z,'y',17.5,12.5,M.rubber),'seal-plug-tube',c.i);
  }
  // Four cap nuts and sealing washers, OEM cover calls 8 and 9. Positions reconstructed.
  for(const [i,x,z] of [[0,66,96],[1,66,-96],[2,-78,142],[3,-78,-174]]) {
    washer('valveCover',x,roofY(x)+2,z,'y',11,4,M.rubber);
    mark(washer('valveCover',x,roofY(x)+4,z,'y',9,4,M.steel),'washer-valve-cover',i);
    mark(bolt('valveCover',x,roofY(x)+7,z,'y',6.2,M.darkSteel),'nut-valve-cover',i);
    mark(at(add('valveCover',new THREE.SphereGeometry(5.2,16,8,0,TAU,0,Math.PI/2),M.darkSteel),x,roofY(x)+10,z),'nut-valve-cover',i);
  }
  // Two small lead supports on the intake half, visible in the supplied top view.
  for(const z of [90,-130]) {
    at(add('valveCover',new THREE.BoxGeometry(10,16,5),M.darkSteel),49,y1+9,z);
    at(add('valveCover',new THREE.BoxGeometry(25,3,11),M.darkSteel),41,y1+18,z);
  }
  washer('valveCover',-40,y1+1,160,'y',29,23,M.cover);
  const cap=new THREE.Shape();
  for(let i=0;i<=96;i++){const a=i/96*TAU,r=28+2.2*Math.cos(6*a);i?cap.lineTo(r*Math.cos(a),r*Math.sin(a)):cap.moveTo(r,0);}cap.closePath();
  const capGeo=extrude(cap,12,1);capGeo.rotateX(-Math.PI/2);at(add('oilCap',capGeo,M.paintBlack),-40,y1+3,160);
  washer('oilCap',-40,y1+15,160,'y',18,16.5,M.plasticPlain);

  // ---------------------------------------------------- shaped timing covers and fine moulded ribbing
  clear('timingCoverUpper');clear('timingCoverLower');
  const upperCover=new THREE.Shape();
  upperCover.moveTo(-73,201);upperCover.lineTo(-72,310);
  upperCover.bezierCurveTo(-69,356,-40,371,0,373);
  upperCover.bezierCurveTo(39,373,68,354,73,316);
  upperCover.lineTo(88,217);upperCover.quadraticCurveTo(89,205,75,204);
  upperCover.lineTo(61,204);upperCover.lineTo(61,225);upperCover.lineTo(8,225);upperCover.lineTo(8,201);upperCover.closePath();
  const coverMat=M.plasticPlain;
  at(add('timingCoverUpper',extrude(upperCover,7,2.2),coverMat),0,0,246);
  tube('timingCoverUpper',upperCover.getPoints(36).map(p=>[p.x,p.y,255]),1.7,coverMat,null,120,6);
  for(let y=238;y<=338;y+=5) {
    const half=y>315?Math.max(40,69-(y-315)*.5):70;
    for(const s of [-1,1])rib('timingCoverUpper',[s*23,y,255],[s*half,y,255],1.2,1.3,coverMat);
  }
  at(add('timingCoverUpper',new RoundedBoxGeometry(40,114,2,2,4),coverMat),0,295,257);
  for(const [x,y] of [[-67,207],[77,215],[64,242]]){washer('timingCoverUpper',x,y,256,'z',9,4,coverMat);bolt('timingCoverUpper',x,y,259,'z',5.5,M.darkSteel);}
  const lower=new THREE.Shape();
  lower.moveTo(-91,207);lower.lineTo(6,207);lower.lineTo(6,228);lower.lineTo(61,228);lower.lineTo(61,207);lower.lineTo(95,207);
  lower.quadraticCurveTo(134,202,134,178);lower.lineTo(134,26);lower.quadraticCurveTo(104,-30,61,-62);
  lower.lineTo(-47,-65);lower.quadraticCurveTo(-104,-44,-105,17);lower.lineTo(-108,173);lower.quadraticCurveTo(-109,201,-91,207);lower.closePath();
  hole(lower,0,0,25);
  at(add('timingCoverLower',extrude(lower,8,3),coverMat),0,0,242);
  tube('timingCoverLower',lower.getPoints(36).map(p=>[p.x,p.y,253]),2,coverMat,null,120,6);
  for(const [x,y,r] of [[-72,92,27],[106,60,25],[52,70,19]]) {
    at(add('timingCoverLower',cylZ(r,9,32),coverMat),x,y,254);
    at(add('timingCoverLower',annulus(r+5,r+2,2),coverMat),x,y,253);
  }
  at(add('timingCoverLower',annulus(39,25,10),coverMat),0,0,253);
  for(const y of [164,176,188])rib('timingCoverLower',[-80,y,253],[70,y,253],1.4,1.8,coverMat);
  for(const [x,y]of[[-94,170],[98,180],[-94,3],[94,22],[-48,-54]])bolt('timingCoverLower',x,y,255,'z',5,M.darkSteel);

  // Cam sprocket: actual open spoke windows rather than painted-on dark discs.
  camPulley.clear();
  const wheel=new THREE.Shape();wheel.absarc(0,0,52,0,TAU,false);hole(wheel,0,0,9);
  for(let k=0;k<5;k++){const a=k/5*TAU;hole(wheel,Math.cos(a)*32,Math.sin(a)*32,10);}
  at(add('camPulley',extrude(wheel,8,0.7),M.darkSteel,camPulley),0,0,-4);
  add('camPulley',annulus(54,49,22),M.steel,camPulley);
  // The rendering tessellation is not a claimed OEM tooth count.
  const teeth=new THREE.Shape();
  for(let k=0;k<=192;k++){const a=k/192*TAU,r=k%4<2?54.2:52.8;k?teeth.lineTo(Math.cos(a)*r,Math.sin(a)*r):teeth.moveTo(r,0);}teeth.closePath();hole(teeth,0,0,50);
  at(add('camPulley',extrude(teeth,20),M.darkSteel,camPulley),0,0,-10);
  add('camPulley',cylZ(11,15,6),M.steel,camPulley).position.z=5;
  // Front oil pump cast bolt bosses. No unverified pump internals are asserted.
  for(const [x,y]of[[-48,-28],[-44,42],[40,44],[79,-31],[20,-62]]){washer('oilPump',x,y,210,'z',9,4,M.castLight);bolt('oilPump',x,y,213,'z',5.5);}

  // Oil pan perimeter, side drain plug and shallow stamped beads.
  // Remove the former bottom-facing drain bolt, keep the original pan silhouette.
  for(const m of [...G.oilPan.children])if(m.geometry?.type==='CylinderGeometry')G.oilPan.remove(m);
  for(const s of [-1,1])for(const z of [190,135,80,25,-30,-85,-140,-195,-230]) {
    washer('oilPan',s*98,-77,z,'y',6,3,M.darkSteel);bolt('oilPan',s*98,-80,z,'y',4.5,M.darkSteel);
  }
  for(const s of [-1,1])for(const z of [150,90,30,-30,-90])rib('oilPan',[s*94,-85,z],[s*94,-113,z],2,3,M.paintBlack);
  washer('oilPan',95,-102,-94,'x',10,6,M.steel);bolt('oilPan',100,-102,-94,'x',9,M.darkSteel);
}
