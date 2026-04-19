import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<'CUSTOMER' | 'AGENT' | 'SUB_ADMIN' | 'ADMIN'>;
  fallback?: ReactNode; // Optional UI to show if access is denied
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback = null }) => {
  const { user, isAuthenticated } = useAuth();

  // If the user is not authenticated or their role is not in the allowed list,
  // do not render the children.
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // If they have the correct role, render the children
  return <>{children}</>;
};

export default RoleGuard;
