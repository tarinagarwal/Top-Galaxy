import React, { useEffect, useRef } from 'react';
import SectionHeader from '../SectionHeader';

const orbitNodes = [
  { icon: '🚀', label: '8× WIN', color: '#FFD700' },
  { icon: '⭐', label: 'REFERRAL', color: '#00FFFF' },
  { icon: '🏅', label: 'WIN REF', color: '#FF2D78' },
  { icon: '🛡️', label: 'CASHBACK', color: '#00FF88' },
  { icon: '🔄', label: 'ROI²', color: '#B44FFF' },
  { icon: '🏢', label: 'CLUB', color: '#F59E0B' },
  { icon: '🎰', label: 'JACKPOT', color: '#1E90FF' },
];

const incomeItems = [
  {
    num: 1,
    tag: 'ACTIVE',
    title: 'Winners 8× Profit',
    icon: '🚀',
    color: '#FFD700',
    border: 'rgba(255,215,0,0.2)',
    bg: 'rgba(255,215,0,0.04)',
    desc: 'Win and multiply your entry by 8×. The core game mechanic that powers the entire ecosystem.',
  },
  {
    num: 2,
    tag: 'ACTIVE',
    title: 'Direct Referral Level Income',
    icon: '⭐',
    color: '#00FFFF',
    border: 'rgba(0,255,255,0.2)',
    bg: 'rgba(0,255,255,0.04)',
    desc: 'Earn commissions on every deposit made by your downline — up to 15 levels deep. L1=5%, L2=2%, L3-5=1%, L6-15=0.5% of each deposit.',
  },
  {
    num: 3,
    tag: 'ACTIVE',
    title: 'Winners Referral Income',
    icon: '🏅',
    color: '#FF2D78',
    border: 'rgba(255,45,120,0.2)',
    bg: 'rgba(255,45,120,0.04)',
    desc: 'When a downline wins, percentages are applied directly to their bet amount. On a $100 bet: L1=$5, L2=$2, L3-5=$1 each, L6-15=$0.50 each — $15 total across 15 uplines.',
  },
  {
    num: 4,
    tag: 'PASSIVE',
    title: 'Losers Cashback Protection',
    icon: '🛡️',
    color: '#00FF88',
    border: 'rgba(0,255,136,0.2)',
    bg: 'rgba(0,255,136,0.04)',
    desc: 'Every non-winner receives 0.5% daily cashback on losses. Your capital is never truly lost — it orbits back.',
  },
  {
    num: 5,
    tag: 'PASSIVE',
    title: 'ROI on ROI Cascade',
    icon: '🔄',
    color: '#B44FFF',
    border: 'rgba(180,79,255,0.2)',
    bg: 'rgba(180,79,255,0.04)',
    desc: 'Earn 50% of your downline\'s cashback through 15 levels. Passive income that compounds through the network.',
  },
  {
    num: 6,
    tag: 'ECOSYSTEM',
    title: 'Club Income — Leadership Share',
    icon: '🏢',
    color: '#F59E0B',
    border: 'rgba(245,158,11,0.2)',
    bg: 'rgba(245,158,11,0.04)',
    desc: 'Top leaders share in ecosystem-wide profits. Achieve club rank and unlock monthly leadership dividends.',
  },
  {
    num: 7,
    tag: 'JACKPOT',
    title: 'Lucky Draw Jackpot',
    icon: '🎰',
    color: '#1E90FF',
    border: 'rgba(30,144,255,0.2)',
    bg: 'rgba(30,144,255,0.04)',
    desc: 'Auto-funded daily jackpot draws. 1 in 10 players win big — Golden and Silver prize pools.',
  },
];

function OrbitCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let startTime = Date.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const cx = w / 2;
      const cy = h / 2;
      const elapsed = (Date.now() - startTime) / 1000;
      const radius = Math.min(cx, cy) * 0.65;

      ctx.clearRect(0, 0, w, h);

      // Orbit ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
      coreGrad.addColorStop(0, 'rgba(255,215,0,0.25)');
      coreGrad.addColorStop(0.6, 'rgba(255,165,0,0.08)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Center text
      ctx.fillStyle = '#FFD700';
      ctx.font = "bold 8px 'Orbitron', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOP', cx, cy - 6);
      ctx.fillText('GALAXY', cx, cy + 6);

      // Nodes
      orbitNodes.forEach((node, i) => {
        const angle = ((Math.PI * 2) / orbitNodes.length) * i + elapsed * 0.15;
        const nx = cx + Math.cos(angle) * radius;
        const ny = cy + Math.sin(angle) * radius;

        // Line to center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = node.color + '18';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node glow
        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 22);
        glow.addColorStop(0, node.color + '30');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(nx, ny, 22, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '1A';
        ctx.strokeStyle = node.color + '55';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, nx, ny);

        // Label
        ctx.fillStyle = node.color;
        ctx.font = "bold 7px 'Orbitron', monospace";
        ctx.fillText(node.label, nx, ny + 24);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full mx-auto mb-14 reveal"
      style={{ height: 380, maxWidth: 480, display: 'block' }}
    />
  );
}

function TagBadge({ tag, color }) {
  return (
    <span
      className="font-orbitron text-[0.45rem] tracking-[0.2em] uppercase px-2 py-[2px] rounded-full"
      style={{
        color,
        border: `1px solid ${color}44`,
        background: `${color}0D`,
      }}
    >
      {tag}
    </span>
  );
}

export default function IncomesSection() {
  return (
    <section id="incomes" className="relative px-6 pb-20 max-w-[1200px] mx-auto">
      {/* Divider */}
      <div className="divider-line" />

      {/* Header */}
      <SectionHeader
        eyebrow="💰 COMPLETE INCOME ECOSYSTEM"
        eyebrowColor="pink"
        title="7 Galaxy Income Streams"
        titleClass="text-pink"
      />

      {/* Orbit Canvas */}
      <OrbitCanvas />

      {/* Income Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 reveal">
        {incomeItems.map((item) => (
          <div
            key={item.num}
            className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] flex flex-col"
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              boxShadow: `0 0 25px ${item.color}0A`,
            }}
          >
            <div className="shimmer-overlay" />

            {/* Top row: number + tag */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-orbitron text-[0.55rem] tracking-[0.15em] uppercase"
                style={{ color: `${item.color}88` }}
              >
                Income {item.num}
              </span>
              <TagBadge tag={item.tag} color={item.color} />
            </div>

            {/* Icon */}
            <div
              className="text-[2rem] mb-3 w-[52px] h-[52px] rounded-xl flex items-center justify-center"
              style={{
                background: `${item.color}0D`,
                border: `1px solid ${item.color}22`,
              }}
            >
              {item.icon}
            </div>

            {/* Title */}
            <h3
              className="font-orbitron text-[0.8rem] font-bold tracking-[0.05em] mb-2 leading-tight"
              style={{ color: item.color }}
            >
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-[0.72rem] text-white/35 leading-[1.7] mt-auto font-chakra">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
