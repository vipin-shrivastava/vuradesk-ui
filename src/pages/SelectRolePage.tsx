import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';

// Define a more robust Role type
type Role = string | { id: number | string; name: string };

const SelectRolePage: React.FC = () => {
  const { user, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [setAsDefault, setSetAsDefault] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role to continue.');
      return;
    }

    // Set the active role in the context immediately for instant UI transition
    setActiveRole(selectedRole);

    // If the user wants to set this role as their default, attempt to save it.
    // Use a try/catch block to ensure navigation happens even if this API call fails.
    if (setAsDefault) {
      try {
        await axiosClient.put('/users/me/preferences', { defaultRole: selectedRole });
        toast.success('Default role saved.');
      } catch (error) {
        console.error('Failed to save default role preference:', error);
        toast.warning('Could not save your default role preference, but you can continue.');
      }
    }

    // Always navigate to the dashboard after setting the active role.
    navigate('/dashboard');
  };

  // Guard against users who shouldn't be on this page
  if (!user || !user.roles || user.roles.length <= 1) {
    return <Navigate to="/dashboard" replace />;
  }

  // Helper to get the value and name from a role object or string
  const getRoleName = (role: Role): string => (typeof role === 'string' ? role : role.name);

  // Main component render
  const renderContent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Select Your Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Available Roles
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>-- Please choose a role --</option>
              {user.roles.map((role: Role) => (
                <option key={getRoleName(role)} value={getRoleName(role)}>
                  {getRoleName(role)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Set as my default role</span>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Safety net return
  return user && user.roles ? renderContent() : <div>Loading user data...</div>;
};

export default SelectRolePage;
