import SectionHeader from '../SectionHeader';

const phases = [
  {
    phase: 1,
    label: 'NOW LIVE',
    icon: '💵',
    title: '100% USDT',
    color: '#FFD700',
    borderColor: 'rgba(255,215,0,0.35)',
    bgColor: 'rgba(255,215,0,0.06)',
    glowColor: 'rgba(255,215,0,0.15)',
    active: true,
    description: 'All transactions, rewards, and payouts are processed entirely in USDT stablecoin on Binance Smart Chain.',
  },
  {
    phase: 2,
    label: 'PHASE 2',
    icon: '🔀',
    title: 'USDT + TG Token',
    color: '#00FFFF',
    borderColor: 'rgba(0,255,255,0.15)',
    bgColor: 'rgba(0,255,255,0.03)',
    glowColor: 'rgba(0,255,255,0.08)',
    active: false,
    description: 'Top Galaxy Token launches alongside USDT. Partial rewards begin distributing in TG Token.',
  },
  {
    phase: 3,
    label: 'PHASE 3',
    icon: '⚖️',
    title: '50/50 Hybrid',
    color: '#00FF88',
    borderColor: 'rgba(0,255,136,0.15)',
    bgColor: 'rgba(0,255,136,0.03)',
    glowColor: 'rgba(0,255,136,0.08)',
    active: false,
    description: 'The ecosystem transitions to a balanced 50% USDT / 50% TG Token model for all transactions.',
  },
  {
    phase: 4,
    label: 'PHASE 4',
    icon: '🌌',
    title: '100% TG Token',
    color: '#FF2D78',
    borderColor: 'rgba(255,45,120,0.15)',
    bgColor: 'rgba(255,45,120,0.03)',
    glowColor: 'rgba(255,45,120,0.08)',
    active: false,
    description: 'Full migration to the TG Token economy. The galaxy operates entirely on its native currency.',
  },
];

export default function RoadmapSection() {
  return (
    <section className="relative px-6 pb-[80px] overflow-hidden">
      <div className="divider-line" />

      <SectionHeader
        eyebrow="🚀 TOKEN EVOLUTION"
        eyebrowColor="gold"
        title="Top Galaxy Token Roadmap"
        titleClass="text-gradient-gold-simple"
      />

      {/* Roadmap Steps */}
      <div className="relative max-w-[1000px] mx-auto">
        {/* Connecting gradient line behind the cards */}
        <div
          className="hidden sm:block absolute top-1/2 left-[8%] right-[8%] h-[2px] -translate-y-1/2 z-0"
          style={{
            background: 'linear-gradient(90deg, #FFD700, #00FFFF, #00FF88, #FF2D78)',
            opacity: 0.18,
          }}
        />

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {phases.map((p) => (
            <div
              key={p.phase}
              className="reveal rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-[6px]"
              style={{
                background: p.bgColor,
                border: `1px solid ${p.borderColor}`,
                boxShadow: p.active ? `0 0 30px ${p.glowColor}, inset 0 0 30px ${p.glowColor}` : 'none',
              }}
            >
              <div className="shimmer-overlay" />

              {/* Phase Label */}
              <div
                className="font-orbitron text-[0.55rem] font-bold tracking-[0.2em] mb-4 uppercase"
                style={{ color: p.active ? p.color : 'rgba(255,255,255,0.35)' }}
              >
                {p.label}
              </div>

              {/* Icon */}
              <div className="text-[2rem] mb-3">{p.icon}</div>

              {/* Title */}
              <div
                className="font-orbitron text-[0.8rem] font-bold tracking-[0.12em] mb-3"
                style={{ color: p.color }}
              >
                {p.title}
              </div>

              {/* Description */}
              <p className="text-[0.72rem] text-white/35 leading-[1.8]">
                {p.description}
              </p>

              {/* Active indicator dot */}
              {p.active && (
                <div
                  className="absolute top-3 right-3 w-[8px] h-[8px] rounded-full"
                  style={{
                    background: p.color,
                    boxShadow: `0 0 8px ${p.color}`,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
