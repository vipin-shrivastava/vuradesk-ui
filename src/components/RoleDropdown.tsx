import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSharedTicket } from '@/contexts/TicketContext';
import { toast } from 'sonner';
import { ChevronDown, Check } from 'lucide-react';

const RoleDropdown: React.FC = () => {
  const { user, activeRole, setActiveRole, updateLocalRole } = useAuth();
  const { setTicket, setIsSwitchingRole } = useSharedTicket();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleSelect = (newRole: string) => {
    if (newRole !== activeRole) {
      setIsSwitchingRole(true);
      setTicket(null); // Explicitly set activeTicket to null

      setTimeout(() => {
        setActiveRole(newRole);
        toast.success(`Role switched to ${newRole}`);

        // Use window.location.replace for hard redirect to a clean URL
        const isSwitchingToCustomer = newRole === 'CUSTOMER';
        window.location.replace(isSwitchingToCustomer ? '/tickets' : '/dashboard');

      }, 500); // A small delay to allow the loading shield to be visible
    }
    setIsOpen(false);
  };

  const handleSetAsDefault = async () => {
    if (!activeRole) return;
    try {
      await updateLocalRole(activeRole);
      toast.success(`Set ${activeRole} as your default role.`);
    } catch (error) {
      console.error('Failed to set default role:', error);
      toast.error('Failed to save default role preference.');
    }
  };

  if (!user || !user.roles || user.roles.length <= 1) {
    return (
      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md">
        {activeRole}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 px-3 py-2 text-sm font-medium text-left text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand"
      >
        <span>{activeRole}</span>
        <ChevronDown size={16} className="ml-2 -mr-1" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg dark:bg-slate-800 dark:divide-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-4 py-3 text-xs text-gray-500 uppercase">Available Roles</div>
          <div className="py-1" role="none">
            {user.roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                role="menuitem"
              >
                <span>{role}</span>
                {role === activeRole && <Check size={16} className="text-green-500" />}
              </button>
            ))}
          </div>
          <div className="py-1" role="none">
            <button
              onClick={handleSetAsDefault}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              Set Current as Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;
