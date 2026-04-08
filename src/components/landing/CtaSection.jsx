import { Link } from 'react-router-dom';

const perks = [
  'FREE 100 USDT BONUS',
  'NO DEPOSIT TO START',
  'FULLY DECENTRALIZED',
  'INSTANT PAYOUTS',
  '7 INCOME STREAMS',
  '18+ ONLY',
];

export default function CtaSection() {
  return (
    <section className="relative py-[100px] px-6 text-center overflow-hidden">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(180,79,255,0.12) 0%, rgba(255,215,0,0.06) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[700px] mx-auto">
        {/* Title */}
        <h2
          className="reveal font-russo text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] mb-5"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #00FFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Launch Into the Galaxy
        </h2>

        {/* Subtitle */}
        <p
          className="reveal text-[0.9rem] text-white/40 italic leading-[1.85] mb-10 max-w-[550px] mx-auto"
          style={{ fontStyle: 'italic' }}
        >
          "The stars don't wait for anyone. Join thousands of players already
          earning real crypto rewards in the most sustainable blockchain gaming
          ecosystem ever built."
        </p>

        {/* Buttons */}
        <div className="reveal flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-[30px] font-orbitron text-[0.7rem] font-bold tracking-[0.12em] text-black cursor-pointer border-none transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,215,0,0.5)] hover:-translate-y-[3px] inline-block no-underline"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            }}
          >
            🚀 Start Playing Free
          </Link>
          <a
            href="#live-stats"
            className="px-8 py-3.5 rounded-[30px] font-orbitron text-[0.7rem] font-bold tracking-[0.12em] cursor-pointer bg-transparent transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:-translate-y-[3px] inline-block no-underline"
            style={{
              border: '1px solid rgba(0,255,255,0.4)',
              color: 'var(--color-cyan)',
            }}
          >
            📊 Live Stats
          </a>
        </div>

        {/* Perks Grid */}
        <div className="reveal flex flex-wrap justify-center gap-3">
          {perks.map((perk, i) => (
            <div
              key={i}
              className="font-orbitron text-[0.5rem] tracking-[0.15em] uppercase px-4 py-2 rounded-[20px]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {perk}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
