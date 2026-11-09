#!/usr/bin/env node
/** CPU contact sheets from completed posters; never opens or captures a browser. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import {getCatalog} from '../src/anatomy/catalog-i18n.js';
import {VIDEO} from './anatomy-video-content.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),language=args.includes('--language')?args[args.indexOf('--language')+1]:'es';
if(!['es','en'].includes(language))throw new Error('Language must be es or en.');
const CATALOG=getCatalog(language);
const mediaFolder=language==='en'?'anatomy-media/f22a6/en':'anatomy-media/f22a6';
const require=createRequire(import.meta.url);
let sharp;
for(const candidate of [process.env.SHARP_MODULE,'sharp',path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')].filter(Boolean)){
  try{sharp=require(candidate);break;}catch{}
}
if(!sharp)throw new Error('Install Sharp locally or set SHARP_MODULE.');
const output=path.join(root,`.build/pbr-contact${language==='en'?'-en':''}`);await fs.mkdir(output,{recursive:true});
const xml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const columns=4,rows=6,cellWidth=360,cellHeight=220,padding=12,header=46;
const width=columns*cellWidth+(columns+1)*padding,height=header+rows*cellHeight+(rows+1)*padding;
for(let page=0;page<Math.ceil(CATALOG.length/(columns*rows));page++){
  const subset=CATALOG.slice(page*columns*rows,(page+1)*columns*rows),layers=[];
  const title=Buffer.from(`<svg width="${width}" height="${header}"><text x="12" y="29" font-family="Arial" font-size="21" fill="#182126">Honda F22A6 · posters PBR · ${page+1}/${Math.ceil(CATALOG.length/(columns*rows))}</text></svg>`);
  layers.push({input:title,left:0,top:0});
  for(let index=0;index<subset.length;index++){
    const entry=subset[index],left=padding+(index%columns)*(cellWidth+padding),top=header+padding+Math.floor(index/columns)*(cellHeight+padding);
    const drawing=await sharp(path.join(root,mediaFolder,`${entry.id}.jpg`)).extract({left:0,top:VIDEO.top,width:VIDEO.width,height:VIDEO.height-VIDEO.top-VIDEO.bottom}).resize(cellWidth,null).toBuffer();
    const title=entry.label.length>43?`${entry.label.slice(0,42)}…`:entry.label;
    const cell=Buffer.from(`<svg width="${cellWidth}" height="${cellHeight}"><rect width="${cellWidth}" height="${cellHeight}" rx="8" fill="#f4f4f2"/><text x="12" y="23" font-family="Arial" font-weight="600" font-size="15" fill="#182126">${xml(title)}</text><text x="12" y="207" font-family="Arial" font-size="11" fill="#546169">${xml(entry.id)}</text></svg>`);
    layers.push({input:cell,left,top},{input:drawing,left,top:top+32});
  }
  const file=path.join(output,`pbr-posters-${page+1}.png`);
  await sharp({create:{width,height,channels:3,background:'#d9dfde'}}).composite(layers).png().toFile(file);
  console.log(file);
}
