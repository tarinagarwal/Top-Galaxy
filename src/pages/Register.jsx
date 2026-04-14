import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { login, loading, error } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeLogout = useAuthStore((s) => s.logout);
  const [referralCode, setReferralCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Wallet status flags — fetched from nonce endpoint
  const [isNewUser, setIsNewUser] = useState(true);
  const [isAdminWallet, setIsAdminWallet] = useState(false);
  const [walletChecked, setWalletChecked] = useState(false);

  // Referral code validation
  const [refValid, setRefValid] = useState(null); // null = not checked, true/false
  const [refValidating, setRefValidating] = useState(false);
  const [refReferrer, setRefReferrer] = useState(null);

  // Auto-fill referral code from ?ref= query param
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  // When wallet connects/changes, check if it's a new user or admin
  useEffect(() => {
    if (!address) {
      setWalletChecked(false);
      setIsNewUser(true);
      setIsAdminWallet(false);
      return;
    }
    let cancelled = false;
    api.get(`/api/auth/nonce?wallet=${address}`)
      .then(({ data }) => {
        if (cancelled) return;
        setIsNewUser(data.isNewUser);
        setIsAdminWallet(data.isAdmin);
        setWalletChecked(true);
      })
      .catch(() => {
        if (!cancelled) setWalletChecked(true);
      });
    return () => { cancelled = true; };
  }, [address]);

  // Validate referral code with debounce
  const validateRef = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setRefValid(null);
      setRefReferrer(null);
      return;
    }
    setRefValidating(true);
    try {
      const { data } = await api.get(`/api/auth/validate-referral?code=${code.trim()}`);
      setRefValid(data.valid);
      setRefReferrer(data.referrerAddress || null);
    } catch {
      setRefValid(false);
      setRefReferrer(null);
    }
    setRefValidating(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => validateRef(referralCode), 400);
    return () => clearTimeout(timer);
  }, [referralCode, validateRef]);

  // Redirect to dashboard once successfully authenticated
  useEffect(() => {
    if (isAuthenticated && submitted) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, submitted, navigate]);

  // Referral is required for new non-admin users
  const referralRequired = isNewUser && !isAdminWallet;
  const canRegister = !referralRequired || (referralCode.trim() && refValid === true);

  // Step 1: Connect wallet (no SIWE signing yet)
  // Try injected (MetaMask) first — instant if extension exists.
  // If no extension found, fall back to WalletConnect (QR modal).
  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Check if an injected provider (MetaMask/Trust/etc.) exists in the browser
      const hasInjected = typeof window !== 'undefined' && !!window.ethereum;
      if (hasInjected) {
        await connectAsync({ connector: connectors[0] }); // injected
      } else if (connectors[1]) {
        await connectAsync({ connector: connectors[1] }); // WalletConnect QR
      }
    } catch (err) {
      // Injected failed (user rejected, or provider issue) — try WalletConnect
      if (connectors[1]) {
        try {
          await connectAsync({ connector: connectors[1] });
        } catch (err2) {
          console.error('Connect failed:', err2);
        }
      }
    }
    setConnecting(false);
  };

  // Step 2: Register / Sign In (SIWE signing happens here)
  const handleRegister = async () => {
    if (referralRequired && !referralCode.trim()) return;
    setSubmitted(true);
    await login({ referralCode });
  };

  const handleSwitchAccount = () => {
    storeLogout();
    disconnect();
    setSubmitted(false);
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div>
      <StarfieldCanvas />
      <Navbar />
      <div className="relative z-10 min-h-screen pt-[120px] pb-12 px-6 flex flex-col items-center">
        <div className="max-w-[600px] w-full">
          <div className="text-center mb-8">
            <div className="font-orbitron text-[0.6rem] tracking-[0.3em] text-cyan uppercase mb-3">
              🚀 JOIN THE GALAXY
            </div>
            <h1 className="font-russo text-[clamp(2rem,5vw,3.5rem)] text-gradient-gold mb-3">
              Create Your Account
            </h1>
            <p className="text-white/50 text-[0.85rem] leading-relaxed">
              Connect your wallet to instantly create your Top Galaxy account.
              No email, no password — just sign with your wallet.
            </p>
          </div>

          <div className="card-glass rounded-3xl p-8 border border-gold/20">
            {/* Step 1: Connect wallet first */}
            {!isConnected ? (
              <div className="text-center">
                <div className="text-[0.7rem] text-white/50 mb-4 font-orbitron">
                  First, connect your wallet to get started
                </div>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full py-3.5 rounded-xl font-orbitron text-[0.75rem] font-bold tracking-[0.12em] bg-gradient-to-br from-gold to-gold2 text-black transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? '⏳ CONNECTING...' : '🔗 CONNECT WALLET'}
                </button>
                {!walletChecked && isConnected && (
                  <div className="mt-3 text-[0.6rem] text-white/30 font-orbitron">Checking wallet...</div>
                )}
              </div>
            ) : (
            <>
            {/* Active wallet display */}
            <div className="mb-6 p-4 rounded-xl bg-cyan/5 border border-cyan/20">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[0.68rem] font-orbitron text-cyan tracking-[0.15em] mb-1">
                      CONNECTED WALLET
                    </div>
                    <div className="font-orbitron text-white text-[0.85rem]">
                      {shortAddress}
                    </div>
                    {isAuthenticated && (
                      <div className="text-[0.6rem] text-green mt-1">
                        ✓ Already signed in to Top Galaxy
                      </div>
                    )}
                    {!walletChecked && (
                      <div className="text-[0.6rem] text-white/30 mt-1">
                        ⏳ Checking wallet status...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSwitchAccount}
                    className="px-3 py-1.5 rounded-lg text-[0.68rem] font-orbitron text-pink border border-pink/30 bg-pink/5 hover:bg-pink/10 transition-colors"
                  >
                    SWITCH
                  </button>
                </div>
              </div>

            {/* Referral code — mandatory for new users, skip for returning/admin */}
            {isAdminWallet ? (
              <div className="mb-6 p-4 rounded-xl bg-gold/5 border border-gold/20">
                <div className="text-[0.65rem] font-orbitron text-gold">
                  🛡️ ADMIN WALLET — Referral code not required
                </div>
                <div className="text-[0.55rem] text-white/30 mt-1">
                  This wallet is the platform admin. You can register without a referral code.
                </div>
              </div>
            ) : !isNewUser ? (
              <div className="mb-6 p-4 rounded-xl bg-green/5 border border-green/20">
                <div className="text-[0.65rem] font-orbitron text-green">
                  ✓ RETURNING USER — Welcome back! Just sign to log in.
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-[0.6rem] font-orbitron text-white/50 mb-2 tracking-[0.15em]">
                  REFERRAL CODE <span className="text-pink">*REQUIRED</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter your referral code"
                    disabled={isAuthenticated && submitted}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white font-orbitron text-[0.8rem] focus:outline-none disabled:opacity-50 ${
                      refValid === true ? 'border-green/40 focus:border-green/60' :
                      refValid === false ? 'border-pink/40 focus:border-pink/60' :
                      'border-white/10 focus:border-gold/50'
                    }`}
                  />
                  {refValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[0.6rem]">⏳</div>
                  )}
                  {!refValidating && refValid === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green text-[0.8rem]">✓</div>
                  )}
                  {!refValidating && refValid === false && referralCode.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-pink text-[0.8rem]">✗</div>
                  )}
                </div>
                {searchParams.get('ref') && refValid === true && (
                  <div className="mt-2 text-[0.6rem] text-cyan font-orbitron">
                    ✓ Auto-filled from invitation link
                  </div>
                )}
                {refValid === true && refReferrer && (
                  <div className="mt-2 text-[0.55rem] text-green font-orbitron">
                    ✓ Valid — referred by {refReferrer}
                  </div>
                )}
                {refValid === false && referralCode.trim() && (
                  <div className="mt-2 text-[0.55rem] text-pink font-orbitron">
                    ✗ Invalid referral code — check with your referrer
                  </div>
                )}
                {!referralCode.trim() && (
                  <div className="mt-2 text-[0.55rem] text-pink/60">
                    You need a referral code to register. Ask someone on the platform for their code.
                  </div>
                )}
              </div>
            )}

            {/* Steps */}
            <div className="text-[0.7rem] text-white/50 leading-relaxed mb-6">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-gold font-bold">①</span>
                <span>Verify the connected wallet above is correct</span>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-gold font-bold">②</span>
                <span>Sign the authentication message (no gas required)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold">③</span>
                <span>Account created — practice balance credited instantly</span>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || (isAuthenticated && submitted) || (referralRequired && !canRegister) || !walletChecked}
              className="w-full py-3 rounded-xl font-orbitron text-[0.75rem] font-bold tracking-[0.12em] bg-gradient-to-br from-gold to-gold2 text-black transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading
                ? '⏳ SIGNING IN...'
                : isAuthenticated && submitted
                ? '✓ REGISTERED — REDIRECTING...'
                : !walletChecked
                ? '⏳ CHECKING WALLET...'
                : !isNewUser
                ? '🔑 SIGN IN'
                : isAdminWallet
                ? '🛡️ REGISTER AS ADMIN'
                : referralCode && refValid
                ? '🚀 REGISTER WITH CODE'
                : '🚀 ENTER REFERRAL CODE TO REGISTER'}
            </button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-pink/5 border border-pink/20 text-pink text-[0.7rem]">
                {error}
              </div>
            )}
            </>
            )}
          </div>

          <div className="mt-6 text-center text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.1em]">
            BSC MAINNET · 18+ ONLY · ONE ACCOUNT POLICY
          </div>
        </div>
      </div>
    </div>
  );
}
