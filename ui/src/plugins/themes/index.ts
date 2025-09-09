// Main plugin exports
export { ItOrchestrator } from './components/it-orchestrator';
export { PluginThemeWrapper } from './components/PluginThemeWrapper';
export { ThemeSelector } from './components/ThemeSelector';
export { ThemeSelectorSimple } from './components/ThemeSelectorSimple';

// UI exports
export { ThemeSettings } from './ui/ThemeSettings';

// Context exports
export { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Type exports
export type { Theme, ThemeMode, ThemeVariant, ThemeConfig, LayoutConfig, PluginThemeState } from './types';

// CSS imports - these should be imported in the main app
// import './styles/themes.css';
// import './styles/layout-transformations.css';
// import './styles/advanced-animations.css';
// import './styles/component-integration.css';
// import './styles/advanced-complete.css';