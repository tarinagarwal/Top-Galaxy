import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';

const STREAM_META = [
  { key: 'WINNINGS',         icon: '🚀', name: 'Winnings (8×)',     color: 'gold',   description: 'Direct game wins' },
  { key: 'DIRECT_REFERRAL',  icon: '⭐', name: 'Direct Referral',   color: 'cyan',   description: '15 levels on deposits' },
  { key: 'WINNERS_REFERRAL', icon: '🏅', name: 'Winners Referral',  color: 'pink',   description: 'Direct % of bet → 15 uplines' },
  { key: 'CASHBACK',         icon: '🛡️', name: 'Cashback',          color: 'green',  description: 'Daily net loss recovery' },
  { key: 'ROI_ON_ROI',       icon: '🔄', name: 'ROI on ROI',        color: 'purple', description: '50% of team cashback' },
  { key: 'CLUB_INCOME',      icon: '🏆', name: 'Club Income',       color: 'gold',   description: 'Daily turnover share' },
  { key: 'LUCKY_DRAW_WIN',   icon: '🎰', name: 'Lucky Draw',        color: 'blue',   description: 'Jackpot winnings' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [drawStatus, setDrawStatus] = useState(null);
  const [cashbackStatus, setCashbackStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  const updateUser = useAuthStore((s) => s.updateUser);

  const refresh = useCallback(async () => {
    try {
      const [d, draw, cb] = await Promise.all([
        api.get('/api/user/dashboard'),
        api.get('/api/luckydraw/status').catch(() => null),
        api.get('/api/cashback/status').catch(() => null),
      ]);
      setData(d.data);
      setDrawStatus(draw?.data || null);
      setCashbackStatus(cb?.data || null);
      if (d.data?.user) updateUser(d.data.user);
    } catch {}
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh on income events
  useSocket({
    'cashback:credited': () => refresh(),
    'roi:credited': () => refresh(),
    'club:credited': () => refresh(),
    'game:win': () => refresh(),
    'draw:winner': () => refresh(),
    'withdrawal:status': () => refresh(),
  });

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  if (loading) {
    return (
      <div>
        <StarfieldCanvas />
        <Navbar />
        <div className="relative z-10 min-h-screen pt-[120px] px-6 text-center text-white/40 font-orbitron text-[0.7rem]">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const u = data?.user || {};
  const w = data?.wallet || {};
  const streams = data?.incomeStreams || {};
  const team = data?.team || {};
  const txns = data?.recentTransactions || [];
  const totalWithdrawable = num(data?.totalWithdrawable);

  const shortAddress = u.walletAddress
    ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}`
    : '';

  const referralLink = u.referralCode
    ? `${window.location.origin}/register?ref=${u.referralCode}`
    : '';

  // Cashback health
  const effectiveNetLoss = num(cashbackStatus?.effectiveNetLoss);
  const dailyEstimate = num(cashbackStatus?.estimatedDailyAmount);
  const capLimit = num(cashbackStatus?.capLimit);
  const cashbackEarned = num(cashbackStatus?.cashbackTotalEarned);
  const capProgress = capLimit > 0 ? Math.min(100, (cashbackEarned / capLimit) * 100) : 0;

  // Lucky draw progress
  const golden = drawStatus?.golden;
  const silver = drawStatus?.silver;

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* ================================================================ */}
          {/* Welcome header                                                   */}
          {/* ================================================================ */}
          <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-2">
                Welcome Back
              </div>
              <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
                Dashboard
              </h1>
              <div className="font-orbitron text-[0.7rem] text-white/40 mt-1 break-all">
                {shortAddress}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Activation tier badge */}
              {u.fullActivated ? (
                <span className="px-4 py-2 rounded-full bg-green/10 border border-green/40 text-green font-orbitron text-[0.65rem] tracking-[0.15em]">
                  🌟 PRO ACTIVATED
                </span>
              ) : u.realCashActivated ? (
                <span className="px-4 py-2 rounded-full bg-cyan/10 border border-cyan/40 text-cyan font-orbitron text-[0.65rem] tracking-[0.15em]">
                  🔓 BASIC ACTIVATED
                </span>
              ) : (
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/30 font-orbitron text-[0.65rem] tracking-[0.15em]">
                  ⚪ NOT ACTIVATED
                </span>
              )}
              {u.rank > 0 && (
                <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.68rem] tracking-[0.15em]">
                  🏆 RANK {u.rank}
                </span>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* Total balance summary + Quick actions                            */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Total withdrawable */}
            <div className="lg:col-span-1 card-glass rounded-2xl p-6 border border-green/30">
              <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-2">
                💰 TOTAL WITHDRAWABLE BALANCE
              </div>
              <div className="font-orbitron text-green text-[2.4rem] font-bold leading-none">
                {fmt(totalWithdrawable)}
              </div>
              <div className="text-[0.68rem] text-white/30 mt-1 font-orbitron">USDT</div>
              <Link
                to="/wallet"
                className="mt-4 inline-block px-4 py-2 rounded-lg bg-green/10 border border-green/30 text-green font-orbitron text-[0.6rem] hover:bg-green/20"
              >
                💸 GO TO WALLET →
              </Link>
            </div>

            {/* Quick actions */}
            <div className="lg:col-span-2 card-glass rounded-2xl p-6 border border-white/10">
              <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-3">
                ⚡ QUICK ACTIONS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <ActionButton to="/game" icon="🎯" label="PLAY GAME" color="gold" />
                <ActionButton to="/practice" icon="🎮" label="PRACTICE" color="cyan" />
                <ActionButton to="/wallet" icon="💵" label="DEPOSIT" color="green" />
                <ActionButton to="/wallet" icon="💸" label="WITHDRAW" color="pink" />
                <ActionButton
                  onClick={() => copy(referralLink, 'quick-link')}
                  icon={copied === 'quick-link' ? '✓' : '🔗'}
                  label={copied === 'quick-link' ? 'COPIED!' : 'SHARE'}
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 7 Income stream cards                                            */}
          {/* ================================================================ */}
          <div className="mb-6">
            <div className="font-orbitron text-cyan text-[0.7rem] tracking-[0.2em] mb-3 flex items-center gap-2">
              💎 INCOME STREAMS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {STREAM_META.map((s) => {
                const stream = streams[s.key] || { lifetime: 0, today: 0 };
                return <StreamCard key={s.key} meta={s} stream={stream} />;
              })}
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3-column row: Cashback / Referral / Lucky Draw                   */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Cashback health */}
            <div className="card-glass rounded-2xl p-5 border border-green/20">
              <div className="font-orbitron text-green text-[0.65rem] font-bold mb-3 flex items-center gap-2">
                🛡️ CASHBACK HEALTH
              </div>
              <div className="space-y-2 text-[0.65rem]">
                <Row label="Effective Net Loss" value={fmt(effectiveNetLoss)} color="cyan" />
                <Row label="Daily Estimate" value={fmt(dailyEstimate)} color="green" />
                <Row label="Cap Multiplier" value={`${num(cashbackStatus?.capMultiplier) || 1}×`} color="gold" />
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[0.68rem] font-orbitron mb-1">
                  <span className="text-white/40">CAP USED</span>
                  <span className="text-gold">{fmt(capProgress, 1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      capProgress >= 100 ? 'bg-pink' : 'bg-gradient-to-r from-green to-cyan'
                    }`}
                    style={{ width: `${capProgress}%` }}
                  />
                </div>
              </div>
              <Link
                to="/cashback"
                className="mt-3 block text-center text-[0.68rem] text-green font-orbitron hover:text-cyan"
              >
                VIEW CASHBACK →
              </Link>
            </div>

            {/* Referral stats */}
            <div className="card-glass rounded-2xl p-5 border border-cyan/20">
              <div className="font-orbitron text-cyan text-[0.65rem] font-bold mb-3 flex items-center gap-2">
                ⭐ REFERRAL TEAM
              </div>
              <div className="space-y-2 text-[0.65rem]">
                <Row label="Direct Referrals" value={num(team.directCount)} color="gold" />
                <Row label="Total Team Size" value={num(team.totalCount)} color="cyan" />
                <Row label="Active Today" value={num(team.activeMembersToday)} color="green" />
                <Row label="Team Volume" value={`${fmt(team.totalVolume)} USDT`} color="purple" />
              </div>
              {u.referralCode && (
                <div className="mt-3">
                  <div className="text-[0.65rem] text-white/30 font-orbitron mb-1">YOUR CODE</div>
                  <div className="flex gap-1">
                    <code className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-cyan font-orbitron text-[0.65rem]">
                      {u.referralCode}
                    </code>
                    <button
                      onClick={() => copy(u.referralCode, 'code')}
                      className="px-2 py-1 rounded bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.65rem] hover:bg-cyan/20"
                    >
                      {copied === 'code' ? '✓' : 'COPY'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lucky draw progress */}
            <div className="card-glass rounded-2xl p-5 border border-gold/20">
              <div className="font-orbitron text-gold text-[0.65rem] font-bold mb-3 flex items-center gap-2">
                🎰 LUCKY DRAW
              </div>
              <DrawProgress draw={golden} type="GOLDEN" icon="🏆" color="gold" />
              <div className="mt-3" />
              <DrawProgress draw={silver} type="SILVER" icon="🥈" color="silver" />
              <Link
                to="/lucky-draw"
                className="mt-3 block text-center text-[0.68rem] text-gold font-orbitron hover:text-cyan"
              >
                BUY TICKETS →
              </Link>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Recent transactions                                              */}
          {/* ================================================================ */}
          <div className="card-glass rounded-2xl p-5 border border-white/10">
            <div className="font-orbitron text-purple text-[0.7rem] font-bold mb-3 flex items-center gap-2">
              📜 RECENT TRANSACTIONS
            </div>
            {txns.length === 0 ? (
              <div className="text-[0.65rem] text-white/30 text-center py-6">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {txns.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5 text-[0.65rem]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-orbitron text-white/70">{t.type}</div>
                      <div className="text-[0.68rem] text-white/30">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-orbitron text-gold">{fmt(t.amount)} USDT</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StreamCard({ meta, stream }) {
  const colorClass = {
    gold: 'border-gold/30 text-gold',
    cyan: 'border-cyan/30 text-cyan',
    pink: 'border-pink/30 text-pink',
    green: 'border-green/30 text-green',
    purple: 'border-purple/30 text-purple',
    blue: 'border-blue/30 text-blue',
  }[meta.color];

  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass.split(' ')[0]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[1.4rem]">{meta.icon}</span>
        {num(stream.today) > 0 && (
          <span className={`text-[0.65rem] font-orbitron px-1.5 py-0.5 rounded-full bg-green/10 border border-green/30 text-green`}>
            +{fmt(stream.today)} today
          </span>
        )}
      </div>
      <div className={`font-orbitron text-[0.6rem] font-bold tracking-[0.05em] ${colorClass.split(' ')[1]}`}>
        {meta.name}
      </div>
      <div className="text-[0.65rem] text-white/30 mb-2">{meta.description}</div>
      <div className="font-orbitron text-white text-[1.1rem] font-bold">
        {fmt(stream.lifetime)}
      </div>
      <div className="text-[0.65rem] text-white/30 font-orbitron">USDT lifetime</div>
    </div>
  );
}

function Row({ label, value, color }) {
  const colorClass = {
    gold: 'text-gold',
    cyan: 'text-cyan',
    green: 'text-green',
    purple: 'text-purple',
    pink: 'text-pink',
  }[color];
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={`font-orbitron ${colorClass}`}>{value}</span>
    </div>
  );
}

function DrawProgress({ draw, type, icon, color }) {
  if (!draw) {
    return (
      <div className="text-[0.6rem] text-white/30">
        {icon} {type}: no active draw
      </div>
    );
  }
  const pct = num(draw.progressPercent);
  const colorClass = {
    gold: 'from-gold to-gold2',
    silver: 'from-silver to-silver2',
  }[color];
  const textColor = { gold: 'text-gold', silver: 'text-silver' }[color];

  return (
    <div>
      <div className="flex items-center justify-between text-[0.68rem] font-orbitron mb-1">
        <span className={textColor}>
          {icon} {type}
        </span>
        <span className="text-white/40">
          {draw.ticketsSold} / {draw.totalTickets}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({ to, onClick, icon, label, color }) {
  const colorClass = {
    gold: 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20',
    cyan: 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20',
    green: 'bg-green/10 border-green/30 text-green hover:bg-green/20',
    pink: 'bg-pink/10 border-pink/30 text-pink hover:bg-pink/20',
    purple: 'bg-purple/10 border-purple/30 text-purple hover:bg-purple/20',
  }[color];

  const inner = (
    <div className={`p-3 rounded-xl border text-center ${colorClass} transition-all`}>
      <div className="text-[1.5rem]">{icon}</div>
      <div className="font-orbitron text-[0.65rem] tracking-[0.1em] mt-1">{label}</div>
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full">{inner}</button>;
  }
  return <Link to={to}>{inner}</Link>;
}
