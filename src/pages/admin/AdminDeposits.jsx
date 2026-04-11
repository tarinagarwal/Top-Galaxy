import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminDeposits() {
  const [distributions, setDistributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [res, t] = await Promise.all([
        api.get('/api/admin/deposit-distributions', { params: { page, pageSize } }),
        api.get('/api/admin/deposit-distributions-totals'),
      ]);
      setDistributions(res.data.distributions || []);
      setTotal(res.data.total || 0);
      setTotals(t.data || null);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Deposit Distributions</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          On-chain split breakdown for every deposit through the V2 contract
        </p>
      </div>

      {/* Summary cards with lifetime totals from backend aggregation */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <SplitCard label="TOTAL DEPOSITS" color="gold" icon="📥" value={totals.total} />
          <SplitCard label="CREATOR (2%)" color="gold" icon="👑" value={totals.creator} />
          <SplitCard label="BD (6%)" color="cyan" icon="🤝" value={totals.bd} />
          <SplitCard label="FEW (5%)" color="purple" icon="🔧" value={totals.few} />
          <SplitCard label="REFERRAL POOL (15%)" color="green" icon="⭐" value={totals.refPool} />
          <SplitCard label="REFERRAL PAID" color="green" icon="✅" value={totals.refPaid} />
          <SplitCard label="SPILLOVER → FEW" color="silver" icon="↪️" value={totals.spillover} />
          <SplitCard label="LUCKY DRAW (1%)" color="pink" icon="🎰" value={totals.lucky} />
          <SplitCard label="GAME POOL (71%)" color="gold" icon="🎯" value={totals.game} />
        </div>
      )}

      {/* Table */}
      <div className="card-glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="font-orbitron text-purple text-[0.75rem] font-bold">
            📥 DISTRIBUTION LOG ({total} total)
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.55rem] hover:border-gold/30 hover:text-gold"
          >
            ↻ REFRESH
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[0.7rem] text-white/30">Loading...</div>
        ) : distributions.length === 0 ? (
          <div className="text-center py-12 text-[0.7rem] text-white/30">
            No deposit distributions yet. Deposits through the V2 contract will appear here.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.65rem]">
                <thead>
                  <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.1em] border-b border-white/10">
                    <th className="py-2 px-2">DATE</th>
                    <th className="py-2 px-2">USER</th>
                    <th className="py-2 px-2 text-right">TOTAL</th>
                    <th className="py-2 px-2 text-right">CREATOR</th>
                    <th className="py-2 px-2 text-right">BD</th>
                    <th className="py-2 px-2 text-right">FEW</th>
                    <th className="py-2 px-2 text-right">REF POOL</th>
                    <th className="py-2 px-2 text-right">REF PAID</th>
                    <th className="py-2 px-2 text-right">SPILLOVER</th>
                    <th className="py-2 px-2 text-right">LUCKY</th>
                    <th className="py-2 px-2 text-right">GAME</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((d) => (
                    <tr key={d._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-2 font-orbitron text-white/50 text-[0.55rem]">
                        {d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-cyan text-[0.55rem]">
                        {d.userId?.walletAddress
                          ? `${d.userId.walletAddress.slice(0, 6)}...${d.userId.walletAddress.slice(-4)}`
                          : '—'}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-white/80 text-right font-bold">
                        {fmt(d.totalAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-gold text-right">
                        {fmt(d.creatorAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-cyan text-right">
                        {fmt(d.bdTotalAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-purple text-right">
                        {fmt(d.fewAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-green text-right">
                        {fmt(d.referralPoolAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-green/60 text-right">
                        {fmt(d.referralDistributed)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-yellow-400 text-right">
                        {num(d.referralSpillover) > 0 ? fmt(d.referralSpillover) : '—'}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-pink text-right">
                        {fmt(d.luckyDrawPoolAmount)}
                      </td>
                      <td className="py-2 px-2 font-orbitron text-gold text-right">
                        {fmt(d.gamePoolAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.55rem] disabled:opacity-30"
                >
                  ← PREV
                </button>
                <span className="font-orbitron text-[0.55rem] text-white/40">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.55rem] disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function SplitCard({ label, color, icon, value = 0 }) {
  const colorClass = {
    gold: 'border-gold/20 text-gold',
    cyan: 'border-cyan/20 text-cyan',
    green: 'border-green/20 text-green',
    purple: 'border-purple/20 text-purple',
    pink: 'border-pink/20 text-pink',
    silver: 'border-white/10 text-white/40',
  }[color] || 'border-white/10 text-white/40';

  return (
    <div className={`card-glass rounded-xl p-3 border ${colorClass.split(' ')[0]} text-center`}>
      <div className="text-[1rem] mb-1">{icon}</div>
      <div className={`font-orbitron font-bold text-[1rem] mb-1 ${colorClass.split(' ')[1]}`}>
        {fmt(value)}
      </div>
      <div className="text-[0.45rem] text-white/60 font-orbitron font-bold tracking-[0.08em]">
        {label}
      </div>
    </div>
  );
}
