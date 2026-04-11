import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

const ROLE_OPTIONS = [
  { value: 'OPERATIONAL', label: 'Operational Admin', desc: 'Can edit config, ban users, trigger crons. Starts with zero tab permissions — grant them below.' },
  { value: 'NORMAL', label: 'Normal Admin (View Only)', desc: 'Can view all admin pages but cannot change anything.' },
  { value: '', label: 'Remove Admin Access', desc: 'Revoke admin role. User becomes a regular user.' },
];

const ROLE_BADGE = {
  SUPER: { color: 'text-pink border-pink/30 bg-pink/10', label: 'SUPER' },
  OPERATIONAL: { color: 'text-gold border-gold/30 bg-gold/10', label: 'OPS' },
  NORMAL: { color: 'text-cyan border-cyan/30 bg-cyan/10', label: 'VIEW' },
};

// 12 tab keys that can be assigned to OPERATIONAL admins. Must match the
// ADMIN_TABS constant on the server (admin.js routes file) and the route
// keys in App.jsx. Roles is deliberately excluded — always SUPER-only.
const TAB_DEFINITIONS = [
  { key: 'dashboard',     label: '📊 Dashboard',     desc: 'KPI cards, overview' },
  { key: 'users',         label: '👥 Users',         desc: 'User list, profiles, ban/unban' },
  { key: 'games',         label: '🎲 Games',         desc: 'Game history, pause/resume, force result' },
  { key: 'withdrawals',   label: '💸 Withdrawals',   desc: 'APPROVE + RETRY withdrawals (real power)' },
  { key: 'pools',         label: '🏦 Pools',         desc: 'Treasury & wallet pool metrics' },
  { key: 'config',        label: '⚙️ Config',        desc: 'Edit system configuration' },
  { key: 'luckydraw',     label: '🎰 Lucky Draw',    desc: 'Draw status, timer controls, history' },
  { key: 'club',          label: '👑 Club',          desc: 'Club rankings' },
  { key: 'analytics',     label: '📈 Analytics',     desc: 'User funnels, leaderboards' },
  { key: 'logs',          label: '📜 Logs',          desc: 'Admin action audit trail' },
  { key: 'deposits',      label: '💰 Deposits',      desc: 'Deposit distribution history' },
  { key: 'announcements', label: '📢 Announcements', desc: 'Create/delete banner announcements' },
];

export default function AdminRoles() {
  const logout = useAuthStore((s) => s.logout);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  // Assign form
  const [wallet, setWallet] = useState('');
  const [role, setRole] = useState('OPERATIONAL');

  // Super transfer
  const [superWallet, setSuperWallet] = useState('');
  const [superConfirm, setSuperConfirm] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/admins');
      setAdmins(res.data.admins || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAssign = async () => {
    if (!wallet.trim()) {
      setFeedback({ type: 'error', message: 'Wallet address is required' });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const res = await api.post('/api/admin/assign-role', {
        walletAddress: wallet.trim(),
        role: role || null,
      });
      setFeedback({
        type: 'success',
        message: `Role updated: ${res.data.walletAddress} → ${res.data.newRole || 'removed'}`,
      });
      setWallet('');
      refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed to assign role' });
    }
    setBusy(false);
  };

  const handleTransferSuper = async () => {
    if (!superWallet.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await api.post('/api/admin/transfer-super', { walletAddress: superWallet.trim() });
      setFeedback({ type: 'success', message: 'SUPER role transferred. You will be logged out...' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Transfer failed' });
    }
    setBusy(false);
    setSuperConfirm(false);
  };

  const handleRemoveAdmin = async (walletAddress) => {
    setBusy(true);
    setFeedback(null);
    try {
      await api.post('/api/admin/assign-role', { walletAddress, role: null });
      setFeedback({ type: 'success', message: `Admin access removed: ${walletAddress.slice(0, 8)}...` });
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
          🛡️ SUPER ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Role Management</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Assign Operational or Normal admin roles to users. Only Super Admin can manage roles.
        </p>
      </div>

      {/* Assign role form */}
      <div className="card-glass rounded-2xl p-6 border border-gold/20 mb-6">
        <div className="font-orbitron text-gold text-[0.7rem] font-bold mb-4">ASSIGN ROLE</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-[0.68rem] text-white/40 font-orbitron mb-1">WALLET ADDRESS</div>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:border-gold/40 outline-none"
            />
          </div>
          <div>
            <div className="text-[0.68rem] text-white/40 font-orbitron mb-1">ROLE</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:border-gold/40 outline-none"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="text-[0.65rem] text-white/30 mt-1">
              {ROLE_OPTIONS.find((o) => o.value === role)?.desc}
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              disabled={busy}
              className="w-full px-4 py-2 rounded-lg bg-gold/10 border border-gold/40 text-gold font-orbitron text-[0.65rem] font-bold hover:bg-gold/20 disabled:opacity-50"
            >
              {busy ? '...' : 'ASSIGN ROLE'}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-4 py-2 rounded-lg text-[0.7rem] font-orbitron ${
              feedback.type === 'success'
                ? 'bg-green/10 border border-green/30 text-green'
                : 'bg-pink/10 border border-pink/30 text-pink'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Transfer Super Admin */}
      <div className="card-glass rounded-2xl p-6 border border-pink/20 mb-6">
        <div className="font-orbitron text-pink text-[0.7rem] font-bold mb-1">TRANSFER SUPER ADMIN</div>
        <div className="text-[0.68rem] text-white/30 mb-4">
          Transfer your SUPER role to another user. You will lose all admin access and be logged out immediately.
        </div>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[0.68rem] text-white/40 font-orbitron mb-1">NEW SUPER ADMIN WALLET</div>
            <input
              type="text"
              value={superWallet}
              onChange={(e) => { setSuperWallet(e.target.value); setSuperConfirm(false); }}
              placeholder="0x..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:border-pink/40 outline-none"
            />
          </div>
          {!superConfirm ? (
            <button
              onClick={() => setSuperConfirm(true)}
              disabled={busy || !superWallet.trim()}
              className="px-4 py-2 rounded-lg bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.6rem] font-bold hover:bg-pink/20 disabled:opacity-30"
            >
              TRANSFER SUPER
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleTransferSuper}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-pink/20 border-2 border-pink text-pink font-orbitron text-[0.6rem] font-bold animate-pulse disabled:opacity-30"
              >
                {busy ? '...' : 'CONFIRM — I WILL LOSE ACCESS'}
              </button>
              <button
                onClick={() => setSuperConfirm(false)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.6rem]"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current admins table */}
      <div className="card-glass rounded-2xl p-6 border border-white/10">
        <div className="font-orbitron text-purple text-[0.7rem] font-bold mb-4">CURRENT ADMINS</div>

        {loading ? (
          <div className="text-center py-8 text-[0.7rem] text-white/30">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-[0.7rem] text-white/30">No admin users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.7rem]">
              <thead>
                <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em] border-b border-white/10">
                  <th className="py-2 px-3">WALLET</th>
                  <th className="py-2 px-3">ROLE</th>
                  <th className="py-2 px-3 text-right">DIRECTS</th>
                  <th className="py-2 px-3 text-right">RANK</th>
                  <th className="py-2 px-3">REGISTERED</th>
                  <th className="py-2 px-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => {
                  const badge = ROLE_BADGE[a.adminRole] || {};
                  return (
                    <tr key={a._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 px-3 font-orbitron text-white/70 text-[0.6rem]">
                        {a.walletAddress?.slice(0, 8)}...{a.walletAddress?.slice(-6)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-orbitron text-[0.65rem] border ${badge.color || 'text-white/30'}`}
                        >
                          {badge.label || a.adminRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/40 text-right">
                        {a.directReferralCount || 0}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/40 text-right">
                        {a.rank || 0}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/30 text-[0.65rem]">
                        {a.registeredAt ? new Date(a.registeredAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {a.adminRole !== 'SUPER' && (
                          <button
                            onClick={() => handleRemoveAdmin(a.walletAddress)}
                            disabled={busy}
                            className="px-2 py-1 rounded bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.6rem] hover:bg-pink/20 disabled:opacity-30"
                          >
                            REMOVE
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

      {/* Tab permissions — only shown for OPERATIONAL admins */}
      <div className="card-glass rounded-2xl p-6 border border-cyan/20 mt-6">
        <div className="font-orbitron text-cyan text-[0.7rem] font-bold mb-1">
          🔐 TAB PERMISSIONS (PER OPERATIONAL ADMIN)
        </div>
        <div className="text-[0.65rem] text-white/40 mb-4">
          Tick the tabs each operational admin can see in their sidebar and access via URL. Unchecked tabs are hidden from their UI and they are bounced to the dashboard if they try to type the URL directly. The <span className="text-gold">Withdrawals</span> tab additionally grants real approve/retry power at the API level.
        </div>

        {admins.filter((a) => a.adminRole === 'OPERATIONAL').length === 0 ? (
          <div className="text-center py-6 text-[0.68rem] text-white/30 italic">
            No OPERATIONAL admins yet. Assign the Operational role above first.
          </div>
        ) : (
          <div className="space-y-4">
            {admins
              .filter((a) => a.adminRole === 'OPERATIONAL')
              .map((a) => (
                <TabPermissionRow
                  key={a._id}
                  admin={a}
                  onSaved={refresh}
                  setFeedback={setFeedback}
                />
              ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// One row per OPERATIONAL admin — 12 checkboxes + save button. Local draft
// state so toggling is instant and only persists on explicit save.
function TabPermissionRow({ admin, onSaved, setFeedback }) {
  const [draft, setDraft] = useState(new Set(admin.adminTabs || []));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // If the server refreshes and returns a different adminTabs list, resync
  // the draft so stale local state doesn't survive a parent refresh.
  useEffect(() => {
    setDraft(new Set(admin.adminTabs || []));
    setDirty(false);
  }, [admin._id, admin.adminTabs]);

  const toggle = (key) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setDirty(true);
  };

  const setAll = (on) => {
    setDraft(on ? new Set(TAB_DEFINITIONS.map((t) => t.key)) : new Set());
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/api/admin/admins/${admin._id}/tabs`, {
        tabs: Array.from(draft),
      });
      setFeedback({
        type: 'success',
        message: `✓ Tabs updated for ${admin.walletAddress.slice(0, 8)}... — they must log out and back in for changes to take effect`,
      });
      setDirty(false);
      onSaved();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Failed to save tabs',
      });
    }
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <div className="font-orbitron text-gold text-[0.7rem]">
            {admin.walletAddress?.slice(0, 10)}...{admin.walletAddress?.slice(-6)}
          </div>
          <div className="font-orbitron text-white/40 text-[0.55rem] mt-0.5">
            {draft.size} / {TAB_DEFINITIONS.length} tabs granted
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAll(true)}
            disabled={saving}
            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:border-cyan/30 disabled:opacity-30"
          >
            ALL
          </button>
          <button
            onClick={() => setAll(false)}
            disabled={saving}
            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:border-pink/30 disabled:opacity-30"
          >
            NONE
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`px-3 py-1 rounded font-orbitron text-[0.6rem] font-bold border ${
              dirty
                ? 'bg-cyan/10 border-cyan/40 text-cyan hover:bg-cyan/20'
                : 'bg-white/3 border-white/10 text-white/30'
            } disabled:opacity-50`}
          >
            {saving ? '...' : dirty ? 'SAVE CHANGES' : 'SAVED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {TAB_DEFINITIONS.map((t) => {
          const on = draft.has(t.key);
          return (
            <label
              key={t.key}
              className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                on
                  ? 'bg-cyan/5 border-cyan/30'
                  : 'bg-white/3 border-white/5 hover:border-white/15'
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(t.key)}
                className="mt-0.5 accent-cyan flex-shrink-0"
              />
              <div className="min-w-0">
                <div className={`font-orbitron text-[0.6rem] font-bold ${on ? 'text-cyan' : 'text-white/60'}`}>
                  {t.label}
                </div>
                <div className="text-[0.5rem] text-white/30 font-orbitron mt-0.5 leading-tight">
                  {t.desc}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
