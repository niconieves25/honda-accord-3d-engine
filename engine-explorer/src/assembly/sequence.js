import {getCatalog} from '../anatomy/catalog-i18n.js';

// An explanatory order of subassemblies. These are deliberately not Honda
// tightening, machining or service instructions.
export const ASSEMBLY_CHAPTERS = [
  ['bottom','Bloque y cigüeñal','Block and crankshaft','El bloque recibe los apoyos y el conjunto giratorio.','The block receives the supports and rotating assembly.'],
  ['pistons','Cuatro conjuntos de pistón','Four piston assemblies','Monta cada conjunto a un lado y acompáñalo hasta su cilindro.','Build each assembly beside the engine, then follow it into its cylinder.'],
  ['lubrication','Equilibrado y lubricación','Balance and lubrication','Relaciona ejes, bomba y recogida de aceite antes de cerrar la parte inferior.','Connect the shafts, pump and oil pickup before enclosing the lower engine.'],
  ['head','Válvulas de la culata','Cylinder head valves','La culata se construye aparte para que se vean sus piezas pequeñas.','The head is built separately so its small components remain visible.'],
  ['valvetrain','Árbol y balancines','Camshaft and rocker arms','Un árbol de levas y balancines independientes accionan las dieciséis válvulas.','One camshaft and independent rocker arms operate the sixteen valves.'],
  ['head-join','Unir culata y bloque','Join the head and block','La junta separa y sella las superficies; la culata completa llega desde su estación.','The gasket separates and seals the faces; the completed head arrives from its station.'],
  ['timing','Distribución y refrigeración','Timing and cooling','Poleas, bombas, tensores y correas se relacionan en su posición final.','Pulleys, pumps, tensioners and belts meet in their final positions.'],
  ['intake','Admisión y combustible','Intake and fuel','Capas del colector, mariposas secundarias y alimentación de combustible.','Manifold layers, secondary butterflies and fuel delivery.'],
  ['attachments','Escape, encendido y accesorios','Exhaust, ignition and attachments','Se añaden los conjuntos exteriores y la salida de embrague manual.','Add the external assemblies and manual clutch output.'],
  ['closures','Tapas y acabado','Covers and completion','Juntas, tapas y fijaciones dejan el motor con su aspecto exterior completo.','Gaskets, covers and fasteners complete the engine exterior.'],
].map(([id,es,en,descEs,descEn])=>({id,label:{es,en},description:{es:descEs,en:descEn}}));

const catalogs = {es:new Map(getCatalog('es').map(entry=>[entry.id,entry])),en:new Map(getCatalog('en').map(entry=>[entry.id,entry]))};
const RANK = [
  'block-cylinders','bearing-main','washer-thrust','crankshaft','bridge-main-bearing',
  'piston','connecting-rod','piston-pin','ring-oil','ring-second','ring-top','bearing-rod','connecting-rod-cap','bolt-connecting-rod',
  'shaft-balance-front','shaft-balance-rear','pump-oil','valve-oil-relief','spring-oil-relief','strainer-oil',
  'cylinder-head','guide-valve','guide-valve-exhaust','valve-inlet','valve-exhaust','seal-valve-stem','seal-valve-stem-exhaust','seat-valve-spring','spring-valve-inlet','spring-valve-exhaust','retainer-valve','keepers-valve',
  'camshaft','shaft-exhaust-rockers','shaft-inlet-rockers-a','shaft-inlet-rockers-b','rocker-inlet-a','rocker-inlet-b','rocker-exhaust','spring-rocker-a','spring-rocker-b','washer-rocker-wave','screw-valve-lash','nut-valve-lash',
  'gasket-cylinder-head','pump-water','seal-camshaft','pulley-crank-timing','pulley-camshaft','tensioner-timing','spring-timing-adjuster','belt-timing','tensioner-balance','belt-balance',
  'gasket-iab','runner-intake','iab-body','iab-shaft','iab-butterfly','iab-actuator','iab-solenoid','iab-vacuum-chamber','iab-check-valve','plenum-intake','throttle-butterfly','injector-fuel','seal-injector','rail-fuel','regulator-fuel','duct-intake',
  'gasket-exhaust','manifold-exhaust','housing-distributor','rotor-distributor','cap-distributor','coil-ignition','spark-plug','lead-spark-plug','flywheel','clutch-disc','clutch-pressure-plate',
  'gasket-valve-cover','seal-plug-tube','cover-valves','washer-valve-cover','nut-valve-cover','gasket-oil-cap','cap-oil-filler','pan-oil','cover-timing-lower','cover-timing-upper','shield-exhaust',
];
const rank = id => {const index=RANK.indexOf(id);return index<0?1000:index;};
const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));

export function assemblyUnitLabel(unit,lang='es') {
  const entry=catalogs[lang]?.get(unit.catalogId);
  const supplied=unit.label?.[lang] || unit.name?.[lang];
  return supplied || entry?.label || (lang==='en'?'Supporting detail':'Detalle de apoyo');
}

export function buildAssemblySequence(inventory) {
  const units=inventory.units || [];
  const seen=new Set();
  for(const unit of units){
    if(!unit.id || seen.has(unit.id))throw new Error(`Assembly requires unique physical unit IDs: ${unit.id}`);
    seen.add(unit.id);
    if(!ASSEMBLY_CHAPTERS.some(c=>c.id===unit.chapter))throw new Error(`Unknown assembly chapter ${unit.chapter}: ${unit.id}`);
  }
  const steps=[],chapters=[];
  const append = step => {
    step.index=steps.length;
    step.start=steps.at(-1)?.end || 0;
    step.end=step.start+step.duration;
    steps.push(step);
  };
  const appendUnit = (unit,placementGroupId=unit.subassembly) => {
    const entries={es:catalogs.es.get(unit.catalogId),en:catalogs.en.get(unit.catalogId)};
    append({id:unit.id,type:'unit',unitIds:[unit.id],catalogId:unit.catalogId,instanceIndex:unit.instanceIndex,
      chapter:unit.chapter,placementGroupId,label:{es:assemblyUnitLabel(unit,'es'),en:assemblyUnitLabel(unit,'en')},
      description:{es:entries.es?.function || unit.note?.es || 'Detalle que conecta y completa este conjunto.',en:entries.en?.function || unit.note?.en || 'A supporting detail that connects and completes this assembly.'},
      evidence:unit.evidence,note:unit.note,duration:/bolt|nut|washer|keeper|seal|spring/.test(unit.catalogId)?1.25:2.1});
  };
  const sorted = list => [...list].sort((a,b)=>rank(a.catalogId)-rank(b.catalogId)||(a.instanceIndex||1)-(b.instanceIndex||1)||a.id.localeCompare(b.id));
  const isLowerBearing=unit=>Number.isInteger(Number(unit.meshes?.[0]?.userData.catalogInstance))
    ?Number(unit.meshes[0].userData.catalogInstance)%2===1:unit.instanceIndex%2===0;
  const appendCapJoin=(groupId,members,chapter,label,description)=>append({id:`cap-insert:${groupId}`,type:'group',groupId,unitIds:members.map(unit=>unit.id),chapter,label,description,evidence:'illustrative',duration:2.7});
  for(const definition of ASSEMBLY_CHAPTERS){
    const chapter={...definition,index:chapters.length,start:steps.at(-1)?.end||0,firstStep:steps.length};
    const local=units.filter(unit=>unit.chapter===chapter.id);
    if(chapter.id==='bottom'){
      const consumed=new Set();
      const place=unit=>{appendUnit(unit);consumed.add(unit.id);};
      sorted(local.filter(unit=>unit.catalogId==='block-cylinders')).forEach(place);
      sorted(local.filter(unit=>unit.catalogId==='bearing-main'&&!isLowerBearing(unit))).forEach(place);
      sorted(local.filter(unit=>['washer-thrust','crankshaft'].includes(unit.catalogId))).forEach(place);
      for(const cap of sorted(local.filter(unit=>unit.catalogId==='main-bearing-cap'))){
        const groupId=`main-cap-${cap.instanceIndex}`;
        const shell=local.find(unit=>unit.catalogId==='bearing-main'&&unit.instanceIndex===cap.instanceIndex*2);
        const members=[cap,shell].filter(Boolean);
        for(const unit of members){appendUnit(unit,groupId);consumed.add(unit.id);}
        appendCapJoin(groupId,members,chapter.id,
          {es:`Asentar la tapa de bancada ${cap.instanceIndex}`,en:`Seat main bearing cap ${cap.instanceIndex}`},
          {es:'El semicojinete inferior se presenta en su tapa aparte del cigüeñal. Ambos se aproximan desde abajo; el apoyo ya no está cerrado cuando llega el cigüeñal. Montaje ilustrativo, sin pares ni orden de apriete.',en:'The lower bearing shell is shown in its separate cap. Both approach from below, so the support is not closed when the crankshaft arrives. Illustrative assembly; no torques or tightening sequence are asserted.'});
      }
      // The bridge and its non-itemized fasteners arrive after the five caps.
      sorted(local.filter(unit=>!consumed.has(unit.id))).forEach(unit=>appendUnit(unit));
    }else if(chapter.id==='pistons'){
      const kits=[...new Set(local.map(unit=>unit.subassembly).filter(id=>/^piston-[1-4]$/.test(id||'')))].sort();
      for(const kit of kits){
        const members=local.filter(unit=>unit.subassembly===kit);
        const lowerShells=members.filter(unit=>unit.catalogId==='bearing-rod'&&isLowerBearing(unit));
        const caps=members.filter(unit=>unit.catalogId==='connecting-rod-cap');
        const bolts=members.filter(unit=>unit.catalogId==='bolt-connecting-rod');
        const deferred=new Set([...lowerShells,...caps,...bolts].map(unit=>unit.id));
        const core=members.filter(unit=>!deferred.has(unit.id));
        sorted(core).forEach(unit=>appendUnit(unit));
        const number=Number(kit.split('-')[1]);
        append({id:`kit-insert:${kit}`,type:'group',groupId:kit,unitIds:core.map(u=>u.id),chapter:chapter.id,
          label:{es:`Introducir el conjunto del pistón ${number}`,en:`Insert piston assembly ${number}`},
          description:{es:'Pistón y biela entran desde arriba con la cabeza de biela abierta: la tapa, el semicojinete inferior y sus fijaciones llegan después. No se simulan herramientas ni compresión de aros.',en:'Piston and rod enter from above with the big end open: the cap, lower bearing shell and fasteners follow afterward. Tools and ring compression are not simulated.'},
          evidence:'illustrative',duration:3.2});
        const capMembers=[...sorted(caps),...sorted(lowerShells)],capGroup=`rod-cap-${number}`;
        if(capMembers.length){
          capMembers.forEach(unit=>appendUnit(unit,capGroup));
          appendCapJoin(capGroup,capMembers,chapter.id,
            {es:`Cerrar la biela del cilindro ${number}`,en:`Close cylinder ${number} connecting rod`},
            {es:'Tapa y semicojinete inferior llegan desde abajo después de que la biela alcance la muñequilla. Las fijaciones aparecen en los pasos siguientes; no se simula un apriete de taller.',en:'The cap and lower bearing shell arrive from below after the rod reaches the crankpin. Fasteners follow in the next steps; workshop tightening is not simulated.'});
        }
        sorted(bolts).forEach(unit=>appendUnit(unit));
      }
      sorted(local.filter(unit=>!kits.includes(unit.subassembly))).forEach(unit=>appendUnit(unit));
    }else sorted(local).forEach(unit=>appendUnit(unit));
    if(chapter.id==='head-join'){
      const placed=new Set(steps.filter(step=>step.type==='unit').flatMap(step=>step.unitIds));
      const head=units.filter(unit=>unit.subassembly==='head'&&placed.has(unit.id));
      if(head.length)append({id:'head-join',type:'group',groupId:'head',unitIds:head.map(unit=>unit.id),chapter:chapter.id,
        label:{es:'Asentar la culata completa',en:'Seat the complete cylinder head'},
        description:{es:'La culata preparada se alinea sobre la junta y desciende hasta el bloque. El recorrido es didáctico; no establece un orden de apriete ni valores de par.',en:'The prepared head aligns above the gasket and lowers onto the block. This educational path does not establish a tightening sequence or torque values.'},
        evidence:'illustrative',duration:4.1});
    }
    chapter.end=steps.at(-1)?.end||chapter.start;
    chapter.lastStep=steps.length-1;
    chapter.stepIds=steps.slice(chapter.firstStep).map(step=>step.id);
    chapter.unitCount=local.length;
    chapters.push(chapter);
  }
  const totalDuration=steps.at(-1)?.end||0;
  const findStep=id=>{
    if(Number.isInteger(id))return id>=0&&id<steps.length?id:-1;
    let index=steps.findIndex(step=>step.id===id);
    if(index<0)index=steps.findIndex(step=>step.unitIds.includes(id));
    if(index<0)index=steps.findIndex(step=>step.catalogId===id);
    return index;
  };
  return {steps,chapters,totalDuration,findStep,
    progressForStep:index=>!steps.length?0:steps[clamp(Number.isFinite(index)?Math.trunc(index):0,0,steps.length-1)].end/totalDuration};
}
