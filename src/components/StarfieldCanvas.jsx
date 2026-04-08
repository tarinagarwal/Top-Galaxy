import { useEffect, useRef } from 'react';

export default function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    let W, H, stars = [], rockets = [], animId;

    function resize() {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < 300; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.7 + 0.2,
          a: Math.random(),
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.025 + 0.008,
          col: Math.random() > 0.82 ? '255,215,0' : Math.random() > 0.6 ? '0,255,255' : Math.random() > 0.4 ? '0,255,136' : '255,255,255',
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Nebula
      const g1 = ctx.createRadialGradient(W * 0.25, H * 0.3, 0, W * 0.25, H * 0.3, W * 0.4);
      g1.addColorStop(0, 'rgba(155,89,182,0.04)'); g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W * 0.75, H * 0.65, 0, W * 0.75, H * 0.65, W * 0.35);
      g2.addColorStop(0, 'rgba(30,144,255,0.03)'); g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        s.tw += s.sp;
        const al = s.a * (0.5 + 0.5 * Math.sin(s.tw));
        if (s.r > 1.1) {
          const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
          sg.addColorStop(0, `rgba(${s.col},${al * 0.7})`); sg.addColorStop(1, 'transparent');
          ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col},${al})`; ctx.fill();
      }

      // Rockets
      if (Math.random() < 0.015) {
        rockets.push({
          x: Math.random() * (W * 0.8) + W * 0.1, y: H + 10,
          vx: (Math.random() - 0.5) * 1.2, vy: -(Math.random() * 4 + 2.5),
          life: 1, sz: Math.random() * 9 + 5,
          col: Math.random() > 0.5 ? '255,215,0' : Math.random() > 0.5 ? '0,255,255' : '0,255,136',
        });
      }
      for (let j = rockets.length - 1; j >= 0; j--) {
        const r = rockets[j];
        r.x += r.vx; r.y += r.vy; r.life -= 0.007;
        if (r.life <= 0 || r.y < -20) { rockets.splice(j, 1); continue; }
        ctx.save(); ctx.globalAlpha = r.life;
        const rg = ctx.createLinearGradient(r.x, r.y, r.x - r.vx * 13, r.y - r.vy * 13);
        rg.addColorStop(0, `rgba(${r.col},0.9)`); rg.addColorStop(1, 'transparent');
        ctx.strokeStyle = rg; ctx.lineWidth = r.sz * 0.22; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.vx * 13, r.y - r.vy * 13); ctx.stroke();
        const rh = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.sz);
        rh.addColorStop(0, `rgba(${r.col},0.95)`); rh.addColorStop(1, 'transparent');
        ctx.fillStyle = rh; ctx.beginPath(); ctx.arc(r.x, r.y, r.sz, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    resize(); initStars(); draw();
    window.addEventListener('resize', () => { resize(); initStars(); });

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
