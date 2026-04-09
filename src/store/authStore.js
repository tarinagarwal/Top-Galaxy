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
        });
      },

      getToken: () => get().token,
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
      }),
    }
  )
);
