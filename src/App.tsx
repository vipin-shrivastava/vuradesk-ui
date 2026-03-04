import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/Login';
import Dashboard from './pages/Dashboard'; // Corrected import to point to the modified Dashboard.tsx
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
            <Dashboard /> {/* Use the correctly imported Dashboard component */}
          </ProtectedRoute>
        }
      />
      {/* Add a default route or redirect to login */}
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
