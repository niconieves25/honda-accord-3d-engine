// The seven views: camera (target in mm, azimuth from +z toward +x, elevation, distance in metres), what is hidden,
// what turns see-through, which systems stay solid, the explode amount, the cutaway plane, and the parts labelled.
import {CYL, DECK} from './kin.js';
import {L} from './engine.js';

const z1 = CYL[0].z;
export const VIEW_ORDER = ['exterior', 'noCover', 'noTiming', 'cutaway', 'lower', 'iab', 'exploded'];
const COVER = ['valveCover', 'oilCap', 'plugLeads'];
const FRONT = ['timingCoverUpper', 'timingCoverLower', 'engineMount', 'crankPulley', 'accessoryBelts', 'psHose'];
const ATTACHMENTS = ['plenum','runners','throttleBody','intakeDuct','fuelRail','injectors','exhaustManifold','heatShield','coolantOutlet','alternator','psPump','distributor','oilFilter','dipstick','ignitionCoil','iabBody','iabButterflies','iabShaft','iabActuator','iabSolenoid','iabVacuumTank','flywheel','clutchDisc','clutchPressurePlate'];
export const VIEWS = {
  exterior: {cam: {t: [10, 110, -30], az: 52, el: 28, d: 1.5}, labels: ['valveCover', 'timingCoverUpper', 'crankPulley', 'psPump', 'plenum', 'oilFilter', 'throttleBody']},
  noCover: {cam: {t: [0, DECK + 60, -10], az: 62, el: 52, d: 1.35}, hidden: COVER, labels: ['camshaft', 'intakeRockers', 'exhaustRockers', 'rockerShafts', 'distributor', 'sparkPlugs']},
  noTiming: {cam: {t: [-10, 130, 200], az: 18, el: 14, d: 1.25}, hidden: FRONT, labels: ['timingBelt', 'camPulley', 'balancerBelt', 'waterPump', 'timingTensioner', 'crankTimingPulley']},
  cutaway: {cam: {t: [0, 160, z1], az: 12, el: 10, d: 1.05}, cut: z1 + 0.5, hidden: [...COVER, ...FRONT, ...ATTACHMENTS], labels: ['pistons', 'rods', 'intakeValves', 'exhaustValves', 'sparkPlugs', 'crankshaft']},
  lower: {cam: {t: [0, 30, 0], az: 42, el: 14, d: 1.5}, keep: ['bottom', 'balance', 'oil'], ghost: ['block', 'bearingBridge', 'oilPan', 'oilFilter', 'dipstick'], labels: ['crankshaft', 'rods', 'pistons', 'balancerFront', 'balancerRear', 'oilPump']},
  iab: {cam: {t: [225, DECK+83, -10], az: 73, el: 62, d: 0.9}, hidden: ['plenum','intakeDuct','throttleBody','fuelRail','injectors','valveCover','plugLeads','runners'], keep: ['intake'], labels: ['iabBody','iabButterflies','iabShaft','iabActuator','iabSolenoid','iabVacuumTank']},
  exploded: {cam: {t: [0, 150, 0], az: 48, el: 24, d: 2.9}, explode: 1, labels: ['head', 'block', 'oilPan', 'plenum', 'heatShield', 'crankshaft']},
};

// Six reference directions plus the familiar three-quarter view. Angles avoid the
// orbit-control pole singularity by one degree for top and underside inspection.
export const DIRECTIONS={
  threeQuarter:{label:'Three-quarter',cam:VIEWS.exterior.cam},
  timing:{label:'Timing end',cam:{t:[0,115,0],az:0,el:0,d:1.65}},
  transmission:{label:'Transmission end',cam:{t:[0,115,-20],az:180,el:0,d:1.65}},
  intake:{label:'Intake side',cam:{t:[20,115,-20],az:90,el:0,d:1.65}},
  exhaust:{label:'Exhaust side',cam:{t:[0,115,-20],az:270,el:0,d:1.65}},
  top:{label:'Top',cam:{t:[20,115,-20],az:0,el:89,d:2.15}},
  underside:{label:'Underside',cam:{t:[20,115,-20],az:0,el:-89,d:2.15}},
};
