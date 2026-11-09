#!/usr/bin/env node
// CPU integration checks: catalogue evidence + model navigation + actual scene
// construction + physical motion contracts. No browser or screenshot automation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CATALOG,CATALOG_SYSTEMS,REMOVED_COMPONENTS,LEGACY_COMPONENT_ALIASES,CATALOG_REFERENCE_ROOT} from '../src/anatomy/catalog.js';
import {PARTS,SYSTEMS} from '../src/parts.js';
import {buildFigure,renderSvg} from '../src/anatomy/figures.mjs';
import {figureValues} from '../src/anatomy/motion.mjs';
import {ENGINE,SPEC} from '../src/engine-spec.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const diagrams=path.resolve(root,'../Honda Reference Library',CATALOG_REFERENCE_ROOT);
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message);};
const close=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol;
const near=(a,b,tol=1e-7)=>a.length===b.length&&a.every((x,i)=>close(x,b[i],tol));
const flatten=x=>typeof x==='number'?[x]:Array.isArray(x)?x.flatMap(flatten):x&&typeof x==='object'?Object.values(x).flatMap(flatten):[];
const poseVector=p=>[...p.work.R,...p.work.t,...p.rotor.R,...p.rotor.t,...(p.idler?.R||[]),...(p.idler?.t||[])];
const types=new Set(['fixed','rotate','reciprocate','rock','spring','flow','switch']);
const parents=new Set(PARTS.map(p=>p.id)),ids=new Set(),systemIds=new Set(CATALOG_SYSTEMS.map(s=>s.id));
const db=new Map();
const phases=[0,.071,.137,.25,.39,.51,.73,.89,1];
const byId=Object.fromEntries(CATALOG.map(p=>[p.id,p]));
let references=0,rendered=0,poseChecks=0;
const kinds=new Set();

check(CATALOG.length>0,'Catalogue is empty.');
check(ENGINE.code==='F22A6'&&!ENGINE.variableValveLift,'Expected fixed-profile F22A6 engine identity.');
for(const id of Object.keys(REMOVED_COMPONENTS))check(!byId[id],`${id}: removed component remains in the active catalogue`);
for(const [oldId,newId] of Object.entries(LEGACY_COMPONENT_ALIASES)){check(!byId[oldId]&&!!byId[newId],`${oldId}: legacy alias is not resolved to an active type`);}
for(const id of ['rocker-inlet-a','rocker-inlet-b','rocker-exhaust','shaft-inlet-rockers-a','shaft-inlet-rockers-b','shaft-exhaust-rockers','iab-body','iab-butterfly','iab-shaft','iab-actuator','iab-solenoid','iab-vacuum-chamber','flywheel','clutch-disc','clutch-pressure-plate'])check(!!byId[id],`${id}: missing F22A6 / 5MT component`);
check(systemIds.size===SYSTEMS.length&&SYSTEMS.every(s=>systemIds.has(s)),'Atlas must cover all existing engine systems.');
for(const system of CATALOG_SYSTEMS)check(CATALOG.some(p=>p.system===system.id),`Empty system: ${system.id}`);

for(const item of CATALOG){
 const tag=item.id||'<missing id>';
 check(typeof item.id==='string'&&/^[a-z][a-z0-9-]*$/.test(item.id),`${tag}: invalid stable ID`);
 check(!ids.has(item.id),`${tag}: duplicate ID`);ids.add(item.id);
 check(parents.has(item.parentId),`${tag}: missing parent group ${item.parentId}`);
 check(systemIds.has(item.system),`${tag}: unknown system ${item.system}`);
 for(const field of ['label','english','kind','quantity','location','function','connections','note'])check(typeof item[field]==='string'&&item[field].trim().length>0,`${tag}: missing ${field}`);
 check(Array.isArray(item.steps)&&item.steps.length===3&&item.steps.every(s=>typeof s==='string'&&s.trim().length>5),`${tag}: expected three explanatory steps`);
 check(types.has(item.motion?.type),`${tag}: unknown motion type`);
 check(typeof item.motion?.description==='string'&&item.motion.description.length>20,`${tag}: insufficient motion explanation`);
 check(typeof item.motion?.driver==='string'&&item.motion.driver.length>5,`${tag}: missing motion driver`);
 check(['reference','illustrative'].includes(item.confidence),`${tag}: missing evidence classification`);
 check(Array.isArray(item.oem),`${tag}: OEM references must be an array`);
 for(const ref of item.oem||[]){
  const key=`${ref.market}/${ref.diagram}`;
  const source=path.join(diagrams,ref.market||'',`${ref.diagram}.json`);
  check(['KA','KL'].includes(ref.market),`${tag}: missing source-market qualifier`);
  if(!db.has(key)){
   if(!fs.existsSync(source)){errors.push(`${tag}: missing OEM source ${source}`);continue;}
   db.set(key,JSON.parse(fs.readFileSync(source,'utf8')));
  }
  const found=db.get(key).parts.some(p=>p.callout===String(ref.callout)&&p.part_number===ref.pn);
  check(found,`${tag}: OEM callout/number mismatch ${ref.diagram} #${ref.callout} ${ref.pn}`);
  references++;
 }
 if(!item.oem?.length)check(item.confidence==='illustrative',`${tag}: unsupported identity must be marked illustrative`);
 let figure;
 try{figure=buildFigure(item);}catch(e){errors.push(`${tag}: figure construction failed: ${e.message}`);continue;}
 kinds.add(figure.kind);
 check(figure.data?.parts?.length>0,`${tag}: empty 3D scene`);
 check(flatten(figure.data).every(Number.isFinite),`${tag}: non-finite scene coordinates`);
 // Adjacent annulus sectors share a mathematical face; round-off at ~1e-14
 // is contact, not an interpenetration. Any meaningful negative margin fails.
 check(Array.isArray(figure.report?.tight)&&figure.report.tight.every(pair=>pair.margin>=-1e-7),`${tag}: unresolved Anatomy separation constraints`);
 check(typeof figure.markup==='string'&&figure.markup.includes('<svg'),`${tag}: missing live SVG markup`);
 const poses=phases.map(phase=>figureValues(figure.kind,{phase,angle:0,entry:item}));
 const vectors=poses.map(poseVector);
 for(let i=0;i<poses.length;i++){
  check(flatten(poses[i]).every(Number.isFinite),`${tag}: non-finite motion at phase ${phases[i]}`);
  check(near(poseVector(figureValues(figure.kind,{phase:phases[i],angle:0,entry:item})),vectors[i]),`${tag}: non-deterministic pose`);
  poseChecks++;
 }
 const changes=vectors.some(v=>!near(v,vectors[0]));
 if(item.motion.type==='fixed')check(!changes,`${tag}: fixed component moves with operating phase`);
 else check(changes,`${tag}: declared ${item.motion.type} but operating pose never changes`);
 if(!['pulley-power-steering','rotor-alternator','pump-oil'].includes(item.id))check(near(vectors[0],vectors.at(-1)),`${tag}: crank-linked loop does not return to its starting pose`);
 try{
  const svg=renderSvg(item.kind,{entry:item,phase:.137,angle:28,theme:'light',width:720,height:540});
  check(svg.includes('<svg')&&svg.includes('<path'),`${tag}: renderer returned no drawing`);
  check(!/NaN|Infinity|undefined/.test(svg),`${tag}: invalid numeric SVG output`);
  rendered++;
 }catch(e){errors.push(`${tag}: SVG render failed: ${e.message}`);}
}

// Mechanical reference facts, independently checked against the output poses.
// phase=0..1 represents a complete 720-degree crank cycle in these figures.
function entryPose(id,phase){const entry=byId[id];if(!entry)return null;return figureValues(buildFigure(entry).kind,{phase,angle:0,entry});}
if(byId.piston){
 const top=entryPose('piston',0),bottom=entryPose('piston',.25),secondTop=entryPose('piston',.5);
 check(close(Math.abs(top.work.t[2]-bottom.work.t[2]),SPEC.stroke,1e-6),'Piston travel must match the shared reference stroke.');
 check(near(poseVector(top),poseVector(secondTop)),'Piston must repeat its position after one crank revolution.');
}
// Independent direction oracle: the crank snout/pulley is on negative Y, the
// transmission flange on positive Y, and +Z is up. Looking from the snout, a
// mark initially on the right (+X) must move upward (+Z) for Honda's specified
// counter-clockwise rotation. Do not use TURN.rotation to construct expectations:
// doing so would reproduce an implementation sign error in the test itself.
const pointOnRight=pose=>[pose.work.R[0],pose.work.R[3],pose.work.R[6]];
for(const [id,quarterPhase] of [['crankshaft',.125],['pulley-crank-timing',.125],['camshaft',.25],['pulley-camshaft',.25]]){
 const pose=entryPose(id,quarterPhase);
 if(pose)check(near(pointOnRight(pose),[0,0,1]),`${id}: right-hand point must move up after a quarter-turn viewed from the negative-Y pulley end (Honda counter-clockwise)`);
}
const camAtCrankQuarter=entryPose('camshaft',.125);
if(camAtCrankQuarter)check(near(pointOnRight(camAtCrankQuarter),[Math.SQRT1_2,0,Math.SQRT1_2]),'Camshaft must advance 45 degrees while the crank advances 90 degrees.');
// The isolated rod starts at TDC. With counter-clockwise motion viewed from
// the snout, its big-end center next moves left, not right. Measure the point
// on the actual rod recipe (big-eye center at local Z=-60), not a rotation helper.
const rodQuarter=entryPose('connecting-rod',.125);
if(rodQuarter){
 const pose=rodQuarter.work,localZ=-60;
 const bigEnd=[pose.R[2]*localZ+pose.t[0],pose.R[5]*localZ+pose.t[1],pose.R[8]*localZ+pose.t[2]];
 check(near(bigEnd,[-47.5,0,-60]),'Connecting-rod big end must move left from TDC with the counter-clockwise crank.');
}
const p=.137;
const front=entryPose('shaft-balance-front',p),rear=entryPose('shaft-balance-rear',p);
if(front&&rear){
 const a=pointOnRight(front),b=pointOnRight(rear),angle=4*Math.PI*2*p;
 check(close(a[0],Math.cos(angle))&&close(b[0],Math.cos(angle))&&close(Math.abs(a[2]),Math.abs(Math.sin(angle)))&&close(a[2],-b[2])&&close(a[1],0)&&close(b[1],0),'Balance shafts must counter-rotate at twice crankshaft speed.');
}

// If media are requested, catch an incomplete deliverable instead of accepting
// a manifest entry whose local file is absent. Encoding validity is separately
// checked by ffprobe in the production script.
if(process.argv.includes('--media')){
 const media=path.join(root,'anatomy-media'),file=path.join(media,'manifest.json');
 if(!fs.existsSync(file))errors.push('Missing anatomy-media/manifest.json');
 else{
  const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  check(manifest.audio===false,'Manifest must truthfully label caption-only MP4s as having no audio.');
  for(const item of CATALOG){
   const entry=manifest.entries?.[item.id];
   if(!entry){errors.push(`${item.id}: no media manifest entry`);continue;}
   for(const key of ['video','poster','captions']){
    const value=entry[key];
    check(typeof value==='string'&&value.length>0,`${item.id}: no ${key} filename`);
    if(value){const local=path.resolve(media,value);check(local.startsWith(media+path.sep)&&fs.existsSync(local)&&fs.statSync(local).size>0,`${item.id}: missing local ${key} file`);}
   }
  }
 }
}

if(errors.length){
 console.error(`Anatomy checks failed (${errors.length}):\n${errors.map(e=>' - '+e).join('\n')}`);
 process.exitCode=1;
}else console.log(`Anatomy checks passed: ${CATALOG.length} component types; ${systemIds.size} systems; ${references} verified OEM links; ${kinds.size} scene recipes; ${rendered} rendered figures; ${poseChecks} finite, deterministic pose samples${process.argv.includes('--media')?'; all local media present':''}.`);
