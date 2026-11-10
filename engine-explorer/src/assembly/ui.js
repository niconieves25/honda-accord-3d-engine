import * as THREE from 'three';
import {createAssemblyRuntime} from './runtime.js';
import {assemblyUnitLabel} from './sequence.js';
import {getCatalog} from '../anatomy/catalog-i18n.js';
import {icon,setControlIcon,setControlText} from '../ui/icons.js';

const COPY={
 es:{title:'Montaje del F22A6',intro:'Una unidad a la vez. Las bandejas muestran las piezas del capítulo actual.',chapter:'Capítulo',step:'Paso',unit:'Unidad',search:'Buscar una unidad',searchHint:'Pistón, válvula, cojinete…',play:'Reproducir montaje',pause:'Pausar montaje',replay:'Volver al inicio',previous:'Paso anterior',next:'Paso siguiente',restart:'Reiniciar montaje',speed:'Velocidad',slow:'Lenta',normal:'Normal',fast:'Rápida',progress:'Progreso del montaje',installed:'unidades colocadas',follow:'Seguir pieza',interior:'Ver interior',narration:'Leer cada paso',listen:'Escuchar paso',return:'Volver al explorador',catalog:'Abrir ficha en Anatomy',locate:'Ir al paso de esta unidad',function:'Qué hace',where:'Dónde se coloca',evidence:'Evidencia y límites',uncertainties:'Qué queda por verificar',approx:'Detalle o ubicación aproximados',reconstructed:'Forma reconstruida con referencias',documented:'Relación de montaje documentada',complete:'Motor completo',done:'El montaje ha terminado. Puedes retroceder para explorar cualquier unidad.',educational:'Secuencia educativa. Las trayectorias y ubicaciones no medidas son ilustrativas.',empty:'No se encontraron unidades.',results:'Resultados',active:'Unidad seleccionada',overview:'Conjunto',schematic:'Colocación esquemática: no se simulan la tensión de la correa ni la flexión de la manguera.',stepCount:(i,n)=>`Paso ${i} de ${n}`,instance:(i,n)=>`Ejemplar ${i} de ${n}`,showing:(n,total)=>`${n} de ${total} coincidencias`,status:(n,total)=>`${n} de ${total} unidades colocadas`,loadError:'No se pudo preparar el montaje. Las otras vistas siguen disponibles.'},
 en:{title:'F22A6 assembly',intro:'One unit at a time. Trays show the current chapter’s components.',chapter:'Chapter',step:'Step',unit:'Unit',search:'Find a unit',searchHint:'Piston, valve, bearing…',play:'Play assembly',pause:'Pause assembly',replay:'Return to start',previous:'Previous step',next:'Next step',restart:'Restart assembly',speed:'Speed',slow:'Slow',normal:'Normal',fast:'Fast',progress:'Assembly progress',installed:'units installed',follow:'Follow part',interior:'See inside',narration:'Read each step',listen:'Read step aloud',return:'Return to explorer',catalog:'Open Anatomy entry',locate:'Go to this unit’s step',function:'What it does',where:'Where it fits',evidence:'Evidence and limits',uncertainties:'What remains unverified',approx:'Approximate detail or placement',reconstructed:'Reconstructed from references',documented:'Documented assembly relationship',complete:'Complete engine',done:'Assembly complete. Go back to explore any unit.',educational:'Educational sequence. Unmeasured placement and installation paths are illustrative.',empty:'No matching units.',results:'Results',active:'Selected unit',overview:'Assembly detail',schematic:'Schematic placement: belt tension and hose bending are not simulated.',stepCount:(i,n)=>`Step ${i} of ${n}`,instance:(i,n)=>`Instance ${i} of ${n}`,showing:(n,total)=>`${n} of ${total} matches`,status:(n,total)=>`${n} of ${total} units installed`,loadError:'The assembly could not be prepared. Other views remain available.'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export function createAssemblyUI({app,st,getLanguage,getSettings,camTo,announce,say,onExit}){
 let runtime=null,active=false,progress=0,playing=false,speed=1,following=true,interior=true,narration=false,selectedId=null,lastStep=-1,lastCameraStep=-1,lastInfo='',state=null,lang=getLanguage(),catalog=new Map(),savedCamera=null,savedMinDistance=null,lastPlayKey='';
 const $=s=>app.querySelector(s),transport=$('#assembly-transport'),inspector=$('#assembly-inspector');
 const text=()=>COPY[lang],unitById=id=>runtime?.inventory.units.find(u=>u.id===id);
 const local=value=>typeof value==='string'?value:value?.[lang]??value?.es??'';
 function name(unit){return unit?assemblyUnitLabel(unit,lang):text().overview;}
 const totalOf=unit=>runtime.inventory.units.filter(u=>u.catalogId===unit.catalogId).length;
 function updateUrl(){if(!active||!state?.step)return;const url=new URL(location.href);url.searchParams.set('view','assembly');url.searchParams.set('step',state.step.id);history.replaceState(null,'',url);}
 function focus(force=false){
  if(!state?.focus||(!following&&!force))return;if(!force&&lastCameraStep===state.index)return;
  lastCameraStep=state.index;
  const aspect=Math.max(1,(st.size.h||1)/Math.max(1,st.size.w||1));
  camTo({t:state.focus.target,az:48,el:28,d:Math.max(.08,state.focus.distance*aspect)},getSettings().reduceMotion);
 }
 function cameraSnapshot(){
  const offset=st.camera.position.clone().sub(st.controls.target),distance=Math.max(.001,offset.length());
  return {t:st.controls.target.toArray().map(n=>n*1000),az:Math.atan2(offset.x,offset.z)*180/Math.PI,el:Math.asin(Math.max(-1,Math.min(1,offset.y/distance)))*180/Math.PI,d:distance};
 }
 function pause(){playing=false;if('speechSynthesis'in window)speechSynthesis.cancel();}
 function selectedStep(){const index=selectedId?runtime.findStep(selectedId):-1;return index>=0?runtime.steps[index]:state?.step;}
 function selectUnit(id){
  if(!unitById(id))return;pause();selectedId=id;lastInfo='';
  if(!runtime.snapshot().unitStates.find(unit=>unit.id===id)?.visible)progress=runtime.progressForStep(runtime.findStep(id));
  pose(progress);focus(true);announce(name(unitById(id)));if(narration)say(reading());
 }
 function renderSearch(){
  const field=$('#assembly-search');if(!runtime||!field)return;
  const query=norm(field.value),matches=query?runtime.inventory.units.filter(u=>norm(`${name(u)} ${u.id}`).includes(query)):[];
  $('#assembly-results').innerHTML=query?(matches.slice(0,12).map(u=>`<button type="button" data-unit="${esc(u.id)}">${esc(name(u))}<span>${esc(text().instance(u.instanceIndex,totalOf(u)))}</span></button>`).join('')||`<p>${esc(text().empty)}</p>`):'';
  $('#assembly-result-count').textContent=query?text().showing(Math.min(matches.length,12),matches.length):'';
 }
 function information(){
  if(!state)return;
  const unit=unitById(selectedId)||unitById(state.step.unitIds?.[0]);
  const key=`${lang}:${state.index}:${selectedId}`;if(key===lastInfo)return;lastInfo=key;
  const entry=catalog.get(unit?.catalogId),t=text();
  $('#assembly-unit-title').textContent=unit?name(unit):local(state.step.label);
  $('#assembly-instance').textContent=unit?t.instance(unit.instanceIndex,totalOf(unit)):t.overview;
  $('#assembly-step-description').textContent=local(selectedStep()?.description)||t.educational;
  $('#assembly-does').textContent=entry?.does||entry?.function||local(unit?.note)||t.educational;
  $('#assembly-where').textContent=entry?.location||local(unit?.note)||local(state.step.description)||t.educational;
  $('#assembly-evidence').textContent=[unit?.evidence==='documented'?t.documented:unit?.evidence==='visually reconstructed'?t.reconstructed:t.approx,local(unit?.note),/belt|hose/.test(unit?.catalogId||'')?t.schematic:'',t.educational].filter(Boolean).join(' · ');
  const link=$('#assembly-catalog');link.hidden=!entry;link.href=`anatomy.html?piece=${encodeURIComponent(entry?.id||'')}`;
  $('#assembly-locate').hidden=!unit;$('#assembly-locate').dataset.unit=unit?.id||'';
 }
 function renderSteps(){
  if(!state)return;
  const chapterId=typeof state.chapter==='string'?state.chapter:state.chapter?.id||state.step.chapter;
  const select=$('#assembly-step-select');
  if(select.dataset.chapter!==chapterId){select.innerHTML=runtime.steps.map((s,i)=>({s,i})).filter(({s})=>s.chapter===chapterId).map(({s,i})=>`<option value="${i}">${i+1}. ${esc(local(s.label))}${s.type==='unit'&&totalOf(unitById(s.unitIds[0]))>1?` · ${esc(text().instance(s.instanceIndex,totalOf(unitById(s.unitIds[0]))))}`:''}</option>`).join('');select.dataset.chapter=chapterId;}
  select.value=String(state.index);$('#assembly-chapter').value=chapterId;
 }
 function refresh(){
  if(!state)return;const t=text();
  const button=$('#assembly-play'),playKey=`${lang}:${playing}:${state.complete}`;
  if(playKey!==lastPlayKey){
   const nextIcon=playing?'pause':'play';if(button.querySelector('.ui-icon')?.dataset.icon!==nextIcon)setControlIcon(button,nextIcon);
   setControlText(button,playing?t.pause:state.complete?t.replay:t.play);button.setAttribute('aria-pressed',String(playing));lastPlayKey=playKey;
  }
  $('#assembly-progress').value=String(progress*10000);$('#assembly-progress').setAttribute('aria-valuetext',`${t.stepCount(state.index+1,runtime.steps.length)}. ${local(state.step.label)}`);
  $('#assembly-percent').textContent=`${Math.round(progress*100)}%`;$('#assembly-step-count').textContent=t.stepCount(state.index+1,runtime.steps.length);
  $('#assembly-installed').textContent=t.status(state.installedCount,state.totalCount);
  $('#assembly-follow').setAttribute('aria-pressed',String(following));$('#assembly-interior').checked=interior;$('#assembly-narration').checked=narration;
  $('#assembly-previous').disabled=progress===0;$('#assembly-next').disabled=!!state.complete;
  $('#assembly-complete').hidden=!state.complete;
  renderSteps();information();
 }
 function pose(next,{notify=false}={}){
  progress=Math.max(0,Math.min(1,Number.isFinite(next)?next:0));
  const wasComplete=state?.complete;
  state=runtime.setProgress(progress,{interior,selectedId});
  if(state.complete)playing=false;
  const changed=state.index!==lastStep;
  if(changed){lastStep=state.index;lastInfo='';updateUrl();focus();}
  if((changed&&playing)||notify){announce(`${text().stepCount(state.index+1,runtime.steps.length)}. ${local(state.step.label)}`);if(narration)say(reading());}
  if(state.complete&&!wasComplete){announce(text().done);if(narration)say(text().done);} 
  refresh();
 }
 function reading(){const unit=unitById(selectedId)||unitById(state?.step?.unitIds?.[0]),entry=catalog.get(unit?.catalogId);return [text().stepCount((state?.index||0)+1,runtime.steps.length),unit?name(unit):local(state?.step?.label),local(selectedStep()?.description),entry?.function,entry?.location,local(unit?.note)].filter(Boolean).join('. ');}
 function seek(index){pause();selectedId=null;pose(runtime.progressForStep(Math.max(0,Math.min(runtime.steps.length-1,index))),{notify:true});focus(true);updateUrl();}
 function step(direction){
  if(!runtime)return;const pending=progress*runtime.totalDuration<state.step.end-1e-6;
  if(direction>0)seek(state.index+(pending?0:1));else if(state.index===0){pause();pose(0);}else seek(state.index-1);
 }
 function toggle(){
  if(!runtime)return;
  if(getSettings().reduceMotion){if(state.complete){pause();selectedId=null;pose(0,{notify:true});focus(true);}else step(1);return;}
  if(playing)pause();else {if(state.complete){selectedId=null;pose(0);}playing=true;if(narration)say(reading());}refresh();
 }
 function translate(){
  lang=getLanguage();catalog=new Map(getCatalog(lang).map(e=>[e.id,e]));lastInfo='';const t=text();
  inspector.setAttribute('aria-label',t.title);
  for(const node of inspector.querySelectorAll('[data-assembly-copy]'))node.textContent=t[node.dataset.assemblyCopy];
  for(const node of transport.querySelectorAll('[data-assembly-copy]'))node.textContent=t[node.dataset.assemblyCopy];
  $('#assembly-search').placeholder=t.searchHint;$('#assembly-progress').setAttribute('aria-label',t.progress);
  for(const [id,key]of [['assembly-previous','previous'],['assembly-next','next'],['assembly-restart','restart']])$('#'+id).setAttribute('aria-label',t[key]);
  $('#assembly-speed').innerHTML=`<option value="0.5">${esc(t.slow)}</option><option value="1">${esc(t.normal)}</option><option value="2">${esc(t.fast)}</option>`;$('#assembly-speed').value=String(speed);
  if(runtime){$('#assembly-uncertainties').innerHTML=runtime.inventory.uncertainties.map(item=>`<dt>${esc(local(item.label))}</dt><dd>${esc(local(item.note))}</dd>`).join('');$('#assembly-chapter').innerHTML=runtime.chapters.map(c=>`<option value="${c.id}">${esc(local(c.label))}</option>`).join('');$('#assembly-step-select').dataset.chapter='';refresh();renderSearch();}
 }
 transport.innerHTML=`<div class="assembly-buttons"><button type="button" id="assembly-play" class="primary">${icon('play')}<span class="control-label"></span></button><button type="button" id="assembly-previous">${icon('skip-back')}</button><button type="button" id="assembly-next">${icon('skip-forward')}</button><button type="button" id="assembly-restart">${icon('arrow-counter-clockwise')}</button><label><span data-assembly-copy="speed"></span><select id="assembly-speed"></select></label></div><div class="assembly-scrubber"><label for="assembly-progress" id="assembly-step-count"></label><input id="assembly-progress" type="range" min="0" max="10000" step="1" value="0"><output id="assembly-percent">0%</output></div>`;
 inspector.innerHTML=`<header class="assembly-inspector-heading"><div><h2 data-assembly-copy="title"></h2><p id="assembly-installed"></p></div><button type="button" id="assembly-exit"><span data-assembly-copy="return"></span>${icon('arrow-up-right')}</button></header><div class="assembly-inspector-scroll"><label class="lab" for="assembly-chapter" data-assembly-copy="chapter"></label><select id="assembly-chapter"></select><label class="lab" for="assembly-step-select" data-assembly-copy="step"></label><select id="assembly-step-select"></select><div class="assembly-camera-tools"><button type="button" id="assembly-follow" aria-pressed="true">${icon('crosshair')}<span data-assembly-copy="follow"></span></button><label class="chk"><input id="assembly-interior" type="checkbox" checked><span data-assembly-copy="interior"></span></label></div><p class="assembly-complete" id="assembly-complete" hidden><strong data-assembly-copy="complete"></strong><span data-assembly-copy="done"></span></p><article class="assembly-unit-info"><p id="assembly-instance" class="assembly-meta"></p><h3 id="assembly-unit-title"></h3><p id="assembly-step-description"></p><details><summary data-assembly-copy="function"></summary><p id="assembly-does"></p></details><details><summary data-assembly-copy="where"></summary><p id="assembly-where"></p></details><details><summary data-assembly-copy="evidence"></summary><p id="assembly-evidence"></p></details><a id="assembly-catalog" data-assembly-copy="catalog"></a><button type="button" id="assembly-locate" data-assembly-copy="locate"></button></article><div class="assembly-speech"><button type="button" id="assembly-listen">${icon('speaker-high')}<span data-assembly-copy="listen"></span></button><label class="chk"><input id="assembly-narration" type="checkbox"><span data-assembly-copy="narration"></span></label></div><label for="assembly-search" class="lab" data-assembly-copy="search"></label><input id="assembly-search" type="search" autocomplete="off" aria-describedby="assembly-result-count"><p id="assembly-result-count" class="assembly-meta" aria-live="polite"></p><div id="assembly-results"></div><article class="assembly-unit-info assembly-uncertainties"><details><summary data-assembly-copy="uncertainties"></summary><dl id="assembly-uncertainties"></dl></details></article><p class="assembly-limits" data-assembly-copy="educational"></p></div>`;
 $('#assembly-play').onclick=toggle;$('#assembly-previous').onclick=()=>step(-1);$('#assembly-next').onclick=()=>step(1);
 $('#assembly-restart').onclick=()=>{pause();selectedId=null;pose(0,{notify:true});focus(true);};
 $('#assembly-speed').onchange=e=>{speed=Number(e.target.value);};
 $('#assembly-progress').oninput=e=>{pause();selectedId=null;pose(Number(e.target.value)/10000);};
 $('#assembly-progress').onchange=updateUrl;
 $('#assembly-progress').onpointerdown=()=>{pause();refresh();};
 for(const id of ['assembly-chapter','assembly-step-select'])$('#'+id).onfocus=()=>{pause();refresh();};
 $('#assembly-chapter').onchange=e=>seek(runtime.steps.findIndex(s=>s.chapter===e.target.value));
 $('#assembly-step-select').onchange=e=>seek(Number(e.target.value));
 $('#assembly-follow').onclick=()=>{following=!following;lastCameraStep=-1;if(following)focus(true);refresh();};
 $('#assembly-interior').onchange=e=>{interior=e.target.checked;pose(progress);};
 $('#assembly-narration').onchange=e=>{narration=e.target.checked;if(narration)say(reading());else if('speechSynthesis'in window)speechSynthesis.cancel();};
 $('#assembly-listen').onclick=()=>{if('speechSynthesis'in window&&speechSynthesis.speaking)speechSynthesis.cancel();else say(reading());};
 $('#assembly-exit').onclick=()=>{onExit();app.querySelector('[data-view][aria-checked="true"]')?.focus();};$('#assembly-search').oninput=renderSearch;
 $('#assembly-results').onclick=e=>{const button=e.target.closest('[data-unit]');if(button)selectUnit(button.dataset.unit);};
 $('#assembly-locate').onclick=e=>{const index=runtime.findStep(e.currentTarget.dataset.unit);if(index>=0)seek(index);};
 translate();
 const ray=new THREE.Raycaster();
 return {
  get runtime(){return runtime;},get active(){return active;},get state(){return {...state,playing,following};},
  enter({stepId}={}){
   if(active&&!stepId)return true;
   if(!runtime){try{runtime=createAssemblyRuntime();runtime.root.visible=false;st.scene.add(runtime.root);}catch(error){announce(text().loadError);console.error('Assembly initialization failed',error);return false;}}
   if(!active){savedMinDistance=st.controls.minDistance;st.controls.minDistance=.06;}
   active=true;playing=false;app.dataset.assembly='true';runtime.root.visible=true;
   $('.transport').hidden=true;transport.hidden=false;inspector.hidden=false;$('.inspector-tabs').hidden=true;$('.inspector-body').hidden=true;
   $('.leaders').setAttribute('hidden','');$('.labels').hidden=true;$('.legend').hidden=true;st.eng.root.visible=false;st.flows.root.visible=false;
   translate();const index=stepId?runtime.findStep(stepId):-1;if(index>=0)progress=runtime.progressForStep(index);
   pose(progress);lastCameraStep=-1;
   if(savedCamera&&index<0){camTo(savedCamera,true);lastCameraStep=state.index;}else focus(true);
   updateUrl();return true;
  },
  leave(){if(active){savedCamera=cameraSnapshot();if(savedMinDistance!==null)st.controls.minDistance=savedMinDistance;}active=false;pause();if(runtime)runtime.root.visible=false;delete app.dataset.assembly;$('.transport').hidden=false;transport.hidden=true;inspector.hidden=true;$('.inspector-tabs').hidden=false;$('.inspector-body').hidden=false;$('.leaders').removeAttribute('hidden');$('.labels').hidden=false;$('.legend').hidden=false;st.eng.root.visible=true;if('speechSynthesis'in window)speechSynthesis.cancel();},
  tick(dt){if(!active)return;if(playing){if(getSettings().reduceMotion){playing=false;refresh();}else pose(progress+Math.max(0,Math.min(.1,dt))*speed/runtime.totalDuration);}},
  translate,step,toggle,
  manualCamera(){following=false;refresh();},
  resetCamera(){following=true;lastCameraStep=-1;focus(true);refresh();},
  focusSearch(){$('#assembly-search').focus();},
  clear(){selectedId=null;lastInfo='';pose(progress);},
  pick(x,y){
   if(!active)return;ray.setFromCamera(new THREE.Vector2(x/st.size.w*2-1,-y/st.size.h*2+1),st.camera);
   const hit=ray.intersectObject(runtime.root,true).find(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return true;});
   if(!hit)return;let node=hit.object;while(node&&!node.userData.assemblyUnitId)node=node.parent;
   if(node?.userData.assemblyUnitId)selectUnit(node.userData.assemblyUnitId);
  }
 };
}
