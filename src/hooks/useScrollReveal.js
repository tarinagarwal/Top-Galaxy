import { useEffect, useRef } from 'react';

export function useScrollReveal(threshold = 0.08) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold }
    );

    const targets = el.querySelectorAll('.reveal');
    targets.forEach((t) => obs.observe(t));

    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}
