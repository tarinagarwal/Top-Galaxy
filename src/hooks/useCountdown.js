import { useEffect, useState } from 'react';

/**
 * useCountdown — returns seconds remaining to a target Date,
 * updating every second. Returns 0 if target is in the past or null.
 */
export function useCountdown(target) {
  const [seconds, setSeconds] = useState(() => calc(target));

  useEffect(() => {
    setSeconds(calc(target));
    if (!target) return;
    const id = setInterval(() => {
      setSeconds(calc(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return seconds;
}

function calc(target) {
  if (!target) return 0;
  const t = new Date(target).getTime();
  if (Number.isNaN(t)) return 0;
  const ms = t - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

export function formatSeconds(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}
