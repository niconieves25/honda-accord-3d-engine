# Canonical F22A6 assembly inventory

## Coverage / Cobertura

- Engine: confirmed F22A6, 1993 Accord EX sedan, 5MT. Market and emissions remain unresolved.
- 102/102 existing catalogue types represented in the canonical complete engine.
- 374 installed presentation units; 21 additional structural/detail types with bilingual names and no invented independent OEM reference.
- 1649 physical source meshes assigned exactly once; combustion charge/spark effects excluded.
- These are modeled occurrences, not a factory-complete bill of materials. Unitemized fasteners and casting details remain with their supporting assembly. Mesh count, presentation-unit count and catalogue-type count describe different things.

## Ownership and reuse

The inventory freezes buildEngine({consolidate:false,detailedRegistry:true}) at crank angle 0, IAB closed, effects disabled, root scale 1. World-space rest matrices are millimetres; the renderer alone converts to metres. Each physical source mesh has one owner. The runtime clones meshes while retaining source geometry and materials and does not reparent source objects.

Specific component tags take precedence over enclosing castings. Valve cover gaskets, seals and nuts no longer duplicate the cover shell in individual/assembly views; rods exclude removable caps, bearings and bolts. Main caps and cam holders have individual occurrences. Exhaust branches remain part of one continuous exhaust-manifold casting. Composite oil-ring packs and each complete routed belt install as one unit. Belt-tooth instances are retained as one physical belt; they are not counted as separate replacement parts.

Previously 78 catalogue types extracted from the complete engine and 24 used independent illustrations. All 102 now extract their first canonical occurrence in Anatomy. Existing shells are reused for injectors, pumps, regulator, IAB solenoid, dipstick and throttle. Selected existing Anatomy recipes supply missing interiors and components; a curated 228 KB shape-data subset avoids importing the full illustrated scene collection into the main engine. No second geometric version is generated per viewer.

## Corrected repetitions

- Four piston, pin, rod and each compression/oil-ring occurrence; eight rod half-bearings and eight documented rod bolts.
- Ten main half-bearings at five journals, including five added upper shells. Two thrust washers use the half-ring topology visible at crankshaft_piston callout 10; radii, depth and installed socket are illustrative.
- Eight inlet and eight exhaust valves, sixteen retainers, thirty-two keeper halves, sixteen springs and spring seats, and sixteen adjustment screws/locknuts.
- Eight exhaust guides and eight exhaust stem seals already existed in the model but were untagged. They now have explicit extra IDs; their specific OEM references remain unresolved. Inlet part numbers are not reused for exhaust parts.
- Five cam holders and five main caps are separate physical occurrences; other undocumented individual fasteners stay with their supporting assembly.

## Evidence and operating limits

Every unit supplies evidence and note.es / note.en. Added recipe geometry and sockets are explicitly illustrative, including EGR/PCV locations, fuel-regulator interiors, control plungers, coolant pipe/sensor, thermostat, alternator rotor/rectifier and pump interiors. Shapes do not assert measured manufacturing dimensions, tolerance fits, service clearances or emissions routing. Some interiors remain hidden by their housing in the normal exterior view.

Operating state demonstrations are independent of crank-driven mechanics. Normal engine playback keeps throttle and pressure/thermal/control examples at their default states; isolated Anatomy playback explicitly requests the selected component's demonstration. Pump rotors follow the model's existing drive relationships. The existing water-pump pulley ratio is not a newly asserted factory tooth ratio and does not necessarily close after 720 crank degrees.

Assembly travel is educational. Flexible belts and hoses retain their routed shape; no physical threading/deformation, tool clearance, bolt torque or workshop procedure is simulated. Enclosing geometry may be ghosted for teaching without changing final physical placement.

## Chapters

| Chapter | Units |
|---|---:|
| closures | 20 |
| attachments | 37 |
| bottom | 20 |
| pistons | 44 |
| lubrication | 6 |
| timing | 14 |
| head | 129 |
| valvetrain | 70 |
| head-join | 1 |
| intake | 33 |

## Catalogue occurrence audit

Counts come from explicit source occurrences. OEM alternatives, supersessions and package quantities are not added together.

| Catalogue ID | Installed units | Geometry evidence |
|---|---:|---|
| cover-valves | 1 | visually reconstructed |
| gasket-valve-cover | 1 | visually reconstructed |
| seal-plug-tube | 4 | visually reconstructed |
| cap-oil-filler | 1 | visually reconstructed |
| gasket-oil-cap | 1 | illustrative |
| cover-timing-upper | 1 | visually reconstructed |
| cover-timing-lower | 1 | visually reconstructed |
| nut-valve-cover | 4 | visually reconstructed |
| washer-valve-cover | 4 | visually reconstructed |
| block-cylinders | 1 | visually reconstructed |
| piston | 4 | visually reconstructed |
| ring-top | 4 | visually reconstructed |
| ring-second | 4 | visually reconstructed |
| ring-oil | 4 | visually reconstructed |
| piston-pin | 4 | visually reconstructed |
| connecting-rod | 4 | visually reconstructed |
| connecting-rod-cap | 4 | illustrative |
| bearing-rod | 8 | visually reconstructed |
| crankshaft | 1 | visually reconstructed |
| bearing-main | 10 | visually reconstructed |
| washer-thrust | 2 | illustrative |
| bridge-main-bearing | 1 | visually reconstructed |
| bolt-connecting-rod | 8 | visually reconstructed |
| shaft-balance-front | 1 | visually reconstructed |
| shaft-balance-rear | 1 | visually reconstructed |
| belt-balance | 1 | visually reconstructed |
| tensioner-balance | 1 | visually reconstructed |
| cylinder-head | 1 | visually reconstructed |
| gasket-cylinder-head | 1 | visually reconstructed |
| camshaft | 1 | visually reconstructed |
| valve-inlet | 8 | visually reconstructed |
| valve-exhaust | 8 | visually reconstructed |
| spring-valve-inlet | 8 | visually reconstructed |
| spring-valve-exhaust | 8 | visually reconstructed |
| retainer-valve | 16 | visually reconstructed |
| keepers-valve | 32 | visually reconstructed |
| guide-valve | 8 | visually reconstructed |
| seal-valve-stem | 8 | visually reconstructed |
| screw-valve-lash | 16 | visually reconstructed |
| rocker-inlet-a | 4 | visually reconstructed |
| rocker-inlet-b | 4 | visually reconstructed |
| rocker-exhaust | 8 | visually reconstructed |
| shaft-inlet-rockers-a | 2 | visually reconstructed |
| shaft-inlet-rockers-b | 3 | visually reconstructed |
| shaft-exhaust-rockers | 1 | visually reconstructed |
| spring-rocker-a | 3 | visually reconstructed |
| spring-rocker-b | 2 | visually reconstructed |
| washer-rocker-wave | 5 | visually reconstructed |
| belt-timing | 1 | visually reconstructed |
| pulley-camshaft | 1 | visually reconstructed |
| pulley-crank-timing | 1 | visually reconstructed |
| tensioner-timing | 1 | visually reconstructed |
| spring-timing-adjuster | 1 | illustrative |
| seal-camshaft | 1 | illustrative |
| duct-intake | 1 | illustrative |
| throttle-butterfly | 1 | illustrative |
| plenum-intake | 1 | visually reconstructed |
| runner-intake | 4 | illustrative |
| injector-fuel | 4 | illustrative |
| seal-injector | 4 | visually reconstructed |
| rail-fuel | 1 | visually reconstructed |
| regulator-fuel | 1 | illustrative |
| valve-egr | 1 | illustrative |
| valve-pcv | 1 | illustrative |
| iab-body | 1 | visually reconstructed |
| iab-butterfly | 4 | visually reconstructed |
| iab-shaft | 1 | visually reconstructed |
| iab-actuator | 1 | visually reconstructed |
| iab-solenoid | 1 | illustrative |
| iab-vacuum-chamber | 1 | visually reconstructed |
| iab-check-valve | 1 | illustrative |
| gasket-iab | 2 | visually reconstructed |
| manifold-exhaust | 1 | visually reconstructed |
| shield-exhaust | 1 | visually reconstructed |
| gasket-exhaust | 1 | illustrative |
| housing-distributor | 1 | visually reconstructed |
| cap-distributor | 1 | visually reconstructed |
| rotor-distributor | 1 | visually reconstructed |
| coil-ignition | 1 | visually reconstructed |
| lead-spark-plug | 4 | visually reconstructed |
| spark-plug | 4 | visually reconstructed |
| pan-oil | 1 | visually reconstructed |
| pump-oil | 1 | illustrative |
| strainer-oil | 1 | visually reconstructed |
| valve-oil-relief | 1 | illustrative |
| spring-oil-relief | 1 | illustrative |
| filter-oil | 1 | visually reconstructed |
| dipstick-oil | 1 | visually reconstructed |
| pump-water | 1 | illustrative |
| thermostat | 1 | illustrative |
| outlet-coolant | 1 | visually reconstructed |
| pipe-coolant | 1 | illustrative |
| sensor-coolant | 1 | illustrative |
| alternator | 1 | visually reconstructed |
| rotor-alternator | 1 | illustrative |
| rectifier-alternator | 1 | illustrative |
| pump-power-steering | 1 | illustrative |
| pulley-power-steering | 1 | visually reconstructed |
| belt-power-steering | 1 | illustrative |
| flywheel | 1 | visually reconstructed |
| clutch-disc | 1 | visually reconstructed |
| clutch-pressure-plate | 1 | visually reconstructed |

## Additional modeled details

| ID | Installed units | Note |
|---|---:|---|
| engine-mount | 1 | Structural or supporting detail; no independent OEM reference asserted |
| main-bearing-cap | 5 | Structural or supporting detail; no independent OEM reference asserted |
| pulley-crank-accessory | 1 | Structural or supporting detail; no independent OEM reference asserted |
| gear-balance-rear | 1 | Structural or supporting detail; no independent OEM reference asserted |
| gear-balance-input | 1 | Structural or supporting detail; no independent OEM reference asserted |
| pulley-balance-crank | 1 | Structural or supporting detail; no independent OEM reference asserted |
| pulley-balance-front | 1 | Structural or supporting detail; no independent OEM reference asserted |
| pulley-balance-input | 1 | Structural or supporting detail; no independent OEM reference asserted |
| camshaft-holder | 5 | Structural or supporting detail; no independent OEM reference asserted |
| seat-valve-spring | 16 | Structural or supporting detail; no independent OEM reference asserted |
| guide-valve-exhaust | 8 | Exhaust OEM reference unresolved |
| seal-valve-stem-exhaust | 8 | Exhaust OEM reference unresolved |
| nut-valve-lash | 16 | Structural or supporting detail; no independent OEM reference asserted |
| throttle-body | 1 | Structural or supporting detail; no independent OEM reference asserted |
| intake-support | 1 | Structural or supporting detail; no independent OEM reference asserted |
| lead-support | 1 | Structural or supporting detail; no independent OEM reference asserted |
| lead-ignition-center | 1 | Structural or supporting detail; no independent OEM reference asserted |
| thermostat-housing | 1 | Structural or supporting detail; no independent OEM reference asserted |
| belt-alternator | 1 | Structural or supporting detail; no independent OEM reference asserted |
| hose-power-steering | 1 | Structural or supporting detail; no independent OEM reference asserted |
| wiring-loom | 1 | Structural or supporting detail; no independent OEM reference asserted |

## Media and checks

The canonical ownership change affects the 24 formerly supplementary entries and isolated containing assemblies such as cover-valves, connecting-rod, bridge-main-bearing, shaft-balance-rear, cylinder-head, housing-distributor and alternator. First bearing-main extraction now resolves to an upper half-shell. New media should use one current bundle revision per language; the existing exporter invalidates the entire collection when geometry changes, so regenerate all 102 Spanish and 102 English MP4/poster/VTT sets rather than mixing revisions.

Required checks: tests/assembly.mjs (exclusive ownership, all types, quantities, final matrix identity, seeking), tests/geometry.mjs (canonical mechanism), tests/anatomy-pbr.mjs (102 canonical extracts and shared geometry/material identity), tests/timing.mjs, tests/i18n.mjs, tests/anatomy.mjs. The PBR test explicitly handles noninteger water-pump rotation. The media verifier independently decodes every MP4 and poster and compares captions with each localized catalogue.
