import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  ThemeType, 
  ThemeDefinition, 
  ThemePluginConfig, 
  ThemeContextType,
  ThemeColors 
} from '../types';

// Predefined theme definitions
const THEME_DEFINITIONS: Record<ThemeType, ThemeDefinition> = {
  light: {
    id: 'light',
    name: 'Light Theme',
    description: 'Clean and professional light theme',
    colors: {
      background: 'oklch(0.98 0 0)',
      foreground: 'oklch(0.2 0 0)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0 0)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.5 0.15 220)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.94 0 0)',
      secondaryForeground: 'oklch(0.2 0 0)',
      muted: 'oklch(0.94 0 0)',
      mutedForeground: 'oklch(0.5 0 0)',
      accent: 'oklch(0.92 0 0)',
      accentForeground: 'oklch(0.2 0 0)',
      destructive: 'oklch(0.65 0.2 25)',
      destructiveForeground: 'oklch(0.98 0 0)',
      border: 'oklch(0.9 0 0)',
      input: 'oklch(0.92 0 0)',
      ring: 'oklch(0.5 0.15 220)'
    },
    features: {
      glassmorphism: false,
      animations: true,
      gradients: false
    }
  },
  
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Elegant and eye-friendly dark theme',
    colors: {
      background: 'oklch(0.12 0 0)',
      foreground: 'oklch(0.9 0 0)',
      card: 'oklch(0.18 0 0)',
      cardForeground: 'oklch(0.9 0 0)',
      popover: 'oklch(0.18 0 0)',
      popoverForeground: 'oklch(0.9 0 0)',
      primary: 'oklch(0.65 0.15 200)',
      primaryForeground: 'oklch(0.12 0 0)',
      secondary: 'oklch(0.25 0 0)',
      secondaryForeground: 'oklch(0.9 0 0)',
      muted: 'oklch(0.25 0 0)',
      mutedForeground: 'oklch(0.65 0 0)',
      accent: 'oklch(0.28 0 0)',
      accentForeground: 'oklch(0.9 0 0)',
      destructive: 'oklch(0.7 0.19 22)',
      destructiveForeground: 'oklch(0.9 0 0)',
      border: 'oklch(0.25 0 0)',
      input: 'oklch(0.22 0 0)',
      ring: 'oklch(0.65 0.15 200)'
    },
    features: {
      glassmorphism: false,
      animations: true,
      gradients: false
    }
  },
  
  advanced: {
    id: 'advanced',
    name: 'Advanced Theme',
    description: 'Modern glassmorphism with gradients and effects',
    colors: {
      background: 'oklch(0.15 0.02 240)',
      foreground: 'oklch(0.95 0 0)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardForeground: 'oklch(0.95 0 0)',
      popover: 'rgba(255, 255, 255, 0.15)',
      popoverForeground: 'oklch(0.95 0 0)',
      primary: 'oklch(0.75 0.2 340)',
      primaryForeground: 'oklch(0.95 0 0)',
      secondary: 'rgba(255, 255, 255, 0.2)',
      secondaryForeground: 'oklch(0.95 0 0)',
      muted: 'rgba(255, 255, 255, 0.1)',
      mutedForeground: 'oklch(0.7 0 0)',
      accent: 'rgba(255, 255, 255, 0.15)',
      accentForeground: 'oklch(0.95 0 0)',
      destructive: 'oklch(0.65 0.25 15)',
      destructiveForeground: 'oklch(0.95 0 0)',
      border: 'rgba(255, 255, 255, 0.2)',
      input: 'rgba(255, 255, 255, 0.15)',
      ring: 'oklch(0.75 0.2 340)',
      gradient: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,40,70,0.95))',
      glassBg: 'rgba(255, 255, 255, 0.1)',
      glassBlur: 'blur(20px)'
    },
    features: {
      glassmorphism: true,
      animations: true,
      gradients: true
    }
  }
};

const DEFAULT_CONFIG: ThemePluginConfig = {
  enabled: true,
  activeTheme: 'light',
  availableThemes: ['light', 'dark', 'advanced'],
  persistUserChoice: true,
  autoApplySystemTheme: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ 
  children: ReactNode;
  initialConfig?: Partial<ThemePluginConfig>;
}> = ({ children, initialConfig }) => {
  const [pluginConfig, setPluginConfig] = useState<ThemePluginConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });
  
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(pluginConfig.activeTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (pluginConfig.persistUserChoice) {
      try {
        const savedTheme = localStorage.getItem('claude-router-theme-plugin');
        if (savedTheme) {
          const parsedData = JSON.parse(savedTheme);
          if (parsedData.activeTheme && pluginConfig.availableThemes.includes(parsedData.activeTheme)) {
            setCurrentTheme(parsedData.activeTheme);
          }
          if (parsedData.config) {
            setPluginConfig(prev => ({ ...prev, ...parsedData.config }));
          }
        }
      } catch (error) {
        console.warn('Failed to load theme plugin data from localStorage:', error);
      }
    }
  }, [pluginConfig.persistUserChoice]);

  // Apply theme to document element
  useEffect(() => {
    if (!pluginConfig.enabled) return;

    const documentElement = document.documentElement;
    const theme = THEME_DEFINITIONS[currentTheme];
    
    // Remove all theme classes
    documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
    
    // Add new theme class
    documentElement.classList.add(`theme-${currentTheme}`);
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([property, value]) => {
      if (value && typeof value === 'string') {
        documentElement.style.setProperty(`--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      }
    });

    // Save to localStorage
    if (pluginConfig.persistUserChoice) {
      try {
        localStorage.setItem('claude-router-theme-plugin', JSON.stringify({
          activeTheme: currentTheme,
          config: pluginConfig
        }));
      } catch (error) {
        console.warn('Failed to save theme plugin data to localStorage:', error);
      }
    }
  }, [currentTheme, pluginConfig]);

  // Auto-apply system theme
  useEffect(() => {
    if (pluginConfig.autoApplySystemTheme && pluginConfig.enabled) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      };
      
      // Set initial theme
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [pluginConfig.autoApplySystemTheme, pluginConfig.enabled]);

  const setTheme = (theme: ThemeType) => {
    if (pluginConfig.availableThemes.includes(theme)) {
      setCurrentTheme(theme);
      setPluginConfig(prev => ({ ...prev, activeTheme: theme }));
    }
  };

  const isPluginEnabled = () => pluginConfig.enabled;

  const togglePlugin = (enabled: boolean) => {
    setPluginConfig(prev => ({ ...prev, enabled }));
    
    if (!enabled) {
      // Remove all theme classes when disabled
      const documentElement = document.documentElement;
      documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    themes: THEME_DEFINITIONS,
    pluginConfig,
    setTheme,
    isPluginEnabled,
    togglePlugin
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
    throw new Error('useTheme must be used within a ThemeProvider from the themes plugin');
  }
  return context;
};

export default ThemeContext;