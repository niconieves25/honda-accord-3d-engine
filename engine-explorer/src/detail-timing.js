// Positive-drive detail for the timing and balance belts. The OEM timing drawing
// establishes transverse teeth, not the counts/profile dimensions below. Existing
// approximate pulley centres and wrap routes are retained. Drawn pitch is 2π mm;
// each closed belt adjusts it slightly to fit a whole number of teeth. This is
// qualitative mechanical illustration, not an OEM replacement-belt specification.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const D2R = Math.PI / 180;
const wrap = (a,b) => ((a%b)+b)%b;

// Arc-length sampling of the existing polygonal belt outline. Its convex-hull
// winding is counterclockwise, so positive distance follows the crank rotation
// when viewed from the timing end. A perpendicular to the left points inward.
export function beltTrack(loop) {
  const segments=[];
  let length=0;
  loop.forEach(([x,y],i)=>{
    const next=loop[(i+1)%loop.length],dx=next[0]-x,dy=next[1]-y,span=Math.hypot(dx,dy);
    if(span>1e-8){segments.push({x,y,tx:dx/span,ty:dy/span,start:length,span});length+=span;}
  });
  if(!segments.length)throw new Error('A belt path must contain non-zero segments');
  return {length,sample(distance,target={}) {
    const d=wrap(distance,length);
    let low=0,high=segments.length-1;
    while(low<high){const mid=(low+high+1)>>1;if(segments[mid].start<=d)low=mid;else high=mid-1;}
    const s=segments[low],along=d-s.start;
    target.x=s.x+s.tx*along;target.y=s.y+s.ty*along;target.tx=s.tx;target.ty=s.ty;
    return target;
  }};
}

function ringGeometry(outer,inner,width) {
  const shape=new THREE.Shape();shape.absarc(0,0,outer,0,TAU,false);
  const hole=new THREE.Path();hole.absarc(0,0,inner,0,TAU,true);shape.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,curveSegments:48});
  return g.translate(0,0,-width/2);
}

// The tooth profile varies around the circumference, and spans the whole pulley
// width. This replaces the old lathed grooves that ran around the pulley instead.
function sprocketGeometry(radius,width,count,bore,depth=2.1) {
  const shape=new THREE.Shape(),root=radius-depth;
  for(let k=0;k<count;k++)for(const [u,r] of [[0,root],[.13,root],[.26,radius],[.64,radius],[.77,root]]) {
    const a=(k+u)/count*TAU,x=Math.cos(a)*r,y=Math.sin(a)*r;
    k===0&&u===0?shape.moveTo(x,y):shape.lineTo(x,y);
  }
  shape.closePath();
  const hole=new THREE.Path();hole.absarc(0,0,bore,0,TAU,true);shape.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,curveSegments:32});
  return g.translate(0,0,-width/2);
}

export function detailTiming(ctx) {
  const {G,M,L,PULLEY,beltPath,crankTiming,wpPulley,crankBal,balFPulley,balInputPulley,balInputGear,balRGear,camPulley}=ctx;
  const replace=(mesh,geometry)=>{mesh.geometry=geometry;};
  const cr=PULLEY.crankTiming/2,cam=PULLEY.camTiming/2,wp=PULLEY.waterPump/2;
  const cb=PULLEY.crankBalancer/2,bf=PULLEY.balancer/2;
  // Counts preserve the illustrated 2:1 cam and 1:2 balance-drive ratios. None is
  // presented as a measured Honda tooth count. Mesh references remain unchanged.
  replace(crankTiming,sprocketGeometry(cr,22,Math.round(cr),19.2));
  replace(wpPulley,sprocketGeometry(wp,20,Math.round(wp),6.5));
  replace(crankBal,sprocketGeometry(cb,14,Math.round(cb),19.2));
  replace(balFPulley,sprocketGeometry(bf,14,Math.round(bf),10.2,1.8));

  replace(balInputPulley,sprocketGeometry(bf,14,Math.round(bf),6,1.8));
  replace(balRGear,sprocketGeometry(19,12,24,7,2));
  replace(balInputGear,sprocketGeometry(19,12,24,7,2));
  // Keep the perforated cam wheel and its rotating parent. Lower the old solid
  // rim to the tooth roots so it no longer fills the tooth-space openings.
  for(const mesh of camPulley.children) {
    const options=mesh.geometry?.parameters?.options;
    if(mesh.geometry?.type!=='ExtrudeGeometry'||!options)continue;
    if(options.depth===22)replace(mesh,ringGeometry(cam-2.1,49,22));
    if(options.depth===20) {
      replace(mesh,sprocketGeometry(cam,20,Math.round(cam),49));
      mesh.position.z=0;
    }
  }
  const toothMaterial=M.rubber.clone();toothMaterial.color.set('#292c30');
  const moving=[];
  const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(1,1,1);
  const rotation=new THREE.Quaternion(),axis=new THREE.Vector3(0,0,1),point={};
  function addBelt(id,loop,z,width,crankRadius,depth) {
    const track=beltTrack(loop),count=Math.max(8,Math.round(track.length/TAU)),pitch=track.length/count;
    const geometry=new THREE.BoxGeometry(pitch*.49,depth,width-.8);
    const mesh=new THREE.InstancedMesh(geometry,toothMaterial,count);
    mesh.name=id+'Teeth';mesh.userData.part=id;mesh.userData.crankDriven=true;
    mesh.userData.toothCount=count;mesh.userData.trackLength=track.length;
    mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // A separate parent prevents future static batches from baking instances.
    const group=new THREE.Group();group.name=id+'MovingTeeth';G[id].add(group);group.add(mesh);
    moving.push({mesh,track,count,pitch,z,crankRadius,depth});
  }
  addBelt('timingBelt',beltPath([[0,0,cr],[...L.wp,wp],[0,L.camY,cam],[...L.tens,26]]),L.beltZ,22,cr,1.9);
  addBelt('balancerBelt',beltPath([[0,0,cb],[...L.balF,bf],[...L.balDrive,bf],[...L.balAdj,18]]),L.balZ,14,cb,1.6);

  // No independent elapsed-time clock: seeking, reverse stepping and pausing
  // all use exactly the same crank angle as the rods/cam/pulleys.
  const updateTiming=th=>{
    for(const b of moving) {
      const travel=th*D2R*b.crankRadius;
      for(let i=0;i<b.count;i++) {
        b.track.sample(i*b.pitch+travel,point);
        position.set(point.x-point.ty*b.depth*.47,point.y+point.tx*b.depth*.47,b.z);
        rotation.setFromAxisAngle(axis,Math.atan2(point.ty,point.tx));
        matrix.compose(position,rotation,scale);b.mesh.setMatrixAt(i,matrix);
      }
      b.mesh.instanceMatrix.needsUpdate=true;
    }
  };
  updateTiming(0);
  // Fixed conservative bounds encompass the whole closed route at every phase.
  // Reusing these bounds avoids per-frame bounding-box work and incorrect culling.
  for(const {mesh,track,z,depth} of moving) {
    const box=new THREE.Box3();
    for(let i=0;i<512;i++){track.sample(i/512*track.length,point);box.expandByPoint(new THREE.Vector3(point.x,point.y,z));}
    box.expandByScalar(24+depth);mesh.boundingBox=box;mesh.boundingSphere=box.getBoundingSphere(new THREE.Sphere());
  }
  return updateTiming;
}
