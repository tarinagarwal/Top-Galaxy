import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAdmin: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('tg-token', token);
        set({
          user,
          token,
          isAdmin: user?.isAdmin || false,
          isAuthenticated: true,
        });
      },

      updateUser: (user) => set({ user, isAdmin: user?.isAdmin || false }),

      logout: () => {
        localStorage.removeItem('tg-token');
        // Tear down the singleton socket so the server stops sending events
        // to this browser session and a future login (possibly as a different
        // user) starts with a fresh handshake. useSocket exposes a window
        // helper to break the otherwise-circular import.
        if (typeof window !== 'undefined' && typeof window.__tgDisconnectSocket === 'function') {
          try { window.__tgDisconnectSocket(); } catch {}
        }
        set({ user: null, token: null, isAdmin: false, isAuthenticated: false });
      },

      getToken: () => get().token,
    }),
    {
      name: 'tg-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
