// Schematic flow paths: air and fuel, exhaust, oil and coolant. Each is a thin line with markers moving along it, and
// each flow has its own marker shape (cones, double cones, drops, cubes) so they differ by shape as well as colour.
// The routes follow the brief's descriptions in general; they are NOT the engine's measured passages.
import * as THREE from 'three';
import {CYL, DECK} from './kin.js';
import {L} from './engine.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const crv = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => v(...p)), false, 'centripetal');

export const FLOW_STYLE = {
  air: {color: '#3d8fe0', shape: 'cone'},
  exhaust: {color: '#ff7a2e', shape: 'double'},
  oil: {color: '#e0a800', shape: 'drop'},
  coolant: {color: '#22c7b8', shape: 'cube'},
};

function paths() {
  const P = {air: [], exhaust: [], oil: [], coolant: []};
  // air: duct mouth → throttle body → plenum → each runner → intake port
  P.air.push(crv([[30, DECK + 114, -410], [40, DECK + 118, -380], [90, DECK + 122, -360], [170, DECK + 112, -356], [210, DECK + 30, -340], [220, DECK + 54, -284], [220, DECK + 48, -220], [220, DECK + 48, 150]]));
  for (const cy of CYL) P.air.push(crv([[220, DECK + 48, cy.z * 0.94], [241, DECK + 22, cy.z * 0.95], [247, DECK - 10, cy.z * 0.96], [211, DECK - 34, cy.z * 0.98], [165, DECK + 34, cy.z], [121, DECK + 50, cy.z], [40, DECK + 18, cy.z]]));
  // exhaust: each port → manifold → collector → out
  for (const cy of CYL) P.exhaust.push(crv([[-40, DECK + 18, cy.z], [-119, DECK + 44, cy.z], [-148, DECK + 36, cy.z * 0.95], [-162, DECK - 30, cy.z * 0.75], [-172, DECK - 120, cy.z * 0.35 - 14], [-176, 20, -22], [-176, -70, -22]]));
  // oil: pan → strainer → pump → filter → main gallery; branches to the main bearings and up to the head; returns
  P.oil.push(crv([[0, -108, 50], [20, -100, 120], [30, -70, 180], [30, -20, 200], [100, 0, 150], [140, 18, -20], [150, 18, -46]]));
  P.oil.push(crv([[150, 18, -46], [95, -20, -46], [92, -24, 100], [90, -26, 190]]));
  P.oil.push(crv([[95, -20, -46], [92, -24, -130], [90, -26, -195]]));
  for (const z of [192, 96, 0, -96, -192]) P.oil.push(crv([[90, -26, z], [45, -28, z], [8, -12, z]]));
  P.oil.push(crv([[90, -26, -195], [95, 60, -205], [92, DECK - 20, -205], [L.rockX, L.rockY, -200], [L.rockX, L.rockY, 180]]));
  P.oil.push(crv([[-60, DECK + 40, 120], [-80, DECK - 40, 150], [-86, 40, 150], [-60, -100, 120]]));
  // coolant: pump → block jacket round the bores → head → outlet; thermostat back to the pump
  P.coolant.push(crv([[L.wp[0], L.wp[1], 200], [60, 150, 170], [62, 150, 60], [62, 150, -60], [62, 150, -185], [60, DECK + 30, -190], [-30, DECK + 30, -195], [-131, DECK + 46, -226], [-204, DECK + 30, -252]]));
  P.coolant.push(crv([[60, 150, 170], [-62, 150, 160], [-62, 150, 0], [-62, 150, -185], [-62, DECK + 30, -190], [-131, DECK + 46, -226]]));
  P.coolant.push(crv([[118, 120, -232], [112, 110, -60], [100, 120, 120], [L.wp[0], L.wp[1], 196]]));
  return P;
}

export function buildFlows() {
  const root = new THREE.Group();
  const groups = {};
  const movers = [];
  const P = paths();
  for (const [name, list] of Object.entries(P)) {
    const st = FLOW_STYLE[name];
    const g = new THREE.Group();
    g.name = `flow-${name}`;
    g.visible = false;
    root.add(g);
    groups[name] = g;
    const lineMat = new THREE.MeshBasicMaterial({color: st.color, transparent: true, opacity: 0.55, depthTest: false});
    const markMat = new THREE.MeshBasicMaterial({color: st.color, depthTest: false});
    const markGeo =
      st.shape === 'cone'
        ? new THREE.ConeGeometry(8, 20, 12).rotateX(Math.PI / 2)
        : st.shape === 'double'
          ? (() => {
              const a = new THREE.ConeGeometry(8, 14, 10).rotateX(Math.PI / 2).translate(0, 0, 7);
              return a;
            })()
          : st.shape === 'drop'
            ? new THREE.SphereGeometry(7, 12, 10)
            : new THREE.BoxGeometry(11, 11, 11);
    for (const c of list) {
      const t = new THREE.Mesh(new THREE.TubeGeometry(c, 96, 2.6, 6, false), lineMat);
      t.renderOrder = 10;
      g.add(t);
      const n = Math.max(3, Math.round(c.getLength() / 70));
      const inst = new THREE.InstancedMesh(markGeo, markMat, st.shape === 'double' ? n * 2 : n);
      inst.renderOrder = 11;
      inst.frustumCulled = false;
      g.add(inst);
      movers.push({c, inst, n, double: st.shape === 'double', name});
    }
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const Z = new THREE.Vector3(0, 0, 1);
  /** s: distance travelled, in path lengths (the caller advances it with time) */
  const update = (s) => {
    for (const mv of movers) {
      if (!groups[mv.name].visible) continue;
      for (let k = 0; k < mv.n; k++) {
        const u = (((k / mv.n + s * (140 / mv.c.getLength())) % 1) + 1) % 1;
        mv.c.getPointAt(u, p);
        mv.c.getTangentAt(u, tan);
        q.setFromUnitVectors(Z, tan);
        m4.compose(p, q, one);
        mv.inst.setMatrixAt(mv.double ? k * 2 : k, m4);
        if (mv.double) {
          p.addScaledVector(tan, -14);
          m4.compose(p, q, one);
          mv.inst.setMatrixAt(k * 2 + 1, m4);
        }
      }
      mv.inst.instanceMatrix.needsUpdate = true;
    }
  };
  const anchors = {air: v(220, DECK + 60, 60), exhaust: v(-176, 40, -22), oil: v(150, 18, -46), coolant: v(62, 150, 0)};
  root.scale.setScalar(0.001);
  return {root, groups, update, anchors};
}
