import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import {intakeEmblem} from './textures.js';
import {INTAKE,MANUAL} from './exterior-layout.js';

/** Photo/OEM-led exterior pass. Dimensions below are visual estimates, NOT Honda machining dimensions.
 * Evidence: active F22A6_1993_5MT references; intake_manifold, throttle_body, exhaust_manifold, alternator_denso,
 * distributor_tec, p_s_pump and install_pipe_tubing diagrams in the reference library.
 * Runs once, after base geometry, before the material/selection registry is built.
 */
export function detailExterior({G, M, add, at, tube, cylZ, cylX, bolt, L, CYL, DECK}) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const TAU = Math.PI * 2;
  const mark=(mesh,id,instance=0)=>{mesh.userData.catalogPiece=id;mesh.userData.catalogInstance=instance;mesh.name=`${id}:${instance}`;return mesh;};
  const curve = (pts) => new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'centripetal');
  const box = (id, size, pos, material = M.cast, radius = 3, parent) => at(add(id, new RoundedBoxGeometry(...size, 2, radius), material, parent), ...pos);
  const clear = id => {
    for (const child of [...G[id].children]) {
      G[id].remove(child);
      child.traverse(m => m.geometry?.dispose());
    }
  };
  const ring = (id, r, thickness, pos, normal = [0, 0, 1], mat = M.steel, parent) => {
    const mesh = at(add(id, new THREE.TorusGeometry(r, thickness, 6, 32), mat, parent), ...pos);
    mesh.quaternion.setFromUnitVectors(V(0, 0, 1), V(...normal).normalize());
    return mesh;
  };
  const annulus = (id, outer, inner, depth, pos, normal = [0, 0, 1], mat = M.cast, parent) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, 0, TAU, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, 0, TAU, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: false, curveSegments: 24});
    geo.translate(0, 0, -depth / 2);
    const mesh = at(add(id, geo, mat, parent), ...pos);
    mesh.quaternion.setFromUnitVectors(V(0, 0, 1), V(...normal).normalize());
    return mesh;
  };
  const washer = (id, pos, normal = [1, 0, 0], r = 8) => annulus(id, r, r * 0.45, 1.4, pos, normal, M.darkSteel);
  const innerRubber = M.rubber.clone();
  innerRubber.side = THREE.BackSide;
  const innerCast = M.cast.clone();
  innerCast.side = THREE.BackSide;
  const hollowTube = (id, pts, radius, wall, mat, seg = 36) => {
    const c = curve(pts);
    add(id, new THREE.TubeGeometry(c, seg, radius, 20, false), mat);
    add(id, new THREE.TubeGeometry(c, seg, radius - wall, 20, false), mat === M.rubber || mat === M.plasticPlain ? innerRubber : innerCast);
    for (const end of [0, 1]) {
      const p = c.getPointAt(end), n = c.getTangentAt(end);
      annulus(id, radius, radius - wall, 0.8, p.toArray(), n.toArray(), mat);
    }
    return c;
  };
  const clamp = (id, pos, normal, radius) => {
    const n = V(...normal).normalize();
    annulus(id, radius + 1.7, radius + 0.3, 6, pos, normal, M.steel);
    const axis = Math.abs(n.y) < 0.85 ? V(0, 1, 0) : V(1, 0, 0);
    const t = new THREE.Vector3().crossVectors(n, axis).normalize();
    const p = V(...pos).addScaledVector(t, radius + 3);
    const screw = box(id, [10, 6, 6], p.toArray(), M.darkSteel, 1);
    screw.quaternion.setFromUnitVectors(V(1, 0, 0), n);
  };
  const connector = (id, pos, size = [14, 16, 19], color = M.plasticPlain) => {
    box(id, size, pos, color, 2);
    box(id, [size[0] + 2, 3, size[2] * 0.55], [pos[0], pos[1] + size[1] / 2, pos[2]], M.plasticPlain, 1);
    for (const dz of [-4, 0, 4]) tube(id, [[pos[0], pos[1] - size[1] / 2, pos[2] + dz], [pos[0] - 5, pos[1] - 17, pos[2] + dz]], 1.2, M.rubber, null, 4, 6);
  };

  // ---------------------------------------------------------- F22A6 manifold A + IAB plate + manifold B
  // Honda 1993 EX5MT intake calls10/11/14/17. Eight openings are verified by
  // the actual 17120-PT2-000 photograph: four round secondary + four permanent ports.
  clear('plenum');clear('runners');
  const {x:PX,y:PY,plateY,primaryX,bypassX}=INTAKE;
  const seamY=plateY+13;
  // Rounded hollow chamber with a bored throttle end. The exterior wall follows
  // the PGM-FI casting silhouette; internal wall thickness is a visual estimate.
  const endOutline=new THREE.Shape();endOutline.moveTo(-42,-35);endOutline.lineTo(42,-35);endOutline.quadraticCurveTo(56,-35,56,-21);endOutline.lineTo(56,20);endOutline.quadraticCurveTo(56,36,40,36);endOutline.lineTo(-40,36);endOutline.quadraticCurveTo(-56,36,-56,20);endOutline.lineTo(-56,-21);endOutline.quadraticCurveTo(-56,-35,-42,-35);
  const profile=new THREE.Shape();profile.moveTo(-56,-35);profile.lineTo(-56,20);profile.quadraticCurveTo(-56,36,-40,36);profile.lineTo(40,36);profile.quadraticCurveTo(56,36,56,20);profile.lineTo(56,-35);profile.lineTo(51,-35);profile.lineTo(51,19);profile.quadraticCurveTo(51,31,39,31);profile.lineTo(-39,31);profile.quadraticCurveTo(-51,31,-51,19);profile.lineTo(-51,-35);profile.closePath();
  const chamberGeo=new THREE.ExtrudeGeometry(profile,{depth:364,bevelEnabled:false,curveSegments:20});at(add('plenum',chamberGeo,M.cast),PX,PY,-200);
  const end=new THREE.Shape(endOutline.getPoints());const inlet=new THREE.Path();inlet.absarc(0,6,29,0,TAU,true);end.holes.push(inlet);
  at(add('plenum',new THREE.ExtrudeGeometry(end,{depth:7,bevelEnabled:false,curveSegments:20}),M.castLight),PX,PY,-204);
  const closedEnd=new THREE.Shape(endOutline.getPoints());at(add('plenum',new THREE.ExtrudeGeometry(closedEnd,{depth:6,bevelEnabled:false,curveSegments:20}),M.cast),PX,PY,163);
  for(const z of [-175,-100,0,100,148]){
    box('plenum',[6,55,7],[PX+55,PY-2,z],M.cast,2);
    box('plenum',[15,12,16],[PX+55,seamY+10,z],M.cast,3);
    bolt('plenum',PX+55,seamY+19,z,'y',4.5);
  }
  const portPlate=(id,y,depth,material)=>{
    const outline=new THREE.Shape();outline.moveTo(171,-211);outline.lineTo(279,-211);outline.quadraticCurveTo(287,-211,287,-200);outline.lineTo(287,174);outline.quadraticCurveTo(287,185,276,185);outline.lineTo(171,185);outline.quadraticCurveTo(164,185,164,174);outline.lineTo(164,-200);outline.quadraticCurveTo(164,-211,171,-211);
    for(const cy of CYL){
      const secondary=new THREE.Path();secondary.absarc(bypassX,cy.z,18.8,0,TAU,true);outline.holes.push(secondary);
      const primary=new THREE.Path();primary.moveTo(primaryX-15,cy.z-20);primary.lineTo(primaryX+15,cy.z-20);primary.quadraticCurveTo(primaryX+22,cy.z-20,primaryX+22,cy.z-13);primary.lineTo(primaryX+22,cy.z+13);primary.quadraticCurveTo(primaryX+22,cy.z+20,primaryX+15,cy.z+20);primary.lineTo(primaryX-15,cy.z+20);primary.quadraticCurveTo(primaryX-22,cy.z+20,primaryX-22,cy.z+13);primary.lineTo(primaryX-22,cy.z-13);primary.quadraticCurveTo(primaryX-22,cy.z-20,primaryX-15,cy.z-20);outline.holes.push(primary);
    }
    const geo=new THREE.ExtrudeGeometry(outline,{depth,bevelEnabled:false,curveSegments:18});geo.rotateX(Math.PI/2);
    return at(add(id,geo,material),0,y,0);
  };
  portPlate('plenum',seamY+4,5,M.castLight);
  mark(portPlate('iabBody',plateY+10,20,M.cast),'iab-body');
  for(const y of [plateY+11.5,plateY-10])mark(portPlate('iabBody',y,1.4,M.gasket),'gasket-iab',y>plateY?0:1);
  for(const z of [-196,-96,0,96,170])for(const x of [175,278]){
    box('iabBody',[13,23,15],[x,plateY,z],M.cast,3);
    bolt('plenum',x,seamY+8,z,'y',5);
  }
  const emblemMat=new THREE.MeshStandardMaterial({map:intakeEmblem(),roughness:.52,metalness:.7});
  const emblem=at(add('plenum',new THREE.PlaneGeometry(162,29),emblemMat),PX,PY+39,-22);emblem.rotation.x=-Math.PI/2;emblem.rotation.z=Math.PI/2;
  for(const z of [-172,133])box('plenum',[122,7,9],[PX,PY+37,z],M.castLight,2);
  for(const cy of CYL){
    // Long primary passages remain open. Short secondary passages join the same
    // cylinder's intake port; separate round butterfly ports are immediately above.
    const long=[[120,DECK+44,cy.z],[157,DECK+24,cy.z],[206,DECK-26,cy.z],[259,DECK-12,cy.z],[primaryX,plateY-13,cy.z]];
    const short=[[120,DECK+44,cy.z],[163,DECK+54,cy.z],[bypassX,plateY-13,cy.z]];
    const before=new Set(G.runners.children);
    hollowTube('runners',long,23,4,M.cast,42);hollowTube('runners',short,21.8,3.5,M.cast,28);
    box('runners',[12,58,61],[123,DECK+46,cy.z],M.castLight,7);
    for(const s of [-1,1])bolt('runners',132,DECK+66,cy.z+s*27,'x',5);
    for(const mesh of G.runners.children)if(!before.has(mesh))mark(mesh,'runner-intake',cy.i);
  }
  // Single shaft carries all four secondary butterflies. Positive opening is an
  // educational actuator command, not a crank-angle event or an RPM calibration.
  const flaps=[];
  mark(at(add('iabShaft',cylZ(3.2,401,16),M.steel),bypassX,plateY,-10),'iab-shaft');
  for(const cy of CYL){
    const pivot=new THREE.Group();pivot.position.set(bypassX,plateY,cy.z);G.iabButterflies.add(pivot);
    const flap=add('iabButterflies',new THREE.CylinderGeometry(18.1,18.1,1.3,40),M.brass,pivot);mark(flap,'iab-butterfly',cy.i);
    for(const z of [-8,8]){const screw=add('iabButterflies',new THREE.CylinderGeometry(2.3,2.3,2,12),M.steel,pivot);screw.position.set(0,1,z);mark(screw,'iab-butterfly',cy.i);}
    flaps.push(pivot);
  }
  const lever=new THREE.Group();lever.position.set(bypassX,plateY,199);G.iabShaft.add(lever);
  box('iabShaft',[25,6,4],[10,0,0],M.darkSteel,1,lever);
  const diaphragm=at(add('iabActuator',new THREE.CylinderGeometry(24,27,16,40),M.darkSteel),bypassX+20,plateY+55,202);mark(diaphragm,'iab-actuator');
  mark(ring('iabActuator',26,1.2,[bypassX+20,plateY+49,202],[0,1,0],M.steel),'iab-actuator');
  box('iabActuator',[5,54,28],[bypassX-15,plateY+33,202],M.darkSteel,2);
  const pullrod=at(add('iabActuator',new THREE.CylinderGeometry(2,2,42,12),M.steel),bypassX+20,plateY+25,202);mark(pullrod,'iab-actuator');
  hollowTube('iabActuator',[[bypassX+20,plateY+64,202],[bypassX+20,plateY+74,202]],3.8,1.4,M.darkSteel,8);
  // OEM-specified controls. Their precise hose routing and electrical calibration
  // remain unresolved; no emissions hose tree is invented here.
  mark(box('iabVacuumTank',[59,43,45],[PX+57,DECK+12,143],M.paintBlack,6),'iab-vacuum-chamber');
  for(const z of [123,163])box('iabVacuumTank',[9,6,9],[PX+57,DECK+38,z],M.darkSteel,1);
  mark(at(add('iabSolenoid',new THREE.CylinderGeometry(11,11,30,24),M.paintBlack),PX+58,DECK+59,144),'iab-solenoid');
  connector('iabSolenoid',[PX+72,DECK+56,144],[16,17,19]);
  // The short local tube is illustrative; no factory ECU threshold is simulated.
  tube('iabActuator',[[bypassX+20,plateY+73,202],[PX+53,plateY+84,195],[PX+66,DECK+76,165]],3,M.rubber,null,24,8);
  const stay=box('runners',[8,112,25],[186,DECK-67,45],M.darkSteel,2);stay.rotation.z=-.44;
  for(const p of [[164,DECK-118,45],[209,DECK-16,45]])bolt('runners',...p,'x',7);
  mark(tube('fuelRail',[[151,DECK+106,166],[151,DECK+106,-141],[153,DECK+98,-196]],2.8,M.brass,null,24,8),'rail-fuel');
  for(const cy of CYL){mark(ring('injectors',7.6,1.2,[137,DECK+77,cy.z],[0,1,0],M.rubber),'seal-injector',cy.i);connector('injectors',[146,DECK+79,cy.z+15],[15,14,18],M.gasket);}

  // ---------------------------------------------------------- throttle casting and inlet duct
  clear('throttleBody');
  clear('intakeDuct');
  annulus('throttleBody', 35, 29, 48, [PX, PY + 6, -228], [0, 0, 1], M.castLight);
  const throttleFlange = new THREE.Shape();
  throttleFlange.moveTo(-43, -40); throttleFlange.lineTo(42, -40); throttleFlange.lineTo(42, 43); throttleFlange.lineTo(-43, 43); throttleFlange.closePath();
  const bore = new THREE.Path(); bore.absarc(0, 0, 29, 0, TAU, true); throttleFlange.holes.push(bore);
  for (const x of [-34, 34]) for (const y of [-31, 34]) {
    const hole = new THREE.Path(); hole.absarc(x, y, 4, 0, TAU, true); throttleFlange.holes.push(hole);
  }
  const fg = new THREE.ExtrudeGeometry(throttleFlange, {depth: 5, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 1});
  at(add('throttleBody', fg, M.cast), PX, PY + 6, -207);
  for (const x of [-34, 34]) for (const y of [-31, 34]) bolt('throttleBody', PX + x, PY + 6 + y, -209, 'z', 5);
  // Butterfly is shown slightly open, as a static explanatory detail; throttle position is not simulated.
  const butterfly = at(add('throttleBody', cylZ(28.3, 1.4, 32), M.brass), PX, PY + 6, -229);
  butterfly.rotation.y = 0.24;
  at(add('throttleBody', cylX(3, 87, 14), M.steel), PX, PY + 6, -229);
  const sector = add('throttleBody', new THREE.TorusGeometry(24, 2.2, 6, 32, Math.PI * 1.25), M.darkSteel);
  sector.position.set(PX + 45, PY + 6, -229); sector.rotation.y = Math.PI / 2;
  at(add('throttleBody', cylX(10, 10, 20), M.darkSteel), PX + 43, PY + 6, -229);
  const springPts = [];
  for (let i = 0; i <= 96; i++) {
    const a = i / 96 * TAU * 5;
    springPts.push([PX + 38 + i / 96 * 12, PY + 6 + 8 * Math.cos(a), -229 + 8 * Math.sin(a)]);
  }
  tube('throttleBody', springPts, 1.1, M.steel, null, 96, 5);
  connector('throttleBody', [PX - 40, PY + 11, -225], [20, 29, 27]);
  box('throttleBody', [43, 8, 45], [PX - 4, PY - 35, -224], M.castLight, 4);
  hollowTube('throttleBody', [[PX + 14, PY - 33, -233], [PX + 31, PY - 50, -233]], 6, 2, M.cast, 8);
  const ductPts=[[PX,PY+6,-253],[PX,PY+4,-285],[PX-16,PY-1,-333],[185,PY-4,-385],INTAKE.ductEnd];
  const dc=hollowTube('intakeDuct',ductPts,36,3.3,M.plasticPlain,54);
  for(const u of [.08,.15,.22,.29,.36,.43,.5,.57,.64,.71,.78])ring('intakeDuct',37,2.1,dc.getPointAt(u).toArray(),dc.getTangentAt(u).toArray(),M.plasticPlain);
  for(const u of [.02,.97])clamp('intakeDuct',dc.getPointAt(u).toArray(),dc.getTangentAt(u).toArray(),36);
  hollowTube('intakeDuct',[[PX-30,PY+9,-300],[PX-51,PY+15,-298]],6,2,M.plasticPlain,8);

  // F22A6 four-branch cast manifold, paired outlets. OEM flange topology retained;
  // buried passage contours are illustrative and do not claim a measured gas path.
  clear('exhaustManifold');
  for(const cy of CYL){
    const outletZ=(cy.i===0||cy.i===3)?-62:12;
    mark(tube('exhaustManifold',[[-118,DECK+44,cy.z],[-157,DECK+28,cy.z],[-190,DECK-38,cy.z*.60],[-195,DECK-115,outletZ]],22,M.iron,null,38,20),'runner-exhaust',cy.i);
    box('exhaustManifold',[11,67,69],[-123,DECK+45,cy.z],M.iron,7);
  }
  for(const z of [-62,12])annulus('exhaustManifold',25,19,12,[-195,DECK-122,z],[0,1,0],M.iron);
  const collector=new THREE.Shape();collector.moveTo(-228,-100);collector.lineTo(-165,-100);collector.lineTo(-154,43);collector.lineTo(-236,43);collector.closePath();
  for(const z of [-62,12]){const h=new THREE.Path();h.absarc(-195,z,19,0,TAU,true);collector.holes.push(h);}
  const collectorGeo=new THREE.ExtrudeGeometry(collector,{depth:9,bevelEnabled:false});collectorGeo.rotateX(Math.PI/2);at(add('exhaustManifold',collectorGeo,M.iron),0,DECK-126,0);

  // ---------------------------------------------------------- pressed exhaust shield
  clear('heatShield');
  const shieldShape = new THREE.Shape();
  // Shape coordinates are z and y; the sheet is gently dished away from the exhaust runners.
  shieldShape.moveTo(-205,DECK+71);
  shieldShape.quadraticCurveTo(-218,DECK+62,-210,DECK+32);
  shieldShape.lineTo(-165,DECK+4);shieldShape.lineTo(-113,DECK-106);
  shieldShape.quadraticCurveTo(-105,DECK-133,-79,DECK-134);
  shieldShape.lineTo(31,DECK-134);shieldShape.quadraticCurveTo(54,DECK-130,60,DECK-106);
  shieldShape.lineTo(105,DECK+4);shieldShape.quadraticCurveTo(145,DECK+20,145,DECK+48);
  shieldShape.quadraticCurveTo(145,DECK+76,124,DECK+78);
  shieldShape.lineTo(-188,DECK+78);shieldShape.closePath();
  const inspectionHoles=[];
  const shieldX = (z, y) => {
    const t = THREE.MathUtils.clamp((DECK + 78 - y) / 240, 0, 1);
    return -163 - 68 * Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) - 9 * Math.max(0, 1 - ((z + 32) / 178) ** 2);
  };
  const sg = new THREE.ShapeGeometry(shieldShape, 16).toNonIndexed();
  const source = sg.getAttribute('position'), sheet = [], uvs = [], sheetNormals = [];
  const emitTriangle = (a, b, c, level) => {
    if (level) {
      const ab = a.clone().add(b).multiplyScalar(0.5), bc = b.clone().add(c).multiplyScalar(0.5), ca = c.clone().add(a).multiplyScalar(0.5);
      emitTriangle(a, ab, ca, level - 1); emitTriangle(ab, b, bc, level - 1);
      emitTriangle(ca, bc, c, level - 1); emitTriangle(ab, bc, ca, level - 1); return;
    }
    for (const p of [a, b, c]) {
      sheet.push(shieldX(p.x, p.y), p.y, p.x);
      uvs.push((p.x + 220) / 380, (p.y - 60) / 240);
      const dy = (shieldX(p.x, p.y + 0.1) - shieldX(p.x, p.y - 0.1)) / 0.2;
      const dz = (shieldX(p.x + 0.1, p.y) - shieldX(p.x - 0.1, p.y)) / 0.2;
      sheetNormals.push(...V(-1, dy, dz).normalize().toArray());
    }
  };
  for (let i = 0; i < source.count; i += 3) emitTriangle(new THREE.Vector3().fromBufferAttribute(source, i), new THREE.Vector3().fromBufferAttribute(source, i + 1), new THREE.Vector3().fromBufferAttribute(source, i + 2), 2);
  sg.dispose();
  const sheetGeo = new THREE.BufferGeometry();
  sheetGeo.setAttribute('position', new THREE.Float32BufferAttribute(sheet, 3));
  sheetGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  sheetGeo.setAttribute('normal', new THREE.Float32BufferAttribute(sheetNormals, 3));
  add('heatShield', sheetGeo, M.shield);
  const edge = shieldShape.getPoints(60).map(p => [shieldX(p.x, p.y) - 0.5, p.y, p.x]);
  tube('heatShield', edge, 1.7, M.shield, null, 100, 6);
  for (const [z, y] of inspectionHoles) ring('heatShield', 7.2, 0.8, [shieldX(z, y) - 0.6, y, z], [1, 0, 0], M.darkSteel);
  for (const [z, y] of [[-172, DECK + 13], [112, DECK + 13], [35, 88]]) {
    const x = shieldX(z, y) - 3;
    washer('heatShield', [x, y, z], [1, 0, 0], 10); bolt('heatShield', x - 3, y, z, 'x', 7.5, M.darkSteel);
  }
  // Pressed stiffening bead around the lower collector, and the embossed warning panel outline.
  tube('heatShield', [[shieldX(-108, 115) - 2, 115, -108], [-224, 108, -70], [-224, 108, -20], [shieldX(48, 117) - 2, 117, 48]], 2, M.shield, null, 32, 6);
  const stamp = [[-65, DECK + 68], [-65, DECK + 27], [-10, DECK + 27], [-10, DECK + 68], [-65, DECK + 68]].map(([z, y]) => [shieldX(z, y) - 1.2, y, z]);
  tube('heatShield', stamp, 1, M.shield, null, 24, 6);
  // Ports and studs on the iron casting are visible once the shield is removed.
  for (const cy of CYL) for (const s of [-1, 1]) {
    at(add('exhaustManifold', cylX(10, 18, 16), M.iron), -131, DECK + 64, cy.z + s * 27);
    washer('exhaustManifold', [-142, DECK + 64, cy.z + s * 27]);
    bolt('exhaustManifold', -147, DECK + 64, cy.z + s * 27, 'x', 6, M.darkSteel);
  }
  at(add('exhaustManifold', cylX(9, 15, 6), M.rust), -184, DECK - 58, 72);
  box('exhaustManifold', [7, 74, 24], [-144, 72, -30], M.darkSteel, 3);
  for (const y of [41, 103]) bolt('exhaustManifold', -150, y, -30, 'x', 7, M.darkSteel);

  // ---------------------------------------------------------- open hose stubs / fittings
  // Photo 7 shows a genuinely open coolant hose, a split spring clamp, and an angled cast elbow.
  clear('coolantOutlet');
  box('coolantOutlet', [40, 50, 44], [-131, DECK + 46, -226], M.castLight, 8);
  for (const z of [-243, -209]) bolt('coolantOutlet', -153, DECK + 47, z, 'x', 5.5);
  const outlet = hollowTube('coolantOutlet', [[-145, DECK + 44, -226], [-173, DECK + 38, -240], [-205, DECK + 30, -252]], 17, 3.4, M.rubber, 24);
  clamp('coolantOutlet', outlet.getPointAt(0.47).toArray(), outlet.getTangentAt(0.47).toArray(), 17);
  for (const [pos, normal] of [[[80, DECK + 120, 236], [0.4, -1, 0.3]], [[150, 80, 262], [0.05, -1, 0.05]], [[160, -78, 270], [0.1, -1, -0.1]]]) {
    annulus('psHose', 11.5, 10, 22, pos, normal, M.steel);
    for (const dy of [-6, 0, 6]) ring('psHose', 11.6, 0.6, [pos[0], pos[1] + dy, pos[2]], normal, M.darkSteel);
  }

  // ---------------------------------------------------------- alternator ventilated case
  // Replace the static case only. The separate altPulley mesh and the simulated shaft remain intact.
  const alt = G.alternator.children.find(child => child.isGroup && Math.abs(child.position.x - L.alt[0]) < 1);
  if (alt) {
    for (const child of [...alt.children]) { alt.remove(child); child.geometry?.dispose(); }
    const localRing = (radius, width, z, mat = M.castLight) => annulus('alternator', radius, radius - 5, width, [0, 0, z], [0, 0, 1], mat, alt);
    // Stator iron and copper lie inside the open cage; they are visible between the cast bridges.
    add('alternator', cylZ(45, 60, 32), M.darkSteel, alt).position.z = 3;
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU;
      const winding = box('alternator', [9, 12, 42], [Math.cos(a) * 46, Math.sin(a) * 46, 5], M.copper, 3, alt);
      winding.rotation.z = a;
    }
    for (const [z, width, radius] of [[-37, 8, 56], [-15, 6, 58], [12, 6, 58], [39, 7, 59]]) localRing(radius, width, z);
    for (let k = 0; k < 20; k++) {
      const a = k / 20 * TAU;
      const rib = box('alternator', [6, 8, 77], [Math.cos(a) * 55, Math.sin(a) * 55, 1], M.castLight, 1.5, alt);
      rib.rotation.z = a;
      const face = box('alternator', [34, 5, 6], [Math.cos(a) * 39, Math.sin(a) * 39, 44], M.castLight, 1, alt);
      face.rotation.z = a;
    }
    annulus('alternator', 24, 10, 11, [0, 0, 44], [0, 0, 1], M.castLight, alt);
    add('alternator', cylZ(52, 8, 32), M.castLight, alt).position.z = -42;
    box('alternator', [25, 69, 21], [40, -58, 0], M.cast, 5, alt);
    annulus('alternator', 13, 6.5, 22, [40, -84, 0], [0, 0, 1], M.castLight, alt);
    add('alternator', cylZ(19, 25, 20), M.paintBlack, alt).position.set(-29, 26, -55);
    box('alternator', [27, 19, 20], [21, 22, -55], M.paintBlack, 4, alt);
    for (const a of [0.45, 2.55, 4.55]) {
      add('alternator', cylZ(3, 91, 10), M.darkSteel, alt).position.set(Math.cos(a) * 51, Math.sin(a) * 51, 0);
      add('alternator', cylZ(5, 4, 6), M.steel, alt).position.set(Math.cos(a) * 51, Math.sin(a) * 51, 47);
    }
  }

  // ---------------------------------------------------------- steering pump and distributor
  // The base model's solid lathed pulley hid all six holes. Keep the rotating group and its
  // perforated disc, replacing only the thick solid rim by a genuinely annular grooved rim.
  const psPulley = G.psPump.children.find(child => child.isGroup && Math.abs(child.position.z - L.accZ[1]) < 1);
  if (psPulley) {
    for (const child of [...psPulley.children]) if (child.geometry?.type === 'LatheGeometry') { psPulley.remove(child); child.geometry.dispose(); }
    for (const z of [-7, -3, 1, 5]) annulus('psPump', 52, 46, 2.8, [0, 0, z], [0, 0, 1], M.pulleyBright, psPulley);
    annulus('psPump', 49, 46, 16, [0, 0, 0], [0, 0, 1], M.pulley, psPulley);
  }
  const [sx, sy, sz] = L.psp;
  ring('psPump', 39.5, 1.3, [sx, sy, sz - 29], [0, 0, 1], M.darkSteel);
  for (const a of [0.3, 2.4, 4.5]) bolt('psPump', sx + Math.cos(a) * 31, sy + Math.sin(a) * 31, sz - 34, 'z', 5.5);
  box('psPump', [48, 8, 34], [sx + 2, sy + 37, sz - 5], M.castLight, 3);
  for (const dz of [-16, 7]) bolt('psPump', sx + 2, sy + 44, sz + dz, 'y', 5);
  hollowTube('psPump', [[sx - 24, sy + 3, sz - 8], [sx - 43, sy - 15, sz - 8]], 8, 2.5, M.castLight, 8);

  // Four spark-lead towers plus the external-coil center tower follow the TEC diagram.
  // Housing shape is visually reconstructed; the selected source is TD-52U.
  const dz = L.headZ[0];
  for (const child of [...G.distributor.children]) if (child.isMesh) { G.distributor.remove(child); child.geometry.dispose(); }
  mark(at(add('distributor', cylZ(31, 40, 32), M.castLight), 0, L.camY, dz - 20),'housing-distributor');
  mark(at(add('distributor', cylZ(39, 36, 32), M.paintBlack), 0, L.camY, dz - 57),'cap-distributor');
  mark(ring('distributor', 39.4, 1.4, [0, L.camY, dz - 39], [0, 0, 1], M.gasket),'cap-distributor');
  const terminalAngles = [0.45, 1.95, 3.5, 5.0];
  for (const a of terminalAngles) {
    const x = Math.cos(a) * 25, y = L.camY + Math.sin(a) * 25;
    mark(annulus('distributor', 8, 5.5, 20, [x, y, dz - 81], [0, 0, 1], M.paintBlack),'cap-distributor');
    mark(ring('distributor', 8.1, 1, [x, y, dz - 87], [0, 0, 1], M.rubber),'cap-distributor');
  }
  for (const a of [0, Math.PI]) {
    const x = Math.cos(a) * 42;
    mark(box('distributor', [17, 21, 12], [x, L.camY, dz - 38], M.castLight, 4),'housing-distributor');
    mark(bolt('distributor', x, L.camY, dz - 46, 'z', 4.5),'housing-distributor');
  }
  connector('distributor', [27, L.camY + 29, dz - 20], [21, 24, 23], M.gasket);
  clear('plugLeads');
  CYL.forEach((cy, k) => {
    const a = terminalAngles[k], x = Math.cos(a) * 25, y = L.camY + Math.sin(a) * 25;
    mark(tube('plugLeads', [[x, y, dz - 92], [x + 26, L.coverY[1] + 22 + k * 4, dz - 91], [88 + k * 4, L.coverY[1] + 17 + k * 3, dz + 20], [90, L.coverY[1] + 24, cy.z - 28], [66, L.coverY[1] + 25, cy.z]], 3.6, M.rubber, null, 52, 8),'lead-spark-plug',cy.i);
    mark(at(add('plugLeads', cylZ(9, 22, 16), M.rubber), x, y, dz - 89),'lead-spark-plug',cy.i);
    // The lead must terminate in the rubber boot seated in the cover well.
    mark(at(add('plugLeads', new THREE.CylinderGeometry(14, 12, 30, 24), M.rubber), 66, L.coverY[1] + 10, cy.z),'lead-spark-plug',cy.i);
    mark(ring('plugLeads', 13.5, 1.5, [66, L.coverY[1] + 22, cy.z], [0, 1, 0], M.rubber),'lead-spark-plug',cy.i);
  });
  for (const z of [-105, 88]) {
    box('plugLeads', [32, 6, 8], [91, L.coverY[1] + 23, z], M.plasticPlain, 2);
  }
  // Separate ignition coil mounted by the thermostat/intake end, OEM coil bracket.
  const coilPos=[125,DECK+53,dz-43];
  mark(box('ignitionCoil',[52,54,48],coilPos,M.paintBlack,5),'coil-ignition');
  for(const x of [coilPos[0]-29,coilPos[0]+29]){box('ignitionCoil',[6,66,52],[x,coilPos[1],coilPos[2]],M.darkSteel,2);bolt('ignitionCoil',x,coilPos[1]+37,coilPos[2],'y',5);}
  annulus('distributor',9,5.3,23,[0,L.camY,dz-82],[0,0,1],M.paintBlack);
  mark(tube('plugLeads',[[0,L.camY,dz-95],[32,L.camY+34,dz-117],[92,DECK+89,dz-91],[125,DECK+79,dz-43]],4,M.rubber,null,36,10),'lead-ignition-center');
  connector('ignitionCoil',[151,DECK+60,dz-43],[16,22,24]);
  // Engine-side 5MT flywheel and clutch. Ring-gear tooth count, friction dimensions
  // and diaphragm finger count are illustrative; gearbox internals are excluded.
  const {flywheelZ,discZ,pressureZ,flywheelRadius,frictionRadius}=MANUAL;
  annulus('flywheel',flywheelRadius-5,22,19,[0,0,flywheelZ],[0,0,1],M.darkSteel);
  annulus('flywheel',frictionRadius+7,35,2,[0,0,flywheelZ-11],[0,0,1],M.steel);
  annulus('flywheel',flywheelRadius,flywheelRadius-8,11,[0,0,flywheelZ],[0,0,1],M.steel);
  for(let i=0;i<100;i++){const a=i/100*TAU;const tooth=box('flywheel',[4.2,7,10],[Math.cos(a)*(flywheelRadius+1),Math.sin(a)*(flywheelRadius+1),flywheelZ],M.darkSteel,.6);tooth.rotation.z=a-Math.PI/2;}
  for(let i=0;i<8;i++){const a=i/8*TAU;bolt('flywheel',Math.cos(a)*31,Math.sin(a)*31,flywheelZ-13,'z',5.5);}
  const friction=new THREE.MeshStandardMaterial({color:'#35302b',roughness:.97,metalness:.04});
  annulus('clutchDisc',frictionRadius,66,7,[0,0,discZ],[0,0,1],friction);
  annulus('clutchDisc',89,21,3,[0,0,discZ],[0,0,1],M.darkSteel);
  annulus('clutchDisc',23,13,24,[0,0,discZ],[0,0,1],M.steel);
  for(let i=0;i<6;i++){
    const a=i/6*TAU,x=Math.cos(a)*49,y=Math.sin(a)*49;
    const spring=at(add('clutchDisc',new THREE.CylinderGeometry(7,7,28,16),M.darkSteel),x,y,discZ-3);spring.rotation.z=a;
    for(let k=0;k<6;k++){const p=V(x,y,discZ-3).addScaledVector(V(-Math.sin(a),Math.cos(a),0),(k-2.5)*4);ring('clutchDisc',7.4,.9,p.toArray(),[-Math.sin(a),Math.cos(a),0],M.steel);}
  }
  for(let i=0;i<12;i++){const a=i/12*TAU;for(const r of [78,102])at(add('clutchDisc',cylZ(2.3,1,10),M.copper),Math.cos(a)*r,Math.sin(a)*r,discZ-4);}
  annulus('clutchPressurePlate',122,83,26,[0,0,pressureZ],[0,0,1],M.darkSteel);
  annulus('clutchPressurePlate',112,68,8,[0,0,pressureZ+14],[0,0,1],M.steel);
  annulus('clutchPressurePlate',92,75,3,[0,0,pressureZ-15],[0,0,1],M.steel);
  for(let i=0;i<18;i++){const a=i/18*TAU;const finger=box('clutchPressurePlate',[51,8,3],[Math.cos(a)*53,Math.sin(a)*53,pressureZ-17],M.steel,.7);finger.rotation.z=a;}
  for(let i=0;i<6;i++){const a=i/6*TAU;box('clutchPressurePlate',[17,17,6],[Math.cos(a)*124,Math.sin(a)*124,pressureZ+9],M.darkSteel,3);bolt('clutchPressurePlate',Math.cos(a)*124,Math.sin(a)*124,pressureZ+4,'z',5);}
  const updateIab = open => {
    const amount=THREE.MathUtils.clamp(Number(open)||0,0,1);
    for(const flap of flaps)flap.rotation.z=amount*Math.PI/2;
    lever.rotation.z=amount*Math.PI/2;
    const a=amount*Math.PI/2;
    const foot=V(bypassX+20*Math.cos(a),plateY+20*Math.sin(a),202);
    const head=V(bypassX+20,foot.y+Math.sqrt(42*42-(bypassX+20-foot.x)**2),202);
    const axis=head.clone().sub(foot);pullrod.position.copy(head).add(foot).multiplyScalar(.5);
    pullrod.quaternion.setFromUnitVectors(V(0,1,0),axis.normalize());
  };
  updateIab(0);
  return {updateIab};

}
