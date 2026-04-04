import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, User, Sun, Moon, LogOut, LayoutDashboard, Ticket, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import RoleDropdown from './RoleDropdown';
import Tooltip from './Tooltip';
import logo from '@/assets/logo.png';

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-background-main text-text-main">
      {/* Sidebar */}
      <aside
        className={`bg-sidebar-bg shadow-lg transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col relative`}
      >
        {/* Sidebar Top: Logo and Toggle */}
        <div className="flex items-center justify-center h-16 border-b border-card-border px-4">
          <button onClick={toggleSidebar} className="flex items-center justify-center w-full">
            <img
              src={logo}
              alt="VuraDesk Logo"
              className={`transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'h-10 w-10 object-cover rounded-md aspect-square mx-auto' : 'h-10 w-auto'}`}
            />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Tooltip key={item.name} text={item.name}>
                <Link
                  to={item.href}
                  className={`relative flex items-center p-3 rounded-lg text-text-main hover:bg-gray-200 dark:hover:bg-gray-700
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-sidebar-bg shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          {/* Left: Expanding Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-10 pr-4 py-2 rounded-lg border border-transparent bg-slate-100 dark:bg-slate-800
              focus:w-96 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <RoleDropdown />
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <User className="h-6 w-6" />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-sidebar-bg rounded-lg shadow-xl py-2 z-10 border border-card-border">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-card-border">
                    Signed in as <br />
                    <span className="font-semibold">{user?.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
