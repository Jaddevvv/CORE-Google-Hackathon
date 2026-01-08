import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { WorkspaceProvider } from './contexts/WorkspaceContext.jsx';
import MainLayout from './components/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import DemoInteractivePage from './pages/DemoInteractivePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ContactPage from './pages/TemplatesPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AnalysisCompletePage from './pages/AnalysisCompletePage.jsx';
import DashboardOverviewPage from './pages/DashboardOverviewPage.jsx';
import DashboardQueriesPage from './pages/DashboardQueriesPage.jsx';
import DashboardCompetitorsPage from './pages/DashboardCompetitorsPage.jsx';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes with MainLayout (header/footer) */}
      {!isAuthenticated && (
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/demo/interactive" element={<DemoInteractivePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/password-recovery" element={<PasswordRecoveryPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
        </Route>
      )}

      {/* Authenticated routes WITHOUT MainLayout (no header/footer) */}
      <Route path="/app/dashboard" element={
        <ProtectedRoute>
          <UserDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      <Route path="/analysis-complete" element={
        <ProtectedRoute>
          <AnalysisCompletePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/overview" element={
        <ProtectedRoute>
          <DashboardOverviewPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/queries" element={
        <ProtectedRoute>
          <DashboardQueriesPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/competitors" element={
        <ProtectedRoute>
          <DashboardCompetitorsPage />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
