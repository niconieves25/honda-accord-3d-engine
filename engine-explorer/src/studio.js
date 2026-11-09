// One photographic finish for the assembled engine and its individual parts.
import * as THREE from 'three';

export const BACKDROP = {dark:'#08090c',light:'#f4f4f2',soft:'#d9dbde'};

export function configureStudioRenderer(renderer) {
  renderer.toneMapping=THREE.NeutralToneMapping;
  renderer.toneMappingExposure=.95;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFShadowMap;
}

export function addStudioLighting(renderer,scene) {
  const env=new THREE.Scene();env.background=new THREE.Color('#9a9da2');
  const panel=(w,h,pos,intensity)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(1,1,1).multiplyScalar(intensity),side:THREE.DoubleSide}));
    m.position.fromArray(pos);m.lookAt(0,0,0);env.add(m);
  };
  panel(10,10,[0,12,2],2.2);panel(3,12,[-10,3,6],2.6);
  panel(3,12,[10,3,-4],1.8);panel(16,2,[0,1,12],1.3);
  const pm=new THREE.PMREMGenerator(renderer),target=pm.fromScene(env,.03);
  scene.environment=target.texture;scene.environmentIntensity=.75;pm.dispose();
  env.traverse(m=>{if(m.isMesh){m.geometry.dispose();m.material.dispose();}});
  const key=new THREE.DirectionalLight('#ffffff',2);
  key.position.set(1.4,3,1.6);key.castShadow=true;
  Object.assign(key.shadow.camera,{left:-.7,right:.7,top:.7,bottom:-.7,near:.5,far:8});
  key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.00015;key.shadow.normalBias=.0008;
  const fill=new THREE.DirectionalLight('#dfe8ff',1);fill.position.set(-2,1.2,-1.2);
  const hemi=new THREE.HemisphereLight('#ffffff','#66696d',.65);
  const rim=new THREE.DirectionalLight('#fff3df',.7);rim.position.set(1,1.2,-2);
  scene.add(key,key.target,fill,hemi,rim);
  return {key,dispose(){target.dispose();key.shadow.map?.dispose();scene.remove(key,key.target,fill,hemi,rim);scene.environment=null;}};
}
