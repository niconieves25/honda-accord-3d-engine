# Honda F22A6 Engine Explorer

**[Español](README.es.md) · English**

Interactive educational reconstruction of a **factory-standard F22A6 in a 1993 Honda Accord EX sedan, 5-speed manual**. Engine identity is confirmed by the owner's stamp and paperwork. Original market and emissions specification remain unresolved. The dashboard, high-contrast controls, large text, spoken descriptions and bilingual component atlas are retained for the intended low-vision viewer.

## Open the project

The project root `../index.html` is the bilingual landing page. Its **Enter the explorer** button opens the existing complete-engine dashboard; all previous component URLs remain valid.

Open `index.html` for the complete engine and `anatomy.html` for the bilingual individual-component atlas. Use **Español / English** in either header to change both pages. The preference is shared and remembered locally; switching preserves the current component, camera, view, playback and controls. Spanish is the default. The reference sources remain in their original language. The built HTML files contain their scripts, fonts and rendering assets. Keep `anatomy-media/f22a6/` beside the atlas and `../Honda Reference Library/F22A6_1993_5MT/` in place for media and local evidence links. A local HTTP server is recommended for video captions and reference navigation:

```sh
# From Honda Accord Motor Project:
python3 -m http.server 8765 --bind 127.0.0.1
# http://127.0.0.1:8765/engine-explorer/index.html
# http://127.0.0.1:8765/engine-explorer/anatomy.html
```

## Immersive workspace

The complete-engine canvas fills the viewport. **Views** opens the left menu; **Explore** (or **Assembly** in the assembly view) opens the right information panel. Both start closed. At widths of **1100 px and above**, panels are nonmodal: the engine, playback and language selector remain usable alongside the explanation. On smaller screens, the panel is modal, with keyboard focus contained inside it until it closes.

The compact bottom bar keeps play/pause visible. **Controls** expands the existing speed and step controls, plus the timeline in Assembly; it starts collapsed and preserves its state when changing views or languages. **Escape** closes a panel and returns focus to its opener. Choosing a view closes the view menu and focuses the canvas. Existing reduced-motion settings remain available; in Assembly, play advances directly to the next completed step when reduced motion is enabled.

## Controls

- **Views, keys 1–8:** outside, valve cover off, timing covers off, cylinder cutaway, crankshaft, intake bypass, exploded assembly, guided assembly.
- **Camera:** drag to orbit; scroll or +/− to zoom. Focus the engine and use arrow keys for rotation; Shift increases the step. R resets. Display includes six reference directions and a three-quarter view.
- **Inspector:** Parts, Details and Motion are separate tabs. Arrow keys, Home and End navigate the tabs. Search with `/`; N/P select adjacent parts; Escape closes a panel or dialog, or clears selection when neither is open.
- **Playback:** Space plays/pauses, comma/period step the crank. Motion contains cylinder strokes, step size and schematic air/fuel, exhaust, oil and coolant paths.
- **Intake bypass, I:** an independent open/closed actuator state. It changes four secondary intake butterflies without changing cam profiles. No factory ECU activation threshold is claimed.
- **Accessibility:** text 100–240%, independent label size, three contrast themes, reduced motion, optional spoken names and Read aloud. Meaning is conveyed by words and shapes as well as colour. Preferences are remembered locally.

## Guided assembly / Montaje

Choose **8 · Montaje / Assembly** to build the F22A6 from its shared physical components. The view starts paused. Ten chapters contain **374 installation units and 388 selectable steps**, including the four piston insertions, separate connecting-rod caps, five main-bearing caps, and the head joining the block. Catalogue types, physical units and visual meshes are different counts; the model covers all 102 catalogue types plus 21 explicitly labelled supporting-detail types.

Use play/pause, previous/next, speed, restart or the timeline. Chapters and steps can be selected directly. The current chapter provides staging trays; installed units remain in the engine. Search locates a specific occurrence, outlines it, and links to its Anatomy entry. **See inside / Ver interior** temporarily makes enclosing shells transparent. Turning or zooming manually disables automatic camera following; **Follow part / Seguir pieza** resumes it.

The assembly timeline is independent of engine operation, with the crankshaft frozen at its reference angle. Leaving restores the previous explorer state; returning preserves assembly progress and stays paused. Language changes preserve progress and camera. With reduced motion enabled, play advances immediately to the next completed step. Keyboard: **8** opens assembly; **Space** plays/pauses; **, / .** or **P / N** select steps; **R** resumes the guided camera; **/** searches units. Deep links use `index.html?view=assembly&step=piston:1` (catalogue IDs also resolve to their first occurrence).

Este montaje es educativo. Las posiciones no medidas, las trayectorias y la colocación de correas/mangueras se identifican como ilustrativas; no constituye un procedimiento de taller. Las referencias no establecen holguras, pares de apriete ni calibraciones. Consulta [el inventario y sus límites](docs/assembly-inventory.md) y [las comprobaciones](docs/assembly-verification.md). El mercado y la variante de emisiones siguen pendientes.

## Component atlas and videos

The atlas contains **102 component types in 12 systems**, linked to **63 complete-engine selection groups**. **78 types reuse original meshes and materials directly**; **24 use supplementary PBR reconstructions** for functional detail absent from the assembled model. Provenance and approximation are visible in the viewer. A type is not an installed instance: one piston entry represents four pistons, for example. Supplier alternatives and bearing grades are not counted as additional simultaneously installed components.

Each entry has Spanish and English explanations of location, function, connections and motion, an installed quantity or limitation, operating steps and OEM diagram callouts. Fixed parts remain fixed: their inspection videos move the camera. Pumps and actuators use separate moving and stationary members where modeled. The engine-side flywheel, clutch disc and pressure plate are included; gearbox internals are outside the project. Their coupled rotation is shown, not a complete clutch-release simulation.

The active media collection is **`anatomy-media/f22a6/`**. Each entry has a 12-second H.264 MP4, JPEG poster and WebVTT captions in each language: Spanish in this directory, English in its `en/` subdirectory. Captions are also burned into the matching language video. Videos have **no embedded audio**; browser speech synthesis supplies optional Spanish or English narration in the page. Voice availability and pronunciation depend on the installed system voices.

The media manifest records engine identity and a source revision hash. URLs include a manifest hash to avoid stale clips. Removed legacy component links display an explanation; valid links and documented aliases are retained.

## Evidence and limits

The active reference package contains 26 assembly categories for each of the KA and KL 1993 EX sedan 5MT catalogues: **52 OEM diagrams**, saved catalogue pages and structured rows, **60 service-part photographs**, a limited exterior comparison photo, Honda's 1993 owner manual and brochure, a service excerpt, specification evidence, source hashes, the KA/KL comparison and a component reuse/rebuild audit.

Start with `../Honda Reference Library/F22A6_1993_5MT/04_Reports/reference_report.html`. Individual rows distinguish documented facts, visual reconstruction and approximation. Exploded plates establish assembly relationships; they are not scaled manufacturing drawings. KA and KL references are both retained; a displayed KA part number does not confirm that the owner's car is a federal-emissions vehicle.

Honda's 1993 owner manual, printed page 159, documents **85 mm bore, 95 mm stroke, 2,156 cc and 8.8:1 compression ratio**. The modeled piston travel follows the stroke. The chamber surfaces have not been calibrated to reproduce the published compression ratio.

The OEM inventory establishes one camshaft, eight intake arms in A/B types, eight exhaust arms, two short and three long inlet shaft segments, one exhaust shaft, sixteen valve adjusters, four valve-cover cap nuts, intake-bypass hardware and the manual engine attachments. The rebuilt exterior includes the black 16 VALVE cover, eight-port intake-bypass body, four butterfly discs, plenum/runner assembly, cast exhaust layout and shield, external ignition coil and manual flywheel/clutch.

Remaining limits are explicit:

- No complete set of six stamp-verified F22A6 exterior photographs was obtained. The dealer engine photo is a 1993 EX automatic and supports only common visible cover/intake appearance.
- Exact cam profiles, contact-track topology and axial widths remain unmeasured. The model uses an illustrative fixed-profile contact layout, with equal intake-valve lift and no hydraulic lift switching.
- Rod length 142 mm, cylinder pitch 96 mm, valve lift/angles, piston pin and journal diameters, casting envelopes and many fastener details are nominal teaching geometry, not verified machining dimensions.
- The 1-3-4-2 firing sequence and counter-rotating balance shafts at twice crank speed are implemented and tested. A primary A6 service-manual page for these entries remains pending in the evidence registry. Cam and distributor run at half crank speed.
- The rear balance drive includes a belt-driven input and reversing gear pair. Positions, tooth profiles, counts, phases and belt meshing are illustrative.
- Vacuum routing, emissions equipment calibration and ECU thresholds remain unresolved. IAB travel is an independent educational state, not an RPM-triggered factory simulation.
- Oil/coolant paths are schematic; pressures, temperatures, loads, deformation, tolerances and complete collision clearance are not simulated.
- A positive sampled model valve/piston clearance does not establish real-engine clearance or timing safety.

## Source organization

```text
src/engine-spec.js           canonical engine identity, dimensions, ratios and evidence
src/kin.js                   deterministic crank-angle mechanics
src/parts.js                 complete-engine component registry and OEM references
src/engine.js                complete model and pose update
src/detail-internals.js      internal component detail
src/detail-exterior.js       intake, bypass, exhaust, ignition and manual attachments
src/detail-castings.js       covers, head and block castings
src/detail-timing.js         belt and sprocket detail
src/exterior-layout.js       shared exterior coordinates
src/studio.js               common PBR lighting and appearance
src/flows.js                 schematic fluid paths
src/views.js                 educational views and reference camera directions
src/app.js, app/style.css    complete-engine dashboard
app/immersive.css           full-viewport canvas, edge panels and playback dock
src/ui/immersive.js          responsive panels, focus and canonical playback mirror
src/ui/framing.js            portrait/panel projection without changing camera pose
src/i18n/{en,es}.js          complete-engine text and narration
src/i18n/locale.js           shared persistent language preference
src/anatomy/catalog.js      component entries, Spanish text and evidence
src/anatomy/catalog-en.js   complete English component text
src/anatomy/catalog-i18n.js localized catalogue access without geometry duplication
src/anatomy/engine-parts.js  extraction of original engine meshes/materials
src/anatomy/figures.mjs      supplementary Anatomy reconstruction recipes
src/anatomy/motion.mjs       deterministic supplementary motion
src/anatomy/pbr-runtime.js  shared individual-part/video renderer
src/anatomy/ui.js            atlas, accessibility and versioned media
anatomy-media/f22a6/         active MP4s, posters, captions and manifest
```

## Build and verification

From `engine-explorer/`, install the pinned project dependencies. The production build no longer requires a globally installed skill:

```sh
npm ci
npm run build
npm test
```

This builds both self-contained dashboards, the root landing page and `dist/` for Vercel. `dist/` includes active bilingual media and OEM diagrams with the same relative paths as local browsing; development files and prior-version archives are not published. Source and archived work remain in GitHub.

The existing engine-only command is still available. Optional geometry and video-export tools may use the local teardown skill dependencies:

```sh
./scripts/build.sh
node scripts/build-anatomy.mjs
node tests/timing.mjs
node tests/geometry.mjs
node tests/anatomy.mjs
node tests/anatomy-pbr.mjs
node tests/i18n.mjs
```

These CPU checks cover firing sequence, piston pairs/travel, shaft ratios, deterministic seeks, independent intake bypass, finite geometry, open bores, sampled valve/piston clearance, catalogue OEM evidence and exact parent/extract mesh/material identity. Visible browser review is recorded in `tests/ui-review.json`. The historical browser runner and old-photo comparison script were archived because they tested the earlier engine variant.

Regenerate the production videos with the same PBR runtime as the atlas:

```sh
node scripts/export-anatomy-pbr.mjs --port 8766 --theme light --language es
# For English, start another batch with --language en (default output: anatomy-media/f22a6/en).
# Open its printed local URL and press “Iniciar toda la colección”.
node scripts/select-anatomy-posters.mjs --language es
node scripts/anatomy-video-verify.mjs --language es --revision REVISION_PRINTED_BY_EXPORTER
# Use --language en for the English poster and verification commands.
node scripts/anatomy-video-contact.mjs
node scripts/build-anatomy.mjs
```

The exporter accepts its own canvas frames on loopback and uses local ffmpeg/ffprobe. It verifies every MP4 before committing its manifest entry and resumes completed clips from the same source revision. Keep the geometry and narration unchanged during a batch. The former SVG video command now points to this production workflow.

## Preserved prior version

Before the migration, all 385 source/reference/media files were archived and SHA-256 verified in `../Archives/F22B1_before_F22A6_2026-11-07_11-58-58/project-and-references.tar.gz`, with `manifest.json`. The previous VTEC photos and 1994–96 documentation are excluded from the active reference root. Previous media are preserved in the archive’s `legacy-media/` directory and are not linked by the active atlas. The archive retains the earlier model for comparison and recovery.
