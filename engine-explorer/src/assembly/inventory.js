import {buildEngine} from '../engine.js';
import {CATALOG} from '../anatomy/catalog.js';

const entries=new Map(CATALOG.map(entry=>[entry.id,entry]));
const DEFAULT_TYPES={
  valveCover:'cover-valves',oilCap:'cap-oil-filler',timingCoverUpper:'cover-timing-upper',timingCoverLower:'cover-timing-lower',engineMount:'engine-mount',
  block:'block-cylinders',bearingBridge:'bridge-main-bearing',crankshaft:'crankshaft',crankFlange:'crankshaft',pistons:'piston',rings:'ring-oil',wristPins:'piston-pin',rods:'connecting-rod',
  balancerFront:'shaft-balance-front',balancerRear:'shaft-balance-rear',balancerBelt:'belt-balance',balancerAdjuster:'tensioner-balance',
  head:'cylinder-head',headGasket:'gasket-cylinder-head',camshaft:'camshaft',rockerShafts:'rocker-shaft-support',intakeRockers:'rocker-inlet-a',exhaustRockers:'rocker-exhaust',
  intakeValves:'valve-inlet',exhaustValves:'valve-exhaust',sparkPlugs:'spark-plug',
  timingBelt:'belt-timing',camPulley:'pulley-camshaft',crankTimingPulley:'pulley-crank-timing',timingTensioner:'tensioner-timing',waterPump:'pump-water',crankPulley:'pulley-crank-accessory',
  alternator:'alternator',psPump:'pump-power-steering',accessoryBelts:'belt-alternator',psHose:'hose-power-steering',dipstick:'dipstick-oil',
  plenum:'plenum-intake',runners:'intake-support',throttleBody:'throttle-body',intakeDuct:'duct-intake',fuelRail:'rail-fuel',injectors:'injector-fuel',
  exhaustManifold:'manifold-exhaust',heatShield:'shield-exhaust',coolantOutlet:'outlet-coolant',distributor:'housing-distributor',plugLeads:'lead-support',ignitionCoil:'coil-ignition',
  oilPan:'pan-oil',oilPump:'pump-oil',oilStrainer:'strainer-oil',oilFilter:'filter-oil',thermostat:'thermostat-housing',
  iabBody:'iab-body',iabButterflies:'iab-butterfly',iabShaft:'iab-shaft',iabActuator:'iab-actuator',iabSolenoid:'iab-solenoid',iabVacuumTank:'iab-vacuum-chamber',
  flywheel:'flywheel',clutchDisc:'clutch-disc',clutchPressurePlate:'clutch-pressure-plate',
};
const EXTRA_LABELS={
  'engine-mount':['Soporte del motor','Engine mounting bracket'],
  'main-bearing-cap':['Tapa de bancada','Main bearing cap'],
  'camshaft-holder':['Soporte del árbol de levas','Camshaft holder'],
  'guide-valve-exhaust':['Guía de válvula de escape','Exhaust valve guide'],
  'seal-valve-stem-exhaust':['Retén de vástago de escape','Exhaust valve stem seal'],
  'seat-valve-spring':['Asiento del resorte de válvula','Valve spring seat'],
  'nut-valve-lash':['Contratuerca de reglaje','Valve adjustment locknut'],
  'rocker-shaft-support':['Detalle de apoyo de balancines','Rocker shaft supporting detail'],
  'pulley-balance-crank':['Polea del cigüeñal para equilibrado','Crankshaft balance-drive pulley'],
  'pulley-balance-front':['Polea del eje equilibrador delantero','Front balance shaft pulley'],
  'pulley-balance-input':['Polea de entrada del equilibrado trasero','Rear balance drive input pulley'],
  'gear-balance-input':['Engranaje de entrada del equilibrado','Balance drive input gear'],
  'gear-balance-rear':['Engranaje inversor del eje trasero','Rear balance shaft reversing gear'],
  'pulley-crank-accessory':['Polea de accesorios del cigüeñal','Crankshaft accessory pulley'],
  'belt-alternator':['Correa del alternador','Alternator belt'],
  'hose-power-steering':['Manguera de dirección asistida','Power steering hose'],
  'throttle-body':['Cuerpo de aceleración','Throttle body'],
  'thermostat-housing':['Alojamiento del termostato','Thermostat housing'],
  'intake-support':['Soporte del colector de admisión','Intake manifold support'],
  'runner-exhaust':['Ramal del colector de escape','Exhaust manifold branch'],
  'lead-ignition-center':['Cable central de encendido','Ignition coil centre lead'],
  'lead-support':['Soporte de cables de bujía','Spark lead supporting clip'],
  'wiring-loom':['Mazo y conductos auxiliares','Wiring loom and auxiliary conduits'],
};
export const ASSEMBLY_EXTRA_TYPES=Object.freeze(Object.fromEntries(Object.entries(EXTRA_LABELS).map(([id,[es,en]])=>[id,{label:{es,en},evidence:'illustrative'}])));

const PISTON_TYPES=new Set(['piston','piston-pin','connecting-rod','connecting-rod-cap','bearing-rod','bolt-connecting-rod','ring-top','ring-second','ring-oil']);
const HEAD_TYPES=new Set(['cylinder-head','camshaft-holder','guide-valve','guide-valve-exhaust','valve-inlet','valve-exhaust','seal-valve-stem','seal-valve-stem-exhaust','seat-valve-spring','spring-valve-inlet','spring-valve-exhaust','retainer-valve','keepers-valve','camshaft','shaft-exhaust-rockers','shaft-inlet-rockers-a','shaft-inlet-rockers-b','rocker-inlet-a','rocker-inlet-b','rocker-exhaust','spring-rocker-a','spring-rocker-b','washer-rocker-wave','screw-valve-lash','nut-valve-lash','rocker-shaft-support','seal-camshaft']);
const HEAD_VALVES=new Set(['cylinder-head','guide-valve','guide-valve-exhaust','valve-inlet','valve-exhaust','seal-valve-stem','seal-valve-stem-exhaust','seat-valve-spring','spring-valve-inlet','spring-valve-exhaust','retainer-valve','keepers-valve']);
const CLOSURES=new Set(['cover-valves','gasket-valve-cover','seal-plug-tube','cap-oil-filler','gasket-oil-cap','cover-timing-upper','cover-timing-lower','nut-valve-cover','washer-valve-cover','pan-oil','shield-exhaust']);
const TIMING=new Set(['belt-timing','pulley-camshaft','pulley-crank-timing','tensioner-timing','spring-timing-adjuster','seal-camshaft','pump-water','belt-balance','tensioner-balance','pulley-balance-crank','pulley-balance-front','pulley-balance-input','gear-balance-input','gear-balance-rear']);
const LUBRICATION=new Set(['shaft-balance-front','shaft-balance-rear','pump-oil','valve-oil-relief','spring-oil-relief','strainer-oil']);
function chapterFor(id,parentId){
  if(PISTON_TYPES.has(id))return'pistons';
  if(id==='gasket-cylinder-head')return'head-join';
  if(CLOSURES.has(id))return'closures';
  if(TIMING.has(id))return'timing';
  if(HEAD_VALVES.has(id))return'head';
  if(HEAD_TYPES.has(id))return'valvetrain';
  if(LUBRICATION.has(id))return'lubrication';
  if(['block-cylinders','bearing-main','washer-thrust','crankshaft','bridge-main-bearing','main-bearing-cap'].includes(id))return'bottom';
  if(['plenum','runners','throttleBody','intakeDuct','fuelRail','injectors','iabBody','iabButterflies','iabShaft','iabActuator','iabSolenoid','iabVacuumTank'].includes(parentId))return'intake';
  return'attachments';
}
function pistonKit(id,raw){
  if(!PISTON_TYPES.has(id))return null;
  const value=Number(raw);
  const index=['bearing-rod','bolt-connecting-rod'].includes(id)?Math.floor(value/2):value;
  return Number.isInteger(index)&&index>=0&&index<4?`piston-${index+1}`:null;
}
const originalNote={es:'Forma reconstruida en el modelo común. El recorrido de ensamblaje es didáctico y no sustituye un procedimiento de taller.',en:'Reconstructed shape from the shared model. Assembly travel is educational and does not replace a workshop procedure.'};
const extraNote={es:'Detalle físico del conjunto común; dimensiones y montaje ilustrativos. No se afirma una referencia OEM independiente.',en:'Physical detail of the shared assembly; dimensions and mounting are illustrative. No independent OEM reference is asserted.'};
const exhaustNote={es:'Hay ocho guías y ocho retenes de escape representados. Su referencia OEM específica no está confirmada; no se reutiliza la referencia de admisión.',en:'Eight exhaust guides and eight exhaust stem seals are represented. Their specific OEM references are unconfirmed; inlet references are not reused.'};

/** Immutable ownership snapshot of every installed physical source mesh.
 * Caller-supplied engines must preserve source boundaries (consolidate:false).
 * Rest matrices are world-space millimetres; renderers perform metre conversion.
 */
export function buildAssemblyInventory({engine}={}){
  engine??=buildEngine({consolidate:false,detailedRegistry:true});
  if(!engine.detailedRegistry)throw new Error('Assembly requires detailedRegistry:true and consolidate:false.');
  engine.root.scale.setScalar(1);engine.update(0,{dt:0,iab:0,charge:false});engine.root.updateMatrixWorld(true);
  const refs=engine.detailedRegistry;
  const physical=[];engine.root.traverse(mesh=>{if(mesh.isMesh&&!mesh.userData.fx)physical.push(mesh);});
  const sourceSet=new Set(physical),assigned=new Set(),bins=new Map();
  // Spark plugs predate the occurrence tags. Their existing parent groups are
  // the source of truth, not duplicated or newly generated spark-plug shapes.
  const sparkIndex=new Map();let nextSpark=0;
  engine.G.sparkPlugs.children.filter(child=>child.isGroup).forEach(group=>{const index=nextSpark++;group.traverse(mesh=>{if(mesh.isMesh&&!mesh.userData.fx)sparkIndex.set(mesh,index);});});
  const groupOf=mesh=>{let node=mesh;while(node&&node!==engine.root){if(node.userData.part&&engine.G[node.userData.part]===node)return node.userData.part;node=node.parent;}return mesh.userData.part||'wiring';};
  for(const mesh of physical){
    const sourceParent=groupOf(mesh);
    // Exhaust branches are continuous regions of one casting, not four
    // independently installed pipes. Their old descriptive tags remain useful
    // to the source renderer but collapse into the one manifold occurrence.
    const tag=mesh.userData.catalogPiece==='runner-exhaust'?'manifold-exhaust':mesh.userData.catalogPiece;
    const catalogId=tag||DEFAULT_TYPES[sourceParent]||'wiring-loom';
    if(!entries.has(catalogId)&&!ASSEMBLY_EXTRA_TYPES[catalogId])throw new Error(`Undocumented assembly detail: ${catalogId}`);
    const rawInstance=catalogId==='manifold-exhaust'?0:mesh.userData.catalogInstance??(catalogId==='spark-plug'?sparkIndex.get(mesh)??0:0);
    const key=`${catalogId}\u0000${rawInstance}`;
    if(!bins.has(key))bins.set(key,{catalogId,rawInstance,sourceParent,meshes:[]});
    if(assigned.has(mesh))throw new Error(`Duplicate assembly source mesh: ${mesh.uuid}`);
    bins.get(key).meshes.push(mesh);assigned.add(mesh);
  }
  const grouped=new Map();for(const bin of bins.values()){if(!grouped.has(bin.catalogId))grouped.set(bin.catalogId,[]);grouped.get(bin.catalogId).push(bin);}
  const units=[];
  for(const [catalogId,occurrences] of grouped){
    occurrences.sort((a,b)=>String(a.rawInstance).localeCompare(String(b.rawInstance),'en',{numeric:true}));
    occurrences.forEach((bin,index)=>{
      const entry=entries.get(catalogId),extra=ASSEMBLY_EXTRA_TYPES[catalogId];
      const parentId=entry?.parentId||bin.sourceParent;
      const approximate=bin.meshes.some(mesh=>mesh.userData.assemblyApproximate);
      const note=/^(guide-valve-exhaust|seal-valve-stem-exhaust)$/.test(catalogId)?exhaustNote:approximate?bin.meshes.find(mesh=>mesh.userData.assemblyNote)?.userData.assemblyNote||extraNote:extra?extraNote:originalNote;
      const evidence=approximate||extra||entry?.confidence==='illustrative'?'illustrative':'visually reconstructed';
      const subassembly=pistonKit(catalogId,bin.rawInstance)||(HEAD_TYPES.has(catalogId)?'head':null);
      units.push({id:`${catalogId}:${index+1}`,catalogId,instanceIndex:index+1,parentId,chapter:chapterFor(catalogId,parentId),subassembly,evidence,note,
        ...(extra?{label:extra.label}:{}),meshes:bin.meshes,restMatrices:bin.meshes.map(mesh=>mesh.matrixWorld.clone())});
    });
  }
  const byCatalog={};
  for(const unit of units){const record=byCatalog[unit.catalogId]??={instances:0,meshCount:0,evidence:unit.evidence};record.instances++;record.meshCount+=unit.meshes.length;if(unit.evidence==='illustrative')record.evidence='illustrative';}
  const missingTypes=CATALOG.filter(entry=>!byCatalog[entry.id]).map(entry=>entry.id);
  const extraTypes=Object.keys(byCatalog).filter(id=>!entries.has(id));
  const coverage={catalogueTypes:CATALOG.length,coveredTypes:CATALOG.length-missingTypes.length,missingTypes,occurrences:units.length,totalMeshes:physical.length,assignedMeshes:assigned.size,extraTypes,byCatalog};
  const uncertainties=[
    {id:'geometry',label:{es:'Dimensiones y recorridos',en:'Dimensions and paths'},note:originalNote},
    {id:'sockets',label:{es:'Interiores y posiciones aproximadas',en:'Approximate interiors and sockets'},note:{es:'Los interiores complementarios conservan las recetas de Anatomy y se instalan en el motor común mediante posiciones explícitas aproximadas. No se afirman holguras medidas.',en:'Supplementary interiors retain the Anatomy recipes and are installed in the shared engine using explicit approximate sockets. Measured clearances are not asserted.'}},
    {id:'exhaust-guide-seals',label:{es:'Guías y retenes de escape',en:'Exhaust guides and seals'},note:exhaustNote},
    {id:'inventory',label:{es:'Tipos y repeticiones',en:'Types and repetitions'},note:{es:'Los 102 tipos del catálogo se distinguen de sus repeticiones físicas. Detalles estructurales adicionales no crean nuevas referencias OEM; fijaciones no catalogadas permanecen con su conjunto.',en:'The 102 catalogue types are distinct from repeated physical occurrences. Additional structural details do not create new OEM references; unitemized fasteners remain with their assembly.'}},
    {id:'market',label:{es:'Mercado y emisiones',en:'Market and emissions'},note:{es:'Mercado y variante de emisiones pendientes; no se muestran calibraciones ni rutas de vacío definitivas.',en:'Market and emissions variant remain unresolved; definitive calibration and vacuum routing are not shown.'}},
  ];
  if(assigned.size!==sourceSet.size)throw new Error('Assembly inventory does not cover every source mesh.');
  if(missingTypes.length)throw new Error(`Missing assembly catalogue types: ${missingTypes.join(', ')}`);
  return {engine,units,coverage,uncertainties};
}
