import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { ThemeSelectorSimple } from '../components/ThemeSelectorSimple';

interface ThemeSettingsProps {
  simplified?: boolean;
  showPreview?: boolean;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ 
  simplified = false, 
  showPreview = true 
}) => {
  const { theme } = useTheme();
  
  return (
    <div className="theme-settings space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred theme mode and variant. Changes are applied instantly.
        </p>
      </div>
      
      {simplified ? (
        <ThemeSelectorSimple />
      ) : (
        <ThemeSelector />
      )}
      
      {showPreview && (
        <div className="theme-preview space-y-4">
          <h4 className="text-md font-medium">Preview</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Preview */}
            <div className="card p-4 space-y-3">
              <h5 className="font-medium">Sample Card</h5>
              <p className="text-sm text-muted-foreground">
                This is how cards will look with the current theme.
              </p>
              <button className="px-3 py-1 text-sm rounded">
                Sample Button
              </button>
            </div>
            
            {/* Notification Preview */}
            <div className="notification p-4 rounded border">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Sample Notification</span>
              </div>
              <p className="text-sm mt-1">
                This is how notifications will appear.
              </p>
            </div>
          </div>
          
          {/* Current Theme Info */}
          <div className="mt-6 p-4 bg-muted rounded">
            <div className="text-sm">
              <div className="font-medium mb-2">Current Theme Configuration:</div>
              <div className="space-y-1">
                <div>Mode: <code className="bg-background px-1 rounded">{theme.mode}</code></div>
                <div>Variant: <code className="bg-background px-1 rounded">{theme.variant}</code></div>
                <div>Classes: <code className="bg-background px-1 rounded">theme-{theme.mode} theme-{theme.variant}</code></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};