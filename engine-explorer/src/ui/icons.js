// Shared, local SVG vocabulary. Decorative by default; buttons own accessible names.
import utility from '../../assets/icons/utility.json';
const fill = body => `<g fill="currentColor" fill-opacity=".18" stroke="none">${body}</g>`;
const custom = {
  engine: fill('<path d="M7 10h18v16H7z"/><path d="M10 5h12v5H10z"/>')+'<path d="M10 5h12v5H10zM7 10h18v16H7zM7 15H3v7h4m18-6h4v6h-4M11 26v3m10-3v3M13 10v16m6-16v16"/><path d="M14 5V2h4v3"/>',
  cover: fill('<path d="M5 8h22l2 17H3z"/>')+'<path d="M5 8h22l2 17H3zM8 13h16M8 18h16"/><circle cx="23" cy="21" r="1"/><path d="M10 8V5h8v3M7 25v3m18-3v3"/>',
  piston: fill('<path d="M8 4h16v13H8zM13 17h6v9h-6z"/>')+'<path d="M8 4h16v13H8zM8 8h16M8 11h16M13 17v8m6-8v8"/><circle cx="16" cy="26" r="4"/><circle cx="16" cy="26" r="1"/>',
  balance: fill('<path d="M5 10h22v5H5zM5 22h22v5H5z"/>')+'<path d="M3 10h26v5H3zM3 22h26v5H3zM9 10V5h6v5m3 12v-5h6v5"/><path d="m7 3 2 2-2 2m18 10-2 2 2 2"/>',
  valves: fill('<path d="m7 7 8 15-5 3L2 10zm18 0-8 15 5 3 8-15z"/>')+'<path d="m5 6 9 17m13-17-9 17M8 26l8-4m0 0 8 4M4 10l7-3M6 14l7-3m8-4 7 3m-9 1 7 3"/><path d="M11 3h10M16 3v8"/>',
  belt: fill('<path d="M10 3a6 6 0 0 1 12 0l6 21a7 7 0 0 1-7 6H11a7 7 0 0 1-7-6z"/>')+'<path d="M10 8a6 6 0 0 1 12 0l6 15a6 6 0 0 1-6 7H10a6 6 0 0 1-6-7z"/><circle cx="16" cy="8" r="4"/><circle cx="11" cy="23" r="4"/><circle cx="23" cy="23" r="3"/><path d="M16 6v4m-2-2h4m-9 15h4m-2-2v4"/>',
  cylinder: fill('<path d="M7 5h18v23H7z"/>')+'<path d="M7 5h18v23H7M7 5v23m0-13h18M10 15v7h12v-7M16 22v8M10 5V2m12 3V2"/><path d="M3 8h4m-4 6h4m-4 6h4m-4 6h4M13 7l3 4 3-4"/>',
  crank: fill('<path d="M8 10h6v13H8zm10-1h6v13h-6z"/>')+'<path d="M2 19h6v-9h6v13h4V9h6v10h6M8 19v6h6v-2m4-14V5h6v4"/><circle cx="5" cy="19" r="2"/><circle cx="27" cy="19" r="2"/>',
  intake: fill('<rect x="4" y="5" width="24" height="8" rx="3"/>')+'<rect x="4" y="5" width="24" height="8" rx="3"/><path d="M7 13v7q0 5 4 5h2m1-12v12m5-12v12m6-12v7q0 5-4 5M11 28h12M1 9h3"/>',
  butterfly: fill('<circle cx="16" cy="16" r="12"/><ellipse cx="16" cy="16" rx="4" ry="11" transform="rotate(-35 16 16)"/>')+'<circle cx="16" cy="16" r="12"/><ellipse cx="16" cy="16" rx="4" ry="11" transform="rotate(-35 16 16)"/><path d="M2 16h28"/><circle cx="16" cy="16" r="2"/>',
  exhaust: fill('<path d="M4 5h24v4H4zM11 22h10v6H11z"/>')+'<path d="M4 5h24v4H4zM6 9v7q0 6 8 6m-1-13v13m6-13v13m7-13v7q0 6-8 6M11 22h10v6H11zM16 28v3"/>',
  spark: fill('<path d="M12 8h8v10h-8z"/>')+'<path d="M14 2h4v6h-4zM12 8h8v10h-8zM10 18h12v5H10zM13 23v5h5v-5M16 28v3M10 12h12m-12 3h12M4 6l3 3M28 6l-3 3"/>',
  oil: fill('<path d="M5 13h15v13H5zM20 13l9-4-4 11h-5z"/>')+'<path d="M5 13h15v13H5zM20 13l9-4-4 11h-5M8 13V9h8v4M5 17H2v6h3"/><path d="M26 24s-3 3-3 5a3 3 0 0 0 6 0c0-2-3-5-3-5Z"/>',
  cooling: fill('<rect x="7" y="6" width="18" height="22" rx="2"/>')+'<rect x="7" y="6" width="18" height="22" rx="2"/><path d="M11 6v22m5-22v22m5-22v22M7 11h18M7 22h18M3 9h4m18 15h4M12 6V3h8v3"/>',
  accessory: fill('<circle cx="16" cy="16" r="11"/>')+'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="4"/><path d="M16 5V2M16 30v-3M5 16H2m28 0h-3M8 8l4 4m8 8 4 4M8 24l4-4m8-8 4-4M12 3h8M12 29h8"/>',
  flywheel: fill('<circle cx="16" cy="16" r="11"/>')+'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="5"/><path d="M16 2v3m0 22v3M2 16h3m22 0h3M6 6l2 2m16 16 2 2M6 26l2-2M24 8l2-2"/><circle cx="16" cy="8" r=".8"/><circle cx="8" cy="16" r=".8"/><circle cx="24" cy="16" r=".8"/><circle cx="16" cy="24" r=".8"/>',
  exploded: fill('<path d="m16 2 13 7-13 7L3 9zm0 14 13 7-13 7-13-7z"/>')+'<path d="m16 2 13 7-13 7L3 9zM3 16l13 7 13-7M3 23l13 7 13-7M16 16v7"/>',
};
export const SYSTEM_ICONS={exterior:'cover',bottom:'piston',balance:'balance',head:'valves',timing:'belt',intake:'intake',exhaust:'exhaust',ignition:'spark',oil:'oil',cooling:'cooling',accessory:'accessory',manual:'flywheel'};
export const VIEW_ICONS={exterior:'engine',noCover:'valves',noTiming:'belt',cutaway:'cylinder',lower:'crank',iab:'butterfly',exploded:'exploded'};
export const ICON_NAMES=[...Object.keys(custom),...Object.keys(utility)];
export function icon(name,kind='utility') {
  if(custom[name]) return `<svg class="ui-icon ${kind==='mechanical'?'mechanical-icon':''}" data-icon="${name}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${custom[name]}</svg>`;
  const svg=utility[name];
  if(!svg)throw new Error(`Unknown UI icon: ${name}`);
  return svg.replace('<svg ',`<svg class="ui-icon" data-icon="${name}" aria-hidden="true" focusable="false" `);
}
// Localized copy can change without replacing an icon or its parent control.
export function setControlText(element,text) {
  const span=element.querySelector(':scope > .control-label');
  if(span)span.textContent=text;
  else element.textContent=text;
}
export function setControlIcon(element,name) {
  const svg=element.querySelector(':scope > .ui-icon');
  if(svg)svg.outerHTML=icon(name);
}
