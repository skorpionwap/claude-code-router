import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

// Safe ThemeSelector that works without ThemeProvider
function SafeThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'advanced'>('light');
  
  useEffect(() => {
    // Load current theme from localStorage
    try {
      const saved = localStorage.getItem('claude-router-theme-plugin');
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentTheme(data.activeTheme || 'light');
      }
    } catch (error) {
      setCurrentTheme('light');
    }
  }, []);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'advanced') => {
    setCurrentTheme(theme);
    
    // Save to localStorage
    try {
      localStorage.setItem('claude-router-theme-plugin', JSON.stringify({
        activeTheme: theme,
        config: { enabled: true, activeTheme: theme }
      }));
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }

    // Sync to server
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        const updatedConfig = {
          ...config,
          plugins: {
            ...config.plugins,
            themes: {
              ...config.plugins?.themes,
              enabled: true,
              activeTheme: theme
            }
          }
        };
        
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        });
      }
    } catch (error) {
      console.warn('Failed to sync theme to server:', error);
    }

    // Force page reload to apply theme properly
    window.location.reload();
  };

  const themes = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'advanced', label: 'Advanced', icon: '✨' }
  ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">Select Theme:</div>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id as 'light' | 'dark' | 'advanced')}
            className={`p-2 rounded-md border text-sm transition-colors ${
              currentTheme === theme.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-lg">{theme.icon}</div>
            <div className="text-xs">{theme.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Safe hook that doesn't crash when ThemeProvider is not available
function useSafeTheme() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check server config first
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          const enabled = config.plugins?.themes?.enabled === true;
          setIsEnabled(enabled);
        } else {
          // Fallback to localStorage
          const enabled = localStorage.getItem('themes-enabled') === 'true';
          setIsEnabled(enabled);
        }
      } catch (error) {
        const enabled = localStorage.getItem('themes-enabled') === 'true';
        setIsEnabled(enabled);
      }
    };

    checkStatus();

    // Listen for plugin state changes
    const handlePluginChange = (event: CustomEvent) => {
      const { id, enabled } = event.detail;
      if (id === 'themes') {
        setIsEnabled(enabled);
      }
    };

    window.addEventListener('plugin-state-changed', handlePluginChange as EventListener);
    return () => window.removeEventListener('plugin-state-changed', handlePluginChange as EventListener);
  }, []);

  return { isEnabled, setIsEnabled };
}

export function ThemeSettings() {
  const { isEnabled, setIsEnabled } = useSafeTheme();

  const togglePlugin = async (enabled: boolean) => {
    setIsEnabled(enabled);
    
    // Save to localStorage immediately
    localStorage.setItem('themes-enabled', enabled.toString());
    
    if (!enabled) {
      // COMPREHENSIVE CLEANUP when disabling
      const documentElement = document.documentElement;
      
      // Remove all theme classes
      documentElement.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
      documentElement.classList.remove('themes-plugin-active');
      documentElement.classList.remove('dark');
      
      // Remove ALL theme CSS custom properties
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
      
      // Remove plugin CSS files completely
      const pluginStyles = document.querySelectorAll('link[data-themes-plugin="true"]');
      pluginStyles.forEach(style => {
        style.remove();
      });
      
      // Reset to system default
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        documentElement.classList.add('dark');
      }
      
      console.log('🧹 Themes plugin disabled - all styles cleaned up');
    }
    
    // Sync to server config
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        const updatedConfig = {
          ...config,
          plugins: {
            ...config.plugins,
            themes: {
              ...config.plugins?.themes,
              enabled
            }
          }
        };
        
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        });
      }
    } catch (error) {
      console.warn('Failed to sync theme config to server:', error);
    }
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('plugin-state-changed', {
      detail: { id: 'themes', enabled }
    }));
    
    console.log('🎨 Theme plugin toggled:', enabled);
    
    // Force page reload when toggling to ensure clean state
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className={`rounded-lg border p-4 ${isEnabled ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎨</span>
          <h3 className="font-semibold">Advanced Themes</h3>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={togglePlugin}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Glassmorphism effects and premium theming
      </p>
      
      {/* Theme Selector - Show when enabled */}
      {isEnabled && (
        <div className="border-t pt-3">
          <SafeThemeSelector />
        </div>
      )}
    </div>
  );
}