import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isSystem: boolean;
  setSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isSystem, setIsSystem] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (savedTheme === 'system') {
        setIsSystem(true);
        setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      } else if (savedTheme === 'light' || savedTheme === 'dark') {
        setIsSystem(false);
        setThemeState(savedTheme);
      } else {
        setIsSystem(true);
        setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const saveThemePreference = async (value: 'light' | 'dark' | 'system') => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, value);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setIsSystem(false);
    saveThemePreference(newTheme);
  };

  const setSystemTheme = () => {
    setIsSystem(true);
    setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    saveThemePreference('system');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isSystem, setSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
