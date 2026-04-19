import React, { useRef, useEffect, useCallback, useState } from 'react';

const LANG_COLORS = {
  JavaScript: '#f5c842', TypeScript: '#4287f5', Python: '#3bb8a8',
  Go: '#00c4e0', Rust: '#e8763a', Java: '#e84c3d', Ruby: '#cc3366',
  'C++': '#a855f7', C: '#94a3b8', Swift: '#f97316', Kotlin: '#8b5cf6',
  Dart: '#00b4ab', HTML: '#ef4444', CSS: '#3b82f6', Shell: '#22c55e',
  Vue: '#22c55e', PHP: '#8892b0', default: '#4a6fa5',
};

function getPlanetType(p) {
  if (p.isArchived) return 'archived';
  if (p.isFork) return 'forked';
  if (p.hasDeployment || p.homepage) return 'deployed';
  return 'active';
}

// Realistic planet surface textures via layered canvas draws
function drawRealisticPlanet(ctx, px, py, pr, color, type, tick) {
  const hex = color;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);

  // Atmosphere glow (outermost)
  const atmo = ctx.createRadialGradient(px, py, pr * 0.7, px, py, pr * 2.2);
  atmo.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
  atmo.addColorStop(0.5, `rgba(${r},${g},${b},0.06)`);
  atmo.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.beginPath(); ctx.arc(px, py, pr * 2.2, 0, Math.PI * 2);
  ctx.fillStyle = atmo; ctx.fill();

  // Planet body — deep sphere shading
  const sphere = ctx.createRadialGradient(
    px - pr * 0.38, py - pr * 0.38, pr * 0.01,
    px + pr * 0.1, py + pr * 0.1, pr * 1.15
  );
  sphere.addColorStop(0, `rgba(${Math.min(r+120,255)},${Math.min(g+120,255)},${Math.min(b+120,255)},1)`);
  sphere.addColorStop(0.25, `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},1)`);
  sphere.addColorStop(0.6, `rgba(${r},${g},${b},1)`);
  sphere.addColorStop(0.85, `rgba(${Math.max(r-50,0)},${Math.max(g-50,0)},${Math.max(b-50,0)},1)`);
  sphere.addColorStop(1, `rgba(${Math.max(r-90,0)},${Math.max(g-90,0)},${Math.max(b-90,0)},1)`);

  ctx.save();
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = sphere; ctx.fill();

  // Surface bands / cloud stripes (clip to planet)
  ctx.clip();
  const bandCount = Math.min(3, Math.floor(pr / 6));
  for (let i = 0; i < bandCount; i++) {
    const bandY = py - pr * 0.5 + (i / bandCount) * pr * 1.0;
    const bandAlpha = 0.06 + Math.sin(tick * 0.001 + i) * 0.02;
    ctx.beginPath();
    ctx.ellipse(px, bandY, pr * 0.95, pr * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(r+80,255)},${Math.min(g+80,255)},${Math.min(b+80,255)},${bandAlpha})`;
    ctx.fill();
  }

  // Specular highlight (top-left shine)
  const shine = ctx.createRadialGradient(
    px - pr * 0.42, py - pr * 0.42, 0,
    px - pr * 0.2, py - pr * 0.2, pr * 0.65
  );
  shine.addColorStop(0, 'rgba(255,255,255,0.28)');
  shine.addColorStop(0.4, 'rgba(255,255,255,0.08)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = shine; ctx.fill();

  // Dark limb shadow (right-bottom edge)
  const limb = ctx.createRadialGradient(px + pr*0.3, py + pr*0.3, pr*0.4, px, py, pr*1.05);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(0.6, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = limb; ctx.fill();

  ctx.restore();
}

const GalaxyCanvas = ({ planets, onPlanetClick, onPlanetHover }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    stars: [], nebulae: [], animFrame: 0, tick: 0,
    hoveredId: null, offset: { x: 0, y: 0 }, zoom: 1,
    dragging: false, dragStart: { x: 0, y: 0 }, dragOffset: { x: 0, y: 0 },
  });
  const [size, setSize] = useState({ w: 800, h: 600 });

  const initStatics = useCallback((w, h) => {
    const s = stateRef.current;
    // Layered stars — small dim ones and brighter larger ones
    s.stars = [
      ...Array.from({ length: 500 }, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: 0.4 + Math.random()*0.8, alpha: 0.1 + Math.random()*0.4,
        sp: 0.005 + Math.random()*0.015, off: Math.random()*Math.PI*2, type: 'dim'
      })),
      ...Array.from({ length: 80 }, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: 0.8 + Math.random()*1.6, alpha: 0.4 + Math.random()*0.5,
        sp: 0.003 + Math.random()*0.01, off: Math.random()*Math.PI*2, type: 'bright'
      })),
    ];
    // Blue nebula clouds
    s.nebulae = Array.from({ length: 4 }, (_, i) => ({
      x: w * (0.15 + Math.random() * 0.7),
      y: h * (0.15 + Math.random() * 0.7),
      rx: 80 + Math.random() * 160, ry: 40 + Math.random() * 80,
      rot: Math.random() * Math.PI,
      alpha: 0.012 + Math.random() * 0.022,
      hue: [200, 220, 195, 210][i],
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
    const cx = w / 2 + s.offset.x;
    const cy = h / 2 + s.offset.y;

    // Deep space background
    ctx.fillStyle = '#010818';
    ctx.fillRect(0, 0, w, h);

    // Blue nebula clouds
    for (const n of s.nebulae) {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
      grad.addColorStop(0, `hsla(${n.hue},90%,55%,${n.alpha * 1.8})`);
      grad.addColorStop(0.4, `hsla(${n.hue},80%,40%,${n.alpha})`);
      grad.addColorStop(1, `hsla(${n.hue},70%,30%,0)`);
      ctx.save();
      ctx.translate(n.x, n.y); ctx.rotate(n.rot);
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath(); ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.restore();
    }

    // Stars
    for (const st of s.stars) {
      const a = st.alpha * (0.6 + 0.4 * Math.sin(tick * st.sp + st.off));
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      if (st.type === 'bright') {
        ctx.fillStyle = `rgba(180,220,255,${a})`;
      } else {
        ctx.fillStyle = `rgba(140,180,220,${a})`;
      }
      ctx.fill();
      // Cross flare on brightest stars
      if (st.r > 1.8 && a > 0.6) {
        ctx.strokeStyle = `rgba(180,220,255,${a * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(st.x - 4, st.y); ctx.lineTo(st.x + 4, st.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(st.x, st.y - 4); ctx.lineTo(st.x, st.y + 4); ctx.stroke();
      }
    }

    // Galaxy core blue glow
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * s.zoom);
    core.addColorStop(0, 'rgba(0,180,255,0.15)');
    core.addColorStop(0.4, 'rgba(0,100,200,0.06)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core; ctx.fillRect(0, 0, w, h);

    // Sort planets by Y for depth (farther back = smaller draw)
    const sorted = [...planets].sort((a, b) => {
      const angA = (a.orbitAngle||0) + tick*(a.orbitSpeed||0.0004);
      const angB = (b.orbitAngle||0) + tick*(b.orbitSpeed||0.0004);
      return Math.sin(angA) - Math.sin(angB);
    });

    for (const p of sorted) {
      const type = getPlanetType(p);
      const color = LANG_COLORS[p.language] || LANG_COLORS.default;
      const isHovered = stateRef.current.hoveredId === p._id;
      const angle = (p.orbitAngle || 0) + tick * (p.orbitSpeed || 0.0004);
      const orbitR = (p.orbitRadius || 150) * s.zoom;
      const depthScale = 0.7 + 0.3 * ((Math.sin(angle) + 1) / 2); // depth illusion
      const px2 = cx + Math.cos(angle) * orbitR;
      const py2 = cy + Math.sin(angle) * orbitR * 0.36;
      const pr2 = (p.planetSize || 14) * depthScale * s.zoom * (isHovered ? 1.08 : 1);

      // Orbit path (very faint blue ellipse)
      const hex = color;
      const rr=parseInt(hex.slice(1,3),16), gg=parseInt(hex.slice(3,5),16), bb=parseInt(hex.slice(5,7),16);
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitR, orbitR * 0.36, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rr},${gg},${bb},${isHovered ? 0.12 : 0.04})`;
      ctx.lineWidth = isHovered ? 1 : 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Saturn-style ring for deployed planets
      if (type === 'deployed') {
        ctx.save();
        ctx.translate(px2, py2);
        ctx.rotate(-0.22);
        // Ring shadow back half
        ctx.beginPath();
        ctx.ellipse(0, 0, pr2 * 2.1, pr2 * 0.55, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.18)`;
        ctx.lineWidth = pr2 * 0.28;
        ctx.stroke();
        ctx.restore();
      }

      // Draw realistic planet
      drawRealisticPlanet(ctx, px2, py2, pr2, color, type, tick);

      // Ring front half for deployed (drawn after planet body)
      if (type === 'deployed') {
        ctx.save();
        ctx.translate(px2, py2);
        ctx.rotate(-0.22);
        ctx.beginPath();
        ctx.ellipse(0, 0, pr2 * 2.1, pr2 * 0.55, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.55)`;
        ctx.lineWidth = pr2 * 0.22;
        ctx.stroke();
        ctx.restore();
      }

      // Archived — dust cloud overlay
      if (type === 'archived') {
        ctx.save();
        ctx.beginPath(); ctx.arc(px2, py2, pr2 * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,80,60,0.12)'; ctx.fill();
        ctx.restore();
      }

      // Commit ring — glowing dots orbiting close
      const commitDots = Math.min(Math.round((p.commitCount || 10) / 25), 16);
      if (commitDots > 0) {
        for (let i = 0; i < commitDots; i++) {
          const da = (i / commitDots) * Math.PI * 2 + tick * 0.018;
          const dr = pr2 + 3 + pr2 * 0.15;
          const dx = px2 + Math.cos(da) * dr;
          const dy = py2 + Math.sin(da) * dr * 0.5;
          const dotA = 0.3 + 0.4 * ((i / commitDots));
          ctx.beginPath(); ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${dotA})`; ctx.fill();
        }
      }

      // Moons
      const moonCount = Math.min(p.forkCount || 0, 2);
      for (let m = 0; m < moonCount; m++) {
        const ma = tick * (0.025 - m * 0.008) + m * Math.PI;
        const md = pr2 + 10 + m * 9;
        const mx2 = px2 + Math.cos(ma) * md;
        const my2 = py2 + Math.sin(ma) * md * 0.5;
        // Moon with shading
        const mg = ctx.createRadialGradient(mx2-1.5, my2-1.5, 0, mx2, my2, 3.5);
        mg.addColorStop(0, `rgba(200,220,240,0.9)`);
        mg.addColorStop(1, `rgba(100,130,160,0.5)`);
        ctx.beginPath(); ctx.arc(mx2, my2, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = mg; ctx.fill();
      }

      // Planet name label
      ctx.font = `500 ${Math.max(9, Math.min(11, pr2 * 0.65))}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isHovered
        ? `rgba(${rr},${gg},${bb},1)`
        : `rgba(${rr},${gg},${bb},0.55)`;
      ctx.textAlign = 'center';
      const label = p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name;
      ctx.fillText(label, px2, py2 + pr2 + 14);

      // Store for hit testing
      p._screen = { x: px2, y: py2, r: pr2 };
    }

    s.animFrame = requestAnimationFrame(drawLoop);
  }, [planets, size]);

  useEffect(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.animFrame);
    s.animFrame = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(s.animFrame);
  }, [drawLoop]);

  const getPlanetAt = useCallback((ex, ey) => {
    for (const p of planets) {
      if (!p._screen) continue;
      const dx = ex - p._screen.x, dy = ey - p._screen.y;
      if (dx*dx + dy*dy <= (p._screen.r + 14)**2) return p;
    }
    return null;
  }, [planets]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const s = stateRef.current;
    if (s.dragging) {
      s.offset.x = s.dragOffset.x + (e.clientX - s.dragStart.x);
      s.offset.y = s.dragOffset.y + (e.clientY - s.dragStart.y);
      return;
    }
    const hit = getPlanetAt(mx, my);
    s.hoveredId = hit ? hit._id : null;
    canvas.style.cursor = hit ? 'pointer' : 'grab';
    onPlanetHover?.(hit || null, e.clientX, e.clientY);
  }, [getPlanetAt, onPlanetHover]);

  const handleMouseDown = useCallback((e) => {
    const s = stateRef.current;
    s.dragging = true;
    s.dragStart = { x: e.clientX, y: e.clientY };
    s.dragOffset = { x: s.offset.x, y: s.offset.y };
  }, []);

  const handleMouseUp = useCallback((e) => {
    const s = stateRef.current;
    const dist = Math.hypot(e.clientX - s.dragStart.x, e.clientY - s.dragStart.y);
    s.dragging = false;
    if (dist < 5) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const hit = getPlanetAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) onPlanetClick?.(hit);
    }
  }, [getPlanetAt, onPlanetClick]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    s.zoom = Math.max(0.25, Math.min(3.5, s.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', cursor: 'grab' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

export default GalaxyCanvas;
