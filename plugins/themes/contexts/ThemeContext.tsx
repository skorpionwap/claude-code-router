import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { 
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

  // Load theme from config first, then localStorage
  useEffect(() => {
    if (initialConfig) {
      setPluginConfig(prev => ({ ...prev, ...initialConfig }));
      if (initialConfig.activeTheme) {
        setCurrentTheme(initialConfig.activeTheme);
      }
    } else {
      // Load configuration from server if no initial config provided
      const loadServerConfig = async () => {
        try {
          const response = await fetch('/api/config');
          if (response.ok) {
            const serverConfig = await response.json();
            if (serverConfig.plugins?.themes) {
              setPluginConfig(prev => ({ ...prev, ...serverConfig.plugins.themes }));
              if (serverConfig.plugins.themes.activeTheme) {
                setCurrentTheme(serverConfig.plugins.themes.activeTheme);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to load server config for themes:', error);
        }
      };
      loadServerConfig();
    }
  }, [initialConfig]);

  // Load theme from localStorage on mount (only if not overridden by config)
  useEffect(() => {
    if (pluginConfig.persistUserChoice && !initialConfig?.activeTheme) {
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
  }, [pluginConfig.persistUserChoice, initialConfig?.activeTheme]);

  // Apply theme to document element
  useEffect(() => {
    const documentElement = document.documentElement;
    
    if (!pluginConfig.enabled) {
      // Remove all theme classes when plugin is disabled
      documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
      documentElement.classList.remove('themes-plugin-active');
      documentElement.classList.remove('dark');
      
      // Remove any CSS custom properties that might have been set
      const themeProperties = [
        '--background', '--foreground', '--card', '--card-foreground',
        '--popover', '--popover-foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
        '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
        '--border', '--input', '--ring', '--gradient', '--glass-bg', '--glass-blur'
      ];
      
      themeProperties.forEach(property => {
        documentElement.style.removeProperty(property);
      });
      
      // Layout enhancer removed - using pure CSS approach
      
      return;
    }

    const theme = THEME_DEFINITIONS[currentTheme];
    
    // Remove all theme classes
    documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
    
    // Add new theme class
    documentElement.classList.add(`theme-${currentTheme}`);
    
    // Add plugin active indicator for CSS layout override
    documentElement.classList.add('themes-plugin-active');
    
    // Check and apply analytics integration
    checkAnalyticsStatus();
    
    // Apply layout classes for navigation
    applyLayoutClasses();

    // Using pure CSS approach for layout transformations

    // Unify with TailwindCSS dark mode
    if (currentTheme === 'dark' || currentTheme === 'advanced') {
      documentElement.classList.add('dark');
    } else {
      documentElement.classList.remove('dark');
    }
    
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
      const newConfig = { ...pluginConfig, activeTheme: theme };
      setPluginConfig(newConfig);
      
      // Sync to server - fire and forget
      syncConfigToServer(newConfig);
    }
  };

  const isPluginEnabled = () => pluginConfig.enabled;

  const togglePlugin = (enabled: boolean) => {
    const newConfig = { ...pluginConfig, enabled };
    setPluginConfig(newConfig);
    
    if (!enabled) {
      // Remove all theme classes and CSS properties when disabled
      const documentElement = document.documentElement;
      documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
      documentElement.classList.remove('themes-plugin-active');
      documentElement.classList.remove('dark');
      
      // Remove theme CSS custom properties
      const themeProperties = [
        '--background', '--foreground', '--card', '--card-foreground',
        '--popover', '--popover-foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
        '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
        '--border', '--input', '--ring', '--gradient', '--glass-bg', '--glass-blur'
      ];
      
      themeProperties.forEach(property => {
        documentElement.style.removeProperty(property);
      });
    }
    
    // Sync to server - fire and forget
    syncConfigToServer(newConfig);
  };

  const syncConfigToServer = async (config: ThemePluginConfig) => {
    try {
      // Get current main config from server
      const response = await fetch('/api/config');
      if (response.ok) {
        const mainConfig = await response.json();
        
        // Update the themes section
        const updatedConfig = {
          ...mainConfig,
          plugins: {
            ...mainConfig.plugins,
            themes: config
          }
        };
        
        // Save back to server
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        });
      }
    } catch (error) {
      console.warn('Failed to sync theme config to server:', error);
    }
  };
  
  const checkAnalyticsStatus = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const documentElement = document.documentElement;
    
    // Check for analytics plugin indicators
    const analyticsEnabled = 
      localStorage.getItem('analytics-enabled') === 'true' ||
      document.querySelector('[data-analytics="true"]') ||
      window.location.search.includes('analytics=true') ||
      // Check if Mission Control tab exists
      document.querySelector('[class*="mission-control"]') ||
      // Check for analytics plugin global
      (window as any).__ANALYTICS_PLUGIN__;

    if (analyticsEnabled) {
      documentElement.setAttribute('data-analytics', 'enabled');
      console.log('📊 Analytics detected - enabling Mission Control navigation');
    } else {
      documentElement.removeAttribute('data-analytics');
    }
  };
  
  const applyLayoutClasses = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Apply nav-tabs class to tab containers
    const tabContainers = document.querySelectorAll('[role="tablist"], .tabs-container, [data-tabs]');
    tabContainers.forEach(container => {
      container.classList.add('nav-tabs');
      if (currentTheme !== 'advanced') {
        container.classList.add('modern-tab-container');
      }
    });
    
    // Apply nav-tab class to individual tabs
    const tabs = document.querySelectorAll('[role="tab"], .tab, [data-tab]');
    tabs.forEach(tab => {
      tab.classList.add('nav-tab');
      if (currentTheme !== 'advanced') {
        tab.classList.add('modern-tab');
      }
    });
    
    // Create Mission Control tab if analytics enabled and doesn't exist
    if (document.documentElement.hasAttribute('data-analytics')) {
      const tabContainer = document.querySelector('[role="tablist"], .nav-tabs');
      if (tabContainer && !document.querySelector('.mission-control-tab, [data-tab="mission-control"]')) {
        const missionControlTab = document.createElement('button');
        missionControlTab.className = 'nav-tab mission-control-tab';
        missionControlTab.setAttribute('data-tab', 'mission-control');
        missionControlTab.textContent = '🎯 Mission Control';
        missionControlTab.addEventListener('click', () => {
          // Navigate to mission control
          const event = new CustomEvent('navigate-mission-control');
          document.dispatchEvent(event);
        });
        tabContainer.appendChild(missionControlTab);
      }
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