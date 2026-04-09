import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';

const TIER_STYLES = {
  pro: { label: 'PRO', color: 'bg-green/10 border-green/40 text-green' },
  basic: { label: 'BASIC', color: 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' },
  practice: { label: 'PRACTICE', color: 'bg-white/5 border-white/20 text-white/50' },
  expired: { label: 'EXPIRED', color: 'bg-pink/10 border-pink/40 text-pink' },
};

export default function Referrals() {
  const [stats, setStats] = useState(null);
  const [levels, setLevels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        api.get('/api/user/referrals/stats'),
        api.get('/api/user/referrals/levels'),
      ]);
      setStats(s.data);
      setLevels(l.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const referralLink = stats?.referralCode
    ? `${window.location.origin}/register?ref=${stats.referralCode}`
    : '';

  const shareOnX = () => {
    const text = `Join me on Top Galaxy — the cosmic BSC gaming ecosystem with 7 income streams. Use my code:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-2">
              ⭐ CONSTELLATION NETWORK
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
              Referrals
            </h1>
            <p className="text-white/40 text-[0.75rem] mt-1">
              Your 15-level referral network and team performance
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">
              Loading referral data...
            </div>
          ) : (
            <>
              {/* Referral link / code card */}
              <div className="card-glass rounded-2xl p-6 mb-6 border border-gold/30">
                <div className="font-orbitron text-gold text-[0.7rem] font-bold mb-4 flex items-center gap-2">
                  🔗 YOUR REFERRAL LINK
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.1em] mb-1">
                      REFERRAL CODE
                    </div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-cyan font-orbitron text-[1rem] font-bold text-center">
                        {stats?.referralCode || '—'}
                      </code>
                      <button
                        onClick={() => copy(stats?.referralCode, 'code')}
                        className="px-4 py-3 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.6rem] hover:bg-cyan/20"
                      >
                        {copied === 'code' ? '✓' : 'COPY'}
                      </button>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.1em] mb-1">
                      REFERRAL LINK
                    </div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-cyan font-orbitron text-[0.55rem] truncate">
                        {referralLink}
                      </code>
                      <button
                        onClick={() => copy(referralLink, 'link')}
                        className="px-4 py-3 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.6rem] hover:bg-cyan/20"
                      >
                        {copied === 'link' ? '✓' : 'COPY'}
                      </button>
                      <button
                        onClick={shareOnX}
                        className="px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 font-orbitron text-[0.6rem] hover:border-gold/30 hover:text-gold"
                        title="Share on X"
                      >
                        𝕏
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                  label="DIRECT REFERRALS"
                  value={num(stats?.directReferralCount)}
                  color="gold"
                  type="count"
                />
                <StatCard
                  label="TOTAL TEAM"
                  value={num(stats?.totalTeamCount)}
                  color="cyan"
                  type="count"
                />
                <StatCard
                  label="ACTIVE (7d)"
                  value={num(stats?.activeLast7Days)}
                  color="green"
                  type="count"
                />
                <StatCard
                  label="TEAM VOLUME"
                  value={num(stats?.totalTeamVolume)}
                  color="purple"
                />
              </div>

              {/* Commission cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CommissionCard
                  icon="⭐"
                  title="STREAM 2 — DIRECT REFERRAL"
                  description="Commissions on all downline deposits. L1=5%, L2=2%, L3-5=1%, L6-15=0.5%."
                  lifetime={stats?.directReferralIncome?.lifetime}
                  today={stats?.directReferralIncome?.today}
                  color="cyan"
                />
                <CommissionCard
                  icon="🏅"
                  title="STREAM 3 — WINNERS REFERRAL"
                  description="Direct percentages on downline bet amount. L1=5%, L2=2%, L3-5=1%, L6-15=0.5% = 15% total across 15 uplines."
                  lifetime={stats?.winnersReferralIncome?.lifetime}
                  today={stats?.winnersReferralIncome?.today}
                  color="pink"
                />
              </div>

              {/* Level Breakdown */}
              {levels && (
                <div className="card-glass rounded-2xl p-6 mb-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-orbitron text-white text-[0.85rem] font-bold flex items-center gap-2">
                        📊 Level Breakdown
                      </div>
                      <div className="text-[0.6rem] text-white/40 mt-1">
                        Consolidated view of your network capacity and earnings.
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl border border-gold/30 bg-gold/10">
                      <span className="font-orbitron text-gold text-[0.7rem] font-bold">
                        {levels.activeLevels} Active Levels
                      </span>
                    </div>
                  </div>

                  {/* Header row — desktop */}
                  <div className="hidden md:grid grid-cols-[1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-2 mb-2 px-3">
                    <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em]">TIER</div>
                    <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em]">TOTAL TEAM</div>
                    <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em]">PRACTICE BONUS</div>
                    <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em] text-center">DIRECT REFERRAL</div>
                    <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em] text-center">WINNER REFERRAL</div>
                  </div>

                  <div className="space-y-2">
                    {levels.levels.map((lv) => {
                      const commPct = lv.level === 1 ? '5%' : lv.level === 2 ? '2%' : lv.level <= 5 ? '1%' : '0.5%';
                      return (
                        <div key={lv.level} className="rounded-xl bg-white/3 border border-white/5 p-3">
                          {/* Desktop layout */}
                          <div className="hidden md:grid grid-cols-[1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-2 items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-orbitron text-[0.6rem] font-bold ${
                                lv.unlocked
                                  ? 'bg-green/10 border border-green/30 text-green'
                                  : 'bg-pink/10 border border-pink/30 text-pink'
                              }`}>
                                L{lv.level}
                              </div>
                              <div>
                                <div className="font-orbitron text-white/80 text-[0.65rem]">LEVEL {lv.level}</div>
                                {lv.unlocked ? (
                                  <div className="text-[0.45rem] text-green font-orbitron">UNLOCKED · {commPct}</div>
                                ) : (
                                  <div className="text-[0.45rem] text-pink font-orbitron">
                                    {lv.lockType} LOCKED — DEPOSIT {lv.lockType === 'BASIC' ? '10' : '100'} USDT
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="font-orbitron text-white text-[0.85rem] font-bold">{lv.teamCount}</span>
                              <span className="text-[0.5rem] text-white/30 font-orbitron ml-1">users</span>
                            </div>
                            <div>
                              <span className="font-orbitron text-white/60 text-[0.75rem]">{fmt(lv.practiceBonus, 3)}</span>
                              <span className="text-[0.5rem] text-white/30 font-orbitron ml-1">USDT</span>
                            </div>
                            <div className="text-center">
                              <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-orbitron text-cyan text-[0.7rem]">
                                +{fmt(lv.directReferral, 3)} <span className="text-[0.45rem] text-white/30">USDT</span>
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-orbitron text-pink text-[0.7rem]">
                                +{fmt(lv.winnersReferral, 3)} <span className="text-[0.45rem] text-white/30">USDT</span>
                              </span>
                            </div>
                          </div>

                          {/* Mobile layout */}
                          <div className="md:hidden">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-orbitron text-[0.6rem] font-bold ${
                                lv.unlocked
                                  ? 'bg-green/10 border border-green/30 text-green'
                                  : 'bg-pink/10 border border-pink/30 text-pink'
                              }`}>
                                L{lv.level}
                              </div>
                              <div className="flex-1">
                                <div className="font-orbitron text-white/80 text-[0.65rem]">LEVEL {lv.level}</div>
                                {lv.unlocked ? (
                                  <div className="text-[0.45rem] text-green font-orbitron">UNLOCKED · {commPct}</div>
                                ) : (
                                  <div className="text-[0.45rem] text-pink font-orbitron">
                                    {lv.lockType} LOCKED — DEPOSIT {lv.lockType === 'BASIC' ? '10' : '100'} USDT
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-orbitron text-white text-[0.85rem] font-bold">{lv.teamCount}</span>
                                <span className="text-[0.45rem] text-white/30 ml-1">users</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 text-center py-1 rounded-lg bg-white/3 border border-white/5">
                                <div className="text-[0.4rem] text-white/30 font-orbitron">PRACTICE</div>
                                <div className="font-orbitron text-white/60 text-[0.6rem]">{fmt(lv.practiceBonus, 3)}</div>
                              </div>
                              <div className="flex-1 text-center py-1 rounded-lg bg-white/3 border border-white/5">
                                <div className="text-[0.4rem] text-white/30 font-orbitron">DIRECT REF</div>
                                <div className="font-orbitron text-cyan text-[0.6rem]">+{fmt(lv.directReferral, 3)}</div>
                              </div>
                              <div className="flex-1 text-center py-1 rounded-lg bg-white/3 border border-white/5">
                                <div className="text-[0.4rem] text-white/30 font-orbitron">WINNER REF</div>
                                <div className="font-orbitron text-pink text-[0.6rem]">+{fmt(lv.winnersReferral, 3)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive tree */}
              <div className="card-glass rounded-2xl p-6 border border-purple/20">
                <div className="font-orbitron text-purple text-[0.7rem] font-bold mb-1 flex items-center gap-2">
                  🌳 REFERRAL TREE
                </div>
                <div className="text-[0.6rem] text-white/40 mb-4">
                  Click any node to expand its direct referrals. Tree is lazy-loaded — only fetched when you expand.
                </div>
                <TreeRoot me={stats} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TreeRoot — starts with "me" as root, expands to directs
// ============================================================================
function TreeRoot({ me }) {
  if (!me) return null;
  const shortAddr = me.walletAddress
    ? `${me.walletAddress.slice(0, 6)}...${me.walletAddress.slice(-4)}`
    : '—';

  return (
    <div className="pl-2">
      {/* Root: You */}
      <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-gold/10 border-2 border-gold/40 mb-3">
        <span className="text-[1.4rem]">👤</span>
        <div>
          <div className="font-orbitron text-gold text-[0.7rem] font-bold">YOU</div>
          <div className="text-[0.55rem] text-white/50 font-orbitron">{shortAddr}</div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">
            {me.directReferralCount} directs · {me.totalTeamCount} total team
          </div>
        </div>
      </div>

      {me.directReferralCount > 0 ? (
        <TreeNodeChildren parentId={null} depth={1} />
      ) : (
        <div className="pl-10 text-[0.65rem] text-white/30 font-orbitron italic">
          No direct referrals yet — share your link above to invite friends!
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TreeNodeChildren — lazy-loads direct referrals of a given parent
// When parentId is null, fetches the current user's directs.
// ============================================================================
function TreeNodeChildren({ parentId, depth }) {
  const [directs, setDirects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = {};
    if (parentId) params.userId = parentId;
    api
      .get('/api/user/referrals/directs', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setDirects(data.directs || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.error || 'Failed to load');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [parentId]);

  if (loading) {
    return (
      <div className="pl-6 text-[0.6rem] text-white/30 font-orbitron">Loading level {depth}...</div>
    );
  }
  if (error) {
    return <div className="pl-6 text-[0.6rem] text-pink font-orbitron">⚠️ {error}</div>;
  }
  if (!directs || directs.length === 0) {
    return (
      <div className="pl-6 text-[0.6rem] text-white/30 font-orbitron italic">No directs</div>
    );
  }

  return (
    <div className="pl-6 border-l-2 border-white/10 ml-4 space-y-2">
      {directs.map((d) => (
        <TreeNode key={d._id} user={d} depth={depth} />
      ))}
    </div>
  );
}

// ============================================================================
// TreeNode — one user card with expand toggle
// ============================================================================
function TreeNode({ user, depth }) {
  const [expanded, setExpanded] = useState(false);
  const tierStyle = TIER_STYLES[user.tier] || TIER_STYLES.practice;
  const shortAddr = user.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '—';

  const canExpand = user.directReferralCount > 0;
  const MAX_DEPTH = 15;

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-white/3 border border-white/10 transition-all ${
          canExpand ? 'cursor-pointer hover:border-gold/30' : ''
        }`}
        onClick={() => canExpand && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {canExpand ? (
            <span className="text-cyan text-[0.75rem] font-orbitron w-4 text-center">
              {expanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="text-white/20 text-[0.55rem] w-4 text-center">·</span>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-orbitron text-white/80 text-[0.65rem]">{shortAddr}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron border ${tierStyle.color}`}
              >
                {tierStyle.label}
              </span>
              {user.rank > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-orbitron bg-gold/10 border border-gold/30 text-gold">
                  R{user.rank}
                </span>
              )}
            </div>
            <div className="text-[0.5rem] text-white/30 font-orbitron mt-0.5">
              {user.referralCode} · {user.directReferralCount} directs · L{depth}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-orbitron text-gold text-[0.65rem]">
            {fmt(user.totalBusinessVolume)}
          </div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">team vol</div>
          <div className="font-orbitron text-green text-[0.55rem] mt-0.5">
            +{fmt(user.commissionGenerated, 4)}
          </div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">my commission</div>
        </div>
      </div>

      {expanded && depth < MAX_DEPTH && (
        <TreeNodeChildren parentId={user._id} depth={depth + 1} />
      )}
      {expanded && depth >= MAX_DEPTH && (
        <div className="pl-6 text-[0.55rem] text-white/30 font-orbitron italic mt-1">
          Max depth (L{MAX_DEPTH}) reached
        </div>
      )}
    </div>
  );
}

// ============================================================================
// StatCard
// ============================================================================
function StatCard({ label, value, color, type = 'usdt' }) {
  const colorClass = {
    gold: 'text-gold border-gold/20',
    cyan: 'text-cyan border-cyan/20',
    green: 'text-green border-green/20',
    purple: 'text-purple border-purple/20',
  }[color];

  const display = type === 'count' ? num(value) : fmt(value);

  return (
    <div className={`card-glass rounded-2xl p-4 border ${colorClass.split(' ')[1]}`}>
      <div className="text-[0.5rem] text-white/30 font-orbitron tracking-[0.15em] mb-1">
        {label}
      </div>
      <div className={`font-orbitron font-bold text-[1.4rem] ${colorClass.split(' ')[0]}`}>
        {display}
      </div>
      {type !== 'count' && <div className="text-[0.5rem] text-white/30 font-orbitron">USDT</div>}
    </div>
  );
}

// ============================================================================
// CommissionCard
// ============================================================================
function CommissionCard({ icon, title, description, lifetime, today, color }) {
  const colorClass = {
    cyan: 'border-cyan/30 text-cyan',
    pink: 'border-pink/30 text-pink',
  }[color];

  return (
    <div className={`card-glass rounded-2xl p-5 border ${colorClass.split(' ')[0]}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[1.8rem]">{icon}</span>
        <div className="flex-1">
          <div className={`font-orbitron text-[0.65rem] font-bold ${colorClass.split(' ')[1]}`}>
            {title}
          </div>
          <div className="text-[0.55rem] text-white/40 mt-1 leading-relaxed">{description}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-white/3 border border-white/5 text-center">
          <div className="text-[0.5rem] text-white/30 font-orbitron">LIFETIME</div>
          <div className={`font-orbitron text-[1rem] font-bold ${colorClass.split(' ')[1]}`}>
            {fmt(lifetime)}
          </div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">USDT</div>
        </div>
        <div className="p-2 rounded-lg bg-green/5 border border-green/20 text-center">
          <div className="text-[0.5rem] text-white/30 font-orbitron">TODAY</div>
          <div className="font-orbitron text-green text-[1rem] font-bold">{fmt(today)}</div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">USDT</div>
        </div>
      </div>
    </div>
  );
}
