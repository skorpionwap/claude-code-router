import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// TypeScript types
export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'classic' | 'advanced';

export interface Theme {
  mode: ThemeMode;
  variant: ThemeVariant;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme: Theme = {
  mode: 'light',
  variant: 'classic'
};

const getThemeClasses = (theme: Theme): string => {
  if (theme.variant === 'advanced') {
    return 'theme-advanced';
  }
  return `theme-${theme.mode} theme-${theme.variant}`;
};

// Initialize theme from localStorage synchronously
const getInitialTheme = (): Theme => {
  try {
    const savedTheme = localStorage.getItem('claude-router-theme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      // Validate the parsed theme
      if (parsedTheme.variant && ['classic', 'advanced'].includes(parsedTheme.variant)) {
        // For classic themes, mode is required
        if (parsedTheme.variant === 'classic' && parsedTheme.mode && ['light', 'dark'].includes(parsedTheme.mode)) {
          return parsedTheme;
        }
        // For advanced theme, mode is ignored
        if (parsedTheme.variant === 'advanced') {
          return { mode: 'light', variant: 'advanced' }; // mode is irrelevant for advanced
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }
  return defaultTheme;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to document element
  useEffect(() => {
    const documentElement = document.documentElement;
    
    // Remove all theme classes
    documentElement.classList.remove('theme-light', 'theme-dark', 'theme-classic', 'theme-advanced');
    
    // Add new theme classes
    const classes = getThemeClasses(theme);
    classes.split(' ').forEach(cls => {
      if (cls.trim()) {
        documentElement.classList.add(cls.trim());
      }
    });
    
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

  const setThemeMode = (mode: ThemeMode) => {
    setThemeState(prev => ({ ...prev, mode }));
  };

  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeState(prev => ({ ...prev, variant }));
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    setThemeMode,
    setThemeVariant
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