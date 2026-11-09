// Honda F22A6-reference kinematics. One input poses every moving part: the crank angle θ in degrees. The 720°
// combustion cycle is derived from it. No three.js in here, so the timing can be checked in Node (tests/timing.mjs).
//
// Engine space is millimetres: crank axis on z, +z toward the timing-belt end (cylinder 1), y up, the exhaust side at
// -x, the intake side at +x. The crank turns counter-clockwise seen from the pulley end (+z looking toward -z).
//
// All dimensional values, events and evidence classifications have one source.
// IAB is a manifold input and is deliberately absent from these valve/piston functions.
import {ASSUMED, SPEC, RATIO, PULLEY, VALVE_EVENTS} from './engine-spec.js';
export {ENGINE, SPEC, ASSUMED, SPEC_EVIDENCE, ASSUMED_EVIDENCE, RATIO, PULLEY, VALVE_EVENTS, VALVETRAIN, CAM_LAYOUT, IAB} from './engine-spec.js';

export const R = SPEC.stroke / 2; // 47.5 mm crank radius
export const DECK = R + ASSUMED.rod + ASSUMED.pistonCompressionHeight + 0.5; // crown 0.5 mm below the deck at TDC
export const CYL = [1, 2, 3, 4].map((c) => ({
  c,
  i: c - 1,
  z: (2.5 - c) * ASSUMED.pitch,
  // cylinders 1 and 4 share a crank-pin phase; 2 and 3 sit opposite
  pinPhase: c === 1 || c === 4 ? 0 : 180,
}));
// compression TDC of each cylinder, in crank degrees: 1 at 0, 3 at 180, 4 at 360, 2 at 540
export const TDC = {1: 0, 3: 180, 4: 360, 2: 540};
export const mod = (a, m) => ((a % m) + m) % m;
const D2R = Math.PI / 180;

/** crank-pin centre in the XY plane for cylinder index i; counter-clockwise from the pulley end */
export const pinXY = (i, th) => {
  const a = (th + CYL[i].pinPhase) * D2R;
  return [-R * Math.sin(a), R * Math.cos(a)];
};
/** piston-pin height above the crank axis, exact centred slider-crank (no pin offset: offset not verified) */
export const piston = (i, th) => {
  const [px, py] = pinXY(i, th);
  return {s: py + Math.sqrt(ASSUMED.rod ** 2 - px * px), pin: [px, py]};
};
/** downward travel from TDC, the brief's s(θ) = r(1 − cos θ) + L − √(L² − r² sin² θ) */
export const travel = (i, th) => {
  const t = (th + CYL[i].pinPhase) * D2R;
  const L = ASSUMED.rod;
  return R * (1 - Math.cos(t)) + L - Math.sqrt(L * L - R * R * Math.sin(t) ** 2);
};

/** the cycle phase of cylinder c in degrees after its compression TDC (0–720) */
export const phase = (c, th) => mod(th - TDC[c], 720);
export const STROKES = ['power', 'exhaust', 'intake', 'compression'];
/** idealised stroke: power 0–180, exhaust 180–360, intake 360–540, compression 540–720 (teaching convention) */
export const strokeOf = (ps) => STROKES[Math.floor(mod(ps, 720) / 180)];

// ------------------------------------------------------------ fixed-profile valve events
// Windows and lift amplitudes are illustrative, centrally documented in engine-spec.
export const LOBE = VALVE_EVENTS;
export const bump = (ps, [a, b]) => {
  const x = mod(ps - a, 720) / (b - a);
  return x >= 0 && x <= 1 ? Math.sin(Math.PI * x) ** 2 : 0;
};
export const lobeLift = (name, ps) => LOBE[name].lift * bump(ps, LOBE[name].win);
export const lobePeak = name => (LOBE[name].win[0] + LOBE[name].win[1]) / 2;
/** Two independent inlet rocker arms follow the fixed inlet profile equally.
 * There is no reduced secondary lift and no hydraulic locking state. */
export const intakeLift = ps => {
  const lift = lobeLift('intake', ps);
  return {a: lift, b: lift};
};
export const exhaustLift = ps => lobeLift('exhaust', ps);
export const camAngle = th => th * RATIO.cam;
export const balanceAngle = (th, which) => th * (which === 'front' ? RATIO.balanceFront : RATIO.balanceRear);
/** Presentation state only: no connection to valve timing or crank angle. */
export const iabPosition = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

/** the cylinder whose compression TDC was most recent: the one firing (spark near TDC, power stroke) */
export const firingNow = (th) => SPEC.firingOrder.reduce((best, c) => (phase(c, th) < phase(best, th) ? c : best), 1);
