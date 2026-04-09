import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt } from '../lib/format';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function GameHistory() {
  const [mode, setMode] = useState('cash'); // 'cash' | 'practice'
  const [date, setDate] = useState(''); // empty = all dates
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ entries: [], total: 0, stats: {} });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 20, mode };
      if (date) params.date = date;
      const { data: res } = await api.get('/api/game/my-entries', { params });
      setData(res);
    } catch {}
    setLoading(false);
  }, [page, mode, date]);

  useEffect(() => {
    setPage(1);
  }, [mode, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const s = data.stats || {};
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / 20));

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
                Game History
              </h1>
            </div>
            <Link
              to="/game"
              className="px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.6rem] hover:bg-gold/20"
            >
              PLAY NOW
            </Link>
          </div>

          {/* Cash / Practice toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('cash')}
              className={`flex-1 py-2.5 rounded-xl font-orbitron text-[0.6rem] font-bold tracking-[0.1em] border transition-all ${
                mode === 'cash'
                  ? 'bg-gold/10 border-gold/40 text-gold shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                  : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20'
              }`}
            >
              REAL CASH
            </button>
            <button
              onClick={() => setMode('practice')}
              className={`flex-1 py-2.5 rounded-xl font-orbitron text-[0.6rem] font-bold tracking-[0.1em] border transition-all ${
                mode === 'practice'
                  ? 'bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_15px_rgba(0,255,255,0.15)]'
                  : 'bg-white/3 border-white/10 text-white/40 hover:border-cyan/20'
              }`}
            >
              PRACTICE
            </button>
          </div>

          {/* Date filter */}
          <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10 flex items-center gap-3 flex-wrap">
            <label className="font-orbitron text-[0.55rem] text-white/40 tracking-[0.1em]">DATE:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
            />
            <button
              onClick={() => setDate(localToday())}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.5rem] hover:border-gold/30 hover:text-gold"
            >
              TODAY
            </button>
            {date && (
              <button
                onClick={() => setDate('')}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.5rem] hover:border-pink/30 hover:text-pink"
              >
                ALL DATES
              </button>
            )}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="TOTAL BETS" value={s.totalBets || 0} color="cyan" type="count" />
            <StatCard label="TOTAL PLAYED" value={s.totalWagered || 0} color="gold" />
            <StatCard label="WINS" value={s.wins || 0} color="green" type="count" />
            <StatCard label="LOSSES" value={s.losses || 0} color="pink" type="count" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="DIRECT PAYOUT" value={s.totalDirectPayout || 0} color="gold" />
            <StatCard label="COMPOUND PAYOUT" value={s.totalCompoundPayout || 0} color="purple" />
            <StatCard label="TOTAL PAYOUT" value={s.totalPayout || 0} color="green" />
            <StatCard
              label="NET P&L"
              value={s.netPL || 0}
              color={(s.netPL || 0) >= 0 ? 'green' : 'pink'}
              signed
            />
          </div>
          {(s.pending || 0) > 0 && (
            <div className="text-[0.55rem] text-yellow-400 font-orbitron mb-4">
              {s.pending} entries still pending result
            </div>
          )}

          {/* Entries list */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
            ) : data.entries.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
                No {mode === 'practice' ? 'practice' : 'cash'} entries found{date ? ` for ${date}` : ''}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-[0.6rem]">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.1em]">
                        <th className="py-2.5 px-3">GAME</th>
                        <th className="py-2.5 px-3">TIME</th>
                        <th className="py-2.5 px-3 text-center">MY DIGIT</th>
                        <th className="py-2.5 px-3 text-center">WINNING</th>
                        <th className="py-2.5 px-3 text-right">BET</th>
                        <th className="py-2.5 px-3">SOURCE</th>
                        <th className="py-2.5 px-3 text-center">RESULT</th>
                        <th className="py-2.5 px-3 text-right">DIRECT</th>
                        <th className="py-2.5 px-3 text-right">COMPOUND</th>
                        <th className="py-2.5 px-3 text-right">NET</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.map((e) => {
                        const g = e.gameId || {};
                        const totalPay = (e.directPayout || 0) + (e.compoundPayout || 0);
                        const net = totalPay - e.amount;
                        const isWin = e.isWin === true;
                        const isLoss = e.isWin === false;
                        const isPending = e.isWin === undefined || e.isWin === null;
                        return (
                          <tr key={e._id} className="border-b border-white/5 hover:bg-white/3">
                            <td className="py-2 px-3 font-orbitron text-white/70">
                              #{g.gameNumber}
                              <span className="text-white/20 ml-1 text-[0.45rem]">{g.date}</span>
                            </td>
                            <td className="py-2 px-3 text-white/40 font-orbitron text-[0.5rem]">
                              {e.createdAt
                                ? new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`font-russo text-[1.1rem] ${isWin ? 'text-green' : isLoss ? 'text-pink' : 'text-white'}`}>
                                {e.digit}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {g.status === 'RESULTED' ? (
                                <span className="font-russo text-[1.1rem] text-gold">{g.winningDigit}</span>
                              ) : (
                                <span className="text-white/20">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-gold text-right">{fmt(e.amount)}</td>
                            <td className="py-2 px-3 font-orbitron text-[0.5rem] text-white/40">
                              {walletLabel(e.walletType, e.digit)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isPending ? (
                                <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-orbitron text-[0.45rem]">
                                  PENDING
                                </span>
                              ) : isWin ? (
                                <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green font-orbitron text-[0.45rem]">
                                  WIN
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/20 text-pink font-orbitron text-[0.45rem]">
                                  LOSS
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-green text-right">
                              {isWin ? `+${fmt(e.directPayout || 0)}` : '-'}
                            </td>
                            <td className="py-2 px-3 font-orbitron text-purple text-right">
                              {isWin ? `+${fmt(e.compoundPayout || 0)}` : '-'}
                            </td>
                            <td className={`py-2 px-3 font-orbitron text-right font-bold ${
                              isPending ? 'text-yellow-400' : net >= 0 ? 'text-green' : 'text-pink'
                            }`}>
                              {isPending ? 'TBD' : `${net >= 0 ? '+' : ''}${fmt(net)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-2 p-3">
                  {data.entries.map((e) => {
                    const g = e.gameId || {};
                    const totalPay = (e.directPayout || 0) + (e.compoundPayout || 0);
                    const net = totalPay - e.amount;
                    const isWin = e.isWin === true;
                    const isLoss = e.isWin === false;
                    const isPending = e.isWin === undefined || e.isWin === null;
                    return (
                      <div key={e._id} className={`p-3 rounded-xl border ${
                        isWin ? 'border-green/20 bg-green/5' : isLoss ? 'border-pink/20 bg-pink/5' : 'border-white/10 bg-white/3'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-orbitron text-white/60 text-[0.55rem]">
                            Game #{g.gameNumber} · {g.date}
                          </span>
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-orbitron text-[0.45rem]">PENDING</span>
                          ) : isWin ? (
                            <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green font-orbitron text-[0.45rem]">WIN</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/20 text-pink font-orbitron text-[0.45rem]">LOSS</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-center">
                            <div className="text-[0.4rem] text-white/30 font-orbitron">MY PICK</div>
                            <div className={`font-russo text-[1.5rem] ${isWin ? 'text-green' : isLoss ? 'text-pink' : 'text-white'}`}>
                              {e.digit}
                            </div>
                          </div>
                          {g.status === 'RESULTED' && (
                            <>
                              <div className="text-white/20 font-orbitron text-[0.8rem]">vs</div>
                              <div className="text-center">
                                <div className="text-[0.4rem] text-white/30 font-orbitron">WINNING</div>
                                <div className="font-russo text-[1.5rem] text-gold">{g.winningDigit}</div>
                              </div>
                            </>
                          )}
                          <div className="ml-auto text-right">
                            <div className="text-[0.4rem] text-white/30 font-orbitron">BET</div>
                            <div className="font-orbitron text-gold text-[0.8rem]">{fmt(e.amount)}</div>
                          </div>
                        </div>
                        {isWin && (
                          <div className="flex gap-3 text-[0.55rem] font-orbitron">
                            <span className="text-green">Direct: +{fmt(e.directPayout || 0)}</span>
                            <span className="text-purple">Compound: +{fmt(e.compoundPayout || 0)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[0.45rem] text-white/30 font-orbitron">{walletLabel(e.walletType, e.digit)}</span>
                          <span className={`font-orbitron text-[0.7rem] font-bold ${
                            isPending ? 'text-yellow-400' : net >= 0 ? 'text-green' : 'text-pink'
                          }`}>
                            {isPending ? 'TBD' : `${net >= 0 ? '+' : ''}${fmt(net)} USDT`}
                          </span>
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

function walletLabel(type, digit) {
  if (type === 'GAME_WALLET') return 'Game Wallet';
  if (type === 'COMPOUND_SLOT') return `Compound #${digit}`;
  if (type === 'PRACTICE') return 'Practice';
  return type;
}

function StatCard({ label, value, color, type = 'usdt', signed }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    pink: 'text-pink border-pink/20',
    gold: 'text-gold border-gold/20',
    purple: 'text-purple border-purple/20',
  }[color];
  let display;
  if (type === 'count') {
    display = value || 0;
  } else if (signed) {
    display = `${value >= 0 ? '+' : ''}${fmt(value)}`;
  } else {
    display = fmt(value);
  }
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
