import React, { useState, useEffect } from 'react';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

type SettingsTab = 'general' | 'appearance' | 'security';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, saveSystemSettings } = useSystemSettings();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [appName, setAppName] = useState(settings.appName);
  const [primaryFont, setPrimaryFont] = useState(settings.primaryFont);
  const [loginTagline, setLoginTagline] = useState(settings.loginTagline || '');
  const [footerText, setFooterText] = useState(settings.footerText || '');

  useEffect(() => {
    setAppName(settings.appName);
    setPrimaryFont(settings.primaryFont);
    setLoginTagline(settings.loginTagline || '');
    setFooterText(settings.footerText || '');
  }, [settings]);

  const handleSaveChanges = async () => {
    try {
      await saveSystemSettings({ appName, primaryFont, loginTagline, footerText });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings.');
    }
  };

  const renderGeneralSettings = () => (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-4">General Settings</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="appName" className="text-sm font-medium text-text-main">App Name</label>
          <input
            id="appName"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="tagline" className="text-sm font-medium text-text-main">Login Tagline</label>
          <input
            id="tagline"
            type="text"
            value={loginTagline}
            onChange={(e) => setLoginTagline(e.target.value)}
            placeholder="Your ultimate solution for..."
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="footerText" className="text-sm font-medium text-text-main">Footer Text</label>
          <input
            id="footerText"
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Powered by..."
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text-main">Logo</label>
          <div className="mt-2 flex items-center space-x-4">
            <img src={settings.logoUrl} alt="Current Logo" className="h-12 bg-slate-200 p-2 rounded-md" />
            <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Change Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-4">Appearance</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="font" className="text-sm font-medium text-text-main">Primary Font</label>
          <select
            id="font"
            value={primaryFont}
            onChange={(e) => setPrimaryFont(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-800 dark:border-slate-700"
          >
            <option>Inter</option>
            <option>Poppins</option>
            <option>Roboto</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-text-main">Theme Preview</label>
          <div className={`mt-2 p-6 rounded-lg ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
            <h3 className="font-bold" style={{ fontFamily: primaryFont }}>Live Preview</h3>
            <p style={{ fontFamily: primaryFont }}>This is how the theme will look.</p>
            <button onClick={toggleDarkMode} className="mt-4 px-4 py-2 border rounded-md">
              Toggle to {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-4">Security</h2>
      <p>Security settings will be configured here.</p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      default: return null;
    }
  };

  const getNavClass = (tab: SettingsTab) =>
    `block w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
      activeTab === tab
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
        : 'hover:bg-gray-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-md border border-card-border">
      <h1 className="text-2xl font-bold tracking-tight text-text-main mb-6">System Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="md:col-span-1 space-y-1">
          <button onClick={() => setActiveTab('general')} className={getNavClass('general')}>General</button>
          <button onClick={() => setActiveTab('appearance')} className={getNavClass('appearance')}>Appearance</button>
          <button onClick={() => setActiveTab('security')} className={getNavClass('security')}>Security</button>
        </nav>

        <div className="md:col-span-3">
          {renderTabContent()}
          <div className="mt-8 pt-6 border-t border-card-border flex justify-end">
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
