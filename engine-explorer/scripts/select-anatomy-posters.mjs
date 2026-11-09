#!/usr/bin/env node
// Choose a clear face-on frame for thin timing covers from the completed videos.
// No new geometry: each JPEG is decoded directly from its matching MP4.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),language=args.includes('--language')?args[args.indexOf('--language')+1]:'es';
if(!['es','en'].includes(language))throw new Error('Language must be es or en.');
const folder=path.join(root,language==='en'?'anatomy-media/f22a6/en':'anatomy-media/f22a6');
const manifestPath=path.join(folder,'manifest.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
for(const id of ['cover-timing-upper','cover-timing-lower']){
  if(!manifest.entries[id]?.verified)throw new Error(`Missing verified video ${id}`);
  const destination=path.join(folder,`${id}.jpg`),temp=path.join(folder,`${id}.poster.tmp.jpg`);
  execFileSync('ffmpeg',['-v','error','-y','-ss','9','-i',path.join(folder,`${id}.mp4`),'-frames:v','1','-q:v','2',temp],{stdio:['ignore','ignore','pipe']});
  await fs.rename(temp,destination);
  manifest.entries[id].posterTimeSeconds=9;
  manifest.entries[id].posterSelection='Face-on reference view decoded from the matching verified MP4.';
}
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Selected clearer timing-cover posters from their matching videos.');
