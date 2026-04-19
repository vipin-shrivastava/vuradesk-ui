import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  roles?: Array<'CUSTOMER' | 'AGENT' | 'SUB_ADMIN' | 'ADMIN'>;
  fallback?: ReactNode;
}

/**
 * A guard component that renders its children only if the user has the required permission
 * OR one of the required roles.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  roles, 
  fallback = null 
}) => {
  const { user, isAuthenticated, hasPermission, hasAnyRole } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasRequiredPermission = permission ? hasPermission(permission) : false;
  const hasRequiredRole = roles ? hasAnyRole(roles as any) : false;

  // If either requirement is met (or none were specified), show content
  if ((permission && hasRequiredPermission) || (roles && hasRequiredRole) || (!permission && !roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
