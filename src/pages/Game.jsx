import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import api from '../lib/axios';
import { useSocket } from '../hooks/useSocket';
import { useCountdown, formatSeconds } from '../hooks/useCountdown';
import { fmt, num } from '../lib/format';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Game() {
  const [current, setCurrent] = useState(null); // { game, myEntries, countdown }
  const [history, setHistory] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [walletType, setWalletType] = useState('GAME_WALLET');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [winFlash, setWinFlash] = useState(null); // { digit, amount } for animation

  // Refresh current game
  const refreshCurrent = useCallback(async () => {
    try {
      const { data } = await api.get('/api/game/current');
      setCurrent(data);
    } catch {}
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/api/game/history?pageSize=10');
      setHistory(data.games || []);
    } catch {}
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setWalletData(data.wallet);
    } catch {}
  }, []);

  useEffect(() => {
    refreshCurrent();
    refreshHistory();
    refreshWallet();
  }, [refreshCurrent, refreshHistory, refreshWallet]);

  // Poll the current game every 5 seconds for status changes (cheap fallback to sockets)
  useEffect(() => {
    const id = setInterval(refreshCurrent, 5000);
    return () => clearInterval(id);
  }, [refreshCurrent]);

  // Socket subscriptions
  useSocket({
    'game:open': () => refreshCurrent(),
    'game:cutoff': () => refreshCurrent(),
    'game:result': () => {
      refreshCurrent();
      refreshHistory();
      refreshWallet();
    },
    'game:win': (data) => {
      setWinFlash({ digit: data.digit, amount: num(data.directPayout) + num(data.compoundPayout) });
      setTimeout(() => setWinFlash(null), 5000);
      refreshWallet();
    },
    'game:loss': () => {
      refreshWallet();
    },
  });

  const game = current?.game;
  const cutoffSeconds = useCountdown(game?.cutoffAt);
  const resultSeconds = useCountdown(game?.scheduledAt);
  const cutoffParts = formatSeconds(cutoffSeconds);
  const resultParts = formatSeconds(resultSeconds);

  // Compound slot balances
  const compoundSlots = walletData?.compoundSlots || {};

  // Auto-switch wallet type if user picks a digit and slot has balance
  useEffect(() => {
    if (selectedDigit !== null) {
      const slotBal = compoundSlots[String(selectedDigit)] || 0;
      // If they're on compound but slot is empty, reset to game wallet
      if (walletType === 'COMPOUND_SLOT' && slotBal === 0) {
        setWalletType('GAME_WALLET');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDigit]);

  // Available wallet options for the current digit
  const walletOptions = useMemo(() => {
    const opts = [
      { value: 'GAME_WALLET', label: 'Game Wallet', balance: walletData?.gameWallet || 0 },
    ];
    if (selectedDigit !== null) {
      const slotBal = compoundSlots[String(selectedDigit)] || 0;
      if (slotBal > 0) {
        opts.push({
          value: 'COMPOUND_SLOT',
          label: `Compound Slot ${selectedDigit}`,
          balance: slotBal,
        });
      }
    }
    return opts;
  }, [walletData, selectedDigit, compoundSlots]);

  const selectedBalance = walletOptions.find((o) => o.value === walletType)?.balance || 0;

  const handleEnter = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!game) {
      setFeedback({ type: 'error', message: 'No game open right now' });
      return;
    }
    if (selectedDigit === null) {
      setFeedback({ type: 'error', message: 'Pick a digit (0–9)' });
      return;
    }
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    if (value > selectedBalance) {
      setFeedback({ type: 'error', message: 'Insufficient balance' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/game/enter', {
        gameId: game._id,
        digit: selectedDigit,
        amount: value,
        walletType,
      });
      setFeedback({
        type: 'success',
        message: `✓ Entry placed: ${value} USDT on digit ${selectedDigit}`,
      });
      setAmount('');
      setSelectedDigit(null);
      await refreshCurrent();
      await refreshWallet();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || 'Entry failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cutoffPassed = cutoffSeconds === 0;
  const cutoffWarning = cutoffSeconds > 0 && cutoffSeconds <= 120;

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-2">
                🎯 LIVE GAME
              </div>
              <h1 className="font-russo text-[clamp(1.8rem,4vw,3rem)] text-gradient-gold">
                Real Cash Game
              </h1>
            </div>
            {game && (
              <div className="text-right">
                <div className="text-[0.55rem] text-white/30 font-orbitron tracking-[0.15em]">
                  GAME #{game.gameNumber} · {game.date}
                </div>
                <div className="font-orbitron text-[0.7rem] text-cyan mt-1">
                  Phase {game.phase} · {game.phase === 1 ? '8×' : '4×'} multiplier
                </div>
              </div>
            )}
          </div>

          {/* No game open */}
          {!game && (
            <div className="card-glass rounded-3xl p-12 text-center border border-white/10">
              <div className="text-[3rem] mb-4">⏸️</div>
              <div className="font-orbitron text-white/50 text-[0.85rem]">
                No game is currently open. Check back at the top of the next hour.
              </div>
            </div>
          )}

          {game && (
            <>
              {/* Countdown */}
              <div className="card-glass rounded-3xl p-6 mb-6 border border-gold/20">
                <div className="text-center">
                  <div className="text-[0.55rem] text-white/40 font-orbitron tracking-[0.2em] mb-3">
                    {cutoffPassed ? '⏳ AWAITING RESULT' : '⏱️ ENTRIES CLOSE IN'}
                  </div>
                  <div className="flex items-center justify-center gap-3 md:gap-6">
                    <CountdownBox label="HRS" value={cutoffPassed ? resultParts.h : cutoffParts.h} />
                    <span className="text-gold text-[2rem] md:text-[3rem] font-russo">:</span>
                    <CountdownBox label="MIN" value={cutoffPassed ? resultParts.m : cutoffParts.m} />
                    <span className="text-gold text-[2rem] md:text-[3rem] font-russo">:</span>
                    <CountdownBox label="SEC" value={cutoffPassed ? resultParts.s : cutoffParts.s} />
                  </div>
                  {cutoffWarning && !cutoffPassed && (
                    <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-pink/10 border border-pink/30 text-pink font-orbitron text-[0.6rem] tracking-[0.15em] animate-pulse">
                      ⚠️ FINAL 2 MINUTES — LAST CHANCE TO ENTER
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Digit picker + entry form */}
                <div className="lg:col-span-2 card-glass rounded-2xl p-6 border border-gold/20">
                  <div className="font-orbitron text-gold text-[0.85rem] font-bold mb-4">
                    🎯 PICK A DIGIT (0–9)
                  </div>

                  <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
                    {DIGITS.map((d) => {
                      const slotBal = compoundSlots[String(d)] || 0;
                      const hasSlot = slotBal > 0;
                      const isSelected = selectedDigit === d;
                      const isWinning = winFlash?.digit === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDigit(d)}
                          disabled={cutoffPassed || submitting}
                          className={`relative aspect-square rounded-xl font-russo text-[2rem] md:text-[2.4rem] transition-all overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-gold to-gold2 text-black shadow-[0_0_30px_rgba(255,215,0,0.6)] scale-105 border-2 border-gold'
                              : hasSlot
                              ? 'bg-purple/15 border-2 border-purple/40 text-white hover:border-purple hover:bg-purple/25'
                              : 'bg-white/3 border border-white/10 text-white hover:border-gold/40 hover:bg-white/5'
                          } ${isWinning ? 'animate-pulse ring-4 ring-green' : ''} disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {d}
                          {hasSlot && (
                            <div className="absolute bottom-0.5 left-0 right-0 text-[0.5rem] font-orbitron text-purple bg-deep/80 px-1">
                              🔒 {fmt(slotBal, 0)}
                            </div>
                          )}
                          {/* 2 empty cells (10-12) handled below */}
                        </button>
                      );
                    })}
                    {/* Two empty grid cells to make 3×4 layout */}
                    <div className="hidden md:block" />
                    <div className="hidden md:block" />
                  </div>

                  {/* Wallet selector */}
                  <div className="mb-4">
                    <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
                      PLAY FROM
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {walletOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setWalletType(opt.value)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            walletType === opt.value
                              ? 'border-cyan bg-cyan/10 text-cyan'
                              : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <div className="font-orbitron text-[0.65rem] font-bold">{opt.label}</div>
                          <div className="font-orbitron text-[0.85rem] mt-1">
                            {fmt(opt.balance)} USDT
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleEnter} className="space-y-3">
                    <div>
                      <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.15em]">
                        BET AMOUNT (USDT)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1.00"
                        disabled={cutoffPassed || submitting}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-orbitron focus:outline-none focus:border-gold/50 disabled:opacity-50"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[1, 5, 10, 25, 50].map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => setAmount(v.toString())}
                          disabled={cutoffPassed || submitting}
                          className="flex-1 py-2 rounded-lg bg-white/3 border border-white/10 text-white/60 font-orbitron text-[0.6rem] hover:border-gold/30 hover:text-gold disabled:opacity-30"
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={cutoffPassed || submitting || selectedDigit === null || !amount}
                      className="w-full py-3 rounded-xl font-orbitron text-[0.75rem] font-bold tracking-[0.12em] bg-gradient-to-br from-gold to-gold2 text-black transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? '⏳ PLACING...' : cutoffPassed ? '🔒 ENTRIES CLOSED' : '🚀 PLACE BET'}
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

                  {/* Win flash banner */}
                  {winFlash && (
                    <div className="mt-4 p-4 rounded-lg bg-green/10 border-2 border-green text-center animate-pulse">
                      <div className="font-russo text-[1.4rem] text-green">🎉 YOU WON!</div>
                      <div className="font-orbitron text-[0.75rem] text-white/70 mt-1">
                        Digit {winFlash.digit} · +{fmt(winFlash.amount)} USDT
                      </div>
                    </div>
                  )}
                </div>

                {/* Side panel: My entries + recent results */}
                <div className="space-y-4">
                  {/* My entries this round */}
                  <div className="card-glass rounded-2xl p-5">
                    <div className="text-[0.55rem] text-cyan font-orbitron tracking-[0.15em] mb-3">
                      🎟️ MY ENTRIES THIS ROUND
                    </div>
                    {current?.myEntries?.length > 0 ? (
                      <div className="space-y-2">
                        {current.myEntries.map((e) => (
                          <div key={e._id} className="flex items-center justify-between text-[0.7rem] p-2 rounded-lg bg-white/3">
                            <span className="font-orbitron text-white">Digit {e.digit}</span>
                            <span className="font-orbitron text-gold">{fmt(e.amount)} USDT</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[0.65rem] text-white/30">No entries yet</div>
                    )}
                  </div>

                  {/* Recent results */}
                  <div className="card-glass rounded-2xl p-5">
                    <div className="text-[0.55rem] text-purple font-orbitron tracking-[0.15em] mb-3">
                      📜 LAST 10 RESULTS
                    </div>
                    {history.length > 0 ? (
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                        {history.map((g) => (
                          <div key={g._id} className="flex items-center justify-between text-[0.65rem] p-2 rounded bg-white/3">
                            <span className="text-white/40 font-orbitron">#{g.gameNumber}</span>
                            <span className="text-white/30 font-orbitron text-[0.55rem]">{g.date}</span>
                            <span className="font-russo text-[1rem] text-gold">{g.winningDigit}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[0.65rem] text-white/30">No results yet</div>
                    )}
                  </div>

                </div>
              </div>

            </>
          )}

          {/* My History link — always visible */}
          <Link
            to="/game/history"
            className="mt-6 block card-glass rounded-2xl p-5 text-center border border-purple/20 hover:border-purple/40 transition-all"
          >
            <div className="font-orbitron text-purple text-[0.75rem] font-bold">
              📊 VIEW MY FULL HISTORY
            </div>
            <div className="text-[0.5rem] text-white/30 mt-1">
              Cash & Practice · Win/Loss · Payouts · P&L
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CountdownBox({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-russo text-[2.5rem] md:text-[4rem] text-gold leading-none tabular-nums">
        {value}
      </div>
      <div className="font-orbitron text-[0.5rem] text-white/40 tracking-[0.2em] mt-1">{label}</div>
    </div>
  );
}
