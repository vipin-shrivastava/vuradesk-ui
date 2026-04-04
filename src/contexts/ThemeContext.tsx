import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  brandColor: string;
  logoUrl: string;
  setBrandColor: (color: string) => void;
  setLogoUrl: (url: string) => void;
  fetchTenantTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const DEFAULT_BRAND_COLOR = '#03363D'; // Zendesk Blue as the default
const DEFAULT_LOGO_URL = '@/assets/logo.png'; // Updated default path

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [brandColor, setBrandColor] = useState<string>(DEFAULT_BRAND_COLOR);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const fetchTenantTheme = useCallback(async () => {
    try {
      const response = await axiosClient.get('/tenants/settings');
      const { brandColor: fetchedBrandColor, logoUrl: fetchedLogoUrl } = response.data;

      if (fetchedBrandColor) {
        setBrandColor(fetchedBrandColor);
      }
      if (fetchedLogoUrl) {
        setLogoUrl(fetchedLogoUrl);
      }
    } catch (error) {
      console.error('Failed to fetch tenant theme, falling back to default.', error);
      setBrandColor(DEFAULT_BRAND_COLOR);
      setLogoUrl(DEFAULT_LOGO_URL);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-brand', brandColor);
  }, [brandColor]);

  useEffect(() => {
    fetchTenantTheme();
  }, [fetchTenantTheme]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    brandColor,
    logoUrl,
    setBrandColor,
    setLogoUrl,
    fetchTenantTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
