import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeType } from '../types';

interface ThemeOption {
  id: ThemeType;
  label: string;
  description: string;
  tagline: string;
  icon: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
    gradient?: string;
  };
  features: string[];
  stats: {
    performance: number;
    visual: number;
    accessibility: number;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light Theme',
    description: 'Clean and professional light theme',
    tagline: 'Crystal Clear Professional Experience',
    icon: '☀️',
    previewColors: {
      primary: '#1e293b',
      secondary: '#f8fafc',
      accent: '#3b82f6',
      background: '#ffffff',
      border: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    },
    features: ['Clean Design', 'High Contrast', 'Professional', 'Modern Effects'],
    stats: { performance: 95, visual: 90, accessibility: 98 }
  },
  {
    id: 'dark',
    label: 'Dark Theme', 
    description: 'Elegant and sophisticated dark experience',
    tagline: 'Elegant Night Mode Experience',
    icon: '🌙',
    previewColors: {
      primary: '#f1f5f9',
      secondary: '#334155',
      accent: '#60a5fa',
      background: '#0f172a',
      border: '#334155',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    },
    features: ['Eye Friendly', 'Low Light', 'Modern Effects', 'Premium'],
    stats: { performance: 95, visual: 95, accessibility: 92 }
  },
  {
    id: 'advanced',
    label: 'Advanced Theme',
    description: 'Spectacular glassmorphism space experience',
    tagline: 'Next-Gen Space Experience',
    icon: '🚀',
    previewColors: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.25)',
      accent: '#e94560',
      background: 'transparent',
      border: 'rgba(255, 255, 255, 0.2)',
      gradient: 'linear-gradient(135deg, rgba(45,45,75,0.95) 0%, rgba(55,65,95,0.9) 50%, rgba(75,85,130,0.95) 100%)'
    },
    features: ['Glassmorphism', 'Space Effects', 'Premium Animations', 'Ultra Modern'],
    stats: { performance: 88, visual: 100, accessibility: 85 }
  }
];

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, isPluginEnabled, themes, pluginConfig } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<ThemeType | null>(null);

  const handleThemeChange = (themeId: ThemeType) => {
    if (isPluginEnabled()) {
      setTheme(themeId);
    }
  };

  // Funcție pentru clase CSS moderne și consistente
  const getThemeCardClasses = (optionId: ThemeType, isSelected: boolean) => {
    let baseClasses = `
      modern-theme-card group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ease-out cursor-pointer
      transform-gpu hover:scale-[1.02] active:scale-[0.98]
      bg-gradient-to-br backdrop-blur-xl shadow-lg hover:shadow-2xl
    `;

    // Toate temele au efecte moderne și glassmorphism
    if (isSelected) {
      baseClasses += ` 
        border-primary ring-4 ring-primary/30 shadow-2xl scale-[1.01]
        bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl
      `;
    } else {
      baseClasses += ` 
        border-border/40 hover:border-primary/60 hover:shadow-xl
        bg-gradient-to-br from-card/70 to-card/40 backdrop-blur-md
        hover:from-card/80 hover:to-card/60 hover:backdrop-blur-xl
      `;
    }

    if (!isPluginEnabled()) {
      baseClasses += " opacity-50 cursor-not-allowed hover:scale-100 ";
    }

    return baseClasses;
  };

  const getStatBarColor = (stat: number) => {
    if (stat >= 95) return 'from-emerald-500 to-green-400';
    if (stat >= 90) return 'from-blue-500 to-cyan-400';
    if (stat >= 85) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  if (!isPluginEnabled()) {
    return (
      <div className="theme-selector-disabled p-6 text-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-lg border border-border/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
          <span className="text-2xl opacity-50">🎨</span>
        </div>
        <div className="text-lg font-semibold text-foreground mb-2">
          Advanced Themes Disabled
        </div>
        <div className="text-sm text-muted-foreground">
          Enable the "Advanced Themes" plugin to access modern theme experiences
        </div>
      </div>
    );
  }

  return (
    <div className="theme-selector space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border border-primary/20">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">Theme Experience</div>
            <div className="text-xs text-muted-foreground">
              {pluginConfig.availableThemes.length} Premium Themes Available
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Choose your perfect visual experience. Each theme offers the same modern effects with unique color schemes.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="space-y-6">
        {THEME_OPTIONS.filter(option => 
          pluginConfig.availableThemes.includes(option.id)
        ).map((option, index) => {
          const isSelected = currentTheme === option.id;
          const isHovered = hoveredTheme === option.id;
          
          return (
            <div
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              onMouseEnter={() => setHoveredTheme(option.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              className={getThemeCardClasses(option.id, isSelected)}
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-5 bg-gradient-to-br"
                style={{
                  background: option.previewColors.gradient || option.previewColors.background
                }}
              />
              
              {/* Animated Background Orbs */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br opacity-20 transition-all duration-700 ${
                    isHovered ? 'scale-110 opacity-30' : 'scale-100'
                  }`}
                  style={{
                    background: option.previewColors.accent
                  }}
                />
                <div 
                  className={`absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br opacity-15 transition-all duration-1000 ${
                    isHovered ? 'scale-125 opacity-25' : 'scale-100'
                  }`}
                  style={{
                    background: option.previewColors.primary
                  }}
                />
              </div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500
                      bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50
                      ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
                    `}>
                      {option.icon}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground mb-1">
                        {option.label}
                      </div>
                      <div className="text-xs text-primary font-medium mb-1">
                        {option.tagline}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-br from-primary to-accent shadow-lg scale-110' 
                      : 'bg-muted/50 backdrop-blur-sm border border-border/50'
                    }
                  `}>
                    {isSelected ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>
                </div>

                {/* Theme Preview Colors */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Object.entries(option.previewColors).slice(0, 4).map(([key, color], idx) => (
                    <div
                      key={key}
                      className={`
                        h-8 rounded-xl border-2 border-white/10 transition-all duration-500 hover:scale-105
                        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
                      `}
                      style={{ background: color }}
                      title={`${key} color`}
                    />
                  ))}
                </div>

                {/* Performance Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Theme Performance</span>
                    <span>{Math.round((option.stats.performance + option.stats.visual + option.stats.accessibility) / 3)}% Overall</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(option.stats).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-muted-foreground capitalize">{key}:</div>
                        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getStatBarColor(value)} transition-all duration-1000 rounded-full`}
                            style={{ 
                              width: isHovered ? `${value}%` : '0%',
                              transitionDelay: `${Object.keys(option.stats).indexOf(key) * 200}ms`
                            }}
                          />
                        </div>
                        <div className="text-xs text-foreground font-mono w-8">{value}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, index) => (
                    <span 
                      key={index}
                      className={`
                        text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300
                        bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground
                        backdrop-blur-sm border border-border/30
                        ${isHovered ? 'scale-105 shadow-sm bg-gradient-to-r from-muted/70 to-muted/50' : ''}
                      `}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      ✨ {feature}
                    </span>
                  ))}
                </div>

                {/* Active Theme Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg animate-pulse" />
                  </div>
                )}
              </div>

              {/* Hover Glow Effect */}
              {isHovered && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Theme Status */}
      <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-xl">{THEME_OPTIONS.find(t => t.id === currentTheme)?.icon}</span>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                Active: {THEME_OPTIONS.find(t => t.id === currentTheme)?.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {THEME_OPTIONS.find(t => t.id === currentTheme)?.tagline}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Modern Effects:</span>
                <div className="flex gap-1">
                  {themes[currentTheme].features.glassmorphism && (
                    <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs">Glass</span>
                  )}
                  {themes[currentTheme].features.animations && (
                    <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs">Anim</span>
                  )}
                  {themes[currentTheme].features.gradients && (
                    <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs">Grad</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto-save:</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  pluginConfig.persistUserChoice 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {pluginConfig.persistUserChoice ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">System Theme:</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  pluginConfig.autoApplySystemTheme 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {pluginConfig.autoApplySystemTheme ? '✓ Auto' : '✗ Manual'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Available:</span>
                <span className="text-primary font-mono text-xs">
                  {pluginConfig.availableThemes.length} / 3 themes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;