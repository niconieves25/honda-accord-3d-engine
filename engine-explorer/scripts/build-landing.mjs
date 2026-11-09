import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {project,presentationCss} from './presentation.mjs';

const result=await build({entryPoints:[path.join(project,'landing/main.js')],bundle:true,minify:true,format:'esm',write:false,target:'es2022',legalComments:'none'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const template=fs.readFileSync(path.join(project,'landing/index.html'),'utf8');
const html=template.replace('/* LANDING_STYLES */',presentationCss('landing')).replace('/* LANDING_SCRIPT */',js);
fs.writeFileSync(path.join(project,'../index.html'),html);
console.log(`Built landing · ${(Buffer.byteLength(html)/1024).toFixed(0)} KB`);
