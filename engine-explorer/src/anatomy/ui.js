import {createDisclosures} from '../ui/disclosures.js';
import {mountGlyphBackground} from '../ui/glyph-background.js';
import {readAppearance,writeTheme} from '../ui/appearance.js';
import {icon, SYSTEM_ICONS, setControlText, setControlIcon} from '../ui/icons.js';
import {CATALOG_REFERENCE_ROOT, LEGACY_COMPONENT_ALIASES} from './catalog.js';
import {getCatalog, getCatalogSystems, getRemovedComponents} from './catalog-i18n.js';
import {getLanguage, setLanguage, chooseLanguage, LANGUAGE_OPTIONS} from '../i18n/locale.js';
import SCENES from './scenes.json';
import {ENGINE} from '../engine-spec.js';
import {mountPbrFigure} from './pbr-runtime.js';

const mediaRevision=typeof __ANATOMY_MEDIA_REVISION__==='string'?__ANATOMY_MEDIA_REVISION__:'development';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normal = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const views = {exterior:'exterior',bottom:'lower',balance:'lower',head:'noCover',manual:'exterior',timing:'noTiming',intake:'exterior',exhaust:'exterior',ignition:'noCover',oil:'lower',cooling:'noTiming',accessory:'exterior'};
const motionTranslations = {fixed:['Permanece fija','Stationary'],rotate:['Giro','Rotation'],reciprocate:['Movimiento alternativo','Reciprocating motion'],rock:['Oscilación','Oscillation'],spring:['Compresión elástica','Spring compression'],flow:['Paso de fluido','Fluid flow'],switch:['Accionamiento','Actuation']};
const saved = (key,fallback) => { try { return JSON.parse(localStorage.getItem('f22.anatomy.'+key)) ?? fallback; } catch { return fallback; } };
const remember = (key,value) => { try { localStorage.setItem('f22.anatomy.'+key,JSON.stringify(value)); } catch {} };

export function runAnatomy() {
  let language=getLanguage(),CATALOG=getCatalog(language),CATALOG_SYSTEMS=getCatalogSystems(language);
  const t=(es,en)=>chooseLanguage(es,en,language);
  const motionName=type=>t(...(motionTranslations[type]||['Demostración','Demonstration']));
  const alternateCatalog=()=>getCatalog(language==='es'?'en':'es');
  const root=document.getElementById('app');
  const requested=new URLSearchParams(location.search).get('piece');
  const resolved=LEGACY_COMPONENT_ALIASES[requested]||requested;
  const removed=getRemovedComponents(language)[requested];
  const S={entry:CATALOG.find(x=>x.id===resolved)||CATALOG.find(x=>x.id==='piston')||CATALOG[0],query:'',system:'',mode:'3d',info:'function',phase:0,angle:0,tilt:0,zoom:1,demonstrating:false,playing:false,speed:1,theme:readAppearance().theme,scale:readAppearance().scale,large:saved('large',false)};
  root.innerHTML=`
    <a class="skip" href="#catalog-search">Buscar una pieza</a>
    <header class="atlas-header">
      <div class="atlas-brand"><a href="index.html" class="back-engine">${icon('arrow-left')}<span class="control-label">Motor completo</span></a><div><h1><span class="control-label">Anatomía del F22A6</span></h1><p>Piezas individuales · Honda Accord EX 1993 · 5MT</p></div></div>
      <div class="header-actions"><label class="language-control" for="language-select"><span>${icon('globe')}Idioma / Language</span><select id="language-select">${LANGUAGE_OPTIONS.map(option=>`<option value="${option.value}" lang="${option.value}">${option.label}</option>`).join('')}</select></label><button id="large-text" aria-label="Texto grande" aria-pressed="false">${icon('text-aa')}<span class="control-label">Texto grande</span></button><button id="theme-toggle">${icon('moon')}<span class="control-label">Contraste oscuro</span></button></div>
    </header>
    <p id="legacy-notice" class="notice" role="status" ${removed||resolved!==requested?'':'hidden'}>${esc(removed?`${removed.label}: ${removed.reason}`:resolved!==requested?'Este enlace se ha actualizado al tipo de pieza correspondiente del F22A6.':'')}</p>
    <main class="atlas-layout">
      <aside class="catalog" aria-label="Catálogo de piezas">
        <div class="catalog-heading"><h2>${icon('exploded','mechanical')}<span class="control-label">Explorar piezas</span></h2><button id="catalog-toggle" aria-expanded="false" aria-controls="catalog-content">${icon('list-bullets')}<span class="control-label">Catálogo</span></button><span class="total-count">${CATALOG.length}</span></div>
        <div id="catalog-content"><label class="sr" for="catalog-search">Buscar piezas</label><input id="catalog-search" type="search" placeholder="Pistón, resorte, tornillo…" autocomplete="off">
        <label class="sr" for="catalog-system">Sistema del motor</label><select id="catalog-system"><option value="">Todos los sistemas</option>${CATALOG_SYSTEMS.map(s=>`<option value="${esc(s.id)}">${esc(s.label)}</option>`).join('')}</select>
        <p id="results-count" class="results-count" aria-live="polite"></p>
        <div id="catalog-list"></div>
        <p class="catalog-foot">Cada ficha representa un tipo de pieza. Las cantidades indican sus repeticiones en el motor.</p></div>
      </aside>
      <section class="workspace" aria-labelledby="piece-title">
        <header class="piece-header"><div><p class="eyebrow"><span id="piece-system-icon"></span><span id="piece-system"></span></p><h2 id="piece-title" tabindex="-1"></h2><p id="piece-english" class="secondary-name"></p></div><div class="piece-navigation"><button id="previous-piece" aria-label="Pieza anterior">${icon('arrow-left')}</button><span id="piece-index"></span><button id="next-piece" aria-label="Pieza siguiente">${icon('arrow-right')}</button></div></header>
        <div class="piece-workbench">
          <section class="visual-column" aria-label="Representación de la pieza">
            <div class="visual-tabs" role="tablist" aria-label="Ver la pieza"><button id="mode-3d" role="tab" aria-selected="true" aria-controls="model-panel" tabindex="0">${icon('cube')}<span class="control-label">Modelo 3D</span></button><button id="mode-video" role="tab" aria-selected="false" aria-controls="video-panel" tabindex="-1">${icon('video-camera')}<span class="control-label">Video explicado</span></button></div>
            <div id="model-panel" role="tabpanel" aria-labelledby="mode-3d">
              <div class="mechanism-controls"><button id="play-mechanism" class="primary">${icon('play')}<span class="control-label">Ver movimiento</span></button><label class="speed-label"><span>Velocidad</span><select id="mechanism-speed"><option value="0.5">Lenta</option><option value="1" selected>Normal</option></select></label><button id="step-mechanism" aria-label="Avanzar un paso del mecanismo">${icon('skip-forward')}<span class="control-label">Paso</span></button></div>
              <div class="figure-plate" id="figure-plate"><div class="figure-caption"><span id="figure-number"></span><span id="motion-badge"></span></div><div id="figure-stage" class="pbr-stage" role="group" tabindex="0" aria-label="Modelo tridimensional. Arrastra para girar e inclinar. Usa las flechas para cambiar la vista; más y menos para ampliar."></div><div class="figure-foot"><div class="inspection-controls"><button id="rotate-left" aria-label="Girar vista a la izquierda">${icon('arrow-counter-clockwise')}</button><button id="rotate-right" aria-label="Girar vista a la derecha">${icon('arrow-clockwise')}</button><span class="control-separator"></span><button id="zoom-out" aria-label="Alejar pieza">${icon('magnifying-glass-minus')}</button><button id="zoom-in" aria-label="Acercar pieza">${icon('magnifying-glass-plus')}</button><button id="reset-piece">${icon('crosshair')}<span class="control-label">Restablecer vista</span></button></div><span id="angle-readout">Vista 0°</span></div></div>
              <label class="phase-control"><span>Recorrido de la demostración</span><input id="phase-slider" type="range" min="0" max="1000" value="0" aria-label="Recorrido de la demostración"><output id="phase-output">0%</output></label>
              <p class="motion-caption" id="motion-caption"></p>
            </div>
            <div id="video-panel" role="tabpanel" aria-labelledby="mode-video" hidden><video id="piece-video" controls playsinline preload="none" aria-label="Video explicativo de la pieza"></video><p class="video-description">Video con textos en español. Para oír la explicación, usa Escuchar. Puedes pausar, ampliar o descargar el video.</p><a id="download-video" class="button-link" download>${icon('download-simple')}<span class="control-label">Descargar MP4</span></a><p id="video-error" class="notice" hidden>El video no está disponible en esta copia. Conserva la colección anatomy-media/f22a6 junto a esta página.</p></div>
            <div class="representation-note">${icon('info')}<p>Representación didáctica basada en las referencias disponibles. Las formas pequeñas y los recorridos sin medida documentada son aproximados.</p></div>
          </section>
          <aside class="piece-explanation" aria-label="Explicación de la pieza">
            <div class="piece-meta"><span id="quantity-tag"></span><button id="read-piece" aria-pressed="false">${icon('speaker-high')}<span class="control-label">Escuchar</span></button></div>
            <div class="info-tabs" role="tablist" aria-label="Información de la pieza"><button id="info-function" role="tab" data-info="function" aria-selected="true" aria-controls="info-content" tabindex="0">${icon('info')}<span class="control-label">Función</span></button><button id="info-motion" role="tab" data-info="motion" aria-selected="false" aria-controls="info-content" tabindex="-1">${icon('gauge')}<span class="control-label">Movimiento</span></button><button id="info-reference" role="tab" data-info="reference" aria-selected="false" aria-controls="info-content" tabindex="-1">${icon('book-open')}<span class="control-label">Referencia</span></button></div>
            <section id="info-content" role="tabpanel" aria-labelledby="info-function"></section>
            <a id="locate-piece" class="locate-link"><span class="control-label">Ubicar su conjunto en el motor</span>${icon('arrow-up-right')}</a>
          </aside>
        </div>
        <footer class="atlas-footer"><span>Anatomy · Piezas y mecanismos del F22A6</span><span>Motor confirmado · mercado/emisiones por verificar</span></footer>
      </section>
    </main><div class="sr" id="announcement" aria-live="polite"></div>`;
  const $=q=>root.querySelector(q), $$=q=>[...root.querySelectorAll(q)];
  mountGlyphBackground();
  const disclosure=createDisclosures(root);
  let figure=null,raf=0,last=0,drag=null,speaking=false,utterance=null,mediaSequence=0,mediaResume=null,metadataHandler=null;
  const announce=text=>{$('#announcement').textContent=text;};
  // Accept names in either language so a language switch preserves search results.
  const matches=()=>{const alternate=new Map(alternateCatalog().map(e=>[e.id,e]));return CATALOG.filter(e=>(!S.system||e.system===S.system)&&normal([e.label,e.english,e.function,alternate.get(e.id)?.label,alternate.get(e.id)?.function,...(e.oem||[]).map(o=>o.pn)].join(' ')).includes(normal(S.query)));};
  const applyTheme=()=>{document.documentElement.dataset.theme=S.theme;document.documentElement.style.setProperty('--scale',Math.min(2.4,S.scale*(S.large?1.2:1)));document.documentElement.classList.toggle('large-text',S.large||S.scale>1.6);$('#figure-plate').dataset.theme=S.theme;setControlText($('#theme-toggle'),S.theme==='light'?t('Contraste oscuro','Dark contrast'):t('Contraste claro','Light contrast'));setControlIcon($('#theme-toggle'),S.theme==='light'?'moon':'sun');$('#large-text').setAttribute('aria-pressed',String(S.large));remember('theme',S.theme);remember('large',S.large);};
  function renderStaticLanguage(){
    document.documentElement.lang=language;
    document.title=t('Anatomía del Honda F22A6 · Piezas individuales','Honda F22A6 anatomy · Individual parts');
    document.querySelector('meta[name="description"]')?.setAttribute('content',t('Piezas individuales del Honda F22A6 1993 EX 5MT: modelos 3D, funcionamiento y videos explicativos.','Individual parts of the Honda F22A6 1993 EX 5MT: 3D models, operation and explanatory videos.'));
    const labels={
      '.skip':['Buscar una pieza','Find a part'],'.back-engine':['Motor completo','Complete engine'],
      '.atlas-brand h1':['Anatomía del F22A6','F22A6 anatomy'],'.atlas-brand p':['Piezas individuales · Honda Accord EX 1993 · 5MT','Individual parts · 1993 Honda Accord EX · 5MT'],
      '#large-text':['Texto grande','Large text'],'.catalog-heading h2':['Explorar piezas','Explore parts'],'#catalog-toggle':['Catálogo','Catalogue'],
      'label[for="catalog-search"]':['Buscar piezas','Search parts'],'label[for="catalog-system"]':['Sistema del motor','Engine system'],
      '.catalog-foot':['Cada ficha representa un tipo de pieza. Las cantidades indican sus repeticiones en el motor.','Each entry represents a type of part. Quantities show how many are used in the engine.'],
      '#mode-3d':['Modelo 3D','3D model'],'#mode-video':['Video explicado','Explained video'],
      '.speed-label>span':['Velocidad','Speed'],'#mechanism-speed option[value="0.5"]':['Lenta','Slow'],'#mechanism-speed option[value="1"]':['Normal','Normal'],
      '#step-mechanism':['Paso','Step'],'#reset-piece':['Restablecer vista','Reset view'],'.phase-control>span':['Recorrido de la demostración','Demonstration progress'],
      '.video-description':['Video con textos en español. Para oír la explicación, usa Escuchar. Puedes pausar, ampliar o descargar el video.','Video with English text. To hear the explanation, use Listen. You can pause, enlarge or download the video.'],
      '#download-video':['Descargar MP4','Download MP4'],'#video-error':['El video no está disponible en esta copia. Conserva la colección anatomy-media/f22a6 junto a esta página.','The video is unavailable in this copy. Keep the anatomy-media/f22a6 collection alongside this page.'],
      '#info-function':['Función','Function'],'#info-motion':['Movimiento','Motion'],'#info-reference':['Referencia','Reference'],
      '#locate-piece':['Ubicar su conjunto en el motor','Locate its assembly in the engine'],
      '.atlas-footer span:first-child':['Anatomy · Piezas y mecanismos del F22A6','Anatomy · F22A6 parts and mechanisms'],
      '.atlas-footer span:last-child':['Motor confirmado · mercado/emisiones por verificar','Engine confirmed · market/emissions unverified'],
    };
    for(const [selector,texts] of Object.entries(labels))setControlText($(selector),t(...texts));
    const aria={
      '#large-text':['Texto grande','Large text'],'#catalog-toggle':['Mostrar u ocultar catálogo','Show or hide catalogue'],'.catalog':['Catálogo de piezas','Parts catalogue'],
      '#previous-piece':['Pieza anterior','Previous part'],'#next-piece':['Pieza siguiente','Next part'],
      '.visual-column':['Representación de la pieza','Part representation'],'.visual-tabs':['Ver la pieza','View the part'],
      '#step-mechanism':['Avanzar un paso del mecanismo','Advance the mechanism one step'],
      '#rotate-left':['Girar vista a la izquierda','Rotate view left'],'#rotate-right':['Girar vista a la derecha','Rotate view right'],
      '#zoom-out':['Alejar pieza','Zoom out'],'#zoom-in':['Acercar pieza','Zoom in'],
      '#phase-slider':['Recorrido de la demostración','Demonstration progress'],'#mechanism-speed':['Velocidad','Speed'],
      '.piece-explanation':['Explicación de la pieza','Part explanation'],'.info-tabs':['Información de la pieza','Part information'],
    };
    for(const [selector,texts] of Object.entries(aria)){$(selector).setAttribute('aria-label',t(...texts));if($(selector).matches('button'))$(selector).title=t(...texts);}
    $('#catalog-search').placeholder=t('Pistón, resorte, tornillo…','Piston, spring, bolt…');
    $('#catalog-system').innerHTML=`<option value="">${t('Todos los sistemas','All systems')}</option>${CATALOG_SYSTEMS.map(s=>`<option value="${esc(s.id)}">${esc(s.label)}</option>`).join('')}`;
    $('#catalog-system').value=S.system;$('#language-select').value=language;
    renderPlayback();
    setControlText($('#read-piece'),speaking?t('Detener lectura','Stop reading'):t('Escuchar','Listen'));
    const legacy=getRemovedComponents(language)[requested];
    $('#legacy-notice').textContent=legacy?`${legacy.label}: ${legacy.reason}`:resolved!==requested?t('Este enlace se ha actualizado al tipo de pieza correspondiente del F22A6.','This link has been updated to the corresponding F22A6 part type.'):'';
    applyTheme();
  }
  function renderList(){
    const entries=matches();
    $('#results-count').textContent=`${entries.length} ${entries.length===1?t('pieza','part'):t('piezas','parts')}`;
    const grouped=CATALOG_SYSTEMS.map(s=>({...s,entries:entries.filter(e=>e.system===s.id)})).filter(s=>s.entries.length);
    $('#catalog-list').innerHTML=grouped.length?grouped.map(s=>`<details class="system-group" ${S.query||S.system||s.id===S.entry.system?'open':''}><summary>${icon(SYSTEM_ICONS[s.id],'mechanical')}<span class="group-name">${esc(s.label)}</span><span class="group-count">${s.entries.length}</span></summary><ul>${s.entries.map(e=>`<li><button data-piece="${esc(e.id)}" ${e.id===S.entry.id?'aria-current="true"':''}><span>${esc(e.label)}</span><span class="row-arrow" aria-hidden="true">${icon('arrow-up-right')}</span></button></li>`).join('')}</ul></details>`).join(''):`<div class="no-results"><p>${t('No hay coincidencias.','No matching parts.')}</p><button id="clear-search">${t('Mostrar todas las piezas','Show all parts')}</button></div>`;
    $('#clear-search')?.addEventListener('click',()=>{S.query='';S.system='';$('#catalog-search').value='';$('#catalog-system').value='';renderList();});
  }
  function renderInfo(){
    disclosure.capture();
    const e=S.entry;
    $$('[data-info]').forEach(b=>{const active=b.dataset.info===S.info;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    $('#info-content').setAttribute('aria-labelledby','info-'+S.info);
    const key=section=>`${e.id}:${S.info}:${section}`;
    if(S.info==='function') $('#info-content').innerHTML=
      disclosure(key('function'),t('Qué hace','What it does'),`<p class="lead-description">${esc(e.function)}</p>`,'info')+
      disclosure(key('location'),t('Dónde está','Where it is'),`<p>${esc(e.location)}</p>`,'map-pin')+
      disclosure(key('connections'),t('Con qué trabaja','What it connects to'),`<p>${esc(e.connections)}</p>`,'link');
    else if(S.info==='motion') $('#info-content').innerHTML=
      disclosure(key('motion'),motionName(e.motion.type),`<p class="lead-description">${esc(e.motion.description)}</p>`,'gauge')+
      disclosure(key('driver'),t('Qué lo acciona','What drives it'),`<p>${esc(e.motion.driver)}</p>`,'link')+
      disclosure(key('steps'),t('Paso a paso','Step by step'),`<ol class="explanation-steps">${e.steps.map((s,i)=>`<li><span>${i+1}</span><p>${esc(s)}</p></li>`).join('')}</ol>`,'list-bullets');
    else $('#info-content').innerHTML=
      disclosure(key('description'),t('Referencia de la pieza','Part reference'),`<p>${esc(e.note||t('Forma reconstruida para explicar su función. No es un plano de fabricación.','The shape is reconstructed to explain its function. It is not a manufacturing drawing.'))}</p>`,'info')+
      disclosure(key('diagrams'),t('Diagramas y números OEM','Diagrams and OEM numbers'),e.oem.length?`<ul class="oem-list">${e.oem.map(o=>`<li><a href="../Honda Reference Library/${CATALOG_REFERENCE_ROOT}/${esc(o.market||'KA')}/${esc(o.diagram)}.png" target="_blank" rel="noopener">${t('Abrir diagrama · llamada','Open diagram · callout')} ${esc(o.callout)}</a><p>${esc(o.pn)}</p></li>`).join('')}</ul>`:`<p>${t('Esta pieza se muestra como detalle del conjunto. No se ha confirmado una referencia OEM independiente.','This part is shown as a detail of the assembly. An independent OEM reference has not been confirmed.')}</p>`,'book-open')+
      disclosure(key('applicability'),t('Aplicación y precisión','Applicability and accuracy'),`<p>${esc(t(`Motor ${ENGINE.code} confirmado. Las listas KA/KL documentan variantes; no confirman el mercado de este vehículo. Un número de conjunto no identifica por separado cada detalle.`,`${ENGINE.code} engine confirmed. KA/KL catalogues document variants; they do not confirm this vehicle’s market. An assembly number does not identify each detail separately.`))}</p>`,'crosshair');
  }
  function draw(){
    figure?.update({angle:S.angle,tilt:S.tilt,zoom:S.zoom,theme:S.theme,inspection:!S.demonstrating,phase:S.phase,entry:S.entry});
    $('#figure-stage').style.setProperty('--figure-zoom',S.zoom);
    $('#angle-readout').textContent=`${t('Vista','View')} ${Math.round(((S.angle%360)+360)%360)}°`;
    $('#phase-slider').value=Math.round(S.phase*1000);
    $('#phase-slider').setAttribute('aria-valuetext',`${Math.round(S.phase*100)}%`);
    $('#phase-output').textContent=`${Math.round(S.phase*100)}%`;
  }
  function renderPlayback(){setControlText($('#play-mechanism'),S.playing?t('Pausar','Pause'):t('Ver movimiento','Show motion'));setControlIcon($('#play-mechanism'),S.playing?'pause':'play');$('#play-mechanism').setAttribute('aria-pressed',String(S.playing));}
  function stop(){S.playing=false;cancelAnimationFrame(raf);raf=0;renderPlayback();}
  function tick(now){
    if(!S.playing||S.mode!=='3d'||document.hidden){raf=0;return;}
    const dt=Math.min((now-last)/1000,1/30);last=now;
    S.phase=(S.phase+dt*S.speed/8)%1;draw();raf=requestAnimationFrame(tick);
  }
  function play(){
    if(S.playing){stop();return;}
    S.demonstrating=true;S.playing=true;renderPlayback();last=performance.now();raf=requestAnimationFrame(tick);
  }
  function setMode(mode,focus=false){
    S.mode=mode;stop();$('#piece-video').pause();
    for(const id of ['3d','video']){const on=id===mode;$('#mode-'+id).setAttribute('aria-selected',String(on));$('#mode-'+id).tabIndex=on?0:-1;$('#'+(id==='3d'?'model':'video')+'-panel').hidden=!on;}
    if(focus)$('#mode-'+mode).focus();
  }
  function stopSpeech(){if(utterance){utterance.onend=null;utterance.onerror=null;utterance=null;}if('speechSynthesis'in window)speechSynthesis.cancel();speaking=false;setControlText($('#read-piece'),t('Escuchar','Listen'));$('#read-piece').setAttribute('aria-pressed','false');}
  function renderEntryText(){
    const entry=S.entry;
    $('#piece-system-icon').innerHTML=icon(SYSTEM_ICONS[entry.system],'mechanical');
    $('#piece-system').textContent=CATALOG_SYSTEMS.find(s=>s.id===entry.system)?.label||entry.system;
    $('#piece-title').textContent=entry.label;
    const alternate=alternateCatalog().find(e=>e.id===entry.id);
    $('#piece-english').innerHTML=`${t('En inglés:','In Spanish:')} <span lang="${language==='es'?'en':'es'}">${esc(alternate?.label||entry.english)}</span>`;
    const index=CATALOG.findIndex(e=>e.id===entry.id)+1;
    $('#piece-index').textContent=`${index} / ${CATALOG.length}`;$('#figure-number').textContent=`FIG. ${String(index).padStart(2,'0')}`;
    $('#motion-badge').textContent=motionName(entry.motion.type);$('#quantity-tag').textContent=entry.quantity;
    const fixed=entry.motion.type==='fixed';
    $('#play-mechanism').disabled=fixed;$('#step-mechanism').disabled=fixed;$('#mechanism-speed').disabled=fixed;$('#phase-slider').disabled=fixed;
    $('.mechanism-controls').hidden=fixed;$('.phase-control').hidden=fixed;
    $('#motion-caption').textContent=fixed?t('Esta pieza permanece fija durante el funcionamiento. Girar la vista permite inspeccionarla.','This part stays fixed while the engine runs. Rotate the view to inspect it.'):entry.motion.description;
    if(['pump-oil','pump-water','pump-power-steering'].includes(entry.id)) $('#motion-caption').textContent+=t(' La sección muestra el giro interno; no calcula presión ni caudal.',' The cutaway shows internal rotation; it does not calculate pressure or flow rate.');
    $('.representation-note p').textContent=figure?.provenance==='engine'?t('Geometría extraída del motor completo, con los mismos materiales. Las dimensiones no documentadas siguen siendo aproximadas.','Geometry extracted from the complete engine, using the same materials. Undocumented dimensions remain approximate.'):t('Reconstrucción complementaria: este detalle no está extraído del motor completo. Forma y recorridos sin medida documentada son aproximados.','Supplementary reconstruction: this detail is not extracted from the complete engine. Undocumented shapes and travel are approximate.');
    $('#figure-stage').setAttribute('aria-label',`${entry.label}. ${t('Modelo tridimensional. Arrastra para girar e inclinar. Usa las flechas para cambiar la vista; más y menos para ampliar.','Three-dimensional model. Drag to rotate and tilt. Use the arrow keys to change the view; plus and minus to zoom.')}`);
    $('#figure-stage').setAttribute('lang',language);
    if(!figure)$('#figure-stage').innerHTML=`<p class="figure-error">${t('La representación de esta pieza no se pudo cargar.','The representation of this part could not be loaded.')}</p>`;
    $('#locate-piece').href=`index.html?part=${encodeURIComponent(entry.parentId)}&view=${encodeURIComponent(views[entry.system]||'exterior')}`;
    renderInfo();draw();
  }
  function updateVideo(preserve=false){
    const video=$('#piece-video'),entry=S.entry;
    // A language change swaps only the media source, retaining the viewer state.
    const resume=preserve?(mediaResume||{time:video.currentTime||0,playing:!video.paused,rate:video.playbackRate,captions:[...video.textTracks].some(track=>track.mode==='showing')}):null;
    const sequence=++mediaSequence;mediaResume=resume;
    if(metadataHandler){video.removeEventListener('loadedmetadata',metadataHandler);metadataHandler=null;}
    video.pause();
    const base=`anatomy-media/f22a6/${language==='en'?'en/':''}${entry.id}`;
    video.src=`${base}.mp4?v=${mediaRevision}`;video.poster=`${base}.jpg?v=${mediaRevision}`;
    video.setAttribute('aria-label',`${t('Video explicativo','Explanatory video')}: ${entry.label}`);
    video.setAttribute('lang',language);
    video.innerHTML=`<track kind="captions" src="${base}.vtt?v=${mediaRevision}" srclang="${language}" label="${language==='es'?'Español':'English'}" ${resume?.captions?'default':''}>`;
    $('#download-video').href=video.src;$('#download-video').download=`honda-f22a6-${entry.id}-${language}.mp4`;$('#video-error').hidden=true;
    if(resume){
      metadataHandler=()=>{
        if(sequence!==mediaSequence)return;
        video.currentTime=Math.min(resume.time,Number.isFinite(video.duration)?video.duration:resume.time);
        video.playbackRate=resume.rate;
        if(video.textTracks[0])video.textTracks[0].mode=resume.captions?'showing':'disabled';
        mediaResume=null;metadataHandler=null;
        if(resume.playing&&S.mode==='video')video.play().catch(()=>{});
      };
      video.addEventListener('loadedmetadata',metadataHandler,{once:true});
      if(S.mode==='video'||resume.time>0)video.load();
    }
  }
  function choose(entry,focus=false){
    if(!entry)return;
    stop();stopSpeech();figure?.destroy();S.entry=entry;S.phase=0;S.angle=0;S.tilt=0;S.zoom=1;S.demonstrating=false;
    $('#figure-stage').innerHTML='';
    const sceneRef=SCENES[entry.id]||SCENES[entry.kind];
    const scene=typeof sceneRef==='string'?SCENES[sceneRef]:sceneRef;
    figure=scene?mountPbrFigure($('#figure-stage'),scene,entry):null;
    renderEntryText();updateVideo();renderList();
    try{history.replaceState(null,'',`?piece=${encodeURIComponent(entry.id)}`);}catch{}
    announce(`${t('Pieza seleccionada','Selected part')}: ${entry.label}. ${entry.quantity}.`);
    if(focus)$('#piece-title').focus({preventScroll:true});
  }
  function changeLanguage(){
    const next=getLanguage();if(next===language)return;
    stopSpeech();language=next;
    CATALOG=getCatalog(language);CATALOG_SYSTEMS=getCatalogSystems(language);
    S.entry=CATALOG.find(entry=>entry.id===S.entry.id)||CATALOG[0];
    renderStaticLanguage();renderEntryText();renderList();updateVideo(true);
    announce(t('Idioma cambiado a español.','Language changed to English.'));
  }
  function stepEntry(direction){const visible=matches(),list=visible.length?visible:CATALOG;let index=list.findIndex(e=>e.id===S.entry.id);if(index<0)index=direction>0?-1:0;choose(list[(index+direction+list.length)%list.length],true);}
  $('.skip').onclick=event=>{event.preventDefault();$('#catalog-toggle').setAttribute('aria-expanded','true');$('.catalog').classList.add('catalog-open');$('#catalog-search').focus();};
  $('#catalog-toggle').onclick=()=>{const expanded=$('#catalog-toggle').getAttribute('aria-expanded')!=='true';$('#catalog-toggle').setAttribute('aria-expanded',String(expanded));$('.catalog').classList.toggle('catalog-open',expanded);};
  $('#language-select').addEventListener('change',event=>setLanguage(event.target.value));
  addEventListener('f22:language',changeLanguage);
  $('#catalog-search').addEventListener('input',e=>{S.query=e.target.value;renderList();});
  $('#catalog-system').addEventListener('change',e=>{S.system=e.target.value;renderList();});
  $('#catalog-list').addEventListener('click',e=>{const b=e.target.closest('[data-piece]');if(b)choose(CATALOG.find(x=>x.id===b.dataset.piece),true);});
  $('#previous-piece').onclick=()=>stepEntry(-1);$('#next-piece').onclick=()=>stepEntry(1);
  const syncAppearance=event=>{const next=event?.detail??readAppearance();if(next.theme!==S.theme||next.scale!==S.scale){S.theme=next.theme;S.scale=next.scale;applyTheme();draw();}};
  addEventListener('f22:appearance',syncAppearance);
  addEventListener('storage',event=>{if(event.key==='f22.theme'||event.key==='f22.textScale')syncAppearance();});
  $('#theme-toggle').onclick=()=>{S.theme=S.theme==='light'?'dark':'light';applyTheme();writeTheme(S.theme,S.scale);draw();};
  $('#large-text').onclick=()=>{S.large=!S.large;applyTheme();draw();};
  for(const mode of ['3d','video'])$('#mode-'+mode).onclick=()=>setMode(mode);
  $('.visual-tabs').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setMode(e.key==='Home'?'3d':e.key==='End'?'video':S.mode==='3d'?'video':'3d',true);}});
  $$('[data-info]').forEach(b=>b.onclick=()=>{S.info=b.dataset.info;renderInfo();});
  $('.info-tabs').addEventListener('keydown',e=>{const ids=['function','motion','reference'];if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();S.info=ids[e.key==='Home'?0:e.key==='End'?2:(ids.indexOf(S.info)+(e.key==='ArrowLeft'?2:1))%3];renderInfo();$('#info-'+S.info).focus();});
  $('#rotate-left').onclick=()=>{S.angle-=15;draw();};$('#rotate-right').onclick=()=>{S.angle+=15;draw();};
  const zoom=d=>{S.zoom=Math.max(.7,Math.min(4,S.zoom*d));draw();};
  $('#zoom-in').onclick=()=>zoom(1.15);$('#zoom-out').onclick=()=>zoom(1/1.15);
  $('#reset-piece').onclick=()=>{stop();S.demonstrating=false;S.angle=0;S.tilt=0;S.zoom=1;draw();};
  $('#play-mechanism').onclick=play;
  $('#mechanism-speed').onchange=e=>{S.speed=Number(e.target.value);};
  $('#step-mechanism').onclick=()=>{stop();S.demonstrating=true;S.phase=(S.phase+1/24)%1;draw();};
  $('#phase-slider').oninput=e=>{stop();S.demonstrating=true;S.phase=Number(e.target.value)/1000;draw();};
  const stage=$('#figure-stage');
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle:S.angle,tilt:S.tilt};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;S.angle=drag.angle+(e.clientX-drag.x)*.55;S.tilt=Math.max(-103,Math.min(57,drag.tilt+(e.clientY-drag.y)*.4));draw();});
  stage.addEventListener('pointerup',()=>{drag=null;});stage.addEventListener('pointercancel',()=>{drag=null;});
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')S.angle-=e.shiftKey?30:10;else if(e.key==='ArrowRight')S.angle+=e.shiftKey?30:10;else if(e.key==='ArrowUp')S.tilt=Math.min(57,S.tilt+10);else if(e.key==='ArrowDown')S.tilt=Math.max(-103,S.tilt-10);else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.15);return;}else if(e.key==='-'){e.preventDefault();zoom(1/1.15);return;}else if(e.key==='Home'){stop();S.demonstrating=false;S.angle=0;S.tilt=0;S.zoom=1;}else if(e.key===' '&&!$('#play-mechanism').disabled){e.preventDefault();play();return;}else return;e.preventDefault();draw();});
  $('#piece-video').addEventListener('error',()=>{$('#video-error').hidden=false;});
  $('#read-piece').onclick=()=>{
    if(!('speechSynthesis'in window)){announce(t('La lectura en voz alta no está disponible en este navegador.','Read-aloud is unavailable in this browser.'));return;}
    if(speaking){stopSpeech();return;}
    const e=S.entry,u=new SpeechSynthesisUtterance(`${e.label}. ${e.function} ${t('Ubicación.','Location.')} ${e.location} ${t('Conexiones.','Connections.')} ${e.connections} ${t('Movimiento.','Motion.')} ${e.motion.description} ${e.steps.join(' ')}`);
    u.lang=language==='es'?'es-ES':'en-US';u.rate=.85;const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(language));if(voice)u.voice=voice;
    speaking=true;utterance=u;setControlText($('#read-piece'),t('Detener lectura','Stop reading'));$('#read-piece').setAttribute('aria-pressed','true');u.onend=u.onerror=stopSpeech;speechSynthesis.speak(u);
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;$('#piece-video').pause();}else if(S.playing&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}});
  addEventListener('pagehide',event=>{
    stop();stopSpeech();$('#piece-video').pause();
    if(!event.persisted){figure?.destroy();removeEventListener('f22:language',changeLanguage);}
  });
  addEventListener('pageshow',event=>{
    if(event.persisted){changeLanguage();syncAppearance();draw();}
    // Browser history can restore a select's old value after initial rendering.
    $('#language-select').value=language;
  });
  renderStaticLanguage();choose(S.entry);
}
