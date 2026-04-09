import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';
import { useSocket } from '../hooks/useSocket';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function PracticeGame() {
  const [status, setStatus] = useState(null);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, message }
  const [conversionToast, setConversionToast] = useState(null); // live toast on auto-conversion

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/practice/status');
      setStatus(data);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to auto-conversion live events
  useSocket({
    'practice:converted': (data) => {
      setConversionToast({
        practiceTransfer: data.practiceTransfer,
        frozenTransfer: data.frozenTransfer,
        sourceCommission: data.sourceCommission,
      });
      refresh();
      // Auto-dismiss after 6 seconds
      setTimeout(() => setConversionToast(null), 6000);
    },
  });

  const handleEnter = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const value = parseFloat(amount);
    if (selectedDigit === null) {
      setFeedback({ type: 'error', message: 'Pick a digit (0–9)' });
      return;
    }
    if (!value || value <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/practice/enter-game', {
        digit: selectedDigit,
        amount: value,
      });
      setFeedback({
        type: 'success',
        message: `Entry placed: ${value} USDT on digit ${selectedDigit}. ${data.message || ''}`,
      });
      setAmount('');
      setSelectedDigit(null);
      await refresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || err?.message || 'Entry failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = status?.practiceExpired;
  const isActive = status?.practiceActivated && !isExpired;
  const isPro = !!status?.conversionEligible;

  // Auto-conversion progress: total converted / (total converted + remaining)
  // Frozen referral rewards are merged into the single "Practice Balance" display.
  const practiceRemaining = num(status?.practiceWallet) + num(status?.practiceReferralBalance);
  const lifetimeConverted = num(status?.lifetimeAutoConverted);
  const totalEverPractice = practiceRemaining + lifetimeConverted;
  const practiceProgress = totalEverPractice > 0 ? (lifetimeConverted / totalEverPractice) * 100 : 0;

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-2">
                🎮 PRACTICE MODE
              </div>
              <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
                Practice Game
              </h1>
              <p className="text-white/40 text-[0.75rem] mt-2 max-w-[500px]">
                Play with practice balance — no real money at risk. Build your strategy before going live.
              </p>
            </div>
            <div className="px-4 py-2 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.6rem] tracking-[0.15em]">
              {isExpired ? '❌ EXPIRED' : isActive ? '✅ ACTIVE' : '⚪ NOT ACTIVATED'}
            </div>
          </div>

          {/* Expiry warning banner */}
          {isExpired && (
            <div className="card-glass rounded-2xl p-5 mb-6 border border-pink/30 bg-pink/5">
              <div className="font-orbitron text-pink text-[0.85rem] mb-1">⚠️ PRACTICE ACCOUNT EXPIRED</div>
              <div className="text-white/50 text-[0.7rem]">
                Your 30-day practice window has ended without a real-cash deposit. All practice balances were burned and your downline was compressed.
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card-glass rounded-2xl p-6">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-1">PRACTICE BALANCE</div>
              <div className="font-orbitron text-cyan text-[1.8rem] font-bold">
                {fmt(status?.practiceWallet)}
              </div>
              <div className="text-[0.55rem] text-white/30 mt-1">USDT (non-withdrawable)</div>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-1">DAYS REMAINING</div>
              <div className="font-orbitron text-gold text-[1.8rem] font-bold">
                {status?.daysRemaining ?? '—'}
              </div>
              <div className="text-[0.55rem] text-white/30 mt-1">
                Expires {status?.practiceExpiry ? new Date(status.practiceExpiry).toLocaleDateString() : '—'}
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em] mb-1">WIN MULTIPLIER</div>
              <div className="font-orbitron text-green text-[1.8rem] font-bold">
                {status?.winMultiplier || 8}×
              </div>
              <div className="text-[0.55rem] text-white/30 mt-1">On every winning entry</div>
            </div>
          </div>

          {/* Live conversion toast (appears briefly after each auto-conversion) */}
          {conversionToast && (
            <div className="card-glass rounded-2xl p-4 mb-4 border-2 border-green/40 bg-green/5 animate-pulse">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-orbitron text-green text-[0.75rem] font-bold">
                    ⚡ AUTO-CONVERTED — Stream 2 Commission Earned
                  </div>
                  <div className="text-[0.6rem] text-white/60 mt-1">
                    Source commission: <span className="text-cyan font-orbitron">{fmt(conversionToast.sourceCommission)} USDT</span>
                  </div>
                </div>
                <div className="text-right text-[0.65rem] font-orbitron">
                  {conversionToast.practiceTransfer > 0 && (
                    <div className="text-gold">+{fmt(conversionToast.practiceTransfer)} → Game Wallet</div>
                  )}
                  {conversionToast.frozenTransfer > 0 && (
                    <div className="text-purple">+{fmt(conversionToast.frozenTransfer)} → Referral Wallet (from practice)</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-Conversion Status — main info card */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-gold/30">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="font-orbitron text-gold text-[0.85rem] font-bold">
                  🌉 PRACTICE → REAL CASH AUTO-CONVERSION
                </div>
                <div className="text-[0.65rem] text-white/50 mt-1 max-w-[600px] leading-relaxed">
                  50% of every <span className="text-cyan">Direct Referral Commission (Stream 2)</span> you earn automatically transfers from your practice balance into your game wallet and referral wallet.
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-[0.55rem] font-orbitron border whitespace-nowrap ${
                  isPro
                    ? 'bg-green/10 border-green/40 text-green'
                    : 'bg-white/5 border-white/20 text-white/40'
                }`}
              >
                {isPro ? '🟢 AUTO-CONVERSION ACTIVE' : '🔒 REQUIRES PRO'}
              </div>
            </div>

            {!isPro && (
              <div className="p-3 rounded-lg bg-pink/5 border border-pink/20 text-[0.65rem] text-pink mb-4">
                ⚠️ Auto-conversion only activates when you reach PRO tier. Deposit 100+ USDT total to unlock.
                <div className="text-white/40 mt-1 text-[0.55rem]">
                  Current: {fmt(status?.conversionRequirements?.totalDepositedCurrent)} / {fmt(status?.conversionRequirements?.proThreshold || 100)} USDT deposited
                </div>
              </div>
            )}

            {/* Two buckets side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Practice Balance bucket */}
              <div className="p-4 rounded-xl bg-white/3 border border-cyan/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-orbitron text-cyan text-[0.6rem] tracking-[0.1em]">
                    🎮 PRACTICE BALANCE
                  </div>
                  <div className="text-[0.5rem] text-white/30 font-orbitron">→ Game + Referral Wallet</div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <div className="text-[0.5rem] text-white/30 font-orbitron">REMAINING</div>
                    <div className="font-orbitron text-cyan text-[1.4rem] font-bold leading-none">
                      {fmt(practiceRemaining)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.5rem] text-white/30 font-orbitron">CONVERTED</div>
                    <div className="font-orbitron text-gold text-[0.95rem] font-bold leading-none">
                      {fmt(lifetimeConverted)}
                    </div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-gold transition-all"
                    style={{ width: `${practiceProgress}%` }}
                  />
                </div>
                <div className="text-[0.5rem] text-white/30 font-orbitron mt-1 text-right">
                  {fmt(practiceProgress, 1)}% converted
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[0.6rem] text-white/40 flex-wrap gap-2">
              <span>
                Total lifetime conversions: <span className="text-gold font-orbitron">{fmt(lifetimeConverted)} USDT</span> across <span className="text-cyan font-orbitron">{num(status?.autoConversionCount)}</span> events
              </span>
              <span className="text-[0.55rem] italic">
                Refer + deposit teammates to grow this 🚀
              </span>
            </div>
          </div>

          {/* Game entry form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-glass rounded-2xl p-6 border border-gold/20">
              <div className="font-orbitron text-gold text-[0.85rem] font-bold mb-4 flex items-center gap-2">
                🎯 PICK A DIGIT (0–9)
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {DIGITS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDigit(d)}
                    disabled={!isActive || submitting}
                    className={`aspect-square rounded-xl font-russo text-[2rem] transition-all ${
                      selectedDigit === d
                        ? 'bg-gradient-to-br from-gold to-gold2 text-black shadow-[0_0_30px_rgba(255,215,0,0.5)] scale-105'
                        : 'bg-white/3 border border-white/10 text-white hover:border-gold/40 hover:bg-white/5'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <form onSubmit={handleEnter} className="space-y-3">
                <div>
                  <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
                    BET AMOUNT (PRACTICE USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.00"
                    disabled={!isActive || submitting}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-orbitron focus:outline-none focus:border-gold/50 disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-2">
                  {[1, 5, 10, 25].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setAmount(v.toString())}
                      disabled={!isActive || submitting}
                      className="flex-1 py-2 rounded-lg bg-white/3 border border-white/10 text-white/60 font-orbitron text-[0.6rem] hover:border-gold/30 hover:text-gold disabled:opacity-30"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!isActive || submitting || selectedDigit === null || !amount}
                  className="w-full py-3 rounded-xl font-orbitron text-[0.75rem] font-bold tracking-[0.12em] bg-gradient-to-br from-cyan to-blue text-black transition-all hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ PLACING ENTRY...' : '🎮 PLACE PRACTICE BET'}
                </button>
              </form>

              {feedback && (
                <div
                  className={`mt-4 p-3 rounded-lg text-[0.7rem] ${
                    feedback.type === 'success'
                      ? 'bg-green/5 border border-green/20 text-green'
                      : 'bg-pink/5 border border-pink/20 text-pink'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>

            {/* Side panel — quick stats + rules */}
            <div className="space-y-4">
              <div className="card-glass rounded-2xl p-5">
                <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.15em] mb-2">
                  ⚠️ PRACTICE RULES
                </div>
                <ul className="text-[0.65rem] text-white/50 space-y-1.5 leading-relaxed">
                  <li>• Win = bet × {status?.winMultiplier || 8} (credited to practice wallet)</li>
                  <li>• Loss = balance burned permanently</li>
                  <li>• No cashback in practice mode</li>
                  <li>• No compound slots — all wins go to practice wallet</li>
                  <li>• 30-day expiry from registration</li>
                  <li>• Activate with 10+ USDT deposit to keep account</li>
                </ul>
              </div>

              <div className="card-glass rounded-2xl p-5 border border-cyan/20">
                <div className="text-[0.55rem] text-cyan font-orbitron tracking-[0.15em] mb-2">
                  💡 HOW AUTO-CONVERSION WORKS
                </div>
                <ol className="text-[0.6rem] text-white/50 space-y-1.5 leading-relaxed list-decimal list-inside">
                  <li>Deposit 100+ USDT to reach <span className="text-green">PRO tier</span></li>
                  <li>Refer friends who deposit — you earn <span className="text-cyan">Stream 2 commission</span></li>
                  <li>50% of each commission <span className="text-gold">auto-drains</span> from your practice balance into your game wallet</li>
                  <li>Practice balance converts into both your game wallet and referral wallet</li>
                  <li>Over time your practice balance becomes real withdrawable USDT</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
