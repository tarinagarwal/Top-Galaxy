import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';

const STREAMS = [
  {
    key: 'GAME_WINNINGS',
    icon: '🎯',
    name: 'Game Winnings',
    color: 'gold',
    description: 'Direct payout (2x) from winning games. Credited to your winnings wallet and available for withdrawal.',
  },
  {
    key: 'DIRECT_REFERRAL',
    icon: '⭐',
    name: 'Direct Referral',
    color: 'cyan',
    description: 'Commission on all downline deposits. L1=5%, L2=2%, L3-5=1%, L6-15=0.5%. BASIC unlocks L1-3, PRO unlocks all 15.',
  },
  {
    key: 'WINNERS_REFERRAL',
    icon: '🏅',
    name: 'Winners Referral',
    color: 'pink',
    description: 'Earn when downline wins a game. Percentages applied directly to bet amount: L1=5%, L2=2%, L3-5=1%, L6-15=0.5% = 15% total distributed across 15 uplines.',
  },
  {
    key: 'CASHBACK',
    icon: '🛡️',
    name: 'Cashback',
    color: 'green',
    description: 'Daily cashback on net loss. 0.5% / 0.4% / 0.33% daily depending on platform phase.',
  },
  {
    key: 'ROI_ON_ROI',
    icon: '🔄',
    name: 'ROI on ROI',
    color: 'purple',
    description: '50% of every downline user cashback is distributed across their 15 uplines. L1=20%, L2-5=10%, L6-10=5%, L11-15=3%.',
  },
  {
    key: 'CLUB_INCOME',
    icon: '🏆',
    name: 'Club Income',
    color: 'gold',
    description: 'Daily share of platform turnover. 6 ranks with 50/50 balanced leg rule.',
  },
  {
    key: 'LUCKY_DRAW_WIN',
    icon: '🎰',
    name: 'Lucky Draw',
    color: 'blue',
    description: 'Win from Golden or Silver jackpot draws. 10% win rate, 1000 winners per draw.',
  },
  {
    key: 'PRACTICE_REFERRAL',
    icon: '🎁',
    name: 'Practice Referral',
    color: 'silver',
    description: 'Frozen referral rewards from practice signups. Unlocks on practice→real conversion.',
  },
];

export default function Income() {
  const [activeStream, setActiveStream] = useState('GAME_WINNINGS');
  const [aggregates, setAggregates] = useState({});
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeStream, page, pageSize: 25 };
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/api/user/income', { params });
      setRows(data.rows || []);
      setTotal(data.total || 0);
      setAggregates(data.aggregates || {});
    } catch {}
    setLoading(false);
  }, [activeStream, page, from, to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeMeta = STREAMS.find((s) => s.key === activeStream);
  const activeAgg = aggregates[activeStream] || { lifetime: 0, thisMonth: 0, today: 0, count: 0 };
  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-purple uppercase mb-2">
              💰 INCOME HISTORY
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">Income</h1>
            <p className="text-white/40 text-[0.75rem] mt-1">
              Detailed breakdown of earnings from all 7 income streams
            </p>
          </div>

          {/* Stream tabs */}
          <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {STREAMS.map((s) => {
                const agg = aggregates[s.key];
                const lifetime = num(agg?.lifetime);
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setActiveStream(s.key);
                      setPage(1);
                    }}
                    className={`px-3 py-2 rounded-lg border transition-all text-left ${
                      activeStream === s.key
                        ? 'bg-gold/10 border-gold/40 text-gold'
                        : 'bg-white/3 border-white/10 text-white/50 hover:border-gold/20 hover:text-gold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[1rem]">{s.icon}</span>
                      <div>
                        <div className="font-orbitron text-[0.68rem] tracking-[0.1em]">{s.name}</div>
                        <div className="font-orbitron text-[0.68rem] opacity-70">{fmt(lifetime)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active stream header */}
          {activeMeta && (
            <div className={`card-glass rounded-2xl p-5 mb-4 border border-${activeMeta.color}/30`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-[2rem]">{activeMeta.icon}</span>
                <div className="flex-1">
                  <div className={`font-orbitron text-${activeMeta.color} text-[0.85rem] font-bold`}>
                    {activeMeta.name}
                  </div>
                  <div className="text-[0.65rem] text-white/40 mt-1 leading-relaxed">
                    {activeMeta.description}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <AggCard label="LIFETIME" value={activeAgg.lifetime} color={activeMeta.color} />
                <AggCard label="THIS MONTH" value={activeAgg.thisMonth} color="cyan" />
                <AggCard label="TODAY" value={activeAgg.today} color="green" />
              </div>
            </div>
          )}

          {/* Date range filter */}
          <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10 flex items-center gap-3 flex-wrap">
            <span className="font-orbitron text-[0.68rem] text-white/40 tracking-[0.15em]">FILTER:</span>
            <div className="flex items-center gap-2">
              <label className="text-[0.68rem] text-white/40 font-orbitron">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[0.68rem] text-white/40 font-orbitron">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
              />
            </div>
            {(from || to) && (
              <button
                onClick={() => {
                  setFrom('');
                  setTo('');
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.68rem] hover:border-pink/30 hover:text-pink"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* History table */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
                No income recorded for this stream yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.65rem]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em]">
                      <th className="py-3 px-3">DATE</th>
                      <th className="py-3 px-3">SOURCE</th>
                      <th className="py-3 px-3 text-center">LEVEL</th>
                      <th className="py-3 px-3 text-right">%</th>
                      <th className="py-3 px-3 text-right">BASE</th>
                      <th className="py-3 px-3 text-right">EARNED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r._id} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2.5 px-3 font-orbitron text-white/50 text-[0.68rem]">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-orbitron text-cyan text-[0.68rem]">
                          {activeStream === 'GAME_WINNINGS'
                            ? (r.meta?.gameId ? `Game` : '—')
                            : r.fromUserId?.walletAddress
                            ? `${r.fromUserId.walletAddress.slice(0, 6)}...${r.fromUserId.walletAddress.slice(-4)}`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-orbitron text-purple">
                          {activeStream === 'GAME_WINNINGS'
                            ? (r.meta?.digit !== undefined ? `Digit ${r.meta.digit}` : '—')
                            : r.level ? `L${r.level}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-orbitron text-white/60">
                          {activeStream === 'GAME_WINNINGS'
                            ? (r.meta?.multiplier ? `${r.meta.multiplier}x` : '—')
                            : r.percentage !== undefined && r.percentage !== null
                            ? `${fmt(r.percentage, 2)}%`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-orbitron text-white/60">
                          {fmt(r.baseAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-orbitron text-green">
                          +{fmt(r.earnedAmount, 3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
              >
                ← PREV
              </button>
              <span className="font-orbitron text-[0.65rem] text-white/50 px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AggCard({ label, value, color }) {
  const colorClass = {
    gold: 'text-gold',
    cyan: 'text-cyan',
    green: 'text-green',
    purple: 'text-purple',
    pink: 'text-pink',
    blue: 'text-blue',
    silver: 'text-silver',
  }[color] || 'text-white';

  return (
    <div className="p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="text-[0.65rem] text-white/60 font-orbitron font-bold tracking-[0.1em]">{label}</div>
      <div className={`font-orbitron text-[1rem] font-bold ${colorClass} mt-1`}>{fmt(value)}</div>
      <div className="text-[0.65rem] text-white/30 font-orbitron">USDT</div>
    </div>
  );
}
