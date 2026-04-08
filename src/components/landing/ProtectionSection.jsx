import React from 'react';
import SectionHeader from '../SectionHeader';

const phases = [
  {
    icon: '🌱',
    label: 'Phase 1',
    range: '≤ 10,000 Users',
    rate: '0.50%',
    tagline: 'DAILY AUTO CASHBACK',
    accent: 'gold',
    color: 'var(--color-gold)',
    borderColor: 'rgba(255,215,0,0.15)',
    bgColor: 'rgba(255,215,0,0.03)',
    glowColor: 'rgba(255,215,0,0.06)',
  },
  {
    icon: '🌿',
    label: 'Phase 2',
    range: '10,001 – 1 Lakh Users',
    rate: '0.40%',
    tagline: 'DAILY AUTO CASHBACK',
    accent: 'green',
    color: 'var(--color-green)',
    borderColor: 'rgba(0,255,136,0.15)',
    bgColor: 'rgba(0,255,136,0.03)',
    glowColor: 'rgba(0,255,136,0.06)',
  },
  {
    icon: '🌳',
    label: 'Phase 3',
    range: 'After 1 Lakh Users',
    rate: '0.33%',
    tagline: 'DAILY AUTO CASHBACK',
    accent: 'cyan',
    color: 'var(--color-cyan)',
    borderColor: 'rgba(0,255,255,0.15)',
    bgColor: 'rgba(0,255,255,0.03)',
    glowColor: 'rgba(0,255,255,0.06)',
  },
];

const boosts = [
  {
    tier: '1×',
    label: 'Base',
    percentage: '100%',
    refs: '0 Referrals',
    accent: 'gold',
    color: 'var(--color-gold)',
    borderColor: 'rgba(255,215,0,0.18)',
    bgColor: 'rgba(255,215,0,0.03)',
    glowColor: 'rgba(255,215,0,0.08)',
  },
  {
    tier: '2×',
    label: 'Silver',
    percentage: '200%',
    refs: '5 Referrals',
    accent: 'green',
    color: 'var(--color-green)',
    borderColor: 'rgba(0,255,136,0.18)',
    bgColor: 'rgba(0,255,136,0.03)',
    glowColor: 'rgba(0,255,136,0.08)',
  },
  {
    tier: '4×',
    label: 'Gold',
    percentage: '400%',
    refs: '10 Referrals',
    accent: 'cyan',
    color: 'var(--color-cyan)',
    borderColor: 'rgba(0,255,255,0.18)',
    bgColor: 'rgba(0,255,255,0.03)',
    glowColor: 'rgba(0,255,255,0.08)',
  },
  {
    tier: '8×',
    label: 'Diamond',
    percentage: '800%',
    refs: '20 Referrals',
    accent: 'pink',
    color: 'var(--color-pink)',
    borderColor: 'rgba(255,45,120,0.18)',
    bgColor: 'rgba(255,45,120,0.03)',
    glowColor: 'rgba(255,45,120,0.08)',
  },
];

export default function ProtectionSection() {
  return (
    <section id="protection" className="relative px-6 pb-20">
      {/* Divider */}
      <div className="divider-line" />

      {/* Section Header */}
      <SectionHeader
        eyebrow="🛡️ NO-LOSS ARCHITECTURE"
        eyebrowColor="green"
        title="Shields = Cashback Protection"
        titleClass="text-gradient-green"
        description="Every USDT you deposit is protected by our daily auto-cashback system. Even if the stars don't align, your balance recovers automatically — no claims, no hassle."
      />

      {/* Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[900px] mx-auto mb-16">
        {phases.map((phase) => (
          <div
            key={phase.label}
            className="relative rounded-2xl overflow-hidden p-7 text-center transition-all duration-300 hover:-translate-y-[4px]"
            style={{
              background: phase.bgColor,
              border: `1px solid ${phase.borderColor}`,
              boxShadow: `0 0 35px ${phase.glowColor}`,
            }}
          >
            <div className="shimmer-overlay" />

            {/* Icon */}
            <div
              className="text-[2.4rem] mb-4"
              style={{ animation: 'float 3.5s ease-in-out infinite' }}
            >
              {phase.icon}
            </div>

            {/* Phase Label */}
            <div
              className="font-orbitron text-[0.55rem] tracking-[0.25em] uppercase mb-1"
              style={{ color: phase.color, opacity: 0.8 }}
            >
              {phase.label}
            </div>

            {/* User Range */}
            <div className="font-orbitron text-[0.45rem] tracking-[0.15em] text-white/30 uppercase mb-5">
              {phase.range}
            </div>

            {/* Rate */}
            <div
              className="font-orbitron font-black leading-none mb-2"
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                color: phase.color,
                textShadow: `0 0 30px ${phase.glowColor}`,
              }}
            >
              {phase.rate}
            </div>

            {/* Tagline */}
            <div
              className="font-orbitron text-[0.42rem] tracking-[0.22em] uppercase mt-3"
              style={{ color: phase.color, opacity: 0.5 }}
            >
              {phase.tagline}
            </div>
          </div>
        ))}
      </div>

      {/* Referral Boost Eyebrow */}
      <div className="text-center mb-8">
        <div className="eyebrow border border-gold text-gold bg-[rgba(255,215,0,0.06)] inline-flex">
          REFERRAL BOOST
        </div>
      </div>

      {/* Boost Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-[900px] mx-auto">
        {boosts.map((boost) => (
          <div
            key={boost.tier}
            className="relative rounded-2xl overflow-hidden p-6 text-center transition-all duration-300 hover:-translate-y-[4px] hover:scale-[1.02] group"
            style={{
              background: boost.bgColor,
              border: `1px solid ${boost.borderColor}`,
              boxShadow: `0 0 30px ${boost.glowColor}`,
            }}
          >
            {/* Shimmer overlay */}
            <div className="shimmer-overlay" />

            {/* Tier Multiplier */}
            <div
              className="font-orbitron font-black leading-none mb-1"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: boost.color,
                textShadow: `0 0 25px ${boost.glowColor}`,
              }}
            >
              {boost.tier}
            </div>

            {/* Label */}
            <div
              className="font-orbitron text-[0.5rem] tracking-[0.2em] uppercase mb-4"
              style={{ color: boost.color, opacity: 0.6 }}
            >
              {boost.label}
            </div>

            {/* Percentage */}
            <div
              className="font-orbitron text-[0.75rem] font-bold tracking-[0.1em] mb-2"
              style={{ color: boost.color }}
            >
              {boost.percentage}
            </div>

            {/* Divider */}
            <div
              className="w-10 h-[1px] mx-auto mb-3"
              style={{ background: `${boost.color}33` }}
            />

            {/* Referrals Needed */}
            <div className="font-orbitron text-[0.42rem] tracking-[0.18em] text-white/35 uppercase">
              {boost.refs}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
