import fs from 'node:fs';
import path from 'node:path';
import {project} from './presentation.mjs';

// Preserve the local URL layout, including all existing component and OEM links.
const destination=path.join(project,'dist');
fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(path.join(destination,'engine-explorer'),{recursive:true});
fs.copyFileSync(path.join(project,'../index.html'),path.join(destination,'index.html'));
for(const name of ['index.html','anatomy.html','assets']){
  fs.cpSync(path.join(project,name),path.join(destination,'engine-explorer',name),{recursive:true});
}
// Export jobs and cloud file providers can leave partial files or conflict
// copies alongside published clips. Only the two verified manifests define
// the active media collection; unrelated files never enter the deployment.
const media='anatomy-media/f22a6';
for(const language of ['', 'en']){
  const folder=path.join(project,media,language),target=path.join(destination,'engine-explorer',media,language);
  const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
  fs.mkdirSync(target,{recursive:true});
  fs.copyFileSync(path.join(folder,'manifest.json'),path.join(target,'manifest.json'));
  for(const entry of Object.values(manifest.entries))for(const field of ['video','poster','captions']){
    const file=entry[field];
    if(!file||path.basename(file)!==file)throw new Error(`Invalid media manifest path: ${file}`);
    fs.copyFileSync(path.join(folder,file),path.join(target,file));
  }
}
const references='Honda Reference Library/F22A6_1993_5MT';
const diagrams='01_OEM_Diagrams';
fs.cpSync(path.join(project,'..',references,diagrams),path.join(destination,references,diagrams),{
  recursive:true,
  filter:source=>fs.statSync(source).isDirectory()||/\.(png|json)$/i.test(source)
});
console.log('Packaged landing, both dashboards, bilingual media and OEM references into dist/');
