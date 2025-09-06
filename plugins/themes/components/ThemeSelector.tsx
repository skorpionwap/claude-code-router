import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeType } from '../types';

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

  const handleThemeChange = (themeId: ThemeType) => {
    // Setăm tema doar dacă pluginul este activat
    if (isPluginEnabled()) {
      setTheme(themeId);
    }
  };

  // Funcție pentru a determina clasele CSS în funcție de tema curentă
  const getThemeButtonClasses = (optionId: ThemeType) => {
    const isSelected = currentTheme === optionId;
    
    // Clase de bază pentru toate temele
    let classes = "relative p-4 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 transform-gpu ";
    
    // Clase specifice pentru fiecare temă
    if (currentTheme === 'advanced') {
      // Stiluri pentru tema avansată (glassmorphism)
      classes += isSelected 
        ? "border-highlight-color ring-2 ring-highlight-color/30 bg-glass-bg backdrop-blur-lg" 
        : "border-glass-border bg-glass-bg/80 backdrop-blur-md hover:bg-glass-bg hover:border-highlight-color/50";
    } else {
      // Stiluri pentru temele light și dark
      classes += isSelected 
        ? "border-primary ring-2 ring-primary/30" 
        : "border-border hover:border-primary/50";
    }
    
    // Dacă pluginul nu este activat, dezactivăm butoanele
    if (!isPluginEnabled()) {
      classes += " opacity-50 cursor-not-allowed ";
    }
    
    return classes;
  };

  // Dacă pluginul nu este activat, afișăm un mesaj
  if (!isPluginEnabled()) {
    return (
      <div className="theme-selector-disabled p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">
          Advanced themes are disabled
        </div>
        <div className="text-xs text-muted-foreground">
          Enable "Advanced Themes" plugin to use these themes
        </div>
      </div>
    );
  }

  return (
    <div className="theme-selector space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Select Theme
          </label>
          <div className="text-xs text-muted-foreground">
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
              className={getThemeButtonClasses(option.id)}
              disabled={!isPluginEnabled()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base font-semibold text-foreground">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
                
                {/* Selected indicator */}
                {currentTheme === option.id && (
                  <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                    <svg 
                      className="w-3 h-3 text-primary-foreground" 
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
                    className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
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
      <div className="bg-muted rounded-lg p-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Active Theme:</span>
            <span className="capitalize font-semibold text-foreground">{currentTheme}</span>
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
            <div className="text-xs text-muted-foreground mt-2">
              ✓ Theme preference saved automatically
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;