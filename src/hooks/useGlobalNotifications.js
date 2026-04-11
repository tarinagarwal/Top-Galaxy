import { useEffect } from 'react';
import { useSocket } from './useSocket';

/**
 * Global socket listener for notifications that should fire anywhere in the
 * app, regardless of which page the user is currently viewing.
 *
 * Currently handled:
 *   - practice:expired — the user's practice account has been deleted
 *
 * Note: announcements are now handled by the <AnnouncementBanner /> component
 * which shows a persistent sticky banner under the navbar.
 */
export function useGlobalNotifications() {
  useSocket({
    'practice:expired': () => {
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.alert(
            '⚠️ Your practice account has expired.\n\n' +
              'Because you did not make a real-cash deposit within the 30-day window, ' +
              'your practice balance has been removed and your downline was re-attached to your upline.\n\n' +
              'You can still register fresh with a real-cash deposit to continue.'
          );
        }, 100);
      }
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, []);
}
