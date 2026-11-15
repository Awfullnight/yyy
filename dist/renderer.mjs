const V={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  unit:a=>{const m=Math.hypot(...a)||1;return a.map(v=>v/m)},
};
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const color=(hex,k)=>{let h=hex.replace('#','');if(h.length!==6)return hex;const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));return `rgb(${c.map(v=>clamp(Math.round(v*k),0,255)).join(',')})`};
const STAR_SEED=Array.from({length:330},(_,i)=>{const s=(n)=>{const t=Math.sin(i*12.9898+n*79.233)*43758.5453;return t-Math.floor(t)};return [(s(1)-.5)*110,(s(2)-.5)*65,(s(3)-.5)*100,s(4)]});
const P0=[-6.8,-.65,0],P1=[-2.55,4.5,-2.4],P2=[2.9,4.25,2.0],P3=[6.8,1.0,0];
function path(t){const s=1-t;return [0,1,2].map(i=>s*s*s*P0[i]+3*s*s*t*P1[i]+3*s*t*t*P2[i]+t*t*t*P3[i])}
function tangent(t){const s=1-t;return V.unit([0,1,2].map(i=>3*s*s*(P1[i]-P0[i])+6*s*t*(P2[i]-P1[i])+3*t*t*(P3[i]-P2[i])))}

export class SpaceRenderer{
  constructor(canvas,engineCanvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.engineCanvas=engineCanvas;this.ectx=engineCanvas.getContext('2d');
    this.mode='build';this.theta=.40;this.elevation=.27;this.radius=13.8;this.time=0;this.target=[0,0,0];
    this.progress=0;this.condition=100;this.heat=20;this.engineHeat=20;this.fuel=0;this.critical=null;
    this.equipped={};this.mission='moon';this.language='ru';this.flying=false;this.faulty=false;this.icing=false;this.overheat=false;
    this.drag=null;this.setupInput();this.resize();
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
  }
  setupInput(){
    const c=this.canvas;
    c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);this.drag={x:e.clientX,y:e.clientY};});
    c.addEventListener('pointermove',e=>{if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;this.theta=clamp(this.theta-dx*.008,-6,6);this.elevation=clamp(this.elevation+dy*.006,-.20,1.35);this.drag={x:e.clientX,y:e.clientY};});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(event,()=>this.drag=null);
    c.addEventListener('wheel',e=>{e.preventDefault();this.radius=clamp(this.radius*(e.deltaY>0?1.08:.92),this.mode==='flight'?14:7,this.mode==='flight'?44:24)},{passive:false});
  }
  resetCamera(){this.radius=this.mode==='flight'?22:13.8;this.theta=this.mode==='flight'?.08:.4;this.elevation=this.mode==='flight'?.40:.27;}
  resize(){const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);this.w=Math.max(1,rect.width);this.h=Math.max(1,rect.height);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  configure({mode,equipped,mission,progress,condition,heat,engineHeat,fuel,critical,faulty,icing,overheat,language}){
    if(mode&&mode!==this.mode){this.mode=mode;this.resetCamera();}
    Object.assign(this,{equipped:equipped||this.equipped,mission:mission||this.mission,progress:progress??this.progress,
      condition:condition??this.condition,heat:heat??this.heat,engineHeat:engineHeat??this.engineHeat,fuel:fuel??this.fuel,
      critical:critical??null,faulty:!!faulty,icing:!!icing,overheat:!!overheat,language:language||this.language});
  }
  update(time){this.time=time/1000;this.render();this.renderEngineCam();}
  camera(){
    const r=this.radius,ca=Math.cos(this.elevation),sa=Math.sin(this.elevation);
    const pos=[Math.sin(this.theta)*ca*r,sa*r,Math.cos(this.theta)*ca*r];
    const forward=V.unit(V.mul(pos,-1)),right=V.unit(V.cross(forward,[0,1,0])),up=V.unit(V.cross(right,forward));
    return {pos,forward,right,up,f:this.h*(this.mode==='flight'?1.50:1.32)};
  }
  project(p){const c=this.cam;const v=V.sub(p,c.pos),depth=V.dot(v,c.forward);if(depth<.25)return null;const k=c.f/depth;return {x:this.w/2+V.dot(v,c.right)*k,y:this.h/2-V.dot(v,c.up)*k,depth,scale:k};}
  render(){
    const ctx=this.ctx,w=this.w,h=this.h;if(w<2||h<2)return;
    ctx.clearRect(0,0,w,h);
    const bg=ctx.createRadialGradient(w*.52,h*.44,10,w*.52,h*.5,w*.78);bg.addColorStop(0,'#132237');bg.addColorStop(.4,'#0c1827');bg.addColorStop(1,'#050b13');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    this.cam=this.camera();this.drawStars();
    if(this.mode==='flight')this.drawFlight();else this.drawHangar();
    this.drawVignette();
  }
  drawVignette(){const ctx=this.ctx,g=ctx.createRadialGradient(this.w/2,this.h/2,this.h*.2,this.w/2,this.h/2,this.w*.75);g.addColorStop(0,'#0000');g.addColorStop(1,'#0008');ctx.fillStyle=g;ctx.fillRect(0,0,this.w,this.h);}
  drawStars(){const ctx=this.ctx;for(const star of STAR_SEED){const p=this.project(star);if(!p||p.x<0||p.y<0||p.x>this.w||p.y>this.h)continue;ctx.fillStyle=`rgba(185,215,249,${.12+star[3]*.7})`;const r=star[3]>.93?1.3:.55;ctx.fillRect(p.x,p.y,r,r);}}
  line3(points,stroke,width=1,dashed=[],glow=0){const ctx=this.ctx;ctx.save();ctx.beginPath();let begun=false;for(const v of points){const p=this.project(v);if(!p)continue;if(!begun){ctx.moveTo(p.x,p.y);begun=true}else ctx.lineTo(p.x,p.y)}ctx.setLineDash(dashed);ctx.lineWidth=width;ctx.strokeStyle=stroke;if(glow){ctx.shadowBlur=glow;ctx.shadowColor=stroke}ctx.stroke();ctx.restore();}
  drawHangar(){
    const ctx=this.ctx;
    // A perspective docking grid with concentric fabrication rings.
    for(let x=-10;x<=10;x+=1){this.line3([[x,-3.0,-10],[x,-3.0,10]],'#2f516344',.8)}
    for(let z=-10;z<=10;z+=1){this.line3([[-10,-3,z],[10,-3,z]],'#2f516344',.8)}
    for(const r of [1.8,2.35,2.9]){
      this.line3(Array.from({length:65},(_,i)=>[Math.cos(i/64*Math.PI*2)*r,-2.97,Math.sin(i/64*Math.PI*2)*r]),r===1.8?'#d8fa7490':'#4b94a058',r===1.8?1.7:1);
    }
    this.line3([[-.1,-3.03,0],[.1,-3.03,0]],'#d8fa74');
    const has=this.equipped&&Object.values(this.equipped).some(Boolean);
    if(has){
      this.drawRocket([0,0,0],[0,1,0],1.0,true);
      const p=this.project([0,3.45,0]);if(p){ctx.font='10px DM Mono,monospace';ctx.fillStyle='#94acc0';ctx.textAlign='center';ctx.fillText('OF — ROCKET ASSEMBLY',p.x,p.y-13);}
    }else{
      this.drawGhostRocket();
    }
    this.drawReticle([0,0,0]);
  }
  drawReticle(world){const p=this.project(world);if(!p)return;const ctx=this.ctx;ctx.strokeStyle='#9aca9b66';ctx.lineWidth=1;const x=p.x,y=p.y;ctx.beginPath();ctx.moveTo(x-120,y-85);ctx.lineTo(x-120,y-63);ctx.moveTo(x-120,y-85);ctx.lineTo(x-98,y-85);ctx.moveTo(x+120,y+85);ctx.lineTo(x+120,y+63);ctx.moveTo(x+120,y+85);ctx.lineTo(x+98,y+85);ctx.stroke();}
  drawGhostRocket(){
    const ctx=this.ctx;
    const pts=[[0,3,0],[-.55,1.65,0],[-.55,-2.4,0],[.55,-2.4,0],[.55,1.65,0],[0,3,0]].map(p=>this.project(p));
    if(pts.some(p=>!p))return;ctx.save();ctx.strokeStyle='#6a8a9c77';ctx.lineWidth=1.4;ctx.setLineDash([5,7]);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);const center=this.project([0,0,0]);ctx.fillStyle='#a4b9c4';ctx.font='bold 12px DM Mono,monospace';ctx.textAlign='center';ctx.fillText(this.language==='en'?'+ SELECT PARTS':'+ ВЫБЕРИ ДЕТАЛИ',center.x,center.y);ctx.restore();
  }
  drawFlight(){
    const ctx=this.ctx,moon=this.mission==='moon',p=this.progress;
    // The two planets are rendered as shaded spheres in a rotated 3D coordinate system.
    this.drawOrbitRing(P0,1.8,'#5478a337');this.drawOrbitRing(P3,moon?1.3:1.65,'#bd734f35');
    this.line3(Array.from({length:90},(_,i)=>path(i/89)),'#6b89a166',1.2,[5,8]);
    if(p>0)this.line3(Array.from({length:Math.max(3,Math.round(p*110))},(_,i)=>path(p*i/(Math.max(3,Math.round(p*110))-1))),'#d8fa74',2.3,[],10);
    this.drawPlanet(P0,1.45,'earth',this.language==='en'?'EARTH':'ЗЕМЛЯ');this.drawPlanet(P3,moon?.93:1.30,moon?'moon':'mars',this.language==='en'?(moon?'MOON':'MARS'):(moon?'ЛУНА':'МАРС'));
    const pos=path(clamp(p,.004,.99));const axis=tangent(clamp(p,.004,.99));
    this.drawRocket(pos,axis,.31,false);
    const mark=this.project(pos);if(mark){ctx.save();ctx.strokeStyle='#c9ff91aa';ctx.beginPath();ctx.arc(mark.x,mark.y,25+Math.sin(this.time*3)*2,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#d8fa74';ctx.beginPath();ctx.moveTo(mark.x-36,mark.y);ctx.lineTo(mark.x-29,mark.y);ctx.moveTo(mark.x+29,mark.y);ctx.lineTo(mark.x+36,mark.y);ctx.stroke();ctx.restore();}
    // Painted waypoint markers reinforce the complete Earth-to-destination route.
    for(const t of [.20,.42,.64,.82]){const pp=this.project(path(t));if(!pp)continue;ctx.beginPath();ctx.arc(pp.x,pp.y,3,0,Math.PI*2);ctx.fillStyle=t<p?'#d8fa74':'#677e95';ctx.fill();}
  }
  drawOrbitRing(origin,r,col){this.line3(Array.from({length:65},(_,i)=>[origin[0]+Math.cos(i/64*Math.PI*2)*r,origin[1],origin[2]+Math.sin(i/64*Math.PI*2)*r]),col,1,[3,5]);}
  drawPlanet(world,r,type,label){
    const p=this.project(world);if(!p)return;const ctx=this.ctx,rad=r*p.scale;if(rad<3)return;
    ctx.save();ctx.shadowBlur=rad*.55;ctx.shadowColor=type==='earth'?'#2876b744':type==='mars'?'#eb704133':'#b0c0cd23';ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.clip();
    const grad=ctx.createRadialGradient(p.x-rad*.43,p.y-rad*.46,rad*.08,p.x+rad*.34,p.y+rad*.29,rad*1.35);
    if(type==='earth'){grad.addColorStop(0,'#92cdf5');grad.addColorStop(.33,'#286f9e');grad.addColorStop(.68,'#20466f');grad.addColorStop(1,'#07192c');}
    else if(type==='moon'){grad.addColorStop(0,'#f0f1e4');grad.addColorStop(.34,'#aeb8bb');grad.addColorStop(.73,'#77858e');grad.addColorStop(1,'#2d3a48');}
    else{grad.addColorStop(0,'#f9bd91');grad.addColorStop(.30,'#ce7855');grad.addColorStop(.70,'#a14632');grad.addColorStop(1,'#4a1d25');}
    ctx.fillStyle=grad;ctx.fillRect(p.x-rad,p.y-rad,rad*2,rad*2);
    if(type==='earth'){
      for(let i=0;i<12;i++){
        const x=p.x+Math.sin(i*3.6+1)*rad*.67,y=p.y+Math.cos(i*2.4)*rad*.61;
        ctx.fillStyle=i%2?'#2d8b70a8':'#467b57bb';ctx.beginPath();ctx.ellipse(x,y,rad*(.12+(i%4)*.055),rad*(.055+(i%3)*.04),i*.67,0,Math.PI*2);ctx.fill();
      }
      for(let i=0;i<9;i++){ctx.strokeStyle='#cceef426';ctx.lineWidth=Math.max(1,rad*.025);ctx.beginPath();const y=p.y+rad*((i-4)/5);ctx.ellipse(p.x-rad*.15,y,rad*.92,rad*.13,i*.23,0,Math.PI*2);ctx.stroke();}
    }else{
      for(let i=0;i<19;i++){const a=i*2.4,rr=(.12+(i%5)*.14)*rad,x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr*.83;ctx.fillStyle=type==='mars'?'#772e2b59':'#424c5a53';ctx.beginPath();ctx.ellipse(x,y,rad*(.025+i%4*.014),rad*(.02+i%3*.015),a,0,Math.PI*2);ctx.fill();}
      if(type==='mars'){ctx.strokeStyle='#e4aa7a50';ctx.lineWidth=rad*.075;ctx.beginPath();ctx.ellipse(p.x-rad*.1,p.y+rad*.2,rad*.65,rad*.09,-.3,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();ctx.save();ctx.textAlign='center';ctx.font='700 11px DM Mono,monospace';ctx.fillStyle='#c6d7e5';ctx.fillText(label,p.x,p.y+rad+22);ctx.font='9px DM Mono,monospace';ctx.fillStyle='#8199ae';ctx.fillText(type==='earth'?(this.language==='en'?'LAUNCH':'СТАРТ'):type==='moon'?(this.language==='en'?'384,400 KM':'384 400 КМ'):(this.language==='en'?'225M KM':'225 МЛН КМ'),p.x,p.y+rad+36);ctx.restore();
  }
  drawRocket(center,axis,scale,build){
    const ctx=this.ctx,flame=this.mode==='flight'&&this.progress<.91;
    const forward=V.unit(axis),ref=Math.abs(V.dot(forward,[0,0,1]))>.96?[1,0,0]:[0,0,1];
    const right=V.unit(V.cross(ref,forward)),other=V.unit(V.cross(forward,right));
    const tr=p=>V.add(center,V.mul(V.add(V.add(V.mul(right,p[0]),V.mul(forward,p[1])),V.mul(other,p[2])),scale));
    const pieces=[];
    const seg=(a,b,ra,rb,hex,n=12)=>{
      for(let i=0;i<n;i++){const q=i/n*Math.PI*2,q2=(i+1)/n*Math.PI*2;
        const v0=tr([Math.cos(q)*ra,a,Math.sin(q)*ra]),v1=tr([Math.cos(q2)*ra,a,Math.sin(q2)*ra]),
        v2=tr([Math.cos(q2)*rb,b,Math.sin(q2)*rb]),v3=tr([Math.cos(q)*rb,b,Math.sin(q)*rb]);
        const normal=V.unit([Math.cos((q+q2)/2),.20,Math.sin((q+q2)/2)]);
        const light=.66+.32*(Math.cos((q+q2)/2-.6)*.5+.5);
        pieces.push({points:[v0,v1,v2,v3],hex:color(hex,light),normal});
      }
    };
    const equipped=this.equipped||{},has=slot=>!!equipped[slot];
    const shell=this.overheat||this.heat>800?'#ff7566':this.icing?'#96dff7':this.condition<70?'#aeaba8':'#cbd8de';
    if(has('engine')||!build){seg(-2.62,-2.1,.34,.48,this.faulty?'#bc5849':'#657e8f');seg(-2.85,-2.64,.22,.34,'#4d6379');}
    if(has('tank')||!build){seg(-2.1,.95,.53,.53,shell);seg(-1.65,-1.52,.54,.54,'#526b75');seg(.74,.85,.54,.54,'#7696a1');}
    if(has('hull')||!build){seg(.95,1.90,.54,.54,'#e6e6db');seg(1.85,1.94,.55,.55,'#aac5c9');}
    if(has('nav')||!build){seg(1.94,2.92,.54,.03,'#eef5ea');}
    if(has('shield')||!build){seg(-2.18,-2.04,.54,.57,this.overheat?'#ed6d50':'#668c91');}
    if(has('legs')||!build){
      for(let i=0;i<4;i++){const a=i*Math.PI/2;const radial=[Math.cos(a),0,Math.sin(a)];
        const s=tr([radial[0]*.39,-1.98,radial[2]*.39]),e=tr([radial[0]*1.05,-2.86,radial[2]*1.05]);
        pieces.push({line:[s,e],hex:'#a3b6a4',width:2.5});
        pieces.push({line:[e,tr([radial[0]*1.27,-2.91,radial[2]*1.27])],hex:'#a3b6a4',width:3.5});
      }
    }
    // Stabilizer fins are independent mesh triangles, attached to the engine section.
    if(has('hull')||!build){for(let i=0;i<4;i++){const a=i*Math.PI/2;pieces.push({points:[tr([Math.cos(a)*.47,-2.15,Math.sin(a)*.47]),tr([Math.cos(a)*1.1,-2.75,Math.sin(a)*1.1]),tr([Math.cos(a)*.45,-1.20,Math.sin(a)*.45])],hex:'#acced1'});}}
    // Draw far faces first for painter-order 3D rasterization.
    pieces.sort((a,b)=>{const centerOf=x=>x.points?x.points.reduce((p,v)=>V.add(p,v),[0,0,0]).map(v=>v/x.points.length):x.line[0];return V.dot(V.sub(centerOf(b),this.cam.pos),this.cam.forward)-V.dot(V.sub(centerOf(a),this.cam.pos),this.cam.forward)});
    for(const face of pieces){ctx.save();ctx.strokeStyle='#16283550';ctx.lineWidth=.7;ctx.fillStyle=face.hex;
      if(face.points){const pts=face.points.map(v=>this.project(v));if(pts.some(v=>!v)){ctx.restore();continue;}ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();}
      else{const ps=face.line.map(v=>this.project(v));if(ps.every(Boolean)){ctx.beginPath();ctx.strokeStyle=face.hex;ctx.lineWidth=face.width*(this.mode==='flight'?.65:1);ctx.moveTo(ps[0].x,ps[0].y);ctx.lineTo(ps[1].x,ps[1].y);ctx.stroke();}}
      ctx.restore();}
    if(flame&&!this.faulty){
      const nozzle=this.project(tr([0,-2.85,0])),end=this.project(tr([0,-4.0-Math.sin(this.time*16)*.36,0]));
      if(nozzle&&end){ctx.save();const g=ctx.createLinearGradient(nozzle.x,nozzle.y,end.x,end.y);g.addColorStop(0,'#ecffb9');g.addColorStop(.35,this.overheat?'#ff7a32':'#74d6ff');g.addColorStop(1,'#69c9ff00');ctx.strokeStyle=g;ctx.lineWidth=18*scale;ctx.lineCap='round';ctx.shadowBlur=18;ctx.shadowColor='#86c9ff';ctx.beginPath();ctx.moveTo(nozzle.x,nozzle.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.restore();}
    }
    if(this.overheat||this.icing){const top=this.project(tr([0,1.0,0]));if(top){ctx.save();ctx.strokeStyle=this.overheat?'#ff846c':'#9fe7ff';ctx.shadowBlur=20;ctx.shadowColor=ctx.strokeStyle;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(top.x,top.y,20*scale+Math.sin(this.time*5)*3,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  }
  renderEngineCam(){
    const ctx=this.ectx,c=this.engineCanvas,w=c.width,h=c.height,t=this.time;
    ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w/2,h*.7,8,w/2,h*.62,120);g.addColorStop(0,'#203c53');g.addColorStop(1,'#0b1420');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#34506444';ctx.lineWidth=1;for(let x=0;x<w;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    const hot=this.overheat||this.engineHeat>830,cold=this.icing,broken=this.faulty;
    ctx.save();ctx.translate(w/2,18);
    const outline=ctx.createLinearGradient(-38,0,38,0);outline.addColorStop(0,'#516e7f');outline.addColorStop(.35,hot?'#ff8a56':cold?'#8acbe4':'#b6cbd4');outline.addColorStop(.7,hot?'#e55a3a':cold?'#d8faff':'#829cac');outline.addColorStop(1,'#374c60');
    ctx.fillStyle=outline;ctx.beginPath();ctx.moveTo(-37,0);ctx.lineTo(37,0);ctx.lineTo(31,35);ctx.lineTo(23,49);ctx.lineTo(31,75);ctx.lineTo(25,89);ctx.lineTo(-25,89);ctx.lineTo(-31,75);ctx.lineTo(-23,49);ctx.lineTo(-31,35);ctx.closePath();ctx.fill();
    ctx.fillStyle='#263947';ctx.fillRect(-35,21,70,8);ctx.fillStyle='#2c4253';ctx.fillRect(-28,51,56,7);
    if(this.mode==='flight'&&!broken){const lg=ctx.createLinearGradient(0,86,0,146);lg.addColorStop(0,hot?'#fff4d4':'#d9ffdf');lg.addColorStop(.4,hot?'#ff562d':'#7cdaff');lg.addColorStop(1,'#76bcff00');ctx.fillStyle=lg;ctx.shadowColor=hot?'#ff722c':'#7cbfff';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(-17,86);ctx.quadraticCurveTo(-19,119,-2,143+Math.sin(t*15)*5);ctx.quadraticCurveTo(18,113,17,86);ctx.fill();}
    if(broken){ctx.strokeStyle='#ff8776';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,37);ctx.lineTo(13,63);ctx.moveTo(14,37);ctx.lineTo(-14,63);ctx.stroke();}
    if(cold){for(let i=0;i<13;i++){const x=Math.sin(i*12.9)*32,y=i*7;ctx.fillStyle='#c8f5ffab';ctx.fillRect(x-2,y,3,6);}}
    if(hot){for(let i=0;i<12;i++){const x=Math.sin(i*13+t)*36,y=i*7;ctx.fillStyle=`rgba(255,${Math.round(80+i*10)},60,.7)`;ctx.fillRect(x,y,2,2);}}
    ctx.restore();
  }
}
