import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeType } from '../types';

interface ThemeOption {
  id: ThemeType;
  label: string;
  description: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
  };
  features: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light Theme',
    description: 'Clean and professional light theme',
    previewColors: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      accent: '#4f7cff',
      background: '#fafbfc',
      border: '#e1e5e9'
    },
    features: ['Clean Design', 'High Contrast', 'Professional']
  },
  {
    id: 'dark',
    label: 'Dark Theme', 
    description: 'Elegant and eye-friendly dark theme',
    previewColors: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#63b3ed',
      background: '#1a202c',
      border: '#4a5568'
    },
    features: ['Eye Friendly', 'Low Light', 'Modern']
  },
  {
    id: 'advanced',
    label: 'Advanced Theme',
    description: 'Modern glassmorphism with gradients',
    previewColors: {
      primary: 'rgba(255, 255, 255, 0.15)',
      secondary: 'rgba(255, 255, 255, 0.25)',
      accent: 'linear-gradient(45deg, #e94560, #ff6b9d)',
      background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,40,70,0.95))',
      border: 'rgba(255, 255, 255, 0.2)'
    },
    features: ['Glassmorphism', 'Animations', 'Gradients', 'Modern']
  }
];

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, isPluginEnabled, themes, pluginConfig } = useTheme();

  if (!isPluginEnabled()) {
    return (
      <div className="theme-selector-disabled p-4 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Theme plugin is disabled
        </div>
      </div>
    );
  }

  const handleThemeChange = (themeId: ThemeType) => {
    setTheme(themeId);
  };

  return (
    <div className="theme-selector space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Theme
          </label>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {pluginConfig.availableThemes.length} themes available
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {THEME_OPTIONS.filter(option => 
            pluginConfig.availableThemes.includes(option.id)
          ).map((option) => (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                transform-gpu
                ${currentTheme === option.id 
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </div>
                
                {/* Selected indicator */}
                {currentTheme === option.id && (
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
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
                )}
              </div>

              {/* Theme Preview */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-4 gap-2 h-3">
                  <div 
                    className="rounded-full transition-all duration-200"
                    style={{ background: option.previewColors.primary }}
                    title="Primary color"
                  />
                  <div 
                    className="rounded-full transition-all duration-200"
                    style={{ background: option.previewColors.secondary }}
                    title="Secondary color"
                  />
                  <div 
                    className="rounded-full transition-all duration-200"
                    style={{ 
                      background: option.id === 'advanced' 
                        ? 'linear-gradient(45deg, #e94560, #ff6b9d)' 
                        : option.previewColors.accent 
                    }}
                    title="Accent color"
                  />
                  <div 
                    className="rounded-full border transition-all duration-200"
                    style={{ 
                      background: option.previewColors.background,
                      borderColor: option.previewColors.border
                    }}
                    title="Background"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {option.features.map((feature, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Special effects indicator for advanced theme */}
              {option.id === 'advanced' && (
                <div className="absolute top-2 right-8">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{ 
                      background: 'linear-gradient(45deg, #e94560, #ff6b9d)',
                      boxShadow: '0 0 8px rgba(233, 69, 96, 0.5)'
                    }}
                    title="Glassmorphism effects"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Active Theme:</span>
            <span className="capitalize font-semibold">{currentTheme}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Features:</span>
            <div className="flex gap-1">
              {themes[currentTheme].features.glassmorphism && (
                <span className="text-blue-500">Glass</span>
              )}
              {themes[currentTheme].features.animations && (
                <span className="text-green-500">Anim</span>
              )}
              {themes[currentTheme].features.gradients && (
                <span className="text-purple-500">Grad</span>
              )}
            </div>
          </div>
          {pluginConfig.persistUserChoice && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ✓ Theme preference saved automatically
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;