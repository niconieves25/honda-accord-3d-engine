// A shared appearance preference lets both viewers feel like one application.
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('f22.'+key))??fallback;}catch{return fallback;}};
export function readAppearance(){
  const theme=read('theme','dark'),scale=Number(read('textScale',1.25));
  const reduceDefault=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)').matches:false;
  return {theme:['dark','light','soft'].includes(theme)?theme:'dark',scale:Number.isFinite(scale)?Math.max(1,Math.min(2.4,scale)):1.25,reduceMotion:read('reduceMotion',reduceDefault)===true};
}
export const publishAppearance=appearance=>window.dispatchEvent(new CustomEvent('f22:appearance',{detail:appearance}));
export function writeTheme(theme,scale){
  try{localStorage.setItem('f22.theme',JSON.stringify(theme));}catch{}
  publishAppearance({theme,scale});
}
