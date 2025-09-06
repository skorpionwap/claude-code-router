/**
 * Themes Plugin - Main Entry Point
 * Unified theme system with 3 themes: Light, Dark, Advanced
 */

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeSelector from './components/ThemeSelector';
import { 
  ThemeType, 
  ThemePluginConfig, 
  ThemePluginAPI,
  ThemeDefinition 
} from './types';

// Export components for external use
export { ThemeProvider, useTheme, ThemeSelector };
export type { ThemeType, ThemePluginConfig, ThemeDefinition };

// Default configuration
export const DEFAULT_THEME_CONFIG: ThemePluginConfig = {
  enabled: true,
  activeTheme: 'light',
  availableThemes: ['light', 'dark', 'advanced'],
  persistUserChoice: true,
  autoApplySystemTheme: false,
  // Enhanced UI Experience settings
  enableEnhancedUIExperience: false,
  autoEnableAnalytics: true,
  autoEnableDashboard: true
};

/**
 * Plugin API Implementation
 */
class ThemesPluginAPI implements ThemePluginAPI {
  readonly name = 'themes' as const;
  readonly version = '1.0.0' as const;
  
  private isRegistered = false;
  private currentConfig: ThemePluginConfig = { ...DEFAULT_THEME_CONFIG };
  
  /**
   * Register the plugin - loads CSS and initializes
   */
  register(): void {
    if (this.isRegistered) {
      console.warn('Themes plugin is already registered');
      return;
    }
    
    try {
      // Load plugin CSS
      this.loadPluginStyles();
      
      // Apply initial theme
      this.applyThemeToDocument();
      
      // Mark as registered
      this.isRegistered = true;
      
      // Expose global API
      window.__THEMES_PLUGIN__ = this;
      
      console.log(`✅ Themes Plugin v${this.version} registered successfully`);
    } catch (error) {
      console.error('Failed to register themes plugin:', error);
      throw error;
    }
  }
  
  /**
   * Unregister the plugin - cleanup
   */
  unregister(): void {
    if (!this.isRegistered) return;
    
    try {
      // Remove theme classes
      this.removeThemeClasses();
      
      // Remove plugin styles
      this.removePluginStyles();
      
      // Clean up global API
      delete window.__THEMES_PLUGIN__;
      
      this.isRegistered = false;
      
      console.log('🔄 Themes Plugin unregistered');
    } catch (error) {
      console.error('Failed to unregister themes plugin:', error);
    }
  }
  
  /**
   * Get current plugin configuration
   */
  getConfig(): ThemePluginConfig {
    return { ...this.currentConfig };
  }
  
  /**
   * Update plugin configuration
   */
  setConfig(config: Partial<ThemePluginConfig>): void {
    this.currentConfig = {
      ...this.currentConfig,
      ...config
    };
    
    // Apply configuration changes
    if (this.isRegistered) {
      this.applyThemeToDocument();
    }
    
    // Save to localStorage if persistence is enabled
    if (this.currentConfig.persistUserChoice) {
      try {
        localStorage.setItem('claude-router-theme-plugin', JSON.stringify({
          activeTheme: this.currentConfig.activeTheme,
          config: this.currentConfig
        }));
      } catch (error) {
        console.warn('Failed to save theme config to localStorage:', error);
      }
    }
  }
  
  /**
   * Set active theme
   */
  setTheme(theme: ThemeType): void {
    if (!this.currentConfig.availableThemes.includes(theme)) {
      console.warn(`Theme "${theme}" is not available in current configuration`);
      return;
    }
    
    this.setConfig({ activeTheme: theme });
  }
  
  /**
   * Get current active theme
   */
  getCurrentTheme(): ThemeType {
    return this.currentConfig.activeTheme;
  }
  
  /**
   * Get list of available themes
   */
  getAvailableThemes(): ThemeType[] {
    return [...this.currentConfig.availableThemes];
  }
  
  /**
   * Apply theme classes to a specific element
   */
  applyToElement(element: HTMLElement): void {
    if (!this.isRegistered || !this.currentConfig.enabled) return;
    
    // Remove existing theme classes
    element.classList.remove('theme-light', 'theme-dark', 'theme-advanced');
    
    // Add current theme class
    element.classList.add(`theme-${this.currentConfig.activeTheme}`);
  }
  
  /**
   * Clean up theme classes and styles
   */
  cleanup(): void {
    this.removeThemeClasses();
    this.removePluginStyles();
  }
  
  /**
   * Private: Load plugin CSS files
   */
  private loadPluginStyles(): void {
    const cssFiles = [
      '/plugins/themes/styles/themes.css'
    ];
    
    cssFiles.forEach((cssFile) => {
      // Check if already loaded
      if (document.querySelector(`link[href="${cssFile}"]`)) {
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      link.setAttribute('data-themes-plugin', 'true');
      document.head.appendChild(link);
    });
  }
  
  /**
   * Private: Remove plugin CSS files
   */
  private removePluginStyles(): void {
    const pluginStyles = document.querySelectorAll('link[data-themes-plugin="true"]');
    pluginStyles.forEach(style => style.remove());
  }
  
  /**
   * Private: Apply theme to document
   */
  private applyThemeToDocument(): void {
    if (!this.currentConfig.enabled) return;
    
    const documentElement = document.documentElement;
    
    // Remove all theme classes
    this.removeThemeClasses();
    
    // Add current theme class
    documentElement.classList.add(`theme-${this.currentConfig.activeTheme}`);
    
    // Add plugin active indicator
    documentElement.classList.add('themes-plugin-active');
  }
  
  /**
   * Private: Remove all theme classes
   */
  private removeThemeClasses(): void {
    const documentElement = document.documentElement;
    documentElement.classList.remove(
      'theme-light', 
      'theme-dark', 
      'theme-advanced',
      'themes-plugin-active'
    );
  }
  
  /**
   * Initialize from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const saved = localStorage.getItem('claude-router-theme-plugin');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.config) {
          this.currentConfig = { ...this.currentConfig, ...data.config };
        }
        if (data.activeTheme && this.currentConfig.availableThemes.includes(data.activeTheme)) {
          this.currentConfig.activeTheme = data.activeTheme;
        }
      }
    } catch (error) {
      console.warn('Failed to load theme config from localStorage:', error);
    }
  }

  /**
   * Enhanced UI Experience - Activează automat themes + analytics
   */
  enableEnhancedUIExperience(): void {
    console.log('🚀 Enabling Enhanced UI Experience...');
    
    // Activează themes plugin
    this.setConfig({ 
      enabled: true,
      enableEnhancedUIExperience: true 
    });
    
    // Activează analytics dacă este configurat
    if (this.currentConfig.autoEnableAnalytics) {
      this.enableAnalyticsPlugin();
    }
    
    // Activează dashboard dacă este configurat
    if (this.currentConfig.autoEnableDashboard) {
      this.enableDashboardFeatures();
    }
    
    console.log('✅ Enhanced UI Experience enabled successfully');
  }

  /**
   * Dezactivează Enhanced UI Experience
   */
  disableEnhancedUIExperience(): void {
    console.log('🔄 Disabling Enhanced UI Experience...');
    
    this.setConfig({ 
      enabled: false,
      enableEnhancedUIExperience: false 
    });
    
    console.log('✅ Enhanced UI Experience disabled');
  }

  /**
   * Activează analytics plugin prin configurație
   */
  private enableAnalyticsPlugin(): void {
    try {
      // Emit event pentru a semnala că analytics trebuie activat
      window.dispatchEvent(new CustomEvent('enable-analytics-plugin', {
        detail: { source: 'themes-plugin' }
      }));
      
      console.log('📊 Analytics plugin activation requested');
    } catch (error) {
      console.warn('Failed to enable analytics plugin:', error);
    }
  }

  /**
   * Activează dashboard features
   */
  private enableDashboardFeatures(): void {
    try {
      // Emit event pentru a semnala că dashboard trebuie activat
      window.dispatchEvent(new CustomEvent('enable-dashboard-features', {
        detail: { 
          source: 'themes-plugin',
          features: ['missionControl', 'analytics', 'realTimeMetrics']
        }
      }));
      
      console.log('📈 Dashboard features activation requested');
    } catch (error) {
      console.warn('Failed to enable dashboard features:', error);
    }
  }

  /**
   * Check dacă Enhanced UI Experience este activ
   */
  isEnhancedUIExperienceEnabled(): boolean {
    return this.currentConfig.enabled && (this.currentConfig.enableEnhancedUIExperience || false);
  }
  
  constructor() {
    this.initializeFromStorage();
  }
}

// Create and export plugin instance
export const themesPlugin = new ThemesPluginAPI();

/**
 * Auto-register helper function
 */
export function initializeThemesPlugin(config?: Partial<ThemePluginConfig>): ThemesPluginAPI {
  if (config) {
    themesPlugin.setConfig(config);
  }
  
  if (!window.__THEMES_PLUGIN__) {
    themesPlugin.register();
  }
  
  return themesPlugin;
}

/**
 * React Hook for using the themes plugin
 */
export function useThemesPlugin() {
  const plugin = window.__THEMES_PLUGIN__ || themesPlugin;
  
  return {
    setTheme: plugin.setTheme.bind(plugin),
    getCurrentTheme: plugin.getCurrentTheme.bind(plugin),
    getAvailableThemes: plugin.getAvailableThemes.bind(plugin),
    getConfig: plugin.getConfig.bind(plugin),
    setConfig: plugin.setConfig.bind(plugin),
    isEnabled: () => plugin.getConfig().enabled,
    // Enhanced UI Experience methods
    enableEnhancedUIExperience: plugin.enableEnhancedUIExperience.bind(plugin),
    disableEnhancedUIExperience: plugin.disableEnhancedUIExperience.bind(plugin),
    isEnhancedUIExperienceEnabled: plugin.isEnhancedUIExperienceEnabled.bind(plugin)
  };
}

// Default export for convenience
export default themesPlugin;