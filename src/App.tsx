import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicTicketPage from './pages/PublicTicketPage';
import DashboardPage from './pages/DashboardPage';
import SelectRolePage from './pages/SelectRolePage';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import SettingsPage from './pages/SettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ProfilePage from './pages/ProfilePage';
import AccessControlPage from './pages/settings/AccessControlPage';
import TeamPage from './pages/admin/TeamPage';
import MailboxPage from './pages/admin/MailboxPage';
import SecurityDebugger from './components/SecurityDebugger';
import './App.css';

function App() {
  return (
    <>
      <SecurityDebugger />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/submit-ticket" element={<PublicTicketPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<LoginPage />} />

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
                <DashboardPage />
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
    </>
  );
}

export default App;
