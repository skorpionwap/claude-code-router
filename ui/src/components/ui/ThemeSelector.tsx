import React from 'react';
import { useTheme, type ThemeName } from '../../contexts/ThemeContext';

interface ThemeOption {
  id: string;
  label: string;
  name: ThemeName;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
  };
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    name: 'light',
    description: 'Clean and bright interface',
    previewColors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#3b82f6',
      background: '#ffffff',
      border: '#e2e8f0'
    }
  },
  {
    id: 'dark',
    label: 'Dark',
    name: 'dark',
    description: 'Elegant dark mode for low-light environments',
    previewColors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#60a5fa',
      background: '#0f172a',
      border: '#475569'
    }
  },
  {
    id: 'advanced',
    label: 'Advanced',
    name: 'advanced',
    description: 'Vibrant glassmorphism with gradients',
    previewColors: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      border: 'rgba(255, 255, 255, 0.3)'
    }
  }
];

const ThemeSelector: React.FC = () => {
  const { theme, setThemeName } = useTheme();

  const handleThemeChange = (themeName: ThemeName) => {
    setThemeName(themeName);
  };

  return (
    <div className="theme-selector space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Theme
        </label>
        <div className="grid grid-cols-1 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.name)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${theme.name === option.name 
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ 
                      background: option.previewColors.primary,
                      boxShadow: option.name === 'advanced' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                    }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ 
                      background: option.previewColors.secondary,
                      boxShadow: option.name === 'advanced' ? '0 4px 12px rgba(240, 147, 251, 0.4)' : 'none'
                    }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ 
                      background: option.previewColors.accent,
                      boxShadow: option.name === 'advanced' ? '0 4px 12px rgba(79, 172, 254, 0.4)' : 'none'
                    }}
                  />
                </div>
              </div>

              {/* Selected indicator */}
              {theme.name === option.name && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg 
                      className="w-3 h-3 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Special indicator for advanced theme */}
              {option.name === 'advanced' && (
                <div className="absolute bottom-2 right-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      boxShadow: '0 0 8px rgba(102, 126, 234, 0.6)'
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p>
          <span className="font-medium">Current Theme:</span> {theme.name}
        </p>
        <p className="mt-1">
          {theme.name === 'advanced' ? 
            'Glassmorphism effects and gradients are active.' : 
            'Switch to Advanced theme for enhanced visual effects.'
          }
        </p>
      </div>
    </div>
  );
};

export default ThemeSelector;