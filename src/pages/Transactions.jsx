import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { fmt } from '../lib/format';

// All transaction types from the PRD, mapped to display metadata.
// direction: +1 = credit to user, -1 = debit from user, 0 = neutral/info
const TX_TYPES = [
  { key: 'DEPOSIT', label: 'Deposit', color: 'green', direction: +1 },
  { key: 'WITHDRAWAL', label: 'Withdrawal', color: 'pink', direction: -1 },
  { key: 'GAME_ENTRY', label: 'Game Entry', color: 'cyan', direction: -1 },
  { key: 'GAME_WIN_DIRECT', label: 'Game Win (Direct)', color: 'gold', direction: +1 },
  { key: 'GAME_WIN_COMPOUND', label: 'Game Win (Compound)', color: 'gold', direction: +1 },
  { key: 'GAME_LOSS', label: 'Game Loss', color: 'pink', direction: -1 },
  { key: 'PRACTICE_GAME_ENTRY', label: 'Practice Entry', color: 'silver', direction: -1 },
  { key: 'PRACTICE_GAME_WIN', label: 'Practice Win', color: 'silver', direction: +1 },
  { key: 'PRACTICE_GAME_LOSS', label: 'Practice Loss', color: 'silver', direction: -1 },
  { key: 'REFERRAL_COMMISSION', label: 'Referral Commission', color: 'cyan', direction: +1 },
  { key: 'WINNERS_REFERRAL_COMMISSION', label: 'Winners Referral', color: 'pink', direction: +1 },
  { key: 'CASHBACK_DAILY', label: 'Cashback', color: 'green', direction: +1 },
  { key: 'ROI_ON_ROI', label: 'ROI on ROI', color: 'purple', direction: +1 },
  { key: 'CLUB_INCOME', label: 'Club Income', color: 'gold', direction: +1 },
  { key: 'LUCKY_DRAW_ENTRY', label: 'Lucky Draw Ticket', color: 'cyan', direction: -1 },
  { key: 'LUCKY_DRAW_WIN', label: 'Lucky Draw Win', color: 'gold', direction: +1 },
  { key: 'PRACTICE_REFERRAL_REWARD', label: 'Practice Referral', color: 'silver', direction: +1 },
  { key: 'SUSTAINABILITY_FEE', label: 'Sustainability Fee', color: 'pink', direction: -1 },
  { key: 'PRACTICE_TO_REAL_CONVERSION', label: 'Practice → Real', color: 'green', direction: 0 },
  { key: 'LUCKY_DRAW_AUTO_FUND', label: 'Lucky Draw Auto-Fund', color: 'purple', direction: 0 },
];

const TX_LOOKUP = Object.fromEntries(TX_TYPES.map((t) => [t.key, t]));

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 30 };
      if (type) params.type = type;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/api/user/transactions', { params });
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, type, from, to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / 30));

  const clearFilters = () => {
    setType('');
    setFrom('');
    setTo('');
    setPage(1);
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
              📜 TRANSACTION LEDGER
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
              Transactions
            </h1>
            <p className="text-white/40 text-[0.75rem] mt-1">
              Complete history of every credit and debit on your account · {total} total
            </p>
          </div>

          {/* Filters */}
          <div className="card-glass rounded-2xl p-4 mb-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
                  TYPE
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
                >
                  <option value="">ALL TYPES</option>
                  {TX_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
                  FROM
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
                  TO
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.6rem] focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] hover:border-gold/30 hover:text-gold"
                >
                  CLEAR FILTERS
                </button>
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[0.65rem]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                      <th className="py-3 px-3">DATE / TIME</th>
                      <th className="py-3 px-3">TYPE</th>
                      <th className="py-3 px-3 text-right">AMOUNT</th>
                      <th className="py-3 px-3">WALLET</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3 text-right">LINK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t) => (
                      <TransactionRow key={t._id} t={t} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
              >
                ← PREV
              </button>
              <span className="font-orbitron text-[0.65rem] text-white/50 px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ t }) {
  const meta = TX_LOOKUP[t.type] || { label: t.type, color: 'white', direction: 0 };
  const colorClass = {
    gold: 'bg-gold/10 border-gold/30 text-gold',
    cyan: 'bg-cyan/10 border-cyan/30 text-cyan',
    green: 'bg-green/10 border-green/30 text-green',
    pink: 'bg-pink/10 border-pink/30 text-pink',
    purple: 'bg-purple/10 border-purple/30 text-purple',
    silver: 'bg-silver/10 border-silver/30 text-silver',
    white: 'bg-white/5 border-white/20 text-white/60',
  }[meta.color] || 'bg-white/5 border-white/20 text-white/60';

  const amountColor =
    meta.direction === +1 ? 'text-green' : meta.direction === -1 ? 'text-pink' : 'text-white/60';
  const amountSign = meta.direction === +1 ? '+' : meta.direction === -1 ? '−' : '';

  // Wallet column: toWallet for credits, fromWallet for debits
  const wallet = t.toWallet || t.fromWallet || '—';

  return (
    <tr className="border-b border-white/5 hover:bg-white/3">
      <td className="py-2.5 px-3 font-orbitron text-white/50 text-[0.55rem] whitespace-nowrap">
        {new Date(t.createdAt).toLocaleString()}
      </td>
      <td className="py-2.5 px-3">
        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.5rem] whitespace-nowrap ${colorClass}`}>
          {meta.label}
        </span>
      </td>
      <td className={`py-2.5 px-3 font-orbitron text-right ${amountColor}`}>
        {amountSign}
        {fmt(t.amount)}
      </td>
      <td className="py-2.5 px-3 font-orbitron text-white/40 text-[0.55rem]">{wallet}</td>
      <td className="py-2.5 px-3">
        {t.status ? (
          <span
            className={`px-1.5 py-0.5 rounded font-orbitron text-[0.5rem] ${
              t.status === 'COMPLETED'
                ? 'text-green'
                : t.status === 'FAILED'
                ? 'text-pink'
                : 'text-yellow-400'
            }`}
          >
            {t.status}
          </span>
        ) : (
          <span className="text-white/20">—</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-right">
        {t.txHash ? (
          <a
            href={`https://testnet.bscscan.com/tx/${t.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan font-orbitron text-[0.55rem] hover:text-gold underline"
          >
            BSCScan ↗
          </a>
        ) : (
          <span className="text-white/20">—</span>
        )}
      </td>
    </tr>
  );
}
