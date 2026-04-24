import React, { useRef, useEffect, useCallback, useState } from 'react';

const LANG_COLORS = {
  JavaScript:'#f0db4f', TypeScript:'#3b82f6', Python:'#4ec9b0',
  Go:'#00acd7', Rust:'#f74c00', Java:'#ed8b00', Ruby:'#cc342d',
  'C++':'#9b59b6', C:'#8b949e', Swift:'#ff6b35', Kotlin:'#7f52ff',
  Dart:'#00b4ab', HTML:'#e34c26', CSS:'#264de4', Shell:'#4eaa25',
  Vue:'#42b883', PHP:'#8892b0', default:'#39d353',
};

function getPlanetType(p) {
  if (p.isArchived) return 'archived';
  if (p.isFork) return 'forked';
  if (p.hasDeployment || p.homepage) return 'deployed';
  return 'active';
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}

function drawPlanet(ctx, px, py, pr, color, type, tick) {
  const { r, g, b } = hexToRgb(color);

  // --- Atmosphere glow ---
  const atmo = ctx.createRadialGradient(px, py, pr * 0.6, px, py, pr * 2.8);
  atmo.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
  atmo.addColorStop(0.45, `rgba(${r},${g},${b},0.07)`);
  atmo.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.beginPath(); ctx.arc(px, py, pr * 2.8, 0, Math.PI * 2);
  ctx.fillStyle = atmo; ctx.fill();

  // --- Planet body ---
  const sphere = ctx.createRadialGradient(
    px - pr * 0.36, py - pr * 0.36, pr * 0.02,
    px + pr * 0.12, py + pr * 0.12, pr * 1.1
  );
  sphere.addColorStop(0,    `rgba(${Math.min(r+130,255)},${Math.min(g+130,255)},${Math.min(b+130,255)},1)`);
  sphere.addColorStop(0.2,  `rgba(${Math.min(r+70,255)},${Math.min(g+70,255)},${Math.min(b+70,255)},1)`);
  sphere.addColorStop(0.55, `rgba(${r},${g},${b},1)`);
  sphere.addColorStop(0.82, `rgba(${Math.max(r-55,0)},${Math.max(g-55,0)},${Math.max(b-55,0)},1)`);
  sphere.addColorStop(1,    `rgba(${Math.max(r-100,0)},${Math.max(g-100,0)},${Math.max(b-100,0)},1)`);

  ctx.save();
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = sphere; ctx.fill();
  ctx.clip();

  // Surface bands
  const bands = Math.floor(pr / 7);
  for (let i = 0; i < bands; i++) {
    const by = py - pr * 0.55 + (i / Math.max(bands,1)) * pr * 1.1;
    const ba = 0.04 + 0.03 * Math.sin(tick * 0.0008 + i * 1.4);
    ctx.beginPath();
    ctx.ellipse(px, by, pr * 0.92, pr * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},${ba})`;
    ctx.fill();
  }

  // Specular shine
  const shine = ctx.createRadialGradient(
    px - pr*0.4, py - pr*0.4, 0,
    px - pr*0.15, py - pr*0.15, pr * 0.7
  );
  shine.addColorStop(0, 'rgba(255,255,255,0.32)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = shine; ctx.fill();

  // Dark limb
  const limb = ctx.createRadialGradient(px+pr*0.28, py+pr*0.28, pr*0.35, px, py, pr);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(0.55, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = limb; ctx.fill();

  ctx.restore();
}

const GalaxyCanvas = ({ planets, onPlanetClick, onPlanetHover }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    stars: [], nebulae: [], animFrame: 0, tick: 0,
    hoveredId: null, offset: { x:0, y:0 }, zoom: 1,
    dragging: false, dragStart: { x:0, y:0 }, dragOffset: { x:0, y:0 },
  });
  const [size, setSize] = useState({ w:800, h:600 });

  const initStatics = useCallback((w, h) => {
    const s = stateRef.current;
    s.stars = [
      ...Array.from({length:500}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: 0.3 + Math.random()*0.8,
        alpha: 0.08 + Math.random()*0.35,
        sp: 0.004+Math.random()*0.014, off: Math.random()*Math.PI*2, bright: false
      })),
      ...Array.from({length:70}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: 0.9 + Math.random()*1.5,
        alpha: 0.35 + Math.random()*0.55,
        sp: 0.003+Math.random()*0.009, off: Math.random()*Math.PI*2, bright: true
      })),
    ];
    // Green-tinted nebulae
    s.nebulae = Array.from({length:5}, (_, i) => ({
      x: w*(0.12 + Math.random()*0.76),
      y: h*(0.12 + Math.random()*0.76),
      rx: 70 + Math.random()*150, ry: 35+Math.random()*75,
      rot: Math.random()*Math.PI,
      alpha: 0.008 + Math.random()*0.018,
      hue: [140,145,135,150,138][i],
      sat: [55,45,60,40,50][i],
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 800;
      const h = window.innerHeight - 60;
      canvas.width = w; canvas.height = h;
      setSize({ w, h });
      initStatics(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [initStatics]);

  const drawLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = size;
    const s = stateRef.current;
    const tick = s.tick++;
    const cx = w/2 + s.offset.x;
    const cy = h/2 + s.offset.y;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Nebulae
    for (const n of s.nebulae) {
      const grad = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y, Math.max(n.rx,n.ry));
      grad.addColorStop(0, `hsla(${n.hue},${n.sat}%,40%,${n.alpha*2})`);
      grad.addColorStop(0.4, `hsla(${n.hue},${n.sat}%,30%,${n.alpha})`);
      grad.addColorStop(1, `hsla(${n.hue},${n.sat}%,20%,0)`);
      ctx.save();
      ctx.translate(n.x,n.y); ctx.rotate(n.rot); ctx.scale(1, n.ry/n.rx);
      ctx.beginPath(); ctx.arc(0,0,n.rx,0,Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.restore();
    }

    // Stars
    for (const st of s.stars) {
      const a = st.alpha*(0.6+0.4*Math.sin(tick*st.sp+st.off));
      ctx.beginPath(); ctx.arc(st.x,st.y,st.r,0,Math.PI*2);
      ctx.fillStyle = st.bright ? `rgba(180,230,190,${a})` : `rgba(140,180,150,${a})`;
      ctx.fill();
      if (st.bright && st.r > 1.8 && a > 0.5) {
        ctx.strokeStyle = `rgba(180,230,190,${a*0.25})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(st.x-5,st.y); ctx.lineTo(st.x+5,st.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(st.x,st.y-5); ctx.lineTo(st.x,st.y+5); ctx.stroke();
      }
    }

    // Galaxy core — green glow
    const core = ctx.createRadialGradient(cx,cy,0, cx,cy,90*s.zoom);
    core.addColorStop(0, 'rgba(57,211,83,0.12)');
    core.addColorStop(0.4, 'rgba(35,134,54,0.05)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core; ctx.fillRect(0,0,w,h);

    // Sort by depth
    const sorted = [...planets].sort((a,b) => {
      const angA = (a.orbitAngle||0)+tick*(a.orbitSpeed||0.0004);
      const angB = (b.orbitAngle||0)+tick*(b.orbitSpeed||0.0004);
      return Math.sin(angA) - Math.sin(angB);
    });

    for (const p of sorted) {
      const type = getPlanetType(p);
      const color = LANG_COLORS[p.language] || LANG_COLORS.default;
      const isHovered = s.hoveredId === p._id;
      const angle = (p.orbitAngle||0) + tick*(p.orbitSpeed||0.0004);
      const orbitR = (p.orbitRadius||150)*s.zoom;
      const depthScale = 0.72 + 0.28*((Math.sin(angle)+1)/2);
      const px2 = cx + Math.cos(angle)*orbitR;
      const py2 = cy + Math.sin(angle)*orbitR*0.36;
      const pr2 = (p.planetSize||14)*depthScale*s.zoom*(isHovered?1.1:1);
      const {r,g,b} = hexToRgb(color);

      // Orbit path
      ctx.beginPath();
      ctx.ellipse(cx,cy,orbitR,orbitR*0.36,0,0,Math.PI*2);
      ctx.strokeStyle = isHovered
        ? `rgba(57,211,83,0.2)`
        : `rgba(48,54,61,0.5)`;
      ctx.lineWidth = isHovered ? 0.8 : 0.4;
      ctx.setLineDash([3,9]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ===== SATURN RING — back half (drawn BEFORE planet) =====
      if (type === 'deployed') {
        ctx.save();
        ctx.translate(px2, py2);
        ctx.rotate(-0.28);

        // Ring back half — semi-transparent so planet appears in front
        const ringW = pr2 * 0.26;
        const ringRx = pr2 * 2.0;
        const ringRy = pr2 * 0.52;

        // Outer ring back
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx + ringW, ringRy + ringW*0.25, 0, Math.PI, Math.PI*2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.22)`;
        ctx.lineWidth = ringW * 0.6;
        ctx.stroke();

        // Inner ring back
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx - ringW*0.3, ringRy - ringW*0.08, 0, Math.PI, Math.PI*2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.14)`;
        ctx.lineWidth = ringW * 0.35;
        ctx.stroke();

        ctx.restore();
      }

      // ===== PLANET BODY =====
      drawPlanet(ctx, px2, py2, pr2, color, type, tick);

      // ===== SATURN RING — front half (drawn AFTER planet) =====
      if (type === 'deployed') {
        ctx.save();
        ctx.translate(px2, py2);
        ctx.rotate(-0.28);

        const ringW = pr2 * 0.26;
        const ringRx = pr2 * 2.0;
        const ringRy = pr2 * 0.52;

        // Outer ring front
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx + ringW, ringRy + ringW*0.25, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.75)`;
        ctx.lineWidth = ringW * 0.6;
        ctx.stroke();

        // Inner ring front (slightly different alpha for depth)
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx - ringW*0.3, ringRy - ringW*0.08, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`;
        ctx.lineWidth = ringW * 0.35;
        ctx.stroke();

        // Ring gap shadow
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx*0.985, ringRy*0.985, 0, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(0,0,0,0.25)`;
        ctx.lineWidth = ringW * 0.08;
        ctx.stroke();

        ctx.restore();
      }

      // Archived — dust
      if (type === 'archived') {
        ctx.save();
        ctx.beginPath(); ctx.arc(px2,py2,pr2*1.5,0,Math.PI*2);
        ctx.fillStyle = 'rgba(80,60,40,0.1)'; ctx.fill();
        ctx.restore();
      }

      // Commit orbit dots
      const commitDots = Math.min(Math.round((p.commitCount||10)/22), 18);
      for (let i=0; i<commitDots; i++) {
        const da = (i/commitDots)*Math.PI*2 + tick*0.016;
        const dr = pr2 + (type==='deployed' ? pr2*2.4 : pr2*0.35 + 4);
        const dx = px2 + Math.cos(da)*dr;
        const dy = py2 + Math.sin(da)*dr*0.5;
        const dotA = 0.25 + 0.45*(i/commitDots);
        ctx.beginPath(); ctx.arc(dx,dy,1.3,0,Math.PI*2);
        ctx.fillStyle = `rgba(${r},${g},${b},${dotA})`; ctx.fill();
      }

      // Moons
      const moonCount = Math.min(p.forkCount||0, 2);
      for (let m=0; m<moonCount; m++) {
        const ma = tick*(0.024-m*0.007)+m*Math.PI;
        const md = pr2 + 12 + m*10;
        const mx2 = px2+Math.cos(ma)*md;
        const my2 = py2+Math.sin(ma)*md*0.5;
        const mg = ctx.createRadialGradient(mx2-1.2,my2-1.2,0, mx2,my2,3.5);
        mg.addColorStop(0,'rgba(180,220,190,0.95)');
        mg.addColorStop(1,'rgba(80,110,90,0.5)');
        ctx.beginPath(); ctx.arc(mx2,my2,3.5,0,Math.PI*2);
        ctx.fillStyle = mg; ctx.fill();
      }

      // Label
      const labelSize = Math.max(9, Math.min(11, pr2*0.6));
      ctx.font = `400 ${labelSize}px 'JetBrains Mono',monospace`;
      ctx.fillStyle = isHovered
        ? `rgba(${r},${g},${b},1)`
        : `rgba(${r},${g},${b},0.5)`;
      ctx.textAlign = 'center';
      const label = p.name.length>22 ? p.name.slice(0,20)+'…' : p.name;
      ctx.fillText(label, px2, py2+pr2+(type==='deployed'?pr2*1.0:1)+16);

      p._screen = { x:px2, y:py2, r:pr2 };
    }

    s.animFrame = requestAnimationFrame(drawLoop);
  }, [planets, size]);

  useEffect(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.animFrame);
    s.animFrame = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(s.animFrame);
  }, [drawLoop]);

  const getPlanetAt = useCallback((ex,ey) => {
    for (const p of planets) {
      if (!p._screen) continue;
      const dx = ex-p._screen.x, dy = ey-p._screen.y;
      if (dx*dx+dy*dy <= (p._screen.r+14)**2) return p;
    }
    return null;
  }, [planets]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX-rect.left, my = e.clientY-rect.top;
    const s = stateRef.current;
    if (s.dragging) {
      s.offset.x = s.dragOffset.x+(e.clientX-s.dragStart.x);
      s.offset.y = s.dragOffset.y+(e.clientY-s.dragStart.y);
      return;
    }
    const hit = getPlanetAt(mx,my);
    s.hoveredId = hit?hit._id:null;
    canvas.style.cursor = hit?'pointer':'grab';
    onPlanetHover?.(hit||null, e.clientX, e.clientY);
  }, [getPlanetAt, onPlanetHover]);

  const handleMouseDown = useCallback((e) => {
    const s = stateRef.current;
    s.dragging=true;
    s.dragStart={x:e.clientX,y:e.clientY};
    s.dragOffset={x:s.offset.x,y:s.offset.y};
  }, []);

  const handleMouseUp = useCallback((e) => {
    const s = stateRef.current;
    const dist = Math.hypot(e.clientX-s.dragStart.x, e.clientY-s.dragStart.y);
    s.dragging=false;
    if (dist<5) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const hit = getPlanetAt(e.clientX-rect.left, e.clientY-rect.top);
      if (hit) onPlanetClick?.(hit);
    }
  }, [getPlanetAt, onPlanetClick]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    s.zoom = Math.max(0.25, Math.min(3.5, s.zoom*(e.deltaY>0?0.92:1.08)));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display:'block', width:'100%', cursor:'grab' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

export default GalaxyCanvas;
