import React, { ReactNode } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface PluginThemeWrapperProps {
  children: ReactNode;
}

export const PluginThemeWrapper: React.FC<PluginThemeWrapperProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`plugin-theme-wrapper theme-${theme.mode} theme-${theme.variant}`}>
      {children}
    </div>
  );
};