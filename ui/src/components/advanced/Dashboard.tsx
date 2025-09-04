import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_CONFIG, DASHBOARD_FEATURES } from '@/config/dashboard';
import { MissionControlTab } from '@/components/dashboard/tabs/MissionControlTab';
import { Providers } from '@/components/Providers';
import { Router } from '@/components/Router';
import { Transformers } from '@/components/Transformers';
import { SettingsDialog } from '@/components/SettingsDialog';
import { JsonEditor } from '@/components/JsonEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/components/ConfigProvider';
import api from '@/lib/api';
import { Settings, Languages, Save, RefreshCw, FileJson, CircleArrowUp, Download, Loader2, RotateCcw, BarChart3 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import '@/styles/dashboard.css';
import '@/styles/widget-enhancements.css';

interface DashboardProps {
  className?: string;
  onOpenSettings?: () => void;
  onSaveConfig?: () => void;
  onSaveAndRestart?: () => void;
}

export function Dashboard({ 
  className = '', 
  onOpenSettings, 
  onSaveConfig, 
  onSaveAndRestart 
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  
  // All state from App.tsx
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState<{ version: string; changelog: string } | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [hasCheckedUpdate, setHasCheckedUpdate] = useState(false);
  const hasAutoCheckedUpdate = useRef(false);

  // All functions from App.tsx
  const saveConfig = async () => {
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }
    
    try {
      const response = await api.updateConfig(config);
      console.log('Config saved successfully');
      
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; message?: string };
        if (apiResponse.success) {
          setToast({ message: apiResponse.message || t('app.config_saved'), type: 'success' });
        }
      } else {
        setToast({ message: t('app.config_saved'), type: 'success' });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setToast({ message: t('app.config_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  const saveConfigAndRestart = async () => {
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }

    try {
      let saveSuccessful = false;
      
      try {
        const response = await api.updateConfig(config);
        console.log('Config saved successfully');
        saveSuccessful = true;
        
        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as { success: boolean; message?: string };
          if (!apiResponse.success) {
            setToast({ message: apiResponse.message || t('app.config_failed'), type: 'error' });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to save config:', error);
        setToast({ message: t('app.config_failed') + ': ' + (error as Error).message, type: 'error' });
        return;
      }
      
      if (saveSuccessful) {
        const response = await api.restartService();
        console.log('Config saved and service restarted successfully');
        
        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as { success: boolean; message?: string };
          if (apiResponse.success) {
            setToast({ message: apiResponse.message || t('app.config_saved_restart_success'), type: 'success' });
          }
        } else {
          setToast({ message: t('app.config_saved_restart_success'), type: 'success' });
        }
      }
    } catch (error) {
      console.error('Failed to save config and restart:', error);
      setToast({ message: t('app.config_saved_restart_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  const checkForUpdates = useCallback(async (showDialog: boolean = true) => {
    if (hasCheckedUpdate && isNewVersionAvailable) {
      if (showDialog) {
        setIsUpdateDialogOpen(true);
      }
      return;
    }
    
    setIsCheckingUpdate(true);
    try {
      const updateInfo = await api.checkForUpdates();
      
      if (updateInfo.hasUpdate && updateInfo.latestVersion && updateInfo.changelog) {
        setIsNewVersionAvailable(true);
        setNewVersionInfo({
          version: updateInfo.latestVersion,
          changelog: updateInfo.changelog
        });
        if (showDialog) {
          setIsUpdateDialogOpen(true);
        }
      } else {
        setIsNewVersionAvailable(false);
        setNewVersionInfo(null);
        if (showDialog) {
          setToast({ message: t('app.no_updates_available'), type: 'success' });
        }
      }
      setHasCheckedUpdate(true);
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (showDialog) {
        setToast({ message: t('app.update_check_failed') + ': ' + (error as Error).message, type: 'error' });
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [hasCheckedUpdate, isNewVersionAvailable, t]);

  const performUpdate = async () => {
    if (!newVersionInfo) return;
    
    try {
      const result = await api.performUpdate();
      
      if (result.success) {
        setToast({ message: t('app.update_successful'), type: 'success' });
        setIsNewVersionAvailable(false);
        setIsUpdateDialogOpen(false);
        setHasCheckedUpdate(false);
      } else {
        setToast({ message: t('app.update_failed') + ': ' + result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Failed to perform update:', error);
      setToast({ message: t('app.update_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  // Auto-check updates on mount
  useEffect(() => {
    if (!hasCheckedUpdate && !hasAutoCheckedUpdate.current) {
      hasAutoCheckedUpdate.current = true;
      checkForUpdates(false);
    }
  }, [hasCheckedUpdate, checkForUpdates]);

  // Disable dashboard if feature flag is off
  if (!DASHBOARD_CONFIG.enabled) {
    return null;
  }

  const renderTabContent = () => {
    if (activeTab === 'analytics') {
      return (
        <div className="h-full">
          <div className="flex items-center space-x-3 mb-6 px-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
          </div>
          <MissionControlTab />
        </div>
      );
    }
    
    // Dashboard tab = All author's components in glassmorphism style
    return (
      <div className="flex h-full gap-6">
        {/* Providers Section - 3/5 width (exact same as author) */}
        <div className="w-3/5">
          <div className="glass-card h-full">
            <Providers />
          </div>
        </div>
        
        {/* Router + Transformers Section - 2/5 width (exact same as author) */}
        <div className="flex w-2/5 flex-col gap-6">
          {/* Router Section - 3/5 height */}
          <div className="h-3/5">
            <div className="glass-card h-full">
              <Router />
            </div>
          </div>
          
          {/* Transformers Section - flex-1 (remaining height) */}
          <div className="flex-1 overflow-hidden">
            <div className="glass-card h-full">
              <Transformers />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`dashboard-context dashboard-bg min-h-screen text-white ${className}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Control Bar */}
        <motion.div 
          className="flex items-center justify-between mb-6 glass-card p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Claude Code Router
            </h2>
            <span className="text-sm text-gray-400">Advanced Control Panel</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  i18n.language.startsWith('en') 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-black/20 text-gray-400 hover:text-white hover:bg-black/40'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => i18n.changeLanguage('zh')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  i18n.language.startsWith('zh') 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-black/20 text-gray-400 hover:text-white hover:bg-black/40'
                }`}
              >
                中文
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-3">
              {/* Check Updates Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="relative bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                    disabled={isCheckingUpdate}
                  >
                    {isCheckingUpdate ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isCheckingUpdate ? t('app.checking_updates') : t('app.check_updates')}
                    {isNewVersionAvailable && (
                      <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500 text-white">
                        <span className="sr-only">New updates available</span>
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900/95 border-purple-500/30 backdrop-blur-md">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">{t('app.update_check')}</h4>
                    <p className="text-sm text-slate-400">
                      {hasCheckedUpdate 
                        ? (isNewVersionAvailable 
                            ? t('app.update_available') 
                            : t('app.no_updates_available'))
                        : t('app.update_check_description')
                      }
                    </p>
                    <Button 
                      onClick={() => checkForUpdates(true)} 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isCheckingUpdate}
                    >
                      {isCheckingUpdate ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('app.checking_updates')}
                        </>
                      ) : (
                        t('app.check_now')
                      )}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Settings Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('app.settings')}
              </Button>

              {/* JSON Editor Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsJsonEditorOpen(true)}
                className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
              >
                <FileJson className="h-4 w-4 mr-2" />
                {t('app.json_editor')}
              </Button>

              {/* Save Config Button */}
              <Button 
                onClick={saveConfig}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('app.save_config')}
              </Button>
              
              {/* Save and Restart Button */}
              <Button 
                onClick={saveConfigAndRestart}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('app.save_and_restart')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            🚀 Unified AI Proxy Control Center
          </h1>
          <p className="text-lg text-gray-300">
            🎯 All-in-One Dashboard: Model Management, Real-time Tracking & Advanced Controls
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="nav-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt mr-2"></i>
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          className="fade-in"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Settings Dialog */}
        <SettingsDialog 
          isOpen={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
        />

        {/* JSON Editor Dialog */}
        <JsonEditor 
          open={isJsonEditorOpen} 
          onOpenChange={setIsJsonEditorOpen} 
          showToast={(message, type) => setToast({ message, type })} 
        />

        {/* Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-slate-900/95 border-purple-500/30 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-white">{t('app.update_available')}</DialogTitle>
            </DialogHeader>
            {newVersionInfo && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">
                    {t('app.new_version')}: {newVersionInfo.version}
                  </h4>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-purple-300 mb-2">{t('app.changelog')}:</h5>
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto max-h-40">
                      {newVersionInfo.changelog}
                    </pre>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={performUpdate}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {t('app.update_now')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUpdateDialogOpen(false)}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    {t('app.update_later')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
