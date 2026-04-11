import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

const RANK_ICONS = { 1: '⭐', 2: '🌟', 3: '💫', 4: '✨', 5: '🌠', 6: '🌌' };

export default function AdminClub() {
  const [users, setUsers] = useState([]);
  const [todayDist, setTodayDist] = useState(null);
  const [yesterdayDist, setYesterdayDist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minRank, setMinRank] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t] = await Promise.all([
        api.get('/api/admin/club/ranked-users', { params: { minRank } }),
        api.get('/api/admin/club/today'),
      ]);
      setUsers(u.data.users || []);
      setTodayDist(t.data.today);
      setYesterdayDist(t.data.yesterday);
    } catch {}
    setLoading(false);
  }, [minRank]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Build a per-rank lookup of today's per-user payout from the latest distribution
  const distribution = todayDist || yesterdayDist;
  const perUserAmountByRank = {};
  if (distribution?.rankBreakdown) {
    for (const rb of distribution.rankBreakdown) {
      perUserAmountByRank[rb.rank] = rb.perUserAmount || 0;
    }
  }

  // Build per-rank counts from the user list
  const rankCounts = users.reduce((acc, u) => {
    acc[u.rank] = (acc[u.rank] || 0) + 1;
    return acc;
  }, {});
  const totalDistributedToday =
    distribution?.rankBreakdown?.reduce((s, rb) => s + (rb.rankPoolAmount || 0), 0) || 0;

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.68rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Club</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Ranked users and daily club income distributions
        </p>
      </div>

      {/* Distribution summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <SummaryCard
          label={distribution ? `${distribution.date} TURNOVER` : 'NO DATA'}
          value={distribution?.totalTurnover}
          color="cyan"
        />
        <SummaryCard
          label="TOTAL DISTRIBUTED"
          value={totalDistributedToday}
          color="gold"
        />
        <SummaryCard
          label="RANKED USERS"
          value={users.length}
          color="purple"
          type="count"
        />
        <SummaryCard
          label="DATA SOURCE"
          value={todayDist ? "TODAY'S RUN" : yesterdayDist ? "YESTERDAY'S RUN" : 'NONE'}
          color="green"
          type="text"
        />
      </div>

      {/* Per-rank distribution breakdown */}
      <div className="card-glass rounded-2xl p-5 mb-4 border border-gold/20">
        <div className="font-orbitron text-gold text-[0.7rem] font-bold mb-3">
          🏆 RANK DISTRIBUTION SUMMARY
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((r) => {
            const rankData = distribution?.rankBreakdown?.find((rb) => rb.rank === r);
            const count = rankCounts[r] || 0;
            return (
              <div
                key={r}
                className="p-3 rounded-lg bg-white/3 border border-white/5 text-center"
              >
                <div className="text-[1.4rem] mb-1">{RANK_ICONS[r]}</div>
                <div className="font-orbitron text-gold text-[0.65rem] font-bold">RANK {r}</div>
                <div className="text-[0.68rem] text-white/40 font-orbitron mt-1">
                  {count} {count === 1 ? 'user' : 'users'}
                </div>
                {rankData ? (
                  <>
                    <div className="text-[0.68rem] text-cyan font-orbitron mt-2">
                      Pool: {fmt(rankData.rankPoolAmount, 0)}
                    </div>
                    <div className="text-[0.68rem] text-green font-orbitron">
                      Per user: {fmt(rankData.perUserAmount)}
                    </div>
                  </>
                ) : (
                  <div className="text-[0.68rem] text-white/20 font-orbitron mt-2">No data</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Min rank filter */}
      <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10 flex items-center gap-3">
        <span className="font-orbitron text-[0.6rem] text-white/40 tracking-[0.1em]">MIN RANK:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => setMinRank(r)}
              className={`px-3 py-1.5 rounded-lg font-orbitron text-[0.68rem] border ${
                minRank === r
                  ? 'bg-gold/10 border-gold/40 text-gold'
                  : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20 hover:text-gold'
              }`}
            >
              {RANK_ICONS[r]} R{r}+
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No users at rank {minRank} or above
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em]">
                  <th className="py-3 px-3">RANK</th>
                  <th className="py-3 px-3">WALLET</th>
                  <th className="py-3 px-3">REF CODE</th>
                  <th className="py-3 px-3 text-right">TOTAL VOLUME</th>
                  <th className="py-3 px-3 text-right">STRONG LEG</th>
                  <th className="py-3 px-3 text-right">OTHER LEGS</th>
                  <th className="py-3 px-3 text-right">DAILY INCOME</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const dailyIncome = perUserAmountByRank[u.rank] || 0;
                  return (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 px-3">
                        <span className="font-orbitron text-gold">
                          {RANK_ICONS[u.rank]} R{u.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-white/70">
                        {u.walletAddress?.slice(0, 6)}...{u.walletAddress?.slice(-4)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-cyan">
                        {u.referralCode || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-purple text-right">
                        {fmt(u.totalBusinessVolume, 0)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-cyan text-right">
                        {fmt(u.strongLegVolume, 0)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-cyan text-right">
                        {fmt(u.otherLegsVolume, 0)}
                      </td>
                      <td className="py-2.5 px-3 font-orbitron text-green text-right">
                        {fmt(dailyIncome)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-white/3 border-t border-white/10">
                <tr className="text-[0.6rem]">
                  <td colSpan="6" className="py-3 px-3 font-orbitron text-white/50 text-right">
                    TOTAL DISTRIBUTED TODAY
                  </td>
                  <td className="py-3 px-3 font-orbitron text-gold text-right font-bold">
                    {fmt(totalDistributedToday)} USDT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ label, value, color, type = 'usdt' }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    gold: 'text-gold border-gold/20',
    purple: 'text-purple border-purple/20',
    green: 'text-green border-green/20',
  }[color];
  let display;
  if (type === 'count') display = num(value);
  else if (type === 'text') display = value || '—';
  else display = fmt(value);
  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass}`}>
      <div className="text-[0.65rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">
        {label}
      </div>
      <div className={`font-orbitron font-bold text-[1.1rem] ${colorClass.split(' ')[0]}`}>
        {display}
        {type !== 'count' && type !== 'text' && (
          <span className="text-[0.68rem] text-white/30 ml-1">USDT</span>
        )}
      </div>
    </div>
  );
}
