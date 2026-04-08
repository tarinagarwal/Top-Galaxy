import SectionHeader from '../SectionHeader';

/* ─── tiny helpers ─── */
const Chip = ({ children, color = 'cyan' }) => {
  const map = {
    cyan: 'border-cyan/30 text-cyan bg-cyan/5',
    green: 'border-green/30 text-green bg-green/5',
    gold: 'border-gold/30 text-gold bg-gold/5',
  };
  return (
    <span className={`inline-block text-[0.6rem] font-orbitron tracking-widest uppercase px-2.5 py-[3px] rounded-full border ${map[color]}`}>
      {children}
    </span>
  );
};

const StepDot = ({ n, label }) => (
  <div className="flex flex-col items-center gap-2 text-center min-w-[110px]">
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-orbitron text-xs font-bold text-deep"
      style={{ background: 'linear-gradient(135deg,#00FF88,#00FFFF)' }}
    >
      {n}
    </div>
    <span className="text-[0.7rem] text-white/60 leading-tight max-w-[120px]">{label}</span>
  </div>
);

/* ─── Bridge Account Card ─── */
const AccountCard = ({ icon, title, chips, color }) => {
  const border = color === 'cyan' ? 'border-cyan/20' : 'border-green/20';
  const glow = color === 'cyan' ? 'shadow-[0_0_30px_rgba(0,255,255,0.08)]' : 'shadow-[0_0_30px_rgba(0,255,136,0.08)]';
  const iconBg = color === 'cyan'
    ? 'bg-[rgba(0,255,255,0.08)] border-cyan/20'
    : 'bg-[rgba(0,255,136,0.08)] border-green/20';

  return (
    <div className={`card-glass rounded-2xl p-6 flex flex-col items-center gap-4 flex-1 min-w-[200px] border ${border} ${glow}`}>
      <div className={`w-16 h-16 rounded-xl border flex items-center justify-center text-3xl ${iconBg}`}>
        {icon}
      </div>
      <h4 className="font-russo text-sm tracking-wide text-white/90">{title}</h4>
      <div className="flex flex-wrap justify-center gap-2">
        {chips.map((c, i) => (
          <Chip key={i} color={color}>{c}</Chip>
        ))}
      </div>
    </div>
  );
};

/* ─── Transfer Rule Pill ─── */
const RulePill = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-purple/5 border border-purple/15 min-w-[120px]">
    <span className="font-orbitron text-sm font-bold text-purple">{value}</span>
    <span className="text-[0.6rem] uppercase tracking-widest text-white/40">{label}</span>
  </div>
);

/* ─── Tier Feature ─── */
const TierFeature = ({ text, active = true }) => (
  <li className={`flex items-start gap-2 text-[0.78rem] leading-relaxed ${active ? 'text-white/70' : 'text-white/25 line-through'}`}>
    <span className="mt-0.5">{active ? '✅' : '❌'}</span>
    {text}
  </li>
);

/* ════════════════════════════════════════════════════════════
   CONVERSION SECTION
   ════════════════════════════════════════════════════════════ */
export default function ConversionSection() {
  return (
    <section id="conv" className="relative py-10 overflow-hidden">
      {/* faint radial backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(0,255,136,0.04) 0%, transparent 70%)' }}
      />

      <SectionHeader
        eyebrow="🌉 THE GALAXY BRIDGE"
        eyebrowColor="green"
        title={<span className="text-gradient-green">Practice → Real Cash Auto-Conversion</span>}
        description="Activate PRO and your practice balance starts draining into your real game wallet automatically — every time you earn a Direct Referral commission, 50% is converted into real cash. No buttons, no waiting."
      />

      {/* ───── BRIDGE VISUAL ───── */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="card-glass rounded-3xl p-6 sm:p-10 border border-green/10">
          {/* accounts + arrow */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4 mb-10">
            <AccountCard
              icon="🎮"
              title="Practice Account"
              chips={['Non-Withdrawable', 'Auto-Convertible (PRO)']}
              color="cyan"
            />

            {/* bridge arrow */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 border-gold/40 cursor-pointer hover:scale-110 transition-transform"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.25), rgba(255,165,0,0.10))',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                  boxShadow: '0 0 24px rgba(255,215,0,0.25)',
                }}
              >
                ⚡
              </div>
              <span className="text-[0.55rem] font-orbitron tracking-[0.2em] text-gold/60 uppercase">Bridge</span>
            </div>

            <AccountCard
              icon="💰"
              title="Real Cash Account"
              chips={['Fully Withdrawable', 'Real USDT', 'All Incomes']}
              color="green"
            />
          </div>

          {/* how it works steps */}
          <div className="border-t border-white/5 pt-8">
            <h5 className="text-center text-[0.65rem] font-orbitron tracking-[0.25em] uppercase text-white/30 mb-6">
              How Auto-Conversion Works
            </h5>
            <div className="flex flex-wrap justify-center gap-6">
              <StepDot n={1} label="Deposit 100+ USDT → Activate PRO" />
              <StepDot n={2} label="Refer Friends, Build Team" />
              <StepDot n={3} label="Earn Stream 2 Commissions" />
              <StepDot n={4} label="50% Auto-Drains Practice → Real Cash" />
            </div>
          </div>
        </div>
      </div>

      {/* ───── TRANSFER RULES ───── */}
      <div className="max-w-3xl mx-auto px-4 mb-14">
        <div className="card-glass rounded-2xl p-6 border border-purple/15 text-center">
          <h5 className="font-russo text-sm text-purple mb-5 tracking-wide">Conversion Rules</h5>
          <div className="flex flex-wrap justify-center gap-3">
            <RulePill value="50%" label="OF STREAM 2" />
            <RulePill value="AUTO" label="NO BUTTON" />
            <RulePill value="2" label="BUCKETS" />
            <RulePill value="PRO" label="REQUIRED" />
          </div>
          <p className="text-[0.65rem] text-white/40 mt-5 max-w-[500px] mx-auto leading-relaxed">
            Every Direct Referral commission (Stream 2) you earn triggers a 50% transfer from your <span className="text-cyan">Practice Balance</span> into your <span className="text-gold">Game Wallet</span> — and a matching 50% from your <span className="text-purple">Frozen Referral Rewards</span> into your <span className="text-gold">Referral Wallet</span>. If a bucket is empty, that side is skipped.
          </p>
        </div>
      </div>

      {/* ───── ACTIVATION TIERS ───── */}
      <div className="max-w-5xl mx-auto px-4">
        <h4 className="text-center font-russo text-lg text-white/80 mb-8 tracking-wide">Activation Tiers</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BASIC */}
          <div className="card-glass rounded-2xl p-7 border border-cyan/15 relative overflow-hidden">
            <div className="shimmer-overlay" />
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-russo text-xl text-cyan">BASIC</span>
              <span className="font-orbitron text-xs text-white/40">10 USDT</span>
            </div>
            <div className="h-[2px] w-16 bg-cyan/30 mb-5 rounded" />
            <ul className="space-y-2.5">
              <TierFeature text="Cash Game" />
              <TierFeature text="Winners Income" />
              <TierFeature text="Direct Referral L1-3" />
              <TierFeature text="Winners Level" />
              <TierFeature text="Practice Secured" />
              <TierFeature text="Cashback / Conversion" active={false} />
            </ul>
          </div>

          {/* PRO */}
          <div className="card-glass rounded-2xl p-7 border border-green/20 relative overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.07)]">
            <div className="shimmer-overlay" />
            {/* badge */}
            <div
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-[0.55rem] font-orbitron tracking-[0.15em] uppercase border border-gold/30"
              style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,165,0,0.08))' }}
            >
              <span className="text-gold">🌟 FULL POWER</span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-russo text-xl text-green">PRO</span>
              <span className="font-orbitron text-xs text-white/40">100 USDT</span>
            </div>
            <div className="h-[2px] w-16 bg-green/30 mb-5 rounded" />
            <ul className="space-y-2.5">
              <TierFeature text="All 3 Active Streams" />
              <TierFeature text="Full Cash Game — All Digits" />
              <TierFeature text="Practice Auto-Converts via Stream 2" />
              <TierFeature text="All Winnings Withdrawable" />
              <TierFeature text="Cashback Protection" />
              <TierFeature text="ROI on ROI" />
              <TierFeature text="Lucky Draw Auto-Fund" />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
