import React, { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, Sun, Moon, LogOut, LayoutDashboard, Ticket, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, activeRole, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, logoUrl } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <div className="flex min-h-screen bg-background-main text-text-main">
      {/* Sidebar */}
      <aside
        className={`bg-sidebar-bg shadow-lg transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}
      >
        {/* Sidebar Top: Logo */}
        <div className="flex items-center justify-center h-16 border-b border-card-border">
          <Link to="/dashboard" className="flex items-center">
            {isSidebarCollapsed ? (
              <img src="/logo/vuradesk-logo-small.svg" alt="VuraDesk" className="h-8" />
            ) : (
              <img src={logoUrl} alt="VuraDesk" className="h-8" />
            )}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center p-2 rounded-lg text-text-main hover:bg-gray-200 dark:hover:bg-gray-700
                ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`h-6 w-6 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Bottom: Theme Toggle */}
        <div className="p-4 border-t border-card-border">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center w-full p-2 rounded-lg text-text-main hover:bg-gray-200 dark:hover:bg-gray-700
              ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            {isDarkMode ? (
              <Sun className={`h-6 w-6 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            ) : (
              <Moon className={`h-6 w-6 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            )}
            {!isSidebarCollapsed && <span className="font-medium">Toggle Theme</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-sidebar-bg shadow-md h-16 flex items-center justify-between px-4 border-b border-card-border">
          {/* Left: Hamburger */}
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <Menu className="h-6 w-6" />
          </button>

          {/* Center: Search (Placeholder) */}
          <div className="flex-1 mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Global Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
            </div>
          </div>

          {/* Right: User Profile Dropdown */}
          <div className="relative">
            <button onClick={toggleProfileDropdown} className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <User className="h-6 w-6 mr-2" />
              <span className="font-medium">{user?.username || 'Guest'}</span>
              {activeRole && <span className="ml-2 text-sm text-gray-500">({activeRole})</span>}
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
