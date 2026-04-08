import React from 'react';
import SectionHeader from '../SectionHeader';

const commissionCards = [
  {
    id: 'rcc-1',
    level: 'Level 1',
    percent: '20%',
    color: '#FFD700',
    border: 'rgba(255,215,0,0.25)',
    bg: 'rgba(255,215,0,0.06)',
    shadow: 'rgba(255,215,0,0.12)',
    label: 'Direct Referral',
  },
  {
    id: 'rcc-2',
    level: 'Levels 2–5',
    percent: '10%',
    color: '#00FF88',
    border: 'rgba(0,255,136,0.25)',
    bg: 'rgba(0,255,136,0.06)',
    shadow: 'rgba(0,255,136,0.12)',
    label: 'Close Network',
  },
  {
    id: 'rcc-3',
    level: 'Levels 6–10',
    percent: '5%',
    color: '#00FFFF',
    border: 'rgba(0,255,255,0.25)',
    bg: 'rgba(0,255,255,0.06)',
    shadow: 'rgba(0,255,255,0.12)',
    label: 'Extended Network',
  },
  {
    id: 'rcc-4',
    level: 'Levels 11–15',
    percent: '3%',
    color: '#B44FFF',
    border: 'rgba(180,79,255,0.25)',
    bg: 'rgba(180,79,255,0.06)',
    shadow: 'rgba(180,79,255,0.12)',
    label: 'Deep Network',
  },
];

const roiTableData = [
  { level: 1, teamSize: '5', commission: '20%', daily: '$0.50' },
  { level: 2, teamSize: '25', commission: '10%', daily: '$1.25' },
  { level: 3, teamSize: '125', commission: '10%', daily: '$6.25' },
  { level: 4, teamSize: '625', commission: '10%', daily: '$31.25' },
  { level: 5, teamSize: '3,125', commission: '10%', daily: '$156.25' },
  { level: 6, teamSize: '15,625', commission: '5%', daily: '$390.63' },
  { level: 7, teamSize: '78,125', commission: '5%', daily: '$1,953.13' },
  { level: 8, teamSize: '3,90,625', commission: '5%', daily: '$9,765.63' },
  { level: 9, teamSize: '19,53,125', commission: '5%', daily: '$48,828.13' },
  { level: 10, teamSize: '97,65,625', commission: '3%', daily: '$1,22,070 🚀' },
];

export default function RoiSection() {
  return (
    <section className="relative px-6 pb-20 max-w-[1200px] mx-auto">
      {/* Divider */}
      <div className="divider-line" />

      {/* Header */}
      <SectionHeader
        eyebrow="🔄 PASSIVE CASCADE INCOME"
        eyebrowColor="cyan"
        title="ROI on ROI — Daily Passive Orbit"
        titleClass="text-cyan"
        description="Earn 50% of your team's daily cashback income — automatically cascading through 15 levels of your network. No selling. No recruiting pressure. Just passive orbit income from your entire downline matrix."
      />

      {/* Commission Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14 reveal">
        {commissionCards.map((card) => (
          <div
            key={card.id}
            id={card.id}
            className="relative rounded-2xl p-6 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              boxShadow: `0 0 30px ${card.shadow}`,
            }}
          >
            <div className="shimmer-overlay" />
            {/* Percent */}
            <div
              className="font-orbitron text-[2.8rem] font-black mb-1 leading-none"
              style={{ color: card.color }}
            >
              {card.percent}
            </div>
            {/* Level */}
            <div
              className="font-orbitron text-[0.65rem] tracking-[0.2em] uppercase mb-2"
              style={{ color: card.color, opacity: 0.8 }}
            >
              {card.level}
            </div>
            {/* Label */}
            <div className="text-[0.75rem] text-white/40 font-chakra">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ROI Projection Table */}
      <div className="reveal">
        <h3
          className="font-orbitron text-[0.7rem] tracking-[0.25em] text-cyan/60 text-center uppercase mb-5"
        >
          ✦ ROI Cascade Projection (5× Matrix)
        </h3>

        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(0,255,255,0.1)' }}>
          <table className="w-full text-left" style={{ minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: 'rgba(0,255,255,0.06)',
                  borderBottom: '1px solid rgba(0,255,255,0.12)',
                }}
              >
                {['LEVEL', 'TEAM SIZE (5×)', 'COMMISSION', 'DAILY INCOME'].map((h) => (
                  <th
                    key={h}
                    className="font-orbitron text-[0.55rem] tracking-[0.2em] text-cyan/50 uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roiTableData.map((row, i) => {
                const isLast = i === roiTableData.length - 1;
                return (
                  <tr
                    key={row.level}
                    style={{
                      background: isLast
                        ? 'rgba(255,215,0,0.06)'
                        : i % 2 === 0
                        ? 'rgba(255,255,255,0.015)'
                        : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <td
                      className="font-orbitron text-[0.75rem] px-5 py-3"
                      style={{ color: isLast ? '#FFD700' : 'rgba(255,255,255,0.6)' }}
                    >
                      {row.level}
                    </td>
                    <td
                      className="font-chakra text-[0.8rem] px-5 py-3"
                      style={{ color: isLast ? '#FFD700' : 'rgba(255,255,255,0.5)' }}
                    >
                      {row.teamSize}
                    </td>
                    <td
                      className="font-orbitron text-[0.75rem] px-5 py-3"
                      style={{ color: isLast ? '#FFD700' : '#00FFFF', opacity: isLast ? 1 : 0.7 }}
                    >
                      {row.commission}
                    </td>
                    <td
                      className="font-orbitron text-[0.85rem] font-bold px-5 py-3"
                      style={{
                        color: isLast ? '#FFD700' : '#00FF88',
                        textShadow: isLast ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
                      }}
                    >
                      {row.daily}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <p className="text-[0.65rem] text-white/25 text-center mt-5 leading-[1.8] max-w-[700px] mx-auto font-chakra">
          * Theoretical 5×10 matrix. Assumes $0.50 daily cashback/user. 50% pool shared across 15 uplines.
        </p>
      </div>
    </section>
  );
}
