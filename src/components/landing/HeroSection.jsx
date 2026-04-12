import React from 'react';
import SocialLinks from '../SocialLinks';

const ringStyles = [
  {
    width: 220, height: 220,
    border: '1px solid rgba(255,215,0,0.12)',
    animation: 'spin 18s linear infinite',
  },
  {
    width: 270, height: 270,
    border: '1px solid rgba(0,255,255,0.08)',
    animation: 'spin 26s linear infinite reverse',
  },
  {
    width: 310, height: 310,
    border: '1px solid rgba(180,79,255,0.07)',
    animation: 'spin 34s linear infinite',
  },
  {
    width: 350, height: 350,
    border: '1px solid rgba(255,45,120,0.05)',
    animation: 'spin 42s linear infinite reverse',
  },
];

const orbs = [
  { color: '#B44FFF', shadow: 'rgba(180,79,255,0.7)', animation: 'orbit1 8s linear infinite' },
  { color: '#00FF88', shadow: 'rgba(0,255,136,0.7)', animation: 'orbit2 11s linear infinite' },
  { color: '#FF2D78', shadow: 'rgba(255,45,120,0.7)', animation: 'orbit3 14s linear infinite' },
];

const metrics = [
  { value: '100', label: 'Free USDT Bonus', color: 'var(--color-gold)', borderColor: 'rgba(255,215,0,0.15)', bgColor: 'rgba(255,215,0,0.04)' },
  { value: '8×', label: 'Win Multiplier', color: 'var(--color-green)', borderColor: 'rgba(0,255,136,0.15)', bgColor: 'rgba(0,255,136,0.04)' },
  { value: '7', label: 'Income Streams', color: 'var(--color-cyan)', borderColor: 'rgba(0,255,255,0.15)', bgColor: 'rgba(0,255,255,0.04)' },
  { value: '0.5%', label: 'Daily Cashback', color: 'var(--color-pink)', borderColor: 'rgba(255,45,120,0.15)', bgColor: 'rgba(255,45,120,0.04)' },
  { value: '24/7', label: 'Auto Contracts', color: 'var(--color-purple)', borderColor: 'rgba(180,79,255,0.15)', bgColor: 'rgba(180,79,255,0.04)' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-[110px] pb-[80px] px-6 overflow-hidden">
      {/* Galaxy Rings Container */}
      <div className="relative w-[260px] h-[260px] mx-auto mb-10 flex items-center justify-center">
        {/* Spinning Rings */}
        {ringStyles.map((style, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: style.width,
              height: style.height,
              border: style.border,
              animation: style.animation,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Orbiting Orbs */}
        {orbs.map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: 18,
              height: 18,
              background: orb.color,
              boxShadow: `0 0 12px ${orb.shadow}`,
              animation: orb.animation,
              top: '50%',
              left: '50%',
            }}
          />
        ))}

        {/* Central Core Sphere */}
        <div
          className="relative z-10 w-[130px] h-[130px] rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.18) 0%, rgba(255,165,0,0.08) 50%, transparent 70%)',
            boxShadow: '0 0 60px rgba(255,215,0,0.15), inset 0 0 40px rgba(255,215,0,0.08)',
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <span
            className="font-orbitron text-[0.65rem] font-black tracking-[0.25em] leading-[1.4] text-center"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TOP
            <br />
            GALAXY
          </span>
        </div>
      </div>

      {/* Eyebrow */}
      <div className="eyebrow border border-gold text-gold bg-[rgba(255,215,0,0.06)] mb-5">
        ⛓ Binance Smart Chain — BEP-20 Ecosystem
      </div>

      {/* Hero Title */}
      <h1
        className="text-gradient-gold font-russo text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] mb-4"
        style={{ animation: 'fadeup 1s ease forwards' }}
      >
        TOP GALAXY
      </h1>

      {/* Subtitle */}
      <p
        className="font-chakra text-[clamp(0.85rem,2vw,1.15rem)] text-white/50 tracking-[0.18em] mb-6"
        style={{ animation: 'fadeup 1s ease 0.15s both' }}
      >
        Real Cash Blockchain Game Ecosystem
      </p>

      {/* Badge */}
      <div
        className="eyebrow border border-[rgba(255,215,0,0.15)] text-white/45 bg-[rgba(255,215,0,0.04)] mb-6"
        style={{ animation: 'fadeup 1s ease 0.3s both' }}
      >
        ® Play Smart • Earn Sustainably • Win Forever
      </div>

      {/* Slogan */}
      <p
        className="text-[0.78rem] text-white/30 max-w-[560px] leading-[1.85] mb-10"
        style={{ animation: 'fadeup 1s ease 0.45s both' }}
      >
        The World's First Sustainable No-Loss Blockchain Gaming Ecosystem
      </p>

      {/* Metric Cards */}
      <div
        className="flex flex-wrap justify-center gap-4 max-w-[820px] mb-10"
        style={{ animation: 'fadeup 1s ease 0.6s both' }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            className="relative rounded-xl px-5 py-4 min-w-[140px] flex-1 text-center overflow-hidden transition-all duration-300 hover:-translate-y-[3px]"
            style={{
              background: m.bgColor,
              border: `1px solid ${m.borderColor}`,
            }}
          >
            <div className="shimmer-overlay" />
            <div
              className="font-orbitron text-[1.5rem] font-black mb-1"
              style={{ color: m.color }}
            >
              {m.value}
            </div>
            <div className="font-orbitron text-[0.5rem] tracking-[0.15em] text-white/40 uppercase">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <div
        className="flex flex-wrap justify-center gap-3"
        style={{ animation: 'fadeup 1s ease 0.75s both' }}
      >
        <a
          href="/register"
          className="px-8 py-3.5 rounded-[30px] font-orbitron text-[0.7rem] font-bold tracking-[0.12em] text-black cursor-pointer border-none transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,215,0,0.5)] hover:-translate-y-[3px] inline-block no-underline"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          }}
        >
          🚀 CONNECT WALLET & START
        </a>
        <a
          href="#incomes"
          className="px-8 py-3.5 rounded-[30px] font-orbitron text-[0.7rem] font-bold tracking-[0.12em] cursor-pointer bg-transparent transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:-translate-y-[3px] inline-block no-underline"
          style={{
            border: '1px solid rgba(0,255,255,0.4)',
            color: 'var(--color-cyan)',
          }}
        >
          ↓ EXPLORE FEATURES
        </a>
      </div>

      {/* Social Links */}
      <div style={{ animation: 'fadeup 1s ease 0.9s both' }}>
        <SocialLinks size="lg" className="mt-8" />
      </div>
    </section>
  );
}
