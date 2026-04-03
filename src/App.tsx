import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SelectRolePage from './pages/SelectRolePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  // isSessionChecked is now always true due to synchronous initialization in AuthProvider
  // No need for a loading guard here anymore.

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/select-role"
        element={
          <ProtectedRoute>
            <SelectRolePage />
          </ProtectedRoute>
        }
      />
      {/* Add a default route or redirect to login */}
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
