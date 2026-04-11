import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';
import { fmt } from '../../lib/format';

const TABS = [
  { key: 'tickets', label: '🎟️ ALL TICKETS', active: 'bg-cyan/10 border-cyan/40 text-cyan' },
  { key: 'wins', label: '🏆 WINS', active: 'bg-green/10 border-green/40 text-green' },
  { key: 'losses', label: '❌ LOSSES', active: 'bg-pink/10 border-pink/40 text-pink' },
  { key: 'autofund', label: '⚡ AUTO-FUND', active: 'bg-purple/10 border-purple/40 text-purple' },
  { key: 'distribution', label: '💰 REVENUE SPLIT', active: 'bg-gold/10 border-gold/40 text-gold' },
  { key: 'draws', label: '📜 ALL DRAWS', active: 'bg-white/10 border-white/30 text-white' },
];

export default function AdminLuckyDrawHistory() {
  const [tab, setTab] = useState('tickets');
  // Top-level pool selector — applies to EVERY tab so golden/silver data
  // never bleeds into the same view.
  const [drawType, setDrawType] = useState('GOLDEN');

  return (
    <AdminLayout>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="font-orbitron text-[0.68rem] tracking-[0.3em] text-pink uppercase mb-1">
            🛡️ ADMIN
          </div>
          <h1 className="font-russo text-[2rem] text-gradient-gold">Lucky Draw — Full History</h1>
          <p className="text-white/40 text-[0.7rem] mt-1">
            Platform-wide drill-down of every ticket, win, loss, auto-fund credit and revenue split.
          </p>
        </div>
        <Link
          to="/admin/luckydraw"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.65rem] hover:border-gold/30 hover:text-gold"
        >
          ← BACK TO LUCKY DRAW
        </Link>
      </div>

      {/* Pool selector — GOLDEN vs SILVER */}
      <div className="card-glass rounded-2xl p-2 mb-3 border border-white/10 flex gap-2 items-center flex-wrap">
        <span className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.15em] px-2">POOL:</span>
        <button
          onClick={() => setDrawType('GOLDEN')}
          className={`px-5 py-2 rounded-lg font-orbitron text-[0.7rem] font-bold border transition-all ${
            drawType === 'GOLDEN'
              ? 'bg-gold/15 border-gold/50 text-gold shadow-lg shadow-gold/10'
              : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20'
          }`}
        >
          🏆 GOLDEN
        </button>
        <button
          onClick={() => setDrawType('SILVER')}
          className={`px-5 py-2 rounded-lg font-orbitron text-[0.7rem] font-bold border transition-all ${
            drawType === 'SILVER'
              ? 'bg-white/10 border-white/40 text-white shadow-lg shadow-white/5'
              : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'
          }`}
        >
          🥈 SILVER
        </button>
        <div className="text-[0.55rem] text-white/30 font-orbitron ml-auto pr-2">
          Showing <span className={drawType === 'GOLDEN' ? 'text-gold' : 'text-white/70'}>{drawType}</span> pool data only
        </div>
      </div>

      {/* Tab bar */}
      <div className="card-glass rounded-2xl p-2 mb-4 border border-white/10 flex gap-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-orbitron text-[0.65rem] font-bold border transition-all ${
              tab === t.key
                ? t.active
                : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tickets' && <AllTicketsTab drawType={drawType} />}
      {tab === 'wins' && <WinsTab drawType={drawType} />}
      {tab === 'losses' && <LossesTab drawType={drawType} />}
      {tab === 'autofund' && <AutoFundTab drawType={drawType} />}
      {tab === 'distribution' && <RevenueSplitTab drawType={drawType} />}
      {tab === 'draws' && <AllDrawsTab drawType={drawType} />}
    </AdminLayout>
  );
}

// ============================================================================
// TAB: All Tickets
// ============================================================================
function AllTicketsTab({ drawType }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reset to page 1 whenever the pool changes so admin doesn't end up
  // on a page number that doesn't exist in the new pool
  useEffect(() => { setPage(1); }, [drawType]);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/luckydraw/all-tickets?page=${page}&pageSize=100&type=${drawType}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, drawType]);

  const tickets = data?.tickets || [];
  const summary = data?.summary || {};
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 100));

  return (
    <div className="card-glass rounded-2xl p-5 border border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="TOTAL TICKETS" value={total} color="cyan" type="count" />
        <Stat label="MANUAL BUYS" value={summary.manual} color="gold" type="count" />
        <Stat label="AUTO BUYS" value={summary.auto} color="purple" type="count" />
        <Stat label="TOTAL REVENUE" value={(summary.manualAmount || 0) + (summary.autoAmount || 0)} color="green" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">No tickets</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.6rem] tracking-[0.1em]">
                  <th className="py-2 px-3">DATE/TIME</th>
                  <th className="py-2 px-3">USER</th>
                  <th className="py-2 px-3">REF CODE</th>
                  <th className="py-2 px-3">DRAW</th>
                  <th className="py-2 px-3 text-center">TICKET #</th>
                  <th className="py-2 px-3 text-right">AMOUNT</th>
                  <th className="py-2 px-3">SOURCE</th>
                  <th className="py-2 px-3 text-center">OUTCOME</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const draw = t.drawId || {};
                  const isGolden = draw.type === 'GOLDEN';
                  const isAuto = t.purchaseType === 'AUTO_CASHBACK';
                  const out = t.outcome || 'PENDING';
                  return (
                    <tr key={t._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-3 font-orbitron text-white/60 text-[0.6rem]">
                        {new Date(t.purchasedAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-orbitron text-white/70">
                        {t.userId?.walletAddress
                          ? `${t.userId.walletAddress.slice(0, 6)}...${t.userId.walletAddress.slice(-4)}`
                          : '—'}
                      </td>
                      <td className="py-2 px-3 font-orbitron text-cyan">{t.userId?.referralCode || '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.55rem] ${
                          isGolden ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/70'
                        }`}>
                          {isGolden ? '🏆' : '🥈'} {draw.type} #{draw.drawNumber}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-orbitron text-white text-center">#{t.ticketNumber}</td>
                      <td className="py-2 px-3 font-orbitron text-gold text-right font-bold">{fmt(t.amount, 2)}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.55rem] ${
                          isAuto ? 'bg-purple/10 border-purple/30 text-purple' : 'bg-cyan/10 border-cyan/30 text-cyan'
                        }`}>
                          {isAuto ? '⚡ AUTO' : '🖱️ MANUAL'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {out === 'WIN' ? (
                          <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/30 text-green font-orbitron text-[0.5rem]">🏆 WIN {t.prizeAmount ? `+${fmt(t.prizeAmount, 0)}` : ''}</span>
                        ) : out === 'LOSS' ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.5rem]">LOSS</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-orbitron text-[0.5rem]">PENDING</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ============================================================================
// TAB: Wins
// ============================================================================
// Prize brackets — matches server `goldenPrizes` table at admin.js
// Same 8 brackets; Silver values shown are Golden ÷ 10.
const PRIZE_BRACKETS = [
  { key: 1, label: 'Rank 1',        golden: 10000, silver: 1000, count: 1,   ranks: '#1' },
  { key: 2, label: 'Rank 2',        golden: 5000,  silver: 500,  count: 1,   ranks: '#2' },
  { key: 3, label: 'Rank 3',        golden: 4000,  silver: 400,  count: 1,   ranks: '#3' },
  { key: 4, label: 'Ranks 4–10',    golden: 1000,  silver: 100,  count: 7,   ranks: '#4–10' },
  { key: 5, label: 'Ranks 11–50',   golden: 300,   silver: 30,   count: 40,  ranks: '#11–50' },
  { key: 6, label: 'Ranks 51–100',  golden: 120,   silver: 12,   count: 50,  ranks: '#51–100' },
  { key: 7, label: 'Ranks 101–500', golden: 40,    silver: 4,    count: 400, ranks: '#101–500' },
  { key: 8, label: 'Ranks 501–1000',golden: 20,    silver: 2,    count: 500, ranks: '#501–1000' },
];

function WinsTab({ drawType }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bracket, setBracket] = useState(0); // 0 = ALL brackets, 1..8 = specific

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [drawType, bracket]);

  useEffect(() => {
    setLoading(true);
    const bracketParam = bracket > 0 ? `&bracket=${bracket}` : '';
    api.get(`/api/admin/luckydraw/all-tickets?page=${page}&pageSize=100&type=${drawType}&outcome=WIN${bracketParam}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, drawType, bracket]);

  const wins = data?.tickets || [];
  const total = data?.total || 0; // count of wins in the current (filtered) subset
  const lifetimePrize = data?.summary?.outcomeTotals?.totalPrize || 0;
  const totalPages = Math.max(1, Math.ceil(total / 100));
  const prizeKey = drawType === 'SILVER' ? 'silver' : 'golden';

  return (
    <div className="card-glass rounded-2xl p-5 border border-green/20">
      {/* Prize bracket filter — 8 tiers + ALL */}
      <div className="mb-4">
        <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.15em] mb-2">
          PRIZE BRACKET:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBracket(0)}
            className={`px-3 py-2 rounded-lg font-orbitron text-[0.6rem] font-bold border transition-all ${
              bracket === 0
                ? 'bg-green/15 border-green/50 text-green'
                : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            ⚪ ALL WINNERS <span className="text-white/40 ml-1">(1000)</span>
          </button>
          {PRIZE_BRACKETS.map((b) => {
            const isActive = bracket === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setBracket(b.key)}
                className={`px-3 py-2 rounded-lg font-orbitron text-[0.6rem] font-bold border transition-all text-left ${
                  isActive
                    ? 'bg-gold/15 border-gold/50 text-gold'
                    : 'bg-white/3 border-white/10 text-white/40 hover:border-gold/20'
                }`}
                title={`${b.label} — ${b.count} winner${b.count > 1 ? 's' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={isActive ? 'text-gold' : 'text-white/60'}>{b.ranks}</span>
                  <span className={isActive ? 'text-gold font-bold' : 'text-green/70'}>
                    ${b[prizeKey].toLocaleString()}
                  </span>
                  <span className="text-white/30 text-[0.5rem]">×{b.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label={bracket > 0 ? 'WINS IN BRACKET' : 'TOTAL WINS'} value={total} color="green" type="count" />
        <Stat label={bracket > 0 ? 'BRACKET PRIZE SUM' : 'LIFETIME PRIZE PAID'} value={lifetimePrize} color="gold" />
        <Stat label="AVG PRIZE" value={total > 0 ? lifetimePrize / total : 0} color="cyan" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Loading...</div>
      ) : wins.length === 0 ? (
        <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">
          {bracket > 0
            ? `No wins in this bracket yet for ${drawType} pool.`
            : `No wins in ${drawType} pool yet. Wins appear once a draw is RESULTED.`}
        </div>
      ) : (
        <>
          <TicketsTable tickets={wins} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ============================================================================
// TAB: Losses
// ============================================================================
function LossesTab({ drawType }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(1); }, [drawType]);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/luckydraw/all-tickets?page=${page}&pageSize=100&type=${drawType}&outcome=LOSS`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, drawType]);

  const losses = data?.tickets || [];
  const total = data?.total || 0; // lifetime loss count (server-side, post-filter)
  const totalLossAmount = data?.summary?.outcomeTotals?.totalLossAmount || 0;
  const totalPages = Math.max(1, Math.ceil(total / 100));

  return (
    <div className="card-glass rounded-2xl p-5 border border-pink/20">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="TOTAL LOSSES" value={total} color="pink" type="count" />
        <Stat label="TOTAL LOSS AMOUNT" value={totalLossAmount} color="pink" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Loading...</div>
      ) : losses.length === 0 ? (
        <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">
          No losses in {drawType} pool yet.
        </div>
      ) : (
        <>
          <TicketsTable tickets={losses} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ============================================================================
// TAB: Auto-Fund
// ============================================================================
function AutoFundTab({ drawType }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(1); }, [drawType]);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/luckydraw/autofund-history?page=${page}&pageSize=100&type=${drawType}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, drawType]);

  const txs = data?.transactions || [];
  const summary = data?.summary || {};
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 100));

  // Only the active pool's total is relevant since we filter server-side.
  const poolTotal = drawType === 'GOLDEN' ? (summary.goldenTotal || 0) : (summary.silverTotal || 0);
  const poolCount = drawType === 'GOLDEN' ? (summary.goldenCount || 0) : (summary.silverCount || 0);

  return (
    <div className="card-glass rounded-2xl p-5 border border-purple/20">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <Stat label={`${drawType} FUNDED`} value={poolTotal} color={drawType === 'GOLDEN' ? 'gold' : 'silver'} />
        <Stat label="CREDIT COUNT" value={poolCount} color="purple" type="count" />
        <Stat label="UNIQUE USERS" value={summary.uniqueUsers} color="cyan" type="count" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Loading...</div>
      ) : txs.length === 0 ? (
        <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">No auto-fund credits yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-orbitron text-[0.6rem] tracking-[0.1em]">
                  <th className="py-2 px-3">DATE/TIME</th>
                  <th className="py-2 px-3">USER</th>
                  <th className="py-2 px-3">REF CODE</th>
                  <th className="py-2 px-3">TARGET</th>
                  <th className="py-2 px-3">SOURCE</th>
                  <th className="py-2 px-3 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => {
                  const isGolden = tx.toWallet === 'goldenDrawWallet';
                  const src = tx.meta?.source || 'unknown';
                  return (
                    <tr key={tx._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-3 font-orbitron text-white/60 text-[0.6rem]">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-3 font-orbitron text-white/70">
                        {tx.userId?.walletAddress ? `${tx.userId.walletAddress.slice(0, 6)}...${tx.userId.walletAddress.slice(-4)}` : '—'}
                      </td>
                      <td className="py-2 px-3 font-orbitron text-cyan">{tx.userId?.referralCode || '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.55rem] ${
                          isGolden ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/70'
                        }`}>
                          {isGolden ? '🏆 GOLDEN' : '🥈 SILVER'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.5rem] ${
                          src === 'cashback+roi' ? 'bg-purple/10 border-purple/30 text-purple'
                          : src === 'cashback' ? 'bg-green/10 border-green/30 text-green'
                          : src === 'roi' ? 'bg-cyan/10 border-cyan/30 text-cyan'
                          : 'bg-white/5 border-white/10 text-white/30'
                        }`}>
                          {src.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-orbitron text-green text-right font-bold">+{fmt(tx.amount, 4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ============================================================================
// TAB: Revenue Split (ticket distribution summary)
// ============================================================================
function RevenueSplitTab({ drawType }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/luckydraw/distribution-summary?type=${drawType}`)
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [drawType]);

  if (loading) return <div className="text-center py-8 text-white/40">Loading...</div>;
  if (!summary) return <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">No data</div>;

  const total = summary.totalTicketAmount || 0;
  const items = [
    { label: 'TOTAL REVENUE', value: total, cls: 'text-gold', pct: '100%' },
    { label: 'CREATOR', value: summary.totalCreator || 0, cls: 'text-cyan', pct: '5%' },
    { label: 'BD WALLETS (24)', value: summary.totalBD || 0, cls: 'text-purple', pct: '10%' },
    { label: 'FEW', value: summary.totalFEW || 0, cls: 'text-pink', pct: '5%' },
    { label: 'GAME POOL', value: summary.totalGamePool || 0, cls: 'text-cyan', pct: '10%' },
    { label: 'PRIZE POOL', value: summary.totalPrizePool || 0, cls: 'text-green', pct: '70%' },
  ];

  return (
    <div className="card-glass rounded-2xl p-5 border border-gold/20">
      <div className="font-orbitron text-gold text-[0.75rem] font-bold mb-3">
        💰 {drawType} TICKET REVENUE DISTRIBUTION — {summary.count || 0} purchases
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label} className="p-4 rounded-lg bg-white/3 border border-white/10">
            <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.1em]">{it.label}</div>
            <div className={`font-orbitron ${it.cls} text-[1.1rem] font-bold mt-1`}>{fmt(it.value, 3)}</div>
            <div className="text-[0.5rem] text-white/30 font-orbitron">USDT · {it.pct}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB: All Draws
// ============================================================================
function AllDrawsTab({ drawType }) {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    api.get(`/api/admin/luckydraw/all-draws?pageSize=200&type=${drawType}`)
      .then(({ data }) => setDraws(data.draws || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [drawType]);

  useEffect(() => { refresh(); }, [refresh]);

  const forceResult = async (drawId, label) => {
    if (!window.confirm(`Force-result ${label}?\n\nThis will:\n• Pick winners from tickets (deterministic via seed+blockHash)\n• Credit prizes to winner wallets\n• Mark remaining tickets as LOSS\n• SKIP on-chain writes (reconcile manually if needed)\n\nProceed?`)) return;
    setBusy(drawId);
    setFeedback(null);
    try {
      const { data } = await api.post('/api/admin/luckydraw/force-result', { drawId });
      setFeedback({ type: 'success', message: `✓ ${label} resulted. Paid ${data.paidCount}/${data.totalWinners} winners.` });
      refresh();
    } catch (err) {
      setFeedback({ type: 'error', message: `Failed: ${err?.response?.data?.error || err?.message}` });
    }
    setBusy(null);
  };

  if (loading) return <div className="text-center py-8 text-white/40">Loading...</div>;
  if (draws.length === 0) return <div className="text-center py-8 text-white/30 font-orbitron text-[0.7rem]">No draws yet</div>;

  return (
    <div className="card-glass rounded-2xl p-5 border border-white/10">
      {feedback && (
        <div className={`rounded-xl p-3 mb-4 border text-[0.7rem] ${
          feedback.type === 'success' ? 'border-green/30 bg-green/5 text-green' : 'border-pink/30 bg-pink/5 text-pink'
        }`}>
          {feedback.message}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[0.65rem]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr className="text-left text-white/40 font-orbitron text-[0.6rem] tracking-[0.1em]">
              <th className="py-2 px-3">TYPE</th>
              <th className="py-2 px-3 text-right">DRAW #</th>
              <th className="py-2 px-3">STATUS</th>
              <th className="py-2 px-3 text-right">TICKETS</th>
              <th className="py-2 px-3 text-right">PRIZE POOL</th>
              <th className="py-2 px-3 text-right">WINNERS</th>
              <th className="py-2 px-3">TRIGGERED</th>
              <th className="py-2 px-3">RESULTED</th>
              <th className="py-2 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((d) => {
              const isGolden = d.type === 'GOLDEN';
              const statusCls = {
                OPEN: 'text-cyan',
                ACTIVATED: 'text-green',
                PAUSED: 'text-yellow-400',
                TRIGGERED: 'text-gold',
                RESULTED: 'text-green',
                CANCELLED: 'text-pink',
              }[d.status] || 'text-white/40';
              const stuck = d.status === 'TRIGGERED' && (!d.winners || d.winners.length === 0);
              return (
                <tr key={d._id} className={`border-b border-white/5 hover:bg-white/3 ${stuck ? 'bg-pink/5' : ''}`}>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.55rem] ${
                      isGolden ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/70'
                    }`}>
                      {isGolden ? '🏆 GOLDEN' : '🥈 SILVER'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-orbitron text-white text-right">#{d.drawNumber}</td>
                  <td className={`py-2 px-3 font-orbitron ${statusCls}`}>
                    {d.status}
                    {stuck && <span className="ml-2 text-pink text-[0.55rem]">⚠ STUCK</span>}
                  </td>
                  <td className="py-2 px-3 font-orbitron text-white/60 text-right">
                    {d.ticketsSold}/{d.totalTickets}
                  </td>
                  <td className="py-2 px-3 font-orbitron text-gold text-right">{fmt(d.prizePool || d.totalPool || 0, 0)}</td>
                  <td className="py-2 px-3 font-orbitron text-green text-right">
                    {d.winners?.length || 0}
                  </td>
                  <td className="py-2 px-3 font-orbitron text-white/40 text-[0.6rem]">
                    {d.triggeredAt ? new Date(d.triggeredAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-3 font-orbitron text-white/40 text-[0.6rem]">
                    {d.resultedAt ? new Date(d.resultedAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {stuck ? (
                      <button
                        onClick={() => forceResult(d._id, `${d.type} #${d.drawNumber}`)}
                        disabled={busy === d._id}
                        className="px-2 py-1 rounded-lg bg-pink/10 border border-pink/40 text-pink font-orbitron text-[0.55rem] font-bold hover:bg-pink/20 disabled:opacity-40"
                      >
                        {busy === d._id ? '...' : '⚡ FORCE RESULT'}
                      </button>
                    ) : (
                      <span className="text-white/20 text-[0.55rem]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Shared: tickets table (reused by wins/losses tabs)
// ============================================================================
function TicketsTable({ tickets }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.65rem]">
        <thead className="bg-white/5 border-b border-white/10">
          <tr className="text-left text-white/40 font-orbitron text-[0.6rem] tracking-[0.1em]">
            <th className="py-2 px-3">DATE/TIME</th>
            <th className="py-2 px-3">USER</th>
            <th className="py-2 px-3">DRAW</th>
            <th className="py-2 px-3 text-center">TICKET #</th>
            <th className="py-2 px-3 text-right">COST</th>
            <th className="py-2 px-3 text-right">PRIZE</th>
            <th className="py-2 px-3 text-center">OUTCOME</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const draw = t.drawId || {};
            const isGolden = draw.type === 'GOLDEN';
            const isWin = t.outcome === 'WIN';
            return (
              <tr key={t._id} className={`border-b border-white/5 ${isWin ? 'bg-green/3' : 'bg-pink/3'}`}>
                <td className="py-2 px-3 font-orbitron text-white/60 text-[0.6rem]">{new Date(t.purchasedAt).toLocaleString()}</td>
                <td className="py-2 px-3 font-orbitron text-white/70">
                  {t.userId?.walletAddress ? `${t.userId.walletAddress.slice(0, 6)}...${t.userId.walletAddress.slice(-4)}` : '—'}
                </td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded-full border font-orbitron text-[0.55rem] ${
                    isGolden ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/20 text-white/70'
                  }`}>
                    {isGolden ? '🏆' : '🥈'} {draw.type} #{draw.drawNumber}
                  </span>
                </td>
                <td className="py-2 px-3 font-orbitron text-white text-center">#{t.ticketNumber}</td>
                <td className="py-2 px-3 font-orbitron text-gold text-right">{fmt(t.amount, 2)}</td>
                <td className="py-2 px-3 font-orbitron text-green text-right font-bold">
                  {isWin ? `+${fmt(t.prizeAmount || 0, 2)}` : '—'}
                </td>
                <td className="py-2 px-3 text-center">
                  {isWin ? (
                    <span className="px-2 py-0.5 rounded-full bg-green/10 border border-green/30 text-green font-orbitron text-[0.5rem]">🏆 WIN</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.5rem]">LOSS</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, color, type = 'usdt' }) {
  const c = { gold: 'text-gold', green: 'text-green', cyan: 'text-cyan', purple: 'text-purple', pink: 'text-pink', silver: 'text-white/70' }[color];
  return (
    <div className="p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="text-[0.5rem] text-white/40 font-orbitron tracking-[0.1em]">{label}</div>
      <div className={`font-orbitron ${c} text-[1rem] font-bold mt-1`}>
        {type === 'count' ? (value || 0) : fmt(value || 0, 2)}
      </div>
      {type !== 'count' && <div className="text-[0.5rem] text-white/30 font-orbitron">USDT</div>}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 p-3 mt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
      >
        PREV
      </button>
      <span className="font-orbitron text-[0.65rem] text-white/40">{page} / {totalPages}</span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
      >
        NEXT
      </button>
    </div>
  );
}
