/** Browser application. Its visible Start controls trigger the export. */
import {getCatalog} from '../src/anatomy/catalog-i18n.js';
import SCENES from '../src/anatomy/scenes.json';
import {mountPbrFigure} from '../src/anatomy/pbr-runtime.js';
import {VIDEO,frameState,palette,drawCaptions} from './anatomy-video-content.mjs';

const $=id=>document.getElementById(id);
const output=$('preview'),ctx=output.getContext('2d',{alpha:false});
const stage=$('pbr-stage'),selection=$('piece');
let config,figure,CATALOG,active=false,stopAfterPiece=false;
const log=message=>{
  const li=document.createElement('li');li.textContent=message;$('log').prepend(li);
  while($('log').children.length>30)$('log').lastElementChild.remove();
};
async function api(route,body){
  const response=await fetch(route,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();if(!response.ok)throw new Error(data.error || `HTTP ${response.status}`);return data;
}
function resolveScene(entry){
  const ref=SCENES[entry.id] || SCENES[entry.kind];
  const scene=typeof ref==='string'?SCENES[ref]:ref;
  if(!scene)throw new Error(`No se encontró la escena de ${entry.label}.`);
  return scene;
}
function mount(entry){
  figure?.destroy();figure=null;stage.replaceChildren();
  const fieldHeight=VIDEO.height-VIDEO.top-VIDEO.bottom;
  stage.style.width=`${VIDEO.width}px`;stage.style.height=`${fieldHeight}px`;
  figure=mountPbrFigure(stage,resolveScene(entry),entry,{pixelRatio:1,cameraAspect:VIDEO.width/fieldHeight});
  if(!figure?.canvas || !figure?.update)throw new Error('El visor PBR no expuso el canvas de exportación.');
}
function paint(entry,frame){
  const state=frameState(entry,frame,config.frames),p=palette(config.theme);
  // update() renders synchronously. Read the drawing buffer in this same turn,
  // before yielding to the browser; preserveDrawingBuffer is not required.
  figure.update({phase:state.phase,angle:state.angle,zoom:1,theme:config.theme});
  ctx.fillStyle=p.bg;ctx.fillRect(0,0,VIDEO.width,VIDEO.height);
  ctx.drawImage(figure.canvas,0,VIDEO.top,VIDEO.width,VIDEO.height-VIDEO.top-VIDEO.bottom);
  drawCaptions(ctx,entry,state.progress,{...VIDEO,theme:config.theme,language:config.language});
}
const jpeg=()=>new Promise((resolve,reject)=>output.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo leer el fotograma del canvas.')),'image/jpeg',0.94));
function buttons(){
  $('start-all').disabled=active;$('start-one').disabled=active;selection.disabled=active;
  $('stop').disabled=!active;
}
function showResult(entry){
  const video=$('result');video.src=`/media/${entry.id}.mp4?revision=${config.revision}`;
  video.poster=`/media/${entry.id}.jpg?revision=${config.revision}`;video.load();
  $('result-section').hidden=false;$('result-title').textContent=`Video terminado: ${entry.label}`;
}
async function run(entries,force=false){
  if(active)return;
  active=true;stopAfterPiece=false;$('stop').textContent='Detener al terminar esta pieza';buttons();$('error').textContent='';
  const start=performance.now();let completed=0,openId=null;
  try{
    for(const entry of entries){
      if(stopAfterPiece)break;
      $('status').textContent=`Preparando ${entry.label}…`;
      const begin=await api('/api/start',{id:entry.id,force});
      if(begin.cached){completed++;log(`Ya verificado: ${entry.label}`);continue;}
      openId=entry.id;mount(entry);
      // Allow layout to settle once. A timer also continues when the export tab
      // loses focus; frame poses advance by index, never by wall-clock time.
      await new Promise(resolve=>setTimeout(resolve,0));
      for(let frame=0;frame<config.frames;frame++){
        paint(entry,frame);
        const blob=await jpeg();
        const response=await fetch(`/api/frame?id=${encodeURIComponent(entry.id)}&n=${frame}`,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});
        if(!response.ok){const failure=await response.json();throw new Error(failure.error || 'El receptor rechazó un fotograma.');}
        if(frame%6===0 || frame===config.frames-1){
          $('status').textContent=`${completed+1}/${entries.length} · ${entry.label} · fotograma ${frame+1}/${config.frames}`;
          $('progress').value=(completed+(frame+1)/config.frames)/entries.length;
        }
      }
      $('status').textContent=`Verificando ${entry.label}…`;
      const result=await api('/api/finish',{id:entry.id});openId=null;completed++;
      log(`✓ ${entry.label} · ${result.duration}s · ${Math.round(result.bytes/1024)} KB`);
      if(entries.length===1 || completed===entries.length)showResult(entry);
    }
    const state=await api('/api/state');
    $('status').textContent=stopAfterPiece?`Detenido entre piezas. ${state.completed}/${state.total} videos PBR verificados.`:`Listo. ${state.completed}/${state.total} videos PBR verificados.`;
    $('progress').value=completed/entries.length;
    log(`Sesión: ${completed} piezas procesadas en ${((performance.now()-start)/1000).toFixed(1)}s.`);
  }catch(error){
    if(openId)await api('/api/abort',{id:openId}).catch(()=>{});
    $('error').textContent=`Error: ${error.message}`;$('status').textContent='La exportación se detuvo. Los videos ya terminados están guardados.';
    log(`Error: ${error.message}`);
  }finally{active=false;buttons();$('stop').textContent='Detener al terminar esta pieza';}
}
async function preview(){
  if(active)return;
  const entry=CATALOG.find(e=>e.id===selection.value);if(!entry)return;
  try{mount(entry);await new Promise(requestAnimationFrame);paint(entry,Math.round(config.frames*.16));$('status').textContent=`Vista previa: ${entry.label}`;}
  catch(error){$('error').textContent=`Error: ${error.message}`;}
}
async function boot(){
  try{
    config=await api('/api/config');
    CATALOG=getCatalog(config.language);
    for(const entry of CATALOG){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.label;selection.append(option);}
    selection.value='piston';output.width=VIDEO.width;output.height=VIDEO.height;
    await document.fonts.ready;
    selection.addEventListener('change',preview);
    $('start-one').addEventListener('click',()=>run([CATALOG.find(e=>e.id===selection.value)],true));
    $('start-all').addEventListener('click',()=>run(CATALOG));
    $('stop').addEventListener('click',()=>{stopAfterPiece=true;$('stop').disabled=true;$('stop').textContent='Se detendrá al terminar esta pieza';});
    $('discard').addEventListener('click',async()=>{
      try{await api('/api/abort',{});$('discard').hidden=true;$('error').textContent='';$('status').textContent='La pieza interrumpida se descartó. Puedes volver a exportar.';}
      catch(error){$('error').textContent=`Error: ${error.message}`;}
    });
    $('status').textContent=`Preparado: ${CATALOG.length} piezas · ${VIDEO.seconds}s · ${VIDEO.fps}fps · ${VIDEO.width}×${VIDEO.height}`;
    buttons();await preview();
    const state=await api('/api/state');
    if(state.active){$('discard').hidden=false;$('status').textContent=`Existe una exportación interrumpida: ${state.active.id}. Descártala antes de continuar.`;}
  }catch(error){$('error').textContent=`Error de inicio: ${error.message}`;}
}
boot();
