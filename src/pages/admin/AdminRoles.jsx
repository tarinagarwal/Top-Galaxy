import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';

const ROLE_OPTIONS = [
  { value: 'OPERATIONAL', label: 'Operational Admin', desc: 'Can edit config, ban users, trigger crons. Cannot approve withdrawals.' },
  { value: 'NORMAL', label: 'Normal Admin (View Only)', desc: 'Can view all admin pages but cannot change anything.' },
  { value: '', label: 'Remove Admin Access', desc: 'Revoke admin role. User becomes a regular user.' },
];

const ROLE_BADGE = {
  SUPER: { color: 'text-pink border-pink/30 bg-pink/10', label: 'SUPER' },
  OPERATIONAL: { color: 'text-gold border-gold/30 bg-gold/10', label: 'OPS' },
  NORMAL: { color: 'text-cyan border-cyan/30 bg-cyan/10', label: 'VIEW' },
};

export default function AdminRoles() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  // Assign form
  const [wallet, setWallet] = useState('');
  const [role, setRole] = useState('OPERATIONAL');

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

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
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
            <div className="text-[0.55rem] text-white/40 font-orbitron mb-1">WALLET ADDRESS</div>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:border-gold/40 outline-none"
            />
          </div>
          <div>
            <div className="text-[0.55rem] text-white/40 font-orbitron mb-1">ROLE</div>
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
            <div className="text-[0.5rem] text-white/30 mt-1">
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
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em] border-b border-white/10">
                  <th className="py-2 px-3">WALLET</th>
                  <th className="py-2 px-3">ROLE</th>
                  <th className="py-2 px-3 text-right">DIRECTS</th>
                  <th className="py-2 px-3 text-right">RANK</th>
                  <th className="py-2 px-3">REGISTERED</th>
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
                          className={`px-2 py-0.5 rounded-full font-orbitron text-[0.5rem] border ${badge.color || 'text-white/30'}`}
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
                      <td className="py-2.5 px-3 font-orbitron text-white/30 text-[0.5rem]">
                        {a.registeredAt ? new Date(a.registeredAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
