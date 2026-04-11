import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useDeposit } from '../hooks/useDeposit';
import { useAuthStore } from '../store/authStore';
import { ERC20_ABI, CONTRACT_ADDRESSES } from '../lib/contracts';
import api from '../lib/axios';
import { fmt, num } from '../lib/format';
import { useSocket } from '../hooks/useSocket';

const WITHDRAWABLE_WALLETS = [
  { key: 'winningsWallet', label: 'Winnings', color: 'green' },
  { key: 'referralWallet', label: 'Referral', color: 'cyan' },
  { key: 'cashbackWallet', label: 'Cashback', color: 'purple' },
  { key: 'roiWallet', label: 'ROI', color: 'pink' },
  { key: 'clubWallet', label: 'Club Income', color: 'blue' },
  { key: 'luckyDrawWinWallet', label: 'Lucky Draw', color: 'gold' },
];

export default function Wallet() {
  const { address } = useAccount();
  const { user, updateUser } = useAuthStore();
  const { deposit, step, error, result, reset, STEPS } = useDeposit();
  const [amount, setAmount] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read on-chain USDT balance
  const { data: usdtBalance, refetch: refetchUsdt } = useReadContract({
    address: CONTRACT_ADDRESSES.usdt,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Fetch backend wallet state
  useEffect(() => {
    let cancelled = false;
    api.get('/api/auth/me').then(({ data }) => {
      if (cancelled) return;
      setWalletData(data.wallet);
      if (data.user) updateUser(data.user);
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;

    const res = await deposit(value);
    if (res.success) {
      setAmount('');
      refetchUsdt();
      setRefreshKey((k) => k + 1);
    }
  };

  const isProcessing = step !== STEPS.IDLE && step !== STEPS.DONE;
  const usdtFormatted = usdtBalance ? formatUnits(usdtBalance, 18) : '0';

  const stepLabel = {
    [STEPS.APPROVING]: '⏳ Approving USDT spend...',
    [STEPS.DEPOSITING]: '⏳ Confirming deposit on chain...',
    [STEPS.CONFIRMING]: '⏳ Crediting your wallet...',
    [STEPS.DONE]: '✅ Deposit complete',
  }[step];

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-8">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-2">
              💰 Wallet & Deposit
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
              Your Galaxy Wallet
            </h1>
          </div>

          {/* Activation tier banner */}
          <div className="mb-8 card-glass rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">
                ACTIVATION STATUS
              </div>
              <div className="font-orbitron text-[1.4rem]">
                {user?.fullActivated ? (
                  <span className="text-green">🌟 PRO ACTIVATED</span>
                ) : user?.realCashActivated ? (
                  <span className="text-cyan">🔓 BASIC ACTIVATED</span>
                ) : (
                  <span className="text-white/30">⚪ NOT ACTIVATED</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.15em] mb-1">
                TOTAL DEPOSITED
              </div>
              <div className="font-orbitron text-gold text-[1.4rem]">
                {fmt(user?.totalDeposited)} USDT
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Section */}
            <div className="card-glass rounded-2xl p-6 border-gold/20">
              <div className="font-orbitron text-gold text-[0.85rem] font-bold mb-4 flex items-center gap-2">
                🚀 DEPOSIT USDT
              </div>

              <div className="mb-4 text-[0.7rem] text-white/40">
                Wallet USDT Balance: <span className="text-cyan font-orbitron">{fmt(parseFloat(usdtFormatted || '0'))}</span>
              </div>

              <form onSubmit={handleDeposit} className="space-y-3">
                <div>
                  <label className="block text-[0.6rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
                    AMOUNT (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.00"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-orbitron focus:outline-none focus:border-gold/50 disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setAmount(v.toString())}
                      disabled={isProcessing}
                      className="flex-1 py-2 rounded-lg bg-white/3 border border-white/10 text-white/60 font-orbitron text-[0.6rem] transition-all hover:border-gold/30 hover:text-gold disabled:opacity-50"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className="w-full py-3 rounded-xl font-orbitron text-[0.7rem] font-bold tracking-[0.1em] bg-gradient-to-br from-gold to-gold2 text-black transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {isProcessing ? '⏳ PROCESSING...' : '🚀 DEPOSIT NOW'}
                </button>
              </form>

              {stepLabel && (
                <div className="mt-4 p-3 rounded-lg bg-cyan/5 border border-cyan/20 text-cyan text-[0.7rem] font-orbitron">
                  {stepLabel}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-pink/5 border border-pink/20 text-pink text-[0.7rem]">
                  {error}
                </div>
              )}

              {result && step === STEPS.DONE && (
                <div className="mt-4 p-4 rounded-lg bg-green/5 border border-green/20">
                  <div className="text-green font-orbitron text-[0.7rem] mb-2">
                    ✅ Deposit confirmed: {fmt(result.amount)} USDT
                  </div>
                  <a
                    href={`https://testnet.bscscan.com/tx/${result.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan text-[0.6rem] font-orbitron underline break-all"
                  >
                    View on BSCScan ↗
                  </a>
                  {result.activationChanged && (
                    <div className="text-gold text-[0.65rem] mt-2 font-orbitron">
                      🌟 Activation tier upgraded!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wallets Overview */}
            <div className="card-glass rounded-2xl p-6">
              <div className="font-orbitron text-cyan text-[0.85rem] font-bold mb-4 flex items-center gap-2">
                💎 ALL WALLETS
              </div>

              <div className="space-y-2">
                {[
                  ['Game Wallet', walletData?.gameWallet, 'gold', 'For game entries'],
                  ['Winnings', walletData?.winningsWallet, 'green', 'Withdrawable'],
                  ['Referral', walletData?.referralWallet, 'cyan', 'Withdrawable'],
                  ['Cashback', walletData?.cashbackWallet, 'purple', 'Withdrawable'],
                  ['ROI', walletData?.roiWallet, 'pink', 'Withdrawable'],
                  ['Club Income', walletData?.clubWallet, 'blue', 'Withdrawable'],
                  ['Lucky Draw', walletData?.luckyDrawWinWallet, 'gold', 'Withdrawable'],
                  ['Practice', walletData?.practiceWallet, 'silver', 'Non-withdrawable'],
                ].map(([label, value, color, hint]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5"
                  >
                    <div>
                      <div className={`text-${color} font-orbitron text-[0.7rem] font-bold`}>{label}</div>
                      <div className="text-white/30 text-[0.68rem]">{hint}</div>
                    </div>
                    <div className="font-orbitron text-white text-[0.85rem]">
                      {fmt(value, 3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compound slots */}
          <div className="mt-6 card-glass rounded-2xl p-6">
            <div className="font-orbitron text-white text-[0.85rem] font-bold mb-4 flex items-center gap-2">
              🪐 COMPOUND SLOTS (Locked to digit)
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const slotValue = walletData?.compoundSlots?.[String(i)] || 0;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-center border ${
                      slotValue > 0
                        ? 'bg-white/10 border-white/40'
                        : 'bg-white/2 border-white/5'
                    }`}
                  >
                    <div className="font-orbitron text-[0.68rem] text-white/40">DIGIT</div>
                    <div className="font-russo text-[1.4rem] text-white">{i}</div>
                    <div className="font-orbitron text-[0.6rem] text-white">{fmt(slotValue, 3)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Withdrawal section */}
          <WithdrawalSection
            walletData={walletData}
            userAddress={address}
            refreshKey={refreshKey}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WithdrawalSection — owns the shared history/dailyUsage fetch and passes
// the data down to both the form (for the daily limit display) and the
// history list (for rendering rows).
// ============================================================================
function WithdrawalSection({ walletData, userAddress, refreshKey, onSuccess }) {
  const [history, setHistory] = useState([]);
  const [dailyUsage, setDailyUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/withdraw/history?pageSize=20');
      setHistory(data.withdrawals || []);
      setDailyUsage(data.dailyUsage || null);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  // Live updates on status changes
  useSocket({
    'withdrawal:status': () => refresh(),
  });

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WithdrawalForm
        walletData={walletData}
        userAddress={userAddress}
        dailyUsage={dailyUsage}
        onSuccess={() => {
          if (onSuccess) onSuccess();
          refresh();
        }}
      />
      <WithdrawalHistory history={history} loading={loading} />
    </div>
  );
}

// ============================================================================
// WithdrawalForm
// ============================================================================
function WithdrawalForm({ walletData, userAddress, dailyUsage, onSuccess }) {
  const [fromWallet, setFromWallet] = useState('winningsWallet');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Default toAddress to user's connected wallet
  useEffect(() => {
    if (userAddress && !toAddress) setToAddress(userAddress);
  }, [userAddress, toAddress]);

  const sourceBalance = num(walletData?.[fromWallet]);
  const value = num(amount);
  const fee = value * 0.1;
  const netAmount = value - fee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!value || value <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    if (value < 5) {
      setFeedback({ type: 'error', message: 'Minimum withdrawal is 5 USDT' });
      return;
    }
    if (value > sourceBalance) {
      setFeedback({ type: 'error', message: 'Insufficient balance in selected wallet' });
      return;
    }
    if (dailyUsage && value > dailyUsage.remainingToday) {
      setFeedback({
        type: 'error',
        message: `Daily limit exceeded. Remaining today: ${fmt(dailyUsage.remainingToday)} USDT`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/withdraw/request', {
        amount: value,
        fromWallet,
        toAddress,
      });
      setFeedback({
        type: 'success',
        message: `✓ Withdrawal request submitted. You'll receive ${fmt(data.netAmount)} USDT after admin approval.`,
      });
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Withdrawal failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-glass rounded-2xl p-6 border border-pink/20">
      <div className="font-orbitron text-pink text-[0.85rem] font-bold mb-4 flex items-center gap-2">
        💸 WITHDRAW
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[0.68rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
            FROM WALLET
          </label>
          <select
            value={fromWallet}
            onChange={(e) => setFromWallet(e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:outline-none focus:border-pink/50 disabled:opacity-50"
          >
            {WITHDRAWABLE_WALLETS.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label} — {fmt(walletData?.[w.key])} USDT
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[0.68rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
            AMOUNT (USDT)
          </label>
          <input
            type="number"
            step="0.01"
            min="5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5.00"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-orbitron focus:outline-none focus:border-pink/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setAmount(String(sourceBalance))}
            disabled={submitting || sourceBalance <= 0}
            className="mt-1 text-[0.68rem] text-pink font-orbitron hover:underline disabled:opacity-30"
          >
            MAX: {fmt(sourceBalance)} USDT
          </button>
        </div>

        <div>
          <label className="block text-[0.68rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
            DESTINATION ADDRESS
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            disabled={submitting}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-pink/50 disabled:opacity-50"
          />
          {toAddress === userAddress && (
            <div className="text-[0.68rem] text-cyan mt-1 font-orbitron">
              ✓ Your connected wallet
            </div>
          )}
        </div>

        {/* Live fee preview */}
        {value > 0 && (
          <div className="p-3 rounded-lg bg-white/3 border border-white/10 space-y-1.5 text-[0.65rem]">
            <div className="flex items-center justify-between">
              <span className="text-white/40">Requested</span>
              <span className="text-white font-orbitron">{fmt(value)} USDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Sustainability Fee (10%)</span>
              <span className="text-pink font-orbitron">−{fmt(fee)} USDT</span>
            </div>
            <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
              <span className="text-white/60 font-orbitron text-[0.7rem]">YOU RECEIVE</span>
              <span className="text-green font-orbitron text-[0.85rem] font-bold">
                {fmt(netAmount)} USDT
              </span>
            </div>
          </div>
        )}

        {/* Daily limit tracker */}
        {dailyUsage && (
          <div className="p-3 rounded-lg bg-white/3 border border-white/10">
            <div className="flex items-center justify-between text-[0.6rem] font-orbitron mb-1.5">
              <span className="text-white/50">DAILY LIMIT USED</span>
              <span className="text-cyan">
                {fmt(dailyUsage.usedToday)} / {fmt(dailyUsage.dailyMax)} USDT
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyUsage.remainingToday <= 0
                    ? 'bg-pink'
                    : dailyUsage.remainingToday < dailyUsage.dailyMax * 0.2
                    ? 'bg-yellow-400'
                    : 'bg-gradient-to-r from-cyan to-green'
                }`}
                style={{
                  width: `${Math.min(100, (dailyUsage.usedToday / dailyUsage.dailyMax) * 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[0.68rem] font-orbitron mt-1 text-white/40">
              <span>Min: 5 USDT</span>
              <span>
                Remaining today:{' '}
                <span className={dailyUsage.remainingToday <= 0 ? 'text-pink' : 'text-green'}>
                  {fmt(dailyUsage.remainingToday)} USDT
                </span>
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !amount || value <= 0}
          className="w-full py-3 rounded-xl font-orbitron text-[0.7rem] font-bold tracking-[0.1em] bg-gradient-to-br from-pink to-purple text-white transition-all hover:shadow-[0_0_25px_rgba(255,45,120,0.4)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {submitting ? '⏳ SUBMITTING...' : '💸 REQUEST WITHDRAWAL'}
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-3 p-3 rounded-lg text-[0.7rem] ${
            feedback.type === 'success'
              ? 'bg-green/5 border border-green/20 text-green'
              : 'bg-pink/5 border border-pink/20 text-pink'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WithdrawalHistory
// ============================================================================
const STATUS_STYLES = {
  PENDING: { color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5', label: '⏳ PENDING' },
  APPROVED: { color: 'text-cyan border-cyan/30 bg-cyan/5', label: '✓ APPROVED' },
  PROCESSING: { color: 'text-cyan border-cyan/30 bg-cyan/5', label: '⏳ PROCESSING' },
  COMPLETED: { color: 'text-green border-green/30 bg-green/5', label: '✅ COMPLETED' },
  REJECTED: { color: 'text-pink border-pink/30 bg-pink/5', label: '✗ REJECTED' },
  FAILED: { color: 'text-pink border-pink/30 bg-pink/5', label: '⚠️ FAILED' },
};

function WithdrawalHistory({ history, loading }) {
  return (
    <div className="card-glass rounded-2xl p-6 border border-cyan/20">
      <div className="font-orbitron text-cyan text-[0.85rem] font-bold mb-4 flex items-center gap-2">
        📜 WITHDRAWAL HISTORY
      </div>

      {loading ? (
        <div className="text-center py-6 text-[0.7rem] text-white/30 font-orbitron">
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-6 text-[0.7rem] text-white/30">
          No withdrawals yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {history.map((w) => {
            const style = STATUS_STYLES[w.status] || STATUS_STYLES.PENDING;
            return (
              <div
                key={w._id}
                className="p-3 rounded-lg bg-white/3 border border-white/5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-orbitron border ${style.color}`}>
                    {style.label}
                  </span>
                  <span className="text-[0.68rem] text-white/30 font-orbitron">
                    {new Date(w.requestedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[0.7rem]">
                  <div>
                    <div className="font-orbitron text-white">
                      {fmt(w.netAmount)} USDT
                    </div>
                    <div className="text-[0.68rem] text-white/30">
                      from {w.fromWallet} · fee {fmt(w.fee)}
                    </div>
                  </div>
                  {w.txHash && (
                    <a
                      href={`https://testnet.bscscan.com/tx/${w.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.68rem] text-cyan font-orbitron underline hover:text-gold"
                    >
                      BSCScan ↗
                    </a>
                  )}
                </div>
                {w.adminNote && (
                  <div className="mt-1.5 text-[0.68rem] text-white/40 italic">
                    Note: {w.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
