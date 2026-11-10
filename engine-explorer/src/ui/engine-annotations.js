import {layoutPins, layoutTags} from './annotations.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const attr = (node, key, value) => {
  const next = String(value);
  if (node.getAttribute(key) !== next) node.setAttribute(key, next);
};
const text = (node, value) => {
  const next = String(value ?? '');
  if (node.textContent !== next) node.textContent = next;
};
const svgHidden = (node, hidden) => node.toggleAttribute('hidden', hidden);
const position = (node, rect) => {
  node.style.left = `${rect.x.toFixed(1)}px`;
  node.style.top = `${rect.y.toFixed(1)}px`;
  node.style.width = `${rect.width.toFixed(1)}px`;
  node.style.height = `${rect.height.toFixed(1)}px`;
};
const edgeOf = (rect, point) => {
  const dx = point.x - rect.centerX, dy = point.y - rect.centerY;
  const ratio = Math.max(Math.abs(dx) / Math.max(1,rect.width / 2), Math.abs(dy) / Math.max(1,rect.height / 2), 1);
  return {x:rect.centerX + dx / ratio, y:rect.centerY + dy / ratio};
};

/** Persistent, keyboard-operable annotation pins. The canvas owns projection;
 * this layer only places DOM controls in its CSS-pixel coordinate system. */
export function createEngineAnnotations({container, leaders, card, onSelect, onDetails, getName, getCopy}) {
  const pins = new Map();
  const measureCache = new Map();
  const cardOcclusion = new Map();
  let latest = null, placements = new Map(), hovered = null, focused = null;
  let cardId = null, cardHovered = false, graceId = null, hideTimer = null, destroyed = false;
  let cardSizeKey = '', cardSize = null;
  container.removeAttribute('aria-hidden');
  container.setAttribute('role', 'group');
  leaders.setAttribute('aria-hidden', 'true');
  card.classList.add('annotation-card');
  if (!card.id) card.id = 'engine-annotation-preview';
  card.setAttribute('role', 'group');
  card.hidden = true;

  const kicker = document.createElement('span');
  kicker.className = 'annotation-kicker';
  const name = document.createElement('strong');
  name.className = 'annotation-name';
  const details = document.createElement('button');
  details.type = 'button';
  details.className = 'annotation-details';
  card.append(kicker, name, details);
  const cardLeader = document.createElementNS(SVG_NS, 'line');
  cardLeader.setAttribute('class', 'ldr sel annotation-preview-leader');
  svgHidden(cardLeader,true);
  leaders.append(cardLeader);

  function cancelHide() {
    if (hideTimer !== null) clearTimeout(hideTimer);
    hideTimer = null; graceId = null;
  }
  function canvasFocus() {
    container.closest('.stagewrap')?.querySelector('canvas')?.focus({preventScroll:true});
  }
  function hideNode(node, fallback = null) {
    if (node.contains(document.activeElement)) {
      if (fallback && !fallback.hidden) fallback.focus({preventScroll:true});
      else canvasFocus();
    }
    node.hidden = true;
  }
  function queuePreview() {
    cancelHide();
    graceId = cardId;
    hideTimer = setTimeout(() => { hideTimer = null; graceId = null; renderPreview(); }, 200);
  }
  function showLine(line, from, to) {
    svgHidden(line,false);
    attr(line, 'x1', from.x.toFixed(1)); attr(line, 'y1', from.y.toFixed(1));
    attr(line, 'x2', to.x.toFixed(1)); attr(line, 'y2', to.y.toFixed(1));
  }
  function createPin(id) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'engine-pin';
    button.dataset.annotationId = id;
    button.hidden = true;
    const number = document.createElement('span');
    number.className = 'engine-pin-number'; number.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'engine-pin-label'; label.setAttribute('aria-hidden', 'true');
    button.append(number,label);
    attr(button, 'aria-controls', card.id);
    button.addEventListener('pointerenter', () => { cancelHide(); hovered = id; renderPreview(); });
    button.addEventListener('pointerleave', () => { if (hovered === id) hovered = null; queuePreview(); });
    button.addEventListener('focus', () => { cancelHide(); focused = id; renderPreview(); });
    button.addEventListener('blur', () => { if (focused === id) focused = null; queueMicrotask(renderPreview); });
    button.addEventListener('click', () => { cancelHide(); onSelect?.(id); renderPreview(); });
    container.append(button);
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', 'ldr'); svgHidden(line,true);
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('class', 'dot'); dot.setAttribute('r', '2.5'); svgHidden(dot,true);
    leaders.insertBefore(line,cardLeader); leaders.insertBefore(dot,cardLeader);
    const pin = {button,number,label,line,dot}; pins.set(id,pin); return pin;
  }
  function previewId() {
    if (!latest || latest.mode === 'none') return null;
    if (card.contains(document.activeElement) && placements.has(cardId)) return cardId;
    if (placements.has(focused)) return focused;
    if (placements.has(hovered)) return hovered;
    if (cardHovered && placements.has(cardId)) return cardId;
    if (placements.has(graceId)) return graceId;
    return placements.has(latest.selected) ? latest.selected : null;
  }
  function restoreOccludedPins() {
    for (const [id,saved] of cardOcclusion) {
      const pin = pins.get(id); if (!pin) continue;
      pin.button.hidden = saved.button; svgHidden(pin.line,saved.line); svgHidden(pin.dot,saved.dot);
    }
    cardOcclusion.clear();
  }
  function renderPreview() {
    if (destroyed) return;
    restoreOccludedPins();
    const id = previewId(), pin = pins.get(id), anchor = placements.get(id);
    const expanded = visible => {
      for (const [key,value] of pins) attr(value.button,'aria-expanded',Boolean(visible && key===id));
    };
    if (!id || !anchor) {
      expanded(false);
      hideNode(card,pin?.button); svgHidden(cardLeader,true); cardId = null; return;
    }
    cardId = id;
    const copy = getCopy?.() || {}, label = getName(id);
    text(kicker,copy.preview || 'Part'); text(name,label); text(details,copy.details || 'Details');
    attr(card,'aria-label',`${copy.preview || 'Part'}: ${label}`);
    const bounds = latest.bounds || {x:12,y:12,width:latest.width-24,height:latest.height-24};
    const availableWidth = Math.max(0,Math.min(latest.width-24,bounds.width));
    const cardWidth = Math.min(320,availableWidth);
    const sizeKey = `${label}:${copy.preview}:${copy.details}:${cardWidth}:${latest.scale}:${latest.textScale}:${latest.lang}`;
    card.hidden = false;
    if (cardSizeKey !== sizeKey || !cardSize) {
      card.style.width = `${cardWidth}px`; card.style.height = '';
      const measured = card.getBoundingClientRect();
      cardSize = {width:measured.width,height:measured.height}; cardSizeKey = sizeKey;
    }
    const previewOptions = {
      anchors:[{id,x:anchor.centerX,y:anchor.centerY,selected:true,
        labelWidth:cardSize.width,labelHeight:cardSize.height}],
      width:latest.width,height:latest.height,bounds:latest.bounds,
      obstacles:[...(latest.obstacles || []),...placements.values()],
      maxDisplacement:Math.max(350,Math.hypot(latest.width,latest.height)), offset:30, searchFreeSpace:true,
    };
    let rect = layoutTags(previewOptions).items[0], prioritizeCard = false;
    if (!rect) {
      // Enlarged mobile text may leave no card-sized opening between all the
      // pins. Keep the active/focused target and readable card; temporarily
      // remove other covered targets rather than leave hit areas underneath it.
      const reserved = [anchor];
      if (focused && focused!==id && placements.has(focused)) reserved.push(placements.get(focused));
      rect = layoutTags({...previewOptions,obstacles:[...(latest.obstacles || []),...reserved]}).items[0];
      prioritizeCard = Boolean(rect);
    }
    if (!rect) {
      expanded(false);
      hideNode(card,pin.button); svgHidden(cardLeader,true); return;
    }
    if (prioritizeCard) for (const [otherId,other] of placements) {
      const otherPin = pins.get(otherId);
      if (otherId===id || otherId===focused || otherPin.button.contains(document.activeElement)) continue;
      const overlaps = rect.x < other.x+other.width+6 && rect.x+rect.width+6 > other.x
        && rect.y < other.y+other.height+6 && rect.y+rect.height+6 > other.y;
      if (!overlaps) continue;
      cardOcclusion.set(otherId,{button:otherPin.button.hidden,line:otherPin.line.hasAttribute('hidden'),dot:otherPin.dot.hasAttribute('hidden')});
      otherPin.button.hidden = true; svgHidden(otherPin.line,true); svgHidden(otherPin.dot,true);
    }
    expanded(true);
    position(card,rect);
    const source = {x:anchor.anchorX,y:anchor.anchorY};
    showLine(cardLeader,source,edgeOf(rect,source));
  }

  details.addEventListener('click', () => { if (cardId && placements.has(cardId)) onDetails?.(cardId); });
  card.addEventListener('pointerenter', () => { cancelHide(); cardHovered = true; });
  card.addEventListener('pointerleave', () => { cardHovered = false; queuePreview(); });
  card.addEventListener('focusin',cancelHide);
  card.addEventListener('focusout',() => queueMicrotask(renderPreview));

  function clear() {
    restoreOccludedPins();
    cancelHide(); hovered = null; focused = null; cardHovered = false; graceId = null; cardId = null; placements.clear();
    for (const pin of pins.values()) { hideNode(pin.button); svgHidden(pin.line,true); svgHidden(pin.dot,true); }
    hideNode(card); svgHidden(cardLeader,true);
  }
  function update(options) {
    if (destroyed) return;
    restoreOccludedPins();
    latest = {...options,width:Math.max(0,finite(options.width,0)),height:Math.max(0,finite(options.height,0))};
    const mode = ['view','all','selected','none'].includes(latest.mode) ? latest.mode : 'view';
    latest.mode = mode;
    container.dataset.mode = mode;
    const copy = getCopy?.() || {};
    attr(container,'aria-label',copy.annotations || copy.preview || 'Engine parts');
    attr(leaders,'viewBox',`0 0 ${latest.width} ${latest.height}`);
    if (mode === 'none' || !latest.width || !latest.height) { clear(); return; }
    const numbered = (latest.anchors || []).map((anchor,index) => ({...anchor,number:anchor.number ?? index+1}));
    const anchors = numbered.filter(anchor => mode !== 'selected' || anchor.id === latest.selected);
    const scale = Math.max(.8,Math.min(2.6,finite(latest.scale,1.25)));
    const fontSize = mode === 'all' ? getComputedStyle(container).fontSize : '';
    const source = anchors.map(anchor => {
      const pin = pins.get(anchor.id) || createPin(anchor.id);
      const label = getName(anchor.id), number = String(anchor.number).padStart(2,'0');
      text(pin.number,number); text(pin.label,label);
      attr(pin.button,'aria-label',`${number}. ${label}`);
      attr(pin.button,'aria-pressed',anchor.id === latest.selected);
      pin.button.classList.toggle('sel',anchor.id === latest.selected);
      pin.line.classList.toggle('sel',anchor.id === latest.selected);
      pin.dot.classList.toggle('sel',anchor.id === latest.selected);
      const priority = anchor.id === focused ? 10 : finite(anchor.priority,0);
      const important = anchor.id===latest.selected || anchor.id===focused;
      if (mode !== 'all') return {...anchor,selected:important,priority};
      const key = `${latest.lang}:${label}:${scale}:${latest.width}:${fontSize}`;
      let measured = measureCache.get(key);
      if (!measured) {
        // Measure translated text once, without replacing or detaching controls.
        pin.button.hidden = false; pin.button.style.width = 'max-content'; pin.button.style.maxWidth = `${latest.width-24}px`; pin.button.style.height = '';
        const rect = pin.button.getBoundingClientRect();
        measured = {labelWidth:Math.max(44,Math.min(latest.width-24,rect.width)),labelHeight:Math.max(44,rect.height)};
        measureCache.set(key,measured);
      }
      return {...anchor,...measured,selected:important,priority};
    });
    const input = {...latest,anchors:source,size:44,gap:6};
    const result = mode === 'all' ? layoutTags({...input,maxDisplacement:260}) : layoutPins(input);
    placements = new Map(result.items.map(item => [item.id,item]));
    for (const [id,pin] of pins) {
      const rect = placements.get(id);
      if (!rect) { hideNode(pin.button); svgHidden(pin.line,true); svgHidden(pin.dot,true); continue; }
      pin.button.hidden = false; position(pin.button,rect);
      const displaced = mode === 'all' || Math.hypot(rect.centerX-rect.anchorX,rect.centerY-rect.anchorY)>4;
      if (displaced) {
        const from = {x:rect.anchorX,y:rect.anchorY};
        showLine(pin.line,from,mode === 'all' ? edgeOf(rect,from) : {x:rect.centerX,y:rect.centerY});
        svgHidden(pin.dot,false); attr(pin.dot,'cx',from.x.toFixed(1)); attr(pin.dot,'cy',from.y.toFixed(1));
      } else { svgHidden(pin.line,true); svgHidden(pin.dot,true); }
    }
    renderPreview();
  }
  return {update,clear,destroy() {
    if (destroyed) return; clear(); destroyed = true;
    for (const pin of pins.values()) { pin.button.remove(); pin.line.remove(); pin.dot.remove(); }
    pins.clear(); measureCache.clear(); cardLeader.remove(); kicker.remove(); name.remove(); details.remove();
  }};
}
