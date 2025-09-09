export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'classic' | 'advanced';

export interface Theme {
  mode: ThemeMode;
  variant: ThemeVariant;
}

export interface ThemeConfig {
  name: string;
  mode: ThemeMode;
  variant: ThemeVariant;
  description?: string;
}

export interface LayoutConfig {
  maxWidth: string;
  sidePadding: string;
  headerHeight: string;
}

export interface PluginThemeState {
  currentTheme: Theme;
  layoutConfig: LayoutConfig;
  isTransitioning: boolean;
}