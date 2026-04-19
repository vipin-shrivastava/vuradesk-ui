import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { setGlobalLogout } from '@/utils/authUtils';
import { queryClient } from '@/lib/queryClient';
import { toast } from 'sonner';

type Role = 'CUSTOMER' | 'AGENT' | 'SUB_ADMIN' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  defaultRole?: Role | null;
  profilePicture?: string;
  permissions: string[];
  authorities?: string[]; // Accept authorities from backend
  agentEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  updateLocalRole: (selectedRole: Role) => Promise<void>;
  isAuthenticated: boolean;
  setActiveRole: (role: string) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const normalizeRole = (role: any): Role | null => {
  if (typeof role === 'string') {
    return role.replace(/^ROLE_/, '') as Role;
  }
  return null;
};

const initializeAuthState = () => {
  try {
    const token = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('authUser');
    if (token && storedUser) {
      const userData: User = JSON.parse(storedUser);
      const normalizedRoles = (userData.roles || []).map(r => normalizeRole(r)).filter(Boolean) as Role[];
      const userWithNormalizedRoles: User = {
        ...userData,
        roles: normalizedRoles,
        username: userData.username || userData.email,
        permissions: Array.from(new Set([
          ...(userData.authorities || []),
          ...(userData.permissions || [])
        ])),
      };

      const storedActiveRole = localStorage.getItem('activeRole') as Role;
      let activeRoleToSet: Role | null = null;

      if (storedActiveRole && normalizedRoles.includes(storedActiveRole)) {
        activeRoleToSet = storedActiveRole;
      } else if (userWithNormalizedRoles.defaultRole && normalizedRoles.includes(userWithNormalizedRoles.defaultRole)) {
        activeRoleToSet = userWithNormalizedRoles.defaultRole;
      } else if (normalizedRoles.length === 1) {
        activeRoleToSet = normalizedRoles[0];
      }

      if (!activeRoleToSet && normalizedRoles.length > 0) {
        activeRoleToSet = normalizedRoles[0];
      }

      return {
        user: userWithNormalizedRoles,
        activeRole: activeRoleToSet,
      };
    }
  } catch (error) {
    console.error("Failed to initialize auth state from localStorage. Clearing storage.", error);
    localStorage.clear();
  }
  return { user: null, activeRole: null };
};

const { user: initialUser, activeRole: initialActiveRole } = initializeAuthState();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [activeRole, setActiveRoleState] = useState<Role | null>(initialActiveRole);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('activeRole');
    setUser(null);
    setActiveRoleState(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, proceeding with client-side logout.", error);
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  }, [clearSession, navigate]);

  const setActiveRole = useCallback((role: string) => {
    if (user && user.roles.includes(role as Role)) {
      setActiveRoleState(role as Role);
      localStorage.setItem('activeRole', role);
      queryClient.clear();
      navigate('/tickets', { replace: true });
      window.location.reload();
    }
  }, [user, navigate]);

  const login = useCallback((token: string, userData: User) => {
    clearSession();
    localStorage.setItem('jwtToken', token);

    const normalizedRoles = (userData.roles || []).map(r => normalizeRole(r)).filter(Boolean) as Role[];
    const normalizedDefaultRole = userData.defaultRole ? normalizeRole(userData.defaultRole) : null;

    const userToSet: User = {
      ...userData,
      roles: normalizedRoles,
      defaultRole: normalizedDefaultRole,
      username: userData.username || userData.email,
      permissions: Array.from(new Set([
        ...(userData.authorities || []),
        ...(userData.permissions || [])
      ])),
    };
    setUser(userToSet);
    localStorage.setItem('authUser', JSON.stringify(userToSet));

    let roleToActivate: Role | null = null;

    if (normalizedDefaultRole && normalizedRoles.includes(normalizedDefaultRole)) {
      roleToActivate = normalizedDefaultRole;
    } else if (normalizedRoles.length === 1) {
      roleToActivate = normalizedRoles[0];
    } else if (normalizedRoles.length > 0) {
      roleToActivate = normalizedRoles[0];
    }

    if (roleToActivate) {
      setActiveRoleState(roleToActivate);
      localStorage.setItem('activeRole', roleToActivate);
      if (normalizedRoles.length > 1 && !normalizedDefaultRole) {
        navigate('/select-role', { replace: true });
      } else {
        navigate('/tickets', { replace: true });
      }
    } else {
      logout();
    }
  }, [clearSession, navigate, logout]);

  const updateLocalRole = useCallback(async (selectedRole: Role) => {
    await axiosClient.put('/users/me/preferences', { defaultRole: selectedRole });

    if (user) {
      const updatedUser: User = { ...user, defaultRole: selectedRole };
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  useEffect(() => {
    const responseInterceptor = axiosClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 403 && error.response?.data?.error === 'ROLE_DISABLED') {
          toast.error('Your Agent session has expired or been deactivated.');
          setActiveRole('CUSTOMER');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
  }, [setActiveRole]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('jwtToken');
      if (token && !user) { // Only fetch if there's a token but no user object
        try {
          const response = await axiosClient.get('/users/me');
          const userData = response.data;
          // Use the login function to set the user state correctly
          login(token, userData);
        } catch (error) {
          console.error("Failed to fetch user profile on reload, logging out.", error);
          logout();
        }
      }
    };
    fetchUserProfile();
  }, [user, login, logout]);

  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);

  const value = {
    user,
    activeRole,
    login,
    logout,
    updateLocalRole,
    isAuthenticated: !!user,
    setActiveRole,
    setUser,
    hasPermission: (permission: string) => {
      if (!user || !activeRole) return false;

      // 1. Super Admin Role always has all permissions
      if (user.roles.includes('SUPER_ADMIN' as any)) {
        return true;
      }

      const activeRoleStr = `ROLE_${activeRole}`;
      
      // 2. Check if the permission belongs to the current active role
      const hasRolePermission = user.permissions.includes(`${activeRoleStr}:${permission}`);
      if (hasRolePermission) return true;

      // 3. Check if it's a direct permission (Staff Roles only)
      const isStaffRole = activeRole !== 'CUSTOMER';
      if (isStaffRole && user.permissions.includes(`DIRECT:${permission}`)) {
        return true;
      }

      return false;
    },
    hasAnyRole: (roles: Role[]) => {
      if (!user) return false;
      // Super Admin is effectively all roles
      if (user.roles.includes('SUPER_ADMIN' as any)) return true;
      return roles.some(role => user.roles.includes(role));
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
