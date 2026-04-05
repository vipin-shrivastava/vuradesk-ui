import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface SystemSettings {
  appName: string;
  primaryFont: string;
  logoUrl?: string;
  loginTagline?: string;
  footerText?: string; // Add footerText
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  fetchSystemSettings: () => Promise<void>;
  saveSystemSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

const defaultSettings: SystemSettings = {
  appName: 'VuraDesk',
  primaryFont: 'Inter',
  logoUrl: '/src/assets/logo.png',
  loginTagline: 'Your ultimate solution for seamless customer support.',
  footerText: 'Powered by VuraDesk', // Add default
};

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};

export const SystemSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const fetchSystemSettings = useCallback(async () => {
    const url = '/system/public/settings';
    console.log("UI Requesting path:", url);
    try {
      const response = await axiosClient.get(url);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch system settings, using defaults.', error);
      setSettings(defaultSettings);
    }
  }, []);

  const saveSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    const url = '/system/admin/settings';
    const payload = {
      appName: newSettings.appName ?? settings.appName,
      loginTagline: newSettings.loginTagline ?? settings.loginTagline,
      primaryFont: newSettings.primaryFont ?? settings.primaryFont,
      logoUrl: newSettings.logoUrl ?? settings.logoUrl,
      footerText: newSettings.footerText ?? settings.footerText,
    };
    console.log("UI Requesting path:", url);
    console.log("Final Payload to Backend:", payload);
    const previousSettings = settings;
    setSettings(prev => ({ ...prev, ...payload }));
    try {
      await axiosClient.put(url, payload);
    } catch (error) {
      setSettings(previousSettings);
      console.error('Failed to save system settings.', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  const value = {
    settings,
    fetchSystemSettings,
    saveSystemSettings,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};
