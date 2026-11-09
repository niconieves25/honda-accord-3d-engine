#!/usr/bin/env node
// Translation completeness and shared language behavior. No browser automation.
import assert from 'node:assert/strict';
import en from '../src/i18n/en.js';
import es from '../src/i18n/es.js';
import {CATALOG, CATALOG_SYSTEMS, REMOVED_COMPONENTS} from '../src/anatomy/catalog.js';
import {getCatalog, getCatalogSystems, getRemovedComponents} from '../src/anatomy/catalog-i18n.js';
import {captionsVtt, storyboard} from '../scripts/anatomy-video-content.mjs';

let leaves=0;
function matchingShape(a,b,key='strings') {
  assert.equal(typeof a,typeof b,`Type mismatch: ${key}`);
  if(Array.isArray(a)) {
    assert.ok(Array.isArray(b),`Not an array: ${key}`);
    assert.equal(a.length,b.length,`Array length: ${key}`);
    a.forEach((v,i)=>matchingShape(v,b[i],`${key}.${i}`));
  } else if(a&&typeof a==='object') {
    assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),`Missing locale keys: ${key}`);
    for(const name of Object.keys(a))matchingShape(a[name],b[name],`${key}.${name}`);
  } else if(typeof a==='string') {
    assert.ok(a.trim()&&b.trim(),`Empty translation: ${key}`);leaves++;
  }
}
matchingShape(en,es);
assert.equal(en.lang,'en');assert.equal(es.lang,'es');
const english=getCatalog('en'),spanish=getCatalog('es');
assert.equal(english.length,102);assert.equal(spanish.length,102);
const identities=['id','system','parentId','kind','motionType','oem','confidence','geometry','engineCode','market','parentSystem'];
const languageFields=['label','quantity','location','function','connections','note'];
let explanations=0;
for(const original of CATALOG) {
  const e=english.find(x=>x.id===original.id),s=spanish.find(x=>x.id===original.id);
  assert.ok(e&&s,`Missing localized component: ${original.id}`);
  for(const field of identities) {
    assert.deepEqual(e[field],original[field],`English changed ${original.id}.${field}`);
    assert.deepEqual(s[field],original[field],`Spanish changed ${original.id}.${field}`);
  }
  for(const field of languageFields) {
    assert.ok(typeof e[field]==='string'&&e[field].trim(),`Missing English ${original.id}.${field}`);
    assert.equal(s[field],original[field],`Original Spanish changed: ${original.id}.${field}`);
  }
  for(const field of ['location','function','connections','note'])assert.notEqual(e[field],s[field],`Untranslated ${original.id}.${field}`);
  assert.equal(e.motion.type,original.motion.type);
  for(const field of ['description','driver']) {
    assert.ok(e.motion[field]?.trim(),`Missing English motion ${original.id}.${field}`);
    assert.notEqual(e.motion[field],s.motion[field],`Untranslated motion ${original.id}.${field}`);
  }
  assert.equal(e.steps.length,s.steps.length);
  e.steps.forEach((step,i)=>{assert.ok(step.trim());assert.notEqual(step,s.steps[i],`Untranslated step ${original.id}.${i}`);explanations++;});
  const englishVtt=captionsVtt(e,12,'en'),spanishVtt=captionsVtt(s,12,'es');
  assert.ok(englishVtt.startsWith('WEBVTT\n\n')&&spanishVtt.startsWith('WEBVTT\n\n'));
  assert.ok(englishVtt.includes('What it does:')&&!englishVtt.includes('Qué hace:'));
  assert.ok(spanishVtt.includes('Qué hace:')&&!spanishVtt.includes('What it does:'));
  assert.equal((englishVtt.match(/ --> /g)||[]).length,3);
  if(e.motion.type==='fixed')assert.ok(storyboard(e,'en')[2].body.endsWith('The rotation shown is the camera moving.'));
}
assert.deepEqual(getCatalogSystems('en').map(x=>x.id),CATALOG_SYSTEMS.map(x=>x.id));
for(const system of getCatalogSystems('en'))assert.notEqual(system.label,CATALOG_SYSTEMS.find(x=>x.id===system.id).label);
const removedEn=getRemovedComponents('en');
assert.deepEqual(Object.keys(removedEn).sort(),Object.keys(REMOVED_COMPONENTS).sort());
for(const [id,data] of Object.entries(removedEn))assert.ok(data.reason&&data.reason!==REMOVED_COMPONENTS[id].reason,`Untranslated legacy notice ${id}`);

// Shared persistence, unavailable storage and changes made in another open tab.
const saved=new Map();
globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
globalThis.window=new EventTarget();
globalThis.document={documentElement:{lang:''}};
const locale=await import('../src/i18n/locale.js?test=normal');
assert.equal(locale.getLanguage(),'es');
let events=0;window.addEventListener('f22:language',()=>events++);
locale.setLanguage('en');
assert.equal(document.documentElement.lang,'en');assert.equal(saved.get('f22.language'),'"en"');
assert.equal(locale.chooseLanguage('Hola','Hello'),'Hello');
const persisted=await import('../src/i18n/locale.js?test=persisted');assert.equal(persisted.getLanguage(),'en');
assert.throws(()=>locale.setLanguage('fr'),RangeError);
const storageEvent=new Event('storage');Object.assign(storageEvent,{key:'f22.language',newValue:'"es"'});window.dispatchEvent(storageEvent);
assert.equal(locale.getLanguage(),'es');assert.equal(persisted.getLanguage(),'es');assert.equal(document.documentElement.lang,'es');
assert.ok(events>=2);
saved.set('f22.language','"en"');
const restoreEvent=new Event('pageshow');Object.assign(restoreEvent,{persisted:true});window.dispatchEvent(restoreEvent);
assert.equal(locale.getLanguage(),'en');assert.equal(persisted.getLanguage(),'en');assert.equal(document.documentElement.lang,'en');
globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
const privateMode=await import('../src/i18n/locale.js?test=private');assert.equal(privateMode.getLanguage(),'es');privateMode.setLanguage('en');assert.equal(privateMode.getLanguage(),'en');
console.log(JSON.stringify({pass:true,engineStringLeaves:leaves,components:english.length,translatedSteps:explanations,systems:CATALOG_SYSTEMS.length,legacyNotices:Object.keys(removedEn).length,captionLanguages:2,sharedPreference:true,cachedPageRestore:true,privateStorageFallback:true},null,2));
