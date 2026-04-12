import React, { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, User, Sun, Moon, LogOut, LayoutDashboard, Ticket, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import RoleDropdown from './RoleDropdown';
import Tooltip from './Tooltip';
import logo from '@/assets/logo.png';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout, activeRole } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { settings } = useSystemSettings();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, visible: true },
    {
      name: 'All Tickets',
      href: '/tickets',
      icon: Ticket,
      visible: activeRole !== 'CUSTOMER'
    },
    {
      name: 'My Tickets',
      href: '/my-tickets',
      icon: Ticket,
      visible: activeRole !== 'CUSTOMER'
    },
    { name: 'Customers', href: '/customers', icon: Users, visible: activeRole !== 'CUSTOMER' },
    { name: 'Settings', href: '/settings', icon: Settings, visible: activeRole === 'ADMIN' },
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-text-main transition-colors duration-300" style={{ fontFamily: 'var(--font-family)' }}>
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
                  className={`relative flex items-center p-3 rounded-lg text-text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300
                    ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ backgroundColor: 'var(--primary-brand)' }}></div>
                  )}
                  <item.icon className={`h-6 w-6 ${isSidebarCollapsed ? '' : 'mr-4'}`} />
                  {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-4 border-t border-card-border">
          <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'h-6' : ''}`}>
            {!isSidebarCollapsed && (
              <span className="text-xs text-slate-400">
                Powered by <strong>{settings.appName}</strong>
              </span>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-slate-900 shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
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
              {isDarkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
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
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-card-border">
                    Signed in as <br />
                    <span className="font-semibold">{user?.username}</span>
                  </div>
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

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none rounded-lg">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
