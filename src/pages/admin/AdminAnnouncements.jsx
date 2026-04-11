import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

const TYPE_STYLES = {
  info: { bg: 'bg-cyan/10', border: 'border-cyan/30', text: 'text-cyan', icon: 'ℹ️', label: 'INFO' },
  success: { bg: 'bg-green/10', border: 'border-green/30', text: 'text-green', icon: '✅', label: 'SUCCESS' },
  warning: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-400', icon: '⚠️', label: 'WARNING' },
  danger: { bg: 'bg-pink/10', border: 'border-pink/30', text: 'text-pink', icon: '🚨', label: 'DANGER' },
};

export default function AdminAnnouncements() {
  const canOps = useAuthStore((s) => s.isOperationalAdmin);

  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetWallet, setTargetWallet] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/announcements');
      setAnnouncements(data.announcements || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSend = async () => {
    if (!message.trim()) {
      setFeedback({ type: 'error', message: 'Message is required' });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const body = { message: message.trim(), type };
      if (targetWallet.trim()) body.targetWallet = targetWallet.trim();
      if (expiresInHours) body.expiresInHours = parseFloat(expiresInHours);
      await api.post('/api/admin/announcement', body);
      setFeedback({
        type: 'success',
        message: targetWallet
          ? `✓ Sent to ${targetWallet.slice(0, 8)}...`
          : '✓ Broadcast to all users',
      });
      setMessage('');
      setTargetWallet('');
      setExpiresInHours('');
      refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed to send' });
    }
    setBusy(false);
  };

  const handleDeactivate = async (id) => {
    setBusy(true);
    try {
      await api.delete(`/api/admin/announcement/${id}`);
      refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed' });
    }
    setBusy(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.68rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Announcements</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Broadcast messages to all users or target a specific wallet. Active announcements show as a banner under the navbar.
        </p>
      </div>

      {/* Create form */}
      {canOps && (
        <div className="card-glass rounded-2xl p-6 border border-gold/20 mb-6">
          <div className="font-orbitron text-gold text-[0.75rem] font-bold mb-4">📣 CREATE ANNOUNCEMENT</div>

          <div className="space-y-4">
            {/* Message */}
            <div>
              <label className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1 block">MESSAGE</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement text..."
                rows={3}
                disabled={busy}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[0.7rem] focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Type + Target + Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1 block">TYPE</label>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(TYPE_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`py-2 rounded-lg border font-orbitron text-[0.6rem] font-bold transition-all ${
                        type === key
                          ? `${style.bg} ${style.border} ${style.text}`
                          : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {style.icon} {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1 block">
                  TARGET WALLET (optional)
                </label>
                <input
                  type="text"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                  placeholder="0x... (leave empty = all users)"
                  disabled={busy}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50"
                />
                <div className="text-[0.55rem] text-white/30 mt-1">
                  Empty = broadcast to all users
                </div>
              </div>

              <div>
                <label className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.12em] mb-1 block">
                  EXPIRES IN HOURS (optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  placeholder="Leave empty = no expiry"
                  disabled={busy}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:outline-none focus:border-gold/50"
                />
                <div className="text-[0.55rem] text-white/30 mt-1">
                  Auto-deactivates after X hours
                </div>
              </div>
            </div>

            {/* Send button */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {feedback && (
                <div
                  className={`flex-1 px-3 py-2 rounded-lg text-[0.65rem] font-orbitron ${
                    feedback.type === 'success'
                      ? 'bg-green/10 border border-green/30 text-green'
                      : 'bg-pink/10 border border-pink/30 text-pink'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
              <button
                onClick={handleSend}
                disabled={busy || !message.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-gold to-gold2 text-black font-orbitron text-[0.7rem] font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-30"
              >
                {busy ? '⏳ SENDING...' : '📣 SEND ANNOUNCEMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="card-glass rounded-2xl p-6 border border-white/10">
        <div className="font-orbitron text-purple text-[0.75rem] font-bold mb-4">
          📜 ANNOUNCEMENT HISTORY
        </div>

        {loading ? (
          <div className="text-center py-8 text-[0.7rem] text-white/30 font-orbitron">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-[0.7rem] text-white/30 font-orbitron">
            No announcements yet
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => {
              const style = TYPE_STYLES[ann.type] || TYPE_STYLES.info;
              const isExpired = ann.expiresAt && new Date(ann.expiresAt) < new Date();
              const isInactive = !ann.active || isExpired;
              return (
                <div
                  key={ann._id}
                  className={`p-4 rounded-lg border ${style.bg} ${style.border} ${isInactive ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full font-orbitron text-[0.55rem] border ${style.border} ${style.text}`}>
                        {style.icon} {style.label}
                      </span>
                      {ann.targetUserId ? (
                        <span className="px-2 py-0.5 rounded-full font-orbitron text-[0.55rem] bg-purple/10 border border-purple/30 text-purple">
                          🎯 TARGETED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-orbitron text-[0.55rem] bg-white/5 border border-white/20 text-white/60">
                          📢 GLOBAL
                        </span>
                      )}
                      {isInactive && (
                        <span className="px-2 py-0.5 rounded-full font-orbitron text-[0.55rem] bg-pink/10 border border-pink/30 text-pink">
                          {isExpired ? 'EXPIRED' : 'DEACTIVATED'}
                        </span>
                      )}
                    </div>
                    {ann.active && !isExpired && canOps && (
                      <button
                        onClick={() => handleDeactivate(ann._id)}
                        disabled={busy}
                        className="px-3 py-1 rounded bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.55rem] hover:bg-pink/20 disabled:opacity-30"
                      >
                        DEACTIVATE
                      </button>
                    )}
                  </div>
                  <div className={`font-orbitron text-[0.75rem] ${style.text}`}>{ann.message}</div>
                  <div className="text-[0.55rem] text-white/30 font-orbitron mt-2 flex gap-3 flex-wrap">
                    <span>Created: {new Date(ann.createdAt).toLocaleString()}</span>
                    {ann.expiresAt && (
                      <span>Expires: {new Date(ann.expiresAt).toLocaleString()}</span>
                    )}
                    <span>By: {ann.createdBy?.slice(0, 8)}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
