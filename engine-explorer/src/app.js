// The explorer page: an accessible HTML interface round the 3D stage. Every control is a real button, select or slider,
// reachable by Tab, with a thick focus ring; text scales up to 2.4×; three colour schemes; spoken part names; an
// announcement region for screen readers; parts selectable from the engine or a searchable list.
import * as THREE from 'three';
import STR from './i18n/en.js';
import {firingNow, phase, SPEC, strokeOf, mod} from './kin.js';
import {PART, PARTS, SYSTEMS} from './parts.js';
import {createStage} from './stage.js';
import {FLOW_STYLE} from './flows.js';
import {VIEW_ORDER, VIEWS} from './views.js';

const T = STR.ui;
const D2R = Math.PI / 180;
const DIAGRAMS = '../Honda Reference Library/02_OEM_Diagrams/';
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
    playing: !reduceDefault,
    speed: 's8',
    stepDeg: 30,
    vtec: false,
    locked: [0, 0, 0, 0],
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

  // ------------------------------------------------------------ layout
  app.innerHTML = `
  <a class="skip" href="#parts-search">${esc(T.search)}</a>
  <header class="top">
    <div class="titles">
      <h1>${esc(T.title)}</h1>
      <p class="subtitle">${esc(T.subtitle)}</p>
      <p class="ident">${esc(T.identity)}</p>
    </div>
    <div class="topbtns">
      <button type="button" id="btn-reset">${esc(T.reset)} <kbd>R</kbd></button>
      <button type="button" id="btn-settings" aria-expanded="false" aria-controls="settings">${esc(T.settings)}</button>
      <button type="button" id="btn-help" aria-expanded="false" aria-controls="help">${esc(T.help)}</button>
      <button type="button" id="btn-about" aria-expanded="false" aria-controls="about">${esc(T.about)}</button>
    </div>
  </header>
  <main class="main">
    <section class="stagewrap" aria-label="${esc(T.canvasLabel)}">
      <canvas id="gl" tabindex="0" role="img" aria-label="${esc(T.canvasLabel)}"></canvas>
      <svg class="leaders" aria-hidden="true"></svg>
      <div class="labels" aria-hidden="true"></div>
      <p class="viewdesc" id="viewdesc"></p>
      <div class="legend" id="legend" aria-hidden="true"></div>
    </section>
    <aside class="sidebar">
      <nav class="views" aria-label="${esc(T.views)}">
    <span class="lbl" id="views-lbl">${esc(T.views)}</span>
    <div role="radiogroup" aria-labelledby="views-lbl" class="viewbtns">
      ${VIEW_ORDER.map((v, i) => `<button type="button" role="radio" data-view="${v}" aria-checked="false" title="${esc(STR.views[v].desc)}"><span class="vnum">${i + 1}</span> ${esc(STR.views[v].name)}</button>`).join('')}
    </div>
      </nav>
      <section class="panel" aria-labelledby="sys-h">
        <h2 id="sys-h">${esc(T.systems)}</h2>
        <label class="sr" for="sys-select">${esc(T.systems)}</label>
        <select id="sys-select">
          <option value="">${esc(T.allSystems)}</option>
          ${SYSTEMS.map((s) => `<option value="${s}">${esc(STR.systems[s])}</option>`).join('')}
        </select>
      </section>
      <section class="panel details" aria-labelledby="det-h" id="details">
        <h2 id="det-h">${esc(T.details)}</h2>
        <div id="det-body"><p class="hint">${esc(T.noSelection)}</p></div>
      </section>
      <section class="panel" aria-labelledby="parts-h">
        <h2 id="parts-h">${esc(T.parts)}</h2>
        <label for="parts-search" class="lab">${esc(T.search)} <kbd>/</kbd></label>
        <input id="parts-search" type="search" autocomplete="off" aria-describedby="parts-hint" placeholder="${esc(T.searchHint)}">
        <p id="parts-hint" class="sr">${esc(T.searchHint)}</p>
        <div id="parts-list" class="partslist"></div>
      </section>
    </aside>
  </main>
  <footer class="transport" aria-label="Animation">
    <div class="grp">
      <button type="button" id="btn-play" class="big"></button>
      <button type="button" id="btn-back" aria-label="${esc(T.stepBack)}">◀ ${esc(T.stepBack)} <kbd>,</kbd></button>
      <button type="button" id="btn-fwd" aria-label="${esc(T.stepFwd)}">${esc(T.stepFwd)} ▶ <kbd>.</kbd></button>
      <label>${esc(T.step)} <select id="step-select">${[5, 15, 30, 90, 180].map((d) => `<option value="${d}">${d}°</option>`).join('')}</select></label>
      <label>${esc(T.speed)} <select id="speed-select">${Object.entries(T.speeds).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    </div>
    <div class="grp state" aria-live="off">
      <div class="crank"><span class="k">${esc(T.crank)}</span> <b id="crank-deg">0°</b></div>
      <ol class="cyls" id="cyls" aria-label="${esc(T.cylinder)}"></ol>
    </div>
    <div class="grp">
      <button type="button" id="btn-vtec" role="switch" aria-checked="false" class="vtec"></button>
      <span id="vtec-state" class="vtecstate"></span>
    </div>
    <fieldset class="grp flows">
      <legend>${esc(T.flows)}</legend>
      ${Object.keys(FLOW_STYLE).map((f) => `<label class="chk"><input type="checkbox" data-flow="${f}"> <i class="sw sw-${FLOW_STYLE[f].shape}" style="--c:${FLOW_STYLE[f].color}"></i>${esc(T.flowNames[f])}</label>`).join('')}
    </fieldset>
  </footer>
  <div class="dialog" id="settings" role="dialog" aria-modal="false" aria-labelledby="set-h" hidden>
    <h2 id="set-h">${esc(T.settings)}</h2>
    <label class="drow">${esc(T.textSize)} <input type="range" id="text-size" min="1" max="2.4" step="0.05"> <output id="text-size-o"></output></label>
    <label class="drow">${esc(T.labelSize)} <input type="range" id="label-size" min="0.8" max="2.6" step="0.05"> <output id="label-size-o"></output></label>
    <label class="drow">${esc(T.theme)} <select id="theme-select">${Object.entries(T.themes).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
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
    <p>${esc(STR.notes.intro)}</p>
    <h3>Follows Honda figures</h3>
    <ul>${STR.notes.exact.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>Approximate</h3>
    <ul>${STR.notes.approx.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p>${esc(T.vtecNote)}</p>
    <p>${esc(T.flowNote)}</p>
    <button type="button" class="closebtn" data-close="about">${esc(T.close)}</button>
  </div>
  <div class="sr" aria-live="polite" id="announce"></div>`;
  const $ = (sel) => app.querySelector(sel);
  const $$ = (sel) => [...app.querySelectorAll(sel)];
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
    u.lang = STR.lang;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  };

  // ------------------------------------------------------------ settings
  const applySettings = () => {
    const root = document.documentElement;
    root.dataset.theme = S.theme;
    root.style.setProperty('--scale', S.textScale);
    root.style.setProperty('--lscale', S.labelScale);
    $('#text-size').value = S.textScale;
    $('#text-size-o').textContent = `${Math.round(S.textScale * 100)}%`;
    $('#label-size').value = S.labelScale;
    $('#label-size-o').textContent = `${Math.round(S.labelScale * 100)}%`;
    $('#theme-select').value = S.theme;
    $('#label-mode').value = S.labelMode;
    $('#reduce-motion').checked = S.reduceMotion;
    $('#speak-names').checked = S.speak;
    st.setTheme(S.theme);
    st.controls.enableDamping = !S.reduceMotion;
    for (const k of ['theme', 'textScale', 'labelScale', 'labelMode', 'reduceMotion', 'speak']) store.set(k, S[k]);
    requestAnimationFrame(fit);
  };
  $('#text-size').addEventListener('input', (e) => ((S.textScale = Number(e.target.value)), applySettings()));
  $('#label-size').addEventListener('input', (e) => ((S.labelScale = Number(e.target.value)), applySettings()));
  $('#theme-select').addEventListener('change', (e) => ((S.theme = e.target.value), applySettings()));
  $('#label-mode').addEventListener('change', (e) => ((S.labelMode = e.target.value), applySettings()));
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
      for (const other of Object.keys(dialogs)) if (other !== id) openDialog(other, false);
      d.querySelector('input,select,button')?.focus();
    } else if (d.contains(document.activeElement)) b.focus();
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
    tween = null;
    const c = currentCam();
    setCam({...c, az: c.az + daz, el: Math.max(-80, Math.min(85, c.el + del))});
  };
  const zoomBy = (f) => {
    tween = null;
    const c = currentCam();
    setCam({...c, d: Math.max(st.controls.minDistance, Math.min(st.controls.maxDistance, c.d * f))});
  };
  st.controls.addEventListener('start', () => (tween = null));

  // ------------------------------------------------------------ views
  const setView = (v, quiet) => {
    S.view = v;
    const V = VIEWS[v];
    camTo(V.cam);
    st.setCut(V.cut === undefined ? null : V.cut * 0.001);
    $$('[data-view]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.view === v)));
    $('#viewdesc').textContent = `${STR.views[v].name}: ${STR.views[v].desc}`;
    if (!quiet) announce(`${T.viewAnnounce}: ${STR.views[v].name}. ${STR.views[v].desc}`);
  };
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  $('.viewbtns').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    const i = VIEW_ORDER.indexOf(S.view);
    const n = VIEW_ORDER[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + VIEW_ORDER.length) % VIEW_ORDER.length];
    setView(n);
    $(`[data-view="${n}"]`).focus();
  });
  $('#btn-reset').addEventListener('click', () => camTo(VIEWS[S.view].cam));

  // ------------------------------------------------------------ systems, parts list, details
  const sysSel = $('#sys-select');
  sysSel.addEventListener('change', () => {
    S.system = sysSel.value || null;
    announce(S.system ? `${T.isolated}: ${STR.systems[S.system]}` : T.allSystems);
    renderList();
  });
  const nameOf = (id) => STR.parts[id]?.name ?? id;
  const listEl = $('#parts-list');
  const search = $('#parts-search');
  const renderList = () => {
    const q = search.value.trim().toLowerCase();
    const groups = SYSTEMS.filter((s) => !S.system || s === S.system)
      .map((s) => ({s, items: PARTS.filter((p) => p.system === s && (!q || nameOf(p.id).toLowerCase().includes(q) || (STR.parts[p.id]?.where ?? '').toLowerCase().includes(q)))}))
      .filter((g) => g.items.length);
    listEl.innerHTML = groups.length
      ? groups
          .map(
            (g) =>
              `<h3 class="sysh">${esc(STR.systems[g.s])}</h3><ul>${g.items
                .map((p) => `<li><button type="button" class="part${p.id === S.selected ? ' on' : ''}" data-part="${p.id}" aria-pressed="${p.id === S.selected}">${esc(nameOf(p.id))}${p.approx ? ` <span class="approx" title="${esc(T.approximate)}">≈</span>` : ''}</button></li>`)
                .join('')}</ul>`,
          )
          .join('')
      : `<p class="hint">${esc(T.noMatch)}</p>`;
  };
  search.addEventListener('input', renderList);
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-part]');
    if (b) select(b.dataset.part, 'list');
  });
  const renderDetails = () => {
    const id = S.selected;
    const body = $('#det-body');
    if (!id) {
      body.innerHTML = `<p class="hint">${esc(T.noSelection)}</p>`;
      return;
    }
    const t = STR.parts[id];
    const p = PART[id];
    body.innerHTML = `
      <p class="pname">${esc(t.name)}</p>
      <p class="psys"><span class="tag">${esc(STR.systems[p.system])}</span>${p.approx ? ` <span class="tag approxtag">≈ ${esc(T.approximate)}</span>` : ''}</p>
      <dl class="facts">
        <dt>${esc(T.where)}</dt><dd>${esc(t.where)}</dd>
        <dt>${esc(T.does)}</dt><dd>${esc(t.does)}</dd>
        <dt>${esc(T.connects)}</dt><dd>${esc(t.connects)}</dd>
        <dt>${esc(T.moves)}</dt><dd>${esc(t.moves)}</dd>
      </dl>
      ${p.oem.length ? `<p class="oem"><b>${esc(T.oem)}:</b> ${p.oem.map((o) => `<a href="${esc(DIAGRAMS + o.diagram + '.png')}" target="_blank" rel="noopener">${esc(o.diagram.replace(/_/g, ' '))}, ${esc(T.callout)} ${esc(o.callout)}</a> <span class="pn">${esc(o.pn)}</span>`).join('<br>')}</p>` : ''}
      <div class="detbtns">
        <button type="button" id="btn-speak">🔊 ${esc(T.speak)}</button>
        <button type="button" id="btn-clear">${esc(T.clear)} <kbd>Esc</kbd></button>
      </div>`;
    $('#btn-speak').addEventListener('click', () => {
      if (speechSynthesis.speaking) {
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
      if (from === 'canvas') $('#details').scrollIntoView({block: 'nearest'});
    }
  };
  const visibleParts = () => PARTS.filter((p) => !S.system || p.system === S.system).map((p) => p.id);
  const stepPart = (d) => {
    const ids = visibleParts();
    const i = ids.indexOf(S.selected);
    select(ids[(i + d + ids.length) % ids.length], 'key');
  };

  // ------------------------------------------------------------ transport and VTEC
  const playBtn = $('#btn-play');
  const renderPlay = () => (playBtn.innerHTML = S.playing ? `❚❚ ${esc(T.pause)} <kbd>Space</kbd>` : `▶ ${esc(T.play)} <kbd>Space</kbd>`);
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
  const vtecBtn = $('#btn-vtec');
  const renderVtec = () => {
    vtecBtn.setAttribute('aria-checked', String(S.vtec));
    vtecBtn.innerHTML = `${esc(T.vtec)}: <b>${esc(S.vtec ? T.vtecOn : T.vtecOff)}</b> <kbd>V</kbd>`;
  };
  vtecBtn.addEventListener('click', () => {
    S.vtec = !S.vtec;
    renderVtec();
    announce(`${T.vtec} ${S.vtec ? T.vtecOn : T.vtecOff}`);
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
  cylsEl.innerHTML = [1, 2, 3, 4].map((c) => `<li id="cyl-${c}"></li>`).join('');

  // ------------------------------------------------------------ canvas interaction: click to pick, keys to orbit
  let down = null;
  canvas.addEventListener('pointerdown', (e) => (down = {x: e.clientX, y: e.clientY}));
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const r = canvas.getBoundingClientRect();
    const keep = keepSet();
    const id = st.pick(e.clientX - r.left, e.clientY - r.top, (pid) => !keep || keep.has(PART[pid].system) || pid === S.selected);
    select(id, 'canvas');
  });
  canvas.addEventListener('pointermove', (e) => {
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
      else select(null);
      return;
    }
    if (typing || tag === 'SELECT') return;
    const k = e.key;
    if (k === ' ' && (document.activeElement === canvas || document.activeElement === document.body)) {
      e.preventDefault();
      playBtn.click();
    } else if (k === '+' || k === '=') zoomBy(0.85);
    else if (k === '-' || k === '_') zoomBy(1 / 0.85);
    else if (k === 'r' || k === 'R') camTo(VIEWS[S.view].cam);
    else if (k === ',') stepBy(-S.stepDeg);
    else if (k === '.') stepBy(S.stepDeg);
    else if (k === '/') {
      e.preventDefault();
      search.focus();
    } else if (k === 'n' || k === 'N') stepPart(1);
    else if (k === 'p' || k === 'P') stepPart(-1);
    else if (k === 'v' || k === 'V') vtecBtn.click();
    else if (/^[1-7]$/.test(k) && document.activeElement?.closest?.('.views, .stagewrap, body')) setView(VIEW_ORDER[Number(k) - 1]);
  });

  // ------------------------------------------------------------ labels on the engine
  const labelsEl = $('.labels');
  const leaders = $('.leaders');
  const keepSet = () => {
    if (S.system) return new Set([S.system]);
    const k = VIEWS[S.view].keep;
    return k ? new Set(k) : null;
  };
  const drawLabels = () => {
    const ids = S.labelMode === 'none' ? [] : S.labelMode === 'view' ? [...new Set([...(VIEWS[S.view].labels ?? []), ...(S.selected ? [S.selected] : [])])] : S.selected ? [S.selected] : [];
    const W = st.size.w;
    const H = st.size.h;
    const placed = [];
    let html = '';
    let svg = '';
    const fs = 15 * S.labelScale;
    for (const id of ids) {
      if (VIEWS[S.view].hidden?.includes(id)) continue;
      const p = st.project(st.eng.anchorOf(id));
      if (!p) continue;
      const [ax, ay] = p;
      if (ax < -20 || ay < -20 || ax > W + 20 || ay > H + 20) continue;
      const name = nameOf(id);
      const w = Math.min(W * 0.45, name.length * fs * 0.6 + 24);
      const h = fs * 1.9;
      // push the label away from the centre of the view, then down until it does not overlap another
      let lx = ax + (ax < W / 2 ? -w - 60 : 60);
      let ly = ay - h / 2 + (ay < H / 2 ? -40 : 40);
      lx = Math.max(8, Math.min(W - w - 8, lx));
      ly = Math.max(8, Math.min(H - h - 8, ly));
      for (let k = 0; k < 20 && placed.some((q) => lx < q.x + q.w + 6 && lx + w + 6 > q.x && ly < q.y + q.h + 6 && ly + h + 6 > q.y); k++) ly = Math.min(H - h - 8, ly + h * 0.6 + 4);
      placed.push({x: lx, y: ly, w, h});
      const sel = id === S.selected;
      const ex = lx + w / 2 < ax ? lx + w : lx;
      svg += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${(ly + h / 2).toFixed(1)}" class="ldr${sel ? ' sel' : ''}"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="${(5 * S.labelScale).toFixed(1)}" class="dot${sel ? ' sel' : ''}"/>`;
      html += `<div class="lab3d${sel ? ' sel' : ''}" style="left:${lx.toFixed(1)}px;top:${ly.toFixed(1)}px;max-width:${w.toFixed(0)}px;font-size:${fs.toFixed(1)}px">${esc(name)}</div>`;
    }
    leaders.setAttribute('viewBox', `0 0 ${W} ${H}`);
    leaders.innerHTML = svg;
    labelsEl.innerHTML = html;
  };

  // ------------------------------------------------------------ cylinder readout
  const SHAPE = T.strokeShapes;
  const renderCyls = () => {
    const fire = firingNow(S.th);
    $('#crank-deg').textContent = `${Math.round(mod(S.th, 360))}° · ${T.cycle} ${Math.round(mod(S.th, 720))}°`;
    for (const c of [1, 2, 3, 4]) {
      const k = strokeOf(phase(c, S.th));
      const li = $(`#cyl-${c}`);
      const txt = `${T.cylinder} ${c}: ${SHAPE[k]} ${T.strokes[k]}${c === fire && phase(c, S.th) < 60 ? ` — ${T.firing}` : ''}`;
      if (li.textContent !== txt) {
        li.textContent = txt;
        li.className = `stroke-${k}${c === fire && phase(c, S.th) < 60 ? ' fire' : ''}`;
      }
    }
    const waiting = S.locked.some((l) => (S.vtec ? l < 1 : l > 0));
    $('#vtec-state').textContent = waiting ? T.vtecWaiting : '';
  };

  // ------------------------------------------------------------ sizing and the loop
  const wrap = $('.stagewrap');
  const fit = () => {
    const r = wrap.getBoundingClientRect();
    st.resize(Math.max(1, r.width), Math.max(1, r.height), Math.min(devicePixelRatio || 1, 2));
  };
  new ResizeObserver(fit).observe(wrap);
  addEventListener('resize', fit);

  applySettings();
  renderPlay();
  renderVtec();
  renderList();
  renderDetails();
  setView('exterior', true);
  camTo(VIEWS.exterior.cam, true);
  fit();

  let last = performance.now();
  let flowS = 0;
  const loop = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    let simDt = 0;
    if (S.playing) {
      S.th += (360 * dt) / SPEEDS[S.speed];
      simDt = dt;
    }
    if (stepPending) {
      // step in small increments so VTEC switching on the base circle is seen on the way
      const n = Math.ceil(Math.abs(stepPending) / 5);
      const d = stepPending / n;
      for (let i = 0; i < n; i++) {
        S.th += d;
        st.eng.update(S.th, {vtec: S.vtec, dt: 0, locked: S.locked, explode: S.explode});
      }
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
      vtec: S.vtec,
      dt: S.playing ? simDt : 0,
      locked: S.locked,
      explode: S.explode,
      hidden: new Set(V.hidden ?? []),
      ghost: new Set(S.system ? [] : V.ghost ?? []),
      keepSystems: keep,
      selected: S.selected,
    });
    const anyFlow = Object.values(S.flows).some(Boolean) && S.explode < 0.01;
    st.flows.root.visible = anyFlow;
    if (anyFlow) st.flows.update(flowS);
    st.render();
    drawLabels();
    renderCyls();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.EXPLORER = {S, st, select, setView, stepBy, camTo};
}
