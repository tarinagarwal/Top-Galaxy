import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { useSocket } from '../hooks/useSocket';
import { fmt, num } from '../lib/format';

const PRIZE_TIERS = [
  { rank: '1st', goldenPrize: 10000, silverPrize: 1000, winners: 1 },
  { rank: '2nd', goldenPrize: 5000, silverPrize: 500, winners: 1 },
  { rank: '3rd', goldenPrize: 4000, silverPrize: 400, winners: 1 },
  { rank: '4th–10th', goldenPrize: 1000, silverPrize: 100, winners: 7 },
  { rank: '11th–50th', goldenPrize: 300, silverPrize: 30, winners: 40 },
  { rank: '51st–100th', goldenPrize: 120, silverPrize: 12, winners: 50 },
  { rank: '101st–500th', goldenPrize: 40, silverPrize: 4, winners: 400 },
  { rank: '501st–1,000th', goldenPrize: 20, silverPrize: 2, winners: 500 },
];

export default function LuckyDraw() {
  const [status, setStatus] = useState({ golden: null, silver: null });
  const [myTickets, setMyTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [winModal, setWinModal] = useState(null); // { type, prize, rank, ticketNumber }
  const [showPrizes, setShowPrizes] = useState(false);
  const [cashbackStats, setCashbackStats] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [s, t, h, c, ms] = await Promise.all([
        api.get('/api/luckydraw/status'),
        api.get('/api/luckydraw/my-tickets'),
        api.get('/api/luckydraw/history?pageSize=10'),
        api.get('/api/cashback/status').catch(() => null),
        api.get('/api/luckydraw/my-stats').catch(() => null),
      ]);
      setStatus(s.data);
      setMyTickets(t.data.tickets || []);
      setHistory(h.data.draws || []);
      setCashbackStats(c?.data || null);
      if (ms?.data) setMyStats(ms.data);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000); // poll every 10s as fallback
    return () => clearInterval(id);
  }, [refresh]);

  // Live socket updates (including timer events)
  useSocket({
    'draw:ticket': () => refresh(),
    'draw:triggered': () => refresh(),
    'draw:timerStarted': () => refresh(),
    'draw:timerPaused': () => refresh(),
    'draw:timerResumed': () => refresh(),
    'draw:timerUpdated': () => refresh(),
    'draw:cancelled': () => refresh(),
    'draw:winner': (data) => {
      setWinModal(data);
      refresh();
    },
  });

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />

      {/* Win celebration modal */}
      {winModal && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setWinModal(null)}
        >
          <div
            className="card-glass rounded-3xl p-10 border-2 border-gold/50 text-center max-w-[500px] animate-pulse"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[5rem] mb-3">🏆</div>
            <div className="font-russo text-[2.4rem] text-gradient-gold mb-2">
              YOU WON!
            </div>
            <div className="font-orbitron text-[0.7rem] text-cyan tracking-[0.15em] mb-4">
              {winModal.type} DRAW · #{winModal.drawNumber}
            </div>
            <div className="font-russo text-[3.5rem] text-gold leading-none mb-2">
              {fmt(winModal.prize)}
            </div>
            <div className="font-orbitron text-[0.7rem] text-white/40 mb-4">USDT</div>
            <div className="text-[0.7rem] text-white/50">
              Rank #{winModal.rank} · Ticket #{winModal.ticketNumber}
            </div>
            <button
              onClick={() => setWinModal(null)}
              className="mt-6 px-8 py-3 rounded-full font-orbitron text-[0.7rem] font-bold tracking-[0.12em] bg-gradient-to-br from-gold to-gold2 text-black hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
            >
              CLAIM ✦
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-2">
              🎰 JACKPOT GALAXY
            </div>
            <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
              Lucky Draw
            </h1>
            <p className="text-white/40 text-[0.75rem] mt-2 max-w-[600px]">
              10,000 tickets per draw · 1,000 winners · 10% win odds. Auto-funded daily from your cashback + ROI on ROI.
            </p>
          </div>

          {/* My Stats — 7 summary cards */}
          {myStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <LDStatCard label="TOTAL TICKETS" value={myStats.totalTickets} icon="🎫" color="cyan" isCount />
              <LDStatCard label="TOTAL SPENT" value={myStats.totalSpent} icon="💸" color="pink" />
              <LDStatCard label="WINS" value={myStats.wins} icon="🏆" color="gold" isCount />
              <LDStatCard label="WON AMOUNT" value={myStats.winAmount} icon="💰" color="green" />
              <LDStatCard label="LOSSES" value={myStats.losses} icon="❌" color="pink" isCount />
              <LDStatCard label="LOST AMOUNT" value={myStats.lossAmount} icon="📉" color="pink" />
              <LDStatCard
                label="NET P/L"
                value={myStats.netPL}
                icon={myStats.netPL >= 0 ? '📈' : '📉'}
                color={myStats.netPL >= 0 ? 'green' : 'pink'}
              />
            </div>
          )}

          {/* Two side-by-side draw cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <DrawCard
              draw={status.golden}
              type="GOLDEN"
              icon="🏆"
              accent="gold"
              onPurchased={refresh}
            />
            <DrawCard
              draw={status.silver}
              type="SILVER"
              icon="🥈"
              accent="silver"
              onPurchased={refresh}
            />
          </div>

          {/* Auto-fund estimate (based on user's projected daily cashback) */}
          <AutoFundEstimate cashbackStats={cashbackStats} myStats={myStats} />

          {/* Auto-fund history — shows daily 20% credits */}
          <AutoFundHistory />

          {/* Prize tiers table */}
          <div className="card-glass rounded-2xl p-6 mb-6 border border-gold/20">
            <button
              onClick={() => setShowPrizes((v) => !v)}
              className="w-full flex items-center justify-between font-orbitron text-gold text-[0.75rem] font-bold"
            >
              <span>📊 PRIZE TIER TABLE</span>
              <span className="text-[0.6rem]">{showPrizes ? '▲ HIDE' : '▼ SHOW'}</span>
            </button>

            {showPrizes && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-[0.7rem]">
                  <thead>
                    <tr className="text-left text-white/40 font-orbitron text-[0.68rem] tracking-[0.1em] border-b border-white/10">
                      <th className="py-2 px-2">RANK</th>
                      <th className="py-2 px-2 text-right">GOLDEN PRIZE</th>
                      <th className="py-2 px-2 text-right">SILVER PRIZE</th>
                      <th className="py-2 px-2 text-right">WINNERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRIZE_TIERS.map((t) => (
                      <tr key={t.rank} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2 px-2 font-orbitron text-white/70">{t.rank}</td>
                        <td className="py-2 px-2 font-orbitron text-gold text-right">
                          {fmt(t.goldenPrize, 0)} USDT
                        </td>
                        <td className="py-2 px-2 font-orbitron text-silver text-right">
                          {fmt(t.silverPrize, 0)} USDT
                        </td>
                        <td className="py-2 px-2 font-orbitron text-white/40 text-right">
                          {t.winners}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gold/5">
                      <td className="py-3 px-2 font-orbitron text-gold font-bold">TOTAL</td>
                      <td className="py-3 px-2 font-orbitron text-gold text-right font-bold">
                        70,000 USDT
                      </td>
                      <td className="py-3 px-2 font-orbitron text-silver text-right font-bold">
                        7,000 USDT
                      </td>
                      <td className="py-3 px-2 font-orbitron text-white text-right font-bold">
                        1,000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabbed history section */}
          <HistoryTabs myTickets={myTickets} history={history} />

          {/* Full History link */}
          <Link
            to="/lucky-draw/history"
            className="mt-6 block card-glass rounded-2xl p-5 text-center border border-purple/20 hover:border-purple/40 transition-all"
          >
            <div className="font-orbitron text-purple text-[0.75rem] font-bold">
              📊 VIEW FULL LUCKY DRAW HISTORY
            </div>
            <div className="text-[0.65rem] text-white/30 mt-1">
              All Tickets · Wins · Losses · Stats · P&L
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AutoFundEstimate({ cashbackStats, myStats }) {
  // Auto-fund formula: 20% of (daily cashback + ROI on ROI received) split equally to Golden + Silver wallets
  const dailyCashback = cashbackStats?.estimatedDailyAmount || 0;
  const totalAutoFund = dailyCashback * 0.2;
  const halfFund = totalAutoFund / 2;
  const eligible = cashbackStats?.eligible;

  return (
    <div className="card-glass rounded-2xl p-6 mb-6 border border-purple/20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="font-orbitron text-purple text-[0.75rem] font-bold mb-1">
            ⚡ AUTO-FUND STATUS
          </div>
          <div className="text-[0.65rem] text-white/40 leading-relaxed">
            Lucky Draw pools are funded from <strong className="text-white/60">3 sources</strong>:
          </div>
          <ul className="text-[0.6rem] text-white/40 mt-2 space-y-1 list-none">
            <li className="flex items-start gap-2">
              <span className="text-gold">1.</span>
              <span><strong className="text-white/60">1% of every deposit</strong> — split equally to Golden & Silver prize pools instantly on-chain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">2.</span>
              <span><strong className="text-white/60">20% of daily cashback + ROI on ROI</strong> — auto-credited to your draw wallets at 00:01 daily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">3.</span>
              <span><strong className="text-white/60">70% of ticket revenue</strong> — from every ticket purchased across all draws</span>
            </li>
          </ul>
          {!eligible && (
            <div className="mt-2 text-[0.6rem] text-pink font-orbitron">
              ⚠️ Auto-fund inactive — requires PRO activation + 100+ effective net loss
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center px-3 py-2 rounded-lg bg-gold/5 border border-gold/20">
            <div className="text-[0.6rem] font-orbitron text-white/30 tracking-[0.1em]">
              GOLDEN/DAY
            </div>
            <div className="font-orbitron text-gold text-[0.85rem] font-bold">
              +{fmt(halfFund, 4)}
            </div>
            <div className="text-[0.6rem] text-white/30">from cashback+ROI</div>
          </div>
          <div className="text-center px-3 py-2 rounded-lg bg-white/3 border border-white/10">
            <div className="text-[0.6rem] font-orbitron text-white/30 tracking-[0.1em]">
              SILVER/DAY
            </div>
            <div className="font-orbitron text-white/60 text-[0.85rem] font-bold">
              +{fmt(halfFund, 4)}
            </div>
            <div className="text-[0.6rem] text-white/30">from cashback+ROI</div>
          </div>
          <div className="text-center px-3 py-2 rounded-lg bg-gold/5 border border-gold/20">
            <div className="text-[0.6rem] font-orbitron text-white/30 tracking-[0.1em]">
              GOLDEN FROM DEPOSITS
            </div>
            <div className="font-orbitron text-gold text-[0.85rem] font-bold">
              {fmt(myStats?.goldenFromDeposits || 0)}
            </div>
            <div className="text-[0.6rem] text-white/30">1% of your deposits</div>
          </div>
          <div className="text-center px-3 py-2 rounded-lg bg-white/3 border border-white/10">
            <div className="text-[0.6rem] font-orbitron text-white/30 tracking-[0.1em]">
              SILVER FROM DEPOSITS
            </div>
            <div className="font-orbitron text-white/60 text-[0.85rem] font-bold">
              {fmt(myStats?.silverFromDeposits || 0)}
            </div>
            <div className="text-[0.6rem] text-white/30">1% of your deposits</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoFundHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get('/api/luckydraw/my-autofund?pageSize=30')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  const txs = data?.transactions || [];
  const summary = data?.summary || { goldenTotal: 0, silverTotal: 0, goldenCount: 0, silverCount: 0 };
  const totalFunded = (summary.goldenTotal || 0) + (summary.silverTotal || 0);

  // Group transactions by date for a cleaner display
  const grouped = {};
  for (const tx of txs) {
    const date = new Date(tx.createdAt).toLocaleDateString();
    if (!grouped[date]) grouped[date] = { date, golden: 0, silver: 0, goldenTx: null, silverTx: null };
    if (tx.toWallet === 'goldenDrawWallet') {
      grouped[date].golden += tx.amount;
      grouped[date].goldenTx = tx;
    } else if (tx.toWallet === 'silverDrawWallet') {
      grouped[date].silver += tx.amount;
      grouped[date].silverTx = tx;
    }
  }
  const groupedRows = Object.values(grouped);

  return (
    <div className="card-glass rounded-2xl p-6 mb-6 border border-white/10">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between font-orbitron text-white text-[0.75rem] font-bold"
      >
        <div className="flex items-center gap-2">
          <span>📜 AUTO-FUND HISTORY (20% of cashback+ROI)</span>
        </div>
        <span className="text-[0.6rem] text-white/40">{expanded ? '▲ HIDE' : '▼ SHOW'}</span>
      </button>

      {/* Summary row — always visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
          <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.12em]">TOTAL TO GOLDEN</div>
          <div className="font-orbitron text-gold text-[1rem] font-bold mt-1">+{fmt(summary.goldenTotal || 0, 4)} USDT</div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">{summary.goldenCount} credits</div>
        </div>
        <div className="p-3 rounded-lg bg-white/3 border border-white/10">
          <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.12em]">TOTAL TO SILVER</div>
          <div className="font-orbitron text-white/70 text-[1rem] font-bold mt-1">+{fmt(summary.silverTotal || 0, 4)} USDT</div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">{summary.silverCount} credits</div>
        </div>
        <div className="p-3 rounded-lg bg-green/5 border border-green/20">
          <div className="text-[0.5rem] text-white/60 font-orbitron font-bold tracking-[0.12em]">TOTAL AUTO-FUNDED</div>
          <div className="font-orbitron text-green text-[1rem] font-bold mt-1">+{fmt(totalFunded, 4)} USDT</div>
          <div className="text-[0.5rem] text-white/30 font-orbitron">lifetime</div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4">
          {txs.length === 0 ? (
            <div className="text-center py-6 text-[0.68rem] text-white/30 font-orbitron">
              No auto-fund credits yet. Earn cashback first — 20% will auto-credit to your draw wallets.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.65rem]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr className="text-left text-white/40 font-orbitron text-[0.6rem] tracking-[0.1em]">
                    <th className="py-2 px-3">DATE</th>
                    <th className="py-2 px-3 text-right">GOLDEN CREDIT</th>
                    <th className="py-2 px-3 text-right">SILVER CREDIT</th>
                    <th className="py-2 px-3 text-right">DAILY TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-3 font-orbitron text-white/60">{row.date}</td>
                      <td className="py-2 px-3 font-orbitron text-gold text-right">
                        {row.golden > 0 ? `+${fmt(row.golden, 4)}` : '—'}
                      </td>
                      <td className="py-2 px-3 font-orbitron text-white/70 text-right">
                        {row.silver > 0 ? `+${fmt(row.silver, 4)}` : '—'}
                      </td>
                      <td className="py-2 px-3 font-orbitron text-green text-right font-bold">
                        +{fmt(row.golden + row.silver, 4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DrawCard({ draw, type, icon, accent, onPurchased }) {
  const [quantity, setQuantity] = useState(1);
  const [walletSource, setWalletSource] = useState('GAME_WALLET');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!draw) {
    return (
      <div className="card-glass rounded-2xl p-6 border border-white/10">
        <div className="text-center text-white/30 font-orbitron text-[0.7rem] py-8">
          Loading {type} draw...
        </div>
      </div>
    );
  }

  const accentColors = {
    gold: {
      border: 'border-gold/40',
      text: 'text-gold',
      bg: 'bg-gold/5',
      btn: 'bg-gradient-to-br from-gold to-gold2 text-black',
      progress: 'bg-gradient-to-r from-gold to-gold2',
    },
    silver: {
      border: 'border-silver/30',
      text: 'text-silver',
      bg: 'bg-silver/5',
      btn: 'bg-gradient-to-br from-silver to-silver2 text-black',
      progress: 'bg-gradient-to-r from-silver to-silver2',
    },
  }[accent];

  const progressPct = draw.progressPercent || 0;
  const totalCost = (draw.entryFee || 0) * quantity;

  const drawWalletKey = type === 'GOLDEN' ? 'GOLDEN_DRAW_WALLET' : 'SILVER_DRAW_WALLET';

  const handlePurchase = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be > 0' });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/luckydraw/enter', {
        type,
        quantity,
        walletSource,
      });
      setFeedback({
        type: 'success',
        message: `✓ Purchased ${data.purchased} ticket${data.purchased > 1 ? 's' : ''}`,
      });
      setQuantity(1);
      if (onPurchased) onPurchased();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Purchase failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`card-glass rounded-3xl p-6 border-2 ${accentColors.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[3rem] leading-none mb-1">{icon}</div>
          <div className={`font-orbitron font-bold text-[1rem] ${accentColors.text}`}>
            {type} DRAW
          </div>
          <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em]">
            DRAW #{draw.drawNumber}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.68rem] text-white/60 font-orbitron font-bold tracking-[0.15em]">PRIZE POOL</div>
          <div className={`font-russo text-[1.8rem] ${accentColors.text}`}>
            {fmt(type === 'GOLDEN' ? 70000 : 7000, 0)}
          </div>
          <div className="text-[0.68rem] text-white/30">USDT</div>
        </div>
      </div>

      {/* Countdown timer — shown when draw is ACTIVATED */}
      {draw.status === 'ACTIVATED' && draw.timerEndsAt && (
        <UserCountdownTimer timerEndsAt={draw.timerEndsAt} accent={accentColors.text} />
      )}
      {draw.status === 'PAUSED' && (
        <div className="text-center py-3 mb-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
          <div className="font-orbitron text-yellow-400 text-[0.65rem]">⏸️ DRAW PAUSED</div>
          <div className="text-[0.65rem] text-white/30 mt-1">Ticket sales temporarily suspended</div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[0.6rem] font-orbitron mb-1.5">
          <span className="text-white/40">TICKETS SOLD</span>
          <span className={accentColors.text}>
            {draw.ticketsSold} / {draw.totalTickets}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${accentColors.progress}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-[0.68rem] text-white/30 font-orbitron mt-1 text-right">
          {fmt(progressPct, 1)}% filled
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className={`p-2 rounded-lg ${accentColors.bg}`}>
          <div className="text-[0.65rem] text-white/30 font-orbitron">ENTRY FEE</div>
          <div className={`font-orbitron text-[0.85rem] ${accentColors.text}`}>
            {fmt(draw.entryFee, 0)}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${accentColors.bg}`}>
          <div className="text-[0.65rem] text-white/30 font-orbitron">WIN ODDS</div>
          <div className={`font-orbitron text-[0.85rem] ${accentColors.text}`}>10%</div>
        </div>
        <div className={`p-2 rounded-lg ${accentColors.bg}`}>
          <div className="text-[0.65rem] text-white/30 font-orbitron">REMAINING</div>
          <div className={`font-orbitron text-[0.85rem] ${accentColors.text}`}>
            {draw.remainingTickets}
          </div>
        </div>
      </div>

      {/* Purchase form */}
      <form onSubmit={handlePurchase} className="space-y-3">
        <div>
          <label className="block text-[0.68rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
            QUANTITY
          </label>
          <input
            type="number"
            min="1"
            max={draw.remainingTickets}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
            disabled={submitting}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron focus:outline-none focus:border-gold/50 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[0.68rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
            PAY FROM
          </label>
          <select
            value={walletSource}
            onChange={(e) => setWalletSource(e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.7rem] focus:outline-none focus:border-gold/50 disabled:opacity-50"
          >
            <option value="GAME_WALLET">Game Wallet</option>
            <option value={drawWalletKey}>{type} Draw Wallet (auto-funded)</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[0.7rem] font-orbitron px-2">
          <span className="text-white/40">TOTAL COST</span>
          <span className={accentColors.text}>{fmt(totalCost)} USDT</span>
        </div>

        <button
          type="submit"
          disabled={submitting || quantity <= 0 || draw.remainingTickets <= 0}
          className={`w-full py-3 rounded-xl font-orbitron text-[0.7rem] font-bold tracking-[0.12em] ${accentColors.btn} transition-all hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0`}
        >
          {submitting ? '⏳ PROCESSING...' : draw.remainingTickets <= 0 ? '🔒 SOLD OUT' : `🎟️ BUY ${quantity} TICKET${quantity > 1 ? 'S' : ''}`}
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-3 p-2 rounded-lg text-[0.65rem] ${
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
// UserCountdownTimer — shows live countdown on user draw card
// ============================================================================
function UserCountdownTimer({ timerEndsAt, accent }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!timerEndsAt) return;
    const target = new Date(timerEndsAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  if (remaining === null) return null;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="text-center py-3 mb-3 rounded-xl bg-gold/5 border border-gold/20">
      <div className="text-[0.65rem] text-white/60 font-orbitron font-bold tracking-[0.2em]">DRAW IN</div>
      <div className={`font-russo text-[2rem] ${accent} leading-none mt-1`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
    </div>
  );
}

// ============================================================================
// HistoryTabs — 4 tabbed views: My Tickets, My Wins, My Losses, Past Draws
// ============================================================================
function HistoryTabs({ myTickets, history }) {
  const [tab, setTab] = useState('tickets');
  const [wins, setWins] = useState([]);
  const [losses, setLosses] = useState([]);
  const [winsLoading, setWinsLoading] = useState(false);
  const [lossesLoading, setLossesLoading] = useState(false);

  useEffect(() => {
    if (tab === 'wins' && wins.length === 0) {
      setWinsLoading(true);
      api.get('/api/luckydraw/my-wins?pageSize=50')
        .then(({ data }) => setWins(data.tickets || []))
        .catch(() => {})
        .finally(() => setWinsLoading(false));
    }
    if (tab === 'losses' && losses.length === 0) {
      setLossesLoading(true);
      api.get('/api/luckydraw/my-losses?pageSize=50')
        .then(({ data }) => setLosses(data.tickets || []))
        .catch(() => {})
        .finally(() => setLossesLoading(false));
    }
  }, [tab]);

  const tabs = [
    { key: 'tickets', label: `🎟️ MY TICKETS (${myTickets.length})`, color: 'cyan' },
    { key: 'wins', label: '🏆 WINS', color: 'green' },
    { key: 'losses', label: '❌ LOSSES', color: 'pink' },
    { key: 'draws', label: '📜 PAST DRAWS', color: 'purple' },
  ];

  return (
    <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-[100px] px-4 py-3 font-orbitron text-[0.68rem] tracking-[0.1em] transition-all whitespace-nowrap ${
              tab === t.key
                ? `text-${t.color} border-b-2 border-${t.color} bg-${t.color}/5`
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Tab: My Tickets */}
        {tab === 'tickets' && (
          myTickets.length === 0 ? (
            <div className="text-[0.7rem] text-white/30 text-center py-6">No tickets yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {myTickets.slice(0, 60).map((t) => (
                <div key={t._id} className={`p-2 rounded-lg border text-center ${
                  t.outcome === 'WIN' ? 'bg-green/5 border-green/30' :
                  t.outcome === 'LOSS' ? 'bg-pink/5 border-pink/20' :
                  t.drawId?.type === 'GOLDEN' ? 'bg-gold/5 border-gold/20' : 'bg-white/3 border-white/10'
                }`}>
                  <div className="text-[0.6rem] font-orbitron text-white/30">
                    {t.drawId?.type || '—'} #{t.drawId?.drawNumber || '—'}
                  </div>
                  <div className="font-orbitron text-[0.85rem] text-white">#{t.ticketNumber}</div>
                  {t.outcome === 'WIN' && (
                    <div className="text-[0.6rem] text-green font-orbitron mt-0.5">🏆 WON {fmt(t.prizeAmount)}</div>
                  )}
                  {t.outcome === 'LOSS' && (
                    <div className="text-[0.6rem] text-pink font-orbitron mt-0.5">LOSS</div>
                  )}
                  {t.outcome === 'PENDING' && t.purchaseType === 'AUTO_CASHBACK' && (
                    <div className="text-[0.6rem] text-purple font-orbitron mt-0.5">AUTO</div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab: My Wins */}
        {tab === 'wins' && (
          winsLoading ? (
            <div className="text-center py-6 text-white/30 text-[0.7rem]">Loading...</div>
          ) : wins.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-[0.7rem]">No wins yet. Keep playing!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.65rem]">
                <thead>
                  <tr className="text-left text-white/40 font-orbitron text-[0.65rem] border-b border-white/10">
                    <th className="py-2 px-2">TYPE</th>
                    <th className="py-2 px-2">DRAW #</th>
                    <th className="py-2 px-2 text-right">TICKET #</th>
                    <th className="py-2 px-2 text-right">PRIZE</th>
                    <th className="py-2 px-2">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {wins.map((w) => (
                    <tr key={w._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-2 font-orbitron text-gold text-[0.68rem]">{w.drawId?.type || '—'}</td>
                      <td className="py-2 px-2 font-orbitron text-white/70">#{w.drawId?.drawNumber || '—'}</td>
                      <td className="py-2 px-2 font-orbitron text-cyan text-right">#{w.ticketNumber}</td>
                      <td className="py-2 px-2 font-orbitron text-green text-right">{fmt(w.prizeAmount)} USDT</td>
                      <td className="py-2 px-2 font-orbitron text-white/30 text-[0.65rem]">
                        {w.drawResultedAt ? new Date(w.drawResultedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: My Losses */}
        {tab === 'losses' && (
          lossesLoading ? (
            <div className="text-center py-6 text-white/30 text-[0.7rem]">Loading...</div>
          ) : losses.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-[0.7rem]">No losses recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.65rem]">
                <thead>
                  <tr className="text-left text-white/40 font-orbitron text-[0.65rem] border-b border-white/10">
                    <th className="py-2 px-2">TYPE</th>
                    <th className="py-2 px-2">DRAW #</th>
                    <th className="py-2 px-2 text-right">TICKET #</th>
                    <th className="py-2 px-2 text-right">LOSS</th>
                    <th className="py-2 px-2">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {losses.map((l) => (
                    <tr key={l._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-2 font-orbitron text-white/50 text-[0.68rem]">{l.drawId?.type || '—'}</td>
                      <td className="py-2 px-2 font-orbitron text-white/70">#{l.drawId?.drawNumber || '—'}</td>
                      <td className="py-2 px-2 font-orbitron text-cyan text-right">#{l.ticketNumber}</td>
                      <td className="py-2 px-2 font-orbitron text-pink text-right">{fmt(l.amount)} USDT</td>
                      <td className="py-2 px-2 font-orbitron text-white/30 text-[0.65rem]">
                        {l.drawResultedAt ? new Date(l.drawResultedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Past Draws */}
        {tab === 'draws' && (
          history.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-[0.7rem]">No completed draws yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.65rem]">
                <thead>
                  <tr className="text-left text-white/40 font-orbitron text-[0.65rem] border-b border-white/10">
                    <th className="py-2 px-2">TYPE</th>
                    <th className="py-2 px-2">DRAW #</th>
                    <th className="py-2 px-2 text-right">TICKETS</th>
                    <th className="py-2 px-2 text-right">POOL</th>
                    <th className="py-2 px-2">STATUS</th>
                    <th className="py-2 px-2">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((d) => (
                    <tr key={d._id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-orbitron ${
                          d.type === 'GOLDEN' ? 'bg-gold/10 text-gold border border-gold/30' : 'bg-white/5 text-white/50 border border-white/20'
                        }`}>{d.type}</span>
                      </td>
                      <td className="py-2 px-2 font-orbitron text-white/70">#{d.drawNumber}</td>
                      <td className="py-2 px-2 font-orbitron text-cyan text-right">{d.ticketsSold}</td>
                      <td className="py-2 px-2 font-orbitron text-gold text-right">{fmt(d.totalPool)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-orbitron border ${
                          d.status === 'RESULTED' ? 'bg-green/5 border-green/30 text-green' :
                          d.status === 'CANCELLED' ? 'bg-pink/5 border-pink/30 text-pink' :
                          'bg-white/5 border-white/20 text-white/40'
                        }`}>{d.status}</span>
                      </td>
                      <td className="py-2 px-2 font-orbitron text-white/30 text-[0.65rem]">
                        {d.resultedAt ? new Date(d.resultedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LDStatCard — Lucky Draw user summary stat card
// ============================================================================
function LDStatCard({ label, value, icon, color, isCount = false }) {
  const colorClass = {
    cyan: 'text-cyan border-cyan/20',
    gold: 'text-gold border-gold/20',
    green: 'text-green border-green/20',
    pink: 'text-pink border-pink/20',
    purple: 'text-purple border-purple/20',
  }[color] || 'text-white/60 border-white/10';

  const display = isCount ? String(num(value)) : fmt(value);

  return (
    <div className={`card-glass rounded-xl p-3 border ${colorClass.split(' ')[1]} text-center`}>
      <div className="text-[1rem] mb-1">{icon}</div>
      <div className={`font-orbitron font-bold text-[0.9rem] ${colorClass.split(' ')[0]}`}>
        {display}
      </div>
      <div className="text-[0.4rem] text-white/60 font-orbitron font-bold tracking-[0.08em] mt-0.5">
        {label}
      </div>
    </div>
  );
}
