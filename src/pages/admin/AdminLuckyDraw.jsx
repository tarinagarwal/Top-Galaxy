import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminLuckyDraw() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const canOps = useAuthStore((s) => s.isOperationalAdmin);

  const [status, setStatus] = useState({ golden: null, silver: null });
  const [stats, setStats] = useState({});
  const [distSummary, setDistSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [selectedDraw, setSelectedDraw] = useState(null); // winners modal
  const [manualDrawId, setManualDrawId] = useState(null); // manual winners panel

  const refresh = useCallback(async () => {
    try {
      const [s, st, h, ds] = await Promise.all([
        api.get('/api/admin/luckydraw/status'),
        api.get('/api/admin/luckydraw/stats').catch(() => ({ data: {} })),
        api.get('/api/luckydraw/history?pageSize=20'),
        api.get('/api/admin/luckydraw/distribution-summary').catch(() => ({ data: {} })),
      ]);
      setStatus(s.data);
      setStats(st.data || {});
      setHistory(h.data.draws || []);
      setDistSummary(ds.data || {});
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  // Real-time timer events
  useSocket({
    'draw:timerStarted': () => refresh(),
    'draw:timerPaused': () => refresh(),
    'draw:timerResumed': () => refresh(),
    'draw:timerUpdated': () => refresh(),
    'draw:cancelled': () => refresh(),
    'draw:triggered': () => refresh(),
    'draw:ticket': () => refresh(),
  });

  // Admin action helper
  const adminAction = async (label, fn) => {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fn();
      setFeedback({ type: 'success', message: `✓ ${label}: ${JSON.stringify(res.data).slice(0, 120)}` });
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: `${label} failed: ${err?.response?.data?.error || err?.message}` });
    }
    setBusy(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Lucky Draw</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Timer controls · Manual winners · Revenue distribution · Draw history
        </p>
      </div>

      {feedback && (
        <div className={`card-glass rounded-xl p-3 mb-4 border text-[0.7rem] ${
          feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="TICKETS TODAY" value={stats.ticketsToday || 0} color="cyan" suffix="" />
        <StatCard label="TICKETS TOTAL" value={stats.ticketsTotal || 0} color="gold" suffix="" />
        <StatCard label="DRAWS COMPLETED" value={stats.drawsResulted || 0} color="green" suffix="" />
        <StatCard label="DRAWS TOTAL" value={stats.drawsTotal || 0} color="purple" suffix="" />
      </div>

      {/* Ticket Revenue Distribution */}
      {distSummary && (distSummary.totalTicketAmount || 0) > 0 && (
        <div className="card-glass rounded-2xl p-5 mb-6 border border-white/10">
          <div className="font-orbitron text-white text-[0.75rem] font-bold mb-3">
            💰 Ticket Revenue Distribution
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">TOTAL REVENUE</div>
              <div className="font-orbitron text-gold text-[0.85rem] font-bold">{fmt(distSummary.totalTicketAmount, 3)}</div>
              <div className="text-[0.4rem] text-white/20">{distSummary.count || 0} purchases</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">CREATOR</div>
              <div className="font-orbitron text-cyan text-[0.85rem]">{fmt(distSummary.totalCreator, 3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">BD (24)</div>
              <div className="font-orbitron text-purple text-[0.85rem]">{fmt(distSummary.totalBD, 3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">FEW</div>
              <div className="font-orbitron text-pink text-[0.85rem]">{fmt(distSummary.totalFEW, 3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">GAME POOL</div>
              <div className="font-orbitron text-cyan text-[0.85rem]">{fmt(distSummary.totalGamePool, 3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-green/5 border border-green/20">
              <div className="text-[0.45rem] text-white/30 font-orbitron">PRIZE POOL</div>
              <div className="font-orbitron text-green text-[0.85rem] font-bold">{fmt(distSummary.totalPrizePool, 3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-[0.45rem] text-white/30 font-orbitron">PRIZE %</div>
              <div className="font-orbitron text-green text-[0.85rem]">
                {distSummary.totalTicketAmount > 0
                  ? fmt((distSummary.totalPrizePool / distSummary.totalTicketAmount) * 100, 1)
                  : '0'}%
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
      ) : (
        <>
          {/* Active draws — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DrawCard
              draw={status.golden}
              type="GOLDEN"
              icon="🏆"
              accent="gold"
              busy={busy}
              canOps={canOps}
              isSuperAdmin={isSuperAdmin}
              onAction={adminAction}
              onManualWinners={(id) => setManualDrawId(id)}
            />
            <DrawCard
              draw={status.silver}
              type="SILVER"
              icon="🥈"
              accent="silver"
              busy={busy}
              canOps={canOps}
              isSuperAdmin={isSuperAdmin}
              onAction={adminAction}
              onManualWinners={(id) => setManualDrawId(id)}
            />
          </div>

          {/* Past draws history table */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden mb-6">
            <div className="p-4 border-b border-white/10 font-orbitron text-purple text-[0.75rem] font-bold">
              📜 DRAW HISTORY
            </div>
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">No draws yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.65rem]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.1em]">
                      <th className="py-3 px-3">TYPE</th>
                      <th className="py-3 px-3">DRAW #</th>
                      <th className="py-3 px-3 text-right">TICKETS</th>
                      <th className="py-3 px-3 text-right">POOL</th>
                      <th className="py-3 px-3 text-right">PRIZE POOL</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3">RESULTED</th>
                      <th className="py-3 px-3 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((d) => (
                      <tr key={d._id} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border ${
                            d.type === 'GOLDEN' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-white/5 text-white/50 border-white/20'
                          }`}>{d.type}</span>
                        </td>
                        <td className="py-2.5 px-3 font-orbitron text-white/70">#{d.drawNumber}</td>
                        <td className="py-2.5 px-3 font-orbitron text-cyan text-right">{d.ticketsSold}</td>
                        <td className="py-2.5 px-3 font-orbitron text-gold text-right">{fmt(d.totalPool)}</td>
                        <td className="py-2.5 px-3 font-orbitron text-green text-right">{fmt(d.prizePool || d.totalPool * 0.7)}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={d.status} /></td>
                        <td className="py-2.5 px-3 font-orbitron text-white/30 text-[0.5rem]">
                          {d.resultedAt ? new Date(d.resultedAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button onClick={() => setSelectedDraw(d)}
                            className="px-2 py-1 rounded bg-purple/10 border border-purple/30 text-purple font-orbitron text-[0.5rem] hover:bg-purple/20">
                            👁️ WINNERS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Manual winners modal */}
      {manualDrawId && (
        <ManualWinnersModal drawId={manualDrawId} onClose={() => { setManualDrawId(null); refresh(); }} />
      )}

      {/* Winners modal */}
      {selectedDraw && (
        <WinnersModal draw={selectedDraw} onClose={() => setSelectedDraw(null)} />
      )}
    </AdminLayout>
  );
}

// ============================================================================
// DrawCard — shows active draw with timer + controls
// ============================================================================
function DrawCard({ draw, type, icon, accent, busy, canOps, isSuperAdmin, onAction, onManualWinners }) {
  if (!draw) {
    return (
      <div className="card-glass rounded-2xl p-6 border border-white/10 text-center text-white/30 font-orbitron text-[0.7rem]">
        No active {type} draw
      </div>
    );
  }

  const ac = accent === 'gold'
    ? { border: 'border-gold/30', text: 'text-gold', bg: 'bg-gold/5', bar: 'from-gold to-gold2' }
    : { border: 'border-white/20', text: 'text-white/60', bg: 'bg-white/3', bar: 'from-white/30 to-white/50' };

  const pct = draw.totalTickets > 0 ? (draw.ticketsSold / draw.totalTickets) * 100 : 0;
  const isActivated = draw.status === 'ACTIVATED';
  const isPaused = draw.status === 'PAUSED';
  const isOpen = draw.status === 'OPEN';

  return (
    <div className={`card-glass rounded-2xl p-5 border ${ac.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[1.8rem]">{icon}</span>
          <div>
            <div className={`font-orbitron text-[0.85rem] font-bold ${ac.text}`}>{type} DRAW</div>
            <div className="text-[0.5rem] text-white/30 font-orbitron">#{draw.drawNumber}</div>
          </div>
        </div>
        <StatusBadge status={draw.status} />
      </div>

      {/* Timer countdown */}
      {isActivated && draw.timerEndsAt && <CountdownTimer timerEndsAt={draw.timerEndsAt} />}
      {isPaused && (
        <div className="text-center py-3 mb-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
          <div className="font-orbitron text-yellow-400 text-[0.7rem]">⏸️ PAUSED</div>
          <div className="text-[0.55rem] text-white/40 mt-1">
            {draw.timerRemainingMs ? `${Math.round(draw.timerRemainingMs / 60000)}m remaining` : ''}
          </div>
        </div>
      )}

      {/* Tickets progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[0.55rem] font-orbitron mb-1">
          <span className="text-white/40">TICKETS</span>
          <span className={ac.text}>{draw.ticketsSold} / {draw.totalTickets}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${ac.bar} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Pool info */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MiniStat label="TOTAL" value={fmt(draw.totalPool)} color={ac.text} />
        <MiniStat label="PRIZE (70%)" value={fmt(draw.prizePool || draw.totalPool * 0.7)} color="text-green" />
        <MiniStat label="ENTRY" value={`${fmt(draw.entryFee)} USDT`} color={ac.text} />
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-2">
        {isOpen && canOps && (
          <CtrlBtn label="▶ FORCE START" color="cyan" disabled={busy || draw.ticketsSold === 0}
            onClick={() => onAction('Force Start', () => api.post('/api/admin/luckydraw/force-start', { drawId: draw._id }))} />
        )}
        {isOpen && canOps && (
          <CtrlBtn label="🎰 TRIGGER NOW" color="pink" disabled={busy || draw.ticketsSold === 0}
            onClick={() => onAction('Trigger', () => api.post('/api/admin/luckydraw/trigger', { drawId: draw._id }))} />
        )}
        {isActivated && canOps && (
          <CtrlBtn label="⏸ PAUSE" color="yellow" disabled={busy}
            onClick={() => onAction('Pause', () => api.post('/api/admin/luckydraw/pause', { drawId: draw._id }))} />
        )}
        {isActivated && canOps && (
          <CtrlBtn label="+30 MIN" color="cyan" disabled={busy}
            onClick={() => onAction('Extend +30m', () => api.post('/api/admin/luckydraw/extend', { drawId: draw._id, minutes: 30 }))} />
        )}
        {isPaused && canOps && (
          <CtrlBtn label="▶ RESUME" color="green" disabled={busy}
            onClick={() => onAction('Resume', () => api.post('/api/admin/luckydraw/resume', { drawId: draw._id }))} />
        )}
        {(isActivated || isPaused) && isSuperAdmin && (
          <CtrlBtn label="⚡ FORCE EXECUTE" color="pink" disabled={busy}
            onClick={() => onAction('Force Execute', () => api.post('/api/admin/luckydraw/force-execute', { drawId: draw._id }))} />
        )}
        {(isOpen || isActivated || isPaused) && isSuperAdmin && (
          <CtrlBtn label="❌ CANCEL + REFUND" color="red" disabled={busy}
            onClick={() => onAction('Cancel', () => api.post('/api/admin/luckydraw/cancel', { drawId: draw._id }))} />
        )}
        {(isOpen || isActivated || isPaused) && isSuperAdmin && (
          <CtrlBtn label="🏆 MANUAL WINNERS" color="purple" disabled={busy}
            onClick={() => onManualWinners(draw._id)} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CountdownTimer
// ============================================================================
function CountdownTimer({ timerEndsAt }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!timerEndsAt) return;
    const target = new Date(timerEndsAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  if (remaining === null) return null;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="text-center py-3 mb-3 rounded-lg bg-gold/5 border border-gold/20">
      <div className="text-[0.5rem] text-white/30 font-orbitron tracking-[0.2em]">DRAW EXECUTES IN</div>
      <div className="font-russo text-[2.2rem] text-gold leading-none mt-1">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
    </div>
  );
}

// ============================================================================
// ManualWinnersModal — bulk paste + single add + remove individual
// ============================================================================
function ManualWinnersModal({ drawId, onClose }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Single add
  const [wallet, setWallet] = useState('');

  // Bulk paste
  const [bulkText, setBulkText] = useState('');
  const [mode, setMode] = useState('bulk'); // 'bulk' | 'single'

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/admin/luckydraw/manual-winners/${drawId}`);
      setWinners(data.manualWinners || []);
    } catch {}
    setLoading(false);
  }, [drawId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Parse bulk text — one address per line (ignores blank lines, trims whitespace)
  // Accepts formats: just address, or "rank,address", or "address,rank"
  const parseBulk = (text) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = [];
    let autoRank = winners.length + 1;

    for (const line of lines) {
      // Try to extract a 0x address from the line
      const addrMatch = line.match(/0x[a-fA-F0-9]{40}/);
      if (!addrMatch) continue;
      const addr = addrMatch[0].toLowerCase();

      // Check if there's a number (rank) in the line
      const numMatch = line.replace(addrMatch[0], '').match(/\d+/);
      const rank = numMatch ? Math.min(50, Math.max(1, parseInt(numMatch[0]))) : autoRank++;

      parsed.push({ walletAddress: addr, rank });
    }

    // Deduplicate by address (keep first occurrence)
    const seen = new Set();
    return parsed.filter((p) => {
      if (seen.has(p.walletAddress)) return false;
      seen.add(p.walletAddress);
      return true;
    }).slice(0, 50); // max 50
  };

  const handleBulkSubmit = async () => {
    const parsed = parseBulk(bulkText);
    if (parsed.length === 0) {
      setFeedback({ type: 'error', message: 'No valid wallet addresses found' });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      // Merge with existing (new ones get auto-ranked after existing)
      const existingAddrs = new Set(winners.map((w) => w.walletAddress));
      let nextRank = Math.max(0, ...winners.map((w) => w.rank)) + 1;
      const merged = [...winners];
      for (const p of parsed) {
        if (existingAddrs.has(p.walletAddress)) continue;
        merged.push({ walletAddress: p.walletAddress, rank: p.rank || nextRank++ });
      }
      // Reassign ranks sequentially to avoid gaps/duplicates
      merged.sort((a, b) => a.rank - b.rank);
      merged.forEach((w, i) => { w.rank = i + 1; });

      await api.post('/api/admin/luckydraw/manual-winners', { drawId, winners: merged.slice(0, 50) });
      setFeedback({ type: 'success', message: `${parsed.length} addresses added (${merged.length} total)` });
      setBulkText('');
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed' });
    }
    setBusy(false);
  };

  const handleSingleAdd = async () => {
    if (!wallet.trim()) return;
    const addr = wallet.trim().toLowerCase();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setFeedback({ type: 'error', message: 'Invalid wallet address format' });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const nextRank = winners.length > 0 ? Math.max(...winners.map((w) => w.rank)) + 1 : 1;
      const merged = [...winners, { walletAddress: addr, rank: nextRank }];
      await api.post('/api/admin/luckydraw/manual-winners', { drawId, winners: merged });
      setFeedback({ type: 'success', message: `Added at rank #${nextRank}` });
      setWallet('');
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed' });
    }
    setBusy(false);
  };

  const handleRemoveOne = async (addrToRemove) => {
    setBusy(true);
    try {
      const filtered = winners.filter((w) => w.walletAddress !== addrToRemove);
      filtered.sort((a, b) => a.rank - b.rank);
      filtered.forEach((w, i) => { w.rank = i + 1; }); // re-rank sequentially
      await api.post('/api/admin/luckydraw/manual-winners', { drawId, winners: filtered });
      await refresh();
    } catch {}
    setBusy(false);
  };

  const handleClearAll = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/admin/luckydraw/manual-winners/${drawId}`);
      await refresh();
    } catch {}
    setBusy(false);
  };

  const bulkPreview = bulkText.trim() ? parseBulk(bulkText) : [];

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="card-glass rounded-2xl border border-purple/30 max-w-[700px] w-full my-8 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="font-orbitron text-purple text-[0.85rem] font-bold">🏆 MANUAL WINNERS (MAX 50)</div>
          <button onClick={onClose} className="text-white/40 hover:text-pink font-orbitron text-[0.7rem]">✕</button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('bulk')}
            className={`flex-1 py-2 rounded-lg font-orbitron text-[0.55rem] border transition-all ${
              mode === 'bulk' ? 'bg-purple/10 border-purple/40 text-purple' : 'bg-white/3 border-white/10 text-white/40'
            }`}>
            📋 BULK PASTE
          </button>
          <button onClick={() => setMode('single')}
            className={`flex-1 py-2 rounded-lg font-orbitron text-[0.55rem] border transition-all ${
              mode === 'single' ? 'bg-purple/10 border-purple/40 text-purple' : 'bg-white/3 border-white/10 text-white/40'
            }`}>
            + SINGLE ADD
          </button>
        </div>

        {/* Bulk paste mode */}
        {mode === 'bulk' && (
          <div className="mb-4">
            <div className="text-[0.55rem] text-white/40 font-orbitron mb-2">
              Paste wallet addresses below — one per line. Ranks auto-assigned.
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"0xAF257e206A984971ffF5c8c54Ae89189D43e5C54\n0x1Fcaabe807D7164b655D1C2D7Cd9121cB1A0f0bd\n0xcd54CDd6646CDB504782B12D51EcAdaEF6249c95\n..."}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[0.6rem] outline-none focus:border-purple/40 resize-y"
            />
            {bulkPreview.length > 0 && (
              <div className="mt-2 text-[0.55rem] text-cyan font-orbitron">
                {bulkPreview.length} valid address{bulkPreview.length !== 1 ? 'es' : ''} detected
              </div>
            )}
            <button onClick={handleBulkSubmit} disabled={busy || bulkPreview.length === 0}
              className="mt-2 w-full py-2.5 rounded-lg bg-purple/10 border border-purple/40 text-purple font-orbitron text-[0.6rem] font-bold hover:bg-purple/20 disabled:opacity-30">
              {busy ? '...' : `ADD ${bulkPreview.length} ADDRESSES`}
            </button>
          </div>
        )}

        {/* Single add mode */}
        {mode === 'single' && (
          <div className="mb-4">
            <div className="text-[0.55rem] text-white/40 font-orbitron mb-2">
              Enter one wallet address. Rank auto-assigned to next available slot.
            </div>
            <div className="flex gap-2">
              <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x..."
                onKeyDown={(e) => e.key === 'Enter' && handleSingleAdd()}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] outline-none focus:border-purple/40" />
              <button onClick={handleSingleAdd} disabled={busy || winners.length >= 50}
                className="px-4 py-2 rounded-lg bg-purple/10 border border-purple/40 text-purple font-orbitron text-[0.6rem] hover:bg-purple/20 disabled:opacity-30">
                + ADD
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div className={`text-[0.6rem] mb-3 px-3 py-2 rounded-lg ${
            feedback.type === 'success' ? 'bg-green/5 border border-green/20 text-green' : 'bg-pink/5 border border-pink/20 text-pink'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Current winners list */}
        {loading ? (
          <div className="text-center py-4 text-white/30 text-[0.7rem]">Loading...</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-[0.65rem]">
            No manual winners set. Full RNG will be used for all 1000 winner slots.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="font-orbitron text-[0.55rem] text-white/40">{winners.length} / 50 SLOTS USED</div>
              <div className="h-1.5 flex-1 mx-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple to-gold transition-all" style={{ width: `${(winners.length / 50) * 100}%` }} />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto mb-3 rounded-lg border border-white/5">
              <table className="w-full text-[0.6rem]">
                <thead className="sticky top-0 bg-[rgba(3,0,16,0.95)]">
                  <tr className="text-white/40 font-orbitron text-[0.5rem] border-b border-white/10">
                    <th className="py-1.5 px-2 text-left w-[50px]">RANK</th>
                    <th className="py-1.5 px-2 text-left">WALLET ADDRESS</th>
                    <th className="py-1.5 px-2 text-center w-[40px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {winners.sort((a, b) => a.rank - b.rank).map((w) => (
                    <tr key={w.walletAddress} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-1.5 px-2 font-orbitron text-gold">#{w.rank}</td>
                      <td className="py-1.5 px-2 font-mono text-white/60 text-[0.55rem]">
                        {w.walletAddress}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button onClick={() => handleRemoveOne(w.walletAddress)} disabled={busy}
                          className="text-pink/40 hover:text-pink text-[0.6rem] disabled:opacity-30" title="Remove">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bottom actions */}
        <div className="flex gap-2">
          {winners.length > 0 && (
            <button onClick={handleClearAll} disabled={busy}
              className="flex-1 py-2 rounded-lg bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.55rem] hover:bg-pink/20 disabled:opacity-30">
              🗑️ CLEAR ALL
            </button>
          )}
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.55rem] hover:text-white/60">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WinnersModal (kept from original, enhanced)
// ============================================================================
function WinnersModal({ draw, onClose }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/admin/luckydraw/winners/${draw._id}`)
      .then(({ data }) => { if (!cancelled) { setWinners(data.winners || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [draw._id]);

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="card-glass rounded-2xl border border-purple/30 max-w-[800px] w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em]">WINNERS</div>
            <div className="font-orbitron text-purple text-[0.85rem] mt-1">{draw.type} #{draw.drawNumber}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:text-pink">✕ CLOSE</button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-white/40 text-[0.7rem]">Loading...</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-[0.7rem]">No winners</div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                <tr className="text-left text-white/40 font-orbitron text-[0.5rem]">
                  <th className="py-3 px-3">RANK</th>
                  <th className="py-3 px-3">USER</th>
                  <th className="py-3 px-3 text-right">TICKET</th>
                  <th className="py-3 px-3 text-right">PRIZE</th>
                  <th className="py-3 px-3">PAID</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={`${w.rank}`} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-2 px-3 font-orbitron text-gold">#{w.rank}</td>
                    <td className="py-2 px-3 font-orbitron text-white/70 text-[0.55rem]">
                      {String(w.userId).slice(0, 8)}...{String(w.userId).slice(-6)}
                    </td>
                    <td className="py-2 px-3 font-orbitron text-cyan text-right">{w.ticketNumber || '—'}</td>
                    <td className="py-2 px-3 font-orbitron text-green text-right">{fmt(w.prize)}</td>
                    <td className="py-2 px-3 font-orbitron text-white/30 text-[0.5rem]">
                      {w.paidAt ? new Date(w.paidAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================
function StatCard({ label, value, color, suffix = ' USDT' }) {
  const cls = { cyan: 'text-cyan border-cyan/20', gold: 'text-gold border-gold/20', green: 'text-green border-green/20', purple: 'text-purple border-purple/20' }[color];
  const isCount = suffix === '';
  return (
    <div className={`card-glass rounded-xl p-3 border ${cls}`}>
      <div className="text-[0.45rem] text-white/30 font-orbitron tracking-[0.1em] mb-1">{label}</div>
      <div className={`font-orbitron font-bold text-[1.1rem] ${cls.split(' ')[0]}`}>
        {isCount ? String(value) : fmt(value)}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="p-2 rounded-lg bg-white/3">
      <div className="text-[0.45rem] text-white/30 font-orbitron">{label}</div>
      <div className={`font-orbitron text-[0.75rem] ${color}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    OPEN: 'bg-cyan/5 border-cyan/30 text-cyan',
    ACTIVATED: 'bg-gold/5 border-gold/30 text-gold',
    PAUSED: 'bg-yellow-400/5 border-yellow-400/30 text-yellow-400',
    TRIGGERED: 'bg-purple/5 border-purple/30 text-purple',
    RESULTED: 'bg-green/5 border-green/30 text-green',
    CANCELLED: 'bg-pink/5 border-pink/30 text-pink',
  }[status] || 'bg-white/5 border-white/20 text-white/40';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border ${styles}`}>
      {status}
    </span>
  );
}

function CtrlBtn({ label, color, disabled, onClick }) {
  const colors = {
    cyan: 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20',
    gold: 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20',
    green: 'bg-green/10 border-green/30 text-green hover:bg-green/20',
    yellow: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20',
    pink: 'bg-pink/10 border-pink/30 text-pink hover:bg-pink/20',
    red: 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20',
    purple: 'bg-purple/10 border-purple/30 text-purple hover:bg-purple/20',
  }[color] || 'bg-white/5 border-white/10 text-white/40';

  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-3 py-2 rounded-lg border font-orbitron text-[0.5rem] font-bold disabled:opacity-30 disabled:cursor-not-allowed ${colors}`}>
      {label}
    </button>
  );
}
