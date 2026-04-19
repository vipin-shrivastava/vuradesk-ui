import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, activeRole } = useAuth();
  const location = useLocation();

  console.log(
    `[ProtectedRoute] Path: ${location.pathname}, Authenticated: ${isAuthenticated}, ActiveRole: ${activeRole}`
  );

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // "Safety" Role: If activeRole is somehow "UNDEFINED" or null, default to 'CUSTOMER' for redirection logic
  const effectiveRole = activeRole === 'UNDEFINED' || !activeRole ? 'CUSTOMER' : activeRole;
  const isCustomer = effectiveRole === 'CUSTOMER';
  const isAgentOrAdmin = effectiveRole === 'AGENT' || effectiveRole === 'ADMIN' || effectiveRole === 'SUBADMIN';

  // Customer Redirection Logic - Moved here for higher priority
  if (isCustomer && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/tickets" replace />;
  }

  // Agent/Admin Redirection Logic: If an internal user tries to access /inbox, redirect to /dashboard
  if (isAgentOrAdmin && location.pathname.startsWith('/inbox')) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated, but has multiple roles and no active role is selected,
  // and they are not already on the select-role page, redirect them.
  if (user && user.roles && user.roles.length > 1 && !activeRole && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
