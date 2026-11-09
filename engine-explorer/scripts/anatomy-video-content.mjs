/** Localized storyboard for the PBR export page and its matching WebVTT. */
export const VIDEO = {width:720,height:540,fps:24,seconds:12,top:76,bottom:156};
export const stationary = e => e.motion?.type === 'fixed';
export function storyboard(e,language='es'){
  const english=language==='en';
  const motion=stationary(e)
    ? `${e.motion?.description || (english?'This component remains stationary during operation.':'Esta pieza permanece fija durante el funcionamiento.')} ${english?'The rotation shown is the camera moving.':'El giro mostrado es de la cámara.'}`
    : e.motion?.description;
  return [
    {title:english?'What it does':'Qué hace',body:e.function || ''},
    {title:english?'How it works':'Cómo trabaja',body:e.steps?.[1] || e.steps?.[0] || e.function || ''},
    {title:stationary(e)?(english?'Stationary part · inspection':'Pieza fija · inspección'):(english?'How it moves':'Cómo se mueve'),body:motion || e.steps?.at(-1) || e.function || ''},
  ];
}
const timestamp = seconds => {
  const ms=Math.round(seconds*1000);
  return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
};
export function captionsVtt(entry,seconds=VIDEO.seconds,language='es'){
  return `WEBVTT\n\n${storyboard(entry,language).map((s,i)=>`${i+1}\n${timestamp(i*seconds/3)} --> ${timestamp((i+1)*seconds/3)}\n${entry.label}\n${s.title}: ${s.body}\n`).join('\n')}`;
}
export function frameState(entry,frame,frameCount=VIDEO.fps*VIDEO.seconds){
  const progress=frame/frameCount;
  return {progress,phase:stationary(entry)?0:progress,angle:stationary(entry)?32*Math.sin(progress*Math.PI*2):0};
}
export function palette(theme='light'){
  return theme==='dark'
    ? {bg:'#252a31',foreground:'#ecf0f1',secondary:'#b5c1c6',accent:'#e2ba72',line:'#3b484e'}
    : {bg:'#f4f4f2',foreground:'#182126',secondary:'#546169',accent:'#705022',line:'#c6d0cc'};
}
function wrap(ctx,text,width,maxLines=3){
  const lines=[];
  for(const word of String(text).replace(/\s+/g,' ').trim().split(' ')){
    if(!lines.length || ctx.measureText(`${lines.at(-1)} ${word}`).width>width)lines.push(word);
    else lines[lines.length-1]+=` ${word}`;
  }
  if(lines.length>maxLines){
    lines.length=maxLines;
    let last=lines.at(-1);
    while(ctx.measureText(last+'…').width>width)last=last.slice(0,-1);
    lines[maxLines-1]=last.replace(/[.,;:]$/,'')+'…';
  }
  return lines;
}
/** Called after drawing the model canvas; text stays above native video controls. */
export function drawCaptions(ctx,entry,progress,{theme='light',width=720,height=540,top=76,bottom=156,language='es'}={}){
  const p=palette(theme),u=width/720,story=storyboard(entry,language)[Math.min(2,Math.floor(progress*3))],english=language==='en';
  ctx.fillStyle=p.bg;ctx.fillRect(0,0,width,top);ctx.fillRect(0,height-bottom,width,bottom);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.font=`600 ${23*u}px Arial, sans-serif`;ctx.fillStyle=p.foreground;
  wrap(ctx,entry.label,width-56*u,2).forEach((line,i)=>ctx.fillText(line,28*u,(34+i*26)*u));
  ctx.font=`600 ${11*u}px Arial, sans-serif`;ctx.fillStyle=p.accent;
  ctx.fillText(stationary(entry)?(english?'INSPECTION · COMPONENT REMAINS STATIONARY':'INSPECCIÓN · LA PIEZA PERMANECE FIJA'):(english?'SLOW-MOTION DEMONSTRATION':'DEMOSTRACIÓN A CÁMARA LENTA'),28*u,68*u);
  ctx.fillStyle=p.line;ctx.fillRect(20*u,height-bottom,width-40*u,1);
  ctx.font=`600 ${17*u}px Arial, sans-serif`;ctx.fillStyle=p.accent;
  ctx.fillText(story.title,28*u,height-bottom+27*u);
  ctx.font=`400 ${18*u}px Arial, sans-serif`;ctx.fillStyle=p.foreground;
  wrap(ctx,story.body,width-56*u,3).forEach((line,i)=>ctx.fillText(line,28*u,height-bottom+(53+i*22)*u));
  ctx.font=`400 ${10*u}px Arial, sans-serif`;ctx.fillStyle=p.secondary;
  ctx.fillText(english?'Honda F22A6 · 1993 EX 5MT · educational geometry based on references':'Honda F22A6 · 1993 EX 5MT · geometría didáctica basada en referencias',28*u,height-12*u);
  ctx.fillStyle=p.accent;ctx.fillRect(0,height-3,width*progress,3);
}
