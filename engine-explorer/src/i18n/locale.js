/** Shared language preference for both explorer pages. Spanish is the default. */
export const LANGUAGE_OPTIONS = [
  {value: 'es', label: 'Español'},
  {value: 'en', label: 'English'},
];
const valid = language => language === 'es' || language === 'en';
let current;
export function getLanguage() {
  if (current) return current;
  try {
    const saved = JSON.parse(localStorage.getItem('f22.language'));
    if (valid(saved)) return current = saved;
  } catch { /* Storage may be unavailable in private browsing. */ }
  return current = 'es';
}
export function setLanguage(language) {
  if (!valid(language)) throw new RangeError('Unsupported language');
  current = language;
  try { localStorage.setItem('f22.language', JSON.stringify(language)); } catch {}
  if (typeof document !== 'undefined') document.documentElement.lang = language;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('f22:language', {detail: {language}}));
  return language;
}
export const chooseLanguage = (es, en, language = getLanguage()) => language === 'en' ? en : es;

// Another explorer tab can change the same preference without a page reload.
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== 'f22.language') return;
  let language;
  try { language = JSON.parse(event.newValue); } catch { return; }
  if (!valid(language) || language === current) return;
  current = language;
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent('f22:language', {detail: {language}}));
});

// Back/Forward cache may suspend storage events while the page is frozen.
if (typeof window !== 'undefined') window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  let language;
  try { language = JSON.parse(localStorage.getItem('f22.language')); } catch { return; }
  if (!valid(language) || language === current) return;
  current = language;
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent('f22:language', {detail: {language}}));
});
