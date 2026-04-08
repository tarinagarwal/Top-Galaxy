import React from 'react';
import SectionHeader from '../SectionHeader';

const prizeTableRows = [
  { rank: '1st', golden: '10,000', silver: '1,000', winners: '1' },
  { rank: '2nd', golden: '5,000', silver: '500', winners: '1' },
  { rank: '3rd', golden: '4,000', silver: '400', winners: '1' },
  { rank: '4th–10th', golden: '1,000', silver: '100', winners: '7' },
  { rank: '11th–50th', golden: '300', silver: '30', winners: '40' },
  { rank: '51st–100th', golden: '120', silver: '12', winners: '50' },
  { rank: '101st–500th', golden: '40', silver: '4', winners: '400' },
  { rank: '501st–1000th', golden: '20', silver: '2', winners: '500' },
];

const statsChips = [
  { label: '10,000 Tickets', icon: '🎫' },
  { label: '1,000 Winners', icon: '🏆' },
  { label: '10% Win Rate', icon: '📊' },
];

function DrawCard({ variant }) {
  const isGold = variant === 'golden';

  const theme = isGold
    ? {
        color: '#FFD700',
        border: 'rgba(255,215,0,0.35)',
        bg: 'rgba(255,215,0,0.04)',
        shadow: '0 0 50px rgba(255,215,0,0.12), 0 0 100px rgba(255,215,0,0.04)',
        icon: '🏆',
        name: 'GOLDEN LUCKY DRAW',
        prize: '70,000 USDT',
        entry: '10 USDT',
        glowBorder: '2px solid rgba(255,215,0,0.35)',
      }
    : {
        color: '#C8D6E5',
        border: 'rgba(200,214,229,0.2)',
        bg: 'rgba(200,214,229,0.03)',
        shadow: '0 0 40px rgba(200,214,229,0.06)',
        icon: '🥈',
        name: 'SILVER LUCKY DRAW',
        prize: '7,000 USDT',
        entry: '1 USDT',
        glowBorder: '1px solid rgba(200,214,229,0.2)',
      };

  return (
    <div
      className="relative rounded-2xl p-7 overflow-hidden flex-1 min-w-[280px] transition-all duration-300 hover:-translate-y-1"
      style={{
        background: theme.bg,
        border: theme.glowBorder,
        boxShadow: theme.shadow,
      }}
    >
      <div className="shimmer-overlay" />

      {/* Icon */}
      <div className="text-[3rem] mb-4">{theme.icon}</div>

      {/* Name */}
      <h3
        className="font-orbitron text-[0.7rem] tracking-[0.25em] uppercase mb-3"
        style={{ color: theme.color, opacity: 0.8 }}
      >
        {theme.name}
      </h3>

      {/* Prize Amount */}
      <div
        className="font-orbitron text-[2.5rem] font-black leading-none mb-5"
        style={{
          color: theme.color,
          textShadow: isGold ? '0 0 20px rgba(255,215,0,0.3)' : '0 0 15px rgba(200,214,229,0.15)',
        }}
      >
        {theme.prize}
      </div>

      {/* Stats Chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {statsChips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1 text-[0.6rem] font-orbitron tracking-[0.1em] px-3 py-[5px] rounded-full"
            style={{
              color: `${theme.color}AA`,
              border: `1px solid ${theme.color}22`,
              background: `${theme.color}08`,
            }}
          >
            {chip.icon} {chip.label}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-[0.72rem] text-white/30 leading-[1.8] mb-6 font-chakra">
        {isGold
          ? 'The ultimate prize pool. 1,000 winners share 70,000 USDT every draw cycle. Premium entry, premium rewards.'
          : 'Accessible to all players. 1,000 winners share 7,000 USDT every cycle. Micro-entry, macro-opportunity.'}
      </p>

      {/* Entry Button */}
      <button
        className="font-orbitron text-[0.65rem] tracking-[0.2em] uppercase px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer w-full"
        style={{
          color: isGold ? '#030010' : theme.color,
          background: isGold
            ? 'linear-gradient(135deg, #FFD700, #FFA500)'
            : 'transparent',
          border: isGold ? 'none' : `1px solid ${theme.color}44`,
          boxShadow: isGold ? '0 0 25px rgba(255,215,0,0.25)' : 'none',
        }}
      >
        Entry: {theme.entry} ✦
      </button>
    </div>
  );
}

export default function LuckyDrawSection() {
  return (
    <section id="lucky" className="relative px-6 pb-20 max-w-[1200px] mx-auto">
      {/* Divider */}
      <div className="divider-line" />

      {/* Header */}
      <SectionHeader
        eyebrow="🎰 JACKPOT GALAXY"
        eyebrowColor="gold"
        title="Lucky Draw — 1 in 10 Win"
        titleClass="text-gradient-gold-simple"
      />

      {/* Draw Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-14 reveal">
        <DrawCard variant="golden" />
        <DrawCard variant="silver" />
      </div>

      {/* Prize Table */}
      <div className="reveal">
        <h3
          className="font-orbitron text-[0.7rem] tracking-[0.25em] text-gold/60 text-center uppercase mb-5"
        >
          ✦ Prize Breakdown
        </h3>

        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,215,0,0.1)' }}>
          <table className="w-full text-left" style={{ minWidth: 560, borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: 'rgba(255,215,0,0.06)',
                  borderBottom: '1px solid rgba(255,215,0,0.12)',
                }}
              >
                {['RANK', 'GOLDEN PRIZE', 'SILVER PRIZE', 'WINNERS'].map((h) => (
                  <th
                    key={h}
                    className="font-orbitron text-[0.55rem] tracking-[0.2em] text-gold/50 uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prizeTableRows.map((row, i) => {
                const isTop = i < 3;
                return (
                  <tr
                    key={row.rank}
                    style={{
                      background: isTop
                        ? 'rgba(255,215,0,0.03)'
                        : i % 2 === 0
                        ? 'rgba(255,255,255,0.015)'
                        : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <td
                      className="font-orbitron text-[0.75rem] px-5 py-3"
                      style={{ color: isTop ? '#FFD700' : 'rgba(255,255,255,0.55)' }}
                    >
                      {row.rank}
                    </td>
                    <td
                      className="font-orbitron text-[0.8rem] font-bold px-5 py-3"
                      style={{
                        color: '#FFD700',
                        opacity: isTop ? 1 : 0.7,
                        textShadow: isTop ? '0 0 8px rgba(255,215,0,0.2)' : 'none',
                      }}
                    >
                      ${row.golden}
                    </td>
                    <td
                      className="font-orbitron text-[0.8rem] font-bold px-5 py-3"
                      style={{
                        color: '#C8D6E5',
                        opacity: isTop ? 1 : 0.6,
                      }}
                    >
                      ${row.silver}
                    </td>
                    <td
                      className="font-chakra text-[0.8rem] px-5 py-3"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {row.winners}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-funding Info Box */}
      <div
        className="mt-10 rounded-2xl p-6 text-center reveal"
        style={{
          background: 'rgba(255,215,0,0.03)',
          border: '1px solid rgba(255,215,0,0.1)',
          boxShadow: '0 0 40px rgba(255,215,0,0.04)',
        }}
      >
        <div className="shimmer-overlay" style={{ position: 'absolute' }} />
        <div className="text-[1.3rem] mb-3">🔄</div>
        <h4
          className="font-orbitron text-[0.65rem] tracking-[0.2em] uppercase mb-3"
          style={{ color: '#FFD700', opacity: 0.7 }}
        >
          Auto-Funded Daily
        </h4>
        <p className="text-[0.78rem] text-white/35 leading-[1.85] max-w-[620px] mx-auto font-chakra">
          20% of daily Losers Profit (Cashback) + ROI on ROI earnings are auto-credited equally to both Lucky Draw wallets daily.
        </p>
      </div>
    </section>
  );
}
