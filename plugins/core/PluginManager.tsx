// Plugin Manager - STANDALONE în plugins/ folder
// Zero dependențe externe, auto-contained
import React, { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
  component?: React.ComponentType<any>;
}

interface PluginManagerProps {
  className?: string;
}

// TOATE funcționalitățile concentrate aici - zero dependențe externe
export const PluginManager: React.FC<PluginManagerProps> = ({ className = "" }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-discovery plugins din folderul plugins/
  useEffect(() => {
    const discoverPlugins = async () => {
      const discoveredPlugins: Plugin[] = [];

      // Analytics Plugin
      try {
        const { AnalyticsSettings } = await import('../analytics/ui/AnalyticsSettings');
        discoveredPlugins.push({
          id: 'analytics',
          name: 'Analytics & Mission Control',
          description: 'Real-time analytics and Mission Control dashboard',
          enabled: localStorage.getItem('analytics-enabled') === 'true',
          version: '1.0.0',
          component: AnalyticsSettings
        });
      } catch (error) {
        console.warn('Analytics plugin not available:', error);
      }

      // Themes Plugin  
      try {
        const { ThemeSettings } = await import('../themes/ui/ThemeSettings');
        discoveredPlugins.push({
          id: 'themes',
          name: 'Advanced Themes',
          description: 'Glassmorphism effects and premium theming',
          enabled: localStorage.getItem('themes-enabled') === 'true',
          version: '1.0.0',
          component: ThemeSettings
        });
      } catch (error) {
        console.warn('Themes plugin not available:', error);
      }

      setPlugins(discoveredPlugins);
      setLoading(false);
    };

    discoverPlugins();
  }, []);

  const togglePlugin = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    const newEnabled = !plugin.enabled;
    
    // Update localStorage
    localStorage.setItem(`${pluginId}-enabled`, newEnabled.toString());
    
    // Update server config
    try {
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      
      if (!config.plugins) config.plugins = {};
      if (!config.plugins[pluginId]) config.plugins[pluginId] = {};
      config.plugins[pluginId].enabled = newEnabled;
      
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      // Dispatch event pentru cross-tab sync
      window.dispatchEvent(new CustomEvent(`plugin-${pluginId}-toggled`, {
        detail: { enabled: newEnabled }
      }));

      // Update local state
      setPlugins(prev => prev.map(p => 
        p.id === pluginId ? { ...p, enabled: newEnabled } : p
      ));

    } catch (error) {
      console.error('Failed to update plugin config:', error);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Discovering plugins...</span>
        </div>
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <div className="text-4xl mb-2">🔌</div>
        <p>No plugins available</p>
        <p className="text-xs">Place plugins in the plugins/ directory</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">🔌 Plugin Management</h3>
        <span className="text-xs text-muted-foreground">{plugins.length} plugins</span>
      </div>
      
      {plugins.map((plugin) => (
        <div key={plugin.id} className="space-y-3">
          {/* Plugin Card */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium">{plugin.name}</h4>
                <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                <div className={`w-2 h-2 rounded-full ${
                  plugin.enabled ? 'bg-green-500' : 'bg-gray-400'
                }`} title={plugin.enabled ? 'Enabled' : 'Disabled'} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{plugin.description}</p>
            </div>
            <button
              onClick={() => togglePlugin(plugin.id)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                plugin.enabled 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {plugin.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          {/* Plugin Settings - doar dacă e enabled */}
          {plugin.enabled && plugin.component && (
            <div className="ml-4 pl-4 border-l border-border">
              <plugin.component />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PluginManager;