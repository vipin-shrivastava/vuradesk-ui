import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/Login'; // Updated import path to the new Login page
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'; // Keep global styles if any

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Protect the Dashboard route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* Add a default route or redirect to login */}
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
