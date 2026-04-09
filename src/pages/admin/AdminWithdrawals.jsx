import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED'];

const STATUS_STYLES = {
  PENDING: { color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5', label: '⏳ PENDING' },
  APPROVED: { color: 'text-cyan border-cyan/30 bg-cyan/5', label: '✓ APPROVED' },
  PROCESSING: { color: 'text-cyan border-cyan/30 bg-cyan/5', label: '⏳ PROCESSING' },
  COMPLETED: { color: 'text-green border-green/30 bg-green/5', label: '✅ COMPLETED' },
  REJECTED: { color: 'text-pink border-pink/30 bg-pink/5', label: '✗ REJECTED' },
  FAILED: { color: 'text-pink border-pink/30 bg-pink/5', label: '⚠️ FAILED' },
};

export default function AdminWithdrawals() {
  const canApprove = useAuthStore((s) => s.isSuperAdmin);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [withdrawals, setWithdrawals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pools, setPools] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState(null);
  const [treasuryError, setTreasuryError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [withdrawingFee, setWithdrawingFee] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 25 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const [wRes, pRes, tRes] = await Promise.all([
        api.get('/api/admin/withdrawals', { params }),
        api.get('/api/admin/pools'),
        api.get('/api/admin/treasury/balance').catch((err) => {
          setTreasuryError(err?.response?.data?.error || 'Treasury read failed');
          return null;
        }),
      ]);
      setWithdrawals(wRes.data.withdrawals || []);
      setTotal(wRes.data.total || 0);
      setPools(pRes.data || null);
      if (tRes?.data) {
        setTreasuryBalance(tRes.data);
        setTreasuryError(null);
      }
      setSelectedIds(new Set()); // reset selection on refresh
    } catch {}
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / 25));

  // Daily total of all withdrawals (sum of today's amounts across users)
  const _d = new Date();
  const todayString = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
  const todayWithdrawalTotal = useMemo(() => {
    return withdrawals
      .filter((w) => {
        if (!w.requestedAt) return false;
        return new Date(w.requestedAt).toISOString().slice(0, 10) === todayString;
      })
      .filter((w) => ['PENDING', 'PROCESSING', 'COMPLETED'].includes(w.status))
      .reduce((s, w) => s + num(w.amount), 0);
  }, [withdrawals, todayString]);

  // The actual platform daily limit is per-user, not global. We display today's
  // global volume as a system-wide indicator.
  const PLATFORM_DAILY_TARGET = 50000; // sum of many users' caps — informational only
  const dailyPct = Math.min(100, (todayWithdrawalTotal / PLATFORM_DAILY_TARGET) * 100);

  const sustainabilityFeePool = pools?.walletSums?.totalCashbackEarned
    ? null // not directly available — would need a dedicated query
    : null;

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === withdrawals.filter((w) => w.status === 'PENDING').length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(withdrawals.filter((w) => w.status === 'PENDING').map((w) => w._id)));
    }
  };

  const handleApprove = async (id) => {
    setBusy(true);
    setFeedback(null);
    try {
      await api.post(`/api/admin/withdrawals/${id}/approve`);
      setFeedback({ type: 'success', message: '✓ Withdrawal approved & submitted on-chain' });
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Approve failed' });
    }
    setBusy(false);
  };

  const handleReject = async (id) => {
    if (!rejectNote.trim()) {
      setFeedback({ type: 'error', message: 'Rejection note is required' });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await api.post(`/api/admin/withdrawals/${id}/reject`, { adminNote: rejectNote });
      setFeedback({ type: 'success', message: '✓ Withdrawal rejected & balance refunded' });
      setRejectingId(null);
      setRejectNote('');
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Reject failed' });
    }
    setBusy(false);
  };

  const handleWithdrawFee = async () => {
    const value = parseFloat(feeAmount);
    if (!value || value <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid fee amount' });
      return;
    }
    if (treasuryBalance && value > treasuryBalance.balance) {
      setFeedback({ type: 'error', message: 'Amount exceeds treasury balance' });
      return;
    }
    setWithdrawingFee(true);
    setFeedback(null);
    try {
      const { data } = await api.post('/api/admin/treasury/withdraw-fee', { amount: value });
      setFeedback({
        type: 'success',
        message: `✓ Withdrew ${value} USDT to admin wallet · ${data.txHash}`,
      });
      setFeeAmount('');
      await refresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Treasury withdraw failed',
      });
    }
    setWithdrawingFee(false);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.post('/api/admin/withdrawals/bulk-approve', {
        ids: Array.from(selectedIds),
      });
      const successCount = data.results.filter((r) => r.success).length;
      const failCount = data.results.length - successCount;
      setFeedback({
        type: successCount > 0 ? 'success' : 'error',
        message: `Bulk approve: ${successCount} succeeded, ${failCount} failed`,
      });
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Bulk approve failed' });
    }
    setBusy(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Withdrawals</h1>
      </div>

      {/* Daily volume + Treasury fee pool */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Today's volume */}
        <div className="card-glass rounded-2xl p-5 border border-cyan/20">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="font-orbitron text-cyan text-[0.65rem]">
              📊 TODAY'S WITHDRAWAL VOLUME
            </div>
            <div className="font-orbitron text-cyan text-[0.85rem] font-bold">
              {fmt(todayWithdrawalTotal)} USDT
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-blue transition-all"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="text-[0.55rem] text-white/30 font-orbitron mt-1">
            Indicator only — per-user cap is 5,000 USDT/day enforced server-side. Currently visible: {withdrawals.length} of {total}.
          </div>
        </div>

        {/* Sustainability Fee Pool */}
        <div className="card-glass rounded-2xl p-5 border border-gold/30">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="font-orbitron text-gold text-[0.65rem]">
              💰 SUSTAINABILITY FEE POOL
            </div>
            {treasuryBalance && (
              <div className="font-orbitron text-gold text-[0.85rem] font-bold">
                {fmt(treasuryBalance.balance)} USDT
              </div>
            )}
          </div>

          {treasuryError ? (
            <div className="text-[0.6rem] text-pink font-orbitron">⚠️ {treasuryError}</div>
          ) : !treasuryBalance ? (
            <div className="text-[0.6rem] text-white/30">Loading...</div>
          ) : (
            <>
              <div className="text-[0.55rem] text-white/30 font-orbitron mb-3 break-all">
                Treasury: {treasuryBalance.contractAddress}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder="Amount to withdraw"
                  disabled={withdrawingFee}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50 disabled:opacity-50"
                />
                <button
                  onClick={() => setFeeAmount(String(treasuryBalance.balance))}
                  disabled={withdrawingFee || treasuryBalance.balance <= 0}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gold font-orbitron text-[0.55rem] hover:border-gold/30 disabled:opacity-30"
                >
                  MAX
                </button>
                <button
                  onClick={handleWithdrawFee}
                  disabled={withdrawingFee || !feeAmount || parseFloat(feeAmount) <= 0}
                  className="px-4 py-2 rounded-lg bg-gradient-to-br from-gold to-gold2 text-black font-orbitron text-[0.6rem] font-bold hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] disabled:opacity-30"
                >
                  {withdrawingFee ? '⏳' : '💸 WITHDRAW'}
                </button>
              </div>
              <div className="text-[0.5rem] text-white/30 font-orbitron mt-1">
                Sends from Treasury → admin wallet on-chain
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-orbitron text-[0.55rem] tracking-[0.1em] border transition-all ${
                statusFilter === s
                  ? 'bg-gold/10 border-gold/40 text-gold'
                  : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20 hover:text-gold'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="card-glass rounded-2xl p-4 mb-4 border border-green/30 bg-green/5 flex items-center justify-between flex-wrap gap-3">
          <div className="font-orbitron text-green text-[0.7rem]">
            ✓ {selectedIds.size} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem] hover:border-white/30"
            >
              CLEAR
            </button>
            {canApprove && (
              <button
                onClick={handleBulkApprove}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-green/10 border border-green/40 text-green font-orbitron text-[0.6rem] font-bold hover:bg-green/20 disabled:opacity-50"
              >
                {busy ? '⏳ APPROVING...' : `✓ BULK APPROVE (${selectedIds.size})`}
              </button>
            )}
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

      {/* Table */}
      <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} withdrawals
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                  <th className="py-3 px-3 w-8">
                    {statusFilter === 'PENDING' && (
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size > 0 &&
                          selectedIds.size === withdrawals.filter((w) => w.status === 'PENDING').length
                        }
                        onChange={toggleSelectAll}
                        className="accent-green"
                      />
                    )}
                  </th>
                  <th className="py-3 px-3">USER</th>
                  <th className="py-3 px-3">FROM</th>
                  <th className="py-3 px-3">TO</th>
                  <th className="py-3 px-3 text-right">AMOUNT</th>
                  <th className="py-3 px-3 text-right">FEE</th>
                  <th className="py-3 px-3 text-right">NET</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3">REQUESTED</th>
                  <th className="py-3 px-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => {
                  const style = STATUS_STYLES[w.status] || STATUS_STYLES.PENDING;
                  const isPending = w.status === 'PENDING';
                  return (
                    <tr key={w._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 px-3">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(w._id)}
                            onChange={() => toggleSelect(w._id)}
                            className="accent-green"
                          />
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/70">
                        {w.userId?.walletAddress
                          ? `${w.userId.walletAddress.slice(0, 6)}...${w.userId.walletAddress.slice(-4)}`
                          : '—'}
                        {w.userId?.referralCode && (
                          <div className="text-[0.5rem] text-cyan">{w.userId.referralCode}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-purple text-[0.55rem]">
                        {w.fromWallet}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/40 text-[0.55rem]">
                        {w.toAddress?.slice(0, 6)}...{w.toAddress?.slice(-4)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-gold text-right">
                        {fmt(w.amount)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-pink text-right">
                        {fmt(w.fee)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-green text-right">
                        {fmt(w.netAmount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.5rem] ${style.color}`}>
                          {style.label}
                        </span>
                        {w.txHash && (
                          <a
                            href={`https://testnet.bscscan.com/tx/${w.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[0.5rem] text-cyan font-orbitron underline mt-0.5"
                          >
                            BSCScan ↗
                          </a>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/30 text-[0.5rem]">
                        {w.requestedAt ? new Date(w.requestedAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPending && canApprove && (
                          <div className="flex gap-1 justify-center">
                            <button
                              disabled={busy}
                              onClick={() => handleApprove(w._id)}
                              className="px-2 py-1 rounded bg-green/10 border border-green/30 text-green font-orbitron text-[0.5rem] hover:bg-green/20 disabled:opacity-30"
                            >
                              ✓ APPROVE
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => {
                                setRejectingId(w._id);
                                setRejectNote('');
                              }}
                              className="px-2 py-1 rounded bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.5rem] hover:bg-pink/20 disabled:opacity-30"
                            >
                              ✗ REJECT
                            </button>
                          </div>
                        )}
                        {isPending && !canApprove && (
                          <span className="text-[0.5rem] text-white/30 font-orbitron">SUPER ADMIN ONLY</span>
                        )}
                        {w.adminNote && (
                          <div className="text-[0.5rem] text-white/40 italic mt-1 max-w-[150px] truncate">
                            {w.adminNote}
                          </div>
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

      {/* Reject modal */}
      {rejectingId && (
        <div
          className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setRejectingId(null)}
        >
          <div
            className="card-glass rounded-2xl border border-pink/30 max-w-[500px] w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-orbitron text-pink text-[0.85rem] font-bold mb-3">
              ✗ REJECT WITHDRAWAL
            </div>
            <div className="text-white/50 text-[0.7rem] mb-4">
              The reserved balance will be refunded to the user's source wallet. Provide a reason:
            </div>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Suspicious activity flagged by risk team..."
              rows="4"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-pink/50"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem]"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                disabled={busy || !rejectNote.trim()}
                className="px-4 py-2 rounded-lg bg-pink/10 border border-pink/40 text-pink font-orbitron text-[0.6rem] font-bold hover:bg-pink/20 disabled:opacity-30"
              >
                {busy ? '⏳ REJECTING...' : '✗ CONFIRM REJECT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
