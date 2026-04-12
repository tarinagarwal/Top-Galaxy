import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

const CATEGORY_LABELS = {
  Game: '🎯 Game Settings',
  Practice: '🎮 Practice Mode',
  Activation: '🔓 Activation Tiers',
  Cashback: '🛡️ Cashback (Stream 4)',
  ROI: '🔄 ROI on ROI (Stream 5)',
  Referral: '⭐ Referral Commissions',
  Club: '🏆 Club Income (Stream 6)',
  LuckyDraw: '🎰 Lucky Draw (Stream 7)',
  Withdrawal: '💸 Withdrawals',
  PracticeReferral: '🎁 Practice Referral Rewards',
  Admin: '🛡️ Admin',
  DepositV2: '📥 Deposit Distribution (V2)',
  Other: '⚙️ Other',
};

// Human-friendly display for each config key: { label, desc, format }
// format: 'pct' (×100 + %), 'pct_raw' (already %, just add %), 'usdt', 'count', 'ms', 'bool', 'bps', 'address'
const CONFIG_DISPLAY = {
  // Game
  GAME_PHASE1_MULTIPLIER: { label: 'Win Multiplier (Phase 1)', desc: 'Total payout multiplier when user wins in Phase 1', format: 'x' },
  GAME_PHASE2_MULTIPLIER: { label: 'Win Multiplier (Phase 2)', desc: 'Total payout multiplier when user wins in Phase 2', format: 'x' },
  GAME_PHASE1_USER_LIMIT: { label: 'Phase 1 → 2 Threshold', desc: 'Number of users before switching from Phase 1 to Phase 2', format: 'count' },
  GAME_PHASE1_DIRECT_RATIO: { label: 'Direct Payout Ratio (Phase 1)', desc: 'Fraction of win that goes to withdrawal wallet (e.g., 0.25 = 25%)', format: 'pct' },
  GAME_PHASE1_COMPOUND_RATIO: { label: 'Compound Payout Ratio (Phase 1)', desc: 'Fraction of win locked in compound slot (e.g., 0.75 = 75%)', format: 'pct' },
  GAME_PHASE2_DIRECT_RATIO: { label: 'Direct Payout Ratio (Phase 2)', desc: 'Phase 2 direct payout fraction', format: 'pct' },
  GAME_PHASE2_COMPOUND_RATIO: { label: 'Compound Payout Ratio (Phase 2)', desc: 'Phase 2 compound payout fraction', format: 'pct' },
  GAME_CUTOFF_MINUTES: { label: 'Entry Cutoff', desc: 'Minutes before game result when entries close', format: 'min' },
  GAME_MIN_ENTRY_USDT: { label: 'Minimum Bet', desc: 'Minimum USDT amount per game entry', format: 'usdt' },
  GAMES_PER_DAY: { label: 'Games Per Day', desc: 'Number of game rounds scheduled daily', format: 'count' },
  GAMES_PAUSED: { label: 'Games Paused', desc: 'Emergency pause flag — blocks all new game entries when true', format: 'bool' },

  // Activation
  BASIC_ACTIVATION_USDT: { label: 'BASIC Tier Deposit', desc: 'Minimum cumulative deposit to activate BASIC (unlocks L1-L3)', format: 'usdt' },
  PRO_ACTIVATION_USDT: { label: 'PRO Tier Deposit', desc: 'Minimum cumulative deposit to activate PRO (unlocks all 15 levels)', format: 'usdt' },

  // Cashback
  CASHBACK_PHASE1_RATE: { label: 'Daily Rate (Phase 1)', desc: 'Daily cashback % of effective net loss (≤10K users)', format: 'pct' },
  CASHBACK_PHASE2_RATE: { label: 'Daily Rate (Phase 2)', desc: 'Daily cashback % (10K–100K users)', format: 'pct' },
  CASHBACK_PHASE3_RATE: { label: 'Daily Rate (Phase 3)', desc: 'Daily cashback % (>100K users)', format: 'pct' },
  CASHBACK_PHASE1_USER_LIMIT: { label: 'Phase 1 → 2 Users', desc: 'User count that triggers rate drop from Phase 1 to Phase 2', format: 'count' },
  CASHBACK_PHASE2_USER_LIMIT: { label: 'Phase 2 → 3 Users', desc: 'User count that triggers rate drop from Phase 2 to Phase 3', format: 'count' },
  CASHBACK_MIN_NET_LOSS: { label: 'Minimum Net Loss', desc: 'User must have at least this much effective net loss to receive cashback', format: 'usdt' },
  CASHBACK_CAP_0_REF: { label: 'Cap: 0 Referrals', desc: 'Lifetime cashback cap multiplier with 0 qualifying directs', format: 'x' },
  CASHBACK_CAP_5_REF: { label: 'Cap: 5 Referrals', desc: 'Cap multiplier with 5+ qualifying directs', format: 'x' },
  CASHBACK_CAP_10_REF: { label: 'Cap: 10 Referrals', desc: 'Cap multiplier with 10+ qualifying directs', format: 'x' },
  CASHBACK_CAP_20_REF: { label: 'Cap: 20 Referrals', desc: 'Cap multiplier with 20+ qualifying directs', format: 'x' },
  CASHBACK_CAP_POST10K_10_REF: { label: 'Cap Post-10K: 10 Refs', desc: 'Reduced cap multiplier after 10K platform users (was 4×)', format: 'x' },
  CASHBACK_CAP_POST10K_20_REF: { label: 'Cap Post-10K: 20 Refs', desc: 'Reduced cap multiplier after 10K platform users (was 8×)', format: 'x' },
  CASHBACK_REACTIVATION_DEPOSIT: { label: 'Reactivation Deposit', desc: 'Deposit amount needed to resume cashback after cap is hit', format: 'usdt' },

  // ROI
  ROI_POOL_PERCENT: { label: 'ROI Pool Size', desc: 'Fraction of cashback distributed as ROI to uplines (0.5 = 50%)', format: 'pct' },
  ROI_L1_PERCENT: { label: 'Level 1 Share', desc: 'L1 upline gets this % of the ROI pool', format: 'pct_raw' },
  ROI_L2_L5_PERCENT: { label: 'Level 2-5 Share (each)', desc: 'Each L2-L5 upline gets this % of the ROI pool', format: 'pct_raw' },
  ROI_L6_L10_PERCENT: { label: 'Level 6-10 Share (each)', desc: 'Each L6-L10 upline gets this % of the ROI pool', format: 'pct_raw' },
  ROI_L11_L15_PERCENT: { label: 'Level 11-15 Share (each)', desc: 'Each L11-L15 upline gets this % of the ROI pool', format: 'pct_raw' },

  // Referral
  REF_L1_PERCENT: { label: 'L1 Commission', desc: 'Level 1 direct referral commission on deposits', format: 'pct_raw' },
  REF_L2_PERCENT: { label: 'L2 Commission', desc: 'Level 2 commission on deposits', format: 'pct_raw' },
  REF_L3_L5_PERCENT: { label: 'L3-5 Commission (each)', desc: 'Each L3-L5 commission on deposits', format: 'pct_raw' },
  REF_L6_L15_PERCENT: { label: 'L6-15 Commission (each)', desc: 'Each L6-L15 commission on deposits', format: 'pct_raw' },
  WINNERS_REF_TOTAL_PERCENT: { label: 'Winners Ref Total', desc: 'Informational: total % distributed across 15 levels on game wins', format: 'pct_raw' },

  // Club
  CLUB_RANK1_PERCENT: { label: 'Rank 1 Pool %', desc: 'Daily turnover % allocated to Rank 1 members', format: 'pct_raw' },
  CLUB_RANK2_PERCENT: { label: 'Rank 2 Pool %', format: 'pct_raw' },
  CLUB_RANK3_PERCENT: { label: 'Rank 3 Pool %', format: 'pct_raw' },
  CLUB_RANK4_PERCENT: { label: 'Rank 4 Pool %', format: 'pct_raw' },
  CLUB_RANK5_PERCENT: { label: 'Rank 5 Pool %', format: 'pct_raw' },
  CLUB_RANK6_PERCENT: { label: 'Rank 6 Pool %', format: 'pct_raw' },
  CLUB_RANK1_VOLUME: { label: 'Rank 1 Volume Required', desc: 'Business volume needed for Rank 1', format: 'usdt' },
  CLUB_RANK2_VOLUME: { label: 'Rank 2 Volume', format: 'usdt' },
  CLUB_RANK3_VOLUME: { label: 'Rank 3 Volume', format: 'usdt' },
  CLUB_RANK4_VOLUME: { label: 'Rank 4 Volume', format: 'usdt' },
  CLUB_RANK5_VOLUME: { label: 'Rank 5 Volume', format: 'usdt' },
  CLUB_RANK6_VOLUME: { label: 'Rank 6 Volume', format: 'usdt' },
  CLUB_LEG_RATIO: { label: 'Balanced Leg Ratio', desc: '50/50 strong leg vs other legs split requirement', format: 'pct' },

  // Lucky Draw
  GOLDEN_ENTRY_FEE: { label: 'Golden Ticket Price', format: 'usdt' },
  SILVER_ENTRY_FEE: { label: 'Silver Ticket Price', format: 'usdt' },
  DRAW_TOTAL_TICKETS: { label: 'Tickets Per Draw', desc: 'Draw triggers when this many tickets are sold', format: 'count' },
  DRAW_TOTAL_WINNERS: { label: 'Winners Per Draw', desc: 'Number of winners selected from each draw', format: 'count' },
  DRAW_AUTO_FUND_PERCENT: { label: 'Auto-Fund Rate', desc: 'Fraction of daily cashback+ROI auto-credited to draw wallets (0.2 = 20%)', format: 'pct' },
  DRAW_TIMER_DURATION_MS: { label: 'Countdown Timer', desc: 'Time between draw filling and execution', format: 'ms' },
  TICKET_SPLIT_CREATOR_PERCENT: { label: 'Ticket Revenue → Creator', desc: 'Creator wallet share of each ticket sale', format: 'pct_raw' },
  TICKET_SPLIT_BD_PERCENT: { label: 'Ticket Revenue → BD Wallets', desc: 'Total BD wallet share (split across 24 wallets)', format: 'pct_raw' },
  TICKET_SPLIT_FEW_PERCENT: { label: 'Ticket Revenue → FEW', desc: 'Field Expenses wallet share', format: 'pct_raw' },
  TICKET_SPLIT_GAME_POOL_PERCENT: { label: 'Ticket Revenue → Game Pool', desc: 'Game pool share', format: 'pct_raw' },

  // Withdrawal
  WITHDRAWAL_MIN_USDT: { label: 'Minimum Withdrawal', format: 'usdt' },
  WITHDRAWAL_MAX_DAILY_USDT: { label: 'Daily Limit', desc: 'Max USDT a user can withdraw per day', format: 'usdt' },
  WITHDRAWAL_FEE_PERCENT: { label: 'Withdrawal Fee', desc: 'Fee deducted from each withdrawal (0.10 = 10%)', format: 'pct' },

  // Practice
  PRACTICE_PHASE1_BALANCE: { label: 'Phase 1 Starting Balance', desc: 'Practice USDT given to first 10K users', format: 'usdt' },
  PRACTICE_PHASE1_LIMIT: { label: 'Phase 1 User Limit', format: 'count' },
  PRACTICE_PHASE2_BALANCE: { label: 'Phase 2 Starting Balance', desc: 'Practice USDT given after 10K users', format: 'usdt' },
  PRACTICE_PHASE2_LIMIT: { label: 'Phase 2 User Limit', format: 'count' },
  PRACTICE_EXPIRY_DAYS: { label: 'Practice Expiry', desc: 'Days before practice account expires', format: 'days' },
  PRACTICE_PHASE1_WIN_MULTIPLIER: { label: 'Win Multiplier (Phase 1)', format: 'x' },
  PRACTICE_PHASE2_WIN_MULTIPLIER: { label: 'Win Multiplier (Phase 2)', format: 'x' },
  PRACTICE_MAX_REF_BONUS_DIRECTS: { label: 'Max Referral Bonus Directs', desc: 'Cap on how many directs earn practice referral rewards', format: 'count' },

  // Practice Referral
  PRACTICE_REF_L1_USDT: { label: 'L1 Practice Ref Reward', format: 'usdt' },
  PRACTICE_REF_L2_L5_USDT: { label: 'L2-5 Reward (each)', format: 'usdt' },
  PRACTICE_REF_L6_L10_USDT: { label: 'L6-10 Reward (each)', format: 'usdt' },
  PRACTICE_REF_L11_L15_USDT: { label: 'L11-15 Reward (each)', format: 'usdt' },

  // Deposit V2
  DEPOSIT_CREATOR_BPS: { label: 'Deposit → Creator', desc: 'Basis points (200 = 2%)', format: 'bps' },
  DEPOSIT_BD_DEFAULT_BPS: { label: 'Deposit → Per BD Wallet', desc: 'Basis points per BD wallet (25 = 0.25%)', format: 'bps' },
  DEPOSIT_FEW_BPS: { label: 'Deposit → FEW', desc: 'Field Expenses (500 = 5%)', format: 'bps' },
  DEPOSIT_REFERRAL_POOL_BPS: { label: 'Deposit → Referral Pool', desc: 'Direct referral pool (1500 = 15%)', format: 'bps' },
  DEPOSIT_LUCKY_DRAW_BPS: { label: 'Deposit → Lucky Draw', desc: 'Lucky draw pool (100 = 1%)', format: 'bps' },

  // Wallets
  ADMIN_WALLET: { label: 'Admin Wallet Address', desc: 'This wallet gets auto-promoted to Super Admin on login', format: 'address' },
  CREATOR_WALLET: { label: 'Creator Wallet Address', format: 'address' },
  FEW_WALLET: { label: 'FEW Wallet Address', desc: 'Field Expenses Wallet', format: 'address' },
  BD_FALLBACK_WALLET: { label: 'BD Fallback Address', desc: 'Default address for BD wallet slots 21-24', format: 'address' },
};

// Format a raw value for display
function formatConfigValue(key, value) {
  const info = CONFIG_DISPLAY[key];
  if (!info) return String(value);
  switch (info.format) {
    case 'pct': return `${(Number(value) * 100).toFixed(2)}%`;
    case 'pct_raw': return `${Number(value)}%`;
    case 'usdt': return `$${Number(value).toLocaleString()} USDT`;
    case 'count': return Number(value).toLocaleString();
    case 'x': return `${Number(value)}×`;
    case 'ms': {
      const mins = Math.round(Number(value) / 60000);
      return mins >= 60 ? `${(mins / 60).toFixed(1)} hours` : `${mins} minutes`;
    }
    case 'min': return `${Number(value)} minutes`;
    case 'days': return `${Number(value)} days`;
    case 'bool': return value ? '✅ YES' : '❌ NO';
    case 'bps': return `${Number(value)} bps (${(Number(value) / 100).toFixed(2)}%)`;
    case 'address': return String(value);
    default: return String(value);
  }
}

const CATEGORY_COLORS = {
  Game: 'gold',
  Practice: 'cyan',
  Activation: 'green',
  Cashback: 'green',
  ROI: 'purple',
  Referral: 'cyan',
  Club: 'gold',
  LuckyDraw: 'gold',
  Withdrawal: 'pink',
  PracticeReferral: 'silver',
  Admin: 'pink',
  Other: 'cyan',
};

export default function AdminConfig() {
  const canEdit = useAuthStore((s) => s.isOperationalAdmin);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingEdits, setPendingEdits] = useState({}); // key → newValue
  const [savingKey, setSavingKey] = useState(null);
  const [confirmKey, setConfirmKey] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/config');
      setConfig(data.config || {});
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleEdit = (key, value) => {
    setPendingEdits((prev) => ({ ...prev, [key]: value }));
  };

  const cancelEdit = (key) => {
    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setConfirmKey(null);
  };

  const requestSave = (key) => {
    setConfirmKey(key);
  };

  const confirmSave = async (key, oldValue, withConfirm = false) => {
    setSavingKey(key);
    setFeedback(null);
    let parsedValue = pendingEdits[key];

    // Try to coerce numeric strings to numbers (but only if the old value was numeric)
    if (typeof oldValue === 'number' && typeof parsedValue === 'string') {
      const num = parseFloat(parsedValue);
      if (!isNaN(num)) parsedValue = num;
    }
    // Coerce boolean strings
    if (typeof oldValue === 'boolean') {
      parsedValue = parsedValue === 'true' || parsedValue === true;
    }

    try {
      const body = { value: parsedValue };
      if (withConfirm) body.confirm = true;
      await api.post(`/api/admin/config/${key}`, body);
      setFeedback({ type: 'success', message: `✓ ${key} updated` });
      cancelEdit(key);
      await refresh();
    } catch (err) {
      // Server may request an explicit confirmation for sensitive keys
      if (err?.response?.data?.requiresConfirmation) {
        // Show the hard-confirmation modal (keep pendingEdit intact)
        setAdminWalletConfirm({
          key,
          oldValue,
          newValue: parsedValue,
          message: err.response.data.error,
        });
      } else {
        setFeedback({
          type: 'error',
          message: err?.response?.data?.error || `Failed to save ${key}`,
        });
      }
    }
    setSavingKey(null);
    setConfirmKey(null);
  };

  // Hard-confirmation modal state for sensitive keys like ADMIN_WALLET
  const [adminWalletConfirm, setAdminWalletConfirm] = useState(null);
  const [typedConfirmation, setTypedConfirmation] = useState('');

  // Filter by search
  const filteredConfig = {};
  if (search) {
    const lc = search.toLowerCase();
    for (const [cat, keys] of Object.entries(config)) {
      const matched = {};
      for (const [k, v] of Object.entries(keys)) {
        if (k.toLowerCase().includes(lc)) matched[k] = v;
      }
      if (Object.keys(matched).length > 0) filteredConfig[cat] = matched;
    }
  } else {
    Object.assign(filteredConfig, config);
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.68rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Config</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          All platform parameters. Every change is logged to adminLogs.
        </p>
      </div>

      {/* Search */}
      <div className="card-glass rounded-2xl p-3 mb-4 border border-white/10">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search config keys..."
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:outline-none focus:border-gold/50"
        />
      </div>

      {feedback && (
        <div
          className={`card-glass rounded-2xl p-3 mb-4 border ${
            feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
          } text-[0.7rem]`}
        >
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(filteredConfig).map(([category, keys]) => (
            <ConfigCategory
              key={category}
              category={category}
              keys={keys}
              pendingEdits={pendingEdits}
              savingKey={savingKey}
              confirmKey={confirmKey}
              onEdit={handleEdit}
              onCancel={cancelEdit}
              onRequestSave={requestSave}
              onConfirmSave={confirmSave}
              canEdit={canEdit}
            />
          ))}
          {Object.keys(filteredConfig).length === 0 && (
            <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
              No config keys match "{search}"
            </div>
          )}
        </div>
      )}

      {/* On-chain contract wallet addresses (DepositV2) */}
      {canEdit && <OnChainWallets />}

      {/* Hard-confirmation modal for ADMIN_WALLET */}
      {adminWalletConfirm && (
        <div
          className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => {
            setAdminWalletConfirm(null);
            setTypedConfirmation('');
          }}
        >
          <div
            className="card-glass rounded-2xl border-2 border-pink/60 max-w-[600px] w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-orbitron text-pink text-[1rem] font-bold mb-3 flex items-center gap-2">
              🚨 DANGER — TRANSFERRING ADMIN ACCESS
            </div>
            <div className="text-white/60 text-[0.75rem] leading-relaxed mb-4">
              You are about to change <span className="text-gold font-orbitron">ADMIN_WALLET</span>.
              This will <span className="text-pink font-orbitron">permanently transfer admin panel access</span> to
              the new wallet. If you make a typo or lose access to the new wallet, you will be{' '}
              <span className="text-pink font-orbitron">locked out forever</span>.
            </div>

            <div className="space-y-2 mb-4 text-[0.65rem]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/10">
                <span className="text-white/40">Current admin</span>
                <code className="text-cyan font-orbitron break-all">
                  {adminWalletConfirm.oldValue || '(not set)'}
                </code>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-pink/5 border border-pink/30">
                <span className="text-white/40">New admin</span>
                <code className="text-pink font-orbitron break-all">
                  {adminWalletConfirm.newValue}
                </code>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[0.6rem] font-orbitron text-white/50 mb-2 tracking-[0.1em]">
                To confirm, type <span className="text-pink">TRANSFER ADMIN</span> below:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder="TRANSFER ADMIN"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white font-orbitron text-[0.75rem] focus:outline-none focus:border-pink/50"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setAdminWalletConfirm(null);
                  setTypedConfirmation('');
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.65rem]"
              >
                CANCEL
              </button>
              <button
                disabled={typedConfirmation !== 'TRANSFER ADMIN' || savingKey === adminWalletConfirm.key}
                onClick={async () => {
                  const { key, oldValue } = adminWalletConfirm;
                  setAdminWalletConfirm(null);
                  setTypedConfirmation('');
                  await confirmSave(key, oldValue, true);
                }}
                className="px-5 py-2 rounded-lg bg-pink/20 border border-pink/60 text-pink font-orbitron text-[0.65rem] font-bold hover:bg-pink/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🚨 TRANSFER ADMIN ACCESS
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function ConfigCategory({
  category,
  keys,
  pendingEdits,
  savingKey,
  confirmKey,
  onEdit,
  onCancel,
  onRequestSave,
  onConfirmSave,
  canEdit = true,
}) {
  const color = CATEGORY_COLORS[category] || 'cyan';
  const colorClass = {
    gold: 'border-gold/30 text-gold',
    cyan: 'border-cyan/30 text-cyan',
    green: 'border-green/30 text-green',
    purple: 'border-purple/30 text-purple',
    pink: 'border-pink/30 text-pink',
    silver: 'border-silver/30 text-silver',
  }[color];

  return (
    <div className={`card-glass rounded-2xl border ${colorClass.split(' ')[0]} overflow-hidden`}>
      <div className={`p-4 border-b border-white/10 font-orbitron text-[0.75rem] font-bold ${colorClass.split(' ')[1]}`}>
        {CATEGORY_LABELS[category] || category} ({Object.keys(keys).length})
      </div>
      <div className="divide-y divide-white/5">
        {Object.entries(keys).map(([key, value]) => (
          <ConfigRow
            key={key}
            configKey={key}
            value={value}
            pending={pendingEdits[key]}
            isSaving={savingKey === key}
            isConfirming={confirmKey === key}
            onEdit={canEdit ? onEdit : () => {}}
            onCancel={onCancel}
            onRequestSave={onRequestSave}
            onConfirmSave={onConfirmSave}
            readOnly={!canEdit}
          />
        ))}
      </div>
    </div>
  );
}

function ConfigRow({
  configKey,
  value,
  pending,
  isSaving,
  isConfirming,
  onEdit,
  onCancel,
  onRequestSave,
  onConfirmSave,
  readOnly = false,
}) {
  const isEditing = pending !== undefined;
  const displayValue = isEditing ? pending : value;

  // Determine input type based on current value type
  const inputType = typeof value === 'number' ? 'number' : 'text';

  const info = CONFIG_DISPLAY[configKey];
  const friendlyLabel = info?.label || configKey;
  const friendlyDesc = info?.desc || '';
  const friendlyValue = formatConfigValue(configKey, value);

  return (
    <div className="p-3 hover:bg-white/3">
      <div className="flex items-start gap-3 flex-wrap md:flex-nowrap">
        <div className="flex-1 min-w-[200px]">
          <div className="font-orbitron text-[0.65rem] text-white/80">{friendlyLabel}</div>
          {friendlyDesc && (
            <div className="text-[0.65rem] text-white/25 mt-0.5 leading-relaxed">{friendlyDesc}</div>
          )}
          <div className="text-[0.68rem] text-white/40 font-orbitron mt-1">
            Value: <span className="text-cyan">{friendlyValue}</span>
            <span className="text-white/20 ml-2">({configKey})</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {typeof value === 'boolean' ? (
            <select
              value={String(displayValue)}
              onChange={(e) => onEdit(configKey, e.target.value)}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50 disabled:opacity-50"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={inputType}
              step={inputType === 'number' ? 'any' : undefined}
              value={isEditing ? displayValue : value}
              onChange={(e) => onEdit(configKey, e.target.value)}
              disabled={isSaving}
              className="w-[180px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
          )}

          {!isEditing ? null : isConfirming ? (
            <div className="flex gap-1">
              <button
                onClick={() => onConfirmSave(configKey, value)}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-green/10 border border-green/40 text-green font-orbitron text-[0.68rem] font-bold hover:bg-green/20 disabled:opacity-50"
              >
                {isSaving ? '⏳' : '✓ CONFIRM'}
              </button>
              <button
                onClick={() => onCancel(configKey)}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.68rem]"
              >
                CANCEL
              </button>
            </div>
          ) : !readOnly ? (
            <button
              onClick={() => onRequestSave(configKey)}
              className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/40 text-gold font-orbitron text-[0.68rem] font-bold hover:bg-gold/20"
            >
              💾 SAVE
            </button>
          ) : null}
        </div>
      </div>

      {isConfirming && (
        <div className="mt-2 p-2 rounded-lg bg-yellow-400/5 border border-yellow-400/30 text-[0.6rem]">
          <span className="text-yellow-400 font-orbitron">⚠️ CONFIRM CHANGE</span>
          <div className="text-white/50 mt-1">
            <span className="text-pink">{JSON.stringify(value)}</span>
            <span className="text-white/30"> → </span>
            <span className="text-green">{JSON.stringify(pending)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// OnChainWallets — reads/writes wallet addresses directly on the DepositV2 contract
// ============================================================================
function OnChainWallets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { type, index?, current }
  const [newAddr, setNewAddr] = useState('');
  const [newBps, setNewBps] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/contracts/wallets');
      setData(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = async () => {
    if (!editing) return;
    if (!newAddr.trim() || !/^0x[a-fA-F0-9]{40}$/.test(newAddr.trim())) {
      setFeedback({ type: 'error', message: 'Enter a valid 0x address (42 characters)' });
      return;
    }
    if (!window.confirm(
      `Update ${editing.type}${editing.index !== undefined ? ` #${editing.index}` : ''} on-chain?\n\n` +
      `Current: ${editing.current}\n` +
      `New: ${newAddr.trim()}\n\n` +
      `This sends a real blockchain transaction. The change is immediate and affects all future deposits.`
    )) return;

    setSaving(true);
    setFeedback(null);
    try {
      const body = { address: newAddr.trim() };
      if (editing.type === 'bd') {
        body.index = editing.index;
        body.bps = parseInt(newBps || '25', 10);
      }
      const { data } = await api.post(`/api/admin/contracts/wallets/${editing.type}`, body);
      setFeedback({
        type: 'success',
        message: `✓ ${editing.type} updated on-chain · tx: ${data.txHash?.slice(0, 12)}... · block: ${data.blockNumber}`,
      });
      setEditing(null);
      setNewAddr('');
      setNewBps('');
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Transaction failed' });
    }
    setSaving(false);
  };

  if (loading) return null;
  if (!data) return null;

  const w = data.wallets || {};
  const bds = data.bdWallets || [];

  const WALLET_ROWS = [
    { type: 'gamePool',      label: 'Game Pool',       icon: '🎮', desc: 'Remainder (~71%) — backs user withdrawals' },
    { type: 'creator',       label: 'Creator',         icon: '👤', desc: '2% of deposits → platform owner' },
    { type: 'few',           label: 'FEW',             icon: '🌐', desc: '5% of deposits → ecosystem fund' },
    { type: 'referralPool',  label: 'Referral Pool',   icon: '🔗', desc: '15% of deposits → referral commissions' },
    { type: 'luckyDrawPool', label: 'Lucky Draw Pool', icon: '🎰', desc: '1% of deposits → draw prize pool' },
  ];

  return (
    <div className="card-glass rounded-2xl border border-cyan/20 mt-6 overflow-hidden">
      <div className="p-5 border-b border-cyan/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="font-orbitron text-cyan text-[0.75rem] font-bold">
              ⛓ ON-CHAIN CONTRACT WALLETS
            </div>
            <div className="text-[0.6rem] text-white/40 mt-1">
              Live addresses from the Deposit V2 contract on BSC. Changes are sent as on-chain transactions.
            </div>
          </div>
          <div className="text-[0.55rem] text-white/30 font-mono">
            {data.contractAddress?.slice(0, 10)}...{data.contractAddress?.slice(-6)}
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`mx-5 mt-4 rounded-lg p-2.5 text-[0.68rem] border ${
          feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
        }`}>{feedback.message}</div>
      )}

      <div className="p-5">
        {/* Main wallets */}
        <div className="space-y-2 mb-5">
          {WALLET_ROWS.map((row) => {
            const wallet = w[row.type] || {};
            const isEditing = editing?.type === row.type && editing?.index === undefined;
            return (
              <div key={row.type} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 flex-wrap">
                <div className="w-6 text-center text-lg">{row.icon}</div>
                <div className="flex-1 min-w-[200px]">
                  <div className="font-orbitron text-[0.65rem] font-bold text-white/80">{row.label} <span className="text-white/30">({wallet.pct})</span></div>
                  <div className="text-[0.5rem] text-white/30">{row.desc}</div>
                </div>
                <div className="font-mono text-[0.6rem] text-cyan/80 flex-shrink-0">
                  {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-6)}
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => { setEditing({ type: row.type, current: wallet.address }); setNewAddr(wallet.address || ''); setFeedback(null); }}
                    className="px-2 py-1 rounded bg-gold/10 border border-gold/30 text-gold font-orbitron text-[0.5rem] hover:bg-gold/20"
                  >
                    ✏️
                  </button>
                ) : (
                  <div className="w-full mt-2 flex gap-2">
                    <input
                      value={newAddr}
                      onChange={(e) => setNewAddr(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[0.65rem] outline-none focus:border-cyan/40"
                    />
                    <button onClick={handleSave} disabled={saving}
                      className="px-3 py-2 rounded-lg bg-green/10 border border-green/40 text-green font-orbitron text-[0.55rem] font-bold hover:bg-green/20 disabled:opacity-30">
                      {saving ? '...' : '✓ SAVE'}
                    </button>
                    <button onClick={() => { setEditing(null); setFeedback(null); }}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.55rem]">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BD Wallets */}
        <div className="border-t border-white/10 pt-4">
          <div className="font-orbitron text-gold text-[0.65rem] font-bold mb-3">
            💼 24 BD WALLETS <span className="text-white/30 font-normal">({bds.reduce((s, b) => s + b.bps, 0) / 100}% total)</span>
          </div>
          <div className="max-h-[350px] overflow-y-auto rounded-lg border border-white/5">
            <table className="w-full text-[0.6rem]">
              <thead className="sticky top-0 bg-[rgba(3,0,16,0.95)]">
                <tr className="text-white/40 font-orbitron text-[0.55rem] border-b border-white/10">
                  <th className="py-2 px-3 text-left w-[40px]">#</th>
                  <th className="py-2 px-3 text-left">ADDRESS</th>
                  <th className="py-2 px-3 text-right w-[60px]">BPS</th>
                  <th className="py-2 px-3 text-right w-[50px]">%</th>
                  <th className="py-2 px-3 text-center w-[50px]">EDIT</th>
                </tr>
              </thead>
              <tbody>
                {bds.map((bd) => {
                  const isEditing = editing?.type === 'bd' && editing?.index === bd.index;
                  return (
                    <tr key={bd.index} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-3 font-orbitron text-gold">#{bd.index}</td>
                      <td className="py-2 px-3 font-mono text-cyan/70">
                        {isEditing ? (
                          <input value={newAddr} onChange={(e) => setNewAddr(e.target.value)} placeholder="0x..."
                            className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-mono text-[0.6rem] outline-none focus:border-cyan/40" />
                        ) : (
                          <span>{bd.address?.slice(0, 10)}...{bd.address?.slice(-6)}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-orbitron text-white/50">
                        {isEditing ? (
                          <input value={newBps} onChange={(e) => setNewBps(e.target.value)} type="number" placeholder="25"
                            className="w-[50px] px-1 py-1 rounded bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] outline-none text-right" />
                        ) : bd.bps}
                      </td>
                      <td className="py-2 px-3 text-right text-white/30">{bd.pct}</td>
                      <td className="py-2 px-3 text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <button onClick={handleSave} disabled={saving}
                              className="px-1.5 py-0.5 rounded bg-green/10 border border-green/30 text-green text-[0.5rem] disabled:opacity-30">
                              {saving ? '..' : '✓'}
                            </button>
                            <button onClick={() => { setEditing(null); setFeedback(null); }}
                              className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 text-[0.5rem]">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditing({ type: 'bd', index: bd.index, current: bd.address }); setNewAddr(bd.address || ''); setNewBps(String(bd.bps)); setFeedback(null); }}
                            className="px-1.5 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold text-[0.5rem] hover:bg-gold/20">
                            ✏️
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
