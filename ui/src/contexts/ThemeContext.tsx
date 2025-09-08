import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// TypeScript types for the modernized theme system
export type ThemeName = 'light' | 'dark' | 'advanced';

export interface Theme {
  name: ThemeName;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme: Theme = {
  name: 'light'
};

const getThemeClasses = (theme: Theme): string => {
  return `theme-${theme.name}`;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('claude-router-theme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        // Validate the parsed theme
        if (parsedTheme.name && ['light', 'dark', 'advanced'].includes(parsedTheme.name)) {
          setThemeState(parsedTheme);
        } else if (parsedTheme.mode && parsedTheme.variant) {
          // Migration from old theme system
          if (parsedTheme.mode === 'light' && parsedTheme.variant === 'classic') {
            setThemeState({ name: 'light' });
          } else if (parsedTheme.mode === 'dark' && parsedTheme.variant === 'classic') {
            setThemeState({ name: 'dark' });
          } else if (parsedTheme.variant === 'advanced') {
            setThemeState({ name: 'advanced' });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Apply theme to document element
  useEffect(() => {
    const documentElement = document.documentElement;
    
    // Remove all theme classes
    documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
    
    // Add new theme class
    const themeClass = getThemeClasses(theme);
    documentElement.classList.add(themeClass);
    
    // Save theme to localStorage
    try {
      localStorage.setItem('claude-router-theme', JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setThemeName = (name: ThemeName) => {
    setThemeState({ name });
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    setThemeName
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;