#!/usr/bin/env node
/**
 * Build and serve the visible PBR video-export application and its local frame
 * receiver. Open the printed URL with CUA and press a visible Export button.
 * This script never launches, automates or screenshots a browser.
 *
 * node scripts/export-anatomy-pbr.mjs --port 8766 --theme light
 */
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {ENGINE} from '../src/engine-spec.js';
import {getCatalog} from '../src/anatomy/catalog-i18n.js';
import {VIDEO,captionsVtt,stationary} from './anatomy-video-content.mjs';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),opt=(name,fallback)=>{const i=args.indexOf(`--${name}`);return i<0?fallback:args[i+1];};
if(args.includes('--help')){console.log('node scripts/export-anatomy-pbr.mjs [--port 8766] [--theme light|dark] [--language es|en] [--out anatomy-media/f22a6] [--build-only]');process.exit(0);}
const port=Number(opt('port',8766)),theme=opt('theme','light'),language=opt('language','es');
if(!['es','en'].includes(language))throw new Error('Language must be es or en.');
const CATALOG=getCatalog(language);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port.');
if(!['light','dark'].includes(theme))throw new Error('Theme must be light or dark.');
const output=path.resolve(project,opt('out',language==='en'?'anatomy-media/f22a6/en':'anatomy-media/f22a6'));
const buildDir=path.join(project,'.build/pbr-export');
await fs.mkdir(buildDir,{recursive:true});await fs.mkdir(output,{recursive:true});
const teardown=process.env.TEARDOWN_SKILL_DIR||path.join(homedir(),'.claude/skills/teardown');
const {fromDeps,DEPS}=await import(pathToFileURL(path.join(teardown,'paths.mjs')));
const built=await fromDeps('esbuild').build({entryPoints:[path.join(project,'scripts/export-pbr.js')],bundle:true,minify:true,format:'esm',write:false,target:'es2022',nodePaths:[DEPS],legalComments:'none'});
const bundle=built.outputFiles[0].contents;
await fs.writeFile(path.join(buildDir,'export.js'),bundle);
const frames=VIDEO.fps*VIDEO.seconds;
const revision=createHash('sha256').update(bundle).update(await fs.readFile(fileURLToPath(import.meta.url))).update(JSON.stringify({...VIDEO,theme,language})).digest('hex');
const entries=new Map(CATALOG.map(e=>[e.id,e]));
const manifestPath=path.join(output,'manifest.json');
let manifest={entries:{}};
try{manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));}catch{}
if(manifest.engine && manifest.engine.code!==ENGINE.code)throw new Error('Media target identity mismatch.');
manifest={...manifest,version:4,language,engine:ENGINE,format:'H.264 MP4, yuv420p, faststart',renderer:'Three.js PBR canvas (same runtime as the individual-part viewer) → JPEG frames → ffmpeg',audio:false,captions:`${language==='en'?'English':'Spanish'} captions burned in; matching WebVTT provided.`,accuracy:'Reference-based educational geometry. Fixed-part inspection is a camera orbit.',entries:manifest.entries||{}};
let active=null,lastError=null;
const config={...VIDEO,frames,theme,language,revision,total:CATALOG.length};
const currentEntries=()=>Object.values(manifest.entries).filter(e=>entries.has(e.id)&&e.revision===revision&&e.verified);
const body=async(req,max=8*1024*1024)=>{
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>max)throw new Error('Payload exceeds the local export limit.');chunks.push(chunk);}
  return Buffer.concat(chunks);
};
const jsonBody=async req=>JSON.parse((await body(req,65536)).toString('utf8')||'{}');
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const mediaPath=(id,ext)=>path.join(output,`${id}.${ext}`);
const probe=file=>JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,codec_type,pix_fmt,width,height,nb_frames,r_frame_rate:format=duration,size','-of','json',file],{encoding:'utf8'}));
function verify(file){
  const result=probe(file),s=result.streams?.[0],duration=Number(result.format?.duration);
  if(result.streams?.length!==1 || s?.codec_name!=='h264' || s?.codec_type!=='video' || s?.pix_fmt!=='yuv420p' || s.width!==VIDEO.width || s.height!==VIDEO.height || Number(s.nb_frames)!==frames || s.r_frame_rate!==`${VIDEO.fps}/1` || Math.abs(duration-VIDEO.seconds)>.05)throw new Error(`MP4 verification failed: ${file}\n${JSON.stringify(result)}`);
  return {codec:s.codec_name,pixelFormat:s.pix_fmt,width:s.width,height:s.height,frames:Number(s.nb_frames),fps:VIDEO.fps,duration,bytes:Number(result.format.size)};
}
async function abort(){
  if(!active)return;
  const old=active;active=null;old.child.kill('SIGTERM');
  await old.done.catch(()=>{});await fs.rm(old.temp,{force:true});await fs.rm(old.posterTemp,{force:true});
}
async function begin(id,force){
  if(active)throw new Error(`La pieza ${active.entry.label} todavía está en proceso.`);
  const entry=entries.get(id);if(!entry)throw new Error('Unknown component.');
  if(!force&&manifest.entries[id]?.revision===revision){
    try{verify(mediaPath(id,'mp4'));await fs.access(mediaPath(id,'jpg'));await fs.access(mediaPath(id,'vtt'));return{cached:true,id};}catch{}
  }
  const temp=mediaPath(id,'pbr.tmp.mp4'),posterTemp=mediaPath(id,'pbr.tmp.jpg');
  const child=spawn('ffmpeg',[
    '-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(VIDEO.fps),'-c:v','mjpeg','-i','pipe:0',
    '-an','-vf','scale=in_range=full:out_range=limited,format=yuv420p','-c:v','libx264','-threads','2','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-color_range','tv','-movflags','+faststart',
    '-metadata',`title=${entry.label}`,'-metadata','comment=Honda F22: Three.js PBR, misma geometría y materiales que el explorador individual.',temp,
  ],{stdio:['pipe','ignore','pipe']});
  const job={entry,child,temp,posterTemp,received:0,started:performance.now(),errors:'',done:null,failed:null};
  child.stderr.on('data',chunk=>{job.errors=(job.errors+chunk).slice(-8000);});child.stdin.on('error',()=>{});
  job.done=new Promise((resolve,reject)=>{
    child.once('error',error=>{job.failed=error.message;reject(error);});
    child.once('close',code=>{if(code===0)resolve();else{job.failed=job.errors||`ffmpeg exit ${code}`;reject(new Error(job.failed));}});
  });job.done.catch(()=>{});active=job;lastError=null;
  console.log(`Started ${entry.id}`);return{cached:false,id,frames};
}
async function frame(req,url){
  const id=url.searchParams.get('id'),index=Number(url.searchParams.get('n'));
  if(!active||active.entry.id!==id)throw new Error('No matching active export.');
  const job=active;if(job.failed)throw new Error(job.failed);
  if(!Number.isInteger(index)||index!==job.received||index>=frames)throw new Error(`Expected frame ${job.received}, received ${index}.`);
  const image=await body(req);if(image[0]!==0xff||image[1]!==0xd8)throw new Error('Expected a JPEG canvas frame.');
  await new Promise((resolve,reject)=>job.child.stdin.write(image,error=>error?reject(error):resolve()));
  if(index===Math.floor(frames*.16))await fs.writeFile(job.posterTemp,image);
  job.received++;return{received:job.received};
}
async function finish(id){
  if(!active||active.entry.id!==id)throw new Error('No matching active export.');
  const job=active;if(job.received!==frames)throw new Error(`Expected ${frames} frames; received ${job.received}.`);
  job.child.stdin.end();await job.done;
  const metadata=verify(job.temp);
  await fs.rename(job.temp,mediaPath(id,'mp4'));await fs.rename(job.posterTemp,mediaPath(id,'jpg'));
  await fs.writeFile(mediaPath(id,'vtt'),captionsVtt(job.entry,VIDEO.seconds,language));
  manifest.entries[id]={id,label:job.entry.label,kind:job.entry.kind,video:`${id}.mp4`,poster:`${id}.jpg`,captions:`${id}.vtt`,stationary:stationary(job.entry),...metadata,verified:true,revision,renderer:'three-pbr',renderSeconds:Math.round((performance.now()-job.started)/100)/10};
  await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');active=null;
  console.log(`Verified ${id}: ${metadata.frames} frames, ${Math.round(metadata.bytes/1024)} KB · ${currentEntries().length}/${CATALOG.length}`);
  return metadata;
}
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Exportar videos PBR · Honda F22</title><style>
*{box-sizing:border-box}body{margin:0;background:#edf0ed;color:#182126;font:16px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:32px}h1{font-size:28px;margin:0 0 8px}p{margin:8px 0 18px;color:#4a5a62}.controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:20px 0}button,select{font:inherit;padding:11px 14px;border:1px solid #91a4ac;border-radius:8px;background:white;color:#182126;min-height:46px}button{cursor:pointer}button.primary{background:#244f60;color:white;border-color:#244f60}button:disabled{opacity:.5;cursor:default}#status{font-weight:600;min-height:28px}#error{color:#a62f24;font-weight:600;white-space:pre-wrap}progress{width:100%;height:14px}#preview{display:block;width:min(720px,100%);height:auto;border:1px solid #c4ceca;border-radius:12px;margin:22px 0;background:#edf0ed}#pbr-stage{position:fixed;left:-2000px;top:0;width:720px;height:308px;pointer-events:none}video{display:block;width:min(720px,100%);height:auto;border-radius:12px}#log{font-size:14px;max-height:230px;overflow:auto;padding-left:22px}h2{font-size:20px;margin-top:28px}:focus-visible{outline:3px solid #b17b24;outline-offset:3px}
</style></head><body><main><h1>Exportar videos de las piezas</h1><p>El render usa los mismos materiales, luces y geometría PBR del visor. Cada video dura 12 segundos e incluye la explicación en ${language==='en'?'inglés':'español'}.</p><div class="controls"><label for="piece">Pieza</label><select id="piece" aria-label="Pieza para exportar"></select><button id="start-one" disabled>Exportar esta pieza</button><button id="start-all" class="primary" disabled>Iniciar toda la colección</button><button id="stop" disabled>Detener al terminar esta pieza</button><button id="discard" hidden>Descartar exportación interrumpida</button></div><div id="status" role="status">Preparando el renderizador…</div><div id="error" role="alert"></div><progress id="progress" max="1" value="0" aria-label="Progreso de exportación"></progress><canvas id="preview" width="720" height="540" aria-label="Vista previa del video PBR"></canvas><div id="pbr-stage" aria-hidden="true"></div><section id="result-section" hidden><h2 id="result-title">Video terminado</h2><video id="result" controls preload="metadata" playsinline></video></section><h2>Registro</h2><ol id="log"></ol></main><script type="module" src="/export.js"></script></body></html>`;
await fs.writeFile(path.join(buildDir,'index.html'),html);
if(args.includes('--build-only')){console.log(`Built PBR export application: ${buildDir}`);process.exit(0);}
execFileSync('ffmpeg',['-version'],{stdio:'ignore'});execFileSync('ffprobe',['-version'],{stdio:'ignore'});
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    if(req.method==='POST' && req.headers.origin && req.headers.origin!==`http://127.0.0.1:${port}`)return reply(res,403,{error:'Local same-origin export only.'});
    if(req.method==='GET' && url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html);}
    if(req.method==='GET' && url.pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
    if(req.method==='GET' && url.pathname==='/export.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});return res.end(bundle);}
    if(req.method==='GET' && url.pathname==='/api/config')return reply(res,200,config);
    if(req.method==='GET' && url.pathname==='/api/state')return reply(res,200,{completed:currentEntries().length,total:CATALOG.length,active:active?{id:active.entry.id,frames:active.received}:null,error:lastError,revision});
    if(req.method==='POST' && url.pathname==='/api/start'){const value=await jsonBody(req);return reply(res,200,await begin(value.id,value.force));}
    if(req.method==='POST' && url.pathname==='/api/frame')return reply(res,200,await frame(req,url));
    if(req.method==='POST' && url.pathname==='/api/finish'){const value=await jsonBody(req);return reply(res,200,await finish(value.id));}
    if(req.method==='POST' && url.pathname==='/api/abort'){await jsonBody(req);await abort();return reply(res,200,{aborted:true});}
    const media=/^\/media\/([a-zA-Z0-9_-]+)\.(mp4|jpg|vtt)$/.exec(url.pathname);
    if(req.method==='GET' && media && entries.has(media[1])){
      const file=mediaPath(media[1],media[2]),stat=await fs.stat(file),mime={mp4:'video/mp4',jpg:'image/jpeg',vtt:'text/vtt; charset=utf-8'}[media[2]];
      const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
      const headers={'Content-Type':mime,'Accept-Ranges':'bytes','Cache-Control':'no-store'};
      if(range){const start=Number(range[1]),end=Math.min(stat.size-1,range[2]?Number(range[2]):stat.size-1);if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});return createReadStream(file,{start,end}).pipe(res);}
      res.writeHead(200,{...headers,'Content-Length':stat.size});return createReadStream(file).pipe(res);
    }
    return reply(res,404,{error:'Not found.'});
  }catch(error){lastError=error.message;console.error(error.message);if(!res.headersSent)reply(res,500,{error:error.message});else res.end();}
});
server.requestTimeout=120000;server.headersTimeout=65000;
server.listen(port,'127.0.0.1',()=>console.log(`PBR export ready: http://127.0.0.1:${port}/\nOpen with CUA and press a visible Export button.\nOutput: ${output}\nRevision: ${revision}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await abort();server.close();process.exit(0);});
