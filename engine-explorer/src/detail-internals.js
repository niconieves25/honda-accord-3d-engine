// F22A6 internal form refinement from the saved 1993 EX 5MT Honda OEM
// crankshaft/piston, cylinder-block, cylinder-head and valve/rocker-arm plates. These plates establish the assemblies and
// their construction, not manufacturing dimensions. Unspecified widths, fillets,
// pocket depths, clearances and fastener sizes below are qualitative drawing estimates.
// The original groups and update-owned objects are retained: every moving detail is
// still driven by the same crank angle in engine.js, with no second animation clock.
import * as THREE from 'three';
export function detailInternals(ctx) {
  const {G, M, add, at, tube, cylZ, L, CYL, DECK, ASSUMED, SPEC, crank, pistons, rockers, valves} = ctx;
  const V = THREE.Vector3;
  const TAU = Math.PI * 2;
  const replace = (mesh, geometry) => { mesh.geometry = geometry; return mesh; };
  const mark = (mesh, id, instance = 0) => {
    mesh.userData.catalogPiece = id; mesh.userData.catalogInstance = instance;
    mesh.name = `${id}:${instance}`; return mesh;
  };
  const clear = (group) => { while (group.children.length) group.remove(group.children[0]); };
  const plate = (shape, depth) => {
    const geo = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: false, curveSegments: 32});
    geo.translate(0, 0, -depth / 2);
    return geo;
  };
  // An actual open annulus rather than a dark disc painted onto a solid cylinder.
  const annulus = (outer, inner, depth, start = 0, span = TAU) => {
    const s = new THREE.Shape();
    if (span >= TAU - 0.0001) {
      s.absarc(0, 0, outer, 0, TAU, false);
      const h = new THREE.Path();
      h.absarc(0, 0, inner, 0, TAU, true);
      s.holes.push(h);
    } else {
      s.moveTo(outer * Math.cos(start), outer * Math.sin(start));
      s.absarc(0, 0, outer, start, start + span, false);
      s.lineTo(inner * Math.cos(start + span), inner * Math.sin(start + span));
      s.absarc(0, 0, inner, start + span, start, true);
      s.closePath();
    }
    return plate(s, depth);
  };
  const washerY = (id, outer, inner, depth, x, y, z, mat = M.steel, parent) => {
    const geo = annulus(outer, inner, depth);
    geo.rotateX(-Math.PI / 2);
    return at(add(id, geo, mat, parent), x, y, z);
  };
  const localBolt = (id, x, y, z, radius, length, parent, mat = M.darkSteel, catalogueId = null, instance = 0) => {
    const shank = at(add(id, new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, length, 10), M.steel, parent), x, y - length / 2, z);
    const head = at(add(id, new THREE.CylinderGeometry(radius, radius, 4, 6), mat, parent), x, y, z);
    if (catalogueId) { mark(shank, catalogueId, instance); mark(head, catalogueId, instance); }
    return head;
  };

  // ========================================================== piston assemblies
  // A6 OEM crankshaft_piston: 2 flat crown/reliefs, 1 compression rings + oil
  // rails/expander, 3 hollow gudgeon pin, 4/7 cap fasteners, 6 bearing shells.
  for (const p of pistons) {
    const comp = ASSUMED.pistonCompressionHeight;
    const outer = SPEC.bore / 2 - 0.6;
    clear(p.g);
    clear(p.rg);
    clear(p.pg);
    const profile = [
      [38, comp - 18.8], [outer, comp - 18.8],
      [outer, comp - 18], [40.3, comp - 18], [40.3, comp - 14], [outer, comp - 14],
      [outer, comp - 11.45], [40.3, comp - 11.45], [40.3, comp - 9.55], [outer, comp - 9.55],
      [outer, comp - 5.95], [40.3, comp - 5.95], [40.3, comp - 4.05], [outer, comp - 4.05],
      [outer, comp - 2.8], [35, comp - 2.8], [35, comp - 6], [38, comp - 18.8],
    ];
    add('pistons', new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 64), M.piston, p.g);
    // Thrust skirts leave the pin bosses and the underside open. The opening is an
    // explanatory approximation of the OEM skirt, not a measured casting pattern.
    const skirtProfile = [[38.4, -15], [outer - 0.15, -15], [outer, comp - 18.7], [38, comp - 18.7], [38.4, -15]];
    for (const phi of [Math.PI / 2 - 0.64, Math.PI * 1.5 - 0.64]) {
      add('pistons', new THREE.LatheGeometry(skirtProfile.map(([r, y]) => new THREE.Vector2(r, y)), 26, phi, 1.28), M.piston, p.g);
    }
    for (const z of [-25, 25]) {
      at(add('pistons', annulus(16.2, SPEC.wristPinDia / 2 + 0.06, 16), M.piston, p.g), 0, 0, z);
      for (const x of [-13, 13]) at(add('pistons', new THREE.BoxGeometry(5, 16, 16), M.piston, p.g), x, 9, z);
    }

    // A6 piston plate shows a substantially flat crown with local valve reliefs,
    // not the previous engine's large scalloped central dish. The four shallow
    // pockets are genuine recesses; their diameters/depths remain illustrative.
    const crown = new THREE.Shape();
    crown.absarc(0, 0, outer, 0, TAU, false);
    const pockets = [];
    for (const x of [-22,22]) for (const z of [-17,17]) {
      const radius = x > 0 ? 8.5 : 7.5;
      const hole = new THREE.Path();
      hole.absarc(x,z,radius,0,TAU,true);
      crown.holes.push(hole);
      pockets.push({x,z,radius});
    }
    const crownGeo = plate(crown,2.8);
    crownGeo.rotateX(-Math.PI/2);
    at(add('pistons',crownGeo,M.piston,p.g),0,comp-1.4,0);
    for (const {x,z,radius} of pockets) {
      at(add('pistons',new THREE.CylinderGeometry(radius,radius,1.8,32),M.piston,p.g),x,comp-1.9,z);
    }

    // Rectangular compression ring sections have visible end gaps. The third pack
    // contains two thin scraper rails and a corrugated expander, not a third torus.
    const ringAt = (y, width, phase, mat) => {
      const geo = annulus(SPEC.bore / 2 - 0.16, 40.45, width, phase, TAU - 0.012);
      geo.rotateX(-Math.PI / 2);
      return at(add('rings', geo, mat, p.rg), 0, y, 0);
    };
    mark(ringAt(comp - 5, 1.55, 0.25, M.steel), 'ring-top', p.cy.i);
    mark(ringAt(comp - 10.5, 1.55, 2.35, M.darkSteel), 'ring-second', p.cy.i);
    mark(ringAt(comp - 14.5, 0.55, 4.45, M.steel), 'ring-oil', p.cy.i);
    mark(ringAt(comp - 17.5, 0.55, 1.25, M.steel), 'ring-oil', p.cy.i);
    const wave = [];
    for (let k = 0; k <= 240; k++) {
      const a = 0.8 + k / 240 * (TAU - 0.035);
      wave.push(new V(41 * Math.cos(a), comp - 16 + 0.85 * Math.sin(k / 240 * TAU * 36), 41 * Math.sin(a)));
    }
    mark(add('rings', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wave), 240, 0.38, 5, false), M.darkSteel, p.rg), 'ring-oil', p.cy.i);

    // Pin axis must be parallel to the crank axis and the rod eyes: world z.
    // The previous x-axis pin passed sideways through the rod's small-end eye.
    add('wristPins', annulus(SPEC.wristPinDia / 2, 6.6, SPEC.bore - 14), M.steel, p.pg);
    for (const z of [-35.1, 35.1]) at(add('wristPins', annulus(11.05, 6.5, 0.7), M.darkSteel, p.pg), 0, 0, z);

    // Forged I-section. engine.js scales beam.y by rodLength-30 each frame, so its
    // mesh remains normalised; the ends meet the outer eyes without crossing bores.
    const beamShape = new THREE.Shape();
    const xy = [[-7,-6],[7,-6],[7,-3.5],[2.3,-3.5],[2.3,3.5],[7,3.5],[7,6],[-7,6],[-7,3.5],[-2.3,3.5],[-2.3,-3.5],[-7,-3.5]];
    xy.forEach(([x,z], i) => i ? beamShape.lineTo(x,z) : beamShape.moveTo(x,z));
    beamShape.closePath();
    const beamGeo = plate(beamShape, 0.92);
    beamGeo.rotateX(-Math.PI / 2);
    beamGeo.translate(0, 0.06, 0);
    const bp = beamGeo.attributes.position;
    for (let k = 0; k < bp.count; k++) bp.setX(k, bp.getX(k) * (1 - 0.18 * (bp.getY(k) + 0.4) / 0.92));
    beamGeo.computeVertexNormals();
    replace(p.beam, beamGeo);
    p.beam.material = M.forged;
    replace(p.big, annulus(31, 25.5, 20, 0.006, Math.PI - 0.012));
    p.big.material = M.forged;
    mark(add('rods', annulus(31, 25.5, 20, Math.PI + 0.006, Math.PI - 0.012), M.forged, p.big), 'connecting-rod-cap', p.cy.i);
    for (const [i, start] of [0.009, Math.PI + 0.009].entries()) mark(add('rods', annulus(SPEC.rodJournalDia / 2 + 1.45, SPEC.rodJournalDia / 2 + 0.08, 18, start, Math.PI - 0.018), M.steel, p.big), 'bearing-rod', p.cy.i * 2 + i);
    for (const x of [-33, 33]) {
      for (const y of [-5, 5]) {
        const lug = at(add('rods', new THREE.BoxGeometry(12, 9.5, 20), M.forged, p.big), x, y, 0);
        if (y < 0) mark(lug, 'connecting-rod-cap', p.cy.i);
      }
      localBolt('rods', x, 13.5, 0, 5.5, 30, p.big, M.steel, 'bolt-connecting-rod', p.cy.i * 2 + (x > 0 ? 1 : 0));
      at(add('rods', new THREE.CylinderGeometry(6.1, 6.1, 5, 6), M.darkSteel, p.big), x, -15, 0);
    }
    replace(p.small, annulus(16, 12.05, 20));
    p.small.material = M.forged;
    add('rods', annulus(12, SPEC.wristPinDia / 2 + 0.06, 20.2), M.brass, p.small);
  }

  // ========================================================== crank & main caps
  // Forged webs and polished bearing lands read separately; the actual oil holes
  // are represented as small recess mouths on the journal surfaces (path unverified).
  for (const mesh of crank.children) {
    if (mesh.geometry?.type === 'ExtrudeGeometry') mesh.material = M.darkSteel;
    const gp = mesh.geometry?.parameters;
    if (gp?.radiusTop === 24 || gp?.radiusTop === 25) {
      const r = gp.radiusTop;
      const recess = new THREE.Mesh(new THREE.CircleGeometry(1.75, 12), M.paintBlack);
      recess.userData.part = 'crankshaft';
      recess.position.set(0, r + 0.015, 0);
      recess.rotation.x = -Math.PI / 2;
      mesh.add(recess);
    }
  }
  // The OEM block plate has five independent main caps and an open reinforcing
  // bridge. A solid rectangular shelf would intersect the rotating counterweights.
  clear(G.bearingBridge);
  const z0 = L.blockZ[0], z1 = L.blockZ[1], zc = (z0 + z1) / 2;
  for (const x of [-80, 80]) at(add('bearingBridge', new THREE.BoxGeometry(24, 14, z1 - z0 - 20), M.cast), x, -52, zc);
  const cap = new THREE.Shape();
  cap.moveTo(-91, -34); cap.lineTo(-49, -34); cap.lineTo(-40, 0); cap.lineTo(-27, 0);
  cap.absarc(0, 0, 27, Math.PI, TAU, false);
  cap.lineTo(40, 0); cap.lineTo(49, -34); cap.lineTo(91, -34);
  cap.lineTo(91, -59); cap.lineTo(-91, -59); cap.closePath();
  for (const [i,z] of [192, 96, 0, -96, -192].entries()) {
    mark(at(add('bearingBridge', plate(cap, 22), M.cast), 0, 0, z), 'main-bearing-cap', i);
    mark(at(add('bearingBridge', annulus(26.9, SPEC.mainJournalDia / 2 + 0.08, 21, Math.PI, Math.PI), M.steel), 0, 0, z), 'bearing-main', i*2+1);
    // Ten physical half shells, two per documented main journal. The upper
    // half belongs to the block saddle, independently of the removable cap.
    mark(at(add('block', annulus(26.9, SPEC.mainJournalDia / 2 + 0.08, 21, 0, Math.PI), M.steel), 0, 0, z), 'bearing-main', i*2);
    for (const x of [-43, 43]) {
      at(add('bearingBridge', new THREE.CylinderGeometry(7, 7, 5, 6), M.darkSteel), x, -62, z);
      washerY('bearingBridge', 9, 4, 1.5, x, -59.7, z, M.steel);
    }
  }

  // ========================================================== camshaft holders
  // Journal holders surround the continuous exhaust and five-piece inlet shafts.
  // Holder envelope/spacing remain illustrative; shaft quantities follow A6 calls7/8/9.
  // Openings keep the stationary holders from filling the rotating shaft volume.
  const holder = new THREE.Shape();
  const y0 = L.camY - 19, y1 = L.rockY + 15;
  [[-49,y0],[-49,y1-4],[-45,y1],[45,y1],[49,y1-4],[49,y0]].forEach(([x,y], i) => i ? holder.lineTo(x,y) : holder.moveTo(x,y));
  holder.closePath();
  for (const [x,y,r] of [[0,L.camY,15.9],[-L.rockX,L.rockY,8.1],[L.rockX,L.rockY,8.1]]) {
    const hole = new THREE.Path(); hole.absarc(x,y,r,0,TAU,true); holder.holes.push(hole);
  }
  for (const [i,z] of [192, 96, 0, -96, -192].entries()) {
    mark(at(add('head', plate(holder, 12), M.castLight), 0, 0, z),'camshaft-holder',i);
    mark(at(add('head', annulus(15.85, 13.08, 12), M.steel), 0, L.camY, z),'camshaft-holder',i);
    for (const x of [-40, 40]) {
      localBolt('head', x, y1 + 3, z, 5.8, 42, G.head);
      washerY('head', 7.5, 3.4, 1.3, x, y1 + 0.6, z);
    }
    // Visible split between the holder and the lower head journal pedestal.
    for (const x of [-29,29]) at(add('head', new THREE.BoxGeometry(29, 0.65, 12.2), M.darkSteel), x, L.camY - 0.3, z);
  }

  // ========================================================== valve components
  for (const vv of valves) {
    const id = vv.kind === 'in' ? 'intakeValves' : 'exhaustValves';
    const instance = vv.cy.i * 2 + (vv.which === 'b' ? 1 : 0);
    const valveId = vv.kind === 'in' ? 'valve-inlet' : 'valve-exhaust';
    const stem = vv.g.children.find(m => m.geometry?.type === 'CylinderGeometry' && m.geometry.parameters.height === 80);
    if (stem) mark(stem, valveId, instance);
    mark(vv.coil, vv.kind === 'in' ? 'spring-valve-inlet' : 'spring-valve-exhaust', instance);
    const radius = vv.kind === 'in' ? 16 : 14;
    const face = vv.g.children.find(m => m.geometry?.type === 'CylinderGeometry' && m.geometry.parameters.height === 4);
    if (face) {
      replace(face, new THREE.LatheGeometry([[0,-1],[radius*0.96,-1],[radius,0],[radius,1],[4.2,5],[2.8,7],[0,7]].map(p => new THREE.Vector2(...p)), 36));
      face.position.y = 0;
      mark(face, valveId, instance);
    }
    const retainer = vv.g.children.find(m => m.geometry?.type === 'CylinderGeometry' && m.geometry.parameters.height === 3);
    if (retainer) mark(replace(retainer, new THREE.CylinderGeometry(12.8, 11.5, 3, 24)), 'retainer-valve', instance + (vv.kind === 'ex' ? 8 : 0));
    // Guides, stem seals and lower spring seats stay in the head while the valve
    // and its pair of split keepers travel with the retainer.
    const guide = washerY(id, 5.4, 2.86, 20, 0, 35, 0, M.brass, vv.sp);
    const seal = washerY(id, 6.4, 2.86, 5, 0, 47.5, 0, M.rubber, vv.sp);
    const sealBand = washerY(id, 6.5, 5.7, 1.2, 0, 49.2, 0, M.steel, vv.sp);
    if (vv.kind === 'in') { mark(guide, 'guide-valve', instance); mark(seal, 'seal-valve-stem', instance); mark(sealBand, 'seal-valve-stem', instance); }
    washerY(id, 13.2, 5.5, 1.8, 0, 41.2, 0, M.darkSteel, vv.sp);
    for (const [half, a] of [0.035, Math.PI + 0.035].entries()) {
      const geo = annulus(4.5, 2.8, 3.6, a, Math.PI - 0.07); geo.rotateX(-Math.PI / 2);
      mark(at(add(id, geo, M.steel, vv.g), 0, 76.4, 0), 'keepers-valve', (instance + (vv.kind === 'ex' ? 8 : 0)) * 2 + half);
    }
  }

  // All sixteen A6 valve rockers have their own mechanical clearance adjuster.
  for (const set of rockers) for (const [key,id] of [['inA','intakeRockers'],['inB','intakeRockers'],['exA','exhaustRockers'],['exB','exhaustRockers']]) {
    const rocker = set[key];
    for (const mesh of [...rocker.children]) {
      const p = mesh.geometry?.parameters;
      if (mesh.geometry?.type === 'CylinderGeometry' && p.radiusTop === 12) replace(mesh, annulus(12, 8.08, 12));
      if (mesh.geometry?.type === 'CylinderGeometry' && p.radiusTop === 3 && p.height === 12) {
        const q = mesh.position;
        const instance = `${set.cy.i}-${key}`;
        mark(mesh, 'screw-valve-lash', instance);
        mark(at(add(id, new THREE.CylinderGeometry(5.4, 5.4, 3.8, 6), M.steel, rocker), q.x, q.y + 1, q.z), 'nut-valve-lash', instance);
        mark(at(add(id, new THREE.BoxGeometry(3.6, 0.4, 0.7), M.darkSteel, rocker), q.x, q.y + 6.1, q.z), 'screw-valve-lash', instance);
      }
    }
  }
  // OEM rocker-arm springs: three long spacers and two shorter end springs on
  // the exhaust shaft, with five wave washers at the inlet shaft assembly.
  // Wire diameter/turn count and axial placement are illustrative.
  for (const [z,length,type,instance] of [[96,27,'spring-rocker-a',0],[0,27,'spring-rocker-a',1],[-96,27,'spring-rocker-a',2],[192,15,'spring-rocker-b',0],[-192,15,'spring-rocker-b',1]]) {
    const pts=[];
    for(let k=0;k<=72;k++) {
      const a=k/72*TAU*4;
      pts.push(new V(-L.rockX+10*Math.cos(a),L.rockY+10*Math.sin(a),z-length/2+k/72*length));
    }
    mark(add('rockerShafts',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),72,1.2,6,false),M.steel),type,instance);
  }
  for (const [i,z] of [192,96,0,-96,-192].entries()) {
    const geo=annulus(10.5,8.08,0.8);
    const p=geo.attributes.position;
    for(let k=0;k<p.count;k++) p.setZ(k,p.getZ(k)+0.45*Math.sin(Math.atan2(p.getY(k),p.getX(k))*3));
    geo.computeVertexNormals();
    mark(at(add('rockerShafts',geo,M.darkSteel),L.rockX,L.rockY,z+8),'washer-rocker-wave',i);
  }

  // ========================================================== pickup strainer
  // A shallow suction basket with an actual grille, as shown below the oil-pump
  // assembly, instead of a solid coin covering the intake opening.
  const basket = G.oilStrainer.children.find(m => m.geometry?.type === 'CylinderGeometry');
  if (basket) {
    const rim = [[36,-4],[42,-4],[42,2],[37,5],[16,5],[16,3],[36,3],[36,-4]];
    replace(basket, new THREE.LatheGeometry(rim.map(p => new THREE.Vector2(...p)), 48));
    for (let d = -30; d <= 30; d += 6) {
      const h = Math.sqrt(35.5 ** 2 - d ** 2);
      at(add('oilStrainer', new THREE.BoxGeometry(h * 2, 0.7, 0.7), M.darkSteel), 0, -113.6, 50 + d);
      at(add('oilStrainer', new THREE.BoxGeometry(0.7, 0.7, h * 2), M.darkSteel), d, -113.4, 50);
    }
    tube('oilStrainer', [[0,-105,50],[26,-89,65],[43,-58,96]], 3.2, M.steel, null, 18, 8);
    localBolt('oilStrainer', 43, -55, 96, 5.5, 7, G.oilStrainer);
  }
}
