import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Transformers } from "@/components/Transformers";
import { Providers } from "@/components/Providers";
import { Router } from "@/components/Router";
import { JsonEditor } from "@/components/JsonEditor";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { MissionControlTab } from "@/components/dashboard/tabs/MissionControlTab";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/components/ConfigProvider";
import api from "@/lib/api";
import { Settings, Languages, Save, RefreshCw, FileJson, CircleArrowUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";


function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { config, error } = useConfig();
  const { theme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  // 版本检查状态
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState<{ version: string; changelog: string } | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [hasCheckedUpdate, setHasCheckedUpdate] = useState(false);
  const hasAutoCheckedUpdate = useRef(false);

  const saveConfig = async () => {
    // Handle case where config might be null or undefined
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }
    
    try {
      // Save to API
      const response = await api.updateConfig(config);
      // Show success message or handle as needed
      console.log('Config saved successfully');
      
      // 根据响应信息进行提示
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; message?: string };
        if (apiResponse.success) {
          setToast({ message: apiResponse.message || t('app.config_saved_success'), type: 'success' });
        } else {
          setToast({ message: apiResponse.message || t('app.config_saved_failed'), type: 'error' });
        }
      } else {
        // 默认成功提示
        setToast({ message: t('app.config_saved_success'), type: 'success' });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      // Handle error appropriately
      setToast({ message: t('app.config_saved_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  const saveConfigAndRestart = async () => {
    // Handle case where config might be null or undefined
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }
    
    try {
      // Save to API
      const response = await api.updateConfig(config);
      
      // Check if save was successful before restarting
      let saveSuccessful = true;
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; message?: string };
        if (!apiResponse.success) {
          saveSuccessful = false;
          setToast({ message: apiResponse.message || t('app.config_saved_failed'), type: 'error' });
        }
      }
      
      // Only restart if save was successful
      if (saveSuccessful) {
        // Restart service
        const response = await api.restartService();
        
        // Show success message or handle as needed
        console.log('Config saved and service restarted successfully');
        
        // 根据响应信息进行提示
        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as { success: boolean; message?: string };
          if (apiResponse.success) {
            setToast({ message: apiResponse.message || t('app.config_saved_restart_success'), type: 'success' });
          }
        } else {
          // 默认成功提示
          setToast({ message: t('app.config_saved_restart_success'), type: 'success' });
        }
      }
    } catch (error) {
      console.error('Failed to save config and restart:', error);
      // Handle error appropriately
      setToast({ message: t('app.config_saved_restart_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };
  
  // 检查更新函数
  const checkForUpdates = useCallback(async (showDialog: boolean = true) => {
    // 如果已经检查过且有新版本，根据参数决定是否显示对话框
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
        // 只有在showDialog为true时才显示对话框
        if (showDialog) {
          setIsUpdateDialogOpen(true);
        }
      } else if (showDialog) {
        // 只有在showDialog为true时才显示没有更新的提示
        setToast({ message: t('app.no_updates_available'), type: 'success' });
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

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a config, we're authenticated
      if (config) {
        setIsCheckingAuth(false);
        // 自动检查更新，但不显示对话框
        if (!hasCheckedUpdate && !hasAutoCheckedUpdate.current) {
          hasAutoCheckedUpdate.current = true;
          checkForUpdates(false);
        }
        return;
      }
      
      // For empty API key, allow access without checking config
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        setIsCheckingAuth(false);
        return;
      }
      
      // If we don't have a config, try to fetch it
      try {
        await api.getConfig();
        // If successful, we don't need to do anything special
        // The ConfigProvider will handle setting the config
      } catch (err) {
        // If it's a 401, the API client will redirect to login
        // For other errors, we still show the app to display the error
        console.error('Error checking auth:', err);
        // Redirect to login on authentication error
        if ((err as Error).message === 'Unauthorized') {
          navigate('/login');
        }
      } finally {
        setIsCheckingAuth(false);
        // 在获取配置完成后检查更新，但不显示对话框
        if (!hasCheckedUpdate && !hasAutoCheckedUpdate.current) {
          hasAutoCheckedUpdate.current = true;
          checkForUpdates(false);
        }
      }
    };

    checkAuth();
    
    // Listen for unauthorized events
    const handleUnauthorized = () => {
      navigate('/login');
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [config, navigate, hasCheckedUpdate, checkForUpdates]);
  
  // 执行更新函数
  const performUpdate = async () => {
    if (!newVersionInfo) return;
    
    try {
      const result = await api.performUpdate();
      
      if (result.success) {
        setToast({ message: t('app.update_successful'), type: 'success' });
        setIsNewVersionAvailable(false);
        setIsUpdateDialogOpen(false);
        setHasCheckedUpdate(false); // 重置检查状态，以便下次重新检查
      } else {
        setToast({ message: t('app.update_failed') + ': ' + result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Failed to perform update:', error);
      setToast({ message: t('app.update_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  
  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-muted-foreground">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  // Handle case where config is null or undefined
  if (!config) {
    return (
      <div className="h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-muted-foreground">Loading configuration...</div>
      </div>
    );
  }

  // Get theme-specific classes and layout
  const getLayoutClasses = () => {
    if (theme.variant === 'advanced') {
      return 'dashboard-context dashboard-bg min-h-screen text-white';
    }
    return 'h-screen bg-background font-sans';
  };

  const isAdvancedTheme = theme.variant === 'advanced';

  // Render Advanced Theme Layout
  const renderAdvancedLayout = () => {
    return (
      <div className={getLayoutClasses()}>
        <div className="max-w-7xl mx-auto p-6">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between mb-6 glass-card p-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Claude Code Router
              </h2>
              <span className="text-sm text-gray-400">Configuration Panel</span>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => checkForUpdates(true)}
                  disabled={isCheckingUpdate}
                  className="relative bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                >
                  <CircleArrowUp className="h-4 w-4 mr-2" />
                  Updates
                  {isNewVersionAvailable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('app.settings')}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsJsonEditorOpen(true)}
                  className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>

                <Button 
                  onClick={saveConfig}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('app.save')}
                </Button>
                
                <Button 
                  onClick={saveConfigAndRestart}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('app.save_and_restart')}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div key={activeTab} className="fade-in">
            {activeTab === 'analytics' ? (
              <div className="h-full">
                <div className="flex items-center space-x-3 mb-6 px-6">
                  <span className="h-6 w-6 text-blue-400">📊</span>
                  <h2 className="text-2xl font-bold text-white">Analytics</h2>
                </div>
                <MissionControlTab />
              </div>
            ) : (
              <div className="flex h-full gap-6">
                {/* Providers Section - 3/5 width */}
                <div className="w-3/5">
                  <div className="glass-card h-full">
                    <Providers />
                  </div>
                </div>
                
                {/* Router + Transformers Section - 2/5 width */}
                <div className="flex w-2/5 flex-col gap-6">
                  <div className="h-3/5">
                    <div className="glass-card h-full">
                      <Router />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="glass-card h-full">
                      <Transformers />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Classic Theme Layout
  const renderClassicLayout = () => {
    return (
      <div className={getLayoutClasses()}>
        {/* Centered container for all classic themes */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Header with Control Bar */}
          <div className="modern-card mb-6">
            <div className="modern-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
                  <span className="text-sm text-muted-foreground">Configuration Panel</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={i18n.language.startsWith('en') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => i18n.changeLanguage('en')}
                      className="text-xs"
                    >
                      EN
                    </Button>
                    <Button
                      variant={i18n.language.startsWith('zh') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => i18n.changeLanguage('zh')}
                      className="text-xs"
                    >
                      中文
                    </Button>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => checkForUpdates(true)}
                      disabled={isCheckingUpdate}
                      className="relative"
                    >
                      <CircleArrowUp className="h-4 w-4 mr-2" />
                      Updates
                      {isNewVersionAvailable && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('app.settings')}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsJsonEditorOpen(true)}
                    >
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Button>

                    <Button 
                      onClick={saveConfig}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t('app.save')}
                    </Button>
                    
                    <Button 
                      onClick={saveConfigAndRestart}
                      variant="secondary"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('app.save_and_restart')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Tab Navigation */}
          <div className="modern-tab-container">
            <button
              className={`modern-tab ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`modern-tab ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content with Animation */}
          <div key={currentView} className="modern-tab-content fade-in">
            {currentView === 'analytics' ? (
              <div className="h-full p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
                </div>
                <MissionControlTab />
              </div>
            ) : (
              <div className="flex h-full gap-6 p-6">
                {/* Providers Section - 3/5 width */}
                <div className="w-3/5">
                  <Providers />
                </div>
                
                {/* Router + Transformers Section - 2/5 width */}
                <div className="flex w-2/5 flex-col gap-6">
                  <div className="h-3/5">
                    <Router />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <Transformers />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Render theme-specific layout */}
      {isAdvancedTheme ? renderAdvancedLayout() : renderClassicLayout()}
      
      {/* Shared Dialogs */}
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <JsonEditor 
        open={isJsonEditorOpen} 
        onOpenChange={setIsJsonEditorOpen} 
        showToast={(message, type) => setToast({ message, type })} 
      />
      
      {/* Version Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className={`max-w-2xl ${isAdvancedTheme ? 'bg-slate-900/95 border-purple-500/30 backdrop-blur-md' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isAdvancedTheme ? 'text-white' : ''}>
              {t('app.new_version_available')}
              {newVersionInfo && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  v{newVersionInfo.version}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('app.update_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-4">
            {newVersionInfo?.changelog ? (
              <div className="whitespace-pre-wrap text-sm">
                {newVersionInfo.changelog}
              </div>
            ) : (
              <div className="text-muted-foreground">
                {t('app.no_changelog_available')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              {t('app.later')}
            </Button>
            <Button onClick={performUpdate}>
              {t('app.update_now')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWithTheme;
