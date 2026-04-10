import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';

export default function LuckyDrawHistory() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'all'); // 'all' | 'wins' | 'losses'
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch stats once
  useEffect(() => {
    api.get('/api/luckydraw/my-stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  // Fetch tickets based on tab
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        tab === 'wins' ? '/api/luckydraw/my-wins'
        : tab === 'losses' ? '/api/luckydraw/my-losses'
        : '/api/luckydraw/my-purchases';
      const { data } = await api.get(endpoint, { params: { page, pageSize: 25 } });
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [tab, page]);

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { refresh(); }, [refresh]);

  const s = stats || {};
  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-4 md:px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-purple uppercase mb-1">
                MY HISTORY
              </div>
              <h1 className="font-russo text-[clamp(1.6rem,4vw,2.5rem)] text-gradient-gold">
                Lucky Draw History
              </h1>
            </div>
            <Link
              to="/lucky-draw"
              className="px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.6rem] hover:bg-gold/20"
            >
              BUY TICKETS
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <SC label="TOTAL TICKETS" value={s.totalTickets || 0} color="cyan" type="count" />
            <SC label="TOTAL SPENT" value={s.totalSpent || 0} color="gold" />
            <SC label="WINS" value={s.wins || 0} color="green" type="count" />
            <SC label="LOSSES" value={s.losses || 0} color="pink" type="count" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <SC label="WIN AMOUNT" value={s.winAmount || 0} color="green" />
            <SC label="PENDING" value={s.pending || 0} color="yellow" type="count" />
            <SC label="NET P&L" value={s.netPL || 0} color={(s.netPL || 0) >= 0 ? 'green' : 'pink'} signed />
            <SC label="FROM DEPOSITS (1%)" value={s.totalFromDeposits || 0} color="purple" />
          </div>

          {/* Wallet balances for ticket buying */}
          <div className="card-glass rounded-2xl p-4 mb-4 border border-gold/20">
            <div className="text-[0.5rem] text-white/30 font-orbitron tracking-[0.12em] mb-3">TICKET BUYING BALANCE</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/3 border border-white/5">
                <div className="text-[0.45rem] text-white/30 font-orbitron">GAME WALLET</div>
                <div className="font-orbitron text-gold text-[1rem] font-bold">{fmt(s.gameWallet || 0, 3)}</div>
                <div className="text-[0.4rem] text-white/20">Manual purchases</div>
              </div>
              <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
                <div className="text-[0.45rem] text-white/30 font-orbitron">GOLDEN DRAW</div>
                <div className="font-orbitron text-gold text-[1rem] font-bold">{fmt(s.goldenDrawWallet || 0, 3)}</div>
                <div className="text-[0.4rem] text-white/20">Auto-fund (cashback+ROI)</div>
              </div>
              <div className="p-3 rounded-lg bg-white/3 border border-white/5">
                <div className="text-[0.45rem] text-white/30 font-orbitron">SILVER DRAW</div>
                <div className="font-orbitron text-white/70 text-[1rem] font-bold">{fmt(s.silverDrawWallet || 0, 3)}</div>
                <div className="text-[0.4rem] text-white/20">Auto-fund (cashback+ROI)</div>
              </div>
            </div>
            {(s.goldenFromDeposits > 0 || s.silverFromDeposits > 0) && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[0.55rem]">
                <span className="text-white/30 font-orbitron">DEPOSIT CONTRIBUTIONS (1%):</span>
                <span className="font-orbitron text-gold">Golden: {fmt(s.goldenFromDeposits || 0, 3)}</span>
                <span className="font-orbitron text-white/50">Silver: {fmt(s.silverFromDeposits || 0, 3)}</span>
              </div>
            )}
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 mb-4">
            {[
              { key: 'all', label: 'ALL TICKETS', color: 'cyan' },
              { key: 'wins', label: 'WINS', color: 'green' },
              { key: 'losses', label: 'LOSSES', color: 'pink' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-xl font-orbitron text-[0.55rem] font-bold tracking-[0.1em] border transition-all ${
                  tab === t.key
                    ? `bg-${t.color}/10 border-${t.color}/40 text-${t.color}`
                    : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tickets list */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
                No {tab === 'wins' ? 'winning' : tab === 'losses' ? 'losing' : ''} tickets found
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-[0.6rem]">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.1em]">
                        <th className="py-2.5 px-3">DRAW</th>
                        <th className="py-2.5 px-3">TICKET #</th>
                        <th className="py-2.5 px-3">TYPE</th>
                        <th className="py-2.5 px-3 text-right">COST</th>
                        <th className="py-2.5 px-3 text-center">SOURCE</th>
                        <th className="py-2.5 px-3 text-center">RESULT</th>
                        <th className="py-2.5 px-3 text-right">PRIZE</th>
                        <th className="py-2.5 px-3 text-right">NET</th>
                        <th className="py-2.5 px-3">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => {
                        const draw = t.drawId || {};
                        const isWin = t.outcome === 'WIN';
                        const isLoss = t.outcome === 'LOSS';
                        const isPending = t.outcome === 'PENDING';
                        const net = (t.prizeAmount || 0) - (t.amount || 0);
                        return (
                          <tr key={t._id} className={`border-b border-white/5 ${isWin ? 'bg-green/3' : isLoss ? 'bg-pink/3' : ''}`}>
                            <td className="py-2 px-3 font-orbitron text-white/60">
                              {draw.type || '—'} #{draw.drawNumber || '—'}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-white">
                              #{t.ticketNumber}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.45rem] ${
                                draw.type === 'GOLDEN' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/50'
                              }`}>
                                {draw.type || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-orbitron text-gold text-right">{fmt(t.amount, 3)}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`font-orbitron text-[0.45rem] ${t.purchaseType === 'AUTO_CASHBACK' ? 'text-purple' : 'text-cyan'}`}>
                                {t.purchaseType === 'AUTO_CASHBACK'
                                  ? (draw.type === 'GOLDEN' ? 'Golden Wallet' : 'Silver Wallet')
                                  : 'Game Wallet'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isPending ? (
                                <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-orbitron text-[0.45rem]">PENDING</span>
                              ) : isWin ? (
                                <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green font-orbitron text-[0.45rem]">WIN</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/20 text-pink font-orbitron text-[0.45rem]">LOSS</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-green text-right">
                              {isWin ? `+${fmt(t.prizeAmount, 3)}` : '—'}
                            </td>
                            <td className={`py-2 px-3 font-orbitron text-right font-bold ${
                              isPending ? 'text-yellow-400' : net >= 0 ? 'text-green' : 'text-pink'
                            }`}>
                              {isPending ? 'TBD' : `${net >= 0 ? '+' : ''}${fmt(net, 3)}`}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-white/40 text-[0.5rem]">
                              {t.purchasedAt ? new Date(t.purchasedAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-2 p-3">
                  {tickets.map((t) => {
                    const draw = t.drawId || {};
                    const isWin = t.outcome === 'WIN';
                    const isLoss = t.outcome === 'LOSS';
                    const isPending = t.outcome === 'PENDING';
                    const net = (t.prizeAmount || 0) - (t.amount || 0);
                    return (
                      <div key={t._id} className={`p-3 rounded-xl border ${
                        isWin ? 'border-green/20 bg-green/5' : isLoss ? 'border-pink/20 bg-pink/5' : 'border-white/10 bg-white/3'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.45rem] ${
                              draw.type === 'GOLDEN' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/50'
                            }`}>
                              {draw.type || '—'}
                            </span>
                            <span className="font-orbitron text-white/60 text-[0.55rem]">
                              #{draw.drawNumber} · Ticket #{t.ticketNumber}
                            </span>
                          </div>
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-orbitron text-[0.45rem]">PENDING</span>
                          ) : isWin ? (
                            <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green font-orbitron text-[0.45rem]">WIN</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/20 text-pink font-orbitron text-[0.45rem]">LOSS</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[0.4rem] text-white/30 font-orbitron">COST</div>
                            <div className="font-orbitron text-gold text-[0.7rem]">{fmt(t.amount, 3)}</div>
                          </div>
                          {isWin && (
                            <div>
                              <div className="text-[0.4rem] text-white/30 font-orbitron">PRIZE</div>
                              <div className="font-orbitron text-green text-[0.7rem]">+{fmt(t.prizeAmount, 3)}</div>
                            </div>
                          )}
                          <div className="text-right">
                            <div className="text-[0.4rem] text-white/30 font-orbitron">NET</div>
                            <div className={`font-orbitron text-[0.7rem] font-bold ${
                              isPending ? 'text-yellow-400' : net >= 0 ? 'text-green' : 'text-pink'
                            }`}>
                              {isPending ? 'TBD' : `${net >= 0 ? '+' : ''}${fmt(net, 3)}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[0.45rem] text-white/30 font-orbitron">
                          <span>{t.purchaseType === 'AUTO_CASHBACK'
                              ? ((t.drawId?.type || '') === 'GOLDEN' ? 'Golden Wallet' : 'Silver Wallet')
                              : 'Game Wallet'}</span>
                          <span>{t.purchasedAt ? new Date(t.purchasedAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 p-4 border-t border-white/10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.5rem] disabled:opacity-30"
                    >
                      PREV
                    </button>
                    <span className="font-orbitron text-[0.55rem] text-white/40">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.5rem] disabled:opacity-30"
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SC({ label, value, color, type = 'usdt', signed }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    pink: 'text-pink border-pink/20',
    gold: 'text-gold border-gold/20',
    purple: 'text-purple border-purple/20',
    yellow: 'text-yellow-400 border-yellow-400/20',
  }[color];
  let display;
  if (type === 'count') display = value || 0;
  else if (signed) display = `${value >= 0 ? '+' : ''}${fmt(value, 3)}`;
  else display = fmt(value, 3);
  return (
    <div className={`card-glass rounded-2xl p-3 border ${colorClass}`}>
      <div className="text-[0.45rem] text-white/30 font-orbitron tracking-[0.12em] mb-1">{label}</div>
      <div className={`font-orbitron font-bold text-[1rem] ${colorClass.split(' ')[0]}`}>
        {display}
        {type !== 'count' && <span className="text-[0.45rem] text-white/30 ml-1">USDT</span>}
      </div>
    </div>
  );
}
