import {createDisclosures} from './ui/disclosures.js';
import {mountGlyphBackground} from './ui/glyph-background.js';
// The explorer page: an accessible HTML interface round the 3D stage. Every control is a real button, select or slider,
// reachable by Tab, with a thick focus ring; text scales up to 2.4×; three colour schemes; spoken part names; an
// announcement region for screen readers; parts selectable from the engine or a searchable list.
import * as THREE from 'three';
import {readAppearance,publishAppearance} from './ui/appearance.js';
import {icon, SYSTEM_ICONS, VIEW_ICONS} from './ui/icons.js';
import EN from './i18n/en.js';
import ES from './i18n/es.js';
import {getLanguage, setLanguage} from './i18n/locale.js';
import {firingNow, phase, SPEC, strokeOf, mod} from './kin.js';
import {PART, PARTS, SYSTEMS, REFERENCE_ROOT, REMOVED_ENGINE_PARTS} from './parts.js';
import {createStage} from './stage.js';
import {FLOW_STYLE} from './flows.js';
import {VIEW_ORDER, VIEWS, DIRECTIONS} from './views.js';
import {createAssemblyUI} from './assembly/ui.js';
import {createImmersiveShell, immersiveCopy} from './ui/immersive.js';
import {createEngineAnnotations} from './ui/engine-annotations.js';

let STR = getLanguage() === 'es' ? ES : EN;
let T = STR.ui;
const D2R = Math.PI / 180;
const DIAGRAMS = REFERENCE_ROOT + 'KA/';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('f22.' + k);
      return v === null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('f22.' + k, JSON.stringify(v));
    } catch {
      /* private mode: settings simply are not remembered */
    }
  },
};

export function runApp() {
  document.title = T.title;
  document.documentElement.lang = STR.lang;
  const app = document.getElementById('app');
  const reduceDefault = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = {
    th: 0,
    playing: !store.get('reduceMotion', reduceDefault),
    speed: 's8',
    stepDeg: 30,
    iab: false,
    view: 'exterior',
    system: null,
    selected: null,
    labelMode: store.get('labelMode', 'view'),
    theme: store.get('theme', 'dark'),
    textScale: store.get('textScale', 1.25),
    labelScale: store.get('labelScale', 1.25),
    reduceMotion: store.get('reduceMotion', reduceDefault),
    speak: store.get('speak', false),
    flows: {air: false, exhaust: false, oil: false, coolant: false},
    explode: 0,
  };
  const SPEEDS = {s16: 16, s8: 8, s4: 4, s1: 1};
  let assembly=null, operatingSnapshot=null;

  // ------------------------------------------------------------ layout
  const layout = () => {const I=immersiveCopy(STR.lang);return `
  <a class="skip" href="#parts-search">${esc(T.search)}</a>
  <header class="top">
    <div class="brand-mark" aria-hidden="true">${icon('engine','mechanical')}</div><div class="titles">
      <h1><span class="brand-full">${esc(T.title)}</span><span class="brand-short" aria-hidden="true">F22A6</span></h1>
    </div>
    <div class="topbtns">
      <label class="language-control" for="language-select"><span>${icon('globe')}${esc(T.language)}</span><select id="language-select"><option value="es" lang="es">Español</option><option value="en" lang="en">English</option></select></label>
      <button type="button" id="btn-settings" aria-expanded="false" aria-controls="settings">${icon('sliders-horizontal')}<span>${esc(T.settings)}</span></button>
      <details class="help-menu"><summary>${icon('question')}<span>${STR.lang==='es'?'Ayuda':'Help'}</span></summary><div class="help-options"><button type="button" id="btn-help" aria-expanded="false" aria-controls="help">${icon('list-bullets')}<span>${esc(T.help)}</span></button>
      <button type="button" id="btn-about" aria-expanded="false" aria-controls="about">${icon('info')}<span>${esc(T.about)}</span></button></div></details>
    </div>
  </header>
  <div class="immersive-rail immersive-rail-left"><button type="button" id="btn-views-toggle" class="immersive-toggle" aria-controls="view-drawer" aria-expanded="false">${icon('exploded','mechanical')}<span data-immersive-copy="views">${esc(I.views)}</span></button></div>
  <div class="immersive-rail immersive-rail-right"><button type="button" id="btn-inspector-toggle" class="immersive-toggle" aria-controls="inspector-drawer" aria-expanded="false">${icon('list-bullets')}<span data-immersive-copy="explore">${esc(I.explore)}</span></button></div>
  <div id="immersive-backdrop" class="immersive-backdrop" hidden aria-hidden="true"></div>
  <section id="view-drawer" class="immersive-drawer immersive-drawer-left" role="dialog" aria-modal="true" aria-labelledby="views-drawer-title" hidden>
    <div class="immersive-drawer-heading"><h2 id="views-drawer-title">${esc(I.viewMenu)}</h2><button type="button" class="immersive-close" data-drawer-close="views" aria-label="${esc(I.close)}">${icon('x')}</button></div>
  <nav class="views" aria-label="${esc(T.views)}">
    <span class="lbl" id="views-lbl">${esc(T.views)}</span>
    <div role="radiogroup" aria-labelledby="views-lbl" class="viewbtns">
      ${VIEW_ORDER.map((v, i) => `<button type="button" role="radio" data-view="${v}" aria-checked="false" aria-label="${i + 1} ${esc(STR.views[v].name)}" title="${esc(STR.views[v].desc)}">${icon(VIEW_ICONS[v],'mechanical')}<span class="view-copy"><span class="vnum" aria-hidden="true">0${i + 1}</span><span>${esc(T.viewShort[v])}</span></span></button>`).join('')}
    </div>
  </nav>
    <div class="immersive-view-description"><h3 id="view-menu-current"></h3><p class="viewdesc" id="viewdesc"></p></div>
    <div class="immersive-view-footer"><p class="subtitle">${esc(T.subtitle)}</p><a class="anatomy-entry" href="anatomy.html">${icon('exploded','mechanical')}<span>${esc(T.individualParts)}</span>${icon('arrow-up-right')}</a></div>
  </section>
  <main class="main">
    <div class="viewer">
    <div class="viewer-heading"><div><h2 id="view-title"></h2></div><div class="viewer-utilities"><span class="view-hint">${esc(T.viewHint)}</span><button type="button" id="btn-reset">${icon('arrow-counter-clockwise')}<span>${esc(T.reset)}</span><kbd>R</kbd></button></div></div>
    <section class="stagewrap" aria-label="${esc(T.canvasLabel)}">
      <canvas id="gl" tabindex="0" role="img" aria-label="${esc(T.canvasLabel)}"></canvas>
      <svg class="leaders" aria-hidden="true"></svg>
      <div class="labels" role="group" aria-label="${esc(T.annotationGroup)}"></div>
      <div id="annotation-card" class="annotation-card" hidden></div>
      <div class="legend" id="legend" aria-hidden="true"></div>
    </section>
  <div class="scene-zoom" role="group" aria-label="${esc(T.cameraZoom)}"><span class="scene-tool-caption">Zoom</span><button type="button" id="btn-zoom-in" aria-label="${esc(T.zoomIn)}" title="${esc(T.zoomIn)} (+)">${icon('magnifying-glass-plus')}</button><button type="button" id="btn-zoom-out" aria-label="${esc(T.zoomOut)}" title="${esc(T.zoomOut)} (−)">${icon('magnifying-glass-minus')}</button></div>
  <button type="button" id="btn-scene-labels" class="scene-label-toggle" aria-pressed="false" title="${esc(T.togglePartNames)}">${icon('map-pin')}<span>${esc(T.partNames)}</span></button>
  <div class="immersive-playback" role="group" aria-label="${esc(T.animation)}"><button type="button" id="btn-quick-play" class="primary">${icon('play')}<span class="control-label">${esc(T.play)}</span></button><button type="button" id="btn-controls-toggle" aria-expanded="false" aria-controls="engine-playback assembly-transport">${icon('sliders-horizontal')}<span data-immersive-copy="controls">${esc(I.controls)}</span></button></div>
  <footer id="engine-playback" class="transport" aria-label="${esc(T.animation)}">
    <div class="grp">
      <button type="button" id="btn-play" class="big"></button>
      <button type="button" id="btn-back" class="step-button" aria-label="${esc(T.stepBack)}" title="${esc(T.stepBack)} (,)">${icon('skip-back')}</button>
      <button type="button" id="btn-fwd" class="step-button" aria-label="${esc(T.stepFwd)}" title="${esc(T.stepFwd)} (.)">${icon('skip-forward')}</button>
      <label class="speed-control"><span>${esc(T.speed)}</span><select id="speed-select" aria-label="${esc(T.speed)}">${Object.entries(T.speedShort).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    </div>
    <div class="transport-end"><div class="crank" aria-live="off"><span>${esc(T.crank)}</span><b id="crank-deg">0°</b></div><button type="button" id="btn-motion" aria-controls="panel-motion" aria-label="${esc(T.motionControls)}" title="${esc(T.motionControls)}">${icon('gauge')}<span>${esc(T.motionControls)}</span></button></div>
  </footer>
    <footer id="assembly-transport" class="assembly-transport" hidden></footer>
    </div>
    <aside id="inspector-drawer" class="sidebar immersive-drawer immersive-drawer-right" role="dialog" aria-modal="true" aria-labelledby="inspector-drawer-title" hidden>
      <div class="immersive-drawer-heading"><h2 id="inspector-drawer-title">${esc(I.inspector)}</h2><button type="button" class="immersive-close" data-drawer-close="inspector" aria-label="${esc(I.close)}">${icon('x')}</button></div>
      <div class="inspector-tabs" role="tablist" aria-label="${esc(T.inspector)}">
        ${['parts', 'details', 'motion'].map((id, i) => `<button type="button" role="tab" id="tab-${id}" data-inspector="${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon({parts:'list-bullets',details:'book-open',motion:'gauge'}[id])}<span>${esc(T[id + 'Tab'])}</span></button>`).join('')}
      </div>
      <div class="inspector-body">
      <section class="inspector-pane" id="panel-parts" role="tabpanel" aria-labelledby="tab-parts">
        <div class="parts-tools">
        <label for="parts-search" class="lab">${esc(T.search)} <kbd>/</kbd></label>
        <input id="parts-search" type="search" autocomplete="off" aria-describedby="parts-hint" placeholder="${esc(T.searchPlaceholder)}">
        <p id="parts-hint" class="sr">${esc(T.searchHint)}</p>
        <label class="lab system-label" id="sys-h" for="sys-select">${esc(T.systems)}</label><div class="system-select"><span id="system-mark" class="system-mark">${icon('engine','mechanical')}</span>
        <select id="sys-select">
          <option value="">${esc(T.allSystems)}</option>
          ${SYSTEMS.map((s) => `<option value="${s}">${esc(STR.systems[s])}</option>`).join('')}
        </select></div>
        </div>
        <div class="section-heading"><h2 id="parts-h">${esc(T.browseParts)}</h2><span id="parts-count" class="count"></span></div>
        <div id="parts-list" class="partslist"></div>
      </section>
      <section class="inspector-pane" id="panel-details" role="tabpanel" aria-labelledby="tab-details" hidden>
      <div class="details" id="details">
        <h2 id="det-h">${esc(T.details)}</h2>
        <div id="det-body"><p class="hint">${esc(T.noSelection)}</p></div>
      </div>
      </section>
      <section class="inspector-pane motion-pane" id="panel-motion" role="tabpanel" aria-labelledby="tab-motion" hidden>
        <div class="motion-section"><button type="button" id="btn-iab" role="switch" aria-checked="false" class="iab"></button><span id="iab-state" class="iabstate" aria-live="polite"></span></div>
        <h2>${esc(T.motionTitle)}</h2>
        <div class="cycle-metrics" aria-live="off"><div><span>${esc(T.crank)}</span><strong id="motion-crank-deg">0°</strong></div><div><span>${esc(T.cycle)}</span><strong id="cycle-deg">0°</strong></div></div>
        <ol class="cyls" id="cyls" aria-label="${esc(T.cylinder)}" aria-live="off"></ol>
        <p class="hint cycle-hint">${esc(T.cycleHint)}</p>
        <div class="motion-section"><label class="lab" for="step-select">${esc(T.step)}</label><select id="step-select">${[5, 15, 30, 90, 180].map((d) => `<option value="${d}">${d}°</option>`).join('')}</select></div>
        <fieldset class="flows"><legend>${esc(T.flows)}</legend>
          ${Object.keys(FLOW_STYLE).map((f) => `<label class="chk"><input type="checkbox" data-flow="${f}"> <i class="sw sw-${FLOW_STYLE[f].shape}" style="--c:${FLOW_STYLE[f].color}"></i>${esc(T.flowNames[f])}</label>`).join('')}
        </fieldset>
      </section>
      </div>
      <section id="assembly-inspector" class="assembly-inspector" aria-label="${STR.lang==='es'?'Montaje por capítulos':'Assembly chapters'}" hidden></section>
      <p class="identity-badge">${esc(T.identityShort)}</p>
    </aside>
  </main>

  <div class="dialog" id="settings" role="dialog" aria-modal="false" aria-labelledby="set-h" hidden>
    <h2 id="set-h">${esc(T.settings)}</h2>
    <label class="drow">${esc(T.textSize)} <input type="range" id="text-size" min="1" max="2.4" step="0.05"> <output id="text-size-o"></output></label>
    <label class="drow">${esc(T.labelSize)} <input type="range" id="label-size" min="0.8" max="2.6" step="0.05"> <output id="label-size-o"></output></label>
    <label class="drow">${esc(T.theme)} <select id="theme-select">${Object.entries(T.themes).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    <label class="drow">${esc(T.cameraDirection)} <select id="camera-direction"><option value="" disabled selected>${esc(T.chooseDirection)}</option>${Object.entries(DIRECTIONS).map(([id,d])=>`<option value="${id}">${esc(T.directions[id])}</option>`).join('')}</select></label>
    <label class="drow">${esc(T.showLabels)} <select id="label-mode">${Object.entries(T.labelModes).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    <label class="drow chk"><input type="checkbox" id="reduce-motion"> ${esc(T.reduceMotion)}</label>
    <label class="drow chk"><input type="checkbox" id="speak-names"> ${esc(T.speakNames)}</label>
    <button type="button" class="closebtn" data-close="settings">${esc(T.close)}</button>
  </div>
  <div class="dialog" id="help" role="dialog" aria-modal="false" aria-labelledby="help-h" hidden>
    <h2 id="help-h">${esc(T.help)}</h2>
    <dl>${T.helpText.map(([k, d]) => `<dt><kbd>${esc(k)}</kbd></dt><dd>${esc(d)}</dd>`).join('')}</dl>
    <button type="button" class="closebtn" data-close="help">${esc(T.close)}</button>
  </div>
  <div class="dialog wide" id="about" role="dialog" aria-modal="false" aria-labelledby="about-h" hidden>
    <h2 id="about-h">${esc(STR.notes.title)}</h2>
    <p class="identity-note">${esc(T.identity)}</p>
    <p>${esc(STR.notes.intro)}</p>
    <h3>${esc(T.documentedHeading)}</h3>
    <ul>${STR.notes.exact.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>${esc(T.approximateHeading)}</h3>
    <ul>${STR.notes.approx.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p>${esc(T.iabNote)}</p>
    <p>${esc(T.flowNote)}</p>
    <button type="button" class="closebtn" data-close="about">${esc(T.close)}</button>
  </div>
  <div class="sr" aria-live="polite" id="announce"></div>`;};
  app.innerHTML = layout();
  mountGlyphBackground();
  // Retain original text/attribute nodes so translation never replaces the canvas,
  // event handlers, current selection, controls or camera. Dynamic content is
  // rendered by its regular functions below after the static copy changes.
  const staticBindings = [];
  const bindStatic = (node, path = []) => {
    if (node.nodeType === Node.TEXT_NODE) staticBindings.push({node, path});
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const attrs = ['aria-label', 'title', 'placeholder'].filter((a) => node.hasAttribute(a));
      if (attrs.length) staticBindings.push({node, path, attrs});
    }
    [...node.childNodes].forEach((child, i) => bindStatic(child, [...path, i]));
  };
  bindStatic(app);
  const $ = (sel) => app.querySelector(sel);
  const $$ = (sel) => [...app.querySelectorAll(sel)];
  const disclosure=createDisclosures(app);
  const immersive=createImmersiveShell({app,getLanguage,getView:()=>S.view});
  let inspector = 'parts';
  const showInspector = (id, focus = false) => {
    inspector = id;
    $$('[data-inspector]').forEach((button) => {
      const active = button.dataset.inspector === id;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      $('#panel-' + button.dataset.inspector).hidden = !active;
    });
    immersive.open('inspector',{focus:false});
    if (focus) $('#tab-' + id).focus();
    $('.inspector-body').scrollTop = 0;
  };
  $$('[data-inspector]').forEach((button) => button.addEventListener('click', () => showInspector(button.dataset.inspector)));
  $('.inspector-tabs').addEventListener('keydown', (e) => {
    const ids = ['parts', 'details', 'motion'];
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (ids.indexOf(inspector) + (e.key === 'ArrowLeft' ? 2 : 1)) % 3;
    showInspector(ids[next], true);
  });
  const focusSearch = () => { if(S.view==='assembly'){immersive.open('inspector',{focus:false});assembly?.focusSearch();return;}showInspector('parts'); $('#parts-search').focus(); };
  $('.skip').addEventListener('click', (e) => { e.preventDefault(); focusSearch(); });
  $('#btn-motion').addEventListener('click', () => showInspector('motion', true));
  const canvas = $('#gl');
  const st = createStage(canvas);
  const announce = (msg) => {
    const a = $('#announce');
    a.textContent = '';
    setTimeout(() => (a.textContent = msg), 30);
  };
  const say = (text) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = STR.lang === 'es' ? 'es-ES' : 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  };

  // ------------------------------------------------------------ settings
  const applySettings = () => {
    const root = document.documentElement;
    root.dataset.theme = S.theme;
    root.dataset.largeText = String(S.textScale > 1.6);
    root.dataset.reducedMotion = String(S.reduceMotion);
    root.style.setProperty('--scale', S.textScale);
    root.style.setProperty('--lscale', S.labelScale);
    $('#text-size').value = S.textScale;
    $('#text-size-o').textContent = `${Math.round(S.textScale * 100)}%`;
    $('#label-size').value = S.labelScale;
    $('#label-size-o').textContent = `${Math.round(S.labelScale * 100)}%`;
    $('#theme-select').value = S.theme;
    $('#label-mode').value = S.labelMode;
    $('#btn-scene-labels').setAttribute('aria-pressed',String(S.labelMode==='all'));
    $('#btn-scene-labels').setAttribute('aria-label',T.togglePartNames);
    $('#reduce-motion').checked = S.reduceMotion;
    $('#speak-names').checked = S.speak;
    st.setTheme(S.theme);
    st.controls.enableDamping = !S.reduceMotion;
    for (const k of ['theme', 'textScale', 'labelScale', 'labelMode', 'reduceMotion', 'speak']) store.set(k, S[k]);
    publishAppearance({theme:S.theme,scale:S.textScale,reduceMotion:S.reduceMotion});
    requestAnimationFrame(fit);
  };
  const syncAppearance=event=>{const next=event?.detail??readAppearance();const reduced=typeof next.reduceMotion==='boolean'?next.reduceMotion:S.reduceMotion;if(next.theme!==S.theme||next.scale!==S.textScale||reduced!==S.reduceMotion){S.theme=next.theme;S.textScale=next.scale;S.reduceMotion=reduced;applySettings();}};
  addEventListener('f22:appearance',syncAppearance);
  addEventListener('storage',event=>{if(['f22.theme','f22.textScale','f22.reduceMotion'].includes(event.key))syncAppearance();});
  $('#text-size').addEventListener('input', (e) => ((S.textScale = Number(e.target.value)), applySettings()));
  $('#label-size').addEventListener('input', (e) => ((S.labelScale = Number(e.target.value)), applySettings()));
  $('#theme-select').addEventListener('change', (e) => ((S.theme = e.target.value), applySettings()));
  $('#label-mode').addEventListener('change', (e) => ((S.labelMode = e.target.value), applySettings()));
  $('#btn-scene-labels').addEventListener('click',()=>{S.labelMode=S.labelMode==='all'?'view':'all';applySettings();});
  $('#reduce-motion').addEventListener('change', (e) => ((S.reduceMotion = e.target.checked), applySettings()));
  $('#speak-names').addEventListener('change', (e) => ((S.speak = e.target.checked), applySettings()));
  // dialogs: toggle buttons, Escape closes, focus returns to the opener
  const dialogs = {settings: '#btn-settings', help: '#btn-help', about: '#btn-about'};
  const openDialog = (id, open) => {
    const d = $('#' + id);
    const b = $(dialogs[id]);
    d.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
    if (open) {
      immersive.close({returnFocus:false});
      $('.help-menu').open = false;
      for (const other of Object.keys(dialogs)) if (other !== id) openDialog(other, false);
      d.querySelector('input,select,button')?.focus();
    } else if (d.contains(document.activeElement)) (id === 'settings' ? b : $('.help-menu>summary')).focus();
    requestAnimationFrame(fit);
  };
  for (const [id, sel] of Object.entries(dialogs)) $(sel).addEventListener('click', () => openDialog(id, $('#' + id).hidden));
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => openDialog(b.dataset.close, false)));

  // ------------------------------------------------------------ camera
  const cam = {t: new THREE.Vector3(), az: 0, el: 0, d: 1};
  let tween = null;
  const camTo = (c, instant) => {
    const target = {t: new THREE.Vector3(...c.t).multiplyScalar(0.001), az: c.az, el: c.el, d: c.d};
    if (instant || S.reduceMotion) {
      tween = null;
      setCam(target);
      return;
    }
    const from = currentCam();
    tween = {from, to: target, t0: performance.now(), dur: 900};
  };
  const currentCam = () => {
    const off = new THREE.Vector3().subVectors(st.camera.position, st.controls.target);
    const d = off.length();
    return {t: st.controls.target.clone(), az: Math.atan2(off.x, off.z) / D2R, el: Math.asin(off.y / d) / D2R, d};
  };
  const setCam = ({t, az, el, d}) => {
    st.controls.target.copy(t);
    const a = az * D2R;
    const e = el * D2R;
    st.camera.position.set(t.x + d * Math.cos(e) * Math.sin(a), t.y + d * Math.sin(e), t.z + d * Math.cos(e) * Math.cos(a));
    st.camera.lookAt(t);
    st.controls.update();
  };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  const stepTween = (now) => {
    if (!tween) return;
    const k = Math.min(1, (now - tween.t0) / tween.dur);
    const e = ease(k);
    const {from: a, to: b} = tween;
    const daz = ((((b.az - a.az) % 360) + 540) % 360) - 180;
    setCam({t: a.t.clone().lerp(b.t, e), az: a.az + daz * e, el: a.el + (b.el - a.el) * e, d: a.d + (b.d - a.d) * e});
    if (k >= 1) tween = null;
  };
  const orbitBy = (daz, del) => {
    if(S.view==='assembly')assembly?.manualCamera();
    tween = null;
    const c = currentCam();
    setCam({...c, az: c.az + daz, el: Math.max(-80, Math.min(85, c.el + del))});
  };
  const zoomBy = (f) => {
    if(S.view==='assembly')assembly?.manualCamera();
    tween = null;
    const c = currentCam();
    setCam({...c, d: Math.max(st.controls.minDistance, Math.min(st.controls.maxDistance, c.d * f))});
  };
  $('#btn-zoom-in').addEventListener('click',()=>zoomBy(.85));
  $('#btn-zoom-out').addEventListener('click',()=>zoomBy(1/.85));
  st.controls.addEventListener('start', () => {tween=null;if(S.view==='assembly')assembly?.manualCamera();});

  // ------------------------------------------------------------ views
  const setView = (v, quiet) => {
    if(!VIEWS[v])return;
    if(v==='assembly'&&S.view!=='assembly'){
      operatingSnapshot={th:S.th,playing:S.playing,speed:S.speed,view:S.view,cam:currentCam()};
      S.playing=false;stepPending=0;st.setCut(null);st.setOutline(null);
    }else if(S.view==='assembly'&&v!=='assembly'){
      assembly.leave();
      if(operatingSnapshot){S.th=operatingSnapshot.th;S.playing=operatingSnapshot.playing;S.speed=operatingSnapshot.speed;}
      renderPlay();st.setOutline(S.selected);
      const url=new URL(location.href);if(url.searchParams.get('view')==='assembly'){url.searchParams.delete('view');url.searchParams.delete('step');history.replaceState(null,'',url);}
    }
    S.view = v;
    $('#btn-scene-labels').hidden=v==='assembly';
    if(v==='assembly')annotations.clear();
    const V = VIEWS[v];
    if(v==='assembly'){
      if(assembly.enter()===false){
        // A failed optional presentation must leave the existing explorer usable.
        const original=operatingSnapshot;assembly.leave();S.view=original?.view||'exterior';
        if(original){S.th=original.th;S.playing=original.playing;S.speed=original.speed;const c=original.cam;camTo({t:c.t.toArray().map(n=>n*1000),az:c.az,el:c.el,d:c.d},true);}
        operatingSnapshot=null;renderPlay();st.setOutline(S.selected);
        st.setCut(VIEWS[S.view].cut===undefined?null:VIEWS[S.view].cut*.001);return;
      }
    }
    else if(operatingSnapshot?.view===v){const c=operatingSnapshot.cam;camTo({t:c.t.toArray().map(n=>n*1000),az:c.az,el:c.el,d:c.d},true);operatingSnapshot=null;}
    else {camTo(V.cam);operatingSnapshot=null;}
    st.setCut(V.cut === undefined ? null : V.cut * 0.001);
    $$('[data-view]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.view === v)));
    // Reveal the selected view within its horizontal strip without scrolling
    // the whole document away from a mobile reader's current position.
    const current=$(`[data-view="${v}"]`),strip=$('.viewbtns');
    const buttonRect=current.getBoundingClientRect(),stripRect=strip.getBoundingClientRect();
    strip.scrollLeft+=buttonRect.left<stripRect.left?buttonRect.left-stripRect.left:buttonRect.right>stripRect.right?buttonRect.right-stripRect.right:0;
    $('#view-title').textContent = STR.views[v].name;
    $('#view-menu-current').textContent = STR.views[v].name;
    immersive.translate();
    $('#viewdesc').textContent = STR.views[v].desc;
    if (!quiet) announce(`${T.viewAnnounce}: ${STR.views[v].name}. ${STR.views[v].desc}`);
    requestAnimationFrame(fit);
  };
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => {setView(b.dataset.view);immersive.close({returnFocus:false});canvas.focus({preventScroll:true});}));
  $('.viewbtns').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    const i = VIEW_ORDER.indexOf(S.view);
    const n = VIEW_ORDER[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + VIEW_ORDER.length) % VIEW_ORDER.length];
    setView(n);
    $(`[data-view="${n}"]`).focus();
  });
  $('#btn-reset').addEventListener('click', () => S.view==='assembly'?assembly.resetCamera():camTo(VIEWS[S.view].cam));
  assembly=createAssemblyUI({app,st,getLanguage,getSettings:()=>S,camTo,announce,say,onExit:()=>{setView(operatingSnapshot?.view||'exterior');immersive.close({returnFocus:false});canvas.focus({preventScroll:true});},onInspect:()=>immersive.open('inspector',{focus:false})});

  // ------------------------------------------------------------ systems, parts list, details
  const sysSel = $('#sys-select');
  sysSel.addEventListener('change', () => {
    S.system = sysSel.value || null;
    announce(S.system ? `${T.isolated}: ${STR.systems[S.system]}` : T.allSystems);
    renderList();
  });
  const nameOf = (id) => STR.parts[id]?.name ?? id;
  const searchText = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const listEl = $('#parts-list');
  const search = $('#parts-search');
  const renderList = () => {
    const openGroups = new Set([...listEl.querySelectorAll('details[open]')].map((d) => d.dataset.system));
    const firstRender = !listEl.hasChildNodes();
    const q = searchText(search.value.trim());
    const groups = SYSTEMS.filter((s) => !S.system || s === S.system)
      .map((s) => ({s, items: PARTS.filter((p) => p.system === s && (!q || [ES, EN].some((copy) => searchText(`${copy.parts[p.id]?.name ?? ''} ${copy.parts[p.id]?.where ?? ''}`).includes(q))))}))
      .filter((g) => g.items.length);
    listEl.innerHTML = groups.length
      ? groups
          .map(
            (g) =>
              `<details class="part-group" data-system="${g.s}"${q || S.system || openGroups.has(g.s) || (firstRender && g.s === 'exterior') ? ' open' : ''}><summary>${icon(SYSTEM_ICONS[g.s],'mechanical')}<span>${esc(STR.systems[g.s])}</span><span class="count">${g.items.length}</span></summary><ul>${g.items
                .map((p) => `<li><button type="button" class="part${p.id === S.selected ? ' on' : ''}" data-part="${p.id}" aria-pressed="${p.id === S.selected}">${esc(nameOf(p.id))}${p.approx ? ` <span class="approx" title="${esc(T.approximate)}">≈</span>` : ''}</button></li>`)
                .join('')}</ul></details>`,
          )
          .join('')
      : `<p class="hint">${esc(T.noMatch)}</p>`;
    $('#system-mark').innerHTML = icon(S.system ? SYSTEM_ICONS[S.system] : 'engine','mechanical');
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    $('#parts-count').textContent = `${total} ${total === 1 ? T.partCount : T.partsCount}`;
  };
  search.addEventListener('input', renderList);
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-part]');
    if (b) select(b.dataset.part, 'list');
  });
  const renderDetails = () => {
    disclosure.capture();
    const id = S.selected;
    const body = $('#det-body');
    if (!id) {
      body.innerHTML = `<div class="empty-selection"><span class="empty-icon" aria-hidden="true">${icon('crosshair')}</span><h3>${esc(T.inspectionTitle)}</h3><p>${esc(T.selectionHint)}</p><p class="hint">${esc(T.inspectionHint)}</p><button type="button" id="btn-browse">${esc(T.browseParts)}</button></div>`;
      $('#btn-browse').addEventListener('click', focusSearch);
      return;
    }
    const t = STR.parts[id];
    const p = PART[id];
    body.innerHTML = `
      <p class="pname">${esc(t.name)}</p>
      <p class="psys"><span class="tag">${esc(STR.systems[p.system])}</span>${p.approx ? ` <span class="tag approxtag">≈ ${esc(T.approximate)}</span>` : ''}</p>
      <div class="facts disclosure-group">
        ${disclosure(id+':does',T.does,`<p>${esc(t.does)}</p>`,'info')}
        ${disclosure(id+':where',T.where,`<p>${esc(t.where)}</p>`,'map-pin')}
        ${disclosure(id+':connects',T.connects,`<p>${esc(t.connects)}</p>`,'link')}
        ${disclosure(id+':moves',T.moves,`<p>${esc(t.moves)}</p>`,'gauge')}
      </div>
      ${p.oem.length ? `<details class="reference-details"><summary>${esc(T.referenceDetails)}</summary><p class="oem"><b>${esc(T.oem)}:</b> ${p.oem.map((o) => `<a href="${esc(DIAGRAMS + o.diagram + '.png')}" target="_blank" rel="noopener">${esc(STR.diagrams[o.diagram] || o.diagram.replace(/_/g, ' '))}, ${esc(T.callout)} ${esc(o.callout)}</a> <span class="pn">${esc(o.pn)}</span>`).join('<br>')}</p></details>` : ''}
      <div class="detbtns">
        <button type="button" id="btn-speak">${icon('speaker-high')}<span>${esc(T.speak)}</span></button>
        <button type="button" id="btn-clear">${esc(T.clear)} <kbd>Esc</kbd></button>
      </div>`;
    $('#btn-speak').addEventListener('click', () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }
      say(`${t.name}. ${T.where}: ${t.where} ${T.does}: ${t.does} ${T.connects}: ${t.connects} ${T.moves}: ${t.moves}`);
    });
    $('#btn-clear').addEventListener('click', () => select(null));
  };
  const select = (id, from) => {
    S.selected = id;
    st.setOutline(id);
    renderList();
    renderDetails();
    if (id) {
      const name = nameOf(id);
      announce(`${T.selectedAnnounce}: ${name}. ${STR.parts[id].where}`);
      if (S.speak) say(name);
      if(from!=='pin')showInspector('details', from === 'list' || from === 'key');
    }
  };
  const visibleParts = () => PARTS.filter((p) => !S.system || p.system === S.system).map((p) => p.id);
  const stepPart = (d) => {
    const ids = visibleParts();
    const i = ids.indexOf(S.selected);
    select(ids[(i + d + ids.length) % ids.length], 'key');
  };

  // ------------------------------------------------------------ transport and intake bypass
  const playBtn = $('#btn-play');
  const renderPlay = () => { playBtn.innerHTML = `${icon(S.playing?'pause':'play')}<span class="control-label">${esc(S.playing?T.pause:T.play)}</span><kbd>${esc(T.spaceKey)}</kbd>`; playBtn.setAttribute('aria-pressed',String(S.playing)); };
  playBtn.addEventListener('click', () => {
    S.playing = !S.playing;
    renderPlay();
    announce(S.playing ? T.play : T.pause);
  });
  const stepBy = (d) => {
    S.playing = false;
    renderPlay();
    stepPending = d;
  };
  let stepPending = 0;
  $('#btn-back').addEventListener('click', () => stepBy(-S.stepDeg));
  $('#btn-fwd').addEventListener('click', () => stepBy(S.stepDeg));
  $('#step-select').value = String(S.stepDeg);
  $('#step-select').addEventListener('change', (e) => (S.stepDeg = Number(e.target.value)));
  $('#speed-select').value = S.speed;
  $('#speed-select').addEventListener('change', (e) => (S.speed = e.target.value));
  const iabBtn = $('#btn-iab');
  const renderIab = () => {
    iabBtn.setAttribute('aria-checked', String(S.iab));
    iabBtn.innerHTML = `${icon('butterfly','mechanical')}<span>${esc(S.iab ? T.iabShort.on : T.iabShort.off)}</span><span class="switch-track" aria-hidden="true"></span>`;
    iabBtn.setAttribute('aria-label', `${T.iab}: ${S.iab ? T.iabOn : T.iabOff}`);
  };
  iabBtn.addEventListener('click', () => {
    S.iab = !S.iab;
    renderIab();
    announce(`${T.iab} ${S.iab ? T.iabOn : T.iabOff}`);
  });
  $$('[data-flow]').forEach((c) =>
    c.addEventListener('change', () => {
      S.flows[c.dataset.flow] = c.checked;
      st.flows.groups[c.dataset.flow].visible = c.checked;
      renderLegend();
    }),
  );
  const renderLegend = () => {
    const on = Object.entries(S.flows).filter(([, v]) => v);
    $('#legend').innerHTML = on.length ? `<p>${esc(T.flows)}</p>${on.map(([f]) => `<span><i class="sw sw-${FLOW_STYLE[f].shape}" style="--c:${FLOW_STYLE[f].color}"></i>${esc(T.flowNames[f])}</span>`).join('')}` : '';
  };
  const cylsEl = $('#cyls');
  cylsEl.innerHTML = [1, 2, 3, 4].map((c) => `<li id="cyl-${c}"><span class="cyl-number">${esc(T.cylinder)} ${c}</span><strong class="cyl-stroke"></strong><span class="cyl-status"></span></li>`).join('');

  // ------------------------------------------------------------ canvas interaction: click to pick, keys to orbit
  let down = null;
  canvas.addEventListener('pointerdown', (e) => (down = {x: e.clientX, y: e.clientY}));
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const r = canvas.getBoundingClientRect();
    if(S.view==='assembly'){assembly.pick(e.clientX-r.left,e.clientY-r.top);return;}
    const keep = keepSet();
    const id = st.pick(e.clientX - r.left, e.clientY - r.top, (pid) => !keep || keep.has(PART[pid].system) || pid === S.selected);
    select(id, 'canvas');
  });
  canvas.addEventListener('pointermove', (e) => {
    if(S.view==='assembly'){canvas.style.cursor='grab';return;}
    const r = canvas.getBoundingClientRect();
    canvas.style.cursor = st.pick(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('keydown', (e) => {
    const k = e.key;
    const a = e.shiftKey ? 15 : 5;
    if (k === 'ArrowLeft') orbitBy(-a, 0);
    else if (k === 'ArrowRight') orbitBy(a, 0);
    else if (k === 'ArrowUp') orbitBy(0, a);
    else if (k === 'ArrowDown') orbitBy(0, -a);
    else return;
    e.preventDefault();
  });
  addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' && document.activeElement.type !== 'checkbox' && document.activeElement.type !== 'range';
    if (e.key === 'Escape') {
      const open = Object.keys(dialogs).find((d) => !$('#' + d).hidden);
      if (open) openDialog(open, false);
      else if(immersive.close())return;
      else if(S.view==='assembly')assembly.clear();else {select(null);annotations.clear();}
      return;
    }
    if (typing || tag === 'SELECT') return;
    const k = e.key;
    if (k === ' ' && (document.activeElement === canvas || document.activeElement === document.body)) {
      e.preventDefault();
      if(S.view==='assembly')assembly.toggle();else playBtn.click();
    } else if (k === '+' || k === '=') zoomBy(0.85);
    else if (k === '-' || k === '_') zoomBy(1 / 0.85);
    else if (k === 'r' || k === 'R') S.view==='assembly'?assembly.resetCamera():camTo(VIEWS[S.view].cam);
    else if (k === ',') S.view==='assembly'?assembly.step(-1):stepBy(-S.stepDeg);
    else if (k === '.') S.view==='assembly'?assembly.step(1):stepBy(S.stepDeg);
    else if (k === '/') {
      e.preventDefault();
      focusSearch();
    } else if (k === 'n' || k === 'N') S.view==='assembly'?assembly.step(1):stepPart(1);
    else if (k === 'p' || k === 'P') S.view==='assembly'?assembly.step(-1):stepPart(-1);
    else if ((k === 'i' || k === 'I')&&S.view!=='assembly') iabBtn.click();
    else if (/^[1-8]$/.test(k) && (document.activeElement === canvas || document.activeElement === document.body || document.activeElement?.closest?.('.views'))) setView(VIEW_ORDER[Number(k) - 1]);
  });

  $('#camera-direction').addEventListener('change',e=>{setView('exterior',true);camTo(DIRECTIONS[e.target.value].cam,true);e.target.value='';openDialog('settings',false);});

  // ------------------------------------------------------------ labels on the engine
  const labelsEl = $('.labels');
  const leaders = $('.leaders');
  const annotations=createEngineAnnotations({
    container:labelsEl,leaders,card:$('#annotation-card'),getName:nameOf,
    getCopy:()=>({details:T.annotationDetails,preview:T.annotationPreview,annotations:T.annotationGroup}),
    onSelect:id=>select(id,'pin'),onDetails:id=>{select(id,'pin');showInspector('details',true);},
  });
  let annotationObstacles=[],annotationBounds=null;
  const keepSet = () => {
    if (S.system) return new Set([S.system]);
    const k = VIEWS[S.view].keep;
    return k ? new Set(k) : null;
  };
  const drawLabels = () => {
    if(S.view==='assembly')return;
    const ids=S.labelMode==='none'?[]:S.labelMode==='selected'?(S.selected?[S.selected]:[]):[...new Set([...(VIEWS[S.view].labels??[]),...(S.selected?[S.selected]:[])])];
    const keep=keepSet();
    const anchors=ids.flatMap((id,index)=>{
      if(VIEWS[S.view].hidden?.includes(id)|| (keep&&!keep.has(PART[id]?.system)&&id!==S.selected))return [];
      const p=st.project(st.eng.anchorOf(id));
      return p?[{id,x:p[0],y:p[1],number:index+1,selected:id===S.selected}]:[];
    });
    annotations.update({anchors,width:st.size.w,height:st.size.h,mode:S.labelMode,selected:S.selected,
      scale:S.labelScale,textScale:S.textScale,lang:STR.lang,obstacles:annotationObstacles,bounds:annotationBounds});
  };

  // ------------------------------------------------------------ cylinder readout
  const SHAPE = T.strokeShapes;
  const renderCyls = () => {
    const fire = firingNow(S.th);
    const crank = `${Math.round(mod(S.th, 360))}°`;
    $('#crank-deg').textContent = crank;
    $('#motion-crank-deg').textContent = crank;
    $('#cycle-deg').textContent = `${Math.round(mod(S.th, 720))}°`;
    for (const c of [1, 2, 3, 4]) {
      const k = strokeOf(phase(c, S.th));
      const li = $(`#cyl-${c}`);
      const active = c === fire && phase(c, S.th) < 60;
      const stroke = `${SHAPE[k]} ${T.strokes[k]}`;
      const status = active ? T.firing : '';
      if (li.querySelector('.cyl-stroke').textContent !== stroke || li.querySelector('.cyl-status').textContent !== status) {
        li.querySelector('.cyl-stroke').textContent = stroke;
        li.querySelector('.cyl-status').textContent = status;
        li.className = `stroke-${k}${active ? ' fire' : ''}`;
      }
    }
    $('#iab-state').textContent = T.iabState;
  };

  // ------------------------------------------------------------ sizing and the loop
  const wrap = $('.stagewrap');
  const fit = () => {
    const r = wrap.getBoundingClientRect();
    st.resize(Math.max(1, r.width), Math.max(1, r.height), Math.min(devicePixelRatio || 1, 2));
    const panel=immersive.active ? $('#'+(immersive.active==='views'?'view':'inspector')+'-drawer') : null;
    const panelRect=panel?.getBoundingClientRect(),appRect=app.getBoundingClientRect();
    const panelWidth=panelRect?.width||0;
    const gap=panelRect ? Math.max(0,immersive.active==='inspector'?appRect.right-panelRect.right:panelRect.left-appRect.left) : 0;
    const shift=panel&&!immersive.modal ? (panelWidth+gap)/2*(immersive.active==='inspector'?1:-1) : 0;
    const presentationScale=panel&&!immersive.modal ? Math.max(.35,Math.min(1,(r.width-panelWidth-3*gap)/Math.max(1,r.width))) : 1;
    st.setPresentationOffset(shift,presentationScale);
    app.style.setProperty('--scene-shift',shift+'px');
    app.style.setProperty('--active-panel-width',panelWidth+'px');
    const rectOf=node=>{const b=node.getBoundingClientRect();return {x:b.left-r.left,y:b.top-r.top,width:b.width,height:b.height};};
    annotationObstacles=[...app.querySelectorAll('.top,.help-options,.immersive-rail,.viewer-heading,.scene-zoom,#btn-scene-labels,.immersive-playback,.transport,.assembly-transport,.immersive-drawer:not([hidden]),.dialog:not([hidden])')]
      .filter(node=>node.getClientRects().length&&!node.closest('[hidden]')).map(rectOf);
    const heading=$('.viewer-heading').getBoundingClientRect();
    const top=Math.min(r.height*.46,Math.max(heading.bottom-r.top+14,80));
    const left=panel&&!immersive.modal&&immersive.active==='views'?panelRect.right-r.left+12:12;
    const right=panel&&!immersive.modal&&immersive.active==='inspector'?panelRect.left-r.left-12:r.width-12;
    annotationBounds={x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,r.height-top-76)};
  };
  addEventListener('f22:drawer',fit);
  $('.help-menu').addEventListener('toggle',()=>requestAnimationFrame(fit));
  $('#btn-controls-toggle').addEventListener('click',()=>requestAnimationFrame(fit));
  new ResizeObserver(fit).observe(wrap);
  addEventListener('resize', fit);

  const applyLanguage = () => {
    STR = getLanguage() === 'es' ? ES : EN;
    T = STR.ui;
    document.title = T.title;
    document.documentElement.lang = STR.lang;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const translated = document.createElement('div');
    translated.innerHTML = layout();
    for (const {node, path, attrs} of staticBindings) {
      if (!node.isConnected) continue;
      const source = path.reduce((parent, i) => parent?.childNodes[i], translated);
      if (!source) continue;
      if (attrs) for (const attr of attrs) node.setAttribute(attr, source.getAttribute(attr));
      else node.nodeValue = source.nodeValue;
    }
    $('#language-select').value = STR.lang;
    const referenceOpen = $('#det-body .reference-details')?.open;
    renderList(); renderDetails(); renderPlay(); renderIab(); renderLegend();
    if (referenceOpen && $('#det-body .reference-details')) $('#det-body .reference-details').open = true;
    $('#view-title').textContent = STR.views[S.view].name;
    $('#view-menu-current').textContent = STR.views[S.view].name;
    immersive.translate();
    $('#viewdesc').textContent = STR.views[S.view].desc;
    $('#btn-scene-labels').setAttribute('aria-label',T.togglePartNames);
    for (const c of [1, 2, 3, 4]) $(`#cyl-${c} .cyl-number`).textContent = `${T.cylinder} ${c}`;
    const notice = $('#removed-part-notice');
    if (notice) notice.textContent = T.removedPartNotice;
    renderCyls(); drawLabels();
    assembly.translate();
    announce(T.languageChanged);
    requestAnimationFrame(fit);
  };
  $('#language-select').value = STR.lang;
  $('#language-select').addEventListener('change', (event) => setLanguage(event.target.value));
  addEventListener('f22:language', applyLanguage);
  addEventListener('pageshow', () => { $('#language-select').value = STR.lang; });

  applySettings();
  renderPlay();
  renderIab();
  renderList();
  renderDetails();
  setView('exterior', true);
  camTo(VIEWS.exterior.cam, true);
  // The Anatomy catalogue links back to the existing assembly, with a suitable
  // cutaway/view. A catalogue component may belong to a larger selectable group.
  const incoming = new URLSearchParams(location.search);
  const linkedPart = incoming.get('part');
  if (linkedPart && PART[linkedPart]) {
    const linkedView = incoming.get('view');
    if (linkedView && VIEWS[linkedView]) { setView(linkedView, true); camTo(VIEWS[linkedView].cam, true); }
    select(linkedPart);
    S.playing = false;
    renderPlay();
  }
  if (REMOVED_ENGINE_PARTS.includes(linkedPart) || incoming.get('view') === 'vtec') {
    const notice=document.createElement('p');notice.className='identity-note';notice.setAttribute('role','status');
    notice.id='removed-part-notice';notice.textContent=T.removedPartNotice;
    $('.viewer-heading').append(notice);
  }
  if(incoming.get('view')==='assembly'){
    setView('assembly',true);
    if(incoming.get('step'))assembly.enter({stepId:incoming.get('step')});
  }
  fit();

  let last = performance.now();
  let flowS = 0;
  const loop = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if(S.view==='assembly'){
      assembly.tick(dt);stepTween(now);if(!tween)st.controls.update();st.render();requestAnimationFrame(loop);return;
    }
    let simDt = 0;
    if (S.playing) {
      S.th += (360 * dt) / SPEEDS[S.speed];
      simDt = dt;
    }
    if (stepPending) {
      S.th += stepPending;
      stepPending = 0;
    }
    flowS += S.playing ? dt * (8 / SPEEDS[S.speed]) * 0.6 : 0;
    stepTween(now);
    if (!tween) st.controls.update();
    // explode eases in and out with the view
    const ex = VIEWS[S.view].explode ?? 0;
    S.explode += (ex - S.explode) * (S.reduceMotion ? 1 : 1 - Math.exp(-dt / 0.25));
    if (Math.abs(ex - S.explode) < 0.001) S.explode = ex;
    st.eng.setExplode(S.explode);
    const V = VIEWS[S.view];
    const keep = keepSet();
    st.eng.update(S.th, {
      iab: Number(S.iab),
      dt: S.playing ? simDt : 0,
      explode: S.explode,
      hidden: new Set(V.hidden ?? []),
      ghost: new Set(S.system ? [] : V.ghost ?? []),
      keepSystems: keep,
      selected: S.selected,
    });
    const anyFlow = Object.values(S.flows).some(Boolean) && S.explode < 0.01;
    st.flows.root.visible = anyFlow;
    if (anyFlow) st.flows.update(flowS,{iab:S.iab});
    st.render();
    drawLabels();
    renderCyls();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.EXPLORER = {S, st, select, setView, stepBy, camTo,assembly,immersive};
}
