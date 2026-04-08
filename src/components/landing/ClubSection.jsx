import SectionHeader from '../SectionHeader';

const ranks = [
  { rank: 1, icon: '⭐', percent: '2%', volume: '10,000 USDT' },
  { rank: 2, icon: '🌟', percent: '2%', volume: '50,000 USDT' },
  { rank: 3, icon: '💫', percent: '1%', volume: '2,50,000 USDT' },
  { rank: 4, icon: '✨', percent: '1%', volume: '10,00,000 USDT' },
  { rank: 5, icon: '🌠', percent: '1%', volume: '50,00,000 USDT' },
  { rank: 6, icon: '🌌', percent: '1%', volume: '1 Crore USDT' },
];

export default function ClubSection() {
  return (
    <section className="relative px-6 pb-[80px] overflow-hidden">
      <div className="divider-line" />

      <SectionHeader
        eyebrow="🏆 LEADERSHIP GALAXY"
        eyebrowColor="gold"
        title="Club Income — 8% Daily Turnover"
        titleClass="text-gradient-gold-simple"
        description="Build volume across your network legs to unlock higher club ranks. As the ecosystem grows, so does your daily share of the platform turnover."
      />

      {/* Rank Cards Grid */}
      <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {ranks.map((r) => (
          <div
            key={r.rank}
            className="reveal card-glass rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_0_30px_rgba(255,215,0,0.12)]"
            style={{
              borderColor: 'rgba(255,215,0,0.12)',
            }}
          >
            <div className="shimmer-overlay" />

            {/* Rank Number */}
            <div
              className="font-orbitron text-[0.55rem] tracking-[0.2em] mb-3 uppercase"
              style={{ color: 'rgba(255,215,0,0.45)' }}
            >
              Rank {r.rank}
            </div>

            {/* Icon */}
            <div className="text-[2.2rem] mb-3">{r.icon}</div>

            {/* Percent */}
            <div
              className="font-orbitron text-[1.6rem] font-black mb-2"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {r.percent}
            </div>

            {/* Volume Requirement */}
            <div className="font-orbitron text-[0.5rem] tracking-[0.12em] text-white/40 leading-[1.6]">
              {r.volume}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div
        className="reveal max-w-[700px] mx-auto mt-10 rounded-2xl px-8 py-6 text-center relative overflow-hidden"
        style={{
          background: 'rgba(255,215,0,0.04)',
          border: '1px solid rgba(255,215,0,0.12)',
        }}
      >
        <div className="shimmer-overlay" />
        <div
          className="font-orbitron text-[0.75rem] font-bold tracking-[0.18em] mb-2"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ⚖️ 50% STRONG LEG / 50% OTHER LEGS RULE
        </div>
        <p className="text-[0.78rem] text-white/40 leading-[1.85] max-w-[550px] mx-auto">
          To qualify for each rank, 50% of the required volume must come from your
          single strongest leg, and the remaining 50% from all other legs combined.
          This ensures balanced, sustainable network growth across the galaxy.
        </p>
      </div>
    </section>
  );
}
