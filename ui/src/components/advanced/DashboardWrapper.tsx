import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Dashboard as CustomDashboard } from '@/components/advanced/Dashboard';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Rocket } from 'lucide-react';
import '@/styles/dashboard-theme.css';

interface DashboardWrapperProps {
  children: React.ReactNode;
  onOpenSettings?: () => void;
  onSaveConfig?: () => void;
  onSaveAndRestart?: () => void;
}

export function DashboardWrapper({ 
  children, 
  onOpenSettings, 
  onSaveConfig, 
  onSaveAndRestart 
}: DashboardWrapperProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);

  // Debug logging
  console.log('DashboardWrapper - Current theme:', theme);
  console.log('DashboardWrapper - showCustomDashboard:', showCustomDashboard);

  // Auto-activate dashboard when Advanced theme is selected
  useEffect(() => {
    console.log('DashboardWrapper - Theme effect triggered:', theme.variant);
    if (theme.variant === 'advanced') {
      setShowCustomDashboard(true);
    } else {
      setShowCustomDashboard(false);
    }
  }, [theme.variant]);

  // If Advanced theme is active, show the custom dashboard
  if (theme.variant === 'advanced' && showCustomDashboard) {
    return (
      <div className="dashboard-context relative min-h-screen">
        {/* Exit Button - allows user to temporarily exit Advanced view without changing theme */}
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => setShowCustomDashboard(false)}
            className="dashboard-exit-button text-white shadow-lg"
            size="sm"
            title="Temporarily exit Advanced view (theme remains Advanced)"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Exit Advanced View
          </Button>
        </motion.div>
        
        <CustomDashboard 
          onOpenSettings={onOpenSettings}
          onSaveConfig={onSaveConfig}
          onSaveAndRestart={onSaveAndRestart}
        />
      </div>
    );
  }

  // For non-Advanced themes or when user temporarily exited Advanced view, show original content
  // Only show buttons if theme is Advanced
  const isAdvancedTheme = theme.variant === 'advanced';
  const shouldShowReturnButton = isAdvancedTheme && !showCustomDashboard;

  return (
    <div className="relative">
      {/* Show re-enter button ONLY for Advanced theme when user exited */}
      {shouldShowReturnButton && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => setShowCustomDashboard(true)}
            className="dashboard-toggle-button text-white rounded-full px-6 py-3 text-base font-semibold"
            title="Return to Advanced Space Dashboard"
          >
            <Rocket className="h-5 w-5 mr-2" />
            Return to Advanced
          </Button>
        </motion.div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-2 text-xs z-50 rounded">
          <div>Theme Variant: {theme.variant}</div>
          <div>Theme Mode: {theme.mode}</div>
          <div>Show Dashboard: {showCustomDashboard.toString()}</div>
          <div>Is Advanced: {isAdvancedTheme.toString()}</div>
          <div>Should Show Button: {shouldShowReturnButton.toString()}</div>
        </div>
      )}

      {/* Original Content */}
      {children}
    </div>
  );
}
