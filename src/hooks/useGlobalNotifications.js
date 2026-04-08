import { useEffect } from 'react';
import { useSocket } from './useSocket';

/**
 * Global socket listener for notifications that should fire anywhere in the
 * app, regardless of which page the user is currently viewing.
 *
 * Currently handled:
 *   - practice:expired — the user's practice account has been deleted
 *   - announcement     — admin announcement (global or targeted)
 */
export function useGlobalNotifications() {
  useSocket({
    'practice:expired': (data) => {
      // Use a browser alert as a simple, page-agnostic notification for now.
      // (Can be upgraded to a toast system later.)
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
    announcement: (data) => {
      if (typeof window !== 'undefined' && data?.message) {
        setTimeout(() => {
          window.alert(`📣 Announcement:\n\n${data.message}`);
        }, 100);
      }
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, []);
}
