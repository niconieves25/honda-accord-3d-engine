import fs from 'node:fs';
import path from 'node:path';
import {project} from './presentation.mjs';

// Preserve the local URL layout, including all existing component and OEM links.
const destination=path.join(project,'dist');
fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(path.join(destination,'engine-explorer'),{recursive:true});
fs.copyFileSync(path.join(project,'../index.html'),path.join(destination,'index.html'));
for(const name of ['index.html','anatomy.html','assets','anatomy-media/f22a6']){
  fs.cpSync(path.join(project,name),path.join(destination,'engine-explorer',name),{recursive:true});
}
const references='Honda Reference Library/F22A6_1993_5MT';
const diagrams='01_OEM_Diagrams';
fs.cpSync(path.join(project,'..',references,diagrams),path.join(destination,references,diagrams),{
  recursive:true,
  filter:source=>fs.statSync(source).isDirectory()||/\.(png|json)$/i.test(source)
});
console.log('Packaged landing, both dashboards, bilingual media and OEM references into dist/');
