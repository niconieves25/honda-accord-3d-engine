/** Honda component study figures, built with the installed Anatomy TURN kit.
 * Distances apart from 85 mm piston/bore and 95 mm travel are illustrative.
 * A figure isolates one component; inspection orbit is separate from working motion.
 */
import * as k from './vendor/iso-kit.mjs';
import * as G from './vendor/lathe.mjs';
import { turning } from './vendor/turn-build.mjs';
import { TURN, TURN_CSS } from './vendor/turn.mjs';
import { figureValues } from './motion.mjs';
import {SPEC,ASSUMED,CAM_LAYOUT} from '../engine-spec.js';
import {lobePeak,TDC} from '../kin.js';
export { figureValues } from './motion.mjs';
const TAU=Math.PI*2, cache=new Map();
const hull2=pts=>{pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],hi=[];for(const p of pts){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of [...pts].reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));};
const circle2=(x,z,r,n=32)=>Array.from({length:n},(_,i)=>[x+r*Math.cos(i*TAU/n),z+r*Math.sin(i*TAU/n)]);

const frame=(o=[0,0,0],a=[0,0,1])=>G.frameAlong(o,a);
const aliases={ring:'compressionRing',oilring:'oilRing',camshaft:'shaft',valveCover:'valveCover',oilPump:'pump',waterPump:'pump',psPump:'pump',intakerunner:'manifold',hose:'pipe',lead:'pipe',solenoid:'solenoid',plunger:'plunger',toothedpulley:'pulley',sparkplug:'sparkPlug',strainer:'strainer'};
export const RECIPE_KINDS=['piston','compressionRing','oilRing','pin','rod','rodCap','bearing','crankshaft','shaft','valve','spring','retainer','keeper','rocker','plate','pulley','belt','pump','seal','gasket','bolt','block','head','valveCover','cover','pan','manifold','pipe','injector','filter','distributor','sparkPlug','alternator','sensor','thermostat','throttle','plenum','rail','solenoid','plunger','nut','washer','strainer','iabBody','iabGasket','iabButterfly','iabShaft','iabActuator','vacuumTank','flywheel','clutchDisc','clutchPressurePlate'];
const canonical=kind=>aliases[kind]||kind;
const variants={'regulator-fuel':'diaphragm','valve-egr':'diaphragm','bridge-main-bearing':'bearingBridge','lead-spark-plug':'plugLead','pulley-power-steering':'groovedPulley','tensioner-timing':'groovedPulley','tensioner-balance':'groovedPulley','bearing-rod':'bearingRod','bolt-connecting-rod':'boltRod','pump-oil':'oilRotorPump','pump-power-steering':'vanePump','cap-oil-filler':'oilCap','gasket-valve-cover':'rimGasket','gasket-exhaust':'portGasket','cover-timing-upper':'timingCover','cover-timing-lower':'timingCover','shield-exhaust':'shield','shaft-balance-front':'balanceShaft','shaft-balance-rear':'balanceShaft','shaft-inlet-rockers-a':'shortShaft','shaft-inlet-rockers-b':'longShaft','shaft-exhaust-rockers':'plainShaft','nut-valve-cover':'capNut','guide-valve':'guide','coil-ignition':'coil','rotor-alternator':'alternatorRotor','rectifier-alternator':'rectifier','rotor-distributor':'distributorRotor','dipstick-oil':'dipstick','housing-distributor':'distributorHousing','cap-distributor':'distributorCap'};
const resolve=(kind,entry)=>variants[entry?.id]||canonical(kind);

function recipe(T,kind){
 const orbit=T.group('orbit',{turn:{pivot:[0,0]}});
 const body=T.group('work',{parent:orbit,free:{origin:[0,0,0]}});
 const rotor=T.group('rotor',{parent:body,free:{origin:[0,0,0]}});const idler=T.group('idler',{parent:body,free:{origin:[0,0,0]}});
 const layer=T.layer('subject');T.stack(['subject']);let idx=0,group=body;
 const common=(name,mat='steel',g=group)=>({name:`${kind}.${name}.${idx++}`,group:g,layer,material:mat,tone:'mid',crease:'faint'});
 const round=(o,axis,r,len,mat='steel',details={},g=group)=>T.round({...common('turned',mat,g),F:frame(o,axis),s0:0,s1:len,r,details,fixed:false});
 const box=(x,y,z,w,d,h,mat='steel',r=1,g=group)=>T.prism({...common('casting',mat,g),plan:{x,y,w,d,r:Math.min(r,w/3,d/3)},z,h,bevel:.35});
 const prism=(points,y,depth,mat='steel',g=group)=>T.prism({...common('web',mat,g),F:{o:[0,y,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},polygon:points,s0:0,s1:depth,bevel:.2});
 const ring=(o,axis,ro,ri,len,mat='steel',start=0,end=TAU,n=24,g=group)=>{const F=frame(o,axis);for(let i=0;i<n;i++){const a=start+(end-start)*i/n,b=start+(end-start)*(i+1)/n;T.prism({...common('annulus',mat,g),tone:'lo',crease:'none',F,polygon:[[ri*Math.cos(a),ri*Math.sin(a)],[ro*Math.cos(a),ro*Math.sin(a)],[ro*Math.cos(b),ro*Math.sin(b)],[ri*Math.cos(b),ri*Math.sin(b)]],s0:0,s1:len});}};
 const bolt=(x,y,z,sz=3,h=12,mat='gunmetal')=>{round([x,y,z],[0,0,1],sz*.55,h,mat,{seams:[h*.25,h*.5,h*.75]});let poly=Array.from({length:6},(_,i)=>[sz*Math.cos(i*TAU/6),sz*Math.sin(i*TAU/6)]);T.prism({...common('hex',mat),F:frame([x,y,z+h]),polygon:poly,s0:0,s1:sz*.65,bevel:.15});};
 const tube=(points,r=4,mat='rubber',g=group)=>T.tube({...common('tube',mat,g),route:points,r,chunk:50,turn:90,caps:true});
 const shell=(w,d,h,wall=4,mat='steel')=>{box(-w/2,-d/2,0,w,d,wall,mat);box(-w/2,-d/2,wall,w,wall,h-wall,mat);box(-w/2,d/2-wall,wall,w,wall,h-wall,mat);box(-w/2,-d/2+wall,wall,wall,d-wall*2,h-wall,mat);box(w/2-wall,-d/2+wall,wall,wall,d-wall*2,h-wall,mat);};
 const eye=(z,ro,ri,depth=16,mat='steel',start=0,end=TAU)=>ring([0,-depth/2,z],[0,1,0],ro,ri,depth,mat,start,end,28);
 const shaft=()=>{
  // Shared illustrative contact-track layout; OEM topology/track widths remain
  // unresolved in engine-spec.js rather than inferred from valve count.
  const lobes=[];for(let i=0;i<SPEC.cylinders;i++)for(const item of CAM_LAYOUT){const c=(i-1.5)*ASSUMED.pitch;lobes.push({y:c+item.offsetMm-item.widthMm/2,h:item.widthMm,lift:ASSUMED.liftScale,angle:(lobePeak(item.profile)+TDC[i+1])/2});}
  const half=ASSUMED.pitch*2+10,journals=[-2,-1,0,1,2].map(n=>n*ASSUMED.pitch);
  const cuts=[-half,half,...lobes.flatMap(v=>[v.y,v.y+v.h]),...journals.flatMap(y=>[y-6,y+6])].sort((a,b)=>a-b);
  for(let i=1;i<cuts.length;i++){let a=cuts[i-1],b=cuts[i];if(b-a<.01)continue;let mid=(a+b)/2,lobe=lobes.find(v=>mid>v.y&&mid<v.y+v.h);if(lobe){let t=lobe.angle*Math.PI/180;prism(hull2([...circle2(0,0,12),...circle2(lobe.lift,0,8)]).map(([x,z])=>[x*Math.cos(t)-z*Math.sin(t),x*Math.sin(t)+z*Math.cos(t)]),a,b-a,'gunmetal');}else round([0,a,0],[0,1,0],journals.some(y=>Math.abs(mid-y)<6)?17:10,b-a,'chrome');}
 };
 // Eight open passages: four circular controlled ports beside four rounded
 // rectangular permanent ports. Wedges tile a plate without covering any bore.
 const iabPlate=(height,mat)=>{
  const w=70,d=ASSUMED.pitch;
  for(let row=0;row<SPEC.cylinders;row++)for(let col=0;col<2;col++){
   const cx=(col-.5)*w,cy=(row-1.5)*d,inner=[];
   if(col)for(let i=0;i<40;i++){let a=i*TAU/40;inner.push([24*Math.cos(a),24*Math.sin(a)]);}
   else for(let corner=0;corner<4;corner++){const a0=corner*Math.PI/2;const x=(corner===0||corner===3?1:-1)*18,z=(corner<2?1:-1)*22;for(let j=0;j<=8;j++){const a=a0+j*Math.PI/16;inner.push([x+5*Math.cos(a),z+5*Math.sin(a)]);}}
   inner.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
   const outer=p=>{const t=Math.min(w/2/Math.abs(p[0]||1e-9),d/2/Math.abs(p[1]||1e-9));return[p[0]*t,p[1]*t];};
   for(let i=0;i<inner.length;i++){const a=inner[i],b=inner[(i+1)%inner.length],oa=outer(a),ob=outer(b);T.prism({...common('passage',mat),F:{o:[cx,cy,0],u:[1,0,0],v:[0,1,0],a:[0,0,1]},polygon:[a,oa,ob,b],s0:0,s1:height});}
  }
 };
 let extent=[120,120,120],center=30;
 switch(kind){
 case 'piston': {
  // Crown, three ring lands, split skirt, pin bosses: one isolated piston, no attached rod.
  round([0,0,18.3],[0,0,1],SPEC.bore/2,5,'steel');
  for(let i=0;i<3;i++)ring([0,0,11+i*2.8],[0,0,1],SPEC.bore/2,34,1.7,'steel',0,TAU,32);
  ring([0,0,4],[0,0,1],42.4,34,6,'steel');
  ring([0,0,-25],[0,0,1],42.3,36.7,29,'steel',.35,Math.PI-.35,22);
  ring([0,0,-25],[0,0,1],42.3,36.7,29,'steel',Math.PI+.35,TAU-.35,22);
  for(let s of [-1,1])ring([0,s*17,-5],[0,s,0],15,11,14,'steel',0,TAU,20);
  extent=[110,110,160];center=10;break;
 }
 case 'compressionRing':ring([0,0,0],[0,0,1],SPEC.bore/2,39.3,1.6,'chrome',.045,TAU-.045,64);extent=[110,110,40];center=0;break;
 case 'oilRing': {
  ring([0,0,0],[0,0,1],SPEC.bore/2,39,0.7,'chrome',.035,TAU-.035,48);ring([0,0,3],[0,0,1],SPEC.bore/2,39,.7,'chrome',.035,TAU-.035,48);
  for(let i=0;i<32;i++){let a=i*TAU/32;round([40*Math.cos(a),40*Math.sin(a),.7],[0,0,1],.6,2.3,'brass');}extent=[110,110,40];center=0;break;
 }
 case 'pin':ring([0,-35,0],[0,1,0],SPEC.wristPinDia/2,6.8,70,'chrome',0,TAU,40);extent=[70,95,55];center=0;break;
 case 'rod':eye(-60,25,18);eye(-60+ASSUMED.rod,15,SPEC.wristPinDia/2);prism([[-9,-35],[9,-35],[5,67],[-5,67]],-3,6,'steel');for(let y of[-8,5])prism([[-11,-35],[11,-35],[7,67],[-7,67]],y,3,'steel');extent=[100,75,190];center=10;break;
 case 'rodCap':eye(0,25,18,16,'steel',Math.PI,TAU);extent=[80,60,65];center=0;break;
 case 'bearingRod':case 'bearing':ring([0,-13,0],[0,1,0],29,27,26,'chrome',0,Math.PI,40);extent=[85,65,60];center=10;break;
 case 'crankshaft':{
  for(let i=0;i<5;i++)round([0,-174+i*82,0],[0,1,0],19,22,'chrome');
  for(let i=0;i<4;i++){let y=-152+i*82,x=(i===0||i===3?1:-1)*(SPEC.stroke/2);round([x,y+11,0],[0,1,0],16,38,'chrome');for(let b of[0,49]){prism(hull2([...circle2(0,0,19),...circle2(x,0,19)]),y+b,11,'gunmetal');const weight=[[19,-24],...Array.from({length:17},(_,j)=>[31+24*Math.cos(-Math.PI/2+j*Math.PI/16),24*Math.sin(-Math.PI/2+j*Math.PI/16)]),[19,24]].map(([u,z])=>[-Math.sign(x)*u,z]);prism(weight,y+b,11,'steel');}}
  round([0,-192,0],[0,1,0],12,18,'chrome',{seams:[5,9,13]});round([0,176,0],[0,1,0],31,12,'steel',{bolts:[{s:12,r:23,count:8,size:1.2}]});extent=[180,420,170];center=0;break;
 }
 case 'shaft':shaft();extent=[90,ASSUMED.pitch*4+40,90];center=0;break;
 case 'valve':round([0,0,-50],[0,0,1],[15,16],3,'chrome');round([0,0,-47],[0,0,1],[16,3],10,'chrome');round([0,0,-37],[0,0,1],3,95,'chrome',{seams:[88,90,92]});extent=[80,80,155];center=3;break;
 case 'spring':{
  const steps=144,loops=6;tube(Array.from({length:steps+1},(_,i)=>[13*Math.cos(i*TAU*loops/steps),13*Math.sin(i*TAU*loops/steps),i*60/steps]),1.8,'chrome');extent=[65,65,85];center=30;break;
 }
 case 'retainer':ring([0,0,0],[0,0,1],16,5,4,'steel');ring([0,0,4],[0,0,1],9,5,3,'steel');extent=[55,55,30];center=3;break;
 case 'keeper':ring([0,0,0],[0,0,1],6,3,9,'chrome',.05,Math.PI-.05,16);extent=[30,30,25];center=4;break;
 case 'rocker':eye(0,12,7,14);for(let y of[-7,4])prism([[12,-5],[34,-2],[34,5],[12,5]],y,3,'steel');round([38,0,-2],[0,0,1],3.8,17,'chrome',{seams:[12,14]});round([-20,-7,3],[0,1,0],7,14,'gunmetal');box(-13,-4,0,1,8,6,'steel');extent=[90,60,65];center=5;break;
 case 'groovedPulley':case 'pulley':{
  ring([0,-9,0],[0,1,0],45,39,18,'gunmetal',0,TAU,64);ring([0,-9,0],[0,1,0],12,7,18,'steel');for(let i=0;i<5;i++){let a=i*TAU/5;const poly=[[12,-3],[38,-4],[38,4],[12,3]].map(([r,t])=>[r*Math.cos(a)-t*Math.sin(a),r*Math.sin(a)+t*Math.cos(a)]);prism(poly,-3,6,'steel');}if(kind==='pulley')for(let i=0;i<40;i++){let a=i*TAU/40;round([46.6*Math.cos(a),-8,46.6*Math.sin(a)],[0,1,0],1.6,16,'gunmetal');}else for(let y of[-7,0,7])ring([0,y,0],[0,1,0],46,45.1,1,'gunmetal',0,TAU,48);extent=[125,60,125];center=0;break;
 }
 case 'belt':{
  // A short loop; tooth count and loop dimensions are illustrative, not service timing.
  ring([0,-8,0],[0,1,0],54,51,16,'rubber',0,TAU,64);for(let i=0;i<48;i++){let a=i*TAU/48;round([49.3*Math.cos(a),-7,49.3*Math.sin(a)],[0,1,0],1.6,14,'rubber');}extent=[140,65,140];center=0;break;
 }
 case 'pump':{
  ring([0,-9,0],[0,1,0],40,29,18,'steel',0,TAU,40);round([0,-12,0],[0,1,0],40,3,'steel',{bolts:[{s:0,r:34,count:6,size:1.3}]});round([0,-9,0],[0,1,0],7,28,'chrome',{},rotor);for(let i=0;i<7;i++){let a=i*TAU/7;const poly=[[8,-2],[28,-5],[28,0],[8,2]].map(([r,t])=>[r*Math.cos(a)-t*Math.sin(a),r*Math.sin(a)+t*Math.cos(a)]);prism(poly,-6,12,'brass',rotor);}for(let x of[-1,1])ring([x*40,-1,0],[x,0,0],10,6,20,'steel');extent=[140,65,110];center=0;break;
 }
 case 'seal':ring([0,0,0],[0,0,1],30,19,8,'rubber',0,TAU,48);ring([0,0,8],[0,0,1],24,19,1.5,'gunmetal',0,TAU,48);extent=[85,85,35];center=4;break;
 case 'gasket':{
  for(let i=0;i<4;i++)ring([0,(i-1.5)*96,0],[0,0,1],47.5,42.5,1.4,'gunmetal',0,TAU,40);for(let x of[-52,48])box(x,-191,0,4,382,1.4,'gunmetal',0);for(let y of[-198,194])box(-52,y,0,104,4,1.4,'gunmetal',0);extent=[160,430,60];center=0;break;
 }
 case 'boltRod':case 'bolt':bolt(0,0,-40,12,65,'chrome');extent=[70,70,100];center=0;break;
 case 'nut':{let poly=Array.from({length:6},(_,i)=>[19*Math.cos(i*TAU/6),19*Math.sin(i*TAU/6)]);ring([0,0,0],[0,0,1],14.4,10,15,'steel',0,TAU,24);for(let i=0;i<6;i++){let a=poly[i],b=poly[(i+1)%6];T.prism({...common('hex-face'),F:frame(),polygon:[a,b,[b[0]*.88,b[1]*.88],[a[0]*.88,a[1]*.88]],s0:0,s1:15});}extent=[65,65,40];center=6;break;}
 case 'washer':ring([0,0,0],[0,0,1],22,11,2.5,'steel',0,TAU,48);extent=[65,65,30];center=0;break;
 case 'block':{
  // Individual casting is shown as an open educational section so bores remain visible.
  for(let i=0;i<4;i++)ring([0,(i-1.5)*96,0],[0,0,1],47.5,42.5,95,'steel',0,TAU,32);
  for(let x of[-65,58])box(x,-200,-40,7,400,135,'steel',0);
  for(let y of[-200,193])box(-58,y,-40,116,7,135,'steel',0);
  for(let y=-178;y<193;y+=48)for(let x of[-70,65])box(x,y,-35,5,5,120,'steel',0);
  for(let y of[-144,-48,48,144])for(let x of[-65,65])round([x,y,35],[Math.sign(x),0,0],10,1,'gunmetal');
  extent=[200,460,205];center=25;break;
 }
 case 'head':{
  shell(140,390,58,5);for(let i=0;i<4;i++){let y=(i-1.5)*96;for(let x of[-36,36])ring([x,y,58],[0,0,1],24,15,4,'steel',0,TAU,24);ring([0,y,5],[0,0,1],13,9,53,'steel',0,TAU,20);}for(let y=-170;y<180;y+=85)for(let x of[-62,62])bolt(x,y,58,3,4);extent=[195,450,130];center=32;break;
 }
 case 'valveCover':case 'cover':case 'plate':{
  const w=kind==='plate'?100:kind==='cover'?115:135,d=kind==='plate'?125:kind==='cover'?170:390,h=kind==='plate'?6:35;
  if(kind==='valveCover'){
   box(-67.5,-195,0,4,390,35,'steel');box(63.5,-195,0,4,390,35,'steel');for(let y of[-195,191])box(-63.5,y,0,127,4,35,'steel');
   box(-63.5,-191,31,17.5,382,4,'steel');box(-14,-191,31,77.5,382,4,'steel');
   const cuts=[-191,-160,-128,-64,-32,32,64,128,160,191];for(let i=0;i<cuts.length-1;i+=2)box(-46,cuts[i],31,32,cuts[i+1]-cuts[i],4,'steel');
   for(let y of[-144,-48,48,144])ring([-30,y,31],[0,0,1],16,11,7,'rubber',0,TAU,32);
   ring([34,135,35],[0,0,1],22,16,9,'steel',0,TAU,32);
  }else shell(w,d,h,4,kind==='cover'?'rubber':'steel');
  for(let y of[-d*.4,0,d*.4])for(let x of[-w*.43,w*.43])bolt(x,y,h,3,3);extent=[w+60,d+60,h+70];center=h/2;break;
 }
 case 'pan':shell(135,330,70,3,'gunmetal');for(let y=-145;y<=145;y+=48)for(let x of[-64,64])bolt(x,y,70,3,3);for(let y of[-80,0,80])box(-45,y,-2,90,4,2,'gunmetal');round([68,90,18],[1,0,0],7,7,'steel');extent=[190,380,140];center=35;break;
 case 'manifold':{
  for(let i=0;i<4;i++){let y=(i-1.5)*70;tube([[0,y,0],[10,y,30],[40,y,50],[75,y,45],[100,y,30]],13,'steel');ring([100,y,30],[25,0,-15],18,13.2,5,'steel');}box(-20,-130,-5,7,260,35,'steel');extent=[180,320,130];center=20;break;
 }
 case 'pipe':{tube([[-55,0,-25],[-40,0,5],[-15,0,22],[25,0,22],[55,0,3]],9,'rubber');ring([-55,0,-25],[.45,0,1],11,9.7,7,'steel');ring([55,0,3],[.8,0,-.5],11,9.7,7,'steel');extent=[150,75,110];center=0;break;}
 case 'plenum':box(-35,-125,-32,70,250,64,'steel',8);box(-35,-125,32,70,250,3,'steel',8);for(let y of[-90,-30,30,90])ring([35,y,-10],[1,0,0],18,13,22,'steel');extent=[160,310,120];center=0;break;
 case 'rail':round([0,-130,0],[0,1,0],10,260,'steel');for(let y of[-96,-32,32,96])ring([0,y,-10],[0,0,-1],8,4,10,'steel');for(let y of[-70,70])box(-6,y,10,12,5,20,'steel');extent=[90,320,100];center=0;break;
 case 'injector':ring([0,0,-35],[0,0,1],6,2.3,12,'chrome',0,TAU,24);round([0,0,-23],[0,0,1],11,40,'gunmetal',{seams:[3,35]});ring([0,0,17],[0,0,1],9,4,10,'steel');box(11,-5,-3,16,10,16,'rubber');ring([0,0,27],[0,0,1],10,5,3,'rubber');round([0,0,-39],[0,0,1],2,4,'chrome',{},rotor);extent=[70,70,115];center=0;break;
 case 'filter':round([0,0,-35],[0,0,1],30,65,'gunmetal',{ribs:{s0:20,s1:50,count:14,seams:true,tone:'lo'},seams:[3,60]});ring([0,0,30],[0,0,1],29,8,3,'steel',0,TAU,40);for(let i=0;i<8;i++){let a=i*TAU/8;round([18*Math.cos(a),18*Math.sin(a),33],[0,0,1],3,1,'gunmetal');}extent=[90,90,120];center=0;break;
 case 'distributor':round([0,0,-15],[0,0,1],34,30,'gunmetal',{seams:[3,27]});for(let i=0;i<4;i++){let a=i*TAU/4;ring([23*Math.cos(a),23*Math.sin(a),15],[0,0,1],7,4,19,'rubber');}round([0,0,15],[0,0,1],5,9,'chrome',{},rotor);box(-3,-3,24,6,30,3,'brass',.5,rotor);extent=[110,110,95];center=8;break;
 case 'sparkPlug':round([0,0,-39],[0,0,1],7,23,'chrome',{seams:Array.from({length:10},(_,i)=>i*2+2)});T.prism({...common('hex'),F:frame([0,0,-16]),polygon:Array.from({length:6},(_,i)=>[12*Math.cos(i*TAU/6),12*Math.sin(i*TAU/6)]),s0:0,s1:9});round([0,0,-7],[0,0,1],7,33,'steel',{seams:[7,12,17,22,27]});round([0,0,26],[0,0,1],4,11,'chrome');round([0,0,-44],[0,0,1],1.8,5,'brass');round([6,0,-44.8],[0,0,1],1.2,5.8,'chrome');box(-1.2,-1.2,-47.2,8.4,2.4,2.4,'chrome',0);extent=[65,65,110];center=0;break;
 case 'alternator':{
  ring([0,-36,0],[0,1,0],39,31,6,'steel');ring([0,30,0],[0,1,0],39,31,6,'steel');for(let i=0;i<12;i++){let a=i*TAU/12;round([35*Math.cos(a),-30,35*Math.sin(a)],[0,1,0],3,60,'steel');round([26*Math.cos(a),-25,26*Math.sin(a)],[0,1,0],4,50,'copper');}round([0,-35,0],[0,1,0],7,73,'chrome',{},rotor);round([0,38,0],[0,1,0],20,10,'gunmetal',{},rotor);for(let i=0;i<6;i++){let a=i*TAU/6;round([15*Math.cos(a),-23,15*Math.sin(a)],[0,1,0],7,46,'gunmetal',{},rotor);}extent=[120,135,120];center=0;break;
 }
 case 'sensor':round([0,0,-18],[0,0,1],6,24,'brass',{seams:[3,6,9]});T.prism({...common('hex','brass'),F:frame([0,0,6]),polygon:Array.from({length:6},(_,i)=>[11*Math.cos(i*TAU/6),11*Math.sin(i*TAU/6)]),s0:0,s1:8});box(-7,-6,14,14,12,22,'rubber');extent=[65,65,85];center=5;break;
 case 'thermostat':ring([0,0,0],[0,0,1],28,17,2,'steel');round([0,0,2],[0,0,1],17,2,'brass',{},rotor);round([0,0,-26],[0,0,1],6,26,'brass');for(let x of[-14,14])box(x-2,-2,-28,4,4,28,'steel');for(let i=0;i<24;i++){let a=i*TAU/4;round([9*Math.cos(a),9*Math.sin(a),-25+i*.8],[0,0,1],1,1.3,'chrome');}extent=[90,90,80];center=-8;break;
 case 'throttle':{
  ring([0,-18,0],[0,1,0],38,31,36,'steel',0,TAU,48);round([0,-1,0],[0,1,0],29,2,'brass',{},rotor);round([-30,0,0],[1,0,0],3,1,'chrome',{},rotor);round([29,0,0],[1,0,0],3,1,'chrome',{},rotor);box(38,-10,-10,13,20,20,'rubber');extent=[140,100,110];center=0;break;
 }
 case 'solenoid':round([0,0,-15],[0,0,1],18,35,'gunmetal',{seams:[3,30]});ring([0,0,-33],[0,0,1],7,3.3,18,'steel',0,TAU,24);box(18,-7,4,21,14,15,'rubber');round([0,0,-40],[0,0,1],3,7,'chrome',{},rotor);extent=[85,85,110];center=-5;break;
 case 'plunger':round([0,0,-25],[0,0,1],8,50,'chrome',{seams:[6,44]});round([0,0,25],[0,0,1],11,4,'steel');extent=[55,55,90];center=0;break;
 case 'diaphragm':round([0,0,-8],[0,0,1],25,16,'steel',{seams:[1,15]});round([0,0,8],[0,0,1],[25,17],10,'steel');round([0,0,18],[0,0,1],5,15,'brass');ring([0,0,-30],[0,0,1],10,4.3,22,'steel',0,TAU,24);round([0,0,-35],[0,0,1],4,5,'chrome',{},rotor);extent=[95,95,110];center=0;break;
 case 'bearingBridge':for(let y of[-144,-72,0,72,144]){ring([0,y-8,0],[0,1,0],28,20,16,'steel',Math.PI,TAU,24);for(let x of[-31.5,31.5])bolt(x,y,4,3,3);}for(let x of[-35,28])box(x,-163,-4,7,326,8,'steel',0);extent=[115,380,100];center=-7;break;
 case 'plugLead':{let points=[[-60,0,-20],[-45,0,5],[-15,0,17],[25,0,17],[55,0,0]];tube(points,2.7,'rubber');ring(points[0],[-15,0,-25],6,2.9,14,'rubber');ring(points.at(-1),[30,0,-17],6,2.9,14,'rubber');extent=[160,65,95];center=0;break;}
 case 'oilRotorPump':{
  ring([0,-10,0],[0,1,0],40,32,20,'steel',0,TAU,40);
  // Teaching section: rotor lobes and clearances illustrative, not measured pump profiles.
  for(let i=0;i<56;i++){let a=i*TAU/56,b=(i+1)*TAU/56,ra=24+Math.cos(a*7),rb=24+Math.cos(b*7);const F={o:[0,-6,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};T.prism({...common('outer-rotor','gunmetal',idler),F,polygon:[[ra*Math.cos(a),ra*Math.sin(a)],[31*Math.cos(a),31*Math.sin(a)],[31*Math.cos(b),31*Math.sin(b)],[rb*Math.cos(b),rb*Math.sin(b)]],s0:0,s1:12});}
  round([0,-6,0],[0,1,0],13,12,'chrome',{},rotor);
  for(let i=0;i<6;i++){let a=i*TAU/6;const poly=[[13,-2],[20,-3],[20,3],[13,2]].map(([r,t])=>[r*Math.cos(a)-t*Math.sin(a),r*Math.sin(a)+t*Math.cos(a)]);prism(poly,-6,12,'chrome',rotor);}extent=[120,70,120];center=0;break;
 }
 case 'vanePump':{
  ring([0,-10,0],[0,1,0],40,31,20,'steel',0,TAU,40);round([0,-6,0],[0,1,0],16,12,'gunmetal',{},rotor);
  for(let i=0;i<8;i++){let a=i*TAU/8;let poly=[[16,-1],[29,-1],[29,1],[16,1]].map(([r,t])=>[r*Math.cos(a)-t*Math.sin(a),r*Math.sin(a)+t*Math.cos(a)]);prism(poly,-6,12,'chrome',rotor);}for(let x of[-1,1])ring([x*40,0,0],[x,0,0],9,5,18,'steel');extent=[150,70,120];center=0;break;
 }
 case 'shortShaft':case 'longShaft':{const len=kind==='shortShaft'?50:80;ring([0,-len/2,0],[0,1,0],8,3,len,'chrome',0,TAU,32);round([8,0,0],[1,0,0],1.5,.1,'gunmetal');extent=[50,len+30,50];center=0;break;}
 case 'plainShaft':round([0,-145,0],[0,1,0],8,290,'chrome',{seams:[6,284]});for(let y of[-105,-35,35,105])round([8,y,0],[1,0,0],1.5,.15,'gunmetal');extent=[65,340,65];center=0;break;
 case 'balanceShaft':for(let i=0;i<5;i++){let y=-140+i*56;round([0,y,0],[0,1,0],i%2?17:10,56,'chrome');if(i%2===0)box(10,y,-10,15,56,20,'gunmetal',1);}extent=[90,340,90];center=0;break;
 case 'guide':ring([0,0,-28],[0,0,1],6.2,3.2,56,'brass',0,TAU,32);extent=[45,45,90];center=0;break;
 case 'oilCap':round([0,0,0],[0,0,1],25,10,'rubber');round([0,0,-8],[0,0,1],16,8,'rubber',{seams:[2,4,6]});for(let i=0;i<6;i++){let a=i*TAU/6;round([28*Math.cos(a),28*Math.sin(a),0],[0,0,1],3,10,'rubber');}extent=[90,90,50];center=0;break;
 case 'rimGasket':for(let x of[-58,54])box(x,-190,0,4,380,3,'rubber',0);for(let y of[-194,190])box(-58,y,0,116,4,3,'rubber',0);extent=[180,440,60];center=0;break;
 case 'portGasket':for(let y of[-105,-35,35,105])ring([0,y,0],[1,0,0],24,18,2,'steel',0,TAU,32);for(let z of[-29,25])box(0,-132,z,2,264,4,'steel',0);extent=[55,320,100];center=0;break;
 case 'timingCover':{let poly=[[-40,-65],[40,-65],[40,25],...Array.from({length:17},(_,i)=>[40*Math.cos(i*Math.PI/16),25+40*Math.sin(i*Math.PI/16)])];prism(poly,-6,12,'rubber');for(let z=-45;z<25;z+=8)box(-34,-8,z,68,2,1,'gunmetal',0);extent=[130,75,180];center=0;break;}
 case 'shield':{prism([[-70,50],[70,50],[65,-5],[35,-60],[-35,-60],[-65,-5]],-3,6,'steel');for(let x of[-48,48])round([x,-5,25],[0,1,0],5,2,'gunmetal');extent=[190,70,160];center=0;break;}
 case 'coil':round([0,0,-25],[0,0,1],24,50,'gunmetal',{seams:[3,47]});for(let i=0;i<16;i++)ring([0,0,-20+i*2.5],[0,0,1],25.5,24.5,1.4,'copper',0,TAU,16);for(let x of[-12,12])round([x,0,25],[0,0,1],4,12,'brass');extent=[90,90,110];center=0;break;
 case 'alternatorRotor':{const cuts=[-60,-30,-24,24,30,60];for(let i=1;i<cuts.length;i++)round([0,cuts[i-1],0],[0,1,0],7,cuts[i]-cuts[i-1],'chrome');}for(let y of[-30,-27,24,27])ring([0,y,0],[0,1,0],25,8,3,'steel');for(let i=0;i<6;i++){let a=i*TAU/6;for(let y=-24;y<24;y+=8)round([17*Math.cos(a),y,17*Math.sin(a)],[0,1,0],7,8,'gunmetal');}extent=[100,160,100];center=0;break;
 case 'rectifier':ring([0,0,0],[0,0,1],34,23,4,'steel',0,Math.PI*1.7,32);for(let i=0;i<6;i++){let a=(i+.5)*Math.PI*1.7/6;round([28*Math.cos(a),28*Math.sin(a),4],[0,0,1],4,6,'gunmetal');round([28*Math.cos(a),28*Math.sin(a),10],[0,0,1],1.1,7,'copper');}extent=[110,100,60];center=6;break;
 case 'distributorRotor':ring([0,0,-8],[0,0,1],12,6,16,'rubber');box(-5,12,2,10,25,5,'rubber');box(-3,25,7,6,12,2,'brass');extent=[75,100,65];center=0;break;
 case 'dipstick':box(-2,-1,-110,4,2,210,'steel',0);ring([0,0,117],[0,1,0],17,11,5,'brass',0,TAU,32);extent=[70,50,270];center=5;break;
 case 'mesh':ring([0,0,0],[0,0,1],24,21,3,'steel',0,TAU,32);for(let x=-18;x<=18;x+=3){let len=2*Math.sqrt(20*20-x*x);box(x-.3,-len/2,0,.6,len,.5,'gunmetal',0);}for(let y=-18;y<=18;y+=3){let len=2*Math.sqrt(20*20-y*y);box(-len/2,y-.3,.5,len,.6,.5,'gunmetal',0);}extent=[75,75,30];center=0;break;
 case 'distributorHousing':ring([0,0,-15],[0,0,1],34,26,32,'steel',0,TAU,40);round([0,0,-18],[0,0,1],34,3,'steel');round([0,0,-38],[0,0,1],10,20,'chrome');extent=[110,110,100];center=0;break;
 case 'distributorCap':round([0,0,-5],[0,0,1],34,15,'rubber',{seams:[3]});ring([0,0,10],[0,0,1],7,4,22,'rubber');for(let i=0;i<4;i++){let a=i*TAU/4;ring([23*Math.cos(a),23*Math.sin(a),10],[0,0,1],7,4,19,'rubber');}extent=[110,110,90];center=8;break;
 case 'capNut':{const poly=Array.from({length:6},(_,i)=>[5.8*Math.cos(i*TAU/6),5.8*Math.sin(i*TAU/6)]);T.prism({...common('hex'),F:frame(),polygon:poly,s0:0,s1:5});round([0,0,5],[0,0,1],[5,3.2],3,'chrome');extent=[30,30,30];center=3;break;}
 case 'iabBody':case 'iabGasket':iabPlate(kind==='iabBody'?18:1.2,kind==='iabBody'?'steel':'gunmetal');extent=[190,ASSUMED.pitch*4+40,80];center=5;break;
 case 'iabButterfly':round([0,0,-.8],[0,0,1],23,1.6,'brass');for(let y of[-9,9])round([0,y,.8],[0,0,1],2.2,1.3,'chrome');extent=[80,80,70];center=0;break;
 case 'iabShaft':round([0,-190,0],[0,1,0],3.4,380,'steel');prism([[-3,-3],[24,-3],[24,3],[-3,3]],190,4,'gunmetal');extent=[90,440,75];center=0;break;
 case 'iabActuator':round([0,-18,0],[0,1,0],25,18,'steel');round([0,-24,0],[0,1,0],[16,25],6,'steel');ring([0,0,0],[0,1,0],7,3.2,18,'steel',0,TAU,32);round([0,18,0],[0,1,0],3,28,'chrome',{},rotor);round([0,-35,0],[0,1,0],4,11,'brass');extent=[90,130,90];center=0;break;
 case 'vacuumTank':box(-38,-27,-22,76,54,44,'rubber',8);for(let y of[-14,14])ring([-48,y,0],[-1,0,0],4,2,10,'rubber');extent=[130,95,80];center=0;break;
 case 'flywheel':{ring([0,-9,0],[0,1,0],128,24,18,'steel',0,TAU,80);ring([0,9,0],[0,1,0],124,88,2,'chrome',0,TAU,80);for(let i=0;i<96;i++){const a=i*TAU/96;round([130*Math.cos(a),-6,130*Math.sin(a)],[0,1,0],1.5,12,'gunmetal');}extent=[300,90,300];center=0;break;}
 case 'clutchDisc':ring([0,-3,0],[0,1,0],105,72,6,'rubber',0,TAU,64);ring([0,-2,0],[0,1,0],72,28,4,'steel',0,TAU,64);ring([0,-12,0],[0,1,0],28,13,24,'gunmetal',0,TAU,64);for(let i=0;i<4;i++){const a=i*TAU/4;round([48*Math.cos(a),2,48*Math.sin(a)],[0,1,0],9,5,'brass');}extent=[250,70,250];center=0;break;
 case 'clutchPressurePlate':ring([0,-10,0],[0,1,0],118,91,20,'steel',0,TAU,64);ring([0,10,0],[0,1,0],110,63,8,'gunmetal',0,TAU,64);for(let i=0;i<18;i++){const a=i*TAU/18;prism([[20,-2],[62,-5],[62,5],[20,2]].map(([r,t])=>[r*Math.cos(a)-t*Math.sin(a),r*Math.sin(a)+t*Math.cos(a)]),18,3,'steel');}extent=[280,90,280];center=0;break;
 case 'strainer':{
  ring([0,0,0],[0,0,1],30,27,8,'steel',0,TAU,40);for(let x=-24;x<=24;x+=6){let len=2*Math.sqrt(26*26-x*x);box(x-0.5,-len/2,0,1,len,1,'gunmetal',0);}for(let y=-24;y<=24;y+=6){let len=2*Math.sqrt(26*26-y*y);box(-len/2,y-0.5,1,len,1,1,'gunmetal',0);}tube([[0,0,8],[0,0,30],[30,0,45],[60,0,45]],6,'steel');extent=[135,85,95];center=20;break;
 }
 default:throw new Error(`Unsupported Anatomy figure kind: ${kind}`);
 }
 return{extent,center,parts:idx};
}
export function buildFigure(rawKind,entry){
 if(typeof rawKind==='object'){entry=rawKind;rawKind=entry.kind;}
 const kind=resolve(rawKind,entry);if(cache.has(kind))return cache.get(kind);
 // Build the geometry with a neutral projection, then fit the same scene for every state.
 let P={origin:[360,270],scale:2,azimuth:40,elevation:28};
 let T=turning(P);let meta=recipe(T,kind);
 const [w,d,h]=meta.extent;const points=k.boxCorners({x:-w/2,y:-d/2,w,d,r:0},meta.center-h/2,meta.center+h/2);
 P=k.fitProjection(points,720,540,{pad:45,azimuth:40,elevation:28});
 T=turning(P);meta=recipe(T,kind);
 const poses=[];for(let i=0;i<12;i++)poses.push(figureValues(kind,{angle:i*30,phase:i/12}));
 const out=T.build({poses,strict:true});
 const scene=TURN.prepare(out.data),frames=scene.runs.map(r=>TURN.frame(r));let bounds=[Infinity,Infinity,-Infinity,-Infinity];
 for(let j=0;j<16;j++)for(let angle of [0,45,90,135,180,225,270,315]){const cams=TURN.cams(scene,figureValues(kind,{phase:j/16,angle,entry}));for(const r of scene.runs){const f=TURN.emit(r,cams[r.group],frames[r.index]);if(f.box.every(Number.isFinite)){bounds[0]=Math.min(bounds[0],f.box[0]);bounds[1]=Math.min(bounds[1],f.box[1]);bounds[2]=Math.max(bounds[2],f.box[2]);bounds[3]=Math.max(bounds[3],f.box[3]);}}}
 const factor=Math.min(620/(bounds[2]-bounds[0]),440/(bounds[3]-bounds[1]));const oldP=out.data.P;
 out.data.P={...oldP,scale:oldP.scale*factor,origin:[360+(oldP.origin[0]-(bounds[0]+bounds[2])/2)*factor,270+(oldP.origin[1]-(bounds[1]+bounds[3])/2)*factor]};
 const value={kind,width:720,height:540,data:out.data,markup:out.layerSvg('subject',{width:720,height:540}),css:k.ISO_CSS+'\n'+TURN_CSS,report:out.report,parts:meta.parts};
 cache.set(kind,value);return value;
}
// CPU-only deterministic SVG; SVG paths and shading are emitted by Anatomy TURN.
const PALETTES={steel:['#8f959b','#a4aaaf','#b8bdc1','#cdd1d4','#e5e8ea'],chrome:['#a2a9b0','#6f767d','#454b52','#cacfd4','#f7f8f9'],gunmetal:['#2f3439','#393f45','#444a51','#50575e','#5f666e'],rubber:['#1b1c1e','#222326','#2a2b2e','#34363a','#46484d'],brass:['#8a6a2c','#a47f38','#bd9646','#d2ad5b','#e6c87e'],copper:['#7c4128','#9a5132','#b3633e','#c9784f','#df9670']};
function mix(a,b,t){const n=v=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16));let A=n(a),B=n(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function markup(run,f,theme){const part=run.part;let pal=PALETTES[part.mat||part.material]||PALETTES.steel;if(theme==='dark')pal=pal.map(c=>mix('#10171d',c,.64));const ink=theme==='dark'?'#cad3db':'#35424b';let out='';for(let i=0;i<run.roles.length;i++){const r=run.roles[i],d=esc(f.d[i]||'');let fill='none',stroke='none',opacity=f.o[i]??1,extra='';if(r.type==='face'){const b=Math.min(3,Math.floor(f.q[i]/TURN.q));fill=mix(pal[b],pal[b+1],(f.q[i]-TURN.q*b)/TURN.q);stroke=fill;}else if(r.type==='dot'){out+=`<circle cx="${f.cx[i]}" cy="${f.cy[i]}" r="${r.size}" fill="${ink}" opacity="${opacity}"/>`;continue;}else if(r.type==='plane'){const p=part.planes[Number(r.name.slice(5))];out+=`<g transform="${f.t[i]}" opacity="${opacity}">${p.svg}</g>`;continue;}else if(r.type==='xform'){fill=pal[4];out+=`<path d="${esc(part.planPath)}" transform="${f.t[i]}" fill="${fill}"/>`;continue;}else if(r.cls==='iso-fill')fill=pal[2];else if(r.cls==='iso-top')fill=pal[4];else if(r.cls==='iso-shade')fill=pal[r.shade];else if(r.cls?.includes('iso-line'))stroke=ink;else if(r.cls==='tb-body')fill=pal[2];else if(r.cls==='tb-shine')fill=pal[4];else if(r.cls==='tb-shade')fill=pal[0];if(r.cls?.includes('iso-line')&&r.tone==='faint')opacity*=.45;if(part.name.includes('.annulus.')&&r.cls?.includes('iso-edge'))opacity*=.16;out+=`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${r.type==='face'?.35:.55}" stroke-linejoin="round" opacity="${opacity}" ${extra}/>`;}return`<g data-name="${esc(part.name)}">${out}</g>`;}
const cpuCache=new Map();
export function renderSvg(rawKind,{phase=0,angle=0,theme='light',width=720,height=540,entry}={}){
 if(typeof rawKind==='object'){entry=rawKind;rawKind=entry.kind;}const kind=resolve(rawKind,entry);const figure=buildFigure(rawKind,entry);let cached=cpuCache.get(kind);if(!cached){const scene=TURN.prepare(figure.data);cached={scene,frames:scene.runs.map(r=>TURN.frame(r))};cpuCache.set(kind,cached);}const{scene,frames}=cached;
 const cams=TURN.cams(scene,figureValues(kind,{phase,angle,entry}));for(const r of scene.runs)TURN.emit(r,cams[r.group],frames[r.index]);let html='';for(const layer of scene.layers){const order=TURN.order(layer,frames,cams,layer.rest,{},scene);html+=Array.from(order,i=>markup(scene.runs[i],frames[i],theme)).join('');}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 ${(540-720*height/width)/2} 720 ${720*height/width}"><rect width="720" height="540" fill="${theme==='dark'?'#17212a':'#edf0ed'}"/><g transform="translate(360 270) scale(${Math.min(1,Math.max(.25,(720*height/width-24)/450))}) translate(-360 -270)">${html}</g></svg>`;
}
