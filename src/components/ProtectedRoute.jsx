import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

// Module-level cache: when was the last time we resynced the user from
// /api/auth/me? If we resynced within the last 30 seconds, skip the loading
// block on subsequent AdminRoute mounts and just re-fetch in the background.
// Reset on logout so a fresh login always does the blocking resync.
let lastResyncAt = 0;
const RESYNC_BLOCK_MS = 30 * 1000;

// Expose reset hook on window so authStore.logout() can clear the cache
// without creating a circular import.
if (typeof window !== 'undefined') {
  window.__tgResetResync = () => { lastResyncAt = 0; };
}

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// Ordered map: tabKey → the route path that serves it. Used to pick a safe
// fallback destination when an OPERATIONAL admin tries to access a tab they
// don't have permission for (we send them to the first tab they DO have,
// preventing an infinite redirect loop on /admin itself).
const TAB_TO_PATH = {
  dashboard: '/admin',
  users: '/admin/users',
  games: '/admin/games',
  withdrawals: '/admin/withdrawals',
  pools: '/admin/pools',
  deposits: '/admin/deposits',
  config: '/admin/config',
  luckydraw: '/admin/luckydraw',
  club: '/admin/club',
  analytics: '/admin/analytics',
  logs: '/admin/logs',
  announcements: '/admin/announcements',
};

// AdminRoute optionally accepts a `tabKey` prop. When set, the route is only
// accessible to users whose hasTab(tabKey) returns true — SUPER always passes;
// OPERATIONAL passes only if the key is in their adminTabs list; everyone else
// is bounced to the first tab they DO have, or home if they have zero tabs.
//
// Without a tabKey prop, AdminRoute behaves as it used to — any admin may enter.
// Kept backward-compatible on purpose: existing routes don't have to opt in.
//
// Auto-resync: on mount, calls /api/auth/me to refresh the user's adminTabs
// from the database before running the permission check. This makes grants/
// revokes take effect instantly — no re-login required, even on the first
// navigation after SUPER changes permissions. We block rendering with a
// "Checking permissions..." stub until the fetch resolves (or a 1s timeout
// elapses, whichever comes first) so the guard doesn't race against stale
// client state.
export function AdminRoute({ children, tabKey }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const adminRole = useAuthStore((s) => s.adminRole);
  const adminTabs = useAuthStore((s) => s.adminTabs);
  const hasTab = useAuthStore((s) => s.hasTab);
  const updateUser = useAuthStore((s) => s.updateUser);

  // On mount, refresh adminTabs from the server before running the tab check.
  // This handles the case where SUPER granted/revoked a tab for this user
  // and the client's cached state is stale. We only BLOCK rendering on the
  // first admin navigation per session — subsequent navigations still refetch
  // in the background (catching mid-session changes) but render immediately
  // using the cached state.
  const [resynced, setResynced] = useState(Date.now() - lastResyncAt < RESYNC_BLOCK_MS);
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setResynced(true);
      return;
    }
    let cancelled = false;
    // Hard timeout: don't block rendering longer than 1.5s on a slow network.
    const timer = setTimeout(() => {
      if (!cancelled) setResynced(true);
    }, 1500);
    api.get('/api/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.user) updateUser(data.user);
        lastResyncAt = Date.now();
      })
      .catch(() => {}) // network error → fall through to cached state
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timer);
          setResynced(true);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  // Block rendering until the first resync completes so we don't make a stale
  // permission decision. After resync, we have the latest adminTabs from the DB.
  if (!resynced) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 font-orbitron text-[0.7rem] tracking-[0.2em]">
        CHECKING PERMISSIONS...
      </div>
    );
  }

  if (tabKey && adminRole === 'OPERATIONAL' && !hasTab(tabKey)) {
    // Operational admin tried to type a URL they don't have permission for.
    // Pick the first tab in their adminTabs list that we know how to route to
    // and send them there. If they have zero tabs, send them to the user app.
    const firstGrantedTab = (adminTabs || []).find((t) => TAB_TO_PATH[t]);
    const destination = firstGrantedTab ? TAB_TO_PATH[firstGrantedTab] : '/dashboard';
    return <Navigate to={destination} replace />;
  }
  return children;
}

export function SuperAdminRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return children;
}
