import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminUsers() {
  const canEdit = useAuthStore((s) => s.isOperationalAdmin);
  const canActivate = useAuthStore((s) => s.isSuperAdmin);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', {
        params: { page, pageSize: 20, search },
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Users</h1>
      </div>

      {/* Search */}
      <div className="card-glass rounded-2xl p-4 mb-4 border border-white/10">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 Search by wallet address or referral code..."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:outline-none focus:border-gold/50"
        />
        <div className="mt-2 text-[0.55rem] text-white/30 font-orbitron">
          {total} total users · page {page} / {totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                  <th className="py-3 px-3">WALLET</th>
                  <th className="py-3 px-3">REF CODE</th>
                  <th className="py-3 px-3">TIER</th>
                  <th className="py-3 px-3">REGISTERED</th>
                  <th className="py-3 px-3 text-right">DEPOSITED</th>
                  <th className="py-3 px-3 text-right">REFERRALS</th>
                  <th className="py-3 px-3 text-right">RANK</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-orbitron text-white/70">
                      {u.walletAddress?.slice(0, 6)}...{u.walletAddress?.slice(-4)}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-cyan">{u.referralCode || '—'}</td>
                    <td className="py-2.5 px-3">
                      {u.fullActivated ? (
                        <span className="text-green text-[0.55rem] font-orbitron">PRO</span>
                      ) : u.realCashActivated ? (
                        <span className="text-cyan text-[0.55rem] font-orbitron">BASIC</span>
                      ) : (
                        <span className="text-white/30 text-[0.55rem] font-orbitron">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-white/40 text-[0.55rem]">
                      {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-gold text-right">
                      {fmt(u.totalDeposited)}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-purple text-right">
                      {u.directReferralCount || 0}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-pink text-right">
                      {u.rank > 0 ? `R${u.rank}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full bg-pink/10 text-pink text-[0.5rem] font-orbitron border border-pink/30">
                          BANNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-green/10 text-green text-[0.5rem] font-orbitron border border-green/30">
                          ACTIVE
                        </span>
                      )}
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

      {/* User detail modal */}
      {selectedUser && (
        <UserDetailModal
          userId={selectedUser._id}
          onClose={() => setSelectedUser(null)}
          onAction={refresh}
          canEdit={canEdit}
          canActivate={canActivate}
        />
      )}
    </AdminLayout>
  );
}

// ============================================================================
// UserDetailModal
// ============================================================================
function UserDetailModal({ userId, onClose, onAction, canEdit = true, canActivate = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [feedback, setFeedback] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/users/${userId}`);
      setData(data);
    } catch {}
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const action = async (label, fn) => {
    setBusy(true);
    setFeedback(null);
    try {
      await fn();
      setFeedback({ type: 'success', message: `✓ ${label}` });
      await refresh();
      if (onAction) onAction();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || `${label} failed`,
      });
    } finally {
      setBusy(false);
    }
  };

  const u = data?.user || {};
  const w = data?.wallet || {};
  const incomeTotals = data?.incomeTotals || {};

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/80 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card-glass rounded-3xl border border-gold/30 w-full max-w-[900px] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <div className="text-[0.55rem] text-white/60 font-orbitron font-bold tracking-[0.15em]">USER DETAIL</div>
            <div className="font-orbitron text-gold text-[0.85rem] mt-1 break-all">
              {u.walletAddress}
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
        ) : (
          <div className="p-6 space-y-5">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="REF CODE" value={u.referralCode} type="text" color="cyan" />
              <Stat label="TIER" value={u.fullActivated ? 'PRO' : u.realCashActivated ? 'BASIC' : 'NONE'} type="text" color="green" />
              <Stat label="DEPOSITED" value={u.totalDeposited} color="gold" />
              <Stat label="TEAM VOLUME" value={u.totalBusinessVolume} color="purple" />
              <Stat label="DIRECTS" value={u.directReferralCount} type="count" color="cyan" />
              <Stat label="RANK" value={u.rank ? `R${u.rank}` : '—'} type="text" color="pink" />
              <Stat label="WON" value={u.totalAmountWon} color="green" />
              <Stat label="LOST" value={u.totalAmountLost} color="pink" />
            </div>

            {/* Wallets */}
            <div>
              <div className="text-[0.55rem] font-orbitron text-cyan tracking-[0.15em] mb-2">💎 WALLETS</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  ['Game', w.gameWallet, 'gold'],
                  ['Winnings', w.winningsWallet, 'green'],
                  ['Referral', w.referralWallet, 'cyan'],
                  ['Cashback', w.cashbackWallet, 'purple'],
                  ['ROI', w.roiWallet, 'pink'],
                  ['Club', w.clubWallet, 'blue'],
                  ['Lucky Draw', w.luckyDrawWinWallet, 'gold'],
                  ['Practice', w.practiceWallet, 'silver'],
                  ['Frozen Ref', w.practiceReferralBalance, 'silver'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 text-[0.65rem]">
                    <span className={`text-${color}`}>{label}</span>
                    <span className="font-orbitron text-white">{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income totals by stream */}
            <div>
              <div className="text-[0.55rem] font-orbitron text-purple tracking-[0.15em] mb-2">💰 LIFETIME INCOME</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'DIRECT_REFERRAL', 'WINNERS_REFERRAL', 'CASHBACK',
                  'ROI_ON_ROI', 'CLUB_INCOME', 'LUCKY_DRAW_WIN',
                ].map((type) => {
                  const t = incomeTotals[type] || { total: 0, count: 0 };
                  return (
                    <div key={type} className="p-2 rounded-lg bg-white/3 border border-white/5 text-[0.6rem]">
                      <div className="text-white/40 font-orbitron text-[0.5rem]">{type}</div>
                      <div className="font-orbitron text-white mt-0.5">
                        {fmt(t.total)} <span className="text-white/30">({t.count})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct referrals */}
            {data?.directs?.length > 0 && (
              <div>
                <div className="text-[0.55rem] font-orbitron text-gold tracking-[0.15em] mb-2">
                  ⭐ DIRECT REFERRALS ({data.directs.length})
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {data.directs.map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 text-[0.6rem]">
                      <div>
                        <div className="font-orbitron text-white/70">
                          {d.walletAddress?.slice(0, 8)}...{d.walletAddress?.slice(-4)}
                        </div>
                        <div className="text-white/30 text-[0.5rem]">
                          {d.fullActivated ? 'PRO' : d.realCashActivated ? 'BASIC' : '—'} · {d.referralCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-orbitron text-gold">{fmt(d.totalDeposited)}</div>
                        <div className="text-white/30 text-[0.5rem]">deposited</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent transactions */}
            {data?.recentTransactions?.length > 0 && (
              <div>
                <div className="text-[0.55rem] font-orbitron text-cyan tracking-[0.15em] mb-2">
                  📜 RECENT TRANSACTIONS
                </div>
                <div className="max-h-[240px] overflow-y-auto space-y-1">
                  {data.recentTransactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 text-[0.6rem]">
                      <div>
                        <div className="font-orbitron text-white/70">{t.type}</div>
                        <div className="text-white/30 text-[0.5rem]">
                          {new Date(t.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-orbitron text-gold">{fmt(t.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-[0.55rem] font-orbitron text-pink tracking-[0.15em] mb-3">⚙️ ACTIONS</div>
              {!canEdit && (
                <div className="text-[0.6rem] text-white/30 font-orbitron mb-3">VIEW ONLY — actions require Operational or Super Admin role</div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {canEdit && (!u.isBanned ? (
                  <ActionButton
                    label="🚫 BAN"
                    color="pink"
                    disabled={busy}
                    onClick={() => action('User banned', () => api.post(`/api/admin/users/${u._id}/ban`))}
                  />
                ) : (
                  <ActionButton
                    label="✓ UNBAN"
                    color="green"
                    disabled={busy}
                    onClick={() => action('User unbanned', () => api.post(`/api/admin/users/${u._id}/unban`))}
                  />
                ))}
                {canActivate && !u.realCashActivated && (
                  <ActionButton
                    label="🔓 ACTIVATE BASIC"
                    color="cyan"
                    disabled={busy}
                    onClick={() =>
                      action('Activated BASIC', () =>
                        api.post(`/api/admin/users/${u._id}/activate`, { tier: 'BASIC' })
                      )
                    }
                  />
                )}
                {canActivate && !u.fullActivated && (
                  <ActionButton
                    label="🌟 ACTIVATE PRO"
                    color="green"
                    disabled={busy}
                    onClick={() =>
                      action('Activated PRO', () =>
                        api.post(`/api/admin/users/${u._id}/activate`, { tier: 'PRO' })
                      )
                    }
                  />
                )}
                <ActionButton
                  label="🌳 COMPRESS TREE"
                  color="purple"
                  disabled={busy}
                  onClick={() =>
                    action('Tree compressed', () =>
                      api.post(`/api/admin/users/${u._id}/compress-tree`)
                    )
                  }
                />
              </div>

              {/* Extend practice */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value || '0', 10))}
                  className="w-20 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-cyan/50"
                />
                <span className="text-[0.6rem] text-white/40 font-orbitron">days</span>
                <button
                  disabled={busy || extendDays <= 0}
                  onClick={() =>
                    action(`Extended practice +${extendDays}d`, () =>
                      api.post(`/api/admin/users/${u._id}/extend-practice`, { days: extendDays })
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.6rem] hover:bg-cyan/20 disabled:opacity-30"
                >
                  ⏰ EXTEND PRACTICE
                </button>
              </div>

              {feedback && (
                <div
                  className={`mt-3 p-2 rounded-lg text-[0.6rem] ${
                    feedback.type === 'success'
                      ? 'bg-green/5 border border-green/20 text-green'
                      : 'bg-pink/5 border border-pink/20 text-pink'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color, type = 'usdt' }) {
  const colorClass = {
    cyan: 'text-cyan',
    green: 'text-green',
    gold: 'text-gold',
    purple: 'text-purple',
    pink: 'text-pink',
  }[color];
  let display;
  if (type === 'text') display = value || '—';
  else if (type === 'count') display = num(value);
  else display = fmt(value);
  return (
    <div className="p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.1em]">{label}</div>
      <div className={`font-orbitron font-bold text-[0.85rem] mt-1 ${colorClass}`}>{display}</div>
    </div>
  );
}

function ActionButton({ label, color, disabled, onClick }) {
  const colorClass = {
    pink: 'bg-pink/10 border-pink/30 text-pink hover:bg-pink/20',
    green: 'bg-green/10 border-green/30 text-green hover:bg-green/20',
    cyan: 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20',
    purple: 'bg-purple/10 border-purple/30 text-purple hover:bg-purple/20',
  }[color];
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border font-orbitron text-[0.6rem] disabled:opacity-30 ${colorClass}`}
    >
      {label}
    </button>
  );
}
