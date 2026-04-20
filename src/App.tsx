import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicTicketPage from './pages/PublicTicketPage';
import DashboardV2 from './pages/dashboard/DashboardV2'; // Import DashboardV2
import SelectRolePage from './pages/SelectRolePage';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import SettingsPage from './pages/SettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import PublicLayout from './components/PublicLayout';
import ProfilePage from './pages/ProfilePage';
import AccessControlPage from './pages/settings/AccessControlPage';
import TeamPage from './pages/admin/TeamPage';
import EditAgentPage from './pages/admin/EditAgentPage'; // Import EditAgentPage
import MailboxPage from './pages/admin/MailboxPage';
import SecurityDebugger from './components/SecurityDebugger';
import SetupWizard from './pages/setup/SetupWizard';
import TicketInboxLayout from './pages/inbox/TicketInboxLayout';
import TicketConversationPane from './pages/inbox/TicketConversationPane';
import { useSystemSettings } from './contexts/SystemSettingsContext';
import { TicketProvider } from './contexts/TicketContext';
import { useAuth } from './contexts/AuthContext';
import { getRoleSlug } from './utils/roleUtils';
import './App.css';

const RedirectToActiveRole = () => {
  const { settings } = useSystemSettings();
  const { activeRole } = useAuth();
  const appSlug = (settings.appName || 'vuradesk').toLowerCase();
  const roleSlug = getRoleSlug(activeRole);
  return <Navigate to={`/${appSlug}/${roleSlug}/dashboard`} replace />;
};

function App() {
  const { settings } = useSystemSettings();
  const appSlug = (settings.appName || 'vuradesk').toLowerCase();

  return (
    <>
      <SecurityDebugger />
      <TicketProvider>
        <Routes>
          {/* Public Routes with appName prefix */}
          <Route path="/:appName/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/:appName/public/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/:appName/public/submit-ticket" element={<PublicLayout><PublicTicketPage /></PublicLayout>} />
          <Route path="/:appName/public/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/:appName/public/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
          <Route path="/public/setup" element={<PublicLayout><SetupWizard /></PublicLayout>} />
          
          {/* Redirects for legacy routes and root */}
          <Route path="/login" element={<Navigate to={`/${appSlug}/login`} replace />} />
          <Route path="/register" element={<Navigate to={`/${appSlug}/public/register`} replace />} />
          <Route path="/submit-ticket" element={<Navigate to={`/${appSlug}/public/submit-ticket`} replace />} />
          <Route path="/forgot-password" element={<Navigate to={`/${appSlug}/public/forgot-password`} replace />} />
          <Route path="/reset-password" element={<Navigate to={`/${appSlug}/public/reset-password`} replace />} />
          <Route path="/setup" element={<Navigate to="/public/setup" replace />} />
          <Route path="/" element={<Navigate to={`/${appSlug}/login`} replace />} />

          {/* Protected Routes that DO NOT use the MainLayout */}
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <SelectRolePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes that DO use the MainLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardV2 />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketListPage filter="my-tickets" />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketInboxLayout />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            {/* Removed the hardcoded redirect to /inbox/15 */}
            <Route index element={<TicketConversationPane />} />
            <Route path=":ticketId" element={<TicketConversationPane />} />
          </Route>
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomerListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Legacy /admin/ redirect to active role slug */}
          <Route path="/admin/*" element={<RedirectToActiveRole />} />

          {/* Dynamic Role-Based Administrative Routes */}
          <Route
            path="/:roleSlug/access-control"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AccessControlPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/:roleSlug/team"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/:roleSlug/team/edit/:agentId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditAgentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/:roleSlug/mailbox"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MailboxPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </TicketProvider>
    </>
  );
}

export default App;
