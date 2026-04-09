import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useConnect,
  useAccount,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from 'wagmi';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { TARGET_CHAIN_ID } from '../lib/wagmi';

/**
 * useAuth — wallet connect + sign-in flow.
 *
 * Usage:
 *   const { login, logout, loading, error } = useAuth();
 *   await login({ referralCode: 'ABCDE' });
 *
 * The hook uses an internal "pending sign-in" flag so that if the wallet
 * isn't connected when login() is called, it triggers connection and then
 * automatically resumes the sign-in once the address is available.
 */
export function useAuth() {
  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const { setAuth, logout: storeLogout, isAuthenticated, user, isAdmin, isSuperAdmin, isOperationalAdmin, adminRole } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pending sign-in: if user clicks login while disconnected, we connect
  // first, then auto-resume sign-in once `address` becomes available.
  const pendingRef = useRef(null); // { referralCode, resolve, reject }

  // Core sign-in routine — assumes wallet is already connected and address is set.
  const performSignIn = useCallback(
    async (walletAddress, referralCode) => {
      // 1. Switch chain if needed
      if (chainId !== TARGET_CHAIN_ID) {
        await switchChainAsync({ chainId: TARGET_CHAIN_ID });
      }

      // 2. Get nonce
      const { data: nonceData } = await api.get('/api/auth/nonce', {
        params: { wallet: walletAddress },
      });

      // 3. Sign message
      const signature = await signMessageAsync({ message: nonceData.message });

      // 4. POST to backend
      const { data } = await api.post('/api/auth/connect', {
        walletAddress,
        signature,
        referralCode: referralCode || undefined,
      });

      // 5. Store auth
      setAuth(data.user, data.token);

      return { success: true, user: data.user, isNewUser: data.isNewUser };
    },
    [chainId, switchChainAsync, signMessageAsync, setAuth]
  );

  const login = useCallback(
    async ({ referralCode = '' } = {}) => {
      setLoading(true);
      setError(null);

      try {
        // If already connected and we have an address, sign in immediately
        if (isConnected && address) {
          const result = await performSignIn(address, referralCode);
          setLoading(false);
          return result;
        }

        // Otherwise: connect wallet, then resume via the useEffect below.
        // Smart connector selection:
        //   - If window.ethereum exists (browser has MetaMask/Trust extension) → use injected
        //   - Otherwise (mobile Chrome/Safari without wallet extension) → use WalletConnect
        //     which shows a QR code or deep-links to the wallet app
        return await new Promise((resolve, reject) => {
          pendingRef.current = { referralCode, resolve, reject };

          const hasInjected = typeof window !== 'undefined' && !!window.ethereum;
          const connector = hasInjected
            ? connectors.find((c) => c.type === 'injected') || connectors[0]
            : connectors.find((c) => c.type === 'walletConnect') || connectors[0];

          connectAsync({ connector }).catch((err) => {
            pendingRef.current = null;
            const message = err?.shortMessage || err?.message || 'Connection cancelled';
            setError(message);
            setLoading(false);
            reject(new Error(message));
          });
        });
      } catch (err) {
        const message =
          err?.response?.data?.error || err?.shortMessage || err?.message || 'Sign-in failed';
        setError(message);
        setLoading(false);
        return { success: false, error: message };
      }
    },
    [isConnected, address, connectors, connectAsync, performSignIn]
  );

  // Resume pending sign-in once the wallet is connected and address is available.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (!isConnected || !address) return;

    pendingRef.current = null;
    performSignIn(address, pending.referralCode)
      .then((result) => {
        setLoading(false);
        pending.resolve(result);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.error || err?.shortMessage || err?.message || 'Sign-in failed';
        setError(message);
        setLoading(false);
        pending.reject(err);
      });
  }, [isConnected, address, performSignIn]);

  const logout = useCallback(() => {
    pendingRef.current = null;
    disconnect();
    storeLogout();
  }, [disconnect, storeLogout]);

  return {
    login,
    logout,
    loading,
    error,
    isConnected,
    isAuthenticated,
    address,
    user,
    isAdmin,
    isSuperAdmin,
    isOperationalAdmin,
    adminRole,
    chainId,
  };
}
