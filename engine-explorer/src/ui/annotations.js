/**
 * Screen-space annotations. Coordinates and dimensions are CSS pixels.
 *
 * Both helpers accept:
 *   { anchors: [{id, x, y, selected?, priority?, ...metadata}], width, height,
 *     bounds?: {x,y,width,height}, obstacles?: [{x,y,width,height}], gap?: 6 }
 *
 * `layoutPins` adds `size` (minimum 44), `maxDisplacement` (default 132).
 * `layoutTags` reads each anchor's `labelWidth` / `labelHeight` and adds
 * `maxDisplacement` (default 240), `offset` (default 30). Optional
 * `searchFreeSpace` adds obstacle-edge candidates when nearby candidates fail;
 * useful for the one interactive preview card, rather than every expanded tag.
 *
 * Return value: {items, hidden}. Each item retains anchor metadata, with x/y
 * now the rectangle's TOP LEFT, width/height, centerX/centerY, anchorX/anchorY,
 * and `displaced`. `hidden` contains omitted IDs. Draw a leader from the exact
 * anchor to the rectangle edge/center when displaced. No annotation is placed
 * over a HUD obstacle or another annotation, and no offscreen anchor is moved
 * onto the screen. A selected annotation gets first choice of available space.
 * Use returned pin rectangles as additional obstacles when placing tags.
 *
 * The functions are pure and deterministic. They never measure DOM, mutate
 * anchors, change the camera, or assume the dimensions of translated text.
 */

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function rectangle(rect) {
  if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    || rect.width < 0 || rect.height < 0) return null;
  return {x:rect.x, y:rect.y, width:rect.width, height:rect.height};
}

function intersects(a, b, gap = 0) {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

function prepare(options) {
  const width = Math.max(0, finite(options.width, 0));
  const height = Math.max(0, finite(options.height, 0));
  const requested = rectangle(options.bounds) || {x:12,y:12,width:width-24,height:height-24};
  const left = Math.max(0, requested.x), top = Math.max(0, requested.y);
  const right = Math.min(width, requested.x + requested.width);
  const bottom = Math.min(height, requested.y + requested.height);
  const bounds = {x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
  const anchors = Array.isArray(options.anchors) ? options.anchors : [];
  const sorted = anchors.map((anchor, index) => ({anchor,index})).sort((a,b) =>
    Number(Boolean(b.anchor.selected)) - Number(Boolean(a.anchor.selected))
    || finite(b.anchor.priority,0) - finite(a.anchor.priority,0) || a.index-b.index);
  const obstacles = (options.obstacles || []).map(rectangle).filter(Boolean);
  const gap = Math.max(0, finite(options.gap,6));
  return {width,height,bounds,anchors,sorted,obstacles,gap};
}

function crossing(a, b) {
  const turn = (p,q,r) => (q.x-p.x)*(r.y-p.y) - (q.y-p.y)*(r.x-p.x);
  return turn(a[0],a[1],b[0]) * turn(a[0],a[1],b[1]) < 0
    && turn(b[0],b[1],a[0]) * turn(b[0],b[1],a[1]) < 0;
}

function place(options, dimensions, candidates) {
  const {width,height,bounds,anchors,sorted,obstacles,gap} = prepare(options);
  const items = [], hidden = [], leaders = [];
  for (const {anchor} of sorted) {
    const size = dimensions(anchor);
    if (![anchor.x,anchor.y,size.width,size.height].every(Number.isFinite)
      || anchor.x < 0 || anchor.y < 0 || anchor.x > width || anchor.y > height
      || size.width <= 0 || size.height <= 0
      || size.width > bounds.width || size.height > bounds.height) {
      hidden.push(anchor.id); continue;
    }
    let best = null, bestScore = Infinity;
    const seen = new Set();
    const consider = positions => { for (const candidate of positions) {
      const rect = {
        x:clamp(candidate.x,bounds.x,bounds.x+bounds.width-size.width),
        y:clamp(candidate.y,bounds.y,bounds.y+bounds.height-size.height), ...size,
      };
      const key = `${rect.x.toFixed(3)}:${rect.y.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const centerX = rect.x+rect.width/2, centerY = rect.y+rect.height/2;
      const distance = Math.hypot(centerX-anchor.x,centerY-anchor.y);
      if (distance > candidates.maxDisplacement + 1e-6
        || obstacles.some(obstacle => intersects(rect,obstacle,gap))
        || items.some(item => intersects(rect,item,gap))) continue;
      const leader = [{x:anchor.x,y:anchor.y},{x:centerX,y:centerY}];
      const intersections = leaders.reduce((total,other) => total + Number(crossing(leader,other)),0);
      // Prefer short leaders; a crossing costs roughly one extra pin-width of
      // movement. Candidate order breaks exact ties without any randomness.
      const score = distance*distance + intersections*44*44;
      if (score < bestScore) {
        bestScore = score;
        best = {...anchor,...rect,centerX,centerY,anchorX:anchor.x,anchorY:anchor.y,
          displaced:distance > .5};
      }
    }};
    consider(candidates(anchor,size));
    if (!best && candidates.fallback) consider(candidates.fallback(anchor,size));
    if (best) {
      items.push(best);
      leaders.push([{x:best.anchorX,y:best.anchorY},{x:best.centerX,y:best.centerY}]);
    } else hidden.push(anchor.id);
  }
  // Sorting hidden IDs back into input order simplifies retaining stable
  // catalogue numbering even when the selected annotation was placed first.
  const omitted = new Set(hidden);
  return {items,hidden:anchors.filter(anchor=>omitted.has(anchor.id)).map(anchor=>anchor.id)};
}

/** Compact numbered markers with non-overlapping, minimum 44px hit areas. */
export function layoutPins(options = {}) {
  const size = Math.max(44,finite(options.size,44));
  const gap = Math.max(0,finite(options.gap,6));
  const maxDisplacement = Math.max(0,finite(options.maxDisplacement,132));
  const pitch = size+gap;
  const candidates = (anchor) => {
    const positions = [{x:anchor.x-size/2,y:anchor.y-size/2}];
    const radii = [];
    for (let radius=pitch; radius<maxDisplacement; radius+=pitch) radii.push(radius);
    if (maxDisplacement > 0) radii.push(maxDisplacement);
    for (const radius of radii) for (let i=0;i<16;i++) {
      const angle = -Math.PI/2 + i*Math.PI/8;
      positions.push({x:anchor.x+Math.cos(angle)*radius-size/2,
        y:anchor.y+Math.sin(angle)*radius-size/2});
    }
    return positions;
  };
  candidates.maxDisplacement = maxDisplacement;
  return place(options,()=>({width:size,height:size}),candidates);
}

/** Optional expanded labels. Call with real translated-text measurements. */
export function layoutTags(options = {}) {
  const maxDisplacement = Math.max(0,finite(options.maxDisplacement,240));
  const offset = Math.max(0,finite(options.offset,30));
  const candidates = (anchor,{width,height}) => {
    const positions = [];
    // Keep labels away from the engine center when possible. Additional rows
    // offer space when translated or enlarged labels need more room.
    const sides = anchor.x < finite(options.width,0)/2 ? [-1,1] : [1,-1];
    for (const side of sides) for (const row of [0,-1,1,-2,2,-3,3]) {
      positions.push({x:side<0?anchor.x-offset-width:anchor.x+offset,
        y:anchor.y-height/2+row*(height+6)});
    }
    for (const side of [-1,1]) for (const column of [0,-1,1]) {
      positions.push({x:anchor.x-width/2+column*(width+6),
        y:side<0?anchor.y-offset-height:anchor.y+offset});
    }
    return positions;
  };
  candidates.maxDisplacement = maxDisplacement;
  if (options.searchFreeSpace) {
    const {bounds,obstacles,gap} = prepare(options);
    candidates.fallback = (anchor,{width,height}) => {
      const xs = new Set([bounds.x,bounds.x+bounds.width-width,anchor.x-width/2]);
      const ys = new Set([bounds.y,bounds.y+bounds.height-height,anchor.y-height/2]);
      for (const obstacle of obstacles) {
        xs.add(obstacle.x-width-gap); xs.add(obstacle.x+obstacle.width+gap);
        ys.add(obstacle.y-height-gap); ys.add(obstacle.y+obstacle.height+gap);
      }
      const positions = [];
      for (const x of xs) for (const y of ys) positions.push({x,y});
      return positions;
    };
  }
  return place(options,anchor=>({width:finite(anchor.labelWidth,140),height:finite(anchor.labelHeight,36)}),candidates);
}
