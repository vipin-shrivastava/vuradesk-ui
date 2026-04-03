import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; // Corrected import path for LoginPage
import DashboardPage from './pages/DashboardPage'; // Corrected import to point to DashboardPage.tsx
import SelectRolePage from './pages/SelectRolePage'; // Import the new SelectRolePage
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'; // Keep global styles if any

function App() {
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
