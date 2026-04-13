import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SecurityDebugger: React.FC = () => {
  const { user, activeRole } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('--- Security Debugger ---');
      console.log('User ID:', user.id);
      console.log('Username:', user.username);
      console.log('Roles:', user.roles);
      console.log('Active Role:', activeRole);
      // We are looking for authorities/permissions, which currently aren't in the User type
      // but might be returned in the raw payload if we log the whole object.
      console.log('Raw User Object:', user);
      console.log('-------------------------');
    }
  }, [user, activeRole]);

  return null; // This component doesn't render anything visible
};

export default SecurityDebugger;
