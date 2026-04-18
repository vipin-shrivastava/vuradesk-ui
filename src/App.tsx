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
import { TicketProvider } from './contexts/TicketContext';
import './App.css';

function App() {
  return (
    <>
      <SecurityDebugger />
      <TicketProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/submit-ticket" element={<PublicLayout><PublicTicketPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
          <Route path="/setup" element={<PublicLayout><SetupWizard /></PublicLayout>} />
          <Route path="/" element={<PublicLayout><LoginPage /></PublicLayout>} />

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
            path="/admin/access-control"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AccessControlPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team/edit/:agentId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditAgentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mailbox"
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
