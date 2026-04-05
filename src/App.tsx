import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicTicketPage from './pages/PublicTicketPage';
import DashboardPage from './pages/DashboardPage';
import SelectRolePage from './pages/SelectRolePage';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import SettingsPage from './pages/SettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/submit-ticket" element={<PublicTicketPage />} />
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
    </Routes>
  );
}

export default App;
