import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuthStore } from '../store/authStore';

/**
 * Watches for MetaMask account changes. If the active wallet stops matching
 * the authenticated user, automatically log out so the UI doesn't show stale
 * data for the wrong wallet.
 */
export function useAccountWatcher() {
  const { address, isConnected } = useAccount();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const lastAddressRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      lastAddressRef.current = address;
      return;
    }

    // Auth state has a wallet — but the connected MetaMask wallet doesn't match
    if (isConnected && address && user.walletAddress) {
      if (address.toLowerCase() !== user.walletAddress.toLowerCase()) {
        // Wallet switched — clear auth
        logout();
      }
    }

    // Also: if user disconnects MetaMask entirely while authenticated, log out
    if (!isConnected && lastAddressRef.current) {
      logout();
    }

    lastAddressRef.current = address;
  }, [address, isConnected, isAuthenticated, user, logout]);
}
