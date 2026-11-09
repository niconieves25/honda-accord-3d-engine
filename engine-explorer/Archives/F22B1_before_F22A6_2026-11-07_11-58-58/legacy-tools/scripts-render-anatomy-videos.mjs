#!/usr/bin/env node
/**
 * Deterministic, browser-free Anatomy video production.
 *
 * The same geometry module used by the explorer renders each frame as SVG.
 * Sharp rasterizes it on the CPU; ffmpeg encodes a real H.264 MP4. No browser
 * capture, screen recording, placeholder animation or network service is used.
 *
 * node scripts/render-anatomy-videos.mjs --only piston --force
 * node scripts/render-anatomy-videos.mjs --fps 24 --seconds 12
 *
 * Needs ffmpeg/ffprobe on PATH and Sharp installed locally, or the bundled
 * Codex runtime. Set SHARP_MODULE to an absolute package path if necessary.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? fallback : args[i + 1];
};
if (flag('help')) {
  console.log('Render Anatomy MP4s: --only id,id --out directory --fps 24 --seconds 12 --width 720 --height 540 --theme light --jobs 2 --force --poster-only');
  process.exit(0);
}
const config = {
  fps: Number(opt('fps', 24)), seconds: Number(opt('seconds', 12)),
  width: Number(opt('width', 720)), height: Number(opt('height', 540)),
  theme: opt('theme', 'light'),
};
for (const key of ['fps', 'seconds', 'width', 'height']) {
  if (!(config[key] > 0) || !Number.isFinite(config[key])) throw new Error(`Invalid ${key}`);
}
if (config.width % 2 || config.height % 2) throw new Error('H.264 dimensions must be even.');
const frames = Math.round(config.fps * config.seconds);
config.seconds = frames / config.fps;
const jobs = Math.min(4, Math.max(1, Number(opt('jobs', 2)) || 1));
const output = path.resolve(project, opt('out', 'anatomy-media'));
const only = opt('only', '').split(',').filter(Boolean);
const require = createRequire(import.meta.url);
let sharp;
const sharpPaths = [
  process.env.SHARP_MODULE, 'sharp',
  path.join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),
].filter(Boolean);
for (const candidate of sharpPaths) {
  try { sharp = require(candidate); break; } catch {}
}
if (!sharp) throw new Error('Sharp is unavailable. Install sharp locally or set SHARP_MODULE.');
sharp.cache({memory: 48, files: 0, items: 32});
sharp.concurrency(2);
const [figures, catalogue] = await Promise.all([
  import(pathToFileURL(path.join(project, 'src/anatomy/figures.mjs'))),
  import(pathToFileURL(path.join(project, 'src/anatomy/catalog.js'))),
]);
const renderSvg = figures.renderSvg;
if (typeof renderSvg !== 'function') throw new Error('figures.mjs must export renderSvg(kind, options).');
const all = catalogue.PARTS || catalogue.CATALOG || catalogue.CATALOGUE || catalogue.catalog || catalogue.default;
if (!Array.isArray(all)) throw new Error('catalog.js must export a catalogue array.');
const entries = all.filter(e => !only.length || only.includes(e.id));
if (only.some(id => !all.some(e => e.id === id))) throw new Error(`Unknown entry in --only ${only.join(',')}`);
await fs.mkdir(output, {recursive: true});
const manifestPath = path.join(output, 'manifest.json');
let old = {entries: {}};
try { old = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
const manifest = {
  version: 1, format: 'H.264 MP4, yuv420p, faststart',
  renderer: 'Anatomy geometry → deterministic SVG → Sharp/librsvg → ffmpeg',
  audio: false, captions: 'Spanish captions burned in; matching WebVTT provided.',
  accuracy: 'Educational geometry; camera inspection is explicitly distinguished from operating movement.',
  entries: old.entries || {},
};
let saveQueue=Promise.resolve();
const saveManifest = () => {
  // Concurrent encoders share one catalogue; serialize writes to avoid truncation.
  saveQueue=saveQueue.then(()=>fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n'));
  return saveQueue;
};
const sourceFiles = [
  path.join(project, 'src/anatomy/figures.mjs'),
  path.join(project, 'src/anatomy/motion.mjs'),
  path.join(project, 'src/anatomy/catalog.js'),
  fileURLToPath(import.meta.url),
];
const sourceHash = createHash('sha256');
for (const file of sourceFiles) sourceHash.update(await fs.readFile(file));
sourceHash.update(JSON.stringify(config));
const revision = sourceHash.digest('hex');
const xml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
const plain = value => typeof value === 'string' ? value : value?.text || value?.description || value?.body || '';
const wrap = (value, limit, count = Infinity) => {
  const words = plain(value).replace(/\s+/g, ' ').trim().split(' '), lines = [];
  for (const word of words) {
    if (!lines.length || `${lines.at(-1)} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  if (lines.length > count) {
    lines.length = count;
    lines[count - 1] = lines[count - 1].replace(/[.,;:]$/, '') + '…';
  }
  return lines;
};
const linesSvg = (lines, x, y, size, fill, weight = 400, lineHeight = size * 1.3) => lines.map((s,i) => `<text x="${x}" y="${y+i*lineHeight}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}">${xml(s)}</text>`).join('');
const stationary = e => /^(fixed|static|stationary|fija|fijo|none)$/i.test(e.motion?.type || e.motionType || '');
const explanation = e => plain(e.function || e.description);
const motionDescription = e => plain(e.motion?.description || e.movement);
function storyboard(e) {
  const steps = Array.isArray(e.steps) ? e.steps : [];
  const motion = stationary(e)
    ? `${motionDescription(e) || 'Esta pieza permanece fija durante el funcionamiento.'} El giro mostrado es de la cámara.`
    : motionDescription(e);
  return [
    {title: 'Qué hace', body: explanation(e)},
    {title: 'Cómo trabaja', body: plain(steps[1] || steps[0]) || explanation(e)},
    {title: stationary(e) ? 'Pieza fija · inspección' : 'Cómo se mueve', body: motion || plain(steps.at(-1)) || explanation(e)},
  ];
}
function frameSvg(e, frame) {
  const w=config.width, h=config.height, u=w/720, t=frame/frames;
  const still=stationary(e), story=storyboard(e), section=Math.min(2,Math.floor(t*3));
  // Leave the lower caption line above the browser's native playback controls.
  const top=76*u, bottom=156*u, diagramHeight=h-top-bottom;
  // Rotating the view never masquerades as operating movement of a fixed part.
  // The actual mechanism always receives one full, slow educational cycle.
  const angle=still ? 32*Math.sin(t*Math.PI*2) : 0;
  const phase=still ? 0 : t;
  let diagram=renderSvg(e.kind || e.figure || e.figureKind, {
    phase, angle, theme:config.theme, width:w, height:diagramHeight, raster:true,
    entry:e, focus:e.focus || e.id,
  });
  if (typeof diagram !== 'string' || !diagram.includes('<svg')) throw new Error(`Invalid SVG for ${e.id}`);
  diagram=diagram.replace(/<\?xml[^>]*>/g,'').replace(/<!DOCTYPE[^>]*>/g,'');
  const title=wrap(e.label || e.name || e.id,48,2);
  const body=wrap(story[section].body,62,3);
  const dark=config.theme==='dark';
  const foreground=dark?'#ecf0f1':'#182126', secondary=dark?'#b5c1c6':'#546169', accent=dark?'#e2ba72':'#705022', bg=dark?'#182126':'#edf0ed';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    ${linesSvg(title,28*u,34*u,23*u,foreground,600,26*u)}
    ${linesSvg([still?'INSPECCIÓN · LA PIEZA PERMANECE FIJA':'DEMOSTRACIÓN A CÁMARA LENTA'],28*u,68*u,11*u,accent,600)}
    <g transform="translate(0 ${top})">${diagram}</g>
    <rect x="20" y="${h-bottom}" width="${w-40}" height="1" fill="${dark?'#3b484e':'#c6d0cc'}"/>
    ${linesSvg([story[section].title],28*u,h-bottom+27*u,17*u,accent,600)}
    ${linesSvg(body,28*u,h-bottom+53*u,18*u,foreground,400,22*u)}
    ${linesSvg(['Honda F22 · geometría didáctica basada en referencias'],28*u,h-12*u,10*u,secondary)}
    <rect x="0" y="${h-3}" width="${w*t}" height="3" fill="${accent}"/>
  </svg>`;
}
const timeVtt = seconds => {
  const ms=Math.round(seconds*1000);
  return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
};
const vtt = e => `WEBVTT\n\n${storyboard(e).map((s,i)=>`${i+1}\n${timeVtt(i*config.seconds/3)} --> ${timeVtt((i+1)*config.seconds/3)}\n${e.label || e.name}\n${s.title}: ${s.body}\n`).join('\n')}`;
const probe = file => JSON.parse(execFileSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,nb_frames,r_frame_rate:format=duration,size','-of','json',file],{encoding:'utf8'}));
function verify(file) {
  const result=probe(file), stream=result.streams?.[0], duration=Number(result.format?.duration);
  if (stream?.codec_name!=='h264' || stream?.pix_fmt!=='yuv420p' || stream.width!==config.width || stream.height!==config.height || Math.abs(duration-config.seconds)>1/config.fps+0.05) {
    throw new Error(`MP4 verification failed: ${file}\n${JSON.stringify(result)}`);
  }
  if (Number(stream.nb_frames)!==frames) throw new Error(`Frame count mismatch: ${file}`);
  return {codec:stream.codec_name,pixelFormat:stream.pix_fmt,width:stream.width,height:stream.height,frames:Number(stream.nb_frames),fps:config.fps,duration,bytes:Number(result.format.size)};
}
async function encode(e) {
  if (!/^[a-zA-Z0-9_-]+$/.test(e.id)) throw new Error(`Unsafe file id: ${e.id}`);
  const dest=path.join(output,`${e.id}.mp4`), poster=path.join(output,`${e.id}.jpg`), temp=path.join(output,`${e.id}.tmp.mp4`);
  if (!flag('force') && manifest.entries[e.id]?.revision===revision) {
    try { verify(dest); await fs.access(poster); await fs.access(path.join(output,`${e.id}.vtt`)); console.log(`cached ${e.id}`); return; } catch {}
  }
  const started=performance.now();
  const posterFrame=Math.floor(frames*0.16);
  if (flag('poster-only')) {
    await sharp(Buffer.from(frameSvg(e,posterFrame))).jpeg({quality:90}).toFile(poster);
    console.log(`poster ${e.id}`); return;
  }
  const ff=spawn('ffmpeg',[
    '-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24',
    '-video_size',`${config.width}x${config.height}`,'-framerate',String(config.fps),'-i','pipe:0',
    '-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',
    '-metadata',`title=${e.label || e.name || e.id}`,
    '-metadata','comment=Demostración didáctica de Anatomy basada en referencias del Honda F22. Geometría aproximada.',temp,
  ],{stdio:['pipe','ignore','pipe']});
  let errors='';
  ff.stderr.on('data',chunk=>{errors=(errors+chunk).slice(-8000);});
  // Attach handlers before rendering so early encoder failures cannot be missed.
  const finished=new Promise((resolve,reject)=>{
    ff.once('error',reject);
    ff.once('close',code=>code===0?resolve():reject(new Error(`ffmpeg ${e.id}: ${errors || code}`)));
  });
  finished.catch(()=>{});
  ff.stdin.on('error',()=>{});
  try {
    for(let i=0;i<frames;i++) {
      const svg=frameSvg(e,i);
      const pixels=await sharp(Buffer.from(svg)).flatten({background:'#182126'}).removeAlpha().raw().toBuffer();
      if(pixels.length!==config.width*config.height*3)throw new Error(`Unexpected raster size for ${e.id}`);
      await new Promise((resolve,reject)=>ff.stdin.write(pixels,error=>error?reject(error):resolve()));
      if(i===posterFrame)await sharp(pixels,{raw:{width:config.width,height:config.height,channels:3}}).jpeg({quality:90}).toFile(poster);
    }
    ff.stdin.end();
    await finished;
    const metadata=verify(temp);
    await fs.rename(temp,dest);
    await fs.writeFile(path.join(output,`${e.id}.vtt`),vtt(e));
    manifest.entries[e.id]={
      id:e.id,label:e.label || e.name,kind:e.kind || e.figure || e.figureKind,
      video:`${e.id}.mp4`,poster:`${e.id}.jpg`,captions:`${e.id}.vtt`,
      stationary:stationary(e),...metadata,verified:true,revision,
      renderSeconds:Math.round((performance.now()-started)/100)/10,
    };
    await saveManifest();
    console.log(`${e.id}: ${metadata.frames} frames, ${(metadata.bytes/1024).toFixed(0)} KB, ${manifest.entries[e.id].renderSeconds}s render; verified`);
  } catch(error) {
    ff.kill();
    await fs.rm(temp,{force:true});
    throw error;
  }
}
const started=performance.now();
console.log(`Rendering ${entries.length} Anatomy clips · ${config.width}×${config.height} · ${config.fps} fps · ${config.seconds}s`);
let next=0,failed=false;
const workers=Array.from({length:Math.min(jobs,entries.length)},async()=>{
  while(!failed && next<entries.length) {
    const entry=entries[next++];
    try { await encode(entry); } catch(error) { failed=true; throw error; }
  }
});
const results=await Promise.allSettled(workers);
for(const result of results)if(result.status==='rejected')throw result.reason;
await saveQueue;
console.log(`Completed ${entries.length} entries in ${((performance.now()-started)/1000).toFixed(1)}s. Output: ${output}`);
