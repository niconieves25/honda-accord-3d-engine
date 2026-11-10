// Edge drawers keep the engine canvas in place and leave the scene/controller state untouched.
const COPY = {
  es: {views: 'Vistas', explore: 'Explorar', assembly: 'Montaje', viewMenu: 'Elegir una vista', inspector: 'Explorar el motor', assemblyInspector: 'Explorar el montaje', close: 'Cerrar menú', openViews: 'Abrir menú de vistas', closeViews: 'Cerrar menú de vistas', openInspector: 'Abrir panel de exploración', closeInspector: 'Cerrar panel de exploración', controls: 'Controles', showControls: 'Mostrar controles', hideControls: 'Ocultar controles'},
  en: {views: 'Views', explore: 'Explore', assembly: 'Assembly', viewMenu: 'Choose a view', inspector: 'Explore the engine', assemblyInspector: 'Explore the assembly', close: 'Close menu', openViews: 'Open view menu', closeViews: 'Close view menu', openInspector: 'Open exploration panel', closeInspector: 'Close exploration panel', controls: 'Controls', showControls: 'Show controls', hideControls: 'Hide controls'},
};
export const immersiveCopy = lang => COPY[lang] || COPY.en;

export function createImmersiveShell({app, getLanguage, getView, onChange = () => {}}) {
  const $ = selector => app.querySelector(selector);
  const panels = {views: $('#view-drawer'), inspector: $('#inspector-drawer')};
  const buttons = {views: $('#btn-views-toggle'), inspector: $('#btn-inspector-toggle')};
  const backdrop = $('#immersive-backdrop');
  const desktop = matchMedia('(min-width: 1100px)');
  const inertBefore = new Map();
  let active = null, opener = null, modal = !desktop.matches, controlsOpen = false;
  app.classList.add('immersive-shell');

  function notify() {
    const detail = {active, modal, mode: modal ? 'modal' : 'docked'};
    onChange(detail);
    dispatchEvent(new CustomEvent('f22:drawer', {detail}));
  }
  function backgroundInert(enabled) {
    if (enabled) {
      for (const node of app.querySelectorAll('.top, .immersive-rail, .viewer-heading, .stagewrap, .scene-zoom, .scene-label-toggle, .immersive-playback, .transport, .assembly-transport')) {
        if (!inertBefore.has(node)) inertBefore.set(node, node.inert);
        node.inert = true;
      }
    } else {
      for (const [node, wasInert] of inertBefore) node.inert = wasInert;
      inertBefore.clear();
    }
  }
  function syncState() {
    app.dataset.drawerMode = modal ? 'modal' : 'docked';
    if (active) app.dataset.drawer = active;
    else delete app.dataset.drawer;
    backdrop.hidden = !active;
    // On a wide screen the edge gradient is decorative. It must never capture
    // rotation, playback, language changes or other controls around the scene.
    backdrop.style.pointerEvents = modal ? 'auto' : 'none';
    for (const panel of Object.values(panels)) panel.setAttribute('aria-modal', String(modal));
    backgroundInert(Boolean(active && modal));
    translate();
    notify();
  }
  function focusPanel(id) {
    const preferred = id === 'views'
      ? panels[id].querySelector('[data-view][aria-checked="true"]')
      : getView() === 'assembly' ? $('#assembly-chapter') : panels[id].querySelector('[role="tab"][aria-selected="true"]');
    (preferred || panels[id].querySelector('button, input, select, a[href]'))?.focus({preventScroll: true});
    if (id === 'views') preferred?.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'auto'});
  }

  function canonicalPlay() {return $(getView() === 'assembly' ? '#assembly-play' : '#btn-play');}
  function mirrorPlayback() {
    const source = canonicalPlay(), quick = $('#btn-quick-play');
    if (!source || !quick) return;
    const label = source.querySelector('.control-label')?.textContent || source.getAttribute('aria-label') || '';
    const sourceIcon = source.querySelector('.ui-icon');
    const key = `${source.id}:${label}:${source.getAttribute('aria-pressed')}:${source.disabled}:${sourceIcon?.dataset.icon || ''}`;
    if (quick.dataset.playbackMirror === key) return;
    quick.dataset.playbackMirror = key;
    const span = document.createElement('span');
    span.className = 'control-label';
    span.textContent = label;
    quick.replaceChildren(...(sourceIcon ? [sourceIcon.cloneNode(true), span] : [span]));
    quick.setAttribute('aria-label', source.getAttribute('aria-label') || label);
    quick.setAttribute('aria-pressed', source.getAttribute('aria-pressed') || 'false');
    quick.title = label;
    quick.disabled = source.disabled;
  }
  function translate() {
    const copy = immersiveCopy(getLanguage());
    const assembly = getView() === 'assembly';
    $('[data-immersive-copy="views"]').textContent = copy.views;
    $('[data-immersive-copy="explore"]').textContent = assembly ? copy.assembly : copy.explore;
    $('[data-immersive-copy="controls"]').textContent = copy.controls;
    $('#btn-controls-toggle').setAttribute('aria-expanded', String(controlsOpen));
    $('#btn-controls-toggle').title = controlsOpen ? copy.hideControls : copy.showControls;
    mirrorPlayback();
    $('#views-drawer-title').textContent = copy.viewMenu;
    $('#inspector-drawer-title').textContent = assembly ? copy.assemblyInspector : copy.inspector;
    for (const [id, button] of Object.entries(buttons)) {
      const expanded = active === id;
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('title', copy[id === 'views' ? expanded ? 'closeViews' : 'openViews' : expanded ? 'closeInspector' : 'openInspector']);
    }
    for (const button of app.querySelectorAll('[data-drawer-close]')) {
      button.setAttribute('aria-label', copy.close);
      button.title = copy.close;
    }
  }
  function close({returnFocus = true} = {}) {
    if (!active) {
      if(!controlsOpen)return false;
      controlsOpen=false;delete app.dataset.controls;translate();
      if(returnFocus)$('#btn-controls-toggle').focus({preventScroll:true});
      return true;
    }
    panels[active].hidden = true;
    active = null;
    syncState();
    if (returnFocus) (opener?.isConnected && !opener.closest('[hidden]') ? opener : $('#gl')).focus({preventScroll: true});
    opener = null;
    return true;
  }
  function open(id, {focus = true, source = null} = {}) {
    if (!panels[id]) return;
    const alreadyOpen = active === id;
    if (!alreadyOpen) {
      if (active) panels[active].hidden = true;
      opener = source || document.activeElement || buttons[id];
      active = id;
      panels[id].hidden = false;
      syncState();
    }
    // Compact screens use a modal drawer, so focus cannot remain on the scene.
    // Desktop panels leave the scene and playback fully interactive.
    if (focus || (modal && !alreadyOpen)) focusPanel(id);
    else if (id === 'views') panels[id].querySelector('[data-view][aria-checked="true"]')?.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'auto'});
  }
  function toggle(id, source) {if (active === id) close(); else open(id, {source});}
  $('#btn-quick-play').addEventListener('click', () => canonicalPlay()?.click());
  $('#btn-controls-toggle').addEventListener('click', () => {
    controlsOpen = !controlsOpen;
    if (controlsOpen) app.dataset.controls = 'open';
    else delete app.dataset.controls;
    translate();
  });
  const playbackObserver = new MutationObserver(mirrorPlayback);
  const observedPlayButtons=new WeakSet();
  function observePlayButtons(){
    for(const button of app.querySelectorAll('#btn-play, #assembly-play'))if(!observedPlayButtons.has(button)){
      playbackObserver.observe(button,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-pressed','aria-label','disabled']});
      observedPlayButtons.add(button);
    }
    mirrorPlayback();
  }
  // Assembly's button is mounted after the shell. Observe that one insertion,
  // then watch only the buttons, not the timeline's per-frame text updates.
  const assemblyMountObserver=new MutationObserver(()=>{if($('#assembly-play')){observePlayButtons();assemblyMountObserver.disconnect();}});
  assemblyMountObserver.observe($('#assembly-transport'),{childList:true});
  observePlayButtons();
  for (const [id, button] of Object.entries(buttons)) button.addEventListener('click', () => toggle(id, button));
  for (const button of app.querySelectorAll('[data-drawer-close]')) button.addEventListener('click', () => close());
  backdrop.addEventListener('click', () => {if (modal) close();});
  app.addEventListener('keydown', event => {
    if (!active || !modal || event.key !== 'Tab') return;
    const focusable = [...panels[active].querySelectorAll('button, a[href], input, select, summary, [tabindex]')]
      .filter(node => !node.disabled && node.tabIndex >= 0 && !node.closest('[hidden]') && node.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1), current = document.activeElement;
    if (event.shiftKey && (current === first || !panels[active].contains(current))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (current === last || !panels[active].contains(current))) {
      event.preventDefault(); first.focus();
    }
  });
  desktop.addEventListener('change', () => {
    modal = !desktop.matches;
    syncState();
    if (active && modal && !panels[active].contains(document.activeElement)) focusPanel(active);
  });
  syncState();
  return {open, close, toggle, translate, get active() {return active;}, get modal() {return modal;}};
}
