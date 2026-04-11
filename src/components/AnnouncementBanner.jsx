import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import api from '../lib/axios';

const TYPE_STYLES = {
  info: { bg: 'bg-cyan/10', border: 'border-cyan/40', text: 'text-cyan', icon: 'ℹ️' },
  success: { bg: 'bg-green/10', border: 'border-green/40', text: 'text-green', icon: '✅' },
  warning: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', text: 'text-yellow-400', icon: '⚠️' },
  danger: { bg: 'bg-pink/10', border: 'border-pink/40', text: 'text-pink', icon: '🚨' },
};

/**
 * Sticky banner under the navbar showing active admin announcements.
 * - Fetches on mount and when a new one is broadcast via socket.
 * - Dismissed announcements are tracked in localStorage per user, so reloading
 *   won't show the same one again unless a new one comes.
 */
export default function AnnouncementBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('tg-dismissed-announcements') || '[]'));
    } catch {
      return new Set();
    }
  });

  const fetchActive = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/api/user/announcements');
      setAnnouncements(data.announcements || []);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  // Live event — refresh when a new announcement is broadcast
  useSocket({
    announcement: () => {
      fetchActive();
    },
  });

  const dismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem('tg-dismissed-announcements', JSON.stringify([...next]));
  };

  if (!isAuthenticated) return null;

  // Filter out dismissed ones
  const visible = announcements.filter((a) => !dismissed.has(String(a._id)));
  if (visible.length === 0) return null;

  return (
    <div className="fixed top-[60px] left-0 right-0 z-[990] pointer-events-none">
      <div className="max-w-[1400px] mx-auto px-3 space-y-1 pt-1">
        {visible.map((ann) => {
          const style = TYPE_STYLES[ann.type] || TYPE_STYLES.info;
          return (
            <div
              key={ann._id}
              className={`pointer-events-auto ${style.bg} ${style.border} border rounded-lg px-4 py-2 flex items-center justify-between gap-3 backdrop-blur-md shadow-lg`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[0.9rem]">{style.icon}</span>
                <span className={`font-orbitron text-[0.68rem] ${style.text} flex-1`}>
                  {ann.message}
                </span>
              </div>
              <button
                onClick={() => dismiss(String(ann._id))}
                className={`flex-shrink-0 font-orbitron text-[0.6rem] ${style.text} opacity-60 hover:opacity-100 px-2`}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
