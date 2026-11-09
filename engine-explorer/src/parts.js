// Active F22A6 assembly registry. Catalogue references identify assembly relationships;
// dimensions reconstructed from illustrations are not manufacturing measurements.
// KA is a source listing, NOT an assertion of the car's emissions market.
export const REFERENCE_ROOT = '../Honda Reference Library/F22A6_1993_5MT/01_OEM_Diagrams/';
export const SYSTEMS = ['exterior','bottom','balance','head','timing','intake','exhaust','ignition','oil','cooling','accessory','manual'];
export const PARTS = [
  {
    "id": "valveCover",
    "system": "exterior",
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "callout": "2",
        "pn": "12310-PT3-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "oilCap",
    "system": "exterior",
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "callout": "5",
        "pn": "15610-PC6-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "timingCoverUpper",
    "system": "exterior",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "3",
        "pn": "11820-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "timingCoverLower",
    "system": "exterior",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "1",
        "pn": "11810-PT0-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "engineMount",
    "system": "exterior",
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "callout": "9",
        "pn": "11910-PT0-020",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "oilPan",
    "system": "exterior",
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "callout": "5",
        "pn": "11200-PT0-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "block",
    "system": "bottom",
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "callout": "1",
        "pn": "11000-PT0-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "bearingBridge",
    "system": "bottom",
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "callout": "4",
        "pn": "11130-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "crankshaft",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "8",
        "pn": "13310-PT3-315",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "pistons",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "2",
        "pn": "13101-PT3-A01",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "rings",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "1",
        "pn": "13011-PT2-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "wristPins",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "3",
        "pn": "13112-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "rods",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "5",
        "pn": "13210-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "crankPulley",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "18",
        "pn": "13810-PT1-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "crankFlange",
    "system": "bottom",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "8",
        "pn": "13310-PT3-315",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "balancerFront",
    "system": "balance",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "12",
        "pn": "13401-P5M-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "balancerRear",
    "system": "balance",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "11",
        "pn": "13400-PT3-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "balancerBelt",
    "system": "balance",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "11",
        "pn": "13405-PT0-004",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "balancerAdjuster",
    "system": "balance",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "10",
        "pn": "13404-PT0-004",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "head",
    "system": "head",
    "oem": [
      {
        "diagram": "cylinder_head",
        "callout": "1",
        "pn": "12100-PT3-A01",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "headGasket",
    "system": "head",
    "oem": [
      {
        "diagram": "cylinder_head",
        "callout": "6",
        "pn": "12251-PT0-014",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "camshaft",
    "system": "head",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "14",
        "pn": "14111-PT4-F50",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "intakeValves",
    "system": "head",
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "callout": "7",
        "pn": "14711-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "exhaustValves",
    "system": "head",
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "callout": "8",
        "pn": "14721-P0J-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "exhaustRockers",
    "system": "head",
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "callout": "3",
        "pn": "14623-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "rockerShafts",
    "system": "head",
    "oem": [
      {
        "diagram": "cylinder_head",
        "callout": "7",
        "pn": "14631-PT0-010",
        "market": "KA"
      },
      {
        "diagram": "cylinder_head",
        "callout": "8",
        "pn": "14632-PT0-010",
        "market": "KA"
      },
      {
        "diagram": "cylinder_head",
        "callout": "9",
        "pn": "14633-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "timingBelt",
    "system": "timing",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "16",
        "pn": "14400-PT0-004",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "camPulley",
    "system": "timing",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "15",
        "pn": "14210-PT0-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "crankTimingPulley",
    "system": "timing",
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "callout": "16",
        "pn": "13621-PT0-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "timingTensioner",
    "system": "timing",
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "callout": "17",
        "pn": "14510-PT0-004",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "intakeDuct",
    "system": "intake",
    "oem": [
      {
        "diagram": "air_cleaner",
        "callout": "6",
        "pn": "17225-PT2-010",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "throttleBody",
    "system": "intake",
    "oem": [
      {
        "diagram": "throttle_body",
        "callout": "6",
        "pn": "16400-PT6-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "plenum",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "10",
        "pn": "17010-PT9-A01",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "runners",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "11",
        "pn": "17100-PT9-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "fuelRail",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "5",
        "pn": "16610-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "injectors",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "1",
        "pn": "06164-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "exhaustManifold",
    "system": "exhaust",
    "oem": [
      {
        "diagram": "exhaust_manifold",
        "callout": "2",
        "pn": "18100-PT6-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "heatShield",
    "system": "exhaust",
    "oem": [
      {
        "diagram": "exhaust_manifold",
        "callout": "4",
        "pn": "18120-PT6-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "distributor",
    "system": "ignition",
    "oem": [
      {
        "diagram": "distributor_tec",
        "callout": "1",
        "pn": "30100-PT3-A12",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "plugLeads",
    "system": "ignition",
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "callout": "4",
        "pn": "32701-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "sparkPlugs",
    "system": "ignition",
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "callout": "17",
        "pn": "98079-5514G",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "oilPump",
    "system": "oil",
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "callout": "7",
        "pn": "15100-PT0-020",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "oilStrainer",
    "system": "oil",
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "callout": "14",
        "pn": "15220-P0A-C00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "oilFilter",
    "system": "oil",
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "callout": "20",
        "pn": "15400-PT7-005",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "dipstick",
    "system": "oil",
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "callout": "19",
        "pn": "15650-PT0-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "waterPump",
    "system": "cooling",
    "oem": [
      {
        "diagram": "water_pump",
        "callout": "1",
        "pn": "19200-P0A-003",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "thermostat",
    "system": "cooling",
    "oem": [
      {
        "diagram": "water_pump",
        "callout": "9",
        "pn": "19320-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "coolantOutlet",
    "system": "cooling",
    "oem": [
      {
        "diagram": "water_pump",
        "callout": "10",
        "pn": "19360-PT3-A00",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "alternator",
    "system": "accessory",
    "oem": [
      {
        "diagram": "alternator_denso",
        "callout": "1",
        "pn": "31100-PT3-A52",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "psPump",
    "system": "accessory",
    "oem": [
      {
        "diagram": "p_s_pump",
        "callout": "2",
        "pn": "56110-PT0-050",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "accessoryBelts",
    "system": "accessory",
    "oem": [
      {
        "diagram": "p_s_pump",
        "callout": "10",
        "pn": "56992-PT0-J03",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "psHose",
    "system": "accessory",
    "oem": [],
    "approx": true,
    "evidence": "approximate"
  },
  {
    "id": "intakeRockers",
    "system": "head",
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "callout": "1",
        "pn": "14621-PT0-000",
        "market": "KA"
      },
      {
        "diagram": "valve_rocker_arm",
        "callout": "2",
        "pn": "14622-PT0-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabBody",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "14",
        "pn": "17120-PT2-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabButterflies",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "14",
        "pn": "17120-PT2-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabShaft",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "14",
        "pn": "17120-PT2-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabActuator",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "17",
        "pn": "17129-PT2-000",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabSolenoid",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "24",
        "pn": "36163-PT2-004",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "iabVacuumTank",
    "system": "intake",
    "oem": [
      {
        "diagram": "intake_manifold",
        "callout": "25",
        "pn": "36361-PT2-014",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "ignitionCoil",
    "system": "ignition",
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "callout": "3",
        "pn": "30520-PT9-A02",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "flywheel",
    "system": "manual",
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "callout": "3",
        "pn": "22100-PT7-013",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "clutchDisc",
    "system": "manual",
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "callout": "4",
        "pn": "22200-PT1-020",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  },
  {
    "id": "clutchPressurePlate",
    "system": "manual",
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "callout": "5",
        "pn": "22300-PT7-023",
        "market": "KA"
      }
    ],
    "approx": true,
    "evidence": "visually reconstructed"
  }
];
export const PART = Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const REMOVED_ENGINE_PARTS = ["primaryRocker", "middleRocker", "secondaryRocker", "syncPistons", "lostMotion", "timingPlate", "vtecSolenoid"];
