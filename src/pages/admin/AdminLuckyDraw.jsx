import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt } from '../../lib/format';

export default function AdminLuckyDraw() {
  const [status, setStatus] = useState({ golden: null, silver: null });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null); // drawId
  const [confirmTrigger, setConfirmTrigger] = useState(null); // draw object
  const [feedback, setFeedback] = useState(null);
  const [selectedDraw, setSelectedDraw] = useState(null); // for winners modal

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        api.get('/api/admin/luckydraw/status'),
        api.get('/api/luckydraw/history?pageSize=20'),
      ]);
      setStatus(s.data);
      setHistory(h.data.draws || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleTrigger = async (drawId) => {
    setTriggering(drawId);
    setFeedback(null);
    try {
      const { data } = await api.post('/api/admin/luckydraw/trigger', { drawId });
      setFeedback({
        type: 'success',
        message: `✓ Draw triggered: ${data.type} #${data.drawNumber} · ${data.paidCount} winners paid`,
      });
      setConfirmTrigger(null);
      await refresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Trigger failed',
      });
    }
    setTriggering(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Lucky Draw</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Manage Golden & Silver draws · Manual triggers · Past winners
        </p>
      </div>

      {feedback && (
        <div
          className={`card-glass rounded-2xl p-3 mb-4 border ${
            feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
          } text-[0.7rem]`}
        >
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
      ) : (
        <>
          {/* Side-by-side current draws */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <CurrentDrawCard
              draw={status.golden}
              type="GOLDEN"
              icon="🏆"
              accent="gold"
              onTriggerClick={() => setConfirmTrigger(status.golden)}
            />
            <CurrentDrawCard
              draw={status.silver}
              type="SILVER"
              icon="🥈"
              accent="silver"
              onTriggerClick={() => setConfirmTrigger(status.silver)}
            />
          </div>

          {/* Past draws table */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 font-orbitron text-purple text-[0.75rem] font-bold">
              📜 PAST DRAWS
            </div>
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
                No completed draws yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.65rem]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                      <th className="py-3 px-3">TYPE</th>
                      <th className="py-3 px-3">DRAW #</th>
                      <th className="py-3 px-3 text-right">TICKETS</th>
                      <th className="py-3 px-3 text-right">POOL</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3">RESULTED</th>
                      <th className="py-3 px-3 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((d) => (
                      <tr key={d._id} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border ${
                              d.type === 'GOLDEN'
                                ? 'bg-gold/10 text-gold border-gold/30'
                                : 'bg-silver/10 text-silver border-silver/30'
                            }`}
                          >
                            {d.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-orbitron text-white/70">#{d.drawNumber}</td>
                        <td className="py-2.5 px-3 font-orbitron text-cyan text-right">
                          {d.ticketsSold}
                        </td>
                        <td className="py-2.5 px-3 font-orbitron text-gold text-right">
                          {fmt(d.totalPool)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border bg-green/5 border-green/30 text-green">
                            ✓ {d.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-orbitron text-white/30 text-[0.55rem]">
                          {d.resultedAt ? new Date(d.resultedAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedDraw(d)}
                            className="px-3 py-1 rounded bg-purple/10 border border-purple/30 text-purple font-orbitron text-[0.5rem] hover:bg-purple/20"
                          >
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

      {/* Trigger confirmation modal */}
      {confirmTrigger && (
        <div
          className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setConfirmTrigger(null)}
        >
          <div
            className="card-glass rounded-2xl border border-pink/30 max-w-[500px] w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-orbitron text-pink text-[0.85rem] font-bold mb-3">
              ⚠️ MANUAL TRIGGER DRAW
            </div>
            <div className="text-white/60 text-[0.7rem] mb-3">
              You are about to manually trigger{' '}
              <span className="text-gold">
                {confirmTrigger.type} #{confirmTrigger.drawNumber}
              </span>
              .
            </div>
            <div className="card-glass rounded-lg p-3 border border-white/10 mb-4 text-[0.65rem] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Tickets sold</span>
                <span className="text-cyan font-orbitron">
                  {confirmTrigger.ticketsSold} / {confirmTrigger.totalTickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Pool</span>
                <span className="text-gold font-orbitron">{fmt(confirmTrigger.totalPool)} USDT</span>
              </div>
            </div>
            <div className="text-[0.6rem] text-yellow-400 mb-4">
              ⚠️ This will reveal the server seed, select 1000 winners, distribute prizes, and immediately open the next draw. Cannot be undone.
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmTrigger(null)}
                disabled={triggering}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem]"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleTrigger(confirmTrigger._id)}
                disabled={triggering || confirmTrigger.ticketsSold === 0}
                className="px-4 py-2 rounded-lg bg-pink/10 border border-pink/40 text-pink font-orbitron text-[0.6rem] font-bold hover:bg-pink/20 disabled:opacity-30"
              >
                {triggering ? '⏳ TRIGGERING...' : '🎰 CONFIRM TRIGGER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winners modal */}
      {selectedDraw && (
        <WinnersModal draw={selectedDraw} onClose={() => setSelectedDraw(null)} />
      )}
    </AdminLayout>
  );
}

// ============================================================================
// CurrentDrawCard
// ============================================================================
function CurrentDrawCard({ draw, type, icon, accent, onTriggerClick }) {
  if (!draw) {
    return (
      <div className="card-glass rounded-2xl p-6 border border-white/10 text-center text-white/30 font-orbitron text-[0.7rem]">
        No active {type} draw
      </div>
    );
  }

  const accentClass = {
    gold: { border: 'border-gold/30', text: 'text-gold', bg: 'bg-gold/5', progress: 'from-gold to-gold2' },
    silver: { border: 'border-silver/30', text: 'text-silver', bg: 'bg-silver/5', progress: 'from-silver to-silver2' },
  }[accent];

  const progressPct = draw.progressPercent || 0;

  return (
    <div className={`card-glass rounded-2xl p-5 border ${accentClass.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[2rem]">{icon}</span>
          <div>
            <div className={`font-orbitron text-[0.85rem] font-bold ${accentClass.text}`}>
              {type} DRAW
            </div>
            <div className="text-[0.55rem] text-white/30 font-orbitron">DRAW #{draw.drawNumber}</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border bg-cyan/5 border-cyan/30 text-cyan">
          {draw.status}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[0.6rem] font-orbitron mb-1.5">
          <span className="text-white/40">TICKETS</span>
          <span className={accentClass.text}>
            {draw.ticketsSold} / {draw.totalTickets}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${accentClass.progress} transition-all`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`p-2 rounded-lg ${accentClass.bg}`}>
          <div className="text-[0.5rem] text-white/30 font-orbitron">POOL</div>
          <div className={`font-orbitron text-[0.85rem] ${accentClass.text}`}>
            {fmt(draw.totalPool)} USDT
          </div>
        </div>
        <div className={`p-2 rounded-lg ${accentClass.bg}`}>
          <div className="text-[0.5rem] text-white/30 font-orbitron">ENTRY FEE</div>
          <div className={`font-orbitron text-[0.85rem] ${accentClass.text}`}>
            {fmt(draw.entryFee)} USDT
          </div>
        </div>
      </div>

      <button
        onClick={onTriggerClick}
        disabled={draw.ticketsSold === 0}
        className="w-full py-3 rounded-xl font-orbitron text-[0.7rem] font-bold tracking-[0.1em] bg-pink/10 border border-pink/40 text-pink hover:bg-pink/20 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        🎰 MANUAL TRIGGER
      </button>
      {draw.ticketsSold === 0 && (
        <div className="text-[0.5rem] text-white/30 font-orbitron text-center mt-2">
          Cannot trigger draw with 0 tickets
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WinnersModal
// ============================================================================
function WinnersModal({ draw, onClose }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/admin/luckydraw/winners/${draw._id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setWinners(data.winners || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draw._id]);

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/80 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card-glass rounded-2xl border border-purple/30 max-w-[800px] w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em]">WINNERS</div>
            <div className="font-orbitron text-purple text-[0.85rem] mt-1">
              {draw.type} DRAW #{draw.drawNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:border-pink/40 hover:text-pink"
          >
            ✕ CLOSE
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No winners
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                  <th className="py-3 px-3">RANK</th>
                  <th className="py-3 px-3">USER</th>
                  <th className="py-3 px-3 text-right">TICKET #</th>
                  <th className="py-3 px-3 text-right">PRIZE</th>
                  <th className="py-3 px-3">PAID AT</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={`${w.ticketNumber}-${w.rank}`} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-2 px-3 font-orbitron text-gold">#{w.rank}</td>
                    <td className="py-2 px-3 font-orbitron text-white/70 text-[0.55rem]">
                      {String(w.userId).slice(0, 8)}...{String(w.userId).slice(-6)}
                    </td>
                    <td className="py-2 px-3 font-orbitron text-cyan text-right">{w.ticketNumber}</td>
                    <td className="py-2 px-3 font-orbitron text-green text-right">
                      {fmt(w.prize)} USDT
                    </td>
                    <td className="py-2 px-3 font-orbitron text-white/30 text-[0.55rem]">
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
