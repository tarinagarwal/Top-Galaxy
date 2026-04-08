import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';

export default function AdminAnalytics() {
  const [stats, setStats] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, f, l] = await Promise.all([
        api.get('/api/admin/analytics/stats?days=30'),
        api.get('/api/admin/analytics/activation-funnel'),
        api.get('/api/admin/analytics/leaderboards'),
      ]);
      setStats(s.data.stats || []);
      setFunnel(f.data || null);
      setLeaderboards(l.data || null);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Stats are returned newest-first; reverse for left-to-right charts
  const chronological = [...stats].reverse();

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Analytics</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          User growth, turnover, payouts, and leaderboards
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
      ) : (
        <>
          {/* Activation funnel */}
          <ActivationFunnel funnel={funnel} />

          {/* User growth chart */}
          <Chart
            title="📈 USER GROWTH (last 30 days)"
            color="cyan"
            data={chronological.map((s) => ({
              label: s.date,
              value: num(s.newUsers),
              cumulative: num(s.totalUsers),
            }))}
            primaryKey="value"
            secondaryKey="cumulative"
            primaryLabel="New users"
            secondaryLabel="Cumulative"
            primaryColor="cyan"
            secondaryColor="purple"
          />

          {/* Turnover chart */}
          <Chart
            title="💰 DAILY TURNOVER (last 30 days)"
            color="gold"
            data={chronological.map((s) => ({
              label: s.date,
              value: num(s.totalTurnover),
            }))}
            primaryKey="value"
            primaryLabel="Turnover (USDT)"
            primaryColor="gold"
            isUsdt
          />

          {/* Payouts stacked breakdown */}
          <PayoutsBreakdown stats={chronological} />

          {/* Cashback pool health */}
          <CashbackHealthChart stats={chronological} />

          {/* Leaderboards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <Leaderboard
              title="🏆 TOP DEPOSITORS"
              color="gold"
              users={leaderboards?.topDepositors || []}
              valueKey="totalDeposited"
              valueLabel="Deposited"
            />
            <Leaderboard
              title="⭐ TOP TEAM VOLUME"
              color="cyan"
              users={leaderboards?.topReferrers || []}
              valueKey="totalBusinessVolume"
              valueLabel="Team volume"
            />
            <Leaderboard
              title="💰 TOP EARNERS"
              color="green"
              users={leaderboards?.topEarners || []}
              valueKey="totalEarned"
              valueLabel="Earned"
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// ============================================================================
// ActivationFunnel
// ============================================================================
function ActivationFunnel({ funnel }) {
  if (!funnel) return null;
  const stages = [
    { label: 'Registered', value: funnel.registered, color: 'cyan' },
    { label: 'Practice Active', value: funnel.practiceActive, color: 'silver' },
    { label: 'BASIC (≥10 USDT)', value: funnel.basic, color: 'gold' },
    { label: 'PRO (≥100 USDT)', value: funnel.pro, color: 'green' },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="card-glass rounded-2xl p-5 mb-4 border border-purple/20">
      <div className="font-orbitron text-purple text-[0.7rem] font-bold mb-4">
        🔻 USER ACTIVATION FUNNEL
      </div>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const pct = (s.value / max) * 100;
          const conversionFromPrev =
            i > 0 && stages[i - 1].value > 0 ? (s.value / stages[i - 1].value) * 100 : null;
          const colorClass = {
            cyan: 'bg-gradient-to-r from-cyan to-blue',
            silver: 'bg-gradient-to-r from-silver to-silver2',
            gold: 'bg-gradient-to-r from-gold to-gold2',
            green: 'bg-gradient-to-r from-green to-green2',
          }[s.color];
          const textColor = `text-${s.color}`;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[0.65rem] mb-1">
                <span className={`font-orbitron ${textColor}`}>{s.label}</span>
                <div className="font-orbitron flex items-center gap-3">
                  <span className="text-white">{num(s.value).toLocaleString()} users</span>
                  {conversionFromPrev !== null && (
                    <span className="text-white/40 text-[0.55rem]">
                      ({fmt(conversionFromPrev, 1)}% conv)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-6 rounded-lg bg-white/3 overflow-hidden">
                <div
                  className={`h-full ${colorClass} transition-all flex items-center justify-end px-3`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Chart — pure CSS bar chart with hover tooltips
// ============================================================================
function Chart({ title, color, data, primaryKey, secondaryKey, primaryColor, secondaryColor, primaryLabel, secondaryLabel, isUsdt }) {
  if (!data || data.length === 0) {
    return (
      <div className="card-glass rounded-2xl p-5 mb-4 border border-white/10">
        <div className={`font-orbitron text-${color} text-[0.7rem] font-bold mb-3`}>{title}</div>
        <div className="text-center py-12 text-white/30 font-orbitron text-[0.65rem]">
          No data yet
        </div>
      </div>
    );
  }

  const maxPrimary = Math.max(...data.map((d) => num(d[primaryKey])), 1);
  const maxSecondary = secondaryKey
    ? Math.max(...data.map((d) => num(d[secondaryKey])), 1)
    : null;

  const primaryClass = {
    cyan: 'bg-gradient-to-t from-cyan to-blue',
    gold: 'bg-gradient-to-t from-gold to-gold2',
    green: 'bg-gradient-to-t from-green to-green2',
    purple: 'bg-gradient-to-t from-purple to-pink',
    pink: 'bg-gradient-to-t from-pink to-purple',
  }[primaryColor];

  return (
    <div className="card-glass rounded-2xl p-5 mb-4 border border-white/10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className={`font-orbitron text-${color} text-[0.7rem] font-bold`}>{title}</div>
        <div className="flex items-center gap-3 text-[0.55rem] font-orbitron">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${primaryClass}`} />
            <span className="text-white/50">{primaryLabel}</span>
          </div>
          {secondaryKey && (
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded border-2 border-${secondaryColor} bg-transparent`} />
              <span className="text-white/50">{secondaryLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative h-[200px] flex items-end justify-between gap-1 border-b border-l border-white/10 pb-1 pl-1">
        {data.map((d, i) => {
          const height = (num(d[primaryKey]) / maxPrimary) * 100;
          const secondaryHeight = secondaryKey
            ? (num(d[secondaryKey]) / maxSecondary) * 100
            : 0;
          return (
            <div
              key={i}
              className="relative flex-1 h-full flex flex-col justify-end items-center group"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                <div className="bg-deep border border-white/20 rounded px-2 py-1 text-[0.55rem] font-orbitron">
                  <div className="text-white">{d.label}</div>
                  <div className={`text-${primaryColor}`}>
                    {primaryLabel}: {isUsdt ? fmt(d[primaryKey]) : num(d[primaryKey]).toLocaleString()}
                  </div>
                  {secondaryKey && (
                    <div className={`text-${secondaryColor}`}>
                      {secondaryLabel}: {num(d[secondaryKey]).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary line marker (cumulative) */}
              {secondaryKey && (
                <div
                  className={`absolute left-0 right-0 h-0.5 bg-${secondaryColor}`}
                  style={{ bottom: `${secondaryHeight}%` }}
                />
              )}

              {/* Primary bar */}
              <div
                className={`w-full ${primaryClass} rounded-t opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{ height: `${Math.max(height, 1)}%`, minHeight: '2px' }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels (sample every Nth) */}
      <div className="flex justify-between text-[0.5rem] text-white/30 font-orbitron mt-2">
        {data.length > 0 && (
          <>
            <span>{data[0].label}</span>
            {data.length > 2 && <span>{data[Math.floor(data.length / 2)].label}</span>}
            <span>{data[data.length - 1].label}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PayoutsBreakdown — stacked bars per stream
// ============================================================================
function PayoutsBreakdown({ stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="card-glass rounded-2xl p-5 mb-4 border border-white/10">
        <div className="font-orbitron text-pink text-[0.7rem] font-bold mb-3">
          💸 PAYOUTS PER STREAM
        </div>
        <div className="text-center py-12 text-white/30 font-orbitron text-[0.65rem]">
          No payouts data yet
        </div>
      </div>
    );
  }

  const streams = [
    { key: 'winnings', label: 'Winnings', color: 'gold' },
    { key: 'referral', label: 'Referral', color: 'cyan' },
    { key: 'winnersReferral', label: 'Win Ref', color: 'pink' },
    { key: 'cashback', label: 'Cashback', color: 'green' },
    { key: 'roi', label: 'ROI', color: 'purple' },
    { key: 'club', label: 'Club', color: 'gold' },
    { key: 'luckyDraw', label: 'Lucky', color: 'blue' },
  ];

  // Compute max stack total
  const maxTotal = Math.max(
    ...stats.map((s) => streams.reduce((sum, st) => sum + num(s.totalPayouts?.[st.key]), 0)),
    1
  );

  const colorBg = {
    gold: 'bg-gold',
    cyan: 'bg-cyan',
    pink: 'bg-pink',
    green: 'bg-green',
    purple: 'bg-purple',
    blue: 'bg-blue',
  };

  return (
    <div className="card-glass rounded-2xl p-5 mb-4 border border-pink/20">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="font-orbitron text-pink text-[0.7rem] font-bold">
          💸 PAYOUTS PER STREAM (last 30 days)
        </div>
        <div className="flex items-center gap-2 text-[0.5rem] font-orbitron flex-wrap">
          {streams.map((s) => (
            <div key={s.key} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded ${colorBg[s.color]}`} />
              <span className="text-white/50">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[220px] flex items-end justify-between gap-1 border-b border-l border-white/10 pb-1 pl-1">
        {stats.map((s, i) => {
          const total = streams.reduce((sum, st) => sum + num(s.totalPayouts?.[st.key]), 0);
          const heightPct = (total / maxTotal) * 100;

          return (
            <div
              key={i}
              className="relative flex-1 h-full flex flex-col justify-end items-center group"
              style={{ height: '100%' }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                <div className="bg-deep border border-white/20 rounded px-2 py-1 text-[0.55rem] font-orbitron space-y-0.5">
                  <div className="text-white">{s.date}</div>
                  <div className="text-gold">Total: {fmt(total)}</div>
                  {streams.map((st) => {
                    const v = num(s.totalPayouts?.[st.key]);
                    if (v === 0) return null;
                    return (
                      <div key={st.key} className={`text-${st.color}`}>
                        {st.label}: {fmt(v)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stacked bar */}
              <div
                className="w-full flex flex-col-reverse opacity-80 group-hover:opacity-100"
                style={{ height: `${Math.max(heightPct, 1)}%`, minHeight: '2px' }}
              >
                {streams.map((st) => {
                  const v = num(s.totalPayouts?.[st.key]);
                  if (v === 0 || total === 0) return null;
                  const segPct = (v / total) * 100;
                  return (
                    <div
                      key={st.key}
                      className={colorBg[st.color]}
                      style={{ height: `${segPct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[0.5rem] text-white/30 font-orbitron mt-2">
        {stats.length > 0 && (
          <>
            <span>{stats[0].date}</span>
            {stats.length > 2 && <span>{stats[Math.floor(stats.length / 2)].date}</span>}
            <span>{stats[stats.length - 1].date}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CashbackHealthChart — line over time
// ============================================================================
function CashbackHealthChart({ stats }) {
  // We don't have historical cashback pool data — use cashback payouts as proxy
  const data = stats.map((s) => ({
    label: s.date,
    value: num(s.totalPayouts?.cashback),
  }));

  return (
    <Chart
      title="🛡️ DAILY CASHBACK PAYOUTS"
      color="green"
      data={data}
      primaryKey="value"
      primaryLabel="Cashback (USDT)"
      primaryColor="green"
      isUsdt
    />
  );
}

// ============================================================================
// Leaderboard
// ============================================================================
function Leaderboard({ title, color, users, valueKey, valueLabel }) {
  const colorClass = {
    gold: 'border-gold/30 text-gold',
    cyan: 'border-cyan/30 text-cyan',
    green: 'border-green/30 text-green',
  }[color];

  return (
    <div className={`card-glass rounded-2xl border ${colorClass.split(' ')[0]} overflow-hidden`}>
      <div className={`p-4 border-b border-white/10 font-orbitron text-[0.7rem] font-bold ${colorClass.split(' ')[1]}`}>
        {title}
      </div>
      {users.length === 0 ? (
        <div className="text-center py-8 text-white/30 font-orbitron text-[0.65rem]">No data</div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-[0.6rem]">
            <thead className="bg-white/5 border-b border-white/10 sticky top-0">
              <tr className="text-left text-white/40 font-orbitron text-[0.5rem] tracking-[0.1em]">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">USER</th>
                <th className="py-2 px-3 text-right">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-1.5 px-3 font-orbitron text-white/40">{i + 1}</td>
                  <td className="py-1.5 px-3 font-orbitron text-white/70">
                    {u.walletAddress
                      ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}`
                      : '—'}
                    {u.referralCode && (
                      <div className="text-[0.5rem] text-cyan">{u.referralCode}</div>
                    )}
                  </td>
                  <td className={`py-1.5 px-3 font-orbitron text-right ${colorClass.split(' ')[1]}`}>
                    {fmt(u[valueKey])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
