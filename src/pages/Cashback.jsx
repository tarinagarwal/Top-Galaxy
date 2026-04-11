import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { useSocket } from '../hooks/useSocket';
import { fmt, num } from '../lib/format';

function useCountdownTo(isoTarget) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!isoTarget) { setRemaining('--'); return; }
    const target = new Date(isoTarget).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setRemaining('Processing soon...'); return; }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoTarget]);
  return remaining;
}

export default function Cashback() {
  const isAdmin = useAuthStore((s) => s.isOperationalAdmin || s.isSuperAdmin);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        api.get('/api/cashback/status'),
        api.get('/api/cashback/history?pageSize=30'),
      ]);
      setStatus(s.data);
      setHistory(h.data.logs || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh on any cashback credit
  useSocket({
    'cashback:credited': () => refresh(),
    'roi:credited': () => refresh(),
  });

  const nextPayout = useCountdownTo(status?.nextPayoutAt);

  if (loading) {
    return (
      <div>
        <StarfieldCanvas />
        <Navbar />
        <div className="relative z-10 min-h-screen pt-[120px] px-6 text-center text-white/40 font-orbitron text-[0.7rem]">
          Loading cashback status...
        </div>
      </div>
    );
  }

  const s = status || {};
  const r = s.requirements || {};

  // Coerce all numeric fields to safe numbers up-front
  const effectiveCap = num(s.effectiveCap ?? s.capLimit);
  const rawCap = num(s.rawCap);
  const floorCap = num(s.floorCap);
  const otherIncome = num(s.otherIncome);
  const reductionApplied = num(s.reductionApplied);
  const baseAmount = num(s.baseAmount);
  const maxBase = num(s.maxBase || 2000);
  const cashbackEarned = num(s.cashbackTotalEarned);
  const capProgress = effectiveCap > 0 ? Math.min(100, (cashbackEarned / effectiveCap) * 100) : 0;
  const capPct = capProgress.toFixed(1);
  const isHighTier = (s.capMultiplier || 0) > 4;
  const hasReduction = isHighTier && reductionApplied > 0;

  // Multiplier ladder for "next tier" hint
  const nextTierInfo = (() => {
    const directs = s.qualifyingDirects || 0;
    if (directs >= 20) return null;
    const tiers = [
      { count: 5, mult: 2 },
      { count: 10, mult: 4 },
      { count: 20, mult: 8 },
    ];
    const next = tiers.find((t) => directs < t.count);
    if (!next) return null;
    return { needed: next.count - directs, mult: next.mult };
  })();

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-green uppercase mb-2">
              🛡️ CASHBACK PROTECTION
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-green">
              Net Loss Cashback
            </h1>
            <p className="text-white/40 text-[0.75rem] mt-2 max-w-[600px]">
              Daily auto-cashback recovers your game net losses. The system credits a percentage of your
              effective net loss every day, and your lifetime cap scales with your direct referral count.
            </p>
          </div>

          {/* PRO required banner */}
          {r.proActivationRequired && (
            <div className="card-glass rounded-2xl p-5 mb-6 border border-pink/30 bg-pink/5">
              <div className="font-orbitron text-pink text-[0.85rem] mb-1">⚠️ PRO ACTIVATION REQUIRED</div>
              <div className="text-white/50 text-[0.7rem] mb-3">
                Cashback protection only activates for PRO users (deposit ≥ {r.proThreshold} USDT total).
              </div>
              <Link
                to="/wallet"
                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-br from-gold to-gold2 text-black font-orbitron text-[0.65rem] font-bold tracking-[0.1em] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              >
                💰 GO TO WALLET
              </Link>
            </div>
          )}

          {/* Paused banner */}
          {s.cashbackPaused && (
            <div className="card-glass rounded-2xl p-5 mb-6 border-2 border-pink/40 bg-pink/5">
              <div className="font-orbitron text-pink text-[0.85rem] mb-1">⏸️ CASHBACK PAUSED — CAP REACHED</div>
              <div className="text-white/50 text-[0.7rem] mb-3">
                You've received the maximum cashback for your current cap. Re-deposit{' '}
                <span className="text-gold font-orbitron">{r.reactivationDeposit} USDT</span> to resume cashback.
              </div>
              <Link
                to="/wallet"
                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-br from-gold to-gold2 text-black font-orbitron text-[0.65rem] font-bold tracking-[0.1em] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              >
                🔄 RE-DEPOSIT TO REACTIVATE
              </Link>
            </div>
          )}

          {/* Eligibility + Next Payout */}
          <div className={`card-glass rounded-2xl p-5 mb-6 border ${s.eligible ? 'border-green/30 bg-green/5' : 'border-yellow-400/30 bg-yellow-400/5'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className={`font-orbitron text-[0.85rem] font-bold mb-1 ${s.eligible ? 'text-green' : 'text-yellow-400'}`}>
                  {s.eligible ? 'CASHBACK ACTIVE' : 'NOT YET ELIGIBLE'}
                </div>
                {s.eligible ? (
                  <div className="text-white/50 text-[0.65rem] space-y-0.5">
                    <div>You'll receive approximately <span className="text-green font-orbitron">{fmt(s.estimatedDailyAmount, 3)} USDT</span> at next payout</div>
                    <div className="text-white/30">Rate: {fmt(num(s.rate) * 100, 2)}% of your effective net loss daily</div>
                    {num(s.effectiveNetLoss) > maxBase && (
                      <div className="text-white font-orbitron mt-1">⚠️ Only {fmt(maxBase, 0)} USDT will be counted for cashback (max base)</div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/50 text-[0.65rem] space-y-0.5">
                    {r.proActivationRequired && <div>Requires PRO activation (deposit {r.proThreshold}+ USDT)</div>}
                    {!r.proActivationRequired && num(s.effectiveNetLoss) < num(r.minNetLoss) && (
                      <div>Minimum net loss required: <span className="text-gold font-orbitron">{fmt(r.minNetLoss)} USDT</span> (current: {fmt(s.effectiveNetLoss)})</div>
                    )}
                    {s.cashbackPaused && <div>Cap reached — re-deposit to reactivate</div>}
                  </div>
                )}
              </div>
              <div className="text-center md:text-right">
                <div className="text-[0.65rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">NEXT PAYOUT IN</div>
                <div className={`font-russo text-[1.8rem] leading-none ${s.eligible ? 'text-green' : 'text-white/20'}`}>
                  {nextPayout}
                </div>
                <div className="text-[0.6rem] text-white/20 mt-1">Daily at 01:30 server time</div>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      setTriggering(true);
                      setTriggerResult(null);
                      try {
                        const { data } = await api.post('/api/admin/cron/cashback');
                        setTriggerResult({ type: 'success', message: `Cashback processed: ${data.result?.processed || 0} users credited` });
                        refresh();
                      } catch (err) {
                        setTriggerResult({ type: 'error', message: err?.response?.data?.error || 'Trigger failed' });
                      }
                      setTriggering(false);
                    }}
                    disabled={triggering}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.65rem] hover:bg-gold/20 disabled:opacity-40"
                  >
                    {triggering ? '...' : 'TRIGGER NOW'}
                  </button>
                )}
              </div>
            </div>
            {triggerResult && (
              <div className={`mt-3 p-2 rounded-lg text-[0.6rem] ${
                triggerResult.type === 'success' ? 'bg-green/5 border border-green/20 text-green' : 'bg-pink/5 border border-pink/20 text-pink'
              }`}>
                {triggerResult.message}
              </div>
            )}
          </div>

          {/* Net Loss Range Progress Bar */}
          <NetLossRangeBar
            current={num(s.effectiveNetLoss)}
            min={num(r.minNetLoss || 100)}
            max={num(maxBase)}
          />

          {/* Top stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="CASHBACK WALLET" value={fmt(s.cashbackWallet, 3)} color="green" highlight />
            <StatCard
              label="EFFECTIVE NET LOSS"
              value={s.effectiveNetLoss}
              color="pink"
              footer={num(s.effectiveNetLoss) > maxBase ? `Only ${fmt(maxBase, 0)} USDT will be counted` : null}
            />
            <StatCard label="DAILY RATE" value={fmt(num(s.rate) * 100, 2)} suffix="%" color="gold" unit="of effective net loss" />
            <StatCard label="EST. DAILY AMOUNT" value={fmt(s.estimatedDailyAmount, 3)} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Net loss breakdown */}
            <div className="lg:col-span-2 card-glass rounded-2xl p-6 border border-white/10">
              <div className="font-orbitron text-cyan text-[0.75rem] font-bold mb-4">
                📊 NET LOSS BREAKDOWN
              </div>
              <div className="space-y-3 text-[0.75rem]">
                <BreakdownRow label="Total Played in Games" value={s.totalAmountPlayed} sign="+" color="pink" />
                <BreakdownRow label="Total Won in Games" value={s.totalAmountWon} sign="-" color="green" />
                <div className="border-t border-white/10 pt-3 mt-3" />
                <BreakdownRow label="Net Loss (game-only)" value={s.netLoss} bold color="pink" />
                <BreakdownRow label="Cashback Already Received" value={s.cashbackTotalEarned} sign="-" color="gold" />
                <div className="border-t border-white/10 pt-3 mt-3" />
                <BreakdownRow label="Effective Net Loss (today's base)" value={s.effectiveNetLoss} bold color="pink" />
                {num(s.effectiveNetLoss) > maxBase && (
                  <div className="mt-2 p-2 rounded-lg bg-white/10 border border-white/20 text-[0.6rem] text-white font-orbitron">
                    ⚠️ Only {fmt(maxBase, 0)} USDT will be counted for cashback calculation (max base cap)
                  </div>
                )}
              </div>

              <div className="mt-5 p-3 rounded-lg bg-white/3 text-[0.65rem] text-white/40 leading-relaxed">
                💡 Cashback is calculated on your <strong className="text-white/60">game-only net loss</strong>{' '}
                (losses minus wins). Other income from referrals, club, and ROI doesn't reduce your daily
                cashback — but for the <strong className="text-white/60">8× tier</strong> (20+ direct referrals)
                it reduces your <strong className="text-white/60">lifetime cap</strong> instead, with a floor at
                the 4× tier value.
              </div>
            </div>

            {/* Cap progress */}
            <div className="card-glass rounded-2xl p-6 border border-gold/20">
              <div className="font-orbitron text-gold text-[0.75rem] font-bold mb-4">
                🎯 CAP TRACKER
              </div>

              <div className="text-center mb-4">
                <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">CURRENT TIER</div>
                <div className="font-russo text-[3rem] text-gold leading-none">
                  {s.capMultiplier || 1}×
                </div>
                <div className="text-[0.6rem] text-white/40 mt-1">
                  {s.qualifyingDirects || 0} qualifying referrals
                </div>
              </div>

              {/* Net Loss base → Cap */}
              <div className="mb-4 p-3 rounded-lg bg-white/3 border border-white/5 text-[0.65rem]">
                <div className="text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em] mb-1">CAP BASE (today's effective net loss)</div>
                <div className="font-orbitron text-white/80">
                  {fmt(baseAmount, 2)} × {s.capMultiplier || 1}× ={' '}
                  <span className="text-gold">{fmt(rawCap, 2)} USDT</span>
                </div>
                <div className="text-[0.65rem] text-white/30 mt-1">
                  Base capped at {fmt(maxBase, 0)} USDT max · recalculates daily
                </div>
              </div>

              {/* Income deduction card — only for 8× tier with reduction */}
              {hasReduction && (
                <div className="mb-4 p-3 rounded-lg bg-pink/5 border border-pink/20 text-[0.65rem] space-y-1">
                  <div className="text-pink font-orbitron text-[0.68rem] tracking-[0.1em] mb-1">
                    📉 INCOME DEDUCTION (8× TIER)
                  </div>
                  <div className="text-white/60">
                    Other income earned:{' '}
                    <span className="text-gold font-orbitron">{fmt(otherIncome)} USDT</span>
                  </div>
                  <div className="text-white/60">
                    Cap reduced by:{' '}
                    <span className="text-pink font-orbitron">−{fmt(reductionApplied)} USDT</span>
                  </div>
                  <div className="text-white/60">
                    Floor (4× tier):{' '}
                    <span className="text-cyan font-orbitron">{fmt(floorCap)} USDT</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between text-[0.6rem] font-orbitron mb-1.5">
                  <span className="text-white/50">EFFECTIVE CAP USED</span>
                  <span className="text-gold">{capPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capProgress >= 100 ? 'bg-pink' : 'bg-gradient-to-r from-gold to-gold2'
                    }`}
                    style={{ width: `${capProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[0.68rem] font-orbitron mt-1.5 text-white/30">
                  <span>{fmt(cashbackEarned)} USDT</span>
                  <span>{fmt(effectiveCap)} USDT</span>
                </div>
              </div>

              {nextTierInfo && (
                <div className="p-3 rounded-lg bg-cyan/5 border border-cyan/20 text-[0.65rem]">
                  <div className="text-cyan font-orbitron mb-1">⬆️ NEXT TIER</div>
                  <div className="text-white/50">
                    Refer{' '}
                    <span className="text-gold font-orbitron">{nextTierInfo.needed} more</span>{' '}
                    qualifying users (each with 100+ USDT deposited) to unlock{' '}
                    <span className="text-gold font-orbitron">{nextTierInfo.mult}× cap</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History table */}
          <div className="card-glass rounded-2xl p-6 border border-white/10">
            <div className="font-orbitron text-purple text-[0.75rem] font-bold mb-4">
              📜 CASHBACK HISTORY
            </div>
            {history.length === 0 ? (
              <div className="text-center py-8 text-[0.7rem] text-white/30">
                No cashback received yet. Payouts are processed daily at midnight.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.7rem]">
                  <thead>
                    <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em] border-b border-white/10">
                      <th className="py-2 px-2">DATE</th>
                      <th className="py-2 px-2 text-right">EFFECTIVE NET LOSS</th>
                      <th className="py-2 px-2 text-right">RATE</th>
                      <th className="py-2 px-2 text-right">RECEIVED</th>
                      <th className="py-2 px-2 text-right">CAP LIMIT</th>
                      <th className="py-2 px-2 text-center">CAP HIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.filter(Boolean).map((row) => (
                      <tr key={row._id} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2 px-2 font-orbitron text-white/70">{row.date}</td>
                        <td className="py-2 px-2 font-orbitron text-cyan text-right">
                          {fmt(num(row.netLoss) - num(row.cashbackTotalEarnedBefore))}
                        </td>
                        <td className="py-2 px-2 font-orbitron text-gold text-right">
                          {fmt(num(row.cashbackRate) * 100)}%
                        </td>
                        <td className="py-2 px-2 font-orbitron text-green text-right">
                          +{fmt(row.cashbackAmount, 4)}
                        </td>
                        <td className="py-2 px-2 font-orbitron text-white/40 text-right">
                          {fmt(row.capLimit)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {row.capHit ? (
                            <span className="text-pink font-orbitron text-[0.68rem]">⚠️ HIT</span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NetLossRangeBar({ current, min, max }) {
  const safe = Math.max(0, current);
  const belowMin = safe < min;
  const atMax = safe >= max;
  const inRange = !belowMin && !atMax;

  // Progress percent: 0% at 0, 100% at max
  const pct = Math.min(100, (safe / max) * 100);
  const minPct = (min / max) * 100;

  const fillColor = belowMin
    ? 'from-yellow-400/60 to-yellow-400'
    : atMax
    ? 'from-pink to-pink/80'
    : 'from-green to-gold';

  const status = belowMin
    ? `Below minimum — need ${fmt(min - safe, 2)} more net loss to qualify`
    : atMax
    ? 'Maxed out — only 2000 USDT counts toward daily cashback'
    : 'In qualifying range';

  const statusColor = belowMin ? 'text-yellow-400' : atMax ? 'text-pink' : 'text-green';

  return (
    <div className="card-glass rounded-2xl p-5 mb-6 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-orbitron text-white text-[0.7rem] font-bold">NET LOSS RANGE</div>
          <div className={`text-[0.68rem] font-orbitron mt-0.5 ${statusColor}`}>{status}</div>
        </div>
        <div className="text-right">
          <div className="text-[0.6rem] text-white/30 font-orbitron">CURRENT</div>
          <div className="font-orbitron text-[1.1rem] font-bold text-white">{fmt(safe, 2)} <span className="text-[0.65rem] text-white/30">USDT</span></div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
        {/* Min threshold marker (visual line) */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-yellow-400/40 z-10"
          style={{ left: `${minPct}%` }}
        />
        {/* Filled portion */}
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
        {/* Current position marker */}
        {safe > 0 && (
          <div
            className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20"
            style={{ left: `${Math.min(100, pct)}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>

      {/* Labels under bar */}
      <div className="flex items-center justify-between mt-2 text-[0.65rem] font-orbitron">
        <div>
          <div className="text-white/30">0</div>
        </div>
        <div className="text-yellow-400" style={{ marginLeft: `${minPct - 5}%` }}>
          MIN<br />{fmt(min, 0)}
        </div>
        <div className="text-pink text-right">
          MAX<br />{fmt(max, 0)}
        </div>
      </div>

      {inRange && (
        <div className="mt-3 p-2 rounded-lg bg-green/5 border border-green/20 text-[0.68rem] text-white/50">
          ✅ You qualify for daily cashback on <span className="text-green font-orbitron">{fmt(safe, 2)} USDT</span> × rate
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix = '', color = 'white', highlight = false, unit = 'USDT', footer = null }) {
  const colorClass = {
    green: 'text-green',
    cyan: 'text-cyan',
    gold: 'text-gold',
    purple: 'text-purple',
    pink: 'text-pink',
    white: 'text-white',
  }[color];

  // value can be a number, numeric string, or already-formatted string. fmt() handles all.
  const display = typeof value === 'string' && value.includes('.') ? value : fmt(value);

  return (
    <div
      className={`card-glass rounded-2xl p-5 ${
        highlight ? 'border border-green/30' : 'border border-white/10'
      }`}
    >
      <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">
        {label}
      </div>
      <div className={`font-orbitron ${colorClass} text-[1.6rem] font-bold`}>
        {display}
        {suffix}
      </div>
      <div className="text-[0.68rem] text-white/30 mt-1">{unit}</div>
      {footer && (
        <div className="text-[0.6rem] text-white font-orbitron mt-2 px-2 py-1 rounded bg-white/10 border border-white/20">
          ⚠️ {footer}
        </div>
      )}
    </div>
  );
}

function BreakdownRow({ label, value, sign = '', color = 'white', bold = false }) {
  const colorClass = {
    green: 'text-green',
    cyan: 'text-cyan',
    gold: 'text-gold',
    pink: 'text-pink',
    white: 'text-white/80',
  }[color];

  return (
    <div className="flex items-center justify-between">
      <span className={`text-white/60 ${bold ? 'font-orbitron text-[0.78rem] text-white/90' : ''}`}>
        {label}
      </span>
      <span className={`font-orbitron ${colorClass} ${bold ? 'text-[0.85rem] font-bold' : ''}`}>
        {sign}
        {fmt(value)} USDT
      </span>
    </div>
  );
}
