// Project-owned offline presentation assets; global skill files remain untouched.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function presentationCss(page){
  const fonts=[];
  for(const [slug,name] of [['ibm-plex-sans','IBM Plex Sans'],['ibm-plex-sans-condensed','IBM Plex Sans Condensed']])for(const weight of [400,500,600]){
    const data=fs.readFileSync(path.join(project,`assets/fonts/${slug}-latin-${weight}-normal.woff2`)).toString('base64');
    fonts.push(`@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${data}) format('woff2');}`);
  }
  // The explorer's view headings need one extra weight; the catalogue stays unchanged.
  if(page==='app'){
    const data=fs.readFileSync(path.join(project,'assets/fonts/ibm-plex-sans-condensed-latin-700-normal.woff2')).toString('base64');
    fonts.push(`@font-face{font-family:'IBM Plex Sans Condensed';font-style:normal;font-weight:700;font-display:swap;src:url(data:font/woff2;base64,${data}) format('woff2');}`);
  }
  return fonts.join('\n')+'\n'+fs.readFileSync(path.join(project,'src/ui/presentation.css'),'utf8')+'\n'+fs.readFileSync(path.join(project,'src/ui/theme.css'),'utf8')+'\n'+fs.readFileSync(path.join(project,page,'style.css'),'utf8')+'\n'+fs.readFileSync(path.join(project,'src/ui/surfaces.css'),'utf8')+(page==='app'?'\n'+fs.readFileSync(path.join(project,'app/immersive.css'),'utf8'):'');
}
