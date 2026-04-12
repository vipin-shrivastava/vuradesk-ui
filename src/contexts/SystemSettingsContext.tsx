import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface SystemSettings {
  appName: string;
  primaryFont: string;
  logoUrl?: string;
  loginTagline?: string;
  footerText?: string;
  autoAssignmentEnabled?: boolean;
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
  footerText: 'Powered by VuraDesk',
  autoAssignmentEnabled: true,
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
      ...settings,
      ...newSettings,
    };
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
