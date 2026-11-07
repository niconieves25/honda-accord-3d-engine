// The selectable parts: id, the system they belong to, the OEM diagram callouts that identify them (diagram slug in
// "Honda Reference Library/02_OEM_Diagrams", callout number, Honda part number) and whether their shape or position is
// an approximation. Every word shown to the viewer lives in i18n/<lang>.js under the same ids.

export const SYSTEMS = ['exterior', 'bottom', 'balance', 'head', 'vtec', 'timing', 'intake', 'exhaust', 'ignition', 'oil', 'cooling', 'accessory'];

const P = (id, system, oem = [], approx = false) => ({id, system, oem, approx});
const o = (diagram, callout, pn) => ({diagram, callout, pn});

export const PARTS = [
  // exterior and covers
  P('valveCover', 'exterior', [o('cylinder_head_cover', '4', '12310-P0A-000')]),
  P('oilCap', 'exterior', [o('cylinder_head_cover', '9', '15610-PC6-000')]),
  P('timingCoverUpper', 'exterior', [o('camshaft_timing_belt', '3', '11820-P0A-000')]),
  P('timingCoverLower', 'exterior', [o('camshaft_timing_belt', '1', '11810-P0A-000')]),
  P('engineMount', 'exterior', [o('camshaft_timing_belt', '8', '11925-P0A-000')], true),
  P('oilPan', 'exterior', [o('cylinder_block_oil_pan', '6', '11200-PT0-010')]),
  // block and bottom end
  P('block', 'bottom', [o('cylinder_block_oil_pan', '1', '11000-P0A-000')]),
  P('bearingBridge', 'bottom', [o('cylinder_block_oil_pan', '5', '11130-PT0-000')], true),
  P('crankshaft', 'bottom', [o('crankshaft_piston', '9', '13310-P0A-000'), o('crankshaft_piston', '10', 'main bearings')]),
  P('pistons', 'bottom', [o('crankshaft_piston', '1', '13010-P0A-000')]),
  P('rings', 'bottom', [o('crankshaft_piston', '2', '13011-PT2-003')]),
  P('wristPins', 'bottom', [o('crankshaft_piston', '5', '13112-PT0-000')]),
  P('rods', 'bottom', [o('crankshaft_piston', '7', '13210-PT3-A00')], true),
  P('crankPulley', 'bottom', [o('crankshaft_piston', '20', '13810-P0A-003')]),
  P('crankFlange', 'bottom', [o('crankshaft_piston', '9', '13310-P0A-000')]),
  // balance system
  P('balancerFront', 'balance', [o('crankshaft_piston', '12', '13401-P5M-000')], true),
  P('balancerRear', 'balance', [o('crankshaft_piston', '11', '13400-PT3-010'), o('oil_pump_oil_strainer', '1', '13500-PT0-J00')], true),
  P('balancerBelt', 'balance', [o('camshaft_timing_belt', '11', '13405-PT0-004'), o('crankshaft_piston', '15', '13408-PT0-003'), o('crankshaft_piston', '13', '13402-PT7-A01')], true),
  P('balancerAdjuster', 'balance', [o('camshaft_timing_belt', '10', '13404-PT0-004')], true),
  // head and valvetrain
  P('head', 'head', [o('cylinder_head', '1', '12100-P0A-000')]),
  P('headGasket', 'head', [o('cylinder_head', '6', '12251-P0A-004')]),
  P('camshaft', 'head', [o('camshaft_timing_belt', '14', '14111-P0A-000')]),
  P('intakeValves', 'head', [o('valve_rocker_arm', '5', '14711-P0A-000'), o('valve_rocker_arm', '8', '14761-P0A-004')], true),
  P('exhaustValves', 'head', [o('valve_rocker_arm', '6', '14721-P0A-000'), o('valve_rocker_arm', '9', '14762-P0A-004')], true),
  P('exhaustRockers', 'head', [o('valve_rocker_arm', '2', '14624-P0A-000'), o('valve_rocker_arm', '3', '14625-P0A-000')], true),
  P('rockerShafts', 'head', [o('cylinder_head', '7', '14631-P0A-000'), o('cylinder_head', '8', '14633-P0A-000')], true),
  // VTEC
  P('primaryRocker', 'vtec', [o('valve_rocker_arm', '1', '14620-P0A-000')], true),
  P('middleRocker', 'vtec', [o('valve_rocker_arm', '1', '14620-P0A-000')], true),
  P('secondaryRocker', 'vtec', [o('valve_rocker_arm', '1', '14620-P0A-000')], true),
  P('syncPistons', 'vtec', [o('valve_rocker_arm', '1', '14620-P0A-000')], true),
  P('lostMotion', 'vtec', [o('valve_rocker_arm', '15', '14820-P0A-000')], true),
  P('timingPlate', 'vtec', [o('valve_rocker_arm', '13', '14811-P0A-000'), o('valve_rocker_arm', '14', '14812-P0A-000')], true),
  P('vtecSolenoid', 'vtec', [o('cylinder_head', '9', '15810-P0A-005'), o('cylinder_head', '11', '36171-P0A-005'), o('cylinder_head', '13', '37250-P07-003')], true),
  // timing drive
  P('timingBelt', 'timing', [o('camshaft_timing_belt', '16', '14400-P0A-004')], true),
  P('camPulley', 'timing', [o('camshaft_timing_belt', '15', '14210-PT0-003')]),
  P('crankTimingPulley', 'timing', [o('crankshaft_piston', '18', '13621-P0A-003')]),
  P('timingTensioner', 'timing', [o('camshaft_timing_belt', '17', '14510-PT0-004')], true),
  // intake and fuel
  P('intakeDuct', 'intake', [], true),
  P('throttleBody', 'intake', [o('throttle_body', '11', '16400-P0A-A60')]),
  P('plenum', 'intake', [o('intake_manifold', '13', '17110-P0A-A00')]),
  P('runners', 'intake', [o('intake_manifold', '11', '17100-P0A-A00')]),
  P('fuelRail', 'intake', [o('intake_manifold', '4', '16610-P0A-A00'), o('intake_manifold', '9', '16740-P0A-003')]),
  P('injectors', 'intake', [o('intake_manifold', '1', '06164-P0A-A00')], true),
  // exhaust
  P('exhaustManifold', 'exhaust', [o('exhaust_manifold', '2', '18000-P0A-010')], true),
  P('heatShield', 'exhaust', [o('exhaust_manifold', '4', '18120-P0A-A00')]),
  // ignition
  P('distributor', 'ignition', [o('distributor_hitachi', '1', '30100-P0A-A01')]),
  P('plugLeads', 'ignition', [o('high_tension_cord_spark_plug', '1', 'cord set')]),
  P('sparkPlugs', 'ignition', [o('high_tension_cord_spark_plug', '14', '98079-5514G')], true),
  // lubrication
  P('oilPump', 'oil', [o('oil_pump_oil_strainer', '3', '15100-PT0-020')], true),
  P('oilStrainer', 'oil', [o('oil_pump_oil_strainer', '7', '15220-P0A-C00')], true),
  P('oilFilter', 'oil', [o('oil_pump_oil_strainer', '13', '15400-PT7-005')]),
  P('dipstick', 'oil', [o('oil_pump_oil_strainer', '15', '15650-P0A-013')]),
  // cooling
  P('waterPump', 'cooling', [o('water_pump_sensor', '1', '19200-P0A-003')], true),
  P('thermostat', 'cooling', [o('water_pump_sensor', '4', '19301-PAA-306'), o('water_pump_sensor', '8', '19320-P0A-000')], true),
  P('coolantOutlet', 'cooling', [o('water_pump_sensor', '9', '19360-PT3-A00')]),
  // accessories
  P('alternator', 'accessory', [o('alternator_denso', '1', '06311-P0A-A01RM')]),
  P('psPump', 'accessory', [o('p_s_pump_bracket', '3', '56110-P0A-013'), o('p_s_pump_bracket', '5', '56483-P0A-003')]),
  P('accessoryBelts', 'accessory', [o('p_s_pump_bracket', '6', '56992-P0A-J01')], true),
  P('psHose', 'accessory', [], true),
];
export const PART = Object.fromEntries(PARTS.map((p) => [p.id, p]));
