import SectionHeader from '../SectionHeader';

const techCards = [
  {
    icon: '⛓',
    title: 'BINANCE SMART CHAIN',
    description: 'Built on BSC with BEP-20 token standards for lightning-fast transactions, minimal gas fees, and full EVM compatibility across the galaxy.',
  },
  {
    icon: '💵',
    title: 'USDT STABLECOIN',
    description: 'Phase 1 runs entirely on USDT — providing price stability, zero volatility risk, and seamless value transfer for all players.',
  },
  {
    icon: '🤖',
    title: 'SMART CONTRACTS',
    description: '100% automated execution with no human intervention. Every game, payout, and reward is handled trustlessly by on-chain smart contracts.',
  },
  {
    icon: '🔐',
    title: 'SELF-CUSTODY WALLETS',
    description: 'Connect with MetaMask, Trust Wallet, or SafePal. Your keys, your crypto — funds never leave your personal wallet until you transact.',
  },
  {
    icon: '💸',
    title: 'WITHDRAWAL SYSTEM',
    description: 'Minimum withdrawal 5 USDT, maximum 5,000 USDT per transaction. A flat 10% processing fee ensures ecosystem sustainability.',
  },
  {
    icon: '🎲',
    title: 'PROVABLY FAIR',
    description: 'Hash-based random generation with on-chain verifiable results. Every game outcome can be independently audited by any player.',
  },
];

export default function TechSection() {
  return (
    <section className="relative px-6 pb-[80px] overflow-hidden">
      <div className="divider-line" />

      <SectionHeader
        eyebrow="⚙️ CORE TECHNOLOGY"
        eyebrowColor="cyan"
        title="Built on Galactic Infrastructure"
        titleClass="text-gradient-green"
      />

      {/* Tech Cards Grid */}
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {techCards.map((card, i) => (
          <div
            key={i}
            className="reveal card-glass rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]"
            style={{
              borderColor: 'rgba(0,255,255,0.1)',
            }}
          >
            <div className="shimmer-overlay" />

            {/* Icon */}
            <div className="text-[1.8rem] mb-4">{card.icon}</div>

            {/* Title */}
            <div
              className="font-orbitron text-[0.7rem] font-bold tracking-[0.15em] mb-3"
              style={{ color: 'var(--color-cyan)' }}
            >
              {card.title}
            </div>

            {/* Description */}
            <p className="text-[0.78rem] text-white/40 leading-[1.85]">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
