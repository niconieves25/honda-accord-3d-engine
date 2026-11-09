import {CATALOG, CATALOG_SYSTEMS, CATALOG_NOTES, REMOVED_COMPONENTS} from './catalog.js';
import {CATALOG_EN} from './catalog-en.js';

const SYSTEM_LABELS_EN = {
  exterior: 'Covers and exterior seals',
  bottom: 'Block, pistons and crankshaft',
  balance: 'Balance shafts',
  head: 'Cylinder head and valves',
  timing: 'Timing drive',
  intake: 'Intake, IAB and fuel',
  exhaust: 'Exhaust',
  ignition: 'Ignition',
  oil: 'Lubrication',
  cooling: 'Cooling',
  accessory: 'Accessories',
  manual: 'Flywheel and 5MT clutch',
};

const NOTES_EN = {
  identity: 'Target: factory-standard F22A6, 1993 Honda Accord EX sedan, 5-speed manual transmission. Emissions market is unconfirmed; KA/KL are consulted catalogues, not vehicle identification.',
  counts: 'Each entry represents one part type, not all repeated instances. OEM alternatives and superseded references are not installed simultaneously.',
  geometry: 'Identity and layout are verified where a source is cited. Undocumented profiles, thicknesses, lengths and small movements are illustrative reconstructions, not manufacturing dimensions.',
  videos: 'Stationary parts only change viewpoint during inspection. IAB, thermostat, PCV and other control devices have state demonstrations: they do not operate once per crankshaft cycle.',
  oem: 'Each number and callout comes from the indicated 1993 EX 5MT catalogue. Manufacturer, JPN/USA origin and KA/KL market can change references; the actual vehicle requires identification.',
};

const VTEC_REMOVAL = 'This part belonged to the previous SOHC VTEC model. The factory F22A6 has fixed valve actuation and does not use this mechanism.';
const REMOVED_EN = {
  'rocker-primary': {label: 'Primary intake rocker arm', reason: VTEC_REMOVAL},
  'rocker-middle': {label: 'Centre VTEC rocker arm', reason: VTEC_REMOVAL},
  'rocker-secondary': {label: 'Secondary intake rocker arm', reason: VTEC_REMOVAL},
  'pin-vtec-sync': {label: 'VTEC synchronising pin', reason: VTEC_REMOVAL},
  'lost-motion': {label: 'Lost-motion mechanism', reason: VTEC_REMOVAL},
  'plate-vtec-timing': {label: 'VTEC timing plate', reason: VTEC_REMOVAL},
  'solenoid-vtec': {label: 'VTEC control solenoid valve', reason: VTEC_REMOVAL},
  'filter-vtec': {label: 'VTEC valve filter', reason: VTEC_REMOVAL},
  'shaft-inlet-rockers': {
    label: 'Previous continuous intake rocker shaft',
    reason: 'The F22A6 uses five supporting segments: two type A and three type B. See the entries for each type.',
  },
  'bolt-valve-cover': {
    label: 'Previous model valve cover fastener',
    reason: 'The F22A6 cover is secured by four cap nuts on its studs. See the Head cover cap nut entry.',
  },
};

// The original Spanish objects remain the canonical technical and export data.
// Language overlays only replace human-facing prose; IDs, quantities, geometry
// references, OEM metadata and mechanical type tokens keep their meaning.
const ENGLISH_CATALOG = CATALOG.map(item => {
  const translated = CATALOG_EN[item.id];
  if (!translated) throw new Error(`Missing English catalogue entry: ${item.id}`);
  const labels = {
    'rocker-inlet-a': 'Intake rocker arm A',
    'rocker-inlet-b': 'Intake rocker arm B',
    'rocker-exhaust': 'Exhaust rocker arm',
    'shaft-inlet-rockers-a': 'Short intake rocker shaft (A)',
    'shaft-inlet-rockers-b': 'Long intake rocker shaft (B)',
    'shaft-exhaust-rockers': 'Exhaust rocker shaft',
    'spring-rocker-a': 'Rocker arm spring A',
    'spring-rocker-b': 'Rocker arm spring B',
    'washer-rocker-wave': 'Rocker arm wave washer',
  };
  return {...item, ...translated, label: labels[item.id] || item.english,
    motion: {...item.motion, ...translated.motion}};
});
const ENGLISH_SYSTEMS = CATALOG_SYSTEMS.map(system => ({...system, label: SYSTEM_LABELS_EN[system.id]}));

export const getCatalog = lang => lang === 'en' ? ENGLISH_CATALOG : CATALOG;
export const getCatalogSystems = lang => lang === 'en' ? ENGLISH_SYSTEMS : CATALOG_SYSTEMS;
export const getRemovedComponents = lang => lang === 'en' ? REMOVED_EN : REMOVED_COMPONENTS;
export const getCatalogNotes = lang => lang === 'en' ? NOTES_EN : CATALOG_NOTES;
