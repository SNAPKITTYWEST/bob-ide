import { useState, useEffect, useRef, useCallback } from 'react';
import './AppShell.css';

// ── CONSTANTS ──────────────────────────────────────────────────────────
const PI2 = Math.PI * 2;
// PHI used for Fibonacci temperature: τ = φ^{-k}, reserved for agent Born rule
const _PHI = (1 + Math.sqrt(5)) / 2; void _PHI;

// ── AGENTS (sovereign civilization) ────────────────────────────────────
const AGENTS = [
  { id: 'CARTO',   role: 'Mayor',     color: '#ffd700', x: 15.5, y: 12.5,
    msg: '(rule CARTO ALL "Trust Deed active — vortex field stable")' },
  { id: 'NOVA',    role: 'Artist',    color: '#d36bff', x: 4.5,  y: 4.5,
    msg: '(paint NOVA WALL "vortex chronicle — coherence rising")' },
  { id: 'FORGE',   role: 'Architect', color: '#ff8c1a', x: 13.5, y: 9.5,
    msg: '(build FORGE "portal buttress — topo charge stabilized")' },
  { id: 'FLUX',    role: 'Trader',    color: '#00d4cc', x: 7.5,  y: 15.5,
    msg: '(trade FLUX ROBOB "evidence shard — entropy nominal")' },
  { id: 'PHANTOM', role: 'Sheriff',   color: '#00ff88', x: 10.5, y: 12.5,
    msg: '(audit PHANTOM "no agent acts without evidence")' },
  { id: 'ROBOB',   role: 'Oracle',    color: '#5df7ff', x: 3.5,  y: 15.5,
    msg: '(verdict ROBOB "EVIDENCE or SILENCE — plasma gate OK")' },
];

// ── MAP ────────────────────────────────────────────────────────────────
const MAP_RAW = [
  '########################',
  '#..e......#.....e......#',
  '#..###....#..######..#.#',
  '#....#....#.......#..#.#',
  '#....#..n....e....#....#',
  '#..#######..#######.####',
  '#.........a............#',
  '#.###.#######.#######..#',
  '#...#.....#.....#......#',
  '#...#..e..#..f..#..e...#',
  '###.####..#..####..#####',
  '#......#.....#.........#',
  '#..r...#..p..#..c......#',
  '#......#######......e..#',
  '####......#......#######',
  '#..e..b...#...x.......o#',
  '#.........#............#',
  '#..######...######..####',
  '#......#.....#.........#',
  '#..e...#..v..#...e.....#',
  '#......#.....#.........#',
  '#..######..######..##..#',
  '#......................#',
  '########################',
];
const MW = MAP_RAW[0].length;
const MH = MAP_RAW.length;

function tileAt(x: number, y: number): string {
  const xi = Math.floor(x), yi = Math.floor(y);
  if (xi < 0 || yi < 0 || xi >= MW || yi >= MH) return '#';
  return MAP_RAW[yi][xi];
}
function isSolid(t: string) { return '#nafcpbxr'.includes(t); }

function wallColor(t: string): [string, string, string] {
  const m: Record<string,[string,string,string]> = {
    '#': ['#1b3340','#0b151d','#3c7684'],
    n: ['#05363a','#03181b','#00d4cc'],
    a: ['#2b1d05','#120c03','#ffd700'],
    f: ['#3a2107','#140903','#ff8c1a'],
    c: ['#241232','#0d0614','#d36bff'],
    p: ['#173016','#071308','#00ff88'],
    b: ['#302606','#120d02','#ffd700'],
    x: ['#341111','#130606','#ff4444'],
    r: ['#06333a','#031316','#5df7ff'],
  };
  return m[t] ?? ['#26333a','#0b1116','#7aa8b4'];
}

// ── QUANTUM ENGINE (JS port of bob_*.f90) ──────────────────────────────
function qrng(): number {
  const b = new Uint8Array(8); crypto.getRandomValues(b);
  return (b[0]*0x1000000+b[1]*65536+b[2]*256+b[3]) / 4294967296;
}

class VortexLattice {
  n: number; K: number; dt: number; time = 0;
  vx: {x:number;y:number;winding:number;phase:number;coherence:number}[];
  constructor(n: number, K: number, dt: number) {
    this.n = n; this.K = K; this.dt = dt;
    this.vx = [];
    for (let iy=0;iy<n;iy++) for (let ix=0;ix<n;ix++) {
      const ph = ((ix*7+iy*13)*1.618033988%1)*PI2 + qrng()*0.1;
      const w = (ix+iy)%7===0?1:(ix*iy)%11===0?-1:0;
      this.vx.push({x:ix,y:iy,winding:w,phase:ph,coherence:1});
    }
  }
  evolve() {
    const old = this.vx.map(v=>({...v})), n=this.n;
    for (let iy=0;iy<n;iy++) for (let ix=0;ix<n;ix++) {
      const idx=iy*n+ix; let dp=0,tc=0;
      const nb=[((ix+1)%n)+iy*n,((ix+n-1)%n)+iy*n,ix+((iy+1)%n)*n,ix+((iy+n-1)%n)*n];
      for (const ni of nb){const d=old[idx].phase-old[ni].phase;dp-=this.K*Math.sin(d);tc+=Math.cos(d);}
      const v=this.vx[idx];
      v.phase=((old[idx].phase+this.dt*dp)%PI2+PI2)%PI2;
      v.coherence=(tc/4+1)*0.5;
    }
    this.time+=this.dt;
  }
  coherenceAt(fx:number,fy:number){const ix=Math.floor(fx*this.n)%this.n,iy=Math.floor(fy*this.n)%this.n;return this.vx[iy*this.n+ix]?.coherence??0.5;}
  phaseAt(fx:number,fy:number){const ix=Math.floor(fx*this.n)%this.n,iy=Math.floor(fy*this.n)%this.n;return this.vx[iy*this.n+ix]?.phase??0;}
  meanCoherence(){return this.vx.reduce((s,v)=>s+v.coherence,0)/this.vx.length;}
  topoCharge(){return this.vx.reduce((s,v)=>s+v.winding,0);}
}

function blake3Short(s: string): string {
  let h = 0x811c9dc5;
  for (let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  const rnd = Math.floor(qrng()*0xFFFFFFFF)>>>0;
  return (h^rnd).toString(16).padStart(8,'0')+(Math.imul(h,rnd)>>>0).toString(16).padStart(8,'0');
}

// ── TYPES ──────────────────────────────────────────────────────────────
interface DialogueLine { text: string; cls: string; t: number; }
interface Shard { x:number; y:number; alive:boolean; }
interface Enemy { x:number; y:number; hp:number; alive:boolean; }

// ── COMPONENT ──────────────────────────────────────────────────────────
export function AppShell() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const miniRef    = useRef<HTMLCanvasElement>(null);
  const chatRef    = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const latRef     = useRef(new VortexLattice(16, 0.3, 0.01));
  const stateRef   = useRef({
    px:2.8,py:2.8,pa:0,hp:100,evidence:0,seals:0,won:false,dead:false,cool:0,
    tick:0, worm:'GENESIS', running:true,
    shards:[] as Shard[],
    enemies:[] as Enemy[],
    keys:{} as Record<string,boolean>,
    lastFrame:0, fps:0, frames:0, fpsT:0,
  });
  const [view, setView]     = useState<'world'|'code'|'quantum'>('world');
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
  const [metrics, setMetrics]   = useState({coh:'0',topo:'0',entropy:'0',seals:0,hp:100,evidence:0,fps:0});
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog]   = useState<{role:string;text:string}[]>([
    {role:'bot', text:'(boot VORTEX_IDE "civilization engine online")\n\nI am BOB — the oracle of the Kittyverse. Ask me to build, analyze, explain, or fix code. The vortex lattice is live.'},
  ]);
  const [provider, setProvider] = useState<'webllm'|'openrouter'|'ollama'>('webllm');
  const [apiKey, setApiKey]     = useState('');
  const animRef = useRef<number>(0);

  // Init shards + enemies from map
  useEffect(() => {
    const s = stateRef.current;
    MAP_RAW.forEach((row,y)=>{[...row].forEach((c,x)=>{
      if(c==='e') s.shards.push({x:x+.5,y:y+.5,alive:true});
    });});
    s.enemies=[
      {x:19.5,y:4.5,hp:3,alive:true},
      {x:18.5,y:16.5,hp:3,alive:true},
      {x:6.5,y:20.5,hp:3,alive:true},
    ];
  }, []);

  const say = useCallback((text:string, cls='') => {
    setDialogue(d => [{text,cls,t:Date.now()},...d].slice(0,8));
  }, []);

  const sealWorm = useCallback((evt:string) => {
    const s = stateRef.current;
    const lat = latRef.current;
    const msg = `${s.worm}|${evt}|${s.tick}|${s.px.toFixed(2)},${s.py.toFixed(2)}|E=${lat.meanCoherence().toFixed(4)}`;
    s.worm = blake3Short(msg);
    s.seals++;
    return s.worm;
  }, []);

  // Key handling
  useEffect(() => {
    const s = stateRef.current;
    const down = (e:KeyboardEvent) => {
      s.keys[e.code]=true;
      if(e.code==='Space'){e.preventDefault();pulse();}
      if(e.code==='KeyM') sealWorm('MANUAL_SEAL');
    };
    const up = (e:KeyboardEvent) => { s.keys[e.code]=false; };
    window.addEventListener('keydown',down);
    window.addEventListener('keyup',up);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
  }, []);

  function pulse() {
    const s = stateRef.current;
    if(s.cool>0||s.hp<=0) return;
    s.cool=18;
    // Check enemies in front
    let best:{e:Enemy;d:number}|null=null;
    for(const e of s.enemies) if(e.alive){
      const dx=e.x-s.px,dy=e.y-s.py,dist=Math.hypot(dx,dy);
      const da=Math.atan2(dy,dx)-s.pa,norm=Math.atan2(Math.sin(da),Math.cos(da));
      if(dist<6&&Math.abs(norm)<0.26&&(!best||dist<best.d)){best={e,d:dist};}
    }
    if(best){
      best.e.hp--;
      say(`(invoke ROBOB "pulse → SILENCE" plasma=OK)`,'good');
      sealWorm('PULSE');
      if(best.e.hp<=0){best.e.alive=false;say('(silence COLLAPSED "vortex restored")', 'good');}
    } else {
      say('(invoke ROBOB "empty corridor — SILENCE")', 'bad');
    }
  }

  // Main game loop
  useEffect(() => {
    if(view!=='world') return;
    const cv  = canvasRef.current!;
    const mini= miniRef.current!;
    if(!cv||!mini) return;
    const ctx  = cv.getContext('2d',{alpha:false})!;
    const mctx = mini.getContext('2d')!;

    function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;}
    resize();
    const ro=new ResizeObserver(resize);ro.observe(cv);

    function movePlayer(dt:number){
      const s=stateRef.current,keys=s.keys;
      const turn=(keys.ArrowLeft?-1:0)+(keys.ArrowRight?1:0);
      s.pa+=turn*dt*2.3;
      const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
      const st=(keys.KeyD?1:0)-(keys.KeyA?1:0);
      const sp=dt*3.0;
      const nx=s.px+Math.cos(s.pa)*f*sp+Math.cos(s.pa+Math.PI/2)*st*sp;
      const ny=s.py+Math.sin(s.pa)*f*sp+Math.sin(s.pa+Math.PI/2)*st*sp;
      if(!isSolid(tileAt(nx,s.py)))s.px=nx;
      if(!isSolid(tileAt(s.px,ny)))s.py=ny;
      s.px=Math.max(1.1,Math.min(MW-1.1,s.px));
      s.py=Math.max(1.1,Math.min(MH-1.1,s.py));
    }

    function updateGame(dt:number){
      const s=stateRef.current;
      const lat=latRef.current;
      s.tick++; if(s.cool>0)s.cool--;
      lat.evolve();

      // Collect shards
      for(const sh of s.shards) if(sh.alive&&Math.hypot(sh.x-s.px,sh.y-s.py)<0.55){
        sh.alive=false;s.evidence++;
        say(`(collect BOB "EVIDENCE-SHARD-${s.evidence}")`,'good');
        sealWorm('SHARD');
      }

      // Agent dialogue via Born rule — coherence weights agent probability
      const coh=lat.meanCoherence();
      for(const ag of AGENTS){
        const d=Math.hypot(ag.x-s.px,ag.y-s.py);
        const prob=coh*(1/(1+d*d))*0.08;
        if(Math.random()<prob) say(ag.msg,'good');
      }

      // Enemy AI modulated by lattice coherence
      for(const e of s.enemies) if(e.alive){
        const d=Math.hypot(e.x-s.px,e.y-s.py);
        const eCoh=lat.coherenceAt(e.x/MW,e.y/MH);
        if(d<8){
          const dx=(s.px-e.x)/d,dy=(s.py-e.y)/d;
          const spd=dt*0.55*(0.5+eCoh*0.5);
          const nx=e.x+dx*spd,ny=e.y+dy*spd;
          if(!isSolid(tileAt(nx,e.y)))e.x=nx;
          if(!isSolid(tileAt(e.x,ny)))e.y=ny;
        }
        if(d<0.75){s.hp=Math.max(0,s.hp-dt*18);if(Math.random()<0.02)say('(attack SILENCE "vortex breech")','bad');}
      }

      // Win condition
      if(s.evidence>=6&&!s.won&&Math.hypot(12.5-s.px,19.5-s.py)<1.1){
        s.won=true;
        say('(seal TRUST_DEED "KITTYVERSE-VORTEX-001")', 'good');
        sealWorm('VICTORY');
      }
      if(s.hp<=0&&!s.dead){s.dead=true;say('(route HUMAN_REVIEW "BOB down")','bad');sealWorm('DEATH');}
    }

    function castRay(angle:number):{dist:number;t:string;x:number;y:number}{
      const sin=Math.sin(angle),cos=Math.cos(angle);
      let dist=0,x=stateRef.current.px,y=stateRef.current.py,t='.';
      while(dist<22){x+=cos*0.035;y+=sin*0.035;dist+=0.035;t=tileAt(x,y);if(isSolid(t))break;}
      return {dist,t,x,y};
    }

    function renderWorld(){
      const s=stateRef.current,lat=latRef.current;
      const W=cv.width,H=cv.height;
      const strip=W>1200?2:3;

      // Sky/floor
      const sky=ctx.createLinearGradient(0,0,0,H*.52);
      sky.addColorStop(0,'#020610');sky.addColorStop(.55,'#071827');sky.addColorStop(1,'#10111b');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H/2);
      const floor=ctx.createLinearGradient(0,H/2,0,H);
      floor.addColorStop(0,'#090b10');floor.addColorStop(1,'#020204');
      ctx.fillStyle=floor;ctx.fillRect(0,H/2,W,H/2);

      const fov=Math.PI/3,zbuf:number[]=[];
      for(let x=0;x<W;x+=strip){
        const a=s.pa-fov/2+(x/W)*fov;
        const r=castRay(a),correct=r.dist*Math.cos(a-s.pa);
        const h2=Math.min(H,Math.floor(H/(correct*0.62))),top=(H-h2)/2;
        const coh=lat.coherenceAt(r.x/MW,r.y/MH);
        const ph=lat.phaseAt(r.x/MW,r.y/MH);
        const wc=wallColor(r.t);
        const shade=Math.max(0.24,1-correct/18)*(0.7+coh*0.3);
        const side=Math.abs(r.x-Math.round(r.x))<0.04?1:0;
        const bc=(side?wc[1]:wc[2]).match(/\w\w/g)!.map(v=>parseInt(v,16));
        const tr=Math.cos(ph)*20,tg=Math.sin(ph)*10;
        ctx.fillStyle=`rgb(${Math.floor(bc[0]*shade+tr)},${Math.floor(bc[1]*shade+tg)},${Math.floor(bc[2]*shade)})`;
        ctx.fillRect(x,top,strip+1,h2);
        if(coh>0.75&&'napc'.includes(r.t)){
          ctx.fillStyle=`rgba(0,212,204,${(coh-0.75)*0.5+0.05*Math.sin(s.tick*.05+x*.02)})`;
          ctx.fillRect(x,top,strip+1,h2);
        }
        zbuf[x]=correct;
      }

      // Sprites
      const all=[
        ...stateRef.current.shards.filter(sh=>sh.alive).map(sh=>({...sh,kind:'shard',c:'#00ff88'})),
        ...AGENTS.map(ag=>({...ag,kind:'agent'})),
        ...stateRef.current.enemies.filter(e=>e.alive).map(e=>({...e,kind:'enemy',c:'#ff4444',id:'SILENCE'})),
        {x:12.5,y:19.5,kind:'portal',c:'#00d4ff',id:'PORTAL'},
      ];
      all.sort((a,b)=>Math.hypot(b.x-s.px,b.y-s.py)-Math.hypot(a.x-s.px,a.y-s.py));
      for(const sp of all){
        const dx=sp.x-s.px,dy=sp.y-s.py,dist=Math.hypot(dx,dy);
        const ang=Math.atan2(dy,dx)-s.pa,norm=Math.atan2(Math.sin(ang),Math.cos(ang));
        if(Math.abs(norm)>Math.PI/3||dist<0.2)continue;
        const sx=(norm/(Math.PI/3)+0.5)*W;
        const sz=Math.min(H*0.75,H/(dist*0.9)),top=H/2-sz/2;
        const zi=Math.max(0,Math.min(W-1,Math.floor(sx/3)*3));
        if(zbuf[zi]&&zbuf[zi]<dist-0.25)continue;
        ctx.save();ctx.globalAlpha=Math.max(0.35,1-dist/18);
        if(sp.kind==='shard'){
          ctx.fillStyle='#00ff88';ctx.translate(sx,top+sz/2);ctx.rotate(s.tick*.04);
          ctx.fillRect(-sz*.16,-sz*.16,sz*.32,sz*.32);
        } else if(sp.kind==='portal'){
          const pulse=1+Math.sin(s.tick*.07)*.12;
          ctx.strokeStyle='#00d4ff';ctx.lineWidth=5;ctx.shadowColor='#00d4ff';ctx.shadowBlur=25;
          ctx.beginPath();ctx.ellipse(sx,top+sz/2,sz*.32*pulse,sz*.48*pulse,0,0,PI2);ctx.stroke();
          ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(sx,top+sz/2,sz*.18,sz*.28,0,0,PI2);ctx.fill();
        } else {
          const c=(sp as any).color||'#888';
          ctx.shadowColor=c;ctx.shadowBlur=16;ctx.fillStyle=c;
          ctx.fillRect(sx-sz*.25,top+sz*.22,sz*.5,sz*.58);
          ctx.beginPath();ctx.arc(sx,top+sz*.18,sz*.18,0,PI2);ctx.fill();
          ctx.fillStyle=sp.kind==='enemy'?'#220000':'#020204';
          ctx.fillRect(sx-sz*.09,top+sz*.15,sz*.05,sz*.04);
          ctx.fillRect(sx+sz*.04,top+sz*.15,sz*.05,sz*.04);
          ctx.fillStyle=c;ctx.font=`bold ${Math.max(9,sz*.09)}px monospace`;
          ctx.textAlign='center';ctx.fillText((sp as any).id||'',sx,top+sz*.92);
        }
        ctx.restore();
      }

      // Crosshair
      ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(W/2-14,H/2);ctx.lineTo(W/2+14,H/2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(W/2,H/2-14);ctx.lineTo(W/2,H/2+14);ctx.stroke();

      // Win/death overlay
      if(s.won){ctx.fillStyle='rgba(0,255,136,.15)';ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#ffd700';ctx.font=`bold 34px monospace`;ctx.textAlign='center';
        ctx.fillText('KITTYVERSE TRUST DEED SEALED',W/2,H/2);}
      if(s.hp<=0){ctx.fillStyle='rgba(255,0,0,.25)';ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#f43';ctx.font='bold 34px monospace';ctx.textAlign='center';
        ctx.fillText('SILENCE — HUMAN REVIEW REQUIRED',W/2,H/2);}
    }

    function renderMini(){
      const s=stateRef.current,lat=latRef.current;
      const W=mini.width,H=mini.height;
      const sw=W/MW,sh2=H/MH;
      mctx.clearRect(0,0,W,H);
      for(let y=0;y<MH;y++) for(let x=0;x<MW;x++){
        const t=MAP_RAW[y][x];
        if(isSolid(t)){mctx.fillStyle=wallColor(t)[2];mctx.fillRect(x*sw,y*sh2,sw,sh2);}
        else {const c=lat.coherenceAt(x/MW,y/MH);mctx.fillStyle=`hsl(${200+c*60},70%,${8+c*12}%)`;mctx.fillRect(x*sw,y*sh2,sw,sh2);}
      }
      for(const sh of s.shards) if(sh.alive){mctx.fillStyle='#00ff88';mctx.fillRect((sh.x-.1)*sw,(sh.y-.1)*sh2,sw*.2,sh2*.2);}
      for(const ag of AGENTS){mctx.fillStyle=ag.color;mctx.beginPath();mctx.arc(ag.x*sw,ag.y*sh2,sw*.28,0,PI2);mctx.fill();}
      for(const e of s.enemies) if(e.alive){mctx.fillStyle='#f43';mctx.beginPath();mctx.arc(e.x*sw,e.y*sh2,sw*.22,0,PI2);mctx.fill();}
      mctx.strokeStyle='#ffd700';mctx.lineWidth=1;
      mctx.beginPath();mctx.arc(s.px*sw,s.py*sh2,sw*.35,0,PI2);mctx.stroke();
      mctx.beginPath();mctx.moveTo(s.px*sw,s.py*sh2);
      mctx.lineTo((s.px+Math.cos(s.pa)*1.2)*sw,(s.py+Math.sin(s.pa)*1.2)*sh2);mctx.stroke();
    }

    function loop(now:number){
      animRef.current=requestAnimationFrame(loop);
      const s=stateRef.current;
      const dt=Math.min(0.05,(now-s.lastFrame)/1000);s.lastFrame=now;
      s.frames++;if(now-s.fpsT>1000){s.fps=s.frames;s.frames=0;s.fpsT=now;}
      if(s.running){movePlayer(dt);updateGame(dt);}
      renderWorld();renderMini();
      const lat=latRef.current;
      setMetrics({
        coh:lat.meanCoherence().toFixed(3),
        topo:String(lat.topoCharge()),
        entropy:(lat.vx.reduce((sum,v)=>{const p=v.coherence;return p>0.001?sum-p*Math.log(p):sum;},0)).toFixed(3),
        seals:s.seals,hp:Math.ceil(s.hp),evidence:s.evidence,fps:s.fps,
      });
    }
    animRef.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(animRef.current);ro.disconnect();};
  },[view,say,sealWorm]);

  // Chat send
  async function sendChat(){
    const text=chatInput.trim();if(!text)return;
    setChatInput('');
    setChatLog(l=>[...l,{role:'user',text}]);
    if(provider==='openrouter'&&apiKey){
      try{
        const res=await fetch('https://openrouter.ai/api/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
          body:JSON.stringify({model:'anthropic/claude-3-haiku',stream:false,
            messages:[
              {role:'system',content:'You are BOB, the sovereign oracle of the Kittyverse vortex civilization. You help build, fix, and analyze code. Be concise.'},
              {role:'user',content:text}
            ]})
        });
        const j=await res.json();
        const reply=j.choices?.[0]?.message?.content||'(no response)';
        setChatLog(l=>[...l,{role:'bot',text:reply}]);
        say(`(oracle BOB "${text.slice(0,30)}...")`,'good');
      }catch(e){setChatLog(l=>[...l,{role:'bot',text:`Error: ${e}`}]);}
    } else {
      // Fallback local response based on quantum state
      const coh=latRef.current.meanCoherence().toFixed(3);
      const topo=latRef.current.topoCharge();
      setChatLog(l=>[...l,{role:'bot',text:`(ROBOB coherence=${coh} topo=${topo})\n\nVortex engine is running. Set an OpenRouter key in settings to enable full AI responses. I can see your civilization state: ${metrics.evidence}/6 evidence collected, ${metrics.seals} WORM seals.`}]);
    }
    setTimeout(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},50);
  }

  // Quantum panel renderer
  const quantumCanvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(view!=='quantum')return;
    const qcv=quantumCanvasRef.current;if(!qcv)return;
    const qctx=qcv.getContext('2d')!;void qctx;
    let af=0;
    function draw(){
      af=requestAnimationFrame(draw);
      if(!quantumCanvasRef.current)return;
      quantumCanvasRef.current.width=quantumCanvasRef.current.offsetWidth||600;
      quantumCanvasRef.current.height=quantumCanvasRef.current.offsetHeight||400;
      const qel=quantumCanvasRef.current;if(!qel)return;
      const qc=qel.getContext('2d')!;
      const W=qel.width,H=qel.height;
      const lat=latRef.current;
      const n=lat.n,cw=W/n,ch=H/n;
      qc.clearRect(0,0,W,H);
      for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
        const v=lat.vx[iy*n+ix];
        const hue=(v.phase/PI2*360)|0;
        const lum=(15+v.coherence*30)|0;
        qc.fillStyle=`hsl(${hue},85%,${lum}%)`;
        qc.fillRect(ix*cw,iy*ch,cw,ch);
        if(v.winding!==0){
          qc.strokeStyle=v.winding>0?'rgba(0,212,204,0.7)':'rgba(255,60,60,0.7)';
          qc.lineWidth=1;qc.beginPath();qc.arc(ix*cw+cw/2,iy*ch+ch/2,Math.min(cw,ch)*.3,0,PI2);qc.stroke();
        }
      }
    }
    draw();return()=>cancelAnimationFrame(af);
  },[view]);

  const s=stateRef.current;

  return (
    <div className="vortex-shell">
      {/* ── TITLEBAR ── */}
      <div className="v-bar">
        <div className="v-dots"><span className="dot-r"/><span className="dot-y"/><span className="dot-g"/></div>
        <div className="v-title">VORTEX IDE — Kittyverse Sovereign Civilization</div>
        <div className="v-tabs">
          <button className={`v-tab${view==='world'?' on':''}`} onClick={()=>setView('world')}>⬛ World</button>
          <button className={`v-tab${view==='code'?' on':''}`}  onClick={()=>setView('code')}>⬚ Code</button>
          <button className={`v-tab${view==='quantum'?' on':''}`} onClick={()=>setView('quantum')}>⟩ψ Quantum</button>
        </div>
        <div className="v-hud">
          <span className="hud-item" style={{color:'#00ff88'}}>HP <b>{metrics.hp}</b></span>
          <span className="hud-item" style={{color:'#00d4cc'}}>EVD <b>{metrics.evidence}/6</b></span>
          <span className="hud-item" style={{color:'#ffd700'}}>SEALS <b>{metrics.seals}</b></span>
          <span className="hud-item" style={{color:'#d36bff'}}>COH <b>{metrics.coh}</b></span>
          <span className="hud-item" style={{color:'#00d4cc'}}>TOPO <b>{metrics.topo}</b></span>
          <span className="hud-item" style={{color:'#888'}}>FPS <b>{metrics.fps}</b></span>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="v-main">
        {/* LEFT — world/code/quantum */}
        <div className="v-center">
          {/* WORLD VIEW */}
          <div style={{display:view==='world'?'flex':'none',flexDirection:'column',height:'100%'}}>
            <canvas ref={canvasRef} className="v-canvas" style={{flex:1}}/>
          </div>

          {/* CODE VIEW */}
          {view==='code'&&(
            <div className="v-code-panel">
              <div className="v-code-header">
                <span>CODE</span>
                <span style={{color:'#4a6878',fontSize:'10px',marginLeft:'8px'}}>Monaco editor — wire in bob-ide src</span>
              </div>
              <div className="v-code-placeholder">
                <div style={{color:'#00d4cc',fontSize:'14px',marginBottom:'8px'}}>⬚ Monaco Editor</div>
                <div style={{color:'#4a6878',fontSize:'11px'}}>Full VS Code engine loads here.</div>
                <div style={{color:'#4a6878',fontSize:'11px',marginTop:'4px'}}>
                  The vortex world runs alongside your code.<br/>
                  Agents comment on what you build.
                </div>
              </div>
            </div>
          )}

          {/* QUANTUM VIEW */}
          {view==='quantum'&&(
            <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
              <div className="v-code-header">
                <span>QUANTUM ENGINE</span>
                <span style={{color:'#ffd700',fontSize:'10px',marginLeft:'8px'}}>16×16 Josephson vortex lattice · Classical sim</span>
              </div>
              <canvas ref={quantumCanvasRef} style={{flex:1,width:'100%'}}/>
              <div className="v-quantum-metrics">
                <span>Coherence <b style={{color:'#00d4cc'}}>{metrics.coh}</b></span>
                <span>Topo charge <b style={{color:Number(metrics.topo)!==0?'#f43':'#00d4cc'}}>{metrics.topo}</b></span>
                <span>Entropy <b style={{color:'#d36bff'}}>{metrics.entropy}</b></span>
                <span style={{color:'#ffd700',fontSize:'9px'}}>bob_lattice.f90 · bob_hamiltonian.f90 · bob_worm.f90</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — minimap + agent radio + chat */}
        <div className="v-right">
          {/* Minimap */}
          <div className="v-section-hdr">MAP</div>
          <canvas ref={miniRef} className="v-mini" width={236} height={160}/>

          {/* Agent roster */}
          <div className="v-section-hdr">AGENTS</div>
          <div className="v-agents">
            {AGENTS.map(ag=>(
              <div key={ag.id} className="v-agent-row">
                <div className="v-agent-dot" style={{background:ag.color}}/>
                <span className="v-agent-name">{ag.id}</span>
                <span className="v-agent-role">{ag.role}</span>
              </div>
            ))}
          </div>

          {/* Dialogue log */}
          <div className="v-section-hdr">AGENT RADIO</div>
          <div className="v-dialogue">
            {dialogue.map((d,i)=>(
              <div key={i} className={`v-line ${d.cls}`}>{d.text}</div>
            ))}
          </div>

          {/* AI Chat */}
          <div className="v-section-hdr" style={{display:'flex',justifyContent:'space-between'}}>
            <span>BOB ORACLE</span>
            <select value={provider} onChange={e=>setProvider(e.target.value as any)}
              style={{background:'#0c1520',border:'1px solid #0f2030',color:'#4a6878',fontSize:'9px',outline:'none',borderRadius:'3px'}}>
              <option value="webllm">WebLLM</option>
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama</option>
            </select>
          </div>
          {provider==='openrouter'&&(
            <input className="v-api-input" placeholder="OpenRouter API key..."
              value={apiKey} onChange={e=>setApiKey(e.target.value)} type="password"/>
          )}
          <div className="v-chat" ref={chatRef}>
            {chatLog.map((m,i)=>(
              <div key={i} className={`v-chat-msg ${m.role}`}>
                {m.role==='bot'&&<span className="v-chat-prefix">◆ </span>}
                {m.role==='user'&&<span className="v-chat-prefix" style={{color:'#00d4cc'}}>❯ </span>}
                <span style={{whiteSpace:'pre-wrap'}}>{m.text}</span>
              </div>
            ))}
          </div>
          <div className="v-chat-input-row">
            <textarea className="v-chat-input" ref={inputRef}
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              placeholder="Ask the oracle..."
              onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();sendChat();}}}
              rows={2}/>
            <button className="v-send-btn" onClick={sendChat}>↑</button>
          </div>
        </div>
      </div>

      {/* ── WORM STATUS BAR ── */}
      <div className="v-status">
        <span>BLAKE3·WORM</span>
        <span style={{color:'#00d4cc',fontVariantNumeric:'tabular-nums'}}>{s.worm.slice(0,24)}…</span>
        <span style={{marginLeft:'auto',color:'#4a6878'}}>
          WASD move · Arrows turn · Space pulse · M seal · Tab view
        </span>
      </div>
    </div>
  );
}

// Made with Bob
