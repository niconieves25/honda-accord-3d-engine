import {ENGINE,SPEC} from '../engine-spec.js';
import {PART} from '../parts.js';
// F22A6 1993 Accord EX sedan 5MT. Component identity comes from the new
// KA/KL source package; numerical geometry is illustrative unless engine-spec.js
// explicitly labels that dimension as verified. No 1994 VTEC catalogue rows remain.
export const CATALOG_REFERENCE_ROOT="F22A6_1993_5MT/01_OEM_Diagrams";
export const CATALOG_SYSTEMS=[
  {
    "id": "exterior",
    "label": "Tapas y sellado exterior"
  },
  {
    "id": "bottom",
    "label": "Bloque, pistones y cigüeñal"
  },
  {
    "id": "balance",
    "label": "Ejes de equilibrado"
  },
  {
    "id": "head",
    "label": "Culata y válvulas"
  },
  {
    "id": "timing",
    "label": "Distribución"
  },
  {
    "id": "intake",
    "label": "Admisión, IAB y combustible"
  },
  {
    "id": "exhaust",
    "label": "Escape"
  },
  {
    "id": "ignition",
    "label": "Encendido"
  },
  {
    "id": "oil",
    "label": "Lubricación"
  },
  {
    "id": "cooling",
    "label": "Refrigeración"
  },
  {
    "id": "accessory",
    "label": "Accesorios"
  },
  {
    "id": "manual",
    "label": "Volante y embrague 5MT"
  }
];
export const CATALOG_NOTES={
  "identity": `Objetivo: ${ENGINE.code} de fábrica, ${ENGINE.vehicle} ${ENGINE.modelYear}, ${ENGINE.transmission}. Mercado de emisiones sin confirmar; KA/KL son catálogos consultados, no identificación del vehículo.`,
  "counts": "Cada ficha representa un tipo de pieza, no todas sus repeticiones. Las alternativas y sustituciones OEM no se montan simultáneamente.",
  "geometry": "Identidad y disposición verificadas donde se cita una fuente. Perfiles, espesores, longitudes no documentadas y pequeñas carreras son reconstrucciones ilustrativas, no cotas de fabricación.",
  "videos": "Las piezas fijas solo cambian de vista al inspeccionarlas. IAB, termostato, PCV y otros dispositivos de control tienen demostraciones de estado: no actúan una vez por ciclo del cigüeñal.",
  "oem": "Cada número y llamada procede del catálogo 1993 EX 5MT indicado. Fabricante, origen JPN/USA y mercado KA/KL pueden cambiar las referencias; el vehículo concreto requiere su identificación."
};
export const REMOVED_COMPONENTS={
  "rocker-primary": {
    "label": "Balancín primario de admisión",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "rocker-middle": {
    "label": "Balancín central VTEC",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "rocker-secondary": {
    "label": "Balancín secundario de admisión",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "pin-vtec-sync": {
    "label": "Pasador de sincronización VTEC",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "lost-motion": {
    "label": "Mecanismo de movimiento perdido",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "plate-vtec-timing": {
    "label": "Placa de sincronización VTEC",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "solenoid-vtec": {
    "label": "Electroválvula de control VTEC",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "filter-vtec": {
    "label": "Filtro de la válvula VTEC",
    "reason": "Esta pieza pertenecía al modelo SOHC VTEC anterior. El F22A6 de fábrica tiene accionamiento fijo de válvulas y no lleva este mecanismo."
  },
  "shaft-inlet-rockers": {
    "label": "Eje continuo de admisión anterior",
    "reason": "El F22A6 usa cinco tramos de apoyo: dos de tipo A y tres de tipo B. Consulte las fichas de cada tipo."
  },
  "bolt-valve-cover": {
    "label": "Fijación de tapa del modelo anterior",
    "reason": "La tapa F22A6 se sujeta con cuatro tuercas ciegas sobre sus espárragos. Consulte Tuerca de la tapa de válvulas."
  }
};
export const LEGACY_COMPONENT_ALIASES={
  "rocker-exhaust-a": "rocker-exhaust",
  "rocker-exhaust-b": "rocker-exhaust"
};
export const CATALOG=[
  {
    "id": "cover-valves",
    "system": "exterior",
    "label": "Tapa de válvulas",
    "english": "Cylinder head cover",
    "parentId": "valveCover",
    "kind": "valveCover",
    "quantity": "1",
    "location": "Sobre la culata, encima del árbol de levas y los balancines.",
    "function": "Encierra el tren de válvulas y contiene las salpicaduras de aceite; incorpora el acceso de llenado.",
    "connections": "Tapa sin emblema VTEC, junta perimetral, cuatro sellos de bujía y cuatro tuercas ciegas con sus arandelas.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Cubre el mecanismo de válvulas.",
      "La junta cierra el perímetro.",
      "El aceite permanece dentro y vuelve al cárter."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "2",
        "pn": "12310-PT3-010",
        "description": "Cover, Cylinder Head",
        "fitNote": "Fit Note: Mfg.Origin: JPN",
        "url": "https://www.hondapartsnow.com/genuine/honda~cover~cylinder~head~12310-pt3-010.html"
      }
    ],
    "confidence": "reference",
    "note": "Tapa F22A6 de fábrica; las alternativas de origen JPN/USA figuran en el catálogo. El detalle de fundición se reconstruye y no es un plano de fabricación.",
    "geometry": "illustrative"
  },
  {
    "id": "gasket-valve-cover",
    "system": "exterior",
    "label": "Junta de la tapa de válvulas",
    "english": "Cylinder head cover gasket",
    "parentId": "valveCover",
    "kind": "gasket",
    "quantity": "1 junta perimetral",
    "location": "Entre el borde inferior de la tapa y la culata.",
    "function": "Sella una unión desmontable para que no salga aceite por el contorno.",
    "connections": "Encaja en la tapa y se comprime contra la culata al fijarla.",
    "motion": {
      "type": "fixed",
      "description": "Permanece comprimida entre dos piezas fijas; no sigue el movimiento de las válvulas.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Se aloja en el borde de la tapa.",
      "El apriete genera contacto de sellado.",
      "El aceite queda separado del exterior."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "3",
        "pn": "12341-PT0-000",
        "description": "Gasket, Cylinder Head Cover",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~cylinder~head~12341-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "seal-plug-tube",
    "system": "exterior",
    "label": "Sello del tubo de bujía",
    "english": "Spark plug tube seal",
    "parentId": "valveCover",
    "kind": "seal",
    "quantity": "4; uno por bujía",
    "location": "Alrededor de cada paso del tubo de bujía por la tapa.",
    "function": "Evita que el aceite de la culata entre en el pozo donde se conecta el cable de bujía.",
    "connections": "Su labio rodea el tubo; el contorno exterior queda sujeto en la tapa.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El tubo deja acceso a la bujía.",
      "El sello abraza ese paso.",
      "El pozo queda aislado del aceite."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "4",
        "pn": "12342-PT0-000",
        "description": "Gasket B, Head Cover",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~head~cover~12342-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo lista sustituciones del mismo sello; no se montan todas a la vez.",
    "geometry": "illustrative"
  },
  {
    "id": "cap-oil-filler",
    "system": "exterior",
    "label": "Tapón de llenado de aceite",
    "english": "Oil filler cap",
    "parentId": "oilCap",
    "kind": "cover",
    "quantity": "1",
    "location": "En la abertura de llenado de la tapa de válvulas.",
    "function": "Cierra el punto por donde se añade aceite al motor.",
    "connections": "Rosca o cierre del cuello y junta inferior de sellado.",
    "motion": {
      "type": "fixed",
      "description": "Se retira al añadir aceite; permanece fijo cuando el motor funciona.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La abertura permite añadir aceite.",
      "El tapón se coloca con su junta.",
      "El cierre contiene salpicaduras y vapores."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "5",
        "pn": "15610-PC6-000",
        "description": "Cap Assy., Oil Filler",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cap~assy~15610-pc6-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "gasket-oil-cap",
    "system": "exterior",
    "label": "Junta del tapón de aceite",
    "english": "Oil filler cap gasket",
    "parentId": "oilCap",
    "kind": "seal",
    "quantity": "1",
    "location": "Debajo del tapón, contra el cuello de llenado.",
    "function": "Sella el contacto entre tapón y tapa de válvulas.",
    "connections": "Alojada en el tapón; se comprime al cerrarlo.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Se apoya bajo el tapón.",
      "El cierre comprime el material.",
      "La unión evita fugas al exterior."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "6",
        "pn": "15613-PC6-000",
        "description": "Gasket, Oil Filler",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~oil~filler~15613-pc6-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "cover-timing-upper",
    "system": "exterior",
    "label": "Cubierta superior de distribución",
    "english": "Upper timing belt cover",
    "parentId": "timingCoverUpper",
    "kind": "cover",
    "quantity": "1",
    "location": "En el extremo de distribución, sobre la polea del árbol de levas.",
    "function": "Protege la parte superior de la correa y de su polea de suciedad y contactos externos.",
    "connections": "Se fija al motor y empalma con las demás cubiertas; no toca la correa.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La correa gira detrás de la cubierta.",
      "La cubierta mantiene una separación.",
      "Sus fijaciones la sujetan al motor."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "3",
        "pn": "11820-PT0-000",
        "description": "Cover, Timing Belt (UPPER)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cover~timing~belt~11820-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "cover-timing-lower",
    "system": "exterior",
    "label": "Cubierta inferior de distribución",
    "english": "Lower timing belt cover",
    "parentId": "timingCoverLower",
    "kind": "cover",
    "quantity": "1",
    "location": "Delante de los accionamientos inferiores, detrás de la polea exterior del cigüeñal.",
    "function": "Protege las correas dentadas y las zonas de poleas inferiores.",
    "connections": "Se une a las cubiertas superior y posterior con sellos y tornillos.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Rodea los accionamientos inferiores.",
      "Los ejes pasan por sus aberturas.",
      "Las correas trabajan protegidas detrás."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "1",
        "pn": "11810-PT0-010",
        "description": "Cover, Timing Belt (LOWER)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cover~timing~belt~11810-pt0-010.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "nut-valve-cover",
    "system": "exterior",
    "label": "Tuerca ciega de la tapa",
    "english": "Head cover cap nut",
    "parentId": "valveCover",
    "kind": "nut",
    "quantity": "4",
    "location": "Sobre los cuatro puntos de fijación de la tapa.",
    "function": "Sujeta la tapa y comprime su sellado.",
    "connections": "Espárrago de culata y arandela de tapa.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "La tuerca se enrosca sobre el espárrago.",
      "Su apoyo transmite la carga a la arandela.",
      "La junta queda comprimida."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "8",
        "pn": "90213-PH3-000",
        "description": "Nut, Cap (6MM)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~nut~cap~90213-ph3-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "washer-valve-cover",
    "system": "exterior",
    "label": "Arandela de la tapa",
    "english": "Head cover washer",
    "parentId": "valveCover",
    "kind": "washer",
    "quantity": "4",
    "location": "Debajo de cada tuerca ciega.",
    "function": "Reparte la carga de apriete en la tapa.",
    "connections": "Tuerca, espárrago y tapa.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "Se coloca bajo la tuerca.",
      "Distribuye el esfuerzo sobre su apoyo.",
      "Permanece inmóvil al funcionar el motor."
    ],
    "oem": [
      {
        "diagram": "cylinder_head_cover",
        "market": "KA",
        "callout": "9",
        "pn": "90441-PT0-000",
        "description": "Washer, Head Cover",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~washer~head~cover~90441-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "block-cylinders",
    "system": "bottom",
    "label": "Bloque de cilindros",
    "english": "Cylinder block",
    "parentId": "block",
    "kind": "block",
    "quantity": "1 bloque con 4 cilindros",
    "location": "Cuerpo central del motor, entre la culata y el cárter de aceite.",
    "function": "Mantiene alineados los cilindros, soportes del cigüeñal y pasos de fluidos.",
    "connections": "Recibe la culata, el cigüeñal, las camisas de cilindro y los elementos inferiores.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Los pistones recorren los cuatro cilindros.",
      "Los apoyos mantienen el eje del cigüeñal.",
      "Aceite y refrigerante circulan por pasos separados."
    ],
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "market": "KA",
        "callout": "1",
        "pn": "11000-PT0-010",
        "description": "[Freight Parts] Block Assy., Cylinder",
        "fitNote": "Fit Note: Mfg.Origin: JPN    Replaced By: 11000-PT0-020",
        "url": "https://www.hondapartsnow.com/genuine/honda~block~assy~11000-pt0-010.html"
      }
    ],
    "confidence": "reference",
    "note": "Bloque de aleación de aluminio con camisas de hierro. Los conductos internos de la figura son explicativos.",
    "geometry": "illustrative"
  },
  {
    "id": "piston",
    "system": "bottom",
    "label": "Pistón",
    "english": "Piston",
    "parentId": "pistons",
    "kind": "piston",
    "quantity": "4; uno por cilindro",
    "location": "Dentro de cada cilindro, por encima de la biela.",
    "function": "Recibe la presión de los gases y transmite su fuerza a la biela mediante el bulón.",
    "connections": "Sus ranuras alojan los aros; sus apoyos alojan el bulón; la falda guía el recorrido.",
    "motion": {
      "type": "reciprocate",
      "description": `Sube y baja ${SPEC.stroke} mm entre sus puntos extremos. Los pistones 1 y 4 comparten altura; 2 y 3 se oponen.`,
      "driver": "Cigüeñal y biela; durante la expansión, la presión de combustión aporta trabajo."
    },
    "motionType": "reciprocate",
    "steps": [
      "La mezcla se comprime al subir.",
      "La combustión empuja la corona hacia abajo.",
      "El bulón transmite la fuerza a la biela."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "2",
        "pn": "13102-PT3-A01",
        "description": "Piston B (STD)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~piston~13102-pt3-a01.html"
      }
    ],
    "confidence": "reference",
    "note": "Pistón nominal STD. El catálogo contiene clases A/B y recambios sobremedida; no se instalan todas esas alternativas. Perfil de corona y rebajes ilustrativos.",
    "geometry": "illustrative"
  },
  {
    "id": "ring-top",
    "system": "bottom",
    "label": "Primer aro de compresión",
    "english": "Top compression ring",
    "parentId": "rings",
    "kind": "compressionRing",
    "quantity": "4; uno por pistón",
    "location": "En la ranura más cercana a la corona del pistón.",
    "function": "Limita la fuga de gases hacia el cárter y transmite parte del calor del pistón al cilindro.",
    "connections": "Se apoya en su ranura y contra la pared de la camisa, conservando una abertura entre extremos.",
    "motion": {
      "type": "reciprocate",
      "description": "Acompaña la subida y bajada del pistón; su apertura permite dilatación.",
      "driver": "Movimiento del pistón, elasticidad del aro y presión de los gases."
    },
    "motionType": "reciprocate",
    "steps": [
      "El aro rodea la zona superior del pistón.",
      "La presión ayuda a mantener el contacto de sellado.",
      "La película de aceite lubrica el deslizamiento."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "1",
        "pn": "13011-PT2-003",
        "description": "Ring Set, Piston (STD) (TEIKOKU)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1    Replaced By: 13011-P0A-004",
        "url": "https://www.hondapartsnow.com/genuine/honda~ring~set~piston~13011-pt2-003.html"
      }
    ],
    "confidence": "reference",
    "note": "La referencia OEM corresponde al juego de aros, no a un aro superior vendido por separado.",
    "geometry": "illustrative"
  },
  {
    "id": "ring-second",
    "system": "bottom",
    "label": "Segundo aro de compresión",
    "english": "Second piston ring",
    "parentId": "rings",
    "kind": "compressionRing",
    "quantity": "4; uno por pistón",
    "location": "En la segunda ranura del pistón, debajo del primer aro.",
    "function": "Complementa el control de gases y ayuda a controlar el aceite que queda en la pared del cilindro.",
    "connections": "Alojado en su propia ranura; funciona junto al primer aro y al conjunto de control de aceite.",
    "motion": {
      "type": "reciprocate",
      "description": "Se desplaza con el pistón, manteniendo contacto elástico con el cilindro.",
      "driver": "Pistón y elasticidad del aro."
    },
    "motionType": "reciprocate",
    "steps": [
      "Recibe los gases que superan el primer aro.",
      "Ayuda a controlar el aceite de la pared.",
      "Acompaña al pistón durante todo el ciclo."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "1",
        "pn": "13011-PT2-003",
        "description": "Ring Set, Piston (STD) (TEIKOKU)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1    Replaced By: 13011-P0A-004",
        "url": "https://www.hondapartsnow.com/genuine/honda~ring~set~piston~13011-pt2-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Subcomponente del juego de aros. La sección y orientación de montaje exactas no se deducen de esta figura.",
    "geometry": "illustrative"
  },
  {
    "id": "ring-oil",
    "system": "bottom",
    "label": "Conjunto de aro de aceite",
    "english": "Oil control ring assembly",
    "parentId": "rings",
    "kind": "oilRing",
    "quantity": "4 conjuntos; uno por pistón",
    "location": "En la ranura inferior del paquete de aros.",
    "function": "Controla el exceso de aceite de la camisa y facilita su retorno hacia el interior del pistón.",
    "connections": "Dos láminas y un expansor representados dentro de una ranura común.",
    "motion": {
      "type": "reciprocate",
      "description": "Las láminas y el expansor acompañan al pistón; el conjunto conserva presión radial.",
      "driver": "Pistón y elasticidad del expansor."
    },
    "motionType": "reciprocate",
    "steps": [
      "Las láminas contactan con el cilindro.",
      "Retiran el exceso de aceite durante el recorrido.",
      "El aceite vuelve por los pasos del pistón."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "1",
        "pn": "13011-PT2-003",
        "description": "Ring Set, Piston (STD) (TEIKOKU)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1    Replaced By: 13011-P0A-004",
        "url": "https://www.hondapartsnow.com/genuine/honda~ring~set~piston~13011-pt2-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia del juego completo; geometría del expansor y drenajes simplificada.",
    "geometry": "illustrative"
  },
  {
    "id": "piston-pin",
    "system": "bottom",
    "label": "Bulón del pistón",
    "english": "Piston pin",
    "parentId": "wristPins",
    "kind": "pin",
    "quantity": "4",
    "location": "Cruza el interior del pistón y el extremo pequeño de la biela.",
    "function": "Forma la articulación que permite inclinar la biela mientras el pistón se desplaza recto.",
    "connections": "Su eje es paralelo al del cigüeñal; enlaza los apoyos del pistón con la biela.",
    "motion": {
      "type": "reciprocate",
      "description": "Se traslada con el pistón mientras permite el giro relativo de la articulación.",
      "driver": "Pistón y biela."
    },
    "motionType": "reciprocate",
    "steps": [
      "Los apoyos del pistón sostienen el bulón.",
      "La biela cambia de inclinación alrededor de la articulación.",
      "El bulón transmite carga entre ambas piezas."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "3",
        "pn": "13112-PT0-000",
        "description": "Pin, Piston",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~pin~piston~13112-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Diámetro de referencia del manual: 21,994–22,000 mm. No se afirma una velocidad de giro propia del bulón.",
    "geometry": "illustrative"
  },
  {
    "id": "connecting-rod",
    "system": "bottom",
    "label": "Biela",
    "english": "Connecting rod",
    "parentId": "rods",
    "kind": "rod",
    "quantity": "4",
    "location": "Entre el bulón de cada pistón y una muñequilla del cigüeñal.",
    "function": "Transforma, junto al cigüeñal, el movimiento recto del pistón en rotación y transmite las cargas.",
    "connections": "Pie pequeño con bulón; cabeza grande con casquillos, tapa, pernos y tuercas.",
    "motion": {
      "type": "rock",
      "description": "Oscila lateralmente mientras su cabeza grande sigue una órbita; su pie acompaña al pistón.",
      "driver": "Geometría articulada de pistón, bulón y cigüeñal."
    },
    "motionType": "rock",
    "steps": [
      "El pistón carga el extremo pequeño.",
      "La biela transmite esfuerzo a la muñequilla desplazada.",
      "El cigüeñal gira y cambia la inclinación de la biela."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "5",
        "pn": "13210-PT3-A00",
        "description": "Rod, Connecting",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~rod~connecting~13210-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "La longitud entre centros sigue sin verificarse. La demostración usa una longitud ilustrativa.",
    "geometry": "illustrative"
  },
  {
    "id": "connecting-rod-cap",
    "system": "bottom",
    "label": "Tapa de biela",
    "english": "Connecting rod cap",
    "parentId": "rods",
    "kind": "rodCap",
    "quantity": "4",
    "location": "Cierra la mitad desmontable de la cabeza grande de cada biela.",
    "function": "Permite montar la biela alrededor de la muñequilla y retener el cojinete.",
    "connections": "Se empareja con su biela y se une mediante dos pernos y sus tuercas.",
    "motion": {
      "type": "rock",
      "description": "Se mueve solidaria con la cabeza de la biela; no gira de forma independiente.",
      "driver": "Biela a la que está fijada."
    },
    "motionType": "rock",
    "steps": [
      "La tapa completa el alojamiento circular.",
      "Los pernos mantienen la unión bajo carga.",
      "El conjunto rodea la película de aceite de la muñequilla."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "5",
        "pn": "13210-PT3-A00",
        "description": "Rod, Connecting",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~rod~connecting~13210-pt3-a00.html"
      }
    ],
    "confidence": "illustrative",
    "note": "Se muestra un subcomponente de la biela; el número OEM corresponde a la biela completa.",
    "geometry": "illustrative"
  },
  {
    "id": "bearing-rod",
    "system": "bottom",
    "label": "Semicojinete de biela",
    "english": "Connecting rod bearing shell",
    "parentId": "rods",
    "kind": "bearing",
    "quantity": "8 semicojinetes; 2 por biela",
    "location": "Entre la cabeza de la biela y la muñequilla del cigüeñal.",
    "function": "Proporciona la superficie de deslizamiento que trabaja separada del eje por aceite a presión.",
    "connections": "Una mitad se aloja en la biela y otra en su tapa.",
    "motion": {
      "type": "rock",
      "description": "Queda retenido en la biela y se mueve con ella; el eje desliza respecto al cojinete.",
      "driver": "Biela y película de lubricante."
    },
    "motionType": "rock",
    "steps": [
      "Las dos mitades forman el apoyo.",
      "El aceite entra desde el cigüeñal.",
      "La película soporta la carga y reduce el contacto metálico."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "6",
        "pn": "13211-PH3-004",
        "description": "Bearing A, Connecting Rod (BLUE) (TAIHO)",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~bearing~connecting~13211-ph3-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Se cita el grado D verde como ejemplo documentado. El grado correcto depende de las mediciones; no se montan todos los colores.",
    "geometry": "illustrative"
  },
  {
    "id": "crankshaft",
    "system": "bottom",
    "label": "Cigüeñal",
    "english": "Crankshaft",
    "parentId": "crankshaft",
    "kind": "crankshaft",
    "quantity": "1",
    "location": "En la parte inferior del bloque, apoyado en cinco posiciones principales.",
    "function": "Recibe las fuerzas de las bielas y entrega rotación a la transmisión y a los accionamientos.",
    "connections": "Cinco apoyos principales, cuatro muñequillas de biela, contrapesos y extremos de accionamiento.",
    "motion": {
      "type": "rotate",
      "description": "Gira una vuelta por ciclo de subida y bajada de cada pistón; el ciclo completo de cuatro tiempos requiere dos vueltas.",
      "driver": "Presión de combustión transmitida por los pistones y bielas."
    },
    "motionType": "rotate",
    "steps": [
      "La fuerza llega a una muñequilla fuera del eje central.",
      "Ese brazo genera par de giro.",
      "Los apoyos mantienen alineado el eje."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "8",
        "pn": "13310-PT3-315",
        "description": "Crankshaft",
        "fitNote": "Fit Note: Mfg.Origin: JPN,USA",
        "url": "https://www.hondapartsnow.com/genuine/honda~crankshaft~13310-pt3-315.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo incluye variantes de origen y recambios. Se conserva la arquitectura de cinco apoyos y cuatro muñequillas; perfil de contrapesos ilustrativo.",
    "geometry": "illustrative"
  },
  {
    "id": "bearing-main",
    "system": "bottom",
    "label": "Semicojinete de bancada",
    "english": "Main bearing shell",
    "parentId": "bearingBridge",
    "kind": "bearing",
    "quantity": "10 semicojinetes; 5 apoyos",
    "location": "Entre los muñones principales del cigüeñal y los alojamientos de bancada.",
    "function": "Soporta el cigüeñal sobre una película de aceite, manteniendo el eje de rotación.",
    "connections": "Mitad superior en el bloque y mitad inferior en el soporte correspondiente.",
    "motion": {
      "type": "fixed",
      "description": "Permanece retenido en su alojamiento; el cigüeñal gira dentro.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El alojamiento mantiene inmóvil el casquillo.",
      "El aceite llega al apoyo.",
      "El muñón gira sobre la película de lubricante."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "9",
        "pn": "13321-PT0-004",
        "description": "Bearing A, Main (BLACK) (TAIHO)",
        "fitNote": "Require Quantity: 10    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~bearing~main~13321-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia ilustrativa de grado C verde. El color/grado instalado debe seleccionarse por medición.",
    "geometry": "illustrative"
  },
  {
    "id": "washer-thrust",
    "system": "bottom",
    "label": "Arandela de empuje del cigüeñal",
    "english": "Crankshaft thrust washer",
    "parentId": "bearingBridge",
    "kind": "washer",
    "quantity": "2 arandelas",
    "location": "A los lados del apoyo de control axial del cigüeñal.",
    "function": "Limita el desplazamiento longitudinal del cigüeñal y recibe esfuerzos axiales.",
    "connections": "Trabaja entre el apoyo fijo y las caras de empuje del cigüeñal.",
    "motion": {
      "type": "fixed",
      "description": "Queda retenida; el cigüeñal gira frente a su superficie lubricada.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Las caras de empuje flanquean el apoyo.",
      "Una fuerza axial carga una de las caras.",
      "La holgura controlada permite lubricación y dilatación."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "10",
        "pn": "13331-PT0-003",
        "description": "Washer, Thrust (DAIDO)",
        "fitNote": "Require Quantity: 2    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~washer~thrust~13331-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo identifica un juego. La cantidad de piezas dentro del paquete comercial no se trata como cantidad instalada.",
    "geometry": "illustrative"
  },
  {
    "id": "bridge-main-bearing",
    "system": "bottom",
    "label": "Puente de apoyos de bancada",
    "english": "Bearing cap bridge",
    "parentId": "bearingBridge",
    "kind": "plate",
    "quantity": "1 conjunto",
    "location": "Debajo del cigüeñal, uniendo la estructura inferior de los apoyos.",
    "function": "Refuerza y mantiene la relación entre los apoyos inferiores del cigüeñal.",
    "connections": "Se fija al bloque y a la zona de bancadas mediante sus elementos de sujeción.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Los apoyos inferiores reciben las cargas del cigüeñal.",
      "El puente los vincula estructuralmente.",
      "Las fijaciones mantienen el conjunto alineado."
    ],
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "market": "KA",
        "callout": "4",
        "pn": "11130-PT0-000",
        "description": "Bridge, Bearing Cap",
        "fitNote": "Replaced By: 11130-PT0-030",
        "url": "https://www.hondapartsnow.com/genuine/honda~bridge~bearing~cap~11130-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "bolt-connecting-rod",
    "system": "bottom",
    "label": "Perno de biela",
    "english": "Connecting rod bolt",
    "parentId": "rods",
    "kind": "bolt",
    "quantity": "8; dos por biela",
    "location": "A ambos lados de la tapa de cada biela.",
    "function": "Mantiene cerrada la cabeza de biela durante las cargas alternantes del motor.",
    "connections": "Une cuerpo y tapa de biela; se combina con una tuerca de biela.",
    "motion": {
      "type": "rock",
      "description": "No gira dentro de la biela; se desplaza y oscila con el conjunto al que está sujeto.",
      "driver": "Biela."
    },
    "motionType": "rock",
    "steps": [
      "El perno atraviesa la unión cuerpo–tapa.",
      "La tuerca genera la fuerza de sujeción.",
      "La unión permanece cerrada durante todo el ciclo."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "7",
        "pn": "13213-ME2-000",
        "description": "Bolt, Connecting Rod",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~bolt~connecting~rod~13213-me2-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "shaft-balance-front",
    "system": "balance",
    "label": "Eje equilibrador delantero",
    "english": "Front balance shaft",
    "parentId": "balancerFront",
    "kind": "shaft",
    "quantity": "1",
    "location": "En un alojamiento longitudinal de la parte baja del bloque, lado delantero.",
    "function": "Su masa excéntrica genera una fuerza que, combinada con el otro eje, reduce vibraciones secundarias.",
    "connections": "Apoyos del bloque, polea y accionamiento de equilibrado.",
    "motion": {
      "type": "rotate",
      "description": "Gira al doble de la velocidad del cigüeñal y en sentido opuesto al otro eje equilibrador.",
      "driver": "Correa y poleas del sistema de equilibrado."
    },
    "motionType": "rotate",
    "steps": [
      "La masa excéntrica gira alrededor del eje.",
      "La pareja produce una fuerza periódica coordinada.",
      "Esa fuerza compensa parte de la vibración vertical."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "12",
        "pn": "13401-P5M-000",
        "description": "Shaft, FR. Balancer",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~13401-p5m-000.html"
      }
    ],
    "confidence": "reference",
    "note": "La fase de montaje requiere las marcas y el procedimiento de servicio; no se obtiene únicamente de la relación 2:1.",
    "geometry": "illustrative"
  },
  {
    "id": "shaft-balance-rear",
    "system": "balance",
    "label": "Eje equilibrador trasero",
    "english": "Rear balance shaft",
    "parentId": "balancerRear",
    "kind": "shaft",
    "quantity": "1",
    "location": "En el segundo alojamiento longitudinal bajo los cilindros.",
    "function": "Completa la pareja de masas que reduce la vibración secundaria del cuatro cilindros.",
    "connections": "Cojinetes del bloque y conjunto de engranajes de accionamiento.",
    "motion": {
      "type": "rotate",
      "description": "Gira a dos veces la velocidad del cigüeñal, contrarrotando respecto al eje delantero.",
      "driver": "Sistema de equilibrado y caja de engranajes."
    },
    "motionType": "rotate",
    "steps": [
      "El accionamiento impone velocidad y fase.",
      "La masa gira en sentido contrario a la pareja.",
      "Las componentes de fuerza se combinan para equilibrar."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "11",
        "pn": "13400-PT3-010",
        "description": "Shaft, RR. Balancer",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~13400-pt3-010.html"
      }
    ],
    "confidence": "reference",
    "note": "El engranaje cambia el sentido de la pareja; su dentado exacto está simplificado.",
    "geometry": "illustrative"
  },
  {
    "id": "belt-balance",
    "system": "balance",
    "label": "Correa de equilibrado",
    "english": "Balancer timing belt",
    "parentId": "balancerBelt",
    "kind": "belt",
    "quantity": "1",
    "location": "En el extremo de distribución, en un plano separado de la correa del árbol de levas.",
    "function": "Mantiene sincronizado el accionamiento de los ejes de equilibrado con el cigüeñal.",
    "connections": "Polea motriz de equilibrado, poleas conducidas y rodillo ajustador.",
    "motion": {
      "type": "flow",
      "description": "Avanza por un circuito cerrado; sus dientes engranan con las poleas.",
      "driver": "Polea de equilibrado movida por el cigüeñal."
    },
    "motionType": "flow",
    "steps": [
      "La polea motriz arrastra los dientes.",
      "La correa transmite movimiento al sistema.",
      "El ajustador mantiene su recorrido tensado."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "11",
        "pn": "13405-PT0-004",
        "description": "Belt, Balancer Timing (UNITTA)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~belt~balancer~timing~13405-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Es una correa distinta de la de distribución y de las correas exteriores de accesorios.",
    "geometry": "illustrative"
  },
  {
    "id": "tensioner-balance",
    "system": "balance",
    "label": "Rodillo ajustador de equilibrado",
    "english": "Balancer belt adjuster",
    "parentId": "balancerAdjuster",
    "kind": "pulley",
    "quantity": "1",
    "location": "Contra el tramo de ajuste de la correa de equilibrado.",
    "function": "Permite ajustar la tensión necesaria para mantener el engrane de la correa.",
    "connections": "Rodillo sobre soporte de ajuste, con muelle y fijación.",
    "motion": {
      "type": "rotate",
      "description": "El rodillo gira por contacto con la correa; la posición ajustada de su soporte queda fijada.",
      "driver": "Correa de equilibrado."
    },
    "motionType": "rotate",
    "steps": [
      "El rodillo contacta con la correa.",
      "El mecanismo permite ajustar su posición.",
      "La fijación conserva la tensión de servicio."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "10",
        "pn": "13404-PT0-004",
        "description": "Adjuster, Balancer Belt (NIPPON SEIKO)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~adjuster~balancer~belt~13404-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "cylinder-head",
    "system": "head",
    "label": "Culata",
    "english": "Cylinder head",
    "parentId": "head",
    "kind": "head",
    "quantity": "1",
    "location": "Sobre los cuatro cilindros, debajo de la tapa de válvulas.",
    "function": "Cierra las cámaras de combustión y contiene conductos, válvulas, guías y apoyos del tren de válvulas.",
    "connections": "Bloque y junta por debajo; colectores en los lados; árbol y balancines por encima.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Los conductos llevan gases hacia las válvulas.",
      "Las cámaras cierran el extremo de los cilindros.",
      "Los apoyos superiores guían el mecanismo de apertura."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "1",
        "pn": "12100-PT3-A01",
        "description": "Cylinder Head Assy.",
        "fitNote": "Fit Note: Mfg.Origin: JPN,USA    Replaced By: 12100-PT3-A02",
        "url": "https://www.hondapartsnow.com/genuine/honda~cylinder~head~assy~12100-pt3-a01.html"
      }
    ],
    "confidence": "reference",
    "note": "La geometría interna de puertos y cámaras es aproximada; no se ha calibrado su volumen a la relación de compresión.",
    "geometry": "illustrative"
  },
  {
    "id": "gasket-cylinder-head",
    "system": "head",
    "label": "Junta de culata",
    "english": "Cylinder head gasket",
    "parentId": "headGasket",
    "kind": "gasket",
    "quantity": "1",
    "location": "Entre las superficies planas del bloque y de la culata.",
    "function": "Sella los cuatro cilindros y separa los pasos de aceite y refrigerante.",
    "connections": "Sus aberturas coinciden con cilindros, pasos y fijaciones del bloque y la culata.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Los orificios grandes rodean los cilindros.",
      "Los pasos menores comunican los circuitos previstos.",
      "La unión comprimida contiene presión y fluidos."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "6",
        "pn": "12251-PT0-014",
        "description": "Gasket, Cylinder Head (NIPPON LEAKLESS)",
        "fitNote": "Replaced By: 12251-PT0-J02",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~cylinder~head~12251-pt0-014.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "camshaft",
    "system": "head",
    "label": "Árbol de levas",
    "english": "Camshaft",
    "parentId": "camshaft",
    "kind": "shaft",
    "quantity": "1",
    "location": "En la parte superior de la culata, a lo largo de los cuatro cilindros.",
    "function": "Sus lóbulos fijan cuándo y cuánto se mueven los balancines y las válvulas.",
    "connections": "Polea de distribución, apoyos de culata, balancines y distribuidor en el extremo opuesto.",
    "motion": {
      "type": "rotate",
      "description": "Gira a la mitad de la velocidad del cigüeñal: una vuelta de leva por dos de cigüeñal.",
      "driver": "Correa de distribución y polea del árbol."
    },
    "motionType": "rotate",
    "steps": [
      "El círculo base deja la válvula cerrada.",
      "El lóbulo levanta el balancín.",
      "El descenso del perfil permite cerrar la válvula."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "14",
        "pn": "14111-PT4-F50",
        "description": "Camshaft",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~camshaft~14111-pt4-f50.html"
      }
    ],
    "confidence": "reference",
    "note": "Árbol de perfil fijo F22A6, PN14111-PT4-F50 en el catálogo consultado. Curvas y posiciones de detalle no medidas; no hay lóbulo VTEC conmutable.",
    "geometry": "illustrative"
  },
  {
    "id": "valve-inlet",
    "system": "head",
    "label": "Válvula de admisión",
    "english": "Inlet valve",
    "parentId": "intakeValves",
    "kind": "valve",
    "quantity": "8; dos por cilindro",
    "location": "Entre cada conducto de admisión de la culata y su cámara de combustión.",
    "function": "Abre el paso de la carga de aire y combustible al cilindro y después lo sella.",
    "connections": "Vástago en una guía, cabeza contra su asiento, resorte y balancín en el extremo superior.",
    "motion": {
      "type": "reciprocate",
      "description": "Se abre y cierra siguiendo un perfil fijo de admisión; no cambia de lóbulo por régimen.",
      "driver": "Lóbulo de leva a través del balancín; el resorte realiza el cierre."
    },
    "motionType": "reciprocate",
    "steps": [
      "El balancín empuja el vástago.",
      "La cabeza se separa del asiento y permite entrar carga.",
      "El resorte devuelve la cabeza al asiento."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "7",
        "pn": "14711-PT3-A00",
        "description": "Valve, Inlet",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~14711-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "valve-exhaust",
    "system": "head",
    "label": "Válvula de escape",
    "english": "Exhaust valve",
    "parentId": "exhaustValves",
    "kind": "valve",
    "quantity": "8; dos por cilindro",
    "location": "Entre la cámara de combustión y los puertos de escape de la culata.",
    "function": "Permite salir a los gases quemados y sella la cámara durante las otras fases.",
    "connections": "Guía, asiento, resorte, retención superior y balancín de escape.",
    "motion": {
      "type": "reciprocate",
      "description": "Se abre y cierra siguiendo el perfil fijo de escape mediante su balancín.",
      "driver": "Árbol de levas, balancín de escape y resorte."
    },
    "motionType": "reciprocate",
    "steps": [
      "La leva acciona el balancín de escape.",
      "La cabeza abre el paso de salida.",
      "El resorte cierra la válvula sobre su asiento."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "8",
        "pn": "14721-P0J-A00",
        "description": "Valve, Exhaust",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~14721-p0j-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "spring-valve-inlet",
    "system": "head",
    "label": "Resorte de válvula de admisión",
    "english": "Inlet valve spring",
    "parentId": "intakeValves",
    "kind": "spring",
    "quantity": "8",
    "location": "Rodea el vástago de cada válvula de admisión, sobre la culata.",
    "function": "Cierra la válvula y mantiene el tren de accionamiento en contacto cuando el lóbulo desciende.",
    "connections": "Asiento inferior fijo y platillo superior unido a la válvula.",
    "motion": {
      "type": "spring",
      "description": "Se comprime al abrir la válvula y se extiende al cerrarla; conserva precarga en reposo.",
      "driver": "Desplazamiento de la válvula y elasticidad del resorte."
    },
    "motionType": "spring",
    "steps": [
      "El platillo baja al abrirse la válvula.",
      "El resorte almacena energía al comprimirse.",
      "La libera para devolver la válvula al asiento."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "10",
        "pn": "14761-PT5-003",
        "description": "Spring, Inlet Valve (BLUE) (NIPPON HATSUJO)",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~14761-pt5-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Resorte de admisión identificado como azul en el catálogo F22A6. Alzada y espiras de la reconstrucción son ilustrativas.",
    "geometry": "illustrative"
  },
  {
    "id": "spring-valve-exhaust",
    "system": "head",
    "label": "Resorte de válvula de escape",
    "english": "Exhaust valve spring",
    "parentId": "exhaustValves",
    "kind": "spring",
    "quantity": "8",
    "location": "Alrededor de cada vástago de escape.",
    "function": "Devuelve la válvula de escape a su asiento y mantiene el seguimiento de la leva.",
    "connections": "Asiento inferior y platillo superior de la válvula de escape.",
    "motion": {
      "type": "spring",
      "description": "Se acorta durante la apertura y recupera su longitud instalada durante el cierre.",
      "driver": "Balancín de escape, válvula y fuerza elástica."
    },
    "motionType": "spring",
    "steps": [
      "El balancín abre la válvula.",
      "El platillo comprime el resorte.",
      "El resorte cierra cuando el perfil de leva lo permite."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "11",
        "pn": "14762-PT5-003",
        "description": "Spring, Exhaust Valve (GREEN) (NIPPON HATSUJO)",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~14762-pt5-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Resorte de escape identificado como verde en el catálogo F22A6; número distinto del resorte de admisión.",
    "geometry": "illustrative"
  },
  {
    "id": "retainer-valve",
    "system": "head",
    "label": "Platillo superior del resorte",
    "english": "Valve spring retainer",
    "parentId": "intakeValves",
    "kind": "retainer",
    "quantity": "16; uno por válvula",
    "location": "Sobre cada resorte, cerca del extremo superior del vástago.",
    "function": "Transfiere la fuerza del resorte a la válvula mediante las dos chavetas de retención.",
    "connections": "Apoya en el resorte y encierra las chavetas alrededor del vástago.",
    "motion": {
      "type": "reciprocate",
      "description": "Acompaña a la válvula en su recorrido, comprimiendo o liberando el resorte.",
      "driver": "Válvula, chavetas y resorte."
    },
    "motionType": "reciprocate",
    "steps": [
      "El resorte empuja por debajo del platillo.",
      "Las chavetas lo traban al vástago.",
      "Platillo y válvula se desplazan juntos."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "12",
        "pn": "14765-PT0-000",
        "description": "Retainer, Valve Spring",
        "fitNote": "Require Quantity: 16    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~retainer~valve~spring~14765-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "keepers-valve",
    "system": "head",
    "label": "Chavetas de retención de válvula",
    "english": "Valve cotters / keepers",
    "parentId": "intakeValves",
    "kind": "keeper",
    "quantity": "32 mitades; dos por válvula",
    "location": "En la ranura superior de cada vástago, dentro del platillo.",
    "function": "Bloquean el platillo al vástago para que el resorte pueda cerrar la válvula.",
    "connections": "Dos mitades cónicas sujetas por el alojamiento del platillo.",
    "motion": {
      "type": "reciprocate",
      "description": "Viajan con válvula y platillo; no se separan durante el funcionamiento.",
      "driver": "Válvula a la que quedan retenidas."
    },
    "motionType": "reciprocate",
    "steps": [
      "Las dos mitades rodean la ranura del vástago.",
      "El platillo las comprime en su asiento cónico.",
      "La fuerza del resorte queda conectada a la válvula."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "14",
        "pn": "14781-PJ7-003",
        "description": "Cotter, Valve (FUJI VALVE)",
        "fitNote": "Require Quantity: 32    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~cotter~valve~14781-pj7-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "guide-valve",
    "system": "head",
    "label": "Guía de válvula de admisión",
    "english": "Inlet valve guide",
    "parentId": "head",
    "kind": "pipe",
    "quantity": "8 guías de admisión",
    "location": "Insertada en la culata alrededor de cada vástago de admisión.",
    "function": "Mantiene alineada la válvula con su asiento y conduce parte de su calor hacia la culata.",
    "connections": "Exterior sujeto en la culata; interior con holgura de deslizamiento para el vástago.",
    "motion": {
      "type": "fixed",
      "description": "La guía permanece fija; la válvula desliza por su interior.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La culata retiene la guía.",
      "El vástago se desplaza por su taladro.",
      "La guía conserva la dirección de cierre."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "2",
        "pn": "12204-PJ7-305",
        "description": "Guide, Valve (OVER SIZE)",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~guide~valve~12204-pj7-305.html"
      }
    ],
    "confidence": "reference",
    "note": "La fila OEM disponible es una guía de recambio sobremedida. Acredita la pieza y su ubicación, no una medida nominal del modelo 3D.",
    "geometry": "illustrative"
  },
  {
    "id": "seal-valve-stem",
    "system": "head",
    "label": "Retén del vástago de admisión",
    "english": "Inlet valve stem seal",
    "parentId": "intakeValves",
    "kind": "seal",
    "quantity": "8 de admisión; el escape usa otra referencia",
    "location": "Sobre la guía, debajo del resorte de admisión.",
    "function": "Dosifica el aceite que puede acompañar al vástago y limita su entrada al conducto.",
    "connections": "Se fija sobre la guía; su labio rodea el vástago móvil.",
    "motion": {
      "type": "fixed",
      "description": "El retén queda fijo mientras el vástago se desliza por su labio.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El aceite lubrica la parte superior del mecanismo.",
      "El labio controla lo que llega al vástago.",
      "La válvula conserva lubricación sin un exceso de aceite."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "4",
        "pn": "12210-PZ1-004",
        "description": "Seal A, Valve Stem (NOK)",
        "fitNote": "Require Quantity: 8    Package Quantity: 10",
        "url": "https://www.hondapartsnow.com/genuine/honda~seal~valve~stem~12210-pz1-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "screw-valve-lash",
    "system": "head",
    "label": "Tornillo de ajuste de válvula",
    "english": "Tappet adjusting screw",
    "parentId": "exhaustRockers",
    "kind": "bolt",
    "quantity": "16; uno por válvula accionada",
    "location": "En el extremo de los balancines que contactan con las válvulas.",
    "function": "Permite establecer la holgura en frío entre el accionamiento y la válvula.",
    "connections": "Rosca en el balancín y contratuerca de bloqueo.",
    "motion": {
      "type": "rock",
      "description": "Conserva su ajuste y oscila con el balancín; no se autorregula girando.",
      "driver": "Balancín."
    },
    "motionType": "rock",
    "steps": [
      "Su posición define la holgura.",
      "La contratuerca bloquea el ajuste.",
      "El extremo transmite el empuje del balancín."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "9",
        "pn": "14744-PT0-004",
        "description": "Screw, Tappet Adjusting",
        "fitNote": "Require Quantity: 16    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~screw~tappet~adjusting~14744-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Hay 16 ajustadores: uno por cada válvula. Las holguras de servicio deben consultarse en el manual aplicable.",
    "geometry": "illustrative"
  },
  {
    "id": "rocker-inlet-a",
    "system": "head",
    "label": "Balancín de admisión A",
    "english": "Valve rocker admisión A",
    "parentId": "intakeRockers",
    "kind": "rocker",
    "quantity": "4",
    "location": "En la culata, entre la leva y el vástago de válvula.",
    "function": "Transmite el movimiento del perfil fijo de leva a una válvula.",
    "connections": "Superficie de contacto de leva, apoyo del balancín, tornillo de ajuste y resorte de válvula.",
    "motion": {
      "type": "rock",
      "description": "Oscila sobre su apoyo para abrir la válvula; el resorte sigue el retorno del perfil fijo.",
      "driver": "Árbol de levas a la mitad de velocidad del cigüeñal."
    },
    "motionType": "rock",
    "steps": [
      "El perfil de leva empuja el contacto.",
      "El balancín pivota y acciona una válvula.",
      "El resorte devuelve la válvula y el balancín."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "1",
        "pn": "14621-PT0-000",
        "description": "Arm A, Inlet Rocker",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~arm~14621-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "rocker-inlet-b",
    "system": "head",
    "label": "Balancín de admisión B",
    "english": "Valve rocker admisión B",
    "parentId": "intakeRockers",
    "kind": "rocker",
    "quantity": "4",
    "location": "En la culata, entre la leva y el vástago de válvula.",
    "function": "Transmite el movimiento del perfil fijo de leva a una válvula.",
    "connections": "Superficie de contacto de leva, apoyo del balancín, tornillo de ajuste y resorte de válvula.",
    "motion": {
      "type": "rock",
      "description": "Oscila sobre su apoyo para abrir la válvula; el resorte sigue el retorno del perfil fijo.",
      "driver": "Árbol de levas a la mitad de velocidad del cigüeñal."
    },
    "motionType": "rock",
    "steps": [
      "El perfil de leva empuja el contacto.",
      "El balancín pivota y acciona una válvula.",
      "El resorte devuelve la válvula y el balancín."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "2",
        "pn": "14622-PT0-000",
        "description": "Arm B, Inlet Rocker",
        "fitNote": "Require Quantity: 4    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~arm~14622-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "rocker-exhaust",
    "system": "head",
    "label": "Balancín de escape",
    "english": "Valve rocker escape",
    "parentId": "exhaustRockers",
    "kind": "rocker",
    "quantity": "8",
    "location": "En la culata, entre la leva y el vástago de válvula.",
    "function": "Transmite el movimiento del perfil fijo de leva a una válvula.",
    "connections": "Superficie de contacto de leva, apoyo del balancín, tornillo de ajuste y resorte de válvula.",
    "motion": {
      "type": "rock",
      "description": "Oscila sobre su apoyo para abrir la válvula; el resorte sigue el retorno del perfil fijo.",
      "driver": "Árbol de levas a la mitad de velocidad del cigüeñal."
    },
    "motionType": "rock",
    "steps": [
      "El perfil de leva empuja el contacto.",
      "El balancín pivota y acciona una válvula.",
      "El resorte devuelve la válvula y el balancín."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "3",
        "pn": "14623-PT0-000",
        "description": "Arm, Exhaust Rocker",
        "fitNote": "Require Quantity: 8    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~arm~14623-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "shaft-inlet-rockers-a",
    "system": "head",
    "label": "Tramo A del eje de admisión",
    "english": "Rocker arm support shaft",
    "parentId": "rockerShafts",
    "kind": "shaft",
    "quantity": "2",
    "location": "Dentro de los soportes y balancines de la culata.",
    "function": "Define el apoyo alrededor del cual oscilan los balancines.",
    "connections": "Portabalancines, pasos de aceite y superficies interiores de los balancines.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "Los soportes retienen el eje.",
      "El balancín oscila sobre su superficie lubricada.",
      "El eje permanece fijo."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "7",
        "pn": "14631-P0B-A00",
        "description": "Shaft A, Rocker Arm",
        "fitNote": "Fit Note: Mfg.Origin: JPN    Require Quantity: 2    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~rocker~arm~14631-p0b-a00.html"
      },
      {
        "diagram": "cylinder_head",
        "market": "KL",
        "callout": "7",
        "pn": "14631-PT0-010",
        "description": "Shaft A, Valve Rocker Arm",
        "fitNote": "Require Quantity: 2    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~valve~rocker~14631-pt0-010.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "La admisión usa cinco tramos: dos de tipo A y tres de tipo B; no es un eje continuo."
  },
  {
    "id": "shaft-inlet-rockers-b",
    "system": "head",
    "label": "Tramo B del eje de admisión",
    "english": "Rocker arm support shaft",
    "parentId": "rockerShafts",
    "kind": "shaft",
    "quantity": "3",
    "location": "Dentro de los soportes y balancines de la culata.",
    "function": "Define el apoyo alrededor del cual oscilan los balancines.",
    "connections": "Portabalancines, pasos de aceite y superficies interiores de los balancines.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "Los soportes retienen el eje.",
      "El balancín oscila sobre su superficie lubricada.",
      "El eje permanece fijo."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "8",
        "pn": "14632-P0B-A00",
        "description": "Shaft B, Rocker Arm",
        "fitNote": "Fit Note: Mfg.Origin: JPN    Require Quantity: 3    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~rocker~arm~14632-p0b-a00.html"
      },
      {
        "diagram": "cylinder_head",
        "market": "KL",
        "callout": "8",
        "pn": "14632-PT0-010",
        "description": "Shaft B, Valve Rocker Arm",
        "fitNote": "Require Quantity: 3    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~valve~rocker~14632-pt0-010.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "La admisión usa cinco tramos: dos de tipo A y tres de tipo B; no es un eje continuo."
  },
  {
    "id": "shaft-exhaust-rockers",
    "system": "head",
    "label": "Eje de balancines de escape",
    "english": "Rocker arm support shaft",
    "parentId": "rockerShafts",
    "kind": "shaft",
    "quantity": "1",
    "location": "Dentro de los soportes y balancines de la culata.",
    "function": "Define el apoyo alrededor del cual oscilan los balancines.",
    "connections": "Portabalancines, pasos de aceite y superficies interiores de los balancines.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "Los soportes retienen el eje.",
      "El balancín oscila sobre su superficie lubricada.",
      "El eje permanece fijo."
    ],
    "oem": [
      {
        "diagram": "cylinder_head",
        "market": "KA",
        "callout": "9",
        "pn": "14633-PT0-000",
        "description": "Shaft, Exhaust Valve Rocker Arm",
        "fitNote": "Replaced By: 14633-P0B-A00",
        "url": "https://www.hondapartsnow.com/genuine/honda~shaft~14633-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Un eje continuo de escape; sus dimensiones de detalle son ilustrativas."
  },
  {
    "id": "spring-rocker-a",
    "system": "head",
    "label": "Resorte separador de balancines A",
    "english": "Rocker lateral preload component",
    "parentId": "rockerShafts",
    "kind": "spring",
    "quantity": "3",
    "location": "En los apoyos del conjunto de balancines.",
    "function": "Mantiene el posicionamiento y la precarga lateral de los elementos del conjunto.",
    "connections": "Balancines, soportes y caras de apoyo.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "La pieza se monta entre sus apoyos.",
      "La deformación elástica establece precarga lateral.",
      "No describe la carrera de una válvula."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "4",
        "pn": "14645-PT0-003",
        "description": "Spring A, Valve Rocker Arm (SANKO)",
        "fitNote": "Require Quantity: 3    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~valve~rocker~14645-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "spring-rocker-b",
    "system": "head",
    "label": "Resorte separador de balancines B",
    "english": "Rocker lateral preload component",
    "parentId": "rockerShafts",
    "kind": "spring",
    "quantity": "2",
    "location": "En los apoyos del conjunto de balancines.",
    "function": "Mantiene el posicionamiento y la precarga lateral de los elementos del conjunto.",
    "connections": "Balancines, soportes y caras de apoyo.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "La pieza se monta entre sus apoyos.",
      "La deformación elástica establece precarga lateral.",
      "No describe la carrera de una válvula."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "5",
        "pn": "14646-PN4-003",
        "description": "Spring B, Valve Rocker Arm (SANKO)",
        "fitNote": "Require Quantity: 2    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~valve~rocker~14646-pn4-003.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "washer-rocker-wave",
    "system": "head",
    "label": "Arandela ondulada de balancines",
    "english": "Rocker lateral preload component",
    "parentId": "rockerShafts",
    "kind": "washer",
    "quantity": "5",
    "location": "En los apoyos del conjunto de balancines.",
    "function": "Mantiene el posicionamiento y la precarga lateral de los elementos del conjunto.",
    "connections": "Balancines, soportes y caras de apoyo.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "La pieza se monta entre sus apoyos.",
      "La deformación elástica establece precarga lateral.",
      "No describe la carrera de una válvula."
    ],
    "oem": [
      {
        "diagram": "valve_rocker_arm",
        "market": "KA",
        "callout": "6",
        "pn": "14647-PT0-000",
        "description": "Washer, Wave",
        "fitNote": "Require Quantity: 5    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~washer~wave~14647-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "belt-timing",
    "system": "timing",
    "label": "Correa de distribución",
    "english": "Timing belt",
    "parentId": "timingBelt",
    "kind": "belt",
    "quantity": "1",
    "location": "Detrás de las cubiertas del extremo de distribución.",
    "function": "Conserva la relación angular entre cigüeñal y árbol de levas y acciona la bomba de agua.",
    "connections": "Poleas del cigüeñal y árbol de levas, bomba de agua y rodillo tensor.",
    "motion": {
      "type": "flow",
      "description": "Sus dientes avanzan por un circuito cerrado manteniendo la relación 2:1 entre cigüeñal y árbol.",
      "driver": "Polea dentada del cigüeñal."
    },
    "motionType": "flow",
    "steps": [
      "El cigüeñal impulsa la correa.",
      "Los dientes transmiten el movimiento sin deslizamiento previsto.",
      "El árbol de levas completa una vuelta por dos del cigüeñal."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "16",
        "pn": "14400-PT0-004",
        "description": "Belt, Timing (113RU24 A-555) (UNITTA)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~belt~timing~14400-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "La referencia del catálogo incluye 112RU24. La representación del dentado puede simplificarse y no es una plantilla de fabricación.",
    "geometry": "illustrative"
  },
  {
    "id": "pulley-camshaft",
    "system": "timing",
    "label": "Polea del árbol de levas",
    "english": "Camshaft timing pulley",
    "parentId": "camPulley",
    "kind": "pulley",
    "quantity": "1",
    "location": "En el extremo de distribución del árbol de levas.",
    "function": "Recibe el movimiento de la correa y fija la relación del árbol con el cigüeñal.",
    "connections": "Árbol, fijación central, posicionamiento angular y correa dentada.",
    "motion": {
      "type": "rotate",
      "description": "Gira con el árbol a la mitad de la velocidad del cigüeñal.",
      "driver": "Correa de distribución."
    },
    "motionType": "rotate",
    "steps": [
      "Los dientes reciben la tracción de la correa.",
      "La unión central transmite par al árbol.",
      "Las marcas permiten establecer la sincronización de montaje."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "15",
        "pn": "14210-PT0-003",
        "description": "Pulley, Timing Belt Driven",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pulley~timing~belt~driven~14210-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "pulley-crank-timing",
    "system": "timing",
    "label": "Piñón de distribución del cigüeñal",
    "english": "Crankshaft timing belt drive pulley",
    "parentId": "crankTimingPulley",
    "kind": "pulley",
    "quantity": "1",
    "location": "En el extremo del cigüeñal, detrás de la polea exterior de accesorios.",
    "function": "Es el accionamiento de origen de la correa de distribución.",
    "connections": "Cigüeñal, chaveta de posición y correa dentada.",
    "motion": {
      "type": "rotate",
      "description": "Gira solidario con el cigüeñal, a su misma velocidad.",
      "driver": "Cigüeñal."
    },
    "motionType": "rotate",
    "steps": [
      "La chaveta conserva la posición relativa.",
      "El cigüeñal transmite par al piñón.",
      "Los dientes arrastran la correa de distribución."
    ],
    "oem": [
      {
        "diagram": "crankshaft_piston",
        "market": "KA",
        "callout": "16",
        "pn": "13621-PT0-003",
        "description": "Pulley, Timing Belt Drive",
        "fitNote": "Fit Note: Mfg.Origin: JPN,USA    Replaced By: 13621-P0A-003",
        "url": "https://www.hondapartsnow.com/genuine/honda~pulley~timing~belt~drive~13621-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "tensioner-timing",
    "system": "timing",
    "label": "Rodillo tensor de distribución",
    "english": "Timing belt adjuster",
    "parentId": "timingTensioner",
    "kind": "pulley",
    "quantity": "1",
    "location": "En un tramo de retorno de la correa de distribución.",
    "function": "Permite establecer la tensión de montaje y sostiene el recorrido de la correa.",
    "connections": "Soporte, fijación de ajuste, muelle y superficie posterior de la correa.",
    "motion": {
      "type": "rotate",
      "description": "El rodillo gira con el contacto de la correa; su posición de ajuste queda sujeta.",
      "driver": "Avance de la correa."
    },
    "motionType": "rotate",
    "steps": [
      "El rodillo apoya contra el tramo previsto.",
      "El mecanismo se coloca durante el ajuste.",
      "La fijación mantiene la posición de trabajo."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "17",
        "pn": "14510-PT0-004",
        "description": "Adjuster, Timing Belt (NIPPON SEIKO)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~adjuster~timing~belt~14510-pt0-004.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "spring-timing-adjuster",
    "system": "timing",
    "label": "Muelle del ajuste de distribución",
    "english": "Timing belt adjuster spring",
    "parentId": "timingTensioner",
    "kind": "spring",
    "quantity": "1",
    "location": "Entre el ajustador de distribución y su punto de anclaje.",
    "function": "Ayuda a posicionar el ajustador durante el procedimiento de tensado.",
    "connections": "Gancho en el ajustador y anclaje fijo del motor.",
    "motion": {
      "type": "fixed",
      "description": "Queda instalado con tensión. No se representa como un tensor automático que bombea en cada vuelta.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El muelle enlaza ajustador y anclaje.",
      "Su fuerza ayuda a colocar el rodillo.",
      "La fijación del ajustador conserva el ajuste realizado."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "18",
        "pn": "14516-P0A-000",
        "description": "Spring, Timing Belt Adjuster",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~timing~belt~adjuster~14516-p0a-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "seal-camshaft",
    "system": "timing",
    "label": "Retén del árbol de levas",
    "english": "Camshaft oil seal",
    "parentId": "camshaft",
    "kind": "seal",
    "quantity": "1 en el extremo de distribución",
    "location": "Alrededor de la salida del árbol de levas hacia su polea.",
    "function": "Retiene aceite dentro de la culata mientras el árbol gira.",
    "connections": "Diámetro exterior fijo en el alojamiento; labio interior sobre el árbol.",
    "motion": {
      "type": "fixed",
      "description": "El retén no gira; su labio trabaja contra el eje giratorio.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El alojamiento sujeta el exterior del retén.",
      "El árbol atraviesa su centro.",
      "El labio lubricado limita la salida de aceite."
    ],
    "oem": [
      {
        "diagram": "camshaft_timing_belt",
        "market": "KA",
        "callout": "30",
        "pn": "91213-PT0-003",
        "description": "Oil Seal (28X42X8) (ARAI)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~oil~seal~91213-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "duct-intake",
    "system": "intake",
    "label": "Conducto de admisión",
    "english": "Intake air duct",
    "parentId": "intakeDuct",
    "kind": "hose",
    "quantity": "1 conjunto visible",
    "location": "Entre la conexión hacia el filtro de aire y el cuerpo de mariposa.",
    "function": "Conduce aire filtrado y permite una unión flexible con el motor.",
    "connections": "Manguitos, abrazaderas, resonador y cuerpo de mariposa.",
    "motion": {
      "type": "fixed",
      "description": "El conducto permanece montado; admite flexión por el movimiento del motor, no un bombeo propio.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El aire llega desde el filtro externo.",
      "El conducto lo dirige hacia la mariposa.",
      "Las abrazaderas mantienen selladas las uniones."
    ],
    "oem": [
      {
        "diagram": "air_cleaner",
        "market": "KA",
        "callout": "6",
        "pn": "17225-PT2-010",
        "description": "Tube, Air Flow",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~tube~air~flow~17225-pt2-010.html"
      }
    ],
    "confidence": "illustrative",
    "note": "Forma observada en las fotos. No se encontró una referencia específica del conjunto en los 20 JSON locales.",
    "geometry": "illustrative"
  },
  {
    "id": "throttle-butterfly",
    "system": "intake",
    "label": "Mariposa de aceleración",
    "english": "Throttle butterfly",
    "parentId": "throttleBody",
    "kind": "throttle",
    "quantity": "1",
    "location": "Dentro del cuerpo de aceleración, a la entrada del colector.",
    "function": "Regula la sección de paso de aire según la posición del acelerador.",
    "connections": "Eje, mecanismo de cable, resorte de retorno y cuerpo de mariposa.",
    "motion": {
      "type": "rock",
      "description": "Gira una fracción de vuelta para abrir o cerrar el paso; no gira al régimen del motor.",
      "driver": "Cable del acelerador y resorte de retorno."
    },
    "motionType": "rock",
    "steps": [
      "Casi cerrada, restringe el paso principal.",
      "El cable gira el eje y abre la placa.",
      "El resorte tiende a devolverla al soltar el mando."
    ],
    "oem": [
      {
        "diagram": "throttle_body",
        "market": "KA",
        "callout": "6",
        "pn": "16400-PT6-A00",
        "description": "Body Assy., Throttle (GF72B)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~body~assy~16400-pt6-a00.html"
      }
    ],
    "confidence": "illustrative",
    "note": "Se muestra la placa dentro del conjunto; el OEM identifica el cuerpo completo, no la placa suelta.",
    "geometry": "illustrative"
  },
  {
    "id": "plenum-intake",
    "system": "intake",
    "label": "Cámara común de admisión",
    "english": "Intake plenum",
    "parentId": "plenum",
    "kind": "plenum",
    "quantity": "1",
    "location": "Después de la mariposa, sobre la entrada de los cuatro conductos.",
    "function": "Ofrece un volumen común desde el que se alimentan los cilindros.",
    "connections": "Cuerpo de mariposa, junta de unión, conductos individuales y tomas de control.",
    "motion": {
      "type": "fixed",
      "description": "La cámara queda fija; el aire circula y su presión cambia con el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El aire pasa la mariposa.",
      "Entra en el volumen común.",
      "Cada cilindro toma aire por su conducto cuando abre admisión."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "10",
        "pn": "17010-PT9-A01",
        "description": "Manifold B, Inlet",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~manifold~17010-pt9-a01.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "runner-intake",
    "system": "intake",
    "label": "Conducto individual de admisión",
    "english": "Individual intake runner",
    "parentId": "runners",
    "kind": "manifold",
    "quantity": "4 pares de pasos en el colector",
    "location": "Entre la cámara común y cada puerto de admisión de la culata.",
    "function": "Conduce aire desde el plenum hacia la culata; los pasos secundarios trabajan con las mariposas IAB del cuerpo intermedio.",
    "connections": "Plenum, cuerpo IAB con sus juntas, colector inferior y puertos de la culata.",
    "motion": {
      "type": "fixed",
      "description": "El conducto es fijo; la carga fluye de forma pulsante según las aperturas de válvula.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Recibe aire del volumen común.",
      "Lo conduce hacia el puerto de su cilindro.",
      "La apertura de las válvulas permite entrar la carga."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "11",
        "pn": "17100-PT9-A00",
        "description": "Manifold A, Inlet",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~manifold~17100-pt9-a00.html"
      }
    ],
    "confidence": "illustrative",
    "note": "Subdivisión didáctica: los cuatro conductos forman parte de una misma pieza de colector.",
    "geometry": "illustrative"
  },
  {
    "id": "injector-fuel",
    "system": "intake",
    "label": "Inyector de combustible",
    "english": "Fuel injector",
    "parentId": "injectors",
    "kind": "injector",
    "quantity": "4; uno por cilindro",
    "location": "Entre el riel de combustible y el puerto de admisión de cada cilindro.",
    "function": "Dosifica combustible pulverizado en el conducto; no inyecta directamente dentro del cilindro.",
    "connections": "Riel, sellos, conector eléctrico y puerto de admisión.",
    "motion": {
      "type": "switch",
      "description": "La carcasa queda fija; la válvula interna abre y cierra mediante pulsos eléctricos.",
      "driver": "ECU y bobina electromagnética del inyector."
    },
    "motionType": "switch",
    "steps": [
      "El riel mantiene combustible disponible.",
      "Un pulso abre la válvula interna.",
      "El combustible sale pulverizado y la válvula vuelve a cerrar."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "1",
        "pn": "06164-PT3-A00",
        "description": "Injector Set, Fuel",
        "fitNote": "Require Quantity: 4    Package Quantity: 1    Replaced By: 06164-P0A-000",
        "url": "https://www.hondapartsnow.com/genuine/honda~injector~set~fuel~06164-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Duración de pulso, caudal y recorrido interno no calibrados. La animación muestra el principio de inyección secuencial.",
    "geometry": "illustrative"
  },
  {
    "id": "seal-injector",
    "system": "intake",
    "label": "Sello del inyector",
    "english": "Injector seal ring",
    "parentId": "injectors",
    "kind": "seal",
    "quantity": "4 del tipo representado",
    "location": "En la unión del inyector con su alojamiento correspondiente.",
    "function": "Sella el contacto del inyector y evita fugas o entradas de aire en la unión.",
    "connections": "Cuerpo del inyector y superficie de alojamiento; distinto del anillo amortiguador.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El sello rodea la zona de unión.",
      "El montaje lo comprime dentro del alojamiento.",
      "La unión queda cerrada mientras pulsa el inyector."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "2",
        "pn": "16472-PH7-003",
        "description": "Seal Ring, Injector (OTSUKA)",
        "fitNote": "Require Quantity: 4    Package Quantity: 1    Replaced By: 16472-P0H-A01",
        "url": "https://www.hondapartsnow.com/genuine/honda~seal~ring~injector~16472-ph7-003.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo también contiene anillos amortiguadores y otras juntas. Esta ficha no los cuenta como el mismo sello.",
    "geometry": "illustrative"
  },
  {
    "id": "rail-fuel",
    "system": "intake",
    "label": "Riel de combustible",
    "english": "Fuel rail",
    "parentId": "fuelRail",
    "kind": "rail",
    "quantity": "1",
    "location": "A lo largo de los cuatro inyectores en el lado de admisión.",
    "function": "Distribuye combustible a los cuatro inyectores.",
    "connections": "Entrada de combustible, cuatro inyectores y sistema de regulación/retorno.",
    "motion": {
      "type": "fixed",
      "description": "Permanece sujeto; el combustible circula por dentro.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El combustible entra en el riel.",
      "El volumen común abastece los cuatro inyectores.",
      "El regulador participa en mantener la presión prevista."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "5",
        "pn": "16610-PT3-A00",
        "description": "Pipe, Fuel",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pipe~fuel~16610-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "regulator-fuel",
    "system": "intake",
    "label": "Regulador de presión de combustible",
    "english": "Fuel pressure regulator",
    "parentId": "fuelRail",
    "kind": "solenoid",
    "quantity": "1",
    "location": "En el circuito del riel y retorno de combustible.",
    "function": "Regula la presión del combustible con referencia a la presión de admisión mediante su mecanismo de diafragma.",
    "connections": "Riel, línea de retorno y conexión de referencia de presión.",
    "motion": {
      "type": "switch",
      "description": "El cuerpo queda fijo; el diafragma y la válvula interna modulan el retorno.",
      "driver": "Equilibrio entre presiones y fuerza del resorte; no es un motor eléctrico."
    },
    "motionType": "switch",
    "steps": [
      "La presión del combustible carga el diafragma.",
      "La referencia de admisión y el resorte se oponen.",
      "La válvula cambia el retorno para regular la diferencia de presión."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "8",
        "pn": "16740-PT6-A00",
        "description": "Regulator Assy., Pressure",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~regulator~assy~16740-pt6-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "La figura muestra el principio del regulador. Su tarado y el recorrido del diafragma no se simulan.",
    "geometry": "illustrative"
  },
  {
    "id": "valve-egr",
    "system": "intake",
    "label": "Válvula EGR",
    "english": "Exhaust gas recirculation valve",
    "parentId": "plenum",
    "kind": "solenoid",
    "quantity": "1 conjunto",
    "location": "En el conjunto de admisión, sobre los pasos de recirculación.",
    "function": "Permite introducir una cantidad controlada de gases de escape en la admisión bajo condiciones previstas.",
    "connections": "Pasos de gases, cámara EGR, junta y mando de la válvula.",
    "motion": {
      "type": "switch",
      "description": "La carcasa permanece fija; el elemento de cierre abre o limita el paso de gases.",
      "driver": "Sistema de control del motor; condiciones de carga y temperatura."
    },
    "motionType": "switch",
    "steps": [
      "El sistema decide cuándo admitir recirculación.",
      "La válvula permite el paso dosificado.",
      "Los gases se mezclan con la carga de admisión."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "18",
        "pn": "18011-PT6-A00",
        "description": "Valve Set, EGR (KEIHIN)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~set~egr~18011-pt6-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "No se representa como una apertura en cada ciclo. Estrategia de control y recorrido internos simplificados.",
    "geometry": "illustrative"
  },
  {
    "id": "valve-pcv",
    "system": "intake",
    "label": "Válvula de ventilación PCV",
    "english": "PCV valve",
    "parentId": "intakeDuct",
    "kind": "plunger",
    "quantity": "1",
    "location": "En la ruta de ventilación entre el interior del motor y la admisión.",
    "function": "Dosifica el paso de vapores del cárter hacia la admisión para volver a quemarlos.",
    "connections": "Respiración del cárter, grommet y manguera de vacío hacia la admisión.",
    "motion": {
      "type": "switch",
      "description": "El cuerpo queda fijo; el elemento interno responde a las diferencias de presión.",
      "driver": "Diferencia de presión y resorte interno."
    },
    "motionType": "switch",
    "steps": [
      "Los gases de fuga llegan al cárter.",
      "La PCV dosifica su salida hacia la admisión.",
      "Los vapores vuelven a entrar en la combustión."
    ],
    "oem": [
      {
        "diagram": "breather_tube",
        "market": "KA",
        "callout": "2",
        "pn": "17130-PK1-003",
        "description": "Valve Assy., PCV",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~assy~17130-pk1-003.html"
      }
    ],
    "confidence": "reference",
    "note": "El visor general la localiza en el sistema de respiración; su paso interno es una explicación simplificada.",
    "geometry": "illustrative"
  },
  {
    "id": "iab-body",
    "system": "intake",
    "label": "Cuerpo de las válvulas IAB",
    "english": "Intake air bypass valve body",
    "parentId": "iabBody",
    "kind": "iabBody",
    "quantity": "1 conjunto",
    "location": "Entre el plenum superior y el colector inferior.",
    "function": "Aloja los pasos secundarios y el conjunto de mariposas IAB.",
    "connections": "Plenum, dos juntas, colector inferior, eje y actuador.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "El aire llega desde el plenum.",
      "El cuerpo guía el flujo por sus pasos.",
      "Las mariposas permiten habilitar los pasos secundarios."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "14",
        "pn": "17120-PT2-000",
        "description": "Body Assy., Bypass Valve",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~body~assy~17120-pt2-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "iab-butterfly",
    "system": "intake",
    "label": "Mariposa secundaria IAB",
    "english": "Intake air bypass butterfly",
    "parentId": "iabButterflies",
    "kind": "iabButterfly",
    "quantity": "4; una por paso secundario",
    "location": "Dentro del cuerpo IAB.",
    "function": "Abre o cierra un paso secundario de admisión.",
    "connections": "Eje común, tornillos de placa y conducto secundario.",
    "motion": {
      "type": "switch",
      "description": "Cambia de posición al accionar el IAB; la demostración abre y cierra el mecanismo, no representa una apertura por cada ciclo de 720°.",
      "driver": "Vacío controlado por electroválvula y retorno del actuador."
    },
    "motionType": "switch",
    "steps": [
      "El actuador mueve el eje común.",
      "La placa gira dentro del paso secundario.",
      "Su posición cambia la sección disponible al aire."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "14",
        "pn": "17120-PT2-000",
        "description": "Body Assy., Bypass Valve",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~body~assy~17120-pt2-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Subcomponente del conjunto OEM#14, no una pieza vendida por separado. Ángulo y diámetro ilustrativos."
  },
  {
    "id": "iab-shaft",
    "system": "intake",
    "label": "Eje común IAB",
    "english": "Intake air bypass shaft",
    "parentId": "iabShaft",
    "kind": "iabShaft",
    "quantity": "1",
    "location": "Atraviesa el conjunto de mariposas secundarias.",
    "function": "Sincroniza las cuatro placas secundarias.",
    "connections": "Mariposas, apoyos del cuerpo y palanca de accionamiento.",
    "motion": {
      "type": "switch",
      "description": "Cambia de posición al accionar el IAB; la demostración abre y cierra el mecanismo, no representa una apertura por cada ciclo de 720°.",
      "driver": "Vacío controlado por electroválvula y retorno del actuador."
    },
    "motionType": "switch",
    "steps": [
      "La palanca recibe el movimiento del diafragma.",
      "El eje gira en sus apoyos.",
      "Las cuatro mariposas cambian de posición juntas."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "14",
        "pn": "17120-PT2-000",
        "description": "Body Assy., Bypass Valve",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~body~assy~17120-pt2-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Subcomponente del conjunto OEM#14; cotas y recorrido angular ilustrativos."
  },
  {
    "id": "iab-actuator",
    "system": "intake",
    "label": "Actuador de diafragma IAB",
    "english": "IAB diaphragm actuator",
    "parentId": "iabActuator",
    "kind": "iabActuator",
    "quantity": "1",
    "location": "Junto al cuerpo IAB, unido a su palanca.",
    "function": "Convierte una diferencia de presión en movimiento del eje IAB.",
    "connections": "Línea de vacío, diafragma, resorte de retorno y varilla.",
    "motion": {
      "type": "switch",
      "description": "Cambia de posición al accionar el IAB; la demostración abre y cierra el mecanismo, no representa una apertura por cada ciclo de 720°.",
      "driver": "Vacío controlado por electroválvula y retorno del actuador."
    },
    "motionType": "switch",
    "steps": [
      "El control cambia la presión en la cámara.",
      "El diafragma desplaza la varilla.",
      "La palanca transforma ese recorrido en giro del eje."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "17",
        "pn": "17129-PT2-000",
        "description": "Diaphragm Assy.",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~diaphragm~assy~17129-pt2-000.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "iab-solenoid",
    "system": "intake",
    "label": "Electroválvula de control IAB",
    "english": "IAB control solenoid",
    "parentId": "iabSolenoid",
    "kind": "solenoid",
    "quantity": "1",
    "location": "En el circuito de vacío del colector de admisión.",
    "function": "Conmuta el circuito neumático que manda el actuador IAB.",
    "connections": "Mando eléctrico, filtro, vacío y actuador.",
    "motion": {
      "type": "switch",
      "description": "Cambia de posición al accionar el IAB; la demostración abre y cierra el mecanismo, no representa una apertura por cada ciclo de 720°.",
      "driver": "Vacío controlado por electroválvula y retorno del actuador."
    },
    "motionType": "switch",
    "steps": [
      "La unidad de control acciona la electroválvula.",
      "Se modifica la conexión neumática.",
      "El actuador cambia el estado de los pasos secundarios."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "24",
        "pn": "36163-PT2-004",
        "description": "Valve Assy., Bypass Control Solenoid",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~assy~36163-pt2-004.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "La demostración muestra la función de conmutación, no su construcción interna exacta ni una calibración ECU verificada."
  },
  {
    "id": "iab-vacuum-chamber",
    "system": "intake",
    "label": "Depósito de vacío IAB",
    "english": "IAB vacuum tank",
    "parentId": "iabVacuumTank",
    "kind": "vacuumTank",
    "quantity": "1",
    "location": "Conectado al circuito neumático del IAB.",
    "function": "Proporciona una reserva de vacío al circuito de mando.",
    "connections": "Mangueras, válvula antirretorno y electroválvula.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "La línea establece vacío en el depósito.",
      "La válvula antirretorno permite conservarlo.",
      "El control utiliza esa reserva al accionar el mecanismo."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "25",
        "pn": "36361-PT2-014",
        "description": "Tank, Vacuum",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~tank~vacuum~36361-pt2-014.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "iab-check-valve",
    "system": "intake",
    "label": "Válvula antirretorno IAB",
    "english": "IAB vacuum check valve",
    "parentId": "iabVacuumTank",
    "kind": "plunger",
    "quantity": "1",
    "location": "En la manguera del circuito IAB.",
    "function": "Limita el flujo a un sentido para conservar el vacío del depósito.",
    "connections": "Mangueras y depósito de vacío.",
    "motion": {
      "type": "switch",
      "description": "Su cierre interno responde a la diferencia de presión, no a un ángulo fijo del cigüeñal.",
      "driver": "Diferencia de presión entre sus dos conexiones."
    },
    "motionType": "switch",
    "steps": [
      "Un sentido de presión permite el paso.",
      "Al invertirse la diferencia, el cierre se asienta.",
      "El depósito conserva la condición del circuito."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "23",
        "pn": "36145-PM4-004",
        "description": "Valve, Check",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~check~36145-pm4-004.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Mecanismo interno esquemático; recorrido y geometría no medidos."
  },
  {
    "id": "gasket-iab",
    "system": "intake",
    "label": "Junta del cuerpo IAB",
    "english": "IAB body gasket",
    "parentId": "iabBody",
    "kind": "iabGasket",
    "quantity": "2",
    "location": "Una sobre y otra debajo del cuerpo IAB.",
    "function": "Sella las uniones del conjunto de pasos de admisión.",
    "connections": "Plenum, cuerpo IAB y colector inferior.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento normal del motor.",
      "driver": "La mantienen sus apoyos y fijaciones."
    },
    "motionType": "fixed",
    "steps": [
      "Se alinea con los ocho pasos del cuerpo.",
      "El apriete comprime las dos juntas.",
      "El aire queda dentro de los conductos."
    ],
    "oem": [
      {
        "diagram": "intake_manifold",
        "market": "KA",
        "callout": "15",
        "pn": "17121-PT2-004",
        "description": "Gasket, Bypass Valve (NIPPON LEAKLESS)",
        "fitNote": "Require Quantity: 2    Package Quantity: 1",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~bypass~valve~17121-pt2-004.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Forma reconstruida a partir del diagrama; no se han verificado todas sus dimensiones."
  },
  {
    "id": "manifold-exhaust",
    "system": "exhaust",
    "label": "Colector de escape",
    "english": "Exhaust manifold",
    "parentId": "exhaustManifold",
    "kind": "manifold",
    "quantity": "1 conjunto",
    "location": "En el lado de escape de la culata, detrás de la pantalla térmica.",
    "function": "Recoge los gases de los cuatro cilindros y los conduce a la salida hacia el escape del vehículo.",
    "connections": "Puertos de culata, junta, fijaciones, soporte y conexión al tubo de escape.",
    "motion": {
      "type": "fixed",
      "description": "El colector queda sujeto; los gases circulan en pulsos y la pieza se dilata por temperatura.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La válvula libera gases al puerto de culata.",
      "El colector reúne los pulsos de los cilindros.",
      "La salida los conduce al sistema de escape externo."
    ],
    "oem": [
      {
        "diagram": "exhaust_manifold",
        "market": "KA",
        "callout": "2",
        "pn": "18100-PT6-A00",
        "description": "Manifold, Exhaust",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~manifold~18100-pt6-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "shield-exhaust",
    "system": "exhaust",
    "label": "Pantalla térmica del escape",
    "english": "Exhaust manifold heat shield",
    "parentId": "heatShield",
    "kind": "cover",
    "quantity": "1 cubierta principal visible",
    "location": "Por fuera del colector, visible en las fotografías del lado de escape.",
    "function": "Reduce la radiación térmica hacia componentes cercanos y evita contacto directo con el colector.",
    "connections": "Fijaciones al conjunto del escape con una separación respecto al colector.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Los gases calientan el colector interno.",
      "La pantalla queda separada de su superficie.",
      "La barrera reduce la exposición térmica exterior."
    ],
    "oem": [
      {
        "diagram": "exhaust_manifold",
        "market": "KA",
        "callout": "4",
        "pn": "18120-PT6-A00",
        "description": "Cover A, Exhaust Manifold",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cover~18120-pt6-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "gasket-exhaust",
    "system": "exhaust",
    "label": "Junta del colector de escape",
    "english": "Exhaust manifold gasket",
    "parentId": "exhaustManifold",
    "kind": "gasket",
    "quantity": "1 junta del colector",
    "location": "Entre los puertos de escape de la culata y la brida del colector.",
    "function": "Sella la unión para que los gases salgan por el colector.",
    "connections": "Superficies de culata y colector, espárragos y tuercas de fijación.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Sus aberturas coinciden con los puertos.",
      "La fijación comprime la junta.",
      "Los gases pasan al colector sin escapar por la unión."
    ],
    "oem": [
      {
        "diagram": "exhaust_manifold",
        "market": "KA",
        "callout": "3",
        "pn": "18115-PT0-003",
        "description": "Gasket, Exhaust Manifold (NIPPON LEAKLESS)",
        "fitNote": "Replaced By: 18115-PT0-004",
        "url": "https://www.hondapartsnow.com/genuine/honda~gasket~18115-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "housing-distributor",
    "system": "ignition",
    "label": "Carcasa del distribuidor",
    "english": "Distributor housing",
    "parentId": "distributor",
    "kind": "distributor",
    "quantity": "1",
    "location": "En el extremo de la culata opuesto a la distribución.",
    "function": "Aloja y posiciona el eje y los componentes del distribuidor de encendido.",
    "connections": "Extremo del árbol de levas, tapa, rotor, bobina y conexiones eléctricas.",
    "motion": {
      "type": "fixed",
      "description": "La carcasa permanece fija; el eje y el rotor giran dentro.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La culata sujeta el cuerpo del distribuidor.",
      "El árbol mueve el eje interior.",
      "La carcasa mantiene alineados sus componentes."
    ],
    "oem": [
      {
        "diagram": "distributor_tec",
        "market": "KA",
        "callout": "4",
        "pn": "06301-PT3-A20",
        "description": "Distributor Housing Kit",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~distributor~housing~kit~06301-pt3-a20.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia Hitachi del catálogo elegido. El proveedor del motor fotografiado requiere confirmación.",
    "geometry": "illustrative"
  },
  {
    "id": "cap-distributor",
    "system": "ignition",
    "label": "Tapa del distribuidor",
    "english": "Distributor cap",
    "parentId": "distributor",
    "kind": "distributor",
    "quantity": "1",
    "location": "Sobre el extremo exterior del distribuidor, donde se conectan los cables de bujía.",
    "function": "Aísla y sostiene los contactos a los que el rotor distribuye la alta tensión.",
    "connections": "Carcasa, contacto de alimentación, rotor y cuatro salidas hacia las bujías.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija mientras el rotor pasa cerca de sus contactos internos.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La alta tensión llega al contacto de alimentación.",
      "El rotor selecciona la salida correspondiente.",
      "La tapa conduce esa descarga al cable de la bujía."
    ],
    "oem": [
      {
        "diagram": "distributor_tec",
        "market": "KA",
        "callout": "2",
        "pn": "30102-PT3-A12",
        "description": "Cap Assy.",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cap~assy~30102-pt3-a12.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "rotor-distributor",
    "system": "ignition",
    "label": "Rotor del distribuidor",
    "english": "Distributor rotor",
    "parentId": "distributor",
    "kind": "plate",
    "quantity": "1",
    "location": "Dentro de la tapa, unido al eje del distribuidor.",
    "function": "Dirige la alta tensión sucesivamente hacia los contactos de salida de los cilindros.",
    "connections": "Eje del distribuidor, contacto de entrada y contactos de la tapa.",
    "motion": {
      "type": "rotate",
      "description": "Gira con el árbol de levas: una vuelta por cada dos del cigüeñal.",
      "driver": "Accionamiento desde el árbol de levas."
    },
    "motionType": "rotate",
    "steps": [
      "El rotor recibe alta tensión.",
      "Su extremo se aproxima al contacto del cilindro previsto.",
      "La descarga pasa al cable siguiendo el orden 1–3–4–2."
    ],
    "oem": [
      {
        "diagram": "distributor_tec",
        "market": "KA",
        "callout": "3",
        "pn": "30103-PT3-C02",
        "description": "Head, Rotor",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~head~rotor~30103-pt3-c02.html"
      }
    ],
    "confidence": "reference",
    "note": "El encendido real se adelanta o retrasa electrónicamente; no se supone chispa siempre exactamente en punto muerto superior.",
    "geometry": "illustrative"
  },
  {
    "id": "coil-ignition",
    "system": "ignition",
    "label": "Bobina de encendido",
    "english": "Ignition coil",
    "parentId": "ignitionCoil",
    "kind": "electrical",
    "quantity": "1",
    "location": "Fuera del distribuidor, sobre su soporte; un cable central lleva alta tensión a la tapa.",
    "function": "Almacena energía magnética y produce el pulso de alta tensión para la chispa.",
    "connections": "Alimentación eléctrica, conmutación del encendido y cable central hacia el distribuidor TEC.",
    "motion": {
      "type": "fixed",
      "description": "No tiene un movimiento mecánico de funcionamiento; cambian corriente y campo magnético.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La corriente primaria crea un campo magnético.",
      "El módulo interrumpe esa corriente.",
      "La variación del campo genera alta tensión en el secundario."
    ],
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "market": "KA",
        "callout": "3",
        "pn": "30520-PT9-A02",
        "description": "Coil, Ignition (TC-19A) (TEC)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~coil~ignition~30520-pt9-a02.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo F22A6 muestra bobina externa y cable de alta tensión central. La variante exacta requiere identificar el vehículo.",
    "geometry": "illustrative"
  },
  {
    "id": "lead-spark-plug",
    "system": "ignition",
    "label": "Cable de bujía",
    "english": "Spark plug lead",
    "parentId": "plugLeads",
    "kind": "lead",
    "quantity": "4; se muestra el del cilindro 1",
    "location": "Desde la tapa del distribuidor hasta el pozo de cada bujía.",
    "function": "Conduce el pulso de alta tensión con aislamiento para evitar descargas hacia el motor.",
    "connections": "Terminal de distribuidor, cable aislado, capuchón y terminal de bujía.",
    "motion": {
      "type": "fixed",
      "description": "Permanece sujeto; transmite pulsos eléctricos, no piezas que se desplazan por el cable.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La tapa entrega el pulso al terminal.",
      "El conductor lo lleva por el interior aislado.",
      "El capuchón conecta con la bujía."
    ],
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "market": "KA",
        "callout": "4",
        "pn": "32701-PT0-000",
        "description": "Wire, Resistance (NO.1) (SUMITOMO)",
        "fitNote": "Replaced By: 32701-P0B-A00",
        "url": "https://www.hondapartsnow.com/genuine/honda~wire~resistance~32701-pt0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Se muestra uno de los cuatro cables de bujía. Existe además un quinto cable central desde la bobina externa al distribuidor.",
    "geometry": "illustrative"
  },
  {
    "id": "spark-plug",
    "system": "ignition",
    "label": "Bujía",
    "english": "Spark plug",
    "parentId": "sparkPlugs",
    "kind": "sparkPlug",
    "quantity": "4; una por cilindro",
    "location": "Roscada en la culata con sus electrodos dentro de la cámara de combustión.",
    "function": "Crea una chispa que inicia la combustión de la mezcla comprimida.",
    "connections": "Cable de alta tensión, aislador cerámico, rosca de culata y electrodos.",
    "motion": {
      "type": "fixed",
      "description": "La bujía permanece fija; la descarga eléctrica salta entre electrodos.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La alta tensión llega al electrodo central.",
      "La descarga cruza el espacio entre electrodos.",
      "La chispa inicia un frente de combustión en la mezcla."
    ],
    "oem": [
      {
        "diagram": "high_tension_cord_spark_plug",
        "market": "KA",
        "callout": "17",
        "pn": "98079-5514G",
        "description": "Spark Plug (ZFR5F-11) (NGK)",
        "fitNote": "Require Quantity: 4    Package Quantity: 10",
        "url": "https://www.hondapartsnow.com/genuine/honda~spark~plug~98079-5514g.html"
      }
    ],
    "confidence": "reference",
    "note": "Ejemplo NGK ZFR5F-11 listado. Otras marcas y grados térmicos del catálogo son alternativas.",
    "geometry": "illustrative"
  },
  {
    "id": "pan-oil",
    "system": "oil",
    "label": "Cárter de aceite",
    "english": "Oil pan",
    "parentId": "oilPan",
    "kind": "pan",
    "quantity": "1",
    "location": "En la parte inferior del motor, bajo el cigüeñal.",
    "function": "Recoge y almacena el aceite de un sistema de cárter húmedo.",
    "connections": "Borde inferior del bloque, junta, tornillos, tapón de vaciado y pescante interior.",
    "motion": {
      "type": "fixed",
      "description": "El recipiente permanece fijo; el aceite retorna por gravedad y se agita con el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El aceite cae desde las zonas lubricadas.",
      "Se reúne en el fondo del cárter.",
      "El pescante lo toma para iniciar otra circulación."
    ],
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "market": "KA",
        "callout": "5",
        "pn": "11200-PT0-010",
        "description": "Pan, Oil",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pan~oil~11200-pt0-010.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "pump-oil",
    "system": "oil",
    "label": "Bomba de aceite",
    "english": "Oil pump",
    "parentId": "oilPump",
    "kind": "oilPump",
    "quantity": "1 conjunto",
    "location": "En el extremo de distribución, conectado al accionamiento del cigüeñal.",
    "function": "Mueve aceite desde el cárter hacia el filtro y las galerías de lubricación.",
    "connections": "Cigüeñal, pescante, salida de aceite y válvula de alivio.",
    "motion": {
      "type": "rotate",
      "description": "La carcasa queda fija; los rotores internos de tipo trocoidal giran y cambian el volumen de sus cámaras.",
      "driver": "Cigüeñal."
    },
    "motionType": "rotate",
    "steps": [
      "Las cámaras en expansión toman aceite del pescante.",
      "La rotación transporta el aceite dentro de la carcasa.",
      "Las cámaras que se reducen lo entregan a la salida."
    ],
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "market": "KA",
        "callout": "7",
        "pn": "15100-PT0-020",
        "description": "Pump Assy., Oil",
        "fitNote": "Replaced By: 15100-PT0-030",
        "url": "https://www.hondapartsnow.com/genuine/honda~pump~assy~15100-pt0-020.html"
      }
    ],
    "confidence": "reference",
    "note": "Principio trocoidal documentado; número de lóbulos, holguras y caudal no se consideran medidos.",
    "geometry": "illustrative"
  },
  {
    "id": "strainer-oil",
    "system": "oil",
    "label": "Pescante con colador de aceite",
    "english": "Oil pickup strainer",
    "parentId": "oilStrainer",
    "kind": "strainer",
    "quantity": "1",
    "location": "Dentro del cárter, cerca del fondo y conectado a la entrada de la bomba.",
    "function": "Toma aceite del depósito y retiene residuos grandes antes de la bomba.",
    "connections": "Malla, boca de aspiración, tubo y junta a la entrada de la bomba.",
    "motion": {
      "type": "fixed",
      "description": "El pescante está sujeto; el aceite se mueve por su interior.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La boca queda sumergida en el aceite disponible.",
      "La malla limita el paso de residuos grandes.",
      "La bomba aspira el aceite a través del tubo."
    ],
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "market": "KA",
        "callout": "14",
        "pn": "15220-P0A-C00",
        "description": "Strainer, Oil",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~strainer~oil~15220-p0a-c00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "valve-oil-relief",
    "system": "oil",
    "label": "Válvula de alivio de aceite",
    "english": "Oil pressure relief valve",
    "parentId": "oilPump",
    "kind": "plunger",
    "quantity": "1",
    "location": "En un alojamiento del circuito de la bomba de aceite.",
    "function": "Limita una presión excesiva al permitir un paso de descarga cuando vence el resorte.",
    "connections": "Galería de presión, alojamiento, resorte y tapón de cierre.",
    "motion": {
      "type": "switch",
      "description": "El émbolo se desplaza al variar el equilibrio entre presión de aceite y fuerza del resorte.",
      "driver": "Presión hidráulica y resorte de alivio."
    },
    "motionType": "switch",
    "steps": [
      "La presión empuja una cara de la válvula.",
      "Si supera la fuerza de cierre, se abre el paso de alivio.",
      "Al bajar la presión, el resorte vuelve a cerrarlo."
    ],
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "market": "KA",
        "callout": "16",
        "pn": "15231-PE0-000",
        "description": "Valve, Relief",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~valve~relief~15231-pe0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "No se muestra un umbral numérico de apertura: su tarado no se ha verificado en este atlas.",
    "geometry": "illustrative"
  },
  {
    "id": "spring-oil-relief",
    "system": "oil",
    "label": "Resorte de alivio de aceite",
    "english": "Oil relief valve spring",
    "parentId": "oilPump",
    "kind": "spring",
    "quantity": "1",
    "location": "Detrás del émbolo de alivio, dentro de su alojamiento.",
    "function": "Aporta la fuerza que mantiene cerrada la válvula de alivio hasta que la presión puede desplazarla.",
    "connections": "Émbolo y tapón o apoyo fijo del alojamiento.",
    "motion": {
      "type": "spring",
      "description": "Se comprime cuando la presión desplaza la válvula y se extiende al cerrarla.",
      "driver": "Fuerza hidráulica sobre el émbolo."
    },
    "motionType": "spring",
    "steps": [
      "El resorte precargado mantiene el cierre.",
      "La presión mueve el émbolo contra él.",
      "Al reducirse la fuerza, el resorte restituye la posición."
    ],
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "market": "KA",
        "callout": "17",
        "pn": "15232-PG6-000",
        "description": "Spring, Relief Valve",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~spring~relief~valve~15232-pg6-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "filter-oil",
    "system": "oil",
    "label": "Filtro de aceite",
    "english": "Oil filter",
    "parentId": "oilFilter",
    "kind": "filter",
    "quantity": "1",
    "location": "En el lado de admisión del bloque, por debajo del colector.",
    "function": "Retiene partículas finas antes de que el aceite alimente los circuitos de lubricación.",
    "connections": "Base roscada del motor, junta de sellado, entradas y salida de aceite.",
    "motion": {
      "type": "fixed",
      "description": "La carcasa y el medio filtrante permanecen fijos; el aceite circula a través de ellos.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El aceite llega a la base del filtro.",
      "Atraviesa el medio filtrante.",
      "Continúa hacia las galerías del motor."
    ],
    "oem": [
      {
        "diagram": "oil_pump_oil_strainer",
        "market": "KA",
        "callout": "20",
        "pn": "15400-PT7-005",
        "description": "Filter, Oil (ALLIED SIGNAL USA)",
        "fitNote": "Replaced By: 15400-PLM-A02",
        "url": "https://www.hondapartsnow.com/genuine/honda~filter~oil~15400-pt7-005.html"
      }
    ],
    "confidence": "reference",
    "note": "El plegado y las válvulas internas del filtro son ilustrativos; el catálogo incluye alternativas de proveedor.",
    "geometry": "illustrative"
  },
  {
    "id": "dipstick-oil",
    "system": "oil",
    "label": "Varilla de nivel de aceite",
    "english": "Oil dipstick",
    "parentId": "dipstick",
    "kind": "plate",
    "quantity": "1",
    "location": "En su tubo guía, desde la parte accesible del motor hasta el cárter.",
    "function": "Permite comprobar el nivel de aceite en las condiciones indicadas por el manual.",
    "connections": "Empuñadura, varilla graduada y tubo guía.",
    "motion": {
      "type": "fixed",
      "description": "Permanece insertada durante el funcionamiento; se extrae manualmente para la lectura.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "La punta alcanza el depósito de aceite.",
      "El aceite marca una altura en la varilla.",
      "Al extraerla se compara la marca con sus límites."
    ],
    "oem": [
      {
        "diagram": "cylinder_block_oil_pan",
        "market": "KA",
        "callout": "19",
        "pn": "15650-PT0-003",
        "description": "Dipstick, Oil",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~dipstick~oil~15650-pt0-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "pump-water",
    "system": "cooling",
    "label": "Bomba de refrigerante",
    "english": "Water pump",
    "parentId": "waterPump",
    "kind": "waterPump",
    "quantity": "1",
    "location": "En el extremo de distribución, comunicada con los conductos del bloque.",
    "function": "Hace circular el refrigerante para transportar calor desde el motor.",
    "connections": "Accionamiento por correa de distribución, carcasa, sello y circuito de refrigeración.",
    "motion": {
      "type": "rotate",
      "description": "La carcasa queda fija; el eje y el impulsor giran. Su relación exacta depende de las poleas.",
      "driver": "Correa de distribución."
    },
    "motionType": "rotate",
    "steps": [
      "El refrigerante llega a la entrada del impulsor.",
      "Las paletas le transfieren energía al girar.",
      "El flujo continúa por las camisas de agua del motor."
    ],
    "oem": [
      {
        "diagram": "water_pump",
        "market": "KA",
        "callout": "1",
        "pn": "19200-P0A-003",
        "description": "Water Pump (YAMADA)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~water~pump~19200-p0a-003.html"
      }
    ],
    "confidence": "reference",
    "note": "Paletas y relación de velocidad aproximadas; no se simula un caudal de fábrica.",
    "geometry": "illustrative"
  },
  {
    "id": "thermostat",
    "system": "cooling",
    "label": "Termostato",
    "english": "Thermostat",
    "parentId": "thermostat",
    "kind": "thermostat",
    "quantity": "1",
    "location": "Dentro de su alojamiento en el circuito de refrigeración del motor.",
    "function": "Regula el paso hacia el circuito del radiador según la temperatura del refrigerante.",
    "connections": "Cápsula térmica, válvula, resorte, sello y alojamiento.",
    "motion": {
      "type": "switch",
      "description": "La válvula se desplaza lentamente al calentarse la cápsula; no sigue las revoluciones del cigüeñal.",
      "driver": "Dilatación térmica del elemento de cera y resorte de retorno."
    },
    "motionType": "switch",
    "steps": [
      "En frío, limita el paso del circuito principal.",
      "Al calentarse, el elemento térmico desplaza la válvula.",
      "El paso aumenta y permite rechazar más calor en el radiador."
    ],
    "oem": [
      {
        "diagram": "water_pump",
        "market": "KA",
        "callout": "5",
        "pn": "19301-PAA-306",
        "description": "Thermostat Assy. (NIPPON THERMOSTAT)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~thermostat~assy~19301-paa-306.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia de servicio listada. Temperatura exacta de apertura y carrera no calibradas.",
    "geometry": "illustrative"
  },
  {
    "id": "outlet-coolant",
    "system": "cooling",
    "label": "Salida de refrigerante",
    "english": "Water outlet cover",
    "parentId": "coolantOutlet",
    "kind": "pipe",
    "quantity": "1",
    "location": "En la salida de refrigerante de la culata.",
    "function": "Conecta el paso interno del motor con la manguera del circuito externo.",
    "connections": "Superficie de unión a la culata, sello, cuello de manguera y abrazadera.",
    "motion": {
      "type": "fixed",
      "description": "Permanece fija durante el funcionamiento.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El refrigerante recoge calor dentro del motor.",
      "El conducto lo lleva hacia la conexión externa.",
      "La manguera continúa el circuito."
    ],
    "oem": [
      {
        "diagram": "water_pump",
        "market": "KA",
        "callout": "10",
        "pn": "19360-PT3-A00",
        "description": "Cover, Water Outlet",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~cover~water~outlet~19360-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "pipe-coolant",
    "system": "cooling",
    "label": "Tubo de conexión del refrigerante",
    "english": "Coolant connecting pipe",
    "parentId": "thermostat",
    "kind": "pipe",
    "quantity": "1",
    "location": "A lo largo del motor, enlazando los alojamientos del circuito de refrigeración.",
    "function": "Conduce refrigerante entre puntos del motor manteniendo una ruta compacta.",
    "connections": "Extremos con sellos, alojamientos del circuito y soportes.",
    "motion": {
      "type": "fixed",
      "description": "El tubo queda sujeto; el refrigerante se desplaza por su interior.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "Un extremo recibe el refrigerante.",
      "El tubo lo conduce entre alojamientos.",
      "Los sellos mantienen cerrado el circuito."
    ],
    "oem": [
      {
        "diagram": "water_pump",
        "market": "KA",
        "callout": "12",
        "pn": "19505-PT3-A00",
        "description": "Pipe, Connecting",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pipe~connecting~19505-pt3-a00.html"
      }
    ],
    "confidence": "reference",
    "note": "Identidad documentada en el catálogo de referencia; geometría individual aproximada.",
    "geometry": "illustrative"
  },
  {
    "id": "sensor-coolant",
    "system": "cooling",
    "label": "Sensor de temperatura del refrigerante",
    "english": "Coolant temperature sensor",
    "parentId": "thermostat",
    "kind": "sensor",
    "quantity": "1 sensor de control representado",
    "location": "Roscado en un paso de refrigerante del conjunto del motor.",
    "function": "Informa al control del motor de la temperatura del refrigerante.",
    "connections": "Rosca con sellado, punta expuesta al refrigerante y conector eléctrico.",
    "motion": {
      "type": "fixed",
      "description": "No tiene movimiento mecánico de lectura; cambia su señal eléctrica con la temperatura.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El refrigerante calienta la punta del sensor.",
      "Su elemento cambia la respuesta eléctrica.",
      "La ECU interpreta esa señal como temperatura."
    ],
    "oem": [
      {
        "diagram": "engine_sub_cord_clamp",
        "market": "KA",
        "callout": "24",
        "pn": "37870-PK2-015",
        "description": "Sensor Assy., Water Temperature (HADSYS)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~sensor~assy~37870-pk2-015.html"
      }
    ],
    "confidence": "reference",
    "note": "El catálogo contiene además una unidad para indicación e interruptores térmicos; no son el mismo dispositivo.",
    "geometry": "illustrative"
  },
  {
    "id": "alternator",
    "system": "accessory",
    "label": "Alternador",
    "english": "Alternator assembly",
    "parentId": "alternator",
    "kind": "alternator",
    "quantity": "1",
    "location": "En el lado de accesorios, por debajo de la bomba de dirección en las fotos.",
    "function": "Convierte potencia mecánica en energía eléctrica para alimentar el vehículo y cargar la batería.",
    "connections": "Correa exterior, polea, soportes y cableado eléctrico.",
    "motion": {
      "type": "rotate",
      "description": "La carcasa permanece fija; polea y rotor giran dentro. La relación exacta con el cigüeñal no está medida.",
      "driver": "Correa exterior impulsada por la polea del cigüeñal."
    },
    "motionType": "rotate",
    "steps": [
      "La correa hace girar el rotor.",
      "El campo giratorio induce tensión en el estator.",
      "Rectificador y regulador acondicionan la salida eléctrica."
    ],
    "oem": [
      {
        "diagram": "alternator_denso",
        "market": "KA",
        "callout": "1",
        "pn": "31100-PT3-A52",
        "description": "Alternator Assy. (CJP16) (DENSO)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~alternator~assy~31100-pt3-a52.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia Denso. La figura individual no implica que los componentes internos tengan todos dimensiones medidas.",
    "geometry": "illustrative"
  },
  {
    "id": "rotor-alternator",
    "system": "accessory",
    "label": "Rotor del alternador",
    "english": "Alternator rotor",
    "parentId": "alternator",
    "kind": "electrical",
    "quantity": "1",
    "location": "En el centro del alternador, entre sus rodamientos y dentro del estator.",
    "function": "Produce un campo magnético giratorio que permite generar electricidad en el estator.",
    "connections": "Eje con polea, bobinado de campo, anillos rozantes y rodamientos.",
    "motion": {
      "type": "rotate",
      "description": "Gira solidario con el eje y la polea del alternador.",
      "driver": "Correa de accesorios; la excitación eléctrica regula su campo."
    },
    "motionType": "rotate",
    "steps": [
      "Las escobillas alimentan el bobinado de campo.",
      "La correa hace girar el rotor magnetizado.",
      "El campo variable induce tensión en el estator fijo."
    ],
    "oem": [
      {
        "diagram": "alternator_denso",
        "market": "KA",
        "callout": "2",
        "pn": "31101-PV1-A01",
        "description": "Rotor Assy.  (N/A FOR USA: SEE ASSEMBLY)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~rotor~assy~31101-pv1-a01.html"
      }
    ],
    "confidence": "reference",
    "note": "Referencia de componente mostrada por el catálogo, con nota de disponibilidad por mercado.",
    "geometry": "illustrative"
  },
  {
    "id": "rectifier-alternator",
    "system": "accessory",
    "label": "Rectificador del alternador",
    "english": "Alternator rectifier",
    "parentId": "alternator",
    "kind": "electrical",
    "quantity": "1 conjunto",
    "location": "En la zona posterior del alternador, conectado al estator.",
    "function": "Convierte la corriente alterna generada en una salida de corriente continua para el vehículo.",
    "connections": "Bobinados del estator, diodos, disipador y terminal de salida.",
    "motion": {
      "type": "fixed",
      "description": "No gira; sus diodos conducen eléctricamente según la polaridad de la tensión.",
      "driver": "No tiene accionamiento propio."
    },
    "motionType": "fixed",
    "steps": [
      "El estator entrega tensión alterna.",
      "Los diodos seleccionan los sentidos de conducción.",
      "La salida alimenta el circuito de corriente continua."
    ],
    "oem": [
      {
        "diagram": "alternator_denso",
        "market": "KA",
        "callout": "14",
        "pn": "31127-PT0-013",
        "description": "Rectifier Assy.",
        "fitNote": "Replaced By: 31127-PT2-003",
        "url": "https://www.hondapartsnow.com/genuine/honda~rectifier~assy~31127-pt0-013.html"
      }
    ],
    "confidence": "reference",
    "note": "Se representa el conjunto como pieza física; la forma de onda no es una medición de este alternador.",
    "geometry": "illustrative"
  },
  {
    "id": "pump-power-steering",
    "system": "accessory",
    "label": "Bomba de dirección asistida",
    "english": "Power steering pump",
    "parentId": "psPump",
    "kind": "psPump",
    "quantity": "1",
    "location": "Parte alta del extremo de accesorios, sobre el alternador en las fotos.",
    "function": "Proporciona caudal hidráulico al circuito de dirección asistida.",
    "connections": "Polea, soporte, entrada desde depósito y salida hacia el circuito de dirección.",
    "motion": {
      "type": "rotate",
      "description": "La carcasa está fija; el eje y el elemento de bombeo giran por la polea exterior.",
      "driver": "Correa de dirección asistida."
    },
    "motionType": "rotate",
    "steps": [
      "La correa transmite giro a la bomba.",
      "El mecanismo interno toma y desplaza fluido.",
      "El circuito usa ese caudal para asistir el giro de las ruedas."
    ],
    "oem": [
      {
        "diagram": "p_s_pump",
        "market": "KA",
        "callout": "2",
        "pn": "56110-PT0-050",
        "description": "Pump Sub-Assy., Power Steering",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pump~sub~assy~56110-pt0-050.html"
      }
    ],
    "confidence": "reference",
    "note": "La arquitectura interna se simplifica. La presión depende de la carga y del control hidráulico, no solo del régimen.",
    "geometry": "illustrative"
  },
  {
    "id": "pulley-power-steering",
    "system": "accessory",
    "label": "Polea de dirección asistida",
    "english": "Power steering pump pulley",
    "parentId": "psPump",
    "kind": "pulley",
    "quantity": "1",
    "location": "Sobre el eje de la bomba de dirección, fuera de las cubiertas de distribución.",
    "function": "Recibe la tracción de la correa exterior para accionar la bomba.",
    "connections": "Eje de bomba, tuerca de fijación y correa de dirección.",
    "motion": {
      "type": "rotate",
      "description": "Gira con el eje de la bomba; no es la polea del árbol de levas.",
      "driver": "Correa de dirección."
    },
    "motionType": "rotate",
    "steps": [
      "La correa aplica tracción a su contorno.",
      "El centro transmite par al eje de la bomba.",
      "Las aberturas aligeran la pieza sin cambiar su función."
    ],
    "oem": [
      {
        "diagram": "p_s_pump",
        "market": "KA",
        "callout": "8",
        "pn": "56483-PV0-000",
        "description": "Pulley, Power Steering Pump",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~pulley~power~steering~56483-pv0-000.html"
      }
    ],
    "confidence": "reference",
    "note": "Es la polea superior expuesta que aparece en las fotos del extremo de distribución.",
    "geometry": "illustrative"
  },
  {
    "id": "belt-power-steering",
    "system": "accessory",
    "label": "Correa de dirección asistida",
    "english": "Power steering belt",
    "parentId": "accessoryBelts",
    "kind": "belt",
    "quantity": "1 correa de dirección",
    "location": "Por fuera de las cubiertas de distribución, entre la polea del cigüeñal y la bomba.",
    "function": "Transmite potencia del cigüeñal a la dirección asistida.",
    "connections": "Gargantas de las poleas y ajuste de posición de la bomba.",
    "motion": {
      "type": "flow",
      "description": "Se desplaza continuamente alrededor de las poleas; no fija el tiempo de apertura de las válvulas.",
      "driver": "Polea exterior del cigüeñal."
    },
    "motionType": "flow",
    "steps": [
      "El cigüeñal arrastra la correa por fricción.",
      "La correa gira la polea de la bomba.",
      "El ajuste de montaje conserva la tensión necesaria."
    ],
    "oem": [
      {
        "diagram": "p_s_pump",
        "market": "KA",
        "callout": "10",
        "pn": "56992-PT0-J03",
        "description": "Belt, Power Steering Pump (4PK1068)",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~belt~power~steering~pump~4pk1068~56992-pt0-j03.html"
      }
    ],
    "confidence": "reference",
    "note": "No se confunde con la correa de distribución ni con la del alternador. Relación de velocidades sin verificar.",
    "geometry": "illustrative"
  },
  {
    "id": "flywheel",
    "system": "manual",
    "label": "Volante motor",
    "english": "Flywheel",
    "parentId": "flywheel",
    "kind": "flywheel",
    "quantity": "1",
    "location": "En el extremo de transmisión del cigüeñal, dentro de la campana.",
    "function": "Transmite o permite acoplar el par del motor a la transmisión manual de cinco marchas.",
    "connections": "Brida de cigüeñal, volante, disco y conjunto de presión.",
    "motion": {
      "type": "rotate",
      "description": "Gira solidario con el cigüeñal; se muestra el embrague acoplado, sin simular deslizamiento.",
      "driver": "Cigüeñal y conjunto de embrague en estado acoplado."
    },
    "motionType": "rotate",
    "steps": [
      "El cigüeñal hace girar el volante.",
      "El plato aprieta el disco contra el volante.",
      "El disco transmite el par al eje de entrada de la transmisión."
    ],
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "market": "KA",
        "callout": "3",
        "pn": "22100-PT7-013",
        "description": "Flywheel",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~flywheel~22100-pt7-013.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Adjunto del motor con transmisión 5MT. Geometría reconstruida; no se simulan deslizamiento, desgaste ni actuación del pedal."
  },
  {
    "id": "clutch-disc",
    "system": "manual",
    "label": "Disco de embrague",
    "english": "Clutch friction disc",
    "parentId": "clutchDisc",
    "kind": "clutchDisc",
    "quantity": "1",
    "location": "En el extremo de transmisión del cigüeñal, dentro de la campana.",
    "function": "Transmite o permite acoplar el par del motor a la transmisión manual de cinco marchas.",
    "connections": "Brida de cigüeñal, volante, disco y conjunto de presión.",
    "motion": {
      "type": "rotate",
      "description": "Gira con el volante cuando el embrague está acoplado. Al desacoplarlo puede girar a una velocidad distinta; aquí se muestra el estado acoplado.",
      "driver": "Cigüeñal y conjunto de embrague en estado acoplado."
    },
    "motionType": "rotate",
    "steps": [
      "El cigüeñal hace girar el volante.",
      "El plato aprieta el disco contra el volante.",
      "El disco transmite el par al eje de entrada de la transmisión."
    ],
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "market": "KA",
        "callout": "4",
        "pn": "22200-PT1-020",
        "description": "Disk, Friction",
        "fitNote": "Fit Note: Mfg.Origin: JPN    Replaced By: 22200-PT7-013",
        "url": "https://www.hondapartsnow.com/genuine/honda~disk~friction~22200-pt1-020.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Adjunto del motor con transmisión 5MT. Geometría reconstruida; no se simulan deslizamiento, desgaste ni actuación del pedal."
  },
  {
    "id": "clutch-pressure-plate",
    "system": "manual",
    "label": "Plato de presión del embrague",
    "english": "Clutch pressure assembly",
    "parentId": "clutchPressurePlate",
    "kind": "clutchPressurePlate",
    "quantity": "1",
    "location": "En el extremo de transmisión del cigüeñal, dentro de la campana.",
    "function": "Transmite o permite acoplar el par del motor a la transmisión manual de cinco marchas.",
    "connections": "Brida de cigüeñal, volante, disco y conjunto de presión.",
    "motion": {
      "type": "rotate",
      "description": "Gira solidario con el cigüeñal; se muestra el embrague acoplado, sin simular deslizamiento.",
      "driver": "Cigüeñal y conjunto de embrague en estado acoplado."
    },
    "motionType": "rotate",
    "steps": [
      "El cigüeñal hace girar el volante.",
      "El plato aprieta el disco contra el volante.",
      "El disco transmite el par al eje de entrada de la transmisión."
    ],
    "oem": [
      {
        "diagram": "clutch_torque_converter",
        "market": "KA",
        "callout": "5",
        "pn": "22300-PT7-023",
        "description": "Disk, Pressure",
        "fitNote": "",
        "url": "https://www.hondapartsnow.com/genuine/honda~disk~pressure~22300-pt7-023.html"
      }
    ],
    "confidence": "reference",
    "geometry": "illustrative",
    "note": "Adjunto del motor con transmisión 5MT. Geometría reconstruida; no se simulan deslizamiento, desgaste ni actuación del pedal."
  }
];
for(const item of CATALOG){item.engineCode=ENGINE.code;item.market=ENGINE.market;item.parentSystem=PART[item.parentId]?.system;}
export const CATALOG_BY_ID=Object.fromEntries(CATALOG.map(item=>[item.id,item]));
