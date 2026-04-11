import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminPools() {
  const [pools, setPools] = useState(null);
  const [stats, setStats] = useState([]);
  const [incomeTotals, setIncomeTotals] = useState({});
  const [treasuryBalance, setTreasuryBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, i, t] = await Promise.all([
        api.get('/api/admin/pools'),
        api.get('/api/admin/analytics/stats?days=7'),
        api.get('/api/admin/analytics/income-totals'),
        api.get('/api/admin/treasury/balance').catch(() => null),
      ]);
      setPools(p.data);
      setStats(s.data.stats || []);
      setIncomeTotals(i.data.totals || {});
      if (t?.data) setTreasuryBalance(t.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-white/40 font-orbitron text-[0.7rem]">
          Loading pools...
        </div>
      </AdminLayout>
    );
  }

  const w = pools?.walletSums || {};
  const today = stats[0] || {};
  const week = stats.slice(0, 7);

  // Today's payouts per stream from PlatformStat (if populated)
  const todayPayouts = today.totalPayouts || {};

  // Cashback estimates
  const cashbackOutstanding = num(pools?.cashbackOutstanding);
  const cashbackInWallets = num(w.totalCashbackWallet);
  // Estimated days to cover: assume avg 0.5% rate * outstanding = daily disbursement
  const dailyCashbackEstimate = cashbackOutstanding * 0.005;
  const daysToCover = dailyCashbackEstimate > 0 ? cashbackInWallets / dailyCashbackEstimate : Infinity;

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.68rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Pools</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Live view of all platform pool balances and health metrics
        </p>
      </div>

      {/* Pool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <PoolCard
          title="WINNERS POOL"
          icon="🏆"
          color="gold"
          balance={w.totalWinningsWallet}
          metrics={[
            { label: 'Today paid', value: fmt(num(todayPayouts.winnings)) + ' USDT' },
            { label: 'Lifetime', value: fmt(incomeTotals.GAME_WIN_DIRECT?.total) + ' USDT' },
          ]}
        />

        <PoolCard
          title="CASHBACK POOL"
          icon="🛡️"
          color="green"
          balance={w.totalCashbackWallet}
          health={daysToCover >= 30 ? 'green' : daysToCover >= 7 ? 'yellow' : 'red'}
          metrics={[
            { label: 'Outstanding obligations', value: fmt(cashbackOutstanding) + ' USDT' },
            {
              label: 'Days to cover',
              value: !isFinite(daysToCover) ? '∞' : daysToCover > 999 ? '999+' : Math.floor(daysToCover) + ' days',
            },
          ]}
        />

        <PoolCard
          title="ROI POOL"
          icon="🔄"
          color="purple"
          balance={w.totalRoiWallet}
          metrics={[
            { label: 'Lifetime distributed', value: fmt(incomeTotals.ROI_ON_ROI?.total) + ' USDT' },
            { label: 'Total payouts', value: (incomeTotals.ROI_ON_ROI?.count || 0) + ' txns' },
          ]}
        />

        <PoolCard
          title="REFERRAL POOL"
          icon="⭐"
          color="cyan"
          balance={w.totalReferralWallet}
          metrics={[
            { label: 'Direct ref lifetime', value: fmt(incomeTotals.DIRECT_REFERRAL?.total) + ' USDT' },
            { label: 'Win ref lifetime', value: fmt(incomeTotals.WINNERS_REFERRAL?.total) + ' USDT' },
          ]}
        />

        <PoolCard
          title="GOLDEN DRAW POOL"
          icon="🥇"
          color="gold"
          balance={pools?.goldenDraw?.totalPool}
          metrics={[
            {
              label: 'Tickets sold',
              value: `${pools?.goldenDraw?.ticketsSold || 0} / 10000`,
            },
            { label: 'Draw #', value: pools?.goldenDraw?.drawNumber || '—' },
          ]}
        />

        <PoolCard
          title="SILVER DRAW POOL"
          icon="🥈"
          color="silver"
          balance={pools?.silverDraw?.totalPool}
          metrics={[
            {
              label: 'Tickets sold',
              value: `${pools?.silverDraw?.ticketsSold || 0} / 10000`,
            },
            { label: 'Draw #', value: pools?.silverDraw?.drawNumber || '—' },
          ]}
        />

        <PoolCard
          title="CLUB POOL"
          icon="🏆"
          color="gold"
          balance={w.totalClubWallet}
          metrics={[
            { label: "Today's turnover", value: fmt(today.totalTurnover) + ' USDT' },
            { label: 'Lifetime club paid', value: fmt(incomeTotals.CLUB_INCOME?.total) + ' USDT' },
          ]}
        />

        <PoolCard
          title="LUCKY DRAW WINS"
          icon="🎰"
          color="blue"
          balance={w.totalLuckyDrawWinWallet}
          metrics={[
            { label: 'Lifetime distributed', value: fmt(incomeTotals.LUCKY_DRAW_WIN?.total) + ' USDT' },
            { label: 'Total winners', value: (incomeTotals.LUCKY_DRAW_WIN?.count || 0) + ' wins' },
          ]}
        />

        <PoolCard
          title="TREASURY (FEES)"
          icon="💰"
          color="gold"
          balance={treasuryBalance?.balance}
          metrics={[
            { label: 'Source', value: '10% withdrawal fees' },
            { label: 'On-chain', value: 'Treasury contract' },
          ]}
        />

        <PoolCard
          title="GAME WALLETS"
          icon="🎯"
          color="cyan"
          balance={w.totalGameWallet}
          metrics={[
            { label: 'Sum across all users', value: 'Available to play' },
            { label: 'Locked compound', value: 'see Wallet detail' },
          ]}
        />

        <PoolCard
          title="PRACTICE POOL"
          icon="🎮"
          color="silver"
          balance={w.totalPracticeWallet}
          metrics={[
            { label: 'Non-withdrawable', value: 'Free practice credits' },
            { label: 'Burns on loss', value: 'Self-deflating' },
          ]}
        />

        <PoolCard
          title="DRAW AUTO-FUND POOLS"
          icon="⚡"
          color="purple"
          balance={num(w.totalGoldenDrawWallet) + num(w.totalSilverDrawWallet)}
          metrics={[
            { label: 'Golden draw wallets', value: fmt(w.totalGoldenDrawWallet) + ' USDT' },
            { label: 'Silver draw wallets', value: fmt(w.totalSilverDrawWallet) + ' USDT' },
          ]}
        />
      </div>

      {/* Money flow diagram */}
      <MoneyFlowDiagram />
    </AdminLayout>
  );
}

// ============================================================================
// PoolCard
// ============================================================================
function PoolCard({ title, icon, color, balance, metrics, health }) {
  const colorClass = {
    gold: 'border-gold/30 text-gold',
    green: 'border-green/30 text-green',
    cyan: 'border-cyan/30 text-cyan',
    purple: 'border-purple/30 text-purple',
    pink: 'border-pink/30 text-pink',
    blue: 'border-blue/30 text-blue',
    silver: 'border-silver/30 text-silver',
  }[color];

  const healthBadge = {
    green: { color: 'text-green border-green/30 bg-green/5', label: '✓ HEALTHY' },
    yellow: { color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5', label: '⚠️ WATCH' },
    red: { color: 'text-pink border-pink/30 bg-pink/5', label: '🚨 LOW' },
  }[health];

  return (
    <div className={`card-glass rounded-2xl p-5 border ${colorClass.split(' ')[0]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[1.5rem]">{icon}</span>
          <span className={`font-orbitron text-[0.6rem] tracking-[0.1em] ${colorClass.split(' ')[1]}`}>
            {title}
          </span>
        </div>
        {healthBadge && (
          <span className={`px-2 py-0.5 rounded-full font-orbitron text-[0.65rem] border ${healthBadge.color}`}>
            {healthBadge.label}
          </span>
        )}
      </div>
      <div className={`font-orbitron font-bold text-[1.5rem] mb-3 ${colorClass.split(' ')[1]}`}>
        {fmt(balance)}
        <span className="text-[0.68rem] text-white/30 ml-1">USDT</span>
      </div>
      <div className="space-y-1 pt-2 border-t border-white/5">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-[0.6rem]">
            <span className="text-white/40">{m.label}</span>
            <span className="text-white/70 font-orbitron">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MoneyFlowDiagram
// ============================================================================
// Layout strategy:
//   - 3 vertical columns (INFLOW · ROUTING · DESTINATIONS)
//   - Each row tells one complete story end-to-end
//   - Centered SOURCE node with arrow heads pointing to fan-out destinations
//   - Color-coded by money type (gold = real cash, cyan = on-chain, etc.)
function MoneyFlowDiagram() {
  return (
    <div className="card-glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="font-orbitron text-cyan text-[0.75rem] font-bold">
          💧 MONEY FLOW
        </div>
        <div className="text-[0.68rem] text-white/30 font-orbitron">
          how funds move through the system
        </div>
      </div>

      <div className="space-y-3">
        {/* ROW 1: DEPOSIT FLOW */}
        <FlowDiagram
          number="1"
          title="DEPOSIT"
          source={{ icon: '👤', label: 'User', sub: 'BSC wallet', color: 'cyan' }}
          via={{ icon: '🏛️', label: 'Treasury Contract', sub: 'on-chain' }}
          destinations={[
            { icon: '🎮', label: 'Game Wallet', sub: 'play balance', color: 'gold' },
            { icon: '⭐', label: 'Stream 2', sub: '15-level referral commissions', color: 'cyan' },
          ]}
        />

        {/* ROW 2: GAME ENTRY → WIN */}
        <FlowDiagram
          number="2"
          title="GAME WIN"
          source={{ icon: '🎯', label: 'Bet Amount', sub: 'from game wallet', color: 'cyan' }}
          via={{ icon: '🎰', label: 'Game Result', sub: 'commit-reveal' }}
          destinations={[
            { icon: '🏆', label: 'Winnings (2×)', sub: 'withdrawable', color: 'green' },
            { icon: '🪐', label: 'Compound (6× / 2×)', sub: 'locked to digit', color: 'purple' },
            { icon: '🏅', label: 'Stream 3', sub: '15% bet → uplines', color: 'pink' },
          ]}
        />

        {/* ROW 3: GAME LOSS */}
        <FlowDiagram
          number="3"
          title="GAME LOSS"
          source={{ icon: '🎯', label: 'Bet Amount', sub: 'from game wallet', color: 'cyan' }}
          via={{ icon: '💀', label: 'Loss Recorded', sub: '+ totalAmountLost' }}
          destinations={[
            { icon: '🛡️', label: 'Cashback Eligibility', sub: 'tracked daily', color: 'green' },
          ]}
        />

        {/* ROW 4: DAILY CASHBACK CHAIN */}
        <FlowDiagram
          number="4"
          title="DAILY CASHBACK"
          source={{ icon: '📉', label: 'Net Loss', sub: 'per user', color: 'pink' }}
          via={{ icon: '⏰', label: '00:01 cron', sub: 'rate × cap multiplier' }}
          destinations={[
            { icon: '🛡️', label: 'Cashback Wallet', sub: 'withdrawable', color: 'green' },
            { icon: '🔄', label: 'Stream 5 ROI', sub: '50% → 15 uplines', color: 'purple' },
            { icon: '⚡', label: 'Auto-Fund Draws', sub: '20% → tickets', color: 'gold' },
          ]}
        />

        {/* ROW 5: CLUB INCOME */}
        <FlowDiagram
          number="5"
          title="CLUB INCOME"
          source={{ icon: '📊', label: 'Daily Turnover', sub: 'platform-wide', color: 'gold' }}
          via={{ icon: '⏰', label: '00:30 cron', sub: 'ranks 1–6 (50/50 leg rule)' }}
          destinations={[
            { icon: '🏆', label: 'Club Wallet', sub: 'rank holders only', color: 'gold' },
          ]}
        />

        {/* ROW 6: LUCKY DRAW */}
        <FlowDiagram
          number="6"
          title="LUCKY DRAW"
          source={{ icon: '🎟️', label: 'Ticket Purchase', sub: 'manual or auto', color: 'gold' }}
          via={{ icon: '🎰', label: 'Draw at 10k', sub: 'shuffle + reveal' }}
          destinations={[
            { icon: '🥇', label: '1000 winners', sub: 'lucky draw wins wallet', color: 'gold' },
          ]}
        />

        {/* ROW 7: WITHDRAWAL */}
        <FlowDiagram
          number="7"
          title="WITHDRAWAL"
          source={{ icon: '💼', label: 'Any withdrawable wallet', sub: 'user request', color: 'cyan' }}
          via={{ icon: '✓', label: 'Admin Approve', sub: 'Withdrawal contract' }}
          destinations={[
            { icon: '👤', label: 'User receives 90%', sub: 'BSC wallet', color: 'green' },
            { icon: '🏛️', label: 'Treasury 10%', sub: 'sustainability fee', color: 'pink' },
          ]}
        />
      </div>
    </div>
  );
}

// One row of the diagram: SOURCE → VIA → MULTIPLE DESTINATIONS
function FlowDiagram({ number, title, source, via, destinations }) {
  return (
    <div className="rounded-xl p-3 bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-orbitron text-[0.68rem] text-gold font-bold">
          {number}
        </div>
        <div className="font-orbitron text-[0.6rem] text-white/70 tracking-[0.15em]">{title}</div>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Three columns: SOURCE | VIA | DESTINATIONS */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* SOURCE — col 1-3 */}
        <div className="col-span-12 md:col-span-3">
          <FlowNode {...source} />
        </div>

        {/* ARROW + VIA — col 4-6 */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-2">
          <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
          <ViaNode {...via} />
          <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
          <span className="hidden md:inline text-gold font-orbitron text-[0.7rem]">▸</span>
        </div>

        {/* DESTINATIONS — col 7-12 */}
        <div className="col-span-12 md:col-span-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {destinations.map((dest, i) => (
              <FlowNode key={i} {...dest} small />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ icon, label, sub, color, small }) {
  const colorClass = {
    gold: 'border-gold/30 bg-gold/5 text-gold',
    green: 'border-green/30 bg-green/5 text-green',
    cyan: 'border-cyan/30 bg-cyan/5 text-cyan',
    purple: 'border-purple/30 bg-purple/5 text-purple',
    pink: 'border-pink/30 bg-pink/5 text-pink',
  }[color];

  return (
    <div
      className={`rounded-lg border ${colorClass} ${small ? 'p-2' : 'p-2.5'} flex items-center gap-2 h-full`}
    >
      <span className={small ? 'text-[1rem]' : 'text-[1.2rem]'}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-orbitron font-bold ${small ? 'text-[0.6rem]' : 'text-[0.65rem]'} truncate`}>
          {label}
        </div>
        {sub && (
          <div className="text-[0.65rem] text-white/40 font-orbitron truncate">{sub}</div>
        )}
      </div>
    </div>
  );
}

function ViaNode({ icon, label, sub }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/3 px-2.5 py-1.5 flex-shrink-0 text-center min-w-[110px]">
      <div className="text-[0.85rem] leading-none">{icon}</div>
      <div className="font-orbitron text-[0.68rem] text-white/70 mt-1 whitespace-nowrap">{label}</div>
      {sub && <div className="text-[0.6rem] text-white/30 font-orbitron whitespace-nowrap">{sub}</div>}
    </div>
  );
}
