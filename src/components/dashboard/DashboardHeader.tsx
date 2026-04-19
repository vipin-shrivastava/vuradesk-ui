import React from 'react';
import { Search, PlusCircle, LogOut, User, ShieldCheck, UserCheck, Star, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth, Role } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';

const DashboardHeader: React.FC = () => {
  const {
    logout,
    user,
    activeRole,
    setActiveRole,
    updateUserDefaultRole,
    showLoadingOverlay,
    hideLoadingOverlay,
  } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role: Role, className?: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUB_ADMIN':
        return <ShieldCheck className={className || "h-4 w-4"} />;
      case 'AGENT':
        return <UserCheck className={className || "h-4 w-4"} />;
      case 'CUSTOMER':
        return <User className={className || "h-4 w-4"} />;
      default:
        return <User className={className || "h-4 w-4"} />;
    }
  };

  const handleSwitchRole = (role: Role) => {
    if (activeRole === role) return;

    showLoadingOverlay();
    setActiveRole(role);
    setTimeout(() => {
      hideLoadingOverlay();
      navigate('/dashboard');
    }, 600);
  };

  const handleSetDefaultRole = async (role: Role) => {
    if (!user) return;

    try {
      await axiosClient.patch('/users/profile/default-role', { defaultRole: role });
      updateUserDefaultRole(role);
      toast.success(`'${role.replace('_', ' ')}' set as your default workspace.`);
    } catch (error) {
      console.error('Failed to set default role:', error);
      toast.error('Failed to set default role.', {
        description: 'Please try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-uv-bg border-b border-uv-border pl-6">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search tickets, users, etc."
            className="pl-10 pr-3 py-2 bg-white border border-uv-border rounded-sm focus:ring-uv-blue focus:border-uv-blue text-[14px] h-9"
          />
        </div>
        {hasPermission('ticket:create') && (
          <Button className="bg-uv-blue hover:bg-uv-blue-hover text-white font-semibold rounded-sm px-4 py-2 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Ticket
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 ml-4 shrink-0">
        {user && user.roles.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-white border border-uv-border rounded-full px-3 py-1.5 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                {getRoleIcon(activeRole || 'CUSTOMER', "h-4 w-4 text-uv-blue")}
                <span className="font-medium truncate max-w-[150px]">{user.username || 'User'}</span>
                <span className="text-xs text-slate-600 font-normal tracking-wide uppercase">
                  {activeRole ? activeRole.replace('_', ' ') : 'Select Role'}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 ml-1" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-md z-50"
              align="end"
            >
              <DropdownMenuLabel className="text-slate-900 font-bold px-4 py-2 border-b border-slate-100">Switch Workspace</DropdownMenuLabel>
              <div className="py-1">
                {user.roles.map((role) => (
                  <DropdownMenuItem 
                    key={role} 
                    className="flex items-center justify-between hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-slate-900 px-3 py-2"
                    onClick={() => handleSwitchRole(role)}
                  >
                    <div className="flex items-center flex-grow">
                      {getRoleIcon(role, "h-4 w-4 text-slate-500")}
                      <span className="ml-3 capitalize font-medium">{role.replace('_', ' ')}</span>
                      {activeRole === role && <Check className="ml-auto h-4 w-4 text-uv-blue" />}
                    </div>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleSetDefaultRole(role); }}
                            className={`h-7 w-7 ml-2 rounded-full ${user.defaultRole === role ? 'text-amber-500 hover:text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                          >
                            <Star className="h-3.5 w-3.5" fill={user.defaultRole === role ? 'currentColor' : 'none'} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-[10px]">{user.defaultRole === role ? 'Default Workspace' : 'Set as Default'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-slate-600 border-uv-border bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 font-semibold rounded-sm h-9"
          title="Logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
