// The F22A6 engine built from the 1993 EX 5MT OEM diagrams, in millimetres.
// Each mesh belongs to a named selectable assembly. update(theta, {iab, ...}) poses
// the fixed-profile engine from crank angle and the independent manifold bypass state.
//
// Axes: +z toward the timing-belt end (cylinder 1), y up, exhaust side -x, intake side +x. Sizes that are not Honda
// figures are qualified in engine-spec.js. The base envelope is illustrative shared-family layout;
// the detail passes replace assemblies using the active A6 references.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ASSUMED, balanceAngle, camAngle, CAM_LAYOUT, CYL, DECK, exhaustLift, iabPosition, intakeLift, LOBE, lobePeak, phase, piston, pinXY, PULLEY, R, SPEC, strokeOf, TDC} from './kin.js';
import {PARTS, PART} from './parts.js';
import {castBump, coverTop, ribs, rustShield} from './textures.js';
import {detailCastings} from './detail-castings.js';
import {detailExterior} from './detail-exterior.js';
import {detailInternals} from './detail-internals.js';
import {detailTiming} from './detail-timing.js';
import {detailComponents} from './detail-components.js';
import {consolidateStatic} from './consolidate-static.js';

const V3 = THREE.Vector3;
const V2 = THREE.Vector2;
const D2R = Math.PI / 180;
const v = (x, y, z) => new V3(x, y, z);

// layout (mm) — shared-family envelope estimates, not measured A6 manufacturing dimensions
export const L = {
  blockZ: [-250, 211],
  headZ: [-250, 211],
  camY: DECK + 62, // camshaft axis
  camBase: 16, // lobe base-circle radius (drawn)
  rockY: DECK + 86, // rocker-shaft axis height
  rockX: 26, // rocker shafts at ±26
  coverY: [DECK + 100, DECK + 155],
  beltZ: 222, // timing belt plane
  balZ: 211, // balancer belt plane
  accZ: [256, 270], // accessory belt planes: alternator, power steering
  crankPulleyZ: 263,
  wp: [52, 150], // water-pump pulley centre
  tens: [-46, 140], // timing-belt tensioner
  balF: [-72, 92], // front balance shaft
  balR: [70, 60], // rear balance shaft; reconstructed placement
  balDrive: [106, 60], // separate belt-driven input to rear reversing gearcase
  balAdj: [-46, -48], // balancer belt adjuster
  alt: [-176, 186, 168], // approximate alternator centre (x, y, z)
  psp: [-150, 305, 196], // power-steering pump centre (illustrative shared layout)
};
const zOf = (c) => CYL[c - 1].z;

// ------------------------------------------------------------ geometry helpers
/** convex hull of circles: the loop a belt takes round its pulleys (XY plane) */
function beltPath(circles, n = 64) {
  const pts = [];
  for (const [x, y, r] of circles) for (let i = 0; i < n; i++) pts.push([x + r * Math.cos((i / n) * Math.PI * 2), y + r * Math.sin((i / n) * Math.PI * 2)]);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const p of pts) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  const up = [];
  for (const p of pts.slice().reverse()) {
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/** a flat belt: a closed box-section strip following a loop in the XY plane at depth z */
function beltGeo(loop, z, width, thick) {
  const n = loop.length;
  const pos = [];
  const idx = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = loop[(i - 1 + n) % n];
    const [x1, y1] = loop[(i + 1) % n];
    let nx = y1 - y0;
    let ny = -(x1 - x0);
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    const [x, y] = loop[i];
    // inner and outer edges, front and back faces
    for (const [o, dz] of [[0, -width / 2], [thick, -width / 2], [thick, width / 2], [0, width / 2]]) pos.push(x + nx * o, y + ny * o, z + dz);
  }
  for (let i = 0; i < n; i++) {
    const a = i * 4;
    const b = ((i + 1) % n) * 4;
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4;
      idx.push(a + k, b + k, b + k2, a + k, b + k2, a + k2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const crv = (pts, closed = false) => new THREE.CatmullRomCurve3(pts.map((p) => (p.isVector3 ? p : v(...p))), closed, 'centripetal');
/** a cam lobe: base circle plus a nose whose profile matches the lift curve in kin.js (window w crank degrees) */
function lobeGeo(lift, win, thick) {
  const sh = new THREE.Shape();
  const h = 0.75 * lift * ASSUMED.liftScale;
  const half = (win[1] - win[0]) / 4; // cam degrees either side of the nose
  const N = 96;
  for (let k = 0; k <= N; k++) {
    const a = (k / N) * 360 - 180; // degrees from the nose
    const r = L.camBase + (Math.abs(a) < half ? h * Math.cos((Math.PI * a) / (2 * half)) ** 2 : 0);
    const x = -r * Math.sin(a * D2R);
    const y = r * Math.cos(a * D2R);
    k ? sh.lineTo(x, y) : sh.moveTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(sh, {depth: thick, bevelEnabled: false, curveSegments: 4});
  g.translate(0, 0, -thick / 2);
  return g;
}
function pulleyGeo(r, w, grooves = 0, seg = 48) {
  const pts = [new V2(0, -w / 2), new V2(r, -w / 2)];
  if (grooves) {
    for (let k = 0; k < grooves; k++) {
      const z0 = -w / 2 + ((k + 0.5) / grooves) * w;
      pts.push(new V2(r, z0 - w / grooves / 2 + 0.5), new V2(r - 2.2, z0), new V2(r, z0 + w / grooves / 2 - 0.5));
    }
  }
  pts.push(new V2(r, w / 2), new V2(0, w / 2));
  const g = new THREE.LatheGeometry(pts, seg);
  g.rotateX(Math.PI / 2);
  return g;
}

export function buildEngine(options = {}) {
  const mark=(mesh,id,instance=0)=>{mesh.userData.catalogPiece=id;mesh.userData.catalogInstance=instance;mesh.name=`${id}:${instance}`;return mesh;};
  const root = new THREE.Group();
  const bump = castBump();
  bump.repeat.set(3, 3);
  const M = {
    cast: new THREE.MeshStandardMaterial({color: '#8d9094', roughness: 0.8, metalness: 0.45, bumpMap: bump, bumpScale: 0.6}),
    castLight: new THREE.MeshStandardMaterial({color: '#9b9ea2', roughness: 0.74, metalness: 0.45, bumpMap: bump, bumpScale: 0.5}),
    cover: new THREE.MeshStandardMaterial({color: '#252729', roughness: 0.5, metalness: 0.55}),
    coverTop: new THREE.MeshStandardMaterial({color: '#ffffff', map: coverTop(), roughness: 0.5, metalness: 0.5}),
    plastic: new THREE.MeshStandardMaterial({color: '#232427', roughness: 0.62, metalness: 0.05, bumpMap: ribs(), bumpScale: 1.2}),
    plasticPlain: new THREE.MeshStandardMaterial({color: '#232427', roughness: 0.62, metalness: 0.05}),
    paintBlack: new THREE.MeshStandardMaterial({color: '#19191b', roughness: 0.42, metalness: 0.2}),
    rubber: new THREE.MeshStandardMaterial({color: '#141416', roughness: 0.9, metalness: 0}),
    shield: new THREE.MeshStandardMaterial({map: rustShield(), roughness: 0.7, metalness: 0.5, side: THREE.DoubleSide}),
    iron: new THREE.MeshStandardMaterial({color: '#5d4a3e', roughness: 0.85, metalness: 0.5, bumpMap: bump, bumpScale: 0.8}),
    steel: new THREE.MeshStandardMaterial({color: '#c4c7cc', roughness: 0.3, metalness: 1}),
    darkSteel: new THREE.MeshStandardMaterial({color: '#55585d', roughness: 0.45, metalness: 0.9}),
    rust: new THREE.MeshStandardMaterial({color: '#6f4a35', roughness: 0.75, metalness: 0.55}),
    pulley: new THREE.MeshStandardMaterial({color: '#5b4a40', roughness: 0.7, metalness: 0.6}),
    pulleyBright: new THREE.MeshStandardMaterial({color: '#a8aaa8', roughness: 0.5, metalness: 0.7}),
    piston: new THREE.MeshStandardMaterial({color: '#d2d4d7', roughness: 0.35, metalness: 0.85}),
    liner: new THREE.MeshStandardMaterial({color: '#7e8186', roughness: 0.4, metalness: 0.85, side: THREE.DoubleSide}),
    yellow: new THREE.MeshStandardMaterial({color: '#e8b44a', roughness: 0.5, metalness: 0}),
    copper: new THREE.MeshStandardMaterial({color: '#a8392a', roughness: 0.45, metalness: 0.6}),
    ceramic: new THREE.MeshStandardMaterial({color: '#efece6', roughness: 0.4, metalness: 0}),
    gasket: new THREE.MeshStandardMaterial({color: '#6c6f72', roughness: 0.4, metalness: 0.8}),
    oil: new THREE.MeshStandardMaterial({color: '#c98a14', roughness: 0.35, metalness: 0.2, emissive: '#c98a14', emissiveIntensity: 0}),
    brass: new THREE.MeshStandardMaterial({color: '#b8a06a', roughness: 0.4, metalness: 0.9}),
    forged: new THREE.MeshStandardMaterial({color: '#9fa3a8', roughness: 0.35, metalness: 0.95}),
  };
  // the shells that turn see-through in the lower-block and cutaway views
  const SHELL = new Set(['block', 'head', 'valveCover', 'oilPan', 'bearingBridge', 'timingCoverUpper', 'timingCoverLower', 'heatShield', 'exhaustManifold', 'plenum', 'runners']);

  const G = {};
  for (const p of PARTS) {
    const g = new THREE.Group();
    g.name = p.id;
    g.userData.part = p.id;
    root.add(g);
    G[p.id] = g;
  }
  const deco = new THREE.Group(); // wiring and small hoses: visible, not selectable
  root.add(deco);
  const add = (id, geo, mat, parent) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.part = id;
    (parent ?? (id ? G[id] : deco)).add(m);
    return m;
  };
  const at = (m, x, y, z) => (m.position.set(x, y, z), m);
  const tube = (id, pts, r, mat, parent, seg = 64, rs = 14) => add(id, new THREE.TubeGeometry(crv(pts), seg, r, rs, false), mat, parent);
  const cylZ = (r, len, seg = 32) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
  const cylX = (r, len, seg = 32) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
  const bolt = (id, x, y, z, axis = 'y', r = 6, mat = M.darkSteel) => {
    const g = new THREE.CylinderGeometry(r, r, 6, 6);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    return at(add(id, g, mat), x, y, z);
  };
  const Z0 = L.blockZ[0];
  const Z1 = L.blockZ[1];
  const BL = Z1 - Z0;
  const BZ = (Z0 + Z1) / 2;

  // ============================================================ block, bridge, oil pan, rear face
  add('block', new RoundedBoxGeometry(186, DECK - 40, BL, 2, 4), M.cast).position.set(0, (DECK + 40) / 2, BZ);
  add('block', new RoundedBoxGeometry(214, 108, BL, 2, 6), M.cast).position.set(0, 6, BZ);
  // ribs and main-bearing bulkheads on both faces, the water-jacket bulge on the exhaust face
  for (const z of [192, 96, 0, -96, -192]) {
    for (const s of [-1, 1]) at(add('block', new THREE.BoxGeometry(10, 150, 16), M.cast), s * 110, -10 + 40, z);
  }
  at(add('block', new RoundedBoxGeometry(10, 120, BL - 30, 2, 3), M.cast), -96, DECK - 70, BZ);
  at(add('block', new RoundedBoxGeometry(10, 110, BL - 30, 2, 3), M.cast), 96, DECK - 75, BZ);
  // alternator and pump mounting bosses
  at(add('block', new THREE.BoxGeometry(30, 60, 50), M.cast), -105, 70, 160);
  at(add('block', new THREE.BoxGeometry(24, 46, 40), M.cast), 104, 20, -40);
  // the rear (transmission) face: a wide flange with bolt bosses (illustrative shared layout)
  {
    const sh = new THREE.Shape();
    const pts = [[-150, -70], [-160, 40], [-128, 150], [-110, 228], [110, 228], [128, 150], [160, 40], [150, -70]];
    pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    sh.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 46, 0, Math.PI * 2, true);
    sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, {depth: 14, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 1});
    at(add('block', g, M.cast), 0, 0, Z0 - 14);
    for (const [x, y] of [[-140, -50], [-150, 40], [-120, 140], [-100, 215], [100, 215], [120, 140], [150, 40], [140, -50], [0, 200]]) bolt('block', x, y, Z0 - 16, 'z', 9, M.cast);
  }
  // bearing-cap bridge (the stiffener under the crank, photo 7) — shape approximate
  at(add('bearingBridge', new RoundedBoxGeometry(200, 26, BL - 14, 2, 4), M.cast), 0, -58, BZ);
  for (const z of [192, 96, 0, -96, -192]) at(add('bearingBridge', new THREE.BoxGeometry(206, 34, 22), M.cast), 0, -56, z);
  // oil pan: deep under the front and middle, shallower toward the transmission (illustrative shared layout)
  {
    const sh = new THREE.Shape();
    const pts = [[Z1 - 8, -71], [Z1 - 8, -104], [Z1 - 40, -122], [-110, -122], [-140, -104], [Z0 + 6, -100], [Z0 + 6, -71]];
    pts.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y)));
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {depth: 184, bevelEnabled: true, bevelSize: 5, bevelThickness: 5, bevelSegments: 2});
    g.translate(0, 0, -92);
    g.rotateY(-Math.PI / 2); // shape z→ world z, extrude → world x
    add('oilPan', g, M.paintBlack);
    at(add('oilPan', new RoundedBoxGeometry(206, 8, BL - 10, 1, 3), M.paintBlack), 0, -73, BZ);
    bolt('oilPan', 20, -127, 40, 'y', 9, M.darkSteel);
  }
  // cylinder liners (cast-iron sleeves), seen in the cutaway and the see-through block
  const liners = CYL.map((cy) => at(add('block', new THREE.CylinderGeometry(SPEC.bore / 2 + 2, SPEC.bore / 2 + 2, 128, 40, 1, true), M.liner), 0, DECK - 64, cy.z));

  // ============================================================ head (open-topped so the valvetrain shows), gasket
  {
    const [h0, h1] = L.headZ;
    const HL = h1 - h0;
    const HZ = (h0 + h1) / 2;
    at(add('headGasket', new THREE.BoxGeometry(206, 2, HL + 4), M.gasket), 0, DECK + 1, HZ);
    at(add('head', new RoundedBoxGeometry(230, 50, HL, 2, 4), M.castLight), 0, DECK + 27, HZ);
    for (const s of [-1, 1]) at(add('head', new RoundedBoxGeometry(10, 50, HL, 1, 3), M.castLight), s * 110, DECK + 75, HZ);
    for (const s of [-1, 1]) at(add('head', new RoundedBoxGeometry(230, 50, 10, 1, 3), M.castLight), 0, DECK + 75, s > 0 ? h1 - 5 : h0 + 5);
    // camshaft holders (five, at the main-bearing stations) carrying both rocker shafts
    for (const z of [192, 96, 0, -96, -192]) {
      at(add('head', new THREE.BoxGeometry(80, 40, 14), M.castLight), 0, L.camY + 6, Math.min(h1 - 14, z));
      at(add('head', new THREE.BoxGeometry(84, 10, 18), M.castLight), 0, L.rockY - 2, Math.min(h1 - 14, z));
    }
    // port flanges: exhaust at -x, intake at +x
    at(add('head', new THREE.BoxGeometry(10, 56, HL - 20), M.castLight), -119, DECK + 44, HZ);
    at(add('head', new THREE.BoxGeometry(10, 60, HL - 20), M.castLight), 119, DECK + 48, HZ);
  }

  // ============================================================ valve cover, oil cap, plug-lead boots
  {
    const [y0, y1] = L.coverY;
    const [h0, h1] = L.headZ;
    const CL = h1 - h0 - 4;
    const CZ = (h0 + h1) / 2;
    at(add('valveCover', new RoundedBoxGeometry(226, y1 - y0, CL, 6, 16), M.cover), 0, (y0 + y1) / 2, CZ);
    // the lettered top (texture: u along +z toward the timing end, v toward the intake side)
    const top = add('valveCover', new THREE.PlaneGeometry(CL - 40, 190), M.coverTop);
    top.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(0, 0, 1), v(1, 0, 0), v(0, 1, 0)));
    top.position.set(8, y1 + 0.3, CZ);
    // raised ribs along both long edges, base plug-well row, replaced by the A6 detail pass
    for (const s of [-1, 1]) at(add('valveCover', new RoundedBoxGeometry(8, 6, CL - 30, 1, 2), M.cover), s * 97, y1 + 1, CZ);
    for (const cy of CYL) {
      at(add('valveCover', new THREE.CylinderGeometry(19, 21, 10, 28), M.cover), -66, y1 + 3, cy.z);
      at(add('plugLeads', new THREE.CylinderGeometry(13, 15, 26, 24), M.rubber), -66, y1 + 16, cy.z);
    }
    for (const z of [192, 96, 0, -96, -192]) bolt('valveCover', -66, y1 + 4, z, 'y', 7, M.darkSteel);
    for (const z of [140, 0, -150]) bolt('valveCover', 84, y1 + 4, z, 'y', 7, M.darkSteel);
    for (const z of [-220, -60, 60, 180]) bolt('valveCover', 113, y0 + 10, z, 'x', 6, M.darkSteel);
    // base oil filler cap, replaced by the A6 detail pass (illustrative shared layout)
    at(add('oilCap', new THREE.CylinderGeometry(30, 30, 18, 36), M.paintBlack), 40, y1 + 10, 160);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI;
      const rib = add('oilCap', new THREE.BoxGeometry(56, 6, 5), M.paintBlack);
      rib.position.set(40, y1 + 21, 160);
      rib.rotation.y = a;
    }
  }

  // ============================================================ crankshaft, rods, pistons, rings, pins
  const crank = new THREE.Group();
  G.crankshaft.add(crank);
  {
    for (const z of [192, 96, 0, -96, -192]) {
      const j = add('crankshaft', cylZ(25, 24), M.steel, crank);
      j.position.z = z;
    }
    const web = (() => {
      const sh = new THREE.Shape();
      sh.moveTo(-58 * Math.sin(1.15), -58 * Math.cos(1.15));
      sh.absarc(0, 0, 58, -Math.PI / 2 - 1.15, -Math.PI / 2 + 1.15, false);
      sh.lineTo(24, 4);
      sh.absarc(0, R, 26, 0, Math.PI, false);
      sh.lineTo(-24, 4);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {depth: 14, bevelEnabled: true, bevelThickness: 1.5, bevelSize: 1.5, bevelSegments: 1, curveSegments: 20});
      g.translate(0, 0, -7);
      return g;
    })();
    CYL.forEach((cy) => {
      for (const dz of [-22, 22]) {
        const w = add('crankshaft', web, M.steel, crank);
        w.position.z = cy.z + dz;
        w.rotation.z = cy.pinPhase * D2R;
        w.userData.phase = cy.pinPhase;
      }
      const pin = add('crankshaft', cylZ(24, 32), M.steel, crank);
      // pin offset in crank-local coordinates: at phase 0 the pin is straight up
      const a = cy.pinPhase * D2R;
      pin.position.set(-R * Math.sin(a), R * Math.cos(a), cy.z);
    });
    add('crankshaft', cylZ(19, 90), M.steel, crank).position.z = 245; // snout through the front pulleys
  }
  // rear flange with eight bolts (illustrative shared layout)
  const flange = new THREE.Group();
  flange.position.z = Z0 - 22;
  G.crankFlange.add(flange);
  add('crankFlange', cylZ(42, 14), M.rust, flange);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    add('crankFlange', cylZ(6, 18, 6), M.rust, flange).position.set(Math.cos(a) * 28, Math.sin(a) * 28, -4);
  }

  const pistons = CYL.map((cy) => {
    const g = new THREE.Group();
    g.position.z = cy.z;
    G.pistons.add(g);
    const comp = ASSUMED.pistonCompressionHeight;
    at(add('pistons', new THREE.CylinderGeometry(SPEC.bore / 2 - 0.5, SPEC.bore / 2 - 0.5, 46, 40), M.piston, g), 0, comp - 23, 0);
    // valve reliefs as a slightly domed crown
    at(add('pistons', new THREE.CylinderGeometry(SPEC.bore / 2 - 6, SPEC.bore / 2 - 0.5, 2, 40), M.piston, g), 0, comp + 1, 0);
    const rg = new THREE.Group();
    G.rings.add(rg);
    for (let k = 0; k < 3; k++) {
      const r = add('rings', new THREE.TorusGeometry(SPEC.bore / 2 - 0.2, k === 2 ? 1.6 : 1.1, 6, 40), k === 2 ? M.darkSteel : M.steel, rg);
      r.rotation.x = Math.PI / 2;
      r.position.y = comp - 5 - k * 5.5;
    }
    const pg = new THREE.Group();
    G.wristPins.add(pg);
    add('wristPins', cylX(SPEC.wristPinDia / 2, SPEC.bore - 14, 16), M.steel, pg);
    const rod = new THREE.Group();
    G.rods.add(rod);
    const beam = add('rods', new THREE.BoxGeometry(16, 1, 12), M.darkSteel, rod);
    const big = add('rods', cylZ(30, 20, 28), M.darkSteel, rod);
    const small = add('rods', cylZ(15, 20, 20), M.darkSteel, rod);
    return {g, rg, pg, rod, beam, big, small, cy};
  });

  // ============================================================ balance shafts
  const balancer = (id, [x, y]) => {
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    G[id].add(g);
    add(id, cylZ(10, 400), M.steel, g).position.z = 0;
    // off-centre weights: half-discs along the shaft (positions approximate)
    for (const z of [150, -150, 30]) {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, 26, 0, Math.PI, false);
      sh.closePath();
      const w = add(id, new THREE.ExtrudeGeometry(sh, {depth: 40, bevelEnabled: false, curveSegments: 16}), M.darkSteel, g);
      w.position.z = z - 20;
    }
    return g;
  };
  const balF = balancer('balancerFront', L.balF);
  const balR = balancer('balancerRear', L.balR);
  // the rear shaft's drive gear at the front, in the oil-pump gear case (layout approximate)
  const balRGear = add('balancerRear', cylZ(18, 12, 24), M.darkSteel);
  balRGear.position.set(L.balR[0], L.balR[1], 196);

  const balInputGear=add('balancerRear',cylZ(18,12,24),M.darkSteel);
  balInputGear.position.set(...L.balDrive,196);
  // Two meshing gears reverse the rear shaft. No front-shaft-to-rear-shaft link.
  const caseShape=new THREE.Shape();caseShape.moveTo(49,34);caseShape.lineTo(124,34);caseShape.lineTo(131,84);caseShape.lineTo(49,84);caseShape.closePath();
  for(const x of [L.balR[0],L.balDrive[0]]){const h=new THREE.Path();h.absarc(x,60,19,0,Math.PI*2,true);caseShape.holes.push(h);}
  const caseGeo=new THREE.ExtrudeGeometry(caseShape,{depth:17,bevelEnabled:false});
  at(add('balancerRear',caseGeo,M.cast),0,0,186);

  // ============================================================ timing drive (front): pulleys, belts, tensioners
  const crankTiming = add('crankTimingPulley', pulleyGeo(PULLEY.crankTiming / 2, 22, 8, 40), M.steel);
  crankTiming.position.z = L.beltZ;
  const camPulley = new THREE.Group();
  camPulley.position.set(0, L.camY, L.beltZ);
  G.camPulley.add(camPulley);
  add('camPulley', pulleyGeo(PULLEY.camTiming / 2, 22, 10, 64), M.steel, camPulley);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    add('camPulley', cylZ(9, 24, 16), M.darkSteel, camPulley).position.set(Math.cos(a) * 30, Math.sin(a) * 30, 0);
  }
  const wpPulley = add('waterPump', pulleyGeo(PULLEY.waterPump / 2, 20, 6, 36), M.steel);
  wpPulley.position.set(L.wp[0], L.wp[1], L.beltZ);
  at(add('waterPump', cylZ(36, 30), M.cast), L.wp[0], L.wp[1], L.beltZ - 26);
  const tens = add('timingTensioner', pulleyGeo(26, 20), M.steel);
  tens.position.set(L.tens[0], L.tens[1], L.beltZ);
  at(add('timingTensioner', new THREE.BoxGeometry(20, 50, 6), M.darkSteel), L.tens[0] - 10, L.tens[1] - 30, L.beltZ - 14);
  add('timingBelt', beltGeo(beltPath([[0, 0, PULLEY.crankTiming / 2], [L.wp[0], L.wp[1], PULLEY.waterPump / 2], [0, L.camY, PULLEY.camTiming / 2], [L.tens[0], L.tens[1], 26]]), L.beltZ, 22, 4), M.rubber);
  // balancer belt behind it: crank pulley twice the size of the front balance-shaft pulley (2 : 1)
  const crankBal = add('balancerBelt', pulleyGeo(PULLEY.crankBalancer / 2, 14, 6, 40), M.steel);
  crankBal.position.z = L.balZ;
  const balFPulley = add('balancerBelt', pulleyGeo(PULLEY.balancer / 2, 14, 4, 28), M.steel);
  balFPulley.position.set(L.balF[0], L.balF[1], L.balZ);
  const balInputPulley=add('balancerBelt',pulleyGeo(PULLEY.balancer/2,14,4,28),M.steel);
  balInputPulley.position.set(...L.balDrive,L.balZ);
  const balAdj = add('balancerAdjuster', pulleyGeo(18, 14), M.steel);
  balAdj.position.set(L.balAdj[0], L.balAdj[1], L.balZ);
  add('balancerBelt', beltGeo(beltPath([[0, 0, PULLEY.crankBalancer / 2], [L.balF[0], L.balF[1], PULLEY.balancer / 2], [L.balDrive[0],L.balDrive[1],PULLEY.balancer/2], [L.balAdj[0], L.balAdj[1], 18]]), L.balZ, 14, 3.5), M.rubber);
  // oil pump: a housing round the crank snout, its gear case reaching to the rear balance shaft
  at(add('oilPump', cylZ(66, 14, 40), M.cast), 0, -8, 200);
  at(add('oilPump', new RoundedBoxGeometry(70, 46, 14, 1, 6), M.cast), 45, -30, 200);

  // timing covers: black ribbed plastic (illustrative shared layout)
  {
    const up = add('timingCoverUpper', new RoundedBoxGeometry(150, 120, 30, 4, 14), M.plastic);
    up.position.set(4, L.camY + 24, 238);
    const lo = add('timingCoverLower', new RoundedBoxGeometry(200, 250, 34, 4, 18), M.plastic);
    lo.position.set(2, 98, 240);
    at(add('timingCoverLower', new RoundedBoxGeometry(150, 66, 34, 4, 18), M.plastic), 10, -40, 242);
    at(add('timingCoverLower', cylZ(22, 14), M.plasticPlain), 52, 70, 260); // round boss (illustrative shared layout)
    at(add('timingCoverLower', new THREE.BoxGeometry(22, 30, 10), M.plasticPlain), -30, 110, 258);
  }
  // engine mounting bracket with its stud (illustrative shared layout)
  at(add('engineMount', new RoundedBoxGeometry(84, 34, 26, 2, 4), M.rust), 46, 196, 262);
  at(add('engineMount', new THREE.CylinderGeometry(6, 6, 70, 12), M.darkSteel), 46, 246, 266);
  for (const x of [20, 72]) bolt('engineMount', x, 196, 276, 'z', 8, M.darkSteel);

  // ============================================================ crank pulley and accessories
  const crankPulley = new THREE.Group();
  crankPulley.position.z = L.crankPulleyZ;
  G.crankPulley.add(crankPulley);
  add('crankPulley', pulleyGeo(PULLEY.crank / 2, 30, 8, 64), M.pulley, crankPulley);
  add('crankPulley', cylZ(28, 34, 6), M.darkSteel, crankPulley).position.z = 4;
  // alternator: finned case with red windings in the vents (illustrative shared layout)
  const alt = new THREE.Group();
  alt.position.set(L.alt[0], L.alt[1], L.alt[2]);
  G.alternator.add(alt);
  {
    add('alternator', cylZ(58, 74, 40), M.castLight, alt);
    add('alternator', cylZ(52, 70, 32), M.copper, alt).position.z = 12;
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      const fin = add('alternator', new THREE.BoxGeometry(6, 9, 40), M.castLight, alt);
      fin.position.set(Math.cos(a) * 57, Math.sin(a) * 57, 30);
      fin.rotation.z = a;
    }
    add('alternator', cylZ(60, 8, 40), M.castLight, alt).position.z = 50;
    add('alternator', cylZ(56, 8, 40), M.castLight, alt).position.z = -40;
    add('alternator', cylZ(24, 26, 16), M.paintBlack, alt).position.set(-30, 30, -50); // rear terminal boot
    add('alternator', new THREE.BoxGeometry(24, 70, 18), M.castLight, alt).position.set(40, -60, 0);
  }
  const altPulley = add('alternator', pulleyGeo(PULLEY.alternator / 2, 22, 6, 32), M.pulley);
  altPulley.position.set(L.alt[0], L.alt[1], L.accZ[0]);
  add('alternator', cylZ(12, 70), M.steel).position.set(L.alt[0], L.alt[1], L.accZ[0] - 40);
  // power-steering pump: body, bracket, holed pulley (illustrative shared layout)
  const psp = new THREE.Group();
  psp.position.set(L.psp[0], L.psp[1], L.psp[2]);
  G.psPump.add(psp);
  add('psPump', cylZ(40, 60, 32), M.castLight, psp);
  add('psPump', new RoundedBoxGeometry(60, 50, 50, 2, 6), M.castLight, psp).position.set(10, -30, -10);
  add('psPump', new THREE.BoxGeometry(30, 90, 12), M.paintBlack, psp).position.set(30, -50, -40);
  const psPulley = new THREE.Group();
  psPulley.position.set(L.psp[0], L.psp[1], L.accZ[1]);
  G.psPump.add(psPulley);
  {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, PULLEY.powerSteering / 2, 0, Math.PI * 2, false);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const h = new THREE.Path();
      h.absarc(Math.cos(a) * 30, Math.sin(a) * 30, 9, 0, Math.PI * 2, true);
      sh.holes.push(h);
    }
    const disc = new THREE.ExtrudeGeometry(sh, {depth: 4, bevelEnabled: false, curveSegments: 24});
    disc.translate(0, 0, -2);
    add('psPump', disc, M.pulleyBright, psPulley);
    add('psPump', pulleyGeo(PULLEY.powerSteering / 2, 16, 4, 48), M.pulleyBright, psPulley).scale.set(1, 1, 1);
    add('psPump', cylZ(12, 14, 6), M.rust, psPulley).position.z = 6;
  }
  // accessory belts: crank → alternator, crank → power steering
  add('accessoryBelts', beltGeo(beltPath([[0, 0, PULLEY.crank / 2], [L.alt[0], L.alt[1], PULLEY.alternator / 2]]), L.accZ[0], 18, 4), M.rubber);
  add('accessoryBelts', beltGeo(beltPath([[0, 0, PULLEY.crank / 2], [L.psp[0], L.psp[1], PULLEY.powerSteering / 2]]), L.accZ[1], 13, 4), M.rubber);
  // power-steering hose looping over the timing end to the intake side (illustrative shared layout)
  tube('psHose', [[L.psp[0] + 30, L.psp[1] + 30, 186], [-40, DECK + 140, 214], [80, DECK + 120, 236], [138, DECK + 20, 250], [150, 80, 262], [160, -80, 270], [175, -125, 250]], 10, M.rubber, null, 96);
  // dipstick: tube and yellow loop (illustrative shared layout)
  tube('dipstick', [[-62, 60, 188], [-58, 200, 196], [-55, DECK + 60, 206], [-54, DECK + 100, 208]], 4, M.steel, null, 32, 8);
  {
    const loop = add('dipstick', new THREE.TorusGeometry(14, 3.5, 8, 24), M.yellow);
    loop.position.set(-54, DECK + 116, 208);
  }

  // ============================================================ intake: duct, throttle body, plenum, runners, rail, injectors
  {
    const PX = 220;
    const PY = DECK + 48;
    at(add('plenum', new RoundedBoxGeometry(78, 82, 420, 4, 20), M.cast), PX, PY, -44);
    at(add('plenum', new RoundedBoxGeometry(86, 12, 400, 2, 4), M.cast), PX + 2, PY + 40, -44);
    for (const cy of CYL) {
      tube('runners', [[121, DECK + 50, cy.z], [165, DECK + 34, cy.z], [211, DECK - 34, cy.z * 0.98], [247, DECK - 10, cy.z * 0.96], [241, DECK + 22, cy.z * 0.95], [PX, PY, cy.z * 0.94]], 21, M.cast, null, 56, 16);
      at(add('runners', new THREE.BoxGeometry(14, 60, 62), M.cast), 127, DECK + 50, cy.z);
    }
    // throttle body at the transmission end, the corrugated duct rising and crossing the end (illustrative shared layout)
    at(add('throttleBody', cylZ(34, 46, 32), M.castLight), PX, PY + 6, -284);
    at(add('throttleBody', new THREE.BoxGeometry(30, 44, 24), M.paintBlack), PX + 38, PY + 10, -280);
    at(add('throttleBody', new THREE.BoxGeometry(14, 30, 30), M.paintBlack), PX - 38, PY + 20, -288);
    const ductPts = [[PX, PY + 6, -308], [PX - 10, PY + 30, -340], [170, DECK + 112, -356], [90, DECK + 122, -360], [40, DECK + 118, -380], [30, DECK + 114, -410]];
    const dc = crv(ductPts);
    add('intakeDuct', new THREE.TubeGeometry(dc, 80, 38, 24, false), M.rubber);
    for (let k = 1; k < 26; k++) {
      const u = k / 26;
      const ring = add('intakeDuct', new THREE.TorusGeometry(39, 3, 6, 28), M.rubber);
      ring.position.copy(dc.getPointAt(u));
      ring.quaternion.setFromUnitVectors(v(0, 0, 1), dc.getTangentAt(u));
    }
    const mouth = add('intakeDuct', new THREE.TorusGeometry(40, 7, 10, 32), M.rubber);
    mouth.position.copy(dc.getPointAt(1));
    mouth.quaternion.setFromUnitVectors(v(0, 0, 1), dc.getTangentAt(1));
    // a resonator box on the duct
    at(add('intakeDuct', new RoundedBoxGeometry(150, 46, 60, 3, 14), M.rubber), 110, DECK + 160, -350);
    // the second, smaller opening beside it (illustrative shared layout)
    const d2 = crv([[150, DECK + 40, -320], [140, DECK + 50, -360], [130, DECK + 54, -400]]);
    add('intakeDuct', new THREE.TubeGeometry(d2, 24, 24, 20, false), M.rubber);
    const m2 = add('intakeDuct', new THREE.TorusGeometry(25, 5, 8, 28), M.rubber);
    m2.position.copy(d2.getPointAt(1));
    // fuel rail with the pressure regulator at the transmission end, injectors under it into the runner ends
    mark(at(add('fuelRail', new THREE.BoxGeometry(18, 18, 390), M.castLight), 140, DECK + 82, -30),'rail-fuel');
    at(add('fuelRail', cylZ(13, 34, 20), M.steel), 140, DECK + 82, -242);
    mark(tube('fuelRail', [[140, DECK + 82, 170], [152, DECK + 100, 200], [162, DECK + 90, 230]], 4, M.steel, null, 16, 8),'rail-fuel');
    for (const cy of CYL) {
      const inj = add('injectors', new THREE.CylinderGeometry(7, 6, 44, 16), M.paintBlack);
      inj.position.set(137, DECK + 60, cy.z);
      inj.rotation.z = 0.35;
      at(add('injectors', new THREE.BoxGeometry(14, 10, 18), M.rubber), 145, DECK + 78, cy.z + 14);
    }
  }
  // wiring loom along the intake side and over the top (illustrative shared layout) — decoration, not selectable
  tube(null, [[165, DECK + 110, 200], [165, DECK + 112, 80], [161, DECK + 108, -60], [165, DECK + 104, -200], [135, DECK + 120, -250]], 7, M.rubber, null, 48, 8);
  tube(null, [[165, DECK + 20, 230], [185, DECK - 60, 200], [195, DECK - 90, 60], [191, DECK - 80, -120]], 6, M.rubber, null, 48, 8);

  // ============================================================ exhaust: manifold under the rusty heat shield, coolant outlet
  {
    const col = [-176, 20, -22];
    for (const cy of CYL) {
      tube('exhaustManifold', [[-119, DECK + 44, cy.z], [-148, DECK + 36, cy.z * 0.95], [-162, DECK - 30, cy.z * 0.75], [-172, DECK - 120, cy.z * 0.35 - 14], col], 19, M.iron, null, 48, 14);
      at(add('exhaustManifold', new THREE.BoxGeometry(14, 52, 56), M.iron), -127, DECK + 44, cy.z);
    }
    at(add('exhaustManifold', new THREE.CylinderGeometry(26, 24, 60, 24), M.iron), col[0], col[1], col[2]);
    at(add('exhaustManifold', new THREE.CylinderGeometry(40, 40, 10, 3), M.iron), col[0], col[1] - 34, col[2]);
    // the heat shield: a curved sheet over the manifold, wide at the head, narrowing to the collector (illustrative shared layout)
    const NU = 28;
    const NV = 36;
    const pos = [];
    const uv = [];
    const idx = [];
    const sm = (a, b, x) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    for (let j = 0; j <= NV; j++) {
      const t = j / NV;
      const y = DECK + 78 + (-8 - (DECK + 78)) * t;
      const s = sm(0.08, 0.78, t);
      const half = 150 * (1 - s) + 46 * s;
      const zc = -38 + 16 * s;
      const out = 128 + 74 * sm(0, 0.35, t);
      for (let i = 0; i <= NU; i++) {
        const u = (i / NU) * 2 - 1;
        pos.push(-(out + 16 * (1 - u * u)), y, zc + u * half);
        uv.push(i / NU, t);
      }
    }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i;
      const b = a + NU + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    add('heatShield', g, M.shield);
    for (const [y, z] of [[DECK + 30, -110], [DECK + 30, 30], [100, -70]]) bolt('heatShield', -214, y, z, 'x', 7, M.rust);
    // coolant outlet at the transmission end of the head with its hose stub (illustrative shared layout)
    at(add('coolantOutlet', new RoundedBoxGeometry(40, 50, 44, 2, 8), M.castLight), -131, DECK + 46, -226);
    tube('coolantOutlet', [[-145, DECK + 44, -226], [-180, DECK + 38, -240], [-204, DECK + 30, -252]], 17, M.rubber, null, 16, 16);
  }

  // ============================================================ ignition: distributor at the transmission end, leads, plugs
  const distRotor = new THREE.Group();
  {
    const dz = L.headZ[0];
    at(add('distributor', cylZ(30, 40, 32), M.castLight), 0, L.camY, dz - 20);
    at(add('distributor', cylZ(40, 34, 32), M.paintBlack), 0, L.camY, dz - 56);
    distRotor.position.set(0, L.camY, dz - 50);
    G.distributor.add(distRotor);
    add('distributor', new THREE.BoxGeometry(6, 26, 6), M.brass, distRotor).position.y = 10;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      at(add('distributor', cylZ(7, 16, 12), M.paintBlack), Math.cos(a) * 24, L.camY + Math.sin(a) * 24, dz - 78);
    }
    // leads from the cap along the intake edge of the cover to each plug boot (illustrative shared layout)
    CYL.forEach((cy, k) => {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const sx = Math.cos(a) * 24;
      const sy = L.camY + Math.sin(a) * 24;
      tube('plugLeads', [[sx, sy, dz - 86], [sx - 30, L.coverY[1] + 30 + k * 4, dz - 90], [88 + k * 5, L.coverY[1] + 18 + k * 3, dz + 20], [90, L.coverY[1] + 30, cy.z - 30], [66, L.coverY[1] + 30, cy.z]], 3.6, M.rubber, null, 64, 8);
    });
  }
  const plugAxis = new V3(66, L.coverY[1] - 30 - DECK, 0).normalize(); // from the chamber centre up to the boot
  for (const cy of CYL) {
    const g = new THREE.Group();
    g.position.set(6, DECK + 6, cy.z);
    g.quaternion.setFromUnitVectors(v(0, 1, 0), plugAxis);
    G.sparkPlugs.add(g);
    at(add('sparkPlugs', new THREE.CylinderGeometry(5, 5, 20, 12), M.steel, g), 0, 10, 0);
    at(add('sparkPlugs', new THREE.CylinderGeometry(8, 8, 8, 6), M.steel, g), 0, 24, 0);
    at(add('sparkPlugs', new THREE.CylinderGeometry(5.5, 5.5, 40, 16), M.ceramic, g), 0, 48, 0);
  }
  const sparks = CYL.map((cy) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({color: '#ffe066', transparent: true, opacity: 0, depthWrite: false}));
    s.position.set(4, DECK + 2, cy.z);
    s.userData.part = 'sparkPlugs';
    s.userData.fx = true;
    G.sparkPlugs.add(s);
    return s;
  });

  // ============================================================ fixed SOHC valvetrain
  const cam = new THREE.Group();
  cam.position.set(0, L.camY, 0);
  G.camshaft.add(cam);
  add('camshaft', cylZ(13, L.headZ[1] - L.headZ[0] + 20, 20), M.steel, cam).position.z = (L.headZ[0] + L.headZ[1]) / 2;
  const LZ = Object.fromEntries(CAM_LAYOUT.map(track => [track.key, track.offsetMm]));
  const lobes = [];
  for (const cy of CYL) for (const track of CAM_LAYOUT) {
    const lg = new THREE.Group();
    lg.name = `cam-track-${cy.c}-${track.key}`;
    lg.userData.profile = track.profile;
    lg.userData.evidence = track.classification;
    lg.position.z = cy.z + track.offsetMm;
    lg.rotation.z = -camAngle(TDC[cy.c] + lobePeak(track.profile)) * D2R;
    cam.add(lg);
    add('camshaft', lobeGeo(LOBE[track.profile].lift, LOBE[track.profile].win, track.widthMm), M.steel, lg);
    lobes.push({lg, cy, lobe: track.profile, key: track.key});
  }
  // A6 OEM head: one full exhaust shaft, TWO short inlet shafts plus THREE long
  // inlet shafts. Inlet sections sit in the five holders, with gaps between them.
  // Segment lengths/locations are illustrative; the topology and quantities are OEM.
  mark(at(add('rockerShafts', cylZ(8, L.headZ[1] - L.headZ[0] - 10, 24), M.steel), -L.rockX, L.rockY, (L.headZ[0] + L.headZ[1]) / 2), 'shaft-exhaust-rockers');
  for (const [i,z] of [172,-172].entries()) mark(at(add('rockerShafts', cylZ(8,56,24), M.steel), L.rockX,L.rockY,z), 'shaft-inlet-rockers-a', i);
  for (const [i,z] of [96,0,-96].entries()) mark(at(add('rockerShafts', cylZ(8,84,24), M.steel), L.rockX,L.rockY,z), 'shaft-inlet-rockers-b', i);

  // valves: tilted in the pent roof; d = unit vector from the valve head up the stem
  const tilt = ASSUMED.valveTilt * D2R;
  const valves = [];
  const springs = [];
  const valveGroup = (id, x0, z, side) => {
    const dir = v(side * Math.sin(tilt), Math.cos(tilt), 0);
    const g = new THREE.Group();
    g.position.set(x0, DECK + ASSUMED.valveSeatAboveDeck, z);
    g.quaternion.setFromUnitVectors(v(0, 1, 0), dir);
    G[id].add(g);
    at(add(id, new THREE.CylinderGeometry(2.8, 2.8, 80, 10), M.steel, g), 0, 40, 0);
    at(add(id, new THREE.CylinderGeometry(side > 0 ? 16 : 14, 4, 4, 28), M.steel, g), 0, 1, 0);
    // spring and retainer stay with the head; they compress as the valve opens
    const sp = new THREE.Group();
    sp.position.set(x0, DECK + ASSUMED.valveSeatAboveDeck, z);
    sp.quaternion.copy(g.quaternion);
    G[id].add(sp);
    const pts = [];
    for (let k = 0; k <= 140; k++) {
      const a = (k / 140) * 7 * Math.PI * 2;
      pts.push(v(Math.cos(a) * 11, (k / 140) * 30, Math.sin(a) * 11));
    }
    const coil = add(id, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 140, 1.6, 6, false), M.steel, sp);
    coil.position.y = 42;
    const ret = add(id, new THREE.CylinderGeometry(9, 9, 3, 16), M.darkSteel, g);
    ret.position.y = 74;
    return {g, sp, coil, dir, x0, z, side};
  };
  CYL.forEach((cy) => {
    for (const [k, dz] of [['a', 17], ['b', -17]]) {
      valves.push({...valveGroup('intakeValves', 22, cy.z + dz, 1), kind: 'in', which: k, cy});
      valves.push({...valveGroup('exhaustValves', -22, cy.z + dz, -1), kind: 'ex', which: k, cy});
    }
  });
  // where a valve tip sits (top of the stem), for the rocker arms
  const tipOf = (x0, side) => [x0 + side * Math.sin(tilt) * 76, DECK + ASSUMED.valveSeatAboveDeck + Math.cos(tilt) * 76];
  /** a rocker arm on a shaft: pad over the cam lobe at padZ, tip over the valve (or plunger) at tipZ */
  const rocker = (id, side, padZ, tipXY, tipZ, mat = M.darkSteel) => {
    const g = new THREE.Group();
    g.position.set(side * L.rockX, L.rockY, 0);
    G[id].add(g);
    const pad = v(side * (8 - L.rockX), L.camY + L.camBase + 2 - L.rockY, padZ);
    const tip = v(tipXY[0] - side * L.rockX, tipXY[1] + 3 - L.rockY, tipZ);
    const hub = v(0, 0, (padZ + tipZ) / 2);
    const bar = (a, b, w, h) => {
      const d = new V3().subVectors(b, a);
      const m = add(id, new THREE.BoxGeometry(w, h, d.length()), mat, g);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.lookAt(g.position.clone().add(m.position).add(d));
      return m;
    };
    bar(hub, pad, 11, 10);
    bar(hub, tip, 11, 9);
    add(id, cylZ(12, 12, 16), mat, g).position.copy(hub);
    add(id, new THREE.BoxGeometry(14, 5, 12), M.steel, g).position.copy(pad).add(v(0, -2, 0));
    add(id, new THREE.CylinderGeometry(3, 3, 12, 8), M.steel, g).position.copy(tip).add(v(0, 4, 0)); // tappet screw
    return g;
  };
  const rockers = [];
  for (const cy of CYL) {
    const ti = tipOf(22, 1), te = tipOf(-22, -1);
    const inA = rocker('intakeRockers', 1, cy.z + LZ.inA, ti, cy.z + 17, M.forged);
    const inB = rocker('intakeRockers', 1, cy.z + LZ.inB, ti, cy.z - 17, M.forged);
    const exA = rocker('exhaustRockers', -1, cy.z + LZ.exA, te, cy.z + 17, M.forged);
    const exB = rocker('exhaustRockers', -1, cy.z + LZ.exB, te, cy.z - 17, M.forged);
    for (const [group, id, instance] of [[inA,'rocker-inlet-a',cy.i],[inB,'rocker-inlet-b',cy.i],[exA,'rocker-exhaust',cy.i*2],[exB,'rocker-exhaust',cy.i*2+1]]) {
      group.name = `${id}:${instance}`;
      group.userData.catalogPiece = id;
      group.userData.catalogInstance = instance;
      group.traverse(m => { if(m.isMesh) mark(m,id,instance); });
    }
    rockers.push({cy, inA, inB, exA, exB});
  }

  // ============================================================ oil: strainer, filter; cooling: thermostat housing
  tube('oilStrainer', [[30, -20, 200], [30, -70, 180], [20, -100, 120], [0, -106, 60]], 9, M.steel, null, 32, 10);
  at(add('oilStrainer', new THREE.CylinderGeometry(42, 42, 8, 28), M.steel), 0, -110, 50);
  const filt = add('oilFilter', cylX(40, 88, 32), M.paintBlack);
  filt.position.set(152, 18, -46);
  at(add('oilFilter', cylX(44, 8, 32), M.paintBlack), 108, 18, -46);
  at(add('thermostat', new RoundedBoxGeometry(46, 50, 50, 2, 8), M.castLight), 118, 120, -232);
  tube('thermostat', [[140, 120, -232], [170, 118, -252], [200, 110, -262]], 15, M.rubber, null, 16, 14);

  // ============================================================ the charge in each bore
  const STROKE_COL = {intake: new THREE.Color('#2f7de1'), compression: new THREE.Color('#2fb38a'), power: new THREE.Color('#ff5a1f'), exhaust: new THREE.Color('#8a8f98')};
  const charges = CYL.map((cy) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(SPEC.bore / 2 - 1, SPEC.bore / 2 - 1, 1, 40), new THREE.MeshBasicMaterial({color: '#2f7de1', transparent: true, opacity: 0.45, depthWrite: false}));
    m.position.z = cy.z;
    m.renderOrder = 3;
    m.userData.part = 'pistons';
    m.userData.fx = true;
    G.pistons.add(m);
    return m;
  });

  // ============================================================ explode directions (mm at full explode)
  const EX = {
    valveCover: [0, 260, 0], oilCap: [0, 300, 0], plugLeads: [0, 300, 0],
    timingCoverUpper: [0, 40, 240], timingCoverLower: [0, 0, 280], engineMount: [0, 60, 320],
    crankPulley: [0, 0, 340], accessoryBelts: [0, 0, 340], psHose: [-60, 140, 300],
    alternator: [-200, 0, 60], psPump: [-160, 80, 200], dipstick: [-120, 120, 120],
    heatShield: [-300, 0, 0], exhaustManifold: [-170, 0, 0], coolantOutlet: [-150, 40, -60],
    plenum: [240, 40, 0], runners: [190, 20, 0], throttleBody: [260, 40, -60], intakeDuct: [260, 140, -120], fuelRail: [150, 80, 0], injectors: [120, 60, 0],
    distributor: [0, 60, -220],
    flywheel: [0, 0, -110], clutchDisc: [0, 0, -170], clutchPressurePlate: [0, 0, -240],
    iabBody: [220, 45, 0], iabButterflies: [220, 45, 0], iabShaft: [220, 45, 0],
    iabActuator: [250, 65, -50], iabSolenoid: [220, -30, -60], iabVacuumTank: [220, -100, -40],
    head: [0, 150, 0], headGasket: [0, 75, 0], camshaft: [0, 205, 0], rockerShafts: [0, 230, 0], intakeRockers: [0, 230, 0], exhaustRockers: [0, 230, 0],
    intakeValves: [0, 150, 0], exhaustValves: [0, 150, 0], sparkPlugs: [0, 180, 0],
    timingBelt: [0, 30, 150], camPulley: [0, 205, 150], crankTimingPulley: [0, 0, 150], timingTensioner: [0, 0, 150], waterPump: [0, 0, 150],
    balancerBelt: [0, 0, 100], balancerAdjuster: [0, 0, 100],
    oilPan: [0, -200, 0], oilStrainer: [0, -130, 0], oilFilter: [160, 0, 0], thermostat: [140, 0, -60], oilPump: [0, 0, 60],
    bearingBridge: [0, -110, 0], crankshaft: [0, -170, 0], crankFlange: [0, -170, -60], rods: [0, -40, 0], pistons: [0, 40, 0], rings: [0, 40, 0], wristPins: [0, 40, 0],
    balancerFront: [-120, 0, 0], balancerRear: [140, -60, 0],
  };
  // the head assembly moves as one, then each part goes a little further
  const exVec = (id) => v(...(EX[id] ?? [0, 0, 0]));

  // Reference-detail passes retain the same selectable groups and motion inputs.
  detailCastings({G,M,add,at,tube,cylZ,cylX,bolt,L,CYL,DECK,SPEC,ASSUMED,liners,camPulley});
  const exterior = detailExterior({G,M,add,at,tube,cylZ,cylX,bolt,L,CYL,DECK}) ?? {};
  detailInternals({G,M,add,at,tube,cylZ,L,CYL,DECK,ASSUMED,SPEC,crank,pistons,rockers,valves});
  const updateTiming = detailTiming({G,M,L,PULLEY,beltPath,crankTiming,wpPulley,crankBal,balFPulley,balInputPulley,balRGear,balInputGear,camPulley});
  const updateComponents = detailComponents({root,G,M,L,CYL,DECK,PULLEY,beltPath,pistons,valves,rockers,crank,flange,distRotor,psPulley,crankBal,balFPulley,balInputPulley,balInputGear,balRGear,wpPulley,alt});
  if (options.consolidate !== false) consolidateStatic(G);

  // ============================================================ materials for isolate / see-through
  const allMats = new Set();
  root.traverse((m) => m.isMesh && allMats.add(m.material));
  const GHOST = new Map(
    [...allMats].map((m) => {
      const g = m.clone();
      g.transparent = true;
      g.depthWrite = false;
      g.opacity = 0.1;
      return [m, g];
    }),
  );
  root.traverse((m) => m.isMesh && (m.userData.mat0 = m.material));
  const ghosted = new Set();
  const HILITE = new Map();
  const hiliteOf = (m) => {
    if (!HILITE.has(m)) {
      const h = m.clone();
      h.emissive = new THREE.Color('#ffcc00');
      h.emissiveIntensity = 0.35;
      HILITE.set(m, h);
    }
    return HILITE.get(m);
  };

  // anchors for labels: each part's centre at rest
  const anchors = {};
  root.updateMatrixWorld(true);
  {
    const box = new THREE.Box3();
    for (const p of PARTS) {
      box.makeEmpty();
      G[p.id].traverse((m) => m.isMesh && m.visible && box.expandByObject(m));
      anchors[p.id] = box.isEmpty() ? v(0, 0, 0) : box.getCenter(new V3());
    }
    // a few anchors read better on a specific spot
    anchors.pistons = v(0, DECK - 40, zOf(1));
    anchors.crankshaft = v(0, 0, zOf(2) - 26);
    anchors.camshaft = v(0, L.camY, zOf(1) + 60);
    anchors.timingBelt = v(-44, 180, L.beltZ);
    anchors.balancerBelt = v(-40, 40, L.balZ);
    anchors.intakeRockers = v(40, L.rockY, zOf(1) + 12);
    anchors.intakeValves = v(36, DECK + 40, zOf(1) + 17);
    anchors.exhaustValves = v(-36, DECK + 40, zOf(1) + 17);
    anchors.rods = v(0, 90, zOf(1));
    anchors.sparkPlugs = v(30, DECK + 60, zOf(1));
    root.updateMatrixWorld(true);
  }

  const tmp = new V3();
  /** st: {iab: 0..1, explode 0..1, hidden: Set, ghost: Set of part ids, keepSystems: Set|null,
   *  selected: id|null, shells: 0..1 (see-through shells)} */
  const update = (th, st = {}) => {
    // ---- explode: each part along its own direction
    const e = st.explode ?? 0;
    for (const p of PARTS) G[p.id].position.copy(exVec(p.id)).multiplyScalar(e);
    // ---- crank, pistons, rods
    crank.rotation.z = th * D2R;
    flange.rotation.z = th * D2R;
    // Coupled clutch demonstration: flywheel, disc and pressure plate share crank
    // speed. This does not simulate clutch release or a transmission input shaft.
    for (const id of ['flywheel','clutchDisc','clutchPressurePlate']) if(G[id]) G[id].rotation.z = th * D2R;
    exterior.updateIab?.(iabPosition(st.iab ?? 0));
    crankPulley.rotation.z = th * D2R;
    crankTiming.rotation.z = th * D2R;
    crankBal.rotation.z = th * D2R;
    CYL.forEach((cy, i) => {
      const {s, pin} = piston(i, th);
      const pp = pistons[i];
      pp.g.position.y = s;
      pp.rg.position.set(0, s, cy.z);
      pp.pg.position.set(0, s, cy.z);
      const a = v(pin[0], pin[1], cy.z);
      const b = v(0, s, cy.z);
      tmp.subVectors(b, a);
      const len = tmp.length();
      pp.rod.position.copy(a).add(b).multiplyScalar(0.5);
      pp.rod.rotation.set(0, 0, Math.atan2(tmp.y, tmp.x) - Math.PI / 2);
      pp.beam.scale.y = len - 30;
      pp.big.position.y = -len / 2;
      pp.small.position.y = len / 2;
      // charge column: crown to deck, coloured by stroke
      const ps = phase(cy.c, th);
      const crown = s + ASSUMED.pistonCompressionHeight;
      const ch = charges[i];
      ch.position.y = (crown + DECK) / 2;
      ch.scale.y = Math.max(1, DECK - crown);
      const k = strokeOf(ps);
      ch.material.color.copy(STROKE_COL[k]);
      ch.material.opacity = st.charge === false ? 0 : k === 'power' ? 0.35 + 0.4 * Math.max(0, 1 - ps / 90) : 0.32;
      sparks[i].material.opacity = ps < 14 || ps > 712 ? 0.95 * (1 - Math.min(1, (ps > 712 ? 0 : ps) / 14)) : 0;
    });
    // ---- camshaft, distributor, balance shafts, pulleys
    cam.rotation.z = camAngle(th) * D2R;
    camPulley.rotation.z = camAngle(th) * D2R;
    distRotor.rotation.z = camAngle(th) * D2R;
    balF.rotation.z = balanceAngle(th, 'front') * D2R;
    balFPulley.rotation.z = balanceAngle(th, 'front') * D2R;
    balInputPulley.rotation.z = balanceAngle(th, 'front') * D2R;
    balInputGear.rotation.z = balanceAngle(th, 'front') * D2R;
    balR.rotation.z = balanceAngle(th, 'rear') * D2R;
    balRGear.rotation.z = balanceAngle(th, 'rear') * D2R;
    balAdj.rotation.z = th * D2R * (PULLEY.crankBalancer / 36);
    wpPulley.rotation.z = th * D2R * (PULLEY.crankTiming / PULLEY.waterPump);
    tens.rotation.z = th * D2R * (PULLEY.crankTiming / 52);
    altPulley.rotation.z = th * D2R * (PULLEY.crank / PULLEY.alternator);
    psPulley.rotation.z = th * D2R * (PULLEY.crank / PULLEY.powerSteering);
    updateTiming(th);
    updateComponents(th,st);
    // ---- fixed valve profiles: identical inlet lift, no state/history switching
    const lever = 24; // illustrative valve-side arm length, mm
    for (const r of rockers) {
      const ps = phase(r.cy.c, th);
      const il = intakeLift(ps);
      const mm = ASSUMED.liftScale;
      r.inA.rotation.z = -(il.a * mm) / lever;
      r.inB.rotation.z = -(il.b * mm) / lever;
      r.exA.rotation.z = exhaustLift(ps) * mm / lever;
      r.exB.rotation.z = exhaustLift(ps) * mm / lever;
    }
    for (const vv of valves) {
      const ps = phase(vv.cy.c, th);
      const il = intakeLift(ps);
      const lift = (vv.kind === 'ex' ? exhaustLift(ps) : vv.which === 'a' ? il.a : il.b) * ASSUMED.liftScale;
      vv.g.position.set(vv.x0, DECK + ASSUMED.valveSeatAboveDeck, vv.z).addScaledVector(vv.dir, -lift);
      vv.coil.scale.y = (30 - lift) / 30;
      vv.coil.position.y = 42;
    }

    // ---- visibility: hidden parts, see-through shells, isolate, selection highlight
    for (const m of ghosted) m.material = m.userData.mat0;
    ghosted.clear();
    const hidden = st.hidden ?? new Set();
    const ghost = st.ghost ?? new Set();
    const keep = st.keepSystems;
    const sel = st.selected;
    for (const p of PARTS) {
      const g = G[p.id];
      g.visible = !hidden.has(p.id);
      if (!g.visible) continue;
      const faded = ghost.has(p.id) || (keep && !keep.has(p.system) && p.id !== sel);
      if (faded || p.id === sel) {
        g.traverse((m) => {
          if (!m.isMesh || !m.userData.mat0 || m.userData.fx) return;
          m.material = faded ? GHOST.get(m.userData.mat0) : hiliteOf(m.userData.mat0);
          ghosted.add(m);
        });
      }
    }
    const pistonsFaded = ghost.has('pistons') || (keep && !keep.has('bottom') && sel !== 'pistons');
    for (const c of charges) c.visible = !hidden.has('pistons') && !pistonsFaded;
    if (keep || ghost.size) deco.traverse((m) => {
      if (m.isMesh) {
        m.material = GHOST.get(m.userData.mat0);
        ghosted.add(m);
      }
    });
    for (const s of sparks) s.visible = !hidden.has('sparkPlugs') && !(keep && !keep.has('ignition') && sel !== 'sparkPlugs');
  };
  const anchorOf = (id) => anchors[id].clone().add(exVec(id).multiplyScalar(lastExplode));
  let lastExplode = 0;
  const setExplode = (e) => (lastExplode = e);
  root.scale.setScalar(0.001);
  const pickables = [];
  root.traverse((m) => m.isMesh && m.userData.part && pickables.push(m));
  // Optional non-rendering references let the individual-parts atlas reuse the
  // exact assembled geometry. Ordinary callers keep the original public shape.
  const detailedRegistry = options.detailedRegistry ? {
    crank, cam, lobes, flange, pistons, valves, rockers, balF, balR, balAdj,
    crankTiming, camPulley, wpPulley, tens, crankBal, balFPulley, balInputPulley, balInputGear, balRGear,
    crankPulley, alt, altPulley, psp, psPulley, distRotor,
    iab: exterior.iab, flywheel: G.flywheel, clutchDisc: G.clutchDisc, clutchPressurePlate: G.clutchPressurePlate,
  } : undefined;
  return {root, update, G, M, GHOST, anchors, anchorOf, setExplode, pickables, SHELL, liners, L, STROKE_COL, ...(detailedRegistry ? {detailedRegistry} : {})};
}
export {PART};
