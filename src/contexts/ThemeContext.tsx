import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSystemSettings } from './SystemSettingsContext'; // Import useSystemSettings

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  brandColor: string;
  logoUrl: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const DEFAULT_BRAND_COLOR = '#03363D';
const DEFAULT_LOGO_URL = '/src/assets/logo.png';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useSystemSettings(); // Consume the global settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // These states are now driven by the SystemSettingsContext
  const [brandColor, setBrandColor] = useState<string>(settings.brandColor || DEFAULT_BRAND_COLOR);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || DEFAULT_LOGO_URL);

  // Effect to toggle dark mode class on the html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Effect to update theme when global settings change
  useEffect(() => {
    if (settings.brandColor) {
      setBrandColor(settings.brandColor);
      document.documentElement.style.setProperty('--primary-brand', settings.brandColor);
    }
    if (settings.logoUrl) {
      setLogoUrl(settings.logoUrl);
    }
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const value = {
    isDarkMode,
    toggleDarkMode,
    brandColor,
    logoUrl,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
