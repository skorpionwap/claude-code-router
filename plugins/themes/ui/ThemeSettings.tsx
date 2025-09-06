import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';

export function ThemeSettings() {
  const { isPluginEnabled, togglePlugin } = useTheme();

  return (
    <div className={`rounded-lg border p-4 ${isPluginEnabled() ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎨</span>
          <h3 className="font-semibold">Advanced Themes</h3>
        </div>
        <Switch
          checked={isPluginEnabled()}
          onCheckedChange={(checked) => {
            // Update through theme context - it will handle server sync automatically
            togglePlugin(checked);
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Glassmorphism effects and premium theming
      </p>
      
      {/* Theme Selector */}
      <div className="border-t pt-3">
        {isPluginEnabled() ? (
          <ThemeSelector />
        ) : (
          <div className="p-2 text-center text-muted-foreground text-xs">
            Enable plugin to access theme options
          </div>
        )}
      </div>
    </div>
  );
}
