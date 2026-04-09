import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ConnectWalletButton from './ConnectWalletButton';

// Add nav links here as features are built. Each: { to, label, requiresAuth?, requiresAdmin? }
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register', hideWhenAuth: true },
  { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { to: '/income', label: 'Income', requiresAuth: true },
  { to: '/wallet', label: 'Wallet', requiresAuth: true },
  { to: '/game', label: 'Game', requiresAuth: true },
  { to: '/practice', label: 'Practice', requiresAuth: true },
  { to: '/referrals', label: 'Referrals', requiresAuth: true },
  { to: '/cashback', label: 'Cashback', requiresAuth: true },
  { to: '/club', label: 'Club', requiresAuth: true },
  { to: '/lucky-draw', label: 'Lucky Draw', requiresAuth: true },
  { to: '/transactions', label: 'Transactions', requiresAuth: true },
  { to: '/admin', label: '🛡️ Admin', requiresAuth: true, requiresAdmin: true },
];

export default function Navbar() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.requiresAuth && !isAuthenticated) return false;
    if (link.hideWhenAuth && isAuthenticated) return false;
    if (link.requiresAdmin && !isAdmin) return false;
    return true;
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-[12px] md:px-[30px] py-[14px] flex items-center justify-between bg-[rgba(3,0,16,0.88)] backdrop-blur-[20px] border-b border-[rgba(255,215,0,0.1)]">
        {/* Left group: hamburger (mobile) + logo */}
        <div className="flex items-center gap-2">
          {/* Hamburger button — left side, always visible on small screens */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors"
          >
            <div className="relative w-4 h-3">
              <span
                className={`absolute left-0 top-0 w-4 h-[2px] bg-gold transition-all duration-300 ${
                  mobileOpen ? 'translate-y-[5px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[5px] w-4 h-[2px] bg-gold transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[10px] w-4 h-[2px] bg-gold transition-all duration-300 ${
                  mobileOpen ? '-translate-y-[5px] -rotate-45' : ''
                }`}
              />
            </div>
          </button>

          <Link to="/" className="font-orbitron text-[0.9rem] font-black text-gold tracking-[0.2em] no-underline">
            ⛓ TOP<span className="text-cyan">GALAXY</span>
          </Link>
        </div>

        {/* Desktop nav (md+) */}
        <ul className="hidden md:flex gap-[22px] list-none">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`font-orbitron text-[0.55rem] tracking-[0.15em] no-underline uppercase transition-colors duration-300 ${
                    isActive ? 'text-gold' : 'text-white/40 hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <ConnectWalletButton />
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-[990] bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer panel — slides down from top */}
      <div
        className={`md:hidden fixed top-[60px] left-0 right-0 z-[995] bg-[rgba(3,0,16,0.97)] backdrop-blur-[20px] border-b border-gold/20 transition-all duration-300 origin-top ${
          mobileOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <ul className="list-none flex flex-col py-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block px-6 py-3 font-orbitron text-[0.7rem] tracking-[0.15em] no-underline uppercase border-l-2 transition-all duration-200 ${
                    isActive
                      ? 'text-gold border-gold bg-gold/5'
                      : 'text-white/60 border-transparent hover:text-gold hover:border-gold/40 hover:bg-gold/5'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
