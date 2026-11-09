import {getLanguage,setLanguage} from '../src/i18n/locale.js';
import {mountGlyphBackground} from '../src/ui/glyph-background.js';

const copy={
  es:{skip:'Ir al explorador',brandSub:'UN MOTOR. CADA DETALLE.',eyebrow:'PROYECTO INTERACTIVO · F22A6',intro:'Conoce el motor desde adentro.',description:'Explora cada pieza, descubre cómo se mueve y entiende cómo trabaja con las demás. A tu ritmo, en tres dimensiones.',enter:'Entrar al explorador',access:'Texto ampliable, controles accesibles y narración.',figureLabel:'VISTA DEL MODELO 3D',caption:'Una mirada al corazón del Accord.',engineLabel:'MOTOR F22A6',piecesLabel:'TIPOS DE PIEZAS',systemsLabel:'SISTEMAS PARA EXPLORAR',closing:'Del conjunto completo a la pieza más pequeña.',footer:'Un proyecto de Nico Nieves.',educational:'Reconstrucción educativa · EX sedán · manual de 5 marchas',imageAlt:'Reconstrucción 3D del motor Honda F22A6, vista de tres cuartos',specsLabel:'Características del proyecto',title:'Honda Accord 1993 · Explorador F22A6'},
  en:{skip:'Skip to explorer',brandSub:'ONE ENGINE. EVERY DETAIL.',eyebrow:'INTERACTIVE PROJECT · F22A6',intro:'Get to know the engine from within.',description:'Explore each component, discover how it moves and understand how it works with the others. At your own pace, in three dimensions.',enter:'Enter the explorer',access:'Enlargeable text, accessible controls and narration.',figureLabel:'3D MODEL PREVIEW',caption:'A look at the heart of the Accord.',engineLabel:'F22A6 ENGINE',piecesLabel:'COMPONENT TYPES',systemsLabel:'SYSTEMS TO EXPLORE',closing:'From the complete engine to its smallest component.',footer:'A project by Nico Nieves.',educational:'Educational reconstruction · EX sedan · 5-speed manual',imageAlt:'Three-quarter view of the reconstructed Honda F22A6 engine',specsLabel:'Project features',title:'Honda Accord 1993 · F22A6 Explorer'}
};
function translate(language){
  const text=copy[language]||copy.es;
  document.documentElement.lang=language;
  document.title=text.title;
  for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=text[node.dataset.i18n];
  for(const node of document.querySelectorAll('[data-i18n-alt]'))node.alt=text[node.dataset.i18nAlt];
  for(const node of document.querySelectorAll('[data-i18n-aria]'))node.setAttribute('aria-label',text[node.dataset.i18nAria]);
  for(const button of document.querySelectorAll('[data-language]'))button.setAttribute('aria-pressed',String(button.dataset.language===language));
}
for(const button of document.querySelectorAll('[data-language]'))button.addEventListener('click',()=>{setLanguage(button.dataset.language);translate(button.dataset.language);});
translate(getLanguage());
window.addEventListener('pageshow',()=>translate(getLanguage()));
window.addEventListener('storage',()=>translate(getLanguage()));
mountGlyphBackground();
