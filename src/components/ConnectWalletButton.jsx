import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ConnectWalletButton
 *
 * Two modes:
 * - "redirect" (default): when unauthenticated, click navigates to /register so
 *   the user can enter a referral code before signing in. Used in the navbar.
 * - "inline": when unauthenticated, click immediately runs the connect+sign-in
 *   flow with the provided referralCode. Used inside the Register page itself.
 */
export default function ConnectWalletButton({
  mode = 'redirect',
  referralCode = '',
  onSuccess,
  label,
}) {
  const navigate = useNavigate();
  const { login, logout, loading, error, isAuthenticated, address, user } = useAuth();

  const handleClick = async () => {
    if (isAuthenticated) {
      logout();
      return;
    }

    if (mode === 'redirect') {
      navigate('/register');
      return;
    }

    const result = await login({ referralCode });
    if (result?.success && onSuccess) onSuccess(result);
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-orbitron text-[0.6rem] tracking-[0.1em] text-gold">{shortAddress}</span>
        {user.isAdmin && (
          <span className="text-[0.5rem] px-2 py-0.5 rounded-full bg-pink/20 border border-pink/40 text-pink font-orbitron">
            ADMIN
          </span>
        )}
        <button
          onClick={handleClick}
          className="px-4 py-1.5 rounded-[30px] font-orbitron text-[0.55rem] font-bold tracking-[0.1em] bg-white/5 border border-white/10 text-white/40 cursor-pointer transition-all duration-300 hover:border-pink/40 hover:text-pink"
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-5 py-2 rounded-[30px] font-orbitron text-[0.6rem] font-bold tracking-[0.1em] bg-gradient-to-br from-gold to-gold2 text-black cursor-pointer border-none transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ CONNECTING...' : label || '🚀 CONNECT WALLET'}
      </button>
      {error && (
        <span className="text-[0.55rem] text-pink max-w-[260px] text-right">{error}</span>
      )}
    </div>
  );
}
