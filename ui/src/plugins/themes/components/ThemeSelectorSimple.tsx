import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export const ThemeSelectorSimple: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { mode: 'light' as const, variant: 'classic' as const, name: 'Light' },
    { mode: 'dark' as const, variant: 'classic' as const, name: 'Dark' },
    { mode: 'light' as const, variant: 'advanced' as const, name: 'Advanced Light' },
    { mode: 'dark' as const, variant: 'advanced' as const, name: 'Advanced Dark' }
  ];
  
  return (
    <div className="theme-selector-simple">
      <label className="block text-sm font-medium mb-2">Theme</label>
      <select 
        value={`${theme.mode}-${theme.variant}`}
        onChange={(e) => {
          const [mode, variant] = e.target.value.split('-');
          setTheme({ mode: mode as any, variant: variant as any });
        }}
        className="w-full p-2 border rounded"
      >
        {themes.map(t => (
          <option key={`${t.mode}-${t.variant}`} value={`${t.mode}-${t.variant}`}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};