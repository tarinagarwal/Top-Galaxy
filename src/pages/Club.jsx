import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { useSocket } from '../hooks/useSocket';
import { fmt, num } from '../lib/format';

const RANK_ICONS = {
  0: '⚪',
  1: '⭐',
  2: '🌟',
  3: '💫',
  4: '✨',
  5: '🌠',
  6: '🌌',
};

const RANK_NAMES = {
  0: 'UNRANKED',
  1: 'RANK 1',
  2: 'RANK 2',
  3: 'RANK 3',
  4: 'RANK 4',
  5: 'RANK 5',
  6: 'RANK 6',
};

export default function Club() {
  const [rankData, setRankData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [r, h] = await Promise.all([
        api.get('/api/club/rank'),
        api.get('/api/club/income-history?pageSize=30'),
      ]);
      setRankData(r.data);
      setHistory(h.data.history || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live updates on club credit
  useSocket({
    'club:credited': () => refresh(),
  });

  if (loading) {
    return (
      <div>
        <StarfieldCanvas />
        <Navbar />
        <div className="relative z-10 min-h-screen pt-[120px] px-6 text-center text-white/40 font-orbitron text-[0.7rem]">
          Loading club data...
        </div>
      </div>
    );
  }

  const r = rankData || {};
  const currentRank = num(r.currentRank);
  const strongLeg = num(r.strongLegVolume);
  const otherLegs = num(r.otherLegsVolume);
  const ladder = r.ladder || [];
  const next = r.nextRank;

  // Today's earnings (sum of today's history rows)
  const today = new Date().toISOString().slice(0, 10);
  const todayEarning = (history.find((h) => h.date === today)?.perUserAmount) || 0;

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-2">
              🏆 LEADERSHIP GALAXY
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
              Club Income
            </h1>
            <p className="text-white/40 text-[0.75rem] mt-2 max-w-[600px]">
              Reach a club rank by building balanced volume across your team. Earn a recurring
              daily share of the entire platform's turnover. Each rank's percentage is applied
              directly to the full daily turnover.
            </p>
          </div>

          {/* Top: Current rank + Today's earning + Direct refs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Current rank badge */}
            <div className="card-glass rounded-2xl p-6 border border-gold/30 text-center">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-2">
                CURRENT RANK
              </div>
              <div className="text-[3.5rem] leading-none mb-1">{RANK_ICONS[currentRank]}</div>
              <div className="font-russo text-[1.4rem] text-gradient-gold">
                {RANK_NAMES[currentRank]}
              </div>
              {currentRank > 0 && ladder[currentRank - 1] && (
                <div className="text-[0.6rem] text-white/40 font-orbitron mt-1">
                  {ladder[currentRank - 1].percent}% of daily turnover share
                </div>
              )}
            </div>

            {/* Today's earnings */}
            <div className="card-glass rounded-2xl p-6 border border-green/20 text-center">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-2">
                TODAY'S CLUB INCOME
              </div>
              <div className="font-orbitron text-green text-[2.4rem] font-bold leading-none">
                {fmt(todayEarning)}
              </div>
              <div className="text-[0.55rem] text-white/30 font-orbitron mt-2">USDT</div>
              {todayEarning === 0 && currentRank === 0 && (
                <div className="text-[0.6rem] text-white/40 mt-2">
                  Reach Rank 1 to start earning
                </div>
              )}
              {todayEarning === 0 && currentRank > 0 && (
                <div className="text-[0.6rem] text-white/40 mt-2">
                  Distributed daily at 00:30
                </div>
              )}
            </div>

            {/* Direct refs */}
            <div className="card-glass rounded-2xl p-6 border border-cyan/20 text-center">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-2">
                DIRECT REFERRALS
              </div>
              <div className="font-orbitron text-cyan text-[2.4rem] font-bold leading-none">
                {r.directReferralCount || 0}
              </div>
              <div className="text-[0.55rem] text-white/30 font-orbitron mt-2">
                Active downline
              </div>
            </div>
          </div>

          {/* Volume breakdown */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-white/10">
            <div className="font-orbitron text-cyan text-[0.75rem] font-bold mb-4">
              📊 VOLUME BREAKDOWN
            </div>

            {next ? (
              <>
                <div className="text-[0.65rem] text-white/40 mb-4 leading-relaxed">
                  Reach <span className="text-gold font-orbitron">{RANK_NAMES[next.rank]}</span> by
                  satisfying the 50/50 balanced leg rule:{' '}
                  <span className="text-cyan">{fmt(next.strongLegRequired, 0)} USDT</span>{' '}
                  from your strongest single leg AND{' '}
                  <span className="text-cyan">{fmt(next.otherLegsRequired, 0)} USDT</span>{' '}
                  from all other legs combined.
                </div>

                <VolumeBar
                  label="Strong Leg"
                  current={strongLeg}
                  required={next.strongLegRequired}
                  color="gold"
                />
                <VolumeBar
                  label="Other Legs Combined"
                  current={otherLegs}
                  required={next.otherLegsRequired}
                  color="cyan"
                />
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-[3rem] mb-2">👑</div>
                <div className="font-orbitron text-gold text-[0.85rem]">
                  MAX RANK ACHIEVED
                </div>
                <div className="text-[0.65rem] text-white/40 mt-1">
                  You've reached Rank 6 — the highest tier
                </div>
              </div>
            )}
          </div>

          {/* Rank ladder */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-purple/20">
            <div className="font-orbitron text-purple text-[0.75rem] font-bold mb-4">
              🪜 RANK LADDER
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ladder.map((tier) => {
                const isCurrent = tier.rank === currentRank;
                const isAchieved = tier.rank <= currentRank;
                return (
                  <div
                    key={tier.rank}
                    className={`p-4 rounded-xl border ${
                      isCurrent
                        ? 'border-gold bg-gold/10'
                        : isAchieved
                        ? 'border-green/30 bg-green/5'
                        : 'border-white/10 bg-white/3'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[1.4rem]">{RANK_ICONS[tier.rank]}</span>
                        <span
                          className={`font-orbitron text-[0.7rem] font-bold ${
                            isCurrent ? 'text-gold' : isAchieved ? 'text-green' : 'text-white/60'
                          }`}
                        >
                          {RANK_NAMES[tier.rank]}
                        </span>
                      </div>
                      <div className="font-orbitron text-[0.65rem] text-white/40">
                        {tier.percent}%
                      </div>
                    </div>
                    <div className="text-[0.6rem] text-white/40 font-orbitron">
                      Total: {fmt(tier.totalVolume, 0)} USDT
                    </div>
                    <div className="text-[0.55rem] text-white/30 mt-0.5">
                      {fmt(tier.strongLegRequired, 0)} strong + {fmt(tier.otherLegsRequired, 0)} other
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History */}
          <div className="card-glass rounded-2xl p-6 border border-white/10">
            <div className="font-orbitron text-gold text-[0.75rem] font-bold mb-4">
              📜 CLUB INCOME HISTORY
            </div>
            {history.length === 0 ? (
              <div className="text-center py-6 text-[0.7rem] text-white/30">
                No club income received yet. Daily distribution runs at 00:30.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.7rem]">
                  <thead>
                    <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em] border-b border-white/10">
                      <th className="py-2 px-2">DATE</th>
                      <th className="py-2 px-2">RANK</th>
                      <th className="py-2 px-2 text-right">TURNOVER</th>
                      <th className="py-2 px-2 text-right">RANK POOL</th>
                      <th className="py-2 px-2 text-right">QUALIFIERS</th>
                      <th className="py-2 px-2 text-right">YOUR SHARE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2 px-2 font-orbitron text-white/70">{row.date}</td>
                        <td className="py-2 px-2 font-orbitron">
                          <span className="text-gold">
                            {RANK_ICONS[row.rank]} R{row.rank}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-orbitron text-cyan text-right">
                          {fmt(row.totalTurnover, 0)}
                        </td>
                        <td className="py-2 px-2 font-orbitron text-purple text-right">
                          {fmt(row.rankPoolAmount)}
                        </td>
                        <td className="py-2 px-2 font-orbitron text-white/40 text-right">
                          {row.qualifiedUsersCount}
                        </td>
                        <td className="py-2 px-2 font-orbitron text-green text-right">
                          +{fmt(row.perUserAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VolumeBar({ label, current, required, color }) {
  const safeCurrent = num(current);
  const safeRequired = num(required);
  const pct = safeRequired > 0 ? Math.min(100, (safeCurrent / safeRequired) * 100) : 0;
  const met = safeCurrent >= safeRequired;

  const colorClasses = {
    gold: 'from-gold to-gold2',
    cyan: 'from-cyan to-blue',
  }[color];

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between text-[0.65rem] font-orbitron mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className={met ? 'text-green' : 'text-white/40'}>
          {fmt(safeCurrent, 0)} / {fmt(safeRequired, 0)} USDT
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            met ? 'bg-green' : `bg-gradient-to-r ${colorClasses}`
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[0.55rem] text-white/30 font-orbitron mt-0.5 text-right">
        {fmt(pct, 1)}% complete
      </div>
    </div>
  );
}
