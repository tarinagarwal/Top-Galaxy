const eyebrowColors = {
  gold: 'border-gold text-gold bg-[rgba(255,215,0,0.06)]',
  cyan: 'border-cyan text-cyan bg-[rgba(0,255,255,0.05)]',
  green: 'border-green text-green bg-[rgba(0,255,136,0.05)]',
  pink: 'border-pink text-pink bg-[rgba(255,45,120,0.05)]',
  purple: 'border-purple text-purple bg-[rgba(180,79,255,0.05)]',
  blue: 'border-blue text-blue bg-[rgba(30,144,255,0.05)]',
  silver: 'border-silver2 text-silver bg-[rgba(200,214,229,0.05)]',
};

export default function SectionHeader({ eyebrow, eyebrowColor = 'gold', title, titleClass = '', description }) {
  return (
    <div className="text-center pt-[75px] pb-[38px] px-6">
      <div className={`eyebrow border ${eyebrowColors[eyebrowColor]} mb-4 inline-flex`}>
        {eyebrow}
      </div>
      <h2 className={`sec-title text-[clamp(1.8rem,4vw,3.2rem)] mb-3 ${titleClass}`}>{title}</h2>
      {description && (
        <p className="text-[0.9rem] text-white/45 max-w-[650px] mx-auto leading-[1.85]">{description}</p>
      )}
    </div>
  );
}
