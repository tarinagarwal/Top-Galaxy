import React from 'react';
import SectionHeader from '../SectionHeader';

const phaseCards = [
  {
    phase: 'PHASE 1',
    subtitle: 'FIRST 10,000 USERS',
    icon: '🚀',
    multiplier: '8×',
    description: 'Maximum rewards for early adopters — your rockets carry the highest fuel.',
    splits: [
      { label: '2× Direct Wallet', color: 'var(--color-gold)', bg: 'rgba(255,215,0,0.08)' },
      { label: '6× Auto Compound', color: 'var(--color-gold2)', bg: 'rgba(255,165,0,0.08)' },
    ],
    accent: 'gold',
    borderColor: 'rgba(255,215,0,0.15)',
    bgColor: 'rgba(255,215,0,0.03)',
    glowColor: 'rgba(255,215,0,0.06)',
  },
  {
    phase: 'PHASE 2',
    subtitle: 'AFTER 10,000 USERS',
    icon: '🛸',
    multiplier: '4×',
    description: 'Sustainable growth rewards — balanced for long-term galactic expansion.',
    splits: [
      { label: '2× Direct Wallet', color: 'var(--color-cyan)', bg: 'rgba(0,255,255,0.08)' },
      { label: '2× Auto Compound', color: 'var(--color-blue)', bg: 'rgba(30,144,255,0.08)' },
    ],
    accent: 'cyan',
    borderColor: 'rgba(0,255,255,0.15)',
    bgColor: 'rgba(0,255,255,0.03)',
    glowColor: 'rgba(0,255,255,0.06)',
  },
];

const stats = [
  { value: '24', label: 'Games / Day', color: 'var(--color-gold)' },
  { value: '1 HR', label: 'Per Round', color: 'var(--color-cyan)' },
  { value: '2 MIN', label: 'Cutoff', color: 'var(--color-pink)' },
  { value: '1 USDT', label: 'Min Entry', color: 'var(--color-green)' },
];

export default function WinnersSection() {
  return (
    <section id="winners" className="relative px-6 pb-20">
      {/* Divider */}
      <div className="divider-line" />

      {/* Section Header */}
      <SectionHeader
        eyebrow="🚀 VICTORY REWARDS"
        eyebrowColor="gold"
        title="Rockets = Winnings"
        titleClass="text-gradient-gold-simple"
        description="Match the winning planet to launch your rockets. The higher the phase, the bigger your blast — every win multiplies your entry across Direct Wallet and Auto Compound streams."
      />

      {/* Phase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[960px] mx-auto mb-14">
        {phaseCards.map((card) => (
          <div
            key={card.phase}
            className="relative rounded-2xl overflow-hidden p-8 transition-all duration-300 hover:-translate-y-[4px]"
            style={{
              background: card.bgColor,
              border: `1px solid ${card.borderColor}`,
              boxShadow: `0 0 40px ${card.glowColor}`,
            }}
          >
            {/* Shimmer */}
            <div className="shimmer-overlay" />

            {/* Icon with float animation */}
            <div
              className="text-[3rem] mb-4 inline-block"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              {card.icon}
            </div>

            {/* Phase Label */}
            <div
              className="font-orbitron text-[0.55rem] tracking-[0.3em] uppercase mb-1"
              style={{ color: `var(--color-${card.accent})`, opacity: 0.7 }}
            >
              {card.phase}
            </div>
            <div
              className="font-orbitron text-[0.5rem] tracking-[0.2em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {card.subtitle}
            </div>

            {/* Big Multiplier */}
            <div
              className="font-orbitron font-black leading-none mb-3"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                background: card.accent === 'gold'
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'linear-gradient(135deg, #00FFFF, #1E90FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {card.multiplier}
            </div>

            {/* Description */}
            <p className="text-[0.8rem] text-white/40 leading-[1.75] mb-6 max-w-[320px]">
              {card.description}
            </p>

            {/* Split Visualization */}
            <div className="flex flex-col gap-3">
              {card.splits.map((split) => (
                <div
                  key={split.label}
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: split.bg,
                    border: `1px solid ${split.color}22`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: split.color,
                      boxShadow: `0 0 8px ${split.color}`,
                    }}
                  />
                  <span
                    className="font-orbitron text-[0.6rem] tracking-[0.15em] uppercase"
                    style={{ color: split.color }}
                  >
                    {split.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Band */}
      <div className="flex flex-wrap justify-center gap-4 max-w-[820px] mx-auto">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative flex-1 min-w-[160px] rounded-xl px-5 py-5 text-center overflow-hidden transition-all duration-300 hover:-translate-y-[3px]"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="shimmer-overlay" />
            <div
              className="font-orbitron text-[1.4rem] font-black mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="font-orbitron text-[0.45rem] tracking-[0.2em] text-white/35 uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
