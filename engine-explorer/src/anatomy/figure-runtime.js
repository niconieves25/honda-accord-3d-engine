import { TURN, TURN_CSS } from './vendor/turn.mjs';
import { ISO_CSS } from './vendor/iso-kit.mjs';
import { figureValues } from './motion.mjs';
export const FIGURE_CSS=ISO_CSS+'\n'+TURN_CSS+'\n.iso-live [data-name*="annulus"] .iso-edge{opacity:.16}.iso-stage{touch-action:pan-y}.iso-svg{width:100%;height:100%;display:block}';
export function mountFigure(stage,figure){
 if(!figure?.data)throw new Error('No Anatomy scene supplied');
 stage.classList.add('iso','iso-stage','iso-turn');
 stage.innerHTML=figure.markup;
 const controller=TURN.mount(stage,figure.data);
 let state={angle:0,phase:0};
 return {update(next={}){state={...state,...next};return controller.set(figureValues(figure.kind,state));},destroy(){controller.destroy();stage.innerHTML='';},parts:figure.parts,kind:figure.kind};
}
