import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {project,presentationCss} from './presentation.mjs';
const result=await build({entryPoints:[path.join(project,'app/main.js')],bundle:true,minify:true,format:'esm',write:false,target:'es2022',legalComments:'none'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="Honda F22A6 · Accord EX 1993 · Motor interactivo / Interactive engine · Español / English"><title>Explorador Honda F22A6</title><style>${presentationCss('app')}</style></head><body><div id="app"></div><script type="module">${js}</script></body></html>`;
fs.writeFileSync(path.join(project,'index.html'),html);
console.log(`Built index.html · ${(Buffer.byteLength(html)/1024).toFixed(0)} KB`);
