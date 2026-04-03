import React, { useState } from 'react';
import { useAuth, Role } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShieldCheck, UserCheck } from 'lucide-react';
import vuradeskLogo from '@/assets/logo.png';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';

const SelectRole: React.FC = () => {
  const { user, updateLocalRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectRole = async (selectedRole: Role) => {
    setLoading(true);

    try {
      // First, tell the backend the user's choice.
      await axiosClient.patch('/users/profile/default-role', { defaultRole: selectedRole });

      // On success, update the local state.
      await updateLocalRole(selectedRole);

      // Once the state is synced, navigate to the dashboard.
      navigate('/dashboard', { replace: true });

      toast.success(`Workspace activated. Welcome to the dashboard!`);

    } catch (error: any) {
      console.error('Failed to activate role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to set default role. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
      case 'SUB_ADMIN':
        return <ShieldCheck className="h-10 w-10 text-uv-blue mb-4" />;
      case 'AGENT':
        return <UserCheck className="h-10 w-10 text-emerald-500 mb-4" />;
      case 'CUSTOMER':
        return <User className="h-10 w-10 text-slate-500 mb-4" />;
      default:
        return <User className="h-10 w-10 text-slate-500 mb-4" />;
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Manage system settings, users, and oversee all operations.';
      case 'SUB_ADMIN':
        return 'Assist in managing users and overseeing tickets.';
      case 'AGENT':
        return 'Resolve customer tickets and manage support queues.';
      case 'CUSTOMER':
        return 'View your tickets and get support.';
      default:
        return '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8">
        <img src={vuradeskLogo} alt="VuraDesk Logo" className="h-24" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Select Your Workspace</h1>
        <p className="text-slate-500 mt-2">You have multiple roles. Choose how you want to log in today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {user?.roles.map((role) => (
          <Card
            key={role}
            className="hover:shadow-lg transition-all duration-300 border-transparent hover:border-uv-blue"
          >
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center">
                {getRoleIcon(role)}
              </div>
              <CardTitle className="text-xl capitalize">{role.replace('_', ' ')}</CardTitle>
              <CardDescription>{getRoleDescription(role)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 gap-4">
              <Button
                onClick={() => handleSelectRole(role)}
                className="w-full"
                disabled={loading}
              >
                Enter as {role.replace('_', ' ')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SelectRole;
