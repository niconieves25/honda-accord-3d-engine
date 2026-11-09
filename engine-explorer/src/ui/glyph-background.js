// Adapted from the user-provided GlyphBackground shader for this vanilla JS app.
const VERTEX=`
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const FRAGMENT=`
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec3 accent;
uniform vec4 waves[24];
uniform vec4 trail[12];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

float outline(float kind, float angle, float phase) {
  if (kind < 0.5) return 1.0;
  if (kind < 1.5) {
    float s = sin(angle);
    float c = cos(angle);
    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;
  }
  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  float ring = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float angle = atan(-v.y, v.x);
    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);
    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / 10.0 : d / 30.0;
    ring = max(ring, exp(-k * k) * a.w);
  }

  float hover = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float seed = hash(index);
  float epoch = floor(time * 0.08 * (0.4 + seed) + seed * 97.0);
  float character = floor(hash(index + epoch * 0.137) * count);
  vec2 local = fract(pixel / cell);
  float ink = pow(texture2D(atlas, vec2((character + local.x) / count, local.y)).a, 1.7);

  float grey = ink * clamp(rest + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.6 + 0.4 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.72;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + accent * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;
const CHARACTERS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export function mountGlyphBackground(){
  const canvas=document.createElement('canvas');canvas.className='ambient-glyphs';canvas.setAttribute('aria-hidden','true');canvas.dataset.slot='glyph-background';document.body.prepend(canvas);
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  if(!gl){canvas.remove();return ()=>{};}
  const shaders=[];
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);shaders.push(shader);return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null;};
  const vertex=compile(gl.VERTEX_SHADER,VERTEX),fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT),program=gl.createProgram();
  if(!vertex||!fragment){shaders.forEach(s=>gl.deleteShader(s));canvas.remove();return ()=>{};}
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);canvas.remove();return ()=>{};}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const U=Object.fromEntries(['atlas','size','cell','dpr','count','time','rest','haze','hoverInk','activity','drift','color','accent','waves','trail'].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.uniform1i(U.atlas,0);gl.uniform1f(U.count,CHARACTERS.length);gl.uniform1f(U.rest,.055);gl.uniform1f(U.haze,.2);gl.uniform1f(U.hoverInk,.4);
  gl.uniform3f(U.color,.6,.26,.3);gl.uniform3f(U.accent,1,.12,.22);
  const media=matchMedia('(prefers-reduced-motion: reduce)'),waves=[],trail=[],waveData=new Float32Array(96),trailData=new Float32Array(48);
  let width=1,height=1,dpr=1,cell=[7,13],clock=0,lastTime=0,lastDraw=0,raf=0,disposed=false,contextLost=false,reduce=false,manualReduced=false,energy=0,energyAt=0;
  const updatePreference=event=>{if(typeof event?.detail?.reduceMotion==='boolean')manualReduced=event.detail.reduceMotion;else if(!event||event.type==='storage'){try{manualReduced=JSON.parse(localStorage.getItem('f22.reduceMotion'))===true;}catch{}}reduce=media.matches||manualReduced;canvas.dataset.motion=reduce?'static':'animated';if(reduce){waves.length=0;trail.length=0;cancelAnimationFrame(raf);raf=0;draw();}else start();};
  const resize=()=>{width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    const fontSize=11*dpr,atlas=document.createElement('canvas'),measure=document.createElement('canvas').getContext('2d');measure.font=`${fontSize}px ui-monospace,Menlo,monospace`;cell=[Math.max(1,Math.ceil(measure.measureText('0').width)),Math.ceil(fontSize*1.35)];
    atlas.width=cell[0]*CHARACTERS.length;atlas.height=cell[1];const ctx=atlas.getContext('2d');ctx.font=measure.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';[...CHARACTERS].forEach((c,i)=>ctx.fillText(c,(i+.5)*cell[0],cell[1]/2));
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);draw();};
  function draw(){if(disposed||contextLost)return;gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);waveData.fill(0);trailData.fill(0);
    for(let i=waves.length-1;i>=0;i--)if(clock-waves[i].t>4000)waves.splice(i,1);
    waves.slice(-12).forEach((w,i)=>{const age=(clock-w.t)/1000;if(age<=0)return;const fade=Math.min(1,age/.05)*Math.exp(-Math.max(0,age-.4)/1.3)*Math.min(1,(4-age)/.5);waveData.set([w.x,w.y,560*age/(1+.66*age),fade*w.strength,2,.12+.5*Math.min(1,age/2.2),w.phase,age*3],i*8);});
    trail.slice(-12).forEach((p,i)=>{const age=(clock-p.t)/700;if(age>=0&&age<1)trailData.set([p.x,p.y,40+25*age,.3*(1-age)**2],i*4);});
    gl.uniform2f(U.size,canvas.width,canvas.height);gl.uniform2f(U.cell,...cell);gl.uniform1f(U.dpr,dpr);gl.uniform1f(U.time,clock/1000);gl.uniform1f(U.activity,energy*Math.exp(-Math.max(0,clock-energyAt)/900));gl.uniform2f(U.drift,-30*clock/1000,12*clock/1000);gl.uniform4fv(U.waves,waveData);gl.uniform4fv(U.trail,trailData);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);window.dispatchEvent(new Event('f22:glyph-frame'));
  }
  const tick=now=>{raf=0;if(disposed||contextLost||reduce||document.hidden)return;clock+=Math.min(now-lastTime,64);lastTime=now;if(now-lastDraw>=1000/24){draw();lastDraw=now;}raf=requestAnimationFrame(tick);};
  function start(){if(raf||disposed||contextLost||reduce||document.hidden)return;lastTime=performance.now();raf=requestAnimationFrame(tick);}
  const move=e=>{if(reduce||document.hidden||e.pointerType==='touch')return;const last=trail.at(-1);if(last&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<18)return;energy=Math.min(1,energy*Math.exp(-(clock-energyAt)/900)+.12);energyAt=clock;trail.push({x:e.clientX,y:e.clientY,t:clock});if(trail.length>12)trail.shift();};
  const down=e=>{if(reduce||document.hidden)return;const phase=Math.random()*Math.PI*2;waves.push({x:e.clientX,y:e.clientY,t:clock,phase,strength:1},{x:e.clientX,y:e.clientY,t:clock+300,phase,strength:.55});if(waves.length>12)waves.splice(0,waves.length-12);};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();};
  const lost=e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;canvas.hidden=true;};
  canvas.addEventListener('webglcontextlost',lost);addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});addEventListener('pointerdown',down,{passive:true});addEventListener('f22:appearance',updatePreference);addEventListener('storage',updatePreference);media.addEventListener('change',updatePreference);document.addEventListener('visibilitychange',visibility);
  resize();updatePreference();
  const destroy=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move);removeEventListener('pointerdown',down);removeEventListener('f22:appearance',updatePreference);removeEventListener('storage',updatePreference);media.removeEventListener('change',updatePreference);document.removeEventListener('visibilitychange',visibility);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));canvas.remove();};
  addEventListener('pagehide',event=>{if(!event.persisted)destroy();else{cancelAnimationFrame(raf);raf=0;}});
  addEventListener('pageshow',event=>{if(event.persisted){resize();updatePreference();}});
  return destroy;
}
