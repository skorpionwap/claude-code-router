import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setThemeMode, setThemeVariant } = useTheme();
  
  const modes = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' }
  ];
  
  const variants = [
    { value: 'classic', label: 'Classic' },
    { value: 'advanced', label: 'Advanced (Glass)' }
  ];
  
  return (
    <div className="theme-selector space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Mode</label>
        <div className="flex gap-2">
          {modes.map(mode => (
            <button
              key={mode.value}
              onClick={() => setThemeMode(mode.value as any)}
              className={`px-3 py-2 rounded border ${
                theme.mode === mode.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Variant</label>
        <div className="flex gap-2">
          {variants.map(variant => (
            <button
              key={variant.value}
              onClick={() => setThemeVariant(variant.value as any)}
              className={`px-3 py-2 rounded border ${
                theme.variant === variant.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground'
              }`}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Current: {theme.mode} + {theme.variant}
      </div>
    </div>
  );
};