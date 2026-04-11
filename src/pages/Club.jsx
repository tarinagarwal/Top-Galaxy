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
    } catch (err) {
      console.error('[club] refresh failed:', err?.response?.data || err?.message);
    }
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
  const _d = new Date();
  const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
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
              daily share of the entire platform's deposits. Each rank's percentage is applied
              directly to the full daily deposits.
            </p>
          </div>

          {/* Top: Big stat — Total Club Income */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-green/30 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em]">TOTAL CLUB INCOME</div>
              <div className="font-orbitron text-green text-[2.2rem] font-bold leading-none mt-1">
                ${fmt(r.lifetimeClubIncome || 0, 3)}
              </div>
              <div className="text-[0.65rem] text-white/20 font-orbitron mt-1">{r.lifetimeClubPayments || 0} payouts received</div>
            </div>
            <div className="text-right">
              <div className="text-[3rem] leading-none">{RANK_ICONS[currentRank]}</div>
              <div className="font-russo text-[1rem] text-gradient-gold">{RANK_NAMES[currentRank]}</div>
              {currentRank > 0 && ladder[currentRank - 1] && (
                <div className="text-[0.65rem] text-white/30 font-orbitron">{ladder[currentRank - 1].percent}% share</div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="card-glass rounded-2xl p-4 border border-gold/20">
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1">TODAY'S EARNING</div>
              <div className="font-orbitron text-gold text-[1.2rem] font-bold">{fmt(todayEarning, 3)}</div>
              <div className="text-[0.4rem] text-white/20">USDT</div>
            </div>
            <div className="card-glass rounded-2xl p-4 border border-cyan/20">
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1">TODAY'S DEPOSITS</div>
              <div className="font-orbitron text-cyan text-[1.2rem] font-bold">{fmt(r.todayTurnover || 0, 0)}</div>
              <div className="text-[0.4rem] text-white/20">USDT platform-wide</div>
            </div>
            <div className="card-glass rounded-2xl p-4 border border-purple/20">
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1">TEAM VOLUME</div>
              <div className="font-orbitron text-purple text-[1.2rem] font-bold">{fmt(r.teamVolume || 0, 0)}</div>
              <div className="text-[0.4rem] text-white/20">USDT total</div>
            </div>
            <div className="card-glass rounded-2xl p-4 border border-white/10">
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1">DIRECT REFERRALS</div>
              <div className="font-orbitron text-white text-[1.2rem] font-bold">{r.directReferralCount || 0}</div>
              <div className="text-[0.4rem] text-white/20">active downline</div>
            </div>
          </div>

          {/* Two columns: Rank Progress + Income Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Rank Progress card */}
            <div className="card-glass rounded-2xl p-6 border border-gold/20">
              <div className="font-orbitron text-gold text-[0.75rem] font-bold mb-1">
                {RANK_ICONS[currentRank]} {RANK_NAMES[currentRank]} → {next ? RANK_NAMES[next.rank] : '👑 MAX'}
              </div>
              <div className="text-[0.68rem] text-white/30 mb-4">
                {next
                  ? `Target: ${fmt(next.totalVolume, 0)} USDT total volume`
                  : 'You have reached the highest rank'}
              </div>

              {next ? (
                <>
                  <VolumeBar label="Strong Leg" current={strongLeg} required={next.strongLegRequired} color="gold" />
                  <VolumeBar label="Other Legs" current={otherLegs} required={next.otherLegsRequired} color="cyan" />
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-[2.5rem]">👑</div>
                  <div className="font-orbitron text-gold text-[0.75rem] mt-2">MAX RANK ACHIEVED</div>
                </div>
              )}
            </div>

            {/* Income Breakdown card */}
            <div className="card-glass rounded-2xl p-6 border border-white/10">
              <div className="font-orbitron text-white text-[0.75rem] font-bold mb-1">
                💰 INCOME BREAKDOWN
              </div>
              <div className="text-[0.68rem] text-white/30 mb-4">
                {currentRank === 0 ? 'Achieve Rank 1 to unlock Club Income' : `Earning ${ladder[currentRank - 1]?.percent}% of daily platform deposits`}
              </div>

              {currentRank === 0 ? (
                <div className="text-center py-6">
                  <div className="text-[2.5rem] mb-2">🔒</div>
                  <div className="text-[0.65rem] text-white/40 font-orbitron">
                    Achieve Rank 1 to unlock Club Income
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                    <span className="text-[0.6rem] text-white/50 font-orbitron">Today's Platform Deposits</span>
                    <span className="font-orbitron text-cyan text-[0.7rem]">{fmt(r.todayTurnover || 0, 0)} USDT</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                    <span className="text-[0.6rem] text-white/50 font-orbitron">Your Rank Share</span>
                    <span className="font-orbitron text-gold text-[0.7rem]">{ladder[currentRank - 1]?.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                    <span className="text-[0.6rem] text-white/50 font-orbitron">Est. Daily (if sole qualifier)</span>
                    <span className="font-orbitron text-green text-[0.7rem]">
                      {fmt(((r.todayTurnover || 0) * (ladder[currentRank - 1]?.percent || 0)) / 100, 3)} USDT
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green/5 border border-green/20">
                    <span className="text-[0.6rem] text-white/50 font-orbitron">Lifetime Earned</span>
                    <span className="font-orbitron text-green text-[0.85rem] font-bold">{fmt(r.lifetimeClubIncome || 0, 3)} USDT</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Ranks — Distribution table */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-purple/20">
            <div className="font-orbitron text-purple text-[0.75rem] font-bold mb-4">
              🪜 ALL RANKS — DISTRIBUTION
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.6rem]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr className="text-left text-white/40 font-orbitron text-[0.65rem] tracking-[0.1em]">
                    <th className="py-2.5 px-3">RANK</th>
                    <th className="py-2.5 px-3 text-right">VOLUME REQUIRED</th>
                    <th className="py-2.5 px-3 text-right">STRONG LEG</th>
                    <th className="py-2.5 px-3 text-right">OTHER LEGS</th>
                    <th className="py-2.5 px-3 text-right">SHARE %</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((tier) => {
                    const isCurrent = tier.rank === currentRank;
                    const isAchieved = tier.rank <= currentRank;
                    return (
                      <tr key={tier.rank} className={`border-b border-white/5 ${isCurrent ? 'bg-gold/5' : isAchieved ? 'bg-green/3' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[1.2rem]">{RANK_ICONS[tier.rank]}</span>
                            <span className={`font-orbitron text-[0.65rem] font-bold ${isCurrent ? 'text-gold' : isAchieved ? 'text-green' : 'text-white/50'}`}>
                              {RANK_NAMES[tier.rank]}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-orbitron text-white/60 text-right">${fmt(tier.totalVolume, 0)}</td>
                        <td className="py-3 px-3 font-orbitron text-white/40 text-right">${fmt(tier.strongLegRequired, 0)}</td>
                        <td className="py-3 px-3 font-orbitron text-white/40 text-right">${fmt(tier.otherLegsRequired, 0)}</td>
                        <td className="py-3 px-3 font-orbitron text-gold text-right">{tier.percent}%</td>
                        <td className="py-3 px-3 text-center">
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.6rem]">CURRENT</span>
                          ) : isAchieved ? (
                            <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/30 text-green font-orbitron text-[0.6rem]">ACHIEVED</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 font-orbitron text-[0.6rem]">LOCKED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                    <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em] border-b border-white/10">
                      <th className="py-2 px-2">DATE</th>
                      <th className="py-2 px-2">RANK</th>
                      <th className="py-2 px-2 text-right">DEPOSITS</th>
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
      <div className="text-[0.68rem] text-white/30 font-orbitron mt-0.5 text-right">
        {fmt(pct, 1)}% complete
      </div>
    </div>
  );
}
