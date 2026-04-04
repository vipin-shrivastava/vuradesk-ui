import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { ShieldCheck, Headset, User as UserIcon } from 'lucide-react'; // Import Lucide icons

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

    setActiveRole(selectedRole);

    if (setAsDefault) {
      try {
        await axiosClient.put('/users/me/preferences', { defaultRole: selectedRole });
        toast.success('Default role saved.');
      } catch (error) {
        console.error('Failed to save default role preference:', error);
        toast.warning('Could not save your default role preference, but you can continue.');
      }
    }

    navigate('/dashboard');
  };

  if (!user || !user.roles || user.roles.length <= 1) {
    return <Navigate to="/dashboard" replace />;
  }

  const getRoleName = (role: Role): string => (typeof role === 'string' ? role : role.name);

  // Map role names to Lucide icons
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
      case 'SUB_ADMIN':
        return <ShieldCheck size={48} className="text-blue-600 mb-4" />;
      case 'AGENT':
        return <Headset size={48} className="text-green-600 mb-4" />;
      case 'CUSTOMER':
        return <UserIcon size={48} className="text-purple-600 mb-4" />;
      default:
        return <UserIcon size={48} className="text-gray-600 mb-4" />;
    }
  };

  const renderContent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Select Your Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {user.roles.map((role: Role) => {
              const roleName = getRoleName(role);
              const isSelected = selectedRole === roleName;
              return (
                <div
                  key={roleName}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                    ${isSelected ? 'border-blue-600 shadow-md scale-105' : 'border-gray-200 hover:border-blue-400 hover:scale-105'}
                  `}
                  onClick={() => setSelectedRole(roleName)}
                >
                  {getRoleIcon(roleName)}
                  <span className="text-xl font-semibold text-gray-800">{roleName}</span>
                </div>
              );
            })}
          </div>

          <div className="mb-8 text-center">
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700 text-base">Set as my default role</span>
            </label>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
              disabled={!selectedRole}
            >
              Continue to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return user && user.roles ? renderContent() : <div>Loading user data...</div>;
};

export default SelectRolePage;
