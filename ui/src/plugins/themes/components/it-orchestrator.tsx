import React, { useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * IT Orchestrator - Primary coordination component for theme application
 * Responsible for coordinating theme application across all components
 * without modifying original application components
 */
export const ItOrchestrator: React.FC = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Global theme coordination logic
    const documentElement = document.documentElement;
    
    // Remove all existing theme classes
    documentElement.classList.remove(
      'theme-light', 'theme-dark', 
      'theme-classic', 'theme-advanced'
    );
    
    // Apply new theme classes
    documentElement.classList.add(`theme-${theme.mode}`, `theme-${theme.variant}`);
    
    // Apply centered layout transformation
    applyCenteredLayout();
    
    // Apply theme to all components including notifications
    applyGlobalThemeStyles();
    
    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme } 
    }));
    
  }, [theme]);
  
  const applyCenteredLayout = () => {
    // Inject centered layout CSS if not already present
    if (!document.getElementById('plugin-centered-layout')) {
      const style = document.createElement('style');
      style.id = 'plugin-centered-layout';
      style.textContent = `
        /* Centered Layout Plugin Styles */
        body {
          margin: 0;
          padding: 0;
        }
        
        #root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        /* Header centering - target the actual header element */
        #root > div > header,
        #root > div > .header,
        #root > div > [role="banner"],
        .app-header {
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Main content centering */
        #root > div > main,
        #root > div > .main-content,
        #root > div > div:not(.header):not(header) {
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Container wrapper for centered layout */
        .centered-layout-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  const applyGlobalThemeStyles = () => {
    // Inject global theme styles that affect all components
    if (!document.getElementById('plugin-global-theme-styles')) {
      const style = document.createElement('style');
      style.id = 'plugin-global-theme-styles';
      style.textContent = generateGlobalThemeCSS(theme);
      document.head.appendChild(style);
    } else {
      // Update existing styles
      const existingStyle = document.getElementById('plugin-global-theme-styles');
      if (existingStyle) {
        existingStyle.textContent = generateGlobalThemeCSS(theme);
      }
    }
  };
  
  const generateGlobalThemeCSS = (currentTheme: any) => {
    const isAdvanced = currentTheme.variant === 'advanced';
    const isDark = currentTheme.mode === 'dark';
    
    return `
      /* Global Theme Application - All Components */
      
      /* Root variables for different themes */
      :root.theme-light.theme-classic {
        --background: 255 255 255;
        --foreground: 15 23 42;
        --card: 255 255 255;
        --card-foreground: 15 23 42;
        --border: 226 232 240;
        --primary: 59 130 246;
        --primary-foreground: 255 255 255;
        --primary-hover: 37 99 235;
      }
      
      :root.theme-dark.theme-classic {
        --background: 15 23 42;
        --foreground: 248 250 252;
        --card: 30 41 59;
        --card-foreground: 248 250 252;
        --border: 51 65 85;
        --primary: 59 130 246;
        --primary-foreground: 255 255 255;
        --primary-hover: 37 99 235;
      }
      
      :root.theme-light.theme-advanced {
        --background: 248 250 252;
        --foreground: 15 23 42;
        --card: rgba(255, 255, 255, 0.8);
        --card-foreground: 15 23 42;
        --border: rgba(226, 232, 240, 0.3);
        --primary: 59 130 246;
        --primary-foreground: 255 255 255;
        --primary-hover: 37 99 235;
      }
      
      :root.theme-dark.theme-advanced {
        --background: 15 23 42;
        --foreground: 248 250 252;
        --card: rgba(30, 41, 59, 0.8);
        --card-foreground: 248 250 252;
        --border: rgba(51, 65, 85, 0.3);
        --primary: 59 130 246;
        --primary-foreground: 255 255 255;
        --primary-hover: 37 99 235;
      }
      
      /* Notifications and Toasts */
      .toast, .notification, [role="alert"], [role="status"], 
      .sonner-toast, .toast-container > div {
        background: rgb(var(--card)) !important;
        color: rgb(var(--card-foreground)) !important;
        border: 1px solid rgb(var(--border)) !important;
        ${isAdvanced ? 'backdrop-filter: blur(10px) !important;' : ''}
      }
      
      /* Buttons - with more specific targeting */
      button:not(.no-theme):not([class*="bg-"]):not([class*="text-"]) {
        background: rgb(var(--primary)) !important;
        color: rgb(var(--primary-foreground)) !important;
        border: 1px solid rgb(var(--border)) !important;
      }
      
      button:not(.no-theme):not([class*="bg-"]):not([class*="text-"]):hover {
        background: rgb(var(--primary-hover)) !important;
      }
      
      /* Cards and Containers */
      .card:not(.no-theme), [class*="card"]:not(.no-theme), 
      .bg-card, .glass-card {
        background: rgb(var(--card)) !important;
        color: rgb(var(--card-foreground)) !important;
        border: 1px solid rgb(var(--border)) !important;
        ${isAdvanced ? 'backdrop-filter: blur(10px) !important;' : ''}
      }
      
      /* Dialogs and Modals */
      .dialog-content, .modal, [role="dialog"] {
        background: rgb(var(--card)) !important;
        color: rgb(var(--card-foreground)) !important;
        border: 1px solid rgb(var(--border)) !important;
        ${isAdvanced ? 'backdrop-filter: blur(10px) !important;' : ''}
      }
      
      /* Advanced theme specific effects */
      ${isAdvanced ? `
        .glass-card, .card:not(.no-theme), [class*="glass"] {
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          ${isDark 
            ? 'background: rgba(30, 41, 59, 0.8) !important; border: 1px solid rgba(51, 65, 85, 0.3) !important;'
            : 'background: rgba(255, 255, 255, 0.8) !important; border: 1px solid rgba(226, 232, 240, 0.3) !important;'
          }
        }
        
        /* Glass effect for notifications in advanced mode */
        .toast, .notification, [role="alert"], [role="status"] {
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
        }
      ` : ''}
      
      /* Ensure body and root have proper background */
      body {
        background: rgb(var(--background)) !important;
        color: rgb(var(--foreground)) !important;
      }
      
      #root {
        background: rgb(var(--background)) !important;
        min-height: 100vh;
      }
    `;
  };
  
  // This component doesn't render anything visible
  return null;
};