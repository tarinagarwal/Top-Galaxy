import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Wallet from './pages/Wallet';
import PracticeGame from './pages/PracticeGame';
import Game from './pages/Game';
import GameHistory from './pages/GameHistory';
import Cashback from './pages/Cashback';
import LuckyDraw from './pages/LuckyDraw';
import LuckyDrawHistory from './pages/LuckyDrawHistory';
import Club from './pages/Club';
import Income from './pages/Income';
import Transactions from './pages/Transactions';
import Referrals from './pages/Referrals';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGames from './pages/admin/AdminGames';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminPools from './pages/admin/AdminPools';
import AdminConfig from './pages/admin/AdminConfig';
import AdminLuckyDraw from './pages/admin/AdminLuckyDraw';
import AdminLuckyDrawHistory from './pages/admin/AdminLuckyDrawHistory';
import AdminClub from './pages/admin/AdminClub';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';
import AdminRoles from './pages/admin/AdminRoles';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import { ProtectedRoute, AdminRoute, SuperAdminRoute } from './components/ProtectedRoute';
import AnnouncementBanner from './components/AnnouncementBanner';
import { useAccountWatcher } from './hooks/useAccountWatcher';
import { useGlobalNotifications } from './hooks/useGlobalNotifications';
// Eagerly import useSocket so its window-level disconnect helper is registered
// before any logout button can fire (the auth store calls it via window).
// eslint-disable-next-line no-unused-vars
import * as _useSocketModule from './hooks/useSocket';

const queryClient = new QueryClient();

function AppRoutes() {
  // Watch for MetaMask account changes; auto-logout if wallet differs from auth
  useAccountWatcher();
  // Global socket listener for cross-page notifications (practice expiry, announcements)
  useGlobalNotifications();

  return (
    <>
      <AnnouncementBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><PracticeGame /></ProtectedRoute>} />
      <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/game/history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
      <Route path="/cashback" element={<ProtectedRoute><Cashback /></ProtectedRoute>} />
      <Route path="/lucky-draw" element={<ProtectedRoute><LuckyDraw /></ProtectedRoute>} />
      <Route path="/lucky-draw/history" element={<ProtectedRoute><LuckyDrawHistory /></ProtectedRoute>} />
      <Route path="/club" element={<ProtectedRoute><Club /></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/games" element={<AdminRoute><AdminGames /></AdminRoute>} />
      <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
      <Route path="/admin/pools" element={<AdminRoute><AdminPools /></AdminRoute>} />
      <Route path="/admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
      <Route path="/admin/luckydraw" element={<AdminRoute><AdminLuckyDraw /></AdminRoute>} />
      <Route path="/admin/luckydraw/history" element={<AdminRoute><AdminLuckyDrawHistory /></AdminRoute>} />
      <Route path="/admin/club" element={<AdminRoute><AdminClub /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
      <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="/admin/roles" element={<SuperAdminRoute><AdminRoles /></SuperAdminRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
