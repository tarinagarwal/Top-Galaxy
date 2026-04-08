import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';

const CATEGORY_LABELS = {
  Game: '🎯 Game',
  Practice: '🎮 Practice',
  Activation: '🔓 Activation',
  Cashback: '🛡️ Cashback',
  ROI: '🔄 ROI on ROI',
  Referral: '⭐ Referral',
  Club: '🏆 Club Income',
  LuckyDraw: '🎰 Lucky Draw',
  Withdrawal: '💸 Withdrawal',
  PracticeReferral: '🎁 Practice Referral',
  Admin: '🛡️ Admin Wallet',
  Other: '⚙️ Other',
};

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
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
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
            />
          ))}
          {Object.keys(filteredConfig).length === 0 && (
            <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
              No config keys match "{search}"
            </div>
          )}
        </div>
      )}

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
            onEdit={onEdit}
            onCancel={onCancel}
            onRequestSave={onRequestSave}
            onConfirmSave={onConfirmSave}
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
}) {
  const isEditing = pending !== undefined;
  const displayValue = isEditing ? pending : value;

  // Determine input type based on current value type
  const inputType = typeof value === 'number' ? 'number' : 'text';

  return (
    <div className="p-3 hover:bg-white/3">
      <div className="flex items-start gap-3 flex-wrap md:flex-nowrap">
        <div className="flex-1 min-w-[200px]">
          <div className="font-orbitron text-[0.65rem] text-white/80">{configKey}</div>
          <div className="text-[0.55rem] text-white/30 font-orbitron mt-0.5">
            Current: <span className="text-cyan">{JSON.stringify(value)}</span> · Type:{' '}
            <span className="text-purple">{typeof value}</span>
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
                className="px-3 py-1.5 rounded-lg bg-green/10 border border-green/40 text-green font-orbitron text-[0.55rem] font-bold hover:bg-green/20 disabled:opacity-50"
              >
                {isSaving ? '⏳' : '✓ CONFIRM'}
              </button>
              <button
                onClick={() => onCancel(configKey)}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.55rem]"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRequestSave(configKey)}
              className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/40 text-gold font-orbitron text-[0.55rem] font-bold hover:bg-gold/20"
            >
              💾 SAVE
            </button>
          )}
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
