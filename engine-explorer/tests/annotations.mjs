// A pure screen-space solver must leave every visible pin/tag reachable and
// clear of the UI at phone sizes and enlarged text. No WebGL or DOM required.
import assert from 'node:assert/strict';
import {layoutPins,layoutTags} from '../src/ui/annotations.js';

const overlaps = (a,b,gap=0) => a.x < b.x+b.width+gap && a.x+a.width+gap > b.x
  && a.y < b.y+b.height+gap && a.y+a.height+gap > b.y;
function verify(result,options) {
  const bounds=options.bounds||{x:12,y:12,width:options.width-24,height:options.height-24};
  for (const [index,item] of result.items.entries()) {
    assert.ok(item.x>=bounds.x&&item.y>=bounds.y,`${item.id}: outside safe origin`);
    assert.ok(item.x+item.width<=bounds.x+bounds.width+1e-8,`${item.id}: beyond safe width`);
    assert.ok(item.y+item.height<=bounds.y+bounds.height+1e-8,`${item.id}: beyond safe height`);
    for (const obstacle of options.obstacles||[]) assert.equal(overlaps(item,obstacle,options.gap??6),false,`${item.id}: HUD overlap`);
    for (const prior of result.items.slice(0,index)) assert.equal(overlaps(item,prior,options.gap??6),false,`${item.id}/${prior.id}: annotation overlap`);
    const input=options.anchors.find(anchor=>anchor.id===item.id);
    assert.equal(item.anchorX,input.x);assert.equal(item.anchorY,input.y);
  }
  assert.equal(result.items.length+result.hidden.length,options.anchors.length,'An annotation disappeared from the inventory');
}

// Tight clustered points become separated interactive markers, rather than
// overlapping hit targets. The exact original point stays available to leaders.
const phone={width:375,height:812,bounds:{x:12,y:150,width:351,height:540},
  anchors:Array.from({length:8},(_,i)=>({id:`part-${i}`,x:180+i%3*3,y:380+Math.floor(i/3)*3})),
  obstacles:[{x:12,y:150,width:112,height:46},{x:245,y:620,width:118,height:70}]};
const phoneResult=layoutPins(phone);
verify(phoneResult,phone);
assert.ok(phoneResult.items.length>=6,'Solver omitted easy-to-separate clustered phone markers');
assert.ok(phoneResult.items.some(item=>item.displaced),'Dense cluster was not separated');
for (const item of phoneResult.items) assert.ok(item.width>=44&&item.height>=44,'Marker hit target smaller than 44px');
assert.deepEqual(layoutPins(phone),phoneResult,'Repeated rendering changed placement');

// Entirely occupied space omits a marker rather than putting a target behind a
// menu. Projection points outside the actual viewport never get edge-clamped in.
const occupied={width:375,height:812,anchors:[{id:'hidden',x:100,y:300}],
  obstacles:[{x:0,y:0,width:375,height:812}]};
assert.deepEqual(layoutPins(occupied),{items:[],hidden:['hidden']});
assert.deepEqual(layoutPins({width:375,height:812,anchors:[{id:'left',x:-1,y:300},{id:'nan',x:NaN,y:200}]}),{items:[],hidden:['left','nan']});

// A selected component wins a single available target slot even if it was last
// in the catalogue. Neither input coordinates nor source order may be mutated.
const selected={width:90,height:90,bounds:{x:23,y:23,width:44,height:44},
  anchors:[{id:'other',x:45,y:45,priority:100},{id:'selected',x:45,y:45,selected:true}]};
const selectedBefore=structuredClone(selected);
const selectedResult=layoutPins(selected);
assert.deepEqual(selectedResult.items.map(item=>item.id),['selected']);
assert.deepEqual(selectedResult.hidden,['other']);
assert.deepEqual(selected,selectedBefore,'Layout mutated source registry coordinates');

// Obstacles force displacement while retaining the precise anchor. No silent
// fallback to an overlapping point is permitted when displacement is disabled.
const covered={width:800,height:600,anchors:[{id:'covered',x:400,y:300}],
  obstacles:[{x:375,y:275,width:50,height:50}]};
const uncovered=layoutPins(covered);
verify(uncovered,covered);assert.equal(uncovered.items.length,1);
assert.equal(uncovered.items[0].displaced,true);
assert.deepEqual(layoutPins({...covered,maxDisplacement:0}).hidden,['covered']);

// Expanded translated labels at 240% must never stack at the screen bottom.
// Overlarge labels are explicitly omitted, not squeezed into clipped text.
const enlarged={width:375,height:812,bounds:{x:12,y:155,width:351,height:510},
  anchors:[
    {id:'normal',x:185,y:380,labelWidth:290,labelHeight:110},
    {id:'selected',x:185,y:380,labelWidth:310,labelHeight:120,selected:true},
    {id:'longer',x:185,y:380,labelWidth:290,labelHeight:110},
    {id:'too-wide',x:180,y:380,labelWidth:360,labelHeight:36},
  ],obstacles:[{x:12,y:155,width:351,height:50}]};
const enlargedResult=layoutTags(enlarged);
verify(enlargedResult,enlarged);
assert.equal(enlargedResult.items[0].id,'selected');
assert.ok(enlargedResult.items.length>=2,'Enlarged text has usable vertical space');
assert.ok(enlargedResult.hidden.includes('too-wide'),'Text wider than safe viewport was not omitted');
assert.deepEqual(layoutTags(enlarged),enlargedResult);

// Combined pin/tag mode shares the same collision contract. Tags cannot cover
// the hit areas of markers that remain visible beside them.
const desktop={width:1440,height:900,anchors:[
  {id:'intake',x:660,y:370,labelWidth:220,labelHeight:42},
  {id:'exhaust',x:800,y:410,labelWidth:210,labelHeight:42},
  {id:'crank',x:700,y:570,labelWidth:230,labelHeight:42,selected:true},
],obstacles:[{x:1030,y:150,width:390,height:720},{x:0,y:0,width:1440,height:130}]};
const pins=layoutPins(desktop);verify(pins,desktop);
const tagOptions={...desktop,obstacles:[...desktop.obstacles,...pins.items]};
const tags=layoutTags(tagOptions);verify(tags,tagOptions);
assert.equal(tags.items.length,desktop.anchors.length,'Desktop labels unexpectedly omitted');

// An interactive preview must still be reachable when its nearby rows happen
// to intersect the seven exterior-view pins. These are actual 1280x720 CSS-px
// placements from the engine view; ample space remains beyond those rows.
const exteriorPins = [
  [625.99,171.195],[401.532,281.428],[409.869,532.044],[358.226,224.156],
  [764.399,225.096],[731.265,478.606],[927.707,173.663],
].map(([x,y])=>({x:x-22,y:y-22,width:44,height:44}));
const exteriorPreview = {width:1280,height:720,
  bounds:{x:12,y:149.195,width:1256,height:494.805},
  anchors:[{id:'valve-cover-preview',x:625.99,y:171.195,labelWidth:320,labelHeight:138.71,selected:true}],
  obstacles:[
    {x:19,y:19,width:1242,height:48},{x:19,y:95,width:114,height:48},
    {x:1126,y:95,width:134,height:48},{x:575.8,y:91,width:128,height:44},
    {x:1212.8,y:297,width:48,height:126},{x:19,y:652,width:131,height:48},
    {x:503,y:652,width:272,height:48},...exteriorPins,
  ],maxDisplacement:1500,
};
assert.equal(layoutTags(exteriorPreview).items.length,0,'Regression no longer exercises exhausted nearby candidates');
const freePreview = layoutTags({...exteriorPreview,searchFreeSpace:true});
verify(freePreview,exteriorPreview);
assert.equal(freePreview.items.length,1,'Usable exterior preview space was not found');
assert.deepEqual(layoutTags({...exteriorPreview,searchFreeSpace:true}),freePreview,'Preview fallback changed placement');

// A dense mobile cluster can exhaust all card-sized openings. The solver must
// report that explicitly rather than silently covering controls.
const mobilePreview = {...phone,anchors:[{id:'mobile-preview',x:180,y:380,labelWidth:320,labelHeight:138.71,selected:true}],
  obstacles:[...phone.obstacles,...phoneResult.items],maxDisplacement:900,searchFreeSpace:true};
const mobileCard = layoutTags(mobilePreview);
verify(mobileCard,mobilePreview);
assert.equal(mobileCard.items.length,0,'Dense mobile layout unexpectedly has a free card-sized opening');
// At enlarged text, the preview controller may reserve the active pin and
// temporarily omit covered inactive pins. The card still cannot cover the HUD
// or the focused target, and restores those other pins when the preview closes.
const activePin = phoneResult.items.find(pin=>pin.id==='part-0');
const prioritizedMobile = {...mobilePreview,
  anchors:[{id:'mobile-preview',x:activePin.centerX,y:activePin.centerY,labelWidth:320,labelHeight:190,selected:true}],
  obstacles:[...phone.obstacles,activePin]};
const largeMobileCard = layoutTags(prioritizedMobile);
verify(largeMobileCard,prioritizedMobile);
assert.equal(largeMobileCard.items.length,1,'Readable large preview could not coexist with active pin');
assert.deepEqual(layoutTags({...occupied,searchFreeSpace:true}).hidden,['hidden']);

// Transient zero-size canvases are expected during resize. They must be safe.
assert.deepEqual(layoutPins({width:0,height:0,anchors:[{id:'a',x:0,y:0}]}),{items:[],hidden:['a']});
assert.deepEqual(layoutTags({width:NaN,height:Infinity,anchors:[{id:'a',x:0,y:0}]}),{items:[],hidden:['a']});
console.log(JSON.stringify({pass:true,phonePins:phoneResult.items.length,selectedPriority:true,
  hudAndHitAreaCollision:true,enlargedLabels:enlargedResult.items.length,combinedLabels:tags.items.length,
  exteriorPreviewFallback:true,mobilePreview:true,deterministic:true}));
