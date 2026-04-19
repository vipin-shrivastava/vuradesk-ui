import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BrandedLoadingOverlay from './BrandedLoadingOverlay';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isSessionChecked } = useAuth();

  // While the session is being checked on app load, show a loading screen.
  if (!isSessionChecked) {
    return <BrandedLoadingOverlay isVisible={true} />;
  }

  // If the session check is complete and the user IS authenticated,
  // redirect them away from the guest page (e.g., login) to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If the session check is complete and the user is NOT authenticated,
  // render the child component (e.g., the login page).
  return <>{children}</>;
};

export default GuestRoute;
