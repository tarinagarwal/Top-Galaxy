import React from 'react';
import SectionHeader from '../SectionHeader';

/* ── Data ── */
const bonusCards = [
  {
    tier: 'Legendary Tier',
    icon: '👑',
    amount: '100 USDT',
    audience: 'First 10,000 Users',
    color: 'var(--color-gold)',
    borderColor: 'rgba(255,215,0,0.18)',
    bgColor: 'rgba(255,215,0,0.04)',
    glowColor: 'rgba(255,215,0,0.08)',
    progress: 67,
    features: [
      'Practice balance for risk-free gameplay',
      'Access all planet game rooms',
      'Earn practice referral rewards',
      'Convert to real balance via deposits',
    ],
  },
  {
    tier: 'Galaxy Tier',
    icon: '🌟',
    amount: '10 USDT',
    audience: 'Next 100,000 Users',
    color: 'var(--color-cyan)',
    borderColor: 'rgba(0,255,255,0.18)',
    bgColor: 'rgba(0,255,255,0.04)',
    glowColor: 'rgba(0,255,255,0.08)',
    progress: 42,
    features: [
      'Practice balance for risk-free gameplay',
      'Access starter planet rooms',
      'Earn practice referral rewards',
      'Convert to real balance via deposits',
    ],
  },
];

const restrictions = [
  { label: 'NOT WITHDRAWABLE', icon: '🚫', positive: false },
  { label: 'NOT TRANSFERABLE', icon: '🔒', positive: false },
  { label: 'NOT REDEEMABLE', icon: '❌', positive: false },
  { label: 'CONVERTIBLE', icon: '✅', positive: true },
  { label: 'GAMEPLAY ACTIVE', icon: '🎮', positive: true },
];

const timelineNodes = [
  { day: 'Day 0', label: 'Sign Up', color: 'var(--color-gold)' },
  { day: 'Day 7', label: 'Gameplay', color: 'var(--color-cyan)' },
  { day: 'Day 20', label: 'Review', color: 'var(--color-purple)' },
  { day: '', label: 'Activated', color: 'var(--color-green)' },
  { day: '', label: 'Expired', color: 'var(--color-pink)' },
];

const referralLevels = [
  { level: 'Level 1', label: 'Direct Referrals', percent: 10, width: '100%', color: 'var(--color-gold)' },
  { level: 'Levels 2–5', label: 'Indirect Tier', percent: 2, width: '20%', color: 'var(--color-cyan)' },
  { level: 'Levels 6–10', label: 'Deep Network', percent: 1, width: '10%', color: 'var(--color-green)' },
  { level: 'Levels 11–15', label: 'Extended Reach', percent: 0.5, width: '5%', color: 'var(--color-purple)' },
];

const matrixData = [
  { level: '1', refs: '10', rate: '10%', earn: '1.0 USDT' },
  { level: '2–5', refs: '10⁴', rate: '2%', earn: '0.2 each' },
  { level: '6–10', refs: '10⁵', rate: '1%', earn: '0.1 each' },
  { level: '11–15', refs: '10⁵', rate: '0.5%', earn: '0.05 each' },
];

/* ── Component ── */
export default function RegistrationSection() {
  return (
    <section id="reg" className="relative max-w-[1100px] mx-auto px-5">
      {/* Header */}
      <SectionHeader
        eyebrow="🎁 ONBOARDING SYSTEM"
        eyebrowColor="gold"
        title={<span className="text-gradient-gold">Free Sign-Up Bonus</span>}
        description="Start your blockchain gaming journey with zero risk. Every new user receives a practice balance to explore the ecosystem before committing real funds."
      />

      {/* ── Bonus Cards ── */}
      <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {bonusCards.map((card, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-7 overflow-hidden transition-all duration-300 hover:-translate-y-[3px]"
            style={{
              background: card.bgColor,
              border: `1px solid ${card.borderColor}`,
            }}
          >
            <div className="shimmer-overlay" />

            {/* Tier Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[1.2rem]">{card.icon}</span>
              <span
                className="font-orbitron text-[0.65rem] font-bold tracking-[0.18em] uppercase"
                style={{ color: card.color }}
              >
                {card.tier}
              </span>
            </div>

            {/* Amount */}
            <div
              className="font-orbitron text-[2.2rem] font-black mb-1 leading-none"
              style={{ color: card.color }}
            >
              {card.amount}
            </div>
            <div className="text-[0.72rem] text-white/35 mb-5 tracking-[0.08em]">
              Practice Balance
            </div>

            {/* Audience */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-[5px] mb-5 text-[0.58rem] font-orbitron tracking-[0.12em]"
              style={{
                background: `${card.bgColor}`,
                border: `1px solid ${card.borderColor}`,
                color: card.color,
              }}
            >
              {card.audience}
            </div>

            {/* Features */}
            <ul className="list-none space-y-[10px] mb-6">
              {card.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-[0.78rem] text-white/50 leading-[1.6]">
                  <span style={{ color: card.color }} className="mt-[2px]">✦</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Progress Bar */}
            <div className="mb-1 flex justify-between text-[0.55rem] font-orbitron tracking-[0.1em] text-white/30">
              <span>Slots Claimed</span>
              <span style={{ color: card.color }}>{card.progress}%</span>
            </div>
            <div className="w-full h-[5px] rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${card.progress}%`,
                  background: `linear-gradient(90deg, ${card.color}, transparent)`,
                  animation: 'bar-in 1.5s ease forwards',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Practice Game Mechanics ── */}
      <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Win Card */}
        <div className="card-glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-[2px]">
          <div className="text-[2rem] mb-2">🏆</div>
          <div className="font-orbitron text-[1.6rem] font-black text-green mb-1">8×</div>
          <div className="font-orbitron text-[0.6rem] tracking-[0.2em] text-green/80 uppercase mb-3">Win Multiplier</div>
          <p className="text-[0.75rem] text-white/35 leading-[1.7] mb-4">
            Win 8× your bet amount — practice balance grows, demonstrating the real payout system.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Practice Only', 'Non-Cashable', 'Demo Payout'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[0.5rem] font-orbitron tracking-[0.1em] border border-green/20 text-green/60 bg-green/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Loss / Burn Card */}
        <div className="card-glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-[2px]">
          <div className="text-[2rem] mb-2">🔥</div>
          <div className="font-orbitron text-[1.6rem] font-black text-pink mb-1">BURN</div>
          <div className="font-orbitron text-[0.6rem] tracking-[0.2em] text-pink/80 uppercase mb-3">Loss Mechanic</div>
          <p className="text-[0.75rem] text-white/35 leading-[1.7] mb-4">
            Losses are burned permanently — practice balance decreases just like real gameplay.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Permanent Burn', 'Non-Recoverable', 'Demo Loss'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[0.5rem] font-orbitron tracking-[0.1em] border border-pink/20 text-pink/60 bg-pink/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Restrictions Grid ── */}
      <div className="reveal flex flex-wrap justify-center gap-3 mb-10">
        {restrictions.map((r, i) => (
          <div
            key={i}
            className="card-glass rounded-xl px-4 py-3 flex items-center gap-2 text-center min-w-[160px] transition-all duration-300 hover:-translate-y-[2px]"
            style={{
              borderColor: r.positive ? 'rgba(0,255,136,0.15)' : 'rgba(255,45,120,0.1)',
            }}
          >
            <span className="text-[1rem]">{r.icon}</span>
            <span
              className="font-orbitron text-[0.52rem] font-bold tracking-[0.14em]"
              style={{ color: r.positive ? 'var(--color-green)' : 'var(--color-pink)' }}
            >
              {r.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── 30-Day Timeline ── */}
      <div className="reveal card-glass rounded-2xl p-7 mb-10 overflow-hidden">
        <div className="text-center mb-6">
          <div className="font-orbitron text-[0.6rem] tracking-[0.2em] text-gold/60 uppercase mb-2">
            Practice Balance Lifecycle
          </div>
          <div className="font-russo text-[1.2rem] text-white/80">30-Day Timeline</div>
        </div>

        {/* Timeline Track */}
        <div className="relative flex items-center justify-between max-w-[700px] mx-auto mb-8 px-2">
          {/* Connecting line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
            style={{
              background: 'linear-gradient(90deg, var(--color-gold), var(--color-cyan), var(--color-purple), var(--color-green), var(--color-pink))',
              opacity: 0.25,
            }}
          />

          {timelineNodes.map((node, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className="w-[14px] h-[14px] rounded-full"
                style={{
                  background: node.color,
                  boxShadow: `0 0 12px ${node.color}`,
                }}
              />
              <div className="text-center">
                {node.day && (
                  <div className="font-orbitron text-[0.5rem] tracking-[0.1em] text-white/30">
                    {node.day}
                  </div>
                )}
                <div
                  className="font-orbitron text-[0.55rem] font-bold tracking-[0.12em]"
                  style={{ color: node.color }}
                >
                  {node.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Outcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: 'rgba(0,255,136,0.04)',
              border: '1px solid rgba(0,255,136,0.12)',
            }}
          >
            <div className="text-[1.2rem] mb-2">✅</div>
            <div className="font-orbitron text-[0.65rem] font-bold tracking-[0.15em] text-green mb-2">
              DEPOSIT WITHIN 30 DAYS
            </div>
            <p className="text-[0.72rem] text-white/35 leading-[1.7]">
              Practice balance converts to active gameplay balance. Start earning real rewards immediately.
            </p>
          </div>
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: 'rgba(255,45,120,0.04)',
              border: '1px solid rgba(255,45,120,0.12)',
            }}
          >
            <div className="text-[1.2rem] mb-2">⏰</div>
            <div className="font-orbitron text-[0.65rem] font-bold tracking-[0.15em] text-pink mb-2">
              NO DEPOSIT — EXPIRED
            </div>
            <p className="text-[0.72rem] text-white/35 leading-[1.7]">
              Practice balance expires after 30 days. No loss — you never deposited real funds.
            </p>
          </div>
        </div>
      </div>

      {/* ── Practice Referral Rewards ── */}
      <div className="reveal card-glass rounded-2xl p-7 mb-6 overflow-hidden">
        <div className="text-center mb-6">
          <div className="font-orbitron text-[0.6rem] tracking-[0.2em] text-gold/60 uppercase mb-2">
            Referral Commission Structure
          </div>
          <div className="font-russo text-[1.2rem] text-white/80">Practice Referral Rewards</div>
        </div>

        {/* Level Bars */}
        <div className="space-y-5 max-w-[600px] mx-auto mb-8">
          {referralLevels.map((lvl, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-[6px]">
                <div className="flex items-center gap-3">
                  <span
                    className="font-orbitron text-[0.6rem] font-bold tracking-[0.12em]"
                    style={{ color: lvl.color }}
                  >
                    {lvl.level}
                  </span>
                  <span className="text-[0.65rem] text-white/30">{lvl.label}</span>
                </div>
                <span
                  className="font-orbitron text-[0.75rem] font-black"
                  style={{ color: lvl.color }}
                >
                  {lvl.percent}%
                </span>
              </div>
              <div className="w-full h-[5px] rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: lvl.width,
                    background: `linear-gradient(90deg, ${lvl.color}, transparent)`,
                    animation: 'bar-in 1.5s ease forwards',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full max-w-[600px] mx-auto border-collapse">
            <thead>
              <tr>
                {['Level', 'Refs', 'Rate', 'Earn / Ref'].map((h) => (
                  <th
                    key={h}
                    className="font-orbitron text-[0.5rem] tracking-[0.15em] text-white/25 uppercase text-left py-2 px-3 border-b border-white/5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-[10px] px-3 font-orbitron text-[0.6rem] font-bold text-gold tracking-[0.1em]">
                    {row.level}
                  </td>
                  <td className="py-[10px] px-3 text-[0.68rem] text-white/40">
                    {row.refs}
                  </td>
                  <td className="py-[10px] px-3 font-orbitron text-[0.62rem] font-bold text-cyan">
                    {row.rate}
                  </td>
                  <td className="py-[10px] px-3 text-[0.68rem] text-white/40">
                    {row.earn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Divider */}
      <div className="divider-line mt-10" />
    </section>
  );
}
