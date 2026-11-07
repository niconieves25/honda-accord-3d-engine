# Honda F22 engine — reference brief for the teardown skill

Use this brief with my ten engine photographs to build the interactive engine explainer described by your skill. The purpose is to help my father, who has glaucoma, recognize the engine's parts and understand their locations, connections and operation. Prioritize a recognizable exterior and mechanically coherent internal motion. Follow the photographs for visible geometry and the cited Honda material for the internal mechanism.

**1. Identity and scope**

- Vehicle reference: Honda Accord, 1994–1997, 2.2-liter F22 family.
- Photos show a cover marked VTEC and an assembly consistent with SOHC VTEC. The stamped engine code is unreadable: **F22B1 is the provisional technical reference, not a confirmed identification of the photographed engine.** An unsuffixed F22B market variant remains possible. Confirm the block stamp and market before claiming an exact factory match.
- Use the photographed stock-looking configuration; no turbo or modifications have been requested.
- English is a provisional interface language. Video and narration language preferences remain unspecified. The interactive page is the core use case.

**2. Supplied photographs**

The ten original photographs are in the project’s `Pictures of engine` folder: `/Users/juannicolasnievesramos/Desktop/Honda Accord Motor Project/Pictures of engine/`. From the `Honda Reference Library` folder, this is `../Pictures of engine/`:

| File | Main reference |
|---|---|
| `honda 1.jpeg` | Intake/timing-side three-quarter view; suggested default hero angle |
| `honda 2.jpeg` | Top/intake view: manifold, fuel rail, throttle body, plug leads |
| `honda 3.jpeg` | Timing/accessory end |
| `honda 4.jpeg` | Duplicate of photo 3 |
| `HONDA 5.jpeg` | Top/exhaust view; VTEC cover clearly visible |
| `honda 6.jpeg` | Exhaust/timing-side three-quarter view |
| `honda 7.jpeg` | Exhaust side, shield, alternator, power-steering pump |
| `honda 8.jpeg` | Transmission end; crankshaft output flange exposed |
| `honda 9.jpeg` | Intake side; manifold runners and oil filter |
| `honda 10.jpeg` | Duplicate of photo 1 |

Visible materials: gray metal valve cover with Honda/VTEC markings; rough gray cast-aluminum block, head and intake manifold; black timing covers, hoses, intake duct and painted oil pan; weathered pulleys; rust-speckled exhaust heat shield. Match shapes and placement before surface detail. Distinguish the heat shield from the manifold underneath it. The upper exposed pulley in photo 3 belongs to the power-steering pump; the camshaft pulley is behind the black timing cover. The dark canister low on the intake side in photo 9 is the oil filter. The transmission and flywheel/drive plate are absent from the photographed assembly.

**3. Verified reference specifications**

| Parameter | Reference value |
|---|---|
| Layout | Transverse inline four; four-stroke gasoline engine |
| Displacement | 2,156 cm³; approximately 539 cm³ per cylinder |
| Bore × stroke | 85.0 × 95.0 mm |
| Crank radius | 47.5 mm, derived from half the stroke |
| Compression ratio | 8.8:1 |
| 1994 US Accord EX output | 145 hp at 5,500 rpm; 147 lb ft, approximately 199 N m, at 4,500 rpm |
| Valve train | One overhead camshaft; 16 valves: 8 intake and 8 exhaust; intake VTEC |
| Fuel system | Sequential multiport PGM-FI; four port injectors |
| Ignition | Electronically controlled spark timing with distributor and four plug leads |
| Lubrication | Pressurized wet sump; trochoid oil pump |

Sources: [Honda's 1994 US specifications](https://hondanews.com/en-US/releases/release-ce695ed4e4dc2645d260f5004c34ca33-1994-honda-accord-coupe-specifications), [1996 Honda service supplement, design specifications](https://automotrizenvideo.com/wp-content/uploads/2011/12/Honda_Accord_Coupe_Aerodeck_1996_taller_english.pdf).

Construction: aluminum-alloy head and block, cast-iron cylinder sleeves, central spark plugs in pent-roof combustion chambers, forged crankshaft with five main supports and eight counterweights. Include four pistons, four rods, wrist pins, top/second compression rings and oil-control ring assemblies, bearing shells, head gasket, valve springs, guides, seals, rocker shafts, oil pickup and two balance shafts. [Honda factory manual, engine construction, printed pages 5-2–5-3](https://www.scribd.com/document/997485691/Honda-Accord-1994-1997-Service-Manual).

**4. Dimensional detail**

Values below are new-part standards from the **1996 service supplement**, subject to exact variant applicability. Dimensions in millimeters. They describe selected fits and components, not complete manufacturing drawings.

| Measurement | Value |
|---|---:|
| Head height | 99.95–100.05 |
| Bore, class A/I | 85.010–85.020 |
| Bore, class B/II | 85.000–85.010 |
| Piston skirt, unlettered / B | 84.980–84.990 / 84.970–84.980 |
| Skirt measuring location | 21 mm above skirt bottom |
| Piston-to-cylinder clearance | 0.020–0.040 |
| Wrist pin diameter | 21.994–22.000 |
| Rod big-end bore | 51.0 nominal |
| Crank rod journal diameter | 47.976–48.000 |
| Main journal diameters | Approximately 50; individual position ranges differ |
| Top / second ring groove width | 1.220–1.230 each |
| Oil ring groove width | 2.805–2.825 |
| Cold intake / exhaust valve lash | 0.24–0.28 / 0.28–0.32 |
| Intake / exhaust valve stem diameter | 5.485–5.495 / 5.450–5.460 |
| F22B1 intake cam overall lobe height: primary / middle / secondary | 37.775 / 39.725 / 34.481 |
| F22B1 exhaust cam overall lobe height | 38.366 |

**Lobe overall height is not valve lift.** Groove width is not ring thickness. [Honda service supplement, printed pages 3-2–3-3](https://automotrizenvideo.com/wp-content/uploads/2011/12/Honda_Accord_Coupe_Aerodeck_1996_taller_english.pdf).

**5. Motion and timing**

Drive the mechanical animation from one crank angle, with a separate 720° combustion-cycle state:

- Cylinder numbering runs 1–2–3–4 from the timing-belt end to the transmission end. Firing order: **1–3–4–2**.
- Pistons 1/4 share position; pistons 2/3 share position, opposed to 1/4. Shared position does not mean shared combustion stroke.
- Define 0° as cylinder 1 compression TDC for explanation. Successive compression TDC events: cylinder 1 at 0°, 3 at 180°, 4 at 360°, 2 at 540°; repeat at 720°. Actual spark timing can precede TDC.
- Per-cylinder idealized stroke sequence after compression TDC: power 0–180°, exhaust 180–360°, intake 360–540°, compression 540–720°. Real valve openings overlap stroke boundaries; these intervals are teaching conventions.
- Camshaft speed = 0.5 × crank speed. Crank rotates counterclockwise viewed from the pulley end. Preserve viewpoint labels.
- Two balance shafts counter-rotate at 2 × crank speed; their installed phase requires the factory timing references.
- Internal timing belt links crank drive pulley, tensioner, water pump and cam pulley. A separate balancer belt drives the balance system. External accessory belts are separate; accessory ratios need measured pulley diameters.

References: [Honda ignition service information](https://charm.li/Honda/1994/Accord%20L4-2.2L%20SOHC%20VTEC/Repair%20and%20Diagnosis/Powertrain%20Management/Ignition%20System/Firing%20Order/), [Honda timing belt procedure](https://charm.li/Honda/1994/Accord%20L4-2.2L%20SOHC%20VTEC/Repair%20and%20Diagnosis/Engine%2C%20Cooling%20and%20Exhaust/Engine/Timing%20Components/Timing%20Belt/Service%20and%20Repair/Installation/), [Honda's balance-system explanation](https://hondanews.com/en-US/releases/1990-honda-accord-drivetrain), [1994 system continuity](https://hondanews.com/en-US/honda-automobiles/releases/release-ff6920cad66264558865b7004c34ca33-1994-honda-accord-introduction).

For an ideal centered slider-crank, piston travel downward from TDC is:

`s(θ) = r(1 − cos θ) + L − sqrt(L² − r² sin² θ)`

Here `r = 47.5 mm`, `L` is rod center-to-center length, and θ is the mechanical crank phase in radians. **L and piston-pin offset have not been verified.** This equation is a general kinematic model, not a measured F22B1 motion curve. Identify any assumed values.

**6. F22B1 VTEC mechanism — essential detail**

Each cylinder has primary, middle and secondary intake rockers. At low speed, one intake valve opens normally, the second only slightly. The unequal flow promotes swirl; slight opening prevents fuel accumulation. The middle rocker follows its larger cam lobe against a lost-motion assembly without operating the valves.

When commanded, the solenoid admits pressurized oil. Synchronizing pistons lock all three intake rockers together; both valves then follow the middle lobe. Releasing pressure lets a return spring separate them. A timing plate coordinates completion of switching at zero lift. Exhaust actuation remains separate. Depict profile switching, with no continuous cam phaser.

The early factory manual specifies switching at approximately **2,300–3,200 rpm depending on manifold pressure**, vehicle speed ≥10 km/h and coolant ≥10°C, with load considered. Do not use a universal fixed engagement RPM. Show VTEC as a selectable educational state until the exact ECU/market is established. [Honda factory manual, printed pages 5-4–5-9](https://www.scribd.com/document/997485691/Honda-Accord-1994-1997-Service-Manual).

**7. Functional explanations and flow overlays**

- **Air/fuel:** intake duct → throttle butterfly → plenum → four runners → intake ports/valves → cylinders. Injectors spray into ports. Explain that the throttle regulates airflow and the ECU controls injector pulses.
- **Combustion:** intake draws charge in; compression squeezes it; the spark initiates burning; expanding gas loads the piston, rod and crank; exhaust valves release burned gas. The central spark plug, valve seats and head gasket belong in the cutaway.
- **Exhaust:** exhaust valves → head ports → manifold under the visible shield → vehicle exhaust/catalyst, which is outside the photographed assembly.
- **Oil:** sump → pickup/pump → filter → branching galleries supplying bearings and head/VTEC → gravity return to sump. Show branching rather than suggesting every bearing is supplied in series. Flow is schematic until actual drilling routes are referenced.
- **Coolant:** pump circulates coolant through block/head water jackets; thermostat and radiator circuit regulate temperature. Include the bypass/heater circuit only with appropriate references. Oil and coolant passages remain separate.
- **Ignition:** ECU-controlled ignition event → distributor → plug lead → spark plug; sensors synchronize ignition and sequential injection. [Honda engine description](https://www.scribd.com/document/997485691/Honda-Accord-1994-1997-Service-Manual), [F22B1 cylinder-position sensor description](https://charm.li/Honda/1997/Accord%20EX%20Sedan%20L4-2156cc%202.2L%20SOHC%20%28VTEC%29%20MFI/Repair%20and%20Diagnosis/A%20L%20L%20%20Diagnostic%20Trouble%20Codes%20%28%20DTC%20%29/Testing%20and%20Inspection/P%20Code%20Charts/P1382/).

If showing numerical gauges, label their meaning: **8.8:1 is geometric compression ratio**; **178 psi is nominal cranking-test pressure under specified conditions**. Hot oil-pressure minima are **10 psi at idle and 50 psi at 3,000 rpm, oil at 80°C**. These are service-test values, not simulated live pressure curves. [Honda service supplement, printed pages 3-2 and 3-4](https://automotrizenvideo.com/wp-content/uploads/2011/12/Honda_Accord_Coupe_Aerodeck_1996_taller_english.pdf).

**8. Accessibility and exploration**

Provide adjustable large labels, strong contrast, plain-language explanations, spoken part names, keyboard/button navigation, pause/step and slow-motion controls, reduced motion, and a reset view. Use labels/arrows as well as color. Let the viewer isolate one system or part while preserving an orientation cue. Keep these views: assembled exterior; valve cover removed; timing covers removed; one-cylinder cutaway; lower block/crank; VTEC close-up. Give each selectable part its name, location, purpose, connections and motion. Check readability with my father; glaucoma alone does not establish one preferred color scheme or text size.

**9. Accuracy limits and source navigation**

Not yet verified: exact engine stamp/year/market; overall engine dimensions; cylinder spacing; deck height; rod length; piston crown and pin offset; valve head diameters/angles; cam base circles, lift curves, rocker ratios, timing/overlap; exact coolant/oil drilling geometry; accessory pulley ratios. Exterior photos do not establish these. Mark approximations visibly in the technical notes and keep them replaceable. Avoid claiming manufacturing accuracy, exact valve lift or computed cylinder pressure from the known dimensions alone.

Use [the full Honda shop-manual contents](https://www.manualslib.com/manual/464690/Honda-Accord.html) to locate: section 5 construction/VTEC, section 6 head/rockers/timing belts, section 7 pistons/crank/balance shafts, section 8 lubrication, section 9 manifolds/exhaust, section 10 cooling and section 11 fuel/emissions. These contain exploded diagrams and inspection references; exploded illustrations are not scale drawings. Supplementary teardown context: [Honda-Tech F22B1 belt/water-pump walkthrough](https://honda-tech.com/forums/honda-accord-1990-2002-2/how-replace-timing-belt-timing-balancer-belt-water-pump-f22b1-1908944/) and [intake-valve behavior discussion](https://honda-tech.com/forums/honda-accord-1990-2002-2/valve-opening-issue-f22b1-3162430/). Prefer factory evidence when forum statements conflict.

**10. OEM diagram set — HondaPartsNow**

Use the [1994 Accord 4 Door EX KL 4AT catalog](https://www.hondapartsnow.com/1994-honda-accord--4dr_ex-kl_4at-parts.html) as the provisional US SOHC VTEC assembly reference. This selection retains the year/body/transmission category the user found and changes DX to EX. The photographed VTEC assembly is better represented by this EX head and rocker catalog. The selection does not establish the photographed engine's original market, model year, transmission or exact code. Confirm those independently before treating accessories, emissions equipment or connectors as exact matches.

The cylinder-head page explicitly lists the spool valve, solenoid and valve-timing oil-pressure switch. The rocker page explicitly lists the timing plates and lost-motion assemblies. These are useful checks that the selected illustrations cover the VTEC mechanism. Use the following numbered callouts together with their part descriptions; a catalog number is not a measurement.

| Priority | Direct diagram | Use |
|---|---|---|
| Core | [Cylinder head](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/cylinder_head.html) | Head, guides/seals, gasket, rocker shafts and VTEC oil-control hardware |
| Core | [Valve–rocker arm](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/valve_rocker_arm.html) | Intake rocker assemblies, exhaust rockers, 16 valves, springs, retainers, cotters, adjusters, timing plates and lost-motion assemblies |
| Core | [Camshaft–timing belt](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/camshaft_timing_belt.html) | Single camshaft, cam pulley, timing and balancer belts, separate adjusters, springs and covers |
| Core | [Crankshaft–piston](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/crankshaft_piston.html) | Pistons, rods, crankshaft, bearings, drive pulleys and both balance shafts |
| Core | [Cylinder block–oil pan](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/cylinder_block_oil_pan.html) | Block, pan and balance-shaft bearing locations |
| Core | [Oil pump–oil strainer](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/oil_pump_oil_strainer.html) | Pump, gear case, pickup, relief valve/spring, filter, dipstick and oil seals |
| Core | [Water pump–sensor](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/water_pump_sensor.html) | Pump, thermostat/case, connecting pipe, outlet cover, bleed bolt and temperature sensing parts |
| Core | [Intake manifold](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/intake_manifold.html) | Manifold sections, injectors/seals, fuel pipes, pressure regulator, EGR chamber and valve |
| Exterior | [Cylinder head cover](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/cylinder_head_cover.html) | Valve cover and its sealing/fastening arrangement |
| Exterior | [Exhaust manifold](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/exhaust_manifold.html) | Exhaust assembly reference; compare shield shape with photos 5–7 |
| Controls | [Throttle body](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/throttle_body.html) | Throttle assembly reference |
| Ignition | [Distributor, Hitachi](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/distributor_hitachi.html) | Distributor assembly; confirm supplier/connector match with actual engine |
| Ignition | [High-tension cord–spark plug](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/high_tension_cord_spark_plug.html) | Plug leads and plugs |
| Routing | [Breather tube](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/breather_tube.html) | Breather plumbing reference |
| Routing | [Water hose](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/water_hose.html) | External coolant hose reference |
| Routing | [Install pipe–tubing](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/install_pipe_tubing.html) | Additional tube and pipe routing reference |
| Routing | [Engine wire harness–clamp](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/engine_wire_harness_clamp.html) | Harness and clamp reference; connector details remain variant dependent |
| Accessory | [Alternator, Denso](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/alternator_denso.html) | Alternator reference |
| Accessory | [Power-steering pump–bracket](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/p_s_pump_bracket.html) | Upper external pump and mounting reference |
| Optional | [Clutch–torque converter](https://www.hondapartsnow.com/parts-list/1994-honda-accord--4dr_ex-kl_4at/engine/clutch_torque_converter.html) | Automatic-transmission interface; not present in supplied photos and not confirmed as the donor's transmission |

Useful catalog identifiers, checked on 2026-11-06:

- Head: `12100-P0A-000`; spool valve: `15810-P0A-005`; original solenoid: `36171-P0A-005` (listed replacement `36171-P0A-015`).
- Four inlet rocker **assemblies**: `14620-P0A-000`. Four timing plates: `14811-P0A-000`. Four original lost-motion assemblies: `14820-P0A-000` (listed replacement `14820-PAA-305`). An assembly contains subcomponents; four assemblies does not mean only four individual intake rockers.
- Camshaft: `14111-P0A-000`; timing belt: `14400-P0A-004`; balancer belt: `13405-PT0-004`.
- Crankshaft–piston diagram ref. 11: rear balance shaft `13400-PT3-010`; ref. 12: front balance shaft `13401-P5M-000`. Their bearings appear in the block diagram; the gear case appears in the oil-pump diagram. Read these three drawings together.

**Interpretation rules:** Exploded drawings show assembly relationships, not installed separation or exact scale. Preserve gaskets, washers, seals and fasteners when relevant to the chosen level of detail. “Require Quantity” is the installed requirement; “Package Quantity” is a sales quantity. Alternative piston sizes, bearing color grades, factory origins and superseded part numbers are alternatives, not extra parts to fit simultaneously. Catalog illustrations alone do not specify cam profiles, oil/coolant passage geometry or full motion; use the factory manual sections above for operation. Match original photo geometry when a later service replacement differs.


**11. Local reference package**

This brief is in `Honda Reference Library/01_Research/`. Open `../index.html` for the offline diagram index. The `../02_OEM_Diagrams/` folder contains 20 full-size diagram PNGs and matching JSON records with numbered callouts, part numbers, descriptions, quantities and source URLs. `../Catalog_Parts.csv` combines the catalog entries for searching. Alternatives and superseded numbers are not additional installed parts.

The `../03_Service_References/` folder contains the verified 280-page 1996 Accord Coupe/Aerodeck service supplement and its source record. This is not the complete 1994–1997 shop manual. The remaining factory-manual, Honda press-material and forum references are retained as online links in `../Source_Reading_List.txt` and this brief. The photographed engine’s exact stamped code remains unconfirmed.
