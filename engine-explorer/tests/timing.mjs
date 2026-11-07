// Checks the mechanical timing against the reference brief (section 5). Run: node tests/timing.mjs
import {CYL, DECK, exhaustLift, firingNow, intakeLift, onBaseCircle, phase, piston, pinXY, R, RATIO, SPEC, strokeOf, TDC, travel, ASSUMED} from '../src/kin.js';

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`);
};
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const S_TDC = R + ASSUMED.rod;

// displacement from bore and stroke
const cc = (4 * Math.PI * (SPEC.bore / 2) ** 2 * SPEC.stroke) / 1000;
ok(Math.abs(cc - SPEC.displacementCc) < 1, `displacement ${cc.toFixed(1)} cc ≈ ${SPEC.displacementCc} cc`);

// cylinder numbering: 1 at the timing-belt end (+z) to 4 at the transmission end
ok(CYL[0].z > CYL[1].z && CYL[1].z > CYL[2].z && CYL[2].z > CYL[3].z, 'cylinders 1→4 run from the timing-belt end to the transmission end');

// compression TDC events 1 @0, 3 @180, 4 @360, 2 @540, i.e. firing order 1-3-4-2
for (const [c, t] of Object.entries(TDC)) {
  const i = Number(c) - 1;
  ok(near(piston(i, t).s, S_TDC, 1e-9) && phase(Number(c), t) === 0, `cylinder ${c} at compression TDC at ${t}°`);
}
const order = [0, 180, 360, 540].map((t) => firingNow(t + 1));
ok(order.join('-') === '1-3-4-2', `firing order from the model: ${order.join('-')}`);

// pistons 1/4 share position, 2/3 share position opposite them, for every crank angle
let pairs = true;
let opposed = true;
for (let t = 0; t < 720; t += 1) {
  if (!near(piston(0, t).s, piston(3, t).s) || !near(piston(1, t).s, piston(2, t).s)) pairs = false;
  const [a] = [pinXY(0, t)];
  const b = pinXY(1, t);
  if (!near(a[0], -b[0]) || !near(a[1], -b[1])) opposed = false;
}
ok(pairs, 'pistons 1 & 4 move together, 2 & 3 move together');
ok(opposed, 'crank pins of 2 & 3 sit 180° from 1 & 4');

// shared position does not mean shared stroke
ok(strokeOf(phase(1, 10)) === 'power' && strokeOf(phase(4, 10)) === 'intake', 'at 10°: cylinder 1 on power, cylinder 4 on intake (same position, different stroke)');

// the brief's travel equation agrees with the pin position
let tr = true;
for (let t = 0; t < 360; t += 7) for (let i = 0; i < 4; i++) if (!near(S_TDC - piston(i, t).s, travel(i, t), 1e-9)) tr = false;
ok(tr, 's(θ) = r(1−cosθ) + L − √(L² − r²sin²θ) matches the posed piston');
ok(near(travel(0, 180), SPEC.stroke, 1e-9), 'travel at 180° equals the 95 mm stroke');

// counter-clockwise from the pulley end: at +90° the pin of cylinder 1 has moved to -x
ok(pinXY(0, 90)[0] < 0, 'crank turns counter-clockwise viewed from the pulley end');

// speed ratios
ok(RATIO.cam === 0.5 && RATIO.distributor === 0.5, 'camshaft and distributor at half crank speed');
ok(RATIO.balanceFront === 2 && RATIO.balanceRear === -2, 'balance shafts at twice crank speed, counter-rotating');

// valves: shut through most of compression and power (allowing the brief's overlap at the stroke boundaries)
let shut = true;
for (let ps = 0; ps < 120; ps++) {
  const v = intakeLift(ps, 0);
  if (v.a || v.b || exhaustLift(ps)) shut = false;
}
for (let ps = 610; ps < 720; ps++) {
  const v = intakeLift(ps, 1);
  if (v.a || v.b || exhaustLift(ps)) shut = false;
}
ok(shut, 'all valves closed from 610° to 120° after TDC (around the firing TDC)');
ok(intakeLift(450, 0).b < 0.15 * intakeLift(450, 0).a, 'VTEC off: second intake valve opens only slightly');
ok(near(intakeLift(450, 1).a, intakeLift(450, 1).b) && intakeLift(450, 1).a > intakeLift(450, 0).a, 'VTEC on: both intake valves follow the larger middle lobe');
ok(onBaseCircle(100) && !onBaseCircle(450), 'VTEC may switch only on the base circle (zero lift)');
ok(DECK > S_TDC, `piston crown stays below the deck at TDC (deck ${DECK.toFixed(1)} mm)`);

console.log(fails ? `\n${fails} check(s) failed` : '\nall timing checks passed');
process.exit(fails ? 1 : 0);
