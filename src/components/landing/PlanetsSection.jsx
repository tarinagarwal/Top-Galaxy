import SectionHeader from '../SectionHeader';

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */
const PLANETS = [
  { n: 2, name: 'Moon',    color: '#C8D6E5', role: 'Lunar Reflector',    represents: 'Passive reflection of light — community reward mirroring', fn: 'Mirrors rewards from Sun Core activity back to participants' },
  { n: 5, name: 'Mercury', color: '#1E90FF', role: 'Speed Courier',      represents: 'Fastest orbit — rapid micro-transactions & entries',       fn: 'Handles high-speed game settlement and instant payouts' },
  { n: 6, name: 'Venus',   color: '#FF2D78', role: 'Attraction Engine',  represents: 'Gravity pull — referral magnetism & team bonding',         fn: 'Powers direct referral income and team-level growth' },
  { n: 3, name: 'Jupiter', color: '#FFA500', role: 'Giant Amplifier',    represents: 'Largest body — volume-based multiplier & big wins',        fn: 'Amplifies pool returns proportional to business volume' },
  { n: 4, name: 'Rahu',    color: '#B44FFF', role: 'Shadow Catalyst',    represents: 'Hidden node — mystery jackpot & lucky draw trigger',       fn: 'Activates surprise bonus rounds and shadow rewards' },
  { n: 7, name: 'Ketu',    color: '#00FF88', role: 'Karmic Balancer',    represents: 'Counter-node — rebalancing & fairness protocol',           fn: 'Ensures ecosystem equilibrium and anti-whale protection' },
  { n: 8, name: 'Saturn',  color: '#FFD700', role: 'Ring Guardian',      represents: 'Discipline rings — structured tier & level system',        fn: 'Governs activation tiers, lock periods, and level gating' },
  { n: 9, name: 'Mars',    color: '#FF4444', role: 'Warrior Node',       represents: 'Competitive fire — PvP clash & leaderboard energy',       fn: 'Drives competitive game rounds and leaderboard rankings' },
];

const ALL_BODIES = [
  { n: 0, name: 'Universe Core', color: '#00FFFF' },
  { n: 1, name: 'Sun Core',      color: '#FFD700' },
  ...PLANETS.map(p => ({ n: p.n, name: p.name, color: p.color })),
];
ALL_BODIES.sort((a, b) => a.n - b.n);

const ORBIT_PARAMS = [
  { r: 80,  dur: 18, start: 0   },
  { r: 110, dur: 22, start: 45  },
  { r: 140, dur: 28, start: 120 },
  { r: 170, dur: 26, start: 200 },
  { r: 200, dur: 34, start: 70  },
  { r: 230, dur: 30, start: 160 },
  { r: 260, dur: 38, start: 300 },
  { r: 290, dur: 42, start: 240 },
];

const VOICEOVERS = [
  { text: '"The cosmos runs on numbers. Every digit from 0 to 9 maps to a celestial body — and every celestial body powers a unique income stream."', author: 'Galactic Narrator' },
  { text: '"Your game is not random. It is planetary — calculated, cyclical, and designed for those who understand orbits."', author: 'System Architect' },
  { text: '"The Sun never stops burning. The Universe never stops expanding. Your earnings follow the same law."', author: 'Core Protocol' },
];

const WHY_POWERFUL = [
  { icon: '🔢', title: 'Mathematical Mapping', desc: 'Every digit 0-9 ties to a cosmic body, making outcomes transparent and verifiable.' },
  { icon: '🔄', title: 'Cyclical Income', desc: 'Planets orbit endlessly — so do your earning opportunities, round after round.' },
  { icon: '⚖️', title: 'Balanced Ecosystem', desc: 'Rahu & Ketu act as shadow nodes to rebalance, preventing any single point of dominance.' },
  { icon: '🚀', title: 'Multi-Layer Rewards', desc: 'Each planet controls a distinct income type: referral, pool, jackpot, cashback, ROI.' },
  { icon: '♾️', title: 'Infinite Scalability', desc: '9 planets + 1 core = a self-sustaining system that scales with every new participant.' },
];

/* ──────────────────────────────────────────────
   ORRERY  (CSS solar system)
   ────────────────────────────────────────────── */
const orrerySize = 640;     // px (desktop); will scale down via max-w
const sunSize    = 70;

function Orrery() {
  return (
    <div className="flex justify-center mb-14 px-4">
      <div
        className="relative mx-auto"
        style={{ width: orrerySize, height: orrerySize, maxWidth: '92vw', aspectRatio: '1' }}
      >
        {/* orbit rings */}
        {ORBIT_PARAMS.map((o, i) => (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full border border-white/[0.04]"
            style={{
              width:  o.r * 2,
              height: o.r * 2,
              top:  '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}
          />
        ))}

        {/* SUN */}
        <div
          className="absolute rounded-full z-10 flex flex-col items-center justify-center"
          style={{
            width:  sunSize,
            height: sunSize,
            top:  '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, #FFD700 0%, #FFA500 60%, #FF8C00 100%)',
            boxShadow: '0 0 40px rgba(255,215,0,0.45), 0 0 80px rgba(255,165,0,0.2)',
          }}
        >
          <span className="text-lg leading-none">☀️</span>
          <span className="text-[0.35rem] font-orbitron tracking-wider text-deep font-bold mt-0.5 leading-none">1 · SUN</span>
        </div>

        {/* planets */}
        {PLANETS.map((p, i) => {
          const { r, dur, start } = ORBIT_PARAMS[i];
          const planetSize = 18;
          return (
            <div
              key={p.n}
              className="absolute"
              style={{
                width:  0,
                height: 0,
                top:  '50%',
                left: '50%',
                '--r':     `${r}px`,
                '--dur':   `${dur}s`,
                '--start': `${start}deg`,
                animation: `planet-orbit var(--dur) linear infinite`,
                animationDelay: `calc(var(--start) / 360 * var(--dur) * -1)`,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center font-orbitron text-[0.5rem] font-bold text-deep"
                style={{
                  width:  planetSize,
                  height: planetSize,
                  background: p.color,
                  boxShadow: `0 0 10px ${p.color}66`,
                  transform: 'translate(-50%,-50%)',
                }}
                title={`${p.n} · ${p.name}`}
              >
                {p.n}
              </div>
            </div>
          );
        })}

        {/* universe core label below sun */}
        <div
          className="absolute left-1/2 text-center -translate-x-1/2"
          style={{ top: `calc(50% + ${sunSize / 2 + 14}px)` }}
        >
          <span className="text-[0.5rem] font-orbitron tracking-[0.2em] text-cyan/50 uppercase">
            🔵 0 — UNIVERSE CORE
          </span>
        </div>

        {/* inline keyframes (scoped) */}
        <style>{`
          @keyframes planet-orbit {
            from { transform: rotate(0deg)   translateX(var(--r)) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SMALL REUSABLE PIECES
   ────────────────────────────────────────────── */
const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color, boxShadow: `0 0 6px ${color}44` }} />
    <span className="text-[0.6rem] text-white/50 font-orbitron tracking-wider uppercase whitespace-nowrap">{label}</span>
  </div>
);

const QuoteCard = ({ text, author }) => (
  <div className="card-glass rounded-2xl p-6 border border-white/[0.06] flex flex-col gap-3 min-w-[260px]">
    <p className="text-[0.82rem] text-white/50 italic leading-relaxed">{text}</p>
    <span className="text-[0.6rem] font-orbitron tracking-widest text-gold/50 uppercase">— {author}</span>
  </div>
);

const StatBox = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-cyan/5 border border-cyan/10">
    <span className="font-orbitron text-xl font-bold text-cyan">{value}</span>
    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-white/35">{label}</span>
  </div>
);

/* ──────────────────────────────────────────────
   PLANET CARD
   ────────────────────────────────────────────── */
function PlanetCard({ planet }) {
  const { n, name, color, role, represents, fn } = planet;
  return (
    <div className="card-glass rounded-2xl p-6 border border-white/[0.06] relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="shimmer-overlay" />
      {/* sphere + ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-12 h-12 shrink-0">
          {/* ring */}
          <div
            className="absolute inset-[-6px] rounded-full border"
            style={{ borderColor: `${color}30` }}
          />
          {/* sphere */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-orbitron text-sm font-bold text-deep"
            style={{ background: color, boxShadow: `0 0 20px ${color}44` }}
          >
            {n}
          </div>
        </div>
        <div>
          <h4 className="font-russo text-sm tracking-wide" style={{ color }}>{name}</h4>
          <p className="text-[0.65rem] text-white/35 font-orbitron tracking-wider uppercase">{role}</p>
        </div>
      </div>
      <div className="mb-3">
        <span className="text-[0.55rem] font-orbitron tracking-[0.2em] uppercase text-white/25 block mb-1">REPRESENTS</span>
        <p className="text-[0.78rem] text-white/55 leading-relaxed">{represents}</p>
      </div>
      <div>
        <span className="text-[0.55rem] font-orbitron tracking-[0.2em] uppercase text-white/25 block mb-1">FUNCTION</span>
        <p className="text-[0.78rem] text-white/55 leading-relaxed">{fn}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PLANETS SECTION
   ════════════════════════════════════════════════════════════ */
export default function PlanetsSection() {
  return (
    <section id="planets" className="relative py-10 overflow-hidden">
      {/* subtle nebula backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.03) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(0,255,255,0.02) 0%, transparent 55%)' }}
      />

      {/* ─── HEADER ─── */}
      <SectionHeader
        eyebrow="🌌 GALACTIC INTRODUCTION & PLANETARY GAME SYSTEM"
        eyebrowColor="gold"
        title={
          <span
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFFFFF 40%, #00FFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Solar System of Earning
          </span>
        }
      />

      {/* ─── CSS ORRERY ─── */}
      <Orrery />

      {/* ─── LEGEND ─── */}
      <div className="max-w-4xl mx-auto px-4 mb-14">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {ALL_BODIES.map(b => (
            <LegendDot key={b.n} color={b.color} label={`${b.n} · ${b.name}`} />
          ))}
        </div>
      </div>

      {/* ─── VOICEOVER QUOTES ─── */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VOICEOVERS.map((v, i) => <QuoteCard key={i} {...v} />)}
        </div>
      </div>

      {/* ─── UNIVERSE CORE CARD ─── */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="card-glass rounded-3xl p-8 sm:p-10 border border-cyan/15 relative overflow-hidden">
          <div className="shimmer-overlay" />
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            {/* large sphere */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center font-orbitron text-3xl font-bold text-deep shrink-0"
              style={{
                background: 'radial-gradient(circle, #00FFFF 0%, #0088AA 100%)',
                boxShadow: '0 0 40px rgba(0,255,255,0.3), 0 0 80px rgba(0,255,255,0.1)',
              }}
            >
              0
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border border-cyan/20 bg-cyan/5 text-[0.55rem] font-orbitron tracking-[0.15em] text-cyan/70 uppercase mb-2">
                🔵 CENTER CORE · THE GAME ENGINE · DIGIT 0
              </div>
              <h3 className="font-russo text-2xl text-cyan tracking-wide">UNIVERSE CORE</h3>
            </div>
          </div>

          <ul className="space-y-2 mb-8 pl-1">
            {[
              'The origin point of every game round — all computations begin at Core 0.',
              'Acts as the master random-number-generator seed for provably fair outcomes.',
              'Absorbs a micro-fee from every entry to sustain the galactic reward pools.',
              'Cannot be owned or controlled — it is the immutable protocol layer.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.82rem] text-white/55 leading-relaxed">
                <span className="text-cyan mt-0.5 text-xs">◆</span>{t}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-center gap-4">
            <StatBox value="24/7" label="Uptime" />
            <StatBox value="∞"    label="Rounds" />
            <StatBox value="100%" label="Fair" />
          </div>
        </div>
      </div>

      {/* ─── PLANET CARDS 3x3 ─── */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <h4 className="text-center font-russo text-lg text-white/70 mb-8 tracking-wide">The 9 Planetary Nodes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Sun as card #1 */}
          <PlanetCard
            planet={{
              n: 1,
              name: 'Sun Core',
              color: '#FFD700',
              role: 'Central Star',
              represents: 'The burning center — primary pool engine & reward furnace',
              fn: 'Generates base game pools and distributes core winnings every round',
            }}
          />
          {PLANETS.map(p => <PlanetCard key={p.n} planet={p} />)}
        </div>
      </div>

      {/* ─── COSMIC MODEL BAND ─── */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div
          className="rounded-2xl py-5 px-6 text-center border border-gold/15"
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.04), rgba(0,255,255,0.03))' }}
        >
          <p className="font-orbitron text-[0.7rem] sm:text-xs tracking-[0.15em] text-white/50">
            <span className="text-cyan font-bold">0</span> Universe Core
            <span className="mx-2 text-white/20">+</span>
            <span className="text-gold font-bold">1–9</span> Planetary Nodes
            <span className="mx-2 text-white/20">=</span>
            <span className="text-white/80 font-bold">∞</span> Complete Ecosystem
          </p>
        </div>
      </div>

      {/* ─── WHY POWERFUL ─── */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <h4 className="text-center font-russo text-lg text-white/70 mb-8 tracking-wide">Why This Model Is Powerful</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_POWERFUL.map((w, i) => (
            <div key={i} className="card-glass rounded-2xl p-6 border border-white/[0.06] hover:border-gold/15 transition-colors">
              <span className="text-2xl mb-3 block">{w.icon}</span>
              <h5 className="font-russo text-sm text-gold mb-2 tracking-wide">{w.title}</h5>
              <p className="text-[0.78rem] text-white/45 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SCHEDULE BAND ─── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="card-glass rounded-2xl p-6 border border-cyan/10">
          <h5 className="text-center font-russo text-sm text-white/50 mb-5 tracking-wide">Game Schedule</h5>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { val: '24',      lbl: 'Games / Day' },
              { val: '1 HR',    lbl: 'Per Round' },
              { val: '2 MIN',   lbl: 'Cutoff' },
              { val: '1 USDT',  lbl: 'Min Entry' },
              { val: '∞',       lbl: 'Max Entry' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] min-w-[100px]">
                <span className="font-orbitron text-sm font-bold text-cyan">{s.val}</span>
                <span className="text-[0.55rem] uppercase tracking-[0.2em] text-white/35">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
