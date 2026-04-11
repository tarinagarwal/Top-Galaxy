import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { fmt } from '../../lib/format';

const STATUS_STYLES = {
  UPCOMING: { color: 'text-white/60 border-white/20 bg-white/5', label: 'UPCOMING' },
  OPEN: { color: 'text-cyan border-cyan/30 bg-cyan/10', label: '⏱️ OPEN' },
  CLOSED: { color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', label: '🔒 CLOSED' },
  RESULTED: { color: 'text-green border-green/30 bg-green/10', label: '✅ RESULTED' },
};

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminGames() {
  const canOps = useAuthStore((s) => s.isOperationalAdmin);
  const [date, setDate] = useState(todayString());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [forceGame, setForceGame] = useState(null); // game object for force-result modal
  const [detailGame, setDetailGame] = useState(null); // game object for detail modal
  const [viewMode, setViewMode] = useState('cash'); // 'cash' | 'practice'

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [gamesRes, configRes] = await Promise.all([
        api.get('/api/admin/games', { params: { date } }),
        api.get('/api/admin/config'),
      ]);
      setGames(gamesRes.data.games || []);
      // GAMES_PAUSED could be in any category — most likely "Game" or "Other"
      const all = configRes.data.config || {};
      let pausedVal = false;
      for (const cat of Object.values(all)) {
        if (typeof cat === 'object' && 'GAMES_PAUSED' in cat) {
          pausedVal = !!cat.GAMES_PAUSED;
          break;
        }
      }
      setPaused(pausedVal);
    } catch {}
    setLoading(false);
  }, [date]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const togglePause = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const endpoint = paused ? '/api/admin/games/resume' : '/api/admin/games/pause';
      await api.post(endpoint);
      setPaused(!paused);
      setFeedback({
        type: 'success',
        message: paused ? '✓ Game entries resumed' : '⏸️ Game entries paused',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Action failed',
      });
    } finally {
      setBusy(false);
    }
  };

  // Aggregate stats from breakdown data (not from stale game fields)
  const totals = games.reduce(
    (acc, g) => {
      const b = g.breakdown || {};
      const isCash = viewMode === 'cash';
      return {
        entries: acc.entries + (isCash ? (b.cashEntries || 0) : (b.practiceEntries || 0)),
        played: acc.played + (isCash ? (b.cashAmount || 0) : (b.practiceAmount || 0)),
        payout: acc.payout + (isCash ? (b.cashPayout || 0) : (b.practicePayout || 0)),
        retained: acc.retained + (isCash ? (b.cashRetained || 0) : (b.practiceRetained || 0)),
      };
    },
    { entries: 0, played: 0, payout: 0, retained: 0 }
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
            🛡️ ADMIN
          </div>
          <h1 className="font-russo text-[2rem] text-gradient-gold">Games</h1>
        </div>

        <button
          onClick={togglePause}
          disabled={busy}
          className={`px-5 py-2.5 rounded-xl font-orbitron text-[0.65rem] font-bold tracking-[0.12em] border transition-all disabled:opacity-50 ${
            paused
              ? 'bg-green/10 border-green/40 text-green hover:bg-green/20'
              : 'bg-pink/10 border-pink/40 text-pink hover:bg-pink/20'
          }`}
        >
          {busy ? '⏳ ...' : paused ? '▶️ RESUME GAME ENTRIES' : '⏸️ PAUSE GAME ENTRIES'}
        </button>
      </div>

      {paused && (
        <div className="card-glass rounded-2xl p-4 mb-4 border border-pink/30 bg-pink/5">
          <div className="font-orbitron text-pink text-[0.7rem]">
            ⚠️ GAMES PAUSED — New entries are blocked. Existing entries will still resolve normally.
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`card-glass rounded-2xl p-3 mb-4 border ${
            feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
          } text-[0.7rem]`}
        >
          {feedback.message}
        </div>
      )}

      {/* Cash / Practice toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('cash')}
          className={`flex-1 py-2.5 rounded-xl font-orbitron text-[0.6rem] font-bold tracking-[0.1em] border transition-all ${
            viewMode === 'cash'
              ? 'bg-gold/10 border-gold/40 text-gold shadow-[0_0_15px_rgba(255,215,0,0.15)]'
              : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20'
          }`}
        >
          💰 CASH ENTRIES
        </button>
        <button
          onClick={() => setViewMode('practice')}
          className={`flex-1 py-2.5 rounded-xl font-orbitron text-[0.6rem] font-bold tracking-[0.1em] border transition-all ${
            viewMode === 'practice'
              ? 'bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_15px_rgba(0,255,255,0.15)]'
              : 'bg-white/3 border-white/10 text-white/40 hover:border-cyan/20'
          }`}
        >
          🎮 PRACTICE ENTRIES
        </button>
      </div>

      {/* Date selector */}
      <div className="card-glass rounded-2xl p-4 mb-4 border border-white/10 flex items-center gap-3 flex-wrap">
        <label className="font-orbitron text-[0.6rem] text-white/40 tracking-[0.1em]">DATE:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50"
        />
        <button
          onClick={() => setDate(todayString())}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:border-gold/30 hover:text-gold"
        >
          TODAY
        </button>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="GAMES" value={games.length} color="cyan" type="count" />
        <StatCard label="TOTAL ENTRIES" value={totals.entries} color="purple" type="count" />
        <StatCard label="TOTAL PLAYED" value={totals.played} color="gold" />
        <StatCard label="TOTAL PAYOUT" value={totals.payout} color="pink" />
        <StatCard label="RETAINED" value={totals.retained} color="green" />
      </div>

      {/* Games table */}
      <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No games scheduled for {date}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">SCHEDULED</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3 text-right">ENTRIES</th>
                  <th className="py-3 px-3 text-right">PLAYED</th>
                  <th className="py-3 px-3 text-right">WINNERS</th>
                  <th className="py-3 px-3 text-right">PAYOUT</th>
                  <th className="py-3 px-3 text-center">DIGIT</th>
                  <th className="py-3 px-3 text-right">RETAINED</th>
                  <th className="py-3 px-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => {
                  const style = STATUS_STYLES[g.status] || STATUS_STYLES.UPCOMING;
                  const b = g.breakdown || {};
                  const rowEntries = viewMode === 'cash' ? (b.cashEntries || 0) : (b.practiceEntries || 0);
                  const rowPlayed = viewMode === 'cash' ? (b.cashAmount || 0) : (b.practiceAmount || 0);
                  return (
                    <tr key={g._id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer" onClick={() => setDetailGame(g)}>
                      <td className="py-2.5 px-3 font-orbitron text-white/70">#{g.gameNumber}</td>
                      <td className="py-2.5 px-3 font-orbitron text-white/40 text-[0.55rem]">
                        {g.scheduledAt
                          ? new Date(g.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.5rem] ${style.color}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-cyan text-right">
                        {rowEntries}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-gold text-right">
                        {fmt(rowPlayed)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-purple text-right">
                        {g.totalWinners || 0}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-pink text-right">
                        {fmt(viewMode === 'cash' ? (b.cashPayout || 0) : (b.practicePayout || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {g.status === 'RESULTED' ? (
                          <span className="font-russo text-[1.1rem] text-gold">
                            {g.winningDigit}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-green text-right">
                        {fmt(viewMode === 'cash' ? (b.cashRetained || 0) : (b.practiceRetained || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {g.status !== 'RESULTED' && canOps && ((b.cashEntries || 0) + (b.practiceEntries || 0)) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setForceGame(g); }}
                            className="px-2 py-1 rounded bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.5rem] hover:bg-pink/20"
                          >
                            🎯 FORCE
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Game Detail Modal */}
      {detailGame && (
        <GameDetailModal
          game={detailGame}
          onClose={() => setDetailGame(null)}
          onForce={(g) => { setDetailGame(null); setForceGame(g); }}
          canOps={canOps}
        />
      )}
      {/* Force Result Modal */}
      {forceGame && (
        <ForceResultModal
          game={forceGame}
          onClose={() => setForceGame(null)}
          onDone={() => { setForceGame(null); refresh(); }}
        />
      )}
    </AdminLayout>
  );
}

function ForceResultModal({ game, onClose, onDone }) {
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [detail, setDetail] = useState(null);
  const [viewMode, setViewMode] = useState('cash'); // 'cash' | 'practice'

  // Fetch per-digit breakdown on mount
  useEffect(() => {
    api.get(`/api/admin/games/${game._id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => {});
  }, [game._id]);

  const perDigit = detail?.breakdown?.perDigit || [];

  const handleForce = async () => {
    if (selectedDigit === null) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.post(`/api/admin/games/${game._id}/force-result`, {
        winningDigit: selectedDigit,
      });
      setFeedback({
        type: 'success',
        message: `Game #${game.gameNumber} resulted with digit ${selectedDigit} — ${data.processed?.wins || 0} winners, ${data.processed?.losses || 0} losses`,
      });
      setTimeout(onDone, 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Force result failed' });
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card-glass rounded-2xl border border-pink/30 max-w-[500px] w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="font-orbitron text-pink text-[0.85rem] font-bold mb-2">
          🎯 FORCE RESULT — Game #{game.gameNumber}
        </div>

        {/* Cash / Practice toggle */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setViewMode('cash')}
            className={`flex-1 py-1.5 rounded-lg font-orbitron text-[0.5rem] border transition-all ${
              viewMode === 'cash' ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-white/3 border-white/10 text-white/40'
            }`}>
            💰 CASH — {detail?.breakdown?.cash?.entries || 0} entries · {fmt(detail?.breakdown?.cash?.amount || 0)} USDT
          </button>
          <button onClick={() => setViewMode('practice')}
            className={`flex-1 py-1.5 rounded-lg font-orbitron text-[0.5rem] border transition-all ${
              viewMode === 'practice' ? 'bg-cyan/10 border-cyan/40 text-cyan' : 'bg-white/3 border-white/10 text-white/40'
            }`}>
            🎮 PRACTICE — {detail?.breakdown?.practice?.entries || 0} entries · {fmt(detail?.breakdown?.practice?.amount || 0)} USDT
          </button>
        </div>

        <div className="text-[0.6rem] text-yellow-400 mb-3">
          ⚠️ The selected digit will be the winner for BOTH cash and practice entries. Cannot be undone.
        </div>

        {/* Digit picker with per-digit amounts */}
        <div className="mb-4">
          <div className="text-[0.55rem] text-white/40 font-orbitron mb-2">SELECT WINNING DIGIT</div>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
              const info = perDigit.find((p) => p.digit === d) || {};
              const amt = viewMode === 'cash' ? (info.cashAmount || 0) : (info.practiceAmount || 0);
              const cnt = viewMode === 'cash' ? (info.cashCount || 0) : (info.practiceCount || 0);
              const isLowest = perDigit.length > 0 && amt === Math.min(...perDigit.map((p) => viewMode === 'cash' ? (p.cashAmount || 0) : (p.practiceAmount || 0)));

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDigit(d)}
                  className={`py-2 rounded-xl border-2 transition-all text-center ${
                    selectedDigit === d
                      ? 'bg-gold/20 border-gold text-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                      : isLowest && amt === 0
                      ? 'bg-green/5 border-green/20 text-white/60 hover:border-gold/30'
                      : 'bg-white/3 border-white/10 text-white/60 hover:border-gold/30 hover:text-gold'
                  }`}
                >
                  <div className="font-russo text-[1.3rem]">{d}</div>
                  <div className={`text-[0.45rem] font-orbitron mt-0.5 ${amt > 0 ? 'text-pink' : 'text-green'}`}>
                    {cnt > 0 ? `${fmt(amt)}` : '—'}
                  </div>
                  {cnt > 0 && <div className="text-[0.4rem] text-white/30">{cnt} bet{cnt > 1 ? 's' : ''}</div>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[0.5rem] text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green/30 border border-green/30"></span> No bets (max profit)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink/30 border border-pink/30"></span> Has bets (payout required)</span>
          </div>
        </div>

        {feedback && (
          <div className={`text-[0.65rem] mb-4 px-3 py-2 rounded-lg ${
            feedback.type === 'success' ? 'bg-green/5 border border-green/20 text-green' : 'bg-pink/5 border border-pink/20 text-pink'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem]"
          >
            CANCEL
          </button>
          <button
            onClick={handleForce}
            disabled={busy || selectedDigit === null}
            className="flex-1 py-2.5 rounded-xl bg-pink/10 border border-pink/40 text-pink font-orbitron text-[0.6rem] font-bold hover:bg-pink/20 disabled:opacity-30"
          >
            {busy ? '⏳ EXECUTING...' : selectedDigit !== null ? `FORCE DIGIT ${selectedDigit}` : 'SELECT A DIGIT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GameDetailModal({ game, onClose, onForce, canOps }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview'); // 'overview' | 'entries'

  useEffect(() => {
    api.get(`/api/admin/games/${game._id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [game._id]);

  const g = detail?.game || game;
  const entries = detail?.entries || [];
  const bd = detail?.breakdown || {};
  const perDigit = bd.perDigit || [];
  const style = STATUS_STYLES[g.status] || STATUS_STYLES.UPCOMING;

  const cashEntries = entries.filter((e) => e.walletType !== 'PRACTICE');
  const practiceEntries = entries.filter((e) => e.walletType === 'PRACTICE');
  const cashPayout = cashEntries.reduce((s, e) => s + (e.directPayout || 0) + (e.compoundPayout || 0), 0);
  const practicePayout = practiceEntries.reduce((s, e) => s + (e.directPayout || 0) + (e.compoundPayout || 0), 0);
  const cashPlayed = cashEntries.reduce((s, e) => s + e.amount, 0);
  const practicePlayed = practiceEntries.reduce((s, e) => s + e.amount, 0);
  const maxDigitAmount = Math.max(...perDigit.map((p) => (p.cashAmount || 0) + (p.practiceAmount || 0)), 1);

  return (
    <div className="fixed inset-0 z-[1100] bg-black/85 flex items-start justify-center p-4 pt-[60px] overflow-y-auto" onClick={onClose}>
      <div className="card-glass rounded-2xl border border-white/15 max-w-[800px] w-full p-6 mb-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-russo text-[1.5rem] text-gradient-gold">Game #{g.gameNumber}</div>
            <div className="font-orbitron text-[0.6rem] text-white/40 mt-1">
              {g.date} · Phase {g.phase} · {g.phase === 1 ? '8x' : '4x'} multiplier
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full border font-orbitron text-[0.55rem] ${style.color}`}>
              {style.label}
            </span>
            {g.status === 'RESULTED' && (
              <div className="text-center">
                <div className="text-[0.4rem] text-white/30 font-orbitron">WINNING</div>
                <div className="font-russo text-[1.8rem] text-gold leading-none">{g.winningDigit}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-white/10 pb-2">
          {['overview', 'entries'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-orbitron text-[0.55rem] transition-all ${
                tab === t ? 'bg-gold/10 border border-gold/30 text-gold' : 'text-white/40 hover:text-white/60'
              }`}>
              {t === 'overview' ? '📊 OVERVIEW' : '📋 ENTRIES'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/40 font-orbitron text-[0.65rem]">Loading game data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                  <MiniStat label="CASH ENTRIES" value={cashEntries.length} type="count" color="cyan" />
                  <MiniStat label="CASH PLAYED" value={cashPlayed} color="gold" />
                  <MiniStat label="CASH PAYOUT" value={cashPayout} color="pink" />
                  <MiniStat label="CASH RETAINED" value={cashPlayed - cashPayout} color="green" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                  <MiniStat label="PRACTICE ENTRIES" value={practiceEntries.length} type="count" color="cyan" />
                  <MiniStat label="PRACTICE PLAYED" value={practicePlayed} color="gold" />
                  <MiniStat label="PRACTICE PAYOUT" value={practicePayout} color="pink" />
                  <MiniStat label="PRACTICE RETAINED" value={practicePlayed - practicePayout} color="green" />
                </div>

                {/* Per-digit breakdown */}
                <div className="mb-5">
                  <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.1em] mb-3">PER-DIGIT BREAKDOWN</div>
                  <div className="space-y-1.5">
                    {perDigit.map((p) => {
                      const total = (p.cashAmount || 0) + (p.practiceAmount || 0);
                      const pct = maxDigitAmount > 0 ? (total / maxDigitAmount) * 100 : 0;
                      const isWinner = g.status === 'RESULTED' && p.digit === g.winningDigit;
                      return (
                        <div key={p.digit} className={`flex items-center gap-3 p-2 rounded-lg ${isWinner ? 'bg-gold/10 border border-gold/30' : 'bg-white/3'}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-russo text-[0.9rem] ${
                            isWinner ? 'bg-gold/20 text-gold' : 'bg-white/5 text-white/50'
                          }`}>
                            {p.digit}
                          </div>
                          <div className="flex-1">
                            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-cyan/60 to-purple/60"
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <span className="font-orbitron text-[0.55rem] text-gold">{fmt(p.cashAmount || 0, 3)}</span>
                            <span className="text-white/20 mx-1">|</span>
                            <span className="font-orbitron text-[0.55rem] text-cyan">{fmt(p.practiceAmount || 0, 3)}</span>
                          </div>
                          <div className="text-right min-w-[40px]">
                            <span className="font-orbitron text-[0.45rem] text-white/30">
                              {(p.cashCount || 0) + (p.practiceCount || 0)} bets
                            </span>
                          </div>
                          {isWinner && <span className="text-gold text-[0.7rem]">🏆</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-[0.45rem] text-white/30 font-orbitron">
                    <span><span className="text-gold">Gold</span> = Cash</span>
                    <span><span className="text-cyan">Cyan</span> = Practice</span>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-white/3">
                    <div className="text-[0.4rem] text-white/30 font-orbitron">SCHEDULED</div>
                    <div className="text-[0.55rem] text-white/60 font-orbitron">{g.scheduledAt ? new Date(g.scheduledAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <div className="text-[0.4rem] text-white/30 font-orbitron">CUTOFF</div>
                    <div className="text-[0.55rem] text-white/60 font-orbitron">{g.cutoffAt ? new Date(g.cutoffAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <div className="text-[0.4rem] text-white/30 font-orbitron">RESULTED</div>
                    <div className="text-[0.55rem] text-white/60 font-orbitron">{g.resultAt ? new Date(g.resultAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <div className="text-[0.4rem] text-white/30 font-orbitron">CREATED</div>
                    <div className="text-[0.55rem] text-white/60 font-orbitron">{g.createdAt ? new Date(g.createdAt).toLocaleString() : '—'}</div>
                  </div>
                </div>
              </>
            )}

            {/* ENTRIES TAB */}
            {tab === 'entries' && (
              entries.length === 0 ? (
                <div className="text-center py-8 text-white/30 font-orbitron text-[0.65rem]">No entries for this game</div>
              ) : (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-[0.6rem]">
                    <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                      <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.08em]">
                        <th className="py-2 px-2">USER</th>
                        <th className="py-2 px-2 text-center">DIGIT</th>
                        <th className="py-2 px-2 text-right">AMOUNT</th>
                        <th className="py-2 px-2">SOURCE</th>
                        <th className="py-2 px-2 text-center">RESULT</th>
                        <th className="py-2 px-2 text-right">DIRECT</th>
                        <th className="py-2 px-2 text-right">COMPOUND</th>
                        <th className="py-2 px-2 text-right">NET</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => {
                        const totalPay = (e.directPayout || 0) + (e.compoundPayout || 0);
                        const net = totalPay - e.amount;
                        const isWin = e.isWin === true;
                        const isLoss = e.isWin === false;
                        const isPending = e.isWin === undefined || e.isWin === null;
                        const addr = e.userId?.walletAddress;
                        const short = addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';
                        return (
                          <tr key={e._id} className={`border-b border-white/5 ${isWin ? 'bg-green/3' : isLoss ? 'bg-pink/3' : ''}`}>
                            <td className="py-2 px-2 font-orbitron text-cyan text-[0.5rem]">{short}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-russo text-[0.9rem] ${isWin ? 'text-green' : isLoss ? 'text-pink' : 'text-white'}`}>{e.digit}</span>
                            </td>
                            <td className="py-2 px-2 font-orbitron text-gold text-right">{fmt(e.amount, 3)}</td>
                            <td className="py-2 px-2 font-orbitron text-white/40 text-[0.45rem]">
                              {e.walletType === 'GAME_WALLET' ? 'Game' : e.walletType === 'COMPOUND_SLOT' ? `Cmpd#${e.digit}` : 'Practice'}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {isPending ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-orbitron text-[0.4rem]">PENDING</span>
                              ) : isWin ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-green/10 border border-green/20 text-green font-orbitron text-[0.4rem]">WIN</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full bg-pink/10 border border-pink/20 text-pink font-orbitron text-[0.4rem]">LOSS</span>
                              )}
                            </td>
                            <td className="py-2 px-2 font-orbitron text-green text-right text-[0.5rem]">
                              {isWin ? `+${fmt(e.directPayout || 0, 3)}` : '—'}
                            </td>
                            <td className="py-2 px-2 font-orbitron text-purple text-right text-[0.5rem]">
                              {isWin ? `+${fmt(e.compoundPayout || 0, 3)}` : '—'}
                            </td>
                            <td className={`py-2 px-2 font-orbitron text-right font-bold text-[0.5rem] ${
                              isPending ? 'text-yellow-400' : net >= 0 ? 'text-green' : 'text-pink'
                            }`}>
                              {isPending ? 'TBD' : `${net >= 0 ? '+' : ''}${fmt(net, 3)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

          </>
        )}

        {/* Footer actions */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem]">
            CLOSE
          </button>
          {g.status !== 'RESULTED' && canOps && entries.length > 0 && (
            <button onClick={() => onForce(g)}
              className="flex-1 py-2.5 rounded-xl bg-pink/10 border border-pink/40 text-pink font-orbitron text-[0.6rem] font-bold hover:bg-pink/20">
              🎯 FORCE RESULT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, type = 'usdt' }) {
  const c = { cyan: 'text-cyan', green: 'text-green', pink: 'text-pink', gold: 'text-gold', purple: 'text-purple' }[color];
  return (
    <div className="p-2 rounded-lg bg-white/3 border border-white/5">
      <div className="text-[0.4rem] text-white/60 font-orbitron font-bold tracking-[0.08em]">{label}</div>
      <div className={`font-orbitron font-bold text-[0.85rem] ${c}`}>
        {type === 'count' ? value : fmt(value, 3)}
        {type !== 'count' && <span className="text-[0.4rem] text-white/20 ml-0.5">USDT</span>}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, type = 'usdt' }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    pink: 'text-pink border-pink/20',
    gold: 'text-gold border-gold/20',
    purple: 'text-purple border-purple/20',
  }[color];
  const display = type === 'count' ? value || 0 : fmt(value);
  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass}`}>
      <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">{label}</div>
      <div className={`font-orbitron font-bold text-[1.3rem] ${colorClass.split(' ')[0]}`}>
        {display}
        {type !== 'count' && <span className="text-[0.55rem] text-white/30 ml-1">USDT</span>}
      </div>
    </div>
  );
}
