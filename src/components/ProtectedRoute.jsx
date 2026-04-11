import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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
export function AdminRoute({ children, tabKey }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const adminRole = useAuthStore((s) => s.adminRole);
  const adminTabs = useAuthStore((s) => s.adminTabs);
  const hasTab = useAuthStore((s) => s.hasTab);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
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
