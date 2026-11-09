// Reuse the one animated page shader behind transparent 3D canvases.
// A 2D copy adds no WebGL contexts and never sits over the model's pixels.
const backdrops=new WeakMap();
export function mountGlyphBackdrop(stage){
  let existing=backdrops.get(stage);
  if(existing){stage.prepend(existing.canvas);existing.draw();return existing;}
  const canvas=document.createElement('canvas');canvas.className='render-glyphs';canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:false});let disposed=false,theme='',base='#08090c';
  const draw=()=>{
    if(disposed||!ctx||!stage.isConnected)return;
    const r=stage.getBoundingClientRect();if(r.width<=0||r.height<=0)return;
    const dpr=Math.min(devicePixelRatio||1,1.25),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const next=document.documentElement.dataset.theme||'dark';if(next!==theme){theme=next;base=getComputedStyle(stage).getPropertyValue('--bg').trim()||'#08090c';}
    ctx.globalAlpha=1;ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
    const source=document.querySelector('.ambient-glyphs');if(!source||source.hidden||!source.width||!source.height)return;
    const left=Math.max(0,r.left),top=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
    if(right<=left||bottom<=top)return;
    const sx=source.width/innerWidth,sy=source.height/innerHeight;
    ctx.globalAlpha=theme==='dark'?.8:.22;
    ctx.drawImage(source,left*sx,top*sy,(right-left)*sx,(bottom-top)*sy,(left-r.left)*dpr,(top-r.top)*dpr,(right-left)*dpr,(bottom-top)*dpr);
    ctx.globalAlpha=1;
  };
  const observer=new ResizeObserver(draw);observer.observe(stage);
  addEventListener('f22:glyph-frame',draw);addEventListener('f22:appearance',draw);addEventListener('resize',draw);addEventListener('scroll',draw,{capture:true,passive:true});
  const dispose=()=>{if(disposed)return;disposed=true;observer.disconnect();removeEventListener('f22:glyph-frame',draw);removeEventListener('f22:appearance',draw);removeEventListener('resize',draw);removeEventListener('scroll',draw,true);canvas.remove();backdrops.delete(stage);};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  addEventListener('pageshow',event=>{if(event.persisted)draw();});
  existing={canvas,draw,dispose};backdrops.set(stage,existing);draw();return existing;
}
