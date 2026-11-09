import {TURN} from './vendor/turn.mjs';
import {SPEC,ASSUMED,RATIO,PULLEY} from '../engine-spec.js';
import {lobeLift} from '../kin.js';
const TAU=Math.PI*2;
const aliases={ring:'compressionRing',oilring:'oilRing',camshaft:'shaft',oilPump:'pump',waterPump:'pump',psPump:'pump',hose:'pipe',lead:'pipe',intakerunner:'manifold',sparkplug:'sparkPlug',toothedpulley:'pulley'};
const E=[1,0,0,0,1,0,0,0,1];
export function figureValues(rawKind,{phase=0,angle=0,entry,iab}={}){
 const kind=aliases[rawKind]||rawKind,p=((phase%1)+1)%1,t=phase*TAU*2;
 let work={R:[...E],t:[0,0,0]},rotor={R:[...E],t:[0,0,0]},idler={R:[...E],t:[0,0,0]};
 const spin=(axis,deg)=>({R:TURN.rotation(axis,deg),t:[0,0,0]});
 if(entry?.motion?.type==='fixed')return {orbit:angle,work,rotor,idler};
 // Pressure/thermal/control components use a state demonstration, independent
 // of crank timing. Only the actual valve train uses the canonical cam events.
 const stateChange=(1-Math.cos(p*TAU))/2;
 const profile=entry?.id?.includes('exhaust')?'exhaust':'intake';
 const valveLift=lobeLift(profile,p*720),r=SPEC.stroke/2,l=ASSUMED.rod;
 if(['piston','compressionRing','oilRing','pin'].includes(kind)){
  const travel=r*(1-Math.cos(t))+l-Math.sqrt(l*l-r*r*Math.sin(t)**2);work.t=[0,0,-travel+r];
 }
 if(kind==='rod'||kind==='rodCap'||entry?.id==='bearing-rod'||entry?.id==='bolt-connecting-rod'){
  const beta=Math.asin(r/l*Math.sin(t)),R=TURN.rotation([0,1,0],beta*180/Math.PI),z0=kind==='rod'?-60:0;
  work={R,t:[-r*Math.sin(t)-R[2]*z0,0,z0+r*Math.cos(t)-R[8]*z0]};
 }
 if(['crankshaft','flywheel','clutchDisc','clutchPressurePlate'].includes(kind))work=spin([0,1,0],-phase*720);
 if(['pulley','groovedPulley','belt'].includes(kind)){
  let ratio=1;
  if(entry?.id==='pulley-camshaft')ratio=RATIO.cam;
  if(entry?.id==='pulley-power-steering')ratio=PULLEY.crank/PULLEY.powerSteering;
  work=spin([0,1,0],-phase*720*ratio);
 }
 if(kind==='shaft')work=spin([0,1,0],-phase*720*RATIO.cam);
 if(kind==='balanceShaft'||entry?.id?.startsWith('shaft-balance'))work=spin([0,1,0],-phase*720*(entry?.id==='shaft-balance-rear'?RATIO.balanceRear:RATIO.balanceFront));
 if(['plainShaft','shortShaft','longShaft'].includes(kind))work={R:[...E],t:[0,0,0]};
 if(kind==='valve'||kind==='retainer'||kind==='keeper')work.t=[0,0,-ASSUMED.liftScale*valveLift];
 if(kind==='spring'){
  const lift=entry?.id?.startsWith('spring-valve')?valveLift:stateChange;
  work={R:[1,0,0,0,1,0,0,0,1-.22*lift],t:[0,0,0]};
 }
 if(kind==='rocker'||entry?.id==='screw-valve-lash')work=spin([0,1,0],14*valveLift);
 if(['pump','alternator','oilRotorPump','vanePump'].includes(kind))rotor=spin([0,1,0],-phase*720);
 if(kind==='oilRotorPump')idler=spin([0,1,0],-phase*720*6/7);
 if(kind==='alternatorRotor')work=spin([0,1,0],-phase*720*PULLEY.crank/PULLEY.alternator);
 if(kind==='distributor')rotor=spin([0,1,0],-phase*720*RATIO.distributor);
 if(kind==='distributorRotor'||entry?.id==='rotor-distributor')work=spin([0,0,1],-phase*720*RATIO.distributor);
 if(kind==='throttle')rotor=spin([1,0,0],75*stateChange);
 if(kind==='injector'||kind==='solenoid'||kind==='diaphragm')rotor.t=[0,0,3*stateChange];
 if(kind==='plunger')work.t=[0,0,8*stateChange];
 if(kind==='thermostat')rotor.t=[0,0,8*stateChange];
 const opening=Number.isFinite(iab)?Math.max(0,Math.min(1,iab)):stateChange;
 if(kind==='iabButterfly'||kind==='iabShaft')work=spin([0,1,0],-90*opening);
 if(kind==='iabActuator')rotor.t=[0,8*opening,0];
 return {orbit:angle,work,rotor,idler};
}
