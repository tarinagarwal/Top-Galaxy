import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { fmt, num } from '../../lib/format';
import SectionHeader from '../SectionHeader';

/**
 * LiveStatsSection — fetches /api/public/stats (no auth required) and shows
 * total users, total paid out, and current lucky draw ticket counts.
 */
export default function LiveStatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = () => {
      api
        .get('/api/public/stats')
        .then(({ data }) => {
          if (!cancelled) {
            setStats(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchStats();
    // Refresh every 30 seconds so the numbers feel live
    const id = setInterval(fetchStats, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const goldenSold = num(stats?.goldenDraw?.ticketsSold);
  const goldenTotal = num(stats?.goldenDraw?.totalTickets) || 10000;
  const goldenPct = goldenTotal > 0 ? (goldenSold / goldenTotal) * 100 : 0;

  const silverSold = num(stats?.silverDraw?.ticketsSold);
  const silverTotal = num(stats?.silverDraw?.totalTickets) || 10000;
  const silverPct = silverTotal > 0 ? (silverSold / silverTotal) * 100 : 0;

  return (
    <section id="live-stats">
      <div className="divider-line" />
      <SectionHeader
        eyebrow="📊 LIVE PLATFORM STATS"
        eyebrowColor="cyan"
        title="Real Numbers, Right Now"
        titleClass="text-gradient-gold-cyan"
        description="Live counts updated every 30 seconds — straight from the chain & database."
      />

      <div className="max-w-[1200px] mx-auto px-6 pb-[80px]">
        {/* 4 stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <LiveStatCard
            label="TOTAL USERS"
            value={loading ? '—' : num(stats?.totalUsers).toLocaleString()}
            sub={loading ? '' : `${num(stats?.realCashUsers).toLocaleString()} real cash activated`}
            color="cyan"
            icon="👥"
          />
          <LiveStatCard
            label="TOTAL USDT PAID OUT"
            value={loading ? '—' : fmt(stats?.totalPaidOut, 0)}
            sub="Across all 7 streams"
            color="gold"
            icon="💰"
            suffix=" USDT"
          />
          <LiveStatCard
            label="GOLDEN DRAW"
            value={loading ? '—' : `${goldenSold} / ${goldenTotal}`}
            sub={
              loading
                ? ''
                : stats?.goldenDraw
                ? `Draw #${stats.goldenDraw.drawNumber} · ${fmt(goldenPct, 1)}% filled`
                : 'No active draw'
            }
            color="yellow"
            icon="🏆"
          />
          <LiveStatCard
            label="SILVER DRAW"
            value={loading ? '—' : `${silverSold} / ${silverTotal}`}
            sub={
              loading
                ? ''
                : stats?.silverDraw
                ? `Draw #${stats.silverDraw.drawNumber} · ${fmt(silverPct, 1)}% filled`
                : 'No active draw'
            }
            color="silver"
            icon="🥈"
          />
        </div>

        {/* Draw progress bars */}
        {!loading && (stats?.goldenDraw || stats?.silverDraw) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.goldenDraw && (
              <DrawProgress
                type="GOLDEN"
                icon="🏆"
                color="gold"
                sold={goldenSold}
                total={goldenTotal}
                pct={goldenPct}
                pool={stats.goldenDraw.totalPool}
                prize={70000}
              />
            )}
            {stats?.silverDraw && (
              <DrawProgress
                type="SILVER"
                icon="🥈"
                color="silver"
                sold={silverSold}
                total={silverTotal}
                pct={silverPct}
                pool={stats.silverDraw.totalPool}
                prize={7000}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function LiveStatCard({ label, value, sub, color, icon, suffix = '' }) {
  const colorClass = {
    cyan: 'border-cyan/40 text-cyan',
    gold: 'border-gold/40 text-gold',
    yellow: 'border-gold/40 text-gold',
    silver: 'border-silver/40 text-silver',
  }[color];

  return (
    <div className={`card-glass rounded-2xl p-5 border ${colorClass.split(' ')[0]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[1.8rem]">{icon}</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          <span className="text-[0.5rem] text-green font-orbitron">LIVE</span>
        </div>
      </div>
      <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.15em] mb-1">
        {label}
      </div>
      <div className={`font-russo text-[1.6rem] ${colorClass.split(' ')[1]} leading-none`}>
        {value}
        {suffix && <span className="text-[0.55rem] text-white/30 ml-1">{suffix}</span>}
      </div>
      {sub && <div className="text-[0.55rem] text-white/40 font-orbitron mt-2">{sub}</div>}
    </div>
  );
}

function DrawProgress({ type, icon, color, sold, total, pct, pool, prize }) {
  const colorClass = {
    gold: { border: 'border-gold/30', text: 'text-gold', bg: 'from-gold to-gold2' },
    silver: { border: 'border-silver/30', text: 'text-silver', bg: 'from-silver to-silver2' },
  }[color];

  return (
    <div className={`card-glass rounded-2xl p-5 border ${colorClass.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[1.6rem]">{icon}</span>
        <div className={`font-orbitron text-[0.75rem] font-bold ${colorClass.text}`}>
          {type} JACKPOT
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[0.6rem] font-orbitron mb-1">
          <span className="text-white/40">TICKETS</span>
          <span className={colorClass.text}>
            {sold} / {total}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colorClass.bg} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[0.6rem]">
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <div className="text-white/30 font-orbitron text-[0.5rem]">CURRENT POOL</div>
          <div className={`font-orbitron font-bold ${colorClass.text}`}>
            {fmt(pool, 0)} USDT
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <div className="text-white/30 font-orbitron text-[0.5rem]">TOTAL PRIZE</div>
          <div className={`font-orbitron font-bold ${colorClass.text}`}>
            {fmt(prize, 0)} USDT
          </div>
        </div>
      </div>
    </div>
  );
}
