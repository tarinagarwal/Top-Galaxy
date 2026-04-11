import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { login, loading, error } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeLogout = useAuthStore((s) => s.logout);
  const [referralCode, setReferralCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill referral code from ?ref= query param
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  // Redirect to dashboard once successfully authenticated
  useEffect(() => {
    if (isAuthenticated && submitted) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, submitted, navigate]);

  const handleRegister = async () => {
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
            {/* Active wallet display */}
            {isConnected && (
              <div className="mb-6 p-4 rounded-xl bg-cyan/5 border border-cyan/20">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[0.55rem] font-orbitron text-cyan tracking-[0.15em] mb-1">
                      ACTIVE METAMASK ACCOUNT
                    </div>
                    <div className="font-orbitron text-white text-[0.85rem]">
                      {shortAddress}
                    </div>
                    {isAuthenticated && (
                      <div className="text-[0.6rem] text-green mt-1">
                        ✓ Already signed in to Top Galaxy
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSwitchAccount}
                    className="px-3 py-1.5 rounded-lg text-[0.55rem] font-orbitron text-pink border border-pink/30 bg-pink/5 hover:bg-pink/10 transition-colors"
                  >
                    SWITCH ACCOUNT
                  </button>
                </div>
                <div className="mt-3 text-[0.6rem] text-white/40 leading-relaxed">
                  To register a different account: click <span className="text-pink">SWITCH ACCOUNT</span> above,
                  then in MetaMask click your account icon → select a different account → come back and click Register.
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[0.6rem] font-orbitron text-white/50 mb-2 tracking-[0.15em]">
                REFERRAL CODE (Optional but recommended)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Paste referral code here"
                disabled={isAuthenticated && submitted}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-orbitron text-[0.8rem] focus:outline-none focus:border-gold/50 disabled:opacity-50"
              />
              {searchParams.get('ref') && (
                <div className="mt-2 text-[0.6rem] text-cyan font-orbitron">
                  ✓ Auto-filled from invitation link
                </div>
              )}
              {!referralCode && (
                <div className="mt-2 text-[0.6rem] text-white/30">
                  No referral? You can still register without a code.
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="text-[0.7rem] text-white/50 leading-relaxed mb-6">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-gold font-bold">①</span>
                <span>{isConnected ? 'Verify the active wallet above is correct' : 'Click "Register" — MetaMask will open'}</span>
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
              disabled={loading || (isAuthenticated && submitted)}
              className="w-full py-3 rounded-xl font-orbitron text-[0.75rem] font-bold tracking-[0.12em] bg-gradient-to-br from-gold to-gold2 text-black transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading
                ? '⏳ CONNECTING...'
                : isAuthenticated && submitted
                ? '✓ REGISTERED — REDIRECTING...'
                : referralCode
                ? `🚀 REGISTER WITH CODE`
                : '🚀 REGISTER'}
            </button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-pink/5 border border-pink/20 text-pink text-[0.7rem]">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-[0.6rem] text-white/60 font-orbitron font-bold tracking-[0.1em]">
            BSC TESTNET ONLY · 18+ ONLY · ONE ACCOUNT POLICY
          </div>
        </div>
      </div>
    </div>
  );
}
