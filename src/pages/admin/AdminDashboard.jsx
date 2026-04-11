import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminDashboard() {
  const [pools, setPools] = useState(null);
  const [stats, setStats] = useState([]);
  const [incomeTotals, setIncomeTotals] = useState({});
  const [systemStatus, setSystemStatus] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [p, s, i, sys, k] = await Promise.all([
        api.get('/api/admin/pools'),
        api.get('/api/admin/analytics/stats?days=1'),
        api.get('/api/admin/analytics/income-totals'),
        api.get('/api/admin/system/status'),
        api.get('/api/admin/dashboard/kpi').catch(() => null),
      ]);
      setPools(p.data);
      setStats(s.data.stats || []);
      setIncomeTotals(i.data.totals || {});
      setSystemStatus(sys.data);
      if (k?.data) setKpi(k.data);
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
        <div className="text-center text-white/40 font-orbitron text-[0.7rem] py-20">
          Loading dashboard...
        </div>
      </AdminLayout>
    );
  }

  const today = stats[0] || {};
  const w = pools?.walletSums || {};

  // Pool health thresholds (rough heuristics — admin can tune later)
  const cashbackHealth = pools?.cashbackOutstanding > 0
    ? w.totalCashbackWallet / pools.cashbackOutstanding
    : 1;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN PANEL
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Dashboard</h1>
      </div>

      {/* V2 KPI Cards — TEAM / DEPOSIT / DISTRIBUTION / RECEIVING */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard label="TEAM" icon="👥" color="cyan" today={kpi.team?.today} total={kpi.team?.total} suffix="" />
          <KPICard label="DEPOSIT" icon="📥" color="green" today={kpi.deposit?.today} total={kpi.deposit?.total} />
          <KPICard label="DISTRIBUTION" icon="📤" color="purple" today={kpi.distribution?.today} total={kpi.distribution?.total} />
          <KPICard label="RECEIVING" icon="📨" color="gold" today={kpi.receiving?.today} total={kpi.receiving?.total} />
        </div>
      )}

      {/* Today's stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <DashStatCard label="NEW USERS TODAY" value={today.newUsers} color="cyan" suffix="" />
        <DashStatCard label="DEPOSITS TODAY" value={today.totalDeposits} color="green" />
        <DashStatCard label="WITHDRAWALS TODAY" value={today.totalWithdrawals} color="pink" />
        <DashStatCard label="TURNOVER TODAY" value={today.totalTurnover} color="gold" />
      </div>

      {/* Income totals row */}
      <div className="card-glass rounded-2xl p-5 mb-6 border border-white/10">
        <div className="font-orbitron text-purple text-[0.7rem] font-bold mb-4">
          💰 LIFETIME INCOME PAYOUTS PER STREAM
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'DIRECT_REFERRAL', label: 'Direct Ref', color: 'cyan' },
            { key: 'WINNERS_REFERRAL', label: 'Win Ref', color: 'pink' },
            { key: 'CASHBACK', label: 'Cashback', color: 'green' },
            { key: 'ROI_ON_ROI', label: 'ROI', color: 'purple' },
            { key: 'CLUB_INCOME', label: 'Club', color: 'gold' },
            { key: 'LUCKY_DRAW_WIN', label: 'Lucky', color: 'blue' },
          ].map((s) => {
            const data = incomeTotals[s.key] || { total: 0, count: 0 };
            return (
              <div key={s.key} className="p-3 rounded-lg bg-white/3 border border-white/5 text-center">
                <div className={`text-${s.color} font-orbitron text-[0.55rem] tracking-[0.1em]`}>
                  {s.label}
                </div>
                <div className="font-orbitron text-white text-[0.85rem] font-bold mt-1">
                  {fmt(data.total)}
                </div>
                <div className="text-[0.5rem] text-white/30 font-orbitron mt-0.5">
                  {data.count} payouts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pool health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-glass rounded-2xl p-5 border border-cyan/20">
          <div className="font-orbitron text-cyan text-[0.7rem] font-bold mb-4">
            💧 POOL HEALTH
          </div>
          <div className="space-y-2.5">
            <PoolRow label="Total Game Wallet" value={w.totalGameWallet} color="gold" />
            <PoolRow label="Total Winnings" value={w.totalWinningsWallet} color="green" />
            <PoolRow label="Total Referral" value={w.totalReferralWallet} color="cyan" />
            <PoolRow label="Total Cashback" value={w.totalCashbackWallet} color="purple" />
            <PoolRow label="Total ROI" value={w.totalRoiWallet} color="pink" />
            <PoolRow label="Total Club" value={w.totalClubWallet} color="blue" />
            <PoolRow label="Total Lucky Draw Wins" value={w.totalLuckyDrawWinWallet} color="gold" />
            <div className="border-t border-white/10 pt-2.5 mt-2.5" />
            <PoolRow label="Golden Draw Wallet" value={w.totalGoldenDrawWallet} color="gold" />
            <PoolRow label="Silver Draw Wallet" value={w.totalSilverDrawWallet} color="silver" />
            <PoolRow label="Practice Wallet" value={w.totalPracticeWallet} color="silver" />
          </div>
        </div>

        <div className="card-glass rounded-2xl p-5 border border-pink/20">
          <div className="font-orbitron text-pink text-[0.7rem] font-bold mb-4">
            ⚠️ CASHBACK SOLVENCY
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[0.7rem]">Outstanding obligations</span>
              <span className="font-orbitron text-pink text-[0.85rem] font-bold">
                {fmt(pools?.cashbackOutstanding)} USDT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[0.7rem]">Coverage</span>
              <HealthBadge value={cashbackHealth} />
            </div>
            <div className="text-[0.6rem] text-white/40 leading-relaxed pt-2 border-t border-white/5">
              Outstanding = sum of (totalAmountLost − totalAmountWon − cashbackTotalEarned) across all users.
              This is the maximum cashback the platform might owe.
            </div>
          </div>

          {/* Active draws */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="font-orbitron text-gold text-[0.65rem] font-bold mb-3">
              🎰 ACTIVE DRAWS
            </div>
            {pools?.goldenDraw && (
              <div className="text-[0.65rem] mb-1.5">
                <span className="text-gold">Golden #{pools.goldenDraw.drawNumber}</span>{' '}
                <span className="text-white/40">— {pools.goldenDraw.ticketsSold} / 10000 tickets, pool {fmt(pools.goldenDraw.totalPool, 0)} USDT</span>
              </div>
            )}
            {pools?.silverDraw && (
              <div className="text-[0.65rem]">
                <span className="text-silver">Silver #{pools.silverDraw.drawNumber}</span>{' '}
                <span className="text-white/40">— {pools.silverDraw.ticketsSold} / 10000 tickets, pool {fmt(pools.silverDraw.totalPool, 0)} USDT</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System status */}
      <SystemStatusCard data={systemStatus} />
    </AdminLayout>
  );
}

// ============================================================================
// SystemStatusCard — cron timestamps + contract listener block sync
// ============================================================================
function SystemStatusCard({ data }) {
  const cronStatus = data?.cronStatus || {};
  const listener = data?.listenerStatus;

  const cronJobs = [
    { key: 'gameScheduler', label: 'Game Scheduler', expectedFreq: 'daily 00:00' },
    { key: 'gameResult', label: 'Game Result Poster', expectedFreq: 'hourly :00' },
    { key: 'dailyCashback', label: 'Daily Cashback + ROI', expectedFreq: 'daily 00:01' },
    { key: 'luckyDrawAutoFund', label: 'Lucky Draw Auto-Fund', expectedFreq: 'after cashback' },
    { key: 'luckyDrawWatcher', label: 'Lucky Draw Watcher', expectedFreq: 'every minute' },
    { key: 'dailyClub', label: 'Daily Club Income', expectedFreq: 'daily 00:30' },
    { key: 'practiceExpiry', label: 'Practice Expiry', expectedFreq: 'daily 01:00' },
    { key: 'platformStats', label: 'Platform Stats Aggregator', expectedFreq: 'daily 23:59' },
  ];

  return (
    <div className="card-glass rounded-2xl p-5 border border-green/20">
      <div className="font-orbitron text-green text-[0.7rem] font-bold mb-4">
        ⚙️ SYSTEM STATUS
      </div>

      {/* Contract Listener block sync */}
      <div className="mb-4">
        <div className="font-orbitron text-cyan text-[0.6rem] tracking-[0.15em] mb-2">
          🔗 CONTRACT EVENT LISTENER
        </div>
        {!listener ? (
          <div className="p-3 rounded-lg bg-white/3 border border-white/5 text-[0.65rem] text-white/40">
            No data yet — listener may still be initializing
          </div>
        ) : listener.error ? (
          <div className="p-3 rounded-lg bg-pink/5 border border-pink/20 text-[0.65rem] text-pink">
            ⚠️ {listener.error}
          </div>
        ) : (
          <div
            className={`p-3 rounded-lg border ${
              listener.isHealthy
                ? 'bg-green/5 border-green/20'
                : 'bg-pink/5 border-pink/30'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    listener.isHealthy ? 'bg-green' : 'bg-pink'
                  }`}
                />
                <span className={`font-orbitron text-[0.65rem] ${listener.isHealthy ? 'text-green' : 'text-pink'}`}>
                  {listener.isHealthy ? '✓ SYNCED' : '⚠️ STALE'}
                </span>
              </div>
              <div className="text-[0.55rem] font-orbitron text-white/40">
                {listener.blocksBehind} blocks behind ({listener.secondsBehind}s)
              </div>
            </div>
            <div className="mt-2 text-[0.55rem] text-white/30 font-orbitron grid grid-cols-2 gap-2">
              <div>
                Last block:{' '}
                <span className="text-cyan">{listener.lastProcessedBlock}</span>
              </div>
              <div>
                Current:{' '}
                <span className="text-cyan">{listener.currentBlock}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cron jobs */}
      <div>
        <div className="font-orbitron text-purple text-[0.6rem] tracking-[0.15em] mb-2">
          ⏱️ CRON JOBS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[0.65rem]">
          {cronJobs.map((job) => {
            const status = cronStatus[job.key];
            return <CronRow key={job.key} job={job} status={status} />;
          })}
        </div>
      </div>
    </div>
  );
}

function CronRow({ job, status }) {
  let dotColor = 'bg-white/20';
  let badge = 'NEVER RUN';
  let badgeColor = 'text-white/30';
  let detail = job.expectedFreq;

  if (status) {
    const ageSec = status.ageSec || 0;
    const success = status.success !== false;

    let ageLabel;
    if (ageSec < 60) ageLabel = `${ageSec}s ago`;
    else if (ageSec < 3600) ageLabel = `${Math.floor(ageSec / 60)}m ago`;
    else if (ageSec < 86400) ageLabel = `${Math.floor(ageSec / 3600)}h ago`;
    else ageLabel = `${Math.floor(ageSec / 86400)}d ago`;

    if (!success) {
      dotColor = 'bg-pink animate-pulse';
      badge = '⚠️ FAILED';
      badgeColor = 'text-pink';
      detail = `${ageLabel} · ${status.error || 'unknown error'}`;
    } else {
      // Determine "stale" — if older than expected window
      const isStale =
        (job.key === 'luckyDrawWatcher' && ageSec > 120) ||
        (job.key === 'gameResult' && ageSec > 3700) ||
        (['dailyCashback', 'dailyClub', 'gameScheduler', 'platformStats', 'practiceExpiry'].includes(job.key) && ageSec > 90000);

      dotColor = isStale ? 'bg-yellow-400' : 'bg-green animate-pulse';
      badge = isStale ? '⚠️ STALE' : '✓ OK';
      badgeColor = isStale ? 'text-yellow-400' : 'text-green';
      detail = `${ageLabel} · ${status.durationMs}ms`;
    }
  }

  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
      <div className={`w-2 h-2 rounded-full mt-1 ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-orbitron text-white/70 text-[0.65rem]">{job.label}</span>
          <span className={`font-orbitron text-[0.5rem] ${badgeColor}`}>{badge}</span>
        </div>
        <div className="text-white/30 text-[0.55rem] mt-0.5 truncate">{detail}</div>
      </div>
    </div>
  );
}

function DashStatCard({ label, value, color, suffix = ' USDT' }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    pink: 'text-pink border-pink/20',
    gold: 'text-gold border-gold/20',
  }[color];
  const isCount = suffix === '';
  const display = isCount ? num(value) : fmt(value);
  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass}`}>
      <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">{label}</div>
      <div className={`font-orbitron font-bold text-[1.3rem] ${colorClass.split(' ')[0]}`}>
        {display}
        {!isCount && <span className="text-[0.55rem] text-white/30 ml-1">USDT</span>}
      </div>
    </div>
  );
}

function KPICard({ label, icon, color, today, total, suffix = ' USDT' }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    purple: 'text-purple border-purple/20',
    gold: 'text-gold border-gold/20',
  }[color] || 'text-white/60 border-white/10';
  const isCount = suffix === '';
  const fmtVal = (v) => (isCount ? String(v || 0) : fmt(v));
  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[1rem]">{icon}</span>
        <span className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.15em]">{label}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <div>
          <div className="text-[0.45rem] text-white/30 font-orbitron mb-0.5">TODAY</div>
          <div className={`font-orbitron font-bold text-[1.1rem] ${colorClass.split(' ')[0]}`}>
            {fmtVal(today)}{!isCount && <span className="text-[0.45rem] text-white/20 ml-0.5">USDT</span>}
          </div>
        </div>
        <div className="border-l border-white/10 pl-3">
          <div className="text-[0.45rem] text-white/30 font-orbitron mb-0.5">TOTAL</div>
          <div className="font-orbitron text-[0.85rem] text-white/60">
            {fmtVal(total)}{!isCount && <span className="text-[0.45rem] text-white/20 ml-0.5">USDT</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolRow({ label, value, color }) {
  const colorClass = {
    gold: 'text-gold',
    green: 'text-green',
    cyan: 'text-cyan',
    purple: 'text-purple',
    pink: 'text-pink',
    blue: 'text-blue',
    silver: 'text-silver',
  }[color];
  return (
    <div className="flex items-center justify-between text-[0.7rem]">
      <span className="text-white/50">{label}</span>
      <span className={`font-orbitron ${colorClass}`}>{fmt(value)} USDT</span>
    </div>
  );
}

function HealthBadge({ value }) {
  // value is a coverage ratio: 1.0+ = green, 0.5-1.0 = yellow, <0.5 = red
  let color, label;
  if (value >= 1.0) {
    color = 'text-green border-green/30 bg-green/5';
    label = '✅ HEALTHY';
  } else if (value >= 0.5) {
    color = 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
    label = '⚠️ WATCH';
  } else {
    color = 'text-pink border-pink/30 bg-pink/5';
    label = '🚨 CRITICAL';
  }
  return (
    <span className={`px-3 py-1 rounded-full border font-orbitron text-[0.55rem] ${color}`}>
      {label} ({fmt(value * 100, 0)}%)
    </span>
  );
}

