import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StarfieldCanvas from '../StarfieldCanvas';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/games', label: 'Games', icon: '🎯' },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: '💸' },
  { to: '/admin/pools', label: 'Pools', icon: '💧' },
  { to: '/admin/deposits', label: 'Deposits', icon: '📥' },
  { to: '/admin/config', label: 'Config', icon: '⚙️' },
  { to: '/admin/luckydraw', label: 'Lucky Draw', icon: '🎰' },
  { to: '/admin/club', label: 'Club', icon: '🏆' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/logs', label: 'Logs', icon: '📜' },
  { to: '/admin/roles', label: 'Roles', icon: '🔑', superOnly: true },
];

const ROLE_BADGE = {
  SUPER: { label: 'SUPER ADMIN', color: 'text-pink border-pink/30 bg-pink/10' },
  OPERATIONAL: { label: 'OPS ADMIN', color: 'text-gold border-gold/30 bg-gold/10' },
  NORMAL: { label: 'VIEW ONLY', color: 'text-cyan border-cyan/30 bg-cyan/10' },
};

export default function AdminLayout({ children }) {
  const { isAuthenticated, isAdmin, isSuperAdmin, adminRole, address, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div>
        <StarfieldCanvas />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-pink font-orbitron text-[0.85rem]">
            🔒 Admin access required — redirecting...
          </div>
        </div>
      </div>
    );
  }

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const badge = ROLE_BADGE[adminRole] || ROLE_BADGE.NORMAL;

  // Filter nav links by role
  const visibleLinks = ADMIN_LINKS.filter((link) => {
    if (link.superOnly && !isSuperAdmin) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <StarfieldCanvas />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] px-6 py-3 flex items-center justify-between bg-[rgba(3,0,16,0.92)] backdrop-blur-[20px] border-b border-pink/20">
        <div className="flex items-center gap-3">
          <div className="font-orbitron text-[0.85rem] font-black text-gradient-gold tracking-[0.2em]">
            ⛓ TOP GALAXY <span className="text-pink">ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.68rem] tracking-[0.1em] hover:bg-cyan/20 transition-all"
          >
            ← USER DASHBOARD
          </Link>
          {/* Role badge */}
          <div className={`px-3 py-1.5 rounded-full border font-orbitron text-[0.68rem] tracking-[0.15em] ${badge.color}`}>
            🛡️ {badge.label}
          </div>
          <span className="hidden md:inline font-orbitron text-[0.6rem] text-gold">{shortAddress}</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-orbitron text-[0.68rem] hover:border-pink/40 hover:text-pink transition-all"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <div className="relative z-10 flex pt-[60px]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[200px] min-h-[calc(100vh-60px)] border-r border-white/5 bg-[rgba(3,0,16,0.6)] backdrop-blur-[10px] py-6 px-3 sticky top-[60px]">
          <nav className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg font-orbitron text-[0.65rem] tracking-[0.1em] transition-all ${
                    isActive
                      ? 'bg-gold/10 border border-gold/30 text-gold'
                      : 'text-white/40 hover:text-gold hover:bg-white/3 border border-transparent'
                  }`
                }
              >
                <span className="text-[1rem]">{link.icon}</span>
                <span>{link.label.toUpperCase()}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.6rem] tracking-[0.1em] hover:bg-cyan/20 transition-all"
            >
              ← BACK TO USER APP
            </Link>
          </div>
        </aside>

        {/* Mobile sidebar (horizontal scroll) */}
        <aside className="md:hidden fixed top-[60px] left-0 right-0 z-[999] bg-[rgba(3,0,16,0.95)] backdrop-blur-[10px] border-b border-white/10 overflow-x-auto">
          <nav className="flex gap-1 px-3 py-2 min-w-max">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-orbitron text-[0.68rem] whitespace-nowrap ${
                    isActive ? 'bg-gold/10 text-gold border border-gold/30' : 'text-white/40 border border-transparent'
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.label.toUpperCase()}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 pt-16 md:pt-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
