# Honda F22 Engine Explorer

An interactive 3D explainer of the 1994–97 Honda Accord 2.2-litre SOHC VTEC engine. It was built for a viewer with glaucoma, to help recognise the outside parts, see where they connect, and explore how the inside works.

## Open it

Double-click **`index.html`**, or from the project folder run:

```sh
open "engine-explorer/index.html"
```

It is one offline file and needs no internet or install. Chrome, Safari, Edge and Firefox all work. It keeps the reference library in place: the "Honda diagram" links open the OEM drawings from `../Honda Reference Library/02_OEM_Diagrams/`.

## Using it

- **Views** (keys `1`–`7`): Outside (photo 1's angle), Valve cover off, Timing covers off, One cylinder cut open, Crankshaft and bottom, VTEC close-up, Taken apart.
- **Turn and zoom:** drag, or focus the engine and use the arrow keys (Shift for bigger steps); scroll or `+`/`−` to zoom; `R` resets the view.
- **Parts:** click a part on the engine, search the list (`/`), or step through with `N`/`P`. Each part says where it is, what it does, what it connects to and how it moves, with its Honda diagram callout. A ≈ mark means the shape or position is approximate.
- **One system at a time:** "Show one system" fades everything else but keeps it faintly visible for orientation.
- **Motion:** Play/Pause (`Space`), step back and forward (`,` `.`) by 5–180°, and four speeds from one crank turn in 16 s to one per second. The bar shows every cylinder's stroke as a word and a shape, not by colour alone.
- **VTEC** (`V`): an educational switch. Each cylinder changes over only while its intake valves are closed, as on the real engine.
- **Flow paths:** air and fuel, exhaust, oil and coolant. Each has its own marker shape, and all are labelled schematic.
- **Display:** text size 100–240 %, label size, three colour schemes (high-contrast dark, high-contrast light, soft), labels on the engine (key parts, selected only, or none), reduce motion, and spoken part names. "Read aloud" in the details panel reads the whole description. Settings are remembered on this computer.

## Rebuilding and checking

The page is built with the [teardown](https://github.com/elvarofficial/teardown) skill's bundler (three.js, fonts and styles inlined):

```sh
engine-explorer/scripts/build.sh     # → engine-explorer/index.html, then runs the timing checks
node engine-explorer/tests/timing.mjs   # 20 checks: firing order, piston pairs, rotation, ratios, VTEC switching
node engine-explorer/tests/ui.mjs       # drives the page: every view, picking, keyboard, focus ring, text size, VTEC
node engine-explorer/tests/compare.mjs  # renders each photo's viewpoint beside the photo (.build/compare)
```

On macOS the tests launch headless Chromium with the Metal backend so WebGL works.

## Layout

```
src/kin.js        the math: one crank angle drives everything; SPEC and ASSUMED values kept apart
src/engine.js     the geometry, built from code after the photos and the OEM diagrams
src/parts.js      every selectable part, its system and its OEM diagram callouts
src/i18n/en.js    every word shown or spoken, ready to copy for a translation
src/flows.js      the schematic flow paths
src/stage.js      lights, camera, orbit, outline, picking, cutaway
src/views.js      the seven views
src/app.js        the accessible interface
app/              build entry and stylesheet
tests/            timing, interface and photo-comparison checks
```

## What is approximate

The motion follows Honda's figures: 85 × 95 mm, 2,156 cc and 8.8:1. Cylinder 1 is at the timing-belt end and the firing order is 1-3-4-2. The crank turns counter-clockwise from the pulley end, the cam runs at half speed, and the balance shafts run at twice speed, counter-rotating. These are approximate:

- **Engine identity:** the stamped engine code is unconfirmed. F22B1 (1994 US Accord EX) is the provisional reference.
- **Internal dimensions:** rod length (142 mm), piston pin height and cylinder spacing (96 mm) are assumed.
- **Valvetrain:** valve angles, valve lift and cam lobe shapes are teaching shapes, not Honda profiles. The VTEC switching rule is real, but the lift curves are not.
- **Outside shapes:** sizes are estimated from the photographs. Brackets, wiring, connectors, sensors and the rear block face are simplified, and the intake plenum and the timing covers are smoothed.
- **Hidden part positions:** the balance shafts and their drive, the oil-pump gear case, the water pump, the tensioner and the thermostat are placed approximately.
- **Pulley speeds:** accessory pulley sizes, and so their speeds, are estimated.
- **Flow paths:** oil and coolant lines show the route in general, not the real drillings. No live pressures are simulated.
