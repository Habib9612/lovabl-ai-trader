import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import TradingAnalysis from '@/pages/dashboard/TradingAnalysis';
import Portfolio from '@/pages/dashboard/Portfolio';
import Education from '@/pages/dashboard/Education';
import Watchlist from '@/pages/dashboard/Watchlist';
import AIAnalytics from '@/pages/dashboard/AIAnalytics';
import Settings from '@/pages/dashboard/Settings';
import NotFound from '@/pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="trading" element={<TradingAnalysis />} />
              <Route path="ai-analytics" element={<AIAnalytics />} />
              <Route path="patterns" element={<div>Pattern Recognition Page - Coming Soon</div>} />
              <Route path="signals" element={<div>Signals Page - Coming Soon</div>} />
              <Route path="community" element={<div>Community Page - Coming Soon</div>} />
              <Route path="leaderboard" element={<div>Leaderboard Page - Coming Soon</div>} />
              <Route path="education" element={<Education />} />
              <Route path="risk" element={<div>Risk Management Page - Coming Soon</div>} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="markets" element={<div>Global Markets Page - Coming Soon</div>} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;