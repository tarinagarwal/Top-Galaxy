import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Computed from user.adminRole (set in setAuth / updateUser)
      adminRole: null,        // 'SUPER' | 'OPERATIONAL' | 'NORMAL' | null
      isAdmin: false,         // true if any admin role
      isSuperAdmin: false,    // true only for SUPER
      isOperationalAdmin: false, // true for SUPER or OPERATIONAL
      // Per-admin tab list — empty array means "no tabs granted". SUPER admins
      // bypass this entirely (see hasTab selector below). Updated on login and
      // after any /api/auth/me sync.
      adminTabs: [],

      setAuth: (user, token) => {
        localStorage.setItem('tg-token', token);
        const role = user?.adminRole || null;
        set({
          user,
          token,
          isAuthenticated: true,
          adminRole: role,
          isAdmin: !!role,
          isSuperAdmin: role === 'SUPER',
          isOperationalAdmin: role === 'SUPER' || role === 'OPERATIONAL',
          adminTabs: user?.adminTabs || [],
        });
      },

      updateUser: (user) => {
        const role = user?.adminRole || null;
        set({
          user,
          adminRole: role,
          isAdmin: !!role,
          isSuperAdmin: role === 'SUPER',
          isOperationalAdmin: role === 'SUPER' || role === 'OPERATIONAL',
          adminTabs: user?.adminTabs || [],
        });
      },

      logout: () => {
        localStorage.removeItem('tg-token');
        if (typeof window !== 'undefined' && typeof window.__tgDisconnectSocket === 'function') {
          try { window.__tgDisconnectSocket(); } catch {}
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          adminRole: null,
          isAdmin: false,
          isSuperAdmin: false,
          isOperationalAdmin: false,
          adminTabs: [],
        });
      },

      getToken: () => get().token,

      // Tab permission check — SUPER sees every tab; OPERATIONAL sees only
      // tabs in their adminTabs list; anyone else sees nothing. Used by the
      // sidebar filter and the <TabGuard> route wrapper.
      hasTab: (tabKey) => {
        const s = get();
        if (s.adminRole === 'SUPER') return true;
        if (s.adminRole === 'OPERATIONAL') return (s.adminTabs || []).includes(tabKey);
        return false;
      },
    }),
    {
      name: 'tg-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        adminRole: state.adminRole,
        isAdmin: state.isAdmin,
        isSuperAdmin: state.isSuperAdmin,
        isOperationalAdmin: state.isOperationalAdmin,
        adminTabs: state.adminTabs,
      }),
    }
  )
);
