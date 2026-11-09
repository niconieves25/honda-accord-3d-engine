/** Convert Anatomy TURN solids into the same physically lit Three.js material
 * vocabulary as engine.js. Geometry remains in millimetres; output is Y-up.
 * No SVG paths, strokes or painted shading bands are used by this renderer.
 */
import * as THREE from 'three';
import {mergeGeometries,toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {TURN} from './vendor/turn.mjs';
import {figureValues} from './motion.mjs';

const V=THREE.Vector3;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const defaultFrame={o:[0,0,0],u:[1,0,0],v:[0,1,0],a:[0,0,1]};
const asVec=a=>new V(...a);
function basisMatrix(F=defaultFrame){
  return new THREE.Matrix4().set(F.u[0],F.v[0],F.a[0],F.o[0], F.u[1],F.v[1],F.a[1],F.o[1], F.u[2],F.v[2],F.a[2],F.o[2], 0,0,0,1);
}
function prismGeometry(spec){
  const ring=spec.ring,shape=new THREE.Shape();
  for(let i=0;i<ring.length;i+=2)i?shape.lineTo(ring[i],ring[i+1]):shape.moveTo(ring[i],ring[i+1]);shape.closePath();
  const s0=spec.up?spec.z0:spec.s0,s1=spec.up?spec.z1:spec.s1;
  const g=new THREE.ExtrudeGeometry(shape,{depth:s1-s0,bevelEnabled:false,steps:1,curveSegments:1});
  g.translate(0,0,s0);g.applyMatrix4(basisMatrix(spec.up?defaultFrame:spec.F));return g;
}
function roundGeometry(spec){
  const length=spec.s1-spec.s0,segments=clamp(Math.ceil(Math.max(spec.r0,spec.r1)*3),48,128);
  const open=spec.ends.some(e=>e!=='flat');
  const g=new THREE.CylinderGeometry(spec.r1,spec.r0,length,segments,1,open);
  g.rotateX(Math.PI/2); // Cylinder +Y becomes Anatomy +Z.
  g.translate(0,0,(spec.s0+spec.s1)/2);g.applyMatrix4(basisMatrix(spec.F));
  if(!open)return g;
  const pieces=[g];
  for(let i=0;i<2;i++){
    const end=spec.ends[i],s=i?spec.s1:spec.s0,r=i?spec.r1:spec.r0;
    if(end==='open')continue;
    let cap;
    if(end==='dome'){
      cap=new THREE.SphereGeometry(r,segments,24,0,Math.PI*2,0,Math.PI/2);
      cap.rotateX(i?Math.PI/2:-Math.PI/2);
    }else{cap=new THREE.CircleGeometry(r,segments);if(!i)cap.rotateY(Math.PI);}
    cap.translate(0,0,s);cap.applyMatrix4(basisMatrix(spec.F));pieces.push(cap);
  }
  const merged=mergeGeometries(pieces.map(p=>p.index?p.toNonIndexed():p),false);pieces.forEach(p=>p.dispose());return merged;
}
class RouteCurve extends THREE.Curve {
  constructor(points,from=0,to=Infinity){super();this.points=typeof points[0]==='number'?Array.from({length:points.length/3},(_,i)=>new V(points[i*3],points[i*3+1],points[i*3+2])):points.map(asVec);this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths[i-1]+this.points[i].distanceTo(this.points[i-1]));this.from=Math.max(0,from);this.to=Math.min(to,this.lengths.at(-1));this.span=this.to-this.from;}
  atDistance(d,target=new V()){
    d=clamp(d,0,this.lengths.at(-1));let i=1;while(i<this.lengths.length-1&&this.lengths[i]<d)i++;
    const t=(d-this.lengths[i-1])/(this.lengths[i]-this.lengths[i-1]||1);return target.copy(this.points[i-1]).lerp(this.points[i],t);
  }
  getPoint(t,target=new V()){return this.atDistance(this.from+clamp(t,0,1)*this.span,target);}
  getPointAt(t,target=new V()){return this.getPoint(t,target);}
  getTangent(t,target=new V()){const d=this.from+clamp(t,0,1)*this.span,delta=Math.min(.4,this.span*.01);return target.copy(this.atDistance(d+delta)).sub(this.atDistance(d-delta)).normalize();}
  getTangentAt(t,target=new V()){return this.getTangent(t,target);}
}
function tubeGeometry(route,from,to,cap0,cap1){
  const curve=new RouteCurve(route.points,from,to),segments=clamp(Math.ceil(curve.span/1.8),12,640);
  const tube=new THREE.TubeGeometry(curve,segments,route.r,24,false),pieces=[tube];
  for(const end of [0,1])if(end?cap1:cap0){
    const cap=new THREE.CircleGeometry(route.r,24),normal=curve.getTangent(end).multiplyScalar(end?1:-1);
    cap.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,0,1),normal));cap.translate(...curve.getPoint(end).toArray());pieces.push(cap);
  }
  const merged=mergeGeometries(pieces.map(p=>p.index?p.toNonIndexed():p),false);pieces.forEach(p=>p.dispose());return merged;
}
function microTexture(){
  // Subtle cast-surface grain; deterministic and DOM-free for CPU verification.
  const pixels=new Uint8Array(64*64*4);let seed=962;
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)|0;const c=105+((seed>>>24)&47);pixels[i]=pixels[i+1]=pixels[i+2]=c;pixels[i+3]=255;}
  const tex=new THREE.DataTexture(pixels,64,64,THREE.RGBAFormat);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,3);tex.needsUpdate=true;return tex;
}
const MATERIALS={
  cast:{color:'#8d9094',roughness:.8,metalness:.45},
  castLight:{color:'#9b9ea2',roughness:.74,metalness:.45},
  cover:{color:'#a2a29b',roughness:.5,metalness:.55},
  steel:{color:'#c4c7cc',roughness:.3,metalness:1},
  chrome:{color:'#c9ccd1',roughness:.25,metalness:.95},
  gunmetal:{color:'#55585d',roughness:.45,metalness:.9},
  rubber:{color:'#141416',roughness:.9,metalness:0},
  copper:{color:'#a8392a',roughness:.45,metalness:.6},
  brass:{color:'#b8a06a',roughness:.4,metalness:.9},
  gold:{color:'#b8a06a',roughness:.4,metalness:.9},
  piston:{color:'#d2d4d7',roughness:.35,metalness:.85},
  ceramic:{color:'#efece6',roughness:.4,metalness:0},
};
function materialKey(part,entry){
  const m=part.mat||part.material||'steel';
  if(entry?.kind==='piston'&&m==='steel')return'piston';
  if(entry?.kind==='sparkPlug'&&m==='steel')return'ceramic';
  if(entry?.kind==='valveCover'&&m==='steel')return'cover';
  if(m==='steel'&&['block','head','plenum','manifold','oilPump','waterPump','psPump','alternator','strainer'].includes(entry?.kind))return'castLight';
  return MATERIALS[m]?m:'steel';
}
function cleanForMerge(geometry){
  let g=geometry.index?geometry.toNonIndexed():geometry;
  if(g!==geometry)geometry.dispose();
  // All primitives share one attribute contract; renderer normals are regenerated.
  for(const name of Object.keys(g.attributes))if(name!=='position')g.deleteAttribute(name);
  return g;
}

/** @param {object} figure A resolved scene from scenes.json (or its .data).
 * @returns {{root:THREE.Group,update:Function,dispose:Function,units:string}}
 */
export function buildAnatomyMesh(figure,entry){
  const data=figure?.data||figure;
  if(!data?.parts||!data?.groups)throw new Error('buildAnatomyMesh requires a resolved Anatomy scene.');
  const kind=figure.kind||entry?.kind;
  const root=new THREE.Group();root.name=`anatomy-realistic-${entry?.id||kind||'part'}`;
  root.userData.units='mm';root.userData.source='Anatomy TURN geometry';
  // Right handed conversion: x→x, z(up)→y, -y(timing end)→z.
  const orientation=new THREE.Group();orientation.rotation.x=-Math.PI/2;root.add(orientation);
  const groups=data.groups.map(g=>{const node=new THREE.Group();node.name=g.name;node.matrixAutoUpdate=false;orientation.add(node);return node;});
  const statics=new THREE.Group();statics.name='static';orientation.add(statics);
  const bins=new Map(),tubeBins=new Map(),materials=new Map(),resources=new Set();let bump=null;
  const material=(key)=>{
    if(!materials.has(key)){const m=new THREE.MeshStandardMaterial({...MATERIALS[key],side:THREE.DoubleSide});m.name=`engine-${key}`;
      if(key==='cast'||key==='castLight'){bump??=microTexture();m.bumpMap=bump;m.bumpScale=.08;}
      materials.set(key,m);
    }return materials.get(key);
  };
  const put=(g,part)=>{const key=materialKey(part,entry),binKey=`${part.group??-1}:${key}`;if(!bins.has(binKey))bins.set(binKey,{group:part.group??-1,key,geometries:[],names:[]});const b=bins.get(binKey);b.geometries.push(cleanForMerge(g));b.names.push(part.name);};
  try {
    for(const part of data.parts){
      if(part.kind==='prism')put(prismGeometry(part.spec),part);
      else if(part.kind==='round')put(roundGeometry(part.spec),part);
      else if(part.kind==='tube'){
        const key=`${part.group}:${part.spec.route}:${materialKey(part,entry)}`;
        if(!tubeBins.has(key))tubeBins.set(key,{part,route:data.routes[part.spec.route],ranges:[]});
        tubeBins.get(key).ranges.push({from:part.spec.from,to:part.spec.to,cap0:!part.spec.open0&&part.spec.caps?.[0]!==false,cap1:!part.spec.open1&&part.spec.caps?.[1]!==false});
      }else throw new Error(`Unsupported Anatomy primitive: ${part.kind} (${part.name})`);
    }
    // Merge neighbouring chunks from the same route before meshing: continuous,
    // smooth hoses/springs rather than a chain of shaded SVG cylinders.
    for(const {part,route,ranges} of tubeBins.values()){
      ranges.sort((a,b)=>a.from-b.from);const runs=[];
      for(const r of ranges){const prev=runs.at(-1);if(prev&&r.from<=prev.to+.02){prev.to=Math.max(prev.to,r.to);prev.cap1=r.cap1;}else runs.push({...r});}
      for(const r of runs)put(tubeGeometry(route,r.from,r.to,r.cap0,r.cap1),part);
    }
    for(const bin of bins.values()){
      const merged=mergeGeometries(bin.geometries,false);bin.geometries.forEach(g=>g.dispose());
      if(!merged)throw new Error(`Could not combine Anatomy ${bin.key} geometry.`);
      const smooth=toCreasedNormals(merged,Math.PI/5);if(smooth!==merged)merged.dispose();
      const positions=smooth.getAttribute('position'),uv=new Float32Array(positions.count*2);for(let i=0;i<positions.count;i++){uv[2*i]=positions.getX(i)*.025;uv[2*i+1]=(positions.getY(i)+positions.getZ(i))*.025;}smooth.setAttribute('uv',new THREE.BufferAttribute(uv,2));
      smooth.computeBoundingBox();smooth.computeBoundingSphere();resources.add(smooth);
      const mesh=new THREE.Mesh(smooth,material(bin.key));mesh.name=`${bin.key}-${bin.group}`;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.part=entry?.id;mesh.userData.anatomyParts=bin.names;
      (groups[bin.group]||statics).add(mesh);
    }
  }catch(error){for(const b of bins.values())b.geometries.forEach(g=>g.dispose());resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());bump?.dispose();throw error;}
  let state={phase:0,angle:0,entry},disposed=false;
  function update(next={}){
    if(disposed)return;state={...state,...next};
    const poses=TURN.poses(data.groups,figureValues(kind,state));
    for(let i=0;i<data.groups.length;i++){const pose=poses.get(data.groups[i].name),R=pose.R,t=pose.t;groups[i].matrix.set(R[0],R[1],R[2],t[0],R[3],R[4],R[5],t[1],R[6],R[7],R[8],t[2],0,0,0,1);groups[i].matrixWorldNeedsUpdate=true;}
    root.updateMatrixWorld(true);
  }
  function dispose(){if(disposed)return;disposed=true;resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());bump?.dispose();root.clear();}
  update();return{root,update,dispose,units:'mm'};
}
