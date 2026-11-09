#!/usr/bin/env node
/** Independent validation of the finished PBR collection and its sidecars. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {getCatalog} from '../src/anatomy/catalog-i18n.js';
import {VIDEO,captionsVtt} from './anatomy-video-content.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),opt=(key,fallback)=>{const i=args.indexOf(`--${key}`);return i<0?fallback:args[i+1];};
const language=opt('language','es');
if(!['es','en'].includes(language))throw new Error('Language must be es or en.');
const CATALOG=getCatalog(language);
const folder=path.resolve(root,opt('out',language==='en'?'anatomy-media/f22a6/en':'anatomy-media/f22a6'));
const manifest=JSON.parse(await fs.readFile(path.join(folder,'manifest.json'),'utf8'));
const expected=opt('revision',null),require=createRequire(import.meta.url);
let sharp;
for(const candidate of [process.env.SHARP_MODULE,'sharp',path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')].filter(Boolean)){
  try{sharp=require(candidate);break;}catch{}
}
if(!sharp)throw new Error('Install Sharp locally or set SHARP_MODULE for poster decoding.');
const errors=[];
if((manifest.language||'es')!==language)errors.push('Wrong media language in manifest');
if(manifest.engine?.code!=='F22A6'||manifest.engine?.modelYear!==1993||manifest.engine?.transmission!=='5MT')errors.push('Wrong engine identity in manifest');
const revisions=new Set(),counts={count:0,decodedCount:0,posterCount:0,captionCount:0,totalSeconds:0,totalFrames:0,videoBytes:0,posterBytes:0,captionBytes:0};
const check=(condition,message)=>{if(!condition)throw new Error(message);};
for(const entry of CATALOG){
  try{
    const data=manifest.entries[entry.id];check(data?.verified,`${entry.id}: missing verified manifest entry`);
    check(data.renderer==='three-pbr',`${entry.id}: not rendered with Three.js PBR`);
    check(!expected||data.revision===expected,`${entry.id}: revision mismatch`);revisions.add(data.revision);
    const file=path.join(folder,`${entry.id}.mp4`);
    const result=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,codec_type,pix_fmt,width,height,nb_frames,r_frame_rate:format=duration,size','-of','json',file],{encoding:'utf8'}));
    const stream=result.streams?.[0],duration=Number(result.format?.duration),frames=Number(stream?.nb_frames);
    check(result.streams?.length===1&&stream.codec_type==='video'&&stream.codec_name==='h264'&&stream.pix_fmt==='yuv420p',`${entry.id}: invalid codec or unexpected audio stream`);
    check(stream.width===VIDEO.width&&stream.height===VIDEO.height,`${entry.id}: invalid video dimensions`);
    check(stream.r_frame_rate===`${VIDEO.fps}/1`&&frames===VIDEO.fps*VIDEO.seconds&&Math.abs(duration-VIDEO.seconds)<.01,`${entry.id}: invalid timing`);
    check(Number(result.format.size)===data.bytes,`${entry.id}: manifest size mismatch`);
    execFileSync('ffmpeg',['-v','error','-xerror','-threads','2','-i',file,'-map','0:v:0','-f','null','-'],{stdio:['ignore','ignore','pipe']});
    counts.decodedCount++;
    counts.count++;counts.totalFrames+=frames;counts.totalSeconds+=duration;counts.videoBytes+=Number(result.format.size);
    const poster=await fs.readFile(path.join(folder,`${entry.id}.jpg`));
    const decoded=await sharp(poster).raw().toBuffer({resolveWithObject:true});
    check(decoded.info.width===VIDEO.width&&decoded.info.height===VIDEO.height,`${entry.id}: invalid poster dimensions`);
    counts.posterCount++;counts.posterBytes+=poster.length;
    const captions=await fs.readFile(path.join(folder,`${entry.id}.vtt`),'utf8');
    check(captions===captionsVtt(entry,VIDEO.seconds,language),`${entry.id}: stale or invalid captions`);
    counts.captionCount++;counts.captionBytes+=Buffer.byteLength(captions);
  }catch(error){errors.push(error.message);}
}
if(revisions.size!==1)errors.push(`Expected one collection revision, found ${revisions.size}.`);
const unfinished=(await fs.readdir(folder)).filter(name=>name.includes('.tmp.'));
if(unfinished.length)errors.push(`Unfinished media: ${unfinished.join(', ')}`);
const report={pass:errors.length===0,language,engine:manifest.engine,renderer:'three-pbr',...counts,codec:'h264',pixelFormat:'yuv420p',resolution:[VIDEO.width,VIDEO.height],fps:VIDEO.fps,secondsEach:VIDEO.seconds,mediaBytes:counts.videoBytes+counts.posterBytes+counts.captionBytes,revision:revisions.size===1?[...revisions][0]:null,checkedAt:new Date().toISOString(),notes:'All MP4s independently re-probed and fully decoded; posters fully decoded; captions compared with the selected language catalogue.',errors};
await fs.mkdir(path.join(root,'.build'),{recursive:true});
await fs.writeFile(path.join(root,`.build/anatomy-media-verification${language==='en'?'-en':''}.json`),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
