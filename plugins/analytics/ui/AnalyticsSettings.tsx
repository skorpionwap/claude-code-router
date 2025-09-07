import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

export function AnalyticsSettings() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Load config from server first, fallback to localStorage
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          const serverEnabled = config.plugins?.analytics?.enabled === true;
          setIsEnabled(serverEnabled);
          
          // Sync localStorage with server config
          localStorage.setItem('analytics-enabled', serverEnabled.toString());
        } else {
          // Fallback to localStorage if server config fails
          const enabled = localStorage.getItem('analytics-enabled') === 'true';
          setIsEnabled(enabled);
        }
      } catch (error) {
        // Fallback to localStorage if server is unavailable
        const enabled = localStorage.getItem('analytics-enabled') === 'true';
        setIsEnabled(enabled);
      }
    };
    
    loadConfig();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    
    // Save to localStorage for immediate UI feedback
    localStorage.setItem('analytics-enabled', checked.toString());
    
    // Sync to server config - same as Themes plugin
    await syncConfigToServer(checked);
  };

  const syncConfigToServer = async (enabled: boolean) => {
    try {
      // Get current main config from server
      const response = await fetch('/api/config');
      if (response.ok) {
        const mainConfig = await response.json();
        
        // Update the analytics section
        const updatedConfig = {
          ...mainConfig,
          plugins: {
            ...mainConfig.plugins,
            analytics: {
              enabled
            }
          }
        };
        
        // Save back to server
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        });
        
        console.log(`✅ Analytics config synced to server: ${enabled}`);
      }
    } catch (error) {
      console.warn('Failed to sync analytics config to server:', error);
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${isEnabled ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold">Analytics</h3>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Real-time analytics and Mission Control dashboard
      </p>
      
      <div className="border-t pt-3">
        {isEnabled ? (
          <div className="space-y-2">
            <div className="p-2 text-center text-green-600 text-xs">
              ✅ Analytics enabled
            </div>
            
          </div>
        ) : (
          <div className="p-2 text-center text-muted-foreground text-xs">
            Enable to activate analytics tracking
          </div>
        )}
      </div>
    </div>
  );
}
