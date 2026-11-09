// Single mechanical data source for the 1993 F22A6 / 5MT model and its parts atlas.
// Numeric model values and evidence are deliberately separate: a useful illustrative
// dimension must never become a claimed Honda manufacturing specification by reuse.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const ENGINE = freeze({
  code: 'F22A6', modelYear: 1993, vehicle: 'Honda Accord EX sedan', transmission: '5MT',
  market: null, emissionsVariant: null, marketStatus: 'unresolved',
  architecture: 'SOHC inline four, 16 valves, fixed valve lift',
  variableValveLift: false, intakeAirBypass: true,
  referenceCatalogs: ['1993 Accord 4 Door EX KA 5MT', '1993 Accord 4 Door EX KL 5MT'],
});

const catalogRoot = 'https://www.hondapartsnow.com/parts-list/1993-honda-accord--4dr_ex-ka_5mt/engine/';
export const SOURCES = freeze({
  'owner-1993-specifications': {title: '1993 Honda Accord sedan owner manual — Specifications, printed page 159', url: 'https://www.carmanual.org/OwnersManual/honda/1993_honda_accord_sedan.pdf', local: '02_Service_Evidence/1993-accord-owner-manual.pdf', printedPage: 159},
  'oem-rockers': {title: '1993 Accord EX 5MT — Valve / rocker arm', url: catalogRoot + 'valve_rocker_arm.html', local: '01_OEM_Diagrams/KA/valve_rocker_arm.json'},
  'oem-head': {title: '1993 Accord EX 5MT — Cylinder head', url: catalogRoot + 'cylinder_head.html', local: '01_OEM_Diagrams/KA/cylinder_head.json'},
  'oem-cam': {title: '1993 Accord EX 5MT — Camshaft / timing belt', url: catalogRoot + 'camshaft_timing_belt.html', local: '01_OEM_Diagrams/KA/camshaft_timing_belt.json'},
  'oem-crank': {title: '1993 Accord EX 5MT — Crankshaft / piston', url: catalogRoot + 'crankshaft_piston.html', local: '01_OEM_Diagrams/KA/crankshaft_piston.json'},
  'oem-intake': {title: '1993 Accord EX 5MT — Intake manifold', url: catalogRoot + 'intake_manifold.html', local: '01_OEM_Diagrams/KA/intake_manifold.json'},
});
const unresolved = note => ({classification: 'unresolved', sourceIds: [], note});
const illustrative = note => ({classification: 'illustrative', sourceIds: [], note});
const verified = (sourceIds, note) => ({classification: 'verified', sourceIds, note});

// Nominal working values. Entries without an A6-specific dimensional source remain
// explicitly unresolved in SPEC_EVIDENCE; these are not machining/service limits.
export const SPEC = freeze({
  bore: 85, stroke: 95, cr: 8.8, displacementCc: 2156,
  headHeight: 100, wristPinDia: 22, rodJournalDia: 48, mainJournalDia: 50,
  firingOrder: [1, 3, 4, 2], cylinders: 4, valvesPerCylinder: 4,
});
export const SPEC_EVIDENCE = freeze({
  bore: verified(['owner-1993-specifications'], 'Honda specifies 85.0 mm bore on printed page 159.'),
  stroke: verified(['owner-1993-specifications'], 'Honda specifies 95.0 mm stroke on printed page 159.'),
  cr: verified(['owner-1993-specifications'], 'Honda specifies 8.8:1. This figure is not derived from the illustrative chamber surfaces.'),
  displacementCc: verified(['owner-1993-specifications'], 'Honda specifies 2156 cc; swept volume is also calculated from bore and stroke.'),
  headHeight: illustrative('100 mm layout envelope, not a verified F22A6 machining specification.'),
  wristPinDia: unresolved('22 mm nominal retained for geometric fit; A6 service tolerance not yet verified.'),
  rodJournalDia: unresolved('48 mm nominal retained for geometric fit; A6 service tolerance not yet verified.'),
  mainJournalDia: unresolved('50 mm nominal retained for geometric fit; A6 service tolerance not yet verified.'),
  firingOrder: unresolved('1-3-4-2 model order; primary F22A6 timing reference pending.'),
  cylinders: verified(['oem-crank'], 'Four piston / connecting-rod assemblies.'),
  valvesPerCylinder: verified(['oem-rockers'], 'Eight inlet valves and eight exhaust valves across four cylinders.'),
});

export const ASSUMED = freeze({
  rod: 142, pistonCompressionHeight: 31, pitch: 96, valveTilt: 21,
  valveSeatAboveDeck: 11, liftScale: 9,
});
export const ASSUMED_EVIDENCE = freeze(Object.fromEntries(Object.keys(ASSUMED).map(key => [key,
  illustrative(key === 'liftScale' ? 'Teaching valve travel in mm, not measured F22A6 valve lift.' : 'Illustrative layout dimension; not supplied by the exploded OEM plate.'),
])));

// The A6 has one fixed profile for each valve function. Windows are degrees after
// compression TDC. They explain overlap and the four strokes; they are not a cam
// card, seat-timing measurement or the forum measurements at 0.050 inch lift.
export const VALVE_EVENTS = freeze({
  intake: {win: [345, 590], lift: 1, ...illustrative('Fixed intake teaching profile; exact A6 events/lift curve unresolved.')},
  exhaust: {win: [130, 375], lift: 1, ...illustrative('Fixed exhaust teaching profile; exact A6 events/lift curve unresolved.')},
});

export const VALVETRAIN = freeze({
  camshafts: 1, intakeRockersA: 4, intakeRockersB: 4, exhaustRockers: 8,
  intakeShaftsShort: 2, intakeShaftsLong: 3, exhaustShafts: 1,
  valveAdjusters: 16, valveKeepers: 32, variableValveLift: false,
  evidence: verified(['oem-rockers', 'oem-head'], 'OEM quantities establish independent A/B inlet arms, eight identical exhaust arms and segmented inlet shafts.'),
});

// One illustrated contact track per independent arm until the physical A6 cam
// track widths/axial arrangement are measured. The count/layout is not promoted
// to a verified manufacturing fact merely because it is rendered.
export const CAM_LAYOUT = freeze([
  {key: 'exA', profile: 'exhaust', offsetMm: 34, widthMm: 10},
  {key: 'inA', profile: 'intake', offsetMm: 12, widthMm: 10},
  {key: 'inB', profile: 'intake', offsetMm: -12, widthMm: 10},
  {key: 'exB', profile: 'exhaust', offsetMm: -34, widthMm: 10},
].map(entry => ({...entry, classification: 'illustrative', sourceIds: ['oem-cam'], note: 'Contact-track layout; exact OEM axial widths and lobe topology unresolved.'})));

export const RATIO = freeze({cam: 0.5, distributor: 0.5, balanceFront: 2, balanceRear: -2});
export const PULLEY = freeze({crank: 150, alternator: 62, powerSteering: 104, waterPump: 60, crankTiming: 54, camTiming: 108, crankBalancer: 68, balancer: 34});
export const DRIVE_EVIDENCE = freeze({
  cam: {classification: 'derived', sourceIds: ['oem-cam'], note: 'A four-stroke camshaft completes one turn per two crank revolutions.'},
  accessoryDiameters: illustrative('Pulley diameters are visual estimates; accessory speeds derived from them are approximate.'),
  balanceShafts: unresolved('Counter-rotating at twice crank speed in the teaching model; A6 manual page pending.'),
});

// IAB is an independent manifold state. It must never change the valve profile,
// firing order, crank phase or piston positions. Threshold/RPM control is unresolved.
export const IAB = freeze({
  closed: 0, open: 1, butterflyCount: 4,
  evidence: verified(['oem-intake'], 'Separate manifold bypass-valve assembly and vacuum actuator.'),
  switchingRpm: null, controlCalibration: 'unresolved',
});
