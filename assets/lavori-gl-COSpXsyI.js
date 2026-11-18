var e=`attribute vec2 aPos; varying vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }`;function t(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(`shader: `+e.getShaderInfoLog(r));return r}function n(e,n,r){let i=e.createProgram();if(e.attachShader(i,t(e,e.VERTEX_SHADER,n)),e.attachShader(i,t(e,e.FRAGMENT_SHADER,r)),e.bindAttribLocation(i,0,`aPos`),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw Error(`programma: `+e.getProgramInfoLog(i));let a={},o=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let t=0;t<o;t++){let n=e.getActiveUniform(i,t);a[n.name]=e.getUniformLocation(i,n.name)}return{p:i,u:a}}function r(t,{onPerso:r}={}){let i={alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:`high-performance`},a=null;try{a=t.getContext(`webgl2`,i)??t.getContext(`webgl`,i)}catch{a=null}if(!a)return null;let o=a,s=o.getExtension(`WEBGL_debug_renderer_info`),c=/swiftshader|llvmpipe|software/i.test(String(s?o.getParameter(s.UNMASKED_RENDERER_WEBGL):``)),l=!1;t.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),l=!0,r?.()},!1);let u=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,u),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.disable(o.DEPTH_TEST),o.disable(o.BLEND);let d=n(o,e,`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTexA; uniform sampler2D uTexB; uniform sampler2D uBlurA; uniform sampler2D uBlurB;
uniform float uAspA; uniform float uAspB; uniform float uAspS;
uniform float uContA; uniform float uContB;
uniform float uProg; uniform float uModo; uniform float uTempo; uniform float uGrana; uniform float uSeme;
uniform vec2 uOrig;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }

vec2 copri(vec2 uv, float at){ vec2 s = at > uAspS ? vec2(uAspS/at, 1.0) : vec2(1.0, at/uAspS); return (uv-0.5)*s+0.5; }
vec2 contieni(vec2 uv, float at){ vec2 s = at > uAspS ? vec2(1.0, at/uAspS) : vec2(uAspS/at, 1.0); return (uv-0.5)*s+0.5; }
vec3 campiona(sampler2D t, vec2 uv, vec2 ca){
  uv.y = 1.0-uv.y;
  return vec3(texture2D(t, uv+ca).r, texture2D(t, uv).g, texture2D(t, uv-ca).b);
}
vec3 strato(sampler2D t, sampler2D b, float at, float cont, vec2 uv, vec2 ca){
  if (cont > 0.5) {
    vec2 u2 = contieni(uv, at);
    if (u2.x > 0.0 && u2.x < 1.0 && u2.y > 0.0 && u2.y < 1.0) return campiona(t, u2, ca);
    vec2 ub = copri(uv, at);
    return texture2D(b, ub).rgb * 0.34;
  }
  return campiona(t, copri(uv, at), ca);
}
void main(){
  vec2 uv = vUv;
  vec2 dir = uv - 0.5;
  float p = clamp(uProg, 0.0, 1.0);
  float onda = sin(p*3.14159);
  vec2 ca = dir * (0.0018 + 0.011*onda);
  vec3 col;
  if (uProg <= 0.0) {
    col = strato(uTexA, uBlurA, uAspA, uContA, uv, ca);
  } else if (uModo < 0.5) {
    vec3 a = strato(uTexA, uBlurA, uAspA, uContA, uv, ca);
    vec3 b = strato(uTexB, uBlurB, uAspB, uContB, uv, ca);
    float k = smoothstep(0.0, 1.0, p);
    col = mix(a, b, k) + vec3(1.0, 0.74, 0.42) * 0.16 * onda;
  } else {
    vec2 asp = vec2(uAspS, 1.0);
    float d = length((uv-uOrig)*asp) / length(max(uOrig, 1.0-uOrig)*asp);
    float n = fbm(uv*vec2(2.6*uAspS, 2.6) + uSeme);
    float fronte = d*0.70 + n*0.44;
    float t = p*1.50 - 0.20;
    float h = fronte - t;
    float bordo = 0.055, carbone = 0.17;
    float vicino = 1.0 - smoothstep(0.0, carbone+0.12, h);
    vec2 trem = vec2(noise(uv*38.0 + uTempo*2.7) - 0.5, noise(uv*38.0 + 7.3 + uTempo*2.7) - 0.5) * 0.022 * vicino;
    vec3 a = strato(uTexA, uBlurA, uAspA, uContA, uv + trem, ca);
    vec3 b = strato(uTexB, uBlurB, uAspB, uContB, uv, ca);
    float inBuco = 1.0 - smoothstep(0.0, 0.008, h);
    float inBordo = smoothstep(0.0, 0.006, h) * (1.0 - smoothstep(bordo-0.012, bordo, h));
    float carb = smoothstep(bordo-0.004, bordo+0.012, h) * (1.0 - smoothstep(bordo, carbone, h));
    vec3 vecchio = a * (1.0 - 0.88*carb) * mix(vec3(1.0), vec3(1.0, 0.62, 0.36), carb);
    vec3 incand = mix(vec3(1.0, 0.96, 0.78), vec3(1.0, 0.40, 0.07), smoothstep(0.0, bordo, h)) * 1.55;
    vec3 nuovo = b + vec3(1.0, 0.58, 0.22) * exp(h/0.05) * 0.85;
    col = mix(vecchio, incand, inBordo);
    col = mix(col, nuovo, inBuco);
    col += vec3(1.0, 0.5, 0.14) * exp(-abs(h)/0.035) * 0.32;
  }
  // La grana del passaggio cresce e cala con l'onda: a inizio e fine il canvas non aggiunge niente a quella dello strato.
  float g = hash(gl_FragCoord.xy + fract(uTempo*0.731)*vec2(13.1, 7.7)) - 0.5;
  col += g * uGrana * onda;
  gl_FragColor = vec4(col, 1.0);
}`),f=n(o,e,`precision mediump float; varying vec2 vUv;
uniform sampler2D uTex; uniform vec2 uPasso; uniform float uFlip;
void main(){
  vec2 uv = vec2(vUv.x, mix(vUv.y, 1.0-vUv.y, uFlip));
  vec3 c = vec3(0.0);
  c += texture2D(uTex, uv + vec2(-1.0,-1.0)*uPasso).rgb; c += texture2D(uTex, uv + vec2(0.0,-1.0)*uPasso).rgb; c += texture2D(uTex, uv + vec2(1.0,-1.0)*uPasso).rgb;
  c += texture2D(uTex, uv + vec2(-1.0, 0.0)*uPasso).rgb; c += texture2D(uTex, uv).rgb;                        c += texture2D(uTex, uv + vec2(1.0, 0.0)*uPasso).rgb;
  c += texture2D(uTex, uv + vec2(-1.0, 1.0)*uPasso).rgb; c += texture2D(uTex, uv + vec2(0.0, 1.0)*uPasso).rgb; c += texture2D(uTex, uv + vec2(1.0, 1.0)*uPasso).rgb;
  gl_FragColor = vec4(c/9.0, 1.0);
}`);function p(e,t){let n=o.createTexture();return o.bindTexture(o.TEXTURE_2D,n),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),e&&o.texImage2D(o.TEXTURE_2D,0,o.RGB,e,t,0,o.RGB,o.UNSIGNED_BYTE,null),n}function m(e,t){let n=p(e,t),r=o.createFramebuffer();return o.bindFramebuffer(o.FRAMEBUFFER,r),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,n,0),o.bindFramebuffer(o.FRAMEBUFFER,null),{f:r,t:n,w:e,h:t}}let h=new Map,g=[{a:m(96,96),b:m(32,32),id:null,versione:-1},{a:m(96,96),b:m(32,32),id:null,versione:-1}],_=p(1,1);o.bindTexture(o.TEXTURE_2D,_),o.texImage2D(o.TEXTURE_2D,0,o.RGB,1,1,0,o.RGB,o.UNSIGNED_BYTE,new Uint8Array([11,11,12])),o.viewport(0,0,1,1);for(let e of[f,d])o.useProgram(e.p),o.drawArrays(o.TRIANGLES,0,3);let v={a:null,b:null,prog:0,modo:1,inizio:0,durata:720,origine:[.5,.5],seme:0,aspS:1,w:1,h:1,sporco:!0,grana:.1};function y(e,t,n){if(l)return;let r=h.get(e);if(r)h.delete(e);else{for(let e of h.keys()){if(h.size<5)break;e!==v.a&&e!==v.b&&(o.deleteTexture(h.get(e).t),h.delete(e))}r={t:p(0,0),asp:n,w:0,h:0,versione:0}}h.set(e,r),o.bindTexture(o.TEXTURE_2D,r.t);try{o.texImage2D(o.TEXTURE_2D,0,o.RGB,o.RGB,o.UNSIGNED_BYTE,t)}catch{return}let i=t;r.w=i.videoWidth||i.naturalWidth||i.width||1,r.h=i.videoHeight||i.naturalHeight||i.height||1,r.asp=n,r.versione++,v.sporco=!0}function b(e,n,r){let i=Math.max(1,Math.round(e*r)),a=Math.max(1,Math.round(n*r));(t.width!==i||t.height!==a)&&(t.width=i,t.height=a),v.w=i,v.h=a,v.aspS=i/a,v.sporco=!0}let x=e=>e.asp>1!=v.aspS>1;function S(e,t){let n=h.get(t);!n||e.id===t&&e.versione===n.versione||(e.id=t,e.versione=n.versione,o.useProgram(f.p),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,e.a.f),o.viewport(0,0,e.a.w,e.a.h),o.bindTexture(o.TEXTURE_2D,n.t),o.uniform1i(f.u.uTex,0),o.uniform2f(f.u.uPasso,1.6/Math.max(1,n.w),1.6/Math.max(1,n.h)),o.uniform1f(f.u.uFlip,1),o.drawArrays(o.TRIANGLES,0,3),o.bindFramebuffer(o.FRAMEBUFFER,e.b.f),o.viewport(0,0,e.b.w,e.b.h),o.bindTexture(o.TEXTURE_2D,e.a.t),o.uniform2f(f.u.uPasso,1/e.a.w,1/e.a.h),o.uniform1f(f.u.uFlip,0),o.drawArrays(o.TRIANGLES,0,3),o.bindFramebuffer(o.FRAMEBUFFER,null))}let C=null;function w(e,t,n={}){if(v.prog>0&&v.prog<1){if(v.prog<.45){v.b=t,v.sporco=!0;return}C={da:v.b??e,a:t,opzioni:n};return}v.a=e,v.b=t,v.prog=1e-4,v.modo=n.modo??1,v.durata=n.durata??720,v.origine=n.origine??[.5,.5],v.seme=Math.random()*100,v.inizio=0,v.sporco=!0}function T(e){if(l)return!1;let t=!1;if(v.prog>0){v.inizio||=e;let n=Math.min(1,(e-v.inizio)/v.durata);if(v.prog=n<=0?1e-4:1-(1-n)**1.7,n>=1){if(v.a=v.b,v.b=null,v.prog=0,v.inizio=0,C){let e=C;C=null,w(e.da,e.a,e.opzioni),t=!0}}else t=!0}else if(!v.sporco)return!1;v.sporco=!1;let n=v.a?h.get(v.a):void 0,r=v.b?h.get(v.b):void 0,i=n?x(n):!1,a=r?x(r):!1;i&&v.a&&S(g[0],v.a),a&&v.b&&v.prog>0&&S(g[1],v.b),o.useProgram(d.p),o.viewport(0,0,v.w,v.h);let s=d.u;return o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,n?n.t:_),o.uniform1i(s.uTexA,0),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,r?r.t:_),o.uniform1i(s.uTexB,1),o.activeTexture(o.TEXTURE2),o.bindTexture(o.TEXTURE_2D,i?g[0].b.t:_),o.uniform1i(s.uBlurA,2),o.activeTexture(o.TEXTURE3),o.bindTexture(o.TEXTURE_2D,a?g[1].b.t:_),o.uniform1i(s.uBlurB,3),o.uniform1f(s.uAspA,n?n.asp:1),o.uniform1f(s.uAspB,r?r.asp:1),o.uniform1f(s.uAspS,v.aspS),o.uniform1f(s.uContA,+!!i),o.uniform1f(s.uContB,+!!a),o.uniform1f(s.uProg,v.prog),o.uniform1f(s.uModo,v.modo),o.uniform1f(s.uTempo,e%1e5/1e3),o.uniform1f(s.uGrana,v.grana),o.uniform1f(s.uSeme,v.seme),o.uniform2f(s.uOrig,v.origine[0],v.origine[1]),o.drawArrays(o.TRIANGLES,0,3),t}return{get perso(){return l},software:c,get inTransizione(){return v.prog>0},ha:e=>h.has(e),carica:y,ridimensiona:b,transizione:w,disegna:T}}export{r as creaScena};