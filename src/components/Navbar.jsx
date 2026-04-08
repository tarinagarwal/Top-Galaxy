import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ConnectWalletButton from './ConnectWalletButton';

// Add nav links here as features are built. Each: { to, label, requiresAuth?, requiresAdmin? }
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register', hideWhenAuth: true },
  { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { to: '/wallet', label: 'Wallet', requiresAuth: true },
  { to: '/game', label: 'Game', requiresAuth: true },
  { to: '/practice', label: 'Practice', requiresAuth: true },
  { to: '/cashback', label: 'Cashback', requiresAuth: true },
  { to: '/lucky-draw', label: 'Lucky Draw', requiresAuth: true },
  { to: '/club', label: 'Club', requiresAuth: true },
  { to: '/referrals', label: 'Referrals', requiresAuth: true },
  { to: '/income', label: 'Income', requiresAuth: true },
  { to: '/transactions', label: 'Transactions', requiresAuth: true },
  { to: '/admin', label: '🛡️ Admin', requiresAuth: true, requiresAdmin: true },
];

export default function Navbar() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.requiresAuth && !isAuthenticated) return false;
    if (link.hideWhenAuth && isAuthenticated) return false;
    if (link.requiresAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] px-[30px] py-[14px] flex items-center justify-between bg-[rgba(3,0,16,0.88)] backdrop-blur-[20px] border-b border-[rgba(255,215,0,0.1)]">
      <Link to="/" className="font-orbitron text-[0.9rem] font-black text-gold tracking-[0.2em] no-underline">
        ⛓ TOP<span className="text-cyan">GALAXY</span>
      </Link>
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
  );
}
