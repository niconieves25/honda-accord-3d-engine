// The seven views: camera (target in mm, azimuth from +z toward +x, elevation, distance in metres), what is hidden,
// what turns see-through, which systems stay solid, the explode amount, the cutaway plane, and the parts labelled.
import {CYL, DECK} from './kin.js';
import {L} from './engine.js';

const z1 = CYL[0].z;
export const VIEW_ORDER = ['exterior', 'noCover', 'noTiming', 'cutaway', 'lower', 'vtec', 'exploded'];
const COVER = ['valveCover', 'oilCap', 'plugLeads'];
const FRONT = ['timingCoverUpper', 'timingCoverLower', 'engineMount', 'crankPulley', 'accessoryBelts', 'psHose'];
export const VIEWS = {
  exterior: {cam: {t: [10, 110, -30], az: 52, el: 28, d: 1.5}, labels: ['valveCover', 'timingCoverUpper', 'crankPulley', 'psPump', 'plenum', 'oilFilter', 'throttleBody']},
  noCover: {cam: {t: [0, DECK + 60, -10], az: 62, el: 52, d: 1.35}, hidden: COVER, labels: ['camshaft', 'primaryRocker', 'exhaustRockers', 'rockerShafts', 'distributor', 'sparkPlugs']},
  noTiming: {cam: {t: [-10, 130, 200], az: 18, el: 14, d: 1.25}, hidden: FRONT, labels: ['timingBelt', 'camPulley', 'balancerBelt', 'waterPump', 'timingTensioner', 'crankTimingPulley']},
  cutaway: {cam: {t: [0, 160, z1], az: 28, el: 14, d: 1.2}, cut: z1 + 0.5, hidden: [...COVER, ...FRONT], labels: ['pistons', 'rods', 'intakeValves', 'exhaustValves', 'sparkPlugs', 'crankshaft']},
  lower: {cam: {t: [0, 30, 0], az: 42, el: 14, d: 1.5}, keep: ['bottom', 'balance', 'oil'], ghost: ['block', 'bearingBridge', 'oilPan', 'oilFilter', 'dipstick'], labels: ['crankshaft', 'rods', 'pistons', 'balancerFront', 'balancerRear', 'oilPump']},
  vtec: {cam: {t: [24, L.rockY - 6, z1], az: 62, el: 46, d: 0.44}, hidden: COVER, keep: ['vtec', 'head'], ghost: ['head', 'headGasket', 'exhaustValves', 'exhaustRockers', 'sparkPlugs'], labels: ['primaryRocker', 'middleRocker', 'secondaryRocker', 'syncPistons', 'lostMotion', 'timingPlate']},
  exploded: {cam: {t: [0, 150, 0], az: 48, el: 24, d: 2.9}, explode: 1, labels: ['head', 'block', 'oilPan', 'plenum', 'heatShield', 'crankshaft']},
};
