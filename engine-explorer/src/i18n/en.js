// Full-engine interface copy; active target and evidence are shared with engine-spec.js.
export default {
  "lang": "en",
  "ui": {
    "title": "Honda F22A6 Engine Explorer",
    "language": "Language",
    "individualParts": "Individual parts · Anatomy",
    "animation": "Animation",
    "cameraDirection": "Camera direction",
    "chooseDirection": "Choose a direction",
    "documentedHeading": "Follows Honda figures",
    "approximateHeading": "Approximate",
    "spaceKey": "Space",
    "iabState": "Independent actuator state · factory calibration unresolved.",
    "removedPartNotice": "This older link referred to a mechanism that is unavailable on the factory F22A6. Explore the fixed valvetrain or intake bypass instead.",
    "languageChanged": "Language changed to English.",
    "directions": {"threeQuarter":"Three-quarter","timing":"Timing end","transmission":"Transmission end","intake":"Intake side","exhaust":"Exhaust side","top":"Top","underside":"Underside"},
    "subtitle": "1993 Accord EX sedan · 2.2-litre SOHC · 5-speed manual",
    "identity": "F22A6 confirmed by owner stamp and paperwork. 1993 Accord EX sedan, 5MT. Original market and emissions specification unresolved.",
    "identityShort": "F22A6 · 1993 EX · 5MT · market unresolved",
    "inspector": "Engine information",
    "partsTab": "Parts",
    "detailsTab": "Details",
    "motionTab": "Motion",
    "motionControls": "Motion controls",
    "motionTitle": "Inside the cycle",
    "browseParts": "Browse parts",
    "partsCount": "parts",
    "partCount": "part",
    "selectionHint": "Select a part on the engine or browse by system.",
    "inspectionTitle": "Get to know each part",
    "inspectionHint": "Its location, purpose and connections will appear here.",
    "viewShort": {
      "exterior": "Outside",
      "noCover": "Valve cover",
      "noTiming": "Timing belts",
      "cutaway": "Cutaway",
      "lower": "Crankshaft",
      "exploded": "Exploded",
      "iab": "Intake bypass"
    },
    "speedShort": {
      "s16": "Very slow · 16 s / turn",
      "s8": "Slow · 8 s / turn",
      "s4": "Medium · 4 s / turn",
      "s1": "Fast · 1 s / turn"
    },
    "cycleHint": "One complete four-stroke cycle is two crankshaft turns.",
    "referenceDetails": "Diagram and part numbers",
    "viewHint": "Drag to turn · Scroll to zoom",
    "canvasLabel": "Three-dimensional engine. Use arrow keys to turn it, plus and minus to zoom.",
    "views": "Views",
    "systems": "Show one system",
    "allSystems": "All systems",
    "parts": "Parts",
    "search": "Search parts",
    "searchHint": "Type a name, for example “belt” or “valve”",
    "searchPlaceholder": "Belt, valve, oil…",
    "noMatch": "No parts match",
    "details": "About this part",
    "noSelection": "Choose a part from the list, or click the engine.",
    "where": "Where it is",
    "does": "What it does",
    "connects": "What it connects to",
    "moves": "How it moves",
    "oem": "Honda diagram",
    "openDiagram": "Open diagram",
    "callout": "callout",
    "approximate": "Shape or position is approximate",
    "speak": "Read aloud",
    "stopSpeaking": "Stop reading",
    "clear": "Clear selection",
    "play": "Play",
    "pause": "Pause",
    "stepBack": "Step back",
    "stepFwd": "Step forward",
    "step": "Step size",
    "speed": "Speed",
    "speeds": {
      "s16": "Very slow — one turn in 16 s",
      "s8": "Slow — one turn in 8 s",
      "s4": "Medium — one turn in 4 s",
      "s1": "Fast — one turn per second"
    },
    "crank": "Crankshaft",
    "cycle": "Cycle",
    "degrees": "°",
    "cylinder": "Cylinder",
    "firing": "firing",
    "flows": "Flow paths (schematic)",
    "flowNames": {
      "air": "Air and fuel",
      "exhaust": "Exhaust",
      "oil": "Oil",
      "coolant": "Coolant"
    },
    "flowNote": "Flow lines show the route in general. They are not measured passages or live pressures.",
    "settings": "Display",
    "textSize": "Text size",
    "labelSize": "Label size on the engine",
    "theme": "Colours",
    "themes": {
      "dark": "High contrast — dark",
      "light": "High contrast — light",
      "soft": "Soft"
    },
    "reduceMotion": "Reduce motion",
    "speakNames": "Speak part names",
    "showLabels": "Labels on the engine",
    "labelModes": {
      "selected": "Selected part only",
      "view": "Key parts in this view",
      "none": "None"
    },
    "reset": "Reset view",
    "help": "Keys",
    "helpText": [
      [
        "Arrow keys",
        "turn the engine (when the engine has focus)"
      ],
      [
        "+ / −",
        "zoom in and out"
      ],
      [
        "R",
        "reset the view"
      ],
      [
        "Space",
        "play or pause"
      ],
      [
        ", and .",
        "step back and forward"
      ],
      [
        "/",
        "search parts"
      ],
      [
        "N and P",
        "next and previous part"
      ],
      [
        "I",
        "open or close the intake bypass"
      ],
      [
        "Esc",
        "clear the selection"
      ],
      [
        "Tab",
        "move between controls"
      ]
    ],
    "about": "About accuracy",
    "close": "Close",
    "isolated": "Showing only",
    "selectedAnnounce": "Selected",
    "viewAnnounce": "View",
    "strokes": {
      "power": "Power",
      "exhaust": "Exhaust",
      "intake": "Intake",
      "compression": "Compression"
    },
    "strokeShapes": {
      "power": "▼",
      "exhaust": "▲",
      "intake": "▽",
      "compression": "△"
    },
    "cylinderOf": "cylinder",
    "allFour": "all four",
    "approxShort": "approx.",
    "iabShort": {
      "off": "Intake bypass closed",
      "on": "Intake bypass open"
    },
    "iab": "Intake bypass",
    "iabOff": "Closed — primary passages available",
    "iabOn": "Open — secondary passages available",
    "iabNote": "This switch demonstrates the manifold actuator. It is independent of crank angle. The factory ECU threshold, vacuum routing and market-specific calibration have not been verified."
  },
  "views": {
    "exterior": {
      "name": "Outside",
      "desc": "The F22A6 with its black 16 VALVE cover, intake bypass assembly and manual flywheel/clutch. Drag to inspect every side."
    },
    "noCover": {
      "name": "Valve cover off",
      "desc": "One camshaft, eight intake rockers in A/B types and eight exhaust rockers. Every valve uses a fixed cam profile."
    },
    "noTiming": {
      "name": "Timing covers off",
      "desc": "The timing belt, balancer belt and their pulleys at the timing-belt end."
    },
    "exploded": {
      "name": "Taken apart",
      "desc": "The main assemblies pulled apart along the directions they come off."
    },
    "cutaway": {
      "name": "One cylinder cut open",
      "desc": "A slice through one cylinder: piston, valves, spark plug and ports."
    },
    "lower": {
      "name": "Crankshaft and bottom",
      "desc": "The block made see-through: crankshaft, rods, pistons, balance shafts and oil pump."
    },
    "iab": {
      "name": "Intake bypass",
      "desc": "The eight-port bypass plate with the upper chamber removed. Press I to open or close the four secondary butterflies; the other four passages remain open."
    }
  },
  "systems": {
    "exterior": "Covers and outside",
    "bottom": "Block, crankshaft and pistons",
    "balance": "Balance shafts",
    "head": "Cylinder head and valves",
    "timing": "Timing belt",
    "intake": "Air intake and fuel",
    "exhaust": "Exhaust",
    "ignition": "Ignition",
    "oil": "Lubrication (oil)",
    "cooling": "Cooling",
    "accessory": "Alternator and power steering",
    "manual": "Manual flywheel and clutch"
  },
  "parts": {
    "valveCover": {
      "name": "Valve cover",
      "where": "The black lid on top, with the Honda emblem and 16 VALVE lettering.",
      "does": "Keeps oil inside the head and dirt out, while covering the camshaft and rockers.",
      "connects": "Four cap nuts with sealing washers retain it over a perimeter gasket; four plug-tube seals surround the intake-side plug row.",
      "moves": "Does not move."
    },
    "oilCap": {
      "name": "Oil filler cap",
      "where": "The black round cap on the valve cover, at the timing-belt end.",
      "does": "Where new engine oil is poured in.",
      "connects": "Screws into the valve cover. Oil poured here runs down through the head to the oil pan.",
      "moves": "Does not move while running."
    },
    "timingCoverUpper": {
      "name": "Upper timing-belt cover",
      "where": "The black ribbed plastic cover at the top of the timing-belt end.",
      "does": "Protects the camshaft pulley and the top of the timing belt.",
      "connects": "Bolts to the head and to the lower cover.",
      "moves": "Does not move."
    },
    "timingCoverLower": {
      "name": "Lower timing-belt cover",
      "where": "The larger black cover at the timing-belt end, behind the crankshaft pulley.",
      "does": "Protects the lower part of the timing belt, the balancer belt and their pulleys.",
      "connects": "Bolts to the block; the crankshaft passes through it to the outer pulley.",
      "moves": "Does not move."
    },
    "engineMount": {
      "name": "Engine mounting bracket",
      "where": "The rusty steel bracket with a tall stud, on the timing-belt end near the top.",
      "does": "Holds this end of the engine to the car’s body through a rubber mount.",
      "connects": "Bolts to the engine; the stud goes to the mount in the car.",
      "moves": "Does not move."
    },
    "oilPan": {
      "name": "Oil pan",
      "where": "The black painted pan underneath the engine.",
      "does": "Holds the engine oil when it is not being pumped around.",
      "connects": "Bolts under the block. The oil pickup sits inside it; the drain bolt is at the bottom.",
      "moves": "Does not move. Oil drains back into it from above."
    },
    "block": {
      "name": "Cylinder block",
      "where": "The large grey aluminium middle of the engine.",
      "does": "Holds the four cylinders, where the pistons move, and carries the crankshaft below them.",
      "connects": "The head bolts on top, the oil pan below, the timing parts at one end and the transmission at the other.",
      "moves": "Does not move."
    },
    "bearingBridge": {
      "name": "Bearing-cap bridge",
      "where": "Inside the bottom of the block, holding the crankshaft from below.",
      "does": "Ties the crankshaft’s five main bearing caps together to stiffen the bottom of the engine.",
      "connects": "Bolts to the bottom of the block around the crankshaft.",
      "moves": "Does not move."
    },
    "crankshaft": {
      "name": "Crankshaft",
      "where": "Inside the bottom of the block, running the full length of the engine.",
      "does": "Turns the up-and-down push of the four pistons into turning motion that drives the car.",
      "connects": "Rods from all four pistons. Five main bearings hold it. Pulleys at the front, flange to the transmission at the back.",
      "moves": "Turns counter-clockwise when you face the pulley end. Everything else moves in time with it."
    },
    "pistons": {
      "name": "Pistons",
      "where": "Inside the four cylinders. Cylinder 1 is at the timing-belt end.",
      "does": "Are pushed down by burning fuel, and push air in and burned gas out.",
      "connects": "Each joins a connecting rod through a wrist pin. Rings seal it against the cylinder wall.",
      "moves": "Up and down 95 mm. Pistons 1 and 4 move together; 2 and 3 move together, opposite them."
    },
    "rings": {
      "name": "Piston rings",
      "where": "Three rings around the top of each piston.",
      "does": "The top two seal in the pressure; the bottom one scrapes oil off the cylinder wall.",
      "connects": "Sit in grooves on the piston and press against the cylinder wall.",
      "moves": "Move up and down with the piston."
    },
    "wristPins": {
      "name": "Wrist pins",
      "where": "A short steel pin through each piston. The model uses an unverified nominal 22 mm diameter.",
      "does": "Lets the connecting rod swing while the piston moves straight.",
      "connects": "Joins the piston to the top of its connecting rod.",
      "moves": "Moves with the piston; the rod pivots on it."
    },
    "rods": {
      "name": "Connecting rods",
      "where": "Between each piston and the crankshaft.",
      "does": "Carries the push of the piston down to the crankshaft.",
      "connects": "Top end to the wrist pin; bottom end clamps around a crankshaft journal.",
      "moves": "Top goes up and down; bottom goes round with the crankshaft; the rod swings side to side."
    },
    "crankPulley": {
      "name": "Crankshaft pulley",
      "where": "The large grooved pulley at the bottom of the timing-belt end.",
      "does": "Drives the outside belts for the alternator and power-steering pump.",
      "connects": "Bolted to the front of the crankshaft.",
      "moves": "Turns with the crankshaft, counter-clockwise from this end."
    },
    "crankFlange": {
      "name": "Crankshaft rear flange",
      "where": "The round flange with eight bolts at the transmission end.",
      "does": "Mounts the manual flywheel that transfers crankshaft torque to the clutch.",
      "connects": "The back end of the crankshaft.",
      "moves": "Turns with the crankshaft."
    },
    "balancerFront": {
      "name": "Front balance shaft",
      "where": "Inside the block on the exhaust side, above the crankshaft.",
      "does": "An off-centre weighted shaft that cancels a shake four-cylinder engines naturally make.",
      "connects": "Driven directly by the balance belt. The same belt separately drives the rear gearcase input pulley.",
      "moves": "Turns twice as fast as the crankshaft."
    },
    "balancerRear": {
      "name": "Rear balance shaft",
      "where": "Inside the block on the intake side; its location is visually reconstructed.",
      "does": "Works with the front shaft so their shakes cancel the engine’s.",
      "connects": "The balance belt turns a separate input pulley; the adjacent gear pair reverses the rear shaft.",
      "moves": "Turns twice as fast as the crankshaft, in the opposite direction to the front shaft."
    },
    "balancerBelt": {
      "name": "Balancer belt and pulleys",
      "where": "A second toothed belt behind the timing belt.",
      "does": "Drives the balance shafts from the crankshaft.",
      "connects": "Crankshaft balancer pulley, front balance-shaft pulley (half the size) and the adjuster.",
      "moves": "Runs with the crankshaft; its small pulley turns twice as fast."
    },
    "balancerAdjuster": {
      "name": "Balancer belt adjuster",
      "where": "A small roller on the balancer belt.",
      "does": "Keeps the balancer belt tight.",
      "connects": "Presses on the balancer belt; a spring pulls it.",
      "moves": "Spins as the belt runs."
    },
    "head": {
      "name": "Cylinder head",
      "where": "The aluminium part on top of the block, under the valve cover.",
      "does": "Closes the top of each cylinder and holds the valves, camshaft, rockers and spark plugs.",
      "connects": "Bolted to the block over the head gasket. Intake manifold on one side, exhaust manifold on the other.",
      "moves": "Does not move."
    },
    "headGasket": {
      "name": "Head gasket",
      "where": "The thin layer between the block and the head.",
      "does": "Seals combustion pressure, oil and coolant between block and head.",
      "connects": "Clamped between the block and the head.",
      "moves": "Does not move."
    },
    "camshaft": {
      "name": "Camshaft",
      "where": "In the cylinder head, along the length of the engine, under the rockers.",
      "does": "Its bumps (lobes) open the valves at the right moments.",
      "connects": "Driven by the timing belt; drives the distributor at the other end.",
      "moves": "Turns at half crankshaft speed: once for every two turns of the crankshaft."
    },
    "intakeValves": {
      "name": "Intake valves",
      "where": "Two per cylinder, on the intake side of the head.",
      "does": "Open to let air and fuel into the cylinder.",
      "connects": "Pushed open by the intake rockers; closed again by valve springs.",
      "moves": "Slide down to open, up to close, once every two crankshaft turns."
    },
    "exhaustValves": {
      "name": "Exhaust valves",
      "where": "Two per cylinder, on the exhaust side of the head.",
      "does": "Open to let burned gas out to the exhaust manifold.",
      "connects": "Pushed open by the exhaust rockers; closed again by valve springs.",
      "moves": "Slide down to open, up to close, once every two crankshaft turns."
    },
    "exhaustRockers": {
      "name": "Exhaust rocker arms",
      "where": "On the exhaust side of the camshaft.",
      "does": "Eight arms of one OEM type transfer fixed cam lift to eight exhaust valves.",
      "connects": "Cam contact pads, continuous exhaust rocker shaft, adjuster screws and valve stems.",
      "moves": "Each rocks as its cam contact rises, then returns under valve-spring force."
    },
    "rockerShafts": {
      "name": "Rocker shafts",
      "where": "Above the head beside the camshaft.",
      "does": "Support the rocker pivots: five inlet sections (two short, three long) and one continuous exhaust shaft.",
      "connects": "Rocker arms and camshaft supports; lubricated pivot surfaces.",
      "moves": "Stationary shafts; the arms rock around them."
    },
    "timingBelt": {
      "name": "Timing belt",
      "where": "Behind the black timing covers, at the timing-belt end.",
      "does": "Keeps the camshaft exactly in step with the crankshaft.",
      "connects": "Crankshaft timing pulley, tensioner, water pump and camshaft pulley.",
      "moves": "Runs round its pulleys with the crankshaft."
    },
    "camPulley": {
      "name": "Camshaft pulley",
      "where": "At the top of the timing-belt end, behind the upper cover.",
      "does": "Lets the timing belt turn the camshaft.",
      "connects": "Bolted to the front of the camshaft; driven by the timing belt.",
      "moves": "Twice the size of the crank’s timing pulley, so it turns at half speed."
    },
    "crankTimingPulley": {
      "name": "Crankshaft timing pulley",
      "where": "On the front of the crankshaft, behind the outer pulley.",
      "does": "Drives the timing belt.",
      "connects": "Keyed to the crankshaft.",
      "moves": "Turns with the crankshaft."
    },
    "timingTensioner": {
      "name": "Timing-belt tensioner",
      "where": "A roller pressing on the timing belt.",
      "does": "Keeps the timing belt tight so it cannot skip teeth.",
      "connects": "Bolted to the block; a spring pushes it against the belt.",
      "moves": "Spins as the belt runs."
    },
    "intakeDuct": {
      "name": "Air intake duct",
      "where": "The black ribbed rubber duct at the transmission end.",
      "does": "Brings filtered air from the air cleaner to the throttle body.",
      "connects": "Air cleaner (not on this engine) to the throttle body.",
      "moves": "Does not move."
    },
    "throttleBody": {
      "name": "Throttle body",
      "where": "At the transmission end of the intake manifold.",
      "does": "A flap inside opens with the accelerator pedal to let more air in.",
      "connects": "Air duct on one side, intake plenum on the other.",
      "moves": "The flap turns open and closed."
    },
    "plenum": {
      "name": "Upper intake manifold B",
      "where": "The upper cast chamber with the PGM-FI emblem.",
      "does": "Receives air from the throttle and distributes it to the bypass plate and lower manifold.",
      "connects": "Throttle body, bypass plate and upper bypass gasket.",
      "moves": "Fixed casting; air flow is shown schematically."
    },
    "runners": {
      "name": "Lower intake manifold A",
      "where": "Below the bypass plate, leading to the cylinder-head intake ports.",
      "does": "Provides the primary and additional air passages feeding each cylinder.",
      "connects": "Bypass assembly, head, injectors and manifold gasket.",
      "moves": "Fixed casting. Passage contours and lengths are visually reconstructed."
    },
    "fuelRail": {
      "name": "Fuel rail and pressure regulator",
      "where": "The metal bar along the intake side of the head, above the runners.",
      "does": "Supplies fuel at steady pressure to the four injectors.",
      "connects": "Fuel line in, return line out; one injector per cylinder.",
      "moves": "Does not move."
    },
    "injectors": {
      "name": "Fuel injectors",
      "where": "Four injectors, one at the end of each runner, below the fuel rail.",
      "does": "Spray fuel into each intake port in turn, timed by the engine computer.",
      "connects": "Fuel rail above; intake port below; wiring to the computer.",
      "moves": "A tiny valve inside opens for each spray."
    },
    "exhaustManifold": {
      "name": "Exhaust manifold",
      "where": "On the exhaust side, under the heat shield.",
      "does": "Collects burned gas from all four cylinders into one pipe.",
      "connects": "Exhaust ports on the head; the exhaust pipe and catalyst (not on this engine).",
      "moves": "Does not move. Gets very hot."
    },
    "heatShield": {
      "name": "Exhaust heat shield",
      "where": "The rust-speckled metal cover on the exhaust side.",
      "does": "Keeps the manifold’s heat away from nearby parts.",
      "connects": "Bolted over the exhaust manifold. The manifold is underneath it.",
      "moves": "Does not move."
    },
    "distributor": {
      "name": "Distributor",
      "where": "At the transmission end of the head, where the plug leads gather.",
      "does": "Sends each spark to the right cylinder at the right time.",
      "connects": "Driven by the camshaft; receives high voltage from the external coil and routes it to the four spark leads. TEC TD-52U is the catalogued reference.",
      "moves": "Turns at camshaft speed, half crankshaft speed."
    },
    "plugLeads": {
      "name": "Spark and coil high-tension leads",
      "where": "Four leads run to the intake-side plug row; the center lead connects the external coil to the cap.",
      "does": "Carry the high-voltage spark from the distributor to each spark plug.",
      "connects": "Distributor cap to the four plugs.",
      "moves": "Do not move."
    },
    "sparkPlugs": {
      "name": "Spark plugs",
      "where": "One in the centre of each cylinder’s roof, under the plug leads.",
      "does": "Make the spark that starts the fuel burning, just before the piston reaches the top.",
      "connects": "Screwed into the head; the plug lead clips on top.",
      "moves": "Do not move."
    },
    "oilPump": {
      "name": "Oil pump",
      "where": "Around the front of the crankshaft, behind the timing parts.",
      "does": "Pushes oil from the pan round the engine under pressure.",
      "connects": "Pickup below, filter after it. Its gear case also drives the rear balance shaft.",
      "moves": "Driven directly by the crankshaft."
    },
    "oilStrainer": {
      "name": "Oil pickup and strainer",
      "where": "Inside the oil pan, near the bottom.",
      "does": "Sucks oil from the pan through a screen.",
      "connects": "Oil pan to the oil pump.",
      "moves": "Does not move."
    },
    "oilFilter": {
      "name": "Oil filter",
      "where": "The dark canister low on the intake side.",
      "does": "Cleans the oil before it reaches the bearings.",
      "connects": "Screws onto the block; oil comes from the pump and goes on to the main oil passage.",
      "moves": "Does not move."
    },
    "dipstick": {
      "name": "Oil dipstick",
      "where": "The yellow loop handle at the timing-belt end, exhaust side.",
      "does": "Pull it out to check the oil level.",
      "connects": "Its tube reaches down into the oil pan.",
      "moves": "Does not move."
    },
    "waterPump": {
      "name": "Water pump",
      "where": "Behind the timing covers, turned by the timing belt.",
      "does": "Pushes coolant round the block and head.",
      "connects": "Driven by the timing belt; pushes coolant into the block.",
      "moves": "Its pulley turns with the timing belt."
    },
    "thermostat": {
      "name": "Thermostat and housing",
      "where": "In its housing on the intake side of the block (position approximate).",
      "does": "Stays closed while the engine warms up, then opens to let coolant go to the radiator.",
      "connects": "Radiator hose, connecting pipe and the water pump inlet.",
      "moves": "A valve inside opens with heat."
    },
    "coolantOutlet": {
      "name": "Coolant outlet",
      "where": "At the transmission end of the head, exhaust side, with the black hose stub.",
      "does": "Where hot coolant leaves the head for the radiator.",
      "connects": "Head water jacket to the upper radiator hose.",
      "moves": "Does not move."
    },
    "alternator": {
      "name": "Alternator",
      "where": "On the exhaust side, near the timing-belt end, with red windings visible through its vents.",
      "does": "Makes electricity to charge the battery and power the car.",
      "connects": "Driven by a belt from the crankshaft pulley.",
      "moves": "Spins faster than the crankshaft because its pulley is smaller."
    },
    "psPump": {
      "name": "Power-steering pump",
      "where": "High on the timing-belt end, exhaust side: the pulley with round holes.",
      "does": "Pumps fluid that makes the steering wheel easier to turn.",
      "connects": "Driven by its own belt from the crankshaft pulley; hoses go to the steering rack.",
      "moves": "Its pulley spins with the belt."
    },
    "accessoryBelts": {
      "name": "Accessory belts",
      "where": "The ribbed belts on the outside of the timing-belt end.",
      "does": "Carry power from the crankshaft pulley to the alternator and power-steering pump.",
      "connects": "Crankshaft pulley to the alternator and to the power-steering pump.",
      "moves": "Run round their pulleys."
    },
    "psHose": {
      "name": "Power-steering hose",
      "where": "At the power-steering pump; hose geometry is approximate and ends at the engine boundary.",
      "does": "Carries power-steering fluid.",
      "connects": "Power-steering pump to the steering system in the car.",
      "moves": "Does not move."
    },
    "intakeRockers": {
      "name": "Intake rocker arms A and B",
      "where": "On the intake side of the camshaft.",
      "does": "Four A arms and four B arms open eight intake valves with fixed lift profiles.",
      "connects": "Cam contact pads, segmented inlet shafts, adjuster screws and valve stems.",
      "moves": "Each pair follows the same fixed intake teaching profile. The bypass switch does not alter valve motion."
    },
    "iabBody": {
      "name": "Intake bypass body",
      "where": "Between the upper intake chamber and lower manifold.",
      "does": "Carries four permanent passages and four controlled round passages.",
      "connects": "Manifold A below, manifold B above; a gasket on each face.",
      "moves": "The body stays fixed. Its shaft and four butterfly plates move."
    },
    "iabButterflies": {
      "name": "Four intake bypass butterflies",
      "where": "In the four round openings of the bypass body.",
      "does": "Open or close the additional intake passages. The permanent passages remain available.",
      "connects": "All four plates are secured to the common bypass shaft.",
      "moves": "Rotate together with the actuator command, independently of the crankshaft."
    },
    "iabShaft": {
      "name": "Intake bypass shaft",
      "where": "Across the four round bypass ports.",
      "does": "Synchronizes the four butterfly plates.",
      "connects": "Butterflies, end lever and diaphragm linkage.",
      "moves": "Turns through an illustrative quarter-turn between the displayed states."
    },
    "iabActuator": {
      "name": "Bypass diaphragm and linkage",
      "where": "At one end of the bypass plate.",
      "does": "Converts a vacuum control state into mechanical shaft movement.",
      "connects": "Diaphragm, return mechanism, connecting rod and bypass lever.",
      "moves": "Diaphragm travel and linkage dimensions are illustrative; the switch controls state."
    },
    "iabSolenoid": {
      "name": "Bypass control solenoid",
      "where": "By the manifold and vacuum reservoir; installation position approximate.",
      "does": "Controls the actuator vacuum circuit when commanded by the ECU.",
      "connects": "Electrical connector and vacuum controls. Exact routing and calibration unresolved.",
      "moves": "An internal valve changes state; the outer housing remains fixed."
    },
    "iabVacuumTank": {
      "name": "Bypass vacuum reservoir",
      "where": "Beside the intake assembly; position approximate.",
      "does": "Stores vacuum for the actuator circuit.",
      "connects": "Check valve, control solenoid and hoses identified by the OEM diagram.",
      "moves": "No rotating parts. Pressure is not simulated."
    },
    "ignitionCoil": {
      "name": "External ignition coil",
      "where": "Near the transmission end of the intake side; bracket position approximate.",
      "does": "Builds magnetic energy and produces the high voltage delivered to the distributor.",
      "connects": "Low-voltage connector and the center high-tension lead to the distributor cap.",
      "moves": "No visible mechanical motion; electrical switching generates ignition pulses."
    },
    "flywheel": {
      "name": "Manual flywheel",
      "where": "Bolted to the crankshaft at the transmission end.",
      "does": "Stores rotational energy and presents a friction surface for the clutch.",
      "connects": "Crank flange, clutch pressure plate, clutch disc and starter ring gear.",
      "moves": "Turns at crankshaft speed. Tooth count and dimensions are illustrative."
    },
    "clutchDisc": {
      "name": "Clutch friction disc",
      "where": "Between the flywheel and pressure plate.",
      "does": "Transfers torque when clamped; its spring hub cushions torsional changes.",
      "connects": "Flywheel, pressure plate and gearbox input shaft (gearbox omitted).",
      "moves": "Shown engaged, rotating at crankshaft speed. Slip and pedal operation are outside this model."
    },
    "clutchPressurePlate": {
      "name": "Clutch pressure plate",
      "where": "Bolted to the flywheel over the friction disc.",
      "does": "Provides clamping force through the diaphragm spring.",
      "connects": "Flywheel mounting points, friction disc and release mechanism on the gearbox side.",
      "moves": "Shown engaged, rotating with the flywheel. It is an engine-side attachment."
    }
  },
  "diagrams": {
    "cylinder_head_cover":"Cylinder head cover", "camshaft_timing_belt":"Camshaft and timing belt", "cylinder_block_oil_pan":"Cylinder block and oil pan", "crankshaft_piston":"Crankshaft and piston", "cylinder_head":"Cylinder head", "valve_rocker_arm":"Valves and rocker arms", "air_cleaner":"Air cleaner", "throttle_body":"Throttle body", "intake_manifold":"Intake manifold", "exhaust_manifold":"Exhaust manifold", "distributor_tec":"TEC distributor", "high_tension_cord_spark_plug":"High-tension leads and spark plugs", "oil_pump_oil_strainer":"Oil pump and strainer", "water_pump":"Water pump", "alternator_denso":"Denso alternator", "p_s_pump":"Power-steering pump", "clutch_torque_converter":"Clutch and torque converter"
  },
  "notes": {
    "title": "Evidence and reconstruction limits",
    "intro": "Identity is confirmed as F22A6. Honda owner-manual dimensions and 1993 EX 5MT OEM assembly diagrams underpin the model. Exploded drawings do not establish scale; unmeasured geometry remains approximate.",
    "exact": [
      "Honda 1993 owner manual, page 159: bore 85 mm, stroke 95 mm, displacement 2,156 cc, compression ratio 8.8:1.",
      "OEM inventory: four cylinders; eight intake and eight exhaust valves; four intake rocker A, four B, eight exhaust rockers.",
      "Two short and three long intake rocker shafts, one exhaust rocker shaft; four cover cap nuts.",
      "Manifold bypass body, diaphragm, solenoid and vacuum tank; manual flywheel, disc and pressure plate."
    ],
    "approx": [
      "Connecting rod 142 mm, cylinder spacing 96 mm, piston pin height, journals, external envelopes and casting thicknesses remain illustrative layout values.",
      "Valve angles, lift curves, cam contact-track geometry and phase windows are educational approximations. No factory cam card or ECU switching threshold is claimed.",
      "Piston crowns, valve pockets and chamber surfaces are not a calibrated combustion-volume model.",
      "The model uses 1–3–4–2 firing, a half-speed cam/distributor and counter-rotating double-speed balance shafts; remaining service-manual verification is recorded in the reference package.",
      "Intake hidden contours, vacuum component placement and local hoses are approximate. Market-specific ECU, emissions and hose routing remain unresolved.",
      "Accessory ratios, belt tooth geometry, manual ring-gear teeth and clutch dimensions are illustrative.",
      "Flow lines are schematic paths, not measured drillings, pressure or temperature simulations."
    ]
  }
};
