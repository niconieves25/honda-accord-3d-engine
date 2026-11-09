#!/usr/bin/env node
// CPU raster check of the full motion envelope at the actual video aspect ratio.
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {CATALOG} from '../src/anatomy/catalog.js';
import {renderSvg} from '../src/anatomy/figures.mjs';
const require=createRequire(import.meta.url);
let sharp;
for(const candidate of [process.env.SHARP_MODULE,'sharp',path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')].filter(Boolean)){
  try{sharp=require(candidate);break;}catch{}
}
if(!sharp)throw new Error('Sharp required.');
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const only=process.argv.slice(2);
const entries=CATALOG.filter(e=>!only.length||only.includes(e.id));
const W=720,H=308,report=[];
for(const entry of entries){
  const states=[];
  for(const phase of [0,.125,.25,.375,.5,.625,.75,.875,.999]){
    const fixed=entry.motion.type==='fixed';
    const svg=renderSvg(entry.kind,{entry,phase:fixed?0:phase,angle:fixed?32*Math.sin(phase*Math.PI*2):0,theme:'light',width:W,height:H});
    const pixels=await sharp(Buffer.from(svg)).flatten({background:'#edf0ed'}).removeAlpha().raw().toBuffer();
    const bg=[237,240,237];
    let x0=W,y0=H,x1=0,y1=0,count=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=(y*W+x)*3;
      if(Math.abs(pixels[i]-bg[0])+Math.abs(pixels[i+1]-bg[1])+Math.abs(pixels[i+2]-bg[2])<24)continue;
      x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);count++;
    }
    states.push({phase,bounds:[x0,y0,x1,y1],pixels:count,clipped:count>0&&(x0<2||y0<2||x1>=W-2||y1>=H-2),empty:count<20});
  }
  const failures=states.filter(s=>s.clipped||s.empty);
  report.push({id:entry.id,states,pass:!failures.length});
  if(failures.length)console.log(`${entry.id}: ${JSON.stringify(failures)}`);
}
await fs.mkdir(path.join(project,'.build'),{recursive:true});
await fs.writeFile(path.join(project,'.build/anatomy-video-framing.json'),JSON.stringify(report,null,2)+'\n');
const failures=report.filter(r=>!r.pass);
console.log(`${report.length-failures.length}/${report.length} figures fit the 720×308 video field through 9 operating / inspection poses.`);
if(failures.length)process.exitCode=1;
