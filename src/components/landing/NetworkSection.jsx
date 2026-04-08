import React, { useRef, useEffect } from 'react';
import SectionHeader from '../SectionHeader';

const levels = [
  {
    level: 'Level 1',
    percentage: '5%',
    description: 'Earn from every player you personally invite into the galaxy.',
    type: 'Direct Referral',
    color: 'var(--color-gold)',
    borderColor: 'rgba(255,215,0,0.18)',
    bgColor: 'rgba(255,215,0,0.03)',
    glowColor: 'rgba(255,215,0,0.08)',
    typeColor: 'rgba(255,215,0,0.15)',
    typeBg: 'rgba(255,215,0,0.06)',
  },
  {
    level: 'Level 2',
    percentage: '2%',
    description: 'Passive income from your direct referrals\u2019 network activity.',
    type: 'Team Network',
    color: 'var(--color-green)',
    borderColor: 'rgba(0,255,136,0.18)',
    bgColor: 'rgba(0,255,136,0.03)',
    glowColor: 'rgba(0,255,136,0.08)',
    typeColor: 'rgba(0,255,136,0.15)',
    typeBg: 'rgba(0,255,136,0.06)',
  },
  {
    level: 'Levels 3\u20135',
    percentage: '1%',
    description: 'Reach deeper into your growing constellation of players.',
    type: 'Deep Network',
    color: 'var(--color-cyan)',
    borderColor: 'rgba(0,255,255,0.18)',
    bgColor: 'rgba(0,255,255,0.03)',
    glowColor: 'rgba(0,255,255,0.08)',
    typeColor: 'rgba(0,255,255,0.15)',
    typeBg: 'rgba(0,255,255,0.06)',
  },
  {
    level: 'Levels 6\u201315',
    percentage: '0.5%',
    description: 'Lifetime earnings from the deepest reaches of your galaxy empire.',
    type: 'Galaxy Depth',
    color: 'var(--color-purple)',
    borderColor: 'rgba(180,79,255,0.18)',
    bgColor: 'rgba(180,79,255,0.03)',
    glowColor: 'rgba(180,79,255,0.08)',
    typeColor: 'rgba(180,79,255,0.15)',
    typeBg: 'rgba(180,79,255,0.06)',
  },
];

/* ---------- Canvas: animated network visualization ---------- */
function drawNetwork(ctx, w, h, time) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scale = Math.min(w, h) / 420;

  // ---- helper: draw node ----
  const drawNode = (x, y, r, color, label, glowAlpha) => {
    // Pulsing glow
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + x * 0.01);
    ctx.beginPath();
    ctx.arc(x, y, r + 6 * pulse, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r + 8);
    grad.addColorStop(0, color.replace(')', `,${0.35 * glowAlpha})`).replace('rgb', 'rgba'));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    // Solid node
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', ',0.15)').replace('rgb', 'rgba');
    ctx.strokeStyle = color.replace(')', ',0.5)').replace('rgb', 'rgba');
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // Label
    if (label) {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.round(r * 0.7)}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    }
  };

  // ---- helper: draw dashed connection ----
  const drawConnection = (x1, y1, x2, y2, color) => {
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -time * 0.03;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color.replace(')', ',0.2)').replace('rgb', 'rgba');
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // ---- nodes layout ----
  const goldRgb = 'rgb(255,215,0)';
  const cyanRgb = 'rgb(0,255,255)';
  const purpleRgb = 'rgb(180,79,255)';

  // Root node (TG)
  const rootR = 22 * scale;
  drawNode(cx, cy, rootR, goldRgb, 'TG', 1);

  // L1 nodes — 6 around the root
  const l1Radius = 95 * scale;
  const l1R = 13 * scale;
  const l1Nodes = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const x = cx + Math.cos(angle) * l1Radius;
    const y = cy + Math.sin(angle) * l1Radius;
    l1Nodes.push({ x, y });
    drawConnection(cx, cy, x, y, goldRgb);
    drawNode(x, y, l1R, cyanRgb, `L1`, 0.7);
  }

  // L2 nodes — 3 around each L1
  const l2Radius = 50 * scale;
  const l2R = 8 * scale;
  l1Nodes.forEach((parent, pi) => {
    const baseAngle = (Math.PI * 2 * pi) / 6 - Math.PI / 2;
    for (let j = 0; j < 3; j++) {
      const spread = ((j - 1) * Math.PI) / 4;
      const angle = baseAngle + spread;
      const x = parent.x + Math.cos(angle) * l2Radius;
      const y = parent.y + Math.sin(angle) * l2Radius;
      drawConnection(parent.x, parent.y, x, y, cyanRgb);
      drawNode(x, y, l2R, purpleRgb, '', 0.4);
    }
  });
}

function NetworkCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (t) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      drawNetwork(ctx, rect.width, rect.height, t);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

/* ---------- Main section ---------- */
export default function NetworkSection() {
  return (
    <section id="network" className="relative px-6 pb-20">
      {/* Divider */}
      <div className="divider-line" />

      {/* Section Header */}
      <SectionHeader
        eyebrow="⭐ CONSTELLATION NETWORK"
        eyebrowColor="gold"
        title="Stars = Referral Network"
        titleClass="text-gradient-gold-simple"
        description="Build your constellation across 15 levels of depth. Every star you connect strengthens the network and generates lifetime passive income flowing back to you."
      />

      {/* Network Visualization */}
      <div
        className="relative max-w-[700px] mx-auto mb-14 rounded-2xl overflow-hidden"
        style={{
          height: 380,
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 60px rgba(255,215,0,0.04)',
        }}
      >
        <div className="shimmer-overlay" />
        <NetworkCanvas />
      </div>

      {/* Referral Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[960px] mx-auto">
        {levels.map((lvl) => (
          <div
            key={lvl.level}
            className="relative rounded-2xl overflow-hidden p-7 text-center transition-all duration-300 hover:-translate-y-[4px]"
            style={{
              background: lvl.bgColor,
              border: `1px solid ${lvl.borderColor}`,
              boxShadow: `0 0 30px ${lvl.glowColor}`,
            }}
          >
            <div className="shimmer-overlay" />

            {/* Level Label */}
            <div
              className="font-orbitron text-[0.5rem] tracking-[0.25em] uppercase mb-4"
              style={{ color: lvl.color, opacity: 0.7 }}
            >
              {lvl.level}
            </div>

            {/* Big Percentage */}
            <div
              className="font-orbitron font-black leading-none mb-3"
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
                color: lvl.color,
                textShadow: `0 0 25px ${lvl.glowColor}`,
              }}
            >
              {lvl.percentage}
            </div>

            {/* Description */}
            <p className="text-[0.72rem] text-white/35 leading-[1.75] mb-5 min-h-[50px]">
              {lvl.description}
            </p>

            {/* Type Badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: lvl.typeBg,
                border: `1px solid ${lvl.typeColor}`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: lvl.color,
                  boxShadow: `0 0 6px ${lvl.color}`,
                }}
              />
              <span
                className="font-orbitron text-[0.4rem] tracking-[0.2em] uppercase"
                style={{ color: lvl.color }}
              >
                {lvl.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
