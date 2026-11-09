import {icon} from './icons.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Native summaries keep mouse, keyboard and screen-reader behavior in sync.
export function createDisclosures(root){
  const opened=new Set();
  root.addEventListener('toggle',event=>{const el=event.target;if(!el.matches?.('details[data-disclosure]'))return;el.open?opened.add(el.dataset.disclosure):opened.delete(el.dataset.disclosure);},true);
  const section=(key,label,body,symbol='info')=>`<details class="info-disclosure" data-disclosure="${esc(key)}"${opened.has(key)?' open':''}><summary><span class="disclosure-title">${icon(symbol)}<span>${esc(label)}</span></span><span class="disclosure-chevron">${icon('caret-right')}</span></summary><div class="disclosure-body">${body}</div></details>`;
  section.capture=()=>root.querySelectorAll('details[data-disclosure]').forEach(el=>{el.open?opened.add(el.dataset.disclosure):opened.delete(el.dataset.disclosure);});
  return section;
}
