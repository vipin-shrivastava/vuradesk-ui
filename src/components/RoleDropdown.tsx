import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RoleDropdown: React.FC = () => {
  const { user, activeRole, setActiveRole } = useAuth();

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value;
    if (newRole) {
      setActiveRole(newRole);
      toast.success(`Role switched to ${newRole}`);
      // In a real application with a data fetching library like React Query,
      // you would invalidate queries here to refetch data for the new role.
      // e.g., queryClient.invalidateQueries();
    }
  };

  if (!user || !user.roles || user.roles.length <= 1) {
    return null; // Don't show the dropdown if there's only one role or user is not loaded
  }

  return (
    <div className="relative">
      <select
        value={activeRole || ''}
        onChange={handleRoleChange}
        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
      >
        {user.roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default RoleDropdown;
