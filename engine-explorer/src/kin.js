// Honda F22B1-reference kinematics. One input poses every moving part: the crank angle θ in degrees. The 720°
// combustion cycle is derived from it. No three.js in here, so the timing can be checked in Node (tests/timing.mjs).
//
// Engine space is millimetres: crank axis on z, +z toward the timing-belt end (cylinder 1), y up, the exhaust side at
// -x, the intake side at +x. The crank turns counter-clockwise seen from the pulley end (+z looking toward -z).
//
// Every value is tagged: SPEC (Honda specification or service-manual standard, see the brief) or ASSUMED (not yet
// verified; chosen to look right against the photographs, listed on the page under "About accuracy").

export const SPEC = {
  bore: 85.0, // mm, 1994 US specification
  stroke: 95.0, // mm
  cr: 8.8, // geometric compression ratio
  displacementCc: 2156,
  headHeight: 100.0, // mm, service supplement 99.95–100.05
  wristPinDia: 22.0, // mm, 21.994–22.000
  rodJournalDia: 48.0, // mm, 47.976–48.000
  mainJournalDia: 50.0, // mm, approximately
  firingOrder: [1, 3, 4, 2],
};
export const ASSUMED = {
  rod: 142, // rod centre-to-centre length; not verified for F22B1
  pistonCompressionHeight: 31, // pin centre to crown
  pitch: 96, // cylinder centre spacing
  valveTilt: 21, // degrees from the bore axis, intake and exhaust alike
  liftScale: 9, // mm of valve travel drawn for a lift of 1.0; a teaching scale, not a measured lift
};
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

// ------------------------------------------------------------ valve events (schematic)
// Windows are degrees after compression TDC, lift is relative (1.0 = ASSUMED.liftScale mm). Real valve events overlap
// the stroke boundaries as these do, but the exact F22B1 timing and lift curves are not referenced: the shapes are a
// teaching model. The relative sizes follow the brief: primary normal, secondary only slightly open, middle largest.
export const LOBE = {
  exhaust: {win: [130, 375], lift: 1.0},
  primary: {win: [345, 590], lift: 1.0},
  secondary: {win: [365, 570], lift: 0.12},
  middle: {win: [335, 605], lift: 1.22},
};
export const bump = (ps, [a, b]) => {
  const x = mod(ps - a, 720) / (b - a);
  return x >= 0 && x <= 1 ? Math.sin(Math.PI * x) ** 2 : 0;
};
export const lobeLift = (name, ps) => LOBE[name].lift * bump(ps, LOBE[name].win);
/** lobe peak in cycle degrees, for phasing the drawn cam */
export const lobePeak = (name) => (LOBE[name].win[0] + LOBE[name].win[1]) / 2;
/** the two intake valves: with VTEC off, valve A follows the primary lobe and valve B the secondary; with VTEC on both
 *  follow the middle lobe. `locked` is 0..1 (the synchronising pistons' travel), applied only while the lift is zero */
export const intakeLift = (ps, locked) => {
  const m = lobeLift('middle', ps);
  return {
    a: locked ? m : lobeLift('primary', ps),
    b: locked ? m : lobeLift('secondary', ps),
    middle: m,
  };
};
export const exhaustLift = (ps) => lobeLift('exhaust', ps);
/** VTEC switches only on the base circle: true when every intake lobe of the cylinder is at zero lift */
export const onBaseCircle = (ps) => lobeLift('middle', ps) === 0 && lobeLift('primary', ps) === 0 && lobeLift('secondary', ps) === 0;

// ------------------------------------------------------------ shaft speeds (SPEC ratios from the brief)
export const RATIO = {cam: 0.5, distributor: 0.5, balanceFront: 2, balanceRear: -2};
// accessory pulleys: diameters ASSUMED from the photographs, so these ratios are approximate
export const PULLEY = {crank: 150, alternator: 62, powerSteering: 104, waterPump: 60, crankTiming: 54, camTiming: 108, crankBalancer: 68, balancer: 34};
export const camAngle = (th) => th * RATIO.cam;
export const balanceAngle = (th, which) => th * (which === 'front' ? RATIO.balanceFront : RATIO.balanceRear);

/** the cylinder whose compression TDC was most recent: the one firing (spark near TDC, power stroke) */
export const firingNow = (th) => SPEC.firingOrder.reduce((best, c) => (phase(c, th) < phase(best, th) ? c : best), 1);
