import React, { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, User, Sun, Moon, LogOut, LayoutDashboard, Ticket, Users, Settings, Shield, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { useSharedTicket } from '@/contexts/TicketContext';
import RoleDropdown from './RoleDropdown';
import Tooltip from './Tooltip';
import logo from '@/assets/logo.png';
import FloatingCreateButton from './FloatingCreateButton';
import CreateTicketModal from './modals/CreateTicketModal';
import BrandedLoadingOverlay from './BrandedLoadingOverlay';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { user, logout, activeRole } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { settings } = useSystemSettings();
  const { isSwitchingRole } = useSharedTicket();
  const location = useLocation();

  const isTicketDetailPage = /^\/tickets\/.+/.test(location.pathname);
  const isLegacyTicketPage = location.pathname === '/tickets';

  // "Safety" Role: If activeRole is somehow "UNDEFINED" or null, default to 'CUSTOMER' for UI rendering
  const effectiveRole = activeRole === 'UNDEFINED' || !activeRole ? 'CUSTOMER' : activeRole;

  const isCustomer = effectiveRole === 'CUSTOMER';
  const isAgent = effectiveRole === 'AGENT'; // Added for isInternal
  const isAdmin = effectiveRole === 'ADMIN' || effectiveRole === 'SUBADMIN';
  const isInternal = isAdmin || isAgent; // Helper for internal users

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, visible: isInternal },
    {
      name: 'All Tickets',
      href: '/tickets',
      icon: Ticket,
      visible: isInternal
    },
    {
      name: 'Inbox',
      href: '/inbox',
      icon: MessageSquare,
      visible: isCustomer // Only visible to customers
    },
    { name: 'Customers', href: '/customers', icon: Users, visible: isAdmin },
    { name: 'Settings', href: '/settings', icon: Settings, visible: effectiveRole === 'ADMIN' }, // Use effectiveRole
    { name: 'Access Control', href: '/admin/access-control', icon: Shield, visible: effectiveRole === 'ADMIN' }, // Use effectiveRole
    { name: 'Team', href: '/admin/team', icon: Users, visible: effectiveRole === 'ADMIN' }, // Use effectiveRole
    { name: 'Mailbox', href: '/admin/mailbox', icon: Mail, visible: effectiveRole === 'ADMIN' }, // Use effectiveRole
  ];

  useEffect(() => {
    const font = settings.primaryFont || 'Inter';
    if (font !== 'Inter') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--font-family', `${font}, sans-serif`);
  }, [settings.primaryFont]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'UN';
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-text-main transition-colors duration-300 overflow-hidden" style={{ fontFamily: 'var(--font-family)' }}>
      {isSwitchingRole && <BrandedLoadingOverlay />}
      <aside
        className={`bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col relative`}
      >
        <div className="flex items-center justify-center h-16 border-b border-card-border px-4">
          <button onClick={toggleSidebar} className="flex items-center justify-center w-full">
            <img
              src={logo}
              alt={`${settings.appName} Logo`}
              className={`transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'h-10 w-10 object-cover rounded-md aspect-square mx-auto' : 'h-10 w-auto'}`}
            />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.filter(item => item.visible).map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Tooltip key={item.name} text={item.name}>
                <Link
                  to={item.href}
                  className={`relative flex items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300
                    ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ backgroundColor: 'var(--primary-brand)' }}></div>
                  )}
                  <item.icon className={`h-6 w-6 text-muted-foreground ${isSidebarCollapsed ? '' : 'mr-4'}`} />
                  {!isSidebarCollapsed && <span className="font-medium text-foreground">{item.name}</span>}
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-4">
          <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'h-6' : ''}`}>
            {!isSidebarCollapsed && (
              <span className="text-xs text-muted-foreground">
                Powered by <strong>{settings.appName}</strong>
              </span>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-900 shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-10 pr-4 py-2 rounded-lg border border-transparent bg-slate-100 dark:bg-slate-800
              focus:w-96 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
            >
              {isDarkMode ? <Sun size={20} className="text-muted-foreground" /> : <Moon size={20} className="text-muted-foreground" />}
            </button>
            <RoleDropdown />
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-brand flex items-center justify-center text-white text-sm font-semibold">
                    {getUserInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl py-2 z-10 border border-card-border">
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b border-card-border">
                    Signed in as <br />
                    <span className="font-semibold text-foreground">{user?.username}</span>
                  </div>
                  <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    View Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 ${isTicketDetailPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {isTicketDetailPage || isLegacyTicketPage ? (
            children
          ) : (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full transition-all duration-300">
              <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none rounded-lg">
                {children}
              </div>
            </div>
          )}
        </main>

        {isCustomer && <FloatingCreateButton onClick={() => setCreateModalOpen(true)} />}
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onTicketCreated={() => {
            // In a real app, you'd probably want to refetch the ticket list here
          }}
        />
      </div>
    </div>
  );
};

export default MainLayout;
